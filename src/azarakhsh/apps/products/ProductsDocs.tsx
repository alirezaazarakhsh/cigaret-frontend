import React from 'react';
import { Package, Layers, ShieldCheck, Sliders, CheckCircle2 } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from '../../AppDocTemplate';

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
      name: 'products_productbrand',
      verboseName: 'جدول برندهای کالا (Brands)',
      description: 'مدیریت برندها و سازندگان محصولات با نام فارسی، نام لاتین، اسلاگ سئو، لوگو، کشور سازنده و توضیحات',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'name', type: 'CharField(max_length=120)', verbose: 'نام برند (فارسی) *' },
        { name: 'name_en', type: 'CharField(max_length=120, blank=True)', verbose: 'نام برند (انگلیسی / لاتین)' },
        { name: 'slug', type: 'SlugField(max_length=130)', isUnique: true, verbose: 'اسلاگ سئو (URL)' },
        { name: 'logo', type: 'ImageField(blank=True)', verbose: 'فایل لوگوی برند' },
        { name: 'country', type: 'CharField(max_length=100, blank=True)', verbose: 'کشور سازنده اصلی' },
        { name: 'description', type: 'TextField(blank=True)', verbose: 'توضیحات برند' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت' },
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
        { name: 'data_type', type: 'CharField(max_length=20, choices=DATA_TYPES)', verbose: 'نوع داده (متن، عدد، انتخابی، بولی، نشان)' },
        { name: 'unit', type: 'CharField(max_length=30, blank=True)', verbose: 'واحد سنجش (اختیاری مثل mg, mm)' },
        { name: 'options', type: 'TextField(blank=True)', verbose: 'گزینه‌های انتخابی برای فیلدهای Select (جداشده با کاما)' },
        { name: 'help_text', type: 'TextField(blank=True)', verbose: 'توضیح راهنما برای خریداران' },
        { name: 'is_required', type: 'BooleanField(default=False)', verbose: 'ویژگی اجباری در ثبت محصول' },
        { name: 'is_filterable', type: 'BooleanField(default=True)', verbose: 'قابلیت فیلتر در جستجو' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ایجاد' },
      ]
    },
    {
      name: 'products_productattributevalue',
      verboseName: 'جدول مقادیر ویژگی‌های هر محصول (Attribute Values)',
      description: 'انتساب مقادیر ویژگی‌های تعریف‌شده به هر محصول مجزا در پایگاه‌داده (EAV Storage)',
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
      description: 'کاتالوگ کالاها شامل قیمت کارتن، باکس، پاکت، مشخصات فنی و دخانیات، بارکدخوان، دسته‌بندی، برند، هولوگرام، همگام‌سازی دوطرفه آنلاین/صندوق و ادیتور TinyMCE',
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
        { name: 'tar', type: 'CharField(max_length=20, blank=True)', verbose: 'میزان قطران (mg)' },
        { name: 'nicotine', type: 'CharField(max_length=20, blank=True)', verbose: 'میزان نیکوتین (mg)' },
        { name: 'carbon_monoxide', type: 'CharField(max_length=20, blank=True)', verbose: 'میزان کربن مونوکسید' },
        { name: 'cigarette_size', type: 'CharField(max_length=30, choices=SIZE_CHOICES)', verbose: 'سایز سیگار (کینگ سایز، اسلیم، نانو و...)' },
        { name: 'filter_type', type: 'CharField(max_length=30, choices=FILTER_CHOICES)', verbose: 'نوع فیلتر (سفید، زرد، زغالی، مجوف، کپسول)' },
        { name: 'country_origin', type: 'CharField(max_length=100, blank=True)', verbose: 'کشور سازنده' },
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
      name: 'products_productkeyfeature',
      verboseName: 'جدول نقاط قوت و ویژگی‌های کلیدی کالا (Key Features)',
      description: 'ثبت نکات برجسته و نقاط قوت هر کالا برای نمایش سریع در کادر محصول و ریچ اسنیپت‌های سئو موتورهای جستجو',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'product_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_product', verbose: 'کالای مربوطه' },
        { name: 'title', type: 'CharField(max_length=150)', verbose: 'عنوان نقطه قوت کالا *' },
        { name: 'display_order', type: 'PositiveIntegerField(default=0)', verbose: 'ترتیب نمایش' },
      ]
    },
    {
      name: 'products_producttierdiscount',
      verboseName: 'جدول تخفیف‌های پلکانی حجم عمده کالا (Tier Discounts)',
      description: 'تخفیف‌های درصدی یا مبلغی به ازای خرید حداقل تعداد کارتن یا باکس',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'product_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_product', verbose: 'کالای مربوطه' },
        { name: 'min_quantity', type: 'PositiveIntegerField', verbose: 'حداقل تعداد خرید (کارتن/باکس)' },
        { name: 'discount_percent', type: 'DecimalField(max_digits=5, decimal_places=2)', verbose: 'درصد تخفیف' },
        { name: 'discount_price_per_unit', type: 'PositiveIntegerField(null=True)', verbose: 'قیمت تخفیف‌خورده واحد' },
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

    // 2. Brands
    {
      method: 'GET',
      path: '/api/v1/products/brands/',
      auth: 'AllowAny',
      description: 'دریافت فهرست تمام برندهای ثبت‌شده همراه با لوگو، اسلاگ و کشور سازنده',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/products/brands/"`,
      responseBody: `{
  "status": "success",
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "مارلبرو",
      "name_en": "Marlboro",
      "slug": "marlboro",
      "logo_url": "/media/brands/logos/marlboro.png",
      "country": "سوئیس / آمریکا",
      "description": "معروف‌ترین برند دخانیات جهان با بالاترین کیفیت برگ توتون",
      "products_count": 14
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/products/brands/',
      auth: 'IsAdminUser',
      description: 'ثبت برند تجاری جدید با آپلود لوگو، نام فارسی و انگلیسی، اسلاگ سئو و کشور سازنده',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/products/brands/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "کنت",
    "name_en": "Kent",
    "slug": "kent",
    "country": "ژاپن / انگلستان",
    "description": "برند مطرح با فیلتر سه لایه و مدرن"
  }'`
    },
    {
      method: 'GET',
      path: '/api/v1/products/brands/<id>/',
      auth: 'AllowAny',
      description: 'مشاهده مشخصات یک برند خاص'
    },
    {
      method: 'PUT',
      path: '/api/v1/products/brands/<id>/',
      auth: 'IsAdminUser',
      description: 'ویرایش اطلاعات برند، لوگو، کشور و توضیحات'
    },
    {
      method: 'DELETE',
      path: '/api/v1/products/brands/<id>/',
      auth: 'IsAdminUser',
      description: 'حذف برند از کاتالوگ'
    },

    // 3. Holograms
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
      description: 'تعریف ویژگی جدید برای کالاها با تعیین نوع داده (text, number, select, boolean, badge)، واحد سنجش، گزینه‌های انتخابی (کاماسپریت) و متن راهنما',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/products/attributes/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "میزان قطران",
    "name_en": "Tar",
    "data_type": "number",
    "unit": "mg",
    "options": "",
    "help_text": "میزان قطران بر اساس استاندارد آزمایشگاهی ISO",
    "is_required": false,
    "is_filterable": true
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
      description: 'ثبت و تنظیم مقادیر ویژگی‌های یک کالا در دیتابیس (پشتیبانی از شناسه attribute_id یا ایجاد خودکار ویژگی بر اساس نام فارسی/انگلیسی)',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/products/12/attributes/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "attributes": [
      { "attribute_id": 1, "value": "6 mg", "value_number": 6 },
      { "name": "نوع فیلتر", "value": "فیلتر زغالی کربن اکتیو", "data_type": "select" },
      { "name": "کپسول طعم‌دار", "value": "دارد", "value_boolean": true, "data_type": "boolean" }
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
      description: 'افزودن محصول جدید به سیستم به همراه مشخصات فنی دخانیات، سطوح و واحدهای فروش (کارتن/باکس/پاکت)، هولوگرام، ویژگی‌های داینامیک EAV، متن TinyMCE و وضعیت انتشار (is_pos_only)',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/products/create/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "وینستون لایت نقره‌ای کینگ سایز",
    "name_en": "Winston Light Silver King Size",
    "slug": "winston-light-silver",
    "brand": "وینستون",
    "category": 1,
    "hologram": 1,
    "barcode": "6260123456789",
    "box_price": 680000,
    "boxes_per_carton": 50,
    "carton_price": 34000000,
    "pack_price": 68000,
    "packs_per_box": 10,
    "stock_cartons": 150,
    "stock_boxes": 35,
    "min_order_carton": 1,
    "min_order_box": 1,
    "has_carton": true,
    "has_box": true,
    "has_pack": true,
    "is_box_only": false,
    "is_pos_only": false,
    "tar": "6 mg",
    "nicotine": "0.5 mg",
    "carbon_monoxide": "7 mg",
    "cigarette_size": "king_size",
    "filter_type": "charcoal",
    "country_origin": "سوئیس / امارات",
    "badge": "bestseller",
    "full_description": "<p>سیگار وینستون لایت نقره‌ای با هولوگرام اصالت اروپایی...</p>",
    "attributes": [
      { "name": "میزان قطران", "value": "6 mg", "unit": "mg", "data_type": "number" },
      { "name": "میزان نیکوتین", "value": "0.5 mg", "unit": "mg", "data_type": "number" },
      { "name": "نوع توتون", "value": "ویرجینیا ترکیب مرغوب", "data_type": "text" }
    ]
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
    barcode = models.CharField(_("بارکد اسکنر فروشگاهی"), max_length=60, blank=True, null=True, db_index=True)

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
# ۶. مشخصات و ویژگیهای داینامیک کالا (Attributes & Values - EAV Pattern)
# ==============================================================================
DATA_TYPE_CHOICES = (
    ('text', _('متن کوتاه / رشته')),
    ('number', _('عددی (صحیح یا اعشاری)')),
    ('select', _('انتخابی / چندگزینه‌ای (Select)')),
    ('boolean', _('بله / خیر (سوئیچ دو وضعیتی)')),
    ('badge', _('نشان / وضعیت (Badge)')),
    ('color', _('کد رنگ')),
)

class ProductAttribute(models.Model):
    name = models.CharField(_("عنوان ویژگی به فارسی"), max_length=100)
    name_en = models.CharField(_("عنوان لاتین (English)"), max_length=100, blank=True, null=True)
    data_type = models.CharField(_("نوع داده"), max_length=20, choices=DATA_TYPE_CHOICES, default='text')
    unit = models.CharField(_("واحد سنجش (اختیاری)"), max_length=30, blank=True, null=True, help_text=_("مثال: mg, mm, گرم"))
    options = models.TextField(_("گزینه‌های انتخابی (با کاما جدا شوند)"), blank=True, null=True, help_text=_("برای نوع داده انتخابی / چندگزینه‌ای (Select)"))
    help_text = models.TextField(_("توضیح راهنما برای خریداران"), blank=True, null=True)
    is_required = models.BooleanField(_("ویژگی اجباری"), default=False)
    is_filterable = models.BooleanField(_("قابل فیلتر در جستجوی پیشرفته"), default=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("تعریف ویژگی")
        verbose_name_plural = _("تعاریف ویژگیها")
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_data_type_display()})"


