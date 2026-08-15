"use client";

import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import { LoadingPage, EmptyState, SkeletonCard } from "@/components/LoadingState";
import { PLATFORM_LINKS } from "@/lib/job-sources";

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
    employmentType: string | null;
    experienceLevel: string | null;
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

type TabType = "all" | "jobs" | "internships";
type YearFilter = "all" | "2025" | "2026" | "2027" | "2028" | "2029";

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
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");
  const [searchStats, setSearchStats] = useState<Record<string, number>>({});

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
      const res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.sourceStats) setSearchStats(data.sourceStats);
      await fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  }

  // Filter jobs by tab and year
  const filteredJobs = jobs.filter((item) => {
    // Tab filter
    if (activeTab === "internships") {
      const isInternship = 
        item.job.employmentType?.toLowerCase().includes("intern") ||
        item.job.title?.toLowerCase().includes("intern") ||
        item.job.title?.toLowerCase().includes("trainee") ||
        item.job.title?.toLowerCase().includes("graduate") ||
        item.job.experienceLevel?.toLowerCase().includes("entry") ||
        item.job.experienceLevel?.toLowerCase().includes("fresher") ||
        item.job.sourceName === "internships";
      if (!isInternship) return false;
    } else if (activeTab === "jobs") {
      const isJob = 
        !item.job.employmentType?.toLowerCase().includes("intern") &&
        !item.job.title?.toLowerCase().includes("intern");
      if (!isJob) return false;
    }

    // Year filter (based on posting date)
    if (yearFilter !== "all" && item.job.postedAt) {
      const jobYear = new Date(item.job.postedAt).getFullYear();
      const filterYear = parseInt(yearFilter);
      // Show jobs from selected year onwards
      if (jobYear < filterYear) return false;
    }

    return true;
  });

  const categories = [
    { key: "", label: `All (${total})` },
    { key: "apply_immediately", label: `🔥 Apply Now (${categoryCounts.apply_immediately})` },
    { key: "strong_match", label: `🟢 Strong (${categoryCounts.strong_match})` },
    { key: "possible_match", label: `🟡 Possible (${categoryCounts.possible_match})` },
    { key: "low_match", label: `🔴 Low (${categoryCounts.low_match})` },
  ];

  const internshipCount = jobs.filter(j => 
    j.job.employmentType?.toLowerCase().includes("intern") ||
    j.job.title?.toLowerCase().includes("intern") ||
    j.job.sourceName === "internships"
  ).length;

  const jobCount = jobs.filter(j => 
    !j.job.employmentType?.toLowerCase().includes("intern") &&
    !j.job.title?.toLowerCase().includes("intern")
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">💼 Job Discovery</h2>
        <div className="flex gap-2">
          {Object.keys(searchStats).length > 0 && (
            <span className="text-xs text-slate-400">
              {Object.values(searchStats).reduce((a, b) => a + b, 0)} jobs from {Object.keys(searchStats).length} sources
            </span>
          )}
        </div>
      </div>

      {/* Live Status Banner */}
      <div className="glass-card p-4 border border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shrink-0"></span>
          <div className="flex-1">
            <p className="text-sm text-emerald-300 font-medium">
              Live Job Search — Connected to 9+ job platforms automatically
            </p>
            <p className="text-xs text-slate-400 mt-1">
              RemoteOK • Jobicy • Himalayas • Findwork • LinkedIn • We Work Remotely • India Jobs • Internships Hub
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search: AI Developer, React, Python, Data Science..."
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
                Searching all platforms...
              </>
            ) : (
              <>🔍 Search All Platforms</>
            )}
          </button>
        </div>
      </div>

      {/* Jobs / Internships Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "all"
              ? "bg-blue-500 text-white"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
          }`}
        >
          📋 All ({total})
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "jobs"
              ? "bg-blue-500 text-white"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
          }`}
        >
          💼 Full-Time Jobs ({jobCount})
        </button>
        <button
          onClick={() => setActiveTab("internships")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "internships"
              ? "bg-violet-500 text-white"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
          }`}
        >
          🎓 Internships ({internshipCount})
        </button>
      </div>

      {/* Year Filter */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">
          {activeTab === "internships" ? "Graduation Year:" : "Posted:"}
        </span>
        <div className="flex gap-1.5">
          {(["all", "2025", "2026", "2027", "2028", "2029"] as YearFilter[]).map((year) => (
            <button
              key={year}
              onClick={() => setYearFilter(year)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                yearFilter === year
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-slate-800/50 text-slate-500 border border-transparent hover:border-slate-700"
              }`}
            >
              {year === "all" ? "All Years" : year}
            </button>
          ))}
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

      {/* Direct Platform Links */}
      <div className="glass-card p-4">
        <p className="text-xs text-slate-400 mb-3">🔗 Apply directly on major platforms:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PLATFORM_LINKS).map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800/50 text-xs text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 transition-all capitalize"
            >
              {name}
            </a>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-3">
          {filteredJobs.map((item) => (
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
          icon={activeTab === "internships" ? "🎓" : "🔍"}
          title={activeTab === "internships" ? "No internships found" : "No jobs found"}
          description={`Click "Search All Platforms" to discover ${activeTab === "internships" ? "internship" : "job"} opportunities from 9+ sources.`}
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
