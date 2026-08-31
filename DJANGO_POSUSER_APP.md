# مستندات و کدهای بک‌اند جنگو برای اپلیکیشن `posuser` (مدیریت صندوق‌داران)

این فایل شامل کدهایی است که باید در سرور جنگو قرار دهید تا اپلیکیشن `posuser` به درستی کار کند و اطلاعات مدیران انبار/صندوق‌داران مستقیماً در دیتابیس ثبت شود.

برای شروع در ترمینال سرور جنگو دستور زیر را بزنید تا اپلیکیشن ساخته شود:
```bash
python manage.py startapp posuser
```

سپس کدهای زیر را در فایل‌های مربوطه در پوشه `posuser` کپی کنید:

---

### ۱. فایل `posuser/models.py`
این فایل جداول مربوط به پرسنل صندوق، نقش‌ها، رمز عبور هش‌شده و دسترسی‌های آن‌ها را تعریف می‌کند.

```python
from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import make_password

class PosStaff(models.Model):
    ROLE_CHOICES = (
        ('warehouse_manager', 'مدیر انبار و بنکداری'),
        ('cashier', 'صندوق‌دار فروشگاه'),
        ('accountant', 'حسابدار و بازرس مالی'),
        ('super_admin', 'مدیر ارشد سامانه'),
    )
    
    # اتصال به هسته اصلی کاربران
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pos_profile', verbose_name='کاربر')
    
    # فیلد رمز عبور / پین‌کد اختصاصی (هش‌شده)
    password = models.CharField(max_length=128, blank=True, null=True, verbose_name='رمز عبور / پین‌کد (هش‌شده)')
    
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

    def save(self, *args, **kwargs):
        # اگر رمز عبور وارد شده و هنوز هش نشده باشد
        if self.password and not (self.password.startswith('pbkdf2_') or self.password.startswith('argon2')):
            raw_password = self.password
            self.password = make_password(raw_password)
            # همگام‌سازی رمز عبور با کاربر اصلی (User)
            if self.user_id:
                self.user.set_password(raw_password)
                self.user.save()
        super().save(*args, **kwargs)

    def __str__(self):
        name = getattr(self.user, 'first_name', None) or getattr(self.user, 'full_name', None) or getattr(self.user, 'username', str(self.user))
        return f"{name} ({self.get_role_display()})"
```

### ۲. فایل `posuser/views.py`
این فایل وظیفه دریافت اطلاعات از فرانت‌اند (ری‌اکت)، ثبت و احراز هویت را بر عهده دارد (با استفاده از APIView).

