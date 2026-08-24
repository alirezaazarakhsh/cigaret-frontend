import React, { useState } from 'react';
import { 
  Truck, 
  Clock, 
  CheckCircle2,
  MapPin,
  PhoneCall,
  Calculator,
  PackageCheck,
  Car,
  Warehouse,
  Sliders,
  ShieldCheck,
  Sparkles,
  Building2,
  FileCheck,
  Boxes
} from 'lucide-react';
import { DEFAULT_SHIPPING_OPTIONS } from '../data/shippingOptions';
import { formatToman, formatNumberFa } from '../utils/formatters';

interface ProvinceRate {
  province: string;
  city: string;
  fleetBasePrice: number;
  carrierBasePrice: number;
  perBoxAddon: number;
  estimatedDays: string;
}

const PROVINCE_RATES: ProvinceRate[] = [
  { province: 'تهران و البرز', city: 'تهران / کرج', fleetBasePrice: 250000, carrierBasePrice: 150000, perBoxAddon: 2000, estimatedDays: 'همان روز (۲ الی ۴ ساعت)' },
  { province: 'اصفهان', city: 'اصفهان / کاشان', fleetBasePrice: 450000, carrierBasePrice: 280000, perBoxAddon: 3500, estimatedDays: '۲۴ ساعت کاری' },
  { province: 'خراسان رضوی', city: 'مشهد / نیشابور', fleetBasePrice: 580000, carrierBasePrice: 350000, perBoxAddon: 4000, estimatedDays: '۲۴ الی ۴۸ ساعت' },
  { province: 'فارس', city: 'شیراز / جهرم', fleetBasePrice: 520000, carrierBasePrice: 320000, perBoxAddon: 3800, estimatedDays: '۲۴ الی ۴۸ ساعت' },
  { province: 'آذربایجان شرقی', city: 'تبریز / مراغه', fleetBasePrice: 490000, carrierBasePrice: 300000, perBoxAddon: 3600, estimatedDays: '۲۴ ساعت کاری' },
  { province: 'خوزستان', city: 'اهواز / دزفول', fleetBasePrice: 550000, carrierBasePrice: 340000, perBoxAddon: 4200, estimatedDays: '۲۴ الی ۴۸ ساعت' },
  { province: 'مازندران و گیلان', city: 'ساری / رشت', fleetBasePrice: 420000, carrierBasePrice: 260000, perBoxAddon: 3200, estimatedDays: '۲۴ ساعت کاری' },
  { province: 'کرمانشاه و همدان', city: 'کرمانشاه / همدان', fleetBasePrice: 460000, carrierBasePrice: 290000, perBoxAddon: 3500, estimatedDays: '۲۴ ساعت کاری' },
  { province: 'سیستان و بلوچستان', city: 'زاهدان / چابهار', fleetBasePrice: 650000, carrierBasePrice: 420000, perBoxAddon: 5000, estimatedDays: '۴۸ الی ۷۲ ساعت' },
  { province: 'سایر استان‌ها', city: 'مرکز استان', fleetBasePrice: 480000, carrierBasePrice: 300000, perBoxAddon: 3500, estimatedDays: '۲۴ الی ۴۸ ساعت' },
];

