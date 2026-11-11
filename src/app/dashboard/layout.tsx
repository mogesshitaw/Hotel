import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { hasRoleAccess, RoleType } from "@/lib/auth/roles";
import { NavSection } from "@/components/ErpSidebar";
import { DashboardShellClient } from "@/components/DashboardShellClient";

export const dynamic = "force-dynamic";

const allSections: NavSection[] = [
  {
    title: "Front of House & POS",
    items: [
      { href: "/dashboard", label: "Overview", icon: "📊" },
      { href: "/dashboard/pos", label: "Point of Sale (POS)", icon: "💻" },
      { href: "/dashboard/kitchen", label: "Kitchen Display (KDS)", icon: "🍳" },
      { href: "/dashboard/orders", label: "Live Orders", icon: "🛎️" },
      { href: "/dashboard/tables", label: "Tables & Floor Plan", icon: "🪑" },
    ],
  },
  {
    title: "Menu & Catalog",
    items: [
      { href: "/dashboard/categories", label: "Categories", icon: "📑" },
      { href: "/dashboard/products", label: "Dishes & Drinks", icon: "🍔" },
      { href: "/dashboard/qr-codes", label: "QR Generator", icon: "📱" },
    ],
  },
  {
    title: "Back Office ERP",
    items: [
      { href: "/dashboard/erp", label: "ERP Executive Dashboard", icon: "📈" },
      { href: "/dashboard/inventory", label: "Inventory Stock", icon: "📦" },
      { href: "/dashboard/ingredients", label: "Raw Ingredients", icon: "🧂" },
      { href: "/dashboard/purchasing", label: "Suppliers & Purchasing", icon: "🛒" },
      { href: "/dashboard/expenses", label: "Operating Expenses", icon: "💸" },
      { href: "/dashboard/reports", label: "Financial Reports & P&L", icon: "📋" },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/dashboard/settings", label: "Store Settings", icon: "⚙️" },
    ],
  },
];

const roleBadges: Record<string, { label: string; color: string; desc: string }> = {
  OWNER: { label: "Owner", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", desc: "Full Restaurant Access" },
  MANAGER: { label: "Manager", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", desc: "Operations & ERP Access" },
  CASHIER: { label: "Cashier", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", desc: "POS & Billing Access" },
  KITCHEN: { label: "Chef / Kitchen", color: "bg-rose-500/20 text-rose-400 border-rose-500/30", desc: "Kitchen Orders & Stock" },
  WAITER: { label: "Waiter", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", desc: "Tables & Order Taking" },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { restaurant, role } = await getRestaurantContext();

  const roleType = role as RoleType;
  const filteredSections = allSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => hasRoleAccess(roleType, item.href)),
    }))
    .filter((sec) => sec.items.length > 0);

  const roleMeta = roleBadges[role] || {
    label: role,
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    desc: "Staff",
  };

  return (
    <DashboardShellClient
      restaurant={restaurant}
      role={role}
      roleMeta={roleMeta}
      sections={filteredSections}
    >
      {children}
    </DashboardShellClient>
  );
}
