import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLang, pick } from "@/lib/i18n";
import { LangToggle, ProductList } from "@/components/Menu";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string; id: string };
  searchParams: { lang?: string };
}) {
  const lang = parseLang(searchParams.lang);
  const r = await prisma.restaurant.findFirst({
    where: { slug: params.slug, isActive: true },
  });
  if (!r) notFound();

  // Tenant isolation: verify category belongs to this restaurant
  const c = await prisma.category
    .findFirst({
      where: { id: params.id, restaurantId: r.id, isActive: true },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
      },
    })
    .catch(() => null);

  if (!c) notFound();
  const base = `/menu/${r.slug}/category/${c.id}`;

  return (
    <div className="min-h-screen bg-stone-50 py-6 px-4">
      <main className="mx-auto max-w-3xl space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/menu/${r.slug}?lang=${lang}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 hover:text-stone-900 transition-all"
          >
            <span>←</span>
            <span>{pick(lang, r.name, r.nameAm)}</span>
          </Link>
          <LangToggle base={base} lang={lang} />
        </div>

        {/* Category Header Card */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                {lang === "am" ? "የምድብ ዝርዝር" : "Category Menu"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-0.5">
                {pick(lang, c.name, c.nameAm)}
              </h1>
              {lang === "en" && c.nameAm && (
                <p className="text-sm font-medium text-stone-500 mt-1">
                  {c.nameAm}
                </p>
              )}
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 border border-stone-200">
              {c.products.length} {lang === "am" ? "ምግቦች" : "Items"}
            </span>
          </div>
        </div>

        {/* Product Items */}
        <ProductList
          products={c.products}
          lang={lang}
          currency={r.currency}
        />
      </main>
    </div>
  );
}
