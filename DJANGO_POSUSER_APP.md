# مستندات و کدهای بک‌اند جنگو برای اپلیکیشن `posuser` (مدیریت صندوق‌داران)

این فایل شامل کدهایی است که باید در سرور جنگو قرار دهید تا اپلیکیشن `posuser` به درستی کار کند و اطلاعات مدیران انبار/صندوق‌داران مستقیماً در دیتابیس ثبت شود.

برای شروع در ترمینال سرور جنگو دستور زیر را بزنید تا اپلیکیشن ساخته شود:
```bash
python manage.py startapp posuser
```

سپس کدهای زیر را در فایل‌های مربوطه در پوشه `posuser` کپی کنید:

---

### ۱. فایل `posuser/models.py`
این فایل ساختار دیتابیس صندوق‌داران را مشخص می‌کند و آنها را به جدول اصلی کاربران متصل می‌کند.

```python
from django.db import models
from django.conf import settings

class PosStaff(models.Model):
    ROLE_CHOICES = (
        ('warehouse_manager', 'مدیر انبار و بنکداری'),
        ('cashier', 'صندوق‌دار فروشگاه'),
        ('accountant', 'حسابدار و بازرس مالی'),
        ('super_admin', 'مدیر ارشد سامانه'),
    )
    
    # اتصال به هسته اصلی کاربران
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pos_profile', verbose_name='کاربر')
    
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='cashier', verbose_name='نقش سازمانی پیش‌فرض')
    role_title = models.CharField(max_length=100, blank=True, null=True, verbose_name='عنوان فارسی سمت')
    is_active = models.BooleanField(default=True, verbose_name='وضعیت فعالیت')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ثبت')

    # دسترسی‌های اختصاصی پنل (Permissions)
    perm_manage_pos = models.BooleanField(default=False, verbose_name='فروش و صندوق')
    perm_manage_inventory = models.BooleanField(default=False, verbose_name='مدیریت و انبارداری')
    perm_quick_add_product = models.BooleanField(default=False, verbose_name='تعریف سریع کالا')
    perm_manage_ledger = models.BooleanField(default=False, verbose_name='حساب‌های دفتری و نسیه')
    perm_view_reports = models.BooleanField(default=False, verbose_name='گزارشات و آمار فروش')
    perm_monthly_comparison = models.BooleanField(default=False, verbose_name='تحلیل مقایسه‌ای ماه‌ها')
    perm_customer_app_connect = models.BooleanField(default=False, verbose_name='باشگاه مشتریان و اپلیکیشن')
    perm_manage_staff = models.BooleanField(default=False, verbose_name='مدیریت پرسنل و دسترسی‌ها')
    perm_send_sms = models.BooleanField(default=False, verbose_name='سامانه پیامکی کاوه‌نگار')
    perm_manage_tickets = models.BooleanField(default=False, verbose_name='پاسخگویی به تیکت‌ها')
    perm_manage_notifications = models.BooleanField(default=False, verbose_name='اعلانات و نوتیفیکیشن‌ها')
    perm_delete_receipts = models.BooleanField(default=False, verbose_name='ابطال و حذف فاکتورها')

    class Meta:
        verbose_name = 'پرسنل صندوق و انبار'
        verbose_name_plural = 'لیست پرسنل صندوق و انبار'

    def __str__(self):
        return f"{self.user.first_name} ({self.get_role_display()})"
```

---

### ۲. فایل `posuser/views.py`
این فایل وظیفه دریافت اطلاعات از فرانت‌اند (ری‌اکت) و ساخت کاربر در دیتابیس را بر عهده دارد.

