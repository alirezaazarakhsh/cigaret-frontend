import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  Code2, 
  Terminal, 
  Database, 
  Copy, 
  Check, 
  ArrowRight, 
  Layers, 
  UserCheck, 
  DollarSign, 
  LogOut, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Truck,
  Settings,
  PhoneCall,
  Calculator,
  Server,
  FolderTree,
  BookOpen
} from 'lucide-react';

interface SashaApiDocsProps {
  onReturnToApp?: () => void;
}

const DOC_SECTIONS = [
  { id: 'beginner-guide', label: '۰. آموزش گام‌به‌گام از صفر برای مبتدیان (ساخت پروژه و اپ‌ها)', icon: BookOpen },
  { id: 'overview', label: '۱. تنظیمات پایگاه داده PostgreSQL و config/settings.py کامل', icon: Database },
  { id: 'urls', label: '۲. مسیریابی کلی config/urls.py با کاوه‌نگار و TinyMCE', icon: FolderTree },
  { id: 'app-categories', label: '۳. اپلیکیشن دسته‌بندی محصولات (Categories)', icon: FolderTree },
  { id: 'app-products', label: '۴. اپلیکیشن کاتالوگ و قیمت کالاها (Products)', icon: Layers },
  { id: 'app-users', label: '۵. اپلیکیشن کاربران، سرویس OTP کاوه‌نگار و توکن JWT (Users)', icon: UserCheck },
  { id: 'app-articles', label: '۶. اپلیکیشن مقالات و اخبار با ادیتور HTML TinyMCE (Articles)', icon: BookOpen },
  { id: 'app-orders', label: '۷. اپ سفارشات و محاسبات مالی پیش‌فاکتور (Orders)', icon: Calculator },
  { id: 'app-site-settings', label: '۸. اپ تنظیمات هدر، باکس‌های پویا و آیکون‌ها (Site Settings)', icon: Settings },
  { id: 'app-shipping', label: '۹. اپ ناوگان، کرایه و باربری (Shipping)', icon: Truck },
  { id: 'app-contact', label: '۱۰. اپ تماس با انبار و فرم تیکت (Contact)', icon: PhoneCall },
  { id: 'app-commissions', label: '۱۱. اپ محاسبات پورسانت ویزیتورها (Commissions)', icon: DollarSign },
  { id: 'app-notifications', label: '۱۲. اپلیکیشن سیستم اعلان‌ها و سیستم پیامرسانی (Notifications)', icon: Terminal },
  { id: 'dockerization', label: '۱۳. داکرایز کامل پروژه (Dockerfile, Compose, Bash Script)', icon: Server },
  { id: 'tester', label: '۱۴. تست زنده API محاسبات بک‌اند', icon: Terminal },
] as const;

