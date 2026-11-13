import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import PosTerminal from "@/components/PosTerminal";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const { restaurant } = await getRestaurantContext();

  const [categories, products, tables] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId: restaurant.id, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { restaurantId: restaurant.id, isActive: true, isAvailable: true },
      orderBy: { name: "asc" },
    }),
    prisma.restaurantTable.findMany({
      where: { restaurantId: restaurant.id, isActive: true },
      orderBy: { tableNumber: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto overflow-hidden">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Point of Sale (POS)</span>
          <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/40">
            Cashier & Waiter Station
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
          In-person quick ordering, kitchen tickets (KOT), and multi-channel payment collection.
        </p>
      </div>

      <PosTerminal
        restaurant={restaurant}
        categories={categories}
        products={products}
        tables={tables}
      />
    </div>
  );
}

