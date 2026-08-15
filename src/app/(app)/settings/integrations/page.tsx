"use client";

import { useEffect, useState } from "react";
import { LoadingPage } from "@/components/LoadingState";

interface SourceInfo {
  name: string;
  displayName: string;
  status: string;
  lastSyncAt: string | null;
  jobCount: number;
  supportsAutoApply: boolean;
  supportsMessaging: boolean;
}

const STATUS_INFO: Record<string, { label: string; color: string; bgColor: string }> = {
  connected: { label: "Connected", color: "text-emerald-400", bgColor: "bg-emerald-400" },
  assisted_only: { label: "Assisted Mode", color: "text-amber-400", bgColor: "bg-amber-400" },
  disconnected: { label: "Not Connected", color: "text-slate-500", bgColor: "bg-slate-500" },
  error: { label: "Error", color: "text-red-400", bgColor: "bg-red-400" },
};

const OTHER_INTEGRATIONS = [
  { name: "Gmail", description: "Monitor hiring emails and detect responses", icon: "📧", status: "not_connected" },
  { name: "Outlook", description: "Monitor hiring emails and detect responses", icon: "📨", status: "not_connected" },
  { name: "GitHub", description: "Import projects and contributions", icon: "🐙", status: "not_connected" },
  { name: "LinkedIn Profile", description: "Import profile data (read-only)", icon: "🔗", status: "not_connected" },
  { name: "Telegram", description: "Receive notifications", icon: "📱", status: "not_connected" },
  { name: "Slack", description: "Receive notifications", icon: "💬", status: "not_connected" },
];

export default function IntegrationsPage() {
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sources")
      .then((r) => r.json())
      .then((json) => setSources(json.sources || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage message="Loading integrations..." />;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">🔌 Integrations</h2>
        <p className="text-sm text-slate-400 mt-1">
          Connect job platforms and services. All integrations use authorized OAuth or official APIs only.
        </p>
      </div>

      {/* Job Sources */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Job Sources</h3>
        <div className="space-y-3">
          {sources.map((src) => {
            const statusInfo = STATUS_INFO[src.status] || STATUS_INFO.disconnected;
            return (
              <div
                key={src.name}
                className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${statusInfo.bgColor}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{src.displayName}</p>
                    <p className="text-xs text-slate-500">
                      {src.jobCount > 0 && `${src.jobCount} jobs indexed • `}
                      {src.supportsAutoApply ? "Auto-apply available" : "Assisted mode only"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                  {src.status === "connected" || src.status === "assisted_only" ? (
                    <button className="btn-secondary text-xs px-3 py-1.5">Configure</button>
                  ) : (
                    <button className="btn-primary text-xs px-3 py-1.5">Connect</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300">
            <strong>Note:</strong> Most job platforms do not provide public APIs for automated job applications.
            These sources operate in <strong>Assisted Mode</strong> — we discover jobs and prepare your application,
            but you complete the final submission on the original platform.
          </p>
        </div>
      </div>

      {/* Other Integrations */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Other Services</h3>
        <div className="space-y-3">
          {OTHER_INTEGRATIONS.map((int) => (
            <div
              key={int.name}
              className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{int.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{int.name}</p>
                  <p className="text-xs text-slate-500">{int.description}</p>
                </div>
              </div>
              <button className="btn-secondary text-xs px-3 py-1.5">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">🔐 API Configuration</h3>
        <p className="text-xs text-slate-400 mb-4">
          For production deployment, configure these environment variables on your hosting provider (e.g., Vercel).
        </p>
        <div className="bg-slate-900/60 p-4 rounded-lg overflow-x-auto">
          <pre className="text-xs text-slate-400 whitespace-pre">
{`# Database
DATABASE_URL=postgresql://...

# AI Provider (OpenAI, Gemini, Anthropic)
AI_PROVIDER=openai
AI_API_KEY=sk-...

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Email Integration (Gmail OAuth)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Security
ENCRYPTION_KEY=...
SESSION_SECRET=...

# Optional: Background Workers
REDIS_URL=redis://...
QUEUE_URL=...`}
          </pre>
        </div>
      </div>

      {/* Security Notice */}
      <div className="glass-card p-6 border border-emerald-500/20">
        <h3 className="text-base font-semibold text-white mb-2">🛡️ Security & Compliance</h3>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• All OAuth integrations use official authorization flows</li>
          <li>• API keys are encrypted and never exposed to the frontend</li>
          <li>• We never store your passwords for external services</li>
          <li>• You can disconnect any integration at any time</li>
          <li>• We comply with platform terms of service</li>
        </ul>
      </div>
    </div>
  );
}
