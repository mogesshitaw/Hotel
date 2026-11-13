import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { createTable, toggleTableStatus } from "../actions";
import { inputCls, btnCls, cardCls } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const { restaurant } = await getRestaurantContext();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const tables = await prisma.restaurantTable.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      orders: {
        where: {
          status: { in: ["PENDING", "ACCEPTED", "PREPARING", "READY", "SERVED"] },
        },
      },
    },
    orderBy: { tableNumber: "asc" },
  });

  const tablesWithQR = await Promise.all(
    tables.map(async (t) => {
      const url = `${base}/menu/${restaurant.slug}?table=${t.qrToken}`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: "#1c1917", light: "#ffffff" },
      });
      return {
        ...t,
        url,
        qrDataUrl,
        isOccupied: t.orders.length > 0,
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
          Tables &amp; Floor Plan Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
          Monitor table occupancy, generate individual table QR codes, and add new seating.
        </p>
      </div>

      {/* Add Table Form Card */}
      <div className={cardCls}>
        <h2 className="text-sm font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
          <span>➕</span>
          <span>Add New Dining Table</span>
        </h2>
        <form action={createTable} className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">
              Table Number or Label *
            </label>
            <input
              name="tableNumber"
              placeholder="e.g. 05 or Patio 2"
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 mb-1">
              Seating Capacity (Guests)
            </label>
            <input
              name="capacity"
              type="number"
              min="1"
              defaultValue="4"
              className={inputCls}
            />
          </div>
          <div className="flex items-end">
            <button className={`${btnCls} w-full`}>
              <span>Create Table &amp; QR</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tables Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white">
            Active Tables ({tables.length})
          </h2>
          <span className="text-xs text-stone-500 dark:text-slate-400">
            {tablesWithQR.filter((t) => t.isOccupied).length} Occupied
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tablesWithQR.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col justify-between rounded-3xl border bg-white dark:bg-[#151c2c] p-5 shadow-xs transition hover:shadow-md ${
                t.isOccupied
                  ? "border-amber-400 ring-2 ring-amber-400/20"
                  : "border-stone-200/80 dark:border-[#222d42]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🪑</span>
                    <div>
                      <h3 className="font-black text-stone-900 dark:text-white text-base">
                        Table {t.tableNumber}
                      </h3>
                      <p className="text-xs text-stone-400 dark:text-slate-500">
                        {t.capacity} Guests Capacity
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      t.isOccupied
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40"
                    }`}
                  >
                    {t.isOccupied ? "Occupied" : "Available"}
                  </span>
                </div>

                {/* Table QR Preview */}
                <div className="my-4 flex items-center justify-center rounded-2xl bg-stone-50 dark:bg-[#1c253b] p-3 border border-stone-100 dark:border-[#25324d]">
                  <img
                    src={t.qrDataUrl}
                    alt={`Table ${t.tableNumber} QR`}
                    className="h-32 w-32 object-contain"
                  />
                </div>

                <div className="space-y-1 text-center">
                  <div className="text-[11px] font-mono text-stone-500 dark:text-slate-500 truncate">
                    Token: {t.qrToken}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 dark:border-[#1e2638] pt-3">
                <a
                  href={t.qrDataUrl}
                  download={`table-${t.tableNumber}-qr.png`}
                  className="flex-1 rounded-xl bg-stone-900 dark:bg-slate-700 py-2 text-center text-xs font-bold text-white hover:bg-stone-800 dark:hover:bg-slate-600 transition"
                >
                  Download QR
                </a>
                <Link
                  href={`/menu/${restaurant.slug}?table=${t.qrToken}`}
                  target="_blank"
                  className="rounded-xl border border-stone-200 dark:border-[#25324d] bg-white dark:bg-[#1c253b] px-3 py-2 text-xs font-bold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-[#25324d] transition"
                >
                  Open ↗
                </Link>
                <form action={toggleTableStatus}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-xl border border-stone-200 dark:border-[#25324d] px-2.5 py-2 text-xs font-bold text-stone-400 dark:text-slate-500 hover:text-stone-800 dark:hover:text-white transition">
                    {t.isActive ? "Hide" : "Show"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
