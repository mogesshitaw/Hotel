"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { ROLE_LANDING_PAGES, RoleType } from "@/lib/auth/roles";
import { RestaurantRole } from "@prisma/client";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const selectedRole = String(formData.get("role") || "OWNER");

  if (!email) {
    return { error: "Email is required" };
  }

  if (selectedRole === "SUPER_ADMIN") {
    let admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      admin = await prisma.adminUser.create({
        data: {
          email,
          name: email.split("@")[0].toUpperCase() + " (Super Admin)",
        },
      });
    }

    cookies().set(SESSION_COOKIE_NAME, admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    redirect("/admin");
  } else {
    // Restaurant Staff / Owner / Manager / Cashier / Kitchen / Waiter
    const restaurantRole = selectedRole as RestaurantRole;
    let user = await prisma.user.findUnique({
      where: { email },
      include: { memberships: { include: { restaurant: true } } },
    });

    if (!user) {
      const restaurant = await prisma.restaurant.findFirst();
      if (!restaurant) {
        return { error: "No restaurant found. Please seed the database first." };
      }

      const newUserId = "00000000-0000-4000-8000-" + Math.random().toString(16).substring(2, 14).padEnd(12, "0");
      user = await prisma.user.create({
        data: {
          id: newUserId,
          email,
          name: email.split("@")[0],
          memberships: {
            create: {
              restaurantId: restaurant.id,
              role: restaurantRole,
            },
          },
        },
        include: { memberships: { include: { restaurant: true } } },
      });
    }

    cookies().set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Smart redirect to role-specific landing page
    const userRole = user.memberships[0]?.role || "OWNER";
    const landing = ROLE_LANDING_PAGES[userRole as RoleType] || "/dashboard";
    redirect(landing);
  }
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
