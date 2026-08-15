import { JobSourceAdapter } from "./adapter";
import { DemoJobSource } from "./demo-source";

// Registry of all available job source adapters
const adapters: Record<string, () => JobSourceAdapter> = {
  demo: () => new DemoJobSource(),
  // In production, add real adapters:
  // linkedin: () => new LinkedInAdapter(),
  // indeed: () => new IndeedAdapter(), 
  // internshala: () => new InternshalaAdapter(),
  // naukri: () => new NaukriAdapter(),
  // wellfound: () => new WellfoundAdapter(),
  // glassdoor: () => new GlassdoorAdapter(),
  // greenhouse: () => new GreenhouseAdapter(),
  // lever: () => new LeverAdapter(),
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

// Source definitions for UI display — includes both enabled and future sources
export const ALL_SOURCES = [
  { name: "demo", displayName: "Demo Source (Sample Data)", status: "connected" as const, supportsAutoApply: false, supportsMessaging: false },
  { name: "linkedin", displayName: "LinkedIn", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false },
  { name: "indeed", displayName: "Indeed", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false },
  { name: "internshala", displayName: "Internshala", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false },
  { name: "naukri", displayName: "Naukri", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false },
  { name: "wellfound", displayName: "Wellfound", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false },
  { name: "glassdoor", displayName: "Glassdoor", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false },
  { name: "greenhouse", displayName: "Greenhouse Boards", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false },
  { name: "lever", displayName: "Lever Boards", status: "assisted_only" as const, supportsAutoApply: false, supportsMessaging: false },
];
