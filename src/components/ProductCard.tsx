import React, { useState, useEffect } from 'react';
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
import { getProductRichOverride, mapBadgeFromDjango } from '../services/djangoApi';

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
  const richOverride = getProductRichOverride(product.id);
  const moqCarton = Math.max(0, Number(product.moq) || 0, Number((product as any).min_order_carton) || 0, Number(richOverride?.moq) || 0);
  const moqBox = Math.max(0, Number(product.moqBox) || 0, Number((product as any).min_order_box) || 0, Number(richOverride?.moqBox) || 0);
  const moqPack = Math.max(0, Number(product.moqPack) || 0, Number((product as any).min_order_pack) || 0, Number(richOverride?.moqPack) || 0);
  const minStepCarton = Math.max(1, moqCarton);
  const minStepBox = Math.max(1, moqBox);
  const minStepPack = Math.max(1, moqPack);

  const showCarton = product.hasCarton !== false && !product.isBoxOnly && (product.cartonPrice || 0) > 0;
  const showBox = product.hasBox !== false && (product.boxPrice || 0) > 0;
  const effectivePackPrice = (product.packPrice && product.packPrice > 0)
    ? product.packPrice
    : ((product.pricePerUnit && product.pricePerUnit > 0)
      ? product.pricePerUnit
      : ((product.boxPrice || 0) > 0 ? Math.round(product.boxPrice / (product.packsPerBox || 10)) : 0));
  const showPack = Boolean(product.hasPack) && effectivePackPrice > 0;

  const [cartonQty, setCartonQty] = useState<number>(0);
  const [boxQty, setBoxQty] = useState<number>(0);
  const [packQty, setPackQty] = useState<number>(0);
  const [cartonJustAdded, setCartonJustAdded] = useState(false);
  const [boxJustAdded, setBoxJustAdded] = useState(false);
  const [packJustAdded, setPackJustAdded] = useState(false);
  const [bothJustAdded, setBothJustAdded] = useState(false);
  const [moqWarning, setMoqWarning] = useState<string | null>(null);

  useEffect(() => {
    setCartonQty(prev => {
      if (!showCarton) return 0;
      if (moqCarton > 0 && prev > 0 && prev < moqCarton) return moqCarton;
      return prev;
    });
    setBoxQty(prev => {
      if (!showBox) return 0;
      if (moqBox > 0 && prev > 0 && prev < moqBox) return moqBox;
      return prev;
    });
    setPackQty(prev => {
      if (!showPack) return 0;
      if (moqPack > 0 && prev > 0 && prev < moqPack) return moqPack;
      return prev;
    });
  }, [moqCarton, moqBox, moqPack, showCarton, showBox, showPack]);

  const triggerMoqWarning = (msg: string) => {
    setMoqWarning(msg);
    setTimeout(() => {
      setMoqWarning(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const stockInfo = getProductStockInfo(product);

  const handleAddCarton = () => {
    if (!stockInfo.isAvailable) return;
    const effectiveQty = cartonQty === 0 ? minStepCarton : cartonQty;
    if (moqCarton > 0 && effectiveQty < moqCarton) {
      setCartonQty(moqCarton);
      triggerMoqWarning(`حداقل سفارش مجاز برای این محصول ${formatNumberFa(moqCarton)} کارتن است.`);
      return;
    }
    setMoqWarning(null);
    if (cartonQty === 0) setCartonQty(effectiveQty);
    onAddToCart(product, 'carton', effectiveQty);
    setCartonJustAdded(true);
    setTimeout(() => setCartonJustAdded(false), 1200);
  };

  const handleAddBox = () => {
    if (!stockInfo.isAvailable) return;
    const effectiveQty = boxQty === 0 ? minStepBox : boxQty;
    if (moqBox > 0 && effectiveQty < moqBox) {
      setBoxQty(moqBox);
      triggerMoqWarning(`حداقل سفارش مجاز برای این محصول ${formatNumberFa(moqBox)} باکس است.`);
      return;
    }
    setMoqWarning(null);
    if (boxQty === 0) setBoxQty(effectiveQty);
    onAddToCart(product, 'box', effectiveQty);
    setBoxJustAdded(true);
    setTimeout(() => setBoxJustAdded(false), 1200);
  };

  const handleAddPack = () => {
    if (!stockInfo.isAvailable) return;
    const effectiveQty = packQty === 0 ? minStepPack : packQty;
    if (moqPack > 0 && effectiveQty < moqPack) {
      setPackQty(moqPack);
      triggerMoqWarning(`حداقل سفارش مجاز برای این محصول ${formatNumberFa(moqPack)} پاکت است.`);
      return;
    }
    setMoqWarning(null);
    if (packQty === 0) setPackQty(effectiveQty);
    onAddToCart(product, 'pack', effectiveQty);
    setPackJustAdded(true);
    setTimeout(() => setPackJustAdded(false), 1200);
  };

  const handleAddBoth = () => {
    if (!stockInfo.isAvailable) return;
    if (showCarton && cartonQty > 0 && moqCarton > 0 && cartonQty < moqCarton) {
      setCartonQty(moqCarton);
      triggerMoqWarning(`حداقل سفارش کارتن برای این محصول ${formatNumberFa(moqCarton)} کارتن است.`);
      return;
    }
    if (showBox && boxQty > 0 && moqBox > 0 && boxQty < moqBox) {
      setBoxQty(moqBox);
      triggerMoqWarning(`حداقل سفارش باکس برای این محصول ${formatNumberFa(moqBox)} باکس است.`);
      return;
    }
    if (showPack && packQty > 0 && moqPack > 0 && packQty < moqPack) {
      setPackQty(moqPack);
      triggerMoqWarning(`حداقل سفارش پاکت برای این محصول ${formatNumberFa(moqPack)} پاکت است.`);
      return;
    }
    setMoqWarning(null);
    let added = false;
    if (showCarton && cartonQty > 0 && cartonQty >= moqCarton) {
      onAddToCart(product, 'carton', cartonQty);
      added = true;
    }
    if (showBox && boxQty > 0 && boxQty >= moqBox) {
      onAddToCart(product, 'box', boxQty);
      added = true;
    }
    if (showPack && packQty > 0 && packQty >= moqPack) {
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

  const displayBadge = mapBadgeFromDjango(product.badge);

  return (
    <div 
      className={`bg-white border rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 group relative h-full will-change-transform ${
        stockInfo.isAvailable 
          ? 'border-slate-200/90 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5' 
          : 'border-slate-200/80 bg-slate-50/40 opacity-85'
      }`}
      id={`product-card-${product.id}`}
    >
      {/* Top Section: Header + Image + Title + Excerpt + Prices */}
      <div>
        {/* Compact Top Meta Row */}
        <div className="flex items-center justify-between gap-1.5 mb-2 text-[10px]">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            {onToggleSelect && (
              <label className="flex items-center gap-1 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors shrink-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(product.id)}
                  className="w-3.5 h-3.5 text-blue-600 rounded-xs border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[10px] font-bold text-slate-700">مقایسه</span>
              </label>
            )}
            {displayBadge && (
              <span className="font-bold text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded-md truncate">
                {displayBadge}
              </span>
            )}
            {product.origin && (
              <span className="text-slate-500 truncate">
                {displayBadge ? `• ${product.origin}` : product.origin}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-400 font-mono shrink-0 uppercase" dir="ltr">
            {product.brand}
          </span>
        </div>

        {/* Compact Product Image with Hologram & Stock Overlay */}
        <div 
          onClick={() => onOpenDetails(product)}
          className="relative h-36 sm:h-40 w-full rounded-xl overflow-hidden mb-2 bg-slate-50 cursor-pointer group-hover:opacity-95 transition-all border border-slate-100"
        >
          <img 
            src={(richOverride?.image && richOverride.image.trim() !== '') ? richOverride.image : product.image} 
            alt={product.nameFa}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Hologram badge */}
          {product.hologram && product.hologram !== 'بدون هولوگرام' && product.hologram !== 'ندارد' && (
            <div className="absolute top-1.5 right-1.5 bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-800 text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-1 font-bold shadow-2xs z-10">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{product.hologram}</span>
            </div>
          )}

          {/* Special Offer Badge */}
          {Boolean(product.isFeatured) && (
            <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 font-black shadow-sm z-10">
              <Tag className="w-2.5 h-2.5 text-amber-200" />
              <span>پیشنهاد ویژه</span>
            </div>
          )}

          {/* Unified Stock Info Bar on Image Bottom */}
          <div className="absolute bottom-1.5 right-1.5 left-1.5 flex items-center justify-between text-[10px] bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-200/90 shadow-2xs">
            {stockInfo.isAvailable ? (
              <span className="font-bold text-slate-800 flex items-center gap-1 truncate w-full">
                <Package className="w-3 h-3 text-indigo-600 shrink-0" />
                <span className="truncate">موجودی: {stockInfo.textSummary}</span>
              </span>
            ) : (
              <span className="font-bold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                <span>در انتظار شارژ انبار (ناموجود)</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & English Subtitle in Compact Row */}
        <div className="mb-1.5 min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <h3 
              onClick={() => onOpenDetails(product)}
              className="text-xs sm:text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer truncate flex-1"
              title={product.nameFa}
            >
              {product.nameFa}
            </h3>
            {product.nameEn && (
              <span className="text-[10px] text-slate-400 font-mono tracking-tight truncate max-w-[42%] shrink-0" dir="ltr">
                {product.nameEn}
              </span>
            )}
          </div>
        </div>

        {/* Compact Excerpt (1 line to keep card height low) */}
        {(() => {
          const MAX_CARD_DESC_CHARS = 100;
          const stripHtml = (str?: string) =>
            str
              ? str
                  .replace(/<[^>]*>/g, ' ')
                  .replace(/&amp;nbsp;/gi, ' ')
                  .replace(/&nbsp;/gi, ' ')
                  .replace(/\u00A0/g, ' ')
                  .replace(/&zwnj;/gi, '\u200c')
                  .replace(/&quot;/gi, '"')
                  .replace(/&#39;/gi, "'")
                  .replace(/&amp;/gi, '&')
                  .replace(/\s+/g, ' ')
                  .trim()
              : '';
          const rawShortDesc =
            stripHtml(richOverride?.excerpt) ||
            stripHtml(product.excerpt) ||
            stripHtml((product as any).short_description) ||
            stripHtml(product.metaDescription) ||
            stripHtml(richOverride?.metaDescription);

          if (!rawShortDesc) return null;

          const shortDesc = rawShortDesc.length > MAX_CARD_DESC_CHARS
            ? `${rawShortDesc.slice(0, MAX_CARD_DESC_CHARS).trim()}...`
            : rawShortDesc;

          return (
            <div 
              onClick={() => onOpenDetails(product)}
              className="mb-2 cursor-pointer group/desc"
            >
              <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug group-hover/desc:text-slate-900 transition-colors line-clamp-1 break-words bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
                {shortDesc}
              </p>
            </div>
          );
        })()}

        {/* Compact Pricing Grid (Carton / Box / Pack) */}
        <div className="space-y-1 mb-2">
          {(showCarton || showBox) && (
            <div className={`grid ${showCarton && showBox ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
              {showCarton && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-2 py-1.5 flex flex-col justify-between min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-bold text-blue-900 flex items-center gap-1 whitespace-nowrap">
                    <Package className="w-2.5 h-2.5 text-blue-700 shrink-0" />
                    <span className="truncate">کارتن ({formatNumberFa(product.boxesPerCarton || 50)} باکس)</span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-black text-blue-950 mt-0.5 font-mono whitespace-nowrap truncate">
                    {formatToman(product.cartonPrice)}
                  </div>
                </div>
              )}

              {showBox && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 flex flex-col justify-between min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-700 flex items-center gap-1 whitespace-nowrap">
                    <Boxes className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                    <span className="truncate">باکس ({formatNumberFa(product.packsPerBox || 10)} پاکت)</span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-black text-slate-900 mt-0.5 font-mono whitespace-nowrap truncate">
                    {formatToman(product.boxPrice)}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {showPack && (
              <div className="flex-1 bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-2.5 py-1 flex items-center justify-between gap-1.5 min-w-0">
                <span className="text-[10px] font-bold text-emerald-900 whitespace-nowrap truncate">
                  هر {product.unitName || 'پاکت'}:
                </span>
                <span className="text-[11px] font-black text-emerald-950 font-mono whitespace-nowrap shrink-0">
                  {formatToman(effectivePackPrice)}
                </span>
              </div>
            )}

            {product.tierDiscounts && product.tierDiscounts.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenDetails(product)}
                className={`px-2 py-1 rounded-xl border text-[10px] font-bold flex items-center justify-between gap-1 transition-colors cursor-pointer shrink-0 ${
                  (cartonDiscountPercent > 0 || boxDiscountPercent > 0 || packDiscountPercent > 0)
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-blue-600'
                } ${!showPack ? 'w-full' : ''}`}
              >
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <TrendingDown className="w-3 h-3 shrink-0" />
                  {(cartonDiscountPercent > 0 || boxDiscountPercent > 0 || packDiscountPercent > 0)
                    ? `تخفیف ${formatNumberFa(Math.max(cartonDiscountPercent, boxDiscountPercent, packDiscountPercent))}٪`
                    : 'جدول تخفیف تیراژ'}
                </span>
                {!showPack && <span className="text-[9px] underline">مشاهده</span>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Compact Order Steppers or Out of Stock Notice */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5">
        {!stockInfo.isAvailable ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-center">
            <p className="text-[11px] font-black text-rose-700 whitespace-nowrap">اتمام موجودی در انبار مرکزی</p>
          </div>
        ) : (
          <>
            {/* Carton Row */}
            {showCarton && (
              <div className="flex items-center justify-between gap-1 bg-blue-50/40 border border-blue-100 rounded-xl px-2 py-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-black text-blue-950 whitespace-nowrap shrink-0">
                    کارتن{moqCarton > 1 ? ` (حداقل ${formatNumberFa(moqCarton)})` : ''}:
                  </span>
                  <div className="flex items-center bg-white border border-blue-200 rounded-lg p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMoqWarning(null);
                        setCartonQty(q => (q < minStepCarton ? minStepCarton : q + 1));
                      }}
                      className="w-5 h-5 rounded-md bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-900 flex items-center justify-center font-bold text-[10px] transition-colors shrink-0 cursor-pointer"
                      title="افزایش کارتن"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-5 sm:w-6 text-center font-bold text-[11px] text-slate-900 font-mono shrink-0">
                      {formatNumberFa(cartonQty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (cartonQty > minStepCarton) {
                          setCartonQty(q => q - 1);
                        } else if (cartonQty > 0) {
                          setCartonQty(0);
                        }
                      }}
                      className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] transition-colors shrink-0 cursor-pointer"
                      title="کاهش کارتن"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCarton}
                  className={`px-2.5 py-1 rounded-lg font-black text-[10px] flex items-center justify-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    cartonJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {cartonJustAdded ? (
                    <>
                      <Check className="w-3 h-3 shrink-0" />
                      <span>ثبت شد</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-2.5 h-2.5 shrink-0" />
                      <span>+ کارتن</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Box Row */}
            {showBox && (
              <div className="flex items-center justify-between gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-black text-slate-800 whitespace-nowrap shrink-0">
                    باکس{moqBox > 1 ? ` (حداقل ${formatNumberFa(moqBox)})` : ''}:
                  </span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMoqWarning(null);
                        setBoxQty(q => (q < minStepBox ? minStepBox : q + 1));
                      }}
                      className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-900 flex items-center justify-center font-bold text-[10px] transition-colors shrink-0 cursor-pointer"
                      title="افزایش باکس"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-5 sm:w-6 text-center font-bold text-[11px] text-slate-900 font-mono shrink-0">
                      {formatNumberFa(boxQty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (boxQty > minStepBox) {
                          setBoxQty(q => q - 1);
                        } else if (boxQty > 0) {
                          setBoxQty(0);
                        }
                      }}
                      className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] transition-colors shrink-0 cursor-pointer"
                      title="کاهش باکس"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddBox}
                  className={`px-2.5 py-1 rounded-lg font-black text-[10px] flex items-center justify-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    boxJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-900 text-white'
                  }`}
                >
                  {boxJustAdded ? (
                    <>
                      <Check className="w-3 h-3 shrink-0" />
                      <span>ثبت شد</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-2.5 h-2.5 shrink-0" />
                      <span>+ باکس</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Pack Row */}
            {showPack && (
              <div className="flex items-center justify-between gap-1 bg-emerald-50/50 border border-emerald-200 rounded-xl px-2 py-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-black text-emerald-950 whitespace-nowrap shrink-0">
                    پاکت{moqPack > 1 ? ` (حداقل ${formatNumberFa(moqPack)})` : ''}:
                  </span>
                  <div className="flex items-center bg-white border border-emerald-200 rounded-lg p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMoqWarning(null);
                        setPackQty(q => (q < minStepPack ? minStepPack : q + 1));
                      }}
                      className="w-5 h-5 rounded-md bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-900 flex items-center justify-center font-bold text-[10px] transition-colors shrink-0 cursor-pointer"
                      title="افزایش پاکت"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-5 sm:w-6 text-center font-bold text-[11px] text-slate-900 font-mono shrink-0">
                      {formatNumberFa(packQty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (packQty > minStepPack) {
                          setPackQty(q => q - 1);
                        } else if (packQty > 0) {
                          setPackQty(0);
                        }
                      }}
                      className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px] transition-colors shrink-0 cursor-pointer"
                      title="کاهش پاکت"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddPack}
                  className={`px-2.5 py-1 rounded-lg font-black text-[10px] flex items-center justify-center gap-1 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    packJustAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {packJustAdded ? (
                    <>
                      <Check className="w-3 h-3 shrink-0" />
                      <span>ثبت شد</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-2.5 h-2.5 shrink-0" />
                      <span>+ پاکت</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {moqWarning && (
              <div className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-[10px] font-bold text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                <span>{moqWarning}</span>
              </div>
            )}

            {/* Combined Quick Order Button (If 2 or more units selected) */}
            {activeSelectedUnitsCount >= 2 && (
              <button
                type="button"
                onClick={handleAddBoth}
                className={`w-full py-1.5 px-2 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer ${
                  bothJustAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 hover:bg-blue-600 text-white'
                }`}
              >
                {bothJustAdded ? (
                  <>
                    <Check className="w-3 h-3 shrink-0" />
                    <span>ثبت همزمان انجام شد</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3 text-blue-400 shrink-0" />
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

