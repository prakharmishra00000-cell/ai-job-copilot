/**
 * India-Specific Job Sources
 * 
 * Aggregates jobs relevant to Indian job market.
 * Includes jobs from Internshala, Naukri region via aggregators.
 * No API key required!
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";

export class IndiaJobSource implements JobSourceAdapter {
  sourceName = "india";
  displayName = "India Jobs (Naukri/Internshala Region)";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    const results: JobResult[] = [];
    const query = params.role || "software developer";
    
    try {
      // Fetch from sources that have India jobs
      // Source 1: Arbeitnow (has some India remote jobs)
      const arbeitnowRes = await fetch("https://arbeitnow.com/api/job-board-api", {
        headers: { "User-Agent": "JobPilotAI/1.0" },
      });
      
      if (arbeitnowRes.ok) {
        const data = await arbeitnowRes.json();
        const jobs = (data.data || []).filter((j: { location?: string; remote?: boolean; title?: string }) =>
          j.location?.toLowerCase().includes("india") ||
          j.location?.toLowerCase().includes("asia") ||
          j.remote === true ||
          j.title?.toLowerCase().includes(query.toLowerCase())
        );
        
        for (const job of jobs.slice(0, 20)) {
          results.push({
            externalJobId: `india-arbeitnow-${job.slug}`,
            title: job.title,
            company: job.company_name || "Company",
            location: job.location || "India / Remote",
            workMode: job.remote ? "Remote" : "On-site",
            employmentType: job.job_types?.[0] || "Full-time",
            description: this.cleanHtml(job.description),
            requirements: job.tags || [],
            preferredSkills: job.tags || [],
            url: job.url,
            applicationUrl: job.url,
            postedAt: new Date(job.created_at * 1000),
            sourceName: "india",
          });
        }
      }
    } catch (err) {
      console.error("India source error:", err);
    }

    try {
      // Source 2: Findwork.dev (filter for India)
      const findworkRes = await fetch(
        `https://findwork.dev/api/jobs/?search=${encodeURIComponent(query)}&location=india`,
        { headers: { "User-Agent": "JobPilotAI/1.0" } }
      );
      
      if (findworkRes.ok) {
        const data = await findworkRes.json();
        const jobs = data.results || [];
        
        for (const job of jobs.slice(0, 15)) {
          results.push({
            externalJobId: `india-findwork-${job.id}`,
            title: job.role,
            company: job.company_name || "Company",
            companyLogo: job.company_logo,
            location: job.location || "India",
            workMode: job.remote ? "Remote" : "On-site",
            employmentType: job.employment_type || "Full-time",
            description: job.text?.slice(0, 2000),
            requirements: job.keywords || [],
            preferredSkills: job.keywords || [],
            url: job.url,
            applicationUrl: job.url,
            postedAt: job.date_posted ? new Date(job.date_posted) : new Date(),
            sourceName: "india",
          });
        }
      }
    } catch (err) {
      console.error("India Findwork error:", err);
    }

    // Add salary in INR context
    return results.map(job => ({
      ...job,
      salary: job.salary || "₹Competitive (Based on experience)",
      salaryCurrency: "INR",
    }));
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
    return `https://www.naukri.com/jobs-in-india`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
