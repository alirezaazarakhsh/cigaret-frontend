from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PosStaff

User = get_user_model()

# ==============================================================================
# ۱. لیست کامل و مرجع تمام دسترسی‌های اختصاصی صندوق و انبار
# ==============================================================================
PERMISSION_FIELDS = [
    'manage_pos',
    'manage_inventory',
    'quick_add_product',
    'manage_ledger',
    'view_reports',
    'monthly_comparison',
    'customer_app_connect',
    'manage_staff',
    'send_sms',
    'manage_tickets',
    'manage_notifications',
    'manage_warehouse_messages',
    'manage_site_settings',
    'manage_sliders',
    'manage_footer_settings',
    'delete_receipts',
]

# ترجمه فارسی عنوان دسترسی‌ها برای نمایش مستقیم در وب‌سرویس و UI
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


# ==============================================================================
# ۲. سریالایزر ورود پرسنل (Login)
# ==============================================================================
class LoginSerializer(serializers.Serializer):
    """
    سریالایزر دریافت و اعتبارسنجی فرم ورود پرسنل صندوق و انبار
    """
    phone = serializers.CharField(
        max_length=15,
        required=True,
        help_text="شماره همراه پرسنل (مثال: 09120759419)"
    )
    password = serializers.CharField(
        max_length=50,
        required=True,
        trim_whitespace=False,
        help_text="رمز عبور یا پین‌کد عددی ورود"
    )
    remember_me = serializers.BooleanField(
        required=False,
        default=True,
        help_text="ذخیره نشست لاگین در مرورگر"
    )

    def validate_phone(self, value):
        value = value.strip()
        if not value.isdigit():
            raise serializers.ValidationError("شماره همراه باید فقط شامل اعداد انگلیسی/فارسی باشد.")
        if len(value) < 10:
            raise serializers.ValidationError("شماره همراه معتبر نیست (حداقل ۱۰ رقم).")
        return value


# ==============================================================================
# ۳. سریالایزر ایجاد پرسنل جدید (Create Staff)
# ==============================================================================
class PosStaffCreateSerializer(serializers.Serializer):
    """
    سریالایزر ساخت حساب کاربر جدید همراه با پروفایل صندوق‌داری و دسترسی‌ها
    """
    phone = serializers.CharField(
        max_length=15,
        min_length=10,
        required=True,
        help_text="شماره همراه منحصربه‌فرد پرسنل"
    )
    full_name = serializers.CharField(
        max_length=100,
        required=True,
        help_text="نام و نام خانوادگی کامل پرسنل"
    )
    password = serializers.CharField(
        max_length=50,
        min_length=4,
        required=True,
        trim_whitespace=False,
        help_text="رمز عبور یا پین‌کد اولیه ورود به صندوق"
    )
    role = serializers.ChoiceField(
        choices=PosStaff.ROLE_CHOICES,
        default='cashier',
        help_text="نقش پیش‌فرض سازمانی (cashier, warehouse_manager, accountant, super_admin)"
    )
    roleTitleFa = serializers.CharField(
        max_length=100,
        required=False,
        default='صندوقدار',
        help_text="عنوان اختصاصی سمت شغلی به فارسی"
    )
    permissions = serializers.ListField(
        child=serializers.ChoiceField(choices=PERMISSION_FIELDS),
        required=False,
        default=list,
        help_text="آرایه‌ای از کلیدهای دسترسی مجاز برای این پرسنل"
    )

    def validate_phone(self, value):
        value = value.strip()
        if not value.isdigit():
            raise serializers.ValidationError('شماره همراه باید فقط شامل عدد باشد.')
        username_field = getattr(User, 'USERNAME_FIELD', 'username')
        if User.objects.filter(**{username_field: value}).exists():
            raise serializers.ValidationError('این شماره همراه قبلاً در سیستم ثبت شده است.')
        return value


# ==============================================================================
# ۴. سریالایزر ویرایش پرسنل (Update Staff)
# ==============================================================================
class PosStaffUpdateSerializer(serializers.Serializer):
    """
    سریالایزر ویرایش مشخصات، نقش، پین‌کد و آرایه دسترسی‌های پرسنل
    """
    full_name = serializers.CharField(
        max_length=100,
        required=False,
        help_text="نام و نام خانوادگی جدید"
    )
    phone = serializers.CharField(
        max_length=15,
        min_length=10,
        required=False,
        help_text="شماره همراه جدید"
    )
    password = serializers.CharField(
        max_length=50,
        min_length=4,
        required=False,
        trim_whitespace=False,
        help_text="پین‌کد یا رمز عبور جدید (در صورت عدم تغییر خالی بگذارید)"
    )
    role = serializers.ChoiceField(
        choices=PosStaff.ROLE_CHOICES,
        required=False,
        help_text="تغییر نقش سازمانی"
    )
    roleTitleFa = serializers.CharField(
        max_length=100,
        required=False,
        help_text="تغییر عنوان سمت شغلی"
    )
    permissions = serializers.ListField(
        child=serializers.ChoiceField(choices=PERMISSION_FIELDS),
        required=False,
        help_text="آرایه جدید دسترسی‌ها"
    )

    def validate_phone(self, value):
        if value:
            value = value.strip()
            if not value.isdigit():
                raise serializers.ValidationError('شماره همراه باید فقط شامل عدد باشد.')
        return value


