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
  Check
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
    id: 'site-settings',
    title: '۴. تنظیمات سایت، لوگو و تماس',
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
    title: 'اپلیکیشن هیروبنر و اسلایدر',
    titleEn: 'slider / Hero Banner App',
    description: 'مدیریت اسلایدهای هیروبنر، تصاویر باکیفیت، دکمه‌های اکشن و آمار',
    badge: 'اسلایدر',
    iconName: 'Image',
    appFolder: 'sliders',
    group: 'config',
    groupTitle: 'تنظیمات و برندینگ'
  },
  {
    id: 'auth-users',
    title: '۵. اپلیکیشن کاربران و JWT',
    titleEn: 'accounts / Custom User App',
    description: 'مدل Custom User بر پایه موبایل، لاگین با رمز و OTP، خروج با Blacklist',
    badge: 'auth',
    iconName: 'UserCheck',
    appFolder: 'accounts',
    group: 'auth',
    groupTitle: 'احراز هویت و دسترسی'
  },
  {
    id: 'categories',
    title: '۶. اپلیکیشن دسته‌بندی‌های درختی',
    titleEn: 'categories / Tree Category App',
    description: 'مدل درختی، اسلاگ فارسی سئو، آیکون و شمارنده هوشمند محصولات',
    iconName: 'Layers',
    appFolder: 'categories',
    group: 'catalog',
    groupTitle: 'کاتالوگ و انبار'
  },
  {
    id: 'products',
    title: '۷. اپلیکیشن کاتالوگ محصولات',
    titleEn: 'products / Catalog & Pricing',
    description: 'محاسبه نرخ کارتن و باکس، فیلد ادیتور TinyMCE، تصاویر گالری و موجودی',
    badge: 'TinyMCE',
    iconName: 'Package',
    appFolder: 'products',
    group: 'catalog',
    groupTitle: 'کاتالوگ و انبار'
  },
  {
    id: 'orders',
    title: '۸. اپلیکیشن سفارشات و پیش‌فاکتور',
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
    title: '۹. اپلیکیشن باربری و پایانه‌ها',
    titleEn: 'shipping / Freight Logistics App',
    description: 'تعرفه‌های استانی کارتن، پایانه شوش، بیمه ۱۰۰٪ و بسته‌بندی ۵ لایه',
    iconName: 'Truck',
    appFolder: 'shipping',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'visitors',
    title: '۱۰. اپلیکیشن ویزیتوران و بازاریابی',
    titleEn: 'visitors / Retail Club App',
    description: 'کدهای ویزیتوری، باشگاه مشتریان مغازه‌داران و کمیسیون ۲.۵٪ سود',
    iconName: 'Users',
    appFolder: 'visitors',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'pos',
    title: 'اپلیکیشن حسابداری و صندوق فروشگاهی',
    titleEn: 'pos / Point of Sale App',
    description: 'مدیریت صندوق، چاپ فاکتور حرارتی، ثبت فروش حضوری و تنظیمات صندوق',
    badge: 'POS & Accounting',
    iconName: 'MonitorSmartphone',
    appFolder: 'pos',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'pos-products',
    title: 'محصولات فروشگاه حضوری',
    titleEn: 'pos_products / POS Products',
    description: 'مدیریت کالاهای صندوق، دسته‌بندی نوشیدنی و قهوه',
    badge: 'POS',
    iconName: 'Package',
    appFolder: 'pos_products',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'warehouse-stock',
    title: 'موجودی انبار و کاردکس',
    titleEn: 'warehouse_stock / Stock & Kardex',
    description: 'مدیریت موجودی کالا و تاریخچه ورود و خروج',
    badge: 'انبار',
    iconName: 'Archive',
    appFolder: 'warehouse',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'ledger',
    title: 'حساب‌های دفتری (نسیه)',
    titleEn: 'ledger / Credit Ledger',
    description: 'مدیریت حساب مشتریان اعتباری و تسویه‌ها',
    badge: 'مالی',
    iconName: 'BookOpen',
    appFolder: 'finance',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'reports',
    title: 'گزارشات فروش و کالا',
    titleEn: 'reports / Analytics',
    description: 'آمار فروش روزانه و تحلیل تک محصول',
    badge: 'گزارش',
    iconName: 'BarChart3',
    appFolder: 'reports',
    group: 'commerce',
    groupTitle: 'فروش، مالی و لجستیک'
  },
  {
    id: 'roles-permissions',
    title: 'مدیریت نقش‌ها و دسترسی‌ها',
    titleEn: 'roles / RBAC Auth',
    description: 'تعریف ادمین انبار و صندوق‌دار',
    badge: 'دسترسی',
    iconName: 'ShieldAlert',
    appFolder: 'users',
    group: 'auth',
    groupTitle: 'احراز هویت و دسترسی'
  },
  {
    id: 'sms',
    title: 'سرویس پیامک کاوه‌نگار',
    titleEn: 'sms / Kavenegar',
    description: 'سرویس احراز هویت پیامکی و اطلاع‌رسانی',
    badge: 'API',
    iconName: 'MessageSquare',
    appFolder: 'sms',
    group: 'setup',
    groupTitle: 'راه‌اندازی و زیرساخت'
  },
  {
    id: 'blog-tinymce',
    title: '۱۱. اپلیکیشن وبلاگ و TinyMCE',
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
    title: 'فرم تماس با انبار و استعلام عمده',
    titleEn: 'warehouse_contact / Warehouse Contact App',
    description: 'مدیریت پیام‌های فرم تماس، استعلام نرخ عمده کارتن و پاسخگویی مدیریت انبار جنت‌آباد',
    badge: 'تماس',
    iconName: 'MessageSquare',
    appFolder: 'warehouse_contact',
    group: 'support',
    groupTitle: 'محتوا و پشتیبانی'
  },
  {
    id: 'regular-customers',
    title: 'مشتریان معمولی و عمده',
    titleEn: 'regular_customers / Regular & Wholesale Customers',
    description: 'مدیریت پروفایل مشتریان، کدهای اقتصادی، تایید هویت واحدهای صنفی و اعتبار خرید',
    badge: 'مشتریان',
    iconName: 'Users',
    appFolder: 'regular_customers',
    group: 'auth',
    groupTitle: 'احراز هویت و دسترسی'
  },
  {
    id: 'footer-settings',
    title: 'تنظیمات فوتر وب‌سایت',
    titleEn: 'footer_settings / Website Footer App',
    description: 'مدیریت متون فوتر، لینک‌های سریع، اطلاعات تماس انبار مرکزی و کپی‌رایت',
    badge: 'فوتر',
    iconName: 'Sliders',
    appFolder: 'footer_settings',
    group: 'config',
    groupTitle: 'تنظیمات و برندینگ'
  },
  {
    id: 'notifications',
    title: 'سیستم نوتیفیکیشن و اطلاعیه‌ها',
    titleEn: 'notifications / User Notifications App',
    description: 'ارسال هشدارهای تغییرات نرخ کارتن، وضعیت سفارشات و اخبار انبار به کاربران',
    badge: 'نوتیف',
    iconName: 'Bell',
    appFolder: 'notifications',
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
    default: return <Package className="w-4 h-4" />;
  }
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

  const filteredSections = AZARAKHSH_SECTIONS.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.appFolder && s.appFolder.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      <header className="sticky top-0 z-30 bg-white/95 [#0f1422]/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              aria-label="منوی مستندات"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                    مستندات اختصاصی جنگو (آذرخش)
                  </span>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg border border-blue-200/60 font-mono">
                    Django 5.1 LTS • DRF • PostgreSQL
                  </span>
                </div>
                <div className="text-xs text-slate-500 hidden sm:block font-medium">
                  معماری جامع ۱۲ اپلیکیشن، مدل‌ها، پنل ادمین، سریالایزرها، ویوها و مسیرهای REST API
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Return to Main Store Button */}
            <button
              onClick={onReturnToApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200/70 shadow-xs"
              title="بازگشت به سامانه اصلی فروش عمده"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">بازگشت به سایت</span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all cursor-pointer shadow-xs"
              title="خروج و قفل مستندات"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Grid: Sidebar + Content */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row gap-7">
        
        {/* Desktop Sidebar (Wide & Structured) */}
        <aside className="hidden md:flex flex-col w-84 lg:w-96 shrink-0 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در ۱۲ اپلیکیشن، مدل‌ها و سرفصل‌ها..."
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
          <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex animate-in fade-in duration-200">
            <div className="bg-white w-5/6 max-w-sm h-full p-5 flex flex-col space-y-4 shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="font-black text-slate-900 text-sm">فهرست اپلیکیشن‌های جنگو</div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.key} className="space-y-1">
                    <div className="px-2 text-[11px] font-black text-slate-400">
                      {group.title}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((sec) => (
                        <button
                          key={sec.id}
                          onClick={() => {
                            onSelectSection(sec.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full text-right p-3 rounded-2xl flex items-center justify-between text-xs font-bold ${
                            activeSection === sec.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-800 '
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {renderIcon(sec.iconName)}
                            <span>{sec.title}</span>
                          </div>
                        </button>
                      ))}
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
