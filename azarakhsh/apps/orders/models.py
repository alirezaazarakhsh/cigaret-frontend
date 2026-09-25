"""
orders/models.py
مدل‌های پیش‌فاکتور رسمی، آیتم‌های سفارش کارتن و باکس، فیش‌های واریزی بانکی و بارنامه
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from catalog.models import CigaretteProduct
import random


class Order(models.Model):
    STATUS_CHOICES = (
        ('proforma_issued', _('پیش‌فاکتور صادر شده (در انتظار واریز)')),
        ('receipt_uploaded', _('فیش واریزی ارسال شده (در حال بررسی حسابداری)')),
        ('payment_verified', _('پرداخت تأیید شد (ارجاع به انبار جنت‌آباد)')),
        ('warehouse_packing', _('در حال بسته‌بندی و پلمپ در انبار')),
        ('dispatched', _('تحویل باربری / ناوگان اختصاصی شد')),
        ('delivered', _('تحویل نهایی به خریدار شد')),
        ('cancelled', _('لغو شده')),
    )

    SHIPPING_CHOICES = (
        ('tehran_express', _('وانت بار اختصاصی تهران و کرج (تحویل ۳ ساعته)')),
        ('freight_vatan', _('باربری وطن (تحویل ۲۴ تا ۴۸ ساعته شهرستان)')),
        ('freight_pishpaz', _('باربری پیشتاز / جهانگیر (پلمپ ضدضربه)')),
        ('warehouse_pickup', _('تحویل حضوری در انبار مرکزی جنت‌آباد')),
    )

    tracking_code = models.CharField(_("کد رهگیری رسمی SVN"), max_length=30, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="orders",
        verbose_name=_("کاربر خریدار")
    )
    
    # مشخصات تحویل‌گیرنده
    customer_name = models.CharField(_("نام خریدار / بنکدار"), max_length=150)
    customer_phone = models.CharField(_("شماره تماس خریدار"), max_length=15)
    business_name = models.CharField(_("نام بنکداری / فروشگاه"), max_length=200, blank=True)
    
    # آدرس تخلیه بار
    province = models.CharField(_("استان مقصد"), max_length=60)
    city = models.CharField(_("شهر مقصد"), max_length=60)
    destination_address = models.TextField(_("آدرس دقیق محل تحویل بار"))
    
    # ترابری و باربری
    shipping_method = models.CharField(_("روش ارسال"), max_length=50, choices=SHIPPING_CHOICES, default='tehran_express')
    shipping_cost = models.BigIntegerField(_("هزینه باربری (تومان)"), default=0)
    freight_waybill_number = models.CharField(_("شماره بیجک / بارنامه"), max_length=50, blank=True, null=True)
    
    # مبالغ و وضعیت
    total_amount = models.BigIntegerField(_("جمع کل بدون تخفیف (تومان)"))
    discount_amount = models.BigIntegerField(_("مجموع تخفیف تیراژ (تومان)"), default=0)
    final_payable = models.BigIntegerField(_("مبلغ نهایی قابل پرداخت (تومان)"))
    status = models.CharField(_("وضعیت سفارش"), max_length=30, choices=STATUS_CHOICES, default='proforma_issued')
    
    # یادداشت‌ها و زمان‌ها
    admin_notes = models.TextField(_("یادداشت داخلی انبار و حسابداری"), blank=True)
    created_at = models.DateTimeField(_("زمان صدور پیش‌فاکتور"), auto_now_add=True)
    updated_at = models.DateTimeField(_("آخرین تغییر وضعیت"), auto_now=True)

    class Meta:
        verbose_name = _("پیش‌فاکتور و سفارش عمده")
        verbose_name_plural = _("سفارشات و پیش‌فاکتورهای رسمی")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tracking_code} - {self.customer_name} ({self.final_payable:,} تومان)"

    @classmethod
    def generate_tracking_code(cls):
        code = f"SVN-{random.randint(100000, 999999)}"
        while cls.objects.filter(tracking_code=code).exists():
            code = f"SVN-{random.randint(100000, 999999)}"
        return code


class OrderItem(models.Model):
    UNIT_CHOICES = (
        ('carton', _('کارتن پلمپ ۵۰ باکسی')),
        ('box', _('باکس تک ۱۰ پاکتی')),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items", verbose_name=_("سفارش"))
    product = models.ForeignKey(CigaretteProduct, on_delete=models.PROTECT, verbose_name=_("محصول دخانیات"))
    unit = models.CharField(_("واحد سفارش"), max_length=20, choices=UNIT_CHOICES, default='carton')
    quantity = models.PositiveIntegerField(_("تعداد"), default=1)
    unit_price = models.BigIntegerField(_("قیمت واحد (تومان)"))
    discount_percent = models.DecimalField(_("درصد تخفیف اعمال شده"), max_digits=5, decimal_places=2, default=0.0)
    total_price = models.BigIntegerField(_("مبلغ نهایی ردیف (تومان)"))

    class Meta:
        verbose_name = _("ردیف سفارش")
        verbose_name_plural = _("اقلام پیش‌فاکتور")

    def __str__(self):
        return f"{self.product.name_fa} ({self.quantity} {self.get_unit_display()})"


class PaymentReceipt(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="receipts", verbose_name=_("سفارش"))
    bank_name = models.CharField(_("بانک واریزی"), max_length=60, default="بانک ملی")
    tracking_number = models.CharField(_("شماره پیگیری / ارجاع بانکی"), max_length=60)
    card_last_digits = models.CharField(_("۴ رقم آخر کارت واریزکننده"), max_length=4, blank=True)
    amount = models.BigIntegerField(_("مبلغ واریزی (تومان)"))
    receipt_image = models.ImageField(_("تصویر فیش واریز"), upload_to="receipts/%Y/%m/")
    is_verified = models.BooleanField(_("تأیید شده توسط حسابداری"), default=False)
    created_at = models.DateTimeField(_("زمان ثبت فیش"), auto_now_add=True)

    class Meta:
        verbose_name = _("فیش واریزی بانکی")
        verbose_name_plural = _("فیش‌های واریزی سفارشات")
