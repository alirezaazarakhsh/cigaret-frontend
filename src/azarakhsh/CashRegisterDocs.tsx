import React from 'react';
import { BadgeDollarSign } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const CashRegisterDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'cash_register_dailyclose',
      verboseName: 'گزارشات تسویه و بستن صندوق روزانه (Z-Report)',
      description: 'سند رسمی مالی جهت قفل کردن فاکتورهای فروش روز، ثبت موجودی اول وقت، مقایسه شمارش واقعی با سیستم و محاسبه کسری/اضافی صندوق',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'register_code', type: 'CharField(max_length=50)', isUnique: true, verbose: 'کد پیگیری صندوق (CR-14030607-001)' },
        { name: 'cashier', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_customuser', verbose: 'صندوق‌دار مسئول' },
        { name: 'register_date', type: 'DateField', verbose: 'تاریخ شیفت' },
        { name: 'opened_at', type: 'DateTimeField', verbose: 'زمان شروع شیفت' },
        { name: 'closed_at', type: 'DateTimeField', verbose: 'زمان بستن و تسویه صندوق' },
        { name: 'opening_balance', type: 'BigIntegerField', verbose: 'موجودی تنخواه/کشو اول وقت (تومان)' },
        { name: 'system_cash_total', type: 'BigIntegerField', verbose: 'فروش نقدی محاسباتی سیستم' },
        { name: 'system_pos_total', type: 'BigIntegerField', verbose: 'فروش کارتخوان محاسباتی سیستم' },
        { name: 'system_credit_total', type: 'BigIntegerField', verbose: 'فروش نسیه محاسباتی سیستم' },
        { name: 'total_system_sales', type: 'BigIntegerField', verbose: 'جمع کل فروش محاسباتی سیستم' },
        { name: 'actual_cash_counted', type: 'BigIntegerField', verbose: 'پول نقد شمارش‌شده واقعی در کشو' },
        { name: 'actual_pos_counted', type: 'BigIntegerField', verbose: 'جمع کل رسیدهای کارتخوان' },
        { name: 'discrepancy', type: 'BigIntegerField', verbose: 'مغایرت صندوق (کسری/اضافه)' },
        { name: 'status', type: 'CharField(max_length=15)', verbose: 'وضعیت (open / closed)' },
        { name: 'notes', type: 'TextField', verbose: 'توضیحات و علت مغایرت' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/cash-register/current/',
      auth: 'IsAuthenticated',
      description: 'دریافت وضعیت شیفت جاری صندوق، موجودی اولیه و مجموع فروش زنده امروز بر اساس فاکتورها',
      responseBody: JSON.stringify({
        has_open_register: true,
        register_code: "CR-14030607-001",
        cashier_name: "علیرضا آذرخش (صندوق ۱)",
        opened_at: "2026-08-29T08:00:00Z",
        opening_balance: 500000,
        live_system_cash: 14200000,
        live_system_pos: 38500000,
        live_system_credit: 5000000,
        live_total_sales: 57700000
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/cash-register/open/',
      auth: 'IsAuthenticated',
      description: 'شروع شیفت جدید صندوق‌دار و ثبت موجودی اول وقت تنخواه کشو',
      requestBody: JSON.stringify({
        opening_balance: 500000,
        notes: "شروع شیفت صبح - صندوق اصلی شماره ۱"
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/cash-register/close/',
      auth: 'IsAuthenticated',
      description: 'تسویه و بستن صندوق (ذخیره قطعی گزارش روزانه در دیتابیس و محاسبه کسری/اضافه)',
      requestBody: JSON.stringify({
        actual_cash_counted: 14200000,
        actual_pos_counted: 38500000,
        notes: "رسیدهای پوز شمارش شد. با سیستم مطابق است."
      }, null, 2),
      responseBody: JSON.stringify({
        message: "گزارش تسویه صندوق با موفقیت در دیتابیس ذخیره شد.",
        register_code: "CR-14030607-001",
        status: "closed",
        closed_at: "2026-08-29T21:30:00Z",
        total_system_sales: 57700000,
        total_actual_counted: 52700000,
        discrepancy: 0,
        discrepancy_status: "بدون مغایرت"
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/cash-register/list/',
      auth: 'IsAdminUser',
      description: 'دریافت فهرست سوابق تمام گزارشات تسویه صندوق روزانه جهت حسابرسی انبار'
    },
    {
      method: 'GET',
      path: '/api/v1/cash-register/{id}/',
      auth: 'IsAdminUser',
      description: 'مشاهده جزئیات کامل یک گزارش تسویه صندوق روزانه خاص'
    }
  ];

  const modelsCode = `"""
cash_register/models.py
مدل دیتابیس ذخیره گزارش روزانه و تسویه صندوق (Z-Report)
"""
import uuid
from django.db import models
from django.conf import UserSettingsHolder, settings
from django.utils import timezone


class DailyCashRegister(models.Model):
    """
    مدل اصلی ذخیره قطعی سند تسویه روزانه صندوق در دیتابیس
    """
    STATUS_CHOICES = [
        ('open', 'در حال فروش (شیفت باز)'),
        ('closed', 'بسته شده و تسویه‌شده'),
    ]

    register_code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="کد پیگیری صندوق"
    )
    cashier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='cash_registers',
        verbose_name="صندوق‌دار"
    )
    register_date = models.DateField(
        default=timezone.now,
        verbose_name="تاریخ شیفت"
    )
    opened_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="زمان شروع شیفت"
    )
    closed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="زمان بستن صندوق"
    )

    # مبالغ محاسباتی سیستم (بر اساس فاکتورهای صادر شده)
    opening_balance = models.BigIntegerField(
        default=0,
        verbose_name="موجودی اول وقت کشو (تومان)"
    )
    system_cash_total = models.BigIntegerField(
        default=0,
        verbose_name="فروش نقدی سیستم"
    )
    system_pos_total = models.BigIntegerField(
        default=0,
        verbose_name="فروش کارتخوان سیستم"
    )
    system_credit_total = models.BigIntegerField(
        default=0,
        verbose_name="فروش نسیه/چکی سیستم"
    )
    total_system_sales = models.BigIntegerField(
        default=0,
        verbose_name="کل فروش سیستم"
    )

    # مبالغ واقعی شمارش‌شده توسط صندوق‌دار
    actual_cash_counted = models.BigIntegerField(
        default=0,
        verbose_name="نقد واقعی شمارش‌شده"
    )
    actual_pos_counted = models.BigIntegerField(
        default=0,
        verbose_name="جمع رسید کارتخوان واقعی"
    )

    # مغایرت محاسبه شده (کسری یا اضافی صندوق)
    discrepancy = models.BigIntegerField(
        default=0,
        verbose_name="مغایرت صندوق (کسری/اضافه)"
    )

    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='open',
        verbose_name="وضعیت صندوق"
    )
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name="توضیحات و علت مغایرت"
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="آخرین بروزرسانی")

    class Meta:
        verbose_name = "گزارش تسویه صندوق روزانه"
        verbose_name_plural = "گزارشات تسویه صندوق"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.register_code} - {self.cashier} ({self.register_date})"

    @staticmethod
    def generate_register_code():
        date_str = timezone.now().strftime("%Y%m%d")
        rand_str = uuid.uuid4().hex[:4].upper()
        return f"CR-{date_str}-{rand_str}"

    def calculate_totals(self, cash_sales, pos_sales, credit_sales):
        """
        محاسبه مجموع فروش سیستم و مغایرت نهایی
        """
        self.system_cash_total = cash_sales
        self.system_pos_total = pos_sales
        self.system_credit_total = credit_sales
        self.total_system_sales = cash_sales + pos_sales + credit_sales

        # مجموع واقعی ورودی صندوق‌دار (نقد + پوز)
        actual_total = self.actual_cash_counted + self.actual_pos_counted
        system_expected = self.system_cash_total + self.system_pos_total
        
        # محاسبه مغایرت: مثبت = اضافه صندوق / منفی = کسری صندوق
        self.discrepancy = actual_total - system_expected
`;

  const adminCode = `"""
cash_register/admin.py
مدیریت گزارشات تسویه صندوق در پنل ادمین جنگو
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import DailyCashRegister


@admin.register(DailyCashRegister)
class DailyCashRegisterAdmin(admin.ModelAdmin):
    list_display = [
        'register_code',
        'register_date',
        'cashier',
        'formatted_system_sales',
        'formatted_actual_counted',
        'formatted_discrepancy',
        'colored_status',
        'closed_at',
    ]
    list_filter = ['status', 'register_date', 'cashier']
    search_fields = ['register_code', 'cashier__username', 'cashier__first_name', 'notes']
    readonly_fields = [
        'register_code',
        'opened_at',
        'closed_at',
        'system_cash_total',
        'system_pos_total',
        'system_credit_total',
        'total_system_sales',
        'discrepancy',
    ]

    fieldsets = (
        ('اطلاعات پایه شیفت', {
            'fields': ('register_code', 'cashier', 'status', 'register_date', 'opened_at', 'closed_at')
        }),
        ('محاسبات زنده سیستم (تومان)', {
            'fields': ('opening_balance', 'system_cash_total', 'system_pos_total', 'system_credit_total', 'total_system_sales')
        }),
        ('شمارش واقعی صندوق‌دار', {
            'fields': ('actual_cash_counted', 'actual_pos_counted', 'discrepancy')
        }),
        ('توضیحات و یادداشت‌ها', {
            'fields': ('notes',)
        }),
    )

    def formatted_system_sales(self, obj):
        return f"{obj.total_system_sales:,} تومان"
    formatted_system_sales.short_description = "فروش سیستم"

    def formatted_actual_counted(self, obj):
        total = obj.actual_cash_counted + obj.actual_pos_counted
        return f"{total:,} تومان"
    formatted_actual_counted.short_description = "شمارش واقعی"

    def formatted_discrepancy(self, obj):
        if obj.discrepancy == 0:
            return format_html('<span style="color: green; font-weight: bold;">۰ (بدون مغایرت)</span>')
        elif obj.discrepancy < 0:
            return format_html('<span style="color: red; font-weight: bold;">{} تومان (کسری)</span>', f"{obj.discrepancy:,}")
        else:
            return format_html('<span style="color: blue; font-weight: bold;">+{} تومان (اضافه)</span>', f"{obj.discrepancy:,}")
    formatted_discrepancy.short_description = "مغایرت صندوق"

    def colored_status(self, obj):
        if obj.status == 'open':
            return format_html('<span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; font-weight: bold;">در حال فروش</span>')
        return format_html('<span style="background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 6px; font-weight: bold;">بسته شده</span>')
    colored_status.short_description = "وضعیت"
`;

  const serializersCode = `"""
cash_register/serializers.py
سریالایزرهای DRF برای گزارش تسویه صندوق
"""
from rest_framework import serializers
from .models import DailyCashRegister


class DailyCashRegisterSerializer(serializers.ModelSerializer):
    """
    سریالایزر کامل مشاهده گزارش تسویه صندوق
    """
    cashier_name = serializers.CharField(source='cashier.get_full_name', read_only=True)
    cashier_username = serializers.CharField(source='cashier.username', read_only=True)
    total_actual_counted = serializers.SerializerMethodField()
    discrepancy_status = serializers.SerializerMethodField()

    class Meta:
        model = DailyCashRegister
        fields = [
            'id',
            'register_code',
            'cashier',
            'cashier_name',
            'cashier_username',
            'register_date',
            'opened_at',
            'closed_at',
            'opening_balance',
            'system_cash_total',
            'system_pos_total',
            'system_credit_total',
            'total_system_sales',
            'actual_cash_counted',
            'actual_pos_counted',
            'total_actual_counted',
            'discrepancy',
            'discrepancy_status',
            'status',
            'notes',
            'created_at'
        ]
        read_only_fields = ['id', 'register_code', 'opened_at', 'closed_at', 'discrepancy']

    def get_total_actual_counted(self, obj):
        return obj.actual_cash_counted + obj.actual_pos_counted

    def get_discrepancy_status(self, obj):
        if obj.discrepancy == 0:
            return "بدون مغایرت"
        elif obj.discrepancy < 0:
            return "کسری صندوق"
        return "اضافه صندوق"


class OpenRegisterSerializer(serializers.Serializer):
    """
    ورودی شروع شیفت جدید صندوق
    """
    opening_balance = serializers.IntegerField(min_value=0, default=0, help_text="موجودی نقد اول وقت تنخواه کشو")
    notes = serializers.CharField(required=False, allow_blank=True, help_text="توضیحات شیفت")


class CloseRegisterSerializer(serializers.Serializer):
    """
    ورودی ثبت تسویه و بستن صندوق
    """
    actual_cash_counted = serializers.IntegerField(min_value=0, help_text="مبلغ نقد شمارش‌شده واقعی در کشو")
    actual_pos_counted = serializers.IntegerField(min_value=0, help_text="جمع کل رسیدهای دستگاه کارتخوان")
    notes = serializers.CharField(required=False, allow_blank=True, help_text="توضیحات و علت مغایرت احتمالی")
`;

  const viewsCode = `"""
cash_register/views.py
ویوهای صریح APIView جهت بستن صندوق و ذخیره در دیتابیس
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from django.db.models import Sum
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import DailyCashRegister
from .serializers import (
    DailyCashRegisterSerializer,
    OpenRegisterSerializer,
    CloseRegisterSerializer,
)


class CurrentRegisterAPIView(APIView):
    """
    دریافت وضعیت شیفت فعلی و آمار زنده سیستم در روز جاری
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="وضعیت_شیفت_جاری_صندوق",
        operation_description="دریافت اطلاعات شیفت باز صندوق‌دار جاری و آمار فروش امروز",
        tags=["صندوق و تسویه روزانه (Cash Register)"],
        responses={200: DailyCashRegisterSerializer}
    )
    def get(self, request):
        today = timezone.now().date()
        open_reg = DailyCashRegister.objects.filter(
            cashier=request.user,
            status='open'
        ).first()

        if not open_reg:
            return Response({
                'has_open_register': False,
                'message': 'هیچ شیفت بازی برای شما ثبت نشده است. ابتدا صندوق را باز کنید.'
            }, status=status.HTTP_200_OK)

        serializer = DailyCashRegisterSerializer(open_reg)
        return Response({
            'has_open_register': True,
            'register': serializer.data
        }, status=status.HTTP_200_OK)


class OpenRegisterAPIView(APIView):
    """
    باز کردن شیفت جدید صندوق‌دار
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="بازکردن_شیفت_صندوق",
        operation_description="شروع شیفت کاری جدید صندوق‌دار با ثبت موجودی اول وقت",
        tags=["صندوق و تسویه روزانه (Cash Register)"],
        request_body=OpenRegisterSerializer,
        responses={201: DailyCashRegisterSerializer, 400: "شیفت باز قبلی وجود دارد"}
    )
    def post(self, request):
        active_reg = DailyCashRegister.objects.filter(cashier=request.user, status='open').first()
        if active_reg:
            return Response({
                'error': f'شما یک شیفت باز با کد {active_reg.register_code} دارید. ابتدا آن را تسویه کنید.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = OpenRegisterSerializer(data=request.data)
        if serializer.is_valid():
            reg = DailyCashRegister.objects.create(
                register_code=DailyCashRegister.generate_register_code(),
                cashier=request.user,
                register_date=timezone.now().date(),
                opening_balance=serializer.validated_data.get('opening_balance', 0),
                notes=serializer.validated_data.get('notes', ''),
                status='open'
            )
            return Response(DailyCashRegisterSerializer(reg).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CloseRegisterAPIView(APIView):
    """
    تسویه و بستن صندوق (محاسبه و ذخیره قطعی در دیتابیس)
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="تسویه_و_بستن_صندوق",
        operation_description="دریافت شمارش واقعی صندوق‌دار، محاسبه فروش سیستم و ذخیره سند در دیتابیس",
        tags=["صندوق و تسویه روزانه (Cash Register)"],
        request_body=CloseRegisterSerializer,
        responses={200: DailyCashRegisterSerializer, 400: "خطای ورودی یا نبود شیفت باز"}
    )
    def post(self, request):
        open_reg = DailyCashRegister.objects.filter(cashier=request.user, status='open').first()
        if not open_reg:
            return Response({'error': 'هیچ شیفت باز فعال برای تسویه یافت نشد.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CloseRegisterSerializer(data=request.data)
        if serializer.is_valid():
            actual_cash = serializer.validated_data['actual_cash_counted']
            actual_pos = serializer.validated_data['actual_pos_counted']
            notes = serializer.validated_data.get('notes', '')

            # محاسبه فروش روز جاری از مدل فاکتورهای صندوق (PosOrder) یا سفارشات (Order)
            # فرض می‌کنیم مبالغ به صورت زیر از دیتابیس فاکتورها جمع زده می‌شود:
            from pos.models import PosOrder  # یا مدل فاکتور شما
            orders_today = PosOrder.objects.filter(
                cashier=request.user,
                created_at__gte=open_reg.opened_at
            )

            cash_sales = orders_today.filter(payment_method='cash').aggregate(total=Sum('final_amount'))['total'] or 0
            pos_sales = orders_today.filter(payment_method='pos').aggregate(total=Sum('final_amount'))['total'] or 0
            credit_sales = orders_today.filter(payment_method='credit').aggregate(total=Sum('final_amount'))['total'] or 0

            # به‌روزرسانی مقادیر و محاسبه مغایرت
            open_reg.actual_cash_counted = actual_cash
            open_reg.actual_pos_counted = actual_pos
            open_reg.calculate_totals(cash_sales=cash_sales, pos_sales=pos_sales, credit_sales=credit_sales)
            
            open_reg.status = 'closed'
            open_reg.closed_at = timezone.now()
            if notes:
                open_reg.notes = f"{open_reg.notes or ''}\\n{notes}".strip()
            
            # ذخیره قطعی سند تسویه در دیتابیس
            open_reg.save()

            return Response({
                'message': 'گزارش تسویه صندوق با موفقیت در دیتابیس ذخیره شد.',
                'report': DailyCashRegisterSerializer(open_reg).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterListAPIView(APIView):
    """
    دریافت لیست سوابق تمام گزارشات تسویه صندوق
    """
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        operation_id="لیست_گزارشات_تسویه_صندوق",
        operation_description="مشاهده تاریخچه گزارشات بستن صندوق روزانه تمام صندوق‌داران",
        tags=["صندوق و تسویه روزانه (Cash Register)"],
        responses={200: DailyCashRegisterSerializer(many=True)}
    )
    def get(self, request):
        registers = DailyCashRegister.objects.all().select_related('cashier').order_by('-created_at')
        serializer = DailyCashRegisterSerializer(registers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegisterDetailAPIView(APIView):
    """
    مشاهده جزئیات یک گزارش تسویه صندوق روزانه
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="جزئیات_گزارش_تسویه_صندوق",
        operation_description="مشاهده سوابق و ریز مغایرت یک سند تسویه صندوق",
        tags=["صندوق و تسویه روزانه (Cash Register)"],
        responses={200: DailyCashRegisterSerializer, 404: "گزارش یافت نشد"}
    )
    def get(self, request, pk):
        try:
            if request.user.is_staff:
                reg = DailyCashRegister.objects.get(pk=pk)
            else:
                reg = DailyCashRegister.objects.get(pk=pk, cashier=request.user)
        except DailyCashRegister.DoesNotExist:
            return Response({'error': 'گزارش صندوق یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DailyCashRegisterSerializer(reg)
        return Response(serializer.data, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
cash_register/urls.py
مسیرهای صریح APIView جهت مدیریت و تسویه روزانه صندوق
"""
from django.urls import path
from .views import (
    CurrentRegisterAPIView,
    OpenRegisterAPIView,
    CloseRegisterAPIView,
    RegisterListAPIView,
    RegisterDetailAPIView,
)

app_name = 'cash_register'

urlpatterns = [
    # ۱. وضعیت زنده و شیفت جاری
    path('current/', CurrentRegisterAPIView.as_view(), name='register-current'),

    # ۲. باز کردن شیفت جدید
    path('open/', OpenRegisterAPIView.as_view(), name='register-open'),

    # ۳. تسویه و بستن صندوق (ذخیره قطعی در دیتابیس)
    path('close/', CloseRegisterAPIView.as_view(), name='register-close'),

    # ۴. لیست سوابق و جزئیات (مخصوص ادمین و حسابرس)
    path('list/', RegisterListAPIView.as_view(), name='register-list'),
    path('<int:pk>/', RegisterDetailAPIView.as_view(), name='register-detail'),
]
`;

  const notesCode = `## 📌 راهنمای جامع و تکمیلی اتصال نرم‌افزار صندوق (POS) به دیتابیس و ثبت تسویه روزانه

### 💡 چرا گزارش روزانه صندوق باید حتماً در دیتابیس ذخیره شود؟
۱. **سند رسمی مالی و قفل کردن فاکتورها (Z-Report)**: با بستن صندوق، تمام فاکتورهای فروش صادرشده در طول شیفت کاری به حالت قفل در می‌آیند تا پس از تسویه قابل ویرایش یا پاک شدن نباشند.
۲. **محاسبه هوشمند مغایرت (کسری/اضافه)**: سیستم به صورت خودکار تفاضل بین **شمارش واقعی صندوق‌دار** (نقد داخل کشو + رسیدهای کارتخوان) و **مجموع فاکتورهای سیستم** را محاسبه کرده و در صورت کسری یا اضافه بودن مبلغ، آن را به عنوان مغایرت ثبت می‌کند.
۳. **تحویل و تسویه شیفت صندوق‌داران**: امکان مدیریت دقیق چند شیفت کاری در یک روز توسط اپراتورهای مختلف.

---

### 📂 ۱. ساختار فایل‌های اپلیکیشن \`cash_register/\` در پروژه جنگو
\`\`\`text
cash_register/
├── __init__.py
├── admin.py          # مدیریت گزارشات تسویه و نمایش رنگی مغایرت در ادمین
├── apps.py           # تنظیمات اپلیکیشن CashRegisterConfig
├── models.py         # مدل DailyCashRegister با محاسبات خودکار
├── serializers.py    # سریالایزرهای DRF جهت دریافت و اعتبارسنجی مبالغ
├── urls.py           # مسیرهای صریح URL به همراه app_name
└── views.py          # ویوهای صریح APIView جهت بازکردن، بستن و لیست سوابق
\`\`\`

---

### 🚀 ۲. کدهای اتصال فرانت‌اند React جهت ارسال گزارش به بک‌اند

#### الف) کلاینت ارسال درخواست تسویه صندوق (بستن صندوق):
\`\`\`typescript
// تابع تسویه و بستن صندوق و ذخیره قطعی در پایگاه داده
export const submitCashRegisterClose = async (payload: {
  actual_cash_counted: number;
  actual_pos_counted: number;
  notes?: string;
}) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/v1/cash-register/close/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'خطا در ثبت گزارش تسویه صندوق');
  }

  const result = await response.json();
  return result;
};
\`\`\`

#### ب) باز کردن شیفت جدید در ابتدای روز:
\`\`\`typescript
export const openCashRegister = async (openingBalance: number, notes?: string) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/v1/cash-register/open/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      opening_balance: openingBalance,
      notes: notes || ''
    })
  });
  return await response.json();
};
\`\`\`

---

### ⚙️ ۳. مراحل اجرا و اعمال مایگریشن در جنگو:
\`\`\`bash
# ۱. ساخت مایگریشن دیتابیس
python manage.py makemigrations cash_register

# ۲. اعمال تغییرات در پایگاه داده PostgreSQL
python manage.py migrate

# ۳. تست و اجرای سرور
python manage.py runserver 0.0.0.0:8000
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="cash_register"
      title="اپلیکیشن گزارش و تسویه صندوق روزانه (cash_register)"
      titleEn="cash_register / Daily Cash Close & Shift Report"
      badge="Z-Report • Shift Close • Cash Discrepancy"
      description="سیستم کامل مدیریت شیفت، ثبت موجودی اول وقت تنخواه، محاسبه هوشمند کسری/اضافی صندوق و ذخیره قطعی اسناد تسویه روزانه در دیتابیس"
      icon={<BadgeDollarSign className="w-6 h-6 text-emerald-400" />}
      modelsCode={modelsCode}
      adminCode={adminCode}
      serializersCode={serializersCode}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
