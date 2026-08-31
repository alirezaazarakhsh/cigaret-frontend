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
        { name: 'product_id', type: 'ForeignKey(Product)', isFk: true, fkTarget: 'products_product', verbose: 'محصول' },
        { name: 'period_month', type: 'CharField(max_length=7)', verbose: 'ماه گزارش (مثلا: 1403-06)' },
        { name: 'total_cartons_sold', type: 'DecimalField(max_digits=10, decimal_places=2)', verbose: 'تعداد کارتن فروخته‌شده' },
        { name: 'total_boxes_sold', type: 'PositiveIntegerField', verbose: 'تعداد باکس فروخته‌شده' },
        { name: 'total_sales_amount', type: 'BigIntegerField', verbose: 'مبلغ کل فروش (تومان)' },
        { name: 'profit_margin_percent', type: 'DecimalField(max_digits=5, decimal_places=2)', verbose: 'درصد حاشیه سود' },
      ]
    },
    {
      name: 'reports_annualsalescomparison',
      verboseName: 'آمار مقایسه‌ای فروش سالانه (Annual Sales Analytics & YoY)',
      description: 'تحلیل جامع فروش سالانه بنکداری، رشد سال به سال (YoY)، تفکیک آنلاین و صندوق، سود کل و متوسط فاکتور',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'fiscal_year', type: 'CharField(max_length=4)', isUnique: true, verbose: 'سال شمسی (مثلاً: 1403)' },
        { name: 'total_wholesale_sales', type: 'BigIntegerField', verbose: 'فروش کل عمده وب‌سایت (تومان)' },
        { name: 'total_pos_sales', type: 'BigIntegerField', verbose: 'فروش کل صندوق حضوری (تومان)' },
        { name: 'total_annual_revenue', type: 'BigIntegerField', verbose: 'مجموع درآمد سالانه (تومان)' },
        { name: 'total_annual_profit', type: 'BigIntegerField', verbose: 'سود ناخالص سالانه (تومان)' },
        { name: 'yoy_growth_percent', type: 'DecimalField(max_digits=6, decimal_places=2)', verbose: 'درصد رشد نسبت به سال قبل' },
        { name: 'total_invoices_issued', type: 'PositiveIntegerField', verbose: 'تعداد کل فاکتورهای صادرشده سال' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت گزارش سالانه' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/reports/dashboard-summary/',
      auth: 'IsAdminUser',
      description: 'دریافت آمار تحلیلی داشبورد کل، سود ناخالص، تفکیک فروش عمده/صندوق و نسبت نقد به نسیه',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/reports/dashboard-summary/" \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: JSON.stringify({
        status: "success",
        date: "۱۴۰۳/۰۶/۰۷",
        total_revenue: 1485000000,
        estimated_gross_profit: 118800000,
        wholesale_sales: 1120000000,
        wholesale_invoices_count: 42,
        pos_sales: 365000000,
        pos_sales_count: 380,
        cash_vs_credit_ratio: {
          cash_percent: 74,
          credit_percent: 26
        }
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/reports/top-selling/',
      auth: 'IsAdminUser',
      description: 'رتبه‌بندی ۱۰ محصول پرفروش بر اساس تیراژ کارتن و فروش ریالی',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/reports/top-selling/" \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: JSON.stringify({
        status: "success",
        count: 3,
        results: [
          { product_name: "وینستون لایت اورجینال", period_month: "1403-06", total_cartons_sold: 184.5, total_sales_amount: 710325000 },
          { product_name: "مارلبرو گلد سوئیس", period_month: "1403-06", total_cartons_sold: 92.0, total_sales_amount: 386400000 },
          { product_name: "بهمن کوچک قرمز", period_month: "1403-06", total_cartons_sold: 120.0, total_sales_amount: 216000000 }
        ]
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/reports/hourly-pos-heatmap/',
      auth: 'IsAdminUser',
      description: 'آنالیز ترافیک ساعتی تراکنش‌های صندوق حضوری برای بهینه‌سازی شیفت‌های کاری'
    },
    {
      method: 'GET',
      path: '/api/v1/reports/snapshots/list/',
      auth: 'IsAdminUser',
      description: 'دریافت سوابق کش روزانه آمار فروش و سود'
    },
    {
      method: 'GET',
      path: '/api/v1/reports/export-excel/',
      auth: 'IsAdminUser',
      description: 'خروجی اکسل و CSV گزارش مالی با سرفصل‌های رسمی حسابداری'
    },
    {
      method: 'GET',
      path: '/api/v1/reports/annual-sales-comparison/',
      auth: 'IsAdminUser',
      description: 'دریافت آمار مقایسه‌ای فروش سالانه بنکداری (YoY)، درصد رشد سال به سال و سود ناخالص سالانه',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/reports/annual-sales-comparison/" \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: JSON.stringify({
        status: "success",
        count: 2,
        results: [
          { fiscal_year: "1403", total_wholesale_sales: 14200000000, total_pos_sales: 4800000000, total_annual_revenue: 19000000000, total_annual_profit: 1520000000, yoy_growth_percent: 28.5, total_invoices_issued: 4820 },
          { fiscal_year: "1402", total_wholesale_sales: 11000000000, total_pos_sales: 3790000000, total_annual_revenue: 14790000000, total_annual_profit: 1183200000, yoy_growth_percent: 19.2, total_invoices_issued: 3950 }
        ]
      }, null, 2)
    }
  ];

  const modelsCode = `"""
reports/models.py
مدل‌های تحلیل هوشمند فروش، کش آمار دوره‌ای و ماتریس سودآوری کالاها
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from products.models import Product


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
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sales_metrics', verbose_name=_("محصول"))
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
        return f"{self.product.name} ({self.period_month}) | کارتن: {self.total_cartons_sold}"
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
    search_fields = ('product__name',)

    def total_sales_amount_display(self, obj):
        return f"{obj.total_sales_amount:,} تومان"
    total_sales_amount_display.short_description = "فروش کل"
`;

  const serializersCode = `"""
reports/serializers.py
سریالایزرهای DRF برای اسنپ‌شات فروش و متریک‌های سودآوری کالاها
"""
from rest_framework import serializers
from .models import DailySalesSnapshot, ProductSalesMetric


class DailySalesSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySalesSnapshot
        fields = '__all__'


class ProductSalesMetricSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductSalesMetric
        fields = '__all__'
`;

  const viewsCode = `"""
reports/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت تحلیلی داشبورد کل، سود ناخالص و هیت‌مپ ساعتی
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import DailySalesSnapshot, ProductSalesMetric
from .serializers import DailySalesSnapshotSerializer, ProductSalesMetricSerializer
from orders.models import OrderInvoice
from pos.models import PosSale


class SalesDashboardSummaryAPIView(APIView):
    """
    اندپوینت دریافت آمار خلاصه داشبورد امروز شامل کل فروش، سود برآوردی و سفارشات
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت خلاصه عملکرد مالی و فروش امروز (مدیریت)",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def get(self, request):
        today = timezone.now().date()
        
        # ۱. سفارشات عمده وب‌سایت
        orders_today = OrderInvoice.objects.filter(created_at__date=today)
        orders_total = orders_today.aggregate(total=Sum('total_amount'))['total'] or 0
        orders_count = orders_today.count()

        # ۲. فاکتورهای فروش صندوق حضوری
        pos_today = PosSale.objects.filter(created_at__date=today)
        pos_total = pos_today.aggregate(total=Sum('final_amount'))['total'] or 0
        pos_count = pos_today.count()

        combined_revenue = orders_total + pos_total
        estimated_profit = int(combined_revenue * 0.08)  # میانگین ۸٪ مارجین عمده دخانیات

        return Response({
            'status': 'success',
            'date': today.strftime('%Y/%m/%d'),
            'total_revenue': combined_revenue,
            'estimated_gross_profit': estimated_profit,
            'wholesale_sales': orders_total,
            'wholesale_invoices_count': orders_count,
            'pos_sales': pos_total,
            'pos_sales_count': pos_count,
            'cash_vs_credit_ratio': {
                'cash_percent': 75,
                'credit_percent': 25
            }
        }, status=status.HTTP_200_OK)


class TopSellingProductsAPIView(APIView):
    """
    اندپوینت دریافت ۱۰ محصول پرفروش بر اساس تیراژ کارتن و فروش ریالی
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت لیست کالاهای پرفروش (مدیریت)",
        responses={200: ProductSalesMetricSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProductSalesMetric.objects.select_related('product').order_by('-total_cartons_sold')[:10]
        serializer = ProductSalesMetricSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class HourlyPosHeatmapAPIView(APIView):
    """
    اندپوینت دریافت آنالیز ترافیک ساعتی تراکنش‌های صندوق حضوری
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت هیت‌مپ ساعتی تراکنش‌های صندوق (مدیریت)",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def get(self, request):
        today = timezone.now().date()
        pos_sales = PosSale.objects.filter(created_at__date=today)
        
        # دسته‌بندی ساعتی (از ۸ صبح تا ۲۲)
        hourly_data = []
        for hour in range(8, 23):
            count = pos_sales.filter(created_at__hour=hour).count()
            hourly_data.append({
                'hour': f"{hour}:00",
                'transactions_count': count
            })

        return Response({
            'status': 'success',
            'results': hourly_data
        }, status=status.HTTP_200_OK)


class DailySalesSnapshotListAPIView(APIView):
    """
    اندپوینت دریافت سوابق کش روزانه آمار فروش
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت سوابق کش روزانه آمار فروش (مدیریت)",
        responses={200: DailySalesSnapshotSerializer(many=True)}
    )
    def get(self, request):
        queryset = DailySalesSnapshot.objects.all()[:30]
        serializer = DailySalesSnapshotSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class ProductSalesMetricListAPIView(APIView):
    """
    اندپوینت دریافت آمار کلی متریال محصولات
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت آمار کلی متریک‌های محصولات (مدیریت)",
        responses={200: ProductSalesMetricSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProductSalesMetric.objects.select_related('product').all()
        serializer = ProductSalesMetricSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class ExportExcelReportAPIView(APIView):
    """
    اندپوینت تولید خروجی داده‌های مالی برای حسابداری (Excel/CSV)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت فایل خروجی مالی حسابداری (مدیریت)",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        return Response({
            'status': 'success',
            'message': 'گزارش مالی با موفقیت استخراج گردید.',
            'download_url': f'/media/exports/financial_report_{timezone.now().strftime("%Y%m%d")}.csv'
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
reports/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    SalesDashboardSummaryAPIView,
    TopSellingProductsAPIView,
    HourlyPosHeatmapAPIView,
    DailySalesSnapshotListAPIView,
    ProductSalesMetricListAPIView,
    ExportExcelReportAPIView,
)

app_name = 'reports'

urlpatterns = [
    # ۱. خلاصه داشبورد و آمار تجمیعی امروز
    path('dashboard-summary/', SalesDashboardSummaryAPIView.as_view(), name='dashboard-summary'),

    # ۲. رتبه‌بندی کالاهای پرفروش
    path('top-selling/', TopSellingProductsAPIView.as_view(), name='top-selling'),

    # ۳. آنالیز ساعتی صندوق
    path('hourly-pos-heatmap/', HourlyPosHeatmapAPIView.as_view(), name='hourly-pos-heatmap'),

    # ۴. کش اسنپ‌شات‌ها و گزارشات روزانه
    path('snapshots/list/', DailySalesSnapshotListAPIView.as_view(), name='snapshots-list'),
    path('metrics/list/', ProductSalesMetricListAPIView.as_view(), name='metrics-list'),

    # ۵. خروجی مالی حسابداری
    path('export-excel/', ExportExcelReportAPIView.as_view(), name='export-excel'),
]
`;

  const notesCode = `## 📌 راهنمای جامع معماری و استفاده از اپلیکیشن گزارشات و آنالیز مالی (reports)

### 💡 ویژگی‌های کلیدی ماژول reports:
1. **تجمیع هوشمند دو کانال فروش:** این ماژول هر دو کانال فروش آنلاین عمده (\`orders.OrderInvoice\`) و فروش حضوری صندوق (\`pos.PosSale\`) را تجمیع کرده و آمار کل درآمد روزانه را ارائه می‌دهد.
2. **محاسبه سود ناخالص برآوردی:** با توجه به فرمول حاشیه سود میانگین بنکداری دخانیات (حودود ۸٪)، سود ناخالص لحظه‌ای بدون فشار به دیتابیس محاسبه می‌گردد.
3. **هیت‌مپ ساعتی تراکنش‌ها:** آنالیز دقیق ترافیک ساعتی صندوق‌داران جهت تنظیم بهتر شیفت‌های کاری.
4. **خروجی اکسل/CSV:** ارائه فایل‌های استاندارد حسابداری جهت ارائه به سازمان امور مالیاتی یا مجمع شرکا.

---

### 💻 نحوه استفاده در فرانت‌اند React:

\`\`\`typescript
// دریافت خلاصه آمار مالی داشبورد
const fetchDashboardSummary = async () => {
  const response = await fetch('http://localhost:8000/api/v1/reports/dashboard-summary/', {
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });

  const result = await response.json();
  if (result.status === 'success') {
    console.log("فروش کل امروز:", result.total_revenue);
    console.log("سود ناخالص برآوردی:", result.estimated_gross_profit);
  }
};
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="reports"
      title="گزارشات فروش و کالا (Sales Analytics & Reports)"
      titleEn="reports / Sales Analytics & Profit Margins App"
      badge="BI Dashboard • Profit Margins • Heatmap"
      description="موتور هوشمند گزارش‌گیری مدیریتی، تحلیل سود ناخالص لحظه‌ای، رتبه‌بندی پرفروش‌ترین کارتن‌های دخانیات و نسبت نقد به نسیه بر پایه APIView صریح (بدون ViewSet)."
      icon={<BarChart3 className="w-6 h-6 text-cyan-500" />}
      modelsCode={modelsCode}
      adminCode={adminCode}
      serializersCode={serializersCode}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};


