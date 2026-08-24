import React, { useState } from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileCode, 
  Settings, 
  Database, 
  Key, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const BeginnerSetupDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const steps = [
    { id: 1, title: 'گام ۱: نصب پایتون و ایجاد محیط مجازی (Virtualenv)', tag: 'پیشنیاز' },
    { id: 2, title: 'گام ۲: ایجاد فایل requirements.txt و نصب پکیج‌ها', tag: 'پکیج‌ها' },
    { id: 3, title: 'گام ۳: ساخت دیتابیس PostgreSQL و کاربر اختصاصی', tag: 'دیتابیس' },
    { id: 4, title: 'گام ۴: ساخت پروژه جنگو و فایل پیکربندی settings.py', tag: 'تنظیمات اصلی' },
    { id: 5, title: 'گام ۵: تنظیم JWT (با انقضای ۳۰ دقیقه) و TinyMCE و Swagger', tag: 'امنیت و ابزارها' },
    { id: 6, title: 'گام ۶: پیکربندی فایل اصلی urls.py و روت‌های ریشه', tag: 'مسیرها' },
    { id: 7, title: 'گام ۷: اجرای مایگریشن‌ها و ایجاد کاربر ادمین', tag: 'راه‌اندازی نهایی' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-blue-700 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>راهنمای گام‌به‌گام از صفر مطلق برای افراد مبتدی</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            راه‌اندازی کامل بک‌اند پروژه در Django 5 + PostgreSQL
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-3xl">
            در این بخش از اولین دستور ساخت محیط مجازی تا اتصال به پایگاه‌داده PostgreSQL، احراز هویت امن با JWT (انقضای دقیق ۳۰ دقیقه)، ویرایشگر متنی TinyMCE، و مستندسازی تعاملی Swagger و ReDoc را خط به خط یاد خواهید گرفت.
          </p>
        </div>
      </div>

      {/* Step Navigator Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        {steps.map(step => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
              activeStep === step.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
              activeStep === step.id ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-700'
            }`}>
              {step.id}
            </span>
            <span>{step.title.split(':')[1] || step.title}</span>
          </button>
        ))}
      </div>

      {/* STEP 1: Python & Virtual Environment */}
      {activeStep === 1 && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">گام اول</span>
            <h2 className="text-xl font-black text-slate-900 mt-2">ایجاد و فعال‌سازی محیط مجازی پایتون (Virtual Environment)</h2>
            <p className="text-xs text-slate-500 mt-1">
              محیط مجازی تضمین می‌کند پکیج‌های این پروژه با سایر پروژه‌های سیستم شما تداخل پیدا نکنند.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">دستورات ترمینال در لینوکس / مک / ویندوز:</h3>
            
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <span>Terminal (Bash / PowerShell)</span>
                <button
                  onClick={() => handleCopy('step1', `# ۱. رفتن به پوشه مد نظر
mkdir sevin_backend && cd sevin_backend

# ۲. ایجاد محیط مجازی پایتون 3
python3 -m venv venv

# ۳. فعال‌سازی محیط مجازی در لینوکس/مک:
source venv/bin/activate

# یا در ویندوز (PowerShell):
# .\\venv\\Scripts\\Activate.ps1

# ۴. ارتقای ابزار pip
pip install --upgrade pip`)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white"
                >
                  {copiedKey === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'step1' ? 'کپی شد' : 'کپی دستورات'}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-emerald-400" dir="ltr">
{`# 1. ساخت پوشه پروژه و ورود به آن
mkdir sevin_backend && cd sevin_backend

# 2. ساخت Virtual Environment با پایتون نسخه ۳
python3 -m venv venv

# 3. فعال‌سازی محیط مجازی (در لینوکس و مک):
source venv/bin/activate

# در صورت استفاده از ویندوز:
# .\\venv\\Scripts\\activate

# 4. آپدیت pip برای نصب سریع‌تر
pip install --upgrade pip`}
              </pre>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>نکته مهم برای مبتدیان:</span>
              </div>
              <p>
                وقتی محیط مجازی فعال است، ابتدای خط فرمان ترمینال شما عبارت <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono" dir="ltr">(venv)</code> ظاهر می‌شود. این به معنای آماده بودن برای نصب پکیج‌هاست.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* STEP 2: requirements.txt */}
      {activeStep === 2 && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">گام دوم</span>
            <h2 className="text-xl font-black text-slate-900 mt-2">تعریف فایل requirements.txt و نصب کلیه کتابخانه‌ها</h2>
            <p className="text-xs text-slate-500 mt-1">
              تمامی وابستگی‌های فریم‌ورک جنگو، REST API، پایگاه داده PostgreSQL، احراز هویت JWT، ویرایشگر TinyMCE و مستندساز Swagger در این فایل آورده شده است.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <span>requirements.txt</span>
                <button
                  onClick={() => handleCopy('req', `Django>=5.0.0,<6.0.0
djangorestframework>=3.14.0
djangorestframework-simplejwt>=5.3.0
drf-yasg>=1.21.7
django-cors-headers>=4.3.1
django-filter>=23.5
psycopg2-binary>=2.9.9
django-tinymce>=4.1.0
Pillow>=10.2.0
python-dotenv>=1.0.1
gunicorn>=21.2.0`)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white"
                >
                  {copiedKey === 'req' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'req' ? 'کپی شد' : 'کپی فایل requirements.txt'}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sky-300" dir="ltr">
{`Django>=5.0.0,<6.0.0
djangorestframework>=3.14.0
djangorestframework-simplejwt>=5.3.0
drf-yasg>=1.21.7
django-cors-headers>=4.3.1
django-filter>=23.5
psycopg2-binary>=2.9.9
django-tinymce>=4.1.0
Pillow>=10.2.0
python-dotenv>=1.0.1
gunicorn>=21.2.0`}
              </pre>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800">دستور نصب پکیج‌ها در ترمینال:</div>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs" dir="ltr">
pip install -r requirements.txt
              </pre>
            </div>

            {/* Explanations of each package */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 font-mono text-xs" dir="ltr">djangorestframework-simplejwt</div>
                <p className="text-[11px] text-slate-600">صدور توکن‌های JWT، مدیریت نشست کاربر و امکان خروج/بلک‌لیست توکن پس از ۳۰ دقیقه.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 font-mono text-xs" dir="ltr">drf-yasg</div>
                <p className="text-[11px] text-slate-600">تولید خودکار مستندات گرافیکی و تعاملی Swagger OpenAPI و ReDoc برای تست APIها.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 font-mono text-xs" dir="ltr">django-tinymce</div>
                <p className="text-[11px] text-slate-600">افزودن ویرایشگر متن غنی (WYSIWYG) با پشتیبانی راست‌چین (RTL) به مقالات و توضیحات محصول.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 font-mono text-xs" dir="ltr">psycopg2-binary</div>
                <p className="text-[11px] text-slate-600">درایور پرسرعت C/Python برای اتصال بدون وقفه جنگو به دیتابیس PostgreSQL.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STEP 3: PostgreSQL Database Setup */}
      {activeStep === 3 && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">گام سوم</span>
            <h2 className="text-xl font-black text-slate-900 mt-2">ساخت دیتابیس PostgreSQL، کاربر و رمز عبور</h2>
            <p className="text-xs text-slate-500 mt-1">
              اجرای دستورات استاندارد SQL در شل PostgreSQL جهت ایجاد پایگاه داده امن برای ذخیره اطلاعات عمده‌فروشی.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <span>PostgreSQL Console (psql)</span>
                <button
                  onClick={() => handleCopy('psql', `-- ورود به محیط کاربری postgres
sudo -u postgres psql

-- ۱. ساخت دیتابیس اختصاصی
CREATE DATABASE sevin_db ENCODING 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';

-- ۲. ساخت کاربر دیتابیس با رمز عبور قوی
CREATE USER sevin_user WITH PASSWORD 'SevinStrongPass123!@#';

-- ۳. تنظیم پارامترهای بهینه جنگو
ALTER ROLE sevin_user SET client_encoding TO 'utf8';
ALTER ROLE sevin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sevin_user SET timezone TO 'Asia/Tehran';

-- ۴. اعطای کلیه دسترسی‌ها به کاربر
GRANT ALL PRIVILEGES ON DATABASE sevin_db TO sevin_user;
ALTER DATABASE sevin_db OWNER TO sevin_user;

-- خروج از محیط psql
\\q`)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white"
                >
                  {copiedKey === 'psql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'psql' ? 'کپی شد' : 'کپی دستورات SQL'}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-amber-300" dir="ltr">
{`# 1. ورود به شل PostgreSQL
sudo -u postgres psql

# 2. ایجاد دیتابیس با انکودینگ UTF8
CREATE DATABASE sevin_db ENCODING 'UTF8';

# 3. ساخت کاربر دیتابیس
CREATE USER sevin_user WITH PASSWORD 'SevinStrongPass123!@#';

# 4. بهینه‌سازی تایم‌زون و تراکنش‌ها برای جنگو
ALTER ROLE sevin_user SET client_encoding TO 'utf8';
ALTER ROLE sevin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sevin_user SET timezone TO 'Asia/Tehran';

# 5. واگذاری تمام مجوزها
GRANT ALL PRIVILEGES ON DATABASE sevin_db TO sevin_user;
ALTER DATABASE sevin_db OWNER TO sevin_user;

# 6. خروج
\\q`}
              </pre>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs space-y-1 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>فایل متغیرهای محیطی .env پیشنهادی:</span>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] mt-2 overflow-x-auto" dir="ltr">
{`DEBUG=True
SECRET_KEY=django-insecure-sevin-smoke-super-secret-key-2026!
DB_NAME=sevin_db
DB_USER=sevin_user
DB_PASSWORD=SevinStrongPass123!@#
DB_HOST=127.0.0.1
DB_PORT=5432
ALLOWED_HOSTS=127.0.0.1,localhost,0.0.0.0`}
              </pre>
            </div>
          </div>
        </section>
      )}

      {/* STEP 4 & 5: settings.py with JWT 30-min expiration & TinyMCE */}
      {activeStep === 4 && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">گام چهارم</span>
            <h2 className="text-xl font-black text-slate-900 mt-2">پیکربندی کامل فایل settings.py جنگو</h2>
            <p className="text-xs text-slate-500 mt-1">
              تنظیم دیتابیس PostgreSQL، اپلیکیشن‌های ماژولار، احراز هویت اختصاصی بر پایه شماره همراه و زبان فارسی.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>sevin_project/settings.py (بخش دیتابیس و اپ‌ها)</span>
              <button
                onClick={() => handleCopy('settings1', `import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-sevin-2026-key')
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    # جنگو پیش‌فرض
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # پکیج‌های ثالث
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_yasg',
    'tinymce',
    'django_filters',

    # اپلیکیشن‌های ماژولار سوین
    'accounts',
    'catalog',
    'orders',
    'shipping',
    'tickets',
    'visitors',
    'blog',
]

AUTH_USER_MODEL = 'accounts.User'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'sevin_db',
        'USER': 'sevin_user',
        'PASSWORD': 'SevinStrongPass123!@#',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}

LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True`)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedKey === 'settings1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'settings1' ? 'کپی شد' : 'کپی کد تنظیمات'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-300" dir="ltr">
{`INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # ابزارهای Rest API و امنیت
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_yasg',
    'tinymce',
    'django_filters',

    # اپلیکیشن‌های اختصاصی پروژه
    'accounts',
    'catalog',
    'orders',
    'shipping',
    'tickets',
    'visitors',
    'blog',
]

AUTH_USER_MODEL = 'accounts.User'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'sevin_db',
        'USER': 'sevin_user',
        'PASSWORD': 'SevinStrongPass123!@#',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}

LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'`}
            </pre>
          </div>
        </section>
      )}

      {/* STEP 5: JWT 30 Minutes + TinyMCE + Swagger configs */}
      {activeStep === 5 && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">گام پنجم</span>
            <h2 className="text-xl font-black text-slate-900 mt-2">تنظیم JWT (با خروج خودکار بعد از ۳۰ دقیقه) و TinyMCE و Swagger</h2>
            <p className="text-xs text-slate-500 mt-1">
              اعمال دقیق تنظیمات انقضای توکن ۳۰ دقیقه‌ای (<code className="font-mono text-blue-600">ACCESS_TOKEN_LIFETIME = timedelta(minutes=30)</code>)، مسدودسازی توکن در زمان خروج، و ویرایشگر پیشرفته فارسی.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <span>sevin_project/settings.py (تنظیمات REST, JWT, TinyMCE, Swagger)</span>
                <button
                  onClick={() => handleCopy('jwt_cfg', `REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ========================================================
# پیکربندی اختصاصی JWT با انقضای دقیق ۳۰ دقیقه و سیستم خروج
# ========================================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),  # خروج و انقضا بعد از ۳۰ دقیقه
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ========================================================
# پیکربندی ادیتور متن TinyMCE فارسی و راست‌چین
# ========================================================
TINYMCE_DEFAULT_CONFIG = {
    'height': 450,
    'width': '100%',
    'cleanup_on_startup': True,
    'custom_undo_redo_levels': 20,
    'selector': 'textarea',
    'theme': 'silver',
    'plugins': '''
        directionality autolink link image lists preview hr
        table code help wordcount visualblocks
    ''',
    'toolbar': '''
        undo redo | formatselect | bold italic underline |
        ltr rtl | alignleft aligncenter alignright alignjustify |
        bullist numlist outdent indent | link image table | code preview
    ''',
    'directionality': 'rtl',
    'language': 'fa',
    'menubar': True,
    'statusbar': True,
}

# ========================================================
# تنظیمات Swagger / ReDoc برای هدر Bearer Token
# ========================================================
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'توکن JWT را به فرمت مقابل وارد کنید: Bearer <Your_Token>'
        }
    },
    'USE_SESSION_AUTH': False,
}`)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white"
                >
                  {copiedKey === 'jwt_cfg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'jwt_cfg' ? 'کپی شد' : 'کپی کانفیگ امنیتی'}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-amber-300" dir="ltr">
{`REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# انقضای ۳۰ دقیقه‌ای نشست کاربر + بلک‌لیست توکن در خروج
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# تنظیمات ادیتور متن TinyMCE راست‌چین
TINYMCE_DEFAULT_CONFIG = {
    'height': 420,
    'directionality': 'rtl',
    'plugins': 'directionality autolink link image lists table code preview',
    'toolbar': 'undo redo | formatselect | bold italic | ltr rtl | bullist numlist | link image | code',
}

# تنظیمات سواگر جهت ارسال خودکار توکن
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    }
}`}
              </pre>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">توضیح زمان انقضای ۳۰ دقیقه:</span>
                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  با تنظیم <code className="font-mono bg-emerald-200/50 px-1 py-0.5 rounded" dir="ltr">ACCESS_TOKEN_LIFETIME = timedelta(minutes=30)</code>، هر توکن دسترسی دقیقا پس از ۳۰ دقیقه منقضی می‌شود. کاربر در صورت عدم تمدید توکن با Refresh Token به صورت خودکار از حساب خارج می‌گردد. همچنین با فراخوانی API خروج (Logout)، توکن فوراً در لیست سیاه (Blacklist) قرار می‌گیرد.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STEP 6: Root urls.py with Swagger, ReDoc, TinyMCE */}
      {activeStep === 6 && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">گام ششم</span>
            <h2 className="text-xl font-black text-slate-900 mt-2">پیکربندی فایل ریشه urls.py با Swagger، ReDoc و TinyMCE</h2>
            <p className="text-xs text-slate-500 mt-1">
              تعریف کامل آدرس‌های <code className="font-mono text-blue-600">/swagger/</code> و <code className="font-mono text-blue-600">/redoc/</code> و مسیرهای API کلیه اپلیکیشن‌ها.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>sevin_project/urls.py</span>
              <button
                onClick={() => handleCopy('urls_root', `from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# ساخت اسکیما برای مستندات Swagger و ReDoc
schema_view = get_schema_view(
    openapi.Info(
        title="سامانه جامع پخش و بنکداری عمده دخانیات سوین - REST API",
        default_version='v1',
        description="مستندات رسمی و تعاملی کلیه سرویس‌ها، احراز هویت با شماره تماس، کاتالوگ کارتن و باکس، پیش‌فاکتور، ترابری و باشگاه ویزیتوران",
        terms_of_service="https://sevin-smoke.ir/terms/",
        contact=openapi.Contact(email="info@sevin-smoke.ir"),
        license=openapi.License(name="پروانه اختصاصی سوین"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # پنل ادمین جنگو
    path('admin/', admin.site.urls),

    # مستندات تعاملی Swagger و ReDoc
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # ویرایشگر متنی TinyMCE
    path('tinymce/', include('tinymce.urls')),

    # مسیرهای وب‌سرویس ماژولار (REST API v1)
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/catalog/', include('catalog.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/shipping/', include('shipping.urls')),
    path('api/v1/tickets/', include('tickets.urls')),
    path('api/v1/visitors/', include('visitors.urls')),
    path('api/v1/blog/', include('blog.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)`)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedKey === 'urls_root' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'urls_root' ? 'کپی شد' : 'کپی کد urls.py'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-300" dir="ltr">
{`from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="مستندات REST API سامانه سوین",
        default_version='v1',
        description="سرویس‌های کاتالوگ، سفارشات، کاربران و ویزیتوری",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # مستندات گرافیکی
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # ادیتور متن غنی
    path('tinymce/', include('tinymce.urls')),
    
    # اندپوینت‌های اصلی
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/catalog/', include('catalog.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/shipping/', include('shipping.urls')),
    path('api/v1/tickets/', include('tickets.urls')),
    path('api/v1/visitors/', include('visitors.urls')),
    path('api/v1/blog/', include('blog.urls')),
]`}
            </pre>
          </div>
        </section>
      )}

      {/* STEP 7: Migrations & Superuser */}
      {activeStep === 7 && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">گام هفتم</span>
            <h2 className="text-xl font-black text-slate-900 mt-2">اجرای مایگریشن‌ها، ساخت سوپریوزر و اجرای سرور</h2>
            <p className="text-xs text-slate-500 mt-1">
              دستورات پایانی ساخت جداول در PostgreSQL و اجرای سرور جنگو روی پورت ۸۰۰۰ یا ۳۰۰۰.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>Terminal Run Commands</span>
              <button
                onClick={() => handleCopy('run_cmd', `# ۱. ساخت فایل‌های مایگریشن برای تمامی اپ‌ها
python manage.py makemigrations accounts catalog orders shipping tickets visitors blog

# ۲. اعمال جداول بر روی پایگاه داده PostgreSQL
python manage.py migrate

# ۳. ساخت سوپریوزر (مدیر کل سیستم با شماره موبایل)
python manage.py createsuperuser

# ۴. جمع‌آوری فایل‌های استاتیک
python manage.py collectstatic --noinput

# ۵. اجرای سرور توسعه
python manage.py runserver 0.0.0.0:8000`)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedKey === 'run_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'run_cmd' ? 'کپی شد' : 'کپی دستورات'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-400" dir="ltr">
{`# 1. تولید فایل‌های مایگریشن
python manage.py makemigrations

# 2. ساخت جداول در دیتابیس PostgreSQL
python manage.py migrate

# 3. ایجاد مدیر کل (سوپریوزر)
python manage.py createsuperuser

# 4. اجرای سرور جنگو
python manage.py runserver 0.0.0.0:8000`}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a 
              href="#swagger" 
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all text-center space-y-1 block"
            >
              <div className="font-black text-slate-900 text-xs">آدرس Swagger UI:</div>
              <div className="font-mono text-blue-600 text-xs" dir="ltr">http://localhost:8000/swagger/</div>
            </a>
            <a 
              href="#redoc" 
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all text-center space-y-1 block"
            >
              <div className="font-black text-slate-900 text-xs">آدرس ReDoc:</div>
              <div className="font-mono text-blue-600 text-xs" dir="ltr">http://localhost:8000/redoc/</div>
            </a>
            <a 
              href="#admin" 
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all text-center space-y-1 block"
            >
              <div className="font-black text-slate-900 text-xs">پنل مدیریت ادمین:</div>
              <div className="font-mono text-blue-600 text-xs" dir="ltr">http://localhost:8000/admin/</div>
            </a>
          </div>
        </section>
      )}

    </div>
  );
};
