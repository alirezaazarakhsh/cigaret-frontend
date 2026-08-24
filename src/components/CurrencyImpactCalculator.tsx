import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Sliders, 
  Info, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Activity, 
  Play, 
  Pause, 
  Zap, 
  RotateCcw 
} from 'lucide-react';
import { CigaretteProduct, LiveDollarMarket } from '../types';
import { formatToman, formatNumberFa } from '../utils/formatters';
import { INITIAL_DOLLAR_MARKET } from '../utils/pricingEngine';

interface CurrencyImpactCalculatorProps {
  products: CigaretteProduct[];
  dollarMarket?: LiveDollarMarket;
  onUpdateDollarMarket?: (market: LiveDollarMarket) => void;
  onApplyManualDollar?: (rate: number) => void;
  onResetBaseRates?: () => void;
  onApplyNewRates?: (products: CigaretteProduct[]) => void;
}

export const CurrencyImpactCalculator: React.FC<CurrencyImpactCalculatorProps> = ({
  products = [],
  dollarMarket = INITIAL_DOLLAR_MARKET,
  onUpdateDollarMarket,
  onApplyManualDollar,
  onResetBaseRates,
  onApplyNewRates,
}) => {
  const currentMarket: LiveDollarMarket = {
    ...INITIAL_DOLLAR_MARKET,
    ...(dollarMarket || {}),
  };

  const [simulatedDollar, setSimulatedDollar] = useState<number>(currentMarket.usdTehran || 92500);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'international' | 'domestic' | 'iqos_heets'>('all');
  const [appliedNotice, setAppliedNotice] = useState(false);

  useEffect(() => {
    if (dollarMarket?.usdTehran) {
      setSimulatedDollar(dollarMarket.usdTehran);
    }
  }, [dollarMarket?.usdTehran]);

  const baseRate = currentMarket.baseMarketRate || 92500;
  // Percentage change from base market rate
  const usdPercentChange = ((simulatedDollar - baseRate) / baseRate) * 100;

  const handleToggleAutoUpdate = () => {
    if (onUpdateDollarMarket) {
      onUpdateDollarMarket({
        ...currentMarket,
        isAutoUpdating: !currentMarket.isAutoUpdating,
      });
    }
  };

  const handleTogglePricingMode = (mode: 'fixed' | 'dynamic_dollar') => {
    if (onUpdateDollarMarket) {
      onUpdateDollarMarket({
        ...currentMarket,
        pricingMode: mode,
      });
    }
  };

  const handleSimulateChange = (newVal: number) => {
    setSimulatedDollar(newVal);
  };

  const handleApplySimulatedRate = () => {
    if (onApplyManualDollar) {
      onApplyManualDollar(simulatedDollar);
    }
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 3000);
  };

  const calculateItemProjection = (product: CigaretteProduct) => {
    const baseCarton = product.baseCartonPrice || product.cartonPrice;
    const baseBox = product.baseBoxPrice || product.boxPrice;

    const ratio = 1 + ((simulatedDollar - baseRate) / baseRate);
    const projectedCarton = Math.round((baseCarton * ratio) / 100000) * 100000;
    const projectedBox = Math.round((baseBox * ratio) / 10000) * 10000;
    const diffCarton = projectedCarton - product.cartonPrice;

    return {
      projectedCarton,
      projectedBox,
      diffCarton,
      sensitivityPercent: 100,
    };
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategoryFilter === 'all') return true;
    return p.category === selectedCategoryFilter;
  });

  const displayTether = currentMarket.tetherUsdt || currentMarket.tetherUSDT || (currentMarket.usdTehran + 600);
  const displayLastUpdate = currentMarket.lastUpdate || currentMarket.lastTickTime || 'هم‌اکنون';
  const changePercent = currentMarket.changePercent24h ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200" id="currency-simulator-section">
      
      {/* Header & Live Market Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                موتور هوشمند قیمت‌گذاری و نوسان ارز زنده (دلار و درهم)
              </h2>
              <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                سیستم نوسان زنده هر ۶۰ ثانیه
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              محاسبه و شبیه‌سازی خودکار نرخ کارتن و باکس سیگار متناسب با نوسانات بازار آزاد و ضریب حساسیت هر کالا
            </p>
          </div>
        </div>

        {/* Pricing Mode Toggle: Fixed vs Dynamic */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => handleTogglePricingMode('dynamic_dollar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              currentMarket.pricingMode === 'dynamic_dollar'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            قیمت‌گذاری زنده (متصل به دلار)
          </button>

          <button
            onClick={() => handleTogglePricingMode('fixed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              currentMarket.pricingMode === 'fixed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            نرخ پایه ثابت انبار سوین
          </button>
        </div>
      </div>

      {/* Live Foreign Exchange Tickers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Tehran Free Market USD */}
        <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-xs text-blue-900 font-bold">
            <span>دلار آزاد تهران (سبزه میدان)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div className="text-lg sm:text-xl font-black text-blue-950" dir="ltr">
            {formatNumberFa(currentMarket.usdTehran)} <span className="text-xs font-bold text-blue-700">تومان</span>
          </div>
          <div className="text-[10px] text-blue-700 font-medium">
            تغییر ۲۴ساعته: {changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`}
          </div>
        </div>

        {/* Herat USD */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5">
          <div className="text-xs text-slate-600 font-bold">دلار هرات</div>
          <div className="text-lg sm:text-xl font-black text-slate-900" dir="ltr">
            {formatNumberFa(currentMarket.usdHerat)} <span className="text-xs font-bold text-slate-500">تومان</span>
          </div>
          <div className="text-[10px] text-slate-500">نقطه ورود بارهای مرزی</div>
        </div>

        {/* Tether USDT */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl space-y-1.5">
          <div className="text-xs text-emerald-900 font-bold">تتر دیجیتال (USDT)</div>
          <div className="text-lg sm:text-xl font-black text-emerald-950" dir="ltr">
            {formatNumberFa(displayTether)} <span className="text-xs font-bold text-emerald-700">تومان</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">تسویه حواله‌های بین‌المللی</div>
        </div>

        {/* UAE Dirham */}
        <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl space-y-1.5">
          <div className="text-xs text-amber-900 font-bold">حواله درهم امارات (دبی)</div>
          <div className="text-lg sm:text-xl font-black text-amber-950" dir="ltr">
            {formatNumberFa(currentMarket.uaeDirham)} <span className="text-xs font-bold text-amber-700">تومان</span>
          </div>
          <div className="text-[10px] text-amber-700 font-medium">مبنای واردات سیگار سوئیس/دبی</div>
        </div>

      </div>

      {/* Auto-Update Control Strip */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAutoUpdate}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              currentMarket.isAutoUpdating 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {currentMarket.isAutoUpdating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {currentMarket.isAutoUpdating ? 'نوسان خودکار فعال است' : 'نوسان خودکار متوقف است'}
          </button>

          <span className="text-slate-400 text-[11px]">
            آخرین تیک بازار: <strong className="text-slate-200">{displayLastUpdate}</strong> (بروزرسانی هر ۶۰ ثانیه)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onResetBaseRates && (
            <button
              onClick={onResetBaseRates}
              className="text-slate-400 hover:text-white text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              بازنشانی نرخ‌های پایه
            </button>
          )}
        </div>
      </div>

      {/* Interactive Simulation & Adjustment Slider */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              شبیه‌ساز دستی نوسان دلار توسط کاربر / مدیر فروش
            </h3>
            <p className="text-xs text-slate-500">
              با تغییر اسلایدر یا وارد کردن رقم دلخواه، اثر آنی را روی کارتن‌ها مشاهده و در صورت تمایل روی کل کاتالوگ ثبت کنید:
            </p>
          </div>

          <button
            onClick={handleApplySimulatedRate}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            {appliedNotice ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                روی کاتالوگ اعمال شد!
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                اعمال قطعی این نرخ روی تمام کاتالوگ
              </>
            )}
          </button>
        </div>

        {/* Sliders & Numeric Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700">نرخ دلار شبیه‌سازی شده (تومان):</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="500"
                value={simulatedDollar}
                onChange={(e) => handleSimulateChange(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-black text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-500 font-bold">تومان</span>
            </div>
            
            {/* Quick preset buttons */}
            <div className="flex items-center gap-1 pt-1 flex-wrap">
              <button 
                onClick={() => handleSimulateChange(simulatedDollar + 1000)}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold"
              >
                +۱,۰۰۰ ت
              </button>
              <button 
                onClick={() => handleSimulateChange(simulatedDollar - 1000)}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold"
              >
                -۱,۰۰۰ ت
              </button>
              <button 
                onClick={() => handleSimulateChange(Math.round(simulatedDollar * 1.05))}
                className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded-lg font-bold"
              >
                +۵٪ جهش
              </button>
              <button 
                onClick={() => handleSimulateChange(baseRate)}
                className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-1 rounded-lg font-bold"
              >
                ریست به پایه
              </button>
            </div>
          </div>

          {/* Slider Range */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 md:col-span-2 flex flex-col justify-center">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">تنظیم سریع با اسلایدر نوسان:</span>
              <strong className={`font-black ${usdPercentChange > 0 ? 'text-rose-600' : usdPercentChange < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                {usdPercentChange > 0 ? `+${usdPercentChange.toFixed(1)}% افزایش` : `${usdPercentChange.toFixed(1)}% نوسان`}
              </strong>
            </div>

            <input
              type="range"
              min="85000"
              max="115000"
              step="500"
              value={simulatedDollar}
              onChange={(e) => handleSimulateChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>۸۵,۰۰۰ تومان</span>
              <span>مبنا: {formatNumberFa(baseRate)}</span>
              <span>۱۱۵,۰۰۰ تومان</span>
            </div>
          </div>

        </div>
      </div>

      {/* Category Filter Pills for Projection Table */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-bold">فیلتر جدول:</span>
          {(['all', 'international', 'domestic', 'iqos_heets'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' && 'همه اقلام'}
              {cat === 'international' && 'وارداتی اصل'}
              {cat === 'domestic' && 'تولید داخل'}
              {cat === 'iqos_heets' && 'استیک‌های IQOS'}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          تعداد کالاها: <strong className="text-slate-900">{formatNumberFa(filteredProducts.length)}</strong>
        </div>
      </div>

      {/* Projected Products Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">نام کالا و مارک</th>
              <th className="p-3.5 text-center">ضریب حساسیت به دلار</th>
              <th className="p-3.5 text-left">نرخ فعلی کارتن</th>
              <th className="p-3.5 text-left text-blue-700">نرخ کارتن با دلار جدید</th>
              <th className="p-3.5 text-left">تغییر هر کارتن</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(p => {
              const { projectedCarton, diffCarton, sensitivityPercent } = calculateItemProjection(p);
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{p.nameFa}</div>
                    <div className="text-[11px] text-slate-400">{p.brand} - {p.origin}</div>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                      sensitivityPercent >= 90 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {formatNumberFa(sensitivityPercent)}٪ حساسیت
                    </span>
                  </td>

                  <td className="p-3.5 text-left font-medium text-slate-600">
                    {formatToman(p.cartonPrice)}
                  </td>

                  <td className="p-3.5 text-left font-black text-blue-700 text-sm">
                    {formatToman(projectedCarton)}
                  </td>

                  <td className="p-3.5 text-left">
                    <span className={`font-black flex items-center justify-end gap-1 ${
                      diffCarton > 0 ? 'text-rose-600' : diffCarton < 0 ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {diffCarton > 0 && <ArrowUpRight className="w-3.5 h-3.5" />}
                      {diffCarton < 0 && <ArrowDownRight className="w-3.5 h-3.5" />}
                      {diffCarton !== 0 ? formatToman(Math.abs(diffCarton)) : 'بدون تغییر'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
