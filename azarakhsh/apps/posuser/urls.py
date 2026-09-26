from django.urls import path
from .views import (
    LoginStaffAPIView, 
    LogoutStaffAPIView, 
    ActiveStaffSessionsAPIView,
    CreateStaffAPIView,
    ListStaffAPIView,
    StaffDetailAPIView,
    ToggleLockStaffAPIView,
)

app_name = 'posuser'

urlpatterns = [
    # ۱. ورود پرسنل صندوق و انبار
    path('login/', LoginStaffAPIView.as_view(), name='login-staff'),
    
    # ۲. خروج پرسنل
    path('logout/', LogoutStaffAPIView.as_view(), name='logout-staff'),
    
    # ۳. لیست جلسات آنلاین
    path('active-sessions/', ActiveStaffSessionsAPIView.as_view(), name='active-sessions'),
    
    # ۴. ایجاد پرسنل جدید
    path('create-staff/', CreateStaffAPIView.as_view(), name='create-staff'),
    path('staff/create/', CreateStaffAPIView.as_view(), name='staff-create-alias'),
    
    # ۵. دریافت لیست پرسنل
    path('staff-list/', ListStaffAPIView.as_view(), name='list-staff'),
    path('staff/list/', ListStaffAPIView.as_view(), name='staff-list-alias'),
    
    # ۶. جزئیات، ویرایش و حذف پرسنل
    path('staff/<int:pk>/', StaffDetailAPIView.as_view(), name='staff-detail'),
    
    # ۷. قفل / فعال‌سازی حساب پرسنل
    path('staff/<int:pk>/toggle-lock/', ToggleLockStaffAPIView.as_view(), name='toggle-lock-staff'),
]
