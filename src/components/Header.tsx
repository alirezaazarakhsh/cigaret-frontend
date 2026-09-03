import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Layers, 
  PhoneCall, 
  Truck, 
  BookOpen, 
  MapPin, 
  FileText, 
  User, 
  MessageSquare, 
  Menu, 
  X, 
  TrendingUp, 
  ChevronDown, 
  LogOut, 
  Ticket, 
  Bell, 
  Smartphone, 
  Search,
  Sparkles
} from 'lucide-react';
import { formatNumberFa } from '../utils/formatters';
import { NavigationTab, UserProfile } from '../types';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  cartCount: number;
  cartTotalCartons?: number;
  cartTotalBoxes?: number;
  onOpenCart: () => void;
  currentUser: UserProfile | null;
  onLogout?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenInstallGuide?: () => void;
  onOpenProductsMenu?: () => void;
  onOpenInPersonPickup?: () => void;
  companyTitle?: string;
  phoneNumber?: string;
  warehouseAddress?: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const ALL_NAV_TABS: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; color?: string; requiresAuth?: boolean }[] = [
  { id: 'catalog', label: 'کاتالوگ کالاها', icon: Layers },
  { id: 'live-prices', label: 'لیست قیمت لحظه‌ای', icon: TrendingUp, color: 'text-amber-500' },
  { id: 'invoice', label: 'فاکتور رسمی', icon: FileText, color: 'text-blue-500', requiresAuth: true },
  { id: 'tracking', label: 'رهگیری بارنامه', icon: Truck, color: 'text-blue-500' },
  { id: 'contact', label: 'تماس با انبار', icon: MessageSquare, color: 'text-emerald-500' },
  { id: 'shipping', label: 'تعرفه باربری', icon: MapPin, color: 'text-slate-400' },
  { id: 'blog', label: 'مقالات خواندنی', icon: BookOpen, color: 'text-indigo-400' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  currentUser,
  onLogout,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenInstallGuide,
  companyTitle,
  phoneNumber,
  warehouseAddress,
  searchQuery = '',
  setSearchQuery,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true ||
        localStorage.getItem('pwa_installed') === 'true';
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();
    window.addEventListener('pwa-installed-change', checkStandalone);
    return () => window.removeEventListener('pwa-installed-change', checkStandalone);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navTabs = ALL_NAV_TABS.filter(tab => !tab.requiresAuth || currentUser !== null);

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleSearchChange = (val: string) => {
    if (setSearchQuery) {
      setSearchQuery(val);
      if (val.trim() && activeTab !== 'catalog') {
        setActiveTab('catalog');
      }
    }
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200 transition-all duration-200" id="main-header">
      
      {/* LAYER 1: Top Micro-Bar */}
      <div className="bg-slate-950 text-slate-200 text-xs py-1.5 px-3 sm:px-6 border-b border-slate-800/80">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2">
          
          {/* Warehouse & Dispatch Status Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping"></span>
            <span className="text-blue-400 font-bold text-[10px] sm:text-xs truncate">
              {companyTitle ? `سامانه پخش عمده ${companyTitle}` : 'سامانه پخش عمده دخانیات'}
              {warehouseAddress ? ` | ${warehouseAddress}` : ''}
            </span>
          </div>

          {/* Quick Actions: Install App & Support Call */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {onOpenInstallGuide && !isStandalone && (
              <button
                onClick={onOpenInstallGuide}
                title="دانلود و نصب وب‌اپلیکیشن موبایل (PWA)"
                className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all border border-blue-500/40 shadow-xs shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-200" />
                <span>نصب وب‌اپ</span>
              </button>
            )}

            {phoneNumber && (
              <a 
                href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`} 
                className="text-white hover:text-blue-400 transition-colors flex items-center gap-1 font-bold text-xs shrink-0"
                id="direct-call-link"
              >
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <PhoneCall className="w-2.5 h-2.5" />
                </div>
                <span dir="ltr" className="text-white font-mono font-black tracking-tight text-[10px] sm:text-xs">{phoneNumber}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* LAYER 2: Main Header Container */}
      <div className="bg-white border-b border-slate-100 px-3 sm:px-6 py-2.5 transition-colors">
        <div className="max-w-[1600px] mx-auto">
          
          {/* DESKTOP HEADER LAYOUT (md and up) */}
          <div className="hidden md:flex items-center justify-between gap-4 lg:gap-6">
            
            {/* Brand Logo & Title */}
            <div 
              onClick={() => handleSelectTab('catalog')} 
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
              id="brand-logo-btn"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base lg:text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {companyTitle ? `پخش عمده ${companyTitle}` : 'دخانیات عمده دخانیات سرو'}
                  </span>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg shrink-0">
                    کارتن و باکس
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {warehouseAddress ? `توزیع مستقیم ${warehouseAddress}` : 'توزیع دست‌اول انبار پخش عمده'}
                </p>
              </div>
            </div>

            {/* Central Integrated Search Form */}
            <div className="flex-1 max-w-lg mx-2 lg:mx-6">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="جستجوی نام سیگار، برند، تیریا، ایکاس یا کد کالا..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 font-medium transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-full hover:bg-slate-200 transition-colors"
                    title="پاک کردن"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Actions: User Profile / Notifications / Cart Drawer */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                {currentUser ? (
                  <div>
                    <button
                      onClick={() => setUserDropdownOpen(prev => !prev)}
                      id="header-user-dropdown-btn"
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-black bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all shadow-xs"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                        {currentUser.fullName.slice(0, 1)}
                      </div>
                      <span className="max-w-[120px] truncate">{currentUser.fullName}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 md:right-auto md:left-0 mt-2 w-60 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <div className="text-xs font-black text-slate-900 truncate">{currentUser.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser.phone}</div>
                          {currentUser.referralCode && (
                            <div className="mt-1.5 bg-blue-50 text-blue-700 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold flex items-center justify-between">
                              <span>کد معرفی:</span>
                              <span className="font-black">{currentUser.referralCode}</span>
                            </div>
                          )}
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              setActiveTab('user-panel');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-right px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <Ticket className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>پنل کاربری و تیکت‌ها</span>
                          </button>
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              if (onLogout) onLogout();
                            }}
                            className="w-full text-right px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                          >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>خروج از حساب</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectTab('user-panel')}
                    id="header-login-btn"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all active:scale-95"
                  >
                    <User className="w-4 h-4 shrink-0" />
                    <span>ورود به حساب</span>
                  </button>
                )}
              </div>

              {/* Notification Bell */}
              {currentUser && onOpenNotifications && (
                <button
                  onClick={onOpenNotifications}
                  id="header-notifications-btn"
                  title="اعلان‌ها و پیام‌های انبار"
                  className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200 transition-all active:scale-95 shrink-0"
                >
                  <Bell className="w-4 h-4 text-blue-600" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Cart Drawer Button */}
              {currentUser && (
                <button
                  onClick={onOpenCart}
                  id="open-cart-drawer-btn"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black px-3.5 py-2 rounded-2xl transition-all shadow-md shadow-blue-600/25 whitespace-nowrap text-xs"
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span>
                    {cartCount > 0 
                      ? `سبد (${formatNumberFa(cartCount)})` 
                      : 'سبد خرید'}
                  </span>
                </button>
              )}

            </div>
          </div>

          {/* OPTIMIZED MOBILE HEADER LAYOUT (< md screens) using CSS Grid & Flexbox */}
          <div className="flex md:hidden flex-col gap-2.5">
            
            {/* Row 1: Grid Layout (Logo - Actions - Menu Toggle) */}
            <div className="grid grid-cols-[1fr_auto] items-center gap-2 w-full">
              
              {/* Logo & Brand Info (Flex Container with shrink-0 logo) */}
              <div 
                onClick={() => handleSelectTab('catalog')}
                className="flex items-center gap-2 cursor-pointer min-w-0"
                id="mobile-brand-logo-btn"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-xs shrink-0">
                  <Package className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {companyTitle ? `پخش عمده ${companyTitle}` : 'دخانیات دخانیات سرو'}
                    </span>
                    <span className="text-[8px] font-black bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.2 rounded-md shrink-0 whitespace-nowrap">
                      کارتن / باکس
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 font-medium truncate leading-tight">
                    {warehouseAddress ? warehouseAddress : 'پخش مستقیم انبار دخانیات سرو'}
                  </p>
                </div>
              </div>

              {/* Action Buttons Group (Flexbox) */}
              <div className="flex items-center gap-1.5 shrink-0">
                
                {/* User Profile / Login */}
                {currentUser ? (
                  <button
                    onClick={() => handleSelectTab('user-panel')}
                    className="w-8.5 h-8.5 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs active:scale-95"
                    title={currentUser.fullName}
                  >
                    {currentUser.fullName.slice(0, 1)}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectTab('user-panel')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-black shrink-0 shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>ورود</span>
                  </button>
                )}

                {/* Notifications Bell */}
                {currentUser && onOpenNotifications && (
                  <button
                    onClick={onOpenNotifications}
                    className="relative w-8.5 h-8.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0 active:scale-95"
                    title="اعلانات"
                  >
                    <Bell className="w-4 h-4 text-blue-600" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Cart Drawer */}
                {currentUser && (
                  <button
                    onClick={onOpenCart}
                    className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-black shrink-0 shadow-xs active:scale-95 whitespace-nowrap"
                    title="سبد خرید"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {cartCount > 0 && (
                      <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1 rounded-md border border-white">
                        {formatNumberFa(cartCount)}
                      </span>
                    )}
                  </button>
                )}

                {/* Mobile Menu Toggle Button */}
                <button
                  onClick={() => setMobileMenuOpen(prev => !prev)}
                  className="w-8.5 h-8.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 active:scale-95"
                  aria-label="منوی موبایل"
                >
                  {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
                </button>

              </div>
            </div>

            {/* Row 2: Search Input (Full Width Flex Container) */}
            <div className="w-full">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="جستجوی سیگار، برند، تیریا، ایکاس یا کد کالا..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 font-medium transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* LAYER 3: Responsive Navigation Tabs Bar (Desktop & Horizontal Mobile Ribbon) */}
      <div className="bg-slate-50 border-b border-slate-200/90 py-1.5 px-3 sm:px-6 transition-colors">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  id={`nav-tab-${tab.id}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs scale-100'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color || 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* MOBILE COLLAPSIBLE DRAWER / MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          
          {/* User Status Card inside Mobile Menu */}
          {currentUser ? (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  {currentUser.fullName.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">{currentUser.fullName}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">{currentUser.phone}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                handleSelectTab('user-panel');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <User className="w-4 h-4" />
              <span>ورود / ثبت‌نام در سامانه</span>
            </button>
          )}

          {/* Nav Grid inside Mobile Drawer */}
          <div className="text-[11px] font-black text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>دسته‌بندی و صفحات اصلی:</span>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-right transition-all border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : tab.color || 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Support call link */}
          {phoneNumber && (
            <div className="pt-2.5 border-t border-slate-100 text-center">
              <a
                href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-blue-600 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>پشتیبانی و ثبت سفارش تلفنی: {phoneNumber}</span>
              </a>
            </div>
          )}

        </div>
      )}

    </header>
  );
};
