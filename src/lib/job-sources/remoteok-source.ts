/**
 * RemoteOK Job Source
 * 
 * RemoteOK provides a free public API for remote job listings.
 * API: https://remoteok.com/api
 * No API key required!
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";

interface RemoteOKJob {
  id: string;
  slug: string;
  company: string;
  company_logo: string;
  position: string;
  tags: string[];
  description: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  date: string;
  url: string;
}

export class RemoteOKSource implements JobSourceAdapter {
  sourceName = "remoteok";
  displayName = "RemoteOK";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    try {
      // RemoteOK API - free and public
      const response = await fetch("https://remoteok.com/api?tag=dev", {
        headers: {
          "User-Agent": "JobPilotAI/1.0 (job search aggregator)",
        },
      });

      if (!response.ok) {
        console.error("RemoteOK API error:", response.status);
        return [];
      }

      const data: RemoteOKJob[] = await response.json();
      
      // First item is metadata, skip it
      const jobs = Array.isArray(data) ? data.slice(1) : [];
      
      return jobs
        .filter((job) => {
          if (!job.position) return false;
          if (params.role) {
            const roleWords = params.role.toLowerCase().split(/\s+/);
            const title = job.position.toLowerCase();
            const tags = (job.tags || []).join(" ").toLowerCase();
            return roleWords.some(w => title.includes(w) || tags.includes(w));
          }
          return true;
        })
        .slice(0, 50)
        .map((job) => ({
          externalJobId: `remoteok-${job.id || job.slug}`,
          title: job.position,
          company: job.company || "Unknown Company",
          companyLogo: job.company_logo,
          location: job.location || "Remote",
          workMode: "Remote",
          salary: job.salary_min && job.salary_max 
            ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
            : undefined,
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          salaryCurrency: "USD",
          experienceLevel: this.inferExperience(job.position),
          employmentType: "Full-time",
          description: this.cleanDescription(job.description),
          requirements: job.tags || [],
          preferredSkills: job.tags || [],
          url: job.url || `https://remoteok.com/l/${job.slug}`,
          applicationUrl: job.url || `https://remoteok.com/l/${job.slug}`,
          postedAt: job.date ? new Date(job.date) : new Date(),
          sourceName: "remoteok",
        }));
    } catch (error) {
      console.error("RemoteOK fetch error:", error);
      return [];
    }
  }

  private cleanDescription(html: string): string {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);
  }

  private inferExperience(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes("senior") || lower.includes("sr.") || lower.includes("lead")) return "Senior";
    if (lower.includes("junior") || lower.includes("jr.") || lower.includes("entry")) return "Entry Level";
    if (lower.includes("intern")) return "Internship";
    return "Mid Level";
  }

  async getJobDetails(jobId: string): Promise<JobResult | null> {
    const jobs = await this.searchJobs({});
    return jobs.find((j) => j.externalJobId === jobId) || null;
  }

  getOriginalUrl(jobId: string): string {
    const slug = jobId.replace("remoteok-", "");
    return `https://remoteok.com/l/${slug}`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch("https://remoteok.com/api", {
        method: "HEAD",
        headers: { "User-Agent": "JobPilotAI/1.0" },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
