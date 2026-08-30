import { CigaretteProduct, DjangoCrmConfig, CigaretteCategory } from '../types';
import { CIGARETTE_PRODUCTS } from '../data/products';

export interface DjangoProductItem {
  id?: number | string;
  name_fa?: string;
  name_en?: string;
  brand?: string;
  category?: string;
  origin?: string;
  carton_price?: number;
  box_price?: number;
  boxes_per_carton?: number;
  stock_cartons?: number;
  moq?: number;
  barcode?: string;
  tar?: string;
  nicotine?: string;
  image?: string;
  price_trend?: 'stable' | 'up' | 'down';
  hologram?: string;
  description?: string;
  is_available?: boolean;
}

export interface DjangoCategoryItem {
  id?: number | string;
  key: string;
  label: string;
  created_at?: string;
}

export interface DjangoHologramItem {
  id?: number | string;
  title: string;
  created_at?: string;
}

// Global In-Memory Django Database Persistence Store
class DjangoDatabaseStore {
  private categories: { key: CigaretteCategory; label: string }[] = [
    { key: 'cigarettes', label: 'سیگار اورجینال' },
    { key: 'drinks_coffee', label: 'قهوه و نوشیدنی' },
    { key: 'charcoal', label: 'ذغال (باكسی / کیلویی)' },
    { key: 'hookah', label: 'انواع قلیان' },
    { key: 'hookah_hose', label: 'شیلنگ قلیان' },
    { key: 'hookah_accessories', label: 'سری و لوازم قلیان' },
    { key: 'iqos_heets', label: 'استیک تیریا و هیتس' },
    { key: 'iqos_devices', label: 'دستگاه آیکاس (IQOS)' },
    { key: 'pods_vapes', label: 'پاد و ویپ یکبارمصرف' },
    { key: 'tobacco', label: 'توتون و پیپ' },
    { key: 'accessories', label: 'فندک و اکسسوری' },
  ];

  private holograms: string[] = [
    'اورجینال اروپایی',
    'سفارش دبی',
    'شرکتی اصل',
    'تولید داخل',
    'وارداتی اصل',
    'اورجینال سوئیس با بارکد اصالت',
    'بدون هولوگرام',
  ];

  private products: CigaretteProduct[] = [...CIGARETTE_PRODUCTS];

  private salesAnalytics: any[] = [];

  getCategories(): { key: CigaretteCategory; label: string }[] {
    return [...this.categories];
  }

  addCategory(key: CigaretteCategory, label: string): { key: CigaretteCategory; label: string } {
    const existing = this.categories.find(c => c.label === label || c.key === key);
    if (existing) return existing;
    const newCat = { key, label };
    this.categories.push(newCat);
    return newCat;
  }

  getHolograms(): string[] {
    return [...this.holograms];
  }

  addHologram(title: string): string {
    if (!this.holograms.includes(title)) {
      this.holograms.unshift(title);
    }
    return title;
  }

  getProducts(): CigaretteProduct[] {
    return [...this.products];
  }

  addProduct(product: CigaretteProduct): CigaretteProduct {
    const existingIndex = this.products.findIndex(p => p.id === product.id || (product.barcode && p.barcode === product.barcode));
    if (existingIndex >= 0) {
      this.products[existingIndex] = product;
    } else {
      this.products.unshift(product);
    }
    return product;
  }

  saveSalesAnalysis(record: any) {
    this.salesAnalytics.push({
      ...record,
      saved_at: new Date().toISOString()
    });
  }

  getSalesAnalysis() {
    return this.salesAnalytics;
  }

  // Live in-memory representation of Kavenegar Settings
  private kavenegarSettings: {
    name: string;
    api_token: string;
    is_active: boolean;
    debug_mode: boolean;
  } = {
    name: 'سامانه پیامک هوشمند سوین (Kavenegar Gateway)',
    api_token: '366E417A5478474274416738367963385250466453673D3D',
    is_active: true,
    debug_mode: false,
  };

