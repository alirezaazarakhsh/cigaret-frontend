import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const RolesPermissionsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'roles_staffprofile',
      verboseName: 'پروفایل پرسنل، نقش‌های سازمانی و PIN صندوق',
      description: 'تعریف نقش‌های انباردار، صندوق‌دار، مدیر مالی، ویزیتور و ادمین ارشد، به همراه PIN کد ورود سریع به پایانه POS',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'user_id', type: 'OneToOneField(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'حساب کاربر سیستم' },
        { name: 'role', type: 'CharField(choices: super_admin, warehouse_manager, cashier, accountant, visitor)', verbose: 'نقش سازمانی' },
        { name: 'staff_code', type: 'CharField(max_length=30)', isUnique: true, verbose: 'کد پرسنلی اختصاصی' },
        { name: 'pos_pin_hashed', type: 'CharField(max_length=128)', verbose: 'کد پین ۴ رقمی ورود سریع به صندوق (هش‌شده)' },
        { name: 'can_apply_custom_discount', type: 'BooleanField(default=False)', verbose: 'مجوز ثبت تخفیف دستی در فاکتور' },
        { name: 'max_discount_percent', type: 'PositiveSmallIntegerField(default=0)', verbose: 'حداکثر درصد تخفیف مجاز' },
        { name: 'can_adjust_inventory', type: 'BooleanField(default=False)', verbose: 'مجوز اصلاح موجودی و انبارگردانی' },
        { name: 'can_view_purchase_costs', type: 'BooleanField(default=False)', verbose: 'مجوز مشاهده قیمت خرید و سود' },
        { name: 'is_active_staff', type: 'BooleanField(default=True)', verbose: 'وضعیت پرسنل فعال' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت پرسنل' },
      ]
    },
    {
      name: 'roles_securityauditlog',
      verboseName: 'لاگ امنیتی عملیات حساس پرسنل',
      description: 'ثبت خودکار کلیه فعالیت‌های حساس شامل تغییر قیمت کالا، حذف فاکتور، تخفیف فراتر از عرف و ورود صندوق‌دار',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه لاگ' },
        { name: 'staff_id', type: 'ForeignKey(StaffProfile)', isFk: true, fkTarget: 'roles_staffprofile', verbose: 'پرسنل انجام‌دهنده' },
        { name: 'action_type', type: 'CharField(max_length=60)', verbose: 'نوع عملیات حساس' },
        { name: 'target_model', type: 'CharField(max_length=60)', verbose: 'مدل هدف (مثلا: Cigarettes, Invoice)' },
        { name: 'target_id', type: 'CharField(max_length=60)', verbose: 'شناسه رکورد تغییریافته' },
        { name: 'ip_address', type: 'GenericIPAddressField', verbose: 'آدرس IP درخواست' },
        { name: 'details', type: 'JSONField', verbose: 'جزئیات رویداد و مقادیر قبل و بعد' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'زمان دقیق وقوع رویداد' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/roles/pos-pin-auth/',
      auth: 'AllowAny',
      description: 'احراز هویت سریع با کد پرسنلی و PIN ۴ رقمی صندوق‌دار جهت باز شدن قفل نرم‌افزار POS و صدور فاکتور',
      curlExample: `curl -X POST http://localhost:8000/api/v1/roles/pos-pin-auth/ \\
  -H "Content-Type: application/json" \\
  -d '{"staff_code": "EMP-104", "pin": "8821"}'`,
      responseBody: `{
  "status": "success",
  "authenticated": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "staff": {
    "id": 4,
    "full_name": "مهدی کاظمی",
    "phone": "09121112233",
    "staff_code": "EMP-104",
    "role": "cashier",
    "role_label": "صندوق‌دار فروش حضوری",
    "can_apply_custom_discount": true,
    "max_discount_percent": 5,
    "can_adjust_inventory": false,
    "can_view_purchase_costs": false,
    "is_active_staff": true
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/roles/staff-permissions/',
      auth: 'IsAuthenticated',
      description: 'دریافت وضعیت کامل دسترسی‌ها، نقش سازمانی و ماتریس مجوزهای کاربر لاگین‌شده',
      curlExample: `curl -X GET http://localhost:8000/api/v1/roles/staff-permissions/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: `{
  "status": "success",
  "user_id": 12,
  "full_name": "مهدی کاظمی",
  "role": "cashier",
  "role_label": "صندوق‌دار فروش حضوری",
  "permissions": {
    "can_apply_custom_discount": true,
    "max_discount_percent": 5,
    "can_adjust_inventory": false,
    "can_view_purchase_costs": false
  },
  "accessible_routes": [
    "/shopmanage",
    "/invoice",
    "/catalog"
  ]
}`
    },
    {
      method: 'GET',
      path: '/api/v1/roles/staff/',
      auth: 'IsAdminUser',
      description: 'دریافت لیست کلیه پرسنل و نقش‌های سازمانی (مخصوص ادمین ارشد)',
      curlExample: `curl -X GET http://localhost:8000/api/v1/roles/staff/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: `{
  "status": "success",
  "count": 3,
  "results": [
    {
      "id": 1,
      "full_name": "علیرضا آذرخش",
      "phone": "09120759419",
      "staff_code": "EMP-101",
      "role": "super_admin",
      "role_label": "مدیر ارشد و صاحب انبار",
      "can_apply_custom_discount": true,
      "max_discount_percent": 100,
      "can_adjust_inventory": true,
      "can_view_purchase_costs": true,
      "is_active_staff": true
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/api/v1/roles/audit-logs/',
      auth: 'IsAdminUser',
      description: 'مشاهده لاگ‌های ممیزی امنیتی و ثبت تغییرات پرسنل (مخصوص ادمین ارشد)',
      curlExample: `curl -X GET http://localhost:8000/api/v1/roles/audit-logs/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`
    }
  ];

  const modelsCode = `"""
roles/models.py
مدل‌های کنترل دسترسی مبتنی بر نقش (RBAC)، پروفایل پرسنل، PIN لاگین صندوق و ممیزی امنیتی
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import make_password, check_password
from accounts.models import User


class StaffRole(models.TextChoices):
    SUPER_ADMIN = 'super_admin', _('مدیر ارشد و صاحب انبار')
    WAREHOUSE_MANAGER = 'warehouse_manager', _('مدیر انبار مرکزی و لجستیک')
    CASHIER = 'cashier', _('صندوق‌دار فروش حضوری')
    ACCOUNTANT = 'accountant', _('مدیر مالی و حسابداری دفتری')
    VISITOR = 'visitor', _('ویزیتور و بازاریاب میدانی')


class StaffProfile(models.Model):
    """
    پروفایل پرسنل انبار و صندوق جهت تعیین سطح دسترسی دقیق و احراز هویت PIN لمسی
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='staff_profile', 
        verbose_name=_("حساب کاربری")
    )
    role = models.CharField(
        _("نقش سازمانی"), 
        max_length=30, 
        choices=StaffRole.choices, 
        default=StaffRole.CASHIER
    )
    staff_code = models.CharField(_("کد پرسنلی"), max_length=30, unique=True)
    pos_pin_hashed = models.CharField(_("رمز PIN صندوق (هش‌شده)"), max_length=128, blank=True)
    
    # مجوزهای تفکیک‌شده
    can_apply_custom_discount = models.BooleanField(_("مجوز ثبت تخفیف دستی"), default=False)
    max_discount_percent = models.PositiveSmallIntegerField(_("حداکثر درصد تخفیف مجاز"), default=0)
    can_adjust_inventory = models.BooleanField(_("مجوز اصلاح موجودی انبار"), default=False)
    can_view_purchase_costs = models.BooleanField(_("مجوز مشاهده قیمت خرید و سود"), default=False)
    
    is_active_staff = models.BooleanField(_("پرسنل فعال"), default=True)
    is_locked = models.BooleanField(_("حساب کاربری قفل شده (عدم امکان ورود)"), default=False)
    lock_reason = models.CharField(_("علت قفل حساب کاربری"), max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ استخدام/ثبت"), auto_now_add=True)

    class Meta:
        verbose_name = _("پروفایل پرسنل و دسترسی")
        verbose_name_plural = _("۱. پرسنل سازمانی و نقش‌ها (RBAC)")

    def __str__(self):
        return f"{self.user.full_name} ({self.get_role_display()}) - کد {self.staff_code}"

    def set_pin(self, raw_pin):
        """هش کردن پین کد ۴ رقمی صندوق‌دار"""
        self.pos_pin_hashed = make_password(str(raw_pin))

    def verify_pin(self, raw_pin):
        """اعتبارسنجی پین ورودی با هش ذخیره‌شده"""
        return check_password(str(raw_pin), self.pos_pin_hashed)


class SecurityAuditLog(models.Model):
    """
    لاگ امنیتی جهت ثبت تمامی تغییرات حساس و ورود پرسنل
    """
    staff = models.ForeignKey(
        StaffProfile, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='audit_logs', 
        verbose_name=_("پرسنل")
    )
    action_type = models.CharField(_("نوع عملیات"), max_length=60)
    target_model = models.CharField(_("موجودیت تغییریافته"), max_length=60)
    target_id = models.CharField(_("شناسه رکورد"), max_length=60)
    ip_address = models.GenericIPAddressField(_("آدرس IP"), blank=True, null=True)
    details = models.JSONField(_("جزئیات رویداد"), default=dict)
    created_at = models.DateTimeField(_("زمان رویداد"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("لاگ ممیزی امنیتی")
        verbose_name_plural = _("۲. لاگ امنیتی عملیات حساس پرسنل")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.staff.user.full_name if self.staff else 'سیستم'} -> {self.action_type} ({self.created_at})"
`;

  const adminCode = `"""
roles/admin.py
پنل ادمین پرسنل و لاگ‌های امنیتی همراه با تغییر سریع کد پین و نمایش رنگی نقش‌ها
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import StaffProfile, SecurityAuditLog


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'staff_code', 'role_badge', 'can_apply_custom_discount', 'max_discount_percent', 'can_adjust_inventory', 'is_active_staff')
    list_filter = ('role', 'is_active_staff', 'can_apply_custom_discount', 'can_adjust_inventory')
    search_fields = ('user__full_name', 'user__phone', 'staff_code')
    list_editable = ('is_active_staff',)

    fieldsets = (
        (_('مشخصات پرسنل و کاربر'), {
            'fields': ('user', 'staff_code', 'role', 'is_active_staff')
        }),
        (_('سطوح دسترسی و تخفیف‌ها'), {
            'fields': ('can_apply_custom_discount', 'max_discount_percent', 'can_adjust_inventory', 'can_view_purchase_costs')
        }),
    )

    def role_badge(self, obj):
        colors = {
            'super_admin': '#ef4444',
            'warehouse_manager': '#10b981',
            'cashier': '#3b82f6',
            'accountant': '#8b5cf6',
            'visitor': '#f59e0b'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            colors.get(obj.role, "#64748b"),
            obj.get_role_display()
        )
    role_badge.short_description = _("نقش سازمانی")


@admin.register(SecurityAuditLog)
class SecurityAuditLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'staff', 'action_type', 'target_model', 'target_id', 'ip_address')
    list_filter = ('action_type', 'target_model', 'created_at')
    search_fields = ('staff__user__full_name', 'action_type', 'target_id')
    readonly_fields = ('created_at', 'staff', 'action_type', 'target_model', 'target_id', 'ip_address', 'details')
`;

  const serializersCode = `"""
roles/serializers.py
سریالایزرهای DRF جهت تبدیل پروفایل‌های پرسنل، ماتریس دسترسی‌ها و لاگ‌های امنیتی
"""

from rest_framework import serializers
from .models import StaffProfile, SecurityAuditLog


class StaffProfileSerializer(serializers.ModelSerializer):
    """
    سریالایزر پروفایل پرسنل با استخراج اطلاعات کاربر مرتبط
    """
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    role_label = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = StaffProfile
        fields = [
            'id', 
            'full_name', 
            'phone', 
            'staff_code', 
            'role', 
            'role_label', 
            'can_apply_custom_discount', 
            'max_discount_percent', 
            'can_adjust_inventory', 
            'can_view_purchase_costs', 
            'is_active_staff'
        ]


class StaffPinAuthSerializer(serializers.Serializer):
    """
    سریالایزر درخواست لاگین پین کد صندوق
    """
    staff_code = serializers.CharField(required=True, help_text="کد پرسنلی اختصاصی (مثال: EMP-104)")
    pin = serializers.CharField(required=True, max_length=10, help_text="کد پین ۴ رقمی صندوق‌دار")


class SecurityAuditLogSerializer(serializers.ModelSerializer):
    """
    سریالایزر ثبت و مشاهده لاگ‌های امنیتی
    """
    staff_name = serializers.CharField(source='staff.user.full_name', read_only=True)

    class Meta:
        model = SecurityAuditLog
        fields = ['id', 'staff_name', 'action_type', 'target_model', 'target_id', 'ip_address', 'details', 'created_at']
`;

  const viewsCode = `"""
roles/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت کامل نقش‌ها، لاگین PIN صندوق و لاگ‌های امنیتی
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema

from .models import StaffProfile, SecurityAuditLog
from .serializers import StaffProfileSerializer, StaffPinAuthSerializer, SecurityAuditLogSerializer


class PosPinAuthAPIView(APIView):
    """
    اندپوینت احراز هویت سریع پشت دستگاه POS با کد پرسنلی و رمز PIN
    توضیحات: این ویو صریح، PIN کد ۴ رقمی صندوق‌دار را اعتبارسنجی کرده و توکن JWT موقت صدور فاکتور برمی‌گرداند.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="احراز هویت سریع با پین کد صندوق (POS PIN Auth)",
        request_body=StaffPinAuthSerializer,
        responses={200: "ورود موفقیت‌آمیز و صدور توکن JWT"}
    )
    def post(self, request):
        serializer = StaffPinAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        staff_code = serializer.validated_data['staff_code'].strip()
        pin = serializer.validated_data['pin'].strip()

        # پیدا کردن پرسنل فعال با کد مربوطه
        staff = StaffProfile.objects.filter(staff_code=staff_code, is_active_staff=True).first()
        if not staff or not staff.verify_pin(pin):
            return Response({
                'status': 'error',
                'error': 'کد پرسنلی یا رمز PIN وارد شده صحیح نمی‌باشد.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # بررسی قفل بودن حساب پرسنل توسط مدیریت
        if staff.is_locked or not staff.user.is_active:
            reason = staff.lock_reason or "دسترسی حساب کاربری شما توسط مدیریت سیستم قفل گردیده است."
            return Response({
                'status': 'error',
                'is_locked': True,
                'error': f'ورود ناموفق: {reason}'
            }, status=status.HTTP_403_FORBIDDEN)

        # صدور توکن JWT اختصاصی شیفت کاری
        refresh = RefreshToken.for_user(staff.user)
        
        # ثبت لاگ امنیتی ورود صندوق‌دار
        client_ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
        SecurityAuditLog.objects.create(
            staff=staff,
            action_type="POS_PIN_LOGIN",
            target_model="PosRegister",
            target_id="TERMINAL_1",
            ip_address=client_ip,
            details={"message": "ورود سریع صندوق‌دار با پین کد"}
        )

        return Response({
            'status': 'success',
            'authenticated': True,
            'access_token': str(refresh.access_token),
            'staff': StaffProfileSerializer(staff).data
        }, status=status.HTTP_200_OK)


class StaffPermissionsAPIView(APIView):
    """
    اندپوینت دریافت ماتریس دسترسی‌ها و مسیرهای مجاز کاربر جاری
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت دسترسی‌ها و مجوزهای کاربر لاگین‌شده",
        responses={200: "لیست کامل مجوزها و صفحات مجاز"}
    )
    def get(self, request):
        user = request.user
        staff = getattr(user, 'staff_profile', None)

        if not staff or not staff.is_active_staff:
            return Response({
                'status': 'success',
                'user_id': user.id,
                'full_name': getattr(user, 'full_name', str(user)),
                'role': 'customer',
                'role_label': 'مشتری عادی',
                'permissions': {
                    'can_apply_custom_discount': False,
                    'max_discount_percent': 0,
                    'can_adjust_inventory': False,
                    'can_view_purchase_costs': False,
                },
                'accessible_routes': ['/live-prices', '/catalog', '/invoice']
            }, status=status.HTTP_200_OK)

        # تعیین مسیرهای مجاز براساس نقش
        routes_by_role = {
            'super_admin': ['*'],
            'warehouse_manager': ['/shipping', '/inventory', '/catalog'],
            'cashier': ['/shopmanage', '/invoice', '/live-prices'],
            'accountant': ['/invoice', '/reports', '/live-prices'],
            'visitor': ['/catalog', '/invoice']
        }

        return Response({
            'status': 'success',
            'user_id': user.id,
            'full_name': user.full_name,
            'role': staff.role,
            'role_label': staff.get_role_display(),
            'permissions': {
                'can_apply_custom_discount': staff.can_apply_custom_discount,
                'max_discount_percent': staff.max_discount_percent,
                'can_adjust_inventory': staff.can_adjust_inventory,
                'can_view_purchase_costs': staff.can_view_purchase_costs,
            },
            'accessible_routes': routes_by_role.get(staff.role, ['/live-prices'])
        }, status=status.HTTP_200_OK)


class StaffListCreateAPIView(APIView):
    """
    اندپوینت دریافت لیست پرسنل و ثبت پرسنل جدید (مخصوص ادمین ارشد)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت لیست کلیه پرسنل سازمان",
        responses={200: StaffProfileSerializer(many=True)}
    )
    def get(self, request):
        queryset = StaffProfile.objects.all().order_by('-created_at')
        serializer = StaffProfileSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="تعریف پرسنل جدید با پین کد",
        request_body=StaffProfileSerializer
    )
    def post(self, request):
        serializer = StaffProfileSerializer(data=request.data)
        if serializer.is_valid():
            staff = serializer.save()
            raw_pin = request.data.get('pin')
            if raw_pin:
                staff.set_pin(raw_pin)
                staff.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StaffDetailAPIView(APIView):
    """
    اندپوینت مشاهده، ویرایش و حذف پروفایل پرسنل با شناسه (ID)
    """
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(StaffProfile, pk=pk)

    def get(self, request, pk):
        staff = self.get_object(pk)
        serializer = StaffProfileSerializer(staff)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        staff = self.get_object(pk)
        serializer = StaffProfileSerializer(staff, data=request.data, partial=True)
        if serializer.is_valid():
            staff = serializer.save()
            raw_pin = request.data.get('pin')
            if raw_pin:
                staff.set_pin(raw_pin)
                staff.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        staff = self.get_object(pk)
        staff.is_active_staff = False
        staff.save()
        return Response({'message': 'پروفایل پرسنل غیرفعال گردید.'}, status=status.HTTP_200_OK)


class SecurityAuditLogListAPIView(APIView):
    """
    اندپوینت مشاهده لاگ‌های امنیتی سیستم (مخصوص ادمین ارشد)
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        logs = SecurityAuditLog.objects.all().order_by('-created_at')[:100]
        serializer = SecurityAuditLogSerializer(logs, many=True)
        return Response({
            'status': 'success',
            'count': len(serializer.data),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
roles/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    PosPinAuthAPIView, 
    StaffPermissionsAPIView, 
    StaffListCreateAPIView, 
    StaffDetailAPIView,
    SecurityAuditLogListAPIView
)

app_name = 'roles'

urlpatterns = [
    # ۱. احراز هویت سریع پشت صندوق POS با کد پرسنلی و پین ۴ رقمی
    path('pos-pin-auth/', PosPinAuthAPIView.as_view(), name='pos-pin-auth'),
    
    # ۲. دریافت ماتریس دسترسی‌ها و مسیرهای مجاز کاربر جاری
    path('staff-permissions/', StaffPermissionsAPIView.as_view(), name='staff-permissions'),
    
    # ۳. مدیریت پرسنل (لیست و ایجاد)
    path('staff/', StaffListCreateAPIView.as_view(), name='staff-list-create'),
    
    # ۴. جزئیات، ویرایش پین و غیرفعال‌سازی پرسنل
    path('staff/<int:pk>/', StaffDetailAPIView.as_view(), name='staff-detail'),
    
    # ۵. مشاهده لاگ‌های امنیتی ممیزی
    path('audit-logs/', SecurityAuditLogListAPIView.as_view(), name='security-audit-logs'),
]
`;

  const notesCode = `## 📌 راهنمای جامع اتصال لاگین PIN صندوق و ماتریس دسترسی‌ها به React

### ۱. معماری APIView در مدیریت نقش‌ها:
* تمامی اندپوینت‌ها از APIView صریح بهره می‌برند و از ViewSet یا Router اتوماتیک استفاده نشده است.
* **مزیت:** سرعت فوق‌العاده بالای احراز هویت لمسی پشت صندوق POS، صدور مستقیم توکن JWT و لایه محافظتی ضد نفوذ.

---

### ۲. نحوه احراز هویت لمسی با پین کد در صندوق آنلاین (/shopmanage):
\`\`\`typescript
// تابع ورود سریع صندوق‌دار با کیپد لمسی
const handlePinLogin = async (staffCode: string, pin: string) => {
  const response = await fetch('http://localhost:8000/api/v1/roles/pos-pin-auth/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staff_code: staffCode, pin: pin })
  });

  const data = await response.json();
  if (data.status === 'success') {
    // ذخیره توکن شیفت و دسترسی‌ها
    localStorage.setItem('pos_token', data.access_token);
    localStorage.setItem('staff_info', JSON.stringify(data.staff));
    toast.success("خوش آمدید " + data.staff.full_name);
  } else {
    toast.error(data.error);
  }
};
\`\`\`

---

### ۳. بررسی سطح دسترسی ثبت تخفیف در فاکتور:
\`\`\`typescript
// کنترل سقف تخفیف مجاز قبل از اعمال در فاکتور
if (requestedDiscountPercent > staff.max_discount_percent) {
  alert("سقف تخفیف مجاز شما " + staff.max_discount_percent + "٪ است.");
}
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="roles"
      title="مدیریت نقش‌ها و دسترسی‌ها (RBAC & Staff PIN)"
      titleEn="roles / Role-Based Access Control & Staff Auth App"
      badge="RBAC • PIN Auth • Audit Logs"
      description="ماژول کنترل دسترسی سازمانی چندسطحی، تفکیک وظایف انباردار، صندوق‌دار و مدیر مالی، ورود سریع با PIN کد لمسی و ثبت لاگ امنیتی عملیات حساس. این اپلیکیشن کاملاً بر پایه APIView صریح پیاده‌سازی شده است."
      icon={<ShieldAlert className="w-6 h-6 text-red-500" />}
      modelsCode={modelsCode}
      adminCode={adminCode}
      serializersCode={serializersCode}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
