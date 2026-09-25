"""
kavenegar_sms/admin.py
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import KavenegarSMSSetting, SMSPattern, SmsLog


class SMSPatternInline(admin.TabularInline):
    model = SMSPattern
    extra = 1


@admin.register(KavenegarSMSSetting)
class KavenegarSMSSettingAdmin(admin.ModelAdmin):
    list_display = ('name', 'api_token_preview')
    inlines = [SMSPatternInline]

    def api_token_preview(self, obj):
        if obj.api_token:
            return f"{obj.api_token[:30]}..."
        return "-"
    api_token_preview.short_description = "API Token"


@admin.register(SmsLog)
class SmsLogAdmin(admin.ModelAdmin):
    list_display = ('shamsi_created_at', 'recipient_phone', 'pattern', 'kavenegar_message_id', 'status_badge')
    list_filter = ('status', 'pattern', 'created_at')
    search_fields = ('recipient_phone', 'kavenegar_message_id')
    readonly_fields = ('created_at', 'shamsi_created_at', 'tokens_sent', 'kavenegar_message_id')

    def shamsi_created_at(self, obj):
        if not obj.created_at:
            return "-"
        from django.utils import timezone
        local_dt = timezone.localtime(obj.created_at)
        gy, gm, gd = local_dt.year, local_dt.month, local_dt.day
        g_a = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 335]
        g_dy = gd + g_a[gm]
        if (gy % 4 == 0) and gm > 2:
            g_dy += 1
        if g_dy <= 79:
            if (gy - 1) % 4 == 0:
                g_dy += 1
            g_dy += 286
            jy = gy - 622
        else:
            g_dy -= 79
            jy = gy - 621
        if g_dy <= 186:
            jm = 1 + (g_dy - 1) // 31
            jd = 1 + (g_dy - 1) % 31
        else:
            g_dy -= 186
            jm = 7 + (g_dy - 1) // 30
            jd = 1 + (g_dy - 1) % 30
        return f"{jy}/{jm:02d}/{jd:02d} - {local_dt.strftime('%H:%M:%S')}"
    shamsi_created_at.short_description = "زمان ارسال (شمسی)"

    def status_badge(self, obj):
        colors = {'queued': '#64748b', 'sent': '#3b82f6', 'delivered': '#10b981', 'failed': '#ef4444'}
        return format_html(
            f'<span style="background-color: {colors.get(obj.status, "#64748b")}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">'
            f'{obj.get_status_display()}</span>'
        )
    status_badge.short_description = "وضعیت"
