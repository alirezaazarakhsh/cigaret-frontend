import React from 'react';
import { BarChart3 } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const ReportsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'reports_dailysalessnapshot',
      verboseName: 'اسنپ‌شات عملکرد روزانه فروش و سود',
      description: 'کش متمرکز روزانه شامل حجم ریالی فروش عمده و صندوق، سود ناخالص برآوردی، دریافتی نقدی و مانده نسیه',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'report_date', type: 'DateField', isUnique: true, verbose: 'تاریخ گزارش' },
        { name: 'wholesale_orders_count', type: 'PositiveIntegerField', verbose: 'تعداد فاکتورهای عمده' },
        { name: 'pos_sales_count', type: 'PositiveIntegerField', verbose: 'تعداد فاکتورهای صندوق حضوری' },
        { name: 'total_revenue', type: 'BigIntegerField', verbose: 'مجموع فروش ناخالص روز (تومان)' },
        { name: 'total_discount', type: 'BigIntegerField', verbose: 'مجموع تخفیفات اعمال‌شده' },
        { name: 'estimated_gross_profit', type: 'BigIntegerField', verbose: 'سود ناخالص برآوردی انبار' },
        { name: 'cash_collected', type: 'BigIntegerField', verbose: 'کل وصولی نقدی و پوز' },
        { name: 'credit_issued', type: 'BigIntegerField', verbose: 'فروش اعتباری و نسیه' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ محاسبه گزارش' },
      ]
    },
    {
      name: 'reports_productsalesmetric',
      verboseName: 'آمار تجمیعی فروش به تفکیک محصول',
      description: 'ردیابی پرفروش‌ترین سیگارها و نوشیدنی‌ها، سهم بازار، تیراژ کارتن‌های فروخته‌شده و حاشیه سود',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'product_id', type: 'ForeignKey(CigaretteProduct)', isFk: true, fkTarget: 'catalog_cigaretteproduct', verbose: 'محصول' },
        { name: 'period_month', type: 'CharField(max_length=7)', verbose: 'ماه گزارش (مثلا: 1403-06)' },
        { name: 'total_cartons_sold', type: 'DecimalField(max_digits=10, decimal_places=2)', verbose: 'تعداد کارتن فروخته‌شده' },
        { name: 'total_boxes_sold', type: 'PositiveIntegerField', verbose: 'تعداد باکس فروخته‌شده' },
        { name: 'total_sales_amount', type: 'BigIntegerField', verbose: 'مبلغ کل فروش (تومان)' },
        { name: 'profit_margin_percent', type: 'DecimalField(max_digits=5, decimal_places=2)', verbose: 'درصد حاشیه سود' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/reports/sales-dashboard/?start_date=1403-06-01&end_date=1403-06-30',
      auth: 'IsAdminUser',
      description: 'دریافت آمار تحلیلی داشبورد کل، سود ناخالص، تفکیک فروش عمده/صندوق و نمودار روزانه',
      responseBody: JSON.stringify({
        summary: {
          total_revenue: 1485000000,
          gross_profit: 118400000,
          profit_margin: "7.97%",
          wholesale_invoices: 42,
          pos_invoices: 380,
          cash_ratio: "74%",
          credit_ratio: "26%"
        },
        top_products: [
          { name: "وینستون لایت اورجینال", cartons: 184.5, revenue: 710325000 },
          { name: "مارلبرو گلد سوئیس", cartons: 92, revenue: 386400000 },
          { name: "بهمن کوچک قرمز", cartons: 120, revenue: 216000000 }
        ]
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/reports/hourly-pos-heatmap/',
      auth: 'IsAdminUser',
      description: 'آنالیز ترافیک و ساعات اوج فروش صندوق حضوری برای بهینه‌سازی شیفت‌های کاری'
    },
    {
      method: 'GET',
      path: '/api/v1/reports/export-excel/?start_date=1403-06-01',
      auth: 'IsAdminUser',
      description: 'خروجی اکسل استاندارد با جدول محاسباتی مالیات و سرفصل‌های حسابداری رسمی'
    }
  ];

  const modelsCode = `"""
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
`;

  const adminCode = `"""
reports/admin.py
پنل ادمین گزارشات و داشبورد مدیریتی
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import DailySalesSnapshot, ProductSalesMetric


@admin.register(DailySalesSnapshot)
class DailySalesSnapshotAdmin(admin.ModelAdmin):
    list_display = ('report_date', 'total_revenue_display', 'estimated_gross_profit_display', 'wholesale_orders_count', 'pos_sales_count', 'cash_vs_credit_ratio')
    list_filter = ('report_date',)
    readonly_fields = ('created_at',)

    def total_revenue_display(self, obj):
        return f"{obj.total_revenue:,} تومان"
    total_revenue_display.short_description = "کل فروش روز"

    def estimated_gross_profit_display(self, obj):
        return format_html(f'<b style="color: green;">{obj.estimated_gross_profit:,} تومان</b>')
    estimated_gross_profit_display.short_description = "سود ناخالص"

    def cash_vs_credit_ratio(self, obj):
        total = obj.cash_collected + obj.credit_issued
        if total == 0:
            return "-"
        cash_pct = int((obj.cash_collected / total) * 100)
        return f"{cash_pct}% نقد / {100 - cash_pct}% نسیه"
    cash_vs_credit_ratio.short_description = "نسبت نقد/نسیه"


@admin.register(ProductSalesMetric)
class ProductSalesMetricAdmin(admin.ModelAdmin):
    list_display = ('product', 'period_month', 'total_cartons_sold', 'total_sales_amount_display', 'profit_margin_percent')
    list_filter = ('period_month',)
    search_fields = ('product__name_fa',)

    def total_sales_amount_display(self, obj):
        return f"{obj.total_sales_amount:,} تومان"
    total_sales_amount_display.short_description = "فروش کل"
`;

  const serializersCode = `"""
reports/serializers.py
"""
from rest_framework import serializers
from .models import DailySalesSnapshot, ProductSalesMetric


class DailySalesSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySalesSnapshot
        fields = '__all__'


class ProductSalesMetricSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name_fa', read_only=True)

    class Meta:
        model = ProductSalesMetric
        fields = '__all__'
`;

  const viewsCode = `"""
reports/views.py
ویوهای محاسباتی آمار، داشبورد هوشمند فروش و خروجی اکسل
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.utils import timezone
from .models import DailySalesSnapshot, ProductSalesMetric
from .serializers import DailySalesSnapshotSerializer, ProductSalesMetricSerializer
from orders.models import OrderInvoice
from pos.models import PosSale


class SalesAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'], url_path='dashboard-summary')
    def dashboard_summary(self, request):
        today = timezone.now().date()
        
        # محاسبه سفارشات عمده امروز
        orders_today = OrderInvoice.objects.filter(created_at__date=today)
        orders_total = orders_today.aggregate(total=Sum('total_amount'))['total'] or 0
        orders_count = orders_today.count()

        # محاسبه فروش صندوق امروز
        pos_today = PosSale.objects.filter(created_at__date=today)
        pos_total = pos_today.aggregate(total=Sum('final_amount'))['total'] or 0
        pos_count = pos_today.count()

        combined_revenue = orders_total + pos_total
        estimated_profit = int(combined_revenue * 0.08)  # میانگین ۸٪ مارجین عمده دخانیات

        return Response({
            'date': today.strftime('%Y/%m/%d'),
            'total_revenue': combined_revenue,
            'estimated_gross_profit': estimated_profit,
            'wholesale_sales': orders_total,
            'wholesale_invoices_count': orders_count,
            'pos_sales': pos_total,
            'pos_sales_count': pos_count
        })

    @action(detail=False, methods=['get'], url_path='top-selling')
    def top_selling(self, request):
        metrics = ProductSalesMetric.objects.select_related('product').order_by('-total_cartons_sold')[:10]
        return Response(ProductSalesMetricSerializer(metrics, many=True).data)
`;

  const urlsCode = `"""
reports/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalesAnalyticsViewSet

router = DefaultRouter()
router.register('analytics', SalesAnalyticsViewSet, basename='sales-analytics')

urlpatterns = [
    path('', include(router.urls)),
]
`;

  return (
    <AppDocTemplate
      appFolder="reports"
      title="گزارشات فروش و کالا (Sales Analytics & Reports)"
      titleEn="reports / Sales Analytics & Profit Margins App"
      badge="BI Dashboard • Profit Margins • Heatmap"
      description="موتور هوشمند گزارش‌گیری مدیریتی، تحلیل سود ناخالص لحظه‌ای، رتبه‌بندی پرفروش‌ترین کارتن‌های دخانیات و نسبت نقد به نسیه."
      icon={<BarChart3 className="w-6 h-6 text-cyan-500" />}
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

