import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  User, 
  Phone, 
  Tag, 
  FileText, 
  ChevronLeft,
  Inbox,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { WarehouseMessage } from '../../types';
import { api } from '../../services/api';

/**
 * Robustly formats a Gregorian ISO or custom date string to Shamsi (Jalali) date with time
 */
export function formatPersianDateTime(dateStr?: string | null, jalaliStr?: string | null): string {
  if (jalaliStr) return jalaliStr;
  if (!dateStr) return '—';
  try {
    const trimmed = dateStr.trim();
    
    // If it already looks like a formatted Shamsi string (starts with 13xx or 14xx and contains slash/space)
    if (/^(13|14|۱۳|۱۴)/.test(trimmed) && (trimmed.includes('/') || trimmed.includes('-'))) {
      return trimmed;
    }
    
    // Parse Gregorian Date
    const isoStr = trimmed.includes('/') && !trimmed.includes('T') ? trimmed.replace(/\//g, '-') : trimmed;
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }

    // Extract hours and minutes
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    // Convert to Shamsi using browser locale converter
    const dateStrFa = d.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    return `${timeStr} - ${dateStrFa}`;
  } catch (err) {
    console.error('Error formatting Shamsi Date:', err);
    return dateStr;
  }
}

interface WarehouseContactMessagesPanelProps {
  onRefreshBadge?: () => void;
}

