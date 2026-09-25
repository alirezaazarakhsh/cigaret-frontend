"""
visitor_tickets/admin.py
مدیریت تیکت‌های ویزیتوران و صدور تاییدیه پرداخت کمیسیون
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import VisitorTicket, VisitorTicketReply


class VisitorTicketReplyInline(admin.TabularInline):
    model = VisitorTicketReply
    extra = 1
    readonly_fields = ('created_at',)


@admin.register(VisitorTicket)
class VisitorTicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_code', 'visitor', 'category', 'claimed_amount_display', 'status_badge', 'priority', 'created_at')
    list_filter = ('status', 'category', 'priority', 'created_at')
    search_fields = ('ticket_code', 'visitor__visitor_code', 'visitor__user__full_name', 'subject')
    inlines = [VisitorTicketReplyInline]
    actions = ['mark_as_paid', 'mark_under_review']

    def claimed_amount_display(self, obj):
        return f"{obj.claimed_amount:,} تومان" if obj.claimed_amount else "-"
    claimed_amount_display.short_description = "مبلغ ادعایی"

    def status_badge(self, obj):
        colors = {
            'submitted': 'orange',
            'under_review': 'blue',
            'paid': 'green',
            'rejected': 'red',
            'closed': 'gray',
        }
        color = colors.get(obj.status, 'black')
        return format_html(f'<b style="color: {color};">{obj.get_status_display()}</b>')
    status_badge.short_description = "وضعیت"

    def mark_as_paid(self, request, queryset):
        queryset.update(status='paid')
        self.message_user(request, "تیکت‌های انتخاب‌شده به وضعیت کمیسیون تسویه شد تغییر یافتند.")
    mark_as_paid.short_description = "تسویه و پرداخت کمیسیون"
