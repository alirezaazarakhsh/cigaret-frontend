from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import make_password

class PosStaff(models.Model):
    ROLE_CHOICES = (
        ('warehouse_manager', 'مدیر انبار و بنکداری'),
        ('cashier', 'صندوق‌دار فروشگاه'),
        ('accountant', 'حسابدار و بازرس مالی'),
        ('super_admin', 'مدیر ارشد سامانه'),
    )
    
    # اتصال به هسته اصلی کاربران
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pos_profile', verbose_name='کاربر')
    
    # فیلد رمز عبور / پین‌کد اختصاصی (هش‌شده)
    password = models.CharField(max_length=128, blank=True, null=True, verbose_name='رمز عبور / پین‌کد (هش‌شده)')
    
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='cashier', verbose_name='نقش سازمانی پیش‌فرض')
    role_title = models.CharField(max_length=100, blank=True, null=True, verbose_name='عنوان فارسی سمت')
    is_active = models.BooleanField(default=True, verbose_name='وضعیت فعالیت')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ثبت')

    # دسترسی‌های اختصاصی پنل (Permissions)
    perm_manage_pos = models.BooleanField(default=False, verbose_name='فروش و صندوق')
    perm_manage_inventory = models.BooleanField(default=False, verbose_name='مدیریت و انبارداری')
    perm_quick_add_product = models.BooleanField(default=False, verbose_name='تعریف سریع کالا')
    perm_manage_ledger = models.BooleanField(default=False, verbose_name='حساب‌های دفتری و نسیه')
    perm_view_reports = models.BooleanField(default=False, verbose_name='گزارشات و آمار فروش')
    perm_monthly_comparison = models.BooleanField(default=False, verbose_name='تحلیل مقایسه‌ای ماه‌ها')
    perm_customer_app_connect = models.BooleanField(default=False, verbose_name='باشگاه مشتریان و اپلیکیشن')
    perm_manage_staff = models.BooleanField(default=False, verbose_name='مدیریت پرسنل و دسترسی‌ها')
    perm_send_sms = models.BooleanField(default=False, verbose_name='سامانه پیامکی کاوه‌نگار')
    perm_manage_tickets = models.BooleanField(default=False, verbose_name='پاسخگویی به تیکت‌ها')
    perm_manage_notifications = models.BooleanField(default=False, verbose_name='اعلانات و نوتیفیکیشن‌ها')
    perm_manage_warehouse_messages = models.BooleanField(default=False, verbose_name='صندوق پیام‌های تماس سایت')
    perm_manage_site_settings = models.BooleanField(default=False, verbose_name='تنظیمات عمومی سایت')
    perm_manage_sliders = models.BooleanField(default=False, verbose_name='اسلایدرها و بنرها')
    perm_manage_footer_settings = models.BooleanField(default=False, verbose_name='تنظیمات فوتر سایت')
    perm_delete_receipts = models.BooleanField(default=False, verbose_name='ابطال و حذف فاکتورها')

    class Meta:
        verbose_name = 'پرسنل صندوق و انبار'
        verbose_name_plural = 'لیست پرسنل صندوق و انبار'

    def save(self, *args, **kwargs):
        # اگر رمز عبور وارد شده و هنوز هش نشده باشد
        if self.password and not (self.password.startswith('pbkdf2_') or self.password.startswith('argon2')):
            raw_password = self.password
            self.password = make_password(raw_password)
            # همگام‌سازی رمز عبور با کاربر اصلی (User)
            if self.user_id:
                self.user.set_password(raw_password)
                self.user.save()
        super().save(*args, **kwargs)

    def __str__(self):
        name = getattr(self.user, 'first_name', None) or getattr(self.user, 'full_name', None) or getattr(self.user, 'username', str(self.user))
        return f"{name} ({self.get_role_display()})"
