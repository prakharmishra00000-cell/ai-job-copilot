import { JobSourceAdapter } from "./adapter";
import { DemoJobSource } from "./demo-source";
import { RemoteOKSource } from "./remoteok-source";
import { ArbeitnowSource } from "./arbeitnow-source";
import { JobicySource } from "./jobicy-source";
import { HimalayasSource } from "./himalayas-source";
import { FindworkSource } from "./findwork-source";
import { AdzunaSource } from "./adzuna-source";

// Registry of all available job source adapters
// These are REAL job sources with FREE APIs that work automatically!
const adapters: Record<string, () => JobSourceAdapter> = {
  // Real job sources with free APIs (no key required)
  remoteok: () => new RemoteOKSource(),
  arbeitnow: () => new ArbeitnowSource(),
  jobicy: () => new JobicySource(),
  himalayas: () => new HimalayasSource(),
  findwork: () => new FindworkSource(),
  
  // Sources requiring API keys (optional)
  adzuna: () => new AdzunaSource(),
  
  // Demo source for testing
  demo: () => new DemoJobSource(),
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

// Source definitions for UI display
export const ALL_SOURCES = [
  // Active real sources (free APIs)
  { name: "remoteok", displayName: "RemoteOK", status: "connected" as const, supportsAutoApply: false, supportsMessaging: false, description: "Remote tech jobs worldwide" },
  { name: "arbeitnow", displayName: "Arbeitnow", status: "connected" as const, supportsAutoApply: false, supportsMessaging: false, description: "European remote jobs" },
  { name: "jobicy", displayName: "Jobicy", status: "connected" as const, supportsAutoApply: false, supportsMessaging: false, description: "Remote jobs with salary info" },
  { name: "himalayas", displayName: "Himalayas", status: "connected" as const, supportsAutoApply: false, supportsMessaging: false, description: "Curated remote positions" },
  { name: "findwork", displayName: "Findwork.dev", status: "connected" as const, supportsAutoApply: false, supportsMessaging: false, description: "Developer-focused jobs" },
  
  // Optional sources (need API keys)
  { name: "adzuna", displayName: "Adzuna", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false, description: "Multi-source aggregator (needs API key)" },
  
  // Platforms without public APIs (assisted mode only)
  { name: "linkedin", displayName: "LinkedIn", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false, description: "No public API - use directly" },
  { name: "indeed", displayName: "Indeed", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false, description: "No public API - use directly" },
  { name: "glassdoor", displayName: "Glassdoor", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false, description: "No public API - use directly" },
  { name: "naukri", displayName: "Naukri", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false, description: "No public API - use directly" },
  { name: "internshala", displayName: "Internshala", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false, description: "No public API - use directly" },
];

// Get only active sources that can fetch jobs automatically
export function getActiveSources(): JobSourceAdapter[] {
  return [
    new RemoteOKSource(),
    new ArbeitnowSource(),
    new JobicySource(),
    new HimalayasSource(),
    new FindworkSource(),
  ];
}
