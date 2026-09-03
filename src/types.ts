export interface PosSaleItem {
  product: CigaretteProduct;
  unit: "carton" | "box" | "pack";
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PosReceiptInvoice {
  id: string;
  receiptNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: PosSaleItem[];
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  paymentMethod: "pos_terminal" | "cash" | "ledger" | "split" | "usd" | "eur";
  splitPaymentDetails?: {
    paidNow: number;
    paidVia: "pos_terminal" | "cash";
    remainingToLedger: number;
  };
  foreignCurrencyDetails?: {
    currency: "USD" | "EUR";
    amount: number;
    rate: number;
    tomanEquivalent: number;
  };
  terminalRefNumber?: string;
  notes?: string;
  cashier: string;
}

export interface StockAdjustmentLog {
  id: string;
  productId: string;
  productName: string;
  type: 'sale_pos' | 'sale_wholesale' | 'stock_in' | 'adjustment' | 'damage';
  deltaCartons: number;
  deltaBoxes: number;
  finalStockCartons: number;
  date: string;
  note?: string;
}

export type NavigationTab = 
  | 'catalog' 
  | 'user-panel'
  | 'live-prices' 
  | 'tracking' 
  | 'contact' 
  | 'shipping' 
  | 'blog' 
  | 'django-crm'
  | 'django-docs'
  | 'accounting-pos'
  | 'invoice'
  | 'chat-support';

export type CustomerTierId = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond_black';

export interface CustomerTierConfig {
  id: CustomerTierId;
  nameFa: string;
  badgeTitle: string;
  cardTitle: string;
  themeColor: string;
  cardGradient: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
  textColor: string;
  accentColor: string;
  discountRate: number; // درصد تخفیف ویژه
  defaultCreditLimit: number; // سقف اعتبار پیش‌فرض
  description: string;
}

export interface BankDepositSlip {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  purpose: 'settle_debt' | 'charge_wallet' | 'order_deposit';
  orderId?: string;
  amount: number;
  trackingNumber: string; // شماره پیگیری / ارجاع فیش
  bankOrigin?: string; // بانک مبدا
  senderCardLast4?: string; // ۴ رقم آخر کارت واریزکننده
  depositDate: string; // تاریخ واریز
  depositTime?: string; // ساعت واریز
  slipImage?: string; // تصویر بارگذاری شده فیش
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface WalletTransaction {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdraw'; // شارژ یا کسر برای خرید
  description: string;
  relatedSlipId?: string;
  relatedOrderId?: string;
}

export interface PosCustomer {
  id: string;
  name: string;
  phone: string;
  address?: string; // آدرس مغازه یا فروشگاه مشتری
  city?: string; // شهر
  createdAt: string;
  balance: number; // positive: owes us (بدهکار), negative: we owe them (بستانکار), 0: تسویه
  notes?: string; // یادداشت‌ها یا توضیحات اعتباری
  loyaltyPoints?: number; // امتیاز باشگاه مشتریان
  creditLimit?: number; // سقف اعتبار نسیه تعیین‌شده از دیتابیس توسط مدیریت
  tierId?: CustomerTierId; // سطح کارت مشتری (برنز، نقره‌ای، طلایی، پلاتینیوم، الماس مشکی)
  walletBalance?: number; // موجودی کیف پول الکترونیکی مشتری
  customCardColor?: string; // رنگ یا گرادیانت سفارشی کارت
}

export type StaffRole = 'super_admin' | 'warehouse_manager' | 'cashier' | 'accountant';

export type StaffPermission = 
  | 'manage_pos'             // فروش و ثبت فاکتور صندوق
  | 'manage_inventory'       // انبارداری، اصلاح موجودی و انبارگردانی
  | 'quick_add_product'      // تعریف کالا جدید از صندوق و انبار
  | 'manage_ledger'          // حساب‌های دفتری و ثبت بدهی/تسویه
  | 'view_reports'           // گزارشات مالی و حسابداری
  | 'monthly_comparison'     // چارت و تحلیل مقایسه‌ای ماه‌ها
  | 'manage_staff'           // مدیریت پرسنل و دسترسی‌ها
  | 'customer_app_connect'   // مدیریت باشگاه مشتریان و اپلیکیشن همراه
  | 'send_sms'               // ارسال اس ام اس و پایش پنل پیامکی کاوه‌نگار
  | 'manage_tickets'         // پاسخگویی و مدیریت تیکت‌های پشتیبانی
  | 'manage_notifications'   // مدیریت و ارسال اعلانات به کاربران سایت و اپلیکیشن
  | 'delete_receipts';       // دسترسی ادمین جهت حذف فاکتورها

export interface WarehouseStaffUser {
  id: string;
  fullName: string;
  phone: string;
  pinCode: string;
  role: StaffRole;
  roleTitleFa: string;
  permissions: StaffPermission[];
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  avatarColor?: string;
}

export interface MonthlySalesRecord {
  monthKey: string;
  monthName: string;
  monthNumber: number;
  year: number;
  totalSales: number;
  totalProfit: number;
  cartonsSold: number;
  boxesSold: number;
  packsSold?: number;
  invoiceCount: number;
  posTerminalSales: number;
  cashSales: number;
  ledgerSales: number;
  splitSales: number;
  growthRatePercent?: number;
}

export interface PosLedgerTransaction {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  type: "debit" | "credit";
  description: string;
}

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
  role: 'visitor' | 'customer' | 'admin'; 
  referralCode?: string;
  visitorCode?: string;
  commissionRate?: number;
  totalSalesAmount?: number;
  totalCommissionEarned?: number;

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
  orderHistory?: OrderInvoice[];
  
  // کارت رتبه، کیف پول و سقف اعتبار خرید از دیتابیس
  tierId?: CustomerTierId;
  creditLimit?: number; // سقف اعتبار خرید دفتری (تومان)
  walletBalance?: number; // موجودی کیف پول کاربر
}

export type CigaretteCategory = 
  | 'all'
  | 'cigarettes'
  | 'iqos_devices'
  | 'iqos_heets'
  | 'pods_vapes'
  | 'tobacco'
  | 'accessories'
  | 'drinks_coffee'
  | 'charcoal'
  | 'hookah'
  | 'hookah_hose'
  | 'hookah_accessories';

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
  packPrice?: number; // قیمت تک فروشی هر پاکت
  packsPerBox?: number; // معمولا ۱۰
  baseBoxPrice?: number;
  boxesPerCarton: number; // تعداد باکس در هر کارتن (معمولاً ۵۰ یا ۲۵)
  stockCartons: number; // موجودی انبار به کارتن
  moq: number; // حداقل سفارش به کارتن (حداقل ۱ کارتن)
  image: string;
  barcode: string;
  flavor?: string;
  badge?: 'پرفروش' | 'بار تازه' | 'وارداتی اصل' | 'تخفیف تیراژ' | 'موجودی محدود' | 'بار تازه دخانیات سرو' | 'جدید' | string;
  priceTrend?: 'stable' | 'up' | 'down'; // نوسان قیمت لحظه‌ای
  lastPriceUpdate: string; // آخرین زمان بروزرسانی نرخ
  hologram?: 'شرکتی اصل' | 'سفارش دبی' | 'اورجینال اروپایی' | 'تولید داخل' | 'اورجینال' | 'بدون هولوگرام' | string;
  unitType?: 'single' | 'pack' | 'box' | 'carton' | 'kg'; // نوع واحد اصلی فروش
  pricePerUnit?: number; // قیمت واحد
  unitName?: string; // نام واحد (مثلا: فنجان، عدد، کیلو، بسته)
  tierDiscounts: WholesaleTierDiscount[];
  description: string;
  isAvailable: boolean;
  hasCarton?: boolean; // آیا فروش کارتنی فعال است؟
  hasBox?: boolean; // آیا فروش باکسی/جعبه‌ای فعال است؟
  hasPack?: boolean; // آیا فروش تک/پاکتی/عددی فعال است؟
  isBoxOnly?: boolean; // اگر true باشد، فقط فروش باکسی فعال است و کارتن ندارد
  isPosOnly?: boolean; // اگر true باشد، کالا مختص به فروش حضوری صندوق بوده و در کاتالوگ آنلاین نمایش داده نمی‌شود
}

