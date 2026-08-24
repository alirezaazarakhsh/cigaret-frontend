import React, { useState } from 'react';
import { 
  Calculator as CalcIcon, 
  TrendingUp, 
  ShoppingCart, 
  Check, 
  Sparkles
} from 'lucide-react';
import { CigaretteProduct } from '../types';
import { formatToman, formatNumberFa, getApplicableDiscount } from '../utils/formatters';

interface CalculatorProps {
  products: CigaretteProduct[];
  onAddToCart: (product: CigaretteProduct, unit: 'carton' | 'box', quantity: number) => void;
  onOpenCart: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  products,
  onAddToCart,
  onOpenCart,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [cartonsCount, setCartonsCount] = useState<number>(5);
  const [retailMarginPercent, setRetailMarginPercent] = useState<number>(18);
  const [addedAll, setAddedAll] = useState(false);

  const product = products.find(p => p.id === selectedProductId) || products[0];

  if (!product) return null;

  const rawCartonTotal = product.cartonPrice * cartonsCount;
  const discountPercent = getApplicableDiscount('carton', cartonsCount, product.tierDiscounts);
  const discountAmount = (rawCartonTotal * discountPercent) / 100;
  const finalPurchasePrice = rawCartonTotal - discountAmount;

  // Retail calculations
  const totalPacks = cartonsCount * product.boxesPerCarton * product.packsPerBox;
  const suggestedRetailPackPrice = Math.round(product.packPrice * (1 + retailMarginPercent / 100) / 1000) * 1000;
  const totalRetailRevenue = totalPacks * suggestedRetailPackPrice;
  const totalEstimatedProfit = totalRetailRevenue - finalPurchasePrice;
  const costPerPack = Math.round(finalPurchasePrice / totalPacks);

  const handleAddDirect = () => {
    onAddToCart(product, 'carton', cartonsCount);
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="wholesale-calculator-section">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
            <CalcIcon className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              محاسبه‌گر سود و تخفیف تیراژ کارتن
            </h2>
            <p className="text-xs text-slate-500">
              بررسی فوری سود حاشیه فروش، تخفیف پلکانی کارتن و بهای تمام‌شده هر پاکت سیگار
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs column */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
          {/* Product selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              انتخاب محصول جهت محاسبه:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500 font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameFa} — {p.brand} ({formatToman(p.cartonPrice)})
                </option>
              ))}
            </select>
          </div>

          {/* Cartons Slider / Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                تعداد کارتن سفارشی:
              </label>
              <span className="text-base font-black text-amber-700 font-mono">
                {formatNumberFa(cartonsCount)} کارتن
                <span className="text-xs text-slate-500 font-normal mr-1.5">
                  ({formatNumberFa(totalPacks)} پاکت)
                </span>
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={cartonsCount}
              onChange={(e) => setCartonsCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>۱ کارتن (حداقل)</span>
              <span>۵ کارتن</span>
              <span>۱۰ کارتن (تخفیف ویژه)</span>
              <span>۲۰+ کارتن</span>
            </div>
          </div>

          {/* Target Retail Margin */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                درصد سود هدف در تک‌فروشی دکه/مغازه:
              </label>
              <span className="text-sm font-bold text-emerald-700 font-mono">
                {formatNumberFa(retailMarginPercent)}٪ سود
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={retailMarginPercent}
              onChange={(e) => setRetailMarginPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Tier discount overview for selected item */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              وضعیت تخفیف تیراژ برای {product.brand}:
            </div>
            {discountPercent > 0 ? (
              <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center justify-between font-bold">
                <span>تخفیف فعال شده برای {formatNumberFa(cartonsCount)} کارتن:</span>
                <span className="font-black text-sm">{formatNumberFa(discountPercent)}٪ تخفیف تجاری</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                با افزایش تعداد کارتن به ۳ یا ۵ کارتن، تخفیف پلکانی تا ۷٪ بر کل مبلغ فاکتور شما اعمال خواهد شد.
              </div>
            )}
          </div>
        </div>

        {/* Right Output Calculations Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
              نتایج تحلیل سود و بهای تمام‌شده خرید
            </h3>

            {/* Row 1: Gross & Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-1">مبلغ خام {cartonsCount} کارتن</div>
                <div className="text-xs font-bold text-slate-800 font-mono">
                  {formatToman(rawCartonTotal)}
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div className="text-[11px] text-emerald-800 mb-1">تخفیف تیراژ کسرشده</div>
                <div className="text-xs font-bold text-emerald-800 font-mono">
                  {discountAmount > 0 ? formatToman(discountAmount) : '—'}
                </div>
              </div>
            </div>

            {/* Row 2: Final Purchase Cost */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <div className="text-xs text-amber-800 font-bold mb-1">
                مبلغ نهایی قابل پرداخت برای {formatNumberFa(cartonsCount)} کارتن:
              </div>
              <div className="text-xl font-black text-amber-700 font-mono">
                {formatToman(finalPurchasePrice)}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                بهای تمام‌شده هر پاکت برای شما: <span className="text-slate-900 font-bold">{formatToman(costPerPack)}</span>
              </div>
            </div>

            {/* Row 3: Estimated Retail Sales & Profit */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">قیمت فروش پیشنهادی هر پاکت:</span>
                <span className="font-bold text-slate-900">{formatToman(suggestedRetailPackPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">کل درآمد حاصل از فروش تک‌فروشی:</span>
                <span className="font-bold text-slate-800">{formatToman(totalRetailRevenue)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  سود خالص تخمینی شما:
                </span>
                <span className="text-base font-black text-emerald-700 font-mono">
                  {formatToman(totalEstimatedProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Action button: add to invoice */}
          <div className="pt-4 mt-4 border-t border-slate-200 flex gap-2.5">
            <button
              onClick={handleAddDirect}
              className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                addedAll
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {addedAll ? (
                <>
                  <Check className="w-4 h-4" />
                  {formatNumberFa(cartonsCount)} کارتن به پیش‌فاکتور افزوده شد
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  ثبت همین تعداد در پیش‌فاکتور ({formatNumberFa(cartonsCount)} کارتن)
                </>
              )}
            </button>
            <button
              onClick={onOpenCart}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              مشاهده فاکتور
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
