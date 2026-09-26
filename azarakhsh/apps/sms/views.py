"""
kavenegar_sms/views.py
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django.shortcuts import get_object_or_404
import requests
import logging
import random
from .models import KavenegarSMSSetting, SMSPattern, SmsLog, PATTERN_SECTIONS
from .serializers import KavenegarSMSSettingSerializer, SMSPatternSerializer, SmsLogSerializer

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
        if not pattern or not pattern.pattern_code:
            return False, f"کد پترن برای بخش '{action_type}' در دیتابیس تعریف نشده است."

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

        # ایجاد لاگ اولیه به صورت پیش‌فرض در صف در دیتابیس
        log_record = SmsLog.objects.create(
            recipient_phone=receptor,
            pattern=pattern,
            tokens_sent=params,
            status='queued'
        )

        try:
            response = requests.post(url, data=params, timeout=8)
            data = response.json()
            if response.status_code == 200 and data.get('return', {}).get('status') == 200:
                entry = data.get('entries', [{}])[0]
                log_record.kavenegar_message_id = str(entry.get('messageid', ''))
                log_record.cost_rial = entry.get('cost', 240)
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


class KavenegarSMSSettingAPIView(APIView):
    """
    دریافت و ذخیره‌سازی تنظیمات درگاه کاوه‌نگار در دیتابیس آذرخش
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['پنل پیامک کاوه‌نگار'],
        summary="دریافت تنظیمات درگاه پیامک",
        description="بازیابی تنظیمات فعلی شامل نام سامانه و API Token از پایگاه‌داده برای نمایش در پنل مدیریت صندوق",
        responses={200: KavenegarSMSSettingSerializer}
    )
    def get(self, request):
        setting = KavenegarSMSSetting.objects.first()
        if not setting:
            setting = KavenegarSMSSetting.objects.create(
                name="سامانه پیامک هوشمند آذرخش",
                api_token="",
            )
        serializer = KavenegarSMSSettingSerializer(setting)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['پنل پیامک کاوه‌نگار'],
        summary="ذخیره تنظیمات درگاه پیامک",
        description="بروزرسانی کلید API و نام نمایشی سامانه پیامک کاوه‌نگار در جدول تنظیمات",
        request=KavenegarSMSSettingSerializer,
        responses={200: KavenegarSMSSettingSerializer}
    )
    def post(self, request):
        name = request.data.get('name', 'سامانه پیامک کاوه‌نگار')
        api_token = request.data.get('api_token', '').strip()
        is_active = request.data.get('is_active', True)
        debug_mode = request.data.get('debug_mode', False)

        # مدیریت سینگلتون (تک رکوردی): همیشه رکورد اول را بروزرسانی میکند
        setting = KavenegarSMSSetting.objects.first()
        if not setting:
            setting = KavenegarSMSSetting.objects.create(id=1, name=name)
        
        setting.name = name
        setting.is_active = is_active
        setting.debug_mode = debug_mode
        if api_token:
            setting.api_token = api_token
        setting.save()

        return Response({
            'status': 'success',
            'message': 'تنظیمات درگاه کاوه‌نگار با موفقیت ذخیره شد.'
        }, status=status.HTTP_200_OK)


