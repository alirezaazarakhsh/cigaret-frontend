"""
accounts/serializers.py
سریالایزرهای DRF برای اعتبارسنجی لاگین پیامکی، دریافت پروفایل و توکن JWT با قابلیت انقضای پویا
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import timedelta
from .models import User, PhoneOTP


class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)

    def validate_phone(self, value):
        phone = User.objects.normalize_phone(value)
        if not phone.startswith('09') or len(phone) != 11:
            raise serializers.ValidationError("فرمت شماره موبایل باید مانند 09120759419 باشد.")
        return phone


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp_code = serializers.CharField(max_length=6)
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    business_name = serializers.CharField(max_length=200, required=False, allow_blank=True)

    def validate_phone(self, value):
        return User.objects.normalize_phone(value)


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'phone',
            'full_name',
            'business_name',
            'role',
            'role_display',
            'is_visitor',
            'visitor_code',
            'commission_rate',
            'total_sales_amount',
            'total_commission_earned',
            'national_id',
            'business_license',
            'is_verified',
            'province',
            'city',
            'address',
            'postal_code',
            'date_joined',
        ]
        read_only_fields = ['id', 'phone', 'role', 'is_verified', 'date_joined']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # افزودن اطلاعات ضروری به توکن JWT جهت استفاده در فرانت‌اند
        token['phone'] = user.phone
        token['role'] = getattr(user, 'role', 'customer')
        token['is_visitor'] = getattr(user, 'is_visitor', False)
        return token

    def validate(self, attrs):
        request = self.context.get('request')
        session_duration = None
        if request and request.data:
            session_duration = request.data.get('session_duration')

        # تولید توکن بر اساس کاربر فعلی
        refresh = self.get_token(self.user)

        # تغییر انقضا به صورت پویا در صورت درخواست صندوقدار
        if session_duration:
            try:
                minutes = int(session_duration)
                if 15 <= minutes <= 1440:  # محدودیت منطقی بین ۱۵ دقیقه تا ۲۴ ساعت
                    refresh.access_token.set_exp(lifetime=timedelta(minutes=minutes))
            except (ValueError, TypeError):
                pass

        # آماده‌سازی پاسخ نهایی
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        data['phone'] = self.user.phone
        data['role'] = getattr(self.user, 'role', 'customer')
        
        if session_duration:
            data['session_duration_minutes'] = int(session_duration)

        return data
