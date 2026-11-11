"use client";

import { useGlobalThemeLang } from "@/context/ThemeLangContext";
import { ErpSidebar, NavSection } from "@/components/ErpSidebar";
import { ThemeLanguageToggle } from "@/components/ThemeLanguageToggle";
import Link from "next/link";

interface DashboardShellClientProps {
  restaurant: {
    name: string;
    nameAm?: string | null;
    slug: string;
  };
  role: string;
  roleMeta: {
    label: string;
    color: string;
    desc: string;
  };
  sections: NavSection[];
  children: React.ReactNode;
}

export function DashboardShellClient({
  restaurant,
  role,
  roleMeta,
  sections,
  children,
}: DashboardShellClientProps) {
  const { theme, lang } = useGlobalThemeLang();
  const isDark = theme === "dark";

  return (
    <div
      className={`flex min-h-screen transition-colors duration-200 ${
        isDark ? "bg-[#0b0f19] text-slate-100" : "bg-[#f1f5f9] text-slate-800"
      }`}
    >
      {/* ─── ROLE-BASED COLLAPSIBLE SIDEBAR ───────────────────────────────── */}
      <ErpSidebar
        restaurant={restaurant}
        role={role}
        roleMeta={roleMeta}
        sections={sections}
      />

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header with Theme & Language Controls */}
        <header
          className={`sticky top-0 z-10 border-b backdrop-blur-md transition-colors ${
            isDark
              ? "bg-[#0f141f]/95 border-[#1e2638] text-slate-100"
              : "bg-white/95 border-slate-200 text-slate-800 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            {/* Mobile Brand */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 font-bold text-white text-sm">
                {restaurant.name.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-sm truncate max-w-[120px] block">
                  {restaurant.name}
                </span>
                <span className="text-[10px] font-semibold opacity-60">Role: {role}</span>
              </div>
            </div>

            {/* Desktop Workspace Context */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-medium opacity-60">
                {lang === "am" ? "ተቋም:" : "Tenant:"}
              </span>
              <span className="text-xs font-bold text-amber-500">{restaurant.name}</span>
              <span className="opacity-40">•</span>
              <span className="text-xs font-medium opacity-60">
                {lang === "am" ? "የስራ ቦታ:" : "Workspace:"}
              </span>
              <span className="text-xs font-bold">{roleMeta.label}</span>
            </div>

            {/* Top Right Controls (Theme & Lang Toggle + Live Menu + Admin jump) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeLanguageToggle />

              <Link
                href={`/menu/${restaurant.slug}`}
                target="_blank"
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isDark
                    ? "border-[#253047] bg-[#161d2d] text-slate-300 hover:bg-[#1f283d] hover:text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{lang === "am" ? "የደንበኛ ሜኑ" : "Live Menu"}</span>
                <span className="opacity-50">↗</span>
              </Link>

              {role === "OWNER" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 rounded-xl bg-violet-600/10 border border-violet-500/30 px-3 py-1.5 text-xs font-bold text-violet-400 hover:bg-violet-600/20 transition-all"
                >
                  <span>⚡ Super Admin</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Horizontal Quick Navigation */}
          <div
            className={`md:hidden overflow-x-auto no-scrollbar flex gap-1 p-2 border-t ${
              isDark ? "border-[#1e2638]" : "border-slate-200"
            }`}
          >
            {sections.flatMap((s) => s.items).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isDark
                    ? "text-slate-300 hover:bg-[#1a2233]"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </header>

        {/* Dynamic Theme Content Body */}
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

