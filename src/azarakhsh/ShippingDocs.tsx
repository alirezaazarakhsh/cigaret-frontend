import React from 'react';
import { Truck } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const ShippingDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'shipping_shippingtextssetting',
      verboseName: 'جدول متون و راهنمای باربری و بیمه',
      description: 'مدیریت متون بسته‌بندی ۵ لایه، بیمه ۱۰۰٪، ارسال ۲ ساعته تهران و اطلاعیه حداقل سفارش',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه ردیف یکتا (Singleton)' },
        { name: 'shipping_header_badge', type: 'CharField(max_length=80)', verbose: 'بچ هدر باربری' },
        { name: 'shipping_header_title', type: 'CharField(max_length=200)', verbose: 'عنوان صفحه باربری' },
        { name: 'shipping_header_desc', type: 'TextField', verbose: 'توضیحات هدر' },
        { name: 'packaging_guide_text', type: 'TextField', verbose: 'متن راهنمای بسته‌بندی ضدضربه' },
        { name: 'insurance_terms_text', type: 'TextField', verbose: 'متن شرایط و پوشش بیمه ۱۰۰٪' },
        { name: 'express_tehran_note', type: 'TextField', verbose: 'متن ارسال ۲ ساعته تهران' },
        { name: 'provincial_transit_note', type: 'TextField', verbose: 'متن زمان‌بندی شهرستان‌ها' },
        { name: 'minimum_freight_order_notice', type: 'CharField(max_length=255)', verbose: 'اطلاعیه حداقل سفارش' },
      ]
    },
    {
      name: 'shipping_shippingcarrier',
      verboseName: 'جدول شرکت‌های باربری طرف قرارداد',
      description: 'باربری‌های شوش (وطن، پیشتاز، ایران پیام و تیپاکس)',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'name', type: 'CharField(max_length=120)', verbose: 'نام شرکت باربری' },
        { name: 'hub_name', type: 'CharField(max_length=150)', verbose: 'نام بارانداز مبدا (پایانه شوش)' },
        { name: 'phone', type: 'CharField(max_length=20)', verbose: 'شماره تماس باربری' },
        { name: 'coverage_area', type: 'CharField(max_length=200)', verbose: 'پوشش جغرافیایی' },
        { name: 'estimated_delivery_time', type: 'CharField(max_length=60)', verbose: 'مدت زمان تقریبی تحویل' },
        { name: 'base_fare_toman', type: 'DecimalField', verbose: 'تعرفه پایه هر کارتن' },
        { name: 'is_active', type: 'BooleanField', verbose: 'فعال' },
      ]
    },
    {
      name: 'shipping_provincetariff',
      verboseName: 'جدول تعرفه‌های استانی باربری',
      description: 'کرایه هر کارتن به تفکیک ۳۱ استان کشور و مدت زمان سیر بار',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'carrier_id', type: 'ForeignKey', isFk: true, fkTarget: 'shipping_shippingcarrier', verbose: 'شرکت باربری' },
        { name: 'province_name', type: 'CharField(max_length=80)', verbose: 'نام استان' },
        { name: 'city_center', type: 'CharField(max_length=80)', verbose: 'مرکز استان' },
        { name: 'per_carton_rate_toman', type: 'DecimalField', verbose: 'کرایه هر کارتن (تومان)' },
        { name: 'per_box_rate_toman', type: 'DecimalField', verbose: 'کرایه هر باکس (تومان)' },
        { name: 'transit_days', type: 'PositiveIntegerField', verbose: 'مدت زمان سیر (روز)' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/shipping/texts/',
      auth: 'AllowAny',
      description: 'دریافت کلیه متون راهنمای باربری، شرایط بیمه ۱۰۰٪ و بسته‌بندی ۵ لایه',
      curlExample: `curl -X GET http://localhost:8000/api/v1/shipping/texts/`,
      responseBody: `{
  "status": "success",
  "data": {
    "shipping_header_badge": "ناوگان حمل اکسپرس و بیمه‌شده",
    "shipping_header_title": "شبکه ارسال مستقیم به سراسر ۳۱ استان کشور",
    "shipping_header_desc": "همکاری مستقیم با باربری‌های معتبر شوش تهران...",
    "packaging_guide_text": "کلیه سفارشات کارتن در کارتن‌های ۵ لایه ضدضربه...",
    "insurance_terms_text": "تمامی بارهای ارسالی به ارزش ۱۰۰٪ مبلغ فاکتور...",
    "express_tehran_note": "سفارشات شهر تهران ظرف کمتر از ۲ ساعت...",
    "provincial_transit_note": "سفارشات ثبت‌شده تا ساعت ۱۳:۰۰ همان روز تحویل پایانه...",
    "minimum_freight_order_notice": "حداقل سفارش برای ارسال به شهرستان ۱ کارتن کامل می‌باشد."
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/shipping/carriers/list/',
      auth: 'AllowAny',
      description: 'فهرست شرکت‌های باربری پایانه شوش به همراه تعرفه‌های استانی هر کارتن',
      curlExample: `curl -X GET http://localhost:8000/api/v1/shipping/carriers/list/`,
      responseBody: `{
  "status": "success",
  "count": 4,
  "results": [
    {
      "id": 1,
      "name": "باربری وطن شوش",
      "hub_name": "پایانه مرکزی شوش تهران",
      "phone": "021-55000000",
      "coverage_area": "سراسر کشور و کلیه شهرستان‌ها",
      "estimated_delivery_time": "۲۴ الی ۴۸ ساعت کاری",
      "base_fare_toman": 250000,
      "province_tariffs": [
        {
          "id": 101,
          "carrier": 1,
          "carrier_name": "باربری وطن شوش",
          "province_name": "خراسان رضوی",
          "city_center": "مشهد",
          "per_carton_rate_toman": 280000,
          "per_box_rate_toman": 28000,
          "transit_days": 2
        }
      ]
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/shipping/carriers/create/',
      auth: 'IsAdminUser',
      description: 'تعریف شرکت باربری جدید در سیستم توسط مدیریت',
      curlExample: `curl -X POST http://localhost:8000/api/v1/shipping/carriers/create/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "باربری پیشتاز شوش", "phone": "021-55112233", "base_fare_toman": 260000}'`,
      responseBody: `{
  "status": "success",
  "message": "شرکت باربری جدید با موفقیت ایجاد گردید.",
  "data": {
    "id": 5,
    "name": "باربری پیشتاز شوش",
    "base_fare_toman": 260000
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/shipping/carriers/<id>/',
      auth: 'AllowAny',
      description: 'مشاهده جزئیات یک شرکت باربری به همراه تعرفه استانی آن'
    },
    {
      method: 'PUT',
      path: '/api/v1/shipping/carriers/<id>/update/',
      auth: 'IsAdminUser',
      description: 'ویرایش مشخصات و تعرفه پایه باربری توسط ادمین'
    },
    {
      method: 'DELETE',
      path: '/api/v1/shipping/carriers/<id>/delete/',
      auth: 'IsAdminUser',
      description: 'حذف شرکت باربری از سیستم توسط مدیریت'
    },
    {
      method: 'GET',
      path: '/api/v1/shipping/tariffs/',
      auth: 'AllowAny',
      description: 'دریافت کلیه تعرفه‌های استانی باربری‌ها با قابلیت فیلتر بر اساس نام استان'
    }
  ];

  const modelsCode = `"""
shipping/models.py
مدل‌های باربری‌ها، تعرفه ارسال به استان‌ها، و متون و تنظیمات راهنمای باربری، بیمه و بسته‌بندی
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class ShippingTextsSetting(models.Model):
    """
    تنظیمات متون اختصاصی بخش باربری، شرایط حمل‌ونقل، بیمه، بسته‌بندی ۵ لایه و اطلاعیه‌ها
    """
    shipping_header_badge = models.CharField(_('بچ هدر باربری'), max_length=80, default='ناوگان حمل اکسپرس و بیمه‌شده')
    shipping_header_title = models.CharField(_('عنوان صفحه باربری'), max_length=200, default='شبکه ارسال مستقیم به سراسر ۳۱ استان کشور')
    shipping_header_desc = models.TextField(
        _('توضیحات هدر باربری'), 
        default='همکاری مستقیم با باربری‌های معتبر شوش تهران (وطن، پیشتاز، باربری شوش، ایران پیام و تیپاکس) همراه با صدور فوری بیجک رسمی و بیمه‌نامه حوادث.'
    )
    
    # راهنمای بسته‌بندی و بیمه
    packaging_guide_text = models.TextField(
        _('متن راهنمای بسته‌بندی ایمن و محرمانه'), 
        default='کلیه سفارشات کارتن در کارتن‌های ۵ لایه ضدضربه، پلمپ‌شده با چسب امنیتی و سلفون ضدآب کشیده می‌شوند تا در طول مسیر از رطوبت، غبار و هرگونه صدمه فیزیکی محافظت گردند.'
    )
    insurance_terms_text = models.TextField(
        _('متن شرایط و سقف پوشش بیمه باربری'), 
        default='تمامی بارهای ارسالی به ارزش ۱۰۰٪ مبلغ فاکتور تحت پوشش بیمه حوادث و مفقودی شرکت‌های باربری طرف قرارداد قرار دارند و در صورت بروز هرگونه مشکل، بلافاصله جبران خسارت می‌گردد.'
    )
    express_tehran_note = models.TextField(
        _('متن راهنمای ارسال ۲ ساعته تهران'), 
        default='سفارشات شهر تهران از ساعت ۹:۰۰ الی ۱۸:۰۰ ظرف کمتر از ۲ ساعت با پیک اختصاصی یا وانت‌بار بارگیری شده و امکان تسویه نقدی یا پرداخت پوز در محل انبار جنت‌آباد فراهم است.'
    )
    provincial_transit_note = models.TextField(
        _('متن زمان‌بندی تحویل بار به شهرستان‌ها'), 
        default='سفارشات ثبت‌شده تا ساعت ۱۳:۰۰ همان روز تحویل پایانه باربری شوش داده شده و شماره بیجک و بارنامه پیامک خواهد شد (تحویل ۲۴ الی ۴۸ ساعته).'
    )
    minimum_freight_order_notice = models.CharField(
        _('اطلاعیه حداقل سفارش باربری'), 
        max_length=255, 
        default='حداقل سفارش برای ارسال به شهرستان ۱ کارتن کامل می‌باشد (ارسال کمتر از ۱ کارتن فقط با هماهنگی تلفنی).'
    )

    class Meta:
        verbose_name = _('متون و تنظیمات راهنمای باربری')
        verbose_name_plural = _('متون و تنظیمات راهنمای باربری')

    def __str__(self):
        return "متون و اطلاعیه‌های بخش باربری"


class ShippingCarrier(models.Model):
    name = models.CharField(_('نام شرکت باربری'), max_length=120)
    hub_name = models.CharField(_('نام بارانداز / شعبه مبدا'), max_length=150, default='پایانه باربری شوش تهران')
    phone = models.CharField(_('تلفن تماس باربری'), max_length=20)
    coverage_area = models.CharField(_('پوشش جغرافیایی'), max_length=200, default='سراسر کشور و کلیه شهرستان‌ها')
    estimated_delivery_time = models.CharField(_('مدت زمان تقریبی تحویل'), max_length=60, default='۲۴ الی ۴۸ ساعت کاری')
    base_fare_toman = models.DecimalField(_('تعرفه پایه هر کارتن (تومان)'), max_digits=10, decimal_places=0, default=250000)
    is_active = models.BooleanField(_('باربری فعال'), default=True)

    class Meta:
        verbose_name = _('شرکت باربری')
        verbose_name_plural = _('باربری‌های طرف قرارداد')

    def __str__(self):
        return f"{self.name} ({self.hub_name})"


class ProvinceTariff(models.Model):
    carrier = models.ForeignKey(ShippingCarrier, on_delete=models.CASCADE, related_name='province_tariffs', verbose_name=_('باربری'))
    province_name = models.CharField(_('نام استان'), max_length=80)
    city_center = models.CharField(_('مرکز استان'), max_length=80)
    per_carton_rate_toman = models.DecimalField(_('کرایه هر کارتن به این استان (تومان)'), max_digits=10, decimal_places=0)
    per_box_rate_toman = models.DecimalField(_('کرایه هر باکس (تومان)'), max_digits=8, decimal_places=0, default=25000)
    transit_days = models.PositiveIntegerField(_('مدت زمان سیر بار (روز)'), default=2)

    class Meta:
        verbose_name = _('تعرفه استانی باربری')
        verbose_name_plural = _('تعرفه‌های استانی حمل‌ونقل')
        unique_together = ('carrier', 'province_name')

    def __str__(self):
        return f"{self.province_name} - {self.carrier.name}: {self.per_carton_rate_toman} تومان"
`;

  const adminCode = `"""
shipping/admin.py
پنل ادمین متون باربری و تعرفه‌های استانی
"""

from django.contrib import admin
from .models import ShippingTextsSetting, ShippingCarrier, ProvinceTariff


@admin.register(ShippingTextsSetting)
class ShippingTextsSettingAdmin(admin.ModelAdmin):
    fieldsets = (
        ('هدر و تیتر صفحه باربری', {
            'fields': ('shipping_header_badge', 'shipping_header_title', 'shipping_header_desc')
        }),
        ('متون راهنما و بیمه‌نامه', {
            'fields': ('packaging_guide_text', 'insurance_terms_text', 'express_tehran_note', 'provincial_transit_note', 'minimum_freight_order_notice')
        }),
    )

    def has_add_permission(self, request):
        return not ShippingTextsSetting.objects.exists()


class ProvinceTariffInline(admin.TabularInline):
    model = ProvinceTariff
    extra = 1


@admin.register(ShippingCarrier)
class ShippingCarrierAdmin(admin.ModelAdmin):
    list_display = ('name', 'hub_name', 'phone', 'estimated_delivery_time', 'base_fare_toman', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'hub_name', 'phone')
    inlines = [ProvinceTariffInline]
`;

  const serializersCode = `"""
shipping/serializers.py
سریالایزر متون باربری و کرایه‌ها
"""

from rest_framework import serializers
from .models import ShippingTextsSetting, ShippingCarrier, ProvinceTariff


class ShippingTextsSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingTextsSetting
        fields = '__all__'


class ProvinceTariffSerializer(serializers.ModelSerializer):
    carrier_name = serializers.CharField(source='carrier.name', read_only=True)

    class Meta:
        model = ProvinceTariff
        fields = ('id', 'carrier', 'carrier_name', 'province_name', 'city_center', 'per_carton_rate_toman', 'per_box_rate_toman', 'transit_days')


class ShippingCarrierSerializer(serializers.ModelSerializer):
    province_tariffs = ProvinceTariffSerializer(many=True, read_only=True)

    class Meta:
        model = ShippingCarrier
        fields = ('id', 'name', 'hub_name', 'phone', 'coverage_area', 'estimated_delivery_time', 'base_fare_toman', 'province_tariffs', 'is_active')


class ShippingCarrierCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingCarrier
        fields = ('name', 'hub_name', 'phone', 'coverage_area', 'estimated_delivery_time', 'base_fare_toman', 'is_active')
`;

  const viewsCode = `"""
shipping/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت باربری و تعرفه‌ها
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema

from .models import ShippingTextsSetting, ShippingCarrier, ProvinceTariff
from .serializers import (
    ShippingTextsSettingSerializer, 
    ShippingCarrierSerializer, 
    ShippingCarrierCreateUpdateSerializer,
    ProvinceTariffSerializer
)


class ShippingTextsAPIView(APIView):
    """
    اندپوینت دریافت متون راهنمای باربری، بیمه ۱۰۰٪ و شرایط ارسال
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت متون و راهنمای کامل باربری و بیمه",
        responses={200: ShippingTextsSettingSerializer}
    )
    def get(self, request):
        obj, _ = ShippingTextsSetting.objects.get_or_create(id=1)
        serializer = ShippingTextsSettingSerializer(obj)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class ShippingCarrierListAPIView(APIView):
    """
    اندپوینت دریافت لیست باربری‌های فعال پایانه شوش به همراه تعرفه‌های استانی
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست باربری‌ها و تعرفه‌های استانی",
        responses={200: ShippingCarrierSerializer(many=True)}
    )
    def get(self, request):
        queryset = ShippingCarrier.objects.filter(is_active=True).prefetch_related('province_tariffs')
        serializer = ShippingCarrierSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class ShippingCarrierCreateAPIView(APIView):
    """
    اندپوینت افزودن باربری جدید (مخصوص مدیریت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="افزودن شرکت باربری جدید (مدیریت)",
        request_body=ShippingCarrierCreateUpdateSerializer,
        responses={201: ShippingCarrierSerializer}
    )
    def post(self, request):
        serializer = ShippingCarrierCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            carrier = serializer.save()
            return Response({
                'status': 'success',
                'message': 'شرکت باربری جدید با موفقیت ایجاد گردید.',
                'data': ShippingCarrierSerializer(carrier).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShippingCarrierDetailAPIView(APIView):
    """
    اندپوینت مشاهده جزئیات یک باربری و نرخ‌های استانی آن
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت مشخصات یک باربری",
        responses={200: ShippingCarrierSerializer}
    )
    def get(self, request, pk):
        carrier = get_object_or_404(ShippingCarrier, pk=pk)
        serializer = ShippingCarrierSerializer(carrier)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class ShippingCarrierUpdateAPIView(APIView):
    """
    اندپوینت ویرایش مشخصات باربری (مخصوص مدیریت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ویرایش اطلاعات باربری (مدیریت)",
        request_body=ShippingCarrierCreateUpdateSerializer,
        responses={200: ShippingCarrierSerializer}
    )
    def put(self, request, pk):
        carrier = get_object_or_404(ShippingCarrier, pk=pk)
        serializer = ShippingCarrierCreateUpdateSerializer(carrier, data=request.data, partial=True)
        if serializer.is_valid():
            updated_carrier = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات باربری با موفقیت بروزرسانی گردید.',
                'data': ShippingCarrierSerializer(updated_carrier).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShippingCarrierDeleteAPIView(APIView):
    """
    اندپوینت حذف باربری (مخصوص مدیریت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="حذف شرکت باربری (مدیریت)",
        responses={200: dict}
    )
    def delete(self, request, pk):
        carrier = get_object_or_404(ShippingCarrier, pk=pk)
        carrier.delete()
        return Response({
            'status': 'success',
            'message': 'شرکت باربری مورد نظر با موفقیت حذف گردید.'
        }, status=status.HTTP_200_OK)


