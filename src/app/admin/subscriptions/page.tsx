import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function SubscriptionsPage() {
  const [subscriptions] = await Promise.all([
    prisma.subscription.findMany({
      include: {
        restaurant: true,
        plan: true,
        invoices: { orderBy: { createdAt: "desc" }, take: 3 },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const trialCount = subscriptions.filter((s) => s.status === "TRIALING").length;
  const mrr = subscriptions
    .filter((s) => ["ACTIVE", "TRIALING"].includes(s.status))
    .reduce((sum, s) => sum + Number(s.plan.priceMonthly), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="stocky-heading">Subscriptions</h1>
        <p className="stocky-subheading">Manage tenant billing cycles, renewals, and recurring tiers</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Estimated MRR", value: `ETB ${fmt(mrr)}`, icon: "💎" },
          { label: "Active Subscriptions", value: activeCount, icon: "✅" },
          { label: "In Trial", value: trialCount, icon: "⏳" },
          { label: "Total Accounts", value: subscriptions.length, icon: "📋" },
        ].map((k) => (
          <div key={k.label} className="stocky-card p-4">
            <div className="mb-2 text-xl">{k.icon}</div>
            <p className="text-xs opacity-60">{k.label}</p>
            <p className="mt-0.5 text-xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Subscriptions List */}
      <div className="stocky-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-inherit">
          <h2 className="font-bold text-sm">All Subscriptions ({subscriptions.length})</h2>
          <Link href="/admin/plans" className="text-xs text-indigo-400 hover:underline">Manage Plans & Tiers →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="stocky-table-head">
              <tr>
                <th className="px-5 py-3 text-left">Tenant</th>
                <th className="px-5 py-3 text-left">Plan</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Monthly Rate</th>
                <th className="px-5 py-3 text-left">Period End</th>
                <th className="px-5 py-3 text-right">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="stocky-table-row">
                  <td className="px-5 py-4">
                    <p className="font-bold">{sub.restaurant.name}</p>
                    <p className="text-xs opacity-50">{sub.restaurant.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold">{sub.plan.name}</span>
                    <span className="ml-1.5 text-xs opacity-50 uppercase">({sub.plan.tier})</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-950/40 text-emerald-400 border-emerald-800">
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-black">
                    ETB {fmt(Number(sub.plan.priceMonthly))}
                  </td>
                  <td className="px-5 py-4 text-xs opacity-70">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString("en-ET")}
                  </td>
                  <td className="px-5 py-4 text-right text-xs opacity-70">
                    {sub.invoices.length} billed
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
