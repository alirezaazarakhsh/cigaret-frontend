import React from 'react';
import { Package, Layers, ShieldCheck, Sliders, CheckCircle2 } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const ProductsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'products_category',
      verboseName: 'جدول دسته‌بندی‌های درختی محصولات (Categories)',
      description: 'ساختار درختی دسته‌بندی‌ها با شناسه سیستمی (اسلاگ فارسی سئو)، پالت رنگی استاندارد (Choice)، آیکون، تصویر و شمارنده محصولات',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'name', type: 'CharField(max_length=150)', verbose: 'عنوان دسته‌بندی (فارسی) *' },
        { name: 'name_en', type: 'CharField(max_length=150, blank=True)', verbose: 'نام لاتین (English)' },
        { name: 'slug', type: 'SlugField(max_length=160)', isUnique: true, verbose: 'شناسه سیستمی (Slug / ID)' },
        { name: 'color', type: 'CharField(max_length=30, choices=COLOR_CHOICES)', verbose: 'رنگ شناسه (انتخابی Choice)' },
        { name: 'description', type: 'TextField(blank=True)', verbose: 'توضیحات کوتاه دسته‌بندی' },
        { name: 'icon', type: 'CharField(max_length=60, default="Layers")', verbose: 'نام آیکون نمایشی' },
        { name: 'image', type: 'ImageField(upload_to="categories/", blank=True)', verbose: 'تصویر شاخص دسته‌بندی' },
        { name: 'parent_id', type: 'ForeignKey(self)', isFk: true, fkTarget: 'products_category', verbose: 'دسته مادر (والد - ساختار درختی)' },
        { name: 'display_order', type: 'PositiveIntegerField(default=0)', verbose: 'ترتیب نمایش' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'وضعیت فعال بودن' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ایجاد' },
        { name: 'updated_at', type: 'DateTimeField', verbose: 'تاریخ آخرین ویرایش' },
      ]
    },
    {
      name: 'products_producthologram',
      verboseName: 'جدول هولوگرام‌ها و برچسب‌های اصالت کالا (Product Authenticity)',
      description: 'تعریف جامع هولوگرام با مرجع صادرکننده، کشور/حوزه، سطح اعتبار امنیتی انتخابی (Choice)، رنگ بج و مشخصات فنی امنیتی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'title', type: 'CharField(max_length=120)', verbose: 'عنوان هولوگرام / برچسب اصالت *' },
        { name: 'issuer_org', type: 'CharField(max_length=150)', verbose: 'مرجع صادرکننده یا سازمان ناظر' },
        { name: 'country_origin', type: 'CharField(max_length=100)', verbose: 'کشور / حوزه مبدا' },
        { name: 'security_level', type: 'CharField(max_length=30, choices=SECURITY_LEVELS)', verbose: 'سطح اعتبار امنیتی (انتخابی Choice)' },
        { name: 'badge_color', type: 'CharField(max_length=30, choices=COLOR_CHOICES)', verbose: 'رنگ لیبل / بج نمایشی' },
        { name: 'security_specs', type: 'TextField(blank=True)', verbose: 'مشخصات فنی و امنیتی (توضیحات)' },
        { name: 'is_verified', type: 'BooleanField(default=True)', verbose: 'دارای استعلام اصالت بارکد / QR' },
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
        { name: 'is_required', type: 'BooleanField(default=False)', verbose: 'تکمیل اجباری' },
        { name: 'display_order', type: 'PositiveIntegerField(default=0)', verbose: 'ترتیب نمایش' },
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
      description: 'کاتالوگ کالاها شامل قیمت کارتن، باکس، پاکت، بارکدخوان، دسته‌بندی، هولوگرام، همگام‌سازی دوطرفه آنلاین/صندوق (is_pos_only) و ادیتور TinyMCE',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'name', type: 'CharField(max_length=200)', verbose: 'نام کامل کالا (فارسی) *' },
        { name: 'name_en', type: 'CharField(max_length=200, blank=True)', verbose: 'نام انگلیسی / لاتین' },
        { name: 'slug', type: 'SlugField(max_length=220)', isUnique: true, verbose: 'اسلاگ فارسی سئو' },
        { name: 'brand', type: 'CharField(max_length=100)', verbose: 'برند (وینستون، کنت، مارلبرو و ...)' },
        { name: 'category_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_category', verbose: 'دسته‌بندی مربوطه' },
        { name: 'barcode', type: 'CharField(max_length=60, blank=True, db_index=True)', verbose: 'بارکد اسکنر فروشگاهی / GTIN' },
        { name: 'hologram_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_producthologram', verbose: 'هولوگرام و اصالت کالا' },
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
      description: 'دریافت فهرست تمام دسته‌بندی‌ها به همراه رنگ شناسه، آیکون و تعداد کالاها',
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
      "description": "انواع برندهای شرکتی با هولوگرام معتبر دخانیات",
      "icon": "Layers",
      "image": "/media/categories/iranian.webp",
      "products_count": 48,
      "is_active": true
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/products/categories/',
      auth: 'IsAdminUser',
      description: 'ایجاد دسته‌بندی جدید با انتخاب پالت رنگی (Choice)، نام فارسی، نام لاتین، اسلاگ و توضیحات',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/products/categories/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "سیگار وارداتی اصل",
    "name_en": "Imported Cigarettes",
    "slug": "imported-cigarettes",
    "color": "#10B981",
    "description": "محصولات وارداتی اصل سفارش اروپا و امارات",
    "icon": "Package"
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
      "help_text": "میزان نیکوتین آزمایشگاهی در هر نخ",
      "is_required": false,
      "display_order": 1
    },
    {
      "id": 2,
      "name": "نوع فیلتر",
      "name_en": "Filter Type",
      "data_type": "select",
      "data_type_display": "انتخابی / چندگزینه‌ای",
      "unit": null,
      "help_text": "جنس فیلتر زغالی، استاندارد، استات یا طعم‌دار کپسولی",
      "is_required": false,
      "display_order": 2
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

  const modelsCode = `"""
products/models.py
مدل یکپارچه کاتالوگ محصولات، دسته‌بندی‌های درختی، هولوگرام اصالت، ویژگی‌های داینامیک،
همگام‌سازی دوطرفه سایت و صندوق حضوری (is_pos_only)، بارکد اسکنر و ادیتور TinyMCE
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField

# ==========================================
# گزینه‌های انتخابی ثابت (Choice Tuples)
# ==========================================

COLOR_CHOICES = (
    ('#3B82F6', _('آبی لاجوردی (#3B82F6)')),
    ('#10B981', _('سبز زمردی (#10B981)')),
    ('#8B5CF6', _('بنفش رویال (#8B5CF6)')),
    ('#F59E0B', _('طلایی کهربایی (#F59E0B)')),
    ('#EF4444', _('قرمز یاقوتی (#EF4444)')),
    ('#06B6D4', _('فیروزه‌ای (#06B6D4)')),
    ('#EC4899', _('صورتی سرخابی (#EC4899)')),
    ('#64748B', _('طوسی اسلیتی (#64748B)')),
    ('#1E293B', _('دودی تاریک (#1E293B)')),
    ('#D97706', _('مسی / برنزی (#D97706)')),
)

SECURITY_LEVEL_CHOICES = (
    ('maximum', _('فوق امنیتی / لیبل هولوگرام ۳ بعدی ضد جعل')),
    ('high', _('اعتبار بالا / دارای QR استعلام آنی آنلاین')),
    ('standard', _('استاندارد شرکتی اصل')),
    ('economic', _('پایه / اقتصادی بدون استعلام')),
)

DATA_TYPE_CHOICES = (
    ('text', _('متن کوتاه / رشته')),
    ('number', _('عددی (صحیح یا اعشاری)')),
    ('select', _('انتخابی / چندگزینه‌ای')),
    ('boolean', _('بله / خیر (سوئیچ دو وضعیتی)')),
    ('color', _('کد رنگ')),
)


# ==========================================
# ۱. مدل دسته‌بندی‌های درختی (Category)
# ==========================================

class Category(models.Model):
    """
    مدل دسته‌بندی جامع کالاها (انتقال‌یافته به اپ products):
    دارای عنوان فارسی، نام لاتین، شناسه سیستمی (اسلاگ)، پالت رنگی انتخابی، آیکون و ساختار درختی
    """
    name = models.CharField(_("عنوان دسته‌بندی (فارسی)"), max_length=150)
    name_en = models.CharField(_("نام لاتین (English)"), max_length=150, blank=True, null=True)
    slug = models.SlugField(_("شناسه سیستمی (Slug / ID)"), max_length=160, unique=True, allow_unicode=True)
    color = models.CharField(_("رنگ شناسه"), max_length=30, choices=COLOR_CHOICES, default="#3B82F6")
    description = models.TextField(_("توضیحات کوتاه دسته‌بندی"), blank=True, null=True)
    icon = models.CharField(_("نام آیکون نمایشی"), max_length=60, default='Layers')
    image = models.ImageField(_("تصویر شاخص دسته‌بندی"), upload_to='categories/', blank=True, null=True)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='children',
        verbose_name=_("دسته مادر (والد)")
    )
    display_order = models.PositiveIntegerField(_("ترتیب نمایش"), default=0)
    is_active = models.BooleanField(_("وضعیت فعال"), default=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین ویرایش"), auto_now=True)

    class Meta:
        verbose_name = _("دسته‌بندی")
        verbose_name_plural = _("دسته‌بندی‌های محصولات")
        ordering = ['display_order', 'name']

    def __str__(self):
        return f"{self.name} ({self.slug})"


# ==========================================
# ۲. مدل هولوگرام و اصالت کالا (ProductHologram)
# ==========================================

class ProductHologram(models.Model):
    """
    مدل تعریف برچسب‌های ضمانت اصالت کالا و هولوگرام اختصاصی:
    شامل عنوان، مرجع صادرکننده، کشور/حوزه، سطح اعتبار امنیتی انتخابی، رنگ بج و مشخصات فنی امنیتی
    """
    title = models.CharField(_("عنوان هولوگرام / برچسب اصالت"), max_length=120)
    issuer_org = models.CharField(_("مرجع صادرکننده یا سازمان ناظر"), max_length=150, default="شرکت بازرگانی آذرخش")
    country_origin = models.CharField(_("کشور / حوزه مبدا"), max_length=100, default="امارات / دبی")
    security_level = models.CharField(_("سطح اعتبار امنیتی"), max_length=30, choices=SECURITY_LEVEL_CHOICES, default='high')
    badge_color = models.CharField(_("رنگ لیبل نمایشی"), max_length=30, choices=COLOR_CHOICES, default="#10B981")
    security_specs = models.TextField(
        _("مشخصات فنی و امنیتی"), 
        blank=True, 
        null=True,
        help_text=_("توضیحات مشخصات فنی، کد رهگیری، ویژگی‌های بصری یا فیچرهای امنیتی هولوگرام")
    )
    is_verified = models.BooleanField(_("دارای استعلام اصالت بارکد / QR"), default=True)
    created_at = models.DateTimeField(_("تاریخ ثبت هولوگرام"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("هولوگرام و اصالت")
        verbose_name_plural = _("هولوگرام‌های اصالت کالا")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_security_level_display()}"


# ==========================================
# ۳. مدل ویژگی‌های محصول (ProductAttribute)
# ==========================================

class ProductAttribute(models.Model):
    """
    تعریف مشخصات و ویژگی‌های فنی کالا:
    مانند میزان نیکوتین، قطران، نوع فیلتر، سال ساخت، کشور سازنده، جنس توتون و ...
    """
    name = models.CharField(_("عنوان ویژگی به فارسی"), max_length=100)
    name_en = models.CharField(_("عنوان لاتین (English)"), max_length=100, blank=True, null=True)
    data_type = models.CharField(_("نوع داده"), max_length=20, choices=DATA_TYPE_CHOICES, default='text')
    unit = models.CharField(_("واحد سنجش (اختیاری)"), max_length=30, blank=True, null=True, help_text=_("مثال: mg، میلی‌گرم، درصد، mm، سال"))
    help_text = models.TextField(_("توضیح راهنما برای خریداران"), blank=True, null=True)
    is_required = models.BooleanField(_("تکمیل اجباری"), default=False)
    display_order = models.PositiveIntegerField(_("ترتیب نمایش"), default=0)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("ویژگی محصول")
        verbose_name_plural = _("ویژگی‌ها و مشخصات فنی کالاها")
        ordering = ['display_order', 'name']

    def __str__(self):
        unit_str = f" ({self.unit})" if self.unit else ""
        return f"{self.name}{unit_str} [{self.get_data_type_display()}]"


# ==========================================
# ۴. مدل کاتالوگ کالا و همگام‌سازی صندوق (Product)
# ==========================================

class Product(models.Model):
    """
    مدل جامع کاتالوگ محصولات با همگام‌سازی دوطرفه آنلاین و صندوق حضوری:
    - فیلد is_pos_only: اگر True باشد کالا فقط در صندوق حضوری فروش می‌رود و در سایت آنلاین نمایش داده نمی‌شود.
    - اگر False باشد، کالا هم در سایت و هم در صندوق به صورت همگام در دسترس است.
    """
    name = models.CharField(_("نام کالا (فارسی)"), max_length=200)
    name_en = models.CharField(_("نام انگلیسی / لاتین"), max_length=200, blank=True, null=True)
    slug = models.SlugField(_("اسلاگ سئو (URL)"), max_length=220, unique=True, allow_unicode=True)
    brand = models.CharField(_("برند کالا"), max_length=100)
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='products',
        verbose_name=_("دسته‌بندی")
    )
    barcode = models.CharField(_("بارکد اسکنر فروشگاهی (GTIN/EAN)"), max_length=60, blank=True, null=True, db_index=True)
    hologram = models.ForeignKey(
        ProductHologram,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name=_("هولوگرام و اصالت کالا")
    )
    
    # ساختار قیمت‌گذاری چند سطحی
    box_price = models.DecimalField(_("قیمت هر باکس (تومان)"), max_digits=12, decimal_places=0)
    boxes_per_carton = models.PositiveIntegerField(_("تعداد باکس در هر کارتن"), default=50)
    carton_price = models.DecimalField(_("قیمت هر کارتن (تومان)"), max_digits=14, decimal_places=0, blank=True, null=True)
    pack_price = models.DecimalField(_("قیمت هر پاکت (تومان)"), max_digits=12, decimal_places=0, default=0)
    packs_per_box = models.PositiveIntegerField(_("تعداد پاکت در هر باکس"), default=10)
    purchase_price = models.DecimalField(_("قیمت تمام‌شده خرید انبار"), max_digits=14, decimal_places=0, default=0)
    
    # موجودی انبار
    stock_cartons = models.PositiveIntegerField(_("موجودی انبار (کارتن)"), default=0)
    stock_boxes = models.PositiveIntegerField(_("موجودی انبار (باکس خرد)"), default=0)
    
    # مدیا و محتوا با TinyMCE
    image = models.ImageField(_("تصویر شاخص"), upload_to='products/', blank=True, null=True)
    full_description = HTMLField(_("توضیحات غنی (TinyMCE)"), blank=True, null=True)
    excerpt = models.TextField(_("خلاصه کوتاه کالا"), blank=True, null=True)
    
    # کنترل کانال فروش و همگام‌سازی آنلاین / صندوق (POS Sync)
    is_pos_only = models.BooleanField(
        _("اختصاصی صندوق فروشگاهی (عدم نمایش آنلاین)"), 
        default=False, 
        db_index=True,
        help_text=_("اگر فعال باشد، محصول فقط در سیستم صندوق حضوری اضافه و فروخته می‌شود و در سایت آنلاین نمایش داده نمی‌شود.")
    )
    is_box_only = models.BooleanField(_("فروش منحصراً باکسی"), default=False)
    has_carton = models.BooleanField(_("امکان فروش کارتنی"), default=True)
    has_box = models.BooleanField(_("امکان فروش باکسی"), default=True)
    has_pack = models.BooleanField(_("امکان فروش پاکتی"), default=False)
    
    is_active = models.BooleanField(_("فعال جهت سفارش"), default=True)
    is_featured = models.BooleanField(_("پیشنهاد ویژه صفحه اصلی"), default=False)
    created_at = models.DateTimeField(_("تاریخ ثبت"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("محصول")
        verbose_name_plural = _("مدیریت کاتالوگ کالاها و انبار")
        ordering = ['-created_at']

    def __str__(self):
        pos_badge = " [صندوق حضوری]" if self.is_pos_only else " [آنلاین و صندوق]"
        return f"{self.name} ({self.brand}){pos_badge}"

    def save(self, *args, **kwargs):
        if self.box_price and self.boxes_per_carton and not self.carton_price:
            self.carton_price = self.box_price * self.boxes_per_carton
        super().save(*args, **kwargs)


# ==========================================
# ۵. مدل مقادیر ویژگی‌های محصول (AttributeValue)
# ==========================================

class ProductAttributeValue(models.Model):
    """
    مقدار ویژگی برای یک محصول مشخص
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes_values', verbose_name=_("محصول"))
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE, related_name='product_values', verbose_name=_("ویژگی"))
    value = models.CharField(_("مقدار متنی ویژگی"), max_length=255, blank=True, null=True)
    value_number = models.DecimalField(_("مقدار عددی"), max_digits=10, decimal_places=2, blank=True, null=True)
    value_boolean = models.BooleanField(_("مقدار بولی"), blank=True, null=True)

    class Meta:
        verbose_name = _("مقدار ویژگی کالا")
        verbose_name_plural = _("مقادیر ویژگی‌های کالاها")
        unique_together = ('product', 'attribute')

    def __str__(self):
        return f"{self.product.name} -> {self.attribute.name}: {self.value or self.value_number or self.value_boolean}"


# ==========================================
# ۶. مدل تصاویر گالری کالا (ProductImage)
# ==========================================

class ProductImage(models.Model):
    """
    گالری چندگانه تصاویر کالا
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery', verbose_name=_("محصول"))
    image = models.ImageField(_("تصویر گالری"), upload_to='products/gallery/')
    order = models.PositiveIntegerField(_("ترتیب نمایش"), default=0)

    class Meta:
        verbose_name = _("تصویر گالری")
        verbose_name_plural = _("گالری تصاویر کالا")
        ordering = ['order']
`;

  const adminCode = `"""
products/admin.py
پنل مدیریت یکپارچه محصولات، دسته‌بندی‌ها، هولوگرام‌ها و ویژگی‌های کالا در جنگو
با قابلیت جستجوی خودکار (autocomplete_fields)، اکشن‌های دسته‌جمعی، نمایش بج‌های رنگی و فیلترهای پیشرفته
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import (
    Category,
    ProductHologram,
    ProductAttribute,
    ProductAttributeValue,
    Product,
    ProductImage
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 2
    fields = ('image', 'order', 'preview_image')
    readonly_fields = ('preview_image',)

    @admin.display(description=_("پیش‌نمایش تصویر"))
    def preview_image(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 80px; border-radius: 6px; object-fit: cover;" />',
                obj.image.url
            )
        return "-"


class ProductAttributeValueInline(admin.TabularInline):
    model = ProductAttributeValue
    extra = 1
    autocomplete_fields = ['attribute']
    fields = ('attribute', 'value', 'value_number', 'value_boolean')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'name_en', 
        'slug', 
        'color_badge', 
        'parent', 
        'display_order', 
        'is_active',
        'created_at'
    )
    list_filter = ('is_active', 'color', 'created_at')
    search_fields = ('name', 'name_en', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ['parent']
    list_editable = ('display_order', 'is_active')
    ordering = ('display_order', 'name')

    @admin.display(description=_("پالت رنگی"))
    def color_badge(self, obj):
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 3px 10px; border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            obj.color or '#3B82F6',
            obj.get_color_display() if hasattr(obj, 'get_color_display') else obj.color
        )


@admin.register(ProductHologram)
class ProductHologramAdmin(admin.ModelAdmin):
    list_display = (
        'title', 
        'issuer_org', 
        'country_origin', 
        'security_badge', 
        'badge_color_display', 
        'is_verified',
        'updated_at'
    )
    list_filter = ('security_level', 'is_verified', 'badge_color')
    search_fields = ('title', 'issuer_org', 'country_origin', 'security_specs')
    ordering = ('-id',)

    @admin.display(description=_("سطح امنیت"))
    def security_badge(self, obj):
        colors = {
            'maximum': '#10B981',
            'high': '#3B82F6',
            'standard': '#F59E0B',
            'economic': '#64748B',
        }
        color = colors.get(obj.security_level, '#64748B')
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            color,
            obj.get_security_level_display() if hasattr(obj, 'get_security_level_display') else obj.security_level
        )

    @admin.display(description=_("رنگ لیبل"))
    def badge_color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 10px;">{}</span>',
            obj.badge_color or '#10B981',
            obj.badge_color
        )


@admin.register(ProductAttribute)
class ProductAttributeAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'name_en', 
        'data_type_badge', 
        'unit', 
        'is_required', 
        'display_order'
    )
    list_filter = ('data_type', 'is_required')
    search_fields = ('name', 'name_en', 'unit', 'help_text')
    list_editable = ('display_order', 'is_required')
    ordering = ('display_order', 'name')

    @admin.display(description=_("نوع داده"))
    def data_type_badge(self, obj):
        return format_html(
            '<span style="background-color: #f1f5f9; color: #1e293b; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px; border: 1px solid #cbd5e1;">{}</span>',
            obj.get_data_type_display() if hasattr(obj, 'get_data_type_display') else obj.data_type
        )


@admin.register(ProductAttributeValue)
class ProductAttributeValueAdmin(admin.ModelAdmin):
    list_display = ('product', 'attribute', 'value', 'value_number', 'value_boolean')
    list_filter = ('attribute', 'value_boolean')
    search_fields = ('product__name', 'attribute__name', 'value')
    autocomplete_fields = ['product', 'attribute']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'product_thumb',
        'name', 
        'brand', 
        'category', 
        'hologram',
        'barcode', 
        'box_price_formatted', 
        'carton_price_formatted', 
        'stock_status_badge', 
        'is_pos_only_badge', 
        'is_active', 
        'is_featured'
    )
    list_filter = (
        'is_pos_only', 
        'is_active', 
        'is_featured', 
        'category', 
        'brand', 
        'hologram',
        'created_at'
    )
    search_fields = ('name', 'name_en', 'brand', 'slug', 'barcode', 'excerpt')
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ['category', 'hologram']
    inlines = [ProductAttributeValueInline, ProductImageInline]
    list_editable = ('is_active', 'is_featured')
    readonly_fields = ('created_at', 'updated_at', 'preview_main_image')
    actions = [
        'make_active', 
        'make_inactive', 
        'toggle_pos_only_on', 
        'toggle_pos_only_off',
        'mark_as_featured',
        'unmark_as_featured'
    ]

    fieldsets = (
        (_('مشخصات اصلی کالا'), {
            'fields': (
                ('name', 'name_en'),
                ('slug', 'brand'),
                ('category', 'hologram'),
                ('barcode', 'is_active', 'is_featured')
            )
        }),
        (_('کانال عرضه و دسترسی'), {
            'fields': (
                ('is_pos_only', 'has_carton', 'has_box', 'has_pack', 'is_box_only'),
            ),
            'description': _('تعیین اینکه آیا محصول فقط اختصاصی صندوق حضوری است یا در سایت آنلاین نیز به فروش می‌رسد.')
        }),
        (_('قیمت‌گذاری و انبارداری (تومان)'), {
            'fields': (
                ('box_price', 'boxes_per_carton', 'carton_price'),
                ('pack_price', 'packs_per_box', 'purchase_price'),
                ('stock_cartons', 'stock_boxes')
            )
        }),
        (_('تصویر شاخص و توضیحات ادیتور'), {
            'fields': (
                ('image', 'preview_main_image'),
                'excerpt',
                'full_description'
            )
        }),
        (_('اطلاعات سیستمی'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    @admin.display(description=_("تصویر"))
    def product_thumb(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;" />',
                obj.image.url
            )
        return format_html('<div style="width: 40px; height: 40px; border-radius: 8px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748b;">بدون عکس</div>')

    @admin.display(description=_("پیش‌نمایش تصویر اصلی"))
    def preview_main_image(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 150px; border-radius: 12px; object-fit: contain; border: 1px solid #e2e8f0;" />',
                obj.image.url
            )
        return _("تصویری آپلود نشده است")

    @admin.display(description=_("قیمت باکس"))
    def box_price_formatted(self, obj):
        if obj.box_price:
            return f"{int(obj.box_price):,} تومان"
        return "-"

    @admin.display(description=_("قیمت کارتن"))
    def carton_price_formatted(self, obj):
        if obj.carton_price:
            return f"{int(obj.carton_price):,} تومان"
        return "-"

    @admin.display(description=_("موجودی انبار"))
    def stock_status_badge(self, obj):
        if obj.stock_cartons > 10:
            color = '#10B981'
            label = f"{obj.stock_cartons} کارتن"
        elif obj.stock_cartons > 0:
            color = '#F59E0B'
            label = f"{obj.stock_cartons} کارتن (موجودی محدود)"
        else:
            color = '#EF4444'
            label = "اتمام موجودی"
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            color,
            label
        )

    @admin.display(description=_("کانال فروش"))
    def is_pos_only_badge(self, obj):
        if obj.is_pos_only:
            return format_html(
                '<span style="background-color: #8b5cf6; color: #fff; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 10px;">فقط صندوق POS</span>'
            )
        return format_html(
            '<span style="background-color: #06b6d4; color: #fff; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 10px;">آنلاین + صندوق</span>'
        )

    # -----------------------------
    # اکشن‌های اختصاصی ادمین جنگو
    # -----------------------------
    @admin.action(description=_("✔ فعال‌سازی محصولات انتخاب‌شده"))
    def make_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} محصول با موفقیت فعال گردید.")

    @admin.action(description=_("⛔ غیرفعال‌سازی محصولات انتخاب‌شده"))
    def make_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} محصول غیرفعال شد.")

    @admin.action(description=_("🏢 تغییر کانال به «فقط صندوق حضوری POS»"))
    def toggle_pos_only_on(self, request, queryset):
        updated = queryset.update(is_pos_only=True)
        self.message_user(request, f"{updated} محصول به حالت اختصاصی صندوق حضوری تغییر یافتند.")

    @admin.action(description=_("🌐 تغییر کانال به «فروش آنلاین سایت + صندوق»"))
    def toggle_pos_only_off(self, request, queryset):
        updated = queryset.update(is_pos_only=False)
        self.message_user(request, f"{updated} محصول جهت فروش آنلاین در سایت فعال گردیدند.")

    @admin.action(description=_("⭐ افزودن به پیشنهادات ویژه صفحه اصلی"))
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f"{updated} محصول به عنوان پیشنهاد ویژه علامت‌گذاری شدند.")

    @admin.action(description=_("✖ حذف از پیشنهادات ویژه"))
    def unmark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f"{updated} محصول از پیشنهاد ویژه خارج شدند.")
`;

  const serializersCode = `"""
products/serializers.py
سریالایزرهای جامع DRF برای کاتالوگ، دسته‌بندی‌ها، هولوگرام‌ها، ویژگی‌های کالا و همگام‌سازی صندوق
"""

from rest_framework import serializers
from .models import (
    Category,
    ProductHologram,
    ProductAttribute,
    ProductAttributeValue,
    Product,
    ProductImage
)


# ==========================================
# ۱. سریالایزر دسته‌بندی‌ها
# ==========================================

class CategorySerializer(serializers.ModelSerializer):
    color_display = serializers.CharField(source='get_color_display', read_only=True)
    products_count = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'color',
            'color_display',
            'description',
            'icon',
            'image',
            'parent',
            'display_order',
            'is_active',
            'products_count',
            'children',
            'created_at',
            'updated_at'
        ]

    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []


# ==========================================
# ۲. سریالایزر هولوگرام و اصالت کالا
# ==========================================

class ProductHologramSerializer(serializers.ModelSerializer):
    security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)
    badge_color_display = serializers.CharField(source='get_badge_color_display', read_only=True)

    class Meta:
        model = ProductHologram
        fields = [
            'id',
            'title',
            'issuer_org',
            'country_origin',
            'security_level',
            'security_level_display',
            'badge_color',
            'badge_color_display',
            'security_specs',
            'is_verified',
            'created_at',
            'updated_at'
        ]


# ==========================================
# ۳. سریالایزر ویژگی‌ها و مشخصات فنی کالا
# ==========================================

class ProductAttributeSerializer(serializers.ModelSerializer):
    data_type_display = serializers.CharField(source='get_data_type_display', read_only=True)

    class Meta:
        model = ProductAttribute
        fields = [
            'id',
            'name',
            'name_en',
            'data_type',
            'data_type_display',
            'unit',
            'help_text',
            'is_required',
            'display_order',
            'created_at'
        ]


class ProductAttributeValueSerializer(serializers.ModelSerializer):
    attribute_name = serializers.CharField(source='attribute.name', read_only=True)
    attribute_name_en = serializers.CharField(source='attribute.name_en', read_only=True)
    unit = serializers.CharField(source='attribute.unit', read_only=True)
    data_type = serializers.CharField(source='attribute.data_type', read_only=True)

    class Meta:
        model = ProductAttributeValue
        fields = [
            'id',
            'attribute',
            'attribute_name',
            'attribute_name_en',
            'unit',
            'data_type',
            'value',
            'value_number',
            'value_boolean'
        ]


# ==========================================
# ۴. سریالایزر تصاویر و کاتالوگ محصول
# ==========================================

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'order']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    attributes_values = ProductAttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'brand',
            'barcode',
            'category',
            'category_name',
            'category_color',
            'hologram',
            'hologram_detail',
            'box_price',
            'boxes_per_carton',
            'carton_price',
            'pack_price',
            'packs_per_box',
            'purchase_price',
            'stock_cartons',
            'stock_boxes',
            'image',
            'gallery',
            'attributes_values',
            'is_pos_only',
            'is_box_only',
            'has_carton',
            'has_box',
            'has_pack',
            'is_active',
            'is_featured',
            'created_at',
            'updated_at'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    attributes_values = ProductAttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'brand',
            'barcode',
            'category',
            'category_detail',
            'hologram',
            'hologram_detail',
            'box_price',
            'boxes_per_carton',
            'carton_price',
            'pack_price',
            'packs_per_box',
            'purchase_price',
            'stock_cartons',
            'stock_boxes',
            'image',
            'gallery',
            'attributes_values',
            'full_description',
            'excerpt',
            'is_pos_only',
            'is_box_only',
            'has_carton',
            'has_box',
            'has_pack',
            'is_active',
            'is_featured',
            'created_at',
            'updated_at'
        ]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name',
            'name_en',
            'slug',
            'brand',
            'barcode',
            'category',
            'hologram',
            'box_price',
            'boxes_per_carton',
            'carton_price',
            'pack_price',
            'packs_per_box',
            'purchase_price',
            'stock_cartons',
            'stock_boxes',
            'image',
            'full_description',
            'excerpt',
            'is_pos_only',
            'is_box_only',
            'has_carton',
            'has_box',
            'has_pack',
            'is_active',
            'is_featured'
        ]
`;

  const viewsCode = `"""
products/views.py
ویوهای اختصاصی APIView برای مدیریت جامع دسته‌بندی‌ها، هولوگرام‌ها، ویژگی‌های کالا،
کاتالوگ آنلاین و همگام‌سازی لحظه‌ای صندوق فروشگاهی (POS Sync)
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import (
    Category,
    ProductHologram,
    ProductAttribute,
    ProductAttributeValue,
    Product,
    ProductImage
)
from .serializers import (
    CategorySerializer,
    ProductHologramSerializer,
    ProductAttributeSerializer,
    ProductAttributeValueSerializer,
    ProductSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer
)


# ==========================================
# ۱. ویوهای مدیریت دسته‌بندی‌ها (CRUD)
# ==========================================

class CategoryListCreateAPIView(APIView):
    """
    دریافت فهرست دسته‌بندی‌ها یا ثبت دسته‌بندی جدید با انتخاب پالت رنگی (Choice)
    """
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت لیست دسته‌بندی‌های کالاها (عمومی)",
        responses={200: CategorySerializer(many=True)}
    )
    def get(self, request):
        queryset = Category.objects.filter(is_active=True).order_by('display_order', 'name')
        serializer = CategorySerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ایجاد دسته‌بندی جدید (مدیریت)",
        request_body=CategorySerializer,
        responses={201: CategorySerializer}
    )
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save()
            return Response({
                'status': 'success',
                'message': 'دسته‌بندی جدید با موفقیت ایجاد گردید.',
                'data': CategorySerializer(category).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailUpdateDeleteAPIView(APIView):
    """
    مشاهده، ویرایش و حذف یک دسته‌بندی مشخص
    """
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        return Response({'status': 'success', 'data': CategorySerializer(category).data})

    def put(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات دسته‌بندی با موفقیت ویرایش شد.',
                'data': CategorySerializer(updated).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        category.delete()
        return Response({'status': 'success', 'message': 'دسته‌بندی با موفقیت حذف گردید.'})


# ==========================================
# ۲. ویوهای مدیریت هولوگرام‌ها و اصالت کالا (CRUD)
# ==========================================

class HologramListCreateAPIView(APIView):
    """
    دریافت لیست هولوگرام‌ها و سطوح اصالت، یا ایجاد هولوگرام جدید با سطح اعتبار انتخابی (Choice)
    """
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت لیست هولوگرام‌های اصالت کالا",
        responses={200: ProductHologramSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProductHologram.objects.all().order_by('-created_at')
        serializer = ProductHologramSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ثبت هولوگرام اصالت جدید (مدیریت)",
        request_body=ProductHologramSerializer,
        responses={201: ProductHologramSerializer}
    )
    def post(self, request):
        serializer = ProductHologramSerializer(data=request.data)
        if serializer.is_valid():
            hologram = serializer.save()
            return Response({
                'status': 'success',
                'message': 'برچسب هولوگرام با موفقیت ثبت شد.',
                'data': ProductHologramSerializer(hologram).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HologramDetailUpdateDeleteAPIView(APIView):
    """
    مشاهده، ویرایش و حذف برچسب هولوگرام
    """
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get(self, request, pk):
        hologram = get_object_or_404(ProductHologram, pk=pk)
        return Response({'status': 'success', 'data': ProductHologramSerializer(hologram).data})

    def put(self, request, pk):
        hologram = get_object_or_404(ProductHologram, pk=pk)
        serializer = ProductHologramSerializer(hologram, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات هولوگرام با موفقیت بروزرسانی شد.',
                'data': ProductHologramSerializer(updated).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        hologram = get_object_or_404(ProductHologram, pk=pk)
        hologram.delete()
        return Response({'status': 'success', 'message': 'هولوگرام مورد نظر حذف گردید.'})


# ==========================================
# ۳. ویوهای ویژگی‌های کالا (Product Attributes)
# ==========================================

class ProductAttributeListCreateAPIView(APIView):
    """
    دریافت لیست ویژگی‌های کالا و تعریف ویژگی جدید با نوع داده انتخابی (Choice)
    """
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت لیست ویژگی‌ها و مشخصات فنی کالا",
        responses={200: ProductAttributeSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProductAttribute.objects.all().order_by('display_order', 'name')
        serializer = ProductAttributeSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="تعریف ویژگی جدید برای کالاها (مدیریت)",
        request_body=ProductAttributeSerializer,
        responses={201: ProductAttributeSerializer}
    )
    def post(self, request):
        serializer = ProductAttributeSerializer(data=request.data)
        if serializer.is_valid():
            attr = serializer.save()
            return Response({
                'status': 'success',
                'message': 'ویژگی جدید با موفقیت در سیستم ثبت گردید.',
                'data': ProductAttributeSerializer(attr).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductAttributeDetailUpdateDeleteAPIView(APIView):
    """
    مشاهده، ویرایش و حذف ویژگی
    """
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get(self, request, pk):
        attr = get_object_or_404(ProductAttribute, pk=pk)
        return Response({'status': 'success', 'data': ProductAttributeSerializer(attr).data})

    def put(self, request, pk):
        attr = get_object_or_404(ProductAttribute, pk=pk)
        serializer = ProductAttributeSerializer(attr, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'مشخصات ویژگی با موفقیت بروز شد.',
                'data': ProductAttributeSerializer(updated).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        attr = get_object_or_404(ProductAttribute, pk=pk)
        attr.delete()
        return Response({'status': 'success', 'message': 'ویژگی با موفقیت از سیستم حذف شد.'})


class ProductAttributeValuesSetAPIView(APIView):
    """
    ثبت و ویرایش دسته‌جمعی مقادیر ویژگی‌ها برای یک کالای مشخص
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ثبت مقادیر ویژگی‌های یک کالا",
        responses={200: ProductSerializer}
    )
    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        attributes_data = request.data.get('attributes', [])

        for item in attributes_data:
            attr_id = item.get('attribute_id')
            if not attr_id:
                continue
            attribute = get_object_or_404(ProductAttribute, pk=attr_id)
            ProductAttributeValue.objects.update_or_create(
                product=product,
                attribute=attribute,
                defaults={
                    'value': item.get('value'),
                    'value_number': item.get('value_number'),
                    'value_boolean': item.get('value_boolean')
                }
            )

        return Response({
            'status': 'success',
            'message': 'مقادیر مشخصات فنی کالا با موفقیت ذخیره گردید.',
            'data': ProductSerializer(product).data
        }, status=status.HTTP_200_OK)


# ==========================================
# ۴. ویوهای کاتالوگ محصولات و صندوق (POS Sync)
# ==========================================

class ProductListAPIView(APIView):
    """
    کاتالوگ محصولات آنلاین سایت:
    - فیلتر خودکار کالاهای فعال و غیرحضوری (is_pos_only=False)
    - فیلتر بازه قیمت، دسته‌بندی و برند
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت کاتالوگ محصولات آنلاین سایت (عمومی)",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.filter(
            is_active=True, 
            is_pos_only=False
        ).select_related('category', 'hologram').prefetch_related('gallery', 'attributes_values__attribute')

        brand = request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand__icontains=brand)

        category_id = request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(carton_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(carton_price__lte=max_price)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(name_en__icontains=search) | 
                Q(barcode__icontains=search)
            )

        serializer = ProductSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class PosCatalogAPIView(APIView):
    """
    کاتالوگ کامل صندوق حضوری (POS):
    - لود کلیه اقلام آنلاین و اقلام اختصاصی صندوق (is_pos_only=True)
    - پشتیبانی از اسکنر بارکد
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت کاتالوگ کامل صندوق حضوری شامل بارکد و کلیه اقلام",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.filter(is_active=True).select_related('category', 'hologram')

        barcode = request.query_params.get('barcode')
        if barcode:
            queryset = queryset.filter(barcode=barcode.strip())

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(name_en__icontains=search) | 
                Q(barcode__icontains=search)
            )

        serializer = ProductSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class ProductFeaturedAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Product.objects.filter(is_active=True, is_featured=True, is_pos_only=False).select_related('category', 'hologram')
        serializer = ProductSerializer(queryset, many=True)
        return Response({'status': 'success', 'count': queryset.count(), 'results': serializer.data})


class ProductCreateAPIView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ثبت محصول جدید در کاتالوگ آنلاین / صندوق حضوری",
        request_body=ProductCreateUpdateSerializer,
        responses={201: ProductSerializer}
    )
    def post(self, request):
        serializer = ProductCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            target_scope = "صندوق حضوری" if product.is_pos_only else "سایت آنلاین و صندوق فروشگاهی"
            return Response({
                'status': 'success',
                'message': f'محصول جدید با موفقیت ذخیره شد و به {target_scope} اضافه گردید.',
                'data': ProductSerializer(product).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductDetailSerializer(product)
        return Response({'status': 'success', 'data': serializer.data})


class ProductUpdateAPIView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات کالا با موفقیت بروزرسانی گردید.',
                'data': ProductSerializer(updated).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductSyncPosStockAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        cartons_delta = request.data.get('stock_cartons_delta')
        boxes_delta = request.data.get('stock_boxes_delta')
        is_pos_only = request.data.get('is_pos_only')

        if cartons_delta is not None:
            product.stock_cartons = max(0, product.stock_cartons + int(cartons_delta))
        if boxes_delta is not None:
            product.stock_boxes = max(0, product.stock_boxes + int(boxes_delta))
        if is_pos_only is not None:
            product.is_pos_only = bool(is_pos_only)

        product.save()
        return Response({
            'status': 'success',
            'message': 'موجودی و وضعیت صندوق با موفقیت اعمال شد.',
            'data': ProductSerializer(product).data
        })


class ProductDeleteAPIView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response({'status': 'success', 'message': 'محصول با موفقیت از کاتالوگ حذف شد.'})
`;

  const urlsCode = `"""
products/urls.py
مسیرهای صریح API برای دسته‌بندی‌ها، هولوگرام‌ها، ویژگی‌های کالا، کاتالوگ و همگام‌سازی صندوق
"""

from django.urls import path
from .views import (
    # Categories
    CategoryListCreateAPIView,
    CategoryDetailUpdateDeleteAPIView,
    
    # Holograms
    HologramListCreateAPIView,
    HologramDetailUpdateDeleteAPIView,
    
    # Attributes
    ProductAttributeListCreateAPIView,
    ProductAttributeDetailUpdateDeleteAPIView,
    ProductAttributeValuesSetAPIView,
    
    # Products & POS Sync
    ProductListAPIView,
    PosCatalogAPIView,
    ProductFeaturedAPIView,
    ProductCreateAPIView,
    ProductDetailAPIView,
    ProductUpdateAPIView,
    ProductSyncPosStockAPIView,
    ProductDeleteAPIView,
)

app_name = 'products'

urlpatterns = [
    # ==========================================
    # ۱. مسیرهای دسته‌بندی‌ها (Categories CRUD)
    # ==========================================
    path('categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailUpdateDeleteAPIView.as_view(), name='category-detail-update-delete'),

    # ==========================================
    # ۲. مسیرهای هولوگرام‌ها و اصالت کالا (Holograms CRUD)
    # ==========================================
    path('holograms/', HologramListCreateAPIView.as_view(), name='hologram-list-create'),
    path('holograms/<int:pk>/', HologramDetailUpdateDeleteAPIView.as_view(), name='hologram-detail-update-delete'),

    # ==========================================
    # ۳. مسیرهای مشخصات و ویژگی‌های کالا (Attributes CRUD)
    # ==========================================
    path('attributes/', ProductAttributeListCreateAPIView.as_view(), name='attribute-list-create'),
    path('attributes/<int:pk>/', ProductAttributeDetailUpdateDeleteAPIView.as_view(), name='attribute-detail-update-delete'),
    path('<int:pk>/attributes/', ProductAttributeValuesSetAPIView.as_view(), name='product-attributes-set'),

    # ==========================================
    # ۴. مسیرهای کاتالوگ محصولات و همگام‌سازی صندوق (POS Sync)
    # ==========================================
    path('list/', ProductListAPIView.as_view(), name='product-list'),
    path('pos-catalog/', PosCatalogAPIView.as_view(), name='pos-catalog'),
    path('featured/', ProductFeaturedAPIView.as_view(), name='product-featured'),
    path('create/', ProductCreateAPIView.as_view(), name='product-create'),
    path('<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('<int:pk>/update/', ProductUpdateAPIView.as_view(), name='product-update'),
    path('<int:pk>/sync-pos-stock/', ProductSyncPosStockAPIView.as_view(), name='product-sync-pos-stock'),
    path('<int:pk>/delete/', ProductDeleteAPIView.as_view(), name='product-delete'),
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
