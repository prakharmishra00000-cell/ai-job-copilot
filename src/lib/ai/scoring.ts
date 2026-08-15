/**
 * AI Job Fit Scoring Engine
 * 
 * Calculates multi-factor fit scores between a candidate profile and a job.
 * Uses weighted scoring across multiple dimensions.
 * 
 * Score Weights:
 *   Skills Match          30%
 *   Experience Match      15%
 *   Education Match       10%
 *   Project Relevance     15%
 *   Location Match         5%
 *   Technology Match      10%
 *   Role Match            10%
 *   Salary/Pref Match      5%
 */

import { FitScoreBreakdown, CandidateSkills, CandidatePreferences, Experience, Education, Project } from "@/lib/types";

interface CandidateData {
  skills: CandidateSkills | null;
  experience: Experience[] | null;
  education: Education[] | null;
  projects: Project[] | null;
  preferences: CandidatePreferences | null;
}

interface JobData {
  title: string;
  company: string;
  location?: string | null;
  workMode?: string | null;
  salary?: string | null;
  salaryMin?: number | null;
  experienceLevel?: string | null;
  requirements?: string[] | null;
  preferredSkills?: string[] | null;
  description?: string | null;
}

function getAllSkills(skills: CandidateSkills | null): string[] {
  if (!skills) return [];
  const all: string[] = [];
  for (const category of Object.values(skills)) {
    if (Array.isArray(category)) {
      all.push(...category.map((s: string) => s.toLowerCase()));
    }
  }
  return all;
}

function fuzzyMatch(candidate: string, requirement: string): boolean {
  const c = candidate.toLowerCase().trim();
  const r = requirement.toLowerCase().trim();
  if (c === r) return true;
  if (c.includes(r) || r.includes(c)) return true;
  // Handle common variations
  const aliases: Record<string, string[]> = {
    "react": ["reactjs", "react.js"],
    "node": ["nodejs", "node.js"],
    "next": ["nextjs", "next.js"],
    "vue": ["vuejs", "vue.js"],
    "angular": ["angularjs", "angular.js"],
    "python": ["python3"],
    "javascript": ["js", "es6", "ecmascript"],
    "typescript": ["ts"],
    "postgresql": ["postgres", "psql"],
    "mongodb": ["mongo"],
    "aws": ["amazon web services"],
    "gcp": ["google cloud"],
    "docker": ["containerization"],
    "kubernetes": ["k8s"],
    "ci/cd": ["cicd", "ci cd", "continuous integration"],
    "machine learning": ["ml"],
    "artificial intelligence": ["ai"],
    "rest": ["restful", "rest api", "restful api"],
    "graphql": ["gql"],
    "css": ["css3"],
    "html": ["html5"],
    "tailwind": ["tailwindcss", "tailwind css"],
  };
  for (const [key, values] of Object.entries(aliases)) {
    if ((c === key || values.includes(c)) && (r === key || values.includes(r))) {
      return true;
    }
  }
  return false;
}

function calculateSkillsMatch(candidateSkills: string[], jobRequirements: string[], jobPreferred: string[]): { score: number; matched: string[]; missing: string[] } {
  const allReqs = [...(jobRequirements || []), ...(jobPreferred || [])];
  const techReqs = allReqs.filter((r) => r.length < 50); // Filter out long sentences
  if (techReqs.length === 0) return { score: 75, matched: [], missing: [] };
  
  const matched: string[] = [];
  const missing: string[] = [];
  
  for (const req of techReqs) {
    const words = req.toLowerCase().split(/[\s,/]+/);
    const hasMatch = words.some((word) =>
      candidateSkills.some((skill) => fuzzyMatch(skill, word))
    ) || candidateSkills.some((skill) => fuzzyMatch(skill, req));
    
    if (hasMatch) matched.push(req);
    else missing.push(req);
  }
  
  const score = techReqs.length > 0 ? Math.round((matched.length / techReqs.length) * 100) : 75;
  return { score: Math.min(score, 100), matched, missing };
}

function calculateExperienceMatch(experience: Experience[] | null, jobExperience: string | null | undefined): number {
  if (!jobExperience) return 80;
  
  const totalYears = (experience || []).reduce((acc, exp) => {
    const match = exp.duration.match(/(\d+)/);
    return acc + (match ? parseInt(match[1]) : 0);
  }, 0);
  
  const reqMatch = jobExperience.toLowerCase();
  if (reqMatch.includes("fresher") || reqMatch.includes("0")) return totalYears >= 0 ? 95 : 70;
  if (reqMatch.includes("1") && totalYears >= 1) return 90;
  if (reqMatch.includes("2") && totalYears >= 2) return 90;
  if (reqMatch.includes("3") && totalYears >= 2) return 70;
  if (reqMatch.includes("5") && totalYears >= 3) return 50;
  
  return totalYears > 0 ? 65 : 50;
}

function calculateEducationMatch(education: Education[] | null): number {
  if (!education || education.length === 0) return 60;
  const hasRelevant = education.some((e) => {
    const degree = e.degree.toLowerCase();
    return degree.includes("computer") || degree.includes("software") || degree.includes("engineering") ||
      degree.includes("technology") || degree.includes("science") || degree.includes("btech") || degree.includes("b.tech") ||
      degree.includes("mca") || degree.includes("bca") || degree.includes("mtech");
  });
  return hasRelevant ? 90 : 70;
}

