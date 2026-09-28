import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  FileText
} from 'lucide-react';
import { CigaretteProduct } from '../types';
import { formatToman, formatNumberFa, getApplicableDiscount, getProductStockInfo } from '../utils/formatters';
import { productsApi } from '../services/api';
import { getProductRichOverride } from '../services/djangoApi';

interface ProductModalProps {
  product: CigaretteProduct | null;
  onClose: () => void;
  onAddToCart: (product: CigaretteProduct, unit: 'carton' | 'box' | 'pack', quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product: initialProduct,
  onClose,
  onAddToCart,
}) => {
  const [detailedProduct, setDetailedProduct] = useState<CigaretteProduct | null>(initialProduct);

  useEffect(() => {
    setDetailedProduct(initialProduct);
    setCurrentImageIndex(0);
    if (initialProduct?.id) {
      let isMounted = true;
      productsApi.getById(initialProduct.id).then((fresh) => {
        if (isMounted && fresh) {
          setDetailedProduct((prev) => {
            if (!prev) return fresh;
            const override = getProductRichOverride(initialProduct.id);
            const preservedMainImage =
              (override?.image && override.image.trim() !== '')
                ? override.image
                : (prev.image && prev.image.trim() !== '' ? prev.image : fresh.image);
            const mergedImages = (override?.images && Array.isArray(override.images))
              ? override.images
              : ((fresh.images && fresh.images.length > 0)
                ? fresh.images
                : (prev.images && prev.images.length > 0 ? prev.images : []));
            const mergedFeatures = (fresh.appliedFeatures && fresh.appliedFeatures.length > 0)
              ? fresh.appliedFeatures
              : (prev.appliedFeatures || []);
            return {
              ...prev,
              ...fresh,
              image: preservedMainImage || fresh.image || prev.image || '',
              excerpt: fresh.excerpt || prev.excerpt || '',
              description: fresh.description || prev.description || '',
              moq: Math.max(Number(prev.moq) || 0, Number(fresh.moq) || 0),
              moqBox: Math.max(Number(prev.moqBox) || 0, Number(fresh.moqBox) || 0),
              moqPack: Math.max(Number(prev.moqPack) || 0, Number(fresh.moqPack) || 0),
              images: mergedImages,
              appliedFeatures: mergedFeatures,
            };
          });
        }
      }).catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [initialProduct]);

  const product = detailedProduct || initialProduct;
  const richOverride = product ? getProductRichOverride(product.id) : null;

  const isDrink = product?.category === 'drinks_coffee';
  const showCarton = !isDrink && product?.hasCarton !== false && !product?.isBoxOnly;
  const showBox = !isDrink && (product?.hasBox !== false || product?.isBoxOnly === true);
  const showPack = Boolean(product?.hasPack) || isDrink || (!showCarton && !showBox);

  const moqCarton = Math.max(0, Number(richOverride?.moq ?? product?.moq ?? (product as any)?.min_order_carton ?? 0));
  const moqBox = Math.max(0, Number(richOverride?.moqBox ?? product?.moqBox ?? (product as any)?.min_order_box ?? 0));
  const moqPack = Math.max(0, Number(richOverride?.moqPack ?? product?.moqPack ?? (product as any)?.min_order_pack ?? 0));
  const minStepCarton = Math.max(1, moqCarton);
  const minStepBox = Math.max(1, moqBox);
  const minStepPack = Math.max(1, moqPack);

  const [cartonQty, setCartonQty] = useState<number>(0);
  const [boxQty, setBoxQty] = useState<number>(0);
  const [packQty, setPackQty] = useState<number>(0);
  const [added, setAdded] = useState(false);
  const [moqError, setMoqError] = useState<string | null>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  if (!product) return null;

  const primaryFeaturedImage = (richOverride?.image && richOverride.image.trim() !== '')
    ? richOverride.image
    : product.image;

  const rawImagesList = [
    primaryFeaturedImage,
    ...(Array.isArray(richOverride?.images) ? richOverride.images : (Array.isArray(product.images) ? product.images : [])),
  ].filter((img): img is string => Boolean(img && typeof img === 'string' && img.trim() !== ''));
  const images = rawImagesList.length > 0 ? Array.from(new Set(rawImagesList)) : [primaryFeaturedImage || product.image];

  const stockInfo = getProductStockInfo(product);

  const packsPerBoxVal = product.packsPerBox || 10;
  const effectivePackPrice = (product.packPrice && product.packPrice > 0)
    ? product.packPrice
    : (product.boxPrice > 0 ? Math.round(product.boxPrice / packsPerBoxVal) : (product.pricePerUnit || 0));

  const cartonTotalRaw = product.cartonPrice * cartonQty;
  const cartonDiscountPercent = getApplicableDiscount('carton', cartonQty, product.tierDiscounts);
  const cartonDiscountVal = (cartonTotalRaw * cartonDiscountPercent) / 100;
  const cartonTotalFinal = cartonTotalRaw - cartonDiscountVal;

  const boxTotalRaw = product.boxPrice * boxQty;
  const boxDiscountPercent = getApplicableDiscount('box', boxQty, product.tierDiscounts);
  const boxDiscountVal = (boxTotalRaw * boxDiscountPercent) / 100;
  const boxTotalFinal = boxTotalRaw - boxDiscountVal;

  const packTotalRaw = effectivePackPrice * packQty;
  const packDiscountPercent = getApplicableDiscount('pack', packQty, product.tierDiscounts);
  const packDiscountVal = (packTotalRaw * packDiscountPercent) / 100;
  const packTotalFinal = packTotalRaw - packDiscountVal;

  const grandTotal =
    (showCarton && cartonQty > 0 ? cartonTotalFinal : 0) +
    (showBox && boxQty > 0 ? boxTotalFinal : 0) +
    (showPack && packQty > 0 ? packTotalFinal : 0);

  const handleAdd = () => {
    setMoqError(null);
    if (showCarton && cartonQty > 0 && moqCarton > 0 && cartonQty < moqCarton) {
      setMoqError(`حداقل سفارش کارتن برای این محصول ${formatNumberFa(moqCarton)} کارتن است.`);
      setCartonQty(moqCarton);
      return;
    }
    if (showBox && boxQty > 0 && moqBox > 0 && boxQty < moqBox) {
      setMoqError(`حداقل سفارش باکس برای این محصول ${formatNumberFa(moqBox)} باکس است.`);
      setBoxQty(moqBox);
      return;
    }
    if (showPack && packQty > 0 && moqPack > 0 && packQty < moqPack) {
      setMoqError(`حداقل سفارش پاکت برای این محصول ${formatNumberFa(moqPack)} پاکت است.`);
      setPackQty(moqPack);
      return;
    }
    if (
      (!showCarton || cartonQty === 0) &&
      (!showBox || boxQty === 0) &&
      (!showPack || packQty === 0)
    ) {
      if (showCarton) {
        setCartonQty(minStepCarton);
      } else if (showBox) {
        setBoxQty(minStepBox);
      } else if (showPack) {
        setPackQty(minStepPack);
      }
      return;
    }

    let hasAdded = false;
    if (showCarton && cartonQty > 0 && cartonQty >= moqCarton) {
      onAddToCart(product, 'carton', cartonQty);
      hasAdded = true;
    }
    if (showBox && boxQty > 0 && boxQty >= moqBox) {
      onAddToCart(product, 'box', boxQty);
      hasAdded = true;
    }
    if (showPack && packQty > 0 && packQty >= moqPack) {
      onAddToCart(product, 'pack', packQty);
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

  // Build unified feature items from Image 5 (appliedFeatures) + standard fields for Image 6
  const featureItems: { id: string; label: string; value: string; unit?: string; isCustom?: boolean }[] = [];
  const addedFeatureKeys = new Set<string>();

  const pushFeature = (key: string, label: string, val?: string | number | null, unit?: string, isCustom?: boolean) => {
    if (val === undefined || val === null) return;
    const strVal = String(val).trim();
    if (!strVal || strVal === '—' || strVal === '-' || strVal === 'ندارد') return;
    const normKey = key.toLowerCase().trim();
    if (addedFeatureKeys.has(normKey)) return;
    addedFeatureKeys.add(normKey);
    featureItems.push({ id: key, label, value: strVal, unit, isCustom });
  };

  if (product.brand) pushFeature('brand', 'برند', product.brand);

  // First prioritize all features explicitly added in ProductEditorPage (Image 5 -> Image 6)
  const rawAppliedFeatures = (product.appliedFeatures && product.appliedFeatures.length > 0)
    ? product.appliedFeatures
    : (richOverride?.appliedFeatures || []);

  rawAppliedFeatures.forEach((af: any, idx: number) => {
    const fId = String(af.featureId || af.id || `custom-${idx}`);
    const fName = String(af.nameFa || af.name || '').trim();
    const fVal = String(af.value ?? '').trim();
    if (!fName || !fVal) return;

    if (fId === 'feat-origin' || fName.includes('کشور سازنده') || fName.includes('مبدأ')) {
      pushFeature('origin', fName, fVal, af.unit, true);
    } else if (fId === 'feat-tar' || fName.includes('قطران')) {
      pushFeature('tar', fName, fVal, af.unit, true);
    } else if (fId === 'feat-nicotine' || fName.includes('نیکوتین')) {
      pushFeature('nicotine', fName, fVal, af.unit, true);
    } else if (fId === 'feat-format' || fName.includes('فرمت') || fName.includes('سایز')) {
      pushFeature('packSize', fName, fVal, af.unit, true);
    } else if (fId === 'feat-flavor' || fName.includes('طعم')) {
      pushFeature('flavor', fName, fVal, af.unit, true);
    } else if (fId === 'feat-filter' || fName.includes('فیلتر')) {
      pushFeature('filterType', fName, fVal, af.unit, true);
    } else {
      pushFeature(`af-${fId}-${idx}`, fName, fVal, af.unit, true);
    }
  });

  // Fallback to standard product properties if not already provided via appliedFeatures
  if (product.origin) pushFeature('origin', 'کشور تولید کننده', product.origin);
  if (product.packSize || product.cigaretteSize) pushFeature('packSize', 'فرمت و سایز پاکت', product.packSize || product.cigaretteSize);
  if (product.flavor) pushFeature('flavor', 'طعم و اسانس', product.flavor);
  if (product.filterType) pushFeature('filterType', 'نوع فیلتر', product.filterType);
  if (product.packagingType) pushFeature('packagingType', 'نوع بسته‌بندی', product.packagingType);
  if (product.manufacturer) pushFeature('manufacturer', 'شرکت سازنده', product.manufacturer);
  if (product.tar) pushFeature('tar', 'قطران (Tar)', product.tar);
  if (product.nicotine) pushFeature('nicotine', 'نیکوتین (Nicotine)', product.nicotine);
  if (showCarton && product.boxesPerCarton) {
    pushFeature('boxesPerCarton', 'تعداد در هر کارتن', `${formatNumberFa(product.boxesPerCarton)} باکس`);
  }
  if (showPack && product.packsPerBox) {
    pushFeature('packsPerBox', 'تعداد پاکت در هر باکس', `${formatNumberFa(product.packsPerBox)} پاکت`);
  }

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
          <div className="shrink-0 space-y-2">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm cursor-pointer relative" onClick={() => setIsImageExpanded(true)}>
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={images[currentImageIndex] || product.image} 
                  alt={product.nameFa} 
                  className="w-full h-full object-cover" 
                />
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-0.5 rounded-full shadow-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => (i - 1 + images.length) % images.length); }}>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-0.5 rounded-full shadow-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => (i + 1) % images.length); }}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[140px] pb-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-8 h-8 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      idx === currentImageIndex
                        ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
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
              {product.isFeatured ? (
                <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  پیشنهاد ویژه
                </span>
              ) : (product.tierDiscounts && product.tierDiscounts.length > 0) ? (
                <span className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-rose-600" />
                  تخفیف ویژه
                </span>
              ) : null}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight mt-2">
              {product.nameFa}
            </h2>
            <p className="text-xs text-slate-500 font-mono tracking-tight" dir="ltr">
              {product.nameEn}
            </p>
            {(() => {
              const rawHeaderExcerpt = (
                richOverride?.excerpt ||
                product.excerpt ||
                (product as any).short_description ||
                ''
              );
              const headerExcerpt = rawHeaderExcerpt
                .replace(/<[^>]*>/g, ' ')
                .replace(/&amp;nbsp;/gi, ' ')
                .replace(/&nbsp;/gi, ' ')
                .replace(/\u00A0/g, ' ')
                .replace(/&zwnj;/gi, '\u200c')
                .replace(/&quot;/gi, '"')
                .replace(/&#39;/gi, "'")
                .replace(/&amp;/gi, '&')
                .replace(/\s+/g, ' ')
                .trim();
              if (!headerExcerpt) return null;
              return (
                <div className="mt-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 leading-relaxed">
                  <div className="flex items-center gap-1 font-bold text-blue-900 mb-0.5 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>خلاصه محصول:</span>
                  </div>
                  <p className="whitespace-pre-line break-words leading-relaxed text-slate-700">
                    {headerExcerpt}
                  </p>
                </div>
              );
            })()}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                !stockInfo.isOutOfStock
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                موجودی انبار: {stockInfo.displayText}
              </span>
            </div>
          </div>
        </div>

        {/* Full Rich Description (نقد و بررسی و توضیحات جامع محصول - TinyMCE) */}
        {(() => {
          const normalizeHtmlSpaces = (val: string) =>
            val
              .replace(/&amp;nbsp;/gi, ' ')
              .replace(/&nbsp;/gi, ' ')
              .replace(/\u00A0/g, ' ')
              .replace(/&zwnj;/gi, '\u200c')
              .trim();

          const rawFullDesc = normalizeHtmlSpaces(
            richOverride?.description ||
            product.description ||
            (product as any).full_description ||
            ''
          );
          const rawExcerpt = normalizeHtmlSpaces(
            richOverride?.excerpt ||
            product.excerpt ||
            (product as any).short_description ||
            ''
          );

          const fullText = rawFullDesc || rawExcerpt;
          const hasHtmlTags = /<[a-z][\s\S]*>/i.test(fullText);
          const plainDecodedText = !hasHtmlTags
            ? fullText
                .replace(/&quot;/gi, '"')
                .replace(/&#39;/gi, "'")
                .replace(/&lt;/gi, '<')
                .replace(/&gt;/gi, '>')
                .replace(/&amp;/gi, '&')
            : fullText;

          if (!fullText && (!product.keyTakeaways || product.keyTakeaways.length === 0)) {
            return null;
          }

          return (
            <div className="mb-5 space-y-3 mt-4">
              {/* Full Introduction & Review (TinyMCE) in Scrollable Box */}
              {fullText && (
                <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800 border-b border-slate-200/80 pb-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>نقد و بررسی و توضیحات جامع محصول:</span>
                  </div>
                  <div
                    className="max-h-48 sm:max-h-60 overflow-y-auto overscroll-contain pl-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify font-normal break-words"
                    style={{ overscrollBehavior: 'contain' }}
                  >
                    {hasHtmlTags ? (
                      <div
                        className="prose prose-sm max-w-none text-slate-700 leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: fullText }}
                      />
                    ) : (
                      <p className="whitespace-pre-line break-words leading-relaxed">
                        {plainDecodedText}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Key Takeaways / Highlights */}
              {product.keyTakeaways && product.keyTakeaways.length > 0 && (
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>نکات کلیدی و ویژگی‌های برجسته کالا:</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                    {product.keyTakeaways.map((kt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{kt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}

        {/* Product Technical Features & Specifications (Image 5 -> Image 6) */}
        {featureItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 text-xs">
            {featureItems.map((feat) => (
              <div
                key={feat.id}
                className={`p-3 rounded-xl border transition-colors ${
                  feat.isCustom
                    ? 'bg-blue-50/50 border-blue-200/80'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[11px] text-slate-500 block mb-0.5">{feat.label}:</span>
                <span className="font-bold text-slate-900">
                  {feat.value}{' '}
                  {feat.unit ? (
                    <span className="font-mono text-[11px] text-blue-700 font-semibold" dir="ltr">
                      {feat.unit}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Discount Tier Table (Carton & Box & Pack) */}
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
                const isPack = tier.unit === 'pack' || (!tier.unit && tier.label?.includes('پاکت'));
                const isBox = tier.unit === 'box' || (!tier.unit && tier.label?.includes('باکس'));
                const minQty = tier.minQuantity ?? tier.minCartons ?? 1;
                const discountPct = tier.discountPercentage ?? tier.discountPercent ?? 0;
                const unitName = isPack ? 'پاکت' : isBox ? 'باکس' : 'کارتن';
                const isCurrentlyActive = isPack
                  ? (packQty >= minQty && minQty > 0)
                  : isBox
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
                        isPack ? 'bg-emerald-100 text-emerald-800' : isBox ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
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

        {/* Dynamic Ordering Steppers: Carton, Box, Pack (Images 7, 8, 9) */}
        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-800">
              انتخاب تعداد سفارش برای ثبت در پیش‌فاکتور:
            </div>
            <span className="text-[11px] font-bold text-slate-600">
              موجودی: {stockInfo.displayText}
            </span>
          </div>

          <div className={`grid grid-cols-1 ${
            [showCarton, showBox, showPack].filter(Boolean).length >= 3
              ? 'sm:grid-cols-3'
              : [showCarton, showBox, showPack].filter(Boolean).length === 2
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-1'
          } gap-3`}>
            {/* Carton selector */}
            {showCarton && (
              <div className="bg-white p-3 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    کارتن ({formatNumberFa(product.boxesPerCarton || 50)} باکسی)
                  </span>
                  <span className="text-xs font-black text-blue-700">{formatToman(product.cartonPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setMoqError(null);
                        setCartonQty(q => (q === 0 ? minStepCarton : q + 1));
                      }}
                      className="w-7 h-7 rounded-md bg-white hover:bg-blue-600 hover:text-white font-bold text-sm transition-colors flex items-center justify-center text-slate-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-slate-900">{formatNumberFa(cartonQty)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCartonQty(q => {
                          if (q <= 0) return 0;
                          if (q <= minStepCarton) {
                            setMoqError(null);
                            return 0;
                          }
                          setMoqError(null);
                          return q - 1;
                        });
                      }}
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
                  <span>حداقل سفارش مجاز:</span>
                  <span className="font-bold text-blue-700">
                    {formatNumberFa(moqCarton)} کارتن
                  </span>
                </div>
              </div>
            )}

            {/* Box selector */}
            {showBox && (
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-slate-600" />
                    باکس ({formatNumberFa(product.packsPerBox || 10)} پاکتی)
                  </span>
                  <span className="text-xs font-black text-slate-800">{formatToman(product.boxPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setMoqError(null);
                        setBoxQty(q => (q === 0 ? minStepBox : q + 1));
                      }}
                      className="w-7 h-7 rounded-md bg-white hover:bg-slate-800 hover:text-white font-bold text-sm transition-colors flex items-center justify-center text-slate-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-slate-900">{formatNumberFa(boxQty)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setBoxQty(q => {
                          if (q <= 0) return 0;
                          if (q <= minStepBox) {
                            setMoqError(null);
                            return 0;
                          }
                          setMoqError(null);
                          return q - 1;
                        });
                      }}
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
                  <span>حداقل سفارش مجاز:</span>
                  <span className="font-bold text-slate-700">
                    {formatNumberFa(moqBox)} باکس
                  </span>
                </div>
              </div>
            )}

            {/* Pack selector (Image 9 -> Image 7) */}
            {showPack && (
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    پاکت (تک‌فروشی)
                  </span>
                  <span className="text-xs font-black text-emerald-700">{formatToman(effectivePackPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setMoqError(null);
                        setPackQty(q => (q === 0 ? minStepPack : q + 1));
                      }}
                      className="w-7 h-7 rounded-md bg-white hover:bg-emerald-600 hover:text-white font-bold text-sm transition-colors flex items-center justify-center text-slate-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-slate-900">{formatNumberFa(packQty)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPackQty(q => {
                          if (q <= 0) return 0;
                          if (q <= minStepPack) {
                            setMoqError(null);
                            return 0;
                          }
                          setMoqError(null);
                          return q - 1;
                        });
                      }}
                      className="w-7 h-7 rounded-md bg-white hover:bg-slate-200 font-bold text-sm transition-colors flex items-center justify-center text-slate-800 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800">{formatToman(packTotalFinal)}</div>
                    {packDiscountPercent > 0 && (
                      <div className="text-[10px] text-emerald-600 font-bold">
                        ({formatNumberFa(packDiscountPercent)}٪ تخفیف)
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>حداقل سفارش مجاز:</span>
                  <span className="font-bold text-emerald-700">
                    {formatNumberFa(moqPack)} پاکت
                  </span>
                </div>
              </div>
            )}
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
            disabled={(showCarton ? cartonQty : 0) === 0 && (showBox ? boxQty : 0) === 0 && (showPack ? packQty : 0) === 0}
            className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer ${
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
                افزودن (
                {[
                  showCarton && cartonQty > 0 ? `${formatNumberFa(cartonQty)} کارتن` : null,
                  showBox && boxQty > 0 ? `${formatNumberFa(boxQty)} باکس` : null,
                  showPack && packQty > 0 ? `${formatNumberFa(packQty)} پاکت` : null,
                ].filter(Boolean).join(' + ') || '۰ واحد'}
                ) به پیش‌فاکتور
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
