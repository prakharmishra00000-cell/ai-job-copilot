import { db } from "@/db";
import { jobs, jobScores, candidateProfiles, users, activityLogs, jobSources as jobSourcesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getAllAdapters } from "@/lib/job-sources";
import { isDuplicate } from "@/lib/deduplication";
import { calculateFitScore } from "@/lib/ai/scoring";
import { JobSearchParams } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: JobSearchParams = await req.json();
    
    // Get candidate profile
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      return NextResponse.json({ error: "No user found. Please complete onboarding first." }, { status: 400 });
    }
    
    const profiles = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userRows[0].id))
      .limit(1);
    
    const profile = profiles[0];
    
    // Get existing jobs for dedup
    const existingJobs = await db.select({
      title: jobs.title,
      company: jobs.company,
      location: jobs.location,
      url: jobs.url,
      description: jobs.description,
    }).from(jobs);
    
    // Search all adapters
    const adapters = getAllAdapters();
    const allResults = [];
    const errors: string[] = [];
    
    for (const adapter of adapters) {
      try {
        const available = await adapter.isAvailable();
        if (!available) continue;
        
        const results = await adapter.searchJobs(body);
        allResults.push(...results.map((r) => ({ ...r, sourceName: adapter.sourceName })));
        
        // Log activity
        await db.insert(activityLogs).values({
          userId: userRows[0].id,
          candidateId: profile?.id,
          action: "job_search",
          details: `Searched ${adapter.displayName}: found ${results.length} jobs`,
          platform: adapter.sourceName,
          result: "success",
        });

        // Upsert source record
        const existingSrc = await db.select().from(jobSourcesTable).where(eq(jobSourcesTable.name, adapter.sourceName)).limit(1);
        if (existingSrc.length === 0) {
          await db.insert(jobSourcesTable).values({
            name: adapter.sourceName,
            displayName: adapter.displayName,
            status: "connected",
            supportsAutoApply: adapter.supportsAutoApply,
            supportsMessaging: adapter.supportsMessaging,
            lastSyncAt: new Date(),
            jobCount: results.length,
          });
        } else {
          await db.update(jobSourcesTable)
            .set({ lastSyncAt: new Date(), jobCount: results.length, status: "connected" })
            .where(eq(jobSourcesTable.id, existingSrc[0].id));
        }
      } catch (err) {
        errors.push(`${adapter.sourceName}: ${String(err)}`);
      }
    }
    
    // Deduplicate
    const uniqueResults = [];
    const dedupList = [...existingJobs];
    
    for (const result of allResults) {
      if (!isDuplicate(
        { title: result.title, company: result.company, location: result.location, url: result.url, description: result.description },
        dedupList
      )) {
        uniqueResults.push(result);
        dedupList.push({
          title: result.title,
          company: result.company,
          location: result.location || null,
          url: result.url,
          description: result.description || null,
        });
      }
    }
    
    // Store jobs and calculate scores
    const storedJobs = [];
    
    for (const result of uniqueResults) {
      // Find source
      const sourceRows = await db.select().from(jobSourcesTable).where(eq(jobSourcesTable.name, result.sourceName)).limit(1);
      
      const [storedJob] = await db.insert(jobs).values({
        sourceId: sourceRows[0]?.id || null,
        sourceName: result.sourceName,
        externalJobId: result.externalJobId,
        title: result.title,
        company: result.company,
        companyLogo: result.companyLogo,
        location: result.location,
        workMode: result.workMode,
        salary: result.salary,
        salaryMin: result.salaryMin,
        salaryMax: result.salaryMax,
        salaryCurrency: result.salaryCurrency,
        experienceLevel: result.experienceLevel,
        employmentType: result.employmentType,
        description: result.description,
        responsibilities: result.responsibilities,
        requirements: result.requirements,
        preferredSkills: result.preferredSkills,
        benefits: result.benefits,
        applicationProcess: result.applicationProcess,
        url: result.url,
        companyUrl: result.companyUrl,
        applicationUrl: result.applicationUrl,
        postedAt: result.postedAt,
        expiresAt: result.expiresAt,
        isVerified: true,
        safetyScore: 92,
        isActive: true,
      }).returning();
      
      // Calculate fit score if profile exists
      if (profile) {
        const score = calculateFitScore(
          {
            skills: profile.skills as import("@/lib/types").CandidateSkills | null,
            experience: profile.experience as import("@/lib/types").Experience[] | null,
            education: profile.education as import("@/lib/types").Education[] | null,
            projects: profile.projects as import("@/lib/types").Project[] | null,
            preferences: profile.preferences as import("@/lib/types").CandidatePreferences | null,
          },
          {
            title: result.title,
            company: result.company,
            location: result.location,
            workMode: result.workMode,
            salary: result.salary,
            salaryMin: result.salaryMin,
            experienceLevel: result.experienceLevel,
            requirements: result.requirements,
            preferredSkills: result.preferredSkills,
            description: result.description,
          }
        );
        
        await db.insert(jobScores).values({
          jobId: storedJob.id,
          candidateId: profile.id,
          fitScore: score.fitScore,
          shortlistProbability: score.shortlistProbability,
          confidence: score.confidence,
          skillsMatch: score.skillsMatch,
          experienceMatch: score.experienceMatch,
          educationMatch: score.educationMatch,
          projectRelevance: score.projectRelevance,
          locationMatch: score.locationMatch,
          technologyMatch: score.technologyMatch,
          roleMatch: score.roleMatch,
          salaryMatch: score.salaryMatch,
          strengths: score.strengths,
          missingRequirements: score.missingRequirements,
          explanation: score.explanation,
          category: score.category,
        });
        
        storedJobs.push({ ...storedJob, score });
      } else {
        storedJobs.push(storedJob);
      }
    }
    
    // Sort by fit score
    storedJobs.sort((a, b) => {
      const scoreA = "score" in a ? (a as Record<string, { fitScore: number }>).score.fitScore : 0;
      const scoreB = "score" in b ? (b as Record<string, { fitScore: number }>).score.fitScore : 0;
      return scoreB - scoreA;
    });
    
    return NextResponse.json({
      totalFound: allResults.length,
      uniqueJobs: uniqueResults.length,
      duplicatesRemoved: allResults.length - uniqueResults.length,
      jobs: storedJobs,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
