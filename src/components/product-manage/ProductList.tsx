import React, { useState, useMemo } from 'react';
import {
  Package,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Search,
  X,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
  RefreshCw,
  Boxes,
  TrendingUp,
  AlertCircle,
  Filter,
  Check
} from 'lucide-react';
import { CigaretteProduct } from '../../types';
import { ProductCategoryItem, ProductHologramItem } from './types';
import { formatNumberFa, formatToman } from '../../utils/formatters';

interface ProductListProps {
  products: CigaretteProduct[];
  categories: ProductCategoryItem[];
  holograms: ProductHologramItem[];
  onOpenCreate: () => void;
  onEditProduct: (product: CigaretteProduct) => void;
  onDeleteProduct: (product: CigaretteProduct) => void;
  onRefreshFromDatabase?: () => void;
  isRefreshingProducts?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  holograms,
  onOpenCreate,
  onEditProduct,
  onDeleteProduct,
  onRefreshFromDatabase,
  isRefreshingProducts = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Robust matching helper to associate product with its real category from Django database
  const findCategory = (catValue?: any): ProductCategoryItem | undefined => {
    if (!catValue && catValue !== 0) return undefined;
    const str = String(catValue).trim().toLowerCase();
    return categories.find(c => 
      String(c.id).toLowerCase() === str ||
      String(c.slug || '').toLowerCase() === str ||
      c.name.trim().toLowerCase() === str ||
      (c.nameEn && c.nameEn.trim().toLowerCase() === str)
    );
  };

  const getCategoryName = (catValue?: any): string => {
    const found = findCategory(catValue);
    if (found) return found.name;
    if (catValue && catValue !== 'all') {
      return String(catValue);
    }
    return 'دسته‌بندی اصلی';
  };

