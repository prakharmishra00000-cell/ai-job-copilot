/**
 * Internship-Specific Job Source
 * 
 * Aggregates internships from multiple free sources.
 * Filters for internship positions specifically.
 * No API key required!
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";

export class InternshipSource implements JobSourceAdapter {
  sourceName = "internships";
  displayName = "Internships (All Sources)";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    const results: JobResult[] = [];
    
    try {
      // Source 1: RemoteOK internships
      const remoteokRes = await fetch("https://remoteok.com/api?tag=internship", {
        headers: { "User-Agent": "JobPilotAI/1.0" },
      });
      
      if (remoteokRes.ok) {
        const data = await remoteokRes.json();
        const jobs = Array.isArray(data) ? data.slice(1) : [];
        
        for (const job of jobs.slice(0, 20)) {
          if (!job.position) continue;
          results.push({
            externalJobId: `intern-remoteok-${job.id || job.slug}`,
            title: job.position,
            company: job.company || "Unknown Company",
            companyLogo: job.company_logo,
            location: job.location || "Remote",
            workMode: "Remote",
            salary: job.salary_min && job.salary_max
              ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
              : "Stipend Available",
            employmentType: "Internship",
            experienceLevel: "Entry Level / Student",
            description: this.cleanHtml(job.description),
            requirements: job.tags || [],
            preferredSkills: job.tags || [],
            url: job.url || `https://remoteok.com/l/${job.slug}`,
            applicationUrl: job.url || `https://remoteok.com/l/${job.slug}`,
            postedAt: job.date ? new Date(job.date) : new Date(),
            sourceName: "internships",
          });
        }
      }
    } catch (err) {
      console.error("Internship source 1 error:", err);
    }

    try {
      // Source 2: Jobicy internships/junior roles
      const jobicyRes = await fetch("https://jobicy.com/api/v2/remote-jobs?count=30", {
        headers: { "User-Agent": "JobPilotAI/1.0" },
      });
      
      if (jobicyRes.ok) {
        const data = await jobicyRes.json();
        const jobs = (data.jobs || []).filter((j: { jobLevel?: string; jobTitle?: string }) => 
          j.jobLevel?.toLowerCase().includes("entry") ||
          j.jobLevel?.toLowerCase().includes("junior") ||
          j.jobTitle?.toLowerCase().includes("intern") ||
          j.jobTitle?.toLowerCase().includes("trainee") ||
          j.jobTitle?.toLowerCase().includes("graduate") ||
          j.jobTitle?.toLowerCase().includes("fresher")
        );
        
        for (const job of jobs.slice(0, 15)) {
          results.push({
            externalJobId: `intern-jobicy-${job.id}`,
            title: job.jobTitle + " (Internship/Entry Level)",
            company: job.companyName,
            companyLogo: job.companyLogo,
            location: job.jobGeo || "Remote Worldwide",
            workMode: "Remote",
            salary: job.annualSalaryMin 
              ? `$${job.annualSalaryMin.toLocaleString()}+ per year`
              : "Competitive Stipend",
            employmentType: "Internship",
            experienceLevel: job.jobLevel || "Entry Level",
            description: this.cleanHtml(job.jobDescription || job.jobExcerpt),
            requirements: job.jobIndustry || [],
            preferredSkills: job.jobIndustry || [],
            url: job.url,
            applicationUrl: job.url,
            postedAt: job.pubDate ? new Date(job.pubDate) : new Date(),
            sourceName: "internships",
          });
        }
      }
    } catch (err) {
      console.error("Internship source 2 error:", err);
    }

    try {
      // Source 3: Himalayas entry-level
      const himalayasRes = await fetch("https://himalayas.app/jobs/api?limit=30", {
        headers: { "User-Agent": "JobPilotAI/1.0" },
      });
      
      if (himalayasRes.ok) {
        const data = await himalayasRes.json();
        const jobs = (data.jobs || []).filter((j: { seniority?: string; title?: string }) =>
          j.seniority?.toLowerCase().includes("entry") ||
          j.seniority?.toLowerCase().includes("junior") ||
          j.title?.toLowerCase().includes("intern") ||
          j.title?.toLowerCase().includes("trainee") ||
          j.title?.toLowerCase().includes("associate")
        );
        
        for (const job of jobs.slice(0, 15)) {
          results.push({
            externalJobId: `intern-himalayas-${job.id}`,
            title: job.title,
            company: job.companyName,
            companyLogo: job.companyLogo,
            location: job.location || "Remote",
            workMode: "Remote",
            salary: job.minSalary ? `$${job.minSalary.toLocaleString()}+` : "Stipend Available",
            employmentType: "Internship",
            experienceLevel: job.seniority || "Entry Level",
            description: this.cleanHtml(job.description || job.excerpt),
            requirements: job.categories || [],
            preferredSkills: job.categories || [],
            url: job.applicationLink,
            applicationUrl: job.applicationLink,
            postedAt: job.pubDate ? new Date(job.pubDate) : new Date(),
            sourceName: "internships",
          });
        }
      }
    } catch (err) {
      console.error("Internship source 3 error:", err);
    }

    // Add graduation year tags based on current date
    const currentYear = new Date().getFullYear();
    return results.map(job => ({
      ...job,
      // Tag with target graduation years
      benefits: [
        ...(job.benefits || []),
        `Ideal for: ${currentYear} - ${currentYear + 4} graduates`
      ],
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
    return `https://www.google.com/search?q=${encodeURIComponent(jobId + " internship")}`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
