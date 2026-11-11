"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PlanTier, SubscriptionStatus } from "@prisma/client";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim() || null;
const num = (f: FormData, k: string) => Number(f.get(k)) || 0;

// ─── Plans ───────────────────────────────────────────────────────────────────

export async function createPlan(f: FormData) {
  const name = str(f, "name");
  const tier = str(f, "tier") as PlanTier;
  if (!name || !tier) return;
  await prisma.plan.create({
    data: {
      name,
      tier,
      priceMonthly: num(f, "priceMonthly"),
      priceYearly: num(f, "priceYearly"),
      maxBranches: num(f, "maxBranches") || 1,
      maxUsers: num(f, "maxUsers") || 5,
      maxProducts: num(f, "maxProducts") || 100,
      hasKDS: f.get("hasKDS") === "on",
      hasPOS: f.get("hasPOS") === "on",
      hasERP: f.get("hasERP") === "on",
      hasAPI: f.get("hasAPI") === "on",
      description: str(f, "description"),
    },
  });
  revalidatePath("/admin/plans");
}

export async function togglePlan(f: FormData) {
  const id = str(f, "id")!;
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) return;
  await prisma.plan.update({ where: { id }, data: { isActive: !plan.isActive } });
  revalidatePath("/admin/plans");
}

// ─── Tenants ─────────────────────────────────────────────────────────────────

export async function toggleTenant(f: FormData) {
  const id = str(f, "id")!;
  const r = await prisma.restaurant.findUnique({ where: { id } });
  if (!r) return;
  await prisma.restaurant.update({ where: { id }, data: { isActive: !r.isActive } });
  // Log audit
  await prisma.auditLog.create({
    data: {
      restaurantId: id,
      action: r.isActive ? "UPDATE" : "UPDATE",
      entity: "Restaurant",
      entityId: id,
      description: `Tenant "${r.name}" ${r.isActive ? "suspended" : "reactivated"} by platform admin`,
    },
  });
  revalidatePath("/admin/tenants");
}

export async function assignPlanToTenant(f: FormData) {
  const restaurantId = str(f, "restaurantId")!;
  const planId = str(f, "planId")!;
  const durationDays = num(f, "durationDays") || 30;

  const now = new Date();
  const periodEnd = new Date(now.getTime() + durationDays * 86400000);
  const trialDays = num(f, "trialDays");
  const trialEnd = trialDays > 0 ? new Date(now.getTime() + trialDays * 86400000) : null;

  const existing = await prisma.subscription.findUnique({ where: { restaurantId } });
  const statusVal: SubscriptionStatus = trialDays > 0 ? "TRIALING" : "ACTIVE";

  if (existing) {
    await prisma.subscription.update({
      where: { restaurantId },
      data: { planId, status: statusVal, currentPeriodStart: now, currentPeriodEnd: periodEnd, trialEnd },
    });
  } else {
    await prisma.subscription.create({
      data: { restaurantId, planId, status: statusVal, currentPeriodStart: now, currentPeriodEnd: periodEnd, trialEnd },
    });
  }
  // Update restaurant planId
  await prisma.restaurant.update({ where: { id: restaurantId }, data: { planId } });

  await prisma.auditLog.create({
    data: {
      restaurantId,
      action: "SUBSCRIPTION_CHANGE",
      entity: "Subscription",
      entityId: restaurantId,
      description: `Plan assigned (planId: ${planId}, status: ${statusVal}) for ${durationDays} days`,
    },
  });
  revalidatePath("/admin/tenants");
  revalidatePath("/admin/subscriptions");
}

// ─── Branches ────────────────────────────────────────────────────────────────

export async function createBranch(f: FormData) {
  const restaurantId = str(f, "restaurantId")!;
  const name = str(f, "name");
  if (!restaurantId || !name) return;
  await prisma.branch.create({
    data: {
      restaurantId,
      name,
      nameAm: str(f, "nameAm"),
      address: str(f, "address"),
      phone: str(f, "phone"),
      isHQ: f.get("isHQ") === "on",
    },
  });
  revalidatePath("/admin/tenants");
}

// ─── Gateway Transactions ────────────────────────────────────────────────────

export async function createGatewayTransaction(f: FormData) {
  const provider = str(f, "provider") as "TELEBIRR" | "CHAPA" | "CBE_BIRR" | "MANUAL";
  const amount = num(f, "amount");
  const phone = str(f, "phone");
  const reference = str(f, "reference");
  const invoiceId = str(f, "invoiceId");

  await prisma.gatewayTransaction.create({
    data: {
      provider,
      amount,
      phone,
      reference,
      invoiceId,
      status: "PENDING",
      currency: "ETB",
    },
  });
  revalidatePath("/admin/payments");
}

export async function markTransactionSuccess(f: FormData) {
  const id = str(f, "id")!;
  await prisma.gatewayTransaction.update({
    where: { id },
    data: { status: "SUCCESS" },
  });
  await prisma.auditLog.create({
    data: {
      action: "PAYMENT",
      entity: "GatewayTransaction",
      entityId: id,
      description: `Payment transaction ${id.slice(0, 8)} marked SUCCESS`,
    },
  });
  revalidatePath("/admin/payments");
}