class ProductAttributeValue(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes_values', verbose_name=_("محصول"))
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE, related_name='values', verbose_name=_("ویژگی"))
    value = models.CharField(_("مقدار متنی / انتخابی"), max_length=255, blank=True, null=True)
    value_number = models.DecimalField(_("مقدار عددی"), max_digits=10, decimal_places=2, blank=True, null=True)
    value_boolean = models.BooleanField(_("مقدار بله/خیر"), blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ ثبت"), auto_now_add=True, null=True)

    class Meta:
        verbose_name = _("مقدار ویژگی محصول")
        verbose_name_plural = _("مقادیر ویژگیهای محصولات")
        unique_together = ('product', 'attribute')

    def __str__(self):
        return f"{self.product.name} - {self.attribute.name}: {self.get_display_value()}"

    def get_display_value(self):
        if self.value:
            unit_str = f" {self.attribute.unit}" if self.attribute.unit and not str(self.value).endswith(self.attribute.unit) else ""
            return f"{self.value}{unit_str}".strip()
        if self.value_number is not None:
            unit_str = f" {self.attribute.unit}" if self.attribute.unit else ""
            return f"{self.value_number}{unit_str}".strip()
        if self.value_boolean is not None:
            return "دارد" if self.value_boolean else "ندارد"
        return "-"


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
        (_('اطلاعات اصلی و شناسه تجاری کالا'), {
            'fields': (
                'name',
                'name_en',
                'slug',
                'brand',
                'barcode',
                'excerpt',
            )
        }),
        (_('دسته‌بندی، هولوگرام و برچسب تجاری'), {
            'fields': (
                'category',
                'hologram',
                'badge',
            )
        }),
        (_('قیمت‌گذاری عمده، سطوح فروش و موجودی انبار'), {
            'fields': (
                ('carton_price', 'box_price', 'pack_price', 'purchase_price'),
                ('stock_cartons', 'stock_boxes'),
                ('boxes_per_carton', 'packs_per_box'),
                ('min_order_carton', 'min_order_box'),
                ('has_carton', 'has_box', 'has_pack', 'is_box_only', 'is_pos_only'),
            )
        }),
        (_('مشخصات فنی و شناسنامه استاندارد دود'), {
            'fields': (
                ('tar', 'nicotine', 'carbon_monoxide'),
                ('cigarette_size', 'filter_type'),
                'country_origin',
            ),
        }),
        (_('نقد و بررسی و توضیحات جامع محصول (TinyMCE)'), {
            'fields': ('full_description',),
        }),
        (_('تصویر شاخص محصول'), {
            'fields': ('main_image', 'image'),
        }),
        (_('تنظیمات سئو و کلمه کلیدی کانونی (Yoast SEO)'), {
            'fields': (
                'focus_keyword',
                'meta_title',
                'meta_description',
                'canonical_url',
            ),
        }),
        (_('وضعیت فعالیت و نمایش در سامانه'), {
            'fields': (('is_active', 'is_featured'),),
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
    list_display = ['id', 'name', 'name_en', 'data_type', 'unit', 'options', 'is_required', 'is_filterable', 'created_at_jalali']
    list_filter = ['data_type', 'is_required', 'is_filterable']
    search_fields = ['name', 'name_en', 'options', 'help_text']
    ordering = ['-id']
    fields = ['name', 'name_en', 'data_type', 'unit', 'options', 'help_text', 'is_required', 'is_filterable']

    @admin.display(description=_('تاریخ ثبت (شمسی)'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)


# ==============================================================================
# ۷. مقادیر ویژگی‌های کالاها (Product Attribute Value Admin)
# ==============================================================================
@admin.register(ProductAttributeValue)
class ProductAttributeValueAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'attribute', 'display_val']
    list_filter = ['attribute__data_type', 'attribute']
    search_fields = ['product__name', 'product__name_en', 'attribute__name', 'value']
    autocomplete_fields = ['product', 'attribute']

    @admin.display(description=_('مقدار ویژگی'))
    def display_val(self, obj):
        if obj.value:
            return obj.value
        if obj.value_number is not None:
            return f"{obj.value_number} {obj.attribute.unit or ''}".strip()
        if obj.value_boolean is not None:
            return _("بله") if obj.value_boolean else _("خیر")
        return "-"
`;

  const serializersCode = `\"\"\"
products/serializers.py
سریالایزرهای DRF برای دسته‌بندی‌های درختی، هولوگرام، ویژگی‌های فنی و کاتالوگ محصولات (همگام با صندوق و آنلاین)
\"\"\"

from rest_framework import serializers
from django.db import transaction
from django.db.models import Q
from django.utils.text import slugify
import uuid
from .models import (
    Category,
    ProductBrand,
    ProductHologram,
    ProductAttribute,
    Product,
    ProductAttributeValue,
    ProductKeyFeature,
    ProductTierDiscount,
    ProductImage
)


class ProductBrandSerializer(serializers.ModelSerializer):
    \"\"\"
    سریالایزر برندها با امکان آپلود فایل تصویر لوگو (logo) و تولید خودکار آدرس پیش‌نمایش لوگو (logo_preview)
    \"\"\"
    slug = serializers.SlugField(allow_unicode=True, required=False, allow_blank=True)
    logo_preview = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProductBrand
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'logo',
            'logo_preview',
            'country',
            'description',
            'created_at'
        ]
        extra_kwargs = {
            'name_en': {'required': False, 'allow_blank': True, 'allow_null': True},
            'country': {'required': False, 'allow_blank': True, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'logo': {'required': False, 'allow_null': True},
        }

    def get_logo_preview(self, obj):
        if not obj.logo:
            return None
        request = self.context.get('request')
        if hasattr(obj.logo, 'url'):
            url = obj.logo.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return str(obj.logo)

    def validate(self, attrs):
        if not attrs.get('slug'):
            base_name = attrs.get('name_en') or attrs.get('name') or ''
            generated_slug = slugify(base_name, allow_unicode=True)
            if not generated_slug:
                generated_slug = f"brand-{uuid.uuid4().hex[:8]}"
            attrs['slug'] = generated_slug
        return attrs


# نام مستعار جهت پشتیبانی از پروژه‌هایی که از BrandSerializer استفاده می‌کنند
BrandSerializer = ProductBrandSerializer


class CategorySerializer(serializers.ModelSerializer):
    \"\"\"
    سریالایزر جامع دسته‌بندی با ۵ فیلد اصلی فرم ورودی:
    ۱. عنوان دسته‌بندی (فارسی) - name *
    ۲. نام لاتین - name_en
    ۳. شناسه سیستمی - slug (در صورت عدم ارسال، خودکار تولید می‌شود)
    ۴. رنگ شناسه - color (۶ پالت رنگی)
    ۵. توضیحات کوتاه - description
    \"\"\"
    slug = serializers.SlugField(allow_unicode=True, required=False, allow_blank=True)
    color_display = serializers.CharField(source='get_color_display', read_only=True)
    products_count = serializers.SerializerMethodField()

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
            'products_count',
            'created_at',
            'updated_at'
        ]
        extra_kwargs = {
            'name_en': {'required': False, 'allow_blank': True, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'color': {'required': False},
        }

    def validate(self, attrs):
        if not attrs.get('slug'):
            base_name = attrs.get('name_en') or attrs.get('name') or ''
            generated_slug = slugify(base_name, allow_unicode=True)
            if not generated_slug:
                generated_slug = f"cat-{uuid.uuid4().hex[:8]}"
            attrs['slug'] = generated_slug
        return attrs

    def get_products_count(self, obj):
        return obj.products.count()


class ProductHologramSerializer(serializers.ModelSerializer):
    security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)

    class Meta:
        model = ProductHologram
        fields = [
            'id',
            'title',
            'issuer_org',
            'country_origin',
            'security_level',
            'security_level_display',
            'security_specs',
            'is_verified',
            'created_at',
            'updated_at',
        ]
        extra_kwargs = {
            'issuer_org': {'required': False, 'allow_blank': True, 'allow_null': True},
            'country_origin': {'required': False, 'allow_blank': True, 'allow_null': True},
            'security_specs': {'required': False, 'allow_blank': True, 'allow_null': True},
        }


class ProductAttributeSerializer(serializers.ModelSerializer):
    data_type_display = serializers.CharField(source='get_data_type_display', read_only=True)
    options_list = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProductAttribute
        fields = [
            'id',
            'name',
            'name_en',
            'data_type',
            'data_type_display',
            'unit',
            'options',
            'options_list',
            'help_text',
            'is_required',
            'is_filterable',
            'created_at',
            'updated_at',
        ]
        extra_kwargs = {
            'name_en': {'required': False, 'allow_blank': True, 'allow_null': True},
            'unit': {'required': False, 'allow_blank': True, 'allow_null': True},
            'options': {'required': False, 'allow_blank': True, 'allow_null': True},
            'help_text': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def get_options_list(self, obj):
        if obj.options:
            return [opt.strip() for opt in obj.options.split(',') if opt.strip()]
        return []


class ProductAttributeValueSerializer(serializers.ModelSerializer):
    attribute_id = serializers.IntegerField(source='attribute.id', read_only=True)
    attribute_name = serializers.CharField(source='attribute.name', read_only=True)
    attribute_name_en = serializers.CharField(source='attribute.name_en', read_only=True)
    attribute_data_type = serializers.CharField(source='attribute.data_type', read_only=True)
    attribute_unit = serializers.CharField(source='attribute.unit', read_only=True)
    display_value = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProductAttributeValue
        fields = [
            'id',
            'attribute',
            'attribute_id',
            'attribute_name',
            'attribute_name_en',
            'attribute_data_type',
            'attribute_unit',
            'value',
            'value_number',
            'value_boolean',
            'display_value',
        ]

    def get_display_value(self, obj):
        return obj.get_display_value()


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'order']
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
            'order': {'required': False, 'default': 0}
        }


class ProductKeyFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductKeyFeature
        fields = ['id', 'title', 'display_order']
        extra_kwargs = {
            'title': {'required': True},
            'display_order': {'required': False, 'default': 0}
        }


class ProductTierDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTierDiscount
        fields = ['id', 'min_quantity', 'discount_percent', 'discount_price_per_unit']
        extra_kwargs = {
            'min_quantity': {'required': True},
            'discount_percent': {'required': True},
            'discount_price_per_unit': {'required': False, 'allow_null': True}
        }


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    brand_detail = ProductBrandSerializer(source='brand', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    brand_logo = serializers.SerializerMethodField(read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    key_features = ProductKeyFeatureSerializer(many=True, read_only=True)
    tier_discounts = ProductTierDiscountSerializer(many=True, read_only=True)
    attributes_values = ProductAttributeValueSerializer(many=True, read_only=True)
    cigarette_size_display = serializers.CharField(source='get_cigarette_size_display', read_only=True)
    filter_type_display = serializers.CharField(source='get_filter_type_display', read_only=True)
    badge_display = serializers.CharField(source='get_badge_display', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'brand',
            'brand_detail',
            'brand_name',
            'brand_logo',
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
            'min_order_carton',
            'min_order_box',
            'tar',
            'nicotine',
            'carbon_monoxide',
            'cigarette_size',
            'cigarette_size_display',
            'filter_type',
            'filter_type_display',
            'country_origin',
            'badge',
            'badge_display',
            'image',
            'gallery',
            'key_features',
            'tier_discounts',
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

    def get_brand_logo(self, obj):
        if obj.brand and obj.brand.logo:
            request = self.context.get('request')
            if hasattr(obj.brand.logo, 'url'):
                url = obj.brand.logo.url
                if request is not None:
                    return request.build_absolute_uri(url)
                return url
            return str(obj.brand.logo)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    brand_detail = ProductBrandSerializer(source='brand', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    brand_logo = serializers.SerializerMethodField(read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    key_features = ProductKeyFeatureSerializer(many=True, read_only=True)
    tier_discounts = ProductTierDiscountSerializer(many=True, read_only=True)
    attributes_values = ProductAttributeValueSerializer(many=True, read_only=True)
    cigarette_size_display = serializers.CharField(source='get_cigarette_size_display', read_only=True)
    filter_type_display = serializers.CharField(source='get_filter_type_display', read_only=True)
    badge_display = serializers.CharField(source='get_badge_display', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'brand',
            'brand_detail',
            'brand_name',
            'brand_logo',
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
            'min_order_carton',
            'min_order_box',
            'tar',
            'nicotine',
            'carbon_monoxide',
            'cigarette_size',
            'cigarette_size_display',
            'filter_type',
            'filter_type_display',
            'country_origin',
            'badge',
            'badge_display',
            'image',
            'gallery',
            'key_features',
            'tier_discounts',
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

    def get_brand_logo(self, obj):
        if obj.brand and obj.brand.logo:
            request = self.context.get('request')
            if hasattr(obj.brand.logo, 'url'):
                url = obj.brand.logo.url
                if request is not None:
                    return request.build_absolute_uri(url)
                return url
            return str(obj.brand.logo)
        return None


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    سریالایزر هوشمند و جامع ثبت و بروزرسانی کالا در دیتابیس دجانگو با پشتیبانی از تراکنش‌های اتمیک
    پشتیبانی کامل از سریالایزرهای توکار ProductImage, ProductKeyFeature, ProductTierDiscount و ویژگی‌های داینامیک EAV
    """
    slug = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    name_fa = serializers.CharField(write_only=True, required=False, allow_blank=True)
    brand = serializers.PrimaryKeyRelatedField(queryset=ProductBrand.objects.all(), required=False, allow_null=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False, allow_null=True)
    hologram = serializers.PrimaryKeyRelatedField(queryset=ProductHologram.objects.all(), required=False, allow_null=True)
    gallery_images = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="لیست آدرس‌ها یا تصویرهای گالری محصول (رشته‌ای)"
    )
    gallery = ProductImageSerializer(many=True, required=False, write_only=True)
    key_takeaways = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="لیست نکات کلیدی محصول (رشته‌ای)"
    )
    key_features = ProductKeyFeatureSerializer(many=True, required=False, write_only=True)
    tier_discounts = ProductTierDiscountSerializer(many=True, required=False, write_only=True)
    attributes = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="لیست ویژگی‌های فنی (EAV) کالا جهت ذخیره دائمی در دیتابیس"
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'name_fa',
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
            'min_order_carton',
            'min_order_box',
            'tar',
            'nicotine',
            'carbon_monoxide',
            'cigarette_size',
            'filter_type',
            'country_origin',
            'badge',
            'main_image',
            'image',
            'gallery_images',
            'gallery',
            'key_takeaways',
            'key_features',
            'attributes',
            'tier_discounts',
            'full_description',
            'excerpt',
            'focus_keyword',
            'meta_title',
            'meta_description',
            'canonical_url',
            'is_pos_only',
            'is_box_only',
            'has_carton',
            'has_box',
            'has_pack',
            'is_active',
            'is_featured'
        ]

        extra_kwargs = {
            'name': {'required': True},
            'name_en': {'required': False, 'allow_blank': True, 'allow_null': True},
            'slug': {'required': False, 'allow_blank': True, 'allow_null': True},
            'barcode': {'required': False, 'allow_blank': True, 'allow_null': True},
            'box_price': {'required': False, 'allow_null': True},
            'boxes_per_carton': {'required': False, 'allow_null': True},
            'carton_price': {'required': False, 'allow_null': True},
            'pack_price': {'required': False, 'allow_null': True},
            'packs_per_box': {'required': False, 'allow_null': True},
            'purchase_price': {'required': False, 'allow_null': True},
            'stock_cartons': {'required': False, 'allow_null': True},
            'stock_boxes': {'required': False, 'allow_null': True},
            'min_order_carton': {'required': False, 'allow_null': True},
            'min_order_box': {'required': False, 'allow_null': True},
            'tar': {'required': False, 'allow_blank': True, 'allow_null': True},
            'nicotine': {'required': False, 'allow_blank': True, 'allow_null': True},
            'carbon_monoxide': {'required': False, 'allow_blank': True, 'allow_null': True},
            'cigarette_size': {'required': False, 'allow_blank': True, 'allow_null': True},
            'filter_type': {'required': False, 'allow_blank': True, 'allow_null': True},
            'country_origin': {'required': False, 'allow_blank': True, 'allow_null': True},
            'badge': {'required': False, 'allow_blank': True, 'allow_null': True},
            'main_image': {'required': False, 'allow_null': True},
            'image': {'required': False, 'allow_null': True},
            'full_description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'excerpt': {'required': False, 'allow_blank': True, 'allow_null': True},
            'focus_keyword': {'required': False, 'allow_blank': True, 'allow_null': True},
            'meta_title': {'required': False, 'allow_blank': True, 'allow_null': True},
            'meta_description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'canonical_url': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def to_internal_value(self, data):
        data_dict = data.copy() if hasattr(data, 'copy') else dict(data)

        # استخراج فیلدهای توکار قبل از اعتبارسنجی
        attributes_raw = data_dict.pop('attributes', None)
        if attributes_raw is None:
            attributes_raw = data_dict.pop('custom_features', None)

        tier_discounts_raw = data_dict.pop('tier_discounts', None)
        gallery_raw = data_dict.pop('gallery', None)
        gallery_images_raw = data_dict.pop('gallery_images', None)
        key_features_raw = data_dict.pop('key_features', None)
        key_takeaways_raw = data_dict.pop('key_takeaways', None)

        # پاکسازی اعداد و قیمت‌ها در صورت ارسال رشته خالی یا تهی
        for num_field in ['box_price', 'boxes_per_carton', 'carton_price', 'pack_price', 'packs_per_box', 'purchase_price', 'stock_cartons', 'stock_boxes', 'min_order_carton', 'min_order_box']:
            if num_field in data_dict:
                val = data_dict[num_field]
                if val == '' or val is None:
                    data_dict[num_field] = 0
                elif isinstance(val, str):
                    clean_val = val.replace(',', '').strip()
                    data_dict[num_field] = int(clean_val) if clean_val.isdigit() else 0

        # نگاشت name_fa به name
        if 'name_fa' in data_dict and data_dict['name_fa'] and not data_dict.get('name'):
            data_dict['name'] = data_dict['name_fa']

        # پردازش هوشمند برند
        b_val = data_dict.get('brand') or data_dict.get('brand_id') or data_dict.get('brand_name')
        brand_obj = None
        if b_val is not None and b_val != '' and b_val != 0 and b_val != '0':
            if isinstance(b_val, dict):
                b_id = b_val.get('id')
                b_name = b_val.get('name') or b_val.get('title')
                if b_id and str(b_id).isdigit():
                    brand_obj = ProductBrand.objects.filter(id=int(b_id)).first()
                if not brand_obj and b_name:
                    brand_obj, _ = ProductBrand.objects.get_or_create(
                        name=str(b_name),
                        defaults={'slug': slugify(str(b_name), allow_unicode=True) or f"brand-{uuid.uuid4().hex[:6]}"}
                    )
            elif isinstance(b_val, (int, str)):
                s_val = str(b_val).strip()
                if s_val.isdigit():
                    brand_obj = ProductBrand.objects.filter(id=int(s_val)).first()
                if not brand_obj and s_val and s_val != '0':
                    brand_obj, _ = ProductBrand.objects.get_or_create(
                        name=s_val,
                        defaults={'slug': slugify(s_val, allow_unicode=True) or f"brand-{uuid.uuid4().hex[:6]}"}
                    )
        data_dict['brand'] = brand_obj.id if brand_obj else None

        # پردازش هوشمند و تضمینی دسته‌بندی
        c_val = data_dict.get('category') or data_dict.get('category_id') or data_dict.get('category_name')
        cat_obj = None
        if c_val is not None and c_val != '' and c_val != 0 and c_val != '0':
            if isinstance(c_val, dict):
                c_id = c_val.get('id')
                c_name = c_val.get('name') or c_val.get('title') or c_val.get('slug')
                if c_id and str(c_id).isdigit():
                    cat_obj = Category.objects.filter(id=int(c_id)).first()
                if not cat_obj and c_name:
                    cat_obj = Category.objects.filter(Q(slug=c_name) | Q(name=c_name) | Q(name_en=c_name)).first()
                    if not cat_obj:
                        cat_obj = Category.objects.create(
                            name=str(c_name),
                            slug=slugify(str(c_name), allow_unicode=True) or f"cat-{uuid.uuid4().hex[:6]}"
                        )
            elif isinstance(c_val, (int, str)):
                s_val = str(c_val).strip()
                if s_val.isdigit():
                    cat_obj = Category.objects.filter(id=int(s_val)).first()
                if not cat_obj and s_val and s_val != '0':
                    cat_obj = Category.objects.filter(Q(slug=s_val) | Q(name=s_val) | Q(name_en=s_val)).first()
                    if not cat_obj:
                        cat_obj = Category.objects.create(
                            name=s_val,
                            slug=slugify(s_val, allow_unicode=True) or f"cat-{uuid.uuid4().hex[:6]}"
                        )

        # اگر دسته‌بندی پیدا نشد یا شناسه نامعتبر بود، از دسته‌بندی موجود یا عمومی دیتابیس استفاده کن
        if not cat_obj:
            cat_obj = Category.objects.first()
            if not cat_obj:
                cat_obj, _ = Category.objects.get_or_create(
                    name='عمومی',
                    defaults={'slug': 'general', 'description': 'دسته‌بندی عمومی پیش‌فرض'}
                )
        data_dict['category'] = cat_obj.id

        # پردازش هوشمند هولوگرام
        h_val = data_dict.get('hologram') or data_dict.get('hologram_id') or data_dict.get('hologram_title')
        holo_obj = None
        if h_val is not None and h_val != '' and h_val != 0 and h_val != '0':
            if isinstance(h_val, dict):
                h_id = h_val.get('id')
                h_title = h_val.get('title') or h_val.get('name')
                if h_id and str(h_id).isdigit():
                    holo_obj = ProductHologram.objects.filter(id=int(h_id)).first()
                if not holo_obj and h_title:
                    holo_obj, _ = ProductHologram.objects.get_or_create(title=str(h_title))
            elif isinstance(h_val, (int, str)):
                s_val = str(h_val).strip()
                if s_val.isdigit():
                    holo_obj = ProductHologram.objects.filter(id=int(s_val)).first()
                if not holo_obj and s_val and s_val != '0':
                    holo_obj, _ = ProductHologram.objects.get_or_create(title=s_val)
        data_dict['hologram'] = holo_obj.id if holo_obj else None

        # پردازش هوشمند و خودکار اسلاگ سئو (تبدیل فاصله به خط تیره و استانداردسازی یونیکد)
        raw_slug = data_dict.get('slug')
        if raw_slug and str(raw_slug).strip():
            clean_s = slugify(str(raw_slug).strip(), allow_unicode=True)
            if not clean_s:
                clean_s = f"prod-{uuid.uuid4().hex[:8]}"
            data_dict['slug'] = clean_s
        else:
            base_for_slug = data_dict.get('name_en') or data_dict.get('name') or data_dict.get('name_fa') or f"prod-{uuid.uuid4().hex[:6]}"
            data_dict['slug'] = slugify(str(base_for_slug), allow_unicode=True) or f"prod-{uuid.uuid4().hex[:8]}"

        ret = super().to_internal_value(data_dict)

        if attributes_raw is not None and isinstance(attributes_raw, list):
            ret['attributes'] = attributes_raw
        if tier_discounts_raw is not None and isinstance(tier_discounts_raw, list):
            ret['tier_discounts'] = tier_discounts_raw
        if gallery_raw is not None and isinstance(gallery_raw, list):
            ret['gallery'] = gallery_raw
        if gallery_images_raw is not None and isinstance(gallery_images_raw, list):
            ret['gallery_images'] = gallery_images_raw
        if key_features_raw is not None and isinstance(key_features_raw, list):
            ret['key_features'] = key_features_raw
        if key_takeaways_raw is not None and isinstance(key_takeaways_raw, list):
            ret['key_takeaways'] = key_takeaways_raw

        return ret

    def _save_nested_relations(self, product, attributes_data, tier_discounts_data, gallery_data, gallery_images_data, key_features_data, key_takeaways_data):
        """
        مدیریت اتمیک و صریح ذخیره‌سازی روابط توکار کالا
        """
        # ۱. ذخیره‌سازی ویژگی‌های فنی EAV
        if attributes_data is not None and isinstance(attributes_data, list):
            for item in attributes_data:
                if not isinstance(item, dict):
                    continue

                attr_id = item.get('attribute_id') or item.get('id')
                attr_name = item.get('name') or item.get('title')
                val = item.get('value')
                val_num = item.get('value_number')
                val_bool = item.get('value_boolean')

                attr_obj = None
                if attr_id and str(attr_id).isdigit():
                    attr_obj = ProductAttribute.objects.filter(id=int(attr_id)).first()

                if not attr_obj and attr_name:
                    name_clean = str(attr_name).strip()
                    attr_obj = ProductAttribute.objects.filter(Q(name__iexact=name_clean) | Q(name_en__iexact=name_clean)).first()
                    if not attr_obj:
                        attr_obj = ProductAttribute.objects.create(
                            name=name_clean,
                            name_en=item.get('name_en') or slugify(name_clean, allow_unicode=True),
                            data_type=item.get('data_type') or 'text',
                            unit=item.get('unit') or '',
                            options=item.get('options') or '',
                            help_text=item.get('help_text') or '',
                            is_required=item.get('is_required', False),
                            is_filterable=item.get('is_filterable', True),
                        )

                if not attr_obj:
                    continue

                if val_num is None and val is not None and attr_obj.data_type == 'number':
                    try:
                        cleaned_num = str(val).replace(attr_obj.unit or '', '').strip()
                        val_num = float(cleaned_num)
                    except (ValueError, TypeError):
                        val_num = None

                if val_bool is None and val is not None and attr_obj.data_type == 'boolean':
                    val_bool = str(val).lower() in ['true', '1', 'yes', 'بله', 'دارد']

                ProductAttributeValue.objects.update_or_create(
                    product=product,
                    attribute=attr_obj,
                    defaults={
                        'value': str(val) if val is not None else '',
                        'value_number': val_num,
                        'value_boolean': val_bool
                    }
                )

        # ۲. ذخیره‌سازی تخفیف‌های تیراژ عمده
        if tier_discounts_data is not None and isinstance(tier_discounts_data, list):
            product.tier_discounts.all().delete()
            for t_item in tier_discounts_data:
                if isinstance(t_item, dict):
                    min_q = t_item.get('min_quantity') or t_item.get('min_qty') or 1
                    disc_pct = t_item.get('discount_percent') or t_item.get('percent') or 0
                    disc_price = t_item.get('discount_price_per_unit') or t_item.get('price')
                    ProductTierDiscount.objects.create(
                        product=product,
                        min_quantity=int(min_q),
                        discount_percent=float(disc_pct),
                        discount_price_per_unit=int(disc_price) if disc_price else None
                    )

        # ۳. ذخیره‌سازی گالری تصاویر
        g_list = gallery_data if gallery_data is not None else gallery_images_data
        if g_list is not None and isinstance(g_list, list):
            product.gallery.all().delete()
            for idx, g_item in enumerate(g_list):
                if isinstance(g_item, dict):
                    img_val = g_item.get('image') or g_item.get('url')
                    order_val = g_item.get('order', idx)
                    if img_val:
                        ProductImage.objects.create(product=product, image=img_val, order=order_val)
                elif isinstance(g_item, str) and g_item.strip():
                    ProductImage.objects.create(product=product, image=g_item.strip(), order=idx)

        # ۴. ذخیره‌سازی نکات کلیدی
        kf_list = key_features_data if key_features_data is not None else key_takeaways_data
        if kf_list is not None and isinstance(kf_list, list):
            product.key_features.all().delete()
            for idx, k_item in enumerate(kf_list):
                if isinstance(k_item, dict):
                    title_val = k_item.get('title') or k_item.get('text')
                    order_val = k_item.get('display_order', idx)
                    if title_val:
                        ProductKeyFeature.objects.create(product=product, title=title_val, display_order=order_val)
                elif isinstance(k_item, str) and k_item.strip():
                    ProductKeyFeature.objects.create(product=product, title=k_item.strip(), display_order=idx)

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop('name_fa', None)
        gallery_images = validated_data.pop('gallery_images', None)
        gallery_data = validated_data.pop('gallery', None)
        key_takeaways = validated_data.pop('key_takeaways', None)
        key_features_data = validated_data.pop('key_features', None)
        attributes_data = validated_data.pop('attributes', None)
        tier_discounts_data = validated_data.pop('tier_discounts', None)

        # ضمانت یکتایی اسلاگ
        slug_val = validated_data.get('slug')
        if slug_val and Product.objects.filter(slug=slug_val).exists():
            validated_data['slug'] = f"{slug_val}-{uuid.uuid4().hex[:4]}"

        product = super().create(validated_data)
        self._save_nested_relations(
            product,
            attributes_data=attributes_data,
            tier_discounts_data=tier_discounts_data,
            gallery_data=gallery_data,
            gallery_images_data=gallery_images,
            key_features_data=key_features_data,
            key_takeaways_data=key_takeaways
        )
        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        validated_data.pop('name_fa', None)
        gallery_images = validated_data.pop('gallery_images', None)
        gallery_data = validated_data.pop('gallery', None)
        key_takeaways = validated_data.pop('key_takeaways', None)
        key_features_data = validated_data.pop('key_features', None)
        attributes_data = validated_data.pop('attributes', None)
        tier_discounts_data = validated_data.pop('tier_discounts', None)

        # ضمانت یکتایی اسلاگ هنگام ویرایش
        slug_val = validated_data.get('slug')
        if slug_val and Product.objects.filter(slug=slug_val).exclude(pk=instance.pk).exists():
            validated_data['slug'] = f"{slug_val}-{uuid.uuid4().hex[:4]}"

        product = super().update(instance, validated_data)
        self._save_nested_relations(
            product,
            attributes_data=attributes_data,
            tier_discounts_data=tier_discounts_data,
            gallery_data=gallery_data,
            gallery_images_data=gallery_images,
            key_features_data=key_features_data,
            key_takeaways_data=key_takeaways
        )
        return product
`;


  const viewsCode = `"""
products/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت کاتالوگ محصولات، دسته‌بندی‌ها، هولوگرام‌ها، ویژگی‌های فنی و همگام‌سازی صندوق (POS Sync)
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework import filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import (
    Category,
    ProductBrand,
    ProductHologram,
    ProductAttribute,
    ProductAttributeValue,
    Product
)
from .serializers import (
    CategorySerializer,
    ProductBrandSerializer,
    ProductHologramSerializer,
    ProductAttributeSerializer,
    ProductAttributeValueSerializer,
    ProductSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer
)


class ProductBrandListCreateAPIView(APIView):
    """
    اندپوینت مدیریت برندها با قابلیت آپلود فایل لوگو (MultiPartParser) و مشاهده پیش‌نمایش لوگو
    آدرس اندپوینت: /api/v1/products/brands/
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت لیست برندهای کالا (عمومی)",
        responses={200: ProductBrandSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProductBrand.objects.all().order_by('-id')
        serializer = ProductBrandSerializer(queryset, many=True, context={'request': request})
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="افزودن برند جدید به همراه آپلود فایل تصویر لوگو (مدیریت)",
        request_body=ProductBrandSerializer,
        responses={201: ProductBrandSerializer}
    )
    def post(self, request):
        serializer = ProductBrandSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            brand = serializer.save()
            return Response({
                'status': 'success',
                'message': 'برند جدید با موفقیت به همراه لوگو ثبت شد.',
                'data': ProductBrandSerializer(brand, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductBrandDetailUpdateDeleteAPIView(APIView):
    """
    اندپوینت مشاهده، ویرایش (شامل جایگزینی فایل لوگو) و حذف برند
    آدرس اندپوینت: /api/v1/products/brands/<id>/
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات برند",
        responses={200: ProductBrandSerializer}
    )
    def get(self, request, pk):
        brand = get_object_or_404(ProductBrand, pk=pk)
        return Response({'status': 'success', 'data': ProductBrandSerializer(brand, context={'request': request}).data})

    @swagger_auto_schema(
        operation_summary="ویرایش برند و جایگزینی فایل لوگو (مدیریت)",
        request_body=ProductBrandSerializer,
        responses={200: ProductBrandSerializer}
    )
    def put(self, request, pk):
        brand = get_object_or_404(ProductBrand, pk=pk)
        serializer = ProductBrandSerializer(brand, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات برند و تصویر لوگو با موفقیت بروزرسانی شد.',
                'data': ProductBrandSerializer(updated, context={'request': request}).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="حذف برند (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        brand = get_object_or_404(ProductBrand, pk=pk)
        brand.delete()
        return Response({'status': 'success', 'message': 'برند مورد نظر حذف گردید.'})


class BrandViewSet(ModelViewSet):
    """
    وب‌سرویس مدیریت برندها با الگوی ViewSet (پشتیبانی از DRF Router و MultiPartParser جهت آپلود لوگو)
    آدرس اندپوینت: /api/v1/products/brands/
    """
    queryset = ProductBrand.objects.all()
    serializer_class = ProductBrandSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'name_en', 'country']
    ordering_fields = ['name', 'id']
    ordering = ['name']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


# نام‌های مستعار برای سازگاری کامل با پروژه‌های نام‌گذاری مختلف
BrandListCreateAPIView = ProductBrandListCreateAPIView
BrandDetailUpdateDeleteAPIView = ProductBrandDetailUpdateDeleteAPIView


class CategoryListCreateAPIView(APIView):
    """
    اندپوینت مدیریت دسته‌بندی‌ها (دریافت لیست و ایجاد دسته‌بندی جدید)
    
    فیلدهای فرم ورودی (مطابق با رابط کاربری صندوق و مدیریت):
    ۱. عنوان دسته‌بندی (فارسی) * -> name (اجباری)
    ۲. نام لاتین (English) -> name_en (اختیاری)
    ۳. شناسه سیستمی (Slug / ID) -> slug (یکتا / در صورت خالی بودن خودکار تولید می‌شود)
    ۴. رنگ شناسه -> color (کد رنگ پالت انتخابی Choice)
    ۵. توضیحات کوتاه دسته‌بندی -> description (اختیاری)
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
        queryset = Category.objects.all().order_by('-id')
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
    اندپوینت مشاهده، ویرایش و حذف یک دسته‌بندی مشخص بر اساس ID
    """
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات دسته‌بندی",
        responses={200: CategorySerializer}
    )
    def get(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        return Response({'status': 'success', 'data': CategorySerializer(category).data})

    @swagger_auto_schema(
        operation_summary="ویرایش دسته‌بندی (مدیریت)",
        request_body=CategorySerializer,
        responses={200: CategorySerializer}
    )
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

    @swagger_auto_schema(
        operation_summary="حذف دسته‌بندی (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        category.delete()
        return Response({'status': 'success', 'message': 'دسته‌بندی با موفقیت حذف گردید.'})


class HologramListCreateAPIView(APIView):
    """
    اندپوینت دریافت لیست هولوگرام‌ها و سطوح اصالت یا ثبت هولوگرام جدید با سطح اعتبار انتخابی (Choice)
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
    اندپوینت مشاهده، ویرایش و حذف برچسب هولوگرام اصالت کالا
    """
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات هولوگرام اصالت",
        responses={200: ProductHologramSerializer}
    )
    def get(self, request, pk):
        hologram = get_object_or_404(ProductHologram, pk=pk)
        return Response({'status': 'success', 'data': ProductHologramSerializer(hologram).data})

    @swagger_auto_schema(
        operation_summary="ویرایش هولوگرام اصالت (مدیریت)",
        request_body=ProductHologramSerializer,
        responses={200: ProductHologramSerializer}
    )
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

    @swagger_auto_schema(
        operation_summary="حذف هولوگرام اصالت (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        hologram = get_object_or_404(ProductHologram, pk=pk)
        hologram.delete()
        return Response({'status': 'success', 'message': 'هولوگرام مورد نظر حذف گردید.'})


class ProductAttributeListCreateAPIView(APIView):
    """
    اندپوینت دریافت لیست ویژگی‌های کالا و تعریف ویژگی جدید با نوع داده انتخابی (Choice)
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
        queryset = ProductAttribute.objects.all().order_by('name')
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
    اندپوینت مشاهده، ویرایش و حذف تعریف ویژگی مشخص
    """
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات تعریف ویژگی",
        responses={200: ProductAttributeSerializer}
    )
    def get(self, request, pk):
        attr = get_object_or_404(ProductAttribute, pk=pk)
        return Response({'status': 'success', 'data': ProductAttributeSerializer(attr).data})

    @swagger_auto_schema(
        operation_summary="ویرایش تعریف ویژگی (مدیریت)",
        request_body=ProductAttributeSerializer,
        responses={200: ProductAttributeSerializer}
    )
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

    @swagger_auto_schema(
        operation_summary="حذف تعریف ویژگی (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        attr = get_object_or_404(ProductAttribute, pk=pk)
        attr.delete()
        return Response({'status': 'success', 'message': 'ویژگی با موفقیت از سیستم حذف شد.'})


class ProductAttributeValuesSetAPIView(APIView):
    """
    اندپوینت ثبت و ویرایش دسته‌جمعی مقادیر ویژگی‌های فنی برای یک کالای مشخص
    پشتیبانی از شناسه‌های ویژگی‌های موجود و ایجاد خودکار ویژگی‌های جدید با کلیه مشخصات در دیتابیس
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ثبت و بروزرسانی مقادیر ویژگی‌های فنی یک کالا (مدیریت)",
        responses={200: ProductSerializer}
    )
    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        attributes_data = request.data.get('attributes', [])

        for item in attributes_data:
            if not isinstance(item, dict):
                continue

            attr_id = item.get('attribute_id') or item.get('id')
            attr_name = item.get('name') or item.get('title')
            val = item.get('value')
            val_num = item.get('value_number')
            val_bool = item.get('value_boolean')

            attribute = None
            if attr_id and str(attr_id).isdigit():
                attribute = ProductAttribute.objects.filter(id=int(attr_id)).first()

            if not attribute and attr_name:
                name_clean = str(attr_name).strip()
                attribute = ProductAttribute.objects.filter(
                    Q(name__iexact=name_clean) | Q(name_en__iexact=name_clean)
                ).first()
                if not attribute:
                    attribute = ProductAttribute.objects.create(
                        name=name_clean,
                        name_en=item.get('name_en') or slugify(name_clean, allow_unicode=True),
                        data_type=item.get('data_type') or 'text',
                        unit=item.get('unit') or '',
                        options=item.get('options') or '',
                        help_text=item.get('help_text') or '',
                        is_required=item.get('is_required', False),
                        is_filterable=item.get('is_filterable', True),
                    )

            if not attribute:
                continue

            # تحلیل عددی در صورت نیاز
            if val_num is None and val is not None and attribute.data_type == 'number':
                try:
                    cleaned_num = str(val).replace(attribute.unit or '', '').strip()
                    val_num = float(cleaned_num)
                except (ValueError, TypeError):
                    val_num = None

            # تحلیل بولی در صورت نیاز
            if val_bool is None and val is not None and attribute.data_type == 'boolean':
                val_bool = str(val).lower() in ['true', '1', 'yes', 'بله', 'دارد']

            ProductAttributeValue.objects.update_or_create(
                product=product,
                attribute=attribute,
                defaults={
                    'value': str(val) if val is not None else '',
                    'value_number': val_num,
                    'value_boolean': val_bool
                }
            )

        return Response({
            'status': 'success',
            'message': 'مقادیر مشخصات فنی کالا با موفقیت ذخیره گردید.',
            'data': ProductSerializer(product).data
        }, status=status.HTTP_200_OK)


class ProductListAPIView(APIView):
    """
    اندپوینت کاتالوگ محصولات آنلاین سایت با فیلتر خودکار کالاهای فعال و غیرحضوری (is_pos_only=False)
    پشتیبانی از متد GET (لیست کاتالوگ) و POST (ثبت محصول جدید)
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
        ).select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'attributes_values__attribute')

        brand = request.query_params.get('brand')
        if brand:
            if str(brand).isdigit():
                queryset = queryset.filter(brand_id=int(brand))
            else:
                queryset = queryset.filter(
                    Q(brand__name__icontains=brand) | 
                    Q(brand__name_en__icontains=brand) | 
                    Q(brand__slug__iexact=brand)
                )

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

    @swagger_auto_schema(
        operation_summary="ثبت محصول جدید در کاتالوگ (سازگاری با POST مستقیم)",
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
        return Response({
            'status': 'error',
            'message': 'خطا در صحت‌سنجی اطلاعات ورودی محصول',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PosCatalogAPIView(APIView):
    """
    اندپوینت کاتالوگ کامل صندوق حضوری (POS) شامل اقلام آنلاین و اختصاصی صندوق (is_pos_only=True) و جستجوی اسکنر بارکد
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت کاتالوگ کامل صندوق حضوری شامل بارکد و کلیه اقلام",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.filter(is_active=True).select_related('category', 'brand', 'hologram')

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
    """
    اندپوینت دریافت لیست محصولات پیشنهاد ویژه صفحه اصلی
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست پیشنهادهای ویژه صفحه اصلی",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.filter(is_active=True, is_featured=True, is_pos_only=False).select_related('category', 'brand', 'hologram')
        serializer = ProductSerializer(queryset, many=True)
        return Response({'status': 'success', 'count': queryset.count(), 'results': serializer.data})


class ProductCreateAPIView(APIView):
    """
    اندپوینت ثبت محصول جدید در کاتالوگ آنلاین / صندوق حضوری
    جهت تست آسان و اتصال اندپوینت فرانت‌ند سطح دسترسی به AllowAny تنظیم شده است (در صورت نیاز به محدودسازی ادمین می‌توانید IsAdminUser قرار دهید)
    """
    permission_classes = [AllowAny]

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
        return Response({
            'status': 'error',
            'message': 'خطا در صحت‌سنجی اطلاعات ورودی محصول',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailAPIView(APIView):
    """
    اندپوینت دریافت جزئیات کامل یک محصول بر اساس ID
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات کامل محصول به همراه گالری و ویژگی‌ها",
        responses={200: ProductDetailSerializer}
    )
    def get(self, request, pk):
        product = get_object_or_404(
            Product.objects.select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'attributes_values__attribute'), 
            pk=pk
        )
        serializer = ProductDetailSerializer(product)
        return Response({'status': 'success', 'data': serializer.data})


class ProductUpdateAPIView(APIView):
    """
    اندپوینت ویرایش کامل یا جزئی اطلاعات محصول (مخصوص ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ویرایش اطلاعات محصول (مدیریت)",
        request_body=ProductCreateUpdateSerializer,
        responses={200: ProductSerializer}
    )
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

    @swagger_auto_schema(
        operation_summary="ویرایش جزئی اطلاعات محصول (مدیریت)",
        request_body=ProductCreateUpdateSerializer,
        responses={200: ProductSerializer}
    )
    def patch(self, request, pk):
        return self.put(request, pk)


class ProductSyncPosStockAPIView(APIView):
    """
    اندپوینت همگام‌سازی لحظه‌ای موجودی انبار و تغییر وضعیت اختصاصی صندوق (POS Stock Sync)
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="همگام‌سازی موجودی و کانال عرضه صندوق حضوری",
        responses={200: ProductSerializer}
    )
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
    """
    اندپوینت حذف محصول از سیستم (مخصوص ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="حذف محصول از کاتالوگ (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response({'status': 'success', 'message': 'محصول با موفقیت از کاتالوگ حذف شد.'})
`;
  const urlsCode = `"""
products/urls.py
مسیرهای جامع REST API برای دسته‌بندی‌ها، برندها، هولوگرام، ویژگی‌ها، کاتالوگ محصولات و صندوق (POS Sync)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BrandViewSet,
    ProductBrandListCreateAPIView,
    ProductBrandDetailUpdateDeleteAPIView,
    CategoryListCreateAPIView,
    CategoryDetailUpdateDeleteAPIView,
    HologramListCreateAPIView,
    HologramDetailUpdateDeleteAPIView,
    ProductAttributeListCreateAPIView,
    ProductAttributeDetailUpdateDeleteAPIView,
    ProductAttributeValuesSetAPIView,
    ProductListAPIView,
    PosCatalogAPIView,
    ProductFeaturedAPIView,
    ProductCreateAPIView,
    ProductDetailAPIView,
    ProductUpdateAPIView,
    ProductSyncPosStockAPIView,
    ProductDeleteAPIView,
)

router = DefaultRouter()
router.register(r'brands-router', BrandViewSet, basename='brand-viewset')

urlpatterns = [
    # روتر اختیاری ویوست برند
    path('', include(router.urls)),

    # برندها (APIView)
    path('brands/', ProductBrandListCreateAPIView.as_view(), name='product-brand-list-create'),
    path('brands/<int:pk>/', ProductBrandDetailUpdateDeleteAPIView.as_view(), name='product-brand-detail'),

    # دسته‌بندی‌ها (APIView)
    path('categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailUpdateDeleteAPIView.as_view(), name='category-detail'),

    # هولوگرام‌ها (APIView)
    path('holograms/', HologramListCreateAPIView.as_view(), name='hologram-list-create'),
    path('holograms/<int:pk>/', HologramDetailUpdateDeleteAPIView.as_view(), name='hologram-detail'),

    # ویژگی‌های فنی (APIView)
    path('attributes/', ProductAttributeListCreateAPIView.as_view(), name='attribute-list-create'),
    path('attributes/<int:pk>/', ProductAttributeDetailUpdateDeleteAPIView.as_view(), name='attribute-detail'),
    path('items/<int:pk>/attributes/', ProductAttributeValuesSetAPIView.as_view(), name='product-attribute-values-set'),

    # کاتالوگ محصولات، پیشنهاد ویژه و صندوق (APIView)
    path('', ProductListAPIView.as_view(), name='product-root'),
    path('products/', ProductListAPIView.as_view(), name='product-list-alt'),
    path('items/', ProductListAPIView.as_view(), name='product-list'),
    path('items/create/', ProductCreateAPIView.as_view(), name='product-create'),
    path('items/featured/', ProductFeaturedAPIView.as_view(), name='product-featured'),
    path('items/pos-catalog/', PosCatalogAPIView.as_view(), name='product-pos-catalog'),
    path('items/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('items/<int:pk>/update/', ProductUpdateAPIView.as_view(), name='product-update'),
    path('items/<int:pk>/delete/', ProductDeleteAPIView.as_view(), name='product-delete'),
    path('items/<int:pk>/pos-sync-stock/', ProductSyncPosStockAPIView.as_view(), name='product-pos-sync-stock'),

    # مسیرهای میان‌بر جهت سازگاری کامل با درخواست‌های مستقیم فرانت‌اند
    path('create/', ProductCreateAPIView.as_view(), name='product-create-short'),
    path('<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail-short'),
    path('<int:pk>/update/', ProductUpdateAPIView.as_view(), name='product-update-short'),
    path('<int:pk>/delete/', ProductDeleteAPIView.as_view(), name='product-delete-short'),
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
