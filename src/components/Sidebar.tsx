"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/jobs", label: "Jobs", icon: "💼" },
  { href: "/applications", label: "Applications", icon: "📋" },
  { href: "/responses", label: "Responses", icon: "📩" },
  { href: "/automation", label: "Automation", icon: "⚡" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/profile", label: "Profile", icon: "👤" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0c1222] border-r border-[#1e293b] flex flex-col z-50 max-md:hidden">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-6 py-5 border-b border-[#1e293b]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
          JP
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">JobPilot</h1>
          <p className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">AI Agent</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)) ? "active" : ""}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-[#1e293b]">
        <div className="demo-banner text-center">
          ⚠️ Demo Mode — Sample Data
        </div>
      </div>
    </aside>
  );
}
