import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function PlatformAnalyticsPage() {
  const [restaurants, orders, payments] = await Promise.all([
    prisma.restaurant.findMany({
      include: {
        _count: { select: { orders: true, products: true, memberships: true } },
        branches: true,
      },
    }),
    prisma.order.findMany({ select: { createdAt: true, total: true, status: true, type: true } }),
    prisma.payment.findMany({ where: { status: "PAID" }, select: { amount: true, method: true, paidAt: true } }),
  ]);

  const totalGMV = payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalGMV / totalOrders : 0;

  const byMethod: Record<string, number> = {};
  payments.forEach((p) => {
    byMethod[p.method] = (byMethod[p.method] || 0) + Number(p.amount);
  });

  const byType: Record<string, number> = {};
  orders.forEach((o) => {
    byType[o.type] = (byType[o.type] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="stocky-heading">Platform Analytics & Growth</h1>
        <p className="stocky-subheading">Cross-tenant performance benchmarks, volume metrics, and order behavior</p>
      </div>

      {/* Core Platform Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Cumulative GMV", value: `ETB ${fmt(totalGMV)}`, icon: "📈", sub: "Processed sales" },
          { label: "Avg Order Value (AOV)", value: `ETB ${fmt(avgOrderValue)}`, icon: "🎯", sub: "Across all dining modes" },
          { label: "Total Platform Orders", value: totalOrders.toLocaleString(), icon: "🛎️", sub: "All orders" },
          { label: "Total Locations", value: restaurants.reduce((acc, r) => acc + (r.branches.length || 1), 0), icon: "📍", sub: "Branches & stores" },
        ].map((k) => (
          <div key={k.label} className="stocky-card p-4">
            <div className="mb-2 text-2xl">{k.icon}</div>
            <p className="text-xs opacity-60">{k.label}</p>
            <p className="mt-0.5 text-xl font-black">{k.value}</p>
            <p className="text-[11px] opacity-50 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="stocky-card p-5">
          <h2 className="font-bold text-sm mb-4">GMV by Payment Method</h2>
          <div className="space-y-3">
            {Object.entries(byMethod).map(([method, amount]) => {
              const pct = totalGMV > 0 ? ((amount / totalGMV) * 100).toFixed(1) : "0";
              return (
                <div key={method}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold">{method}</span>
                    <span className="opacity-60">ETB {fmt(amount)} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800/40">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stocky-card p-5">
          <h2 className="font-bold text-sm mb-4">Orders by Dining Mode</h2>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, count]) => {
              const pct = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : "0";
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold">{type}</span>
                    <span className="opacity-60">{count} orders ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800/40">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
