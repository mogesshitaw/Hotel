"use client";

import Link from "next/link";
import { useThemeLang } from "@/context/ThemeLangContext";
import { adminDict } from "@/lib/i18n/adminDict";

interface SuperAdminHeaderStockyProps {
  admin: {
    name: string;
    email: string;
  };
}

export function SuperAdminHeaderStocky({ admin }: SuperAdminHeaderStockyProps) {
  const { theme, toggleTheme, lang, toggleLang } = useThemeLang();
  const t = adminDict[lang];
  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-20 border-b backdrop-blur-md transition-colors ${
        isDark
          ? "bg-[#0f141f]/95 border-[#1e2638] text-slate-200"
          : "bg-white/95 border-slate-200 text-slate-800"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left Side: Context / Switch to Tenant view */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isDark
                ? "border-[#253047] bg-[#161d2d] text-slate-300 hover:bg-[#1f283d] hover:text-white"
                : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span>🍽️</span>
            <span>{lang === "en" ? "Restaurant ERP View" : "የሬስቶራንት ERP እይታ"}</span>
            <span className="text-[10px] opacity-60">↗</span>
          </Link>
        </div>

        {/* Right Side: Language Toggle + Dark/Light Toggle + Notification + User */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher (EN / AM) */}
          <button
            type="button"
            onClick={toggleLang}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-xs ${
              isDark
                ? "border-[#253047] bg-[#161d2d] text-slate-200 hover:bg-[#1f283d]"
                : "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
            title="Switch Language / ቋንቋ ቀይር"
          >
            <span>{lang === "en" ? "🇬🇧" : "🇪🇹"}</span>
            <span>{lang === "en" ? "EN" : "አማ"}</span>
            <span className="text-[10px] text-slate-400">▾</span>
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
              isDark
                ? "border-[#253047] bg-[#161d2d] text-amber-400 hover:bg-[#1f283d]"
                : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span>{isDark ? "🌙" : "☀️"}</span>
          </button>

          {/* Activity / Notification Bell */}
          <button
            type="button"
            className={`relative flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
              isDark
                ? "border-[#253047] bg-[#161d2d] text-slate-300 hover:bg-[#1f283d]"
                : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span className="text-xs">🔔</span>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
          </button>

          {/* User Profile Pill */}
          <div
            className={`flex items-center gap-2 rounded-xl border pl-1.5 pr-3 py-1 transition-colors ${
              isDark
                ? "border-[#253047] bg-[#161d2d] text-slate-200"
                : "border-slate-300 bg-slate-50 text-slate-800"
            }`}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 text-[10px] font-black text-white shadow-xs">
              ✦
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold leading-none">{t.superAdmin}</span>
              <span className="text-[9px] text-slate-400 leading-none">▾</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

