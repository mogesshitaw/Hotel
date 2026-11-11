import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function ErpOverviewPage() {
  const { restaurant } = await getRestaurantContext();
  const rid = restaurant.id;
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const yesterdayEnd = new Date(todayStart.getTime() - 1);

  // ── Sales Metrics ──────────────────────────────────────────────────────────
  const [paymentsYesterday, paymentsThisWeek] = await Promise.all([
    prisma.payment.findMany({
      where: { order: { restaurantId: rid }, status: "PAID", paidAt: { gte: yesterdayStart, lte: yesterdayEnd } },
    }),
    prisma.payment.findMany({
      where: { order: { restaurantId: rid }, status: "PAID", paidAt: { gte: weekStart } },
    }),
  ]);
  const salesYesterday = paymentsYesterday.reduce((s, p) => s + Number(p.amount), 0);
  const salesThisWeek = paymentsThisWeek.reduce((s, p) => s + Number(p.amount), 0);

  // ── Ordering Panel ─────────────────────────────────────────────────────────
  const openPOs = await prisma.purchaseOrder.findMany({
    where: { restaurantId: rid, status: { in: ["DRAFT", "ORDERED"] } },
    include: { supplier: true, items: true },
    orderBy: { orderDate: "desc" },
    take: 10,
  });
  const openPOValue = openPOs.reduce((s, po) => s + Number(po.total), 0);

  // ── Receiving Panel ────────────────────────────────────────────────────────
  const receivedThisWeek = await prisma.purchaseOrder.findMany({
    where: { restaurantId: rid, status: "RECEIVED", updatedAt: { gte: weekStart } },
  });
  const receivedValue = receivedThisWeek.reduce((s, po) => s + Number(po.total), 0);
  const pendingToReceive = await prisma.purchaseOrder.count({ where: { restaurantId: rid, status: "ORDERED" } });

  // ── COGS Calculation (last 5 weeks) ────────────────────────────────────────
  const cogsWeeks: { period: string; cogs: number; sales: number }[] = [];
  for (let w = 4; w >= 0; w--) {
    const ws = new Date(weekStart.getTime() - w * 7 * 86400000);
    const we = new Date(ws.getTime() + 7 * 86400000);
    const [wPOs, wPay] = await Promise.all([
      prisma.purchaseOrder.findMany({ where: { restaurantId: rid, status: "RECEIVED", updatedAt: { gte: ws, lt: we } } }),
      prisma.payment.findMany({ where: { order: { restaurantId: rid }, status: "PAID", paidAt: { gte: ws, lt: we } } }),
    ]);
    const cogs = wPOs.reduce((s, po) => s + Number(po.total), 0);
    const sales = wPay.reduce((s, p) => s + Number(p.amount), 0);
    cogsWeeks.push({
      period: ws.toLocaleDateString("en-ET", { month: "short", day: "numeric" }),
      cogs,
      sales,
    });
  }
  const maxCogs = Math.max(...cogsWeeks.map(w => Math.max(w.cogs, w.sales)), 1);

  // ── Inventory Count Value ──────────────────────────────────────────────────
  const inventoryItems = await prisma.inventory.findMany({
    where: { restaurantId: rid },
    include: { ingredient: true },
  });
  const totalInventoryValue = inventoryItems.reduce(
    (s, inv) => s + Number(inv.quantity) * Number(inv.ingredient.costPerUnit),
    0
  );

  // ── Waste ──────────────────────────────────────────────────────────────────
  const [wasteToday, wasteYesterday, wasteWeek] = await Promise.all([
    prisma.stockMovement.findMany({ where: { restaurantId: rid, reason: "WASTE", createdAt: { gte: todayStart } }, include: { ingredient: true } }),
    prisma.stockMovement.findMany({ where: { restaurantId: rid, reason: "WASTE", createdAt: { gte: yesterdayStart, lte: yesterdayEnd } }, include: { ingredient: true } }),
    prisma.stockMovement.findMany({ where: { restaurantId: rid, reason: "WASTE", createdAt: { gte: weekStart } }, include: { ingredient: true } }),
  ]);
  const wasteVal = (ms: typeof wasteToday) =>
    ms.reduce((s, m) => s + Math.abs(Number(m.quantity)) * Number(m.ingredient.costPerUnit), 0);

  // ── Expenses this month ────────────────────────────────────────────────────
  const draftCount = await prisma.purchaseOrder.count({ where: { restaurantId: rid, status: "DRAFT" } });
  const monthExpenses = await prisma.expense.aggregate({
    where: { restaurantId: rid, date: { gte: monthStart } },
    _sum: { amount: true },
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            ERP Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time procurement, sales, food cost &amp; inventory control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live Sync
          </span>
        </div>
      </div>

      {/* Top Row: Sales + Receiving + Count Value */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Sales */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Sales</h2>
            <span className="text-xs text-slate-400">POS Revenue</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Yesterday</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">ETB {fmt(salesYesterday)}</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">0%</span>
            </div>
            <div className="h-px bg-slate-100 dark:bg-[#1e2638]" />
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">This week</p>
                <p className="text-2xl font-black text-amber-500">ETB {fmt(salesThisWeek)}</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">0%</span>
            </div>
          </div>
          {/* Mini bar chart */}
          <div className="mt-4 flex items-end gap-1 h-16">
            {cogsWeeks.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-t bg-amber-500"
                  style={{ height: `${Math.round((w.sales / maxCogs) * 48)}px`, minHeight: "3px" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-1">
            {cogsWeeks.map((w, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-slate-400">{w.period}</div>
            ))}
          </div>
        </div>

        {/* Receiving Orders */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Receiving Orders</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Received this week</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">ETB {fmt(receivedValue)}</p>
            </div>
            <div className="h-px bg-slate-100 dark:bg-[#1e2638]" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total to receive</p>
              <p className="text-xl font-black text-amber-500">{pendingToReceive} orders</p>
            </div>
          </div>
          {pendingToReceive === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 py-4">
              <span className="text-3xl">🎉</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">No orders to receive</p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-xs font-bold text-amber-400">{pendingToReceive} pending delivery</p>
            </div>
          )}
        </div>

        {/* Count Value */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Count Value</h2>
            <a href="/dashboard/inventory" className="text-xs text-amber-500 hover:underline">Full report →</a>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mb-4">ETB {fmt(totalInventoryValue)}</p>
          <div className="space-y-2">
            {inventoryItems.slice(0, 5).map((inv) => {
              const val = Number(inv.quantity) * Number(inv.ingredient.costPerUnit);
              return (
                <div key={inv.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px]">{inv.ingredient.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">ETB {fmt(val)}</span>
                </div>
              );
            })}
            {inventoryItems.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">No inventory data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: Ordering + COGS Chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Ordering */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Ordering</h2>
            <a href="/dashboard/purchasing" className="text-xs text-amber-500 hover:underline">Order history →</a>
          </div>
          <div className="mb-3 flex gap-6">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Open orders value</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">ETB {fmt(openPOValue)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Placed today</p>
              <p className="text-xl font-black text-amber-500">{openPOs.filter(po => new Date(po.orderDate) >= todayStart).length}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#1e2638] text-slate-500 dark:text-slate-400">
                  <th className="pb-2 text-left font-bold uppercase tracking-wider">Supplier</th>
                  <th className="pb-2 text-left font-bold uppercase tracking-wider">Delivery date</th>
                  <th className="pb-2 text-right font-bold uppercase tracking-wider">Items</th>
                  <th className="pb-2 text-right font-bold uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e2638]">
                {openPOs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                      No open purchase orders
                    </td>
                  </tr>
                )}
                {openPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-[#1c253b] transition-colors">
                    <td className="py-2 text-slate-800 dark:text-slate-200 font-semibold">{po.supplier.name}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">
                      {po.deliveryDate
                        ? po.deliveryDate.toLocaleDateString("en-ET", { month: "short", day: "numeric" })
                        : "—"}
                    </td>
                    <td className="py-2 text-right text-slate-700 dark:text-slate-300">{po.items.length}</td>
                    <td className="py-2 text-right font-bold text-amber-500">
                      ETB {fmt(Number(po.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COGS Over Time */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-5 shadow-xs">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">COGS Over Time</h2>
            <span className="text-xs text-slate-400">Food Cost &amp; Profit</span>
          </div>
          {(() => {
            const totalCogs = cogsWeeks.reduce((s, w) => s + w.cogs, 0);
            const totalSales = cogsWeeks.reduce((s, w) => s + w.sales, 0);
            const cogsPct = totalSales > 0 ? ((totalCogs / totalSales) * 100).toFixed(1) : "0.0";
            return (
              <div className="mb-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total COGS: </span>
                <span className="text-lg font-black text-slate-900 dark:text-white">ETB {fmt(totalCogs)}</span>
                <span className="ml-2 text-xs font-bold text-emerald-400">↑ {cogsPct}%</span>
              </div>
            );
          })()}

          {/* Bar chart */}
          <div className="flex items-end gap-2 h-24">
            {cogsWeeks.map((w, i) => {
              const salesH = maxCogs > 0 ? Math.round((w.sales / maxCogs) * 80) : 2;
              const cogsH = maxCogs > 0 ? Math.round((w.cogs / maxCogs) * 80) : 2;
              const pct = w.sales > 0 ? ((w.cogs / w.sales) * 100).toFixed(0) : "0";
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-slate-400">{pct}%</span>
                  <div className="relative w-full flex items-end justify-center gap-0.5">
                    <div className="rounded-t bg-blue-500/40" style={{ width: "45%", height: `${salesH}px`, minHeight: "3px" }} />
                    <div className="rounded-t bg-amber-500" style={{ width: "45%", height: `${cogsH}px`, minHeight: "3px" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex gap-2">
            {cogsWeeks.map((w, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-slate-400">{w.period}</div>
            ))}
          </div>

          {/* Summary table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#1e2638] text-slate-500 dark:text-slate-400">
                  <th className="pb-1.5 text-left font-bold uppercase tracking-wider">Period</th>
                  <th className="pb-1.5 text-right font-bold uppercase tracking-wider">COGS%</th>
                  <th className="pb-1.5 text-right font-bold uppercase tracking-wider">Total sales</th>
                  <th className="pb-1.5 text-right font-bold uppercase tracking-wider">COGS</th>
                  <th className="pb-1.5 text-right font-bold uppercase tracking-wider">Gross profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e2638]">
                {cogsWeeks.map((w, i) => {
                  const pct = w.sales > 0 ? ((w.cogs / w.sales) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={i}>
                      <td className="py-1 text-slate-600 dark:text-slate-400">{w.period}</td>
                      <td className="py-1 text-right text-slate-700 dark:text-slate-300">{pct}%</td>
                      <td className="py-1 text-right text-slate-700 dark:text-slate-300">ETB {fmt(w.sales)}</td>
                      <td className="py-1 text-right text-slate-700 dark:text-slate-300">ETB {fmt(w.cogs)}</td>
                      <td className="py-1 text-right text-emerald-400 font-bold">ETB {fmt(w.sales - w.cogs)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row: Accounting + Waste */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Accounting */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Accounting</h2>
            <div className="flex gap-2 text-xs">
              <span className="font-bold text-amber-500 border-b border-amber-500 pb-0.5">This month</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-slate-50 dark:bg-[#1c253b] border border-slate-100 dark:border-[#25324d] p-3 text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{draftCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Draft invoices</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-[#1c253b] border border-slate-100 dark:border-[#25324d] p-3 text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white">0</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Unmatched totals</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-[#1c253b] border border-slate-100 dark:border-[#25324d] p-3 text-center">
              <p className="text-2xl font-black text-amber-500">
                ETB {fmt(Number(monthExpenses._sum.amount ?? 0))}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Expensed</p>
            </div>
          </div>
          <a href="/dashboard/expenses" className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 dark:border-[#25324d] bg-slate-50 dark:bg-[#1c253b] py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#25324d] transition-colors">
            Manage Expenses →
          </a>
        </div>

        {/* Waste */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Food Waste Control</h2>
            <a href="/dashboard/inventory" className="text-xs text-amber-500 hover:underline">Waste report →</a>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Today", val: wasteVal(wasteToday) },
              { label: "Yesterday", val: wasteVal(wasteYesterday) },
              { label: "This week", val: wasteVal(wasteWeek) },
            ].map((w) => (
              <div key={w.label} className="rounded-xl bg-slate-50 dark:bg-[#1c253b] border border-slate-100 dark:border-[#25324d] p-3 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{w.label}</p>
                <p className={`text-lg font-black ${w.val > 0 ? "text-rose-500" : "text-slate-900 dark:text-white"}`}>
                  ETB {fmt(w.val)}
                </p>
              </div>
            ))}
          </div>
          {wasteWeek.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No waste recorded this week 🎉</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#1e2638] text-slate-500 dark:text-slate-400">
                    <th className="pb-1.5 text-left font-bold uppercase tracking-wider">Item</th>
                    <th className="pb-1.5 text-left font-bold uppercase tracking-wider">Reason</th>
                    <th className="pb-1.5 text-right font-bold uppercase tracking-wider">Qty</th>
                    <th className="pb-1.5 text-right font-bold uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e2638]">
                  {wasteWeek.slice(0, 6).map((m) => {
                    const val = Math.abs(Number(m.quantity)) * Number(m.ingredient.costPerUnit);
                    return (
                      <tr key={m.id}>
                        <td className="py-1.5 text-slate-800 dark:text-slate-200 font-semibold">{m.ingredient.name}</td>
                        <td className="py-1.5 text-slate-500 dark:text-slate-400">{m.reason}</td>
                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-300">{Math.abs(Number(m.quantity))} {m.ingredient.unit}</td>
                        <td className="py-1.5 text-right font-bold text-rose-500">ETB {fmt(val)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
