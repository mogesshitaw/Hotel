import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { updateOrderStatus } from "../actions";
import { KitchenDisplayClient } from "./KitchenDisplayClient";

export const dynamic = "force-dynamic";

export default async function KitchenDisplaySystem() {
  const { restaurant } = await getRestaurantContext();

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      status: { in: ["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED"] },
    },
    include: { items: true, table: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // Serialize: strip Decimal / Date objects before passing to client
  const serialized = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    type: o.type,
    customerName: o.customerName ?? null,
    notes: o.notes ?? null,
    createdAt: o.createdAt.toISOString(),
    table: o.table ? { tableNumber: o.table.tableNumber } : null,
    items: o.items.map((it) => ({
      id: it.id,
      productName: it.productName,
      quantity: it.quantity,
      notes: it.notes ?? null,
    })),
  }));

  const newCount       = serialized.filter((o) => o.status === "PENDING").length;
  const inKitchenCount = serialized.filter((o) => ["ACCEPTED", "PREPARING"].includes(o.status)).length;
  const readyCount     = serialized.filter((o) => o.status === "READY").length;
  const completedCount = serialized.filter((o) => o.status === "COMPLETED").length;

  return (
    <>
      {/* Auto-refresh every 8 seconds for live kitchen updates */}
      <meta httpEquiv="refresh" content="8" />
      <KitchenDisplayClient
        orders={serialized}
        newCount={newCount}
        inKitchenCount={inKitchenCount}
        readyCount={readyCount}
        completedCount={completedCount}
        updateOrderStatusAction={updateOrderStatus}
      />
    </>
  );
}
