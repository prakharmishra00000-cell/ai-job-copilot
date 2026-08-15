import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
            JP
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">JobPilot AI</h1>
            <p className="text-[10px] text-blue-400 font-medium tracking-widest uppercase">Autonomous Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn-secondary text-sm px-5 py-2.5">
            Dashboard
          </Link>
          <Link href="/onboarding" className="btn-primary text-sm px-5 py-2.5">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 pulse-dot" />
          AI-Powered Job Search Agent
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
          Your AI-Powered Job Search
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            & Application Agent
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Find better opportunities, understand your fit, personalize every application,
          and track your entire job search from one intelligent workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/onboarding"
            className="btn-primary text-base px-8 py-3.5 flex items-center gap-2"
          >
            🚀 Analyze My Portfolio
          </Link>
          <Link
            href="/dashboard"
            className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2"
          >
            📊 Start Job Search
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {[
            {
              icon: "🔍",
              title: "Intelligent Discovery",
              desc: "AI searches multiple legitimate job sources, deduplicates results, and ranks by your fit score.",
            },
            {
              icon: "🎯",
              title: "Smart Scoring",
              desc: "Multi-factor AI scoring calculates fit probability and estimated shortlist chance for every job.",
            },
            {
              icon: "⚡",
              title: "Assisted Applications",
              desc: "Auto-generates customized cover letters, resumes, and answers. Tracks every application.",
            },
          ].map((f) => (
            <div key={f.title} className="glass-card p-6 text-left">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="text-base font-semibold text-white mt-3 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-white mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { step: "01", title: "Upload Your Profile", desc: "Add your portfolio URL, resume, LinkedIn, GitHub, and let AI analyze your skills." },
            { step: "02", title: "Set Preferences", desc: "Choose target roles, locations, salary range, technologies, and work mode preferences." },
            { step: "03", title: "AI Discovers & Ranks", desc: "Continuous scanning finds jobs, calculates fit scores, and ranks your best opportunities." },
            { step: "04", title: "Apply & Track", desc: "One-click application preparation with customized materials. Track every application status." },
          ].map((s) => (
            <div key={s.step} className="glass-card p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-white mb-10">Complete Platform</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Portfolio Analysis", "Multi-Source Search", "AI Fit Scoring",
            "Shortlist Probability", "Job Deduplication", "Cover Letters",
            "Application Tracking", "Response Detection", "Recruiter Outreach",
            "24/7 Monitoring", "Activity Logs", "Career Analytics",
          ].map((f) => (
            <div key={f} className="glass-card p-4 text-center text-xs font-medium text-slate-300">
              {f}
            </div>
          ))}
        </div>
      </section>

      {/* Compliance */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-center">
        <div className="glass-card p-8">
          <h3 className="text-lg font-semibold text-white mb-3">🛡️ Compliance & Ethics</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            JobPilot AI uses only official APIs, authorized integrations, and permitted job feeds.
            We never bypass CAPTCHAs, login systems, or anti-bot protection. Where automation
            is not permitted, we switch to Assisted Application Mode — preparing everything for
            you to submit manually. We never fabricate qualifications, experience, or application statuses.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-center pb-20">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Job Search?</h2>
        <p className="text-slate-400 mb-8">Start with your portfolio and let AI do the heavy lifting.</p>
        <Link href="/onboarding" className="btn-primary text-base px-10 py-4">
          🚀 Get Started — Free
        </Link>
      </section>
    </div>
  );
}
