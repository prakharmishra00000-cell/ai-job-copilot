"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingPage, EmptyState } from "@/components/LoadingState";

interface AppItem {
  application: {
    id: string;
    status: string;
    appliedAt: string | null;
    mode: string | null;
    coverLetter: string | null;
    resumeVersion: string | null;
    failureReason: string | null;
    lastUpdatedAt: string;
    createdAt: string;
  };
  job: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    sourceName: string;
    url: string;
  };
  score: {
    fitScore: number;
    shortlistProbability: number;
    category: string;
  } | null;
}

function statusBadge(status: string) {
  const map: Record<string, { cls: string; label: string }> = {
    discovered: { cls: "badge-gray", label: "Discovered" },
    reviewed: { cls: "badge-blue", label: "Reviewed" },
    ready_to_apply: { cls: "badge-blue", label: "Ready" },
    application_started: { cls: "badge-yellow", label: "Started" },
    applied: { cls: "badge-green", label: "Applied" },
    application_failed: { cls: "badge-red", label: "Failed" },
    needs_user_action: { cls: "badge-yellow", label: "Needs Action" },
    withdrawn: { cls: "badge-gray", label: "Withdrawn" },
    application_confirmed: { cls: "badge-green", label: "Confirmed" },
    recruiter_contacted: { cls: "badge-blue", label: "Contacted" },
    recruiter_responded: { cls: "badge-purple", label: "Responded" },
    assessment_received: { cls: "badge-purple", label: "Assessment" },
    interview_requested: { cls: "badge-purple", label: "Interview Req" },
    interview_scheduled: { cls: "badge-green", label: "Interview" },
    rejected: { cls: "badge-red", label: "Rejected" },
    offer: { cls: "badge-green", label: "🏆 Offer" },
    no_response: { cls: "badge-gray", label: "No Response" },
  };
  return map[status] || { cls: "badge-gray", label: status };
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, interviewing: 0, offers: 0, rejected: 0, needsAction: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((json) => {
        setApps(json.applications || []);
        if (json.stats) setStats(json.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter
    ? apps.filter((a) => a.application.status === statusFilter)
    : apps;

  if (loading) return <LoadingPage message="Loading applications..." />;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">📋 Application Tracker</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total", val: stats.total, icon: "📋" },
          { label: "Applied", val: stats.applied, icon: "✅" },
          { label: "Interviewing", val: stats.interviewing, icon: "🎤" },
          { label: "Offers", val: stats.offers, icon: "🏆" },
          { label: "Rejected", val: stats.rejected, icon: "❌" },
          { label: "Needs Action", val: stats.needsAction, icon: "⚠️" },
        ].map((s) => (
          <div key={s.label} className="stat-card p-4 text-center">
            <span className="text-xl">{s.icon}</span>
            <p className="text-xl font-bold text-white mt-1">{s.val}</p>
            <p className="text-[10px] text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["", "needs_user_action", "applied", "interview_scheduled", "offer", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
              statusFilter === s
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-slate-800/50 text-slate-400 border border-transparent"
            }`}
          >
            {s ? statusBadge(s).label : "All"}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      {filtered.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 hidden md:table-cell">Source</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 hidden md:table-cell">Fit</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-400">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 hidden md:table-cell">Updated</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const badge = statusBadge(item.application.status);
                  return (
                    <tr key={item.application.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <Link href={`/jobs/${item.job.id}`} className="text-white hover:text-blue-400 font-medium text-sm">
                          {item.job.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{item.job.company}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{item.job.sourceName}</td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {item.score ? (
                          <span className="text-sm font-semibold text-white">{Math.round(item.score.fitScore)}%</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`badge ${badge.cls} text-[11px]`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-500 hidden md:table-cell">
                        {timeAgo(item.application.lastUpdatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/jobs/${item.job.id}`} className="text-xs text-blue-400 hover:text-blue-300">
                            View
                          </Link>
                          <a href={item.job.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-300">
                            🔗
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="📋"
          title="No applications yet"
          description="Browse jobs and prepare applications to start tracking your job search."
          action={
            <Link href="/jobs" className="btn-primary text-sm px-6 py-2.5">
              💼 Browse Jobs
            </Link>
          }
        />
      )}
    </div>
  );
}
