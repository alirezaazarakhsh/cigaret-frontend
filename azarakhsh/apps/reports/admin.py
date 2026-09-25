"""
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
