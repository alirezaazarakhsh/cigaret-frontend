import React, { useState } from 'react';
import { Settings, Copy, Check, FileCode, Shield, Database, Clock, Image, Globe, Sparkles } from 'lucide-react';

export const DjangoConfigDocs: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'urls' | 'env'>('settings');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const settingsCode = `"""
config/settings.py
تنظیمات کامل و استاندارد پروژه جنگو شامل:
۱. دیتابیس PostgreSQL
۲. احراز هویت با JWT (انقضای دقیق ۳۰ دقیقه برای دسترسی امن)
۳. ویرایشگر متن TinyMCE
۴. مستندات خودکار Swagger و Redoc (drf-yasg)
۵. پشتیبانی از CORS برای ارتباط با فرانت‌اند Vercel
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# بارگذاری متغیرهای محیطی از فایل .env
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-sevin-tobacco-production-key-9419@')

DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']

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
    'drf_yasg',                                  # سواگر و ریداک (Swagger & Redoc)
    'corsheaders',                               # هدرهای CORS برای اتصال با فرانت‌اند
    'django_filters',                            # فیلترهای پیشرفته در API
    'tinymce',                                   # ادیتور متن پیشرفته WYSIWYG

    # اپلیکیشن‌های اختصاصی پروژه
    'accounts.apps.AccountsConfig',
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

ROOT_URLCONF = 'config.urls'

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

WSGI_APPLICATION = 'config.wsgi.application'

# --------------------------------------------------------------------------
# ۳. اتصال به دیتابیس PostgreSQL
# --------------------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'sevin_tobacco_db'),
        'USER': os.getenv('DB_USER', 'sevin_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'SecurePassword9419@'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'CONN_MAX_AGE': 600,
    }
}

# تعیین مدل سفارشی کاربر
AUTH_USER_MODEL = 'accounts.User'

# --------------------------------------------------------------------------
# ۴. تنظیمات Django REST Framework
# --------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DATETIME_FORMAT': '%Y-%m-%d %H:%M:%S',
}

# --------------------------------------------------------------------------
# ۵. تنظیمات احراز هویت JWT (انقضای دقیق ۳۰ دقیقه طبق خواسته کاربر)
# --------------------------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),  # انقضای توکن دسترسی بعد از نیم ساعت
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),     # اعتبار توکن رفرش برای تمدید
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,                # باطل‌شدن توکن قبلی هنگام ساخت جدید
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# --------------------------------------------------------------------------
# ۶. تنظیمات ویرایشگر متن TinyMCE
# --------------------------------------------------------------------------
TINYMCE_DEFAULT_CONFIG = {
    'height': 450,
    'width': '100%',
    'cleanup_on_startup': True,
    'custom_undo_redo_levels': 20,
    'selector': 'textarea',
    'theme': 'silver',
    'plugins': '''
        textcolor save link image media preview codesample contextmenu
        table code lists fullscreen insertdatetime nonbreaking
        directionality searchreplace wordcount visualblocks
        visualchars autolink animate help
    ''',
    'toolbar1': '''
        fullscreen preview bold italic underline | fontselect fontsizeselect |
        forecolor backcolor | alignleft alignright aligncenter alignjustify |
        rtl ltr | bullist numlist outdent indent | table link image media | code
    ''',
    'contextmenu': 'formats | link image',
    'menubar': True,
    'statusbar': True,
    'directionality': 'rtl', # راست‌چین برای زبان فارسی
    'language': 'fa',
}

# --------------------------------------------------------------------------
# ۷. تنظیمات CORS و مجازسازی دامنه‌های فرانت‌اند و Vercel
# --------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "https://*.vercel.app",
]
CORS_ALLOW_CREDENTIALS = True

# --------------------------------------------------------------------------
# ۸. تنظیمات زبان، منطقه زمانی و تقویم
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
STATICFILES_DIRS = [BASE_DIR / 'static']

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
`;

  const urlsCode = `"""
config/urls.py
روت‌های اصلی پروژه جنگو، سواگر (Swagger)، ریداک (Redoc)، ادیتور TinyMCE و سرویس‌های API
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

# ایمپورت‌های مربوط به سواگر و ریداک
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# ایمپورت اندپوینت‌های احراز هویت با JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# پیکربندی پیشرفته Schema View برای Swagger و Redoc
schema_view = get_schema_view(
    openapi.Info(
        title="مستندات API سامانه پخش عمده دخانیات سوین",
        default_version='v1',
        description="""
        این مستندات شامل تمامی اندپوینت‌های سیستم فروش عمده، فاکتور رسمی، انبارداری،
        احراز هویت JWT با انقضای نیم‌ساعته، ویزیتوری، رهگیری بارنامه و پشتیبانی است.
        """,
        terms_of_service="https://sevin-tobacco.ir/terms/",
        contact=openapi.Contact(email="info@sevin-tobacco.ir", name="پشتیبانی فنی سوین"),
        license=openapi.License(name="اختصاصی شرکت سوین"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # ۱. پنل مدیریت اصلی جنگو
    path('admin/', admin.site.urls),

    # ۲. ویرایشگر متن پیشرفته TinyMCE
    path('tinymce/', include('tinymce.urls')),

    # ۳. مستندات تعاملی Swagger و Redoc
    re_path(r'^swagger(?P<format>\\.json|\\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # ۴. روت‌های احراز هویت با توکن JWT (انقضای نیم‌ساعته)
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # ۵. اتصال اپلیکیشن‌های اختصاصی به مسیر api/v1/
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/categories/', include('categories.urls')),
    path('api/v1/products/', include('products.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/shipping/', include('shipping.urls')),
    path('api/v1/blog/', include('blog.urls')),
    path('api/v1/tickets/', include('tickets.urls')),
    path('api/v1/visitors/', include('visitors.urls')),
]

# سرو کردن فایل‌های آپلود شده (Media) در محیط توسعه
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
`;

  const envCode = `# .env
# متغیرهای محیطی امن پروژه جنگو
DJANGO_SECRET_KEY=django-insecure-sevin-tobacco-production-key-9419@
DJANGO_DEBUG=True

# مشخصات اتصال به PostgreSQL
DB_NAME=sevin_tobacco_db
DB_USER=sevin_user
DB_PASSWORD=SecurePassword9419@
DB_HOST=localhost
DB_PORT=5432
`;

  return (
    <div className="space-y-6 text-slate-800 text-right" dir="rtl">
      
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">پیکربندی هسته مرکزی (Core Configuration)</div>
            <h1 className="text-2xl font-black text-slate-900">
              تنظیمات فایل‌های settings.py و urls.py ریشه پروژه
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          در این بخش، تنظیمات دقیق پایگاه داده PostgreSQL، احراز هویت JWT با انقضای نیم‌ساعته (۳۰ دقیقه)، ویرایشگر TinyMCE، مستندات Swagger/Redoc و دسترسی‌های CORS قرار داده شده است.
        </p>

        {/* Feature badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-700">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>PostgreSQL Engine</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-700">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>انقضای توکن: ۳۰ دقیقه</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-700">
            <FileCode className="w-4 h-4 text-indigo-600" />
            <span>TinyMCE Rich Text</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-700">
            <Globe className="w-4 h-4 text-purple-600" />
            <span>Swagger & Redoc Ready</span>
          </div>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeSubTab === 'settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          فایل settings.py (تنظیمات اصلی)
        </button>
        <button
          onClick={() => setActiveSubTab('urls')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeSubTab === 'urls'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          فایل urls.py (مسیرهای ریشه و Swagger)
        </button>
        <button
          onClick={() => setActiveSubTab('env')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeSubTab === 'env'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          فایل .env (متغیرهای محیطی)
        </button>
      </div>

      {/* Code Card */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 relative font-mono text-xs shadow-xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4" dir="ltr">
          <span className="text-slate-400 font-bold">
            {activeSubTab === 'settings' ? 'config/settings.py' : activeSubTab === 'urls' ? 'config/urls.py' : '.env'}
          </span>
          <button
            onClick={() => handleCopy(
              activeSubTab === 'settings' ? settingsCode : activeSubTab === 'urls' ? urlsCode : envCode,
              activeSubTab
            )}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            {copiedKey === activeSubTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی کد</span>
              </>
            )}
          </button>
        </div>

        <pre className="overflow-x-auto text-left leading-relaxed whitespace-pre font-mono text-[11px] sm:text-xs" dir="ltr">
          {activeSubTab === 'settings' ? settingsCode : activeSubTab === 'urls' ? urlsCode : envCode}
        </pre>
      </div>

    </div>
  );
};
