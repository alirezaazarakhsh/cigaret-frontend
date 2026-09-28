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
import { getProductRichOverride } from '../services/djangoApi';

interface ProductCardProps {
  product: CigaretteProduct;
  onAddToCart: (product: CigaretteProduct, unit: 'carton' | 'box' | 'pack', quantity: number) => void;
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
  const moqCarton = (product.moq !== undefined && product.moq !== null) ? Number(product.moq) : 0;
  const moqBox = (product.moqBox !== undefined && product.moqBox !== null) ? Number(product.moqBox) : 0;

  const showCarton = product.hasCarton !== false && !product.isBoxOnly && (product.cartonPrice || 0) > 0;
  const showBox = product.hasBox !== false && (product.boxPrice || 0) > 0;
  const effectivePackPrice = (product.packPrice && product.packPrice > 0)
    ? product.packPrice
    : ((product.pricePerUnit && product.pricePerUnit > 0)
      ? product.pricePerUnit
      : ((product.boxPrice || 0) > 0 ? Math.round(product.boxPrice / (product.packsPerBox || 10)) : 0));
  const showPack = Boolean(product.hasPack) && effectivePackPrice > 0;

  const [cartonQty, setCartonQty] = useState<number>(() => showCarton ? (moqCarton > 0 ? moqCarton : 1) : 0);
  const [boxQty, setBoxQty] = useState<number>(() => (!showCarton && showBox) ? (moqBox > 0 ? moqBox : 1) : 0);
  const [packQty, setPackQty] = useState<number>(() => (!showCarton && !showBox && showPack) ? 1 : 0);
  const [cartonJustAdded, setCartonJustAdded] = useState(false);
  const [boxJustAdded, setBoxJustAdded] = useState(false);
  const [packJustAdded, setPackJustAdded] = useState(false);
  const [bothJustAdded, setBothJustAdded] = useState(false);

  const stockInfo = getProductStockInfo(product);

  const handleAddCarton = () => {
    if (!stockInfo.isAvailable) return;
    const qty = cartonQty > 0 ? cartonQty : (moqCarton > 0 ? moqCarton : 1);
    onAddToCart(product, 'carton', qty);
    if (cartonQty === 0) setCartonQty(qty);
    setCartonJustAdded(true);
    setTimeout(() => setCartonJustAdded(false), 1200);
  };

  const handleAddBox = () => {
    if (!stockInfo.isAvailable) return;
    const qty = boxQty > 0 ? boxQty : (moqBox > 0 ? moqBox : 1);
    onAddToCart(product, 'box', qty);
    if (boxQty === 0) setBoxQty(qty);
    setBoxJustAdded(true);
    setTimeout(() => setBoxJustAdded(false), 1200);
  };

  const handleAddPack = () => {
    if (!stockInfo.isAvailable) return;
    const qty = packQty > 0 ? packQty : 1;
    onAddToCart(product, 'pack', qty);
    if (packQty === 0) setPackQty(qty);
    setPackJustAdded(true);
    setTimeout(() => setPackJustAdded(false), 1200);
  };

  const handleAddBoth = () => {
    if (!stockInfo.isAvailable) return;
    let added = false;
    if (showCarton && cartonQty > 0) {
      onAddToCart(product, 'carton', cartonQty);
      added = true;
    }
    if (showBox && boxQty > 0) {
      onAddToCart(product, 'box', boxQty);
      added = true;
    }
    if (showPack && packQty > 0) {
      onAddToCart(product, 'pack', packQty);
      added = true;
    }
    if (added) {
      setBothJustAdded(true);
      setTimeout(() => setBothJustAdded(false), 1200);
    }
  };

  // Discounts calculation (Carton, Box & Pack)
  const cartonTotalRaw = (product.cartonPrice || 0) * cartonQty;
  const cartonDiscountPercent = getApplicableDiscount('carton', cartonQty, product.tierDiscounts);
  const cartonDiscountVal = (cartonTotalRaw * cartonDiscountPercent) / 100;
  const cartonTotalFinal = cartonTotalRaw - cartonDiscountVal;

