"""
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
