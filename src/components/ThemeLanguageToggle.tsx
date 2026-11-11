"use client";

import { useGlobalThemeLang } from "@/context/ThemeLangContext";

export function ThemeLanguageToggle() {
  const { theme, toggleTheme, lang, toggleLang } = useGlobalThemeLang();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Language Switcher */}
      <button
        type="button"
        onClick={toggleLang}
        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all shadow-xs ${
          isDark
            ? "border-[#253047] bg-[#161d2d] text-slate-200 hover:bg-[#1f283d]"
            : "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
        }`}
        title="Switch Language (English / አማርኛ)"
      >
        <span>{lang === "en" ? "🇬🇧" : "🇪🇹"}</span>
        <span>{lang === "en" ? "EN" : "አማ"}</span>
      </button>

      {/* Dark / Light Mode Switcher */}
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors shadow-xs ${
          isDark
            ? "border-[#253047] bg-[#161d2d] text-amber-400 hover:bg-[#1f283d]"
            : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>
      </button>
    </div>
  );
}