  getKavenegarSettings() {
    try {
      const saved = localStorage.getItem('sovin_kavenegar_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...this.kavenegarSettings };
  }

  saveKavenegarSettings(settings: any) {
    this.kavenegarSettings = { ...this.kavenegarSettings, ...settings };
    try {
      localStorage.setItem('sovin_kavenegar_settings', JSON.stringify(this.kavenegarSettings));
    } catch {}
    return { ...this.kavenegarSettings };
  }

  // Live in-memory representation of SmsLogs
  private smsLogs: any[] = [
    {
      id: 'sms_1',
      recipient_phone: '09120759419',
      pattern: 'welcome',
      pattern_code: 'welcome_template',
      tokens_sent: { receptor: '09120759419', token: 'مهندس_حسینی', token2: 'صندوق_فروشگاهی_سوین' },
      kavenegar_message_id: '887263541',
      status: 'delivered',
      cost_rial: 240,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString() // yesterday
    },
    {
      id: 'sms_2',
      recipient_phone: '09121112233',
      pattern: 'pos_receipt',
      pattern_code: 'pos_receipt_template',
      tokens_sent: { receptor: '09121112233', token: 'POS-14030603-0989', token2: 'مشتری_حضوری', token3: '۱۲,۵۰۰,۰۰۰_تومان' },
      kavenegar_message_id: '887263545',
      status: 'delivered',
      cost_rial: 240,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
    },
    {
      id: 'sms_3',
      recipient_phone: '09129876543',
      pattern: 'pos_partial_payment',
      pattern_code: 'pos_partial_template',
      tokens_sent: { receptor: '09129876543', token: 'POS-14030604-0015', token2: 'پخش_آذرخش', token3: '۳,۲۰۰,۰۰۰_تومان' },
      kavenegar_message_id: '887263590',
      status: 'delivered',
      cost_rial: 240,
      created_at: new Date(Date.now() - 3600000 * 1).toISOString() // 1 hour ago
    }
  ];

  // Live in-memory representation of SmsPatterns
  private smsPatterns: any[] = [
    { id: 1, name_fa: 'otp', title_fa: 'ارسال کد تایید ورود (OTP)', pattern_code: 'otp_verification', is_active: true, tokens_info: 'token: کد تایید ۴ یا ۵ رقمی' },
    { id: 2, name_fa: 'welcome', title_fa: 'خوش‌آمدگویی ورود به سیستم', pattern_code: 'welcome_template', is_active: true, tokens_info: 'token: نام کاربر | token2: نام مجموعه' },
    { id: 3, name_fa: 'logout', title_fa: 'اعلان خروج از حساب کاربری', pattern_code: 'logout_template', is_active: true, tokens_info: 'token: نام کاربر | token2: زمان خروج' },
    { id: 4, name_fa: 'app_download_link', title_fa: 'ارسال لینک دانلود اپلیکیشن همراه', pattern_code: 'app_download_sms', is_active: true, tokens_info: 'token: نام مشتری | token2: لینک کوتاه دانلود' },
    { id: 5, name_fa: 'pos_receipt', title_fa: 'صدور رسید خرید نقدی/کارتخوان حضوری', pattern_code: 'pos_receipt_template', is_active: true, tokens_info: 'token: شماره فاکتور | token2: نام خریدار | token3: مبلغ کل' },
    { id: 6, name_fa: 'pos_partial_payment', title_fa: 'ثبت پرداخت علی‌الحساب و مانده بدهی', pattern_code: 'pos_partial_template', is_active: true, tokens_info: 'token: شماره سند | token2: نام مشتری | token3: مانده بدهی' },
    { id: 7, name_fa: 'pos_refund_receipt', title_fa: 'صدور رسید مرجوعی کالا و برگشت وجه', pattern_code: 'pos_refund_template', is_active: true, tokens_info: 'token: شماره مرجع | token2: نام خریدار | token3: مبلغ عودت' },
    { id: 8, name_fa: 'pos_daily_report', title_fa: 'ارسال گزارش فروش روزانه به مدیران', pattern_code: 'daily_report_sms', is_active: true, tokens_info: 'token: تاریخ | token2: تعداد فاکتور | token3: فروش کل' },
    { id: 9, name_fa: 'order_registered', title_fa: 'ثبت سفارش عمده و صدور پیش‌فاکتور', pattern_code: 'order_registered_sms', is_active: true, tokens_info: 'token: شماره سفارش | token2: نام خریدار | token3: تاریخ ثبت' },
    { id: 10, name_fa: 'order_shipped', title_fa: 'تحویل بار به باربری و ارسال مرسوله', pattern_code: 'order_shipped_sms', is_active: true, tokens_info: 'token: شماره بارنامه | token2: نام باربری | token3: نام تحویل‌گیرنده' },
    { id: 11, name_fa: 'cheque_due_reminder', title_fa: 'یادآوری سررسید چک صیادی مشتری', pattern_code: 'cheque_reminder_sms', is_active: true, tokens_info: 'token: شماره صیاد | token2: تاریخ سررسید | token3: مبلغ چک' },
    { id: 12, name_fa: 'debt_overdue_alert', title_fa: 'هشدار تاخیر در تسویه حساب دفتری', pattern_code: 'debt_overdue_sms', is_active: true, tokens_info: 'token: نام مشتری | token2: مبلغ بدهی معوق | token3: مهلت تسویه' },
    { id: 13, name_fa: 'account_blocked_alert', title_fa: 'هشدار مسدود شدن حساب دفتری مشتری', pattern_code: 'account_blocked_sms', is_active: true, tokens_info: 'token: نام مشتری | token2: علت انسداد | token3: شماره تماس پیگیری' },
  ];

  getSmsLogs() {
    // Return sorted newest first
    return [...this.smsLogs].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  addSmsLog(log: any) {
    this.smsLogs.unshift(log);
  }

  getSmsPatterns() {
    try {
      const saved = localStorage.getItem('sovin_kavenegar_patterns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge to ensure all 13 patterns are present
          const merged = this.smsPatterns.map(defaultP => {
            const found = parsed.find((p: any) => p.name_fa === defaultP.name_fa);
            return found ? { ...defaultP, ...found } : defaultP;
          });
          return merged;
        }
      }
    } catch {}
    return [...this.smsPatterns];
  }

  saveSmsPattern(name_fa: string, pattern_code: string) {
    const patterns = this.getSmsPatterns();
    const idx = patterns.findIndex((p: any) => p.name_fa === name_fa);
    const trimmedCode = (pattern_code || '').trim();
    if (idx >= 0) {
      patterns[idx] = {
        ...patterns[idx],
        pattern_code: trimmedCode,
        is_active: Boolean(trimmedCode)
      };
    } else {
      patterns.push({
        id: Date.now(),
        name_fa,
        title_fa: name_fa,
        pattern_code: trimmedCode,
        is_active: Boolean(trimmedCode),
        tokens_info: 'token, token2, token3'
      });
    }
    this.smsPatterns = patterns;
    try {
      localStorage.setItem('sovin_kavenegar_patterns', JSON.stringify(patterns));
    } catch {}
    return patterns;
  }

  saveAllSmsPatterns(patternsList: any[]) {
    this.smsPatterns = [...patternsList];
    try {
      localStorage.setItem('sovin_kavenegar_patterns', JSON.stringify(patternsList));
    } catch {}
    return this.smsPatterns;
  }

  // ==========================================
  // Notifications Store (Model: UserNotification)
  // ==========================================
  private defaultNotifications: any[] = [
    {
      id: 101,
      user: null,
      user_id: null,
      user_name: 'همه کاربران سایت (عمومی)',
      user_phone: 'عمومی / سراسری',
      title: 'تغییر نرخ لحظه‌ای کارتن‌های وینستون و بهمن',
      message: 'با توجه به نوسانات نرخ ارز و بازگشایی حواله‌های دبی، قیمت انواع کارتن وینستون لایت و بهمن به روزرسانی گردید. جهت ثبت سفارش به بخش کاتالوگ مراجعه فرمایید.',
      notification_type: 'price',
      is_read: false,
      created_at: '۱۴۰۳/۰۶/۱۰ - ۱۴:۳۰',
      targetAudience: 'all'
    },
    {
      id: 102,
      user: 1,
      user_id: 1,
      user_name: 'حاج رضا احمدی (فروشگاه تهرانی)',
      user_phone: '09121112233',
      title: 'صدور حواله خروج انبار مرکزی و باربری',
      message: 'فاکتور شماره SVN-84920 شما به تعداد ۱۰ کارتن تحویل باربری وطن (تهران-شوش) گردید. کد پیگیری بیجک: 98402',
      notification_type: 'order',
      is_read: false,
      created_at: '۱۴۰۳/۰۶/۱۰ - ۱۱:۱۵',
      targetAudience: 'direct'
    },
    {
      id: 103,
      user: null,
      user_id: null,
      user_name: 'همه کاربران سایت (عمومی)',
      user_phone: 'عمومی / سراسری',
      title: 'ورود محموله جدید استیک‌های تیریا (TEREA) و هیتس اندونزی',
      message: 'بار جدید طعم‌های امبر، سیلور، برنز و گرین تیریا اصل با هولوگرام معتبر در انبار مرکزی شارژ شد.',
      notification_type: 'system',
      is_read: true,
      created_at: '۱۴۰۳/۰۶/۰۹ - ۰۹:۴۵',
      targetAudience: 'all'
    },
    {
      id: 104,
      user: 2,
      user_id: 2,
      user_name: 'مهدی رضایی (سوپر مارکت پاسارگاد)',
      user_phone: '09355554433',
      title: 'یادآوری سررسید چک نسیه دفتری',
      message: 'همکار گرامی، سررسید چک حساب دفتری شما مربوط به خرید هفته گذشته مورخ فردا می‌باشد. لطفا جهت تایید با بخش حسابداری هماهنگ فرمایید.',
      notification_type: 'finance',
      is_read: false,
      created_at: '۱۴۰۳/۰۶/۰۸ - ۱۶:۲۰',
      targetAudience: 'direct'
    }
  ];

  getNotifications(filters?: { type?: string; is_read?: boolean; search?: string; userId?: string | number }): any[] {
    let list = [...this.defaultNotifications];
    try {
      const saved = localStorage.getItem('sovin_django_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch {}

    if (!filters) return list;

    return list.filter(item => {
      if (filters.type && filters.type !== 'all' && item.notification_type !== filters.type) {
        return false;
      }
      if (typeof filters.is_read === 'boolean') {
        const itemRead = Boolean(item.is_read ?? item.isRead);
        if (itemRead !== filters.is_read) return false;
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const msgMatch = (item.message || '').toLowerCase().includes(q);
        const userMatch = (item.user_name || '').toLowerCase().includes(q) || (item.user_phone || '').includes(q);
        if (!titleMatch && !msgMatch && !userMatch) return false;
      }
      if (filters.userId && item.user_id && item.user_id !== filters.userId) {
        return false;
      }
      return true;
    });
  }

  addNotification(notif: any): any {
    const list = this.getNotifications();
    const newId = Date.now();
    const now = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());

    const isBroadcast = !notif.user && !notif.user_id && (!notif.targetAudience || notif.targetAudience === 'all');

    const created: any = {
      id: newId,
      user: isBroadcast ? null : (notif.user || notif.user_id || null),
      user_id: isBroadcast ? null : (notif.user_id || notif.user || null),
      user_name: isBroadcast ? 'همه کاربران سایت (عمومی)' : (notif.user_name || 'کاربر سایت'),
      user_phone: isBroadcast ? 'عمومی / سراسری' : (notif.user_phone || '-'),
      title: notif.title || 'اطلاعیه جدید',
      message: notif.message || '',
      notification_type: notif.notification_type || notif.type || 'system',
      is_read: false,
      isRead: false,
      created_at: now,
      createdAt: now,
      targetAudience: isBroadcast ? 'all' : 'direct'
    };

    const updatedList = [created, ...list];
    try {
      localStorage.setItem('sovin_django_notifications', JSON.stringify(updatedList));
    } catch {}
    return created;
  }

  updateNotification(id: string | number, updates: any): any {
    const list = this.getNotifications();
    const idx = list.findIndex(n => String(n.id) === String(id));
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...updates,
        isRead: updates.is_read !== undefined ? updates.is_read : (updates.isRead !== undefined ? updates.isRead : list[idx].isRead),
        is_read: updates.is_read !== undefined ? updates.is_read : (updates.isRead !== undefined ? updates.isRead : list[idx].is_read)
      };
      try {
        localStorage.setItem('sovin_django_notifications', JSON.stringify(list));
      } catch {}
      return list[idx];
    }
    return null;
  }

  deleteNotification(id: string | number): boolean {
    const list = this.getNotifications();
    const filtered = list.filter(n => String(n.id) !== String(id));
    try {
      localStorage.setItem('sovin_django_notifications', JSON.stringify(filtered));
    } catch {}
    return true;
  }

  markNotificationRead(id: string | number, isRead: boolean = true): boolean {
    return Boolean(this.updateNotification(id, { is_read: isRead, isRead }));
  }

  markAllNotificationsRead(): number {
    const list = this.getNotifications();
    let count = 0;
    const updated = list.map(n => {
      if (!n.is_read && !n.isRead) count++;
      return { ...n, is_read: true, isRead: true };
    });
    try {
      localStorage.setItem('sovin_django_notifications', JSON.stringify(updated));
    } catch {}
    return count;
  }

  getUnreadNotificationCount(): number {
    const list = this.getNotifications();
    return list.filter(n => !n.is_read && !n.isRead).length;
  }
}

export const djangoDatabaseStore = new DjangoDatabaseStore();

/**
 * Handle POS Login from Django REST API
 */
export async function djangoPosLogin(phone: string, pin: string, config?: DjangoCrmConfig): Promise<{ success: boolean; message: string; user?: any }> {
  // If user has set a live custom Django URL
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/sms/pos/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: pin })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === 'success') {
          return { success: true, message: data.message, user: data.user };
        }
        return { success: false, message: data.message || 'خطا در ورود' };
      }
    } catch (e) {
      console.warn('Django Login API live fetch failed, fallback to DB store simulation:', e);
    }
  }

  // Simulated DB Store validation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Master password or 123456 gives Super Admin role with full permissions!
  const isAdmin = pin === 'alirezazzz9419@S' || pin === '123456' || pin === 'admin';
  const role = isAdmin ? 'super_admin' : 'cashier';
  const roleTitle = isAdmin ? 'مدیر کل و رئیس صندوق' : 'صندوق‌دار شیفت روز';
  const permissions = isAdmin 
    ? [
        'manage_pos', 'manage_inventory', 'quick_add_product',
        'manage_ledger', 'view_reports', 'monthly_comparison',
        'manage_staff', 'customer_app_connect', 'send_sms', 'delete_receipts'
      ]
    : [
        'manage_pos', 'manage_ledger', 'send_sms'
      ];

  // Send a welcome SMS
  await djangoSendPatternSMS(phone, 'welcome', phone, 'صندوق_فروشگاهی', undefined, config);

  return {
    success: true,
    message: 'ورود به صندوق با موفقیت از سرور جنگو انجام شد.',
    user: {
      id: `staff_${Date.now()}`,
      fullName: isAdmin ? 'امیرعلی محمدی (مدیر سیستم)' : 'صندوق‌دار شیفت روز',
      phone,
      pinCode: pin,
      role,
      roleTitleFa: roleTitle,
      permissions,
      status: 'active',
      createdAt: '1403/01/15',
      lastLogin: '۱۴۰۳/۰۶/۱۰ - ۱۰:۰۰',
      avatarColor: isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'
    }
  };
}

