/**
 * Jobicy Job Source
 * 
 * Jobicy provides remote job listings with a free RSS/JSON feed.
 * API: https://jobicy.com/api/v2/remote-jobs
 * No API key required!
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  jobIndustry: string[];
  jobType: string[];
  jobGeo: string;
  jobLevel: string;
  jobExcerpt: string;
  jobDescription: string;
  pubDate: string;
  annualSalaryMin?: number;
  annualSalaryMax?: number;
  salaryCurrency?: string;
}

interface JobicyResponse {
  jobs: JobicyJob[];
  jobCount: number;
}

export class JobicySource implements JobSourceAdapter {
  sourceName = "jobicy";
  displayName = "Jobicy";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    try {
      let url = "https://jobicy.com/api/v2/remote-jobs?count=50";
      
      if (params.role) {
        // Jobicy supports industry tags
        const tag = this.mapRoleToTag(params.role);
        if (tag) url += `&tag=${tag}`;
      }

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "JobPilotAI/1.0",
        },
      });

      if (!response.ok) {
        console.error("Jobicy API error:", response.status);
        return [];
      }

      const data: JobicyResponse = await response.json();
      const jobs = data.jobs || [];

      return jobs.map((job) => ({
        externalJobId: `jobicy-${job.id}`,
        title: job.jobTitle,
        company: job.companyName || "Unknown Company",
        companyLogo: job.companyLogo,
        location: job.jobGeo || "Remote Worldwide",
        workMode: "Remote",
        salary: job.annualSalaryMin && job.annualSalaryMax
          ? `${job.salaryCurrency || "$"}${job.annualSalaryMin.toLocaleString()} - ${job.salaryCurrency || "$"}${job.annualSalaryMax.toLocaleString()}`
          : undefined,
        salaryMin: job.annualSalaryMin,
        salaryMax: job.annualSalaryMax,
        salaryCurrency: job.salaryCurrency || "USD",
        experienceLevel: job.jobLevel || "Not specified",
        employmentType: job.jobType?.[0] || "Full-time",
        description: this.cleanDescription(job.jobDescription || job.jobExcerpt),
        requirements: job.jobIndustry || [],
        preferredSkills: job.jobIndustry || [],
        url: job.url,
        applicationUrl: job.url,
        postedAt: job.pubDate ? new Date(job.pubDate) : new Date(),
        sourceName: "jobicy",
      }));
    } catch (error) {
      console.error("Jobicy fetch error:", error);
      return [];
    }
  }

  private mapRoleToTag(role: string): string {
    const lower = role.toLowerCase();
    if (lower.includes("frontend") || lower.includes("react") || lower.includes("vue")) return "frontend";
    if (lower.includes("backend") || lower.includes("node") || lower.includes("python")) return "backend";
    if (lower.includes("fullstack") || lower.includes("full stack")) return "full-stack";
    if (lower.includes("devops") || lower.includes("cloud")) return "devops";
    if (lower.includes("data") || lower.includes("ml") || lower.includes("ai")) return "data";
    if (lower.includes("mobile") || lower.includes("ios") || lower.includes("android")) return "mobile";
    if (lower.includes("design") || lower.includes("ui") || lower.includes("ux")) return "design";
    return "";
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
    return `https://jobicy.com/jobs/${jobId.replace("jobicy-", "")}`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch("https://jobicy.com/api/v2/remote-jobs?count=1");
      return response.ok;
    } catch {
      return false;
    }
  }
}
