import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Check, 
  CheckCheck, 
  Clock, 
  Radio, 
  ShieldCheck, 
  PhoneCall, 
  Headphones, 
  Plus, 
  User, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Image as ImageIcon,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react';
import { SupportTicket, ChatMessage } from '../types';
import { formatNumberFa } from '../utils/formatters';

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 't-101',
    ticketNumber: 'TCK-8821',
    title: 'استعلام موجودی و تخفیف نقدی ۱۰۰ کارتن وینستون سوئیس',
    department: 'sales',
    priority: 'high',
    status: 'answered',
    customerName: 'رضا گودرزی (پخش دخانیات گودرزی)',
    customerPhone: '09123334455',
    orderTrackingCode: 'SVN-90214',
    createdAt: '۱۴۰۴/۱۲/۰۳ - ۱۰:۱۵',
    updatedAt: '۱۴۰۴/۱۲/۰۳ - ۱۰:۳۰',
    lastMessage: 'سلام و درود، بارگیری ۱۰۰ کارتن با تخفیف ۵٪ تأیید شد و تا ظهر ارسال می‌شود.',
    unreadAdminCount: 0,
    unreadUserCount: 1,
  },
  {
    id: 't-102',
    ticketNumber: 'TCK-8819',
    title: 'هماهنگی تخلیه باربری وطن شعبه اصفهان',
    department: 'shipping',
    priority: 'medium',
    status: 'in_progress',
    customerName: 'حاج احمد حسینی',
    customerPhone: '09133145566',
    orderTrackingCode: 'SVN-48192',
    createdAt: '۱۴۰۴/۱۲/۰۲ - ۱۶:۴۵',
    updatedAt: '۱۴۰۴/۱۲/۰۳ - ۰۸:۳۰',
    lastMessage: 'بیجک بارنامه صادر شد: VTN-8849201. فردا صبح در شعبه احمدآباد تخلیه خواهد شد.',
    unreadAdminCount: 1,
    unreadUserCount: 0,
  }
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  't-101': [
    {
      id: 'm-1',
      ticketId: 't-101',
      sender: 'customer',
      senderName: 'رضا گودرزی',
      text: 'سلام خسته نباشید. برای ۱۰۰ کارتن وینستون لایت سوئیس اصل پلمپ شرکتی، آیا تخفیف بنکداری نقدی و ارسال با ناوگان خودتون به بازار تهران مقدوره؟',
      timestamp: '۱۰:۱۵',
    },
    {
      id: 'm-2',
      ticketId: 't-101',
      sender: 'system',
      senderName: 'سیستم هوشمند سوین',
      text: 'تیکت شما با شماره TCK-8821 به واحد فروش عمده ارجاع داده شد. اپراتور آنلاین به زودی پاسخ می‌دهد.',
      timestamp: '۱۰:۱۶',
    },
    {
      id: 'm-3',
      ticketId: 't-101',
      sender: 'support_admin',
      senderName: 'مدیریت فروش سوین (مهندس رادمنش)',
      text: 'سلام و احترام جناب گودرزی عزیز. بله موجودی انبار شورآباد تکمیل هست. برای ۱۰۰ کارتن ۵ درصد تخفیف نقدی اعمال شد و ارسال با نیسان اختصاصی سوین قبل از ظهر انجام می‌شه.',
      timestamp: '۱۰:۲۸',
    }
  ],
  't-102': [
    {
      id: 'm-201',
      ticketId: 't-102',
      sender: 'customer',
      senderName: 'حاج احمد حسینی',
      text: 'سلام، بارنامه باربری وطن کی صادر میشه؟ شماره بیجک رو بفرستید.',
      timestamp: '۱۶:۴۵',
    },
    {
      id: 'm-202',
      ticketId: 't-102',
      sender: 'support_admin',
      senderName: 'واحد ترابری و لجستیک سوین',
      text: 'سلام جناب حسینی. بیجک بارنامه صادر شد: VTN-8849201. فردا صبح در شعبه احمدآباد تخلیه خواهد شد.',
      timestamp: '۰۸:۳۰',
    }
  ]
};