export interface CartItem {
  product: CigaretteProduct;
  unit: 'carton' | 'box' | 'pack' | 'single' | 'kg';
  quantity: number; // تعداد کارتن، باکس، پاکت، عدد یا کیلو
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
    | 'فیش واریزی ارسال شده (در انتظار بررسی)'
    | 'تسویه با کارتخوان پای باجه'
    | 'منظور به حساب دفتری و نسیه'
    | 'پرداخت آنلاین پیش‌فاکتور';
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

export interface FooterSocialItem {
  id?: number | string;
  platform: string;
  title: string;
  url: string;
  icon?: string;
  order?: number;
}

export interface FooterLinkItem {
  id?: number | string;
  title: string;
  url: string;
  order?: number;
}

export interface FooterColumnItem {
  id?: number | string;
  title: string;
  order?: number;
  links: FooterLinkItem[];
}

export interface FooterSettingsData {
  company_title?: string;
  short_description?: string;
  description_text?: string;
  address_text?: string;
  phone_number?: string;
  emergency_phone?: string;
  working_hours?: string;
  enamad_code?: string;
  samandehi_code?: string;
  copyright_text?: string;
  developer_credit?: string;
  is_active?: boolean;
  shipping_companies?: string;
  barbari_text?: string;
  columns?: FooterColumnItem[];
  socials?: FooterSocialItem[];
  social_links?: FooterSocialItem[];
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
  companyName?: string; // مثلاً "دخانیات سرو"
  bankCard1?: string;   // شماره کارت حساب اول
  bankShiba1?: string;  // شماره شبای حساب اول
  bankHolder1?: string; // صاحب حساب اول
  bankCard2?: string;   // شماره کارت حساب دوم
  bankShiba2?: string;  // شماره شبای حساب دوم
  bankHolder2?: string; // صاحب حساب دوم
  visitorContractText?: string; // متن قرارداد ویزیتورها قابل مدیریت از بک‌اند
  siteHeroTitle?: string; // عنوان هیرو سایت
  siteHeroDesc?: string;  // متن توضیحات هیرو سایت
  nationalIdCompany?: string; // شناسه ملی شرکت/فروشگاه
  economicCodeCompany?: string; // کد اقتصادی شرکت/فروشگاه
  activityTypeCompany?: string; // نوع فعالیت
  transportPhoneCompany?: string; // تلفن ترابری و هماهنگی بار
  showNationalIdInvoice?: boolean; // نمایش شناسه ملی در فاکتور
  showEconomicCodeInvoice?: boolean; // نمایش کد اقتصادی در فاکتور
  showActivityTypeInvoice?: boolean; // نمایش نوع فعالیت در فاکتور
  showTransportPhoneInvoice?: boolean; // نمایش تلفن ترابری در فاکتور
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

export interface BlogCategoryItem {
  id: string;
  name: string;
  slug: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  description?: string;
  iconName?: string;
  postCount?: number;
  order?: number;
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
  categorySlug?: string;
  readTimeMinutes: number;
  publishedDate: string; // تاریخ شمسی مانند "۱۴۰۳/۰۶/۰۱"
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  excerpt: string;
  keyTakeaways: string[];
  content: string; // Markdown or rich HTML text (TinyMCE)
  faqs?: {
    question: string;
    answer: string;
  }[];
  tags: string[];
  viewsCount?: number;
  isPublished?: boolean;
  focusKeyword?: string;
}

export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'urgent';
  notification_type?: 'order' | 'price' | 'system' | 'finance';
  targetAudience?: 'all' | 'visitors' | 'customers' | 'direct';
  user?: number | string | null;
  user_id?: number | string | null;
  user_name?: string;
  user_phone?: string;
  targetUserId?: string;
  targetUserName?: string;
  createdAt: string;
  created_at?: string;
  isRead?: boolean;
  is_read?: boolean;
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

export interface BannerSlide {
  id: string;
  badge?: string;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  badgeColor?: string;
  title: string;
  highlight?: string;
  description?: string;
  features?: string[];
  primaryBtnText?: string;
  primaryBtnAction?: 'live-prices' | 'invoice' | 'catalog' | 'pdf' | 'iqos' | 'shipping' | string;
  secondaryBtnText?: string;
  secondaryBtnAction?: 'live-prices' | 'invoice' | 'catalog' | 'pdf' | 'iqos' | 'shipping' | string;
  imageUrl: string;
  tagline?: string;
  statNumber?: string;
  statLabel?: string;
}

