/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  TrendingDown
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
import { CigaretteProduct, CigaretteCategory, CartItem, CustomerInfo, OrderInvoice, DjangoCrmConfig, NavigationTab, UserProfile, RetailShopCustomer, NotificationItem } from './types';
import { CIGARETTE_PRODUCTS, WHOLESALE_BENEFITS } from './data/products';
import { INITIAL_RETAIL_SHOPS } from './data/retailShops';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { DjangoApiPanel } from './components/DjangoApiPanel';
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
import { SashaApiDocs } from './sasha/SashaApiDocs';
import { syncWithDjangoApi } from './services/djangoApi';
import { generatePriceListPdf } from './utils/pdfGenerator';
import { formatToman, formatNumberFa } from './utils/formatters';

const CATEGORIES: { id: CigaretteCategory; label: string }[] = [
  { id: 'all', label: 'همه دسته‌ها' },
  { id: 'cigarettes', label: 'سیگارهای اورجینال و شرکتی (مارلبرو / وینستون / سوبرانی)' },
  { id: 'iqos_devices', label: 'دستگاه‌های ایکاس (IQOS ILUMA Prime / ONE)' },
  { id: 'iqos_heets', label: 'استیک‌های تیریا و هیتس (IQOS TEREA)' },
  { id: 'pods_vapes', label: 'پاد سیستم، ویپ و سالت نیکوتین (GeekVape / Nasty)' },
  { id: 'tobacco', label: 'توتون پیپ و سیگارپیچ اورجینال (Captain Black / Golden Virginia)' },
  { id: 'accessories', label: 'ملزومات، فندک کلیپر و اکسسوری عمده' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('catalog');
  const [isSashaRoute, setIsSashaRoute] = useState<boolean>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      return path.startsWith('/sasha') || path.includes('sasha') || hash.includes('sasha');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleLocationCheck = () => {
      try {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        if (path.startsWith('/sasha') || path.includes('sasha') || hash.includes('sasha')) {
          setIsSashaRoute(true);
        }
      } catch {}
    };

    handleLocationCheck();
    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
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
    const defaultContract = `بسمه تعالی - قرارداد همکاری ویزیتوری سامانه سوین

۱. ویزیتور متعهد می‌گردد کلیه قوانین و مقررات فروش سامانه را رعایت نموده و از فروش خارج از شبکه خودداری نماید.
۲. پورسانت فروش بر اساس تعرفه‌های مصوب (در حال حاضر ۲.۵ درصد) به حساب کاربری ویزیتور منظور و پس از تسویه نهایی خریدار، قابل برداشت خواهد بود.
۳. ویزیتور موظف است مشخصات و نشانی مغازه‌ها و خریداران را به طور دقیق در سامانه ثبت نماید.
۴. تأیید این قرارداد به منزله امضای دیجیتال و پذیرش کلیه شرایط همکاری با سامانه پخش دخانیات سوین است.`;

    const defaultHeroTitle = 'سامانه پخش عمده دخانیات سوین با نرخ روز کارتن و باکس';
    const defaultHeroDesc = 'عرضه دست‌اول و مستقیم انواع سیگارهای اصل سوئیس، اروپا، شرکتی و دستگاه‌های IQOS با هولوگرام معتبر، صدور مستقیم پیش‌فاکتور رسمی با هزینه باربری، واریز فیش بانکی و پنل اختصاصی بنکداری.';

    const saved = localStorage.getItem('django_crm_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          companyName: 'سوین',
          bankCard1: '۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲',
          bankShiba1: 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲',
          bankHolder1: 'امور مالی شرکت سوین',
          bankCard2: '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰',
          bankShiba2: 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸',
          bankHolder2: 'حساب ترابری و تدارکات سوین',
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
      apiUrl: 'https://crm.sevin-tobacco.ir/api/v1/',
      apiToken: '',
      autoSync: false,
      syncIntervalMinutes: 10,
      lastSyncTime: new Date().toLocaleTimeString('fa-IR'),
      status: 'idle',
      totalSyncedProducts: CIGARETTE_PRODUCTS.length,
      companyName: 'سوین',
      bankCard1: '۶۰3۷-۹۹۷۹-۷۵۳۱-۱۹۸۲',
      bankShiba1: 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲',
      bankHolder1: 'امور مالی شرکت سوین',
      bankCard2: '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰',
      bankShiba2: 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸',
      bankHolder2: 'حساب ترابری و تدارکات سوین',
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

  const [selectedCategory, setSelectedCategory] = useState<CigaretteCategory>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
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
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return [
      {
        id: 'notif-1',
        title: 'تغییر نرخ تعرفه باربری بین‌شهری',
        message: 'تعرفه ارسال بار به استان‌های اصفهان و فارس در سیستم به‌روزرسانی شد.',
        type: 'info',
        targetAudience: 'all',
        createdAt: '۱۴۰۳/۰۶/۰۲',
        isRead: false,
      },
      {
        id: 'notif-2',
        title: 'ارسال بیجک باربری شورآباد',
        message: 'بیجک بارگیری سفارش‌های جدید صادره از انبار شورآباد از طریق پیامک ارسال گردید.',
        type: 'success',
        targetAudience: 'all',
        createdAt: '۱۴۰۳/۰۶/۰۱',
        isRead: false,
      },
      {
        id: 'notif-3',
        title: 'اطلاعیه ویژه سفیران فروش (ویزیتورها)',
        message: 'پورسانت‌های تسویه‌شده سفارشات هفته گذشته در پنل مالی ویزیتورها قابل مشاهده است.',
        type: 'urgent',
        targetAudience: 'visitors',
        createdAt: '۱۴۰۳/۰۵/۲۸',
        isRead: false,
      }
    ];
  });

  const unreadNotifCount = useMemo(() => {
    if (!currentUser) return 0;
    return notifications.filter(n => {
      if (n.isRead) return false;
      if (n.targetAudience === 'all') return true;
      if (currentUser.role === 'visitor' && n.targetAudience === 'visitors') return true;
      if (currentUser.role === 'customer' && n.targetAudience === 'customers') return true;
      if (n.targetAudience === 'direct' && (n.targetUserId === currentUser.id || n.targetUserId === currentUser.phone)) return true;
      return false;
    }).length;
  }, [notifications, currentUser]);

  const handleMarkNotifAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotifsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
      badge: partial.badge || 'بار تازه سوین',
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

  // Distinct Brands
  const uniqueBrands = useMemo(() => {
    const brands = Array.from(new Set(products.map(p => p.brand)));
    return ['all', ...brands];
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchCat = selectedCategory === 'all' || product.category === selectedCategory;
      const matchBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      const matchQuery = 
        product.nameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery);

      return matchCat && matchBrand && matchQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.cartonPrice - b.cartonPrice;
      if (sortBy === 'price-desc') return b.cartonPrice - a.cartonPrice;
      if (sortBy === 'stock') return b.stockCartons - a.stockCartons;
      return 0;
    });
  }, [products, selectedCategory, selectedBrand, searchQuery, sortBy]);

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

  // Cart summary numbers
  const cartTotalCartons = cartItems.reduce((acc, curr) => curr.unit === 'carton' ? acc + curr.quantity : acc, 0);
  const cartTotalBoxes = cartItems.reduce((acc, curr) => curr.unit === 'box' ? acc + curr.quantity : acc, 0);

  if (isSashaRoute || activeTab === 'django-docs') {
    return (
      <SashaApiDocs
        onReturnToApp={() => {
          setIsSashaRoute(false);
          setActiveTab('catalog');
          try {
            window.history.pushState({}, '', '/');
          } catch {}
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 dark:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom duration-200 border border-slate-700">
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
        isDjangoConnected={djangoConfig.status === 'connected'}
        onQuickSyncDjango={handleSyncDjango}
        isSyncingDjango={djangoConfig.status === 'connecting'}
        currentUser={currentUser}
        onLogout={handleLogoutUser}
        unreadNotificationsCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        onOpenInstallGuide={() => setIsPwaModalOpen(true)}
        onOpenSashaDocs={() => {
          setIsSashaRoute(true);
          try {
            window.history.pushState({}, '', '/sasha');
          } catch {}
        }}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* TAB 1: Catalog */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Wholesale Light Hero Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
              <div className="max-w-3xl space-y-2.5 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black">
                  <Flame className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                  سامانه پخش مستقیم از انبار مرکزی جنت‌آباد {djangoConfig.companyName || 'سوین'}
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {djangoConfig.siteHeroTitle || 'سامانه پخش عمده دخانیات سوین با نرخ روز کارتن و باکس'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {djangoConfig.siteHeroDesc || 'عرضه دست‌اول و مستقیم انواع سیگارهای اصل سوئیس، اروپا، شرکتی و دستگاه‌های IQOS با هولوگرام معتبر، صدور مستقیم پیش‌فاکتور رسمی با هزینه باربری، واریز فیش بانکی و پنل اختصاصی بنکداری.'}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveTab('live-prices')}
                    className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
                  >
                    <TrendingUp className="w-4 h-4" />
                    تابلوی نرخ لحظه‌ای بازار
                  </button>

                  {currentUser && (
                    <button
                      onClick={() => setActiveTab('invoice')}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      صدور پیش‌فاکتور رسمی
                    </button>
                  )}

                  <button
                    onClick={() => generatePriceListPdf(products, 'all')}
                    className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors active:scale-95 border border-slate-700"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    دانلود PDF لیست نرخ سوین
                  </button>
                </div>
              </div>
            </div>

            {/* Wholesale Features Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {WHOLESALE_BENEFITS.map((b, idx) => (
                <div key={idx} className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl flex items-start gap-3 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 opacity-75 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-10 h-10 rounded-2xl bg-blue-50/80 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {renderFeatureIcon(b.icon)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {b.title}
                      </h4>
                      {b.badge && (
                        <span className="text-[9px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 shrink-0">
                          {b.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                
                {/* Search Input */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="جستجوی نام سیگار، برند، مبدأ یا بارکد..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pr-10 pl-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Brand & Sort Selectors */}
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">برند:</span>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-2xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-bold"
                    >
                      <option value="all">همه برندها</option>
                      {uniqueBrands.filter(b => b !== 'all').map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">مرتب‌سازی:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-2xl px-3 py-2.5 focus:outline-hidden focus:border-blue-500 font-bold"
                    >
                      <option value="featured">پیش‌فرض (پرفروش‌ترین‌ها)</option>
                      <option value="price-asc">ارزان‌ترین نرخ کارتن</option>
                      <option value="price-desc">گران‌ترین (لوکس‌ترین)</option>
                      <option value="stock">بیشترین موجودی انبار</option>
                    </select>
                  </div>
                </div>
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
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  نمایش <strong className="text-slate-900 dark:text-white">{formatNumberFa(filteredProducts.length)}</strong> ردیف کالای عمده در انبار جنت‌آباد
                </span>
                <span className="text-blue-700 dark:text-blue-400 font-black">
                  فروش مستقیم کارتن و باکس پلمپ
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-xs">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    موردی با این مشخصات یافت نشد
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    عبارت دیگری را جستجو کنید یا فیلتر دسته‌بندی را روی «همه» بگذارید.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedBrand('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-xl hover:bg-slate-200 transition-colors font-bold"
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
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

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
              onOpenTracking={(trackingCode) => {
                setActiveTab('tracking');
                showToast(`کد رهگیری ${trackingCode} در بخش پیگیری ثبت شد.`);
              }}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">مشاهده و صدور فاکتور رسمی</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
          <OrderTracking onSelectProduct={() => setActiveTab('catalog')} />
        )}

        {/* TAB 8: Django CRM & Architecture Code Panel */}
        {activeTab === 'django-crm' && (
          <DjangoApiPanel
            config={djangoConfig}
            onUpdateConfig={(cfg) => {
              setDjangoConfig(cfg);
              localStorage.setItem('django_crm_config', JSON.stringify(cfg));
            }}
            onSyncWithDjango={handleSyncDjango}
            onAddNewProduct={handleAddNewProduct}
            productsCount={products.length}
          />
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
      />

      {/* Modern Wholesale Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/20">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-slate-900 dark:text-white text-sm">سامانه پخش عمده دخانیات {djangoConfig.companyName}</div>
                <div className="text-[11px] text-slate-400">انبار مرکزی تهران (منطقه ۵، جنت‌آباد) | تلفن سفارشات: <strong className="text-blue-700 dark:text-blue-400" dir="ltr">۰۹۱۲۰۷۵۹۴۱۹</strong></div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold flex-wrap justify-center sm:justify-end">
              <button onClick={() => setActiveTab('catalog')} className="hover:text-blue-600 transition-colors">کاتالوگ کالاها</button>
              <button onClick={() => setActiveTab('invoice')} className="hover:text-blue-600 transition-colors">پیش‌فاکتور رسمی</button>
              <button onClick={() => setActiveTab('tracking')} className="hover:text-blue-600 transition-colors">رهگیری بارنامه</button>
              <button onClick={() => setActiveTab('contact')} className="hover:text-blue-600 transition-colors">فرم تماس</button>
              <button onClick={() => setActiveTab('shipping')} className="hover:text-blue-600 transition-colors">باربری و کرایه</button>
              <button onClick={() => setActiveTab('blog')} className="hover:text-blue-600 transition-colors">مقالات خواندنی</button>
              <button 
                onClick={() => {
                  setIsSashaRoute(true);
                  try {
                    window.history.pushState({}, '', '/sasha');
                  } catch {}
                }} 
                className="text-blue-600 font-black hover:underline transition-colors"
              >
                مستندات جنگو (/sasha)
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-semibold text-center sm:text-right">
            <div>
              طراحی و توسعه توسط سوین تیم و میزبانی وب سایت بر خط سرور های قدرتمند سوین هاست
            </div>
            <div className="text-[10px] text-slate-400/80">
              © کلیه حقوق مادی و معنوی برای پخش عمده {djangoConfig.companyName} محفوظ است.
            </div>
          </div>
        </div>
      </footer>

      {/* Progressive Web App (PWA) installation guide helper */}
      <PwaInstallGuide 
        isOpenOnly={isPwaModalOpen} 
        onCloseModal={() => setIsPwaModalOpen(false)} 
      />

    </div>
  );
}
