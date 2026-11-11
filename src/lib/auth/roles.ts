import { RestaurantRole } from "@prisma/client";

export type RoleType = RestaurantRole | "SUPER_ADMIN";

// Define accessible routes per role
export const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  SUPER_ADMIN: [
    "/admin",
    "/admin/tenants",
    "/admin/plans",
    "/admin/subscriptions",
    "/admin/payments",
    "/admin/analytics",
    "/admin/audit",
  ],
  OWNER: [
    "/dashboard",
    "/dashboard/pos",
    "/dashboard/kitchen",
    "/dashboard/orders",
    "/dashboard/tables",
    "/dashboard/categories",
    "/dashboard/products",
    "/dashboard/qr-codes",
    "/dashboard/erp",
    "/dashboard/inventory",
    "/dashboard/ingredients",
    "/dashboard/purchasing",
    "/dashboard/expenses",
    "/dashboard/reports",
    "/dashboard/settings",
  ],
  MANAGER: [
    "/dashboard",
    "/dashboard/pos",
    "/dashboard/kitchen",
    "/dashboard/orders",
    "/dashboard/tables",
    "/dashboard/categories",
    "/dashboard/products",
    "/dashboard/qr-codes",
    "/dashboard/erp",
    "/dashboard/inventory",
    "/dashboard/ingredients",
    "/dashboard/purchasing",
    "/dashboard/expenses",
    "/dashboard/reports",
  ],
  CASHIER: [
    "/dashboard",
    "/dashboard/pos",
    "/dashboard/orders",
    "/dashboard/tables",
  ],
  KITCHEN: [
    "/dashboard/kitchen",
    "/dashboard/orders",
    "/dashboard/inventory",
  ],
  WAITER: [
    "/dashboard/orders",
    "/dashboard/tables",
    "/dashboard/pos",
  ],
};

// Default landing page by role upon login
export const ROLE_LANDING_PAGES: Record<RoleType, string> = {
  SUPER_ADMIN: "/admin",
  OWNER: "/dashboard",
  MANAGER: "/dashboard",
  CASHIER: "/dashboard/pos",
  KITCHEN: "/dashboard/kitchen",
  WAITER: "/dashboard/orders",
};

export function hasRoleAccess(role: RoleType, path: string): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
}

