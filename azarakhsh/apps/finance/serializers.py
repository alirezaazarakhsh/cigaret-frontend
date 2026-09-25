"""
finance/serializers.py
"""
from rest_framework import serializers
from .models import CustomerLedger, LedgerTransaction, ChequeRecord


class CustomerLedgerSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)

    class Meta:
        model = CustomerLedger
        fields = '__all__'


class LedgerTransactionSerializer(serializers.ModelSerializer):
    transaction_label = serializers.CharField(source='get_transaction_type_display', read_only=True)
    recorder_name = serializers.CharField(source='recorded_by.full_name', read_only=True)

    class Meta:
        model = LedgerTransaction
        fields = '__all__'


class ChequeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChequeRecord
        fields = '__all__'
