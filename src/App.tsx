/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  Package, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Flame, 
  Building2, 
  TrendingUp, 
  Truck, 
  BookOpen, 
  PhoneCall, 
  FileText,
  User,
  MessageSquare,
  UserCheck,
  Award,
  TrendingDown,
  Server,
  WifiOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const renderFeatureIcon = (iconName: string) => {
  const norm = (iconName || '').toLowerCase().replace(/_/g, '-');
  if (norm.includes('shield') || norm.includes('verify') || norm.includes('tick') || norm.includes('check')) {
    return <ShieldCheck className="w-5 h-5" />;
  }
  if (norm.includes('discount') || norm.includes('percent') || norm.includes('trend') || norm.includes('shape')) {
    return <TrendingDown className="w-5 h-5 text-amber-500" />;
  }
  if (norm.includes('truck') || norm.includes('fast') || norm.includes('ship') || norm.includes('bus')) {
    return <Truck className="w-5 h-5 text-blue-500" />;
  }
  if (norm.includes('user') || norm.includes('edit') || norm.includes('visitor') || norm.includes('profile')) {
    return <UserCheck className="w-5 h-5 text-indigo-500" />;
  }
  return <Award className="w-5 h-5 text-emerald-500" />;
};
import { CigaretteProduct, CigaretteCategory, CartItem, CustomerInfo, OrderInvoice, DjangoCrmConfig, NavigationTab, UserProfile, RetailShopCustomer, NotificationItem, FooterSettingsData, BannerSlide } from './types';
import { CIGARETTE_PRODUCTS, WHOLESALE_BENEFITS } from './data/products';
import { INITIAL_RETAIL_SHOPS } from './data/retailShops';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { PriceRangeSlider } from './components/PriceRangeSlider';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { ProductModal } from './components/ProductModal';
import { ProformaInvoicePage } from './components/ProformaInvoicePage';
import { CartDrawer } from './components/CartDrawer';
import { InvoiceModal } from './components/InvoiceModal';
import { ShippingSection } from './components/ShippingSection';
import { BlogSection } from './components/BlogSection';
import { OrderTracking } from './components/OrderTracking';
import { ContactAndSupport } from './components/ContactAndSupport';
import { UserProfilePanel } from './components/UserProfilePanel';
import { LivePriceTable } from './components/LivePriceTable';
import { NotificationModal } from './components/NotificationModal';
import { PwaInstallGuide } from './components/PwaInstallGuide';
import { AppUpdateNotifier } from './components/AppUpdateNotifier';
import { AccountingPosPanel } from './components/shopmanage/AccountingPosPanel';
import { AzarakhshApiDocs } from './azarakhsh/AzarakhshApiDocs';
import { HeroBannerSlider } from './components/HeroBannerSlider';
import { ProductsMegaMenu } from './components/ProductsMegaMenu';
import { InPersonPickupModal } from './components/InPersonPickupModal';
import { BackendConnectionModal } from './components/BackendConnectionModal';
import { syncWithDjangoApi, djangoDatabaseStore, djangoMarkNotificationRead, djangoMarkAllNotificationsRead } from './services/djangoApi';
import { api } from './services/api';
import { generatePriceListPdf } from './utils/pdfGenerator';
import { formatToman, formatNumberFa } from './utils/formatters';

const CATEGORIES: { id: CigaretteCategory; label: string }[] = [
  { id: 'all', label: 'همه دسته‌ها' },
  { id: 'cigarettes', label: 'سیگارهای اورجینال و شرکتی (مارلبرو / وینستون / سوبرانی / کنت / اسه)' },
  { id: 'iqos_devices', label: 'دستگاه‌های ایکاس (IQOS ILUMA Prime / ONE)' },
  { id: 'iqos_heets', label: 'استیک‌های تیریا و هیتس (IQOS TEREA)' },
  { id: 'pods_vapes', label: 'پاد سیستم، ویپ و سالت نیکوتین (GeekVape / Nasty)' },
  { id: 'tobacco', label: 'توتون پیپ و سیگارپیچ اورجینال (Captain Black / Golden Virginia)' },
  { id: 'accessories', label: 'ملزومات، فندک کلیپر و اکسسوری عمده' },
];

