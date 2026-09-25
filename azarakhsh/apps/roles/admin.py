"""
roles/admin.py
پنل ادمین پرسنل و لاگ‌های امنیتی
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import StaffProfile, SecurityAuditLog


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'staff_code', 'role_badge', 'can_apply_custom_discount', 'max_discount_percent', 'is_active_staff')
    list_filter = ('role', 'is_active_staff', 'can_apply_custom_discount')
    search_fields = ('user__full_name', 'user__phone', 'staff_code')
    list_editable = ('is_active_staff',)

    def role_badge(self, obj):
        colors = {
            'super_admin': '#ef4444',
            'warehouse_manager': '#10b981',
            'cashier': '#3b82f6',
            'accountant': '#8b5cf6',
            'visitor': '#f59e0b'
        }
        return format_html(
            f'<span style="background-color: {colors.get(obj.role, "#64748b")}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">'
            f'{obj.get_role_display()}</span>'
        )
    role_badge.short_description = "نقش سازمانی"


@admin.register(SecurityAuditLog)
class SecurityAuditLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'staff', 'action_type', 'target_model', 'target_id', 'ip_address')
    list_filter = ('action_type', 'target_model', 'created_at')
    search_fields = ('staff__user__full_name', 'action_type', 'target_id')
    readonly_fields = ('created_at',)
