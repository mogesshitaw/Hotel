import React from "react";

export const inputCls =
  "w-full rounded-xl border border-slate-200 dark:border-[#25324d] bg-white dark:bg-[#151c2c] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:bg-slate-100 dark:disabled:bg-[#111622] disabled:opacity-50";

export const selectCls =
  "w-full rounded-xl border border-slate-200 dark:border-[#25324d] bg-white dark:bg-[#151c2c] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

export const btnCls =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-amber-500/20 transition-all duration-200 hover:from-amber-500 hover:to-orange-500 hover:shadow-md hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

export const btnSecondaryCls =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-[#283556] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 dark:hover:bg-[#354673] active:scale-[0.98] disabled:opacity-50";

export const ghostCls =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#25324d] bg-white dark:bg-[#1c253b] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-all duration-200 hover:border-slate-300 dark:hover:border-[#3a4b75] hover:bg-slate-50 dark:hover:bg-[#25324d] hover:text-slate-900 dark:hover:text-white active:scale-[0.98]";

export const dangerGhostCls =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-[#1c253b] px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 shadow-xs transition-all duration-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 active:scale-[0.98]";

export const cardCls =
  "rounded-2xl border border-slate-200/80 dark:border-[#222d42] bg-white dark:bg-[#151c2c] text-slate-900 dark:text-slate-100 p-5 shadow-xs transition-all duration-200 hover:shadow-sm";

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: "success" | "warning" | "danger" | "neutral" | "brand";
  children: React.ReactNode;
  className?: string;
}) {
  const variants = {
    success: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
    warning: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
    danger: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50",
    neutral: "bg-slate-100 dark:bg-[#1c253b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#25324d]",
    brand: "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-700/40",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
