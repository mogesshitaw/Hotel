import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const actionBadge: Record<string, string> = {
  CREATE: "bg-emerald-950/40 text-emerald-400 border-emerald-800",
  UPDATE: "bg-blue-950/40 text-blue-400 border-blue-800",
  DELETE: "bg-rose-950/40 text-rose-400 border-rose-800",
  PAYMENT: "bg-amber-950/40 text-amber-400 border-amber-800",
  SUBSCRIPTION_CHANGE: "bg-violet-950/40 text-violet-400 border-violet-800",
  LOGIN: "bg-slate-800/40 text-slate-300 border-slate-700",
  LOGOUT: "bg-slate-800/40 text-slate-400 border-slate-700",
};

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { restaurant: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="stocky-heading">Platform Audit Log & Security Trail</h1>
        <p className="stocky-subheading">Immutable event log for tenant configuration changes, subscriptions, and administrative operations</p>
      </div>

      <div className="stocky-card overflow-hidden">
        <div className="px-5 py-4 border-b border-inherit flex items-center justify-between">
          <h2 className="font-bold text-sm">Event Stream ({logs.length})</h2>
          <span className="text-xs opacity-50">Last 100 entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="stocky-table-head">
              <tr>
                <th className="px-5 py-3 text-left">Timestamp</th>
                <th className="px-5 py-3 text-left">Action</th>
                <th className="px-5 py-3 text-left">Entity</th>
                <th className="px-5 py-3 text-left">Tenant</th>
                <th className="px-5 py-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="stocky-table-row">
                  <td className="px-5 py-3 whitespace-nowrap opacity-60">
                    {new Date(log.createdAt).toLocaleString("en-ET")}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${actionBadge[log.action] || ""}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold whitespace-nowrap font-sans">
                    {log.entity}
                  </td>
                  <td className="px-5 py-3 font-sans whitespace-nowrap opacity-80">
                    {log.restaurant?.name || "Global / System"}
                  </td>
                  <td className="px-5 py-3 font-sans max-w-md truncate opacity-80">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
