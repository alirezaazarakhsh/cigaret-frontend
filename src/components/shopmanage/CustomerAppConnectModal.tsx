import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Smartphone, 
  QrCode, 
  Users, 
  Sparkles, 
  Check, 
  X, 
  ExternalLink, 
  Copy, 
  ShieldCheck, 
  Share2, 
  Download, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  CreditCard,
  History,
  Coins,
  Send,
  Layers,
  Building2,
  Package,
  Search,
  ShoppingCart,
  Clock,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Printer,
  Tag,
  Filter,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Eye,
  Flame,
  Award,
  Truck,
  Maximize2,
  Minimize2,
  CheckCheck,
  Receipt
} from 'lucide-react';
import { getCustomerPortalUrl, getWebAppBaseUrl } from '../../services/apiConfig';
import { PosCustomer, PosReceiptInvoice, CigaretteProduct, CigaretteCategory } from '../../types';
import { formatToman, formatNumberFa } from '../../utils/formatters';

interface CustomerAppConnectModalProps {
  customers: PosCustomer[];
  receiptsList: PosReceiptInvoice[];
  products?: CigaretteProduct[];
  onClose: () => void;
  onUpdateCustomerPoints?: (customerId: string, newPoints: number) => void;
  onAddInPersonPickupReceipt?: (receipt: PosReceiptInvoice) => void;
}

interface InAppCartItem {
  product: CigaretteProduct;
  unit: 'carton' | 'box' | 'pack';
  quantity: number;
}

const APP_CATEGORIES: { id: CigaretteCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'همه کالاها', icon: '⚡' },
  { id: 'drinks_coffee', label: 'قهوه و نوشیدنی', icon: '☕' },
  { id: 'cigarettes', label: 'سیگار شرکتی و اصل', icon: '🚬' },
  { id: 'iqos_devices', label: 'دستگاه‌های ایکاس', icon: '🔥' },
  { id: 'iqos_heets', label: 'استیک تیریا و هیتس', icon: '🌿' },
  { id: 'pods_vapes', label: 'پاد سیستم و ویپ', icon: '💨' },
  { id: 'tobacco', label: 'توتون و لوازم پیپ', icon: '🍂' },
  { id: 'accessories', label: 'فندک کلیپر و اکسسوری', icon: '✨' },
];

