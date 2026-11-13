"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";

const str = (f: FormData, k: string) => (String(f.get(k) ?? "").trim() || null);

export async function createCategory(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const name = str(f, "name");
  if (!name) return;
  await prisma.category.create({ data: { restaurantId: restaurant.id, name, nameAm: str(f, "nameAm") } });
  revalidatePath("/dashboard/categories");
}

export async function toggleCategory(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const id = String(f.get("id"));
  const c = await prisma.category.findFirst({ where: { id, restaurantId: restaurant.id } });
  if (!c) return;
  await prisma.category.update({ where: { id }, data: { isActive: !c.isActive } });
  revalidatePath("/dashboard/categories");
}

export async function createProduct(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const name = str(f, "name");
  const price = Number(f.get("price"));
  if (!name || !(price >= 0)) return;
  const categoryId = str(f, "categoryId");
  if (categoryId && !(await prisma.category.findFirst({ where: { id: categoryId, restaurantId: restaurant.id } }))) return;
  await prisma.product.create({
    data: {
      restaurantId: restaurant.id, categoryId, name, nameAm: str(f, "nameAm"),
      description: str(f, "description"), descriptionAm: str(f, "descriptionAm"),
      imageUrl: str(f, "imageUrl"), price,
    },
  });
  revalidatePath("/dashboard/products");
  revalidatePath(`/menu/${restaurant.slug}`);
}

export async function updateProduct(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const id = String(f.get("id"));
  const name = str(f, "name");
  const price = Number(f.get("price"));
  if (!id || !name || !(price >= 0)) return;
  const categoryId = str(f, "categoryId");
  const description = str(f, "description");
  const descriptionAm = str(f, "descriptionAm");
  const imageUrl = str(f, "imageUrl");

  await prisma.product.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: {
      name,
      nameAm: str(f, "nameAm"),
      price,
      categoryId: categoryId || null,
      description: description || null,
      descriptionAm: descriptionAm || null,
      imageUrl: imageUrl || null,
    },
  });
  revalidatePath("/dashboard/products");
  revalidatePath(`/menu/${restaurant.slug}`);
}

export async function deleteProduct(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const id = String(f.get("id"));
  if (!id) return;
  await prisma.product.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });
  revalidatePath("/dashboard/products");
  revalidatePath(`/menu/${restaurant.slug}`);
}

export async function setProductState(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const field = String(f.get("field")) === "isActive" ? "isActive" : "isAvailable";
  const value = String(f.get("value")) === "true";
  await prisma.product.updateMany({ where: { id: String(f.get("id")), restaurantId: restaurant.id }, data: { [field]: value } });
  revalidatePath("/dashboard/products");
}

export async function updateSettings(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const name = str(f, "name");
  if (!name) return;
  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { name, nameAm: str(f, "nameAm"), description: str(f, "description"), phone: str(f, "phone"),
            logoUrl: str(f, "logoUrl"), coverUrl: str(f, "coverUrl") },
  });
  revalidatePath("/dashboard/settings");
}

export async function updateOrderStatus(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const orderId = String(f.get("orderId"));
  const status = String(f.get("status")) as any;

  if (!orderId || !status) return;

  await prisma.order.updateMany({
    where: { id: orderId, restaurantId: restaurant.id },
    data: { status },
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/kitchen");
  revalidatePath(`/order/${orderId}`);
}

export async function createPosOrder(data: {
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  type?: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  discount?: number;
  items: { productId: string; quantity: number; notes?: string }[];
  payNow?: boolean;
  paymentMethod?: "CASH" | "TELEBIRR" | "BANK_TRANSFER" | "CARD" | "OTHER";
}) {
  const { restaurant } = await getRestaurantContext({ write: true });

  if (!data.items || data.items.length === 0) {
    return { success: false, message: "No items in POS ticket." };
  }

  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { restaurantId: restaurant.id, id: { in: productIds } },
  });

  const calculatedItems = data.items
    .map((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      if (!p || item.quantity <= 0) return null;
      const unitPrice = p.price;
      const totalPrice = Number(unitPrice) * item.quantity;
      return {
        productId: p.id,
        productName: p.name,
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

  const subtotal = calculatedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const discount = Math.max(0, data.discount || 0);
  const total = Math.max(0, subtotal - discount);

  const orderCount = await prisma.order.count({ where: { restaurantId: restaurant.id } });
  const orderNumber = `#${100 + orderCount + 1}`;

  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId: data.tableId || null,
      orderNumber,
      type: data.type || "DINE_IN",
      status: data.payNow ? "COMPLETED" : "PENDING",
      customerName: data.customerName?.trim() || null,
      customerPhone: data.customerPhone?.trim() || null,
      notes: data.notes?.trim() || null,
      subtotal,
      discount,
      total,
      items: {
        create: calculatedItems,
      },
    },
    include: { items: true },
  });

  if (data.payNow) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: data.paymentMethod || "CASH",
        status: "PAID",
        paidAt: new Date(),
      },
    });
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/kitchen");
  revalidatePath("/dashboard/pos");

  return { success: true, orderId: order.id, orderNumber: order.orderNumber };
}

export async function createTable(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const tableNumber = String(f.get("tableNumber") ?? "").trim();
  const capacity = Number(f.get("capacity")) || 4;

  if (!tableNumber) return;

  const qrToken = `tbl-${restaurant.slug}-${tableNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString(36)}`;

  await prisma.restaurantTable.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber,
      capacity,
      qrToken,
    },
  });

  revalidatePath("/dashboard/tables");
}

export async function toggleTableStatus(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const id = String(f.get("id"));

  const table = await prisma.restaurantTable.findFirst({
    where: { id, restaurantId: restaurant.id },
  });
  if (!table) return;

  await prisma.restaurantTable.update({
    where: { id },
    data: { isActive: !table.isActive },
  });

  revalidatePath("/dashboard/tables");
}
