from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _

# ==============================================================================
# 1. مدل سطوح و کارت‌های مشتریان (Customer Tier & Card Config)
# ==============================================================================
class CustomerTier(models.Model):
    TIER_CHOICES = [
        ('bronze', _('کارت برنزی - عادی')),
        ('silver', _('کارت نقره‌ای - استاندارد')),
        ('gold', _('کارت طلایی - VIP')),
        ('platinum', _('کارت پلاتینیوم - بنکداری')),
        ('diamond_black', _('کارت بلک دایموند - انحصاری دخانیات سرو')),
    ]

    tier_key = models.CharField(_('شناسه سطح کارت'), max_length=30, choices=TIER_CHOICES, unique=True)
    title_fa = models.CharField(_('عنوان فارسی کارت'), max_length=100)
    badge_label = models.CharField(_('متن نشان (بج)'), max_length=50)
    
    # تنظیمات استایل و رنگ کارت جهت نمایش یکسان در وب و اپ حضوری
    card_bg_gradient = models.CharField(_('کلاس گرادینت یا کد رنگ پس‌زمینه'), max_length=200, help_text="مثال: from-amber-500 to-amber-700")
    card_border_color = models.CharField(_('رنگ حاشیه کارت'), max_length=100, default="#d97706")
    card_text_color = models.CharField(_('رنگ متن روی کارت'), max_length=100, default="#ffffff")
    card_icon = models.CharField(_('آیکون کارت'), max_length=50, default="ShieldCheck")

    # مزایا و محدودیت‌های اعتباری پیش‌فرض
    default_credit_limit = models.BigIntegerField(_('سقف پیش‌فرض اعتبار دفتری (تومان)'), default=10000000)
    cashback_percent = models.DecimalField(_('درصد کش‌بک / پاداش خرید نقدی'), max_digits=5, decimal_places=2, default=0.0)
    discount_percent = models.DecimalField(_('درصد تخفیف دائمی روی فاکتور'), max_digits=5, decimal_places=2, default=0.0)
    perks_description = models.TextField(_('توضیحات و مزایای کارت'), blank=True)

    is_active = models.BooleanField(_('فعال بودن این سطح'), default=True)

    class Meta:
        verbose_name = _('سطح و تنظیمات کارت اعتباری')
        verbose_name_plural = _('سطوح کارت‌های اعتباری')

    def __str__(self):
        return f"{self.get_tier_key_display()} ({self.title_fa})"


# ==============================================================================
# 2. مدل پروفایل مشتری (Normal Customer & POS App Customer)
# ==============================================================================
class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile', null=True, blank=True)
    full_name = models.CharField(_('نام و نام خانوادگی / نام فروشگاه'), max_length=200)
    phone_number = models.CharField(_('شماره تلفن همراه'), max_length=15, unique=True, db_index=True)
    national_code = models.CharField(_('کد ملی / شناسه صنفی'), max_length=20, blank=True, null=True)
    city = models.CharField(_('شهر'), max_length=100, default='تهران')
    address = models.TextField(_('آدرس دقیق مغازه / محل تحویل'), blank=True)
    
    # انتساب کارت و رنگ از دیتابیس توسط مدیریت
    tier = models.ForeignKey(CustomerTier, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('سطح کارت اختصاص‌یافته'))
    
    # کنترل مستقیم سقف خرید و اعتبار دفتری توسط ادمین در دیتابیس
    credit_limit = models.BigIntegerField(
        _('سقف مجاز اعتبار خرید دفتری (تومان)'),
        default=50000000,
        help_text=_('حداکثر سقف بدهکاری مجاز مشتری که توسط مدیریت فروشگاه تعیین می‌شود')
    )
    
    # موجودی کیف پول و مانده حساب دفتری
    wallet_balance = models.BigIntegerField(_('موجودی کیف پول (تومان)'), default=0, validators=[MinValueValidator(0)])
    ledger_balance = models.BigIntegerField(
        _('مانده بدهی دفتری (تومان)'),
        default=0,
        help_text=_('عدد مثبت یعنی مشتری بدهکار است، عدد منفی یعنی بستانکار است')
    )

    # اتصال به اپ مشتریان حضوری (App Customer Connect)
    app_client_id = models.CharField(_('شناسه کلاینت اپ حضوری'), max_length=64, unique=True, blank=True, null=True)
    barcode_id = models.CharField(_('کد بارکد اختصاصی مشتری'), max_length=50, unique=True, blank=True, null=True)
    
    notes = models.TextField(_('یادداشت‌های محرمانه حسابداری و فروشگاه'), blank=True)
    is_active = models.BooleanField(_('وضعیت فعال بودن حساب'), default=True)
    created_at = models.DateTimeField(_('تاریخ عضویت'), auto_now_add=True)
    updated_at = models.DateTimeField(_('آخرین بروزرسانی'), auto_now=True)

    class Meta:
        verbose_name = _('پروفایل مشتری و خریدار')
        verbose_name_plural = _('مشتریان (عادی و اپ حضوری)')

    def __str__(self):
        tier_title = self.tier.title_fa if self.tier else "بدون سطح"
        return f"{self.full_name} ({self.phone_number}) - کارت: {tier_title}"

    @property
    def remaining_credit(self):
        """محاسبه باقیمانده سقف اعتبار قابل استفاده برای خریدهای بعدی"""
        current_debt = max(0, self.ledger_balance)
        return max(0, self.credit_limit - current_debt)

    @property
    def can_purchase_on_credit(self):
        """آیا مشتری مجاز به خرید نسیه دفتری است یا خیر"""
        return self.remaining_credit > 0


