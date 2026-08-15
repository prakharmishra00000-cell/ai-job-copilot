/**
 * Arbeitnow Job Source
 * 
 * Arbeitnow provides a free public API for job listings.
 * API: https://arbeitnow.com/api
 * No API key required!
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
  links: { next?: string };
}

export class ArbeitnowSource implements JobSourceAdapter {
  sourceName = "arbeitnow";
  displayName = "Arbeitnow";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    try {
      const response = await fetch("https://arbeitnow.com/api/job-board-api", {
        headers: {
          "Accept": "application/json",
          "User-Agent": "JobPilotAI/1.0",
        },
      });

      if (!response.ok) {
        console.error("Arbeitnow API error:", response.status);
        return [];
      }

      const data: ArbeitnowResponse = await response.json();
      const jobs = data.data || [];

      return jobs
        .filter((job) => {
          if (params.role) {
            const roleWords = params.role.toLowerCase().split(/\s+/);
            const title = job.title.toLowerCase();
            const tags = (job.tags || []).join(" ").toLowerCase();
            return roleWords.some(w => title.includes(w) || tags.includes(w));
          }
          return true;
        })
        .slice(0, 50)
        .map((job) => ({
          externalJobId: `arbeitnow-${job.slug}`,
          title: job.title,
          company: job.company_name || "Unknown Company",
          location: job.location || "Not specified",
          workMode: job.remote ? "Remote" : "On-site",
          employmentType: job.job_types?.[0] || "Full-time",
          description: this.cleanDescription(job.description),
          requirements: job.tags || [],
          preferredSkills: job.tags || [],
          url: job.url,
          applicationUrl: job.url,
          postedAt: new Date(job.created_at * 1000),
          sourceName: "arbeitnow",
        }));
    } catch (error) {
      console.error("Arbeitnow fetch error:", error);
      return [];
    }
  }

  private cleanDescription(html: string): string {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);
  }

  async getJobDetails(jobId: string): Promise<JobResult | null> {
    const jobs = await this.searchJobs({});
    return jobs.find((j) => j.externalJobId === jobId) || null;
  }

  getOriginalUrl(jobId: string): string {
    const slug = jobId.replace("arbeitnow-", "");
    return `https://arbeitnow.com/jobs/${slug}`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch("https://arbeitnow.com/api/job-board-api", {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
