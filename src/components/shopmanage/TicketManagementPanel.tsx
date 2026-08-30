import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Search, 
  Filter, 
  Send, 
  Paperclip, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  User, 
  Phone, 
  Building2, 
  Plus, 
  X, 
  ChevronRight, 
  RefreshCw,
  Sparkles,
  FileText,
  ShieldAlert,
  Tag,
  Check
} from 'lucide-react';
import { DjangoCrmConfig } from '../../types';
import { fetchDjangoTickets, replyToDjangoTicket } from '../../services/djangoApi';

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: 'customer' | 'visitor' | 'staff' | 'accountant';
  message: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface TicketItem {
  id: string;
  ticketNumber: string;
  type: 'customer' | 'visitor';
  subject: string;
  customerName: string;
  customerPhone: string;
  department: 'sales' | 'finance' | 'warehouse' | 'support' | 'commission';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'answered' | 'pending' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  trackingCode?: string;
}

const INITIAL_DEMO_TICKETS: TicketItem[] = [
  {
    id: 't-101',
    ticketNumber: 'TK-9042',
    type: 'customer',
    subject: 'استعلام زمان تحویل بار ۳ کارتن مارلبرو تاچ مشکی',
    customerName: 'حاج محمد رضایی (سوپرمارکت رضایی)',
    customerPhone: '09123456789',
    department: 'warehouse',
    priority: 'high',
    status: 'open',
    createdAt: '۱۴۰۳/۰۶/۱۰ - ۱۰:۱۵',
    updatedAt: '۱۴۰۳/۰۶/۱۰ - ۱۰:۱۵',
    trackingCode: 'SVN-849201',
    messages: [
      {
        id: 'm-1',
        senderName: 'حاج محمد رضایی',
        senderRole: 'customer',
        message: 'با سلام و احترام، پیش‌فاکتور شماره SVN-849201 بابت ۳ کارتن مارلبرو تاچ تسویه شد. لطفا زمان دقیق ارسال بارپری تیپاکس به بنکداری تهران رو بفرمایید.',
        timestamp: '۱۰:۱۵ - ۱۴۰۳/۰۶/۱۰',
        attachmentName: 'fish_varizi_9042.jpg'
      }
    ]
  },
  {
    id: 't-102',
    ticketNumber: 'VT-8812',
    type: 'visitor',
    subject: 'درخواست تسویه پورسانت فروش ۱۵ کارتن تیریا دبی ویزیتور اصفهان',
    customerName: 'مهندس کامران عباسی (ویزیتور منطقه ۲)',
    customerPhone: '09131112233',
    department: 'commission',
    priority: 'medium',
    status: 'open',
    createdAt: '۱۴۰۳/۰۶/۱۰ - ۰۹:۳۰',
    updatedAt: '۱۴۰۳/۰۶/۱۰ - ۰۹:۳۰',
    messages: [
      {
        id: 'm-2',
        senderName: 'کامران عباسی',
        senderRole: 'visitor',
        message: 'سلام جناب حسابدار، فاکتورهای فروش تیریا و هیتس منطقه اصفهان ثبت نهایی شد. لطفا پورسانت ۵٪ فروش این هفته رو به شماره شبای ثبت‌شده واریز بفرمایید.',
        timestamp: '۰۹:۳۰ - ۱۴۰۳/۰۶/۱۰'
      }
    ]
  },
  {
    id: 't-103',
    ticketNumber: 'TK-9039',
    type: 'customer',
    subject: 'تغییر آدرس تحویل سفارش دستگاه آیکاس ایلوما',
    customerName: 'آقای فرهاد صادقی',
    customerPhone: '09359876543',
    department: 'sales',
    priority: 'urgent',
    status: 'answered',
    createdAt: '۱۴۰۳/۰۶/۰۹ - ۱۶:۴۰',
    updatedAt: '۱۴۰۳/۰۶/۰۹ - ۱۷:۰۵',
    messages: [
      {
        id: 'm-3',
        senderName: 'فرهاد صادقی',
        senderRole: 'customer',
        message: 'سلام، آدرس تحویل سفارش بنده تغییر کرده. به جای مغازه تجریش، به انبار خیابان شریعتی ارسال شود.',
        timestamp: '۱۶:۴۰ - ۱۴۰۳/۰۶/۰۹'
      },
      {
        id: 'm-4',
        senderName: 'پشتیبانی پخش سوین',
        senderRole: 'staff',
        message: 'با سلام، آدرس جدید شما در سیستم صادرکننده بارنامه به‌روزرسانی شد. بار شما امروز عصر با پیک اختصاصی تحویل می‌گردد.',
        timestamp: '۱۷:۰۵ - ۱۴۰۳/۰۶/۰۹'
      }
    ]
  },
  {
    id: 't-104',
    ticketNumber: 'TK-9011',
    type: 'customer',
    subject: 'استعلام اصالت و هولوگرام سری جدید فندک‌های زیپو',
    customerName: 'فروشگاه دخانیات پارس',
    customerPhone: '09121110022',
    department: 'support',
    priority: 'low',
    status: 'closed',
    createdAt: '۱۴۰۳/۰۶/۰۸ - ۱۱:۲۰',
    updatedAt: '۱۴۰۳/۰۶/۰۸ - ۱۲:۰۰',
    messages: [
      {
        id: 'm-5',
        senderName: 'فروشگاه دخانیات پارس',
        senderRole: 'customer',
        message: 'آیا فندک‌های زیپو موجود دارای استعلام کد QR و گارانتی تعویض اصلی هستند؟',
        timestamp: '۱۱:۲۰ - ۱۴۰۳/۰۶/۰۸'
      },
      {
        id: 'm-6',
        senderName: 'مدیریت انبار',
        senderRole: 'staff',
        message: 'بله تمام پارت‌های وارداتی دارای هولوگرام اورجینال شرکتی و بارکد اختصاصی استعلام اصالت می‌باشند.',
        timestamp: '۱۲:۰۰ - ۱۴۰۳/۰۶/۰۸'
      }
    ]
  }
];