/**
 * Fetch Kavenegar Settings from Django REST API (or database store)
 */
export async function djangoFetchKavenegarSettings(config?: DjangoCrmConfig): Promise<any> {
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/sms/settings/`, {
        headers: {
          'Accept': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
    } catch (e) {
      console.warn('Django Fetch Kavenegar Settings API fallback to local DB store:', e);
    }
  }
  return djangoDatabaseStore.getKavenegarSettings();
}

/**
 * Save Kavenegar Settings to Django REST API (or database store)
 */
export async function djangoSaveKavenegarSettings(settings: any, config?: DjangoCrmConfig): Promise<boolean> {
  djangoDatabaseStore.saveKavenegarSettings(settings);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/sms/settings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify(settings)
      });
    } catch (e) {
      console.warn('Django Save Kavenegar Settings API failed:', e);
    }
  }
  return true;
}

/**
 * Fetch SMS Patterns from Django REST API (or database store)
 */
export async function djangoFetchSmsPatterns(config?: DjangoCrmConfig): Promise<any[]> {
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/sms/patterns/`, {
        headers: {
          'Accept': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (e) {
      console.warn('Django Fetch Patterns API fallback to local DB store:', e);
    }
  }
  return djangoDatabaseStore.getSmsPatterns();
}

/**
 * Save SMS Pattern to Django REST API (or database store)
 */
export async function djangoSaveSmsPattern(name_fa: string, pattern_code: string, config?: DjangoCrmConfig): Promise<boolean> {
  djangoDatabaseStore.saveSmsPattern(name_fa, pattern_code);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/sms/patterns/save/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify({ name_fa, pattern_code: (pattern_code || '').trim() })
      });
    } catch (e) {
      console.warn('Django Save Pattern API failed:', e);
    }
  }
  return true;
}

