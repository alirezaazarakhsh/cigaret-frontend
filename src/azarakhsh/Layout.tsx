import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Settings, 
  Sliders,
  Globe, 
  UserCheck, 
  Layers, 
  Package, 
  ShoppingCart, 
  Truck, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Search, 
  LogOut, 
  ArrowLeft, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  FolderTree,
  Terminal,
  FileCode,
  Check,
  BadgeDollarSign,
  Coins,
  Archive,
  BarChart3,
  Bell,
  Image,
  MonitorSmartphone
} from 'lucide-react';
import { AzarakhshSectionId, DocSectionMeta, DocGroup } from './types';

interface AzarakhshLayoutProps {
  activeSection: AzarakhshSectionId;
  onSelectSection: (id: AzarakhshSectionId) => void;
  onLogout: () => void;
  onReturnToApp: () => void;
  children: React.ReactNode;
}

export const AZARAKHSH_SECTIONS: DocSectionMeta[] = [
  // Group 1: Setup & Infrastructure (1 to 4)
  {
    id: 'zero-to-hero',
    title: '۱. آموزش گام‌به‌گام از صفر',
    titleEn: 'Zero to Hero Setup Guide',
    description: 'نصب venv، پکیج‌ها، ساخت دیتابیس PostgreSQL، مایگریشن و داکر',
    badge: 'شروع',
    iconName: 'Cpu',
    group: 'setup',
    groupTitle: 'استقرار و زیرساخت'
  },
  {
    id: 'django-config',
    title: '۲. کانفیگ settings.py و urls.py',
    titleEn: 'Core Settings & Main URLs',
    description: 'تنظیمات دیتابیس، JWT با انقضای ۳۰ دقیقه، TinyMCE، CORS و Swagger',
    badge: 'هسته',
    iconName: 'Settings',
    group: 'setup',
    groupTitle: 'استقرار و زیرساخت'
  },
  {
    id: 'swagger-redoc',
    title: '۳. سواگر، ریداک و OpenAPI 3.0',
    titleEn: 'Swagger & Redoc OpenAPI',
    description: 'تست تعاملی APIها، هدر Bearer Token و فایل docker-compose',
    badge: 'OpenAPI',
    iconName: 'Globe',
    group: 'setup',
    groupTitle: 'استقرار و زیرساخت'
  },
  {
    id: 'kavenegar_sms',
    title: '۴. سرویس پیامک کاوه‌نگار',
    titleEn: 'kavenegar_sms / Kavenegar OTP & Pattern Gateway App',
    description: 'تنظیمات دینامیک وب‌سرویس پیامکی کاوه‌نگار به همراه پترن‌های اعتبارسنجی (Lookup) برای ارسال سریع کدهای OTP، خوش‌آمدگویی و خروج کاربران.',
    badge: 'SMS API',
    iconName: 'MessageSquare',
    appFolder: 'kavenegar_sms',
    group: 'setup',
    groupTitle: 'استقرار و زیرساخت'
  },

  // Group 2: Configuration & Branding (5 to 7)
  {
    id: 'site-settings',
    title: '۵. تنظیمات سایت، لوگو و تماس',
    titleEn: 'site_settings App',
    description: 'لوگو لایت/دارک، متون هدر، فرم تماس، متون فوتر و راهنمای باربری و بیمه',
    badge: 'تنظیمات',
    iconName: 'Sliders',
    appFolder: 'site_settings',
    group: 'config',
    groupTitle: 'تنظیمات و برندینگ'
  },
  {
    id: 'slider',
    title: '۶. اپلیکیشن هیروبنر و اسلایدر',
    titleEn: 'slider / Hero Banner App',
    description: 'مدیریت اسلایدهای هیروبنر، تصاویر باکیفیت، دکمه‌های اکشن و آمار',
    badge: 'اسلایدر',
    iconName: 'Image',
    appFolder: 'sliders',
    group: 'config',
    groupTitle: 'تنظیمات و برندینگ'
  },
  {
    id: 'footer-settings',
    title: '۷. تنظیمات فوتر وب‌سایت',
    titleEn: 'footer_settings / Website Footer App',
    description: 'مدیریت متون فوتر، لینک‌های سریع، اطلاعات تماس انبار مرکزی و کپی‌رایت',
    badge: 'فوتر',
    iconName: 'Sliders',
    appFolder: 'footer_settings',
    group: 'config',
    groupTitle: 'تنظیمات و برندینگ'
  },

  // Group 3: Auth & Permissions (8 to 10)
  {
    id: 'auth-users',
    title: '۸. اپلیکیشن کاربران و JWT',
    titleEn: 'accounts / Custom User App',
    description: 'مدل Custom User بر پایه موبایل، لاگین با رمز و OTP، خروج با Blacklist',
    badge: 'auth',
    iconName: 'UserCheck',
    appFolder: 'accounts',
    group: 'auth',
    groupTitle: 'احراز هویت و دسترسی'
  },
  {
    id: 'posuser',
    title: '۹. اپلیکیشن مدیریت صندوق‌داران',
    titleEn: 'posuser / POS Staff App',
    description: 'ثبت و مدیریت مدیران انبار و پرسنل صندوق با پروفایل‌های اختصاصی',
    badge: 'صندوق‌دار',
    iconName: 'UserCheck',
    appFolder: 'posuser',
    group: 'auth',
    groupTitle: 'احراز هویت و دسترسی'
  },
  {
    id: 'regular-customers',
    title: '۱۰. مشتریان معمولی و عمده',
    titleEn: 'regular_customers / Regular & Wholesale Customers',
    description: 'مدیریت پروفایل مشتریان، کدهای اقتصادی، تایید هویت واحدهای صنفی و اعتبار خرید',
    badge: 'مشتریان',
    iconName: 'Users',
    appFolder: 'regular_customers',
    group: 'auth',
    groupTitle: 'احراز هویت و دسترسی'
  },

  // Group 4: Catalog & Stock (11)
  {
    id: 'products',
    title: '۱۱. اپلیکیشن جامع محصولات، دسته‌بندی، هولوگرام و ویژگی‌ها',
    titleEn: 'products / Catalog, Categories, Holograms, Attributes & POS Sync',
    description: 'دسته‌بندی‌ها با پالت رنگی (Choice)، هولوگرام و سطوح امنیتی، مشخصات و ویژگی‌های فنی، محاسبه قیمت کارتن/باکس/پاکت، TinyMCE و همگام‌سازی صندوق (is_pos_only)',
    badge: 'جامع • کاتالوگ و انبار',
    iconName: 'Package',
    appFolder: 'products',
    group: 'catalog',
    groupTitle: 'کاتالوگ و انبار'
  },

  // Group 5: Sales, Accounting & Logistics (12 to 21)
  {
    id: 'orders',
    title: '۱۲. اپلیکیشن سفارشات و پیش‌فاکتور',
    titleEn: 'orders / Proforma Invoice App',
    description: 'صدور پیش‌فاکتور رسمی، اسنپ‌شات اقلام، ثبت فیش واریز و اتصال به ترابری',
    badge: 'پیش‌فاکتور',
    iconName: 'ShoppingCart',
    appFolder: 'orders',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'shipping',
    title: '۱۳. اپلیکیشن باربری و پایانه‌ها',
    titleEn: 'shipping / Freight Logistics App',
    description: 'تعرفه‌های استانی کارتن، پایانه شوش، بیمه ۱۰۰٪ و بسته‌بندی ۵ لایه',
    badge: 'باربری',
    iconName: 'Truck',
    appFolder: 'shipping',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'visitors',
    title: '۱۴. اپلیکیشن ویزیتوران و بازاریابی',
    titleEn: 'visitors / Retail Club App',
    description: 'کدهای ویزیتوری، باشگاه مشتریان مغازه‌داران و کمیسیون ۲.۵٪ سود',
    badge: 'بازاریابی',
    iconName: 'Users',
    appFolder: 'visitors',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'pos',
    title: '۱۵. اپلیکیشن حسابداری و صندوق فروشگاهی',
    titleEn: 'pos / Point of Sale App',
    description: 'مدیریت صندوق، چاپ فاکتور حرارتی، ثبت فروش حضوری و تنظیمات صندوق',
    badge: 'POS & Accounting',
    iconName: 'MonitorSmartphone',
    appFolder: 'pos',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'cash-register',
    title: '۱۶. گزارش و تسویه صندوق روزانه',
    titleEn: 'cash_register / Daily Cash Close',
    description: 'مدیریت شیفت صندوق، محاسبه مغایرت نقد و پوز، ذخیره در دیتابیس و گزارش بستن صندوق',
    badge: 'تسویه صندوق',
    iconName: 'BadgeDollarSign',
    appFolder: 'cash_register',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'currency-rates',
    title: '۱۷. تنظیمات نرخ ارز و قیمت‌گذاری دلار/تومان',
    titleEn: 'currency_rates / Exchange Rates & Multi-Currency',
    description: 'مدیریت نرخ ارز (دلار، درهم، یورو)، بروزرسانی هوشمند قیمت محصولات بر اساس نرخ روز و محاسبه قیمت فروش',
    badge: 'نرخ ارز',
    iconName: 'Coins',
    appFolder: 'currency_rates',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'warehouse-stock',
    title: '۱۸. موجودی انبار و کاردکس',
    titleEn: 'warehouse_stock / Stock & Kardex',
    description: 'مدیریت موجودی کالا و تاریخچه ورود و خروج',
    badge: 'انبار کالا',
    iconName: 'Archive',
    appFolder: 'warehouse',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'ledger',
    title: '۱۹. حساب‌های دفتری (نسیه)',
    titleEn: 'ledger / Credit Ledger',
    description: 'مدیریت حساب مشتریان اعتباری و تسویه‌ها',
    badge: 'حساب دفتری',
    iconName: 'BookOpen',
    appFolder: 'ledger',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'reports',
    title: '۲۰. گزارشات فروش و کالا',
    titleEn: 'reports / Analytics',
    description: 'آمار فروش روزانه و تحلیل تک محصول',
    badge: 'گزارش تحلیلی',
    iconName: 'BarChart3',
    appFolder: 'reports',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },

  // Group 6: Support & Content (21 to 24)
  {
    id: 'blog-tinymce',
    title: '۲۱. اپلیکیشن وبلاگ و TinyMCE',
    titleEn: 'blog / SEO Article App',
    description: 'مقالات با HTMLField ادیتور TinyMCE، شمارش بازدید و تصاویر',
    badge: 'TinyMCE',
    iconName: 'BookOpen',
    appFolder: 'blog',
    group: 'support',
    groupTitle: 'محتوا و پشتیبانی'
  },
  {
    id: 'warehouse-contact',
    title: '۲۲. فرم تماس با انبار و استعلام عمده',
    titleEn: 'warehouse_contact / Warehouse Contact App',
    description: 'مدیریت پیام‌های فرم تماس، استعلام نرخ عمده کارتن و پاسخگویی مدیریت انبار جنت‌آباد',
    badge: 'تماس با انبار',
    iconName: 'MessageSquare',
    appFolder: 'warehouse_contact',
    group: 'support',
    groupTitle: 'محتوا و پشتیبانی'
  },
  {
    id: 'notifications',
    title: '۲۳. سیستم نوتیفیکیشن و اطلاعیه‌ها',
    titleEn: 'notifications / User Notifications App',
    description: 'ارسال هشدارهای تغییرات نرخ کارتن، وضعیت سفارشات و اخبار انبار به کاربران',
    badge: 'نوتیفیکیشن',
    iconName: 'Bell',
    appFolder: 'notifications',
    group: 'support',
    groupTitle: 'محتوا و پشتیبانی'
  },
  {
    id: 'tickets-support',
    title: '۲۴. سامانه جامع تیکتینگ و پشتیبانی (مشتریان و ویزیتورها)',
    titleEn: 'tickets / Integrated Support & Ticket System',
    description: 'مدیریت متمرکز تیکت‌های پشتیبانی، تسویه پورسانت ویزیتور و تایید فیش واریزی مشتریان',
    badge: 'تیکت هوشمند',
    iconName: 'MessageSquare',
    appFolder: 'tickets',
    group: 'support',
    groupTitle: 'محتوا و پشتیبانی'
  },
];

