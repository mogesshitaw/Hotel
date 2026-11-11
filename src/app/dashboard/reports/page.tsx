import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

export default async function ReportsPage() {
  const { restaurant } = await getRestaurantContext();
  const rid = restaurant.id;
  const now = new Date();
  const monthStart = startOfMonth(now);

  // ── Revenue (from paid payments) ───────────────────────────────────────────
  const paymentsMonth = await prisma.payment.findMany({
    where: { order: { restaurantId: rid }, status: "PAID", paidAt: { gte: monthStart } },
    include: { order: { select: { type: true, createdAt: true } } },
  });
  const grossRevenue = paymentsMonth.reduce((s, p) => s + Number(p.amount), 0);

  // ── COGS (received POs this month) ─────────────────────────────────────────
  const posMonth = await prisma.purchaseOrder.findMany({
    where: { restaurantId: rid, status: "RECEIVED", updatedAt: { gte: monthStart } },
  });
  const totalCOGS = posMonth.reduce((s, po) => s + Number(po.total), 0);

  // ── Expenses this month ────────────────────────────────────────────────────
  const expMonth = await prisma.expense.findMany({
    where: { restaurantId: rid, date: { gte: monthStart } },
  });
  const totalExpenses = expMonth.reduce((s, e) => s + Number(e.amount), 0);

  // ── Net Profit ─────────────────────────────────────────────────────────────
  const grossProfit = grossRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;
  const grossMarginPct = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : "0.0";
  const netMarginPct = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : "0.0";

  // ── Weekly Breakdown (last 4 weeks) ────────────────────────────────────────
  const weeks: { label: string; revenue: number; cogs: number; expenses: number }[] = [];
  for (let w = 3; w >= 0; w--) {
    const ws = new Date(startOfWeek(now).getTime() - w * 7 * 86400000);
    const we = new Date(ws.getTime() + 7 * 86400000);
    const [wPay, wPOs, wExp] = await Promise.all([
      prisma.payment.findMany({ where: { order: { restaurantId: rid }, status: "PAID", paidAt: { gte: ws, lt: we } } }),
      prisma.purchaseOrder.findMany({ where: { restaurantId: rid, status: "RECEIVED", updatedAt: { gte: ws, lt: we } } }),
      prisma.expense.findMany({ where: { restaurantId: rid, date: { gte: ws, lt: we } } }),
    ]);
    weeks.push({
      label: ws.toLocaleDateString("en-ET", { month: "short", day: "numeric" }),
      revenue: wPay.reduce((s, p) => s + Number(p.amount), 0),
      cogs: wPOs.reduce((s, po) => s + Number(po.total), 0),
      expenses: wExp.reduce((s, e) => s + Number(e.amount), 0),
    });
  }

  // ── Expense by Category ────────────────────────────────────────────────────
  const expByCategory: Record<string, number> = {};
  for (const e of expMonth) {
    expByCategory[e.category] = (expByCategory[e.category] ?? 0) + Number(e.amount);
  }

  // ── Payment Methods ────────────────────────────────────────────────────────
  const payByMethod: Record<string, number> = {};
  for (const p of paymentsMonth) {
    payByMethod[p.method] = (payByMethod[p.method] ?? 0) + Number(p.amount);
  }

  const maxWeekRevenue = Math.max(...weeks.map((w) => w.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Financial Reports</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {now.toLocaleDateString("en-ET", { month: "long", year: "numeric" })} · {restaurant.name}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Gross Revenue", value: grossRevenue, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: "💰" },
          { label: "COGS", value: totalCOGS, color: "text-red-600", bg: "bg-red-50 border-red-200", icon: "🏭" },
          { label: "Expenses", value: totalExpenses, color: "text-orange-600", bg: "bg-orange-50 border-orange-200", icon: "💸" },
          { label: "Net Profit", value: netProfit, color: netProfit >= 0 ? "text-teal-600" : "text-red-600", bg: netProfit >= 0 ? "bg-teal-50 border-teal-200" : "bg-red-50 border-red-200", icon: "📈" },
        ].map((k) => (
          <div key={k.label} className={`rounded-2xl border p-5 shadow-sm ${k.bg}`}>
            <div className="mb-2 text-2xl">{k.icon}</div>
            <p className="text-xs text-stone-500">{k.label}</p>
            <p className={`text-xl font-bold ${k.color}`}>ETB {fmt(k.value)}</p>
          </div>
        ))}
      </div>

      {/* Margin Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Gross Margin", value: `${grossMarginPct}%`, sub: `ETB ${fmt(grossProfit)} profit before expenses` },
          { label: "Net Margin", value: `${netMarginPct}%`, sub: `ETB ${fmt(netProfit)} after all costs` },
          { label: "COGS Ratio", value: grossRevenue > 0 ? `${((totalCOGS / grossRevenue) * 100).toFixed(1)}%` : "N/A", sub: "Cost of goods sold vs revenue" },
          { label: "Expense Ratio", value: grossRevenue > 0 ? `${((totalExpenses / grossRevenue) * 100).toFixed(1)}%` : "N/A", sub: "Operating expenses vs revenue" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-stone-500 mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-stone-900">{k.value}</p>
            <p className="text-xs text-stone-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly Breakdown + P&L */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Bar Chart */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-stone-800 mb-4">Weekly Revenue vs Costs</h2>
          <div className="flex items-end gap-3 h-32">
            {weeks.map((w, i) => {
              const revH = Math.round((w.revenue / maxWeekRevenue) * 100);
              const costH = Math.round(((w.cogs + w.expenses) / maxWeekRevenue) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-0.5">
                    <div className="rounded-t-lg bg-teal-400" style={{ width: "45%", height: `${revH}px`, minHeight: "2px" }} title={`Revenue: ETB ${fmt(w.revenue)}`} />
                    <div className="rounded-t-lg bg-red-300" style={{ width: "45%", height: `${costH}px`, minHeight: "2px" }} title={`Costs: ETB ${fmt(w.cogs + w.expenses)}`} />
                  </div>
                  <span className="text-[9px] text-stone-400">{w.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded bg-teal-400" />Revenue</div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded bg-red-300" />COGS + Expenses</div>
          </div>
        </div>

        {/* P&L Statement */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-stone-800 mb-4">P&L Summary — This Month</h2>
          <div className="space-y-2">
            {[
              { label: "Gross Revenue", value: grossRevenue, type: "revenue" },
              { label: "Cost of Goods (COGS)", value: -totalCOGS, type: "cost" },
              { label: "Gross Profit", value: grossProfit, type: "total", bold: true },
              { label: "", value: 0, type: "divider" },
              ...Object.entries(expByCategory).map(([k, v]) => ({ label: `  ${k}`, value: -v, type: "cost" })),
              { label: "Total Expenses", value: -totalExpenses, type: "cost", bold: true },
              { label: "", value: 0, type: "divider" },
              { label: "Net Profit", value: netProfit, type: netProfit >= 0 ? "profit" : "loss", bold: true },
            ].map((row, i) => {
              if (row.type === "divider") return <div key={i} className="h-px bg-stone-100 my-2" />;
              return (
                <div key={i} className={`flex items-center justify-between py-1 ${row.bold ? "font-semibold" : ""}`}>
                  <span className={`text-sm ${row.bold ? "text-stone-900" : "text-stone-600"}`}>{row.label}</span>
                  <span className={`text-sm ${
                    row.type === "revenue" ? "text-emerald-600" :
                    row.type === "cost" ? "text-red-600" :
                    row.type === "profit" ? "text-teal-700 text-base" :
                    row.type === "loss" ? "text-red-700 text-base" :
                    "text-stone-900"
                  } ${row.bold ? "font-bold" : ""}`}>
                    ETB {fmt(Math.abs(row.value))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Detail Table */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800">Weekly Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-stone-600 text-xs uppercase tracking-wider">Week</th>
                <th className="px-5 py-3 text-right font-semibold text-stone-600 text-xs uppercase tracking-wider">Revenue</th>
                <th className="px-5 py-3 text-right font-semibold text-stone-600 text-xs uppercase tracking-wider">COGS</th>
                <th className="px-5 py-3 text-right font-semibold text-stone-600 text-xs uppercase tracking-wider">Expenses</th>
                <th className="px-5 py-3 text-right font-semibold text-stone-600 text-xs uppercase tracking-wider">Net</th>
                <th className="px-5 py-3 text-right font-semibold text-stone-600 text-xs uppercase tracking-wider">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {weeks.map((w, i) => {
                const net = w.revenue - w.cogs - w.expenses;
                const margin = w.revenue > 0 ? ((net / w.revenue) * 100).toFixed(1) : "N/A";
                return (
                  <tr key={i} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-stone-800">{w.label}</td>
                    <td className="px-5 py-3 text-right text-emerald-600 font-semibold">ETB {fmt(w.revenue)}</td>
                    <td className="px-5 py-3 text-right text-red-500">ETB {fmt(w.cogs)}</td>
                    <td className="px-5 py-3 text-right text-orange-500">ETB {fmt(w.expenses)}</td>
                    <td className={`px-5 py-3 text-right font-bold ${net >= 0 ? "text-teal-600" : "text-red-600"}`}>ETB {fmt(net)}</td>
                    <td className={`px-5 py-3 text-right text-sm ${Number(margin) >= 0 ? "text-teal-600" : "text-red-500"}`}>{margin}{margin !== "N/A" ? "%" : ""}</td>
                  </tr>
                );
              })}
              {/* Totals Row */}
              <tr className="bg-stone-50 font-semibold border-t-2 border-stone-200">
                <td className="px-5 py-3 text-stone-900">Month Total</td>
                <td className="px-5 py-3 text-right text-emerald-700">ETB {fmt(grossRevenue)}</td>
                <td className="px-5 py-3 text-right text-red-600">ETB {fmt(totalCOGS)}</td>
                <td className="px-5 py-3 text-right text-orange-600">ETB {fmt(totalExpenses)}</td>
                <td className={`px-5 py-3 text-right font-bold ${netProfit >= 0 ? "text-teal-700" : "text-red-700"}`}>ETB {fmt(netProfit)}</td>
                <td className={`px-5 py-3 text-right ${Number(netMarginPct) >= 0 ? "text-teal-700" : "text-red-700"}`}>{netMarginPct}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Methods */}
      {Object.keys(payByMethod).length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-stone-800 mb-4">Revenue by Payment Method</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(payByMethod).map(([method, total]) => (
              <div key={method} className="rounded-xl bg-stone-50 border border-stone-100 px-5 py-3">
                <p className="text-xs text-stone-500">{method}</p>
                <p className="text-lg font-bold text-stone-900">ETB {fmt(total)}</p>
                <p className="text-xs text-stone-400">{grossRevenue > 0 ? ((total / grossRevenue) * 100).toFixed(1) : 0}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

