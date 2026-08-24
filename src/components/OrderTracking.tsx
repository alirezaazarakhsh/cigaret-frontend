import React, { useState } from 'react';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  PhoneCall, 
  FileText, 
  AlertCircle,
  Car,
  Boxes,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Calendar,
  Building2,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { OrderTrackingInfo, OrderShippingStatusCode, OrderDispatchType } from '../types';
import { formatToman, formatNumberFa } from '../utils/formatters';

// Pre-seeded realistic orders for tobacco wholesale B2B
export const INITIAL_TRACKING_ORDERS: OrderTrackingInfo[] = [
  {
    orderId: 'ORD-2026-0819',
    trackingCode: 'SVN-90214',
    createdAt: '۱۴۰۴/۱۲/۰۳ - ۰۹:۳۰',
    updatedAt: '۱۴۰۴/۱۲/۰۳ - ۱۱:۴۵',
    customerName: 'حاج محمود اصغری (پخش دخانیات اصغری)',
    customerPhone: '09121112233',
    customerCity: 'تهران - بازار بزرگ، پله نوروزخان',
    customerAddress: 'تهران، بازار بزرگ، پاساژ دخانیات، طبقه اول، پلاک ۴۲',
    totalCartons: 35,
    totalBoxes: 50,
    finalTotal: 412500000,
    status: 'dispatched_fleet',
    statusFa: 'در مسیر تحویل با ناوگان اختصاصی سوین',
    dispatchType: 'sevin_dedicated_fleet',
    dispatchTypeFa: 'ناوگان اختصاصی وانت/نیسان پخش سوین (تهران و حومه)',
    driverName: 'آقا بهروز نادری (راننده امین پخش سوین)',
    driverPhone: '09198887766',
    vehiclePlate: 'ایران ۱۱ - ۷۸۹ ج ۶۵',
    fleetLocation: 'بزرگراه آزادگان به سمت میدان شوش - فاصله تا مقصد: حدود ۲۰ دقیقه',
    estimatedDelivery: 'امروز، ساعت ۱۲:۳۰ تا ۱۳:۰۰',
    itemsSummary: '۲۰ کارتن وینستون لایت سوئیس + ۱۰ کارتن مارلبرو گلد + ۵ کارتن کنت پاور',
    notes: 'بارگیری در انبار مرکزی کهریزک شورآباد در حضور بازرس انبار انجام شد. کارتن‌ها دارای پلمپ سربی شرکتی هستند.',
    timeline: [
      {
        step: 1,
        title: 'ثبت پیش‌فاکتور و تایید نهایی',
        description: 'سفارش با ۳۵ کارتن و ۵۰ باکس توسط مشتری ثبت گردید.',
        time: '۰۹:۳۰',
        isCompleted: true,
        isCurrent: false,
      },
      {
        step: 2,
        title: 'تأیید مالی و حواله انبار شورآباد',
        description: 'تراکنش حواله ساتنا تأیید و شناسه خروج از انبار صادر شد.',
        time: '۱۰:۱۵',
        isCompleted: true,
        isCurrent: false,
      },
      {
        step: 3,
        title: 'بسته‌بندی و بارگیری ناوگان سوین',
        description: 'کارتن‌ها پلمپ و در نیسان وانت اختصاصی سوین بارگیری شد.',
        time: '۱۱:۰۰',
        isCompleted: true,
        isCurrent: false,
      },
      {
        step: 4,
        title: 'در مسیر تحویل با راننده اختصاصی',
        description: 'ناوگان در حال تردد در محور آزادگان - راننده: آقا بهروز نادری',
        time: '۱۱:۴۵',
        isCompleted: true,
        isCurrent: true,
      },
      {
        step: 5,
        title: 'تحویل نهایی به مشتری و دریافت رسید',
        description: 'تطبیق کارتن‌ها، فک پلمپ و دریافت امضای تحویل‌گیرنده',
        time: 'تخمینی ۱۲:۴۵',
        isCompleted: false,
        isCurrent: false,
      }
    ]
  },
  {
    orderId: 'ORD-2026-0818',
    trackingCode: 'SVN-48192',
    createdAt: '۱۴۰۴/۱۲/۰۲ - ۱۵:۰۰',
    updatedAt: '۱۴۰۴/۱۲/۰۳ - ۰۸:۲۰',
    customerName: 'فروشگاه دخانیات برادران حسینی',
    customerPhone: '09133145566',
    customerCity: 'اصفهان - میدان احمدآباد',
    customerAddress: 'اصفهان، میدان احمدآباد، خیابان جی، جنب بانک ملت، فروشگاه حسینی',
    totalCartons: 60,
    totalBoxes: 100,
    finalTotal: 720000000,
    status: 'dispatched_freight',
    statusFa: 'تحویل شده به باربری وطن (کد بیجک صادر شد)',
    dispatchType: 'freight_company',
    dispatchTypeFa: 'باربری بین‌شهری سراسری (وطن / پیشتاز / شمس)',
    freightCompanyName: 'باربری وطن (شعبه مرکزی شورآباد)',
    freightBillNumber: 'VTN-8849201',
    freightPhone: '021-55201111',
    freightDestinationBranch: 'باربری وطن شعبه میدان خواجو اصفهان',
    estimatedDelivery: 'فردا صبح ساعت ۰۹:۰۰ الی ۱۱:۰۰',
    itemsSummary: '۳۰ کارتن بهمن سوئیسی + ۲۰ کارتن وینستون اولترا + ۱۰ کارتن تنباکو الفاخر',
    notes: 'تحویل بار به دفتر باربری وطن انجام شد و فیش بیمه سلامت فیزیکی بار صادر گردید.',
    timeline: [
      {
        step: 1,
        title: 'ثبت سفارش و صدور پیش‌فاکتور',
        description: 'ثبت سفارش عمده ۶۰ کارتن با تخفیف تیراژ بنکداری',
        time: '۱۵:۰۰',
        isCompleted: true,
        isCurrent: false,
      },
      {
        step: 2,
        title: 'تأیید مالی و صدور حواله خروج',
        description: 'تأیید فیش واریزی و آماده‌سازی حواله پلمپ کارتن‌ها',
        time: '۱۶:۳۰',
        isCompleted: true,
        isCurrent: false,
      },
      {
        step: 3,
        title: 'تخلیه در باربری وطن شورآباد',
        description: 'ارسال با خودروی رابط انبار سوین به ترمینال باربری وطن',
        time: '۱۹:۰۰',
        isCompleted: true,
        isCurrent: false,
      },
      {
        step: 4,
        title: 'صدور بارنامه رسمی و ارسال بین‌شهری',
        description: 'کد بیجک بارنامه: VTN-8849201 - کفی خاور در مسیر اصفهان',
        time: '۰۸:۲۰',
        isCompleted: true,
        isCurrent: true,
      },
      {
        step: 5,
        title: 'تخلیه در انبار مقصد و تحویل',
        description: 'اعلام وصول بار به تحویل‌گیرنده در اصفهان',
        time: 'فردا صبح',
        isCompleted: false,
        isCurrent: false,
      }
    ]
  },
  {
    orderId: 'ORD-2026-0815',
    trackingCode: 'SVN-77310',
    createdAt: '۱۴۰۴/۱۲/۰۱ - ۱۱:۰۰',
    updatedAt: '۱۴۰۴/۱۲/۰۱ - ۱۶:۳۰',
    customerName: 'بنکداری دخانیات کمالی',
    customerPhone: '09124455667',
    customerCity: 'کرج - گوهردشت',
    customerAddress: 'کرج، گوهردشت، فلکه اول، ابتدای مطهری، پخش کمالی',
    totalCartons: 15,
    totalBoxes: 30,
    finalTotal: 185000000,
    status: 'delivered',
    statusFa: 'تحویل موفق به مشتری با رسید رسمی',
    dispatchType: 'sevin_dedicated_fleet',
    dispatchTypeFa: 'ناوگان اختصاصی وانت/نیسان پخش سوین (تهران و البرز)',
    driverName: 'آقا کامران رستمی',
    driverPhone: '09127776655',
    vehiclePlate: 'ایران ۶۸ - ۲۱۴ د ۳۳',
    estimatedDelivery: 'تحویل داده شد (امضا و ثبت در سامانه)',
    itemsSummary: '۱۰ کارتن سوبرانی مشکی اصل + ۵ کارتن کمل سفید',
    notes: 'تحویل حضوری با موفقیت انجام شد و رسید تحویل کالا با مهر پخش کمالی بایگانی گردید.',
    timeline: [
      {
        step: 1,
        title: 'ثبت سفارش',
        description: 'ثبت در سیستم سوین',
        time: '۱۱:۰۰',
        isCompleted: true,
        isCurrent: false,
      },
      {
        step: 2,
        title: 'تأیید حواله مالی',
        description: 'تسویه حساب نقدی انبار',
        time: '۱۱:۴۵',
        isCompleted: true,
        isCurrent: false,
      },
      {
        step: 3,
        title: 'بارگیری در وانت سوین',
        description: 'خروج از انبار کهریزک شورآباد',
        time: '۱۳:۱۵',
        isCompleted: true,
        isCurrent: false,
      },
      {
        step: 4,
        title: 'حرکت به سمت البرز',
        description: 'اتوبان تهران-کرج',
        time: '۱۴:۳۰',
        isCompleted: true,
        isCurrent: false,
      },
      {
        step: 5,
        title: 'تحویل موفق به آقای کمالی',
        description: 'رسید بار دریافت و در سیستم بایگانی شد.',
        time: '۱۶:۳۰',
        isCompleted: true,
        isCurrent: true,
      }
    ]
  }
];

