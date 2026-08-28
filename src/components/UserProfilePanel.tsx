import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Building2, 
  Building,
  MapPin, 
  FileText, 
  Download, 
  Truck, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  PlusCircle, 
  MessageSquare, 
  CreditCard, 
  LogOut, 
  Check, 
  Lock, 
  Eye, 
  Package, 
  FileCheck,
  RefreshCw,
  HelpCircle,
  Headphones,
  ChevronLeft,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { UserProfile, OrderInvoice, SupportTicket, ChatMessage, RetailShopCustomer, DjangoCrmConfig, CigaretteProduct, CartItem } from '../types';
import { formatToman, formatNumberFa } from '../utils/formatters';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import { TicketDetailPage } from './TicketDetailPage';
import { 
  CustomerFinancialHub, 
  CustomerOnlineSettleModal, 
  CustomerDigitalPassModal, 
  CustomerPriceAlertsModal 
} from './CustomerHubFeatures';

interface UserProfilePanelProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateProfile: (user: UserProfile) => void;
  onOpenTracking: (trackingCode: string) => void;
  showToast: (msg: string) => void;
  retailShops?: RetailShopCustomer[];
  onUpdateRetailShops?: (shops: RetailShopCustomer[]) => void;
  initialSubTab?: 'orders' | 'financial_hub' | 'profile' | 'tickets' | 'new_ticket' | 'visitor_club' | 'visitor_report';
  djangoConfig?: DjangoCrmConfig;
  availableProducts?: CigaretteProduct[];
  onReorderItems?: (items: CartItem[]) => void;
}

