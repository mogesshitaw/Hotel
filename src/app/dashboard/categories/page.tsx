import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { createCategory, toggleCategory } from "../actions";
import { inputCls, btnCls, cardCls } from "@/components/ui";

export default async function Categories() {
  const { restaurant } = await getRestaurantContext();
  const cats = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Menu Categories
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
          Organize your food and beverage catalog into searchable sections.
        </p>
      </div>

      {/* Add Category Form Card */}
      <div className={cardCls}>
        <h2 className="text-sm font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
          <span>➕</span>
          <span>Add New Category</span>
        </h2>
        <form action={createCategory} className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">
              English Name *
            </label>
            <input
              name="name"
              placeholder="e.g. Hot Beverages"
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">
              Amharic Name (አማርኛ)
            </label>
            <input
              name="nameAm"
              placeholder="e.g. ትኩስ መጠጦች"
              className={inputCls}
            />
          </div>
          <div className="flex items-end">
            <button className={`${btnCls} w-full`}>
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-stone-900 dark:text-white">
          Existing Categories ({cats.length})
        </h2>

        {cats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-8 text-center text-sm text-stone-400 dark:text-slate-500">
            No categories created yet. Add your first category above.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {cats.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded-2xl border dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-4 shadow-2xs transition-all ${
                  c.isActive
                    ? "border-stone-200/80 hover:border-stone-300 dark:hover:border-[#2e3f5c] hover:shadow-xs"
                    : "border-stone-200 bg-stone-50/70 dark:bg-[#1c253b]/60 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white text-base">
                      {c.name}
                    </span>
                    <span className="rounded-full bg-stone-100 dark:bg-[#1c253b] px-2 py-0.5 text-[10px] font-semibold text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-[#25324d]">
                      {c._count.products} dishes
                    </span>
                  </div>
                  {c.nameAm && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                      {c.nameAm}
                    </p>
                  )}
                </div>

                <form action={toggleCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      c.isActive
                        ? "bg-stone-100 dark:bg-[#1c253b] text-stone-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                    }`}
                  >
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
