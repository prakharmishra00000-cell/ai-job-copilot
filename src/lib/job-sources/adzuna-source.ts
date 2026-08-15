/**
 * Adzuna Job Source
 * 
 * Adzuna aggregates jobs from multiple sources.
 * Uses free API tier when available.
 * API: https://developer.adzuna.com/
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";

interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  created: string;
  category: { label: string; tag: string };
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

export class AdzunaSource implements JobSourceAdapter {
  sourceName = "adzuna";
  displayName = "Adzuna";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    // If no API keys, return empty (Adzuna requires registration)
    if (!appId || !appKey) {
      console.log("Adzuna API keys not configured, skipping...");
      return [];
    }

    try {
      const country = params.location?.toLowerCase().includes("india") ? "in" : "us";
      const query = encodeURIComponent(params.role || "developer");
      
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${query}`;

      const response = await fetch(url, {
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) {
        console.error("Adzuna API error:", response.status);
        return [];
      }

      const data: AdzunaResponse = await response.json();
      const jobs = data.results || [];

      return jobs.map((job) => ({
        externalJobId: `adzuna-${job.id}`,
        title: job.title,
        company: job.company?.display_name || "Unknown Company",
        location: job.location?.display_name || "Not specified",
        workMode: this.inferWorkMode(job.title, job.description),
        salary: job.salary_min && job.salary_max
          ? `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(job.salary_max).toLocaleString()}`
          : undefined,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        employmentType: job.contract_type || "Full-time",
        description: job.description?.slice(0, 2000),
        requirements: [job.category?.label].filter(Boolean) as string[],
        preferredSkills: [job.category?.label].filter(Boolean) as string[],
        url: job.redirect_url,
        applicationUrl: job.redirect_url,
        postedAt: job.created ? new Date(job.created) : new Date(),
        sourceName: "adzuna",
      }));
    } catch (error) {
      console.error("Adzuna fetch error:", error);
      return [];
    }
  }

  private inferWorkMode(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes("remote")) return "Remote";
    if (text.includes("hybrid")) return "Hybrid";
    return "On-site";
  }

  async getJobDetails(jobId: string): Promise<JobResult | null> {
    const jobs = await this.searchJobs({});
    return jobs.find((j) => j.externalJobId === jobId) || null;
  }

  getOriginalUrl(jobId: string): string {
    return `https://www.adzuna.com/details/${jobId.replace("adzuna-", "")}`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    return !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
  }
}
