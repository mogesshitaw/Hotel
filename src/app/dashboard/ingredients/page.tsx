import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { prisma } from "@/lib/prisma";
import { createIngredient, updateIngredient } from "../erp/actions";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const inputRow =
  "w-full rounded-xl border border-stone-200 dark:border-[#25324d] bg-white dark:bg-[#101624] px-3 py-2.5 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400";
const inputSm =
  "w-full rounded-xl border border-stone-200 dark:border-[#25324d] bg-white dark:bg-[#101624] px-3 py-2 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400";

export default async function IngredientsPage() {
  const { restaurant } = await getRestaurantContext();
  const rid = restaurant.id;

  const ingredients = await prisma.ingredient.findMany({
    where: { restaurantId: rid },
    include: { inventory: { take: 1 } },
    orderBy: { name: "asc" },
  });

  const units = ["kg", "g", "L", "mL", "pcs", "bottles", "bags", "boxes", "unit"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Ingredients</h1>
        <p className="text-sm text-stone-500 dark:text-slate-400 mt-0.5">
          {ingredients.length} ingredients · Manage your ingredient catalog
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-stone-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-5 shadow-sm sticky top-24">
            <h2 className="font-semibold text-stone-800 dark:text-white mb-4">Add New Ingredient</h2>
            <form action={createIngredient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Name (English) *</label>
                <input type="text" name="name" required placeholder="e.g. Beef" className={inputRow} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Name (Amharic)</label>
                <input type="text" name="nameAm" placeholder="ለምሳሌ: ስጋ" className={inputRow} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Unit *</label>
                <select name="unit" className={inputRow}>
                  {units.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Cost per Unit (ETB) *</label>
                <input type="number" name="costPerUnit" min="0" step="0.01" required placeholder="0.00" className={inputRow} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Minimum Stock</label>
                <input type="number" name="minimumStock" min="0" step="0.01" placeholder="0.00" className={inputRow} />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-2.5 text-sm font-black text-stone-950 shadow-sm transition-colors"
              >
                Add Ingredient
              </button>
            </form>
          </div>
        </div>

        {/* Ingredients List */}
        <div className="lg:col-span-2 space-y-3">
          {ingredients.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 dark:border-[#222d42] bg-stone-50 dark:bg-[#151c2c] py-20 text-center">
              <span className="text-5xl">🧂</span>
              <p className="mt-3 font-medium text-stone-500 dark:text-slate-400">No ingredients yet</p>
              <p className="text-sm text-stone-400 dark:text-slate-500">Add your first ingredient using the form</p>
            </div>
          )}
          {ingredients.map((ing) => {
            const inv = ing.inventory[0];
            const qty = inv ? Number(inv.quantity) : 0;
            const isLow = qty < Number(ing.minimumStock);
            return (
              <div key={ing.id} className="rounded-2xl border border-stone-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-stone-900 dark:text-white">{ing.name}</h3>
                      {ing.nameAm && <span className="text-sm text-stone-400 dark:text-slate-500">{ing.nameAm}</span>}
                      {isLow && (
                        <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">Low Stock</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-stone-600 dark:text-slate-400">
                      <span>Unit: <strong className="text-stone-800 dark:text-slate-200">{ing.unit}</strong></span>
                      <span>Cost: <strong className="text-stone-800 dark:text-slate-200">ETB {fmt(Number(ing.costPerUnit))}/{ing.unit}</strong></span>
                      <span>Min Stock: <strong className="text-stone-800 dark:text-slate-200">{fmt(Number(ing.minimumStock))} {ing.unit}</strong></span>
                      <span>In Stock: <strong className={isLow ? "text-red-600" : "text-emerald-600"}>{fmt(qty)} {ing.unit}</strong></span>
                    </div>
                  </div>
                  <details className="shrink-0">
                    <summary className="cursor-pointer list-none rounded-xl border border-stone-200 dark:border-[#25324d] px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-[#1c253b] transition-colors">
                      Edit ▾
                    </summary>
                    <div className="absolute z-10 mt-2 w-72 rounded-2xl border border-stone-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] shadow-xl p-4">
                      <form action={updateIngredient} className="space-y-3">
                        <input type="hidden" name="id" value={ing.id} />
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Name</label>
                          <input type="text" name="name" defaultValue={ing.name} className={inputSm} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Amharic Name</label>
                          <input type="text" name="nameAm" defaultValue={ing.nameAm ?? ""} className={inputSm} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Unit</label>
                            <select name="unit" defaultValue={ing.unit} className={inputSm}>
                              {units.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Cost/Unit</label>
                            <input type="number" name="costPerUnit" step="0.01" defaultValue={Number(ing.costPerUnit)} className={inputSm} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">Min Stock</label>
                          <input type="number" name="minimumStock" step="0.01" defaultValue={Number(ing.minimumStock)} className={inputSm} />
                        </div>
                        <button type="submit" className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-2 text-sm font-black text-stone-950 transition-colors">Save Changes</button>
                      </form>
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
