"""
finance/admin.py
پنل ادمین حساب‌های دفتری و چک‌ها با تاریخ شمسی
"""
from django.contrib import admin
from django.utils.html import format_html
from jalali_date.admin import ModelAdminJalaliMixin
from jalali_date import datetime2jalali, date2jalali
from .models import CustomerLedger, LedgerTransaction, ChequeRecord


class LedgerTransactionInline(admin.TabularInline):
    model = LedgerTransaction
    extra = 0
    readonly_fields = ('created_at', 'transaction_type', 'document_ref', 'debit_amount', 'credit_amount', 'balance_after', 'recorded_by', 'description')


@admin.register(CustomerLedger)
class CustomerLedgerAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    list_display = ('customer', 'credit_limit_display', 'current_balance_display', 'is_blocked', 'last_settled_at_jalali')
    list_filter = ('is_blocked',)
    search_fields = ('customer__full_name', 'customer__phone', 'customer__business_name')
    autocomplete_fields = ('customer',)
    inlines = [LedgerTransactionInline]

    def credit_limit_display(self, obj):
        return f"{obj.credit_limit:,} تومان"
    credit_limit_display.short_description = "سقف اعتبار"

    def current_balance_display(self, obj):
        color = 'red' if obj.current_balance > 0 else 'green'
        return format_html(f'<b style="color: {color};">{obj.current_balance:,} تومان</b>')
    current_balance_display.short_description = "مانده بدهی جاری"

    @admin.display(description="تاریخ آخرین تسویه کامل", ordering='last_settled_at')
    def last_settled_at_jalali(self, obj):
        if obj.last_settled_at:
            return datetime2jalali(obj.last_settled_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"


@admin.register(LedgerTransaction)
class LedgerTransactionAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    list_display = ('created_at_jalali', 'ledger', 'transaction_type', 'document_ref', 'debit_amount', 'credit_amount', 'balance_after')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('document_ref', 'ledger__customer__full_name', 'description')
    readonly_fields = ('created_at_jalali_display',)
    autocomplete_fields = ('ledger', 'recorded_by')

    @admin.display(description="تاریخ تراکنش", ordering='created_at')
    def created_at_jalali(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"

    @admin.display(description="زمان ثبت سند")
    def created_at_jalali_display(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"


@admin.register(ChequeRecord)
class ChequeRecordAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    list_display = ('sayad_number', 'ledger', 'bank_name', 'amount_display', 'due_date_jalali', 'status_badge')
    list_filter = ('status', 'bank_name', 'due_date')
    search_fields = ('sayad_number', 'ledger__customer__full_name')
    autocomplete_fields = ('ledger',)

    def amount_display(self, obj):
        return f"{obj.amount:,} تومان"
    amount_display.short_description = "مبلغ چک"

    def status_badge(self, obj):
        colors = {'pending': '#f59e0b', 'passed': '#10b981', 'bounced': '#ef4444', 'returned': '#64748b'}
        return format_html(
            f'<span style="background-color: {colors.get(obj.status, "#64748b")}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">'
            f'{obj.get_status_display()}</span>'
        )
    status_badge.short_description = "وضعیت"

    @admin.display(description="تاریخ سررسید", ordering='due_date')
    def due_date_jalali(self, obj):
        if obj.due_date:
            return date2jalali(obj.due_date).strftime('%Y/%m/%d')
        return "-"
