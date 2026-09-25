import React from 'react';
import { UserCheck } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from '../../AppDocTemplate';

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
    perm_manage_warehouse_messages = models.BooleanField(default=False, verbose_name='صندوق پیام‌های تماس سایت')
    perm_manage_site_settings = models.BooleanField(default=False, verbose_name='تنظیمات عمومی سایت')
    perm_manage_sliders = models.BooleanField(default=False, verbose_name='اسلایدرها و بنرها')
    perm_manage_footer_settings = models.BooleanField(default=False, verbose_name='تنظیمات فوتر سایت')
    perm_delete_receipts = models.BooleanField(default=False, verbose_name='ابطال و حذف فاکتورها')

    class Meta:
        verbose_name = 'پرسنل صندوق و انبار'
        verbose_name_plural = 'لیست پرسنل صندوق و انبار'

    def set_password(self, raw_password):
        if raw_password:
            self.password = make_password(raw_password)
            if self.user_id:
                self.user.set_password(raw_password)
                self.user.save()

    def save(self, *args, **kwargs):
        if self.password and not (self.password.startswith('pbkdf2_') or self.password.startswith('argon2')):
            self.set_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        name = getattr(self.user, 'first_name', None) or getattr(self.user, 'full_name', None) or getattr(self.user, 'username', str(self.user))
        return f"{name} ({self.get_role_display()})"`;

  const adminCode = `from django import forms
from django.contrib import admin
from .models import PosStaff


class PosStaffAdminForm(forms.ModelForm):
    password = forms.CharField(
        label='رمز عبور / پینکد جدید',
        widget=forms.PasswordInput(render_value=False),
        required=False,
        help_text='فقط در صورت تمایل به تغییر پینکد این فیلد را پر کنید؛ در غیر این صورت خالی بگذارید.',
    )

    class Meta:
        model = PosStaff
        exclude = ['password']  # فیلد هششدهی مدل مستقیماً در فرم قرار نمی‌گیرد


@admin.register(PosStaff)
class PosStaffAdmin(admin.ModelAdmin):
    form = PosStaffAdminForm
    list_display = ('user_name', 'user_phone', 'role', 'role_title', 'is_active')
    list_filter = ('role', 'is_active', 'perm_manage_pos', 'perm_manage_inventory')
    search_fields = ('role_title', 'user__phone', 'user__full_name')

    fieldsets = (
        ('اطلاعات پایه و احراز هویت', {
            'fields': ('user', 'password', 'role', 'role_title', 'is_active')
        }),
        ('سطوح دسترسی اختصاصی', {
            'fields': (
                'perm_manage_pos', 'perm_manage_inventory', 'perm_quick_add_product',
                'perm_manage_ledger', 'perm_view_reports', 'perm_monthly_comparison',
                'perm_customer_app_connect', 'perm_manage_staff', 'perm_send_sms',
                'perm_manage_tickets', 'perm_manage_notifications', 'perm_manage_warehouse_messages',
                'perm_manage_site_settings', 'perm_manage_sliders', 'perm_manage_footer_settings',
                'perm_delete_receipts',
            )
        }),
    )

    def save_model(self, request, obj, form, change):
        raw_password = form.cleaned_data.get('password')
        if raw_password:
            obj.set_password(raw_password)
        super().save_model(request, obj, form, change)

    def user_name(self, obj):
        if not obj.user:
            return '-'
        return (
            getattr(obj.user, 'full_name', None)
            or getattr(obj.user, 'first_name', None)
            or getattr(obj.user, 'phone', None)
            or getattr(obj.user, 'mobile', None)
            or getattr(obj.user, 'username', None)
            or str(obj.user)
        )
    user_name.short_description = 'نام و نام‌خانوادگی'

    def user_phone(self, obj):
        if not obj.user:
            return '-'
        return (
            getattr(obj.user, 'phone', None)
            or getattr(obj.user, 'mobile', None)
            or getattr(obj.user, 'phone_number', None)
            or getattr(obj.user, 'username', None)
            or str(obj.user)
        )
    user_phone.short_description = 'شماره همراه'`;

  const serializersCode = `from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PosStaff

User = get_user_model()