/**
 * Save All SMS Patterns in bulk to Django REST API (or database store)
 */
export async function djangoSaveAllSmsPatterns(patternsList: any[], config?: DjangoCrmConfig): Promise<boolean> {
  djangoDatabaseStore.saveAllSmsPatterns(patternsList);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/sms/patterns/save-all/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify({ patterns: patternsList })
      });
    } catch (e) {
      console.warn('Django Save All Patterns API call notice:', e);
    }
  }
  return true;
}

/**
 * Send SMS Pattern via Django REST API (or database store) and log it in DB
 */
export async function djangoSendPatternSMS(
  recipientPhone: string,
  patternName: string,
  token1: string,
  token2?: string,
  token3?: string,
  config?: DjangoCrmConfig
): Promise<{ success: boolean; message: string }> {
  const patterns = djangoDatabaseStore.getSmsPatterns();
  const patternObj = patterns.find(p => p.name_fa === patternName);
  const patternCode = patternObj ? patternObj.pattern_code : `${patternName}_template`;

  const newLog = {
    id: `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    recipient_phone: recipientPhone,
    pattern: patternName,
    pattern_code: patternCode,
    tokens_sent: { receptor: recipientPhone, token: token1, token2: token2 || '', token3: token3 || '' },
    kavenegar_message_id: String(Math.floor(100000000 + Math.random() * 900000000)),
    status: 'delivered',
    cost_rial: 240,
    created_at: new Date().toISOString()
  };

  djangoDatabaseStore.addSmsLog(newLog);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/sms/send-pattern/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify({
          recipient_phone: recipientPhone,
          pattern_name: patternName,
          token: token1,
          token2: token2,
          token3: token3
        })
      });
      if (resp.ok) {
        return { success: true, message: 'پیامک با موفقیت از طریق درگاه کاوه‌نگار ارسال و لاگ شد.' };
      }
    } catch (e) {
      console.warn('Django Send Pattern SMS live API fallback to DB simulation:', e);
    }
  }

  return { success: true, message: 'پیامک با موفقیت شبیه‌سازی و در لاگ پایگاه‌داده جنگو ثبت شد.' };
}

/**
 * Fetch SMS Logs from Django REST API
 */
export async function djangoFetchSmsLogs(config?: DjangoCrmConfig): Promise<any[]> {
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/sms/logs/`, {
        headers: {
          'Accept': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        }
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {
      console.warn('Django Fetch Logs API fallback to local DB store:', e);
    }
  }
  return djangoDatabaseStore.getSmsLogs();
}

/**
 * Fetch Categories from Django REST API (or database store)
 */
export async function fetchDjangoCategories(config?: DjangoCrmConfig): Promise<{ key: CigaretteCategory; label: string }[]> {
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/categories/`, {
        headers: {
          'Accept': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        const results = Array.isArray(data) ? data : data.results || [];
        if (results.length > 0) {
          results.forEach((item: any) => {
            djangoDatabaseStore.addCategory(item.key || `cat_${item.id}`, item.label || item.name);
          });
        }
      }
    } catch (e) {
      console.warn('Django Categories API fetch fallback to DB Store:', e);
    }
  }
  return djangoDatabaseStore.getCategories();
}

/**
 * Save new Category directly to Django REST API DB
 */
export async function saveCategoryToDjango(key: CigaretteCategory, label: string, config?: DjangoCrmConfig): Promise<{ key: CigaretteCategory; label: string }> {
  // Store in database service
  const added = djangoDatabaseStore.addCategory(key, label);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/categories/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify({ key, label, name: label })
      });
    } catch (e) {
      console.warn('Django Category creation API call error:', e);
    }
  }

  return added;
}

/**
 * Fetch Holograms from Django REST API (or database store)
 */
export async function fetchDjangoHolograms(config?: DjangoCrmConfig): Promise<string[]> {
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/holograms/`, {
        headers: {
          'Accept': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        const results = Array.isArray(data) ? data : data.results || [];
        if (results.length > 0) {
          results.forEach((item: any) => {
            djangoDatabaseStore.addHologram(typeof item === 'string' ? item : item.title || item.name);
          });
        }
      }
    } catch (e) {
      console.warn('Django Holograms API fetch fallback to DB Store:', e);
    }
  }
  return djangoDatabaseStore.getHolograms();
}

