import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { updateOrderStatus } from "../actions";
import { money } from "@/lib/i18n";
import { cardCls } from "@/components/ui";

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
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Live Restaurant Orders
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Kitchen & Waiter queue. Manage incoming customer tickets in real time.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
            {pendingCount} Pending
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            {preparingCount} in Prep
          </span>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center text-stone-400">
          <p className="text-base font-bold text-stone-600">No orders yet</p>
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
                className={`flex flex-col justify-between rounded-3xl border bg-white p-5 shadow-xs transition hover:shadow-md ${
                  isPending
                    ? "border-amber-400/80 ring-2 ring-amber-400/20"
                    : "border-stone-200/80"
                }`}
              >
                <div>
                  {/* Top Bar: Order # and Table */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-stone-900">
                          {o.orderNumber}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                            isPending
                              ? "bg-amber-100 text-amber-800"
                              : isPreparing || isAccepted
                              ? "bg-blue-100 text-blue-800"
                              : isReady
                              ? "bg-purple-100 text-purple-800"
                              : isServed || isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {new Date(o.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="rounded-xl bg-stone-100 px-3 py-1 text-xs font-black text-stone-800 border border-stone-200">
                      {o.table ? `Table ${o.table.tableNumber}` : "Dine In"}
                    </div>
                  </div>

                  {/* Customer Info if provided */}
                  {(o.customerName || o.customerPhone) && (
                    <div className="mt-3 rounded-xl bg-stone-50 p-2 text-xs text-stone-600 border border-stone-100">
                      <strong>Customer:</strong> {o.customerName || "Guest"}
                      {o.customerPhone && ` • ${o.customerPhone}`}
                    </div>
                  )}

                  {/* Items List */}
                  <div className="my-4 divide-y divide-stone-100 text-xs">
                    {o.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between py-1.5"
                      >
                        <div>
                          <span className="font-bold text-stone-900">
                            {it.quantity}× {it.productName}
                          </span>
                          {it.notes && (
                            <p className="text-[10px] text-amber-700 italic">
                              "{it.notes}"
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-stone-700">
                          {money(it.totalPrice, restaurant.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {o.notes && (
                    <div className="mb-3 rounded-lg bg-amber-50/70 p-2 text-[11px] text-amber-900 border border-amber-200/60">
                      <strong>Instructions:</strong> {o.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="border-t border-stone-100 pt-3">
                  <div className="flex items-center justify-between text-sm font-black text-stone-900 mb-3">
                    <span>Total</span>
                    <span>{money(o.total, restaurant.currency)}</span>
                  </div>

                  {/* Status Progression Controls */}
                  <div className="flex flex-wrap gap-2">
                    {isPending && (
                      <form action={updateOrderStatus} className="flex-1">
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="status" value="ACCEPTED" />
                        <button className="w-full rounded-xl bg-stone-900 py-2 text-xs font-bold text-white hover:bg-stone-800 transition">
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
                        <button className="w-full rounded-xl bg-stone-900 py-2 text-xs font-bold text-white hover:bg-stone-800 transition">
                          Complete Order
                        </button>
                      </form>
                    )}

                    {!isCompleted && !isCancelled && (
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <button className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition">
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

