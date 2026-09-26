from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import PosStaff

User = get_user_model()

PERMISSION_FIELDS = [
    'manage_pos', 'manage_inventory', 'quick_add_product', 'manage_ledger',
    'view_reports', 'monthly_comparison', 'customer_app_connect',
    'manage_staff', 'send_sms', 'manage_tickets', 'manage_notifications',
    'manage_warehouse_messages', 'manage_site_settings', 'manage_sliders',
    'manage_footer_settings', 'delete_receipts',
]

ROLE_TITLE_MAP = {
    'warehouse_manager': 'مدیر انبار و بنکداری',
    'cashier': 'صندوق‌دار فروشگاه',
    'accountant': 'حسابدار و بازرس مالی',
    'super_admin': 'مدیر ارشد سامانه',
}


class PosStaffOutSerializer(serializers.ModelSerializer):
    """خروجی جامع و دوگانه برای پشتیبانی کامل از تمامی نام‌های فیلد در فرانت‌اند"""
    fullName = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()
    roleTitleFa = serializers.SerializerMethodField()
    role_title = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%Y/%m/%d', read_only=True)

    class Meta:
        model = PosStaff
        fields = [
            'id', 'user_id', 'fullName', 'full_name', 'name', 'phone', 'role',
            'roleTitleFa', 'role_title', 'is_active', 'status', 'permissions', 'created_at',
        ]

    def get_user_id(self, obj):
        return obj.user_id if obj.user_id else obj.id

    def get_fullName(self, obj):
        if not obj.user:
            return 'پرسنل بدون نام'
        user = obj.user
        val = (
            getattr(user, 'full_name', None) or
            getattr(user, 'first_name', None) or
            getattr(user, 'username', None) or
            getattr(user, 'phone', None)
        )
        return str(val).strip() if val else 'پرسنل'

    def get_full_name(self, obj):
        return self.get_fullName(obj)

    def get_name(self, obj):
        return self.get_fullName(obj)

    def get_phone(self, obj):
        if not obj.user:
            return ''
        user = obj.user
        return str(
            getattr(user, 'phone', None) or
            getattr(user, 'mobile', None) or
            getattr(user, 'phone_number', None) or
            getattr(user, 'username', '')
        ).strip()

    def get_roleTitleFa(self, obj):
        if obj.role_title and obj.role_title.strip():
            return obj.role_title.strip()
        return ROLE_TITLE_MAP.get(obj.role, 'صندوق‌دار فروشگاه')

    def get_role_title(self, obj):
        return self.get_roleTitleFa(obj)

    def get_permissions(self, obj):
        perms = []
        for name in PERMISSION_FIELDS:
            if getattr(obj, f'perm_{name}', False):
                perms.append(name)
        return perms

    def get_status(self, obj):
        return 'active' if obj.is_active else 'suspended'


class PosStaffCreateSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    full_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    fullName = serializers.CharField(max_length=100, required=False, allow_blank=True)
    password = serializers.CharField(max_length=50)
    role = serializers.CharField(max_length=30, default='cashier')
    roleTitleFa = serializers.CharField(max_length=100, required=False, allow_blank=True)
    role_title = serializers.CharField(max_length=100, required=False, allow_blank=True)
    permissions = serializers.ListField(child=serializers.CharField(max_length=50), required=False, default=list)

    def create(self, validated_data):
        raw_phone = validated_data['phone'].strip()
        phone = raw_phone.replace(' ', '').replace('-', '')
        if phone.startswith('+98'):
            phone = '0' + phone[3:]
        elif phone.startswith('98'):
            phone = '0' + phone[2:]

        password = validated_data['password'].strip()
        full_name = (
            validated_data.get('full_name') or 
            validated_data.get('fullName') or 
            phone
        ).strip()
        role = validated_data.get('role', 'cashier')
        role_title = (
            validated_data.get('roleTitleFa') or 
            validated_data.get('role_title') or 
            ROLE_TITLE_MAP.get(role, 'صندوق‌دار فروشگاه')
        ).strip()
        permissions_list = validated_data.get('permissions', [])

        username_field = getattr(User, 'USERNAME_FIELD', 'phone')

        with transaction.atomic():
            filter_kwargs = {username_field: phone}
            user = User.objects.filter(**filter_kwargs).first()
            if not user:
                user = User.objects.create_user(**filter_kwargs, password=password)
            else:
                user.set_password(password)

            if hasattr(user, 'full_name'):
                user.full_name = full_name
            if hasattr(user, 'first_name'):
                user.first_name = full_name

            user.is_staff = True
            if role == 'super_admin':
                user.is_superuser = True
            user.save()

            perms_dict = {
                f'perm_{name}': (name in permissions_list) for name in PERMISSION_FIELDS
            }

            pos_staff, created = PosStaff.objects.update_or_create(
                user=user,
                defaults={
                    'role': role,
                    'role_title': role_title,
                    'is_active': True,
                    **perms_dict
                }
            )
            pos_staff.set_password(password)
            pos_staff.save()
            return pos_staff


class PosStaffUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    fullName = serializers.CharField(max_length=100, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    password = serializers.CharField(max_length=50, required=False, allow_blank=True)
    role = serializers.CharField(max_length=30, required=False, allow_blank=True)
    roleTitleFa = serializers.CharField(max_length=100, required=False, allow_blank=True)
    role_title = serializers.CharField(max_length=100, required=False, allow_blank=True)
    permissions = serializers.ListField(child=serializers.CharField(max_length=50), required=False)


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(max_length=50)
