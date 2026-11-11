"use client";

import React, { useMemo, useState, useTransition } from "react";
import { Lang, pick, money } from "@/lib/i18n";
import { submitCustomerOrder } from "@/app/menu/[slug]/actions";
import { useGlobalThemeLang } from "@/context/ThemeLangContext";
import { ThemeLanguageToggle } from "@/components/ThemeLanguageToggle";

type Product = {
  id: string;
  name: string;
  nameAm: string | null;
  description: string | null;
  descriptionAm: string | null;
  price: any;
  imageUrl: string | null;
  isAvailable: boolean;
  categoryId: string | null;
};

type Category = {
  id: string;
  name: string;
  nameAm: string | null;
};

type Table = {
  id: string;
  tableNumber: string;
  qrToken: string;
};

type CartItem = {
  product: Product;
  quantity: number;
  notes?: string;
};

const categoryEmojis: Record<string, string> = {
  Food: "🍲",
  Drinks: "🥤",
  Dessert: "🍰",
  Salads: "🥗",
  Appetizers: "🥟",
  Breakfast: "🍳",
  Pizza: "🍕",
  Coffee: "☕",
};

const words = {
  en: {
    greeting: "A good meal makes a good day.",
    intro: "Freshly prepared favourites, made just for you.",
    search: "Search food, drinks and more...",
    all: "Everything",
    menu: "Explore the menu",
    menuSub: "Find something delicious",
    available: "available",
    add: "Add to order",
    added: "Added",
    basket: "Your basket",
    items: "items",
    review: "Review order",
    empty: "No dishes found",
    emptySub: "Try another search or select a different category.",
    order: "Your order",
    cart: "Basket",
    preparing: "Preparing",
    completed: "Completed",
    name: "Your name",
    nameHint: "Name (optional)",
    phone: "Phone number",
    phoneHint: "Phone number (optional)",
    notes: "Kitchen notes",
    notesHint: "Any special requests? (optional)",
    total: "Total",
    place: "Send order to kitchen",
    sending: "Sending order...",
    guest: "Guest",
    sent: "Your order is in the kitchen",
    sentSub: "Our team is preparing your meal. Thank you!",
    orderNo: "Order number",
    done: "Enjoy your meal!",
    doneSub: "Thank you for choosing us.",
    emptyCart: "Your basket is empty",
    emptyCartSub: "Add a few favourites from our menu.",
    close: "Close",
    table: "Table",
    special: "OUR KITCHEN",
    discover: "Made fresh. Served with care.",
    browse: "Discover the flavours waiting for you.",
    language: "አማርኛ",
    remove: "Remove",
    itemsCount: "menu items",
    noImage: "Fresh & delicious",
  },
  am: {
    greeting: "ጥሩ ምግብ ጥሩ ቀን ይፈጥራል።",
    intro: "በጥንቃቄ እና በፍቅር የተዘጋጁ ምግቦች።",
    search: "ምግብ፣ መጠጥ ይፈልጉ...",
    all: "ሁሉም",
    menu: "ምናሌያችንን ይመልከቱ",
    menuSub: "የሚወዱትን ጣፋጭ ምግብ ይምረጡ",
    available: "ይገኛል",
    add: "ወደ ትዕዛዝ ጨምር",
    added: "ተጨምሯል",
    basket: "ቅርጫት",
    items: "እቃዎች",
    review: "ትዕዛዝ አረጋግጥ",
    empty: "ምግብ አልተገኘም",
    emptySub: "እባክዎ ሌላ ቃል ይፈልጉ ወይም ሌላ ምድብ ይምረጡ።",
    order: "ትዕዛዝዎ",
    cart: "ቅርጫት",
    preparing: "በዝግጅት ላይ",
    completed: "ተጠናቋል",
    name: "ስም",
    nameHint: "ስም (አማራጭ)",
    phone: "ስልክ ቁጥር",
    phoneHint: "ስልክ ቁጥር (አማራጭ)",
    notes: "ለኩሽና ማስታወሻ",
    notesHint: "ልዩ ፍላጎት ካለዎት ይጻፉ...",
    total: "ጠቅላላ",
    place: "ትዕዛዙን ወደ ኩሽና ላክ",
    sending: "ትዕዛዙ በመላክ ላይ...",
    guest: "እንግዳ",
    sent: "ትዕዛዝዎ ወደ ኩሽና ደርሷል",
    sentSub: "ትዕዛዝዎ እየተዘጋጀ ነው። እናመሰግናለን!",
    orderNo: "የትዕዛዝ ቁጥር",
    done: "መልካም ምግብ!",
    doneSub: "ስለመረጡን እናመሰግናለን።",
    emptyCart: "ቅርጫትዎ ባዶ ነው",
    emptyCartSub: "ከሜኑ የሚወዱትን ይጨምሩ።",
    close: "ዝጋ",
    table: "ጠረጴዛ",
    special: "የኩሽናችን ምርጫ",
    discover: "ትኩስ የተዘጋጀ፣ በፍቅር የቀረበ።",
    browse: "የሚወዱትን ጣዕም ይምረጡ።",
    language: "EN",
    remove: "አስወግድ",
    itemsCount: "የምግብ አይነቶች",
    noImage: "ትኩስ እና ጣፋጭ",
  },
};

