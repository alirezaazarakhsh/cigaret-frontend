import { StaffPermission } from '../../../types';

export interface PermissionDefinition {
  key: StaffPermission;
  label: string;
  desc: string;
}

export const ALL_STAFF_PERMISSIONS: PermissionDefinition[] = [
  { key: 'manage_pos', label: 'فروش و صندوق', desc: 'ثبت فاکتور حضوری، اسکن بارکد و دریافت مبالغ' },
  { key: 'manage_inventory', label: 'مدیریت و انبارداری', desc: 'اصلاح موجودی کارتن/باکس، ثبت بار ورودی و کسری' },
  { key: 'quick_add_product', label: 'تعریف سریع کالا', desc: 'امکان تعریف کالای جدید از داخل صندوق و انبار' },
  { key: 'manage_ledger', label: 'حساب‌های دفتری و نسیه', desc: 'مدیریت مشتریان نسیه، ثبت بدهکاری و تسویه‌ها' },
  { key: 'view_reports', label: 'گزارشات و آمار فروش', desc: 'مشاهده گزارش‌های روزانه، ماهانه و سود فروش' },
  { key: 'monthly_comparison', label: 'تحلیل مقایسه‌ای ماه‌ها', desc: 'مشاهده چارت‌های تحلیلی و مقایسه دوره‌ای ماه‌ها' },
  { key: 'customer_app_connect', label: 'باشگاه مشتریان و اپلیکیشن', desc: 'مدیریت اتصال اپلیکیشن همراه و بارکد مشتریان' },
  { key: 'manage_staff', label: 'مدیریت پرسنل و دسترسی‌ها', desc: 'تعریف و تغییر سطح دسترسی مدیران انبار و پرسنل' },
  { key: 'send_sms', label: 'سامانه پیامکی کاوه‌نگار', desc: 'ارسال پیامک، تغییر الگوها و پایش گزارشات پیامکی' },
  { key: 'manage_tickets', label: 'پاسخگویی به تیکت‌ها', desc: 'مشاهده، پاسخ و پشتیبانی تیکت‌های مشتریان و همکاران' },
  { key: 'manage_notifications', label: 'اعلانات و نوتیفیکیشن‌ها', desc: 'مشاهده، ویرایش و ارسال اطلاعیه به کاربران سایت' },
  { key: 'manage_warehouse_messages', label: 'صندوق پیام‌های تماس سایت', desc: 'مشاهده، بررسی و مدیریت پیام‌های تماس ثبت‌شده کاربران سایت' },
  { key: 'manage_site_settings', label: 'تنظیمات عمومی سایت', desc: 'ویرایش اطلاعات تماس، اطلاعات فروشگاه و پاصفحه وب‌ایت' },
  { key: 'manage_sliders', label: 'اسلایدرها و بنرها', desc: 'افزودن، ویرایش و حذف اسلایدرهای صفحه اول و بنرهای تبلیغاتی' },
  { key: 'manage_footer_settings', label: 'تنظیمات فوتر سایت', desc: 'ویرایش متن، پیوندها، آدرس، نمادها و شبکه‌های اجتماعی پاصفحه' },
  { key: 'delete_receipts', label: 'ابطال و حذف فاکتورها', desc: 'دسترسی مدیریت جهت ابطال یا حذف فاکتورهای فروش' },
];
