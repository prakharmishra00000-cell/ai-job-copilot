"use client";

import Link from "next/link";
import ScoreCircle from "./ScoreCircle";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  workMode?: string | null;
  salary?: string | null;
  sourceName: string;
  postedAt?: string | null;
  fitScore?: number | null;
  shortlistProbability?: number | null;
  confidence?: string | null;
  category?: string | null;
  strengths?: string[] | null;
  missingRequirements?: string[] | null;
  preferredSkills?: string[] | null;
  url: string;
  applicationStatus?: string | null;
}

function getCategoryBadge(category: string | null | undefined) {
  switch (category) {
    case "apply_immediately":
      return { label: "🔥 Apply Immediately", cls: "badge-fire" };
    case "strong_match":
      return { label: "🟢 Strong Match", cls: "badge-green" };
    case "possible_match":
      return { label: "🟡 Possible Match", cls: "badge-yellow" };
    case "low_match":
      return { label: "🔴 Low Match", cls: "badge-red" };
    default:
      return { label: "—", cls: "badge-gray" };
  }
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function JobCard(props: JobCardProps) {
  const badge = getCategoryBadge(props.category);
  const skills = (props.preferredSkills || []).slice(0, 5);

  return (
    <div className="glass-card p-5 hover:border-blue-500/30 transition-all group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${badge.cls} text-[11px]`}>{badge.label}</span>
            {props.applicationStatus && (
              <span className="badge badge-blue text-[11px]">
                {props.applicationStatus.replace(/_/g, " ")}
              </span>
            )}
          </div>
          <Link href={`/jobs/${props.id}`}>
            <h3 className="text-base font-semibold text-white hover:text-blue-400 transition-colors truncate">
              {props.title}
            </h3>
          </Link>
          <p className="text-sm text-slate-400 mt-0.5">{props.company}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
            {props.location && <span>📍 {props.location}</span>}
            {props.workMode && <span>🏢 {props.workMode}</span>}
            {props.salary && <span>💰 {props.salary}</span>}
            {props.sourceName && <span>🔗 {props.sourceName}</span>}
            {props.postedAt && <span>🕐 {timeAgo(props.postedAt)}</span>}
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {props.fitScore != null && (
            <ScoreCircle score={Math.round(props.fitScore)} size={56} label="Fit" />
          )}
          {props.shortlistProbability != null && (
            <div className="text-center">
              <div className="text-xs font-semibold text-slate-300">{Math.round(props.shortlistProbability)}%</div>
              <div className="text-[10px] text-slate-500">Shortlist Est.</div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/50">
        <Link href={`/jobs/${props.id}`} className="btn-primary text-xs px-4 py-2">
          View Details
        </Link>
        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-xs px-4 py-2"
        >
          🔗 Original Job
        </a>
      </div>
    </div>
  );
}
