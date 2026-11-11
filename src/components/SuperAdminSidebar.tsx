"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/login/actions";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

interface SuperAdminSidebarProps {
  admin: {
    name: string;
    email: string;
  };
  sections: AdminNavSection[];
}

export function SuperAdminSidebar({ admin, sections }: SuperAdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col justify-between z-20 hidden md:flex transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        {/* Brand Header & Toggle Button */}
        <div className="flex items-center justify-between border-b border-slate-800 p-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-base font-black text-white shadow-lg shadow-violet-500/20">
              ⚡
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 overflow-hidden transition-all duration-200">
                <p className="text-sm font-bold text-white tracking-tight truncate">
                  Super Admin
                </p>
                <p className="text-[11px] text-violet-400 font-medium truncate">
                  Enterprise Platform
                </p>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse to icons"}
          >
            {collapsed ? "⏩" : "⏪"}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="overflow-y-auto no-scrollbar p-2.5 space-y-4 max-h-[calc(100vh-140px)]">
          {sections.map((sec) => (
            <div key={sec.title}>
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {sec.title}
                </p>
              )}
              {collapsed && (
                <div className="my-1.5 border-t border-slate-800 mx-2" />
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl text-xs font-semibold text-slate-400 transition-all hover:bg-slate-800 hover:text-white active:scale-[0.98] ${
                      collapsed
                        ? "justify-center p-2.5"
                        : "gap-2.5 px-3 py-2"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer User Info & Logout */}
      <div className="border-t border-slate-800 p-2.5 bg-slate-950/60">
        {!collapsed && (
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-6 rounded-full bg-violet-600/30 border border-violet-500 text-violet-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {admin.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{admin.email}</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-[10px] font-semibold text-amber-400 hover:underline shrink-0"
              title="Go to Restaurant ERP Dashboard"
            >
              ERP 🍽️
            </Link>
          </div>
        )}

        <form action={logoutAction}>
          <button
            type="submit"
            title={collapsed ? "Log Out" : undefined}
            className={`w-full rounded-xl border border-slate-800 bg-slate-900 font-semibold text-slate-300 hover:bg-red-950/50 hover:text-red-400 hover:border-red-800 transition-colors flex items-center justify-center ${
              collapsed ? "py-2 text-sm" : "py-1.5 text-xs"
            }`}
          >
            {collapsed ? "🚪" : "Log Out"}
          </button>
        </form>
      </div>
    </aside>
  );
}

