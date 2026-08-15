import { db } from "@/db";
import { users, candidateProfiles, jobs, applications, responses, jobScores } from "@/db/schema";
import { eq, sql, gte, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateCopilotResponse, generateDailyBriefing } from "@/lib/ai/career-copilot";
import { CandidateSkills, CandidatePreferences } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, type } = body;

    // Get user context
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      return NextResponse.json({ error: "No user found" }, { status: 400 });
    }

    const profiles = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userRows[0].id))
      .limit(1);

    const profile = profiles[0];

    // Get stats
    const jobCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(eq(jobs.isActive, true));

    let applicationCount = 0;
    let responseCount = 0;
    let interviewCount = 0;
    let avgFitScore = 0;

    if (profile) {
      const appStats = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(eq(applications.candidateId, profile.id));
      applicationCount = appStats[0]?.count || 0;

      const respStats = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(responses)
        .innerJoin(applications, eq(applications.id, responses.applicationId))
        .where(eq(applications.candidateId, profile.id));
      responseCount = respStats[0]?.count || 0;

      const intStats = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(and(
          eq(applications.candidateId, profile.id),
          eq(applications.status, "interview_scheduled")
        ));
      interviewCount = intStats[0]?.count || 0;

      const avgStats = await db
        .select({ avg: sql<number>`COALESCE(avg(${jobScores.fitScore}), 0)::int` })
        .from(jobScores)
        .where(eq(jobScores.candidateId, profile.id));
      avgFitScore = avgStats[0]?.avg || 0;
    }

    const context = {
      candidateName: userRows[0].name,
      skills: (profile?.skills as CandidateSkills) || null,
      preferences: (profile?.preferences as CandidatePreferences) || null,
      jobCount: jobCount[0]?.count || 0,
      applicationCount,
      responseCount,
      interviewCount,
      avgFitScore,
      topRoles: (profile?.inferredRoles as string[]) || [],
    };

    if (type === "briefing") {
      // Daily briefing
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newJobsToday = profile ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobs)
        .where(gte(jobs.createdAt, today)) : [{ count: 0 }];

      const strongMatches = profile ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobScores)
        .where(and(
          eq(jobScores.candidateId, profile.id),
          gte(jobScores.fitScore, 80)
        )) : [{ count: 0 }];

      const pendingApps = profile ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(and(
          eq(applications.candidateId, profile.id),
          eq(applications.status, "needs_user_action")
        )) : [{ count: 0 }];

      const briefing = generateDailyBriefing({
        newJobs: newJobsToday[0]?.count || 0,
        strongMatches: strongMatches[0]?.count || 0,
        pendingApplications: applicationCount,
        newResponses: responseCount,
        interviews: interviewCount,
        topRole: context.topRoles[0] || "",
        actionRequired: pendingApps[0]?.count || 0,
      });

      return NextResponse.json(briefing);
    }

    // Regular query
    const response = generateCopilotResponse({ query, context });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
