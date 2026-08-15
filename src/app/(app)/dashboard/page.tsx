"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import { LoadingPage, EmptyState } from "@/components/LoadingState";

interface Briefing {
  greeting: string;
  summary: string;
  highlights: Array<{ icon: string; text: string; priority: "high" | "medium" | "low" }>;
  recommendations: string[];
}

interface DashboardData {
  stats: {
    totalJobsFound: number;
    highlyRelevant: number;
    totalApplications: number;
    totalResponses: number;
    interviews: number;
    offers: number;
    applicationsThisWeek: number;
    responseRate: number;
    interviewRate: number;
    avgFitScore: number;
    applied?: number;
  };
  topJobs: Array<{
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
    };
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

const STAT_CARDS = [
  { key: "totalJobsFound", label: "Jobs Found", icon: "💼", color: "from-blue-500/20 to-blue-600/10" },
  { key: "highlyRelevant", label: "High Match", icon: "🎯", color: "from-emerald-500/20 to-emerald-600/10" },
  { key: "totalApplications", label: "Applications", icon: "📋", color: "from-violet-500/20 to-violet-600/10" },
  { key: "totalResponses", label: "Responses", icon: "📩", color: "from-amber-500/20 to-amber-600/10" },
  { key: "interviews", label: "Interviews", icon: "🎤", color: "from-cyan-500/20 to-cyan-600/10" },
  { key: "offers", label: "Offers", icon: "🏆", color: "from-pink-500/20 to-pink-600/10" },
] as const;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchBriefing();
  }, []);

  async function fetchBriefing() {
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "briefing" }),
      });
      const json = await res.json();
      setBriefing(json);
    } catch (err) {
      console.error("Briefing fetch error:", err);
    }
  }

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function runScan() {
    setScanning(true);
    try {
      await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchDashboard();
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setScanning(false);
    }
  }

  if (loading) return <LoadingPage message="Loading dashboard..." />;

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Daily Briefing */}
      {briefing && (
        <div className="glass-card p-6 gradient-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">{briefing.greeting} 👋</h2>
              <p className="text-sm text-slate-400 mt-1">{briefing.summary}</p>
            </div>
            <span className="badge badge-blue text-xs">Daily Briefing</span>
          </div>
          
          {briefing.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {briefing.highlights.map((h, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
                    h.priority === "high" ? "bg-red-500/10 text-red-300 border border-red-500/20" :
                    h.priority === "medium" ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" :
                    "bg-slate-700/50 text-slate-300 border border-slate-600/50"
                  }`}
                >
                  <span>{h.icon}</span>
                  <span>{h.text}</span>
                </div>
              ))}
            </div>
          )}
          
          {briefing.recommendations.length > 0 && (
            <div className="bg-slate-800/40 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase font-medium mb-2">AI Recommendations</p>
              <ul className="space-y-1">
                {briefing.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="text-blue-400">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Demo Banner */}
      <div className="demo-banner flex items-center gap-2">
        <span>⚠️</span>
        <span>
          <strong>Demo Mode</strong> — Jobs shown are sample data for demonstration.
          Connect real job sources in production for live data.
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className={`stat-card p-4 bg-gradient-to-br ${card.color}`}>
            <span className="text-2xl">{card.icon}</span>
            <p className="text-2xl font-bold text-white mt-2">
              {stats?.[card.key as keyof typeof stats] ?? 0}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={runScan}
          disabled={scanning}
          className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-50"
        >
          {scanning ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scanning...
            </>
          ) : (
            <>🔍 Run Job Scan</>
          )}
        </button>
        <Link href="/jobs" className="btn-secondary text-sm px-6 py-2.5">
          💼 View All Jobs
        </Link>
        <Link href="/applications" className="btn-secondary text-sm px-6 py-2.5">
          📋 Applications
        </Link>
        <Link href="/automation" className="btn-secondary text-sm px-6 py-2.5">
          ⚡ Automation
        </Link>
      </div>

      {/* Application Funnel */}
      {stats && stats.totalApplications > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Application Funnel</h3>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {[
              { label: "Found", val: stats.totalJobsFound, color: "bg-blue-500" },
              { label: "High Match", val: stats.highlyRelevant, color: "bg-emerald-500" },
              { label: "Applied", val: stats.applied ?? stats.totalApplications, color: "bg-violet-500" },
              { label: "Responses", val: stats.totalResponses, color: "bg-amber-500" },
              { label: "Interviews", val: stats.interviews, color: "bg-cyan-500" },
              { label: "Offers", val: stats.offers, color: "bg-pink-500" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 shrink-0">
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {s.val}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{s.label}</p>
                </div>
                {i < 5 && <span className="text-slate-600 text-lg">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {stats && stats.totalApplications > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="stat-card p-5">
            <p className="text-xs text-slate-400">Response Rate</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.responseRate}%</p>
          </div>
          <div className="stat-card p-5">
            <p className="text-xs text-slate-400">Interview Rate</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.interviewRate}%</p>
          </div>
          <div className="stat-card p-5">
            <p className="text-xs text-slate-400">Avg Fit Score</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.avgFitScore}%</p>
          </div>
        </div>
      )}

      {/* Top Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🔥 Top Opportunities
          </h3>
          <Link href="/jobs" className="text-sm text-blue-400 hover:text-blue-300">
            View All →
          </Link>
        </div>
        {data?.topJobs && data.topJobs.length > 0 ? (
          <div className="space-y-3">
            {data.topJobs.map((item) => (
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
            title="No jobs discovered yet"
            description='Click "Run Job Scan" to discover jobs from available sources.'
            action={
              <button onClick={runScan} className="btn-primary text-sm px-6 py-2.5">
                🔍 Run Your First Scan
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
