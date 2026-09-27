"""
kavenegar_sms/serializers.py
"""
from rest_framework import serializers
from .models import KavenegarSMSSetting, SMSPattern, SmsLog


class SMSPatternSerializer(serializers.ModelSerializer):
    name_fa_display = serializers.CharField(source='get_name_fa_display', read_only=True)

    class Meta:
        model = SMSPattern
        fields = '__all__'


class KavenegarSMSSettingSerializer(serializers.ModelSerializer):
    patterns = SMSPatternSerializer(many=True, read_only=True)

    class Meta:
        model = KavenegarSMSSetting
        fields = '__all__'


class SmsLogSerializer(serializers.ModelSerializer):
    pattern_name = serializers.SerializerMethodField()
    pattern_key = serializers.SerializerMethodField()
    pattern_code = serializers.SerializerMethodField()

    class Meta:
        model = SmsLog
        fields = '__all__'

    def get_pattern_name(self, obj):
        if obj.pattern:
            return obj.pattern.get_name_fa_display() or obj.pattern.name_fa
        tokens = obj.tokens_sent or {}
        return tokens.get('action_type') or tokens.get('template') or 'پیامک عمومی / OTP'

    def get_pattern_key(self, obj):
        if obj.pattern:
            return obj.pattern.name_fa
        return ''

    def get_pattern_code(self, obj):
        if obj.pattern:
            return obj.pattern.pattern_code
        tokens = obj.tokens_sent or {}
        return tokens.get('template') or ''
