"""
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
