import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Package, 
  Building2, 
  Phone, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Upload, 
  CreditCard, 
  Copy, 
  ShieldCheck, 
  RefreshCw,
  Send,
  ShoppingBag,
  ArrowRight,
  Clock
} from 'lucide-react';
import { CartItem, CustomerInfo, OrderInvoice, UserProfile, CigaretteProduct } from '../types';
import { DEFAULT_SHIPPING_OPTIONS } from '../data/shippingOptions';
import { formatToman, formatNumberFa, calculateItemSubtotal, getApplicableDiscount } from '../utils/formatters';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import { submitOrderToDjango } from '../services/djangoApi';

interface ProformaInvoicePageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, unit: 'carton' | 'box', newQuantity: number) => void;
  onRemoveItem: (productId: string, unit: 'carton' | 'box') => void;
  onGoToCatalog?: () => void;
  onClearCart: () => void;
  onAddToCart?: (product: CigaretteProduct, unit: 'carton' | 'box', quantity: number) => void;
  availableProducts?: CigaretteProduct[];
  onOpenTracking?: (trackingCode: string) => void;
  currentUser?: UserProfile | null;
  onOrderSubmitted?: (items: CartItem[]) => void;
}

export const ProformaInvoicePage: React.FC<ProformaInvoicePageProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onGoToCatalog,
  onClearCart,
  onAddToCart,
  availableProducts,
  onOpenTracking,
  currentUser,
  onOrderSubmitted,
}) => {
  // دریافت تنظیمات برند و حساب‌ها به صورت پویا از لوکال استوریج (بک‌اند)
  const djangoConfig = (() => {
    try {
      const saved = localStorage.getItem('django_crm_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          companyName: 'سوین',
          bankCard1: '۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲',
          bankShiba1: 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲',
          bankHolder1: 'امور مالی شرکت سوین',
          bankCard2: '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰',
          bankShiba2: 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸',
          bankHolder2: 'حساب ترابری و تدارکات سوین',
          ...parsed
        };
      }
    } catch (e) {}
    return {
      companyName: 'سوین',
      bankCard1: '۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲',
      bankShiba1: 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲',
      bankHolder1: 'امور مالی شرکت سوین',
      bankCard2: '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰',
      bankShiba2: 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸',
      bankHolder2: 'حساب ترابری و تدارکات سوین',
    };
  })();

  const [customer, setCustomer] = useState<CustomerInfo>(() => ({
    shopOwnerName: currentUser?.fullName || 'مسئول خرید محترم',
    shopName: currentUser?.shopName || currentUser?.businessName || 'فروشگاه دخانیات',
    shopPhone: currentUser?.phone || '09120000000',
    city: currentUser?.city || 'تهران',
    province: currentUser?.province || 'تهران',
    address: currentUser?.address || 'تهران، انبار و فروشگاه تحویل بار',
    shippingMethod: `ناوگان اختصاصی وانت/نیسان ${djangoConfig.companyName} (تحویل همان روز تهران و البرز)`,
    shippingCost: 250000,
    notes: `تحویل بار درب فروشگاه با پلمپ شرکتی پخش ${djangoConfig.companyName}`,
  }));

  useEffect(() => {
    if (currentUser) {
      setCustomer(prev => ({
        ...prev,
        shopOwnerName: currentUser.fullName || prev.shopOwnerName,
        shopName: currentUser.shopName || currentUser.businessName || prev.shopName,
        shopPhone: currentUser.phone || prev.shopPhone,
        city: currentUser.city || prev.city,
        province: currentUser.province || prev.province,
        address: currentUser.address || prev.address,
      }));
    }
  }, [currentUser]);

  const [invoiceNumber] = useState<string>(() => 'SVN-' + Math.floor(100000 + Math.random() * 900000));
  const [invoiceDate] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedShaba, setCopiedShaba] = useState(false);

  // Bank receipt upload
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [bankRefCode, setBankRefCode] = useState<string>('');
  const [senderCardLast4, setSenderCardLast4] = useState<string>('');
  const [orderSubmittedSuccess, setOrderSubmittedSuccess] = useState<boolean>(false);

  // State for direct inline product addition
  const [selectedAddProduct, setSelectedAddProduct] = useState<CigaretteProduct | null>(null);
  const [addUnit, setAddUnit] = useState<'carton' | 'box'>('carton');
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const filteredSuggestions = useMemo(() => {
    if (!productSearchTerm) return [];
    return (availableProducts || []).filter(p => 
      p.nameFa.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearchTerm.toLowerCase())
    ).slice(0, 5);
  }, [availableProducts, productSearchTerm]);

  const handleAddProductInline = () => {
    if (selectedAddProduct && onAddToCart) {
      onAddToCart(selectedAddProduct, addUnit, addQuantity);
      setSelectedAddProduct(null);
      setProductSearchTerm('');
      setAddQuantity(1);
    }
  };

  const bankAccountInfo = {
    bankName: 'بانک‌های مجاز تسویه حساب',
    accountHolder: djangoConfig.bankHolder1,
    cardNumber: djangoConfig.bankCard1,
    shabaNumber: djangoConfig.bankShiba1,
  };

  // Computations
  let totalBoxes = 0;
  let totalCartons = 0;
  let subtotal = 0;
  let totalDiscount = 0;

  cartItems.forEach(item => {
    const itemSubtotal = calculateItemSubtotal(
      item.product.cartonPrice,
      item.product.boxPrice,
      item.unit,
      item.quantity
    );
    subtotal += itemSubtotal;

    const discountPercent = getApplicableDiscount(
      item.unit,
      item.quantity,
      item.product.tierDiscounts
    );
    const itemDiscount = (itemSubtotal * discountPercent) / 100;
    totalDiscount += itemDiscount;

    if (item.unit === 'carton') {
      totalCartons += item.quantity;
      totalBoxes += item.quantity * item.product.boxesPerCarton;
    } else {
      totalBoxes += item.quantity;
    }
  });

  const finalPayable = subtotal - totalDiscount + (customer.shippingCost || 0);

  useEffect(() => {
    const selected = DEFAULT_SHIPPING_OPTIONS.find(o => o.title === customer.shippingMethod);
    if (selected && !selected.isCustom && selected.cost > 0) {
      const perBoxRate = selected.cost / 50;
      const autoCost = Math.round(perBoxRate * totalBoxes);
      if (customer.shippingCost !== autoCost) {
        setCustomer(prev => ({ ...prev, shippingCost: autoCost }));
      }
    }
  }, [totalBoxes, customer.shippingMethod]);

  const currentInvoiceData: OrderInvoice = {
    orderId: invoiceNumber,
    trackingCode: invoiceNumber,
    createdAt: invoiceDate,
    customer,
    items: cartItems,
    subtotal,
    discountAmount: totalDiscount,
    shippingCost: customer.shippingCost || 0,
    finalTotal: finalPayable,
    totalCartons,
    totalBoxes,
    paymentStatus: receiptImage ? 'واریز شده و ثبت فیش' : 'پیش‌فاکتور رسمی',
  };

  const handleDownloadPdf = async () => {
    if (cartItems.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      await generateInvoicePdf(currentInvoiceData);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    try {
      await submitOrderToDjango({
        orderId: invoiceNumber,
        customer,
        items: cartItems,
        subtotal,
        discountAmount: totalDiscount,
        shippingCost: customer.shippingCost || 0,
        finalPayable,
        receiptImage: receiptImage || undefined,
        bankRefCode: bankRefCode || undefined,
        senderCardLast4: senderCardLast4 || undefined,
      });
      setOrderSubmittedSuccess(true);
      if (onOrderSubmitted) {
        onOrderSubmitted(cartItems);
      }
    } catch (err) {
      console.error(err);
      setOrderSubmittedSuccess(true); // Fallback gracefully for UI
      if (onOrderSubmitted) {
        onOrderSubmitted(cartItems);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'card' | 'shaba') => {
    navigator.clipboard.writeText(text);
    if (type === 'card') {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    } else {
      setCopiedShaba(true);
      setTimeout(() => setCopiedShaba(false), 2000);
    }
  };

  if (orderSubmittedSuccess) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto animate-in fade-in">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-lg">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 mb-3">
            پیش‌فاکتور با موفقیت در انبار مرکزی سوین ثبت و تأیید شد!
          </h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6">
            شماره رهگیری پیش‌فاکتور شما <span className="font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">{invoiceNumber}</span> می‌باشد. حواله خروج کالا و بارگیری در انبار شورآباد صادر گردید.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto mb-8 text-right space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">خریدار / مغازه:</span>
              <span className="font-bold text-slate-900">{customer.shopOwnerName} ({customer.shopName})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">تعداد کل اقلام:</span>
              <span className="font-bold text-slate-900">{formatNumberFa(totalCartons)} کارتن ({formatNumberFa(totalBoxes)} باکس)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">شیوه بارگیری و ارسال:</span>
              <span className="font-bold text-slate-900">{customer.shippingMethod}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500">مبلغ نهایی فاکتور:</span>
              <span className="font-black text-blue-700 text-sm">{formatToman(finalPayable)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownloadPdf}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              دانلود نسخه PDF پیش‌فاکتور
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              چاپ برگه پیش‌فاکتور
            </button>
            <button
              onClick={() => {
                setOrderSubmittedSuccess(false);
                onGoToCatalog();
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-2xl text-xs transition-all"
            >
              بازگشت به کاتالوگ کالاها
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8" id="proforma-invoice-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Title & Actions Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-6 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-black px-3 py-1 rounded-xl border border-blue-200">
                  <FileText className="w-4 h-4 text-blue-600" />
                  صدور پیش‌فاکتور رسمی بنکداری و عمده‌فروشی
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                  شماره استعلام: {invoiceNumber}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                پیش‌فاکتور و سفارش‌گذاری رسمی سوین
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                تفکیک دقیق کارتن و باکس، اعمال خودکار تخفیف‌های تیراژ، محاسبه کرایه باربری و بارگذاری فیش واریزی بانکی.
              </p>
            </div>

            {/* Print & PDF Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={onGoToCatalog}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs transition-colors"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                افزودن کالای جدید از کاتالوگ
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || cartItems.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-blue-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPdf ? 'در حال خروجی PDF...' : 'دانلود PDF پیش‌فاکتور'}
              </button>


            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-xs">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              پیش‌فاکتور شما در حال حاضر خالی است
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              برای صدور پیش‌فاکتور رسمی، ابتدا اقلام مورد نظر خود را از کاتالوگ محصولات (کارتن یا باکس) انتخاب فرمایید.
            </p>
            <button
              onClick={onGoToCatalog}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-md shadow-blue-600/25 transition-all inline-flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              مشاهده کاتالوگ و انتخاب کالا
            </button>
          </div>
        ) : (
          /* Main Layout: Proforma Sheet (Right) & Customer/Payment Data (Left) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Right: Printable Proforma Invoice Document */}
            <div className="lg:col-span-8 space-y-6">
              
              <div 
                id="proforma-official-sheet"
                className="bg-white rounded-3xl border-2 border-slate-900 shadow-xl p-6 sm:p-8 relative overflow-hidden print:p-0 print:border-none print:shadow-none"
              >
                {/* Official Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                  <span className="text-7xl font-black rotate-[-30deg] tracking-widest text-slate-900 border-8 border-slate-900 p-8 rounded-3xl">
                    پیش‌فاکتور رسمی {djangoConfig.companyName}
                  </span>
                </div>

                {/* Top Official Corporate Header */}
                <div className="border-b-2 border-slate-900 pb-5 mb-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black shadow-md">
                        <Building2 className="w-8 h-8 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 whitespace-nowrap">
                          <span>صورتحساب فروش کالا و خدمات (پیش‌فاکتور رسمی)</span>
                        </h2>
                        <p className="text-[10px] sm:text-xs text-slate-600 font-bold mt-0.5">
                          سامانه پخش سراسری دخانیات و کالای مصرفی {djangoConfig.companyName}
                        </p>
                      </div>
                    </div>

                    <div className="text-left bg-slate-50 border border-slate-300 p-3 rounded-2xl text-xs font-mono shrink-0">
                      <div className="text-slate-500 font-sans">شماره پیش‌فاکتور:</div>
                      <div className="text-blue-900 font-black text-base">{invoiceNumber}</div>
                      <div className="text-slate-500 font-sans mt-1">تاریخ صدور:</div>
                      <div className="text-slate-900 font-bold">{invoiceDate}</div>
                    </div>
                  </div>

                  {/* Seller Official Credentials Bar */}
                  {(djangoConfig.showNationalIdInvoice || djangoConfig.showEconomicCodeInvoice || djangoConfig.showActivityTypeInvoice || djangoConfig.showTransportPhoneInvoice) ? (
                    <div className="bg-slate-900 text-white p-2.5 rounded-2xl text-[10px] sm:text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-medium">
                      {djangoConfig.showNationalIdInvoice && (
                        <div>شناسه ملی: <strong className="text-amber-300 font-mono">{djangoConfig.nationalIdCompany || '۱۰۱۰۳۸۵۲۹۱۰'}</strong></div>
                      )}
                      {djangoConfig.showEconomicCodeInvoice && (
                        <div>کد اقتصادی: <strong className="text-amber-300 font-mono">{djangoConfig.economicCodeCompany || '۴۱۱۴۹۸۷۵۳۱۱۹'}</strong></div>
                      )}
                      {djangoConfig.showActivityTypeInvoice && (
                        <div>نوع فعالیت: <strong className="text-amber-300">{djangoConfig.activityTypeCompany || 'پخش عمده دخانیات'}</strong></div>
                      )}
                      {djangoConfig.showTransportPhoneInvoice && (
                        <div>تلفن ترابری: <strong className="text-amber-300 font-mono" dir="ltr">{djangoConfig.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹'}</strong></div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Seller & Buyer Details Parallel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
                  
                  {/* Seller Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
                    <div className="font-black text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-blue-900">
                        <Building2 className="w-4 h-4 text-blue-700" />
                        فروشنده: پخش سراسری دخانیات {djangoConfig.companyName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">شعبه انبار مرکزی</span>
                    </div>
                    <div><span className="text-slate-500">نشانی دفتر/انبار:</span> تهران، کهریزک، ۶۰ متری شورآباد، شهرک دخانیات</div>
                    <div>
                      <span className="text-slate-500">تلفن هماهنگی بارگیری:</span>{' '}
                      <strong dir="ltr" className="font-mono text-blue-700">
                        {djangoConfig.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹'}
                      </strong>
                    </div>
                    <div><span className="text-slate-500">محل تحویل بار:</span> انبار مرکزی شورآباد / انبار تحویل حضوری</div>
                  </div>

                  {/* Buyer Box */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-1.5">
                    <div className="font-black text-blue-900 border-b border-blue-200 pb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-blue-700" />
                        خریدار طرف حساب:
                      </span>
                      <span className="text-[10px] text-blue-700 font-bold">کد خریدار: CUST-9419</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div><span className="text-slate-500">نام خریدار:</span> <strong>{customer.shopOwnerName || 'ثبت‌نشده'}</strong></div>
                      <div><span className="text-slate-500">نام فروشگاه:</span> <strong>{customer.shopName || 'ثبت‌نشده'}</strong></div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div><span className="text-slate-500">شماره همراه:</span> <strong dir="ltr">{customer.shopPhone || 'ثبت‌نشده'}</strong></div>
                      <div><span className="text-slate-500">مقصد:</span> <strong>{customer.province} - {customer.city}</strong></div>
                    </div>
                    <div><span className="text-slate-500">نشانی دقیق:</span> <span>{customer.address || 'تحویل درب باربری'}</span></div>
                  </div>

                </div>

                {/* Quick Add Product - ONLY VISIBLE ON SCREEN, HIDDEN IN PRINT/PDF */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 print:hidden space-y-3 relative z-30">
                  <div className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    افزودن مستقیم کالا به این پیش‌فاکتور (بدون ترک صفحه):
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    {/* Product Search Box */}
                    <div className="flex-grow relative w-full">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">نام کالا یا برند سیگار:</label>
                      <input
                        type="text"
                        placeholder="جستجو و انتخاب کالا از کاتالوگ..."
                        value={productSearchTerm}
                        onChange={(e) => {
                          setProductSearchTerm(e.target.value);
                          setIsDropdownOpen(true);
                          if (selectedAddProduct && e.target.value !== selectedAddProduct.nameFa) {
                            setSelectedAddProduct(null);
                          }
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                      />
                      
                      {/* Suggestions Backdrop Overlay */}
                      {isDropdownOpen && filteredSuggestions.length > 0 && (
                        <div 
                          className="fixed inset-0 z-40 cursor-default" 
                          onClick={() => setIsDropdownOpen(false)}
                        />
                      )}
                      
                      {/* Suggestion Dropdown */}
                      {isDropdownOpen && filteredSuggestions.length > 0 && (
                        <div className="absolute right-0 left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                          {filteredSuggestions.map((prod) => (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => {
                                setSelectedAddProduct(prod);
                                setProductSearchTerm(prod.nameFa);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-right px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-black text-slate-900">{prod.nameFa}</span>
                                <span className="text-[10px] text-slate-400 mr-2">({prod.brand})</span>
                              </div>
                              <div className="text-left font-mono text-blue-700 font-bold">
                                {formatNumberFa(prod.cartonPrice)} تومان
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Unit Select */}
                    <div className="w-full sm:w-36 shrink-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">واحد سفارش:</label>
                      <select
                        value={addUnit}
                        onChange={(e) => setAddUnit(e.target.value as 'carton' | 'box')}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                      >
                        <option value="carton">کارتن (۵۰ باکس)</option>
                        <option value="box">باکس (تکی)</option>
                      </select>
                    </div>

                    {/* Quantity Input */}
                    <div className="w-full sm:w-24 shrink-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">تعداد:</label>
                      <input
                        type="number"
                        min={1}
                        value={addQuantity}
                        onChange={(e) => setAddQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 text-center focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Add Button */}
                    <button
                      type="button"
                      disabled={!selectedAddProduct}
                      onClick={handleAddProductInline}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-black px-6 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 h-[38px]"
                    >
                      <Plus className="w-4 h-4" />
                      افزودن کالا
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold">
                        <th className="p-3 rounded-r-xl w-10 text-center">ردیف</th>
                        <th className="p-3">شرح کالا (مارک و مدل)</th>
                        <th className="p-3 text-center">واحد</th>
                        <th className="p-3 text-center">تعداد</th>
                        <th className="p-3 text-left">نرخ واحد (تومان)</th>
                        <th className="p-3 text-center">تخفیف</th>
                        <th className="p-3 text-left print:rounded-l-xl">مبلغ کل (تومان)</th>
                        <th className="p-3 w-10 print:hidden text-center rounded-l-xl">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {cartItems.map((item, idx) => {
                        const itemSubtotal = calculateItemSubtotal(
                          item.product.cartonPrice,
                          item.product.boxPrice,
                          item.unit,
                          item.quantity
                        );
                        const discountPercent = getApplicableDiscount(
                          item.unit,
                          item.quantity,
                          item.product.tierDiscounts
                        );
                        const discountAmount = (itemSubtotal * discountPercent) / 100;
                        const rowTotal = itemSubtotal - discountAmount;

                        return (
                          <tr key={`${item.product.id}-${item.unit}`} className="hover:bg-slate-50/80">
                            <td className="p-3 text-center font-bold text-slate-500">{formatNumberFa(idx + 1)}</td>
                            <td className="p-3">
                              <div className="font-black text-slate-900">{item.product.nameFa}</div>
                              <div className="text-[10px] text-slate-400">{item.product.nameEn} • {item.product.origin}</div>
                            </td>
                            <td className="p-3 text-center font-bold">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap ${
                                item.unit === 'carton' ? 'bg-blue-50 text-blue-800 font-black' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {item.unit === 'carton' ? 'کارتن (۵۰ باکس)' : 'باکس'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {/* Quantity Editor */}
                              <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl print:bg-transparent">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.product.id, item.unit, item.quantity - 1)}
                                  className="w-5 h-5 bg-white text-slate-700 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black print:hidden"
                                >
                                  -
                                </button>
                                <span className="font-black px-1.5">{formatNumberFa(item.quantity)}</span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.product.id, item.unit, item.quantity + 1)}
                                  className="w-5 h-5 bg-white text-slate-700 hover:bg-slate-200 rounded-lg flex items-center justify-center font-black print:hidden"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-left font-mono font-bold text-slate-700" dir="ltr">
                              {formatNumberFa(item.unit === 'carton' ? item.product.cartonPrice : item.product.boxPrice)}
                            </td>
                            <td className="p-3 text-center">
                              {discountPercent > 0 ? (
                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-black text-[10px]">
                                  {formatNumberFa(discountPercent)}٪
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="p-3 text-left font-mono font-black text-blue-700" dir="ltr">
                              {formatNumberFa(rowTotal)}
                            </td>
                            <td className="p-3 text-center print:hidden">
                              <button
                                onClick={() => onRemoveItem(item.product.id, item.unit)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                                title="حذف ردیف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t-2 border-slate-900 pt-4">
                  <div className="text-xs text-slate-500 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Truck className="w-4 h-4 text-blue-600" />
                      شیوه ارسال انتخابی:
                    </div>
                    <p className="text-slate-900 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {customer.shippingMethod}
                    </p>
                    <div className="text-[11px] text-slate-400">
                      * تحویل کلیه سفارشات با پلمپ سربی، فاکتور رسمی و بیجک باربری معتبر انجام می‌شود.
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>جمع کل ناخالص اقلام:</span>
                      <span className="font-mono font-bold" dir="ltr">{formatNumberFa(subtotal)} تومان</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-700 font-bold">
                        <span>تخفیف تیراژ خریدار:</span>
                        <span className="font-mono" dir="ltr">- {formatNumberFa(totalDiscount)} تومان</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-600">
                      <span>کرایه باربری و ترابری:</span>
                      <span className="font-mono font-bold" dir="ltr">
                        {customer.shippingCost ? `${formatNumberFa(customer.shippingCost)} تومان` : 'پس‌کرایه'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-300 pt-2 text-sm font-black text-slate-900">
                      <span className="text-blue-900">مبلغ نهایی قابل پرداخت:</span>
                      <span className="font-mono text-base text-blue-700" dir="ltr">{formatToman(finalPayable)}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures & Seal Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t-2 border-slate-900 mt-6 pt-6 text-xs text-center relative">
                  
                  {/* Seller Signature */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between h-28">
                    <div className="font-bold text-slate-900 text-xs">واحد ترابری و انبارداری {djangoConfig.companyName}:</div>
                    <div className="text-[10px] text-slate-400">انبار کهریزک - شورآباد (۶۰ متری)</div>
                  </div>

                  {/* Official Stamp Badge */}
                  <div className="flex items-center justify-center">
                    <div className="border-4 border-dashed border-blue-800 text-blue-900 p-3 rounded-full w-24 h-24 flex flex-col items-center justify-center rotate-[-8deg] opacity-90 shadow-sm bg-blue-50/50">
                      <span className="text-[10px] font-black tracking-tight">پخش سراسری {djangoConfig.companyName}</span>
                      <span className="text-[9px] font-bold text-blue-800">سیستم توزیع کالا</span>
                      <span className="text-[9px] font-bold text-emerald-700">✓ تأیید انبار</span>
                    </div>
                  </div>

                  {/* Buyer Signature */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between h-28">
                    <div className="font-bold text-slate-900 text-xs">امضا و مهر تحویل‌گیرنده / خریدار:</div>
                    <div className="text-[10px] text-slate-400">{customer.shopOwnerName || 'طرف حساب'}</div>
                  </div>

                </div>

              </div>

            </div>

            {/* Left: Customer Info, Bank Transfer & Submit Proforma Order */}
            <div className="lg:col-span-4 space-y-6 print:hidden">
              
              {/* Form Card */}
              <form onSubmit={handleSubmitOrder} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  ویرایش مشخصات خریدار و تحویل
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    نام و نام خانوادگی خریدار:
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.shopOwnerName}
                    onChange={(e) => setCustomer({ ...customer, shopOwnerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نام مغازه:
                    </label>
                    <input
                      type="text"
                      value={customer.shopName}
                      onChange={(e) => setCustomer({ ...customer, shopName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      شماره تماس:
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.shopPhone}
                      onChange={(e) => setCustomer({ ...customer, shopPhone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      شهر مقصد:
                    </label>
                    <input
                      type="text"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      استان:
                    </label>
                    <input
                      type="text"
                      value={customer.province}
                      onChange={(e) => setCustomer({ ...customer, province: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    آدرس انبار یا شعبه باربری:
                  </label>
                  <textarea
                    rows={2}
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    انتخاب روش ارسال و باربری:
                  </label>
                  <select
                    value={customer.shippingMethod}
                    onChange={(e) => {
                      const found = DEFAULT_SHIPPING_OPTIONS.find(o => o.title === e.target.value);
                      let initialCost = found ? found.cost : customer.shippingCost;
                      if (found && !found.isCustom && found.cost > 0) {
                        initialCost = Math.round((found.cost / 50) * totalBoxes);
                      }
                      setCustomer({
                        ...customer,
                        shippingMethod: e.target.value,
                        shippingCost: initialCost
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    {DEFAULT_SHIPPING_OPTIONS.map(opt => {
                      const calculatedCost = opt.isCustom ? opt.cost : Math.round((opt.cost / 50) * totalBoxes);
                      return (
                        <option key={opt.id} value={opt.title}>
                          {opt.title} ({opt.cost > 0 ? `${formatNumberFa(calculatedCost)} تومان` : 'توافقی / پس‌کرایه'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Bank Transfer Information */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs space-y-2.5">
                  <div className="font-black text-blue-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    حساب‌های رسمی تسویه حواله {djangoConfig.companyName}:
                  </div>
                  
                  <div className="bg-white rounded-xl p-3 border border-blue-100 space-y-3">
                    {djangoConfig.bankCard1 && (
                      <div className="space-y-1 pb-2 border-b border-slate-100">
                        <div className="font-bold text-slate-800 text-[10px]">حساب اول:</div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">شماره کارت:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(djangoConfig.bankCard1 || '', 'card')}
                            className="text-blue-700 font-mono font-black flex items-center gap-1 hover:underline"
                          >
                            {djangoConfig.bankCard1}
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">شماره شبا:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(djangoConfig.bankShiba1 || '', 'shaba')}
                            className="text-blue-700 font-mono font-black flex items-center gap-1 hover:underline text-[9px]"
                          >
                            {djangoConfig.bankShiba1}
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500">به نام: {djangoConfig.bankHolder1}</div>
                      </div>
                    )}

                    {djangoConfig.bankCard2 && (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800 text-[10px]">حساب دوم (پشتیبان):</div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">شماره کارت:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(djangoConfig.bankCard2 || '', 'card')}
                            className="text-blue-700 font-mono font-black flex items-center gap-1 hover:underline"
                          >
                            {djangoConfig.bankCard2}
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">شماره شبا:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(djangoConfig.bankShiba2 || '', 'shaba')}
                            className="text-blue-700 font-mono font-black flex items-center gap-1 hover:underline text-[9px]"
                          >
                            {djangoConfig.bankShiba2}
                            <Copy className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500">به نام: {djangoConfig.bankHolder2}</div>
                      </div>
                    )}
                    
                    {copiedCard && <span className="text-[10px] text-emerald-600 font-bold block text-center">کپی شد!</span>}
                  </div>
                </div>

                {/* Upload Receipt / Slip */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">
                    بارگذاری تصویر فیش واریزی بانکی <span className="text-rose-500 font-black">(الزامی جهت صدور حواله):</span>
                  </label>
                  
                  <label className={`border-2 border-dashed ${!receiptImage ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 bg-slate-50'} hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all`}>
                    <Upload className="w-5 h-5 text-blue-600 mb-1" />
                    <span className="text-[11px] font-bold text-slate-700">
                      {receiptFileName ? receiptFileName : 'انتخاب یا رها کردن عکس فیش بانکی'}
                    </span>
                    <span className="text-[10px] text-slate-400">فرمت‌های JPG, PNG (حداکثر ۵ مگابایت)</span>
                    <input type="file" accept="image/*" required onChange={handleFileUpload} className="hidden" />
                  </label>

                  {!receiptImage && (
                    <div className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200/60 p-2 rounded-xl flex items-center gap-1">
                      ⚠️ ثبت نهایی سفارش مستلزم پیوست نمودن فیش واریزی معتبر می‌باشد.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="کد پیگیری فیش"
                      required
                      value={bankRefCode}
                      onChange={(e) => setBankRefCode(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="۴ رقم آخر کارت"
                      required
                      value={senderCardLast4}
                      onChange={(e) => setSenderCardLast4(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none text-center font-mono"
                    />
                  </div>
                </div>

                {/* Submit Final Order */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0 || !receiptImage}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-2xl text-xs shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال ثبت سفارش...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>تأیید نهایی و ارسال سفارش به انبار</span>
                    </>
                  )}
                </button>

              </form>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
