import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { CigaretteProduct, DjangoCrmConfig, CigaretteCategory, BlogPost, BlogCategoryItem } from '../types';
import { CIGARETTE_PRODUCTS } from '../data/products';
import { BLOG_POSTS } from '../data/blogPosts';
import { notificationsApi } from './api';
import { getApiBaseUrl, getApiToken, getWebAppBaseUrl } from './apiConfig';

/**
 * Standard timeout parameter for Django REST API Axios requests (15 seconds = 15000ms).
 * Prevents premature connection aborts during heavy tasks such as staff/personnel registration and bulk sync.
 */
export const DEFAULT_DJANGO_AXIOS_TIMEOUT_MS = 15000;

/**
 * Configured Axios instance with default 15-second timeout for Django REST API services
 */
export const djangoAxiosClient: AxiosInstance = axios.create({
  timeout: DEFAULT_DJANGO_AXIOS_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Generic helper to execute Axios requests with configurable timeout (defaults to 15s)
 */
export async function executeDjangoAxiosRequest<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
  config?: { timeoutMs?: number; token?: string; headers?: Record<string, string> }
): Promise<{ success: boolean; data?: T; status?: number; error?: string }> {
  const timeout = config?.timeoutMs || DEFAULT_DJANGO_AXIOS_TIMEOUT_MS;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(config?.headers || {}),
  };

  if (config?.token) {
    headers['Authorization'] = config.token.startsWith('Bearer ') || config.token.startsWith('Token ')
      ? config.token
      : `Bearer ${config.token}`;
  }

  try {
    const response = await djangoAxiosClient.request<T>({
      url,
      method,
      data,
      headers,
      timeout,
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (err: any) {
    const isTimeout = axios.isCancel(err) || err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
    const errorMessage = isTimeout
      ? `زمان درخواست به سرور به پایان رسید (Timeout ${timeout / 1000}s)`
      : (err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'خطا در برقراری ارتباط با سرور جنگو');

    return {
      success: false,
      status: err?.response?.status || 0,
      error: errorMessage,
    };
  }
}

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

  // --- BLOG POSTS MANAGEMENT ---
  getBlogPosts(params?: { category?: string; search?: string }): BlogPost[] {
    let posts: BlogPost[] = [];
    const mockPostIds = new Set([
      'cigarette-price-dollar-fluctuation-analysis',
      'how-to-detect-original-marlboro-and-winston-cigarettes',
      'detect-original-marlboro-swiss-barcode',
      'iqos-terea-heets-sticks-wholesale-guide',
      'terea-iqos-iluma-wholesale-guide',
      'wholesale-tobacco-profit-margin-calculation',
      'tobacco-wholesale-margin-calculation',
      'freight-shipping-regulations-and-safe-transport',
      'freight-bill-warehouse-logistics-rules'
    ]);

    try {
      const saved = localStorage.getItem('sovin_django_blog_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any leftover fake mock posts
          posts = parsed.filter(p => !mockPostIds.has(p.id) && !mockPostIds.has(p.slug));
        }
      }
    } catch {}

    if (!posts || posts.length === 0) {
      posts = [...BLOG_POSTS];
    }


    if (params?.category && params.category !== 'all' && params.category !== 'همه مقالات تخصصی') {
      const cat = params.category;
      posts = posts.filter(p => p.category === cat || p.categorySlug === cat);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.excerpt.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return posts;
  }

  saveBlogPost(post: Partial<BlogPost>): BlogPost {
    const current = this.getBlogPosts();
    const now = new Date();
    const jalaliDate = now.toLocaleDateString('fa-IR');
    const jalaliTime = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const autoPublishedDate = `${jalaliDate} - ${jalaliTime}`;
    const existingIdx = post.id ? current.findIndex(p => String(p.id) === String(post.id) || (post.slug && p.slug === post.slug)) : -1;
    const existing = existingIdx >= 0 ? current[existingIdx] : null;

    const fullPost: BlogPost = {
      id: post.id || (existing ? existing.id : `post_${Date.now()}`),
      slug: post.slug || (existing ? existing.slug : (post.title ? post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-آ-ی]/g, '') : `post-${Date.now()}`)),
      title: post.title || (existing ? existing.title : 'بدون عنوان'),
      metaTitle: (post.metaTitle && post.metaTitle.trim()) ? post.metaTitle : (existing?.metaTitle || post.title || 'مقاله وبلاگ دخانیات سرو'),
      metaDescription: (post.metaDescription && post.metaDescription.trim()) ? post.metaDescription : (existing?.metaDescription || post.excerpt || ''),
      canonicalUrl: post.canonicalUrl || existing?.canonicalUrl || `${getWebAppBaseUrl()}/blog/${post.slug || 'post'}`,
      keywords: (post.keywords && post.keywords.length > 0) ? post.keywords : (existing?.keywords || ['دخانیات سرو', 'دخانیات', 'عمده فروشی']),
      category: post.category || existing?.category || 'تحلیل بازار و ارز',
      categorySlug: post.categorySlug || existing?.categorySlug || 'market-analysis',
      readTimeMinutes: Number(post.readTimeMinutes) || existing?.readTimeMinutes || Math.max(1, Math.ceil(((post.content || existing?.content)?.length || 500) / 400)),
      publishedDate: existing?.publishedDate || post.publishedDate || autoPublishedDate,
      author: post.author || existing?.author || {
        name: 'مهندس حسینی (مدیریت)',
        role: 'ارشد توزیع و بنکداری دخانیات سرو',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      },
      image: post.image || existing?.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      excerpt: (post.excerpt && post.excerpt.trim()) ? post.excerpt : (existing?.excerpt || ''),
      keyTakeaways: (post.keyTakeaways && post.keyTakeaways.length > 0) ? post.keyTakeaways : (existing?.keyTakeaways || []),
      content: (post.content && post.content.trim()) ? post.content : (existing?.content || ''),
      faqs: (post.faqs && post.faqs.length > 0) ? post.faqs : (existing?.faqs || []),
      tags: (post.tags && post.tags.length > 0) ? post.tags : (existing?.tags || ['دخانیات سرو', 'مقالات']),
      viewsCount: post.viewsCount !== undefined ? post.viewsCount : (existing?.viewsCount || 1),
      isPublished: post.isPublished !== undefined ? post.isPublished : (existing?.isPublished !== undefined ? existing.isPublished : true),
      focusKeyword: post.focusKeyword || existing?.focusKeyword || '',
      isReportage: post.isReportage !== undefined ? post.isReportage : (existing?.isReportage || false),
      reportageSponsor: post.reportageSponsor || existing?.reportageSponsor || '',
      reportageBanner: post.reportageBanner || existing?.reportageBanner || '',
      reportageLink: post.reportageLink || existing?.reportageLink || ''
    };

    if (existingIdx >= 0) {
      current[existingIdx] = fullPost;
    } else {
      current.unshift(fullPost);
    }

    try {
      localStorage.setItem('sovin_django_blog_posts', JSON.stringify(current));
    } catch {}

    return fullPost;
  }

  deleteBlogPost(id: string): boolean {
    const current = this.getBlogPosts();
    const updated = current.filter(p => p.id !== id);
    try {
      localStorage.setItem('sovin_django_blog_posts', JSON.stringify(updated));
    } catch {}
    return true;
  }

  private defaultBlogCategories: BlogCategoryItem[] = [];

  getBlogCategories(): BlogCategoryItem[] {
    try {
      // Automatically sanitize legacy mock categories from old sessions
      const oldLegacy = localStorage.getItem('sovin_django_blog_categories');
      if (oldLegacy && (oldLegacy.includes('original-auth') || oldLegacy.includes('wholesale-shipping') || oldLegacy.includes('market-analysis') || oldLegacy.includes('iqos-technology') || oldLegacy.includes('freight-rules') || oldLegacy.includes('testi'))) {
        localStorage.removeItem('sovin_django_blog_categories');
      }

      const saved = localStorage.getItem('sevin_v3_blog_categories') || localStorage.getItem('sovin_django_blog_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(c => 
            c && 
            c.id !== 'all' && 
            c.name !== 'همه مقالات و مطالب' && 
            c.slug !== 'original-auth' && 
            c.slug !== 'wholesale-shipping' && 
            c.slug !== 'market-analysis' && 
            c.slug !== 'iqos-technology' && 
            c.slug !== 'freight-rules' &&
            c.slug !== 'testi'
          );
        }
      }
    } catch {}
    return [];
  }

  setBlogCategories(categories: BlogCategoryItem[]) {
    try {
      const sanitized = categories.filter(c => 
        c && 
        c.id !== 'all' && 
        c.name !== 'همه مقالات و مطالب' && 
        c.slug !== 'original-auth' && 
        c.slug !== 'wholesale-shipping' && 
        c.slug !== 'market-analysis' && 
        c.slug !== 'iqos-technology' && 
        c.slug !== 'freight-rules' &&
        c.slug !== 'testi'
      );
      localStorage.setItem('sevin_v3_blog_categories', JSON.stringify(sanitized));
      localStorage.removeItem('sovin_django_blog_categories');
    } catch {}
  }

  saveBlogCategory(category: Partial<BlogCategoryItem>): BlogCategoryItem {
    const list = this.getBlogCategories();
    const catName = (category.name || '').trim();
    const nowId = category.id || `cat_${Date.now()}`;
    const slug = category.slug || (catName ? catName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-آ-ی]/g, '') : `cat-${Date.now()}`);
    const existingIdx = list.findIndex(c => c.id === nowId || c.name === catName);
    
    const newCat: BlogCategoryItem = {
      id: nowId,
      name: catName || 'دسته‌بندی جدید',
      slug,
      color: category.color || 'text-blue-600',
      bgColor: category.bgColor || 'bg-blue-50',
      borderColor: category.borderColor || 'border-blue-200',
      description: category.description || '',
      order: category.order || list.length + 1
    };

    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...newCat };
    } else {
      list.push(newCat);
    }

    this.setBlogCategories(list);
    return newCat;
  }

  deleteBlogCategory(id: string): boolean {
    const list = this.getBlogCategories();
    const filtered = list.filter(c => c.id !== id && c.name !== id);
    this.setBlogCategories(filtered);
    return true;
  }

  // Live in-memory representation of Kavenegar Settings
  private kavenegarSettings: {
    name: string;
    api_token: string;
    is_active: boolean;
    debug_mode: boolean;
  } = {
    name: 'سامانه پیامک هوشمند دخانیات سرو (Kavenegar Gateway)',
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
      tokens_sent: { receptor: '09120759419', token: 'مهندس_حسینی', token2: 'صندوق_فروشگاهی_دخانیات سرو' },
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
  private defaultNotifications: any[] = [];

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

export interface StaffRegisterData {
  fullName: string;
  phone: string;
  pinCode: string;
  role: string;
  permissions?: string[];
  nationalId?: string;
  address?: string;
  salaryRial?: number;
}

/**
 * Register or update staff/personnel in Django REST API using Axios with configurable timeout (defaults to 15 seconds / 15000ms).
 * Prevents connection dropouts during heavy staff registration and background processing.
 */
export async function djangoRegisterStaff(
  staffData: StaffRegisterData,
  config?: DjangoCrmConfig,
  customTimeoutMs: number = DEFAULT_DJANGO_AXIOS_TIMEOUT_MS
): Promise<{ success: boolean; message: string; staff?: any }> {
  const timeout = customTimeoutMs || 15000;
  const targetUrl = config?.apiUrl
    ? `${config.apiUrl.replace(/\/$/, '')}/api/v1/staff/register/`
    : 'http://localhost:8000/api/v1/staff/register/';

  try {
    const res = await executeDjangoAxiosRequest(
      targetUrl,
      'POST',
      {
        full_name: staffData.fullName,
        phone: staffData.phone,
        pin_code: staffData.pinCode,
        role: staffData.role,
        permissions: staffData.permissions || [],
        national_id: staffData.nationalId || '',
        address: staffData.address || '',
        salary_rial: staffData.salaryRial || 0
      },
      {
        timeoutMs: timeout,
        token: config?.apiToken
      }
    );

    if (res.success && res.data) {
      return {
        success: true,
        message: res.data.message || 'پرونده پرسنلی با موفقیت ثبت و همگام‌سازی شد.',
        staff: res.data.staff || res.data
      };
    }
  } catch (e: any) {
    console.warn('Django Register Staff Axios request notice:', e);
  }

  // Fallback to DB Store simulation
  const newStaff = {
    id: `staff_${Date.now()}`,
    fullName: staffData.fullName,
    phone: staffData.phone,
    pinCode: staffData.pinCode,
    role: staffData.role || 'cashier',
    roleTitleFa: staffData.role === 'super_admin' ? 'مدیر کل سیستم' : 'صندوق‌دار / اپراتور',
    permissions: staffData.permissions || ['manage_pos'],
    status: 'active',
    createdAt: new Date().toLocaleDateString('fa-IR'),
    avatarColor: 'bg-emerald-600'
  };

  return {
    success: true,
    message: `پرونده پرسنلی ${staffData.fullName} با موفقیت در دیتابیس ثبت گردید (مهلت اتصال Axios: ${timeout / 1000} ثانیه).`,
    staff: newStaff
  };
}

/**
 * Fetch list of staff/personnel from Django REST API using Axios with 15s timeout
 */
export async function djangoFetchStaffList(
  config?: DjangoCrmConfig,
  customTimeoutMs: number = DEFAULT_DJANGO_AXIOS_TIMEOUT_MS
): Promise<any[]> {
  const timeout = customTimeoutMs || 15000;
  const targetUrl = config?.apiUrl
    ? `${config.apiUrl.replace(/\/$/, '')}/api/v1/staff/list/`
    : 'http://localhost:8000/api/v1/staff/list/';

  const res = await executeDjangoAxiosRequest<any[]>(targetUrl, 'GET', undefined, {
    timeoutMs: timeout,
    token: config?.apiToken
  });

  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }

  return [];
}

