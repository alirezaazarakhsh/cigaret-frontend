from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
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


def is_valid_new_password(pwd) -> bool:
    """بررسی اینکه آیا رمز عبور جدید وارد شده واقعی است یا کاراکترهای ماسک‌شده مانند گلوله یا ستاره است"""
    if not pwd or not isinstance(pwd, str):
        return False
    pwd = pwd.strip()
    if not pwd:
        return False
    if set(pwd) <= {'•', '*', '⚫', '▪', '.'} or '•' in pwd or '****' in pwd or pwd == '••••••••':
        return False
    if len(pwd) < 3:
        return False
    return True


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def get_current_user_id_from_request(request):
    """استخراج شناسه کاربر جاری از توکن، کوکی یا درخواست"""
    if hasattr(request, 'user') and request.user and request.user.is_authenticated:
        return request.user.id
    
    auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION', '')
    if auth_header and 'Bearer ' in auth_header:
        token_str = auth_header.split('Bearer ')[1].strip()
        try:
            token = AccessToken(token_str)
            return token.get('user_id') or token.get('id')
        except Exception:
            pass

    for c_key in ['access', 'token', 'access_token']:
        token_str = request.COOKIES.get(c_key)
        if token_str:
            try:
                token = AccessToken(token_str)
                return token.get('user_id') or token.get('id')
            except Exception:
                pass

    uid = request.GET.get('user_id') or request.GET.get('current_user_id')
    if uid and str(uid).isdigit():
        return int(uid)

    return None


def format_user_login_time(user):
    """فرمت‌دهی زمان آخرین ورود کاربر"""
    last_login = getattr(user, 'last_login', None) or timezone.now()
    if timezone.is_aware(last_login):
        last_login = timezone.localtime(last_login)
    time_str = last_login.strftime('%H:%M')
    return {
        "last_login": last_login.isoformat(),
        "login_time": time_str,
        "loginTime": time_str,
        "online_time": time_str,
        "last_seen": time_str,
        "time": time_str,
    }


