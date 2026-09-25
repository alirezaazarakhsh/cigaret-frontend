"""
orders/serializers.py
سریالایزرهای ثبت سفارش، محاسبه خودکار پیش‌فاکتور و آپلود فیش بانکی
"""
from rest_framework import serializers
from .models import Order, OrderItem, PaymentReceipt
from catalog.models import CigaretteProduct


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.CharField()
    unit = serializers.ChoiceField(choices=['carton', 'box'])
    quantity = serializers.IntegerField(min_value=1)


class OrderCheckoutSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=150)
    customer_phone = serializers.CharField(max_length=15)
    business_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    province = serializers.CharField(max_length=60)
    city = serializers.CharField(max_length=60)
    destination_address = serializers.CharField()
    shipping_method = serializers.CharField(max_length=50)
    shipping_cost = serializers.IntegerField(default=0)
    items = OrderItemInputSerializer(many=True)


class OrderDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


class PaymentReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentReceipt
        fields = ['id', 'order', 'bank_name', 'tracking_number', 'card_last_digits', 'amount', 'receipt_image', 'created_at']