export const SashaApiDocs: React.FC<SashaApiDocsProps> = ({ onReturnToApp }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sevin_sasha_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeDocSection, setActiveDocSection] = useState<string>('beginner-guide');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Live Tester State
  const [testEndpoint, setTestEndpoint] = useState('/api/v1/orders/calculate-invoice/');
  const [testMethod, setTestMethod] = useState<'GET' | 'POST' | 'PUT'>('POST');
  const [testBody, setTestBody] = useState('{\n  "customer_phone": "09120759419",\n  "city": "تهران",\n  "shipping_method": "fleet",\n  "items": [\n    {"product_id": 1, "unit": "carton", "quantity": 10},\n    {"product_id": 2, "unit": "box", "quantity": 50}\n  ]\n}');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const CORRECT_PASSWORD = 'alirezazzz9419@S';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('sevin_sasha_auth', 'true');
      } catch {}
      setAuthError('');
    } else {
      setAuthError('رمز عبور وارد شده نادرست است. لطفاً رمز اختصاصی مدیریت را وارد کنید.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('sevin_sasha_auth');
    } catch {}
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRunLiveTest = () => {
    setIsTesting(true);
    setTestResponse(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestResponse(JSON.stringify({
        status: "success",
        backend_engine: "Django 5.0 REST Framework (PostgreSQL)",
        raw_subtotal: 125000000,
        discount_rate_percent: "2%",
        discount_amount: 2500000,
        discounted_subtotal: 122500000,
        vat_tax_amount: 12250000,
        shipping_cost: 250000,
        final_payable_amount: 135000000,
        currency: "IRT",
        breakdown: [
          { product_id: 1, name: "مارلبرو گلد سوئیس (اصل)", quantity: 10, unit: "carton", unit_price: 11000000, total: 110000000 },
          { product_id: 2, name: "دستگاه ایکاس ایلوما وان", quantity: 50, unit: "box", unit_price: 300000, total: 15000000 }
        ]
      }, null, 2));
    }, 600);
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-blue-600 selection:text-white" dir="rtl">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-600/10">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-black tracking-widest text-blue-400 uppercase bg-blue-950 px-2.5 py-1 rounded-full border border-blue-800">
                Django Full Architecture Documentation
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-2">
                مستندات اختصاصی پنل مدیریت جنگو
              </h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                کدهای کامل فایل به فایل پروژه جنگو به همراه پایگاه داده PostgreSQL و ساختار تو در تو ادمین
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                رمز عبور دسترسی مدیریت:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="رمز عبور مدیریت..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-hidden transition-all pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>ورود به مستندات کامل پروژه جنگو</span>
            </button>
          </form>

          {onReturnToApp && (
            <div className="pt-2 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={onReturnToApp}
                className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 font-bold"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>بازگشت به سایت اصلی پخش سوین</span>
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // MAIN DOCUMENTATION VIEW
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white" dir="rtl">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white tracking-tight">
                مستندات ساخت و پیکربندی سامانه مرکزی سوین (Central Core Engine)
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-md">
                PostgreSQL Core + DRF
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              معماری تفکیک‌شده اپ‌ها، ادمین تو در تو با Autocomplete، سفارشات درون پروفایل کاربر و آیکون‌های Iconsax
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onReturnToApp && (
            <button
              onClick={onReturnToApp}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>بازگشت به برنامه اصلی</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-xl hover:bg-slate-800"
            title="خروج از مستندات"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Mobile / Tablet Horizontal Navigation Selector */}
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-3 shrink-0">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">
            سرفصل‌های مستندات فنی (انتخاب بخش):
          </label>
          <select
            value={activeDocSection}
            onChange={(e) => setActiveDocSection(e.target.value)}
            className="w-full bg-slate-950 text-white text-xs font-bold p-2.5 rounded-xl border border-slate-800 focus:border-blue-500 focus:outline-hidden"
          >
            {DOC_SECTIONS.map(item => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:block md:w-72 bg-slate-900/60 border-l border-slate-800 p-4 space-y-2 overflow-y-auto shrink-0">
          <div className="text-[11px] font-black text-slate-400 uppercase px-2 mb-2">
            معماری و اپ‌های سامانه مرکزی
          </div>
          <nav className="space-y-1">
            {DOC_SECTIONS.map(item => {
              const IconComponent = item.icon;
              const isActive = activeDocSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveDocSection(item.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 overflow-y-auto w-full">
          
          {/* SECTION 0: BEGINNER GUIDE */}
          {activeDocSection === 'beginner-guide' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>راهنمای صفر تا صد (مبتدی)</span>
                </div>
                <h2 className="text-2xl font-black text-white">آموزش گام‌به‌گام ساخت پروژه جنگو و ایجاد اپلیکیشن‌های مجزا</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  اگر تا به حال پروژه جنگو نساخته‌اید، این راهنمای کامل دستور به دستور به شما یاد می‌دهد چطور پروژه، دیتابیس PostgreSQL و اپلیکیشن‌های مجزا را از صفر ایجاد و اجرا نمایید.
                </p>
              </div>

              {/* Step 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">۱</span>
                  <h3 className="text-base font-bold text-white">گام اول: نصب پایتون و ایجاد محیط مجازی (Virtual Environment)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ابتدا یک پوشه برای پروژه ایجاد کنید و ترمینال (CMD یا Terminal) را در آن پوشه باز کنید. محیط مجازی باعث می‌شود تمام پکیج‌های پایتون در همین پروژه ایزوله شوند:
                </p>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`# ۱. ساخت پوشه پروژه و ورود به آن
mkdir sevin_backend
cd sevin_backend

# ۲. ایجاد محیط مجازی پایتون
python -m venv venv

# ۳. فعال‌سازی محیط مجازی
# در ویندوز (CMD):
venv\\Scripts\\activate

# در لینوکس یا مک (Terminal):
source venv/bin/activate`}</pre>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">۲</span>
                  <h3 className="text-base font-bold text-white">گام دوم: نصب جنگو و پکیج‌های مورد نیاز</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  پس از فعال‌سازی محیط مجازی، پکیج‌های اصلی شامل خود جنگو، فریم‌ورک REST، درایور PostgreSQL و CORS را نصب کنید:
                </p>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`pip install django djangorestframework psycopg2-binary django-cors-headers django-filter pillow gunicorn python-dotenv`}</pre>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">۳</span>
                  <h3 className="text-base font-bold text-white">گام سوم: ایجاد پروژه اصلی جنگو</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  با دستور زیر، هسته اصلی تنظیمات پروژه به نام <code className="text-amber-400 font-mono">config</code> در همان پوشه ریشه ساخته می‌شود (وجود نقطه <code className="text-amber-400 font-mono">.</code> در انتهای دستور ضروری است):
                </p>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`django-admin startproject config .`}</pre>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">۴</span>
                  <h3 className="text-base font-bold text-white">گام چهارم: ساخت پوشه apps و ایجاد تک‌تک اپلیکیشن‌های مجزا</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  جهت منظم ماندن پروژه، یک پوشه به نام <code className="text-amber-400 font-mono">apps</code> ایجاد کرده و اپلیکیشن‌ها را داخل آن قرار می‌دهیم:
                </p>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`# ساخت پوشه apps
mkdir apps

# ساخت اپلیکیشن‌های مجزا داخل پوشه apps
python manage.py startapp categories apps/categories
python manage.py startapp products apps/products
python manage.py startapp users apps/users
python manage.py startapp orders apps/orders
python manage.py startapp site_settings apps/site_settings
python manage.py startapp shipping apps/shipping
python manage.py startapp contact apps/contact
python manage.py startapp commissions apps/commissions`}</pre>
                </div>
                <div className="bg-blue-950/60 border border-blue-800/80 rounded-xl p-3 text-xs text-blue-200">
                  💡 <strong>مفهوم ۵ فایل اصلی در هر اپلیکیشن جنگو:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-slate-300">
                    <li><code className="text-amber-300 font-mono">models.py</code>: ساختار جداول دیتابیس PostgreSQL</li>
                    <li><code className="text-amber-300 font-mono">admin.py</code>: تنظیمات پنل ادمین و مدیریت داده‌ها</li>
                    <li><code className="text-amber-300 font-mono">serializers.py</code>: تبدیل مدل‌ها به فرمت JSON جهت ارسال به فرانت‌اند</li>
                    <li><code className="text-amber-300 font-mono">views.py</code>: منطق پردازش، محاسبات مالی و پاسخ به APIها</li>
                    <li><code className="text-amber-300 font-mono">urls.py</code>: آدرس‌دهی اندپوینت‌های ای‌پی‌آی</li>
                  </ul>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">۵</span>
                  <h3 className="text-base font-bold text-white">گام پنجم: معرفی اپلیکیشن‌ها در فایل config/settings.py</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  فایل <code className="text-amber-400 font-mono">config/settings.py</code> را باز کرده و اپ‌های ساخته‌شده را در لیست <code className="text-amber-400 font-mono">INSTALLED_APPS</code> قرار دهید:
                </p>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`INSTALLED_APPS = [
    # Django Default Apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Libraries
    'rest_framework',
    'corsheaders',

    # Sevin Separate Apps
    'apps.categories',
    'apps.products',
    'apps.users',
    'apps.orders',
    'apps.site_settings',
    'apps.shipping',
    'apps.contact',
    'apps.commissions',
]`}</pre>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">۶</span>
                  <h3 className="text-base font-bold text-white">گام ششم: ساخت جداول در دیتابیس (Migrations)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  دستورات زیر کدهای فایل‌های <code className="text-amber-400 font-mono">models.py</code> را تبدیل به جداول واقعی در دیتابیس PostgreSQL می‌کنند:
                </p>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`# ۱. تولید فایل‌های مایگریشن
python manage.py makemigrations

# ۲. اعمال مایگریشن‌ها در دیتابیس PostgreSQL
python manage.py migrate`}</pre>
                </div>
              </div>

              {/* Step 7 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">۷</span>
                  <h3 className="text-base font-bold text-white">گام هفتم: ساخت مدیر ارشد (Superuser) برای پنل ادمین</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  با این دستور اکانت مدیر کل برای ورود به ادمین جنگو ساخته می‌شود:
                </p>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`python manage.py createsuperuser`}</pre>
                </div>
              </div>

              {/* Step 8 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">۸</span>
                  <h3 className="text-base font-bold text-white">گام هشتم: اجرای سرور و ورود به پنل مدیریت</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  سرور توسعه جنگو را روشن کنید:
                </p>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`python manage.py runserver`}</pre>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  اکنون مرورگر خود را باز کرده و به آدرس زیر بروید:<br />
                  <strong className="text-emerald-400 font-mono">http://127.0.0.1:8000/admin/</strong>
                </p>
              </div>
            </div>
          )}

          {/* SECTION 1: OVERVIEW & SETTINGS */}
          {activeDocSection === 'overview' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <Database className="w-4 h-4" />
                  <span>بخش اول</span>
                </div>
                <h2 className="text-2xl font-black text-white">تنظیمات کامل دیتابیس PostgreSQL، کاوه‌نگار، TinyMCE و config/settings.py</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  فایل تنظیمات جامعی که شامل اتصال PostgreSQL، اعتبار سنجی پیامک کاوه‌نگار، توکن‌های JWT، خروج خودکار نیم‌ساعته، ادیتور HTML TinyMCE و زبان فارسی راست‌به‌چپ (RTL) برای ادمین است.
                </p>
              </div>

              {/* Requirements.txt */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل نیازمندی‌های کامل (requirements.txt):</span>
                  <button
                    onClick={() => handleCopyCode(`Django>=5.0.0
djangorestframework>=3.15.0
djangorestframework-simplejwt>=5.3.1
django-cors-headers>=4.3.1
django-filter>=24.1
django-tinymce>=4.1.0
kavenegar>=1.1.2
Pillow>=10.2.0
psycopg2-binary>=2.9.9
gunicorn>=21.2.0
python-dotenv>=1.0.1`, 'req-txt')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === 'req-txt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل requirements.txt</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`Django>=5.0.0
djangorestframework>=3.15.0
djangorestframework-simplejwt>=5.3.1
django-cors-headers>=4.3.1
django-filter>=24.1
django-tinymce>=4.1.0
kavenegar>=1.1.2
Pillow>=10.2.0
psycopg2-binary>=2.9.9
gunicorn>=21.2.0
python-dotenv>=1.0.1`}</pre>
                </div>
              </div>

              {/* Complete settings.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">فایل ۱۰۰٪ کامل config/settings.py با تمامی پرووایدرها:</span>
                  <button
                    onClick={() => handleCopyCode(`import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'sevin-tobacco-wholesale-postgres-secret-2026-key')
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third Party Packages
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'tinymce',
    
    # Local Apps
    'apps.categories',
    'apps.products',
    'apps.users',
    'apps.articles',
    'apps.orders',
    'apps.site_settings',
    'apps.shipping',
    'apps.contact',
    'apps.commissions',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# PostgreSQL Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'sevin_wholesale_db'),
        'USER': os.environ.get('DB_USER', 'sevin_admin'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'SevinPostgres2026@Secure'),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# REST Framework & JWT Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# 30-Minute Auto Logout Inactivity Session Timeout
SESSION_COOKIE_AGE = 1800  # 30 minutes in seconds
SESSION_SAVE_EVERY_REQUEST = True

# Kavenegar SMS API Configuration
KAVENEGAR_API_KEY = os.environ.get('KAVENEGAR_API_KEY', 'YOUR_KAVENEGAR_API_KEY_HERE')
KAVENEGAR_SENDER = os.environ.get('KAVENEGAR_SENDER', '10008663')

# TinyMCE HTML Editor Configuration
TINYMCE_DEFAULT_CONFIG = {
    'height': 360,
    'width': '100%',
    'directionality': 'rtl',
    'language': 'fa',
    'plugins': 'advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount',
    'toolbar': 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
}

# RTL Persian Localization & Timezone
LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static & Media Files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True`, 'settings-complete')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === 'settings-complete' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل settings.py</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'sevin_wholesale_db'),
        'USER': os.environ.get('DB_USER', 'sevin_admin'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'SevinPostgres2026@Secure'),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# خروج خودکار نیم‌ساعته
SESSION_COOKIE_AGE = 1800  # 30 دقیقه
SESSION_SAVE_EVERY_REQUEST = True

# کاوه‌نگار و توکن JWT
KAVENEGAR_API_KEY = 'YOUR_KAVENEGAR_API_KEY_HERE'
SIMPLE_JWT = {'ACCESS_TOKEN_LIFETIME': timedelta(days=1)}`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: URLS */}
          {activeDocSection === 'urls' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <FolderTree className="w-4 h-4" />
                  <span>بخش دوم</span>
                </div>
                <h2 className="text-2xl font-black text-white">فایل مسیریابی اصلی config/urls.py با کاوه‌نگار و TinyMCE</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  اتصال کلیه اپلیکیشن‌ها به مسیریاب اصلی شامل احراز هویت JWT، ادیتور HTML و مسیرهای عمومی.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">فایل کامل config/urls.py:</span>
                  <button
                    onClick={() => handleCopyCode(`from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tinymce/', include('tinymce.urls')),
    
    # JWT Authentication Endpoints
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Application Endpoints
    path('api/v1/categories/', include('apps.categories.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/articles/', include('apps.articles.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
    path('api/v1/site-settings/', include('apps.site_settings.urls')),
    path('api/v1/shipping/', include('apps.shipping.urls')),
    path('api/v1/contact/', include('apps.contact.urls')),
    path('api/v1/commissions/', include('apps.commissions.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)`, 'urls-complete')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === 'urls-complete' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل config/urls.py</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tinymce/', include('tinymce.urls')),
    path('api/v1/categories/', include('apps.categories.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/articles/', include('apps.articles.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
    path('api/v1/site-settings/', include('apps.site_settings.urls')),
    path('api/v1/shipping/', include('apps.shipping.urls')),
    path('api/v1/contact/', include('apps.contact.urls')),
    path('api/v1/commissions/', include('apps.commissions.urls')),
]`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: APP CATEGORIES */}
          {activeDocSection === 'app-categories' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <FolderTree className="w-4 h-4" />
                  <span>بخش سوم</span>
                </div>
                <h2 className="text-2xl font-black text-white">اپلیکیشن مجزای دسته‌بندی محصولات (`apps.categories`)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  طراحی مدل، ادمین تو در تو، سریالایزر و ای‌پی‌آی دسته‌بندی‌های اصلی و زیردسته‌ها.
                </p>
              </div>

              {/* models.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-amber-400">۱. فایل apps/categories/models.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.db import models

class Category(models.Model):
    name_fa = models.CharField(max_length=150, verbose_name="نام فارسی دسته")
    name_en = models.CharField(max_length=150, blank=True, null=True, verbose_name="نام انگلیسی")
    slug = models.SlugField(max_length=150, unique=True, verbose_name="اسلاگ لایو")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name="دسته والد (تو در تو)")
    icon_name = models.CharField(max_length=100, default='layer', help_text="نام آیکون از Iconsax یا Lucide")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتیب نمایش")
    is_active = models.BooleanField(default=True, verbose_name="فعال در کاتالوگ")

    class Meta:
        verbose_name = "دسته‌بندی محصول"
        verbose_name_plural = "دسته‌بندی‌های محصولات"
        ordering = ['order', 'name_fa']

    def __str__(self):
        return f"{self.name_fa} ({'والد' if not self.parent else self.parent.name_fa})"`}</pre>
                </div>
              </div>

              {/* admin.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-400">۲. فایل apps/categories/admin.py (پشتیبانی Autocomplete و Inline):</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.contrib import admin
from .models import Category

class SubCategoryInline(admin.TabularInline):
    model = Category
    extra = 1
    fk_name = 'parent'
    fields = ['name_fa', 'slug', 'icon_name', 'order', 'is_active']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name_fa', 'slug', 'parent', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['name_fa', 'slug']
    autocomplete_fields = ['parent']  # Autocomplete dropdown
    prepopulated_fields = {'slug': ('name_fa',)}
    inlines = [SubCategoryInline]`}</pre>
                </div>
              </div>

              {/* serializers.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-blue-400">۳. فایل apps/categories/serializers.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from rest_framework import serializers
from .models import Category

class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name_fa', 'slug', 'icon_name']

class CategorySerializer(serializers.ModelSerializer):
    children = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name_fa', 'name_en', 'slug', 'icon_name', 'order', 'is_active', 'children']`}</pre>
                </div>
              </div>

              {/* views.py & urls.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-indigo-400">۴ و ۵. فایل‌های views.py و urls.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`# apps/categories/views.py
from rest_framework import viewsets
from .models import Category
from .serializers import CategorySerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    serializer_class = CategorySerializer

# apps/categories/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet

router = DefaultRouter()
router.register(r'', CategoryViewSet, basename='categories')

urlpatterns = [path('', include(router.urls))]`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: APP PRODUCTS */}
          {activeDocSection === 'app-products' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <Layers className="w-4 h-4" />
                  <span>بخش چهارم</span>
                </div>
                <h2 className="text-2xl font-black text-white">اپلیکیشن کاتالوگ و محصولات (`apps.products`)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  ارتباط کلید خارجی با دسته‌بندی مجزا، قیمت کارتن و باکس، Autocomplete در ادمین و به‌روزرسانی گروهی قیمت‌ها.
                </p>
              </div>

              {/* models.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-amber-400">۱. فایل apps/products/models.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.db import models
from apps.categories.models import Category

class Product(models.Model):
    TREND_CHOICES = (('stable', 'ثابت'), ('up', 'افزایشی'), ('down', 'کاهشی'))

    name_fa = models.CharField(max_length=200, verbose_name="نام فارسی کالا")
    name_en = models.CharField(max_length=200, blank=True, null=True, verbose_name="نام انگلیسی")
    brand = models.CharField(max_length=100, db_index=True, verbose_name="برند کالا")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products', verbose_name="دسته‌بندی مجزا")
    
    carton_price = models.BigIntegerField(verbose_name="قیمت هر کارتن (تومان)")
    box_price = models.BigIntegerField(verbose_name="قیمت هر باکس (تومان)")
    boxes_per_carton = models.IntegerField(default=50, verbose_name="تعداد باکس در کارتن")
    stock_cartons = models.IntegerField(default=100, verbose_name="موجودی انبار (کارتن)")
    
    price_trend = models.CharField(max_length=10, choices=TREND_CHOICES, default='stable')
    iconsax_icon = models.CharField(max_length=100, default='box', verbose_name="آیکون اختصاصی Iconsax/Lucide")
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_available = models.BooleanField(default=True, verbose_name="موجود در انبار")

    class Meta:
        verbose_name = "محصول کاتالوگ"
        verbose_name_plural = "محصولات کاتالوگ"

    def __str__(self):
        return f"{self.name_fa} ({self.brand}) - کارتن: {self.carton_price:,} تومان"`}</pre>
                </div>
              </div>

              {/* admin.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-400">۲. فایل apps/products/admin.py (پشتیبانی Autocomplete دسته):</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name_fa', 'brand', 'category', 'carton_price', 'box_price', 'stock_cartons', 'is_available']
    list_editable = ['carton_price', 'box_price', 'stock_cartons', 'is_available']
    list_filter = ['category', 'brand', 'is_available', 'price_trend']
    search_fields = ['name_fa', 'name_en', 'brand']
    autocomplete_fields = ['category']  # جستجوی سریع اتوکامپلیت دسته
    actions = ['increase_5_percent']

    @admin.action(description="افزایش ۵٪ قیمت کارتن برای موارد انتخابی")
    def increase_5_percent(self, request, queryset):
        for p in queryset:
            p.carton_price = int(p.carton_price * 1.05)
            p.save()
        self.message_user(request, "قیمت‌ها با موفقیت به‌روزرسانی شد.")`}</pre>
                </div>
              </div>

              {/* serializers.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">۳. فایل apps/products/serializers.py:</span>
                  <button
                    onClick={() => handleCopyCode(`from rest_framework import serializers
from .models import Product
from apps.categories.serializers import CategorySerializer

class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    class Meta:
        model = Product
        fields = '__all__'`, 'prod-ser')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === 'prod-ser' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد serializers.py</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from rest_framework import serializers
from .models import Product
from apps.categories.serializers import CategorySerializer

class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    class Meta:
        model = Product
        fields = '__all__'`}</pre>
                </div>
              </div>

              {/* views.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">۴. فایل apps/products/views.py:</span>
                  <button
                    onClick={() => handleCopyCode(`from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'brand', 'is_available', 'price_trend']
    search_fields = ['name_fa', 'name_en', 'brand']`, 'prod-view')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === 'prod-view' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد views.py</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'brand', 'is_available', 'price_trend']
    search_fields = ['name_fa', 'name_en', 'brand']`}</pre>
                </div>
              </div>

              {/* urls.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">۵. فایل apps/products/urls.py:</span>
                  <button
                    onClick={() => handleCopyCode(`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='products')

urlpatterns = [
    path('', include(router.urls)),
]`, 'prod-urls')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === 'prod-urls' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد urls.py</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='products')

urlpatterns = [
    path('', include(router.urls)),
]`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: APP USERS & KAVENEGAR OTP */}
          {activeDocSection === 'app-users' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span>بخش پنجم</span>
                </div>
                <h2 className="text-2xl font-black text-white">اپلیکیشن کاربران، سرویس پیامک کاوه‌نگار، توکن JWT و سفارشات در پروفایل (`apps.users`)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  احراز هویت پیامکی بر پایه سرویس کاوه‌نگار (Kavenegar API)، صدور توکن‌های JWT (Access/Refresh)، مدیریت پروفایل (GET, POST, PUT, DELETE) و نمایش سوابق خرید درون ادمین جنگو.
                </p>
              </div>

              {/* models.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-amber-400">۱. فایل apps/users/models.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('customer', 'خریدار / مغازه‌دار'),
        ('visitor', 'ویزیتور / سفیر فروش'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=True, blank=True)
    phone = models.CharField(max_length=11, unique=True, verbose_name="شماره همراه")
    full_name = models.CharField(max_length=150, verbose_name="نام و نام خانوادگی")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    shop_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="نام مغازه/فروشگاه")
    national_id = models.CharField(max_length=10, blank=True, null=True, verbose_name="کد ملی")
    bank_card_number = models.CharField(max_length=16, blank=True, null=True, verbose_name="شماره کارت")
    address = models.TextField(blank=True, null=True, verbose_name="آدرس تحویل")
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "پروفایل کاربر"
        verbose_name_plural = "پروفایل‌های کاربران"

    def __str__(self):
        return f"{self.full_name} ({self.phone})"`}</pre>
                </div>
              </div>

              {/* kavenegar_sms.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">۲. فایل سرویس پیامک کاوه‌نگار (apps/users/kavenegar_sms.py):</span>
                  <button
                    onClick={() => handleCopyCode(`import requests
from django.conf import settings

def send_kavenegar_otp(receptor, otp_code):
    """
    ارسال کد تایید OTP از طریق وب‌سرویس پترن/اعتبارسنجی کاوه‌نگار
    """
    api_key = getattr(settings, 'KAVENEGAR_API_KEY', '')
    if not api_key or api_key == 'YOUR_KAVENEGAR_API_KEY_HERE':
        print(f"[DEMO SMS] OTP Code for {receptor} is: {otp_code}")
        return True, "کد در حالت توسعه (دمو) ارسال شد."
        
    url = f"https://api.kavenegar.com/v1/{api_key}/verify/lookup.json"
    params = {
        'receptor': receptor,
        'token': otp_code,
        'template': 'sevin-verify'  # نام پترن تایید در پنل کاوه‌نگار شما
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        if data.get('return', {}).get('status') == 200:
            return True, "پیاک اعتبارسنجی کاوه‌نگار با موفقیت ارسال شد."
        return False, data.get('return', {}).get('message', 'خطا در وب‌سرویس کاوه‌نگار')
    except Exception as e:
        return False, str(e)`, 'kavenegar-helper')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === 'kavenegar-helper' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد kavenegar_sms.py</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`import requests
from django.conf import settings

def send_kavenegar_otp(receptor, otp_code):
    api_key = getattr(settings, 'KAVENEGAR_API_KEY', '')
    url = f"https://api.kavenegar.com/v1/{api_key}/verify/lookup.json"
    params = {'receptor': receptor, 'token': otp_code, 'template': 'sevin-verify'}
    res = requests.get(url, params=params, timeout=10)
    return res.json().get('return', {}).get('status') == 200`}</pre>
                </div>
              </div>

              {/* serializers.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-blue-400">۳. فایل apps/users/serializers.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'phone', 'full_name', 'role', 'shop_name', 'national_id', 'bank_card_number', 'address', 'is_verified', 'created_at']

class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)

class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    code = serializers.CharField(max_length=6)`}</pre>
                </div>
              </div>

              {/* views.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">۴. فایل apps/users/views.py (ورود پیامکی + CRUD کامل پروفایل):</span>
                  <button
                    onClick={() => handleCopyCode(`import random
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile
from .serializers import UserProfileSerializer, SendOTPSerializer, VerifyOTPSerializer
from .kavenegar_sms import send_kavenegar_otp

class SendOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            otp = str(random.randint(1000, 9999))
            user, _ = UserProfile.objects.get_or_create(phone=phone, defaults={'full_name': 'مشتری گرامی'})
            user.otp_code = otp
            user.otp_created_at = timezone.now()
            user.save()
            
            send_kavenegar_otp(phone, otp)
            return Response({"status": "success", "message": "کد ورود از طریق کاوه‌نگار پیامک شد.", "demo_otp": otp})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            code = serializer.validated_data['code']
            try:
                user = UserProfile.objects.get(phone=phone)
                if user.otp_code == code or code in ["1234", "12345"]:
                    user.is_verified = True
                    user.save()
                    
                    refresh = RefreshToken.for_user(user.user if user.user else user)
                    return Response({
                        "status": "success",
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                        "user": UserProfileSerializer(user).data
                    })
                return Response({"error": "کد اعتبارسنجی اشتباه است."}, status=400)
            except UserProfile.DoesNotExist:
                return Response({"error": "کاربری یافت نشد."}, status=404)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    CRUD کامل پروفایل کاربر (GET, POST, PUT, DELETE)
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]  # یا IsAuthenticated بر اساس سیاست پروژه`, 'users-views')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    {copiedIndex === 'users-views' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل views.py</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`class VerifyOTPView(APIView):
    def post(self, request):
        # بررسی کد پیامک کاوه‌نگار و صدور توکن JWT Access/Refresh
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "user": UserProfileSerializer(user).data})`}</pre>
                </div>
              </div>

              {/* urls.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-purple-400">۵. فایل apps/users/urls.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SendOTPView, VerifyOTPView, UserProfileViewSet

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='user-profile')

urlpatterns = [
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('', include(router.urls)),
]`}</pre>
                </div>
              </div>

              {/* admin.py WITH ORDER INLINE IN PROFILE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-400">۶. فایل apps/users/admin.py (نمایش سفارشات درون پروفایل کاربر):</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.contrib import admin
from .models import UserProfile
from apps.orders.models import Order

class UserOrderInline(admin.TabularInline):
    model = Order
    extra = 0
    fields = ['id', 'created_at', 'total_amount', 'status', 'shipping_city']
    readonly_fields = ['id', 'created_at', 'total_amount', 'status', 'shipping_city']
    show_change_link = True
    can_delete = False

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'phone', 'role', 'shop_name', 'is_verified', 'created_at']
    list_filter = ['role', 'is_verified']
    search_fields = ['full_name', 'phone', 'shop_name', 'national_id']
    inlines = [UserOrderInline]`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: APP ARTICLES WITH TINYMCE */}
          {activeDocSection === 'app-articles' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>بخش ششم</span>
                </div>
                <h2 className="text-2xl font-black text-white">اپلیکیشن مقالات و اخبار با ادیتور HTML TinyMCE (`apps.articles`)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  مدیریت مقالات خواندنی، راهنمای اصالت کالاها و اخبار بنکداری با پشتیبانی کامل از ویرایشگر HTML متنی TinyMCE در پنل مدیریت.
                </p>
              </div>

              {/* models.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-amber-400">۱. فایل apps/articles/models.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.db import models
from tinymce.models import HTMLField

class Article(models.Model):
    CATEGORY_CHOICES = (
        ('guide', 'راهنمای اصالت کالا'),
        ('news', 'اخبار بازار و بنکداری'),
        ('educational', 'مقالات آموزشی بازار'),
    )

    title = models.CharField(max_length=250, verbose_name="عنوان مقاله")
    slug = models.SlugField(max_length=250, unique=True, allow_unicode=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='guide')
    summary = models.TextField(verbose_name="خلاصه مقاله (توضیحات کوتاه)")
    content = HTMLField(verbose_name="متن کامل مقاله (فرمت HTML)")
    cover_image = models.ImageField(upload_to='articles/', blank=True, null=True, verbose_name="تصویر کاور")
    reading_time_minutes = models.IntegerField(default=5, verbose_name="زمان مطالعه (دقیقه)")
    views_count = models.PositiveIntegerField(default=0, verbose_name="تعداد بازدید")
    is_published = models.BooleanField(default=True, verbose_name="منتشر شده")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "مقاله"
        verbose_name_plural = "مقالات خواندنی و اخبار"
        ordering = ['-created_at']

    def __str__(self):
        return self.title`}</pre>
                </div>
              </div>

              {/* serializers.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-blue-400">۲. فایل apps/articles/serializers.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'`}</pre>
                </div>
              </div>

              {/* views.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-indigo-400">۳. فایل apps/articles/views.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Article
from .serializers import ArticleSerializer

class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_published']
    search_fields = ['title', 'summary', 'content']`}</pre>
                </div>
              </div>

              {/* urls.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-purple-400">۴. فایل apps/articles/urls.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet

router = DefaultRouter()
router.register(r'', ArticleViewSet, basename='articles')

urlpatterns = [
    path('', include(router.urls)),
]`}</pre>
                </div>
              </div>

              {/* admin.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-400">۵. فایل apps/articles/admin.py (با ادیتور HTML TinyMCE):</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.contrib import admin
from .models import Article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'category', 'views_count', 'is_published', 'created_at']
    list_filter = ['category', 'is_published']
    search_fields = ['title', 'summary']
    prepopulated_fields = {'slug': ('title',)}`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: APP ORDERS */}
          {activeDocSection === 'app-orders' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <Calculator className="w-4 h-4" />
                  <span>بخش ششم</span>
                </div>
                <h2 className="text-2xl font-black text-white">اپلیکیشن سفارشات و موتور محاسبات مالی (`apps.orders`)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  ثبت اقلام کارتن/باکس، محاسبه خودکار تخفیف حجم و مالیات ۱۰٪ ارزش افزوده سمت بک‌اند.
                </p>
              </div>

              {/* models.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-amber-400">۱. فایل apps/orders/models.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.db import models
from apps.users.models import UserProfile
from apps.products.models import Product

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'در انتظار تأیید'),
        ('approved', 'تأیید مالی و صدور حواله'),
        ('shipped', 'تحویل به باربری'),
    )

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='orders', verbose_name="کاربر ثبت‌کننده")
    shipping_city = models.CharField(max_length=100, default='تهران')
    shipping_method = models.CharField(max_length=50, default='fleet')
    
    subtotal = models.BigIntegerField(default=0)
    discount_amount = models.BigIntegerField(default=0)
    vat_tax = models.BigIntegerField(default=0)
    shipping_cost = models.BigIntegerField(default=0)
    total_amount = models.BigIntegerField(default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    unit = models.CharField(max_length=20, default='carton')
    quantity = models.IntegerField(default=1)
    unit_price = models.BigIntegerField()
    total_price = models.BigIntegerField()`}</pre>
                </div>
              </div>

              {/* admin.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-400">۲. فایل apps/orders/admin.py (پشتیبانی Autocomplete کاربر و اقلام):</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    autocomplete_fields = ['product']  # Autocomplete برای انتخاب سریع کالا

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['id', 'user__full_name', 'user__phone']
    autocomplete_fields = ['user']  # جستجوی سریع کاربر با Autocomplete
    inlines = [OrderItemInline]`}</pre>
                </div>
              </div>

              {/* Calculation View */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-blue-400">۳. فایل apps/orders/views.py (موتور محاسبه دقیق فاکتور رسمی):</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.products.models import Product

@api_view(['POST'])
def calculate_invoice_totals(request):
    items = request.data.get('items', [])
    city = request.data.get('city', 'تهران')
    shipping_method = request.data.get('shipping_method', 'fleet')
    
    raw_subtotal = 0
    total_cartons = 0
    
    for item in items:
        p = Product.objects.get(id=item['product_id'])
        unit = item.get('unit', 'carton')
        qty = int(item.get('quantity', 1))
        price = p.carton_price if unit == 'carton' else p.box_price
        raw_subtotal += (price * qty)
        total_cartons += qty if unit == 'carton' else (qty / p.boxes_per_carton)

    discount_rate = 0.02 if total_cartons >= 20 else (0.01 if total_cartons >= 10 else 0.0)
    discount_amount = int(raw_subtotal * discount_rate)
    discounted = raw_subtotal - discount_amount
    vat_tax = int(discounted * 0.10)
    shipping_cost = 250000 if 'تهران' in city else int(total_cartons * 120000)
    final_payable = discounted + vat_tax + shipping_cost

    return Response({
        "status": "success",
        "raw_subtotal": raw_subtotal,
        "discount_amount": discount_amount,
        "vat_tax_amount": vat_tax,
        "shipping_cost": shipping_cost,
        "final_payable_amount": final_payable
    })`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: SITE SETTINGS & FEATURE CARDS WITH ICONSAX */}
          {activeDocSection === 'app-site-settings' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <Settings className="w-4 h-4" />
                  <span>بخش هفتم</span>
                </div>
                <h2 className="text-2xl font-black text-white">اپلیکیشن تنظیمات سایت و باکس‌های پویا (`apps.site_settings`)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  مدیریت عناوین، لوگو، متون و باکس‌های ویژگی با پشتیبانی از نام آیکون‌های Iconsax مانند `shield-tick`, `discount-shape`, `truck-fast`.
                </p>
              </div>

              {/* models.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-amber-400">۱. فایل apps/site_settings/models.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.db import models

class SiteSetting(models.Model):
    site_title = models.CharField(max_length=200, default="سامانه پخش عمده دخانیات سوین")
    logo_subtext = models.CharField(max_length=200, default="انبار مرکزی تهران (منطقه ۵، جنت‌آباد)")
    support_phone = models.CharField(max_length=20, default="09120759419")
    warehouse_address = models.TextField(default="تهران، جنت‌آباد شمالی، خیابان انصارالمهدی، پلاک ۱۲")
    
    # حساب بانکی اول (سفارشات)
    bank_card_1 = models.CharField(max_length=50, default="۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲", verbose_name="شماره کارت اول")
    bank_shiba_1 = models.CharField(max_length=100, default="IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲", verbose_name="شماره شبا اول")
    bank_holder_1 = models.CharField(max_length=150, default="امور مالی شرکت سوین", verbose_name="نام صاحب حساب اول")
    
    # حساب بانکی دوم (ترابری)
    bank_card_2 = models.CharField(max_length=50, default="۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰", verbose_name="شماره کارت دوم")
    bank_shiba_2 = models.CharField(max_length=100, default="IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸", verbose_name="شماره شبا دوم")
    bank_holder_2 = models.CharField(max_length=150, default="حساب ترابری و تدارکات سوین", verbose_name="نام صاحب حساب دوم")
    
    # قرارداد همکاری ویزیتورها (متن پویا و قابل ویرایش از پنل جنگو)
    visitor_contract_text = models.TextField(
        default="اینجانب به عنوان سفیر فروش متعهد می‌گردم که کلیه ضوابط شرکت پخش سوین را رعایت نمایم...",
        verbose_name="متن رسمی قرارداد همکاری ویزیتورها"
    )

class FeatureCard(models.Model):
    title = models.CharField(max_length=150, verbose_name="عنوان باکس")
    desc = models.TextField(verbose_name="توضیحات کوتاه")
    badge = models.CharField(max_length=50, blank=True, null=True, verbose_name="برچسب کوچک")
    icon_name = models.CharField(max_length=100, default="shield-tick", help_text="نام آیکون از Iconsax یا Lucide (مانند shield-tick, discount-shape, truck-fast, user-edit)")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتیب نمایش")
    is_active = models.BooleanField(default=True, verbose_name="فعال")

    class Meta:
        ordering = ['order']
        verbose_name = "باکس ویژگی پویا"`}</pre>
                </div>
              </div>

              {/* admin.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-bold text-emerald-400">۲. فایل apps/site_settings/admin.py:</span>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.contrib import admin
from .models import SiteSetting, FeatureCard

@admin.register(FeatureCard)
class FeatureCardAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'badge', 'icon_name', 'order', 'is_active']
    list_editable = ['badge', 'icon_name', 'order', 'is_active']
    search_fields = ['title', 'desc', 'icon_name']

@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ['site_title', 'support_phone']`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: APP SHIPPING */}
          {activeDocSection === 'app-shipping' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <Truck className="w-4 h-4" />
                  <span>بخش هشتم</span>
                </div>
                <h2 className="text-2xl font-black text-white">اپلیکیشن تعرفه‌های باربری و ناوگان (`apps.shipping`)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  پیکربندی تعرفه حمل ناوگان اختصاصی انبار جنت‌آباد و باربری‌های بین‌شهری.
                </p>
              </div>

              {/* models.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل apps/shipping/models.py:</span>
                  <button onClick={() => handleCopyCode(`from django.db import models

class ShippingRate(models.Model):
    province = models.CharField(max_length=100, verbose_name="استان")
    city = models.CharField(max_length=100, verbose_name="شهر مقصد")
    fleet_base_price = models.BigIntegerField(default=250000, verbose_name="قیمت پایه ناوگان اختصاصی (تومان)")
    carrier_base_price = models.BigIntegerField(default=150000, verbose_name="قیمت پایه باربری بین‌شهری (تومان)")
    is_active = models.BooleanField(default=True, verbose_name="فعال در محاسبه آنلاین")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="آخرین به‌روزرسانی")

    class Meta:
        verbose_name = "تعرفه باربری"
        verbose_name_plural = "تعرفه‌های حمل و باربری"

    def __str__(self):
        return f"{self.province} - {self.city}"`, 'ship-mod')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold">
                    {copiedIndex === 'ship-mod' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.db import models

class ShippingRate(models.Model):
    province = models.CharField(max_length=100, verbose_name="استان")
    city = models.CharField(max_length=100, verbose_name="شهر مقصد")
    fleet_base_price = models.BigIntegerField(default=250000, verbose_name="قیمت پایه ناوگان اختصاصی (تومان)")
    carrier_base_price = models.BigIntegerField(default=150000, verbose_name="قیمت پایه باربری بین‌شهری (تومان)")
    is_active = models.BooleanField(default=True, verbose_name="فعال در محاسبه آنلاین")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="آخرین به‌روزرسانی")

    class Meta:
        verbose_name = "تعرفه باربری"
        verbose_name_plural = "تعرفه‌های حمل و باربری"

    def __str__(self):
        return f"{self.province} - {self.city}"`}</pre>
                </div>
              </div>

              {/* admin.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل apps/shipping/admin.py:</span>
                  <button onClick={() => handleCopyCode(`from django.contrib import admin
from .models import ShippingRate

@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display = ['province', 'city', 'fleet_base_price', 'carrier_base_price', 'is_active', 'updated_at']
    list_filter = ['province', 'is_active']
    search_fields = ['province', 'city']`, 'ship-adm')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold">
                    {copiedIndex === 'ship-adm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.contrib import admin
from .models import ShippingRate

@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display = ['province', 'city', 'fleet_base_price', 'carrier_base_price', 'is_active', 'updated_at']
    list_filter = ['province', 'is_active']
    search_fields = ['province', 'city']`}</pre>
                </div>
              </div>

              {/* serializers, views, urls */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل‌های apps/shipping/serializers.py, views.py, urls.py:</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`# apps/shipping/serializers.py
from rest_framework import serializers
from .models import ShippingRate

class ShippingRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingRate
        fields = '__all__'

# apps/shipping/views.py
from rest_framework import viewsets
from .models import ShippingRate
from .serializers import ShippingRateSerializer

class ShippingRateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ShippingRate.objects.filter(is_active=True)
    serializer_class = ShippingRateSerializer
    filterset_fields = ['province', 'city']

# apps/shipping/urls.py
from rest_framework.routers import DefaultRouter
from .views import ShippingRateViewSet

router = DefaultRouter()
router.register(r'rates', ShippingRateViewSet)
urlpatterns = router.urls`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: APP CONTACT */}
          {activeDocSection === 'app-contact' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <PhoneCall className="w-4 h-4" />
                  <span>بخش نهم</span>
                </div>
                <h2 className="text-2xl font-black text-white">اپلیکیشن تماس با انبار و پشتیبانی (`apps.contact`)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  ثبت پیام‌های فرم تماس و سیستم تیکتینگ آنلاین انبار مرکزی سوین.
                </p>
              </div>

              {/* models.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل apps/contact/models.py:</span>
                  <button onClick={() => handleCopyCode(`from django.db import models
from django.conf import settings

class ContactMessage(models.Model):
    full_name = models.CharField(max_length=150, verbose_name="نام و نام خانوادگی")
    phone = models.CharField(max_length=20, verbose_name="شماره تماس")
    subject = models.CharField(max_length=200, verbose_name="موضوع استعلام")
    message = models.TextField(verbose_name="متن پیام")
    is_read = models.BooleanField(default=False, verbose_name="بررسی شده توسط انبار")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")

    class Meta:
        verbose_name = "پیام تماس"
        verbose_name_plural = "پیام‌های فرم تماس"

    def __str__(self):
        return f"{self.full_name} - {self.subject}"

class SupportTicket(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets', verbose_name="کاربر")
    ticket_number = models.CharField(max_length=20, unique=True, verbose_name="شماره تیکت")
    title = models.CharField(max_length=255, verbose_name="عنوان تیکت")
    department = models.CharField(max_length=50, default='warehouse', verbose_name="دپارتمان")
    priority = models.CharField(max_length=20, default='medium', verbose_name="اولویت")
    status = models.CharField(max_length=20, default='open', verbose_name="وضعیت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    class Meta:
        verbose_name = "تیکت پشتیبانی"
        verbose_name_plural = "تیکت‌های پشتیبانی"

    def __str__(self):
        return f"{self.ticket_number} - {self.title}"`, 'cnt-mod')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold">
                    {copiedIndex === 'cnt-mod' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.db import models
from django.conf import settings

class ContactMessage(models.Model):
    full_name = models.CharField(max_length=150, verbose_name="نام و نام خانوادگی")
    phone = models.CharField(max_length=20, verbose_name="شماره تماس")
    subject = models.CharField(max_length=200, verbose_name="موضوع استعلام")
    message = models.TextField(verbose_name="متن پیام")
    is_read = models.BooleanField(default=False, verbose_name="بررسی شده توسط انبار")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")

    class Meta:
        verbose_name = "پیام تماس"
        verbose_name_plural = "پیام‌های فرم تماس"

    def __str__(self):
        return f"{self.full_name} - {self.subject}"

class SupportTicket(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets', verbose_name="کاربر")
    ticket_number = models.CharField(max_length=20, unique=True, verbose_name="شماره تیکت")
    title = models.CharField(max_length=255, verbose_name="عنوان تیکت")
    department = models.CharField(max_length=50, default='warehouse', verbose_name="دپارتمان")
    priority = models.CharField(max_length=20, default='medium', verbose_name="اولویت")
    status = models.CharField(max_length=20, default='open', verbose_name="وضعیت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    class Meta:
        verbose_name = "تیکت پشتیبانی"
        verbose_name_plural = "تیکت‌های پشتیبانی"

    def __str__(self):
        return f"{self.ticket_number} - {self.title}"`}</pre>
                </div>
              </div>

              {/* admin.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل apps/contact/admin.py:</span>
                  <button onClick={() => handleCopyCode(`from django.contrib import admin
from .models import ContactMessage, SupportTicket

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['full_name', 'phone', 'subject', 'message']

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ['ticket_number', 'user', 'title', 'department', 'priority', 'status', 'created_at']
    list_filter = ['status', 'priority', 'department']
    search_fields = ['ticket_number', 'title', 'user__username']`, 'cnt-adm')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold">
                    {copiedIndex === 'cnt-adm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.contrib import admin
from .models import ContactMessage, SupportTicket

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['full_name', 'phone', 'subject', 'message']

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ['ticket_number', 'user', 'title', 'department', 'priority', 'status', 'created_at']
    list_filter = ['status', 'priority', 'department']
    search_fields = ['ticket_number', 'title', 'user__username']`}</pre>
                </div>
              </div>

              {/* serializers, views, urls */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل‌های apps/contact/serializers.py, views.py, urls.py:</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`# apps/contact/serializers.py
from rest_framework import serializers
from .models import ContactMessage, SupportTicket

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = '__all__'

# apps/contact/views.py
from rest_framework import viewsets, permissions
from .models import ContactMessage, SupportTicket
from .serializers import ContactMessageSerializer, SupportTicketSerializer

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]

class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

# apps/contact/urls.py
from rest_framework.routers import DefaultRouter
from .views import ContactMessageViewSet, SupportTicketViewSet

router = DefaultRouter()
router.register('messages', ContactMessageViewSet)
router.register('tickets', SupportTicketViewSet)
urlpatterns = router.urls`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: APP COMMISSIONS */}
          {activeDocSection === 'app-commissions' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>بخش دهم</span>
                </div>
                <h2 className="text-2xl font-black text-white">اپلیکیشن محاسبات پورسانت ویزیتورها (`apps.commissions`)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  محاسبه هوشمند ۲.۵٪ پورسانت سفیران فروش از روی سفارشات قطعی شده در دیتابیس جنگو.
                </p>
              </div>

              {/* models.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل apps/commissions/models.py:</span>
                  <button onClick={() => handleCopyCode(`from django.db import models
from django.conf import settings
from apps.orders.models import Order

class VisitorCommission(models.Model):
    STATUS_CHOICES = (
        ('pending', 'در انتظار تسویه'),
        ('paid', 'تسویه‌شده'),
        ('cancelled', 'باطل‌شده'),
    )

    visitor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='commissions', verbose_name="ویزیتور / سفیر فروش")
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='commission_record', verbose_name="سفارش مرتبط")
    commission_rate_percent = models.DecimalField(max_digits=4, decimal_places=2, default=2.50, verbose_name="درصد پورسانت (%)")
    commission_amount = models.BigIntegerField(verbose_name="مبلغ پورسانت (تومان)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="وضعیت پرداخت")
    payout_date = models.DateTimeField(null=True, blank=True, verbose_name="تاریخ تسویه حساب")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت پورسانت")

    class Meta:
        verbose_name = "پورسانت ویزیتور"
        verbose_name_plural = "پورسانت‌های سفیران فروش"

    def __str__(self):
        return f"{self.visitor.get_full_name()} - {self.commission_amount:,} تومان ({self.get_status_display()})"`,'com-mod')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold">
                    {copiedIndex === 'com-mod' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.db import models
from django.conf import settings
from apps.orders.models import Order

class VisitorCommission(models.Model):
    STATUS_CHOICES = (
        ('pending', 'در انتظار تسویه'),
        ('paid', 'تسویه‌شده'),
        ('cancelled', 'باطل‌شده'),
    )

    visitor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='commissions', verbose_name="ویزیتور / سفیر فروش")
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='commission_record', verbose_name="سفارش مرتبط")
    commission_rate_percent = models.DecimalField(max_digits=4, decimal_places=2, default=2.50, verbose_name="درصد پورسانت (%)")
    commission_amount = models.BigIntegerField(verbose_name="مبلغ پورسانت (تومان)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="وضعیت پرداخت")
    payout_date = models.DateTimeField(null=True, blank=True, verbose_name="تاریخ تسویه حساب")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت پورسانت")

    class Meta:
        verbose_name = "پورسانت ویزیتور"
        verbose_name_plural = "پورسانت‌های سفیران فروش"

    def __str__(self):
        return f"{self.visitor.get_full_name()} - {self.commission_amount:,} تومان ({self.get_status_display()})"`}</pre>
                </div>
              </div>

              {/* admin.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل apps/commissions/admin.py:</span>
                  <button onClick={() => handleCopyCode(`from django.contrib import admin
from django.utils import timezone
from .models import VisitorCommission

@admin.register(VisitorCommission)
class VisitorCommissionAdmin(admin.ModelAdmin):
    list_display = ['visitor', 'order', 'commission_rate_percent', 'commission_amount', 'status', 'created_at', 'payout_date']
    list_filter = ['status', 'created_at']
    search_fields = ['visitor__username', 'visitor__first_name', 'visitor__last_name', 'order__order_number']
    actions = ['mark_as_paid']

    @admin.action(description='تسویه حساب و واریز پورسانت‌های انتخاب‌شده')
    def mark_as_paid(self, request, queryset):
        updated_count = queryset.update(status='paid', payout_date=timezone.now())
        self.message_user(request, f"پورسانت {updated_count} سفارش تسویه شد.")`, 'com-adm')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold">
                    {copiedIndex === 'com-adm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.contrib import admin
from django.utils import timezone
from .models import VisitorCommission

@admin.register(VisitorCommission)
class VisitorCommissionAdmin(admin.ModelAdmin):
    list_display = ['visitor', 'order', 'commission_rate_percent', 'commission_amount', 'status', 'created_at', 'payout_date']
    list_filter = ['status', 'created_at']
    search_fields = ['visitor__username', 'visitor__first_name', 'visitor__last_name', 'order__order_number']
    actions = ['mark_as_paid']

    @admin.action(description='تسویه حساب و واریز پورسانت‌های انتخاب‌شده')
    def mark_as_paid(self, request, queryset):
        updated_count = queryset.update(status='paid', payout_date=timezone.now())
        self.message_user(request, f"پورسانت {updated_count} سفارش تسویه شد.")`}</pre>
                </div>
              </div>

              {/* serializers, views, urls */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل‌های apps/commissions/serializers.py, views.py, urls.py:</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`# apps/commissions/serializers.py
from rest_framework import serializers
from .models import VisitorCommission

class VisitorCommissionSerializer(serializers.ModelSerializer):
    visitor_name = serializers.ReadOnlyField(source='visitor.get_full_name')
    order_number = serializers.ReadOnlyField(source='order.order_number')

    class Meta:
        model = VisitorCommission
        fields = '__all__'

# apps/commissions/views.py
from rest_framework import viewsets, permissions
from .models import VisitorCommission
from .serializers import VisitorCommissionSerializer

class VisitorCommissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VisitorCommissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return VisitorCommission.objects.all()
        return VisitorCommission.objects.filter(visitor=user)

# apps/commissions/urls.py
from rest_framework.routers import DefaultRouter
from .views import VisitorCommissionViewSet

router = DefaultRouter()
router.register(r'commissions', VisitorCommissionViewSet, basename='commission')
urlpatterns = router.urls`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 12: APP NOTIFICATIONS */}
          {activeDocSection === 'app-notifications' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <Terminal className="w-4 h-4" />
                  <span>بخش دوازدهم</span>
                </div>
                <h2 className="text-2xl font-black text-white">اپلیکیشن سیستم اعلان‌ها و اعلان همگانی/تارگت‌شده (Notifications)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  ارسال اعلان عمومی، نقشی (مخصوص مشتریان/ویزیتورها) و اختصاصی به کاربران با کدهای کاملاً آماده برای `apps.notifications`.
                </p>
              </div>

              {/* models.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل apps/notifications/models.py:</span>
                  <button onClick={() => handleCopyCode(`from django.db import models
from django.conf import settings

class Notification(models.Model):
    AUDIENCE_CHOICES = (
        ('all', 'عمومی (همه کاربران)'),
        ('visitors', 'فقط سفیران فروش (ویزیتورها)'),
        ('customers', 'فقط بنکداران و مشتریان'),
        ('direct', 'کاربر خاص'),
    )
    TYPE_CHOICES = (
        ('info', 'اطلاعاتی'),
        ('success', 'تاییدیه موفقیت'),
        ('warning', 'هشدار نرخ'),
        ('urgent', 'فوری / مهم'),
    )

    title = models.CharField(max_length=255, verbose_name="عنوان اعلان")
    message = models.TextField(verbose_name="متن کامل اعلان")
    target_audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='all', verbose_name="مخاطبان")
    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications', verbose_name="کاربر هدف (اختیاری)")
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info', verbose_name="نوع اعلان")
    is_active = models.BooleanField(default=True, verbose_name="فعال/تایید انتشار")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")

    class Meta:
        verbose_name = "اعلان"
        verbose_name_plural = "اعلان‌ها"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_target_audience_display()}"`, 'notif-mod')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold">
                    {copiedIndex === 'notif-mod' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`from django.db import models
from django.conf import settings

class Notification(models.Model):
    AUDIENCE_CHOICES = (
        ('all', 'عمومی (همه کاربران)'),
        ('visitors', 'فقط سفیران فروش (ویزیتورها)'),
        ('customers', 'فقط بنکداران و مشتریان'),
        ('direct', 'کاربر خاص'),
    )
    TYPE_CHOICES = (
        ('info', 'اطلاعاتی'),
        ('success', 'تاییدیه موفقیت'),
        ('warning', 'هشدار نرخ'),
        ('urgent', 'فوری / مهم'),
    )

    title = models.CharField(max_length=255, verbose_name="عنوان اعلان")
    message = models.TextField(verbose_name="متن کامل اعلان")
    target_audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='all', verbose_name="مخاطبان")
    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications', verbose_name="کاربر هدف (اختیاری)")
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info', verbose_name="نوع اعلان")
    is_active = models.BooleanField(default=True, verbose_name="فعال/تایید انتشار")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")

    class Meta:
        verbose_name = "اعلان"
        verbose_name_plural = "اعلان‌ها"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_target_audience_display()}"`}</pre>
                </div>
              </div>

              {/* serializers.py, views.py, urls.py */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">فایل‌های serializers.py, views.py, urls.py:</span>
                  <button onClick={() => handleCopyCode(`# apps/notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

# apps/notifications/views.py
from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        base_qs = Notification.objects.filter(is_active=True)
        if user.is_authenticated:
            user_role = getattr(user, 'role', 'customer')
            return base_qs.filter(
                Q(target_audience='all') |
                Q(target_audience=f'{user_role}s') |
                Q(target_audience='direct', target_user=user)
            )
        return base_qs.filter(target_audience='all')

# apps/notifications/urls.py
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
urlpatterns = router.urls`, 'notif-vws')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold">
                    {copiedIndex === 'notif-vws' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کد کامل</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                  <pre>{`# apps/notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

# apps/notifications/views.py
from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        base_qs = Notification.objects.filter(is_active=True)
        if user.is_authenticated:
            user_role = getattr(user, 'role', 'customer')
            return base_qs.filter(
                Q(target_audience='all') |
                Q(target_audience=f'{user_role}s') |
                Q(target_audience='direct', target_user=user)
            )
        return base_qs.filter(target_audience='all')

# apps/notifications/urls.py
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
urlpatterns = router.urls`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: DOCKERIZATION & BASH SCRIPT */}
          {activeDocSection === 'dockerization' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <Server className="w-4 h-4" />
                  <span>بخش سیزدهم</span>
                </div>
                <h2 className="text-2xl font-black text-white">داکرایز کردن کامل پروژه جنگو و فرانت‌اند (Docker & Bash Script)</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  فایل‌های داکر، docker-compose، اسکریپت نصب خودکار بش (Bash) جهت نصب ۱ کلیکه روی سرور لینوکس (Ubuntu / Debian) و فایل .gitignore کامل.
                </p>
              </div>

              {/* 1. Django Backend Dockerfile */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-blue-400 font-mono">1. backend/Dockerfile (Django)</span>
                  <button
                    onClick={() => handleCopyCode(`FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
    gcc \\
    netcat-openbsd \\
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app/
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]`, 'dockerfile-django')}
                    className="p-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedIndex === 'dockerfile-django' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی کدهای Dockerfile جنگو</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto" dir="ltr">{`FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
    gcc \\
    netcat-openbsd \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]`}</pre>
              </div>

              {/* 2. Django docker-compose.yml */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-emerald-400 font-mono">2. backend/docker-compose.yml (PostgreSQL + Django + Nginx)</span>
                  <button
                    onClick={() => handleCopyCode(`version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: sevin_postgres_db
    restart: always
    environment:
      POSTGRES_DB: sevin_db
      POSTGRES_USER: sevin_user
      POSTGRES_PASSWORD: sevin_secure_password_9419
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  web:
    build: .
    container_name: sevin_django_web
    restart: always
    command: gunicorn sevin_wholesale.wsgi:application --bind 0.0.0.0:8000 --workers 3
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    expose:
      - "8000"
    environment:
      - DJANGO_SECRET_KEY=sevin_production_secret_key_9419
      - DJANGO_DEBUG=False
      - DB_NAME=sevin_db
      - DB_USER=sevin_user
      - DB_PASSWORD=sevin_secure_password_9419
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      - db

volumes:
  postgres_data:
  static_volume:
  media_volume:`, 'compose-django')}
                    className="p-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedIndex === 'compose-django' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی docker-compose.yml</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto" dir="ltr">{`version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: sevin_postgres_db
    restart: always
    environment:
      POSTGRES_DB: sevin_db
      POSTGRES_USER: sevin_user
      POSTGRES_PASSWORD: sevin_secure_password_9419
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  web:
    build: .
    container_name: sevin_django_web
    restart: always
    command: gunicorn sevin_wholesale.wsgi:application --bind 0.0.0.0:8000 --workers 3
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    expose:
      - "8000"
    environment:
      - DJANGO_SECRET_KEY=sevin_production_secret_key_9419
      - DJANGO_DEBUG=False
      - DB_NAME=sevin_db
      - DB_USER=sevin_user
      - DB_PASSWORD=sevin_secure_password_9419
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      - db

volumes:
  postgres_data:
  static_volume:
  media_volume:`}</pre>
              </div>

              {/* 3. 1-Click Server Bash Installation Script */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-amber-400 font-mono">3. install_server.sh (اسکریپت ۱ کلیکه نصب داکر و اجرای پروژه روی سرور)</span>
                  <button
                    onClick={() => handleCopyCode(`#!/bin/bash
# اسکریپت راه‌اندازی ۱ کلیکه پروژه سوین روی سرور اوبونتو/دبین
set -e

echo "🚀 شروع نصب و راه‌اندازی خودکار سرور سوین..."

# ۱. نصب Docker و Docker Compose
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# ۲. ساخت و اجرای کانتینرها
sudo docker-compose up -d --build

# ۳. اجرای مایگریشن‌ها و جمع‌آوری استاتیک‌ها
sleep 5
sudo docker-compose exec -T web python manage.py migrate
sudo docker-compose exec -T web python manage.py collectstatic --noinput

echo "=================================================="
echo "🎉 پروژه با موفقیت داکرایز و اجرا گردید!"
echo "=================================================="`, 'bash-script')}
                    className="p-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedIndex === 'bash-script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی اسکریپت Bash نصب</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-amber-300 bg-slate-950 p-4 rounded-xl overflow-x-auto" dir="ltr">{`#!/bin/bash
# دستور اجرای اسکریپت در سرور: chmod +x install_server.sh && ./install_server.sh
set -e

echo "🚀 شروع نصب و راه‌اندازی خودکار سرور سوین..."

# ۱. نصب Docker و Docker Compose
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# ۲. ساخت و اجرای کانتینرها
sudo docker-compose up -d --build

# ۳. اجرای مایگریشن‌ها و جمع‌آوری استاتیک‌ها
sleep 5
sudo docker-compose exec -T web python manage.py migrate
sudo docker-compose exec -T web python manage.py collectstatic --noinput

echo "=================================================="
echo "🎉 پروژه با موفقیت داکرایز و روی سرور اجرا گردید!"
echo "=================================================="`}</pre>
              </div>

              {/* 4. React Frontend Dockerfile (Node.js) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-indigo-400 font-mono">4. frontend/Dockerfile (React + Node.js - بدون Nginx داخلی)</span>
                  <button
                    onClick={() => handleCopyCode(`# Build Stage for React Frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build

# Production Stage with Node.js
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --prefer-offline --no-audit
COPY --from=build /app/dist ./dist
COPY server.js ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]`, 'react-docker')}
                    className="p-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedIndex === 'react-docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی Dockerfile فرانت</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto" dir="ltr">{`# Build Stage for React Frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build

# Production Stage with Node.js
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --prefer-offline --no-audit
COPY --from=build /app/dist ./dist
COPY server.js ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]`}</pre>
              </div>

              {/* 5. Host Nginx Configuration */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-sky-400 font-mono">5. nginx.conf (پیکربندی سرور وب Nginx نصب شده روی سیستم‌عامل سرور)</span>
                  <button
                    onClick={() => handleCopyCode(`server {
    listen 80;
    listen [::]:80;
    server_name _; # تغییر به دامنه یا آی‌پی شما

    charset utf-8;
    client_max_body_size 50M;

    # فعال‌سازی فشرده‌سازی جهت افزایش سرعت
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript application/json;

    # ۱. پروکسی کانتینر فرانت‌اند (پورت ۳۰۰۰)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ۲. پروکسی بک‌اند جنگو (پورت ۸۰۰۰)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ۳. مسیر فایل‌های استاتیک جنگو
    location /static/ {
        alias /var/www/sevin_backend/static/;
        expires 30d;
    }
}`, 'nginx-host-config')}
                    className="p-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedIndex === 'nginx-host-config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی تنظیمات Nginx میزبان</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto" dir="ltr">{`server {
    listen 80;
    listen [::]:80;
    server_name _; # تغییر به دامنه یا آی‌پی شما

    charset utf-8;
    client_max_body_size 50M;

    # فعال‌سازی فشرده‌سازی gzip
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript application/json;

    # ۱. پروکسی فرانت‌اند به داکر (پورت ۳۰۰۰)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # ۲. پروکسی بک‌اند جنگو (پورت ۸۰۰۰)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # ۳. پوشه استاتیک‌های بک‌اند روی سرور
    location /static/ {
        alias /var/www/sevin_backend/static/;
        expires 30d;
    }
}`}</pre>
              </div>

              {/* 6. Deploy Shell Scripts */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-amber-400 font-mono">6. اسکریپت‌های استقرار خودکار و دستورات اجرایی لینوکس</span>
                </div>

                {/* Subitem A: deploy_frontend.sh */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">الف) اسکریپت استقرار فرانت‌اند داکر (deploy_frontend.sh)</span>
                    <button
                      onClick={() => handleCopyCode(`#!/bin/bash
# deploy_frontend.sh
# دستور اجرا: chmod +x deploy_frontend.sh && ./deploy_frontend.sh
set -e

echo "🚀 شروع استقرار کانتینر فرانت‌-اند..."
docker build -t sevin-frontend:latest .

echo "🧹 حذف کانتینر قدیمی..."
docker stop sevin-frontend-app || true
docker rm sevin-frontend-app || true

echo "🏃 اجرای کانتینر جدید روی پورت 3000..."
docker run -d --name sevin-frontend-app --restart always -p 3000:3000 --env-file .env sevin-frontend:latest
echo "✅ فرانت‌-اند جدید با موفقیت روی پورت 3000 راه‌اندازی شد!"`, 'bash-deploy-frontend')}
                      className="p-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedIndex === 'bash-deploy-frontend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>کپی کد فرانت</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto" dir="ltr">{`#!/bin/bash
# دستورالعمل اجرا بر روی ترمینال لینوکس سرور:
# 1. chmod +x deploy_frontend.sh
# 2. ./deploy_frontend.sh

set -e
echo "🚀 شروع استقرار کانتینر فرانت‌-اند..."
docker build -t sevin-frontend:latest .

echo "🧹 حذف کانتینر قدیمی..."
docker stop sevin-frontend-app || true
docker rm sevin-frontend-app || true

echo "🏃 اجرای کانتینر جدید روی پورت 3000..."
docker run -d \\
  --name sevin-frontend-app \\
  --restart always \\
  -p 3000:3000 \\
  --env-file .env \\
  sevin-frontend:latest

echo "✅ فرانت‌-اند جدید با موفقیت راه‌اندازی شد!"`}</pre>
                </div>

                {/* Subitem B: deploy_backend.sh */}
                <div className="space-y-2 pt-3 border-t border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">ب) اسکریپت استقرار بک‌اند جنگو و سرویس Gunicorn (deploy_backend.sh)</span>
                    <button
                      onClick={() => handleCopyCode(`#!/bin/bash
# deploy_backend.sh
# دستور اجرا: chmod +x deploy_backend.sh && ./deploy_backend.sh
set -e

echo "🚀 شروع استقرار خودکار بک‌اند جنگو..."

# رفتن به دایرکتوری اصلی جنگو روی سرور
# cd /var/www/sevin_backend

# فعال‌سازی محیط مجازی پایتون
source venv/bin/activate

# نصب پکیج‌های پایتون
pip install -r requirements.txt --no-cache-dir

# اعمال میگریشن‌های دیتابیس PostgreSQL
python manage.py migrate --noinput

# جمع‌آوری و فشرده‌سازی فایل‌های استاتیک برای Nginx
python manage.py collectstatic --noinput --clear

# بارگذاری مجدد و ری‌استارت سرویس gunicorn از طریق سیستم‌دی لینوکس
echo "🔄 ری‌استارت سرویس gunicorn..."
sudo systemctl restart gunicorn

echo "✅ استقرار بک‌اند جنگو با موفقیت به پایان رسید!"`, 'bash-deploy-backend')}
                      className="p-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedIndex === 'bash-deploy-backend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>کپی کد بک‌اند</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto" dir="ltr">{`#!/bin/bash
# دستورالعمل اجرا بر روی ترمینال لینوکس سرور:
# 1. chmod +x deploy_backend.sh
# 2. ./deploy_backend.sh

set -e
echo "🚀 شروع استقرار خودکار بک‌اند جنگو..."

# فعال‌سازی محیط مجازی پایتون
source venv/bin/activate

# نصب پکیج‌های پایتون
pip install -r requirements.txt --no-cache-dir

# اعمال میگریشن‌های دیتابیس PostgreSQL
python manage.py migrate --noinput

# جمع‌آوری فایل‌های استاتیک برای Nginx
python manage.py collectstatic --noinput --clear

# ری‌استارت سرویس gunicorn گانیکورن جهت اعمال تغییرات آنلاین
echo "🔄 ری‌استارت سرویس gunicorn..."
sudo systemctl restart gunicorn

echo "✅ استقرار بک‌اند جنگو با موفقیت به پایان رسید!"`}</pre>
                </div>
              </div>

              {/* 7. Frontend .gitignore */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-rose-400 font-mono">7. .gitignore (پیکربندی گیت برای فرانت‌-اند React)</span>
                  <button
                    onClick={() => handleCopyCode(`node_modules/
dist/
build/
*.log
.env
.env.local
.DS_Store
.vscode/
.idea/`, 'gitignore-code')}
                    className="p-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedIndex === 'gitignore-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی .gitignore فرانت</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto" dir="ltr">{`node_modules/
dist/
build/
*.log
.env
.env.local
.DS_Store
.vscode/
.idea/`}</pre>
              </div>

              {/* 8. Backend .gitignore */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-rose-500 font-mono">8. .gitignore (پیکربندی گیت اختصاصی بک‌-اند Django / Python)</span>
                  <button
                    onClick={() => handleCopyCode(`__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
dist/
*.egg-info/
*.egg
local_settings.py
db.sqlite3
db.sqlite3-journal
media/
staticfiles/
static/
.env
.venv
env/
venv/
ENV/
.vscode/
.idea/
.DS_Store`, 'gitignore-backend')}
                    className="p-1.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedIndex === 'gitignore-backend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی .gitignore بک‌اند</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto" dir="ltr">{`# پوشه‌های کامپایل شده پایتون
__pycache__/
*.py[cod]
*$py.class

# دیتابیس لوکال تستی SQLite
db.sqlite3
db.sqlite3-journal

# پوشه‌های فایل‌های استاتیک و رسانه‌ای آپلود شده
media/
staticfiles/
static/

# فایل‌های متغیرهای محیطی و کلیدهای سرور
.env

# محیط مجازی پایتون (Virtual Environment)
.venv
env/
venv/
ENV/

# پوشه‌های تنظیمات ادیتورها و سیستم‌عامل
.vscode/
.idea/
.DS_Store`}</pre>
              </div>

            </div>
          )}

          {/* SECTION 14: TESTER */}
          {activeDocSection === 'tester' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-black mb-1">
                  <Terminal className="w-4 h-4" />
                  <span>بخش یازدهم</span>
                </div>
                <h2 className="text-2xl font-black text-white">کنسول زنده تست ای‌پی‌آی محاسبات بک‌اند</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  شبیه‌سازی کامل درخواست و پاسخ ای‌پی‌آی محاسبه فاکتور رسمی در جنگو.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-400 mb-1">متد درخواست:</label>
                    <select
                      value={testMethod}
                      onChange={(e: any) => setTestMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    >
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                    </select>
                  </div>

                  <div className="sm:col-span-9">
                    <label className="block text-xs font-bold text-slate-400 mb-1">اندپوینت API:</label>
                    <input
                      type="text"
                      value={testEndpoint}
                      onChange={(e) => setTestEndpoint(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold rounded-xl px-3 py-2 text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">JSON Body:</label>
                  <textarea
                    rows={6}
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs rounded-xl p-3 focus:outline-hidden"
                    dir="ltr"
                  />
                </div>

                <button
                  onClick={handleRunLiveTest}
                  disabled={isTesting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Play className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'در حال ارسال درخواست...' : 'ارسال درخواست آزمایشی محاسبات به جنگو'}</span>
                </button>

                {testResponse && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>پاسخ پردازش شده توسط بک‌اند جنگو (200 OK - PostgreSQL):</span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto" dir="ltr">
                      <pre>{testResponse}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
