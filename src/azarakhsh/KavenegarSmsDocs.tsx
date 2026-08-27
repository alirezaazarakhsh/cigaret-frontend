import React from 'react';
import { MessageSquare } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const KavenegarSmsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'sms_smstemplate',
      verboseName: 'الگوهای تاییدشده وب‌سرویس پترن کاوه‌نگار (Lookup OTP)',
      description: 'تعریف قالب‌های پیامک خدماتی بدون بلاک بلک‌لیست مخابراتی (کد ورود OTP، صدور فاکتور، سررسید چک، هشدار نسیه)',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'template_type', type: 'CharField(max_length=40)', isUnique: true, verbose: 'نوع رویداد (otp_login, order_created, cheque_due, debt_warning)' },
        { name: 'kavenegar_pattern_name', type: 'CharField(max_length=60)', verbose: 'نام پترن در پنل کاوه‌نگار (مثلا: azarakhsh-otp)' },
        { name: 'template_body', type: 'TextField', verbose: 'متن نمونه پترن با توکن‌های %token و %token2' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'فعال' },
      ]
    },
    {
      name: 'sms_smslog',
      verboseName: 'لاگ و آرشیو پیامک‌های ارسالی با پیام‌رسان کاوه‌نگار',
      description: 'ثبت کد رهگیری پیامک MessageID کاوه‌نگار، هزینه ریالی، وضعیت دلیوری و شماره موبایل گیرنده',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'recipient_phone', type: 'CharField(max_length=15)', verbose: 'شماره موبایل گیرنده' },
        { name: 'template_id', type: 'ForeignKey(SmsTemplate)', isFk: true, fkTarget: 'sms_smstemplate', verbose: 'الگوی پیامک' },
        { name: 'tokens_sent', type: 'JSONField', verbose: 'پارامترهای ارسالی (Token1, Token2)' },
        { name: 'kavenegar_message_id', type: 'CharField(max_length=40)', verbose: 'شناسه پیامک کاوه‌نگار (MessageID)' },
        { name: 'status', type: 'CharField(choices: queued, sent, delivered, failed)', verbose: 'وضعیت تحویل' },
        { name: 'cost_rial', type: 'PositiveIntegerField(default=0)', verbose: 'هزینه پیامک (ریال)' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'زمان ارسال' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/sms/send-otp/',
      auth: 'AllowAny',
      description: 'ارسال کد تایید ۵ رقمی ورود به سامانه با وب‌سرویس پترن و اعتبارسنجی کاوه‌نگار (تحویل زیر ۳ ثانیه و عبور از بلک‌لیست)',
      requestBody: JSON.stringify({ phone: "09121112233" }, null, 2),
      responseBody: JSON.stringify({
        success: true,
        message: "کد تایید پیامک شد.",
        expires_in_seconds: 120
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/sms/send-invoice-notification/',
      auth: 'IsAuthenticated (Admin / Pos)',
      description: 'ارسال پیامک صدور فاکتور خرید و شناسه رهگیری باربری برای مشتری'
    },
    {
      method: 'GET',
      path: '/api/v1/sms/kavenegar-account-balance/',
      auth: 'IsAdminUser',
      description: 'استعلام موجودی ریالی و شارژ باقی‌مانده پنل کاوه‌نگار از API رسمی'
    }
  ];

  const modelsCode = `"""
sms/models.py
مدل‌های مدیریت وب‌سرویس پیامک کاوه‌نگار (Kavenegar Gateway)، پترن‌های خدماتی OTP و لاگ تحویل
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class SmsTemplate(models.Model):
    class EventType(models.TextChoices):
        OTP_LOGIN = 'otp_login', _('کد تایید ورود OTP')
        ORDER_REGISTERED = 'order_created', _('ثبت سفارش جدید عمده')
        ORDER_SHIPPED = 'order_shipped', _('تحویل بار به باربری')
        POS_RECEIPT = 'pos_receipt', _('رسید فاکتور صندوق حضوری')
        CHEQUE_DUE_REMINDER = 'cheque_due', _('یادآوری سررسید چک صیادی')
        DEBT_OVERDUE = 'debt_overdue', _('هشدار تاخیر تسویه نسیه')

    template_type = models.CharField(_("نوع رویداد پیامک"), max_length=40, choices=EventType.choices, unique=True)
    kavenegar_pattern_name = models.CharField(_("نام قالب در پنل کاوه‌نگار"), max_length=60, help_text="نام Template تعریف‌شده در پنل کاوه‌نگار")
    template_body = models.TextField(_("متن نمونه الگو"), help_text="مثال: شرکت آذرخش؛ کد ورود شما: %token")
    is_active = models.BooleanField(_("فعال"), default=True)

    class Meta:
        verbose_name = _("الگوی پیامک کاوه‌نگار")
        verbose_name_plural = _("۱. الگوهای پترن وب‌سرویس کاوه‌نگار (Lookup)")

    def __str__(self):
        return f"{self.get_template_type_display()} ({self.kavenegar_pattern_name})"


class SmsLog(models.Model):
    class DeliveryStatus(models.TextChoices):
        QUEUED = 'queued', _('در صف ارسال')
        SENT = 'sent', _('ارسال‌شده به مخابرات')
        DELIVERED = 'delivered', _('رسیده به گوشی مشتری')
        FAILED = 'failed', _('خطا در ارسال')

    recipient_phone = models.CharField(_("شماره گیرنده"), max_length=15, db_index=True)
    template = models.ForeignKey(SmsTemplate, on_delete=models.SET_NULL, null=True, related_name='logs', verbose_name=_("الگو"))
    tokens_sent = models.JSONField(_("توکن‌های ارسالی"), default=dict)
    kavenegar_message_id = models.CharField(_("شناسه پیامک کاوه‌نگار (MessageID)"), max_length=40, blank=True)
    status = models.CharField(_("وضعیت تحویل"), max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.QUEUED)
    cost_rial = models.PositiveIntegerField(_("هزینه پیامک (ریال)"), default=0)
    created_at = models.DateTimeField(_("زمان ارسال"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("لاگ پیامک ارسالی")
        verbose_name_plural = _("۲. لاگ و تاریخچه پیامک‌های کاوه‌نگار")
        ordering = ['-created_at']

    def __str__(self):
        return f"پیامک به {self.recipient_phone} | {self.get_status_display()} ({self.created_at})"
`;

  const adminCode = `"""
sms/admin.py
پنل ادمین الگوها و لاگ‌های کاوه‌نگار
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import SmsTemplate, SmsLog


@admin.register(SmsTemplate)
class SmsTemplateAdmin(admin.ModelAdmin):
    list_display = ('template_type', 'kavenegar_pattern_name', 'is_active')
    list_editable = ('is_active',)


@admin.register(SmsLog)
class SmsLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'recipient_phone', 'template', 'kavenegar_message_id', 'status_badge')
    list_filter = ('status', 'template', 'created_at')
    search_fields = ('recipient_phone', 'kavenegar_message_id')
    readonly_fields = ('created_at', 'tokens_sent', 'kavenegar_message_id')

    def status_badge(self, obj):
        colors = {'queued': '#64748b', 'sent': '#3b82f6', 'delivered': '#10b981', 'failed': '#ef4444'}
        return format_html(
            f'<span style="background-color: {colors.get(obj.status, "#64748b")}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">'
            f'{obj.get_status_display()}</span>'
        )
    status_badge.short_description = "وضعیت"
`;

  const serializersCode = `"""
sms/serializers.py
"""
from rest_framework import serializers
from .models import SmsTemplate, SmsLog


class SmsTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmsTemplate
        fields = '__all__'


class SmsLogSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.get_template_type_display', read_only=True)

    class Meta:
        model = SmsLog
        fields = '__all__'
`;

  const viewsCode = `"""
sms/views.py
سرویس اتصال به وب‌سرویس پترن و OTP کاوه‌نگار (Kavenegar API Client)
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
import requests
import logging
from .models import SmsTemplate, SmsLog

logger = logging.getLogger(__name__)


class KavenegarService:
    """
    سرویس مرکزی کاوه‌نگار برای ارسال پیامک‌های پترن (Verify Lookup) و اطلاع‌رسانی
    """
    API_KEY = getattr(settings, 'KAVENEGAR_API_KEY', 'MOCK_API_KEY')
    BASE_URL = f"https://api.kavenegar.com/v1/{API_KEY}/verify/lookup.json"

    @classmethod
    def send_pattern_sms(cls, receptor: str, token: str, template_type: str, token2: str = None, token3: str = None):
        sms_template = SmsTemplate.objects.filter(template_type=template_type, is_active=True).first()
        pattern_name = sms_template.kavenegar_pattern_name if sms_template else template_type

        params = {
            'receptor': receptor,
            'token': token,
            'template': pattern_name
        }
        if token2:
            params['token2'] = token2
        if token3:
            params['token3'] = token3

        log_record = SmsLog.objects.create(
            recipient_phone=receptor,
            template=sms_template,
            tokens_sent=params,
            status=SmsLog.DeliveryStatus.QUEUED
        )

        try:
            # ارسال به سرور کاوه‌نگار
            response = requests.post(cls.BASE_URL, data=params, timeout=5)
            data = response.json()
            
            if response.status_code == 200 and data.get('return', {}).get('status') == 200:
                entry = data.get('entries', [{}])[0]
                log_record.kavenegar_message_id = str(entry.get('messageid', ''))
                log_record.cost_rial = entry.get('cost', 0)
                log_record.status = SmsLog.DeliveryStatus.SENT
                log_record.save()
                return True, log_record.kavenegar_message_id
            else:
                log_record.status = SmsLog.DeliveryStatus.FAILED
                log_record.save()
                return False, data.get('return', {}).get('message')
        except Exception as e:
            logger.error(f"Kavenegar SMS Error: {str(e)}")
            log_record.status = SmsLog.DeliveryStatus.FAILED
            log_record.save()
            return False, str(e)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_otp_view(request):
    phone = request.data.get('phone', '').strip()
    if not phone or len(phone) < 11:
        return Response({'error': 'شماره موبایل نامعتبر است.'}, status=status.HTTP_400_BAD_REQUEST)

    # تولید کد ۵ رقمی تصادفی
    import random
    otp_code = str(random.randint(10000, 99999))
    
    # فراخوانی وب‌سرویس پترن کاوه‌نگار
    success, msg = KavenegarService.send_pattern_sms(
        receptor=phone,
        token=otp_code,
        template_type=SmsTemplate.EventType.OTP_LOGIN
    )

    return Response({
        'success': True,
        'message': 'کد تایید پیامک شد.',
        'expires_in': 120
    })
`;

  const urlsCode = `"""
sms/urls.py
"""
from django.urls import path
from .views import send_otp_view

urlpatterns = [
    path('send-otp/', send_otp_view, name='sms-send-otp'),
]
`;

  return (
    <AppDocTemplate
      appFolder="sms"
      title="سرویس پیامک کاوه‌نگار (Kavenegar SMS Service)"
      titleEn="sms / Kavenegar OTP & Pattern Gateway App"
      badge="Kavenegar • Fast OTP • Pattern Lookup"
      description="سرویس پیامکی کاوه‌نگار بدون تاخیر و عبور از بلک‌لیست مخابرات (Lookup Pattern)، ارسال کد ورود OTP، تاییدیه فاکتور انبار و سررسید چک‌ها."
      icon={<MessageSquare className="w-6 h-6 text-emerald-500" />}
      modelsCode={modelsCode}
      adminCode={adminCode}
      serializersCode={serializersCode}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};

