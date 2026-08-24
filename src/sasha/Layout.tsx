import React, { useState } from 'react';
import { 
  Cpu, 
  Settings, 
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
  ChevronLeft
} from 'lucide-react';
import { SashaSectionId, DocSectionMeta } from './types';

interface SashaLayoutProps {
  activeSection: SashaSectionId;
  onSelectSection: (id: SashaSectionId) => void;
  onLogout: () => void;
  onReturnToApp: () => void;
  children: React.ReactNode;
}

export const SASHA_SECTIONS: DocSectionMeta[] = [
  {
    id: 'zero-to-hero',
    title: '۱. آموزش گام‌به‌گام از صفر',
    titleEn: 'Zero to Hero Setup',
    description: 'نصب venv، پکیج‌ها، ساخت دیتابیس PostgreSQL و مایگریشن',
    badge: 'شروع',
    iconName: 'Cpu'
  },
  {
    id: 'django-config',
    title: '۲. کانفیگ settings.py و urls.py',
    titleEn: 'Core Settings & Config',
    description: 'دیتابیس، JWT با انقضای ۳۰ دقیقه، TinyMCE، CORS و Swagger',
    badge: 'هسته',
    iconName: 'Settings'
  },
  {
    id: 'swagger-redoc',
    title: '۳. سواگر، ریداک و دپلوی',
    titleEn: 'Swagger & Redoc Guide',
    description: 'تست تعاملی APIها، هدر Bearer و فایل docker-compose',
    badge: 'OpenAPI',
    iconName: 'Globe'
  },
  {
    id: 'auth-users',
    title: '۴. اپلیکیشن کاربران و JWT',
    titleEn: 'accounts / User App',
    description: 'مدل Custom User، لاگین، ثبت‌نام، خروج با Blacklist و انقضای نیم‌ساعته',
    badge: 'auth',
    iconName: 'UserCheck',
    appFolder: 'accounts'
  },
  {
    id: 'categories',
    title: '۵. اپلیکیشن دسته‌بندی‌ها',
    titleEn: 'categories App',
    description: 'مدل درختی، اسلاگ فارسی، آیکون و شمارنده محصولات',
    iconName: 'Layers',
    appFolder: 'categories'
  },
  {
    id: 'products',
    title: '۶. اپلیکیشن کاتالوگ محصولات',
    titleEn: 'products App',
    description: 'نرخ کارتن/باکس، فیلد TinyMCE، تصاویر گالری و موجودی',
    badge: 'TinyMCE',
    iconName: 'Package',
    appFolder: 'products'
  },
  {
    id: 'orders',
    title: '۷. اپلیکیشن سفارشات و فاکتور',
    titleEn: 'orders App',
    description: 'صدور پیش‌فاکتور رسمی، اقلام سفارش، ثبت فیش واریز و رهگیری',
    badge: 'پیش‌فاکتور',
    iconName: 'ShoppingCart',
    appFolder: 'orders'
  },
  {
    id: 'shipping',
    title: '۸. اپلیکیشن حمل‌ونقل و باربری',
    titleEn: 'shipping App',
    description: 'تعرفه‌های استانی کارتن، باربری‌های شوش و مدت زمان تحویل',
    iconName: 'Truck',
    appFolder: 'shipping'
  },
  {
    id: 'blog-tinymce',
    title: '۹. اپلیکیشن وبلاگ و TinyMCE',
    titleEn: 'blog App',
    description: 'مقالات با HTMLField ادیتور TinyMCE و شمارش بازدید',
    badge: 'TinyMCE',
    iconName: 'BookOpen',
    appFolder: 'blog'
  },
  {
    id: 'tickets-support',
    title: '۱۰. اپلیکیشن تیکت و چت',
    titleEn: 'tickets App',
    description: 'تیکت‌های مشتریان، پیوست تصویر فیش و پاسخگویی اپراتور',
    iconName: 'MessageSquare',
    appFolder: 'tickets'
  },
  {
    id: 'visitors',
    title: '۱۱. اپلیکیشن ویزیتوران',
    titleEn: 'visitors App',
    description: 'کدهای ویزیتوری، باشگاه مشتریان مغازه‌داران و کمیسیون ۲.۵٪',
    iconName: 'Users',
    appFolder: 'visitors'
  },
];

const renderIcon = (iconName: string) => {
  switch (iconName) {
    case 'Cpu': return <Cpu className="w-4 h-4" />;
    case 'Settings': return <Settings className="w-4 h-4" />;
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

export const SashaLayout: React.FC<SashaLayoutProps> = ({
  activeSection,
  onSelectSection,
  onLogout,
  onReturnToApp,
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredSections = SASHA_SECTIONS.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.appFolder && s.appFolder.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentMeta = SASHA_SECTIONS.find(s => s.id === activeSection) || SASHA_SECTIONS[0];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col antialiased selection:bg-blue-600 selection:text-white" dir="rtl">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              aria-label="منوی مستندات"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight">مستندات اختصاصی جنگو (ساشا)</span>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                    Django 5 + JWT + TinyMCE
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  معماری کامل مدل‌ها، ادمین، سریالایزرها، ویوها و روت‌ها
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReturnToApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              title="بازگشت به سامانه اصلی فروش عمده"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">بازگشت به سایت</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all"
              title="خروج و قفل مستندات"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Grid: Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-72 shrink-0 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در اپ‌ها و کدها..."
              className="w-full bg-white border border-slate-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-all shadow-xs"
            />
          </div>

          {/* Navigation Items */}
          <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-xs space-y-1 overflow-hidden">
            <div className="px-3 py-2 text-[11px] font-black text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
              <span>سرفصل‌های مستندات ({filteredSections.length})</span>
              <span className="text-[10px] text-blue-600 font-mono">DRF API</span>
            </div>

            <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-0.5">
              {filteredSections.map(sec => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => onSelectSection(sec.id)}
                    className={`w-full text-right p-2.5 rounded-2xl transition-all flex items-center justify-between gap-2 text-xs ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-black'
                        : 'text-slate-700 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {renderIcon(sec.iconName)}
                      </div>
                      <div className="truncate">
                        <div className="truncate text-xs">{sec.title}</div>
                        <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                          {sec.titleEn}
                        </div>
                      </div>
                    </div>

                    {sec.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
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

              <div className="space-y-1">
                {SASHA_SECTIONS.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      onSelectSection(sec.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-right p-3 rounded-2xl flex items-center justify-between text-xs font-bold ${
                      activeSection === sec.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {renderIcon(sec.iconName)}
                      <span>{sec.title}</span>
                    </div>
                  </button>
                ))}
              </div>

            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>

    </div>
  );
};
