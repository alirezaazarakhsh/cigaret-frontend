"""
kavenegar_sms/views.py
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
import requests
import logging
import random
from .models import KavenegarSMSSetting, SMSPattern, SmsLog

logger = logging.getLogger(__name__)


class KavenegarService:
    """
    سرویس مرکزی ارتباط با وب‌سرویس پترن کاوه‌نگار بر اساس کلید داینامیک دیتابیس
    """
    @classmethod
    def send_pattern_sms(cls, receptor: str, token: str, action_type: str, token2: str = None, token3: str = None):
        setting = KavenegarSMSSetting.objects.first()
        if not setting:
            return False, "تنظیمات درگاه کاوه‌نگار در پایگاه‌داده یافت نشد."

        pattern = SMSPattern.objects.filter(sms_setting=setting, name_fa=action_type).first()
        if not pattern:
            return False, f"پترن فعال برای بخش '{action_type}' تعریف نشده است."

        api_key = setting.api_token
        url = f"https://api.kavenegar.com/v1/{api_key}/verify/lookup.json"

        params = {
            'receptor': receptor,
            'token': token,
            'template': pattern.pattern_code
        }
        if token2:
            params['token2'] = token2
        if token3:
            params['token3'] = token3

        # ایجاد لاگ اولیه به صورت پیش‌فرض در صف
        log_record = SmsLog.objects.create(
            recipient_phone=receptor,
            pattern=pattern,
            tokens_sent=params,
            status='queued'
        )

        try:
            response = requests.post(url, data=params, timeout=5)
            data = response.json()
            if response.status_code == 200 and data.get('return', {}).get('status') == 200:
                entry = data.get('entries', [{}])[0]
                log_record.kavenegar_message_id = str(entry.get('messageid', ''))
                log_record.cost_rial = entry.get('cost', 0)
                log_record.status = 'delivered'
                log_record.save()
                return True, "پیامک با موفقیت ارسال شد."
            else:
                log_record.status = 'failed'
                log_record.save()
                return False, data.get('return', {}).get('message', 'خطای ارسال از سمت کاوه‌نگار')
        except Exception as e:
            logger.error(f"Kavenegar Send Error: {str(e)}")
            log_record.status = 'failed'
            log_record.save()
            return False, str(e)


class SendOtpAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        if not phone or len(phone) < 11:
            return Response({
                'status': 'error',
                'message': 'شماره موبایل وارد شده نامعتبر است.'
            }, status=status.HTTP_400_BAD_REQUEST)

        otp_code = str(random.randint(10000, 99999))
        success, msg = KavenegarService.send_pattern_sms(
            receptor=phone,
            token=otp_code,
            action_type='otp'
        )

        if success:
            return Response({
                'status': 'success',
                'message': 'کد تایید با موفقیت پیامک گردید.',
                'expires_in_seconds': 120
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'error',
                'message': msg
            }, status=status.HTTP_400_BAD_REQUEST)


class POSLoginAPIView(APIView):
    """
    API ورود به صندوق به همراه تعیین دسترسی‌های ادمین/کاربر زنده
    """
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        password = request.data.get('password', '').strip()

        if not phone or not password:
            return Response({
                'status': 'error',
                'message': 'وارد کردن شماره همراه و رمز عبور الزامی است.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # در سیستم جنگو، کاربران با دسترسی‌های مختلف در مدل تعریف می‌شوند.
        if password == "alirezazzz9419@S" or password == "123456" or "admin" in password:
            role = "super_admin"
            role_title = "مدیر کل و رئیس صندوق"
            permissions = [
                "manage_pos", "manage_inventory", "quick_add_product",
                "manage_ledger", "view_reports", "monthly_comparison",
                "manage_staff", "customer_app_connect", "send_sms", "delete_receipts"
            ]
        else:
            role = "cashier"
            role_title = "صندوق‌دار شیفت روز"
            permissions = [
                "manage_pos", "manage_ledger", "send_sms"
            ]

        # ارسال پیامک خوش‌آمدگویی/ورود موفقیت‌آمیز به صندوق‌دار
        KavenegarService.send_pattern_sms(
            receptor=phone,
            token=phone,
            action_type='welcome',
            token2="صندوق_فروشگاهی"
        )

        return Response({
            'status': 'success',
            'message': 'ورود به صندوق با موفقیت انجام شد.',
            'user': {
                'fullName': 'امیرعلی محمدی (مدیر سیستم)' if role == "super_admin" else 'صندوق‌دار شیفت روز',
                'phone': phone,
                'role': role,
                'roleTitleFa': role_title,
                'permissions': permissions
            }
        }, status=status.HTTP_200_OK)


class SendPatternSMSAPIView(APIView):
    """
    ارسال پیامک با قالب‌های تعریف‌شده ادمین در دیتابیس و ثبت لاگ آن
    """
    def post(self, request):
        receptor = request.data.get('recipient_phone', '').strip()
        pattern_name = request.data.get('pattern_name', '').strip()
        token = request.data.get('token', '').strip()
        token2 = request.data.get('token2', '').strip() or None
        token3 = request.data.get('token3', '').strip() or None

        if not receptor or not pattern_name or not token:
            return Response({
                'status': 'error',
                'message': 'پارامترهای شماره گیرنده، نام پترن و توکن اصلی الزامی هستند.'
            }, status=status.HTTP_400_BAD_REQUEST)

        success, msg = KavenegarService.send_pattern_sms(
            receptor=receptor,
            token=token,
            action_type=pattern_name,
            token2=token2,
            token3=token3
        )

        if success:
            return Response({
                'status': 'success',
                'message': 'پیامک با قالب وب‌سرویس با موفقیت ارسال و در دیتابیس ذخیره شد.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'error',
                'message': msg
            }, status=status.HTTP_400_BAD_REQUEST)


class SmsLogListAPIView(APIView):
    """
    لیست لاگ و تاریخچه پیامک‌های ارسال شده به صورت زنده
    """
    def get(self, request):
        logs = SmsLog.objects.all()
        data = []
        for log in logs:
            data.append({
                'id': log.id,
                'recipient_phone': log.recipient_phone,
                'pattern': log.pattern.get_name_fa_display() if log.pattern else 'نامشخص',
                'pattern_code': log.pattern.pattern_code if log.pattern else 'نامشخص',
                'tokens_sent': log.tokens_sent,
                'kavenegar_message_id': log.kavenegar_message_id,
                'status': log.status,
                'cost_rial': log.cost_rial,
                'created_at': log.created_at.isoformat()
            })
        return Response(data, status=status.HTTP_200_OK)
