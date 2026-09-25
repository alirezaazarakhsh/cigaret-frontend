"""
roles/models.py
مدل‌های کنترل دسترسی مبتنی بر نقش (RBAC)، پروفایل پرسنل، PIN لاگین صندوق و ممیزی امنیتی
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import make_password, check_password
from accounts.models import User


class StaffRole(models.TextChoices):
    SUPER_ADMIN = 'super_admin', _('مدیر ارشد و صاحب انبار')
    WAREHOUSE_MANAGER = 'warehouse_manager', _('مدیر انبار مرکزی و لجستیک')
    CASHIER = 'cashier', _('صندوق‌دار فروش حضوری')
    ACCOUNTANT = 'accountant', _('مدیر مالی و حسابداری دفتری')
    VISITOR = 'visitor', _('ویزیتور و بازاریاب میدانی')


class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile', verbose_name=_("حساب کاربری"))
    role = models.CharField(_("نقش سازمانی"), max_length=30, choices=StaffRole.choices, default=StaffRole.CASHIER)
    staff_code = models.CharField(_("کد پرسنلی"), max_length=30, unique=True)
    pos_pin_hashed = models.CharField(_("رمز PIN صندوق (هش‌شده)"), max_length=128, blank=True)
    can_apply_custom_discount = models.BooleanField(_("مجوز ثبت تخفیف دستی"), default=False)
    max_discount_percent = models.PositiveSmallIntegerField(_("حداکثر درصد تخفیف مجاز"), default=0)
    can_adjust_inventory = models.BooleanField(_("مجوز اصلاح موجودی انبار"), default=False)
    can_view_purchase_costs = models.BooleanField(_("مجوز مشاهده قیمت خرید و سود"), default=False)
    is_active_staff = models.BooleanField(_("پرسنل فعال"), default=True)
    created_at = models.DateTimeField(_("تاریخ استخدام/ثبت"), auto_now_add=True)

    class Meta:
        verbose_name = _("پروفایل پرسنل و دسترسی")
        verbose_name_plural = _("۱. پرسنل سازمانی و نقش‌ها (RBAC)")

    def __str__(self):
        return f"{self.user.full_name} ({self.get_role_display()}) - کد {self.staff_code}"

    def set_pin(self, raw_pin):
        self.pos_pin_hashed = make_password(str(raw_pin))

    def verify_pin(self, raw_pin):
        return check_password(str(raw_pin), self.pos_pin_hashed)


class SecurityAuditLog(models.Model):
    staff = models.ForeignKey(StaffProfile, on_delete=models.SET_NULL, null=True, related_name='audit_logs', verbose_name=_("پرسنل"))
    action_type = models.CharField(_("نوع عملیات"), max_length=60)
    target_model = models.CharField(_("موجودیت تغییریافته"), max_length=60)
    target_id = models.CharField(_("شناسه رکورد"), max_length=60)
    ip_address = models.GenericIPAddressField(_("آدرس IP"), blank=True, null=True)
    details = models.JSONField(_("جزئیات رویداد"), default=dict)
    created_at = models.DateTimeField(_("زمان رویداد"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("لاگ ممیزی امنیتی")
        verbose_name_plural = _("۲. لاگ امنیتی عملیات حساس پرسنل")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.staff.user.full_name if self.staff else 'سیستم'} -> {self.action_type} ({self.created_at})"
