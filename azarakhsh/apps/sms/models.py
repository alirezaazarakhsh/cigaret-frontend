from django.db import models


PATTERN_SECTIONS = [
    ('otp', 'ارسال کد تایید ورود (OTP)'),
    ('welcome', 'خوشآمدگویی به کاربران پس از اولین لاگین'),
    ('logout', 'خروج کاربر از حساب کاربری'),
    ('app_download_link', 'ارسال لینک دانلود و نصب اپلیکیشن'),
    ('pos_receipt', 'صدور رسید خرید نقدی/کارتخوان حضوری'),
    ('pos_partial_payment', 'ثبت پرداخت علی‌الحساب/ثبت دریافتی جدید صندوق'),
    ('pos_refund_receipt', 'صدور رسید مرجوعی کالا و برگشت وجه صندوق'),
    ('pos_daily_report', 'ارسال گزارش فروش روزانه صندوق به مدیران'),
    ('order_registered', 'ثبت سفارش عمده و صدور پیش‌فاکتور'),
    ('order_shipped', 'تحویل سفارش به باربری و ارسال بار'),
    ('cheque_due_reminder', 'یادآوری سررسید چک صیادی مشتری'),
    ('debt_overdue_alert', 'هشدار تاخیر در تسویه بدهی دفتری (نسیه)'),
    ('account_blocked_alert', 'هشدار مسدود شدن حساب دفتری مشتری'),
]


class KavenegarSMSSetting(models.Model):
    name = models.CharField(max_length=100, verbose_name="نام سامانه")
    api_token = models.TextField(max_length=500, verbose_name="API Token")

    class Meta:
        verbose_name = "تنظیمات سامانه پیامکی کاوهنگار"
        verbose_name_plural = "تنظیمات سامانه پیامکی کاوهنگار"

    def __str__(self):
        return self.name


class SMSPattern(models.Model):
    sms_setting = models.ForeignKey(
        KavenegarSMSSetting,
        on_delete=models.CASCADE,
        related_name='patterns',
        verbose_name="سامانه مربوطه"
    )
    name_fa = models.CharField(
        max_length=100,
        choices=PATTERN_SECTIONS,
        verbose_name="بخش مربوطه (نام فارسی پترن)",
        help_text="انتخاب کنید این پترن برای کدام بخش از سامانه استفاده میشود."
    )
    pattern_code = models.CharField(
        max_length=100,
        verbose_name="کد پترن (نام انگلیسی)",
        help_text="میتوانید وارد سامانه کاوه نگار شده و در قسمت اعتبارسنجی، پترن خود را ایجاد کرده و سپس کد آن را اینجا وارد کنید."
    )

    class Meta:
        verbose_name = "پترن پیامک"
        verbose_name_plural = "پترنهای پیامک"
        unique_together = ('sms_setting', 'name_fa')

    def __str__(self):
        return f"{self.get_name_fa_display()} - {self.pattern_code}"


class SmsLog(models.Model):
    class DeliveryStatus(models.TextChoices):
        QUEUED = 'queued', 'در صف ارسال'
        SENT = 'sent', 'ارسال‌شده به مخابرات'
        DELIVERED = 'delivered', 'رسیده به گوشی مشتری'
        FAILED = 'failed', 'خطا در ارسال'

    recipient_phone = models.CharField(max_length=15, db_index=True, verbose_name="شماره گیرنده")
    pattern = models.ForeignKey(
        SMSPattern,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='logs',
        verbose_name="پترن مربوطه"
    )
    tokens_sent = models.JSONField(default=dict, verbose_name="توکن‌های ارسالی")
    kavenegar_message_id = models.CharField(max_length=40, blank=True, verbose_name="شناسه پیامک کاوه‌نگار")
    status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.QUEUED, verbose_name="وضعیت تحویل")
    cost_rial = models.PositiveIntegerField(default=0, verbose_name="هزینه پیامک (ریال)")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name="زمان ارسال")

    class Meta:
        verbose_name = "لاگ پیامک ارسالی"
        verbose_name_plural = "لاگ و تاریخچه پیامک‌ها"
        ordering = ['-created_at']

    def __str__(self):
        return f"پیامک به {self.recipient_phone} | {self.get_status_display()}"
