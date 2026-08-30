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
  Sparkles,
  Inbox
} from 'lucide-react';
import { NotificationItem, UserProfile } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currentUser: UserProfile | null;
  onMarkAsRead: (id: string | number) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'my_role'>('all');

  // Notifications are ONLY accessible to logged-in users
  if (!isOpen || !currentUser) return null;

  // Filter notifications relevant to current user
  const relevantNotifications = notifications.filter(n => {
    if (n.targetAudience === 'all') return true;
    if (currentUser.role === 'visitor' && n.targetAudience === 'visitors') return true;
    if (currentUser.role === 'customer' && n.targetAudience === 'customers') return true;
    if (n.targetAudience === 'direct' && (n.targetUserId === currentUser.id || n.targetUserId === currentUser.phone)) return true;
    return false;
  });

  const filtered = relevantNotifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'my_role') {
      if (currentUser.role === 'visitor') return n.targetAudience === 'visitors';
      if (currentUser.role === 'customer') return n.targetAudience === 'customers';
    }
    return true;
  });

  const unreadCount = relevantNotifications.filter(n => !n.isRead).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />;
      case 'success':
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

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-2xl transition-colors shrink-0"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
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
          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-500 ">
                هیچ اعلانی در این بخش وجود ندارد.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onMarkAsRead(item.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                  !item.isRead
                    ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                    : 'bg-white border-slate-200 opacity-90 hover:opacity-100'
                }`}
              >
                {/* Header row inside card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0">
                      {getNotifIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-600 text-white shrink-0">
                            جدید
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Clean Date position - completely isolated from absolute unread icon */}
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium flex items-center gap-1 shrink-0 bg-slate-100 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" />
                    <span>{item.createdAt}</span>
                  </span>
                </div>

                {/* Message Body */}
                <p className="text-xs text-slate-600 leading-relaxed pr-10 sm:pr-11">
                  {item.message}
                </p>

                {/* Footer Badges */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[10px]">
                  <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.targetAudience === 'all' && '📢 اعلان عمومی'}
                    {item.targetAudience === 'visitors' && '💼 مخصوص سفیران فروش (ویزیتورها)'}
                    {item.targetAudience === 'customers' && '🏪 مخصوص مغازه‌داران و بنکداران'}
                    {item.targetAudience === 'direct' && '📩 پیام مستقیم اختصاصی'}
                  </span>

                  {!item.isRead && (
                    <span className="text-blue-600 font-bold hover:underline">
                      علامت به عنوان خوانده شده
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
          <span>کلیه اعلان‌ها به صورت هوشمند از سامانه مدیریت پیام جنگو ارسال می‌گردد.</span>
        </div>

      </div>
    </div>
  );
};
