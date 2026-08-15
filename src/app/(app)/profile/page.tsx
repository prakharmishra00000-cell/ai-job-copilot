"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ScoreCircle from "@/components/ScoreCircle";
import { LoadingPage, EmptyState } from "@/components/LoadingState";

interface ProfileData {
  id: string;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  personalInfo: { name?: string; email?: string; phone?: string; location?: string } | null;
  skills: Record<string, string[]> | null;
  experience: Array<{ company: string; role: string; duration: string; responsibilities: string[]; achievements: string[] }> | null;
  education: Array<{ degree: string; university: string; graduationYear: string }> | null;
  projects: Array<{ name: string; description: string; technologies: string[]; liveUrl?: string; githubUrl?: string }> | null;
  certifications: string[] | null;
  portfolioAnalysis: {
    overallScore: number;
    frontend: number;
    backend: number;
    aiIntegration: number;
    uiux: number;
    projects: number;
    professionalPresentation: number;
    recruiterReadiness: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null;
  preferences: {
    targetRoles: string[];
    locations: string[];
    workMode: string[];
    salaryMin: number;
    experienceLevel: string;
    employmentTypes: string[];
    technologies: string[];
  } | null;
  inferredRoles: string[] | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage message="Loading profile..." />;

  if (!profile) {
    return (
      <EmptyState
        icon="👤"
        title="No profile yet"
        description="Complete onboarding to set up your candidate profile."
        action={
          <Link href="/onboarding" className="btn-primary text-sm px-6 py-2.5">
            🚀 Setup Profile
          </Link>
        }
      />
    );
  }

  const pa = profile.portfolioAnalysis;
  const skills = profile.skills;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">👤 Candidate Profile</h2>
        <Link href="/onboarding" className="btn-secondary text-xs px-4 py-2">
          ✏️ Edit Profile
        </Link>
      </div>

      {/* Personal Info */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {profile.personalInfo?.name && (
            <div>
              <span className="text-slate-400">Name:</span>
              <span className="text-white ml-2">{profile.personalInfo.name}</span>
            </div>
          )}
          {profile.personalInfo?.email && (
            <div>
              <span className="text-slate-400">Email:</span>
              <span className="text-white ml-2">{profile.personalInfo.email}</span>
            </div>
          )}
          {profile.portfolioUrl && (
            <div>
              <span className="text-slate-400">Portfolio:</span>
              <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 ml-2 hover:underline">
                {profile.portfolioUrl}
              </a>
            </div>
          )}
          {profile.linkedinUrl && (
            <div>
              <span className="text-slate-400">LinkedIn:</span>
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 ml-2 hover:underline">
                {profile.linkedinUrl}
              </a>
            </div>
          )}
          {profile.githubUrl && (
            <div>
              <span className="text-slate-400">GitHub:</span>
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 ml-2 hover:underline">
                {profile.githubUrl}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Analysis */}
      {pa && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Portfolio Analysis</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            <ScoreCircle score={pa.overallScore} size={80} label="Overall" />
            <ScoreCircle score={pa.frontend} size={60} label="Frontend" />
            <ScoreCircle score={pa.backend} size={60} label="Backend" />
            <ScoreCircle score={pa.aiIntegration} size={60} label="AI/ML" />
            <ScoreCircle score={pa.uiux} size={60} label="UI/UX" />
            <ScoreCircle score={pa.projects} size={60} label="Projects" />
            <ScoreCircle score={pa.professionalPresentation} size={60} label="Professional" />
            <ScoreCircle score={pa.recruiterReadiness} size={60} label="Recruiter Ready" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-emerald-400 mb-2">✅ Strengths</h4>
              <ul className="space-y-1">
                {pa.strengths.map((s, i) => <li key={i} className="text-xs text-slate-300">• {s}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-400 mb-2">⚠️ Weaknesses</h4>
              <ul className="space-y-1">
                {pa.weaknesses.map((w, i) => <li key={i} className="text-xs text-slate-300">• {w}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-2">💡 Recommendations</h4>
              <ul className="space-y-1">
                {pa.recommendations.map((r, i) => <li key={i} className="text-xs text-slate-300">• {r}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && Object.keys(skills).length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Skills</h3>
          <div className="space-y-3">
            {Object.entries(skills).map(([category, skillList]) => (
              <div key={category}>
                <h4 className="text-xs text-slate-400 capitalize mb-1.5">
                  {category.replace(/([A-Z])/g, " $1").trim()}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(skillList as string[]).map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inferred Roles */}
      {profile.inferredRoles && profile.inferredRoles.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-3">AI-Suggested Roles</h3>
          <div className="flex flex-wrap gap-2">
            {profile.inferredRoles.map((r, i) => (
              <span key={i} className="badge badge-purple text-xs">{r}</span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {profile.projects && profile.projects.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Projects ({profile.projects.length})</h3>
          <div className="space-y-4">
            {profile.projects.map((p, i) => (
              <div key={i} className="p-4 bg-slate-800/40 rounded-xl">
                <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.technologies.map((t, j) => (
                    <span key={j} className="px-2 py-0.5 rounded bg-blue-500/10 text-[10px] text-blue-400">{t}</span>
                  ))}
                </div>
                <div className="flex gap-3 mt-2">
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">🔗 Live</a>}
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:underline">GitHub</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences */}
      {profile.preferences && (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Job Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {profile.preferences.targetRoles.length > 0 && (
              <div>
                <span className="text-slate-400">Target Roles:</span>
                <span className="text-white ml-2">{profile.preferences.targetRoles.join(", ")}</span>
              </div>
            )}
            {profile.preferences.locations.length > 0 && (
              <div>
                <span className="text-slate-400">Locations:</span>
                <span className="text-white ml-2">{profile.preferences.locations.join(", ")}</span>
              </div>
            )}
            {profile.preferences.workMode.length > 0 && (
              <div>
                <span className="text-slate-400">Work Mode:</span>
                <span className="text-white ml-2">{profile.preferences.workMode.join(", ")}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400">Experience:</span>
              <span className="text-white ml-2">{profile.preferences.experienceLevel}</span>
            </div>
            {profile.preferences.salaryMin > 0 && (
              <div>
                <span className="text-slate-400">Min Salary:</span>
                <span className="text-white ml-2">₹{(profile.preferences.salaryMin / 100000).toFixed(1)} LPA</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Privacy */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-3">🔒 Privacy & Data</h3>
        <p className="text-xs text-slate-400 mb-4">Your data is stored securely and never shared without your consent.</p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary text-xs px-4 py-2">📥 Download My Data</button>
          <button className="btn-secondary text-xs px-4 py-2 text-red-400 border-red-500/30">🗑️ Delete All Data</button>
        </div>
      </div>
    </div>
  );
}
