import re

with open("DJANGO_POSUSER_APP.md", "r", encoding="utf-8") as f:
    content = f.read()

new_views = """### ۵. فایل `posuser/views.py`
اندپوینت‌های REST API برای ورود، خروج و ایجاد پرسنل صندوق و انبار:

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

        # پیدا کردن کاربر بر اساس فیلدهای مختلف شماره همراه
        username_field = getattr(User, 'USERNAME_FIELD', 'username')
        user = None
        for f_name in [username_field, 'phone', 'mobile', 'phone_number', 'username']:
            if hasattr(User, f_name):
                user = User.objects.filter(**{f_name: phone}).first()
                if user:
                    break

        if not user or not user.check_password(password):
            return Response({"success": False, "message": "شماره همراه یا پین‌کد اشتباه است."}, status=status.HTTP_401_UNAUTHORIZED)

        # دریافت پروفایل پرسنل
        pos_staff = PosStaff.objects.filter(user=user, is_active=True).first()
        
        # اگر سوپراادمین بود و پروفایل نداشت، ایجاد خودکار
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
            return Response({"success": False, "message": "شما دسترسی به صندوق فروشگاهی را ندارید."}, status=status.HTTP_403_FORBIDDEN)

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

        PosStaff.objects.create(
            user=user,
            role=role,
            role_title=role_title,
            **perms_map
        )

        return Response({"success": True, "message": "پرسنل صندوق با موفقیت در دیتابیس ثبت شد."}, status=status.HTTP_201_CREATED)
```"""

pattern = re.compile(r"### ۵\. فایل `posuser/views\.py`.*?(?=### ۶\. فایل `posuser/urls\.py`)", re.DOTALL)
content = pattern.sub(new_views + "\n\n", content)

with open("DJANGO_POSUSER_APP.md", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated views.py in DJANGO_POSUSER_APP.md")