function getTabFromPath(pathname: string): NavigationTab {
  const p = pathname.toLowerCase();
  if (p.includes('/shopmanage') || p.includes('/sandogh') || p.includes('/pos')) return 'accounting-pos';
  if (p.includes('/azarakhsh') || p.includes('/api-docs') || p.includes('/django-docs')) return 'django-docs';
  if (p.includes('/contact-us') || p.includes('/contact') || p.includes('/tamas')) return 'contact';
  if (p.includes('/login') || p.includes('/user-panel') || p.includes('/profile') || p.includes('/hesab')) return 'user-panel';
  if (p.includes('/invoice') || p.includes('/pishfactor')) return 'invoice';
  if (p.includes('/tracking') || p.includes('/rahgiri')) return 'tracking';
  if (p.includes('/shipping') || p.includes('/barbari')) return 'shipping';
  if (p.includes('/blog') || p.includes('/maghalat')) return 'blog';
  if (p.includes('/live-prices') || p.includes('/gheymat')) return 'live-prices';
  if (p.includes('/django-crm') || p.includes('/crm')) return 'django-crm';
  return 'catalog';
}

function getPathForTab(tab: NavigationTab): string {
  switch (tab) {
    case 'catalog': return '/';
    case 'invoice': return '/invoice';
    case 'tracking': return '/tracking';
    case 'contact': return '/contact-us';
    case 'shipping': return '/shipping';
    case 'blog': return '/blog';
    case 'user-panel': return '/login';
    case 'live-prices': return '/live-prices';
    case 'django-crm': return '/django-crm';
    case 'django-docs': return '/azarakhsh';
    case 'accounting-pos': return '/shopmanage/sandogh';
    default: return '/';
  }
}

