import React, { useState } from 'react';
import { Settings, Shield, Database, Clock, Image, Globe, Sparkles, FileCode } from 'lucide-react';
import { CodeViewer } from './CodeViewer';

export const DjangoConfigDocs: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'urls' | 'env'>('settings');

  const settingsCode = `"""
azarakhsh_project/settings.py
تنظیمات کامل و استاندارد پروژه جنگو ۵ شامل:
۱. دیتابیس PostgreSQL
۲. احراز هویت با JWT (انقضای دقیق ۳۰ دقیقه برای دسترسی امن و بلک‌لیست توکن)
۳. ویرایشگر متن TinyMCE (پشتیبانی کامل از HTMLField در کاتالوگ و مقالات)
۴. مستندات خودکار OpenAPI 3.0 (drf-spectacular با هدر Bearer)
۵. پشتیبانی از CORS برای ارتباط با فرانت‌اند
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# بارگذاری متغیرهای محیطی از فایل .env
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-sevin-tobacco-production-key-9419@')

DEBUG = os.getenv('DJANGO_DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '*').split(',')

# --------------------------------------------------------------------------
# ۱. اپلیکیشن‌های نصب شده (INSTALLED_APPS)
# --------------------------------------------------------------------------
INSTALLED_APPS = [
    # هسته جنگو
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # پکیج‌های شخص ثالث (Third-Party)
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # بلک‌لیست توکن پس از خروج (Logout)
    'drf_spectacular',                           # سواگر و OpenAPI 3.0 استاندارد
    'corsheaders',                               # هدرهای CORS برای اتصال با فرانت‌اند
    'django_filters',                            # فیلترهای پیشرفته در API
    'tinymce',                                   # ادیتور متن پیشرفته TinyMCE

    # اپلیکیشن‌های اختصاصی پروژه
    'accounts.apps.AccountsConfig',
    'site_settings.apps.SiteSettingsConfig',
    'categories.apps.CategoriesConfig',
    'products.apps.ProductsConfig',
    'orders.apps.OrdersConfig',
    'shipping.apps.ShippingConfig',
    'blog.apps.BlogConfig',
    'tickets.apps.TicketsConfig',
    'visitors.apps.VisitorsConfig',
]

# --------------------------------------------------------------------------
# ۲. میان‌افزارها (MIDDLEWARE)
# --------------------------------------------------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',      # باید در بالاترین ردیف قرار گیرد
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'azarakhsh_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'azarakhsh_project.wsgi.application'

# --------------------------------------------------------------------------
# ۳. دیتابیس PostgreSQL
# --------------------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'azarakhsh_db'),
        'USER': os.getenv('DB_USER', 'azarakhsh_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'SevinStrongPass_9419@Secure'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# --------------------------------------------------------------------------
# ۴. مدل کاربری اختصاصی
# --------------------------------------------------------------------------
AUTH_USER_MODEL = 'accounts.User'

# --------------------------------------------------------------------------
# ۵. تنظیمات REST Framework و drf-spectacular
# --------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
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

# --------------------------------------------------------------------------
# ۶. تنظیمات JWT با انقضای ۳۰ دقیقه‌ای توکن دسترسی
# --------------------------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),   # انقضای ۳۰ دقیقه توکن اکسس
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),       # انقضای ۷ روزه رفرش توکن
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# --------------------------------------------------------------------------
# ۷. تنظیمات TinyMCE (ادیتور غنی متن)
# --------------------------------------------------------------------------
TINYMCE_DEFAULT_CONFIG = {
    'theme': 'silver',
    'height': 450,
    'directionality': 'rtl',
    'language': 'fa',
    'menubar': True,
    'plugins': 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
    'toolbar': 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image link | code help',
}

# --------------------------------------------------------------------------
# ۸. تنظیمات بین‌المللی‌سازی و زمان (Timezone تهران)
# --------------------------------------------------------------------------
LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------------------
# ۹. فایل‌های استاتیک و رسانه‌ها (Static & Media)
# --------------------------------------------------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# --------------------------------------------------------------------------
# ۱۰. تنظیمات CORS
# --------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True  # یا اضافه کردن دامنه‌های فرانت‌اند
`;

  const urlsCode = `"""
azarakhsh_project/urls.py
مسیرهای ریشه، سواگر OpenAPI 3.0، ادیتور TinyMCE و اپلیکیشن‌ها
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # ۱. پنل مدیریت جنگو
    path('admin/', admin.site.urls),

    # ۲. ادیتور TinyMCE
    path('tinymce/', include('tinymce.urls')),

    # ۳. مستندات OpenAPI 3.0 و Swagger
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # ۴. مسیرهای API اپلیکیشن‌ها
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/site-settings/', include('site_settings.urls')),
    path('api/v1/categories/', include('categories.urls')),
    path('api/v1/products/', include('products.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/shipping/', include('shipping.urls')),
    path('api/v1/blog/', include('blog.urls')),
    path('api/v1/tickets/', include('tickets.urls')),
    path('api/v1/visitors/', include('visitors.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
`;

  const envCode = `# .env
DJANGO_SECRET_KEY=django-insecure-azarakhsh-tobacco-super-secret-key-prod-9419@
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=*

# تنظیمات اتصال به دیتابیس PostgreSQL
DB_NAME=azarakhsh_db
DB_USER=azarakhsh_user
DB_PASSWORD=SevinStrongPass_9419@Secure
DB_HOST=localhost
DB_PORT=5432
`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-9 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black flex items-center gap-1.5 font-mono">
              Core Architecture
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
              Django 5.1 LTS • SimpleJWT • TinyMCE
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            کانفیگ جامع settings.py، urls.py و متغیرهای محیطی .env
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed font-medium">
            پیکربندی استاندارد هسته مرکزی پروژه شامل اتصال پایدار به دیتابیس PostgreSQL، تنظیمات احراز هویت با JWT با انقضای ۳۰ دقیقه و قابلیت Blacklist، اتصال به ادیتور TinyMCE و نقشه کامل روت‌های API.
          </p>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
            <Clock className="w-4 h-4" />
            <span>توکن JWT ۳۰ دقیقه</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">انقضای ایمن نیم‌ساعته اکسس توکن</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <Database className="w-4 h-4" />
            <span>PostgreSQL 16</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">پایگاه داده پرسرعت رابطه ای</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
            <Image className="w-4 h-4" />
            <span>ادیتور TinyMCE</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">ویرایشگر غنی متن راست‌چین فارسی</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <Globe className="w-4 h-4" />
            <span>CORS Headers</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">اتصال کامل به فرانت‌اند React</p>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            settings.py (تنظیمات اصلی)
          </button>
          <button
            onClick={() => setActiveSubTab('urls')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'urls'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            urls.py (مسیرهای ریشه و Swagger)
          </button>
          <button
            onClick={() => setActiveSubTab('env')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'env'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            .env (متغیرهای محرمانه محیطی)
          </button>
          <button
            onClick={() => setActiveSubTab('routes')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'routes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Independent Routes (تغییرات جدید)
          </button>
        </div>

        {/* Code Viewer */}
        <CodeViewer
          code={activeSubTab === 'settings' ? settingsCode : activeSubTab === 'urls' ? urlsCode : activeSubTab === 'env' ? envCode : '/* برای مدیریت مستقل مسیرهای فرانت‌اند در جنگو، از TemplateView استفاده کنید:\n\n1. در urls.py:\n   path("shopmanage/", TemplateView.as_view(template_name="shopmanage.html")),\n   path("azarakhsh/", TemplateView.as_view(template_name="azarakhsh.html")),\n\n2. مطمئن شوید که فایل‌های build شده React در مسیر static جنگو قرار گرفته‌اند. */'}
          filename={activeSubTab === 'settings' ? 'azarakhsh_project/settings.py' : activeSubTab === 'urls' ? 'azarakhsh_project/urls.py' : activeSubTab === 'env' ? '.env' : 'IndependentRoutes.txt'}
          badge={activeSubTab === 'settings' ? 'Core Settings' : activeSubTab === 'urls' ? 'Main URLs' : activeSubTab === 'env' ? 'Environment Secrets' : 'Independent Routes Docs'}
        />
      </div>

    </div>
  );
};
