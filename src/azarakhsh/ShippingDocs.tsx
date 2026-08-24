import React from 'react';
import { Truck } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const ShippingDocs: React.FC = () => {
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
        return f"{self.province_name} - {self.carrier.name}: {self.per_carton_rate_toman} تومان"`;

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
    inlines = [ProvinceTariffInline]`;

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
        fields = ('id', 'name', 'hub_name', 'phone', 'coverage_area', 'estimated_delivery_time', 'base_fare_toman', 'province_tariffs')`;

  const viewsCode = `"""
shipping/views.py
ویوهای باربری، محاسبه آنلاین کرایه و متون راهنما
"""
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ShippingTextsSetting, ShippingCarrier, ProvinceTariff
from .serializers import ShippingTextsSettingSerializer, ShippingCarrierSerializer, ProvinceTariffSerializer


class ShippingTextsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        obj, _ = ShippingTextsSetting.objects.get_or_create(id=1)
        serializer = ShippingTextsSettingSerializer(obj)
        return Response(serializer.data)


class ShippingCarrierViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = ShippingCarrier.objects.filter(is_active=True)
    serializer_class = ShippingCarrierSerializer`;

  const urlsCode = `"""
shipping/urls.py
مسیرهای باربری
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShippingCarrierViewSet, ShippingTextsView

router = DefaultRouter()
router.register(r'carriers', ShippingCarrierViewSet, basename='shipping-carriers')

urlpatterns = [
    path('texts/', ShippingTextsView.as_view(), name='shipping-texts'),
    path('', include(router.urls)),
]`;

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
        { name: 'per_carton_rate_toman', type: 'DecimalField', verbose: 'کرایه هر کارتن (تومان)' },
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
      responseBody: JSON.stringify({
        shipping_header_badge: "ناوگان حمل اکسپرس و بیمه‌شده",
        shipping_header_title: "شبکه ارسال مستقیم به سراسر ۳۱ استان کشور",
        packaging_guide_text: "کلیه سفارشات کارتن در کارتن‌های ۵ لایه ضدضربه، پلمپ‌شده با چسب امنیتی و سلفون ضدآب...",
        insurance_terms_text: "تمامی بارهای ارسالی به ارزش ۱۰۰٪ مبلغ فاکتور تحت پوشش بیمه حوادث..."
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/shipping/carriers/',
      auth: 'AllowAny',
      description: 'فهرست شرکت‌های باربری پایانه شوش به همراه تعرفه‌های استانی هر کارتن'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="shipping"
      title="۹. اپلیکیشن حمل‌ونقل، باربری شوش و بیمه"
      titleEn="shipping / Freight Logistics App"
      badge="Freight Engine • 31 Provinces"
      description="مدیریت جامع پایانه‌های باربری شوش تهران، محاسبه لحظه‌ای کرایه هر کارتن به تمامی ۳۱ استان کشور، تنظیم متون بیمه‌نامه ۱۰۰٪ و بسته‌بندی ۵ لایه ضدضربه."
      icon={<Truck className="w-6 h-6" />}
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
