import { db } from "@/db";
import { activityLogs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      return NextResponse.json({ logs: [] });
    }

    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userRows[0].id))
      .orderBy(desc(activityLogs.timestamp))
      .limit(50);

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
