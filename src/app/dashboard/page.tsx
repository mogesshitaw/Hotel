import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { cardCls } from "@/components/ui";

export default async function Overview() {
  const { restaurant: r } = await getRestaurantContext();
  const since = new Date(Date.now() - 7 * 864e5);

  const [products, categories, views, byLang] = await Promise.all([
    prisma.product.count({ where: { restaurantId: r.id, isActive: true } }),
    prisma.category.count({ where: { restaurantId: r.id, isActive: true } }),
    prisma.menuView.count({
      where: { restaurantId: r.id, createdAt: { gte: since } },
    }),
    prisma.menuView.groupBy({
      by: ["lang"],
      where: { restaurantId: r.id, createdAt: { gte: since } },
      _count: true,
    }),
  ]);

  const stats = [
    {
      label: "Menu Views (7 days)",
      value: views,
      icon: "👀",
      change: "+100%",
      desc: "Contactless QR scans",
    },
    {
      label: "Active Dishes",
      value: products,
      icon: "🍲",
      change: "Catalog",
      desc: `Priced in ${r.currency}`,
    },
    {
      label: "Menu Categories",
      value: categories,
      icon: "🗂️",
      change: "Active",
      desc: "Bilingual sections",
    },
  ];

  const totalLangViews = byLang.reduce((acc, curr) => acc + curr._count, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#151c2c] to-amber-950/80 p-6 text-white shadow-md sm:p-8 border border-white/10">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xs">
            <span>✨</span>
            <span>Digital Menu Operations & ERP</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome, {r.name}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Your restaurant management platform and digital menu are active. Customers can view dishes in English and Amharic, while your staff manage POS, Kitchen and ERP.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950 transition hover:bg-amber-400"
            >
              <span>+ Add Dish</span>
            </Link>
            <Link
              href="/dashboard/pos"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#283556] border border-[#3b4c77] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#34446e]"
            >
              <span>Point of Sale (POS)</span>
            </Link>
            <Link
              href="/dashboard/qr-codes"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
            >
              <span>Get QR Code</span>
            </Link>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-10 text-9xl opacity-10 select-none pointer-events-none">
          🍽️
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-5 shadow-xs transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span className="rounded-full bg-slate-100 dark:bg-[#1c253b] border border-slate-200 dark:border-[#25324d] px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {s.change}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {s.value}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {s.label}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                {s.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Language Engagement & Storefront Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Language Split */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Customer Language Preference
            </h2>
            <span className="text-xs text-slate-400">Last 7 Days</span>
          </div>

          <div className="mt-4 space-y-3">
            {byLang.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                Scan your QR code to generate initial analytics.
              </p>
            ) : (
              byLang.map((item) => {
                const percentage = Math.round((item._count / totalLangViews) * 100);
                const isAm = item.lang === "am";
                return (
                  <div key={item.lang} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span>{isAm ? "🇪🇹" : "🇬🇧"}</span>
                        <span>{isAm ? "Amharic (አማርኛ)" : "English"}</span>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {item._count} views ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#1c253b]">
                      <div
                        className={`h-full rounded-full ${
                          isAm ? "bg-amber-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Storefront Details */}
        <div className={cardCls}>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Storefront Details
          </h2>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-[#1e2638] text-xs">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 dark:text-slate-400">Storefront URL</span>
              <span className="font-mono font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                /menu/{r.slug}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 dark:text-slate-400">Currency</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{r.currency}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 dark:text-slate-400">Timezone</span>
              <span className="text-slate-600 dark:text-slate-300">{r.timezone}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500 dark:text-slate-400">Contact Phone</span>
              <span className="text-slate-600 dark:text-slate-300">{r.phone || "Not set"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
