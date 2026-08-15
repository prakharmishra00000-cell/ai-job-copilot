import { JobResult, JobSearchParams } from "@/lib/types";

export interface JobSourceAdapter {
  sourceName: string;
  displayName: string;
  supportsAutoApply: boolean;
  supportsMessaging: boolean;

  searchJobs(params: JobSearchParams): Promise<JobResult[]>;
  getJobDetails(jobId: string): Promise<JobResult | null>;
  getOriginalUrl(jobId: string): string;
  checkApplicationStatus(applicationId: string): Promise<string | null>;
  isAvailable(): Promise<boolean>;
}

// Generate related role queries for intelligent search
export function expandRoleQuery(role: string): string[] {
  const base = role.toLowerCase();
  const variations: string[] = [role];

  const keywords = base.split(/\s+/);

  if (base.includes("full stack") || base.includes("fullstack")) {
    variations.push(
      role.replace(/full\s*stack/i, "Full Stack"),
      role.replace(/full\s*stack/i, "Fullstack"),
      `Software Engineer ${keywords.filter((k) => !["full", "stack", "fullstack", "developer", "engineer"].includes(k)).join(" ")}`.trim(),
      `Web Developer ${keywords.filter((k) => !["full", "stack", "fullstack", "developer", "engineer", "web"].includes(k)).join(" ")}`.trim()
    );
  }

  if (base.includes("ai")) {
    variations.push(
      role.replace(/ai/i, "Machine Learning"),
      role.replace(/ai/i, "Generative AI"),
      `${role} Engineer`,
    );
  }

  if (base.includes("frontend") || base.includes("front-end")) {
    variations.push(
      role.replace(/front[\s-]?end/i, "React"),
      role.replace(/front[\s-]?end/i, "UI"),
    );
  }

  if (base.includes("backend") || base.includes("back-end")) {
    variations.push(
      role.replace(/back[\s-]?end/i, "Node.js"),
      role.replace(/back[\s-]?end/i, "Server"),
    );
  }

  return [...new Set(variations)].slice(0, 5);
}
