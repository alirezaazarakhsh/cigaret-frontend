"""
pos/models.py
مدل‌های صندوق فروشگاه حضوری، پایانه‌های فروشگاهی POS، نوبت‌های صندوق‌داری و اقلام فاکتور
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from catalog.models import CigaretteProduct


class PosRegister(models.Model):
    class RegisterStatus(models.TextChoices):
        ACTIVE = 'active', _('فعال و آماده صدور فاکتور')
        INACTIVE = 'inactive', _('غیرفعال')
        MAINTENANCE = 'maintenance', _('در حال تعمیر و پشتیبانی')

    name = models.CharField(_("نام صندوق / باجه"), max_length=100)
    terminal_code = models.CharField(_("کد ترمینال POS"), max_length=50, unique=True)
    ip_address = models.GenericIPAddressField(_("آدرس IP چاپگر حرارتی / سیستم"), blank=True, null=True)
    status = models.CharField(_("وضعیت پایانه"), max_length=20, choices=RegisterStatus.choices, default=RegisterStatus.ACTIVE)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)

    class Meta:
        verbose_name = _("پایانه صندوق")
        verbose_name_plural = _("۱. پایانه‌ها و صندوق‌های فروشگاه حضوری")

    def __str__(self):
        return f"{self.name} (کد: {self.terminal_code})"


class PosShift(models.Model):
    class ShiftStatus(models.TextChoices):
        OPEN = 'open', _('شیفت باز (در حال فروش)')
        CLOSED = 'closed', _('شیفت بسته شده و تسویه‌شده')

    cashier = models.ForeignKey(User, on_delete=models.PROTECT, related_name='pos_shifts', verbose_name=_("صندوق‌دار"))
    register = models.ForeignKey(PosRegister, on_delete=models.PROTECT, related_name='shifts', verbose_name=_("صندوق"))
    opening_cash = models.BigIntegerField(_("موجودی اولیه صندوق (تومان)"), default=0)
    closing_cash = models.BigIntegerField(_("موجودی نقدی نهایی صندوق (تومان)"), null=True, blank=True)
    expected_cash = models.BigIntegerField(_("موجودی نقدی سیستم (تومان)"), null=True, blank=True)
    cash_discrepancy = models.BigIntegerField(_("کسری / مازاد صندوق (تومان)"), default=0)
    status = models.CharField(_("وضعیت شیفت"), max_length=20, choices=ShiftStatus.choices, default=ShiftStatus.OPEN)
    opened_at = models.DateTimeField(_("زمان شروع شیفت"), auto_now_add=True)
    closed_at = models.DateTimeField(_("زمان پایان شیفت"), null=True, blank=True)

    class Meta:
        verbose_name = _("شیفت صندوق‌داری")
        verbose_name_plural = _("۲. نوبت‌ها و شیفت‌های صندوق‌داران")
        ordering = ['-opened_at']

    def __str__(self):
        return f"شیفت {self.cashier.full_name} | {self.register.name} ({self.get_status_display()})"


class PosSale(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'cash', _('وجه نقد')
        POS_CARD = 'pos_card', _('کارتخوان متصل (POS)')
        SPLIT = 'split', _('ترکیبی (نقد + کارت)')
        CREDIT_DEBT = 'credit_debt', _('نسیه و حساب دفتری')

    invoice_number = models.CharField(_("شماره فاکتور صندوق"), max_length=50, unique=True, db_index=True)
    shift = models.ForeignKey(PosShift, on_delete=models.PROTECT, related_name='sales', verbose_name=_("شیفت صندوق"))
    cashier = models.ForeignKey(User, on_delete=models.PROTECT, related_name='pos_sales', verbose_name=_("صندوق‌دار"))
    customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='pos_purchases', verbose_name=_("مشتری (اختیاری)"))
    payment_method = models.CharField(_("روش تسویه"), max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.POS_CARD)
    total_amount = models.BigIntegerField(_("مبلغ ناخالص (تومان)"))
    discount_amount = models.BigIntegerField(_("تخفیف (تومان)"), default=0)
    final_amount = models.BigIntegerField(_("مبلغ پرداختی نهایی (تومان)"))
    pos_card_ref = models.CharField(_("شماره ارجاع / پیگیری کارتخوان"), max_length=50, blank=True)
    created_at = models.DateTimeField(_("تاریخ و زمان صدور فاکتور"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("فاکتور فروش حضوری")
        verbose_name_plural = _("۳. فاکتورهای فروشگاه حضوری (POS)")
        ordering = ['-created_at']

    def __str__(self):
        return f"فاکتور {self.invoice_number} | {self.final_amount:,} تومان"


class PosSaleItem(models.Model):
    sale = models.ForeignKey(PosSale, on_delete=models.CASCADE, related_name='items', verbose_name=_("فاکتور مرجع"))
    product = models.ForeignKey(CigaretteProduct, on_delete=models.PROTECT, related_name='pos_sale_items', verbose_name=_("محصول دخانی"))
    unit_type = models.CharField(_("واحد فروش"), max_length=20, default='pack', choices=[('pack', 'پاکت'), ('box', 'باکس'), ('carton', 'کارتن')])
    quantity = models.PositiveIntegerField(_("تعداد"))
    unit_price = models.BigIntegerField(_("قیمت واحد (تومان)"))
    subtotal = models.BigIntegerField(_("جمع ردیف (تومان)"))

    class Meta:
        verbose_name = _("قلم فاکتور حضوری")
        verbose_name_plural = _("اقلام فاکتور حضوری")

    def __str__(self):
        return f"{self.product.name_fa} x {self.quantity} {self.unit_type}"
