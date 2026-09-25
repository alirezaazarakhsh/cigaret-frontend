"""
orders/admin.py
مدیریت کامل پیش‌فاکتورها، تأیید فیش بانکی، صدور بیجک باربری و گزارشات مالی در ادمین جنگو
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import Order, OrderItem, PaymentReceipt


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'unit', 'quantity', 'unit_price', 'discount_percent', 'total_price')


class PaymentReceiptInline(admin.StackedInline):
    model = PaymentReceipt
    extra = 0
    fields = ('bank_name', 'tracking_number', 'amount', 'receipt_image', 'is_verified', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'tracking_code',
        'customer_name',
        'business_name',
        'customer_phone',
        'city',
        'final_payable_display',
        'status_badge',
        'shipping_method',
        'created_at'
    )
    list_filter = ('status', 'shipping_method', 'province', 'created_at')
    search_fields = ('tracking_code', 'customer_name', 'customer_phone', 'business_name', 'freight_waybill_number')
    inlines = [OrderItemInline, PaymentReceiptInline]
    readonly_fields = ('tracking_code', 'total_amount', 'discount_amount', 'final_payable', 'created_at', 'updated_at')

    fieldsets = (
        (_('اطلاعات سند پیش‌فاکتور'), {
            'fields': ('tracking_code', 'status', 'created_at', 'updated_at')
        }),
        (_('مشخصات بنکدار و خریدار'), {
            'fields': ('user', 'customer_name', 'business_name', 'customer_phone')
        }),
        (_('آدرس تخلیه و باربری'), {
            'fields': ('province', 'city', 'destination_address', 'shipping_method', 'shipping_cost', 'freight_waybill_number')
        }),
        (_('حسابداری و مبالغ نهایی'), {
            'fields': ('total_amount', 'discount_amount', 'final_payable', 'admin_notes')
        }),
    )

    actions = ['mark_as_paid_send_warehouse', 'mark_as_dispatched', 'generate_official_pdf']

    @admin.display(description=_("مبلغ نهایی"))
    def final_payable_display(self, obj):
        return f"{obj.final_payable:,} تومان"

    @admin.display(description=_("وضعیت سفارش"))
    def status_badge(self, obj):
        status_colors = {
            'proforma_issued': '#f59e0b',
            'receipt_uploaded': '#3b82f6',
            'payment_verified': '#10b981',
            'warehouse_packing': '#8b5cf6',
            'dispatched': '#059669',
            'delivered': '#047857',
            'cancelled': '#ef4444',
        }
        color = status_colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display()
        )

    @admin.action(description=_("✔ تأیید پرداخت مالی و ارجاع به انبار جنت‌آباد"))
    def mark_as_paid_send_warehouse(self, request, queryset):
        count = queryset.update(status='payment_verified')
        self.message_user(request, f"{count} سفارش جهت پلمپ و بارگیری به انبار جنت‌آباد ارجاع شد.")

    @admin.action(description=_("🚚 ثبت خروج بار و تحویل به باربری / ناوگان"))
    def mark_as_dispatched(self, request, queryset):
        count = queryset.update(status='dispatched')
        self.message_user(request, f"{count} سفارش به عنوان تحویل باربری ثبت شد.")
