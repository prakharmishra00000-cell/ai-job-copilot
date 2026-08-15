import { db } from "@/db";
import { responses, applications, jobs, candidateProfiles, users } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      return NextResponse.json({ responses: [], stats: {} });
    }

    const profiles = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userRows[0].id))
      .limit(1);

    if (profiles.length === 0) {
      return NextResponse.json({ responses: [], stats: {} });
    }

    const profile = profiles[0];

    // Get all responses
    const responseList = await db
      .select({
        response: responses,
        application: applications,
        job: jobs,
      })
      .from(responses)
      .innerJoin(applications, eq(applications.id, responses.applicationId))
      .innerJoin(jobs, eq(jobs.id, applications.jobId))
      .where(eq(applications.candidateId, profile.id))
      .orderBy(desc(responses.receivedAt));

    // Stats by type
    const typeCounts = await db
      .select({
        type: responses.type,
        count: sql<number>`count(*)::int`,
      })
      .from(responses)
      .innerJoin(applications, eq(applications.id, responses.applicationId))
      .where(eq(applications.candidateId, profile.id))
      .groupBy(responses.type);

    const stats = {
      total: responseList.length,
      unread: responseList.filter((r) => !r.response.isRead).length,
      byType: Object.fromEntries(typeCounts.map((tc) => [tc.type, tc.count])),
    };

    return NextResponse.json({ responses: responseList, stats });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, type, content, classification, confidence } = body;

    const [response] = await db
      .insert(responses)
      .values({
        applicationId,
        type,
        content,
        classification,
        confidence,
        receivedAt: new Date(),
      })
      .returning();

    // Update application status based on response type
    const statusMap: Record<string, string> = {
      interview_invitation: "interview_scheduled",
      rejection: "rejected",
      offer: "offer",
      recruiter_response: "recruiter_responded",
      assessment: "assessment_received",
    };

    const newStatus = statusMap[type];
    if (newStatus) {
      await db
        .update(applications)
        .set({ status: newStatus as "interview_scheduled" | "rejected" | "offer" | "recruiter_responded" | "assessment_received", lastUpdatedAt: new Date() })
        .where(eq(applications.id, applicationId));
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