export default function InteractiveMenu({
  restaurant,
  categories,
  products,
  tables,
  initialTableToken,
  lang: _initialLang,
}: {
  restaurant: {
    id: string;
    name: string;
    nameAm: string | null;
    slug: string;
    currency: string;
    description: string | null;
    logoUrl: string | null;
  };
  categories: Category[];
  products: Product[];
  tables: Table[];
  initialTableToken?: string;
  lang: Lang;
}) {
  const { theme, lang } = useGlobalThemeLang();
  const isDark = theme === "dark";

  const [selectedTableToken, setSelectedTableToken] = useState(
    initialTableToken || (tables.length > 0 ? tables[0].qrToken : "")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"cart" | "in_progress" | "done">("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [isPending, startTransition] = useTransition();

  const t = words[lang];
  const currentTable = tables.find((table) => table.qrToken === selectedTableToken);
  const tableDisplay = currentTable
    ? `${t.table} ${currentTable.tableNumber}`
    : lang === "am" ? "ጠረጴዛ አልተመረጠም" : "No table selected";

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return products.filter((product) => {
      if (!product.isAvailable) return false;
      const matchesCategory =
        selectedCategoryId === "all" || product.categoryId === selectedCategoryId;
      const matchesSearch =
        !query ||
        product.name.toLocaleLowerCase().includes(query) ||
        (product.nameAm || "").toLocaleLowerCase().includes(query) ||
        (product.description || "").toLocaleLowerCase().includes(query) ||
        (product.descriptionAm || "").toLocaleLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategoryId]);

  const cartItems = Object.values(cart);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const addToCart = (product: Product) => {
    setCart((previous) => ({
      ...previous,
      [product.id]: {
        product,
        quantity: (previous[product.id]?.quantity || 0) + 1,
        notes: previous[product.id]?.notes || "",
      },
    }));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((previous) => {
      const existing = previous[productId];
      if (!existing) return previous;
      const nextQuantity = existing.quantity + delta;
      if (nextQuantity <= 0) {
        const copy = { ...previous };
        delete copy[productId];
        return copy;
      }
      return {
        ...previous,
        [productId]: { ...existing, quantity: nextQuantity },
      };
    });
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0 || !selectedTableToken) return;
    setOrderError("");

    startTransition(async () => {
      try {
        const result = await submitCustomerOrder({
          restaurantSlug: restaurant.slug,
          tableToken: selectedTableToken,
          customerName: customerName.trim() || t.guest,
          customerPhone: customerPhone.trim(),
          notes: orderNotes.trim(),
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            notes: item.notes,
          })),
        });

        if (result.success && result.orderId) {
          setPlacedOrderNumber(result.orderNumber || result.orderId);
          setPlacedOrderId(result.orderId);
          setCart({});
          setActiveModalTab("in_progress");
        } else {
          setOrderError(
            lang === "am"
              ? "ትዕዛዙን መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
              : "We couldn't submit your order. Please try again."
          );
        }
      } catch {
        setOrderError(
          lang === "am"
            ? "የግንኙነት ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።"
            : "Something went wrong. Please check your connection and try again."
        );
      }
    });
  };

  return (
    <div
      className={`min-h-screen pb-32 transition-colors duration-200 ${
        isDark ? "bg-[#0b0f19] text-slate-100" : "bg-[#f8fafc] text-stone-900"
      }`}
    >
      {/* ─── TOP NAVIGATION HEADER ───────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
          isDark
            ? "border-[#1e2638] bg-[#0f1420]/95 text-white"
            : "border-slate-200 bg-white/95 text-stone-900 shadow-xs"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Restaurant Brand */}
          <div className="flex min-w-0 items-center gap-3">
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={`${restaurant.name} logo`}
                className="h-10 w-10 rounded-2xl border border-white/10 bg-white object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-lg font-black text-stone-950 shadow-md shadow-amber-500/20">
                {restaurant.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-sm font-black tracking-tight sm:text-base">
                {pick(lang, restaurant.name, restaurant.nameAm)}
              </h1>
              <p className={`text-[11px] font-semibold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                {lang === "am" ? "የደንበኛ ዲጂታል ሜኑ" : "DIGITAL RESTAURANT MENU"}
              </p>
            </div>
          </div>

          {/* Right Controls: Table Selector + Theme & Lang Toggle */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {currentTable && (
              <span
                className={`hidden rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex border ${
                  isDark
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                    : "border-amber-500/30 bg-amber-50 text-amber-800"
                }`}
              >
                ◉ {tableDisplay}
              </span>
            )}
            {tables.length > 0 && !initialTableToken && (
              <select
                aria-label="Select table"
                value={selectedTableToken}
                onChange={(event) => setSelectedTableToken(event.target.value)}
                className={`max-w-[110px] sm:max-w-none rounded-xl border px-2.5 py-1.5 text-xs font-semibold outline-none transition ${
                  isDark
                    ? "border-[#253047] bg-[#151c2c] text-white focus:border-amber-400"
                    : "border-slate-300 bg-white text-stone-800 focus:border-amber-600"
                }`}
              >
                {tables.map((table) => (
                  <option key={table.id} value={table.qrToken} className={isDark ? "bg-[#151c2c] text-white" : ""}>
                    {t.table} {table.tableNumber}
                  </option>
                ))}
              </select>
            )}

            {/* Universal Theme and Language Toggle Pill */}
            <ThemeLanguageToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <section
          className={`relative mt-5 overflow-hidden rounded-[2rem] shadow-xl sm:mt-8 border ${
            isDark ? "bg-[#151c2c] border-[#222d42]" : "bg-[#1f2937] border-slate-700 text-white"
          }`}
        >
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1800&auto=format&fit=crop&q=85"
              alt=""
              className="h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/90 to-transparent" />
          </div>
          <div className="relative grid min-h-[240px] items-center gap-6 px-6 py-8 sm:min-h-[290px] sm:px-10 lg:grid-cols-[1.2fr_.8fr] lg:px-12">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.2em] text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                {t.special}
              </span>
              <h2 className="mt-4 max-w-xl text-2xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl text-white">
                {restaurant.nameAm && lang === "am"
                  ? restaurant.nameAm
                  : t.discover}
              </h2>
              <p className="mt-3 max-w-lg text-xs leading-6 text-slate-300 sm:text-sm">
                {restaurant.description || t.greeting}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-300">
                <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">✦ {t.greeting}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">⌖ {tableDisplay}</span>
              </div>
            </div>
            <div className="hidden justify-end lg:flex">
              <div className="w-60 rounded-2xl border border-white/15 bg-white/10 p-2.5 shadow-2xl backdrop-blur-md">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1547592180-85f173990554?w=700&auto=format&fit=crop&q=85"
                    alt="Freshly prepared food"
                    className="h-44 w-full object-cover"
                  />
                </div>
                <p className="px-2 pb-1 pt-2.5 text-center text-xs font-bold tracking-wide text-white">
                  {t.intro}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Category Heading */}
        <section className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.24em] text-amber-500">
              {pick(lang, restaurant.name, restaurant.nameAm)}
            </p>
            <h2
              className={`mt-1 text-2xl font-black tracking-tight sm:text-3xl ${
                isDark ? "text-white" : "text-stone-900"
              }`}
            >
              {t.menu}
            </h2>
            <p className={`mt-1 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-stone-500"}`}>
              {t.menuSub}
            </p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t.search}
              className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-xs font-semibold outline-none transition ${
                isDark
                  ? "border-[#222d42] bg-[#151c2c] text-white placeholder:text-slate-500 focus:border-amber-400"
                  : "border-slate-200 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 shadow-xs"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Category Filters */}
        <nav
          aria-label="Menu categories"
          className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <button
            type="button"
            onClick={() => setSelectedCategoryId("all")}
            className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-extrabold transition ${
              selectedCategoryId === "all"
                ? "bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/20"
                : isDark
                ? "border border-[#222d42] bg-[#151c2c] text-slate-300 hover:border-amber-400/50"
                : "border border-slate-200 bg-white text-stone-600 hover:border-amber-400 shadow-xs"
            }`}
          >
            ✨ {t.all}
            <span className="ml-2 opacity-60">
              {products.filter((p) => p.isAvailable).length}
            </span>
          </button>
          {categories.map((category) => {
            const count = products.filter(
              (product) => product.isAvailable && product.categoryId === category.id
            ).length;
            const active = selectedCategoryId === category.id;
            return (
              <button
                type="button"
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-extrabold transition ${
                  active
                    ? "bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/20"
                    : isDark
                    ? "border border-[#222d42] bg-[#151c2c] text-slate-300 hover:border-amber-400/50"
                    : "border border-slate-200 bg-white text-stone-600 hover:border-amber-400 shadow-xs"
                }`}
              >
                <span className="mr-1.5">{categoryEmojis[category.name] || "🍽️"}</span>
                {pick(lang, category.name, category.nameAm)}
                <span className="ml-2 opacity-60">{count}</span>
              </button>
            );
          })}
        </nav>

        {/* Product Grid */}
        <section className="mt-6 pb-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3
                className={`text-lg font-black tracking-tight sm:text-xl ${
                  isDark ? "text-white" : "text-stone-900"
                }`}
              >
                {t.menu}
              </h3>
              <p className={`mt-0.5 text-xs ${isDark ? "text-slate-400" : "text-stone-500"}`}>
                {filteredProducts.length} {t.itemsCount}
              </p>
            </div>
            <span
              className={`hidden rounded-full px-3 py-1 text-[11px] font-bold sm:inline-flex border ${
                isDark
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              ✦ {t.intro}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div
              className={`rounded-3xl border border-dashed px-5 py-16 text-center ${
                isDark
                  ? "border-[#222d42] bg-[#151c2c] text-slate-300"
                  : "border-slate-300 bg-white text-stone-800"
              }`}
            >
              <div className="text-4xl">🍽️</div>
              <h4 className="mt-3 font-black text-base">{t.empty}</h4>
              <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-stone-500"}`}>
                {t.emptySub}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryId("all");
                }}
                className="mt-5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400"
              >
                {t.all}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const item = cart[product.id];
                const title = pick(lang, product.name, product.nameAm);
                const subtitle = lang === "en" ? product.nameAm : product.name;
                const description = pick(
                  lang,
                  product.description || "",
                  product.descriptionAm || ""
                );

                return (
                  <article
                    key={product.id}
                    className={`group flex min-w-0 gap-3.5 rounded-2xl border p-3.5 transition duration-200 ${
                      isDark
                        ? "bg-[#151c2c] border-[#222d42] hover:border-amber-500/40 text-slate-100"
                        : "bg-white border-slate-200 hover:border-amber-400 text-stone-900 shadow-xs"
                    }`}
                  >
                    {/* Dish Image */}
                    <div
                      className={`relative h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32 ${
                        isDark ? "bg-[#1c253b]" : "bg-stone-100"
                      }`}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-3xl">
                          🍲
                          <span className="text-[9px] font-bold opacity-60">
                            {t.noImage}
                          </span>
                        </div>
                      )}
                      <span
                        className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-black backdrop-blur border ${
                          isDark
                            ? "bg-[#0b0f19]/80 border-[#222d42] text-amber-300"
                            : "bg-white/90 border-slate-200 text-stone-800"
                        }`}
                      >
                        {categoryEmojis[
                          categories.find((c) => c.id === product.categoryId)?.name || ""
                        ] || "✦"}
                      </span>
                    </div>

                    {/* Dish Info */}
                    <div className="flex min-w-0 flex-1 flex-col py-0.5">
                      <div className="min-w-0">
                        <h4
                          className={`line-clamp-1 text-sm font-black ${
                            isDark ? "text-white" : "text-stone-900"
                          }`}
                        >
                          {title}
                        </h4>
                        {subtitle && subtitle !== title && (
                          <p className="mt-0.5 truncate text-[11px] font-semibold text-amber-500">
                            {subtitle}
                          </p>
                        )}
                        {description && (
                          <p
                            className={`mt-1 line-clamp-2 text-[11px] leading-relaxed ${
                              isDark ? "text-slate-400" : "text-stone-500"
                            }`}
                          >
                            {description}
                          </p>
                        )}
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
                        <span
                          className={`text-sm font-black ${
                            isDark ? "text-white" : "text-stone-900"
                          }`}
                        >
                          {money(product.price, restaurant.currency)}
                        </span>
                        {item ? (
                          <div
                            className={`flex items-center gap-2 rounded-full p-1 ${
                              isDark ? "bg-[#1c253b] border border-[#25324d]" : "bg-stone-900 text-white"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, -1)}
                              aria-label={`Remove one ${title}`}
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold transition ${
                                isDark
                                  ? "bg-[#25324d] text-white hover:bg-[#2e3e5e]"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }`}
                            >
                              −
                            </button>
                            <span className="w-4 text-center text-xs font-black text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              aria-label={`Add one ${title}`}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-stone-950 transition hover:bg-amber-300"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="rounded-full bg-amber-500 px-3.5 py-1.5 text-[11px] font-black text-stone-950 shadow-sm transition hover:bg-amber-400 active:scale-95"
                          >
                            + {t.add}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating Basket Summary */}
      {totalItemsCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:bottom-5 sm:px-4">
          <div
            className={`mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-md ${
              isDark
                ? "bg-[#151c2c]/95 border-[#222d42] text-white"
                : "bg-stone-900/95 border-stone-800 text-white"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-lg text-stone-950">
                🛍️
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#151c2c] bg-white px-1 text-[10px] font-black text-stone-900">
                  {totalItemsCount}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-200">
                  {t.basket} · {totalItemsCount} {t.items}
                </p>
                <p className="mt-0.5 text-sm font-black text-amber-400">
                  {money(totalCartPrice, restaurant.currency)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveModalTab("cart");
                setShowOrderModal(true);
              }}
              className="shrink-0 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-stone-950 transition hover:bg-amber-300 active:scale-95 sm:px-5"
            >
              {t.review} <span className="ml-1">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Order Modal / Bottom Sheet */}
      {showOrderModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowOrderModal(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            className={`flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] border sm:rounded-2xl shadow-2xl ${
              isDark
                ? "bg-[#151c2c] border-[#222d42] text-slate-100"
                : "bg-white border-slate-200 text-stone-900"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between px-5 py-4 border-b ${
                isDark
                  ? "bg-[#111622] border-[#1e2638] text-white"
                  : "bg-stone-900 border-stone-800 text-white"
              }`}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-400">
                  {tableDisplay}
                </p>
                <h3 id="order-modal-title" className="mt-0.5 text-base font-black">
                  {t.order}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                aria-label={t.close}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              className={`grid grid-cols-3 gap-1 border-b p-2 ${
                isDark ? "border-[#1e2638] bg-[#0c101a]" : "border-slate-200 bg-slate-50"
              }`}
            >
              {([
                ["cart", t.cart],
                ["in_progress", t.preparing],
                ["done", t.completed],
              ] as const).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveModalTab(key)}
                  className={`rounded-xl px-2 py-2 text-xs font-bold transition ${
                    activeModalTab === key
                      ? isDark
                        ? "bg-[#283556] text-white shadow-sm font-extrabold"
                        : "bg-amber-600 text-white shadow-sm font-extrabold"
                      : isDark
                      ? "text-slate-400 hover:bg-[#151c2c]"
                      : "text-stone-500 hover:bg-slate-200"
                  }`}
                >
                  {label}
                  {key === "cart" && totalItemsCount > 0 ? ` (${totalItemsCount})` : ""}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {activeModalTab === "cart" && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
                        🛍️
                      </div>
                      <h4 className="mt-3 font-black text-sm">{t.emptyCart}</h4>
                      <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-stone-500"}`}>
                        {t.emptyCartSub}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowOrderModal(false)}
                        className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950"
                      >
                        {t.close}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2.5">
                        {cartItems.map((item) => {
                          const title = pick(lang, item.product.name, item.product.nameAm);
                          return (
                            <div
                              key={item.product.id}
                              className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                                isDark
                                  ? "bg-[#1c253b] border-[#25324d]"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                                {item.product.imageUrl ? (
                                  <img
                                    src={item.product.imageUrl}
                                    alt={title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xl">
                                    🍲
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-black">{title}</p>
                                <p className="mt-0.5 text-xs font-bold text-amber-500">
                                  {money(
                                    Number(item.product.price) * item.quantity,
                                    restaurant.currency
                                  )}
                                </p>
                              </div>
                              <div
                                className={`flex items-center gap-2 rounded-full p-1 border ${
                                  isDark
                                    ? "bg-[#151c2c] border-[#222d42]"
                                    : "bg-white border-slate-200"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product.id, -1)}
                                  className="h-6 w-6 rounded-full font-bold text-xs hover:opacity-75"
                                >
                                  −
                                </button>
                                <span className="w-3 text-center text-xs font-black">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.product.id, 1)}
                                  className="h-6 w-6 rounded-full bg-amber-400 font-bold text-stone-950 text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Guest Details Form */}
                      <div
                        className={`space-y-3 rounded-xl border p-3.5 ${
                          isDark
                            ? "bg-[#1c253b] border-[#25324d]"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div>
                          <label
                            className={`mb-1 block text-[11px] font-bold ${
                              isDark ? "text-slate-300" : "text-stone-700"
                            }`}
                          >
                            {t.name}
                          </label>
                          <input
                            value={customerName}
                            onChange={(event) => setCustomerName(event.target.value)}
                            placeholder={t.nameHint}
                            className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition ${
                              isDark
                                ? "bg-[#151c2c] border-[#25324d] text-white focus:border-amber-400"
                                : "bg-white border-slate-200 text-stone-900 focus:border-amber-600"
                            }`}
                          />
                        </div>
                        <div>
                          <label
                            className={`mb-1 block text-[11px] font-bold ${
                              isDark ? "text-slate-300" : "text-stone-700"
                            }`}
                          >
                            {t.phone}
                          </label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(event) => setCustomerPhone(event.target.value)}
                            placeholder={t.phoneHint}
                            className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition ${
                              isDark
                                ? "bg-[#151c2c] border-[#25324d] text-white focus:border-amber-400"
                                : "bg-white border-slate-200 text-stone-900 focus:border-amber-600"
                            }`}
                          />
                        </div>
                        <div>
                          <label
                            className={`mb-1 block text-[11px] font-bold ${
                              isDark ? "text-slate-300" : "text-stone-700"
                            }`}
                          >
                            {t.notes}
                          </label>
                          <textarea
                            rows={2}
                            value={orderNotes}
                            onChange={(event) => setOrderNotes(event.target.value)}
                            placeholder={t.notesHint}
                            className={`w-full resize-none rounded-xl border px-3 py-2 text-xs outline-none transition ${
                              isDark
                                ? "bg-[#151c2c] border-[#25324d] text-white focus:border-amber-400"
                                : "bg-white border-slate-200 text-stone-900 focus:border-amber-600"
                            }`}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeModalTab === "in_progress" && (
                <div className="py-8 text-center space-y-4">
                  {/* Success icon */}
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
                    🍳
                  </div>

                  {/* Order confirmation */}
                  <div>
                    <h4 className="text-base font-black">{t.sent}</h4>
                    {placedOrderNumber && (
                      <p className="mt-1 text-xs font-bold text-amber-500">
                        {t.orderNo}: {placedOrderNumber}
                      </p>
                    )}
                    <p className={`mx-auto mt-2 max-w-sm text-xs leading-5 ${isDark ? "text-slate-400" : "text-stone-500"}`}>
                      {t.sentSub}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                      {t.preparing}
                    </span>
                  </div>

                  {/* Copy Order Status Link */}
                  {placedOrderId && (
                    <div className={`mx-auto max-w-xs rounded-2xl border p-4 space-y-3 ${
                      isDark ? "bg-[#1c253b] border-[#25324d]" : "bg-slate-50 border-slate-200"
                    }`}>
                      <p className={`text-[11px] font-bold uppercase tracking-wider ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}>
                        {lang === "am" ? "ትዕዛዝዎን ይከታተሉ" : "Track your order"}
                      </p>

                      {/* URL preview pill */}
                      <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-mono ${
                        isDark
                          ? "bg-[#151c2c] border-[#222d42] text-slate-300"
                          : "bg-white border-slate-200 text-slate-600"
                      }`}>
                        <span className="text-amber-500 flex-shrink-0">🔗</span>
                        <span className="truncate">/order/{placedOrderId.slice(0, 8)}…</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {/* Copy link button */}
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/order/${placedOrderId}`;
                            navigator.clipboard.writeText(url).then(() => {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2500);
                            });
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all duration-200 ${
                            copied
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                              : isDark
                              ? "bg-[#151c2c] border-[#222d42] text-slate-200 hover:bg-[#1c253b] hover:border-amber-500/40"
                              : "bg-white border-slate-200 text-slate-700 hover:border-amber-500"
                          }`}
                        >
                          <span>{copied ? "✓" : "📋"}</span>
                          <span>
                            {copied
                              ? (lang === "am" ? "ተቅድቷል!" : "Copied!")
                              : (lang === "am" ? "ሊንክ ቅዳ" : "Copy link")}
                          </span>
                        </button>

                        {/* View status button */}
                        <a
                          href={`/order/${placedOrderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                            isDark
                              ? "bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                              : "bg-amber-500 text-stone-950 hover:bg-amber-400"
                          }`}
                        >
                          <span>↗</span>
                          <span>{lang === "am" ? "ሁኔታ ይከታተሉ" : "View status"}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeModalTab === "done" && (
                <div className="py-10 text-center">
                  <div className="text-4xl">🎉</div>
                  <h4 className="mt-3 text-base font-black">{t.done}</h4>
                  <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-stone-500"}`}>
                    {t.doneSub}
                  </p>
                </div>
              )}

              {orderError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-400"
                >
                  {orderError}
                </p>
              )}
            </div>

            {/* Modal Footer (Checkout CTA) */}
            {activeModalTab === "cart" && cartItems.length > 0 && (
              <footer
                className={`border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${
                  isDark
                    ? "border-[#1e2638] bg-[#111622]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-stone-500"}`}>
                    {t.total}
                  </span>
                  <span className="text-lg font-black text-amber-400">
                    {money(totalCartPrice, restaurant.currency)}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isPending || !selectedTableToken}
                  onClick={handlePlaceOrder}
                  className="w-full rounded-xl bg-amber-500 px-4 py-3 text-xs font-black text-stone-950 shadow-md transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? t.sending : t.place}
                  {!isPending && <span className="ml-1.5">→</span>}
                </button>
              </footer>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