PERMISSION_FIELDS = [
    'manage_pos', 'manage_inventory', 'quick_add_product', 'manage_ledger',
    'view_reports', 'monthly_comparison', 'customer_app_connect',
    'manage_staff', 'send_sms', 'manage_tickets', 'manage_notifications',
    'manage_warehouse_messages', 'manage_site_settings', 'manage_sliders',
    'manage_footer_settings', 'delete_receipts',
]

PERMISSION_LABELS_FA = {
    'manage_pos': 'فروش و صدور فاکتور صندوق',
    'manage_inventory': 'مدیریت انبار و کاردکس کالاها',
    'quick_add_product': 'ثبت سریع کالا در انبار',
    'manage_ledger': 'دفتر فاکتورها و حساب‌های نسیه',
    'view_reports': 'مشاهده گزارشات و آمار مالی',
    'monthly_comparison': 'تحلیل مقایسه‌ای فروش ماهانه',
    'customer_app_connect': 'اتصال به باشگاه مشتریان',
    'manage_staff': 'مدیریت پرسنل و دسترسی‌ها',
    'send_sms': 'ارسال پیامک هوشمند کاوه‌نگار',
    'manage_tickets': 'پاسخگویی به تیکت‌های پشتیبانی',
    'manage_notifications': 'ارسال اعلانات و نوتیفیکیشن',
    'manage_warehouse_messages': 'صندوق پیام‌های تماس سایت',
    'manage_site_settings': 'مدیریت تنظیمات عمومی سایت',
    'manage_sliders': 'مدیریت اسلایدرها و بنرها',
    'manage_footer_settings': 'مدیریت تنظیمات فوتر',
    'delete_receipts': 'حق ابطال و حذف فاکتورها',
}


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(max_length=50, trim_whitespace=False)
    remember_me = serializers.BooleanField(required=False, default=True)

    def validate_phone(self, value):
        value = value.strip()
        if not value.isdigit():
            raise serializers.ValidationError("شماره همراه باید فقط شامل عدد باشد.")
        return value


class PosStaffCreateSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15, min_length=10)
    full_name = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=50, min_length=4, trim_whitespace=False)
    role = serializers.ChoiceField(choices=PosStaff.ROLE_CHOICES, default='cashier')
    roleTitleFa = serializers.CharField(max_length=100, required=False, default='صندوقدار')
    permissions = serializers.ListField(
        child=serializers.ChoiceField(choices=PERMISSION_FIELDS),
        required=False,
        default=list,
    )

    def validate_phone(self, value):
        value = value.strip()
        if not value.isdigit():
            raise serializers.ValidationError('شماره همراه باید فقط شامل عدد باشد.')
        username_field = getattr(User, 'USERNAME_FIELD', 'username')
        if User.objects.filter(**{username_field: value}).exists():
            raise serializers.ValidationError('این شماره همراه قبلاً در سیستم ثبت شده است.')
        return value


class PosStaffUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=100, required=False)
    phone = serializers.CharField(max_length=15, min_length=10, required=False)
    password = serializers.CharField(max_length=50, min_length=4, required=False, trim_whitespace=False)
    role = serializers.ChoiceField(choices=PosStaff.ROLE_CHOICES, required=False)
    roleTitleFa = serializers.CharField(max_length=100, required=False)
    permissions = serializers.ListField(
        child=serializers.ChoiceField(choices=PERMISSION_FIELDS),
        required=False,
    )

    def validate_phone(self, value):
        if value:
            value = value.strip()
            if not value.isdigit():
                raise serializers.ValidationError('شماره همراه باید فقط شامل عدد باشد.')
        return value


class PosStaffOutSerializer(serializers.ModelSerializer):
    fullName = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    roleTitleFa = serializers.CharField(source='role_title')
    permissions = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%Y/%m/%d')

    class Meta:
        model = PosStaff
        fields = [
            'id', 'fullName', 'phone', 'role', 'roleTitleFa',
            'is_active', 'status', 'permissions', 'created_at',
        ]

    def get_fullName(self, obj):
        user = obj.user
        return (
            getattr(user, 'full_name', None)
            or getattr(user, 'first_name', None)
            or self.get_phone(obj)
        )

    def get_phone(self, obj):
        user = obj.user
        return getattr(user, 'phone', None) or getattr(user, 'mobile', None) or getattr(user, 'username', '')

    def get_permissions(self, obj):
        return [name for name in PERMISSION_FIELDS if getattr(obj, f'perm_{name}', False)]

    def get_status(self, obj):
        return 'active' if obj.is_active else 'suspended'


