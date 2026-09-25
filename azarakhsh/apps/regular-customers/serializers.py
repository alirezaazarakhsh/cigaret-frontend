from rest_framework import serializers
from .models import CustomerTier, CustomerProfile, BankDepositSlip, WalletTransaction

# ------------------------------------------------------------------------------
# Serializer for Customer Tier / Card Config
# ------------------------------------------------------------------------------
class CustomerTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerTier
        fields = [
            'id', 'tier_key', 'title_fa', 'badge_label',
            'card_bg_gradient', 'card_border_color', 'card_text_color',
            'card_icon', 'default_credit_limit', 'cashback_percent',
            'discount_percent', 'perks_description', 'is_active'
        ]

# ------------------------------------------------------------------------------
# Serializer for Customer Profile (Used in Normal Web + App View)
# ------------------------------------------------------------------------------
class CustomerProfileSerializer(serializers.ModelSerializer):
    tier_details = CustomerTierSerializer(source='tier', read_only=True)
    remaining_credit = serializers.ReadOnlyField()
    can_purchase_on_credit = serializers.ReadOnlyField()

    class Meta:
        model = CustomerProfile
        fields = [
            'id', 'full_name', 'phone_number', 'national_code',
            'city', 'address', 'tier', 'tier_details',
            'credit_limit', 'remaining_credit', 'can_purchase_on_credit',
            'wallet_balance', 'ledger_balance',
            'app_client_id', 'barcode_id', 'created_at'
        ]
        read_only_fields = ['credit_limit', 'wallet_balance', 'ledger_balance', 'tier']

# ------------------------------------------------------------------------------
# Serializer for Bank Deposit Slip Registration
# ------------------------------------------------------------------------------
class BankDepositSlipSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)

    class Meta:
        model = BankDepositSlip
        fields = [
            'id', 'customer', 'amount', 'tracking_number',
            'bank_name', 'destination_card_number',
            'sender_card_last4', 'sender_account_name',
            'slip_image', 'purpose', 'purpose_display',
            'order_id', 'deposit_date',
            'status', 'status_display', 'review_notes',
            'created_at', 'reviewed_at'
        ]
        read_only_fields = ['status', 'reviewed_by', 'review_notes', 'reviewed_at', 'created_at']

    def validate_amount(self, value):
        if value < 1000:
            raise serializers.ValidationError("حداقل مبلغ واریزی مجاز ۱,۰۰۰ تومان می‌باشد.")
        return value

    def validate_tracking_number(self, value):
        clean_val = value.strip()
        if not clean_val:
            raise serializers.ValidationError("شماره پیگیری / ارجاع واریز الزامی است.")
        return clean_val

# ------------------------------------------------------------------------------
# Serializer for Wallet Transactions
# ------------------------------------------------------------------------------
class WalletTransactionSerializer(serializers.ModelSerializer):
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)

    class Meta:
        model = WalletTransaction
        fields = [
            'id', 'customer', 'amount', 'balance_after',
            'transaction_type', 'transaction_type_display',
            'reference_order_id', 'description', 'created_at'
        ]
