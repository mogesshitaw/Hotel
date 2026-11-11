import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { createProduct, updateProduct, setProductState } from "../actions";
import { inputCls, selectCls, btnCls, cardCls } from "@/components/ui";

export default async function Products() {
  const { restaurant } = await getRestaurantContext();
  const [cats, products] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId: restaurant.id, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { restaurantId: restaurant.id },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          Product & Dish Catalog
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Manage your dishes, adjust prices, and toggle real-time availability.
        </p>
      </div>

      {/* Add Product Form */}
      <div className={cardCls}>
        <h2 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
          <span>➕</span>
          <span>Add New Dish or Drink</span>
        </h2>
        <form action={createProduct} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Dish Name (English) *
            </label>
            <input
              name="name"
              placeholder="e.g. Special Tibs"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              ስም (አማርኛ)
            </label>
            <input
              name="nameAm"
              placeholder="ለምሳሌ፡ ልዩ ጥብስ"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Price ({restaurant.currency}) *
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder={`0.00 ${restaurant.currency}`}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Category
            </label>
            <select name="categoryId" className={selectCls}>
              <option value="">No category</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.nameAm ? `(${c.nameAm})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Description (English)
            </label>
            <input
              name="description"
              placeholder="Tender beef cubes sauteed with onions"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              መግለጫ (አማርኛ)
            </label>
            <input
              name="descriptionAm"
              placeholder="ጥራት ካለው የበሬ ስጋ በሽንኩርት እና ቃሪያ"
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Image URL (optional)
            </label>
            <input
              name="imageUrl"
              placeholder="https://images.unsplash.com/..."
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 pt-1">
            <button className={`${btnCls} w-full sm:w-auto`}>
              <span>Publish to Menu</span>
            </button>
          </div>
        </form>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900">
            Catalog Items ({products.length})
          </h2>
          <span className="text-xs text-stone-500">
            Currency: <strong className="text-stone-800">{restaurant.currency}</strong>
          </span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-8 text-center text-sm text-stone-400">
            No products published yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-2xs transition-all ${
                  p.isActive
                    ? "border-stone-200/80 hover:border-stone-300"
                    : "border-stone-200 bg-stone-50/70 opacity-60"
                }`}
              >
                {/* Product Info & Quick Edit Form */}
                <form action={updateProduct} className="flex flex-1 flex-wrap items-center gap-3 w-full sm:w-auto">
                  <input type="hidden" name="id" value={p.id} />

                  {/* Thumbnail */}
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-700 flex-shrink-0 border border-amber-100">
                      🍲
                    </div>
                  )}

                  <div className="min-w-[140px] flex-1">
                    <input
                      name="name"
                      defaultValue={p.name}
                      placeholder="Name"
                      className="w-full font-bold text-sm text-stone-900 border-b border-transparent hover:border-stone-200 focus:border-amber-600 focus:outline-none bg-transparent"
                    />
                    <input
                      name="nameAm"
                      defaultValue={p.nameAm ?? ""}
                      placeholder="ስም"
                      className="w-full text-xs text-amber-700 font-medium border-b border-transparent hover:border-stone-200 focus:border-amber-600 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={Number(p.price)}
                      className="w-24 rounded-lg border border-stone-200 px-2 py-1 text-xs font-bold text-stone-900 text-right focus:border-amber-600 focus:outline-none"
                    />
                    <span className="text-xs font-semibold text-stone-500">
                      {restaurant.currency}
                    </span>
                    <button
                      className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors"
                      title="Save name & price changes"
                    >
                      Save
                    </button>
                  </div>
                </form>

                {/* State Toggles */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
                    {p.category?.name ?? "No category"}
                  </span>

                  {/* Availability Toggle */}
                  <form action={setProductState}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="field" value="isAvailable" />
                    <input type="hidden" name="value" value={String(!p.isAvailable)} />
                    <button
                      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                        p.isAvailable
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${p.isAvailable ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {p.isAvailable ? "Available" : "Sold Out"}
                    </button>
                  </form>

                  {/* Active / Archive Toggle */}
                  <form action={setProductState}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="field" value="isActive" />
                    <input type="hidden" name="value" value={String(!p.isActive)} />
                    <button
                      className={`inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                        p.isActive
                          ? "bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {p.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