class LoginStaffAPIView(APIView):
    """
    اندپوینت ورود پرسنل صندوق و انبار با احراز هویت دقیق و ثبت آخرین زمان ورود
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ورود پرسنل صندوق",
        request_body=LoginSerializer,
        tags=['مدیریت پرسنل صندوق']
    )
    def post(self, request):
        phone_raw = request.data.get('phone', '') or request.data.get('username', '')
        password = request.data.get('password', '') or request.data.get('pin', '')

        if not phone_raw or not password:
            return Response({"success": False, "message": "شماره همراه و پینکد الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        clean_phone = phone_raw.strip().replace(' ', '').replace('-', '')
        if clean_phone.startswith('+98'):
            clean_phone = '0' + clean_phone[3:]
        elif clean_phone.startswith('98'):
            clean_phone = '0' + clean_phone[2:]

        phone_no_zero = clean_phone[1:] if clean_phone.startswith('0') else clean_phone
        phone_with_zero = '0' + phone_no_zero

        candidate_users = list(
            User.objects.filter(phone__in=[phone_with_zero, phone_no_zero]) |
            User.objects.filter(username__in=[phone_with_zero, phone_no_zero])
        )

        user = None
        for candidate in candidate_users:
            if candidate.check_password(password):
                user = candidate
                break
            pos_staff = getattr(candidate, 'pos_profile', None)
            if pos_staff and pos_staff.password:
                if check_password(password, pos_staff.password):
                    user = candidate
                    break

        if user is not None:
            if not user.is_active:
                return Response({"success": False, "message": "حساب کاربری شما تعلیق شده است."}, status=status.HTTP_403_FORBIDDEN)
            
            # ثبت زمان آخرین ورود
            try:
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])
            except Exception:
                pass

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
                getattr(user, 'username', None) or 
                phone_with_zero
            )

            full_name = (
                getattr(user, 'full_name', None) or 
                getattr(user, 'first_name', None) or 
                user_phone
            )

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
        operation_summary="لیست صندوقدارهای آنلاین و پرسنل فعال",
        tags=['مدیریت پرسنل صندوق']
    )
    def get(self, request):
        current_user_id = get_current_user_id_from_request(request)
        seen_user_ids = set()
        online_sessions = []

        # ۱. کلیه پرسنل فعال ثبت‌شده در PosStaff
        active_staff = PosStaff.objects.filter(is_active=True).select_related('user')
        for staff in active_staff:
            user = staff.user
            if not user or not user.is_active:
                continue
            seen_user_ids.add(user.id)
            is_self = bool(current_user_id and user.id == current_user_id)
            
            user_phone = (
                getattr(user, 'phone', None) or 
                getattr(user, 'mobile', None) or 
                getattr(user, 'username', None) or 
                ''
            )
            permissions = [name for name in PERMISSION_FIELDS if getattr(staff, f'perm_{name}', False)]
            full_name = (
                getattr(user, 'full_name', None) or 
                getattr(user, 'first_name', None) or 
                user_phone or 
                'پرسنل'
            )
            role_title = staff.role_title or ROLE_TITLE_MAP.get(staff.role, 'صندوق‌دار فروشگاه')
            time_info = format_user_login_time(user)

            online_sessions.append({
                "id": user.id,
                "user_id": user.id,
                "userId": user.id,
                "fullName": full_name,
                "full_name": full_name,
                "name": full_name,
                "phone": user_phone,
                "mobile": user_phone,
                "username": user_phone,
                "role": staff.role,
                "roleTitleFa": role_title,
                "role_title": role_title,
                "role_display": role_title,
                "permissions": permissions,
                "status": "online",
                "is_online": True,
                "online": True,
                "is_active": True,
                "is_current_user": is_self,
                "isCurrentUser": is_self,
                "is_self": is_self,
                "isSelf": is_self,
                "is_me": is_self,
                **time_info
            })

        # ۲. کلیه سایر کاربران فعال سامانه (مدیران ارشد، پرسنل دارای ورود)
        other_users = User.objects.filter(is_active=True).exclude(id__in=seen_user_ids)
        for u in other_users:
            if not (u.is_staff or u.is_superuser or getattr(u, 'last_login', None)):
                continue
            seen_user_ids.add(u.id)
            is_self = bool(current_user_id and u.id == current_user_id)
            
            u_phone = (
                getattr(u, 'phone', None) or 
                getattr(u, 'mobile', None) or 
                getattr(u, 'username', None) or 
                ''
            )
            f_name = (
                getattr(u, 'full_name', None) or 
                getattr(u, 'first_name', None) or 
                u_phone or 
                'مدیر ارشد'
            )
            r_title = "مدیر ارشد سامانه" if u.is_superuser else "صندوق‌دار فروشگاه"
            time_info = format_user_login_time(u)

            online_sessions.append({
                "id": u.id,
                "user_id": u.id,
                "userId": u.id,
                "fullName": f_name,
                "full_name": f_name,
                "name": f_name,
                "phone": u_phone,
                "mobile": u_phone,
                "username": u_phone,
                "role": "super_admin" if u.is_superuser else "cashier",
                "roleTitleFa": r_title,
                "role_title": r_title,
                "role_display": r_title,
                "permissions": list(PERMISSION_FIELDS),
                "status": "online",
                "is_online": True,
                "online": True,
                "is_active": True,
                "is_current_user": is_self,
                "isCurrentUser": is_self,
                "is_self": is_self,
                "isSelf": is_self,
                "is_me": is_self,
                **time_info
            })

        return Response({
            "success": True,
            "data": online_sessions,
            "sessions": online_sessions,
            "staff": online_sessions,
            "active_staff": online_sessions
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
            # بسیار مهم:
            # ابتدا خود PosStaff را دقیقاً با PK موجود در URL پیدا می‌کنیم.
            # سپس فقط User متصل به همین Staff را ویرایش می‌کنیم.
            staff = PosStaff.objects.select_related('user').get(pk=pk)
            user = staff.user

            # =========================================================
            # 1. بروزرسانی نام کاربر
            # =========================================================
            raw_full_name = (
                request.data.get('full_name')
                or request.data.get('fullName')
                or request.data.get('name')
            )

            if (
                raw_full_name
                and isinstance(raw_full_name, str)
                and raw_full_name.strip()
            ):
                clean_name = raw_full_name.strip()

                user_fields_to_update = []

                if hasattr(user, 'full_name'):
                    user.full_name = clean_name
                    user_fields_to_update.append('full_name')

                if hasattr(user, 'first_name'):
                    user.first_name = clean_name
                    user_fields_to_update.append('first_name')

                if user_fields_to_update:
                    user.save(update_fields=user_fields_to_update)

            # =========================================================
            # 2. بروزرسانی شماره تلفن
            # =========================================================
            raw_phone = request.data.get('phone')

            if (
                raw_phone
                and isinstance(raw_phone, str)
                and raw_phone.strip()
            ):
                phone_clean = (
                    raw_phone
                    .strip()
                    .replace(' ', '')
                    .replace('-', '')
                )

                if phone_clean.startswith('+98'):
                    phone_clean = '0' + phone_clean[3:]
                elif phone_clean.startswith('98'):
                    phone_clean = '0' + phone_clean[2:]

                if len(phone_clean) >= 10:
                    user_fields_to_update = []

                    if hasattr(user, 'phone'):
                        user.phone = phone_clean
                        user_fields_to_update.append('phone')

                    if hasattr(user, 'username'):
                        user.username = phone_clean
                        user_fields_to_update.append('username')

                    if hasattr(user, 'mobile'):
                        user.mobile = phone_clean
                        user_fields_to_update.append('mobile')

                    if hasattr(user, 'phone_number'):
                        user.phone_number = phone_clean
                        user_fields_to_update.append('phone_number')

                    if user_fields_to_update:
                        user.save(update_fields=user_fields_to_update)

            # =========================================================
            # 3. بروزرسانی رمز عبور
            # =========================================================
            raw_password = request.data.get('password')

            if is_valid_new_password(raw_password):
                raw_password = raw_password.strip()

                # فقط User مربوط به همین PosStaff
                user.set_password(raw_password)
                user.save(update_fields=['password'])

                # ذخیره Hash روی PosStaff
                staff.password = make_password(raw_password)

            # =========================================================
            # 4. بروزرسانی نقش
            # =========================================================
            role = request.data.get('role')

            role_title = (
                request.data.get('roleTitleFa')
                or request.data.get('role_title')
            )

            if role:
                staff.role = role

                if not role_title:
                    staff.role_title = ROLE_TITLE_MAP.get(
                        role,
                        staff.role_title or 'صندوق‌دار'
                    )

            if role_title:
                staff.role_title = role_title.strip()

            # =========================================================
            # 5. بروزرسانی دسترسی‌ها
            # =========================================================
            permissions_list = request.data.get('permissions')

            if (
                permissions_list is not None
                and isinstance(permissions_list, list)
            ):
                for name in PERMISSION_FIELDS:
                    setattr(
                        staff,
                        f'perm_{name}',
                        name in permissions_list
                    )

            # =========================================================
            # 6. ذخیره PosStaff
            # =========================================================
            #
            # چون password را خودمان Hash کرده‌ایم، save مدل نباید
            # دوباره User دیگری را تغییر دهد.
            #
            staff.save()

            # =========================================================
            # 7. خروجی
            # =========================================================
            out_data = PosStaffOutSerializer(staff).data

            return Response(
                {
                    "success": True,
                    "message": "اطلاعات پرسنل با موفقیت بروز شد.",
                    "data": out_data
                },
                status=status.HTTP_200_OK
            )

        except PosStaff.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "پرسنل یافت نشد."
                },
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            staff = PosStaff.objects.select_related('user').get(pk=pk)
            user = staff.user

            staff.delete()

            if user:
                user.delete()

            return Response(
                {
                    "success": True,
                    "message": "پرسنل حذف شد."
                },
                status=status.HTTP_200_OK
            )

        except PosStaff.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "پرسنل یافت نشد."
                },
                status=status.HTTP_404_NOT_FOUND
            )

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
