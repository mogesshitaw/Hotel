"use client";

import React, { useState, useTransition } from "react";
import { money } from "@/lib/i18n";
import { createPosOrder } from "@/app/dashboard/actions";
import { useGlobalThemeLang } from "@/context/ThemeLangContext";

type Product = {
  id: string;
  name: string;
  nameAm: string | null;
  price: any;
  imageUrl: string | null;
  categoryId: string | null;
};

type Category = {
  id: string;
  name: string;
};

type Table = {
  id: string;
  tableNumber: string;
};

type PosItem = {
  product: Product;
  quantity: number;
  notes?: string;
};

const posDict = {
  en: {
    search: "Search dishes, drinks, or items...",
    all: "Show All",
    billing: "Billing & Checkout",
    posTerminal: "POS Register Terminal",
    items: "items",
    dineIn: "🍽️ Dine In",
    takeaway: "🥡 Take Away",
    assignTable: "Assign Table Location",
    tableNo: "Table No.",
    customerName: "Customer Name",
    phone: "Phone (optional)",
    emptyBill: "Select dishes on the left to add to bill.",
    subtotal: "Subtotal",
    discount: "Discount",
    grandTotal: "Grand Total",
    paymentMethod: "Payment Method",
    cash: "💵 Cash",
    telebirr: "📱 Telebirr",
    card: "💳 Card",
    sendKot: "📋 Send KOT to Kitchen",
    collectPay: "💳 Collect & Complete Order",
  },
  am: {
    search: "ምግብ፣ መጠጥ ወይም እቃ ይፈልጉ...",
    all: "ሁሉም",
    billing: "ሂሳብ እና ክፍያ",
    posTerminal: "የካሳ መመዝገቢያ ቴርሚናል",
    items: "እቃዎች",
    dineIn: "🍽️ እዚሁ የሚበላ",
    takeaway: "🥡 ይዞ ለመሄድ",
    assignTable: "ጠረጴዛ ይምረጡ",
    tableNo: "ጠረጴዛ ቁ.",
    customerName: "የደንበኛ ስም",
    phone: "ስልክ ቁጥር (አማራጭ)",
    emptyBill: "ወደ ሂሳብ ለመጨመር ከግራ በኩል ምግብ ይምረጡ።",
    subtotal: "ንዑስ ድምር",
    discount: "ቅናሽ",
    grandTotal: "ጠቅላላ ድምር",
    paymentMethod: "የክፍያ መንገድ",
    cash: "💵 ጥሬ ገንዘብ",
    telebirr: "📱 ቴሌብር",
    card: "💳 ካርድ",
    sendKot: "📋 ትዕዛዙን ወደ ኩሽና ላክ",
    collectPay: "💳 ክፍያ ተቀበልና አጠናቅ",
  },
};

