import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderStatusClient } from "./OrderStatusClient";

export const dynamic = "force-dynamic";

export default async function OrderStatusPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      table: true,
      restaurant: true,
    },
  });

  if (!order) notFound();

  // Serialize: convert Decimal/Date to plain JSON-safe values
  const serialized = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    customerName: order.customerName ?? null,
    notes: order.notes ?? null,
    table: order.table ? { tableNumber: order.table.tableNumber } : null,
    restaurant: {
      name: order.restaurant.name,
      slug: order.restaurant.slug,
      currency: order.restaurant.currency ?? "ETB",
    },
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      totalPrice: Number(item.totalPrice),
      notes: item.notes ?? null,
    })),
  };

  return (
    <>
      {/* Auto-refresh every 5 seconds for live status updates */}
      <meta httpEquiv="refresh" content="5" />
      <OrderStatusClient order={serialized} />
    </>
  );
}
