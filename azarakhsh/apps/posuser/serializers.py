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


class PosStaffOutSerializer(serializers.ModelSerializer):
    """خروجی کامل و جدید یک پرسنل شامل تمامی دسترسی‌ها، تاریخ ثبت و وضعیت فعالیت"""
    fullName = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    roleTitleFa = serializers.CharField(source='role_title', read_only=True)
    permissions = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%Y/%m/%d', read_only=True)

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
        perms = []
        for name in PERMISSION_FIELDS:
            if getattr(obj, f'perm_{name}', False):
                perms.append(name)
        return perms

    def get_status(self, obj):
        return 'active' if obj.is_active else 'suspended'


class PosStaffCreateSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    full_name = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=50)
    role = serializers.CharField(max_length=30, default='cashier')
    roleTitleFa = serializers.CharField(max_length=100, default='صندوق‌دار', required=False)
    permissions = serializers.ListField(child=serializers.CharField(max_length=50), required=False, default=list)

    def create(self, validated_data):
        raw_phone = validated_data['phone'].strip()
        phone = raw_phone.replace(' ', '').replace('-', '')
        if phone.startswith('+98'):
            phone = '0' + phone[3:]
        elif phone.startswith('98'):
            phone = '0' + phone[2:]

        password = validated_data['password'].strip()
        full_name = validated_data['full_name'].strip()
        role = validated_data.get('role', 'cashier')
        role_title = validated_data.get('roleTitleFa') or 'صندوق‌دار'
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
    full_name = serializers.CharField(max_length=100, required=False)
    phone = serializers.CharField(max_length=15, required=False)
    password = serializers.CharField(max_length=50, required=False)
    role = serializers.CharField(max_length=30, required=False)
    roleTitleFa = serializers.CharField(max_length=100, required=False)
    permissions = serializers.ListField(child=serializers.CharField(max_length=50), required=False)


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(max_length=50)
