"""
tickets/models.py
مدل‌های سیستم تیکتینگ بنکداری و مکاتبه اختصاصی با بخش‌های فروش و انبار
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import random


class SupportTicket(models.Model):
    DEPARTMENT_CHOICES = (
        ('sales', _('واحد فروش و ثبت پیش‌فاکتور')),
        ('warehouse', _('انبار مرکزی جنت‌آباد (پلمپ و بارگیری)')),
        ('shipping', _('واحد ترابری و باربری (وطن / جهانگیر)')),
        ('finance', _('واحد مالی و تأیید فیش واریزی')),
    )

    PRIORITY_CHOICES = (
        ('low', _('عادی')),
        ('medium', _('متوسط')),
        ('high', _('فوری (بارگیری اضطراری)')),
        ('critical', _('بحرانی')),
    )

    STATUS_CHOICES = (
        ('open', _('در انتظار پاسخ کارشناس')),
        ('answered', _('پاسخ داده شده')),
        ('customer_reply', _('پاسخ بنکدار')),
        ('in_progress', _('در حال اقدام در انبار')),
        ('closed', _('بسته شده / خاتمه یافته')),
    )

    ticket_number = models.CharField(_("شماره تیکت"), max_length=20, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tickets",
        verbose_name=_("کاربر ثبت‌کننده")
    )
    title = models.CharField(_("عنوان موضوع تیکت"), max_length=200)
    department = models.CharField(_("واحد ارجاع"), max_length=30, choices=DEPARTMENT_CHOICES, default='sales')
    priority = models.CharField(_("اولویت"), max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(_("وضعیت"), max_length=30, choices=STATUS_CHOICES, default='open')
    order_tracking_code = models.CharField(_("کد سفارش مرتبط (اختیاری)"), max_length=30, blank=True, null=True)

    created_at = models.DateTimeField(_("زمان ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("آخرین بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("تیکت پشتیبانی")
        verbose_name_plural = _("تیکت‌های پشتیبانی و انبار")
        ordering = ['-updated_at']

    def __str__(self):
        return f"[{self.ticket_number}] {self.title} - {self.get_status_display()}"

    @classmethod
    def generate_ticket_number(cls):
        return f"TK-{random.randint(10000, 99999)}"


class TicketMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="messages", verbose_name=_("تیکت"))
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("فرستنده"))
    is_staff_reply = models.BooleanField(_("پاسخ توسط کارشناس پشتیبانی"), default=False)
    message = models.TextField(_("متن پیام"))
    attachment = models.FileField(_("فایل یا تصویر ضمیمه"), upload_to="ticket_attachments/%Y/%m/", blank=True, null=True)
    created_at = models.DateTimeField(_("زمان ارسال"), auto_now_add=True)

    class Meta:
        verbose_name = _("پیام تیکت")
        verbose_name_plural = _("پیام‌های تیکت")
        ordering = ['created_at']

    def __str__(self):
        return f"پیام روی {self.ticket.ticket_number} توسط {self.sender}"