# ==============================================================================
# ۵. سریالایزر خروجی استاندارد لیست و جزئیات (Output Serializer)
# ==============================================================================
class PosStaffOutSerializer(serializers.ModelSerializer):
    """
    خروجی استاندارد یک پرسنل برای نمایش در جدول مدیریت پرسنل و پنل صندوق
    """
    fullName = serializers.SerializerMethodField(help_text="نام و نام خانوادگی کامل")
    phone = serializers.SerializerMethodField(help_text="شماره همراه ورود")
    roleTitleFa = serializers.CharField(source='role_title', help_text="عنوان سمت به فارسی")
    permissions = serializers.SerializerMethodField(help_text="آرایه دسترسی‌های فعال")
    status = serializers.SerializerMethodField(help_text="وضعیت فعال/تعلیق")
    created_at = serializers.DateTimeField(format='%Y/%m/%d', help_text="تاریخ شمسی ثبت")

    class Meta:
        model = PosStaff
        fields = [
            'id',
            'fullName',
            'phone',
            'role',
            'roleTitleFa',
            'is_active',
            'status',
            'permissions',
            'created_at',
        ]

    def get_fullName(self, obj):
        user = obj.user
        if not user:
            return "کاربر سیستم"
        return (
            getattr(user, 'full_name', None)
            or getattr(user, 'first_name', None)
            or self.get_phone(obj)
        )

    def get_phone(self, obj):
        user = obj.user
        if not user:
            return ""
        return getattr(user, 'phone', None) or getattr(user, 'mobile', None) or getattr(user, 'username', '')

    def get_permissions(self, obj):
        return [name for name in PERMISSION_FIELDS if getattr(obj, f'perm_{name}', False)]

    def get_status(self, obj):
        return 'active' if obj.is_active else 'suspended'


# ==============================================================================
# ۶. سریالایزر جزئیات کامل همراه با ماتریس دسترسی‌ها (Detailed Serializer)
# ==============================================================================
class PosStaffDetailSerializer(serializers.ModelSerializer):
    """
    نمایش جزئی کامل پروفایل پرسنل همراه با مپ فیلدهای بولی دسترسی‌ها و برچسب‌های فارسی
    """
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
            'id',
            'fullName',
            'phone',
            'role',
            'roleTitleFa',
            'is_active',
            'status',
            'permissions_array',
            'permissions_matrix',
            'created_at',
        ]

    def get_fullName(self, obj):
        user = obj.user
        return (
            getattr(user, 'full_name', None)
            or getattr(user, 'first_name', None)
            or getattr(user, 'username', '')
        )

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


# ==============================================================================
# ۷. سریالایزر تغییر رمزا عبور / پین‌کد پرسنل (Reset Password)
# ==============================================================================
class PosStaffResetPasswordSerializer(serializers.Serializer):
    """
    سریالایزر اختصاصی تغییر یا بازنشانی رمز عبور پرسنل توسط مدیر
    """
    new_password = serializers.CharField(
        min_length=4,
        max_length=50,
        required=True,
        trim_whitespace=False,
        help_text="پین‌کد یا رمز عبور جدید"
    )
    confirm_password = serializers.CharField(
        min_length=4,
        max_length=50,
        required=True,
        trim_whitespace=False,
        help_text="تکرار رمز عبور جدید"
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "رمز عبور جدید و تکرار آن یکسان نیستند."})
        return attrs


# ==============================================================================
# ۸. سریالایزر لیست نشست‌های آنلاین همزمان (Active Sessions)
# ==============================================================================
class PosStaffActiveSessionSerializer(serializers.Serializer):
    """
    نمایش وضعیت آنلاین بودن صندوق‌داران و صندوق‌های فعال
    """
    id = serializers.IntegerField()
    fullName = serializers.CharField()
    phone = serializers.CharField()
    role = serializers.CharField()
    roleTitleFa = serializers.CharField()
    status = serializers.CharField(default='online')
    login_time = serializers.CharField(required=False, default='هم‌اکنون')