class PosStaffDetailSerializer(serializers.ModelSerializer):
    fullName = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    roleTitleFa = serializers.CharField(source='role_title')
    permissions_array = serializers.SerializerMethodField()
    permissions_matrix = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%Y/%m/%d - %H:%M')

    class Meta:
        model = PosStaff
        fields = [
            'id', 'fullName', 'phone', 'role', 'roleTitleFa',
            'is_active', 'status', 'permissions_array', 'permissions_matrix', 'created_at',
        ]

    def get_fullName(self, obj):
        user = obj.user
        return getattr(user, 'full_name', None) or getattr(user, 'first_name', None) or ''

    def get_phone(self, obj):
        user = obj.user
        return getattr(user, 'phone', None) or getattr(user, 'mobile', None) or getattr(user, 'username', '')

    def get_permissions_array(self, obj):
        return [name for name in PERMISSION_FIELDS if getattr(obj, f'perm_{name}', False)]

    def get_permissions_matrix(self, obj):
        return {
            name: {
                'active': getattr(obj, f'perm_{name}', False),
                'label': PERMISSION_LABELS_FA.get(name, name)
            }
            for name in PERMISSION_FIELDS
        }

    def get_status(self, obj):
        return 'active' if obj.is_active else 'suspended'


class PosStaffResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(min_length=4, max_length=50, required=True, trim_whitespace=False)
    confirm_password = serializers.CharField(min_length=4, max_length=50, required=True, trim_whitespace=False)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "رمز عبور جدید و تکرار آن یکسان نیستند."})
        return attrs


class PosStaffActiveSessionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    fullName = serializers.CharField()
    phone = serializers.CharField()
    role = serializers.CharField()
    roleTitleFa = serializers.CharField()
    status = serializers.CharField(default='online')`;

  const viewsCode = `from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema

from .models import PosStaff
from .permissions import IsPosSuperAdminOrHasStaffPermission
from .serializers import (
    PosStaffCreateSerializer,
    PosStaffUpdateSerializer,
    PosStaffOutSerializer,
    PosStaffDetailSerializer,
    PosStaffResetPasswordSerializer,
    PosStaffActiveSessionSerializer,
    LoginSerializer,
    PERMISSION_FIELDS,
)

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


def resolve_role_and_permissions(user, pos_staff):
    if pos_staff is not None:
        role = pos_staff.role
        role_title = pos_staff.role_title
        permissions = [name for name in PERMISSION_FIELDS if getattr(pos_staff, f'perm_{name}', False)]
        return role, role_title, permissions
    if user.is_superuser:
        return 'super_admin', 'مدیر ارشد سیستم', list(PERMISSION_FIELDS)
    return None


