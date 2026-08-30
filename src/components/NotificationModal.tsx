import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Inbox,
  RefreshCw
} from 'lucide-react';
import { NotificationItem, UserProfile } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currentUser: UserProfile | null;
  onMarkAsRead: (id: string | number) => void;
  onMarkAllAsRead: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading = false,
  onRefresh,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'my_role'>('all');

  // Notifications are ONLY accessible to logged-in users
  if (!isOpen || !currentUser) return null;

  const isItemRead = (item: NotificationItem) => Boolean(item.isRead ?? item.is_read);

  // Filter notifications relevant to current user
  const relevantNotifications = notifications.filter(n => {
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
  });

  const filtered = relevantNotifications.filter(n => {
    if (activeFilter === 'unread') return !isItemRead(n);
    if (activeFilter === 'my_role') {
      if (currentUser.role === 'visitor') return n.targetAudience === 'visitors';
      if (currentUser.role === 'customer') return n.targetAudience === 'customers';
      if (n.targetAudience === 'direct') return true;
    }
    return true;
  });

  const unreadCount = relevantNotifications.filter(n => !isItemRead(n)).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'urgent':
      case 'finance':
        return <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />;
      case 'warning':
      case 'price':
        return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />;
      case 'success':
      case 'order':
        return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 no-scrollbar overflow-hidden" 
      dir="rtl"
    >
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-blue-600/30 rounded-2xl border border-blue-500/30 shrink-0">
              <Bell className="w-5 h-5 text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white">
                  اعلان‌ها و اطلاعیه‌ها
                </h3>
                <span className="text-[10px] sm:text-xs font-bold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800/80">
                  {currentUser.fullName} ({currentUser.role === 'visitor' ? 'سفیر فروش' : 'بنکدار/مشتری'})
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                پیام‌های رسمی انبار سوین، تغییرات قیمت و اخبار باربری
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onRefresh && (
              <button 
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-2xl transition-colors shrink-0 disabled:opacity-50"
                title="بروزرسانی از دیتابیس جنگو"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-2xl transition-colors shrink-0"
              title="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="bg-slate-50 p-2.5 px-4 sm:px-5 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200 '
              }`}
            >
              همه ({relevantNotifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'unread'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200 '
              }`}
            >
              خوانده‌نشده ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('my_role')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'my_role'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200 '
              }`}
            >
              اختصاصی من
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>علامت‌گذاری همه خوانده شد</span>
            </button>
          )}
        </div>

        {/* Notifications Scroll Container */}
        <div className="p-3 sm:p-5 overflow-y-auto modal-overscroll-contain space-y-3 flex-1">
          {isLoading && notifications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                در حال دریافت اعلانات از پایگاه‌داده جنگو...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                هیچ اعلانی در پایگاه‌داده یافت نشد.
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                کلیه اطلاعیه‌های ثبت شده در سامانه مرکزی به محض درج توسط مدیریت در این قسمت نمایش داده می‌شوند.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const itemIsRead = isItemRead(item);
              return (
                <div
                  key={item.id}
                  onClick={() => onMarkAsRead(item.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                    !itemIsRead
                      ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                      : 'bg-white border-slate-200 opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Header row inside card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0">
                        {getNotifIcon(item.notification_type || item.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                            {item.title}
                          </h4>
                          {!itemIsRead && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-600 text-white shrink-0">
                              جدید
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date position */}
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium flex items-center gap-1 shrink-0 bg-slate-100 px-2 py-1 rounded-lg">
                      <Clock className="w-3 h-3" />
                      <span>{item.created_at || item.createdAt || 'لحظاتی پیش'}</span>
                    </span>
                  </div>

                  {/* Message Body */}
                  <p className="text-xs text-slate-600 leading-relaxed pr-10 sm:pr-11">
                    {item.message}
                  </p>

                  {/* Footer Badges */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[10px]">
                    <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.notification_type === 'price' ? '💰 نرخ لحظه‌ای' :
                       item.notification_type === 'order' ? '📦 وضعیت سفارش' :
                       item.notification_type === 'finance' ? '💳 حسابداری' :
                       item.targetAudience === 'visitors' ? '💼 مخصوص سفیران فروش' :
                       item.targetAudience === 'customers' ? '🏪 مخصوص مغازه‌داران' :
                       item.targetAudience === 'direct' ? '📩 پیام مستقیم اختصاصی' : '📢 اعلان عمومی'}
                    </span>

                    {!itemIsRead && (
                      <span className="text-blue-600 font-bold hover:underline">
                        علامت به عنوان خوانده شده
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>متصل به پایگاه‌داده جنگو (/api/v1/notifications/)</span>
          </div>
          <span className="hidden sm:inline">سامانه مدیریت اعلان‌های انبار مرکزی</span>
        </div>

      </div>
    </div>
  );
};