  const boxTotalRaw = (product.boxPrice || 0) * boxQty;
  const boxDiscountPercent = getApplicableDiscount('box', boxQty, product.tierDiscounts);
  const boxDiscountVal = (boxTotalRaw * boxDiscountPercent) / 100;
  const boxTotalFinal = boxTotalRaw - boxDiscountVal;

  const packTotalRaw = effectivePackPrice * packQty;
  const packDiscountPercent = getApplicableDiscount('pack', packQty, product.tierDiscounts);
  const packDiscountVal = (packTotalRaw * packDiscountPercent) / 100;
  const packTotalFinal = packTotalRaw - packDiscountVal;

  const combinedTotal =
    (showCarton && cartonQty > 0 ? cartonTotalFinal : 0) +
    (showBox && boxQty > 0 ? boxTotalFinal : 0) +
    (showPack && packQty > 0 ? packTotalFinal : 0);

  const activeSelectedUnitsCount =
    (showCarton && cartonQty > 0 ? 1 : 0) +
    (showBox && boxQty > 0 ? 1 : 0) +
    (showPack && packQty > 0 ? 1 : 0);

  const displayBadge = (!product.isFeatured && (product.badge === 'پیشنهاد ویژه' || product.badge === 'special' || product.badge === 'تخفیف ویژه'))
    ? ''
    : product.badge;

