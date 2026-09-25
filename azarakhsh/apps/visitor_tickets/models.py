"""
visitor_tickets/models.py
مدل‌های اختصاصی تیکتینگ ویزیتوران، پیگیری تسویه پورسانت ۲.۵٪ و درخواست ثبت مغازه‌دار جدید
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from visitors.models import VisitorProfile, RetailShopCustomer


class VisitorTicket(models.Model):
    class TicketCategory(models.TextChoices):
        COMMISSION_CLAIM = 'commission_claim', _('درخواست تسویه کمیسیون و پورسانت')
        COMMISSION_DISCREPANCY = 'commission_discrepancy', _('مغایرت حساب و کسر درصد پورسانت')
        NEW_SHOP_APPROVAL = 'new_shop', _('درخواست ثبت مغازه‌دار جدید در باشگاه')
        PROMO_SAMPLES = 'promo_samples', _('درخواست نمونه کالا و کاتالوگ ویزیتوری')
        VISITOR_SUPPORT = 'visitor_support', _('پشتیبانی فنی و حقوقی ویزیتور')

    class Priority(models.TextChoices):
        NORMAL = 'normal', _('عادی')
        HIGH = 'high', _('مهم (تسویه مالی)')
        URGENT = 'urgent', _('فوری (مغایرت فاکتور سنگین)')

    class TicketStatus(models.TextChoices):
        SUBMITTED = 'submitted', _('ثبت‌شده - در انتظار بررسی مالی')
        UNDER_REVIEW = 'under_review', _('در حال کارشناسی حسابداری')
        COMMISSION_PAID = 'paid', _('کمیسیون تسویه شد')
        REJECTED = 'rejected', _('رد شده (عدم تایید مدارک)')
        CLOSED = 'closed', _('خاتمه‌یافته')

    ticket_code = models.CharField(_("کد تیکت ویزیتور"), max_length=50, unique=True, db_index=True)
    visitor = models.ForeignKey(VisitorProfile, on_delete=models.CASCADE, related_name='tickets', verbose_name=_("ویزیتور"))
    category = models.CharField(_("دسته تیکت ویزیتوری"), max_length=35, choices=TicketCategory.choices, default=TicketCategory.COMMISSION_CLAIM)
    subject = models.CharField(_("موضوع درخواست"), max_length=200)
    target_shop = models.ForeignKey(RetailShopCustomer, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("مغازه مرتبط (اختیاری)"))
    claimed_amount = models.DecimalField(_("مبلغ پورسانت ادعایی (تومان)"), max_digits=12, decimal_places=0, default=0, help_text="در صورت درخواست تسویه مالی")
    bank_sheba = models.CharField(_("شماره شبای واریز پورسانت"), max_length=30, blank=True, null=True, help_text="فرمت: IR000000000000000000000000")
    status = models.CharField(_("وضعیت رسیدگی"), max_length=25, choices=TicketStatus.choices, default=TicketStatus.SUBMITTED)
    priority = models.CharField(_("اولویت"), max_length=20, choices=Priority.choices, default=Priority.HIGH)
    document = models.FileField(_("سند پیوست (فاکتور / پروانه کسب)"), upload_to='visitor_tickets/docs/', blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ ثبت"), auto_now_add=True)
    updated_at = models.DateTimeField(_("آخرین ویرایش"), auto_now=True)

    class Meta:
        verbose_name = _("تیکت ویزیتور")
        verbose_name_plural = _("۱. تیکت‌های ویزیتوران و تسویه پورسانت")
        ordering = ['-updated_at']

    def __str__(self):
        return f"تیکت ویزیتور [{self.visitor.visitor_code}]: {self.subject} ({self.get_status_display()})"


class VisitorTicketReply(models.Model):
    ticket = models.ForeignKey(VisitorTicket, on_delete=models.CASCADE, related_name='replies', verbose_name=_("تیکت ویزیتور"))
    sender = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("فرستنده پیام"))
    is_accountant_reply = models.BooleanField(_("پاسخ مدیر مالی / حسابدار انبار"), default=False)
    message = models.TextField(_("متن پیام / توضیحات تسویه"))
    payment_receipt = models.FileField(_("فیش واریز پورسانت توسط حسابدار"), upload_to='visitor_tickets/payouts/', blank=True, null=True)
    created_at = models.DateTimeField(_("زمان ارسال"), auto_now_add=True)

    class Meta:
        verbose_name = _("پاسخ تیکت ویزیتور")
        verbose_name_plural = _("۲. پاسخ‌ها و فیش‌های واریز پورسانت")
        ordering = ['created_at']

    def __str__(self):
        role = "حسابدار انبار" if self.is_accountant_reply else "ویزیتور"
        return f"پاسخ {role} برای تیکت ویزیتور {self.ticket.ticket_code}"
