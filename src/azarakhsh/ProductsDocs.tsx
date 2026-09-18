import React from 'react';
import { Package, Layers, ShieldCheck, Sliders, CheckCircle2 } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const ProductsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'products_category',
      verboseName: 'جدول دسته‌بندی‌های کالاها (Categories)',
      description: 'دسته‌بندی کالاها با شناسه سیستمی (اسلاگ فارسی سئو)، پالت ۶ رنگی استاندارد (Choice)، عنوان فارسی، نام لاتین و توضیحات کوتاه',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'name', type: 'CharField(max_length=150)', verbose: 'عنوان دسته‌بندی (فارسی) *' },
        { name: 'name_en', type: 'CharField(max_length=150, blank=True)', verbose: 'نام لاتین (English)' },
        { name: 'slug', type: 'SlugField(max_length=160)', isUnique: true, verbose: 'شناسه سیستمی (Slug / ID)' },
        { name: 'color', type: 'CharField(max_length=30, choices=COLOR_CHOICES)', verbose: 'رنگ شناسه (پالت ۶ رنگ انتخابی Choice)' },
        { name: 'description', type: 'TextField(blank=True)', verbose: 'توضیحات کوتاه دسته‌بندی' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ایجاد' },
        { name: 'updated_at', type: 'DateTimeField', verbose: 'تاریخ آخرین ویرایش' },
      ]
    },
    {
      name: 'products_producthologram',
      verboseName: 'جدول هولوگرام‌ها و برچسب‌های اصالت کالا (Product Authenticity)',
      description: 'مطابق دقیق ۵ فیلد اصلی فرم اندپوینت: عنوان هولوگرام، مرجع صادرکننده، کشور/حوزه، سطح اعتبار امنیتی و مشخصات فنی امنیتی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'title', type: 'CharField(max_length=150)', verbose: 'عنوان هولوگرام / برچسب اصالت *' },
        { name: 'issuer_org', type: 'CharField(max_length=150, blank=True)', verbose: 'مرجع صادرکننده یا سازمان ناظر' },
        { name: 'country_origin', type: 'CharField(max_length=100, blank=True)', verbose: 'کشور / حوزه' },
        { name: 'security_level', type: 'CharField(max_length=30, choices=SECURITY_LEVEL_CHOICES)', verbose: 'سطح اعتبار امنیتی (انتخابی Choice)' },
        { name: 'security_specs', type: 'TextField(blank=True)', verbose: 'مشخصات فنی و امنیتی (توضیحات)' },
        { name: 'is_verified', type: 'BooleanField(default=True)', verbose: 'دارای استعلام اصالت بارکد / QR (چک‌باکس)' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت هولوگرام' },
        { name: 'updated_at', type: 'DateTimeField', verbose: 'تاریخ بروزرسانی' },
      ]
    },
    {
      name: 'products_productattribute',
      verboseName: 'جدول مشخصات و ویژگی‌های فنی کالا (Product Attributes)',
      description: 'تعریف ویژگی‌های داینامیک محصول (نیکوتین، قطران، سال ساخت، نوع فیلتر، کشور سازنده و ...) با نوع داده انتخابی (Choice) و واحد سنجش',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'name', type: 'CharField(max_length=100)', verbose: 'عنوان ویژگی به فارسی *' },
        { name: 'name_en', type: 'CharField(max_length=100, blank=True)', verbose: 'عنوان لاتین (English)' },
        { name: 'data_type', type: 'CharField(max_length=20, choices=DATA_TYPES)', verbose: 'نوع داده (متن، عدد، انتخابی، بولی)' },
        { name: 'unit', type: 'CharField(max_length=30, blank=True)', verbose: 'واحد سنجش (اختیاری مثل mg, mm)' },
        { name: 'help_text', type: 'TextField(blank=True)', verbose: 'توضیح راهنما برای خریداران' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ایجاد' },
      ]
    },
    {
      name: 'products_productattributevalue',
      verboseName: 'جدول مقادیر ویژگی‌های هر محصول (Attribute Values)',
      description: 'انتساب مقادیر ویژگی‌های تعریف‌شده به هر محصول مجزا',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'product_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_product', verbose: 'کالای مربوطه' },
        { name: 'attribute_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_productattribute', verbose: 'ویژگی مورد نظر' },
        { name: 'value', type: 'CharField(max_length=255, blank=True)', verbose: 'مقدار متنی ویژگی' },
        { name: 'value_number', type: 'DecimalField(max_digits=10, decimal_places=2, null=True)', verbose: 'مقدار عددی' },
        { name: 'value_boolean', type: 'BooleanField(null=True)', verbose: 'مقدار بولی' },
      ]
    },
    {
      name: 'products_product',
      verboseName: 'جدول کاتالوگ جامع محصولات و همگام‌سازی صندوق (POS)',
      description: 'کاتالوگ کالاها شامل قیمت کارتن، باکس، پاکت، بارکدخوان، دسته‌بندی، برند، هولوگرام، همگام‌سازی دوطرفه آنلاین/صندوق و ادیتور TinyMCE',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'name', type: 'CharField(max_length=200)', verbose: 'نام کامل کالا (فارسی) *' },
        { name: 'name_en', type: 'CharField(max_length=200, blank=True)', verbose: 'نام انگلیسی / لاتین' },
        { name: 'slug', type: 'SlugField(max_length=220)', isUnique: true, verbose: 'اسلاگ سئو (URL)' },
        { name: 'brand', type: 'ForeignKey', isFk: true, fkTarget: 'products_productbrand', verbose: 'برند' },
        { name: 'category', type: 'ForeignKey', isFk: true, fkTarget: 'products_category', verbose: 'دسته‌بندی' },
        { name: 'barcode', type: 'CharField(max_length=60, blank=True, db_index=True)', verbose: 'بارکد اسکنر فروشگاهی / GTIN' },
        { name: 'hologram', type: 'ForeignKey', isFk: true, fkTarget: 'products_producthologram', verbose: 'هولوگرام و اصالت کالا' },
        { name: 'box_price', type: 'DecimalField(max_digits=12)', verbose: 'قیمت هر باکس (تومان)' },
        { name: 'boxes_per_carton', type: 'PositiveIntegerField(default=50)', verbose: 'تعداد باکس در هر کارتن' },
        { name: 'carton_price', type: 'DecimalField(max_digits=14)', verbose: 'قیمت هر کارتن (تومان محاسبه خودکار)' },
        { name: 'pack_price', type: 'DecimalField(max_digits=12, default=0)', verbose: 'قیمت هر پاکت (تومان)' },
        { name: 'packs_per_box', type: 'PositiveIntegerField(default=10)', verbose: 'تعداد پاکت در هر باکس' },
        { name: 'purchase_price', type: 'DecimalField(max_digits=14, default=0)', verbose: 'قیمت تمام شده خرید انبار' },
        { name: 'stock_cartons', type: 'PositiveIntegerField(default=0)', verbose: 'موجودی انبار کارتن' },
        { name: 'stock_boxes', type: 'PositiveIntegerField(default=0)', verbose: 'موجودی انبار باکس خرد' },
        { name: 'image', type: 'ImageField', verbose: 'تصویر شاخص کالا' },
        { name: 'full_description', type: 'HTMLField(TinyMCE)', verbose: 'توضیحات غنی با ادیتور TinyMCE' },
        { name: 'excerpt', type: 'TextField(blank=True)', verbose: 'خلاصه کوتاه کالا' },
        { name: 'is_pos_only', type: 'BooleanField(default=False, db_index=True)', verbose: 'اختصاصی فروش حضوری صندوق (عدم نمایش آنلاین)' },
        { name: 'is_box_only', type: 'BooleanField(default=False)', verbose: 'فروش فقط به صورت باکس' },
        { name: 'has_carton', type: 'BooleanField(default=True)', verbose: 'امکان فروش کارتنی' },
        { name: 'has_box', type: 'BooleanField(default=True)', verbose: 'امکان فروش باکسی' },
        { name: 'has_pack', type: 'BooleanField(default=False)', verbose: 'امکان فروش پاکتی' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'فعال جهت سفارش' },
        { name: 'is_featured', type: 'BooleanField(default=False)', verbose: 'پیشنهاد ویژه صفحه اصلی' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت' },
        { name: 'updated_at', type: 'DateTimeField', verbose: 'تاریخ آخرین ویرایش' },
      ]
    },
    {
      name: 'products_productimage',
      verboseName: 'جدول تصاویر گالری کالا',
      description: 'گالری چندگانه تصاویر کالا با اولویت‌بندی ترتیب نمایش',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'product_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_product', verbose: 'کالای مربوطه' },
        { name: 'image', type: 'ImageField', verbose: 'فایل تصویر' },
        { name: 'order', type: 'PositiveIntegerField(default=0)', verbose: 'ترتیب نمایش' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    // 1. Categories
    {
      method: 'GET',
      path: '/api/v1/products/categories/',
      auth: 'AllowAny',
      description: 'دریافت فهرست تمام دسته‌بندی‌ها به همراه ۵ فیلد اصلی (عنوان، نام لاتین، اسلاگ، رنگ شناسه و توضیحات)',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/products/categories/"`,
      responseBody: `{
  "status": "success",
  "count": 2,
  "results": [
    {
      "id": 1,
      "name": "سیگار ایرانی و شرکتی",
      "name_en": "Iranian Cigarettes",
      "slug": "iranian-cigarettes",
      "color": "#3B82F6",
      "color_display": "آبی لاجوردی (#3B82F6)",
      "description": "انواع برندهای شرکتی با هولوگرام معتبر دخانیات",
      "products_count": 48,
      "created_at": "2026-09-16T18:00:00Z",
      "updated_at": "2026-09-16T18:00:00Z"
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/products/categories/',
      auth: 'IsAdminUser',
      description: 'ایجاد دسته‌بندی جدید با ۵ فیلد فرم: عنوان فارسی (اجباری)، نام لاتین، شناسه سیستمی (اسلاگ)، رنگ شناسه (انتخاب از ۶ رنگ) و توضیحات',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/products/categories/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "سیگار وارداتی اصل",
    "name_en": "Imported Cigarettes",
    "slug": "imported-cigarettes",
    "color": "#EF4444",
    "description": "محصولات وارداتی اصل سفارش اروپا و امارات"
  }'`
    },
    {
      method: 'GET',
      path: '/api/v1/products/categories/<id>/',
      auth: 'AllowAny',
      description: 'مشاهده جزئیات یک دسته‌بندی مشخص'
    },
    {
      method: 'PUT',
      path: '/api/v1/products/categories/<id>/',
      auth: 'IsAdminUser',
      description: 'ویرایش کامل اطلاعات دسته‌بندی، رنگ شناسه، اسلاگ و آیکون'
    },
    {
      method: 'DELETE',
      path: '/api/v1/products/categories/<id>/',
      auth: 'IsAdminUser',
      description: 'حذف دسته‌بندی از سیستم'
    },

    // 2. Holograms
    {
      method: 'GET',
      path: '/api/v1/products/holograms/',
      auth: 'AllowAny',
      description: 'دریافت فهرست انواع هولوگرام‌ها و سطوح اصالت کالا',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/products/holograms/"`,
      responseBody: `{
  "status": "success",
  "count": 4,
  "results": [
    {
      "id": 1,
      "title": "اورجینال اروپایی با بارکد اصالت",
      "issuer_org": "اتحادیه دخانیات اروپا (EU TPD)",
      "country_origin": "سوئیس / اتحادیه اروپا",
      "security_level": "maximum",
      "security_level_display": "فوق امنیتی / لیبل هولوگرام ۳ بعدی ضد جعل",
      "badge_color": "#10B981",
      "security_specs": "دارای میکروتکست مخفی، هولوگرام برجسته و QR استعلام آنلاین سرور سازنده",
      "is_verified": true
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/products/holograms/',
      auth: 'IsAdminUser',
      description: 'ایجاد هولوگرام و برچسب اصالت جدید با سطح اعتبار امنیتی انتخابی (Choice)',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/products/holograms/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "سفارش دبی (سفارشی امارات)",
    "issuer_org": "اتاق بازرگانی و گمرک دبی",
    "country_origin": "امارات متحده عربی",
    "security_level": "high",
    "badge_color": "#3B82F6",
    "security_specs": "دارای بارکد اختصاصی امارات و برچسب سلامت معتبر",
    "is_verified": true
  }'`
    },
    {
      method: 'GET',
      path: '/api/v1/products/holograms/<id>/',
      auth: 'AllowAny',
      description: 'مشاهده مشخصات کامل یک برچسب هولوگرام'
    },
    {
      method: 'PUT',
      path: '/api/v1/products/holograms/<id>/',
      auth: 'IsAdminUser',
      description: 'ویرایش مشخصات، رنگ، سطح اعتبار امنیتی و سازمان صادرکننده هولوگرام'
    },
    {
      method: 'DELETE',
      path: '/api/v1/products/holograms/<id>/',
      auth: 'IsAdminUser',
      description: 'حذف برچسب هولوگرام'
    },

    // 3. Attributes
    {
      method: 'GET',
      path: '/api/v1/products/attributes/',
      auth: 'AllowAny',
      description: 'دریافت فهرست تمام ویژگی‌های تعریف‌شده (نیکوتین، قطران، نوع فیلتر، سال ساخت و ...)',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/products/attributes/"`,
      responseBody: `{
  "status": "success",
  "count": 4,
  "results": [
    {
      "id": 1,
      "name": "میزان نیکوتین",
      "name_en": "Nicotine",
      "data_type": "number",
      "data_type_display": "عددی (صحیح یا اعشاری)",
      "unit": "mg (میلی‌گرم)",
      "help_text": "میزان نیکوتین آزمایشگاهی در هر نخ"
    },
    {
      "id": 2,
      "name": "نوع فیلتر",
      "name_en": "Filter Type",
      "data_type": "select",
      "data_type_display": "انتخابی / چندگزینه‌ای",
      "unit": null,
      "help_text": "جنس فیلتر زغالی، استاندارد، استات یا طعم‌دار کپسولی"
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/products/attributes/',
      auth: 'IsAdminUser',
      description: 'تعریف ویژگی جدید برای کالاها با تعیین نوع داده (Choice)، واحد سنجش و متن راهنما',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/products/attributes/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "میزان قطران",
    "name_en": "Tar",
    "data_type": "number",
    "unit": "mg",
    "help_text": "میزان قطران بر اساس استاندارد ISO"
  }'`
    },
    {
      method: 'GET',
      path: '/api/v1/products/attributes/<id>/',
      auth: 'AllowAny',
      description: 'مشاهده مشخصات ویژگی'
    },
    {
      method: 'PUT',
      path: '/api/v1/products/attributes/<id>/',
      auth: 'IsAdminUser',
      description: 'ویرایش مشخصات ویژگی'
    },
    {
      method: 'DELETE',
      path: '/api/v1/products/attributes/<id>/',
      auth: 'IsAdminUser',
      description: 'حذف ویژگی از سیستم'
    },
    {
      method: 'POST',
      path: '/api/v1/products/<id>/attributes/',
      auth: 'IsAdminUser',
      description: 'ثبت و تنظیم مقادیر ویژگی‌های یک کالا',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/products/12/attributes/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "attributes": [
      { "attribute_id": 1, "value": "0.5", "value_number": 0.5 },
      { "attribute_id": 2, "value": "فیلتر زغالی کربن اکتیو" }
    ]
  }'`
    },

    // 4. Products & POS Sync
    {
      method: 'GET',
      path: '/api/v1/products/list/',
      auth: 'AllowAny',
      description: 'کاتالوگ محصولات آنلاین سایت (با فیلتر خودکار is_pos_only=False، بازه قیمت، دسته‌بندی و برند)',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/products/list/?category=1&min_price=0&max_price=200000000"`
    },
    {
      method: 'GET',
      path: '/api/v1/products/pos-catalog/',
      auth: 'IsAuthenticated (صندوقدار یا ادمین)',
      description: 'کاتالوگ جامع صندوق فروشگاهی حضوری (شامل کلیه اقلام آنلاین + اقلام اختصاصی صندوق is_pos_only=True و جستجوی آنی بارکد)',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/products/pos-catalog/?barcode=6260123456789" \\
  -H "Authorization: Bearer <JWT_TOKEN>"`
    },
    {
      method: 'GET',
      path: '/api/v1/products/featured/',
      auth: 'AllowAny',
      description: 'دریافت محصولات برگزیده و پیشنهاد ویژه صفحه اصلی'
    },
    {
      method: 'POST',
      path: '/api/v1/products/create/',
      auth: 'IsAdminUser',
      description: 'افزودن محصول جدید به سیستم به همراه دسته‌بندی، هولوگرام، ویژگی‌ها، متن TinyMCE و تعیین وضعیت انتشار آنلاین یا فقط صندوق (is_pos_only)',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/products/create/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "وینستون لایت نقره‌ای",
    "name_en": "Winston Light Silver",
    "slug": "winston-light-silver",
    "brand": "وینستون",
    "category": 1,
    "hologram": 1,
    "barcode": "6260123456789",
    "box_price": 680000,
    "boxes_per_carton": 50,
    "carton_price": 34000000,
    "pack_price": 68000,
    "stock_cartons": 150,
    "full_description": "<p>سیگار وینستون لایت نقره‌ای با هولوگرام اصالت اروپایی...</p>",
    "is_pos_only": false
  }'`
    },
    {
      method: 'GET',
      path: '/api/v1/products/<id>/',
      auth: 'AllowAny',
      description: 'مشاهده جزئیات کامل محصول شامل متن ادیتور TinyMCE، گالری تصاویر، مشخصات هولوگرام و جدول ویژگی‌ها'
    },
    {
      method: 'PUT',
      path: '/api/v1/products/<id>/update/',
      auth: 'IsAdminUser',
      description: 'ویرایش اطلاعات محصول، قیمت‌ها، موجودی انبار، هولوگرام و تغییر کانال انتشار (is_pos_only)'
    },
    {
      method: 'PATCH',
      path: '/api/v1/products/<id>/sync-pos-stock/',
      auth: 'IsAuthenticated',
      description: 'همگام‌سازی سریع موجودی پس از صدور فاکتور در صندوق حضوری (Real-time Sync)'
    },
    {
      method: 'DELETE',
      path: '/api/v1/products/<id>/delete/',
      auth: 'IsAdminUser',
      description: 'حذف محصول از کاتالوگ فروشگاه'
    }
  ];

  const modelsCode = `
"""
products/models.py
مدلهای محصولات، دستهبندیها، برندها، هولوگرامها، تخفیفات پلکانی و ویژگیهای فنی
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField

# ==========================================
# گزینههای انتخابی ثابت (Choice Tuples)
# ==========================================

COLOR_CHOICES = (
    ('#EF4444', _('قرمز / سرخابی (#EF4444)')),
    ('#F59E0B', _('طلایی / نارنجی (#F59E0B)')),
    ('#8B5CF6', _('بنفش رویال (#8B5CF6)')),
    ('#3B82F6', _('آبی لاجوردی (#3B82F6)')),
    ('#06B6D4', _('فیروزهای (#06B6D4)')),
    ('#1E40AF', _('سرمهای دیپ (#1E40AF)')),
)

# ==============================================================================
# ۱. دستهبندیها (Categories)
# ==============================================================================
class Category(models.Model):
    """
    مدل دستهبندی کالاها (شامل ۵ فیلد اصلی فرم اندپوینت):
    ۱. عنوان دستهبندی (فارسی)
    ۲. نام لاتین (English)
    ۳. شناسه سیستمی (Slug / ID)
    ۴. رنگ شناسه (۶ رنگ پالت انتخابی)
    ۵. توضیحات کوتاه دستهبندی
    """
    name = models.CharField(_("عنوان دستهبندی (فارسی)"), max_length=150)
    name_en = models.CharField(_("نام لاتین (English)"), max_length=150, blank=True, null=True)
    slug = models.SlugField(_("شناسه سیستمی (Slug / ID)"), max_length=160, unique=True, allow_unicode=True)
    color = models.CharField(_("رنگ شناسه"), max_length=30, choices=COLOR_CHOICES, default="#3B82F6")
    description = models.TextField(_("توضیحات کوتاه دستهبندی"), blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین ویرایش"), auto_now=True)

    class Meta:
        verbose_name = _("دستهبندی")
        verbose_name_plural = _("دستهبندیهای محصولات")
        ordering = ['-id']

    def __str__(self):
        return f"{self.name} ({self.slug})"


# ==============================================================================
# ۲. برندهای کالا (Product Brands / Brand)
# ==============================================================================
class ProductBrand(models.Model):
    name = models.CharField(_("نام برند (فارسی)"), max_length=120)
    name_en = models.CharField(_("نام برند (انگلیسی)"), max_length=120, blank=True, null=True)
    slug = models.SlugField(_("اسلاگ سئو"), max_length=130, unique=True, allow_unicode=True)
    logo = models.ImageField(_("لوگو برند"), upload_to="brands/logos/", blank=True, null=True, help_text=_("آپلود فایل تصویر لوگوی برند"))
    country = models.CharField(_("کشور سازنده اصلی"), max_length=100, blank=True, null=True)
    description = models.TextField(_("توضیحات برند"), blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("برند کالا")
        verbose_name_plural = _("برندهای کالا")
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def logo_url(self):
        """آدرس مستقیم تصویر لوگو جهت استفاده در فرانتاند و قالبها"""
        if self.logo and hasattr(self.logo, 'url'):
            return self.logo.url
        return None


# نام مستعار جهت سازگاری کامل با پروژههایی که از مدل Brand استفاده میکنند
Brand = ProductBrand


# ==============================================================================
# ۳. هولوگرام و اصالت کالا (Product Hologram)
# ==============================================================================
SECURITY_LEVEL_CHOICES = (
    ('maximum', _('فوق امنیتی (Maximum)')),
    ('high', _('بالا (High)')),
    ('standard', _('استاندارد (Standard)')),
    ('economic', _('پایه (Economic)')),
)

class ProductHologram(models.Model):
    """
    مدل تعریف برچسبهای ضمانت اصالت کالا و هولوگرام (طابق دقیق ۵ فیلد اصلی فرم اندپوینت):
    ۱. عنوان هولوگرام / برچسب اصالت * (title)
    ۲. مرجع صادرکننده یا سازمان ناظر (issuer_org)
    ۳. کشور / حوزه (country_origin)
    ۴. سطح اعتبار امنیتی (security_level)
    ۵. مشخصات فنی و امنیتی (security_specs)
    """
    title = models.CharField(_("عنوان هولوگرام / برچسب اصالت"), max_length=150)
    issuer_org = models.CharField(_("مرجع صادرکننده یا سازمان ناظر"), max_length=150, blank=True, null=True)
    country_origin = models.CharField(_("کشور / حوزه"), max_length=100, blank=True, null=True)
    security_level = models.CharField(_("سطح اعتبار امنیتی"), max_length=30, choices=SECURITY_LEVEL_CHOICES, default='high')
    security_specs = models.TextField(_("مشخصات فنی و امنیتی"), blank=True, null=True)
    is_verified = models.BooleanField(_("دارای استعلام اصالت بارکد / QR"), default=True)
    created_at = models.DateTimeField(_("تاریخ ثبت هولوگرام"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("هولوگرام و اصالت")
        verbose_name_plural = _("هولوگرامهای اصالت کالا")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_security_level_display()}"


# ==============================================================================
# ۴. مدل اصلی محصول (Product)
# ==============================================================================
class Product(models.Model):
    BADGE_CHOICES = (
        ('none', _('بدون نشان')),
        ('bestseller', _('پرفروشترین')),
        ('special', _('پیشنهاد ویژه')),
        ('new', _('جدیدترین')),
        ('discount', _('تخفیف ویژه')),
        ('import', _('وارداتی اصل')),
    )

    SIZE_CHOICES = (
        ('king_size', _('کینگ سایز (King Size)')),
        ('slims', _('اسلیم / باریک (Slims)')),
        ('super_slims', _('سوپر اسلیم (Super Slims)')),
        ('nano', _('نانو (Nano)')),
        ('compact', _('کامپکت (Compact)')),
        ('queen_size', _('کویین سایز (Queen Size)')),
    )

    FILTER_CHOICES = (
        ('white', _('فیلتر سفید استاندارد')),
        ('yellow', _('فیلتر زرد سنتی')),
        ('charcoal', _('فیلتر کربن / زغالی')),
        ('recessed', _('فیلتر مجوف (Recessed)')),
        ('capsule', _('فیلتر طعمدار / پاور (Capsule)')),
    )

    name = models.CharField(_("نام محصول (فارسی)"), max_length=200)
    name_en = models.CharField(_("نام محصول (انگلیسی)"), max_length=200, blank=True, null=True)
    slug = models.SlugField(_("اسلاگ سئو"), max_length=220, unique=True, allow_unicode=True)
    barcode = models.CharField(_("بارکد اسکنر فروشگاهی"), max_length=60, unique=True, blank=True, null=True, db_index=True)

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products', verbose_name=_("دستهبندی"))
    brand = models.ForeignKey(ProductBrand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name=_("برند"))
    hologram = models.ForeignKey(ProductHologram, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name=_("هولوگرام اصالت"))

    # ساختار بستهبندی و قیمتگذاری بنکداری
    carton_price = models.PositiveIntegerField(_("قیمت هر کارتن (تومان)"), default=0)
    box_price = models.PositiveIntegerField(_("قیمت هر باکس (تومان)"), default=0)
    pack_price = models.PositiveIntegerField(_("قیمت هر پاکت (تومان)"), default=0)
    purchase_price = models.PositiveIntegerField(_("قیمت تمامشده خرید"), default=0)

    stock_cartons = models.PositiveIntegerField(_("موجودی کارتن"), default=0)
    stock_boxes = models.PositiveIntegerField(_("موجودی باکس"), default=0)
    boxes_per_carton = models.PositiveIntegerField(_("تعداد باکس در کارتن"), default=50)
    packs_per_box = models.PositiveIntegerField(_("تعداد پاکت در باکس"), default=10)

    min_order_carton = models.PositiveIntegerField(_("حداقل سفارش کارتن"), default=1)
    min_order_box = models.PositiveIntegerField(_("حداقل سفارش باکس"), default=1)

    has_carton = models.BooleanField(_("امکان فروش کارتنی"), default=True)
    has_box = models.BooleanField(_("امکان فروش باکسی"), default=True)
    has_pack = models.BooleanField(_("امکان فروش پاکتی"), default=False)
    is_box_only = models.BooleanField(_("فقط فروش باکسی"), default=False)
    is_pos_only = models.BooleanField(_("اختصاصی صندوق (POS)"), default=False)

    # مشخصات فنی و تخصصی دخانیات
    tar = models.CharField(_("میزان قطران (mg)"), max_length=20, blank=True, null=True)
    nicotine = models.CharField(_("میزان نیکوتین (mg)"), max_length=20, blank=True, null=True)
    carbon_monoxide = models.CharField(_("میزان کربن مونوکسید"), max_length=20, blank=True, null=True)
    cigarette_size = models.CharField(_("سایز سیگار"), max_length=30, choices=SIZE_CHOICES, default='king_size')
    filter_type = models.CharField(_("نوع فیلتر"), max_length=30, choices=FILTER_CHOICES, default='white')
    country_origin = models.CharField(_("کشور تولیدکننده / مبدا"), max_length=100, blank=True, null=True)

    # اطلاعات رسانهای و محتوا
    badge = models.CharField(_("نشان ویژه محصول"), max_length=30, choices=BADGE_CHOICES, default='none')
    main_image = models.ImageField(_("تصویر اصلی محصول"), upload_to="products/", blank=True, null=True)
    image = models.CharField(_("آدرس / URL تصویر"), max_length=500, blank=True, null=True)
    excerpt = models.TextField(_("چکیده و خلاصه کوتاه"), blank=True, null=True)
    full_description = HTMLField(_("توضیحات جامع (TinyMCE)"), blank=True, null=True)

    # سئو پیشرفته Yoast
    focus_keyword = models.CharField(_("کلیدواژه اصلی سئو"), max_length=100, blank=True, null=True)
    meta_title = models.CharField(_("عنوان سئو (Meta Title)"), max_length=150, blank=True, null=True)
    meta_description = models.TextField(_("توضیحات سئو (Meta Description)"), blank=True, null=True)
    canonical_url = models.URLField(_("لینک کانونیکال (Canonical)"), blank=True, null=True)

    is_active = models.BooleanField(_("فعال"), default=True)
    is_featured = models.BooleanField(_("پیشنهاد ویژه"), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("محصول")
        verbose_name_plural = _("محصولات")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.barcode or 'بدون بارکد'})"


# ==============================================================================
# ۵. جدول تخفیفهای پلکانی حجم عمده (Tier Discounts)
# ==============================================================================
class ProductTierDiscount(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='tier_discounts', verbose_name=_("محصول"))
    min_quantity = models.PositiveIntegerField(_("حداقل تعداد (کارتن/باکس)"))
    discount_percent = models.DecimalField(_("درصد تخفیف"), max_digits=5, decimal_places=2)
    discount_price_per_unit = models.PositiveIntegerField(_("قیمت تخفیفخورده به ازای هر واحد"), blank=True, null=True)

    class Meta:
        verbose_name = _("تخفیف پلکانی عمده")
        verbose_name_plural = _("تخفیفهای پلکانی عمده")
        ordering = ['min_quantity']


# ==============================================================================
# ۶. مشخصات و ویژگیهای داینامیک کالا (Attributes & Values)
# ==============================================================================
DATA_TYPE_CHOICES = (
    ('text', _('متن کوتاه / رشته')),
    ('number', _('عددی (صحیح یا اعشاری)')),
    ('select', _('انتخابی / چندگزینهای')),
    ('boolean', _('بله / خیر (سوئیچ دو وضعیتی)')),
    ('color', _('کد رنگ')),
)

class ProductAttribute(models.Model):
    name = models.CharField(_("عنوان ویژگی به فارسی"), max_length=100)
    name_en = models.CharField(_("عنوان لاتین (English)"), max_length=100, blank=True, null=True)
    data_type = models.CharField(_("نوع داده"), max_length=20, choices=DATA_TYPE_CHOICES, default='text')
    unit = models.CharField(_("واحد سنجش (اختیاری)"), max_length=30, blank=True, null=True)
    help_text = models.TextField(_("توضیح راهنما برای خریداران"), blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("تعریف ویژگی")
        verbose_name_plural = _("تعاریف ویژگیها")

    def __str__(self):
        return self.name


class ProductAttributeValue(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes_values', verbose_name=_("محصول"))
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE, verbose_name=_("ویژگی"))
    value = models.CharField(_("مقدار متنی"), max_length=255, blank=True, null=True)
    value_number = models.DecimalField(_("مقدار عددی"), max_digits=10, decimal_places=2, blank=True, null=True)
    value_boolean = models.BooleanField(_("مقدار بله/خیر"), blank=True, null=True)

    class Meta:
        verbose_name = _("مقدار ویژگی محصول")
        verbose_name_plural = _("مقادیر ویژگیهای محصولات")
        unique_together = ('product', 'attribute')


# ==============================================================================
# ۷. نقاط قوت / ویژگیهای کلیدی کالا (Key Features)
# ==============================================================================
class ProductKeyFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='key_features', verbose_name=_("محصول"))
    title = models.CharField(_("عنوان نقطه قوت"), max_length=150)
    display_order = models.PositiveIntegerField(_("ترتیب"), default=0)

    class Meta:
        verbose_name = _("نقطه قوت کالا")
        verbose_name_plural = _("نقاط قوت کالا")
        ordering = ['display_order']


# ==============================================================================
# ۸. گالری تصاویر محصول (Product Gallery)
# ==============================================================================
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery', verbose_name=_("محصول"))
    image = models.ImageField(_("تصویر گالری"), upload_to="products/gallery/")
    order = models.PositiveIntegerField(_("ترتیب نمایش"), default=0)

    class Meta:
        verbose_name = _("تصویر گالری")
        verbose_name_plural = _("گالری تصاویر کالا")
        ordering = ['order']
`;


  const adminCode = `from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import (
    Category,
    ProductBrand,
    ProductHologram,
    Product,
    ProductTierDiscount,
    ProductAttribute,
    ProductAttributeValue,
    ProductKeyFeature,
    ProductImage,
)

def to_jalali_str(dt):
    """تبدیل تاریخ میلادی به تاریخ شمسی با پشتیبانی از jalali_date، jdatetime و الگوریتم داخلی"""
    if not dt:
        return "-"
    try:
        from jalali_date import datetime2jalali
        jalali_dt = datetime2jalali(dt)
        return jalali_dt.strftime('%Y/%m/%d - %H:%M')
    except Exception:
        pass

    try:
        import jdatetime
        j_dt = jdatetime.datetime.fromtimestamp(dt.timestamp())
        return j_dt.strftime('%Y/%m/%d - %H:%M')
    except Exception:
        pass

    # الگوریتم تبدیل میلادی به شمسی بدون نیاز به پکیج خارجی
    g_y, g_m, g_d = dt.year, dt.month, dt.day
    g_days_in_month = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (g_y % 4 == 0 and g_y % 100 != 0) or (g_y % 400 == 0):
        g_days_in_month[2] = 29
    
    gy = g_y - 1600
    gm = g_m - 1
    gd = g_d - 1

    g_day_no = 365 * gy + gy // 4 - gy // 100 + gy // 400
    for i in range(gm):
        g_day_no += g_days_in_month[i + 1]
    g_day_no += gd

    j_day_no = g_day_no - 79
    j_np = j_day_no // 12053
    j_day_no %= 12053

    jy = 979 + 33 * j_np + 4 * (j_day_no // 1461)
    j_day_no %= 1461

    if j_day_no >= 366:
        jy += (j_day_no - 1) // 365
        j_day_no = (j_day_no - 1) % 365

    j_months = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
    jm = 0
    for i in range(1, 13):
        if j_day_no < j_months[i]:
            jm = i
            break
        j_day_no -= j_months[i]
    jd = j_day_no + 1

    time_str = dt.strftime('%H:%M')
    return f"{jy:04d}/{jm:02d}/{jd:02d} - {time_str}"


# ==============================================================================
# ۱. مدیریت دسته‌بندی‌ها (Category Admin)
# ==============================================================================
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_en', 'slug', 'color_badge', 'created_at_jalali']
    search_fields = ['name', 'name_en', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['-id']

    @admin.display(description=_('تاریخ ثبت (شمسی)'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)

    @admin.display(description=_('رنگ شناسه'))
    def color_badge(self, obj):
        color = obj.color or '#3B82F6'
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">{}</span>',
            color,
            color
        )


# ==============================================================================
# ۲. مدیریت برندهای کالا (Product Brand Admin)
# ==============================================================================
@admin.register(ProductBrand)
class ProductBrandAdmin(admin.ModelAdmin):
    list_display = ['id', 'logo_preview', 'name', 'name_en', 'country', 'created_at_jalali']
    readonly_fields = ['logo_preview']
    fields = ['name', 'name_en', 'slug', 'logo', 'logo_preview', 'country', 'description']
    list_filter = ['country']
    search_fields = ['name', 'name_en', 'slug']
    prepopulated_fields = {'slug': ('name',)}

    @admin.display(description=_('تاریخ ثبت (شمسی)'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)

    @admin.display(description=_("پیش‌نمایش تصویر لوگو"))
    def logo_preview(self, obj):
        if obj.logo:
            url = obj.logo.url if hasattr(obj.logo, 'url') else str(obj.logo)
            return format_html('<img src="{}" style="max-width: 100px; max-height: 60px; border-radius: 8px; object-fit: contain; border: 1px solid #cbd5e1; padding: 3px; background: #ffffff;" />', url)
        return format_html('<span style="color: #94a3b8; font-size: 12px; font-weight: 500;">بدون تصویر لوگو</span>')


# نام مستعار جهت پشتیبانی از پروژه‌هایی که از BrandAdmin استفاده می‌کنند
BrandAdmin = ProductBrandAdmin


# ==============================================================================
# ۳. مدیریت هولوگرام و اصالت کالا (Product Hologram Admin)
# ==============================================================================
@admin.register(ProductHologram)
class ProductHologramAdmin(admin.ModelAdmin):
    list_display = ['title', 'issuer_org', 'country_origin', 'security_level', 'is_verified', 'updated_at_jalali']
    list_filter = ['is_verified', 'security_level']
    search_fields = ['title', 'issuer_org', 'country_origin', 'security_specs']

    @admin.display(description=_('تاریخ بروزرسانی (شمسی)'), ordering='updated_at')
    def updated_at_jalali(self, obj):
        return to_jalali_str(obj.updated_at)


# ==============================================================================
# ۴. اینلاین‌های محصول (Product Inlines)
# ==============================================================================
class ProductTierDiscountInline(admin.TabularInline):
    model = ProductTierDiscount
    extra = 1

class ProductAttributeValueInline(admin.TabularInline):
    model = ProductAttributeValue
    extra = 1

class ProductKeyFeatureInline(admin.TabularInline):
    model = ProductKeyFeature
    extra = 1

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


# ==============================================================================
# ۵. مدیریت اصلی محصولات (Product Admin)
# ==============================================================================
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'barcode',
        'category',
        'brand',
        'carton_price_toman',
        'stock_cartons',
        'badge_display',
        'is_active',
        'created_at_jalali',
    ]
    list_filter = [
        'is_active',
        'badge',
        'category',
        'brand',
        'has_carton',
        'has_box',
        'is_pos_only',
    ]
    search_fields = ['name', 'name_en', 'barcode', 'slug', 'focus_keyword']
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ['category', 'brand', 'hologram']

    inlines = [
        ProductTierDiscountInline,
        ProductAttributeValueInline,
        ProductKeyFeatureInline,
        ProductImageInline,
    ]

    fieldsets = (
        (_('شناسنامه و اطلاعات پایه کالا'), {
            'fields': (
                'name',
                'name_en',
                'slug',
                'barcode',
                'category',
                'brand',
                'hologram',
                'country_origin',
                'badge',
            )
        }),
        (_('قیمت‌گذاری و انبارداری بنکداری (جنت‌آباد)'), {
            'fields': (
                ('carton_price', 'box_price', 'pack_price'),
                ('stock_cartons', 'boxes_per_carton', 'packs_per_box'),
                ('min_order_carton', 'min_order_box'),
                ('has_carton', 'has_box', 'is_pos_only'),
            )
        }),
        (_('مشخصات فنی و دخانیات (قطران و نیکوتین)'), {
            'fields': (
                ('tar', 'nicotine', 'carbon_monoxide'),
                ('cigarette_size', 'filter_type'),
            ),
            'classes': ('collapse',),
        }),
        (_('توضیحات و رسانه'), {
            'fields': ('excerpt', 'full_description', 'main_image'),
        }),
        (_('تنظیمات سئو پیشرفته (Yoast SEO)'), {
            'fields': ('focus_keyword', 'meta_title', 'meta_description', 'canonical_url'),
            'classes': ('collapse',),
        }),
        (_('وضعیت فعالیت'), {
            'fields': ('is_active',),
        }),
    )

    @admin.display(description=_('تاریخ ثبت (شمسی)'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)

    def carton_price_toman(self, obj):
        return f"{obj.carton_price:,} تومان"
    carton_price_toman.short_description = _('قیمت کارتن')

    def badge_display(self, obj):
        colors = {
            'none': '#64748b',
            'bestseller': '#ef4444',
            'special': '#f59e0b',
            'new': '#10b981',
            'discount': '#8b5cf6',
            'import': '#06b6d4',
        }
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 11px;">{}</span>',
            colors.get(obj.badge, '#64748b'),
            obj.get_badge_display()
        )
    badge_display.short_description = _('نشان محصول')


# ==============================================================================
# ۶. مدیریت تعاریف ویژگی‌ها (Product Attribute Admin)
# ==============================================================================
@admin.register(ProductAttribute)
class ProductAttributeAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
`;

  const serializersCode = `"""
products/serializers.py
سریالایزر DRF برای برندهای محصولات
"""

from rest_framework import serializers
from django.utils.text import slugify
from .models import ProductBrand

class ProductBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductBrand
        fields = ['id', 'name', 'name_en', 'slug', 'logo', 'country', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        name = attrs.get('name')
        slug = attrs.get('slug')
        
        # If slug is not provided, generate it from name
        if not slug and name:
            slug = slugify(name, allow_unicode=True)
            # Ensure slug is unique
            original_slug = slug
            counter = 1
            while ProductBrand.objects.filter(slug=slug).exists():
                slug = f"{original_slug}-{counter}"
                counter += 1
            attrs['slug'] = slug
        elif slug:
            # If slug IS provided, ensure it is unique
            if ProductBrand.objects.filter(slug=slug).exclude(pk=self.instance.pk if self.instance else None).exists():
                raise serializers.ValidationError({"slug": "این اسلاگ قبلاً ثبت شده است."})
                
        return attrs
`;


  const viewsCode = `"""
products/views.py
ویوهای محصولات با استفاده از ModelViewSet
"""

from rest_framework import viewsets, permissions
from .models import ProductBrand
from .serializers import ProductBrandSerializer

class ProductBrandViewSet(viewsets.ModelViewSet):
    queryset = ProductBrand.objects.all()
    serializer_class = ProductBrandSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()
`;
  const urlsCode = `"""
products/urls.py
مسیرهای برندها با استفاده از Router
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductBrandViewSet

router = DefaultRouter()
router.register(r'brands', ProductBrandViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
`;

  const notesCode = `## 📌 راهنمای جامع معماری یکپارچه کاتالوگ محصولات، دسته‌بندی‌ها، هولوگرام‌ها و ویژگی‌های فنی (products)

### 🧩 ۱. تجمیع کامل دسته‌بندی‌ها در اپلیکیشن \`products\`:
با تجمیع انجام شده، کلیه تعاریف دسته‌بندی، پالت‌های رنگی انتخابی (Choice)، ساختار درختی و شمارنده‌ها درون مدل \`Category\` در اپلیکیشن \`products\` قرار گرفته‌اند تا پیچیدگی وابستگی میان‌برنامه‌ای حذف شده و فرآیند مایگریشن و نگهداری دیتابیس در نهایت سادگی انجام شود.

---

### 🎨 ۲. سیستم پالت رنگی استاندارد (Color Choices):
برای دسته‌بندی‌ها و لیبل‌های هولوگرام، فیلد \`color\` از گزینه‌های استاندارد کد رنگ هگزادسیمال استفاده می‌کند:
* \`#3B82F6\`: آبی لاجوردی
* \`#10B981\`: سبز زمردی
* \`#8B5CF6\`: بنفش رویال
* \`#F59E0B\`: طلایی کهربایی
* \`#EF4444\`: قرمز یاقوتی
* \`#06B6D4\`: فیروزه‌ای
* \`#EC4899\`: صورتی سرخابی
* \`#64748B\`: طوسی اسلیتی
* \`#1E293B\`: دودی تاریک
* \`#D97706\`: مسی / برنزی

---

### 🛡️ ۳. سطوح اعتبار امنیتی هولوگرام (Security Levels):
در مدل \`ProductHologram\` فیلد \`security_level\` شامل گزینه‌های انتخابی زیر است:
1. **فوق امنیتی (\`maximum\`):** لیبل هولوگرام ۳ بعدی ضد جعل با میکروتکست مخفی.
2. **اعتبار بالا (\`high\`):** دارای QR کد استعلام آنی در بستر اینترنت.
3. **استاندارد شرکتی (\`standard\`):** هولوگرام شرکتی اصل دارای مهر سازمان ناظر.
4. **پایه و اقتصادی (\`economic\`):** برچسب ساده بدون استعلام آنلاین.

---

### ⚙️ ۴. انواع داده ویژگی‌های کالا (Attribute Data Types):
مدل \`ProductAttribute\` فیلد \`data_type\` را با مقادیر زیر ارائه می‌دهد:
* **متن (\`text\`):** توضیحات متنی کوتاه نظیر کشور تولیدکننده یا نوع توتون.
* **عدد (\`number\`):** مقدار عددی به همراه واحد سنجش (مانند نیکوتین 0.5 mg یا قطران 6 mg).
* **انتخابی (\`select\`):** فیلتر زغالی، فیلتر استاندارد، طعم‌دار کپسولی و ...
* **بولی (\`boolean\`):** سوئیچ بله/خیر مانند "دارای کپسول طعم‌دار" یا "کام سبک".

---

### 🔄 ۵. منطق تفکیک انتشار آنلاین و صندوق حضوری (\`is_pos_only\`):
* **محصولات عمومی (\`is_pos_only = False\`):** کالا هم در کاتالوگ فروش آنلاین سایت لود می‌شود و هم در پایانه صندوق فروشگاهی جهت اسکن بارکد در دسترس است.
* **محصولات اختصاصی صندوق (\`is_pos_only = True\`):** کالا از اندپوینت عمومی سایت فیلتر شده و منحصراً در اندپوینت صندوق (\`GET /api/v1/products/pos-catalog/\`) برای فروش حضوری نمایش داده می‌شود.
`;

  return (
    <AppDocTemplate
      appFolder="products"
      title="۶. اپلیکیشن کاتالوگ محصولات، دسته‌بندی‌ها، هولوگرام و ویژگی‌ها"
      titleEn="products / Unified Catalog, Categories, Holograms, Attributes & POS Sync App"
      badge="Unified Products App • Categories • Holograms • Dynamic Attributes • POS Sync"
      description="مدیریت یکپارچه کاتالوگ محصولات شامل ساختار درختی دسته‌بندی‌ها با پالت رنگی، هولوگرام‌های اصالت با مرجع صادرکننده و سطوح امنیتی، مشخصات و ویژگی‌های فنی داینامیک، ادیتور TinyMCE، بارکد اسکنر و همگام‌سازی دوطرفه سایت و صندوق (POS Sync)."
      icon={<Package className="w-6 h-6 text-amber-500" />}
      modelsCode={modelsCode}
      adminCode={adminCode}
      serializersCode={serializersCode}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