class ProvinceTariffListAPIView(APIView):
    """
    اندپوینت دریافت تعرفه‌های استانی باربری با امکان فیلتر بر اساس نام استان
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت کرایه ارسال به استان‌ها",
        responses={200: ProvinceTariffSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProvinceTariff.objects.all().select_related('carrier')
        province_name = request.query_params.get('province')
        if province_name:
            queryset = queryset.filter(province_name__icontains=province_name)

        serializer = ProvinceTariffSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
shipping/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    ShippingTextsAPIView,
    ShippingCarrierListAPIView,
    ShippingCarrierCreateAPIView,
    ShippingCarrierDetailAPIView,
    ShippingCarrierUpdateAPIView,
    ShippingCarrierDeleteAPIView,
    ProvinceTariffListAPIView,
)

app_name = 'shipping'

urlpatterns = [
    # ۱. متون و راهنمای کامل باربری و بیمه
    path('texts/', ShippingTextsAPIView.as_view(), name='shipping-texts'),

    # ۲. دریافت لیست کلیه باربری‌ها به همراه تعرفه‌ها
    path('carriers/list/', ShippingCarrierListAPIView.as_view(), name='carrier-list'),

    # ۳. افزودن شرکت باربری جدید (مخصوص ادمین)
    path('carriers/create/', ShippingCarrierCreateAPIView.as_view(), name='carrier-create'),

    # ۴. مشاهده مشخصات یک باربری با شناسه
    path('carriers/<int:pk>/', ShippingCarrierDetailAPIView.as_view(), name='carrier-detail'),

    # ۵. ویرایش اطلاعات باربری (مخصوص ادمین)
    path('carriers/<int:pk>/update/', ShippingCarrierUpdateAPIView.as_view(), name='carrier-update'),

    # ۶. حذف باربری (مخصوص ادمین)
    path('carriers/<int:pk>/delete/', ShippingCarrierDeleteAPIView.as_view(), name='carrier-delete'),

    # ۷. لیست تعرفه‌های استانی با فیلتر نام استان
    path('tariffs/', ProvinceTariffListAPIView.as_view(), name='province-tariffs'),
]
`;

  const notesCode = `## 📌 راهنمای استفاده از سیستم باربری و ناوگان با APIView

### ۱. دلیل پیاده‌سازی صریح با APIView (عدم استفاده از ViewSet):
* این ماژول کاملاً با کلاس‌های **APIView** صریح پیاده‌سازی شده و وابستگی به ViewSet یا Routerهای استاندارد DRF ندارد.
* **مزیت:** جداسازی کامل سرویس متون راهنما و بیمه از لیست باربری‌های شوش، روتینگ صریح و شفاف مطابق سواگر \`drf_yasg\` و امکان دریافت دقیق تعرفه‌ها بر اساس ۳۱ استان کشور.

---

### ۲. نحوه فراخوانی در فرانت‌اند React:
\`\`\`typescript
// دریافت متون و تعرفه‌های استانی باربری
const fetchShippingInfo = async () => {
  const textsRes = await fetch('http://localhost:8000/api/v1/shipping/texts/');
  const texts = await textsRes.json();
  
  const carriersRes = await fetch('http://localhost:8000/api/v1/shipping/carriers/list/');
  const carriers = await carriersRes.json();
  
  console.log("راهنمای باربری:", texts.data);
  console.log("باربری‌های فعال شوش:", carriers.results);
};
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="shipping"
      title="۹. اپلیکیشن حمل‌ونقل، باربری شوش و بیمه"
      titleEn="shipping / Freight Logistics App"
      badge="Freight Engine • 31 Provinces APIView"
      description="مدیریت جامع پایانه‌های باربری شوش تهران، محاسبه لحظه‌ای کرایه هر کارتن به تمامی ۳۱ استان کشور، تنظیم متون بیمه‌نامه ۱۰۰٪ و بسته‌بندی ۵ لایه ضدضربه. این اپلیکیشن بر پایه APIView صریح (دقیقاً مشابه الگوی regular_customers بدون ViewSet) پیاده‌سازی شده است."
      icon={<Truck className="w-6 h-6 text-blue-500" />}
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
