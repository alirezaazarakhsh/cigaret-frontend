import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Download, 
  ShoppingCart, 
  Clock, 
  ShieldCheck, 
  SlidersHorizontal,
  Package,
  Boxes,
  FileText,
  DollarSign,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { CigaretteProduct } from '../types';
import { formatToman, formatNumberFa } from '../utils/formatters';
import { generatePriceListPdf } from '../utils/pdfGenerator';
import { getProductRichOverride } from '../services/djangoApi';

interface LivePriceTableProps {
  products: CigaretteProduct[];
  onAddToCart: (product: CigaretteProduct, unit: 'carton' | 'box' | 'pack', quantity: number) => void;
  onSelectProduct: (product: CigaretteProduct) => void;
}

export const LivePriceTable: React.FC<LivePriceTableProps> = ({
  products,
  onAddToCart,
  onSelectProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  const brands = useMemo(() => {
    const list = Array.from(
      new Set(
        products
          .filter(p => !p.isPosOnly && p.category !== 'drinks_coffee')
          .map(p => p.brand)
      )
    );
    return ['all', ...list];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Exclude in-person POS items (coffee & soft drinks) from the online price list
      if (product.isPosOnly || product.category === 'drinks_coffee') return false;

      const matchSearch = 
        product.nameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.origin.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      return matchSearch && matchBrand;
    });
  }, [products, searchQuery, selectedBrand]);

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await generatePriceListPdf(filteredProducts, selectedBrand);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getQty = (productId: string) => selectedQuantities[productId] || 1;

  const setQty = (productId: string, val: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, val)
    }));
  };

  return (
    <section className="py-6 px-4 sm:px-6 max-w-[1600px] w-full mx-auto" id="live-price-section">
      <div>
        
        {/* Title & Actions */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs mb-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-black px-2.5 py-1 rounded-lg border border-blue-200 ">
                  <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  تابلوی نرخ لحظه‌ای پخش عمده دخانیات سرو
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  عرضه دست اول کارتن، باکس و پاکت انبار جنت‌آباد
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                استعلام قیمت و نرخ لحظه‌ای سیگار و تنباکو
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                مشاهده آنلاین آخرین نرخ‌های نقدی بازار (کارتن، باکس و پاکت) با قابلیت دانلود رسمی PDF نرخ‌نامه و ثبت در پیش‌فاکتور
              </p>
            </div>

            {/* Direct PDF Download Action Button */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                id="download-price-pdf-btn"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-black shadow-md shadow-blue-600/20 transition-all active:scale-95 whitespace-nowrap disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{isDownloadingPdf ? 'در حال ایجاد فایل PDF...' : 'دانلود PDF نرخ‌نامه دخانیات سرو'}</span>
              </button>
            </div>
          </div>

          {/* Search & Brand Filter Bar */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-100 ">
            <div className="sm:col-span-7 relative">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="جستجوی سیگار بر اساس نام، مارک، کشور سازنده (مارلبرو، وینستون، بهمن، سوبرانی، تیریا...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs focus:bg-white focus:border-blue-500 focus:outline-none transition-colors font-medium text-slate-800 "
              />
            </div>

            <div className="sm:col-span-5 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="all">همه برندها ({formatNumberFa(products.length)} کالا)</option>
                {brands.filter(b => b !== 'all').map(b => (
                  <option key={b} value={b}>برند {b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Table */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 ">
                <tr>
                  <th className="p-3.5 sm:p-4">کالا و برند</th>
                  <th className="p-3.5 sm:p-4 text-center">مشخصات و هولوگرام</th>
                  <th className="p-3.5 sm:p-4 text-left">نرخ کارتن عمده</th>
                  <th className="p-3.5 sm:p-4 text-left">نرخ هر باکس</th>
                  <th className="p-3.5 sm:p-4 text-left">نرخ هر پاکت</th>
                  <th className="p-3.5 sm:p-4 text-center">روند نرخ</th>
                  <th className="p-3.5 sm:p-4 text-center">ثبت در پیش‌فاکتور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 ">
                {filteredProducts.map(product => {
                  const qty = getQty(product.id);
                  const richOverride = getProductRichOverride(product.id);
                  const showCarton = (richOverride?.hasCarton ?? product.hasCarton) !== false && !(richOverride?.isBoxOnly ?? product.isBoxOnly);
                  const showBox = (richOverride?.hasBox ?? product.hasBox) !== false;
                  const showPack = Boolean(richOverride?.hasPack ?? product.hasPack);

                  const boxesPerCarton = product.boxesPerCarton || 50;
                  const packsPerBox = product.packsPerBox || 10;

                  const effectivePackPrice = (richOverride?.packPrice && Number(richOverride.packPrice) > 0)
                    ? Number(richOverride.packPrice)
                    : (product.packPrice && product.packPrice > 0
                        ? product.packPrice
                        : (product.boxPrice ? Math.round(product.boxPrice / packsPerBox) : 0));

                  const effectiveMoqCarton = Math.max(
                    0,
                    Number(product.moq) || 0,
                    Number((product as any).min_order_carton) || 0,
                    Number(richOverride?.moq) || 0
                  );
                  const effectiveMoqBox = Math.max(
                    0,
                    Number(product.moqBox) || 0,
                    Number((product as any).min_order_box) || 0,
                    Number(richOverride?.moqBox) || 0
                  );
                  const effectiveMoqPack = Math.max(
                    0,
                    Number(product.moqPack) || 0,
                    Number((product as any).min_order_pack) || 0,
                    Number(richOverride?.moqPack) || 0
                  );

                  const minCarton = Math.max(1, effectiveMoqCarton);
                  const minBox = Math.max(1, effectiveMoqBox);
                  const minPack = Math.max(1, effectiveMoqPack);

                  const canOrderCarton = qty >= minCarton;
                  const canOrderBox = qty >= minBox;
                  const canOrderPack = qty >= minPack;

                  return (
                    <tr 
                      key={product.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Product Name & Brand */}
                      <td className="p-3.5 sm:p-4">
                        <div 
                          onClick={() => onSelectProduct(product)}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <img 
                            src={product.image} 
                            alt={product.nameFa}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                          />
                          <div>
                            <div className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                              {product.nameFa}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                              {product.brand} - {product.origin}
                            </div>
                            {(product.excerpt || product.description) && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5 font-normal">
                                {(product.excerpt || product.description || '').replace(/<[^>]*>/g, ' ').trim()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="p-3.5 sm:p-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="text-[11px] font-bold text-slate-700 ">
                            {showCarton
                              ? `${formatNumberFa(boxesPerCarton)} باکس (${formatNumberFa(boxesPerCarton * packsPerBox)} پاکت)`
                              : showBox
                              ? `باکس (${formatNumberFa(packsPerBox)} پاکت)`
                              : 'فروش پاکتی'}
                          </span>
                          {product.hologram && product.hologram !== 'بدون هولوگرام' && product.hologram !== 'ندارد' && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              {product.hologram}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Carton Price */}
                      <td className="p-3.5 sm:p-4 text-left">
                        {showCarton && product.cartonPrice > 0 ? (
                          <>
                            <div className="font-black text-sm text-blue-700 ">
                              {formatToman(product.cartonPrice)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {effectiveMoqCarton > 0
                                ? `حداقل سفارش: ${formatNumberFa(effectiveMoqCarton)} کارتن`
                                : `کارتن ${formatNumberFa(boxesPerCarton)} باکسی`}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-slate-400 text-xs">—</div>
                            <div className="text-[10px] text-slate-400">فروش کارتنی ندارد</div>
                          </>
                        )}
                      </td>

                      {/* Box Price */}
                      <td className="p-3.5 sm:p-4 text-left">
                        {showBox && product.boxPrice > 0 ? (
                          <>
                            <div className="font-bold text-slate-800 ">
                              {formatToman(product.boxPrice)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {effectiveMoqBox > 0
                                ? `حداقل سفارش: ${formatNumberFa(effectiveMoqBox)} باکس`
                                : `باکس ${formatNumberFa(packsPerBox)} پاکتی`}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-slate-400 text-xs">—</div>
                            <div className="text-[10px] text-slate-400">فروش باکسی ندارد</div>
                          </>
                        )}
                      </td>

                      {/* Pack Price */}
                      <td className="p-3.5 sm:p-4 text-left">
                        {showPack && effectivePackPrice > 0 ? (
                          <>
                            <div className="font-black text-emerald-700">
                              {formatToman(effectivePackPrice)}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-medium">
                              {effectiveMoqPack > 0
                                ? `حداقل سفارش: ${formatNumberFa(effectiveMoqPack)} پاکت`
                                : 'فروش پاکتی فعال'}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-slate-400 text-xs">—</div>
                            <div className="text-[10px] text-slate-400">فروش پاکتی ندارد</div>
                          </>
                        )}
                      </td>

                      {/* Trend */}
                      <td className="p-3.5 sm:p-4 text-center">
                        {product.priceTrend === 'up' && (
                          <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg text-[10px] font-black">
                            <ArrowUpRight className="w-3 h-3" />
                            افزایشی
                          </span>
                        )}
                        {product.priceTrend === 'down' && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-[10px] font-black">
                            <ArrowDownRight className="w-3 h-3" />
                            کاهشی
                          </span>
                        )}
                        {product.priceTrend === 'stable' && (
                          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold">
                            <Minus className="w-3 h-3" />
                            ثابت
                          </span>
                        )}
                      </td>

                      {/* Add to Cart Actions */}
                      <td className="p-3.5 sm:p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => setQty(product.id, qty + 1)}
                              className="w-6 h-6 rounded bg-white text-slate-800 flex items-center justify-center font-bold text-xs hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                              title="افزایش"
                            >
                              +
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatNumberFa(qty)}
                              onChange={(e) => {
                                const en = e.target.value.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\D/g, '');
                                const parsed = parseInt(en, 10);
                                setQty(product.id, isNaN(parsed) || parsed < 1 ? 1 : parsed);
                              }}
                              className="w-8 text-center font-bold text-xs text-slate-800 bg-transparent focus:outline-none"
                              title="تعداد سفارش"
                            />
                            <button
                              type="button"
                              onClick={() => setQty(product.id, qty - 1)}
                              className="w-6 h-6 rounded bg-white text-slate-800 flex items-center justify-center font-bold text-xs hover:bg-slate-200 cursor-pointer"
                              title="کاهش"
                            >
                              -
                            </button>
                          </div>

                          {showCarton && (
                            <button
                              type="button"
                              disabled={!canOrderCarton}
                              onClick={() => {
                                if (!canOrderCarton) return;
                                onAddToCart(product, 'carton', qty);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-white font-black text-[11px] transition-all shadow-2xs flex items-center gap-1 ${
                                canOrderCarton
                                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                  : 'bg-blue-600 opacity-35 cursor-not-allowed'
                              }`}
                              title={
                                canOrderCarton
                                  ? 'افزودن کارتن به پیش‌فاکتور'
                                  : `حداقل سفارش کارتن ${formatNumberFa(minCarton)} عدد است`
                              }
                            >
                              <Package className="w-3 h-3" />
                              +کارتن
                            </button>
                          )}

                          {showBox && (
                            <button
                              type="button"
                              disabled={!canOrderBox}
                              onClick={() => {
                                if (!canOrderBox) return;
                                onAddToCart(product, 'box', qty);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-white font-black text-[11px] transition-all shadow-2xs flex items-center gap-1 ${
                                canOrderBox
                                  ? 'bg-slate-800 hover:bg-slate-900 cursor-pointer'
                                  : 'bg-slate-800 opacity-35 cursor-not-allowed'
                              }`}
                              title={
                                canOrderBox
                                  ? 'افزودن باکس به پیش‌فاکتور'
                                  : `حداقل سفارش باکس ${formatNumberFa(minBox)} عدد است`
                              }
                            >
                              <Boxes className="w-3 h-3" />
                              +باکس
                            </button>
                          )}

                          {showPack && (
                            <button
                              type="button"
                              disabled={!canOrderPack}
                              onClick={() => {
                                if (!canOrderPack) return;
                                onAddToCart(product, 'pack', qty);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-white font-black text-[11px] transition-all shadow-2xs flex items-center gap-1 ${
                                canOrderPack
                                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                                  : 'bg-emerald-600 opacity-35 cursor-not-allowed'
                              }`}
                              title={
                                canOrderPack
                                  ? 'افزودن پاکت به پیش‌فاکتور'
                                  : `حداقل سفارش پاکت ${formatNumberFa(minPack)} عدد است`
                              }
                            >
                              <ShoppingCart className="w-3 h-3" />
                              +پاکت
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
