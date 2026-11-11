"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";
export type AppLang = "en" | "am";

interface GlobalThemeLangContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  lang: AppLang;
  setLang: (l: AppLang) => void;
  toggleLang: () => void;
}

const GlobalThemeLangContext = createContext<GlobalThemeLangContextType>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
});

export function GlobalThemeLangProvider({ children }: { children: React.ReactNode }) {
  // ─── THEME ─────────────────────────────────────────────────────────────────
  // Lazy initializer is safe here: theme only affects CSS classes on <html>,
  // which has suppressHydrationWarning — React ignores class mismatches there.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const v = localStorage.getItem("global_app_theme");
      return v === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  // ─── LANG ──────────────────────────────────────────────────────────────────
  // Must start as "en" to match what the server renders.
  // After hydration, useEffect reads localStorage — this avoids a React
  // hydration mismatch error while still restoring the user's preference.
  const [lang, setLangState] = useState<AppLang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("global_app_lang");
      if (saved === "am" || saved === "en") {
        setLangState(saved);
      }
    } catch {}
  }, []);

  // ─── Sync theme class on <html> ────────────────────────────────────────────
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
      localStorage.setItem("global_app_theme", theme);
    } catch {}
  }, [theme]);

  // ─── Persist lang ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem("global_app_lang", lang);
    } catch {}
  }, [lang]);

  const setTheme    = (t: Theme)   => setThemeState(t);
  const setLang     = (l: AppLang) => setLangState(l);
  const toggleTheme = () => setThemeState((p) => (p === "dark"  ? "light" : "dark"));
  const toggleLang  = () => setLangState((p)  => (p === "en"    ? "am"   : "en"));

  return (
    <GlobalThemeLangContext.Provider
      value={{ theme, setTheme, toggleTheme, lang, setLang, toggleLang }}
    >
      {children}
    </GlobalThemeLangContext.Provider>
  );
}

export function useGlobalThemeLang() {
  return useContext(GlobalThemeLangContext);
}

// Backward-compatibility aliases
export const useThemeLang      = useGlobalThemeLang;
export const ThemeLangProvider = GlobalThemeLangProvider;