export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  onOpenTracking,
  showToast,
  retailShops = [],
  onUpdateRetailShops,
  initialSubTab,
  djangoConfig,
  availableProducts = [],
  onReorderItems,
}) => {
  // Tabs inside panel
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'financial_hub' | 'profile' | 'tickets' | 'new_ticket' | 'visitor_club' | 'visitor_report'>(initialSubTab || 'orders');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Customer Hub Modals
  const [showOnlineSettleModal, setShowOnlineSettleModal] = useState(false);
  const [showDigitalPassModal, setShowDigitalPassModal] = useState(false);
  const [showPriceAlertsModal, setShowPriceAlertsModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<OrderInvoice | null>(null);

  // New Retail Shop Form State
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('تهران');
  const [newAddress, setNewAddress] = useState('');
  const [newLicenseNo, setNewLicenseNo] = useState('');

  // Login & OTP States
  const [selectedLoginRole, setSelectedLoginRole] = useState<'visitor' | 'customer'>('customer');
  const [loginPhone, setLoginPhone] = useState('09120759419');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [otpCountdown, setOtpCountdown] = useState(120);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [mockGeneratedOtp, setMockGeneratedOtp] = useState('1111');

  // Orders State
  const [userOrders, setUserOrders] = useState<OrderInvoice[]>([]);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 't-1',
      ticketNumber: 'TK-84910',
      title: 'استعلام بارگیری کارتن وینستون آبی از انبار جنت‌آباد',
      department: 'warehouse',
      priority: 'high',
      status: 'answered',
      customerName: currentUser?.fullName || 'خریدار محترم',
      customerPhone: currentUser?.phone || '09120759419',
      orderTrackingCode: 'SVN-89412',
      createdAt: '۱۴۰۳/۰۵/۱۴ - ۱۰:۳۰',
      updatedAt: '۱۴۰۳/۰۵/۱۴ - ۱۱:۱۵',
      lastMessage: 'بار شما پلمپ شده و به باربری وطن تحویل داده شد. شماره بیجک در سیستم ثبت گردید.',
      unreadAdminCount: 0,
      unreadUserCount: 0,
      messages: [
        {
          id: 'm-1',
          ticketId: 't-1',
          sender: 'customer',
          senderName: currentUser?.fullName || 'خریدار محترم',
          text: 'سلام و وقت بخیر، سفارش ۲ کارتن وینستون آبی و ۱ کارتن مارلبرو گلد تاچ ثبت شد. لطفاً اعلام بفرمایید امروز به باربری تحویل می‌شود؟',
          timestamp: '۱۴۰۳/۰۵/۱۴ - ۱۰:۳۰'
        },
        {
          id: 'm-2',
          ticketId: 't-1',
          sender: 'support_admin',
          senderName: 'کارشناس ترابری انبار جنت‌آباد',
          text: 'درود، بار شما با هولوگرام اصالت و پلمپ وکیوم بسته‌بندی شد و ساعت ۱۱ به ناوگان باربری وطن تحویل گردید. بیجک شماره VT-981245 صادر شده است.',
          timestamp: '۱۴۰۳/۰۵/۱۴ - ۱۱:۱۵'
        }
      ]
    },
    {
      id: 't-2',
      ticketNumber: 'TK-92401',
      title: 'استعلام تیراژ و تخفیف پلکانی استیک تیریا و دستگاه ایکاس',
      department: 'sales',
      priority: 'medium',
      status: 'in_progress',
      customerName: currentUser?.fullName || 'خریدار محترم',
      customerPhone: currentUser?.phone || '09120759419',
      createdAt: '۱۴۰۳/۰۵/۱۶ - ۰۹:۰۰',
      updatedAt: '۱۴۰۳/۰۵/۱۶ - ۰۹:۴۰',
      lastMessage: 'پیش‌فاکتور با درصد تخفیف تجاری برای خرید بالای ۵ کارتن تنظیم گردید.',
      unreadAdminCount: 0,
      unreadUserCount: 1,
      messages: [
        {
          id: 'm-21',
          ticketId: 't-2',
          sender: 'customer',
          senderName: currentUser?.fullName || 'خریدار محترم',
          text: 'برای سفارش عمده ۱۰ کارتن تیریا سیلور و ۴ دستگاه ایکاس ایلوما پرایم درصد تخفیف نهایی چقدر محاسبه می‌شود؟',
          timestamp: '۱۴۰۳/۰۵/۱۶ - ۰۹:۰۰'
        },
        {
          id: 'm-22',
          ticketId: 't-2',
          sender: 'support_admin',
          senderName: 'مدیر فروش عمده',
          text: 'برای ۱۰ کارتن تیریا تخفیف حداکثری ۴.۵٪ و برای دستگاه‌ها ۶٪ لحاظ شد و پیش‌فاکتور رسمی در پنل شما قرار گرفت.',
          timestamp: '۱۴۰۳/۰۵/۱۶ - ۰۹:۴۰'
        }
      ]
    }
  ]);

  // New Ticket Form
  const [newTicketData, setNewTicketData] = useState({
    title: '',
    department: 'sales' as const,
    priority: 'medium' as const,
    orderTrackingCode: '',
    message: '',
  });

  // Profile Edit State
  const [editProfile, setEditProfile] = useState<UserProfile>(
    currentUser || {
      id: 'usr-1',
      phone: '09120759419',
      fullName: 'کاربر تستی سامانه',
      province: 'تهران',
      city: 'تهران',
      address: 'خیابان مولوی، سرای دخانیات، پلاک ۱۸',
      nationalId: '0012345678',
      businessLicenseNumber: 'BL-98214',
      isVerified: true,
      createdAt: '۱۴۰۳/۰۱/۱۵',
      role: 'visitor',
    }
  );

  // Load orders from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sevin_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserOrders(parsed);
      } else {
        // Default mock order if empty
        const defaultOrders: OrderInvoice[] = [
          {
            orderId: 'SVN-89412',
            trackingCode: 'SVN-89412',
            createdAt: '۱۴۰۳/۰۵/۱۴ - ۰۹:۱۵',
            customer: {
              shopOwnerName: currentUser?.fullName || 'خریدار گرامی',
              shopName: 'پخش و توزیع نگین',
              shopPhone: currentUser?.phone || '09120759419',
              city: 'تهران',
              province: 'تهران',
              address: 'خیابان مولوی، سرای دخانیات، پلاک ۱۸',
              shippingMethod: 'ناوگان اختصاصی سوین (تحویل فوری تهران)',
              shippingCost: 350000,
              notes: 'تحویل بارنامه و بیجک پلمپ شده',
            },
            items: [
              {
                product: {
                  id: 'winston-compact-blue',
                  nameFa: 'وینستون کامپکت بلو (آبی شرکتی)',
                  nameEn: 'Winston Compact Blue (JTI)',
                  brand: 'Winston',
                  category: 'cigarettes',
                  origin: 'ترکیه / ایران شرکتی',
                  tar: '6 mg',
                  nicotine: '0.5 mg',
                  cartonPrice: 44000000,
                  boxPrice: 920000,
                  boxesPerCarton: 50,
                  stockCartons: 140,
                  moq: 1,
                  image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
                  barcode: '4033100112348',
                  hologram: 'شرکتی اصل',
                  tierDiscounts: [{ minCartons: 5, discountPercentage: 3 }],
                  lastPriceUpdate: 'هم‌اکنون',
                  description: 'وینستون آبی شرکتی با هولوگرام و پلمپ انبار مرکزی جنت‌آباد',
                  isAvailable: true,
                },
                unit: 'carton',
                quantity: 2,
              },
              {
                product: {
                  id: 'marlboro-gold-ch',
                  nameFa: 'مارلبرو گلد سوئیس اصلی (پایه‌کوتاه)',
                  nameEn: 'Marlboro Gold Original (Swiss Made)',
                  brand: 'Marlboro',
                  category: 'cigarettes',
                  origin: 'سوئیس اصل (بارکد 761)',
                  tar: '6 mg',
                  nicotine: '0.5 mg',
                  cartonPrice: 91000000,
                  boxPrice: 1900000,
                  boxesPerCarton: 50,
                  stockCartons: 85,
                  moq: 1,
                  image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80',
                  barcode: '7610111245012',
                  hologram: 'اورجینال اروپایی',
                  tierDiscounts: [{ minCartons: 3, discountPercentage: 2 }],
                  lastPriceUpdate: 'هم‌اکنون',
                  description: 'مارلبرو طلایی سوئیس با ضمانت اصالت و ترابری سریع',
                  isAvailable: true,
                },
                unit: 'carton',
                quantity: 1,
              }
            ],
            totalCartons: 3,
            totalBoxes: 150,
            subtotal: 179000000,
            discountAmount: 2640000,
            shippingCost: 350000,
            finalTotal: 176710000,
            paymentStatus: 'واریز شده و ثبت فیش',
          }
        ];
        setUserOrders(defaultOrders);
        localStorage.setItem('sevin_orders', JSON.stringify(defaultOrders));
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Pre-registered Visitors Database (Django CRM synced)
  const REGISTERED_VISITORS_DB = [
    { phone: '09120759419', fullName: 'علیرضا آذرخش (ویزیتور ارشد انبار جنت‌آباد)' },
    { phone: '09121112233', fullName: 'محمد رضایی (ویزیتور منطقه شمال و البرز)' },
    { phone: '09193334455', fullName: 'مهدی کریمی (ویزیتور بنکداران مرکزی)' },
    { phone: '09355556677', fullName: 'رضا ناصری (ویزیتور غرب تهران)' },
    { phone: '09109876543', fullName: 'امیر حیدری (ویزیتور شرق تهران)' },
  ];

  // Handle Send OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || loginPhone.length < 10) {
      showToast('لطفاً شماره تلفن همراه ۱۱ رقمی معتبر را وارد فرمایید.');
      return;
    }

    const cleanedPhone = loginPhone.replace(/\s+/g, '').replace(/^(\+98|98|0)?/, '');

    if (selectedLoginRole === 'visitor') {
      const foundVisitor = REGISTERED_VISITORS_DB.find(v => {
        const vClean = v.phone.replace(/\s+/g, '').replace(/^(\+98|98|0)?/, '');
        return vClean === cleanedPhone || v.phone === loginPhone;
      });

      if (!foundVisitor) {
        showToast('شماره وارد شده در لیست ویزیتورهای مجاز ثبت نشده است. اگر مغازه‌دار هستید، گزینه «مغازه‌دار / مشتری عادی» را انتخاب کنید.');
        return;
      }
    }

    setIsLoadingOtp(true);
    setTimeout(() => {
      setIsLoadingOtp(false);
      const code = '1111';
      setMockGeneratedOtp(code);
      setOtpStep('otp');
      setOtpCountdown(120);
      showToast(`کد تأیید به شماره ${loginPhone} ارسال گردید.`);
    }, 800);
  };

  // Handle Verify OTP & Login
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '1111' && otpCode !== mockGeneratedOtp && otpCode !== '1234') {
      showToast('کد تأیید وارد شده صحیح نمی‌باشد.');
      return;
    }

    const cleanedPhone = loginPhone.replace(/\s+/g, '').replace(/^(\+98|98|0)?/, '');

    if (selectedLoginRole === 'visitor') {
      const foundVisitor = REGISTERED_VISITORS_DB.find(v => {
        const vClean = v.phone.replace(/\s+/g, '').replace(/^(\+98|98|0)?/, '');
        return vClean === cleanedPhone || v.phone === loginPhone;
      });

      if (!foundVisitor) {
        showToast('خطا: شماره ویزیتور در سیستم ثبت نشده است.');
        return;
      }

      setIsVerifyingOtp(true);
      setTimeout(() => {
        setIsVerifyingOtp(false);
        const newUser: UserProfile = {
          id: `usr-vis-${Date.now()}`,
          phone: foundVisitor.phone,
          fullName: foundVisitor.fullName,
          province: 'تهران',
          city: 'تهران',
          address: '',
          nationalId: '',
          bankCardNumber: '',
          bankSheba: '',
          bankName: '',
          bankAccountHolder: foundVisitor.fullName,
          isVerified: false,
          createdAt: new Date().toLocaleDateString('fa-IR'),
          role: 'visitor',
          visitorCode: `VISITOR-${foundVisitor.phone.slice(-4)}`,
          commissionRate: 2.5,
          isProfileCompleted: false,
        };

        onLogin(newUser);
        setEditProfile(newUser);
        showToast(`خوش آمدید، ${foundVisitor.fullName}. لطفاً جهت فعالیت در سیستم، کد ملی و شماره کارت بانکی خود را تکمیل فرمایید.`);
      }, 700);
    } else {
      setIsVerifyingOtp(true);
      setTimeout(() => {
        setIsVerifyingOtp(false);
        const newUser: UserProfile = {
          id: `usr-cust-${Date.now()}`,
          phone: loginPhone,
          fullName: 'مدیر فروشگاه / مغازه‌دار گرامی',
          shopName: 'فروشگاه / سوپرمارکت',
          province: 'تهران',
          city: 'تهران',
          address: '',
          isVerified: false,
          createdAt: new Date().toLocaleDateString('fa-IR'),
          role: 'customer',
          isProfileCompleted: false,
        };

        onLogin(newUser);
        setEditProfile(newUser);
        showToast(`ورود موفقیت‌آمیز مغازه‌دار با شماره ${loginPhone}. لطفاً نام مسئول و آدرس فروشگاه را تکمیل فرمایید.`);
      }, 700);
    }
  };

  // Handle Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    let isComplete = false;
    if (editProfile.role === 'customer') {
      const hasName = editProfile.fullName && editProfile.fullName.trim().length > 2 && !editProfile.fullName.includes('گرامی');
      const hasShop = editProfile.shopName && editProfile.shopName.trim().length > 2 && !editProfile.shopName.includes('سوپرمارکت');
      const hasAddress = editProfile.address && editProfile.address.trim().length > 5;
      isComplete = Boolean(hasName && hasShop && hasAddress);
    } else {
      const hasName = editProfile.fullName && editProfile.fullName.trim().length > 2;
      const hasNational = editProfile.nationalId && editProfile.nationalId.trim().length >= 10;
      const hasCard = editProfile.bankCardNumber && editProfile.bankCardNumber.replace(/\D/g, '').length >= 16;
      const hasSheba = editProfile.bankSheba && editProfile.bankSheba.toUpperCase().includes('IR') && editProfile.bankSheba.trim().length >= 15;
      const hasAddress = editProfile.address && editProfile.address.trim().length > 5;
      isComplete = Boolean(hasName && hasNational && hasCard && hasSheba && hasAddress);
    }

    const updatedProfile: UserProfile = {
      ...editProfile,
      isProfileCompleted: isComplete,
      isVerified: isComplete, // Only verified in Django when profile is complete
    };

    onUpdateProfile(updatedProfile);
    setEditProfile(updatedProfile);

    if (isComplete) {
      showToast('مشخصات شما با موفقیت تکمیل شد و حساب شما در سامانه جنگو «تأیید شده» گردید.');
    } else {
      showToast('اطلاعات ذخیره شد اما برخی موارد هنوز ناقص است. پس از تکمیل کامل تمام فیلدها، حساب شما تأیید خواهد شد.');
    }
  };

  // Handle PDF Download
  const handleDownloadInvoice = async (order: OrderInvoice) => {
    setDownloadingPdfId(order.orderId);
    try {
      await generateInvoicePdf(order);
      showToast(`پیش‌فاکتور ${order.orderId} با موفقیت دانلود شد.`);
    } catch (err) {
      showToast('خطا در ایجاد فایل PDF.');
    } finally {
      setDownloadingPdfId(null);
    }
  };

  // Handle Create Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketData.title || !newTicketData.message) {
      showToast('لطفاً عنوان و متن پیام تیکت را بنویسید.');
      return;
    }

    const timestamp = `${new Date().toLocaleDateString('fa-IR')} - ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    const newId = `t-${Date.now()}`;
    const newTicket: SupportTicket = {
      id: newId,
      ticketNumber: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
      title: newTicketData.title,
      department: newTicketData.department,
      priority: newTicketData.priority,
      status: 'open',
      customerName: currentUser?.fullName || 'کاربر محترم',
      customerPhone: currentUser?.phone || '09120759419',
      orderTrackingCode: newTicketData.orderTrackingCode || undefined,
      createdAt: timestamp,
      updatedAt: 'هم‌اکنون',
      lastMessage: newTicketData.message,
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId: newId,
          sender: 'customer',
          senderName: currentUser?.fullName || 'شما',
          text: newTicketData.message,
          timestamp: timestamp,
        }
      ]
    };

    setTickets([newTicket, ...tickets]);
    setNewTicketData({
      title: '',
      department: 'sales',
      priority: 'medium',
      orderTrackingCode: '',
      message: '',
    });
    setActiveSubTab('tickets');
    setSelectedTicketId(newId);
    showToast('تیکت شما ثبت شد و صفحه گفت‌وگو باز گردید.');
  };

  // Handle send reply inside ticket
  const handleSendTicketReply = (ticketId: string, replyText: string) => {
    const timestamp = `${new Date().toLocaleDateString('fa-IR')} - ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    
    setTickets(prevTickets => 
      prevTickets.map(t => {
        if (t.id !== ticketId) return t;
        const currentMsgs = t.messages || [
          {
            id: `msg-init-${t.id}`,
            ticketId: t.id,
            sender: 'customer',
            senderName: t.customerName,
            text: t.lastMessage,
            timestamp: t.createdAt
          }
        ];
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          ticketId: t.id,
          sender: 'customer',
          senderName: currentUser?.fullName || 'شما',
          text: replyText,
          timestamp: timestamp,
        };
        return {
          ...t,
          status: 'open',
          lastMessage: replyText,
          updatedAt: 'هم‌اکنون',
          messages: [...currentMsgs, newMsg]
        };
      })
    );

    showToast('پاسخ شما در تیکت ثبت شد.');
  };

  // ==========================================
  // VIEW 1: NOT LOGGED IN (Phone Login Form)
  // ==========================================
  if (!currentUser) {
    return (
      <section className="py-12 px-4 max-w-xl mx-auto" id="user-auth-section">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-sm">
              <Building2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 ">
              سامانه پخش عمده دخانیات سوین
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              ورود سریع با شماره موبایل
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              مشاهده سوابق پیش‌فاکتورها، صدور مستقیم PDF، ارسال تیکت و پیگیری بارگیری از انبار جنت‌آباد
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedLoginRole('customer');
                setOtpStep('phone');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                selectedLoginRole === 'customer'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>مغازه‌دار / مشتری عادی</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedLoginRole('visitor');
                setOtpStep('phone');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                selectedLoginRole === 'visitor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>سفیر فروش / ویزیتور</span>
            </button>
          </div>

          {selectedLoginRole === 'visitor' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 mb-4 text-xs text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>ورود به پنل ویزیتوری نیاز به شماره موبایل ثبت‌شده در سیستم مرکزی جنگو دارد.</span>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-4 text-xs text-emerald-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>کلیه مغازه‌داران و خریداران محترم می‌توانند با شماره همراه خود به صورت مستقیم ثبت‌نام و خرید نمایند.</span>
            </div>
          )}

          {otpStep === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {selectedLoginRole === 'visitor' ? 'شماره موبایل ویزیتور:' : 'شماره موبایل مغازه‌دار / خریدار:'}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    placeholder="09120759419"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pl-11 text-slate-900 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoadingOtp}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isLoadingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال ارسال پیامک...</span>
                  </>
                ) : (
                  <>
                    <span>دریافت کد تأیید ورود</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-800 flex items-center justify-between">
                <span>کد تأیید به شماره <strong>{loginPhone}</strong> ارسال شد.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  کد ۴ رقمی پیامک شده:
                </label>
                <input
                  type="text"
                  dir="ltr"
                  maxLength={4}
                  placeholder="----"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  autoFocus
                  required
                  className="w-full tracking-widest text-center text-xl font-black font-mono bg-slate-50 border border-slate-200 rounded-2xl py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 ">
                <button
                  type="button"
                  onClick={() => setOtpStep('phone')}
                  className="text-blue-600 hover:underline"
                >
                  ویرایش شماره موبایل
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isVerifyingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال بررسی کد و ورود به پنل...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأیید و ورود به پنل</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            انبار مرکزی سوین: تهران، جنت‌آباد | تلفن پشتیبانی سفارشات: <strong dir="ltr">۰۹۱۲۰۷۵۹۴۱۹</strong>
          </div>
        </div>
      </section>
    );
  }

  // Check profile completeness for mandatory banner
  const isProfileIncomplete = currentUser ? (
    currentUser.role === 'customer'
      ? (!currentUser.fullName || currentUser.fullName.includes('گرامی') || !currentUser.shopName || currentUser.shopName.includes('سوپرمارکت') || !currentUser.address)
      : (!currentUser.fullName || !currentUser.nationalId || !currentUser.bankCardNumber || !currentUser.bankSheba)
  ) : false;

  // Selected Ticket Object if viewing detail
  const activeSelectedTicket = selectedTicketId ? tickets.find(t => t.id === selectedTicketId) : null;

  // ==========================================
  // VIEW 2: LOGGED IN USER PANEL
  // ==========================================
  return (
    <section className="py-6 px-4 sm:px-6 max-w-[1600px] w-full mx-auto animate-in fade-in zoom-in-95 duration-500" id="user-profile-panel">
      
      {/* Top Profile Summary Header */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-md shrink-0">
              {currentUser.fullName.slice(0, 1) || 'س'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black text-slate-900 truncate">
                  {currentUser.fullName}
                </h1>
                {currentUser.role === 'visitor' ? (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-md shrink-0">
                    <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    سفیر فروش / ویزیتور
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-md shrink-0">
                    <Building className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    مغازه‌دار / خریدار
                  </span>
                )}
                {currentUser.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md shrink-0">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    احراز هویت شده
                  </span>
                )}
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate">
                  {currentUser.shopName || currentUser.businessName || 'فروشگاه شخصی'}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span dir="ltr">{currentUser.phone}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {currentUser.city} - {currentUser.province}
                </span>
                <span className="hidden xs:flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  عضویت: {currentUser.createdAt}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 ">
            <button
              onClick={() => {
                setSelectedTicketId(null);
                setActiveSubTab('new_ticket');
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ارسال تیکت</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>

        </div>

        {/* Mandatory Profile Completion Alert Banner */}
        {isProfileIncomplete && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 mt-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 ">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 animate-bounce" />
              <div className="text-xs space-y-1">
                <p className="font-black text-sm text-amber-900 ">
                  ⚠️ تکمیل مشخصات پروفایل الزامی است!
                </p>
                <p className="text-amber-800 ">
                  {currentUser.role === 'customer'
                    ? 'جهت امکان ثبت فاکتور رسمی، دریافت تخفیف‌های ویژه و ارسال بار به مغازه، لطفاً نام مسئول، نام فروشگاه و آدرس را تکمیل فرمایید.'
                    : 'جهت واریز پورسانت فروش، شماره کارت ۱۶ رقمی، شماره شبا و کد ملی ویزیتوری خود را وارد نمایید.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedTicketId(null);
                setActiveSubTab('profile');
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md transition-all shrink-0 whitespace-nowrap"
            >
              تکمیل فوری مشخصات
            </button>
          </div>
        )}

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-t border-slate-100 mt-4 sm:mt-6 pt-3 sm:pt-4 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => {
              setSelectedTicketId(null);
              setActiveSubTab('orders');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSubTab === 'orders' && !selectedTicketId
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 '
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>سفارش‌ها و پیش‌فاکتورها ({formatNumberFa(userOrders.length)})</span>
          </button>

          {/* Customer Financial Ledger Tab */}
          {currentUser.role === 'customer' && (
            <button
              onClick={() => {
                setSelectedTicketId(null);
                setActiveSubTab('financial_hub');
              }}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeSubTab === 'financial_hub' && !selectedTicketId
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 '
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>حساب دفتری و نسیه مغازه‌دار</span>
            </button>
          )}

          <button
            onClick={() => {
              setSelectedTicketId(null);
              setActiveSubTab('tickets');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSubTab === 'tickets' || selectedTicketId
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 '
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>تیکت‌های پشتیبانی ({formatNumberFa(tickets.length)})</span>
          </button>

          <button
            onClick={() => {
              setSelectedTicketId(null);
              setActiveSubTab('profile');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeSubTab === 'profile' && !selectedTicketId
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 '
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{currentUser.role === 'visitor' ? 'مشخصات و کارت بانکی ویزیتور' : 'مشخصات مغازه و پروانه کسب'}</span>
          </button>

          {/* Visitor Only Tabs */}
          {currentUser.role === 'visitor' && (
            <>
              <button
                onClick={() => {
                  setSelectedTicketId(null);
                  setActiveSubTab('visitor_club');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeSubTab === 'visitor_club' && !selectedTicketId
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 '
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>باشگاه مغازه‌داران من ({formatNumberFa(retailShops.length)})</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTicketId(null);
                  setActiveSubTab('visitor_report');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeSubTab === 'visitor_report' && !selectedTicketId
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 '
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>گزارش پورسانت و سود ویزیتور</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* If Viewing a single ticket detail page */}
      {selectedTicketId && activeSelectedTicket ? (
        <TicketDetailPage
          ticket={activeSelectedTicket}
          currentUser={currentUser}
          onBack={() => setSelectedTicketId(null)}
          onSendReply={handleSendTicketReply}
        />
      ) : (
        <>
          {/* ==========================================
              SUBTAB 1: ORDERS & INVOICES
             ========================================== */}
          {activeSubTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  پیش‌فاکتورها و سوابق خرید عمده
                </h2>
                <span className="text-xs text-slate-500">
                  تحویل از انبار مرکزی جنت‌آباد با فاکتور رسمی
                </span>
              </div>

              {userOrders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="font-bold text-sm text-slate-700 ">هنوز پیش‌فاکتوری ثبت نکرده‌اید.</p>
                  <p className="text-xs mt-1">کالاهای مورد نظر خود را از کاتالوگ به سبد خرید اضافه نموده و پیش‌فاکتور رسمی صادر نمایید.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {userOrders.map((order, idx) => {
                    const rawItemsStr = order.items.map(i => `${i.product.nameFa} (${formatNumberFa(i.quantity)} ${i.unit === 'carton' ? 'کارتن' : 'باکس'})`).join('، ');
                    const truncatedItems = rawItemsStr.length > 55 ? rawItemsStr.slice(0, 55) + '...' : rawItemsStr;

                    return (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-blue-400 transition-all space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 ">
                                {order.orderId || order.trackingCode}
                              </span>
                              <span className="text-xs text-slate-500">
                                تاریخ: {order.createdAt}
                              </span>
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ">
                                {order.paymentStatus || 'پیش‌فاکتور رسمی'}
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 space-y-1">
                              <p>
                                اقلام: <strong title={rawItemsStr}>{truncatedItems}</strong>
                              </p>
                              <p className="text-slate-400 text-[11px]">
                                روش ارسال: {order.customer.shippingMethod} | تحویل‌گیرنده: {order.customer.shopOwnerName}
                                {order.retailShop && ` | مغازه: ${order.retailShop.shopName}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 ">
                            <div className="text-left md:text-left">
                              <span className="text-[11px] text-slate-400 block">مبلغ نهایی فاکتور:</span>
                              <span className="text-base font-black text-blue-600 font-mono">
                                {formatToman(order.finalTotal)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Reorder Button */}
                              {onReorderItems && (
                                <button
                                  onClick={() => {
                                    onReorderItems(order.items);
                                    showToast(`اقلام سفارش ${order.orderId || order.trackingCode} به سبد خرید اضافه شدند.`);
                                  }}
                                  className="h-10 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all text-xs font-black flex items-center justify-center gap-1.5"
                                  title="شارژ سریع مغازه با همین اقلام"
                                >
                                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                                  <span className="hidden sm:inline">سفارش مجدد</span>
                                </button>
                              )}

                              {/* Order Details Button */}
                              <button
                                onClick={() => setSelectedOrderForDetails(order)}
                                className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all flex items-center justify-center gap-1.5"
                                title="مشاهده جزئیات و ریز اقلام خرید"
                              >
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="hidden sm:inline">جزئیات</span>
                              </button>

                              <button
                                onClick={() => handleDownloadInvoice(order)}
                                disabled={downloadingPdfId === order.orderId}
                                className="h-10 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all text-xs font-black flex items-center justify-center gap-1.5"
                                title="دانلود فایل PDF رسمی پیش‌فاکتور"
                              >
                                <Download className={`w-4 h-4 ${downloadingPdfId === order.orderId ? 'animate-bounce' : ''}`} />
                                <span className="hidden sm:inline">دانلود PDF</span>
                              </button>

                              {order.trackingCode && (
                                <button
                                  onClick={() => onOpenTracking(order.trackingCode || '')}
                                  className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all text-xs font-black flex items-center justify-center gap-1.5"
                                  title="مشاهده وضعیت ترابری و بارگیری"
                                >
                                  <Truck className="w-4 h-4 text-blue-600" />
                                  <span className="hidden sm:inline">رهگیری</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dispatch Driver Info Banner for active delivery */}
                        {order.trackingCode && (
                          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="text-slate-700 font-bold">ناوگان تحویل بار:</span>
                              <span className="text-slate-900 font-black">حسین رضایی (وانت پخش جنت‌آباد)</span>
                              <span className="font-mono text-slate-500 text-[11px]">| پلاک: ایران ۶۸ - ۳۴۵ ج ۹۱</span>
                            </div>
                            <a
                              href="tel:09120759419"
                              className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-[11px]"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>تماس با راننده (۰۹۱۲۰۷۵۹۴۱۹)</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              SUBTAB: CUSTOMER FINANCIAL LEDGER & HUB
             ========================================== */}
          {activeSubTab === 'financial_hub' && currentUser && (
            <CustomerFinancialHub
              currentUser={currentUser}
              orders={userOrders}
              onOpenSettleModal={() => setShowOnlineSettleModal(true)}
              onOpenDigitalCard={() => setShowDigitalPassModal(true)}
              onOpenPriceAlerts={() => setShowPriceAlertsModal(true)}
              showToast={showToast}
            />
          )}

          {/* ==========================================
              SUBTAB: VISITOR RETAIL SHOPS CLUB
             ========================================== */}
          {activeSubTab === 'visitor_club' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    باشگاه مشتریان مغازه‌دار ویزیتور
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    مدیریت مغازه‌داران و خرده‌فروشان تحت پوشش ویزیتور (کد ویزیتور: {currentUser?.visitorCode || currentUser?.referralCode || 'VISITOR-9419'})
                  </p>
                </div>
                <button
                  onClick={() => setShowAddShopModal(true)}
                  className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>ثبت مغازه جدید</span>
                </button>
              </div>

              {retailShops.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
                  <Building className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="font-bold text-sm text-slate-700 ">هنوز مغازه‌ای در باشگاه مشتریان ثبت نشده است.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {retailShops.map((shop) => (
                    <div key={shop.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-slate-900 flex items-center gap-2">
                          <Building className="w-4 h-4 text-blue-600" />
                          {shop.shopName}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ">
                          {shop.city}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <p>مدیر / مسئول: <strong>{shop.ownerName}</strong></p>
                        <p>تلفن همراه: <span className="font-mono">{shop.phone}</span></p>
                        <p className="text-slate-400 text-[11px]">آدرس: {shop.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Shop Modal */}
              {showAddShopModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-black text-sm text-slate-900 ">افزودن مغازه‌دار جدید به باشگاه</h3>
                      <button onClick={() => setShowAddShopModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const newShop: RetailShopCustomer = {
                        id: `shop-${Date.now()}`,
                        shopName: newShopName,
                        ownerName: newOwnerName,
                        phone: newPhone,
                        city: newCity,
                        address: newAddress,
                      };
                      const updated = [newShop, ...retailShops];
                      if (onUpdateRetailShops) onUpdateRetailShops(updated);
                      showToast(`مغازه ${newShopName} با موفقیت به باشگاه مشتریان اضافه شد.`);
                      setShowAddShopModal(false);
                      setNewShopName('');
                      setNewOwnerName('');
                      setNewPhone('');
                      setNewAddress('');
                    }} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">نام مغازه / سوپرمارکت:</label>
                        <input
                          type="text"
                          required
                          value={newShopName}
                          onChange={(e) => setNewShopName(e.target.value)}
                          placeholder="مثال: سوپرمارکت مرکزی"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 focus:outline-hidden"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">نام مسئول / خریدار:</label>
                          <input
                            type="text"
                            required
                            value={newOwnerName}
                            onChange={(e) => setNewOwnerName(e.target.value)}
                            placeholder="نام مدیر"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1">تلفن همراه:</label>
                          <input
                            type="text"
                            required
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="0912..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-mono focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">شهر:</label>
                        <input
                          type="text"
                          required
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-1">آدرس دقیق:</label>
                        <textarea
                          rows={2}
                          required
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 focus:outline-hidden"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>ثبت و افزودن</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddShopModal(false)}
                          className="h-10 px-4 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center"
                        >
                          انصراف
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              SUBTAB: VISITOR PROFIT & COMMISSION REPORT
             ========================================== */}
          {activeSubTab === 'visitor_report' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    گزارش سود و کمیسیون ویزیتور
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    محاسبه اتوماتیک پورسانت و سود از فروش‌های ثبت‌شده با کد ویزیتور: <strong>{currentUser?.visitorCode || currentUser?.referralCode || 'VISITOR-9419'}</strong> (نرخ سود: {currentUser?.commissionRate || 2.5}٪)
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
                  <span className="text-xs text-slate-400">تعداد کل سفارشات ویزیت شده</span>
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {formatNumberFa(userOrders.length)} سفارش
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
                  <span className="text-xs text-slate-400">مجموع مبلغ فروش</span>
                  <div className="text-xl font-black text-blue-600 font-mono">
                    {formatToman(userOrders.reduce((acc, o) => acc + o.finalTotal, 0))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
                  <span className="text-xs text-slate-400">کل سود / کمیسیون ویزیتور</span>
                  <div className="text-xl font-black text-emerald-600 font-mono">
                    {formatToman(userOrders.reduce((acc, o) => acc + (o.visitorCommission || (o.finalTotal * 0.025)), 0))}
                  </div>
                </div>
              </div>

              {/* Detailed Orders Commission Breakdown */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
                <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-3">
                  ریز کمیسیون‌ها به تفکیک فاکتورهای صادره
                </h3>
                {userOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">هنوز سفارشی با این کد ویزیتور ثبت نشده است.</p>
                ) : (
                  <div className="space-y-3">
                    {userOrders.map((order, idx) => {
                      const commission = order.visitorCommission || (order.finalTotal * 0.025);
                      return (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-2xl gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-600">{order.orderId || order.trackingCode}</span>
                              <span className="text-slate-400">|</span>
                              <span className="text-slate-600 ">خریدار: {order.retailShop?.shopName || order.customer.shopName}</span>
                            </div>
                            <p className="text-slate-400 text-[11px]">تاریخ: {order.createdAt} | مبلغ کل: {formatToman(order.finalTotal)}</p>
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-400 block">سود ویزیتور ({currentUser?.commissionRate || 2.5}٪):</span>
                            <span className="font-black text-emerald-600 font-mono text-sm">{formatToman(commission)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              SUBTAB 2: SUPPORT TICKETS LIST
             ========================================== */}
          {activeSubTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  تیکت‌ها و مکاتبات پشتیبانی
                </h2>
                <button
                  onClick={() => setActiveSubTab('new_ticket')}
                  className="flex items-center gap-1 text-xs font-black text-blue-600 hover:underline"
                >
                  <PlusCircle className="w-4 h-4" />
                  ثبت تیکت جدید
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {tickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-blue-500 cursor-pointer transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {t.ticketNumber}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {t.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                          t.status === 'answered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 '
                            : 'bg-amber-50 text-amber-700 border border-amber-200 '
                        }`}>
                          {t.status === 'answered' ? 'پاسخ داده شده' : 'در انتظار بررسی'}
                        </span>
                        <span className="text-slate-400">{t.updatedAt}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                      {t.lastMessage}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-blue-600 ">
                      {t.orderTrackingCode ? (
                        <div className="font-medium flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          مرتبط با کد سفارش: <strong className="font-mono">{t.orderTrackingCode}</strong>
                        </div>
                      ) : (
                        <div></div>
                      )}
                      <span className="font-bold flex items-center gap-1 group-hover:underline">
                        <span>مشاهده گفت‌وگو و ارسال پیام</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              SUBTAB 3: CREATE NEW TICKET FORM
             ========================================== */}
          {activeSubTab === 'new_ticket' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 ">
                <div>
                  <h2 className="text-lg font-black text-slate-900 ">ارسال تیکت به واحد پشتیبانی و انبار</h2>
                  <p className="text-xs text-slate-500 mt-0.5">پاسخگویی سریع توسط کارشناسان فروش و ترابری انبار جنت‌آباد</p>
                </div>
                <button
                  onClick={() => setActiveSubTab('tickets')}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  انصراف و بازگشت
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    موضوع تیکت:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: استعلام زمان بارگیری سفارش از انبار جنت‌آباد"
                    value={newTicketData.title}
                    onChange={(e) => setNewTicketData({ ...newTicketData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      واحد مربوطه:
                    </label>
                    <select
                      value={newTicketData.department}
                      onChange={(e: any) => setNewTicketData({ ...newTicketData, department: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      <option value="sales">واحد فروش و ثبت پیش‌فاکتور</option>
                      <option value="warehouse">انبار مرکزی جنت‌آباد (پلمپ و بارگیری)</option>
                      <option value="shipping">واحد ترابری و باربری (وطن / جهانگیر)</option>
                      <option value="finance">واحد مالی و تأیید فیش واریزی</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      شماره پیش‌فاکتور یا رهگیری (اختیاری):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="SVN-89412"
                      value={newTicketData.orderTrackingCode}
                      onChange={(e) => setNewTicketData({ ...newTicketData, orderTrackingCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    متن پیام:
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="توضیحات کامل درخواست یا استعلام خود را بنویسید..."
                    value={newTicketData.message}
                    onChange={(e) => setNewTicketData({ ...newTicketData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>ثبت و ارسال تیکت</span>
                </button>
              </form>
            </div>
          )}

          {/* ==========================================
              SUBTAB 4: USER PROFILE & ID / BANK VERIFICATION
             ========================================== */}
          {activeSubTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 ">
                    {currentUser?.role === 'visitor' ? 'مشخصات، مدارک هویتی و حساب بانکی ویزیتور' : 'مشخصات فروشگاه و پروانه کسب مغازه‌دار'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentUser?.role === 'visitor' 
                      ? 'ثبت شماره کارت ۱۶ رقمی و شبا جهت واریز اتوماتیک پورسانت فروش در سیستم سیستم جنگو' 
                      : 'تکمیل مشخصات جهت صدور پیش‌فاکتور رسمی و ارسال مستقیم سفارشات از انبار جنت‌آباد'}
                  </p>
                </div>
                <span className={`text-xs font-bold flex items-center gap-1 px-3 py-1 rounded-full border ${
                  currentUser?.isVerified 
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-200 '
                    : 'text-amber-600 bg-amber-50 border-amber-200 '
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                  {currentUser?.isVerified ? 'تأیید شده در جنگو' : 'در انتظار بررسی'}
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* بخش اول: اطلاعات فردی و مغازه */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    {currentUser?.role === 'visitor' ? 'اطلاعات فردی ویتور' : 'مشخصات مدیر و فروشگاه'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {currentUser?.role === 'visitor' ? 'نام و نام خانوادگی ویزیتور:' : 'نام و نام خانوادگی مسئول مغازه:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={editProfile.fullName}
                        onChange={(e) => setEditProfile({ ...editProfile, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        شماره موبایل:
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        disabled
                        value={editProfile.phone}
                        className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-mono text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {currentUser?.role === 'customer' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          نام فروشگاه / سوپرمارکت:
                        </label>
                        <input
                          type="text"
                          required
                          value={editProfile.shopName || ''}
                          onChange={(e) => setEditProfile({ ...editProfile, shopName: e.target.value })}
                          placeholder="مثال: سوپرمارکت مرکزی نگین"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          شماره پروانه کسب / جواز (اختیاری):
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={editProfile.businessLicenseNumber || ''}
                          onChange={(e) => setEditProfile({ ...editProfile, businessLicenseNumber: e.target.value })}
                          placeholder="BL-98214"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        استان:
                      </label>
                      <input
                        type="text"
                        required
                        value={editProfile.province}
                        onChange={(e) => setEditProfile({ ...editProfile, province: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        شهر:
                      </label>
                      <input
                        type="text"
                        required
                        value={editProfile.city}
                        onChange={(e) => setEditProfile({ ...editProfile, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {currentUser?.role === 'customer' ? 'آدرس دقیق فروشگاه / تحویل بار:' : 'آدرس محل سکونت / فعالیت:'}
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={editProfile.address}
                      onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* بخش شماره کارت و شبا (ویژه ویزیتور و تسویه‌حساب) */}
                <div className="space-y-4 pt-4 border-t border-slate-100 ">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    {currentUser?.role === 'visitor' ? 'شماره کارت و شبا جهت واریز پورسانت ویزیتور' : 'مشخصات حساب بانکی جهت عودت وجه'}
                  </h3>

                  {/* Visual Bank Card Display */}
                  <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider text-slate-300">
                        {editProfile.bankName || 'بانک ملت / ملی / صادرات'}
                      </span>
                      <span className="text-xs font-mono bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30 text-emerald-300 font-bold">
                        {currentUser?.role === 'visitor' ? 'حساب پورسانت ویزیتور' : 'حساب بنکداری'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">شماره کارت ۱۶ رقمی:</span>
                      <div className="text-lg sm:text-xl font-mono font-black tracking-widest text-emerald-400" dir="ltr">
                        {editProfile.bankCardNumber 
                          ? editProfile.bankCardNumber.replace(/(.{4})/g, '$1 ').trim() 
                          : '۶۱۰۴ - ۳۳۷۸ - ۹۰۱۲ - ۳۴۵۶'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-slate-700/60 pt-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block">صاحب حساب:</span>
                        <span className="font-bold text-slate-200">{editProfile.bankAccountHolder || editProfile.fullName || 'نام صاحب حساب'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">شماره شبا (IBAN):</span>
                        <span className="font-mono text-[11px] text-blue-300" dir="ltr">{editProfile.bankSheba || 'IR000000000000000000000000'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        نام بانک:
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: بانک ملت، ملی، صادرات، سامان..."
                        value={editProfile.bankName || ''}
                        onChange={(e) => setEditProfile({ ...editProfile, bankName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        نام صاحب حساب (مطابق کارت ملی):
                      </label>
                      <input
                        type="text"
                        placeholder="نام و نام خانوادگی صاحب کارت"
                        value={editProfile.bankAccountHolder || ''}
                        onChange={(e) => setEditProfile({ ...editProfile, bankAccountHolder: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        شماره کارت ۱۶ رقمی:
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        maxLength={16}
                        placeholder="6104337890123456"
                        value={editProfile.bankCardNumber || ''}
                        onChange={(e) => setEditProfile({ ...editProfile, bankCardNumber: e.target.value.replace(/\D/g, '') })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        شماره شبا (با IR):
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="IR120120000000001234567890"
                        value={editProfile.bankSheba || ''}
                        onChange={(e) => setEditProfile({ ...editProfile, bankSheba: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Visitor specific identity and vehicle sections */}
                {currentUser?.role === 'visitor' && (
                  <>
                    {/* بخش احراز هویت ویزیتور */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 ">
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-500" />
                        مدارک هویتی ویزیتور
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            کد ملی ویزیتور:
                          </label>
                          <input
                            type="text"
                            dir="ltr"
                            required
                            value={editProfile.nationalId || ''}
                            onChange={(e) => setEditProfile({ ...editProfile, nationalId: e.target.value })}
                            placeholder="0012345678"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            تصویر کارت ملی (جهت ثبت در جنگو):
                          </label>
                          <div className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-2.5 text-center flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                            <span className="text-xs text-slate-500 flex items-center gap-2">
                              <Download className="w-4 h-4 rotate-180" />
                              {editProfile.nationalIdImage ? 'کارت ملی بارگذاری شده است' : 'انتخاب تصویر و بارگذاری'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* وسیله نقلیه ویزیتور */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 ">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-500" />
                          وسیله نقلیه ویزیتور
                        </h3>
                        {editProfile.isVehicleVerified && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">وسیله نقلیه تأیید شده</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            نوع وسیله نقلیه شخصی:
                          </label>
                          <select
                            value={editProfile.vehicleType || 'motorcycle'}
                            onChange={(e: any) => setEditProfile({ ...editProfile, vehicleType: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          >
                            <option value="motorcycle">موتور سیکلت</option>
                            <option value="car">سواری (ماشین شخصی)</option>
                            <option value="van">وانت بار</option>
                            <option value="truck">کامیونت / خاور</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            شماره پلاک:
                          </label>
                          <input
                            type="text"
                            dir="ltr"
                            value={editProfile.vehiclePlate || ''}
                            onChange={(e) => setEditProfile({ ...editProfile, vehiclePlate: e.target.value })}
                            placeholder="11 ب 111 ایران 11"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-center text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* قرارداد ویزیتور */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 ">
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-blue-500" />
                        قرارداد آنلاین همکاری ویزیتوری
                      </h3>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 h-32 overflow-y-auto leading-relaxed whitespace-pre-line text-justify" dir="rtl">
                        {djangoConfig?.visitorContractText || `بسمه تعالی - قرارداد همکاری ویزیتوری سامانه سوین

۱. ویزیتور متعهد می‌گردد کلیه قوانین و مقررات فروش سامانه را رعایت نموده و از فروش خارج از شبکه خودداری نماید.
۲. پورسانت فروش بر اساس تعرفه‌های مصوب (در حال حاضر ۲.۵ درصد) به حساب کاربری ویزیتور منظور و پس از تسویه نهایی خریدار، قابل برداشت خواهد بود.
۳. ویزیتور موظف است مشخصات و نشانی مغازه‌ها و خریداران را به طور دقیق در سامانه ثبت نماید.
۴. تأیید این قرارداد به منزله امضای دیجیتال و پذیرش کلیه شرایط همکاری با سامانه پخش دخانیات سوین است.`}
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          required
                          checked={editProfile.hasAcceptedContract || false}
                          onChange={(e) => setEditProfile({ ...editProfile, hasAcceptedContract: e.target.checked })}
                          className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-xs font-bold text-slate-700 ">
                          اینجانب کلیه شرایط و بندهای قرارداد همکاری را مطالعه کرده و می‌پذیرم.
                        </span>
                      </label>
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>ثبت نهایی و ذخیره مشخصات</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto no-scrollbar bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto modal-overscroll-contain">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  جزئیات و ریز اقلام خرید ({selectedOrderForDetails.orderId || selectedOrderForDetails.trackingCode})
                </h3>
                <span className="text-[11px] text-slate-400">تاریخ ثبت: {selectedOrderForDetails.createdAt}</span>
              </div>
              <button onClick={() => setSelectedOrderForDetails(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
                <p><strong>مغازه‌دار:</strong> {selectedOrderForDetails.customer.shopOwnerName} ({selectedOrderForDetails.customer.shopName})</p>
                <p><strong>تلفن:</strong> <span className="font-mono">{selectedOrderForDetails.customer.shopPhone}</span> | شهر: {selectedOrderForDetails.customer.city}</p>
                <p><strong>روش ارسال:</strong> {selectedOrderForDetails.customer.shippingMethod}</p>
                {selectedOrderForDetails.retailShop && (
                  <p className="text-blue-600 font-bold"><strong>مغازه مقصد (باشگاه مشتریان):</strong> {selectedOrderForDetails.retailShop.shopName} (مدیر: {selectedOrderForDetails.retailShop.ownerName})</p>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-black">
                    <tr>
                      <th className="p-3">نام کالا / برند</th>
                      <th className="p-3">تعداد</th>
                      <th className="p-3">قیمت واحد</th>
                      <th className="p-3">مبلغ کل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 ">
                    {selectedOrderForDetails.items.map((item, iIdx) => {
                      const unitPrice = item.unit === 'carton' ? item.product.cartonPrice : item.product.boxPrice;
                      const lineTotal = unitPrice * item.quantity;
                      return (
                        <tr key={iIdx} className="hover:bg-slate-50/50 ">
                          <td className="p-3 font-bold text-slate-900 ">
                            {item.product.nameFa} <span className="text-[10px] text-slate-400 font-normal">({item.unit === 'carton' ? 'کارتن' : 'باکس'})</span>
                          </td>
                          <td className="p-3 font-mono font-bold">{formatNumberFa(item.quantity)}</td>
                          <td className="p-3 font-mono text-slate-600 ">{formatToman(unitPrice)}</td>
                          <td className="p-3 font-mono font-black text-blue-600 ">{formatToman(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50/80 p-4 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600 block">هزینه باربری: {formatToman(selectedOrderForDetails.customer.shippingCost || 0)}</span>
                  <span className="text-slate-600 block">تخفیف تیراژ: {formatToman(selectedOrderForDetails.discountAmount || 0)}</span>
                </div>
                <div className="text-left">
                  <span className="text-slate-500 block text-[11px]">مبلغ قابل پرداخت نهایی:</span>
                  <span className="font-black text-base text-blue-700 font-mono">{formatToman(selectedOrderForDetails.finalTotal)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="h-10 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition-all"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modals */}
      {showOnlineSettleModal && currentUser && (
        <CustomerOnlineSettleModal
          currentUser={currentUser}
          initialAmount={3850000}
          onClose={() => setShowOnlineSettleModal(false)}
          onSuccess={(amt) => {
            setShowOnlineSettleModal(false);
          }}
          showToast={showToast}
        />
      )}

      {showDigitalPassModal && currentUser && (
        <CustomerDigitalPassModal
          currentUser={currentUser}
          onClose={() => setShowDigitalPassModal(false)}
          showToast={showToast}
        />
      )}

      {showPriceAlertsModal && (
        <CustomerPriceAlertsModal
          products={availableProducts}
          onClose={() => setShowPriceAlertsModal(false)}
          showToast={showToast}
        />
      )}

    </section>
  );
};