export default function App() {
  const [activeTab, setActiveTabState] = useState<NavigationTab>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'catalog';
  });

  const setActiveTab = (tab: NavigationTab, pushHistory: boolean = true) => {
    setActiveTabState(tab);
    if (pushHistory && typeof window !== 'undefined') {
      const target = getPathForTab(tab);
      // If switching to accounting-pos but already on a shopmanage sub-route, preserve it
      if (tab === 'accounting-pos' && window.location.pathname.startsWith('/shopmanage')) {
        return;
      }
      if (window.location.pathname !== target) {
        window.history.pushState({ tab }, '', target);
      }
    }
  };

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const nextTab = getTabFromPath(window.location.pathname);
        setActiveTabState(nextTab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Ensure strict light mode on mount and clear any dark mode persistence
  useEffect(() => {
    try {
      localStorage.removeItem('sevin_dark_mode');
      localStorage.setItem('sevin_dark_mode', 'false');
    } catch {}
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }, []);

  // User Profile Authentication State (Phone based)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sevin_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const handleLoginUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('sevin_current_user', JSON.stringify(user));
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('sevin_current_user');
    showToast('از حساب کاربری خارج شدید.');
  };

  const handleUpdateProfile = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('sevin_current_user', JSON.stringify(user));
  };

  // Retail Shops Customer Club state for Visitors
  const [retailShops, setRetailShops] = useState<RetailShopCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('sevin_retail_shops');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_RETAIL_SHOPS;
  });

  const handleUpdateRetailShops = (shops: RetailShopCustomer[]) => {
    setRetailShops(shops);
    localStorage.setItem('sevin_retail_shops', JSON.stringify(shops));
  };

  // Products state
  const [products, setProducts] = useState<CigaretteProduct[]>(() => {
    const saved = localStorage.getItem('wholesale_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return CIGARETTE_PRODUCTS;
      }
    }
    return CIGARETTE_PRODUCTS;
  });

  // Django CRM Configuration
  const [djangoConfig, setDjangoConfig] = useState<DjangoCrmConfig>(() => {
    const defaultContract = `بسمه تعالی - قرارداد همکاری ویزیتوری سامانه دخانیات سرو

۱. ویزیتور متعهد می‌گردد کلیه قوانین و مقررات فروش سامانه را رعایت نموده و از فروش خارج از شبکه خودداری نماید.
۲. پورسانت فروش بر اساس تعرفه‌های مصوب (در حال حاضر ۲.۵ درصد) به حساب کاربری ویزیتور منظور و پس از تسویه نهایی خریدار، قابل برداشت خواهد بود.
۳. ویزیتور موظف است مشخصات و نشانی مغازه‌ها و خریداران را به طور دقیق در سامانه ثبت نماید.
۴. تأیید این قرارداد به منزله امضای دیجیتال و پذیرش کلیه شرایط همکاری با سامانه پخش دخانیات دخانیات سرو است.`;

    const defaultHeroTitle = 'سامانه پخش عمده دخانیات دخانیات سرو با نرخ روز کارتن و باکس';
    const defaultHeroDesc = 'عرضه دست‌اول و مستقیم انواع سیگارهای اصل سوئیس، اروپا، شرکتی و دستگاه‌های IQOS با هولوگرام معتبر، صدور مستقیم پیش‌فاکتور رسمی با هزینه باربری، واریز فیش بانکی و پنل اختصاصی بنکداری.';

    const saved = localStorage.getItem('django_crm_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          companyName: 'دخانیات سرو',
          bankCard1: '۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲',
          bankShiba1: 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲',
          bankHolder1: 'امور مالی شرکت دخانیات سرو',
          bankCard2: '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰',
          bankShiba2: 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸',
          bankHolder2: 'حساب ترابری و تدارکات دخانیات سرو',
          visitorContractText: defaultContract,
          siteHeroTitle: defaultHeroTitle,
          siteHeroDesc: defaultHeroDesc,
          nationalIdCompany: '۱۰۱۰۳۸۵۲۹۱۰',
          economicCodeCompany: '۴۱۱۴۹۸۷۵۳۱۱۹',
          activityTypeCompany: 'پخش عمده دخانیات',
          transportPhoneCompany: '۰۹۱۲۰۷۵۹۴۱۹',
          showNationalIdInvoice: true,
          showEconomicCodeInvoice: true,
          showActivityTypeInvoice: true,
          showTransportPhoneInvoice: true,
          ...parsed
        };
      } catch (e) {
        // fallback
      }
    }
    return {
      apiUrl: 'https://cigar.sevinhost.ir/api/v1',
      apiToken: '',
      autoSync: false,
      syncIntervalMinutes: 10,
      lastSyncTime: new Date().toLocaleTimeString('fa-IR'),
      status: 'idle',
      totalSyncedProducts: CIGARETTE_PRODUCTS.length,
      companyName: 'دخانیات سرو',
      bankCard1: '۶۰3۷-۹۹۷۹-۷۵۳۱-۱۹۸۲',
      bankShiba1: 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲',
      bankHolder1: 'امور مالی شرکت دخانیات سرو',
      bankCard2: '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰',
      bankShiba2: 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸',
      bankHolder2: 'حساب ترابری و تدارکات دخانیات سرو',
      visitorContractText: defaultContract,
      siteHeroTitle: defaultHeroTitle,
      siteHeroDesc: defaultHeroDesc,
      nationalIdCompany: '۱۰۱۰۳۸۵۲۹۱۰',
      economicCodeCompany: '۴۱۱۴۹۸۷۵۳۱۱۹',
      activityTypeCompany: 'پخش عمده دخانیات',
      transportPhoneCompany: '۰۹۱۲۰۷۵۹۴۱۹',
      showNationalIdInvoice: true,
      showEconomicCodeInvoice: true,
      showActivityTypeInvoice: true,
      showTransportPhoneInvoice: true,
    };
  });

  // Deduct POS & website stock when an online order is placed
  const handleOnlineOrderDeductStock = (orderItems: CartItem[]) => {
    setProducts(prevProducts => {
      const updated = prevProducts.map(p => {
        const item = orderItems.find(it => it.product.id === p.id);
        if (!item) return p;

        const boxesPerCarton = p.boxesPerCarton || 50;
        const packsPerBox = p.packsPerBox || 10;

        let deltaCartons = 0;
        if (item.unit === 'carton') {
          deltaCartons = item.quantity;
        } else if (item.unit === 'box') {
          deltaCartons = item.quantity / boxesPerCarton;
        } else {
          deltaCartons = item.quantity / (boxesPerCarton * packsPerBox);
        }

        const newStockCartons = Math.max(0, Math.round((p.stockCartons - deltaCartons) * 1000) / 1000);
        return {
          ...p,
          stockCartons: newStockCartons,
          isAvailable: newStockCartons > 0,
        };
      });

      try {
        localStorage.setItem('wholesale_products', JSON.stringify(updated));
      } catch {}

      return updated;
    });
  };

  const [selectedCategory, setSelectedCategory] = useState<CigaretteCategory>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000000]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock'>('featured');
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    return [
      { product: CIGARETTE_PRODUCTS[0], unit: 'carton', quantity: 3 },
      { product: CIGARETTE_PRODUCTS[2], unit: 'carton', quantity: 5 },
    ];
  });

  const [activeProductModal, setActiveProductModal] = useState<CigaretteProduct | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<OrderInvoice | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userPanelSubTab, setUserPanelSubTab] = useState<'orders' | 'profile' | 'tickets' | 'new_ticket' | 'visitor_club' | 'visitor_report'>('orders');
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState<boolean>(false);
  const [isInPersonPickupOpen, setIsInPersonPickupOpen] = useState<boolean>(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);

  // Django server connection states
  const [isServerOffline, setIsServerOffline] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [dismissedOfflineWarning, setDismissedOfflineWarning] = useState<boolean>(false);

  const checkConnectionToDjango = useCallback(async () => {
    setIsCheckingConnection(true);
    try {
      const res = await api.config.testConnection();
      setIsServerOffline(!res.connected);
    } catch {
      setIsServerOffline(true);
    } finally {
      setIsCheckingConnection(false);
    }
  }, []);

  // Product Comparison state
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);

  const handleToggleCompareProduct = (productId: string) => {
    setComparedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 4) {
        showToast('حداکثر می‌توانید ۴ محصول را هم‌زمان مقایسه کنید.');
        return prev;
      }
      return [...prev, productId];
    });
  };

  // Dynamic Footer Settings from Django backend
  const [footerSettings, setFooterSettings] = useState<FooterSettingsData | null>(() => {
    try {
      const saved = localStorage.getItem('wholesale_footer_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Dynamic Hero Banner Sliders from Django backend
  // Note: if backend database has no slider records, sliders stays [] and the slider is completely hidden!
  const [sliders, setSliders] = useState<BannerSlide[]>([]);

  // Auto-fetch products, site settings and footer settings from unified API layer on mount or cache reset
  useEffect(() => {
    let isMounted = true;

    const refreshDataFromApi = () => {
      // 1. Fetch Products with zero cache
      api.products.getAll().then((loadedProducts) => {
        if (isMounted && loadedProducts && loadedProducts.length > 0) {
          setProducts(loadedProducts);
        }
      }).catch(() => {});

      // 2. Fetch Footer & Site Settings
      api.footer.getSettings().then((loadedFooter) => {
        if (isMounted && loadedFooter) {
          setFooterSettings(loadedFooter);
          setDjangoConfig(prev => ({
            ...prev,
            companyName: loadedFooter.company_title || prev.companyName,
            transportPhoneCompany: loadedFooter.phone_number || prev.transportPhoneCompany,
          }));
        }
      }).catch(() => {});

      // 3. Fetch Site CRM Config
      api.siteSettings.getConfig().then((loadedCrm) => {
        if (isMounted && loadedCrm) {
          setDjangoConfig(prev => ({
            ...prev,
            ...loadedCrm
          }));
        }
      }).catch(() => {});

      // 4. Fetch Hero Sliders (zero-cache)
      // Strictly follows rule: if backend database has no sliders, sliders stays [] and slider is hidden
      api.sliders.getAll().then((loadedSliders) => {
        if (isMounted) {
          setSliders(loadedSliders || []);
        }
      }).catch(() => {
        if (isMounted) {
          setSliders([]);
        }
      });

      // 5. Fetch Notifications from Django backend database (/api/v1/notifications/list/)
      api.notifications.getAll().then((loadedNotifs) => {
        if (isMounted) {
          setNotifications(loadedNotifs || []);
        }
      }).catch(() => {
        if (isMounted) {
          setNotifications([]);
        }
      });
    };

    // Initial fresh fetch on mount
    refreshDataFromApi();

    // Listen for cache-cleared or API URL changes to immediately reload fresh data
    const handleCacheCleared = () => {
      refreshDataFromApi();
    };

    window.addEventListener('sevin-cache-cleared', handleCacheCleared);
    window.addEventListener('sevin-api-url-changed', handleCacheCleared);

    return () => {
      isMounted = false;
      window.removeEventListener('sevin-cache-cleared', handleCacheCleared);
      window.removeEventListener('sevin-api-url-changed', handleCacheCleared);
    };
  }, []);

  // Periodically check Django backend connection
  useEffect(() => {
    checkConnectionToDjango();
    
    // Check every 25 seconds
    const interval = setInterval(() => {
      checkConnectionToDjango();
    }, 25000);

    const handleUrlChange = () => {
      checkConnectionToDjango();
    };

    window.addEventListener('sevin-api-url-changed', handleUrlChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sevin-api-url-changed', handleUrlChange);
    };
  }, [checkConnectionToDjango]);

  // Notifications state from Django backend database
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifLoading, setIsNotifLoading] = useState<boolean>(false);

  // Re-sync notifications from backend database
  const reloadNotificationsFromDatabase = useCallback(async () => {
    setIsNotifLoading(true);
    try {
      const loaded = await api.notifications.getAll();
      setNotifications(loaded || []);
    } catch {
      setNotifications([]);
    } finally {
      setIsNotifLoading(false);
    }
  }, []);

  // Re-sync notifications when modal opens or on storage event
  useEffect(() => {
    if (isNotifModalOpen) {
      reloadNotificationsFromDatabase();
    }
    const handleStorage = () => {
      reloadNotificationsFromDatabase();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isNotifModalOpen, reloadNotificationsFromDatabase]);

  const unreadNotifCount = useMemo(() => {
    if (!currentUser) return 0;
    return notifications.filter(n => {
      const isRead = Boolean(n.isRead ?? n.is_read);
      if (isRead) return false;
      if (!n.targetAudience || n.targetAudience === 'all' || n.user === null) return true;
      if (currentUser.role === 'visitor' && n.targetAudience === 'visitors') return true;
      if (currentUser.role === 'customer' && n.targetAudience === 'customers') return true;
      if (n.targetAudience === 'direct' && (
        n.targetUserId === currentUser.id || 
        n.targetUserId === currentUser.phone || 
        String(n.user_id) === String(currentUser.id) || 
        String(n.user) === String(currentUser.id)
      )) return true;
      return false;
    }).length;
  }, [notifications, currentUser]);

  const handleMarkNotifAsRead = async (id: string | number) => {
    setNotifications(prev => prev.map(n => String(n.id) === String(id) ? { ...n, isRead: true, is_read: true } : n));
    try {
      await api.notifications.markRead(id, true);
    } catch (e) {
      console.warn('Failed to mark notification as read in database:', e);
    }
  };

  const handleMarkAllNotifsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: true })));
    try {
      await api.notifications.markAllRead();
    } catch (e) {
      console.warn('Failed to mark all notifications as read in database:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync with Django CRM
  const handleSyncDjango = async () => {
    setDjangoConfig(prev => ({ ...prev, status: 'connecting', errorMessage: undefined }));
    try {
      const syncedProducts = await syncWithDjangoApi(djangoConfig);
      setProducts(syncedProducts);
      localStorage.setItem('wholesale_products', JSON.stringify(syncedProducts));
      
      const nowStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      const updatedConfig: DjangoCrmConfig = {
        ...djangoConfig,
        status: 'connected',
        lastSyncTime: nowStr,
        totalSyncedProducts: syncedProducts.length,
      };
      setDjangoConfig(updatedConfig);
      localStorage.setItem('django_crm_config', JSON.stringify(updatedConfig));
      showToast(`همگام‌سازی با موفقیت انجام شد (${formatNumberFa(syncedProducts.length)} کالا به‌روزرسانی شد).`);
    } catch (err: any) {
      setDjangoConfig(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err.message || 'خطا در برقراری ارتباط با وب‌سرویس جنگو',
      }));
      showToast('خطا در دریافت اطلاعات از جنگو CRM.');
    }
  };

  const handleAddNewProduct = (partial: Partial<CigaretteProduct>) => {
    const fullProduct: CigaretteProduct = {
      id: partial.id || `p-${Date.now()}`,
      nameFa: partial.nameFa || 'سیگار جدید',
      nameEn: partial.nameEn || 'New Product',
      brand: partial.brand || 'Marlboro',
      category: partial.category || 'cigarettes',
      barcode: partial.barcode || '6260000000000',
      badge: partial.badge || 'بار تازه دخانیات سرو',
      origin: partial.origin || 'وارداتی اصل',
      hologram: partial.hologram || 'اورجینال اروپایی',
      cartonPrice: partial.cartonPrice || 80000000,
      boxPrice: partial.boxPrice || 1600000,
      baseCartonPrice: partial.cartonPrice || 80000000,
      baseBoxPrice: partial.boxPrice || 1600000,
      boxesPerCarton: partial.boxesPerCarton || 50,
      moq: partial.moq || 1,
      stockCartons: partial.stockCartons || 50,
      tar: partial.tar || '6 mg',
      nicotine: partial.nicotine || '0.5 mg',
      description: partial.description || 'توزیع عمده در بسته‌بندی پلمپ کارخانه‌ای انبار مرکزی جنت‌آباد',
      image: partial.image || 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80',
      priceTrend: 'stable',
      lastPriceUpdate: 'هم‌اکنون',
      isAvailable: true,
      tierDiscounts: partial.tierDiscounts || [
        { minQuantity: 3, unit: 'carton', discountPercent: 2.5 },
        { minQuantity: 6, unit: 'carton', discountPercent: 5.0 },
      ]
    };

    setProducts(prev => [fullProduct, ...prev]);
    showToast(`محصول «${fullProduct.nameFa}» به کاتالوگ افزوده شد.`);
  };

  // Distinct Brands (Excluding in-person drinks/coffee)
  const uniqueBrands = useMemo(() => {
    const brands = Array.from(
      new Set(
        products
          .filter(p => !p.isPosOnly && p.category !== 'drinks_coffee')
          .map(p => p.brand)
      )
    );
    return ['all', ...brands];
  }, [products]);

  // Filtered & Sorted products (Online cigarette & tobacco store only)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Exclude in-person POS items (coffee & soft drinks) from the online website
      if (product.isPosOnly || product.category === 'drinks_coffee') return false;

      const matchCat = selectedCategory === 'all' || product.category === selectedCategory;
      const matchBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      const matchPrice = product.cartonPrice >= priceRange[0] && product.cartonPrice <= priceRange[1];
      const matchQuery = 
        product.nameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery);

      return matchCat && matchBrand && matchPrice && matchQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.cartonPrice - b.cartonPrice;
      if (sortBy === 'price-desc') return b.cartonPrice - a.cartonPrice;
      if (sortBy === 'stock') return b.stockCartons - a.stockCartons;
      return 0;
    });
  }, [products, selectedCategory, selectedBrand, priceRange, searchQuery, sortBy]);

  // Cart operations
  const handleAddToCart = (product: CigaretteProduct, unit: 'carton' | 'box', quantity: number) => {
    if (!currentUser) {
      showToast('برای افزودن کالا به سبد خرید و ثبت سفارش، لطفاً ابتدا وارد پنل کاربری شوید.');
      setActiveTab('user-panel');
      return;
    }
    if (currentUser.role === 'customer' && (!currentUser.isProfileCompleted || !currentUser.address || currentUser.fullName.includes('گرامی'))) {
      showToast('⚠️ مشتری گرامی: جهت ثبت خرید و فاکتور رسمی، ابتدا نام مسئول، نام فروشگاه و آدرس را در پنل کاربری تکمیل فرمایید.');
      setActiveTab('user-panel');
      return;
    }
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.unit === unit);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, unit, quantity }];
    });
    showToast(`تعداد ${formatNumberFa(quantity)} ${unit === 'carton' ? 'کارتن' : 'باکس'} ${product.nameFa} به پیش‌فاکتور افزوده شد.`);
  };

  const handleUpdateQuantity = (productId: string, unit: 'carton' | 'box', newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(productId, unit);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId && item.unit === unit) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveCartItem = (productId: string, unit: 'carton' | 'box') => {
    setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.unit === unit)));
    showToast('ردیف کالا از پیش‌فاکتور حذف گردید.');
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('سبد سفارشات خالی شد.');
  };

  const handleReorderItems = (reorderItems: CartItem[]) => {
    setCartItems(prev => {
      const updated = [...prev];
      for (const newItem of reorderItems) {
        const idx = updated.findIndex(i => i.product.id === newItem.product.id && i.unit === newItem.unit);
        if (idx > -1) {
          updated[idx].quantity += newItem.quantity;
        } else {
          updated.push(newItem);
        }
      }
      return updated;
    });
    setActiveTab('invoice');
  };

  const handlePickupOrderSubmitted = (order: OrderInvoice) => {
    handleOnlineOrderDeductStock(order.items);
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        orderHistory: [order, ...(currentUser.orderHistory || [])]
      };
      handleUpdateProfile(updatedUser);
    }
    handleClearCart();
  };

  // Cart summary numbers
  const cartTotalCartons = cartItems.reduce((acc, curr) => curr.unit === 'carton' ? acc + curr.quantity : acc, 0);
  const cartTotalBoxes = cartItems.reduce((acc, curr) => curr.unit === 'box' ? acc + curr.quantity : acc, 0);

  if (activeTab === 'accounting-pos') {
    return (
      <AccountingPosPanel
        products={products}
        onUpdateProductsStock={setProducts}
        onReturnToStore={() => setActiveTab('catalog')}
      />
    );
  }

  if (activeTab === 'django-docs') {
    return (
      <AzarakhshApiDocs onReturnToApp={() => setActiveTab('catalog')} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.length}
        cartTotalCartons={cartTotalCartons}
        cartTotalBoxes={cartTotalBoxes}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogoutUser}
        unreadNotificationsCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        onOpenInstallGuide={() => setIsPwaModalOpen(true)}
        onOpenProductsMenu={() => setIsProductsMenuOpen(true)}
        onOpenInPersonPickup={() => setIsInPersonPickupOpen(true)}
        companyTitle={footerSettings?.company_title || djangoConfig.companyName}
        phoneNumber={footerSettings?.phone_number || djangoConfig.transportPhoneCompany}
        warehouseAddress={footerSettings?.address_text}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main App Body */}
      <main className="flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        
        {/* Django Server Offline Graceful Alert Banner */}
        {isServerOffline && !dismissedOfflineWarning && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-in fade-in duration-200" dir="rtl">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <WifiOff className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>عدم دسترسی به سرور مرکزی جنگو (Django)</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[9px] font-bold border border-amber-300">
                    حالت آفلاین محلی (Sandbox)
                  </span>
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-medium">
                  سیستم به دلیل عدم پاسخگویی پایگاه‌داده یا سرور بک‌اند، به طور خودکار به حالت شبیه‌ساز محلی انتقال یافته است تا هیچ‌گونه خللی در صدور فاکتور، کنترل انبار و سبد خرید ایجاد نشود. داده‌های شما در مرورگر ذخیره شده و به محض بالا آمدن سرور قابل همگام‌سازی خواهند بود.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
              <button
                type="button"
                onClick={checkConnectionToDjango}
                disabled={isCheckingConnection}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingConnection ? 'animate-spin' : ''}`} />
                <span>تلاش مجدد</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBackendModalOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-[11px] font-black transition-colors cursor-pointer"
              >
                تنظیمات آدرس IP / سرور
              </button>
              <button
                type="button"
                onClick={() => setDismissedOfflineWarning(true)}
                className="px-3 py-2 bg-transparent hover:bg-slate-200/50 text-slate-500 rounded-xl text-[11px] font-medium transition-colors cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
        
        {/* TAB 1: Catalog */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Spacious Premium Hero Banner Slider - Hidden completely if backend has no slider records */}
            {sliders && sliders.length > 0 && (
              <HeroBannerSlider
                slides={sliders}
                products={products}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
              />
            )}

            {/* Wholesale Features Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {WHOLESALE_BENEFITS.map((b, idx) => (
                <div key={idx} className="group relative bg-white border border-slate-200/90 p-4 rounded-2xl flex items-start gap-3 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 opacity-75 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-10 h-10 rounded-2xl bg-blue-50/80 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {renderFeatureIcon(b.icon)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {b.title}
                      </h4>
                      {b.badge && (
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md border border-blue-200 shrink-0">
                          {b.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter & Search Bar */}
            {/* Search, Filter & Categories */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
                
                {/* Search Input (Wide & Spacious) */}
                <div className="relative flex-1 min-w-[280px] sm:min-w-[380px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="جستجوی نام سیگار، برند، کشور مبدأ یا بارکد کالا..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-9 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium transition-all shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-full hover:bg-slate-200 cursor-pointer"
                      title="پاک کردن جستجو"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Brand & Sort Selectors */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-slate-500 font-bold">برند:</span>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-2xl px-3.5 py-3 focus:outline-hidden focus:border-blue-500 font-bold cursor-pointer"
                    >
                      <option value="all">همه برندها</option>
                      {uniqueBrands.filter(b => b !== 'all').map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-slate-500 font-bold">مرتب‌سازی:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-2xl px-3.5 py-3 focus:outline-hidden focus:border-blue-500 font-bold cursor-pointer"
                    >
                      <option value="featured">پیش‌فرض (پرفروش‌ترین‌ها)</option>
                      <option value="price-asc">ارزان‌ترین نرخ کارتن</option>
                      <option value="price-desc">گران‌ترین (لوکس‌ترین)</option>
                      <option value="stock">بیشترین موجودی انبار</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <span className="text-xs text-slate-500 font-bold block mb-2">محدوده قیمت کارتن:</span>
                <PriceRangeSlider
                  min={0}
                  max={200000000}
                  currentMin={priceRange[0]}
                  currentMax={priceRange[1]}
                  onChange={(min, max) => setPriceRange([min, max])}
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-xs font-black'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 '
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500 ">
                <span>
                  نمایش <strong className="text-slate-900 ">{formatNumberFa(filteredProducts.length)}</strong> ردیف کالای عمده در انبار جنت‌آباد
                </span>
                <span className="text-blue-700 font-black">
                  فروش مستقیم کارتن و باکس پلمپ
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="text-sm font-bold text-slate-700 ">
                    موردی با این مشخصات یافت نشد
                  </div>
                  <p className="text-xs text-slate-500 ">
                    عبارت دیگری را جستجو کنید یا فیلتر دسته‌بندی را روی «همه» بگذارید.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedBrand('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs rounded-xl hover:bg-slate-200 transition-colors font-bold"
                  >
                    پاکسازی همه فیلترها
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onOpenDetails={(p) => setActiveProductModal(p)}
                      isSelected={comparedProductIds.includes(product.id)}
                      onToggleSelect={handleToggleCompareProduct}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Floating Comparison Bar */}
        {comparedProductIds.length > 0 && activeTab === 'catalog' && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-4 border border-slate-700 animate-in slide-in-from-bottom-6 duration-300">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                {comparedProductIds.length}
              </span>
              <span className="text-xs font-bold">محصول انتخاب شده برای مقایسه</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsComparisonModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                مشاهده پنجره مقایسه
              </button>
              <button
                onClick={() => setComparedProductIds([])}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                پاک کردن
              </button>
            </div>
          </div>
        )}

        {/* Product Comparison Modal */}
        <ProductComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
          selectedProducts={products.filter(p => comparedProductIds.includes(p.id))}
          onRemoveProduct={handleToggleCompareProduct}
          onAddToCart={handleAddToCart}
        />

        {/* TAB 2: Live Price List */}
        {activeTab === 'live-prices' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <LivePriceTable
              products={products}
              onAddToCart={handleAddToCart}
              onSelectProduct={(p) => setActiveProductModal(p)}
            />
          </div>
        )}

        {/* TAB 3: User Panel (Orders, Invoices, Profile, Support Tickets) */}
        {activeTab === 'user-panel' && (
          <UserProfilePanel
            currentUser={currentUser}
            onLogin={handleLoginUser}
            onLogout={handleLogoutUser}
            onUpdateProfile={handleUpdateProfile}
            retailShops={retailShops}
            onUpdateRetailShops={handleUpdateRetailShops}
            djangoConfig={djangoConfig}
            availableProducts={products}
            onReorderItems={handleReorderItems}
            onOpenTracking={(trackingCode) => {
              setActiveTab('tracking');
              showToast(`کد رهگیری ${trackingCode} در بخش پیگیری ثبت شد.`);
            }}
            showToast={showToast}
            initialSubTab={userPanelSubTab}
          />
        )}

        {/* TAB 3: Official Proforma Invoice */}
        {activeTab === 'invoice' && (
          currentUser ? (
            <ProformaInvoicePage
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              onAddToCart={handleAddToCart}
              onGoToCatalog={() => setActiveTab('catalog')}
              availableProducts={products}
              currentUser={currentUser}
              onOrderSubmitted={handleOnlineOrderDeductStock}
              onOpenTracking={(trackingCode) => {
                setActiveTab('tracking');
                showToast(`کد رهگیری ${trackingCode} در بخش پیگیری ثبت شد.`);
              }}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 ">مشاهده و صدور فاکتور رسمی</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                جهت صدور فاکتور رسمی بر اساس مشخصات حقیقی یا حقوقی، لطفاً ابتدا وارد حساب کاربری خود شوید.
              </p>
              <button
                onClick={() => setActiveTab('user-panel')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-md transition-all"
              >
                ورود به پنل کاربری
              </button>
            </div>
          )
        )}

                {/* TAB 4: Contact and Support Form (Replacing WebSocket) */}
        {activeTab === 'contact' && (
          <ContactAndSupport
            showToast={showToast}
            footerData={footerSettings}
            djangoConfig={djangoConfig}
            onOpenUserPanel={() => setActiveTab('user-panel')}
          />
        )}

        {/* TAB 5: Blog and SEO */}
        {activeTab === 'blog' && (
          <BlogSection onSelectProductTag={(b) => {
            setSelectedBrand(b);
            setActiveTab('catalog');
          }} />
        )}

        {/* TAB 6: Shipping and Transport */}
        {activeTab === 'shipping' && (
          <ShippingSection />
        )}

        {/* TAB 7: Order and Fleet Tracking */}
        {activeTab === 'tracking' && (
          <OrderTracking />
        )}

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        retailShops={retailShops}
        djangoConfig={djangoConfig}
        onOrderSubmitted={handleOnlineOrderDeductStock}
        onNavigateToProfile={() => {
          setUserPanelSubTab('profile');
          setActiveTab('user-panel');
        }}
      />

      {/* Product Details Modal */}
      {activeProductModal && (
        <ProductModal
          product={activeProductModal}
          onClose={() => setActiveProductModal(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Proforma Invoice Modal */}
      {activeInvoice && (
        <InvoiceModal
          invoice={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        currentUser={currentUser}
        onMarkAsRead={handleMarkNotifAsRead}
        onMarkAllAsRead={handleMarkAllNotifsAsRead}
        isLoading={isNotifLoading}
        onRefresh={reloadNotificationsFromDatabase}
      />

      {/* Dynamic Modern Wholesale Footer from Django Backend */}
      <Footer 
        footerData={footerSettings} 
        djangoConfig={djangoConfig} 
        onNavigateTab={(tab) => setActiveTab(tab)} 
      />

      {/* Progressive Web App (PWA) installation guide helper */}
      <PwaInstallGuide 
        isOpenOnly={isPwaModalOpen} 
        onCloseModal={() => setIsPwaModalOpen(false)} 
      />

      {/* Auto-update toast notifier for installed PWA & web users */}
      <AppUpdateNotifier />

      {/* Products Mega Menu Modal */}
      <ProductsMegaMenu
        isOpen={isProductsMenuOpen}
        onClose={() => setIsProductsMenuOpen(false)}
        products={products}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId as CigaretteCategory);
          setSelectedBrand('all');
        }}
        onSelectBrand={(brandName) => {
          setSelectedBrand(brandName);
          setSelectedCategory('all');
        }}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenInPersonPickup={() => setIsInPersonPickupOpen(true)}
      />

      {/* In-Person Counter Pickup Modal */}
      <InPersonPickupModal
        isOpen={isInPersonPickupOpen}
        onClose={() => setIsInPersonPickupOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        products={products}
        onOrderSubmitted={handlePickupOrderSubmitted}
        showToast={showToast}
      />

      {/* Backend API Base URL and Connection Management Modal */}
      <BackendConnectionModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        products={products}
        onProductsUpdated={(newProducts) => setProducts(newProducts)}
        showToast={showToast}
      />

    </div>
  );
}