class SMSPatternListSaveAPIView(APIView):
    """
    دریافت لیست الگوها و ثبت کد پترن انگلیسی برای هر بخش از سامانه
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['پنل پیامک کاوه‌نگار'],
        summary="لیست پترن‌های ۱۳گانه سامانه",
        description="دریافت فهرست تمام ۱۳ بخش پیامکی (مانند ورود، خوشآمدگویی، رسید و ...) به همراه کدهای انگلیسی ثبت شده و راهنمای توکن‌ها",
        responses={200: SMSPatternSerializer(many=True)}
    )
    def get(self, request):
        setting = KavenegarSMSSetting.objects.first()
        if not setting:
            setting = KavenegarSMSSetting.objects.create(name="سامانه پیامک هوشمند آذرخش")

        # همگام‌سازی و اطمینان از وجود تمام ۱۳ بخش پترن در دیتابیس
        existing = {p.name_fa: p for p in SMSPattern.objects.filter(sms_setting=setting)}
        patterns_data = []

        tokens_guide = {
            'otp': 'token: کد تایید ۵ رقمی ورود',
            'welcome': 'token: نام و نام خانوادگی مشتری',
            'logout': 'token: نام مشتری',
            'app_download_link': 'token: عنوان اپ | token20: لینک دانلود',
            'pos_receipt': 'token: شماره فاکتور | token2: نام مشتری | token3: مبلغ کل',
            'pos_partial_payment': 'token: شماره فاکتور | token2: نام مشتری | token3: باقیمانده',
            'pos_refund_receipt': 'token: شماره مرجع | token2: نام مشتری | token3: مبلغ عودتی',
            'pos_daily_report': 'token: تاریخ | token2: تعداد فاکتور | token3: جمع کل فروش',
            'order_registered': 'token: شماره سفارش | token2: مبلغ کل فاکتور',
            'order_shipped': 'token: شماره سفارش | token2: نام باربری | token3: کد رهگیری',
            'cheque_due_reminder': 'token: شماره چک | token2: سررسید | token3: مبلغ چک',
            'debt_overdue_alert': 'token: مبلغ بدهی | token2: تعداد روز تاخیر',
            'account_blocked_alert': 'token: علت مسدودی حساب دفتری'
        }

        for sec_key, sec_title in PATTERN_SECTIONS:
            pat = existing.get(sec_key)
            if not pat:
                pat = SMSPattern.objects.create(sms_setting=setting, name_fa=sec_key, pattern_code='')
            
            patterns_data.append({
                'id': pat.id,
                'name_fa': sec_key,
                'title_fa': sec_title,
                'pattern_code': pat.pattern_code,
                'tokens_info': tokens_guide.get(sec_key, 'token, token2, token3'),
                'is_active': bool(pat.pattern_code)
            })

        return Response({'status': 'success', 'data': patterns_data}, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['پنل پیامک کاوه‌نگار'],
        summary="ذخیره کد پترن انگلیسی",
        description="تخصیص یا ویرایش کد پترن (Template Name) دریافت شده از پنل کاوه‌نگار برای یک یا چند بخش در دیتابیس آذرخش",
        responses={200: SMSPatternSerializer}
    )
    def post(self, request):
        patterns_data = request.data.get('patterns')
        
        setting = KavenegarSMSSetting.objects.first()
        if not setting:
            setting = KavenegarSMSSetting.objects.create(name="سامانه پیامک هوشمند آذرخش")

        if patterns_data and isinstance(patterns_data, list):
            # حالت ذخیره گروهی (Bulk Save)
            for p_item in patterns_data:
                name_fa = p_item.get('name_fa')
                pattern_code = p_item.get('pattern_code', '').strip()
                if name_fa:
                    SMSPattern.objects.update_or_create(
                        sms_setting=setting, 
                        name_fa=name_fa, 
                        defaults={'pattern_code': pattern_code}
                    )
            return Response({
                'status': 'success',
                'message': 'تمامی پترن‌ها با موفقیت به‌روزرسانی شدند.'
            }, status=status.HTTP_200_OK)

        # حالت ذخیره تک موردی
        name_fa = request.data.get('name_fa')
        pattern_code = request.data.get('pattern_code', '').strip()

        if not name_fa:
            return Response({'status': 'error', 'message': 'نام بخش پترن الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

        pattern_obj, _ = SMSPattern.objects.get_or_create(sms_setting=setting, name_fa=name_fa)
        pattern_obj.pattern_code = pattern_code
        pattern_obj.save()

        return Response({
            'status': 'success',
            'message': f"کد پترن برای بخش '{name_fa}' با موفقیت ذخیره شد."
        }, status=status.HTTP_200_OK)


class SMSLogsAPIView(APIView):
    """
    دریافت لاگ و تاریخچه پیامک‌های ثبت‌شده در دیتابیس برای پنل پایش پیامک آذرخش
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['پنل پیامک کاوه‌نگار'],
        summary="گزارش پیامک‌های ارسالی",
        description="لیست ۱۰۰ پیامک اخیر ارسال شده به همراه وضعیت دلیوری، هزینه و توکن‌های استفاده شده",
        responses={200: SmsLogSerializer(many=True)}
    )
    def get(self, request):
        logs = SmsLog.objects.select_related('pattern').order_by('-created_at')[:100]
        serializer = SmsLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SendPatternSMSAPIView(APIView):
    """
    ارسال پیامک پترن داینامیک از سمت فرانت‌اند یا ماژول‌های فروش و انبار
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['پنل پیامک کاوه‌نگار'],
        summary="ارسال دستی/سیستمی پیامک پترن",
        description="ارسال پیامک با استفاده از پترن‌های خدماتی از هر نقطه سامانه و ثبت خودکار در جدول لاگ دیتابیس",
        responses={200: SmsLogSerializer}
    )
    def post(self, request):
        recipient = request.data.get('recipient_phone') or request.data.get('phone')
        pattern_name = request.data.get('pattern_name') or request.data.get('template')
        token = request.data.get('token')
        token2 = request.data.get('token2')
        token3 = request.data.get('token3')

        if not recipient or not pattern_name or not token:
            return Response({
                'status': 'error',
                'message': 'شماره گیرنده، نام الگو و متغیر توکن ۱ الزامی هستند.'
            }, status=status.HTTP_400_BAD_REQUEST)

        success, msg = KavenegarService.send_pattern_sms(
            receptor=recipient,
            token=token,
            action_type=pattern_name,
            token2=token2,
            token3=token3
        )

        if success:
            return Response({'status': 'success', 'message': msg}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'error', 'message': msg}, status=status.HTTP_400_BAD_REQUEST)


class SendOtpAPIView(APIView):
    """
    ارسال کد تایید ورود دو مرحله‌ای (OTP) برای کاربران آذرخش
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['پنل پیامک کاوه‌نگار'],
        summary="ارسال کد تایید (OTP)",
        description="تولید کد ۵ رقمی تصادفی و ارسال به شماره همراه کاربر از طریق درگاه وب‌سرویس پترن کاوه‌نگار",
        responses={200: SmsLogSerializer}
    )
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
