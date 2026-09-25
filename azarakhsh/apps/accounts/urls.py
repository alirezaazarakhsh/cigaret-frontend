"""
accounts/urls.py
مسیرهای URL اپلیکیشن احراز هویت و حساب کاربری
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import SendOTPView, VerifyOTPView, POSLoginAPIView, UserProfileViewSet

urlpatterns = [
    # ورود پیامکی بنکداران و مشتریان
    path('send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    
    # ورود اختصاصی صندوق POS و مدیران با شماره و رمز عبور
    path('pos-login/', POSLoginAPIView.as_view(), name='pos_login'),
    path('pos/login/', POSLoginAPIView.as_view(), name='pos_login_alt'),

    # تازه‌سازی توکن و پروفایل
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}), name='user_profile'),
]
