"""
pos/admin.py
پنل ادمین صندوق فروشگاهی، پایانه‌ها، شیفت‌ها و صدور فاکتور
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import PosRegister, PosShift, PosSale, PosSaleItem


class PosSaleItemInline(admin.TabularInline):
    model = PosSaleItem
    extra = 0
    readonly_fields = ('product', 'unit_type', 'quantity', 'unit_price', 'subtotal')


@admin.register(PosRegister)
class PosRegisterAdmin(admin.ModelAdmin):
    list_display = ('name', 'terminal_code', 'ip_address', 'status')
    list_filter = ('status',)
    search_fields = ('name', 'terminal_code')


@admin.register(PosShift)
class PosShiftAdmin(admin.ModelAdmin):
    list_display = ('id', 'cashier', 'register', 'status', 'opening_cash_display', 'closing_cash_display', 'cash_discrepancy_display', 'opened_at')
    list_filter = ('status', 'register', 'opened_at')
    search_fields = ('cashier__full_name', 'cashier__phone')

    def opening_cash_display(self, obj):
        return f"{obj.opening_cash:,} تومان"
    opening_cash_display.short_description = "موجودی اولیه"

    def closing_cash_display(self, obj):
        if obj.closing_cash is not None:
            return f"{obj.closing_cash:,} تومان"
        return "-"
    closing_cash_display.short_description = "موجودی نهایی"

    def cash_discrepancy_display(self, obj):
        if obj.cash_discrepancy == 0:
            return format_html('<span style="color: green;">بدون مغایرت (تراز)</span>')
        elif obj.cash_discrepancy < 0:
            return format_html(f'<span style="color: red; font-weight: bold;">کسری: {abs(obj.cash_discrepancy):,} تومان</span>')
        return format_html(f'<span style="color: blue; font-weight: bold;">مازاد: {obj.cash_discrepancy:,} تومان</span>')
    cash_discrepancy_display.short_description = "مغایرت صندوق"


@admin.register(PosSale)
class PosSaleAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'cashier', 'payment_method', 'total_amount_display', 'final_amount_display', 'created_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('invoice_number', 'pos_card_ref', 'cashier__full_name')
    inlines = [PosSaleItemInline]

    def total_amount_display(self, obj):
        return f"{obj.total_amount:,} تومان"
    total_amount_display.short_description = "مبلغ کل"

    def final_amount_display(self, obj):
        return format_html(f'<b style="color: #10b981;">{obj.final_amount:,} تومان</b>')
    final_amount_display.short_description = "مبلغ نهایی"
