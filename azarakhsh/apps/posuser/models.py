from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()


class PosStaff(models.Model):

    ROLE_CHOICES = (
        ('warehouse_manager', 'مدیر انبار و بنکداری'),
        ('cashier', 'صندوقدار فروشگاه'),
        ('accountant', 'حسابدار و بازرس مالی'),
        ('super_admin', 'مدیر ارشد سامانه'),
    )

    # اتصال به هسته اصلی کاربران
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pos_profile',
        verbose_name='کاربر'
    )

    # فیلد رمز عبور / پینکد اختصاصی (هش‌شده)
    password = models.CharField(
        max_length=128,
        blank=True,
        null=True,
        verbose_name='رمز عبور / پینکد (هش‌شده)'
    )

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES,
        default='cashier',
        verbose_name='نقش سازمانی پیشفرض'
    )

    role_title = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='عنوان فارسی سمت'
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name='وضعیت فعالیت'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='تاریخ ثبت'
    )

    # =========================================================
    # دسترسی‌های اختصاصی پنل (Permissions)
    # =========================================================

    perm_manage_pos = models.BooleanField(
        default=False,
        verbose_name='فروش و صندوق'
    )

    perm_manage_inventory = models.BooleanField(
        default=False,
        verbose_name='مدیریت و انبارداری'
    )

    perm_quick_add_product = models.BooleanField(
        default=False,
        verbose_name='تعریف سریع کالا'
    )

    perm_manage_ledger = models.BooleanField(
        default=False,
        verbose_name='حساب‌های دفتری و نسیه'
    )

    perm_view_reports = models.BooleanField(
        default=False,
        verbose_name='گزارشات و آمار فروش'
    )

    perm_monthly_comparison = models.BooleanField(
        default=False,
        verbose_name='تحلیل مقایسه‌ای ماه‌ها'
    )

    perm_customer_app_connect = models.BooleanField(
        default=False,
        verbose_name='باشگاه مشتریان و اپلیکیشن'
    )

    perm_manage_staff = models.BooleanField(
        default=False,
        verbose_name='مدیریت پرسنل و دسترسی‌ها'
    )

    perm_send_sms = models.BooleanField(
        default=False,
        verbose_name='سامانه پیامکی کاوهنگار'
    )

    perm_manage_tickets = models.BooleanField(
        default=False,
        verbose_name='پاسخگویی به تیکت‌ها'
    )

    perm_manage_notifications = models.BooleanField(
        default=False,
        verbose_name='اعلانات و نوتیفیکیشن‌ها'
    )

    perm_manage_warehouse_messages = models.BooleanField(
        default=False,
        verbose_name='صندوق پیام‌های تماس سایت'
    )

    perm_manage_site_settings = models.BooleanField(
        default=False,
        verbose_name='تنظیمات عمومی سایت'
    )

    perm_manage_sliders = models.BooleanField(
        default=False,
        verbose_name='اسلایدرها و بنرها'
    )

    perm_manage_footer_settings = models.BooleanField(
        default=False,
        verbose_name='تنظیمات فوتر سایت'
    )

    perm_delete_receipts = models.BooleanField(
        default=False,
        verbose_name='ابطال و حذف فاکتورها'
    )

    class Meta:
        verbose_name = 'پرسنل صندوق و انبار'
        verbose_name_plural = 'لیست پرسنل صندوق و انبار'

    # =========================================================
    # تغییر رمز عبور
    # =========================================================

    def set_password(self, raw_password):
        """
        تغییر رمز عبور PosStaff و User مرتبط.

        نکته مهم:
        این متد فقط User متصل به همین PosStaff را تغییر می‌دهد.
        """

        if not raw_password:
            return

        # هش رمز روی PosStaff
        self.password = make_password(raw_password)

        # تغییر رمز فقط روی User متعلق به همین PosStaff
        if self.user_id:
            user = self.user
            user.set_password(raw_password)
            user.save(update_fields=['password'])

    # =========================================================
    # Save
    # =========================================================

    def save(self, *args, **kwargs):
        """
        ذخیره PosStaff.

        مهم:
        save() دیگر User را به صورت خودکار تغییر نمی‌دهد.
        تغییر رمز فقط از طریق set_password() انجام می‌شود.
        """

        # اگر password خام به صورت مستقیم در مدل قرار داده شده باشد،
        # فقط همان مقدار را Hash می‌کنیم.
        #
        # نکته:
        # اینجا User را تغییر نمی‌دهیم.
        if self.password:
            is_hashed = (
                self.password.startswith('pbkdf2_')
                or self.password.startswith('argon2')
                or self.password.startswith('bcrypt')
                or self.password.startswith('scrypt')
            )

            if not is_hashed:
                self.password = make_password(self.password)

        super().save(*args, **kwargs)

    # =========================================================
    # نمایش در Admin / Shell
    # =========================================================

    def __str__(self):
        if self.user_id:
            name = (
                getattr(self.user, 'first_name', None)
                or getattr(self.user, 'full_name', None)
                or getattr(self.user, 'username', None)
                or getattr(self.user, 'phone', None)
                or str(self.user)
            )
        else:
            name = 'کاربر حذف‌شده'

        return f"{name} ({self.get_role_display()})"


# =============================================================
# حذف پروفایل PosStaff هنگام حذف User
# =============================================================

@receiver(pre_delete, sender=User)
def cleanup_pos_staff_on_user_delete(sender, instance, **kwargs):
    """
    قبل از حذف کاربر، پروفایل PosStaff مربوط به همان User
    نیز حذف می‌شود.
    """

    try:
        PosStaff.objects.filter(user=instance).delete()
    except Exception:
        pass