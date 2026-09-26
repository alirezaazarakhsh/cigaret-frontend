"""
kavenegar_sms/urls.py
"""
from django.urls import path
from .views import (
    KavenegarSMSSettingAPIView,
    SMSPatternListSaveAPIView,
    SMSLogsAPIView,
    SendPatternSMSAPIView,
    SendOtpAPIView
)

app_name = 'kavenegar_sms'

urlpatterns = [
    # تنظیمات وب‌سرویس و کلید درگاه
    path('settings/', KavenegarSMSSettingAPIView.as_view(), name='sms-settings'),
    
    # مدیریت و ذخیره پترن‌های انگلیسی
    path('patterns/', SMSPatternListSaveAPIView.as_view(), name='sms-patterns-list'),
    path('patterns/save/', SMSPatternListSaveAPIView.as_view(), name='sms-pattern-save'),
    
    # لاگ‌های دیتابیس پیامک
    path('logs/', SMSLogsAPIView.as_view(), name='sms-logs'),
    
    # ارسال پیامک با پترن
    path('send-pattern/', SendPatternSMSAPIView.as_view(), name='sms-send-pattern'),
    
    # ارسال OTP
    path('send-otp/', SendOtpAPIView.as_view(), name='sms-send-otp'),
]
