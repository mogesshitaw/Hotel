import { prisma } from "@/lib/prisma";
import { createGatewayTransaction, markTransactionSuccess } from "../actions";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function GatewayPaymentsPage() {
  const transactions = await prisma.gatewayTransaction.findMany({
    orderBy: { createdAt: "desc" },
    include: { invoice: { include: { subscription: { include: { restaurant: true } } } } },
    take: 50,
  });

  const totalProcessed = transactions
    .filter((t) => t.status === "SUCCESS")
    .reduce((s, t) => s + Number(t.amount), 0);

  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="stocky-heading">Gateway Payments & Webhooks</h1>
        <p className="stocky-subheading">Telebirr, Chapa, and CBE Birr transaction ledger and webhook simulator</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="stocky-card p-4">
          <p className="text-xs opacity-60">Processed Volume (Success)</p>
          <p className="mt-1 text-2xl font-black text-emerald-400">ETB {fmt(totalProcessed)}</p>
        </div>
        <div className="stocky-card p-4">
          <p className="text-xs opacity-60">Pending Transactions</p>
          <p className="mt-1 text-2xl font-black text-amber-400">{pendingCount}</p>
        </div>
        <div className="stocky-card p-4">
          <p className="text-xs opacity-60">Supported Gateways</p>
          <p className="mt-1 text-base font-bold">Telebirr · CBE Birr · Chapa</p>
        </div>
      </div>

      {/* Simulator and Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="stocky-card p-5">
          <h2 className="font-bold text-sm mb-3">Simulate Gateway Transaction</h2>
          <form action={createGatewayTransaction} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Gateway Provider</label>
              <select name="provider" className="stocky-input text-xs">
                <option value="TELEBIRR">Telebirr</option>
                <option value="CHAPA">Chapa</option>
                <option value="CBE_BIRR">CBE Birr</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Amount (ETB) *</label>
              <input type="number" step="0.01" name="amount" required placeholder="0.00" className="stocky-input text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1">Phone</label>
              <input type="text" name="phone" placeholder="+251911..." className="stocky-input text-xs" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors">
              Dispatch Transaction
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 stocky-card overflow-hidden">
          <div className="px-5 py-4 border-b border-inherit">
            <h2 className="font-bold text-sm">Recent Transactions ({transactions.length})</h2>
          </div>
          <div className="divide-y divide-inherit">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex flex-wrap items-center justify-between gap-3 stocky-table-row">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{tx.provider}</span>
                    <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium bg-emerald-950/40 text-emerald-400 border-emerald-800">
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-xs opacity-60 mt-0.5">
                    Ref: <code>{tx.reference || tx.id.slice(0, 10)}</code>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-black">ETB {fmt(Number(tx.amount))}</span>
                  {tx.status === "PENDING" && (
                    <form action={markTransactionSuccess}>
                      <input type="hidden" name="id" value={tx.id} />
                      <button type="submit" className="rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-600">
                        Approve
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