  // High-level Overall Stats
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => Boolean(p.isAvailable) && (p.stockCartons > 0 || p.stockBoxes > 0)).length;
  const totalCartonsAll = products.reduce((acc, p) => acc + (Number(p.stockCartons) || 0), 0);
  const totalBoxesAll = products.reduce((acc, p) => acc + (Number(p.stockBoxes) || 0), 0);
  const uniqueBrandsCount = new Set(products.map((p) => p.brand).filter(Boolean)).size;

  // ============================================================
  // DATABASE-DRIVEN CATEGORY STATISTICS (آمار تفکیکی هر دسته‌بندی)
  // ============================================================
  const categoryStatsList = useMemo(() => {
    // 1. Process each real category defined in the database
    const list = categories.map((cat) => {
      // Products belonging to this category
      const catProducts = products.filter((p) => {
        const matched = findCategory(p.category);
        if (matched) return String(matched.id) === String(cat.id);
        return String(p.category) === String(cat.id) || String(p.category) === String(cat.slug);
      });

      const totalCount = catProducts.length;
      const inStockCount = catProducts.filter((p) => Boolean(p.isAvailable) && (p.stockCartons > 0 || p.stockBoxes > 0)).length;
      const totalCartons = catProducts.reduce((sum, p) => sum + (Number(p.stockCartons) || 0), 0);
      const totalBoxes = catProducts.reduce((sum, p) => sum + (Number(p.stockBoxes) || 0), 0);

      // Separate Hologram distribution inside this specific category
      const hologramCounts: Record<string, number> = {};
      catProducts.forEach((p) => {
        const holoName = p.hologram?.trim() || 'بدون هولوگرام';
        hologramCounts[holoName] = (hologramCounts[holoName] || 0) + 1;
      });

      return {
        id: cat.id,
        name: cat.name,
        nameEn: cat.nameEn,
        slug: cat.slug,
        color: cat.color || '#3B82F6',
        description: cat.description,
        totalCount,
        inStockCount,
        totalCartons,
        totalBoxes,
        hologramCounts,
      };
    });

    // 2. Also check if there are any products with an unmatched category ID
    const unmatchedProducts = products.filter((p) => !findCategory(p.category));
    if (unmatchedProducts.length > 0) {
      const totalCount = unmatchedProducts.length;
      const inStockCount = unmatchedProducts.filter((p) => Boolean(p.isAvailable) && (p.stockCartons > 0 || p.stockBoxes > 0)).length;
      const totalCartons = unmatchedProducts.reduce((sum, p) => sum + (Number(p.stockCartons) || 0), 0);
      const totalBoxes = unmatchedProducts.reduce((sum, p) => sum + (Number(p.stockBoxes) || 0), 0);
      const hologramCounts: Record<string, number> = {};
      unmatchedProducts.forEach((p) => {
        const holoName = p.hologram?.trim() || 'سایر';
        hologramCounts[holoName] = (hologramCounts[holoName] || 0) + 1;
      });

      list.push({
        id: 'unmatched',
        name: 'سایر / بدون دسته‌بندی مشخص',
        nameEn: 'Uncategorized',
        slug: 'uncategorized',
        color: '#64748B',
        description: 'کالاهای دارای شناسه دسته‌بندی ثبت‌نشده در پایگاه داده',
        totalCount,
        inStockCount,
        totalCartons,
        totalBoxes,
        hologramCounts,
      });
    }

    return list;
  }, [categories, products]);

  // Filtered List
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter check
      if (selectedCategory !== 'all') {
        const matched = findCategory(product.category);
        const matchesCategory = matched
          ? String(matched.id) === String(selectedCategory) || String(matched.slug) === String(selectedCategory)
          : String(product.category) === String(selectedCategory);
        if (!matchesCategory) return false;
      }

      // Search query check
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchNameFa = (product.nameFa || '').toLowerCase().includes(q);
      const matchNameEn = (product.nameEn || '').toLowerCase().includes(q);
      const matchBrand = (product.brand || '').toLowerCase().includes(q);
      const matchOrigin = (product.origin || '').toLowerCase().includes(q);
      const matchBarcode = (product.barcode || '').includes(q);
      const matchHologram = (product.hologram || '').toLowerCase().includes(q);
      const matchFeatures = (product.keyTakeaways || []).some(t => t.toLowerCase().includes(q));

      return matchNameFa || matchNameEn || matchBrand || matchOrigin || matchBarcode || matchHologram || matchFeatures;
    });
  }, [products, selectedCategory, searchQuery, categories]);

  return (
    <div className="space-y-6">
      {/* 1. TOP OVERVIEW SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold">کل محصولات در دیتابیس</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {formatNumberFa(totalProducts)} <span className="text-xs font-normal text-slate-500">کالا</span>
              </div>
            </div>
          </div>
          {onRefreshFromDatabase && (
            <button
              type="button"
              onClick={onRefreshFromDatabase}
              disabled={isRefreshingProducts}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
              title="بروزرسانی داده‌ها از دیتابیس"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingProducts ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}
        </div>

        {/* Ready In Stock */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">کالاهای موجود و آماده عرضه</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">
              {formatNumberFa(inStockProducts)} <span className="text-xs font-normal text-slate-500">کالا</span>
            </div>
          </div>
        </div>

        {/* Total Inventory Stock */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">کل موجودی فیزیکی انبار</div>
            <div className="text-base font-black text-slate-900 mt-0.5">
              <span>{formatNumberFa(totalCartonsAll)} کارتن</span>
              {totalBoxesAll > 0 && (
                <span className="text-xs text-purple-600 font-bold mr-1.5">({formatNumberFa(totalBoxesAll)} باکس)</span>
              )}
            </div>
          </div>
        </div>

        {/* Active Categories Count */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">دسته‌بندی‌های فعال دیتابیس</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {formatNumberFa(categories.length)} <span className="text-xs font-normal text-slate-500">دسته</span>
              {uniqueBrandsCount > 0 && (
                <span className="text-xs text-slate-400 font-normal mr-2">({formatNumberFa(uniqueBrandsCount)} برند)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DEDICATED SEPARATE CATEGORY STATISTICS SECTION             */}
      {/* ============================================================ */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              آمار تفکیکی هر دسته‌بندی (بر اساس دیتابیس)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            با کلیک روی هر کارت، کاتالوگ بلافاصله به آن دسته‌بندی فیلتر می‌شود
          </span>
        </div>

        {/* CATEGORY CARDS GRID */}
        {categoryStatsList.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            در حال بارگذاری دسته‌بندی‌ها از دیتابیس...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {categoryStatsList.map((catStat) => {
              const isSelected = selectedCategory === catStat.id;
              const hasProducts = catStat.totalCount > 0;
              const holoEntries = Object.entries(catStat.hologramCounts).filter(([_, count]) => count > 0);

              return (
                <div
                  key={catStat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : catStat.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  {/* Top Color Accent Line */}
                  <div
                    className="absolute top-0 right-0 left-0 h-1"
                    style={{ backgroundColor: catStat.color }}
                  />

                  {/* Header: Title and Item Count */}
                  <div>
                    <div className="flex items-start justify-between gap-2 pt-1 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: catStat.color }}
                          />
                          <span className="text-xs font-black text-slate-900 truncate">
                            {catStat.name}
                          </span>
                        </div>
                        {catStat.nameEn && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 dir-ltr text-right truncate">
                            {catStat.nameEn}
                          </div>
                        )}
                      </div>

                      {/* Badge count */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-black shrink-0 ${
                          hasProducts
                            ? 'bg-blue-100/70 text-blue-800 border border-blue-200/60'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {formatNumberFa(catStat.totalCount)} کالا
                      </span>
                    </div>

                    {/* Stock Counts */}
                    <div className="grid grid-cols-2 gap-2 bg-white/80 p-2 rounded-lg border border-slate-100 text-[11px] mb-2.5">
                      <div>
                        <span className="text-slate-400 block text-[10px]">موجودی کارتن:</span>
                        <strong className="text-slate-800 font-black">
                          {formatNumberFa(catStat.totalCartons)}
                        </strong>
                      </div>
                      <div className="text-left">
                        <span className="text-slate-400 block text-[10px]">آماده ارسال:</span>
                        <span className={`font-black ${catStat.inStockCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {formatNumberFa(catStat.inStockCount)} محصول
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hologram breakdown for THIS specific category */}
                  <div className="pt-1.5 border-t border-slate-200/60">
                    <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-600" />
                      <span>تفکیک هولوگرام این دسته:</span>
                    </div>

                    {holoEntries.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">بدون محصول ثبت‌شده در دیتابیس</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {holoEntries.map(([holoName, count]) => (
                          <span
                            key={holoName}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-bold"
                          >
                            <span>{holoName}:</span>
                            <span className="font-black">{formatNumberFa(count)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active selection footer indicator */}
                  {isSelected && (
                    <div className="mt-2.5 pt-1.5 border-t border-blue-200/60 flex items-center justify-between text-[10px] font-black text-blue-700">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-blue-600" />
                        <span>دسته انتخاب‌شده در جدول</span>
                      </span>
                      <span className="text-[9px] underline">لغو فیلتر</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Box */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام محصول، نقاط قوت، برند، کشور مبدأ یا بارکد..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-10 pl-8 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap ml-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>دسته‌بندی:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            همه محصولات ({formatNumberFa(totalProducts)})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => {
              const matched = findCategory(p.category);
              if (matched) return String(matched.id) === String(cat.id);
              return String(p.category) === String(cat.id) || String(p.category) === String(cat.slug);
            }).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: selectedCategory === cat.id ? '#FFFFFF' : cat.color || '#3B82F6' }}
                />
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75">({formatNumberFa(count)})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. PRODUCTS TABLE / LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800">هیچ محصولی در دیتابیس یافت نشد</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                محصولات فیک حذف شده‌اند. می‌توانید با زدن دکمه «افزودن محصول جدید»، کالای جدید را مستقیماً به دیتابیس جنگو ارسال کنید یا لیست را همگام‌سازی نمایید.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              {onRefreshFromDatabase && (
                <button
                  type="button"
                  onClick={onRefreshFromDatabase}
                  disabled={isRefreshingProducts}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingProducts ? 'animate-spin' : ''}`} />
                  <span>همگام‌سازی از دیتابیس</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenCreate}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن محصول جدید</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-black">
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4">تصویر شاخص و عنوان محصول</th>
                    <th className="p-4">دسته‌بندی دیتابیس</th>
                    <th className="p-4">نقاط قوت کالا (Key Features)</th>
                    <th className="p-4">هولوگرام و اصالت</th>
                    <th className="p-4">موجودی انبار</th>
                    <th className="p-4">قیمت عمده کارتن</th>
                    <th className="p-4 text-center">وضعیت عرضه</th>
                    <th className="p-4 text-center w-28">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product, index) => {
                    const categoryMatched = findCategory(product.category);
                    const keyFeatures = product.keyTakeaways || [];

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Index */}
                        <td className="p-4 text-center font-bold text-slate-400">{formatNumberFa(index + 1)}</td>

                        {/* Image & Title */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.nameFa}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-slate-900 text-xs line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {product.nameFa}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                                <span className="text-slate-400 dir-ltr text-left font-mono">{product.nameEn || product.brand}</span>
                                {product.origin && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-500">{product.origin}</span>
                                  </>
                                )}
                                {product.badge && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap inline-flex items-center gap-1.5"
                            style={{
                              backgroundColor: `${categoryMatched?.color || '#3B82F6'}15`,
                              borderColor: `${categoryMatched?.color || '#3B82F6'}40`,
                              color: categoryMatched?.color || '#1D4ED8',
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: categoryMatched?.color || '#3B82F6' }}
                            />
                            <span>{getCategoryName(product.category)}</span>
                          </span>
                        </td>

                        {/* Key Features (نقاط قوت کالا) */}
                        <td className="p-4">
                          {keyFeatures.length > 0 ? (
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{formatNumberFa(keyFeatures.length)} نقطه قوت ثبت‌شده</span>
                              </div>
                              <ul className="text-[10px] text-slate-600 space-y-0.5 max-w-[220px]">
                                {keyFeatures.slice(0, 2).map((takeaway, tIdx) => (
                                  <li key={tIdx} className="truncate list-disc list-inside">
                                    {takeaway}
                                  </li>
                                ))}
                                {keyFeatures.length > 2 && (
                                  <li className="text-[9px] text-emerald-600 font-bold">
                                    +{formatNumberFa(keyFeatures.length - 2)} مورد دیگر...
                                  </li>
                                )}
                              </ul>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">فاقد نقطه قوت</span>
                          )}
                        </td>

                        {/* Hologram */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 w-fit">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-bold whitespace-nowrap">
                              {product.hologram || 'هولوگرام شرکتی'}
                            </span>
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800">
                              {product.stockCartons > 0 ? (
                                <>
                                  <span>{formatNumberFa(product.stockCartons)}</span>{' '}
                                  <span className="text-slate-500 text-[11px]">کارتن</span>
                                </>
                              ) : (
                                <span className="text-rose-600 font-bold text-xs">اتمام موجودی</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {formatNumberFa(product.boxesPerCarton || 50)} باکس / کارتن
                            </div>
                          </div>
                        </td>

                        {/* Carton Price */}
                        <td className="p-4">
                          <div className="font-black text-slate-900 text-xs">
                            {formatToman(product.cartonPrice)}
                          </div>
                          {product.boxPrice > 0 && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              باکس: {formatToman(product.boxPrice)}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          {product.isAvailable && product.stockCartons > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>موجود در انبار</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>ناموجود</span>
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onEditProduct(product)}
                              className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                              title="ویرایش مشخصات و نرخ کالا"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(product)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="حذف کالا از لیست انبار"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW CARDS */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const categoryMatched = findCategory(product.category);
                const keyFeatures = product.keyTakeaways || [];

                return (
                  <div key={product.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.nameFa} className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-900 text-xs leading-snug">{product.nameFa}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 dir-ltr text-left font-mono">
                          {product.nameEn || product.brand}
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1"
                            style={{
                              backgroundColor: `${categoryMatched?.color || '#3B82F6'}15`,
                              borderColor: `${categoryMatched?.color || '#3B82F6'}40`,
                              color: categoryMatched?.color || '#1D4ED8',
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: categoryMatched?.color || '#3B82F6' }}
                            />
                            <span>{getCategoryName(product.category)}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {product.hologram || 'اورجینال'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key Features (نقاط قوت کالا) on Mobile */}
                    {keyFeatures.length > 0 && (
                      <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 space-y-1 text-xs">
                        <div className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>نقاط قوت کالا ({formatNumberFa(keyFeatures.length)} ویژگی):</span>
                        </div>
                        <ul className="text-[11px] text-slate-700 space-y-0.5 pr-2">
                          {keyFeatures.map((point, pIdx) => (
                            <li key={pIdx} className="list-disc list-inside">
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">قیمت کارتن:</span>
                        <strong className="text-slate-900 font-black">{formatToman(product.cartonPrice)}</strong>
                      </div>
                      <div className="text-left">
                        <span className="text-slate-400 text-[10px] block">موجودی انبار:</span>
                        <span className="font-bold text-slate-800">{formatNumberFa(product.stockCartons)} کارتن</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onEditProduct(product)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>ویرایش</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(product)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
