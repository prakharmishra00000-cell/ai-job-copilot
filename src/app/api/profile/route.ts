import { db } from "@/db";
import { candidateProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { extractSkillsFromText, analyzePortfolio, inferRoles } from "@/lib/ai/candidate-analyzer";

export async function GET() {
  try {
    const userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      return NextResponse.json(null);
    }
    const profiles = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userRows[0].id))
      .limit(1);
    return NextResponse.json(profiles[0] || null);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get or create user
    let userRows = await db.select().from(users).limit(1);
    if (userRows.length === 0) {
      const [newUser] = await db
        .insert(users)
        .values({ name: body.name || "User", email: body.email || "user@jobpilot.ai" })
        .returning();
      userRows = [newUser];
    } else if (body.name) {
      await db.update(users).set({ name: body.name }).where(eq(users.id, userRows[0].id));
    }
    
    const userId = userRows[0].id;
    
    // Extract skills from resume text if provided
    let skills = body.skills || null;
    let portfolioAnalysisResult = body.portfolioAnalysis || null;
    let inferredRolesResult = body.inferredRoles || null;
    
    if (body.resumeText) {
      skills = extractSkillsFromText(body.resumeText);
      const projects = body.projects || [];
      const experience = body.experience || [];
      const hasDeployed = projects.some((p: { liveUrl?: string }) => p.liveUrl);
      portfolioAnalysisResult = analyzePortfolio(skills, projects.length, experience.length, hasDeployed);
      inferredRolesResult = inferRoles(skills);
    }
    
    // Check if profile exists
    const existing = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId))
      .limit(1);
    
    const profileData = {
      userId,
      resumeUrl: body.resumeUrl || null,
      portfolioUrl: body.portfolioUrl || null,
      linkedinUrl: body.linkedinUrl || null,
      githubUrl: body.githubUrl || null,
      personalInfo: body.personalInfo || null,
      skills,
      experience: body.experience || null,
      education: body.education || null,
      projects: body.projects || null,
      certifications: body.certifications || null,
      portfolioAnalysis: portfolioAnalysisResult,
      preferences: body.preferences || null,
      inferredRoles: inferredRolesResult,
      updatedAt: new Date(),
    };
    
    let profile;
    if (existing.length > 0) {
      [profile] = await db
        .update(candidateProfiles)
        .set(profileData)
        .where(eq(candidateProfiles.id, existing[0].id))
        .returning();
    } else {
      [profile] = await db
        .insert(candidateProfiles)
        .values(profileData)
        .returning();
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
