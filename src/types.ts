export type NavigationTab = 
  | 'catalog' 
  | 'user-panel'
  | 'live-prices' 
  | 'tracking' 
  | 'contact' 
  | 'shipping' 
  | 'blog' 
  | 'django-crm'
  | 'invoice'
  | 'chat-support';

export interface RetailShopCustomer {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  city: string;
  address: string;
  licenseNo?: string;
  totalPurchases?: number;
}

export interface UserProfile {
  id: string;
  phone: string;
  fullName: string;
  nationalId?: string;
  nationalIdImage?: string; // تصویر کارت ملی
  province: string;
  city: string;
  address: string;
  
  // اطلاعات وسیله نقلیه ویزیتور
  vehicleType?: 'motorcycle' | 'car' | 'van' | 'truck';
  vehiclePlate?: string;
  isVehicleVerified?: boolean; // تایید وسیله نقلیه توسط جنگو
  
  // قرارداد
  hasAcceptedContract?: boolean; // تایید قرارداد آنلاین
  
  isVerified: boolean; // احراز هویت تایید شده (توسط سیستم مرکزی)
  createdAt: string;
  role: 'visitor' | 'customer'; 
  referralCode?: string;
  visitorCode?: string;
  commissionRate?: number;

  // اطلاعات بانکی ویزیتور برای واریز پورسانت و تسویه‌حساب
  bankCardNumber?: string; // شماره کارت ۱۶ رقمی
  bankSheba?: string; // شماره شبا با پیشوند IR
  bankName?: string; // نام بانک
  bankAccountHolder?: string; // نام صاحب حساب (مطابق کارت ملی)

  // اطلاعات ویژه مشتریان عادی (مغازه‌داران)
  shopName?: string; // نام مغازه یا فروشگاه
  shopLicenseNo?: string; // شماره پروانه کسب
  businessName?: string;
  businessLicenseNumber?: string;
  isProfileCompleted?: boolean;
  
  // تصویر مهر کاربر مشتری یا تصاویر مهرهای مغازه‌داران (قابل تغییر توسط ویزیتور)
  stampImage?: string; // تصویر مهر مشتری
  customerStamps?: Record<string, string>; // مهرهایی که ویزیتور برای مغازه‌داران خود ذخیره می‌کند (شناسه مغازه -> آدرس تصویر مهر)
}

export type CigaretteCategory = 
  | 'all'
  | 'cigarettes'
  | 'iqos_devices'
  | 'iqos_heets'
  | 'pods_vapes'
  | 'tobacco'
  | 'accessories';

export interface WholesaleTierDiscount {
  minCartons?: number;
  minQuantity?: number;
  discountPercentage?: number;
  discountPercent?: number;
  unit?: string;
  label?: string;
}

export interface CigaretteProduct {
  id: string;
  djangoId?: number | string; // ID in Django CRM
  nameFa: string;
  nameEn: string;
  brand: string;
  category: CigaretteCategory;
  origin: string; // e.g. 'سوئیس اصل', 'ترکیه', 'ایران', 'ارمنستان'
  tar: string; // قطران
  nicotine: string; // نیکوتین
  cartonPrice: number; // قیمت عمده هر کارتن (تومان)
  baseCartonPrice?: number; // قیمت پایه اولیه قبل از نوسان دلار
  boxPrice: number; // قیمت هر باکس/بسته ۱۰تایی (تومان)
  baseBoxPrice?: number;
  boxesPerCarton: number; // تعداد باکس در هر کارتن (معمولاً ۵۰ یا ۲۵)
  stockCartons: number; // موجودی انبار به کارتن
  moq: number; // حداقل سفارش به کارتن (حداقل ۱ کارتن)
  image: string;
  barcode: string;
  flavor?: string;
  badge?: 'پرفروش' | 'بار تازه' | 'وارداتی اصل' | 'تخفیف تیراژ' | 'موجودی محدود' | 'بار تازه سوین' | 'جدید';
  priceTrend?: 'stable' | 'up' | 'down'; // نوسان قیمت لحظه‌ای
  lastPriceUpdate: string; // آخرین زمان بروزرسانی نرخ
  hologram: 'شرکتی اصل' | 'سفارش دبی' | 'اورجینال اروپایی' | 'تولید داخل' | 'اورجینال';
  tierDiscounts: WholesaleTierDiscount[];
  description: string;
  isAvailable: boolean;
  isBoxOnly?: boolean; // اگر true باشد، فقط فروش باکسی فعال است و کارتن ندارد
}

export interface CartItem {
  product: CigaretteProduct;
  unit: 'carton' | 'box';
  quantity: number; // تعداد کارتن یا باکس
}

export interface ShippingOption {
  id: string;
  title: string;
  cost: number;
  description: string;
  estimatedDelivery: string;
  isCustom?: boolean;
}

export interface CustomerInfo {
  shopName: string; // نام مغازه
  shopOwnerName: string; // نام و نام خانوادگی مغازه‌دار
  shopPhone: string; // شماره تماس مغازه‌دار
  city: string;
  province?: string;
  address: string; // آدرس دقیق مغازه
  shippingMethod: string;
  shippingCost?: number; 
  freightCost?: number;
  notes: string;
  paymentReceipt?: string | null;
  receiptRefCode?: string;
  senderCardLast4?: string;
}

