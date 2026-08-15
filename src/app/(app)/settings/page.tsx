"use client";

import { useEffect, useState } from "react";
import { LoadingPage } from "@/components/LoadingState";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    targetRoles: [] as string[],
    locations: [] as string[],
    workMode: ["Remote"] as string[],
    salaryMin: 500000,
    salaryCurrency: "INR",
    experienceLevel: "Fresher",
    employmentTypes: ["Full-time"] as string[],
    industries: [] as string[],
    technologies: [] as string[],
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        if (data?.preferences) {
          setPreferences({ ...preferences, ...data.preferences });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveSettings() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingPage message="Loading settings..." />;

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-bold text-white">⚙️ Settings</h2>

      {/* Job Preferences */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-white">Job Search Preferences</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Roles</label>
            <input
              type="text"
              value={preferences.targetRoles.join(", ")}
              onChange={(e) => setPreferences((p) => ({ ...p, targetRoles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
              className="input-field text-sm"
              placeholder="AI Developer, Full Stack..."
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Locations</label>
            <input
              type="text"
              value={preferences.locations.join(", ")}
              onChange={(e) => setPreferences((p) => ({ ...p, locations: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
              className="input-field text-sm"
              placeholder="Bangalore, Remote..."
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Technologies</label>
            <input
              type="text"
              value={preferences.technologies.join(", ")}
              onChange={(e) => setPreferences((p) => ({ ...p, technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
              className="input-field text-sm"
              placeholder="React, Next.js, Python..."
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Experience Level</label>
            <select
              value={preferences.experienceLevel}
              onChange={(e) => setPreferences((p) => ({ ...p, experienceLevel: e.target.value }))}
              className="input-field text-sm"
            >
              <option value="Fresher">Fresher</option>
              <option value="0-1 years">0-1 years</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Minimum Salary (₹/year)</label>
            <input
              type="number"
              value={preferences.salaryMin}
              onChange={(e) => setPreferences((p) => ({ ...p, salaryMin: parseInt(e.target.value) || 0 }))}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Industries</label>
            <input
              type="text"
              value={preferences.industries.join(", ")}
              onChange={(e) => setPreferences((p) => ({ ...p, industries: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
              className="input-field text-sm"
              placeholder="AI, SaaS, Fintech..."
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-2">Work Mode</label>
          <div className="flex flex-wrap gap-2">
            {["Remote", "Hybrid", "On-site"].map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setPreferences((p) => ({
                    ...p,
                    workMode: p.workMode.includes(mode) ? p.workMode.filter((m) => m !== mode) : [...p.workMode, mode],
                  }));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  preferences.workMode.includes(mode)
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-2">Employment Type</label>
          <div className="flex flex-wrap gap-2">
            {["Full-time", "Internship", "Part-time", "Contract", "Freelance"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setPreferences((p) => ({
                    ...p,
                    employmentTypes: p.employmentTypes.includes(type)
                      ? p.employmentTypes.filter((t) => t !== type)
                      : [...p.employmentTypes, type],
                  }));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  preferences.employmentTypes.includes(type)
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn-primary text-sm px-6 py-2.5 disabled:opacity-50"
        >
          {saving ? "Saving..." : "💾 Save Preferences"}
        </button>
      </div>

      {/* Integrations */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">🔌 Integrations</h3>
        <p className="text-xs text-slate-400 mb-4">
          Connect job platforms and services. All integrations use authorized OAuth or official APIs only.
        </p>
        <div className="space-y-2">
          {[
            { name: "LinkedIn", status: "Assisted Mode Only", icon: "🔗" },
            { name: "Indeed", status: "Assisted Mode Only", icon: "🔗" },
            { name: "Internshala", status: "Assisted Mode Only", icon: "🔗" },
            { name: "Gmail (Response Detection)", status: "Not Connected", icon: "📧" },
            { name: "Telegram Notifications", status: "Not Connected", icon: "📱" },
          ].map((int) => (
            <div key={int.name} className="flex items-center justify-between py-3 px-4 bg-slate-800/40 rounded-lg">
              <div className="flex items-center gap-3">
                <span>{int.icon}</span>
                <span className="text-sm text-white">{int.name}</span>
              </div>
              <span className="text-xs text-slate-500">{int.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">🔔 Notifications</h3>
        <div className="space-y-3">
          {[
            { label: "New high-fit jobs", enabled: true },
            { label: "Application status changes", enabled: true },
            { label: "Recruiter responses", enabled: true },
            { label: "Interview invitations", enabled: true },
            { label: "Weekly summary", enabled: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{n.label}</span>
              <div className={`w-10 h-6 rounded-full ${n.enabled ? "bg-blue-500" : "bg-slate-700"} cursor-pointer`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 mx-1 ${n.enabled ? "translate-x-4" : ""}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-3">🔒 Privacy & Data Management</h3>
        <p className="text-xs text-slate-400 mb-4">
          Your candidate data is stored securely. You can download or delete your data at any time.
        </p>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary text-xs px-4 py-2">📥 Download My Data</button>
            <button className="btn-secondary text-xs px-4 py-2">🔗 Disconnect All Integrations</button>
            <button className="btn-secondary text-xs px-4 py-2">📄 Clear Application History</button>
            <button className="btn-secondary text-xs px-4 py-2 text-red-400 border-red-500/30 hover:bg-red-500/10">
              🗑️ Delete All My Data
            </button>
          </div>
        </div>
      </div>

      {/* Env Example */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-3">🔧 Environment Configuration</h3>
        <p className="text-xs text-slate-400 mb-3">
          For production deployment, configure these environment variables:
        </p>
        <pre className="text-xs text-slate-400 bg-slate-900/50 p-4 rounded-lg overflow-x-auto">
{`DATABASE_URL=
AI_PROVIDER_API_KEY=
NEXT_PUBLIC_APP_URL=
EMAIL_PROVIDER=
EMAIL_CLIENT_ID=
EMAIL_CLIENT_SECRET=
ENCRYPTION_KEY=`}
        </pre>
      </div>
    </div>
  );
}
