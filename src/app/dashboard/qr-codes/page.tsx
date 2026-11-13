import QRCode from "qrcode";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { cardCls } from "@/components/ui";

export default async function QrCodes() {
  const { restaurant } = await getRestaurantContext();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const items = [
    {
      label: "English Menu",
      sublabel: "Default English interface",
      headerText: "SCAN FOR MENU",
      amharicText: "",
      flag: "🇬🇧",
      url: `${base}/menu/${restaurant.slug}?lang=en`,
      filename: `${restaurant.slug}-menu-en.png`,
    },
    {
      label: "የአማርኛ ሜኑ",
      sublabel: "Default Amharic interface",
      headerText: "SCAN FOR MENU",
      amharicText: "ሜኑ ለመመልከት ስካን ያድርጉ",
      flag: "🇪🇹",
      url: `${base}/menu/${restaurant.slug}?lang=am`,
      filename: `${restaurant.slug}-menu-am.png`,
    },
  ];

  const codes = await Promise.all(
    items.map(async (item) => ({
      ...item,
      png: await QRCode.toDataURL(item.url, {
        width: 700,
        margin: 2,
        color: {
          dark: "#1c1917",
          light: "#ffffff",
        },
      }),
    }))
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Table Tent Cards &amp; QR Codes
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
          Generate printable table tent cards (Level 1 reference style) for dining tables, acrylic stands, and bar counters.
        </p>
      </div>

      {/* Table Tent Previews */}
      <div className="grid gap-8 md:grid-cols-2">
        {codes.map((c) => (
          <div key={c.url} className="space-y-4">
            {/* The Physical Table Tent Mockup Card */}
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-3xl border-2 border-stone-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-8 text-center shadow-lg transition hover:shadow-xl">
              {/* Header */}
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-wider text-stone-900 dark:text-white uppercase">
                  {c.headerText}
                </h2>
                {c.amharicText && (
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {c.amharicText}
                  </p>
                )}
              </div>

              {/* Crisp Large QR Code */}
              <div className="my-6 flex justify-center">
                <div className="rounded-2xl border-4 border-stone-100 dark:border-[#1c253b] p-2 shadow-inner bg-white">
                  <img
                    src={c.png}
                    alt={`QR code for ${c.label}`}
                    className="h-56 w-56 object-contain"
                  />
                </div>
              </div>

              {/* Restaurant Branding on Card */}
              <div className="border-t border-stone-100 dark:border-[#1e2638] pt-4">
                <p className="text-sm font-bold text-stone-800 dark:text-slate-200 tracking-tight">
                  {restaurant.name}
                </p>
                {restaurant.nameAm && (
                  <p className="text-xs text-stone-500 dark:text-slate-400">{restaurant.nameAm}</p>
                )}
                <p className="text-[10px] text-stone-400 dark:text-slate-500 mt-1">
                  Point phone camera to scan • No app required
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mx-auto max-w-sm flex flex-wrap gap-2 justify-center">
              <a
                href={c.png}
                download={c.filename}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 dark:bg-slate-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-stone-800 dark:hover:bg-slate-600 transition"
              >
                <span>⬇️</span>
                <span>Download PNG ({c.flag})</span>
              </a>
              <a
                href={c.url}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-xl border border-stone-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-[#1c253b] transition"
              >
                <span>Open URL</span>
                <span className="text-stone-400">↗</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Guide & Printing Specs */}
      <div className={cardCls}>
        <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
          <span>📋</span>
          <span>Level 1 Production Printing Specifications</span>
        </h3>
        <div className="grid gap-3 text-xs text-stone-600 dark:text-slate-400 sm:grid-cols-3">
          <div className="rounded-xl bg-stone-50 dark:bg-[#1c253b] p-3 border border-stone-100 dark:border-[#25324d]">
            <strong className="text-stone-800 dark:text-slate-200">Table Tent Card (Triangle Fold):</strong> Standard dimensions 10cm × 15cm on 350gsm cardstock with center crease.
          </div>
          <div className="rounded-xl bg-stone-50 dark:bg-[#1c253b] p-3 border border-stone-100 dark:border-[#25324d]">
            <strong className="text-stone-800 dark:text-slate-200">Acrylic Table Stand:</strong> A6 portrait insert (105mm × 148mm) placed on each dining table.
          </div>
          <div className="rounded-xl bg-stone-50 dark:bg-[#1c253b] p-3 border border-stone-100 dark:border-[#25324d]">
            <strong className="text-stone-800 dark:text-slate-200">Bar Counter Sticker:</strong> 8cm × 8cm matte vinyl sticker placed at order points.
          </div>
        </div>
      </div>
    </div>
  );
}