const renderIcon = (iconName: string) => {
  switch (iconName) {
    case 'Cpu': return <Cpu className="w-4 h-4" />;
    case 'Settings': return <Settings className="w-4 h-4" />;
    case 'Sliders': return <Sliders className="w-4 h-4" />;
    case 'Globe': return <Globe className="w-4 h-4" />;
    case 'UserCheck': return <UserCheck className="w-4 h-4" />;
    case 'Layers': return <Layers className="w-4 h-4" />;
    case 'Package': return <Package className="w-4 h-4" />;
    case 'ShoppingCart': return <ShoppingCart className="w-4 h-4" />;
    case 'Truck': return <Truck className="w-4 h-4" />;
    case 'BookOpen': return <BookOpen className="w-4 h-4" />;
    case 'MessageSquare': return <MessageSquare className="w-4 h-4" />;
    case 'Users': return <Users className="w-4 h-4" />;
    case 'BadgeDollarSign': return <BadgeDollarSign className="w-4 h-4" />;
    case 'Coins': return <Coins className="w-4 h-4" />;
    case 'Archive': return <Archive className="w-4 h-4" />;
    case 'BarChart3': return <BarChart3 className="w-4 h-4" />;
    case 'Bell': return <Bell className="w-4 h-4" />;
    case 'Image': return <Image className="w-4 h-4" />;
    case 'MonitorSmartphone': return <MonitorSmartphone className="w-4 h-4" />;
    default: return <Package className="w-4 h-4" />;
  }
};

