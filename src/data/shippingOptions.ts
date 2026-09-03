import { ShippingOption } from '../types';

export const DEFAULT_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'freight-vatan',
    title: 'باربری وطن / جهانگیر / پیام‌شمس (ارسال به سراسر کشور)',
    cost: 350000,
    description: 'تسمه‌کشی و لفاف‌پیچی ضد رطوبت، بیمه سلامت فیزیکی کارتن، تحویل در انبار باربری شهر مقصد (۲۴ الی ۴۸ ساعت).',
    estimatedDelivery: '۲۴ تا ۴۸ ساعت کاری',
  },
  {
    id: 'freight-express-tipax',
    title: 'تیپاکس و پیشتاز اکسپرس (تحویل درب مغازه / فروشگاه)',
    cost: 480000,
    description: 'مناسب برای سفارشات فوری، دارای کد رهگیری آنلاین لحظه‌ای و تحویل مستقیم درب آدرس فروشگاه.',
    estimatedDelivery: '۲۴ ساعت کاری',
  },
  {
    id: 'tehran-courier-pickup',
    title: 'پیک وانت / سواری اختصاصی (مخصوص تهران و کرج)',
    cost: 290000,
    description: 'تحویل فوری در همان روز از انبار مرکزی جنت‌آباد تا درب مغازه در کلیه مناطق تهران، ری و کرج.',
    estimatedDelivery: 'ارسال فوری در همان روز (۳ ساعته)',
  },
  {
    id: 'warehouse-self-pickup',
    title: 'تحویل حضوری درب انبار مرکزی دخانیات سرو (تهران - جنت‌آباد)',
    cost: 0,
    description: 'بدون هیچ‌گونه هزینه باربری؛ بارگیری مستقیم روی خودرو یا وانت خریدار با هماهنگی قبلی.',
    estimatedDelivery: 'تحویل فوری پس از تسویه فاکتور',
  },
  {
    id: 'custom-shipping-rate',
    title: 'هزینه توافقی / درج دستی توسط بنکدار و اپراتور',
    cost: 350000,
    description: 'امکان تعیین مبلغ دقیق کرایه باربری بر اساس تعداد کارتن و شهر مقصد توسط کاربر یا مدیر فروش.',
    estimatedDelivery: 'طبق توافق',
    isCustom: true,
  },
];

export const MOCK_BANK_ACCOUNT = {
  bankName: 'بانک ملت',
  accountHolder: 'علیرضا آذرخش (پخش عمده دخانیات دخانیات سرو)',
  cardNumber: '6104-3378-9012-3456',
  shabaNumber: 'IR680120000000001234567890',
  accountNumber: '4892019482',
  warehouseBranch: 'شعبه جنت‌آباد تهران',
};