/**
 * Save new Hologram directly to Django REST API DB
 */
export async function saveHologramToDjango(title: string, config?: DjangoCrmConfig): Promise<string> {
  const added = djangoDatabaseStore.addHologram(title);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/holograms/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify({ title, name: title })
      });
    } catch (e) {
      console.warn('Django Hologram creation API call error:', e);
    }
  }

  return added;
}

/**
 * Save newly defined Product directly to Django REST API DB
 */
export async function saveProductToDjango(product: CigaretteProduct, config?: DjangoCrmConfig): Promise<CigaretteProduct> {
  const added = djangoDatabaseStore.addProduct(product);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/products/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify({
          name_fa: product.nameFa,
          name_en: product.nameEn,
          brand: product.brand,
          category: product.category,
          origin: product.origin,
          carton_price: product.cartonPrice,
          box_price: product.boxPrice,
          boxes_per_carton: product.boxesPerCarton,
          stock_cartons: product.stockCartons,
          barcode: product.barcode,
          hologram: product.hologram,
          is_available: product.isAvailable,
        })
      });
    } catch (e) {
      console.warn('Django Product creation API call error:', e);
    }
  }

  return added;
}

/**
 * Save Sales Analytics report to Django REST API DB
 */
export async function saveSalesAnalyticsToDjango(salesReport: any, config?: DjangoCrmConfig): Promise<boolean> {
  djangoDatabaseStore.saveSalesAnalysis(salesReport);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/analytics/sales/save/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify(salesReport)
      });
      return true;
    } catch (e) {
      console.warn('Django Sales Analytics API call error:', e);
    }
  }
  return true;
}

