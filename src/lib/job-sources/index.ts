import { JobSourceAdapter } from "./adapter";
import { RemoteOKSource } from "./remoteok-source";
import { ArbeitnowSource } from "./arbeitnow-source";
import { JobicySource } from "./jobicy-source";
import { HimalayasSource } from "./himalayas-source";
import { FindworkSource } from "./findwork-source";
import { InternshipSource } from "./internship-source";
import { IndiaJobSource } from "./india-source";
import { WeWorkRemotelySource } from "./weworkremotely-source";
import { LinkedInRSSSource } from "./linkedin-rss-source";
import { JSearchSource } from "./jsearch-source";
import { AdzunaSource } from "./adzuna-source";

/**
 * ALL JOB SOURCES - Automatically connected!
 * No manual setup required.
 * 
 * FREE Sources (no API key):
 * - RemoteOK, Jobicy, Himalayas, Findwork, Arbeitnow
 * - We Work Remotely, LinkedIn (via aggregators)
 * - Internship aggregator, India jobs
 * 
 * Optional (API key for more jobs):
 * - JSearch (LinkedIn/Indeed/Glassdoor)
 * - Adzuna (multi-source)
 */

// All available adapters
const adapters: Record<string, () => JobSourceAdapter> = {
  // FREE - No API key required
  remoteok: () => new RemoteOKSource(),
  jobicy: () => new JobicySource(),
  himalayas: () => new HimalayasSource(),
  findwork: () => new FindworkSource(),
  arbeitnow: () => new ArbeitnowSource(),
  weworkremotely: () => new WeWorkRemotelySource(),
  linkedin: () => new LinkedInRSSSource(),
  internships: () => new InternshipSource(),
  india: () => new IndiaJobSource(),
  
  // Optional - API key for more sources
  jsearch: () => new JSearchSource(),
  adzuna: () => new AdzunaSource(),
};

export function getAdapter(sourceName: string): JobSourceAdapter | null {
  const factory = adapters[sourceName];
  return factory ? factory() : null;
}

export function getAllAdapters(): JobSourceAdapter[] {
  return Object.values(adapters).map((f) => f());
}

export function getAdapterNames(): string[] {
  return Object.keys(adapters);
}

// Get ONLY free sources that work without API keys
export function getActiveSources(): JobSourceAdapter[] {
  return [
    new RemoteOKSource(),
    new JobicySource(),
    new HimalayasSource(),
    new FindworkSource(),
    new ArbeitnowSource(),
    new WeWorkRemotelySource(),
    new LinkedInRSSSource(),
    new InternshipSource(),
    new IndiaJobSource(),
  ];
}

// Get internship-specific sources
export function getInternshipSources(): JobSourceAdapter[] {
  return [
    new InternshipSource(),
    new RemoteOKSource(), // Also has internships
  ];
}

// Get India-specific sources
export function getIndiaSources(): JobSourceAdapter[] {
  return [
    new IndiaJobSource(),
    new RemoteOKSource(),
    new JobicySource(),
  ];
}

// Source definitions for UI
export const ALL_SOURCES = [
  // Active FREE sources
  { name: "remoteok", displayName: "RemoteOK", status: "connected" as const, description: "100+ remote tech jobs daily" },
  { name: "jobicy", displayName: "Jobicy", status: "connected" as const, description: "Remote jobs with salary info" },
  { name: "himalayas", displayName: "Himalayas", status: "connected" as const, description: "Curated remote positions" },
  { name: "findwork", displayName: "Findwork.dev", status: "connected" as const, description: "Developer-focused jobs" },
  { name: "arbeitnow", displayName: "Arbeitnow", status: "connected" as const, description: "European & global jobs" },
  { name: "weworkremotely", displayName: "We Work Remotely", status: "connected" as const, description: "Top remote job board" },
  { name: "linkedin", displayName: "LinkedIn Jobs", status: "connected" as const, description: "Via job aggregators" },
  { name: "internships", displayName: "Internships Hub", status: "connected" as const, description: "Entry-level & intern positions" },
  { name: "india", displayName: "India Jobs", status: "connected" as const, description: "India-focused opportunities" },
  
  // Platforms shown as "Apply Direct" (no public API)
  { name: "indeed", displayName: "Indeed", status: "assisted_only" as const, description: "Apply directly on Indeed" },
  { name: "glassdoor", displayName: "Glassdoor", status: "assisted_only" as const, description: "Apply directly on Glassdoor" },
  { name: "naukri", displayName: "Naukri", status: "assisted_only" as const, description: "Apply directly on Naukri" },
  { name: "internshala", displayName: "Internshala", status: "assisted_only" as const, description: "Apply directly on Internshala" },
  { name: "wellfound", displayName: "Wellfound", status: "assisted_only" as const, description: "Apply directly on Wellfound" },
  { name: "monster", displayName: "Monster", status: "assisted_only" as const, description: "Apply directly on Monster" },
  { name: "ziprecruiter", displayName: "ZipRecruiter", status: "assisted_only" as const, description: "Apply directly on ZipRecruiter" },
];

// Platform direct links for "Apply Direct" buttons
export const PLATFORM_LINKS = {
  linkedin: "https://www.linkedin.com/jobs/",
  indeed: "https://www.indeed.com/",
  glassdoor: "https://www.glassdoor.com/Job/",
  naukri: "https://www.naukri.com/",
  internshala: "https://internshala.com/internships/",
  wellfound: "https://wellfound.com/jobs",
  monster: "https://www.monster.com/",
  ziprecruiter: "https://www.ziprecruiter.com/",
};
