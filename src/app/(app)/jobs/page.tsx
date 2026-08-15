"use client";

import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import { LoadingPage, EmptyState, SkeletonCard } from "@/components/LoadingState";

interface JobWithScore {
  job: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    workMode: string | null;
    salary: string | null;
    sourceName: string;
    postedAt: string | null;
    preferredSkills: string[] | null;
    url: string;
  };
  score: {
    fitScore: number;
    shortlistProbability: number;
    confidence: string;
    category: string;
    strengths: string[] | null;
    missingRequirements: string[] | null;
  } | null;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [total, setTotal] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({
    apply_immediately: 0,
    strong_match: 0,
    possible_match: 0,
    low_match: 0,
  });
  const [filter, setFilter] = useState<string>("");
  const [searchRole, setSearchRole] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set("category", filter);
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const json = await res.json();
      setJobs(json.jobs || []);
      setTotal(json.total || 0);
      if (json.categoryCounts) setCategoryCounts(json.categoryCounts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function runSearch() {
    setScanning(true);
    try {
      const body: Record<string, string> = {};
      if (searchRole) body.role = searchRole;
      await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  }

  const categories = [
    { key: "", label: `All (${total})` },
    { key: "apply_immediately", label: `🔥 Apply Now (${categoryCounts.apply_immediately})` },
    { key: "strong_match", label: `🟢 Strong (${categoryCounts.strong_match})` },
    { key: "possible_match", label: `🟡 Possible (${categoryCounts.possible_match})` },
    { key: "low_match", label: `🔴 Low (${categoryCounts.low_match})` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">💼 Job Discovery</h2>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search role, e.g. AI Full Stack Developer..."
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
            className="input-field flex-1"
          />
          <button
            onClick={runSearch}
            disabled={scanning}
            className="btn-primary text-sm px-6 py-3 flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {scanning ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>🔍 Search Jobs</>
            )}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              filter === cat.key
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Live Jobs Banner */}
      <div className="glass-card p-3 border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0"></span>
        <span className="text-xs text-emerald-300">
          <strong>Live Jobs</strong> — Real positions from RemoteOK, Jobicy, Himalayas, Findwork & more job boards.
        </span>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((item) => (
            <JobCard
              key={item.job.id}
              id={item.job.id}
              title={item.job.title}
              company={item.job.company}
              location={item.job.location}
              workMode={item.job.workMode}
              salary={item.job.salary}
              sourceName={item.job.sourceName}
              postedAt={item.job.postedAt}
              fitScore={item.score?.fitScore}
              shortlistProbability={item.score?.shortlistProbability}
              confidence={item.score?.confidence}
              category={item.score?.category}
              strengths={item.score?.strengths}
              missingRequirements={item.score?.missingRequirements}
              preferredSkills={item.job.preferredSkills}
              url={item.job.url}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No jobs found"
          description="Run a job search to discover opportunities matching your profile."
          action={
            <button onClick={runSearch} className="btn-primary text-sm px-6 py-2.5">
              🔍 Search Now
            </button>
          }
        />
      )}
    </div>
  );
}