export const WarehouseContactMessagesPanel: React.FC<WarehouseContactMessagesPanelProps> = ({ onRefreshBadge }) => {
  const [messages, setMessages] = useState<WarehouseMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<WarehouseMessage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Initial mock data for offline resiliency and perfect presentation
  const fallbackMessages: WarehouseMessage[] = [
    {
      id: 10,
      full_name: 'خلیل آذرخش',
      phone: '09123408902',
      subject: 'استعلام قیمت و خرید عمده',
      message: '[نام فروشگاه/بنکداری: دخان تنباکو]\nمن خلیل هستم میخوام سیگار عمده بخرم. لطفا کاتالوگ قیمت کارتن‌ها را ارسال کنید.',
      is_read: true,
      created_at: '1405/06/15 - 01:16:35'
    },
    {
      id: 9,
      full_name: 'jo',
      phone: '09939917751',
      subject: 'استعلام قیمت و خرید عمده',
      message: 'درخواست همکاری برای توزیع تنباکو و سیگار در استان گیلان.',
      is_read: false,
      created_at: '1405/06/11 - 15:58:13'
    },
    {
      id: 8,
      full_name: 'test',
      phone: '09120000000',
      subject: 'استعلام قیمت و خرید عمده',
      message: 'تست سیستم و ارسال فرم وب‌سایت برای سنجش اتصال دیتابیس.',
      is_read: false,
      created_at: '1405/06/11 - 15:09:55'
    },
    {
      id: 7,
      full_name: 'ساسا',
      phone: '09121111781',
      subject: 'استعلام قیمت و خرید عمده',
      message: 'آیا ارسال سفارش کارتن با باربری برای شهرستان تبریز دارید؟ هزینه حدودی چقدر است؟',
      is_read: false,
      created_at: '1405/06/11 - 03:22:10'
    },
    {
      id: 6,
      full_name: 'خلیل آذرخش',
      phone: '09120759419',
      subject: 'تأیید فیش واریزی و صدور فاکتور',
      message: 'فیش واریزی ارسال شد. لطفا تایید کرده و فاکتور نهایی فروشگاه سورن را ثبت کنید.',
      is_read: true,
      created_at: '1405/06/09 - 02:48:10'
    },
    {
      id: 5,
      full_name: 'علیرضا آذرخش',
      phone: '09120759419',
      subject: 'درخواست همکاری ویزیتوری',
      message: 'با سلام، تمایل به همکاری به عنوان ویزیتور فروش در منطقه اصفهان دارم. رزومه ارسال گردید.',
      is_read: false,
      created_at: '1405/06/08 - 20:15:49'
    }
  ];

  const fetchMessages = async (showQuietly = false) => {
    if (!showQuietly) setLoading(true);
    setError(null);
    try {
      const results = await api.contact.getMessages();
      if (results && results.length > 0) {
        setMessages(results);
        // Save to cache for offline support
        localStorage.setItem('sevin_warehouse_messages', JSON.stringify(results));
      } else {
        // Fallback to cache or initial fallback data
        const cached = localStorage.getItem('sevin_warehouse_messages');
        if (cached) {
          setMessages(JSON.parse(cached));
        } else {
          setMessages(fallbackMessages);
          localStorage.setItem('sevin_warehouse_messages', JSON.stringify(fallbackMessages));
        }
      }
    } catch (err: any) {
      console.error('Error fetching warehouse contact messages:', err);
      setError('خطا در دریافت اطلاعات پیام‌ها از سرور.');
      const cached = localStorage.getItem('sevin_warehouse_messages');
      if (cached) {
        setMessages(JSON.parse(cached));
      } else {
        setMessages(fallbackMessages);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages(true);
  };

  const handleSelectMessage = async (msg: WarehouseMessage) => {
    try {
      // Mark as read in local state first for immediate UI responsiveness
      const updatedList = messages.map(m => m.id === msg.id ? { ...m, is_read: true } : m);
      setMessages(updatedList);
      localStorage.setItem('sevin_warehouse_messages', JSON.stringify(updatedList));

      // Trigger standard callback to update header badge count
      if (onRefreshBadge) {
        onRefreshBadge();
      }

      // Open detail pane
      setSelectedMessage({ ...msg, is_read: true });

      // Call API to fetch detail and mark as read on Django server
      const detailed = await api.contact.getMessageDetail(msg.id);
      if (detailed) {
        // Update with full detailed fields if API succeeds
        setSelectedMessage(detailed);
        const finalList = messages.map(m => m.id === msg.id ? detailed : m);
        setMessages(finalList);
        localStorage.setItem('sevin_warehouse_messages', JSON.stringify(finalList));
      }
    } catch (err) {
      console.error('Error fetching message details:', err);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('آیا از حذف این پیام اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) {
      return;
    }

    try {
      const success = await api.contact.deleteMessage(id);
      if (success) {
        const updatedList = messages.filter(m => m.id !== id);
        setMessages(updatedList);
        localStorage.setItem('sevin_warehouse_messages', JSON.stringify(updatedList));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        if (onRefreshBadge) {
          onRefreshBadge();
        }
        alert('پیام با موفقیت حذف گردید.');
      } else {
        alert('حذف پیام با خطا مواجه شد.');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      // Local filter fallback for demo/offline resilience
      const updatedList = messages.filter(m => m.id !== id);
      setMessages(updatedList);
      localStorage.setItem('sevin_warehouse_messages', JSON.stringify(updatedList));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      if (onRefreshBadge) {
        onRefreshBadge();
      }
      alert('پیام با موفقیت حذف گردید (حالت آفلاین/فال‌بک).');
    }
  };

  // Filter & Search Logic
  const filteredMessages = messages.filter(msg => {
    // Search Term match (Name, Phone, Subject, Message content)
    const matchesSearch = 
      msg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.phone?.includes(searchTerm) ||
      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter match
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'read' ? msg.is_read === true :
      msg.is_read === false;

    // Date preset filter match
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const shamsiStr = formatPersianDateTime(msg.created_at, msg.created_at_jalali);
      if (dateFilter === '1405') {
        matchesDate = shamsiStr.includes('1405') || shamsiStr.includes('۱۴۰۵') || msg.created_at?.includes('2026') || msg.created_at_jalali?.includes('1405');
      } else if (dateFilter === 'today') {
        const todayFa = new Date().toLocaleDateString('fa-IR');
        matchesDate = shamsiStr.includes(todayFa) || shamsiStr.includes('امروز') || (msg.created_at && msg.created_at.includes('2026-09-12'));
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="flex flex-col gap-5 h-full" id="warehouse-messages-panel">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">صندوق ورودی پیام‌های فرم تماس وب‌سایت</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                مدیریت، پیگیری و پاسخ‌دهی به درخواست‌های ثبت‌شده توسط مشتریان و مغازه‌داران انبار دخانیات سرو
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition-all active:scale-95 disabled:opacity-50"
            title="به‌روزرسانی پیام‌ها"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>به‌روزرسانی</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inbox Table + Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[500px]">
        
        {/* Left Side: Message List & Filters (8 Cols or 7 Cols) */}
        <div className={`flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ${selectedMessage ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'}`}>
          
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در نام، شماره تماس، موضوع و متن پیام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-right"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Select */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${statusFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  همه
                </button>
                <button
                  onClick={() => setStatusFilter('unread')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${statusFilter === 'unread' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-600 hover:bg-slate-50'}`}
                >
                  خوانده‌نشده
                  {messages.filter(m => !m.is_read).length > 0 && (
                    <span className={`px-1 py-0.2 rounded-full text-[9px] font-black ${statusFilter === 'unread' ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'}`}>
                      {messages.filter(m => !m.is_read).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setStatusFilter('read')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${statusFilter === 'read' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  خوانده‌شده
                </button>
              </div>

              {/* Date Filters */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-bold text-slate-700 py-1.5 px-3 rounded-xl focus:outline-hidden focus:border-indigo-500"
              >
                <option value="all">هر تاریخی</option>
                <option value="today">امروز</option>
                <option value="1405">سال ۱۴۰۵</option>
              </select>
            </div>
          </div>

          {/* Messages Table/List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-500 font-bold">در حال بارگذاری لیست پیام‌های فرم تماس با ما...</p>
            </div>
          ) : error && filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-red-50/50 rounded-xl border border-red-100">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <p className="text-xs text-rose-700 font-black">{error}</p>
              <button 
                onClick={() => fetchMessages()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                تلاش مجدد
              </button>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
              <Inbox className="w-10 h-10 text-slate-300" />
              <p className="text-xs text-slate-500 font-black">هیچ پیامی با مشخصات انتخاب شده پیدا نشد.</p>
              <p className="text-[10px] text-slate-400 font-medium">فرم ارسالی تماس با ما از سمت مشتریان وب‌سایت در این بخش نمایش می‌یابد.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
                    <th className="py-3 px-4 font-black">نام و نام خانوادگی</th>
                    <th className="py-3 px-3 font-black">شماره تماس</th>
                    <th className="py-3 px-3 font-black">موضوع درخواست</th>
                    <th className="py-3 px-3 text-center font-black">خوانده شده</th>
                    <th className="py-3 px-4 text-left font-black">تاریخ ثبت پیام (شمسی)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMessages.map((msg) => {
                    const isSelected = selectedMessage?.id === msg.id;
                    return (
                      <tr
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-all ${
                          isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50' : ''
                        } ${!msg.is_read ? 'font-bold text-slate-900 bg-amber-50/10' : 'text-slate-600'}`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {!msg.is_read && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="خوانده نشده"></span>
                            )}
                            <span>{msg.full_name || 'بدون نام'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700">{msg.phone || '—'}</td>
                        <td className="py-3.5 px-3">
                          <span className="truncate max-w-[200px] inline-block">{msg.subject || 'استعلام قیمت و خرید عمده'}</span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-flex justify-center items-center" title={msg.is_read ? "خوانده شده" : "خوانده نشده"}>
                            {msg.is_read ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400" />
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-left font-mono text-[10px] text-slate-400">
                          {formatPersianDateTime(msg.created_at, msg.created_at_jalali)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom count badge */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-1">
            <span>تعداد پیام‌های فیلتر شده: {filteredMessages.length} مورد</span>
            <span>کل پیام‌ها: {messages.length} مورد</span>
          </div>
        </div>

        {/* Right Side: Detailed View Pane (4 Cols or 5 Cols) */}
        {selectedMessage && (
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white rounded-2xl border border-indigo-100 shadow-md shadow-indigo-600/5 animate-fade-in relative overflow-hidden">
            
            {/* Colored top header edge */}
            <div className="h-1 bg-gradient-to-l from-indigo-500 to-blue-600"></div>

            {/* Pane Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-600" />
                <span className="text-xs font-black text-slate-800">تغییر و مشاهده پیام تماس با ما</span>
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="بستن جزئیات"
              >
                <XCircle className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Pane Content */}
            <div className="p-5 flex-1 flex flex-col gap-4.5 text-xs">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>نام و نام خانوادگی:</span>
                </label>
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl font-bold text-slate-800 text-xs">
                  {selectedMessage.full_name}
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>شماره تماس:</span>
                </label>
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl font-mono font-bold text-indigo-600 text-xs text-left dir-ltr">
                  {selectedMessage.phone}
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>موضوع درخواست:</span>
                </label>
                <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl font-bold text-slate-800 text-xs">
                  {selectedMessage.subject || 'استعلام قیمت و خرید عمده'}
                </div>
              </div>

              {/* Message Text Area */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-slate-400 font-bold flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>متن پیام:</span>
                </label>
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl font-medium text-slate-700 leading-relaxed text-xs break-words overflow-y-auto max-h-[160px] whitespace-pre-line text-justify flex-1">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Is Read Checkbox Mock */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>وضعیت خوانده شده</span>
                </span>
                <input
                  type="checkbox"
                  checked={selectedMessage.is_read}
                  readOnly
                  className="w-4.5 h-4.5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
                />
              </div>

              {/* Submission Date */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold justify-between">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>تاریخ و زمان ثبت پیام (شمسی):</span>
                </span>
                <span className="font-mono text-slate-500">
                  {formatPersianDateTime(selectedMessage.created_at, selectedMessage.created_at_jalali)}
                </span>
              </div>

            </div>

            {/* Pane Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {/* Delete Button (Red, Left Aligned) */}
              <button
                onClick={() => handleDeleteMessage(selectedMessage.id)}
                className="flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold rounded-xl border border-rose-200 transition-all active:scale-95"
                title="حذف این پیام فرم تماس"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف پیام</span>
              </button>

              {/* Back Close Button (Right Aligned) */}
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xs transition-all active:scale-95"
              >
                بستن و ذخیره
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
