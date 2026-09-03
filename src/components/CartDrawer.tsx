import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  X, 
  Plus, 
  Minus, 
  Download, 
  FileText, 
  CreditCard, 
  Copy, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  PhoneCall, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Building,
  Package
} from 'lucide-react';
import { CartItem, CustomerInfo, OrderInvoice, UserProfile, RetailShopCustomer, DjangoCrmConfig } from '../types';
import { formatToman, formatNumberFa, calculateItemSubtotal, getApplicableDiscount } from '../utils/formatters';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import { DEFAULT_SHIPPING_OPTIONS, MOCK_BANK_ACCOUNT } from '../data/shippingOptions';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, unit: CartItem['unit'], quantity: number) => void;
  onRemoveItem: (productId: string, unit: CartItem['unit']) => void;
  onClearCart: () => void;
  currentUser?: UserProfile | null;
  retailShops?: RetailShopCustomer[];
  onNavigateToProfile?: () => void;
  djangoConfig?: DjangoCrmConfig;
  onOrderSubmitted?: (items: CartItem[]) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  retailShops,
  onNavigateToProfile,
  djangoConfig,
  onOrderSubmitted,
}) => {
  // Drawer flow steps: 'cart' -> 'payment_receipt'
  const [activeStep, setActiveStep] = useState<'cart' | 'payment_receipt'>('cart');
  const [selectedShop, setSelectedShop] = useState<RetailShopCustomer | null>(null);

  // Customer & Shipping State
  const [customer, setCustomer] = useState<CustomerInfo>({
    shopOwnerName: currentUser?.fullName || 'بنکدار گرامی',
    shopName: currentUser?.businessName || 'بنکداری دخانیات',
    shopPhone: currentUser?.phone || '09120759419',
    city: currentUser?.city || 'تهران',
    province: currentUser?.province || 'تهران',
    address: currentUser?.address || 'تهران، خیابان مولوی، سرای دخانیات',
    shippingMethod: DEFAULT_SHIPPING_OPTIONS[1].title,
    shippingCost: DEFAULT_SHIPPING_OPTIONS[1].cost,
    notes: 'تحویل بارنامه پلمپ انبار جنت‌آباد',
  });

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customShippingInput, setCustomShippingInput] = useState<string>(
    customer.shippingCost?.toString() || '350000'
  );

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
  }, [currentUser, isOpen]);

  // Bank & Receipt Upload State
  const [bankAccountInfo] = useState(MOCK_BANK_ACCOUNT);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [bankRefCode, setBankRefCode] = useState<string>('');
  const [senderCardLast4, setSenderCardLast4] = useState<string>('');
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedShaba, setCopiedShaba] = useState(false);
  const [copiedCard1, setCopiedCard1] = useState(false);
  const [copiedCard2, setCopiedCard2] = useState(false);
  const [copiedShaba1, setCopiedShaba1] = useState(false);
  const [copiedShaba2, setCopiedShaba2] = useState(false);

  // Loading and Confirmation
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState<{
    trackingCode: string;
    totalAmount: number;
  } | null>(null);

  // Calculations
  const totalBoxes = cartItems.reduce((sum, item) => {
    return sum + (item.unit === 'carton' ? item.quantity * item.product.boxesPerCarton : item.quantity);
  }, 0);

  const totalCartons = cartItems.reduce((sum, item) => {
    return sum + (item.unit === 'carton' ? item.quantity : Math.floor(item.quantity / item.product.boxesPerCarton));
  }, 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.unit === 'carton' ? item.product.cartonPrice : item.product.boxPrice;
    return sum + price * item.quantity;
  }, 0);

  const totalDiscount = cartItems.reduce((sum, item) => {
    const rawTotal = calculateItemSubtotal(item.product.cartonPrice, item.product.boxPrice, item.unit, item.quantity);
    const discountPercent = getApplicableDiscount(item.unit, item.quantity, item.product.tierDiscounts);
    return sum + (rawTotal * discountPercent) / 100;
  }, 0);

  const shippingCost = customer.shippingCost || 0;
  const finalPayable = subtotal - totalDiscount + shippingCost;

  useEffect(() => {
    const selected = DEFAULT_SHIPPING_OPTIONS.find(o => o.title === customer.shippingMethod);
    if (selected && !selected.isCustom && selected.cost > 0) {
      const perBoxRate = selected.cost / 50;
      const autoCost = Math.round(perBoxRate * totalBoxes);
      if (customer.shippingCost !== autoCost) {
        setCustomer(prev => ({ ...prev, shippingCost: autoCost }));
        setCustomShippingInput(autoCost.toString());
      }
    }
  }, [totalBoxes, customer.shippingMethod]);

  const handleShippingChange = (optionTitle: string) => {
    const selected = DEFAULT_SHIPPING_OPTIONS.find(o => o.title === optionTitle);
    if (selected) {
      let initialCost = selected.cost;
      if (!selected.isCustom && selected.cost > 0) {
        initialCost = Math.round((selected.cost / 50) * totalBoxes);
      }
      setCustomer({
        ...customer,
        shippingMethod: selected.title,
        shippingCost: initialCost,
      });
      setCustomShippingInput(initialCost.toString());
    }
  };

  const handleCustomShippingChange = (val: number) => {
    setCustomer({
      ...customer,
      shippingCost: isNaN(val) ? 0 : val,
    });
    setCustomShippingInput(val.toString());
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

  const handleCopyCard = () => {
    navigator.clipboard.writeText('6104337890123456');
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const handleCopyShaba = () => {
    navigator.clipboard.writeText('IR120120000000001234567890');
    setCopiedShaba(true);
    setTimeout(() => setCopiedShaba(false), 2000);
  };

  const handleCopyCard1 = (num: string) => {
    navigator.clipboard.writeText(num.replace(/-/g, '').replace(/\s/g, ''));
    setCopiedCard1(true);
    setTimeout(() => setCopiedCard1(false), 2000);
  };

  const handleCopyShaba1 = (num: string) => {
    navigator.clipboard.writeText(num.replace(/-/g, '').replace(/\s/g, ''));
    setCopiedShaba1(true);
    setTimeout(() => setCopiedShaba1(false), 2000);
  };

  const handleCopyCard2 = (num: string) => {
    navigator.clipboard.writeText(num.replace(/-/g, '').replace(/\s/g, ''));
    setCopiedCard2(true);
    setTimeout(() => setCopiedCard2(false), 2000);
  };

  const handleCopyShaba2 = (num: string) => {
    navigator.clipboard.writeText(num.replace(/-/g, '').replace(/\s/g, ''));
    setCopiedShaba2(true);
    setTimeout(() => setCopiedShaba2(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const orderInvoice: OrderInvoice = {
      orderId: `SVN-${Date.now().toString().slice(-6)}`,
      trackingCode: `SVN-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      customer,
      items: cartItems,
      totalBoxes,
      totalCartons,
      subtotal,
      discountAmount: totalDiscount,
      shippingCost,
      finalTotal: finalPayable,
      paymentStatus: receiptImage ? 'واریز شده و ثبت فیش' : 'پیش‌فاکتور رسمی',
      retailShop: selectedShop || undefined,
      visitorCode: currentUser?.visitorCode || currentUser?.referralCode || 'VISITOR-9419',
      visitorCommission: finalPayable * (currentUser?.commissionRate || 2.5) / 100,
    };
    try {
      await generateInvoicePdf(orderInvoice);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Payment validation rule: User MUST upload receipt image OR provide bank ref code / card digits
  const isPaymentProvided = Boolean(
    (receiptImage && receiptImage.trim() !== '') ||
    (bankRefCode && bankRefCode.trim().length >= 4) ||
    (senderCardLast4 && senderCardLast4.trim().length === 4)
  );
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string | null>(null);

  const handleSubmitFinalOrder = async () => {
    setSubmitErrorMsg(null);

    // Mandatory receipt check
    if (!isPaymentProvided) {
      setSubmitErrorMsg('بارگذاری تصویر فیش واریزی یا ثبت شماره پیگیری/۴ رقم کارت الزامی است. امکان ثبت سفارش بدون فیش وجود ندارد.');
      setActiveStep('payment_receipt');
      return;
    }

    setIsSubmittingOrder(true);
    const trackingCode = `SVN-${Date.now().toString().slice(-6)}`;

    const orderInvoice: OrderInvoice = {
      orderId: trackingCode,
      trackingCode,
      createdAt: `${new Date().toLocaleDateString('fa-IR')} - ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      customer,
      items: cartItems,
      totalBoxes,
      totalCartons,
      subtotal,
      discountAmount: totalDiscount,
      shippingCost,
      finalTotal: finalPayable,
      paymentStatus: 'واریز شده و ثبت فیش',
      receiptImage: receiptImage || undefined,
      bankRefCode: bankRefCode || undefined,
      senderCardLast4: senderCardLast4 || undefined,
      retailShop: selectedShop || undefined,
      visitorCode: currentUser?.visitorCode || currentUser?.referralCode || 'VISITOR-9419',
      visitorCommission: finalPayable * (currentUser?.commissionRate || 2.5) / 100,
    };

    // Save to localStorage for User Panel access
    try {
      const stored = localStorage.getItem('sevin_orders');
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift(orderInvoice);
      localStorage.setItem('sevin_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setIsSubmittingOrder(false);
      setOrderSuccessModal({
        trackingCode,
        totalAmount: finalPayable,
      });
      if (onOrderSubmitted) {
        onOrderSubmitted(cartItems);
      }
      onClearCart();
    }, 1000);
  };

  const isCustomerProfileIncomplete = Boolean(
    currentUser &&
    currentUser.role === 'customer' &&
    (!currentUser.isProfileCompleted ||
     !currentUser.fullName ||
     currentUser.fullName.includes('گرامی') ||
     !currentUser.shopName ||
     currentUser.shopName.includes('سوپرمارکت') ||
     !currentUser.address)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-xl bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 ">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 ">
                  {activeStep === 'cart' ? 'پیش‌فاکتور رسمی پخش دخانیات سرو' : 'واریز وجه و ثبت فیش پرداخت'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {cartItems.length > 0 
                    ? `${formatNumberFa(cartItems.length)} ردیف کالا | ${formatNumberFa(totalCartons)} کارتن انتخاب شده` 
                    : 'سبد سفارش شما خالی است'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && activeStep === 'cart' && (
                <button
                  onClick={onClearCart}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-200 transition-colors text-xs"
                  title="خالی کردن سبد"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Steps if items exist */}
          {cartItems.length > 0 && (
            <div className="flex border-b border-slate-200 bg-white text-xs font-bold">
              <button
                onClick={() => setActiveStep('cart')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeStep === 'cart' 
                    ? 'border-blue-600 text-blue-700 bg-blue-50/50 ' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 '
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-[10px] font-black">۱</span>
                اقلام و دانلود پیش‌فاکتور
              </button>
              <button
                onClick={() => setActiveStep('payment_receipt')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeStep === 'payment_receipt' 
                    ? 'border-blue-600 text-blue-700 bg-blue-50/50 ' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 '
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-[10px] font-black">۲</span>
                واریز و آپلود فیش بانکی
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto modal-overscroll-contain p-4 sm:p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 mb-1">
                    هنوز کالایی به پیش‌فاکتور عمده اضافه نشده است
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    از کاتالوگ یا تابلوی نرخ روز، سیگارهای مورد نظر خود را به صورت کارتن یا باکس انتخاب فرمایید.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-2xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                >
                  مشاهده کاتالوگ و نرخ کارتن
                </button>
              </div>
            ) : activeStep === 'cart' ? (
              <>
                {/* List of Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const itemRawTotal = calculateItemSubtotal(
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
                    const itemDiscount = (itemRawTotal * discountPercent) / 100;
                    const itemFinal = itemRawTotal - itemDiscount;

                    return (
                      <div 
                        key={`${item.product.id}-${item.unit}`}
                        className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                {item.product.brand}
                              </span>
                              <span className="text-xs font-bold text-slate-900 ">
                                {item.product.nameFa}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 ">
                              واحد: <span className="text-slate-900 font-bold">{item.unit === 'carton' ? `کارتن (${item.product.boxesPerCarton} باکسی)` : 'باکس (۱۰ پاکتی)'}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id, item.unit)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="حذف ردیف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Stepper and price line */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 ">
                          <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shadow-2xs">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.unit, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-800 flex items-center justify-center font-bold text-sm transition-colors"
                            >
                              +
                            </button>
                            <span className="w-8 text-center font-bold text-xs text-slate-900 ">
                              {formatNumberFa(item.quantity)}
                            </span>
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateQuantity(item.product.id, item.unit, item.quantity - 1);
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm transition-colors"
                            >
                              -
                            </button>
                          </div>

                          <div className="text-left">
                            <div className="text-xs font-black text-blue-700 ">
                              {formatToman(itemFinal)}
                            </div>
                            {itemDiscount > 0 && (
                              <div className="text-[10px] text-emerald-700 font-bold">
                                تخفیف تیراژ: -{formatToman(itemDiscount)} ({formatNumberFa(discountPercent)}٪)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Customer & Shipping Details Form */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  {/* Retail Shop Customer Club Selector ONLY for Visitors */}
                  {currentUser?.role === 'visitor' && retailShops && retailShops.length > 0 && (
                    <div className="bg-blue-50/90 p-3 rounded-2xl border border-blue-200 space-y-1.5">
                      <label className="block text-blue-950 font-bold text-xs flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-blue-600" />
                        انتخاب مغازه‌دار از باشگاه مشتریان ویزیتور:
                      </label>
                      <select
                        onChange={(e) => {
                          const shopId = e.target.value;
                          const shop = retailShops.find(s => s.id === shopId);
                          if (shop) {
                            setSelectedShop(shop);
                            setCustomer(prev => ({
                              ...prev,
                              shopOwnerName: shop.ownerName,
                              shopName: shop.shopName,
                              shopPhone: shop.phone,
                              city: shop.city,
                              address: shop.address,
                            }));
                          } else {
                            setSelectedShop(null);
                          }
                        }}
                        className="w-full bg-white border border-blue-300 rounded-xl p-2.5 text-slate-900 text-xs font-bold focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="">-- انتخاب از مغازه‌داران باشگاه مشتریان --</option>
                        {retailShops.map(shop => (
                          <option key={shop.id} value={shop.id}>
                            {shop.shopName} (مدیر: {shop.ownerName} - {shop.city})
                          </option>
                        ))}
                      </select>
                      {selectedShop && (
                        <p className="text-[11px] text-emerald-700 font-bold pt-1">
                          ✔ فاکتور برای مغازه {selectedShop.shopName} (مدیر: {selectedShop.ownerName}) صادر خواهد شد.
                        </p>
                      )}
                    </div>
                  )}

                  <div 
                    onClick={() => setShowCustomerForm(!showCustomerForm)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 ">
                      <Truck className="w-4 h-4 text-blue-600" />
                      مشخصات خریدار نهایی (مغازه‌دار)
                    </div>
                    <span className="text-[11px] text-blue-700 font-bold underline">
                      {showCustomerForm ? 'بستن فرم' : 'ویرایش مشخصات و باربری'}
                    </span>
                  </div>

                  {showCustomerForm ? (
                    <div className="space-y-3 pt-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">نام مغازه‌دار:</label>
                          <input
                            type="text"
                            value={customer.shopOwnerName}
                            onChange={(e) => setCustomer({...customer, shopOwnerName: e.target.value})}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-blue-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">نام مغازه / سوپرمارکت:</label>
                          <input
                            type="text"
                            value={customer.shopName}
                            onChange={(e) => setCustomer({...customer, shopName: e.target.value})}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-blue-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">شماره تماس مغازه:</label>
                          <input
                            type="text"
                            value={customer.shopPhone}
                            onChange={(e) => setCustomer({...customer, shopPhone: e.target.value})}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-blue-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">شهر مقصد:</label>
                          <input
                            type="text"
                            value={customer.city}
                            onChange={(e) => setCustomer({...customer, city: e.target.value})}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-blue-500 text-xs"
                          />
                        </div>
                      </div>

                      {/* Shipping Option Picker */}
                      <div className="space-y-2">
                        <label className="block text-slate-700 font-medium">شیوه ارسال و باربری:</label>
                        <select
                          value={customer.shippingMethod}
                          onChange={(e) => handleShippingChange(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-blue-500 text-xs"
                        >
                          {DEFAULT_SHIPPING_OPTIONS.map(opt => {
                            const calculatedCost = opt.isCustom ? opt.cost : Math.round((opt.cost / 50) * totalBoxes);
                            return (
                              <option key={opt.id} value={opt.title}>
                                {opt.title} - ({opt.cost === 0 ? 'رایگان' : `${formatToman(calculatedCost)}`})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Explicit Freight / Shipping Cost by Admin/User */}
                      <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl space-y-1.5">
                        <label className="block text-blue-950 font-bold text-[11px]">
                          هزینه باربری مشخص‌شده (تومان) - درج مستقیم در فاکتور:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="10000"
                            value={customer.shippingCost}
                            onChange={(e) => handleCustomShippingChange(Number(e.target.value))}
                            className="w-full bg-white border border-blue-300 rounded-xl p-2 text-xs font-black text-blue-900 focus:outline-hidden focus:border-blue-500"
                          />
                          <span className="text-xs text-blue-800 font-bold whitespace-nowrap">تومان</span>
                        </div>
                        <p className="text-[10px] text-blue-700 ">
                          این مبلغ به جمع کل فاکتور اضافه شده و در فایل PDF پیش‌فاکتور درج می‌گردد.
                        </p>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">آدرس دقیق مغازه:</label>
                        <textarea
                          rows={2}
                          value={customer.address}
                          onChange={(e) => setCustomer({...customer, address: e.target.value})}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-blue-500 text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 bg-white p-2.5 rounded-xl border border-slate-200 ">
                      <span>مغازه: <strong className="text-slate-900 ">{customer.shopName}</strong> ({customer.city})</span>
                      <span className="text-blue-700 font-bold">
                        باربری: {customer.shippingCost && customer.shippingCost > 0 ? formatToman(customer.shippingCost) : 'رایگان (تحویل انبار)'}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* --- Step 2: Payment Receipt & Bank Card --- */
              <div className="space-y-4">
                {/* Bank Card Info Card */}
                <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl border border-slate-700 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-bold text-blue-300">حساب‌های رسمی جهت واریز حواله دخانیات سرو:</span>
                    </div>
                    <span className="text-[11px] text-slate-400">بانک ملی و تجارت</span>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Account 1 */}
                    <div className="space-y-2 border-b border-slate-700/50 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-blue-300 font-bold">۱) حساب اصلی شرکت (بانک ملی)</span>
                        <span className="text-[10px] text-slate-400">{djangoConfig?.bankHolder1 || 'امور مالی شرکت دخانیات سرو'}</span>
                      </div>
                      
                      {/* Card 1 */}
                      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-slate-400">شماره کارت:</div>
                          <div className="text-sm font-black tracking-wider text-emerald-400 font-mono" dir="ltr">
                            {djangoConfig?.bankCard1 || '۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCard1(djangoConfig?.bankCard1 || '۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲')}
                          className="py-1 px-2.5 rounded-lg bg-slate-850 hover:bg-slate-750 text-slate-200 text-[10px] font-black flex items-center gap-1 transition-colors border border-slate-700"
                        >
                          {copiedCard1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                          {copiedCard1 ? 'کپی شد' : 'کپی کارت'}
                        </button>
                      </div>

                      {/* Shaba 1 */}
                      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-1">
                           <div className="text-[9px] text-slate-400">شماره شبا:</div>
                          <div className="text-[11px] font-mono font-bold text-slate-300 truncate" dir="ltr">
                            {djangoConfig?.bankShiba1 || 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyShaba1(djangoConfig?.bankShiba1 || 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲')}
                          className="py-1 px-2.5 rounded-lg bg-slate-850 hover:bg-slate-750 text-slate-200 text-[10px] font-black flex items-center gap-1 transition-colors border border-slate-700 shrink-0"
                        >
                          {copiedShaba1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                          {copiedShaba1 ? 'کپی شد' : 'کپی شبا'}
                        </button>
                      </div>
                    </div>

                    {/* Account 2 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-blue-300 font-bold">۲) حساب ترابری و تدارکات (بانک تجارت)</span>
                        <span className="text-[10px] text-slate-400">{djangoConfig?.bankHolder2 || 'حساب ترابری و تدارکات دخانیات سرو'}</span>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-slate-400">شماره کارت:</div>
                          <div className="text-sm font-black tracking-wider text-emerald-400 font-mono" dir="ltr">
                            {djangoConfig?.bankCard2 || '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCard2(djangoConfig?.bankCard2 || '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰')}
                          className="py-1 px-2.5 rounded-lg bg-slate-850 hover:bg-slate-750 text-slate-200 text-[10px] font-black flex items-center gap-1 transition-colors border border-slate-700"
                        >
                          {copiedCard2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                          {copiedCard2 ? 'کپی شد' : 'کپی کارت'}
                        </button>
                      </div>

                      {/* Shaba 2 */}
                      <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-1">
                           <div className="text-[9px] text-slate-400">شماره شبا:</div>
                          <div className="text-[11px] font-mono font-bold text-slate-300 truncate" dir="ltr">
                            {djangoConfig?.bankShiba2 || 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyShaba2(djangoConfig?.bankShiba2 || 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸')}
                          className="py-1 px-2.5 rounded-lg bg-slate-850 hover:bg-slate-750 text-slate-200 text-[10px] font-black flex items-center gap-1 transition-colors border border-slate-700 shrink-0"
                        >
                          {copiedShaba2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                          {copiedShaba2 ? 'کپی شد' : 'کپی شبا'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Receipt Section */}
                <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  submitErrorMsg || !isPaymentProvided
                    ? 'bg-rose-50/80 border-rose-300 '
                    : 'bg-emerald-50/80 border-emerald-300 '
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-900 ">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>ثبت فیش واریزی یا شماره پیگیری بانکی (الزامی):</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      isPaymentProvided
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white animate-pulse'
                    }`}>
                      {isPaymentProvided ? 'ثبت گردید' : 'الزامی جهت ارسال'}
                    </span>
                  </div>

                  {submitErrorMsg && (
                    <div className="p-3 bg-rose-600 text-white rounded-xl text-xs font-bold leading-relaxed shadow-xs flex items-center gap-2">
                      <X className="w-4 h-4 shrink-0" />
                      <span>{submitErrorMsg}</span>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center transition-colors bg-white ">
                    <input
                      type="file"
                      id="receipt-upload"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer block space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-700 ">
                        {receiptFileName ? `فایل انتخاب شده: ${receiptFileName}` : 'برای آپلود تصویر فیش بانکی کلیک کنید'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        فرمت‌های مجاز: JPG, PNG (حداکثر ۵ مگابایت)
                      </div>
                    </label>
                  </div>

                  {/* Manual Ref Code & Sender Card Last 4 */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">شماره ارجاع / پیگیری بانکی:</label>
                      <input
                        type="text"
                        placeholder="مثال: 98124501"
                        value={bankRefCode}
                        onChange={(e) => setBankRefCode(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-hidden focus:border-blue-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">۴ رقم آخر کارت واریزکننده:</label>
                      <input
                        type="text"
                        placeholder="مثال: 4501"
                        maxLength={4}
                        value={senderCardLast4}
                        onChange={(e) => setSenderCardLast4(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-hidden focus:border-blue-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Sticky Financial Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              
              {/* Financial Calculation Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 ">
                  <span>جمع کل اقلام سفارش:</span>
                  <span className="font-bold text-slate-900 ">{formatToman(subtotal)}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>تخفیف پلکانی تیراژ:</span>
                    <span>-{formatToman(totalDiscount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-blue-700 font-bold">
                  <span>هزینه باربری و ارسال ({customer.shippingMethod.split(' ')[0]}):</span>
                  <span>{customer.shippingCost > 0 ? formatToman(customer.shippingCost) : 'رایگان (تحویل انبار جنت‌آباد)'}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-black text-blue-900 ">
                  <span>مبلغ نهایی قابل پرداخت:</span>
                  <span className="text-base font-black text-blue-700 ">{formatToman(finalPayable)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {isCustomerProfileIncomplete ? (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                    <Building className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>پروفایل خریدار هنوز تکمیل نشده است!</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    جهت صدور پیش‌فاکتور رسمی و ارسال بار به مغازه، لطفاً ابتدا نام مسئول، نام فروشگاه و آدرس را در پنل تکمیل کنید.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToProfile) onNavigateToProfile();
                    }}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>تکمیل مشخصات در پنل کاربری</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  
                  {/* PDF Download Button (prominently available right in cart) */}
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="flex-1 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-2xl border border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    title="دانلود پیش‌فاکتور رسمی در قالب PDF"
                  >
                    <Download className="w-4 h-4 text-blue-600 " />
                    <span>{isDownloadingPdf ? 'ایجاد...' : 'دانلود پیش‌فاکتور (PDF)'}</span>
                  </button>

                  {/* Step Transition or Final Order Submit */}
                  {activeStep === 'cart' ? (
                    <button
                      onClick={() => setActiveStep('payment_receipt')}
                      className="flex-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs py-2.5 px-4 rounded-2xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                      <span>مرحله بعد: واریز و ثبت فیش</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitFinalOrder}
                      disabled={isSubmittingOrder}
                      className={`flex-2 font-black text-xs py-2.5 px-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${
                        isPaymentProvided
                          ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-600/20'
                          : 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-rose-600/20'
                      }`}
                    >
                      {isSubmittingOrder ? (
                        <span>در حال ثبت نهایی در انبار...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isPaymentProvided ? 'ثبت قطعی پیش‌فاکتور' : 'ثبت فیش و ارسال سفارش'}</span>
                        </>
                      )}
                    </button>
                  )}

                </div>
              )}

              {/* Phone help link */}
              <div className="text-center pt-1">
                <a 
                  href="tel:09120759419" 
                  className="text-[11px] text-slate-500 hover:text-blue-600 font-bold inline-flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3 text-blue-600" />
                  پشتیبانی تلفنی و هماهنگی باربری جنت‌آباد: ۰۹۱۲۰۷۵۹۴۱۹
                </a>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Success Modal */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h3 className="text-lg font-black text-slate-900 ">
              پیش‌فاکتور شما در پخش دخانیات سرو با موفقیت ثبت شد
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              سفارش شما با کد رهگیری <strong className="text-blue-700 font-mono text-sm">{orderSuccessModal.trackingCode}</strong> به سیستم انبار مرکزی جنت‌آباد ارسال گردید و در پنل کاربری شما ذخیره شد.
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-700 font-medium">
              مبلغ فاکتور: <strong className="text-blue-900 font-black">{formatToman(orderSuccessModal.totalAmount)}</strong>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadPdf}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs py-3 rounded-2xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-blue-600" />
                دانلود PDF
              </button>
              <button
                onClick={() => {
                  setOrderSuccessModal(null);
                  onClose();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-2xl transition-colors shadow-md shadow-blue-600/20"
              >
                بازگشت به پنل و سفارشات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
