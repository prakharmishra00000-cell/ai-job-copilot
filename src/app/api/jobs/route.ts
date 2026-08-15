import { db } from "@/db";
import { jobs, jobScores, candidateProfiles, users } from "@/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const minFit = parseInt(searchParams.get("minFit") || "0");
    const category = searchParams.get("category");
    const source = searchParams.get("source");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    // Get user profile
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      return NextResponse.json({ jobs: [], total: 0 });
    }
    
    const profiles = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userRows[0].id))
      .limit(1);
    
    const profile = profiles[0];
    
    // Build query
    const conditions = [eq(jobs.isActive, true), eq(jobs.isDuplicate, false)];
    if (source) {
      conditions.push(eq(jobs.sourceName, source));
    }
    
    // Get jobs with scores
    let jobList;
    if (profile) {
      jobList = await db
        .select({
          job: jobs,
          score: jobScores,
        })
        .from(jobs)
        .leftJoin(jobScores, and(eq(jobScores.jobId, jobs.id), eq(jobScores.candidateId, profile.id)))
        .where(and(...conditions))
        .orderBy(desc(sql`COALESCE(${jobScores.fitScore}, 0)`))
        .limit(limit)
        .offset(offset);
      
      // Filter by minFit
      if (minFit > 0) {
        jobList = jobList.filter((j) => (j.score?.fitScore || 0) >= minFit);
      }
      
      // Filter by category
      if (category) {
        jobList = jobList.filter((j) => j.score?.category === category);
      }
    } else {
      const rawJobs = await db
        .select()
        .from(jobs)
        .where(and(...conditions))
        .orderBy(desc(jobs.createdAt))
        .limit(limit)
        .offset(offset);
      
      jobList = rawJobs.map((j) => ({ job: j, score: null }));
    }
    
    // Count total
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(and(...conditions));
    
    // Count by category
    let categoryCounts = { apply_immediately: 0, strong_match: 0, possible_match: 0, low_match: 0 };
    if (profile) {
      const cats = await db
        .select({
          category: jobScores.category,
          count: sql<number>`count(*)::int`,
        })
        .from(jobScores)
        .where(eq(jobScores.candidateId, profile.id))
        .groupBy(jobScores.category);
      
      for (const c of cats) {
        if (c.category && c.category in categoryCounts) {
          categoryCounts[c.category as keyof typeof categoryCounts] = c.count;
        }
      }
    }
    
    return NextResponse.json({
      jobs: jobList,
      total: countResult[0]?.count || 0,
      categoryCounts,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
