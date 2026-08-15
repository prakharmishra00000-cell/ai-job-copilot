import { db } from "@/db";
import { jobs, jobScores, candidateProfiles, users, applications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const jobRows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (jobRows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobRows[0];

    // Get score
    const userRows = await db.select().from(users).limit(1);
    let score = null;
    let application = null;

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
              eq(jobScores.jobId, id),
              eq(jobScores.candidateId, profiles[0].id)
            )
          )
          .limit(1);
        score = scores[0] || null;

        const apps = await db
          .select()
          .from(applications)
          .where(
            and(
              eq(applications.jobId, id),
              eq(applications.candidateId, profiles[0].id)
            )
          )
          .limit(1);
        application = apps[0] || null;
      }
    }

    return NextResponse.json({ job, score, application });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
