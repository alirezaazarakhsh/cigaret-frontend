from django import forms
from django.contrib import admin

from .models import PosStaff


class PosStaffAdminForm(forms.ModelForm):
    password = forms.CharField(
        label='رمز عبور / پین‌کد',
        widget=forms.PasswordInput(
            render_value=False
        ),
        required=False,
        help_text=(
            'در صورت وارد کردن رمز جدید، رمز به‌صورت خودکار '
            'هش شده و روی همین کاربر ذخیره می‌شود. '
            'برای حفظ رمز فعلی، این فیلد را خالی بگذارید.'
        )
    )

    class Meta:
        model = PosStaff
        fields = '__all__'


@admin.register(PosStaff)
class PosStaffAdmin(admin.ModelAdmin):

    form = PosStaffAdminForm

    list_display = (
        'user_name',
        'user_phone',
        'role',
        'role_title',
        'is_active',
    )

    list_filter = (
        'role',
        'is_active',
        'perm_manage_pos',
        'perm_manage_inventory',
    )

    search_fields = (
        'role_title',
        'user__full_name',
        'user__first_name',
        'user__phone',
        'user__username',
    )

    autocomplete_fields = (
        'user',
    )

    fieldsets = (
        (
            'اطلاعات پایه و احراز هویت',
            {
                'fields': (
                    'user',
                    'password',
                    'role',
                    'role_title',
                    'is_active',
                )
            }
        ),

        (
            'سطوح دسترسی اختصاصی',
            {
                'fields': (
                    'perm_manage_pos',
                    'perm_manage_inventory',
                    'perm_quick_add_product',
                    'perm_manage_ledger',
                    'perm_view_reports',
                    'perm_monthly_comparison',
                    'perm_customer_app_connect',
                    'perm_manage_staff',
                    'perm_send_sms',
                    'perm_manage_tickets',
                    'perm_manage_notifications',
                    'perm_manage_warehouse_messages',
                    'perm_manage_site_settings',
                    'perm_manage_sliders',
                    'perm_manage_footer_settings',
                    'perm_delete_receipts',
                )
            }
        ),
    )

    # =========================================================
    # ذخیره PosStaff
    # =========================================================

    def save_model(self, request, obj, form, change):
        """
        ذخیره اطلاعات پرسنل.

        اگر Password وارد شده باشد:
        فقط User متصل به همین PosStaff و خود PosStaff تغییر می‌کند.

        اگر Password خالی باشد:
        رمز قبلی کاملاً دست‌نخورده باقی می‌ماند.
        """

        raw_password = form.cleaned_data.get('password')

        # اگر رمز جدید وارد شده باشد
        if raw_password:
            raw_password = raw_password.strip()

            if raw_password:
                # استفاده از متد set_password خود PosStaff
                #
                # این متد:
                # 1. password خود PosStaff را Hash می‌کند
                # 2. فقط User متصل به همین PosStaff را تغییر می‌دهد
                obj.set_password(raw_password)

        # ذخیره PosStaff
        super().save_model(
            request,
            obj,
            form,
            change
        )

    # =========================================================
    # نام کاربر
    # =========================================================

    @admin.display(
        description='نام و نام‌خانوادگی',
        ordering='user__full_name'
    )
    def user_name(self, obj):

        if not obj.user_id:
            return '-'

        user = obj.user

        return (
            getattr(user, 'full_name', None)
            or getattr(user, 'first_name', None)
            or getattr(user, 'phone', None)
            or getattr(user, 'mobile', None)
            or getattr(user, 'username', None)
            or str(user)
        )

    # =========================================================
    # شماره همراه
    # =========================================================

    @admin.display(
        description='شماره همراه',
        ordering='user__phone'
    )
    def user_phone(self, obj):

        if not obj.user_id:
            return '-'

        user = obj.user

        return (
            getattr(user, 'phone', None)
            or getattr(user, 'mobile', None)
            or getattr(user, 'phone_number', None)
            or getattr(user, 'username', None)
            or str(user)
        )