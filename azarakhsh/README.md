# 📘 مستندات جامع توسعه بک‌اند جنگو (Django Backend Architecture)
## پروژه مدیریت بنکداری، محصولات، مشتریان، صندوق POS، کیف پول و فیش بانکی آذرخش / سوین

این دایرکتوری و راهنما شامل آموزش گام به گام از صفر برای ساخت پروژه پایه جنگو، ساخت اپ‌های زیرمجموعه (Sub-Apps)، ساختار مدل‌ها، سریالایزرها، ویوها، روتینگ و پنل ادمین جنگو برای تمامی بخش‌های مورد نیاز است.

---

## 🚀 آموزش گام‌به‌گام از صفر ساخت پروژه پایه و اپ‌های زیرمجموعه جنگو

### 📌 گام ۱: ساخت محیط مجازی و پروژه پایه جنگو (Base Project)

ابتدا در ترمینال سرور یا سیستم خود، یک دایرکتوری ایجاد کرده و پروژه اصلی جنگو را ایجاد کنید:

```bash
# ۱. ایجاد پوشه پروژه و رفتن به داخل آن
mkdir -p /var/www/azarakhsh_backend && cd /var/www/azarakhsh_backend

# ۲. ایجاد محیط مجازی پایتون و فعال‌سازی آن
python3 -m venv venv
source venv/bin/activate

# ۳. ارتقای pip و نصب جنگو و فریم‌ورک‌های اصلی
pip install --upgrade pip
pip install django==5.1.4 djangorestframework==3.15.2 djangorestframework-simplejwt==5.3.1 psycopg2-binary==2.9.9 django-cors-headers==4.3.1 drf-spectacular==0.27.2 django-tinymce==4.1.0 gunicorn==22.0.0 uvicorn==0.30.1 pillow==10.4.0 python-dotenv==1.0.1 django-filter==24.2

# ۴. ساخت پروژه پایه جنگو (توجه: نقطه . در انتها مانع از تودرتو شدن پوشه پروژه می‌شود)
django-admin startproject azarakhsh_project .
```

پس از اجرای دستور فوق، ساختار فایل‌های پایه شما به صورت زیر خواهد بود:
```text
/var/www/azarakhsh_backend/
├── manage.py
├── venv/
└── azarakhsh_project/
    ├── __init__.py
    ├── asgi.py
    ├── settings.py
    ├── urls.py
    └── wsgi.py
```

---

### 📌 گام ۲: ساخت اپ‌های زیرمجموعه برای بخش‌های مختلف سامانه (Sub-Apps Creation)

برای تفکیک تمیز کدهای بنکداری، حسابداری، انبار و وب‌سایت، هر ماژول را در قالب یک اپ مستقل جنگو با دستور `startapp` ایجاد می‌کنیم:

```bash
# ایجاد اپ کاربران، سطوح مشتریان و احراز هویت پیامکی
python manage.py startapp accounts

# ایجاد اپ دسته‌بندی برندها و شرکت‌ها
python manage.py startapp categories

# ایجاد اپ انبار، محصولات و قیمت لحظه‌ای
python manage.py startapp products

# ایجاد اپ سبد خرید، سفارشات آنلاین و رزرو حواله
python manage.py startapp orders

# ایجاد اپ صندوق فروشگاهی، بارکدخوان و چاپ فیش حرارتی
python manage.py startapp pos_system

# ایجاد اپ حساب‌های دفتری، سقف اعتبار و تسویه نسیه
python manage.py startapp ledger

# ایجاد اپ کیف پول مشتری و ثبت فیش‌های واریز بانکی
python manage.py startapp wallet

# ایجاد اپ روش‌های ارسال، باربری و تحویل حضوری انبار
python manage.py startapp shipping

# ایجاد اپ وبلاگ، ادیتور TinyMCE و مقالات آموزشی
python manage.py startapp blog

# ایجاد اپ تیکت‌ها و پشتیبانی آنلاین
python manage.py startapp tickets

# ایجاد اپ آمار بازدیدکنندگان و لاگ درخواست‌ها
python manage.py startapp visitors

# ایجاد اپ تنظیمات عمومی، شماره کارت‌های بانکی و اسلایدرها
python manage.py startapp site_settings
```

