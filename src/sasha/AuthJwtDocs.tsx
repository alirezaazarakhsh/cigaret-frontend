import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Clock, 
  LogOut, 
  UserCheck, 
  Copy, 
  Check, 
  FileCode, 
  CheckCircle2, 
  Sparkles,
  Smartphone,
  Lock
} from 'lucide-react';

export const AuthJwtDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'models' | 'admin' | 'serializers' | 'views' | 'urls' | 'swagger'>('models');

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-indigo-800 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30">
            <Key className="w-4 h-4" />
            <span>احراز هویت و امنیت JWT (انقضای ۳۰ دقیقه و خروج)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            اپلیکیشن کاربران و احراز هویت (accounts)
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-3xl">
            پیاده‌سازی مدل کاربری اختصاصی با شماره موبایل، ورود با رمز عبور یا کد یکبارمصرف (OTP)، تولید توکن JWT با انقضای دقیق ۳۰ دقیقه، و خروج امن با افزودن توکن به لیست سیاه (Token Blacklist).
          </p>
        </div>
      </div>

      {/* 30-min Auto Logout Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>انقضای ۳۰ دقیقه‌ای توکن</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            توکن دسترسی (Access Token) دقیقا بعد از ۳۰ دقیقه باطل می‌شود و کاربر به طور خودکار از سامانه خارج می‌گردد.
          </p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs">
            <LogOut className="w-4 h-4 text-blue-600" />
            <span>ای‌پی‌آی خروج (Logout)</span>
          </div>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            با ارسال درخواست خروج، Refresh Token در دیتابیس مسدود (Blacklist) شده و استفاده مجدد از آن غیرممکن می‌شود.
          </p>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <span>ورود پیامکی و رمز عبور</span>
          </div>
          <p className="text-[11px] text-purple-700 leading-relaxed">
            پشتیبانی از مدل کاربری سفارشی (Custom User) بر اساس فیلد اصلی شماره تلفن همراه ۱۱ رقمی ایران.
          </p>
        </div>
      </div>

      {/* Code Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'models', label: 'مدل‌ها (models.py)' },
          { id: 'admin', label: 'پنل ادمین (admin.py)' },
          { id: 'serializers', label: 'سریالایزرها (serializers.py)' },
          { id: 'views', label: 'ویوها و کنترلرها (views.py)' },
          { id: 'urls', label: 'مسیرها (urls.py)' },
          { id: 'swagger', label: 'توضیحات و تست Swagger' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveCodeTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCodeTab === t.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: models.py */}
      {activeCodeTab === 'models' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۱. کدهای accounts/models.py</h2>
            <p className="text-xs text-slate-500 mt-1">مدل کاربری سفارشی بدون نیاز به username و صرفا با شماره موبایل + نقش‌های ویزیتور و خریدار عمده.</p>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>accounts/models.py</span>
              <button
                onClick={() => handleCopy('acc_models', `from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, phone, full_name, password=None, **extra_fields):
        if not phone:
            raise ValueError('شماره موبایل الزامی است')
        phone = phone.strip()
        user = self.model(phone=phone, full_name=full_name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(phone, full_name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('customer', 'خریدار عمده / مغازه‌دار'),
        ('visitor', 'ویزیتور میدانی / بازاریاب'),
        ('warehouse', 'انباردار و اپراتور ارسال'),
        ('finance', 'حسابدار و مدیریت مالی'),
        ('admin', 'مدیر کل سیستم'),
    )

    phone = models.CharField(max_length=11, unique=True, db_index=True, verbose_name="شماره همراه")
    full_name = models.CharField(max_length=150, verbose_name="نام و نام خانوادگی")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer', verbose_name="نقش کاربری")
    
    national_id = models.CharField(max_length=10, blank=True, null=True, verbose_name="کد ملی")
    province = models.CharField(max_length=50, blank=True, default='تهران', verbose_name="استان")
    city = models.CharField(max_length=50, blank=True, default='تهران', verbose_name="شهر")
    address = models.TextField(blank=True, verbose_name="آدرس دقیق")
    
    # اطلاعات شغلی
    shop_name = models.CharField(max_length=150, blank=True, verbose_name="نام فروشگاه / دکه")
    shop_license_no = models.CharField(max_length=50, blank=True, verbose_name="شماره جواز کسب")
    referral_code = models.CharField(max_length=20, blank=True, verbose_name="کد معرف")

    is_verified = models.BooleanField(default=False, verbose_name="احراز هویت شده")
    is_active = models.BooleanField(default=True, verbose_name="کاربر فعال")
    is_staff = models.BooleanField(default=False, verbose_name="دسترسی به ادمین")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ عضویت")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="آخرین بروزرسانی")

    objects = UserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران سیستم"

    def __str__(self):
        return f"{self.full_name} ({self.phone}) - {self.get_role_display()}"

class PhoneOTP(models.Model):
    phone = models.CharField(max_length=11, db_index=True, verbose_name="شماره همراه")
    otp_code = models.CharField(max_length=6, verbose_name="کد تایید ۵ یا ۶ رقمی")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان ارسال")
    is_used = models.BooleanField(default=False, verbose_name="مصرف شده")

    class Meta:
        verbose_name = "کد یکبارمصرف OTP"
        verbose_name_plural = "کدهای یکبارمصرف"

    def is_valid(self):
        # کد یکبارمصرف تا ۲ دقیقه معتبر است
        return (timezone.now() - self.created_at).total_seconds() < 120 and not self.is_used`)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedKey === 'acc_models' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'acc_models' ? 'کپی شد' : 'کپی مدل User'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-300" dir="ltr">
{`from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class User(AbstractBaseUser, PermissionsMixin):
    phone = models.CharField(max_length=11, unique=True, verbose_name="شماره همراه")
    full_name = models.CharField(max_length=150, verbose_name="نام و نام خانوادگی")
    role = models.CharField(max_length=20, default='customer')
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['full_name']`}
            </pre>
          </div>
        </section>
      )}

      {/* TAB: admin.py */}
      {activeCodeTab === 'admin' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۲. کدهای accounts/admin.py</h2>
            <p className="text-xs text-slate-500 mt-1">مدیریت کاربران، فیلتر بر اساس نقش، تایید سریع احراز هویت و جستجوی تلفن.</p>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <pre className="p-4 overflow-x-auto text-sky-300" dir="ltr">
{`from django.contrib import admin
from .models import User, PhoneOTP

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('phone', 'full_name', 'role', 'city', 'is_verified', 'is_active', 'created_at')
    list_filter = ('role', 'is_verified', 'is_active', 'province')
    search_fields = ('phone', 'full_name', 'shop_name', 'national_id')
    ordering = ('-created_at',)
    actions = ['verify_users']

    @admin.action(description="تایید احراز هویت کاربران انتخاب شده")
    def verify_users(self, request, queryset):
        queryset.update(is_verified=True)

@admin.register(PhoneOTP)
class PhoneOTPAdmin(admin.ModelAdmin):
    list_display = ('phone', 'otp_code', 'is_used', 'created_at')
    list_filter = ('is_used',)
    search_fields = ('phone',)`}
            </pre>
          </div>
        </section>
      )}

      {/* TAB: serializers.py */}
      {activeCodeTab === 'serializers' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۳. کدهای accounts/serializers.py</h2>
            <p className="text-xs text-slate-500 mt-1">سریالایزرهای ورود با پسورد یا OTP، صدور توکن، ابطال توکن (Logout) و پروفایل.</p>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>accounts/serializers.py</span>
              <button
                onClick={() => handleCopy('acc_ser', `from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, PhoneOTP

class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11, min_length=11)

class VerifyOTPLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11, min_length=11)
    code = serializers.CharField(max_length=6, min_length=4)
    full_name = serializers.CharField(max_length=150, required=False)

class PasswordLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    password = serializers.CharField(write_only=True)

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text="توکن Refresh جهت مسدودسازی و خروج قطعی")

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        try:
            # افزودن توکن به بلک‌لیست دیتابیس
            token = RefreshToken(self.token)
            token.blacklist()
        except Exception as e:
            raise serializers.ValidationError({"error": "توکن ارسالی نامعتبر است یا قبلاً باطل شده."})

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'phone', 'full_name', 'role', 'national_id',
            'province', 'city', 'address', 'shop_name', 'shop_license_no',
            'referral_code', 'is_verified', 'created_at'
        )
        read_only_fields = ('id', 'phone', 'role', 'is_verified', 'created_at')`)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedKey === 'acc_ser' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'acc_ser' ? 'کپی شد' : 'کپی سریالایزرها'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-amber-300" dir="ltr">
{`from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        token = RefreshToken(self.validated_data['refresh'])
        token.blacklist()  # ابطال کامل توکن

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'`}
            </pre>
          </div>
        </section>
      )}

      {/* TAB: views.py */}
      {activeCodeTab === 'views' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۴. کدهای accounts/views.py همراه با اسکیماهای Swagger</h2>
            <p className="text-xs text-slate-500 mt-1">ویوهای ارسال پیامک، ورود و خروج ۳۰ دقیقه‌ای با مستندسازی کامل OpenAPI.</p>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>accounts/views.py</span>
              <button
                onClick={() => handleCopy('acc_views', `import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import User, PhoneOTP
from .serializers import (
    SendOTPSerializer,
    VerifyOTPLoginSerializer,
    LogoutSerializer,
    UserProfileSerializer,
    PasswordLoginSerializer
)

class SendOTPAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_id="send_otp_sms",
        operation_description="ارسال کد تایید پیامکی ۵ رقمی به شماره همراه مشتری یا ویزیتور",
        request_body=SendOTPSerializer,
        responses={200: "کد تایید با موفقیت پیامک شد", 400: "شماره همراه نامعتبر است"},
        tags=["احراز هویت و کاربران"]
    )
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']

        # تولید کد ۵ رقمی تصادفی
        code = str(random.randint(10000, 99999))
        PhoneOTP.objects.create(phone=phone, otp_code=code)
        
        # در اینجا متد ارسال پیامک Kavenegar یا سورس سرویس فراخوانی می‌شود
        print(f"[SMS-GATEWAY] Code for {phone}: {code}")

        return Response({
            'message': 'کد تایید ارسال گردید',
            'phone': phone,
            'expires_in_seconds': 120,
            'dev_hint': code  # جهت تست راحت‌تر در محیط توسعه
        }, status=status.HTTP_200_OK)

class VerifyOTPLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_id="verify_otp_login",
        operation_description="تایید کد پیامکی و صدور توکن JWT با انقضای ۳۰ دقیقه",
        request_body=VerifyOTPLoginSerializer,
        responses={200: "ورود موفق - توکن‌های JWT بازگردانده شدند", 400: "کد اشتباه یا منقضی شده است"},
        tags=["احراز هویت و کاربران"]
    )
    def post(self, request):
        serializer = VerifyOTPLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data['phone']
        code = serializer.validated_data['code']
        full_name = serializer.validated_data.get('full_name', 'همکار گرامی')

        otp_record = PhoneOTP.objects.filter(phone=phone, otp_code=code, is_used=False).order_by('-created_at').first()
        
        if not otp_record or not otp_record.is_valid():
            return Response({'error': 'کد تایید اشتباه است یا منقضی شده است.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_record.is_used = True
        otp_record.save()

        # ساخت یا دریافت کاربر
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={'full_name': full_name, 'role': 'customer'}
        )

        # صدور توکن JWT با انقضای ۳۰ دقیقه
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'ورود با موفقیت انجام شد',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'expires_in': 1800,  # 30 دقیقه (1800 ثانیه)
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)

class LogoutAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="user_logout",
        operation_description="خروج کامل از حساب و قرار دادن توکن Refresh در لیست سیاه (Blacklist)",
        request_body=LogoutSerializer,
        responses={200: "خروج با موفقیت انجام شد و توکن باطل گردید", 400: "توکن نامعتبر است"},
        tags=["احراز هویت و کاربران"]
    )
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'با موفقیت خارج شدید. توکن شما باطل شد.'}, status=status.HTTP_200_OK)

class UserProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="get_current_user_profile",
        operation_description="دریافت اطلاعات هویتی و پروفایل کاربر جاری",
        responses={200: UserProfileSerializer()},
        tags=["احراز هویت و کاربران"]
    )
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)`)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedKey === 'acc_views' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'acc_views' ? 'کپی شد' : 'کپی ویوها'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-300" dir="ltr">
{`class LogoutAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()  # توکن به بلک‌لیست اضافه می‌شود
        return Response({'message': 'خروج موفقیت‌آمیز بود'})`}
            </pre>
          </div>
        </section>
      )}

      {/* TAB: urls.py */}
      {activeCodeTab === 'urls' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۵. کدهای accounts/urls.py</h2>
            <p className="text-xs text-slate-500 mt-1">مسیرهای اختصاصی ورود پیامکی، تمدید توکن (Refresh)، خروج و پروفایل.</p>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>accounts/urls.py</span>
              <button
                onClick={() => handleCopy('acc_urls', `from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    SendOTPAPIView,
    VerifyOTPLoginAPIView,
    LogoutAPIView,
    UserProfileAPIView
)

urlpatterns = [
    # ورود با کد یکبارمصرف
    path('otp/send/', SendOTPAPIView.as_view(), name='send-otp'),
    path('otp/verify/', VerifyOTPLoginAPIView.as_view(), name='verify-otp-login'),
    
    # تمدید توکن منقضی شده قبل از ۳۰ دقیقه
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # خروج از سیستم و ابطال نشست
    path('logout/', LogoutAPIView.as_view(), name='user-logout'),
    
    # پروفایل کاربری
    path('profile/', UserProfileAPIView.as_view(), name='user-profile'),
]`)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedKey === 'acc_urls' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'acc_urls' ? 'کپی شد' : 'کپی مسیرها'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sky-300" dir="ltr">
{`from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import SendOTPAPIView, VerifyOTPLoginAPIView, LogoutAPIView, UserProfileAPIView

urlpatterns = [
    path('otp/send/', SendOTPAPIView.as_view(), name='send-otp'),
    path('otp/verify/', VerifyOTPLoginAPIView.as_view(), name='verify-otp-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutAPIView.as_view(), name='user-logout'),
    path('profile/', UserProfileAPIView.as_view(), name='user-profile'),
]`}
            </pre>
          </div>
        </section>
      )}

      {/* TAB: swagger */}
      {activeCodeTab === 'swagger' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs animate-in fade-in">
          <h2 className="text-lg font-black text-slate-900">۶. راهنمای تست در Swagger UI</h2>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3 text-slate-700 leading-relaxed">
            <p>
              برای تست فرآیند لاگین و خروج در سواگر:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-800">
              <li>به اندپوینت <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">POST /api/v1/accounts/otp/send/</code> مراجعه کرده و شماره تستی مانند <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">09120759419</code> را ارسال کنید.</li>
              <li>سپس در اندپوینت <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">POST /api/v1/accounts/otp/verify/</code> کد دریافتی را وارد کنید تا <code className="font-mono text-emerald-600 font-bold">access</code> و <code className="font-mono text-blue-600 font-bold">refresh</code> بازگردانده شود.</li>
              <li>توکن اکسس را کپی و در دکمه <b>Authorize</b> بالای سواگر وارد کنید.</li>
              <li>جهت تست خروج، اندپوینت <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">POST /api/v1/accounts/logout/</code> را صدا بزنید تا توکن در بلک‌لیست ثبت شود.</li>
            </ol>
          </div>
        </section>
      )}

    </div>
  );
};
