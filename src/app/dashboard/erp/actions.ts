"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { ExpenseCategory } from "@prisma/client";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim() || null;
const num = (f: FormData, k: string) => Number(f.get(k)) || 0;

// ─── Ingredients ─────────────────────────────────────────────────────────────

export async function createIngredient(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const name = str(f, "name");
  if (!name) return;
  const cost = num(f, "costPerUnit");
  const minStock = num(f, "minimumStock");
  const ingredient = await prisma.ingredient.create({
    data: {
      restaurantId: restaurant.id,
      name,
      nameAm: str(f, "nameAm"),
      unit: str(f, "unit") ?? "unit",
      costPerUnit: cost,
      minimumStock: minStock,
    },
  });
  // create inventory record
  await prisma.inventory.create({
    data: {
      restaurantId: restaurant.id,
      ingredientId: ingredient.id,
      quantity: 0,
    },
  });
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/ingredients");
}

export async function updateIngredient(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const id = str(f, "id")!;
  const ing = await prisma.ingredient.findFirst({ where: { id, restaurantId: restaurant.id } });
  if (!ing) return;
  await prisma.ingredient.update({
    where: { id },
    data: {
      name: str(f, "name") ?? ing.name,
      nameAm: str(f, "nameAm"),
      unit: str(f, "unit") ?? ing.unit,
      costPerUnit: num(f, "costPerUnit") || Number(ing.costPerUnit),
      minimumStock: num(f, "minimumStock") || Number(ing.minimumStock),
    },
  });
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/ingredients");
}

// ─── Stock Adjustments ───────────────────────────────────────────────────────

export async function adjustStock(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const ingredientId = str(f, "ingredientId")!;
  const qtyStr = str(f, "quantity") ?? "0";
  const quantity = parseFloat(qtyStr);
  const reason = str(f, "reason") ?? "ADJUSTMENT";
  const notes = str(f, "notes");

  const inv = await prisma.inventory.findFirst({ where: { restaurantId: restaurant.id, ingredientId } });
  if (!inv) return;

  await prisma.$transaction([
    prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: { increment: quantity } },
    }),
    prisma.stockMovement.create({
      data: {
        restaurantId: restaurant.id,
        ingredientId,
        inventoryId: inv.id,
        quantity,
        reason,
        notes,
      },
    }),
  ]);
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/erp");
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export async function createSupplier(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const name = str(f, "name");
  if (!name) return;
  await prisma.supplier.create({
    data: {
      restaurantId: restaurant.id,
      name,
      phone: str(f, "phone"),
      email: str(f, "email"),
      address: str(f, "address"),
    },
  });
  revalidatePath("/dashboard/purchasing");
}

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export async function createPurchaseOrder(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const supplierId = str(f, "supplierId")!;
  const deliveryDateStr = str(f, "deliveryDate");
  const notes = str(f, "notes");

  // items come in as ingredientId_0, qty_0, unitCost_0, etc.
  const items: { ingredientId: string; quantity: number; unitCost: number }[] = [];
  let i = 0;
  while (f.get(`ingredientId_${i}`)) {
    const ingredientId = String(f.get(`ingredientId_${i}`));
    const quantity = Number(f.get(`quantity_${i}`));
    const unitCost = Number(f.get(`unitCost_${i}`));
    if (ingredientId && quantity > 0 && unitCost >= 0) {
      items.push({ ingredientId, quantity, unitCost });
    }
    i++;
  }
  if (items.length === 0) return;

  const total = items.reduce((s, it) => s + it.quantity * it.unitCost, 0);
  await prisma.purchaseOrder.create({
    data: {
      restaurantId: restaurant.id,
      supplierId,
      deliveryDate: deliveryDateStr ? new Date(deliveryDateStr) : null,
      notes,
      total,
      items: {
        create: items.map((it) => ({
          ingredientId: it.ingredientId,
          quantity: it.quantity,
          unitCost: it.unitCost,
          totalCost: it.quantity * it.unitCost,
        })),
      },
    },
  });
  revalidatePath("/dashboard/purchasing");
  revalidatePath("/dashboard/erp");
}

export async function updatePurchaseOrderStatus(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const id = str(f, "id")!;
  const status = str(f, "status") as "ORDERED" | "RECEIVED" | "CANCELLED";

  const po = await prisma.purchaseOrder.findFirst({
    where: { id, restaurantId: restaurant.id },
    include: { items: true },
  });
  if (!po) return;

  if (status === "RECEIVED" && po.status !== "RECEIVED") {
    // Auto-increment inventory on receipt
    await prisma.$transaction([
      prisma.purchaseOrder.update({ where: { id }, data: { status } }),
      ...po.items.map((item) =>
        prisma.inventory.upsert({
          where: { restaurantId_ingredientId: { restaurantId: restaurant.id, ingredientId: item.ingredientId } },
          update: { quantity: { increment: item.quantity } },
          create: { restaurantId: restaurant.id, ingredientId: item.ingredientId, quantity: item.quantity },
        })
      ),
      ...po.items.map((item) =>
        prisma.stockMovement.create({
          data: {
            restaurantId: restaurant.id,
            ingredientId: item.ingredientId,
            quantity: Number(item.quantity),
            reason: "PURCHASE",
            notes: `PO #${id.slice(0, 8)}`,
          },
        })
      ),
    ]);
  } else {
    await prisma.purchaseOrder.update({ where: { id }, data: { status } });
  }
  revalidatePath("/dashboard/purchasing");
  revalidatePath("/dashboard/erp");
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export async function createExpense(f: FormData) {
  const { restaurant } = await getRestaurantContext({ write: true });
  const description = str(f, "description");
  const amount = num(f, "amount");
  const catRaw = str(f, "category") ?? "OTHER";
  const category = (Object.values(ExpenseCategory).includes(catRaw as ExpenseCategory)
    ? catRaw
    : "OTHER") as ExpenseCategory;
  const dateStr = str(f, "date");
  if (!description || amount <= 0) return;
  await prisma.expense.create({
    data: {
      restaurantId: restaurant.id,
      description,
      amount,
      category,
      date: dateStr ? new Date(dateStr) : new Date(),
      notes: str(f, "notes"),
    },
  });
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard/reports");
}