  return (
    <div 
      className={`bg-white border rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 group relative h-full will-change-transform ${
        stockInfo.isAvailable 
          ? 'border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1' 
          : 'border-slate-200/80 bg-slate-50/40 opacity-85'
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
            {displayBadge && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                {displayBadge}
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

          {/* Special Offer / Special Discount Animated Badge - Strictly controlled by isFeatured */}
          {Boolean(product.isFeatured) && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white text-[10px] px-3 py-1 rounded-xl flex items-center gap-1.5 font-black shadow-lg animate-pulse z-10 border border-white/30">
              <Tag className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
              تخفیف ویژه
            </div>
          )}

          {/* Detailed Stock Info Badge (Carton / Box / Pack) */}
          <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between text-[10px] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
            {stockInfo.isAvailable ? (
              <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                <Package className="w-3 h-3 text-indigo-600 shrink-0" />
                <span className="truncate">موجودی: {stockInfo.textSummary}</span>
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

        {/* Product Short Description / Excerpt with 120-character limit */}
        {(() => {
          const MAX_CARD_DESC_CHARS = 120;
          const stripHtml = (str?: string) =>
            str ? str.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : '';
          const richOverride = getProductRichOverride(product.id);
          const rawShortDesc =
            stripHtml(product.excerpt) ||
            stripHtml((product as any).short_description) ||
            stripHtml(richOverride?.excerpt) ||
            stripHtml(product.metaDescription) ||
            stripHtml(richOverride?.metaDescription);

          if (!rawShortDesc) return null;

          const shortDesc = rawShortDesc.length > MAX_CARD_DESC_CHARS
            ? `${rawShortDesc.slice(0, MAX_CARD_DESC_CHARS).trim()}...`
            : rawShortDesc;

          return (
            <div 
              onClick={() => onOpenDetails(product)}
              className="mb-3 cursor-pointer group/desc"
            >
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed group-hover/desc:text-slate-900 transition-colors line-clamp-2 break-words bg-slate-50/90 hover:bg-blue-50/50 px-3 py-2 rounded-xl border border-slate-200/80 text-justify font-medium">
                {shortDesc}
              </p>
            </div>
          );
        })()}

        {/* Dynamic Stock Display Card based on Image 8 & 9 (Carton / Box / Pack) */}
        {(() => {
          const stockUnits: { label: string; value: number; colorClass: string }[] = [];
          if (showCarton) {
            stockUnits.push({ label: 'کارتن', value: stockInfo.cartons, colorClass: 'text-indigo-600' });
          }
          if (showBox) {
            stockUnits.push({ label: 'باکس', value: stockInfo.displayBoxes, colorClass: 'text-slate-800' });
          }
          if (showPack) {
            stockUnits.push({ label: 'پاکت', value: stockInfo.displayPacks, colorClass: 'text-emerald-600' });
          }
          if (stockUnits.length === 0) {
            stockUnits.push({ label: 'کارتن', value: stockInfo.cartons, colorClass: 'text-indigo-600' });
          }

          const gridColsClass =
            stockUnits.length === 3
              ? 'grid-cols-3'
              : stockUnits.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-1';

          return (
            <div className="mb-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 sm:p-2.5 text-xs">
              <div className="text-[10px] text-slate-500 font-bold mb-1.5 whitespace-nowrap">موجودی انبار مرکزی:</div>
              <div className={`grid ${gridColsClass} gap-1.5 text-center font-mono text-[11px]`}>
                {stockUnits.map((su) => (
                  <div key={su.label} className="bg-white py-1 px-2 rounded-xl border border-slate-200 flex items-center justify-between min-w-0">
                    <span className="text-slate-400 text-[9px] block whitespace-nowrap">{su.label}</span>
                    <span className={`font-black ${su.colorClass} text-xs sm:text-sm truncate`}>{formatNumberFa(su.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Price Cards based on active packaging levels (Carton, Box, Pack) */}
        <div className="space-y-1.5 mb-3">
          {(showCarton || showBox) && (
            <div className={`grid ${showCarton && showBox ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5 sm:gap-2`}>
              {showCarton && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-2 flex flex-col justify-between min-w-0">
                  <div className="text-[10px] font-bold text-blue-900 flex items-center gap-1 whitespace-nowrap">
                    <Package className="w-3 h-3 text-blue-700 shrink-0" />
                    <span className="truncate">کارتن ({formatNumberFa(product.boxesPerCarton || 50)} باکس)</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-blue-950 mt-1 font-mono whitespace-nowrap truncate">
                    {formatToman(product.cartonPrice)}
                  </div>
                </div>
              )}

              {showBox && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex flex-col justify-between min-w-0">
                  <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1 whitespace-nowrap">
                    <Boxes className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">باکس ({formatNumberFa(product.packsPerBox || 10)} پاکت)</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 mt-1 font-mono whitespace-nowrap truncate">
                    {formatToman(product.boxPrice)}
                  </div>
                </div>
              )}
            </div>
          )}

          {showPack && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-2 flex items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="text-[10px] font-bold text-emerald-900 whitespace-nowrap truncate">
                  قیمت هر {product.unitName || 'پاکت'} (تک‌فروشی):
                </span>
              </div>
              <div className="text-xs sm:text-sm font-black text-emerald-950 font-mono whitespace-nowrap shrink-0">
                {formatToman(effectivePackPrice)}
              </div>
            </div>
          )}
        </div>

        {/* Wholesale Tier Discount Notification */}
        {product.tierDiscounts && product.tierDiscounts.length > 0 && (
          <div className="mb-3">
            {(cartonDiscountPercent > 0 || boxDiscountPercent > 0 || packDiscountPercent > 0) ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-[11px] px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-1 font-bold">
                <span className="flex items-center gap-1 whitespace-nowrap truncate">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  تخفیف تیراژ فعال {formatNumberFa(Math.max(cartonDiscountPercent, boxDiscountPercent, packDiscountPercent))}٪
                </span>
                <span className="whitespace-nowrap shrink-0 text-emerald-900">
                  سود: {formatToman(cartonDiscountVal + boxDiscountVal + packDiscountVal)}
                </span>
              </div>
            ) : (
              <div className="text-[10px] text-slate-600 flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 gap-1">
                <span className="flex items-center gap-1 whitespace-nowrap truncate">
                  <Tag className="w-3 h-3 text-blue-600 shrink-0" />
                  تخفیف تیراژ کارتن و باکس
                </span>
                <button 
                  onClick={() => onOpenDetails(product)}
                  className="text-blue-600 hover:underline font-bold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  مشاهده جدول
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
            {showCarton && (
              <div className="flex items-center justify-between gap-1 bg-blue-50/50 border border-blue-100 rounded-2xl p-1 sm:p-1.5">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-black text-blue-950 whitespace-nowrap shrink-0">کارتن:</span>
                  <div className="flex items-center bg-white border border-blue-200 rounded-xl p-0.5 shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setCartonQty(q => q + 1)}
                      className="w-5.5 sm:w-6 h-5.5 sm:h-6 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-900 flex items-center justify-center font-bold text-[10px] sm:text-xs transition-colors shrink-0 cursor-pointer"
                      title="افزایش کارتن"
                    >
                      <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                    <span className="w-5 sm:w-7 text-center font-bold text-[10px] sm:text-xs text-slate-900 font-mono shrink-0">
                      {formatNumberFa(cartonQty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCartonQty(q => Math.max(0, q - 1))}
                      className="w-5.5 sm:w-6 h-5.5 sm:h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] sm:text-xs transition-colors shrink-0 cursor-pointer"
                      title="کاهش کارتن"
                    >
                      <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCarton}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-black text-[10px] sm:text-[11px] flex items-center justify-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs ${
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
            {showBox && (
              <div className="flex items-center justify-between gap-1 bg-slate-50 border border-slate-200 rounded-2xl p-1 sm:p-1.5">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-black text-slate-800 whitespace-nowrap shrink-0">باکس:</span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setBoxQty(q => q + 1)}
                      className="w-5.5 sm:w-6 h-5.5 sm:h-6 rounded-lg bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-900 flex items-center justify-center font-bold text-[10px] sm:text-xs transition-colors shrink-0 cursor-pointer"
                      title="افزایش باکس"
                    >
                      <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                    <span className="w-5 sm:w-7 text-center font-bold text-[10px] sm:text-xs text-slate-900 font-mono shrink-0">
                      {formatNumberFa(boxQty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBoxQty(q => Math.max(0, q - 1))}
                      className="w-5.5 sm:w-6 h-5.5 sm:h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] sm:text-xs transition-colors shrink-0 cursor-pointer"
                      title="کاهش باکس"
                    >
                      <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddBox}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-black text-[10px] sm:text-[11px] flex items-center justify-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs ${
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

            {/* Pack Row */}
            {showPack && (
              <div className="flex items-center justify-between gap-1 bg-emerald-50/60 border border-emerald-200 rounded-2xl p-1 sm:p-1.5">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-black text-emerald-950 whitespace-nowrap shrink-0">پاکت:</span>
                  <div className="flex items-center bg-white border border-emerald-200 rounded-xl p-0.5 shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setPackQty(q => q + 1)}
                      className="w-5.5 sm:w-6 h-5.5 sm:h-6 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-900 flex items-center justify-center font-bold text-[10px] sm:text-xs transition-colors shrink-0 cursor-pointer"
                      title="افزایش پاکت"
                    >
                      <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                    <span className="w-5 sm:w-7 text-center font-bold text-[10px] sm:text-xs text-slate-900 font-mono shrink-0">
                      {formatNumberFa(packQty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPackQty(q => Math.max(0, q - 1))}
                      className="w-5.5 sm:w-6 h-5.5 sm:h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] sm:text-xs transition-colors shrink-0 cursor-pointer"
                      title="کاهش پاکت"
                    >
                      <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddPack}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-black text-[10px] sm:text-[11px] flex items-center justify-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs ${
                    packJustAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {packJustAdded ? (
                    <>
                      <Check className="w-3 h-3 shrink-0" />
                      <span>افزوده شد</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 shrink-0" />
                      <span>+ پاکت</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Combined Quick Order Button (If 2 or more units selected) */}
            {activeSelectedUnitsCount >= 2 && (
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
                      خرید {[
                        showCarton && cartonQty > 0 ? `${formatNumberFa(cartonQty)} کارتن` : '',
                        showBox && boxQty > 0 ? `${formatNumberFa(boxQty)} باکس` : '',
                        showPack && packQty > 0 ? `${formatNumberFa(packQty)} پاکت` : '',
                      ].filter(Boolean).join(' + ')} ({formatToman(combinedTotal)})
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

