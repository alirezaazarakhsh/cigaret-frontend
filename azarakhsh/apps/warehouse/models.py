"""
warehouse/models.py
مدل‌های مدیریت چندانباره، موجودی لحظه‌ای کارتن/باکس، کاردکس ورود/خروج کالا و ضایعات
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from catalog.models import CigaretteProduct


class WarehouseLocation(models.Model):
    name = models.CharField(_("نام انبار"), max_length=120)
    code = models.CharField(_("کد انبار"), max_length=30, unique=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_warehouses', verbose_name=_("مدیر/انباردار"))
    address = models.TextField(_("آدرس دقیق انبار"))
    phone = models.CharField(_("شماره تماس انبار"), max_length=20)
    is_active = models.BooleanField(_("فعال"), default=True)

    class Meta:
        verbose_name = _("انبار")
        verbose_name_plural = _("۱. انبارها و مراکز لجستیک")

    def __str__(self):
        return f"{self.name} (کد: {self.code})"


class WarehouseStock(models.Model):
    warehouse = models.ForeignKey(WarehouseLocation, on_delete=models.CASCADE, related_name='stocks', verbose_name=_("انبار"))
    product = models.ForeignKey(CigaretteProduct, on_delete=models.CASCADE, related_name='stocks', verbose_name=_("محصول"))
    cartons_count = models.PositiveIntegerField(_("موجودی کارتن"), default=0)
    loose_boxes_count = models.PositiveIntegerField(_("موجودی باکس تکی"), default=0)
    min_stock_alert = models.PositiveIntegerField(_("حداقل نقطه سفارش (کارتن)"), default=5)
    updated_at = models.DateTimeField(_("آخرین به‌روزرسانی موجودی"), auto_now=True)

    class Meta:
        verbose_name = _("موجودی انبار کالا")
        verbose_name_plural = _("۲. موجودی لحظه‌ای انبار")
        unique_together = ['warehouse', 'product']

    def __str__(self):
        return f"{self.product.name_fa} در {self.warehouse.name}: {self.cartons_count} کارتن"


class KardexEntry(models.Model):
    class MovementType(models.TextChoices):
        PURCHASE_ENTRY = 'in_purchase', _('ورود بار خرید عمده (کارخانه)')
        SALES_EXIT = 'out_sale', _('خروج بار سفارش بنکدار')
        POS_EXIT = 'out_pos', _('خروج فروش صندوق حضوری')
        TRANSFER_IN = 'in_transfer', _('انتقال ورودی از انبار دیگر')
        TRANSFER_OUT = 'out_transfer', _('انتقال خروجی به انبار دیگر')
        WASTE_ADJUSTMENT = 'out_waste', _('ضایعات و افت بار خیس‌خورده')
        INVENTORY_AUDIT = 'audit', _('تعدیل انبارگردانی دوره‌ای')

    stock = models.ForeignKey(WarehouseStock, on_delete=models.CASCADE, related_name='kardex_entries', verbose_name=_("رکورد موجودی"))
    movement_type = models.CharField(_("نوع گردش کالا"), max_length=30, choices=MovementType.choices)
    reference_code = models.CharField(_("شماره فاکتور / حواله انبار"), max_length=60, db_index=True)
    quantity_cartons_change = models.IntegerField(_("تغییرات کارتن (مثبت یا منفی)"))
    balance_cartons_after = models.PositiveIntegerField(_("مانده کارتن بعد از گردش"))
    operator = models.ForeignKey(User, on_delete=models.PROTECT, related_name='kardex_ops', verbose_name=_("انباردار ثبت‌کننده"))
    description = models.CharField(_("توضیحات و علت گردش"), max_length=255, blank=True)
    created_at = models.DateTimeField(_("تاریخ و زمان گردش"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("ردیف کاردکس کالا")
        verbose_name_plural = _("۳. کاردکس ریالی و مقداری کالاها")
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"{self.get_movement_type_display()} | سند: {self.reference_code} | مانده: {self.balance_cartons_after}"