```python
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import PosStaff

User = get_user_model()

# Helper for setting tokens in cookies
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@csrf_exempt
def login_staff_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            phone = data.get('phone')
            password = data.get('password')

            if not phone or not password:
                return JsonResponse({"success": False, "message": "شماره همراه و پین‌کد الزامی است."}, status=400)

            user = authenticate(request, username=phone, password=password)
            if user is not None:
                tokens = get_tokens_for_user(user)
                
                # Check if user has a PosStaff profile
                try:
                    pos_staff = user.pos_profile
                    role = pos_staff.role
                    role_title = pos_staff.role_title
                    permissions = []
                    # Extract active permissions
                    if pos_staff.perm_manage_pos: permissions.append('manage_pos')
                    if pos_staff.perm_manage_inventory: permissions.append('manage_inventory')
                    if pos_staff.perm_quick_add_product: permissions.append('quick_add_product')
                    if pos_staff.perm_manage_ledger: permissions.append('manage_ledger')
                    if pos_staff.perm_view_reports: permissions.append('view_reports')
                    if pos_staff.perm_monthly_comparison: permissions.append('monthly_comparison')
                    if pos_staff.perm_customer_app_connect: permissions.append('customer_app_connect')
                    if pos_staff.perm_manage_staff: permissions.append('manage_staff')
                    if pos_staff.perm_send_sms: permissions.append('send_sms')
                    if pos_staff.perm_manage_tickets: permissions.append('manage_tickets')
                    if pos_staff.perm_manage_notifications: permissions.append('manage_notifications')
                    if pos_staff.perm_delete_receipts: permissions.append('delete_receipts')
                except PosStaff.DoesNotExist:
                    # User is a regular Django user but not explicitly a POS staff.
                    # We can allow them if they are superuser.
                    if user.is_superuser:
                        role = 'super_admin'
                        role_title = 'مدیر ارشد سیستم'
                        permissions = [
                            'manage_pos', 'manage_inventory', 'quick_add_product', 'manage_ledger',
                            'view_reports', 'monthly_comparison', 'customer_app_connect',
                            'manage_staff', 'send_sms', 'manage_tickets', 'manage_notifications', 'delete_receipts'
                        ]
                    else:
                        return JsonResponse({"success": False, "message": "شما دسترسی به صندوق فروشگاهی را ندارید."}, status=403)

                response_data = {
                    "success": True,
                    "message": "ورود موفقیت‌آمیز بود.",
                    "data": {
                        "user": {
                            "id": user.id,
                            "phone": user.username,
                            "fullName": user.first_name,
                            "role": role,
                            "roleTitleFa": role_title,
                            "permissions": permissions,
                            "status": "active" if user.is_active else "suspended"
                        },
                        "tokens": tokens # Tokens can be used in headers if cookie doesn't work well across domains
                    }
                }
                response = JsonResponse(response_data)
                response.set_cookie('access', tokens['access'], httponly=True, samesite='Lax')
                response.set_cookie('refresh', tokens['refresh'], httponly=True, samesite='Lax')
                return response
            else:
                return JsonResponse({"success": False, "message": "شماره همراه یا رمز عبور اشتباه است."}, status=401)
        except Exception as e:
            return JsonResponse({"success": False, "message": f"خطای سرور: {str(e)}"}, status=500)
    return JsonResponse({"success": False, "message": "Method Not Allowed"}, status=405)

@csrf_exempt
def logout_staff_api(request):
    if request.method == 'POST':
        response = JsonResponse({"success": True, "message": "خروج موفقیت‌آمیز بود."})
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response
    return JsonResponse({"success": False, "message": "Method Not Allowed"}, status=405)

@csrf_exempt
def create_staff_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            phone = data.get('phone')
            full_name = data.get('full_name')
            password = data.get('password') # پین‌کد وارد شده در فرانت‌اند
            role = data.get('role', 'cashier')
            role_title = data.get('roleTitleFa', 'صندوق‌دار')
            permissions = data.get('permissions', []) # آرایه‌ای از رشته‌های دسترسی

            if not phone or not password:
                return JsonResponse({"success": False, "message": "شماره همراه و پین‌کد الزامی است."}, status=400)

            # ۱. ساخت هسته کاربر در دیتابیس Accounts (برای امکان لاگین)
            # اگر در سیستم شما شماره تماس فیلد phone است، username را به phone تغییر دهید
            if User.objects.filter(username=phone).exists():
                return JsonResponse({"success": False, "message": "این شماره همراه قبلاً در سیستم ثبت شده است."}, status=400)

            user = User.objects.create_user(username=phone, password=password)
            user.first_name = full_name
            
            # مدیریت دسترسی سوپراڈمین
            if role == 'super_admin':
                user.is_staff = True
                user.is_superuser = True
            else:
                user.is_staff = True 
            user.save()

            # ۲. مپ کردن آرایه دسترسی‌ها به فیلدهای بولی مدل
            perms_map = {
                'perm_manage_pos': 'manage_pos' in permissions,
                'perm_manage_inventory': 'manage_inventory' in permissions,
                'perm_quick_add_product': 'quick_add_product' in permissions,
                'perm_manage_ledger': 'manage_ledger' in permissions,
                'perm_view_reports': 'view_reports' in permissions,
                'perm_monthly_comparison': 'monthly_comparison' in permissions,
                'perm_customer_app_connect': 'customer_app_connect' in permissions,
                'perm_manage_staff': 'manage_staff' in permissions,
                'perm_send_sms': 'send_sms' in permissions,
                'perm_manage_tickets': 'manage_tickets' in permissions,
                'perm_manage_notifications': 'manage_notifications' in permissions,
                'perm_delete_receipts': 'delete_receipts' in permissions,
            }

            # ۳. ساخت پروفایل اختصاصی در اپلیکیشن posuser
            PosStaff.objects.create(
                user=user,
                role=role,
                role_title=role_title,
                **perms_map
            )

            return JsonResponse({"success": True, "message": "پرسنل صندوق با موفقیت در دیتابیس ثبت شد."})

        except Exception as e:
            return JsonResponse({"success": False, "message": f"خطای سرور: {str(e)}"}, status=500)
            
    return JsonResponse({"success": False, "message": "Method Not Allowed"}, status=405)
```

