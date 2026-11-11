"use client";

import React from "react";
import Link from "next/link";
import { Lang, pick, money } from "@/lib/i18n";

type ProductItem = {
  id: string;
  name: string;
  nameAm: string | null;
  description: string | null;
  descriptionAm: string | null;
  price: unknown;
  imageUrl: string | null;
  isAvailable: boolean;
};

export function LangToggle({ base, lang }: { base: string; lang: Lang }) {
  return (
    <div className="inline-flex items-center rounded-full border border-stone-200 bg-white/95 p-1 shadow-xs">
      <Link
        href={`${base}?lang=en`}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
          lang === "en"
            ? "bg-stone-900 text-white shadow-xs"
            : "text-stone-600 hover:text-stone-900"
        }`}
      >
        <span>English</span>
      </Link>
      <Link
        href={`${base}?lang=am`}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
          lang === "am"
            ? "bg-stone-900 text-white shadow-xs"
            : "text-stone-600 hover:text-stone-900"
        }`}
      >
        <span>አማርኛ</span>
      </Link>
    </div>
  );
}

export function ProductList({
  products,
  lang,
  currency,
}: {
  products: ProductItem[];
  lang: Lang;
  currency: string;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-6 text-center text-stone-400">
        <p className="text-xs font-medium">
          {lang === "am" ? "በዚህ ምድብ ውስጥ ምንም ምግቦች የሉም" : "No items listed in this category"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs">
      {products.map((p) => {
        const title = pick(lang, p.name, p.nameAm);
        const altTitle = lang === "en" ? p.nameAm : p.name;
        const desc = pick(lang, p.description ?? "", p.descriptionAm);

        return (
          <div
            key={p.id}
            className={`flex items-center gap-3.5 p-3.5 transition-colors sm:p-4 hover:bg-stone-50/70 ${
              p.isAvailable ? "" : "opacity-50 bg-stone-50/40"
            }`}
          >
            {/* Dish Image - Circular / Rounded style like reference phone screen */}
            {p.imageUrl ? (
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-full border border-stone-200/80 bg-stone-100 shadow-xs">
                <img
                  src={p.imageUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {!p.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-900/60 text-[9px] font-bold uppercase text-white">
                    {lang === "am" ? "ተጠናቋል" : "Sold"}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center rounded-full border border-amber-200/60 bg-amber-50/70 text-2xl text-amber-700 shadow-xs">
                🍽️
              </div>
            )}

            {/* Dish Name & Description */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-tight">
                  {title}
                </h3>
                {altTitle && (
                  <span className="text-xs text-amber-800/80 font-medium">
                    · {altTitle}
                  </span>
                )}
              </div>

              {desc && (
                <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {desc}
                </p>
              )}

              {!p.isAvailable && (
                <span className="mt-1 inline-block text-[10px] font-bold text-rose-600">
                  {lang === "am" ? "ለጊዜው ተጠናቋል" : "Currently Unavailable"}
                </span>
              )}
            </div>

            {/* Price (Prominent like reference phone UI) */}
            <div className="text-right flex-shrink-0 pl-1">
              <span className="text-sm sm:text-base font-bold text-stone-900 tracking-tight whitespace-nowrap">
                {money(p.price, currency)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