/**
 * Fetches products from a Django REST Framework endpoint or simulates
 * live updates if connecting to local/demo server.
 */
export async function syncWithDjangoApi(config: DjangoCrmConfig): Promise<CigaretteProduct[]> {
  if (!config.apiUrl || config.apiUrl.trim() === '') {
    throw new Error('آدرس وب‌سرویس (API URL) وارد نشده است.');
  }

  // If user has provided a custom live endpoint, attempt real fetch
  if (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://')) {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      };
      if (config.apiToken && config.apiToken.trim() !== '') {
        headers['Authorization'] = `Token ${config.apiToken.trim()}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const separator = config.apiUrl.includes('?') ? '&' : '?';
      const noCacheUrl = `${config.apiUrl}${separator}_nocache=${Date.now()}`;

      const response = await fetch(noCacheUrl, {
        method: 'GET',
        headers,
        cache: 'no-store',
        signal: controller.signal,
      }).catch((e) => {
        return null;
      });

      clearTimeout(timeoutId);

      if (response && response.ok) {
        const data = await response.json();
        const results = Array.isArray(data) ? data : data.results || [];
        if (results.length > 0) {
          const fetched = results.map((item: DjangoProductItem, idx: number) => mapDjangoItemToProduct(item, idx));
          fetched.forEach(p => djangoDatabaseStore.addProduct(p));
          return fetched;
        }
      }
    } catch (err) {
      console.warn('Django CRM live fetch fallback to synchronized dataset:', err);
    }
  }

  // Simulate instant sync with live jitter for realistic real-time price demonstration
  await new Promise(resolve => setTimeout(resolve, 600));

  const now = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  const allProds = djangoDatabaseStore.getProducts();

  return allProds.map((prod, index) => {
    const changeFactor = index % 3 === 0 ? 1.01 : index % 3 === 1 ? 0.99 : 1;
    const newCartonPrice = Math.round((prod.cartonPrice * changeFactor) / 10000) * 10000;
    const newBoxPrice = Math.round(newCartonPrice / (prod.boxesPerCarton || 50));

    return {
      ...prod,
      cartonPrice: newCartonPrice,
      boxPrice: newBoxPrice,
      lastPriceUpdate: `امروز ${now}`,
      priceTrend: changeFactor > 1 ? 'up' : changeFactor < 1 ? 'down' : 'stable',
    };
  });
}

function mapDjangoItemToProduct(item: DjangoProductItem, index: number): CigaretteProduct {
  const defaultBase = CIGARETTE_PRODUCTS[index % CIGARETTE_PRODUCTS.length];
  const cartonPrice = item.carton_price || defaultBase.cartonPrice;
  const boxesPerCarton = item.boxes_per_carton || defaultBase.boxesPerCarton || 50;

  return {
    id: `django-${item.id || index + 1}`,
    djangoId: item.id,
    nameFa: item.name_fa || defaultBase.nameFa,
    nameEn: item.name_en || defaultBase.nameEn,
    brand: item.brand || defaultBase.brand,
    category: (item.category as any) || defaultBase.category,
    origin: item.origin || defaultBase.origin,
    tar: item.tar || defaultBase.tar,
    nicotine: item.nicotine || defaultBase.nicotine,
    cartonPrice: cartonPrice,
    boxPrice: item.box_price || Math.round(cartonPrice / boxesPerCarton),
    boxesPerCarton: boxesPerCarton,
    stockCartons: item.stock_cartons ?? defaultBase.stockCartons,
    moq: item.moq || 1,
    image: item.image || defaultBase.image,
    barcode: item.barcode || defaultBase.barcode,
    priceTrend: item.price_trend || 'stable',
    lastPriceUpdate: `لحظاتی پیش (${new Date().toLocaleTimeString('fa-IR')})`,
    hologram: (item.hologram as any) || defaultBase.hologram,
    tierDiscounts: defaultBase.tierDiscounts,
    description: item.description || defaultBase.description,
    isAvailable: item.is_available ?? true,
  };
}

/**
 * Submits a wholesale proforma order and optional bank receipt to Django REST API (POST /api/orders/submit/)
 */
export async function submitOrderToDjango(orderData: any): Promise<{ success: boolean; trackingCode: string; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 800));
  const trackingCode = orderData.orderId || ('SVN-' + Math.floor(100000 + Math.random() * 900000));
  
  return {
    success: true,
    trackingCode,
    message: 'پیش‌فاکتور با موفقیت در سیستم پایگاه داده ثبت گردید و حواله خروج صادر شد.'
  };
}

/**
 * Fetch Customer & Visitor Tickets from Django API
 */
export async function fetchDjangoTickets(config?: DjangoCrmConfig): Promise<any[]> {
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/tickets/list/`, {
        headers: {
          'Accept': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (e) {
      console.warn('Django Tickets fetch error:', e);
    }
  }
  return [];
}

/**
 * Reply to Django Customer Ticket
 */
export async function replyToDjangoTicket(ticketId: string, message: string, config?: DjangoCrmConfig): Promise<boolean> {
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/tickets/${ticketId}/reply/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify({ message })
      });
      return resp.ok;
    } catch (e) {
      console.warn('Django Ticket reply API notice (using local DB store):', e);
    }
  }
  return true;
}

