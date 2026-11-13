import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLang } from "@/lib/i18n";
import InteractiveMenu from "@/components/InteractiveMenu";

export const dynamic = "force-dynamic";

interface PublicMenuPageProps {
  params: { slug: string } | Promise<{ slug: string }>;
  searchParams?: {
    lang?: string;
    table?: string;
  } | Promise<{
    lang?: string;
    table?: string;
  }>;
}

export default async function PublicMenuPage({
  params,
  searchParams,
}: PublicMenuPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedQuery = (await Promise.resolve(searchParams)) || {};
  const slug = resolvedParams?.slug;
  const lang = parseLang(resolvedQuery?.lang);

  if (!slug) {
    notFound();
  }

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

  // Record anonymous menu views without blocking the page
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

  // Serialize Decimal objects to plain numbers for client component compatibility
  const serializedProducts = restaurant.products.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <InteractiveMenu
        restaurant={{
          ...restaurant,
          name: restaurant.name,
          nameAm: restaurant.nameAm,
        }}
        categories={restaurant.categories}
        products={serializedProducts}
        tables={restaurant.tables}
        initialTableToken={resolvedQuery?.table}
        lang={lang}
      />
    </main>
  );
}