#### 💡 اسکریپت خودکار یک‌جا برای ساخت تمام اپ‌ها و فایل‌های `serializers.py` و `urls.py`:

می‌توانید تمام دستورات بالا را همراه با ایجاد فایل‌های مکمل در قالب یک اسکریپت bash سریع اجرا کنید:

```bash
# ساخت همزمان تمام اپ‌ها و ایجاد فایل‌های serializers.py و urls.py درون هر اپ
for app in accounts categories products orders pos_system ledger wallet shipping blog tickets visitors site_settings; do
    python manage.py startapp $app
    touch $app/serializers.py
    touch $app/urls.py
    echo "from django.urls import path, include" > $app/urls.py
    echo "from rest_framework.routers import DefaultRouter" >> $app/urls.py
    echo -e "\nurlpatterns = []\n" >> $app/urls.py
    echo "App '$app' created successfully with serializers.py and urls.py"
done
```

---

### 📌 گام ۳: ساختار فایل‌های داخلی هر اپ زیرمجموعه

هر اپ زیرمجموعه دارای ساختار ماژولار و استاندارد زیر خواهد بود:

```text
products/
├── __init__.py
├── admin.py          # رجیستر کردن مدل‌ها و فیلترهای پنل مدیریت
├── apps.py           # کانفیگ نام اپ (ProductsConfig)
├── models.py         # فیلدها و جداول دیتابیس (CigaretteProduct, Stock, ...)
├── serializers.py    # سریالایزرهای تبدیل داده به JSON برای فرانت‌اند
├── urls.py           # مسیرهای روتینگ مستقل اپ (/api/products/...)
└── views.py          # کنترلرها، ViewSetها و APIViewها
```

---

### 📌 گام ۴: ثبت اپ‌های زیرمجموعه در `azarakhsh_project/settings.py`

در فایل `azarakhsh_project/settings.py`، بخش `INSTALLED_APPS` را به صورت زیر تکمیل کنید:

```python
# azarakhsh_project/settings.py

INSTALLED_APPS = [
    # جنگو پیش‌فرض
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # پکیج‌های شخص ثالث (Third-Party)
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    'tinymce',
    'django_filters',

    # اپ‌های زیرمجموعه پروژه آذرخش (Local Apps)
    'accounts.apps.AccountsConfig',
    'categories.apps.CategoriesConfig',
    'products.apps.ProductsConfig',
    'orders.apps.OrdersConfig',
    'pos_system.apps.PosSystemConfig',
    'ledger.apps.LedgerConfig',
    'wallet.apps.WalletConfig',
    'shipping.apps.ShippingConfig',
    'blog.apps.BlogConfig',
    'tickets.apps.TicketsConfig',
    'visitors.apps.VisitorsConfig',
    'site_settings.apps.SiteSettingsConfig',
]
```

---

### 📌 گام ۵: اتصال و روتینگ متمرکز در `azarakhsh_project/urls.py`

در فایل اصلی `azarakhsh_project/urls.py` با دستور `include()` تمامی اپ‌های زیرمجموعه را به روت اصلی وب‌سرویس متصل کنید:

```python
# azarakhsh_project/urls.py
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
    # پنل مدیریت جنگو
    path('admin/', admin.site.urls),

    # مستندات سواگر و ریداک (OpenAPI 3.0)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # ادیتور متن غنی TinyMCE برای وبلاگ
    path('tinymce/', include('tinymce.urls')),

    # وب‌سرویس‌های اپ‌های زیرمجموعه (Sub-Apps API Endpoints)
    path('api/auth/', include('accounts.urls')),
    path('api/categories/', include('categories.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/pos/', include('pos_system.urls')),
    path('api/ledger/', include('ledger.urls')),
    path('api/wallet/', include('wallet.urls')),
    path('api/shipping/', include('shipping.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/tickets/', include('tickets.urls')),
    path('api/visitors/', include('visitors.urls')),
    path('api/site-settings/', include('site_settings.urls')),
]

# سرو کردن فایل‌های مدیا و استاتیک در محیط توسعه
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

---

### 📌 گام ۶: اجرای مایگریشن‌ها و تست سرور

```bash
# ایجاد فایل‌های مایگریشن برای دیتابیس
python manage.py makemigrations accounts categories products orders pos_system ledger wallet shipping blog tickets visitors site_settings