interface TicketManagementPanelProps {
  crmConfig?: DjangoCrmConfig;
}

export const TicketManagementPanel: React.FC<TicketManagementPanelProps> = ({ crmConfig }) => {
  const [tickets, setTickets] = useState<TicketItem[]>(() => {
    try {
      const saved = localStorage.getItem('sevin_pos_tickets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DEMO_TICKETS;
  });

  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'customer' | 'visitor'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedTicketId, setSelectedTicketId] = useState<string>('t-101');
  const [replyText, setReplyText] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // New Ticket Modal State
  const [showNewTicketModal, setShowNewTicketModal] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState('');
  const [newType, setNewType] = useState<'customer' | 'visitor'>('customer');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState<'sales' | 'finance' | 'warehouse' | 'support' | 'commission'>('sales');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newMessageText, setNewMessageText] = useState('');

  // Save to local storage whenever tickets state changes
  useEffect(() => {
    try {
      localStorage.setItem('sevin_pos_tickets', JSON.stringify(tickets));
    } catch (e) {
      console.error(e);
    }
  }, [tickets]);

  // Sync with Django if URL is configured
  const handleSyncDjangoTickets = async () => {
    if (!crmConfig?.apiUrl) {
      alert('آدرس وب‌سرویس API جنگو در بخش تنظیمات CRM وارد نشده است.');
      return;
    }
    setIsSyncing(true);
    try {
      const remoteData = await fetchDjangoTickets(crmConfig);
      if (remoteData && remoteData.length > 0) {
        // map Django data
        const mappedRemote: TicketItem[] = remoteData.map((t: any) => ({
          id: `django-${t.id}`,
          ticketNumber: t.ticket_number || `TK-${t.id}`,
          type: t.ticket_type === 'visitor' ? 'visitor' : 'customer',
          subject: t.subject || 'پشتیبانی عمومی',
          customerName: t.user_full_name || t.user_name || 'مشتری وب‌سایت',
          customerPhone: t.user_phone || '۰۹۱۲۰۰۰۰۰۰۰',
          department: t.department || 'sales',
          priority: t.priority || 'medium',
          status: t.status || 'open',
          createdAt: t.created_at || new Date().toLocaleDateString('fa-IR'),
          updatedAt: t.updated_at || new Date().toLocaleDateString('fa-IR'),
          trackingCode: t.tracking_code,
          messages: (t.messages || []).map((m: any, idx: number) => ({
            id: `msg-${idx}`,
            senderName: m.sender_name || 'کاربر',
            senderRole: m.is_staff ? 'staff' : 'customer',
            message: m.text || m.message || '',
            timestamp: m.created_at || 'امروز'
          }))
        }));
        setTickets(mappedRemote);
      }
    } catch (e) {
      console.error('Sync tickets error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  // Filtering tickets
  const filteredTickets = tickets.filter(t => {
    if (activeTypeTab !== 'all' && t.type !== activeTypeTab) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (departmentFilter !== 'all' && t.department !== departmentFilter) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = t.ticketNumber.toLowerCase().includes(q);
      const matchSub = t.subject.toLowerCase().includes(q);
      const matchName = t.customerName.toLowerCase().includes(q);
      const matchPhone = t.customerPhone.includes(q);
      const matchCode = t.trackingCode?.toLowerCase().includes(q);
      return matchNum || matchSub || matchName || matchPhone || matchCode;
    }
    return true;
  });

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    const newMsg: TicketMessage = {
      id: `m_${Date.now()}`,
      senderName: 'مدیریت و حسابداری صندوق',
      senderRole: 'staff',
      message: replyText.trim(),
      timestamp: `${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })} - ${new Date().toLocaleDateString('fa-IR')}`
    };

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'answered' as const,
          updatedAt: new Date().toLocaleDateString('fa-IR'),
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setReplyText('');

    // Send to Django endpoint if available
    if (crmConfig?.apiUrl) {
      await replyToDjangoTicket(selectedTicket.id.replace('django-', ''), replyText.trim(), crmConfig);
    }
  };

  const handleChangeStatus = (newStatus: 'open' | 'answered' | 'pending' | 'closed') => {
    if (!selectedTicket) return;
    setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus } : t));
  };

  const handleCreateNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newCustomerName.trim() || !newMessageText.trim()) {
      alert('لطفاً عنوان، نام مخاطب و متن تیکت را کامل وارد کنید.');
      return;
    }

    const created: TicketItem = {
      id: `t_${Date.now()}`,
      ticketNumber: newType === 'visitor' ? `VT-${Math.floor(1000 + Math.random() * 9000)}` : `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newType,
      subject: newSubject.trim(),
      customerName: newCustomerName.trim(),
      customerPhone: newCustomerPhone.trim() || '09120000000',
      department: newDepartment,
      priority: newPriority,
      status: 'open',
      createdAt: new Date().toLocaleDateString('fa-IR'),
      updatedAt: new Date().toLocaleDateString('fa-IR'),
      messages: [
        {
          id: `m_${Date.now()}`,
          senderName: newCustomerName.trim(),
          senderRole: newType === 'visitor' ? 'visitor' : 'customer',
          message: newMessageText.trim(),
          timestamp: new Date().toLocaleDateString('fa-IR')
        }
      ]
    };

    setTickets([created, ...tickets]);
    setSelectedTicketId(created.id);
    setShowNewTicketModal(false);
    setNewSubject('');
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewMessageText('');
  };

  // Quick reply snippets
  const quickSnippets = [
    'با سلام، سفارش شما تحویل انبار مرکزی گردید و تا ساعاتی دیگر کد بارنامه صادر می‌شود.',
    'سلام و احترام، فیش واریزی توسط واحد حسابداری تایید و ثبت نهایی شد.',
    'درخواست شما جهت بررسی و صدور حواله به بخش تامین منتقل شد.',
    'سلام، پورسانت فروش این هفته شما محاسبه گردید و به حساب شبا واریز شد.'
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 text-slate-900 shadow-sm space-y-5" dir="rtl">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                پاسخ‌گویی به تیکت‌های مشتریان و ویزیتورها
              </h2>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                اتصال مستقیم به دیتابیس پشتیبانی
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              مدیریت پیام‌ها، پیگیری فیش‌های واریزی، تغییر وضعیت سفارشات و تعامل مستقیم از صندوق
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncDjangoTickets}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-all"
            title="همگام‌سازی لحظه‌ای با دیتابیس مرکزی"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>بروزرسانی از وب‌سرویس</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewTicketModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت تیکت جدید</span>
          </button>
        </div>
      </div>

      {/* Main Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTypeTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTypeTab === 'all' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            همه تیکت‌ها ({tickets.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTypeTab('customer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTypeTab === 'customer' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>مشتریان و خریداران ({tickets.filter(t => t.type === 'customer').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTypeTab('visitor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTypeTab === 'visitor' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ویزیتورها و بازاریابان ({tickets.filter(t => t.type === 'visitor').length})</span>
          </button>
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 shadow-xs"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="open">🟢 باز / در انتظار پاسخ</option>
            <option value="answered">🔵 پاسخ داده شده</option>
            <option value="closed">⚪ بسته شده</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 shadow-xs"
          >
            <option value="all">همه دپارتمان‌ها</option>
            <option value="sales">فروش و سفارشات</option>
            <option value="finance">حسابداری و مالی</option>
            <option value="warehouse">انبار و ارسال</option>
            <option value="commission">تسویه پورسانت</option>
            <option value="support">پشتیبانی عمومی</option>
          </select>
        </div>
      </div>

      {/* Main Workspace Layout: List (Right) + Interactive Chat (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[500px]">
        
        {/* RIGHT COLUMN: Ticket List */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-3 max-h-[600px] overflow-y-auto no-scrollbar">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام، شماره تیکت، تلفن یا کد رهگیری..."
              className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-bold shadow-xs"
            />
          </div>

          {/* Ticket Items */}
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-400 opacity-50" />
              <p>هیچ تیکتی با مشخصات فیلترشده یافت نشد.</p>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = t.id === selectedTicketId;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected 
                      ? 'bg-indigo-50/90 border-indigo-500 shadow-sm' 
                      : 'bg-white hover:bg-slate-100/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200">
                      {t.ticketNumber}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {t.type === 'visitor' ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                          👔 ویزیتور
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                          🛒 خریدار
                        </span>
                      )}

                      {t.status === 'open' && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                          🟢 باز
                        </span>
                      )}
                      {t.status === 'answered' && (
                        <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                          🔵 پاسخ‌داده
                        </span>
                      )}
                      {t.status === 'closed' && (
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                          ⚪ بسته
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 line-clamp-1 leading-snug">
                    {t.subject}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 truncate text-slate-700 font-bold">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      {t.customerName}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">{t.updatedAt}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* LEFT COLUMN: Interactive Chat & Ticket Detail Workspace */}
        <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[580px] space-y-4">
          
          {selectedTicket ? (
            <>
              {/* Selected Ticket Top Detail Header */}
              <div className="border-b border-slate-200 pb-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-xl border border-indigo-200">
                      {selectedTicket.ticketNumber}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      {selectedTicket.subject}
                    </h3>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold">تغییر وضعیت:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleChangeStatus(e.target.value as any)}
                      className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none shadow-xs"
                    >
                      <option value="open">🟢 در انتظار پاسخ</option>
                      <option value="answered">🔵 پاسخ داده شده</option>
                      <option value="closed">⚪ بسته شده</option>
                    </select>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1 text-slate-900 font-bold">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    {selectedTicket.customerName}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-500 dir-ltr">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedTicket.customerPhone}
                  </span>
                  {selectedTicket.trackingCode && (
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border border-emerald-200">
                      کد پیگیری سفارش: {selectedTicket.trackingCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1 no-scrollbar max-h-[340px]">
                {selectedTicket.messages.map((msg) => {
                  const isStaff = msg.senderRole === 'staff' || msg.senderRole === 'accountant';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-500">{msg.senderName}</span>
                        <span className="text-[9px] font-mono text-slate-400">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                          isStaff 
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' 
                            : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>

                        {msg.attachmentName && (
                          <div className={`pt-2 border-t flex items-center gap-2 text-[11px] font-bold ${
                            isStaff ? 'border-indigo-400 text-indigo-100' : 'border-slate-200 text-indigo-700'
                          }`}>
                            <FileText className="w-3.5 h-3.5" />
                            <span>فایل پیوست: {msg.attachmentName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Snippets & Reply Form */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[10px]">
                  <span className="text-slate-500 font-bold shrink-0">پاسخ‌های آماده:</span>
                  {quickSnippets.map((snip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(snip)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-300 font-bold whitespace-nowrap shrink-0 transition-all shadow-xs"
                    >
                      {snip.slice(0, 30)}...
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="پاسخ مدیریت بنکداری سوین به این تیکت..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none font-medium shadow-xs"
                  />

                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95 shrink-0"
                  >
                    <Send className="w-4 h-4 rotate-180" />
                    <span>ارسال</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="m-auto text-center text-slate-500 text-xs">
              یک تیکت را جهت مشاهده و پاسخ انتخاب نمایید.
            </div>
          )}

        </div>
      </div>

      {/* CREATE NEW TICKET MODAL */}
      {showNewTicketModal && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowNewTicketModal(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                ثبت تیکت جدید به نام مشتری / ویزیتور
              </h3>
              <button 
                type="button" 
                onClick={() => setShowNewTicketModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTicket} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">نوع مخاطب:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="customer">مشتری / خریدار</option>
                    <option value="visitor">ویزیتور / بازاریاب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">دپارتمان:</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="sales">فروش و سفارشات</option>
                    <option value="finance">حسابداری و مالی</option>
                    <option value="warehouse">انبار و ارسال</option>
                    <option value="commission">تسویه پورسانت</option>
                    <option value="support">پشتیبانی عمومی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">عنوان تیکت / موضوع:</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="مثال: پیگیری تحویل بار ۲ کارتن هیتس"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">نام مخاطب / فروشگاه:</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="نام و فامیلی یا مغازه"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">شماره همراه:</label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono dir-ltr focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">متن پیام یا شرح درخواست:</label>
                <textarea
                  rows={3}
                  required
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="شرح پیام..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ثبت تیکت</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
