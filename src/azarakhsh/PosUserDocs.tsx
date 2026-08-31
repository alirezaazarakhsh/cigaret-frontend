import React from 'react';
import { UserCheck } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const PosUserDocs: React.FC = () => {
  const modelsCode = `from django.db import models
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
        return f"{name} ({self.get_role_display()})"`;

  const adminCode = `from django import forms
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
    user_phone.short_description = 'شماره همراه'`;

  const serializersCode = `from rest_framework import serializers
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
    password = serializers.CharField(max_length=50)`;

  const viewsCode = `from rest_framework import status
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

            user_phone = (
                getattr(user, 'phone', None) or 
                getattr(user, 'mobile', None) or 
                getattr(user, 'phone_number', None) or 
                getattr(user, 'username', None) or 
                str(user)
            )

            response_data = {
                "success": True,
                "message": "ورود موفقیت‌آمیز بود.",
                "data": {
                    "user": {
                        "id": user.id,
                        "phone": user_phone,
                        "fullName": getattr(user, 'first_name', None) or getattr(user, 'full_name', None) or user_phone,
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
    اندپوینت ایجاد پرسنل جدید توسط مدیریت (پشتیبانی هوشمند از مدل کاربر سفارشی)
    """
    permission_classes = [AllowAny]

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

        # ۱. پیدا کردن فیلد اصلی نام کاربری در مدل کاربر جنگو
        username_field = getattr(User, 'USERNAME_FIELD', 'username')

        # بررسی وجود کاربر قبلی بر اساس شماره همراه یا نام کاربری
        existing_user = None
        for f_name in [username_field, 'phone', 'mobile', 'phone_number', 'username']:
            if hasattr(User, f_name):
                existing_user = User.objects.filter(**{f_name: phone}).first()
                if existing_user:
                    break

        if existing_user:
            return Response({"success": False, "message": "این شماره همراه قبلاً در سیستم ثبت شده است."}, status=status.HTTP_400_BAD_REQUEST)

        # ۲. ساخت کاربر جدید به صورت پویا و امن
        try:
            user = User.objects.create_user(**{username_field: phone}, password=password)
        except Exception:
            try:
                user = User.objects.create_user(username=phone, password=password)
            except Exception:
                user_kwargs = {}
                for f_name in [username_field, 'phone', 'mobile', 'phone_number', 'username']:
                    if hasattr(User, f_name):
                        user_kwargs[f_name] = phone
                user = User(**user_kwargs)
                user.set_password(password)
                user.save()

        # تنظیم نام و دسترسی‌ها
        if hasattr(user, 'first_name'):
            user.first_name = full_name
        if hasattr(user, 'full_name'):
            user.full_name = full_name
        if hasattr(user, 'phone') and not getattr(user, 'phone', None):
            user.phone = phone
            
        if role == 'super_admin':
            user.is_staff = True
            user.is_superuser = True
        else:
            user.is_staff = True 
        user.save()

        # ۳. مپ کردن آرایه دسترسی‌ها به فیلدهای بولی مدل
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

        # ۴. ساخت پروفایل اختصاصی
        PosStaff.objects.create(
            user=user,
            role=role,
            role_title=role_title,
            **perms_map
        )

        return Response({"success": True, "message": "پرسنل صندوق با موفقیت در دیتابیس ثبت شد."}, status=status.HTTP_201_CREATED)


class ListStaffAPIView(APIView):
    """
    اندپوینت دریافت لیست پرسنل صندوق و انبار همراه با وضعیت قفل/فعالیت
    """
    permission_classes = [AllowAny]

    def get(self, request):
        staff_qs = PosStaff.objects.select_related('user').all()
        data = []
        for staff in staff_qs:
            user = staff.user
            user_phone = getattr(user, 'phone', None) or getattr(user, 'mobile', None) or getattr(user, 'username', '')
            full_name = getattr(user, 'first_name', None) or getattr(user, 'full_name', None) or user_phone
            
            perms = []
            if staff.perm_manage_pos: perms.append('manage_pos')
            if staff.perm_manage_inventory: perms.append('manage_inventory')
            if staff.perm_quick_add_product: perms.append('quick_add_product')
            if staff.perm_manage_ledger: perms.append('manage_ledger')
            if staff.perm_view_reports: perms.append('view_reports')
            if staff.perm_monthly_comparison: perms.append('monthly_comparison')
            if staff.perm_customer_app_connect: perms.append('customer_app_connect')
            if staff.perm_manage_staff: perms.append('manage_staff')
            if staff.perm_send_sms: perms.append('send_sms')
            if staff.perm_manage_tickets: perms.append('manage_tickets')
            if staff.perm_manage_notifications: perms.append('manage_notifications')
            if staff.perm_delete_receipts: perms.append('delete_receipts')

            data.append({
                "id": staff.id,
                "user_id": user.id,
                "phone": user_phone,
                "fullName": full_name,
                "role": staff.role,
                "roleTitleFa": staff.role_title,
                "is_active": staff.is_active,
                "status": "active" if staff.is_active else "suspended",
                "permissions": perms,
                "created_at": staff.created_at.strftime('%Y/%m/%d')
            })

        return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


class StaffDetailAPIView(APIView):
    """
    اندپوینت‌های ویرایش و حذف پرسنل (PUT/DELETE /posuser/staff/<id>/)
    """
    permission_classes = [AllowAny]

    def put(self, request, pk):
        try:
            staff = PosStaff.objects.get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        full_name = request.data.get('full_name')
        phone = request.data.get('phone')
        password = request.data.get('password')
        role = request.data.get('role')
        role_title = request.data.get('roleTitleFa')
        permissions = request.data.get('permissions', [])

        user = staff.user
        if full_name:
            if hasattr(user, 'first_name'): user.first_name = full_name
            if hasattr(user, 'full_name'): user.full_name = full_name
        if phone:
            if hasattr(user, 'phone'): user.phone = phone
            if hasattr(user, 'mobile'): user.mobile = phone
        if password:
            user.set_password(password)
            staff.password = password
        user.save()

        if role: staff.role = role
        if role_title: staff.role_title = role_title

        # ویرایش دسترسی‌ها
        staff.perm_manage_pos = 'manage_pos' in permissions
        staff.perm_manage_inventory = 'manage_inventory' in permissions
        staff.perm_quick_add_product = 'quick_add_product' in permissions
        staff.perm_manage_ledger = 'manage_ledger' in permissions
        staff.perm_view_reports = 'view_reports' in permissions
        staff.perm_monthly_comparison = 'monthly_comparison' in permissions
        staff.perm_customer_app_connect = 'customer_app_connect' in permissions
        staff.perm_manage_staff = 'manage_staff' in permissions
        staff.perm_send_sms = 'send_sms' in permissions
        staff.perm_manage_tickets = 'manage_tickets' in permissions
        staff.perm_manage_notifications = 'manage_notifications' in permissions
        staff.perm_delete_receipts = 'delete_receipts' in permissions
        staff.save()

        return Response({"success": True, "message": "اطلاعات پرسنل با موفقیت به روز شد."}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            staff = PosStaff.objects.get(pk=pk)
            user = staff.user
            staff.delete()
            if user:
                user.delete()
            return Response({"success": True, "message": "پرسنل با موفقیت حذف شد."}, status=status.HTTP_200_OK)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)


class ToggleLockStaffAPIView(APIView):
    """
    اندپوینت قفل / فعال‌سازی پرسنل در دیتابیس (POST/PATCH /posuser/staff/<id>/toggle-lock/)
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            staff = PosStaff.objects.get(pk=pk)
            staff.is_active = not staff.is_active
            staff.save()
            
            # همگام‌سازی با کاربر اصلی در صورت وجود فیلد is_active
            if staff.user and hasattr(staff.user, 'is_active'):
                staff.user.is_active = staff.is_active
                staff.user.save()

            status_str = "active" if staff.is_active else "suspended"
            msg = "کاربر با موفقیت فعال شد." if staff.is_active else "کاربر با موفقیت قفل / تعلیق شد."
            return Response({
                "success": True,
                "is_active": staff.is_active,
                "status": status_str,
                "message": msg
            }, status=status.HTTP_200_OK)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)`;

  const urlsCode = `from django.urls import path
from .views import (
    LoginStaffAPIView, 
    LogoutStaffAPIView, 
    CreateStaffAPIView,
    ListStaffAPIView,
    StaffDetailAPIView,
    ToggleLockStaffAPIView
)

app_name = 'posuser'

urlpatterns = [
    # ۱. ورود و خروج پرسنل
    path('login/', LoginStaffAPIView.as_view(), name='login-staff'),
    path('logout/', LogoutStaffAPIView.as_view(), name='logout-staff'),
    
    # ۲. ایجاد و دریافت لیست پرسنل
    path('create-staff/', CreateStaffAPIView.as_view(), name='create-staff'),
    path('staff-list/', ListStaffAPIView.as_view(), name='staff-list'),

    # ۳. ویرایش و حذف پرسنل با شناسه (PK)
    path('staff/<int:pk>/', StaffDetailAPIView.as_view(), name='staff-detail'),

    # ۴. قفل و فعال‌سازی پرسنل در دیتابیس
    path('staff/<int:pk>/toggle-lock/', ToggleLockStaffAPIView.as_view(), name='staff-toggle-lock'),
]`;

  const erdTables: TableErdMeta[] = [
    {
      name: 'posuser_posstaff',
      verboseName: 'جدول پرسنل صندوق و انبار (posuser)',
      description: 'جدول اختصاصی ذخیره نقش‌ها و دسترسی‌های پرسنل سامانه (متصل به User)',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'user_id', type: 'OneToOneField', verbose: 'اتصال به جدول اصلی کاربران', help: 'Foreign Key to accounts_user' },
        { name: 'role', type: 'CharField', verbose: 'نقش (warehouse_manager, cashier, accountant, super_admin)' },
        { name: 'role_title', type: 'CharField', verbose: 'عنوان سمت (فارسی)' },
        { name: 'perm_manage_pos', type: 'BooleanField', verbose: 'فروش و صندوق' },
        { name: 'perm_manage_inventory', type: 'BooleanField', verbose: 'مدیریت و انبارداری' },
        { name: '...', type: 'BooleanField', verbose: 'سایر دسترسی‌های بولی...' },
        { name: 'is_active', type: 'BooleanField', verbose: 'وضعیت فعالیت' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/posuser/create-staff/',
      auth: 'AllowAny (csrf_exempt)',
      description: 'ایجاد پرسنل جدید همراه با ثبت دقیق نقش و لیست دسترسی‌ها',
      requestBody: JSON.stringify({
        phone: "09120759419",
        full_name: "مهندس احمد کاظمی",
        password: "1234",
        role: "warehouse_manager",
        roleTitleFa: "مدیر انبار",
        permissions: [
          "manage_pos",
          "manage_inventory",
          "quick_add_product"
        ]
      }, null, 2),
      responseBody: JSON.stringify({
        success: true,
        message: "پرسنل صندوق با موفقیت در دیتابیس ثبت شد."
      }, null, 2),
      curlExample: `curl -X POST http://localhost:8000/api/v1/posuser/create-staff/ \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"09120759419","full_name":"مهندس احمد کاظمی","password":"1234","role":"warehouse_manager","roleTitleFa":"مدیر انبار","permissions":["manage_pos","manage_inventory","quick_add_product"]}'`
    }
  ];

  return (
    <AppDocTemplate
      appFolder="posuser"
      title="اپلیکیشن پرسنل صندوق و انبار"
      titleEn="posuser / POS Staff App"
      badge="پرسنل صندوق"
      description="مدیریت مجزا و یکپارچه پرسنل انبار، صندوق‌داران و مدیران سیستم با قابلیت ثبت مستقیم از طریق پنل فرانت‌اند."
      icon={<UserCheck className="w-6 h-6" />}
      modelsCode={modelsCode}
      adminCode={adminCode}
      serializersCode={serializersCode}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