const normalizeFarsi = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/ی/g, 'ی')
    .replace(/ي/g, 'ی')
    .replace(/ک/g, 'ک')
    .replace(/ك/g, 'ک')
    .replace(/‌/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const toPersianNumber = (n: number) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, x => farsiDigits[parseInt(x)]);
};

export const AzarakhshLayout: React.FC<AzarakhshLayoutProps> = ({
  activeSection,
  onSelectSection,
  onLogout,
  onReturnToApp,
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredSections = AZARAKHSH_SECTIONS.filter(s => {
    const normQuery = normalizeFarsi(searchQuery);
    if (!normQuery) return true;
    return (
      normalizeFarsi(s.title).includes(normQuery) ||
      normalizeFarsi(s.titleEn).includes(normQuery) ||
      normalizeFarsi(s.description).includes(normQuery) ||
      (s.appFolder && normalizeFarsi(s.appFolder).includes(normQuery))
    );
  });

  const currentIndex = AZARAKHSH_SECTIONS.findIndex(s => s.id === activeSection);
  const currentMeta = AZARAKHSH_SECTIONS[currentIndex] || AZARAKHSH_SECTIONS[0];
  const prevSection = currentIndex > 0 ? AZARAKHSH_SECTIONS[currentIndex - 1] : null;
  const nextSection = currentIndex < AZARAKHSH_SECTIONS.length - 1 ? AZARAKHSH_SECTIONS[currentIndex + 1] : null;

  // Group sections
  const allGroups: { key: DocGroup; title: string; items: DocSectionMeta[] }[] = [
    { key: 'setup', title: '۱. استقرار و زیرساخت هسته', items: filteredSections.filter(s => s.group === 'setup') },
    { key: 'config', title: '۲. تنظیمات و برندینگ', items: filteredSections.filter(s => s.group === 'config') },
    { key: 'auth', title: '۳. احراز هویت و دسترسی', items: filteredSections.filter(s => s.group === 'auth') },
    { key: 'catalog', title: '۴. کاتالوگ محصولات و انبار', items: filteredSections.filter(s => s.group === 'catalog') },
    { key: 'commerce', title: '۵. پیش‌فاکتور، ترابری و ویزیتوری', items: filteredSections.filter(s => s.group === 'commerce') },
    { key: 'support', title: '۶. محتوا و پشتیبانی', items: filteredSections.filter(s => s.group === 'support') },
  ];
  const groups = allGroups.filter(g => g.items.length > 0);

  return (
    <div className={`min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white bg-slate-50 text-slate-800`} dir="rtl">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile/Tablet Menu Trigger */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              aria-label="منوی مستندات"
            >
              <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sparkles Icon (hidden on mobile to maximize space) */}
              <div className="hidden sm:flex w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white items-center justify-center font-black shadow-sm shadow-blue-600/25 shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Responsive title: compact on mobile, full on tablet+ */}
                  <span className="font-black text-slate-900 text-xs sm:text-base tracking-tight whitespace-nowrap">
                    <span className="sm:hidden">مستندات آذرخش</span>
                    <span className="hidden sm:inline">مستندات اختصاصی جنگو (آذرخش)</span>
                  </span>
                  {/* Hide technical badge on mobile/tablet to avoid vertical header wrapping */}
                  <span className="hidden md:inline-block text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200/60 font-mono shrink-0">
                    Django 5.1 LTS • DRF • PostgreSQL
                  </span>
                </div>
                {/* Description - hidden on mobile to avoid clutter */}
                <div className="text-[10px] sm:text-xs text-slate-500 hidden sm:block font-medium truncate max-w-[200px] md:max-w-md lg:max-w-lg mt-0.5">
                  معماری جامع {toPersianNumber(AZARAKHSH_SECTIONS.length)} بخش، مدل‌ها، پنل ادمین، سریالایزرها و ویوها
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Return to Main Store Button */}
            <button
              onClick={onReturnToApp}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] sm:text-xs font-bold transition-all cursor-pointer border border-slate-200/70 shadow-xs"
              title="بازگشت به سامانه اصلی فروش عمده"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">بازگشت به سایت</span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] sm:text-xs font-bold border border-rose-200 transition-all cursor-pointer shadow-xs"
              title="خروج و قفل مستندات"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>خروج</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Grid: Sidebar + Content */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-6 flex flex-col lg:flex-row gap-7">
        
        {/* Desktop Sidebar (Wide & Structured) */}
        <aside className="hidden lg:flex flex-col w-84 lg:w-96 shrink-0 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`جستجو در ${toPersianNumber(AZARAKHSH_SECTIONS.length)} بخش، مدل‌ها و سرفصل‌ها...`}
              className="w-full bg-white border border-slate-200/90 rounded-2xl pr-10 pl-9 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                title="پاک کردن جستجو"
              >
                ✕
              </button>
            )}
          </div>

          {/* Grouped Navigation Sidebar */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-3 shadow-xs space-y-4 overflow-hidden">
            <div className="px-3.5 py-2 text-xs font-black text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <span>فهرست جامع سرفصل‌ها ({filteredSections.length})</span>
              <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 font-mono font-bold">
                DRF v1.0
              </span>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-270px)] overflow-y-auto pr-0.5">
              {groups.map((group) => (
                <div key={group.key} className="space-y-1">
                  <div className="px-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    {group.title}
                  </div>

                  <div className="space-y-1">
                    {group.items.map((sec) => {
                      const isActive = activeSection === sec.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => onSelectSection(sec.id)}
                          className={`w-full text-right p-2.5 sm:p-3 rounded-2xl transition-all flex items-center justify-between gap-2.5 text-xs sm:text-sm cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-black'
                              : 'text-slate-700 hover:bg-slate-50 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 '
                            }`}>
                              {renderIcon(sec.iconName)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-[13px] leading-snug truncate">{sec.title}</div>
                              <div className={`text-[10px] sm:text-[11px] font-mono leading-tight mt-0.5 truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                                {sec.titleEn}
                              </div>
                            </div>
                          </div>

                          {sec.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black shrink-0 ${
                              isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200/60 '
                            }`}>
                              {sec.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-xs flex animate-in fade-in duration-200">
            <div className="bg-white w-5/6 max-w-sm h-full p-5 flex flex-col space-y-4 shadow-2xl animate-in slide-in-from-right duration-200 overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="font-black text-slate-900 text-sm">فهرست اپلیکیشن‌های جنگو</div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Real-time search inside Mobile/Tablet Drawer */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در سرفصل‌ها و پوشه‌ها..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-full hover:bg-slate-200 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
 
              <div className="flex-1 overflow-y-auto space-y-5 pr-0.5 select-none">
                {groups.map((group) => (
                  <div key={group.key} className="space-y-1.5">
                    <div className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {group.title}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((sec) => {
                        const isActive = activeSection === sec.id;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => {
                              onSelectSection(sec.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-right p-2.5 rounded-2xl transition-all flex items-center justify-between gap-2.5 text-xs font-bold cursor-pointer ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-black'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {renderIcon(sec.iconName)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs leading-snug truncate">{sec.title}</div>
                                <div className={`text-[10px] font-mono leading-tight mt-0.5 truncate ${
                                  isActive ? 'text-blue-100' : 'text-slate-400'
                                }`}>
                                  {sec.appFolder || sec.titleEn}
                                </div>
                              </div>
                            </div>

                            {sec.badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-lg font-black shrink-0 ${
                                isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              }`}>
                                {sec.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-8">
          {children}

          {/* Bottom Sequential Chapter Navigator */}
          <div className="border-t border-slate-200 pt-6 flex items-center justify-between gap-4 flex-wrap">
            {prevSection ? (
              <button
                onClick={() => {
                  onSelectSection(prevSection.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 text-slate-700 text-xs font-bold transition-all shadow-xs group cursor-pointer text-right"
              >
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-normal">فصل قبلی</div>
                  <div className="font-bold">{prevSection.title}</div>
                </div>
              </button>
            ) : <div />}

            {nextSection ? (
              <button
                onClick={() => {
                  onSelectSection(nextSection.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 text-slate-700 text-xs font-bold transition-all shadow-xs group cursor-pointer text-left"
              >
                <div>
                  <div className="text-[10px] text-slate-400 font-normal">فصل بعدی</div>
                  <div className="font-bold">{nextSection.title}</div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
              </button>
            ) : <div />}
          </div>
        </main>

      </div>

    </div>
  );
};

export const DocLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900">{title}</h1>
      {children}
    </div>
  );
};
