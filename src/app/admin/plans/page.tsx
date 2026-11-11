import { prisma } from "@/lib/prisma";
import { createPlan, togglePlan } from "../actions";
import { PlanTier } from "@prisma/client";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const tierColors: Record<PlanTier, string> = {
  BASIC: "bg-slate-700/60 text-slate-300 border-slate-600",
  STANDARD: "bg-blue-900/60 text-blue-300 border-blue-700",
  PREMIUM: "bg-violet-900/60 text-violet-300 border-violet-700",
  ENTERPRISE: "bg-amber-900/60 text-amber-300 border-amber-700",
};

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: [{ tier: "asc" }, { priceMonthly: "asc" }],
    include: { _count: { select: { restaurants: true, subscriptions: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="stocky-heading">Plans & Pricing</h1>
        <p className="stocky-subheading">Define subscription tiers with feature flags and usage limits</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`stocky-card relative p-5 shadow-xl transition-all hover:shadow-2xl ${
              !plan.isActive ? "opacity-50" : ""
            }`}
          >
            {plan.tier === "PREMIUM" && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-3 py-0.5 text-xs font-bold text-white shadow">
                Most Popular
              </div>
            )}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${tierColors[plan.tier]}`}>
                  {plan.tier}
                </span>
                <h3 className="mt-2 text-lg font-bold">{plan.name}</h3>
              </div>
              <span className="text-xs text-slate-400">{plan._count.restaurants} tenants</span>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-black">
                ETB {fmt(Number(plan.priceMonthly))}
                <span className="text-sm font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-xs text-slate-400">ETB {fmt(Number(plan.priceYearly))}/yr</p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400 mb-5">
              <li className="flex gap-2"><span className="text-emerald-400">✓</span>{plan.maxBranches} branch{plan.maxBranches !== 1 ? "es" : ""}</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span>{plan.maxUsers} users</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span>{plan.maxProducts} products</li>
              {plan.hasKDS && <li className="flex gap-2"><span className="text-emerald-400">✓</span>Kitchen Display (KDS)</li>}
              {plan.hasPOS && <li className="flex gap-2"><span className="text-emerald-400">✓</span>Point of Sale (POS)</li>}
              {plan.hasERP && <li className="flex gap-2"><span className="text-emerald-400">✓</span>ERP & Inventory</li>}
              {plan.hasAPI && <li className="flex gap-2"><span className="text-emerald-400">✓</span>API Access</li>}
              {!plan.hasKDS && <li className="flex gap-2 text-slate-500"><span>✗</span>KDS</li>}
              {!plan.hasPOS && <li className="flex gap-2 text-slate-500"><span>✗</span>POS</li>}
              {!plan.hasERP && <li className="flex gap-2 text-slate-500"><span>✗</span>ERP</li>}
            </ul>
            {plan.description && <p className="text-xs text-slate-400 mb-4">{plan.description}</p>}
            <form action={togglePlan}>
              <input type="hidden" name="id" value={plan.id} />
              <button
                type="submit"
                className={`w-full rounded-xl py-2 text-xs font-semibold transition-colors ${
                  plan.isActive
                    ? "border border-rose-800/80 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50"
                    : "border border-emerald-800 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50"
                }`}
              >
                {plan.isActive ? "Deactivate" : "Activate"}
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Create Plan Form */}
      <div className="stocky-card p-6">
        <h2 className="font-bold text-base mb-5">Create New Plan</h2>
        <form action={createPlan} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Plan Name *</label>
            <input type="text" name="name" required placeholder="e.g. Pro, Starter…" className="stocky-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Tier *</label>
            <select name="tier" required className="stocky-input">
              {Object.values(PlanTier).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Monthly Price (ETB) *</label>
            <input type="number" name="priceMonthly" min="0" step="0.01" required placeholder="0.00" className="stocky-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Yearly Price (ETB) *</label>
            <input type="number" name="priceYearly" min="0" step="0.01" required placeholder="0.00" className="stocky-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Max Branches</label>
            <input type="number" name="maxBranches" min="1" defaultValue={1} className="stocky-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Max Users</label>
            <input type="number" name="maxUsers" min="1" defaultValue={5} className="stocky-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Max Products</label>
            <input type="number" name="maxProducts" min="1" defaultValue={100} className="stocky-input" />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 mb-2">Feature Flags</label>
            <div className="flex flex-wrap gap-4">
              {["hasKDS", "hasPOS", "hasERP", "hasAPI"].map((flag) => (
                <label key={flag} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name={flag} className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500" />
                  <span className="text-xs">{flag.replace("has", "")}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
            <input type="text" name="description" placeholder="Short description shown to tenants" className="stocky-input" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" className="rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-95 transition-opacity">
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
