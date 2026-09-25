"""
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
