import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Layers, 
  Package, 
  Sparkles, 
  TrendingUp, 
  Flame, 
  Zap, 
  ShieldCheck, 
  ChevronLeft, 
  ArrowLeft,
  Tag,
  CheckCircle2,
  Box,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';
import { CigaretteProduct, NavigationTab } from '../types';
import { formatToman, formatNumberFa } from '../utils/formatters';

interface ProductsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  products: CigaretteProduct[];
  onSelectCategory: (categoryId: string) => void;
  onSelectBrand: (brandName: string) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenInPersonPickup: () => void;
}

const CATEGORY_ITEMS = [
  {
    id: 'all',
    label: 'همه محصولات انبار',
    description: 'مشاهده تمامی سیگارها، باکس‌ها و ملزومات دخانی موجود',
    icon: Layers,
    color: 'from-blue-600 to-indigo-600',
    badge: 'تکمیل'
  },
  {
    id: 'cigarettes',
    label: 'سیگارهای پاکتی و کارتنی',
    description: 'مارلبرو، وینستون، اسه، کنت، سوبرانی، بهمن، مگنا و برندهای اورجینال',
    icon: Package,
    color: 'from-amber-500 to-orange-600',
    badge: 'پرفروش'
  },
  {
    id: 'iqos_terea',
    label: 'دستگاه و استیک IQOS / TEREA',
    description: 'دستگاه‌های ایلوما پرایم، وان و انواع استیک‌های تیریا با طعم‌های اصلی',
    icon: Zap,
    color: 'from-emerald-500 to-teal-600',
    badge: 'فناوری جدید'
  },
  {
    id: 'vape_pod',
    label: 'پاد، ویپ و سالت نیکوتین',
    description: 'پاد سیستم‌های گیک‌ویپ، سالت و جویس‌های نستی، دینرلیدی و مایع ویپ',
    icon: Flame,
    color: 'from-purple-500 to-indigo-600',
    badge: 'تنوع بالا'
  },
  {
    id: 'cigars_tobacco',
    label: 'سیگاربرگ و توتون دست‌پیچ',
    description: 'کاپیتان بلک، کوهیبا، توتون گلدن ویرجینیا، مک‌بارن و کاغذ سیگار',
    icon: Sparkles,
    color: 'from-rose-500 to-pink-600',
    badge: 'لاکچری'
  },
  {
    id: 'accessories',
    label: 'فندک، زیرسیگاری و اکسسوری',
    description: 'فندک‌های کلیپر، زیپو، فیلتر سیگار، جعبه چرمی و ابزار اسموکینگ',
    icon: Tag,
    color: 'from-slate-600 to-slate-800',
    badge: 'لوازم جانبی'
  },
  {
    id: 'drinks_coffee',
    label: 'بار نوشیدنی و قهوه انبار',
    description: 'دان قهوه عربیکا و روبوستا، اسپرسو و نوشیدنی‌های پذیرایی باجه',
    icon: Box,
    color: 'from-amber-700 to-yellow-800',
    badge: 'سرو باجه'
  }
];

