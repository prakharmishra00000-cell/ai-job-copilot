"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MOBILE_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "📊" },
  { href: "/jobs", label: "Jobs", icon: "💼" },
  { href: "/applications", label: "Apps", icon: "📋" },
  { href: "/automation", label: "Auto", icon: "⚡" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0c1222] border-t border-[#1e293b] md:hidden z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center py-2">
        {MOBILE_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs ${
                isActive ? "text-blue-400" : "text-slate-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
