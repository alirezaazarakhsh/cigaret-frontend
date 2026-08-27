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

  pos: {
    id: 'pos',
    name: 'pos',
    nameFa: 'صندوق فروشگاهی (POS)',
    icon: 'MonitorSmartphone',
    description: 'صدور فاکتور حضوری، محصولات صندوق، مدیریت چاپ حرارتی',
    models: `"""
pos/models.py
مدل‌های صندوق فروشگاه حضوری، پایانه‌های فروشگاهی POS، نوبت‌های صندوق‌داری و اقلام فاکتور
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from catalog.models import CigaretteProduct


class PosRegister(models.Model):
    class RegisterStatus(models.TextChoices):
        ACTIVE = 'active', _('فعال و آماده صدور فاکتور')
        INACTIVE = 'inactive', _('غیرفعال')
        MAINTENANCE = 'maintenance', _('در حال تعمیر و پشتیبانی')

    name = models.CharField(_("نام صندوق / باجه"), max_length=100)
    terminal_code = models.CharField(_("کد ترمینال POS"), max_length=50, unique=True)
    ip_address = models.GenericIPAddressField(_("آدرس IP چاپگر حرارتی / سیستم"), blank=True, null=True)
    status = models.CharField(_("وضعیت پایانه"), max_length=20, choices=RegisterStatus.choices, default=RegisterStatus.ACTIVE)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)

    class Meta:
        verbose_name = _("پایانه صندوق")
        verbose_name_plural = _("۱. پایانه‌ها و صندوق‌های فروشگاه حضوری")

    def __str__(self):
        return f"{self.name} (کد: {self.terminal_code})"


class PosShift(models.Model):
    class ShiftStatus(models.TextChoices):
        OPEN = 'open', _('شیفت باز (در حال فروش)')
        CLOSED = 'closed', _('شیفت بسته شده و تسویه‌شده')

    cashier = models.ForeignKey(User, on_delete=models.PROTECT, related_name='pos_shifts', verbose_name=_("صندوق‌دار"))
    register = models.ForeignKey(PosRegister, on_delete=models.PROTECT, related_name='shifts', verbose_name=_("صندوق"))
    opening_cash = models.BigIntegerField(_("موجودی اولیه صندوق (تومان)"), default=0)
    closing_cash = models.BigIntegerField(_("موجودی نقدی نهایی صندوق (تومان)"), null=True, blank=True)
    expected_cash = models.BigIntegerField(_("موجودی نقدی سیستم (تومان)"), null=True, blank=True)
    cash_discrepancy = models.BigIntegerField(_("کسری / مازاد صندوق (تومان)"), default=0)
    status = models.CharField(_("وضعیت شیفت"), max_length=20, choices=ShiftStatus.choices, default=ShiftStatus.OPEN)
    opened_at = models.DateTimeField(_("زمان شروع شیفت"), auto_now_add=True)
    closed_at = models.DateTimeField(_("زمان پایان شیفت"), null=True, blank=True)

    class Meta:
        verbose_name = _("شیفت صندوق‌داری")
        verbose_name_plural = _("۲. نوبت‌ها و شیفت‌های صندوق‌داران")
        ordering = ['-opened_at']

    def __str__(self):
        return f"شیفت {self.cashier.full_name} | {self.register.name} ({self.get_status_display()})"


class PosSale(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'cash', _('وجه نقد')
        POS_CARD = 'pos_card', _('کارتخوان متصل (POS)')
        SPLIT = 'split', _('ترکیبی (نقد + کارت)')
        CREDIT_DEBT = 'credit_debt', _('نسیه و حساب دفتری')

    invoice_number = models.CharField(_("شماره فاکتور صندوق"), max_length=50, unique=True, db_index=True)
    shift = models.ForeignKey(PosShift, on_delete=models.PROTECT, related_name='sales', verbose_name=_("شیفت صندوق"))
    cashier = models.ForeignKey(User, on_delete=models.PROTECT, related_name='pos_sales', verbose_name=_("صندوق‌دار"))
    customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='pos_purchases', verbose_name=_("مشتری (اختیاری)"))
    payment_method = models.CharField(_("روش تسویه"), max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.POS_CARD)
    total_amount = models.BigIntegerField(_("مبلغ ناخالص (تومان)"))
    discount_amount = models.BigIntegerField(_("تخفیف (تومان)"), default=0)
    final_amount = models.BigIntegerField(_("مبلغ پرداختی نهایی (تومان)"))
    pos_card_ref = models.CharField(_("شماره ارجاع / پیگیری کارتخوان"), max_length=50, blank=True)
    created_at = models.DateTimeField(_("تاریخ و زمان صدور فاکتور"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("فاکتور فروش حضوری")
        verbose_name_plural = _("۳. فاکتورهای فروشگاه حضوری (POS)")
        ordering = ['-created_at']

    def __str__(self):
        return f"فاکتور {self.invoice_number} | {self.final_amount:,} تومان"


class PosSaleItem(models.Model):
    sale = models.ForeignKey(PosSale, on_delete=models.CASCADE, related_name='items', verbose_name=_("فاکتور مرجع"))
    product = models.ForeignKey(CigaretteProduct, on_delete=models.PROTECT, related_name='pos_sale_items', verbose_name=_("محصول دخانی"))
    unit_type = models.CharField(_("واحد فروش"), max_length=20, default='pack', choices=[('pack', 'پاکت'), ('box', 'باکس'), ('carton', 'کارتن')])
    quantity = models.PositiveIntegerField(_("تعداد"))
    unit_price = models.BigIntegerField(_("قیمت واحد (تومان)"))
    subtotal = models.BigIntegerField(_("جمع ردیف (تومان)"))

    class Meta:
        verbose_name = _("قلم فاکتور حضوری")
        verbose_name_plural = _("اقلام فاکتور حضوری")

    def __str__(self):
        return f"{self.product.name_fa} x {self.quantity} {self.unit_type}"
`,
    admin: `"""
pos/admin.py
پنل ادمین صندوق فروشگاهی، پایانه‌ها، شیفت‌ها و صدور فاکتور
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import PosRegister, PosShift, PosSale, PosSaleItem


class PosSaleItemInline(admin.TabularInline):
    model = PosSaleItem
    extra = 0
    readonly_fields = ('product', 'unit_type', 'quantity', 'unit_price', 'subtotal')


@admin.register(PosRegister)
class PosRegisterAdmin(admin.ModelAdmin):
    list_display = ('name', 'terminal_code', 'ip_address', 'status')
    list_filter = ('status',)
    search_fields = ('name', 'terminal_code')


@admin.register(PosShift)
class PosShiftAdmin(admin.ModelAdmin):
    list_display = ('id', 'cashier', 'register', 'status', 'opening_cash_display', 'closing_cash_display', 'cash_discrepancy_display', 'opened_at')
    list_filter = ('status', 'register', 'opened_at')
    search_fields = ('cashier__full_name', 'cashier__phone')

    def opening_cash_display(self, obj):
        return f"{obj.opening_cash:,} تومان"
    opening_cash_display.short_description = "موجودی اولیه"

    def closing_cash_display(self, obj):
        if obj.closing_cash is not None:
            return f"{obj.closing_cash:,} تومان"
        return "-"
    closing_cash_display.short_description = "موجودی نهایی"

    def cash_discrepancy_display(self, obj):
        if obj.cash_discrepancy == 0:
            return format_html('<span style="color: green;">بدون مغایرت (تراز)</span>')
        elif obj.cash_discrepancy < 0:
            return format_html(f'<span style="color: red; font-weight: bold;">کسری: {abs(obj.cash_discrepancy):,} تومان</span>')
        return format_html(f'<span style="color: blue; font-weight: bold;">مازاد: {obj.cash_discrepancy:,} تومان</span>')
    cash_discrepancy_display.short_description = "مغایرت صندوق"


@admin.register(PosSale)
class PosSaleAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'cashier', 'payment_method', 'total_amount_display', 'final_amount_display', 'created_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('invoice_number', 'pos_card_ref', 'cashier__full_name')
    inlines = [PosSaleItemInline]

    def total_amount_display(self, obj):
        return f"{obj.total_amount:,} تومان"
    total_amount_display.short_description = "مبلغ کل"

    def final_amount_display(self, obj):
        return format_html(f'<b style="color: #10b981;">{obj.final_amount:,} تومان</b>')
    final_amount_display.short_description = "مبلغ نهایی"
`,
    serializers: `"""
pos/serializers.py
"""
from rest_framework import serializers
from .models import PosRegister, PosShift, PosSale, PosSaleItem


class PosRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = PosRegister
        fields = '__all__'


class PosSaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name_fa', read_only=True)

    class Meta:
        model = PosSaleItem
        fields = ['id', 'product', 'product_name', 'unit_type', 'quantity', 'unit_price', 'subtotal']


class PosSaleSerializer(serializers.ModelSerializer):
    items = PosSaleItemSerializer(many=True, read_only=True)
    cashier_name = serializers.CharField(source='cashier.full_name', read_only=True)

    class Meta:
        model = PosSale
        fields = '__all__'


class PosShiftSerializer(serializers.ModelSerializer):
    cashier_name = serializers.CharField(source='cashier.full_name', read_only=True)
    register_name = serializers.CharField(source='register.name', read_only=True)

    class Meta:
        model = PosShift
        fields = '__all__'
`,
    views: `"""
pos/views.py
ویوهای صدور فاکتور حضوری، مدیریت شیفت و استعلام صندوق
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import PosRegister, PosShift, PosSale, PosSaleItem
from .serializers import PosRegisterSerializer, PosShiftSerializer, PosSaleSerializer
from catalog.models import CigaretteProduct


class PosRegisterViewSet(viewsets.ModelViewSet):
    queryset = PosRegister.objects.all()
    serializer_class = PosRegisterSerializer
    permission_classes = [permissions.IsAuthenticated]


class PosShiftViewSet(viewsets.ModelViewSet):
    queryset = PosShift.objects.all()
    serializer_class = PosShiftSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='open-shift')
    def open_shift(self, request):
        register_id = request.data.get('register_id')
        opening_cash = request.data.get('opening_cash', 0)
        
        # بررسی نبود شیفت باز قبلی
        active_shift = PosShift.objects.filter(cashier=request.user, status=PosShift.ShiftStatus.OPEN).first()
        if active_shift:
            return Response({'error': 'شما هم‌اکنون یک شیفت باز دارید.'}, status=status.HTTP_400_BAD_REQUEST)

        shift = PosShift.objects.create(
            cashier=request.user,
            register_id=register_id,
            opening_cash=opening_cash,
            status=PosShift.ShiftStatus.OPEN
        )
        return Response(PosShiftSerializer(shift).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='close-shift')
    def close_shift(self, request, pk=None):
        shift = self.get_object()
        closing_cash = int(request.data.get('closing_cash', 0))
        
        # محاسبه موجودی نقدی مورد انتظار
        sales_cash = shift.sales.filter(payment_method='cash').aggregate(total=models.Sum('final_amount'))['total'] or 0
        expected = shift.opening_cash + sales_cash
        
        shift.closing_cash = closing_cash
        shift.expected_cash = expected
        shift.cash_discrepancy = closing_cash - expected
        shift.status = PosShift.ShiftStatus.CLOSED
        shift.closed_at = timezone.now()
        shift.save()

        return Response(PosShiftSerializer(shift).data)


class PosSaleViewSet(viewsets.ModelViewSet):
    queryset = PosSale.objects.all()
    serializer_class = PosSaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='checkout')
    @transaction.atomic
    def checkout(self, request):
        shift_id = request.data.get('shift_id')
        items_data = request.data.get('items', [])
        payment_method = request.data.get('payment_method', PosSale.PaymentMethod.POS_CARD)
        card_ref = request.data.get('card_ref', '')
        discount = int(request.data.get('discount_amount', 0))

        if not items_data:
            return Response({'error': 'سبد خرید صندوق خالی است.'}, status=status.HTTP_400_BAD_REQUEST)

        # تولید شماره فاکتور منحصر به فرد
        inv_number = f"POS-{timezone.now().strftime('%Y%m%d%H%M%S')}-{request.user.id}"

        total_amount = 0
        sale = PosSale.objects.create(
            invoice_number=inv_number,
            shift_id=shift_id,
            cashier=request.user,
            payment_method=payment_method,
            total_amount=0,
            discount_amount=discount,
            final_amount=0,
            pos_card_ref=card_ref
        )

        for item in items_data:
            product = CigaretteProduct.objects.select_for_update().get(id=item['product_id'])
            qty = int(item['quantity'])
            unit_price = int(item['unit_price'])
            subtotal = qty * unit_price
            total_amount += subtotal

            PosSaleItem.objects.create(
                sale=sale,
                product=product,
                unit_type=item.get('unit_type', 'pack'),
                quantity=qty,
                unit_price=unit_price,
                subtotal=subtotal
            )

        sale.total_amount = total_amount
        sale.final_amount = max(0, total_amount - discount)
        sale.save()

        return Response(PosSaleSerializer(sale).data, status=status.HTTP_201_CREATED)
`,
    urls: `"""
pos/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PosRegisterViewSet, PosShiftViewSet, PosSaleViewSet

router = DefaultRouter()
router.register('registers', PosRegisterViewSet, basename='pos-register')
router.register('shifts', PosShiftViewSet, basename='pos-shift')
router.register('sales', PosSaleViewSet, basename='pos-sale')

urlpatterns = [
    path('', include(router.urls)),
]
`,
  },
  warehouse: {
    id: 'warehouse',
    name: 'warehouse',
    nameFa: 'انبار و کاردکس (Warehouse)',
    icon: 'Archive',
    description: 'موجودی انبار، تاریخچه ورود و خروج، کاردکس، ضایعات',
    models: `"""
warehouse/models.py
مدل‌های مدیریت چندانباره، موجودی لحظه‌ای کارتن/باکس، کاردکس ورود/خروج کالا و ضایعات
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from catalog.models import CigaretteProduct


class WarehouseLocation(models.Model):
    name = models.CharField(_("نام انبار"), max_length=120)
    code = models.CharField(_("کد انبار"), max_length=30, unique=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_warehouses', verbose_name=_("مدیر/انباردار"))
    address = models.TextField(_("آدرس دقیق انبار"))
    phone = models.CharField(_("شماره تماس انبار"), max_length=20)
    is_active = models.BooleanField(_("فعال"), default=True)

    class Meta:
        verbose_name = _("انبار")
        verbose_name_plural = _("۱. انبارها و مراکز لجستیک")

    def __str__(self):
        return f"{self.name} (کد: {self.code})"


class WarehouseStock(models.Model):
    warehouse = models.ForeignKey(WarehouseLocation, on_delete=models.CASCADE, related_name='stocks', verbose_name=_("انبار"))
    product = models.ForeignKey(CigaretteProduct, on_delete=models.CASCADE, related_name='stocks', verbose_name=_("محصول"))
    cartons_count = models.PositiveIntegerField(_("موجودی کارتن"), default=0)
    loose_boxes_count = models.PositiveIntegerField(_("موجودی باکس تکی"), default=0)
    min_stock_alert = models.PositiveIntegerField(_("حداقل نقطه سفارش (کارتن)"), default=5)
    updated_at = models.DateTimeField(_("آخرین به‌روزرسانی موجودی"), auto_now=True)

    class Meta:
        verbose_name = _("موجودی انبار کالا")
        verbose_name_plural = _("۲. موجودی لحظه‌ای انبار")
        unique_together = ['warehouse', 'product']

    def __str__(self):
        return f"{self.product.name_fa} در {self.warehouse.name}: {self.cartons_count} کارتن"


class KardexEntry(models.Model):
    class MovementType(models.TextChoices):
        PURCHASE_ENTRY = 'in_purchase', _('ورود بار خرید عمده (کارخانه)')
        SALES_EXIT = 'out_sale', _('خروج بار سفارش بنکدار')
        POS_EXIT = 'out_pos', _('خروج فروش صندوق حضوری')
        TRANSFER_IN = 'in_transfer', _('انتقال ورودی از انبار دیگر')
        TRANSFER_OUT = 'out_transfer', _('انتقال خروجی به انبار دیگر')
        WASTE_ADJUSTMENT = 'out_waste', _('ضایعات و افت بار خیس‌خورده')
        INVENTORY_AUDIT = 'audit', _('تعدیل انبارگردانی دوره‌ای')

    stock = models.ForeignKey(WarehouseStock, on_delete=models.CASCADE, related_name='kardex_entries', verbose_name=_("رکورد موجودی"))
    movement_type = models.CharField(_("نوع گردش کالا"), max_length=30, choices=MovementType.choices)
    reference_code = models.CharField(_("شماره فاکتور / حواله انبار"), max_length=60, db_index=True)
    quantity_cartons_change = models.IntegerField(_("تغییرات کارتن (مثبت یا منفی)"))
    balance_cartons_after = models.PositiveIntegerField(_("مانده کارتن بعد از گردش"))
    operator = models.ForeignKey(User, on_delete=models.PROTECT, related_name='kardex_ops', verbose_name=_("انباردار ثبت‌کننده"))
    description = models.CharField(_("توضیحات و علت گردش"), max_length=255, blank=True)
    created_at = models.DateTimeField(_("تاریخ و زمان گردش"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("ردیف کاردکس کالا")
        verbose_name_plural = _("۳. کاردکس ریالی و مقداری کالاها")
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"{self.get_movement_type_display()} | سند: {self.reference_code} | مانده: {self.balance_cartons_after}"
`,
    admin: `"""
warehouse/admin.py
پنل ادمین انبار، کاردکس و موجودی کالاها
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import WarehouseLocation, WarehouseStock, KardexEntry


@admin.register(WarehouseLocation)
class WarehouseLocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'manager', 'phone', 'is_active')
    search_fields = ('name', 'code')


@admin.register(WarehouseStock)
class WarehouseStockAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse', 'cartons_count', 'loose_boxes_count', 'stock_status_badge', 'updated_at')
    list_filter = ('warehouse', 'product__brand')
    search_fields = ('product__name_fa', 'warehouse__name')

    def stock_status_badge(self, obj):
        if obj.cartons_count <= 0:
            return format_html('<span style="color: red; font-weight: bold;">ناموجود (اتمام)</span>')
        elif obj.cartons_count <= obj.min_stock_alert:
            return format_html(f'<span style="color: orange; font-weight: bold;">رو به اتمام ({obj.cartons_count} کارتن)</span>')
        return format_html(f'<span style="color: green;">موجود کافی ({obj.cartons_count} کارتن)</span>')
    stock_status_badge.short_description = "وضعیت شارژ انبار"


@admin.register(KardexEntry)
class KardexEntryAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'stock', 'movement_type', 'reference_code', 'quantity_cartons_change', 'balance_cartons_after', 'operator')
    list_filter = ('movement_type', 'stock__warehouse', 'created_at')
    search_fields = ('reference_code', 'stock__product__name_fa')
    readonly_fields = ('created_at',)
`,
    serializers: `"""
warehouse/serializers.py
"""
from rest_framework import serializers
from .models import WarehouseLocation, WarehouseStock, KardexEntry


class WarehouseLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WarehouseLocation
        fields = '__all__'


class WarehouseStockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name_fa', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)

    class Meta:
        model = WarehouseStock
        fields = '__all__'


class KardexEntrySerializer(serializers.ModelSerializer):
    movement_type_label = serializers.CharField(source='get_movement_type_display', read_only=True)
    product_name = serializers.CharField(source='stock.product.name_fa', read_only=True)

    class Meta:
        model = KardexEntry
        fields = '__all__'
`,
    views: `"""
warehouse/views.py
ویوهای مدیریت موجودی، صدور حواله و گردش کاردکس کالا
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import WarehouseLocation, WarehouseStock, KardexEntry
from .serializers import WarehouseLocationSerializer, WarehouseStockSerializer, KardexEntrySerializer


class WarehouseStockViewSet(viewsets.ModelViewSet):
    queryset = WarehouseStock.objects.select_related('product', 'warehouse').all()
    serializer_class = WarehouseStockSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='kardex')
    def get_kardex(self, request, pk=None):
        stock = self.get_object()
        entries = stock.kardex_entries.all()[:100]
        return Response(KardexEntrySerializer(entries, many=True).data)

    @action(detail=False, methods=['post'], url_path='adjust-stock')
    @transaction.atomic
    def adjust_stock(self, request):
        stock_id = request.data.get('stock_id')
        change_cartons = int(request.data.get('cartons_change', 0))
        movement_type = request.data.get('movement_type', KardexEntry.MovementType.INVENTORY_AUDIT)
        ref_code = request.data.get('reference_code', 'MANUAL-ADJ')
        desc = request.data.get('description', '')

        stock = WarehouseStock.objects.select_for_update().get(id=stock_id)
        new_balance = stock.cartons_count + change_cartons
        if new_balance < 0:
            return Response({'error': 'موجودی انبار نمی‌تواند منفی شود.'}, status=status.HTTP_400_BAD_REQUEST)

        stock.cartons_count = new_balance
        stock.save()

        kardex = KardexEntry.objects.create(
            stock=stock,
            movement_type=movement_type,
            reference_code=ref_code,
            quantity_cartons_change=change_cartons,
            balance_cartons_after=new_balance,
            operator=request.user,
            description=desc
        )

        return Response({
            'success': True,
            'new_balance': new_balance,
            'kardex_id': kardex.id
        }, status=status.HTTP_200_OK)
`,
    urls: `"""
warehouse/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseStockViewSet

router = DefaultRouter()
router.register('stocks', WarehouseStockViewSet, basename='warehouse-stock')

urlpatterns = [
    path('', include(router.urls)),
]
`,
  },
  finance: {
    id: 'finance',
    name: 'finance',
    nameFa: 'حساب‌های دفتری و مالی (Finance)',
    icon: 'BookOpen',
    description: 'حساب‌های نسیه، تسویه حساب‌ها، سقف اعتبار مشتریان',
    models: `"""
finance/models.py
مدل‌های حساب‌های دفتری (نسیه)، ریز گردش تراکنش‌های مالی، سقف اعتبار و چک‌های صیادی
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class CustomerLedger(models.Model):
    customer = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ledger_account', verbose_name=_("مشتری"))
    credit_limit = models.BigIntegerField(_("سقف اعتبار نسیه (تومان)"), default=0)
    current_balance = models.BigIntegerField(_("مانده بدهی جاری (تومان)"), default=0, help_text="مبالغ مثبت نشان‌دهنده بدهی مشتری است.")
    max_overdue_days = models.PositiveIntegerField(_("مهلت تسویه نسیه (روز)"), default=30)
    is_blocked = models.BooleanField(_("حساب نسیه مسدود شده"), default=False)
    last_settled_at = models.DateTimeField(_("تاریخ آخرین تسویه کامل"), null=True, blank=True)
    created_at = models.DateTimeField(_("تاریخ افتتاح حساب دفتری"), auto_now_add=True)

    class Meta:
        verbose_name = _("حساب دفتری مشتری")
        verbose_name_plural = _("۱. حساب‌های دفتری و اعتباری (نسیه)")

    def __str__(self):
        return f"دفتر {self.customer.full_name} | مانده بدهی: {self.current_balance:,} تومان"


class LedgerTransaction(models.Model):
    class TransactionType(models.TextChoices):
        CREDIT_SALE = 'credit_sale', _('فاکتور فروش نسیه')
        CASH_PAYMENT = 'cash_payment', _('دریافت وجه نقد')
        BANK_TRANSFER = 'bank_transfer', _('حواله بانکی پایا / ساتنا')
        CHEQUE = 'cheque', _('دریافت چک صیادی')
        SETTLEMENT_DISCOUNT = 'discount', _('تخفیف تسویه نقدی')

    ledger = models.ForeignKey(CustomerLedger, on_delete=models.CASCADE, related_name='transactions', verbose_name=_("دفتر حساب"))
    transaction_type = models.CharField(_("نوع تراکنش"), max_length=30, choices=TransactionType.choices)
    document_ref = models.CharField(_("شماره سند / فاکتور"), max_length=60, db_index=True)
    debit_amount = models.BigIntegerField(_("بدهکار (افزایش بدهی - تومان)"), default=0)
    credit_amount = models.BigIntegerField(_("بستانکار (پرداخت مشتری - تومان)"), default=0)
    balance_after = models.BigIntegerField(_("مانده بعد از سند (تومان)"))
    recorded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='recorded_finance_docs', verbose_name=_("حسابدار ثبت‌کننده"))
    description = models.CharField(_("شرح سند"), max_length=255)
    created_at = models.DateTimeField(_("زمان ثبت سند"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("تراکنش حساب دفتری")
        verbose_name_plural = _("۲. ریز گردش تراکنش‌های مالی و اسناد")
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"{self.get_transaction_type_display()} | سند: {self.document_ref} | مانده: {self.balance_after:,}"


class ChequeRecord(models.Model):
    class ChequeStatus(models.TextChoices):
        PENDING = 'pending', _('در جریان وصول (نزد صندوق)')
        PASSED = 'passed', _('وصول شده و نشسته به حساب')
        BOUNCED = 'bounced', _('برگشت خورده (عدم موجودی)')
        RETURNED = 'returned', _('عودت به مشتری')

    ledger = models.ForeignKey(CustomerLedger, on_delete=models.CASCADE, related_name='cheques', verbose_name=_("دفتر مشتری"))
    sayad_number = models.CharField(_("شناسه ۱۶ رقمی صیاد"), max_length=16, unique=True)
    bank_name = models.CharField(_("بانک صادرکننده"), max_length=80)
    amount = models.BigIntegerField(_("مبلغ چک (تومان)"))
    due_date = models.DateField(_("تاریخ سررسید"))
    status = models.CharField(_("وضعیت وصول"), max_length=20, choices=ChequeStatus.choices, default=ChequeStatus.PENDING)
    notes = models.CharField(_("توضیحات و پشت‌نویسی"), max_length=255, blank=True)
    created_at = models.DateTimeField(_("تاریخ دریافت"), auto_now_add=True)

    class Meta:
        verbose_name = _("چک صیادی مشتری")
        verbose_name_plural = _("۳. چک‌های صیادی و اسناد تجاری")
        ordering = ['due_date']

    def __str__(self):
        return f"چک صیادی {self.sayad_number} | {self.amount:,} تومان ({self.get_status_display()})"
`,
    admin: `"""
finance/admin.py
پنل ادمین حساب‌های دفتری و چک‌ها
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import CustomerLedger, LedgerTransaction, ChequeRecord


class LedgerTransactionInline(admin.TabularInline):
    model = LedgerTransaction
    extra = 0
    readonly_fields = ('created_at', 'transaction_type', 'document_ref', 'debit_amount', 'credit_amount', 'balance_after', 'recorded_by', 'description')


@admin.register(CustomerLedger)
class CustomerLedgerAdmin(admin.ModelAdmin):
    list_display = ('customer', 'credit_limit_display', 'current_balance_display', 'is_blocked', 'last_settled_at')
    list_filter = ('is_blocked',)
    search_fields = ('customer__full_name', 'customer__phone')
    inlines = [LedgerTransactionInline]

    def credit_limit_display(self, obj):
        return f"{obj.credit_limit:,} تومان"
    credit_limit_display.short_description = "سقف اعتبار"

    def current_balance_display(self, obj):
        color = 'red' if obj.current_balance > 0 else 'green'
        return format_html(f'<b style="color: {color};">{obj.current_balance:,} تومان</b>')
    current_balance_display.short_description = "مانده بدهی جاری"


@admin.register(LedgerTransaction)
class LedgerTransactionAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'ledger', 'transaction_type', 'document_ref', 'debit_amount', 'credit_amount', 'balance_after')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('document_ref', 'ledger__customer__full_name', 'description')
    readonly_fields = ('created_at',)


@admin.register(ChequeRecord)
class ChequeRecordAdmin(admin.ModelAdmin):
    list_display = ('sayad_number', 'ledger', 'bank_name', 'amount_display', 'due_date', 'status_badge')
    list_filter = ('status', 'bank_name', 'due_date')
    search_fields = ('sayad_number', 'ledger__customer__full_name')

    def amount_display(self, obj):
        return f"{obj.amount:,} تومان"
    amount_display.short_description = "مبلغ چک"

    def status_badge(self, obj):
        colors = {'pending': '#f59e0b', 'passed': '#10b981', 'bounced': '#ef4444', 'returned': '#64748b'}
        return format_html(
            f'<span style="background-color: {colors.get(obj.status, "#64748b")}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">'
            f'{obj.get_status_display()}</span>'
        )
    status_badge.short_description = "وضعیت"
`,
    serializers: `"""
finance/serializers.py
"""
from rest_framework import serializers
from .models import CustomerLedger, LedgerTransaction, ChequeRecord


class CustomerLedgerSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)

    class Meta:
        model = CustomerLedger
        fields = '__all__'


class LedgerTransactionSerializer(serializers.ModelSerializer):
    transaction_label = serializers.CharField(source='get_transaction_type_display', read_only=True)
    recorder_name = serializers.CharField(source='recorded_by.full_name', read_only=True)

    class Meta:
        model = LedgerTransaction
        fields = '__all__'


class ChequeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChequeRecord
        fields = '__all__'
`,
    views: `"""
finance/views.py
ویوهای حساب‌های دفتری، تسویه بدهی و استیتمنت مالی
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import CustomerLedger, LedgerTransaction, ChequeRecord
from .serializers import CustomerLedgerSerializer, LedgerTransactionSerializer, ChequeRecordSerializer


class CustomerLedgerViewSet(viewsets.ModelViewSet):
    queryset = CustomerLedger.objects.all()
    serializer_class = CustomerLedgerSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='statement')
    def statement(self, request, pk=None):
        ledger = self.get_object()
        txs = ledger.transactions.all()[:50]
        return Response({
            'customer_name': ledger.customer.full_name,
            'credit_limit': ledger.credit_limit,
            'current_debt': ledger.current_balance,
            'is_blocked': ledger.is_blocked,
            'transactions': LedgerTransactionSerializer(txs, many=True).data
        })

    @action(detail=False, methods=['post'], url_path='settle-payment')
    @transaction.atomic
    def settle_payment(self, request):
        user_id = request.data.get('customer_id')
        payment_type = request.data.get('payment_type', LedgerTransaction.TransactionType.BANK_TRANSFER)
        amount = int(request.data.get('amount', 0))
        doc_ref = request.data.get('reference_code', 'SETTLE')
        desc = request.data.get('description', 'تسویه حساب دفتری')

        ledger = CustomerLedger.objects.select_for_update().get(customer_id=user_id)
        new_balance = max(0, ledger.current_balance - amount)
        ledger.current_balance = new_balance
        ledger.save()

        tx = LedgerTransaction.objects.create(
            ledger=ledger,
            transaction_type=payment_type,
            document_ref=doc_ref,
            debit_amount=0,
            credit_amount=amount,
            balance_after=new_balance,
            recorded_by=request.user,
            description=desc
        )

        return Response({
            'success': True,
            'transaction_id': tx.id,
            'settled_amount': amount,
            'remaining_debt': new_balance
        }, status=status.HTTP_201_CREATED)


class ChequeViewSet(viewsets.ModelViewSet):
    queryset = ChequeRecord.objects.all()
    serializer_class = ChequeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
`,
    urls: `"""
finance/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerLedgerViewSet, ChequeViewSet

router = DefaultRouter()
router.register('ledgers', CustomerLedgerViewSet, basename='customer-ledger')
router.register('cheques', ChequeViewSet, basename='cheque')

urlpatterns = [
    path('', include(router.urls)),
]
`,
  },
  reports: {
    id: 'reports',
    name: 'reports',
    nameFa: 'گزارشات فروش و کالا (Reports)',
    icon: 'BarChart3',
    description: 'آمار فروش روزانه و تحلیل تک محصول',
    models: `"""
reports/models.py
مدل‌های تحلیل هوشمند فروش، کش آمار دوره‌ای و ماتریس سودآوری کالاها
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from catalog.models import CigaretteProduct


class DailySalesSnapshot(models.Model):
    report_date = models.DateField(_("تاریخ گزارش"), unique=True, db_index=True)
    wholesale_orders_count = models.PositiveIntegerField(_("تعداد سفارشات عمده"), default=0)
    pos_sales_count = models.PositiveIntegerField(_("تعداد فاکتورهای حضوری (POS)"), default=0)
    total_revenue = models.BigIntegerField(_("کل فروش ناخالص روز (تومان)"), default=0)
    total_discount = models.BigIntegerField(_("کل تخفیفات داده‌شده (تومان)"), default=0)
    estimated_gross_profit = models.BigIntegerField(_("سود ناخالص برآوردی (تومان)"), default=0)
    cash_collected = models.BigIntegerField(_("دریافتی نقد و کارتخوان (تومان)"), default=0)
    credit_issued = models.BigIntegerField(_("فروش نسیه و دفتری (تومان)"), default=0)
    created_at = models.DateTimeField(_("زمان ایجاد کش"), auto_now_add=True)

    class Meta:
        verbose_name = _("اسنپ‌شات فروش روزانه")
        verbose_name_plural = _("۱. اسنپ‌شات‌ها و گزارشات روزانه فروش")
        ordering = ['-report_date']

    def __str__(self):
        return f"گزارش مالی {self.report_date} | فروش: {self.total_revenue:,} تومان"


class ProductSalesMetric(models.Model):
    product = models.ForeignKey(CigaretteProduct, on_delete=models.CASCADE, related_name='sales_metrics', verbose_name=_("محصول"))
    period_month = models.CharField(_("ماه گزارش"), max_length=7, db_index=True, help_text="فرمت: 1403-06")
    total_cartons_sold = models.DecimalField(_("مجموع کارتن‌های فروخته‌شده"), max_digits=10, decimal_places=2, default=0)
    total_boxes_sold = models.PositiveIntegerField(_("مجموع باکس‌های فروخته‌شده"), default=0)
    total_sales_amount = models.BigIntegerField(_("مبلغ کل فروش (تومان)"), default=0)
    profit_margin_percent = models.DecimalField(_("درصد حاشیه سود"), max_digits=5, decimal_places=2, default=0)

    class Meta:
        verbose_name = _("آمار فروش کالا")
        verbose_name_plural = _("۲. ماتریس سودآوری و رتبه‌بندی محصولات")
        unique_together = ['product', 'period_month']

    def __str__(self):
        return f"{self.product.name_fa} ({self.period_month}) | کارتن: {self.total_cartons_sold}"
`,
    admin: `"""
reports/admin.py
پنل ادمین گزارشات و داشبورد مدیریتی
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import DailySalesSnapshot, ProductSalesMetric


@admin.register(DailySalesSnapshot)
class DailySalesSnapshotAdmin(admin.ModelAdmin):
    list_display = ('report_date', 'total_revenue_display', 'estimated_gross_profit_display', 'wholesale_orders_count', 'pos_sales_count', 'cash_vs_credit_ratio')
    list_filter = ('report_date',)
    readonly_fields = ('created_at',)

    def total_revenue_display(self, obj):
        return f"{obj.total_revenue:,} تومان"
    total_revenue_display.short_description = "کل فروش روز"

    def estimated_gross_profit_display(self, obj):
        return format_html(f'<b style="color: green;">{obj.estimated_gross_profit:,} تومان</b>')
    estimated_gross_profit_display.short_description = "سود ناخالص"

    def cash_vs_credit_ratio(self, obj):
        total = obj.cash_collected + obj.credit_issued
        if total == 0:
            return "-"
        cash_pct = int((obj.cash_collected / total) * 100)
        return f"{cash_pct}% نقد / {100 - cash_pct}% نسیه"
    cash_vs_credit_ratio.short_description = "نسبت نقد/نسیه"


@admin.register(ProductSalesMetric)
class ProductSalesMetricAdmin(admin.ModelAdmin):
    list_display = ('product', 'period_month', 'total_cartons_sold', 'total_sales_amount_display', 'profit_margin_percent')
    list_filter = ('period_month',)
    search_fields = ('product__name_fa',)

    def total_sales_amount_display(self, obj):
        return f"{obj.total_sales_amount:,} تومان"
    total_sales_amount_display.short_description = "فروش کل"
`,
    serializers: `"""
reports/serializers.py
"""
from rest_framework import serializers
from .models import DailySalesSnapshot, ProductSalesMetric


class DailySalesSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySalesSnapshot
        fields = '__all__'


class ProductSalesMetricSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name_fa', read_only=True)

    class Meta:
        model = ProductSalesMetric
        fields = '__all__'
`,
    views: `"""
reports/views.py
ویوهای محاسباتی آمار، داشبورد هوشمند فروش و خروجی اکسل
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.utils import timezone
from .models import DailySalesSnapshot, ProductSalesMetric
from .serializers import DailySalesSnapshotSerializer, ProductSalesMetricSerializer
from orders.models import OrderInvoice
from pos.models import PosSale


class SalesAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'], url_path='dashboard-summary')
    def dashboard_summary(self, request):
        today = timezone.now().date()
        
        # محاسبه سفارشات عمده امروز
        orders_today = OrderInvoice.objects.filter(created_at__date=today)
        orders_total = orders_today.aggregate(total=Sum('total_amount'))['total'] or 0
        orders_count = orders_today.count()

        # محاسبه فروش صندوق امروز
        pos_today = PosSale.objects.filter(created_at__date=today)
        pos_total = pos_today.aggregate(total=Sum('final_amount'))['total'] or 0
        pos_count = pos_today.count()

        combined_revenue = orders_total + pos_total
        estimated_profit = int(combined_revenue * 0.08)  # میانگین ۸٪ مارجین عمده دخانیات

        return Response({
            'date': today.strftime('%Y/%m/%d'),
            'total_revenue': combined_revenue,
            'estimated_gross_profit': estimated_profit,
            'wholesale_sales': orders_total,
            'wholesale_invoices_count': orders_count,
            'pos_sales': pos_total,
            'pos_sales_count': pos_count
        })

    @action(detail=False, methods=['get'], url_path='top-selling')
    def top_selling(self, request):
        metrics = ProductSalesMetric.objects.select_related('product').order_by('-total_cartons_sold')[:10]
        return Response(ProductSalesMetricSerializer(metrics, many=True).data)
`,
    urls: `"""
reports/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalesAnalyticsViewSet

router = DefaultRouter()
router.register('analytics', SalesAnalyticsViewSet, basename='sales-analytics')

urlpatterns = [
    path('', include(router.urls)),
]
`,
  },
  roles: {
    id: 'roles',
    name: 'roles',
    nameFa: 'مدیریت نقش‌ها و دسترسی‌ها (RBAC)',
    icon: 'ShieldAlert',
    description: 'تعریف ادمین انبار، اپراتور صندوق و محدودیت‌های سیستم',
    models: `"""
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
`,
    admin: `"""
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
`,
    serializers: `"""
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
`,
    views: `"""
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
`,
    urls: `"""
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
`,
  },
  sms: {
    id: 'sms',
    name: 'sms',
    nameFa: 'سرویس پیامک کاوه‌نگار (Kavenegar SMS)',
    icon: 'MessageSquare',
    description: 'سرویس ارسال و تایید پیامک کاوه‌نگار برای احراز هویت و اطلاع‌رسانی',
    models: `"""
sms/models.py
مدل‌های مدیریت وب‌سرویس پیامک کاوه‌نگار (Kavenegar Gateway)، پترن‌های خدماتی OTP و لاگ تحویل
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class SmsTemplate(models.Model):
    class EventType(models.TextChoices):
        OTP_LOGIN = 'otp_login', _('کد تایید ورود OTP')
        ORDER_REGISTERED = 'order_created', _('ثبت سفارش جدید عمده')
        ORDER_SHIPPED = 'order_shipped', _('تحویل بار به باربری')
        POS_RECEIPT = 'pos_receipt', _('رسید فاکتور صندوق حضوری')
        CHEQUE_DUE_REMINDER = 'cheque_due', _('یادآوری سررسید چک صیادی')
        DEBT_OVERDUE = 'debt_overdue', _('هشدار تاخیر تسویه نسیه')

    template_type = models.CharField(_("نوع رویداد پیامک"), max_length=40, choices=EventType.choices, unique=True)
    kavenegar_pattern_name = models.CharField(_("نام قالب در پنل کاوه‌نگار"), max_length=60, help_text="نام Template تعریف‌شده در پنل کاوه‌نگار")
    template_body = models.TextField(_("متن نمونه الگو"), help_text="مثال: شرکت آذرخش؛ کد ورود شما: %token")
    is_active = models.BooleanField(_("فعال"), default=True)

    class Meta:
        verbose_name = _("الگوی پیامک کاوه‌نگار")
        verbose_name_plural = _("۱. الگوهای پترن وب‌سرویس کاوه‌نگار (Lookup)")

    def __str__(self):
        return f"{self.get_template_type_display()} ({self.kavenegar_pattern_name})"


class SmsLog(models.Model):
    class DeliveryStatus(models.TextChoices):
        QUEUED = 'queued', _('در صف ارسال')
        SENT = 'sent', _('ارسال‌شده به مخابرات')
        DELIVERED = 'delivered', _('رسیده به گوشی مشتری')
        FAILED = 'failed', _('خطا در ارسال')

    recipient_phone = models.CharField(_("شماره گیرنده"), max_length=15, db_index=True)
    template = models.ForeignKey(SmsTemplate, on_delete=models.SET_NULL, null=True, related_name='logs', verbose_name=_("الگو"))
    tokens_sent = models.JSONField(_("توکن‌های ارسالی"), default=dict)
    kavenegar_message_id = models.CharField(_("شناسه پیامک کاوه‌نگار (MessageID)"), max_length=40, blank=True)
    status = models.CharField(_("وضعیت تحویل"), max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.QUEUED)
    cost_rial = models.PositiveIntegerField(_("هزینه پیامک (ریال)"), default=0)
    created_at = models.DateTimeField(_("زمان ارسال"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("لاگ پیامک ارسالی")
        verbose_name_plural = _("۲. لاگ و تاریخچه پیامک‌های کاوه‌نگار")
        ordering = ['-created_at']

    def __str__(self):
        return f"پیامک به {self.recipient_phone} | {self.get_status_display()} ({self.created_at})"
`,
    admin: `"""
sms/admin.py
پنل ادمین الگوها و لاگ‌های کاوه‌نگار
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import SmsTemplate, SmsLog


@admin.register(SmsTemplate)
class SmsTemplateAdmin(admin.ModelAdmin):
    list_display = ('template_type', 'kavenegar_pattern_name', 'is_active')
    list_editable = ('is_active',)


@admin.register(SmsLog)
class SmsLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'recipient_phone', 'template', 'kavenegar_message_id', 'status_badge')
    list_filter = ('status', 'template', 'created_at')
    search_fields = ('recipient_phone', 'kavenegar_message_id')
    readonly_fields = ('created_at', 'tokens_sent', 'kavenegar_message_id')

    def status_badge(self, obj):
        colors = {'queued': '#64748b', 'sent': '#3b82f6', 'delivered': '#10b981', 'failed': '#ef4444'}
        return format_html(
            f'<span style="background-color: {colors.get(obj.status, "#64748b")}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">'
            f'{obj.get_status_display()}</span>'
        )
    status_badge.short_description = "وضعیت"
`,
    serializers: `"""
sms/serializers.py
"""
from rest_framework import serializers
from .models import SmsTemplate, SmsLog


class SmsTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmsTemplate
        fields = '__all__'


class SmsLogSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.get_template_type_display', read_only=True)

    class Meta:
        model = SmsLog
        fields = '__all__'
`,
    views: `"""
sms/views.py
سرویس اتصال به وب‌سرویس پترن و OTP کاوه‌نگار (Kavenegar API Client)
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
import requests
import logging
from .models import SmsTemplate, SmsLog

logger = logging.getLogger(__name__)


class KavenegarService:
    """
    سرویس مرکزی کاوه‌نگار برای ارسال پیامک‌های پترن (Verify Lookup) و اطلاع‌رسانی
    """
    API_KEY = getattr(settings, 'KAVENEGAR_API_KEY', 'MOCK_API_KEY')
    BASE_URL = f"https://api.kavenegar.com/v1/{API_KEY}/verify/lookup.json"

    @classmethod
    def send_pattern_sms(cls, receptor: str, token: str, template_type: str, token2: str = None, token3: str = None):
        sms_template = SmsTemplate.objects.filter(template_type=template_type, is_active=True).first()
        pattern_name = sms_template.kavenegar_pattern_name if sms_template else template_type

        params = {
            'receptor': receptor,
            'token': token,
            'template': pattern_name
        }
        if token2:
            params['token2'] = token2
        if token3:
            params['token3'] = token3

        log_record = SmsLog.objects.create(
            recipient_phone=receptor,
            template=sms_template,
            tokens_sent=params,
            status=SmsLog.DeliveryStatus.QUEUED
        )

        try:
            response = requests.post(cls.BASE_URL, data=params, timeout=5)
            data = response.json()
            
            if response.status_code == 200 and data.get('return', {}).get('status') == 200:
                entry = data.get('entries', [{}])[0]
                log_record.kavenegar_message_id = str(entry.get('messageid', ''))
                log_record.cost_rial = entry.get('cost', 0)
                log_record.status = SmsLog.DeliveryStatus.SENT
                log_record.save()
                return True, log_record.kavenegar_message_id
            else:
                log_record.status = SmsLog.DeliveryStatus.FAILED
                log_record.save()
                return False, data.get('return', {}).get('message')
        except Exception as e:
            logger.error(f"Kavenegar SMS Error: {str(e)}")
            log_record.status = SmsLog.DeliveryStatus.FAILED
            log_record.save()
            return False, str(e)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_otp_view(request):
    phone = request.data.get('phone', '').strip()
    if not phone or len(phone) < 11:
        return Response({'error': 'شماره موبایل نامعتبر است.'}, status=status.HTTP_400_BAD_REQUEST)

    import random
    otp_code = str(random.randint(10000, 99999))
    
    success, msg = KavenegarService.send_pattern_sms(
        receptor=phone,
        token=otp_code,
        template_type=SmsTemplate.EventType.OTP_LOGIN
    )

    return Response({
        'success': True,
        'message': 'کد تایید پیامک شد.',
        'expires_in': 120
    })
`,
    urls: `"""
sms/urls.py
"""
from django.urls import path
from .views import send_otp_view

urlpatterns = [
    path('send-otp/', send_otp_view, name='sms-send-otp'),
]
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
