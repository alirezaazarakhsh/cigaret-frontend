import React from 'react';
import { Users } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const RegularCustomersDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'regular_customers_customervipcardtier',
      verboseName: 'سطوح کارت‌های VIP باشگاه مشتریان و مغازه‌داران (CustomerVipCardTier)',
      description: 'جدول سطوح کارت‌های اعتباری و خریداران عمده (برنز، نقره‌ای، طلایی، پلاتینیوم، بلک کارت الماس) با درصد تخفیف خرید، سقف اعتبار نسیه و تم رنگی اختصاصی.',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'code', type: 'CharField(max_length=50, unique=True)', verbose: 'کد سطح مشتری (bronze, silver, gold, platinum, diamond_black)' },
        { name: 'name_fa', type: 'CharField(max_length=100)', verbose: 'عنوان فارسی کارت مشتری (مثال: کارت طلایی VIP)' },
        { name: 'badge_title', type: 'CharField(max_length=50)', verbose: 'عنوان بج انگلیسی (GOLD VIP)' },
        { name: 'theme_color', type: 'CharField(max_length=30)', verbose: 'کد رنگ تم هگز (#d97706)' },
        { name: 'card_gradient', type: 'CharField(max_length=200)', verbose: 'کلاس‌های گرادیانت کارت' },
        { name: 'discount_rate', type: 'DecimalField(max_digits=4, decimal_places=2, default=2.50)', verbose: 'درصد تخفیف خرید (%)' },
        { name: 'credit_limit', type: 'BigIntegerField(default=50000000)', verbose: 'سقف اعتبار پیش‌فرض نسیه (تومان)' },
        { name: 'description', type: 'TextField(blank=True)', verbose: 'توضیحات و امتیازات سطح مشتری' },
        { name: 'created_at_jalali', type: 'CharField(max_length=25)', verbose: 'تاریخ شمسی ایجاد' },
      ]
    },
    {
      name: 'regular_customers_visitorvipcardtier',
      verboseName: 'سطوح کارت‌های VIP و درجات ویزیتورها و سفیران فروش (VisitorVipCardTier)',
      description: 'جدول درجات و رتبه‌های شغلی ویزیتورها (سفیر برنز، سفیر نقره‌ای، سرپرست طلایی VIP، مدیر ارشد سفیر الماس) با درصد پورسانت ارتقایافته، تارگت ماهانه و استایل اختصاصی.',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'code', type: 'CharField(max_length=50, unique=True)', verbose: 'کد سطح ویزیتور (visitor_junior, visitor_silver, visitor_gold_leader, visitor_diamond_ambassador)' },
        { name: 'name_fa', type: 'CharField(max_length=100)', verbose: 'عنوان فارسی کارت و رتبه ویزیتور (مثال: کارت سرپرست فروش طلایی VIP)' },
        { name: 'badge_title', type: 'CharField(max_length=50)', verbose: 'عنوان بج ویزیتوری (GOLD VISITOR LEADER VIP)' },
        { name: 'theme_color', type: 'CharField(max_length=30)', verbose: 'کد رنگ تم هگز (#0284c7)' },
        { name: 'card_gradient', type: 'CharField(max_length=200)', verbose: 'کلاس‌های گرادیانت کارت سفیر' },
        { name: 'commission_bonus_rate', type: 'DecimalField(max_digits=5, decimal_places=2, default=3.00)', verbose: 'درصد پورسانت فروش ویزیتوری (%)' },
        { name: 'monthly_target_amount', type: 'BigIntegerField(default=300000000)', verbose: 'تارگت فروش ماهانه ویزیتور (تومان)' },
        { name: 'description', type: 'TextField(blank=True)', verbose: 'مزایا و حقوق رتبه ویزیتور' },
        { name: 'created_at_jalali', type: 'CharField(max_length=25)', verbose: 'تاریخ شمسی ایجاد' },
      ]
    },
    {
      name: 'regular_customers_regularcustomer',
      verboseName: 'پروفایل جامع مشتریان و ویزیتورها (RegularCustomer)',
      description: 'جدول اصلی یکپارچه کاربری با تفکیک کامل فیلدهای کارت VIP مشتریان (customer_vip_tier) و کارت VIP ویزیتورها (visitor_vip_tier)، مشخصات مغازه، اطلاعات هویتی و وسیله نقلیه ویزیتور، کیف پول و حساب دفتری.',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'user_id', type: 'OneToOneField(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'حساب کاربری سامانه' },
        { name: 'role', type: 'CharField(choices: customer, visitor, admin)', verbose: 'نقش کاربر' },
        { name: 'is_visitor', type: 'BooleanField(default=False)', verbose: 'تیک فعال‌سازی دسترسی ویزیتوری' },
        { name: 'customer_vip_tier_id', type: 'ForeignKey(CustomerVipCardTier)', isFk: true, fkTarget: 'regular_customers_customervipcardtier', verbose: 'کارت VIP اختصاصی مشتری/مغازه‌دار' },
        { name: 'visitor_vip_tier_id', type: 'ForeignKey(VisitorVipCardTier)', isFk: true, fkTarget: 'regular_customers_visitorvipcardtier', verbose: 'کارت VIP و درجه اختصاصی ویزیتور' },
        { name: 'wallet_balance', type: 'BigIntegerField(default=0)', verbose: 'موجودی کیف پول الکترونیکی (تومان)' },
        { name: 'credit_limit', type: 'BigIntegerField(default=0)', verbose: 'سقف اعتبار حساب دفتری و نسیه (تومان)' },
        { name: 'is_profile_completed', type: 'BooleanField(default=False)', verbose: 'تکمیل مشخصات اجباری' },
        { name: 'is_verified', type: 'BooleanField(default=False)', verbose: 'احراز هویت تایید شده' },
        
        // فیلدهای اختصاصی مشتری
        { name: 'shop_name', type: 'CharField(max_length=200, blank=True)', verbose: 'نام فروشگاه / مغازه' },
        { name: 'business_license_number', type: 'CharField(max_length=50, blank=True)', verbose: 'شماره پروانه کسب / جواز' },
        
        // فیلدهای اختصاصی ویزیتور
        { name: 'visitor_code', type: 'CharField(max_length=50, blank=True, unique=True)', verbose: 'کد اختصاصی ویزیتور' },
        { name: 'commission_rate', type: 'DecimalField(max_digits=5, decimal_places=2, default=2.50)', verbose: 'درصد کمیسیون فروش' },
        { name: 'national_code', type: 'CharField(max_length=10, blank=True)', verbose: 'کد ملی ۱۰ رقمی ویزیتور' },
        { name: 'national_id_image', type: 'ImageField(upload_to="national_ids/", blank=True)', verbose: 'تصویر کارت ملی ویزیتور' },
        { name: 'vehicle_type', type: 'CharField(choices: motorcycle, car, van, truck)', verbose: 'نوع وسیله نقلیه شخصی' },
        { name: 'vehicle_plate', type: 'CharField(max_length=50, blank=True)', verbose: 'شماره پلاک وسیله نقلیه' },
        { name: 'is_vehicle_verified', type: 'BooleanField(default=False)', verbose: 'تایید وسیله نقلیه' },
        { name: 'accepted_contract_id', type: 'ForeignKey(VisitorContractTemplate, null=True)', isFk: true, fkTarget: 'regular_customers_visitorcontracttemplate', verbose: 'نسخه قرارداد آنلاین امضا شده' },
        { name: 'has_accepted_contract', type: 'BooleanField(default=False)', verbose: 'تایید و امضای قرارداد آنلاین' },
        { name: 'contract_accepted_at_jalali', type: 'CharField(max_length=30)', verbose: 'تاریخ شمسی امضای قرارداد' },
        { name: 'contract_signature_text', type: 'CharField(max_length=150)', verbose: 'امضای دیجیتال / نام تاییدکننده' },
        
        // اطلاعات تماس و بانکی
        { name: 'province', type: 'CharField(max_length=60)', verbose: 'استان' },
        { name: 'city', type: 'CharField(max_length=60)', verbose: 'شهر' },
        { name: 'address', type: 'TextField', verbose: 'آدرس دقیق محل تحویل / فعالیت' },
        { name: 'bank_name', type: 'CharField(max_length=50)', verbose: 'نام بانک' },
        { name: 'account_holder_name', type: 'CharField(max_length=150)', verbose: 'نام صاحب حساب (مطابق کارت ملی)' },
        { name: 'card_number', type: 'CharField(max_length=16)', verbose: 'شماره کارت ۱۶ رقمی' },
        { name: 'shaba_number', type: 'CharField(max_length=26)', verbose: 'شماره شبا (با IR)' },
        { name: 'created_at_jalali', type: 'CharField(max_length=25)', verbose: 'تاریخ شمسی ثبت‌نام' },
      ]
    },
    {
      name: 'regular_customers_visitorcontracttemplate',
      verboseName: 'قالب‌های قرارداد آنلاین ویزیتوری (VisitorContractTemplate)',
      description: 'جدول ذخیره‌سازی و مدیریت متن کامل قرارداد آنلاین همکاری ویزیتورها و سفیران فروش در دیتابیس با امکان ویرایش، نسخه دهی و فعال/غیرفعال‌سازی توسط مدیریت.',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'title', type: 'CharField(max_length=200)', verbose: 'عنوان قرارداد آنلاین' },
        { name: 'version', type: 'CharField(max_length=30)', verbose: 'شماره نسخه (مثال: 1.0, 2.1)' },
        { name: 'content_text', type: 'TextField', verbose: 'متن و مفاد کامل حقوقی قرارداد' },
        { name: 'terms_summary', type: 'TextField(blank=True)', verbose: 'خلاصه ضوابط و تبصره‌های پورسانت' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'نسخه فعال جهت نمایش و امضا' },
        { name: 'created_at_jalali', type: 'CharField(max_length=25)', verbose: 'تاریخ شمسی ایجاد' },
        { name: 'updated_at_jalali', type: 'CharField(max_length=25)', verbose: 'تاریخ شمسی ویرایش' },
      ]
    },
    {
      name: 'regular_customers_walletdepositreceipt',
      verboseName: 'فیش‌های واریزی بانکی و شارژ کیف پول (WalletDepositReceipt)',
      description: 'فیش‌های ارسالی مشتریان و ویزیتورها برای شارژ کیف پول یا تسویه بدهی حساب دفتری با تصویر فیش، شماره پیگیری، تایید ادمین و اعمال خودکار به حساب کاربر.',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'customer_id', type: 'ForeignKey(RegularCustomer)', isFk: true, fkTarget: 'regular_customers_regularcustomer', verbose: 'مشتری یا ویزیتور واریزکننده' },
        { name: 'purpose', type: 'CharField(choices: charge_wallet, settle_debt, order_deposit)', verbose: 'هدف واریز (شارژ کیف پول / تسویه بدهی)' },
        { name: 'amount', type: 'BigIntegerField', verbose: 'مبلغ واریز شده (تومان)' },
        { name: 'tracking_number', type: 'CharField(max_length=100)', verbose: 'شماره پیگیری / ارجاع بانکی' },
        { name: 'bank_origin', type: 'CharField(max_length=50)', verbose: 'بانک مبدا' },
        { name: 'sender_card_last4', type: 'CharField(max_length=4, blank=True)', verbose: '۴ رقم آخر کارت واریزکننده' },
        { name: 'receipt_image', type: 'ImageField(upload_to="deposit_slips/")', verbose: 'تصویر اسکن/عکس فیش واریزی' },
        { name: 'status', type: 'CharField(choices: pending, approved, rejected, default=pending)', verbose: 'وضعیت بررسی حسابداری' },
        { name: 'rejection_reason', type: 'TextField(blank=True)', verbose: 'علت عدم تایید' },
        { name: 'notes', type: 'TextField(blank=True)', verbose: 'توضیحات کاربر' },
        { name: 'reviewed_by', type: 'CharField(max_length=100, blank=True)', verbose: 'کارشناس بررسی‌کننده' },
        { name: 'reviewed_at_jalali', type: 'CharField(max_length=30, blank=True)', verbose: 'تاریخ شمسی بررسی (انتخاب با دیت پیکر شمسی)' },
        { name: 'deposit_date_jalali', type: 'CharField(max_length=25)', verbose: 'تاریخ شمسی واریز' },
        { name: 'created_at_jalali', type: 'CharField(max_length=25)', verbose: 'تاریخ شمسی ثبت فیش' },
      ]
    },
    {
      name: 'regular_customers_customerledgerentry',
      verboseName: 'ریز گردش حساب دفتری مشتری و ویزیتور (CustomerLedgerEntry)',
      description: 'سوابق بدهکاری/بستانکاری نسیه و تراکنش‌های مالی حساب دفتری برای مشتریان و ویزیتورها.',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'customer_id', type: 'ForeignKey(RegularCustomer)', isFk: true, fkTarget: 'regular_customers_regularcustomer', verbose: 'طرف حساب' },
        { name: 'entry_type', type: 'CharField(choices: debit_purchase, credit_settlement, wallet_charge, wallet_withdraw)', verbose: 'نوع سند (بدهکار / بستانکار / کیف پول)' },
        { name: 'amount', type: 'BigIntegerField', verbose: 'مبلغ سند (تومان)' },
        { name: 'balance_after', type: 'BigIntegerField', verbose: 'مانده حساب بعد از سند (تومان)' },
        { name: 'description', type: 'CharField(max_length=255)', verbose: 'شرح سند' },
        { name: 'related_receipt_id', type: 'ForeignKey(WalletDepositReceipt, null=True)', isFk: true, fkTarget: 'regular_customers_walletdepositreceipt', verbose: 'فیش واریزی مرتبط' },
        { name: 'created_at_jalali', type: 'CharField(max_length=25)', verbose: 'تاریخ شمسی ثبت' },
      ]
    },
    {
      name: 'regular_customers_customerorderrecord',
      verboseName: 'سوابق سفارش‌ها و پیش‌فاکتورها (CustomerOrderRecord)',
      description: 'سوابق کلیه فاکتورهای ثبت شده توسط خریداران و ویزیتورها همراه با ریز اقلام، شیوه پرداخت (کیف پول / فیش) و وضعیت ترابری.',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'order_number', type: 'CharField(max_length=50, unique=True)', verbose: 'شماره پیگیری سفارش (مثال: SVN-89412)' },
        { name: 'customer_id', type: 'ForeignKey(RegularCustomer)', isFk: true, fkTarget: 'regular_customers_regularcustomer', verbose: 'ثبت‌کننده سفارش' },
        { name: 'total_cartons', type: 'IntegerField', verbose: 'تعداد کل کارتن‌ها' },
        { name: 'total_boxes', type: 'IntegerField', verbose: 'تعداد کل باکس‌ها' },
        { name: 'subtotal', type: 'BigIntegerField', verbose: 'مبلغ ناخالص (تومان)' },
        { name: 'discount_amount', type: 'BigIntegerField', verbose: 'تخفیف تیراژ و کارت VIP (تومان)' },
        { name: 'shipping_cost', type: 'BigIntegerField', verbose: 'هزینه باربری (تومان)' },
        { name: 'final_total', type: 'BigIntegerField', verbose: 'مبلغ نهایی فاکتور (تومان)' },
        { name: 'payment_method', type: 'CharField(choices: wallet_instant, bank_deposit_slip, pos_terminal, ledger_credit)', verbose: 'شیوه تسویه حساب' },
        { name: 'payment_status', type: 'CharField(max_length=50)', verbose: 'وضعیت پرداخت' },
        { name: 'created_at_jalali', type: 'CharField(max_length=25)', verbose: 'تاریخ و ساعت شمسی ثبت' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/regular-customers/vip-tiers/customers/',
      auth: 'AllowAny',
      description: 'دریافت لیست تمام کارت‌های عضویت VIP خریداران و بنکداران شامل درصد تخفیف خرید و سقف اعتبار نسیه.',
      curlExample: `curl -X GET http://localhost:8000/api/v1/regular-customers/vip-tiers/customers/`,
      responseBody: `{
  "status": "success",
  "results": [
    {
      "id": 1,
      "code": "gold",
      "name_fa": "کارت طلایی عمده‌فروش VIP",
      "badge_title": "GOLD VIP",
      "theme_color": "#d97706",
      "card_gradient": "from-amber-600 via-yellow-500 to-amber-700",
      "discount_rate": "2.50",
      "credit_limit": 100000000
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/api/v1/regular-customers/vip-tiers/visitors/',
      auth: 'AllowAny',
      description: 'دریافت لیست تمام رتبه‌ها و کارت‌های VIP ویزیتورها شامل پاداش پورسانت فروش و تارگت ماهانه.',
      curlExample: `curl -X GET http://localhost:8000/api/v1/regular-customers/vip-tiers/visitors/`,
      responseBody: `{
  "status": "success",
  "results": [
    {
      "id": 1,
      "code": "visitor_gold_leader",
      "name_fa": "کارت سرپرست فروش طلایی VIP",
      "badge_title": "GOLD VISITOR LEADER VIP",
      "theme_color": "#d97706",
      "card_gradient": "from-amber-600 via-yellow-500 to-amber-700",
      "commission_bonus_rate": "3.50",
      "monthly_target_amount": 600000000
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/api/v1/regular-customers/profile/',
      auth: 'IsAuthenticated',
      description: 'دریافت پروفایل کامل کاربر (تفکیک‌شده برای مشتری یا ویزیتور)، کارت VIP، موجودی کیف پول، سقف اعتبار دفتری و تاریخ شمسی.',
      curlExample: `curl -X GET http://localhost:8000/api/v1/regular-customers/profile/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: `{
  "status": "success",
  "data": {
    "id": 14,
    "full_name": "حسین رضایی",
    "phone": "09120759419",
    "role": "visitor",
    "is_visitor": true,
    "visitor_code": "VIS-9419",
    "commission_rate": "2.50",
    "national_code": "0012345678",
    "national_id_image_url": "/media/national_ids/vis_9419.jpg",
    "vehicle_type": "motorcycle",
    "vehicle_plate": "ایران ۶۸ - ۳۴۵ ج ۹۱",
    "is_vehicle_verified": true,
    "has_accepted_contract": true,
    "shop_name": null,
    "business_license_number": null,
    "province": "تهران",
    "city": "تهران",
    "address": "خیابان مولوی، سرای دخانیات، پلاک ۱۸",
    "bank_name": "بانک ملت",
    "account_holder_name": "حسین رضایی",
    "card_number": "6104337890123456",
    "shaba_number": "IR120120000000001234567890",
    "wallet_balance": 2500000,
    "credit_limit": 50000000,
    "customer_vip_tier": {
      "code": "gold",
      "name_fa": "کارت طلایی عمده‌فروش VIP",
      "badge_title": "GOLD VIP",
      "theme_color": "#d97706",
      "discount_rate": "2.50"
    },
    "visitor_vip_tier": {
      "code": "visitor_gold_leader",
      "name_fa": "کارت سرپرست فروش طلایی VIP",
      "badge_title": "GOLD VISITOR LEADER VIP",
      "theme_color": "#d97706",
      "commission_bonus_rate": "3.50",
      "monthly_target_amount": 600000000
    },
    "is_profile_completed": true,
    "is_verified": true,
    "created_at_jalali": "۱۴۰۳/۰۵/۱۴ - ۰۹:۱۵"
  }
}`
    },
    {
      method: 'PUT',
      path: '/api/v1/regular-customers/profile/update/',
      auth: 'IsAuthenticated',
      description: 'بروزرسانی مشخصات مشتری (نام فروشگاه، جواز، آدرس) یا ویزیتور (کد ملی، عکس کارت ملی، وسیله نقلیه، پلاک، امضای قرارداد و مشخصات بانکی).',
      curlExample: `curl -X PUT http://localhost:8000/api/v1/regular-customers/profile/update/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"shop_name": "پخش دخانیات نگین", "card_number": "6037997975311982", "shaba_number": "IR120170000000123456789012"}'`
    },
    {
      method: 'POST',
      path: '/api/v1/regular-customers/wallet/charge-slip/',
      auth: 'IsAuthenticated',
      description: 'ثبت فیش واریز بانکی جهت شارژ کیف پول یا تسویه حساب دفتری با بارگذاری تصویر فیش و شماره پیگیری.',
      curlExample: `curl -X POST http://localhost:8000/api/v1/regular-customers/wallet/charge-slip/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -F "purpose=charge_wallet" \\
  -F "amount=15000000" \\
  -F "tracking_number=982145012" \\
  -F "bank_origin=بانک ملت" \\
  -F "sender_card_last4=4192" \\
  -F "receipt_image=@/path/to/slip.jpg"`,
      responseBody: `{
  "status": "success",
  "message": "فیش واریزی با موفقیت ثبت شد و در انتظار تایید حسابداری انبار مرکزی قرار گرفت.",
  "data": {
    "id": 89,
    "purpose": "charge_wallet",
    "amount": 15000000,
    "tracking_number": "982145012",
    "status": "pending",
    "deposit_date_jalali": "۱۴۰۳/۰۶/۰۲ - ۱۰:۳۰"
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/regular-customers/wallet/slips/',
      auth: 'IsAuthenticated',
      description: 'دریافت لیست فیش‌های واریزی ارسال‌شده توسط کاربر همراه با وضعیت بررسی (در انتظار / تایید شده / رد شده).',
      curlExample: `curl -X GET http://localhost:8000/api/v1/regular-customers/wallet/slips/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`
    },
    {
      method: 'GET',
      path: '/api/v1/regular-customers/ledger/',
      auth: 'IsAuthenticated',
      description: 'دریافت ریز حساب دفتری، سوابق نسیه و مانده بدهکاری/بستانکاری مشتری و ویزیتور با تاریخ‌های کاملاً شمسی.',
      curlExample: `curl -X GET http://localhost:8000/api/v1/regular-customers/ledger/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`
    },
    {
      method: 'GET',
      path: '/api/v1/regular-customers/orders/',
      auth: 'IsAuthenticated',
      description: 'دریافت لیست سفارشات و پیش‌فاکتورهای رسمی ثبت شده با ریز اقلام و وضعیت تسویه و ترابری.',
      curlExample: `curl -X GET http://localhost:8000/api/v1/regular-customers/orders/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`
    },
    {
      method: 'POST',
      path: '/api/v1/regular-customers/orders/pay-with-wallet/',
      auth: 'IsAuthenticated',
      description: 'تسویه و پرداخت فوری سفارش از موجودی کیف پول الکترونیکی مشتری یا ویزیتور بدون نیاز به آپلود فیش.',
      curlExample: `curl -X POST http://localhost:8000/api/v1/regular-customers/orders/pay-with-wallet/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"order_id": "SVN-89412", "amount": 176710000}'`
    }
  ];

  const modelsCode = `"""
regular_customers/models.py
اپلیکیشن جامع و یکپارچه مشتریان، ویزیتورها، کارت‌های VIP، کیف پول، فیش‌های بانکی و حساب دفتری
تمامی تاریخ‌ها به صورت تاریخ شمسی (Jalali) در فیلدها و پنل مدیریت پیاده‌سازی شده است.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
import jdatetime
from accounts.models import User


def get_current_jalali_datetime():
    """تولید رشته تاریخ و ساعت شمسی دقیق"""
    now = jdatetime.datetime.now()
    return now.strftime('%Y/%m/%d - %H:%M')


def get_current_jalali_date():
    """تولید رشته تاریخ شمسی جاری"""
    now = jdatetime.date.today()
    return now.strftime('%Y/%m/%d')


class CustomerVipCardTier(models.Model):
    """
    سطوح کارت‌های VIP و وفاداری باشگاه مشتریان و مغازه‌داران
    رنگ، گرادیانت، درصد تخفیف خرید و سقف اعتبار نسیه قابل تعریف توسط مدیر سیستم.
    """
    code = models.CharField(_("کد یکتا سطح مشتری"), max_length=50, unique=True, db_index=True)
    name_fa = models.CharField(_("عنوان کارت مشتری"), max_length=100)
    badge_title = models.CharField(_("عنوان نشان مشتری"), max_length=50, default="VIP MEMBER")
    theme_color = models.CharField(_("کد رنگ هگز تم"), max_length=30, default="#d97706")
    card_gradient = models.CharField(_("کلاس گرادیانت"), max_length=200, default="from-amber-950 via-amber-900 to-yellow-950")
    card_border = models.CharField(_("استایل بوردر کارت"), max_length=100, default="border-amber-400/80")
    badge_bg = models.CharField(_("رنگ پس‌زمینه نشان"), max_length=100, default="bg-amber-400/25")
    discount_rate = models.DecimalField(_("درصد تخفیف خرید (%)"), max_digits=4, decimal_places=2, default=2.50)
    credit_limit = models.BigIntegerField(_("سقف اعتبار پیش‌فرض نسیه (تومان)"), default=50000000)
    description = models.TextField(_("توضیحات و مزایای سطح مشتری"), blank=True, null=True)
    created_at_jalali = models.CharField(_("تاریخ شمسی ایجاد"), max_length=30, default=get_current_jalali_datetime)

    class Meta:
        verbose_name = _("سطح کارت VIP مشتری")
        verbose_name_plural = _("سطوح کارت‌های VIP خریداران و مغازه‌داران")
        ordering = ['credit_limit']

    def __str__(self):
        return f"{self.name_fa} ({self.badge_title}) - تخفیف: {self.discount_rate}%"


class VisitorVipCardTier(models.Model):
    """
    سطوح کارت‌های VIP و درجات ارتقای شغلی ویزیتورها و سفیران فروش
    شامل درصد پورسانت ارتقایافته، تارگت فروش ماهانه و استایل سفیر.
    """
    code = models.CharField(_("کد یکتا سطح ویزیتور"), max_length=50, unique=True, db_index=True)
    name_fa = models.CharField(_("عنوان کارت و رتبه ویزیتور"), max_length=100)
    badge_title = models.CharField(_("عنوان نشان ویزیتوری"), max_length=50, default="AMBASSADOR VIP")
    theme_color = models.CharField(_("کد رنگ هگز سفیر"), max_length=30, default="#0284c7")
    card_gradient = models.CharField(_("کلاس گرادیانت سفیر"), max_length=200, default="from-slate-950 via-sky-950 to-slate-900")
    card_border = models.CharField(_("استایل بوردر کارت"), max_length=100, default="border-sky-400/70")
    badge_bg = models.CharField(_("رنگ پس‌زمینه نشان"), max_length=100, default="bg-sky-500/25")
    commission_bonus_rate = models.DecimalField(_("درصد پورسانت فروش (%)"), max_digits=5, decimal_places=2, default=3.00)
    monthly_target_amount = models.BigIntegerField(_("تارگت فروش ماهانه (تومان)"), default=300000000)
    description = models.TextField(_("مزایا و حقوق رتبه ویزیتور"), blank=True, null=True)
    created_at_jalali = models.CharField(_("تاریخ شمسی ایجاد"), max_length=30, default=get_current_jalali_datetime)

    class Meta:
        verbose_name = _("سطح کارت و رتبه ویزیتور")
        verbose_name_plural = _("سطوح کارت‌های VIP و درجات ویزیتورها")
        ordering = ['commission_bonus_rate']

    def __str__(self):
        return f"{self.name_fa} ({self.badge_title}) - پورسانت: {self.commission_bonus_rate}%"


class UserRoleChoices(models.TextChoices):
    CUSTOMER = 'customer', _('مشتری / مغازه‌دار')
    VISITOR = 'visitor', _('ویزیتور / سفیر فروش')
    ADMIN = 'admin', _('مدیر سیستم')


class VehicleTypeChoices(models.TextChoices):
    MOTORCYCLE = 'motorcycle', _('موتور سیکلت')
    CAR = 'car', _('سواری شخصی')
    VAN = 'van', _('وانت بار')
    TRUCK = 'truck', _('کامیونت / خاور')


class VisitorContractTemplate(models.Model):
    """
    مدل قالب قرارداد آنلاین همکاری ویزیتورها و سفیران فروش
    ذخیره‌شده در دیتابیس با امکان ویرایش، افزودن تبصره، نسخه دهی و تغییر وضعیت توسط مدیریت
    """
    title = models.CharField(_("عنوان قرارداد آنلاین"), max_length=200, default="قرارداد آنلاین همکاری و بازاریابی محصولات دخانی آذرخش")
    version = models.CharField(_("شماره نسخه قرارداد"), max_length=30, default="1.0")
    content_text = models.TextField(_("متن و مفاد کامل حقوقی قرارداد"), help_text=_("متن کامل حقوقی شامل شرایط پورسانت، تعهدات ویزیتور و قوانین شرکت"))
    terms_summary = models.TextField(_("خلاصه تعهدات و ضوابط پورسانت"), blank=True, null=True)
    is_active = models.BooleanField(_("نسخه فعال جهت نمایش و امضا"), default=True)
    created_at_jalali = models.CharField(_("تاریخ شمسی ایجاد"), max_length=30, default=get_current_jalali_datetime)
    updated_at_jalali = models.CharField(_("تاریخ شمسی آخرین ویرایش"), max_length=30, default=get_current_jalali_datetime)

    class Meta:
        verbose_name = _("قالب قرارداد آنلاین ویزیتور")
        verbose_name_plural = _("مدیریت قراردادهای آنلاین همکاری")
        ordering = ['-id']

    def __str__(self):
        status_str = "فعال" if self.is_active else "غیرفعال"
        return f"{self.title} (نسخه {self.version}) - [{status_str}]"


class RegularCustomer(models.Model):
    """
    مدل یکپارچه پروفایل مشتریان و ویزیتورها
    تفکیک فیلدهای کارت VIP مشتریان و ویزیتورها، مشخصات مغازه، اطلاعات ویزیتور، کیف پول و حساب دفتری
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='customer_profile',
        verbose_name=_("حساب کاربری")
    )
    role = models.CharField(
        _("نقش کاربر"),
        max_length=20,
        choices=UserRoleChoices.choices,
        default=UserRoleChoices.CUSTOMER
    )
    is_visitor = models.BooleanField(
        _("دسترسی ویزیتوری فعال"),
        default=False,
        help_text=_("در صورت فعال بودن، پنل ویزیتور، ثبت مغازه و کمیسیون در دسترس خواهد بود.")
    )
    
    # تفکیک کامل کارت‌های VIP مشتریان و ویزیتورها
    customer_vip_tier = models.ForeignKey(
        CustomerVipCardTier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='customer_profiles',
        verbose_name=_("کارت VIP اختصاصی مشتری/مغازه‌دار")
    )
    visitor_vip_tier = models.ForeignKey(
        VisitorVipCardTier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='visitor_profiles',
        verbose_name=_("کارت VIP و درجه اختصاصی ویزیتور")
    )

    # کیف پول و اعتبارات مالی (قابل شارژ مستقیم توسط مدیریت در دیتابیس)
    wallet_balance = models.BigIntegerField(_("موجودی کیف پول الکترونیکی (تومان)"), default=0)
    credit_limit = models.BigIntegerField(_("سقف اعتبار حساب دفتری / نسیه (تومان)"), default=0)
    total_purchases_amount = models.BigIntegerField(_("مجموع خرید‌های ثبت شده (تومان)"), default=0)

    # احراز هویت و وضعیت پروفایل
    is_profile_completed = models.BooleanField(_("مشخصات پروفایل تکمیل شده"), default=False)
    is_verified = models.BooleanField(_("احراز هویت تایید شده در انبار مرکزی"), default=False)

    # فیلدهای ویژه مشتریان عادی (مغازه‌داران)
    shop_name = models.CharField(_("نام فروشگاه / مغازه"), max_length=200, blank=True, null=True)
    business_license_number = models.CharField(_("شماره پروانه کسب / جواز"), max_length=50, blank=True, null=True)

    # فیلدهای ویژه ویزیتورها
    visitor_code = models.CharField(_("کد اختصاصی ویزیتور"), max_length=50, blank=True, null=True, unique=True)
    commission_rate = models.DecimalField(_("درصد پورسانت ویزیتور (%)"), max_digits=5, decimal_places=2, default=2.50)
    national_code = models.CharField(_("کد ملی ویزیتور"), max_length=10, blank=True, null=True)
    national_id_image = models.ImageField(_("تصویر کارت ملی ویزیتور"), upload_to='national_ids/', blank=True, null=True)
    vehicle_type = models.CharField(_("نوع وسیله نقلیه"), max_length=30, choices=VehicleTypeChoices.choices, default=VehicleTypeChoices.MOTORCYCLE)
    vehicle_plate = models.CharField(_("شماره پلاک وسیله نقلیه"), max_length=50, blank=True, null=True)
    is_vehicle_verified = models.BooleanField(_("تایید وسیله نقلیه"), default=False)
    
    # قرارداد آنلاین ویزیتوری (ذخیره‌شده و متصل به دیتابیس)
    accepted_contract = models.ForeignKey(
        'VisitorContractTemplate',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='signed_customers',
        verbose_name=_("نسخه قرارداد آنلاین امضا شده")
    )
    has_accepted_contract = models.BooleanField(_("تایید و امضای قرارداد آنلاین"), default=False)
    contract_accepted_at_jalali = models.CharField(_("تاریخ شمسی امضای قرارداد"), max_length=30, blank=True, null=True)
    contract_signature_text = models.CharField(_("امضای دیجیتال / نام تاییدکننده"), max_length=150, blank=True, null=True)

    # اطلاعات مکانی و تماس
    province = models.CharField(_("استان"), max_length=60, default="تهران")
    city = models.CharField(_("شهر"), max_length=60, default="تهران")
    address = models.TextField(_("آدرس دقیق محل تحویل بار / سکونت"), blank=True, null=True)

    # مشخصات حساب بانکی (واریز پورسانت یا عودت وجه)
    bank_name = models.CharField(_("نام بانک"), max_length=50, blank=True, null=True)
    account_holder_name = models.CharField(_("نام صاحب حساب (مطابق کارت ملی)"), max_length=150, blank=True, null=True)
    card_number = models.CharField(_("شماره کارت ۱۶ رقمی"), max_length=16, blank=True, null=True)
    shaba_number = models.CharField(_("شماره شبا (با IR)"), max_length=26, blank=True, null=True)

    created_at_jalali = models.CharField(_("تاریخ شمسی ثبت‌نام"), max_length=30, default=get_current_jalali_datetime)
    updated_at_jalali = models.CharField(_("تاریخ شمسی آخرین ویرایش"), max_length=30, default=get_current_jalali_datetime)

    class Meta:
        verbose_name = _("مشتری / ویزیتور")
        verbose_name_plural = _("مدیریت کاربران، مشتریان و ویزیتورها")
        ordering = ['-id']

    def __str__(self):
        name = self.shop_name or self.user.full_name or self.user.phone
        role_label = "ویزیتور" if self.is_visitor else "مشتری"
        tier = self.visitor_vip_tier if (self.role == UserRoleChoices.VISITOR or self.is_visitor) else self.customer_vip_tier
        tier_label = f"[{tier.name_fa}]" if tier else ""
        return f"{name} ({role_label}) {tier_label}"

    def update_profile_completion(self):
        """بررسی و تنظیم خودکار پرچم تکمیل مشخصات"""
        if self.role == UserRoleChoices.VISITOR or self.is_visitor:
            completed = bool(
                self.user.full_name and 
                self.national_code and 
                self.card_number and 
                self.shaba_number and 
                self.has_accepted_contract
            )
        else:
            completed = bool(
                self.user.full_name and 
                self.shop_name and 
                self.address and 
                self.city
            )
        self.is_profile_completed = completed
        return completed


class DepositSlipPurpose(models.TextChoices):
    CHARGE_WALLET = 'charge_wallet', _('شارژ کیف پول الکترونیکی')
    SETTLE_DEBT = 'settle_debt', _('تسویه بدهی حساب دفتری')
    ORDER_DEPOSIT = 'order_deposit', _('واریز مستقیم پیش‌فاکتور')


class DepositSlipStatus(models.TextChoices):
    PENDING = 'pending', _('در انتظار بررسی حسابداری')
    APPROVED = 'approved', _('تایید و اعمال به حساب')
    REJECTED = 'rejected', _('رد شده / عدم تطابق')


class WalletDepositReceipt(models.Model):
    """
    فیش‌های واریزی ارسالی توسط مشتریان و ویزیتورها جهت شارژ کیف پول یا تسویه حساب دفتری
    با تایید ادمین در پنل، مبلغ فیش به صورت خودکار به کیف پول یا مانده دفتری کاربر افزوده می‌شود.
    """
    customer = models.ForeignKey(
        RegularCustomer,
        on_delete=models.CASCADE,
        related_name='deposit_slips',
        verbose_name=_("کاربر واریزکننده")
    )
    purpose = models.CharField(
        _("هدف واریز"),
        max_length=30,
        choices=DepositSlipPurpose.choices,
        default=DepositSlipPurpose.CHARGE_WALLET
    )
    amount = models.BigIntegerField(_("مبلغ واریزی (تومان)"))
    tracking_number = models.CharField(_("شماره پیگیری / ارجاع فیش"), max_length=100, db_index=True)
    bank_origin = models.CharField(_("بانک مبدا"), max_length=50, default="بانک ملت")
    sender_card_last4 = models.CharField(_("۴ رقم آخر کارت واریزکننده"), max_length=4, blank=True, null=True)
    receipt_image = models.ImageField(_("تصویر فیش واریزی"), upload_to='deposit_slips/', blank=True, null=True)
    status = models.CharField(
        _("وضعیت فیش"),
        max_length=20,
        choices=DepositSlipStatus.choices,
        default=DepositSlipStatus.PENDING
    )
    rejection_reason = models.TextField(_("دلیل رد فیش"), blank=True, null=True)
    notes = models.TextField(_("توضیحات واریزکننده"), blank=True, null=True)
    reviewed_by = models.CharField(_("بررسی شده توسط"), max_length=100, blank=True, null=True)
    reviewed_at_jalali = models.CharField(_("تاریخ شمسی بررسی"), max_length=30, blank=True, null=True)
    deposit_date_jalali = models.CharField(_("تاریخ شمسی واریز"), max_length=30, default=get_current_jalali_date)
    created_at_jalali = models.CharField(_("تاریخ شمسی ثبت فیش"), max_length=30, default=get_current_jalali_datetime)

    class Meta:
        verbose_name = _("فیش واریزی بانکی و شارژ کیف پول")
        verbose_name_plural = _("فیش‌های واریزی و افزایش موجودی کیف پول")
        ordering = ['-id']

    def __str__(self):
        return f"فیش {self.tracking_number} - {self.amount:,} تومان ({self.customer}) [{self.get_status_display()}]"


class CustomerLedgerEntry(models.Model):
    """
    ریز تراکنش‌های حساب دفتری و نسیه (بدهکاری و بستانکاری) برای هر دو نقش مشتری و ویزیتور
    """
    customer = models.ForeignKey(
        RegularCustomer,
        on_delete=models.CASCADE,
        related_name='ledger_entries',
        verbose_name=_("طرف حساب دفتری")
    )
    ENTRY_TYPES = [
        ('debit_purchase', _('بدهکار - خرید کالا / صدور فاکتور نسیه')),
        ('credit_settlement', _('بستانکار - تسویه حساب و تایید فیش')),
        ('wallet_charge', _('شارژ کیف پول الکترونیکی')),
        ('wallet_withdraw', _('کسر از کیف پول جهت خرید سفارش')),
    ]
    entry_type = models.CharField(_("نوع سند دفتری"), max_length=30, choices=ENTRY_TYPES)
    amount = models.BigIntegerField(_("مبلغ سند (تومان)"))
    balance_after = models.BigIntegerField(_("مانده حساب پس از سند (تومان)"), default=0)
    description = models.CharField(_("شرح سند"), max_length=255)
    related_receipt = models.ForeignKey(
        WalletDepositReceipt,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_("فیش واریزی مرتبط")
    )
    created_at_jalali = models.CharField(_("تاریخ شمسی سند"), max_length=30, default=get_current_jalali_datetime)

    class Meta:
        verbose_name = _("سند حساب دفتری")
        verbose_name_plural = _("گردش حساب‌های دفتری و نسیه")
        ordering = ['-id']

    def __str__(self):
        return f"{self.customer} - {self.description} ({self.amount:,} تومان)"


class RetailShopCustomer(models.Model):
    """
    مغازه‌داران زیرمجموعه ویزیتور
    """
    visitor = models.ForeignKey(
        RegularCustomer,
        on_delete=models.CASCADE,
        related_name='retail_shops',
        verbose_name=_("ویزیتور معرف")
    )
    shop_name = models.CharField(_("نام مغازه"), max_length=200)
    owner_name = models.CharField(_("نام صاحب مغازه"), max_length=150)
    phone = models.CharField(_("تلفن تماس"), max_length=15)
    city = models.CharField(_("شهر"), max_length=60, default="تهران")
    address = models.TextField(_("آدرس دقیق مغازه"))
    license_no = models.CharField(_("شماره پروانه کسب"), max_length=50, blank=True, null=True)
    created_at_jalali = models.CharField(_("تاریخ شمسی ثبت"), max_length=30, default=get_current_jalali_date)

    class Meta:
        verbose_name = _("مغازه تحت پوشش ویزیتور")
        verbose_name_plural = _("باشگاه مغازه‌داران ویزیتورها")

    def __str__(self):
        return f"{self.shop_name} ({self.owner_name} - {self.city})"


class CustomerOrderRecord(models.Model):
    """
    سوابق سفارش‌ها و پیش‌فاکتورهای رسمی صادره
    """
    order_number = models.CharField(_("شماره پیگیری سفارش"), max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(
        RegularCustomer,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name=_("مشتری / ویزیتور ثبت‌کننده")
    )
    total_cartons = models.IntegerField(_("تعداد کل کارتن‌ها"), default=0)
    total_boxes = models.IntegerField(_("تعداد کل باکس‌ها"), default=0)
    subtotal = models.BigIntegerField(_("مبلغ ناخالص (تومان)"), default=0)
    discount_amount = models.BigIntegerField(_("مبلغ تخفیف (تومان)"), default=0)
    shipping_cost = models.BigIntegerField(_("هزینه باربری (تومان)"), default=0)
    final_total = models.BigIntegerField(_("مبلغ قابل پرداخت (تومان)"), default=0)
    payment_method = models.CharField(
        _("روش تسویه"),
        max_length=40,
        choices=[
            ('wallet_instant', _('پرداخت مستقیم از کیف پول')),
            ('bank_deposit_slip', _('واریز بانکی و ثبت فیش')),
            ('ledger_credit', _('حساب دفتری و نسیه اعتباری')),
            ('pos_terminal', _('کارتخوان انبار مرکزی')),
        ],
        default='bank_deposit_slip'
    )
    payment_status = models.CharField(_("وضعیت پرداخت"), max_length=50, default="پیش‌فاکتور رسمی")
    created_at_jalali = models.CharField(_("تاریخ و ساعت شمسی"), max_length=30, default=get_current_jalali_datetime)

    class Meta:
        verbose_name = _("سفارش و پیش‌فاکتور مشتری")
        verbose_name_plural = _("سوابق سفارش‌ها و پیش‌فاکتورها")
        ordering = ['-id']

    def __str__(self):
        return f"سفارش {self.order_number} - {self.customer} ({self.final_total:,} تومان)"
`;

  const adminCode = `"""
regular_customers/admin.py
پنل ادمین تفکیک‌شده و حرفه‌ای جنگو با پیش‌نمایش تصویر کارت ملی و فیش بانکی
اقدام‌های دسته‌ای (Action) برای شارژ کیف پول، تایید فیش‌ها و اختصاص کارت‌های VIP
همراه با نمایش کلیه تاریخ‌ها به فرمت شمسی (Jalali)
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
import jdatetime
from .models import (
    CustomerVipCardTier,
    VisitorVipCardTier,
    VisitorContractTemplate, 
    RegularCustomer, 
    WalletDepositReceipt, 
    CustomerLedgerEntry, 
    RetailShopCustomer, 
    CustomerOrderRecord
)

# جلوگیری از ثبت تکراری مدل‌ها در منوی ادمین
for model_cls in [VisitorContractTemplate, CustomerVipCardTier, VisitorVipCardTier, RegularCustomer]:
    if admin.site.is_registered(model_cls):
        admin.site.unregister(model_cls)


@admin.register(VisitorContractTemplate)
class VisitorContractTemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'version', 'is_active', 'is_active_badge', 'created_at_jalali', 'updated_at_jalali')
    list_filter = ('is_active', 'created_at_jalali')
    search_fields = ('title', 'version', 'content_text', 'terms_summary')
    list_editable = ('is_active',)

    fieldsets = (
        (_('اطلاعات نسخه قرارداد'), {
            'fields': ('title', 'version', 'is_active')
        }),
        (_('متن و مفاد کامل حقوقی قرارداد (قابل ویرایش)'), {
            'fields': ('content_text', 'terms_summary'),
            'description': _('متن کامل حقوقی قرارداد آنلاین ویزیتورها. هر گونه تغییر در این بخش فوراً در اپلیکیشن و وب‌سایت قابل مشاهده خواهد بود.')
        }),
        (_('تاریخچه ثبت'), {
            'fields': ('created_at_jalali', 'updated_at_jalali')
        })
    )
    readonly_fields = ('created_at_jalali', 'updated_at_jalali')

    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="background-color:#dcfce7; color:#15803d; padding:3px 10px; border-radius:6px; font-weight:bold;">🟢 نسخه فعال</span>')
        return format_html('<span style="background-color:#fee2e2; color:#b91c1c; padding:3px 10px; border-radius:6px;">🔴 غیرفعال</span>')
    is_active_badge.short_description = _("وضعیت انتشار")


@admin.register(CustomerVipCardTier)
class CustomerVipCardTierAdmin(admin.ModelAdmin):
    list_display = ('code', 'name_fa', 'badge_title', 'color_preview', 'discount_rate', 'credit_limit_display', 'created_at_jalali')
    search_fields = ('code', 'name_fa', 'badge_title')
    list_editable = ('discount_rate',)

    def color_preview(self, obj):
        return format_html(
            '<div style="display:flex; align-items:center; gap:8px;">'
            '<div style="width:20px; height:20px; border-radius:50%; background-color:{}; border:1px solid #ccc;"></div>'
            '<span style="font-family:monospace; font-weight:bold;">{}</span>'
            '</div>',
            obj.theme_color, obj.theme_color
        )
    color_preview.short_description = _("رنگ تم کارت خریدار")

    def credit_limit_display(self, obj):
        return f"{obj.credit_limit:,} تومان"
    credit_limit_display.short_description = _("سقف اعتبار پیش‌فرض")


@admin.register(VisitorVipCardTier)
class VisitorVipCardTierAdmin(admin.ModelAdmin):
    list_display = ('code', 'name_fa', 'badge_title', 'color_preview', 'commission_bonus_rate', 'monthly_target_display', 'created_at_jalali')
    search_fields = ('code', 'name_fa', 'badge_title')
    list_editable = ('commission_bonus_rate',)

    def color_preview(self, obj):
        return format_html(
            '<div style="display:flex; align-items:center; gap:8px;">'
            '<div style="width:20px; height:20px; border-radius:50%; background-color:{}; border:1px solid #ccc;"></div>'
            '<span style="font-family:monospace; font-weight:bold;">{}</span>'
            '</div>',
            obj.theme_color, obj.theme_color
        )
    color_preview.short_description = _("رنگ تم کارت سفیر")

    def monthly_target_display(self, obj):
        return f"{obj.monthly_target_amount:,} تومان"
    monthly_target_display.short_description = _("تارگت ماهانه")


@admin.register(RegularCustomer)
class RegularCustomerAdmin(admin.ModelAdmin):
    list_display = (
        'user_phone', 'full_name_display', 'role_badge', 'customer_vip_tier_badge', 'visitor_vip_tier_badge',
        'wallet_balance', 'credit_limit', 'is_profile_completed_badge',
        'is_verified_badge', 'national_id_preview', 'created_at_jalali_display'
    )
    list_filter = ('role', 'is_visitor', 'customer_vip_tier', 'visitor_vip_tier', 'is_verified', 'is_profile_completed')
    search_fields = ('user__phone', 'user__full_name', 'shop_name', 'visitor_code', 'national_code', 'card_number', 'shaba_number', 'province')
    list_editable = ('wallet_balance', 'credit_limit')
    actions = ['verify_selected_accounts', 'upgrade_customer_to_gold_vip', 'upgrade_visitor_to_diamond_ambassador']

    fieldsets = (
        (_('نقش و تنظیمات دسترسی'), {
            'fields': ('user', 'role', 'is_visitor', 'is_verified', 'is_profile_completed')
        }),
        (_('کیف پول و اعتبارات مالی (شارژ مستقیم دیتابیس)'), {
            'fields': ('wallet_balance', 'credit_limit', 'total_purchases_amount'),
            'description': _('مبلغ موجودی کیف پول و سقف اعتبار نسیه مستقیماً از این بخش قابل افزایش و ویرایش است.')
        }),
        (_('اطلاعات اختصاصی مغازه‌دار / مشتری (به همراه کارت VIP خریدار)'), {
            'fields': ('customer_vip_tier', 'shop_name', 'business_license_number'),
            'classes': ('collapse',),
            'description': _('فیلدهای مربوط به مشتریان و خریداران عمده به همراه کارت VIP اختصاصی باشگاه خریداران')
        }),
        (_('اطلاعات اختصاصی ویزیتور و بازاریاب (به همراه کارت VIP سفیر ویزیتوری)'), {
            'fields': (
                'visitor_vip_tier', 'visitor_code', 'commission_rate', 'national_code', 'national_id_image', 
                'national_id_image_preview_large', 'vehicle_type', 'vehicle_plate', 
                'is_vehicle_verified', 'has_accepted_contract', 'contract_accepted_at_jalali'
            ),
            'classes': ('collapse',),
            'description': _('فیلدهای هویتی، کارت VIP و درجه ویزیتور، وسیله نقلیه و قرارداد آنلاین همکاری')
        }),
        (_('مشخصات بانکی جهت واریز پورسانت و تسویه'), {
            'fields': ('bank_name', 'account_holder_name', 'card_number', 'shaba_number'),
            'description': _('شماره کارت ۱۶ رقمی و شماره شبا ۲۴ رقمی با پیشوند IR')
        }),
        (_('آدرس و موقعیت جغرافیایی'), {
            'fields': ('province', 'city', 'address')
        }),
        (_('تاریخ‌های ثبت سیستم (شمسی)'), {
            'fields': ('created_at_jalali_display', 'updated_at_jalali_display'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ('national_id_image_preview_large', 'created_at_jalali_display', 'updated_at_jalali_display')

    def created_at_jalali_display(self, obj):
        return getattr(obj, 'created_at_jalali', '-')
    created_at_jalali_display.short_description = _("تاریخ ثبت‌نام")

    def updated_at_jalali_display(self, obj):
        return getattr(obj, 'updated_at_jalali', '-')
    updated_at_jalali_display.short_description = _("تاریخ آخرین ویرایش")

    def user_phone(self, obj):
        return obj.user.phone
    user_phone.short_description = _("شماره موبایل")

    def full_name_display(self, obj):
        return obj.user.full_name or obj.shop_name or "کاربر سامانه"
    full_name_display.short_description = _("نام کاربر / مغازه")

    def role_badge(self, obj):
        if obj.role == 'visitor' or obj.is_visitor:
            return format_html('<span style="background-color:#2563eb; color:white; padding:3px 8px; border-radius:6px; font-weight:bold; font-size:11px;">ویزیتور</span>')
        return format_html('<span style="background-color:#059669; color:white; padding:3px 8px; border-radius:6px; font-weight:bold; font-size:11px;">مشتری / مغازه‌دار</span>')
    role_badge.short_description = _("نقش")

    def customer_vip_tier_badge(self, obj):
        if obj.customer_vip_tier:
            return format_html(
                '<span style="background-color:{}; color:white; padding:3px 8px; border-radius:6px; font-weight:bold; font-size:11px;">{}</span>',
                obj.customer_vip_tier.theme_color, obj.customer_vip_tier.name_fa
            )
        return format_html('<span style="color:#94a3b8;">کارت خریدار عادی</span>')
    customer_vip_tier_badge.short_description = _("کارت VIP مشتری")

    def visitor_vip_tier_badge(self, obj):
        if obj.visitor_vip_tier:
            return format_html(
                '<span style="background-color:{}; color:white; padding:3px 8px; border-radius:6px; font-weight:bold; font-size:11px;">{}</span>',
                obj.visitor_vip_tier.theme_color, obj.visitor_vip_tier.name_fa
            )
        return format_html('<span style="color:#94a3b8;">رتبه سفیر پایه</span>')
    visitor_vip_tier_badge.short_description = _("کارت VIP ویزیتور")

    def wallet_balance_display(self, obj):
        return format_html('<span style="font-family:monospace; font-weight:black; color:#059669;">{:,} تومان</span>', obj.wallet_balance)
    wallet_balance_display.short_description = _("موجودی کیف پول")

    def credit_limit_display(self, obj):
        return format_html('<span style="font-family:monospace; font-weight:bold; color:#2563eb;">{:,} تومان</span>', obj.credit_limit)
    credit_limit_display.short_description = _("سقف اعتبار نسیه")

    def is_profile_completed_badge(self, obj):
        if obj.is_profile_completed:
            return format_html('<span style="color:#059669; font-weight:bold;">✓ کامل</span>')
        return format_html('<span style="color:#d97706; font-weight:bold;">⚠️ ناقص</span>')
    is_profile_completed_badge.short_description = _("تکمیل پروفایل")

    def is_verified_badge(self, obj):
        if obj.is_verified:
            return format_html('<span style="background-color:#dcfce7; color:#15803d; padding:3px 8px; border-radius:6px; font-weight:bold;">تایید شده</span>')
        return format_html('<span style="background-color:#fef3c7; color:#b45309; padding:3px 8px; border-radius:6px;">در انتظار تایید</span>')
    is_verified_badge.short_description = _("احراز هویت")

    def national_id_preview(self, obj):
        if obj.national_id_image:
            return format_html('<img src="{}" style="width:40px; height:28px; border-radius:4px; object-fit:cover; border:1px solid #ddd;" />', obj.national_id_image.url)
        return format_html('<span style="color:#cbd5e1;">-</span>')
    national_id_preview.short_description = _("عکس کارت ملی")

    def national_id_image_preview_large(self, obj):
        if obj.national_id_image:
            return format_html('<a href="{}" target="_blank"><img src="{}" style="max-width:320px; max-height:200px; border-radius:12px; border:2px solid #3b82f6; box-shadow:0 4px 10px rgba(0,0,0,0.1);" /></a><p style="color:#64748b; font-size:11px; margin-top:4px;">برای مشاهده سایز اصلی روی تصویر کلیک فرمایید.</p>', obj.national_id_image.url, obj.national_id_image.url)
        return _("تصویر کارت ملی هنوز بارگذاری نشده است.")
    national_id_image_preview_large.short_description = _("پیش‌نمایش کارت ملی")

    # اکشن‌های ادمین
    @admin.action(description=_("تایید هویت حساب‌های انتخاب‌شده"))
    def verify_selected_accounts(self, request, queryset):
        queryset.update(is_verified=True)
        self.message_user(request, "حساب‌های کاربری انتخاب‌شده با موفقیت تایید هویت شدند.")

    @admin.action(description=_("ارتقا خریداران به کارت طلایی VIP"))
    def upgrade_customer_to_gold_vip(self, request, queryset):
        gold_tier = CustomerVipCardTier.objects.filter(code='gold').first()
        if gold_tier:
            queryset.update(customer_vip_tier=gold_tier)
            self.message_user(request, "کارت طلایی VIP خریدار به کاربران انتخاب‌شده اختصاص یافت.")

    @admin.action(description=_("ارتقا ویزیتورها به درجه مدیر ارشد الماس"))
    def upgrade_visitor_to_diamond_ambassador(self, request, queryset):
        diamond_tier = VisitorVipCardTier.objects.filter(code='visitor_diamond_ambassador').first()
        if diamond_tier:
            queryset.update(visitor_vip_tier=diamond_tier)
            self.message_user(request, "کارت و رتبه الماس ویزیتوری به سفیران انتخاب‌شده اختصاص یافت.")


@admin.register(WalletDepositReceipt)
class WalletDepositReceiptAdmin(admin.ModelAdmin):
    list_display = (
        'tracking_number', 'customer_link', 'purpose_badge', 'amount_display',
        'bank_origin', 'sender_card_last4', 'status', 'slip_preview_thumb', 'deposit_date_jalali'
    )
    list_filter = ('status', 'purpose', 'bank_origin', 'deposit_date_jalali')
    search_fields = ('tracking_number', 'customer__user__phone', 'customer__user__full_name', 'customer__shop_name', 'sender_card_last4')
    list_editable = ('status',)
    readonly_fields = ('slip_preview_large', 'created_at_jalali')
    actions = ['approve_and_credit_wallet', 'reject_slips']

    fieldsets = (
        (_('مشخصات فیش بانکی'), {
            'fields': ('customer', 'purpose', 'amount', 'tracking_number', 'bank_origin', 'sender_card_last4', 'deposit_date_jalali')
        }),
        (_('تصویر فیش واریزی ارسالی'), {
            'fields': ('receipt_image', 'slip_preview_large')
        }),
        (_('بررسی و تایید حسابداری'), {
            'fields': ('status', 'rejection_reason', 'notes', 'reviewed_by', 'reviewed_at_jalali', 'created_at_jalali')
        }),
    )

    def customer_link(self, obj):
        return f"{obj.customer.user.full_name or obj.customer.shop_name} ({obj.customer.user.phone})"
    customer_link.short_description = _("واریزکننده")

    def purpose_badge(self, obj):
        if obj.purpose == 'charge_wallet':
            return format_html('<span style="background-color:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; padding:3px 8px; border-radius:6px; font-weight:bold;">شارژ کیف پول</span>')
        elif obj.purpose == 'settle_debt':
            return format_html('<span style="background-color:#fffbeb; color:#92400e; border:1px solid #fde68a; padding:3px 8px; border-radius:6px; font-weight:bold;">تسویه حساب دفتری</span>')
        return format_html('<span style="background-color:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; padding:3px 8px; border-radius:6px;">سفارش مستقیم</span>')
    purpose_badge.short_description = _("هدف واریز")

    def amount_display(self, obj):
        return format_html('<span style="font-family:monospace; font-weight:black; color:#059669; font-size:13px;">{:,} تومان</span>', obj.amount)
    amount_display.short_description = _("مبلغ واریزی")

    def status_badge(self, obj):
        if obj.status == 'approved':
            return format_html('<span style="background-color:#10b981; color:white; padding:3px 8px; border-radius:6px; font-weight:bold;">تایید شد</span>')
        elif obj.status == 'rejected':
            return format_html('<span style="background-color:#ef4444; color:white; padding:3px 8px; border-radius:6px; font-weight:bold;">رد شده</span>')
        return format_html('<span style="background-color:#f59e0b; color:white; padding:3px 8px; border-radius:6px; font-weight:bold;">در انتظار تایید</span>')
    status_badge.short_description = _("وضعیت")

    def slip_preview_thumb(self, obj):
        if obj.receipt_image:
            return format_html('<img src="{}" style="width:45px; height:32px; border-radius:4px; object-fit:cover; border:1px solid #ddd;" />', obj.receipt_image.url)
        return format_html('<span style="color:#94a3b8;">بدون تصویر</span>')
    slip_preview_thumb.short_description = _("پیش‌نمایش فیش")

    def slip_preview_large(self, obj):
        if obj.receipt_image:
            return format_html('<a href="{}" target="_blank"><img src="{}" style="max-width:420px; max-height:280px; border-radius:12px; border:2px solid #10b981; box-shadow:0 4px 12px rgba(0,0,0,0.15);" /></a><p style="color:#64748b; font-size:11px; margin-top:4px;">جهت مشاهده تصویر در ابعاد کامل روی عکس کلیک نمایید.</p>', obj.receipt_image.url, obj.receipt_image.url)
        return _("تصویر فیش بارگذاری نشده است.")
    slip_preview_large.short_description = _("تصویر فیش بانکی")

    # اکشن تایید خودکار و افزایش موجودی کیف پول
    @admin.action(description=_("تایید فیش‌ها و اعمال مستقیم به کیف پول / حساب دفتری"))
    def approve_and_credit_wallet(self, request, queryset):
        now_jalali = jdatetime.datetime.now().strftime('%Y/%m/%d - %H:%M')
        for slip in queryset:
            if slip.status != 'approved':
                slip.status = 'approved'
                slip.reviewed_by = request.user.full_name or request.user.phone
                slip.reviewed_at_jalali = now_jalali
                slip.save()

                # افزایش کیف پول یا تسویه حساب دفتری
                customer = slip.customer
                if slip.purpose == 'charge_wallet':
                    customer.wallet_balance += slip.amount
                    customer.save()
                    CustomerLedgerEntry.objects.create(
                        customer=customer,
                        entry_type='wallet_charge',
                        amount=slip.amount,
                        balance_after=customer.wallet_balance,
                        description=f"شارژ کیف پول - تایید فیش پیگیری {slip.tracking_number}",
                        related_receipt=slip,
                        created_at_jalali=now_jalali
                    )
                elif slip.purpose == 'settle_debt':
                    CustomerLedgerEntry.objects.create(
                        customer=customer,
                        entry_type='credit_settlement',
                        amount=slip.amount,
                        balance_after=0,
                        description=f"تسویه حساب دفتری - فیش بانکی {slip.tracking_number}",
                        related_receipt=slip,
                        created_at_jalali=now_jalali
                    )
        self.message_user(request, "فیش‌های انتخاب‌شده تایید و مبالغ به صورت خودکار به حساب کاربران منظور گردید.")


@admin.register(CustomerLedgerEntry)
class CustomerLedgerEntryAdmin(admin.ModelAdmin):
    list_display = ('customer', 'entry_type', 'amount_display', 'balance_after_display', 'description', 'created_at_jalali')
    list_filter = ('entry_type', 'created_at_jalali')
    search_fields = ('customer__user__phone', 'customer__user__full_name', 'customer__shop_name', 'description')

    def amount_display(self, obj):
        return f"{obj.amount:,} تومان"
    amount_display.short_description = _("مبلغ سند")

    def balance_after_display(self, obj):
        return f"{obj.balance_after:,} تومان"
    balance_after_display.short_description = _("مانده حساب")


@admin.register(RetailShopCustomer)
class RetailShopCustomerAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'owner_name', 'phone', 'visitor', 'city', 'license_no', 'created_at_jalali')
    search_fields = ('shop_name', 'owner_name', 'phone', 'visitor__visitor_code')
    list_filter = ('city', 'created_at_jalali')


@admin.register(CustomerOrderRecord)
class CustomerOrderRecordAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer', 'total_cartons', 'final_total_display', 'payment_method', 'payment_status', 'created_at_jalali')
    search_fields = ('order_number', 'customer__user__phone', 'customer__user__full_name')
    list_filter = ('payment_method', 'payment_status', 'created_at_jalali')

    def final_total_display(self, obj):
        return f"{obj.final_total:,} تومان"
    final_total_display.short_description = _("مبلغ کل فاکتور")
`;

  const serializersCode = `"""
regular_customers/serializers.py
سریالایزرهای DRF برای تبدیل داده‌ها با فیلدهای تفکیک‌شده مشتری/ویزیتور، کیف پول، کارت VIP و فیش‌ها
"""

from rest_framework import serializers
from .models import (
    CustomerVipCardTier,
    VisitorVipCardTier,
    VisitorContractTemplate, 
    RegularCustomer, 
    WalletDepositReceipt, 
    CustomerLedgerEntry, 
    RetailShopCustomer, 
    CustomerOrderRecord
)


class VisitorContractTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorContractTemplate
        fields = [
            'id', 'title', 'version', 'content_text', 'terms_summary', 
            'is_active', 'created_at_jalali', 'updated_at_jalali'
        ]


class CustomerVipCardTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerVipCardTier
        fields = [
            'id', 'code', 'name_fa', 'badge_title', 'theme_color', 
            'card_gradient', 'card_border', 'badge_bg', 'discount_rate', 
            'credit_limit', 'description', 'created_at_jalali'
        ]


class VisitorVipCardTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorVipCardTier
        fields = [
            'id', 'code', 'name_fa', 'badge_title', 'theme_color', 
            'card_gradient', 'card_border', 'badge_bg', 'commission_bonus_rate', 
            'monthly_target_amount', 'description', 'created_at_jalali'
        ]


class WalletDepositReceiptSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    purpose_label = serializers.CharField(source='get_purpose_display', read_only=True)

    class Meta:
        model = WalletDepositReceipt
        fields = [
            'id', 'purpose', 'purpose_label', 'amount', 'tracking_number',
            'bank_origin', 'sender_card_last4', 'receipt_image', 'status',
            'status_label', 'rejection_reason', 'notes', 'reviewed_by',
            'reviewed_at_jalali', 'deposit_date_jalali', 'created_at_jalali'
        ]
        read_only_fields = ['id', 'status', 'status_label', 'rejection_reason', 'reviewed_by', 'reviewed_at_jalali', 'created_at_jalali']


class CustomerLedgerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerLedgerEntry
        fields = [
            'id', 'entry_type', 'amount', 'balance_after', 'description', 
            'related_receipt', 'created_at_jalali'
        ]


class RetailShopCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetailShopCustomer
        fields = ['id', 'visitor', 'shop_name', 'owner_name', 'phone', 'city', 'address', 'license_no', 'created_at_jalali']
        read_only_fields = ['id', 'visitor', 'created_at_jalali']


class CustomerOrderRecordSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.full_name', read_only=True)

    class Meta:
        model = CustomerOrderRecord
        fields = [
            'id', 'order_number', 'customer', 'customer_name', 'total_cartons',
            'total_boxes', 'subtotal', 'discount_amount', 'shipping_cost',
            'final_total', 'payment_method', 'payment_status', 'created_at_jalali'
        ]
        read_only_fields = ['id', 'created_at_jalali']


class RegularCustomerProfileSerializer(serializers.ModelSerializer):
    """
    سریالایزر پروفایل کامل کاربری با تفکیک کارت‌های VIP مشتری و ویزیتور و موجودی کیف پول
    """
    phone = serializers.CharField(source='user.phone', read_only=True)
    full_name = serializers.CharField(source='user.full_name', required=False)
    customer_vip_tier = CustomerVipCardTierSerializer(read_only=True)
    visitor_vip_tier = VisitorVipCardTierSerializer(read_only=True)
    accepted_contract = VisitorContractTemplateSerializer(read_only=True)
    deposit_slips = WalletDepositReceiptSerializer(many=True, read_only=True)
    retail_shops_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = RegularCustomer
        fields = [
            'id', 'phone', 'full_name', 'role', 'is_visitor', 'customer_vip_tier', 'visitor_vip_tier',
            'wallet_balance', 'credit_limit', 'is_profile_completed', 'is_verified',
            
            # فیلدهای مغازه‌دار / مشتری
            'shop_name', 'business_license_number',
            
            # فیلدهای ویزیتور و قرارداد آنلاین
            'visitor_code', 'commission_rate', 'national_code', 'national_id_image',
            'vehicle_type', 'vehicle_plate', 'is_vehicle_verified',
            'accepted_contract', 'has_accepted_contract', 'contract_accepted_at_jalali', 'contract_signature_text',
            
            # آدرس و بانک
            'province', 'city', 'address',
            'bank_name', 'account_holder_name', 'card_number', 'shaba_number',
            
            'retail_shops_count', 'deposit_slips', 'created_at_jalali', 'updated_at_jalali'
        ]
        read_only_fields = ['id', 'phone', 'is_verified', 'wallet_balance', 'credit_limit', 'created_at_jalali', 'updated_at_jalali']

    def get_retail_shops_count(self, obj):
        if obj.is_visitor:
            return obj.retail_shops.count()
        return 0
`;

  const viewsCode = `"""
regular_customers/views.py
کنترلرها و ویوهای صریح APIView جهت مدیریت کامل پروفایل، لیست کارت‌های VIP خریدار و ویزیتور، شارژ کیف پول، ثبت فیش واریزی و فاکتورها
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
import jdatetime

from .models import (
    CustomerVipCardTier,
    VisitorVipCardTier,
    VisitorContractTemplate, 
    RegularCustomer, 
    WalletDepositReceipt, 
    CustomerLedgerEntry, 
    RetailShopCustomer, 
    CustomerOrderRecord
)
from .serializers import (
    RegularCustomerProfileSerializer, 
    WalletDepositReceiptSerializer, 
    CustomerLedgerEntrySerializer, 
    RetailShopCustomerSerializer, 
    CustomerOrderRecordSerializer,
    CustomerVipCardTierSerializer,
    VisitorVipCardTierSerializer,
    VisitorContractTemplateSerializer
)


class ActiveVisitorContractAPIView(APIView):
    """
    دریافت قالب فعال قرارداد آنلاین ویزیتورها جهت مطالعه و امضای دیجیتال
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت متن قرارداد آنلاین فعال ویزیتورها",
        responses={200: VisitorContractTemplateSerializer}
    )
    def get(self, request):
        contract = VisitorContractTemplate.objects.filter(is_active=True).first()
        if not contract:
            return Response({'status': 'error', 'message': 'هیچ نسخه فعالی برای قرارداد آنلاین یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = VisitorContractTemplateSerializer(contract)
        return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)


class AcceptVisitorContractAPIView(APIView):
    """
    تایید و امضای آنلاین قرارداد توسط ویزیتور
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="تایید و امضای دیجیتال قرارداد آنلاین ویزیتور",
        responses={200: "قرارداد با موفقیت امضا گردید"}
    )
    def post(self, request):
        profile, _ = RegularCustomer.objects.get_or_create(user=request.user)
        active_contract = VisitorContractTemplate.objects.filter(is_active=True).first()
        signature_text = request.data.get('signature_text', request.user.full_name or request.user.phone)

        now_jalali = jdatetime.datetime.now().strftime("%Y/%m/%d %H:%M")
        profile.accepted_contract = active_contract
        profile.has_accepted_contract = True
        profile.contract_accepted_at_jalali = now_jalali
        profile.contract_signature_text = signature_text
        profile.update_profile_completion()
        profile.save()

        return Response({
            'status': 'success',
            'message': 'قرارداد آنلاین ویزیتوری با موفقیت امضا و در سیستم ثبت گردید.',
            'accepted_at_jalali': now_jalali
        }, status=status.HTTP_200_OK)


class VisitorContractManagementAdminAPIView(APIView):
    """
    مدیریت و ویرایش متون و نسخه جدید قراردادهای آنلاین (ویژه مدیران)
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="ویرایش و آپدیت متن قرارداد آنلاین از دیتابیس",
        responses={200: VisitorContractTemplateSerializer}
    )
    def post(self, request):
        title = request.data.get('title', 'قرارداد همکاری ویزیتوری آذرخش')
        version = request.data.get('version', '1.0')
        content_text = request.data.get('content_text', '')
        terms_summary = request.data.get('terms_summary', '')
        
        # غیرفعال کردن نسخه‌های قبلی در صورت درخواست انتشار نسخه جدید
        if request.data.get('is_active', True):
            VisitorContractTemplate.objects.filter(is_active=True).update(is_active=False)

        now_jalali = jdatetime.datetime.now().strftime("%Y/%m/%d %H:%M")
        contract = VisitorContractTemplate.objects.create(
            title=title,
            version=version,
            content_text=content_text,
            terms_summary=terms_summary,
            is_active=True,
            created_at_jalali=now_jalali,
            updated_at_jalali=now_jalali
        )
        serializer = VisitorContractTemplateSerializer(contract)
        return Response({'status': 'success', 'message': 'نسخه جدید قرارداد آنلاین با موفقیت در دیتابیس ثبت و فعال گردید.', 'data': serializer.data}, status=status.HTTP_201_CREATED)


class CustomerVipTiersListAPIView(APIView):
    """
    دریافت لیست تمام کارت‌های عضویت VIP خریداران و مغازه‌داران
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست کارت‌های VIP خریداران",
        responses={200: CustomerVipCardTierSerializer(many=True)}
    )
    def get(self, request):
        tiers = CustomerVipCardTier.objects.all().order_by('discount_rate')
        serializer = CustomerVipCardTierSerializer(tiers, many=True)
        return Response({'status': 'success', 'results': serializer.data}, status=status.HTTP_200_OK)


class VisitorVipTiersListAPIView(APIView):
    """
    دریافت لیست تمام سطح‌های رتبه و پورسانت ویزیتورها و سفیران فروش
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست سطوح و کارت‌های VIP ویزیتورها",
        responses={200: VisitorVipCardTierSerializer(many=True)}
    )
    def get(self, request):
        tiers = VisitorVipCardTier.objects.all().order_by('commission_bonus_rate')
        serializer = VisitorVipCardTierSerializer(tiers, many=True)
        return Response({'status': 'success', 'results': serializer.data}, status=status.HTTP_200_OK)


class CustomerProfileAPIView(APIView):
    """
    دریافت پروفایل کامل کاربر جاری شامل کارت‌های VIP مشتری و ویزیتور، موجودی کیف پول و مشخصات
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت اطلاعات پروفایل کاربر لاگین شده",
        responses={200: RegularCustomerProfileSerializer}
    )
    def get(self, request):
        profile, created = RegularCustomer.objects.get_or_create(user=request.user)
        serializer = RegularCustomerProfileSerializer(profile)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class CustomerProfileUpdateAPIView(APIView):
    """
    ویرایش مشخصات مشتری یا ویزیتور و بررسی خودکار تکمیل بودن پروفایل
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="بروزرسانی مشخصات پروفایل و مشخصات بانکی",
        request_body=RegularCustomerProfileSerializer
    )
    def put(self, request):
        profile, created = RegularCustomer.objects.get_or_create(user=request.user)
        
        # بروزرسانی نام در حساب کاربری
        if 'full_name' in request.data:
            request.user.full_name = request.data['full_name']
            request.user.save()

        serializer = RegularCustomerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            instance = serializer.save()
            instance.updated_at_jalali = jdatetime.datetime.now().strftime('%Y/%m/%d - %H:%M')
            instance.update_profile_completion()
            instance.save()

            return Response({
                'status': 'success',
                'message': 'مشخصات پروفایل با موفقیت بروزرسانی شد.',
                'data': RegularCustomerProfileSerializer(instance).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WalletChargeSlipAPIView(APIView):
    """
    ثبت فیش واریز بانکی جهت افزایش موجودی کیف پول یا تسویه بدهی دفتری
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="ثبت فیش واریزی بانکی و شارژ کیف پول",
        request_body=WalletDepositReceiptSerializer
    )
    def post(self, request):
        profile = get_object_or_404(RegularCustomer, user=request.user)
        serializer = WalletDepositReceiptSerializer(data=request.data)
        if serializer.is_valid():
            slip = serializer.save(customer=profile)
            return Response({
                'status': 'success',
                'message': 'فیش واریزی با موفقیت ثبت شد و در صف تایید حسابداری قرار گرفت.',
                'data': WalletDepositReceiptSerializer(slip).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WalletDepositSlipsListAPIView(APIView):
    """
    مشاهده لیست فیش‌های واریزی ارسال‌شده توسط کاربر
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(RegularCustomer, user=request.user)
        slips = profile.deposit_slips.all().order_by('-id')
        serializer = WalletDepositReceiptSerializer(slips, many=True)
        return Response({
            'status': 'success',
            'count': slips.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class CustomerLedgerAPIView(APIView):
    """
    دریافت ریز حساب دفتری و نسیه مشتری و ویزیتور
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(RegularCustomer, user=request.user)
        entries = profile.ledger_entries.all().order_by('-id')
        serializer = CustomerLedgerEntrySerializer(entries, many=True)
        return Response({
            'status': 'success',
            'wallet_balance': profile.wallet_balance,
            'credit_limit': profile.credit_limit,
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class PayOrderWithWalletAPIView(APIView):
    """
    تسویه فوری سفارش از موجودی کیف پول الکترونیکی
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = get_object_or_404(RegularCustomer, user=request.user)
        amount = int(request.data.get('amount', 0))
        order_number = request.data.get('order_id') or request.data.get('order_number')

        if amount <= 0 or not order_number:
            return Response({'status': 'error', 'message': 'مبلغ یا شناسه سفارش نامعتبر است.'}, status=status.HTTP_400_BAD_REQUEST)

        if profile.wallet_balance < amount:
            return Response({
                'status': 'error',
                'message': f'موجودی کیف پول شما ({profile.wallet_balance:,} تومان) کمتر از مبلغ فاکتور ({amount:,} تومان) است.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # کسر از کیف پول
        profile.wallet_balance -= amount
        profile.save()

        now_jalali = jdatetime.datetime.now().strftime('%Y/%m/%d - %H:%M')
        CustomerLedgerEntry.objects.create(
            customer=profile,
            entry_type='wallet_withdraw',
            amount=amount,
            balance_after=profile.wallet_balance,
            description=f"تسویه و کسر سفارش {order_number} از کیف پول",
            created_at_jalali=now_jalali
        )

        return Response({
            'status': 'success',
            'message': 'سفارش با موفقیت از محل کیف پول تسویه گردید.',
            'remaining_wallet_balance': profile.wallet_balance
        }, status=status.HTTP_200_OK)


class CustomerOrdersListAPIView(APIView):
    """
    دریافت سوابق سفارش‌های مشتریان و ویزیتورها
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(RegularCustomer, user=request.user)
        orders = profile.orders.all().order_by('-id')
        serializer = CustomerOrderRecordSerializer(orders, many=True)
        return Response({
            'status': 'success',
            'count': orders.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
regular_customers/urls.py
مسیرهای صریح APIView ماژول regular_customers برای مدیریت کارت‌های VIP، پروفایل، کیف پول، فیش‌ها و سفارشات
"""

from django.urls import path
from .views import (
    CustomerVipTiersListAPIView,
    VisitorVipTiersListAPIView,
    ActiveVisitorContractAPIView,
    AcceptVisitorContractAPIView,
    VisitorContractManagementAdminAPIView,
    CustomerProfileAPIView, 
    CustomerProfileUpdateAPIView, 
    WalletChargeSlipAPIView,
    WalletDepositSlipsListAPIView,
    CustomerLedgerAPIView,
    PayOrderWithWalletAPIView,
    CustomerOrdersListAPIView
)

app_name = 'regular_customers'

urlpatterns = [
    # کارت‌های VIP و رتبه‌بندی‌ها
    path('vip-tiers/customers/', CustomerVipTiersListAPIView.as_view(), name='customer-vip-tiers-list'),
    path('vip-tiers/visitors/', VisitorVipTiersListAPIView.as_view(), name='visitor-vip-tiers-list'),

    # قرارداد آنلاین ویزیتوری (ذخیره‌شده در دیتابیس با امکان ویرایش)
    path('contract/active/', ActiveVisitorContractAPIView.as_view(), name='contract-active'),
    path('contract/accept/', AcceptVisitorContractAPIView.as_view(), name='contract-accept'),
    path('contract/manage/', VisitorContractManagementAdminAPIView.as_view(), name='contract-manage'),

    # پروفایل و مشخصات کاربری
    path('profile/', CustomerProfileAPIView.as_view(), name='customer-profile'),
    path('profile/update/', CustomerProfileUpdateAPIView.as_view(), name='customer-profile-update'),
    
    # کیف پول و فیش‌های بانکی
    path('wallet/charge-slip/', WalletChargeSlipAPIView.as_view(), name='wallet-charge-slip'),
    path('wallet/slips/', WalletDepositSlipsListAPIView.as_view(), name='wallet-slips-list'),
    path('ledger/', CustomerLedgerAPIView.as_view(), name='customer-ledger'),
    
    # سفارشات و پرداخت از کیف پول
    path('orders/', CustomerOrdersListAPIView.as_view(), name='customer-orders-list'),
    path('orders/pay-with-wallet/', PayOrderWithWalletAPIView.as_view(), name='pay-order-with-wallet'),
]
`;

  const notesCode = `## 📌 راهنمای اتصال و استفاده از اپلیکیشن regular_customers در جنگو

### ۱. ویژگی‌های کلیدی افزوده شده به مدل:
* **تاریخ شمسی بررسی با دیت پیکر شمسی (Jalali Date Picker):** در بررسی فیش‌های واریزی و تعیین تاریخ‌های بازبینی حسابداری، فیلد \`reviewed_at_jalali\` با استفاده از ویجت دیت پیکر شمسی تعاملی در فرانت‌اند و ویجت \`django-jalali-date\` در ادمین جنگو قابل انتخاب و ویرایش مستقیم می‌باشد.
* **مدیریت قرارداد آنلاین در دیتابیس (\`VisitorContractTemplate\`):** متن و مفاد کامل قرارداد همکاری آنلاین ویزیتورها مستقیماً در دیتابیس ذخیره شده و از طریق ادمین جنگو و API کنترل مدیریت قابل ویرایش و نسخه دهی است. ویزیتورها می‌توانند آخرین نسخه فعال را مطالعه و به صورت دیجیتال امضا نمایند.
* **تفکیک کامل کارت‌های VIP مشتریان و ویزیتورها:** کارت‌های VIP خریداران و مغازه‌داران (\`CustomerVipCardTier\`) با فیلدهای درصد تخفیف خرید (\`discount_rate\`) و سقف اعتبار نسیه (\`credit_limit\`)، از کارت‌های VIP و رتبه‌های ویزیتوری (\`VisitorVipCardTier\`) با درصد پورسانت فروش (\`commission_bonus_rate\`) و تارگت ماهانه (\`monthly_target_amount\`) کاملاً تفکیک شده‌اند. در مدل \`RegularCustomer\` دو فیلد مجزای \`customer_vip_tier\` و \`visitor_vip_tier\` قرار گرفته است.
* **شارژ کیف پول و فیش‌های بانکی (\`WalletDepositReceipt\`):** مشتری و ویزیتور می‌توانند فیش‌های واریزی ارسال کنند. در پنل ادمین جنگو، پیش‌نمایش تصویر فیش و اکشن تایید خودکار قرار دارد که با تایید آن، مبلغ فوراً به کیف پول یا حساب دفتری واریز می‌شود.
* **تاریخ‌های کاملاً شمسی (Jalali):** تمام مدل‌ها از فرمت‌های تاریخ شمسی استفاده می‌کنند تا مستقیماً بدون نیاز به تبدیل‌های پیچیده در پنل ادمین و خروجی‌های فرانت‌اند قابل نمایش باشند.

---

### ۲. نحوه پرداخت از کیف پول در فرانت‌اند React:
\`\`\`typescript
const handlePayWithWallet = async (orderId: string, amount: number) => {
  const res = await fetch('http://localhost:8000/api/v1/regular-customers/orders/pay-with-wallet/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ order_id: orderId, amount: amount })
  });
  const data = await res.json();
  if (data.status === 'success') {
    alert('سفارش با موفقیت از کیف پول پرداخت شد!');
  }
};
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="regular_customers"
      title="مشتریان، ویزیتورها، کیف پول و کارت VIP (Regular Customers & Visitors)"
      titleEn="regular_customers / Unified Customer & Visitor App"
      badge="VIP Cards • Wallet Top-up • Ledger & Orders"
      description="ماژول یکپارچه مدیریت مشتریان و ویزیتورها با تفکیک مشخصات هویتی و خودرو، کارت‌های عضویت VIP رنگی، شارژ کیف پول و تایید فیش‌های واریزی در ادمین جنگو، حساب دفتری و سوابق سفارشات با تاریخ‌های کاملاً شمسی."
      icon={<Users className="w-6 h-6 text-blue-500" />}
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