interface OrderTrackingProps {
  orders?: OrderTrackingInfo[];
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orders: customOrders }) => {
  const [ordersList, setOrdersList] = useState<OrderTrackingInfo[]>(customOrders || INITIAL_TRACKING_ORDERS);
  const [searchInput, setSearchInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderTrackingInfo | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'sevin_dedicated_fleet' | 'freight_company'>('all');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query) return;

    const found = ordersList.find(o => 
      o.trackingCode.toLowerCase().includes(query) ||
      o.orderId.toLowerCase().includes(query) ||
      o.customerPhone.includes(query) ||
      o.customerName.toLowerCase().includes(query)
    );

    if (found) {
      setSelectedOrder(found);
    } else {
      setSelectedOrder(null);
    }
  };

  const handleCopyTrackingCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredOrders = ordersList.filter(o => {
    if (filterType === 'all') return true;
    return o.dispatchType === filterType;
  });

  return (
    <div className="py-8" id="order-tracking-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Title Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-black px-3 py-1 rounded-xl border border-blue-200">
                  <Truck className="w-4 h-4 text-blue-600 animate-pulse" />
                  رهگیری زنده مرسولات و ناوگان توزیع سوین
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                پیگیری آنلاین بار و وضعیت ناوگان ارسال
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                با درج شماره پیگیری اختصاصی (مانند <code className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">SVN-90214</code>) از جزئیات دقیق بارگیری، شماره پلاک راننده اختصاصی یا شماره بارنامه بیجک باربری بین‌شهری مطلع شوید.
              </p>
            </div>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="شماره پیگیری (مثال: SVN-90214 یا شماره موبایل خریدار)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-11 pl-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              استعلام وضعیت بار
            </button>
          </form>
        </div>

        {/* Tracking Details View */}
        {selectedOrder ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left/Main Column: Tracking Card & Timeline */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Order Status Summary Header Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500 font-medium">کد رهگیری بارنامه:</span>
                      <strong className="text-base font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 tracking-wider">
                        {selectedOrder.trackingCode}
                      </strong>
                      <button
                        onClick={() => handleCopyTrackingCode(selectedOrder.trackingCode)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="کپی کد رهگیری"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>شماره سفارش داخلی: {selectedOrder.orderId}</span>
                      <span>•</span>
                      <span>زمان ثبت: {selectedOrder.createdAt}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="text-left">
                    <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black border ${
                      selectedOrder.status === 'delivered'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedOrder.status === 'dispatched_fleet'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                      {selectedOrder.statusFa}
                    </div>
                  </div>
                </div>

                {/* Dispatch Method Highlight Box */}
                <div className={`mt-6 p-4 sm:p-5 rounded-2xl border ${
                  selectedOrder.dispatchType === 'sevin_dedicated_fleet'
                    ? 'bg-blue-50/60 border-blue-200 text-blue-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      {selectedOrder.dispatchType === 'sevin_dedicated_fleet' ? (
                        <Car className="w-5 h-5" />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-sm font-black">
                          {selectedOrder.dispatchTypeFa}
                        </h4>
                        <span className="text-[11px] font-bold text-slate-600 bg-white/80 px-2.5 py-0.5 rounded-lg border border-slate-200">
                          زمان تخمینی تحویل: {selectedOrder.estimatedDelivery}
                        </span>
                      </div>
                      
                      {/* Fleet Details */}
                      {selectedOrder.dispatchType === 'sevin_dedicated_fleet' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-blue-200/80 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[11px]">راننده ناوگان سوین:</span>
                            <span className="font-black text-slate-900">{selectedOrder.driverName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">پلاک خودروی وانت/نیسان:</span>
                            <span className="font-black text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200 inline-block font-mono">
                              {selectedOrder.vehiclePlate}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">تماس مستقیم راننده:</span>
                            <a
                              href={`tel:${selectedOrder.driverPhone}`}
                              className="font-black text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              {selectedOrder.driverPhone}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Freight Details */}
                      {selectedOrder.dispatchType === 'freight_company' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-200 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[11px]">نام باربری طرف قرارداد:</span>
                            <span className="font-black text-slate-900">{selectedOrder.freightCompanyName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">شماره بیجک / بارنامه:</span>
                            <span className="font-black text-blue-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block font-mono">
                              {selectedOrder.freightBillNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">شعبه تخلیه مقصد:</span>
                            <span className="font-bold text-slate-800">{selectedOrder.freightDestinationBranch}</span>
                          </div>
                        </div>
                      )}

                      {/* Current Location / Note */}
                      {selectedOrder.fleetLocation && (
                        <div className="mt-3 flex items-center gap-2 text-xs bg-white/90 p-2.5 rounded-xl border border-blue-200 font-bold text-blue-900">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0 animate-bounce" />
                          <span>موقعیت لحظه‌ای: {selectedOrder.fleetLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tracking Step-by-Step Timeline */}
                <div className="mt-8">
                  <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    مراحل زمانی پردازش و حمل بارنامه:
                  </h3>

                  <div className="relative pr-6 space-y-6 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {selectedOrder.timeline.map((step) => {
                      return (
                        <div key={step.step} className="relative flex items-start gap-4">
                          {/* Dot / Icon */}
                          <div className={`absolute -right-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                            step.isCompleted
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {step.isCompleted ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <span>{formatNumberFa(step.step)}</span>
                            )}
                          </div>

                          <div className={`flex-1 p-4 rounded-2xl border transition-all ${
                            step.isCurrent 
                              ? 'bg-blue-50/70 border-blue-300 shadow-xs' 
                              : step.isCompleted 
                              ? 'bg-white border-slate-200' 
                              : 'bg-slate-50/60 border-slate-200 opacity-60'
                          }`}>
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                              <h4 className={`text-xs font-black ${step.isCurrent ? 'text-blue-900' : 'text-slate-900'}`}>
                                {step.title}
                              </h4>
                              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md" dir="ltr">
                                {step.time}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Customer Info & Package Summary */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Customer & Destination Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  اطلاعات تحویل‌گیرنده و مقصد
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">نام مشتری / فروشگاه:</span>
                    <strong className="text-slate-900 text-xs font-black">{selectedOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">تلفن تماس هماهنگی:</span>
                    <span className="font-bold text-slate-800" dir="ltr">{selectedOrder.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">شهر و منطقه مقصد:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.customerCity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">آدرس کامل تحویل:</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1 leading-relaxed">
                      {selectedOrder.customerAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Summary Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  اقلام و محموله بارنامه
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                      <span className="text-[11px] text-blue-800 font-bold block">تعداد کارتن</span>
                      <strong className="text-base font-black text-blue-900">
                        {formatNumberFa(selectedOrder.totalCartons)} کارتن
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-600 font-bold block">تعداد باکس</span>
                      <strong className="text-base font-black text-slate-900">
                        {formatNumberFa(selectedOrder.totalBoxes)} باکس
                      </strong>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-500 block">شرح اقلام:</span>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      {selectedOrder.itemsSummary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">مبلغ کل فاکتور:</span>
                    <strong className="text-sm font-black text-blue-700">
                      {formatToman(selectedOrder.finalTotal)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Support & Dispatch Direct Hotline */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">پشتیبانی و هماهنگی ترابری</h4>
                    <span className="text-[10px] text-slate-400">واحد لجستیک و انبار شورآباد</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  در صورت نیاز به تغییر زمان تحویل یا هماهنگی تخلیه با دفتر ترابری سوین تماس حاصل فرمایید.
                </p>
                <a
                  href="tel:09120759419"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>تماس با مدیر لجستیک: ۰۹۱۲۰۷۵۹۴۱۹</span>
                </a>
              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-base font-black text-slate-900 mb-2">بارنامه‌ای با این مشخصات یافت نشد</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              لطفاً شماره پیگیری را با دقت وارد فرمایید (مثال: SVN-90214) یا برای پیگیری با واحد فروش سوین تماس حاصل نمایید.
            </p>
            <button
              onClick={() => {
                setSearchInput('SVN-90214');
                setSelectedOrder(INITIAL_TRACKING_ORDERS[0]);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              نمایش بارنامه نمونه
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
