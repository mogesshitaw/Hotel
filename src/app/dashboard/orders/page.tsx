import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { updateOrderStatus } from "../actions";
import { money } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardOrders() {
  const { restaurant } = await getRestaurantContext();

  const orders = await prisma.order.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      items: true,
      table: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const preparingCount = orders.filter((o) =>
    ["ACCEPTED", "PREPARING"].includes(o.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Live Restaurant Orders
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
            Kitchen &amp; Waiter queue. Manage incoming customer tickets in real time.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/40">
            {pendingCount} Pending
          </span>
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40">
            {preparingCount} in Prep
          </span>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-12 text-center text-stone-400 dark:text-slate-500">
          <p className="text-base font-bold text-stone-600 dark:text-slate-300">No orders yet</p>
          <p className="text-xs mt-1">
            Scan a table QR code or order from the menu to test incoming tickets.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((o) => {
            const isPending = o.status === "PENDING";
            const isAccepted = o.status === "ACCEPTED";
            const isPreparing = o.status === "PREPARING";
            const isReady = o.status === "READY";
            const isServed = o.status === "SERVED";
            const isCompleted = o.status === "COMPLETED";
            const isCancelled = o.status === "CANCELLED";

            return (
              <div
                key={o.id}
                className={`flex flex-col justify-between rounded-3xl border bg-white dark:bg-[#151c2c] p-5 shadow-xs transition hover:shadow-md ${
                  isPending
                    ? "border-amber-400/80 ring-2 ring-amber-400/20"
                    : "border-stone-200/80 dark:border-[#222d42]"
                }`}
              >
                <div>
                  {/* Top Bar: Order # and Table */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-stone-900 dark:text-white">
                          {o.orderNumber}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                            isPending
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                              : isPreparing || isAccepted
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                              : isReady
                              ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                              : isServed || isCompleted
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">
                        {new Date(o.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="rounded-xl bg-stone-100 dark:bg-[#1c253b] px-3 py-1 text-xs font-black text-stone-800 dark:text-slate-200 border border-stone-200 dark:border-[#25324d]">
                      {o.table ? `Table ${o.table.tableNumber}` : "Dine In"}
                    </div>
                  </div>

                  {/* Customer Info if provided */}
                  {(o.customerName || o.customerPhone) && (
                    <div className="mt-3 rounded-xl bg-stone-50 dark:bg-[#1c253b] p-2 text-xs text-stone-600 dark:text-slate-300 border border-stone-100 dark:border-[#25324d]">
                      <strong>Customer:</strong> {o.customerName || "Guest"}
                      {o.customerPhone && ` • ${o.customerPhone}`}
                    </div>
                  )}

                  {/* Items List */}
                  <div className="my-4 divide-y divide-stone-100 dark:divide-[#1e2638] text-xs">
                    {o.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between py-1.5"
                      >
                        <div>
                          <span className="font-bold text-stone-900 dark:text-white">
                            {it.quantity}× {it.productName}
                          </span>
                          {it.notes && (
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                              &quot;{it.notes}&quot;
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-stone-700 dark:text-slate-300">
                          {money(it.totalPrice, restaurant.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {o.notes && (
                    <div className="mb-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 p-2 text-[11px] text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/30">
                      <strong>Instructions:</strong> {o.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="border-t border-stone-100 dark:border-[#1e2638] pt-3">
                  <div className="flex items-center justify-between text-sm font-black text-stone-900 dark:text-white mb-3">
                    <span>Total</span>
                    <span>{money(o.total, restaurant.currency)}</span>
                  </div>

                  {/* Status Progression Controls */}
                  <div className="flex flex-wrap gap-2">
                    {isPending && (
                      <form action={updateOrderStatus} className="flex-1">
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="status" value="ACCEPTED" />
                        <button className="w-full rounded-xl bg-stone-900 dark:bg-slate-700 py-2 text-xs font-bold text-white hover:bg-stone-800 dark:hover:bg-slate-600 transition">
                          Accept Order
                        </button>
                      </form>
                    )}

                    {isAccepted && (
                      <form action={updateOrderStatus} className="flex-1">
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="status" value="PREPARING" />
                        <button className="w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-500 transition">
                          Start Preparing
                        </button>
                      </form>
                    )}

                    {isPreparing && (
                      <form action={updateOrderStatus} className="flex-1">
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="status" value="READY" />
                        <button className="w-full rounded-xl bg-purple-600 py-2 text-xs font-bold text-white hover:bg-purple-500 transition">
                          Mark Ready
                        </button>
                      </form>
                    )}

                    {isReady && (
                      <form action={updateOrderStatus} className="flex-1">
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="status" value="SERVED" />
                        <button className="w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition">
                          Mark Served
                        </button>
                      </form>
                    )}

                    {isServed && (
                      <form action={updateOrderStatus} className="flex-1">
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <button className="w-full rounded-xl bg-stone-900 dark:bg-slate-700 py-2 text-xs font-bold text-white hover:bg-stone-800 dark:hover:bg-slate-600 transition">
                          Complete Order
                        </button>
                      </form>
                    )}

                    {!isCompleted && !isCancelled && (
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <button className="rounded-xl border border-rose-200 dark:border-rose-800/60 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                          ✕
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
