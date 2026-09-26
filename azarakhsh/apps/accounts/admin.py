"""
accounts/admin.py
ثبت و پیکربندی کامل مدل کاربر در پنل مدیریت پیشرفته جنگو با فیلترها و عملیات اختصاصی
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from jalali_date.admin import ModelAdminJalaliMixin
from jalali_date import datetime2jalali
from .models import User, PhoneOTP


@admin.register(User)
class UserAdmin(ModelAdminJalaliMixin, BaseUserAdmin):
    list_display = (
        'phone', 
        'full_name', 
        'business_name', 
        'role_badge', 
        'visitor_status_badge',
        'verification_status', 
        'city', 
        'province', 
        'date_joined_jalali', 
        'is_active'
    )
    list_filter = ('is_visitor', 'role', 'is_verified', 'is_active', 'province', 'date_joined')
    search_fields = ('phone', 'full_name', 'business_name', 'visitor_code', 'national_id', 'business_license')
    ordering = ('-date_joined',)

    fieldsets = (
        (_('اطلاعات هویتی و شماره'), {
            'fields': ('phone', 'full_name', 'business_name', 'role')
        }),
        (_('دسترسی و امکانات ویزیتور و بازاریاب'), {
            'fields': ('is_visitor', 'visitor_code', 'commission_rate', 'total_sales_amount', 'total_commission_earned')
        }),
        (_('احراز هویت بنکداری و اسناد رسمی'), {
            'fields': ('is_verified', 'national_id', 'business_license')
        }),
        (_('آدرس پیش‌فرض جهت بارگیری و تخلیه'), {
            'fields': ('province', 'city', 'address', 'postal_code')
        }),
        (_('دسترسی‌ها و وضعیت'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('تاریخ‌ها'), {
            'fields': ('last_login', 'date_joined')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'full_name', 'business_name', 'role', 'is_visitor', 'is_verified', 'is_staff'),
        }),
    )

    actions = ['enable_visitor_access', 'disable_visitor_access', 'make_verified_wholesaler', 'deactivate_users']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # پرسنل صِرف صندوق‌دار (که فقط در اپلیکیشن posuser تعریف شده‌اند) را از لیست کاربران اصلی و بنکداران فیلتر می‌کند تا لیست شلوغ نشود
        return qs.filter(pos_profile__isnull=True)

    @admin.display(description=_("نقش کاربر"))
    def role_badge(self, obj):
        colors = {
            'admin': 'bg-red-700 text-white',
            'warehouse_manager': 'bg-amber-600 text-white',
            'sales_agent': 'bg-blue-600 text-white',
            'wholesaler': 'bg-emerald-700 text-white',
            'guest': 'bg-gray-500 text-white',
        }
        bg = colors.get(obj.role, 'bg-gray-600')
        return format_html(
            '<span style="padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px; background-color: #2563eb; color: #fff;">{}</span>',
            obj.get_role_display()
        )

    @admin.display(description=_("وضعیت ویزیتوری"))
    def visitor_status_badge(self, obj):
        if obj.is_visitor:
            code = obj.visitor_code or 'فعال'
            return format_html(f'<span style="padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px; background-color: #059669; color: #fff;">✔ ویزیتور ({code})</span>')
        return format_html('<span style="color: #9ca3af; font-size: 11px;">مشتری عادی</span>')

    @admin.display(description=_("احراز هویت بنکداری"))
    def verification_status(self, obj):
        if obj.is_verified:
            return format_html('<span style="color: #10b981; font-weight: bold;">✔ تأیید شده</span>')
        return format_html('<span style="color: #f59e0b; font-weight: bold;">⏳ در انتظار مدارک</span>')

    @admin.display(description=_("تاریخ عضویت"), ordering='date_joined')
    def date_joined_jalali(self, obj):
        if obj.date_joined:
            return datetime2jalali(obj.date_joined).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"

    @admin.action(description=_("✔ فعال‌سازی دسترسی ویزیتور برای کاربران انتخاب‌شده"))
    def enable_visitor_access(self, request, queryset):
        count = 0
        for user in queryset:
            user.is_visitor = True
            user.save()
            count += 1
        self.message_user(request, f"دسترسی پنل ویزیتوری برای {count} کاربر فعال شد.")

    @admin.action(description=_("⛔ لغو دسترسی ویزیتوری کاربران انتخاب‌شده"))
    def disable_visitor_access(self, request, queryset):
        count = queryset.update(is_visitor=False)
        self.message_user(request, f"دسترسی ویزیتوری {count} کاربر لغو گردید.")

    @admin.action(description=_("✔ تأیید رسمی بنکداری و اعطای سقف اعتبار"))
    def make_verified_wholesaler(self, request, queryset):
        count = queryset.update(is_verified=True, role='wholesaler')
        self.message_user(request, f"{count} کاربر به عنوان بنکدار رسمی تأیید صلاحیت شدند.")

    @admin.action(description=_("⛔ غیرفعال‌سازی موقت حساب‌های انتخاب شده"))
    def deactivate_users(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} حساب کاربری مسدود شدند.")


@admin.register(PhoneOTP)
class PhoneOTPAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    list_display = ('phone', 'code', 'is_used_display', 'created_at_jalali', 'expires_at_jalali')
    list_filter = ('is_used', 'created_at')
    search_fields = ('phone', 'code')
    readonly_fields = ('created_at',)

    @admin.display(description=_("وضعیت مصرف"))
    def is_used_display(self, obj):
        if obj.is_used:
            return format_html('<span style="color: #ef4444;">مصرف شده</span>')
        if obj.is_valid():
            return format_html('<span style="color: #10b981; font-weight: bold;">فعال و معتبر</span>')
        return format_html('<span style="color: #6b7280;">منقضی شده</span>')

    @admin.display(description=_("زمان ایجاد"), ordering='created_at')
    def created_at_jalali(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"

    @admin.display(description=_("زمان انقضا"), ordering='expires_at')
    def expires_at_jalali(self, obj):
        if obj.expires_at:
            return datetime2jalali(obj.expires_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"
