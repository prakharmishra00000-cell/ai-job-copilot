"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingData {
  name: string;
  email: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeText: string;
  personalInfo: { name?: string; email?: string; phone?: string; location?: string };
  experience: Array<{ company: string; role: string; duration: string; responsibilities: string[]; achievements: string[] }>;
  education: Array<{ degree: string; university: string; graduationYear: string; coursework: string[] }>;
  projects: Array<{ name: string; description: string; technologies: string[]; role: string; complexity: string; achievements: string[]; liveUrl?: string; githubUrl?: string }>;
  certifications: string[];
  preferences: {
    targetRoles: string[];
    locations: string[];
    workMode: string[];
    salaryMin: number;
    salaryCurrency: string;
    experienceLevel: string;
    employmentTypes: string[];
    industries: string[];
    technologies: string[];
  };
}

const STEPS = ["Profile", "Skills & Experience", "Projects", "Preferences"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    email: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    resumeText: "",
    personalInfo: {},
    experience: [],
    education: [{ degree: "", university: "", graduationYear: "", coursework: [] }],
    projects: [{ name: "", description: "", technologies: [], role: "", complexity: "medium", achievements: [], liveUrl: "", githubUrl: "" }],
    certifications: [],
    preferences: {
      targetRoles: [],
      locations: [],
      workMode: ["Remote"],
      salaryMin: 500000,
      salaryCurrency: "INR",
      experienceLevel: "Fresher",
      employmentTypes: ["Full-time"],
      industries: [],
      technologies: [],
    },
  });

  function updateField<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      // Build resume text from all provided data for skill extraction
      const resumeText = [
        data.name,
        data.resumeText,
        ...data.projects.map((p) => `${p.name} ${p.description} ${p.technologies.join(" ")}`),
        ...data.experience.map((e) => `${e.role} ${e.company} ${e.responsibilities.join(" ")} ${e.achievements.join(" ")}`),
        ...(data.preferences.technologies || []),
        ...(data.preferences.targetRoles || []),
      ].join(" ");

      const payload = {
        name: data.name || "User",
        email: data.email || "user@jobpilot.ai",
        portfolioUrl: data.portfolioUrl,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        resumeText,
        personalInfo: { ...data.personalInfo, name: data.name, email: data.email },
        experience: data.experience.filter((e) => e.company),
        education: data.education.filter((e) => e.degree),
        projects: data.projects.filter((p) => p.name),
        certifications: data.certifications.filter(Boolean),
        preferences: data.preferences,
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const rolesInput = data.preferences.targetRoles.join(", ");
  const locationsInput = data.preferences.locations.join(", ");
  const techsInput = data.preferences.technologies.join(", ");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">🚀 Setup Your Profile</h2>
        <p className="text-sm text-slate-400 mt-1">
          Tell us about yourself so AI can find and rank the best jobs for you.
        </p>
      </div>

      {/* Steps */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              step === i
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-slate-800/50 text-slate-400 border border-transparent"
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {/* Step 1: Profile */}
      {step === 0 && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Full Name *</label>
              <input type="text" value={data.name} onChange={(e) => updateField("name", e.target.value)} className="input-field text-sm" placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Email *</label>
              <input type="email" value={data.email} onChange={(e) => updateField("email", e.target.value)} className="input-field text-sm" placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Portfolio URL</label>
              <input type="url" value={data.portfolioUrl} onChange={(e) => updateField("portfolioUrl", e.target.value)} className="input-field text-sm" placeholder="https://yourportfolio.com" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">LinkedIn URL</label>
              <input type="url" value={data.linkedinUrl} onChange={(e) => updateField("linkedinUrl", e.target.value)} className="input-field text-sm" placeholder="https://linkedin.com/in/you" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">GitHub URL</label>
              <input type="url" value={data.githubUrl} onChange={(e) => updateField("githubUrl", e.target.value)} className="input-field text-sm" placeholder="https://github.com/you" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Phone</label>
              <input type="tel" value={data.personalInfo.phone || ""} onChange={(e) => updateField("personalInfo", { ...data.personalInfo, phone: e.target.value })} className="input-field text-sm" placeholder="+91 ..." />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Resume/CV Text (paste your resume content)</label>
            <textarea
              value={data.resumeText}
              onChange={(e) => updateField("resumeText", e.target.value)}
              rows={6}
              className="input-field text-sm"
              placeholder="Paste your resume text here for AI analysis. Include skills, experience, projects, education..."
            />
          </div>
          <button onClick={() => setStep(1)} className="btn-primary text-sm px-6 py-2.5">
            Next: Skills & Experience →
          </button>
        </div>
      )}

      {/* Step 2: Skills & Experience */}
      {step === 1 && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Education</h3>
          {data.education.map((edu, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-800/30 rounded-lg">
              <input type="text" value={edu.degree} onChange={(e) => {
                const updated = [...data.education];
                updated[i] = { ...edu, degree: e.target.value };
                updateField("education", updated);
              }} className="input-field text-sm" placeholder="Degree (e.g., B.Tech CS)" />
              <input type="text" value={edu.university} onChange={(e) => {
                const updated = [...data.education];
                updated[i] = { ...edu, university: e.target.value };
                updateField("education", updated);
              }} className="input-field text-sm" placeholder="University" />
              <input type="text" value={edu.graduationYear} onChange={(e) => {
                const updated = [...data.education];
                updated[i] = { ...edu, graduationYear: e.target.value };
                updateField("education", updated);
              }} className="input-field text-sm" placeholder="Graduation Year" />
            </div>
          ))}

          <h3 className="text-base font-semibold text-white mt-6">Experience (optional)</h3>
          {data.experience.map((exp, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-800/30 rounded-lg">
              <input type="text" value={exp.company} onChange={(e) => {
                const updated = [...data.experience];
                updated[i] = { ...exp, company: e.target.value };
                updateField("experience", updated);
              }} className="input-field text-sm" placeholder="Company" />
              <input type="text" value={exp.role} onChange={(e) => {
                const updated = [...data.experience];
                updated[i] = { ...exp, role: e.target.value };
                updateField("experience", updated);
              }} className="input-field text-sm" placeholder="Role" />
              <input type="text" value={exp.duration} onChange={(e) => {
                const updated = [...data.experience];
                updated[i] = { ...exp, duration: e.target.value };
                updateField("experience", updated);
              }} className="input-field text-sm" placeholder="Duration (e.g., 6 months)" />
            </div>
          ))}
          <button onClick={() => updateField("experience", [...data.experience, { company: "", role: "", duration: "", responsibilities: [], achievements: [] }])} className="text-xs text-blue-400 hover:text-blue-300">
            + Add Experience
          </button>

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(0)} className="btn-secondary text-sm px-6 py-2.5">← Back</button>
            <button onClick={() => setStep(2)} className="btn-primary text-sm px-6 py-2.5">Next: Projects →</button>
          </div>
        </div>
      )}

      {/* Step 3: Projects */}
      {step === 2 && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Projects</h3>
          {data.projects.map((proj, i) => (
            <div key={i} className="space-y-3 p-4 bg-slate-800/30 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={proj.name} onChange={(e) => {
                  const updated = [...data.projects];
                  updated[i] = { ...proj, name: e.target.value };
                  updateField("projects", updated);
                }} className="input-field text-sm" placeholder="Project Name" />
                <input type="text" value={proj.technologies.join(", ")} onChange={(e) => {
                  const updated = [...data.projects];
                  updated[i] = { ...proj, technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) };
                  updateField("projects", updated);
                }} className="input-field text-sm" placeholder="Technologies (comma-separated)" />
              </div>
              <textarea value={proj.description} onChange={(e) => {
                const updated = [...data.projects];
                updated[i] = { ...proj, description: e.target.value };
                updateField("projects", updated);
              }} className="input-field text-sm" rows={2} placeholder="Description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="url" value={proj.liveUrl || ""} onChange={(e) => {
                  const updated = [...data.projects];
                  updated[i] = { ...proj, liveUrl: e.target.value };
                  updateField("projects", updated);
                }} className="input-field text-sm" placeholder="Live URL (optional)" />
                <input type="url" value={proj.githubUrl || ""} onChange={(e) => {
                  const updated = [...data.projects];
                  updated[i] = { ...proj, githubUrl: e.target.value };
                  updateField("projects", updated);
                }} className="input-field text-sm" placeholder="GitHub URL (optional)" />
              </div>
            </div>
          ))}
          <button onClick={() => updateField("projects", [...data.projects, { name: "", description: "", technologies: [], role: "", complexity: "medium", achievements: [], liveUrl: "", githubUrl: "" }])} className="text-xs text-blue-400 hover:text-blue-300">
            + Add Project
          </button>

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(1)} className="btn-secondary text-sm px-6 py-2.5">← Back</button>
            <button onClick={() => setStep(3)} className="btn-primary text-sm px-6 py-2.5">Next: Preferences →</button>
          </div>
        </div>
      )}

      {/* Step 4: Preferences */}
      {step === 3 && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Job Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Roles (comma-separated)</label>
              <input type="text" value={rolesInput} onChange={(e) => updateField("preferences", { ...data.preferences, targetRoles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="input-field text-sm" placeholder="AI Full Stack Developer, Frontend Developer..." />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Preferred Locations (comma-separated)</label>
              <input type="text" value={locationsInput} onChange={(e) => updateField("preferences", { ...data.preferences, locations: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="input-field text-sm" placeholder="Bangalore, Remote, India..." />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Technologies (comma-separated)</label>
              <input type="text" value={techsInput} onChange={(e) => updateField("preferences", { ...data.preferences, technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="input-field text-sm" placeholder="React, Next.js, Node.js, AI..." />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Experience Level</label>
              <select value={data.preferences.experienceLevel} onChange={(e) => updateField("preferences", { ...data.preferences, experienceLevel: e.target.value })} className="input-field text-sm">
                <option value="Fresher">Fresher / 0 years</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Minimum Salary (Annual, ₹)</label>
              <input type="number" value={data.preferences.salaryMin} onChange={(e) => updateField("preferences", { ...data.preferences, salaryMin: parseInt(e.target.value) || 0 })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Work Mode</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {["Remote", "Hybrid", "On-site"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      const current = data.preferences.workMode;
                      const updated = current.includes(mode)
                        ? current.filter((m) => m !== mode)
                        : [...current, mode];
                      updateField("preferences", { ...data.preferences, workMode: updated });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      data.preferences.workMode.includes(mode)
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
              <label className="text-xs text-slate-400 block mb-1">Employment Type</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {["Full-time", "Internship", "Part-time", "Contract", "Freelance"].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      const current = data.preferences.employmentTypes;
                      const updated = current.includes(type)
                        ? current.filter((t) => t !== type)
                        : [...current, type];
                      updateField("preferences", { ...data.preferences, employmentTypes: updated });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      data.preferences.employmentTypes.includes(type)
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(2)} className="btn-secondary text-sm px-6 py-2.5">← Back</button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary text-sm px-8 py-2.5 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>🚀 Complete Setup & Analyze</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