---

### ۳. فایل `posuser/urls.py`
این فایل مسیر دریافت درخواست API را مشخص می‌کند. (ابتدا این فایل را در پوشه `posuser` بسازید)

```python
from django.urls import path
from .views import create_staff_api, login_staff_api, logout_staff_api

urlpatterns = [
    # آدرس‌های فراخوانی فرانت‌اند: /api/v1/posuser/...
    path('login/', login_staff_api, name='login-staff'),
    path('logout/', logout_staff_api, name='logout-staff'),
    path('create-staff/', create_staff_api, name='create-staff'),
]
```

**مهم:** حالا باید در فایل `urls.py` اصلی پروژه جنگو (کنار فایل `settings.py`)، این مسیر را اضافه کنید:
```python
from django.urls import path, include

urlpatterns = [
    # ... بقیه مسیرهای شما ...
    path('api/v1/posuser/', include('posuser.urls')),
]
```

---

### ۴. فایل `posuser/admin.py`
برای اینکه صندوق‌داران در پنل ادمین جنگو در یک بخش مجزا، زیبا و منظم نمایش داده شوند.

```python
from django.contrib import admin
from .models import PosStaff

@admin.register(PosStaff)
class PosStaffAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_phone', 'role', 'role_title', 'is_active')
    list_filter = ('role', 'is_active', 'perm_manage_pos', 'perm_manage_inventory')
    search_fields = ('user__username', 'user__first_name', 'role_title')
    
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('user', 'role', 'role_title', 'is_active')
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
        return obj.user.first_name
    user_name.short_description = 'نام و نام‌خانوادگی'

    def user_phone(self, obj):
        return obj.user.username
    user_phone.short_description = 'شماره همراه'
```

---

### ۵. ثبت اپلیکیشن و ساخت جداول دیتابیس
در نهایت در فایل `settings.py` جنگو، اپلیکیشن جدید را اضافه کنید:
```python
INSTALLED_APPS = [
    # ...
    'posuser',
]
```

و در ترمینال سرور دستورات زیر را اجرا کنید تا جداول ساخته شوند:
```bash
python manage.py makemigrations posuser
python manage.py migrate
```
