"use client";

import { useEffect, useState } from "react";
import { LoadingPage } from "@/components/LoadingState";

interface AutoData {
  config: {
    id: string;
    isActive: boolean;
    mode: string;
    scanFrequency: string;
    maxApplicationsPerDay: number;
    maxApplicationsPerHour: number;
    minFitScore: number;
    minShortlistProbability: number;
    autoApplyEnabled: boolean;
    recruiterOutreachEnabled: boolean;
    maxRecruiterMessagesPerDay: number;
    requireApproval: string;
  } | null;
  sources: Array<{
    id?: string;
    name: string;
    displayName: string;
    status: string;
    lastSyncAt: string | null;
    jobCount: number;
    supportsAutoApply: boolean;
  }>;
  activityLog: Array<{
    id: string;
    action: string;
    details: string | null;
    platform: string | null;
    result: string | null;
    timestamp: string;
  }>;
}

export default function AutomationPage() {
  const [data, setData] = useState<AutoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    isActive: false,
    mode: "assisted" as string,
    scanFrequency: "30min",
    maxApplicationsPerDay: 10,
    maxApplicationsPerHour: 3,
    minFitScore: 85,
    minShortlistProbability: 70,
    autoApplyEnabled: false,
    recruiterOutreachEnabled: false,
    maxRecruiterMessagesPerDay: 10,
    requireApproval: "always",
  });

  useEffect(() => {
    fetch("/api/automation")
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        if (json.config) {
          setConfig({
            isActive: json.config.isActive,
            mode: json.config.mode,
            scanFrequency: json.config.scanFrequency,
            maxApplicationsPerDay: json.config.maxApplicationsPerDay,
            maxApplicationsPerHour: json.config.maxApplicationsPerHour,
            minFitScore: json.config.minFitScore,
            minShortlistProbability: json.config.minShortlistProbability,
            autoApplyEnabled: json.config.autoApplyEnabled,
            recruiterOutreachEnabled: json.config.recruiterOutreachEnabled,
            maxRecruiterMessagesPerDay: json.config.maxRecruiterMessagesPerDay,
            requireApproval: json.config.requireApproval,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function saveConfig() {
    setSaving(true);
    try {
      await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const res = await fetch("/api/automation");
      setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingPage message="Loading automation center..." />;

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-white">⚡ Automation Center</h2>

      {/* Status Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${config.isActive ? "bg-emerald-400 pulse-dot" : "bg-slate-600"}`} />
            <h3 className="text-lg font-semibold text-white">
              Automation Status: {config.isActive ? "ACTIVE" : "PAUSED"}
            </h3>
          </div>
          <button
            onClick={() => {
              setConfig((c) => ({ ...c, isActive: !c.isActive }));
            }}
            className={`px-5 py-2 rounded-lg text-sm font-medium ${
              config.isActive
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {config.isActive ? "⏸ Pause" : "▶ Resume"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400">Scan Frequency</p>
            <p className="text-white font-medium mt-1">Every {config.scanFrequency}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400">Mode</p>
            <p className="text-white font-medium mt-1 capitalize">{config.mode}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400">Min Fit Score</p>
            <p className="text-white font-medium mt-1">{config.minFitScore}%</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <p className="text-slate-400">Daily Limit</p>
            <p className="text-white font-medium mt-1">{config.maxApplicationsPerDay}</p>
          </div>
        </div>
      </div>

      {/* Control Mode */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Control Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: "manual", label: "Manual", desc: "AI finds & ranks jobs. You apply manually.", icon: "🖐" },
            { value: "assisted", label: "Assisted", desc: "AI prepares everything. You click submit.", icon: "🤝" },
            { value: "autonomous", label: "Autonomous", desc: "AI applies automatically where permitted.", icon: "🤖" },
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => setConfig((c) => ({ ...c, mode: mode.value }))}
              className={`p-4 rounded-xl text-left border transition-all ${
                config.mode === mode.value
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
              }`}
            >
              <span className="text-2xl">{mode.icon}</span>
              <h4 className="text-sm font-semibold text-white mt-2">{mode.label}</h4>
              <p className="text-[11px] text-slate-400 mt-1">{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Automation Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Scan Frequency</label>
            <select
              value={config.scanFrequency}
              onChange={(e) => setConfig((c) => ({ ...c, scanFrequency: e.target.value }))}
              className="input-field text-sm"
            >
              <option value="15min">Every 15 minutes</option>
              <option value="30min">Every 30 minutes</option>
              <option value="1hr">Every hour</option>
              <option value="6hr">Every 6 hours</option>
              <option value="daily">Daily</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Max Applications/Day</label>
            <input
              type="number"
              value={config.maxApplicationsPerDay}
              onChange={(e) => setConfig((c) => ({ ...c, maxApplicationsPerDay: parseInt(e.target.value) || 10 }))}
              className="input-field text-sm"
              min={1}
              max={50}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Min Fit Score</label>
            <input
              type="number"
              value={config.minFitScore}
              onChange={(e) => setConfig((c) => ({ ...c, minFitScore: parseInt(e.target.value) || 85 }))}
              className="input-field text-sm"
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Min Shortlist Probability</label>
            <input
              type="number"
              value={config.minShortlistProbability}
              onChange={(e) => setConfig((c) => ({ ...c, minShortlistProbability: parseInt(e.target.value) || 70 }))}
              className="input-field text-sm"
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Require Approval</label>
            <select
              value={config.requireApproval}
              onChange={(e) => setConfig((c) => ({ ...c, requireApproval: e.target.value }))}
              className="input-field text-sm"
            >
              <option value="always">Always (Recommended)</option>
              <option value="below_90">Only below 90% fit</option>
              <option value="new_companies">Only for new companies</option>
              <option value="never">Never (for supported platforms)</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400">Recruiter Outreach</label>
            <button
              onClick={() => setConfig((c) => ({ ...c, recruiterOutreachEnabled: !c.recruiterOutreachEnabled }))}
              className={`w-10 h-6 rounded-full transition-colors ${
                config.recruiterOutreachEnabled ? "bg-blue-500" : "bg-slate-700"
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                config.recruiterOutreachEnabled ? "translate-x-4" : ""
              }`} />
            </button>
          </div>
        </div>

        <button
          onClick={saveConfig}
          disabled={saving}
          className="btn-primary text-sm px-6 py-2.5 mt-6 disabled:opacity-50"
        >
          {saving ? "Saving..." : "💾 Save Configuration"}
        </button>
      </div>

      {/* Job Sources */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Source Health</h3>
        <div className="space-y-2">
          {(data?.sources || []).map((src) => (
            <div key={src.name} className="flex items-center justify-between py-2 px-3 bg-slate-800/40 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  src.status === "connected" ? "bg-emerald-400" : src.status === "assisted_only" ? "bg-amber-400" : "bg-red-400"
                }`} />
                <span className="text-sm text-white">{src.displayName}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                {src.jobCount > 0 && <span>{src.jobCount} jobs</span>}
                <span className="capitalize">{src.status.replace(/_/g, " ")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Activity Log</h3>
        {data?.activityLog && data.activityLog.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data.activityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-slate-800/50 last:border-0">
                <span className="text-xs text-slate-500 shrink-0 w-16">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-slate-300">{log.details || log.action}</p>
                  {log.platform && (
                    <p className="text-[10px] text-slate-500 mt-0.5">Platform: {log.platform}</p>
                  )}
                </div>
                {log.result && (
                  <span className={`badge text-[10px] ${log.result === "success" ? "badge-green" : "badge-red"}`}>
                    {log.result}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No activity recorded yet</p>
        )}
      </div>
    </div>
  );
}
