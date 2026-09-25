"""
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
