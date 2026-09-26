from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from .models import PosStaff
from .serializers import (
    PosStaffCreateSerializer, 
    PosStaffUpdateSerializer, 
    PosStaffOutSerializer, 
    LoginSerializer,
    PERMISSION_FIELDS
)

User = get_user_model()

ROLE_TITLE_MAP = {
    'warehouse_manager': 'مدیر انبار و بنکداری',
    'cashier': 'صندوق‌دار فروشگاه',
    'accountant': 'حسابدار و بازرس مالی',
    'super_admin': 'مدیر ارشد سامانه',
}


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class LoginStaffAPIView(APIView):
    """
    اندپوینت ورود پرسنل صندوق و انبار با احراز هویت دقیق و خروجی جامع توکن برای جلوگیر از سفید شدن صفحه
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ورود پرسنل صندوق",
        request_body=LoginSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        phone_raw = request.data.get('phone', '')
        password = request.data.get('password', '')

        if not phone_raw or not password:
            return Response({"success": False, "message": "شماره همراه و پینکد الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        phone = phone_raw.strip().replace(' ', '').replace('-', '')
        if phone.startswith('+98'):
            phone = '0' + phone[3:]
        elif phone.startswith('98'):
            phone = '0' + phone[2:]

        user = None
        user_candidate = (
            User.objects.filter(phone=phone).first() or
            User.objects.filter(username=phone).first() or
            User.objects.filter(mobile=phone).first()
        )

        if user_candidate:
            if user_candidate.check_password(password):
                user = user_candidate
            else:
                pos_staff = getattr(user_candidate, 'pos_profile', None)
                if pos_staff and pos_staff.password:
                    if check_password(password, pos_staff.password):
                        user = user_candidate

        if user is None:
            user = authenticate(request, username=phone, password=password)
            if user is None:
                user = authenticate(request, phone=phone, password=password)

        if user is not None:
            if not user.is_active:
                return Response({"success": False, "message": "حساب کاربری شما تعلیق شده است."}, status=status.HTTP_403_FORBIDDEN)
            
            tokens = get_tokens_for_user(user)
            
            try:
                pos_staff = user.pos_profile
                if not pos_staff.is_active:
                    return Response({"success": False, "message": "دسترسی حساب شما به صندوق مسدود شده است."}, status=status.HTTP_403_FORBIDDEN)
                role = pos_staff.role
                role_title = pos_staff.role_title or ROLE_TITLE_MAP.get(role, 'صندوق‌دار فروشگاه')
                permissions = [name for name in PERMISSION_FIELDS if getattr(pos_staff, f'perm_{name}', False)]
            except PosStaff.DoesNotExist:
                if user.is_superuser:
                    role = 'super_admin'
                    role_title = 'مدیر ارشد سیستم'
                    permissions = list(PERMISSION_FIELDS)
                else:
                    return Response({"success": False, "message": "شما دسترسی به صندوق فروشگاهی را ندارید."}, status=status.HTTP_403_FORBIDDEN)

            user_phone = (
                getattr(user, 'phone', None) or 
                getattr(user, 'mobile', None) or 
                getattr(user, 'phone_number', None) or 
                getattr(user, 'username', None) or 
                phone
            )

            full_name = getattr(user, 'full_name', None) or getattr(user, 'first_name', None) or user_phone

            user_dict = {
                "id": user.id,
                "phone": user_phone,
                "fullName": full_name,
                "full_name": full_name,
                "first_name": full_name,
                "role": role,
                "roleTitleFa": role_title,
                "role_title": role_title,
                "permissions": permissions,
                "status": "active",
                "is_active": True,
                "is_staff": True,
                "is_superuser": user.is_superuser
            }

            response_data = {
                "success": True,
                "message": "ورود موفقیت‌آمیز بود.",
                "token": tokens['access'],
                "access": tokens['access'],
                "access_token": tokens['access'],
                "refresh": tokens['refresh'],
                "user": user_dict,
                "data": {
                    "user": user_dict,
                    "tokens": tokens,
                    "access": tokens['access'],
                    "refresh": tokens['refresh'],
                    "token": tokens['access']
                }
            }

            response = Response(response_data, status=status.HTTP_200_OK)
            # Set cookies for cross-domain compatibility (Vercel to Sevinhost)
            try:
                response.set_cookie('access', tokens['access'], max_age=86400, httponly=False, samesite='None', secure=True)
                response.set_cookie('refresh', tokens['refresh'], max_age=604800, httponly=False, samesite='None', secure=True)
                response.set_cookie('token', tokens['access'], max_age=86400, httponly=False, samesite='None', secure=True)
            except Exception:
                pass

            return response
        else:
            return Response({"success": False, "message": "شماره همراه یا رمز عبور اشتباه است."}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutStaffAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="خروج پرسنل صندوق",
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        response = Response({"success": True, "message": "خروج موفقیت‌آمیز بود."}, status=status.HTTP_200_OK)
        try:
            response.delete_cookie('access', samesite='None', secure=True)
            response.delete_cookie('refresh', samesite='None', secure=True)
            response.delete_cookie('token', samesite='None', secure=True)
        except Exception:
            pass
        return response


class ActiveStaffSessionsAPIView(APIView):
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
            permissions = [name for name in PERMISSION_FIELDS if getattr(staff, f'perm_{name}', False)]
            online_sessions.append({
                "id": user.id,
                "fullName": getattr(user, 'first_name', None) or getattr(user, 'full_name', None) or user_phone,
                "phone": user_phone,
                "role": staff.role,
                "roleTitleFa": staff.role_title or ROLE_TITLE_MAP.get(staff.role, 'صندوق‌دار'),
                "permissions": permissions,
                "status": "online"
            })
        return Response({
            "success": True,
            "data": online_sessions
        }, status=status.HTTP_200_OK)


class CreateStaffAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ایجاد پرسنل صندوق جدید",
        request_body=PosStaffCreateSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        serializer = PosStaffCreateSerializer(data=request.data)
        if serializer.is_valid():
            pos_staff = serializer.save()
            out_data = PosStaffOutSerializer(pos_staff).data
            return Response({
                "success": True, 
                "message": "پرسنل صندوق با موفقیت در دیتابیس ثبت شد.",
                "data": out_data
            }, status=status.HTTP_201_CREATED)
        return Response({"success": False, "message": "خطا در ثبت پرسنل", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ListStaffAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست پرسنل",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request):
        staff_qs = PosStaff.objects.select_related('user').all().order_by('-created_at')
        serializer = PosStaffOutSerializer(staff_qs, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class StaffDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
            user = staff.user
            
            full_name = request.data.get('full_name') or request.data.get('fullName')
            phone = request.data.get('phone')
            password = request.data.get('password')
            role = request.data.get('role')
            role_title = request.data.get('roleTitleFa') or request.data.get('role_title')
            permissions_list = request.data.get('permissions')
            
            if phone:
                phone_clean = phone.strip().replace(' ', '').replace('-', '')
                if phone_clean.startswith('+98'): phone_clean = '0' + phone_clean[3:]
                elif phone_clean.startswith('98'): phone_clean = '0' + phone_clean[2:]
                
                if hasattr(user, 'phone'): user.phone = phone_clean
                if hasattr(user, 'username'): user.username = phone_clean
                if hasattr(user, 'mobile'): user.mobile = phone_clean

            if full_name:
                if hasattr(user, 'full_name'): user.full_name = full_name
                if hasattr(user, 'first_name'): user.first_name = full_name

            user.save()

            if password and password.strip():
                staff.set_password(password.strip())

            if role:
                staff.role = role
                if not role_title:
                    staff.role_title = ROLE_TITLE_MAP.get(role, staff.role_title or 'صندوق‌دار')
            
            if role_title:
                staff.role_title = role_title

            if permissions_list is not None and isinstance(permissions_list, list):
                for name in PERMISSION_FIELDS:
                    setattr(staff, f'perm_{name}', name in permissions_list)
            
            staff.save()
            out_data = PosStaffOutSerializer(staff).data
            return Response({"success": True, "message": "اطلاعات با موفقیت بروز شد.", "data": out_data}, status=status.HTTP_200_OK)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
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
            staff = PosStaff.objects.select_related('user').get(pk=pk)
            staff.is_active = not staff.is_active
            staff.save()
            if staff.user:
                staff.user.is_active = staff.is_active
                staff.user.save()
            out_data = PosStaffOutSerializer(staff).data
            return Response({"success": True, "message": "وضعیت با موفقیت تغییر کرد.", "data": out_data}, status=status.HTTP_200_OK)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)
