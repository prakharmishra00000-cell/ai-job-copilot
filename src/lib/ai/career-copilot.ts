/**
 * AI Career Copilot
 * 
 * Provides intelligent career guidance based on the user's actual stored data.
 * Never hallucinates information - only uses verified candidate and job data.
 */

import { CandidateSkills, CandidatePreferences } from "@/lib/types";

interface CopilotContext {
  candidateName: string;
  skills: CandidateSkills | null;
  preferences: CandidatePreferences | null;
  jobCount: number;
  applicationCount: number;
  responseCount: number;
  interviewCount: number;
  avgFitScore: number;
  topRoles: string[];
}

interface CopilotQuery {
  query: string;
  context: CopilotContext;
}

interface CopilotResponse {
  answer: string;
  suggestions: string[];
  actions: Array<{ label: string; href: string }>;
  filters?: Record<string, string | number | boolean>;
}

// Parse natural language into structured filters
export function parseNaturalLanguageSearch(query: string): Record<string, string | boolean | number> {
  const filters: Record<string, string | boolean | number> = {};
  const lower = query.toLowerCase();

  // Remote detection
  if (lower.includes("remote")) {
    filters.workMode = "Remote";
  } else if (lower.includes("hybrid")) {
    filters.workMode = "Hybrid";
  } else if (lower.includes("on-site") || lower.includes("onsite")) {
    filters.workMode = "On-site";
  }

  // Location
  const locationMatch = lower.match(/(?:in|at|from)\s+([a-z\s]+?)(?:\s+(?:posted|with|above|below|salary|remote|$))/i);
  if (locationMatch) {
    filters.location = locationMatch[1].trim();
  }
  if (lower.includes("india")) filters.location = "India";
  if (lower.includes("bangalore") || lower.includes("bengaluru")) filters.location = "Bangalore";
  if (lower.includes("mumbai")) filters.location = "Mumbai";
  if (lower.includes("delhi")) filters.location = "Delhi";

  // Posted within
  if (lower.includes("today") || lower.includes("posted today")) {
    filters.postedWithin = "24h";
  } else if (lower.includes("this week")) {
    filters.postedWithin = "7d";
  } else if (lower.includes("this month")) {
    filters.postedWithin = "30d";
  }

  // Salary
  const salaryMatch = lower.match(/(?:above|over|minimum|min|at least|>\s*)[₹$]?\s*(\d+)\s*(?:lpa|lakhs?|k)?/i);
  if (salaryMatch) {
    let salary = parseInt(salaryMatch[1]);
    if (salary < 100) salary *= 100000; // Convert LPA to actual
    filters.salaryMin = salary;
  }

  // Role keywords
  const roleKeywords = ["developer", "engineer", "full stack", "frontend", "backend", "ai", "ml", "data", "devops", "react", "node", "python"];
  const foundRoles: string[] = [];
  for (const kw of roleKeywords) {
    if (lower.includes(kw)) foundRoles.push(kw);
  }
  if (foundRoles.length > 0) {
    filters.role = foundRoles.join(" ");
  }

  // Fit score
  if (lower.includes("best") || lower.includes("top") || lower.includes("highest")) {
    filters.minFit = 85;
  }

  return filters;
}

