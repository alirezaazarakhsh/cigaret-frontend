"""
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
