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
  Check
} from 'lucide-react';
import { DjangoCrmConfig, RetailShopCustomer, WarehouseStaffUser } from '../../types';
import { 
  djangoFetchNotifications, 
  djangoCreateNotification, 
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

  // Form State
  const [targetType, setTargetType] = useState<'all' | 'direct'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customUserPhone, setCustomUserPhone] = useState<string>('');
  const [customUserName, setCustomUserName] = useState<string>('');
  const [notificationType, setNotificationType] = useState<'system' | 'price' | 'order' | 'finance'>('system');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Selected Notification Preview Modal
  const [previewNotification, setPreviewNotification] = useState<any | null>(null);

  // Quick Preset Templates
  const PRESET_TEMPLATES = [
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

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
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

    let targetUserName = 'همه کاربران سایت (عمومی)';
    let targetUserPhone = 'عمومی / سراسری';
    let targetUserId: string | number | null = null;

    if (targetType === 'direct') {
      if (selectedCustomerId) {
        const found = customers.find(c => String(c.id) === selectedCustomerId);
        if (found) {
          targetUserName = found.name || found.ownerName || found.shopName || found.fullName || 'مشتری';
          targetUserPhone = found.phone || '';
          targetUserId = found.id;
        }
      } else if (customUserPhone.trim()) {
        targetUserPhone = customUserPhone.trim();
        targetUserName = customUserName.trim() || `کاربر (${customUserPhone.trim()})`;
        targetUserId = customUserPhone.trim();
      } else {
        setErrorMessage('لطفاً مشتری گیرنده یا شماره تماس را مشخص نمایید.');
        setTimeout(() => setErrorMessage(''), 3500);
        return;
      }
    }

    setIsSending(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        notification_type: notificationType,
        type: notificationType,
        targetAudience: targetType === 'all' ? 'all' : 'direct',
        user: targetUserId,
        user_id: targetUserId,
        user_name: targetUserName,
        user_phone: targetUserPhone
      };

      const created = await djangoCreateNotification(payload, crmConfig);
      if (created) {
        setSuccessMessage(`اعلان «${title}» با موفقیت در دیتابیس جنگو ثبت و به کاربران ارسال شد.`);
        setTitle('');
        setMessage('');
        setCustomUserName('');
        setCustomUserPhone('');
        setSelectedCustomerId('');
        loadNotifications();
        setTimeout(() => setSuccessMessage(''), 4500);
      } else {
        setErrorMessage('خطا در ثبت و ارسال اعلان.');
        setTimeout(() => setErrorMessage(''), 4000);
      }
    } catch {
      setErrorMessage('خطای ارتباط با سرور جنگو.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleRead = async (item: any) => {
    const newStatus = !(item.is_read || item.isRead);
    try {
      await djangoMarkNotificationRead(item.id, newStatus, crmConfig);
      setNotifications(prev => prev.map(n => String(n.id) === String(item.id) ? { ...n, is_read: newStatus, isRead: newStatus } : n));
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
      setSuccessMessage('تمامی اعلانات به عنوان خوانده‌شده ثبت شدند.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('خطا در بروزرسانی اعلانات.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Filtered List
  const filteredNotifications = notifications.filter(n => {
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
  const broadcastCount = notifications.filter(n => !n.user && !n.user_id && (!n.targetAudience || n.targetAudience === 'all')).length;
  const priceAlertsCount = notifications.filter(n => (n.notification_type || n.type) === 'price').length;

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
            <div className="text-[11px] text-slate-400 font-bold mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>خوانده‌نشده توسط کاربر</span>
            </div>
            <div className="text-xl font-black text-rose-400 font-mono">
              {unreadCount} <span className="text-xs text-slate-400 font-sans">اعلان</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-bold mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>اطلاعیه‌های عمومی</span>
            </div>
            <div className="text-xl font-black text-purple-300 font-mono">
              {broadcastCount} <span className="text-xs text-slate-400 font-sans">سراسری</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-bold mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>هشدارهای نرخ و قیمت</span>
            </div>
            <div className="text-xl font-black text-amber-300 font-mono">
              {priceAlertsCount} <span className="text-xs text-slate-400 font-sans">مورد</span>
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
                    ثبت در جدول <code className="font-mono text-indigo-600">UserNotification</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Presets Quick Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>قالب‌های آماده و پرتکرار:</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_TEMPLATES.map((preset, idx) => (
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
              {/* Target Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800">
                  مخاطب و گیرنده اعلان:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('all')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      targetType === 'all'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>همه کاربران (عمومی)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('direct')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      targetType === 'direct'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>مشتری مشخص</span>
                  </button>
                </div>
              </div>

              {/* Customer Selector when Direct */}
              {targetType === 'direct' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700">
                      انتخاب از لیست مشتریان دفتری:
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">-- انتخاب از مشتریان یا وارد کردن دستی --</option>
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
                  </div>

                  {!selectedCustomerId && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          شماره موبایل کاربر:
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
                          نام یا عنوان کاربر:
                        </label>
                        <input
                          type="text"
                          value={customUserName}
                          onChange={(e) => setCustomUserName(e.target.value)}
                          placeholder="نام مشتری..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                        />
                      </div>
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

                            {isBroadcast ? (
                              <span className="text-[10px] font-bold bg-purple-100/70 text-purple-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>سراسری (همه کاربران)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-blue-100/70 text-blue-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{item.user_name || 'کاربر اختصاصی'}</span>
                                {item.user_phone && item.user_phone !== '-' && (
                                  <span className="font-mono text-[9px] text-slate-600">({item.user_phone})</span>
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
