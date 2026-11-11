"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import { useGlobalThemeLang } from "@/context/ThemeLangContext";

export interface NavItem {
  href: string;
  label: string;
  labelAm?: string;
  icon: string;
}

export interface NavSection {
  title: string;
  titleAm?: string;
  items: NavItem[];
}

interface ErpSidebarProps {
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
}

const sectionDict: Record<string, { en: string; am: string }> = {
  "Front of House & POS": { en: "Front of House & POS", am: "የፊት ሽያጭ እና POS" },
  "Menu & Catalog": { en: "Menu & Catalog", am: "ሜኑ እና ካታሎግ" },
  "Back Office ERP": { en: "Back Office ERP", am: "የጀርባ አስተዳደር ERP" },
  "Management": { en: "Management", am: "አስተዳደር" },
};

const itemDict: Record<string, { en: string; am: string }> = {
  "/dashboard": { en: "Overview", am: "አጠቃላይ እይታ" },
  "/dashboard/pos": { en: "Point of Sale (POS)", am: "ሽያጭ መመዝገቢያ (POS)" },
  "/dashboard/kitchen": { en: "Kitchen Display (KDS)", am: "የኩሽና ማሳያ (KDS)" },
  "/dashboard/orders": { en: "Live Orders", am: "የቀጥታ ትዕዛዞች" },
  "/dashboard/tables": { en: "Tables & Floor Plan", am: "ጠረጴዛዎች እና ቦታ" },
  "/dashboard/categories": { en: "Categories", am: "የምግብ ምድቦች" },
  "/dashboard/products": { en: "Dishes & Drinks", am: "ምግቦች እና መጠጦች" },
  "/dashboard/qr-codes": { en: "QR Generator", am: "የ QR ኮድ ማውጫ" },
  "/dashboard/erp": { en: "ERP Executive Dashboard", am: "የ ERP ዋና ዳሽቦርድ" },
  "/dashboard/inventory": { en: "Inventory Stock", am: "የእቃ ክምችት" },
  "/dashboard/ingredients": { en: "Raw Ingredients", am: "ጥሬ እቃዎች" },
  "/dashboard/purchasing": { en: "Suppliers & Purchasing", am: "አቅራቢዎች እና ግዢ" },
  "/dashboard/expenses": { en: "Operating Expenses", am: "የስራ ማስኬጃ ወጪዎች" },
  "/dashboard/reports": { en: "Financial Reports & P&L", am: "የፋይናንስ ሪፖርቶች" },
  "/dashboard/settings": { en: "Store Settings", am: "የሱቅ ቅንብሮች" },
};

export function ErpSidebar({
  restaurant,
  role,
  roleMeta,
  sections,
}: ErpSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, lang } = useGlobalThemeLang();
  const isDark = theme === "dark";

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 border-r flex flex-col justify-between z-20 hidden md:flex transition-all duration-300 select-none ${
        collapsed ? "w-20" : "w-64"
      } ${
        isDark
          ? "bg-[#111622] border-[#1e2638] text-slate-300"
          : "bg-white border-slate-200 text-slate-700 shadow-sm"
      }`}
    >
      <div>
        {/* Restaurant Header & Toggle Button */}
        <div
          className={`flex items-center justify-between p-3.5 border-b ${
            isDark ? "border-[#1e2638]" : "border-slate-100"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 font-black text-white shadow-md shadow-amber-500/20 text-base">
              {restaurant.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 overflow-hidden transition-all duration-200">
                <span
                  className={`font-bold tracking-tight text-sm truncate block ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {lang === "am" && restaurant.nameAm ? restaurant.nameAm : restaurant.name}
                </span>
                <p className="text-[11px] text-amber-500 font-semibold truncate">
                  {lang === "am" ? "የምግብ ቤት አስተዳደር" : "Restaurant ERP"}
                </p>
              </div>
            )}
          </div>

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors shrink-0 ${
              isDark
                ? "border-[#253047] text-slate-400 hover:bg-[#1a2233] hover:text-white"
                : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse to icons"}
          >
            <span className="text-xs">{collapsed ? "⏩" : "⏪"}</span>
          </button>
        </div>

        {/* Role Pill Indicator */}
        {!collapsed && (
          <div
            className={`mx-3 mt-3 p-2 rounded-xl border flex items-center justify-between ${
              isDark
                ? "bg-[#151c2c] border-[#222d42]"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div>
              <p
                className={`text-[9px] uppercase tracking-wider font-extrabold ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {lang === "am" ? "የተጠቃሚ ሚና" : "Signed in as"}
              </p>
              <p
                className={`text-xs font-bold ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
              >
                {roleMeta.label}
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.color}`}
            >
              {role}
            </span>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="overflow-y-auto no-scrollbar p-2.5 space-y-4 max-h-[calc(100vh-210px)]">
          {sections.map((sec) => {
            const sectionTitle =
              lang === "am" && sectionDict[sec.title]
                ? sectionDict[sec.title].am
                : sec.title;

            return (
              <div key={sec.title}>
                {!collapsed && (
                  <p
                    className={`px-3 text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {sectionTitle}
                  </p>
                )}
                {collapsed && (
                  <div
                    className={`my-1.5 border-t mx-2 ${
                      isDark ? "border-[#1e2638]" : "border-slate-100"
                    }`}
                  />
                )}
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const isActive = pathname === item.href;
                    const itemLabel =
                      lang === "am" && itemDict[item.href]
                        ? itemDict[item.href].am
                        : item.label;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? itemLabel : undefined}
                        className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                          collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
                        } ${
                          isActive
                            ? isDark
                              ? "bg-[#283556] text-white shadow-sm font-bold"
                              : "bg-amber-600 text-white shadow-sm font-bold"
                            : isDark
                            ? "text-slate-400 hover:bg-[#182030] hover:text-slate-200"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        {!collapsed && <span className="truncate">{itemLabel}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div
        className={`border-t p-2.5 transition-colors ${
          isDark
            ? "border-[#1e2638] bg-[#0c101a]"
            : "border-slate-100 bg-slate-50/70"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center justify-between mb-2 px-1">
            <span
              className={`text-[11px] truncate max-w-[120px] ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {roleMeta.desc}
            </span>
            {role === "OWNER" && (
              <Link
                href="/admin"
                className="text-[10px] font-bold text-violet-400 hover:underline shrink-0"
                title="Super Admin switch"
              >
                Super Admin ⚡
              </Link>
            )}
          </div>
        )}

        <form action={logoutAction}>
          <button
            type="submit"
            title={collapsed ? (lang === "am" ? "ውጣ" : "Sign Out") : undefined}
            className={`w-full rounded-xl border font-semibold transition-colors flex items-center justify-center ${
              collapsed ? "py-2 text-sm" : "py-1.5 text-xs"
            } ${
              isDark
                ? "border-[#253047] bg-[#151c2c] text-slate-300 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/50"
                : "border-slate-200 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
            }`}
          >
            {collapsed ? "🚪" : (lang === "am" ? "ውጣ (Sign Out)" : "Sign Out")}
          </button>
        </form>
      </div>
    </aside>
  );
}
