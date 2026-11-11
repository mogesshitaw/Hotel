"use client";

import { useGlobalThemeLang } from "@/context/ThemeLangContext";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  notes?: string | null;
}

interface KDSOrder {
  id: string;
  orderNumber: string | number;
  status: string;
  type: string;
  customerName?: string | null;
  notes?: string | null;
  createdAt: string;
  table?: { tableNumber: string | number } | null;
  items: OrderItem[];
}

interface Props {
  orders: KDSOrder[];
  newCount: number;
  inKitchenCount: number;
  readyCount: number;
  completedCount: number;
  updateOrderStatusAction: (formData: FormData) => Promise<void>;
}

export function KitchenDisplayClient({
  orders,
  newCount,
  inKitchenCount,
  readyCount,
  completedCount,
  updateOrderStatusAction,
}: Props) {
  const { theme, lang } = useGlobalThemeLang();
  const isDark = theme === "dark";

  const t = {
    title:       lang === "am" ? "ኩሽና ማሳያ (KDS)"            : "Kitchen Display (KDS)",
    subtitle:    lang === "am" ? "ቀጥታ ኩሽና ማሳያ • በ8 ሰኮንድ ይዘምናል" : "Live cook display • Auto-refreshes every 8 seconds",
    newOrder:    lang === "am" ? "አዲስ ትዕዛዝ"                  : "New Order",
    inKitchen:   lang === "am" ? "ኩሽና ውስጥ"                   : "In Kitchen",
    ready:       lang === "am" ? "ዝግጁ"                        : "Ready",
    completed:   lang === "am" ? "ተጠናቅቋል"                    : "Completed",
    walkIn:      lang === "am" ? "የእግር ደንበኛ"                 : "Walk in Customer",
    tableToken:  lang === "am" ? "ጠረጴዛ / ቁጥር:"              : "Table / Token No:",
    counter:     lang === "am" ? "ቆጣሪ ቲኬት"                  : "Counter Ticket",
    elapsed:     lang === "am" ? "ያለፈ ጊዜ"                   : "Elapsed",
    delayed:     lang === "am" ? "ዘግይቷል!"                    : "Delayed!",
    startCook:   lang === "am" ? "▷ ማብሰል ጀምር"               : "▷ Start Cooking",
    markReady:   lang === "am" ? "✓ ዝግጁ ምልክት አድርግ"          : "✓ Mark Done & Ready",
    served:      lang === "am" ? "🍽️ ለጠረጴዛ አቅርብ"            : "🍽️ Served to Table",
    orderDone:   lang === "am" ? "ትዕዛዝ ተጠናቋል"               : "Order Completed",
    kitchenNote: lang === "am" ? "የኩሽና ማስታወሻ"               : "Kitchen Note",
    notes:       lang === "am" ? "ማስታወሻ"                     : "Notes",
    caughtUp:    lang === "am" ? "ሁሉም ተጠናቋል!"               : "All caught up!",
    noOrders:    lang === "am" ? "አዲስ ትዕዛዞች እዚህ ይታያሉ።"      : "New customer orders will appear here automatically.",
    mins:        lang === "am" ? "ደቂቃ"                       : "mins",
  };

  const shell = isDark
    ? "bg-[#0b0f19] text-slate-100"
    : "bg-[#f1f5f9] text-slate-900";

  const cardBg = isDark
    ? "bg-[#151c2c] border-[#222d42] text-slate-100"
    : "bg-white border-slate-200 text-slate-900";

  const subheaderBg = isDark
    ? "bg-[#111622] border-[#1e2638] text-slate-400"
    : "bg-slate-50 border-slate-100 text-slate-500";

  const footerBg = isDark
    ? "bg-[#111622] border-[#1e2638]"
    : "bg-slate-50/60 border-slate-100";

  const itemBg = isDark
    ? "bg-[#1c253b] border-[#25324d] text-slate-200"
    : "bg-slate-50 border-slate-100 text-slate-800";

  const qtyBadge = isDark ? "bg-[#25324d]" : "bg-slate-200";
  const timerBar = isDark ? "bg-[#25324d]" : "bg-slate-200";

  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${shell}`}>
      <div className="space-y-6">
        {/* KDS Header */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 ${
            isDark ? "border-[#1e2638]" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-lg text-amber-400 border border-amber-500/30">
              🍳
            </div>
            <div>
              <h1
                className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                <span>{t.title}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </h1>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Status Count Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <div
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-white shadow-xs ${
                isDark ? "bg-[#1c253b] border-[#25324d]" : "bg-slate-700 border-slate-600"
              }`}
            >
              <span>{t.newOrder}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[11px] font-mono ${
                  isDark ? "bg-[#111622]" : "bg-slate-800"
                }`}
              >
                {String(newCount).padStart(2, "0")}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-stone-950 shadow-xs">
              <span>{t.inKitchen}</span>
              <span className="rounded-md bg-amber-600 px-1.5 py-0.5 text-[11px] text-white font-mono">
                {String(inKitchenCount).padStart(2, "0")}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-white shadow-xs">
              <span>{t.ready}</span>
              <span className="rounded-md bg-purple-700 px-1.5 py-0.5 text-[11px] font-mono">
                {String(readyCount).padStart(2, "0")}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-white shadow-xs">
              <span>{t.completed}</span>
              <span className="rounded-md bg-emerald-700 px-1.5 py-0.5 text-[11px] font-mono">
                {String(completedCount).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Cards Grid */}
        {orders.length === 0 ? (
          <div
            className={`rounded-3xl border border-dashed p-16 text-center ${
              isDark
                ? "bg-[#151c2c] border-[#222d42] text-slate-400"
                : "bg-white border-slate-200 text-slate-400"
            }`}
          >
            <div className="text-4xl mb-2">🍽️</div>
            <p className={`text-base font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {t.caughtUp}
            </p>
            <p className="text-xs mt-1">{t.noOrders}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((o) => {
              const isPending   = o.status === "PENDING";
              const isPreparing = o.status === "PREPARING";
              const isAccepted  = o.status === "ACCEPTED";
              const isReady     = o.status === "READY";
              const isDone      = o.status === "COMPLETED";

              const elapsedMins = Math.floor(
                (Date.now() - new Date(o.createdAt).getTime()) / 60000
              );
              const isDelayed = elapsedMins > 20 && !isReady && !isDone;

              const headerBg = isDelayed
                ? "bg-rose-600 text-white"
                : isPending
                ? isDark
                  ? "bg-[#1c253b] text-slate-100"
                  : "bg-slate-800 text-white"
                : isPreparing || isAccepted
                ? "bg-amber-500 text-stone-950"
                : isReady
                ? "bg-purple-600 text-white"
                : "bg-emerald-600 text-white";

              return (
                <div
                  key={o.id}
                  className={`flex flex-col justify-between overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md ${cardBg}`}
                >
                  <div>
                    {/* Card Header */}
                    <div className={`p-4 ${headerBg}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold backdrop-blur-xs">
                            👨‍🍳
                          </div>
                          <div>
                            <h3 className="font-bold text-sm leading-tight">
                              {o.customerName || t.walkIn}
                            </h3>
                            <span className="text-[11px] opacity-85">
                              {o.type.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-black/25 px-2.5 py-1 font-mono text-xs font-black backdrop-blur-xs">
                          #{o.orderNumber}
                        </div>
                      </div>
                    </div>

                    {/* Token & Timestamp Subheader */}
                    <div
                      className={`flex items-center justify-between border-b px-4 py-2 text-xs font-semibold ${subheaderBg}`}
                    >
                      <div>
                        {o.table ? (
                          <span>
                            {t.tableToken}{" "}
                            <strong className={isDark ? "text-white" : "text-slate-900"}>
                              {o.table.tableNumber}
                            </strong>
                          </span>
                        ) : (
                          <span>{t.counter}</span>
                        )}
                      </div>
                      <div className="text-[11px]">
                        {new Date(o.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 space-y-2.5">
                      {o.items.map((it) => (
                        <div
                          key={it.id}
                          className={`rounded-xl p-2.5 text-xs border ${itemBg}`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className="text-amber-500">▣</span>
                              <span>{it.productName}</span>
                            </span>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[11px] font-mono ${qtyBadge}`}
                            >
                              ×{it.quantity}
                            </span>
                          </div>
                          {it.notes && (
                            <div className="mt-1 rounded-md bg-amber-500/10 border border-amber-500/20 p-1 text-[11px] font-semibold text-amber-500">
                              {t.notes}: {it.notes}
                            </div>
                          )}
                        </div>
                      ))}

                      {o.notes && (
                        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2 text-xs text-rose-400">
                          <strong>{t.kitchenNote}:</strong> {o.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Timer & Action Buttons */}
                  <div className={`border-t p-4 space-y-3 ${footerBg}`}>
                    {/* Elapsed Timer Bar */}
                    <div className="space-y-1">
                      <div
                        className={`flex items-center justify-between text-xs font-bold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        <span>
                          ⏱️ {t.elapsed}: {elapsedMins} {t.mins}
                        </span>
                        {isDelayed && (
                          <span className="text-rose-500 font-extrabold animate-pulse">
                            {t.delayed}
                          </span>
                        )}
                      </div>
                      <div className={`h-1.5 w-full overflow-hidden rounded-full ${timerBar}`}>
                        <div
                          className={`h-full rounded-full transition-all ${
                            isDelayed
                              ? "bg-rose-500"
                              : isDone
                              ? "bg-emerald-500"
                              : isReady
                              ? "bg-purple-500"
                              : "bg-amber-500"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(15, elapsedMins * 4))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {isPending && (
                        <form action={updateOrderStatusAction} className="flex-1">
                          <input type="hidden" name="orderId" value={o.id} />
                          <input type="hidden" name="status" value="PREPARING" />
                          <button
                            className={`w-full rounded-xl py-2.5 text-xs font-black shadow-xs hover:opacity-90 transition ${
                              isDark
                                ? "bg-amber-500 text-stone-950"
                                : "bg-slate-900 text-white"
                            }`}
                          >
                            {t.startCook}
                          </button>
                        </form>
                      )}

                      {(isPreparing || isAccepted) && (
                        <form action={updateOrderStatusAction} className="flex-1">
                          <input type="hidden" name="orderId" value={o.id} />
                          <input type="hidden" name="status" value="READY" />
                          <button className="w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-purple-500 transition">
                            {t.markReady}
                          </button>
                        </form>
                      )}

                      {isReady && (
                        <form action={updateOrderStatusAction} className="flex-1">
                          <input type="hidden" name="orderId" value={o.id} />
                          <input type="hidden" name="status" value="SERVED" />
                          <button className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition">
                            {t.served}
                          </button>
                        </form>
                      )}

                      {isDone && (
                        <div className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2 text-center text-xs font-bold text-emerald-400">
                          {t.orderDone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

