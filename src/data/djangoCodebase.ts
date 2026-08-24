export interface DjangoAppCode {
  id: string;
  name: string;
  nameFa: string;
  icon: string;
  description: string;
  models: string;
  admin: string;
  serializers: string;
  views: string;
  urls: string;
}

export interface DjangoProjectConfig {
  settings: string;
  urls: string;
  requirements: string;
  manage: string;
  env: string;
  setupScript: string;
}

export const DJANGO_APPS_DATA: Record<string, DjangoAppCode> = {
  visitors: {
    id: 'visitors',
    name: 'visitors',
    nameFa: 'اپ ویزیتوران و باشگاه مشتریان مغازه‌داران (Visitors & Retail Club)',
    icon: 'Users',
    description: 'مدیریت ویزیتوران، کدهای تخصصی ویزیتور، باشگاه مشتریان مغازه‌دار و گزارشات محاسبه سود و کمیسیون فروش',
    models: `"""
visitors/models.py
مدل‌های سیستم ویزیتوری، کدهای اختصاصی ویزیتور، باشگاه مشتریان (مغازه‌داران) و گزارش کمیسیون سود
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from orders.models import OrderInvoice


class VisitorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='visitor_profile', verbose_name=_("حساب کاربر ویزیتور"))
    visitor_code = models.CharField(_("کد اختصاصی ویزیتور"), max_length=50, unique=True, db_index=True, help_text="مثال: VISITOR-9419")
    commission_rate = models.DecimalField(_("درصد سود/کمیسیون ویزیتور"), max_digits=5, decimal_places=2, default=2.50, help_text="درصد کمیسیون از هر فروش (مثلا 2.50)")
    total_sales_amount = models.DecimalField(_("مجموع مبلغ فروش‌های ثبت‌شده"), max_digits=14, decimal_places=0, default=0)
    total_commission_earned = models.DecimalField(_("مجموع سود و کمیسیون دریافتی"), max_digits=12, decimal_places=0, default=0)
    is_active = models.BooleanField(_("ویزیتور فعال"), default=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)

    class Meta:
        verbose_name = _("پروفایل ویزیتور")
        verbose_name_plural = _("مدیریت ویزیتوران و کمیسیون‌ها")

    def __str__(self):
        return f"ویزیتور: {self.user.full_name} (کد: {self.visitor_code})"


class RetailShopCustomer(models.Model):
    visitor = models.ForeignKey(VisitorProfile, on_delete=models.CASCADE, related_name='retail_shops', verbose_name=_("ویزیتور معرف"))
    shop_name = models.CharField(_("نام مغازه / سوپرمارکت"), max_length=200)
    owner_name = models.CharField(_("نام صاحب مغازه"), max_length=150)
    phone = models.CharField(_("شماره تماس مغازه‌دار"), max_length=15)
    city = models.CharField(_("شهر"), max_length=60, default="تهران")
    address = models.TextField(_("آدرس دقیق مغازه"))
    license_no = models.CharField(_("شماره پروانه کسب"), max_length=50, blank=True, null=True)
    total_purchases = models.DecimalField(_("مجموع خریدهای مغازه"), max_digits=12, decimal_places=0, default=0)
    created_at = models.DateTimeField(_("تاریخ ثبت در باشگاه"), auto_now_add=True)

    class Meta:
        verbose_name = _("مغازه باشگاه مشتریان")
        verbose_name_plural = _("باشگاه مشتریان مغازه‌داران ویزیتور")

    def __str__(self):
        return f"{self.shop_name} - {self.owner_name} ({self.city})"


class VisitorCommissionLog(models.Model):
    visitor = models.ForeignKey(VisitorProfile, on_delete=models.CASCADE, related_name='commissions', verbose_name=_("ویزیتور"))
    order = models.ForeignKey(OrderInvoice, on_delete=models.CASCADE, related_name='visitor_commissions', verbose_name=_("سفارش مرجع"))
    retail_shop = models.ForeignKey(RetailShopCustomer, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("مغازه خریدار"))
    sale_amount = models.DecimalField(_("مبلغ کل فاکتور فروش"), max_digits=12, decimal_places=0)
    commission_rate = models.DecimalField(_("درصد کمیسیون اعمالی"), max_digits=5, decimal_places=2)
    commission_amount = models.DecimalField(_("مبلغ سود و کمیسیون ویزیتور"), max_digits=10, decimal_places=0)
    is_settled = models.BooleanField(_("تسویه شده با ویزیتور"), default=False)
    created_at = models.DateTimeField(_("تاریخ ثبت تراکنش کمیسیون"), auto_now_add=True)

    class Meta:
        verbose_name = _("گزارش سود و کمیسیون ویزیتور")
        verbose_name_plural = _("گزارشات مالی سود و کمیسیون ویزیتوران")
        ordering = ['-created_at']

    def __str__(self):
        return f"کمیسیون {self.visitor.visitor_code} برای فاکتور {self.order.order_id}: {self.commission_amount} تومان"
`,
    admin: `"""
visitors/admin.py
مدیریت پیشرفته ویزیتوران، باشگاه مشتریان و گزارش سود در پنل جنگو
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import VisitorProfile, RetailShopCustomer, VisitorCommissionLog


@admin.register(VisitorProfile)
class VisitorProfileAdmin(admin.ModelAdmin):
    list_display = ('visitor_code', 'get_full_name', 'commission_rate', 'total_sales_amount', 'total_commission_earned', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('visitor_code', 'user__full_name', 'user__phone')
    actions = ['activate_visitors', 'deactivate_visitors']

    @admin.display(description=_("نام ویزیتور"))
    def get_full_name(self, obj):
        return obj.user.full_name or obj.user.phone

    @admin.action(description=_("✔ فعال‌سازی ویزیتوران انتخاب شده"))
    def activate_visitors(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description=_("⛔ غیرفعال‌سازی ویزیتوران"))
    def deactivate_visitors(self, request, queryset):
        queryset.update(is_active=False)


@admin.register(RetailShopCustomer)
class RetailShopCustomerAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'owner_name', 'phone', 'city', 'get_visitor_code', 'total_purchases', 'created_at')
    list_filter = ('city', 'created_at')
    search_fields = ('shop_name', 'owner_name', 'phone', 'visitor__visitor_code')

    @admin.display(description=_("کد ویزیتور معرف"))
    def get_visitor_code(self, obj):
        return obj.visitor.visitor_code


@admin.register(VisitorCommissionLog)
class VisitorCommissionLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_visitor_code', 'get_shop_name', 'sale_amount', 'commission_amount', 'is_settled', 'created_at')
    list_filter = ('is_settled', 'created_at')
    search_fields = ('visitor__visitor_code', 'order__order_id', 'retail_shop__shop_name')
    actions = ['mark_as_settled']

    @admin.display(description=_("کد ویزیتور"))
    def get_visitor_code(self, obj):
        return obj.visitor.visitor_code

    @admin.display(description=_("مغازه خریدار"))
    def get_shop_name(self, obj):
        return obj.retail_shop.shop_name if obj.retail_shop else 'خرید مستقیم'

    @admin.action(description=_("💰 تأیید تسویه حساب کمیسیون با ویزیتور"))
    def mark_as_settled(self, request, queryset):
        queryset.update(is_settled=True)
`,
    serializers: `"""
visitors/serializers.py
سریالایزرهای DRF برای مدیریت مغازه‌داران باشگاه مشتریان و گزارشات سود ویزیتور
"""
from rest_framework import serializers
from .models import VisitorProfile, RetailShopCustomer, VisitorCommissionLog


class RetailShopCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetailShopCustomer
        fields = ['id', 'visitor', 'shop_name', 'owner_name', 'phone', 'city', 'address', 'license_no', 'total_purchases', 'created_at']
        read_only_fields = ['id', 'visitor', 'total_purchases', 'created_at']


class VisitorCommissionLogSerializer(serializers.ModelSerializer):
    shop_name = serializers.CharField(source='retail_shop.shop_name', read_only=True)
    order_id = serializers.CharField(source='order.order_id', read_only=True)

    class Meta:
        model = VisitorCommissionLog
        fields = ['id', 'order_id', 'shop_name', 'sale_amount', 'commission_rate', 'commission_amount', 'is_settled', 'created_at']


class VisitorProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    retail_shops = RetailShopCustomerSerializer(many=True, read_only=True)
    commissions = VisitorCommissionLogSerializer(many=True, read_only=True)

    class Meta:
        model = VisitorProfile
        fields = ['id', 'visitor_code', 'full_name', 'phone', 'commission_rate', 'total_sales_amount', 'total_commission_earned', 'is_active', 'retail_shops', 'commissions']
`,
    views: `"""
visitors/views.py
ویوهای API جنگو برای ثبت سفارش مغازه‌داران، مدیریت باشگاه مشتریان و دریافت گزارش سود ویزیتور
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import VisitorProfile, RetailShopCustomer, VisitorCommissionLog
from .serializers import VisitorProfileSerializer, RetailShopCustomerSerializer, VisitorCommissionLogSerializer


class VisitorProfileViewSet(viewsets.ModelViewSet):
    queryset = VisitorProfile.objects.all()
    serializer_class = VisitorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    pythome_my_profile(self, request):
        profile, created = VisitorProfile.objects.get_or_create(user=request.user, defaults={
            'visitor_code': f"VISITOR-{request.user.phone[-4:]}"
        })
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class RetailShopCustomerViewSet(viewsets.ModelViewSet):
    queryset = RetailShopCustomer.objects.all()
    serializer_class = RetailShopCustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        visitor_profile, _ = VisitorProfile.objects.get_or_create(user=self.request.user)
        serializer.save(visitor=visitor_profile)


class VisitorCommissionLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VisitorCommissionLog.objects.all()
    serializer_class = VisitorCommissionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return VisitorCommissionLog.objects.all()
        return VisitorCommissionLog.objects.filter(visitor__user=user)
`,
    urls: `"""
visitors/urls.py
مسیرهای URL برای اپ ویزیتوران و باشگاه مشتریان
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitorProfileViewSet, RetailShopCustomerViewSet, VisitorCommissionLogViewSet

router = DefaultRouter()
router.register(r'profiles', VisitorProfileViewSet)
router.register(r'retail-shops', RetailShopCustomerViewSet)
router.register(r'commissions', VisitorCommissionLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
`
  },
  accounts: {
    id: 'accounts',
    name: 'accounts',
    nameFa: 'اپ کاربری و احراز هویت پیامکی (Accounts & Wholesalers)',
    icon: 'User',
    description: 'مدیریت کاربران، بنکداران رسمی، لاگین با کد یکبار مصرف پیامکی (OTP)، پروانه کسب و کدهای ملی',
    models: `"""
accounts/models.py
مدل کاربری اختصاصی بر پایه شماره تلفن همراه، پروفایل بنکداری و لاگین پیامکی OTP
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import random


class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError(_("شماره موبایل الزامی است."))
        phone = self.normalize_phone(phone)
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
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(phone, password, **extra_fields)

    @staticmethod
    def normalize_phone(phone: str) -> str:
        phone = phone.strip().replace(' ', '').replace('-', '')
        if phone.startswith('+98'):
            phone = '0' + phone[3:]
        elif phone.startswith('98'):
            phone = '0' + phone[2:]
        return phone


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', _('مدیر کل سامانه')),
        ('warehouse_manager', _('مدیر انبار جنت‌آباد')),
        ('sales_agent', _('کارشناس فروش عمده')),
        ('wholesaler', _('بنکدار / خریدار عمده')),
        ('guest', _('کاربر مهمان')),
    )

    phone = models.CharField(
        _("شماره تلفن همراه"), 
        max_length=15, 
        unique=True, 
        db_index=True,
        help_text=_("مثال: 09120759419")
    )
    full_name = models.CharField(_("نام و نام خانوادگی"), max_length=150, blank=True)
    business_name = models.CharField(_("نام فروشگاه / بنکداری"), max_length=200, blank=True)
    role = models.CharField(_("نقش سیستمی"), max_length=30, choices=ROLE_CHOICES, default='wholesaler')
    
    # اطلاعات احراز هویت رسمی
    national_id = models.CharField(_("کد ملی / شناسه ملی"), max_length=12, blank=True, null=True)
    business_license = models.CharField(_("شماره پروانه کسب / شناسه صنف"), max_length=50, blank=True, null=True)
    is_verified = models.BooleanField(_("احراز هویت شده (بنکدار رسمی)"), default=False)
    
    # آدرس پیش‌فرض تحویل بار
    province = models.CharField(_("استان"), max_length=60, default="تهران")
    city = models.CharField(_("شهر"), max_length=60, default="تهران")
    address = models.TextField(_("آدرس دقیق انبار / مغازه خریدار"), blank=True)
    postal_code = models.CharField(_("کد پستی ۱۰ رقمی"), max_length=10, blank=True)
    
    # دسترسی‌های سیستمی
    is_active = models.BooleanField(_("حساب فعال"), default=True)
    is_staff = models.BooleanField(_("دسترسی به پنل مدیریت جنگو"), default=False)
    date_joined = models.DateTimeField(_("تاریخ عضویت"), default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = _("کاربر / بنکدار")
        verbose_name_plural = _("مدیریت کاربران و بنکداران")
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.full_name or 'کاربر'} ({self.phone}) - {self.business_name or 'شخصی'}"


class PhoneOTP(models.Model):
    phone = models.CharField(_("شماره موبایل"), max_length=15, db_index=True)
    code = models.CharField(_("کد تأیید ۴ یا ۶ رقمی"), max_length=6)
    is_used = models.BooleanField(_("استفاده شده"), default=False)
    created_at = models.DateTimeField(_("زمان ایجاد"), auto_now_add=True)
    expires_at = models.DateTimeField(_("زمان انقضا"))

    class Meta:
        verbose_name = _("کد یکبار مصرف پیامکی (OTP)")
        verbose_name_plural = _("کدهای تأیید پیامکی")
        ordering = ['-created_at']

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at

    @classmethod
    def generate_otp(cls, phone: str, digits: int = 4, validity_minutes: int = 3):
        # باطل کردن کدهای قبلی این شماره
        cls.objects.filter(phone=phone, is_used=False).update(is_used=True)
        
        # تولید کد رندوم عددی
        code = str(random.randint(10**(digits-1), (10**digits)-1))
        expires = timezone.now() + timezone.timedelta(minutes=validity_minutes)
        
        otp = cls.objects.create(
            phone=phone,
            code=code,
            expires_at=expires
        )
        return otp
`,
    admin: `"""
accounts/admin.py
ثبت و پیکربندی کامل مدل کاربر در پنل مدیریت پیشرفته جنگو با فیلترها و عملیات اختصاصی
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import User, PhoneOTP


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'phone', 
        'full_name', 
        'business_name', 
        'role_badge', 
        'verification_status', 
        'city', 
        'province', 
        'date_joined', 
        'is_active'
    )
    list_filter = ('role', 'is_verified', 'is_active', 'province', 'date_joined')
    search_fields = ('phone', 'full_name', 'business_name', 'national_id', 'business_license')
    ordering = ('-date_joined',)

    fieldsets = (
        (_('اطلاعات هویتی و شماره'), {
            'fields': ('phone', 'full_name', 'business_name', 'role')
        }),
        (_('احراز هویت بنکداری و اسناد رسمی'), {
            'fields': ('is_verified', 'national_id', 'business_license')
        }),
        (_('آدرس پیش‌فرض جهت بارگیری و تخلیه'), {
            'fields': ('province', 'city', 'address', 'postal_code')
        }),
        (_('دسترسی‌ها و وضعیت'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        (_('تاریخ‌ها'), {
            'fields': ('last_login', 'date_joined')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'full_name', 'business_name', 'role', 'is_verified', 'is_staff'),
        }),
    )

    actions = ['make_verified_wholesaler', 'deactivate_users', 'export_wholesaler_contacts']

    @admin.display(description=_("نقش کاربر"))
    def role_badge(self, obj):
        colors = {
            'admin': 'bg-red-700 text-white',
            'warehouse_manager': 'bg-amber-600 text-white',
            'sales_agent': 'bg-blue-600 text-white',
            'wholesaler': 'bg-emerald-700 text-white',
            'guest': 'bg-gray-500 text-white',
        }
        bg = colors.get(obj.role, 'bg-gray-600')
        return format_html(
            '<span style="padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px; background-color: #2563eb; color: #fff;">{}</span>',
            obj.get_role_display()
        )

    @admin.display(description=_("احراز هویت بنکداری"))
    def verification_status(self, obj):
        if obj.is_verified:
            return format_html('<span style="color: #10b981; font-weight: bold;">✔ تأیید شده</span>')
        return format_html('<span style="color: #f59e0b; font-weight: bold;">⏳ در انتظار مدارک</span>')

    @admin.action(description=_("✔ تأیید رسمی بنکداری و اعطای سقف اعتبار"))
    def make_verified_wholesaler(self, request, queryset):
        count = queryset.update(is_verified=True, role='wholesaler')
        self.message_user(request, f"{count} کاربر به عنوان بنکدار رسمی تأیید صلاحیت شدند.")

    @admin.action(description=_("⛔ غیرفعال‌سازی موقت حساب‌های انتخاب شده"))
    def deactivate_users(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} حساب کاربری مسدود شدند.")


@admin.register(PhoneOTP)
class PhoneOTPAdmin(admin.ModelAdmin):
    list_display = ('phone', 'code', 'is_used_display', 'created_at', 'expires_at')
    list_filter = ('is_used', 'created_at')
    search_fields = ('phone', 'code')
    readonly_fields = ('created_at',)

    @admin.display(description=_("وضعیت مصرف"))
    def is_used_display(self, obj):
        if obj.is_used:
            return format_html('<span style="color: #ef4444;">مصرف شده</span>')
        if obj.is_valid():
            return format_html('<span style="color: #10b981; font-weight: bold;">فعال و معتبر</span>')
        return format_html('<span style="color: #6b7280;">منقضی شده</span>')
`,
    serializers: `"""
accounts/serializers.py
سریالایزرهای DRF برای اعتبارسنجی لاگین پیامکی، دریافت پروفایل و توکن JWT
"""
from rest_framework import serializers
from .models import User, PhoneOTP


class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)

    def validate_phone(self, value):
        phone = User.objects.normalize_phone(value)
        if not phone.startswith('09') or len(phone) != 11:
            raise serializers.ValidationError("فرمت شماره موبایل باید مانند 09120759419 باشد.")
        return phone


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp_code = serializers.CharField(max_length=6)
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    business_name = serializers.CharField(max_length=200, required=False, allow_blank=True)

    def validate_phone(self, value):
        return User.objects.normalize_phone(value)


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'phone',
            'full_name',
            'business_name',
            'role',
            'role_display',
            'national_id',
            'business_license',
            'is_verified',
            'province',
            'city',
            'address',
            'postal_code',
            'date_joined',
        ]
        read_only_fields = ['id', 'phone', 'role', 'is_verified', 'date_joined']
`,
    views: `"""
accounts/views.py
ویوهای ورود پیامکی با OTP، صدور توکن JWT و مدیریت اطلاعات کاربری
"""
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, PhoneOTP
from .serializers import SendOTPSerializer, VerifyOTPSerializer, UserProfileSerializer


class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']

        otp = PhoneOTP.generate_otp(phone=phone, digits=4, validity_minutes=3)

        # در محیط پروداکشن: فراخوانی وب‌سرویس کاوه‌نگار یا پیام‌رسان
        # sms_service.send_pattern(phone=phone, code=otp.code)

        return Response({
            "status": "success",
            "message": f"کد تأیید ورود برای {phone} ارسال شد.",
            "dev_mock_otp": otp.code,  # فقط در محیط توسعه
            "expires_in_seconds": 180
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data['phone']
        otp_code = serializer.validated_data['otp_code']
        full_name = serializer.validated_data.get('full_name', '')
        business_name = serializer.validated_data.get('business_name', '')

        # اعتبارسنجی کد
        otp_record = PhoneOTP.objects.filter(phone=phone, code=otp_code, is_used=False).first()
        
        # حالت کد پیش‌فرض تستی یا کد ساخته شده معتبر
        if not otp_record or not otp_record.is_valid():
            if otp_code != '1111':  # کد مستر تستی سوین
                return Response({
                    "status": "error",
                    "message": "کد تأیید نامعتبر یا منقضی شده است."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if otp_record:
            otp_record.is_used = True
            otp_record.save()

        # دریافت یا ساخت کاربر
        user, created = User.objects.get_or_create(phone=phone)
        if created or (full_name and not user.full_name):
            user.full_name = full_name or user.full_name or 'بنکدار گرامی'
            user.business_name = business_name or user.business_name or 'پخش عمده'
            user.save()

        # صدور توکن JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            "status": "success",
            "message": "ورود با موفقیت انجام شد.",
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            "user": UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)


class UserProfileViewSet(ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def get_object(self):
        return self.request.user
`,
    urls: `"""
accounts/urls.py
مسیرهای URL اپلیکیشن احراز هویت و حساب کاربری
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import SendOTPView, VerifyOTPView, UserProfileViewSet

urlpatterns = [
    path('send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}), name='user_profile'),
]
`,
  },

  catalog: {
    id: 'catalog',
    name: 'catalog',
    nameFa: 'اپ کاتالوگ محصولات و انبارداری (Products & Inventory)',
    icon: 'Package',
    description: 'مدیریت محصولات سیگار و دخانیات، قیمت کارتن و باکس، موجودی انبار جنت‌آباد، تخفیف‌های تیراژ و هولوگرام',
    models: `"""
catalog/models.py
مدل‌های محصولات دخانیات، نرخ کارتن، باکس، هولوگرام و تخفیف‌های تیراژ
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class Category(models.Model):
    name_fa = models.CharField(_("نام فارسی دسته‌بندی"), max_length=100)
    name_en = models.CharField(_("نام انگلیسی (Slug)"), max_length=100, unique=True)
    icon = models.CharField(_("آیکون"), max_length=50, default="Package")
    order = models.PositiveIntegerField(_("ترتیب نمایش"), default=0)

    class Meta:
        verbose_name = _("دسته‌بندی کالا")
        verbose_name_plural = _("دسته‌بندی‌های دخانیات")
        ordering = ['order', 'name_fa']

    def __str__(self):
        return self.name_fa


class Brand(models.Model):
    name = models.CharField(_("نام تجاری برند"), max_length=80, unique=True)
    country_of_origin = models.CharField(_("کشور مبدأ / کارخانه"), max_length=80, default="سوئیس")
    logo = models.ImageField(_("لوگو برند"), upload_to="brands/", blank=True, null=True)

    class Meta:
        verbose_name = _("برند دخانیات")
        verbose_name_plural = _("برندهای تولیدکننده")
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.country_of_origin})"


class CigaretteProduct(models.Model):
    CATEGORY_CHOICES = (
        ('cigarettes', _('سیگارهای اورجینال و شرکتی')),
        ('iqos_devices', _('دستگاه‌های ایکاس (IQOS)')),
        ('iqos_heets', _('استیک‌های تیریا و هیتس (TEREA)')),
        ('pods_vapes', _('پاد سیستم و سالت نیکوتین')),
        ('tobacco', _('توتون پیپ و سیگارپیچ')),
        ('accessories', _('ملزومات و اکسسوری عمده')),
    )

    TREND_CHOICES = (
        ('up', _('رو به افزایش (افزایشی)')),
        ('down', _('کاهشی (ویژه)')),
        ('stable', _('باثبات (نرخ رسمی انبار)')),
    )

    name_fa = models.CharField(_("نام کالا (فارسی)"), max_length=200, db_index=True)
    name_en = models.CharField(_("نام کالا (انگلیسی)"), max_length=200)
    barcode = models.CharField(_("بارکد بین‌المللی کالا"), max_length=30, unique=True, db_index=True)
    category = models.CharField(_("گروه کالا"), max_length=40, choices=CATEGORY_CHOICES, default='cigarettes')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, related_name="products", verbose_name=_("برند"))
    origin = models.CharField(_("مبدأ ساخت و بارگیری"), max_length=100, default="سوئیس اصل")
    
    # قیمت‌ها به تومان
    carton_price = models.BigIntegerField(_("قیمت کارتن (تومان)"), help_text=_("هر کارتن شامل ۵۰ باکس پلمپ"))
    box_price = models.BigIntegerField(_("قیمت تک باکس (تومان)"), help_text=_("هر باکس شامل ۱۰ پاکت"))
    boxes_per_carton = models.PositiveIntegerField(_("تعداد باکس در هر کارتن"), default=50)
    moq = models.PositiveIntegerField(_("حداقل سفارش کارتن (MOQ)"), default=1)
    
    # مشخصات فنی و دخانی
    tar = models.CharField(_("قطران (Tar)"), max_length=20, default="6 mg")
    nicotine = models.CharField(_("نیکوتین (Nicotine)"), max_length=20, default="0.5 mg")
    hologram = models.CharField(_("نوع هولوگرام و اصالت"), max_length=100, default="اورجینال سوئیس با بارکد اصالت")
    badge = models.CharField(_("برچسب ویژه"), max_length=50, blank=True, null=True, help_text=_("مثال: بار تازه / پرفروش"))
    
    # وضعیت انبار جنت‌آباد
    is_available = models.BooleanField(_("موجود در انبار جنت‌آباد"), default=True)
    stock_cartons = models.PositiveIntegerField(_("موجودی کارتن پلمپ"), default=100)
    stock_boxes = models.PositiveIntegerField(_("موجودی باکس آزاد"), default=200)
    
    # روند قیمت و تصاویر
    price_trend = models.CharField(_("روند قیمت روز"), max_length=20, choices=TREND_CHOICES, default='stable')
    image_url = models.URLField(_("لینک تصویر باکیفیت"), max_length=500)
    description = models.TextField(_("توضیحات تکمیلی و طعم‌بندی"), blank=True)
    
    created_at = models.DateTimeField(_("تاریخ درج در سامانه"), auto_now_add=True)
    updated_at = models.DateTimeField(_("آخرین بروزرسانی نرخ"), auto_now=True)

    class Meta:
        verbose_name = _("کالای عمده دخانیات")
        verbose_name_plural = _("کاتالوگ کالاهای دخانیات")
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name_fa} - کارتن: {self.carton_price:,} تومان"


class PriceTier(models.Model):
    product = models.ForeignKey(CigaretteProduct, on_delete=models.CASCADE, related_name="tier_discounts", verbose_name=_("کالا"))
    min_quantity = models.PositiveIntegerField(_("حداقل تعداد کارتن"), default=3)
    discount_percent = models.DecimalField(_("درصد تخفیف تیراژ"), max_digits=5, decimal_places=2, default=2.5)

    class Meta:
        verbose_name = _("پله تخفیف تیراژ کارتن")
        verbose_name_plural = _("پله‌های تخفیف تیراژ")
        ordering = ['min_quantity']

    def __str__(self):
        return f"{self.product.name_fa} -> از {self.min_quantity} کارتن: {self.discount_percent}٪"
`,
    admin: `"""
catalog/admin.py
پنل مدیریت کالاهای دخانیات، ثبت قیمت‌ها، تخفیف‌های پلکانی و موجودی انبار
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import Category, Brand, CigaretteProduct, PriceTier


class PriceTierInline(admin.TabularInline):
    model = PriceTier
    extra = 1
    verbose_name = _("پله تخفیف تیراژ")
    verbose_name_plural = _("جدول تخفیف‌های پلکانی کارتن")


@admin.register(CigaretteProduct)
class CigaretteProductAdmin(admin.ModelAdmin):
    list_display = (
        'product_thumb',
        'name_fa',
        'brand',
        'carton_price_display',
        'box_price_display',
        'stock_status',
        'origin',
        'is_available',
        'updated_at'
    )
    list_filter = ('category', 'brand', 'is_available', 'price_trend', 'origin')
    search_fields = ('name_fa', 'name_en', 'barcode', 'origin')
    list_editable = ('is_available',)
    inlines = [PriceTierInline]
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (_('اطلاعات اصلی و عنوان کالا'), {
            'fields': ('name_fa', 'name_en', 'barcode', 'category', 'brand', 'origin', 'badge', 'image_url')
        }),
        (_('قیمت‌گذاری عمده (انبار جنت‌آباد)'), {
            'fields': ('carton_price', 'box_price', 'boxes_per_carton', 'moq', 'price_trend')
        }),
        (_('موجودی انبار و هولوگرام اصالت'), {
            'fields': ('is_available', 'stock_cartons', 'stock_boxes', 'hologram')
        }),
        (_('مشخصات دخانی و قطران'), {
            'fields': ('tar', 'nicotine', 'description')
        }),
        (_('تاریخچه‌ها'), {
            'fields': ('created_at', 'updated_at')
        }),
    )

    actions = ['mark_as_available', 'mark_as_unavailable', 'apply_5_percent_inflation']

    @admin.display(description=_("تصویر کالا"))
    def product_thumb(self, obj):
        if obj.image_url:
            return format_html('<img src="{}" style="width: 42px; height: 42px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" />', obj.image_url)
        return "-"

    @admin.display(description=_("نرخ کارتن (تومان)"))
    def carton_price_display(self, obj):
        return f"{obj.carton_price:,} ت"

    @admin.display(description=_("نرخ باکس (تومان)"))
    def box_price_display(self, obj):
        return f"{obj.box_price:,} ت"

    @admin.display(description=_("موجودی کارتن"))
    def stock_status(self, obj):
        if obj.stock_cartons > 20:
            return format_html('<span style="color: #10b981; font-weight: bold;">{} کارتن</span>', obj.stock_cartons)
        elif obj.stock_cartons > 0:
            return format_html('<span style="color: #f59e0b; font-weight: bold;">محدود ({} کارتن)</span>', obj.stock_cartons)
        return format_html('<span style="color: #ef4444; font-weight: bold;">اتمام موجودی</span>')

    @admin.action(description=_("✔ فعال‌سازی موجودی در انبار جنت‌آباد"))
    def mark_as_available(self, request, queryset):
        queryset.update(is_available=True)

    @admin.action(description=_("❌ اتمام موجودی کالاهای انتخاب شده"))
    def mark_as_unavailable(self, request, queryset):
        queryset.update(is_available=False)


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_of_origin')
    search_fields = ('name', 'country_of_origin')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name_fa', 'name_en', 'order')
    ordering = ('order',)
`,
    serializers: `"""
catalog/serializers.py
سریالایزرهای کاتالوگ، برندها و تخفیف‌های تیراژ
"""
from rest_framework import serializers
from .models import Category, Brand, CigaretteProduct, PriceTier


class PriceTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceTier
        fields = ['id', 'min_quantity', 'discount_percent']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'country_of_origin', 'logo']


class CigaretteProductSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    tier_discounts = PriceTierSerializer(many=True, read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = CigaretteProduct
        fields = [
            'id',
            'name_fa',
            'name_en',
            'barcode',
            'category',
            'category_display',
            'brand',
            'brand_name',
            'origin',
            'carton_price',
            'box_price',
            'boxes_per_carton',
            'moq',
            'tar',
            'nicotine',
            'hologram',
            'badge',
            'is_available',
            'stock_cartons',
            'stock_boxes',
            'price_trend',
            'image_url',
            'description',
            'tier_discounts',
            'updated_at',
        ]
`,
    views: `"""
catalog/views.py
ویوهای کاتالوگ محصولات با فیلترهای برند، دسته‌بندی و متدهای محاسبه نرخ
"""
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import CigaretteProduct, Brand, Category
from .serializers import CigaretteProductSerializer, BrandSerializer


class CigaretteProductViewSet(ModelViewSet):
    queryset = CigaretteProduct.objects.filter(is_available=True).prefetch_related('tier_discounts', 'brand')
    serializer_class = CigaretteProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand__name', 'origin', 'price_trend']
    search_fields = ['name_fa', 'name_en', 'barcode', 'origin']
    ordering_fields = ['carton_price', 'stock_cartons', 'updated_at']
    ordering = ['-updated_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=['get'])
    def price_calculator(self, request, pk=None):
        """محاسبه تخفیف تیراژ برای تعداد کارتن دلخواه خریدار"""
        product = self.get_object()
        cartons = int(request.query_params.get('cartons', 1))
        
        raw_price = product.carton_price * cartons
        discount_percent = 0
        
        for tier in product.tier_discounts.all().order_by('-min_quantity'):
            if cartons >= tier.min_quantity:
                discount_percent = float(tier.discount_percent)
                break
                
        discount_amount = int((raw_price * discount_percent) / 100)
        final_price = raw_price - discount_amount

        return Response({
            "product": product.name_fa,
            "cartons": cartons,
            "raw_total": raw_price,
            "discount_percent": discount_percent,
            "discount_amount": discount_amount,
            "final_payable": final_price,
        })
`,
    urls: `"""
catalog/urls.py
مسیرهای URL کاتالوگ محصولات و برندها
"""
from rest_framework.routers import DefaultRouter
from .views import CigaretteProductViewSet

router = DefaultRouter()
router.register(r'products', CigaretteProductViewSet, basename='product')

urlpatterns = router.urls
`,
  },

  orders: {
    id: 'orders',
    name: 'orders',
    nameFa: 'اپ سفارشات و صدور پیش‌فاکتور (Orders & Invoices)',
    icon: 'FileText',
    description: 'صدور پیش‌فاکتور رسمی SVN، محاسبه اقلام کارتن/باکس، آپلود فیش واریزی بانکی، تأیید مالی و صدور بیجک باربری',
    models: `"""
orders/models.py
مدل‌های پیش‌فاکتور رسمی، آیتم‌های سفارش کارتن و باکس، فیش‌های واریزی بانکی و بارنامه
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from catalog.models import CigaretteProduct
import random


class Order(models.Model):
    STATUS_CHOICES = (
        ('proforma_issued', _('پیش‌فاکتور صادر شده (در انتظار واریز)')),
        ('receipt_uploaded', _('فیش واریزی ارسال شده (در حال بررسی حسابداری)')),
        ('payment_verified', _('پرداخت تأیید شد (ارجاع به انبار جنت‌آباد)')),
        ('warehouse_packing', _('در حال بسته‌بندی و پلمپ در انبار')),
        ('dispatched', _('تحویل باربری / ناوگان اختصاصی شد')),
        ('delivered', _('تحویل نهایی به خریدار شد')),
        ('cancelled', _('لغو شده')),
    )

    SHIPPING_CHOICES = (
        ('tehran_express', _('وانت بار اختصاصی تهران و کرج (تحویل ۳ ساعته)')),
        ('freight_vatan', _('باربری وطن (تحویل ۲۴ تا ۴۸ ساعته شهرستان)')),
        ('freight_pishpaz', _('باربری پیشتاز / جهانگیر (پلمپ ضدضربه)')),
        ('warehouse_pickup', _('تحویل حضوری در انبار مرکزی جنت‌آباد')),
    )

    tracking_code = models.CharField(_("کد رهگیری رسمی SVN"), max_length=30, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="orders",
        verbose_name=_("کاربر خریدار")
    )
    
    # مشخصات تحویل‌گیرنده
    customer_name = models.CharField(_("نام خریدار / بنکدار"), max_length=150)
    customer_phone = models.CharField(_("شماره تماس خریدار"), max_length=15)
    business_name = models.CharField(_("نام بنکداری / فروشگاه"), max_length=200, blank=True)
    
    # آدرس تخلیه بار
    province = models.CharField(_("استان مقصد"), max_length=60)
    city = models.CharField(_("شهر مقصد"), max_length=60)
    destination_address = models.TextField(_("آدرس دقیق محل تحویل بار"))
    
    # ترابری و باربری
    shipping_method = models.CharField(_("روش ارسال"), max_length=50, choices=SHIPPING_CHOICES, default='tehran_express')
    shipping_cost = models.BigIntegerField(_("هزینه باربری (تومان)"), default=0)
    freight_waybill_number = models.CharField(_("شماره بیجک / بارنامه"), max_length=50, blank=True, null=True)
    
    # مبالغ و وضعیت
    total_amount = models.BigIntegerField(_("جمع کل بدون تخفیف (تومان)"))
    discount_amount = models.BigIntegerField(_("مجموع تخفیف تیراژ (تومان)"), default=0)
    final_payable = models.BigIntegerField(_("مبلغ نهایی قابل پرداخت (تومان)"))
    status = models.CharField(_("وضعیت سفارش"), max_length=30, choices=STATUS_CHOICES, default='proforma_issued')
    
    # یادداشت‌ها و زمان‌ها
    admin_notes = models.TextField(_("یادداشت داخلی انبار و حسابداری"), blank=True)
    created_at = models.DateTimeField(_("زمان صدور پیش‌فاکتور"), auto_now_add=True)
    updated_at = models.DateTimeField(_("آخرین تغییر وضعیت"), auto_now=True)

    class Meta:
        verbose_name = _("پیش‌فاکتور و سفارش عمده")
        verbose_name_plural = _("سفارشات و پیش‌فاکتورهای رسمی")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tracking_code} - {self.customer_name} ({self.final_payable:,} تومان)"

    @classmethod
    def generate_tracking_code(cls):
        code = f"SVN-{random.randint(100000, 999999)}"
        while cls.objects.filter(tracking_code=code).exists():
            code = f"SVN-{random.randint(100000, 999999)}"
        return code


class OrderItem(models.Model):
    UNIT_CHOICES = (
        ('carton', _('کارتن پلمپ ۵۰ باکسی')),
        ('box', _('باکس تک ۱۰ پاکتی')),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items", verbose_name=_("سفارش"))
    product = models.ForeignKey(CigaretteProduct, on_delete=models.PROTECT, verbose_name=_("محصول دخانیات"))
    unit = models.CharField(_("واحد سفارش"), max_length=20, choices=UNIT_CHOICES, default='carton')
    quantity = models.PositiveIntegerField(_("تعداد"), default=1)
    unit_price = models.BigIntegerField(_("قیمت واحد (تومان)"))
    discount_percent = models.DecimalField(_("درصد تخفیف اعمال شده"), max_digits=5, decimal_places=2, default=0.0)
    total_price = models.BigIntegerField(_("مبلغ نهایی ردیف (تومان)"))

    class Meta:
        verbose_name = _("ردیف سفارش")
        verbose_name_plural = _("اقلام پیش‌فاکتور")

    def __str__(self):
        return f"{self.product.name_fa} ({self.quantity} {self.get_unit_display()})"


class PaymentReceipt(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="receipts", verbose_name=_("سفارش"))
    bank_name = models.CharField(_("بانک واریزی"), max_length=60, default="بانک ملی")
    tracking_number = models.CharField(_("شماره پیگیری / ارجاع بانکی"), max_length=60)
    card_last_digits = models.CharField(_("۴ رقم آخر کارت واریزکننده"), max_length=4, blank=True)
    amount = models.BigIntegerField(_("مبلغ واریزی (تومان)"))
    receipt_image = models.ImageField(_("تصویر فیش واریز"), upload_to="receipts/%Y/%m/")
    is_verified = models.BooleanField(_("تأیید شده توسط حسابداری"), default=False)
    created_at = models.DateTimeField(_("زمان ثبت فیش"), auto_now_add=True)

    class Meta:
        verbose_name = _("فیش واریزی بانکی")
        verbose_name_plural = _("فیش‌های واریزی سفارشات")
`,
    admin: `"""
orders/admin.py
مدیریت کامل پیش‌فاکتورها، تأیید فیش بانکی، صدور بیجک باربری و گزارشات مالی در ادمین جنگو
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import Order, OrderItem, PaymentReceipt


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'unit', 'quantity', 'unit_price', 'discount_percent', 'total_price')


class PaymentReceiptInline(admin.StackedInline):
    model = PaymentReceipt
    extra = 0
    fields = ('bank_name', 'tracking_number', 'amount', 'receipt_image', 'is_verified', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'tracking_code',
        'customer_name',
        'business_name',
        'customer_phone',
        'city',
        'final_payable_display',
        'status_badge',
        'shipping_method',
        'created_at'
    )
    list_filter = ('status', 'shipping_method', 'province', 'created_at')
    search_fields = ('tracking_code', 'customer_name', 'customer_phone', 'business_name', 'freight_waybill_number')
    inlines = [OrderItemInline, PaymentReceiptInline]
    readonly_fields = ('tracking_code', 'total_amount', 'discount_amount', 'final_payable', 'created_at', 'updated_at')

    fieldsets = (
        (_('اطلاعات سند پیش‌فاکتور'), {
            'fields': ('tracking_code', 'status', 'created_at', 'updated_at')
        }),
        (_('مشخصات بنکدار و خریدار'), {
            'fields': ('user', 'customer_name', 'business_name', 'customer_phone')
        }),
        (_('آدرس تخلیه و باربری'), {
            'fields': ('province', 'city', 'destination_address', 'shipping_method', 'shipping_cost', 'freight_waybill_number')
        }),
        (_('حسابداری و مبالغ نهایی'), {
            'fields': ('total_amount', 'discount_amount', 'final_payable', 'admin_notes')
        }),
    )

    actions = ['mark_as_paid_send_warehouse', 'mark_as_dispatched', 'generate_official_pdf']

    @admin.display(description=_("مبلغ نهایی"))
    def final_payable_display(self, obj):
        return f"{obj.final_payable:,} تومان"

    @admin.display(description=_("وضعیت سفارش"))
    def status_badge(self, obj):
        status_colors = {
            'proforma_issued': '#f59e0b',
            'receipt_uploaded': '#3b82f6',
            'payment_verified': '#10b981',
            'warehouse_packing': '#8b5cf6',
            'dispatched': '#059669',
            'delivered': '#047857',
            'cancelled': '#ef4444',
        }
        color = status_colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display()
        )

    @admin.action(description=_("✔ تأیید پرداخت مالی و ارجاع به انبار جنت‌آباد"))
    def mark_as_paid_send_warehouse(self, request, queryset):
        count = queryset.update(status='payment_verified')
        self.message_user(request, f"{count} سفارش جهت پلمپ و بارگیری به انبار جنت‌آباد ارجاع شد.")

    @admin.action(description=_("🚚 ثبت خروج بار و تحویل به باربری / ناوگان"))
    def mark_as_dispatched(self, request, queryset):
        count = queryset.update(status='dispatched')
        self.message_user(request, f"{count} سفارش به عنوان تحویل باربری ثبت شد.")
`,
    serializers: `"""
orders/serializers.py
سریالایزرهای ثبت سفارش، محاسبه خودکار پیش‌فاکتور و آپلود فیش بانکی
"""
from rest_framework import serializers
from .models import Order, OrderItem, PaymentReceipt
from catalog.models import CigaretteProduct


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.CharField()
    unit = serializers.ChoiceField(choices=['carton', 'box'])
    quantity = serializers.IntegerField(min_value=1)


class OrderCheckoutSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=150)
    customer_phone = serializers.CharField(max_length=15)
    business_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    province = serializers.CharField(max_length=60)
    city = serializers.CharField(max_length=60)
    destination_address = serializers.CharField()
    shipping_method = serializers.CharField(max_length=50)
    shipping_cost = serializers.IntegerField(default=0)
    items = OrderItemInputSerializer(many=True)


class OrderDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


class PaymentReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentReceipt
        fields = ['id', 'order', 'bank_name', 'tracking_number', 'card_last_digits', 'amount', 'receipt_image', 'created_at']
`,
    views: `"""
orders/views.py
ثبت تراکنشی پیش‌فاکتور، استعلام وضعیت بارنامه و ثبت فیش واریزی
"""
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from .models import Order, OrderItem, PaymentReceipt
from .serializers import OrderCheckoutSerializer, OrderDetailSerializer, PaymentReceiptSerializer
from catalog.models import CigaretteProduct


class OrderCheckoutView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = OrderCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        total_amount = 0
        total_discount = 0
        order_items_to_create = []

        for item_data in data['items']:
            product = CigaretteProduct.objects.filter(id=item_data['product_id']).first()
            if not product:
                return Response({"error": f"محصول یافت نشد."}, status=400)

            unit = item_data['unit']
            qty = item_data['quantity']
            unit_price = product.carton_price if unit == 'carton' else product.box_price
            line_raw = unit_price * qty
            
            # محاسبه تخفیف پلکانی
            discount_pct = 0
            if unit == 'carton':
                for tier in product.tier_discounts.all().order_by('-min_quantity'):
                    if qty >= tier.min_quantity:
                        discount_pct = float(tier.discount_percent)
                        break

            line_discount = int((line_raw * discount_pct) / 100)
            line_final = line_raw - line_discount

            total_amount += line_raw
            total_discount += line_discount

            order_items_to_create.append({
                'product': product,
                'unit': unit,
                'quantity': qty,
                'unit_price': unit_price,
                'discount_percent': discount_pct,
                'total_price': line_final,
            })

        shipping_cost = data.get('shipping_cost', 0)
        final_payable = (total_amount - total_discount) + shipping_cost

        # ساخت رکورد سفارش
        order = Order.objects.create(
            tracking_code=Order.generate_tracking_code(),
            user=request.user if request.user.is_authenticated else None,
            customer_name=data['customer_name'],
            customer_phone=data['customer_phone'],
            business_name=data.get('business_name', ''),
            province=data['province'],
            city=data['city'],
            destination_address=data['destination_address'],
            shipping_method=data['shipping_method'],
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            discount_amount=total_discount,
            final_payable=final_payable,
            status='proforma_issued',
        )

        for item in order_items_to_create:
            OrderItem.objects.create(order=order, **item)

        return Response({
            "status": "success",
            "message": "پیش‌فاکتور رسمی با موفقیت صادر گردید.",
            "tracking_code": order.tracking_code,
            "final_payable": order.final_payable,
            "order_id": order.id
        }, status=status.HTTP_201_CREATED)


class OrderTrackingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, tracking_code):
        order = Order.objects.filter(tracking_code=tracking_code).first()
        if not order:
            return Response({"error": "سفارشی با این کد رهگیری یافت نشد."}, status=404)
        return Response(OrderDetailSerializer(order).data)
`,
    urls: `"""
orders/urls.py
مسیرهای URL ثبت سفارش و رهگیری پیش‌فاکتور
"""
from django.urls import path
from .views import OrderCheckoutView, OrderTrackingView

urlpatterns = [
    path('checkout/', OrderCheckoutView.as_view(), name='order_checkout'),
    path('track/<str:tracking_code>/', OrderTrackingView.as_view(), name='order_track'),
]
`,
  },

  tickets: {
    id: 'tickets',
    name: 'tickets',
    nameFa: 'اپ تیکتینگ و پشتیبانی انبار (Support & Tickets)',
    icon: 'MessageSquare',
    description: 'مدیریت تیکت‌های پشتیبانی بنکداران، مکالمات آنلاین با انبار جنت‌آباد و حسابداری، پیوست اسناد و تغییر اولویت',
    models: `"""
tickets/models.py
مدل‌های سیستم تیکتینگ بنکداری و مکاتبه اختصاصی با بخش‌های فروش و انبار
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import random


class SupportTicket(models.Model):
    DEPARTMENT_CHOICES = (
        ('sales', _('واحد فروش و ثبت پیش‌فاکتور')),
        ('warehouse', _('انبار مرکزی جنت‌آباد (پلمپ و بارگیری)')),
        ('shipping', _('واحد ترابری و باربری (وطن / جهانگیر)')),
        ('finance', _('واحد مالی و تأیید فیش واریزی')),
    )

    PRIORITY_CHOICES = (
        ('low', _('عادی')),
        ('medium', _('متوسط')),
        ('high', _('فوری (بارگیری اضطراری)')),
        ('critical', _('بحرانی')),
    )

    STATUS_CHOICES = (
        ('open', _('در انتظار پاسخ کارشناس')),
        ('answered', _('پاسخ داده شده')),
        ('customer_reply', _('پاسخ بنکدار')),
        ('in_progress', _('در حال اقدام در انبار')),
        ('closed', _('بسته شده / خاتمه یافته')),
    )

    ticket_number = models.CharField(_("شماره تیکت"), max_length=20, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tickets",
        verbose_name=_("کاربر ثبت‌کننده")
    )
    title = models.CharField(_("عنوان موضوع تیکت"), max_length=200)
    department = models.CharField(_("واحد ارجاع"), max_length=30, choices=DEPARTMENT_CHOICES, default='sales')
    priority = models.CharField(_("اولویت"), max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(_("وضعیت"), max_length=30, choices=STATUS_CHOICES, default='open')
    order_tracking_code = models.CharField(_("کد سفارش مرتبط (اختیاری)"), max_length=30, blank=True, null=True)

    created_at = models.DateTimeField(_("زمان ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("آخرین بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("تیکت پشتیبانی")
        verbose_name_plural = _("تیکت‌های پشتیبانی و انبار")
        ordering = ['-updated_at']

    def __str__(self):
        return f"[{self.ticket_number}] {self.title} - {self.get_status_display()}"

    @classmethod
    def generate_ticket_number(cls):
        return f"TK-{random.randint(10000, 99999)}"


class TicketMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="messages", verbose_name=_("تیکت"))
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("فرستنده"))
    is_staff_reply = models.BooleanField(_("پاسخ توسط کارشناس پشتیبانی"), default=False)
    message = models.TextField(_("متن پیام"))
    attachment = models.FileField(_("فایل یا تصویر ضمیمه"), upload_to="ticket_attachments/%Y/%m/", blank=True, null=True)
    created_at = models.DateTimeField(_("زمان ارسال"), auto_now_add=True)

    class Meta:
        verbose_name = _("پیام تیکت")
        verbose_name_plural = _("پیام‌های تیکت")
        ordering = ['created_at']

    def __str__(self):
        return f"پیام روی {self.ticket.ticket_number} توسط {self.sender}"
`,
    admin: `"""
tickets/admin.py
مدیریت تیکت‌ها در پنل ادمین جنگو، پاسخگویی آنلاین و تغییر وضعیت تیکت
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import SupportTicket, TicketMessage


class TicketMessageInline(admin.StackedInline):
    model = TicketMessage
    extra = 1
    fields = ('sender', 'is_staff_reply', 'message', 'attachment', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = (
        'ticket_number',
        'title',
        'user',
        'department',
        'priority_badge',
        'status_badge',
        'order_tracking_code',
        'updated_at'
    )
    list_filter = ('department', 'priority', 'status', 'created_at')
    search_fields = ('ticket_number', 'title', 'user__phone', 'user__full_name', 'order_tracking_code')
    inlines = [TicketMessageInline]
    readonly_fields = ('ticket_number', 'created_at', 'updated_at')

    @admin.display(description=_("اولویت"))
    def priority_badge(self, obj):
        colors = {
            'low': '#6b7280',
            'medium': '#3b82f6',
            'high': '#f59e0b',
            'critical': '#ef4444',
        }
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-size: 10px;">{}</span>',
            colors.get(obj.priority, '#6b7280'),
            obj.get_priority_display()
        )

    @admin.display(description=_("وضعیت"))
    def status_badge(self, obj):
        colors = {
            'open': '#f59e0b',
            'answered': '#10b981',
            'customer_reply': '#3b82f6',
            'in_progress': '#8b5cf6',
            'closed': '#6b7280',
        }
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-size: 10px;">{}</span>',
            colors.get(obj.status, '#6b7280'),
            obj.get_status_display()
        )
`,
    serializers: `"""
tickets/serializers.py
سریالایزرهای DRF برای سیستم تیکتینگ و پیام‌ها
"""
from rest_framework import serializers
from .models import SupportTicket, TicketMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_name', 'is_staff_reply', 'message', 'attachment', 'created_at']
        read_only_fields = ['id', 'sender', 'is_staff_reply', 'created_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id',
            'ticket_number',
            'user',
            'title',
            'department',
            'department_display',
            'priority',
            'status',
            'status_display',
            'order_tracking_code',
            'messages',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'ticket_number', 'user', 'created_at', 'updated_at']
`,
    views: `"""
tickets/views.py
ویوهای مدیریت تیکت‌های بنکداران و پاسخگویی آنلاین
"""
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import SupportTicket, TicketMessage
from .serializers import SupportTicketSerializer, TicketMessageSerializer


class SupportTicketViewSet(ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return SupportTicket.objects.all().prefetch_related('messages')
        return SupportTicket.objects.filter(user=self.request.user).prefetch_related('messages')

    def perform_create(self, serializer):
        ticket = serializer.save(
            user=self.request.user,
            ticket_number=SupportTicket.generate_ticket_number()
        )
        # ثبت اولین پیام
        initial_message = self.request.data.get('initial_message')
        if initial_message:
            TicketMessage.objects.create(
                ticket=ticket,
                sender=self.request.user,
                is_staff_reply=False,
                message=initial_message
            )

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        message_text = request.data.get('message')
        if not message_text:
            return Response({"error": "متن پیام الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        is_staff = request.user.is_staff
        msg = TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            is_staff_reply=is_staff,
            message=message_text
        )

        ticket.status = 'answered' if is_staff else 'customer_reply'
        ticket.save()

        return Response(TicketMessageSerializer(msg).data, status=status.HTTP_201_CREATED)
`,
    urls: `"""
tickets/urls.py
مسیرهای URL سامانه تیکتینگ
"""
from rest_framework.routers import DefaultRouter
from .views import SupportTicketViewSet

router = DefaultRouter()
router.register(r'tickets', SupportTicketViewSet, basename='ticket')

urlpatterns = router.urls
`,
  },

  shipping: {
    id: 'shipping',
    name: 'shipping',
    nameFa: 'اپ ترابری و تعرفه باربری (Shipping & Logistics)',
    icon: 'Truck',
    description: 'مدیریت ناوگان وانت تهران و البرز، باربری‌های معتبر بین‌شهری (وطن/پیشتاز)، بیمه بار و تعرفه استانی',
    models: `"""
shipping/models.py
مدل‌های تعرفه باربری استانی، ناوگان وانت اختصاصی و آژانس‌های ترابری
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class ShippingMethod(models.Model):
    name = models.CharField(_("عنوان روش ارسال"), max_length=100)
    slug = models.SlugField(_("شناسه انگلیسی"), unique=True)
    estimated_time = models.CharField(_("مدت زمان تقریبی تحویل"), max_length=50, default="۲۴ الی ۴۸ ساعت")
    base_cost = models.BigIntegerField(_("هزینه پایه کرایه (تومان)"), default=150000)
    is_active = models.BooleanField(_("فعال در پیش‌فاکتور"), default=True)
    description = models.TextField(_("توضیحات بسته‌بندی و پلمپ"), blank=True)

    class Meta:
        verbose_name = _("روش حمل و ترابری")
        verbose_name_plural = _("روش‌های حمل و ترابری")

    def __str__(self):
        return f"{self.name} ({self.base_cost:,} تومان)"


class ProvincialTariff(models.Model):
    province = models.CharField(_("نام استان"), max_length=60, unique=True)
    capital_city = models.CharField(_("مرکز استان"), max_length=60)
    vatan_freight_cost = models.BigIntegerField(_("کرایه باربری وطن (هر کارتن - تومان)"), default=45000)
    express_fleet_available = models.BooleanField(_("پوشش ناوگان وانت مستقیم"), default=False)

    class Meta:
        verbose_name = _("تعرفه کرایه استانی")
        verbose_name_plural = _("جدول تعرفه کرایه باربری استان‌ها")
        ordering = ['province']

    def __str__(self):
        return f"{self.province} - {self.vatan_freight_cost:,} تومان/کارتن"
`,
    admin: `"""
shipping/admin.py
مدیریت تعرفه‌های باربری و ناوگان در ادمین جنگو
"""
from django.contrib import admin
from .models import ShippingMethod, ProvincialTariff


@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'base_cost', 'estimated_time', 'is_active')
    list_editable = ('base_cost', 'is_active')


@admin.register(ProvincialTariff)
class ProvincialTariffAdmin(admin.ModelAdmin):
    list_display = ('province', 'capital_city', 'vatan_freight_cost', 'express_fleet_available')
    search_fields = ('province', 'capital_city')
    list_editable = ('vatan_freight_cost', 'express_fleet_available')
`,
    serializers: `"""
shipping/serializers.py
سریالایزرهای محاسبه کرایه باربری
"""
from rest_framework import serializers
from .models import ShippingMethod, ProvincialTariff


class ShippingMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingMethod
        fields = '__all__'


class ProvincialTariffSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProvincialTariff
        fields = '__all__'
`,
    views: `"""
shipping/views.py
ویوهای استعلام تعرفه کرایه و روش‌های ترابری
"""
from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import ShippingMethod, ProvincialTariff
from .serializers import ShippingMethodSerializer, ProvincialTariffSerializer


class ShippingMethodViewSet(ReadOnlyModelViewSet):
    queryset = ShippingMethod.objects.filter(is_active=True)
    serializer_class = ShippingMethodSerializer


class ProvincialTariffViewSet(ReadOnlyModelViewSet):
    queryset = ProvincialTariff.objects.all()
    serializer_class = ProvincialTariffSerializer
`,
    urls: `"""
shipping/urls.py
مسیرهای URL تعرفه باربری
"""
from rest_framework.routers import DefaultRouter
from .views import ShippingMethodViewSet, ProvincialTariffViewSet

router = DefaultRouter()
router.register(r'methods', ShippingMethodViewSet, basename='shipping_method')
router.register(r'tariffs', ProvincialTariffViewSet, basename='provincial_tariff')

urlpatterns = router.urls
`,
  },
};

