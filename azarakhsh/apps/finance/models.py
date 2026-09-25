"""
finance/models.py
مدل‌های حساب‌های دفتری (نسیه)، ریز گردش تراکنش‌های مالی، سقف اعتبار و چک‌های صیادی
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class CustomerLedger(models.Model):
    customer = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ledger_account', verbose_name=_("مشتری"))
    credit_limit = models.BigIntegerField(_("سقف اعتبار نسیه (تومان)"), default=0)
    current_balance = models.BigIntegerField(_("مانده بدهی جاری (تومان)"), default=0, help_text="مبالغ مثبت نشان‌دهنده بدهی مشتری است.")
    max_overdue_days = models.PositiveIntegerField(_("مهلت تسویه نسیه (روز)"), default=30)
    is_blocked = models.BooleanField(_("حساب نسیه مسدود شده"), default=False)
    last_settled_at = models.DateTimeField(_("تاریخ آخرین تسویه کامل"), null=True, blank=True)
    created_at = models.DateTimeField(_("تاریخ افتتاح حساب دفتری"), auto_now_add=True)

    class Meta:
        verbose_name = _("حساب دفتری مشتری")
        verbose_name_plural = _("۱. حساب‌های دفتری و اعتباری (نسیه)")

    def __str__(self):
        return f"دفتر {self.customer.full_name} | مانده بدهی: {self.current_balance:,} تومان"


class LedgerTransaction(models.Model):
    class TransactionType(models.TextChoices):
        CREDIT_SALE = 'credit_sale', _('فاکتور فروش نسیه')
        CASH_PAYMENT = 'cash_payment', _('دریافت وجه نقد')
        BANK_TRANSFER = 'bank_transfer', _('حواله بانکی پایا / ساتنا')
        CHEQUE = 'cheque', _('دریافت چک صیادی')
        SETTLEMENT_DISCOUNT = 'discount', _('تخفیف تسویه نقدی')

    ledger = models.ForeignKey(CustomerLedger, on_delete=models.CASCADE, related_name='transactions', verbose_name=_("دفتر حساب"))
    transaction_type = models.CharField(_("نوع تراکنش"), max_length=30, choices=TransactionType.choices)
    document_ref = models.CharField(_("شماره سند / فاکتور"), max_length=60, db_index=True)
    debit_amount = models.BigIntegerField(_("بدهکار (افزایش بدهی - تومان)"), default=0)
    credit_amount = models.BigIntegerField(_("بستانکار (پرداخت مشتری - تومان)"), default=0)
    balance_after = models.BigIntegerField(_("مانده بعد از سند (تومان)"))
    recorded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='recorded_finance_docs', verbose_name=_("حسابدار ثبت‌کننده"))
    description = models.CharField(_("شرح سند"), max_length=255)
    created_at = models.DateTimeField(_("زمان ثبت سند"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("تراکنش حساب دفتری")
        verbose_name_plural = _("۲. ریز گردش تراکنش‌های مالی و اسناد")
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"{self.get_transaction_type_display()} | سند: {self.document_ref} | مانده: {self.balance_after:,}"


class ChequeRecord(models.Model):
    class ChequeStatus(models.TextChoices):
        PENDING = 'pending', _('در جریان وصول (نزد صندوق)')
        PASSED = 'passed', _('وصول شده و نشسته به حساب')
        BOUNCED = 'bounced', _('برگشت خورده (عدم موجودی)')
        RETURNED = 'returned', _('عودت به مشتری')

    ledger = models.ForeignKey(CustomerLedger, on_delete=models.CASCADE, related_name='cheques', verbose_name=_("دفتر مشتری"))
    sayad_number = models.CharField(_("شناسه ۱۶ رقمی صیاد"), max_length=16, unique=True)
    bank_name = models.CharField(_("بانک صادرکننده"), max_length=80)
    amount = models.BigIntegerField(_("مبلغ چک (تومان)"))
    due_date = models.DateField(_("تاریخ سررسید"))
    status = models.CharField(_("وضعیت وصول"), max_length=20, choices=ChequeStatus.choices, default=ChequeStatus.PENDING)
    notes = models.CharField(_("توضیحات و پشت‌نویسی"), max_length=255, blank=True)
    created_at = models.DateTimeField(_("تاریخ دریافت"), auto_now_add=True)

    class Meta:
        verbose_name = _("چک صیادی مشتری")
        verbose_name_plural = _("۳. چک‌های صیادی و اسناد تجاری")
        ordering = ['due_date']

    def __str__(self):
        return f"چک صیادی {self.sayad_number} | {self.amount:,} تومان ({self.get_status_display()})"
