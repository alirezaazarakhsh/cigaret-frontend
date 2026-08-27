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
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'user_id', type: 'OneToOneField(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'کاربر سیستم' },
        { name: 'role', type: 'CharField(choices: super_admin, warehouse_manager, cashier, accountant, visitor)', verbose: 'نقش سازمانی' },
        { name: 'staff_code', type: 'CharField(max_length=30)', isUnique: true, verbose: 'کد پرسنلی' },
        { name: 'pos_pin_hashed', type: 'CharField(max_length=128)', verbose: 'کد پین ۴ رقمی ورود سریع به صندوق (هش‌شده)' },
        { name: 'can_apply_custom_discount', type: 'BooleanField(default=False)', verbose: 'مجوز اعمال تخفیف در فاکتور' },
        { name: 'max_discount_percent', type: 'PositiveSmallIntegerField(default=0)', verbose: 'حداکثر درصد تخفیف مجاز' },
        { name: 'can_adjust_inventory', type: 'BooleanField(default=False)', verbose: 'مجوز تایید انبارگردانی' },
        { name: 'is_active_staff', type: 'BooleanField(default=True)', verbose: 'پرسنل فعال' },
      ]
    },
    {
      name: 'roles_securityauditlog',
      verboseName: 'لاگ امنیتی عملیات حساس پرسنل',
      description: 'ثبت خودکار کلیه فعالیت‌های حساس شامل تغییر قیمت کالا، حذف فاکتور، تخفیف فراتر از عرف و اصلاح کاردکس',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'staff_id', type: 'ForeignKey(StaffProfile)', isFk: true, fkTarget: 'roles_staffprofile', verbose: 'پرسنل انجام‌دهنده' },
        { name: 'action_type', type: 'CharField(max_length=60)', verbose: 'نوع عملیات حساس' },
        { name: 'target_model', type: 'CharField(max_length=60)', verbose: 'مدل هدف (مثلا: CigaretteProduct)' },
        { name: 'target_id', type: 'CharField(max_length=60)', verbose: 'شناسه رکورد تغییریافته' },
        { name: 'ip_address', type: 'GenericIPAddressField', verbose: 'آدرس IP درخواست' },
        { name: 'details', type: 'JSONField', verbose: 'جزئیات تغییرات قبل و بعد' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'زمان دقیق وقوع' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/roles/pos-pin-auth/',
      auth: 'AllowAny',
      description: 'احراز هویت سریع ۴ رقمی صندوق‌دار پشت دستگاه POS جهت باز شدن قفل نرم‌افزار و ثبت فروش',
      requestBody: JSON.stringify({ staff_code: "EMP-104", pin: "8821" }, null, 2),
      responseBody: JSON.stringify({
        authenticated: true,
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        staff: {
          full_name: "مهدی کاظمی",
          role: "cashier",
          can_discount: true,
          max_discount: 5
        }
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/roles/staff-permissions/',
      auth: 'IsAuthenticated',
      description: 'دریافت ماتریس دسترسی‌ها و منوهای مجاز کاربر لاگین‌شده در پنل مدیریتی'
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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile', verbose_name=_("حساب کاربری"))
    role = models.CharField(_("نقش سازمانی"), max_length=30, choices=StaffRole.choices, default=StaffRole.CASHIER)
    staff_code = models.CharField(_("کد پرسنلی"), max_length=30, unique=True)
    pos_pin_hashed = models.CharField(_("رمز PIN صندوق (هش‌شده)"), max_length=128, blank=True)
    can_apply_custom_discount = models.BooleanField(_("مجوز ثبت تخفیف دستی"), default=False)
    max_discount_percent = models.PositiveSmallIntegerField(_("حداکثر درصد تخفیف مجاز"), default=0)
    can_adjust_inventory = models.BooleanField(_("مجوز اصلاح موجودی انبار"), default=False)
    can_view_purchase_costs = models.BooleanField(_("مجوز مشاهده قیمت خرید و سود"), default=False)
    is_active_staff = models.BooleanField(_("پرسنل فعال"), default=True)
    created_at = models.DateTimeField(_("تاریخ استخدام/ثبت"), auto_now_add=True)

    class Meta:
        verbose_name = _("پروفایل پرسنل و دسترسی")
        verbose_name_plural = _("۱. پرسنل سازمانی و نقش‌ها (RBAC)")

    def __str__(self):
        return f"{self.user.full_name} ({self.get_role_display()}) - کد {self.staff_code}"

    def set_pin(self, raw_pin):
        self.pos_pin_hashed = make_password(str(raw_pin))

    def verify_pin(self, raw_pin):
        return check_password(str(raw_pin), self.pos_pin_hashed)


class SecurityAuditLog(models.Model):
    staff = models.ForeignKey(StaffProfile, on_delete=models.SET_NULL, null=True, related_name='audit_logs', verbose_name=_("پرسنل"))
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
`;

  const serializersCode = `"""
roles/serializers.py
"""
from rest_framework import serializers
from .models import StaffProfile, SecurityAuditLog


class StaffProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    role_label = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = StaffProfile
        fields = ['id', 'full_name', 'phone', 'staff_code', 'role', 'role_label', 'can_apply_custom_discount', 'max_discount_percent', 'can_adjust_inventory', 'can_view_purchase_costs', 'is_active_staff']


class SecurityAuditLogSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.user.full_name', read_only=True)

    class Meta:
        model = SecurityAuditLog
        fields = '__all__'
`;

  const viewsCode = `"""
roles/views.py
ویوهای احراز هویت PIN، مدیریت نقش‌ها و اعتبارسنجی سطح دسترسی
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import StaffProfile, SecurityAuditLog
from .serializers import StaffProfileSerializer, SecurityAuditLogSerializer


class StaffRoleViewSet(viewsets.ModelViewSet):
    queryset = StaffProfile.objects.filter(is_active_staff=True)
    serializer_class = StaffProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], url_path='pos-pin-auth')
    def pos_pin_auth(self, request):
        staff_code = request.data.get('staff_code', '').strip()
        pin = request.data.get('pin', '').strip()

        staff = StaffProfile.objects.filter(staff_code=staff_code, is_active_staff=True).first()
        if not staff or not staff.verify_pin(pin):
            return Response({'error': 'کد پرسنلی یا رمز PIN صحیح نمی‌باشد.'}, status=status.HTTP_401_UNAUTHORIZED)

        # صدور JWT توکن اختصاصی شیفت
        refresh = RefreshToken.for_user(staff.user)
        
        # ثبت در لاگ امنیتی
        SecurityAuditLog.objects.create(
            staff=staff,
            action_type="POS_PIN_LOGIN",
            target_model="PosRegister",
            target_id="LOCAL",
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({
            'authenticated': True,
            'access_token': str(refresh.access_token),
            'staff': StaffProfileSerializer(staff).data
        })
`;

  const urlsCode = `"""
roles/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StaffRoleViewSet

router = DefaultRouter()
router.register('staff', StaffRoleViewSet, basename='staff-role')

urlpatterns = [
    path('', include(router.urls)),
]
`;

  return (
    <AppDocTemplate
      appFolder="roles"
      title="مدیریت نقش‌ها و دسترسی‌ها (RBAC & Staff PIN)"
      titleEn="roles / Role-Based Access Control & Staff Auth App"
      badge="RBAC • PIN Auth • Audit Logs"
      description="ماژول کنترل دسترسی سازمانی چندسطحی، تفکیک وظایف انباردار، صندوق‌دار و مدیر مالی، ورود سریع با PIN کد لمسی و ثبت لاگ امنیتی عملیات حساس."
      icon={<ShieldAlert className="w-6 h-6 text-red-500" />}
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