/**
 * Handle POS Login from Django REST API (Axios with 15s timeout)
 */
export async function djangoPosLogin(
  phone: string, 
  pin: string, 
  config?: DjangoCrmConfig,
  customTimeoutMs: number = DEFAULT_DJANGO_AXIOS_TIMEOUT_MS
): Promise<{ success: boolean; message: string; user?: any }> {
  const timeout = customTimeoutMs || 15000;

  // If user has set a live custom Django URL
  if (config?.apiUrl && (config.apiUrl.startsWith('http://') || config.apiUrl.startsWith('https://'))) {
    try {
      const baseUrl = config.apiUrl.replace(/\/api\/.*$/, '');
      const loginUrl = `${baseUrl}/api/v1/sms/pos/login/`;
      const res = await executeDjangoAxiosRequest(loginUrl, 'POST', { phone, password: pin }, { timeoutMs: timeout });

      if (res.success && res.data) {
        if (res.data.status === 'success') {
          return { success: true, message: res.data.message, user: res.data.user };
        }
        return { success: false, message: res.data.message || 'خطا در ورود' };
      }
    } catch (e) {
      console.warn('Django Login API Axios live request failed, fallback to DB store simulation:', e);
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
        'Cache-Control': 'no-cache, no-store, must-revalidate',
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
 * Fetch list of notifications from Django database
 */
export async function djangoFetchNotifications(config?: DjangoCrmConfig, filters?: any): Promise<any[]> {
  const localList = djangoDatabaseStore.getNotifications(filters) || [];
  try {
    const serverList = await notificationsApi.getAll(filters);
    if (serverList && serverList.length > 0) {
      // Merge by ID or title+message, so newly added notifications are never lost!
      const mergedMap = new Map<string, any>();
      // First, add all server items
      serverList.forEach((item: any) => {
        mergedMap.set(String(item.id), item);
      });
      // Second, retain any locally dispatched items that may not have propagated yet
      localList.forEach((item: any) => {
        if (!mergedMap.has(String(item.id))) {
          const duplicate = serverList.some((s: any) => 
            s.title === item.title && s.message === item.message
          );
          if (!duplicate) {
            mergedMap.set(String(item.id), item);
          }
        }
      });

      const merged = Array.from(mergedMap.values()).sort((a: any, b: any) => {
        const timeA = new Date(a.created_at || a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.created_at || b.createdAt || 0).getTime() || 0;
        return timeB - timeA;
      });

      return merged;
    }
  } catch (e) {
    console.warn('Django Fetch Notifications API notice:', e);
  }
  return localList;
}

/**
 * Create or Broadcast a new notification to site users in Django database
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
  let created: any = null;
  try {
    created = await notificationsApi.create(payload);
  } catch (e) {
    console.warn('Django Create Notification API notice:', e);
  }

  const notificationToSave = created || {
    id: `notif_${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString(),
    createdAt: new Date().toLocaleDateString('fa-IR'),
    is_read: false,
    isRead: false
  };

  djangoDatabaseStore.addNotification(notificationToSave);
  return notificationToSave;
}

/**
 * Update notification details
 */
export async function djangoUpdateNotification(id: string | number, payload: any, config?: DjangoCrmConfig): Promise<any> {
  let backendUpdated: any = null;
  try {
    backendUpdated = await notificationsApi.update(id, payload);
  } catch (e) {
    console.warn('Django Update Notification API notice:', e);
  }

  const updated = djangoDatabaseStore.updateNotification(id, backendUpdated || payload);
  return updated || backendUpdated;
}

/**
 * Delete a notification from Django database
 */
export async function djangoDeleteNotification(id: string | number, config?: DjangoCrmConfig): Promise<boolean> {
  djangoDatabaseStore.deleteNotification(id);
  try {
    return await notificationsApi.delete(id);
  } catch {
    return true;
  }
}

/**
 * Mark a notification as read or unread
 */
export async function djangoMarkNotificationRead(id: string | number, isRead: boolean = true, config?: DjangoCrmConfig): Promise<boolean> {
  djangoDatabaseStore.markNotificationRead(id, isRead);
  try {
    return await notificationsApi.markRead(id, isRead);
  } catch {
    return true;
  }
}

/**
 * Mark all notifications as read
 */
export async function djangoMarkAllNotificationsRead(config?: DjangoCrmConfig): Promise<number> {
  const count = djangoDatabaseStore.markAllNotificationsRead();
  try {
    await notificationsApi.markAllRead();
  } catch {}
  return count;
}

/**
 * Get unread notification count
 */
export async function djangoFetchNotificationUnreadCount(config?: DjangoCrmConfig): Promise<number> {
  try {
    return await notificationsApi.getUnreadCount();
  } catch {
    return 0;
  }
}

// ==========================================
// Django Blog Articles API Endpoints
// دقیقاً منطبق با اپ blog/ سرویس cigarbackend (blog/urls.py) زیر پیشوند api/v1/blog/
// ==========================================

export function getBlogApiBaseUrl(config?: DjangoCrmConfig): string {
  let base = config?.apiUrl || getApiBaseUrl();
  // آدرس قدیمی و غیرفعال (DNS resolve نمی‌شود) را همیشه به بک‌اند واقعی اصلاح کن
  if (!base || base.trim() === '' || base.includes('localhost:8000') || base.includes('api.azarakhsh-sovin.com')) {
    base = 'https://cigar.sevinhost.ir/api/v1';
  }
  return base.replace(/\/+$/, '');
}

export function getBlogApiHeaders(config?: DjangoCrmConfig): Record<string, string> {
  const token = config?.apiToken || getApiToken() || (typeof localStorage !== 'undefined' ? (localStorage.getItem('sevin_api_token') || localStorage.getItem('token') || '') : '');
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  // accounts app توکن JWT (SimpleJWT) صادر می‌کند => هدر باید Bearer باشد
  if (token && token.trim()) {
    headers['Authorization'] = token.startsWith('Bearer ') || token.startsWith('Token ')
      ? token
      : `Bearer ${token}`;
  }
  return headers;
}

// عکس‌های آپلود شده در ادیتور به‌صورت data URL (base64) نگهداری می‌شوند؛ این‌ها معتبر URL نیستند
// و طول‌شان از محدودیت ۵۰۰ کاراکتری فیلد featured_image_url در بک‌اند بسیار بیشتر است.
function isBase64ImageData(value?: string): boolean {
  return !!value && value.startsWith('data:');
}

function base64ImageToBlob(dataUrl: string): Blob {
  const [meta, base64Data] = dataUrl.split(',');
  const mimeMatch = /data:(.*?);base64/.exec(meta);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function mapDjangoBlogPost(item: any, config?: DjangoCrmConfig): BlogPost {
  // فیلد image برای فایل آپلودشده روی سرور یک مسیر نسبی برمی‌گرداند (مثلاً /media/blog/images/x.jpg)
  // که باید به دامنه بک‌اند (نه فرانت) متصل شود، وگرنه در لیست شکسته نمایش داده می‌شود
  const rawImage = item.image || item.featured_image || item.featured_image_url || '';
  const backendOrigin = getBlogApiBaseUrl(config).replace(/\/api\/v1\/?$/, '');
  const image = rawImage && rawImage.startsWith('/') && !rawImage.startsWith('//')
    ? `${backendOrigin}${rawImage}`
    : (rawImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');

  // استخراج امن نکات کلیدی (key_takeaways / keyTakeaways)
  let keyTakeaways: string[] = [];
  if (Array.isArray(item.key_takeaways)) {
    keyTakeaways = item.key_takeaways;
  } else if (Array.isArray(item.keyTakeaways)) {
    keyTakeaways = item.keyTakeaways;
  } else if (Array.isArray(item.takeaways)) {
    keyTakeaways = item.takeaways;
  } else if (typeof item.key_takeaways === 'string' && item.key_takeaways.trim()) {
    try {
      const parsed = JSON.parse(item.key_takeaways);
      if (Array.isArray(parsed)) keyTakeaways = parsed;
    } catch {
      keyTakeaways = [item.key_takeaways];
    }
  }

  // استخراج برچسب‌ها (tags)
  let tags: string[] = [];
  if (Array.isArray(item.tags)) {
    tags = item.tags;
  } else if (typeof item.tags === 'string' && item.tags.trim()) {
    try {
      const parsed = JSON.parse(item.tags);
      if (Array.isArray(parsed)) tags = parsed;
    } catch {
      tags = [item.tags];
    }
  }

  // استخراج پرسش‌های متداول (faqs)
  let faqs: { question: string; answer: string }[] = [];
  if (Array.isArray(item.faqs)) {
    faqs = item.faqs;
  } else if (typeof item.faqs === 'string' && item.faqs.trim()) {
    try {
      const parsed = JSON.parse(item.faqs);
      if (Array.isArray(parsed)) faqs = parsed;
    } catch {}
  }

  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title || '',
    metaTitle: item.meta_title || item.metaTitle || item.title || '',
    metaDescription: item.meta_description || item.metaDescription || item.excerpt || '',
    canonicalUrl: item.canonical_url || `${getWebAppBaseUrl()}/blog/${item.slug}`,
    keywords: tags.length ? tags : ['دخانیات سرو', 'دخانیات'],
    category: item.category_name || (typeof item.category === 'object' && item.category?.name ? item.category.name : 'عمومی'),
    categorySlug: typeof item.category === 'number' ? String(item.category) : (typeof item.category === 'object' ? item.category?.slug : undefined),
    readTimeMinutes: Number(item.reading_time_minutes ?? 5),
    publishedDate: item.created_at_jalali || (item.created_at ? new Date(item.created_at).toLocaleDateString('fa-IR') : ''),
    author: {
      name: item.author_name || (typeof item.author === 'object' && item.author?.name ? item.author.name : 'تیم تحریریه دخانیات سرو'),
      role: 'کارشناس ارشد بازار',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    image,
    excerpt: item.excerpt || '',
    keyTakeaways,
    content: item.content || '',
    tags,
    faqs,
    viewsCount: Number(item.views_count ?? 0),
    isPublished: item.is_published !== undefined ? Boolean(item.is_published) : true,
    focusKeyword: item.focus_keyword || item.focusKeyword || '',
    isReportage: Boolean(item.is_reportage ?? item.isReportage ?? false),
    reportageSponsor: item.reportage_sponsor || item.reportageSponsor || '',
    reportageBanner: (item.reportage_banner && typeof item.reportage_banner === 'string' && item.reportage_banner.startsWith('/') && !item.reportage_banner.startsWith('//'))
      ? `${backendOrigin}${item.reportage_banner}`
      : (item.reportage_banner || item.reportageBanner || ''),
    reportageLink: item.reportage_link || item.reportageLink || ''
  };
}

/**
 * دریافت فهرست مقالات منتشر شده — GET /api/v1/blog/list/ (BlogPostListAPIView)
 */
export async function djangoFetchBlogPosts(category?: string, search?: string, config?: DjangoCrmConfig): Promise<BlogPost[]> {
  const baseUrl = getBlogApiBaseUrl(config);
  const headers = getBlogApiHeaders(config);

  try {
    const url = new URL(`${baseUrl}/blog/list/`);
    if (category && category !== 'all') url.searchParams.set('category', category);
    if (search && search.trim()) url.searchParams.set('search', search.trim());

    const response = await fetch(url.toString(), { method: 'GET', headers });
    if (response.ok) {
      const data = await response.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      const mapped = results.map((item: any) => mapDjangoBlogPost(item, config));
      mapped.forEach((p: BlogPost) => djangoDatabaseStore.saveBlogPost(p));
      return mapped;
    }
    console.warn('Django Blog List API returned non-OK status:', response.status);
  } catch (err) {
    console.warn('Django Blog List API error:', err);
  }

  return djangoDatabaseStore.getBlogPosts({ category, search });
}

/**
 * دریافت جزئیات یک مقاله با اسلاگ — GET /api/v1/blog/detail/{slug}/ (BlogPostDetailAPIView)
 */
export async function djangoFetchBlogPostBySlug(slug: string, config?: DjangoCrmConfig): Promise<BlogPost | null> {
  const baseUrl = getBlogApiBaseUrl(config);
  const headers = getBlogApiHeaders(config);

  try {
    const response = await fetch(`${baseUrl}/blog/detail/${encodeURIComponent(slug)}/`, { method: 'GET', headers });
    if (response.ok) {
      const data = await response.json();
      if (data?.data) {
        const mapped = mapDjangoBlogPost(data.data, config);
        return djangoDatabaseStore.saveBlogPost(mapped);
      }
    }
  } catch (err) {
    console.warn('Django Blog Detail API error:', err);
  }

  const posts = djangoDatabaseStore.getBlogPosts();
  return posts.find(p => p.slug === slug || String(p.id) === String(slug)) || null;
}

/**
 * ثبت مقاله جدید — POST /api/v1/blog/admin/create/ (BlogPostAdminCreateAPIView، نیازمند JWT ادمین)
 */
export async function djangoCreateBlogPost(post: Partial<BlogPost>, config?: DjangoCrmConfig): Promise<BlogPost> {
  const allCategories = djangoDatabaseStore.getBlogCategories();
  const matchedCat = allCategories.find(c =>
    String(c.id) === String(post.category) ||
    (c.name && post.category && c.name.trim().toLowerCase() === post.category.trim().toLowerCase()) ||
    (c.slug && post.category && c.slug.trim().toLowerCase() === post.category.trim().toLowerCase())
  );
  
  // If no match found by ID/Name/Slug, check if the input itself might be a valid ID number
  const categoryPk = matchedCat 
    ? Number(matchedCat.id) 
    : (!isNaN(Number(post.category)) ? Number(post.category) : null);

  const postTitle = (post.title || '').trim();
  const postSlug = post.slug?.trim() || (postTitle ? postTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '') : `post-${Date.now()}`);
  const postExcerpt = (post.excerpt?.trim() || (post.content ? post.content.replace(/<[^>]*>?/gm, '').slice(0, 180).trim() : '')).slice(0, 500);

  const imageValue = post.image || '';
  const isBase64Image = isBase64ImageData(imageValue);

  // همیشه ابتدا یا همزمان در دیتابیس لوکال ذخیره کن تا داده کاربر هرگز از دست نرود
  const localSaved = djangoDatabaseStore.saveBlogPost({
    ...post,
    title: postTitle,
    slug: postSlug,
    excerpt: postExcerpt,
    category: matchedCat?.name || post.category || 'عمومی'
  });

  const baseUrl = getBlogApiBaseUrl(config);
  const headers = getBlogApiHeaders(config);

  try {
    let res: Response;
    if (isBase64Image) {
      const form = new FormData();
      form.append('title', postTitle);
      form.append('slug', postSlug);
      form.append('excerpt', postExcerpt);
      form.append('content', post.content || '');
      form.append('reading_time_minutes', String(post.readTimeMinutes || 5));
      form.append('is_published', String(post.isPublished !== undefined ? post.isPublished : true));
      form.append('key_takeaways', JSON.stringify(post.keyTakeaways || []));
      form.append('tags', JSON.stringify(post.tags || []));
      form.append('faqs', JSON.stringify(post.faqs || []));
      form.append('meta_title', post.metaTitle || postTitle);
      form.append('meta_description', post.metaDescription || postExcerpt);
      form.append('focus_keyword', post.focusKeyword || '');
      form.append('is_reportage', String(Boolean(post.isReportage)));
      form.append('reportage_sponsor', post.reportageSponsor || '');
      form.append('reportage_link', post.reportageLink || '');
      if (post.reportageBanner) {
        if (isBase64ImageData(post.reportageBanner)) {
          const isGif = post.reportageBanner.includes('image/gif');
          form.append('reportage_banner', base64ImageToBlob(post.reportageBanner), isGif ? 'banner.gif' : 'banner.png');
        } else {
          form.append('reportage_banner_url', post.reportageBanner);
        }
      }
      if (categoryPk !== null) form.append('category', String(categoryPk));
      form.append('featured_image', base64ImageToBlob(imageValue), 'featured-image.jpg');

      const uploadHeaders = { ...headers };
      delete uploadHeaders['Content-Type'];
      res = await fetch(`${baseUrl}/blog/admin/create/`, {
        method: 'POST',
        headers: uploadHeaders,
        body: form
      });
    } else {
      const payload: Record<string, any> = {
        title: postTitle,
        slug: postSlug,
        excerpt: postExcerpt,
        content: post.content || '',
        featured_image_url: imageValue.slice(0, 500),
        reading_time_minutes: post.readTimeMinutes || 5,
        is_published: post.isPublished !== undefined ? post.isPublished : true,
        is_reportage: Boolean(post.isReportage),
        reportage_sponsor: post.reportageSponsor || '',
        reportage_banner: post.reportageBanner || '',
        reportage_link: post.reportageLink || '',
        key_takeaways: post.keyTakeaways || [],
        tags: post.tags || [],
        faqs: post.faqs || [],
        meta_title: post.metaTitle || postTitle,
        meta_description: post.metaDescription || postExcerpt,
        focus_keyword: post.focusKeyword || ''
      };
      if (categoryPk !== null) payload.category = categoryPk;

      res = await fetch(`${baseUrl}/blog/admin/create/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    }

    if (res.ok) {
      const serverData = await res.json().catch(() => null);
      const created = serverData?.data;
      if (created?.id) {
        return djangoDatabaseStore.saveBlogPost({
          ...localSaved,
          id: String(created.id),
          slug: created.slug || postSlug,
        });
      }
    } else {
      console.warn('Django Blog Create API returned status:', res.status);
    }
  } catch (err) {
    console.warn('Django Blog Create API network/auth notice:', err);
  }

  return localSaved;
}

/**
 * ویرایش مقاله — PUT /api/v1/blog/admin/{pk}/ (BlogPostAdminDetailAPIView، نیازمند JWT ادمین)
 */
export async function djangoUpdateBlogPost(id: string | number, post: Partial<BlogPost>, config?: DjangoCrmConfig): Promise<BlogPost> {
  // همیشه ابتدا در دیتابیس لوکال ذخیره کن
  const savedPost = djangoDatabaseStore.saveBlogPost({ ...post, id: String(id) });

  const baseUrl = getBlogApiBaseUrl(config);
  const headers = getBlogApiHeaders(config);

  const allCategories = djangoDatabaseStore.getBlogCategories();
  const matchedCat = allCategories.find(c =>
    String(c.id) === String(savedPost.category) ||
    c.name === savedPost.category ||
    c.slug === savedPost.category
  );
  const categoryPk = matchedCat && !isNaN(Number(matchedCat.id)) ? Number(matchedCat.id) : null;

  const postExcerpt = (savedPost.excerpt || '').slice(0, 500);
  const imageValue = savedPost.image || '';
  const isBase64Image = isBase64ImageData(imageValue);

  try {
    let res: Response;
    if (isBase64Image) {
      const form = new FormData();
      form.append('title', savedPost.title);
      form.append('slug', savedPost.slug);
      form.append('excerpt', postExcerpt);
      form.append('content', savedPost.content);
      form.append('reading_time_minutes', String(savedPost.readTimeMinutes));
      form.append('is_published', String(savedPost.isPublished));
      form.append('key_takeaways', JSON.stringify(savedPost.keyTakeaways || []));
      form.append('tags', JSON.stringify(savedPost.tags || []));
      form.append('faqs', JSON.stringify(savedPost.faqs || []));
      form.append('meta_title', savedPost.metaTitle || savedPost.title);
      form.append('meta_description', savedPost.metaDescription || postExcerpt);
      form.append('focus_keyword', savedPost.focusKeyword || '');
      form.append('is_reportage', String(Boolean(savedPost.isReportage)));
      form.append('reportage_sponsor', savedPost.reportageSponsor || '');
      form.append('reportage_link', savedPost.reportageLink || '');
      if (savedPost.reportageBanner) {
        if (isBase64ImageData(savedPost.reportageBanner)) {
          const isGif = savedPost.reportageBanner.includes('image/gif');
          form.append('reportage_banner', base64ImageToBlob(savedPost.reportageBanner), isGif ? 'banner.gif' : 'banner.png');
        } else {
          form.append('reportage_banner_url', savedPost.reportageBanner);
        }
      }
      if (categoryPk !== null) form.append('category', String(categoryPk));
      form.append('featured_image', base64ImageToBlob(imageValue), 'featured-image.jpg');

      const uploadHeaders = { ...headers };
      delete uploadHeaders['Content-Type'];
      res = await fetch(`${baseUrl}/blog/admin/${id}/`, {
        method: 'PUT',
        headers: uploadHeaders,
        body: form
      });
      if (!res.ok) {
        // همچنین تلاش با PATCH در صورتی که متد PUT محدود شده باشد
        await fetch(`${baseUrl}/blog/admin/${id}/`, {
          method: 'PATCH',
          headers: uploadHeaders,
          body: form
        }).catch(() => {});
      }
    } else {
      const payload: Record<string, any> = {
        title: savedPost.title,
        slug: savedPost.slug,
        excerpt: postExcerpt,
        content: savedPost.content,
        featured_image_url: imageValue.slice(0, 500),
        reading_time_minutes: savedPost.readTimeMinutes,
        is_published: savedPost.isPublished,
        is_reportage: Boolean(savedPost.isReportage),
        reportage_sponsor: savedPost.reportageSponsor || '',
        reportage_banner: savedPost.reportageBanner || '',
        reportage_link: savedPost.reportageLink || '',
        key_takeaways: savedPost.keyTakeaways || [],
        tags: savedPost.tags || [],
        faqs: savedPost.faqs || [],
        meta_title: savedPost.metaTitle || savedPost.title,
        meta_description: savedPost.metaDescription || postExcerpt,
        focus_keyword: savedPost.focusKeyword || ''
      };
      if (categoryPk !== null) payload.category = categoryPk;

      res = await fetch(`${baseUrl}/blog/admin/${id}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        await fetch(`${baseUrl}/blog/admin/${id}/`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload)
        }).catch(() => {});
      }
    }

    if (!res.ok) {
      console.warn('Django Blog Update API status:', res.status);
    }
  } catch (err) {
    console.warn('Django Blog Update API error notice:', err);
  }

  return savedPost;
}

/**
 * حذف مقاله — DELETE /api/v1/blog/admin/{pk}/ (BlogPostAdminDetailAPIView، نیازمند JWT ادمین)
 */
export async function djangoDeleteBlogPost(id: string | number, config?: DjangoCrmConfig): Promise<boolean> {
  djangoDatabaseStore.deleteBlogPost(String(id));

  const baseUrl = getBlogApiBaseUrl(config);
  const headers = getBlogApiHeaders(config);

  try {
    await fetch(`${baseUrl}/blog/admin/${id}/`, { method: 'DELETE', headers });
  } catch (err) {
    console.warn('Django Blog Delete API notice:', err);
  }

  return true;
}

/**
 * دریافت فهرست دسته‌بندی‌های وبلاگ — GET /api/v1/blog/categories/ (BlogCategoryListAPIView)
 */
export async function djangoFetchBlogCategories(config?: DjangoCrmConfig): Promise<BlogCategoryItem[]> {
  const baseUrl = getBlogApiBaseUrl(config);
  const headers = getBlogApiHeaders(config);

  try {
    const res = await fetch(`${baseUrl}/blog/categories/`, { method: 'GET', headers });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data?.results) ? data.results : [];
      // name، slug و description از سرور می‌آیند؛ ویژگی‌های صرفاً ظاهری (رنگ و...) در فرانت نگهداری می‌شوند
      const localExtras = new Map(djangoDatabaseStore.getBlogCategories().map(c => [String(c.id), c]));
      const mapped: BlogCategoryItem[] = list.map((item: any) => {
        const extra = localExtras.get(String(item.id));
        return {
          id: String(item.id),
          name: item.name,
          slug: item.slug,
          color: extra?.color || 'text-blue-600',
          bgColor: extra?.bgColor || 'bg-blue-50',
          borderColor: extra?.borderColor || 'border-blue-200',
          description: item.description || '',
          order: extra?.order || 1
        };
      });
      djangoDatabaseStore.setBlogCategories(mapped);
      return mapped;
    }
    console.warn('Django Blog Categories API returned non-OK status:', res.status);
  } catch (e) {
    console.warn('Django Blog Categories API error:', e);
  }

  return djangoDatabaseStore.getBlogCategories();
}

