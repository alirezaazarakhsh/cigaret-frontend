import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  CheckCheck, 
  Users, 
  User, 
  Tag, 
  Package, 
  CreditCard, 
  Info, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  Clock,
  Radio,
  Check,
  Briefcase,
  Store,
  Building2,
  BadgePercent,
  Pencil,
  X
} from 'lucide-react';
import { DjangoCrmConfig, RetailShopCustomer, WarehouseStaffUser } from '../../types';
import { visitorsApi } from '../../services/api';
import { 
  djangoFetchNotifications, 
  djangoCreateNotification, 
  djangoUpdateNotification,
  djangoDeleteNotification, 
  djangoMarkNotificationRead, 
  djangoMarkAllNotificationsRead,
  djangoFetchNotificationUnreadCount
} from '../../services/djangoApi';

interface NotificationManagementPanelProps {
  crmConfig: DjangoCrmConfig;
  customers: any[];
  currentStaff: WarehouseStaffUser;
  onOpenBackendModal?: () => void;
}

export const NotificationManagementPanel: React.FC<NotificationManagementPanelProps> = ({
  crmConfig,
  customers,
  currentStaff,
  onOpenBackendModal
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'customers' | 'visitors' | 'direct'>('all');

  // Form State: Two Primary Target Categories (1. مشتریان عمومی, 2. ویزیتوران)
  const [targetCategory, setTargetCategory] = useState<'customers' | 'visitors'>('customers');
  const [customerScope, setCustomerScope] = useState<'all' | 'direct'>('all');
  const [visitorScope, setVisitorScope] = useState<'all' | 'direct'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedVisitorId, setSelectedVisitorId] = useState<string>('');
  const [customUserPhone, setCustomUserPhone] = useState<string>('');
  const [customUserName, setCustomUserName] = useState<string>('');
  const [notificationType, setNotificationType] = useState<'system' | 'price' | 'order' | 'finance'>('system');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Visitors list fetched from Django API
  const [visitorsList, setVisitorsList] = useState<any[]>([]);

  // Selected Notification Preview Modal
  const [previewNotification, setPreviewNotification] = useState<any | null>(null);

  // Edit Notification Modal State
  const [editingNotification, setEditingNotification] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editMessage, setEditMessage] = useState<string>('');
  const [editType, setEditType] = useState<'system' | 'price' | 'order' | 'finance'>('system');
  const [editAudience, setEditAudience] = useState<'all' | 'customers' | 'visitors' | 'direct'>('all');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Default visitors fallback if backend has no records yet
  const DEFAULT_VISITORS = [
    { id: 1, user_id: 101, visitor_code: 'VISITOR-9419', full_name: 'علیرضا آذرخش (ویزیتور ارشد انبار جنت‌آباد)', phone: '09120759419' },
    { id: 2, user_id: 102, visitor_code: 'VISITOR-2233', full_name: 'محمد رضایی (سفیر منطقه شمال و البرز)', phone: '09121112233' },
    { id: 3, user_id: 103, visitor_code: 'VISITOR-4455', full_name: 'مهدی کریمی (ویزیتور بنکداران و بازار بزرگ)', phone: '09193334455' },
    { id: 4, user_id: 104, visitor_code: 'VISITOR-6677', full_name: 'رضا ناصری (ویزیتور غرب و صادقیه)', phone: '09355556677' },
    { id: 5, user_id: 105, visitor_code: 'VISITOR-6543', full_name: 'امیر حیدری (ویزیتور شرق تهران)', phone: '09109876543' },
  ];

  // Quick Preset Templates for 1. مشتریان عمومی
  const CUSTOMER_PRESET_TEMPLATES = [
    {
      label: 'تغییر نرخ کارتن‌ها',
      type: 'price' as const,
      title: 'بروزرسانی نرخ لحظه‌ای کارتن‌های وینستون و بهمن',
      message: 'با توجه به نوسانات حواله درهم و تغییرات انبار مرکزی، لیست قیمت انواع کارتن وینستون و بهمن اصلاح گردید. همکاران گرامی می‌توانند سفارشات خود را با نرخ جدید ثبت نمایند.'
    },
    {
      label: 'شارژ بار جدید انبار',
      type: 'system' as const,
      title: 'ورود محموله جدید استیک‌های تیریا (TEREA) اصل',
      message: 'محموله جدید استیک‌های تیریا سفارش دبی و اروپایی در طعم‌های امبر، سیلور، برنز و گرین در انبار مرکزی تخلیه و آماده تحویل به مشتریان شد.'
    },
    {
      label: 'صدور حواله باربری',
      type: 'order' as const,
      title: 'صدور بارنامه و حواله خروج سفارش از انبار',
      message: 'سفارش ثبت‌شده شما تحویل باربری وطن گردید و بیجک مربوطه صادر شد. کالا طی ۲۴ الی ۴۸ ساعت آینده در مقصد تحویل خواهد شد.'
    },
    {
      label: 'یادآوری چک و حساب',
      type: 'finance' as const,
      title: 'یادآوری سررسید واریز حساب دفتری و چک نسیه',
      message: 'همکار محترم، موعد سررسید فاکتور دفتری شما فردا می‌باشد. خواهشمند است پس از واریز، فیش مربوطه را به صندوق ارسال فرمایید.'
    }
  ];

  // Quick Preset Templates for 2. ویزیتوران بازاریاب
  const VISITOR_PRESET_TEMPLATES = [
    {
      label: 'تسویه پورسانت هفتگی',
      type: 'finance' as const,
      title: 'واریز پورسانت‌های هفتگی ویزیتوران به حساب شبا',
      message: 'پورسانت فروش کلیه فاکتورهای تسویه‌شده هفته گذشته محاسبه و به شماره شبای ثبت‌شده ویزیتوران محترم واریز گردید. جهت مشاهده گزارش جزئیات به تب امور مالی مراجعه فرمایید.'
    },
    {
      label: 'بونوس کارتن خاص',
      type: 'price' as const,
      title: 'بونوس ویژه ۳.۵٪ برای ویزیت کارتن‌های سناتور و مارلبرو گلد',
      message: 'به اطلاع کلیه سفیران فروش می‌رساند تا پایان هفته جاری، پورسانت فروش کارتن‌های سناتور و مارلبرو گلد سوئیس از ۲.۵٪ به ۳.۵٪ افزایش یافته است.'
    },
    {
      label: 'اعلام تارگت ماهانه',
      type: 'system' as const,
      title: 'آغاز طرح تشویقی و تارگت فروش ماهانه سفیران سوین',
      message: 'سفیرانی که در ماه جاری به سقف فروش بیش از ۱۰۰ کارتن دست یابند، علاوه بر پورسانت مصوب، از پاداش نقدی ۱۰ میلیون تومانی انبار مرکزی بهره‌مند خواهند شد.'
    },
    {
      label: 'جلسه هماهنگی انبار',
      type: 'order' as const,
      title: 'جلسه هماهنگی توزیع بار ویزیتورها در انبار مرکزی جنت‌آباد',
      message: 'جهت برنامه‌ریزی ارسال بار روز شنبه و بررسی سفارشات مشتریان عمده شهرستان، جلسه هماهنگی با مدیریت فروش فردا ساعت ۹ صبح در محل انبار برگزار خواهد شد.'
    }
  ];

  const currentPresets = targetCategory === 'customers' ? CUSTOMER_PRESET_TEMPLATES : VISITOR_PRESET_TEMPLATES;

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await djangoFetchNotifications(crmConfig);
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setErrorMessage('خطا در بارگذاری اعلانات از پایگاه‌داده.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [crmConfig]);

  // Load registered visitors from backend
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const list = await visitorsApi.getAdminList();
        if (list && Array.isArray(list) && list.length > 0) {
          setVisitorsList(list);
          return;
        }
      } catch {}
      setVisitorsList(DEFAULT_VISITORS);
    };
    fetchVisitors();
  }, []);

  const handleApplyPreset = (preset: typeof CUSTOMER_PRESET_TEMPLATES[0]) => {
    setNotificationType(preset.type);
    setTitle(preset.title);
    setMessage(preset.message);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMessage('لطفاً عنوان و متن اطلاعیه را تکمیل نمایید.');
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }

    let targetUserName = '';
    let targetUserPhone = '';
    let targetUserId: string | number | null = null;
    let computedAudience: 'customers' | 'visitors' | 'direct' = 'customers';

    if (targetCategory === 'customers') {
      if (customerScope === 'all') {
        computedAudience = 'customers';
        targetUserName = 'مشتریان عمومی و مغازه‌داران (سراسری)';
        targetUserPhone = 'مشتریان عمومی';
        targetUserId = null;
      } else {
        computedAudience = 'direct';
        if (selectedCustomerId) {
          const found = customers.find(c => String(c.id) === selectedCustomerId);
          if (found) {
            targetUserName = found.name || found.ownerName || found.shopName || found.fullName || 'مشتری';
            targetUserPhone = found.phone || '';
            targetUserId = found.id;
          }
        } else if (customUserPhone.trim()) {
          targetUserPhone = customUserPhone.trim();
          targetUserName = customUserName.trim() || `مشتری (${customUserPhone.trim()})`;
          targetUserId = customUserPhone.trim();
        } else {
          setErrorMessage('لطفاً مشتری گیرنده یا شماره تماس را مشخص فرمایید.');
          setTimeout(() => setErrorMessage(''), 3500);
          return;
        }
      }
    } else {
      // targetCategory === 'visitors'
      if (visitorScope === 'all') {
        computedAudience = 'visitors';
        targetUserName = 'کلیه سفیران فروش (ویزیتوران)';
        targetUserPhone = 'ویزیتوران';
        targetUserId = null;
      } else {
        computedAudience = 'direct';
        if (selectedVisitorId) {
          const found = visitorsList.find(v => String(v.id) === selectedVisitorId || String(v.user_id) === selectedVisitorId);
          if (found) {
            targetUserName = found.full_name || found.fullName || `ویزیتور ${found.visitor_code || ''}`;
            targetUserPhone = found.phone || '';
            targetUserId = found.user_id || found.id;
          }
        } else if (customUserPhone.trim()) {
          targetUserPhone = customUserPhone.trim();
          targetUserName = customUserName.trim() || `ویزیتور (${customUserPhone.trim()})`;
          targetUserId = customUserPhone.trim();
        } else {
          setErrorMessage('لطفاً ویزیتور گیرنده یا شماره تماس را مشخص فرمایید.');
          setTimeout(() => setErrorMessage(''), 3500);
          return;
        }
      }
    }

    setIsSending(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        notification_type: notificationType,
        type: notificationType,
        targetAudience: computedAudience,
        user: targetUserId,
        user_id: targetUserId,
        user_name: targetUserName,
        user_phone: targetUserPhone
      };

      const created = await djangoCreateNotification(payload, crmConfig);
      if (created) {
        setSuccessMessage(
          `اعلان «${title}» با موفقیت برای ${computedAudience === 'visitors' ? '💼 کلیه ویزیتوران' : computedAudience === 'customers' ? '🏪 کلیه مشتریان عمومی' : `👤 ${targetUserName}`} در پایگاه‌داده دیتابیس جنگو ثبت و ارسال گردید.`
        );
        setTitle('');
        setMessage('');
        setCustomUserName('');
        setCustomUserPhone('');
        setSelectedCustomerId('');
        setSelectedVisitorId('');
        await loadNotifications();
        window.dispatchEvent(new Event('storage'));
        setTimeout(() => setSuccessMessage(''), 4500);
      } else {
        setErrorMessage('خطا در ثبت و ارسال اعلان.');
        setTimeout(() => setErrorMessage(''), 4000);
      }
    } catch {
      setErrorMessage('خطای ارتباط با سرور دیتابیس جنگو.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenEditModal = (item: any) => {
    setEditingNotification(item);
    setEditTitle(item.title || '');
    setEditMessage(item.message || '');
    setEditType((item.notification_type || item.type || 'system') as any);
    setEditAudience(item.targetAudience || (item.user ? 'direct' : 'all'));
  };

  const handleSaveEditNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotification) return;
    if (!editTitle.trim() || !editMessage.trim()) {
      setErrorMessage('عنوان و متن اطلاعیه نمی‌تواند خالی باشد.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsUpdating(true);
    try {
      const updatePayload = {
        title: editTitle.trim(),
        message: editMessage.trim(),
        notification_type: editType,
        type: editType,
        targetAudience: editAudience,
      };

      await djangoUpdateNotification(editingNotification.id, updatePayload, crmConfig);
      
      setNotifications(prev => prev.map(n => 
        String(n.id) === String(editingNotification.id)
          ? { ...n, ...updatePayload }
          : n
      ));

      window.dispatchEvent(new Event('storage'));
      setSuccessMessage('اعلان با موفقیت در پایگاه‌داده دیتابیس جنگو ویرایش و ذخیره شد.');
      setEditingNotification(null);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      setErrorMessage('خطا در ویرایش اعلان در سرور جنگو.');
      setTimeout(() => setErrorMessage(''), 3500);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleRead = async (item: any) => {
    const newStatus = !(item.is_read || item.isRead);
    try {
      await djangoMarkNotificationRead(item.id, newStatus, crmConfig);
      setNotifications(prev => prev.map(n => String(n.id) === String(item.id) ? { ...n, is_read: newStatus, isRead: newStatus } : n));
      window.dispatchEvent(new Event('storage'));
    } catch {
      setErrorMessage('خطا در تغییر وضعیت اعلان.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('آیا از حذف این اعلان از پایگاه‌داده اطمینان دارید؟')) return;
    try {
      await djangoDeleteNotification(id, crmConfig);
      setNotifications(prev => prev.filter(n => String(n.id) !== String(id)));
      window.dispatchEvent(new Event('storage'));
      setSuccessMessage('اعلان با موفقیت از پایگاه‌داده حذف گردید.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('خطا در حذف اعلان.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await djangoMarkAllNotificationsRead(crmConfig);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, isRead: true })));
      window.dispatchEvent(new Event('storage'));
      setSuccessMessage('تمامی اعلانات به عنوان خوانده‌شده ثبت شدند.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('خطا در بروزرسانی اعلانات.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Filtered List
  const filteredNotifications = notifications.filter(n => {
    if (audienceFilter !== 'all') {
      const isVisitors = n.targetAudience === 'visitors' || (n.title && n.title.includes('[ویژه ویزیتوران]'));
      const isCustomers = n.targetAudience === 'customers' || (n.title && n.title.includes('[مشتریان عمومی]'));
      const isDirect = n.targetAudience === 'direct' || Boolean(n.user) || Boolean(n.user_id);

      if (audienceFilter === 'visitors' && !isVisitors) return false;
      if (audienceFilter === 'customers' && !isCustomers) return false;
      if (audienceFilter === 'direct' && !isDirect) return false;
    }

    if (typeFilter !== 'all') {
      const itemType = n.notification_type || n.type;
      if (itemType !== typeFilter) return false;
    }

    if (readFilter !== 'all') {
      const isRead = Boolean(n.is_read ?? n.isRead);
      if (readFilter === 'unread' && isRead) return false;
      if (readFilter === 'read' && !isRead) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const titleM = (n.title || '').toLowerCase().includes(q);
      const msgM = (n.message || '').toLowerCase().includes(q);
      const userM = (n.user_name || '').toLowerCase().includes(q) || (n.user_phone || '').includes(q);
      if (!titleM && !msgM && !userM) return false;
    }

    return true;
  });

  const unreadCount = notifications.filter(n => !(n.is_read || n.isRead)).length;
  const customersCount = notifications.filter(n => n.targetAudience === 'customers' || (n.title && n.title.includes('[مشتریان عمومی]'))).length;
  const visitorsCount = notifications.filter(n => n.targetAudience === 'visitors' || (n.title && n.title.includes('[ویژه ویزیتوران]'))).length;
  const directCount = notifications.filter(n => n.targetAudience === 'direct' || Boolean(n.user) || Boolean(n.user_id)).length;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'price':
        return {
          label: 'تغییر نرخ و قیمت',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Tag className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'order':
        return {
          label: 'وضعیت سفارش',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Package className="w-3.5 h-3.5 text-blue-600" />
        };
      case 'finance':
        return {
          label: 'حسابداری و چک',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
        };
      case 'system':
      default:
        return {
          label: 'اطلاعیه عمومی سیستم',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <Info className="w-3.5 h-3.5 text-purple-600" />
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <Bell className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white tracking-tight">
                    مرکز ارسال و پایش نوتیفیکیشن کاربران
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    Django UserNotification
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  ارسال مستقیم اعلان‌های تغییر نرخ کارتن‌ها، فاکتورهای صادره و اطلاعیه‌ها به کاربران بدون نیاز به پنل ادمین جنگو
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={loadNotifications}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تازه‌سازی داده‌ها</span>
            </button>

            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/40 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>خواندن همه</span>
            </button>

            {onOpenBackendModal && (
              <button
                onClick={onOpenBackendModal}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-xl text-xs font-bold text-emerald-300 transition-all active:scale-95"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>اتصال API جنگو</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-bold mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-400" />
              <span>کل اعلانات ثبت‌شده</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {notifications.length} <span className="text-xs text-slate-400 font-sans">پیام</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-blue-300 font-bold mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>۱. به مشتریان عمومی</span>
            </div>
            <div className="text-xl font-black text-blue-300 font-mono">
              {customersCount} <span className="text-xs text-slate-400 font-sans">اعلان</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-purple-300 font-bold mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              <span>۲. به ویزیتوران</span>
            </div>
            <div className="text-xl font-black text-purple-300 font-mono">
              {visitorsCount} <span className="text-xs text-slate-400 font-sans">اعلان</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-emerald-300 font-bold mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>پیام‌های مستقیم / جدید</span>
            </div>
            <div className="text-xl font-black text-emerald-300 font-mono">
              {directCount} <span className="text-xs text-slate-400 font-sans">فردی</span>
              {unreadCount > 0 && <span className="text-[11px] text-rose-400 mr-2">({unreadCount} جدید)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in slide-in-from-top duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Top Form: Dispatch New Notification (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    ارسال اعلان جدید به کاربران
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ثبت در دیتابیس جنگو <code className="font-mono text-indigo-600">UserNotification</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Presets Quick Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    قالب‌های آماده {targetCategory === 'customers' ? 'مشتریان و مغازه‌داران' : 'ویزیتوران و بازاریابان'}:
                  </span>
                </label>
                <span className="text-[10px] text-slate-400 font-bold">
                  {targetCategory === 'customers' ? 'دسته‌بندی ۱' : 'دسته‌بندی ۲'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {currentPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2 text-right bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 rounded-xl text-[11px] font-bold text-slate-700 hover:text-indigo-700 transition-all text-ellipsis overflow-hidden whitespace-nowrap"
                  >
                    ⚡ {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 pt-1">
              {/* Target Category Selection: Two Groups Requested by User */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>تعیین گروه مخاطبان طبق ساختار دیتابیس:</span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                    دو دسته مجزا
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetCategory('customers')}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1 ${
                      targetCategory === 'customers'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-400/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Store className="w-4 h-4 shrink-0" />
                      <span>۱. مشتریان عمومی</span>
                    </div>
                    <p className={`text-[10px] leading-tight ${targetCategory === 'customers' ? 'text-blue-100' : 'text-slate-500'}`}>
                      مغازه‌داران، بنکداران و خریداران سایت
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetCategory('visitors')}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1 ${
                      targetCategory === 'visitors'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20 ring-2 ring-purple-400/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Briefcase className="w-4 h-4 shrink-0" />
                      <span>۲. ویزیتوران بازاریاب</span>
                    </div>
                    <p className={`text-[10px] leading-tight ${targetCategory === 'visitors' ? 'text-purple-100' : 'text-slate-500'}`}>
                      سفیران میدانی و ثبت‌کنندگان فاکتور
                    </p>
                  </button>
                </div>
              </div>

              {/* Category 1: Customers Sub-Scope */}
              {targetCategory === 'customers' && (
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-blue-950 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>دامنه ارسال به مشتریان عمومی:</span>
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold">
                      {customerScope === 'all' ? 'سراسری' : 'مشتری انتخابی'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomerScope('all')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        customerScope === 'all'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>کلیه مشتریان (سراسری)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomerScope('direct')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        customerScope === 'direct'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>مشتری مشخص</span>
                    </button>
                  </div>

                  {customerScope === 'direct' && (
                    <div className="pt-2 border-t border-blue-200/60 space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        انتخاب از دفتر مشتریان ثبت‌شده:
                      </label>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">-- انتخاب مشتری یا ورود دستی شماره --</option>
                        {customers.map(c => {
                          const displayName = c.name || c.ownerName || c.shopName || c.fullName || 'مشتری';
                          const displayStore = c.storeName || c.shopName || '';
                          return (
                            <option key={c.id} value={c.id}>
                              {displayName} ({c.phone || '-'}) {displayStore ? `- ${displayStore}` : ''}
                            </option>
                          );
                        })}
                      </select>

                      {!selectedCustomerId && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">
                              شماره موبایل مشتری:
                            </label>
                            <input
                              type="text"
                              value={customUserPhone}
                              onChange={(e) => setCustomUserPhone(e.target.value)}
                              placeholder="0912..."
                              dir="ltr"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">
                              نام یا فروشگاه:
                            </label>
                            <input
                              type="text"
                              value={customUserName}
                              onChange={(e) => setCustomUserName(e.target.value)}
                              placeholder="سوپرمارکت بهمن..."
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Category 2: Visitors Sub-Scope */}
              {targetCategory === 'visitors' && (
                <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-purple-950 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                      <span>دامنه ارسال به ویزیتوران:</span>
                    </span>
                    <span className="text-[10px] text-purple-700 font-bold">
                      {visitorScope === 'all' ? 'کلیه سفیران' : 'ویزیتور انتخابی'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVisitorScope('all')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        visitorScope === 'all'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>کلیه ویزیتوران (سراسری)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisitorScope('direct')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        visitorScope === 'direct'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>ویزیتور مشخص</span>
                    </button>
                  </div>

                  {visitorScope === 'direct' && (
                    <div className="pt-2 border-t border-purple-200/60 space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        انتخاب از لیست ویزیتوران ثبت‌شده:
                      </label>
                      <select
                        value={selectedVisitorId}
                        onChange={(e) => setSelectedVisitorId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="">-- انتخاب ویزیتور یا ورود دستی شماره --</option>
                        {visitorsList.map(v => {
                          const name = v.full_name || v.fullName || `ویزیتور ${v.visitor_code || ''}`;
                          return (
                            <option key={v.id || v.user_id} value={v.id || v.user_id}>
                              {name} ({v.phone || '-'}) {v.visitor_code ? `[کد: ${v.visitor_code}]` : ''}
                            </option>
                          );
                        })}
                      </select>

                      {!selectedVisitorId && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">
                              شماره موبایل ویزیتور:
                            </label>
                            <input
                              type="text"
                              value={customUserPhone}
                              onChange={(e) => setCustomUserPhone(e.target.value)}
                              placeholder="0912..."
                              dir="ltr"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">
                              نام سفیر / ویزیتور:
                            </label>
                            <input
                              type="text"
                              value={customUserName}
                              onChange={(e) => setCustomUserName(e.target.value)}
                              placeholder="نام و نام خانوادگی..."
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notification Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800">
                  نوع نوتیفیکیشن (<code className="font-mono text-indigo-600 text-[11px]">notification_type</code>):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNotificationType('system')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                      notificationType === 'system'
                        ? 'bg-purple-50 text-purple-800 border-purple-300 ring-2 ring-purple-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>📢 اطلاعیه سیستم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationType('price')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                      notificationType === 'price'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>🏷️ تغییر نرخ و قیمت</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationType('order')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                      notificationType === 'order'
                        ? 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>📦 وضعیت سفارش</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationType('finance')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                      notificationType === 'finance'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>💳 حسابداری و چک</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>عنوان اطلاعیه (<code className="font-mono text-indigo-600 text-[11px]">title</code>):</span>
                  <span className="text-[10px] text-slate-400 font-mono">{title.length}/200</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  placeholder="مثال: تغییر قیمت کارتن‌های وینستون لایت..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800">
                  متن کامل پیام (<code className="font-mono text-indigo-600 text-[11px]">message</code>):
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="متن کامل اطلاعیه، جزئیات سفارش یا تغییر نرخ را اینجا بنویسید..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400 leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl text-xs font-black transition-all active:scale-95 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <span>در حال ثبت و ارسال به دیتابیس...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ثبت و ارسال آنی نوتیفیکیشن</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right/Bottom Table: Feed & Filterable List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>📑</span>
                  <span>فهرست اعلانات ارسالی در پایگاه‌داده جنگو</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  مشاهده وضعیت دیده‌شدن، فیلتر بر اساس نوع و مدیریت پیام‌ها
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                  {filteredNotifications.length} مورد
                </span>
              </div>
            </div>

            {/* Target Audience Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setAudienceFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  audienceFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>همه مخاطبان</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                  {notifications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAudienceFilter('customers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  audienceFilter === 'customers'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>۱. مشتریان عمومی</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${audienceFilter === 'customers' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {customersCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAudienceFilter('visitors')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  audienceFilter === 'visitors'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>۲. ویزیتوران</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${audienceFilter === 'visitors' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {visitorsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAudienceFilter('direct')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  audienceFilter === 'direct'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>پیام‌های فردی</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${audienceFilter === 'direct' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {directCount}
                </span>
              </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در عنوان، متن یا گیرنده..."
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">همه انواع</option>
                  <option value="system">📢 اطلاعیه سیستم</option>
                  <option value="price">🏷️ تغییر نرخ</option>
                  <option value="order">📦 وضعیت سفارش</option>
                  <option value="finance">💳 حسابداری و چک</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={readFilter}
                  onChange={(e) => setReadFilter(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="unread">خوانده‌نشده ({unreadCount})</option>
                  <option value="read">خوانده‌شده</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            {isLoading ? (
              <div className="py-16 text-center text-slate-500 text-xs font-bold space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                <div>در حال بارگذاری اعلانات از پایگاه‌داده...</div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-black text-slate-700">هیچ اعلانی مطابق فیلتر یافت نشد.</div>
                <div className="text-[11px] text-slate-400">می‌توانید با فرم سمت راست اولین اعلان را ارسال کنید.</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {filteredNotifications.map((item) => {
                  const badge = getTypeBadge(item.notification_type || item.type || 'system');
                  const isRead = Boolean(item.is_read ?? item.isRead);
                  const isVisitors = item.targetAudience === 'visitors' || (item.title && item.title.includes('[ویژه ویزیتوران]'));
                  const isCustomers = item.targetAudience === 'customers' || (item.title && item.title.includes('[مشتریان عمومی]'));
                  const isBroadcast = !item.user && !item.user_id && (!item.targetAudience || item.targetAudience === 'all');

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-2xl p-4 transition-all hover:shadow-md space-y-3 relative ${
                        isRead
                          ? 'bg-white border-slate-200/90'
                          : 'bg-indigo-50/30 border-indigo-200 shadow-xs'
                      }`}
                    >
                      {/* Top Header inside card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>

                            {isVisitors ? (
                              <span className="text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-purple-600" />
                                <span>۲. ویژه ویزیتوران بازاریاب</span>
                              </span>
                            ) : isCustomers ? (
                              <span className="text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Store className="w-3 h-3 text-blue-600" />
                                <span>۱. مشتریان عمومی و مغازه‌داران</span>
                              </span>
                            ) : isBroadcast ? (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-500" />
                                <span>سراسری (همه کاربران)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <User className="w-3 h-3 text-emerald-600" />
                                <span>{item.user_name || 'کاربر اختصاصی'}</span>
                                {item.user_phone && item.user_phone !== '-' && (
                                  <span className="font-mono text-[9px] text-emerald-700">({item.user_phone})</span>
                                )}
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.created_at || item.createdAt || 'لحظاتی پیش'}</span>
                            </span>
                          </div>

                          <h4 className="text-xs font-black text-slate-900 pt-1">
                            {item.title}
                          </h4>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleRead(item)}
                            title={isRead ? 'تغییر به خوانده‌نشده' : 'علامت‌گذاری به عنوان خوانده‌شده'}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border flex items-center gap-1 ${
                              isRead
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 font-black'
                            }`}
                          >
                            {isRead ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>خوانده‌شده</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                <span>خوانده‌نشده</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Message Content */}
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        {item.message}
                      </p>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-[11px]">
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: #{item.id}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-bold flex items-center gap-1 transition-colors"
                            title="ویرایش اعلان"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>ویرایش</span>
                          </button>

                          <button
                            onClick={() => setPreviewNotification(item)}
                            className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>پیش‌نمایش در سایت</span>
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-bold flex items-center gap-1 transition-colors"
                            title="حذف از پایگاه‌داده"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
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
      </div>

      {/* Edit Notification Modal */}
      {editingNotification && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">ویرایش اعلان #{editingNotification.id}</h3>
                  <p className="text-[10px] text-slate-500">ویرایش در دیتابیس جنگو و همگام‌سازی لحظه‌ای</p>
                </div>
              </div>
              <button
                onClick={() => setEditingNotification(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditNotification} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800">
                  نوع اعلان:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditType('system')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                      editType === 'system'
                        ? 'bg-purple-50 text-purple-800 border-purple-300 ring-2 ring-purple-500/20'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5 text-purple-600" />
                    <span>📢 اطلاعیه سیستم</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('price')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                      editType === 'price'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/20'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>🏷️ تغییر نرخ و قیمت</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('order')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                      editType === 'order'
                        ? 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span>📦 وضعیت سفارش</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('finance')}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-black flex items-center gap-1.5 transition-all ${
                      editType === 'finance'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>💳 حسابداری و چک</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800">
                  دامنه مخاطبان:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditAudience('all')}
                    className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold ${
                      editAudience === 'all'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    همه کاربران
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAudience('customers')}
                    className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold ${
                      editAudience === 'customers'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    مشتریان عمومی
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAudience('visitors')}
                    className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold ${
                      editAudience === 'visitors'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    ویزیتوران
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800">عنوان اعلان:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800">متن اعلان:</label>
                <textarea
                  rows={4}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingNotification(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                >
                  {isUpdating ? 'در حال ذخیره...' : 'ذخیره تغییرات در دیتابیس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal (Mimicking Website Notification Modal) */}
      {previewNotification && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">پیش‌نمایش اعلان کاربر</h3>
                  <p className="text-[10px] text-slate-500">مشاهده نحوه نمایش در سایت مشتریان</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewNotification(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  {previewNotification.created_at || previewNotification.createdAt}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {previewNotification.notification_type || previewNotification.type}
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-950">
                {previewNotification.title}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {previewNotification.message}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewNotification(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
