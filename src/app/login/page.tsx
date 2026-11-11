"use client";

import { useState } from "react";
import { loginAction } from "./actions";
import { useGlobalThemeLang } from "@/context/ThemeLangContext";
import { ThemeLanguageToggle } from "@/components/ThemeLanguageToggle";

interface RoleOption {
  id: string;
  label: string;
  labelAm: string;
  icon: string;
  email: string;
  desc: string;
  descAm: string;
  color: string;
  badge: string;
  landing: string;
}

const ROLES: RoleOption[] = [
  {
    id: "SUPER_ADMIN",
    label: "Super Admin",
    labelAm: "ዋና አስተዳዳሪ (Super Admin)",
    icon: "⚡",
    email: "admin@saas.com",
    desc: "Platform-wide tenant control, subscriptions & analytics",
    descAm: "መላውን ሲስተም፣ ተቋማትን እና ክፍያዎችን መቆጣጠሪያ",
    color: "from-violet-600 to-indigo-600 border-violet-500/40 text-violet-300",
    badge: "bg-violet-900/60 text-violet-300 border-violet-700",
    landing: "/admin",
  },
  {
    id: "OWNER",
    label: "Restaurant Owner",
    labelAm: "የምግብ ቤት ባለቤት (Owner)",
    icon: "👑",
    email: "owner@example.com",
    desc: "Full ERP, menu, staff, and financial management",
    descAm: "ሙሉ የ ERP፣ ሜኑ፣ ሰራተኞች እና የፋይናንስ አስተዳደር",
    color: "from-amber-600 to-orange-600 border-amber-500/40 text-amber-300",
    badge: "bg-amber-900/60 text-amber-300 border-amber-700",
    landing: "/dashboard",
  },
  {
    id: "MANAGER",
    label: "Branch Manager",
    labelAm: "ቅርንጫፍ ስራ አስኪያጅ (Manager)",
    icon: "📋",
    email: "manager@example.com",
    desc: "Operations, inventory, purchasing, and staff workflows",
    descAm: "የእለት ተእለት ስራዎች፣ እቃ ክምችት፣ ግዢ እና ሰራተኞች",
    color: "from-blue-600 to-cyan-600 border-blue-500/40 text-blue-300",
    badge: "bg-blue-900/60 text-blue-300 border-blue-700",
    landing: "/dashboard",
  },
  {
    id: "CASHIER",
    label: "Cashier / Front Desk",
    labelAm: "የካሳ ሰራተኛ (Cashier / POS)",
    icon: "💻",
    email: "cashier@example.com",
    desc: "POS ordering, bills, payments, and table assignments",
    descAm: "ፈጣን የሽያጭ ትዕዛዝ፣ ደረሰኝ፣ ክፍያ እና ጠረጴዛ መረጣ",
    color: "from-emerald-600 to-teal-600 border-emerald-500/40 text-emerald-300",
    badge: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
    landing: "/dashboard/pos",
  },
  {
    id: "KITCHEN",
    label: "Kitchen Chef / KDS",
    labelAm: "የኩሽና ሼፍ (Kitchen KDS)",
    icon: "🍳",
    email: "kitchen@example.com",
    desc: "Kitchen display, preparation timers, order completion",
    descAm: "የምግብ ማዘጋጃ ማሳያ፣ ጊዜ ቆጣሪ እና የትዕዛዝ ማጠናቀቂያ",
    color: "from-rose-600 to-pink-600 border-rose-500/40 text-rose-300",
    badge: "bg-rose-900/60 text-rose-300 border-rose-700",
    landing: "/dashboard/kitchen",
  },
  {
    id: "WAITER",
    label: "Service Waiter",
    labelAm: "አስተናጋጅ (Waiter)",
    icon: "🛎️",
    email: "waiter@example.com",
    desc: "Table service, customer orders, and status alerts",
    descAm: "የጠረጴዛ አገልግሎት፣ የደንበኛ ትዕዛዝ እና ሁኔታ መከታተያ",
    color: "from-yellow-600 to-amber-600 border-yellow-500/40 text-yellow-300",
    badge: "bg-yellow-900/60 text-yellow-300 border-yellow-700",
    landing: "/dashboard/orders",
  },
];