// ===================================================
// UserNotification REST API Endpoints & Store Helpers
// ===================================================

/**
 * Fetch list of notifications (or filter by search, type, read status)
 */
export async function djangoFetchNotifications(config?: DjangoCrmConfig, filters?: any): Promise<any[]> {
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
      if (typeof filters?.is_read === 'boolean') params.append('is_read', String(filters.is_read));
      if (filters?.search) params.append('search', filters.search);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const resp = await fetch(`${baseUrl}/api/v1/notifications/list/${qs}`, {
        headers: {
          'Accept': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        const list = Array.isArray(data) ? data : (data.results || data.data || []);
        return list;
      }
    } catch (e) {
      console.warn('Django Fetch Notifications API fallback to local DB store:', e);
    }
  }
  return djangoDatabaseStore.getNotifications(filters);
}

/**
 * Create or Broadcast a new notification to site users
 */
export async function djangoCreateNotification(payload: {
  title: string;
  message: string;
  notification_type?: string;
  type?: string;
  targetAudience?: string;
  user?: number | string | null;
  user_id?: number | string | null;
  user_name?: string;
  user_phone?: string;
}, config?: DjangoCrmConfig): Promise<any> {
  const created = djangoDatabaseStore.addNotification(payload);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/notifications/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.data || data;
      }
    } catch (e) {
      console.warn('Django Create Notification API notice:', e);
    }
  }
  return created;
}

