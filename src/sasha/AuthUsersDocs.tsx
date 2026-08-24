import React, { useState } from 'react';
import { UserCheck, Copy, Check, FileCode, KeyRound, ShieldAlert, LogOut, Clock, Layers } from 'lucide-react';
import { CodeTab } from './types';

export const AuthUsersDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelsCode = `"""
accounts/models.py
مدل سفارشی کاربر (Custom User Model) با احراز هویت بر پایه شماره موبایل و نقش‌های مختلف:
- خریدار عمده (Wholesale Customer)
- مغازه‌دار / خرده‌فروش (Retail Shop)
- ویزیتور و بنکدار (Visitor / Agent)
- مدیر سیستم (Admin / Superuser)
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class UserManager(BaseUserManager):
    """مدیریت ساخت کاربر عادی و سوپریوزر"""
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError(_('وارد کردن شماره موبایل الزامی است.'))
        
        phone = phone.strip()
        user = self.model(phone=phone, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('سوپریوزر باید دسترسی is_staff=True داشته باشد.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('سوپریوزر باید دسترسی is_superuser=True داشته باشد.'))

        return self.create_user(phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """مدل اصلی کاربر در سامانه"""
    ROLE_CHOICES = (
        ('wholesale', 'خریدار عمده (بنکدار / پخش)'),
        ('retailer', 'مغازه‌دار / فروشگاه'),
        ('visitor', 'ویزیتور و بازاریاب رسمی'),
        ('admin', 'مدیر کل سامانه'),
    )

    phone = models.CharField(_('شماره همراه'), max_length=15, unique=True, db_index=True)
    full_name = models.CharField(_('نام و نام خانوادگی / نام فروشگاه'), max_length=150)
    role = models.CharField(_('نقش کاربری'), max_length=20, choices=ROLE_CHOICES, default='wholesale')
    
    # مشخصات شرکتی و صدور فاکتور رسمی
    company_name = models.CharField(_('نام شرکت / مجموعه'), max_length=150, blank=True, null=True)
    national_id = models.CharField(_('کد ملی / شناسه ملی'), max_length=20, blank=True, null=True)
    economic_code = models.CharField(_('کد اقتصادی'), max_length=25, blank=True, null=True)
    city = models.CharField(_('شهر انبار خریدار'), max_length=60, default='تهران')
    address = models.TextField(_('آدرس دقیق تحویل بار'), blank=True, null=True)
    postal_code = models.CharField(_('کد پستی'), max_length=10, blank=True, null=True)

    # کیف پول و امتیاز باشگاه
    wallet_balance = models.DecimalField(_('موجودی کیف پول (تومان)'), max_digits=12, decimal_places=0, default=0)
    referral_code = models.CharField(_('کد معرف اختصاصی'), max_length=30, blank=True, null=True)

    # وضعیت‌ها و مجوزهای جنگو
    is_active = models.BooleanField(_('کاربر فعال'), default=True)
    is_staff = models.BooleanField(_('دسترسی به پنل مدیریت'), default=False)
    date_joined = models.DateTimeField(_('تاریخ عضویت'), default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = _('کاربر')
        verbose_name_plural = _('کاربران و مشتریان')
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.full_name} ({self.phone}) - {self.get_role_display()}"
`;

  const adminCode = `"""
accounts/admin.py
مدیریت پیشرفته کاربران در پنل ادمین جنگو
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('phone', 'full_name', 'role', 'city', 'wallet_balance', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'city', 'date_joined')
    search_fields = ('phone', 'full_name', 'company_name', 'national_id', 'economic_code')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (_('اطلاعات ورود و هویت'), {
            'fields': ('phone', 'password', 'full_name', 'role')
        }),
        (_('مشخصات حقوقی و فاکتور رسمی'), {
            'fields': ('company_name', 'national_id', 'economic_code', 'city', 'address', 'postal_code')
        }),
        (_('کیف پول و بازاریابی'), {
            'fields': ('wallet_balance', 'referral_code')
        }),
        (_('دسترسی‌ها و وضعیت'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('تاریخ‌ها'), {
            'fields': ('last_login', 'date_joined')
        }),
    )
    readonly_fields = ('last_login', 'date_joined')
`;

  const serializersCode = `"""
accounts/serializers.py
سریالایزرهای DRF برای ثبت نام، لاگین، دریافت توکن JWT، ویرایش پروفایل و خروج (Logout)
"""

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate
from .models import User


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'phone', 'full_name', 'password', 'role', 'city', 'address', 'company_name', 'national_id', 'economic_code']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        phone = attrs.get('phone')
        password = attrs.get('password')
        user = authenticate(phone=phone, password=password)

        if not user:
            raise serializers.ValidationError('شماره موبایل یا رمز عبور اشتباه است.')
        if not user.is_active:
            raise serializers.ValidationError('حساب کاربری شما غیرفعال شده است.')

        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'phone', 'full_name', 'role', 'company_name',
            'national_id', 'economic_code', 'city', 'address',
            'postal_code', 'wallet_balance', 'referral_code', 'date_joined'
        ]
        read_only_fields = ['id', 'phone', 'role', 'wallet_balance', 'date_joined']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text="توکن رفرش (Refresh Token) جهت ابطال و بلک‌لیست")

    def validate(self, attrs):
        self.token = attrs.get('refresh')
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            raise serializers.ValidationError({'detail': 'توکن نامعتبر یا قبلاً منقضی شده است.'})
`;

  const viewsCode = `"""
accounts/views.py
ویوهای API جنگو با پشتیبانی از Swagger و احراز هویت JWT با انقضای نیم‌ساعته
"""

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import User
from .serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    LogoutSerializer
)


class RegisterAPIView(generics.CreateAPIView):
    """
    ثبت نام کاربر جدید با شماره موبایل و رمز عبور
    """
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="ثبت نام کاربر عمده‌فروش یا مغازه‌دار در سامانه",
        responses={201: UserProfileSerializer},
        tags=["احراز هویت و کاربران"]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class LoginAPIView(APIView):
    """
    ورود کاربر و صدور جفت توکن JWT (Access با اعتبار ۳۰ دقیقه + Refresh)
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        request_body=UserLoginSerializer,
        operation_description="ورود به سیستم و دریافت توکن JWT (انقضای نیم‌ساعته)",
        responses={
            200: openapi.Response(
                description="موفقیت در ورود",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'access': openapi.Schema(type=openapi.TYPE_STRING, description='توکن دسترسی نیم‌ساعته'),
                        'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='توکن تمدید هفتگی'),
                        'user': openapi.Schema(type=openapi.TYPE_OBJECT, description='اطلاعات پروفایل کاربر')
                    }
                )
            )
        },
        tags=["احراز هویت و کاربران"]
    )
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)


class LogoutAPIView(APIView):
    """
    خروج از حساب کاربری و باطل‌سازی (Blacklist) توکن رفرش
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        request_body=LogoutSerializer,
        operation_description="خروج و باطل‌سازی قطعی توکن رفرش JWT",
        responses={200: "با موفقیت خارج شدید."},
        tags=["احراز هویت و کاربران"]
    )
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'از حساب کاربری خارج شدید و توکن باطل گردید.'}, status=status.HTTP_200_OK)


class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    """
    مشاهده و ویرایش اطلاعات پروفایل کاربری
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="دریافت مشخصات کاربر احراز هویت شده",
        tags=["احراز هویت و کاربران"]
    )
    def get_object(self):
        return self.request.user


class ChangePasswordAPIView(APIView):
    """
    تغییر رمز عبور کاربر لاگین‌شده
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        request_body=ChangePasswordSerializer,
        operation_description="تغییر رمز عبور با اعتبارسنجی رمز پیشین",
        tags=["احراز هویت و کاربران"]
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': ['رمز عبور فعلی نادرست است.']}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'رمز عبور با موفقیت به‌روزرسانی شد.'}, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
accounts/urls.py
مسیرهای روت برای احراز هویت و مدیریت کاربران
"""

from django.urls import path
from .views import (
    RegisterAPIView,
    LoginAPIView,
    LogoutAPIView,
    UserProfileAPIView,
    ChangePasswordAPIView
)

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('profile/', UserProfileAPIView.as_view(), name='profile'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change_password'),
]
`;

  return (
    <div className="space-y-6 text-slate-800 text-right" dir="rtl">
      
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">اپلیکیشن کاربران (accounts)</div>
            <h1 className="text-2xl font-black text-slate-900">
              مدیریت کاربران، لاگین، ثبت نام و توکن JWT با انقضای ۳۰ دقیقه
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          این ماژول شامل سیستم ورود با شماره موبایل، تولید توکن‌های ایمن Simple JWT با زمان اعتبار دقیق ۳۰ دقیقه‌ای، API خروج با ویژگی Blacklist توکن، و ثبت مشخصات حقوقی برای فاکتور رسمی است.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-blue-900">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>انقضای توکن: نیم ساعت (۳۰ دقیقه)</span>
          </div>
          <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-indigo-900">
            <LogOut className="w-4 h-4 text-indigo-600" />
            <span>خروج با Blacklist توکن</span>
          </div>
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-900">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>پشتیبانی Swagger Auto-Schema</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'models', label: 'مدل‌ها (models.py)' },
          { id: 'admin', label: 'پنل ادمین (admin.py)' },
          { id: 'serializers', label: 'سریالایزرها (serializers.py)' },
          { id: 'views', label: 'ویوهای API (views.py)' },
          { id: 'urls', label: 'روت‌ها (urls.py)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as CodeTab)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 relative font-mono text-xs shadow-xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4" dir="ltr">
          <span className="text-slate-400 font-bold">
            accounts/{activeTab === 'models' ? 'models.py' : activeTab === 'admin' ? 'admin.py' : activeTab === 'serializers' ? 'serializers.py' : activeTab === 'views' ? 'views.py' : 'urls.py'}
          </span>
          <button
            onClick={() => handleCopy(
              activeTab === 'models' ? modelsCode : activeTab === 'admin' ? adminCode : activeTab === 'serializers' ? serializersCode : activeTab === 'views' ? viewsCode : urlsCode,
              activeTab
            )}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            {copiedKey === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی کد</span>
              </>
            )}
          </button>
        </div>

        <pre className="overflow-x-auto text-left leading-relaxed whitespace-pre font-mono text-[11px] sm:text-xs" dir="ltr">
          {activeTab === 'models' ? modelsCode : activeTab === 'admin' ? adminCode : activeTab === 'serializers' ? serializersCode : activeTab === 'views' ? viewsCode : urlsCode}
        </pre>
      </div>

    </div>
  );
};