# ==============================================================================
# 3. مدل ثبت فیش بانکی (Manual Bank Deposit Slip Registration)
# ==============================================================================
class BankDepositSlip(models.Model):
    STATUS_CHOICES = [
        ('pending', _('در انتظار بررسی حسابداری')),
        ('approved', _('تایید شده و اعمال شد')),
        ('rejected', _('رد شده / نامعتبر')),
    ]

    PURPOSE_CHOICES = [
        ('wallet_charge', _('شارژ موجودی کیف پول')),
        ('ledger_settle', _('تسویه بدهی حساب دفتری (نسیه)')),
        ('order_payment', _('پرداخت مستقیم فاکتور سفارش')),
    ]

    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='deposit_slips', verbose_name=_('مشتری'))
    amount = models.BigIntegerField(_('مبلغ واریزی (تومان)'), validators=[MinValueValidator(1000)])
    tracking_number = models.CharField(_('شماره پیگیری / شماره ارجاع فیش'), max_length=100, db_index=True)
    
    bank_name = models.CharField(_('نام بانک مقصد'), max_length=100, default='بانک ملت / سامان (حساب پخش دخانیات سرو)')
    destination_card_number = models.CharField(_('شماره کارت یا شبای مقصد'), max_length=50, blank=True)
    sender_card_last4 = models.CharField(_('۴ رقم آخر کارت واریزکننده'), max_length=4, blank=True)
    sender_account_name = models.CharField(_('نام صاحب حساب واریزکننده'), max_length=150, blank=True)
    
    slip_image = models.ImageField(_('تصویر / اسکرین‌شات فیش بانکی'), upload_to='deposit_slips/%Y/%m/', null=True, blank=True)
    purpose = models.CharField(_('هدف از واریز'), max_length=30, choices=PURPOSE_CHOICES, default='wallet_charge')
    
    order_id = models.CharField(_('شناسه فاکتور (در صورت پرداخت فاکتور)'), max_length=50, blank=True, null=True)
    deposit_date = models.CharField(_('تاریخ و ساعت واریز ثبت شده روی فیش'), max_length=50, blank=True)
    
    status = models.CharField(_('وضعیت فیش'), max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_slips', verbose_name=_('بررسی‌کننده حسابداری'))
    review_notes = models.TextField(_('یادداشت حسابداری / علت رد'), blank=True)
    
    created_at = models.DateTimeField(_('زمان ثبت در سامانه'), auto_now_add=True)
    reviewed_at = models.DateTimeField(_('زمان بررسی و تایید'), null=True, blank=True)

    class Meta:
        verbose_name = _('فیش واریز بانکی')
        verbose_name_plural = _('فیش‌های واریز بانکی مشتریان')
        ordering = ['-created_at']

    def __str__(self):
        return f"فیش {self.tracking_number} - {self.customer.full_name} ({self.amount:,} تومان)"


# ==============================================================================
# 4. مدل لاگ تراکنش‌های کیف پول (Wallet Transactions)
# ==============================================================================
class WalletTransaction(models.Model):
    TYPE_CHOICES = [
        ('charge_slip', _('شارژ از طریق فیش بانکی تایید شده')),
        ('purchase_debit', _('کسر جهت خرید فاکتور کالا')),
        ('refund_credit', _('بازگشت وجه سفارش لغو شده')),
        ('admin_adjustment', _('تعدیل دستی توسط مدیریت / حسابداری')),
    ]

    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='wallet_transactions', verbose_name=_('مشتری'))
    amount = models.BigIntegerField(_('مبلغ تراکنش (تومان)'))
    balance_after = models.BigIntegerField(_('مانده موجودی کیف پول پس از تراکنش (تومان)'))
    transaction_type = models.CharField(_('نوع تراکنش'), max_length=30, choices=TYPE_CHOICES)
    reference_slip = models.ForeignKey(BankDepositSlip, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('فیش مرتبط'))
    reference_order_id = models.CharField(_('شماره فاکتور مرتبط'), max_length=50, blank=True, null=True)
    description = models.CharField(_('شرح تراکنش'), max_length=255)
    created_at = models.DateTimeField(_('تاریخ ثبت'), auto_now_add=True)

    class Meta:
        verbose_name = _('تراکنش کیف پول')
        verbose_name_plural = _('گردش حساب کیف پول مشتریان')
        ordering = ['-created_at']

    def __str__(self):
        return f"تراکنش {self.customer.full_name}: {self.amount:,} تومان ({self.get_transaction_type_display()})"
