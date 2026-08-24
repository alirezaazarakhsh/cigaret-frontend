import { ApiEndpointSpec } from '../types';

export const API_ENDPOINTS: ApiEndpointSpec[] = [
  {
    method: 'GET',
    path: '/api/v1/products',
    title: 'دریافت لیست محصولات و نرخ روز کارتن',
    description: 'دریافت لیست کامل برندها، بارکد، موجودی کارتن انبار، نرخ پاکت/باکس/کارتن و جدول تخفیف‌های پلکانی جهت همگام‌سازی با فروشگاه یا نرم‌افزار حسابداری شما.',
    sampleResponse: {
      status: 'success',
      timestamp: '2026-08-22T15:30:00Z',
      currency: 'IRR',
      currency_display: 'تومان',
      total_items: 12,
      data: [
        {
          id: 'marlboro-gold-ch',
          name_fa: 'مارلبرو گلد اصلی (سوئیس)',
          brand: 'Marlboro',
          barcode: '7610111245012',
          price_carton_toman: 91000000,
          price_box_toman: 1900000,
          price_pack_toman: 195000,
          stock_cartons: 85,
          moq_cartons: 1,
          tier_discounts: [
            { min_cartons: 3, discount_percent: 2 },
            { min_cartons: 5, discount_percent: 4 },
            { min_cartons: 10, discount_percent: 7 }
          ]
        },
        {
          id: 'winston-compact-blue',
          name_fa: 'وینستون کامپکت بلو',
          brand: 'Winston',
          barcode: '4033100112348',
          price_carton_toman: 44000000,
          stock_cartons: 210,
          moq_cartons: 2
        }
      ]
    }
  },
  {
    method: 'POST',
    path: '/api/v1/orders',
    title: 'ثبت سفارش عمده و صدور خودکار پیش‌فاکتور',
    description: 'ارسال آیتم‌های سفارشی توسط مشتری یا سیستم بیرونی، محاسبه خودکار تخفیف تیراژ و ایجاد رکورد رزرو بار در سیستم انبارداری.',
    sampleRequest: {
      customer_id: 'CUST-8842',
      customer_name: 'فروشگاه دخانیات برادران حسینی',
      phone: '09123456789',
      city: 'تهران',
      shipping_method: 'تحویل انبار مرکزی یا باربری وطن',
      items: [
        {
          product_id: 'marlboro-gold-ch',
          unit: 'carton',
          quantity: 5
        },
        {
          product_id: 'winston-compact-blue',
          unit: 'carton',
          quantity: 10
        }
      ]
    },
    sampleResponse: {
      status: 'created',
      order_id: 'ORD-2026-9941',
      created_at: '2026-08-22T15:30:12Z',
      subtotal_toman: 895000000,
      total_discount_toman: 44600000,
      payable_amount_toman: 850400000,
      cartons_count: 15,
      reserved_until: '2026-08-22T18:30:00Z',
      invoice_url: 'https://ais-pre.example.app/invoices/ORD-2026-9941.pdf',
      telegram_webhook_dispatched: true
    }
  },
  {
    method: 'GET',
    path: '/api/v1/stock/live-check',
    title: 'استعلام آنی موجودی انبار به تفکیک کارتن',
    description: 'بررسی سریع موجودی آماده ارسال در انبارهای تهران، بندرعباس و گمرک بازرگان پیش از ثبت نهایی.',
    sampleResponse: {
      status: 'success',
      warehouse: 'انبار مرکزی غرب تهران (شورآباد / جاده مخصوص)',
      total_stock_cartons: 980,
      last_updated: '2026-08-22T15:28:00Z',
      critical_low_stock: [
        { id: 'sobranie-cocktail', stock_cartons: 22, status: 'رو به اتمام' }
      ]
    }
  },
  {
    method: 'PUT',
    path: '/api/v1/sync/accounting',
    title: 'همگام‌سازی با سپیدار / هلو / پارمیس',
    description: 'وب‌هوک اتصال به سیستم‌های حسابداری تجاری جهت انتقال اسناد فروش، فاکتورهای رسمی و دریافت تغییرات قیمت از سرور مالی.',
    sampleRequest: {
      accounting_software: 'Sepidar System / Holoo Enterprise',
      sync_mode: 'two_way',
      webhook_callback_url: 'https://my-tobacco-accounting.ir/api/webhook/royal-smoke'
    },
    sampleResponse: {
      status: 'synced',
      message: 'پل ارتباطی نرم‌افزار حسابداری با موفقیت برقرار شد.',
      active_listeners: ['price_update', 'order_status_change', 'stock_alert']
    }
  }
];

export const API_GUIDE_TEXT = {
  summary: 'آیا برای این سایت می‌توان API ست کرد؟',
  answer: 'بله، ۱۰۰٪ و به راحت‌ترین شکل ممکن! پلتفرم‌های عمده‌فروشی دقیقاً نیازمند API هستند تا فرآیندهای مالی، انبارداری و فروش را بدون خطای انسانی خودکارسازی کنند.',
  useCases: [
    {
      title: '۱. اتصال به نرم‌افزارهای حسابداری و انبارداری',
      desc: 'اتصال خودکار به نرم‌افزارهای پرکاربرد بازار ایران مثل «سپیدار، هلو، شایگان سیستم، محک، پارمیس و راهکاران». به محض ثبت سفارش در سایت، سند حسابداری و حواله خروج از انبار در نرم‌افزار مالی شما ثبت می‌شود.'
    },
    {
      title: '۲. به‌روزرسانی لحظه‌ای قیمت‌ها بر اساس ارز',
      desc: 'از آنجا که قیمت کارتن سیگارهای وارداتی (مانند مارلبرو و هیتس) به نرخ درهم و دلار وابسته است، می‌توانید با یک وب‌سرویس ساده نرخ‌ها را با یک کلیک یا بر اساس فرمول سود، به‌روز کنید.'
    },
    {
      title: '۳. اتصال به ربات تلگرام و واتساپ و پیامک',
      desc: 'ارسال فوری فاکتور و اطلاع‌رسانی خرید کارتن به مشتریان بنکدار، ارسال پیامک کد رهگیری باربری (سامانه وطن/تیپاکس) با کاوه نگار یا ملی پیامک.'
    },
    {
      title: '۴. ساخت اپلیکیشن بازاریاب و ویزیتور میدانی',
      desc: 'ویزیتورهای شما در بازار دخانیات مولوی و تهرانپارس می‌توانند با اپلیکیشن اختصاصی متصل به همین API، موجودی انبار را زنده ببینند و سفارش ثبت کنند.'
    }
  ]
};
