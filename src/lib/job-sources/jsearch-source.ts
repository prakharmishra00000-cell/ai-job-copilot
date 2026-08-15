/**
 * JSearch API Source (RapidAPI)
 * 
 * Aggregates jobs from: LinkedIn, Indeed, Glassdoor, ZipRecruiter, and more
 * FREE tier: 200 requests/month
 * 
 * Get FREE API key at: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 * (Optional - app works without it, just fewer sources)
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_description: string;
  job_is_remote: boolean;
  job_employment_type: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_posted_at_datetime_utc: string;
  job_apply_link: string;
  job_required_skills?: string[];
  job_experience_in_place_of_education?: boolean;
  employer_website?: string;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
}

export class JSearchSource implements JobSourceAdapter {
  sourceName = "jsearch";
  displayName = "LinkedIn/Indeed/Glassdoor (via JSearch)";
  supportsAutoApply = false;
  supportsMessaging = false;

  private apiKey = process.env.RAPIDAPI_KEY || process.env.JSEARCH_API_KEY;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    if (!this.apiKey) {
      // Will use fallback sources instead
      return [];
    }

    try {
      const query = params.role || "software developer";
      const location = params.location || "India";
      
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query + " in " + location)}&num_pages=2`;

      const response = await fetch(url, {
        headers: {
          "X-RapidAPI-Key": this.apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      if (!response.ok) {
        console.error("JSearch API error:", response.status);
        return [];
      }

      const data = await response.json();
      const jobs: JSearchJob[] = data.data || [];

      return jobs.map((job) => ({
        externalJobId: `jsearch-${job.job_id}`,
        title: job.job_title,
        company: job.employer_name,
        companyLogo: job.employer_logo,
        location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ") || "Not specified",
        workMode: job.job_is_remote ? "Remote" : "On-site",
        salary: job.job_min_salary && job.job_max_salary
          ? `${job.job_salary_currency || "$"}${job.job_min_salary.toLocaleString()} - ${job.job_salary_currency || "$"}${job.job_max_salary.toLocaleString()}`
          : undefined,
        salaryMin: job.job_min_salary,
        salaryMax: job.job_max_salary,
        salaryCurrency: job.job_salary_currency || "USD",
        employmentType: job.job_employment_type || "Full-time",
        description: job.job_description?.slice(0, 3000),
        requirements: job.job_highlights?.Qualifications || job.job_required_skills || [],
        preferredSkills: job.job_required_skills || [],
        benefits: job.job_highlights?.Benefits,
        responsibilities: job.job_highlights?.Responsibilities,
        url: job.job_apply_link,
        applicationUrl: job.job_apply_link,
        companyUrl: job.employer_website,
        postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date(),
        sourceName: "jsearch",
      }));
    } catch (error) {
      console.error("JSearch fetch error:", error);
      return [];
    }
  }

  async getJobDetails(jobId: string): Promise<JobResult | null> {
    return null;
  }

  getOriginalUrl(jobId: string): string {
    return `https://www.linkedin.com/jobs/search/?keywords=${jobId}`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }
}
