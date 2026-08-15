"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TopBar() {
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) setUserName(data.name);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-xl border-b border-[#1e293b]">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
            JP
          </div>
          <span className="font-bold text-sm">JobPilot AI</span>
        </div>
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold text-white">
            {greeting}{userName ? `, ${userName}` : ""} 👋
          </h2>
          <p className="text-xs text-slate-400">Your AI job search is ready</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/onboarding"
            className="btn-secondary text-xs px-4 py-2"
          >
            Setup Profile
          </Link>
        </div>
      </div>
    </header>
  );
}
