import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ChevronDown,
  Server,
  Headphones,
  Bell
} from 'lucide-react';
import { api } from '../../services/api';
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
import { NotificationManagementPanel } from './NotificationManagementPanel';
import { BlogManagementModal } from './BlogManagementModal';
import { BlogManagementPanel } from './BlogManagementPanel';
import { BackendConnectionModal } from '../BackendConnectionModal';
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
}

const DEFAULT_STAFF_MEMBERS: WarehouseStaffUser[] = [
  {
    id: 'staff_azarakhsh_super',
    fullName: 'علیرضا آذرخش (مدیر ارشد و مالک)',
    phone: '09120759419',
    pinCode: 'sasha9419',
    role: 'super_admin',
    roleTitleFa: 'مدیریت ارشد بنکداری سوین',
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
    cashier: 'صندوق‌دار مرکزی انبار سوین'
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
    cashier: 'صندوق‌دار مرکزی انبار سوین'
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
    cashier: 'صندوق‌دار مرکزی انبار سوین'
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
    cashier: 'صندوق‌دار مرکزی انبار سوین'
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
    cashier: 'صندوق‌دار مرکزی انبار سوین'
  }
];

export const AccountingPosPanel: React.FC<AccountingPosPanelProps> = ({
  products: initialProducts,
  onUpdateProductsStock,
  onReturnToStore,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sovin_pos_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [loginPhone, setLoginPhone] = useState(AUTHORIZED_PHONE);
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Helper to check staff permissions safely
  const hasStaffPerm = (perm: StaffPermission): boolean => {
    if (currentStaff.role === 'super_admin') return true;
    return currentStaff.permissions?.includes(perm) ?? false;
  };

  type PosSubTab = 'pos' | 'inventory' | 'ledger' | 'customers' | 'reports' | 'monthly_compare' | 'staff_management' | 'customer_app' | 'analytics' | 'tickets' | 'sms_management' | 'notifications' | 'blog';

  const getSubTabFromPath = (pathname: string): PosSubTab => {
    const p = pathname.toLowerCase();
    if (p.includes('/shopmanage/blog') || p.includes('/shopmanage/maghale') || p.includes('/shopmanage/maghalat')) return 'blog';
    if (p.includes('/shopmanage/anbar') || p.includes('/shopmanage/inventory')) return 'inventory';
    if (p.includes('/shopmanage/hesabdari') || p.includes('/shopmanage/ledger')) return 'ledger';
    if (p.includes('/shopmanage/customers') || p.includes('/shopmanage/moshtarian')) return 'customers';
    if (p.includes('/shopmanage/reports') || p.includes('/shopmanage/gozareshat')) return 'reports';
    if (p.includes('/shopmanage/monthly') || p.includes('/shopmanage/compare')) return 'monthly_compare';
    if (p.includes('/shopmanage/staff')) return 'staff_management';
    if (p.includes('/shopmanage/customer-app') || p.includes('/shopmanage/app')) return 'customer_app';
    if (p.includes('/shopmanage/analytics') || p.includes('/shopmanage/amar')) return 'analytics';
    if (p.includes('/shopmanage/tickets') || p.includes('/shopmanage/ticket')) return 'tickets';
    if (p.includes('/shopmanage/sms') || p.includes('/shopmanage/payamak')) return 'sms_management';
    if (p.includes('/shopmanage/notifications') || p.includes('/shopmanage/notif')) return 'notifications';
    if (p.includes('/shopmanage/sandogh') || p.includes('/shopmanage/pos')) return 'pos';
    return 'pos';
  };

  const getPathForSubTab = (tab: PosSubTab): string => {
    const map: Record<PosSubTab, string> = {
      pos: '/shopmanage/sandogh',
      inventory: '/shopmanage/anbar',
      customers: '/shopmanage/customers',
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showBlogManagementModal, setShowBlogManagementModal] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close tools dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
    };
    if (showToolsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
  const [paymentMethod, setPaymentMethod] = useState<'pos_terminal' | 'cash' | 'ledger' | 'split' | 'usd' | 'eur'>('pos_terminal');
  const [foreignCurrencyAmount, setForeignCurrencyAmount] = useState<number>(100);
  const [foreignExchangeRate, setForeignExchangeRate] = useState<number>(71500);
  const [splitPaidAmount, setSplitPaidAmount] = useState<number>(0);
  const [splitPaidVia, setSplitPaidVia] = useState<'pos_terminal' | 'cash'>('pos_terminal');
  const [terminalRef, setTerminalRef] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Currency Exchange Rate settings
  const [usdRate, setUsdRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sovin_usd_rate');
      if (saved) return Number(saved);
    } catch {}
    return 71500;
  });

  const [eurRate, setEurRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sovin_eur_rate');
      if (saved) return Number(saved);
    } catch {}
    return 76000;
  });

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
    name: 'سامانه پیامک هوشمند سوین (Kavenegar Gateway)',
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

  // Sync / Load SMS Data
  useEffect(() => {
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
      } catch (e) {
        console.warn('Error fetching live SMS data:', e);
      } finally {
        setIsSmsLoading(false);
      }
    };
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
    if (!isAuthenticated || !currentStaff || !currentStaff.phone) return;
    setOnlineSessions(prev => {
      const cleanCurrentPhone = String(currentStaff.phone).replace(/\D/g, '');
      const filteredPrev = prev.filter(s => String(s.phone).replace(/\D/g, '') !== cleanCurrentPhone);
      
      const mySession = {
        id: currentStaff.id || `staff_${cleanCurrentPhone}`,
        fullName: currentStaff.fullName,
        phone: currentStaff.phone,
        roleTitleFa: currentStaff.roleTitleFa || 'مدیریت / صندوق',
        role: currentStaff.role || 'staff',
        loginTime: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        avatarColor: currentStaff.avatarColor || 'bg-indigo-600'
      };

      return [mySession, ...filteredPrev];
    });
  }, [isAuthenticated, currentStaff?.phone, currentStaff?.fullName]);

  const [showQuickAddProductModal, setShowQuickAddProductModal] = useState<boolean>(false);
  const [pendingBarcode, setPendingBarcode] = useState<string>('');

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
  const handleQuickAddProduct = (newProduct: CigaretteProduct, addToCartDirectly: boolean) => {
    const updated = [newProduct, ...productsList];
    setProductsList(updated);
    if (onUpdateProductsStock) {
      onUpdateProductsStock(updated);
    }
    if (addToCartDirectly) {
      handleAddProductToPos(newProduct, newProduct.isBoxOnly ? 'box' : 'box');
    }
    setSuccessBanner(`کالای «${newProduct.nameFa}» با موفقیت در انبار و صندوق ثبت شد.`);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handleSaveCurrencyRates = (newUsd: number, newEur: number) => {
    setUsdRate(newUsd);
    setEurRate(newEur);
    try {
      localStorage.setItem('sovin_usd_rate', newUsd.toString());
      localStorage.setItem('sovin_eur_rate', newEur.toString());
    } catch {}
    if (paymentMethod === 'usd') setForeignExchangeRate(newUsd);
    if (paymentMethod === 'eur') setForeignExchangeRate(newEur);
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
        case 'customer_app': return hasStaffPerm('customer_app_connect');
        case 'analytics': return hasStaffPerm('view_reports');
        default: return true;
      }
    };

    if (!isTabAllowed(activeSubTab)) {
      const candidateTabs: PosSubTab[] = ['pos', 'inventory', 'customers', 'reports', 'monthly_compare', 'ledger', 'staff_management', 'tickets', 'sms_management', 'notifications'];
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
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        // Remove item tone - descending triangle pitch
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {}
  };

  // Login handler connected to Django API with loading spinner
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await api.accounts.posLogin(loginPhone, loginPass);
      if (res.success) {
        setIsAuthenticated(true);
        setCurrentStaff(res.data.user);
        setLoginError('');
        try {
          localStorage.setItem('sovin_pos_auth', 'true');
          localStorage.setItem('sovin_pos_current_staff', JSON.stringify(res.data.user));
          
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
    try {
      await api.accounts.posLogout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setOnlineSessions(prev => prev.filter(s => s.phone !== currentStaff.phone));
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('sovin_pos_auth');
      localStorage.removeItem('sovin_pos_current_staff');
    } catch {}
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
        // Barcode not found -> Open Quick Add Product popup with this barcode pre-filled
        setPendingBarcode(query);
        setShowQuickAddProductModal(true);
        setBarcodeInput('');
        setSuccessBanner(`کالایی با بارکد «${query}» در انبار یافت نشد. پاپ‌آپ ایجاد محصول جدید باز گردید.`);
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

    if ((paymentMethod === 'ledger' || paymentMethod === 'split') && !selectedLedgerCustomerId && !customerName) {
      alert('برای فروش حساب دفتری (نسیه) یا پرداخت ترکیبی، انتخاب مشتری الزامی است.');
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
      foreignCurrencyDetails: (paymentMethod === 'usd' || paymentMethod === 'eur') ? {
        currency: paymentMethod.toUpperCase() as 'USD' | 'EUR',
        amount: foreignCurrencyAmount,
        rate: foreignExchangeRate,
        tomanEquivalent: foreignCurrencyAmount * foreignExchangeRate,
      } : undefined,
      terminalRefNumber: terminalRef.trim() || undefined,
      notes: orderNotes.trim() || undefined,
      cashier: 'صندوق‌دار مرکزی انبار سوین',
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
  const handleSaveStockAdjustment = () => {
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

    const updatedProducts = productsList.map(p => {
      if (p.id !== selectedProductForAdjustment.id) return p;
      const newStock = Math.max(0, Math.round((p.stockCartons + finalDeltaCartons) * 1000) / 1000);
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
      finalStockCartons: updatedProducts.find(p => p.id === selectedProductForAdjustment.id)?.stockCartons || 0,
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

    setSelectedProductForAdjustment(null);
    setAdjustNote('');
    setAdjustQuantityCartons(1);
    setAdjustUnit('carton');
  };

  // Quick adjustment (+ / -) by Carton, Box, or Pack in Inventory Table
  const handleQuickAdjustStock = (product: CigaretteProduct, unit: 'carton' | 'box' | 'pack', delta: number) => {
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

    const updatedProducts = productsList.map(p => {
      if (p.id !== product.id) return p;
      const newStock = Math.max(0, Math.round((p.stockCartons + deltaCartons) * 1000) / 1000);
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
      finalStockCartons: updatedProducts.find(p => p.id === product.id)?.stockCartons || 0,
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
  };

  // Create New Product in Store Inventory
  const handleCreateNewProduct = () => {
    if (!newProdNameFa.trim()) return;

    const isCoffeeOrDrink = newProdCategory === 'drinks_coffee';
    
    const newProduct: CigaretteProduct = {
      id: `prod_${Date.now()}`,
      nameFa: newProdNameFa.trim(),
      nameEn: newProdNameEn.trim() || newProdNameFa.trim(),
      brand: newProdBrand.trim() || 'سوین',
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

    const updatedProducts = [newProduct, ...productsList];
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
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              سامانه حسابداری و صندوق فروشگاهی سوین
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              کنترل یکپارچه موجودی انبار، صندوق بارکدخوان POS و ثبت فاکتورهای فروش حضوری
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                شماره همراه مدیر فروشگاه / انباردار
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  dir="ltr"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="09120759419"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-3 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رمز عبور امنیتی
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-3 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-75 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>در حال احراز هویت و ورود...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>ورود به میز کار حسابداری و صندوق</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <button
              onClick={onReturnToStore}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به کاتالوگ فروشگاه آنلاین سوین</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Main POS View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white print:hidden" dir="rtl">
      
      {/* Header Section */}
      <header className="bg-white/95 print:hidden backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[100] px-3 sm:px-6 py-2.5 shadow-md w-full transition-all duration-300">
        <div className="max-w-[1750px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
          
          {/* Logo & Staff Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full md:w-auto shrink-0 gap-1.5 md:gap-4">
            <div className="flex items-center justify-between w-full md:w-auto gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Mobile Menu Toggle Button (Positioned at RTL Start - Right Side) */}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
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
                      سامانه هوشمند سوین (POS)
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
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
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

          {/* Navigation Tabs - Extended Width & Fully Uncropped */}
          <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-stretch md:items-center md:justify-start md:flex-1 gap-1.5 bg-slate-50 md:bg-slate-100 p-2 md:p-1 rounded-2xl border border-slate-200 w-full overflow-x-auto overflow-y-auto max-h-[75vh] md:max-h-none no-scrollbar shadow-lg md:shadow-none min-w-0`}>
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

            <button
              onClick={() => { setActiveSubTab('blog'); setIsMenuOpen(false); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 md:py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                activeSubTab === 'blog'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">مقالات و وبلاگ</span>
            </button>

            {/* Mobile-Only Actions Row inside Menu Drawer */}
            <div className="md:hidden flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 mt-1">
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

            {/* Quick Tools & Actions */}
            <div className="flex items-center justify-center md:justify-end gap-2 relative shrink-0">
              
              {/* Tools & Settings Dropdown */}
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all active:scale-95"
                  title="ابزارها و تنظیمات صندوق"
                >
                  <Settings className="w-4 h-4 text-indigo-600" />
                  <span>ابزارها</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {showToolsDropdown && (
                  <div className="absolute right-0 md:right-auto md:left-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[150] space-y-1 animate-in fade-in zoom-in-95 duration-200">
                    {currentStaff.role === 'super_admin' && (
                      <button
                        onClick={() => { setShowBackendModal(true); setShowToolsDropdown(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50/70 hover:bg-blue-100/90 rounded-xl transition-colors text-right"
                      >
                        <Server className="w-4 h-4 text-blue-600" />
                        <span>اتصال API و وب‌سرویس جنگو</span>
                      </button>
                    )}
                    
                    {(currentStaff.role === 'super_admin' || hasStaffPerm('view_reports')) && (
                      <button
                        onClick={() => { setShowCurrencyRateModal(true); setShowToolsDropdown(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-right"
                      >
                        <Coins className="w-4 h-4 text-blue-600" />
                        <span>تنظیم نرخ ارز (دلار/یورو)</span>
                      </button>
                    )}

                    {hasStaffPerm('customer_app_connect') && (
                      <button
                        onClick={() => { setShowCustomerAppModal(true); setShowToolsDropdown(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-right"
                      >
                        <Smartphone className="w-4 h-4 text-indigo-600" />
                        <span>اتصال اپلیکیشن مشتریان</span>
                      </button>
                    )}

                    <button
                      onClick={() => { setActiveSubTab('blog'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors text-right"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>مدیریت مقالات و وبلاگ</span>
                      </div>
                      <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md font-bold">جنگو</span>
                    </button>

                    <div className="my-1 border-t border-slate-100"></div>

                    {hasStaffPerm('manage_staff') && (
                      <button
                        onClick={() => { setActiveSubTab('staff_management'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors text-right"
                      >
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-emerald-600" />
                          <span>افزودن پرسنل جدید (صفحه مجزا)</span>
                        </div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">جدید</span>
                      </button>
                    )}

                    {hasStaffPerm('manage_tickets') && (
                      <button
                        onClick={() => { setActiveSubTab('tickets'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-right"
                      >
                        <div className="flex items-center gap-2">
                          <Headphones className="w-4 h-4 text-indigo-600" />
                          <span>پشتیبانی تیکت‌ها</span>
                        </div>
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">جنگو</span>
                      </button>
                    )}

                    {hasStaffPerm('send_sms') && (
                      <button
                        onClick={() => { setActiveSubTab('sms_management'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-right"
                      >
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-indigo-600" />
                          <span>سامانه پیامکی کاوه‌نگار</span>
                        </div>
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">جنگو</span>
                      </button>
                    )}

                    {hasStaffPerm('manage_notifications') && (
                      <button
                        onClick={() => { setActiveSubTab('notifications'); setShowToolsDropdown(false); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-right"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-purple-600" />
                          <span>اعلانات و نوتیفیکیشن‌ها</span>
                        </div>
                        <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-bold">جنگو</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'صدا فعال است' : 'صدا قطع است'}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-200 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={onReturnToStore}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition-colors whitespace-nowrap"
            >
              <ArrowRight className="w-4 h-4" />
              <span>کاتالوگ</span>
            </button>

            <button
              onClick={handleLogout}
              title="خروج از پنل حسابداری"
              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs font-black shadow-md flex items-center justify-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successBanner}</span>
        </div>
      )}

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
                            setPendingBarcode('');
                            setShowQuickAddProductModal(true);
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

                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod('usd');
                              setForeignExchangeRate(usdRate);
                            }}
                            className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                              paymentMethod === 'usd'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Coins className="w-4 h-4" />
                            <span>دلار (USD)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod('eur');
                              setForeignExchangeRate(eurRate);
                            }}
                            className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                              paymentMethod === 'eur'
                                ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Coins className="w-4 h-4" />
                            <span>یورو (EUR)</span>
                          </button>
                        </div>
                      </div>

                      {(paymentMethod === 'usd' || paymentMethod === 'eur') && (
                        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-2.5 sm:p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-900 flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-blue-600" />
                              ارز دریافتی ({paymentMethod === 'usd' ? '$ USD' : '€ EUR'}):
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={foreignCurrencyAmount || ''}
                                onChange={(e) => setForeignCurrencyAmount(Math.max(0, Number(e.target.value) || 0))}
                                placeholder="100"
                                className="w-20 sm:w-24 bg-white border border-blue-300 rounded-lg px-2 py-1 text-left font-mono font-bold text-xs text-blue-950 focus:outline-none"
                              />
                              <span className="text-[10px] text-blue-800">{paymentMethod === 'usd' ? '$' : '€'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-blue-800">نرخ روز تبدیل (تومان):</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={foreignExchangeRate || ''}
                                onChange={(e) => setForeignExchangeRate(Math.max(0, Number(e.target.value) || 0))}
                                placeholder="71500"
                                className="w-24 sm:w-28 bg-white border border-blue-300 rounded-lg px-2 py-1 text-left font-mono font-bold text-xs text-blue-950 focus:outline-none"
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
            <motion.div 
              key="inventory-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5">
                  <span className="text-xs text-slate-500 font-bold">ارزش کل انبار</span>
                  <div className="text-lg font-black text-indigo-600 mt-1">{formatToman(totalInventoryValue)}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5">
                  <span className="text-xs text-slate-500 font-bold">کل موجودی (کارتن)</span>
                  <div className="text-lg font-black text-slate-900 mt-1">{formatNumberFa(totalCartonsInStock)} کارتن</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5">
                  <span className="text-xs text-slate-500 font-bold">معادل (باکس / پاکت)</span>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    {formatNumberFa(totalBoxesInStock)} باکس / {formatNumberFa(totalPacksInStock)} پاکت
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5">
                  <span className="text-xs text-slate-500 font-bold">اقلام رو به اتمام</span>
                  <div className="text-lg font-black text-amber-600 mt-1">{formatNumberFa(lowStockCount)} کالا</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">جدول کامل موجودی انبار به تفکیک ۳ واحد</h2>
                    <p className="text-xs text-slate-500 mt-1">کنترل مستقیم و کم/زیاد کردن تعداد کارتن، باکس و پاکت و ثبت ورود بار جدید</p>
                  </div>

                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ تعریف کالا / جنس جدید در انبار</span>
                  </button>
                </div>

                {/* Table of Inventory */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-right text-xs min-w-[780px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-3">تصویر</th>
                        <th className="p-3">نام کالا و نوع فروش</th>
                        <th className="p-3 text-center">کارتن (کلیدی)</th>
                        <th className="p-3 text-center">باکس (تعدیل)</th>
                        <th className="p-3 text-left">قیمت فروش</th>
                        <th className="p-3 text-left">ارزش ریالی</th>
                        <th className="p-3 text-center">وضعیت</th>
                        <th className="p-3 text-center">اصلاح پیشرفته</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {productsList.map((prod) => {
                        const stockInfo = getProductStockInfo(prod);
                        const productTotalVal = prod.stockCartons * prod.cartonPrice;
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <img
                                src={prod.image}
                                alt={prod.nameFa}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-200"
                              />
                            </td>
                            <td className="p-3">
                              <strong className="text-slate-900 text-xs">{prod.nameFa}</strong>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500">{prod.brand} • بارکد: {prod.barcode}</span>
                                {prod.isPosOnly ? (
                                  <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.2 rounded">مخصوص حضوری</span>
                                ) : (
                                  <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.2 rounded">همگام آنلاین</span>
                                )}
                              </div>
                            </td>

                            {/* Carton Stock Stepper */}
                            <td className="p-3 text-center">
                              {prod.category !== 'drinks_coffee' && (
                              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdjustStock(prod, 'carton', 1)}
                                  className="w-5 h-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs flex items-center justify-center"
                                  title="افزایش ۱ کارتن"
                                >
                                  +
                                </button>
                                <span className="font-bold font-mono text-xs text-indigo-700 px-1 min-w-[24px] text-center">
                                  {formatNumberFa(Math.floor(stockInfo.cartons))}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdjustStock(prod, 'carton', -1)}
                                  className="w-5 h-5 bg-white hover:bg-rose-100 text-rose-700 rounded font-bold text-xs flex items-center justify-center border border-slate-200"
                                  title="کاهش ۱ کارتن"
                                >
                                  -
                                </button>
                              </div>
                              )}
                            </td>

                            {/* Box Stock Stepper */}
                            <td className="p-3 text-center">
                              {prod.category !== 'drinks_coffee' && (
                              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdjustStock(prod, 'box', 1)}
                                  className="w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center justify-center"
                                  title="افزایش ۱ باکس"
                                >
                                  +
                                </button>
                                <span className="font-bold font-mono text-xs text-slate-800 px-1 min-w-[30px] text-center">
                                  {formatNumberFa(Math.floor(stockInfo.totalBoxes))}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdjustStock(prod, 'box', -1)}
                                  className="w-5 h-5 bg-white hover:bg-rose-100 text-rose-700 rounded font-bold text-xs flex items-center justify-center border border-slate-200"
                                  title="کاهش ۱ باکس"
                                >
                                  -
                                </button>
                              </div>
                              )}
                            </td>

                            <td className="p-3 text-left font-mono font-bold text-slate-800">
                              {prod.category === 'drinks_coffee' ? (
                                <div>{formatToman(prod.packPrice || prod.boxPrice || 50000)} (تکی)</div>
                              ) : (
                                <>
                                  <div>{formatToman(prod.cartonPrice)}</div>
                                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                    {formatToman(prod.boxPrice)} باکس / {formatToman(prod.packPrice)} پاکت
                                  </div>
                                </>
                              )}
                            </td>
                            <td className="p-3 text-left font-mono font-black text-emerald-600">
                              {formatToman(productTotalVal)}
                            </td>
                            <td className="p-3 text-center">
                              {stockInfo.isAvailable ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                                  {prod.category === 'drinks_coffee' ? `موجود (${formatNumberFa(stockInfo.cartons)} عدد)` : `موجود (${formatNumberFa(Math.floor(stockInfo.cartons))} کارتن)`}
                                </span>
                              ) : (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                                  اتمام موجودی
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {prod.category !== 'drinks_coffee' && (
                              <button
                                onClick={() => {
                                  setSelectedProductForAdjustment(prod);
                                  setAdjustType('stock_in');
                                  setAdjustUnit('carton');
                                  setAdjustQuantityCartons(1);
                                }}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold transition-colors border border-indigo-200 whitespace-nowrap"
                              >
                                ثبت بار / اصلاح
                              </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Movement Audit Log */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-4">گزارش کاردکس و گردش کالا در انبار</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {stockLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">هنوز هیچ لاگ ورود یا خروج باری ثبت نشده است.</p>
                  ) : (
                    stockLogs.map((log) => (
                      <div key={log.id} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{log.productName}</span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{log.date} • {log.note}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-mono font-black ${log.deltaCartons > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {log.deltaCartons > 0 ? `+${log.deltaCartons}` : log.deltaCartons} کارتن
                          </span>
                          <span className="text-[10px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 font-mono">
                            مانده: {log.finalStockCartons} کارتن
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 3: Ledger Accounts & Credit Customers */}
          {activeSubTab === 'customers' && (() => {
            const totalDebtorBalance = posCustomers
              .filter(c => c.balance > 0)
              .reduce((sum, c) => sum + c.balance, 0);
            const totalCreditorBalance = posCustomers
              .filter(c => c.balance < 0)
              .reduce((sum, c) => sum + Math.abs(c.balance), 0);

            const filteredCustomers = posCustomers.filter(cust => {
              const matchesSearch = 
                cust.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                cust.phone.includes(customerSearchQuery) ||
                (cust.city && cust.city.includes(customerSearchQuery)) ||
                (cust.address && cust.address.includes(customerSearchQuery));

              if (!matchesSearch) return false;
              if (customerStatusFilter === 'debtors') return cust.balance > 0;
              if (customerStatusFilter === 'creditors') return cust.balance < 0;
              if (customerStatusFilter === 'settled') return cust.balance === 0;
              return true;
            });

            return (
              <motion.div
                key="customers-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <span>مدیریت پیشرفته حساب‌های دفتری و بدهکاران / بستانکاران</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        ثبت مشتریان نسیه، مانده بدهی، گردش حساب و تسویه با فاکتورهای صندوق
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCustomer(null);
                        setNewCustName('');
                        setNewCustPhone('');
                        setNewCustAddress('');
                        setNewCustCity('تهران');
                        setNewCustNotes('');
                        setNewCustInitialBalance(0);
                        setShowNewCustomerModal(true);
                      }}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-98"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ تعریف مشتری دفتری جدید</span>
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl">
                      <span className="text-xs text-rose-700 font-bold flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        مجموع مطالبات (طلب فروشگاه از بدهکاران)
                      </span>
                      <div className="text-xl font-black text-rose-700 mt-2 font-mono">{formatToman(totalDebtorBalance)}</div>
                      <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                        تعداد مشتریان بدهکار: {posCustomers.filter(c => c.balance > 0).length} نفر
                      </span>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl">
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <Wallet className="w-4 h-4" />
                        مجموع بستانکاری مشتریان
                      </span>
                      <div className="text-xl font-black text-emerald-700 mt-2 font-mono">{formatToman(totalCreditorBalance)}</div>
                      <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                        تعداد بستانکاران: {posCustomers.filter(c => c.balance < 0).length} نفر
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                      <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
                        <Users className="w-4 h-4 text-indigo-600" />
                        کل طرف‌های حساب دفتری
                      </span>
                      <div className="text-xl font-black text-slate-900 mt-2 font-mono">{posCustomers.length} مشتری</div>
                      <span className="text-[10px] text-slate-500 font-bold mt-1 block">
                        حساب‌های کاملاً تسویه: {posCustomers.filter(c => c.balance === 0).length} طرف حساب
                      </span>
                    </div>
                  </div>

                  {/* Search and Filter Row */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="relative w-full md:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type="text"
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        placeholder="جستجوی نام مشتری، شماره تلفن، شهر یا آدرس..."
                        className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                      <button
                        onClick={() => setCustomerStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          customerStatusFilter === 'all'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        همه ({posCustomers.length})
                      </button>
                      <button
                        onClick={() => setCustomerStatusFilter('debtors')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          customerStatusFilter === 'debtors'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        فقط بدهکاران ({posCustomers.filter(c => c.balance > 0).length})
                      </button>
                      <button
                        onClick={() => setCustomerStatusFilter('creditors')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          customerStatusFilter === 'creditors'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        فقط بستانکاران ({posCustomers.filter(c => c.balance < 0).length})
                      </button>
                      <button
                        onClick={() => setCustomerStatusFilter('settled')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          customerStatusFilter === 'settled'
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        تسویه شده ({posCustomers.filter(c => c.balance === 0).length})
                      </button>
                    </div>
                  </div>

                  {/* Customer Cards Grid */}
                  {filteredCustomers.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
                      <p className="text-xs font-bold text-slate-600">مشتری با این مشخصات یافت نشد</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCustomers.map(cust => (
                        <div 
                          key={cust.id} 
                          className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                          <div>
                            {/* Card Top: Name & Badges */}
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                              <div>
                                <h4 className="font-black text-sm text-slate-900 leading-snug">{cust.name}</h4>
                                {cust.phone && cust.phone !== '-' && (
                                  <a 
                                    href={`tel:${cust.phone}`}
                                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-mono mt-0.5 font-bold"
                                    dir="ltr"
                                  >
                                    <PhoneCall className="w-3 h-3" />
                                    <span>{cust.phone}</span>
                                  </a>
                                )}
                              </div>
                              <span 
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap ${
                                  cust.balance > 0 
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                                    : cust.balance < 0 
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                      : 'bg-slate-200/80 text-slate-700'
                                }`}
                              >
                                {cust.balance > 0 ? `بدهکار: ${formatToman(cust.balance)}` : cust.balance < 0 ? `بستانکار: ${formatToman(Math.abs(cust.balance))}` : 'تسویه کامل'}
                              </span>
                            </div>

                            {/* Address / Location */}
                            {cust.address && (
                              <div className="flex items-start gap-1 text-[11px] text-slate-500 mb-2 leading-relaxed">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>{cust.address}</span>
                              </div>
                            )}

                            {/* Notes / Credit Limit */}
                            {cust.notes && (
                              <div className="bg-white/80 border border-slate-200/60 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-600 mb-2 font-bold">
                                📝 {cust.notes}
                              </div>
                            )}

                            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                              <span>افتتاح حساب: {cust.createdAt}</span>
                              {cust.city && <span className="font-bold text-slate-500">📍 {cust.city}</span>}
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditCustomer(cust)}
                                title="ویرایش اطلاعات مشتری"
                                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(cust.id)}
                                title="حذف مشتری"
                                className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setCustomerHistoryModalCust(cust)}
                                className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1"
                              >
                                <History className="w-3.5 h-3.5" />
                                <span>گردش حساب</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedCustomerForPayment(cust);
                                  setPaymentAmount(Math.abs(cust.balance));
                                  setPaymentType(cust.balance >= 0 ? 'credit' : 'debit');
                                }}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                              >
                                تسویه / دریافت وجه
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ledger Transactions Audit History */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <History className="w-4 h-4 text-indigo-600" />
                        <span>آخرین تراکنش‌ها و ریز گردش دفاتر حساب</span>
                      </h3>
                      <span className="text-xs text-slate-500 font-mono font-bold">
                        {ledgerTransactions.length} تراکنش ثبت شده
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {ledgerTransactions.map(tx => {
                        const cust = posCustomers.find(c => c.id === tx.customerId);
                        return (
                          <div key={tx.id} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-100/80 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                tx.type === 'debit' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {tx.type === 'debit' ? 'بدهی' : 'واریز'}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900">{cust?.name || 'مشتری دفتری'}</span>
                                <p className="text-[11px] text-slate-500 mt-0.5">{tx.date} • {tx.description}</p>
                              </div>
                            </div>
                            <span className={`font-mono font-black text-sm ${tx.type === 'debit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {tx.type === 'debit' ? `+${formatToman(tx.amount)}` : `-${formatToman(tx.amount)}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })()}

          {/* TAB 4: Daily & Monthly Sales Reports */}
          {activeSubTab === 'reports' && (
            <motion.div
              key="reports-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Header & Date Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-indigo-600" />
                      <span>سامانه گزارش‌گیری پیشرفته فروش روزانه و ماهانه</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      مشاهده ریز آمار فروش، گزارش تفکیکی تاریخ‌ها، ماه‌ها و عملکرد کالاها با قابلیت استخراج و جزئیات فاکتورها
                    </p>
                  </div>

                  {/* Date Filter Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => { setReportDateFilter('all'); setCustomSearchDate(''); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reportDateFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      کل فاکتورها ({receiptsList.length})
                    </button>
                    <button
                      onClick={() => { setReportDateFilter('today'); setCustomSearchDate(''); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reportDateFilter === 'today' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      امروز (۰۴ شهریور)
                    </button>
                    <button
                      onClick={() => { setReportDateFilter('yesterday'); setCustomSearchDate(''); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reportDateFilter === 'yesterday' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      دیروز (۰۳ شهریور)
                    </button>
                    <button
                      onClick={() => { setReportDateFilter('7days'); setCustomSearchDate(''); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reportDateFilter === '7days' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      ۷ روز اخیر
                    </button>
                    <button
                      onClick={() => { setReportDateFilter('this_month'); setCustomSearchDate(''); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reportDateFilter === 'this_month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      ماه جاری (شهریور ۱۴۰۳)
                    </button>
                    <button
                      onClick={() => { setReportDateFilter('last_month'); setCustomSearchDate(''); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reportDateFilter === 'last_month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      ماه گذشته (مرداد ۱۴۰۳)
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      value={reportSearchQuery}
                      onChange={(e) => setReportSearchQuery(e.target.value)}
                      placeholder="جستجوی نام مشتری، شماره فاکتور یا نام کالا..."
                      className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={customSearchDate}
                      onChange={(e) => {
                        setCustomSearchDate(e.target.value);
                        setReportDateFilter('custom');
                      }}
                      placeholder="فیلتر تاریخ خاص (مثال: 1403/06/04)"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 text-xs font-bold text-slate-500">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <span>تعداد فاکتورهای یافت شده: <strong className="text-slate-900 font-mono text-sm">{filteredReceiptsForReports.length}</strong> فاکتور</span>
                  </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 p-4 rounded-2xl shadow-2xs">
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                      مجموع درآمد کل دوره
                    </span>
                    <div className="text-xl font-black text-indigo-700 mt-1.5">{formatToman(reportMetrics.totalSales)}</div>
                    <span className="text-[10px] text-indigo-900/60 font-mono mt-1 block font-bold">تعداد کل فاکتورها: {reportMetrics.count}</span>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 p-4 rounded-2xl shadow-2xs">
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      فروش دستگاه کارتخوان (POS)
                    </span>
                    <div className="text-xl font-black text-blue-700 mt-1.5">{formatToman(reportMetrics.posTerminalSales)}</div>
                    <span className="text-[10px] text-blue-900/60 font-mono mt-1 block font-bold">
                      {reportMetrics.totalSales > 0 ? `${Math.round((reportMetrics.posTerminalSales / reportMetrics.totalSales) * 100)}٪ از کل فروش` : '۰٪'}
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-100 p-4 rounded-2xl shadow-2xs">
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      فروش نقدی (وجه نقد)
                    </span>
                    <div className="text-xl font-black text-emerald-700 mt-1.5">{formatToman(reportMetrics.cashSales)}</div>
                    <span className="text-[10px] text-emerald-900/60 font-mono mt-1 block font-bold">
                      {reportMetrics.totalSales > 0 ? `${Math.round((reportMetrics.cashSales / reportMetrics.totalSales) * 100)}٪ از کل فروش` : '۰٪'}
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-100 p-4 rounded-2xl shadow-2xs">
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                      فروش حساب دفتری (نسیه)
                    </span>
                    <div className="text-xl font-black text-purple-700 mt-1.5">{formatToman(reportMetrics.ledgerSales)}</div>
                    <span className="text-[10px] text-purple-900/60 font-mono mt-1 block font-bold">
                      {reportMetrics.totalSales > 0 ? `${Math.round((reportMetrics.ledgerSales / reportMetrics.totalSales) * 100)}٪ از کل فروش` : '۰٪'}
                    </span>
                  </div>
                </div>

                {/* Stock Outflow Summary Pills */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black">حجم کلی بار و مقادیر خروجی از انبار در این بازه:</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">تفکیک دقیق واحدهای کارتنی، باکسی و پاکتی تحویل داده شده به مشتریان</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center font-mono">
                    <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-sans">کارتن فروخته شده</span>
                      <span className="text-indigo-400 text-base font-black">{formatNumberFa(reportMetrics.cartonsSold)}</span>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-sans">باکس فروخته شده</span>
                      <span className="text-emerald-400 text-base font-black">{formatNumberFa(reportMetrics.boxesSold)}</span>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-sans">پاکت فروخته شده</span>
                      <span className="text-amber-400 text-base font-black">{formatNumberFa(reportMetrics.packsSold)}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Tab Navigation for Reports */}
                <div className="border-b border-slate-200 flex items-center gap-2 sm:gap-4 text-xs font-bold pt-2 overflow-x-auto whitespace-nowrap pb-1">
                  <button
                    onClick={() => setReportSubTab('daily')}
                    className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${reportSubTab === 'daily' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>🗓️ گزارش فروش روزانه (بر اساس تاریخ)</span>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-mono">{dailySalesGrouped.length} روز</span>
                  </button>

                  <button
                    onClick={() => setReportSubTab('monthly')}
                    className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${reportSubTab === 'monthly' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  >
                    <CalendarRange className="w-4 h-4" />
                    <span>📅 گزارش فروش ماهانه (بر اساس ماه)</span>
                    <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-mono">{monthlySalesGrouped.length} ماه</span>
                  </button>

                  <button
                    onClick={() => setReportSubTab('products')}
                    className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${reportSubTab === 'products' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  >
                    <Package className="w-4 h-4" />
                    <span>🛍️ ریز گزارش اقلام فروخته شده (محصولات)</span>
                  </button>

                  <button
                    onClick={() => setReportSubTab('receipts')}
                    className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${reportSubTab === 'receipts' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>🧾 لیست تمام فاکتورهای این بازه</span>
                  </button>
                </div>

                {/* SUB-VIEW 1: DAILY SALES TABLE */}
                {reportSubTab === 'daily' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-black text-slate-900">جدول تفکیکی فروش روز به روز (بر اساس تاریخ شمسی)</h3>
                      <span className="text-xs text-slate-500">جهت مشاهده ریز فاکتورهای هر روز، روی دکمه «ریز گزارش روزانه» کلیک کنید.</span>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
                      <table className="w-full text-right text-xs min-w-[720px]">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">تاریخ فروش</th>
                            <th className="p-3 text-center">تعداد فاکتور</th>
                            <th className="p-3">فروش کارتخوان</th>
                            <th className="p-3">فروش نقدی</th>
                            <th className="p-3">حساب دفتری (نسیه)</th>
                            <th className="p-3 text-center">حجم بار خروجی</th>
                            <th className="p-3">مجموع فروش روز</th>
                            <th className="p-3 text-center">عملیات & ریز گزارش</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dailySalesGrouped.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-slate-400">
                                هیچ تراکنش و فاکتور فروشی برای این بازه یافت نشد.
                              </td>
                            </tr>
                          ) : (
                            dailySalesGrouped.map((day) => (
                              <tr key={day.date} className="hover:bg-indigo-50/40 transition-colors">
                                <td className="p-3 font-mono font-black text-indigo-900 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>{day.date}</span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold">
                                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                                    {day.receipts.length} فاکتور
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-blue-700 font-bold">{formatToman(day.posSales)}</td>
                                <td className="p-3 font-mono text-emerald-700 font-bold">{formatToman(day.cashSales)}</td>
                                <td className="p-3 font-mono text-purple-700 font-bold">{formatToman(day.ledgerSales)}</td>
                                <td className="p-3 text-center font-mono text-[11px]">
                                  {day.cartons > 0 && <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold ml-1">{day.cartons} کارتن</span>}
                                  {day.boxes > 0 && <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold ml-1">{day.boxes} باکس</span>}
                                  {day.packs > 0 && <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{day.packs} پاکت</span>}
                                </td>
                                <td className="p-3 font-mono font-black text-sm text-indigo-600">{formatToman(day.totalSales)}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => setSelectedDateForDetailModal(day.date)}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 mx-auto"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>ریز گزارش روزانه</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 2: MONTHLY SALES TABLE */}
                {reportSubTab === 'monthly' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-black text-slate-900">جدول خلاصه عملکرد ماهانه فروشگاه (ماه به ماه)</h3>
                      <span className="text-xs text-slate-500">تحلیل درآمد کل ماه‌ها و میانگین فروش روزانه هر ماه</span>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
                      <table className="w-full text-right text-xs min-w-[720px]">
                        <thead className="bg-purple-50 text-purple-900 font-bold border-b border-purple-200">
                          <tr>
                            <th className="p-3">ماه و سال</th>
                            <th className="p-3 text-center">روزهای کاری فعال</th>
                            <th className="p-3 text-center">تعداد فاکتورها</th>
                            <th className="p-3">میانگین فروش روزانه</th>
                            <th className="p-3">فروش کارتخوان</th>
                            <th className="p-3">فروش نقدی و دفتری</th>
                            <th className="p-3">درآمد کل ماه</th>
                            <th className="p-3 text-center">جزئیات کامل ماه</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {monthlySalesGrouped.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-slate-400">
                                اطلاعاتی برای این ماه ثبت نشده است.
                              </td>
                            </tr>
                          ) : (
                            monthlySalesGrouped.map((m) => {
                              const avgDaily = Math.round(m.totalSales / (m.activeDaysCount || 1));
                              return (
                                <tr key={m.monthKey} className="hover:bg-purple-50/40 transition-colors">
                                  <td className="p-3 font-black text-purple-950 flex items-center gap-2">
                                    <CalendarRange className="w-4 h-4 text-purple-600" />
                                    <span>{m.monthName}</span>
                                  </td>
                                  <td className="p-3 text-center font-mono font-bold text-slate-700">{m.activeDaysCount} روز</td>
                                  <td className="p-3 text-center font-mono font-bold text-slate-700">{m.receipts.length} فاکتور</td>
                                  <td className="p-3 font-mono font-bold text-slate-600">{formatToman(avgDaily)}</td>
                                  <td className="p-3 font-mono text-blue-700 font-bold">{formatToman(m.posSales)}</td>
                                  <td className="p-3 font-mono text-emerald-700 font-bold">{formatToman(m.cashSales + m.ledgerSales)}</td>
                                  <td className="p-3 font-mono font-black text-sm text-purple-700">{formatToman(m.totalSales)}</td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => setSelectedMonthForDetailModal(m.monthKey)}
                                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 mx-auto"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>ریز گزارش ماهانه</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 3: PRODUCTS SALES BREAKDOWN */}
                {reportSubTab === 'products' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-black text-slate-900">گزارش خروجی کالاها و رتبه‌بندی اقلام پرفروش</h3>
                      <span className="text-xs text-slate-500">تفکیک دقیق تعداد کارتن، باکس و پاکت فروخته شده هر محصول</span>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
                      <table className="w-full text-right text-xs min-w-[700px]">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">رتبه</th>
                            <th className="p-3">نام فارسی کالا</th>
                            <th className="p-3">برند / دسته</th>
                            <th className="p-3 text-center">کارتن فروخته شده</th>
                            <th className="p-3 text-center">باکس فروخته شده</th>
                            <th className="p-3 text-center">پاکت فروخته شده</th>
                            <th className="p-3">مجموع درآمد کل محصول</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {productSalesGrouped.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400">
                                هیچ کالایی در این بازه فروخته نشده است.
                              </td>
                            </tr>
                          ) : (
                            productSalesGrouped.map((prod, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-mono font-bold text-slate-400 text-center">{idx + 1}</td>
                                <td className="p-3 font-black text-slate-900">{prod.productName}</td>
                                <td className="p-3 text-slate-500">{prod.brand}</td>
                                <td className="p-3 text-center font-mono font-bold text-indigo-700">{prod.cartons > 0 ? `${prod.cartons} کارتن` : '-'}</td>
                                <td className="p-3 text-center font-mono font-bold text-slate-800">{prod.boxes > 0 ? `${prod.boxes} باکس` : '-'}</td>
                                <td className="p-3 text-center font-mono font-bold text-emerald-700">{prod.packs > 0 ? `${prod.packs} پاکت` : '-'}</td>
                                <td className="p-3 font-mono font-black text-indigo-600">{formatToman(prod.totalRevenue)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 4: RECEIPTS AUDIT LIST */}
                {reportSubTab === 'receipts' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-black text-slate-900">لیست تمام فاکتورهای فروش در این بازه انتخاب شده</h3>
                      <span className="text-xs text-slate-500">قابلیت مشاهده فیش، چاپ مجدد و بررسی روش تسویه</span>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
                      <table className="w-full text-right text-xs min-w-[700px]">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">شماره فاکتور</th>
                            <th className="p-3">تاریخ و زمان</th>
                            <th className="p-3">نام خریدار / مشتری</th>
                            <th className="p-3">روش تسویه</th>
                            <th className="p-3 text-center">تعداد اقلام</th>
                            <th className="p-3">مبلغ کل فاکتور</th>
                            <th className="p-3 text-center">چاپ فیش</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredReceiptsForReports.map((rcpt) => (
                            <tr key={rcpt.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-mono font-bold text-indigo-700">{rcpt.receiptNumber}</td>
                              <td className="p-3 font-mono text-slate-600">{rcpt.createdAt}</td>
                              <td className="p-3 font-bold text-slate-900">{rcpt.customerName}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  rcpt.paymentMethod === 'pos_terminal' ? 'bg-blue-100 text-blue-800' :
                                  rcpt.paymentMethod === 'cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {rcpt.paymentMethod === 'pos_terminal' ? 'کارتخوان' : rcpt.paymentMethod === 'cash' ? 'نقدی' : 'حساب دفتری'}
                                </span>
                              </td>
                              <td className="p-3 text-center font-mono font-bold">{rcpt.items.length} آیتم</td>
                              <td className="p-3 font-mono font-black text-indigo-600">{formatToman(rcpt.finalTotal)}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => setActiveReceiptToPrint(rcpt)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 mx-auto"
                                >
                                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>فیش</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* TAB 5: Sales Receipts Ledger & Print */}
          {activeSubTab === 'ledger' && (
            <motion.div
              key="ledger-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">دفتر فاکتورهای فروش و تراکنش‌های صندوق</h2>
                    <p className="text-xs text-slate-500 mt-1">مشاهده فاکتورهای صادر شده، چاپ مجدد فاکتور فروش و ریز اقلام مشتریان</p>
                  </div>
                </div>

                {receiptsList.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold">هنوز فاکتور فروشی از صندوق صادر نشده است.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receiptsList.map((rcpt) => (
                      <div
                        key={rcpt.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-400 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 font-mono">{rcpt.receiptNumber}</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                              {rcpt.paymentMethod === 'pos_terminal' ? 'کارتخوان' : rcpt.paymentMethod === 'cash' ? 'نقدی' : 'حساب دفتری'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            خریدار: <strong className="text-slate-800">{rcpt.customerName}</strong> • زمان ثبت: <span className="font-mono">{rcpt.createdAt}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            اقلام: {rcpt.items.map(i => `${i.product.nameFa} (${i.quantity} ${i.unit === 'carton' ? 'کارتن' : i.unit === 'box' ? 'باکس' : 'پاکت'})`).join('، ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <p className="text-[10px] text-slate-500 font-medium">مبلغ کل فاکتور</p>
                            <p className="text-sm font-black text-emerald-600 font-mono">{formatToman(rcpt.finalTotal)}</p>
                          </div>

                          <button
                            onClick={() => setActiveReceiptToPrint(rcpt)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                          >
                            <Printer className="w-4 h-4" />
                            <span>چاپ فیش</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

          {/* TAB: SMS Gateway Management */}
          {activeSubTab === 'sms_management' && (
            <motion.div
              key="sms-management-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              dir="rtl"
              className="space-y-6"
            >
              {/* Permission check */}
              {!(currentStaff.role === 'super_admin' || currentStaff.permissions?.includes('send_sms')) ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 text-3xl">
                    🔒
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900">عدم دسترسی به پنل پیامکی کاوه‌نگار</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      شمای کاربری فعلی شما ({currentStaff.fullName}) فاقد دسترسی «ارسال و مدیریت پیامک» است. لطفاً از طریق دکمه زیر سطح دسترسی را ارتقا دهید.
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
                <div className="space-y-6">
                  {/* Top Notification Banner */}
                  {smsSuccessMessage && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
                      <span>✓</span>
                      <span>{smsSuccessMessage}</span>
                    </div>
                  )}

                  {smsErrorMessage && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
                      <span>⚠️</span>
                      <span>{smsErrorMessage}</span>
                    </div>
                  )}

                  {/* Sub-Tab Navigation Header */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSmsSubTab('settings_patterns')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                          smsSubTab === 'settings_patterns'
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        <span>⚙️</span>
                        <span>تنظیمات درگاه و پترن‌ها (Gateway & Patterns)</span>
                      </button>

                      <button
                        onClick={() => setSmsSubTab('sms_logs')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all relative ${
                          smsSubTab === 'sms_logs'
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        <span>📜</span>
                        <span>تاریخچه و لاگ‌های دیتابیس پیامک (SMS Database Logs)</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          smsSubTab === 'sms_logs' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {smsLogs.length}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold px-3 py-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>سرویس کاوه‌نگار: متصل به دیتابیس جنگو</span>
                    </div>
                  </div>

                  {/* SUB-TAB 1: Gateway Settings & Patterns */}
                  {smsSubTab === 'settings_patterns' && (
                    <div className="space-y-6">
                      {/* Gateway Core Settings Card */}
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div>
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                              <span>🔑</span>
                              <span>تنظیمات وب‌سرویس کاوه‌نگار (Kavenegar SMS Gateway)</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              پیکربندی کلید API در جدول <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-[11px]">KavenegarSMSSetting</code> در پایگاه‌داده جنگو
                            </p>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>درگاه فعال</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Setting: Gateway Title */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700">نام سامانه پیامکی:</label>
                            <input
                              type="text"
                              value={kavenegarConfig.name}
                              onChange={(e) => setKavenegarConfig(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                              placeholder="مثال: سامانه پیامک هوشمند سوین"
                            />
                          </div>

                          {/* Setting: API Token */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-700">کلید وب‌سرویس (API Token):</label>
                              <button
                                type="button"
                                onClick={() => setShowApiToken(!showApiToken)}
                                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold"
                              >
                                {showApiToken ? 'مخفی‌سازی' : 'نمایش کلید'}
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                type={showApiToken ? 'text' : 'password'}
                                value={kavenegarConfig.api_token}
                                onChange={(e) => setKavenegarConfig(prev => ({ ...prev, api_token: e.target.value }))}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                placeholder="توکن دریافتی از پنل کاوه‌نگار"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Toggles & Save Button */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                          <div className="flex flex-wrap items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={kavenegarConfig.is_active}
                                onChange={(e) => setKavenegarConfig(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                              />
                              <span className="text-xs font-black text-slate-800">فعال بودن درگاه پیامک</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={kavenegarConfig.debug_mode}
                                onChange={(e) => setKavenegarConfig(prev => ({ ...prev, debug_mode: e.target.checked }))}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                              />
                              <span className="text-xs font-black text-slate-800">حالت اشکال‌زدایی / شبیه‌ساز بدون کسر شارژ</span>
                            </label>
                          </div>

                          <button
                            onClick={async () => {
                              try {
                                setIsSmsLoading(true);
                                const res = await djangoSaveKavenegarSettings(kavenegarConfig, crmConfig);
                                if (res) {
                                  setSmsSuccessMessage('تنظیمات درگاه کاوه‌نگار با موفقیت در پایگاه‌داده جنگو ذخیره شد.');
                                  setTimeout(() => setSmsSuccessMessage(''), 4000);
                                }
                              } catch {
                                setSmsErrorMessage('خطا در ذخیره‌سازی تنظیمات درگاه.');
                                setTimeout(() => setSmsErrorMessage(''), 4000);
                              } finally {
                                setIsSmsLoading(false);
                              }
                            }}
                            disabled={isSmsLoading}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
                          >
                            <span>💾 ذخیره تنظیمات درگاه در سرور جنگو</span>
                          </button>
                        </div>
                      </div>

                      {/* Patterns Configuration Grid */}
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                              <span>📑</span>
                              <span>پترن‌ها و الگوهای خدماتی کاوه‌نگار (Pattern Templates)</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              ثبت کد پترن انگلیسی برای هر بخش مطابق با تاییدیه وب‌سرویس خدماتی کاوه‌نگار (<code className="font-mono text-indigo-600 text-[11px]">SMSPattern</code> Model)
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3 self-start sm:self-auto">
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full font-mono">
                              {smsPatterns.length} الگو تعریف شده
                            </span>

                            <button
                              onClick={async () => {
                                try {
                                  setIsSavingAllPatterns(true);
                                  const res = await djangoSaveAllSmsPatterns(smsPatterns, crmConfig);
                                  if (res) {
                                    setSmsSuccessMessage('تمامی کدهای پترن با موفقیت در پایگاه‌داده جنگو ذخیره و فعال شدند.');
                                    setTimeout(() => setSmsSuccessMessage(''), 4000);
                                  } else {
                                    setSmsErrorMessage('خطا در ذخیره‌سازی گروهی پترن‌ها.');
                                    setTimeout(() => setSmsErrorMessage(''), 4000);
                                  }
                                } catch {
                                  setSmsErrorMessage('خطای ارتباطی در ذخیره پترن‌ها.');
                                  setTimeout(() => setSmsErrorMessage(''), 4000);
                                } finally {
                                  setIsSavingAllPatterns(false);
                                }
                              }}
                              disabled={isSavingAllPatterns || isSmsLoading}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
                            >
                              {isSavingAllPatterns ? (
                                <span>در حال ذخیره...</span>
                              ) : (
                                <>
                                  <span>💾</span>
                                  <span>ذخیره همه الگوها</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {isSmsLoading && smsPatterns.length === 0 ? (
                          <div className="text-center py-12 text-xs text-slate-500">در حال دریافت الگوها از پایگاه‌داده...</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {smsPatterns.map((p) => {
                              const isSaving = Boolean(savingPatternKey[p.name_fa]);
                              const isSaved = Boolean(savedPatternKey[p.name_fa]);

                              const handleSaveSingle = async () => {
                                try {
                                  setSavingPatternKey(prev => ({ ...prev, [p.name_fa]: true }));
                                  const sRes = await djangoSaveSmsPattern(p.name_fa, p.pattern_code, crmConfig);
                                  if (sRes) {
                                    setSavedPatternKey(prev => ({ ...prev, [p.name_fa]: true }));
                                    setSmsSuccessMessage(`کد پترن «${p.title_fa || p.name_fa}» با موفقیت در دیتابیس ذخیره شد.`);
                                    setTimeout(() => {
                                      setSavedPatternKey(prev => ({ ...prev, [p.name_fa]: false }));
                                    }, 2500);
                                    setTimeout(() => setSmsSuccessMessage(''), 3500);
                                  } else {
                                    setSmsErrorMessage('خطا در ذخیره‌سازی الگو.');
                                    setTimeout(() => setSmsErrorMessage(''), 3500);
                                  }
                                } catch {
                                  setSmsErrorMessage('خطای ارتباطی با وب‌سرویس.');
                                  setTimeout(() => setSmsErrorMessage(''), 3500);
                                } finally {
                                  setSavingPatternKey(prev => ({ ...prev, [p.name_fa]: false }));
                                }
                              };

                              return (
                                <div
                                  key={p.id || p.name_fa}
                                  className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/40 hover:bg-white hover:border-indigo-300 transition-all shadow-xs space-y-3.5 relative flex flex-col justify-between"
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="text-xs font-black text-slate-950">
                                        {p.title_fa || p.name_fa}
                                      </h4>
                                      <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">
                                        {p.name_fa}
                                      </span>
                                    </div>

                                    <div className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100/80 leading-relaxed font-mono">
                                      <span className="font-sans font-bold text-slate-700">متغیرها: </span>
                                      {p.tokens_info || 'token, token2, token3'}
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 pt-1">
                                    <label className="text-[11px] font-black text-slate-700 flex items-center justify-between">
                                      <span>کد پترن انگلیسی (Pattern Code):</span>
                                      <span className="text-[10px] text-slate-400 font-mono">Kavenegar Template</span>
                                    </label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={p.pattern_code || ''}
                                        onChange={(e) => {
                                          const newVal = e.target.value;
                                          setSmsPatterns(prev => prev.map(item => item.name_fa === p.name_fa ? { ...item, pattern_code: newVal } : item));
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSaveSingle();
                                          }
                                        }}
                                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. pos_receipt_sms"
                                        dir="ltr"
                                      />
                                      <button
                                        onClick={handleSaveSingle}
                                        disabled={isSaving}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1 min-w-[65px] ${
                                          isSaved
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white'
                                        }`}
                                        title="ذخیره کد پترن در دیتابیس (Enter)"
                                      >
                                        {isSaving ? (
                                          <span className="text-[11px]">...</span>
                                        ) : isSaved ? (
                                          <span>✓ ذخیره شد</span>
                                        ) : (
                                          <span>ذخیره</span>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: SMS Database Logs (Django Admin Style) */}
                  {smsSubTab === 'sms_logs' && (
                    <div className="space-y-6">
                      {/* Summary Metric Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
                          <span className="text-[11px] font-bold text-slate-500">کل پیامک‌های ارسالی</span>
                          <div className="text-xl font-black text-slate-900 font-mono">{smsLogs.length}</div>
                        </div>

                        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
                          <span className="text-[11px] font-bold text-emerald-600">رسیده به گوشی (Delivered)</span>
                          <div className="text-xl font-black text-emerald-700 font-mono">
                            {smsLogs.filter(l => l.status === 'delivered').length}
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
                          <span className="text-[11px] font-bold text-amber-600">در صف ارسال (Queued)</span>
                          <div className="text-xl font-black text-amber-700 font-mono">
                            {smsLogs.filter(l => l.status === 'queued' || l.status === 'sent').length}
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
                          <span className="text-[11px] font-bold text-indigo-600">مجموع هزینه ریالی</span>
                          <div className="text-xl font-black text-indigo-700 font-mono">
                            {smsLogs.reduce((acc, curr) => acc + (curr.cost_rial || 0), 0).toLocaleString()} <span className="text-xs font-sans">ریال</span>
                          </div>
                        </div>
                      </div>

                      {/* Main Logs Table Container */}
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
                        {/* Table Controls / Filters */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div>
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                              <span>📊</span>
                              <span>لاگ و تاریخچه پیامک‌های ارسالی دیتابیس (SmsLog Table)</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              دقیقاً مطابق با فیلدهای مدل جنگو <code className="font-mono text-indigo-600 text-[11px]">SmsLog</code> همراه با شناسه پیامک و وضعیت تحویل
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Search Filter */}
                            <div className="relative min-w-[220px]">
                              <input
                                type="text"
                                value={smsSearch}
                                onChange={(e) => setSmsSearch(e.target.value)}
                                placeholder="جستجو شماره، پترن، شناسه..."
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                              />
                              <span className="absolute right-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
                            </div>

                            {/* Status Filter */}
                            <select
                              value={smsStatusFilter}
                              onChange={(e: any) => setSmsStatusFilter(e.target.value)}
                              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="all">تمام وضعیت‌ها</option>
                              <option value="delivered">رسیده به گوشی (Delivered)</option>
                              <option value="queued">در صف ارسال (Queued)</option>
                              <option value="failed">ناموفق (Failed)</option>
                            </select>

                            {/* Refresh Button */}
                            <button
                              onClick={async () => {
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
                              disabled={isSmsLoading}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors active:scale-95 flex items-center gap-1.5"
                            >
                              <span>🔄</span>
                              <span>به‌روزرسانی لاگ‌ها</span>
                            </button>
                          </div>
                        </div>

                        {/* Logs Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-black bg-slate-50/70">
                                <th className="py-3 px-3"># شناسه</th>
                                <th className="py-3 px-3">زمان ارسال (شمسی)</th>
                                <th className="py-3 px-3">شماره گیرنده</th>
                                <th className="py-3 px-3">پترن / قالب</th>
                                <th className="py-3 px-3">توکن‌های ارسالی</th>
                                <th className="py-3 px-3">شناسه کاوه‌نگار</th>
                                <th className="py-3 px-3">وضعیت تحویل</th>
                                <th className="py-3 px-3">هزینه</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {smsLogs
                                .filter(log => {
                                  if (smsStatusFilter !== 'all' && log.status !== smsStatusFilter) return false;
                                  const q = smsSearch.trim().toLowerCase();
                                  if (!q) return true;
                                  return (
                                    (log.recipient_phone || log.recipient || '').toLowerCase().includes(q) ||
                                    (log.pattern || '').toLowerCase().includes(q) ||
                                    (log.pattern_code || '').toLowerCase().includes(q) ||
                                    (log.kavenegar_message_id || '').toLowerCase().includes(q)
                                  );
                                })
                                .map((log, idx) => {
                                  const isDelivered = log.status === 'delivered';
                                  const isFailed = log.status === 'failed';
                                  const isQueued = log.status === 'queued';

                                  // Format Shamsi date
                                  let shamsiDate = '-';
                                  if (log.created_at) {
                                    try {
                                      shamsiDate = new Intl.DateTimeFormat('fa-IR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      }).format(new Date(log.created_at));
                                    } catch {
                                      shamsiDate = log.created_at;
                                    }
                                  }

                                  const tokens = log.tokens_sent || {};

                                  return (
                                    <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                                      {/* ID */}
                                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 font-bold">
                                        {log.id}
                                      </td>

                                      {/* Date */}
                                      <td className="py-3 px-3 font-mono text-slate-700 text-[11px] whitespace-nowrap">
                                        {shamsiDate}
                                      </td>

                                      {/* Recipient */}
                                      <td className="py-3 px-3 font-mono font-bold text-slate-900" dir="ltr">
                                        {log.recipient_phone || log.recipient}
                                      </td>

                                      {/* Pattern */}
                                      <td className="py-3 px-3">
                                        <div className="font-bold text-slate-900 text-xs">{log.pattern || '-'}</div>
                                        {log.pattern_code && (
                                          <div className="font-mono text-[10px] text-indigo-600">{log.pattern_code}</div>
                                        )}
                                      </td>

                                      {/* Tokens */}
                                      <td className="py-3 px-3">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                          {tokens.token && (
                                            <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                              T1: {tokens.token}
                                            </span>
                                          )}
                                          {tokens.token2 && (
                                            <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                              T2: {tokens.token2}
                                            </span>
                                          )}
                                          {tokens.token3 && (
                                            <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                              T3: {tokens.token3}
                                            </span>
                                          )}
                                          {!tokens.token && !tokens.token2 && !tokens.token3 && (
                                            <span className="text-slate-400 text-[11px]">-</span>
                                          )}
                                        </div>
                                      </td>

                                      {/* Message ID */}
                                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600" dir="ltr">
                                        {log.kavenegar_message_id || '-'}
                                      </td>

                                      {/* Status Badge */}
                                      <td className="py-3 px-3 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                          isDelivered ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                          isFailed ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                          isQueued ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                          'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${
                                            isDelivered ? 'bg-emerald-500' :
                                            isFailed ? 'bg-rose-500' :
                                            isQueued ? 'bg-amber-500' : 'bg-blue-500'
                                          }`}></span>
                                          <span>
                                            {isDelivered ? 'رسیده به گوشی' : isFailed ? 'خطا در ارسال' : isQueued ? 'در صف ارسال' : 'ارسال‌شده'}
                                          </span>
                                        </span>
                                      </td>

                                      {/* Cost */}
                                      <td className="py-3 px-3 font-mono text-slate-700 text-[11px] whitespace-nowrap">
                                        {(log.cost_rial || 240).toLocaleString()} ریال
                                      </td>
                                    </tr>
                                  );
                                })}

                              {smsLogs.length === 0 && (
                                <tr>
                                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                                    هنوز هیچ لاگ پیامکی در دیتابیس ثبت نشده است.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
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
                <div className="font-black text-lg text-slate-900 mb-1">فروشگاه و پخش سوین</div>
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
                    {activeReceiptToPrint.paymentMethod === 'pos_terminal' 
                      ? 'کارتخوان بانکی' 
                      : activeReceiptToPrint.paymentMethod === 'cash' 
                        ? 'پرداخت نقدی' 
                        : activeReceiptToPrint.paymentMethod === 'ledger'
                          ? 'حساب دفتری (نسیه)'
                          : activeReceiptToPrint.paymentMethod === 'usd' || activeReceiptToPrint.paymentMethod === 'eur'
                            ? `پرداخت ارزی (${activeReceiptToPrint.foreignCurrencyDetails?.currency}): ${activeReceiptToPrint.foreignCurrencyDetails?.amount} (نرخ: ${formatNumberFa(activeReceiptToPrint.foreignCurrencyDetails?.rate || 0)})`
                            : `ترکیبی (${activeReceiptToPrint.splitPaymentDetails ? `پرداخت: ${formatToman(activeReceiptToPrint.splitPaymentDetails.paidNow)} / دفتری: ${formatToman(activeReceiptToPrint.splitPaymentDetails.remainingToLedger)}` : 'نقد + نسیه'})`}
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
                  تحلیل هوشمند سوین
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
                    لیست حساب‌های فعال همزمان در سیستم حسابداری سوین ({
                      Array.from(new Map(onlineSessions.map(s => [String(s.phone || s.id).replace(/\D/g, ''), s])).values()).length
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
              {Array.from(new Map(onlineSessions.map(s => [String(s.phone || s.id).replace(/\D/g, ''), s])).values()).map((session) => {
                const sessionCleanPhone = String(session.phone || '').replace(/\D/g, '');
                const currentStaffCleanPhone = String(currentStaff.phone || '').replace(/\D/g, '');
                const isMe = sessionCleanPhone === currentStaffCleanPhone || session.phone === currentStaff.phone;

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
            className="bg-white border border-slate-200 rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    تنظیم نرخ ارز (دلار و یورو)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تعیین نرخ مبادله‌ای ارز برای تسویه فاکتورها
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCurrencyRateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  نرخ دلار آمریکا (USD به تومان)
                </label>
                <input
                  type="number"
                  defaultValue={usdRate}
                  id="modal_usd_rate"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm font-bold"
                  placeholder="مثال: 71500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  نرخ یورو اروپا (EUR به تومان)
                </label>
                <input
                  type="number"
                  defaultValue={eurRate}
                  id="modal_eur_rate"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm font-bold"
                  placeholder="مثال: 76000"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCurrencyRateModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  const uInput = (document.getElementById('modal_usd_rate') as HTMLInputElement)?.value;
                  const eInput = (document.getElementById('modal_eur_rate') as HTMLInputElement)?.value;
                  const newU = Number(uInput) || usdRate;
                  const newE = Number(eInput) || eurRate;
                  handleSaveCurrencyRates(newU, newE);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                ذخیره تنظیمات نرخ
              </button>
            </div>
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

    </div>
  );
};
