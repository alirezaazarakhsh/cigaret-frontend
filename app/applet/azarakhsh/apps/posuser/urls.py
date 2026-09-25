from django.urls import path
from .views import (
    LoginStaffAPIView,
    LogoutStaffAPIView,
    CurrentStaffProfileAPIView,
    ActiveStaffSessionsAPIView,
    CreateStaffAPIView,
    ListStaffAPIView,
    StaffDetailAPIView,
    ToggleLockStaffAPIView,
    ResetStaffPasswordAPIView,
)

app_name = 'posuser'

urlpatterns = [
    # ۱. ورود پرسنل صندوق و انبار
    path('login/', LoginStaffAPIView.as_view(), name='login-staff'),
    # ۲. خروج پرسنل
    path('logout/', LogoutStaffAPIView.as_view(), name='logout-staff'),
    # ۳. دریافت پروفایل کاربر جاری آنلاین
    path('profile/', CurrentStaffProfileAPIView.as_view(), name='current-profile'),
    # ۴. لیست جلسات آنلاین صندوق‌داران
    path('active-sessions/', ActiveStaffSessionsAPIView.as_view(), name='active-sessions'),
    # ۵. ایجاد پرسنل جدید
    path('create-staff/', CreateStaffAPIView.as_view(), name='create-staff'),
    # ۶. دریافت لیست کامل پرسنل
    path('staff-list/', ListStaffAPIView.as_view(), name='list-staff'),
    # ۷. مشاهده جزئیات، ویرایش و حذف پرسنل
    path('staff/<int:pk>/', StaffDetailAPIView.as_view(), name='staff-detail'),
    # ۸. قفل / فعال‌سازی حساب پرسنل
    path('staff/<int:pk>/toggle-lock/', ToggleLockStaffAPIView.as_view(), name='toggle-lock-staff'),
    # ۹. تغییر / بازنشانی پین‌کد پرسنل
    path('staff/<int:pk>/reset-password/', ResetStaffPasswordAPIView.as_view(), name='reset-password-staff'),
]
