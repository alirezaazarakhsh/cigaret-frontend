import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { UserManagementPanel } from './UserManagementPanel';
import { CurrencyRateSettings } from './CurrencyRateSettings';
import { SiteSettingsManagementPanel } from './SiteSettingsManagementPanel';
import { PwaInstallGuide } from '../PwaInstallGuide';
import { PosLoginScreen } from './pos/PosLoginScreen';
import { PosLogoutOverlay, PosSessionExpiryAlert } from './pos/PosSessionOverlay';
import { PosInventoryView } from './pos/PosInventoryView';
import { PosCustomerLedgerView } from './pos/PosCustomerLedgerView';
import { PosReportsView } from './pos/PosReportsView';
import { PosSalesLedgerView } from './pos/PosSalesLedgerView';
import { KavenegarSmsManagementPanel } from './sms/KavenegarSmsManagementPanel';
import { isPosOnlyMode } from '../../config/appMode';
import { motion, AnimatePresence } from "motion/react";
import { 
  Barcode, 
  Search, 
  ShoppingCart, 
  Package, 
  Boxes, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  KeyRound, 
  LogOut, 
  User, 
  Phone, 
  Clock, 
  Sparkles, 
  Building2, 
  Receipt, 
  Volume2, 
  VolumeX, 
  X,
  Menu,
  Users,
  PieChart,
  FileText,
  BookOpen,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CalendarRange,
  Filter,
  Download,
  BarChart3,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  ChevronLeft,
  DollarSign,
  Terminal,
  History,
  Zap,
  MapPin,
  Edit2,
  PhoneCall,
  Coins,
  Split,
  FileCheck,
  Building,
  Check,
  UserPlus,
  ShieldCheck,
  Smartphone,
  PackagePlus,
  QrCode,
  UserCheck,
  Settings,
  Sliders,
  ChevronDown,
  Server,
  Headphones,
  Bell,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import { api } from '../../services/api';
import { staffAuthService } from '../../services/modules/staffAuthService';
import { currencyRatesApi } from '../../services/currencyApi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  LineChart, Line
} from 'recharts';
import { 
  CigaretteProduct, 
  CigaretteCategory, 
  PosSaleItem, 
  PosReceiptInvoice, 
  StockAdjustmentLog, 
  PosCustomer, 
  PosLedgerTransaction,
  WarehouseStaffUser,
  StaffPermission,
  DjangoCrmConfig
} from '../../types';
import { formatToman, formatNumberFa, getProductStockInfo } from '../../utils/formatters';
import { generatePosThermalReceiptPdf, generateMonthlyReportPdf, generateDailyReportPdf, generateAnnualReportPdf } from '../../utils/pdfGenerator';
import { StaffAccessManagerModal } from './StaffAccessManagerModal';
import { MonthlySalesComparisonView } from './MonthlySalesComparisonView';
import { QuickAddProductModal } from './QuickAddProductModal';
import { CustomerAppConnectModal } from './CustomerAppConnectModal';
import { TicketManagementPanel } from './TicketManagementPanel';
import { WarehouseContactMessagesPanel } from './WarehouseContactMessagesPanel';
import { NotificationManagementPanel } from './NotificationManagementPanel';
import { BlogManagementModal } from './BlogManagementModal';
import { BlogManagementPanel } from './BlogManagementPanel';
import { ProductManagementPanel } from '../product-manage/ProductManagementPanel';
import { OnlineOrdersManagement } from './OnlineOrdersManagement';
import { BackendConnectionModal } from '../BackendConnectionModal';
import { SessionSecurityModal } from './SessionSecurityModal';
import { 
  getRemainingSessionSeconds, 
  formatRemainingTime, 
  isPosSessionExpired, 
  initPosSessionExpiry, 
  extendPosSession, 
  invalidatePosTokenAndSession, 
  consumeLastLogoutReason 
} from '../../services/sessionSecurity';
import { 
  djangoSendPatternSMS, 
  djangoFetchSmsLogs, 
  djangoSaveSmsPattern, 
  djangoSaveAllSmsPatterns,
  djangoFetchSmsPatterns,
  djangoFetchKavenegarSettings,
  djangoSaveKavenegarSettings
} from '../../services/djangoApi';

interface AccountingPosPanelProps {
  products: CigaretteProduct[];
  onUpdateProductsStock?: (updatedProducts: CigaretteProduct[]) => void;
  onReturnToStore: () => void;
  showToast?: (msg: string) => void;
}

const DEFAULT_STAFF_MEMBERS: WarehouseStaffUser[] = [
  {
    id: 'staff_azarakhsh_super',
    fullName: 'علیرضا آذرخش (مدیر ارشد و مالک)',
    phone: '09120759419',
    pinCode: 'sasha9419',
    role: 'super_admin',
    roleTitleFa: 'مدیریت ارشد بنکداری دخانیات سرو',
    permissions: [
      'manage_pos',
      'manage_inventory',
      'quick_add_product',
      'manage_ledger',
      'view_reports',
      'monthly_comparison',
      'manage_staff',
      'customer_app_connect',
      'send_sms',
      'manage_tickets',
      'manage_notifications',
      'manage_warehouse_messages',
      'manage_site_settings',
      'manage_sliders',
      'manage_footer_settings',
      'delete_receipts'
    ],
    status: 'active',
    createdAt: '1403/01/01',
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'staff_shahin',
    fullName: 'شهین نصیری (مدیریت صندوق)',
    phone: '09125284298',
    pinCode: '1234',
    role: 'super_admin',
    roleTitleFa: 'مدیر ارشد و صندوق‌دار',
    permissions: [
      'manage_pos',
      'manage_inventory',
      'quick_add_product',
      'manage_ledger',
      'view_reports',
      'monthly_comparison',
      'manage_staff',
      'customer_app_connect',
      'send_sms',
      'manage_tickets',
      'manage_notifications',
      'manage_warehouse_messages',
      'manage_site_settings',
      'manage_sliders',
      'manage_footer_settings',
      'delete_receipts'
    ],
    status: 'active',
    createdAt: '1403/01/01',
    avatarColor: 'bg-emerald-600'
  }
];

const AUTHORIZED_PHONE = '09120759419';
const VALID_PASSWORDS = ['sasha9419', '1', 'alirezazzz9419@S', 'azarakhsh2025', '09120759419', 'admin1234', '1234'];

// Initial mock ledger customers
const INITIAL_LEDGER_CUSTOMERS: PosCustomer[] = [
  { id: 'cust_1', name: 'مغازه سوپرمارکت پارس (حسینی)', phone: '09121112233', address: 'تهران، خیابان شریعتی، بالاتر از پل رومی، پلاک ۴۱۲', city: 'تهران', createdAt: '1403/05/10', balance: 4500000, notes: 'سقف اعتبار ۱۰ میلیون تومان' },
  { id: 'cust_2', name: 'فروشگاه سیگار و توتون ملل', phone: '09124445566', address: 'کرج، عظیمیه، میدان اسبی، روبروی مرکز تجاری', city: 'کرج', createdAt: '1403/05/12', balance: -1200000, notes: 'مشتری خوش‌حساب عمده' },
  { id: 'cust_3', name: 'هایپرمارکت آریا (موسوی)', phone: '09127778899', address: 'تهران، سعادت‌آباد، میدان کاج، نبش خیابان مروارید', city: 'تهران', createdAt: '1403/05/15', balance: 0, notes: 'تسویه هفتگی' },
];

