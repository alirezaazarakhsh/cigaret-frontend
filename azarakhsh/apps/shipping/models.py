"""
shipping/models.py
مدل‌های تعرفه باربری استانی، ناوگان وانت اختصاصی و آژانس‌های ترابری
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class ShippingMethod(models.Model):
    name = models.CharField(_("عنوان روش ارسال"), max_length=100)
    slug = models.SlugField(_("شناسه انگلیسی"), unique=True)
    estimated_time = models.CharField(_("مدت زمان تقریبی تحویل"), max_length=50, default="۲۴ الی ۴۸ ساعت")
    base_cost = models.BigIntegerField(_("هزینه پایه کرایه (تومان)"), default=150000)
    is_active = models.BooleanField(_("فعال در پیش‌فاکتور"), default=True)
    description = models.TextField(_("توضیحات بسته‌بندی و پلمپ"), blank=True)

    class Meta:
        verbose_name = _("روش حمل و ترابری")
        verbose_name_plural = _("روش‌های حمل و ترابری")

    def __str__(self):
        return f"{self.name} ({self.base_cost:,} تومان)"


class ProvincialTariff(models.Model):
    province = models.CharField(_("نام استان"), max_length=60, unique=True)
    capital_city = models.CharField(_("مرکز استان"), max_length=60)
    vatan_freight_cost = models.BigIntegerField(_("کرایه باربری وطن (هر کارتن - تومان)"), default=45000)
    express_fleet_available = models.BooleanField(_("پوشش ناوگان وانت مستقیم"), default=False)

    class Meta:
        verbose_name = _("تعرفه کرایه استانی")
        verbose_name_plural = _("جدول تعرفه کرایه باربری استان‌ها")
        ordering = ['province']

    def __str__(self):
        return f"{self.province} - {self.vatan_freight_cost:,} تومان/کارتن"
