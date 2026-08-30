import React from 'react';
import { UserCheck } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';
import { DJANGO_APPS_DATA } from '../data/djangoCodebase';

export const AuthUsersDocs: React.FC = () => {
  const data = DJANGO_APPS_DATA.accounts || {
    models: '',
    admin: '',
    serializers: '',
    views: '',
    urls: '',
    description: ''
  };

  const erdTables: TableErdMeta[] = [
    {
      name: 'accounts_user',
      verboseName: 'جدول کاربران سفارشی (Custom User)',
      description: 'کاربران مغازه‌دار، ویزیتور و مدیران با لاگین بر پایه شماره موبایل ایرانی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'phone', type: 'CharField(max_length=11)', isUnique: true, verbose: 'شماره موبایل (USERNAME_FIELD)', help: 'مثال: 09120759419' },
        { name: 'full_name', type: 'CharField(max_length=150)', verbose: 'نام و نام خانوادگی' },
        { name: 'role', type: 'CharField(choices)', verbose: 'نقش (admin, visitor, customer)' },
        { name: 'national_id', type: 'CharField(max_length=10)', verbose: 'کد ملی' },
        { name: 'national_id_image', type: 'ImageField', verbose: 'تصویر کارت ملی' },
        { name: 'is_verified', type: 'BooleanField', verbose: 'تایید احراز هویت' },
        { name: 'province', type: 'CharField(max_length=60)', verbose: 'استان' },
        { name: 'city', type: 'CharField(max_length=60)', verbose: 'شهر' },
        { name: 'address', type: 'TextField', verbose: 'آدرس فروشگاه / منزل' },
        { name: 'is_active', type: 'BooleanField', verbose: 'حساب فعال' },
        { name: 'is_staff', type: 'BooleanField', verbose: 'دسترسی ادمین' },
        { name: 'date_joined', type: 'DateTimeField', verbose: 'تاریخ عضویت' },
      ]
    },
    {
      name: 'accounts_otpcode',
      verboseName: 'کدهای اعتبارسنجی پیامکی (OTP)',
      description: 'کدهای ۵ رقمی یکبار مصرف با انقضای ۲ دقیقه برای ورود سریع بدون رمز',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'phone', type: 'CharField(max_length=11)', verbose: 'شماره موبایل' },
        { name: 'code', type: 'CharField(max_length=6)', verbose: 'کد پیامک‌شده' },
        { name: 'is_used', type: 'BooleanField', verbose: 'استفاده شده' },
        { name: 'expires_at', type: 'DateTimeField', verbose: 'زمان انقضا' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'زمان ارسال' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/accounts/register/',
      auth: 'AllowAny',
      description: 'ثبت‌نام کاربر مغازه‌دار یا ویزیتور جدید و دریافت توکن JWT',
      requestBody: JSON.stringify({
        phone: "09120759419",
        password: "StrongPassword@123",
        full_name: "علیرضا آذرخش",
        province: "تهران",
        city: "تهران",
        address: "جنت‌آباد جنوبی، انبار مرکزی"
      }, null, 2),
      responseBody: JSON.stringify({
        refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: { id: 1, phone: "09120759419", full_name: "علیرضا آذرخش", role: "customer" }
      }, null, 2),
      curlExample: `curl -X POST http://localhost:8000/api/v1/accounts/register/ \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"09120759419","password":"StrongPassword@123","full_name":"علیرضا آذرخش"}'`
    },
    {
      method: 'POST',
      path: '/api/v1/accounts/pos-login/',
      auth: 'AllowAny',
      description: 'ورود پرسنل و مدیران به صندوق هوشمند POS سوین (صدور JWT و واکشی فوری پرمیژن‌های دسترسی)',
      requestBody: JSON.stringify({
        phone: "09120759419",
        password: "alirezazzz9419@S"
      }, null, 2),
      responseBody: JSON.stringify({
        status: "success",
        message: "ورود به صندوق با موفقیت انجام شد.",
        tokens: {
          access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        },
        user: {
          id: 1,
          fullName: "مهندس حسینی (مدیر ارشد و مالک)",
          phone: "09120759419",
          role: "super_admin",
          roleTitleFa: "مدیریت ارشد بنکداری",
          permissions: [
            "manage_pos",
            "manage_inventory",
            "quick_add_product",
            "manage_ledger",
            "view_reports",
            "monthly_comparison",
            "manage_staff",
            "customer_app_connect",
            "send_sms",
            "manage_tickets",
            "delete_receipts"
          ]
        }
      }, null, 2),
      curlExample: `curl -X POST http://localhost:8000/api/v1/accounts/pos-login/ \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"09120759419","password":"alirezazzz9419@S"}'`
    },
    {
      method: 'POST',
      path: '/api/v1/accounts/token/',
      auth: 'AllowAny',
      description: 'ورود با شماره موبایل و رمز عبور (صدور Access Token با انقضای ۳۰ دقیقه و Refresh Token با انقضای ۷ روز)',
      requestBody: JSON.stringify({
        phone: "09120759419",
        password: "StrongPassword@123"
      }, null, 2),
      responseBody: JSON.stringify({
        access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/accounts/logout/',
      auth: 'IsAuthenticated',
      description: 'خروج امن کاربر و اضافه کردن Refresh Token به لیست سیاه (Token Blacklist)',
      requestBody: JSON.stringify({
        refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }, null, 2),
      responseBody: JSON.stringify({
        detail: "خروج با موفقیت انجام شد و توکن در لیست سیاه قرار گرفت."
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/accounts/me/',
      auth: 'IsAuthenticated',
      description: 'دریافت مشخصات کامل پروفایل کاربر احراز هویت شده جاری'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="accounts"
      title="۵. اپلیکیشن کاربران، احراز هویت و JWT"
      titleEn="accounts / Custom User App"
      badge="Custom User • SimpleJWT • OTP"
      description="مدل کاربری سفارشی Custom User مبتنی بر شماره موبایل به جای نام کاربری، پشتیبانی از ثبت‌نام مغازه‌داران و ویزیتوران، سیستم ورود با رمز عبور و پیامک OTP، صدور توکن‌های JWT نیم‌ساعته و خروج امن با Blacklist."
      icon={<UserCheck className="w-6 h-6" />}
      modelsCode={data.models}
      adminCode={data.admin}
      serializersCode={data.serializers}
      viewsCode={data.views}
      urlsCode={data.urls}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
