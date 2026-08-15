"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import ScoreCircle from "@/components/ScoreCircle";
import { LoadingPage } from "@/components/LoadingState";

interface JobDetail {
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
    location: string | null;
    workMode: string | null;
    salary: string | null;
    salaryMin: number | null;
    experienceLevel: string | null;
    employmentType: string | null;
    description: string | null;
    responsibilities: string[] | null;
    requirements: string[] | null;
    preferredSkills: string[] | null;
    benefits: string[] | null;
    applicationProcess: string | null;
    url: string;
    companyUrl: string | null;
    applicationUrl: string | null;
    sourceName: string;
    postedAt: string | null;
    safetyScore: number | null;
    isVerified: boolean;
  };
  score: {
    fitScore: number;
    shortlistProbability: number;
    confidence: string;
    category: string;
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    projectRelevance: number;
    locationMatch: number;
    technologyMatch: number;
    roleMatch: number;
    salaryMatch: number;
    strengths: string[] | null;
    missingRequirements: string[] | null;
    explanation: string;
  } | null;
  application: {
    id: string;
    status: string;
    appliedAt: string | null;
    coverLetter: string | null;
    resumeVersion: string | null;
    mode: string | null;
  } | null;
}

function getCategoryBadge(category: string) {
  switch (category) {
    case "apply_immediately": return { label: "🔥 Apply Immediately", cls: "badge-fire" };
    case "strong_match": return { label: "🟢 Strong Match", cls: "badge-green" };
    case "possible_match": return { label: "🟡 Possible Match", cls: "badge-yellow" };
    default: return { label: "🔴 Low Match", cls: "badge-red" };
  }
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [appResult, setAppResult] = useState<{
    message: string;
    coverLetter?: string;
    applicationAnswers?: Array<{ question: string; answer: string }>;
    resumeVersion?: string;
    applicationUrl?: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApply() {
    setApplying(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, mode: "assisted" }),
      });
      const json = await res.json();
      if (res.ok) {
        setAppResult(json);
        // Refresh data
        const updated = await fetch(`/api/jobs/${id}`);
        setData(await updated.json());
      } else {
        setAppResult({ message: json.error || "Application failed" });
      }
    } catch (err) {
      setAppResult({ message: String(err) });
    } finally {
      setApplying(false);
    }
  }

  if (loading) return <LoadingPage message="Loading job details..." />;
  if (!data?.job) return <div className="text-center py-20 text-slate-400">Job not found</div>;

  const { job, score, application } = data;
  const badge = score ? getCategoryBadge(score.category) : null;

  const SCORE_BARS = score ? [
    { label: "Skills Match", value: score.skillsMatch, weight: "30%" },
    { label: "Experience Match", value: score.experienceMatch, weight: "15%" },
    { label: "Education Match", value: score.educationMatch, weight: "10%" },
    { label: "Project Relevance", value: score.projectRelevance, weight: "15%" },
    { label: "Location Match", value: score.locationMatch, weight: "5%" },
    { label: "Technology Match", value: score.technologyMatch, weight: "10%" },
    { label: "Role Match", value: score.roleMatch, weight: "10%" },
    { label: "Salary Match", value: score.salaryMatch, weight: "5%" },
  ] : [];

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/jobs" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
        ← Back to Jobs
      </Link>

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            {badge && <span className={`badge ${badge.cls} text-xs mb-2 inline-block`}>{badge.label}</span>}
            <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
            <p className="text-lg text-slate-300">{job.company}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
              {job.location && <span>📍 {job.location}</span>}
              {job.workMode && <span>🏢 {job.workMode}</span>}
              {job.salary && <span>💰 {job.salary}</span>}
              {job.experienceLevel && <span>📊 {job.experienceLevel}</span>}
              {job.employmentType && <span>📋 {job.employmentType}</span>}
              <span>🔗 {job.sourceName}</span>
            </div>
            {job.isVerified && (
              <div className="mt-2 text-xs text-emerald-400">✓ Verified Job Posting</div>
            )}
            {job.safetyScore && (
              <div className="mt-1 text-xs text-slate-500">Safety Score: {job.safetyScore}/100</div>
            )}
          </div>
          {score && (
            <div className="flex gap-4 shrink-0">
              <ScoreCircle score={Math.round(score.fitScore)} size={72} label="Fit Score" />
              <ScoreCircle score={Math.round(score.shortlistProbability)} size={72} label="Shortlist" colorClass="#8b5cf6" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-700/50">
          {!application ? (
            <button
              onClick={handleApply}
              disabled={applying}
              className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-50"
            >
              {applying ? "Preparing..." : "📝 Prepare Application"}
            </button>
          ) : (
            <span className="badge badge-blue text-sm px-4 py-2">
              ✓ Application: {application.status.replace(/_/g, " ")}
            </span>
          )}
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm px-6 py-2.5"
          >
            🔗 View on {job.sourceName}
          </a>
          {job.applicationUrl && (
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm px-6 py-2.5"
            >
              📤 Apply on Platform
            </a>
          )}
          {job.companyUrl && (
            <a
              href={job.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm px-6 py-2.5"
            >
              🏢 Company Page
            </a>
          )}
        </div>
      </div>

      {/* AI Shortlist Estimate */}
      {score && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-1">
            Estimated Shortlist Probability: {Math.round(score.shortlistProbability)}% — {score.confidence === "high" ? "High" : score.confidence === "medium" ? "Medium" : "Low"} Confidence
          </h3>
          <p className="text-[11px] text-slate-500 italic">
            AI estimate based on available job requirements and candidate information. Actual hiring decisions are controlled by the employer.
          </p>
        </div>
      )}

      {/* Fit Score Breakdown */}
      {score && SCORE_BARS.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">AI Fit Analysis</h3>
          <div className="space-y-3">
            {SCORE_BARS.map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{bar.label}</span>
                  <span className="text-slate-400">{Math.round(bar.value)}% (weight: {bar.weight})</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${bar.value}%`,
                      background: bar.value >= 80 ? "#10b981" : bar.value >= 60 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {score.strengths && score.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-emerald-400 mb-2">✅ Why you&apos;re a strong match</h4>
                <ul className="space-y-1">
                  {score.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-300">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {score.missingRequirements && score.missingRequirements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-amber-400 mb-2">⚠️ Missing Requirements</h4>
                <ul className="space-y-1">
                  {score.missingRequirements.map((m, i) => (
                    <li key={i} className="text-xs text-slate-300">• {m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Description */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-3">Job Description</h3>
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{job.description}</p>
      </div>

      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-3">Responsibilities</h3>
          <ul className="space-y-2">
            {job.responsibilities.map((r, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-blue-400 shrink-0">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-3">Requirements</h3>
          <ul className="space-y-2">
            {job.requirements.map((r, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-violet-400 shrink-0">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {job.preferredSkills && job.preferredSkills.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-3">Preferred Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.preferredSkills.map((s, i) => (
              <span key={i} className="px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-3">Benefits</h3>
          <div className="flex flex-wrap gap-2">
            {job.benefits.map((b, i) => (
              <span key={i} className="badge badge-green text-xs">{b}</span>
            ))}
          </div>
        </div>
      )}

      {/* Application Process */}
      {job.applicationProcess && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-3">Application Process</h3>
          <p className="text-sm text-slate-300">{job.applicationProcess}</p>
        </div>
      )}

      {/* Application Result */}
      {appResult && (
        <div className="glass-card p-6 border border-blue-500/30">
          <h3 className="text-base font-semibold text-white mb-3">📝 Application Prepared</h3>
          <p className="text-sm text-emerald-400 mb-4">{appResult.message}</p>

          {appResult.coverLetter && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Cover Letter</h4>
              <pre className="text-xs text-slate-400 bg-slate-900/50 p-4 rounded-lg whitespace-pre-wrap">{appResult.coverLetter}</pre>
            </div>
          )}

          {appResult.applicationAnswers && appResult.applicationAnswers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Application Answers</h4>
              <div className="space-y-3">
                {appResult.applicationAnswers.map((qa, i) => (
                  <div key={i} className="bg-slate-900/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-blue-400 mb-1">{qa.question}</p>
                    <p className="text-xs text-slate-300">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appResult.applicationUrl && (
            <a
              href={appResult.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2"
            >
              📤 Open Application Page
            </a>
          )}
        </div>
      )}
    </div>
  );
}
