"""
visitor_tickets/serializers.py
سریالایزرهای API تیکتینگ ویزیتوران DRF
"""
from rest_framework import serializers
from .models import VisitorTicket, VisitorTicketReply


class VisitorTicketReplySerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model = VisitorTicketReply
        fields = ['id', 'ticket', 'sender', 'sender_name', 'is_accountant_reply', 'message', 'payment_receipt', 'created_at']
        read_only_fields = ['id', 'sender', 'is_accountant_reply', 'created_at']


class VisitorTicketSerializer(serializers.ModelSerializer):
    replies = VisitorTicketReplySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    visitor_code = serializers.CharField(source='visitor.visitor_code', read_only=True)

    class Meta:
        model = VisitorTicket
        fields = [
            'id', 'ticket_code', 'visitor', 'visitor_code', 'category', 'category_display',
            'subject', 'target_shop', 'claimed_amount', 'bank_sheba', 'status', 'status_display',
            'priority', 'document', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ticket_code', 'visitor', 'created_at', 'updated_at']
