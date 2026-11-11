import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "./session";

/** Resolves the signed-in user's restaurant (tenant). Every dashboard query must use ctx.restaurant.id. */
export async function getRestaurantContext(opts: { write?: boolean } = {}) {
  const userId = await getCurrentUserId();
  const m = await prisma.membership.findFirst({
    where: { userId, isActive: true, user: { isActive: true }, restaurant: { isActive: true } },
    include: { restaurant: true },
  });
  if (!m) throw new Error("Forbidden");
  if (opts.write && m.role !== "OWNER" && m.role !== "MANAGER") throw new Error("Forbidden");
  return { userId, role: m.role, restaurant: m.restaurant };
}
