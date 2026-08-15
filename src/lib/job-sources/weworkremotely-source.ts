/**
 * We Work Remotely Job Source
 * 
 * One of the largest remote job boards.
 * Uses their public RSS feed - no API key required!
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";

export class WeWorkRemotelySource implements JobSourceAdapter {
  sourceName = "weworkremotely";
  displayName = "We Work Remotely";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    try {
      // WWR has a JSON feed
      const response = await fetch(
        "https://weworkremotely.com/categories/remote-programming-jobs.json",
        { headers: { "User-Agent": "JobPilotAI/1.0" } }
      );

      if (!response.ok) {
        // Try alternative endpoint
        return this.fetchFromAlternative(params);
      }

      const jobs = await response.json();
      
      return (Array.isArray(jobs) ? jobs : []).slice(0, 30).map((job: {
        id: string;
        title: string;
        company_name: string;
        company_logo_url?: string;
        region: string;
        category: string;
        description: string;
        url: string;
        published_at: string;
      }) => ({
        externalJobId: `wwr-${job.id}`,
        title: job.title,
        company: job.company_name,
        companyLogo: job.company_logo_url,
        location: job.region || "Remote Worldwide",
        workMode: "Remote",
        employmentType: "Full-time",
        description: this.cleanHtml(job.description),
        requirements: [job.category],
        preferredSkills: [job.category],
        url: job.url,
        applicationUrl: job.url,
        postedAt: job.published_at ? new Date(job.published_at) : new Date(),
        sourceName: "weworkremotely",
      }));
    } catch (error) {
      console.error("WWR fetch error:", error);
      return this.fetchFromAlternative(params);
    }
  }

  private async fetchFromAlternative(params: JobSearchParams): Promise<JobResult[]> {
    // Fallback: use Jobicy which has similar remote jobs
    try {
      const response = await fetch("https://jobicy.com/api/v2/remote-jobs?count=30&tag=dev", {
        headers: { "User-Agent": "JobPilotAI/1.0" },
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return (data.jobs || []).slice(0, 15).map((job: {
        id: number;
        jobTitle: string;
        companyName: string;
        companyLogo?: string;
        jobGeo?: string;
        jobDescription?: string;
        jobExcerpt?: string;
        url: string;
        pubDate?: string;
        jobIndustry?: string[];
      }) => ({
        externalJobId: `wwr-alt-${job.id}`,
        title: job.jobTitle,
        company: job.companyName,
        companyLogo: job.companyLogo,
        location: job.jobGeo || "Remote Worldwide",
        workMode: "Remote",
        employmentType: "Full-time",
        description: this.cleanHtml(job.jobDescription || job.jobExcerpt || ""),
        requirements: job.jobIndustry || [],
        preferredSkills: job.jobIndustry || [],
        url: job.url,
        applicationUrl: job.url,
        postedAt: job.pubDate ? new Date(job.pubDate) : new Date(),
        sourceName: "weworkremotely",
      }));
    } catch {
      return [];
    }
  }

  private cleanHtml(html: string): string {
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
    return null;
  }

  getOriginalUrl(jobId: string): string {
    return `https://weworkremotely.com/remote-jobs/${jobId.replace("wwr-", "")}`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