```python
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from .models import PosStaff
from .serializers import PosStaffCreateSerializer, LoginSerializer

User = get_user_model()

# Helper for setting tokens in cookies
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class LoginStaffAPIView(APIView):
    """
    اندپوینت ورود پرسنل صندوق و انبار
    توضیحات: دریافت اطلاعات کاربر، بررسی نقش و مجوزها، و صدور توکن‌های JWT
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ورود پرسنل صندوق",
        request_body=LoginSerializer
    )
    def post(self, request):
        phone = request.data.get('phone')
        password = request.data.get('password')

        if not phone or not password:
            return Response({"success": False, "message": "شماره همراه و پین‌کد الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

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
                if user.is_superuser:
                    role = 'super_admin'
                    role_title = 'مدیر ارشد سیستم'
                    permissions = [
                        'manage_pos', 'manage_inventory', 'quick_add_product', 'manage_ledger',
                        'view_reports', 'monthly_comparison', 'customer_app_connect',
                        'manage_staff', 'send_sms', 'manage_tickets', 'manage_notifications', 'delete_receipts'
                    ]
                else:
                    return Response({"success": False, "message": "شما دسترسی به صندوق فروشگاهی را ندارید."}, status=status.HTTP_403_FORBIDDEN)

            response_data = {
                "success": True,
                "message": "ورود موفقیت‌آمیز بود.",
                "data": {
                    "user": {
                        "id": user.id,
                        "phone": user.username,
                        "fullName": getattr(user, 'first_name', None) or getattr(user, 'full_name', None) or user.username,
                        "role": role,
                        "roleTitleFa": role_title,
                        "permissions": permissions,
                        "status": "active" if user.is_active else "suspended"
                    },
                    "tokens": tokens 
                }
            }
            response = Response(response_data, status=status.HTTP_200_OK)
            response.set_cookie('access', tokens['access'], httponly=True, samesite='Lax')
            response.set_cookie('refresh', tokens['refresh'], httponly=True, samesite='Lax')
            return response
        else:
            return Response({"success": False, "message": "شماره همراه یا رمز عبور اشتباه است."}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutStaffAPIView(APIView):
    """
    اندپوینت خروج پرسنل صندوق
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="خروج پرسنل صندوق و حذف نشست"
    )
    def post(self, request):
        response = Response({"success": True, "message": "خروج موفقیت‌آمیز بود."}, status=status.HTTP_200_OK)
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response


class CreateStaffAPIView(APIView):
    """
    اندپوینت ایجاد پرسنل جدید توسط مدیریت
    """
    permission_classes = [AllowAny] # You may want to change this to [IsAdminUser] in production

    @swagger_auto_schema(
        operation_summary="ایجاد پرسنل صندوق جدید",
        request_body=PosStaffCreateSerializer
    )
    def post(self, request):
        phone = request.data.get('phone')
        full_name = request.data.get('full_name')
        password = request.data.get('password') # پین‌کد
        role = request.data.get('role', 'cashier')
        role_title = request.data.get('roleTitleFa', 'صندوق‌دار')
        permissions = request.data.get('permissions', [])

        if not phone or not password:
            return Response({"success": False, "message": "شماره همراه و پین‌کد الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        # ۱. ساخت هسته کاربر در دیتابیس Accounts
        if User.objects.filter(username=phone).exists():
            return Response({"success": False, "message": "این شماره همراه قبلاً در سیستم ثبت شده است."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=phone, password=password)
        if hasattr(user, 'first_name'):
            user.first_name = full_name
        elif hasattr(user, 'full_name'):
            user.full_name = full_name
        
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

        # ۳. ساخت پروفایل اختصاصی
        PosStaff.objects.create(
            user=user,
            role=role,
            role_title=role_title,
            **perms_map
        )

        return Response({"success": True, "message": "پرسنل صندوق با موفقیت در دیتابیس ثبت شد."}, status=status.HTTP_201_CREATED)
```

---

### ۲.۵. فایل `posuser/serializers.py`
این فایل شامل سریالایزرهای لازم برای بررسی فرمت اطلاعات ورودی و نمایش مستندات Swagger است.

```python
from rest_framework import serializers
from .models import PosStaff

class PosStaffCreateSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    full_name = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=50)
    role = serializers.CharField(max_length=30, default='cashier')
    roleTitleFa = serializers.CharField(max_length=100, default='صندوق‌دار')
    permissions = serializers.ListField(child=serializers.CharField(max_length=50), required=False)

class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(max_length=50)
```

---

### ۳. فایل `posuser/urls.py`
این فایل مسیر دریافت درخواست API را مشخص می‌کند. (ابتدا این فایل را در پوشه `posuser` بسازید)

```python
from django.urls import path
from .views import (
    LoginStaffAPIView, 
    LogoutStaffAPIView, 
    CreateStaffAPIView
)

app_name = 'posuser'

urlpatterns = [
    # ۱. ورود پرسنل صندوق و انبار
    path('login/', LoginStaffAPIView.as_view(), name='login-staff'),
    
    # ۲. خروج پرسنل
    path('logout/', LogoutStaffAPIView.as_view(), name='logout-staff'),
    
    # ۳. ثبت‌نام و ایجاد پرسنل جدید
    path('create-staff/', CreateStaffAPIView.as_view(), name='create-staff'),
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
```

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
