/**
 * Job Deduplication Engine
 * 
 * Detects duplicate job postings based on:
 * - Normalized title
 * - Company name
 * - Location
 * - URL
 * - Description similarity
 */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string): number {
  const setA = new Set(normalize(a).split(" "));
  const setB = new Set(normalize(b).split(" "));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

interface DedupJob {
  title: string;
  company: string;
  location?: string | null;
  url: string;
  description?: string | null;
}

export function isDuplicate(newJob: DedupJob, existingJobs: DedupJob[]): boolean {
  for (const existing of existingJobs) {
    // Exact URL match
    if (normalize(newJob.url) === normalize(existing.url)) return true;

    // Same company + similar title
    const sameCompany = normalize(newJob.company) === normalize(existing.company);
    const titleSim = similarity(newJob.title, existing.title);

    if (sameCompany && titleSim > 0.8) return true;

    // Same company + same location + similar title
    if (
      sameCompany &&
      newJob.location &&
      existing.location &&
      normalize(newJob.location) === normalize(existing.location) &&
      titleSim > 0.6
    ) {
      return true;
    }

    // High description similarity
    if (
      newJob.description &&
      existing.description &&
      sameCompany &&
      similarity(newJob.description, existing.description) > 0.85
    ) {
      return true;
    }
  }

  return false;
}
