"""
visitors/admin.py
مدیریت پیشرفته ویزیتوران، باشگاه مشتریان و گزارش سود در پنل جنگو
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import VisitorProfile, RetailShopCustomer, VisitorCommissionLog


@admin.register(VisitorProfile)
class VisitorProfileAdmin(admin.ModelAdmin):
    list_display = ('visitor_code', 'get_full_name', 'commission_rate', 'total_sales_amount', 'total_commission_earned', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('visitor_code', 'user__full_name', 'user__phone')
    actions = ['activate_visitors', 'deactivate_visitors']

    @admin.display(description=_("نام ویزیتور"))
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.phone

    @admin.action(description=_("✔ فعال‌سازی ویزیتوران انتخاب شده"))
    def activate_visitors(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description=_("⛔ غیرفعال‌سازی ویزیتوران"))
    def deactivate_visitors(self, request, queryset):
        queryset.update(is_active=False)


@admin.register(RetailShopCustomer)
class RetailShopCustomerAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'owner_name', 'phone', 'city', 'get_visitor_code', 'total_purchases', 'created_at')
    list_filter = ('city', 'created_at')
    search_fields = ('shop_name', 'owner_name', 'phone', 'visitor__visitor_code')

    @admin.display(description=_("کد ویزیتور معرف"))
    def get_visitor_code(self, obj):
        return obj.visitor.visitor_code


@admin.register(VisitorCommissionLog)
class VisitorCommissionLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_visitor_code', 'get_shop_name', 'sale_amount', 'commission_amount', 'is_settled', 'created_at')
    list_filter = ('is_settled', 'created_at')
    search_fields = ('visitor__visitor_code', 'order__order_id', 'retail_shop__shop_name')
    actions = ['mark_as_settled']

    @admin.display(description=_("کد ویزیتور"))
    def get_visitor_code(self, obj):
        return obj.visitor.visitor_code

    @admin.display(description=_("مغازه خریدار"))
    def get_shop_name(self, obj):
        return obj.retail_shop.shop_name if obj.retail_shop else 'خرید مستقیم'

    @admin.action(description=_("💰 تأیید تسویه حساب کمیسیون با ویزیتور"))
    def mark_as_settled(self, request, queryset):
        queryset.update(is_settled=True)
