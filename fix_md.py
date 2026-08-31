import re

with open("DJANGO_POSUSER_APP.md", "r", encoding="utf-8") as f:
    content = f.read()

new_admin = """### ۴. فایل `posuser/admin.py`
برای مدیریت پرسنل و تنظیم پین‌کد (رمز عبور) به‌صورت هش‌شده در پنل ادمین جنگو.

```python
from django import forms
from django.contrib import admin
from .models import PosStaff

class PosStaffAdminForm(forms.ModelForm):
    password = forms.CharField(
        label='رمز عبور / پین‌کد',
        widget=forms.PasswordInput(render_value=True),
        required=False,
        help_text='پین‌کد پرسنل را وارد کنید. موقع ذخیره به‌صورت خودکار هش می‌شود.'
    )

    class Meta:
        model = PosStaff
        fields = '__all__'

@admin.register(PosStaff)
class PosStaffAdmin(admin.ModelAdmin):
    form = PosStaffAdminForm
    list_display = ('user_name', 'user_phone', 'role', 'role_title', 'is_active')
    list_filter = ('role', 'is_active', 'perm_manage_pos', 'perm_manage_inventory')
    search_fields = ('role_title',)
    
    fieldsets = (
        ('اطلاعات پایه و احراز هویت', {
            'fields': ('user', 'password', 'role', 'role_title', 'is_active')
        }),
        ('سطوح دسترسی اختصاصی', {
            'fields': (
                'perm_manage_pos', 'perm_manage_inventory', 'perm_quick_add_product', 
                'perm_manage_ledger', 'perm_view_reports', 'perm_monthly_comparison',
                'perm_customer_app_connect', 'perm_manage_staff', 'perm_send_sms',
                'perm_manage_tickets', 'perm_manage_notifications', 'perm_delete_receipts'
            )
        }),
    )

    def user_name(self, obj):
        if not obj.user:
            return '-'
        return (
            getattr(obj.user, 'first_name', None) or 
            getattr(obj.user, 'full_name', None) or 
            getattr(obj.user, 'phone', None) or 
            getattr(obj.user, 'mobile', None) or 
            getattr(obj.user, 'username', None) or 
            str(obj.user)
        )
    user_name.short_description = 'نام و نام‌خانوادگی'

    def user_phone(self, obj):
        if not obj.user:
            return '-'
        return (
            getattr(obj.user, 'phone', None) or 
            getattr(obj.user, 'mobile', None) or 
            getattr(obj.user, 'phone_number', None) or 
            getattr(obj.user, 'username', None) or 
            str(obj.user)
        )
    user_phone.short_description = 'شماره همراه'
```"""

pattern2 = re.compile(r"### ۴\. فایل `posuser/admin\.py`.*?(?=### ۵\. ثبت اپلیکیشن)", re.DOTALL)
content = pattern2.sub(new_admin + "\n\n", content)

with open("DJANGO_POSUSER_APP.md", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated DJANGO_POSUSER_APP.md admin")
