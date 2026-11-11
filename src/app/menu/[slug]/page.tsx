
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLang } from "@/lib/i18n";
import InteractiveMenu from "@/components/InteractiveMenu";

export const dynamic = "force-dynamic";

interface PublicMenuPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    lang?: string;
    table?: string;
  }>;
}

export default async function PublicMenuPage({
  params,
  searchParams,
}: PublicMenuPageProps) {
  const [{ slug }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  const lang = parseLang(query.lang);

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      products: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
      tables: {
        where: { isActive: true },
        orderBy: { tableNumber: "asc" },
      },
    },
  });

  if (!restaurant) {
    notFound();
  }

  // Record anonymous menu views without blocking the page.
  void prisma.menuView
    .create({
      data: {
        restaurantId: restaurant.id,
        lang,
      },
    })
    .catch((error) => {
      console.error("Menu analytics error:", error);
    });

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <InteractiveMenu
        restaurant={restaurant}
        categories={restaurant.categories}
        products={restaurant.products}
        tables={restaurant.tables}
        initialTableToken={query.table}
        lang={lang}
      />
    </main>
  );
}
