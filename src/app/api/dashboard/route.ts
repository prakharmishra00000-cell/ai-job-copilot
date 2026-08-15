import { db } from "@/db";
import { jobs, jobScores, applications, responses, candidateProfiles, users, notifications } from "@/db/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      return NextResponse.json({
        stats: { totalJobsFound: 0, highlyRelevant: 0, totalApplications: 0, totalResponses: 0, interviews: 0, offers: 0, applicationsThisWeek: 0, responseRate: 0, interviewRate: 0, avgFitScore: 0 },
        topJobs: [],
        recentActivity: [],
        notifications: [],
      });
    }

    const profiles = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userRows[0].id))
      .limit(1);

    const profile = profiles[0];

    // Total jobs
    const totalJobsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(eq(jobs.isActive, true));
    const totalJobsFound = totalJobsResult[0]?.count || 0;

    // Highly relevant
    let highlyRelevant = 0;
    let avgFitScore = 0;
    if (profile) {
      const relevantResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobScores)
        .where(and(eq(jobScores.candidateId, profile.id), gte(jobScores.fitScore, 80)));
      highlyRelevant = relevantResult[0]?.count || 0;

      const avgResult = await db
        .select({ avg: sql<number>`COALESCE(avg(${jobScores.fitScore}), 0)::int` })
        .from(jobScores)
        .where(eq(jobScores.candidateId, profile.id));
      avgFitScore = avgResult[0]?.avg || 0;
    }

    // Applications
    let totalApplications = 0;
    let appliedCount = 0;
    let interviewCount = 0;
    let offerCount = 0;
    let responseCount = 0;
    let weekApps = 0;
    if (profile) {
      const appResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(eq(applications.candidateId, profile.id));
      totalApplications = appResult[0]?.count || 0;

      const appliedResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(and(eq(applications.candidateId, profile.id), eq(applications.status, "applied")));
      appliedCount = appliedResult[0]?.count || 0;

      const interviewResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(and(eq(applications.candidateId, profile.id), eq(applications.status, "interview_scheduled")));
      interviewCount = interviewResult[0]?.count || 0;

      const offerResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(and(eq(applications.candidateId, profile.id), eq(applications.status, "offer")));
      offerCount = offerResult[0]?.count || 0;

      const respResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(responses)
        .innerJoin(applications, eq(applications.id, responses.applicationId))
        .where(eq(applications.candidateId, profile.id));
      responseCount = respResult[0]?.count || 0;

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weekResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(and(eq(applications.candidateId, profile.id), gte(applications.createdAt, weekAgo)));
      weekApps = weekResult[0]?.count || 0;
    }

    const responseRate = totalApplications > 0 ? Math.round((responseCount / totalApplications) * 100) : 0;
    const interviewRate = totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0;

    // Top jobs
    let topJobs: Array<{ job: typeof jobs.$inferSelect; score: typeof jobScores.$inferSelect }> = [];
    if (profile) {
      topJobs = await db
        .select({ job: jobs, score: jobScores })
        .from(jobScores)
        .innerJoin(jobs, eq(jobs.id, jobScores.jobId))
        .where(and(eq(jobScores.candidateId, profile.id), eq(jobs.isActive, true)))
        .orderBy(desc(jobScores.fitScore))
        .limit(5);
    }

    // Notifications
    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userRows[0].id))
      .orderBy(desc(notifications.createdAt))
      .limit(10);

    return NextResponse.json({
      stats: {
        totalJobsFound,
        highlyRelevant,
        totalApplications,
        totalResponses: responseCount,
        interviews: interviewCount,
        offers: offerCount,
        applicationsThisWeek: weekApps,
        responseRate,
        interviewRate,
        avgFitScore,
        applied: appliedCount,
      },
      topJobs,
      notifications: notifs,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
