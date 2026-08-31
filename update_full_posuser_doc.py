import re

new_views = """### ۵. فایل `posuser/views.py`
اندپوینت‌های کامل REST API برای ورود، خروج، لیست، ایجاد، ویرایش، حذف و قفل/فعال‌سازی پرسنل صندوق و انبار:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from .models import PosStaff
from .serializers import LoginSerializer, PosStaffCreateSerializer

User = get_user_model()

class LoginStaffAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ورود پرسنل صندوق با شماره همراه و پین‌کد",
        request_body=LoginSerializer
    )
    def post(self, request):
        phone = request.data.get('phone')
        password = request.data.get('password')

        if not phone or not password:
            return Response({"success": False, "message": "شماره همراه و رمز عبور الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        username_field = getattr(User, 'USERNAME_FIELD', 'username')
        user = None
        for f_name in [username_field, 'phone', 'mobile', 'phone_number', 'username']:
            if hasattr(User, f_name):
                user = User.objects.filter(**{f_name: phone}).first()
                if user:
                    break

        if not user or not user.check_password(password):
            return Response({"success": False, "message": "شماره همراه یا پین‌کد اشتباه است."}, status=status.HTTP_401_UNAUTHORIZED)

        pos_staff = PosStaff.objects.filter(user=user, is_active=True).first()
        
        if not pos_staff and (user.is_superuser or user.is_staff):
            pos_staff = PosStaff.objects.create(
                user=user,
                role='super_admin',
                role_title='مدیر ارشد سامانه',
                perm_manage_pos=True,
                perm_manage_inventory=True,
                perm_quick_add_product=True,
                perm_manage_ledger=True,
                perm_view_reports=True,
                perm_monthly_comparison=True,
                perm_customer_app_connect=True,
                perm_manage_staff=True,
                perm_send_sms=True,
                perm_manage_tickets=True,
                perm_manage_notifications=True,
                perm_delete_receipts=True
            )

        if not pos_staff:
            return Response({"success": False, "message": "شما دسترسی به صندوق فروشگاهی را ندارید یا حساب شما قفل است."}, status=status.HTTP_403_FORBIDDEN)

        user_phone = (
            getattr(user, 'phone', None) or 
            getattr(user, 'mobile', None) or 
            getattr(user, 'phone_number', None) or 
            getattr(user, 'username', None) or 
            str(user)
        )

        permissions = []
        if pos_staff.perm_manage_pos: permissions.append('manage_pos')
        if pos_staff.perm_manage_inventory: permissions.append('manage_inventory')
        if pos_staff.perm_quick_add_product: permissions.append('quick_add_product')
        if pos_staff.perm_manage_ledger: permissions.append('manage_ledger')
        if pos_staff.perm_view_reports: permissions.append('view_reports')
        if pos_staff.perm_monthly_comparison: permissions.append('monthly_comparison')
        if pos_staff.perm_customer_app_connect: permissions.append('customer_app_connect')
        if pos_staff.perm_manage_staff: permissions.append('manage_staff')
        if pos_staff.perm_send_sms: permissions.append('send_sms')
        if pos_staff.perm_manage_tickets: permissions.append('manage_tickets')
        if pos_staff.perm_manage_notifications: permissions.append('manage_notifications')
        if pos_staff.perm_delete_receipts: permissions.append('delete_receipts')

        response_data = {
            "success": True,
            "message": "ورود موفقیت‌آمیز بود.",
            "data": {
                "user": {
                    "id": user.id,
                    "phone": user_phone,
                    "fullName": getattr(user, 'first_name', None) or getattr(user, 'full_name', None) or user_phone,
                    "role": pos_staff.role,
                    "roleTitleFa": pos_staff.role_title,
                    "permissions": permissions,
                    "status": "active" if pos_staff.is_active else "suspended"
                }
            }
        }
        return Response(response_data, status=status.HTTP_200_OK)


class LogoutStaffAPIView(APIView):
    def post(self, request):
        return Response({"success": True, "message": "خروج موفقیت‌آمیز بود."}, status=status.HTTP_200_OK)


class CreateStaffAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ایجاد پرسنل صندوق جدید",
        request_body=PosStaffCreateSerializer
    )
    def post(self, request):
        phone = request.data.get('phone')
        full_name = request.data.get('full_name')
        password = request.data.get('password') # پین‌کد
        role = request.data.get('role', 'cashier')
        role_title = request.data.get('roleTitleFa', 'صندوق‌دار')
        permissions = request.data.get('permissions', [])

        if not phone or not password:
            return Response({"success": False, "message": "شماره همراه و پین‌کد الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        username_field = getattr(User, 'USERNAME_FIELD', 'username')

        existing_user = None
        for f_name in [username_field, 'phone', 'mobile', 'phone_number', 'username']:
            if hasattr(User, f_name):
                existing_user = User.objects.filter(**{f_name: phone}).first()
                if existing_user:
                    break

        if existing_user:
            return Response({"success": False, "message": "این شماره همراه قبلاً در سیستم ثبت شده است."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(**{username_field: phone}, password=password)
        except Exception:
            try:
                user = User.objects.create_user(username=phone, password=password)
            except Exception:
                user_kwargs = {}
                for f_name in [username_field, 'phone', 'mobile', 'phone_number', 'username']:
                    if hasattr(User, f_name):
                        user_kwargs[f_name] = phone
                user = User(**user_kwargs)
                user.set_password(password)
                user.save()

        if hasattr(user, 'first_name'):
            user.first_name = full_name
        if hasattr(user, 'full_name'):
            user.full_name = full_name
        if hasattr(user, 'phone') and not getattr(user, 'phone', None):
            user.phone = phone
            
        if role == 'super_admin':
            user.is_staff = True
            user.is_superuser = True
        else:
            user.is_staff = True 
        user.save()

        perms_map = {
            'perm_manage_pos': 'manage_pos' in permissions,
            'perm_manage_inventory': 'manage_inventory' in permissions,
            'perm_quick_add_product': 'quick_add_product' in permissions,
            'perm_manage_ledger': 'manage_ledger' in permissions,
            'perm_view_reports': 'view_reports' in permissions,
            'perm_monthly_comparison': 'monthly_comparison' in permissions,
            'perm_customer_app_connect': 'customer_app_connect' in permissions,
            'perm_manage_staff': 'manage_staff' in permissions,
            'perm_send_sms': 'send_sms' in permissions,
            'perm_manage_tickets': 'manage_tickets' in permissions,
            'perm_manage_notifications': 'manage_notifications' in permissions,
            'perm_delete_receipts': 'delete_receipts' in permissions,
        }

        staff = PosStaff.objects.create(
            user=user,
            role=role,
            role_title=role_title,
            is_active=True,
            **perms_map
        )

        return Response({"success": True, "id": staff.id, "message": "پرسنل صندوق با موفقیت در دیتابیس ثبت شد."}, status=status.HTTP_201_CREATED)


class ListStaffAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        staff_qs = PosStaff.objects.select_related('user').all()
        data = []
        for staff in staff_qs:
            user = staff.user
            user_phone = getattr(user, 'phone', None) or getattr(user, 'mobile', None) or getattr(user, 'username', '')
            full_name = getattr(user, 'first_name', None) or getattr(user, 'full_name', None) or user_phone
            
            perms = []
            if staff.perm_manage_pos: perms.append('manage_pos')
            if staff.perm_manage_inventory: perms.append('manage_inventory')
            if staff.perm_quick_add_product: perms.append('quick_add_product')
            if staff.perm_manage_ledger: perms.append('manage_ledger')
            if staff.perm_view_reports: perms.append('view_reports')
            if staff.perm_monthly_comparison: perms.append('monthly_comparison')
            if staff.perm_customer_app_connect: perms.append('customer_app_connect')
            if staff.perm_manage_staff: perms.append('manage_staff')
            if staff.perm_send_sms: perms.append('send_sms')
            if staff.perm_manage_tickets: perms.append('manage_tickets')
            if staff.perm_manage_notifications: perms.append('manage_notifications')
            if staff.perm_delete_receipts: perms.append('delete_receipts')

            data.append({
                "id": staff.id,
                "user_id": user.id if user else None,
                "phone": user_phone,
                "fullName": full_name,
                "role": staff.role,
                "roleTitleFa": staff.role_title,
                "is_active": staff.is_active,
                "status": "active" if staff.is_active else "suspended",
                "permissions": perms,
                "created_at": staff.created_at.strftime('%Y/%m/%d') if hasattr(staff, 'created_at') and staff.created_at else ''
            })

        return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


class StaffDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, pk):
        try:
            staff = PosStaff.objects.get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        full_name = request.data.get('full_name')
        phone = request.data.get('phone')
        password = request.data.get('password')
        role = request.data.get('role')
        role_title = request.data.get('roleTitleFa')
        permissions = request.data.get('permissions', [])

        user = staff.user
        if user:
            if full_name:
                if hasattr(user, 'first_name'): user.first_name = full_name
                if hasattr(user, 'full_name'): user.full_name = full_name
            if phone:
                if hasattr(user, 'phone'): user.phone = phone
                if hasattr(user, 'mobile'): user.mobile = phone
            if password:
                user.set_password(password)
                staff.password = password
            user.save()

        if role: staff.role = role
        if role_title: staff.role_title = role_title

        staff.perm_manage_pos = 'manage_pos' in permissions
        staff.perm_manage_inventory = 'manage_inventory' in permissions
        staff.perm_quick_add_product = 'quick_add_product' in permissions
        staff.perm_manage_ledger = 'manage_ledger' in permissions
        staff.perm_view_reports = 'view_reports' in permissions
        staff.perm_monthly_comparison = 'monthly_comparison' in permissions
        staff.perm_customer_app_connect = 'customer_app_connect' in permissions
        staff.perm_manage_staff = 'manage_staff' in permissions
        staff.perm_send_sms = 'send_sms' in permissions
        staff.perm_manage_tickets = 'manage_tickets' in permissions
        staff.perm_manage_notifications = 'manage_notifications' in permissions
        staff.perm_delete_receipts = 'delete_receipts' in permissions
        staff.save()

        return Response({"success": True, "message": "اطلاعات پرسنل با موفقیت به روز شد."}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            staff = PosStaff.objects.get(pk=pk)
            user = staff.user
            staff.delete()
            if user:
                user.delete()
            return Response({"success": True, "message": "پرسنل با موفقیت حذف شد."}, status=status.HTTP_200_OK)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)


class ToggleLockStaffAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            staff = PosStaff.objects.get(pk=pk)
            staff.is_active = not staff.is_active
            staff.save()
            
            if staff.user and hasattr(staff.user, 'is_active'):
                staff.user.is_active = staff.is_active
                staff.user.save()

            status_str = "active" if staff.is_active else "suspended"
            msg = "کاربر با موفقیت فعال شد." if staff.is_active else "کاربر با موفقیت قفل / تعلیق شد."
            return Response({
                "success": True,
                "is_active": staff.is_active,
                "status": status_str,
                "message": msg
            }, status=status.HTTP_200_OK)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)
```"""

