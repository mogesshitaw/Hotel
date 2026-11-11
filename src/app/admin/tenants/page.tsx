import { prisma } from "@/lib/prisma";
import { toggleTenant, assignPlanToTenant, createBranch } from "../actions";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function TenantsPage() {
  const [restaurants, plans] = await Promise.all([
    prisma.restaurant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscription: { include: { plan: true } },
        branches: true,
        _count: {
          select: {
            orders: true,
            memberships: true,
            products: true,
          },
        },
      },
    }),
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceMonthly: "asc" } }),
  ]);

  const restaurantGMV: Record<string, number> = {};
  for (const r of restaurants) {
    const pay = await prisma.payment.aggregate({
      where: { order: { restaurantId: r.id }, status: "PAID" },
      _sum: { amount: true },
    });
    restaurantGMV[r.id] = Number(pay._sum.amount ?? 0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="stocky-heading">Tenants & Branches</h1>
          <p className="stocky-subheading">{restaurants.length} restaurants hosted on the platform</p>
        </div>
      </div>

      {/* Tenant list */}
      <div className="space-y-4">
        {restaurants.map((r) => (
          <div key={r.id} className={`stocky-card overflow-hidden ${!r.isActive ? "opacity-75" : ""}`}>
            {/* Tenant header */}
            <div className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-inherit">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-500/20 text-lg font-bold text-violet-400 border border-violet-500/30">
                {r.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-base">{r.name}</h3>
                  {r.nameAm && <span className="text-sm opacity-60">{r.nameAm}</span>}
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      r.isActive
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800"
                        : "bg-rose-950/40 text-rose-400 border-rose-800"
                    }`}
                  >
                    {r.isActive ? "Active" : "Suspended"}
                  </span>
                  {r.subscription && (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-indigo-950/40 text-indigo-400 border-indigo-800">
                      {r.subscription.status}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-60 mt-0.5">
                  slug: <code>{r.slug}</code> · joined: {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-6 text-center shrink-0">
                {[
                  { label: "Orders", value: r._count.orders },
                  { label: "Staff", value: r._count.memberships },
                  { label: "Products", value: r._count.products },
                  { label: "GMV", value: `ETB ${fmt(restaurantGMV[r.id] ?? 0)}` },
                  { label: "Branches", value: r.branches.length },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-sm font-bold">{m.value}</p>
                    <p className="text-xs opacity-60">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
              {/* Subscription */}
              <div className="stocky-inner-card p-4">
                <p className="text-xs font-semibold opacity-70 mb-2">Subscription</p>
                {r.subscription ? (
                  <div className="mb-3 text-sm space-y-1">
                    <p className="font-bold">{r.subscription.plan?.name}</p>
                    <p className="text-xs opacity-60">
                      Expires: {new Date(r.subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs opacity-60 mb-3">No active subscription</p>
                )}
                <form action={assignPlanToTenant} className="space-y-2">
                  <input type="hidden" name="restaurantId" value={r.id} />
                  <select name="planId" className="stocky-input text-xs py-1.5">
                    <option value="">— Select Plan —</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (ETB {fmt(Number(p.priceMonthly))}/mo)
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" name="durationDays" placeholder="Days (30)" defaultValue={30} className="stocky-input text-xs py-1.5" />
                    <input type="number" name="trialDays" placeholder="Trial days" defaultValue={0} className="stocky-input text-xs py-1.5" />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-indigo-600 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors">
                    Assign Plan
                  </button>
                </form>
              </div>

              {/* Branches */}
              <div className="stocky-inner-card p-4">
                <p className="text-xs font-semibold opacity-70 mb-2">Branches ({r.branches.length})</p>
                <div className="space-y-1 mb-3">
                  {r.branches.slice(0, 3).map((b) => (
                    <div key={b.id} className="flex items-center gap-2 text-xs">
                      <span>{b.isHQ ? "🏠" : "🏪"}</span>
                      <span className={b.isActive ? "" : "line-through opacity-50"}>{b.name}</span>
                    </div>
                  ))}
                  {r.branches.length === 0 && <p className="text-xs opacity-50">No branch added</p>}
                </div>
                <form action={createBranch} className="space-y-2">
                  <input type="hidden" name="restaurantId" value={r.id} />
                  <input type="text" name="name" placeholder="Branch name *" className="stocky-input text-xs py-1.5" />
                  <input type="text" name="address" placeholder="Address" className="stocky-input text-xs py-1.5" />
                  <button type="submit" className="w-full rounded-xl border border-inherit py-1.5 text-xs font-semibold hover:bg-slate-500/10 transition-colors">
                    + Add Branch
                  </button>
                </form>
              </div>

              {/* Quick Actions */}
              <div className="stocky-inner-card p-4">
                <p className="text-xs font-semibold opacity-70 mb-3">Actions</p>
                <div className="space-y-2">
                  <a
                    href={`/menu/${r.slug}`}
                    target="_blank"
                    className="flex w-full items-center gap-2 rounded-xl border border-inherit px-3 py-1.5 text-xs font-semibold hover:bg-slate-500/10 transition-colors"
                  >
                    🔗 View Public Menu
                  </a>
                  <form action={toggleTenant}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        r.isActive
                          ? "border-rose-900/40 bg-rose-950/20 text-rose-300 hover:bg-rose-900/40"
                          : "border-emerald-900/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/40"
                      }`}
                    >
                      {r.isActive ? "🔒 Suspend Tenant" : "✅ Reactivate Tenant"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
