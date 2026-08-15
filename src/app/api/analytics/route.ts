import { db } from "@/db";
import { applications, jobs, jobScores, candidateProfiles, users, responses } from "@/db/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      return NextResponse.json({ analytics: null });
    }

    const profiles = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userRows[0].id))
      .limit(1);

    if (profiles.length === 0) {
      return NextResponse.json({ analytics: null });
    }

    const profile = profiles[0];

    // Application count by status
    const statusCounts = await db
      .select({
        status: applications.status,
        count: sql<number>`count(*)::int`,
      })
      .from(applications)
      .where(eq(applications.candidateId, profile.id))
      .groupBy(applications.status);

    // Apps by source
    const sourceStats = await db
      .select({
        source: jobs.sourceName,
        count: sql<number>`count(*)::int`,
      })
      .from(applications)
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .where(eq(applications.candidateId, profile.id))
      .groupBy(jobs.sourceName);

    // Average fit score
    const avgFit = await db
      .select({ avg: sql<number>`COALESCE(avg(${jobScores.fitScore}), 0)::int` })
      .from(jobScores)
      .where(eq(jobScores.candidateId, profile.id));

    // Score distribution
    const scoreDistribution = await db
      .select({
        category: jobScores.category,
        count: sql<number>`count(*)::int`,
      })
      .from(jobScores)
      .where(eq(jobScores.candidateId, profile.id))
      .groupBy(jobScores.category);

    // Response count
    const responseCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(responses)
      .innerJoin(applications, eq(applications.id, responses.applicationId))
      .where(eq(applications.candidateId, profile.id));

    // Weekly stats
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekApps = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applications)
      .where(and(eq(applications.candidateId, profile.id), gte(applications.createdAt, weekAgo)));

    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthApps = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applications)
      .where(and(eq(applications.candidateId, profile.id), gte(applications.createdAt, monthAgo)));

    // Top performing roles
    const topRoles = await db
      .select({
        title: jobs.title,
        avgScore: sql<number>`avg(${jobScores.fitScore})::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(applications)
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .leftJoin(jobScores, and(eq(jobScores.jobId, jobs.id), eq(jobScores.candidateId, profile.id)))
      .where(eq(applications.candidateId, profile.id))
      .groupBy(jobs.title)
      .orderBy(desc(sql`avg(${jobScores.fitScore})`))
      .limit(5);

    const totalApps = statusCounts.reduce((sum, s) => sum + s.count, 0);

    return NextResponse.json({
      analytics: {
        statusCounts,
        sourceStats,
        avgFitScore: avgFit[0]?.avg || 0,
        scoreDistribution,
        totalApplications: totalApps,
        totalResponses: responseCount[0]?.count || 0,
        applicationsThisWeek: weekApps[0]?.count || 0,
        applicationsThisMonth: monthApps[0]?.count || 0,
        responseRate: totalApps > 0 ? Math.round((responseCount[0]?.count || 0) / totalApps * 100) : 0,
        topRoles,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
