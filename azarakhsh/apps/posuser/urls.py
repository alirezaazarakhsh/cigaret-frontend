from django.urls import path
from .views import (
    LoginStaffAPIView, 
    LogoutStaffAPIView, 
    CreateStaffAPIView
)

app_name = 'posuser'

urlpatterns = [
    # ۱. ورود پرسنل صندوق و انبار
    path('login/', LoginStaffAPIView.as_view(), name='login-staff'),
    
    # ۲. خروج پرسنل
    path('logout/', LogoutStaffAPIView.as_view(), name='logout-staff'),
    
    # ۳. ثبت‌نام و ایجاد پرسنل جدید
    path('create-staff/', CreateStaffAPIView.as_view(), name='create-staff'),
]