// Initial mock sales receipts for daily/monthly analytics
const SAMPLE_INITIAL_RECEIPTS: PosReceiptInvoice[] = [
  {
    id: 'rcpt_today_1',
    receiptNumber: 'POS-14030604-1001',
    createdAt: '1403/06/04 11:30',
    customerName: 'مشتری حضوری فروشگاه',
    items: [
      {
        product: { id: 'marlboro-gold-swiss', nameFa: 'مارلبرو گلد سوئیس اصلی (پایه‌کوتاه)', nameEn: 'Marlboro Gold', brand: 'Marlboro', category: 'cigarettes', origin: 'سوئیس', tar: '6mg', nicotine: '0.5mg', cartonPrice: 91000000, boxPrice: 1900000, packPrice: 190000, boxesPerCarton: 50, packsPerBox: 10, stockCartons: 15, moq: 1, image: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=600&q=80', barcode: '76101112233', lastPriceUpdate: '۱۴۰۳/۰۶/۰۴', hologram: 'اورجینال اروپایی', tierDiscounts: [], description: '', isAvailable: true },
        unit: 'box',
        quantity: 3,
        unitPrice: 1900000,
        totalPrice: 5700000
      },
      {
        product: { id: 'espresso-coffee-bean', nameFa: 'قهوه اسپرسو عربیکا ۱۰۰٪ (دانه ۱ کیلو)', nameEn: 'Arabica Coffee 1kg', brand: 'Sovin Coffee', category: 'drinks_coffee', origin: 'برزیل', tar: '0', nicotine: '0', cartonPrice: 8500000, boxPrice: 850000, packPrice: 85000, boxesPerCarton: 10, packsPerBox: 10, stockCartons: 20, moq: 1, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', barcode: '62601114455', lastPriceUpdate: '۱۴۰۳/۰۶/۰۴', hologram: 'اورجینال', tierDiscounts: [], description: '', isAvailable: true },
        unit: 'pack',
        quantity: 2,
        unitPrice: 85000,
        totalPrice: 170000
      }
    ],
    subtotal: 5870000,
    discountAmount: 70000,
    finalTotal: 5800000,
    paymentMethod: 'pos_terminal',
    terminalRefNumber: '98471203',
    cashier: 'صندوق‌دار مرکزی انبار دخانیات سرو'
  },
  {
    id: 'rcpt_today_2',
    receiptNumber: 'POS-14030604-1002',
    createdAt: '1403/06/04 14:15',
    customerName: 'مغازه سوپرمارکت پارس (حسینی)',
    items: [
      {
        product: { id: 'marlboro-red-dubai', nameFa: 'مارلبرو رد (قرمز) سنگین پلمپ', nameEn: 'Marlboro Red', brand: 'Marlboro', category: 'cigarettes', origin: 'سوئیس / فری‌شاپ دبی', tar: '10mg', nicotine: '0.8mg', cartonPrice: 88500000, boxPrice: 1850000, packPrice: 185000, boxesPerCarton: 50, packsPerBox: 10, stockCartons: 12, moq: 1, image: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=600&q=80', barcode: '76101118899', lastPriceUpdate: '۱۴۰۳/۰۶/۰۴', hologram: 'سفارش دبی', tierDiscounts: [], description: '', isAvailable: true },
        unit: 'carton',
        quantity: 1,
        unitPrice: 88500000,
        totalPrice: 88500000
      }
    ],
    subtotal: 88500000,
    discountAmount: 0,
    finalTotal: 88500000,
    paymentMethod: 'ledger',
    notes: 'تحویل ویزیتور - ثبت بدهکاری در حساب دفتری',
    cashier: 'صندوق‌دار مرکزی انبار دخانیات سرو'
  },
  {
    id: 'rcpt_yesterday_1',
    receiptNumber: 'POS-14030603-0988',
    createdAt: '1403/06/03 16:40',
    customerName: 'مشتری حضوری فروشگاه',
    items: [
      {
        product: { id: 'iqos-iluma-prime', nameFa: 'دستگاه ایکاس ایلوما پرایم (IQOS ILUMA PRIME)', nameEn: 'IQOS ILUMA PRIME', brand: 'IQOS', category: 'iqos_devices', origin: 'ژاپن', tar: '0', nicotine: '0', cartonPrice: 145000000, boxPrice: 14500000, packPrice: 14500000, boxesPerCarton: 10, packsPerBox: 1, stockCartons: 5, moq: 1, image: 'https://images.unsplash.com/photo-1527016021513-b09758b777bd?auto=format&fit=crop&w=600&q=80', barcode: '49011119900', lastPriceUpdate: '۱۴۰۳/۰۶/۰۳', hologram: 'اورجینال اروپایی', tierDiscounts: [], description: '', isAvailable: true },
        unit: 'box',
        quantity: 1,
        unitPrice: 14500000,
        totalPrice: 14500000
      },
      {
        product: { id: 'terea-amber', nameFa: 'استیک تیریا آمبر سوپر اورجینال (Terea Amber)', nameEn: 'Terea Amber Sticks', brand: 'IQOS', category: 'iqos_heets', origin: 'ارمنستان / ارواپا', tar: '0', nicotine: '0.5mg', cartonPrice: 95000000, boxPrice: 1950000, packPrice: 195000, boxesPerCarton: 50, packsPerBox: 10, stockCartons: 8, moq: 1, image: 'https://images.unsplash.com/photo-1527016021513-b09758b777bd?auto=format&fit=crop&w=600&q=80', barcode: '76101115544', lastPriceUpdate: '۱۴۰۳/۰۶/۰۳', hologram: 'اورجینال اروپایی', tierDiscounts: [], description: '', isAvailable: true },
        unit: 'box',
        quantity: 5,
        unitPrice: 1950000,
        totalPrice: 9750000
      }
    ],
    subtotal: 24250000,
    discountAmount: 250000,
    finalTotal: 24000000,
    paymentMethod: 'pos_terminal',
    terminalRefNumber: '88726194',
    cashier: 'صندوق‌دار مرکزی انبار دخانیات سرو'
  },
  {
    id: 'rcpt_yesterday_2',
    receiptNumber: 'POS-14030603-0989',
    createdAt: '1403/06/03 18:20',
    customerName: 'فروشگاه سیگار و توتون ملل',
    items: [
      {
        product: { id: 'winston-xsense', nameFa: 'وینستون ایکس اسنس نقره‌ای', nameEn: 'Winston XSence Silver', brand: 'Winston', category: 'cigarettes', origin: 'ترکیه', tar: '4mg', nicotine: '0.4mg', cartonPrice: 42000000, boxPrice: 840000, packPrice: 84000, boxesPerCarton: 50, packsPerBox: 10, stockCartons: 18, moq: 1, image: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=600&q=80', barcode: '86901112233', lastPriceUpdate: '۱۴۰۳/۰۶/۰۳', hologram: 'شرکتی اصل', tierDiscounts: [], description: '', isAvailable: true },
        unit: 'box',
        quantity: 10,
        unitPrice: 840000,
        totalPrice: 8400000
      }
    ],
    subtotal: 8400000,
    discountAmount: 0,
    finalTotal: 8400000,
    paymentMethod: 'cash',
    cashier: 'صندوق‌دار مرکزی انبار دخانیات سرو'
  },
  {
    id: 'rcpt_last_month_1',
    receiptNumber: 'POS-14030528-0810',
    createdAt: '1403/05/28 12:00',
    customerName: 'هایپرمارکت آریا (موسوی)',
    items: [
      {
        product: { id: 'marlboro-double-mix', nameFa: 'مارلبرو دابل میکس دو کپسوله', nameEn: 'Marlboro Double Mix', brand: 'Marlboro', category: 'cigarettes', origin: 'سوئیس', tar: '5mg', nicotine: '0.4mg', cartonPrice: 96000000, boxPrice: 1980000, packPrice: 198000, boxesPerCarton: 50, packsPerBox: 10, stockCartons: 10, moq: 1, image: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=600&q=80', barcode: '76101117766', lastPriceUpdate: '۱۴۰۳/۰۵/۲۸', hologram: 'اورجینال اروپایی', tierDiscounts: [], description: '', isAvailable: true },
        unit: 'carton',
        quantity: 1,
        unitPrice: 96000000,
        totalPrice: 96000000
      }
    ],
    subtotal: 96000000,
    discountAmount: 1000000,
    finalTotal: 95000000,
    paymentMethod: 'pos_terminal',
    terminalRefNumber: '77615243',
    cashier: 'صندوق‌دار مرکزی انبار دخانیات سرو'
  }
];

export const AccountingPosPanel: React.FC<AccountingPosPanelProps> = ({
  products: initialProducts,
  onUpdateProductsStock,
  onReturnToStore,
  showToast,
}) => {
  // Authentication state with proactive token expiration check
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const hasAuth = localStorage.getItem('sovin_pos_auth') === 'true';
      if (!hasAuth) return false;
      // اگر زمان توکن به پایان رسیده باشد، بلافاصله ابطال و عدم احراز هویت اعمال می‌گردد
      if (isPosSessionExpired()) {
        invalidatePosTokenAndSession('token_expired');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });

  // Sync URL with login state: if not authenticated, ensure address bar shows /shopmanage/login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        if (!window.location.pathname.includes('/shopmanage/login')) {
          window.history.replaceState({ subTab: 'login' }, '', '/shopmanage/login');
        }
      } else {
        if (window.location.pathname.includes('/shopmanage/login')) {
          window.history.replaceState({ subTab: 'pos' }, '', '/shopmanage/sandogh');
        }
      }
    }
  }, [isAuthenticated]);

  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState<number>(() => {
    return getRemainingSessionSeconds();
  });

  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string>(() => {
    const reason = consumeLastLogoutReason();
    if (reason === 'token_expired' || reason === 'token_invalid_or_expired') {
      return 'نشست امنیتی شما به پایان رسید و توکن منقضی گردید. جهت حفظ امنیت مالی و انبار، به صورت خودکار از صندوق خارج شدید. لطفاً مجدداً وارد شوید.';
    }
    return '';
  });

  const [showPwaInstallGuideModal, setShowPwaInstallGuideModal] = useState<boolean>(false);

  const [showSessionSecurityModal, setShowSessionSecurityModal] = useState<boolean>(false);
  const [showExtendNotice, setShowExtendNotice] = useState<boolean>(false);

  const [loginPhone, setLoginPhone] = useState(AUTHORIZED_PHONE);
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Helper to check staff permissions safely
  const hasStaffPerm = (perm: StaffPermission): boolean => {
    if (currentStaff.role === 'super_admin') return true;
    return currentStaff.permissions?.includes(perm) ?? false;
  };

  type PosSubTab = 'pos' | 'inventory' | 'ledger' | 'customers' | 'user_management' | 'reports' | 'monthly_compare' | 'staff_management' | 'customer_app' | 'analytics' | 'tickets' | 'sms_management' | 'notifications' | 'blog' | 'site_settings' | 'warehouse_messages' | 'product-manage' | 'online_orders';

  const getSubTabFromPath = (pathname: string): PosSubTab => {
    const p = pathname.toLowerCase();
    if (p.includes('/shopmanage/online-orders') || p.includes('/shopmanage/orders') || p.includes('/shopmanage/sefareshat')) return 'online_orders';
    if (p.includes('/shopmanage/site-settings') || p.includes('/shopmanage/sliders') || p.includes('/shopmanage/banners')) return 'site_settings';
    if (p.includes('/shopmanage/blog') || p.includes('/shopmanage/maghale') || p.includes('/shopmanage/maghalat')) return 'blog';
    if (p.includes('/shopmanage/anbar') || p.includes('/shopmanage/inventory')) return 'inventory';
    if (p.includes('/shopmanage/hesabdari') || p.includes('/shopmanage/ledger')) return 'ledger';
    if (p.includes('/shopmanage/customers') || p.includes('/shopmanage/moshtarian')) return 'customers';
    if (p.includes('/shopmanage/users')) return 'user_management';
    if (p.includes('/shopmanage/reports') || p.includes('/shopmanage/gozareshat')) return 'reports';
    if (p.includes('/shopmanage/monthly') || p.includes('/shopmanage/compare')) return 'monthly_compare';
    if (p.includes('/shopmanage/staff')) return 'staff_management';
    if (p.includes('/shopmanage/customer-app') || p.includes('/shopmanage/app')) return 'customer_app';
    if (p.includes('/shopmanage/analytics') || p.includes('/shopmanage/amar')) return 'analytics';
    if (p.includes('/shopmanage/tickets') || p.includes('/shopmanage/ticket')) return 'tickets';
    if (p.includes('/shopmanage/sms') || p.includes('/shopmanage/payamak')) return 'sms_management';
    if (p.includes('/shopmanage/notifications') || p.includes('/shopmanage/notif')) return 'notifications';
    if (p.includes('/shopmanage/messages') || p.includes('/shopmanage/warehouse-messages')) return 'warehouse_messages';
    if (p.includes('/shopmanage/products')) return 'product-manage';
    if (p.includes('/shopmanage/sandogh') || p.includes('/shopmanage/pos')) return 'pos';
    return 'pos';
  };

  const getPathForSubTab = (tab: PosSubTab): string => {
    const map: Record<PosSubTab, string> = {
      pos: '/shopmanage/sandogh',
      online_orders: '/shopmanage/online-orders',
      inventory: '/shopmanage/anbar',
      customers: '/shopmanage/customers',
      user_management: '/shopmanage/users',
      reports: '/shopmanage/reports',
      monthly_compare: '/shopmanage/monthly',
      ledger: '/shopmanage/hesabdari',
      tickets: '/shopmanage/tickets',
      sms_management: '/shopmanage/sms',
      notifications: '/shopmanage/notifications',
      staff_management: '/shopmanage/staff',
      customer_app: '/shopmanage/customer-app',
      analytics: '/shopmanage/analytics',
      blog: '/shopmanage/blog',
      site_settings: '/shopmanage/site-settings',
      warehouse_messages: '/shopmanage/messages',
      'product-manage': '/shopmanage/products',
    };
    return map[tab] || '/shopmanage/sandogh';
  };

  // Active Sub Tab
  const [activeSubTab, setActiveSubTabState] = useState<PosSubTab>(() => {
    if (typeof window !== 'undefined') {
      return getSubTabFromPath(window.location.pathname);
    }
    return 'pos';
  });

  const setActiveSubTab = (tab: PosSubTab, pushState: boolean = true) => {
    setActiveSubTabState(tab);
    if (pushState && typeof window !== 'undefined') {
      const target = getPathForSubTab(tab);
      if (window.location.pathname !== target) {
        window.history.pushState({ subTab: tab }, '', target);
      }
    }
  };

  useEffect(() => {
    const handleSubPopState = () => {
      if (typeof window !== 'undefined' && window.location.pathname.includes('/shopmanage')) {
        const tab = getSubTabFromPath(window.location.pathname);
        setActiveSubTabState(tab);
      }
    };
    window.addEventListener('popstate', handleSubPopState);
    return () => window.removeEventListener('popstate', handleSubPopState);
  }, []);

  // Redirect to sandogh if logged in but on /shopmanage/login
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && (window.location.pathname === '/shopmanage/login' || window.location.pathname === '/shopmanage/login/')) {
      window.history.replaceState({ subTab: 'pos' }, '', '/shopmanage/sandogh');
    }
  }, [isAuthenticated]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showBlogManagementModal, setShowBlogManagementModal] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Warehouse message count state & effect
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);

  const fetchUnreadMessagesCount = async () => {
    try {
      const messagesList = await api.contact.getMessages();
      if (messagesList && Array.isArray(messagesList)) {
        const count = messagesList.filter(m => !m.is_read).length;
        setUnreadMessageCount(count);
      }
    } catch (err) {
      console.error('Error fetching unread message count:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadMessagesCount();
      const intervalId = setInterval(fetchUnreadMessagesCount, 30000);
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);

  // Online Customer Orders pending count
  const [pendingOnlineOrdersCount, setPendingOnlineOrdersCount] = useState<number>(0);

  const updatePendingOnlineOrdersCount = () => {
    try {
      const stored = localStorage.getItem('sevin_orders');
      if (stored) {
        const orders = JSON.parse(stored);
        const count = orders.filter((o: any) => {
          const st = o.orderStatus;
          if (st === 'approved' || st === 'shipped' || st === 'delivered' || st === 'cancelled') return false;
          if (st === 'pending_approval' || st === 'pending' || !st) return true;
          return false;
        }).length;
        setPendingOnlineOrdersCount(count);
      } else {
        setPendingOnlineOrdersCount(0);
      }
    } catch {
      setPendingOnlineOrdersCount(0);
    }
  };

  useEffect(() => {
    updatePendingOnlineOrdersCount();
    window.addEventListener('sevin_orders_updated', updatePendingOnlineOrdersCount);
    window.addEventListener('storage', updatePendingOnlineOrdersCount);
    return () => {
      window.removeEventListener('sevin_orders_updated', updatePendingOnlineOrdersCount);
      window.removeEventListener('storage', updatePendingOnlineOrdersCount);
    };
  }, []);

  // Dynamic Manifest Swapping for POS PWA
  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      manifestLink.setAttribute('href', '/pos-manifest.json');
    }
    return () => {
      if (manifestLink) {
        manifestLink.setAttribute('href', '/manifest.json');
      }
    };
  }, []);

  // Close tools dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
    };
    if (showToolsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showToolsDropdown]);

  // Products stock state
  const [productsList, setProductsList] = useState<CigaretteProduct[]>(initialProducts);

  useEffect(() => {
    setProductsList(initialProducts);
  }, [initialProducts]);

  // Sound feedback toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // POS Cart State
  const [posCart, setPosCart] = useState<PosSaleItem[]>([]);
  const [posMobileView, setPosMobileView] = useState<'shelf' | 'cart'>('shelf');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [posSearch, setPosSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customerName, setCustomerName] = useState('مشتری حضوری فروشگاه');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedLedgerCustomerId, setSelectedLedgerCustomerId] = useState<string>('');
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'pos_terminal' | 'cash' | 'ledger' | 'split' | 'foreign' | null>(null);
  const [foreignCurrencyDetails, setForeignCurrencyDetails] = useState<{ currency: string, rate: number } | null>(null);
  const [foreignCurrencyAmount, setForeignCurrencyAmount] = useState<number>(100);
  const [foreignExchangeRate, setForeignExchangeRate] = useState<number>(71500);
  const [splitPaidAmount, setSplitPaidAmount] = useState<number>(0);
  const [splitPaidVia, setSplitPaidVia] = useState<'pos_terminal' | 'cash'>('pos_terminal');
  const [terminalRef, setTerminalRef] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const [usdRate, setUsdRate] = useState<number>(71500);
  const [eurRate, setEurRate] = useState<number>(76000);
  const [currencyRates, setCurrencyRates] = useState<any[]>([]);

  useEffect(() => {
    currencyRatesApi.getRates().then(rates => {
        setCurrencyRates(rates);
        const usd = rates.find(r => r.code === 'USD');
        const eur = rates.find(r => r.code === 'EUR');
        if (usd) setUsdRate(usd.rate_in_toman || usd.rate);
        if (eur) setEurRate(eur.rate_in_toman || eur.rate);
    });
  }, []);

  const [showCurrencyRateModal, setShowCurrencyRateModal] = useState<boolean>(false);

  // Ledger Customers state
  const [posCustomers, setPosCustomers] = useState<PosCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_customers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_LEDGER_CUSTOMERS;
  });

  // Ledger transactions history
  const [ledgerTransactions, setLedgerTransactions] = useState<PosLedgerTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_ledger_txs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'tx_1', customerId: 'cust_1', date: '1403/06/01 10:30', amount: 4500000, type: 'debit', description: 'خرید نسیه فاکتور POS-20260801-1029' },
      { id: 'tx_2', customerId: 'cust_2', date: '1403/06/02 14:15', amount: 1200000, type: 'credit', description: 'دریافت پیش‌پرداخت نسیه' }
    ];
  });

  // Customer Search & Filter State in Ledger Tab
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<'all' | 'debtors' | 'creditors' | 'settled'>('all');

  // New & Edit Customer Modal State
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<PosCustomer | null>(null);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCity, setNewCustCity] = useState('تهران');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [newCustInitialBalance, setNewCustInitialBalance] = useState<number>(0);

  // Customer Account Statement / History Modal
  const [customerHistoryModalCust, setCustomerHistoryModalCust] = useState<PosCustomer | null>(null);

  // Record Payment for Customer Modal
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<PosCustomer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'credit' | 'debit'>('credit'); // credit = پرداخت مشتری (کاهش بدهی)
  const [paymentNote, setPaymentNote] = useState('');

  // Reports Date Filter State & Sub-views
  const [reportDateFilter, setReportDateFilter] = useState<'all' | 'today' | 'yesterday' | '7days' | 'this_month' | 'last_month' | 'custom'>('all');
  const [reportSearchQuery, setReportSearchQuery] = useState<string>('');
  const [customSearchDate, setCustomSearchDate] = useState<string>('');
  const [reportSubTab, setReportSubTab] = useState<'daily' | 'monthly' | 'products' | 'receipts'>('daily');
  const [selectedDateForDetailModal, setSelectedDateForDetailModal] = useState<string | null>(null);
  const [selectedMonthForDetailModal, setSelectedMonthForDetailModal] = useState<string | null>(null);

  // Inventory adjustment modal
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState<CigaretteProduct | null>(null);
  const [adjustType, setAdjustType] = useState<'stock_in' | 'damage' | 'adjustment'>('stock_in');
  const [adjustUnit, setAdjustUnit] = useState<'carton' | 'box' | 'pack'>('carton');
  const [adjustQuantityCartons, setAdjustQuantityCartons] = useState<number>(1);
  const [adjustNote, setAdjustNote] = useState('');

  // Add New Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdNameFa, setNewProdNameFa] = useState('');
  const [newProdNameEn, setNewProdNameEn] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<CigaretteCategory>('drinks_coffee');
  const [newProdCartonPrice, setNewProdCartonPrice] = useState<number>(4500000);
  const [newProdBoxPrice, setNewProdBoxPrice] = useState<number>(450000);
  const [newProdPackPrice, setNewProdPackPrice] = useState<number>(45000);
  const [newProdBoxesPerCarton, setNewProdBoxesPerCarton] = useState<number>(10);
  const [newProdPacksPerBox, setNewProdPacksPerBox] = useState<number>(10);
  const [newProdInitialCartons, setNewProdInitialCartons] = useState<number>(20);
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdIsPosOnly, setNewProdIsPosOnly] = useState<boolean>(true);

  // Product Insights State
  const [selectedProductForInsights, setSelectedProductForInsights] = useState<CigaretteProduct | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  // Function to generate mock performance data for a product
  const getProductPerformanceData = (productId: string) => {
    const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];
    
    return months.map((month, idx) => {
      const baseValue = (seed % 50) + 20;
      const seasonalFactor = Math.sin((idx + seed) * 0.5) * 15;
      return {
        name: month,
        sales: Math.max(5, Math.floor(baseValue + seasonalFactor)),
        revenue: Math.floor((baseValue + seasonalFactor) * 1500000)
      };
    });
  };

  // Past Receipts Ledger
  const [receiptsList, setReceiptsList] = useState<PosReceiptInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_receipts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SAMPLE_INITIAL_RECEIPTS;
  });

  // Stock logs
  const [stockLogs, setStockLogs] = useState<StockAdjustmentLog[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_stock_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Thermal receipt modal for printing
  const [activeReceiptToPrint, setActiveReceiptToPrint] = useState<PosReceiptInvoice | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Staff & Managers Access State
  const [staffList, setStaffList] = useState<WarehouseStaffUser[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_staff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((s: WarehouseStaffUser) => 
            s.phone !== '09120759419' && 
            s.phone !== '09351112233' && 
            s.phone !== '09123456789' && 
            !s.fullName?.includes('حسینی') && 
            !s.fullName?.includes('قاسم‌پور')
          );
          if (cleaned.length > 0) {
            return cleaned.map((s: WarehouseStaffUser) => {
              if (s.role === 'super_admin') {
                const allPossiblePerms: StaffPermission[] = [
                  'manage_pos',
                  'manage_inventory',
                  'quick_add_product',
                  'manage_ledger',
                  'view_reports',
                  'monthly_comparison',
                  'manage_staff',
                  'customer_app_connect',
                  'send_sms',
                  'manage_tickets',
                  'manage_notifications',
                  'manage_warehouse_messages',
                  'manage_site_settings',
                  'manage_sliders',
                  'manage_footer_settings',
                  'delete_receipts'
                ];
                return {
                  ...s,
                  status: 'active',
                  permissions: Array.from(new Set([...(s.permissions || []), ...allPossiblePerms]))
                };
              }
              return s;
            });
          }
        }
      }
    } catch {}
    return DEFAULT_STAFF_MEMBERS;
  });

  const [currentStaff, setCurrentStaff] = useState<WarehouseStaffUser>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_current_staff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'super_admin' || parsed.phone === '09120759419') {
          const allPossiblePerms: StaffPermission[] = [
            'manage_pos',
            'manage_inventory',
            'quick_add_product',
            'manage_ledger',
            'view_reports',
            'monthly_comparison',
            'manage_staff',
            'customer_app_connect',
            'send_sms',
            'manage_tickets',
            'manage_notifications',
            'manage_warehouse_messages',
            'manage_site_settings',
            'manage_sliders',
            'manage_footer_settings',
            'delete_receipts'
          ];
          return {
            ...parsed,
            status: 'active',
            permissions: Array.from(new Set([...(parsed.permissions || []), ...allPossiblePerms]))
          };
        }
        return parsed;
      }
    } catch {}
    return staffList[0] || DEFAULT_STAFF_MEMBERS[0];
  });

  const [showCustomerAppModal, setShowCustomerAppModal] = useState<boolean>(false);
  const [showBackendModal, setShowBackendModal] = useState<boolean>(false);
  const [crmConfig, setCrmConfig] = useState<DjangoCrmConfig>(() => {
    try {
      const saved = localStorage.getItem('azarakhsh_crm_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // آدرس قدیمی و غیرفعال api.azarakhsh-sovin.com را به بک‌اند واقعی اصلاح کن
        if (!parsed.apiUrl || parsed.apiUrl.includes('api.azarakhsh-sovin.com')) {
          parsed.apiUrl = 'https://cigar.sevinhost.ir/api/v1';
        }
        return parsed;
      }
    } catch {}
    return {
      apiUrl: 'https://cigar.sevinhost.ir/api/v1',
      apiToken: (typeof localStorage !== 'undefined' ? localStorage.getItem('sevin_api_token') || '' : ''),
      autoSync: true,
      status: 'idle',
      totalSyncedProducts: 0,
      lastSyncTime: '۱۴۰۳/۰۶/۱۰ - ۱۰:۰۰'
    };
  });

  // Kavenegar SMS Gateway Live States
  const [smsSubTab, setSmsSubTab] = useState<'settings_patterns' | 'sms_logs'>('settings_patterns');
  const [kavenegarConfig, setKavenegarConfig] = useState<{
    name: string;
    api_token: string;
    is_active: boolean;
    debug_mode: boolean;
  }>({
    name: 'سامانه پیامک هوشمند دخانیات سرو (Kavenegar Gateway)',
    api_token: '366E417A5478474274416738367963385250466453673D3D',
    is_active: true,
    debug_mode: false,
  });
  const [showApiToken, setShowApiToken] = useState<boolean>(false);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [smsPatterns, setSmsPatterns] = useState<any[]>([]);
  const [smsSearch, setSmsSearch] = useState('');
  const [smsStatusFilter, setSmsStatusFilter] = useState<'all' | 'delivered' | 'queued' | 'failed'>('all');
  const [smsPatternFilter, setSmsPatternFilter] = useState<string>('all');
  const [smsSuccessMessage, setSmsSuccessMessage] = useState('');
  const [smsErrorMessage, setSmsErrorMessage] = useState('');
  const [isSmsLoading, setIsSmsLoading] = useState(false);
  const [savingPatternKey, setSavingPatternKey] = useState<Record<string, boolean>>({});
  const [savedPatternKey, setSavedPatternKey] = useState<Record<string, boolean>>({});
  const [isSavingAllPatterns, setIsSavingAllPatterns] = useState(false);

  const [lastSmsSync, setLastSmsSync] = useState<Date | null>(null);

  // Sync / Load SMS Data
  const loadSmsData = async () => {
    try {
      setIsSmsLoading(true);
      const [logs, patterns, settings] = await Promise.all([
        djangoFetchSmsLogs(crmConfig),
        djangoFetchSmsPatterns(crmConfig),
        djangoFetchKavenegarSettings(crmConfig)
      ]);
      setSmsLogs(logs);
      setSmsPatterns(patterns);
      if (settings) {
        setKavenegarConfig(settings);
      }
      setLastSmsSync(new Date());
    } catch (e) {
      console.warn('Error fetching live SMS data:', e);
    } finally {
      setIsSmsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'sms_management') {
      loadSmsData();
    }
  }, [crmConfig, activeSubTab]);

  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [showOnlineStaffModal, setShowOnlineStaffModal] = useState<boolean>(false);
  const [onlineSessions, setOnlineSessions] = useState<{
    id: string;
    fullName: string;
    phone: string;
    roleTitleFa: string;
    role: string;
    loginTime: string;
    avatarColor?: string;
  }[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_online_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Unique map by clean phone
          const sessionMap = new Map();
          parsed.forEach((s: any) => {
            if (s && s.phone) {
              const cleanPhone = String(s.phone).replace(/\D/g, '');
              if (!sessionMap.has(cleanPhone)) {
                sessionMap.set(cleanPhone, s);
              }
            }
          });
          return Array.from(sessionMap.values());
        }
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sovin_pos_online_sessions', JSON.stringify(onlineSessions));
    } catch {}
  }, [onlineSessions]);

  useEffect(() => {
    let isMounted = true;
    const loadActiveSessions = async () => {
      try {
        const res = await staffAuthService.getActiveSessions();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0 && isMounted) {
          const currentPhoneClean = currentStaff?.phone ? String(currentStaff.phone).replace(/\D/g, '') : '';
          const currentIdStr = currentStaff?.id ? String(currentStaff.id) : '';

          const mapped = res.data.map((s: any) => {
            const sPhoneClean = s.phone ? String(s.phone).replace(/\D/g, '') : '';
            const sIdStr = String(s.id || s.user_id || s.userId || '');
            const isMe = Boolean(
              s.isCurrentUser || s.is_current_user || s.is_self ||
              (currentIdStr && sIdStr === currentIdStr) ||
              (currentPhoneClean && sPhoneClean && sPhoneClean === currentPhoneClean)
            );

            return {
              id: sIdStr || sPhoneClean || s.fullName || s.full_name,
              fullName: s.fullName || s.full_name || s.name || 'کاربر سیستم',
              phone: s.phone || s.mobile || s.username || '',
              roleTitleFa: s.roleTitleFa || s.role_title || s.role_display || 'صندوق‌دار فروشگاه',
              role: s.role || 'staff',
              loginTime: s.loginTime || s.online_time || s.login_time || s.time || new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
              avatarColor: s.avatarColor || 'bg-indigo-600',
              isCurrentUser: isMe
            };
          });

          // Ensure current user session is present in list
          const hasCurrent = mapped.some((s: any) => s.isCurrentUser);
          if (!hasCurrent && currentStaff && currentStaff.phone) {
            mapped.unshift({
              id: String(currentStaff.id || 'current_user_session'),
              fullName: currentStaff.fullName,
              phone: currentStaff.phone,
              roleTitleFa: currentStaff.roleTitleFa || 'مدیریت / صندوق',
              role: currentStaff.role || 'staff',
              loginTime: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
              avatarColor: currentStaff.avatarColor || 'bg-indigo-600',
              isCurrentUser: true
            });
          }

          setOnlineSessions(mapped);
          return;
        }
      } catch {}

      if (isAuthenticated && currentStaff && currentStaff.phone && isMounted) {
        const cleanCurrentPhone = String(currentStaff.phone).replace(/\D/g, '');
        const mySession = {
          id: String(currentStaff.id || `staff_${cleanCurrentPhone}`),
          fullName: currentStaff.fullName,
          phone: currentStaff.phone,
          roleTitleFa: currentStaff.roleTitleFa || 'مدیریت / صندوق',
          role: currentStaff.role || 'staff',
          loginTime: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          avatarColor: currentStaff.avatarColor || 'bg-indigo-600',
          isCurrentUser: true
        };
        setOnlineSessions([mySession]);
      }
    };

    loadActiveSessions();
    const timer = setInterval(loadActiveSessions, 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isAuthenticated, currentStaff?.phone, currentStaff?.id, currentStaff?.fullName]);

  const [showQuickAddProductModal, setShowQuickAddProductModal] = useState<boolean>(false);
  const [pendingBarcode, setPendingBarcode] = useState<string>('');
  const [productManagementInitialTab, setProductManagementInitialTab] = useState<'list' | 'editor'>('list');
  const [productManagementInitialBarcode, setProductManagementInitialBarcode] = useState<string>('');
  const [productManagementSelectedProduct, setProductManagementSelectedProduct] = useState<CigaretteProduct | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('sovin_pos_staff', JSON.stringify(staffList));
    } catch {}
  }, [staffList]);

  useEffect(() => {
    try {
      localStorage.setItem('sovin_pos_current_staff', JSON.stringify(currentStaff));
    } catch {}
  }, [currentStaff]);

  // Quick Add Product Handler
  const handleQuickAddProduct = async (newProduct: CigaretteProduct, addToCartDirectly: boolean) => {
    try {
      // 1. First sync with database
      const created = await api.products.create(newProduct);
      
      // 2. Update local state
      const updated = [created, ...productsList];
      setProductsList(updated);
      
      try {
        localStorage.setItem('wholesale_products', JSON.stringify(updated));
        localStorage.setItem('sovin_django_products', JSON.stringify(updated));
      } catch {}

      if (onUpdateProductsStock) {
        onUpdateProductsStock(updated);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sevin-products-changed', { detail: { products: updated, product: created } }));
      }
      
      if (addToCartDirectly) {
        handleAddProductToPos(created, created.isBoxOnly ? 'box' : 'box');
      }
      
      setSuccessBanner(`کالای «${created.nameFa}» با موفقیت در دیتابیس ثبت و به انبار و ویترین سایت اضافه شد.`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err: any) {
      if (showToast) showToast(err?.message || 'خطا در ثبت سریع محصول در دیتابیس');
      console.error('Quick Add error:', err);
      
      // Fallback to local only if API fails
      const updated = [newProduct, ...productsList];
      setProductsList(updated);
      try {
        localStorage.setItem('wholesale_products', JSON.stringify(updated));
        localStorage.setItem('sovin_django_products', JSON.stringify(updated));
      } catch {}
      if (onUpdateProductsStock) onUpdateProductsStock(updated);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sevin-products-changed', { detail: { products: updated, product: newProduct } }));
      }
    }
  };

  const handleSaveCurrencyRates = (newUsd: number, newEur: number) => {
    setUsdRate(newUsd);
    setEurRate(newEur);
    try {
      localStorage.setItem('sovin_usd_rate', newUsd.toString());
      localStorage.setItem('sovin_eur_rate', newEur.toString());
    } catch {}
    if ((paymentMethod as string) === 'usd') setForeignExchangeRate(newUsd);
    if ((paymentMethod as string) === 'eur') setForeignExchangeRate(newEur);
    setShowCurrencyRateModal(false);
    setSuccessBanner(`نرخ جدید ارز با موفقیت ثبت شد (دلار: ${newUsd.toLocaleString()} / یورو: ${newEur.toLocaleString()})`);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Save state helpers
  useEffect(() => {
    try {
      localStorage.setItem('sovin_pos_customers', JSON.stringify(posCustomers));
    } catch {}
  }, [posCustomers]);

  useEffect(() => {
    try {
      localStorage.setItem('sovin_pos_ledger_txs', JSON.stringify(ledgerTransactions));
    } catch {}
  }, [ledgerTransactions]);

  // Focus barcode input on mount and on tab switch
  useEffect(() => {
    if (isAuthenticated && activeSubTab === 'pos') {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 200);
    }
  }, [isAuthenticated, activeSubTab]);

  // Ensure activeSubTab is permitted for currentStaff
  useEffect(() => {
    if (!isAuthenticated) return;
    const isTabAllowed = (tab: PosSubTab): boolean => {
      if (currentStaff.role === 'super_admin') return true;
      switch (tab) {
        case 'pos': return hasStaffPerm('manage_pos');
        case 'inventory': return hasStaffPerm('manage_inventory');
        case 'customers': return hasStaffPerm('manage_ledger');
        case 'reports': return hasStaffPerm('view_reports');
        case 'monthly_compare': return hasStaffPerm('monthly_comparison') || hasStaffPerm('view_reports');
        case 'ledger': return hasStaffPerm('manage_ledger') || hasStaffPerm('view_reports');
        case 'staff_management': return hasStaffPerm('manage_staff');
        case 'tickets': return hasStaffPerm('manage_tickets');
        case 'sms_management': return hasStaffPerm('send_sms');
        case 'notifications': return hasStaffPerm('manage_notifications');
        case 'warehouse_messages': return hasStaffPerm('manage_warehouse_messages');
        case 'site_settings': return hasStaffPerm('manage_site_settings') || hasStaffPerm('manage_sliders') || hasStaffPerm('manage_footer_settings');
        case 'customer_app': return hasStaffPerm('customer_app_connect');
        case 'analytics': return hasStaffPerm('view_reports');
        default: return true;
      }
    };

    if (!isTabAllowed(activeSubTab)) {
      const candidateTabs: PosSubTab[] = ['pos', 'inventory', 'customers', 'reports', 'monthly_compare', 'ledger', 'staff_management', 'tickets', 'sms_management', 'notifications', 'warehouse_messages', 'site_settings'];
      const firstAllowed = candidateTabs.find(t => isTabAllowed(t)) || 'pos';
      setActiveSubTab(firstAllowed);
    }
  }, [currentStaff, isAuthenticated, activeSubTab]);

  // Audio bip feedback (Add product sound vs Remove product sound)
  const playBeep = (type: 'add' | 'remove' = 'add') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      if (type === 'add') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else {
        // Remove item tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {}
  };

  // پخش صدای هشدار انقضای نشست (خروج)
  const playAlertTone = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Use a softer, more professional "ding-down" sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        
        // Clean up context after sound plays
        setTimeout(() => ctx.close(), 500);
      }
    } catch {}
  };

  // تابع خروج خودکار امنیتی کاربر از صندوق به محض پایان زمان توکن
  const handleAutoLogoutDueToExpiration = (reason: string = 'token_expired') => {
    if (!isAuthenticated) return; // مانع لوپ بی‌نهایت و هنگ کردن صفحه شوید

    // ۱. ابطال کامل توکن در حافظه، هدرها و LocalStorage
    invalidatePosTokenAndSession(reason);

    // ۲. خروج کاربر از وضعیت احراز هویت صندوق و بستن دسترسی‌ها
    setIsAuthenticated(false);

    // ۳. پاکسازی پرسنل از لیست نشست‌های فعال آنلاین
    if (currentStaff?.phone) {
      setOnlineSessions(prev => prev.filter(s => s.phone !== currentStaff.phone));
    }

    // ۴. ثبت پیام هشدار شفاف در صفحه ورود
    setSessionExpiredNotice('نشست امنیتی شما به دلیل انقضای توکن به پایان رسید. توکن باطل گردیده و جهت حفظ امنیت صندوق، سیستم به صورت خودکار شما را خارج کرد. لطفاً مجدداً وارد شوید.');

    // ۵. پخش هشدار صوتی
    playAlertTone();
  };

  // پایش بی‌وقفه زمان اعتبار توکن و خروج خودکار به محض اتمام زمان
  useEffect(() => {
    if (!isAuthenticated) return;

    // بررسی بدو ورود/لود مجدد
    if (isPosSessionExpired()) {
      handleAutoLogoutDueToExpiration('token_expired');
      return;
    }

    setSessionRemainingSeconds(getRemainingSessionSeconds());

    const intervalId = setInterval(() => {
      const rem = getRemainingSessionSeconds();
      setSessionRemainingSeconds(rem);

      if (rem <= 60 && rem > 0) {
        setShowExtendNotice(true);
      } else {
        setShowExtendNotice(false);
      }

      if (rem <= 0) {
        clearInterval(intervalId);
        setShowExtendNotice(false);
        handleAutoLogoutDueToExpiration('token_expired');
      }
    }, 1000);

    const handleExpiredEvent = (e: any) => {
      const reason = e?.detail?.reason || 'token_expired';
      if (reason === 'manual_logout') return;
      handleAutoLogoutDueToExpiration(reason);
    };

    window.addEventListener('sevin-pos-session-expired', handleExpiredEvent);
    window.addEventListener('sevin-token-expired', handleExpiredEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('sevin-pos-session-expired', handleExpiredEvent);
      window.removeEventListener('sevin-token-expired', handleExpiredEvent);
    };
  }, [isAuthenticated, currentStaff?.phone, soundEnabled]);

  // Login handler connected to Django API with loading spinner
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      // Elegant 750ms delay for smooth loading transition
      await new Promise(resolve => setTimeout(resolve, 750));
      const res = await api.accounts.posLogin(loginPhone, loginPass);
      if (res.success) {
        setIsAuthenticated(true);
        setCurrentStaff(res.data.user);
        setLoginError('');
        setSessionExpiredNotice('');

        if (typeof window !== 'undefined' && (window.location.pathname.includes('/login') || window.location.pathname === '/shopmanage')) {
          window.history.pushState({ subTab: 'pos' }, '', '/shopmanage/sandogh');
        }

        // مقداردهی اولیه زمان اعتبار توکن و آغاز تایمر پایش نشست
        const token = res.data?.tokens?.access;
        const refreshToken = res.data?.tokens?.refresh;
        initPosSessionExpiry(token);
        setSessionRemainingSeconds(getRemainingSessionSeconds());

        try {
          localStorage.setItem('sovin_pos_auth', 'true');
          localStorage.setItem('sovin_pos_current_staff', JSON.stringify(res.data.user));
          if (refreshToken) {
            localStorage.setItem('sevin_refresh_token', refreshToken);
          }
          
          // Also insert this new logged in staff to staffList if not already present
          if (!staffList.some(s => s.phone === res.data.user.phone)) {
            const updatedStaffList = [res.data.user, ...staffList];
            setStaffList(updatedStaffList);
            localStorage.setItem('sovin_pos_staff', JSON.stringify(updatedStaffList));
          }

          // Register in concurrent online sessions
          setOnlineSessions(prev => {
            if (prev.some(s => s.phone === res.data.user.phone)) return prev;
            return [
              {
                id: res.data.user.id || `staff_${Date.now()}`,
                fullName: res.data.user.fullName,
                phone: res.data.user.phone,
                roleTitleFa: res.data.user.roleTitleFa,
                role: res.data.user.role,
                loginTime: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
                avatarColor: res.data.user.avatarColor || 'bg-indigo-600'
              },
              ...prev
            ];
          });
        } catch {}
        
        // Refresh live SMS logs list since a "welcome" SMS was just logged on login
        setTimeout(async () => {
          try {
            const logs = await djangoFetchSmsLogs(crmConfig);
            setSmsLogs(logs);
          } catch {}
        }, 1000);
      } else {
        setLoginError(res.message || 'رمز عبور یا کلید ورود نادرست است.');
      }
    } catch (err: any) {
      setLoginError('خطا در ارتباط با سرور حسابداری جنگو.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // ۱. پاکسازی نشست در حافظه کلاینت بلافاصله
    invalidatePosTokenAndSession('manual_logout');
    
    // ۲. فراخوانی بک‌اند در پس‌زمینه بدون مسدودسازی رابط کاربری
    // از try-catch برای اطمینان از عدم توقف در صورت خطای بک‌اند استفاده شد
    api.accounts.posLogout().catch(err => console.error('Logout background API error:', err));
    
    if (currentStaff?.phone) {
      setOnlineSessions(prev => prev.filter(s => s.phone !== currentStaff.phone));
    }

    // هدایت سریع به صفحه لاگین بدون وقفه طولانی
    setIsAuthenticated(false);
    setSessionExpiredNotice('');
    setIsLoggingOut(false);
    
    // اطمینان از ریدایرکت مستقیم به صفحه لاگین
    window.location.href = '/shopmanage/login'; 
  };

  const handleExtendSession = () => {
    const minutes = 30; // Extend by 30 minutes
    extendPosSession(minutes);
    setSessionRemainingSeconds(getRemainingSessionSeconds());
    setShowExtendNotice(false);
  };

  // Add Product to POS Cart by Product Object
  const handleAddProductToPos = (product: CigaretteProduct, unit: 'carton' | 'box' | 'pack' = 'box') => {
    const stockInfo = getProductStockInfo(product);
    if (!stockInfo.isAvailable) {
      alert(`کالای «${product.nameFa}» اتمام موجودی است.`);
      return;
    }

    const isDrink = product.category === 'drinks_coffee';
    const effectiveUnit = isDrink ? 'pack' : unit;
    const unitPrice = isDrink 
      ? (product.packPrice || product.boxPrice || 50000)
      : unit === 'carton' 
        ? product.cartonPrice 
        : unit === 'box' 
          ? product.boxPrice 
          : Math.round(product.boxPrice / 10);

    playBeep();
    setPosCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.unit === effectiveUnit);

      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            unit: effectiveUnit,
            quantity: 1,
            unitPrice,
            totalPrice: unitPrice,
          }
        ];
      }
    });

    const unitTitle = isDrink ? 'عدد (تکی)' : unit === 'carton' ? 'کارتن' : unit === 'box' ? 'باکس' : 'پاکت';
    setSuccessBanner(`«${product.nameFa}» (${unitTitle}) به فاکتور جاری اضافه شد.`);
    setTimeout(() => setSuccessBanner(null), 2500);
  };

  // Barcode input trigger on Enter / scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // Search by exact barcode match, barcode ending, or product ID
    const found = productsList.find(p => 
      p.barcode === query || 
      p.id.toLowerCase() === query.toLowerCase() ||
      (p.barcode && p.barcode.endsWith(query)) ||
      (query.length >= 4 && p.barcode && query.endsWith(p.barcode))
    );

    if (found) {
      const unitToUse = found.isBoxOnly ? 'box' : (found.packPrice ? 'pack' : 'box');
      handleAddProductToPos(found, unitToUse);
      setBarcodeInput('');
      setSuccessBanner(`کالای «${found.nameFa}» با بارکد ${query} به فاکتور فروش افزوده شد.`);
      setTimeout(() => setSuccessBanner(null), 2500);
      barcodeInputRef.current?.focus();
    } else {
      const nameMatch = productsList.find(p => 
        p.nameFa.toLowerCase().includes(query.toLowerCase()) || 
        p.nameEn.toLowerCase().includes(query.toLowerCase())
      );
      if (nameMatch) {
        const unitToUse = nameMatch.isBoxOnly ? 'box' : (nameMatch.packPrice ? 'pack' : 'box');
        handleAddProductToPos(nameMatch, unitToUse);
        setBarcodeInput('');
        setSuccessBanner(`کالای «${nameMatch.nameFa}» به فاکتور فروش افزوده شد.`);
        setTimeout(() => setSuccessBanner(null), 2500);
        barcodeInputRef.current?.focus();
      } else {
        // Barcode not found -> Navigate directly to full Product Management -> Add Product Editor with this barcode pre-filled
        setProductManagementInitialTab('editor');
        setProductManagementInitialBarcode(query);
        setProductManagementSelectedProduct(null);
        setBarcodeInput('');
        setActiveSubTab('product-manage');
        setSuccessBanner(`کالایی با بارکد «${query}» در انبار یافت نشد. صفحه تعریف محصول جدید با این بارکد باز گردید.`);
        setTimeout(() => setSuccessBanner(null), 4000);
      }
    }
  };

  // Update quantity in POS
  const handleUpdatePosQty = (idx: number, delta: number) => {
    if (delta < 0) {
      playBeep('remove');
    } else {
      playBeep('add');
    }
    setPosCart(prev => {
      const updated = [...prev];
      const newQty = updated[idx].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== idx);
      }
      updated[idx] = {
        ...updated[idx],
        quantity: newQty,
        totalPrice: newQty * updated[idx].unitPrice,
      };
      return updated;
    });
  };

  // Change unit in POS
  const handleChangePosUnit = (idx: number, newUnit: 'carton' | 'box' | 'pack') => {
    setPosCart(prev => {
      const updated = [...prev];
      const item = updated[idx];
      const newUnitPrice = newUnit === 'carton' 
        ? item.product.cartonPrice 
        : newUnit === 'box' 
          ? item.product.boxPrice 
          : Math.round(item.product.boxPrice / 10);
      
      updated[idx] = {
        ...item,
        unit: newUnit,
        unitPrice: newUnitPrice,
        totalPrice: item.quantity * newUnitPrice,
      };
      return updated;
    });
  };

  // Remove from POS
  const handleRemovePosItem = (idx: number) => {
    playBeep('remove');
    setPosCart(prev => prev.filter((_, i) => i !== idx));
  };

  // POS Totals
  const posSubtotal = useMemo(() => {
    return posCart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [posCart]);

  const posFinalTotal = useMemo(() => {
    return Math.max(0, posSubtotal - posDiscount);
  }, [posSubtotal, posDiscount]);

  // Finalize POS Sale & Deduct from Stock
  const handleFinalizePosSale = () => {
    if (posCart.length === 0) {
      alert('سبد فروش خالی است. لطفاً ابتدا کالا یا بارکد اسکن کنید.');
      return;
    }

    if (!paymentMethod) {
      alert('لطفاً روش تسویه را انتخاب کنید.');
      return;
    }

    if (paymentMethod === 'ledger' && !selectedLedgerCustomerId) {
      alert('برای فروش حساب دفتری (نسیه)، انتخاب مشتری عضو الزامی است.');
      return;
    }

    if (paymentMethod === 'split' && !selectedLedgerCustomerId && !customerName) {
      alert('برای پرداخت ترکیبی، انتخاب مشتری یا درج نام مشتری الزامی است.');
      return;
    }

    const now = new Date();
    const receiptNum = `POS-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const selectedCustObj = posCustomers.find(c => c.id === selectedLedgerCustomerId);
    const finalCustomerName = selectedCustObj ? selectedCustObj.name : (customerName.trim() || 'مشتری حضوری');
    const finalCustomerAddress = selectedCustObj?.address || undefined;

    // Calculate split payment values if applicable
    const validSplitPaid = Math.min(posFinalTotal, Math.max(0, splitPaidAmount));
    const remainingToLedger = Math.max(0, posFinalTotal - validSplitPaid);

    const newReceipt: PosReceiptInvoice = {
      id: `rcpt_${Date.now()}`,
      receiptNumber: receiptNum,
      createdAt: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      customerName: finalCustomerName,
      customerPhone: selectedCustObj ? selectedCustObj.phone : (customerPhone.trim() || undefined),
      customerAddress: finalCustomerAddress,
      items: [...posCart],
      subtotal: posSubtotal,
      discountAmount: posDiscount,
      finalTotal: posFinalTotal,
      paymentMethod,
      splitPaymentDetails: paymentMethod === 'split' ? {
        paidNow: validSplitPaid,
        paidVia: splitPaidVia,
        remainingToLedger,
      } : undefined,
      foreignCurrencyDetails: ((paymentMethod as string) === 'foreign' || (paymentMethod as string) === 'usd' || (paymentMethod as string) === 'eur') ? {
        currency: (paymentMethod === 'foreign' ? foreignCurrencyDetails?.currency : (paymentMethod as string).toUpperCase()) as 'USD' | 'EUR',
        amount: foreignCurrencyAmount,
        rate: foreignExchangeRate,
        tomanEquivalent: foreignCurrencyAmount * foreignExchangeRate,
      } : undefined,
      terminalRefNumber: terminalRef.trim() || undefined,
      notes: orderNotes.trim() || undefined,
      cashier: 'صندوق‌دار مرکزی انبار دخانیات سرو',
    };

    // Deduct stock from products cleanly
    const updatedProducts = productsList.map(p => {
      const soldItems = posCart.filter(item => item.product.id === p.id);
      if (soldItems.length === 0) return p;

      let cartonsToDeduct = 0;
      soldItems.forEach(si => {
        const boxesPerCarton = p.boxesPerCarton || 50;
        const packsPerBox = p.packsPerBox || 10;
        if (si.unit === 'carton') {
          cartonsToDeduct += si.quantity;
        } else if (si.unit === 'box') {
          cartonsToDeduct += (si.quantity / boxesPerCarton);
        } else if (si.unit === 'pack') {
          cartonsToDeduct += (si.quantity / (boxesPerCarton * packsPerBox));
        }
      });

      const newStock = Math.max(0, Math.round((p.stockCartons - cartonsToDeduct) * 100) / 100);
      return {
        ...p,
        stockCartons: newStock,
        isAvailable: newStock > 0,
      };
    });

    // Handle Ledger Account Update if Payment method is Ledger or Split
    if (paymentMethod === 'ledger' && selectedCustObj) {
      const updatedCustomers = posCustomers.map(c => {
        if (c.id === selectedCustObj.id) {
          return { ...c, balance: c.balance + posFinalTotal };
        }
        return c;
      });
      setPosCustomers(updatedCustomers);

      const newLedgerTx: PosLedgerTransaction = {
        id: `tx_${Date.now()}`,
        customerId: selectedCustObj.id,
        date: newReceipt.createdAt,
        amount: posFinalTotal,
        type: 'debit',
        description: `فروش نسیه کامل فاکتور ${receiptNum}`,
      };
      setLedgerTransactions(prev => [newLedgerTx, ...prev]);
    } else if (paymentMethod === 'split' && selectedCustObj && remainingToLedger > 0) {
      const updatedCustomers = posCustomers.map(c => {
        if (c.id === selectedCustObj.id) {
          return { ...c, balance: c.balance + remainingToLedger };
        }
        return c;
      });
      setPosCustomers(updatedCustomers);

      const newLedgerTx: PosLedgerTransaction = {
        id: `tx_${Date.now()}`,
        customerId: selectedCustObj.id,
        date: newReceipt.createdAt,
        amount: remainingToLedger,
        type: 'debit',
        description: `باقیمانده فاکتور ترکیبی ${receiptNum} (پرداخت شده: ${formatToman(validSplitPaid)})`,
      };
      setLedgerTransactions(prev => [newLedgerTx, ...prev]);
    }

    // Save stock movement logs
    const newLogs: StockAdjustmentLog[] = posCart.map(item => ({
      id: `log_${Date.now()}_${Math.random()}`,
      productId: item.product.id,
      productName: item.product.nameFa,
      type: 'sale_pos',
      deltaCartons: item.unit === 'carton' 
        ? -item.quantity 
        : item.unit === 'box' 
          ? -Math.round((item.quantity / (item.product.boxesPerCarton || 50)) * 100) / 100
          : -Math.round((item.quantity / ((item.product.boxesPerCarton || 50) * 10)) * 100) / 100,
      deltaBoxes: item.unit === 'box' ? -item.quantity : 0,
      finalStockCartons: updatedProducts.find(p => p.id === item.product.id)?.stockCartons || 0,
      date: newReceipt.createdAt,
      note: `فاکتور فروش حضوری ${receiptNum} (${paymentMethod === 'pos_terminal' ? 'کارتخوان' : paymentMethod === 'cash' ? 'نقدی' : paymentMethod === 'ledger' ? 'حساب دفتری' : 'ترکیبی'})`,
    }));

    const updatedReceipts = [newReceipt, ...receiptsList];
    const updatedLogs = [...newLogs, ...stockLogs];

    setReceiptsList(updatedReceipts);
    setStockLogs(updatedLogs);
    setProductsList(updatedProducts);

    try {
      localStorage.setItem('sovin_pos_receipts', JSON.stringify(updatedReceipts));
      localStorage.setItem('sovin_pos_stock_logs', JSON.stringify(updatedLogs));
    } catch {}

    if (onUpdateProductsStock) {
      onUpdateProductsStock(updatedProducts);
    }

    // Trigger SMS notification via Django API if customer phone is present
    if (newReceipt.customerPhone && newReceipt.customerPhone.trim() !== '' && newReceipt.customerPhone.trim() !== '-') {
      const isPartial = paymentMethod === 'ledger' || paymentMethod === 'split';
      const templateName = isPartial ? 'pos_partial_payment' : 'pos_receipt';
      const cleanPhone = newReceipt.customerPhone.trim();
      const clientName = newReceipt.customerName.replace(/ /g, '_');
      const finalAmountStr = `${newReceipt.finalTotal.toLocaleString()}_تومان`;
      
      // Fire and forget (or update state afterwards)
      djangoSendPatternSMS(
        cleanPhone,
        templateName,
        newReceipt.receiptNumber,
        clientName,
        finalAmountStr,
        crmConfig
      ).then(async (smsRes) => {
        if (smsRes.success) {
          // Softly refresh sms logs in state so it updates live
          try {
            const logs = await djangoFetchSmsLogs(crmConfig);
            setSmsLogs(logs);
          } catch {}
        }
      });
    }

    // Reset POS form & open print view
    setActiveReceiptToPrint(newReceipt);
    setPosCart([]);
    setPosDiscount(0);
    setSplitPaidAmount(0);
    setCustomerName('مشتری حضوری فروشگاه');
    setCustomerPhone('');
    setSelectedLedgerCustomerId('');
    setTerminalRef('');
    setOrderNotes('');
  };

  // Save new Customer Ledger
  const handleCreateNewCustomer = () => {
    if (!newCustName.trim()) return;
    const newCust: PosCustomer = {
      id: `cust_${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim() || '-',
      address: newCustAddress.trim() || undefined,
      city: newCustCity.trim() || 'تهران',
      notes: newCustNotes.trim() || undefined,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      balance: newCustInitialBalance || 0,
    };
    setPosCustomers(prev => [newCust, ...prev]);
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustCity('تهران');
    setNewCustNotes('');
    setNewCustInitialBalance(0);
  };

  // Open Edit Customer Modal
  const handleOpenEditCustomer = (cust: PosCustomer) => {
    setEditingCustomer(cust);
    setNewCustName(cust.name);
    setNewCustPhone(cust.phone === '-' ? '' : cust.phone);
    setNewCustAddress(cust.address || '');
    setNewCustCity(cust.city || 'تهران');
    setNewCustNotes(cust.notes || '');
    setNewCustInitialBalance(cust.balance);
    setShowNewCustomerModal(true);
  };

  // Save Edit Customer
  const handleSaveEditCustomer = () => {
    if (!editingCustomer || !newCustName.trim()) return;
    const updated = posCustomers.map(c => {
      if (c.id !== editingCustomer.id) return c;
      return {
        ...c,
        name: newCustName.trim(),
        phone: newCustPhone.trim() || '-',
        address: newCustAddress.trim() || undefined,
        city: newCustCity.trim() || undefined,
        notes: newCustNotes.trim() || undefined,
        balance: newCustInitialBalance,
      };
    });
    setPosCustomers(updated);
    setShowNewCustomerModal(false);
    setEditingCustomer(null);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustCity('تهران');
    setNewCustNotes('');
    setNewCustInitialBalance(0);
  };

  // Delete Customer
  const handleDeleteCustomer = (customerId: string) => {
    if (!window.confirm('آیا از حذف این مشتری و سوابق دفتری او مطمئن هستید؟')) return;
    setPosCustomers(prev => prev.filter(c => c.id !== customerId));
    setLedgerTransactions(prev => prev.filter(tx => tx.customerId !== customerId));
  };

  // Record payment for customer ledger
  const handleSaveCustomerPayment = () => {
    if (!selectedCustomerForPayment || paymentAmount <= 0) return;

    const delta = paymentType === 'credit' ? -paymentAmount : paymentAmount; // credit reduces debt
    const updatedCustomers = posCustomers.map(c => {
      if (c.id !== selectedCustomerForPayment.id) return c;
      return { ...c, balance: c.balance + delta };
    });

    const now = new Date();
    const newTx: PosLedgerTransaction = {
      id: `tx_${Date.now()}`,
      customerId: selectedCustomerForPayment.id,
      date: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      amount: paymentAmount,
      type: paymentType,
      description: paymentNote || (paymentType === 'credit' ? 'دریافت وجه / تسویه نسیه' : 'ثبت بدهکاری جدید'),
    };

    setPosCustomers(updatedCustomers);
    setLedgerTransactions(prev => [newTx, ...prev]);
    setSelectedCustomerForPayment(null);
    setPaymentAmount(0);
    setPaymentNote('');
  };

  // Handle Manual Stock Adjustment
  const handleSaveStockAdjustment = async () => {
    if (!selectedProductForAdjustment || adjustQuantityCartons <= 0) return;

    const boxesPerCarton = selectedProductForAdjustment.boxesPerCarton || 50;
    const packsPerBox = selectedProductForAdjustment.packsPerBox || 10;
    
    let deltaCartons = 0;
    if (adjustUnit === 'carton') {
      deltaCartons = adjustQuantityCartons;
    } else if (adjustUnit === 'box') {
      deltaCartons = adjustQuantityCartons / boxesPerCarton;
    } else {
      deltaCartons = adjustQuantityCartons / (boxesPerCarton * packsPerBox);
    }

    const finalDeltaCartons = adjustType === 'stock_in' ? deltaCartons : -deltaCartons;
    const newStock = Math.max(0, Math.round((selectedProductForAdjustment.stockCartons + finalDeltaCartons) * 1000) / 1000);

    try {
      // 1. Sync stock with database
      await api.products.updateStock(selectedProductForAdjustment.id, newStock);

      const updatedProducts = productsList.map(p => {
        if (p.id !== selectedProductForAdjustment.id) return p;
        return {
          ...p,
          stockCartons: newStock,
          isAvailable: newStock > 0,
        };
      });

      const now = new Date();
      const unitLabel = adjustUnit === 'carton' ? 'کارتن' : adjustUnit === 'box' ? 'باکس' : 'پاکت';
      const newLog: StockAdjustmentLog = {
        id: `adj_${Date.now()}`,
        productId: selectedProductForAdjustment.id,
        productName: selectedProductForAdjustment.nameFa,
        type: adjustType === 'stock_in' ? 'stock_in' : adjustType === 'damage' ? 'damage' : 'adjustment',
        deltaCartons: finalDeltaCartons,
        deltaBoxes: finalDeltaCartons * boxesPerCarton,
        finalStockCartons: newStock,
        date: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
        note: adjustNote || (adjustType === 'stock_in' ? `ورود بار جدید به انبار (${formatNumberFa(adjustQuantityCartons)} ${unitLabel})` : 'اصلاح انبارگردانی'),
      };

      const updatedLogs = [newLog, ...stockLogs];
      setStockLogs(updatedLogs);
      setProductsList(updatedProducts);

      try {
        localStorage.setItem('sovin_pos_stock_logs', JSON.stringify(updatedLogs));
        localStorage.setItem('wholesale_products', JSON.stringify(updatedProducts));
      } catch {}

      if (onUpdateProductsStock) {
        onUpdateProductsStock(updatedProducts);
      }

      setSuccessBanner(`موجودی کالا با موفقیت در دیتابیس بروزرسانی شد.`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err: any) {
      if (showToast) showToast('خطا در بروزرسانی موجودی در سرور');
      console.error('Stock adjust error:', err);
    }

    setSelectedProductForAdjustment(null);
    setAdjustNote('');
    setAdjustQuantityCartons(1);
    setAdjustUnit('carton');
  };

  // Quick adjustment (+ / -) by Carton, Box, or Pack in Inventory Table
  const handleQuickAdjustStock = async (product: CigaretteProduct, unit: 'carton' | 'box' | 'pack', delta: number) => {
    const boxesPerCarton = product.boxesPerCarton || 50;
    const packsPerBox = product.packsPerBox || 10;
    
    let deltaCartons = 0;
    if (unit === 'carton') {
      deltaCartons = delta;
    } else if (unit === 'box') {
      deltaCartons = delta / boxesPerCarton;
    } else {
      deltaCartons = delta / (boxesPerCarton * packsPerBox);
    }

    const newStock = Math.max(0, Math.round((product.stockCartons + deltaCartons) * 1000) / 1000);

    try {
      // Sync with DB
      await api.products.updateStock(product.id, newStock);

      const updatedProducts = productsList.map(p => {
        if (p.id !== product.id) return p;
        return {
          ...p,
          stockCartons: newStock,
          isAvailable: newStock > 0,
        };
      });

      const now = new Date();
      const unitLabel = unit === 'carton' ? 'کارتن' : unit === 'box' ? 'باکس' : 'پاکت';
      const newLog: StockAdjustmentLog = {
        id: `adj_${Date.now()}`,
        productId: product.id,
        productName: product.nameFa,
        type: delta > 0 ? 'stock_in' : 'adjustment',
        deltaCartons: deltaCartons,
        deltaBoxes: deltaCartons * boxesPerCarton,
        finalStockCartons: newStock,
        date: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
        note: `تغییر سریع موجودی صندوق: ${delta > 0 ? '+' : ''}${formatNumberFa(delta)} ${unitLabel}`,
      };

      const updatedLogs = [newLog, ...stockLogs];
      setStockLogs(updatedLogs);
      setProductsList(updatedProducts);

      try {
        localStorage.setItem('sovin_pos_stock_logs', JSON.stringify(updatedLogs));
        localStorage.setItem('wholesale_products', JSON.stringify(updatedProducts));
      } catch {}

      if (onUpdateProductsStock) {
        onUpdateProductsStock(updatedProducts);
      }
    } catch (err: any) {
      if (showToast) showToast('خطا در بروزرسانی موجودی در سرور');
    }
  };

  // Create New Product in Store Inventory
  const handleCreateNewProduct = async () => {
    if (!newProdNameFa.trim()) return;

    const isCoffeeOrDrink = newProdCategory === 'drinks_coffee';
    
    const newProduct: Partial<CigaretteProduct> = {
      nameFa: newProdNameFa.trim(),
      nameEn: newProdNameEn.trim() || newProdNameFa.trim(),
      brand: newProdBrand.trim() || 'دخانیات سرو',
      category: newProdCategory,
      origin: 'تولید/تأمین داخلی',
      tar: '۰',
      nicotine: '۰',
      cartonPrice: newProdCartonPrice,
      boxPrice: newProdBoxPrice,
      packPrice: newProdPackPrice,
      boxesPerCarton: isCoffeeOrDrink ? 1 : (newProdBoxesPerCarton || 10),
      packsPerBox: isCoffeeOrDrink ? 1 : (newProdPacksPerBox || 10),
      stockCartons: newProdInitialCartons || 0,
      moq: 1,
      image: newProdCategory === 'drinks_coffee' 
        ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=600&q=80',
      barcode: newProdBarcode.trim() || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      badge: 'جدید',
      priceTrend: 'stable',
      lastPriceUpdate: 'امروز',
      hologram: 'اورجینال',
      isAvailable: (newProdInitialCartons || 0) > 0,
      isPosOnly: newProdIsPosOnly,
      tierDiscounts: [],
      description: `کالای ${newProdNameFa} ثبت شده در سیستم انبار و صندوق.`
    };

    try {
      const created = await api.products.create(newProduct);
      const updatedProducts = [created, ...productsList];
      setProductsList(updatedProducts);

      try {
        localStorage.setItem('wholesale_products', JSON.stringify(updatedProducts));
      } catch {}

      if (onUpdateProductsStock) {
        onUpdateProductsStock(updatedProducts);
      }

      setShowAddProductModal(false);
      setNewProdNameFa('');
      setNewProdNameEn('');
      setNewProdBrand('');
      setNewProdBarcode('');
      setSuccessBanner(`محصول «${created.nameFa}» با موفقیت در دیتابیس انبار ثبت شد.`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err: any) {
      if (showToast) showToast('خطا در ثبت محصول در دیتابیس');
    }
  };

  // Filtered products for POS quick shelf
  const filteredPosProducts = useMemo(() => {
    return productsList.filter(p => {
      const matchSearch = 
        p.nameFa.toLowerCase().includes(posSearch.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(posSearch.toLowerCase()) ||
        p.barcode.includes(posSearch) ||
        p.brand.toLowerCase().includes(posSearch.toLowerCase());
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [productsList, posSearch, selectedCategory]);

  // Inventory Statistics
  const totalInventoryValue = useMemo(() => {
    return productsList.reduce((sum, p) => sum + (p.stockCartons * p.cartonPrice), 0);
  }, [productsList]);

  const totalCartonsInStock = useMemo(() => {
    return productsList.reduce((sum, p) => sum + p.stockCartons, 0);
  }, [productsList]);

  const totalBoxesInStock = useMemo(() => {
    return productsList.reduce((sum, p) => sum + (p.stockCartons * (p.boxesPerCarton || 50)), 0);
  }, [productsList]);

  const totalPacksInStock = useMemo(() => {
    return productsList.reduce((sum, p) => sum + (p.stockCartons * (p.boxesPerCarton || 50) * (p.packsPerBox || 10)), 0);
  }, [productsList]);

  const lowStockCount = useMemo(() => {
    return productsList.filter(p => p.stockCartons < 5).length;
  }, [productsList]);

  const todaySalesTotal = useMemo(() => {
    return receiptsList.reduce((sum, r) => sum + r.finalTotal, 0);
  }, [receiptsList]);

  // Date Helper Functions for Jalali & Gregorian parsing
  const toAsciiDigits = (str: string) => (str || '').replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728));

  const extractDateKey = (createdAt: string): string => {
    if (!createdAt) return 'نامشخص';
    const ascii = toAsciiDigits(createdAt);
    const match = ascii.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (match) {
      const y = match[1];
      const m = match[2].padStart(2, '0');
      const d = match[3].padStart(2, '0');
      return `${y}/${m}/${d}`;
    }
    return ascii.split(' ')[0] || createdAt;
  };

  const extractMonthKey = (createdAt: string): string => {
    const dKey = extractDateKey(createdAt);
    const parts = dKey.split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return dKey;
  };

  const getPersianMonthName = (monthKey: string): string => {
    const parts = monthKey.split('/');
    if (parts.length < 2) return monthKey;
    const m = parts[1];
    const months: Record<string, string> = {
      '01': 'فروردین', '02': 'اردیبهشت', '03': 'خرداد', '04': 'تیر',
      '05': 'مرداد', '06': 'شهریور', '07': 'مهر', '08': 'آبان',
      '09': 'آذر', '10': 'دی', '11': 'بهمن', '12': 'اسفند'
    };
    return `${months[m] || `ماه ${m}`} ${parts[0]}`;
  };

  // Filtered Receipts for Reports
  const filteredReceiptsForReports = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('fa-IR');
    const todayDateKey = extractDateKey(todayStr);

    return receiptsList.filter(r => {
      const dateKey = extractDateKey(r.createdAt);
      const monthKey = extractMonthKey(r.createdAt);

      let passDate = true;
      if (reportDateFilter === 'today') {
        passDate = dateKey === todayDateKey || r.createdAt.includes('1403/06/04');
      } else if (reportDateFilter === 'yesterday') {
        passDate = dateKey === '1403/06/03' || r.createdAt.includes('1403/06/03');
      } else if (reportDateFilter === '7days') {
        passDate = dateKey.startsWith('1403/06') || dateKey.startsWith('1403/05/28');
      } else if (reportDateFilter === 'this_month') {
        passDate = monthKey === '1403/06' || dateKey.startsWith('1403/06');
      } else if (reportDateFilter === 'last_month') {
        passDate = monthKey === '1403/05' || dateKey.startsWith('1403/05');
      } else if (reportDateFilter === 'custom' && customSearchDate.trim()) {
        const query = toAsciiDigits(customSearchDate.trim());
        passDate = toAsciiDigits(r.createdAt).includes(query);
      }

      let passSearch = true;
      if (reportSearchQuery.trim()) {
        const q = reportSearchQuery.trim().toLowerCase();
        const matchCustomer = r.customerName.toLowerCase().includes(q);
        const matchNum = r.receiptNumber.toLowerCase().includes(q);
        const matchItem = r.items.some(it => it.product.nameFa.toLowerCase().includes(q) || it.product.brand.toLowerCase().includes(q));
        const matchDate = r.createdAt.includes(q);
        passSearch = matchCustomer || matchNum || matchItem || matchDate;
      }

      return passDate && passSearch;
    });
  }, [receiptsList, reportDateFilter, customSearchDate, reportSearchQuery]);

  // Daily Sales Grouping (گروه‌بندی روزانه بر اساس تاریخ)
  const dailySalesGrouped = useMemo(() => {
    const map: Record<string, {
      date: string;
      receipts: PosReceiptInvoice[];
      totalSales: number;
      posSales: number;
      cashSales: number;
      ledgerSales: number;
      cartons: number;
      boxes: number;
      packs: number;
    }> = {};

    filteredReceiptsForReports.forEach(rcpt => {
      const dKey = extractDateKey(rcpt.createdAt);
      if (!map[dKey]) {
        map[dKey] = {
          date: dKey,
          receipts: [],
          totalSales: 0,
          posSales: 0,
          cashSales: 0,
          ledgerSales: 0,
          cartons: 0,
          boxes: 0,
          packs: 0,
        };
      }
      const dayObj = map[dKey];
      dayObj.receipts.push(rcpt);
      dayObj.totalSales += rcpt.finalTotal;
      if (rcpt.paymentMethod === 'pos_terminal') dayObj.posSales += rcpt.finalTotal;
      else if (rcpt.paymentMethod === 'cash') dayObj.cashSales += rcpt.finalTotal;
      else if (rcpt.paymentMethod === 'ledger') dayObj.ledgerSales += rcpt.finalTotal;
      else if (rcpt.paymentMethod === 'split') {
        const paidNow = rcpt.splitPaymentDetails?.paidNow || 0;
        const paidVia = rcpt.splitPaymentDetails?.paidVia || 'pos_terminal';
        const remaining = rcpt.splitPaymentDetails?.remainingToLedger || 0;
        if (paidVia === 'pos_terminal') dayObj.posSales += paidNow;
        else dayObj.cashSales += paidNow;
        dayObj.ledgerSales += remaining;
      }

      rcpt.items.forEach(it => {
        if (it.unit === 'carton') dayObj.cartons += it.quantity;
        else if (it.unit === 'box') dayObj.boxes += it.quantity;
        else if (it.unit === 'pack') dayObj.packs += it.quantity;
      });
    });

    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredReceiptsForReports]);

  // Monthly Sales Grouping (گروه‌بندی ماهانه بر اساس سال و ماه)
  const monthlySalesGrouped = useMemo(() => {
    const map: Record<string, {
      monthKey: string;
      monthName: string;
      receipts: PosReceiptInvoice[];
      activeDaysCount: number;
      totalSales: number;
      posSales: number;
      cashSales: number;
      ledgerSales: number;
      cartons: number;
      boxes: number;
      packs: number;
    }> = {};

    const daysPerMonthMap: Record<string, Set<string>> = {};

    filteredReceiptsForReports.forEach(rcpt => {
      const dKey = extractDateKey(rcpt.createdAt);
      const mKey = extractMonthKey(rcpt.createdAt);

      if (!daysPerMonthMap[mKey]) daysPerMonthMap[mKey] = new Set();
      daysPerMonthMap[mKey].add(dKey);

      if (!map[mKey]) {
        map[mKey] = {
          monthKey: mKey,
          monthName: getPersianMonthName(mKey),
          receipts: [],
          activeDaysCount: 0,
          totalSales: 0,
          posSales: 0,
          cashSales: 0,
          ledgerSales: 0,
          cartons: 0,
          boxes: 0,
          packs: 0,
        };
      }
      const monthObj = map[mKey];
      monthObj.receipts.push(rcpt);
      monthObj.totalSales += rcpt.finalTotal;
      if (rcpt.paymentMethod === 'pos_terminal') monthObj.posSales += rcpt.finalTotal;
      else if (rcpt.paymentMethod === 'cash') monthObj.cashSales += rcpt.finalTotal;
      else if (rcpt.paymentMethod === 'ledger') monthObj.ledgerSales += rcpt.finalTotal;
      else if (rcpt.paymentMethod === 'split') {
        const paidNow = rcpt.splitPaymentDetails?.paidNow || 0;
        const paidVia = rcpt.splitPaymentDetails?.paidVia || 'pos_terminal';
        const remaining = rcpt.splitPaymentDetails?.remainingToLedger || 0;
        if (paidVia === 'pos_terminal') monthObj.posSales += paidNow;
        else monthObj.cashSales += paidNow;
        monthObj.ledgerSales += remaining;
      }

      rcpt.items.forEach(it => {
        if (it.unit === 'carton') monthObj.cartons += it.quantity;
        else if (it.unit === 'box') monthObj.boxes += it.quantity;
        else if (it.unit === 'pack') monthObj.packs += it.quantity;
      });
    });

    Object.keys(map).forEach(mKey => {
      map[mKey].activeDaysCount = daysPerMonthMap[mKey]?.size || 1;
    });

    return Object.values(map).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [filteredReceiptsForReports]);

  // Products Sales Breakdown (تحلیل کالا به کالا)
  const productSalesGrouped = useMemo(() => {
    const map: Record<string, {
      productName: string;
      brand: string;
      category: string;
      cartons: number;
      boxes: number;
      packs: number;
      totalRevenue: number;
    }> = {};

    filteredReceiptsForReports.forEach(rcpt => {
      rcpt.items.forEach(it => {
        const pKey = it.product.id || it.product.nameFa;
        if (!map[pKey]) {
          map[pKey] = {
            productName: it.product.nameFa,
            brand: it.product.brand,
            category: it.product.category,
            cartons: 0,
            boxes: 0,
            packs: 0,
            totalRevenue: 0,
          };
        }
        const prodObj = map[pKey];
        if (it.unit === 'carton') prodObj.cartons += it.quantity;
        else if (it.unit === 'box') prodObj.boxes += it.quantity;
        else if (it.unit === 'pack') prodObj.packs += it.quantity;
        prodObj.totalRevenue += it.totalPrice;
      });
    });

    return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredReceiptsForReports]);

  const reportMetrics = useMemo(() => {
    let totalSales = 0;
    let posTerminalSales = 0;
    let cashSales = 0;
    let ledgerSales = 0;
    let cartonsSold = 0;
    let boxesSold = 0;
    let packsSold = 0;

    filteredReceiptsForReports.forEach(r => {
      totalSales += r.finalTotal;
      if (r.paymentMethod === 'pos_terminal') posTerminalSales += r.finalTotal;
      else if (r.paymentMethod === 'cash') cashSales += r.finalTotal;
      else if (r.paymentMethod === 'ledger') ledgerSales += r.finalTotal;
      else if (r.paymentMethod === 'split') {
        const paidNow = r.splitPaymentDetails?.paidNow || 0;
        const paidVia = r.splitPaymentDetails?.paidVia || 'pos_terminal';
        const remaining = r.splitPaymentDetails?.remainingToLedger || 0;
        if (paidVia === 'pos_terminal') posTerminalSales += paidNow;
        else cashSales += paidNow;
        ledgerSales += remaining;
      }

      r.items.forEach(it => {
        if (it.unit === 'carton') cartonsSold += it.quantity;
        else if (it.unit === 'box') boxesSold += it.quantity;
        else if (it.unit === 'pack') packsSold += it.quantity;
      });
    });

    return {
      totalSales,
      posTerminalSales,
      cashSales,
      ledgerSales,
      cartonsSold,
      boxesSold,
      packsSold,
      count: filteredReceiptsForReports.length,
    };
  }, [filteredReceiptsForReports]);

  // Thermal Receipt Printing & PDF Generation
  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadThermalPdf = async (rcpt?: PosReceiptInvoice | null) => {
    const target = rcpt || activeReceiptToPrint;
    if (!target) return;
    await generatePosThermalReceiptPdf(target);
  };

  // If Not Authenticated -> Show Executive Secure Login
  if (!isAuthenticated) {
    return (
      <PosLoginScreen
        loginPhone={loginPhone}
        loginPass={loginPass}
        isLoggingIn={isLoggingIn}
        loginError={loginError}
        sessionExpiredNotice={sessionExpiredNotice}
        onPhoneChange={setLoginPhone}
        onPassChange={setLoginPass}
        onSubmit={handleLogin}
        onReturnToStore={onReturnToStore}
      />
    );
  }

  // Authenticated Main POS View
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white print:hidden pb-16 md:pb-0" dir="rtl">
      <PosLogoutOverlay isLoggingOut={isLoggingOut} />

      <PosSessionExpiryAlert
        showExtendNotice={showExtendNotice}
        sessionRemainingSeconds={sessionRemainingSeconds}
        onExtendSession={handleExtendSession}
        onLogout={handleLogout}
      />
      
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-[100] w-full bg-white shadow-sm border-b border-slate-200 print:hidden">
        {/* Main Header Section */}
        <div className="bg-white/95 backdrop-blur-xl px-3 py-1.5 w-full transition-all duration-300 isolate">
        <div className="max-w-[1750px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-2">
          
          {/* Quick Tools & Actions (Moved to Visual Left Side) */}
          <div className="flex items-center justify-start gap-2 relative shrink-0 order-last xl:order-last w-full xl:w-auto overflow-visible py-1">
            
            {/* Message Icon - Restored per user request (تنها در حالت فول‌سوئیت که وب‌سایت آنلاین دارد نمایش داده می‌شود) */}
            {!isPosOnlyMode() && hasStaffPerm('manage_warehouse_messages') && (
              <button
                type="button"
                onClick={() => { setActiveSubTab('warehouse_messages'); }}
                className="relative p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl border border-slate-200 transition-all active:scale-95 cursor-pointer"
                title="صندوق پیام‌های تماس سایت"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-white"></span>
                )}
              </button>
            )}

            {/* Tools & Settings Dropdown */}
            <div className="relative z-50" ref={toolsRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowToolsDropdown(prev => !prev);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all active:scale-95 shrink-0 cursor-pointer"
                title="ابزارها و تنظیمات صندوق"
              >
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>ابزارها</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showToolsDropdown && (
                <div 
                  className="absolute left-0 right-0 sm:right-auto sm:left-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-md mx-auto sm:mx-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 z-[1000] space-y-1 animate-in fade-in zoom-in-95 duration-150 text-right max-h-[75vh] overflow-y-auto font-['Samim','Vazirmatn',sans-serif]"
                  dir="rtl"
                >
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                      <Settings className="w-4 h-4 text-indigo-600" />
                      <span>ابزارها و تنظیمات صندوق</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowToolsDropdown(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setShowSessionSecurityModal(true); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>امنیت و زمان توکن صندوق</span>
                    </div>
                    <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                      {formatRemainingTime(sessionRemainingSeconds)}
                    </span>
                  </button>

                  <div className="my-1 border-t border-slate-100"></div>

                  {currentStaff.role === 'super_admin' && (
                    <button
                      type="button"
                      onClick={() => { setShowBackendModal(true); setShowToolsDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50/70 hover:bg-blue-100/90 rounded-xl transition-colors text-right cursor-pointer"
                    >
                      <Server className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>اتصال API و وب‌سرویس جنگو</span>
                    </button>
                  )}
                  
                  {(currentStaff.role === 'super_admin' || hasStaffPerm('view_reports')) && (
                    <button
                      type="button"
                      onClick={() => { setShowCurrencyRateModal(true); setShowToolsDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-right cursor-pointer"
                    >
                      <Coins className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>تنظیم نرخ ارز (دلار/یورو)</span>
                    </button>
                  )}

                  {hasStaffPerm('customer_app_connect') && (
                    <button
                      type="button"
                      onClick={() => { setShowCustomerAppModal(true); setShowToolsDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-right cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>اتصال اپلیکیشن مشتریان</span>
                    </button>
                  )}

                  {/* Quick PWA Install Option in Tools */}
                  <button
                    type="button"
                    onClick={() => { setShowPwaInstallGuideModal(true); setShowToolsDropdown(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 rounded-xl transition-colors text-right cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>راهنمای نصب اپلیکیشن صندوق (PWA)</span>
                    </div>
                    <span className="text-[9px] bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded-md font-black shrink-0">نصب</span>
                  </button>

                  {!isPosOnlyMode() && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setActiveSubTab('blog'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors text-right cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>مدیریت مقالات و وبلاگ</span>
                        </div>
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md font-bold shrink-0">جنگو</span>
                      </button>

                      {(currentStaff.role === 'super_admin' || hasStaffPerm('manage_site_settings') || hasStaffPerm('manage_sliders') || hasStaffPerm('manage_footer_settings')) && (
                        <button
                          type="button"
                          onClick={() => { setActiveSubTab('site_settings'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 rounded-xl transition-colors text-right cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>تنظیمات سایت (بنر و اسلایدر)</span>
                          </div>
                          <span className="text-[9px] bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded-md font-black shrink-0">تب‌بندی</span>
                        </button>
                      )}
                    </>
                  )}

                  <div className="my-1 border-t border-slate-100"></div>

                  {hasStaffPerm('manage_staff') && (
                    <button
                      type="button"
                      onClick={() => { setActiveSubTab('staff_management'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors text-right cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>افزودن پرسنل جدید (صفحه مجزا)</span>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold shrink-0">جدید</span>
                    </button>
                  )}

                  {hasStaffPerm('manage_tickets') && (
                    <button
                      type="button"
                      onClick={() => { setActiveSubTab('tickets'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-right cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>پشتیبانی تیکت‌ها</span>
                      </div>
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold shrink-0">جنگو</span>
                    </button>
                  )}

                  {hasStaffPerm('send_sms') && (
                    <button
                      type="button"
                      onClick={() => { setActiveSubTab('sms_management'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-right cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>سامانه پیامکی کاوه‌نگار</span>
                      </div>
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold shrink-0">جنگو</span>
                    </button>
                  )}

                  {hasStaffPerm('manage_notifications') && (
                    <button
                      type="button"
                      onClick={() => { setActiveSubTab('notifications'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-right cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>اعلانات و نوتیفیکیشن‌ها</span>
                      </div>
                      <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-bold shrink-0">جنگو</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Live Token Expiration Security Badge */}
            <button
              onClick={() => setShowSessionSecurityModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 whitespace-nowrap shadow-2xs ${
                sessionRemainingSeconds <= 60
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-700 animate-pulse'
                  : sessionRemainingSeconds <= 300
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-700'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
              }`}
              title="زمان باقی‌مانده از اعتبار توکن امنیتی صندوق (کلیک برای مشاهده وضعیت امنیت، تمدید یا تنظیم خروج خودکار)"
            >
              <Clock className={`w-3.5 h-3.5 shrink-0 ${
                sessionRemainingSeconds <= 60 ? 'text-rose-600' : sessionRemainingSeconds <= 300 ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <span className="hidden xl:inline text-[11px] text-slate-500 font-normal">اعتبار توکن:</span>
              <span className="font-mono font-black text-xs dir-ltr">{formatRemainingTime(sessionRemainingSeconds)}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'صدا فعال است' : 'صدا قطع است'}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-200 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* PWA Install Button */}
            <button
              onClick={() => setShowPwaInstallGuideModal(true)}
              title="نصب صندوق به صورت اپلیکیشن (PWA)"
              className="xl:hidden flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 text-xs font-bold rounded-xl border border-indigo-200 transition-colors whitespace-nowrap active:scale-95 shadow-2xs animate-pulse"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>نصب اپلیکیشن</span>
            </button>

            {/* Catalog Button (تنها زمانی که سامانه در حالت فول‌سوئیت است نمایش داده می‌شود) */}
            {!isPosOnlyMode() && (
              <button
                onClick={onReturnToStore}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>کاتالوگ</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="خروج از پنل حسابداری"
              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>


          </div>
          
          {/* Logo & Staff Info */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between w-full xl:w-auto shrink-0 gap-1.5 xl:gap-4 order-first xl:order-first">
            
            {/* Logo/Name/MobileMenu */}
            <div className="flex items-center justify-between w-full xl:w-auto gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Mobile Menu Toggle Button (Hidden because of Bottom Navigation bar) */}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="hidden p-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all items-center gap-1.5 shrink-0"
                  title="باز و بستن منوی اصلی"
                >
                  {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  <span className="text-[11px] font-bold pl-0.5">منو</span>
                </button>

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
                  <Barcode className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h1 className="text-xs sm:text-base font-black text-slate-900 tracking-tight whitespace-nowrap">
                      <span className="sm:hidden">سامانه هوشمند سرو</span>
                      <span className="hidden sm:inline">سامانه هوشمند دخانیات سرو (POS)</span>
                    </h1>
                    <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                      آنلاین
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Sound Action */}
              <div className="flex items-center gap-2 md:hidden">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 active:scale-95 transition-all"
                  title="تنظیمات صدا"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Staff Info & Online Cashiers Badge */}
            <div className="flex flex-wrap items-center justify-between w-full xl:w-auto gap-x-3 gap-y-1 bg-slate-50 xl:bg-transparent p-2 xl:p-0 rounded-xl border border-slate-100 xl:border-0 mt-1 xl:mt-0">
              <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium whitespace-nowrap">
                کاربر: <strong className="text-indigo-600 font-bold">{currentStaff.fullName}</strong> <span className="text-slate-400">({currentStaff.roleTitleFa})</span>
              </p>
              <button
                onClick={() => setShowOnlineStaffModal(true)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all shadow-2xs active:scale-95 whitespace-nowrap"
                title="مشاهده صندوق‌دارهای آنلاین و پرسنل فعال همزمان"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Users className="w-3 h-3 text-emerald-600" />
                <span>صندوق‌دارهای آنلاین:</span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md">
                  {onlineSessions.length} نفر
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className={`${isMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row items-stretch lg:items-center lg:justify-start gap-1.5 bg-slate-50 lg:bg-white p-2 lg:p-2 border-t border-slate-200 w-full overflow-x-auto min-w-0 no-scrollbar`}>
        <div className="max-w-[1750px] mx-auto flex flex-col lg:flex-row items-stretch lg:items-center gap-1.5 w-full lg:w-max lg:min-w-max">
            {hasStaffPerm('manage_pos') && (
              <button
                onClick={() => { setActiveSubTab('pos'); setIsMenuOpen(false); }}
                className={`flex items-center justify-between md:justify-start gap-2 px-3.5 py-2 md:py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                  activeSubTab === 'pos'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">صندوق و بارکدخوان</span>
                </div>
                {posCart.length > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-mono shrink-0">
                    {posCart.length}
                  </span>
                )}
              </button>
            )}

            {/* Online Orders Management Tab */}
            <button
              onClick={() => { setActiveSubTab('online_orders'); setIsMenuOpen(false); }}
              className={`flex items-center justify-between md:justify-start gap-2 px-3.5 py-2 md:py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                activeSubTab === 'online_orders'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <ClipboardList className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">سفارشات آنلاین مشتریان</span>
              </div>
              {pendingOnlineOrdersCount > 0 && (
                <span className="min-w-[20px] h-5 px-1 bg-amber-500 text-slate-950 text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse shrink-0">
                  {pendingOnlineOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setProductManagementInitialTab('list');
                setProductManagementInitialBarcode('');
                setProductManagementSelectedProduct(null);
                setActiveSubTab('product-manage');
                setIsMenuOpen(false);
              }}
              className={`flex items-center justify-between md:justify-start gap-1.5 px-3.5 py-2 md:py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                activeSubTab === 'product-manage'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <Package className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">مدیریت محصولات</span>
              </div>
            </button>

            {hasStaffPerm('manage_ledger') && (
              <button
                onClick={() => { setActiveSubTab('user_management'); setIsMenuOpen(false); }}
                className={`flex items-center justify-between md:justify-start gap-2 px-3.5 py-2 md:py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                  activeSubTab === 'user_management'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">مدیریت کاربران</span>
                </div>
              </button>
            )}

            {hasStaffPerm('manage_inventory') && (
              <button
                onClick={() => { setActiveSubTab('inventory'); setIsMenuOpen(false); }}
                className={`flex items-center justify-between md:justify-start gap-1.5 px-3.5 py-2 md:py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                  activeSubTab === 'inventory'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <Package className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">موجودی انبار و کاردکس</span>
                </div>
                {lowStockCount > 0 && (
                  <span className="w-5 h-5 bg-amber-500 text-slate-950 text-[10px] rounded-full flex items-center justify-center font-bold shrink-0">
                    {lowStockCount}
                  </span>
                )}
              </button>
            )}

            {hasStaffPerm('manage_ledger') && (
              <button
                onClick={() => { setActiveSubTab('customers'); setIsMenuOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 md:py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                  activeSubTab === 'customers'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">حساب‌های دفتری (نسیه)</span>
              </button>
            )}

            {hasStaffPerm('view_reports') && (
              <button
                onClick={() => { setActiveSubTab('reports'); setIsMenuOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 md:py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                  activeSubTab === 'reports'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <PieChart className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">گزارشات فروش روزانه</span>
              </button>
            )}

            {(hasStaffPerm('monthly_comparison') || hasStaffPerm('view_reports')) && (
              <button
                onClick={() => { setActiveSubTab('monthly_compare'); setIsMenuOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 md:py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                  activeSubTab === 'monthly_compare'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">تحلیل مقایسه‌ای ماه‌ها</span>
              </button>
            )}

            {(hasStaffPerm('manage_ledger') || hasStaffPerm('view_reports')) && (
              <button
                onClick={() => { setActiveSubTab('ledger'); setIsMenuOpen(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 md:py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                  activeSubTab === 'ledger'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Receipt className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">دفتر فاکتورها</span>
              </button>
            )}

            {/* Mobile-Only Actions Row inside Menu Drawer */}
            <div className="md:hidden flex flex-col gap-2 pt-2 border-t border-slate-200/80 mt-1">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-xl text-xs border border-slate-200">
                <button
                  onClick={() => { setShowSessionSecurityModal(true); setIsMenuOpen(false); }}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 font-bold"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>اعتبار توکن صندوق:</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-indigo-700 dir-ltr">{formatRemainingTime(sessionRemainingSeconds)}</span>
                  <button
                    onClick={() => {
                      extendPosSession(30);
                      setSessionRemainingSeconds(getRemainingSessionSeconds());
                      setSuccessBanner('نشست صندوق ۳۰ دقیقه تمدید شد.');
                      setTimeout(() => setSuccessBanner(null), 3000);
                    }}
                    className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-200 active:scale-95"
                  >
                    تمدید
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={onReturnToStore}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-200 text-slate-800 text-xs font-bold rounded-xl active:scale-95 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>بازگشت به کاتالوگ</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-xl active:scale-95 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
            {successBanner && (
              <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs font-black shadow-md flex items-center justify-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successBanner}</span>
              </div>
            )}
          </div>

      {/* Main Content Area */}
      <main className="flex-1 print:hidden w-full mx-auto p-3 sm:p-5 lg:p-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: POS & Barcode Scanner */}
          {activeSubTab === 'pos' && (
            <motion.div 
              key="pos-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Mobile/Tablet Segmented Switcher for POS */}
              <div className="lg:hidden flex items-center bg-slate-200/90 p-1 rounded-2xl border border-slate-300/80 shadow-xs">
                <button
                  type="button"
                  onClick={() => setPosMobileView('shelf')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    posMobileView === 'shelf'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>قفسه کالا و بارکدخوان</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPosMobileView('cart')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 relative ${
                    posMobileView === 'cart'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>فاکتور جاری و پرداخت</span>
                  {posCart.length > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shadow-xs">
                      {posCart.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left/Middle: Barcode Scanner & Quick Shelf (7 Cols) */}
                <div className={`${posMobileView === 'cart' ? 'hidden' : 'block'} lg:block lg:col-span-7 space-y-4`}>
                  
                  {/* Barcode Fast Input Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h2 className="text-xs sm:text-sm font-black text-slate-900">
                          اسکن بارکد / جستجوی کالا
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProductManagementInitialTab('editor');
                            setProductManagementInitialBarcode('');
                            setProductManagementSelectedProduct(null);
                            setActiveSubTab('product-manage');
                          }}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+ تعریف محصول جدید</span>
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                          اسکنر خودکار فعال
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleBarcodeSubmit} className="relative flex items-center">
                      <Barcode className="w-5 h-5 sm:w-6 sm:h-6 absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                      <input
                        ref={barcodeInputRef}
                        type="text"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        placeholder="بارکد یا نام کالا را اسکن یا تایپ کنید..."
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pr-11 sm:pr-14 pl-24 sm:pl-28 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                      />
                      <button
                        type="submit"
                        className="absolute left-2 top-1/2 -translate-y-1/2 px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-sm transition-all"
                      >
                        ثبت ↵
                      </button>
                    </form>
                  </div>

                  {/* Quick Shelf Catalog Filter */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={posSearch}
                          onChange={(e) => setPosSearch(e.target.value)}
                          placeholder="جستجوی سریع در شلف..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none font-medium"
                        />
                      </div>

                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="all">همه دسته‌ها</option>
                        <option value="cigarettes">سیگارهای اورجینال</option>
                        <option value="iqos_devices">دستگاه‌های ایکاس</option>
                        <option value="iqos_heets">استیک‌های تیریا</option>
                        <option value="pods_vapes">پاد و سالت</option>
                        <option value="tobacco">توتون و سیگار برگ</option>
                        <option value="accessories">اکسسوری و فندک</option>
                      </select>
                    </div>

                    {/* Products Grid for Fast Touch/Click adding */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 max-h-[520px] overflow-y-auto pr-1">
                      {filteredPosProducts.map((prod) => {
                        const stockInfo = getProductStockInfo(prod);
                        return (
                          <div
                            key={prod.id}
                            onClick={() => handleAddProductToPos(prod, prod.isBoxOnly ? 'box' : 'box')}
                            className={`bg-slate-50 hover:bg-blue-50/40 border border-slate-200 hover:border-indigo-400 rounded-2xl p-2.5 sm:p-3 cursor-pointer transition-all duration-150 flex flex-col justify-between group active:scale-98 ${
                              !stockInfo.isAvailable ? 'opacity-50 grayscale' : ''
                            }`}
                          >
                            <div>
                              <div className="w-full h-20 sm:h-24 rounded-xl overflow-hidden bg-white mb-2 border border-slate-200">
                                <img
                                  src={prod.image}
                                  alt={prod.nameFa}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                                {prod.nameFa}
                              </h4>
                              <div className="text-[9px] sm:text-[10px] text-slate-500 mt-1 font-mono">
                                {stockInfo.isAvailable ? (
                                  <span className="text-indigo-600 font-bold">{stockInfo.textSummary}</span>
                                ) : (
                                  <span className="text-rose-600 font-bold">ناموجود</span>
                                )}
                              </div>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-200 flex flex-col gap-1">
                              {prod.category === 'drinks_coffee' ? (
                                <div className="flex items-center justify-between py-0.5">
                                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold">قیمت تکی:</span>
                                  <span className="text-[11px] sm:text-xs font-black text-indigo-700 font-mono">
                                    {formatToman(prod.packPrice || prod.boxPrice)}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold">کارتن:</span>
                                    <span className="text-[11px] sm:text-xs font-black text-indigo-700 font-mono">
                                      {formatToman(prod.cartonPrice)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold">باکس:</span>
                                    <span className="text-[11px] sm:text-xs font-black text-emerald-600 font-mono">
                                      {formatToman(prod.boxPrice)}
                                    </span>
                                  </div>
                                </>
                              )}
                              <div className="mt-1 flex items-center justify-between gap-1.5">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProductForInsights(prod);
                                    setShowInsightsModal(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200"
                                  title="تحلیل فروش"
                                >
                                  <BarChart3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  type="button"
                                  className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-1 text-[10px] font-bold"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{prod.category === 'drinks_coffee' ? 'افزودن تکی' : 'افزودن'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Floating Bottom Bar on Mobile/Tablet when in Shelf view and cart has items */}
                  {posCart.length > 0 && posMobileView === 'shelf' && (
                    <div className="lg:hidden sticky bottom-4 z-40 bg-slate-900/95 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-md">
                          {posCart.length}
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">مبلغ کل فاکتور:</span>
                          <span className="text-xs sm:text-sm font-black font-mono text-emerald-400">
                            {formatToman(posFinalTotal)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPosMobileView('cart')}
                        className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <span>تکمیل و تسویه فاکتور</span>
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  )}

                </div>

                {/* Right: Active POS Register & Checkout (5 Cols) */}
                <div className={`${posMobileView === 'shelf' ? 'hidden' : 'block'} lg:block lg:col-span-5 space-y-4`}>
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col justify-between min-h-[600px] sm:min-h-[640px]">
                    
                    {/* Header of Active Bill */}
                    <div>
                      {/* Mobile back to shelf link */}
                      <div className="lg:hidden flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                        <button
                          type="button"
                          onClick={() => setPosMobileView('shelf')}
                          className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline p-1"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>بازگشت به قفسه و افزودن کالای بیشتر</span>
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">
                          {posCart.length} ردیف کالا
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">فاکتور جاری صندوق فروش</h3>
                        </div>
                        {posCart.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setPosCart([])}
                            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold active:scale-95 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>پاک کردن</span>
                          </button>
                        )}
                      </div>

                      {/* Customer Selection / Ledger Customer Bar */}
                      <div className="mb-3 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>انتخاب خریدار / حساب دفتری:</span>
                          <button 
                            type="button"
                            onClick={() => setActiveSubTab('customers')} 
                            className="text-indigo-600 hover:underline text-[11px] font-bold"
                          >
                            + مدیریت حساب‌ها
                          </button>
                        </div>

                        <select
                          value={selectedLedgerCustomerId}
                          onChange={(e) => {
                            setSelectedLedgerCustomerId(e.target.value);
                            const found = posCustomers.find(c => c.id === e.target.value);
                            if (found) {
                              setCustomerName(found.name);
                              setCustomerPhone(found.phone);
                            } else {
                              setCustomerName('مشتری حضوری فروشگاه');
                              setCustomerPhone('');
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">-- مشتری حضوری عمومی (نقدی) --</option>
                          {posCustomers.map(cust => (
                            <option key={cust.id} value={cust.id}>
                              {cust.name} ({cust.balance > 0 ? `بدهکار: ${formatToman(cust.balance)}` : cust.balance < 0 ? `بستانکار: ${formatToman(Math.abs(cust.balance))}` : 'تسویه'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Scanned Items List */}
                      <div className="space-y-2 max-h-[260px] sm:max-h-[280px] overflow-y-auto pr-1">
                        {posCart.length === 0 ? (
                          <div className="py-10 sm:py-12 text-center text-slate-400">
                            <Barcode className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30 animate-pulse text-indigo-500" />
                            <p className="text-xs font-bold text-slate-600">سبد خرید صندوق خالی است</p>
                            <p className="text-[11px] mt-1 text-slate-400">بارکد کالا را اسکن کرده یا از قفسه انتخاب نمایید</p>
                            <button
                              type="button"
                              onClick={() => setPosMobileView('shelf')}
                              className="mt-3 lg:hidden px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-200"
                            >
                              بازگشت به قفسه کالاها
                            </button>
                          </div>
                        ) : (
                          posCart.map((item, idx) => (
                            <div
                              key={`${item.product.id}_${item.unit}_${idx}`}
                              className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.nameFa}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                                  />
                                  <div>
                                    <h5 className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">
                                      {item.product.nameFa}
                                    </h5>
                                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
                                      نرخ: {formatToman(item.unitPrice)}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemovePosItem(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 active:scale-90"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                                {/* Unit Selector / Badge */}
                                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                                  {item.product.category === 'drinks_coffee' ? (
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold">
                                      عدد (تکی)
                                    </span>
                                  ) : (
                                    <>
                                      {!item.product.isBoxOnly && (
                                        <button
                                          type="button"
                                          onClick={() => handleChangePosUnit(idx, 'carton')}
                                          className={`px-2 py-1 rounded transition-colors ${item.unit === 'carton' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                          کارتن
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleChangePosUnit(idx, 'box')}
                                        className={`px-2 py-1 rounded transition-colors ${item.unit === 'box' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                      >
                                        باکس
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleChangePosUnit(idx, 'pack')}
                                        className={`px-2 py-1 rounded transition-colors ${item.unit === 'pack' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                      >
                                        پاکت
                                      </button>
                                    </>
                                  )}
                                </div>

                                {/* Quantity Stepper & Subtotal */}
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePosQty(idx, 1)}
                                      className="w-5 h-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center justify-center font-bold active:scale-90"
                                    >
                                      +
                                    </button>
                                    <span className="text-xs font-mono font-bold text-slate-900 min-w-[20px] text-center">
                                      {formatNumberFa(item.quantity)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePosQty(idx, -1)}
                                      className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded flex items-center justify-center font-bold active:scale-90"
                                    >
                                      -
                                    </button>
                                  </div>

                                  <span className="text-[11px] sm:text-xs font-black text-emerald-600 font-mono whitespace-nowrap">
                                    {formatToman(item.totalPrice)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Checkout & Payment Options */}
                    <div className="pt-3 sm:pt-4 border-t border-slate-200 space-y-3">
                      
                      {/* Payment Method Tabs */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1.5">روش پرداخت و تسویه:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('pos_terminal')}
                            className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                              paymentMethod === 'pos_terminal'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>کارتخوان</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                              paymentMethod === 'cash'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Banknote className="w-4 h-4" />
                            <span>نقدی</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('ledger')}
                            className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                              paymentMethod === 'ledger'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            <span>نسیه دفتری</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod('split');
                              if (splitPaidAmount === 0 && posFinalTotal > 0) {
                                setSplitPaidAmount(Math.floor(posFinalTotal / 2));
                              }
                            }}
                            className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                              paymentMethod === 'split'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Split className="w-4 h-4" />
                            <span>ترکیبی (نقد+نسیه)</span>
                          </button>

                           {currencyRates.map((r) => (
                             <button
                               key={r.code}
                               type="button"
                               onClick={() => {
                                 const latest = currencyRates.find(c => c.code === r.code) || r;
                                 setPaymentMethod("foreign");
                                 setForeignCurrencyDetails({ currency: latest.code, rate: latest.rate_in_toman || latest.rate });
                                 setForeignExchangeRate(latest.rate_in_toman || latest.rate);
                               }}
                               className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border-2 transition-all ${
                                 paymentMethod === "foreign" && foreignCurrencyDetails?.currency === r.code
                                   ? "bg-blue-600 text-white border-blue-800 ring-2 ring-blue-300 shadow-md"
                                   : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                               }`}
                             >
                               <Coins className="w-4 h-4" />
                               <span>{r.code}</span>
                             </button>
                           ))}
                        </div>
                      </div>

                      {(paymentMethod === 'foreign') && (
                        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-2.5 sm:p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-900 flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-blue-600" />
                              ارز دریافتی ({foreignCurrencyDetails?.currency}):
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={foreignCurrencyAmount || ''}
                                onChange={(e) => setForeignCurrencyAmount(Math.max(0, Number(e.target.value) || 0))}
                                placeholder="100"
                                className="w-20 sm:w-24 bg-white border border-blue-300 rounded-lg px-2 py-1 text-left font-mono font-bold text-xs text-blue-950 focus:outline-none"
                              />
                              <span className="text-[10px] text-blue-800">{foreignCurrencyDetails?.currency}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-blue-800">نرخ روز تبدیل (تومان):</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={foreignExchangeRate ? Number(foreignExchangeRate).toLocaleString('fa-IR') : '۰'}
                                readOnly
                                className="w-24 sm:w-28 bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-left font-mono font-bold text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                              />
                              <span className="text-[10px] text-blue-800">تومان</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-blue-200 flex items-center justify-between font-bold">
                            <span className="text-blue-900">معادل محاسبه شده:</span>
                            <span className="font-mono text-emerald-700 text-xs sm:text-sm font-black">
                              {formatToman(foreignCurrencyAmount * foreignExchangeRate)}
                            </span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'split' && (
                        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-2.5 sm:p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900 flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-amber-600" />
                              پرداخت نقدی / پوز:
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={splitPaidAmount || ''}
                                onChange={(e) => setSplitPaidAmount(Math.max(0, Number(e.target.value) || 0))}
                                placeholder="۰"
                                className="w-24 sm:w-28 bg-white border border-amber-300 rounded-lg px-2 py-1 text-left font-mono font-bold text-xs text-amber-950 focus:outline-none"
                              />
                              <span className="text-[10px] text-amber-800">تومان</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-amber-800">روش پرداخت نقدی:</span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name="splitVia"
                                  checked={splitPaidVia === 'pos_terminal'}
                                  onChange={() => setSplitPaidVia('pos_terminal')}
                                  className="text-amber-600"
                                />
                                <span className="font-bold">کارتخوان</span>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name="splitVia"
                                  checked={splitPaidVia === 'cash'}
                                  onChange={() => setSplitPaidVia('cash')}
                                  className="text-amber-600"
                                />
                                <span className="font-bold">نقد</span>
                              </label>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-200 flex items-center justify-between font-bold">
                            <span className="text-amber-900">مانده در دفتر نسیه:</span>
                            <span className="font-mono text-rose-600 text-xs sm:text-sm font-black">
                              {formatToman(Math.max(0, posFinalTotal - splitPaidAmount))}
                            </span>
                          </div>
                        </div>
                      )}

                      {(paymentMethod === 'pos_terminal' || (paymentMethod === 'split' && splitPaidVia === 'pos_terminal')) && (
                        <div>
                          <input
                            type="text"
                            value={terminalRef}
                            onChange={(e) => setTerminalRef(e.target.value)}
                            placeholder="شماره پیگیری کارتخوان (اختیاری)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      )}

                      {/* Financial Totals */}
                      <div className="bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>جمع ناخالص:</span>
                          <span className="font-mono">{formatToman(posSubtotal)}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600">
                          <span>تخفیف دستی:</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={posDiscount || ''}
                              onChange={(e) => setPosDiscount(Number(e.target.value) || 0)}
                              placeholder="۰"
                              className="w-20 sm:w-24 bg-white border border-slate-200 rounded px-2 py-0.5 text-left font-mono text-xs text-emerald-600 focus:outline-none"
                            />
                            <span className="text-[10px]">تومان</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs sm:text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                          <span>مبلغ قابل پرداخت:</span>
                          <span className="text-sm sm:text-base font-mono text-emerald-600">{formatToman(posFinalTotal)}</span>
                        </div>
                      </div>

                      {/* Submit Sale Action Button */}
                      <button
                        type="button"
                        onClick={handleFinalizePosSale}
                        disabled={posCart.length === 0}
                        className="w-full py-3.5 sm:py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/20 transition-all active:scale-98 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>ثبت نهایی فاکتور و کسر از انبار</span>
                      </button>

                    </div>

                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: Warehouse Inventory & Stock Controls */}
          {activeSubTab === 'inventory' && (
            <PosInventoryView
              productsList={productsList}
              totalInventoryValue={totalInventoryValue}
              totalCartonsInStock={totalCartonsInStock}
              totalBoxesInStock={totalBoxesInStock}
              totalPacksInStock={totalPacksInStock}
              lowStockCount={lowStockCount}
              stockLogs={stockLogs}
              onQuickAdjustStock={(prod, unit, delta) => handleQuickAdjustStock(prod, unit, delta)}
              onOpenProductEditor={(prod) => {
                setProductManagementSelectedProduct(prod || null);
                setProductManagementInitialBarcode(prod ? prod.barcode || '' : '');
                setProductManagementInitialTab('editor');
                setActiveSubTab('product-manage');
              }}
            />
          )}

          {/* TAB 3: Ledger Accounts & Credit Customers */}
          {activeSubTab === 'customers' && (
            <PosCustomerLedgerView
              posCustomers={posCustomers}
              ledgerTransactions={ledgerTransactions}
              customerSearchQuery={customerSearchQuery}
              setCustomerSearchQuery={setCustomerSearchQuery}
              customerStatusFilter={customerStatusFilter}
              setCustomerStatusFilter={setCustomerStatusFilter}
              onOpenNewCustomerModal={() => {
                setEditingCustomer(null);
                setNewCustName('');
                setNewCustPhone('');
                setNewCustAddress('');
                setNewCustCity('تهران');
                setNewCustNotes('');
                setNewCustInitialBalance(0);
                setShowNewCustomerModal(true);
              }}
              onOpenEditCustomer={(cust) => handleOpenEditCustomer(cust)}
              onDeleteCustomer={(id) => handleDeleteCustomer(id)}
              onOpenCustomerHistory={(cust) => setCustomerHistoryModalCust(cust)}
              onOpenPaymentModal={(cust) => {
                setSelectedCustomerForPayment(cust);
                setPaymentAmount(Math.abs(cust.balance));
                setPaymentType(cust.balance >= 0 ? 'credit' : 'debit');
              }}
            />
          )}

          {/* TAB 4: Daily & Monthly Sales Reports */}
          {activeSubTab === 'reports' && (
            <PosReportsView
              receiptsList={receiptsList}
              reportDateFilter={reportDateFilter}
              setReportDateFilter={setReportDateFilter}
              customSearchDate={customSearchDate}
              setCustomSearchDate={setCustomSearchDate}
              reportSearchQuery={reportSearchQuery}
              setReportSearchQuery={setReportSearchQuery}
              filteredReceiptsForReports={filteredReceiptsForReports}
              reportMetrics={reportMetrics}
              reportSubTab={reportSubTab}
              setReportSubTab={setReportSubTab}
              dailySalesGrouped={dailySalesGrouped}
              monthlySalesGrouped={monthlySalesGrouped}
              productSalesGrouped={productSalesGrouped}
              onOpenDailyDetail={(date) => setSelectedDateForDetailModal(date)}
              onOpenMonthlyDetail={(mKey) => setSelectedMonthForDetailModal(mKey)}
              onPrintReceipt={(rcpt) => setActiveReceiptToPrint(rcpt)}
            />
          )}

          {/* TAB 5: Sales Receipts Ledger & Print */}
          {activeSubTab === 'ledger' && (
            <PosSalesLedgerView
              receiptsList={receiptsList}
              onPrintReceipt={(rcpt) => setActiveReceiptToPrint(rcpt)}
            />
          )}

          {/* TAB: Online Customer Orders */}
          {activeSubTab === 'online_orders' && (
            <motion.div
              key="online-orders-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <OnlineOrdersManagement
                onReturnToPos={() => setActiveSubTab('pos')}
                staffName={currentStaff.fullName || 'متصدی صندوق'}
              />
            </motion.div>
          )}

          {/* TAB: Product Management */}
          {activeSubTab === 'product-manage' && (
            <motion.div
              key="product-manage-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProductManagementPanel
                products={productsList}
                onUpdateProducts={(updated) => {
                  setProductsList(updated);
                  if (onUpdateProductsStock) {
                    onUpdateProductsStock(updated);
                  }
                  try {
                    localStorage.setItem('wholesale_products', JSON.stringify(updated));
                    localStorage.setItem('sovin_django_products', JSON.stringify(updated));
                  } catch {}
                }}
                onReturnToDashboard={() => setActiveSubTab('pos')}
                onNavigateToPublicStore={onReturnToStore}
                initialTab={productManagementInitialTab}
                initialBarcode={productManagementInitialBarcode}
                initialEditingProduct={productManagementSelectedProduct}
              />
            </motion.div>
          )}

          {/* TAB: Monthly Sales Comparison */}
          {activeSubTab === 'monthly_compare' && (
            <motion.div
              key="monthly-compare-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MonthlySalesComparisonView receiptsList={receiptsList} />
            </motion.div>
          )}

          {/* TAB: Ticket Management */}
          {activeSubTab === 'tickets' && (
            <motion.div
              key="tickets-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!(currentStaff.role === 'super_admin' || currentStaff.permissions?.includes('manage_tickets')) ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 text-3xl">
                    🔒
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900">عدم دسترسی به بخش پاسخگویی تیکت‌ها</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      شمای کاربری فعلی شما ({currentStaff.fullName}) فاقد دسترسی «پاسخگویی و مدیریت تیکت‌ها» است. لطفاً از طریق دکمه زیر دسترسی حساب خود را ارتقا دهید.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setShowStaffModal(true);
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors active:scale-95 shadow-md shadow-indigo-600/10"
                    >
                      تغییر یا ارتقای دسترسی کاربر
                    </button>
                  </div>
                </div>
              ) : (
                <TicketManagementPanel crmConfig={crmConfig} />
              )}
            </motion.div>
          )}

          {/* TAB: Warehouse Contact Messages Inbox */}
          {activeSubTab === 'warehouse_messages' && (
            <motion.div
              key="warehouse-messages-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!(currentStaff.role === 'super_admin' || currentStaff.permissions?.includes('manage_warehouse_messages')) ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 text-3xl">
                    🔒
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900">عدم دسترسی به بخش پیام‌های تماس</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      شمای کاربری فعلی شما ({currentStaff.fullName}) فاقد دسترسی «صندوق پیام‌های تماس سایت» است. لطفاً از طریق دکمه زیر دسترسی حساب خود را ارتقا دهید.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setShowStaffModal(true);
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors active:scale-95 shadow-md shadow-indigo-600/10"
                    >
                      تغییر یا ارتقای دسترسی کاربر
                    </button>
                  </div>
                </div>
              ) : (
                <WarehouseContactMessagesPanel 
                  onRefreshBadge={fetchUnreadMessagesCount} 
                  showToast={showToast}
                />
              )}
            </motion.div>
          )}

          {/* TAB: User Management */}
          {activeSubTab === 'user_management' && (
            <motion.div
              key="user-management-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <UserManagementPanel crmConfig={crmConfig} />
            </motion.div>
          )}

          {/* TAB: SMS Gateway Management */}
          {activeSubTab === 'sms_management' && (
            <KavenegarSmsManagementPanel
              hasStaffPerm={hasStaffPerm}
              currentStaff={currentStaff}
              smsSuccessMessage={smsSuccessMessage}
              smsErrorMessage={smsErrorMessage}
              smsSubTab={smsSubTab}
              setSmsSubTab={setSmsSubTab}
              smsLogs={smsLogs}
              lastSmsSync={lastSmsSync}
              kavenegarConfig={kavenegarConfig}
              setKavenegarConfig={setKavenegarConfig}
              showApiToken={showApiToken}
              setShowApiToken={setShowApiToken}
              smsSearch={smsSearch}
              setSmsSearch={setSmsSearch}
              smsStatusFilter={smsStatusFilter}
              setSmsStatusFilter={setSmsStatusFilter}
              isSmsLoading={isSmsLoading}
              crmConfig={crmConfig}
              setSmsSuccessMessage={setSmsSuccessMessage}
              setSmsErrorMessage={setSmsErrorMessage}
              onRefreshLogs={async () => {
                setIsSmsLoading(true);
                try {
                  const logs = await djangoFetchSmsLogs(crmConfig);
                  setSmsLogs(logs);
                  setSmsSuccessMessage('لاگ‌ها با موفقیت از دیتابیس جنگو به‌روزرسانی شدند.');
                  setTimeout(() => setSmsSuccessMessage(''), 3000);
                } catch {
                  setSmsErrorMessage('خطا در دریافت لاگ‌های جدید.');
                  setTimeout(() => setSmsErrorMessage(''), 3000);
                } finally {
                  setIsSmsLoading(false);
                }
              }}
              onOpenStaffModal={() => setShowStaffModal(true)}
            />
          )}

          {/* TAB: Notification Management (Django UserNotification) */}
          {activeSubTab === 'notifications' && (
            <motion.div
              key="notifications-management-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              dir="rtl"
              className="space-y-6"
            >
              {/* Permission check */}
              {!(currentStaff.role === 'super_admin' || currentStaff.permissions?.includes('manage_notifications')) ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 text-3xl">
                    🔒
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900">عدم دسترسی به بخش اعلانات و نوتیفیکیشن‌ها</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      شمای کاربری فعلی شما ({currentStaff.fullName}) فاقد دسترسی «مدیریت و ارسال نوتیفیکیشن» است. لطفاً از طریق دکمه زیر سطح دسترسی را ارتقا دهید.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setShowStaffModal(true);
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors active:scale-95 shadow-md shadow-indigo-600/10"
                    >
                      تغییر یا ارتقای دسترسی کاربر
                    </button>
                  </div>
                </div>
              ) : (
                <NotificationManagementPanel
                  crmConfig={crmConfig}
                  customers={posCustomers}
                  currentStaff={currentStaff}
                  onOpenBackendModal={() => setShowBackendModal(true)}
                />
              )}
            </motion.div>
          )}

          {/* TAB: Staff & User Management (Dedicated Page Mode View) */}
          {activeSubTab === 'staff_management' && (
            <motion.div
              key="staff-management-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              dir="rtl"
              className="space-y-6"
            >
              <StaffAccessManagerModal
                isPageMode={true}
                staffList={staffList}
                currentStaff={currentStaff}
                onUpdateStaffList={setStaffList}
                onSwitchCurrentStaff={setCurrentStaff}
                onClose={() => setActiveSubTab('pos')}
              />
            </motion.div>
          )}

          {/* TAB: Blog & Article Management (Dedicated /shopmanage/blog View) */}
          {activeSubTab === 'blog' && (
            <motion.div
              key="blog-management-page-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              dir="rtl"
              className="space-y-6"
            >
              <BlogManagementPanel
                crmConfig={crmConfig}
                onOpenBackendModal={() => setShowBackendModal(true)}
              />
            </motion.div>
          )}

          {/* TAB: Dedicated Site Settings & Banner Sliders Management View */}
          {activeSubTab === 'site_settings' && (
            <motion.div
              key="site-settings-management-page-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              dir="rtl"
              className="space-y-6"
            >
              {!(currentStaff.role === 'super_admin' || currentStaff.permissions?.includes('manage_site_settings') || currentStaff.permissions?.includes('manage_sliders') || currentStaff.permissions?.includes('manage_footer_settings')) ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 text-3xl">
                    🔒
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900">عدم دسترسی به تنظیمات سایت</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      شمای کاربری فعلی شما ({currentStaff.fullName}) فاقد دسترسی «تنظیمات عمومی سایت»، «مدیریت اسلایدرها» یا «تنظیمات فوتر سایت» است. لطفاً جهت تغییر دسترسی با مدیریت ارشد تماس بگیرید یا حساب خود را ارتقا دهید.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setShowStaffModal(true);
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors active:scale-95 shadow-md shadow-indigo-600/10"
                    >
                      تغییر یا ارتقای دسترسی کاربر
                    </button>
                  </div>
                </div>
              ) : (
                <SiteSettingsManagementPanel
                  currentStaff={currentStaff}
                  onReturnToPos={() => setActiveSubTab('pos')}
                />
              )}
            </motion.div>
          )}


        </AnimatePresence>
      </main>

      {/* Stock Adjustment Modal */}
      {selectedProductForAdjustment && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" 
          dir="rtl"
          onClick={() => setSelectedProductForAdjustment(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">ورود یا اصلاح بار انبار</h3>
              <button onClick={() => setSelectedProductForAdjustment(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4 flex items-center gap-3">
              <img src={selectedProductForAdjustment.image} alt={selectedProductForAdjustment.nameFa} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{selectedProductForAdjustment.nameFa}</h4>
                <p className="text-[11px] text-indigo-600 font-mono mt-0.5">
                  موجودی فعلی: {selectedProductForAdjustment.category === 'drinks_coffee' ? formatNumberFa(selectedProductForAdjustment.stockCartons) + ' عدد' : formatNumberFa(selectedProductForAdjustment.stockCartons) + ' کارتن (' + formatNumberFa(selectedProductForAdjustment.stockCartons * (selectedProductForAdjustment.boxesPerCarton || 50)) + ' باکس)'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نوع عملیات انبارداری:</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-bold"
                >
                  <option value="stock_in">📥 ورود بار جدید (افزایش موجودی انبار)</option>
                  <option value="damage">📦 ثبت ضایعات یا آسیب‌دیدگی بار (کاهش)</option>
                  <option value="adjustment">⚖️ اصلاح انبارگردانی (تعدیل)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">واحد ورودی/اصلاح:</label>
                  <select
                    value={adjustUnit}
                    onChange={(e) => setAdjustUnit(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-bold"
                  >
                    <option value="carton">کارتن</option>
                    <option value="box">باکس</option>
                    <option value="pack">پاکت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">تعداد:</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustQuantityCartons}
                    onChange={(e) => setAdjustQuantityCartons(Number(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات و شماره بارنامه:</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="مثال: بارنامه شماره ۱۸۷۶۴ باربری وطن"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleSaveStockAdjustment}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg transition-colors mt-2"
              >
                ثبت تغییرات در انبار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {showAddProductModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-scrollbar" 
          dir="rtl"
          onClick={() => setShowAddProductModal(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto modal-overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span>تعریف کالا یا جنس جدید در سیستم انبار و صندوق</span>
              </h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام فارسی کالا *</label>
                  <input
                    type="text"
                    value={newProdNameFa}
                    onChange={(e) => setNewProdNameFa(e.target.value)}
                    placeholder="مثال: قهوه اسپرسو دوبل / فندک کایزر"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام انگلیسی / برند</label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    placeholder="مثال: Sovin Coffee"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">دسته بندی محصول</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => {
                      const cat = e.target.value as CigaretteCategory;
                      setNewProdCategory(cat);
                      if (cat === 'drinks_coffee') {
                        setNewProdBoxesPerCarton(1);
                        setNewProdPacksPerBox(1);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-bold"
                  >
                    <option value="drinks_coffee">☕ قهوه، نوشیدنی و اقلام حضوری</option>
                    <option value="original_cigarettes">🚬 سیگارهای اورجینال</option>
                    <option value="iqos_devices">📱 دستگاه‌های ایکاس (IQOS)</option>
                    <option value="terea_heets">🔥 استیک تیریا و هیتس</option>
                    <option value="pod_vape">💨 پاد و ویپ</option>
                    <option value="tobacco">🍃 توتون</option>
                    <option value="accessories">⚡ ملزومات و اکسسوری</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">کد بارکد</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newProdBarcode}
                    onChange={(e) => setNewProdBarcode(e.target.value)}
                    placeholder="کد بارکد اسکنر..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className={`grid ${newProdCategory === 'drinks_coffee' ? 'grid-cols-1' : 'grid-cols-3'} gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200`}>
                {newProdCategory !== 'drinks_coffee' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">قیمت کارتن (تومان)</label>
                      <input
                        type="number"
                        value={newProdCartonPrice || ''}
                        onChange={(e) => setNewProdCartonPrice(Number(e.target.value) || 0)}
                        placeholder="۴۵۰۰۰۰۰"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">قیمت باکس (تومان)</label>
                      <input
                        type="number"
                        value={newProdBoxPrice || ''}
                        onChange={(e) => setNewProdBoxPrice(Number(e.target.value) || 0)}
                        placeholder="۴۵۰۰۰۰"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">{newProdCategory === 'drinks_coffee' ? 'قیمت تک (تومان)' : 'قیمت پاکت/تکی'}</label>
                  <input
                    type="number"
                    value={newProdPackPrice || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setNewProdPackPrice(val);
                      if (newProdCategory === 'drinks_coffee') {
                        setNewProdBoxPrice(val);
                        setNewProdCartonPrice(val);
                      }
                    }}
                    placeholder="۴۵۰۰۰"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {newProdCategory !== 'drinks_coffee' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">باکس در کارتن</label>
                    <input
                      type="number"
                      value={newProdBoxesPerCarton}
                      onChange={(e) => setNewProdBoxesPerCarton(Number(e.target.value) || 10)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">پاکت در باکس</label>
                    <input
                      type="number"
                      value={newProdPacksPerBox}
                      onChange={(e) => setNewProdPacksPerBox(Number(e.target.value) || 10)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">موجودی اولیه (کارتن)</label>
                    <input
                      type="number"
                      value={newProdInitialCartons}
                      onChange={(e) => setNewProdInitialCartons(Number(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold text-indigo-600"
                    />
                  </div>
                </div>
              )}

              {newProdCategory === 'drinks_coffee' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">موجودی اولیه (تعداد تکی)</label>
                  <input
                    type="number"
                    value={newProdInitialCartons}
                    onChange={(e) => setNewProdInitialCartons(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold text-indigo-600"
                  />
                </div>
              )}

              {/* Online Sync vs Store-only Checkbox */}
              <div className="bg-indigo-50/80 border border-indigo-200 p-3.5 rounded-2xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdIsPosOnly}
                    onChange={(e) => setNewProdIsPosOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-black text-indigo-950 block">کالای مخصوص فروش حضوری در صندوق (مختص مغازه)</span>
                    <span className="text-[11px] text-indigo-700 block mt-0.5 leading-relaxed">
                      در صورت تیک زدن، این محصول فقط در صندوق فروشگاهی ثبت می‌شود (مانند قهوه/نوشیدنی). 
                      <strong>اگر تیک را بردارید، این کالا به صورت خودکار روی فروشگاه آنلاین هم قرار می‌گیرد.</strong>
                    </span>
                  </div>
                </label>
              </div>

              <button
                onClick={handleCreateNewProduct}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg transition-colors mt-2"
              >
                ذبان و ایجاد کالای جدید در سیستم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New / Edit Customer Modal */}
      {showNewCustomerModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" 
          dir="rtl"
          onClick={() => {
            setShowNewCustomerModal(false);
            setEditingCustomer(null);
          }}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{editingCustomer ? 'ویرایش مشخصات طرف حساب دفتری' : 'تعریف مشتری دفتری جدید'}</span>
              </h3>
              <button 
                onClick={() => {
                  setShowNewCustomerModal(false);
                  setEditingCustomer(null);
                }} 
                className="text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نام و نام خانوادگی / نام مغازه:</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="مثال: فروشگاه سیگار و توتون ملل (حسینی)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">شماره همراه:</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">شهر / منطقه:</label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    placeholder="تهران / کرج..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">آدرس فروشگاه / محل تحویل:</label>
                <textarea
                  rows={2}
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="خیابان، پلاک، طبقه یا نشانی دقیق مغازه..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">یادداشت / سقف اعتبار:</label>
                <input
                  type="text"
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  placeholder="مثال: تسویه هفتگی، سقف اعتبار ۲۰ میلیون تومان"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {editingCustomer ? 'مانده بدهی فعلی (تومان):' : 'مانده بدهی اولیه افتتاح حساب (تومان):'}
                </label>
                <input
                  type="number"
                  value={newCustInitialBalance || ''}
                  onChange={(e) => setNewCustInitialBalance(Number(e.target.value) || 0)}
                  placeholder="۰ (مثبت = بدهکار، منفی = بستانکار)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  عدد مثبت یعنی مشتری بدهکار است؛ عدد منفی به معنی بستانکاری مشتری است.
                </span>
              </div>

              <button
                onClick={editingCustomer ? handleSaveEditCustomer : handleCreateNewCustomer}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg transition-colors mt-2"
              >
                {editingCustomer ? 'ذخیره تغییرات مشخصات مشتری' : 'ثبت مشتری در حساب‌های دفتری'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Account Statement & Transaction History Modal */}
      {customerHistoryModalCust && (() => {
        const cust = customerHistoryModalCust;
        const custTransactions = ledgerTransactions.filter(tx => tx.customerId === cust.id);
        const custReceipts = receiptsList.filter(
          r => r.customerName === cust.name || (r.customerPhone && cust.phone && r.customerPhone === cust.phone)
        );

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-scrollbar" 
            dir="rtl"
            onClick={() => setCustomerHistoryModalCust(null)}
          >
            <div 
              className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto modal-overscroll-contain space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-black">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{cust.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      صورت‌حساب مالی، گردش بدهی و واریزی‌ها • تاریخ افتتاح: {cust.createdAt}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCustomerHistoryModalCust(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Info Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">وضعیت مانده حساب:</span>
                  <span className={`font-black text-sm font-mono mt-0.5 block ${
                    cust.balance > 0 ? 'text-rose-600' : cust.balance < 0 ? 'text-emerald-600' : 'text-slate-700'
                  }`}>
                    {cust.balance > 0 ? `بدهکار: ${formatToman(cust.balance)}` : cust.balance < 0 ? `بستانکار: ${formatToman(Math.abs(cust.balance))}` : 'تسویه کامل'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">تلفن تماس:</span>
                  <span className="font-bold text-slate-800 font-mono block mt-0.5" dir="ltr">{cust.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">شهر / منطقه:</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{cust.city || '-'}</span>
                </div>
                {cust.address && (
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 block text-[10px]">آدرس:</span>
                    <span className="font-bold text-slate-700 block mt-0.5">{cust.address}</span>
                  </div>
                )}
                {cust.notes && (
                  <div className="col-span-2 sm:col-span-3 bg-white p-2 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                    <strong>یادداشت دفتری:</strong> {cust.notes}
                  </div>
                )}
              </div>

              {/* Transactions List */}
              <div>
                <h4 className="text-xs font-black text-slate-900 mb-2.5 flex items-center justify-between">
                  <span>ریز گردش بدهکاری‌ها و واریزی‌های دفتری</span>
                  <span className="text-slate-400 font-mono font-normal text-[11px]">
                    {custTransactions.length} تراکنش ثبت شده
                  </span>
                </h4>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {custTransactions.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                      تراکنشی برای این مشتری ثبت نشده است
                    </div>
                  ) : (
                    custTransactions.map(tx => (
                      <div 
                        key={tx.id}
                        className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{tx.description}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{tx.date}</span>
                        </div>
                        <span className={`font-mono font-black text-sm ${
                          tx.type === 'debit' ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {tx.type === 'debit' ? `+${formatToman(tx.amount)} (بدهکاری)` : `-${formatToman(tx.amount)} (واریزی)`}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Invoices of this Customer */}
              {custReceipts.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-900 mb-2">فاکتورهای صادر شده در صندوق</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {custReceipts.map(rcpt => (
                      <div 
                        key={rcpt.id}
                        className="bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-indigo-600">{rcpt.receiptNumber}</span>
                          <span className="text-[10px] text-slate-400">{rcpt.createdAt}</span>
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-slate-600">
                            {rcpt.paymentMethod === 'pos_terminal' ? 'کارتخوان' : rcpt.paymentMethod === 'cash' ? 'نقدی' : rcpt.paymentMethod === 'ledger' ? 'نسیه دفتری' : 'ترکیبی'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{formatToman(rcpt.finalTotal)}</span>
                          <button
                            onClick={() => {
                              setCustomerHistoryModalCust(null);
                              setActiveReceiptToPrint(rcpt);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600"
                            title="مشاهده و چاپ فاکتور"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    const custToPay = cust;
                    setCustomerHistoryModalCust(null);
                    setSelectedCustomerForPayment(custToPay);
                    setPaymentAmount(Math.abs(custToPay.balance));
                    setPaymentType(custToPay.balance >= 0 ? 'credit' : 'debit');
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors"
                >
                  ثبت دریافت / پرداخت تسویه
                </button>
                <button
                  onClick={() => setCustomerHistoryModalCust(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Customer Record Payment Modal */}
      {selectedCustomerForPayment && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" 
          dir="rtl"
          onClick={() => setSelectedCustomerForPayment(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">ثبت دریافت وجه / تسویه مشتری دفتری</h3>
              <button onClick={() => setSelectedCustomerForPayment(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4">
              <h4 className="text-xs font-bold text-slate-900">{selectedCustomerForPayment.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                مانده فعلی: <strong className="text-rose-600">{formatToman(selectedCustomerForPayment.balance)}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نوع تراکنش:</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-bold"
                >
                  <option value="credit">📥 دریافت وجه از مشتری (کاهش بدهی)</option>
                  <option value="debit">📤 اضافه کردن بدهکاری جدید (افزایش بدهی)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ پرداختی (تومان):</label>
                <input
                  type="number"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                  placeholder="۰"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات و شماره پیگیری:</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="مثال: واریزی کارت به کارت به حساب فروشگاه"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleSaveCustomerPayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg transition-colors mt-2"
              >
                ثبت تراکنش در دفتر حساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Thermal 80mm Receipt Modal for Printing */}
      {activeReceiptToPrint && (
        <div 
          className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:hidden" 
          dir="rtl"
          onClick={() => setActiveReceiptToPrint(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-[40px] max-w-xl w-full p-6 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* 80mm Printable Receipt Box CSS */}
            <style>{`
              @media print {
                body * { visibility: hidden; }
                #thermal-receipt, #thermal-receipt * { visibility: visible; }
                #thermal-receipt { 
                  position: absolute; 
                  left: 0; 
                  top: 0; 
                  width: 300px;
                  margin: 0;
                  padding: 10px;
                  box-shadow: none !important;
                }
              }
            `}</style>
            <div 
              id="thermal-receipt" 
              className="bg-white text-slate-900 p-5 mx-auto text-xs border border-slate-200 rounded-2xl relative"
              style={{ 
                width: '340px', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
              }}
            >
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-3">
                <div className="font-black text-lg text-slate-900 mb-1">فروشگاه و پخش دخانیات سرو</div>
                <div className="inline-block whitespace-nowrap text-[11px] text-slate-800 font-bold bg-slate-100 px-3 py-0.5 rounded border border-slate-300">
                  فاکتور رسمی فروش و تحویل کالا
                </div>
                <div className="text-[10px] text-slate-600 mt-1.5 font-medium">پشتیبانی و سفارشات: ۰۹۱۲۰۷۵۹۴۱۹</div>
              </div>

              <div className="space-y-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3 text-slate-800 font-medium">
                <div className="flex justify-between items-center">
                  <span>شماره فاکتور:</span>
                  <span className="font-mono font-black text-slate-900">{activeReceiptToPrint.receiptNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>تاریخ ثبت:</span>
                  <span className="font-bold text-slate-700">{activeReceiptToPrint.createdAt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>خریدار:</span>
                  <span className="font-bold text-slate-900">{activeReceiptToPrint.customerName || 'مشتری حضوری فروشگاه'}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-b-2 border-slate-900 pb-3 mb-3">
                <table className="w-full table-fixed text-right text-[11px] text-slate-800 font-semibold">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100/70 text-slate-900">
                      <th className="py-1.5 px-1 text-right w-[46%] font-black">شرح کالا</th>
                      <th className="py-1.5 px-1 text-center w-[24%] font-black">تعداد</th>
                      <th className="py-1.5 px-1 text-left w-[30%] font-black">مبلغ (تومان)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReceiptToPrint.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-1.5 px-1 leading-tight text-right text-slate-900 font-bold">{it.product.nameFa}</td>
                        <td className="py-1.5 px-1 text-center font-bold text-slate-700 whitespace-nowrap">{formatNumberFa(it.quantity)} {it.unit === 'carton' ? 'کارتن' : it.unit === 'box' ? 'باکس' : 'پاکت'}</td>
                        <td className="py-1.5 px-1 text-left font-black text-slate-900 whitespace-nowrap">{formatNumberFa(it.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2 text-[11px] bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">جمع کل اقلام:</span>
                  <span className="font-bold text-slate-900">{formatToman(activeReceiptToPrint.subtotal)}</span>
                </div>
                {activeReceiptToPrint.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-bold">
                    <span>تخفیف اعطایی:</span>
                    <span>-{formatToman(activeReceiptToPrint.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-2 border-t-2 border-dashed border-slate-400">
                  <span className="text-slate-950">مبلغ نهایی پرداختی:</span>
                  <span className="text-sm font-black text-slate-950">{formatToman(activeReceiptToPrint.finalTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-600 pt-1.5 border-t border-slate-200">
                  <span>روش تسویه:</span>
                  <span className="font-bold text-indigo-900">
                    {(() => {
                      const pm = activeReceiptToPrint.paymentMethod as string;
                      const paidAmount = pm === 'pos_terminal' || pm === 'cash'
                        ? activeReceiptToPrint.finalTotal
                        : pm === 'split'
                          ? (activeReceiptToPrint.splitPaymentDetails?.paidNow || 0)
                          : (pm === 'foreign' || pm === 'usd' || pm === 'eur')
                            ? (activeReceiptToPrint.foreignCurrencyDetails?.tomanEquivalent || 0)
                            : 0;

                      const debt = Math.max(0, activeReceiptToPrint.finalTotal - paidAmount);
                      const debtText = debt > 0 ? ` / بدهی: ${formatToman(debt)}` : '';

                      if (activeReceiptToPrint.paymentMethod === 'pos_terminal') return 'کارتخوان بانکی' + debtText;
                      if (activeReceiptToPrint.paymentMethod === 'cash') return 'پرداخت نقدی' + debtText;
                      if (activeReceiptToPrint.paymentMethod === 'ledger') return 'حساب دفتری (نسیه)' + debtText;
                      if (activeReceiptToPrint.paymentMethod === 'split') {
                        return `ترکیبی (${activeReceiptToPrint.splitPaymentDetails ? `پرداخت: ${formatToman(activeReceiptToPrint.splitPaymentDetails.paidNow)} / دفتری: ${formatToman(activeReceiptToPrint.splitPaymentDetails.remainingToLedger)}` : 'نقد + نسیه'})${debtText}`;
                      }
                      if ((activeReceiptToPrint.paymentMethod === 'foreign' || activeReceiptToPrint.paymentMethod === 'usd' || activeReceiptToPrint.paymentMethod === 'eur') && activeReceiptToPrint.foreignCurrencyDetails) {
                        return `پرداخت ارزی (${activeReceiptToPrint.foreignCurrencyDetails.currency}): ${activeReceiptToPrint.foreignCurrencyDetails.amount} (نرخ: ${formatNumberFa(activeReceiptToPrint.foreignCurrencyDetails.rate || 0)})${debtText}`;
                      }
                      return 'روش تسویه نامشخص';
                    })()}
                  </span>
                </div>
              </div>

              <div className="text-center pt-3 mt-3 border-t border-dashed border-slate-300 text-[10px] font-bold text-slate-600">
                <p>با سپاس از خرید و حسن اعتماد شما</p>
                <div className="mt-2 font-mono text-base tracking-[0.25em] text-slate-800 font-black">
                  |||||||||||||||||||||
                </div>
                <div className="text-[9px] mt-0.5 tracking-wider font-mono text-slate-500">{activeReceiptToPrint.receiptNumber}</div>
              </div>

            </div>

            {/* Modal Buttons - Vertical Stack for Better UX */}
            <div className="mt-6 flex flex-col gap-3 print:hidden">
              <button
                onClick={() => handleDownloadThermalPdf(activeReceiptToPrint)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>دانلود فایل PDF فاکتور رسمی</span>
              </button>
              
              <button
                onClick={handlePrintReceipt}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Printer className="w-5 h-5" />
                <span>چاپ مستقیم فاکتور فروش</span>
              </button>
              
              <button
                onClick={() => setActiveReceiptToPrint(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-black active:scale-[0.98] transition-all cursor-pointer"
              >
                بستن و بازگشت به صندوق
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* DETAIL MODAL 1: DAILY REPORT BREAKDOWN */}
      {selectedDateForDetailModal && (() => {
        const dayData = dailySalesGrouped.find(d => d.date === selectedDateForDetailModal) || {
          date: selectedDateForDetailModal,
          receipts: receiptsList.filter(r => extractDateKey(r.createdAt) === selectedDateForDetailModal),
          totalSales: 0,
          posSales: 0,
          cashSales: 0,
          ledgerSales: 0,
          cartons: 0,
          boxes: 0,
          packs: 0,
        };
        const dayReceipts = dayData.receipts;
        const totalRev = dayReceipts.reduce((s, r) => s + r.finalTotal, 0);

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-scrollbar" 
            dir="rtl"
            onClick={() => setSelectedDateForDetailModal(null)}
          >
            <div 
              className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto modal-overscroll-contain space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      ریز گزارش فروش روزانه: <span className="font-mono text-indigo-600">{selectedDateForDetailModal}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">جزئیات کامل تراکنش‌ها و اقلام تحویل داده شده در این تاریخ</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDateForDetailModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Day Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">فروش کل روز</span>
                  <span className="text-base font-black text-indigo-700 font-mono mt-0.5 block">{formatToman(totalRev)}</span>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">دستگاه کارتخوان</span>
                  <span className="text-base font-black text-blue-700 font-mono mt-0.5 block">{formatToman(dayData.posSales)}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">فروش نقدی</span>
                  <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">{formatToman(dayData.cashSales)}</span>
                </div>
                <div className="bg-purple-50 border border-purple-100 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">حساب دفتری (نسیه)</span>
                  <span className="text-base font-black text-purple-700 font-mono mt-0.5 block">{formatToman(dayData.ledgerSales)}</span>
                </div>
              </div>

              {/* Day Receipts List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900">لیست فاکتورهای صادر شده در تاریخ {selectedDateForDetailModal}:</h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5">شماره فاکتور</th>
                        <th className="p-2.5">ساعت</th>
                        <th className="p-2.5">خریدار</th>
                        <th className="p-2.5"> اقلام</th>
                        <th className="p-2.5">تسویه</th>
                        <th className="p-2.5">مبلغ کل</th>
                        <th className="p-2.5 text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dayReceipts.map((rcpt) => (
                        <tr key={rcpt.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-indigo-700">{rcpt.receiptNumber}</td>
                          <td className="p-2.5 font-mono text-slate-500">{rcpt.createdAt.split(' ')[1] || '12:00'}</td>
                          <td className="p-2.5 font-bold text-slate-900">{rcpt.customerName}</td>
                          <td className="p-2.5 text-[11px] text-slate-600 max-w-[180px] truncate">
                            {rcpt.items.map(i => `${i.product.nameFa} (${i.quantity})`).join('، ')}
                          </td>
                          <td className="p-2.5">
                            <span className="text-[10px] font-bold text-slate-700">
                              {rcpt.paymentMethod === 'pos_terminal' ? 'کارتخوان' : rcpt.paymentMethod === 'cash' ? 'نقدی' : 'دفتری'}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono font-black text-indigo-600">{formatToman(rcpt.finalTotal)}</td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => setActiveReceiptToPrint(rcpt)}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold hover:bg-indigo-100"
                            >
                              مشاهده فیش
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => generateDailyReportPdf(dayData)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود PDF گزارش روزانه</span>
                </button>

                <button
                  onClick={() => setSelectedDateForDetailModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  بستن
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* DETAIL MODAL 2: MONTHLY REPORT BREAKDOWN */}
      {selectedMonthForDetailModal && (() => {
        const monthData = monthlySalesGrouped.find(m => m.monthKey === selectedMonthForDetailModal) || {
          monthKey: selectedMonthForDetailModal,
          monthName: getPersianMonthName(selectedMonthForDetailModal),
          receipts: receiptsList.filter(r => extractMonthKey(r.createdAt) === selectedMonthForDetailModal),
          activeDaysCount: 1,
          totalSales: 0,
          posSales: 0,
          cashSales: 0,
          ledgerSales: 0,
          cartons: 0,
          boxes: 0,
          packs: 0,
        };

        const daysInMonth = dailySalesGrouped.filter(d => extractMonthKey(d.date) === selectedMonthForDetailModal);
        const avgDailyRev = Math.round(monthData.totalSales / (monthData.activeDaysCount || 1));

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-scrollbar" 
            dir="rtl"
            onClick={() => setSelectedMonthForDetailModal(null)}
          >
            <div 
              className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto modal-overscroll-contain space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700">
                    <CalendarRange className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      ریز گزارش جامع عملکرد ماهانه: <span className="text-purple-700">{monthData.monthName}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">آمار مقایسه‌ای فروش روزانه و درآمد کل در این ماه شمسی</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMonthForDetailModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Month Big Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-purple-50 border border-purple-100 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">درآمد کل ماه</span>
                  <span className="text-base font-black text-purple-700 font-mono mt-0.5 block">{formatToman(monthData.totalSales)}</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">میانگین فروش روزانه</span>
                  <span className="text-base font-black text-indigo-700 font-mono mt-0.5 block">{formatToman(avgDailyRev)}</span>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">فروش کارتخوان</span>
                  <span className="text-base font-black text-blue-700 font-mono mt-0.5 block">{formatToman(monthData.posSales)}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block">تعداد روزهای فعال</span>
                  <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">{monthData.activeDaysCount} روز</span>
                </div>
              </div>

              {/* Days breakdown table in month */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900">تفکیک فروش روزانه در ماه {monthData.monthName}:</h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[260px] overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-purple-50 text-purple-900 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5">تاریخ</th>
                        <th className="p-2.5 text-center">تعداد فاکتور</th>
                        <th className="p-2.5">کارتخوان</th>
                        <th className="p-2.5">نقدی و دفتری</th>
                        <th className="p-2.5">مجموع فروش روز</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {daysInMonth.map((d) => (
                        <tr key={d.date} className="hover:bg-purple-50/30">
                          <td className="p-2.5 font-mono font-bold text-slate-900">{d.date}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-slate-700">{d.receipts.length} فاکتور</td>
                          <td className="p-2.5 font-mono text-blue-700 font-bold">{formatToman(d.posSales)}</td>
                          <td className="p-2.5 font-mono text-emerald-700 font-bold">{formatToman(d.cashSales + d.ledgerSales)}</td>
                          <td className="p-2.5 font-mono font-black text-purple-700">{formatToman(d.totalSales)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => generateMonthlyReportPdf(monthData, daysInMonth)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-purple-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ گزارش جامع ماهانه</span>
                </button>

                <button
                  onClick={() => setSelectedMonthForDetailModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  بستن
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Product Insights Modal */}
      {showInsightsModal && selectedProductForInsights && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowInsightsModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white">
                  <img src={selectedProductForInsights.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedProductForInsights.nameFa}</h3>
                  <p className="text-xs text-slate-500 font-bold">تحلیل هوشمند عملکرد فروش و تقاضا</p>
                </div>
              </div>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Performance Charts */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      روند فروش ۶ ماهه (تعداد)
                    </h4>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getProductPerformanceData(selectedProductForInsights.id)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} 
                        />
                        <YAxis hide />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#4f46e5" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                    <span className="text-[10px] font-bold opacity-80 block">مجموع فروش ۶ ماه</span>
                    <span className="text-xl font-black font-mono block mt-1">
                      {getProductPerformanceData(selectedProductForInsights.id).reduce((acc, d) => acc + d.sales, 0)}
                    </span>
                    <span className="text-[10px] font-bold block mt-1">واحد (باکس/کارتن)</span>
                  </div>
                  <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                    <span className="text-[10px] font-bold opacity-80 block">میانگین فروش ماهانه</span>
                    <span className="text-xl font-black font-mono block mt-1">
                      {Math.round(getProductPerformanceData(selectedProductForInsights.id).reduce((acc, d) => acc + d.sales, 0) / 6)}
                    </span>
                    <span className="text-[10px] font-bold block mt-1">رشد پایدار</span>
                  </div>
                  <div className="bg-amber-500 p-4 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                    <span className="text-[10px] font-bold opacity-80 block">پیشنهاد شارژ انبار</span>
                    <span className="text-lg font-black block mt-1">اولویت بالا</span>
                    <span className="text-[10px] font-bold block mt-1">تقاضای صعودی</span>
                  </div>
                </div>
              </div>

              {/* Recommendation Box */}
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl">
                <h4 className="text-sm font-black text-indigo-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  تحلیل هوشمند دخانیات سرو
                </h4>
                <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                  با توجه به روند فروش در ۳ ماه گذشته، این محصول در دسته <strong className="text-indigo-900 underline decoration-indigo-300">«محصولات پرتقاضا»</strong> قرار دارد. 
                  پیشنهاد می‌شود برای جلوگیری از اتمام موجودی، حداقل به میزان <span className="font-bold">۳۰٪ بیشتر</span> از میانگین فروش ماهانه (حدود {Math.round(getProductPerformanceData(selectedProductForInsights.id)[5].sales * 1.3)} واحد) در انبار موجود داشته باشید.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setShowInsightsModal(false)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
              >
                متوجه شدم
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Staff & Access Permissions Management Modal */}
      {showStaffModal && (
        <StaffAccessManagerModal
          staffList={staffList}
          currentStaff={currentStaff}
          onUpdateStaffList={setStaffList}
          onSwitchCurrentStaff={setCurrentStaff}
          onClose={() => setShowStaffModal(false)}
          onlineSessions={onlineSessions}
        />
      )}

      {/* Online Cashiers & Concurrent Sessions Modal */}
      {showOnlineStaffModal && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowOnlineStaffModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-[28px] max-w-xl md:max-w-3xl lg:max-w-4xl w-full p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      صندوق‌دارهای آنلاین و پرسنل فعال
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full">
                      ورود همزمان نامحدود
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    لیست حساب‌های فعال همزمان در سیستم حسابداری دخانیات سرو ({
                      Array.from(new Map(onlineSessions.map(s => [String(s.id || s.phone || s.fullName), s])).values()).length
                    } کاربر آنلاین)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOnlineStaffModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3 text-xs sm:text-sm text-emerald-900 font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="leading-relaxed">
                در این سامانه محدودیت ورود تک‌کاربره وجود ندارد و چندین صندوق‌دار می‌توانند به صورت همزمان فاکتور صادر کنند.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
              {Array.from(new Map(onlineSessions.map(s => [String(s.id || s.phone || s.fullName), s])).values()).map((session) => {
                const sessionCleanPhone = String(session.phone || '').replace(/\D/g, '');
                const currentStaffCleanPhone = String(currentStaff.phone || '').replace(/\D/g, '');
                const isMe = session.isCurrentUser || String(session.id) === String(currentStaff.id) || (Boolean(sessionCleanPhone) && sessionCleanPhone === currentStaffCleanPhone);

                return (
                  <div 
                    key={session.id || session.phone}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 overflow-hidden ${
                      isMe ? 'bg-indigo-50/80 border-indigo-200 shadow-sm ring-1 ring-indigo-500/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-2xl ${session.avatarColor || 'bg-indigo-600'} text-white font-black text-base flex items-center justify-center shadow-sm shrink-0`}>
                        {session.fullName.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-slate-900 truncate max-w-[160px] sm:max-w-[200px]">
                            {session.fullName}
                          </span>
                          {isMe && (
                            <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shrink-0">
                              نشست فعلی شما
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="truncate max-w-[120px] font-bold">{session.roleTitleFa}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">{session.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        آنلاین ({session.loginTime})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => {
                  setShowOnlineStaffModal(false);
                  setActiveSubTab('staff_management');
                }}
                className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-1"
              >
                <span>مدیریت و دسترسی پرسنل</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={() => setShowOnlineStaffModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                بستن
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Currency Rate Settings Modal */}
      {showCurrencyRateModal && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
          onClick={() => setShowCurrencyRateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-[28px] max-w-2xl w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-black text-slate-900">مدیریت نرخ ارز</h3>
              <button
                onClick={() => setShowCurrencyRateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <CurrencyRateSettings />
          </motion.div>
        </div>
      )}

      {/* Customer App & Live Cloud Database Connect Modal */}
      {showCustomerAppModal && (
        <CustomerAppConnectModal
          customers={posCustomers}
          receiptsList={receiptsList}
          products={productsList}
          onClose={() => setShowCustomerAppModal(false)}
          onAddInPersonPickupReceipt={(newRcpt) => {
            setReceiptsList(prev => [newRcpt, ...prev]);
            try {
              const current = JSON.parse(localStorage.getItem('pos_receipts_history') || '[]');
              localStorage.setItem('pos_receipts_history', JSON.stringify([newRcpt, ...current]));
            } catch {}
          }}
        />
      )}

      {/* Backend API Connection & Sync Modal */}
      {showBackendModal && (
        <BackendConnectionModal
          isOpen={showBackendModal}
          onClose={() => setShowBackendModal(false)}
          products={productsList}
          onProductsUpdated={(updated) => {
            setProductsList(updated);
            if (onUpdateProductsStock) {
              onUpdateProductsStock(updated);
            }
            setSuccessBanner('محصولات و موجودی انبار با وب‌سرویس بک‌اند با موفقیت همگام‌سازی شد.');
            setTimeout(() => setSuccessBanner(null), 3500);
          }}
          showToast={(msg) => {
            setSuccessBanner(msg);
            setTimeout(() => setSuccessBanner(null), 3500);
          }}
        />
      )}

      {/* Quick Add Product Modal */}
      <QuickAddProductModal
        isOpen={showQuickAddProductModal}
        onClose={() => {
          setShowQuickAddProductModal(false);
          setPendingBarcode('');
        }}
        onAddProduct={handleQuickAddProduct}
        initialBarcode={pendingBarcode}
      />

      {/* Blog Management Modal */}
      <BlogManagementModal
        isOpen={showBlogManagementModal}
        onClose={() => setShowBlogManagementModal(false)}
      />

      {/* Session Security & Token Expiry Modal */}
      <SessionSecurityModal
        isOpen={showSessionSecurityModal}
        onClose={() => setShowSessionSecurityModal(false)}
        currentStaff={currentStaff}
        onExtendSuccess={(msg) => {
          setSuccessBanner(msg);
          setTimeout(() => setSuccessBanner(null), 3500);
          setSessionRemainingSeconds(getRemainingSessionSeconds());
        }}
        onForceLogout={() => {
          setShowSessionSecurityModal(false);
          handleAutoLogoutDueToExpiration('manual_force_test');
        }}
      />

      {/* Mobile App Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[190] bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around py-1.5 px-2 pb-safe">
        <button
          onClick={() => { setActiveSubTab('pos'); setShowMobileMoreMenu(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
            activeSubTab === 'pos' && !showMobileMoreMenu ? 'text-indigo-600 font-black' : 'text-slate-500'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px]">صندوق</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('online_orders'); setShowMobileMoreMenu(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all relative ${
            activeSubTab === 'online_orders' && !showMobileMoreMenu ? 'text-blue-600 font-black' : 'text-slate-500'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">سفارشات</span>
          {pendingOnlineOrdersCount > 0 && (
            <span className="absolute top-0 right-3.5 w-4 h-4 bg-amber-500 text-slate-950 text-[8px] rounded-full flex items-center justify-center font-bold">
              {pendingOnlineOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveSubTab('product-manage'); setShowMobileMoreMenu(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
            activeSubTab === 'product-manage' && !showMobileMoreMenu ? 'text-indigo-600 font-black' : 'text-slate-500'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">محصولات</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('reports'); setShowMobileMoreMenu(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
            activeSubTab === 'reports' && !showMobileMoreMenu ? 'text-indigo-600 font-black' : 'text-slate-500'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px]">گزارشات</span>
        </button>

        <button
          onClick={() => setShowMobileMoreMenu(true)}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
            showMobileMoreMenu ? 'text-indigo-600 font-black' : 'text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">بخش‌ها</span>
        </button>
      </div>

      {/* Mobile More Menu Bottom Sheet */}
      <AnimatePresence>
        {showMobileMoreMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMoreMenu(false)}
              className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-xs lg:hidden"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-[210] bg-white rounded-t-[32px] border-t border-slate-200 shadow-2xl p-5 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-10 lg:hidden"
              dir="rtl"
            >
              {/* Grabber indicator */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">منوی مدیریت و عملیات</h3>
                    <p className="text-[10px] text-slate-500">تمامی امکانات سامانه سرو در یک نگاه</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMoreMenu(false)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of administrative tabs */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'inventory', label: 'موجودی انبار و کاردکس', icon: Package, perm: 'manage_inventory' },
                  { id: 'customers', label: 'حساب‌های دفتری (نسیه)', icon: Users, perm: 'manage_ledger' },
                  { id: 'ledger', label: 'دفتر فاکتورهای فروش', icon: Receipt, perm: 'manage_ledger' },
                  ...(!isPosOnlyMode() ? [
                    { id: 'warehouse_messages', label: 'پیام‌های تماس سایت', icon: MessageSquare, perm: 'manage_warehouse_messages' },
                    { id: 'user_management', label: 'مدیریت کاربران سایت', icon: UserCheck, perm: 'manage_ledger' },
                  ] : []),
                  { id: 'sms_management', label: 'سامانه پیامک هوشمند', icon: Smartphone, perm: 'send_sms' },
                  { id: 'notifications', label: 'نوتیفیکیشن و اعلانات', icon: Bell, perm: 'manage_notifications' },
                  { id: 'staff_management', label: 'مدیریت پرسنل و دسترسی', icon: Sliders, perm: 'manage_staff' },
                  { id: 'tickets', label: 'تیکت‌های پشتیبانی', icon: Headphones, perm: 'manage_tickets' },
                  ...(!isPosOnlyMode() ? [
                    { id: 'blog', label: 'وبلاگ و مقالات سایت', icon: FileText, perm: 'manage_site_settings' },
                    { id: 'site_settings', label: 'تنظیمات اسلایدر و فوتر', icon: Settings, perm: 'manage_site_settings' },
                  ] : []),
                ]
                  .filter(item => !item.perm || hasStaffPerm(item.perm as StaffPermission))
                  .map(item => {
                    const Icon = item.icon;
                    const isActive = activeSubTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSubTab(item.id as PosSubTab);
                          setShowMobileMoreMenu(false);
                        }}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                          isActive
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                            : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`p-2 rounded-xl mb-2 ${isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 shadow-2xs border border-slate-100'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold leading-tight line-clamp-2">{item.label}</span>
                      </button>
                    );
                  })}
              </div>

              {/* System Footer Info inside Bottom Sheet */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>کاربر: {currentStaff.fullName}</span>
                <button
                  onClick={() => {
                    setShowMobileMoreMenu(false);
                    handleLogout();
                  }}
                  className="text-rose-600 font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج از پنل</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PWA Guided Installation Modal */}
      {showPwaInstallGuideModal && (
        <PwaInstallGuide
          isOpenOnly={true}
          onCloseModal={() => setShowPwaInstallGuideModal(false)}
          isPosContext={true}
        />
      )}

    </div>
  );
};
