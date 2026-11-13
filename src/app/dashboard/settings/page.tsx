import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { updateSettings } from "../actions";
import { inputCls, btnCls, cardCls } from "@/components/ui";

export default async function Settings() {
  const { restaurant: r } = await getRestaurantContext();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Restaurant Settings &amp; Branding
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
          Customize your restaurant profile, contact details, and public menu appearance.
        </p>
      </div>

      <form action={updateSettings} className="space-y-6">
        {/* Brand & Identity */}
        <div className={cardCls}>
          <h2 className="text-sm font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
            <span>🏷️</span>
            <span>Profile &amp; Names</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">
                Restaurant Name (English) *
              </label>
              <input
                name="name"
                defaultValue={r.name}
                required
                placeholder="e.g. Fre Bar &amp; Restaurant"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">
                የሬስቶራንት ስም (አማርኛ)
              </label>
              <input
                name="nameAm"
                defaultValue={r.nameAm ?? ""}
                placeholder="ለምሳሌ፡ ፍሬ ባር እና ሬስቶራንት"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">
                Tagline or Description
              </label>
              <input
                name="description"
                defaultValue={r.description ?? ""}
                placeholder="e.g. Premium dining, traditional flavors and cocktail lounge."
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                name="phone"
                defaultValue={r.phone ?? ""}
                placeholder="+251 90 000 0000"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Media & Artwork */}
        <div className={cardCls}>
          <h2 className="text-sm font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
            <span>🎨</span>
            <span>Logo &amp; Cover Banner</span>
          </h2>
          <div className="grid gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">
                Logo URL (square ratio recommended)
              </label>
              <input
                name="logoUrl"
                defaultValue={r.logoUrl ?? ""}
                placeholder="https://example.com/logo.png"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">
                Cover Image URL (landscape banner)
              </label>
              <input
                name="coverUrl"
                defaultValue={r.coverUrl ?? ""}
                placeholder="https://example.com/cover.jpg"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* System & URL Info */}
        <div className={cardCls}>
          <h2 className="text-sm font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
            <span>🔗</span>
            <span>Public Storefront Link</span>
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-stone-50 dark:bg-[#1c253b] p-3 border border-stone-200/80 dark:border-[#25324d]">
            <div>
              <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400">
                /menu/{r.slug}
              </span>
              <p className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">
                Currency: <strong className="text-stone-600 dark:text-slate-300">{r.currency}</strong> · Timezone: <strong className="text-stone-600 dark:text-slate-300">{r.timezone}</strong>
              </p>
            </div>
            <a
              href={`/menu/${r.slug}`}
              target="_blank"
              className="rounded-lg bg-white dark:bg-[#151c2c] px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-[#25324d] hover:bg-stone-50 dark:hover:bg-[#1c253b] transition"
            >
              Open Menu ↗
            </a>
          </div>
        </div>

        <button className={btnCls}>
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}
