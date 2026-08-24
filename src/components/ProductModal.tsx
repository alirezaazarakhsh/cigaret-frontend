import React, { useState } from 'react';
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
  ShoppingCart
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
  if (!product) return null;

  const [cartonQty, setCartonQty] = useState<number>(product.moq || 1);
  const [boxQty, setBoxQty] = useState<number>(0);
  const [added, setAdded] = useState(false);

  const cartonTotalRaw = product.cartonPrice * cartonQty;
  const discountPercent = getApplicableDiscount('carton', cartonQty, product.tierDiscounts);
  const cartonDiscountVal = (cartonTotalRaw * discountPercent) / 100;
  const cartonTotalFinal = cartonTotalRaw - cartonDiscountVal;

  const boxTotal = product.boxPrice * boxQty;
  const grandTotal = (cartonQty > 0 ? cartonTotalFinal : 0) + (boxQty > 0 ? boxTotal : 0);

  const handleAdd = () => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 relative text-slate-900 dark:text-slate-100"
        id="product-details-modal"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm">
            <img 
              src={product.image} 
              alt={product.nameFa} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                {product.brand}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                مبدأ: {product.origin}
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {product.hologram}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              {product.nameFa}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-tight" dir="ltr">
              {product.nameEn}
            </p>
          </div>
        </div>

        {/* Full Rich Description */}
        <div className="mb-5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            معرفی و مشخصات تخصصی کالا در پخش سوین:
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-justify font-normal">
            {product.description}
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-500" />
              قطران (Tar)
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{product.tar}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Wind className="w-3 h-3 text-blue-500" />
              نیکوتین (Nicotine)
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{product.nicotine}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Boxes className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              تعداد در کارتن
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{formatNumberFa(product.boxesPerCarton)} باکس (۵۰۰ پاکت)</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Package className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              حداقل سفارش عمده
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{formatNumberFa(product.moq || 1)} کارتن پلمپ</div>
          </div>
        </div>

        {/* Discount Tier Table (Fix NaN issue) */}
        {product.tierDiscounts && product.tierDiscounts.length > 0 && (
          <div className="mb-5 bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              جدول تخفیف تیراژ بنکداری و عمده‌فروشی:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
              {product.tierDiscounts.map((tier: any, idx: number) => {
                const minQty = tier.minCartons ?? tier.minQuantity ?? 1;
                const discountPct = tier.discountPercentage ?? tier.discountPercent ?? 0;
                const unitName = tier.unit === 'box' ? 'باکس' : 'کارتن';
                return (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      خرید بالای {formatNumberFa(minQty)} {unitName}
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                      {formatNumberFa(discountPct)}٪ تخفیف
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dual Ordering Stepper: Carton & Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            انتخاب تعداد کارتن و باکس برای ثبت در پیش‌فاکتور:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Carton selector */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-200 dark:border-blue-900/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  کارتن ({formatNumberFa(product.boxesPerCarton)} باکسی)
                </span>
                <span className="text-xs font-black text-blue-700 dark:text-blue-400">{formatToman(product.cartonPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setCartonQty(q => q + 1)}
                    className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 hover:bg-blue-600 hover:text-white font-bold text-sm transition-colors flex items-center justify-center text-slate-800 dark:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-slate-900 dark:text-white">{formatNumberFa(cartonQty)}</span>
                  <button
                    type="button"
                    onClick={() => setCartonQty(q => Math.max(0, q - 1))}
                    className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-sm transition-colors flex items-center justify-center text-slate-800 dark:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatToman(cartonTotalFinal)}</div>
              </div>
            </div>

            {/* Box selector */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  باکس (۱۰ پاکتی)
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{formatToman(product.boxPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setBoxQty(q => q + 1)}
                    className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-800 hover:text-white font-bold text-sm transition-colors flex items-center justify-center text-slate-800 dark:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-slate-900 dark:text-white">{formatNumberFa(boxQty)}</span>
                  <button
                    type="button"
                    onClick={() => setBoxQty(q => Math.max(0, q - 1))}
                    className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-sm transition-colors flex items-center justify-center text-slate-800 dark:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatToman(boxTotal)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-600 dark:text-slate-400">مجموع سفارش این محصول:</span>
            <span className="text-sm font-black text-blue-700 dark:text-blue-400">{formatToman(grandTotal)}</span>
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

      </div>
    </div>
  );
};