function calculateProjectRelevance(projects: Project[] | null, jobRequirements: string[]): number {
  if (!projects || projects.length === 0) return 40;
  
  const projectTechs = projects.flatMap((p) => p.technologies.map((t) => t.toLowerCase()));
  const reqWords = jobRequirements.flatMap((r) => r.toLowerCase().split(/[\s,/]+/));
  
  const matches = reqWords.filter((word) =>
    projectTechs.some((tech) => fuzzyMatch(tech, word))
  ).length;
  
  const score = reqWords.length > 0 ? Math.round((matches / reqWords.length) * 100) : 60;
  return Math.min(Math.max(score, 30), 100);
}

function calculateLocationMatch(preferences: CandidatePreferences | null, jobLocation: string | null | undefined, jobWorkMode: string | null | undefined): number {
  if (!preferences || !preferences.locations || preferences.locations.length === 0) return 80;
  if (!jobLocation) return 70;
  
  const loc = jobLocation.toLowerCase();
  const mode = (jobWorkMode || "").toLowerCase();
  
  if (mode.includes("remote")) return 95;
  if (preferences.workMode?.some((m) => m.toLowerCase() === "remote") && mode.includes("remote")) return 95;
  
  const matchesLocation = preferences.locations.some((l) => 
    loc.includes(l.toLowerCase()) || l.toLowerCase().includes(loc.split(",")[0].trim().toLowerCase())
  );
  
  return matchesLocation ? 90 : 50;
}

function calculateRoleMatch(preferences: CandidatePreferences | null, jobTitle: string): number {
  if (!preferences || !preferences.targetRoles || preferences.targetRoles.length === 0) return 70;
  
  const title = jobTitle.toLowerCase();
  const matchScore = preferences.targetRoles.reduce((best, role) => {
    const roleWords = role.toLowerCase().split(/\s+/);
    const matches = roleWords.filter((w) => title.includes(w)).length;
    const score = roleWords.length > 0 ? (matches / roleWords.length) * 100 : 50;
    return Math.max(best, score);
  }, 0);
  
  return Math.round(Math.min(matchScore, 100));
}

function calculateSalaryMatch(preferences: CandidatePreferences | null, jobSalaryMin: number | null | undefined): number {
  if (!preferences || !preferences.salaryMin || !jobSalaryMin) return 75;
  if (jobSalaryMin >= preferences.salaryMin) return 95;
  if (jobSalaryMin >= preferences.salaryMin * 0.8) return 75;
  return 50;
}

export function calculateFitScore(candidate: CandidateData, job: JobData): FitScoreBreakdown {
  const candidateSkills = getAllSkills(candidate.skills);
  const jobReqs = job.requirements || [];
  const jobPreferred = job.preferredSkills || [];
  
  const { score: skillsMatch, matched, missing } = calculateSkillsMatch(candidateSkills, jobReqs, jobPreferred);
  const experienceMatch = calculateExperienceMatch(candidate.experience, job.experienceLevel);
  const educationMatch = calculateEducationMatch(candidate.education);
  const projectRelevance = calculateProjectRelevance(candidate.projects, jobReqs);
  const locationMatch = calculateLocationMatch(candidate.preferences, job.location, job.workMode);
  const technologyMatch = Math.round((skillsMatch + projectRelevance) / 2);
  const roleMatch = calculateRoleMatch(candidate.preferences, job.title);
  const salaryMatch = calculateSalaryMatch(candidate.preferences, job.salaryMin);
  
  // Weighted score
  const fitScore = Math.round(
    skillsMatch * 0.30 +
    experienceMatch * 0.15 +
    educationMatch * 0.10 +
    projectRelevance * 0.15 +
    locationMatch * 0.05 +
    technologyMatch * 0.10 +
    roleMatch * 0.10 +
    salaryMatch * 0.05
  );
  
  // Shortlist probability — slightly conservative
  const shortlistProbability = Math.round(
    fitScore * 0.6 +
    (matched.length > 3 ? 20 : matched.length * 5) +
    (candidate.projects && candidate.projects.length > 2 ? 10 : 0) +
    (candidate.experience && candidate.experience.length > 0 ? 10 : 0)
  );
  const clampedShortlist = Math.min(Math.max(shortlistProbability, 10), 95);
  
  // Confidence
  const hasEnoughData = candidateSkills.length > 3 && jobReqs.length > 2;
  const confidence: "high" | "medium" | "low" = hasEnoughData
    ? fitScore > 80 ? "high" : "medium"
    : "low";
  
  // Strengths
  const strengths = matched.map((m) => `${m} — Required and verified`);
  if (candidate.projects && candidate.projects.length > 2) strengths.push("Multiple relevant projects");
  if (locationMatch > 80) strengths.push("Location matches preference");
  
  // Missing
  const missingRequirements = missing.map((m) => `${m} — Not found in profile`);
  
  // Category
  const category = fitScore >= 90 ? "apply_immediately" as const
    : fitScore >= 80 ? "strong_match" as const
    : fitScore >= 65 ? "possible_match" as const
    : "low_match" as const;
  
  // Explanation
  const explanation = `Overall Fit Score: ${fitScore}%. ${strengths.length > 0 ? `Key strengths: ${strengths.slice(0, 3).join("; ")}.` : ""} ${missingRequirements.length > 0 ? `Gaps: ${missingRequirements.slice(0, 2).join("; ")}.` : ""}`;
  
  return {
    fitScore: Math.min(Math.max(fitScore, 5), 100),
    shortlistProbability: clampedShortlist,
    confidence,
    skillsMatch,
    experienceMatch,
    educationMatch,
    projectRelevance,
    locationMatch,
    technologyMatch,
    roleMatch,
    salaryMatch,
    strengths,
    missingRequirements,
    explanation,
    category,
  };
}
