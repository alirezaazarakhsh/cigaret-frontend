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
    pattern_name = serializers.CharField(source='pattern.get_name_fa_display', read_only=True)

    class Meta:
        model = SmsLog
        fields = '__all__'
