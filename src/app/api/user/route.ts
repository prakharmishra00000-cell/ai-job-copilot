import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Get or create the default user (simplified auth for demo)
export async function GET() {
  try {
    const existing = await db.select().from(users).limit(1);
    if (existing.length > 0) {
      return NextResponse.json(existing[0]);
    }
    // Create default user
    const [user] = await db
      .insert(users)
      .values({
        name: "User",
        email: "user@jobpilot.ai",
      })
      .returning();
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await db.select().from(users).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "No user found" }, { status: 404 });
    }
    const [updated] = await db
      .update(users)
      .set({ name: body.name, email: body.email, updatedAt: new Date() })
      .where(eq(users.id, existing[0].id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
