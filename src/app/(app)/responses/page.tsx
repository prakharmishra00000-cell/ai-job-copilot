"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingPage, EmptyState } from "@/components/LoadingState";

interface ResponseItem {
  response: {
    id: string;
    type: string;
    content: string | null;
    classification: string | null;
    confidence: number | null;
    receivedAt: string;
    isRead: boolean;
  };
  application: {
    id: string;
    status: string;
  };
  job: {
    id: string;
    title: string;
    company: string;
    sourceName: string;
    url: string;
  };
}

const TYPE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  application_confirmation: { label: "Application Confirmed", icon: "✅", color: "badge-green" },
  recruiter_response: { label: "Recruiter Response", icon: "💬", color: "badge-blue" },
  interview_invitation: { label: "Interview Invitation", icon: "🎤", color: "badge-purple" },
  assessment: { label: "Assessment", icon: "📝", color: "badge-yellow" },
  rejection: { label: "Rejection", icon: "❌", color: "badge-red" },
  offer: { label: "Offer!", icon: "🏆", color: "badge-green" },
  info_request: { label: "Info Request", icon: "❓", color: "badge-yellow" },
  unknown: { label: "Response", icon: "📩", color: "badge-gray" },
};

export default function ResponsesPage() {
  const [data, setData] = useState<{ responses: ResponseItem[]; stats: { total: number; unread: number; byType: Record<string, number> } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/responses")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage message="Loading responses..." />;

  const filtered = filter
    ? (data?.responses || []).filter((r) => r.response.type === filter)
    : data?.responses || [];

  return (
    <div className="space-y-5 max-w-4xl">
      <h2 className="text-xl font-bold text-white">📩 Response Center</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card p-4 text-center">
          <span className="text-2xl">📩</span>
          <p className="text-xl font-bold text-white mt-1">{data?.stats?.total || 0}</p>
          <p className="text-xs text-slate-400">Total Responses</p>
        </div>
        <div className="stat-card p-4 text-center">
          <span className="text-2xl">🔔</span>
          <p className="text-xl font-bold text-white mt-1">{data?.stats?.unread || 0}</p>
          <p className="text-xs text-slate-400">Unread</p>
        </div>
        <div className="stat-card p-4 text-center">
          <span className="text-2xl">🎤</span>
          <p className="text-xl font-bold text-white mt-1">{data?.stats?.byType?.interview_invitation || 0}</p>
          <p className="text-xs text-slate-400">Interviews</p>
        </div>
        <div className="stat-card p-4 text-center">
          <span className="text-2xl">🏆</span>
          <p className="text-xl font-bold text-white mt-1">{data?.stats?.byType?.offer || 0}</p>
          <p className="text-xs text-slate-400">Offers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "", label: "All" },
          { key: "interview_invitation", label: "🎤 Interviews" },
          { key: "recruiter_response", label: "💬 Recruiter" },
          { key: "offer", label: "🏆 Offers" },
          { key: "assessment", label: "📝 Assessments" },
          { key: "rejection", label: "❌ Rejections" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
              filter === f.key
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-slate-800/50 text-slate-400 border border-transparent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Response List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => {
            const info = TYPE_INFO[item.response.type] || TYPE_INFO.unknown;
            return (
              <div key={item.response.id} className={`glass-card p-5 ${!item.response.isRead ? "border-l-4 border-l-blue-500" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${info.color} text-xs`}>{info.icon} {info.label}</span>
                      {!item.response.isRead && (
                        <span className="badge badge-blue text-[10px]">NEW</span>
                      )}
                      {item.response.confidence && (
                        <span className="text-[10px] text-slate-500">
                          {Math.round(item.response.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-white">{item.job.title}</h3>
                    <p className="text-sm text-slate-400">{item.job.company}</p>
                    {item.response.content && (
                      <p className="text-xs text-slate-300 mt-2 bg-slate-800/40 p-3 rounded-lg">
                        {item.response.content.slice(0, 200)}
                        {item.response.content.length > 200 ? "..." : ""}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                      <span>📅 {new Date(item.response.receivedAt).toLocaleDateString()}</span>
                      <span>🔗 {item.job.sourceName}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/jobs/${item.job.id}`} className="btn-primary text-xs px-4 py-2">
                      View Job
                    </Link>
                    <a
                      href={item.job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs px-4 py-2"
                    >
                      Open Original
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="📩"
          title="No responses yet"
          description="Responses from recruiters and employers will appear here. Keep applying to increase your chances!"
          action={
            <Link href="/applications" className="btn-primary text-sm px-6 py-2.5">
              View Applications
            </Link>
          }
        />
      )}

      {/* Integration Info */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-2">📧 Email Integration</h3>
        <p className="text-xs text-slate-400">
          Connect your email (Gmail/Outlook) via OAuth to automatically detect and classify recruiter responses, 
          interview invitations, and offers. This feature uses authorized APIs only and never sends or deletes emails.
        </p>
        <button className="btn-secondary text-xs px-4 py-2 mt-3">
          Connect Email (Coming Soon)
        </button>
      </div>
    </div>
  );
}