export const DJANGO_PROJECT_CONFIG: DjangoProjectConfig = {
  settings: `"""
sevin_wholesale/settings.py
پیکربندی کامل پروژه جنگو با اپ‌های ماژولار، DRF، احراز هویت JWT و زبان فارسی
"""
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-sevin-wholesale-key-98214')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'

# 🌐 تنظیمات دامنه‌ها و هاست‌های مجاز (برای پروداکشن جایش خالی گذاشته شده است)
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',') if os.environ.get('ALLOWED_HOSTS') else [
    # "api.yourdomain.com",
    # "yourdomain.com",
]

# تفکیک دقیق اپلیکیشن‌های سیستم
INSTALLED_APPS = [
    # پنل پیشرفته ادمین (در صورت استفاده از Jazzmin/Unfold)
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # پکیج‌های ثالث
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',  # Swagger OpenAPI 3
    'tinymce',          # ادیتور متنی پیشرفته TinyMCE

    # اپ‌های ماژولار سامانه سوین
    'accounts.apps.AccountsConfig',
    'catalog.apps.CatalogConfig',
    'orders.apps.OrdersConfig',
    'tickets.apps.TicketsConfig',
    'shipping.apps.ShippingConfig',
]

AUTH_USER_MODEL = 'accounts.User'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sevin_wholesale.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sevin_wholesale.wsgi.application'

# دیتابیس (PostgreSQL در پروداکشن / SQLite در توسعه)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# زبان فارسی و تقویم رسمی
LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# 🔐 JWT Settings (SimpleJWT)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# 🌐 CORS & CSRF Settings (دامنه‌ها جهت درج توسط کاربر خالی گذاشته شده است)
CORS_ALLOW_ALL_ORIGINS = True  # در توسعه True است، در پروداکشن می‌توانید False کنید
CORS_ALLOWED_ORIGINS = [
    # "https://sevin-smoke.ir",
    # "https://admin.sevin-smoke.ir",
]
CSRF_TRUSTED_ORIGINS = [
    # "https://sevin-smoke.ir",
    # "https://api.sevin-smoke.ir",
]
CORS_ALLOW_CREDENTIALS = True

# 📝 TinyMCE HTML Editor Settings
TINYMCE_DEFAULT_CONFIG = {
    'height': 380,
    'width': '100%',
    'cleanup_on_startup': True,
    'custom_undo_redo_levels': 20,
    'selector': 'textarea',
    'theme': 'silver',
    'plugins': 'textcolor save link image media code hr bulletlist numlist table preview directionality',
    'toolbar': 'bold italic underline strikethrough | ltr rtl | alignleft aligncenter alignright alignjustify | bullist numlist | link image media | code preview',
    'directionality': 'rtl',
    'language': 'fa',
}
`,

  urls: `"""
sevin_wholesale/urls.py
مسیریابی ریشه با پشتیبانی از Swagger و سوئیچ تمام اپ‌های ماژولار
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

admin.site.site_header = "سامانه مدیریت پخش عمده دخانیات سوین"
admin.site.site_title = "پنل مدیریت سوین"
admin.site.index_title = "داشبورد کنترل انبار مرکزی جنت‌آباد، بنکداران و سفارشات"

urlpatterns = [
    # پنل مدیریت جنگو
    path('admin/', admin.site.urls),

    # مستندات تعاملی Swagger OpenAPI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # روت‌های ماژولار وب‌سرویس REST API نسخه ۱
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/catalog/', include('catalog.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/tickets/', include('tickets.urls')),
    path('api/v1/shipping/', include('shipping.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
`,

  requirements: `# requirements.txt
# وابستگی‌های رسمی سامانه پخش عمده سوین (Django 5 + DRF)

Django>=5.0,<5.2
djangorestframework>=3.15.0
djangorestframework-simplejwt>=5.3.1
django-cors-headers>=4.3.1
django-filter>=24.2
drf-spectacular>=0.27.2
Pillow>=10.3.0
gunicorn>=22.0.0
psycopg2-binary>=2.9.9
requests>=2.32.0
python-dotenv>=1.0.1
`,

  manage: `#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sevin_wholesale.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`,

  env: `# .env
DJANGO_SECRET_KEY=sevin_super_secret_production_key_2026
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.sevin-wholesale.ir,localhost,127.0.0.1
DATABASE_URL=postgres://sevin_user:sevin_secure_pass@localhost:5432/sevin_wholesale_db
KAVENEGAR_API_KEY=your_kavenegar_sms_api_key_here
`,

  setupScript: `#!/bin/bash
# ==============================================================================
# اسکریپت راه‌اندازی خودکار پروژه بک‌اند ماژولار جنگو (سوین)
# ==============================================================================

echo "🚀 شروع راه‌اندازی ساختار ماژولار پروژه جنگو سوین..."

# 1. ساخت محیط مجازی پایتون
python3 -m venv venv
source venv/bin/activate

# 2. نصب وابستگی‌ها
pip install --upgrade pip
pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter drf-spectacular Pillow

# 3. ساخت دایرکتوری‌های اپ‌ها
mkdir -p sevin_wholesale accounts catalog orders tickets shipping media staticfiles

# 4. ایجاد فایل‌های خالی اپ‌ها در صورت نیاز
for app in accounts catalog orders tickets shipping; do
  mkdir -p $app/migrations
  touch $app/__init__.py
  touch $app/migrations/__init__.py
  touch $app/models.py $app/admin.py $app/serializers.py $app/views.py $app/urls.py $app/apps.py
done

# 5. اجرای مایگریشن‌ها و ایجاد دیتابیس
python manage.py makemigrations accounts catalog orders tickets shipping
python manage.py migrate

# 6. ساخت کاربر ارشد (Superuser) پیش‌فرض با شماره ۰۹۱۲۰۷۵۹۴۱۹
python manage.py createsuperuser --phone=09120759419 --full_name="مدیر کل انبار جنت‌آباد"

echo "✔ پروژه با موفقیت راه‌اندازی گردید."
echo "▶ جهت اجرای سرور: python manage.py runserver"
`,
};
