/**
 * Findwork.dev Job Source
 * 
 * Findwork provides job listings for developers.
 * Limited free access available.
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";

interface FindworkJob {
  id: number;
  role: string;
  company_name: string;
  company_logo: string;
  location: string;
  remote: boolean;
  text: string;
  date_posted: string;
  url: string;
  keywords: string[];
  employment_type?: string;
}

interface FindworkResponse {
  results: FindworkJob[];
  count: number;
}

export class FindworkSource implements JobSourceAdapter {
  sourceName = "findwork";
  displayName = "Findwork.dev";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    try {
      let url = "https://findwork.dev/api/jobs/";
      const queryParams = new URLSearchParams();
      
      if (params.role) {
        queryParams.set("search", params.role);
      }
      if (params.location) {
        queryParams.set("location", params.location);
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "JobPilotAI/1.0",
        },
      });

      if (!response.ok) {
        console.error("Findwork API error:", response.status);
        return [];
      }

      const data: FindworkResponse = await response.json();
      const jobs = data.results || [];

      return jobs.slice(0, 50).map((job) => ({
        externalJobId: `findwork-${job.id}`,
        title: job.role,
        company: job.company_name || "Unknown Company",
        companyLogo: job.company_logo,
        location: job.location || "Not specified",
        workMode: job.remote ? "Remote" : "On-site",
        employmentType: job.employment_type || "Full-time",
        description: job.text?.slice(0, 2000),
        requirements: job.keywords || [],
        preferredSkills: job.keywords || [],
        url: job.url,
        applicationUrl: job.url,
        postedAt: job.date_posted ? new Date(job.date_posted) : new Date(),
        sourceName: "findwork",
      }));
    } catch (error) {
      console.error("Findwork fetch error:", error);
      return [];
    }
  }

  async getJobDetails(jobId: string): Promise<JobResult | null> {
    const jobs = await this.searchJobs({});
    return jobs.find((j) => j.externalJobId === jobId) || null;
  }

  getOriginalUrl(jobId: string): string {
    const id = jobId.replace("findwork-", "");
    return `https://findwork.dev/job/${id}`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch("https://findwork.dev/api/jobs/", {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
