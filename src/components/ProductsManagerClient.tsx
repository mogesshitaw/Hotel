"use client";

import React, { useState, useTransition, useMemo, useRef } from "react";
import { useGlobalThemeLang } from "@/context/ThemeLangContext";
import { money } from "@/lib/i18n";

export interface ProductItem {
  id: string;
  name: string;
  nameAm: string | null;
  description: string | null;
  descriptionAm: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isActive: boolean;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    nameAm: string | null;
  } | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  nameAm: string | null;
  sortOrder: number;
}

interface ProductsManagerClientProps {
  products: ProductItem[];
  categories: CategoryItem[];
  currency: string;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  setStateAction: (formData: FormData) => Promise<void>;
}

export function ProductsManagerClient({
  products,
  categories,
  currency,
  createAction,
  updateAction,
  deleteAction,
  setStateAction,
}: ProductsManagerClientProps) {
  const { theme, lang } = useGlobalThemeLang();
  const isDark = theme === "dark";

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<"ALL" | "AVAILABLE" | "SOLD_OUT">("ALL");

  // Modal states
  const [viewingProduct, setViewingProduct] = useState<ProductItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Live image preview & mode (upload vs url)
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageMode, setEditImageMode] = useState<"upload" | "url">("upload");
  const [addImageUrl, setAddImageUrl] = useState("");
  const [addImageMode, setAddImageMode] = useState<"upload" | "url">("upload");

  // Uploading state & feedback
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editFileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  // Translations
  const t = {
    title: lang === "am" ? "የምግብ እና መጠጥ ዝርዝር" : "Product & Dish Catalog",
    subtitle: lang === "am" ? "ምግቦችን ያርትዑ፣ ዝርዝር ይመልከቱ፣ አዲስ ይጨምሩ ወይም ይሰርዙ" : "Manage your dishes, adjust prices, edit details or delete items.",
    addNew: lang === "am" ? "➕ አዲስ ምግብ / መጠጥ ጨምር" : "➕ Add New Dish / Drink",
    searchPlaceholder: lang === "am" ? "በስም ወይም መግለጫ ፈልግ..." : "Search by name or description...",
    allCats: lang === "am" ? "ሁሉም ክፍሎች" : "All Categories",
    allStatus: lang === "am" ? "ሁሉም ሁኔታዎች" : "All Status",
    onlyAvailable: lang === "am" ? "ዝግጁ የሆኑ ብቻ" : "Available Only",
    onlySoldOut: lang === "am" ? "ያለቁ ብቻ" : "Sold Out Only",
    totalItems: lang === "am" ? "አጠቃላይ ምግቦች" : "Total Items",
    availableCount: lang === "am" ? "ዝግጁ" : "Available",
    soldOutCount: lang === "am" ? "ያለቀ" : "Sold Out",
    noItems: lang === "am" ? "ምንም የተገኘ ምግብ የለም" : "No products found matching your search.",
    viewDetail: lang === "am" ? "ዝርዝር እይ" : "View Details",
    edit: lang === "am" ? "አርትዕ" : "Edit",
    delete: lang === "am" ? "ሰርዝ" : "Delete",
    available: lang === "am" ? "ዝግጁ" : "Available",
    soldOut: lang === "am" ? "አልቋል" : "Sold Out",
    active: lang === "am" ? "ገባሪ" : "Active",
    inactive: lang === "am" ? "የቦዘነ" : "Inactive",
    category: lang === "am" ? "ክፍል" : "Category",
    noCategory: lang === "am" ? "ክፍል አልተመረጠም" : "No category",
    price: lang === "am" ? "ዋጋ" : "Price",
    description: lang === "am" ? "መግለጫ" : "Description",
    close: lang === "am" ? "ዝጋ" : "Close",
    saveChanges: lang === "am" ? "ለውጦችን መዝግብ" : "Save Changes",
    cancel: lang === "am" ? "ሰርዝ / ተመለስ" : "Cancel",
    confirmDelete: lang === "am" ? "ምግቡን መሰረዝ እርግጠኛ ነዎት?" : "Are you sure you want to delete this product?",
    deleteWarning: lang === "am" ? "ይህ እርምጃ ምግቡን ከዲጂታል ሜኑ ላይ ሙሉ ለሙሉ ያስወግደዋል።" : "This will permanently remove the item from your digital QR menu.",
    confirmDeleteBtn: lang === "am" ? "አዎ፣ ሰርዝ" : "Yes, Delete Product",
    nameEn: lang === "am" ? "የምግብ ስም (እንግሊዝኛ)" : "Dish Name (English)",
    nameAm: lang === "am" ? "የምግብ ስም (አማርኛ)" : "Dish Name (Amharic)",
    descEn: lang === "am" ? "መግለጫ (እንግሊዝኛ)" : "Description (English)",
    descAm: lang === "am" ? "መግለጫ (አማርኛ)" : "Description (Amharic)",
    imageUrl: lang === "am" ? "የምስል አድራሻ (URL)" : "Image URL",
    preview: lang === "am" ? "የምስል ቅድመ-እይታ" : "Image Preview",
    // Image upload labels
    uploadTab: lang === "am" ? "ፎቶ ከስልክ / ኮምፒውተር ጫን" : "Upload from Device / Phone",
    urlTab: lang === "am" ? "የድረ-ገጽ ሊንክ (Web URL)" : "Web Image Link (URL)",
    choosePhoto: lang === "am" ? "📸 ፎቶ አንሳ ወይም ከስልክ ምረጥ" : "📸 Take Photo or Choose Image",
    uploading: lang === "am" ? "ምስል እየተጫነ ነው..." : "Uploading image...",
    uploadHelp: lang === "am" ? "ከስልክዎ ካሜራ ወይም ከኮምፒውተርዎ ፎቶ ይምረጡ (JPEG, PNG, WebP)" : "Select a photo from your phone camera or desktop file (JPEG, PNG, WebP)",
    changePhoto: lang === "am" ? "ፎቶ ቀይር" : "Change Photo",
    removePhoto: lang === "am" ? "አስወግድ" : "Remove",
  };

  // Upload handler for phone camera or desktop disk
  async function handleFileUpload(file: File, target: "edit" | "add") {
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      if (target === "edit") {
        setEditImageUrl(data.url);
      } else {
        setAddImageUrl(data.url);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  }

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== "ALL" && p.categoryId !== selectedCategory) {
        return false;
      }
      if (availabilityFilter === "AVAILABLE" && !p.isAvailable) {
        return false;
      }
      if (availabilityFilter === "SOLD_OUT" && p.isAvailable) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchEn = p.name.toLowerCase().includes(query);
        const matchAm = p.nameAm?.toLowerCase().includes(query) ?? false;
        const matchDesc = p.description?.toLowerCase().includes(query) ?? false;
        const matchDescAm = p.descriptionAm?.toLowerCase().includes(query) ?? false;
        return matchEn || matchAm || matchDesc || matchDescAm;
      }
      return true;
    });
  }, [products, selectedCategory, availabilityFilter, searchTerm]);

  // Statistics
  const totalCount = products.length;
  const availableCount = products.filter((p) => p.isAvailable).length;
  const soldOutCount = products.filter((p) => !p.isAvailable).length;

  const cardCls = isDark
    ? "bg-[#151c2c] border-[#222d42] text-slate-100"
    : "bg-white border-slate-200 text-slate-800";

  const subCardCls = isDark
    ? "bg-[#1c253b] border-[#25324d] text-slate-200"
    : "bg-slate-50 border-slate-200 text-slate-800";

  const inputCls = isDark
    ? "bg-[#101624] border-[#25324d] text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500/20";

  return (
    <div className="space-y-6">
      {/* ─── Page Header & Metric Badges ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {t.title}
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {t.subtitle}
          </p>
        </div>

        {/* Action Button & Stats Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${subCardCls}`}>
            <span className="text-amber-500 font-mono">{totalCount}</span>
            <span className="opacity-70">{t.totalItems}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{availableCount} {t.availableCount}</span>
          </div>

          <button
            onClick={() => {
              setAddImageUrl("");
              setAddImageMode("upload");
              setUploadError(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-4 py-2 text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>{t.addNew}</span>
          </button>
        </div>
      </div>

      {/* ─── Search & Category Filter Bar ──────────────────────────────────── */}
      <div className={`p-4 rounded-2xl border space-y-3 ${cardCls}`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full rounded-xl border pl-10 pr-4 py-2 text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${inputCls}`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Availability Filter Dropdown */}
          <div className="flex-shrink-0">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 ${inputCls}`}
            >
              <option value="ALL">{t.allStatus}</option>
              <option value="AVAILABLE">{t.onlyAvailable} ({availableCount})</option>
              <option value="SOLD_OUT">{t.onlySoldOut} ({soldOutCount})</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : isDark
                ? "bg-[#1c253b] text-slate-300 hover:bg-[#25324d] border border-[#25324d]"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            {t.allCats} ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter((p) => p.categoryId === c.id).length;
            const isSelected = selectedCategory === c.id;
            const catLabel = lang === "am" && c.nameAm ? c.nameAm : c.name;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : isDark
                    ? "bg-[#1c253b] text-slate-300 hover:bg-[#25324d] border border-[#25324d]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <span>{catLabel}</span>
                <span className="ml-1.5 opacity-65 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Product Catalog Grid ─────────────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <div className={`p-16 rounded-3xl border border-dashed text-center space-y-2 ${cardCls}`}>
          <div className="text-4xl">🍽️</div>
          <h3 className={`text-base font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            {t.noItems}
          </h3>
          <p className="text-xs text-slate-400">
            {searchTerm ? "Try searching for a different keyword or resetting filters." : "Click 'Add New Dish' to publish your first recipe."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => {
            const displayName = lang === "am" && p.nameAm ? p.nameAm : p.name;
            const secondaryName = lang === "am" ? p.name : p.nameAm;
            const categoryName = p.category
              ? (lang === "am" && p.category.nameAm ? p.category.nameAm : p.category.name)
              : t.noCategory;

            return (
              <div
                key={p.id}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-lg ${
                  isDark
                    ? "bg-[#151c2c] border-[#222d42] hover:border-[#2e3e5c]"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div>
                  {/* Image with overlay badge */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900/40">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-amber-500/10 text-4xl">
                        🍲
                      </div>
                    )}

                    {/* Category pill */}
                    <span className="absolute top-2.5 left-2.5 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/10">
                      {categoryName}
                    </span>

                    {/* Availability Status pill */}
                    <span
                      className={`absolute top-2.5 right-2.5 rounded-lg px-2.5 py-1 text-[11px] font-bold backdrop-blur-md border ${
                        p.isAvailable
                          ? "bg-emerald-600/80 border-emerald-400/40 text-white"
                          : "bg-amber-600/80 border-amber-400/40 text-white"
                      }`}
                    >
                      {p.isAvailable ? t.available : t.soldOut}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className={`font-black text-sm line-clamp-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                        {displayName}
                      </h3>
                      {secondaryName && (
                        <p className="text-xs text-amber-500 font-semibold line-clamp-1">
                          {secondaryName}
                        </p>
                      )}
                    </div>

                    {(p.description || p.descriptionAm) && (
                      <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {lang === "am" && p.descriptionAm ? p.descriptionAm : (p.description || p.descriptionAm)}
                      </p>
                    )}

                    {/* Price Tag */}
                    <div className="pt-1 flex items-baseline justify-between">
                      <span className="text-base font-black text-amber-500">
                        {money(p.price, currency)}
                      </span>

                      {/* Quick Availability Switch form */}
                      <form action={setStateAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="field" value="isAvailable" />
                        <input type="hidden" name="value" value={String(!p.isAvailable)} />
                        <button
                          type="submit"
                          title="Toggle availability"
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                            p.isAvailable
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          }`}
                        >
                          {p.isAvailable ? `✓ ${t.available}` : `✕ ${t.soldOut}`}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer with Detail, Edit, and Delete */}
                <div className={`p-3 border-t flex items-center gap-1.5 ${isDark ? "border-[#1e2638] bg-[#111622]/60" : "border-slate-100 bg-slate-50/80"}`}>
                  {/* 👁️ View in Detail button */}
                  <button
                    onClick={() => setViewingProduct(p)}
                    className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-bold border transition-all cursor-pointer ${
                      isDark
                        ? "bg-[#1c253b] border-[#25324d] text-slate-200 hover:bg-[#25324d] hover:text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
                    }`}
                  >
                    <span>👁️</span>
                    <span className="truncate">{t.viewDetail}</span>
                  </button>

                  {/* ✏️ Edit button */}
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setEditImageUrl(p.imageUrl || "");
                      setEditImageMode(p.imageUrl?.startsWith("/uploads/") ? "upload" : "url");
                      setUploadError(null);
                    }}
                    className={`flex items-center justify-center gap-1 rounded-xl py-2 px-2.5 text-xs font-bold border transition-all cursor-pointer ${
                      isDark
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                        : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                    }`}
                    title={t.edit}
                  >
                    <span>✏️</span>
                    <span className="hidden sm:inline">{t.edit}</span>
                  </button>

                  {/* 🗑️ Delete button */}
                  <button
                    onClick={() => setDeletingProduct(p)}
                    className="flex items-center justify-center rounded-xl p-2 text-xs font-bold border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                    title={t.delete}
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 1. VIEW IN DETAIL MODAL ────────────────────────────────────────── */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className={`relative w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl ${cardCls}`}>
            {/* Header image banner */}
            <div className="relative h-60 w-full bg-slate-900">
              {viewingProduct.imageUrl ? (
                <img
                  src={viewingProduct.imageUrl}
                  alt={viewingProduct.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl">
                  🍲
                </div>
              )}
              {/* Close Button */}
              <button
                onClick={() => setViewingProduct(null)}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white font-black backdrop-blur-md border border-white/20 hover:bg-black transition-all cursor-pointer"
              >
                ✕
              </button>
              {/* Price Banner */}
              <div className="absolute bottom-3 left-4 rounded-xl bg-black/70 backdrop-blur-md px-3.5 py-1.5 border border-white/10">
                <span className="text-xl font-black text-amber-400">
                  {money(viewingProduct.price, currency)}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                    {viewingProduct.category ? viewingProduct.category.name : t.noCategory}
                  </span>
                  <span
                    className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
                      viewingProduct.isAvailable
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {viewingProduct.isAvailable ? t.available : t.soldOut}
                  </span>
                </div>
                <h2 className={`text-2xl font-black mt-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                  {viewingProduct.name}
                </h2>
                {viewingProduct.nameAm && (
                  <p className="text-base font-bold text-amber-500 mt-0.5">
                    {viewingProduct.nameAm}
                  </p>
                )}
              </div>

              {/* Descriptions */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${subCardCls}`}>
                {viewingProduct.description && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {t.descEn}
                    </span>
                    <p className="text-xs sm:text-sm mt-0.5 leading-relaxed">
                      {viewingProduct.description}
                    </p>
                  </div>
                )}
                {viewingProduct.descriptionAm && (
                  <div className="pt-1 border-t border-slate-700/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {t.descAm}
                    </span>
                    <p className="text-xs sm:text-sm mt-0.5 text-amber-400 leading-relaxed">
                      {viewingProduct.descriptionAm}
                    </p>
                  </div>
                )}
                {!viewingProduct.description && !viewingProduct.descriptionAm && (
                  <p className="text-xs text-slate-400 italic">No description provided yet.</p>
                )}
              </div>

              {/* Action Buttons inside Detail Modal */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setEditingProduct(viewingProduct);
                    setEditImageUrl(viewingProduct.imageUrl || "");
                    setEditImageMode(viewingProduct.imageUrl?.startsWith("/uploads/") ? "upload" : "url");
                    setUploadError(null);
                    setViewingProduct(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>✏️</span>
                  <span>{t.edit}</span>
                </button>
                <button
                  onClick={() => {
                    setDeletingProduct(viewingProduct);
                    setViewingProduct(null);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-4 py-2.5 text-xs transition-all cursor-pointer"
                >
                  <span>🗑️</span>
                  <span>{t.delete}</span>
                </button>
                <button
                  onClick={() => setViewingProduct(null)}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? "bg-[#1c253b] border-[#25324d] text-slate-300 hover:bg-[#25324d]"
                      : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. EDIT PRODUCT MODAL (Supports Device Upload & URL) ─────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className={`relative w-full max-w-xl rounded-3xl border overflow-hidden shadow-2xl my-8 ${cardCls}`}>
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-[#1e2638] bg-[#111622]" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-base">
                  ✏️
                </div>
                <div>
                  <h3 className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t.edit}: {editingProduct.name}
                  </h3>
                  <p className="text-xs text-slate-400">Update dish info, photo and price</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateAction(formData);
                setEditingProduct(null);
              }}
              className="p-6 space-y-4"
            >
              <input type="hidden" name="id" value={editingProduct.id} />
              {/* Actual submitted image URL */}
              <input type="hidden" name="imageUrl" value={editImageUrl} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">{t.nameEn} *</label>
                  <input
                    name="name"
                    defaultValue={editingProduct.name}
                    required
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">{t.nameAm}</label>
                  <input
                    name="nameAm"
                    defaultValue={editingProduct.nameAm ?? ""}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">{t.price} ({currency}) *</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingProduct.price}
                    required
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">{t.category}</label>
                  <select
                    name="categoryId"
                    defaultValue={editingProduct.categoryId ?? ""}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 ${inputCls}`}
                  >
                    <option value="">{t.noCategory}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.nameAm ? `(${c.nameAm})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ─── DUAL PHOTO UPLOADER (Local disk/phone camera OR Web URL) ─── */}
              <div className={`p-4 rounded-2xl border space-y-3 ${subCardCls}`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold opacity-90 flex items-center gap-1.5">
                    <span>🖼️</span>
                    <span>{t.preview}</span>
                  </label>
                  {/* Mode Selector Tabs */}
                  <div className="flex rounded-lg p-0.5 border border-slate-700/30 bg-black/20 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setEditImageMode("upload")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        editImageMode === "upload"
                          ? "bg-amber-500 text-stone-950 shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {t.uploadTab}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImageMode("url")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        editImageMode === "url"
                          ? "bg-amber-500 text-stone-950 shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {t.urlTab}
                    </button>
                  </div>
                </div>

                {/* Upload from Local Device / Phone */}
                {editImageMode === "upload" && (
                  <div className="space-y-2">
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "edit");
                      }}
                      className="hidden"
                    />

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => editFileInputRef.current?.click()}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed py-3 px-4 text-xs font-bold transition-all cursor-pointer ${
                          isDark
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                            : "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100"
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                            <span>{t.uploading}</span>
                          </>
                        ) : (
                          <>
                            <span>{t.choosePhoto}</span>
                          </>
                        )}
                      </button>

                      {editImageUrl && (
                        <div className="relative group">
                          <img
                            src={editImageUrl}
                            alt="Current"
                            className="h-12 w-12 rounded-xl object-cover border border-amber-500/40 flex-shrink-0"
                          />
                          <button
                            type="button"
                            onClick={() => setEditImageUrl("")}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center cursor-pointer"
                            title={t.removePhoto}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {t.uploadHelp}
                    </p>
                  </div>
                )}

                {/* Web URL Mode */}
                {editImageMode === "url" && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className={`flex-1 rounded-xl border px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 ${inputCls}`}
                    />
                    {editImageUrl && (
                      <img
                        src={editImageUrl}
                        alt="Preview"
                        className="h-9 w-9 rounded-xl object-cover border border-amber-500/30 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-rose-400 font-semibold">{uploadError}</p>
                )}
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">{t.descEn}</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct.description ?? ""}
                  rows={2}
                  className={`w-full rounded-xl border p-2.5 text-xs focus:outline-none focus:ring-2 ${inputCls}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">{t.descAm}</label>
                <textarea
                  name="descriptionAm"
                  defaultValue={editingProduct.descriptionAm ?? ""}
                  rows={2}
                  className={`w-full rounded-xl border p-2.5 text-xs focus:outline-none focus:ring-2 ${inputCls}`}
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/20">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    isDark
                      ? "bg-[#1c253b] border-[#25324d] text-slate-300 hover:bg-[#25324d]"
                      : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-5 py-2.5 text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 3. DELETE CONFIRMATION MODAL ──────────────────────────────────── */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className={`relative w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${cardCls}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-500 text-2xl mx-auto">
              🗑️
            </div>

            <div className="text-center space-y-1">
              <h3 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                {t.confirmDelete}
              </h3>
              <p className="text-xs text-amber-500 font-bold">
                "{deletingProduct.name}" {deletingProduct.nameAm ? `(${deletingProduct.nameAm})` : ""}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {t.deleteWarning}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? "bg-[#1c253b] border-[#25324d] text-slate-300 hover:bg-[#25324d]"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.cancel}
              </button>

              <form
                action={async (formData) => {
                  await deleteAction(formData);
                  setDeletingProduct(null);
                }}
                className="flex-1"
              >
                <input type="hidden" name="id" value={deletingProduct.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  {t.confirmDeleteBtn}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. ADD NEW DISH MODAL (Supports Device Upload & URL) ─────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className={`relative w-full max-w-xl rounded-3xl border overflow-hidden shadow-2xl my-8 ${cardCls}`}>
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-[#1e2638] bg-[#111622]" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-base">
                  ➕
                </div>
                <div>
                  <h3 className={`font-black text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t.addNew}
                  </h3>
                  <p className="text-xs text-slate-400">Publish a new dish or drink to your digital QR menu</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await createAction(formData);
                setShowAddModal(false);
              }}
              className="p-6 space-y-4"
            >
              {/* Actual submitted image URL */}
              <input type="hidden" name="imageUrl" value={addImageUrl} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">{t.nameEn} *</label>
                  <input
                    name="name"
                    placeholder="e.g. Special Tibs"
                    required
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">{t.nameAm}</label>
                  <input
                    name="nameAm"
                    placeholder="ለምሳሌ፡ ልዩ ጥብስ"
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">{t.price} ({currency}) *</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">{t.category}</label>
                  <select
                    name="categoryId"
                    defaultValue=""
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 ${inputCls}`}
                  >
                    <option value="">{t.noCategory}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.nameAm ? `(${c.nameAm})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ─── DUAL PHOTO UPLOADER (Local device/phone camera OR Web URL) ─── */}
              <div className={`p-4 rounded-2xl border space-y-3 ${subCardCls}`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold opacity-90 flex items-center gap-1.5">
                    <span>🖼️</span>
                    <span>{t.preview}</span>
                  </label>
                  {/* Mode Selector Tabs */}
                  <div className="flex rounded-lg p-0.5 border border-slate-700/30 bg-black/20 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setAddImageMode("upload")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        addImageMode === "upload"
                          ? "bg-amber-500 text-stone-950 shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {t.uploadTab}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddImageMode("url")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        addImageMode === "url"
                          ? "bg-amber-500 text-stone-950 shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {t.urlTab}
                    </button>
                  </div>
                </div>

                {/* Upload from Local Device / Phone */}
                {addImageMode === "upload" && (
                  <div className="space-y-2">
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "add");
                      }}
                      className="hidden"
                    />

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => addFileInputRef.current?.click()}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed py-3 px-4 text-xs font-bold transition-all cursor-pointer ${
                          isDark
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                            : "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100"
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                            <span>{t.uploading}</span>
                          </>
                        ) : (
                          <>
                            <span>{t.choosePhoto}</span>
                          </>
                        )}
                      </button>

                      {addImageUrl && (
                        <div className="relative group">
                          <img
                            src={addImageUrl}
                            alt="Current"
                            className="h-12 w-12 rounded-xl object-cover border border-amber-500/40 flex-shrink-0"
                          />
                          <button
                            type="button"
                            onClick={() => setAddImageUrl("")}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center cursor-pointer"
                            title={t.removePhoto}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {t.uploadHelp}
                    </p>
                  </div>
                )}

                {/* Web URL Mode */}
                {addImageMode === "url" && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={addImageUrl}
                      onChange={(e) => setAddImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className={`flex-1 rounded-xl border px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 ${inputCls}`}
                    />
                    {addImageUrl && (
                      <img
                        src={addImageUrl}
                        alt="Preview"
                        className="h-9 w-9 rounded-xl object-cover border border-amber-500/30 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs text-rose-400 font-semibold">{uploadError}</p>
                )}
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">{t.descEn}</label>
                <textarea
                  name="description"
                  placeholder="Delicious dish description..."
                  rows={2}
                  className={`w-full rounded-xl border p-2.5 text-xs focus:outline-none focus:ring-2 ${inputCls}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">{t.descAm}</label>
                <textarea
                  name="descriptionAm"
                  placeholder="የምግቡ አጭር መግለጫ..."
                  rows={2}
                  className={`w-full rounded-xl border p-2.5 text-xs focus:outline-none focus:ring-2 ${inputCls}`}
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    isDark
                      ? "bg-[#1c253b] border-[#25324d] text-slate-300 hover:bg-[#25324d]"
                      : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-5 py-2.5 text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50"
                >
                  Publish to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
