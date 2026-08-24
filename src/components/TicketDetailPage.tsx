import React, { useState } from 'react';
import { 
  ArrowRight, 
  Send, 
  Clock, 
  User, 
  ShieldCheck, 
  Building2, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Paperclip,
  Check
} from 'lucide-react';
import { SupportTicket, ChatMessage, UserProfile } from '../types';

interface TicketDetailPageProps {
  ticket: SupportTicket;
  currentUser: UserProfile | null;
  onBack: () => void;
  onSendReply: (ticketId: string, replyText: string) => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({
  ticket,
  currentUser,
  onBack,
  onSendReply,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSendReply(ticket.id, replyText);
      setReplyText('');
      setIsSubmitting(false);
    }, 400);
  };

  const getDepartmentLabel = (dept: string) => {
    switch (dept) {
      case 'sales': return 'واحد فروش و سفارشات عمده';
      case 'warehouse': return 'انبار مرکزی جنت‌آباد (پلمپ و بارگیری)';
      case 'shipping': return 'واحد ترابری و باربری (وطن / جهانگیر)';
      case 'finance': return 'واحد مالی و حسابداری';
      default: return 'پشتیبانی عمومی';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">فوری</span>;
      case 'high':
        return <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">بالا</span>;
      default:
        return <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">عادی</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'answered':
        return <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> پاسخ داده شده</span>;
      case 'in_progress':
        return <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> در حال بررسی توسط انبار</span>;
      case 'closed':
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-full">بسته شده</span>;
      default:
        return <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> در انتظار پاسخ کارشناس</span>;
    }
  };

  return (
    <div className="space-y-6" id="ticket-detail-view">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-95"
              title="بازگشت به فهرست تیکت‌ها"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                  {ticket.ticketNumber}
                </span>
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1.5">
                {ticket.title}
              </h1>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:items-end gap-1">
            <span className="font-medium">{getDepartmentLabel(ticket.department)}</span>
            <span>تاریخ ثبت: {ticket.createdAt}</span>
          </div>
        </div>

        {ticket.orderTrackingCode && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <Truck className="w-4 h-4" />
            <span>کد رهگیری سفارش مرتبط: <strong className="font-mono font-black">{ticket.orderTrackingCode}</strong></span>
          </div>
        )}
      </div>

      {/* Messages Thread */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          تاریخچه مکالمات و پیام‌ها
        </h2>

        <div className="space-y-4">
          {(!ticket.messages || ticket.messages.length === 0) ? (
            /* Fallback to ticket single message if messages array is empty */
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                    {ticket.customerName.slice(0, 1) || 'ک'}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {ticket.customerName} (شما)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{ticket.createdAt}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {ticket.lastMessage}
              </p>
            </div>
          ) : (
            ticket.messages.map((msg) => {
              const isCustomer = msg.sender === 'customer';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center my-3">
                    <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div 
                  key={msg.id}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                    isCustomer 
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 mr-0 sm:mr-6'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 ml-0 sm:ml-6'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/40 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-white ${
                        isCustomer ? 'bg-blue-600' : 'bg-emerald-600'
                      }`}>
                        {isCustomer ? (currentUser?.fullName?.slice(0, 1) || 'ش') : 'پ'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {msg.senderName}
                        </span>
                        {!isCustomer && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full mr-2 font-bold">
                            پشتیبانی و انبار مرکزی
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Form */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
          <form onSubmit={handleSend} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              ارسال پاسخ جدید در این تیکت:
            </label>
            <textarea
              required
              rows={3}
              placeholder="پاسخ، توضیحات تکمیلی یا شماره پیگیری خود را بنویسید..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                پاسخ شما بلافاصله در پنل مدیریت انبار مرکزی ثبت و رسیدگی خواهد شد.
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !replyText.trim()}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'در حال ارسال...' : 'ارسال پاسخ'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
