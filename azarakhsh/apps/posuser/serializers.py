from rest_framework import serializers
from .models import PosStaff

class PosStaffCreateSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    full_name = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=50)
    role = serializers.CharField(max_length=30, default='cashier')
    roleTitleFa = serializers.CharField(max_length=100, default='صندوق‌دار')
    permissions = serializers.ListField(child=serializers.CharField(max_length=50), required=False)

class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(max_length=50)