export default function PosTerminal({
  restaurant,
  categories,
  products,
  tables,
}: {
  restaurant: { id: string; name: string; currency: string };
  categories: Category[];
  products: Product[];
  tables: Table[];
}) {
  const { theme, lang } = useGlobalThemeLang();
  const isDark = theme === "dark";
  const t = posDict[lang];

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
  const [selectedTableId, setSelectedTableId] = useState<string>(
    tables.length > 0 ? tables[0].id : ""
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TELEBIRR" | "CARD">("CASH");

  const [billItems, setBillItems] = useState<Record<string, PosItem>>({});
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameAm && p.nameAm.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const addItem = (product: Product) => {
    setBillItems((prev) => ({
      ...prev,
      [product.id]: {
        product,
        quantity: (prev[product.id]?.quantity || 0) + 1,
      },
    }));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setBillItems((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: { ...existing, quantity: newQty },
      };
    });
  };

  const removeItem = (productId: string) => {
    setBillItems((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const itemsList = Object.values(billItems);
  const subtotal = itemsList.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0
  );
  const total = Math.max(0, subtotal - discountAmount);

  const handleCheckout = (payNow: boolean) => {
    if (itemsList.length === 0) return;

    startTransition(async () => {
      const res = await createPosOrder({
        tableId: orderType === "DINE_IN" ? selectedTableId : undefined,
        customerName,
        customerPhone,
        type: orderType,
        discount: discountAmount,
        payNow,
        paymentMethod,
        items: itemsList.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          notes: i.notes,
        })),
      });

      if (res.success) {
        setBillItems({});
        setCustomerName("");
        setCustomerPhone("");
        setDiscountAmount(0);
        setNotification(
          payNow
            ? lang === "am"
              ? `ክፍያ ተጠናቋል! ትኬት ቁ. ${res.orderNumber}`
              : `Paid & Completed Ticket ${res.orderNumber}!`
            : lang === "am"
            ? `ትዕዛዝ ቁ. ${res.orderNumber} ወደ ኩሽና ተልኳል!`
            : `Order ${res.orderNumber} sent to Kitchen!`
        );
        setTimeout(() => setNotification(null), 4000);
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full min-w-0">
      {/* ─── LEFT: Product Catalog & Category Filters ─────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Search & Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className={`w-full rounded-2xl border py-2.5 pl-10 pr-4 text-xs font-semibold outline-none transition ${
                isDark
                  ? "border-[#222d42] bg-[#151c2c] text-white placeholder:text-slate-500 focus:border-amber-400"
                  : "border-slate-200 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-600 shadow-xs"
              }`}
            />
          </div>

          {/* Quick Notice */}
          {notification && (
            <div className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md animate-fade-in">
              ✓ {notification}
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-xs whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/20"
                : isDark
                ? "bg-[#151c2c] border border-[#222d42] text-slate-300 hover:border-amber-400/50"
                : "bg-white text-stone-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.all}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-xs whitespace-nowrap ${
                selectedCategory === c.id
                  ? "bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/20"
                  : isDark
                  ? "bg-[#151c2c] border border-[#222d42] text-slate-300 hover:border-amber-400/50"
                  : "bg-white text-stone-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((p) => {
            const inBill = billItems[p.id];
            return (
              <div
                key={p.id}
                onClick={() => addItem(p)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 transition cursor-pointer select-none ${
                  isDark
                    ? "bg-[#151c2c] border-[#222d42] hover:border-amber-500/50 text-slate-100"
                    : "bg-white border-slate-200 hover:border-amber-500 hover:shadow-md text-stone-900 shadow-xs"
                }`}
              >
                {/* Dish Photo */}
                <div
                  className={`relative h-28 w-full overflow-hidden rounded-xl mb-3 ${
                    isDark ? "bg-[#1c253b]" : "bg-stone-100"
                  }`}
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">
                      🍲
                    </div>
                  )}

                  {inBill && (
                    <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-stone-950 shadow-md">
                      {inBill.quantity}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  <h4
                    className={`font-bold text-xs sm:text-sm line-clamp-1 ${
                      isDark ? "text-white" : "text-stone-900"
                    }`}
                  >
                    {p.name}
                  </h4>
                  {p.nameAm && (
                    <p className="text-[11px] font-medium text-amber-500 line-clamp-1">
                      {p.nameAm}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`font-black text-xs sm:text-sm ${
                        isDark ? "text-white" : "text-stone-900"
                      }`}
                    >
                      {money(p.price, restaurant.currency)}
                    </span>
                    <button
                      className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold transition ${
                        isDark
                          ? "bg-[#1c253b] text-white group-hover:bg-amber-500 group-hover:text-stone-950"
                          : "bg-stone-900 text-white group-hover:bg-amber-600"
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── RIGHT: Order & Billing Summary Pane ─────────────────────────── */}
      <div className="w-full lg:w-96 flex-shrink-0 space-y-4">
        <div
          className={`rounded-2xl border p-5 shadow-sm space-y-4 ${
            isDark
              ? "bg-[#151c2c] border-[#222d42] text-slate-100"
              : "bg-white border-slate-200 text-stone-900"
          }`}
        >
          <div
            className={`flex items-center justify-between border-b pb-3 ${
              isDark ? "border-[#1e2638]" : "border-slate-100"
            }`}
          >
            <div>
              <h3 className={`font-black text-base ${isDark ? "text-white" : "text-stone-900"}`}>
                {t.billing}
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-stone-400"}`}>
                {t.posTerminal}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold border ${
                isDark
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              {itemsList.length} {t.items}
            </span>
          </div>

          {/* Dining Mode Toggle (Dine In vs Takeaway) */}
          <div
            className={`flex rounded-xl p-1 text-xs font-bold ${
              isDark ? "bg-[#1c253b] border border-[#25324d]" : "bg-slate-100"
            }`}
          >
            <button
              onClick={() => setOrderType("DINE_IN")}
              className={`flex-1 rounded-lg py-2 transition ${
                orderType === "DINE_IN"
                  ? isDark
                    ? "bg-[#283556] text-white shadow-xs font-black"
                    : "bg-stone-900 text-white shadow-xs"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-stone-600"
              }`}
            >
              {t.dineIn}
            </button>
            <button
              onClick={() => setOrderType("TAKEAWAY")}
              className={`flex-1 rounded-lg py-2 transition ${
                orderType === "TAKEAWAY"
                  ? isDark
                    ? "bg-[#283556] text-white shadow-xs font-black"
                    : "bg-stone-900 text-white shadow-xs"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-stone-600"
              }`}
            >
              {t.takeaway}
            </button>
          </div>

          {/* Table Selector & Customer Inputs */}
          <div className="space-y-2 text-xs">
            {orderType === "DINE_IN" && (
              <div>
                <label
                  className={`block text-[11px] font-bold mb-1 ${
                    isDark ? "text-slate-300" : "text-stone-600"
                  }`}
                >
                  {t.assignTable}
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${
                    isDark
                      ? "bg-[#1c253b] border-[#25324d] text-white focus:border-amber-400"
                      : "bg-white border-slate-200 text-stone-900 focus:border-amber-600"
                  }`}
                >
                  {tables.map((tbl) => (
                    <option key={tbl.id} value={tbl.id} className={isDark ? "bg-[#151c2c] text-white" : ""}>
                      {t.tableNo} {tbl.tableNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder={t.customerName}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                  isDark
                    ? "bg-[#1c253b] border-[#25324d] text-white placeholder:text-slate-500 focus:border-amber-400"
                    : "bg-white border-slate-200 text-stone-900 focus:border-amber-600"
                }`}
              />
              <input
                type="tel"
                placeholder={t.phone}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                  isDark
                    ? "bg-[#1c253b] border-[#25324d] text-white placeholder:text-slate-500 focus:border-amber-400"
                    : "bg-white border-slate-200 text-stone-900 focus:border-amber-600"
                }`}
              />
            </div>
          </div>

          {/* Items in Current Ticket */}
          <div
            className={`border-t pt-3 ${
              isDark ? "border-[#1e2638]" : "border-slate-100"
            }`}
          >
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {itemsList.length === 0 ? (
                <div
                  className={`py-8 text-center text-xs ${
                    isDark ? "text-slate-500" : "text-stone-400"
                  }`}
                >
                  {t.emptyBill}
                </div>
              ) : (
                itemsList.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between rounded-xl p-2 text-xs border ${
                      isDark
                        ? "bg-[#1c253b] border-[#25324d] text-slate-100"
                        : "bg-slate-50 border-slate-200 text-stone-900"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-bold truncate">{product.name}</div>
                      <div className="text-[11px] font-semibold text-amber-500">
                        {money(product.price, restaurant.currency)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-bold ${
                          isDark
                            ? "bg-[#151c2c] border-[#25324d] text-white hover:bg-[#202b40]"
                            : "bg-white border-slate-200 text-stone-800 hover:bg-slate-100"
                        }`}
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-stone-950 hover:bg-amber-400"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="ml-1 text-slate-400 hover:text-rose-500 font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Financial Totals Breakdown */}
          <div
            className={`border-t pt-3 space-y-1.5 text-xs ${
              isDark ? "border-[#1e2638] text-slate-300" : "border-slate-100 text-stone-600"
            }`}
          >
            <div className="flex justify-between">
              <span>{t.subtotal}</span>
              <span className="font-bold">{money(subtotal, restaurant.currency)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>{t.discount}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  className={`w-16 rounded-lg border px-1.5 py-0.5 text-right font-bold text-xs outline-none ${
                    isDark
                      ? "bg-[#1c253b] border-[#25324d] text-white"
                      : "bg-white border-slate-200 text-stone-900"
                  }`}
                />
                <span className="text-[10px]">{restaurant.currency}</span>
              </div>
            </div>

            <div
              className={`flex justify-between text-base font-black pt-2 border-t ${
                isDark
                  ? "border-[#1e2638] text-white"
                  : "border-slate-100 text-stone-900"
              }`}
            >
              <span>{t.grandTotal}</span>
              <span className="text-amber-500 font-black">
                {money(total, restaurant.currency)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector (Cash, Telebirr, Card) */}
          <div className="space-y-1.5 pt-2">
            <label
              className={`block text-[11px] font-bold ${
                isDark ? "text-slate-300" : "text-stone-600"
              }`}
            >
              {t.paymentMethod}
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`rounded-xl py-2 border transition ${
                  paymentMethod === "CASH"
                    ? isDark
                      ? "bg-[#283556] text-white border-[#384872]"
                      : "bg-stone-900 text-white border-stone-900"
                    : isDark
                    ? "bg-[#1c253b] text-slate-300 border-[#25324d]"
                    : "bg-white text-stone-700 border-slate-200"
                }`}
              >
                {t.cash}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("TELEBIRR")}
                className={`rounded-xl py-2 border transition ${
                  paymentMethod === "TELEBIRR"
                    ? "bg-amber-500 text-stone-950 font-black border-amber-400"
                    : isDark
                    ? "bg-[#1c253b] text-slate-300 border-[#25324d]"
                    : "bg-white text-stone-700 border-slate-200"
                }`}
              >
                {t.telebirr}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`rounded-xl py-2 border transition ${
                  paymentMethod === "CARD"
                    ? isDark
                      ? "bg-[#283556] text-white border-[#384872]"
                      : "bg-stone-900 text-white border-stone-900"
                    : isDark
                    ? "bg-[#1c253b] text-slate-300 border-[#25324d]"
                    : "bg-white text-stone-700 border-slate-200"
                }`}
              >
                {t.card}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              disabled={isPending || itemsList.length === 0}
              onClick={() => handleCheckout(false)}
              className={`w-full rounded-xl border py-2.5 text-xs font-black transition disabled:opacity-50 ${
                isDark
                  ? "border-[#25324d] bg-[#1c253b] text-white hover:bg-[#25324d]"
                  : "border-stone-900 bg-white text-stone-900 hover:bg-slate-50"
              }`}
            >
              {t.sendKot}
            </button>

            <button
              disabled={isPending || itemsList.length === 0}
              onClick={() => handleCheckout(true)}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-black text-stone-950 shadow-md transition hover:from-amber-400 hover:to-orange-400 disabled:opacity-50"
            >
              {t.collectPay} ({money(total, restaurant.currency)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
