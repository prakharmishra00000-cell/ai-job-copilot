import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, candidateProfiles, jobs, jobScores, automationConfig, automationJobs, activityLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAllAdapters } from "@/lib/job-sources";
import { isDuplicate } from "@/lib/deduplication";
import { calculateFitScore } from "@/lib/ai/scoring";
import { CandidateSkills, CandidatePreferences, Experience, Education, Project } from "@/lib/types";

// Vercel Cron job for automated job scanning
// Runs every 2 hours as configured in vercel.json
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret in production
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users with active automation
    const activeConfigs = await db
      .select({
        config: automationConfig,
        profile: candidateProfiles,
        user: users,
      })
      .from(automationConfig)
      .innerJoin(candidateProfiles, eq(candidateProfiles.id, automationConfig.candidateId))
      .innerJoin(users, eq(users.id, candidateProfiles.userId))
      .where(eq(automationConfig.isActive, true));

    const results = [];

    for (const { config, profile, user } of activeConfigs) {
      // Create automation job record
      const [job] = await db.insert(automationJobs).values({
        candidateId: profile.id,
        taskType: "job_discovery",
        status: "running",
        scheduledAt: new Date(),
        startedAt: new Date(),
      }).returning();

      try {
        // Get preferences for search
        const prefs = profile.preferences as CandidatePreferences | null;
        const searchParams = {
          role: prefs?.targetRoles?.[0],
          location: prefs?.locations?.[0],
        };

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
        let totalFound = 0;
        let newJobs = 0;

        for (const adapter of adapters) {
          try {
            const available = await adapter.isAvailable();
            if (!available) continue;

            const jobResults = await adapter.searchJobs(searchParams);
            totalFound += jobResults.length;

            for (const result of jobResults) {
              // Check duplicate
              if (isDuplicate(
                { title: result.title, company: result.company, location: result.location, url: result.url, description: result.description },
                existingJobs
              )) {
                continue;
              }

              // Store job
              const [storedJob] = await db.insert(jobs).values({
                sourceName: result.sourceName,
                externalJobId: result.externalJobId,
                title: result.title,
                company: result.company,
                location: result.location,
                workMode: result.workMode,
                salary: result.salary,
                salaryMin: result.salaryMin,
                experienceLevel: result.experienceLevel,
                employmentType: result.employmentType,
                description: result.description,
                responsibilities: result.responsibilities,
                requirements: result.requirements,
                preferredSkills: result.preferredSkills,
                url: result.url,
                applicationUrl: result.applicationUrl,
                postedAt: result.postedAt,
                isVerified: true,
                safetyScore: 90,
                isActive: true,
              }).returning();

              // Calculate score
              const score = calculateFitScore(
                {
                  skills: profile.skills as CandidateSkills | null,
                  experience: profile.experience as Experience[] | null,
                  education: profile.education as Education[] | null,
                  projects: profile.projects as Project[] | null,
                  preferences: prefs,
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

              newJobs++;
              existingJobs.push({
                title: result.title,
                company: result.company,
                location: result.location || null,
                url: result.url,
                description: result.description || null,
              });
            }
          } catch (err) {
            console.error(`Adapter ${adapter.sourceName} error:`, err);
          }
        }

        // Update job record
        await db.update(automationJobs)
          .set({
            status: "completed",
            completedAt: new Date(),
            result: { totalFound, newJobs },
          })
          .where(eq(automationJobs.id, job.id));

        // Log activity
        await db.insert(activityLogs).values({
          userId: user.id,
          candidateId: profile.id,
          action: "cron_job_scan",
          details: `Cron scan completed: ${totalFound} found, ${newJobs} new`,
          result: "success",
        });

        results.push({ userId: user.id, totalFound, newJobs, status: "success" });

      } catch (err) {
        await db.update(automationJobs)
          .set({
            status: "failed",
            completedAt: new Date(),
            error: String(err),
          })
          .where(eq(automationJobs.id, job.id));

        results.push({ userId: user.id, status: "failed", error: String(err) });
      }
    }

    return NextResponse.json({
      message: "Cron job scan completed",
      processedUsers: activeConfigs.length,
      results,
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
