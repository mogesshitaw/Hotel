import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { prisma } from "@/lib/prisma";
import { adjustStock } from "../erp/actions";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const inputSm =
  "w-full rounded-xl border border-stone-200 dark:border-[#25324d] bg-white dark:bg-[#101624] px-3 py-2 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400";

export default async function InventoryPage() {
  const { restaurant } = await getRestaurantContext();
  const rid = restaurant.id;

  const items = await prisma.inventory.findMany({
    where: { restaurantId: rid },
    include: {
      ingredient: true,
      movements: { orderBy: { createdAt: "desc" }, take: 3 },
    },
    orderBy: { ingredient: { name: "asc" } },
  });

  const lowStock = items.filter((i) => Number(i.quantity) < Number(i.ingredient.minimumStock));
  const totalValue = items.reduce((s, i) => s + Number(i.quantity) * Number(i.ingredient.costPerUnit), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-stone-500 dark:text-slate-400 mt-0.5">
            {items.length} ingredients · Total value: ETB {fmt(totalValue)}
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/ingredients"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-sm font-black text-stone-950 shadow-sm transition-colors"
          >
            + Add Ingredient
          </a>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-500">⚠️</span>
            <p className="font-semibold text-red-700 dark:text-red-400 text-sm">{lowStock.length} items below minimum stock</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((i) => (
              <span key={i.id} className="rounded-lg bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800/50 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400">
                {i.ingredient.name} ({fmt(Number(i.quantity))} {i.ingredient.unit})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="rounded-2xl border border-stone-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-[#1c253b] border-b border-stone-200 dark:border-[#222d42]">
              <tr>
                <th className="px-5 py-3.5 text-left font-semibold text-stone-600 dark:text-slate-400 text-xs uppercase tracking-wider">Ingredient</th>
                <th className="px-5 py-3.5 text-right font-semibold text-stone-600 dark:text-slate-400 text-xs uppercase tracking-wider">In Stock</th>
                <th className="px-5 py-3.5 text-right font-semibold text-stone-600 dark:text-slate-400 text-xs uppercase tracking-wider">Min Stock</th>
                <th className="px-5 py-3.5 text-right font-semibold text-stone-600 dark:text-slate-400 text-xs uppercase tracking-wider">Cost/Unit</th>
                <th className="px-5 py-3.5 text-right font-semibold text-stone-600 dark:text-slate-400 text-xs uppercase tracking-wider">Total Value</th>
                <th className="px-5 py-3.5 text-center font-semibold text-stone-600 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-center font-semibold text-stone-600 dark:text-slate-400 text-xs uppercase tracking-wider">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-[#1e2638]">
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-stone-400 dark:text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl">📦</span>
                      <p className="font-medium">No inventory yet</p>
                      <a href="/dashboard/ingredients" className="text-sm text-teal-600 dark:text-teal-400 hover:underline">Add your first ingredient →</a>
                    </div>
                  </td>
                </tr>
              )}
              {items.map((inv) => {
                const qty = Number(inv.quantity);
                const minQty = Number(inv.ingredient.minimumStock);
                const cost = Number(inv.ingredient.costPerUnit);
                const value = qty * cost;
                const isLow = qty < minQty;
                const pct = minQty > 0 ? Math.min(100, Math.round((qty / minQty) * 100)) : 100;
                return (
                  <tr key={inv.id} className={`hover:bg-stone-50/70 dark:hover:bg-[#1c253b]/50 transition-colors ${isLow ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-white">{inv.ingredient.name}</p>
                        {inv.ingredient.nameAm && <p className="text-xs text-stone-400 dark:text-slate-500">{inv.ingredient.nameAm}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-base font-bold ${isLow ? "text-red-600" : "text-stone-900 dark:text-white"}`}>
                        {fmt(qty)}
                      </span>
                      <span className="ml-1 text-xs text-stone-400 dark:text-slate-500">{inv.ingredient.unit}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-stone-600 dark:text-slate-400">
                      {fmt(minQty)} {inv.ingredient.unit}
                    </td>
                    <td className="px-5 py-4 text-right text-stone-600 dark:text-slate-400">ETB {fmt(cost)}</td>
                    <td className="px-5 py-4 text-right font-semibold text-stone-900 dark:text-white">ETB {fmt(value)}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {isLow ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                            ⚠ Low
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            ✓ OK
                          </span>
                        )}
                        <div className="w-16 h-1.5 rounded-full bg-stone-100 dark:bg-[#1c253b] overflow-hidden">
                          <div className={`h-full rounded-full ${isLow ? "bg-red-400" : "bg-emerald-400"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <details className="relative group">
                        <summary className="cursor-pointer list-none inline-flex items-center gap-1 rounded-xl border border-stone-200 dark:border-[#25324d] px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-[#1c253b] transition-colors">
                          Adjust ▾
                        </summary>
                        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-stone-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] shadow-xl p-4">
                          <form action={adjustStock} className="space-y-3">
                            <input type="hidden" name="ingredientId" value={inv.ingredientId} />
                            <div>
                              <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Quantity (+ add, − remove)</label>
                              <input type="number" name="quantity" step="0.01" placeholder="e.g. 5 or -2" className={inputSm} />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Reason</label>
                              <select name="reason" className={inputSm}>
                                <option value="ADJUSTMENT">Manual Adjustment</option>
                                <option value="WASTE">Waste</option>
                                <option value="PURCHASE">Purchase</option>
                                <option value="RECIPE_USE">Recipe Use</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Notes (optional)</label>
                              <input type="text" name="notes" placeholder="Optional note" className={inputSm} />
                            </div>
                            <button type="submit" className="w-full rounded-xl bg-teal-600 hover:bg-teal-500 py-2 text-sm font-black text-white transition-colors">
                              Apply
                            </button>
                          </form>
                        </div>
                      </details>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Stock Movements */}
      {items.some((i) => i.movements.length > 0) && (
        <div className="rounded-2xl border border-stone-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-5 shadow-sm">
          <h2 className="font-semibold text-stone-800 dark:text-white mb-4">Recent Stock Movements</h2>
          <div className="space-y-2">
            {items
              .flatMap((i) => i.movements.map((m) => ({ ...m, ingName: i.ingredient.name })))
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 10)
              .map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-stone-50 dark:border-[#1e2638] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${Number(m.quantity) > 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {Number(m.quantity) > 0 ? "↑" : "↓"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-stone-800 dark:text-slate-200">{m.ingName}</p>
                      <p className="text-xs text-stone-400 dark:text-slate-500">{m.reason} {m.notes ? `· ${m.notes}` : ""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${Number(m.quantity) > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {Number(m.quantity) > 0 ? "+" : ""}{Number(m.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