new_urls = """### ۶. فایل `posuser/urls.py`
آدرس‌دهی تمام اندپوینت‌های مدیریت پرسنل (ایجاد، دریافت لیست، ویرایش، حذف و قفل/فعال‌سازی):

```python
from django.urls import path
from .views import (
    LoginStaffAPIView, 
    LogoutStaffAPIView, 
    CreateStaffAPIView,
    ListStaffAPIView,
    StaffDetailAPIView,
    ToggleLockStaffAPIView
)

app_name = 'posuser'

urlpatterns = [
    # ۱. ورود و خروج پرسنل
    path('login/', LoginStaffAPIView.as_view(), name='login-staff'),
    path('logout/', LogoutStaffAPIView.as_view(), name='logout-staff'),
    
    # ۲. ایجاد و دریافت لیست پرسنل
    path('create-staff/', CreateStaffAPIView.as_view(), name='create-staff'),
    path('staff-list/', ListStaffAPIView.as_view(), name='staff-list'),

    # ۳. ویرایش و حذف پرسنل با شناسه (PK)
    path('staff/<int:pk>/', StaffDetailAPIView.as_view(), name='staff-detail'),

    # ۴. قفل و فعال‌سازی پرسنل در دیتابیس
    path('staff/<int:pk>/toggle-lock/', ToggleLockStaffAPIView.as_view(), name='staff-toggle-lock'),
]
```"""

with open("DJANGO_POSUSER_APP.md", "r", encoding="utf-8") as f:
    content = f.read()

pattern_views = re.compile(r"### ۵\. فایل `posuser/views\.py`.*?(?=### ۶\. فایل `posuser/urls\.py`)", re.DOTALL)
content = pattern_views.sub(new_views + "\n\n", content)

pattern_urls = re.compile(r"### ۶\. فایل `posuser/urls\.py`.*", re.DOTALL)
content = pattern_urls.sub(new_urls + "\n", content)

with open("DJANGO_POSUSER_APP.md", "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated DJANGO_POSUSER_APP.md views and urls")
