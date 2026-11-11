"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useThemeLang } from "@/context/ThemeLangContext";
import { adminDict } from "@/lib/i18n/adminDict";
import { logoutAction } from "@/app/login/actions";

interface SuperAdminSidebarStockyProps {
  admin: {
    name: string;
    email: string;
  };
}

export function SuperAdminSidebarStocky({ admin }: SuperAdminSidebarStockyProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, lang } = useThemeLang();
  const t = adminDict[lang];

  const sections = [
    {
      title: t.main,
      items: [
        { href: "/admin", label: t.dashboard, icon: "📊" },
      ],
    },
    {
      title: t.management,
      items: [
        { href: "/admin/tenants", label: t.tenants, icon: "🏢" },
        { href: "/admin/plans", label: t.plans, icon: "🏷️" },
        { href: "/admin/subscriptions", label: t.subscriptions, icon: "📑" },
        { href: "/admin/superadmins", label: t.superAdmins, icon: "👥" },
      ],
    },
    {
      title: t.payments,
      items: [
        { href: "/admin/payments", label: t.overview, icon: "📊" },
        { href: "/admin/transactions", label: t.transactions, icon: "💳" },
        { href: "/admin/invoices", label: t.invoices, icon: "📄" },
      ],
    },
    {
      title: t.reports,
      items: [
        { href: "/admin/analytics", label: t.analytics, icon: "📈" },
        { href: "/admin/audit", label: t.audit, icon: "🛡️" },
      ],
    },
    {
      title: t.cms,
      items: [
        { href: "/admin/landing", label: t.landingPage, icon: "🌐" },
        { href: "/admin/translations", label: t.translations, icon: "🗣️" },
      ],
    },
    {
      title: t.help,
      items: [
        { href: "/admin/help", label: t.howItWorks, icon: "💡" },
      ],
    },
    {
      title: t.settings,
      items: [
        { href: "/admin/settings", label: t.generalSettings, icon: "⚙️" },
      ],
    },
  ];

  const isDark = theme === "dark";

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 border-r flex flex-col justify-between z-30 transition-all duration-300 select-none ${
        collapsed ? "w-20" : "w-64"
      } ${
        isDark
          ? "bg-[#111622] border-[#1e2638] text-slate-300"
          : "bg-[#f8fafc] border-slate-200 text-slate-700"
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div
          className={`flex items-center justify-between px-4 py-4 border-b ${
            isDark ? "border-[#1e2638]" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Stocky geometric icon logo */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-purple-400 text-white font-black text-sm shadow-md shadow-violet-500/20">
              <span className="text-base">✦</span>
            </div>
            {!collapsed && (
              <span
                className={`font-bold tracking-tight text-lg ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {t.appName}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
              isDark
                ? "border-[#253047] text-slate-400 hover:bg-[#1a2233] hover:text-white"
                : "border-slate-300 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="text-xs">{collapsed ? "⇥" : "⇤"}</span>
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">
          {sections.map((sec) => (
            <div key={sec.title}>
              {!collapsed && (
                <p
                  className={`px-3 text-[10px] font-extrabold uppercase tracking-wider mb-1.5 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {sec.title}
                </p>
              )}
              {collapsed && (
                <div
                  className={`my-1.5 border-t mx-2 ${
                    isDark ? "border-[#1e2638]" : "border-slate-200"
                  }`}
                />
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                        collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2"
                      } ${
                        isActive
                          ? isDark
                            ? "bg-[#283556] text-white shadow-sm font-bold"
                            : "bg-indigo-50 text-indigo-700 shadow-sm font-bold"
                          : isDark
                          ? "text-slate-400 hover:bg-[#182030] hover:text-slate-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span className="text-sm shrink-0">{item.icon}</span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: User profile & Logout */}
        <div
          className={`border-t p-3 ${
            isDark ? "border-[#1e2638] bg-[#0c1019]" : "border-slate-200 bg-slate-50"
          }`}
        >
          <form action={logoutAction}>
            <button
              type="submit"
              title={collapsed ? t.logout : undefined}
              className={`w-full flex items-center justify-center gap-2 rounded-xl border font-semibold text-xs py-2 transition-colors ${
                isDark
                  ? "border-[#253047] text-slate-400 hover:bg-red-950/40 hover:text-red-300 hover:border-red-900"
                  : "border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
              }`}
            >
              <span>🚪</span>
              {!collapsed && <span>{t.logout}</span>}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

