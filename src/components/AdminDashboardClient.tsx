"use client";

import Link from "next/link";
import { useThemeLang } from "@/context/ThemeLangContext";
import { adminDict } from "@/lib/i18n/adminDict";

interface AdminDashboardClientProps {
  stats: {
    totalRestaurants: number;
    activeRestaurants: number;
    trialRestaurants: number;
    activePlans: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    plansCountByTier: { tier: string; name: string; count: number }[];
    recentRestaurants: {
      id: string;
      name: string;
      slug: string;
      createdAt: string;
      isActive: boolean;
      subscriptionPlan?: string;
    }[];
  };
}

export function AdminDashboardClient({ stats }: AdminDashboardClientProps) {
  const { theme, lang } = useThemeLang();
  const t = adminDict[lang];
  const isDark = theme === "dark";

  // Formatted date matching reference (e.g. Sunday, Apr 05, 2026)
  const todayFormatted = new Intl.DateTimeFormat(
    lang === "en" ? "en-US" : "am-ET",
    {
      weekday: "long",
      month: "short",
      day: "2-digit",
      year: "numeric",
    }
  ).format(new Date());

  const cardBg = isDark ? "bg-[#151c2c] border-[#222d42]" : "bg-white border-slate-200 shadow-sm";
  const innerCardBg = isDark ? "bg-[#1c253b] border-[#25324d]" : "bg-slate-50 border-slate-200";
  const textTitle = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`space-y-6 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
      {/* ─── 1. TOP TITLE & DATE ROW ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${textTitle}`}>
            {t.greeting}
          </h1>
          <p className={`text-xs mt-0.5 ${textMuted}`}>{t.subGreeting}</p>
        </div>

        {/* Date pill matching reference */}
        <div
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-semibold ${
            isDark
              ? "border-[#25324d] bg-[#161d2d] text-slate-300"
              : "border-slate-300 bg-white text-slate-700 shadow-xs"
          }`}
        >
          <span>📅</span>
          <span>{todayFormatted}</span>
        </div>
      </div>

      {/* ─── 2. FOUR KPI CARDS (Matching Reference Header Row) ──────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Tenants */}
        <div className={`rounded-2xl border p-5 transition-all ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm">
              📱
            </div>
          </div>
          <p className={`text-3xl font-black ${textTitle}`}>{stats.totalRestaurants}</p>
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">
            {t.totalTenants}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/40">
            <Link
              href="/admin/tenants"
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>{t.viewAllTenants}</span>
            </Link>
          </div>
        </div>

        {/* Active / Trial */}
        <div className={`rounded-2xl border p-5 transition-all ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              ✓
            </div>
          </div>
          <p className={`text-3xl font-black ${textTitle}`}>{stats.activeRestaurants}</p>
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">
            {t.activeTrial}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/40">
            <Link
              href="/admin/subscriptions"
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{t.viewSubscriptions}</span>
            </Link>
          </div>
        </div>

        {/* Active Plans */}
        <div className={`rounded-2xl border p-5 transition-all ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
              🏷️
            </div>
          </div>
          <p className={`text-3xl font-black ${textTitle}`}>{stats.activePlans}</p>
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">
            {t.activePlans}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/40">
            <Link
              href="/admin/plans"
              className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{t.managePlans}</span>
            </Link>
          </div>
        </div>

        {/* Total Subscriptions */}
        <div className={`rounded-2xl border p-5 transition-all ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              🥧
            </div>
          </div>
          <p className={`text-3xl font-black ${textTitle}`}>{stats.totalSubscriptions}</p>
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">
            {t.totalSubscriptions}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/40">
            <span className="text-xs text-slate-400">
              {t.activeCount(stats.activeSubscriptions, stats.trialSubscriptions)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. NOTIFICATION BANNER (Inactive Tenants Warning) ──────────────── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
          isDark
            ? "bg-[#181a24] border-amber-900/40 text-amber-200"
            : "bg-amber-50/70 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 text-base">
            🌙
          </div>
          <div>
            <p className="text-xs font-bold">{t.inactiveTenantsTitle}</p>
            <p className="text-[11px] opacity-80">{t.inactiveTenantsSub}</p>
          </div>
        </div>
        <Link
          href="/admin/tenants"
          className="text-xs font-semibold text-amber-400 hover:underline"
        >
          {t.viewInactive}
        </Link>
      </div>

      {/* ─── 4. PENDING TENANTS TABLE CARD (Matching Reference Row 3) ──────── */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800/40">
          <span className="text-amber-400">⏳</span>
          <h2 className={`font-bold text-sm ${textTitle}`}>{t.pendingTenants}</h2>
          <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.2 text-[10px] font-bold text-amber-400">
            {stats.recentRestaurants.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                isDark ? "bg-[#101624] border-[#222d42] text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              <tr>
                <th className="px-5 py-3">{t.tenantName}</th>
                <th className="px-5 py-3">{t.subdomain}</th>
                <th className="px-5 py-3">{t.email}</th>
                <th className="px-5 py-3">{t.registrationDate}</th>
                <th className="px-5 py-3 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-[#1f293d]" : "divide-slate-200"}`}>
              {stats.recentRestaurants.map((r) => (
                <tr key={r.id} className={isDark ? "hover:bg-[#182133]/60" : "hover:bg-slate-50"}>
                  <td className={`px-5 py-3.5 font-bold ${textTitle}`}>{r.name}</td>
                  <td className="px-5 py-3.5 font-mono text-indigo-400">{r.slug}.saas</td>
                  <td className="px-5 py-3.5 text-slate-400">{r.slug}@restaurant.com</td>
                  <td className="px-5 py-3.5 text-slate-400">{r.createdAt}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href="/admin/tenants"
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-500 transition-colors"
                      >
                        <span>📝</span>
                        <span>{t.configureApprove}</span>
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-800/80 bg-rose-950/30 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-900/50 transition-colors"
                      >
                        <span>✕</span>
                        <span>{t.reject}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 5. MIDDLE TWO CARDS (Curve Chart & Donut Chart) ────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line / Spline Chart: Tenants Created (last 6 months) */}
        <div className={`lg:col-span-2 rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400">📈</span>
              <h3 className={`text-sm font-bold ${textTitle}`}>{t.tenantsCreated}</h3>
            </div>
            <span className="text-[10px] font-semibold rounded-lg border border-slate-700/60 bg-slate-800/40 px-2.5 py-1 text-slate-400">
              {t.last6Months}
            </span>
          </div>

          {/* Minimalist modern SVG curve chart matching reference design */}
          <div className="relative h-48 w-full mt-2">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Gridlines */}
              <line x1="40" y1="30" x2="490" y2="30" stroke={isDark ? "#222d42" : "#e2e8f0"} strokeDasharray="3 3" />
              <line x1="40" y1="75" x2="490" y2="75" stroke={isDark ? "#222d42" : "#e2e8f0"} strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="490" y2="120" stroke={isDark ? "#222d42" : "#e2e8f0"} strokeDasharray="3 3" />
              <line x1="40" y1="150" x2="490" y2="150" stroke={isDark ? "#222d42" : "#e2e8f0"} />

              {/* Y Axis labels */}
              <text x="25" y="34" fill="#64748b" fontSize="10" textAnchor="end">3</text>
              <text x="25" y="79" fill="#64748b" fontSize="10" textAnchor="end">2</text>
              <text x="25" y="124" fill="#64748b" fontSize="10" textAnchor="end">1</text>
              <text x="25" y="154" fill="#64748b" fontSize="10" textAnchor="end">0</text>

              {/* Area fill */}
              <path
                d="M 50 150 C 130 150, 180 150, 240 150 C 300 150, 360 145, 420 40 L 420 150 Z"
                fill="url(#chartGradient)"
              />

              {/* Curved line matching Stocky reference */}
              <path
                d="M 50 150 C 130 150, 180 150, 240 150 C 300 150, 360 145, 420 40"
                fill="none"
                stroke="#818cf8"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              {[
                { cx: 50, cy: 150, date: "2025-11" },
                { cx: 130, cy: 150, date: "2025-12" },
                { cx: 210, cy: 150, date: "2026-01" },
                { cx: 290, cy: 150, date: "2026-02" },
                { cx: 370, cy: 150, date: "2026-03" },
                { cx: 420, cy: 40, date: "2026-04" },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.cx} cy={pt.cy} r="4" fill="#818cf8" stroke={isDark ? "#151c2c" : "#ffffff"} strokeWidth="2" />
                  <text x={pt.cx} y="170" fill="#64748b" fontSize="9" textAnchor="middle">{pt.date}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Donut Chart: Subscription status */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-emerald-400">⏱️</span>
            <h3 className={`text-sm font-bold ${textTitle}`}>{t.subscriptionStatus}</h3>
          </div>

          {/* SVG Donut Circle */}
          <div className="relative flex items-center justify-center my-3">
            <svg viewBox="0 0 160 160" className="w-36 h-36">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke={isDark ? "#1e293b" : "#e2e8f0"}
                strokeWidth="16"
              />
              {/* Active segment (emerald) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="16"
                strokeDasharray="280 377"
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
              {/* Trial segment (indigo) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#6366f1"
                strokeWidth="16"
                strokeDasharray="97 377"
                strokeDashoffset="-280"
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>
                {t.total}
              </span>
              <span className={`text-2xl font-black ${textTitle}`}>
                {stats.totalSubscriptions}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-2 border-t border-slate-800/40">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{t.active} ({stats.activeSubscriptions})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>{t.trial} ({stats.trialSubscriptions})</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 6. BOTTOM TWO CARDS (Horizontal Bars & Quick Action Tiles) ─────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Subscriptions by plan (top 5) */}
        <div className={`lg:col-span-2 rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-violet-400">📊</span>
              <h3 className={`text-sm font-bold ${textTitle}`}>{t.subscriptionsByPlan}</h3>
            </div>
            <span className="text-[10px] font-semibold rounded-lg border border-slate-700/60 bg-slate-800/40 px-2.5 py-1 text-slate-400">
              {t.top5}
            </span>
          </div>

          {/* Horizontal Bar Chart matching reference */}
          <div className="space-y-4 pt-2">
            {stats.plansCountByTier.map((plan) => (
              <div key={plan.tier}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`font-bold ${textTitle}`}>{plan.name}</span>
                  <span className={`font-mono text-xs ${textMuted}`}>{plan.count}</span>
                </div>
                <div className={`h-8 w-full rounded-xl overflow-hidden p-1 flex items-center ${isDark ? "bg-[#101624]" : "bg-slate-100"}`}>
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-end pr-3 text-white text-[11px] font-black shadow-xs transition-all duration-500"
                    style={{
                      width: `${Math.max((plan.count / (stats.totalSubscriptions || 1)) * 100, 25)}%`,
                    }}
                  >
                    {plan.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions grid (4 tiles matching reference) */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-400">⚡</span>
            <h3 className={`text-sm font-bold ${textTitle}`}>{t.quickActions}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tile 1: Manage tenants */}
            <Link
              href="/admin/tenants"
              className={`rounded-2xl border p-3 flex flex-col items-center text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${innerCardBg}`}
            >
              <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm mb-2">
                🏢
              </div>
              <p className={`text-xs font-bold leading-tight ${textTitle}`}>{t.manageTenantsBtn}</p>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{t.manageTenantsSub}</p>
            </Link>

            {/* Tile 2: Create new plan */}
            <Link
              href="/admin/plans"
              className={`rounded-2xl border p-3 flex flex-col items-center text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${innerCardBg}`}
            >
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm mb-2">
                ➕
              </div>
              <p className={`text-xs font-bold leading-tight ${textTitle}`}>{t.createPlanBtn}</p>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{t.createPlanSub}</p>
            </Link>

            {/* Tile 3: Subscriptions */}
            <Link
              href="/admin/subscriptions"
              className={`rounded-2xl border p-3 flex flex-col items-center text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${innerCardBg}`}
            >
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm mb-2">
                🔄
              </div>
              <p className={`text-xs font-bold leading-tight ${textTitle}`}>{t.viewSubscriptionsBtn}</p>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{t.viewSubscriptionsSub}</p>
            </Link>

            {/* Tile 4: Visit public menu / landing */}
            <Link
              href="/menu/fre-bar"
              target="_blank"
              className={`rounded-2xl border p-3 flex flex-col items-center text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${innerCardBg}`}
            >
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm mb-2">
                ↗️
              </div>
              <p className={`text-xs font-bold leading-tight ${textTitle}`}>{t.visitLandingBtn}</p>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{t.visitLandingSub}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

