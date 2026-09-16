import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Package, 
  TrendingDown, 
  Check, 
  Sparkles,
  Boxes,
  Flame,
  Wind,
  Zap,
  Plus,
  Minus,
  ShoppingCart,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { CigaretteProduct } from '../types';
import { formatToman, formatNumberFa, getApplicableDiscount } from '../utils/formatters';

interface ProductModalProps {
  product: CigaretteProduct | null;
  onClose: () => void;
  onAddToCart: (product: CigaretteProduct, unit: 'carton' | 'box', quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const moqCarton = (product?.moq !== undefined && product?.moq !== null) ? Number(product.moq) : 0;
  const moqBox = (product?.moqBox !== undefined && product?.moqBox !== null) ? Number(product.moqBox) : 0;

  const [cartonQty, setCartonQty] = useState<number>(() => {
    if (product?.hasCarton === false) return 0;
    return moqCarton > 0 ? moqCarton : 1;
  });
  const [boxQty, setBoxQty] = useState<number>(() => {
    if (product?.hasCarton === false) return moqBox > 0 ? moqBox : 1;
    return 0;
  });
  const [added, setAdded] = useState(false);
  const [moqError, setMoqError] = useState<string | null>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  if (!product) return null;

  const cartonTotalRaw = product.cartonPrice * cartonQty;
  const cartonDiscountPercent = getApplicableDiscount('carton', cartonQty, product.tierDiscounts);
  const cartonDiscountVal = (cartonTotalRaw * cartonDiscountPercent) / 100;
  const cartonTotalFinal = cartonTotalRaw - cartonDiscountVal;

  const boxTotalRaw = product.boxPrice * boxQty;
  const boxDiscountPercent = getApplicableDiscount('box', boxQty, product.tierDiscounts);
  const boxDiscountVal = (boxTotalRaw * boxDiscountPercent) / 100;
  const boxTotalFinal = boxTotalRaw - boxDiscountVal;

  const grandTotal = (cartonQty > 0 ? cartonTotalFinal : 0) + (boxQty > 0 ? boxTotalFinal : 0);

  const handleAdd = () => {
    setMoqError(null);
    if (cartonQty > 0 && moqCarton > 0 && cartonQty < moqCarton) {
      setMoqError(`حداقل سفارش کارتن برای این محصول ${formatNumberFa(moqCarton)} کارتن است.`);
      return;
    }
    if (boxQty > 0 && moqBox > 0 && boxQty < moqBox) {
      setMoqError(`حداقل سفارش باکس برای این محصول ${formatNumberFa(moqBox)} باکس است.`);
      return;
    }

    let hasAdded = false;
    if (cartonQty > 0) {
      onAddToCart(product, 'carton', cartonQty);
      hasAdded = true;
    }
    if (boxQty > 0) {
      onAddToCart(product, 'box', boxQty);
      hasAdded = true;
    }
    if (hasAdded) {
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 800);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 no-scrollbar overflow-hidden modal-overscroll-contain"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white [#0f172a] border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-overscroll-contain shadow-2xl p-5 sm:p-7 relative text-slate-900 my-auto"
        style={{ overscrollBehavior: 'contain' }}
        id="product-details-modal"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 shadow-sm cursor-pointer relative" onClick={() => setIsImageExpanded(true)}>
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={images[currentImageIndex]} 
                alt={product.nameFa} 
                className="w-full h-full object-cover" 
              />
            </AnimatePresence>
            {images.length > 1 && (
              <>
                <button className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/70 p-0.5 rounded-full" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => (i - 1 + images.length) % images.length); }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/70 p-0.5 rounded-full" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => (i + 1) % images.length); }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-blue-800 px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 ">
                {product.brand}
              </span>
              <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                مبدأ: {product.origin}
              </span>
              {product.hologram && product.hologram !== 'بدون هولوگرام' && product.hologram !== 'ندارد' && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {product.hologram}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight mt-2">
              {product.nameFa}
            </h2>
            <p className="text-xs text-slate-500 font-mono tracking-tight" dir="ltr">
              {product.nameEn}
            </p>
          </div>
        </div>

        {/* Full Rich Description */}
        <div className="mb-5 space-y-2 mt-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 ">
            <Sparkles className="w-5 h-5 text-blue-600 " />
            معرفی و مشخصات تخصصی کالا:
          </div>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 text-justify font-normal">
            {product.description}
          </p>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 text-xs">
           {product.brand && <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">برند:<br/><span className="font-bold text-slate-900">{product.brand}</span></div>}
           {product.origin && <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">کشور تولید کننده:<br/><span className="font-bold text-slate-900">{product.origin}</span></div>}
           {product.packSize && <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">سایز پاکت:<br/><span className="font-bold text-slate-900">{product.packSize}</span></div>}
           {product.flavor && <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">طعم و اسانس:<br/><span className="font-bold text-slate-900">{product.flavor}</span></div>}
           {product.filterType && <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">نوع فیلتر:<br/><span className="font-bold text-slate-900">{product.filterType}</span></div>}
           {product.packagingType && <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">نوع بسته بندی:<br/><span className="font-bold text-slate-900">{product.packagingType}</span></div>}
           {product.manufacturer && <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">شرکت سازنده:<br/><span className="font-bold text-slate-900">{product.manufacturer}</span></div>}
           <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">قطران (Tar):<br/><span className="font-bold text-slate-900">{product.tar}</span></div>
           <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">نیکوتین (Nicotine):<br/><span className="font-bold text-slate-900">{product.nicotine}</span></div>
           <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">تعداد در هر کارتن:<br/><span className="font-bold text-slate-900">{formatNumberFa(product.boxesPerCarton)}</span></div>

           {/* Any custom applied features */}
           {product.appliedFeatures && product.appliedFeatures
             .filter(af => !['feat-tar', 'feat-nicotine', 'feat-format', 'feat-flavor', 'feat-origin', 'feat-filter'].includes(af.id) && !['feat-tar', 'feat-nicotine', 'feat-format', 'feat-flavor', 'feat-origin', 'feat-filter'].includes(af.featureId || ''))
             .map((af) => (
               <div key={af.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                 {af.nameFa}:<br/>
                 <span className="font-bold text-slate-900">{af.value} {af.unit ? <span className="font-mono text-[11px] text-slate-600">[{af.unit}]</span> : null}</span>
               </div>
             ))
           }
        </div>

        {/* Discount Tier Table (Carton & Box) */}
        {product.tierDiscounts && product.tierDiscounts.length > 0 && (
          <div className="mb-5 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-1.5 text-xs font-bold text-slate-800 mb-2.5">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>جدول تخفیف تیراژ بنکداری و عمده‌فروشی:</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">
                اعمال خودکار با افزایش تعداد
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
              {product.tierDiscounts.map((tier: any, idx: number) => {
                const isBox = tier.unit === 'box' || (!tier.unit && tier.label?.includes('باکس'));
                const minQty = tier.minQuantity ?? tier.minCartons ?? 1;
                const discountPct = tier.discountPercentage ?? tier.discountPercent ?? 0;
                const unitName = isBox ? 'باکس' : 'کارتن';
                const isCurrentlyActive = isBox
                  ? (boxQty >= minQty && minQty > 0)
                  : (cartonQty >= minQty && minQty > 0);

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition-all space-y-1 ${
                      isCurrentlyActive
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isBox ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {unitName}
                      </span>
                      <span className="text-slate-600 text-[11px]">
                        خرید بالای {formatNumberFa(minQty)}
                      </span>
                    </div>
                    <div className="text-emerald-600 font-black text-sm flex items-center justify-center gap-1">
                      {formatNumberFa(discountPct)}٪ تخفیف
                      {isCurrentlyActive && (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dual Ordering Stepper: Carton & Box */}
        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-800">
            انتخاب تعداد کارتن و باکس برای ثبت در پیش‌فاکتور:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Carton selector */}
            <div className="bg-white p-3 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  کارتن ({formatNumberFa(product.boxesPerCarton)} باکسی)
                </span>
                <span className="text-xs font-black text-blue-700">{formatToman(product.cartonPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCartonQty(q => q + 1)}
                    className="w-7 h-7 rounded-md bg-white hover:bg-blue-600 hover:text-white font-bold text-sm transition-colors flex items-center justify-center text-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-slate-900">{formatNumberFa(cartonQty)}</span>
                  <button
                    type="button"
                    onClick={() => setCartonQty(q => Math.max(0, q - 1))}
                    className="w-7 h-7 rounded-md bg-white hover:bg-slate-200 font-bold text-sm transition-colors flex items-center justify-center text-slate-800 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">{formatToman(cartonTotalFinal)}</div>
                  {cartonDiscountPercent > 0 && (
                    <div className="text-[10px] text-emerald-600 font-bold">
                      ({formatNumberFa(cartonDiscountPercent)}٪ تخفیف)
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>حداقل سفارش کارتن (MOQ):</span>
                <span className="font-bold text-slate-700">
                  {moqCarton > 0 ? `${formatNumberFa(moqCarton)} کارتن` : 'بدون محدودیت'}
                </span>
              </div>
            </div>

            {/* Box selector */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-slate-600" />
                  باکس (۱۰ پاکتی)
                </span>
                <span className="text-xs font-black text-slate-800">{formatToman(product.boxPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setBoxQty(q => q + 1)}
                    className="w-7 h-7 rounded-md bg-white hover:bg-slate-800 hover:text-white font-bold text-sm transition-colors flex items-center justify-center text-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-slate-900">{formatNumberFa(boxQty)}</span>
                  <button
                    type="button"
                    onClick={() => setBoxQty(q => Math.max(0, q - 1))}
                    className="w-7 h-7 rounded-md bg-white hover:bg-slate-200 font-bold text-sm transition-colors flex items-center justify-center text-slate-800 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">{formatToman(boxTotalFinal)}</div>
                  {boxDiscountPercent > 0 && (
                    <div className="text-[10px] text-emerald-600 font-bold">
                      ({formatNumberFa(boxDiscountPercent)}٪ تخفیف)
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>حداقل سفارش باکس (MOQ):</span>
                <span className="font-bold text-slate-700">
                  {moqBox > 0 ? `${formatNumberFa(moqBox)} باکس` : 'بدون محدودیت'}
                </span>
              </div>
            </div>
          </div>

          {moqError && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{moqError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-600">مجموع سفارش این محصول:</span>
            <span className="text-sm font-black text-blue-700">{formatToman(grandTotal)}</span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-5">
          <button
            onClick={handleAdd}
            disabled={cartonQty === 0 && boxQty === 0}
            className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 ${
              added ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                به پیش‌فاکتور اضافه شد
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                افزودن ({formatNumberFa(cartonQty)} کارتن + {formatNumberFa(boxQty)} باکس) به پیش‌فاکتور
              </>
            )}
          </button>
        </div>
        
        {isImageExpanded && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setIsImageExpanded(false)}>
            <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors" onClick={() => setIsImageExpanded(false)}>
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={images[currentImageIndex]} 
              alt={product.nameFa} 
              className="max-w-full max-h-full object-contain" 
            />
            {images.length > 1 && (
              <>
                <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => (i - 1 + images.length) % images.length); }}>
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => (i + 1) % images.length); }}>
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