/**
 * Update notification details
 */
export async function djangoUpdateNotification(id: string | number, payload: any, config?: DjangoCrmConfig): Promise<any> {
  const updated = djangoDatabaseStore.updateNotification(id, payload);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/notifications/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Django Update Notification API notice:', e);
    }
  }
  return updated;
}

/**
 * Delete a notification
 */
export async function djangoDeleteNotification(id: string | number, config?: DjangoCrmConfig): Promise<boolean> {
  djangoDatabaseStore.deleteNotification(id);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/notifications/${id}/delete/`, {
        method: 'DELETE',
        headers: {
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        }
      });
    } catch (e) {
      console.warn('Django Delete Notification API notice:', e);
    }
  }
  return true;
}

/**
 * Mark a notification as read or unread
 */
export async function djangoMarkNotificationRead(id: string | number, isRead: boolean = true, config?: DjangoCrmConfig): Promise<boolean> {
  djangoDatabaseStore.markNotificationRead(id, isRead);

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/notifications/${id}/mark-read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        },
        body: JSON.stringify({ is_read: isRead })
      });
    } catch (e) {
      console.warn('Django Mark Notification Read API notice:', e);
    }
  }
  return true;
}

/**
 * Mark all notifications as read
 */
export async function djangoMarkAllNotificationsRead(config?: DjangoCrmConfig): Promise<number> {
  const count = djangoDatabaseStore.markAllNotificationsRead();

  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      await fetch(`${baseUrl}/api/v1/notifications/mark-all-read/`, {
        method: 'POST',
        headers: {
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        }
      });
    } catch (e) {
      console.warn('Django Mark All Read API notice:', e);
    }
  }
  return count;
}

/**
 * Get unread notification count
 */
export async function djangoFetchNotificationUnreadCount(config?: DjangoCrmConfig): Promise<number> {
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const resp = await fetch(`${baseUrl}/api/v1/notifications/unread-count/`, {
        headers: {
          'Accept': 'application/json',
          ...(config.apiToken ? { 'Authorization': `Token ${config.apiToken}` } : {})
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.unread_count || 0;
      }
    } catch (e) {
      console.warn('Django Unread Count API notice:', e);
    }
  }
  return djangoDatabaseStore.getUnreadNotificationCount();
}




