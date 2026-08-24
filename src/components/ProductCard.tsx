import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Minus, 
  Info, 
  ShieldCheck, 
  Check, 
  TrendingDown,
  Tag,
  Boxes,
  ShoppingCart
} from 'lucide-react';
import { CigaretteProduct } from '../types';
import { formatToman, formatNumberFa, getApplicableDiscount } from '../utils/formatters';

interface ProductCardProps {
  product: CigaretteProduct;
  onAddToCart: (product: CigaretteProduct, unit: 'carton' | 'box', quantity: number) => void;
  onOpenDetails: (product: CigaretteProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetails,
}) => {
  const [cartonQty, setCartonQty] = useState<number>(product.moq || 1);
  const [boxQty, setBoxQty] = useState<number>(0);
  const [cartonJustAdded, setCartonJustAdded] = useState(false);
  const [boxJustAdded, setBoxJustAdded] = useState(false);
  const [bothJustAdded, setBothJustAdded] = useState(false);

  const handleAddCarton = () => {
    if (cartonQty > 0) {
      onAddToCart(product, 'carton', cartonQty);
      setCartonJustAdded(true);
      setTimeout(() => setCartonJustAdded(false), 1200);
    }
  };

  const handleAddBox = () => {
    const qty = boxQty > 0 ? boxQty : 1;
    onAddToCart(product, 'box', qty);
    if (boxQty === 0) setBoxQty(1);
    setBoxJustAdded(true);
    setTimeout(() => setBoxJustAdded(false), 1200);
  };

  const handleAddBoth = () => {
    let added = false;
    if (cartonQty > 0) {
      onAddToCart(product, 'carton', cartonQty);
      added = true;
    }
    if (boxQty > 0) {
      onAddToCart(product, 'box', boxQty);
      added = true;
    }
    if (added) {
      setBothJustAdded(true);
      setTimeout(() => setBothJustAdded(false), 1200);
    }
  };

  // Discounts calculation
  const cartonTotalRaw = product.cartonPrice * cartonQty;
  const discountPercent = getApplicableDiscount('carton', cartonQty, product.tierDiscounts);
  const cartonDiscountVal = (cartonTotalRaw * discountPercent) / 100;
  const cartonTotalFinal = cartonTotalRaw - cartonDiscountVal;

  const combinedTotal = (cartonQty > 0 ? cartonTotalFinal : 0) + (boxQty > 0 ? (product.boxPrice * boxQty) : 0);

  return (
    <div 
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-200 group relative"
      id={`product-card-${product.id}`}
    >
      {/* Top badges & Brand */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.badge && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {product.badge}
              </span>
            )}
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {product.origin}
            </span>
          </div>
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
            {product.brand}
          </span>
        </div>

        {/* Product image & quick view trigger */}
        <div 
          onClick={() => onOpenDetails(product)}
          className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden mb-3 bg-slate-50 dark:bg-slate-800 cursor-pointer group-hover:opacity-95 transition-all border border-slate-100 dark:border-slate-800"
        >
          <img 
            src={product.image} 
            alt={product.nameFa}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Hologram badge */}
          <div className="absolute top-2 right-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {product.hologram}
          </div>

          {/* Quick Specs bar */}
          <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between text-[10px] text-slate-700 dark:text-slate-300 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-200/90 dark:border-slate-700 shadow-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatNumberFa(product.boxesPerCarton)} باکس در هر کارتن
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
              مشاهده مشخصات <Info className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Title & Brand */}
        <div className="mb-2">
          <h3 
            onClick={() => onOpenDetails(product)}
            className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
          >
            {product.nameFa}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tracking-tight line-clamp-1" dir="ltr">
            {product.nameEn}
          </p>
        </div>

        {/* Short description preview */}
        <p 
          onClick={() => onOpenDetails(product)}
          className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          {product.description}
        </p>

        {/* Dual Price Cards (Carton & Box or Box-Only) */}
        {product.isBoxOnly ? (
          <div className="mb-3">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-2.5 text-right">
              <div className="text-[10px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                <Boxes className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                فقط فروش باکسی (بدون کارتن مادر)
              </div>
              <div className="text-sm font-black text-amber-950 dark:text-amber-200 mt-1">
                {formatToman(product.boxPrice)}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl p-2 text-right">
              <div className="text-[10px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                <Package className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                کارتن ({formatNumberFa(product.boxesPerCarton)} باکس)
              </div>
              <div className="text-xs sm:text-sm font-black text-blue-900 dark:text-blue-300 mt-1">
                {formatToman(product.cartonPrice)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 text-right">
              <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Boxes className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                تک باکس (۱۰ پاکت)
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1">
                {formatToman(product.boxPrice)}
              </div>
            </div>
          </div>
        )}

        {/* Wholesale Tier Discount Notification */}
        {!product.isBoxOnly && product.tierDiscounts.length > 0 && (
          <div className="mb-3">
            {discountPercent > 0 ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] px-2.5 py-1 rounded-xl flex items-center justify-between font-bold">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  تخفیف تیراژ {formatNumberFa(discountPercent)}٪ فعال شد
                </span>
                <span>سود: {formatToman(cartonDiscountVal)}</span>
              </div>
            ) : (
              <div className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  تخفیف تیراژ: از ۳ کارتن به بالا
                </span>
                <button 
                  onClick={() => onOpenDetails(product)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  جدول تخفیف
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Steppers: Carton (if not box-only) and Box */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
        
        {/* Carton Row (Only if not isBoxOnly) */}
        {!product.isBoxOnly && (
          <div className="flex items-center justify-between gap-2 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-blue-950 dark:text-blue-300 w-12">کارتن:</span>
              <div className="flex items-center bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setCartonQty(q => q + 1)}
                  className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-600 hover:text-white text-blue-900 dark:text-blue-200 flex items-center justify-center font-bold text-xs transition-colors"
                  title="افزایش کارتن"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-bold text-xs text-slate-900 dark:text-white">
                  {formatNumberFa(cartonQty)}
                </span>
                <button
                  type="button"
                  onClick={() => setCartonQty(q => Math.max(product.moq || 1, q - 1))}
                  className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs transition-colors"
                  title="کاهش کارتن"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddCarton}
              className={`px-2.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1 transition-all ${
                cartonJustAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              {cartonJustAdded ? (
                <>
                  <Check className="w-3 h-3" />
                  افزوده شد
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  + کارتن
                </>
              )}
            </button>
          </div>
        )}

        {/* Box Row */}
        <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 w-12">باکس:</span>
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setBoxQty(q => q + 1)}
                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-800 hover:text-white text-slate-900 dark:text-slate-200 flex items-center justify-center font-bold text-xs transition-colors"
                title="افزایش باکس"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center font-bold text-xs text-slate-900 dark:text-white">
                {formatNumberFa(boxQty)}
              </span>
              <button
                type="button"
                onClick={() => setBoxQty(q => Math.max(0, q - 1))}
                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs transition-colors"
                title="کاهش باکس"
              >
                <Minus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddBox}
            className={`px-2.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1 transition-all ${
              boxJustAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white shadow-xs'
            }`}
          >
            {boxJustAdded ? (
              <>
                <Check className="w-3 h-3" />
                افزوده شد
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                + باکس
              </>
            )}
          </button>
        </div>

        {/* Combined Quick Order Button (If both or either selected) */}
        {(cartonQty > 0 && boxQty > 0) && (
          <button
            type="button"
            onClick={handleAddBoth}
            className={`w-full py-2 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
              bothJustAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 dark:bg-blue-600 hover:bg-blue-600 text-white'
            }`}
          >
            {bothJustAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                هر دو (کارتن و باکس) ثبت شد
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
                افزودن همزمان {formatNumberFa(cartonQty)} کارتن + {formatNumberFa(boxQty)} باکس ({formatToman(combinedTotal)})
              </>
            )}
          </button>
        )}

      </div>
    </div>
  );
};
