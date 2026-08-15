import { db } from "@/db";
import { applications, jobs, jobScores, candidateProfiles, users, activityLogs } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter, generateApplicationAnswers, generateResumeHighlights } from "@/lib/ai/document-generator";
import { CandidateSkills, Experience, Project } from "@/lib/types";

export async function GET() {
  try {
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) return NextResponse.json({ applications: [] });
    
    const profiles = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userRows[0].id))
      .limit(1);
    
    if (profiles.length === 0) return NextResponse.json({ applications: [] });
    
    const appList = await db
      .select({
        application: applications,
        job: jobs,
        score: jobScores,
      })
      .from(applications)
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .leftJoin(jobScores, and(
        eq(jobScores.jobId, applications.jobId),
        eq(jobScores.candidateId, profiles[0].id)
      ))
      .where(eq(applications.candidateId, profiles[0].id))
      .orderBy(desc(applications.createdAt));
    
    // Stats
    const stats = {
      total: appList.length,
      applied: appList.filter((a) => ["applied", "application_confirmed"].includes(a.application.status)).length,
      interviewing: appList.filter((a) => ["interview_requested", "interview_scheduled"].includes(a.application.status)).length,
      offers: appList.filter((a) => a.application.status === "offer").length,
      rejected: appList.filter((a) => a.application.status === "rejected").length,
      needsAction: appList.filter((a) => a.application.status === "needs_user_action").length,
    };
    
    return NextResponse.json({ applications: appList, stats });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, mode } = body;
    
    // Get user and profile
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      return NextResponse.json({ error: "No user found" }, { status: 400 });
    }
    
    const profiles = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userRows[0].id))
      .limit(1);
    
    if (profiles.length === 0) {
      return NextResponse.json({ error: "Profile not found. Complete onboarding first." }, { status: 400 });
    }
    
    const profile = profiles[0];
    
    // Get job
    const jobRows = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (jobRows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    const job = jobRows[0];
    
    // Check for existing application
    const existing = await db
      .select()
      .from(applications)
      .where(and(
        eq(applications.candidateId, profile.id),
        eq(applications.jobId, jobId)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      return NextResponse.json({ error: "You have already applied to this job", application: existing[0] }, { status: 409 });
    }
    
    // Generate application documents
    const personalInfo = profile.personalInfo as { name?: string } | null;
    const candidateContext = {
      name: personalInfo?.name || userRows[0].name,
      skills: profile.skills as CandidateSkills | null,
      experience: profile.experience as Experience[] | null,
      projects: profile.projects as Project[] | null,
      portfolioUrl: profile.portfolioUrl || undefined,
      githubUrl: profile.githubUrl || undefined,
    };
    
    const jobContext = {
      title: job.title,
      company: job.company,
      requirements: (job.requirements as string[]) || [],
      description: job.description || "",
    };
    
    const coverLetter = generateCoverLetter(candidateContext, jobContext);
    const applicationAnswers = generateApplicationAnswers(candidateContext, jobContext);
    const resumeVersion = generateResumeHighlights(candidateContext, jobContext);
    
    // Determine application mode
    // Demo source does not support auto-apply, so it's always "assisted"
    const applicationMode = mode || "assisted";
    const isAutoApply = applicationMode === "autonomous" && job.sourceName !== "demo";
    
    let status: "applied" | "needs_user_action" = "needs_user_action";
    let failureReason: string | null = null;
    
    if (isAutoApply) {
      // In production, this would attempt auto-submission via the source adapter
      // For now, all sources are in assisted mode
      status = "needs_user_action";
      failureReason = "Assisted Application Mode — This platform does not support automated applications. Please submit manually using the prepared materials.";
    } else {
      status = "needs_user_action";
      failureReason = "Assisted Application Mode — Application materials prepared. Click 'Open Original' to submit on the platform.";
    }
    
    // Create application
    const [app] = await db
      .insert(applications)
      .values({
        candidateId: profile.id,
        jobId,
        status,
        resumeVersion,
        coverLetter,
        applicationAnswers,
        mode: applicationMode,
        failureReason,
        lastUpdatedAt: new Date(),
      })
      .returning();
    
    // Log activity
    await db.insert(activityLogs).values({
      userId: userRows[0].id,
      candidateId: profile.id,
      action: "application_created",
      details: `Application prepared for ${job.title} at ${job.company}`,
      platform: job.sourceName,
      result: status,
    });
    
    return NextResponse.json({
      application: app,
      coverLetter,
      applicationAnswers,
      resumeVersion,
      originalJobUrl: job.url,
      applicationUrl: job.applicationUrl || job.url,
      mode: applicationMode,
      message: "Application materials prepared. Please submit manually on the original platform.",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
