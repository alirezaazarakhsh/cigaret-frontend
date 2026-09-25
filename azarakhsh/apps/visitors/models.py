"""
visitors/models.py
مدل‌های سیستم ویزیتوری، کدهای اختصاصی ویزیتور، باشگاه مشتریان (مغازه‌داران) و گزارش کمیسیون سود
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from orders.models import OrderInvoice


class VisitorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='visitor_profile', verbose_name=_("حساب کاربر ویزیتور"))
    visitor_code = models.CharField(_("کد اختصاصی ویزیتور"), max_length=50, unique=True, db_index=True, help_text="مثال: VISITOR-9419")
    commission_rate = models.DecimalField(_("درصد سود/کمیسیون ویزیتور"), max_digits=5, decimal_places=2, default=2.50, help_text="درصد کمیسیون از هر فروش (مثلا 2.50)")
    total_sales_amount = models.DecimalField(_("مجموع مبلغ فروش‌های ثبت‌شده"), max_digits=14, decimal_places=0, default=0)
    total_commission_earned = models.DecimalField(_("مجموع سود و کمیسیون دریافتی"), max_digits=12, decimal_places=0, default=0)
    is_active = models.BooleanField(_("ویزیتور فعال"), default=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)

    class Meta:
        verbose_name = _("پروفایل ویزیتور")
        verbose_name_plural = _("مدیریت ویزیتوران و کمیسیون‌ها")

    def __str__(self):
        return f"ویزیتور: {self.user.full_name} (کد: {self.visitor_code})"


class RetailShopCustomer(models.Model):
    visitor = models.ForeignKey(VisitorProfile, on_delete=models.CASCADE, related_name='retail_shops', verbose_name=_("ویزیتور معرف"))
    shop_name = models.CharField(_("نام مغازه / سوپرمارکت"), max_length=200)
    owner_name = models.CharField(_("نام صاحب مغازه"), max_length=150)
    phone = models.CharField(_("شماره تماس مغازه‌دار"), max_length=15)
    city = models.CharField(_("شهر"), max_length=60, default="تهران")
    address = models.TextField(_("آدرس دقیق مغازه"))
    license_no = models.CharField(_("شماره پروانه کسب"), max_length=50, blank=True, null=True)
    total_purchases = models.DecimalField(_("مجموع خریدهای مغازه"), max_digits=12, decimal_places=0, default=0)
    created_at = models.DateTimeField(_("تاریخ ثبت در باشگاه"), auto_now_add=True)

    class Meta:
        verbose_name = _("مغازه باشگاه مشتریان")
        verbose_name_plural = _("باشگاه مشتریان مغازه‌داران ویزیتور")

    def __str__(self):
        return f"{self.shop_name} - {self.owner_name} ({self.city})"


class VisitorCommissionLog(models.Model):
    visitor = models.ForeignKey(VisitorProfile, on_delete=models.CASCADE, related_name='commissions', verbose_name=_("ویزیتور"))
    order = models.ForeignKey(OrderInvoice, on_delete=models.CASCADE, related_name='visitor_commissions', verbose_name=_("سفارش مرجع"))
    retail_shop = models.ForeignKey(RetailShopCustomer, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("مغازه خریدار"))
    sale_amount = models.DecimalField(_("مبلغ کل فاکتور فروش"), max_digits=12, decimal_places=0)
    commission_rate = models.DecimalField(_("درصد کمیسیون اعمالی"), max_digits=5, decimal_places=2)
    commission_amount = models.DecimalField(_("مبلغ سود و کمیسیون ویزیتور"), max_digits=10, decimal_places=0)
    is_settled = models.BooleanField(_("تسویه شده با ویزیتور"), default=False)
    created_at = models.DateTimeField(_("تاریخ ثبت تراکنش کمیسیون"), auto_now_add=True)

    class Meta:
        verbose_name = _("گزارش سود و کمیسیون ویزیتور")
        verbose_name_plural = _("گزارشات مالی سود و کمیسیون ویزیتوران")
        ordering = ['-created_at']

    def __str__(self):
        return f"کمیسیون {self.visitor.visitor_code} برای فاکتور {self.order.order_id}: {self.commission_amount} تومان"
