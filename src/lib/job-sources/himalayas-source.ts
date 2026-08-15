/**
 * Himalayas Job Source
 * 
 * Himalayas provides remote job listings with free API access.
 * API: https://himalayas.app/jobs/api
 * No API key required!
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";

interface HimalayasJob {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  excerpt: string;
  description: string;
  applicationLink: string;
  categories: string[];
  seniority: string;
  pubDate: string;
  minSalary?: number;
  maxSalary?: number;
}

interface HimalayasResponse {
  jobs: HimalayasJob[];
  offset: number;
  limit: number;
}

export class HimalayasSource implements JobSourceAdapter {
  sourceName = "himalayas";
  displayName = "Himalayas";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    try {
      const response = await fetch("https://himalayas.app/jobs/api?limit=50", {
        headers: {
          "Accept": "application/json",
          "User-Agent": "JobPilotAI/1.0",
        },
      });

      if (!response.ok) {
        console.error("Himalayas API error:", response.status);
        return [];
      }

      const data: HimalayasResponse = await response.json();
      const jobs = data.jobs || [];

      return jobs
        .filter((job) => {
          if (params.role) {
            const roleWords = params.role.toLowerCase().split(/\s+/);
            const title = job.title.toLowerCase();
            const cats = (job.categories || []).join(" ").toLowerCase();
            return roleWords.some(w => title.includes(w) || cats.includes(w));
          }
          return true;
        })
        .map((job) => ({
          externalJobId: `himalayas-${job.id}`,
          title: job.title,
          company: job.companyName || "Unknown Company",
          companyLogo: job.companyLogo,
          location: job.location || "Remote",
          workMode: "Remote",
          salary: job.minSalary && job.maxSalary
            ? `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()}`
            : undefined,
          salaryMin: job.minSalary,
          salaryMax: job.maxSalary,
          salaryCurrency: "USD",
          experienceLevel: job.seniority || "Not specified",
          employmentType: "Full-time",
          description: this.cleanDescription(job.description || job.excerpt),
          requirements: job.categories || [],
          preferredSkills: job.categories || [],
          url: job.applicationLink,
          applicationUrl: job.applicationLink,
          postedAt: job.pubDate ? new Date(job.pubDate) : new Date(),
          sourceName: "himalayas",
        }));
    } catch (error) {
      console.error("Himalayas fetch error:", error);
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
    return `https://himalayas.app/jobs/${jobId.replace("himalayas-", "")}`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch("https://himalayas.app/jobs/api?limit=1");
      return response.ok;
    } catch {
      return false;
    }
  }
}