# اعمال ساختار جداول به پایگاه داده PostgreSQL
python manage.py migrate

# ساخت کاربر ادمین اصلی
python manage.py createsuperuser --username=admin --email=admin@sevin.ir

# اجرای سرور توسعه برای تست اولیه
python manage.py runserver 0.0.0.0:8000
```

---

## 📋 خلاصه قواعد معماری و بیزینس سامانه (System Directives)

1. **حذف کامل درگاه‌های پرداخت آنلاین (No Online Gateway):**
   - هیچ درگاه اینترنتی (زرین‌پال، سداد و ...) در سیستم وجود ندارد.
   - کلیه پرداخت‌ها، افزایش موجودی کیف پول و تسویه حساب‌های دفتری صرفاً از طریق **ثبت فیش واریز بانکی / حواله پایا / ساتنا** انجام می‌شود.

2. **کنترل کارت و رنگ کارت مشتریان از سمت مدیریت و دیتابیس (Tier & Card Control):**
   - هر مشتری در دیتابیس دارای سطح کارت مشخصی است:
     - `bronze` (برنزی - پایه)
     - `silver` (نقره‌ای)
     - `gold` (طلایی - VIP)
     - `platinum` (پلاتینیوم - ویژه بنکداران)
     - `diamond_black` (بلک دایموند - سوپر VIP انحصاری)
   - رنگ، گرادینت، تخفیف درصدی و سقف پیش‌فرض هر کارت در دیتابیس تعریف می‌شود و در فرانت‌اند، پنل وب و اپ حضوری مشتری اعمال می‌گردد.

3. **سقف خرید و اعتبار دفتری از دیتابیس (Database Credit Limits):**
   - فیلد `credit_limit` در مدل مشتری مستقیماً توسط مدیر سیستم و حسابداری تنظیم می‌شود.
   - هنگام ثبت سفارش، در صورتی که مانده بدهی + مبلغ سفارش از `credit_limit` بیشتر شود، ثبت سفارش دفتری توسط سیستم بلاک می‌شود.

4. **کیف پول اختصاصی برای مشتری عادی و اپ حضوری (Wallet System):**
   - هر مشتری دارای کیف پول (`wallet_balance`) است.
   - مشتری می‌تواند با ثبت فیش بانکی درخواست شارژ بدهد.
   - پس از تأیید حسابدار در پنل ادمین، مبلغ مستقیماً به کیف پول شارژ شده و تراکنش در جدول `WalletTransaction` لاگ می‌شود.

---

### 📂 ساختار ماژول‌ها و فایل‌های ارائه‌شده در `/azarakhsh`

- `README.md` (همین فایل): مستندات و راهنمای نصب و راه‌اندازی گام به گام.
- `models.py`: تعریف مدل‌های `UserProfile`, `CustomerTier`, `BankDepositSlip`, `WalletTransaction`, `LedgerTransaction`.
- `serializers.py`: سریالایزرهای DRF برای ولیدیشن داده‌ها و پاسخ‌های API.
- `views.py`: ویوهای کنترلر برای ثبت فیش، مشاهده کارت، شارژ کیف پول، وضعیت سقف خرید و گزارش‌های مالی.
- `admin.py`: تنظیمات پیشرفته پنل جنگو ادمین با اکشن‌های تایید فیش و شارژ خودکار.
- `urls.py`: مسیرهای استاندارد API (REST Framework).
