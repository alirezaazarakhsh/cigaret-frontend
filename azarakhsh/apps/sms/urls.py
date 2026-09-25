"""
kavenegar_sms/urls.py
"""
from django.urls import path
from .views import SendOtpAPIView, POSLoginAPIView, SendPatternSMSAPIView, SmsLogListAPIView

app_name = 'kavenegar_sms'

urlpatterns = [
    path('send-otp/', SendOtpAPIView.as_view(), name='sms-send-otp'),
    path('pos/login/', POSLoginAPIView.as_view(), name='pos-login'),
    path('send-pattern/', SendPatternSMSAPIView.as_view(), name='sms-send-pattern'),
    path('logs/', SmsLogListAPIView.as_view(), name='sms-logs-list'),
]
