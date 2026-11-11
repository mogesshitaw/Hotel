import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "./session";

export async function getSuperAdminContext() {
  const cookieStore = cookies();
  const sessionUser = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionUser) {
    const admin = await prisma.adminUser.findUnique({
      where: { id: sessionUser },
    });
    if (admin) {
      return { adminId: admin.id, email: admin.email, name: admin.name, role: "SUPER_ADMIN" as const };
    }
  }

  // Fallback for dev ease
  return { adminId: "platform-admin-dev", email: "admin@saas.com", name: "Super Admin", role: "SUPER_ADMIN" as const };
}