// Generate copilot response
export function generateCopilotResponse(input: CopilotQuery): CopilotResponse {
  const { query, context } = input;
  const lower = query.toLowerCase();

  // Handle different query types
  if (lower.includes("best job") || lower.includes("top job") || lower.includes("find") || lower.includes("show")) {
    const filters = parseNaturalLanguageSearch(query);
    return {
      answer: `I'll find the best matching jobs for you based on your profile. ${context.jobCount > 0 ? `Currently, there are ${context.jobCount} jobs in your discovery list.` : "Run a job scan first to discover opportunities."}`,
      suggestions: [
        "Show me remote AI jobs",
        "Find jobs posted today",
        "Show high-fit jobs only",
      ],
      actions: [
        { label: "View All Jobs", href: "/jobs" },
        { label: "Run Job Scan", href: "/jobs?scan=true" },
      ],
      filters,
    };
  }

  if (lower.includes("why") && (lower.includes("match") || lower.includes("fit") || lower.includes("good"))) {
    return {
      answer: "Job fit scores are calculated based on 8 factors: Skills Match (30%), Experience (15%), Education (10%), Project Relevance (15%), Location (5%), Technology (10%), Role Alignment (10%), and Salary (5%). Each job shows a detailed breakdown of why it matches your profile.",
      suggestions: [
        "Show me jobs above 90% fit",
        "What skills am I missing?",
        "How can I improve my score?",
      ],
      actions: [
        { label: "View Top Matches", href: "/jobs?minFit=90" },
        { label: "View My Profile", href: "/profile" },
      ],
    };
  }

  if (lower.includes("not getting response") || lower.includes("no response") || lower.includes("why am i")) {
    const responseRate = context.applicationCount > 0 
      ? Math.round((context.responseCount / context.applicationCount) * 100) 
      : 0;
    return {
      answer: `Your current response rate is ${responseRate}%. ${responseRate < 15 ? "This is below average. Consider: 1) Targeting jobs with 90%+ fit score, 2) Customizing cover letters more, 3) Focusing on roles that match your strongest skills." : "This is a reasonable rate. Keep applying to high-fit jobs and ensure your applications are personalized."}`,
      suggestions: [
        "Show my application analytics",
        "Which roles get best responses?",
        "Improve my profile",
      ],
      actions: [
        { label: "View Analytics", href: "/analytics" },
        { label: "View Applications", href: "/applications" },
      ],
    };
  }

  if (lower.includes("skill") && (lower.includes("learn") || lower.includes("missing") || lower.includes("improve"))) {
    const allSkills = context.skills ? Object.values(context.skills).flat() : [];
    const hasAI = allSkills.some(s => s.toLowerCase().includes("ai") || s.toLowerCase().includes("openai"));
    const hasCloud = allSkills.some(s => ["aws", "gcp", "azure"].some(c => s.toLowerCase().includes(c)));
    
    const recommendations: string[] = [];
    if (!hasCloud) recommendations.push("Cloud platforms (AWS/GCP) - high demand skill");
    if (!hasAI) recommendations.push("AI/LLM integration - growing rapidly");
    if (!allSkills.some(s => s.toLowerCase().includes("docker"))) recommendations.push("Docker/Kubernetes - essential for modern roles");
    
    return {
      answer: `Based on your profile and job market trends, here are recommended skills to learn:\n\n${recommendations.length > 0 ? recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n") : "Your skill set looks comprehensive! Focus on deepening your expertise."}`,
      suggestions: [
        "Show jobs requiring AWS",
        "What's trending in AI?",
        "Show my skill gaps",
      ],
      actions: [
        { label: "Update Skills", href: "/profile" },
        { label: "Find Jobs", href: "/jobs" },
      ],
    };
  }

  if (lower.includes("apply") && (lower.includes("first") || lower.includes("should") || lower.includes("recommend"))) {
    return {
      answer: `I recommend applying to jobs with:\n- Fit score above 85%\n- Posted within last 3 days\n- Matching your preferred locations\n- Clear application process\n\n${context.jobCount > 0 ? `You have ${context.jobCount} jobs discovered. Let me show you the best ones.` : "Run a job scan to discover opportunities first."}`,
      suggestions: [
        "Show top 10 to apply",
        "Apply to best matches",
        "Show jobs posted today",
      ],
      actions: [
        { label: "View Top Jobs", href: "/jobs?category=apply_immediately" },
        { label: "Run Automation", href: "/automation" },
      ],
    };
  }

  // Default response
  return {
    answer: `I'm your AI Career Copilot. I can help you:\n\n• Find the best jobs for your profile\n• Explain why jobs match (or don't)\n• Analyze your application performance\n• Recommend skills to learn\n• Prioritize applications\n\nTry asking: "Find me remote AI jobs in India" or "Why am I not getting responses?"`,
    suggestions: [
      "Find me the best jobs today",
      "Which jobs should I apply to first?",
      "Why is my response rate low?",
      "What skills should I learn?",
    ],
    actions: [
      { label: "View Jobs", href: "/jobs" },
      { label: "View Analytics", href: "/analytics" },
    ],
  };
}

// Generate daily briefing
export function generateDailyBriefing(stats: {
  newJobs: number;
  strongMatches: number;
  pendingApplications: number;
  newResponses: number;
  interviews: number;
  topRole: string;
  actionRequired: number;
}): {
  greeting: string;
  summary: string;
  highlights: Array<{ icon: string; text: string; priority: "high" | "medium" | "low" }>;
  recommendations: string[];
} {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const highlights: Array<{ icon: string; text: string; priority: "high" | "medium" | "low" }> = [];

  if (stats.newResponses > 0) {
    highlights.push({ icon: "📩", text: `${stats.newResponses} new response${stats.newResponses > 1 ? "s" : ""} received`, priority: "high" });
  }
  if (stats.interviews > 0) {
    highlights.push({ icon: "🎤", text: `${stats.interviews} interview${stats.interviews > 1 ? "s" : ""} scheduled`, priority: "high" });
  }
  if (stats.actionRequired > 0) {
    highlights.push({ icon: "⚠️", text: `${stats.actionRequired} application${stats.actionRequired > 1 ? "s" : ""} need your action`, priority: "high" });
  }
  if (stats.strongMatches > 0) {
    highlights.push({ icon: "🔥", text: `${stats.strongMatches} strong match${stats.strongMatches > 1 ? "es" : ""} found`, priority: "medium" });
  }
  if (stats.newJobs > 0) {
    highlights.push({ icon: "💼", text: `${stats.newJobs} new job${stats.newJobs > 1 ? "s" : ""} discovered`, priority: "low" });
  }

  const recommendations: string[] = [];
  if (stats.strongMatches > 0) {
    recommendations.push(`Apply to ${Math.min(stats.strongMatches, 5)} top-matching jobs today`);
  }
  if (stats.topRole) {
    recommendations.push(`Focus on ${stats.topRole} roles - your strongest category`);
  }
  if (stats.pendingApplications > 10) {
    recommendations.push("Follow up on older applications with no response");
  }

  return {
    greeting,
    summary: highlights.length > 0 
      ? `${stats.strongMatches} strong matches found today. ${stats.newResponses > 0 ? `You have ${stats.newResponses} new response${stats.newResponses > 1 ? "s" : ""} to review.` : ""}`
      : "Your AI career agent is active and monitoring for opportunities.",
    highlights,
    recommendations: recommendations.length > 0 ? recommendations : ["Keep your profile updated", "Run a job scan to discover new opportunities"],
  };
}