export interface OrderTimelineStep {
  step: number;
  title: string;
  description: string;
  time: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export type OrderDispatchType = 'sevin_dedicated_fleet' | 'freight_company' | 'in_person_pickup';

export type OrderShippingStatusCode = 
  | 'registered' 
  | 'financial_approved' 
  | 'warehouse_packing' 
  | 'dispatched_fleet' 
  | 'dispatched_freight' 
  | 'delivered';

export interface OrderTrackingInfo {
  orderId: string;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  totalCartons: number;
  totalBoxes: number;
  finalTotal: number;
  status: OrderShippingStatusCode;
  statusFa: string;
  dispatchType: OrderDispatchType;
  dispatchTypeFa: string;
  // If Sevin fleet:
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  fleetLocation?: string;
  // If Freight (Vatan, Jahangir, etc):
  freightCompanyName?: string;
  freightBillNumber?: string; // شماره بیجک / بارنامه
  freightPhone?: string;
  freightDestinationBranch?: string;
  estimatedDelivery: string;
  itemsSummary: string;
  timeline: OrderTimelineStep[];
  notes?: string;
}

export interface OrderInvoice {
  orderId: string;
  trackingCode?: string;
  createdAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  totalBoxes: number;
  totalCartons: number;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  finalTotal: number;
  trackingInfo?: OrderTrackingInfo;
  paymentStatus: 
    | 'پیش‌فاکتور رسمی' 
    | 'در انتظار تأیید انبار' 
    | 'ارسال شده به سامانه مرکزی' 
    | 'واریز شده و ثبت فیش'
    | 'فیش واریزی ارسال شده (در انتظار بررسی)';
  retailShop?: RetailShopCustomer;
  visitorCode?: string;
  visitorCommission?: number; // مبلغ سود ویزیتور از این سفارش
  receiptImage?: string;
  bankRefCode?: string;
  senderCardLast4?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  department: 'sales' | 'finance' | 'warehouse' | 'shipping' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'answered' | 'closed';
  customerName: string;
  customerPhone: string;
  orderTrackingCode?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
  unreadAdminCount?: number;
  unreadUserCount?: number;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  sender: 'customer' | 'support_admin' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    url: string;
    size: string;
    type: string;
  };
}

export interface DjangoCrmConfig {
  apiUrl: string;
  apiToken: string;
  autoSync: boolean;
  syncIntervalMinutes?: number;
  lastSyncTime?: string;
  status: 'idle' | 'connecting' | 'connected' | 'error';
  errorMessage?: string;
  totalSyncedProducts: number;
  
  // تنظیمات پویا که از بک‌اند خوانده/نوشته می‌شوند
  companyName?: string; // مثلاً "سوین"
  bankCard1?: string;   // شماره کارت حساب اول
  bankShiba1?: string;  // شماره شبای حساب اول
  bankHolder1?: string; // صاحب حساب اول
  bankCard2?: string;   // شماره کارت حساب دوم
  bankShiba2?: string;  // شماره شبای حساب دوم
  bankHolder2?: string; // صاحب حساب دوم
  visitorContractText?: string; // متن قرارداد ویزیتورها قابل مدیریت از بک‌اند
  siteHeroTitle?: string; // عنوان هیرو سایت
  siteHeroDesc?: string;  // متن توضیحات هیرو سایت
}

export interface ApiEndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  title: string;
  description: string;
  sampleRequest?: Record<string, unknown>;
  sampleResponse: Record<string, unknown>;
}

export interface LiveDollarMarket {
  usdTehran: number; // دلار آزاد سبزه میدان تهران (تومان)
  usdHerat: number; // دلار هرات (تومان)
  tetherUsdt?: number; // نرخ تتر (تومان)
  tetherUSDT?: number;
  uaeDirham: number; // حواله درهم امارات (تومان)
  baseMarketRate: number; // نرخ مبنای محاسبه کاتالوگ (مثلاً 92,500 تومان)
  lastUpdate?: string;
  lastTickTime?: string;
  isAutoUpdating: boolean;
  changePercent24h?: number;
  high24h?: number;
  low24h?: number;
  trend?: 'up' | 'down' | 'stable';
  autoUpdateIntervalSeconds?: number;
  pricingMode: 'fixed' | 'dynamic_dollar'; // حالت دستی یا شناور متصل به دلار
  manualCustomUsdRate?: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  keywords: string[];
  category: 'تحلیل بازار و ارز' | 'راهنمای بنکداری' | 'اصالت کالا و برند' | 'قوانین باربری و ارسال' | 'فناوری IQOS' | string;
  readTimeMinutes: number;
  publishedDate: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  excerpt: string;
  keyTakeaways: string[];
  content: string; // Markdown or rich formatted text
  faqs?: {
    question: string;
    answer: string;
  }[];
  tags: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  targetAudience: 'all' | 'visitors' | 'customers' | 'direct';
  targetUserId?: string;
  targetUserName?: string;
  createdAt: string;
  isRead?: boolean;
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  title: string;
  department: 'sales' | 'shipping' | 'finance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'answered' | 'closed';
  createdAt: string;
  messages?: {
    id: string;
    sender: 'user' | 'admin';
    senderName: string;
    text: string;
    createdAt: string;
  }[];
}