export const ProductsMegaMenu: React.FC<ProductsMegaMenuProps> = ({
  isOpen,
  onClose,
  products,
  onSelectCategory,
  onSelectBrand,
  onNavigateTab,
  onOpenInPersonPickup,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');

  // Brands extracted from product list
  const brandsList = useMemo(() => {
    const brandMap: { [brand: string]: number } = {};
    products.forEach(p => {
      if (p.brand) {
        brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
      }
    });
    return Object.entries(brandMap).sort((a, b) => b[1] - a[1]);
  }, [products]);

  // Filtered products for quick preview inside menu
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return products.filter(p => 
      p.nameFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.origin && p.origin.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 8);
  }, [products, searchTerm]);

  // Featured fast-selling products
  const topSellers = useMemo(() => {
    return products.filter(p => p.badge === 'پرفروش' || p.stockCartons > 10).slice(0, 4);
  }, [products]);

  if (!isOpen) return null;

  const handleCategoryClick = (catId: string) => {
    onSelectCategory(catId);
    onNavigateTab('catalog');
    onClose();
  };

  const handleBrandClick = (brandName: string) => {
    onSelectBrand(brandName);
    onNavigateTab('catalog');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-4 sm:my-auto max-h-[92vh] flex flex-col"
        id="products-mega-menu"
      >
        
        {/* TOP HEADER & SEARCH BAR */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>منوی جامع محصولات و دسته‌بندی‌های دخانیات دخانیات سرو</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  مرجع استعلام نرخ روز کارتن، باکس، سیگارهای اصل و ثبت تحویل حضوری در باجه
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time Search Input inside Menu */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجوی سریع نام کالا، برند (مارلبرو، وینستون، تیریا، اسه...) یا کشور سازنده..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm rounded-2xl pr-10 pl-9 py-3 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* IN-PERSON PICKUP NOTICE BAR */}
        <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-blue-50 border-b border-amber-200/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-amber-950 font-black">
            <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
            <span>امکان ثبت سفارش حضوری از اپلیکیشن و تحویل فوری در باجه انبار دخانیات سرو (جنت‌آباد)</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenInPersonPickup();
            }}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-[11px] rounded-xl shadow-xs transition-all flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            <span>ثبت نوبت تحویل باجه</span>
          </button>
        </div>

        {/* MAIN BODY: CATEGORIES & BRANDS */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
          
          {/* SEARCH LIVE RESULTS (IF SEARCHING) */}
          {searchTerm.trim() !== '' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-slate-700">
                <span>نتایج جستجو برای «{searchTerm}»:</span>
                <span className="text-blue-600">{formatNumberFa(searchResults.length)} کالا یافت شد</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  کالایی با این عنوان در انبار یافت نشد. لطفاً عنوان دیگری جستجو نمایید.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onSelectCategory(product.category);
                        onNavigateTab('catalog');
                        onClose();
                      }}
                      className="group bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-2xl p-3 cursor-pointer transition-all flex items-center gap-3"
                    >
                      <img
                        src={product.image}
                        alt={product.nameFa}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-blue-700">
                          {product.nameFa}
                        </h4>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {formatToman(product.cartonPrice)} <span className="text-[9px] font-sans">کارتن</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                          موجودی: {formatNumberFa(product.stockCartons)} کارتن
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* SECTION 1: PRODUCT CATEGORIES GRID */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>دسته‌بندی‌های اصلی دخانیات و محصولات</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-bold">
                    انتخاب دسته‌بندی جهت فیلتر هوشمند
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CATEGORY_ITEMS.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-400 rounded-2xl p-4 cursor-pointer transition-all shadow-2xs hover:shadow-md flex items-start gap-3.5"
                      >
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {cat.label}
                            </h4>
                            <span className="text-[9px] font-black bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md border border-blue-200 shrink-0">
                              {cat.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: POPULAR BRANDS CLOUD */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span>برندهای معتبر و پرتقاضای بازار (انتخاب سریع)</span>
                  </h3>
                  <button
                    onClick={() => {
                      onSelectBrand('all');
                      onNavigateTab('catalog');
                      onClose();
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>مشاهده همه برندها</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {brandsList.map(([brandName, count]) => (
                    <button
                      key={brandName}
                      onClick={() => handleBrandClick(brandName)}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 text-slate-700 text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs group"
                    >
                      <span className="group-hover:text-white">{brandName}</span>
                      <span className="text-[10px] bg-slate-200/80 group-hover:bg-white/20 group-hover:text-white text-slate-600 px-1.5 py-0.2 rounded-full font-mono font-normal">
                        {formatNumberFa(count)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 3: TOP SELLERS CAROUSEL / QUICK PICKS */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>کارتن‌های پرفروش با تحویل فوری امروز</span>
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    موجودی کامل در انبار جنت‌آباد
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {topSellers.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectCategory(item.category);
                        onNavigateTab('catalog');
                        onClose();
                      }}
                      className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-2xl p-3 cursor-pointer transition-all shadow-2xs flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <img
                          src={item.image}
                          alt={item.nameFa}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-emerald-700">
                            {item.nameFa}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            برند: {item.brand}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[11px] text-slate-500 font-medium">نرخ کارتن:</span>
                        <span className="font-mono font-black text-blue-700">{formatToman(item.cartonPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              تمامی قیمت‌ها مصوب بنکداری و دست‌اول انبار مرکزی می‌باشد.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNavigateTab('live-prices');
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
            >
              جدول قیمت لحظه‌ای
            </button>
            <button
              onClick={() => {
                onNavigateTab('catalog');
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <span>مشاهده کامل کاتالوگ</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
