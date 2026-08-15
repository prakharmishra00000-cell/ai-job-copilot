import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";
import AICopilot from "@/components/AICopilot";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:ml-64">
        <TopBar />
        <main className="p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>
      <MobileNav />
      <AICopilot />
    </div>
  );
}
