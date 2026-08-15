"use client";

import { useEffect, useState } from "react";
import { LoadingPage, EmptyState } from "@/components/LoadingState";

interface AnalyticsData {
  analytics: {
    statusCounts: Array<{ status: string; count: number }>;
    sourceStats: Array<{ source: string; count: number }>;
    avgFitScore: number;
    scoreDistribution: Array<{ category: string; count: number }>;
    totalApplications: number;
    totalResponses: number;
    applicationsThisWeek: number;
    applicationsThisMonth: number;
    responseRate: number;
    topRoles: Array<{ title: string; avgScore: number; count: number }>;
  } | null;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({ analytics: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage message="Loading analytics..." />;

  const a = data.analytics;

  if (!a || a.totalApplications === 0) {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-white">📈 Analytics</h2>
        <EmptyState
          icon="📈"
          title="No data yet"
          description="Analytics will appear as you start applying to jobs. Discover jobs and submit applications to see insights."
        />
      </div>
    );
  }

  const statusMap: Record<string, string> = {
    discovered: "Discovered",
    applied: "Applied",
    needs_user_action: "Needs Action",
    interview_scheduled: "Interview",
    offer: "Offer",
    rejected: "Rejected",
    no_response: "No Response",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-white">📈 Job Search Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card p-5">
          <p className="text-xs text-slate-400">This Week</p>
          <p className="text-2xl font-bold text-white mt-1">{a.applicationsThisWeek}</p>
          <p className="text-[10px] text-slate-500">Applications</p>
        </div>
        <div className="stat-card p-5">
          <p className="text-xs text-slate-400">This Month</p>
          <p className="text-2xl font-bold text-white mt-1">{a.applicationsThisMonth}</p>
          <p className="text-[10px] text-slate-500">Applications</p>
        </div>
        <div className="stat-card p-5">
          <p className="text-xs text-slate-400">Response Rate</p>
          <p className="text-2xl font-bold text-white mt-1">{a.responseRate}%</p>
        </div>
        <div className="stat-card p-5">
          <p className="text-xs text-slate-400">Avg Fit Score</p>
          <p className="text-2xl font-bold text-white mt-1">{a.avgFitScore}%</p>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Application Status Distribution</h3>
        <div className="space-y-3">
          {a.statusCounts.map((s) => {
            const max = Math.max(...a.statusCounts.map((x) => x.count), 1);
            const pct = (s.count / max) * 100;
            return (
              <div key={s.status}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{statusMap[s.status] || s.status}</span>
                  <span className="text-slate-400">{s.count}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Distribution */}
      {a.scoreDistribution.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Fit Score Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "apply_immediately", label: "🔥 Apply Now (90-100)", color: "bg-red-500/20" },
              { key: "strong_match", label: "🟢 Strong (80-89)", color: "bg-emerald-500/20" },
              { key: "possible_match", label: "🟡 Possible (65-79)", color: "bg-amber-500/20" },
              { key: "low_match", label: "🔴 Low (<65)", color: "bg-slate-700/50" },
            ].map((cat) => {
              const found = a.scoreDistribution.find((d) => d.category === cat.key);
              return (
                <div key={cat.key} className={`${cat.color} p-4 rounded-xl text-center`}>
                  <p className="text-xl font-bold text-white">{found?.count || 0}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{cat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Source Stats */}
      {a.sourceStats.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Applications by Source</h3>
          <div className="space-y-2">
            {a.sourceStats.map((s) => (
              <div key={s.source} className="flex items-center justify-between py-2 px-3 bg-slate-800/40 rounded-lg">
                <span className="text-sm text-slate-300">{s.source}</span>
                <span className="text-sm font-semibold text-white">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Roles */}
      {a.topRoles.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Top Performing Roles</h3>
          <div className="space-y-2">
            {a.topRoles.map((role) => (
              <div key={role.title} className="flex items-center justify-between py-2 px-3 bg-slate-800/40 rounded-lg">
                <div>
                  <span className="text-sm text-white">{role.title}</span>
                  <span className="text-xs text-slate-500 ml-2">({role.count} applications)</span>
                </div>
                <span className="text-sm font-semibold text-blue-400">Avg: {role.avgScore}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insight */}
      <div className="glass-card p-6 border border-violet-500/20">
        <h3 className="text-base font-semibold text-white mb-2">🧠 AI Insight</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {a.totalApplications > 5
            ? `Based on your ${a.totalApplications} applications with an average fit score of ${a.avgFitScore}%, ${
                a.responseRate > 15
                  ? "your response rate is above average. Continue targeting similar roles."
                  : "consider focusing on jobs with higher fit scores (90%+) to improve your response rate."
              }`
            : "Continue applying to build enough data for personalized insights. We recommend at least 10 applications for meaningful analytics."}
        </p>
        <p className="text-[11px] text-slate-500 mt-2 italic">
          AI Opportunity Estimate — Based on available data. Not a guarantee of hiring outcomes.
        </p>
      </div>
    </div>
  );
}
