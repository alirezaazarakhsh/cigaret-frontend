"""
tickets/admin.py
مدیریت تیکت‌ها در پنل ادمین جنگو، پاسخگویی آنلاین و تغییر وضعیت تیکت
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import SupportTicket, TicketMessage


class TicketMessageInline(admin.StackedInline):
    model = TicketMessage
    extra = 1
    fields = ('sender', 'is_staff_reply', 'message', 'attachment', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = (
        'ticket_number',
        'title',
        'user',
        'department',
        'priority_badge',
        'status_badge',
        'order_tracking_code',
        'updated_at'
    )
    list_filter = ('department', 'priority', 'status', 'created_at')
    search_fields = ('ticket_number', 'title', 'user__phone', 'user__full_name', 'order_tracking_code')
    inlines = [TicketMessageInline]
    readonly_fields = ('ticket_number', 'created_at', 'updated_at')

    @admin.display(description=_("اولویت"))
    def priority_badge(self, obj):
        colors = {
            'low': '#6b7280',
            'medium': '#3b82f6',
            'high': '#f59e0b',
            'critical': '#ef4444',
        }
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-size: 10px;">{}</span>',
            colors.get(obj.priority, '#6b7280'),
            obj.get_priority_display()
        )

    @admin.display(description=_("وضعیت"))
    def status_badge(self, obj):
        colors = {
            'open': '#f59e0b',
            'answered': '#10b981',
            'customer_reply': '#3b82f6',
            'in_progress': '#8b5cf6',
            'closed': '#6b7280',
        }
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-size: 10px;">{}</span>',
            colors.get(obj.status, '#6b7280'),
            obj.get_status_display()
        )
