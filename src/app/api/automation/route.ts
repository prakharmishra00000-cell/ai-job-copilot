import { db } from "@/db";
import { automationConfig, candidateProfiles, users, jobSources, automationJobs, activityLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      return NextResponse.json({ config: null, sources: [], recentJobs: [] });
    }
    
    const profiles = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userRows[0].id))
      .limit(1);
    
    if (profiles.length === 0) {
      return NextResponse.json({ config: null, sources: [], recentJobs: [] });
    }
    
    const configRows = await db
      .select()
      .from(automationConfig)
      .where(eq(automationConfig.candidateId, profiles[0].id))
      .limit(1);
    
    const sources = await db.select().from(jobSources);
    
    const recentJobs = await db
      .select()
      .from(automationJobs)
      .where(eq(automationJobs.candidateId, profiles[0].id))
      .orderBy(desc(automationJobs.createdAt))
      .limit(20);
    
    const recentLogs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.candidateId, profiles[0].id))
      .orderBy(desc(activityLogs.timestamp))
      .limit(30);
    
    return NextResponse.json({
      config: configRows[0] || null,
      sources,
      recentJobs,
      activityLog: recentLogs,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
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
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }
    
    const existing = await db
      .select()
      .from(automationConfig)
      .where(eq(automationConfig.candidateId, profiles[0].id))
      .limit(1);
    
    const configData = {
      candidateId: profiles[0].id,
      isActive: body.isActive ?? false,
      mode: body.mode || "assisted",
      scanFrequency: body.scanFrequency || "30min",
      maxApplicationsPerDay: body.maxApplicationsPerDay ?? 10,
      maxApplicationsPerHour: body.maxApplicationsPerHour ?? 3,
      minFitScore: body.minFitScore ?? 85,
      minShortlistProbability: body.minShortlistProbability ?? 70,
      autoApplyEnabled: body.autoApplyEnabled ?? false,
      recruiterOutreachEnabled: body.recruiterOutreachEnabled ?? false,
      maxRecruiterMessagesPerDay: body.maxRecruiterMessagesPerDay ?? 10,
      requireApproval: body.requireApproval || "always",
      updatedAt: new Date(),
    };
    
    let config;
    if (existing.length > 0) {
      [config] = await db
        .update(automationConfig)
        .set(configData)
        .where(eq(automationConfig.id, existing[0].id))
        .returning();
    } else {
      [config] = await db
        .insert(automationConfig)
        .values(configData)
        .returning();
    }
    
    await db.insert(activityLogs).values({
      userId: userRows[0].id,
      candidateId: profiles[0].id,
      action: body.isActive ? "automation_started" : "automation_paused",
      details: `Automation ${body.isActive ? "activated" : "paused"} - Mode: ${body.mode}`,
      result: "success",
    });
    
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
