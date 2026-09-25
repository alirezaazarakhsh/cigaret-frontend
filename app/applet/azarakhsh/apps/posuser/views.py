from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema

from .models import PosStaff
from .permissions import IsPosSuperAdminOrHasStaffPermission
from .serializers import (
    PosStaffCreateSerializer,
    PosStaffUpdateSerializer,
    PosStaffOutSerializer,
    PosStaffDetailSerializer,
    PosStaffResetPasswordSerializer,
    PosStaffActiveSessionSerializer,
    LoginSerializer,
    PERMISSION_FIELDS,
    PERMISSION_LABELS_FA,
)

User = get_user_model()


# ==============================================================================
# توابع کمکی تولید توکن و بررسی دسترسی
# ==============================================================================
def get_tokens_for_user(user):
    """
    تولید زوج توکن Access و Refresh با SimpleJWT برای کاربر لاگین شده
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }


def resolve_role_and_permissions(user, pos_staff):
    """
    تعیین سطح نقش، عنوان شغلی و آرایه کلیدهای دسترسی پرسنل.
    در صورتی که کاربر superuser جنگو باشد، دسترسی فول به‌صورت خودکار اعطا می‌شود.
    """
    if pos_staff is not None:
        role = pos_staff.role
        role_title = pos_staff.role_title or 'پرسنل صندوق'
        permissions = [name for name in PERMISSION_FIELDS if getattr(pos_staff, f'perm_{name}', False)]
        return role, role_title, permissions
    if user.is_superuser:
        return 'super_admin', 'مدیر ارشد سیستم', list(PERMISSION_FIELDS)
    return None


# ==============================================================================
# ۱. اندپوینت ورود پرسنل صندوق و انبار (Login API)
# ==============================================================================
class LoginStaffAPIView(APIView):
    """
    احراز هویت پرسنل صندوق با شماره همراه و رمز عبور / پین‌کد.
    شامل نرخ محدودسازی (Rate Limiting) جهت جلوگیری از حملات brute-force.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'pos_login'

    @swagger_auto_schema(
        operation_summary="ورود پرسنل صندوق و انبار",
        operation_description="احراز هویت کاربر و دریافت توکن‌های JWT به‌همراه کوکی‌های امن HTTP-Only",
        request_body=LoginSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        password = serializer.validated_data['password']

        user = authenticate(request, username=phone, password=password)
        if user is None:
            return Response(
                {"success": False, "message": "شماره همراه یا رمز عبور اشتباه است."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"success": False, "message": "حساب کاربری شما در سیستم غیرفعال شده است."},
                status=status.HTTP_403_FORBIDDEN,
            )

        pos_staff = getattr(user, 'pos_profile', None)
        if pos_staff is not None and not pos_staff.is_active:
            return Response(
                {"success": False, "message": "دسترسی شما به پنل صندوق مسدود شده است."},
                status=status.HTTP_403_FORBIDDEN,
            )

        resolved = resolve_role_and_permissions(user, pos_staff)
        if resolved is None:
            return Response(
                {"success": False, "message": "شما مجوز دسترسی به صندوق فروشگاهی را ندارید."},
                status=status.HTTP_403_FORBIDDEN,
            )
        role, role_title, permissions = resolved

        tokens = get_tokens_for_user(user)
        user_phone = getattr(user, 'phone', None) or getattr(user, 'username', None) or str(user)
        full_name = getattr(user, 'full_name', None) or getattr(user, 'first_name', None) or user_phone

        response_data = {
            "success": True,
            "message": "ورود موفقیت‌آمیز بود.",
            "data": {
                "user": {
                    "id": user.id,
                    "phone": user_phone,
                    "fullName": full_name,
                    "role": role,
                    "roleTitleFa": role_title,
                    "permissions": permissions,
                    "status": "active" if user.is_active else "suspended",
                },
                "tokens": tokens,
            },
        }
        response = Response(response_data, status=status.HTTP_200_OK)
        response.set_cookie('access', tokens['access'], httponly=True, samesite='Lax', secure=not settings.DEBUG)
        response.set_cookie('refresh', tokens['refresh'], httponly=True, samesite='Lax', secure=not settings.DEBUG)
        return response


# ==============================================================================
# ۲. اندپوینت خروج پرسنل صندوق (Logout API)
# ==============================================================================
class LogoutStaffAPIView(APIView):
    """
    خروج پرسنل صندوق، ابطال توکن Refresh و حذف کوکی‌های نشست
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="خروج پرسنل صندوق و ابطال نشست",
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        refresh_token = request.data.get('refresh') or request.COOKIES.get('refresh')
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass

        response = Response({"success": True, "message": "خروج با موفقیت انجام شد."}, status=status.HTTP_200_OK)
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response


# ==============================================================================
# ۳. اندپوینت پروفایل پرسنل لاگین‌شده (Current Profile API)
# ==============================================================================
class CurrentStaffProfileAPIView(APIView):
    """
    دریافت پروفایل کامل کاربر جاری صندوق
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت پروفایل پرسنل آنلاین جاری",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request):
        user = request.user
        pos_staff = getattr(user, 'pos_profile', None)
        resolved = resolve_role_and_permissions(user, pos_staff)
        if resolved is None:
            return Response({"success": False, "message": "دسترسی یافت نشد."}, status=status.HTTP_403_FORBIDDEN)
        role, role_title, permissions = resolved
        user_phone = getattr(user, 'phone', None) or getattr(user, 'username', None) or str(user)
        full_name = getattr(user, 'full_name', None) or getattr(user, 'first_name', None) or user_phone

        return Response({
            "success": True,
            "data": {
                "id": user.id,
                "phone": user_phone,
                "fullName": full_name,
                "role": role,
                "roleTitleFa": role_title,
                "permissions": permissions,
                "status": "active" if user.is_active else "suspended"
            }
        }, status=status.HTTP_200_OK)


# ==============================================================================
# ۴. اندپوینت لیست جلسات آنلاین همزمان (Active Sessions API)
# ==============================================================================
class ActiveStaffSessionsAPIView(APIView):
    """
    مشاهده لیست صندوق‌داران و پرسنلی که هم‌اکنون در سیستم آنلاین هستند
    """
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="لیست صندوق‌دارهای آنلاین همزمان",
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
                "fullName": getattr(user, 'full_name', None) or getattr(user, 'first_name', None) or user_phone,
                "phone": user_phone,
                "role": staff.role,
                "roleTitleFa": staff.role_title or 'صندوقدار',
                "status": "online",
            })
        serializer = PosStaffActiveSessionSerializer(online_sessions, many=True)
        return Response({
            "success": True,
            "count": len(online_sessions),
            "allow_concurrent_logins": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# ۵. اندپوینت ثبت پرسنل جدید (Create Staff API)
# ==============================================================================
class CreateStaffAPIView(APIView):
    """
    افزودن پرسنل جدید به همراه ساخت اکانت کاربر جنگو و پروفایل صندوق در تراکنش اتمیک
    """
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="ایجاد پرسنل جدید صندوق",
        request_body=PosStaffCreateSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        serializer = PosStaffCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        phone = data['phone']
        role = data['role']

        if role == 'super_admin' and not request.user.is_superuser:
            return Response(
                {"success": False, "message": "فقط مدیر ارشد سیستم می‌تواند نقش مدیر ارشد جدید تعریف کند."},
                status=status.HTTP_403_FORBIDDEN,
            )

        username_field = getattr(User, 'USERNAME_FIELD', 'username')
        if User.objects.filter(**{username_field: phone}).exists():
            return Response(
                {"success": False, "message": "این شماره همراه قبلاً در سیستم ثبت شده است."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            user = User.objects.create_user(**{username_field: phone}, password=data['password'])

            if hasattr(user, 'full_name'):
                user.full_name = data['full_name']
            elif hasattr(user, 'first_name'):
                user.first_name = data['full_name']

            user.is_staff = True
            if role == 'super_admin':
                user.is_superuser = True
            user.save()

            perms_map = {
                f'perm_{name}': name in data.get('permissions', [])
                for name in PERMISSION_FIELDS
            }
            PosStaff.objects.create(
                user=user,
                role=role,
                role_title=data.get('roleTitleFa') or 'صندوقدار',
                **perms_map,
            )

        return Response(
            {"success": True, "message": f"پرونده پرسنلی {data['full_name']} با موفقیت در دیتابیس ثبت شد."},
            status=status.HTTP_201_CREATED,
        )


# ==============================================================================
# ۶. اندپوینت دریافت لیست کامل پرسنل (List Staff API)
# ==============================================================================
class ListStaffAPIView(APIView):
    """
    دریافت لیست تمام پرسنل ثبت‌شده در دیتابیس
    """
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="دریافت لیست پرسنل صندوق و انبار",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request):
        staff_qs = PosStaff.objects.select_related('user').all().order_by('-created_at')
        serializer = PosStaffOutSerializer(staff_qs, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


# ==============================================================================
# ۷. اندپوینت ویرایش، مشاهده جزئیات و حذف پرسنل (Detail / Update / Delete API)
# ==============================================================================
class StaffDetailAPIView(APIView):
    """
    مشاهده، ویرایش و حذف پرونده پرسنلی بر اساس شناسه (pk)
    """
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات کامل پرسنل",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PosStaffDetailSerializer(staff)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ویرایش اطلاعات پرسنل صندوق",
        request_body=PosStaffUpdateSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def put(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PosStaffUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if data.get('role') == 'super_admin' and not request.user.is_superuser:
            return Response(
                {"success": False, "message": "فقط مدیر ارشد سیستم می‌تواند نقش کاربر را به مدیر ارشد ارتقا دهد."},
                status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            user = staff.user
            if 'full_name' in data:
                if hasattr(user, 'full_name'):
                    user.full_name = data['full_name']
                elif hasattr(user, 'first_name'):
                    user.first_name = data['full_name']
            if 'phone' in data:
                if hasattr(user, 'phone'):
                    user.phone = data['phone']
                elif hasattr(user, 'mobile'):
                    user.mobile = data['phone']
            if 'password' in data and data['password']:
                staff.set_password(data['password'])
            user.save()

            if 'role' in data:
                staff.role = data['role']
            if 'roleTitleFa' in data:
                staff.role_title = data['roleTitleFa']
            if 'permissions' in data:
                for name in PERMISSION_FIELDS:
                    setattr(staff, f'perm_{name}', name in data['permissions'])

            staff.save()

        return Response({"success": True, "message": "اطلاعات پرسنل با موفقیت به‌روزرسانی شد."}, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="حذف پرسنل صندوق",
        tags=['مدیریت پرسنل صندوق']
    )
    def delete(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        if staff.user_id == request.user.id:
            return Response(
                {"success": False, "message": "امکان حذف حساب کاربری جاری وجود ندارد."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if staff.role == 'super_admin' and not request.user.is_superuser:
            return Response(
                {"success": False, "message": "فقط مدیر ارشد سیستم می‌تواند مدیر ارشد دیگری را حذف کند."},
                status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            user = staff.user
            staff.delete()
            if user:
                user.delete()

        return Response({"success": True, "message": "پرسنل با موفقیت از سیستم حذف گردید."}, status=status.HTTP_200_OK)


# ==============================================================================
# ۸. اندپوینت قفل / فعال‌سازی پرسنل (Toggle Lock API)
# ==============================================================================
class ToggleLockStaffAPIView(APIView):
    """
    تغییر سریع وضعیت فعالیت یا تعلیق حساب پرسنل
    """
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="تغییر وضعیت قفل / تعلیق حساب پرسنل",
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        if staff.user_id == request.user.id:
            return Response(
                {"success": False, "message": "امکان قفل کردن حساب خودتان وجود ندارد."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        staff.is_active = not staff.is_active
        staff.save()

        if staff.user and hasattr(staff.user, 'is_active'):
            staff.user.is_active = staff.is_active
            staff.user.save(update_fields=['is_active'])

        status_str = "active" if staff.is_active else "suspended"
        msg = "حساب پرسنل با موفقیت فعال شد." if staff.is_active else "حساب پرسنل با موفقیت قفل / تعلیق گردید."
        return Response({
            "success": True,
            "is_active": staff.is_active,
            "status": status_str,
            "message": msg,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# ۹. اندپوینت تغییر/بازنشانی رمز عبور و پین‌کد (Reset Password API)
# ==============================================================================
class ResetStaffPasswordAPIView(APIView):
    """
    تغییر پین‌کد یا رمز عبور پرسنل توسط مدیر ارشد
    """
    permission_classes = [IsAuthenticated, IsPosSuperAdminOrHasStaffPermission]

    @swagger_auto_schema(
        operation_summary="تغییر پین‌کد یا رمز عبور پرسنل",
        request_body=PosStaffResetPasswordSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
        except PosStaff.DoesNotExist:
            return Response({"success": False, "message": "پرسنل یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PosStaffResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_password = serializer.validated_data['new_password']

        staff.set_password(new_password)
        staff.save()

        return Response({"success": True, "message": "رمز عبور پرسنل با موفقیت تغییر یافت."}, status=status.HTTP_200_OK)
