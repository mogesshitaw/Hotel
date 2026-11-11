"use client";

import { useThemeLang } from "@/context/ThemeLangContext";
import { SuperAdminSidebarStocky } from "@/components/SuperAdminSidebarStocky";
import { SuperAdminHeaderStocky } from "@/components/SuperAdminHeaderStocky";

interface AdminShellClientProps {
  admin: {
    name: string;
    email: string;
  };
  children: React.ReactNode;
}

export function AdminShellClient({ admin, children }: AdminShellClientProps) {
  const { theme } = useThemeLang();
  const isDark = theme === "dark";

  return (
    <div
      className={`flex min-h-screen transition-colors duration-200 ${
        isDark ? "bg-[#0b0f19] text-slate-100" : "bg-[#f1f5f9] text-slate-800"
      }`}
    >
      {/* ─── STOCKY SUPERADMIN COLLAPSIBLE SIDEBAR ───────────────────────── */}
      <SuperAdminSidebarStocky admin={admin} />

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <SuperAdminHeaderStocky admin={admin} />
        <main
          className={`p-4 sm:p-6 lg:p-8 flex-1 transition-colors duration-200 ${
            isDark ? "bg-[#0b0f19]" : "bg-[#f1f5f9]"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

