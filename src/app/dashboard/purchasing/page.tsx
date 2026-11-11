import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { prisma } from "@/lib/prisma";
import { createSupplier, createPurchaseOrder, updatePurchaseOrderStatus } from "../erp/actions";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-700 border-stone-200",
  ORDERED: "bg-blue-50 text-blue-700 border-blue-200",
  RECEIVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export default async function PurchasingPage() {
  const { restaurant } = await getRestaurantContext();
  const rid = restaurant.id;

  const [suppliers, purchaseOrders, ingredients] = await Promise.all([
    prisma.supplier.findMany({ where: { restaurantId: rid, isActive: true }, orderBy: { name: "asc" } }),
    prisma.purchaseOrder.findMany({
      where: { restaurantId: rid },
      include: { supplier: true, items: { include: { ingredient: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ingredient.findMany({ where: { restaurantId: rid, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const openValue = purchaseOrders
    .filter((po) => ["DRAFT", "ORDERED"].includes(po.status))
    .reduce((s, po) => s + Number(po.total), 0);
  const receivedCount = purchaseOrders.filter((po) => po.status === "RECEIVED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Purchasing</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {purchaseOrders.length} orders · Open value: ETB {fmt(openValue)}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total POs", value: purchaseOrders.length, icon: "📋" },
          { label: "Open Value", value: `ETB ${fmt(openValue)}`, icon: "💰" },
          { label: "Received", value: receivedCount, icon: "✅" },
          { label: "Suppliers", value: suppliers.length, icon: "🏭" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{k.icon}</span>
              <p className="text-xs text-stone-500">{k.label}</p>
            </div>
            <p className="text-xl font-bold text-stone-900 truncate">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sidebar: Suppliers + New PO */}
        <div className="space-y-5">
          {/* Add Supplier */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-stone-800 mb-4">Add Supplier</h2>
            <form action={createSupplier} className="space-y-3">
              <input type="text" name="name" required placeholder="Supplier name *" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <input type="text" name="phone" placeholder="Phone" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <input type="email" name="email" placeholder="Email" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <input type="text" name="address" placeholder="Address" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <button type="submit" className="w-full rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                Add Supplier
              </button>
            </form>
          </div>

          {/* Supplier List */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-stone-800 mb-3">Suppliers ({suppliers.length})</h2>
            {suppliers.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No suppliers yet</p>
            ) : (
              <div className="space-y-2">
                {suppliers.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-stone-100 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-sm font-bold text-amber-700">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">{s.name}</p>
                      {s.phone && <p className="text-xs text-stone-400">{s.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New PO Form */}
          {suppliers.length > 0 && ingredients.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-stone-800 mb-4">Create Purchase Order</h2>
              <form action={createPurchaseOrder} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Supplier</label>
                  <select name="supplierId" required className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Expected Delivery</label>
                  <input type="date" name="deliveryDate" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div className="border-t border-stone-100 pt-3">
                  <p className="text-xs font-semibold text-stone-600 mb-2">Line Items</p>
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="rounded-xl bg-stone-50 p-3 space-y-2">
                        <p className="text-xs text-stone-500 font-medium">Item {i + 1}</p>
                        <select name={`ingredientId_${i}`} className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400">
                          <option value="">— Select ingredient —</option>
                          {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" name={`quantity_${i}`} step="0.01" min="0" placeholder="Qty" className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400" />
                          <input type="number" name={`unitCost_${i}`} step="0.01" min="0" placeholder="Cost (ETB)" className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <input type="text" name="notes" placeholder="Notes (optional)" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <button type="submit" className="w-full rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                  Create PO
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Purchase Orders Table */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-800">Purchase Orders</h2>
            </div>
            {purchaseOrders.length === 0 ? (
              <div className="py-20 text-center">
                <span className="text-5xl">🛒</span>
                <p className="mt-3 font-medium text-stone-500">No purchase orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {purchaseOrders.map((po) => (
                  <div key={po.id} className="p-5 hover:bg-stone-50/70 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-stone-900">{po.supplier.name}</h3>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[po.status]}`}>
                            {po.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Ordered: {new Date(po.orderDate).toLocaleDateString("en-ET")}
                          {po.deliveryDate && ` · Delivery: ${new Date(po.deliveryDate).toLocaleDateString("en-ET")}`}
                          {po.notes && ` · ${po.notes}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-stone-900">ETB {fmt(Number(po.total))}</p>
                        <p className="text-xs text-stone-400">{po.items.length} items</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="rounded-xl bg-stone-50 border border-stone-100 p-3 mb-3">
                      <div className="space-y-1">
                        {po.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <span className="text-stone-700">{item.ingredient.name}</span>
                            <span className="text-stone-500">{Number(item.quantity)} {item.ingredient.unit} × ETB {fmt(Number(item.unitCost))}</span>
                            <span className="font-semibold text-stone-900">ETB {fmt(Number(item.totalCost))}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Actions */}
                    {po.status !== "RECEIVED" && po.status !== "CANCELLED" && (
                      <div className="flex gap-2 flex-wrap">
                        {po.status === "DRAFT" && (
                          <form action={updatePurchaseOrderStatus}>
                            <input type="hidden" name="id" value={po.id} />
                            <input type="hidden" name="status" value="ORDERED" />
                            <button type="submit" className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
                              Mark as Ordered
                            </button>
                          </form>
                        )}
                        {po.status === "ORDERED" && (
                          <form action={updatePurchaseOrderStatus}>
                            <input type="hidden" name="id" value={po.id} />
                            <input type="hidden" name="status" value="RECEIVED" />
                            <button type="submit" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                              ✓ Mark Received (Auto-update Stock)
                            </button>
                          </form>
                        )}
                        <form action={updatePurchaseOrderStatus}>
                          <input type="hidden" name="id" value={po.id} />
                          <input type="hidden" name="status" value="CANCELLED" />
                          <button type="submit" className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
                            Cancel
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

