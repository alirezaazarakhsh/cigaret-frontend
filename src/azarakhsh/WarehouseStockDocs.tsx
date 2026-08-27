import React from 'react';
import { Archive } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const WarehouseStockDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'warehouse_warehouse',
      verboseName: 'انبارها و شعب نگهداری کالا',
      description: 'تعریف انبارهای فیزیکی شامل انبار مرکزی جنت‌آباد، انبار ترانزیت، انبار ضایعات و انبار پخش مویرگی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'name', type: 'CharField(max_length=120)', verbose: 'نام انبار (مثلا: انبار مرکزی جنت‌آباد)' },
        { name: 'code', type: 'CharField(max_length=30)', isUnique: true, verbose: 'کد انبار (مثلا: WH-JANAT-01)' },
        { name: 'manager_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'انباردار مسئول' },
        { name: 'address', type: 'TextField', verbose: 'آدرس فیزیکی انبار' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'انبار فعال' },
      ]
    },
    {
      name: 'warehouse_kardexentry',
      verboseName: 'کاردکس تعدادی و ریالی انبار (Kardex)',
      description: 'ردیف‌های گردش کالا شامل ورود از گمرک/کارخانه، خروج بابت فاکتور عمده/حضوری، تعدیل، ضایعات و مانده لحظه‌ای کارتن/باکس',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'warehouse_id', type: 'ForeignKey(Warehouse)', isFk: true, fkTarget: 'warehouse_warehouse', verbose: 'انبار مربوطه' },
        { name: 'product_id', type: 'ForeignKey(CigaretteProduct)', isFk: true, fkTarget: 'catalog_cigaretteproduct', verbose: 'محصول' },
        { name: 'transaction_type', type: 'CharField(choices: in_purchase, out_order, out_pos, adjustment, waste)', verbose: 'نوع سند' },
        { name: 'document_number', type: 'CharField(max_length=60)', verbose: 'شماره سند مرجع (فاکتور/حواله)' },
        { name: 'in_cartons', type: 'DecimalField(max_digits=10, decimal_places=2, default=0)', verbose: 'وارده (کارتن)' },
        { name: 'out_cartons', type: 'DecimalField(max_digits=10, decimal_places=2, default=0)', verbose: 'صادره (کارتن)' },
        { name: 'balance_cartons', type: 'DecimalField(max_digits=10, decimal_places=2)', verbose: 'مانده لحظه‌ای موجودی (کارتن)' },
        { name: 'unit_cost', type: 'BigIntegerField(default=0)', verbose: 'بهای تمام‌شده هر کارتن (تومان)' },
        { name: 'notes', type: 'CharField(max_length=255, blank=True)', verbose: 'توضیحات و علت ثبت' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ و زمان دقیق ثبت' },
      ]
    },
    {
      name: 'warehouse_stockadjustment',
      verboseName: 'صورت‌جلسه انبارگردانی و تعدیل کسری/اضافی',
      description: 'ثبت مغایرت‌های شمارش فیزیکی انبار با موجودی سیستمی و اعمال سند اصلاحی پس از تایید مدیریت',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'warehouse_id', type: 'ForeignKey(Warehouse)', isFk: true, fkTarget: 'warehouse_warehouse', verbose: 'انبار' },
        { name: 'product_id', type: 'ForeignKey(CigaretteProduct)', isFk: true, fkTarget: 'catalog_cigaretteproduct', verbose: 'محصول' },
        { name: 'system_cartons', type: 'DecimalField(max_digits=10, decimal_places=2)', verbose: 'موجودی قبل در سیستم' },
        { name: 'physical_counted_cartons', type: 'DecimalField(max_digits=10, decimal_places=2)', verbose: 'موجودی شمارش‌شده واقعی' },
        { name: 'difference_cartons', type: 'DecimalField(max_digits=10, decimal_places=2)', verbose: 'کسری (-) یا اضافی (+)' },
        { name: 'reason', type: 'CharField(choices: count_audit, damaged, theft, expired)', verbose: 'علت مغایرت' },
        { name: 'approved_by_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'تاییدکننده نهایی' },
        { name: 'is_applied', type: 'BooleanField(default=False)', verbose: 'اعمال‌شده در کاردکس' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ انبارگردانی' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/warehouse/kardex/?product_id=1&warehouse_id=1',
      auth: 'IsAuthenticated (Warehouse / Admin)',
      description: 'دریافت تاریخچه کامل کاردکس ورود و خروج یک کالا همراه با مانده لحظه‌ای و شماره اسناد پیگیری',
      responseBody: JSON.stringify({
        product_name: "وینستون لایت کارتن",
        warehouse_name: "انبار مرکزی جنت‌آباد",
        current_stock: 42.5,
        entries: [
          {
            id: 890,
            date: "۱۴۰۳/۰۶/۰۴ - ۱۰:۳۰",
            type: "in_purchase",
            type_label: "رسید ورود بار از ترخیص",
            doc_no: "IN-9912",
            in_qty: 50,
            out_qty: 0,
            balance: 50,
            unit_cost: 36200000
          },
          {
            id: 895,
            date: "۱۴۰۳/۰۶/۰۴ - ۱۲:۱۵",
            type: "out_order",
            type_label: "حواله خروج سفارش عمده",
            doc_no: "INV-1403-1024",
            in_qty: 0,
            out_qty: 7.5,
            balance: 42.5,
            unit_cost: 36200000
          }
        ]
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/warehouse/adjustment/apply/',
      auth: 'IsAdminUser',
      description: 'ثبت و تایید سند انبارگردانی و اصلاح فوری کاردکس با ثبت لاگ مدیریتی',
      requestBody: JSON.stringify({
        warehouse_id: 1,
        product_id: 1,
        counted_cartons: 40,
        reason: "damaged",
        notes: "۲.۵ کارتن در اثر رطوبت آسیب دیده و به انبار ضایعات منتقل گردید"
      }, null, 2),
      responseBody: JSON.stringify({
        success: true,
        adjustment_id: 44,
        difference: -2.5,
        new_balance: 40,
        kardex_entry_id: 902
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/warehouse/low-stock-alerts/',
      auth: 'IsAuthenticated',
      description: 'لیست کالاهایی که موجودی فعلی آنها کمتر از حداقل موجودی نقطه سفارش (Safety Stock) است'
    }
  ];

  const modelsCode = `"""
warehouse/models.py
مدل‌های انبار فیزیکی، کاردکس تعدادی/ریالی، انبارگردانی و ردیابی ورود و خروج
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from catalog.models import CigaretteProduct


class Warehouse(models.Model):
    name = models.CharField(_("نام انبار"), max_length=120)
    code = models.CharField(_("کد اختصاصی انبار"), max_length=30, unique=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_warehouses', verbose_name=_("انباردار مسئول"))
    address = models.TextField(_("آدرس فیزیکی انبار"), blank=True)
    is_active = models.BooleanField(_("انبار فعال"), default=True)

    class Meta:
        verbose_name = _("انبار")
        verbose_name_plural = _("۱. انبارها و مراکز نگهداری کالا")

    def __str__(self):
        return f"{self.name} ({self.code})"


class KardexEntry(models.Model):
    class TransactionType(models.TextChoices):
        IN_PURCHASE = 'in_purchase', _('ورود بار / خرید جدید')
        OUT_ORDER = 'out_order', _('خروج حواله سفارش عمده وب‌سایت')
        OUT_POS = 'out_pos', _('خروج فاکتور فروش حضوری (POS)')
        ADJUSTMENT = 'adjustment', _('تعدیل و انبارگردانی')
        WASTE = 'waste', _('خروج ضایعات و خرابی')
        TRANSFER = 'transfer', _('انتقال بین انبارها')

    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='kardex_entries', verbose_name=_("انبار"))
    product = models.ForeignKey(CigaretteProduct, on_delete=models.CASCADE, related_name='kardex_records', verbose_name=_("محصول"))
    transaction_type = models.CharField(_("نوع عملیات"), max_length=30, choices=TransactionType.choices)
    document_number = models.CharField(_("شماره سند / فاکتور"), max_length=60, db_index=True)
    in_cartons = models.DecimalField(_("وارده (کارتن)"), max_digits=10, decimal_places=2, default=0)
    out_cartons = models.DecimalField(_("صادره (کارتن)"), max_digits=10, decimal_places=2, default=0)
    balance_cartons = models.DecimalField(_("مانده موجودی لحظه‌ای (کارتن)"), max_digits=10, decimal_places=2)
    unit_cost = models.BigIntegerField(_("بهای تمام‌شده هر کارتن (تومان)"), default=0)
    notes = models.CharField(_("توضیحات سند"), max_length=255, blank=True)
    created_at = models.DateTimeField(_("زمان ثبت سند"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("ردیف کاردکس انبار")
        verbose_name_plural = _("۲. کاردکس تعدادی و ریالی کالاها (Kardex)")
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"کاردکس {self.product.name_fa} | {self.get_transaction_type_display()} | مانده: {self.balance_cartons}"


class StockAdjustment(models.Model):
    class AdjustmentReason(models.TextChoices):
        COUNT_AUDIT = 'count_audit', _('انبارگردانی دوره‌ای')
        DAMAGED = 'damaged', _('آسیب‌دیدگی و خیسی کارتن')
        EXPIRATION = 'expired', _('انقضای تاریخ مصرف')
        THEFT = 'theft', _('کسری غیرقابل توجیه')

    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, verbose_name=_("انبار"))
    product = models.ForeignKey(CigaretteProduct, on_delete=models.CASCADE, verbose_name=_("محصول"))
    system_cartons = models.DecimalField(_("موجودی قبلی سیستم (کارتن)"), max_digits=10, decimal_places=2)
    physical_counted_cartons = models.DecimalField(_("موجودی شمارش‌شده واقعی"), max_digits=10, decimal_places=2)
    difference_cartons = models.DecimalField(_("میزان مغایرت"), max_digits=10, decimal_places=2)
    reason = models.CharField(_("علت مغایرت"), max_length=30, choices=AdjustmentReason.choices, default=AdjustmentReason.COUNT_AUDIT)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name=_("مدیر تاییدکننده"))
    is_applied = models.BooleanField(_("اعمال شده در کاردکس"), default=False)
    created_at = models.DateTimeField(_("تاریخ ثبت"), auto_now_add=True)

    class Meta:
        verbose_name = _("سند انبارگردانی و تعدیل")
        verbose_name_plural = _("۳. انبارگردانی و مغایرت‌های موجودی")

    def __str__(self):
        return f"تعدیل {self.product.name_fa} (مغایرت: {self.difference_cartons})"
`;

  const adminCode = `"""
warehouse/admin.py
پنل ادمین کاردکس، هشدار کسری موجودی و تایید انبارگردانی
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Warehouse, KardexEntry, StockAdjustment


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'manager', 'is_active')
    search_fields = ('name', 'code')


@admin.register(KardexEntry)
class KardexEntryAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'warehouse', 'product', 'transaction_badge', 'document_number', 'in_cartons', 'out_cartons', 'balance_cartons')
    list_filter = ('transaction_type', 'warehouse', 'created_at')
    search_fields = ('document_number', 'product__name_fa', 'product__sku')
    readonly_fields = ('created_at', 'balance_cartons')

    def transaction_badge(self, obj):
        colors = {
            'in_purchase': '#10b981',
            'out_order': '#3b82f6',
            'out_pos': '#8b5cf6',
            'adjustment': '#f59e0b',
            'waste': '#ef4444'
        }
        return format_html(
            f'<span style="background-color: {colors.get(obj.transaction_type, "#64748b")}; color: white; padding: 2px 7px; border-radius: 4px; font-size: 11px;">'
            f'{obj.get_transaction_type_display()}</span>'
        )
    transaction_badge.short_description = "نوع عملیات"


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse', 'system_cartons', 'physical_counted_cartons', 'difference_display', 'is_applied', 'approved_by', 'created_at')
    list_filter = ('is_applied', 'reason', 'warehouse')
    readonly_fields = ('difference_cartons', 'created_at')

    def difference_display(self, obj):
        color = 'red' if obj.difference_cartons < 0 else 'green'
        return format_html(f'<b style="color: {color};">{obj.difference_cartons:+} کارتن</b>')
    difference_display.short_description = "مغایرت"
`;

  const serializersCode = `"""
warehouse/serializers.py
"""
from rest_framework import serializers
from .models import Warehouse, KardexEntry, StockAdjustment


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'


class KardexEntrySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name_fa', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    transaction_label = serializers.CharField(source='get_transaction_type_display', read_only=True)

    class Meta:
        model = KardexEntry
        fields = '__all__'


class StockAdjustmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockAdjustment
        fields = '__all__'
        read_only_fields = ['difference_cartons', 'is_applied', 'created_at']
`;

  const viewsCode = `"""
warehouse/views.py
ویوهای کاردکس، هشدارهای کسری موجودی و ثبت انبارگردانی با تراکنش امن
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Warehouse, KardexEntry, StockAdjustment
from .serializers import WarehouseSerializer, KardexEntrySerializer, StockAdjustmentSerializer
from catalog.models import CigaretteProduct


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]


class KardexViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = KardexEntry.objects.all()
    serializer_class = KardexEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        product_id = self.request.query_params.get('product_id')
        warehouse_id = self.request.query_params.get('warehouse_id')
        if product_id:
            qs = qs.filter(product_id=product_id)
        if warehouse_id:
            qs = qs.filter(warehouse_id=warehouse_id)
        return qs


class StockAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = StockAdjustment.objects.all()
    serializer_class = StockAdjustmentSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['post'], url_path='apply')
    @transaction.atomic
    def apply_adjustment(self, request):
        warehouse_id = request.data.get('warehouse_id')
        product_id = request.data.get('product_id')
        counted_cartons = float(request.data.get('counted_cartons', 0))
        reason = request.data.get('reason', StockAdjustment.AdjustmentReason.COUNT_AUDIT)
        notes = request.data.get('notes', 'انبارگردانی و اصلاح موجودی')

        product = CigaretteProduct.objects.select_for_update().get(id=product_id)
        warehouse = Warehouse.objects.get(id=warehouse_id)
        system_cartons = float(product.stock_cartons)
        diff = counted_cartons - system_cartons

        # ثبت رکورد انبارگردانی
        adj = StockAdjustment.objects.create(
            warehouse=warehouse,
            product=product,
            system_cartons=system_cartons,
            physical_counted_cartons=counted_cartons,
            difference_cartons=diff,
            reason=reason,
            approved_by=request.user,
            is_applied=True
        )

        # به‌روزرسانی موجودی کاتالوگ
        product.stock_cartons = counted_cartons
        product.save()

        # ثبت ردیف کاردکس
        kardex = KardexEntry.objects.create(
            warehouse=warehouse,
            product=product,
            transaction_type=KardexEntry.TransactionType.ADJUSTMENT,
            document_number=f"ADJ-{adj.id}",
            in_cartons=diff if diff > 0 else 0,
            out_cartons=abs(diff) if diff < 0 else 0,
            balance_cartons=counted_cartons,
            notes=notes
        )

        return Response({
            'success': True,
            'adjustment_id': adj.id,
            'difference': diff,
            'new_balance': counted_cartons,
            'kardex_id': kardex.id
        }, status=status.HTTP_201_CREATED)
`;

  const urlsCode = `"""
warehouse/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseViewSet, KardexViewSet, StockAdjustmentViewSet

router = DefaultRouter()
router.register('warehouses', WarehouseViewSet, basename='warehouse')
router.register('kardex', KardexViewSet, basename='kardex')
router.register('adjustments', StockAdjustmentViewSet, basename='stock-adjustment')

urlpatterns = [
    path('', include(router.urls)),
]
`;

  return (
    <AppDocTemplate
      appFolder="warehouse"
      title="موجودی انبار و کاردکس کالا (Warehouse & Kardex)"
      titleEn="warehouse / Stock & Kardex Management App"
      badge="Kardex • Stock Audit • Multi-Warehouse"
      description="سیستم جامع ردیابی گردش کارتن‌های کالا در انبار مرکزی جنت‌آباد، ثبت ورود و خروج، محاسبه مانده لحظه‌ای و صورت‌جلسه انبارگردانی و ضایعات با تراکنش‌های اتمیک."
      icon={<Archive className="w-6 h-6 text-emerald-500" />}
      modelsCode={modelsCode}
      adminCode={adminCode}
      serializersCode={serializersCode}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};

