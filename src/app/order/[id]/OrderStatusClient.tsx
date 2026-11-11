"use client";

import Link from "next/link";
import { useGlobalThemeLang } from "@/context/ThemeLangContext";
import { ThemeLanguageToggle } from "@/components/ThemeLanguageToggle";
import { money } from "@/lib/i18n";

const statusSteps = [
  { key: "PENDING",   labelEn: "Order Received",      labelAm: "ትዕዛዝ ደርሷል",        icon: "📨" },
  { key: "ACCEPTED",  labelEn: "Order Accepted",       labelAm: "ትዕዛዝ ተቀባይቷል",     icon: "👍" },
  { key: "PREPARING", labelEn: "Kitchen Preparing",    labelAm: "ኩሽና እያዘጋጀ ነው",    icon: "🍳" },
  { key: "READY",     labelEn: "Ready to Serve",       labelAm: "ለማቅረብ ዝግጁ ነው",   icon: "🛎️" },
  { key: "SERVED",    labelEn: "Served",               labelAm: "ቀርቧል",             icon: "🍽️" },
];

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number | string;
  notes?: string | null;
}

interface OrderData {
  id: string;
  orderNumber: string | number;
  status: string;
  total: number | string;
  createdAt: string;
  customerName?: string | null;
  notes?: string | null;
  table?: { tableNumber: string | number } | null;
  restaurant: {
    name: string;
    slug: string;
    currency?: string | null;
  };
  items: OrderItem[];
}

export function OrderStatusClient({ order }: { order: OrderData }) {
  const { theme, lang } = useGlobalThemeLang();
  const isDark = theme === "dark";

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const currency = order.restaurant.currency ?? "ETB";

  // i18n helpers
  const t = {
    backToMenu:   lang === "am" ? "← ወደ ምናሌ ተመለስ"      : "← Back to Menu",
    liveTracking: lang === "am" ? "ቀጥታ ክትትል"            : "Live Tracking",
    preparation:  lang === "am" ? "የዝግጅት ሂደት"           : "Preparation Progress",
    items:        lang === "am" ? "የታዘዙ እቃዎች"           : "Items Ordered",
    total:        lang === "am" ? "ጠቅላላ ድምር"            : "Total Amount",
    tableNo:      lang === "am" ? "ጠረጴዛ ቁጥር"           : "Table No.",
    dineIn:       lang === "am" ? "ቤት ውስጥ"              : "Dine-in",
    inProgress:   lang === "am" ? "በሂደት ላይ"             : "In progress",
    note:         lang === "am" ? "ማስታወሻ"               : "Note",
    order:        lang === "am" ? "ትዕዛዝ"                 : "Order",
  };

  return (
    <div
      className={`min-h-screen py-8 px-4 transition-colors duration-200 ${
        isDark ? "bg-[#0b0f19] text-slate-100" : "bg-[#f1f5f9] text-slate-900"
      }`}
    >
      <main className="mx-auto max-w-md space-y-5">
        {/* Navigation & Controls */}
        <div className="flex items-center justify-between">
          <Link
            href={`/menu/${order.restaurant.slug}`}
            className="text-xs font-bold text-amber-500 hover:underline"
          >
            {t.backToMenu}
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.liveTracking}</span>
            </span>
            <ThemeLanguageToggle />
          </div>
        </div>

        {/* Order Header Card */}
        <div
          className={`rounded-3xl border p-6 shadow-sm text-center space-y-2 ${
            isDark
              ? "bg-[#151c2c] border-[#222d42]"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
            {order.restaurant.name}
          </span>
          <h1 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {t.order} #{order.orderNumber}
          </h1>
          <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {order.table
              ? `${t.tableNo} ${order.table.tableNumber}`
              : t.dineIn}{" "}
            •{" "}
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {order.customerName && (
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {order.customerName}
            </p>
          )}
        </div>

        {/* Status Stepper */}
        <div
          className={`rounded-3xl border p-6 shadow-sm space-y-4 ${
            isDark
              ? "bg-[#151c2c] border-[#222d42]"
              : "bg-white border-slate-200"
          }`}
        >
          <h2 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {t.preparation}
          </h2>

          <div className="space-y-3">
            {statusSteps.map((step, idx) => {
              const isPast    = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;
              const stepLabel = lang === "am" ? step.labelAm : step.labelEn;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  {/* Step circle */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-base transition-all ${
                      isCurrent
                        ? "bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/30 scale-110"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : isDark
                        ? "bg-[#1c253b] text-slate-500 opacity-50"
                        : "bg-slate-100 text-slate-400 opacity-50"
                    }`}
                  >
                    {isPast ? "✓" : step.icon}
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? isDark ? "text-white" : "text-slate-900"
                          : isPast
                          ? isDark ? "text-slate-300" : "text-slate-600"
                          : isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {stepLabel}
                    </span>
                  </div>

                  {/* "In progress" badge */}
                  {isCurrent && (
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30 animate-pulse">
                      {t.inProgress}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#1c253b]" : "bg-slate-100"}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
              style={{
                width: `${Math.max(5, ((currentStepIndex + 1) / statusSteps.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div
          className={`rounded-3xl border p-6 shadow-sm space-y-3 ${
            isDark
              ? "bg-[#151c2c] border-[#222d42]"
              : "bg-white border-slate-200"
          }`}
        >
          <h2 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {t.items}
          </h2>

          <div className={`divide-y text-xs ${isDark ? "divide-[#1e2638]" : "divide-slate-100"}`}>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between py-2.5 gap-2">
                <div>
                  <span className={`font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {item.quantity}× {item.productName}
                  </span>
                  {item.notes && (
                    <p className={`text-[11px] italic mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {t.note}: {item.notes}
                    </p>
                  )}
                </div>
                <span className={`font-bold flex-shrink-0 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {money(Number(item.totalPrice), currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Order notes */}
          {order.notes && (
            <div className={`rounded-xl p-3 text-xs ${isDark ? "bg-[#1c253b] text-slate-400" : "bg-slate-50 text-slate-500"}`}>
              <span className="font-bold">{t.note}:</span> {order.notes}
            </div>
          )}

          {/* Total */}
          <div
            className={`border-t pt-3 flex items-center justify-between text-sm font-black ${
              isDark ? "border-[#1e2638] text-white" : "border-slate-100 text-slate-900"
            }`}
          >
            <span>{t.total}</span>
            <span className="text-amber-500">{money(Number(order.total), currency)}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

