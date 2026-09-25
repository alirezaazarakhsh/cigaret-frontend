"""
tickets/serializers.py
سریالایزرهای DRF برای سیستم تیکتینگ و پیام‌ها
"""
from rest_framework import serializers
from .models import SupportTicket, TicketMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_name', 'is_staff_reply', 'message', 'attachment', 'created_at']
        read_only_fields = ['id', 'sender', 'is_staff_reply', 'created_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id',
            'ticket_number',
            'user',
            'title',
            'department',
            'department_display',
            'priority',
            'status',
            'status_display',
            'order_tracking_code',
            'messages',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'ticket_number', 'user', 'created_at', 'updated_at']
