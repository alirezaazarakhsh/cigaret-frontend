import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Download, 
  Truck, 
  User, 
  Phone, 
  Car, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Barcode, 
  Package, 
  Building2, 
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { CartItem, CigaretteProduct, UserProfile, OrderInvoice } from '../types';
import { formatToman, formatNumberFa } from '../utils/formatters';

interface InPersonPickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser: UserProfile | null;
  products: CigaretteProduct[];
  onOrderSubmitted: (order: OrderInvoice) => void;
  showToast: (msg: string) => void;
}

export const InPersonPickupModal: React.FC<InPersonPickupModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  products,
  onOrderSubmitted,
  showToast,
}) => {
  // Step: 'form' | 'success_pass'
  const [step, setStep] = useState<'form' | 'success_pass'>('form');

  // Form Fields
  const [pickupTimeSlot, setPickupTimeSlot] = useState<'urgent_30m' | 'today_evening' | 'tomorrow_morning' | 'custom'>('urgent_30m');
  const [vehicleType, setVehicleType] = useState<'car' | 'van' | 'motorcycle' | 'walk_in'>('car');
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [shopName, setShopName] = useState(currentUser?.shopName || currentUser?.businessName || '');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [paymentOption, setPaymentOption] = useState<'counter_pos' | 'online_card' | 'customer_ledger'>('counter_pos');
  const [notes, setNotes] = useState('');

  // Generated pickup slip state
  const [generatedPass, setGeneratedPass] = useState<{
    passNumber: string;
    barcode: string;
    queueNumber: string;
    createdAt: string;
    estimatedReadyTime: string;
    totalAmount: number;
    itemsCount: number;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Cart stats
  const totalCartons = cartItems.reduce((acc, curr) => curr.unit === 'carton' ? acc + curr.quantity : acc, 0);
  const totalBoxes = cartItems.reduce((acc, curr) => curr.unit === 'box' ? acc + curr.quantity : acc, 0);
  const subtotal = cartItems.reduce((acc, curr) => {
    const price = curr.unit === 'carton' ? curr.product.cartonPrice : curr.product.boxPrice;
    return acc + (price * curr.quantity);
  }, 0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('کد حواله تحویل حضوری کپی شد.');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmitPickupOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast('سبد سفارش شما خالی است. لطفاً ابتدا اقلام مورد نظر را انتخاب کنید.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('لطفاً نام تحویل‌گیرنده و شماره تماس را وارد کنید.');
      return;
    }

    const randomQueue = String(Math.floor(100 + Math.random() * 900));
    const randomCode = `SVN-PICKUP-${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`;
    const barcodeStr = `761011${Math.floor(100000 + Math.random() * 900000)}`;

    let readyTimeText = 'تا ۳۰ دقیقه دیگر (باجه آماده‌سازی فوری)';
    if (pickupTimeSlot === 'today_evening') readyTimeText = 'امروز عصر بین ساعت ۱۶ الی ۲۰';
    if (pickupTimeSlot === 'tomorrow_morning') readyTimeText = 'فردا صبح بین ساعت ۹ الی ۱۳';

    const passData = {
      passNumber: randomCode,
      barcode: barcodeStr,
      queueNumber: randomQueue,
      createdAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      estimatedReadyTime: readyTimeText,
      totalAmount: subtotal,
      itemsCount: cartItems.length,
    };

    // Construct official order invoice with In-Person Pickup tag
    const pickupOrder: OrderInvoice = {
      orderId: randomCode,
      trackingCode: randomCode,
      createdAt: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      customer: {
        shopOwnerName: customerName,
        shopName: shopName || 'تحویل حضوری در باجه',
        shopPhone: customerPhone,
        city: 'تهران',
        province: 'تهران',
        address: 'دریافت حضوری در باجه انبار مرکزی سوین (جنت‌آباد)',
        shippingMethod: 'تحویل حضوری در باجه انبار مرکزی سوین (۰ تومان)',
        shippingCost: 0,
        notes: `نوبت باجه: ${randomQueue} | وسیله نقلیه: ${vehicleType} | پلاک: ${vehiclePlate || 'نامشخص'} | یادداشت: ${notes}`,
      },
      items: cartItems,
      totalBoxes: totalBoxes,
      totalCartons: totalCartons,
      subtotal: subtotal,
      discountAmount: 0,
      shippingCost: 0,
      finalTotal: subtotal,
      paymentStatus: paymentOption === 'counter_pos' 
        ? 'تسویه با کارتخوان پای باجه' 
        : paymentOption === 'customer_ledger' 
          ? 'منظور به حساب دفتری و نسیه' 
          : 'پرداخت آنلاین پیش‌فاکتور',
    };

    setGeneratedPass(passData);
    setStep('success_pass');
    onOrderSubmitted(pickupOrder);
    showToast(`حواله تحویل حضوری با شماره نوبت ${randomQueue} صادر شد.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-scrollbar bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col"
        id="in-person-pickup-modal"
      >
        
        {/* MODAL TOP HEADER */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>ثبت سفارش و تحویل حضوری در باجه انبار مرکزی سوین</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                آماده‌سازی فوری کالاها در سوله مرکزی و بارگیری مستقیم روی خودرو یا تحویل دست‌به‌دست
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <form onSubmit={handleSubmitPickupOrder} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto modal-overscroll-contain">
            
            {/* WAREHOUSE ADDRESS BANNER */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-amber-950">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>آدرس باجه تحویل انبار:</span>
                  <span className="text-slate-800">تهران، جنت‌آباد شمالی، خیابان بهارستان، سوله پخش دخانیات سوین</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>ساعات کاری باجه تحویل حضوری: شنبه تا پنجشنبه ۸:۰۰ الی ۲۰:۰۰ یکسره</span>
                </div>
              </div>

              <a
                href="https://nshn.ir"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 shrink-0 text-[11px] shadow-xs"
              >
                <span>مسیریابی با نشان / بلد</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* ORDER ITEMS SUMMARY */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-slate-900 border-b border-slate-200/80 pb-2">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  <span>اقلام سفارش جهت تحویل حضوری ({formatNumberFa(cartItems.length)} ردیف)</span>
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-[11px]">
                  کرایه باربری: ۰ تومان (رایگان)
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-4 text-center text-xs text-rose-600 font-bold">
                  سبد سفارش شما خالی است! لطفاً ابتدا کالاها را به سبد خرید اضافه کنید.
                </div>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-700 py-1 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        <span className="font-bold truncate">{item.product.nameFa}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({formatNumberFa(item.quantity)} {item.unit === 'carton' ? 'کارتن' : 'باکس'})
                        </span>
                      </div>
                      <span className="font-mono font-black text-slate-900 shrink-0">
                        {formatToman(item.unit === 'carton' ? item.product.cartonPrice * item.quantity : item.product.boxPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-700">مجموع اقلام: {formatNumberFa(totalCartons)} کارتن و {formatNumberFa(totalBoxes)} باکس</span>
                <span className="font-black text-blue-700 text-sm font-mono">
                  مبلغ فاکتور: {formatToman(subtotal)}
                </span>
              </div>
            </div>

            {/* PICKUP TIME SELECTION */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900">
                زمان مراجعه و تحویل گرفتن از باجه:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                <button
                  type="button"
                  onClick={() => setPickupTimeSlot('urgent_30m')}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                    pickupTimeSlot === 'urgent_30m'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">تحویل فوری (۳۰ دقیقه دیگر)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[10px] text-slate-500">آماده‌سازی با اولویت VIP باجه</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPickupTimeSlot('today_evening')}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                    pickupTimeSlot === 'today_evening'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">امروز عصر (۱۶ الی ۲۰)</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-[10px] text-slate-500">پلمپ و نگهداری در قفسه باجه</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPickupTimeSlot('tomorrow_morning')}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                    pickupTimeSlot === 'tomorrow_morning'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">فردا صبح (۹ الی ۱۳)</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-[10px] text-slate-500">تحویل اول وقت با خلوتی انبار</p>
                </button>

              </div>
            </div>

            {/* VEHICLE / ARRIVAL TYPE */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900">
                شیوه مراجعه / وسیله نقلیه بارگیری:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'car', label: 'خودرو سواری', icon: Car },
                  { id: 'van', label: 'وانت بار / نیسان', icon: Truck },
                  { id: 'motorcycle', label: 'موتورسیکلت', icon: Package },
                  { id: 'walk_in', label: 'مراجعه حضوری پیاده', icon: User },
                ].map((v) => {
                  const Icon = v.icon;
                  const isSelected = vehicleType === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVehicleType(v.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RECIPIENT DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  نام و نام خانوادگی تحویل‌گیرنده: *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: رضا حسینی"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  شماره موبایل جهت دریافت پیامک نوبت باجه: *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0912..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  نام فروشگاه / بنکداری (اختیاری):
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="نام مغازه شما"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  شماره پلاک خودرو / وانت جهت ورود به محوطه انبار:
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="مثال: ۱۲ ج ۳۴۵ ایران ۶۸"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {/* PAYMENT PREFERENCE */}
            <div className="space-y-2 text-xs">
              <label className="block font-black text-slate-900">
                شیوه تسویه حساب سفارش حضوری:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentOption('counter_pos')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1 ${
                    paymentOption === 'counter_pos'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs">کارتخوان پای باجه انبار</span>
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-slate-500">تسویه هنگام تحویل کالا</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('customer_ledger')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1 ${
                    paymentOption === 'customer_ledger'
                      ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs">دفتر نسیه و حساب مشتری</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-[10px] text-slate-500">کسر از سقف اعتبار دفتری</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('online_card')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1 ${
                    paymentOption === 'online_card'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs">کارت‌به‌کارت و فیش واریزی</span>
                    <Copy className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span className="text-[10px] text-slate-500">ارسال رسید واریز آنلاین</span>
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-slate-500 block text-[11px]">مبلغ نهایی قابل تسویه:</span>
                <span className="font-mono font-black text-blue-700 text-base">{formatToman(subtotal)}</span>
              </div>

              <button
                type="submit"
                disabled={cartItems.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ثبت نهایی و صدور حواله تحویل باجه</span>
              </button>
            </div>

          </form>
        )}

        {/* STEP 2: DIGITAL PICKUP PASS & COUNTER SLIP */}
        {step === 'success_pass' && generatedPass && (
          <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto modal-overscroll-contain">
            
            {/* SUCCESS CONFIRMATION BANNER */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                حواله تحویل حضوری با موفقیت در سیستم انبار مرکزی ثبت شد!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                کارتن‌های سفارش شما در حال آماده‌سازی و تجمیع در باجه تحویل انبار جنت‌آباد می‌باشد. هنگام مراجعه این برگه را نشان دهید.
              </p>
            </div>

            {/* OFFICIAL PASS CARD */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/40 relative overflow-hidden space-y-6">
              
              {/* Top Pass Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-700/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-amber-400">
                      حواله رسمی تحویل باجه انبار مرکزی سوین
                    </h4>
                    <span className="text-[11px] text-slate-300 font-mono">
                      تهران - انبار مرکزی جنت‌آباد شمالی
                    </span>
                  </div>
                </div>

                <div className="text-left bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] text-amber-300 block">شماره نوبت باجه:</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    #{generatedPass.queueNumber}
                  </span>
                </div>
              </div>

              {/* Middle Pass Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">کد حواله تحویل:</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-mono font-black text-amber-300 text-xs truncate">{generatedPass.passNumber}</span>
                    <button
                      onClick={() => handleCopyCode(generatedPass.passNumber)}
                      className="text-slate-400 hover:text-white"
                      title="کپی کد"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">تحویل‌گیرنده:</span>
                  <span className="font-bold text-white block mt-0.5 truncate">{customerName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">زمان آماده‌سازی:</span>
                  <span className="font-bold text-emerald-400 block mt-0.5">{generatedPass.estimatedReadyTime}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">مبلغ کل فاکتور:</span>
                  <span className="font-mono font-black text-white block mt-0.5">{formatToman(generatedPass.totalAmount)}</span>
                </div>
              </div>

              {/* Pass Barcode & QR Code Section */}
              <div className="bg-white rounded-2xl p-4 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl p-1 border border-slate-200 flex items-center justify-center shrink-0">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">بارکد اختصاصی اسکن انباردار باجه:</span>
                    <span className="font-mono font-black text-sm tracking-widest text-slate-900 block">
                      {generatedPass.barcode}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      ✓ ثبت‌شده در سیستم انبارداری و تحویل کالا
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    <span>وضعیت: در حال بسته‌بندی کارتن‌ها</span>
                  </div>
                </div>
              </div>

              {/* Warehouse Location and Direct Dispatch Call */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs pt-2 border-t border-slate-700/80">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>تهران، جنت‌آباد شمالی، خیابان بهارستان، سوله پخش دخانیات سوین</span>
                </div>

                <a
                  href="tel:09120759419"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold flex items-center justify-center gap-1 text-[11px] border border-slate-700"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>تماس با باجه انبار (۰۹۱۲۰۷۵۹۴۱۹)</span>
                </a>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>چاپ یا ذخیره حواله تحویل</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/20 transition-all"
              >
                متوجه شدم / بازگشت به سامانه
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
