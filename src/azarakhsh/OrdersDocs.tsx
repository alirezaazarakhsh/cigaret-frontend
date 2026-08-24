import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';
import { DJANGO_APPS_DATA } from '../data/djangoCodebase';

export const OrdersDocs: React.FC = () => {
  const ordersData = DJANGO_APPS_DATA.orders || {
    models: '',
    admin: '',
    serializers: '',
    views: '',
    urls: '',
  };

  const erdTables: TableErdMeta[] = [
    {
      name: 'orders_orderinvoice',
      verboseName: 'پیش‌فاکتورهای رسمی و سفارشات',
      description: 'سفارشات عمده با صدور شماره پیش‌فاکتور متوالی، محاسبه مالیات و تخفیف، ثبت فیش و بارنامه',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'invoice_number', type: 'CharField(max_length=50)', isUnique: true, verbose: 'شماره پیش‌فاکتور رسمی', help: 'مثال: INV-1403-9419' },
        { name: 'customer_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'مشتری خریدار' },
        { name: 'visitor_id', type: 'ForeignKey(Visitor)', isFk: true, fkTarget: 'visitors_visitorprofile', verbose: 'ویزیتور معرف' },
        { name: 'total_cartons', type: 'PositiveIntegerField', verbose: 'مجموع کارتن‌ها' },
        { name: 'total_boxes', type: 'PositiveIntegerField', verbose: 'مجموع باکس‌ها' },
        { name: 'total_amount', type: 'DecimalField(max_digits=14)', verbose: 'مبلغ نهایی سفارش (تومان)' },
        { name: 'status', type: 'CharField(choices)', verbose: 'وضعیت (pending, confirmed, preparing, dispatched, delivered)' },
        { name: 'payment_receipt', type: 'ImageField', verbose: 'تصویر فیش واریز بانکی' },
        { name: 'shipping_carrier', type: 'CharField(max_length=100)', verbose: 'نام باربری / وانت' },
        { name: 'shipping_bill_number', type: 'CharField(max_length=60)', verbose: 'شماره بارنامه / بیجک' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت سفارش' },
      ]
    },
    {
      name: 'orders_orderitem',
      verboseName: 'اقلام ردیف‌های پیش‌فاکتور',
      description: 'ثبت جزئیات تک‌تک محصولات خریداری‌شده همراه با اسنپ‌شات قیمت لحظه خرید',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'order_id', type: 'ForeignKey', isFk: true, fkTarget: 'orders_orderinvoice', verbose: 'پیش‌فاکتور مربوطه' },
        { name: 'product_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_cigaretteproduct', verbose: 'محصول' },
        { name: 'unit', type: 'CharField(choices)', verbose: 'واحد (carton / box)' },
        { name: 'quantity', type: 'PositiveIntegerField', verbose: 'تعداد' },
        { name: 'unit_price', type: 'DecimalField(max_digits=14)', verbose: 'قیمت واحد در لحظه ثبت' },
        { name: 'total_price', type: 'DecimalField(max_digits=14)', verbose: 'جمع مبلغ ردیف' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/orders/',
      auth: 'IsAuthenticated',
      description: 'ثبت سفارش جدید و صدور پیش‌فاکتور رسمی همراه با اقلام سبد خرید',
      requestBody: JSON.stringify({
        items: [
          { product_id: 1, unit: "carton", quantity: 2 },
          { product_id: 4, unit: "box", quantity: 10 }
        ],
        shipping_province: "تهران",
        shipping_city: "تهران",
        shipping_address: "جنت‌آباد جنوبی، نبش کوچه شقایق",
        notes: "ارسال سریع با وانت بارنامه شوش"
      }, null, 2),
      responseBody: JSON.stringify({
        id: 1024,
        invoice_number: "INV-1403-1024",
        total_amount: 74800000,
        status: "pending",
        created_at: "2026-08-24T14:30:00Z"
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/orders/my-orders/',
      auth: 'IsAuthenticated',
      description: 'دریافت سوابق پیش‌فاکتورهای رسمی و سفارشات مغازه‌دار یا مشتری جاری'
    },
    {
      method: 'POST',
      path: '/api/v1/orders/{id}/upload-receipt/',
      auth: 'IsAuthenticated',
      description: 'آپلود تصویر فیش واریز حواله بانکی پایا / ساتنا برای تایید مالی انبار'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="orders"
      title="۸. اپلیکیشن سفارشات، پیش‌فاکتور رسمی و مالی"
      titleEn="orders / Proforma Invoice & Order App"
      badge="Atomic Transactions • Invoice Generator"
      description="سیستم سفارش‌گذاری هوشمند عمده‌فروشی با صدور خودکار شماره پیش‌فاکتورهای رسمی متوالی، اسنپ‌شات قیمت‌ها با Transaction امن دیتابیس، ثبت فیش واریزی و اتصال به ناوگان باربری شوش."
      icon={<ShoppingCart className="w-6 h-6" />}
      modelsCode={ordersData.models}
      adminCode={ordersData.admin}
      serializersCode={ordersData.serializers}
      viewsCode={ordersData.views}
      urlsCode={ordersData.urls}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
