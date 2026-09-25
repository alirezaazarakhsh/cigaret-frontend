from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from .models import PosStaff
from .serializers import PosStaffCreateSerializer, LoginSerializer

User = get_user_model()

# Helper for setting tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class LoginStaffAPIView(APIView):
    """
    اندپوینت ورود پرسنل صندوق و انبار
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ورود پرسنل صندوق",
        request_body=LoginSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        phone = request.data.get('phone')
        password = request.data.get('password')

        if not phone or not password:
            return Response({"success": False, "message": "شماره همراه و پینکد الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=phone, password=password)
        if user is not None:
            if not user.is_active:
                return Response({"success": False, "message": "حساب کاربری شما تعلیق شده است."}, status=status.HTTP_403_FORBIDDEN)
            
            tokens = get_tokens_for_user(user)
            
            # Check if user has a PosStaff profile
            try:
                pos_staff = user.pos_profile
                role = pos_staff.role
                role_title = pos_staff.role_title
                permissions = []
                # Extract active permissions
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
                if pos_staff.perm_manage_warehouse_messages: permissions.append('manage_warehouse_messages')
                if pos_staff.perm_manage_site_settings: permissions.append('manage_site_settings')
                if pos_staff.perm_manage_sliders: permissions.append('manage_sliders')
                if pos_staff.perm_manage_footer_settings: permissions.append('manage_footer_settings')
                if pos_staff.perm_delete_receipts: permissions.append('delete_receipts')
            except PosStaff.DoesNotExist:
                if user.is_superuser:
                    role = 'super_admin'
                    role_title = 'مدیر ارشد سیستم'
                    permissions = [
                        'manage_pos', 'manage_inventory', 'quick_add_product', 'manage_ledger',
                        'view_reports', 'monthly_comparison', 'customer_app_connect',
                        'manage_staff', 'send_sms', 'manage_tickets', 'manage_notifications',
                        'manage_warehouse_messages', 'manage_site_settings', 'manage_sliders',
                        'manage_footer_settings', 'delete_receipts'
                    ]
                else:
                    return Response({"success": False, "message": "شما دسترسی به صندوق فروشگاهی را ندارید."}, status=status.HTTP_403_FORBIDDEN)

            user_phone = (
                getattr(user, 'phone', None) or 
                getattr(user, 'mobile', None) or 
                getattr(user, 'phone_number', None) or 
                getattr(user, 'username', None) or 
                str(user)
            )

            response_data = {
                "success": True,
                "message": "ورود موفقیت‌آمیز بود.",
                "data": {
                    "user": {
                        "id": user.id,
                        "phone": user_phone,
                        "fullName": getattr(user, 'first_name', None) or getattr(user, 'full_name', None) or user_phone,
                        "role": role,
                        "roleTitleFa": role_title,
                        "permissions": permissions,
                        "status": "active"
                    },
                    "tokens": tokens 
                }
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response({"success": False, "message": "شماره همراه یا رمز عبور اشتباه است."}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutStaffAPIView(APIView):
    """
    اندپوینت خروج پرسنل صندوق
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="خروج پرسنل صندوق",
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        return Response({"success": True, "message": "خروج موفقیت‌آمیز بود."}, status=status.HTTP_200_OK)


class ActiveStaffSessionsAPIView(APIView):
    """
    اندپوینت دریافت لیست پرسنل و صندوقدارهای آنلاین و فعال
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="لیست صندوقدارهای آنلاین",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request):
        active_staff = PosStaff.objects.filter(is_active=True).select_related('user')
        online_sessions = []
        for staff in active_staff:
            user = staff.user
            user_phone = getattr(user, 'phone', None) or getattr(user, 'username', None) or str(user)
            online_sessions.append({
                "id": user.id,
                "fullName": getattr(user, 'first_name', None) or getattr(user, 'full_name', None) or user_phone,
                "phone": user_phone,
                "role": staff.role,
                "roleTitleFa": staff.role_title,
                "status": "online"
            })
        return Response({
            "success": True,
            "data": online_sessions
        }, status=status.HTTP_200_OK)

class CreateStaffAPIView(APIView):
    """
    اندپوینت ایجاد پرسنل جدید توسط مدیریت
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ایجاد پرسنل صندوق جدید",
        request_body=PosStaffCreateSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        serializer = PosStaffCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "message": "پرسنل صندوق با موفقیت ثبت شد."}, status=status.HTTP_201_CREATED)
        return Response({"success": False, "message": "خطا در ثبت پرسنل", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ListStaffAPIView(APIView):
    """
    دریافت لیست پرسنل
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست پرسنل",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request):
        staff_qs = PosStaff.objects.select_related('user').all()
        data = []
        for staff in staff_qs:
            user = staff.user
            user_phone = getattr(user, 'phone', None) or getattr(user, 'username', '')
            full_name = getattr(user, 'first_name', None) or getattr(user, 'full_name', None) or user_phone
            
            data.append({
                "id": staff.id,
                "user_id": user.id,
                "phone": user_phone,
                "fullName": full_name,
                "role": staff.role,
                "roleTitleFa": staff.role_title,
                "is_active": staff.is_active,
            })
        return Response({"success": True, "data": data}, status=status.HTTP_200_OK)

class StaffDetailAPIView(APIView):
    """
    ویرایش و حذف پرسنل
    """
    permission_classes = [AllowAny]

    def put(self, request, pk):
        try:
            staff = PosStaff.objects.get(pk=pk)
            user = staff.user
            
            # ویرایش اطلاعات
            full_name = request.data.get('full_name')
            password = request.data.get('password')
            role = request.data.get('role')
            role_title = request.data.get('roleTitleFa')
            
            if full_name:
                user.first_name = full_name
                user.save()
            if password:
                user.set_password(password)
                user.save()
            if role: staff.role = role
            if role_title: staff.role_title = role_title
            
            staff.save()
            return Response({"success": True, "message": "اطلاعات با موفقیت بروز شد."}, status=status.HTTP_200_OK)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            staff = PosStaff.objects.get(pk=pk)
            user = staff.user
            staff.delete()
            if user: user.delete()
            return Response({"success": True, "message": "پرسنل حذف شد."}, status=status.HTTP_200_OK)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

class ToggleLockStaffAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            staff = PosStaff.objects.get(pk=pk)
            staff.is_active = not staff.is_active
            staff.save()
            if staff.user:
                staff.user.is_active = staff.is_active
                staff.user.save()
            return Response({"success": True, "message": "وضعیت تغییر کرد."}, status=status.HTTP_200_OK)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)
