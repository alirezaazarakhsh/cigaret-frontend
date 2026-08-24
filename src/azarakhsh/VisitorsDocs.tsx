import React from 'react';
import { Users } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';
import { DJANGO_APPS_DATA } from '../data/djangoCodebase';

export const VisitorsDocs: React.FC = () => {
  const visitorsData = DJANGO_APPS_DATA.visitors || {
    models: '',
    admin: '',
    serializers: '',
    views: '',
    urls: '',
  };

  const erdTables: TableErdMeta[] = [
    {
      name: 'visitors_visitorprofile',
      verboseName: 'پروفایل تخصصی ویزیتوران',
      description: 'کدهای بازاریابی ویزیتور، نرخ کمیسیون سود ۲.۵٪ و مجموع مبالغ فروش و دریافتی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'user_id', type: 'OneToOneField(User)', isFk: true, fkTarget: 'accounts_user', isUnique: true, verbose: 'حساب کاربری' },
        { name: 'visitor_code', type: 'CharField(max_length=50)', isUnique: true, verbose: 'کد اختصاصی ویزیتور', help: 'مثال: VISITOR-9419' },
        { name: 'commission_rate', type: 'DecimalField(max_digits=5, places=2)', verbose: 'درصد کمیسیون سود (پیش‌فرض ۲.۵٪)' },
        { name: 'total_sales_amount', type: 'DecimalField(max_digits=14)', verbose: 'مجموع فروش ثبت‌شده' },
        { name: 'total_commission_earned', type: 'DecimalField(max_digits=12)', verbose: 'مجموع پورسانت کسب‌شده' },
        { name: 'is_active', type: 'BooleanField', verbose: 'ویزیتور فعال' },
      ]
    },
    {
      name: 'visitors_retailshopcustomer',
      verboseName: 'باشگاه مشتریان مغازه‌داران و سوپرمارکت‌ها',
      description: 'واحدهای صنفی ثبت‌شده تحت شبکه ویزیتور مربوطه جهت دریافت پورسانت مستمر',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'visitor_id', type: 'ForeignKey', isFk: true, fkTarget: 'visitors_visitorprofile', verbose: 'ویزیتور معرف' },
        { name: 'shop_name', type: 'CharField(max_length=200)', verbose: 'نام مغازه / دکه / سوپرمارکت' },
        { name: 'owner_name', type: 'CharField(max_length=150)', verbose: 'نام صاحب مغازه' },
        { name: 'phone', type: 'CharField(max_length=15)', verbose: 'شماره تماس' },
        { name: 'city', type: 'CharField(max_length=60)', verbose: 'شهر' },
        { name: 'address', type: 'TextField', verbose: 'آدرس دقیق' },
        { name: 'total_purchases', type: 'DecimalField(max_digits=12)', verbose: 'مجموع خریدهای مغازه' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/visitors/dashboard/',
      auth: 'IsVisitor',
      description: 'دریافت داشبورد آماری ویزیتور: مجموع فروش، کمیسیون ۲.۵٪، تعداد مغازه‌ها و وضعیت تسویه‌ها',
      responseBody: JSON.stringify({
        visitor_code: "VISITOR-9419",
        commission_rate: 2.50,
        total_sales: 1420000000,
        total_commission_earned: 35500000,
        shops_count: 38,
        active_orders_count: 12
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/visitors/retail-shops/',
      auth: 'IsVisitor',
      description: 'فهرست مغازه‌داران عضو باشگاه مشتریان ویزیتور جاری با سوابق خرید'
    },
    {
      method: 'POST',
      path: '/api/v1/visitors/retail-shops/',
      auth: 'IsVisitor',
      description: 'ثبت مغازه جدید توسط ویزیتور در باشگاه مشتریان با مشخصات پروانه کسب'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="visitors"
      title="۱۲. اپلیکیشن ویزیتوران و باشگاه مشتریان مغازه‌داران"
      titleEn="visitors / Commission & Retail Club App"
      badge="2.5% Commission • Retail CRM"
      description="مدیریت کدهای ویزیتوری اختصاصی، ثبت واحدهای صنفی و سوپرمارکت‌ها در باشگاه مشتریان، محاسبه خودکار ۲.۵٪ سود کمیسیون از تمام فاکتورهای صادره و صدور گزارشات واریز پورسانت."
      icon={<Users className="w-6 h-6" />}
      modelsCode={visitorsData.models}
      adminCode={visitorsData.admin}
      serializersCode={visitorsData.serializers}
      viewsCode={visitorsData.views}
      urlsCode={visitorsData.urls}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
