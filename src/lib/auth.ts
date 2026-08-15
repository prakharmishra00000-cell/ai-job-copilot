/**
 * Simple Authentication Helpers
 * 
 * In production, this would integrate with:
 * - NextAuth.js / Auth.js
 * - Clerk
 * - Supabase Auth
 * - Custom OAuth
 * 
 * For this demo, we use a simplified session approach.
 * To make this production-ready, replace with a proper auth provider.
 */

import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "jobpilot_session";

// Get current user from session
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    
    if (!sessionId) {
      // For demo, auto-create/get default user
      const existing = await db.select().from(users).limit(1);
      if (existing.length > 0) {
        return existing[0];
      }
      return null;
    }
    
    // In production, validate session and get user
    const user = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
    return user[0] || null;
  } catch {
    return null;
  }
}

// Create session for user
export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

// Clear session
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Validate session (for API routes)
export async function validateSession(): Promise<{ userId: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    
    if (!sessionId) {
      // For demo, get default user
      const existing = await db.select().from(users).limit(1);
      if (existing.length > 0) {
        return { userId: existing[0].id };
      }
      return null;
    }
    
    const user = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
    if (user[0]) {
      return { userId: user[0].id };
    }
    return null;
  } catch {
    return null;
  }
}
