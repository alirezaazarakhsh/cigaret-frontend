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
  ExternalLink,
  Plus,
  Tag,
  Boxes,
  TrendingUp,
  AlertCircle
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
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  holograms,
  onOpenCreate,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Stats Calculations
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => Boolean(p.isAvailable) && p.stockCartons > 0).length;
  const uniqueBrandsCount = new Set(products.map((p) => p.brand).filter(Boolean)).size;
  const activeCategoriesCount = categories.length;

  // Filtered List
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        product.category === selectedCategory ||
        (selectedCategory === 'cigarettes' && (!product.category || product.category === 'all'));

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchNameFa = (product.nameFa || '').toLowerCase().includes(q);
      const matchNameEn = (product.nameEn || '').toLowerCase().includes(q);
      const matchBrand = (product.brand || '').toLowerCase().includes(q);
      const matchOrigin = (product.origin || '').toLowerCase().includes(q);
      const matchBarcode = (product.barcode || '').includes(q);
      const matchHologram = (product.hologram || '').toLowerCase().includes(q);

      return matchNameFa || matchNameEn || matchBrand || matchOrigin || matchBarcode || matchHologram;
    });
  }, [products, selectedCategory, searchQuery]);

  const getCategoryName = (catId?: string) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : 'سیگارهای اورجینال';
  };

  return (
    <div className="space-y-6">
      {/* STATS OVERVIEW CARDS (Grid 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 font-bold truncate">کل محصولات ثبت شده</div>
            <div className="text-sm sm:text-base md:text-lg font-black text-slate-900 mt-0.5">
              {formatNumberFa(totalProducts)} <span className="text-xs font-normal text-slate-500">محصول</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 font-bold truncate">موجود در انبار جنت‌آباد</div>
            <div className="text-sm sm:text-base md:text-lg font-black text-emerald-600 mt-0.5">
              {formatNumberFa(inStockProducts)} <span className="text-xs font-normal text-slate-500">قلم کالا</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 font-bold truncate">تنوع برند و هولوگرام</div>
            <div className="text-sm sm:text-base md:text-lg font-black text-slate-900 mt-0.5">
              {formatNumberFa(uniqueBrandsCount)} <span className="text-xs font-normal text-slate-500">برند فعال</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 font-bold truncate">دسته‌بندی‌های فعال</div>
            <div className="text-sm sm:text-base md:text-lg font-black text-slate-900 mt-0.5">
              {formatNumberFa(activeCategoriesCount)} <span className="text-xs font-normal text-slate-500">دسته</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Box */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام محصول، برند، کشور مبدأ یا بارکد..."
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
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap ml-1 shrink-0">دسته‌بندی:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            همه محصولات
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS TABLE / LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800">هیچ محصولی با این مشخصات یافت نشد</h3>
              <p className="text-xs text-slate-500">
                می‌توانید فیلتر جستجو را پاک کنید یا محصول جدیدی به انبار اضافه نمایید.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCreate}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن محصول جدید</span>
            </button>
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
                    <th className="p-4">دسته‌بندی</th>
                    <th className="p-4">هولوگرام و اصالت</th>
                    <th className="p-4">موجودی انبار</th>
                    <th className="p-4">قیمت عمده کارتن</th>
                    <th className="p-4 text-center">وضعیت عرضه</th>
                    <th className="p-4 text-center w-28">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product, index) => (
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
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                          {getCategoryName(product.category)}
                        </span>
                      </td>

                      {/* Hologram */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 w-fit">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-bold whitespace-nowrap">
                            {product.hologram || 'اورجینال اروپایی'}
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
                            className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                            title="ویرایش مشخصات و نرخ کالا"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(product)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            title="حذف کالا از لیست انبار"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW CARDS */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredProducts.map((product) => (
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
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {getCategoryName(product.category)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {product.hologram || 'اورجینال'}
                        </span>
                      </div>
                    </div>
                  </div>

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
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ویرایش</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProduct(product)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
