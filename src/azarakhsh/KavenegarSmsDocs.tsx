import React from 'react';
import { MessageSquare } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const KavenegarSmsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'kavenegar_sms_kavenegarsmssetting',
      verboseName: 'تنظیمات سامانه پیامکی کاوهنگار',
      description: 'جدول اصلی تنظیمات توکن API کاوه‌نگار و نام سامانه پیامکی آذرخش',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'name', type: 'CharField(max_length=100)', verbose: 'نام سامانه' },
        { name: 'api_token', type: 'TextField(max_length=500)', verbose: 'API Token درگاه کاوه‌نگار' },
      ]
    },
    {
      name: 'kavenegar_sms_smspattern',
      verboseName: 'پترن‌های پیامک اعتبارسنجی',
      description: 'ثبت و تناظر پترن‌های خدماتی فعال در پنل کاوه‌نگار با بخش‌های درخواستی سامانه',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'sms_setting_id', type: 'ForeignKey(KavenegarSMSSetting)', isFk: true, fkTarget: 'kavenegar_sms_kavenegarsmssetting', verbose: 'سامانه مربوطه' },
        { name: 'name_fa', type: 'CharField(choices: otp, welcome, logout, app_download_link, pos_receipt, pos_partial_payment, pos_refund_receipt, pos_daily_report, order_registered, order_shipped, cheque_due_reminder, debt_overdue_alert, account_blocked_alert)', verbose: 'بخش مربوطه (نام فارسی پترن)' },
        { name: 'pattern_code', type: 'CharField(max_length=100)', verbose: 'کد پترن (نام انگلیسی)' },
      ]
    },
    {
      name: 'kavenegar_sms_smslog',
      verboseName: 'لاگ پیامک‌های ارسالی',
      description: 'ثبت و تاریخچه پیامک‌های ارسال شده به مشتریان به همراه شناسه پیامک کاوه‌نگار و وضعیت تحویل دلیوری',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'recipient_phone', type: 'CharField(max_length=15)', verbose: 'شماره گیرنده' },
        { name: 'pattern_id', type: 'ForeignKey(SMSPattern)', isFk: true, fkTarget: 'kavenegar_sms_smspattern', verbose: 'پترن مربوطه' },
        { name: 'tokens_sent', type: 'JSONField', verbose: 'توکن‌های ارسالی' },
        { name: 'kavenegar_message_id', type: 'CharField(max_length=40)', verbose: 'شناسه پیامک کاوه‌نگار' },
        { name: 'status', type: 'CharField(choices: queued, sent, delivered, failed)', verbose: 'وضعیت تحویل' },
        { name: 'cost_rial', type: 'PositiveIntegerField', verbose: 'هزینه پیامک (ریال)' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'زمان ارسال' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/sms/settings/',
      auth: 'IsAdminUser / HasSMSPermission',
      description: 'دریافت تنظیمات فعلی درگاه وب‌سرویس کاوه‌نگار از جدول KavenegarSMSSetting در دیتابیس جنگو',
      responseBody: JSON.stringify({
        status: "success",
        data: {
          id: 1,
          name: "سامانه پیامک هوشمند دخانیات سرو و آذرخش",
          api_token: "6A3961347847424C655845...",
          is_active: true,
          debug_mode: false
        }
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/sms/settings/',
      auth: 'IsAdminUser',
      description: 'ذخیره و به‌روزرسانی تنظیمات و کلید API درگاه کاوه‌نگار در پایگاه‌داده جنگو',
      requestBody: JSON.stringify({
        name: "سامانه پیامک هوشمند آذرخش",
        api_token: "6A3961347847424C655845...",
        is_active: true,
        debug_mode: false
      }, null, 2),
      responseBody: JSON.stringify({
        status: "success",
        message: "تنظیمات درگاه کاوه‌نگار با موفقیت ذخیره شد."
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/sms/patterns/',
      auth: 'IsAdminUser',
      description: 'دریافت لیست تمام ۱۳ پترن خدماتی تعریف‌شده در دیتابیس به همراه کدهای پترن انگلیسی تنظیم‌شده',
      responseBody: JSON.stringify({
        status: "success",
        data: [
          {
            id: 1,
            name_fa: "pos_receipt",
            title_fa: "صدور رسید خرید نقدی/کارتخوان حضوری",
            pattern_code: "pos_receipt_template",
            tokens_info: "token: شناسه فاکتور | token2: نام مشتری | token3: مبلغ کل",
            is_active: true
          },
          {
            id: 2,
            name_fa: "welcome",
            title_fa: "خوش‌آمدگویی به کاربران پس از لاگین اول",
            pattern_code: "welcome_user_pattern",
            tokens_info: "token: نام و نام‌خانوادگی",
            is_active: true
          }
        ]
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/sms/patterns/save/',
      auth: 'IsAdminUser',
      description: 'ثبت و اختصاص کد پترن انگلیسی کاوه‌نگار برای هر بخش در جدول SMSPattern',
      requestBody: JSON.stringify({
        name_fa: "pos_receipt",
        pattern_code: "pos_receipt_template"
      }, null, 2),
      responseBody: JSON.stringify({
        status: "success",
        message: "کد پترن با موفقیت ذخیره شد."
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/sms/logs/',
      auth: 'IsAdminUser',
      description: 'دریافت تاریخچه و وضعیت دلیوری (تحویل) کل پیامک‌های صادر شده از سیستم جهت پایش هزینه‌ها و تطابق با پنل ادمین',
      responseBody: JSON.stringify([
        {
          id: 42,
          recipient_phone: "09121112233",
          pattern: "صدور رسید خرید نقدی/کارتخوان حضوری",
          pattern_code: "pos_receipt_template",
          tokens_sent: {
            receptor: "09121112233",
            token: "POS-14030604-0012",
            token2: "امیرعلی_محمدی",
            token3: "12500000"
          },
          kavenegar_message_id: "8871654392",
          status: "delivered",
          cost_rial: 240,
          created_at: "2026-08-29T19:07:13Z"
        }
      ], null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/sms/send-pattern/',
      auth: 'IsAuthenticated',
      description: 'ارسال پیامک با قالب‌های وب‌سرویس پترن و ذخیره خودکار لاگ در جدول SmsLog',
      requestBody: JSON.stringify({
        recipient_phone: "09121112233",
        pattern_name: "pos_receipt",
        token: "POS-14030604-0012",
        token2: "امیرعلی_محمدی",
        token3: "12500000_تومان"
      }, null, 2),
      responseBody: JSON.stringify({
        status: "success",
        message: "پیامک با قالب وب‌سرویس با موفقیت ارسال و در دیتابیس ذخیره شد."
      }, null, 2)
    }
  ];

  const modelsCode = `from django.db import models


PATTERN_SECTIONS = [
    ('otp', 'ارسال کد تایید ورود (OTP)'),
    ('welcome', 'خوشآمدگویی به کاربران پس از اولین لاگین'),
    ('logout', 'خروج کاربر از حساب کاربری'),
    ('app_download_link', 'ارسال لینک دانلود و نصب اپلیکیشن'),
    ('pos_receipt', 'صدور رسید خرید نقدی/کارتخوان حضوری'),
    ('pos_partial_payment', 'ثبت پرداخت علی‌الحساب/ثبت دریافتی جدید صندوق'),
    ('pos_refund_receipt', 'صدور رسید مرجوعی کالا و برگشت وجه صندوق'),
    ('pos_daily_report', 'ارسال گزارش فروش روزانه صندوق به مدیران'),
    ('order_registered', 'ثبت سفارش عمده و صدور پیش‌فاکتور'),
    ('order_shipped', 'تحویل سفارش به باربری و ارسال بار'),
    ('cheque_due_reminder', 'یادآوری سررسید چک صیادی مشتری'),
    ('debt_overdue_alert', 'هشدار تاخیر در تسویه بدهی دفتری (نسیه)'),
    ('account_blocked_alert', 'هشدار مسدود شدن حساب دفتری مشتری'),
]


class KavenegarSMSSetting(models.Model):
    name = models.CharField(max_length=100, verbose_name="نام سامانه")
    api_token = models.TextField(max_length=500, verbose_name="API Token")

    class Meta:
        verbose_name = "تنظیمات سامانه پیامکی کاوهنگار"
        verbose_name_plural = "تنظیمات سامانه پیامکی کاوهنگار"

    def __str__(self):
        return self.name


class SMSPattern(models.Model):
    sms_setting = models.ForeignKey(
        KavenegarSMSSetting,
        on_delete=models.CASCADE,
        related_name='patterns',
        verbose_name="سامانه مربوطه"
    )
    name_fa = models.CharField(
        max_length=100,
        choices=PATTERN_SECTIONS,
        verbose_name="بخش مربوطه (نام فارسی پترن)",
        help_text="انتخاب کنید این پترن برای کدام بخش از سامانه استفاده میشود."
    )
    pattern_code = models.CharField(
        max_length=100,
        verbose_name="کد پترن (نام انگلیسی)",
        help_text="میتوانید وارد سامانه کاوه نگار شده و در قسمت اعتبارسنجی، پترن خود را ایجاد کرده و سپس کد آن را اینجا وارد کنید."
    )

    class Meta:
        verbose_name = "پترن پیامک"
        verbose_name_plural = "پترنهای پیامک"
        unique_together = ('sms_setting', 'name_fa')

    def __str__(self):
        return f"{self.get_name_fa_display()} - {self.pattern_code}"


class SmsLog(models.Model):
    class DeliveryStatus(models.TextChoices):
        QUEUED = 'queued', 'در صف ارسال'
        SENT = 'sent', 'ارسال‌شده به مخابرات'
        DELIVERED = 'delivered', 'رسیده به گوشی مشتری'
        FAILED = 'failed', 'خطا در ارسال'

    recipient_phone = models.CharField(max_length=15, db_index=True, verbose_name="شماره گیرنده")
    pattern = models.ForeignKey(
        SMSPattern,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='logs',
        verbose_name="پترن مربوطه"
    )
    tokens_sent = models.JSONField(default=dict, verbose_name="توکن‌های ارسالی")
    kavenegar_message_id = models.CharField(max_length=40, blank=True, verbose_name="شناسه پیامک کاوه‌نگار")
    status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.QUEUED, verbose_name="وضعیت تحویل")
    cost_rial = models.PositiveIntegerField(default=0, verbose_name="هزینه پیامک (ریال)")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name="زمان ارسال")

    class Meta:
        verbose_name = "لاگ پیامک ارسالی"
        verbose_name_plural = "لاگ و تاریخچه پیامک‌ها"
        ordering = ['-created_at']

    def __str__(self):
        return f"پیامک به {self.recipient_phone} | {self.get_status_display()}"
`;

  const adminCode = `"""
kavenegar_sms/admin.py
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import KavenegarSMSSetting, SMSPattern, SmsLog


class SMSPatternInline(admin.TabularInline):
    model = SMSPattern
    extra = 1


@admin.register(KavenegarSMSSetting)
class KavenegarSMSSettingAdmin(admin.ModelAdmin):
    list_display = ('name', 'api_token_preview')
    inlines = [SMSPatternInline]

    def api_token_preview(self, obj):
        if obj.api_token:
            return f"{obj.api_token[:30]}..."
        return "-"
    api_token_preview.short_description = "API Token"


@admin.register(SmsLog)
class SmsLogAdmin(admin.ModelAdmin):
    list_display = ('shamsi_created_at', 'recipient_phone', 'pattern', 'kavenegar_message_id', 'status_badge')
    list_filter = ('status', 'pattern', 'created_at')
    search_fields = ('recipient_phone', 'kavenegar_message_id')
    readonly_fields = ('created_at', 'shamsi_created_at', 'tokens_sent', 'kavenegar_message_id')

    def shamsi_created_at(self, obj):
        if not obj.created_at:
            return "-"
        from django.utils import timezone
        local_dt = timezone.localtime(obj.created_at)
        gy, gm, gd = local_dt.year, local_dt.month, local_dt.day
        g_a = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 335]
        g_dy = gd + g_a[gm]
        if (gy % 4 == 0) and gm > 2:
            g_dy += 1
        if g_dy <= 79:
            if (gy - 1) % 4 == 0:
                g_dy += 1
            g_dy += 286
            jy = gy - 622
        else:
            g_dy -= 79
            jy = gy - 621
        if g_dy <= 186:
            jm = 1 + (g_dy - 1) // 31
            jd = 1 + (g_dy - 1) % 31
        else:
            g_dy -= 186
            jm = 7 + (g_dy - 1) // 30
            jd = 1 + (g_dy - 1) % 30
        return f"{jy}/{jm:02d}/{jd:02d} - {local_dt.strftime('%H:%M:%S')}"
    shamsi_created_at.short_description = "زمان ارسال (شمسی)"

    def status_badge(self, obj):
        colors = {'queued': '#64748b', 'sent': '#3b82f6', 'delivered': '#10b981', 'failed': '#ef4444'}
        return format_html(
            f'<span style="background-color: {colors.get(obj.status, "#64748b")}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">'
            f'{obj.get_status_display()}</span>'
        )
    status_badge.short_description = "وضعیت"
`;

  const serializersCode = `"""
kavenegar_sms/serializers.py
"""
from rest_framework import serializers
from .models import KavenegarSMSSetting, SMSPattern, SmsLog


class SMSPatternSerializer(serializers.ModelSerializer):
    name_fa_display = serializers.CharField(source='get_name_fa_display', read_only=True)

    class Meta:
        model = SMSPattern
        fields = '__all__'


class KavenegarSMSSettingSerializer(serializers.ModelSerializer):
    patterns = SMSPatternSerializer(many=True, read_only=True)

    class Meta:
        model = KavenegarSMSSetting
        fields = '__all__'


class SmsLogSerializer(serializers.ModelSerializer):
    pattern_name = serializers.CharField(source='pattern.get_name_fa_display', read_only=True)

    class Meta:
        model = SmsLog
        fields = '__all__'
`;

  const viewsCode = `"""
kavenegar_sms/views.py
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
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

        # ایجاد لاگ اولیه به صورت پیش‌فرض در صف
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
    دریافت و ذخیره‌سازی تنظیمات درگاه کاوه‌نگار در دیتابیس
    """
    permission_classes = [IsAuthenticated]

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

    def post(self, request):
        name = request.data.get('name', 'سامانه پیامک کاوه‌نگار')
        api_token = request.data.get('api_token', '').strip()

        setting, _ = KavenegarSMSSetting.objects.get_or_create(id=1)
        setting.name = name
        if api_token:
            setting.api_token = api_token
        setting.save()

        return Response({
            'status': 'success',
            'message': 'تنظیمات درگاه کاوه‌نگار با موفقیت ذخیره شد.'
        }, status=status.HTTP_200_OK)


class SMSPatternListSaveAPIView(APIView):
    """
    دریافت لیست الگوها و ثبت کد پترن انگلیسی برای هر بخش
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        setting = KavenegarSMSSetting.objects.first()
        if not setting:
            setting = KavenegarSMSSetting.objects.create(name="سامانه پیامک هوشمند آذرخش")

        # همگام‌سازی و اطمینان از وجود تمام ۱۳ بخش پترن
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

    def post(self, request):
        name_fa = request.data.get('name_fa')
        pattern_code = request.data.get('pattern_code', '').strip()

        if not name_fa:
            return Response({'status': 'error', 'message': 'نام بخش پترن الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

        setting = KavenegarSMSSetting.objects.first()
        if not setting:
            setting = KavenegarSMSSetting.objects.create(name="سامانه پیامک هوشمند آذرخش")

        pattern_obj, _ = SMSPattern.objects.get_or_create(sms_setting=setting, name_fa=name_fa)
        pattern_obj.pattern_code = pattern_code
        pattern_obj.save()

        return Response({
            'status': 'success',
            'message': f"کد پترن برای بخش '{name_fa}' با موفقیت ذخیره شد."
        }, status=status.HTTP_200_OK)


class SMSLogsAPIView(APIView):
    """
    دریافت لاگ و تاریخچه پیامک‌های ثبت‌شده در دیتابیس برای پنل مدیریت
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = SmsLog.objects.select_related('pattern').order_by('-created_at')[:100]
        serializer = SmsLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SendPatternSMSAPIView(APIView):
    """
    ارسال پیامک پترن داینامیک از سمت فرانت‌اند یا ماژول‌های حسابداری
    """
    permission_classes = [IsAuthenticated]

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
`;

  const urlsCode = `"""
kavenegar_sms/urls.py
"""
from django.urls import path
from .views import (
    KavenegarSMSSettingAPIView,
    SMSPatternListSaveAPIView,
    SMSLogsAPIView,
    SendPatternSMSAPIView,
    SendOtpAPIView
)

app_name = 'kavenegar_sms'

urlpatterns = [
    # تنظیمات وب‌سرویس و کلید درگاه
    path('settings/', KavenegarSMSSettingAPIView.as_view(), name='sms-settings'),
    
    # مدیریت و ذخیره پترن‌های انگلیسی
    path('patterns/', SMSPatternListSaveAPIView.as_view(), name='sms-patterns-list'),
    path('patterns/save/', SMSPatternListSaveAPIView.as_view(), name='sms-pattern-save'),
    
    # لاگ‌های دیتابیس پیامک
    path('logs/', SMSLogsAPIView.as_view(), name='sms-logs'),
    
    # ارسال پیامک با پترن
    path('send-pattern/', SendPatternSMSAPIView.as_view(), name='sms-send-pattern'),
    
    # ارسال OTP
    path('send-otp/', SendOtpAPIView.as_view(), name='sms-send-otp'),
]
`;

  const servicesCode = `"""
kavenegar_sms/sms.py
سرویس‌های مرکزی ارسال پیامک از طریق وب‌سرویس پترن کاوه‌نگار (Kavenegar SDK)
همراه با ذخیره‌سازی خودکار لاگ‌ها در جدول SmsLog
"""
import traceback
import logging
from kavenegar import KavenegarAPI, APIException, HTTPException
from .models import KavenegarSMSSetting, SMSPattern, SmsLog  # در صورت لزوم مسیر ایمپورت را بر اساس ساختار پروژه خود تغییر دهید

logger = logging.getLogger(__name__)


def _send_lookup_sms(phone_number, pattern_section, token_value, token2_value=None, token3_value=None, token20_value=None):
    """
    تابع هسته برای ارسال پیامک پترن از طریق SDK کاوه‌نگار و ثبت لاگ تحویل
    """
    # ۱. خواندن تنظیمات درگاه کاوه‌نگار
    api_setting = KavenegarSMSSetting.objects.first()
    if not api_setting:
        logger.error("KavenegarSMSSetting not found in database.")
        print("========== SMS ERROR: KavenegarSMSSetting not found ==========")
        return False

    # ۲. پیدا کردن پترن فعال مربوط به بخش مورد نظر
    pattern_obj = SMSPattern.objects.filter(
        sms_setting=api_setting,
        name_fa=pattern_section
    ).first()

    if not pattern_obj:
        logger.error(f"SMSPattern for section '{pattern_section}' not found in database.")
        print(f"========== SMS ERROR: SMSPattern for section '{pattern_section}' not found ==========")
        return False

    # ۳. آماده‌سازی پارامترهای وب‌سرویس
    params = {
        "receptor": str(phone_number),
        "template": pattern_obj.pattern_code,
        "type": "sms",
        "token": str(token_value),
    }

    if token2_value is not None:
        params["token2"] = str(token2_value)
    if token3_value is not None:
        params["token3"] = str(token3_value)
    if token20_value is not None:
        params["token20"] = str(token20_value)

    # ۴. ایجاد لاگ اولیه به صورت پیش‌فرض در صف (queued)
    log_record = SmsLog.objects.create(
        recipient_phone=str(phone_number),
        pattern=pattern_obj,
        tokens_sent=params,
        status='queued'
    )

    try:
        # ۵. ارسال درخواست به کاوه‌نگار از طریق SDK رسمی
        api = KavenegarAPI(api_setting.api_token)
        print(f"========== KAVENEGAR REQUEST [{pattern_section}] ==========")
        print(params)
        
        response = api.verify_lookup(params)
        
        print("========== KAVENEGAR RESPONSE ==========")
        print(response)
        print("=====================================")

        # ۶. آپدیت لاگ با موفقیت ارسال
        if isinstance(response, list) and len(response) > 0:
            entry = response[0]
            log_record.kavenegar_message_id = str(entry.get('messageid', ''))
            log_record.cost_rial = entry.get('cost', 0)
        elif isinstance(response, dict):
            log_record.kavenegar_message_id = str(response.get('messageid', ''))
            log_record.cost_rial = response.get('cost', 0)

        log_record.status = 'delivered'
        log_record.save()
        return True

    except APIException as e:
        logger.error(f"Kavenegar APIException: {str(e)}")
        print("========== Kavenegar APIException ==========")
        print(str(e))
        traceback.print_exc()
        print("===========================================")
        log_record.status = 'failed'
        log_record.save()
        return False

    except HTTPException as e:
        logger.error(f"Kavenegar HTTPException: {str(e)}")
        print("========== Kavenegar HTTPException ==========")
        print(str(e))
        traceback.print_exc()
        print("============================================")
        log_record.status = 'failed'
        log_record.save()
        return False

    except Exception as e:
        logger.error(f"Kavenegar Unknown Error: {str(e)}")
        print("========== SMS UNKNOWN ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        traceback.print_exc()
        print("=======================================")
        log_record.status = 'failed'
        log_record.save()
        return False


# ----------------- توابع کمکی سطح بالا برای فراخوانی راحت در تمام بخش‌های سیستم -----------------

def send_otp_sms(phone_number, code):
    """
    ۱. ارسال کد تایید ورود (OTP)
    """
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='otp',
        token_value=code
    )


def send_welcome_sms(phone_number, full_name):
    """
    ۲. خوشآمدگویی به کاربران جدید پس از لاگین اول
    """
    clean_name = str(full_name).strip().replace(" ", "") or "کاربر"
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='welcome',
        token_value=clean_name
    )


def send_logout_sms(phone_number, full_name):
    """
    ۳. ارسال پیامک خروج کاربر از حساب کاربری
    """
    clean_name = str(full_name).strip().replace(" ", "") or "کاربر"
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='logout',
        token_value=clean_name
    )


def send_app_download_sms(phone_number, download_url):
    """
    ۴. ارسال لینک دانلود و نصب اپلیکیشن
    """
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='app_download_link',
        token_value="اپلیکیشن_آذرخش",
        token20_value=download_url
    )


def send_pos_receipt_sms(phone_number, amount_rial, invoice_id):
    """
    ۵. صدور و ارسال رسید خرید نقدی/کارتخوان حضوری صندوق
    """
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='pos_receipt',
        token_value=invoice_id,
        token2_value=amount_rial
    )


def send_pos_partial_payment_sms(phone_number, received_amount, remaining_debt):
    """
    ۶. ثبت پرداخت علی‌الحساب/دریافتی جدید صندوق
    """
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='pos_partial_payment',
        token_value=received_amount,
        token2_value=remaining_debt
    )


def send_pos_refund_receipt_sms(phone_number, refund_amount, invoice_id):
    """
    ۷. صدور رسید مرجوعی کالا و برگشت وجه صندوق
    """
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='pos_refund_receipt',
        token_value=invoice_id,
        token2_value=refund_amount
    )


def send_pos_daily_report_sms(phone_number, total_sales, total_cash, total_pos):
    """
    ۸. ارسال گزارش فروش روزانه صندوق به مدیران ارشد
    """
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='pos_daily_report',
        token_value=total_sales,
        token2_value=total_cash,
        token3_value=total_pos
    )


def send_order_registered_sms(phone_number, order_id, total_amount):
    """
    ۹. ثبت سفارش عمده و صدور پیش‌فاکتور برای خریداران عمده
    """
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='order_registered',
        token_value=order_id,
        token2_value=total_amount
    )


def send_order_shipped_sms(phone_number, order_id, shipping_carrier, tracking_code):
    """
    ۱۰. تحویل سفارش به باربری و ارسال کدرهگیری بار به مشتری
    """
    clean_carrier = str(shipping_carrier).strip().replace(" ", "_")
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='order_shipped',
        token_value=order_id,
        token2_value=clean_carrier,
        token3_value=tracking_code
    )


def send_cheque_due_reminder_sms(phone_number, cheque_number, due_date, amount_rial):
    """
    ۱۱. یادآوری خودکار سررسید چک صیادی مشتری
    """
    clean_date = str(due_date).replace("/", "-").replace(" ", "")
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='cheque_due_reminder',
        token_value=cheque_number,
        token2_value=clean_date,
        token3_value=amount_rial
    )


def send_debt_overdue_alert_sms(phone_number, amount_rial, overdue_days):
    """
    ۱۲. هشدار تاخیر در تسویه بدهی دفتری (نسیه)
    """
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='debt_overdue_alert',
        token_value=amount_rial,
        token2_value=overdue_days
    )


def send_account_blocked_alert_sms(phone_number, block_reason="تجاوز_از_سقف_اعتبار"):
    """
    ۱۳. هشدار مسدود شدن حساب دفتری مشتری به دلیل بدهی
    """
    clean_reason = str(block_reason).strip().replace(" ", "_")
    return _send_lookup_sms(
        phone_number=phone_number,
        pattern_section='account_blocked_alert',
        token_value=clean_reason
    )
`;

  const notesCode = `## 📌 راهنمای پترن‌های پیامکی داینامیک

### ⚙️ چرا سیستم داینامیک شد؟
به جای هاردکد کردن اطلاعات پترن‌ها در سورس‌کد، از این پس می‌توانید مستقیماً از داخل پنل مدیریت جنگو:
1. چند سامانه یا خط با توکن‌های مجزا تعریف کنید.
2. پترن‌های دلخواه کاوه‌نگار مانند کد تایید (otp)، خوشآمدگویی (welcome) و خروج (logout) را به صورت رکورد ذخیره کرده و به سامانه نسبت دهید.
3. متد ارسال پترن به صورت کاملاً پویا و با توجه به دیتابیس هوشمند عمل خواهد کرد.
`;

  return (
    <AppDocTemplate
      appFolder="kavenegar_sms"
      title="سرویس پیامک کاوه‌نگار (Kavenegar SMS Service)"
      titleEn="kavenegar_sms / Kavenegar OTP & Pattern Gateway App"
      badge="Kavenegar • Dynamic Setup • Pattern API"
      description="تنظیمات داینامیک وب‌سرویس پیامکی کاوه‌نگار به همراه پترن‌های اعتبارسنجی (Lookup) برای ارسال سریع کدهای OTP، خوشآمدگویی و خروج کاربران."
      icon={<MessageSquare className="w-6 h-6 text-indigo-500" />}
      modelsCode={modelsCode}
      adminCode={adminCode}
      serializersCode={serializersCode}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      servicesCode={servicesCode}
      servicesFileName="sms.py"
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
