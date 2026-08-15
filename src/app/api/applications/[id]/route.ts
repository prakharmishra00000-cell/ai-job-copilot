import { db } from "@/db";
import { applications, jobs, jobScores, activityLogs, candidateProfiles, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appRows = await db
      .select({
        application: applications,
        job: jobs,
      })
      .from(applications)
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .where(eq(applications.id, id))
      .limit(1);

    if (appRows.length === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const userRows = await db.select().from(users).limit(1);
    let score = null;
    if (userRows.length > 0) {
      const profiles = await db
        .select()
        .from(candidateProfiles)
        .where(eq(candidateProfiles.userId, userRows[0].id))
        .limit(1);
      if (profiles.length > 0) {
        const scores = await db
          .select()
          .from(jobScores)
          .where(
            and(
              eq(jobScores.jobId, appRows[0].job.id),
              eq(jobScores.candidateId, profiles[0].id)
            )
          )
          .limit(1);
        score = scores[0] || null;
      }
    }

    // Get timeline from activity logs
    const timeline = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.action, "application_created"))
      .limit(10);

    return NextResponse.json({
      ...appRows[0],
      score,
      timeline,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(applications)
      .set({
        status: body.status,
        failureReason: body.failureReason,
        appliedAt: body.status === "applied" ? new Date() : undefined,
        lastUpdatedAt: new Date(),
      })
      .where(eq(applications.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