export const ShippingSection: React.FC = () => {
  const [cartonCount, setCartonCount] = useState<number>(3);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('اصفهان');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('freight-vatan');

  const activeOption = DEFAULT_SHIPPING_OPTIONS.find(o => o.id === selectedMethodId) || DEFAULT_SHIPPING_OPTIONS[0];
  const activeProvince = PROVINCE_RATES.find(p => p.province === selectedProvinceName) || PROVINCE_RATES[1];

  // Freight calculation based on boxes, province & shipping method
  const totalBoxes = cartonCount * 50; // 1 carton = 50 boxes
  
  const calculateFreightCost = () => {
    switch (selectedMethodId) {
      case 'warehouse-self-pickup':
        return 0; // Free self pickup at JanatAbad warehouse
      case 'tehran-courier-pickup':
        return activeProvince.fleetBasePrice + (totalBoxes * activeProvince.perBoxAddon);
      case 'freight-vatan':
        return activeProvince.carrierBasePrice + (totalBoxes * activeProvince.perBoxAddon);
      case 'freight-express-tipax':
        return Math.round(activeProvince.carrierBasePrice * 1.35) + (totalBoxes * activeProvince.perBoxAddon * 1.5);
      case 'bulk-truck-charter':
        return activeProvince.fleetBasePrice * 3.5;
      default:
        return activeProvince.carrierBasePrice + (totalBoxes * activeProvince.perBoxAddon);
    }
  };

  const calculatedFreight = calculateFreightCost();

  const getMethodIcon = (id: string) => {
    switch(id) {
      case 'freight-vatan':
        return <Truck className="w-5 h-5" />;
      case 'freight-express-tipax':
        return <PackageCheck className="w-5 h-5" />;
      case 'tehran-courier-pickup':
        return <Car className="w-5 h-5" />;
      case 'warehouse-self-pickup':
        return <Warehouse className="w-5 h-5" />;
      default:
        return <Sliders className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300" id="shipping-logistics-section">
      
      {/* Header Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black px-3 py-1 rounded-full backdrop-blur-xs">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                محاسبه‌گر آنلاین کرایه باربری و بیجک کارتن‌ها
              </span>
            </div>
            
            <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-snug text-white">
              خدمات انبارداری، بارگیری شورآباد و تحویل حضوری جنت‌آباد
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              محاسبه آنلاین کرایه باربری بر اساس روش ارسال انتخابی، استان مقصد و تعداد کارتن/بکس. کلیه مرسولات با بیجک رسمی باربری‌های شوش و پیامک سریع کد رهگیری ارسال می‌شوند.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <a
              href="tel:09120759419"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 border border-blue-400/30"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>ترابری و بارگیری: ۰۹۱۲۰۷۵۹۴۱۹</span>
            </a>
            
            <div className="flex items-center justify-center gap-2 text-[11px] text-blue-200 font-medium bg-white/5 py-2 px-3 rounded-xl border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>انبار شورآباد & جنت‌آباد</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Warehouse 1: Shorabad Dispatch Warehouse */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-800">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  انبار مرکزی و بارگیری پخش سوین (شورآباد)
                </h3>
                <span className="text-[11px] text-slate-500">مرکز اصلی انبارداری، پلمپ و بارگیری شهرستان‌ها</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-200">
              بارگیری سنگین
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p className="flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span><strong>آدرس دقیق انبار:</strong> تهران، جاده قدیم قم، کهریزک، ۶۰ متری شورآباد، شهرک باربری و انبارهای دخانیات، سوله اختصاصی پخش سوین</span>
            </p>
            <p className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-amber-500 shrink-0" />
              <span><strong>تلفن هماهنگی بارگیری و ترابری:</strong> <a href="tel:09120759419" className="font-mono font-bold text-blue-600 dark:text-blue-400 dir-ltr">۰۹۱۲۰۷۵۹۴۱۹</a></span>
            </p>
          </div>
        </div>

        {/* Warehouse 2: Packaging Protocol & JanatAbad */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  پروتکل بسته‌بندی ۵ لایه و بیجک معتبر
                </h3>
                <span className="text-[11px] text-slate-500">تضمین سلامتی و ایمنی فیزیکی کارتن‌ها</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200">
              ارسال پیامک بیجک
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p className="flex items-start gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>تمام کارتن‌ها پیش از تحویل به باربری‌های شوش، با سلفون صنعتی ضد آب و تسمه‌کشی اتوماتیک ایمن‌سازی شده و کد رهگیری بیجک بلافاصله پیامک می‌گردد.</span>
            </p>
            <p className="flex items-center gap-1.5 text-slate-500">
              <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span>انبار تحویل حضوری تهران: جنت‌آباد شمالی، خیابان انصارالمهدی</span>
            </p>
          </div>
        </div>

      </div>

      {/* Shipping Methods - 5 Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              روش‌های حمل و تحویل کالا (۵ متد اصلی)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">لطفاً روش مورد نظر خود را جهت محاسبه آنلاین انتخاب کنید</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {DEFAULT_SHIPPING_OPTIONS.map((opt, idx) => {
            const isSelected = selectedMethodId === opt.id;
            return (
              <div 
                key={opt.id}
                onClick={() => setSelectedMethodId(opt.id)}
                className={`relative group bg-white dark:bg-slate-900 border rounded-3xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/10 scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-full transition-colors ${
                  isSelected ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-transparent group-hover:bg-slate-200 dark:group-hover:bg-slate-800'
                }`}></div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-black transition-colors ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {formatNumberFa(idx + 1)}
                      </span>
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' : 'text-slate-400'}`}>
                        {getMethodIcon(opt.id)}
                      </div>
                    </div>

                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl border transition-all ${
                      opt.cost === 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                        : isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}>
                      {opt.cost === 0 ? 'رایگان' : formatToman(opt.cost)}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                    {opt.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {opt.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{opt.estimatedDelivery}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Freight Estimator Widget */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                محاسبه‌گر آنلاین کرایه باربری بر اساس استان و تعداد کارتن/بکس
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                استان انتخاب‌شده: <strong className="text-blue-600 dark:text-blue-400">{activeProvince.province} ({activeProvince.city})</strong>
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
            تایم تحویل: {activeProvince.estimatedDays}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Field 1: Carton Count */}
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>تعداد کارتن ارسالی:</span>
              <span className="text-blue-600 dark:text-blue-400 text-[11px]">({formatNumberFa(totalBoxes)} بکس)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="200"
                value={cartonCount}
                onChange={(e) => setCartonCount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-2.5 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="text-xs text-slate-500 font-bold whitespace-nowrap">کارتن</span>
            </div>
          </div>

          {/* Field 2: Province Destination */}
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>انتخاب استان مقصد:</span>
            </label>
            <select
              value={selectedProvinceName}
              onChange={(e) => setSelectedProvinceName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {PROVINCE_RATES.map(p => (
                <option key={p.province} value={p.province}>{p.province} ({p.city})</option>
              ))}
            </select>
          </div>

          {/* Field 3: Shipping Method Selector (Connected directly) */}
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>روش حمل و نقل انتخاب‌شده:</span>
            </label>
            <select
              value={selectedMethodId}
              onChange={(e) => setSelectedMethodId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-blue-300 dark:border-blue-600 rounded-xl p-2.5 text-xs font-bold text-blue-900 dark:text-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {DEFAULT_SHIPPING_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.title} ({opt.cost === 0 ? 'رایگان' : 'دارای هزینه'})
                </option>
              ))}
            </select>
          </div>

          {/* Field 4: Final Calculated Freight Result */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-2xl flex flex-col justify-between space-y-2 shadow-lg shadow-blue-600/20 border border-blue-400/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-100">برآورد کل کرایه حمل بیجک:</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight" dir="ltr">
              {calculatedFreight === 0 ? '۰ (رایگان)' : `${formatToman(calculatedFreight)}`}
            </div>
            <div className="text-[11px] text-blue-200 font-medium truncate">
              روش: {activeOption.title.split('(')[0]}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
