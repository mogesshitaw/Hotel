import { getSuperAdminContext } from "@/lib/auth/super-admin";
import { AdminShellClient } from "@/components/AdminShellClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getSuperAdminContext();

  return (
    <AdminShellClient admin={admin}>{children}</AdminShellClient>
  );
}
