import React, { useState } from 'react';
import { Settings, Shield, Database, Clock, Image, Globe, Sparkles, FileCode } from 'lucide-react';
import { CodeViewer } from './CodeViewer';

export const DjangoConfigDocs: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'urls' | 'env' | 'dockerfile' | 'docker_compose' | 'entrypoint' | 'requirements' | 'nginx' | 'gitignore' | 'routes' | 'admin_theme'>('settings');

  const settingsCode = `"""
azarakhsh_project/settings.py
تنظیمات کامل، بهینه‌سازی‌شده و استاندارد پروژه جنگو ۵ شامل:
۱. دیتابیس PostgreSQL
۲. احراز هویت با JWT (انقضای دقیق ۳۰ دقیقه برای دسترسی امن و بلک‌لیست توکن)
۳. ویرایشگر متن TinyMCE (پشتیبانی کامل از HTMLField در کاتالوگ و مقالات)
۴. مستندات خودکار OpenAPI 3.0 (drf-spectacular و drf-yasg)
۵. پشتیبانی کامل از CORS برای ارتباط با فرانت‌اند React
۶. پوشه متمرکز قالب‌ها (templates) جهت جلوگیری از ارور TemplateDoesNotExist
۷. تاریخ‌های سیستم و شمسی‌سازی کامل تاریخ‌ها و زمان (django-jalali / jalali_date)
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# بارگذاری متغیرهای محیطی از فایل .env
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY') or os.getenv('SECRET_KEY') or 'django-insecure-azarakhsh-tobacco-super-secret-key-prod-9419@'

DEBUG = os.getenv('DJANGO_DEBUG', 'False') == 'True'

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        'DJANGO_ALLOWED_HOSTS',
        'localhost,127.0.0.1,0.0.0.0,web,cigar.sevinhost.ir,cigaretsevin.vercel.app,*'
    ).split(',')
    if host.strip()
]

# تنظیمات هدر پروکسی معکوس Nginx برای پشتیبانی کامل از HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

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

    # پکیجهای شخص ثالث (Third-Party)
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # بلکلیست توکن پس از خروج (Logout)
    'drf_yasg',                                  # سواگر و ریداک کلاسیک (drf-yasg)
    'drf_spectacular',                           # سواگر و OpenAPI 3.0 جدید
    'corsheaders',                               # هدرهای CORS برای اتصال با فرانتاند
    'django_filters',                            # فیلترهای پیشرفته در API
    'tinymce',                                   # ادیتور متن پیشرفته TinyMCE
    'jalali_date',                               # تاریخ‌های شمسی در پنل مدیریت و API

    # ۱۸ اپلیکیشن اختصاصی سامانه آذرخش
    'accounts.apps.AccountsConfig',
    'roles.apps.RolesConfig',                    # مدیریت نقشها، دسترسیها و پین صندوق
    'regular_customers.apps.RegularCustomersConfig', # مشتریان معمولی و عمده
    'categories.apps.CategoriesConfig',
    'products.apps.ProductsConfig',
    'orders.apps.OrdersConfig',
    'pos.apps.PosConfig',
    'ledger.apps.LedgerConfig',
    'wallet.apps.WalletConfig',
    'shipping.apps.ShippingConfig',
    'blog.apps.BlogConfig',
    'tickets.apps.TicketsConfig',
    'visitors.apps.VisitorsConfig',
    'site_settings.apps.SiteSettingsConfig',
    'footer_settings.apps.FooterSettingsConfig',# فوتر داینامیک و لینکها
    'sliders.apps.SlidersConfig',               # اسلایدرها و بنرهای تبلیغاتی
    'kavenegar_sms.apps.KavenegarSmsConfig',
    'notifications.apps.NotificationsConfig',
    'pos_products.apps.PosProductsConfig',
    'finance.apps.FinanceConfig',
    'reports.apps.ReportsConfig',
    'warehouse_contact.apps.WarehouseContactConfig',  
    'visitor_tickets.apps.VisitorTicketsConfig'  
]

# --------------------------------------------------------------------------
# ۲. میان‌افزارها (MIDDLEWARE)
# --------------------------------------------------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',      # باید در بالاترین ردیف قرار گیرد
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # سرو مستقیم، فشرده و پرسرعت فایل‌های CSS/JS استاتیک و ادمین
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'azarakhsh_project.urls'

# --------------------------------------------------------------------------
# ۳. تنظیمات قالبها (TEMPLATES) - حل ارور TemplateDoesNotExist
# --------------------------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates', BASE_DIR / 'dist'],  # پوشه قالبها و خروجی فرانتاند
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
# ۴. دیتابیس PostgreSQL
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
# ۵. مدل کاربری اختصاصی
# --------------------------------------------------------------------------
AUTH_USER_MODEL = 'accounts.User'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --------------------------------------------------------------------------
# ۶. تنظیمات REST Framework، سواگر (Swagger/ReDoc) و drf-spectacular
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
    'DATETIME_FORMAT': '%Y/%m/%d - %H:%M',  # فرمت نمایش زمان در API
}

# کانفیگ سواگر کلاسیک (drf-yasg Swagger & ReDoc Settings)
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'توکن JWT خود را به صورت Bearer <token> وارد کنید'
        }
    },
    'USE_SESSION_AUTH': False,
    'JSON_EDITOR': True,
    'DISPLAY_OPERATION_ID': False,
    'DOC_EXPANSION': 'list',
}

# کانفیگ drf-spectacular (OpenAPI 3.0 Swagger & ReDoc)
SPECTACULAR_SETTINGS = {
    'TITLE': 'وبسرویس جامع سامانه پخش عمده دخانیات آذرخش',
    'DESCRIPTION': 'مستندات کامل REST API پایگاه داده، حسابداری، انبار، صندوق POS، کیف پول و تیکتینگ',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

# --------------------------------------------------------------------------
# ۷. تنظیمات JWT با انقضای ۳۰ دقیقهای توکن دسترسی
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
# ۸. تنظیمات TinyMCE (ادیتور غنی متن)
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
# ۹. تنظیمات بینالمللیسازی و تاریخهای شمسی (Jalali / Persian Calendar)
# --------------------------------------------------------------------------
LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True

# تنظیمات تاریخ شمسی در پنل ادمین و دیتابیس (jalali_date)
JALALI_DATE_DEFAULTS = {
    'Strftime': {
        'date': '%Y/%m/%d',
        'datetime': '%H:%M:%S - %Y/%m/%d',
    },
    'Static': {
        'js': [
            'admin/js/django_jalali.min.js',
        ],
        'css': {
            'all': [
                'admin/css/django_jalali.min.css',
            ]
        }
    }
}

# --------------------------------------------------------------------------
# ۱۰. فایلهای استاتیک و رسانهها (Static & Media با پشتیبانی WhiteNoise)
# --------------------------------------------------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# استوریج بهینه‌شده WhiteNoise برای فشرده‌سازی خودکار و کش پایدار CSS/JS در پروداکشن
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# --------------------------------------------------------------------------
# ۱۱. تنظیمات CORS و CSRF برای اتصال فرانت‌اند Vercel و حل قطعی ارور 403 Forbidden
# --------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL", "False").lower() in ("true", "1", "yes")

# دامنه‌های مجاز پیش‌فرض به همراه دامنه‌های تعریف شده در فایل .env
DEFAULT_CORS_ORIGINS = [
    "https://cigaretsevin.vercel.app",
    "http://cigaretsevin.vercel.app",
    "https://cigar.sevinhost.ir",
    "http://cigar.sevinhost.ir",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
    "http://127.0.0.1:8000",
]

CUSTOM_CORS = os.getenv("CORS_ALLOWED_ORIGINS", "")
if CUSTOM_CORS:
    CORS_ALLOWED_ORIGINS = list(set([origin.strip() for origin in CUSTOM_CORS.split(",") if origin.strip()] + DEFAULT_CORS_ORIGINS))
else:
    CORS_ALLOWED_ORIGINS = DEFAULT_CORS_ORIGINS

# لیست دامنه‌های معتمد جهت جلوگیری از ارور 403 CSRF در پنل ادمین و فرم‌ها
CSRF_TRUSTED_ORIGINS = [
    origin for origin in CORS_ALLOWED_ORIGINS if origin.startswith("http://") or origin.startswith("https://")
]
# افزودن صریح دامنه‌های پروداکشن برای اطمینان ۱۰۰٪
for trusted in ["https://cigar.sevinhost.ir", "http://cigar.sevinhost.ir", "https://cigaretsevin.vercel.app"]:
    if trusted not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(trusted)

CORS_ALLOW_CREDENTIALS = True

# تنظیمات کوکی CSRF و Session برای پشتیبانی از HTTPS و رفع خطای ۴۰۳
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'

`;

  const urlsCode = `"""
azarakhsh_project/urls.py
مسیرهای ریشه، سواگر Swagger UI و ReDoc (کلاسیک و OpenAPI 3.0)، ادیتور TinyMCE، اپلیکیشنهای ۱۲ گانه و صفحات فرانتاند
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework import permissions

# 1. وارد کردن drf_yasg (Swagger & ReDoc کلاسیک)
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="وبسرویس سامانه پخش عمده آذرخش",
      default_version='v1',
      description="مستندات REST API بانک اطلاعاتی، حسابداری، انبار و صندوق POS",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

# 2. وارد کردن drf_spectacular (OpenAPI 3.0 جدید)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

# ۳. تنظیم عنوان اختصاصی و فارسی پنل مدیریت انبار سیگار
admin.site.site_header = "سامانه مدیریت انبار سیگار آذرخش"
admin.site.site_title = "مدیریت انبار سیگار"
admin.site.index_title = "کنترل مرکزی موجودی، حسابداری، بنکداران و فروش عمده"

urlpatterns = [
    # ۱. پنل مدیریت پیشفرض جنگو
    path('admin/', admin.site.urls),

    # ۲. ادیتور TinyMCE
    path('tinymce/', include('tinymce.urls')),

    # ۳. مستندات سواگر و ریداک کلاسیک (drf-yasg)
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # ۴. مستندات جدید OpenAPI 3.0 (drf-spectacular)
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='spectacular-swagger-ui'),
    path('api/v1/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='spectacular-redoc'),

    # ۵. مسیرهای REST API اپلیکیشنهای ۱۸ گانه
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/roles/', include('roles.urls')),
    path('api/v1/regular-customers/', include('regular_customers.urls')),
    path('api/v1/categories/', include('categories.urls')),
    path('api/v1/products/', include('products.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/pos/', include('pos.urls')),
    path('api/v1/ledger/', include('ledger.urls')),
    path('api/v1/wallet/', include('wallet.urls')),
    path('api/v1/shipping/', include('shipping.urls')),
    path('api/v1/blog/', include('blog.urls')),
    path('api/v1/tickets/', include('tickets.urls')),
    path('api/v1/visitors/', include('visitors.urls')),
    path('api/v1/site-settings/', include('site_settings.urls')),
    path('api/v1/footer-settings/', include('footer_settings.urls')),
    path('api/v1/sliders/', include('sliders.urls')),
    path('api/v1/sms/', include('kavenegar_sms.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/pos_products/', include('pos_products.urls')),
    path('api/v1/finance/',include('finance.urls')),
    path('api/v1/reports/',include('reports.urls')),
    path('api/v1/warehouse_contact/',include('warehouse_contact.urls')),

    # ۶. سرویسدهی صفحات مستقل فرانتاند (React HTML Pages / SPA Routes)
    path('shopmanage/', TemplateView.as_view(template_name='shopmanage.html'), name='shopmanage'),
    path('azarakhsh/', TemplateView.as_view(template_name='azarakhsh.html'), name='azarakhsh_docs'),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
`;

  const envCode = `# ==============================================================================
# .env (پیکربندی متغیرهای محیطی، دیتابیس PostgreSQL و دامنه‌های مجاز فرانت‌اند)
# این فایل توسط settings.py و docker-compose.yml به صورت خودکار خوانده می‌شود.
# نکته: تنظیمات کاوه‌نگار در دیتابیس (SiteSettings) ذخیره شده و نیازی به .env ندارد.
# ==============================================================================

# ۱. کلید محرمانه و حالت اشکال‌زدایی جنگو
DJANGO_SECRET_KEY=django-insecure-azarakhsh-tobacco-super-secret-key-prod-9419@
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,web,cigar.sevinhost.ir,cigaretsevin.vercel.app

# ۲. دامنه‌های مجاز فرانت‌اند (CORS و CSRF برای اتصال به Vercel و لوکال‌هاست)
CORS_ALLOWED_ORIGINS=https://cigaretsevin.vercel.app,http://cigaretsevin.vercel.app,https://cigar.sevinhost.ir,http://cigar.sevinhost.ir,http://localhost:3000,http://localhost:5173,http://localhost:8001,http://127.0.0.1:8001

# ۳. اطلاعات اتصال به دیتابیس PostgreSQL (در داکر یا سرور مستقیم)
# هنگام اجرای docker-compose مقدار DB_HOST برابر نام سرویس دیتابیس یعنی "db" قرار می‌گیرد
DB_NAME=azarakhsh_db
DB_USER=azarakhsh_user
DB_PASSWORD=SevinStrongPass_9419@Secure
DB_HOST=db
DB_PORT=5432

# ۴. پورت بک‌اند جنگو (داکر روی پورت 8001 تنظیم شده است)
BACKEND_PORT=8001

# ۵. تنظیمات ردیس جهت کش و صف تسک‌ها (اختیاری)
REDIS_HOST=redis
REDIS_PORT=6379
`;

  const dockerfileCode = `# ==============================================================================
# Dockerfile - استاندارد بهینه‌شده تولیدی (Production Ready) برای جنگو ۵ و پایتون
# پورت کانتینر روی 8001 و سازگار با داکر کامپوز و Nginx سرور
# ==============================================================================

FROM python:3.11-slim

# تنظیم متغیرهای محیطی پایتون برای جلوگیری از بافر و ذخیره فایل‌های pyc
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# دایرکتوری اصلی پروژه در کانتینر
WORKDIR /app

# نصب پکیج‌های سیستمی موردنیاز، درایور PostgreSQL و کتابخانه‌های پردازش تصویر
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    gettext \
    netcat-traditional \
    postgresql-client \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# ارتقای pip و نصب پکیج‌های پایتون
RUN pip install --no-cache-dir --upgrade pip
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# کپی کل کدهای پروژه به داخل کانتینر
COPY . /app/

# ایجاد پوشه‌های staticfiles و media همراه با دسترسی کامل
RUN mkdir -p /app/staticfiles /app/media && chmod -R 777 /app/staticfiles /app/media

# اکسپوز پورت ۸۰۰۱ بک‌اند جنگو
EXPOSE 8001

# دستور اجرای سرور با وب‌سرور قدرتمند Gunicorn روی پورت 8001 با ۴ ورکر
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:8001", "--timeout", "180", "azarakhsh_project.wsgi:application"]
`;

  const dockerComposeCode = `# ==============================================================================
# docker-compose.yml
# استقرار جامع و خودکار پروژه آذرخش شامل PostgreSQL 16 + Redis + Django 5 (Gunicorn)
# پورت بک‌اند جنگو روی 8001 مپ شده و تنظیمات از .env خوانده می‌شوند.
# ==============================================================================

version: '3.9'

services:
  # ۱. پایگاه داده PostgreSQL 16
  db:
    image: postgres:16-alpine
    container_name: azarakhsh_postgres_db
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_DB: \${DB_NAME:-azarakhsh_db}
      POSTGRES_USER: \${DB_USER:-azarakhsh_user}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-SevinStrongPass_9419@Secure}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "\${DB_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-azarakhsh_user} -d \${DB_NAME:-azarakhsh_db}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - azarakhsh_network

  # ۲. حافظه موقت ردیس (Redis Cache / Queue)
  redis:
    image: redis:7-alpine
    container_name: azarakhsh_redis_cache
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - azarakhsh_network

  # ۳. وب‌سرویس بک‌اند جنگو (Gunicorn WSGI روی پورت 8001)
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: azarakhsh_django_web
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - DB_HOST=db
      - DB_PORT=\${DB_PORT:-5432}
      - DB_NAME=\${DB_NAME:-azarakhsh_db}
      - DB_USER=\${DB_USER:-azarakhsh_user}
      - DB_PASSWORD=\${DB_PASSWORD:-SevinStrongPass_9419@Secure}
      - DJANGO_SECRET_KEY=\${DJANGO_SECRET_KEY}
      - DJANGO_DEBUG=\${DJANGO_DEBUG:-True}
      - DJANGO_ALLOWED_HOSTS=\${DJANGO_ALLOWED_HOSTS:-*}
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "\${BACKEND_PORT:-8001}:8001"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - azarakhsh_network

# شبکه‌ها و والیوم‌های ماندگار
networks:
  azarakhsh_network:
    driver: bridge

volumes:
  postgres_data:
    name: azarakhsh_postgres_data
  redis_data:
    name: azarakhsh_redis_data
  static_volume:
    name: azarakhsh_static_data
  media_volume:
    name: azarakhsh_media_data
`;

  const entrypointCode = `#!/bin/sh
# ==============================================================================
# entrypoint.sh
# اسکریپت آغازین کانتینر داکر:
# ۱. منتظر بالا آمدن و آماده‌شدن دیتابیس PostgreSQL می‌ماند
# ۲. مایگریشن‌ها را به صورت خودکار اعمال می‌کند (migrate)
# ۳. فایل‌های استاتیک را گردآوری می‌کند (collectstatic)
# ۴. وب‌سرور Gunicorn را استارت می‌زند
# ==============================================================================

set -e

echo "⏳ [1/4] Checking PostgreSQL connection at $DB_HOST:$DB_PORT..."

while ! nc -z "$DB_HOST" "$DB_PORT"; do
  echo "   Waiting for database ($DB_HOST:$DB_PORT) to become ready..."
  sleep 1
done

echo "✅ [2/4] Database is ready and reachable!"

echo "🔄 [3/4] Applying database migrations..."
python manage.py migrate --noinput

echo "📦 [4/4] Collecting static files..."
python manage.py collectstatic --noinput --clear || true

echo "🚀 [SUCCESS] Starting Gunicorn WSGI Web Server..."
exec "$@"
`;

  const gitignoreCode = `# .gitignore (فایل چشم‌پوشی از فایل‌های غیرضروری و محرمانه در پروژه جنگو)

# --------------------------------------------------------------------------
# ۱. فایل‌های کامپایل شده پایتون و کَش‌ها
# --------------------------------------------------------------------------
*.pyc
*.pyo
*.pyd
__pycache__/
*.so
*.dylib
*.egg
*.egg-info/
dist/
build/
eggs/
parts/
bin/
var/
sdist/
develop-eggs/
.installed.cfg
lib/
lib64/
.python-version

# --------------------------------------------------------------------------
# ۲. محیط‌های مجازی پایتون (Virtual Environments)
# --------------------------------------------------------------------------
venv/
env/
ENV/
.venv/
env.bak/
venv.bak/

# --------------------------------------------------------------------------
# ۳. متغیرهای محیطی و کلیدهای محرمانه (Secrets & Environment)
# --------------------------------------------------------------------------
.env
.env.local
.env.production
.env.staging
*.env
*.pem
*.key
*.cert

# --------------------------------------------------------------------------
# ۴. پایگاه داده local و لاگ‌ها
# --------------------------------------------------------------------------
*.sqlite3
*.sqlite3-journal
*.db
*.log
local_settings.py

# --------------------------------------------------------------------------
# ۵. فایل‌های رسانه‌ای بارگذاری شده و استاتیک‌های گردآوری‌شده
# --------------------------------------------------------------------------
media/
staticfiles/
!media/.gitkeep
!staticfiles/.gitkeep

# --------------------------------------------------------------------------
# ۶. فایل‌های ادیتور و سیستم‌عامل
# --------------------------------------------------------------------------
.vscode/
.idea/
*.swp
*.swo
.DS_Store
Thumbs.db
*.bak

# --------------------------------------------------------------------------
# ۷. پک‌ها و فایل‌های فرانت‌اند (در صورت وجود در همان ریپوزیتوری)
# --------------------------------------------------------------------------
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.eslintcache
`;

  const adminThemeCode = `<!-- templates/admin/base_site.html -->
{% extends "admin/base.html" %}
{% load static %}

{% block title %}{{ title }} | {{ site_title|default:_('Django site admin') }}{% endblock %}

{% block branding %}
<h1 id="site-name">
  <a href="{% url 'admin:index' %}">
    <span style="font-weight: 900; letter-spacing: -0.5px; color: #3b82f6;">مدیریت انبار سیگار</span>
  </a>
</h1>
{% endblock %}

{% block extrahead %}
{{ block.super }}
<!-- لود فونت پرسرعت و زیبای وزیرمتن (Vazirmatn) برای فارسی‌سازی استاندارد و بی‌نقص پنل ادمین -->
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />

<style>
  /* تنظیم فونت کلیه اجزا به وزیرمتن */
  body, input, select, textarea, button, .submit-row input, 
  #header, div.breadcrumbs, .module h2, .module th, .module td,
  .deletelink, .addlink, .changelink, .historylink, .viewsitelink,
  .vLargeTextField, .vTextField, .vTimeField, .vDateField {
      font-family: 'Vazirmatn', sans-serif !important;
  }
  
  /* استایل شخصی‌سازی‌شده و زیبا برای هدر پنل مدیریت */
  #header {
      background: #0f172a !important; /* رنگ سرمه‌ای متالیک */
      border-bottom: 3px solid #3b82f6 !important; /* خط آبی زنده */
  }
  
  div.breadcrumbs {
      background: #1e293b !important;
      color: #cbd5e1 !important;
  }
  
  div.breadcrumbs a {
      color: #38bdf8 !important;
  }
  
  .module h2 {
      background: #1e293b !important;
      color: #ffffff !important;
      font-weight: bold;
  }
  
  /* تغییر استایل دکمه‌های ثبت و ویرایش */
  .button, input[type=submit] {
      background: #2563eb !important;
      color: #ffffff !important; /* رنگ متن سفید برای خوانایی کامل */
      border: none !important;
      border-radius: 8px !important;
      font-weight: bold !important;
      padding: 8px 16px !important;
      cursor: pointer !important;
      transition: background 0.2s ease-in-out !important;
  }
  
  .button:hover, input[type=submit]:hover {
      background: #1d4ed8 !important; /* رنگ هاور آبی تیره‌تر */
  }
  
  .button.default, input[type=submit].default {
      background: #10b981 !important; /* دکمه ذخیره سبز رنگ */
      color: #ffffff !important;
  }

  .button.default:hover, input[type=submit].default:hover {
      background: #059669 !important;
  }
</style>
{% endblock %}
`;

  const requirementsCode = `# ==============================================================================
# requirements.txt - لیست پکیج‌های استاندارد سامانه آذرخش + WhiteNoise
# دستور بروزرسانی در سرور: pip install -r requirements.txt
# ==============================================================================
Django>=5.0,<5.2
djangorestframework>=3.14.0
djangorestframework-simplejwt>=5.3.1
django-cors-headers>=4.3.1
django-filter>=23.5
drf-spectacular>=0.27.1
drf-yasg>=1.21.7
psycopg2-binary>=2.9.9
gunicorn>=21.2.0
whitenoise>=6.6.0
django-jalali-date>=1.0.4
django-tinymce>=3.6.1
redis>=5.0.1
celery>=5.3.6
kavenegar>=1.1.2
requests>=2.31.0
Pillow>=10.2.0
`;

  const nginxCode = `# ==============================================================================
# Nginx Configuration - sevinhost.ir + crms.sevinhost.ir + cigar.sevinhost.ir
# فایل کانفیگ Nginx تمیز، بدون تداخل و آماده سرور
# ==============================================================================

# =============================================
# 1. HTTP (Port 80) → HTTPS Redirect برای تمام دامنه‌ها
# =============================================
server {
    listen 80;
    server_name sevinhost.ir www.sevinhost.ir crms.sevinhost.ir www.crms.sevinhost.ir cigar.sevinhost.ir www.cigar.sevinhost.ir;

    return 301 https://$host$request_uri;
}

# =============================================
# 2. Frontend - sevinhost.ir (Next.js - Port 3000)
# =============================================
server {
    listen 443 ssl;
    server_name sevinhost.ir www.sevinhost.ir;

    ssl_certificate /etc/letsencrypt/live/sevinhost.ir-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sevinhost.ir-0001/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_read_timeout 120s;
    }
}

# =============================================
# 3. Backend - crms.sevinhost.ir (Django - Port 8000)
# =============================================
server {
    listen 443 ssl;
    server_name crms.sevinhost.ir www.crms.sevinhost.ir;

    ssl_certificate /etc/letsencrypt/live/www.crms.sevinhost.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.crms.sevinhost.ir/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location /media/ {
        alias /var/woc/3/b/sevinhost-backend/media/;
        expires 30d;
        access_log off;
    }

    location /static/ {
        alias /var/woc/3/b/sevinhost-backend/static/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_read_timeout 180s;
        proxy_send_timeout 180s;
    }
}

# =============================================
# 4. Backend Azarakhsh - cigar.sevinhost.ir (Django Docker - Port 8001)
# =============================================
server {
    listen 443 ssl;
    server_name cigar.sevinhost.ir www.cigar.sevinhost.ir;

    ssl_certificate /etc/letsencrypt/live/cigar.sevinhost.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cigar.sevinhost.ir/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 100M;

    access_log /var/log/nginx/cigar_access.log;
    error_log /var/log/nginx/cigar_error.log;

    # با وجود WhiteNoise، جنگو خودش استاتیک‌ها را سریع و فشرده سرو می‌کند
    # پروکسی تمامی درخواست‌ها (شامل API، Swagger، Admin و Static) به پورت 8001 داکر
    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 180s;
        proxy_read_timeout 180s;
        proxy_send_timeout 180s;
    }
}
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
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
            <Clock className="w-4 h-4" />
            <span>توکن JWT ۳۰ دقیقه</span>
          </div>
          <p className="text-[11px] text-slate-500 ">انقضای ایمن نیم‌ساعته اکسس توکن</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
            <Database className="w-4 h-4" />
            <span>PostgreSQL 16</span>
          </div>
          <p className="text-[11px] text-slate-500 ">پایگاه داده پرسرعت رابطه ای</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
            <Image className="w-4 h-4" />
            <span>ادیتور TinyMCE</span>
          </div>
          <p className="text-[11px] text-slate-500 ">ویرایشگر غنی متن راست‌چین فارسی</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
            <Globe className="w-4 h-4" />
            <span>CORS Headers</span>
          </div>
          <p className="text-[11px] text-slate-500 ">اتصال کامل به فرانت‌اند React</p>
        </div>
      </div>

        {/* Sub-tab navigation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            settings.py (تنظیمات اصلی)
          </button>
          <button
            onClick={() => setActiveSubTab('env')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'env'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            .env (متغیرهای دیتابیس و امنیت)
          </button>
          <button
            onClick={() => setActiveSubTab('docker_compose')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'docker_compose'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            docker-compose.yml (اتصال به .env)
          </button>
          <button
            onClick={() => setActiveSubTab('dockerfile')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'dockerfile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Dockerfile (کانتینر پایتون و جنگو)
          </button>
          <button
            onClick={() => setActiveSubTab('entrypoint')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'entrypoint'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            entrypoint.sh (مایگریشن خودکار)
          </button>
          <button
            onClick={() => setActiveSubTab('requirements')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'requirements'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            requirements.txt (پکیج‌ها و WhiteNoise)
          </button>
          <button
            onClick={() => setActiveSubTab('nginx')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'nginx'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            nginx.conf (کانفیگ سرور و SSL)
          </button>
          <button
            onClick={() => setActiveSubTab('urls')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'urls'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            urls.py (مسیرهای ریشه و Swagger)
          </button>
          <button
            onClick={() => setActiveSubTab('gitignore')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'gitignore'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            .gitignore (کانفیگ گیت ایگنور)
          </button>
          <button
            onClick={() => setActiveSubTab('routes')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'routes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Independent Routes (تغییرات جدید)
          </button>
          <button
            onClick={() => setActiveSubTab('admin_theme')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'admin_theme'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            قالب ادمین و فونت وزیر (base_site.html)
          </button>
        </div>

        {/* Code Viewer */}
        <CodeViewer
          code={
            activeSubTab === 'settings'
              ? settingsCode
              : activeSubTab === 'urls'
              ? urlsCode
              : activeSubTab === 'env'
              ? envCode
              : activeSubTab === 'docker_compose'
              ? dockerComposeCode
              : activeSubTab === 'dockerfile'
              ? dockerfileCode
              : activeSubTab === 'entrypoint'
              ? entrypointCode
              : activeSubTab === 'requirements'
              ? requirementsCode
              : activeSubTab === 'nginx'
              ? nginxCode
              : activeSubTab === 'gitignore'
              ? gitignoreCode
              : activeSubTab === 'admin_theme'
              ? adminThemeCode
              : '/* برای مدیریت مستقل مسیرهای فرانت‌اند در جنگو، از TemplateView استفاده کنید:\n\n1. در urls.py:\n   path("shopmanage/", TemplateView.as_view(template_name="shopmanage.html")),\n   path("azarakhsh/", TemplateView.as_view(template_name="azarakhsh.html")),\n\n2. مطمئن شوید که فایل‌های build شده React در مسیر static جنگو قرار گرفته‌اند. */'
          }
          filename={
            activeSubTab === 'settings'
              ? 'azarakhsh_project/settings.py'
              : activeSubTab === 'urls'
              ? 'azarakhsh_project/urls.py'
              : activeSubTab === 'env'
              ? '.env'
              : activeSubTab === 'docker_compose'
              ? 'docker-compose.yml'
              : activeSubTab === 'dockerfile'
              ? 'Dockerfile'
              : activeSubTab === 'entrypoint'
              ? 'entrypoint.sh'
              : activeSubTab === 'requirements'
              ? 'requirements.txt'
              : activeSubTab === 'nginx'
              ? 'nginx.conf'
              : activeSubTab === 'gitignore'
              ? '.gitignore'
              : activeSubTab === 'admin_theme'
              ? 'templates/admin/base_site.html'
              : 'IndependentRoutes.txt'
          }
          badge={
            activeSubTab === 'settings'
              ? 'Core Settings + WhiteNoise'
              : activeSubTab === 'urls'
              ? 'Main URLs'
              : activeSubTab === 'env'
              ? 'Environment Secrets'
              : activeSubTab === 'docker_compose'
              ? 'Docker Compose (Reads .env)'
              : activeSubTab === 'dockerfile'
              ? 'Production Multi-stage Dockerfile'
              : activeSubTab === 'entrypoint'
              ? 'Container Entrypoint Script'
              : activeSubTab === 'requirements'
              ? 'Python Packages Spec'
              : activeSubTab === 'nginx'
              ? 'Nginx Reverse Proxy & SSL'
              : activeSubTab === 'gitignore'
              ? 'Git Ignore Spec'
              : activeSubTab === 'admin_theme'
              ? 'Custom Admin Theme (Vazirmatn)'
              : 'Independent Routes Docs'
          }
        />
      </div>

    </div>
  );
};