export const ChatSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [activeTicketId, setActiveTicketId] = useState<string>('t-101');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [messageInput, setMessageInput] = useState('');
  
  // WebSocket simulation state
  const [wsConnected, setWsConnected] = useState(true);
  const [wsLatency, setWsLatency] = useState(24);
  const [isOperatorTyping, setIsOperatorTyping] = useState(false);
  const [operatorMode, setOperatorMode] = useState<'customer' | 'admin'>('customer');

  // New ticket modal
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState<'sales' | 'finance' | 'warehouse' | 'shipping'>('sales');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newTrackingCode, setNewTrackingCode] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeTicket = tickets.find(t => t.id === activeTicketId) || tickets[0];
  const activeMessages = messagesMap[activeTicketId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isOperatorTyping]);

  // Simulating live socket ping-pong
  useEffect(() => {
    const interval = setInterval(() => {
      setWsLatency(Math.floor(18 + Math.random() * 15));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      ticketId: activeTicketId,
      sender: operatorMode === 'admin' ? 'support_admin' : 'customer',
      senderName: operatorMode === 'admin' ? 'مدیریت پشتیبانی سوین' : (activeTicket.customerName || 'کاربر'),
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeTicketId]: [...(prev[activeTicketId] || []), newMsg]
    }));

    setTickets(prev => prev.map(t => {
      if (t.id === activeTicketId) {
        return {
          ...t,
          lastMessage: newMsg.text,
          updatedAt: 'هم‌اکنون',
          status: operatorMode === 'admin' ? 'answered' : 'in_progress',
        };
      }
      return t;
    }));

    setMessageInput('');

    // If sent by customer, simulate auto-operator reply via WebSocket
    if (operatorMode === 'customer') {
      setIsOperatorTyping(true);
      setTimeout(() => {
        setIsOperatorTyping(false);
        const botReply: ChatMessage = {
          id: 'msg-' + (Date.now() + 1),
          ticketId: activeTicketId,
          sender: 'support_admin',
          senderName: 'پشتیبانی آنلاین سوین (پاسخ آنی)',
          text: getSmartAutoReply(newMsg.text),
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessagesMap(prev => ({
          ...prev,
          [activeTicketId]: [...(prev[activeTicketId] || []), botReply]
        }));
      }, 1500);
    }
  };

  const getSmartAutoReply = (text: string): string => {
    if (text.includes('قیمت') || text.includes('نرخ') || text.includes('دلار')) {
      return 'همکار گرامی، نرخ‌های عمده به صورت لحظه‌ای با نوسان دلار آزاد در تب "تابلوی قیمت لحظه‌ای" آپدیت می‌شود. برای استعلام تیراژ بالای ۵۰ کارتن تخفیف ویژه نقدی اعمال می‌گردد.';
    }
    if (text.includes('ارسال') || text.includes('باربری') || text.includes('بیجک') || text.includes('وانت')) {
      return 'سفارشات تهران و البرز در همان روز با ناوگان وانت اختصاصی سوین و سفارشات شهرستان با باربری‌های معتبر (وطن/پیشتاز) با صدور بیجک رسمی بیمه‌دار ارسال می‌شوند.';
    }
    if (text.includes('شبا') || text.includes('حساب') || text.includes('واریز')) {
      return 'شماره حساب و شبای رسمی پخش عمده سوین (بانک ملی / ملت) در پیش‌فاکتور درج شده است. لطفاً پس از واریز، تصویر فیش را در همین چت ارسال نمایید.';
    }
    return 'پیام شما توسط واحد مربوطه در سامانه پخش سوین دریافت شد. کارشناس مربوطه در حال بررسی و پاسخگویی آنلاین می‌باشد.';
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCustomerName.trim()) return;

    const newTicketId = 't-' + Date.now();
    const newTicketNumber = 'TCK-' + Math.floor(1000 + Math.random() * 9000);

    const ticket: SupportTicket = {
      id: newTicketId,
      ticketNumber: newTicketNumber,
      title: newTitle.trim(),
      department: newDept,
      priority: 'high',
      status: 'open',
      customerName: newCustomerName.trim(),
      customerPhone: newCustomerPhone.trim() || '09120000000',
      orderTrackingCode: newTrackingCode.trim() || undefined,
      createdAt: 'امروز - هم‌اکنون',
      updatedAt: 'هم‌اکنون',
      lastMessage: newInitialMsg.trim() || 'تیکت جدید ایجاد شد.',
    };

    const initialMessages: ChatMessage[] = [
      {
        id: 'msg-init-1',
        ticketId: newTicketId,
        sender: 'customer',
        senderName: newCustomerName.trim(),
        text: newInitialMsg.trim() || newTitle.trim(),
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 'msg-init-2',
        ticketId: newTicketId,
        sender: 'system',
        senderName: 'وب‌سوکت مرکزی سوین',
        text: `تیکت ${newTicketNumber} با موفقیت در صف پشتیبانی باز شد. کارشناسان سوین متصل هستند.`,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      }
    ];

    setTickets([ticket, ...tickets]);
    setMessagesMap({ ...messagesMap, [newTicketId]: initialMessages });
    setActiveTicketId(newTicketId);
    setShowNewTicketModal(false);

    // Reset
    setNewTitle('');
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewTrackingCode('');
    setNewInitialMsg('');
  };

  return (
    <div className="py-8" id="chat-support-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Bar with Live WebSocket Stats */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-xl border border-emerald-200">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                  کانال وب‌سوکت زنده اختصاصی (WebSocket Live)
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  پاسخگویی سریع بنکداران و عمده‌فروشان
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                مرکز چت آنلاین، تیکتینگ و پشتیبانی سوین
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                ارسال فوری تیکت استعلام قیمت تیراژ، هماهنگی باربری اختصاصی، پیگیری تراکنش مالی و پشتیبانی ۲۴ ساعته.
              </p>
            </div>

            {/* Controls & WebSocket Status */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* WS status box */}
              <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-2xl text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>WS: wss://sevin.io/ws/chat</span>
                <span className="text-emerald-400 font-black">({wsLatency}ms)</span>
              </div>

              {/* Toggle user/admin perspective for demo */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setOperatorMode('customer')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    operatorMode === 'customer' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-slate-600'
                  }`}
                >
                  حالت خریدار
                </button>
                <button
                  onClick={() => setOperatorMode('admin')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    operatorMode === 'admin' ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-slate-600'
                  }`}
                >
                  حالت اپراتور سوین
                </button>
              </div>

              {/* New Ticket Button */}
              <button
                onClick={() => setShowNewTicketModal(true)}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                ثبت تیکت جدید
              </button>
            </div>
          </div>
        </div>

        {/* Main Chat & Ticket Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
          
          {/* Right/Side Column: Ticket List */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                تیکت‌های من ({formatNumberFa(tickets.length)})
              </h3>
              <span className="text-[11px] text-slate-500">پشتیبانی پخش عمده</span>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[560px]">
              {tickets.map(ticket => {
                const isActive = ticket.id === activeTicketId;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`p-4 cursor-pointer transition-all ${
                      isActive ? 'bg-blue-50/80 border-r-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-black text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                        {ticket.ticketNumber}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        ticket.status === 'answered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ticket.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {ticket.status === 'answered' ? 'پاسخ داده شد' : ticket.status === 'in_progress' ? 'در حال بررسی' : 'باز'}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 line-clamp-1 mb-1">
                      {ticket.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                      {ticket.lastMessage}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{ticket.customerName}</span>
                      <span>{ticket.updatedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Left/Main Column: Active Chat Thread */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            
            {/* Chat Top Header */}
            {activeTicket && (
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-lg">
                      {activeTicket.ticketNumber}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      {activeTicket.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    <span>مشتری: <strong>{activeTicket.customerName}</strong> ({activeTicket.customerPhone})</span>
                    {activeTicket.orderTrackingCode && (
                      <>
                        <span>•</span>
                        <span className="text-blue-700 font-bold">کد سفارش: {activeTicket.orderTrackingCode}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="tel:09120759419"
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>تماس فوری تلفنی</span>
                  </a>
                </div>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30 max-h-[440px]">
              {activeMessages.map(msg => {
                const isMe = operatorMode === 'customer' 
                  ? msg.sender === 'customer' 
                  : msg.sender === 'support_admin';
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-slate-200/80 text-slate-700 text-[11px] font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 max-w-md text-center">
                        <Bot className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-slate-400 mb-1 px-1 font-bold">
                      {msg.senderName} • {msg.timestamp}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-bl-sm font-medium'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-br-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isOperatorTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>اپراتور سوین در حال نوشتن پاسخ...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Wholesale Quick Prompt Suggestions */}
            <div className="p-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-slate-400 shrink-0 px-2 font-bold">پیشنهاد سریع:</span>
              <button
                type="button"
                onClick={() => setMessageInput('سلام، استعلام قیمت ۵۰ کارتن وینستون لایت پلمپ با تسویه نقدی')}
                className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 rounded-xl shrink-0 whitespace-nowrap text-slate-700 transition-colors border border-slate-200"
              >
                استعلام قیمت ۵۰ کارتن وینستون
              </button>
              <button
                type="button"
                onClick={() => setMessageInput('فیش واریزی بانک را ارسال کردم، لطفاً تأیید فرمایید.')}
                className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 rounded-xl shrink-0 whitespace-nowrap text-slate-700 transition-colors border border-slate-200"
              >
                ارسال فیش واریزی
              </button>
              <button
                type="button"
                onClick={() => setMessageInput('آیا بار با ناوگان اختصاصی وانت سوین ارسال می‌شود یا باربری وطن؟')}
                className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 rounded-xl shrink-0 whitespace-nowrap text-slate-700 transition-colors border border-slate-200"
              >
                نحوه ارسال باربری / وانت
              </button>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  operatorMode === 'admin'
                    ? 'پاسخ به عنوان اپراتور و مدیریت سوین...'
                    : 'پیام خود را تایپ نمایید (ارسال فوری از طریق وب‌سوکت)...'
                }
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />

              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center shrink-0"
                title="ارسال پیام"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 relative">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              ایجاد تیکت پشتیبانی و استعلام جدید
            </h2>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  موضوع تیکت:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: استعلام تخفیف تیراژ ۵۰ کارتن / هماهنگی ناوگان وانت"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام شما / بنکداری:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فروشگاه برادران حسینی"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تلفن تماس:
                  </label>
                  <input
                    type="text"
                    placeholder="0912..."
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    دپارتمان مربوطه:
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="sales">واحد فروش عمده و تیراژ</option>
                    <option value="shipping">واحد لجستیک، باربری و وانت</option>
                    <option value="finance">واحد حسابداری و تسویه فاکتور</option>
                    <option value="warehouse">انبار مرکزی شورآباد</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    کد پیگیری سفارش (اختیاری):
                  </label>
                  <input
                    type="text"
                    placeholder="SVN-..."
                    value={newTrackingCode}
                    onChange={(e) => setNewTrackingCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  متن پیام اولیه:
                </label>
                <textarea
                  rows={3}
                  placeholder="شرح درخواست یا استعلام کالا..."
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md shadow-blue-600/20 transition-all"
                >
                  ایجاد و اتصال به وب‌سوکت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