export const CustomerAppConnectModal: React.FC<CustomerAppConnectModalProps> = ({
  customers,
  receiptsList,
  products = [],
  onClose,
  onUpdateCustomerPoints,
  onAddInPersonPickupReceipt,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(customers[0] || null);
  const [selectedLinkType, setSelectedLinkType] = useState<'customer' | 'catalog' | 'pickup'>('customer');
  const [isQrEnlarged, setIsQrEnlarged] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('synced');
  const [smsSending, setSmsSending] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState(false);
  const [isFullScreenPhone, setIsFullScreenPhone] = useState(false);

  // In-App Customer View State (What the in-store customer sees on their mobile)
  const [appTab, setAppTab] = useState<'invoices' | 'catalog' | 'pickup' | 'ledger'>('invoices');
  const [catalogCategory, setCatalogCategory] = useState<CigaretteCategory>('all');
  const [catalogBrand, setCatalogBrand] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  
  // In-App Customer Pickup Order State
  const [pickupCart, setPickupCart] = useState<InAppCartItem[]>([]);
  const [selectedCounter, setSelectedCounter] = useState<'counter_1' | 'counter_2' | 'counter_3'>('counter_1');
  const [pickupTiming, setPickupTiming] = useState<'now' | '15_min' | '1_hour'>('now');
  const [pickupPayment, setPickupPayment] = useState<'pos' | 'cash_ledger' | 'online_shaba'>('pos');
  const [activePickupPass, setActivePickupPass] = useState<{
    token: string;
    orderId: string;
    itemsCount: number;
    totalAmount: number;
    counterName: string;
    timingLabel: string;
    createdAt: string;
  } | null>(null);

  // Viewing Thermal Receipt Modal inside App
  const [viewingReceipt, setViewingReceipt] = useState<PosReceiptInvoice | null>(null);

  // Generate unique web app sync portal URLs (Vercel production address)
  const customerPortalUrl = selectedCustomer 
    ? getCustomerPortalUrl(selectedCustomer.id, selectedCustomer.phone)
    : `${getWebAppBaseUrl()}/app`;

  const catalogPortalUrl = `${getWebAppBaseUrl()}/app?tab=catalog`;
  const pickupPortalUrl = `${getWebAppBaseUrl()}/app?tab=pickup`;

  const currentActiveUrl = selectedLinkType === 'customer' 
    ? customerPortalUrl 
    : selectedLinkType === 'catalog' 
      ? catalogPortalUrl 
      : pickupPortalUrl;

  const currentActiveTitle = selectedLinkType === 'customer'
    ? `لینک و QR کد اختصاصی: ${selectedCustomer?.name || 'مشتری'}`
    : selectedLinkType === 'catalog'
      ? 'QR کد کاتالوگ عمومی و قیمت لحظه‌ای انبار'
      : 'QR کد نوبت‌گیری و تحویل اکسپرس باجه انبار';

  // Customer Invoices Filter
  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return receiptsList.filter(
      r => r.customerName === selectedCustomer.name || 
           (r.customerPhone && r.customerPhone === selectedCustomer.phone) ||
           (r.customerPhone && selectedCustomer.phone && r.customerPhone.includes(selectedCustomer.phone.slice(-8)))
    );
  }, [selectedCustomer, receiptsList]);

  // Unique Brands in catalog
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach(p => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [products]);

  // Filtered Products for Customer Catalog
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (catalogCategory !== 'all' && p.category !== catalogCategory) return false;
      if (catalogBrand !== 'all' && p.brand !== catalogBrand) return false;
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase().trim();
        const matchFa = p.nameFa?.toLowerCase().includes(q);
        const matchEn = p.nameEn?.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        if (!matchFa && !matchEn && !matchBrand) return false;
      }
      return true;
    });
  }, [products, catalogCategory, catalogBrand, catalogSearch]);

  // In-App Cart Helpers
  const getItemUnitPrice = (product: CigaretteProduct, unit: 'carton' | 'box' | 'pack') => {
    if (unit === 'carton') return product.cartonPrice;
    if (unit === 'box') return product.boxPrice;
    return product.packPrice || product.boxPrice || (product.category === 'drinks_coffee' ? 70000 : 50000);
  };

  const getUnitLabel = (unit: 'carton' | 'box' | 'pack', category?: string) => {
    if (unit === 'carton') return 'کارتن پلمپ';
    if (unit === 'box') return 'باکس';
    if (category === 'drinks_coffee') return 'تکی (شات / قوطی / عدد)';
    return 'پاکت / تکی';
  };

  const handleAddToCart = (product: CigaretteProduct, unit?: 'carton' | 'box' | 'pack') => {
    const actualUnit: 'carton' | 'box' | 'pack' = unit || (product.category === 'drinks_coffee' ? 'pack' : 'carton');
    setPickupCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.unit === actualUnit);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id && item.unit === actualUnit
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, unit: actualUnit, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, unit: 'carton' | 'box' | 'pack', delta: number) => {
    setPickupCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.unit === unit) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as InAppCartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string, unit: 'carton' | 'box' | 'pack') => {
    setPickupCart(prev => prev.filter(item => !(item.product.id === productId && item.unit === unit)));
  };

  const cartTotalAmount = useMemo(() => {
    return pickupCart.reduce((sum, item) => {
      const unitPrice = getItemUnitPrice(item.product, item.unit);
      return sum + (unitPrice * item.quantity);
    }, 0);
  }, [pickupCart]);

  const cartTotalItemsCount = useMemo(() => {
    return pickupCart.reduce((sum, item) => sum + item.quantity, 0);
  }, [pickupCart]);

  // Quick submit In-Person Pickup Order from Customer Mobile App
  const handleSubmitPickupOrder = () => {
    if (pickupCart.length === 0) return;

    const counterName = selectedCounter === 'counter_1' 
      ? 'باجه ۱: اکسپرس تحویل فوری کارتن و باکس' 
      : selectedCounter === 'counter_2'
        ? 'باجه ۲: بارگیری و ترابری انبار'
        : 'باجه ۳: باجه تخصصی ایکاس و ویپ';

    const timingLabel = pickupTiming === 'now' 
      ? 'هم‌اکنون در شعبه حضور دارد' 
      : pickupTiming === '15_min'
        ? 'تا ۱۵ دقیقه دیگر در باجه'
        : 'تا ۱ ساعت آینده';

    const tokenNum = `B-${Math.floor(100 + Math.random() * 900)}`;
    const orderNum = `PK-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const pass = {
      token: tokenNum,
      orderId: orderNum,
      itemsCount: cartTotalItemsCount,
      totalAmount: cartTotalAmount,
      counterName,
      timingLabel,
      createdAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setActivePickupPass(pass);

    // If caller provided callback, register in POS receipts
    if (onAddInPersonPickupReceipt && selectedCustomer) {
      const newReceipt: PosReceiptInvoice = {
        id: `rcpt_pk_${Date.now()}`,
        receiptNumber: `POS-${orderNum}`,
        createdAt: new Date().toLocaleDateString('fa-IR') + ' ' + pass.createdAt,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerAddress: selectedCustomer.address || 'تحویل در باجه انبار مرکزی',
        items: pickupCart.map(it => ({
          product: it.product,
          unit: it.unit,
          quantity: it.quantity,
          unitPrice: getItemUnitPrice(it.product, it.unit),
          totalPrice: getItemUnitPrice(it.product, it.unit) * it.quantity,
        })),
        subtotal: cartTotalAmount,
        discountAmount: 0,
        finalTotal: cartTotalAmount,
        paymentMethod: pickupPayment === 'pos' ? 'pos_terminal' : pickupPayment === 'cash_ledger' ? 'ledger' : 'split',
        cashier: 'سیستم ثبت سفارش همراه مشتری (باجه انبار)',
        notes: `تحویل در ${counterName} (${timingLabel}) - نوبت: ${tokenNum}`
      };
      onAddInPersonPickupReceipt(newReceipt);
    }

    // Clear cart after successful order
    setPickupCart([]);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendAppSms = () => {
    if (!selectedCustomer || !selectedCustomer.phone || selectedCustomer.phone === '-') {
      alert('شماره تلفن مشتری برای ارسال پیامک معتبر نیست.');
      return;
    }
    setSmsSending(true);
    setTimeout(() => {
      setSmsSending(false);
      setSmsSentNotice(true);
      setTimeout(() => setSmsSentNotice(false), 4000);
    }, 900);
  };

  const handleTriggerSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
    }, 700);
  };

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-scrollbar"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className={`bg-white border border-slate-200 rounded-3xl w-full shadow-2xl my-auto transition-all max-h-[96vh] overflow-y-auto modal-overscroll-contain ${
          isFullScreenPhone ? 'max-w-[440px] sm:max-w-[460px] p-3 sm:p-4' : 'max-w-6xl p-4 sm:p-6'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        {isFullScreenPhone ? (
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">شبیه‌ساز گوشی همراه مشتری</h3>
                <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  اتصال زنده PWA به صندوق
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsFullScreenPhone(false)}
                className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                title="بازگشت به نمایش دو ستونه پنل و شبیه‌ساز"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>پنل مدیریت</span>
              </button>

              <button
                onClick={handleTriggerSync}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                title="همگام‌سازی"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-indigo-600' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>اپلیکیشن اختصاصی مشتری حضوری در شعبه (PWA)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>دیتابیس ابری همگام</span>
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مشتریان با نصب این اپ در گوشی خود فاکتورها، منوی محصولات و سفارش تحویل باجه انبار را بدون معطلی مدیریت می‌کنند
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsFullScreenPhone(true)}
                className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="تغییر حالت نمایش شبیه‌ساز / تمام صفحه"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>تمرکز روی گوشی مشتری</span>
              </button>

              <button
                onClick={handleTriggerSync}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-indigo-600' : ''}`} />
                <span>همگام‌سازی</span>
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Sync Status Banner */}
        {!isFullScreenPhone && (
          <div className="mt-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>ارتباط بلادرنگ فعال است:</strong> فاکتورهای صندوق، کاتالوگ قیمت و نوبت‌های تحویل انبار به صورت لحظه‌ای با گوشی مشتری هماهنگ است.
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0">
              نسخه اپلیکیشن مشتری: v3.2.0 (اختصاصی شعبه)
            </span>
          </div>
        )}

        {/* Main Grid: POS Customer Controller (Left) + Interactive Customer Smartphone (Right) */}
        <div className={`mt-4 grid gap-6 ${isFullScreenPhone ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
          
          {/* Left Column: POS Cashier Controls (Hidden if isFullScreenPhone) */}
          {!isFullScreenPhone && (
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>انتخاب مشتری حضوری / طرف حساب دفتری:</span>
                  <span className="text-[11px] text-slate-400 font-normal">{customers.length} حساب فعال</span>
                </label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const c = customers.find(item => item.id === e.target.value);
                    if (c) setSelectedCustomer(c);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs"
                >
                  {customers.map(cust => (
                    <option key={cust.id} value={cust.id}>
                      {cust.name} ({cust.phone}) — {cust.balance > 0 ? `بدهکار: ${formatToman(cust.balance)}` : cust.balance < 0 ? `بستانکار: ${formatToman(Math.abs(cust.balance))}` : 'تسویه'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{selectedCustomer.name}</h4>
                      <span className="text-slate-500 font-mono text-[11px] mt-0.5 block">{selectedCustomer.phone}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                      selectedCustomer.balance > 0 
                        ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                        : selectedCustomer.balance < 0 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedCustomer.balance > 0 ? `مانده بدهی: ${formatToman(selectedCustomer.balance)}` : 'حساب تسویه'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">شهر / منطقه:</span>
                      <span className="font-bold text-slate-800">{selectedCustomer.city || 'تهران (منطقه ۵)'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">تعداد فاکتورهای ثبت شده:</span>
                      <span className="font-bold text-indigo-700 font-mono text-xs">{customerInvoices.length} فاکتور رسمی</span>
                    </div>
                    <div className="col-span-2 bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">نشانی تحویل فروشگاه:</span>
                      <span className="font-bold text-slate-700 truncate block">{selectedCustomer.address || 'تحویل حضوری در باجه انبار مرکزی جنت‌آباد'}</span>
                    </div>
                  </div>

                  {/* QR Code & Direct Link Hub */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    
                    {/* Link Type Selector Tabs */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                          <span>انتخاب نوع لینک و بارکد QR برای مشتری:</span>
                        </span>
                        <span className="text-[10px] text-indigo-600 font-bold">تولید خودکار QR Code</span>
                      </label>
                      
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setSelectedLinkType('customer')}
                          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                            selectedLinkType === 'customer'
                              ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200 font-black'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Users className="w-3 h-3" />
                          <span className="truncate">لینک اختصاصی مشتری</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedLinkType('catalog')}
                          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                            selectedLinkType === 'catalog'
                              ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200 font-black'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Package className="w-3 h-3" />
                          <span className="truncate">کاتالوگ عمومی</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedLinkType('pickup')}
                          className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                            selectedLinkType === 'pickup'
                              ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200 font-black'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span className="truncate">نوبت‌گیری فوری باجه</span>
                        </button>
                      </div>
                    </div>

                    {/* QR Code and Actions Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        
                        {/* Interactive QR Code Box */}
                        <div 
                          onClick={() => setIsQrEnlarged(true)}
                          className="group relative cursor-pointer bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-2xl border border-slate-200 transition-all shrink-0 flex flex-col items-center justify-center shadow-2xs"
                          title="برای بزرگ‌نمایی تمام‌صفحه QR کد کلیک کنید"
                        >
                          <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200/80">
                            <QRCodeSVG 
                              value={currentActiveUrl}
                              size={110}
                              level="M"
                              includeMargin={false}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 group-hover:text-indigo-600 mt-1.5 flex items-center gap-1">
                            <Maximize2 className="w-2.5 h-2.5" />
                            <span>بزرگ‌نمایی QR کد</span>
                          </span>
                        </div>

                        {/* Details & Link Info */}
                        <div className="flex-1 space-y-2 min-w-0 text-right w-full">
                          <div>
                            <h5 className="font-black text-xs text-slate-900 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>{currentActiveTitle}</span>
                            </h5>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                              {selectedLinkType === 'customer'
                                ? 'مشتری با اسکن این QR کد وارد حساب دفتری، مشاهده فاکتورهای رسمی و ثبت سفارش اختصاصی می‌شود.'
                                : selectedLinkType === 'catalog'
                                  ? 'مناسب برای اسکن توسط تمامی مراجعین حضوری جهت مشاهده استعلام قیمت و کاتالوگ.'
                                  : 'مشتری بدون معطلی کارتن‌ها را رزرو کرده و نوبت تحویل باجه انبار دریافت می‌کند.'}
                            </p>
                          </div>

                          {/* URL input and Copy */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              readOnly
                              dir="ltr"
                              value={currentActiveUrl}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-slate-600 select-all"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(currentActiveUrl);
                                setCopiedLink(true);
                                setTimeout(() => setCopiedLink(false), 2000);
                              }}
                              className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[10px] font-bold transition-colors flex items-center gap-1 shrink-0"
                            >
                              {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedLink ? 'کپی شد' : 'کپی'}</span>
                            </button>
                            <a
                              href={currentActiveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-slate-100 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
                              title="باز کردن در پنجره جدید"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                      </div>

                      {/* SMS dispatch & Print actions */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        {selectedLinkType === 'customer' && (
                          <button
                            onClick={handleSendAppSms}
                            disabled={smsSending}
                            className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{smsSending ? 'در حال ارسال پیامک...' : 'ارسال پیامک لینک به شماره مشتری'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => setIsQrEnlarged(true)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                          <span>نمایش استند و QR بزرگ</span>
                        </button>
                      </div>

                      {smsSentNotice && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>پیامک حاوی لینک و اطلاعات دسترسی به شماره {selectedCustomer.phone} با موفقیت ارسال شد.</span>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              )}

              {/* Instructions Box */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1.5">
                <div className="font-black flex items-center gap-1.5 text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>راهنمای استفاده در شعبه حضوری:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  مشتری با اسکن QR Code یا باز کردن لینک در مرورگر گوشی، نیازی به نصب فایل apk ندارد و مستقیماً اپ PWA باز می‌شود. مشتری می‌تواند فاکتورهای قبلی را ببیند، منوی کالاها را بررسی کند و پیش از رسیدن به باجه، کارتن‌های مورد نظرش را رزرو نماید.
                </p>
              </div>
            </div>
          )}

          {/* Right Column: Interactive Smartphone Mockup (What Customer Sees) */}
          <div className={`${isFullScreenPhone ? 'w-full' : 'lg:col-span-6'} flex flex-col items-center justify-center`}>
            
            <div className="w-full max-w-[390px] sm:max-w-[410px] bg-slate-900 rounded-[36px] p-2.5 sm:p-3 shadow-2xl border-[4px] border-slate-800 text-slate-100 flex flex-col relative overflow-hidden mx-auto">
              
              {/* Phone Speaker & Camera Notch */}
              <div className="w-full flex justify-center items-center pb-2 pt-0.5">
                <div className="w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center gap-1.5 px-3">
                  <span className="w-2 h-2 rounded-full bg-slate-950"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80"></span>
                </div>
              </div>

              {/* Screen Content Container */}
              <div className="bg-slate-950 rounded-[26px] overflow-hidden flex flex-col text-slate-200 min-h-[550px] max-h-[610px] sm:max-h-[640px] border border-slate-800/80">
                
                {/* 1. APP TOP BAR */}
                <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xs shadow-md">
                      S
                    </div>
                    <div>
                      <div className="font-black text-xs text-white leading-tight">پخش عمده سوین (شعبه انبار)</div>
                      <div className="text-[10px] text-slate-400 font-medium">اپلیکیشن همراه مشتریان حضوری</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      آنلاین
                    </span>
                  </div>
                </div>

                {/* 2. CUSTOMER IDENTITY CARD INSIDE MOBILE */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-2.5 border-b border-slate-800/80 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400">حساب: </span>
                      <strong className="text-xs text-white font-black">{selectedCustomer?.name || 'مشتری حضوری'}</strong>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 ml-1">مانده:</span>
                      <span className={`text-xs font-mono font-black ${
                        (selectedCustomer?.balance || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {(selectedCustomer?.balance || 0) > 0 ? formatToman(selectedCustomer?.balance || 0) : 'تسویه'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. MOBILE APP NAVIGATION TABS (The core 4 features) */}
                <div className="grid grid-cols-4 bg-slate-900/95 border-b border-slate-800 text-[10px] font-black shrink-0">
                  <button
                    onClick={() => setAppTab('invoices')}
                    className={`py-2 flex flex-col items-center gap-1 transition-all ${
                      appTab === 'invoices' 
                        ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/40 font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>فاکتورها</span>
                  </button>

                  <button
                    onClick={() => setAppTab('catalog')}
                    className={`py-2 flex flex-col items-center gap-1 transition-all ${
                      appTab === 'catalog' 
                        ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/40 font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>محصولات</span>
                  </button>

                  <button
                    onClick={() => setAppTab('pickup')}
                    className={`py-2 flex flex-col items-center gap-1 transition-all relative ${
                      appTab === 'pickup' 
                        ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-950/30 font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>تحویل باجه</span>
                    {pickupCart.length > 0 && (
                      <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                        {cartTotalItemsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setAppTab('ledger')}
                    className={`py-2 flex flex-col items-center gap-1 transition-all ${
                      appTab === 'ledger' 
                        ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/40 font-black' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>حساب و نوبت</span>
                  </button>
                </div>

                {/* 4. MAIN SCROLLABLE APP BODY */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                  
                  {/* ====== TAB 1: INVOICES (فاکتورهای من) ====== */}
                  {appTab === 'invoices' && (
                    <div className="space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-300 flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                          <span>لیست تمام فاکتورهای ثبت شده صندوق:</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{customerInvoices.length} مورد</span>
                      </div>

                      {customerInvoices.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                          <Receipt className="w-8 h-8 text-slate-700 mx-auto" />
                          <p className="text-xs text-slate-400">هنوز فاکتوری برای این حساب ثبت نشده است.</p>
                          <button
                            onClick={() => setAppTab('catalog')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700"
                          >
                            مشاهده کاتالوگ و ثبت سفارش
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {customerInvoices.map(rcpt => (
                            <div 
                              key={rcpt.id}
                              onClick={() => setViewingReceipt(rcpt)}
                              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 p-3 rounded-2xl transition-all cursor-pointer space-y-2"
                            >
                              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-mono font-black text-indigo-400">{rcpt.receiptNumber}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">{rcpt.createdAt.split(' ')[0]}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  rcpt.paymentMethod === 'ledger' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {rcpt.paymentMethod === 'ledger' ? 'نسیه دفتری' : rcpt.paymentMethod === 'pos_terminal' ? 'کارتخوان' : 'تسویه شده'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">
                                  {rcpt.items.length} ردیف کالا ({rcpt.items.reduce((s, i) => s + i.quantity, 0)} واحد)
                                </span>
                                <span className="font-mono font-black text-white text-xs">
                                  {formatToman(rcpt.finalTotal)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3 text-indigo-400" />
                                  <span>مشاهده فیش حرارتی و ریز اقلام</span>
                                </span>
                                <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ====== TAB 2: PRODUCTS & BRANDS CATALOG (منوی محصولات و برندها) ====== */}
                  {appTab === 'catalog' && (
                    <div className="space-y-3 animate-in fade-in">
                      
                      {/* Search in Mobile App */}
                      <div className="relative">
                        <input
                          type="text"
                          value={catalogSearch}
                          onChange={(e) => setCatalogSearch(e.target.value)}
                          placeholder="جستجوی سیگار، ایکاس، تنباکو..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                        {catalogSearch && (
                          <button onClick={() => setCatalogSearch('')} className="absolute left-2.5 top-2.5 text-slate-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Category Chips Horizontal Scroll */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {APP_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setCatalogCategory(cat.id);
                              setCatalogBrand('all');
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 flex items-center gap-1 transition-all ${
                              catalogCategory === cat.id
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Brand Chips Filter */}
                      {availableBrands.length > 0 && (
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                          <button
                            onClick={() => setCatalogBrand('all')}
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold shrink-0 ${
                              catalogBrand === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-500'
                            }`}
                          >
                            همه برندها
                          </button>
                          {availableBrands.slice(0, 10).map(brand => (
                            <button
                              key={brand}
                              onClick={() => setCatalogBrand(brand)}
                              className={`px-2 py-0.5 rounded-lg text-[9px] font-bold shrink-0 ${
                                catalogBrand === brand ? 'bg-indigo-700 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800'
                              }`}
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Products List for In-Branch Customer */}
                      <div className="space-y-2">
                        {filteredProducts.length === 0 ? (
                          <div className="text-center py-8 text-slate-500 text-xs">
                            محصولی با این مشخصات یافت نشد.
                          </div>
                        ) : (
                          filteredProducts.slice(0, 20).map(prod => {
                            const isDrink = prod.category === 'drinks_coffee';
                            const cartQtyCarton = pickupCart.find(it => it.product.id === prod.id && it.unit === 'carton')?.quantity || 0;
                            const cartQtyBox = pickupCart.find(it => it.product.id === prod.id && it.unit === 'box')?.quantity || 0;
                            const cartQtyPack = pickupCart.find(it => it.product.id === prod.id && it.unit === 'pack')?.quantity || 0;

                            return (
                              <div key={prod.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden border border-slate-700">
                                      {prod.image ? (
                                        <img src={prod.image} alt={prod.nameFa || prod.nameEn} className="w-full h-full object-cover" />
                                      ) : (
                                        <Package className="w-5 h-5 text-indigo-400" />
                                      )}
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-xs text-white leading-tight">{prod.nameFa || prod.nameEn}</h5>
                                      <span className="text-[9px] text-slate-400 block">
                                        {prod.brand} {isDrink ? '| فروش تکی و حضوری' : `| ${prod.boxesPerCarton} باکس در کارتن`}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[9px] font-bold shrink-0">
                                    موجود انبار
                                  </span>
                                </div>

                                {/* Prices & 1-Tap Add to Pickup */}
                                {isDrink ? (
                                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[10px]">
                                    <span className="text-slate-400 text-[9px]">قیمت تک / عدد:</span>
                                    <span className="font-mono font-black text-emerald-400 text-xs">
                                      {formatToman(getItemUnitPrice(prod, 'pack'))}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-[10px]">
                                    <div>
                                      <span className="text-slate-500 block text-[9px]">قیمت هر کارتن:</span>
                                      <span className="font-mono font-black text-indigo-300">{formatToman(prod.cartonPrice)}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[9px]">قیمت هر باکس:</span>
                                      <span className="font-mono font-black text-amber-300">{formatToman(prod.boxPrice)}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-0.5">
                                  {isDrink ? (
                                    <button
                                      onClick={() => handleAddToCart(prod, 'pack')}
                                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>+ افزودن تکی {cartQtyPack > 0 ? `(${cartQtyPack})` : ''}</span>
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleAddToCart(prod, 'carton')}
                                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>+ کارتن {cartQtyCarton > 0 ? `(${cartQtyCarton})` : ''}</span>
                                      </button>

                                      <button
                                        onClick={() => handleAddToCart(prod, 'box')}
                                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all border border-slate-700"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>+ باکس {cartQtyBox > 0 ? `(${cartQtyBox})` : ''}</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Sticky Quick Go to Pickup Bar if items in cart */}
                      {pickupCart.length > 0 && (
                        <div className="sticky bottom-0 bg-amber-500 text-slate-950 p-2.5 rounded-2xl flex items-center justify-between shadow-xl animate-in slide-in-from-bottom">
                          <div>
                            <span className="font-black text-xs block">{cartTotalItemsCount} قلم کالا انتخاب شد</span>
                            <span className="text-[10px] font-mono font-bold">{formatToman(cartTotalAmount)}</span>
                          </div>
                          <button
                            onClick={() => setAppTab('pickup')}
                            className="px-3.5 py-1.5 bg-slate-950 text-white font-black text-[11px] rounded-xl flex items-center gap-1 shadow-md"
                          >
                            <span>ثبت نوبت باجه</span>
                            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                  {/* ====== TAB 3: IN-PERSON EXPRESS PICKUP (تحویل حضوری در باجه انبار - فوق‌العاده راحت) ====== */}
                  {appTab === 'pickup' && (
                    <div className="space-y-3 animate-in fade-in">
                      
                      {/* If Active Pickup Pass exists, show the digital ticket */}
                      {activePickupPass ? (
                        <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/70 rounded-2xl p-4 text-center space-y-3 shadow-xl animate-in zoom-in-95">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black mx-auto shadow-lg shadow-amber-500/30">
                            <CheckCheck className="w-6 h-6" />
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block">قبض تحویل فوری باجه انبار</span>
                            <h4 className="text-2xl font-black text-white font-mono mt-1">شماره نوبت: {activePickupPass.token}</h4>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">کد سفارش: {activePickupPass.orderId}</span>
                          </div>

                          {/* QR Code Pass for Warehouse Counter Scanner */}
                          <div className="bg-white p-3 rounded-2xl inline-block mx-auto shadow-md">
                            <QRCodeSVG 
                              value={`SVN-PICKUP:${activePickupPass.orderId}:${activePickupPass.token}`}
                              size={104}
                              level="M"
                              includeMargin={false}
                              className="mx-auto"
                            />
                            <span className="text-[9px] font-black text-slate-800 block mt-1.5">نشان دادن به مسئول باجه</span>
                          </div>

                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1 text-right">
                            <div className="flex justify-between">
                              <span className="text-slate-400">محل باجه:</span>
                              <span className="font-bold text-amber-300">{activePickupPass.counterName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">زمان تحویل:</span>
                              <span className="font-bold text-slate-200">{activePickupPass.timingLabel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">مبلغ قابل پرداخت:</span>
                              <span className="font-mono font-black text-emerald-400">{formatToman(activePickupPass.totalAmount)}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setActivePickupPass(null);
                              setAppTab('invoices');
                            }}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
                          >
                            مشاهده فاکتورهای من و بستن نوبت
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-amber-400" />
                              <span>سبد تحویل حضوری در باجه:</span>
                            </h4>
                            <button
                              onClick={() => setAppTab('catalog')}
                              className="text-[10px] text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
                            >
                              <Plus className="w-3 h-3" />
                              <span>افزودن کالا از کاتالوگ</span>
                            </button>
                          </div>

                          {/* Pickup Cart Items List */}
                          {pickupCart.length === 0 ? (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                              <ShoppingCart className="w-8 h-8 text-slate-700 mx-auto" />
                              <p className="text-xs text-slate-400">سبد تحویل باجه خالی است.</p>
                              <button
                                onClick={() => setAppTab('catalog')}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-colors"
                              >
                                انتخاب سیگار و کالا از کاتالوگ
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {pickupCart.map((item, idx) => (
                                <div key={`${item.product.id}_${item.unit}_${idx}`} className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                      <h6 className="font-bold text-xs text-white truncate">{item.product.nameFa || item.product.nameEn}</h6>
                                      <span className="text-[9px] text-slate-400">واحد: {getUnitLabel(item.unit, item.product.category)}</span>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveFromCart(item.product.id, item.unit)}
                                      className="text-slate-500 hover:text-rose-400 p-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                                    <div className="flex items-center gap-1.5 bg-slate-950 rounded-xl px-2 py-1 border border-slate-800">
                                      <button
                                        onClick={() => handleUpdateCartQty(item.product.id, item.unit, -1)}
                                        className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="font-mono font-black text-xs text-white px-1.5">{item.quantity}</span>
                                      <button
                                        onClick={() => handleUpdateCartQty(item.product.id, item.unit, 1)}
                                        className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>

                                    <span className="font-mono font-black text-amber-300 text-xs">
                                      {formatToman(getItemUnitPrice(item.product, item.unit) * item.quantity)}
                                    </span>
                                  </div>
                                </div>
                              ))}

                              {/* Step 2: Choose Pickup Counter */}
                              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2">
                                <label className="block text-[10px] font-black text-slate-300">
                                  ۱. انتخاب باجه تحویل در انبار:
                                </label>
                                <div className="space-y-1.5">
                                  <label 
                                    onClick={() => setSelectedCounter('counter_1')}
                                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                      selectedCounter === 'counter_1' ? 'bg-indigo-950/40 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input type="radio" checked={selectedCounter === 'counter_1'} readOnly className="accent-indigo-500" />
                                      <span className="text-[11px] font-bold">باجه ۱: اکسپرس تحویل فوری (۳ دقیقه)</span>
                                    </div>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400">خلوت</span>
                                  </label>

                                  <label 
                                    onClick={() => setSelectedCounter('counter_2')}
                                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                      selectedCounter === 'counter_2' ? 'bg-indigo-950/40 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input type="radio" checked={selectedCounter === 'counter_2'} readOnly className="accent-indigo-500" />
                                      <span className="text-[11px] font-bold">باجه ۲: بارگیری ترابری و وانت/اسنپ</span>
                                    </div>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400">سفارش عمده</span>
                                  </label>

                                  <label 
                                    onClick={() => setSelectedCounter('counter_3')}
                                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                      selectedCounter === 'counter_3' ? 'bg-indigo-950/40 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input type="radio" checked={selectedCounter === 'counter_3'} readOnly className="accent-indigo-500" />
                                      <span className="text-[11px] font-bold">باجه ۳: باجه تخصصی ایکاس و ویپ</span>
                                    </div>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400">تخصصی</span>
                                  </label>
                                </div>
                              </div>

                              {/* Step 3: Choose Timing */}
                              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2">
                                <label className="block text-[10px] font-black text-slate-300">
                                  ۲. زمان حضور شما در شعبه:
                                </label>
                                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                                  <button
                                    onClick={() => setPickupTiming('now')}
                                    className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                                      pickupTiming === 'now' ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' : 'bg-slate-950 text-slate-400 border-slate-800'
                                    }`}
                                  >
                                    ⚡ هم‌اکنون در شعبه
                                  </button>
                                  <button
                                    onClick={() => setPickupTiming('15_min')}
                                    className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                                      pickupTiming === '15_min' ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' : 'bg-slate-950 text-slate-400 border-slate-800'
                                    }`}
                                  >
                                    ⏱️ تا ۱۵ دقیقه دیگر
                                  </button>
                                  <button
                                    onClick={() => setPickupTiming('1_hour')}
                                    className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                                      pickupTiming === '1_hour' ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' : 'bg-slate-950 text-slate-400 border-slate-800'
                                    }`}
                                  >
                                    🕒 تا ۱ ساعت دیگر
                                  </button>
                                </div>
                              </div>

                              {/* Summary & 1-Click Order Confirmation */}
                              <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-2">
                                <div className="flex justify-between text-xs font-black">
                                  <span className="text-slate-400">جمع کل سفارش تحویل حضوری:</span>
                                  <span className="font-mono text-amber-400">{formatToman(cartTotalAmount)}</span>
                                </div>

                                <button
                                  onClick={handleSubmitPickupOrder}
                                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Check className="w-4 h-4 text-slate-950" />
                                  <span>تایید نهایی و صدور آنی نوبت و بارکد تحویل</span>
                                </button>
                              </div>

                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                  {/* ====== TAB 4: LEDGER & CONTACT (حساب دفتری و آدرس انبار) ====== */}
                  {appTab === 'ledger' && (
                    <div className="space-y-3 animate-in fade-in text-xs">
                      
                      {/* Financial Status Card */}
                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-slate-300">وضعیت حساب دفتری شما:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            (selectedCustomer?.balance || 0) > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {(selectedCustomer?.balance || 0) > 0 ? 'بدهکار' : 'تسویه کامل'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">مبلغ مانده حساب:</span>
                          <span className="font-mono font-black text-sm text-white">
                            {(selectedCustomer?.balance || 0) > 0 ? formatToman(selectedCustomer?.balance || 0) : '۰ تومان'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>سقف اعتبار نسیه مجاز:</span>
                          <span className="font-mono text-slate-300">۵۰,۰۰۰,۰۰۰ تومان</span>
                        </div>
                      </div>

                      {/* Warehouse Counter Location & Direct Phone */}
                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-indigo-400" />
                          <span>اطلاعات انبار و تحویل حضوری:</span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          تهران، بزرگراه شهید همت، جنت‌آباد مرکزی، انبار مرکزی توزیع و پخش عمده سوین
                        </p>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">تماس مستقیم با مدیریت:</span>
                          <a 
                            href="tel:09120759419" 
                            dir="ltr"
                            className="font-mono font-black text-indigo-400 text-xs hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>۰۹۱۲۰۷۵۹۴۱۹</span>
                          </a>
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* 5. IN-APP THERMAL RECEIPT MODAL (فیش اختصاصی فاکتور) */}
                {viewingReceipt && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-xs z-50 p-4 flex flex-col justify-between overflow-y-auto animate-in fade-in">
                    
                    {/* Thermal Receipt Paper Canvas */}
                    <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-2xl space-y-3 font-sans text-xs my-auto">
                      
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="text-right">
                          <div className="font-black text-xs text-slate-900">پخش عمده دخانیات سوین</div>
                          <div className="text-[9px] text-slate-500">فیش تحویل و فروش صندوق</div>
                        </div>
                        <button
                          onClick={() => setViewingReceipt(null)}
                          className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[10px] space-y-0.5 text-slate-600">
                        <div className="flex justify-between">
                          <span>شماره فاکتور:</span>
                          <span className="font-mono font-bold text-slate-900">{viewingReceipt.receiptNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>تاریخ و ساعت:</span>
                          <span className="font-mono">{viewingReceipt.createdAt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>نام مشتری:</span>
                          <span className="font-bold text-slate-800">{viewingReceipt.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>صندوقدار / باجه:</span>
                          <span>{viewingReceipt.cashier || 'انبار مرکزی'}</span>
                        </div>
                      </div>

                      {/* Items List Table */}
                      <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5">
                        <div className="grid grid-cols-12 text-[9px] font-black text-slate-500 pb-1 border-b border-slate-100">
                          <span className="col-span-6">شرح کالا</span>
                          <span className="col-span-2 text-center">تعداد</span>
                          <span className="col-span-4 text-left">مبلغ کل</span>
                        </div>

                        {viewingReceipt.items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 text-[10px] text-slate-800">
                            <span className="col-span-6 truncate font-medium">{item.product.nameFa || item.product.nameEn} ({item.unit === 'carton' ? 'کارتن' : 'باکس'})</span>
                            <span className="col-span-2 text-center font-mono font-bold">{item.quantity}</span>
                            <span className="col-span-4 text-left font-mono font-black">{formatToman(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between font-black text-slate-900 pt-1">
                          <span>مبلغ نهایی فاکتور:</span>
                          <span className="font-mono text-indigo-700">{formatToman(viewingReceipt.finalTotal)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>روش تسویه:</span>
                          <span>{viewingReceipt.paymentMethod === 'ledger' ? 'نسیه دفتری' : viewingReceipt.paymentMethod === 'pos_terminal' ? 'کارتخوان باجه' : 'نقدی'}</span>
                        </div>
                      </div>

                      {/* Barcode representation */}
                      <div className="text-center pt-2 border-t border-dashed border-slate-200">
                        <div className="h-7 bg-slate-900 rounded mx-6 flex items-center justify-center text-[9px] font-mono text-white tracking-widest">
                          |||||| ||| | ||||| ||||||| ||
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 block mt-1">با تشکر از خرید و اعتماد شما - انبار سوین</span>
                      </div>

                      <button
                        onClick={() => setViewingReceipt(null)}
                        className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-indigo-700"
                      >
                        بازگشت به اپلیکیشن
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>پشتیبانی کامل از بارکدخوان، تولید زنده QR Code، رزرو باجه و همگام‌سازی ابری</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            بستن پنجره
          </button>
        </div>

      </div>

      {/* Fullscreen Enlarged QR Lightbox Modal */}
      {isQrEnlarged && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setIsQrEnlarged(false);
          }}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-right">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">{currentActiveTitle}</h4>
                  <span className="text-[10px] text-slate-500 block">انبار پخش عمده دخانیات سوین</span>
                </div>
              </div>
              <button
                onClick={() => setIsQrEnlarged(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Link Type Selector Inside Lightbox */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setSelectedLinkType('customer')}
                className={`py-1.5 px-1 rounded-lg transition-all ${
                  selectedLinkType === 'customer'
                    ? 'bg-white text-indigo-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مشتری
              </button>
              <button
                type="button"
                onClick={() => setSelectedLinkType('catalog')}
                className={`py-1.5 px-1 rounded-lg transition-all ${
                  selectedLinkType === 'catalog'
                    ? 'bg-white text-indigo-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                کاتالوگ
              </button>
              <button
                type="button"
                onClick={() => setSelectedLinkType('pickup')}
                className={`py-1.5 px-1 rounded-lg transition-all ${
                  selectedLinkType === 'pickup'
                    ? 'bg-white text-indigo-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                باجه اکسپرس
              </button>
            </div>

            {/* High-Resolution QR Display */}
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-indigo-200 inline-block mx-auto shadow-inner">
              <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/80">
                <QRCodeSVG 
                  value={currentActiveUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="mx-auto"
                />
              </div>
            </div>

            {/* Instruction */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 text-[11px] text-indigo-950 font-medium leading-relaxed">
              📷 دوربین گوشی هوشمند خود را روبه‌روی این کیو‌آر کد بگیرید تا لینک بدون نیاز به نصب باز شود.
            </div>

            {/* URL Input Box */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                dir="ltr"
                value={currentActiveUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[10px] font-mono text-slate-700 select-all"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentActiveUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'کپی شد' : 'کپی'}</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsQrEnlarged(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              بستن پنجره QR کد
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