export default function LoginPage() {
  const { theme, lang } = useGlobalThemeLang();
  const isDark = theme === "dark";

  const [selectedRole, setSelectedRole] = useState<RoleOption>(ROLES[1]);
  const [email, setEmail] = useState(ROLES[1].email);
  const [loading, setLoading] = useState(false);

  const selectRole = (role: RoleOption) => {
    setSelectedRole(role);
    setEmail(role.email);
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-4 sm:p-6 transition-colors duration-200 ${
        isDark ? "bg-[#0b0f19] text-slate-100" : "bg-[#f1f5f9] text-slate-800"
      }`}
    >
      <div
        className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-8 shadow-2xl backdrop-blur-md transition-all ${
          isDark
            ? "border-[#222d42] bg-[#151c2c]/95 text-slate-100"
            : "border-slate-200 bg-white/95 text-slate-900"
        }`}
      >
        {/* Top Controls: Language & Theme Pill */}
        <div className="flex justify-end mb-4">
          <ThemeLanguageToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-7">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-3xl font-black text-white shadow-lg shadow-orange-500/20">
            {selectedRole.icon}
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {lang === "am" ? "የተጠቃሚ ሚና በመምረጥ ይግቡ" : "Role-Based Authentication"}
          </h1>
          <p className={`mt-1.5 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {lang === "am"
              ? "የሚፈልጉትን የተጠቃሚ ሚና ይምረጡ፤ ለእርስዎ የተፈቀደው ዳሽቦርድ ወዲያውኑ ይከፈታል።"
              : "Select any staff role below to sign in with designated permissions and workspace."}
          </p>
        </div>

        {/* Role Selector Grid */}
        <div className="mb-6">
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {lang === "am" ? "ተጠቃሚ ሚና ይምረጡ" : "Choose Your Role"}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {ROLES.map((r) => {
              const isSelected = selectedRole.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectRole(r)}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? isDark
                        ? `bg-[#1c253b] border-amber-500/60 shadow-lg ring-2 ring-amber-500/40 text-white`
                        : `bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/40 text-stone-900`
                      : isDark
                      ? "bg-[#111622] border-[#1e2638] text-slate-400 hover:border-[#283556] hover:text-slate-200"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xl">{r.icon}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${r.badge}`}>
                      {r.id === "SUPER_ADMIN" ? "Platform" : "Tenant"}
                    </span>
                  </div>
                  <p className={`text-xs font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    {lang === "am" ? r.labelAm : r.label}
                  </p>
                  <p className={`text-[10px] mt-1 line-clamp-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {lang === "am" ? r.descAm : r.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form
          action={async (formData) => {
            setLoading(true);
            await loginAction(formData);
            setLoading(false);
          }}
          className={`space-y-4 rounded-2xl p-5 border transition-colors ${
            isDark
              ? "bg-[#111622] border-[#1e2638]"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <input type="hidden" name="role" value={selectedRole.id} />

          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? "border-[#1e2638]" : "border-slate-200"}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedRole.icon}</span>
              <div>
                <p className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {lang === "am" ? selectedRole.labelAm : selectedRole.label}
                </p>
                <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {lang === "am" ? "መድረሻ ገጽ:" : "Destination:"} <code className="text-amber-500 font-mono">{selectedRole.landing}</code>
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              ✓ Ready
            </span>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {lang === "am" ? "ኢሜይል አድራሻ" : "Email Address"}
            </label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none transition ${
                isDark
                  ? "bg-[#151c2c] border-[#25324d] text-white focus:border-amber-400"
                  : "bg-white border-slate-300 text-slate-900 focus:border-amber-600"
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`block text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {lang === "am" ? "የይለፍ ቃል" : "Password / Security Pin"}
              </label>
              <span className="text-[10px] text-slate-400">Default: password123</span>
            </div>
            <input
              type="password"
              name="password"
              defaultValue="password123"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none transition ${
                isDark
                  ? "bg-[#151c2c] border-[#25324d] text-white focus:border-amber-400"
                  : "bg-white border-slate-300 text-slate-900 focus:border-amber-600"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-3 text-xs font-extrabold text-white shadow-lg transition-all hover:opacity-95 active:scale-[0.98] bg-gradient-to-r ${selectedRole.color}`}
          >
            {loading
              ? lang === "am"
                ? "በመግባት ላይ..."
                : "Authenticating & Redirecting..."
              : lang === "am"
              ? `እንደ ${selectedRole.labelAm} ግባ`
              : `Sign in as ${selectedRole.label}`}
          </button>
        </form>

        {/* Footer info */}
        <p className={`mt-4 text-center text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {lang === "am"
            ? "እያንዳንዱ ሚና ተገቢውን የስራ ገጽ እና የተፈቀደውን ፈቃድ ያገኛል።"
            : "Each role automatically receives a personalized sidebar and restricted route permissions."}
        </p>
      </div>
    </div>
  );
}
