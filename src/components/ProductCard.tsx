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
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { CigaretteProduct } from '../types';
import { formatToman, formatNumberFa, getApplicableDiscount, getProductStockInfo } from '../utils/formatters';

interface ProductCardProps {
  product: CigaretteProduct;
  onAddToCart: (product: CigaretteProduct, unit: 'carton' | 'box', quantity: number) => void;
  onOpenDetails: (product: CigaretteProduct) => void;
  isSelected?: boolean;
  onToggleSelect?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetails,
  isSelected,
  onToggleSelect,
}) => {
  const [cartonQty, setCartonQty] = useState<number>(product.moq || 1);
  const [boxQty, setBoxQty] = useState<number>(0);
  const [cartonJustAdded, setCartonJustAdded] = useState(false);
  const [boxJustAdded, setBoxJustAdded] = useState(false);
  const [bothJustAdded, setBothJustAdded] = useState(false);

  const stockInfo = getProductStockInfo(product);

  const handleAddCarton = () => {
    if (cartonQty > 0 && stockInfo.isAvailable) {
      onAddToCart(product, 'carton', cartonQty);
      setCartonJustAdded(true);
      setTimeout(() => setCartonJustAdded(false), 1200);
    }
  };

  const handleAddBox = () => {
    if (!stockInfo.isAvailable) return;
    const qty = boxQty > 0 ? boxQty : 1;
    onAddToCart(product, 'box', qty);
    if (boxQty === 0) setBoxQty(1);
    setBoxJustAdded(true);
    setTimeout(() => setBoxJustAdded(false), 1200);
  };

  const handleAddBoth = () => {
    if (!stockInfo.isAvailable) return;
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
      className={`bg-white border rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 group relative ${
        stockInfo.isAvailable ? 'border-slate-200 hover:border-blue-500 hover:shadow-lg hover:scale-[1.02]' : 'border-slate-200 opacity-80'
      }`}
      id={`product-card-${product.id}`}
    >
      {/* Top badges & Brand */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            {onToggleSelect && (
              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(product.id)}
                  className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700">مقایسه</span>
              </label>
            )}
            {product.badge && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                {product.badge}
              </span>
            )}
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
              {product.origin}
            </span>
          </div>
          <span className="text-xs font-black text-slate-500 font-mono" dir="ltr">
            {product.brand}
          </span>
        </div>

        {/* Product image & quick view trigger */}
        <div 
          onClick={() => onOpenDetails(product)}
          className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden mb-3 bg-slate-50 cursor-pointer group-hover:opacity-95 transition-all border border-slate-100"
        >
          <img 
            src={product.image} 
            alt={product.nameFa}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Hologram badge */}
          {product.hologram && product.hologram !== 'بدون هولوگرام' && product.hologram !== 'ندارد' && (
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold shadow-xs z-10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {product.hologram}
            </div>
          )}

          {/* Special Tier Discount Animated Badge */}
          {((product.tierDiscounts && product.tierDiscounts.length > 0) || (product.badge && (product.badge.includes('تخفیف') || product.badge.includes('ویژه') || product.badge.includes('حراج') || product.badge.includes('پیشنهاد')))) && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white text-[10px] px-3 py-1 rounded-xl flex items-center gap-1.5 font-black shadow-lg animate-pulse z-10 border border-white/30">
              <Tag className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
              تخفیف ویژه
            </div>
          )}

          {/* Detailed Stock Info Badge (Carton / Box / Pack) */}
          <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between text-[10px] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
            {stockInfo.isAvailable ? (
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Package className="w-3 h-3 text-indigo-600" />
                موجودی: {stockInfo.textSummary}
              </span>
            ) : (
              <span className="font-bold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500" />
                در انتظار شارژ انبار (ناموجود)
              </span>
            )}
          </div>
        </div>

        {/* Title & Brand */}
        <div className="mb-2.5 min-w-0">
          <div className="flex items-start justify-between gap-1.5">
            <h3 
              onClick={() => onOpenDetails(product)}
              className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer truncate flex-1"
              title={product.nameFa}
            >
              {product.nameFa}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono shrink-0 uppercase tracking-wider" dir="ltr">
              {product.brand}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-tight truncate mt-0.5" dir="ltr">
            {product.nameEn}
          </p>
        </div>

        {/* Product Description */}
        <div 
          onClick={() => onOpenDetails(product)}
          className="mb-3 cursor-pointer group/desc"
        >
          <p className="text-xs text-slate-600 leading-relaxed group-hover/desc:text-slate-900 transition-colors line-clamp-3 bg-slate-50/80 hover:bg-slate-100/80 p-2 rounded-xl border border-slate-100">
            {product.description}
          </p>
        </div>

        {/* Dual Unit Stock Display Card (Wholesale B2B: Carton & Box) */}
        <div className="mb-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 sm:p-2.5 text-xs">
          <div className="text-[10px] text-slate-500 font-bold mb-1.5 whitespace-nowrap">موجودی انبار مرکزی:</div>
          <div className="grid grid-cols-2 gap-1.5 text-center font-mono text-[11px]">
            <div className="bg-white py-1 px-2 rounded-xl border border-slate-200 flex items-center justify-between min-w-0">
              <span className="text-slate-400 text-[9px] block whitespace-nowrap">کارتن</span>
              <span className="font-black text-indigo-600 text-xs sm:text-sm truncate">{formatNumberFa(stockInfo.cartons)}</span>
            </div>
            <div className="bg-white py-1 px-2 rounded-xl border border-slate-200 flex items-center justify-between min-w-0">
              <span className="text-slate-400 text-[9px] block whitespace-nowrap">باکس</span>
              <span className="font-black text-slate-800 text-xs sm:text-sm truncate">{formatNumberFa(stockInfo.totalBoxes)}</span>
            </div>
          </div>
        </div>

        {/* Dual or Single Price Cards based on active packaging levels */}
        {(() => {
          const showCarton = product.hasCarton !== false && !product.isBoxOnly && (product.cartonPrice || 0) > 0;
          const showBox = product.hasBox !== false && (product.boxPrice || 0) > 0;
          const showPack = product.hasPack === true || ((product.packPrice || 0) > 0) || ((product.pricePerUnit || 0) > 0);

          if (showCarton && showBox) {
            return (
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3">
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-2 flex flex-col justify-between min-w-0">
                  <div className="text-[10px] font-bold text-blue-900 flex items-center gap-1 whitespace-nowrap">
                    <Package className="w-3 h-3 text-blue-700 shrink-0" />
                    <span className="truncate">کارتن ({formatNumberFa(product.boxesPerCarton)} باکس)</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-blue-950 mt-1 font-mono whitespace-nowrap truncate">
                    {formatToman(product.cartonPrice)}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex flex-col justify-between min-w-0">
                  <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1 whitespace-nowrap">
                    <Boxes className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">باکس ({formatNumberFa(product.packsPerBox || 10)} پاکت)</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 mt-1 font-mono whitespace-nowrap truncate">
                    {formatToman(product.boxPrice)}
                  </div>
                </div>
              </div>
            );
          }

          if (showBox) {
            return (
              <div className="mb-3 bg-amber-50/80 border border-amber-200 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-amber-900 flex items-center gap-1 whitespace-nowrap">
                    <Boxes className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    فروش باکسی / جعبه‌ای
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium truncate mt-0.5">
                    {formatNumberFa(product.packsPerBox || 10)} {product.unitName || 'عدد'}
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-black text-amber-950 font-mono whitespace-nowrap shrink-0">
                  {formatToman(product.boxPrice)}
                </div>
              </div>
            );
          }

          if (showPack) {
            return (
              <div className="mb-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-emerald-900 flex items-center gap-1 whitespace-nowrap">
                    <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    فروش تکی / {product.unitName || 'پاکت'}
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-black text-emerald-950 font-mono whitespace-nowrap shrink-0">
                  {formatToman(product.packPrice || product.pricePerUnit || 0)}
                </div>
              </div>
            );
          }

          return null;
        })()}

        {/* Wholesale Tier Discount Notification */}
        {!product.isBoxOnly && product.tierDiscounts.length > 0 && (
          <div className="mb-3">
            {discountPercent > 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-[11px] px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-1 font-bold">
                <span className="flex items-center gap-1 whitespace-nowrap truncate">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  تخفیف تیراژ {formatNumberFa(discountPercent)}٪
                </span>
                <span className="whitespace-nowrap shrink-0 text-emerald-900">سود: {formatToman(cartonDiscountVal)}</span>
              </div>
            ) : (
              <div className="text-[10px] text-slate-600 flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 gap-1">
                <span className="flex items-center gap-1 whitespace-nowrap truncate">
                  <Tag className="w-3 h-3 text-blue-600 shrink-0" />
                  تخفیف از ۳ کارتن به بالا
                </span>
                <button 
                  onClick={() => onOpenDetails(product)}
                  className="text-blue-600 hover:underline font-bold whitespace-nowrap shrink-0"
                >
                  جدول تخفیف
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Steppers or Out of stock notice */}
      <div className="pt-2.5 border-t border-slate-100 space-y-2">
        {!stockInfo.isAvailable ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center">
            <p className="text-xs font-black text-rose-700 whitespace-nowrap">اتمام موجودی در انبار مرکزی</p>
            <p className="text-[10px] text-rose-600 mt-0.5 line-clamp-1">محصول به‌محض شارژ انبار فعال می‌شود</p>
          </div>
        ) : (
          <>
            {/* Carton Row */}
            {(product.hasCarton !== false && !product.isBoxOnly && (product.cartonPrice || 0) > 0) && (
              <div className="flex items-center justify-between gap-1.5 bg-blue-50/50 border border-blue-100 rounded-2xl p-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-black text-blue-950 whitespace-nowrap shrink-0">کارتن:</span>
                  <div className="flex items-center bg-white border border-blue-200 rounded-xl p-0.5 shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setCartonQty(q => q + 1)}
                      className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-900 flex items-center justify-center font-bold text-xs transition-colors shrink-0 cursor-pointer"
                      title="افزایش کارتن"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="w-6 sm:w-7 text-center font-bold text-xs text-slate-900 font-mono shrink-0">
                      {formatNumberFa(cartonQty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCartonQty(q => Math.max(product.moq || 1, q - 1))}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs transition-colors shrink-0 cursor-pointer"
                      title="کاهش کارتن"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCarton}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs ${
                    cartonJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {cartonJustAdded ? (
                    <>
                      <Check className="w-3 h-3 shrink-0" />
                      <span>افزوده شد</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 shrink-0" />
                      <span>+ کارتن</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Box Row */}
            {(product.hasBox !== false && (product.boxPrice || 0) > 0) && (
              <div className="flex items-center justify-between gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-black text-slate-800 whitespace-nowrap shrink-0">باکس:</span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setBoxQty(q => q + 1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-900 flex items-center justify-center font-bold text-xs transition-colors shrink-0 cursor-pointer"
                      title="افزایش باکس"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="w-6 sm:w-7 text-center font-bold text-xs text-slate-900 font-mono shrink-0">
                      {formatNumberFa(boxQty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBoxQty(q => Math.max(0, q - 1))}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs transition-colors shrink-0 cursor-pointer"
                      title="کاهش باکس"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddBox}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs ${
                    boxJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-900 text-white'
                  }`}
                >
                  {boxJustAdded ? (
                    <>
                      <Check className="w-3 h-3 shrink-0" />
                      <span>افزوده شد</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 shrink-0" />
                      <span>+ باکس</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Combined Quick Order Button (If both or either selected) */}
            {(cartonQty > 0 && boxQty > 0) && (
              <button
                type="button"
                onClick={handleAddBoth}
                className={`w-full py-2 px-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer ${
                  bothJustAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 hover:bg-blue-600 text-white'
                }`}
              >
                {bothJustAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>ثبت همزمان انجام شد</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">
                      خرید {formatNumberFa(cartonQty)} کارتن + {formatNumberFa(boxQty)} باکس ({formatToman(combinedTotal)})
                    </span>
                  </>
                )}
              </button>
            )}
          </>
        )}

      </div>
    </div>
  );
};

