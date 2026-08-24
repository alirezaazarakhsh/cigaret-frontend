import React, { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Layers, 
  PhoneCall, 
  RefreshCw,
  Truck,
  Database,
  BookOpen,
  MapPin,
  FileText,
  ShieldCheck,
  Moon,
  Sun,
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
  Code
} from 'lucide-react';
import { formatNumberFa } from '../utils/formatters';
import { NavigationTab, UserProfile } from '../types';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  cartCount: number;
  cartTotalCartons: number;
  cartTotalBoxes: number;
  onOpenCart: () => void;
  currentUser: UserProfile | null;
  onLogout?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenInstallGuide?: () => void;
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
  cartTotalCartons,
  cartTotalBoxes,
  onOpenCart,
  currentUser,
  onLogout,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenInstallGuide,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navTabs = ALL_NAV_TABS.filter(tab => !tab.requiresAuth || currentUser !== null);

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white [#0b0f19] shadow-md border-b border-slate-200 transition-colors" id="main-header">
      
      {/* LAYER 1: Top Micro-Bar */}
      <div className="bg-slate-950 text-slate-200 text-xs py-1.5 px-3 sm:px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Warehouse and Dispatch Status */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping"></span>
            <span className="text-blue-400 font-bold text-[11px] sm:text-xs truncate">
              پخش عمده دخانیات سوین | انبار مرکزی جنت‌آباد
            </span>
          </div>

          {/* Actions: Phone & PWA */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* PWA Mobile Web App Button */}
            {onOpenInstallGuide && (
              <button
                onClick={onOpenInstallGuide}
                title="دانلود و نصب وب‌اپلیکیشن موبایل (PWA)"
                className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all border border-blue-500/40 shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-200" />
                <span>نصب وب‌اپ</span>
              </button>
            )}

            {/* Direct Phone Call */}
            <a 
              href="tel:09120759419" 
              className="text-white hover:text-blue-400 transition-colors flex items-center gap-1 font-bold text-xs shrink-0"
              id="direct-call-link"
            >
              <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                <PhoneCall className="w-2.5 h-2.5" />
              </div>
              <span dir="ltr" className="text-white font-mono font-black tracking-tight text-[11px] sm:text-xs">۰۹۱۲۰۷۵۹۴۱۹</span>
            </a>

          </div>
        </div>
      </div>

      {/* LAYER 2: Brand Identity & Action Center */}
      <div className="bg-white [#0b0f19] border-b border-slate-100 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => handleSelectTab('catalog')} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
            id="brand-logo-btn"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  دخانیات عمده سوین
                </span>
                <span className="hidden sm:inline-block text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg shrink-0">
                  کارتن و باکس
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block truncate">
                توزیع دست‌اول انبار جنت‌آباد تهران
              </p>
            </div>
          </div>

          {/* Actions & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* User Profile / Panel & Dropdown */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(prev => !prev)}
                    id="header-user-dropdown-btn"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-slate-50 [#111827] hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all shadow-xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                      {currentUser.fullName.slice(0, 1)}
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">{currentUser.fullName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-0 mt-2 w-56 sm:w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 ">
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

                      <div className="pt-1 border-t border-slate-100 ">
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
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all active:scale-95"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span>ورود به پنل کاربری</span>
                </button>
              )}
            </div>

            {/* Notification Bell Icon - Only visible when logged in */}
            {currentUser && onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                id="header-notifications-btn"
                title="اعلان‌ها و پیام‌های انبار"
                className="relative p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200 transition-all active:scale-95 shrink-0"
              >
                <Bell className="w-4 h-4 text-blue-600 " />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Drawer / Fast Order Button - Only displayed when logged in */}
            {currentUser && (
              <button
                onClick={onOpenCart}
                id="open-cart-drawer-btn"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all shadow-md shadow-blue-600/25 whitespace-nowrap text-xs"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>
                  {cartCount > 0 
                    ? `سبد (${formatNumberFa(cartCount)})` 
                    : 'سبد'}
                </span>
              </button>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-100 [#111827] border border-slate-200 text-slate-700 "
              aria-label="منوی موبایل"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* LAYER 3: Dedicated Lower Menu Bar (Desktop + Horizontal Scroll) */}
      <div className="bg-slate-50 [#0d1322] border-b border-slate-200/90 py-1.5 px-2 sm:px-4 backdrop-blur-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          
          <div className="flex items-center gap-1 sm:gap-1.5">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  id={`nav-tab-${tab.id}`}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black shrink-0 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 '
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
        <div className="lg:hidden bg-white [#0f172a] border-b border-slate-200 p-4 space-y-4 animate-in slide-in-from-top duration-200 shadow-2xl">
          
          {/* User status card inside mobile menu */}
          {currentUser ? (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
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
              className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
            >
              <User className="w-4 h-4" />
              <span>ورود / ثبت‌نام در سامانه</span>
            </button>
          )}

          {/* Quick Action Badges in Mobile Menu */}
          {currentUser && onOpenNotifications && (
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  onOpenNotifications();
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 relative"
              >
                <Bell className="w-4 h-4 text-blue-500" />
                <span>اعلان‌های من</span>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 rounded-full">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="text-[11px] font-black text-slate-400">منوی دسترسی کامل به صفحات:</div>
          <div className="grid grid-cols-2 gap-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleSelectTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-right transition-all border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 '
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : tab.color || 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <a
              href="tel:091207594۱۹"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 "
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>پشتیبانی و ثبت سفارش تلفنی: ۰۹۱۲۰۷۵۹۴۱۹</span>
            </a>
          </div>

        </div>
      )}

    </header>
  );
};