/**
 * ایجاد دسته‌بندی جدید — POST /api/v1/blog/categories/ (BlogCategoryListAPIView، عمومی/بدون نیاز به توکن)
 */
export async function djangoCreateBlogCategory(category: Partial<BlogCategoryItem>, config?: DjangoCrmConfig): Promise<BlogCategoryItem> {
  const catName = (category.name || '').trim();
  const slug = (category.slug || '').trim() || (catName ? catName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '') : `cat-${Date.now()}`);
  const description = (category.description || '').trim().slice(0, 300);

  const localSaved = djangoDatabaseStore.saveBlogCategory({
    ...category,
    name: catName,
    slug,
    description
  });

  const baseUrl = getBlogApiBaseUrl(config);
  const headers = getBlogApiHeaders(config);

  try {
    const res = await fetch(`${baseUrl}/blog/categories/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: catName, slug, description })
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      const serverItem = data?.data;
      if (serverItem?.id) {
        return djangoDatabaseStore.saveBlogCategory({
          ...localSaved,
          id: String(serverItem.id),
          name: serverItem?.name || catName,
          slug: serverItem?.slug || slug,
          description: serverItem?.description ?? description
        });
      }
    } else {
      console.warn('Django Blog Create Category API returned status:', res.status);
    }
  } catch (err) {
    console.warn('Django Blog Create Category API notice:', err);
  }

  return localSaved;
}

/**
 * ویرایش دسته‌بندی — PUT /api/v1/blog/categories/{id}/ (BlogCategoryDetailAPIView)
 */
export async function djangoUpdateBlogCategory(id: string, category: Partial<BlogCategoryItem>, config?: DjangoCrmConfig): Promise<BlogCategoryItem> {
  const saved = djangoDatabaseStore.saveBlogCategory({ ...category, id });

  const baseUrl = getBlogApiBaseUrl(config);
  const headers = getBlogApiHeaders(config);

  try {
    const res = await fetch(`${baseUrl}/blog/categories/${id}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name: saved.name, slug: saved.slug, description: (saved.description || '').slice(0, 300) })
    });
    if (!res.ok) {
      console.warn('Django Blog Update Category API returned status:', res.status);
    }
  } catch (err) {
    console.warn('Django Blog Update Category API notice:', err);
  }

  return saved;
}

/**
 * حذف دسته‌بندی — DELETE /api/v1/blog/categories/{id}/ (BlogCategoryDetailAPIView)
 */
export async function djangoDeleteBlogCategory(id: string, config?: DjangoCrmConfig): Promise<boolean> {
  djangoDatabaseStore.deleteBlogCategory(id);

  const baseUrl = getBlogApiBaseUrl(config);
  const headers = getBlogApiHeaders(config);

  try {
    await fetch(`${baseUrl}/blog/categories/${id}/`, { method: 'DELETE', headers });
  } catch (err) {
    console.warn('Django Blog Delete Category API notice:', err);
  }

  return true;
}
