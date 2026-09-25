"""
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
