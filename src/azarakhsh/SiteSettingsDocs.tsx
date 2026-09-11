/* eslint-disable no-useless-escape */
import React, { useState } from 'react';
import { 
  Sliders, 
  Copy, 
  Check, 
  FileCode, 
  Sparkles, 
  Image, 
  Mail, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Globe, 
  MessageSquare, 
  Truck, 
  Type,
  LayoutTemplate
} from 'lucide-react';
import { CodeTab } from './types';
import { CodeViewer } from './CodeViewer';

export const SiteSettingsDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelsCode = `"""
site_settings/models.py
مدل‌های جامع تنظیمات سایت، برندینگ، متون هدر صفحات، کارت‌های ۴‌گانه زیر اسلایدر و متون اختصاصی باربری
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class SiteBranding(models.Model):
    """
    تنظیمات اصلی هویت برند، لوگوها، نام‌ها، فاوآیکون و نوار اعلان بالای هدر سایت
    (طراحی به صورت Singleton یا ردیف یکتا)
    """
    site_title = models.CharField(
        _('عنوان اصلی سایت (فارسی)'), 
        max_length=150, 
        default='سامانه پخش عمده دخانیات دخانیات سرو'
    )
    site_title_en = models.CharField(
        _('عنوان لاتین سایت'), 
        max_length=150, 
        default='Sevin Wholesale Tobacco Distribution'
    )
    brand_short_name = models.CharField(
        _('نام کوتاه برند'), 
        max_length=50, 
        default='دخانیات سرو'
    )
    tagline = models.CharField(
        _('شعار برند'), 
        max_length=255, 
        default='تأمین مستقیم و دست‌اول انواع سیگار اورجینال و ادوات آیکاس با نرخ روز کارتن'
    )
    
    # لوگوها و رسانه‌ها
    logo_light = models.ImageField(
        _('تصویر لوگو (نسخه روشن / پس‌زمینه تیره)'), 
        upload_to='branding/logos/', 
        null=True, 
        blank=True,
        help_text=_('تصویر PNG یا SVG با پس‌زمینه شفاف')
    )
    logo_dark = models.ImageField(
        _('تصویر لوگو (نسخه تیره / پس‌زمینه روشن)'), 
        upload_to='branding/logos/', 
        null=True, 
        blank=True
    )
    favicon = models.ImageField(
        _('فاوآیکون (Favicon)'), 
        upload_to='branding/favicons/', 
        null=True, 
        blank=True
    )
    
    # تنظیمات حالت آزمایشی / داده‌های فیک
    is_demo_mode = models.BooleanField(_('فعال بودن حالت داده‌های آزمایشی (Demo / Mock Mode)'), default=False)
    demo_mode_label = models.CharField(_('عنوان حالت آزمایشی'), max_length=100, default='حالت داده‌های آزمایشی')

    # نوار اعلان بالای هدر (Announcement Bar)
    is_announcement_active = models.BooleanField(_('فعال بودن نوار اعلان بالای سایت'), default=True)
    announcement_text = models.CharField(
        _('متن نوار اعلان'), 
        max_length=300, 
        default='بارگیری روزانه از انبار مرکزی جنت‌آباد • تحویل ۲ ساعته تهران و ارسال بیمه‌شده شهرستان'
    )
    announcement_badge = models.CharField(_('بچ اعلان'), max_length=50, default='اطلاعیه باربری')
    announcement_link = models.CharField(_('لینک اعلان (اختیاری)'), max_length=200, blank=True, null=True)

    # اطلاعات تماس سریع در هدر
    header_phone = models.CharField(_('شماره تماس سریع هدر'), max_length=30, default='021-44000000')
    header_support_hours = models.CharField(_('ساعت کاری پشتیبانی هدر'), max_length=100, default='شنبه تا چهارشنبه ۹ الی ۱۹ | پنجشنبه ۹ الی ۱۵')

    updated_at = models.DateTimeField(_('آخرین به‌روزرسانی'), auto_now=True)

    class Meta:
        verbose_name = _('تنظیمات برندینگ و لوگوی سایت')
        verbose_name_plural = _('تنظیمات برندینگ و لوگوی سایت')

    def __str__(self):
        return f"{self.site_title} ({self.brand_short_name})"


class SiteValueFeature(models.Model):
    """
    مدل کارت‌های ۴‌گانه خدمات و مزایای بنکداری زیر اسلایدر هیرو
    (برچسب، عنوان، آیکون متنی iconsax، توضیحات کوتاه)
    مکان در پروژه جنگو: اپلیکیشن site_settings (فایل site_settings/models.py)
    """
    title = models.CharField(_('عنوان اصلی کارت (حداکثر ۴۵ کاراکتر)'), max_length=45)
    desc = models.TextField(_('توضیحات کوتاه کارت (حداکثر ۱۲۰ کاراکتر)'), max_length=120)
    icon = models.CharField(_('نام آیکون متنی (Iconsax / Lucide)'), max_length=50, default='shield-tick', help_text=_('مانند shield-tick, discount-shape, truck-fast, user-edit'))
    badge = models.CharField(_('برچسب کارت (حداکثر ۱۵ کاراکتر)'), max_length=15, blank=True, null=True, help_text=_('مانند اصالت SVN یا تا ۹٪ تخفیف'))
    order = models.PositiveSmallIntegerField(_('ترتیب نمایش (۱ تا ۴)'), default=1)
    is_active = models.BooleanField(_('فعال'), default=True)

    class Meta:
        verbose_name = _('کارت مزیت و خدمات سایت')
        verbose_name_plural = _('کارت‌های ۴‌گانه خدمات و مزایای زیر اسلایدر')
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.order}. {self.title}"


class PageHeaderSetting(models.Model):
    """
    تنظیمات متون هدر، بنر و هیرو برای هر صفحه به تفکیک
    """
    PAGE_CHOICES = (
        ('home', _('صفحه اصلی و کاتالوگ')),
        ('live_prices', _('صفحه تابلوی نرخ لحظه‌ای')),
        ('invoice', _('صفحه صدور پیش‌فاکتور رسمی')),
        ('shipping', _('صفحه باربری و ناوگان حمل‌ونقل')),
        ('blog', _('صفحه مقالات و وبلاگ')),
        ('contact', _('صفحه تماس با ما و پشتیبانی')),
        ('calculator', _('ماشین حساب سود و ارز')),
        ('tracking', _('رهگیری سفارشات و بارنامه')),
    )

    page_key = models.CharField(_('کلید شناسه صفحه'), max_length=50, choices=PAGE_CHOICES, unique=True)
    hero_badge_text = models.CharField(_('متن نشانک (Badge) بالای عنوان'), max_length=100, default='مرکز پخش دست‌اول')
    hero_title = models.CharField(_('عنوان بزرگ هدر صفحه (H1)'), max_length=200)
    hero_subtitle = models.CharField(_('زیرعنوان یا هایلایت هدر'), max_length=255, blank=True, null=True)
    hero_description = models.TextField(_('متن توضیحات کامل هدر صفحه'))
    
    primary_button_text = models.CharField(_('متن دکمه اصلی'), max_length=60, default='مشاهده نرخ لحظه‌ای')
    primary_button_link = models.CharField(_('لینک دکمه اصلی'), max_length=150, default='/live-prices')
    secondary_button_text = models.CharField(_('متن دکمه فرعی'), max_length=60, default='صدور پیش‌فاکتور رسمی')
    secondary_button_link = models.CharField(_('لینک دکمه فرعی'), max_length=150, default='/invoice')
    
    is_active = models.BooleanField(_('فعال'), default=True)

    class Meta:
        verbose_name = _('متن هدر و هیروی صفحه')
        verbose_name_plural = _('متون هدر و هیروی صفحات')

    def __str__(self):
        return f"هدر صفحه: {self.get_page_key_display()}"


class ShippingTextsSetting(models.Model):
    """
    تنظیمات متون اختصاصی بخش باربری، شرایط حمل‌ونقل، بیمه، بسته‌بندی و اطلاعیه‌ها
    """
    shipping_header_badge = models.CharField(_('بچ هدر باربری'), max_length=80, default='ناوگان حمل اکسپرس و بیمه‌شده')
    shipping_header_title = models.CharField(_('عنوان صفحه باربری'), max_length=200, default='شبکه ارسال مستقیم به سراسر ۳۱ استان کشور')
    shipping_header_desc = models.TextField(
        _('توضیحات هدر باربری'), 
        default='همکاری مستقیم با باربری‌های معتبر شوش تهران (وطن، پیشتاز، باربری شوش، ایران پیام و تیپاکس) همراه با صدور فوری بیجک رسمی و بیمه‌نامه حوادث.'
    )
    
    # متون راهنمای بسته‌بندی و بیمه
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
        verbose_name = _('متون اختصاصی باربری و حمل‌ونقل')
        verbose_name_plural = _('متون اختصاصی باربری و حمل‌ونقل')

    def __str__(self):
        return "متون و اطلاعیه‌های بخش باربری"


class SiteMaintenance(models.Model):
    """
    تنظیمات صفحه تعمیرات / بروزرسانی سایت همراه با تایمر پایان از سمت دیتابیس
    """
    is_maintenance_mode = models.BooleanField(_('فعال بودن حالت تعمیرات و بروزرسانی'), default=False)
    maintenance_title = models.CharField(_('عنوان پیام بروزرسانی'), max_length=200, default='سامانه در حال بروزرسانی و ارتقا می‌باشد')
    maintenance_message = models.TextField(
        _('متن کامل پیام تعمیرات'), 
        default='کاربران گرامی، به منظور ارتقای زیرساخت‌ها و اضافه نمودن امکانات جدید، سامانه به مدت محدود از دسترس خارج می‌باشد. از شکیبایی شما سپاسگزاریم.'
    )
    estimated_end_time = models.DateTimeField(_('زمان تخمینی پایان تعمیرات (تایمر معکوس)'), null=True, blank=True)
    allowed_ips = models.TextField(_('آدرس‌های IP مجاز برای دسترسی ادمین (جداشده با کاما)'), default='127.0.0.1', blank=True)

    class Meta:
        verbose_name = _('تنظیمات حالت تعمیرات و بروزرسانی سایت')
        verbose_name_plural = _('تنظیمات حالت تعمیرات و تایمر بروزرسانی')

    def __str__(self):
        status_str = "فعال (درحال تعمیرات)" if self.is_maintenance_mode else "غیرفعال (سایت آنلاین)"
        return f"حالت تعمیرات: {status_str}"
`;

  const adminCode = `"""
site_settings/admin.py
پنل مدیریت پیشرفته تنظیمات سایت، برندینگ، کارت‌های زیر اسلایدر و متون باربری در ادمین جنگو
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import (
    SiteBranding, 
    SiteValueFeature,
    PageHeaderSetting, 
    ShippingTextsSetting
)


@admin.register(SiteBranding)
class SiteBrandingAdmin(admin.ModelAdmin):
    fieldsets = (
        (_('هویت برند و عناوین'), {
            'fields': ('site_title', 'site_title_en', 'brand_short_name', 'tagline')
        }),
        (_('لوگوها و فاوآیکون'), {
            'fields': ('logo_light', 'logo_dark', 'favicon', 'logo_preview'),
        }),
        (_('نوار اعلان بالای هدر سایت'), {
            'fields': ('is_announcement_active', 'announcement_badge', 'announcement_text', 'announcement_link')
        }),
        (_('تماس سریع در هدر'), {
            'fields': ('header_phone', 'header_support_hours')
        }),
    )
    readonly_fields = ('logo_preview', 'updated_at')

    def logo_preview(self, obj):
        if obj.logo_light:
            return format_html('<img src="{}" style="max-height: 50px; background: #1e293b; padding: 5px; border-radius: 8px;" />', obj.logo_light.url)
        return _("لوگویی بارگذاری نشده است")
    logo_preview.short_description = _("پیش‌نمایش لوگو")

    def has_add_permission(self, request):
        return SiteBranding.objects.count() == 0


@admin.register(SiteValueFeature)
class SiteValueFeatureAdmin(admin.ModelAdmin):
    list_display = ('order', 'title', 'badge', 'icon', 'is_active')
    list_display_links = ('title',)
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'desc', 'badge')
    ordering = ('order',)
    fieldsets = (
        (_('مشخصات کارت خدمات زیر اسلایدر'), {
            'fields': ('title', 'badge', 'icon', 'desc', 'order', 'is_active')
        }),
    )


@admin.register(PageHeaderSetting)
class PageHeaderSettingAdmin(admin.ModelAdmin):
    list_display = ('page_key', 'hero_title', 'hero_badge_text', 'primary_button_text', 'is_active')
    list_filter = ('is_active', 'page_key')
    search_fields = ('hero_title', 'hero_description', 'hero_subtitle')
    fieldsets = (
        (_('شناسه صفحه'), {
            'fields': ('page_key', 'is_active')
        }),
        (_('متون هدر و هیرو'), {
            'fields': ('hero_badge_text', 'hero_title', 'hero_subtitle', 'hero_description')
        }),
        (_('دکمه‌های اقدام (Call to Action)'), {
            'fields': (
                ('primary_button_text', 'primary_button_link'),
                ('secondary_button_text', 'secondary_button_link')
            )
        }),
    )


@admin.register(ShippingTextsSetting)
class ShippingTextsSettingAdmin(admin.ModelAdmin):
    fieldsets = (
        (_('هدر و عنوان باربری'), {
            'fields': ('shipping_header_badge', 'shipping_header_title', 'shipping_header_desc')
        }),
        (_('راهنماهای بسته‌بندی و بیمه'), {
            'fields': ('packaging_guide_text', 'insurance_terms_text')
        }),
        (_('ارسال تهران و شهرستان‌ها'), {
            'fields': ('express_tehran_note', 'provincial_transit_note', 'minimum_freight_order_notice')
        }),
    )

    def has_add_permission(self, request):
        return ShippingTextsSetting.objects.count() == 0
`;

  const serializersCode = `"""
site_settings/serializers.py
سریالایزرهای DRF جهت دریافت تنظیمات کامل سایت، کارت‌های زیر اسلایدر، هدر و باربری
"""

from rest_framework import serializers
from .models import (
    SiteBranding, 
    SiteValueFeature,
    PageHeaderSetting, 
    ShippingTextsSetting
)


class SiteBrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteBranding
        fields = [
            'site_title',
            'site_title_en',
            'brand_short_name',
            'tagline',
            'logo_light',
            'logo_dark',
            'favicon',
            'is_announcement_active',
            'announcement_text',
            'announcement_badge',
            'announcement_link',
            'header_phone',
            'header_support_hours',
            'updated_at'
        ]


class SiteValueFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteValueFeature
        fields = ['id', 'title', 'desc', 'icon', 'badge', 'order', 'is_active']


class PageHeaderSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageHeaderSetting
        fields = [
            'page_key',
            'hero_badge_text',
            'hero_title',
            'hero_subtitle',
            'hero_description',
            'primary_button_text',
            'primary_button_link',
            'secondary_button_text',
            'secondary_button_link'
        ]


class ShippingTextsSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingTextsSetting
        fields = [
            'shipping_header_badge',
            'shipping_header_title',
            'shipping_header_desc',
            'packaging_guide_text',
            'insurance_terms_text',
            'express_tehran_note',
            'provincial_transit_note',
            'minimum_freight_order_notice'
        ]


class UnifiedPublicConfigSerializer(serializers.Serializer):
    """
    سریالایزر تجمیعی فوق‌سریع: ارسال کل تنظیمات سایت (لوگو، کارت‌های زیر اسلایدر، هدر و باربری)
    در یک درخواست سبک جهت کش در فرانت‌اند
    """
    branding = SiteBrandingSerializer()
    value_features = SiteValueFeatureSerializer(many=True)
    shipping_texts = ShippingTextsSettingSerializer()
    page_headers = PageHeaderSettingSerializer(many=True)
`;

  const viewsCode = `"""
site_settings/views.py
اندپوینت‌های DRF جهت واکشی و مدیریت تنظیمات عمومی سایت و کارت‌های زیر اسلایدر
"""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from drf_yasg.utils import swagger_auto_schema

from .models import (
    SiteBranding, 
    SiteValueFeature,
    PageHeaderSetting, 
    ShippingTextsSetting
)
from .serializers import (
    SiteBrandingSerializer,
    SiteValueFeatureSerializer,
    PageHeaderSettingSerializer,
    ShippingTextsSettingSerializer,
    UnifiedPublicConfigSerializer
)


class UnifiedPublicConfigView(APIView):
    """
    اندپوینت تجمیعی عمومی: واکشی کلیه اطلاعات برند، لوگو، متون هدر، کارت‌های ۴‌گانه زیر اسلایدر و باربری
    با کش سرور جهت حداکثر کارایی در فرانت‌اند React
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت کلیه تنظیمات عمومی سایت (لوگو، هدر، کارت‌های زیر اسلایدر، باربری)",
        operation_description="این اندپوینت کلیه اطلاعات مورد نیاز فرانت‌اند شامل لوگو، کارت‌های ۴‌گانه زیر اسلایدر، متون هدر صفحات و باربری را یکجا برمی‌گرداند.",
        responses={200: UnifiedPublicConfigSerializer}
    )
    def get(self, request):
        branding = SiteBranding.objects.first() or SiteBranding.objects.create()
        value_features = SiteValueFeature.objects.filter(is_active=True).order_by('order')
        shipping_texts = ShippingTextsSetting.objects.first() or ShippingTextsSetting.objects.create()
        page_headers = PageHeaderSetting.objects.filter(is_active=True)

        data = {
            'branding': SiteBrandingSerializer(branding, context={'request': request}).data,
            'value_features': SiteValueFeatureSerializer(value_features, many=True).data,
            'shipping_texts': ShippingTextsSettingSerializer(shipping_texts).data,
            'page_headers': PageHeaderSettingSerializer(page_headers, many=True).data,
        }
        return Response(data, status=status.HTTP_200_OK)


class SiteValueFeatureViewSet(viewsets.ModelViewSet):
    """
    ViewSet کامل ویرایش کارت‌های ۴‌گانه خدمات و مزایای زیر اسلایدر
    پشتیبانی از مدیریت تک‌تک کارت‌ها (POST/PUT/DELETE) و بروزرسانی یکجای (bulk_update)
    """
    queryset = SiteValueFeature.objects.all().order_by('order')
    serializer_class = SiteValueFeatureSerializer
    permission_classes = [AllowAny]  # یا IsAdminUser در محیط پروداکشن

    @swagger_auto_schema(
        methods=['post', 'put'],
        operation_summary="بروزرسانی دسته‌جمعی کارت‌های ۴‌گانه خدمات",
        request_body=SiteValueFeatureSerializer(many=True),
        responses={200: "ذخیره‌سازی موفق"}
    )
    @action(detail=False, methods=['post', 'put'], url_path='bulk_update')
    def bulk_update_features(self, request):
        features_data = request.data.get('features', request.data)
        if not isinstance(features_data, list):
            return Response({'error': 'لیست کارت‌ها معتبر نیست'}, status=status.HTTP_400_BAD_REQUEST)
        
        # بروزرسانی یا ثبت کارت‌های ارسال شده
        saved_items = []
        for idx, item in enumerate(features_data[:4]):
            obj_id = item.get('id')
            defaults = {
                'title': item.get('title', ''),
                'desc': item.get('desc') or item.get('description', ''),
                'icon': item.get('icon', 'shield-tick'),
                'badge': item.get('badge') or item.get('badge_text', ''),
                'order': item.get('order', idx + 1),
                'is_active': item.get('is_active', True)
            }
            if obj_id and isinstance(obj_id, int) and obj_id < 1000000:
                obj, _ = SiteValueFeature.objects.update_or_create(id=obj_id, defaults=defaults)
            else:
                obj = SiteValueFeature.objects.create(**defaults)
            saved_items.append(obj)
            
        serializer = self.get_serializer(saved_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
site_settings/urls.py
مسیرهای URL برای تنظیمات عمومی سایت، کارت‌های زیر اسلایدر و هدرها
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnifiedPublicConfigView, SiteValueFeatureViewSet

app_name = 'site_settings'

router = DefaultRouter()
router.register(r'value-features', SiteValueFeatureViewSet, basename='value-feature')

urlpatterns = [
    # اندپوینت تجمیعی واکشی تمامی تنظیمات برند، هدرها، کارت‌های زیر اسلایدر و باربری
    path('public-config/', UnifiedPublicConfigView.as_view(), name='public-config'),
    
    # اندپوینت مدیریت CRUD کارت‌های ۴‌گانه خدمات زیر اسلایدر
    path('', include(router.urls)),
]
`;

  const notesCode = `## 📌 راهنمای معماری تنظیمات سایت (site_settings)

نکته مهم: اطلاعات تماس، آدرس انبارها، پیام‌های فرم تماس و تنظیمات فوتر به اپلیکیشن اختصاصی **\`footer\`** و **\`warehouse_contact\`** منتقل شده‌اند. اپلیکیشن **\`site_settings\`** صرفاً مسئول مدیریت تنظیمات برندینگ، متون هدر، کارت‌های ۴‌گانه زیر اسلایدر و باربری است.

### ۱. اندپوینت‌های کلیدی این اپلیکیشن:
* **دریافت تمام تنظیمات سایت (لوگو، هدر، کارت‌های زیر اسلایدر، باربری):**
  \`GET /api/site-settings/public-config/\`
* **مدیریت کارت‌های ۴‌گانه خدمات زیر اسلایدر (مشاهده، افزودن، ویرایش و حذف):**
  \`GET / POST / PUT / DELETE /api/site-settings/value-features/\`

---

### ۲. اتصال در فرانت‌اند React و صندوق:
\`\`\`typescript
// دریافت خودکار در کامپوننت App.tsx
useEffect(() => {
  fetch('https://your-django-api.com/api/site-settings/public-config/')
    .then(res => res.json())
    .then(data => {
      // تنظیم لوگو، نام برند، کارت‌های ۴‌گانه زیر اسلایدر و متون هدر در State
      setBrandConfig(data.branding);
      setValueFeatures(data.value_features);
      setShippingTexts(data.shipping_texts);
    });
}, []);
\`\`\`

---

### ۳. ویژگی‌های اختصاصی این ماژول:
1. **الگوی Singleton:** مدل‌های Branding و ShippingTexts به صورت یکتا جهت تنظیمات پایه طراحی شده‌اند.
2. **منوی اختصاصی کارت‌های ۴‌گانه زیر اسلایدر:** با مدل \`SiteValueFeature\`، ادمین در پنل جنگو منوی اختصاصی «کارت‌های ۴‌گانه خدمات و مزایای زیر اسلایدر» را مشاهده کرده و می‌تواند هر ۴ مورد را به راحتی ویرایش، فعال/غیرفعال یا ترتیب‌بندی کند.
3. **اتصال کامل به صندوق:** تغییرات در پنل صندوق به صورت لحظه‌ای در این کارت‌ها اعمال می‌شود.
`;

  const renderActiveCode = () => {
    switch (activeTab) {
      case 'models': return modelsCode;
      case 'admin': return adminCode;
      case 'serializers': return serializersCode;
      case 'views': return viewsCode;
      case 'urls': return urlsCode;
      case 'notes': return notesCode;
      default: return modelsCode;
    }
  };

  const getTabLabel = (tab: CodeTab) => {
    switch (tab) {
      case 'models': return 'models.py (مدل‌های برند، هدر، کارت‌های زیر اسلایدر و باربری)';
      case 'admin': return 'admin.py (پنل ادمین، منوی ۴ کارت زیر اسلایدر و پیش‌نمایش لوگو)';
      case 'serializers': return 'serializers.py (سریالایزر تجمیعی و کارت‌ها)';
      case 'views': return 'views.py (APIView و ViewSet کارت‌های ۴‌گانه)';
      case 'urls': return 'urls.py (روت‌های API و کارت‌ها)';
      case 'notes': return 'راهنما و نکات معماری';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200/60">
              <Sliders className="w-3.5 h-3.5" />
              اپلیکیشن اختصاصی site_settings
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              تنظیمات سایت، لوگو، متون هدر، کارت‌های ۴‌گانه زیر اسلایدر و متون باربری
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-3xl">
              معماری کامل مدل‌های تنظیم لوگوی لایت و دارک، عنوان برند، متون هیرو و هدر صفحات، منوی اختصاصی کارت‌های ۴‌گانه زیر اسلایدر هیرو و کلیه متون اختصاصی باربری و بیمه با پنل ادمین پیشرفته و API تجمیعی.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(renderActiveCode(), activeTab)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {copiedKey === activeTab ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>کپی کد {activeTab}.py</span>
            </button>
          </div>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-4 border-t border-slate-100">
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
            <Image className="w-3.5 h-3.5 text-blue-600" />
            تنظیم لوگوی لایت/دارک و فاوآیکون
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
            <Type className="w-3.5 h-3.5 text-indigo-600" />
            متن هدر و هیروی تفکیکی صفحات
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            کارت‌های ۴‌گانه خدمات زیر اسلایدر
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            متون اختصاصی باربری و بیمه حمل‌ونقل
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['models', 'admin', 'serializers', 'views', 'urls', 'notes'] as CodeTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{tab === 'notes' ? 'راهنما و نکات' : `${tab}.py`}</span>
            </button>
          );
        })}
      </div>

      {/* Code Viewer Container */}
      <CodeViewer
        code={renderActiveCode()}
        filename={`site_settings/${activeTab === 'notes' ? 'README.md' : `${activeTab}.py`}`}
        badge={`site_settings / ${getTabLabel(activeTab)}`}
      />

    </div>
  );
};