class LoginStaffAPIView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'pos_login'

    @swagger_auto_schema(
        operation_summary="ورود پرسنل صندوق",
        request_body=LoginSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        password = serializer.validated_data['password']

        user = authenticate(request, username=phone, password=password)
        if user is None:
            return Response({"success": False, "message": "شماره همراه یا رمز عبور اشتباه است."}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({"success": False, "message": "حساب کاربری شما غیرفعال است."}, status=status.HTTP_403_FORBIDDEN)

        pos_staff = getattr(user, 'pos_profile', None)
        if pos_staff is not None and not pos_staff.is_active:
            return Response({"success": False, "message": "دسترسی شما به پنل صندوق مسدود شده است."}, status=status.HTTP_403_FORBIDDEN)

        resolved = resolve_role_and_permissions(user, pos_staff)
        if resolved is None:
            return Response({"success": False, "message": "شما دسترسی به صندوق فروشگاهی را ندارید."}, status=status.HTTP_403_FORBIDDEN)
        role, role_title, permissions = resolved

        tokens = get_tokens_for_user(user)
        user_phone = getattr(user, 'phone', None) or getattr(user, 'username', None) or str(user)

        response_data = {
            "success": True,
            "message": "ورود موفقیت‌آمیز بود.",
            "data": {
                "user": {
                    "id": user.id,
                    "phone": user_phone,
                    "fullName": getattr(user, 'full_name', None) or getattr(user, 'first_name', None) or user_phone,
                    "role": role,
                    "roleTitleFa": role_title,
                    "permissions": permissions,
                    "status": "active" if user.is_active else "suspended",
                },
                "tokens": tokens,
            },
        }
        response = Response(response_data, status=status.HTTP_200_OK)
        response.set_cookie('access', tokens['access'], httponly=True, samesite='Lax', secure=not settings.DEBUG)
        response.set_cookie('refresh', tokens['refresh'], httponly=True, samesite='Lax', secure=not settings.DEBUG)
        return response


class LogoutStaffAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="خروج پرسنل صندوق و حذف نشست",
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        refresh_token = request.data.get('refresh') or request.COOKIES.get('refresh')
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass

        response = Response({"success": True, "message": "خروج موفقیت‌آمیز بود."}, status=status.HTTP_200_OK)
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response


class CurrentStaffProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت پروفایل پرسنل آنلاین جاری",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request):
        user = request.user
        pos_staff = getattr(user, 'pos_profile', None)
        resolved = resolve_role_and_permissions(user, pos_staff)
        if resolved is None:
            return Response({"success": False, "message": "دسترسی یافت نشد."}, status=status.HTTP_403_FORBIDDEN)
        role, role_title, permissions = resolved
        user_phone = getattr(user, 'phone', None) or getattr(user, 'username', None) or str(user)
        full_name = getattr(user, 'full_name', None) or getattr(user, 'first_name', None) or user_phone

        return Response({
            "success": True,
            "data": {
                "id": user.id,
                "phone": user_phone,
                "fullName": full_name,
                "role": role,
                "roleTitleFa": role_title,
                "permissions": permissions,
                "status": "active" if user.is_active else "suspended"
            }
        }, status=status.HTTP_200_OK)


class ActiveStaffSessionsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="لیست صندوقدارهای آنلاین همزمان",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request):
        active_staff = PosStaff.objects.filter(is_active=True).select_related('user')
        online_sessions = []
        for staff in active_staff:
            user = staff.user
            user_phone = getattr(user, 'phone', None) or getattr(user, 'username', None) or str(user)
            online_sessions.append({
                "id": user.id,
                "fullName": getattr(user, 'full_name', None) or getattr(user, 'first_name', None) or user_phone,
                "phone": user_phone,
                "role": staff.role,
                "roleTitleFa": staff.role_title,
                "status": "online",
            })
        serializer = PosStaffActiveSessionSerializer(online_sessions, many=True)
        return Response({
            "success": True,
            "count": len(online_sessions),
            "allow_concurrent_logins": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)


class CreateStaffAPIView(APIView):
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="ایجاد پرسنل صندوق جدید",
        request_body=PosStaffCreateSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        serializer = PosStaffCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        phone = data['phone']
        role = data['role']

        if role == 'super_admin' and not request.user.is_superuser:
            return Response({"success": False, "message": "فقط مدیر ارشد می‌تواند نقش مدیر ارشد ایجاد کند."}, status=status.HTTP_403_FORBIDDEN)

        username_field = getattr(User, 'USERNAME_FIELD', 'username')
        if User.objects.filter(**{username_field: phone}).exists():
            return Response({"success": False, "message": "این شماره همراه قبلاً در سیستم ثبت شده است."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user = User.objects.create_user(**{username_field: phone}, password=data['password'])

            if hasattr(user, 'full_name'):
                user.full_name = data['full_name']
            elif hasattr(user, 'first_name'):
                user.first_name = data['full_name']

            user.is_staff = True
            if role == 'super_admin':
                user.is_superuser = True
            user.save()

            perms_map = {
                f'perm_{name}': name in data.get('permissions', [])
                for name in PERMISSION_FIELDS
            }
            PosStaff.objects.create(
                user=user,
                role=role,
                role_title=data.get('roleTitleFa') or 'صندوقدار',
                **perms_map,
            )

        return Response({"success": True, "message": "پرسنل صندوق با موفقیت در دیتابیس ثبت شد."}, status=status.HTTP_201_CREATED)


class ListStaffAPIView(APIView):
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="دریافت لیست پرسنل صندوق و انبار",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request):
        staff_qs = PosStaff.objects.select_related('user').all().order_by('-created_at')
        serializer = PosStaffOutSerializer(staff_qs, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class StaffDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات کامل پرسنل",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PosStaffDetailSerializer(staff)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ویرایش اطلاعات پرسنل صندوق",
        request_body=PosStaffUpdateSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def put(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PosStaffUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if data.get('role') == 'super_admin' and not request.user.is_superuser:
            return Response({"success": False, "message": "فقط مدیر ارشد می‌تواند نقش مدیر ارشد اعطا کند."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            user = staff.user
            if 'full_name' in data:
                if hasattr(user, 'full_name'):
                    user.full_name = data['full_name']
                elif hasattr(user, 'first_name'):
                    user.first_name = data['full_name']
            if 'phone' in data:
                if hasattr(user, 'phone'):
                    user.phone = data['phone']
                elif hasattr(user, 'mobile'):
                    user.mobile = data['phone']
            if 'password' in data and data['password']:
                staff.set_password(data['password'])
            user.save()

            if 'role' in data:
                staff.role = data['role']
            if 'roleTitleFa' in data:
                staff.role_title = data['roleTitleFa']
            if 'permissions' in data:
                for name in PERMISSION_FIELDS:
                    setattr(staff, f'perm_{name}', name in data['permissions'])

            staff.save()

        return Response({"success": True, "message": "اطلاعات پرسنل با موفقیت به روز شد."}, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="حذف پرسنل صندوق",
        tags=['مدیریت پرسنل صندوق']
    )
    def delete(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        if staff.user_id == request.user.id:
            return Response({"success": False, "message": "امکان حذف حساب خودتان وجود ندارد."}, status=status.HTTP_400_BAD_REQUEST)

        if staff.role == 'super_admin' and not request.user.is_superuser:
            return Response({"success": False, "message": "فقط مدیر ارشد می‌تواند مدیر ارشد دیگر را حذف کند."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            user = staff.user
            staff.delete()
            if user:
                user.delete()

        return Response({"success": True, "message": "پرسنل با موفقیت حذف شد."}, status=status.HTTP_200_OK)


class ToggleLockStaffAPIView(APIView):
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="تغییر وضعیت قفل / تعلیق پرسنل",
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        if staff.user_id == request.user.id:
            return Response({"success": False, "message": "امکان قفل کردن حساب خودتان وجود ندارد."}, status=status.HTTP_400_BAD_REQUEST)

        staff.is_active = not staff.is_active
        staff.save()

        if staff.user and hasattr(staff.user, 'is_active'):
            staff.user.is_active = staff.is_active
            staff.user.save(update_fields=['is_active'])

        status_str = "active" if staff.is_active else "suspended"
        msg = "کاربر با موفقیت فعال شد." if staff.is_active else "کاربر با موفقیت قفل / تعلیق شد."
        return Response({
            "success": True,
            "is_active": staff.is_active,
            "status": status_str,
            "message": msg,
        }, status=status.HTTP_200_OK)


class ResetStaffPasswordAPIView(APIView):
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="تغییر پین‌کد یا رمز عبور پرسنل",
        request_body=PosStaffResetPasswordSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PosStaffResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_password = serializer.validated_data['new_password']

        staff.set_password(new_password)
        staff.save()

        return Response({"success": True, "message": "رمز عبور پرسنل با موفقیت تغییر یافت."}, status=status.HTTP_200_OK)`;

  const urlsCode = `from django.urls import path
from .views import (
    LoginStaffAPIView,
    LogoutStaffAPIView,
    CurrentStaffProfileAPIView,
    ActiveStaffSessionsAPIView,
    CreateStaffAPIView,
    ListStaffAPIView,
    StaffDetailAPIView,
    ToggleLockStaffAPIView,
    ResetStaffPasswordAPIView,
)

app_name = 'posuser'

urlpatterns = [
    # ۱. ورود پرسنل صندوق و انبار
    path('login/', LoginStaffAPIView.as_view(), name='login-staff'),
    # ۲. خروج پرسنل
    path('logout/', LogoutStaffAPIView.as_view(), name='logout-staff'),
    # ۳. دریافت پروفایل کاربر جاری آنلاین
    path('profile/', CurrentStaffProfileAPIView.as_view(), name='current-profile'),
    # ۴. لیست جلسات آنلاین صندوق‌داران
    path('active-sessions/', ActiveStaffSessionsAPIView.as_view(), name='active-sessions'),
    # ۵. ایجاد پرسنل جدید
    path('create-staff/', CreateStaffAPIView.as_view(), name='create-staff'),
    # ۶. دریافت لیست کامل پرسنل
    path('staff-list/', ListStaffAPIView.as_view(), name='list-staff'),
    # ۷. مشاهده جزئیات، ویرایش و حذف پرسنل
    path('staff/<int:pk>/', StaffDetailAPIView.as_view(), name='staff-detail'),
    # ۸. قفل / فعال‌سازی حساب پرسنل
    path('staff/<int:pk>/toggle-lock/', ToggleLockStaffAPIView.as_view(), name='toggle-lock-staff'),
    # ۹. تغییر / بازنشانی پین‌کد پرسنل
    path('staff/<int:pk>/reset-password/', ResetStaffPasswordAPIView.as_view(), name='reset-password-staff'),
]`;

  const permissionsCode = `from rest_framework.permissions import BasePermission


class IsPosSuperAdminOrHasStaffPermission(BasePermission):
    """
    اجازه دسترسی فقط به:
    - کاربران super_admin (is_superuser=True) در جنگو، یا
    - کاربرانی که پروفایل PosStaff فعال دارند و perm_manage_staff آن‌ها True است.

    این کلاس جایگزین AllowAny در تمام endpointهای مدیریت پرسنل شده است.
    """
    message = 'شما اجازه مدیریت پرسنل صندوق را ندارید.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        staff = getattr(user, 'pos_profile', None)
        return bool(staff and staff.is_active and staff.perm_manage_staff)`;

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
      path: '/api/v1/posuser/login/',
      auth: 'AllowAny (Rate Throttle: pos_login)',
      description: 'ورود پرسنل صندوق و انبار و دریافت توکن‌های JWT و ست شدن کوکی',
      requestBody: JSON.stringify({
        phone: "09120759419",
        password: "your_password"
      }, null, 2),
      responseBody: JSON.stringify({
        success: true,
        message: "ورود موفقیت‌آمیز بود.",
        data: {
          user: { id: 1, phone: "09120759419", fullName: "مدیر ارشد", role: "super_admin", roleTitleFa: "مدیر ارشد سامانه", permissions: ["manage_pos", "manage_inventory"], status: "active" },
          tokens: { access: "...", refresh: "..." }
        }
      }, null, 2),
      curlExample: `curl -X POST https://cigar.sevinhost.ir/api/v1/posuser/login/ \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"09120759419","password":"your_password"}'`
    },
    {
      method: 'POST',
      path: '/api/v1/posuser/logout/',
      auth: 'IsAuthenticated',
      description: 'خروج پرسنل صندوق و بلک‌لیست توکن refresh',
      responseBody: JSON.stringify({
        success: true,
        message: "خروج موفقیت‌آمیز بود."
      }, null, 2),
      curlExample: `curl -X POST https://cigar.sevinhost.ir/api/v1/posuser/logout/`
    },
    {
      method: 'GET',
      path: '/api/v1/posuser/profile/',
      auth: 'IsAuthenticated',
      description: 'دریافت مشخصات و لیست دسترسی‌های کاربر آنلاین جاری',
      responseBody: JSON.stringify({
        success: true,
        data: {
          id: 1,
          phone: "09120759419",
          fullName: "مهندس احمد کاظمی",
          role: "warehouse_manager",
          roleTitleFa: "مدیر انبار",
          permissions: ["manage_pos", "manage_inventory"],
          status: "active"
        }
      }, null, 2),
      curlExample: `curl -X GET https://cigar.sevinhost.ir/api/v1/posuser/profile/`
    },
    {
      method: 'GET',
      path: '/api/v1/posuser/active-sessions/',
      auth: 'IsAuthenticated & IsPosSuperAdminOrHasStaffPermission',
      description: 'لیست پرسنل فعال و صندوق‌دارهای آنلاین همزمان',
      responseBody: JSON.stringify({
        success: true,
        count: 1,
        allow_concurrent_logins: true,
        data: [
          {
            id: 1,
            fullName: "مهندس احمد کاظمی",
            phone: "09120759419",
            role: "warehouse_manager",
            roleTitleFa: "مدیر انبار",
            status: "online"
          }
        ]
      }, null, 2),
      curlExample: `curl -X GET https://cigar.sevinhost.ir/api/v1/posuser/active-sessions/`
    },
    {
      method: 'GET',
      path: '/api/v1/posuser/staff-list/',
      auth: 'IsAuthenticated & IsPosSuperAdminOrHasStaffPermission',
      description: 'دریافت لیست کامل پرسنل صندوق و انبار همراه با وضعیت فعالیت و دسترسی‌ها',
      responseBody: JSON.stringify({
        success: true,
        data: [
          {
            id: 1,
            phone: "09120759419",
            fullName: "مهندس احمد کاظمی",
            role: "warehouse_manager",
            roleTitleFa: "مدیر انبار",
            is_active: true,
            status: "active",
            permissions: ["manage_pos", "manage_inventory"],
            created_at: "1403/06/15"
          }
        ]
      }, null, 2),
      curlExample: `curl -X GET https://cigar.sevinhost.ir/api/v1/posuser/staff-list/`
    },
    {
      method: 'POST',
      path: '/api/v1/posuser/create-staff/',
      auth: 'IsAuthenticated & IsPosSuperAdminOrHasStaffPermission',
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
      curlExample: `curl -X POST https://cigar.sevinhost.ir/api/v1/posuser/create-staff/ \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"09120759419","full_name":"مهندس احمد کاظمی","password":"1234","role":"warehouse_manager","roleTitleFa":"مدیر انبار","permissions":["manage_pos","manage_inventory","quick_add_product"]}'`
    },
    {
      method: 'PUT',
      path: '/api/v1/posuser/staff/{id}/',
      auth: 'IsAuthenticated & IsPosSuperAdminOrHasStaffPermission',
      description: 'ویرایش اطلاعات، رمز عبور، نقش و دسترسی‌های پرسنل با شناسه',
      requestBody: JSON.stringify({
        full_name: "احمد کاظمی (ویرایش)",
        phone: "09120759419",
        role: "cashier",
        roleTitleFa: "صندوق‌دار",
        permissions: ["manage_pos"]
      }, null, 2),
      responseBody: JSON.stringify({
        success: true,
        message: "اطلاعات پرسنل با موفقیت به روز شد."
      }, null, 2),
      curlExample: `curl -X PUT https://cigar.sevinhost.ir/api/v1/posuser/staff/1/ \\
  -H "Content-Type: application/json" \\
  -d '{"full_name":"احمد کاظمی","phone":"09120759419","role":"cashier","roleTitleFa":"صندوق‌دار","permissions":["manage_pos"]}'`
    },
    {
      method: 'DELETE',
      path: '/api/v1/posuser/staff/{id}/',
      auth: 'IsAuthenticated & IsPosSuperAdminOrHasStaffPermission',
      description: 'حذف کامل پرسنل و حساب کاربری متصل به آن با شناسه',
      responseBody: JSON.stringify({
        success: true,
        message: "پرسنل با موفقیت حذف شد."
      }, null, 2),
      curlExample: `curl -X DELETE https://cigar.sevinhost.ir/api/v1/posuser/staff/1/`
    },
    {
      method: 'POST',
      path: '/api/v1/posuser/staff/{id}/toggle-lock/',
      auth: 'IsAuthenticated & IsPosSuperAdminOrHasStaffPermission',
      description: 'قفل کردن یا فعال‌سازی مجدد پرسنل (تغییر وضعیت فعال/تعلیق)',
      responseBody: JSON.stringify({
        success: true,
        is_active: false,
        status: "suspended",
        message: "کاربر با موفقیت قفل / تعلیق شد."
      }, null, 2),
      curlExample: `curl -X POST https://cigar.sevinhost.ir/api/v1/posuser/staff/1/toggle-lock/`
    },
    {
      method: 'POST',
      path: '/api/v1/posuser/staff/{id}/reset-password/',
      auth: 'IsAuthenticated & IsPosSuperAdminOrHasStaffPermission',
      description: 'تغییر و بازنشانی پین‌کد یا رمز عبور پرسنل توسط مدیر',
      requestBody: JSON.stringify({
        new_password: "5678",
        confirm_password: "5678"
      }, null, 2),
      responseBody: JSON.stringify({
        success: true,
        message: "رمز عبور پرسنل با موفقیت تغییر یافت."
      }, null, 2),
      curlExample: `curl -X POST https://cigar.sevinhost.ir/api/v1/posuser/staff/1/reset-password/ \\
  -H "Content-Type: application/json" \\
  -d '{"new_password":"5678","confirm_password":"5678"}'`
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
      servicesCode={permissionsCode}
      servicesFileName="permissions.py"
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
