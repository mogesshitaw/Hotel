"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type OrderInputItem = {
  productId: string;
  quantity: number;
  notes?: string;
};

export async function submitCustomerOrder({
  restaurantSlug,
  tableToken,
  customerName,
  customerPhone,
  notes,
  items,
}: {
  restaurantSlug: string;
  tableToken?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items: OrderInputItem[];
}) {
  if (!items || items.length === 0) {
    return { success: false, message: "Cart cannot be empty." };
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: restaurantSlug, isActive: true },
  });

  if (!restaurant) {
    return { success: false, message: "Restaurant not found." };
  }

  // Find table if token provided
  let tableId: string | null = null;
  if (tableToken) {
    const table = await prisma.restaurantTable.findFirst({
      where: {
        restaurantId: restaurant.id,
        qrToken: tableToken,
        isActive: true,
      },
    });
    if (table) {
      tableId = table.id;
    }
  }

  // 1. Fetch authorized database prices for requested products
  const productIds = items.map((i) => i.productId);
  const dbProducts = await prisma.product.findMany({
    where: {
      restaurantId: restaurant.id,
      id: { in: productIds },
      isAvailable: true,
      isActive: true,
    },
  });

  if (dbProducts.length === 0) {
    return { success: false, message: "Selected products are no longer available." };
  }

  // 2. Compute accurate line item costs strictly on server
  const calculatedItems = items
    .map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product || item.quantity <= 0) return null;
      const unitPrice = product.price;
      const totalPrice = Number(unitPrice) * item.quantity;
      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        notes: item.notes || null,
      };
    })
    .filter(Boolean) as {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: any;
    totalPrice: number;
    notes: string | null;
  }[];

  if (calculatedItems.length === 0) {
    return { success: false, message: "No valid items to order." };
  }

  const subtotal = calculatedItems.reduce(
    (acc, curr) => acc + Number(curr.totalPrice),
    0
  );
  const total = subtotal;

  const countToday = await prisma.order.count({
    where: { restaurantId: restaurant.id },
  });
  const orderNumber = `#${100 + countToday + 1}`;

  // 3. Persist order and line items
  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId,
      orderNumber,
      type: "DINE_IN",
      status: "PENDING",
      customerName: customerName?.trim() || null,
      customerPhone: customerPhone?.trim() || null,
      notes: notes?.trim() || null,
      subtotal,
      tax: 0,
      discount: 0,
      total,
      items: {
        create: calculatedItems.map((ci) => ({
          productId: ci.productId,
          productName: ci.productName,
          quantity: ci.quantity,
          unitPrice: ci.unitPrice,
          totalPrice: ci.totalPrice,
          notes: ci.notes,
        })),
      },
    },
    include: {
      items: true,
      table: true,
    },
  });

  revalidatePath(`/dashboard/orders`);
  revalidatePath(`/order/${order.id}`);

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
  };
}

