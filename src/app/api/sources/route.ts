import { db } from "@/db";
import { jobSources } from "@/db/schema";
import { NextResponse } from "next/server";
import { ALL_SOURCES } from "@/lib/job-sources";

export async function GET() {
  try {
    const dbSources = await db.select().from(jobSources);
    
    // Merge with all known sources
    const merged = ALL_SOURCES.map((src) => {
      const dbMatch = dbSources.find((ds) => ds.name === src.name);
      return {
        ...src,
        id: dbMatch?.id,
        lastSyncAt: dbMatch?.lastSyncAt,
        jobCount: dbMatch?.jobCount || 0,
        errorMessage: dbMatch?.errorMessage,
        status: dbMatch?.status || src.status,
      };
    });
    
    return NextResponse.json({ sources: merged });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
