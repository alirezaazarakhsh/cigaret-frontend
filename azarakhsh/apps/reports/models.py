"""
reports/models.py
مدل‌های تحلیل هوشمند فروش، کش آمار دوره‌ای و ماتریس سودآوری کالاها
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from catalog.models import CigaretteProduct


class DailySalesSnapshot(models.Model):
    report_date = models.DateField(_("تاریخ گزارش"), unique=True, db_index=True)
    wholesale_orders_count = models.PositiveIntegerField(_("تعداد سفارشات عمده"), default=0)
    pos_sales_count = models.PositiveIntegerField(_("تعداد فاکتورهای حضوری (POS)"), default=0)
    total_revenue = models.BigIntegerField(_("کل فروش ناخالص روز (تومان)"), default=0)
    total_discount = models.BigIntegerField(_("کل تخفیفات داده‌شده (تومان)"), default=0)
    estimated_gross_profit = models.BigIntegerField(_("سود ناخالص برآوردی (تومان)"), default=0)
    cash_collected = models.BigIntegerField(_("دریافتی نقد و کارتخوان (تومان)"), default=0)
    credit_issued = models.BigIntegerField(_("فروش نسیه و دفتری (تومان)"), default=0)
    created_at = models.DateTimeField(_("زمان ایجاد کش"), auto_now_add=True)

    class Meta:
        verbose_name = _("اسنپ‌شات فروش روزانه")
        verbose_name_plural = _("۱. اسنپ‌شات‌ها و گزارشات روزانه فروش")
        ordering = ['-report_date']

    def __str__(self):
        return f"گزارش مالی {self.report_date} | فروش: {self.total_revenue:,} تومان"


class ProductSalesMetric(models.Model):
    product = models.ForeignKey(CigaretteProduct, on_delete=models.CASCADE, related_name='sales_metrics', verbose_name=_("محصول"))
    period_month = models.CharField(_("ماه گزارش"), max_length=7, db_index=True, help_text="فرمت: 1403-06")
    total_cartons_sold = models.DecimalField(_("مجموع کارتن‌های فروخته‌شده"), max_digits=10, decimal_places=2, default=0)
    total_boxes_sold = models.PositiveIntegerField(_("مجموع باکس‌های فروخته‌شده"), default=0)
    total_sales_amount = models.BigIntegerField(_("مبلغ کل فروش (تومان)"), default=0)
    profit_margin_percent = models.DecimalField(_("درصد حاشیه سود"), max_digits=5, decimal_places=2, default=0)

    class Meta:
        verbose_name = _("آمار فروش کالا")
        verbose_name_plural = _("۲. ماتریس سودآوری و رتبه‌بندی محصولات")
        unique_together = ['product', 'period_month']

    def __str__(self):
        return f"{self.product.name_fa} ({self.period_month}) | کارتن: {self.total_cartons_sold}"
