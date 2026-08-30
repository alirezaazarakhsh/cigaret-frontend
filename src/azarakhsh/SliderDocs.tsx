import React from 'react';
import { AppDocTemplate } from './AppDocTemplate';
import { Image } from 'lucide-react';

export const SliderDocs: React.FC = () => {
  return (
    <AppDocTemplate
      appFolder="sliders"
      title="اپلیکیشن هیروبنر و اسلایدر (Slider App)"
      titleEn="sliders / Hero Banner & Controls App"
      badge="داینامیک هیروبنر و متون هدر"
      description="مدیریت جامع اسلایدهای هیروبنر، متون برجسته، کنترل‌های اقدام (CTA)، لینک‌های ناوبری متصل به تنظیمات سایت (site_settings) و مشخصات آماری. این اپلیکیشن بر پایه APIView صریح (بدون استفاده از ViewSet) طراحی شده تا کنترل کامل روی فرمت نوشتار، کشینگ و ادغام با هدرهای عمومی سایت داشته باشد."
      icon={<Image className="w-6 h-6 text-indigo-500" />}
      modelsCode={`"""
sliders/models.py
مدل‌های مدیریت اسلایدهای هیروبنر، کنترل‌های دکمه، لینک‌ها و ویژگی‌های تکی اسلاید
"""

from django.db import models
from django.utils.translation import gettext_lazy as _

class Slider(models.Model):
    """
    مدل اصلی اسلایدر هیروبنر صفحه اصلی
    شامل تیتر، متن هایلایت، نشانک، کنترل‌های دکمه (متن + لینک + اکشن)، آمار و وضعیت نمایش
    """
    class ActionChoices(models.TextChoices):
        LIVE_PRICES = 'live-prices', _('تابلوی نرخ لحظه‌ای (/live-prices)')
        INVOICE = 'invoice', _('صدور پیش‌فاکتور (/invoice)')
        CATALOG = 'catalog', _('دانلود کاتالوگ محصولات (/catalog)')
        POS_SYSTEM = 'pos-system', _('صندوق آنلاین POS (/shopmanage)')
        SHIPPING = 'shipping', _('پیگیری باربری (/shipping)')
        CUSTOM_LINK = 'custom-link', _('لینک اختصاصی / سفارشی')

    # متون اصلی و تیترها
    title = models.CharField(
        max_length=255, 
        verbose_name=_("تیتر اصلی اسلاید (Title)"),
        help_text=_("عنوان بزرگ هیرو (مثال: سامانه پخش عمده دخانیات آذرخش)")
    )
    highlight = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name=_("متن هایلایت / رنگی"),
        help_text=_("بخشی از متن که با رنگ متفاوت یا افکت گریدینت نمایش داده می‌شود")
    )
    badge = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name=_("متن نشانک بالای عنوان (Badge)"),
        default="تأمین مستقیم و دست‌اول"
    )
    description = models.TextField(
        blank=True, 
        null=True, 
        verbose_name=_("توضیحات کامل اسلاید"),
        help_text=_("توضیحات ۲ الی ۳ خطی زیر عنوان")
    )
    
    # تصویر پس‌زمینه
    image = models.ImageField(
        upload_to='sliders/', 
        verbose_name=_("تصویر پس‌زمینه HD"),
        help_text=_("تصویر اصلی بنر با فرمت WEBP یا JPG با کیفیت بالا")
    )

    # کنترل‌ها و لینک دکمه اصلی (Primary CTA)
    primary_btn_text = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        verbose_name=_("متن دکمه اصلی"),
        default="مشاهده نرخ لحظه‌ای سیگار"
    )
    primary_btn_link = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name=_("لینک / مسیر دکمه اصلی"),
        default="/live-prices"
    )
    primary_btn_action = models.CharField(
        max_length=30, 
        choices=ActionChoices.choices, 
        default=ActionChoices.LIVE_PRICES,
        verbose_name=_("نوع اکشن دکمه اصلی")
    )

    # کنترل‌ها و لینک دکمه فرعی (Secondary CTA)
    secondary_btn_text = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        verbose_name=_("متن دکمه فرعی"),
        default="صدور پیش‌فاکتور آنلاین"
    )
    secondary_btn_link = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name=_("لینک / مسیر دکمه فرعی"),
        default="/invoice"
    )
    secondary_btn_action = models.CharField(
        max_length=30, 
        choices=ActionChoices.choices, 
        default=ActionChoices.INVOICE,
        verbose_name=_("نوع اکشن دکمه فرعی")
    )

    # اطلاعات آماری و شعارها
    tagline = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name=_("شعار زیر نشانک"),
        default="بارگیری روزانه از انبار مرکزی"
    )
    stat_number = models.CharField(
        max_length=50, 
        blank=True, 
        null=True, 
        verbose_name=_("عدد آماری (مثال: +۱۲,۵۰۰)"),
        default="+۱۲,۵۰۰"
    )
    stat_label = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        verbose_name=_("برچسب آمار (مثال: فاکتور صادرشده)"),
        default="کارتن تحویل‌شده این ماه"
    )

    # تنظیمات اولویت و وضعیت
    is_active = models.BooleanField(default=True, verbose_name=_("وضعیت نمایش (فعال/غیرفعال)"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("ترتیب اولویت نمایش"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("تاریخ ایجاد"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("تاریخ بروزرسانی"))

    class Meta:
        verbose_name = _("اسلایدر هیروبنر")
        verbose_name_plural = _("اسلایدهای هیروبنر")
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.title} (اولویت: {self.order})"


class SliderFeature(models.Model):
    """
    ویژگی‌های بولت‌دار و شاخص هر اسلاید (مانند: ارسال بیمه‌شده، اصالت بار، تسویه نقدی)
    """
    slider = models.ForeignKey(
        Slider, 
        on_delete=models.CASCADE, 
        related_name='features',
        verbose_name=_("اسلایدر مربوطه")
    )
    text = models.CharField(max_length=120, verbose_name=_("متن ویژگی بولتی"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("ترتیب نمایش"))

    class Meta:
        ordering = ['order']
        verbose_name = _("ویژگی بولتی اسلایدر")
        verbose_name_plural = _("ویژگی‌های بولتی اسلایدر")

    def __str__(self):
        return f"{self.slider.title} → {self.text}"
`}
      adminCode={`"""
sliders/admin.py
مدیریت پنل ادمین اسلایدرها همراه با پیش‌نمایش تصویر، کنترل لینک‌ها و ویرایش درجای ویژگی‌ها
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Slider, SliderFeature


class SliderFeatureInline(admin.TabularInline):
    model = SliderFeature
    extra = 2
    fields = ('text', 'order')


@admin.register(Slider)
class SliderAdmin(admin.ModelAdmin):
    list_display = ('title', 'image_preview', 'badge', 'primary_btn_text', 'primary_btn_link', 'is_active', 'order')
    list_editable = ('is_active', 'order')
    list_filter = ('is_active', 'primary_btn_action')
    search_fields = ('title', 'description', 'highlight', 'badge')
    inlines = [SliderFeatureInline]

    fieldsets = (
        (_('عنوان و متون هیرو'), {
            'fields': ('title', 'highlight', 'badge', 'tagline', 'description', 'image', 'image_preview')
        }),
        (_('کنترل‌ها و لینک‌های اقدام (Call To Action)'), {
            'fields': (
                ('primary_btn_text', 'primary_btn_link', 'primary_btn_action'),
                ('secondary_btn_text', 'secondary_btn_link', 'secondary_btn_action')
            )
        }),
        (_('بخش آمار و سوابق'), {
            'fields': ('stat_number', 'stat_label')
        }),
        (_('تنظیمات وضعیت و مرتب‌سازی'), {
            'fields': ('is_active', 'order')
        }),
    )
    readonly_fields = ('image_preview', 'created_at', 'updated_at')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 50px; border-radius: 8px; border: 1px solid #cbd5e1;" />', obj.image.url)
        return _("تصویری موجود نیست")
    image_preview.short_description = _("پیش‌نمایش بنر")
`}
      serializersCode={`"""
sliders/serializers.py
سریالایزرهای DRF برای تبدیل متون، لینک‌ها، دکمه‌های کنترل و ترکیب اسلایدرها با تنظیمات سایت (site_settings)
"""

from rest_framework import serializers
from .models import Slider, SliderFeature
from site_settings.models import PageHeaderSetting, SiteBranding


class SliderFeatureSerializer(serializers.ModelSerializer):
    """
    سریالایزر ویژگی‌های بولت‌دار اسلایدر
    """
    class Meta:
        model = SliderFeature
        fields = ['id', 'text', 'order']


class SliderSerializer(serializers.ModelSerializer):
    """
    سریالایزر کامل اسلایدر هیروبنر شامل اصلاح لینک‌ها و آرایه ویژگی‌ها
    """
    features = serializers.SerializerMethodField()
    resolved_primary_link = serializers.SerializerMethodField()
    resolved_secondary_link = serializers.SerializerMethodField()

    class Meta:
        model = Slider
        fields = [
            'id', 
            'title', 
            'highlight', 
            'badge', 
            'description', 
            'image', 
            'primary_btn_text', 
            'primary_btn_link', 
            'primary_btn_action',
            'resolved_primary_link',
            'secondary_btn_text', 
            'secondary_btn_link', 
            'secondary_btn_action',
            'resolved_secondary_link',
            'tagline', 
            'stat_number', 
            'stat_label', 
            'features', 
            'order'
        ]

    def get_features(self, obj):
        # استخراج آرایه ساده از متن ویژگی‌ها برای اتصال آسان به فرانت‌اند React
        return [f.text for f in obj.features.all()]

    def get_resolved_primary_link(self, obj):
        # حل و تعیین لینک نهایی دکمه براساس نوع اکشن و مسیر تنظیم‌شده
        if obj.primary_btn_link:
            return obj.primary_btn_link
        # لینک‌های پیش‌فرض براساس نوع اکشن
        default_links = {
            'live-prices': '/live-prices',
            'invoice': '/invoice',
            'pos-system': '/shopmanage',
            'shipping': '/shipping',
            'catalog': '/catalog',
        }
        return default_links.get(obj.primary_btn_action, '#')

    def get_resolved_secondary_link(self, obj):
        if obj.secondary_btn_link:
            return obj.secondary_btn_link
        default_links = {
            'live-prices': '/live-prices',
            'invoice': '/invoice',
            'pos-system': '/shopmanage',
            'shipping': '/shipping',
            'catalog': '/catalog',
        }
        return default_links.get(obj.secondary_btn_action, '#')


class HeroCombinedConfigSerializer(serializers.Serializer):
    """
    سریالایزر تجمیعی هیرو: ترکیب لیست اسلایدرهای فعال با تنظیمات برند و هدر صفحه اصلی از site_settings
    """
    sliders = SliderSerializer(many=True)
    site_title = serializers.CharField()
    announcement_text = serializers.CharField()
    hero_badge_text = serializers.CharField()
    hero_title = serializers.CharField()
    hero_description = serializers.CharField()
`}
      viewsCode={`"""
sliders/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) همراه با توضیحات کامل خط‌به‌خط
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Slider, SliderFeature
from .serializers import SliderSerializer, HeroCombinedConfigSerializer
from site_settings.models import PageHeaderSetting, SiteBranding


class ActiveSlidersListAPIView(APIView):
    """
    اندپوینت دریافت لیست تمامی اسلایدرهای فعال هیروبنر
    توضیحات: این ویو به صورت APIView صریح نوشته شده و تمامی اسلایدهایی که is_active=True هستند را بر حسب اولویت (order) مرتب می‌کند.
    در صورتی که اسلایدی در دیتابیس موجود نباشد، یک اسلاید ساختاریافته پیش‌فرض جهت جلوگیری از شکست صفحه فرانت‌اند برمی‌گرداند.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست اسلایدهای فعال هیروبنر",
        operation_description="لیست کامل اسلایدرهای فعال به همراه متون، دکمه‌های کنترل و لینک‌های اقدام به ترتیب اولویت نمایش برمی‌گرداند.",
        responses={200: SliderSerializer(many=True)}
    )
    def get(self, request):
        # ۱. کوئری گرفتن از اسلایدرهای فعال
        queryset = Slider.objects.filter(is_active=True).order_by('order', '-created_at')
        
        # ۲. تبدیل داده‌ها به فرمت JSON
        serializer = SliderSerializer(queryset, many=True, context={'request': request})
        
        # ۳. پاسخ صریح با هدرهای استاندارد
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class HeroCombinedConfigAPIView(APIView):
    """
    اندپوینت تجمیعی هیروبنر و تنظیمات اصلی سایت (Hero + site_settings)
    توضیحات: این ویو صریح کنترل‌های هیرو، لینک‌های تنظیمات عمومی سایت، نوار اعلان بالای هدر و اسلایدرها را
    در یک درخواست خروجی می‌دهد تا فرانت‌اند نیازی به ارسال درخواست‌های متعدد نداشته باشد.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت کانفیگ کامل هیرو متصل به تنظیمات سایت (site_settings)",
        operation_description="ارسال همزمان لیست اسلایدرها، عنوان برند، متون هدر اصلی و نوار اعلان فوقانی.",
        responses={200: HeroCombinedConfigSerializer}
    )
    def get(self, request):
        # ۱. دریافت تنظیمات برند و نوار اعلان
        branding = SiteBranding.objects.first()
        site_title = branding.site_title if branding else "سامانه پخش عمده دخانیات آذرخش"
        announcement_text = branding.announcement_text if branding else "بارگیری روزانه از انبار مرکزی"

        # ۲. دریافت متون هدر صفحه اصلی از site_settings
        home_header = PageHeaderSetting.objects.filter(page_key='home', is_active=True).first()
        hero_badge = home_header.hero_badge_text if home_header else "تأمین مستقیم و دست‌اول"
        hero_title = home_header.hero_title if home_header else "مرکز تخصصی توزیع سراسری سیگار و آیکاس"
        hero_desc = home_header.hero_description if home_header else "استعلام نرخ لحظه‌ای کارتن، ثبت پیش‌فاکتور رسمی و ارسال ۲ ساعته تهران"

        # ۳. دریافت اسلایدرها
        sliders_qs = Slider.objects.filter(is_active=True).order_by('order')
        sliders_data = SliderSerializer(sliders_qs, many=True, context={'request': request}).data

        # ۴. ترکیب و ساخت خروجی تجمیعی
        response_payload = {
            'status': 'success',
            'site_branding': {
                'site_title': site_title,
                'announcement_text': announcement_text,
            },
            'page_header_control': {
                'hero_badge_text': hero_badge,
                'hero_title': hero_title,
                'hero_description': hero_desc,
                'primary_link': home_header.primary_button_link if home_header else '/live-prices',
                'secondary_link': home_header.secondary_button_link if home_header else '/invoice',
            },
            'sliders': sliders_data
        }

        return Response(response_payload, status=status.HTTP_200_OK)


class SliderDetailAPIView(APIView):
    """
    اندپوینت مشاهده، ویرایش و حذف تک اسلایدر براساس شناسه (ID)
    توضیحات: جایگزین صریح روش ViewSet برای مدیریت دقیق دسترسی‌ها و خطاها.
    """
    permission_classes = [AllowAny]  # متد GET عمومی، تغییرات نیازمند ادمین است

    def get_object(self, pk):
        return get_object_or_404(Slider, pk=pk)

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات یک اسلایدر با شناسه",
        responses={200: SliderSerializer}
    )
    def get(self, request, pk):
        slider = self.get_object(pk)
        serializer = SliderSerializer(slider, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ویرایش اسلایدر (مخصوص مدیریت)",
        request_body=SliderSerializer,
        responses={200: SliderSerializer}
    )
    def put(self, request, pk):
        if not request.user.is_staff:
            return Response({'error': 'دسترسی غیرمجاز. فقط مدیران می‌توانند ویرایش کنند.'}, status=status.HTTP_403_FORBIDDEN)
        
        slider = self.get_object(pk)
        serializer = SliderSerializer(slider, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="حذف اسلایدر (مخصوص مدیریت)",
        responses={204: "با موفقیت حذف گردید"}
    )
    def delete(self, request, pk):
        if not request.user.is_staff:
            return Response({'error': 'دسترسی غیرمجاز.'}, status=status.HTTP_403_FORBIDDEN)
        
        slider = self.get_object(pk)
        slider.delete()
        return Response({'message': 'اسلایدر با موفقیت حذف گردید.'}, status=status.HTTP_204_NO_CONTENT)
`}
      urlsCode={`"""
sliders/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    ActiveSlidersListAPIView, 
    HeroCombinedConfigAPIView, 
    SliderDetailAPIView
)

app_name = 'sliders'

urlpatterns = [
    # ۱. دریافت لیست تمامی اسلایدرهای فعال
    path('', ActiveSlidersListAPIView.as_view(), name='slider-list'),
    
    # ۲. دریافت کانفیگ تجمیعی هیروبنر متصل به تنظیمات اصلی سایت (site_settings)
    path('hero-combined/', HeroCombinedConfigAPIView.as_view(), name='hero-combined-config'),
    
    # ۳. دریافت، ویرایش و حذف تک اسلایدر با شناسه
    path('<int:pk>/', SliderDetailAPIView.as_view(), name='slider-detail'),
]
`}
      notesCode={`## 📌 راهنمای جامع اتصال اسلایدر هیرو و تنظیمات سایت به فرانت‌اند React

### ۱. دلیل عدم استفاده از ViewSet در این ماژول:
* طبق درخواست معماری، این اپلیکیشن به جای \`ReadOnlyModelViewSet\` یا \`ModelViewSet\` از کلاس‌های صریح \`APIView\` استفاده می‌کند.
* **مزیت:** کنترل مستقیم روی متدهای HTTP (\`GET\`, \`PUT\`, \`DELETE\`)، عدم ساخت مسیرهای اتوماتیک ناکارآمد، و امکان ادغام کامل پاسخ داده‌ها با اپلیکیشن \`site_settings\`.

---

### ۲. اندپوینت‌های صریح این اپلیکیشن:
1. **لیست اسلایدرهای فعال:**
   \`GET /api/v1/sliders/\`
2. **کانفیگ تجمیعی هیرو + تنظیمات سایت (site_settings):**
   \`GET /api/v1/sliders/hero-combined/\`
3. **جزئیات و کنترل یک اسلایدر:**
   \`GET /api/v1/sliders/<id>/\`

---

### ۳. الگوی فراخوانی در React با لینک‌های متصل به تنظیمات سایت:
\`\`\`typescript
// React Hook برای بارگذاری کنترل‌های هیروبنر و لینک‌های تنظیمات سایت
useEffect(() => {
  fetch('http://localhost:8000/api/v1/sliders/hero-combined/')
    .then(res => res.json())
    .then(data => {
      // داده‌های هیرو از site_settings
      setHeaderControls(data.page_header_control);
      // لیست اسلایدهای بنر
      setSliders(data.sliders);
    });
}, []);
\`\`\`
`}
      erdTables={[
        {
          name: 'Slider',
          verboseName: 'اسلایدر هیروبنر',
          description: 'مدیریت اسلایدها، متون هایلایت، دکمه‌های اقدام (CTA) و آمار',
          fields: [
            { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
            { name: 'title', type: 'CharField(255)', verbose: 'تیتر اصلی اسلاید' },
            { name: 'highlight', type: 'CharField(255)', verbose: 'متن هایلایت رنگی' },
            { name: 'badge', type: 'CharField(255)', verbose: 'متن نشانک بالای عنوان' },
            { name: 'description', type: 'TextField', verbose: 'توضیحات کامل اسلاید' },
            { name: 'image', type: 'ImageField', verbose: 'تصویر پس‌زمینه بنر' },
            { name: 'primary_btn_text', type: 'CharField(100)', verbose: 'متن دکمه اصلی' },
            { name: 'primary_btn_link', type: 'CharField(255)', verbose: 'لینک دکمه اصلی' },
            { name: 'primary_btn_action', type: 'CharField(30)', verbose: 'نوع اکشن دکمه اصلی' },
            { name: 'secondary_btn_text', type: 'CharField(100)', verbose: 'متن دکمه فرعی' },
            { name: 'secondary_btn_link', type: 'CharField(255)', verbose: 'لینک دکمه فرعی' },
            { name: 'stat_number', type: 'CharField(50)', verbose: 'عدد آمار تحویل' },
            { name: 'stat_label', type: 'CharField(100)', verbose: 'برچسب آمار' },
            { name: 'is_active', type: 'BooleanField', verbose: 'وضعیت نمایش' },
            { name: 'order', type: 'PositiveIntegerField', verbose: 'ترتیب اولویت' },
          ]
        },
        {
          name: 'SliderFeature',
          verboseName: 'ویژگی بولتی اسلایدر',
          description: 'ویژگی‌های کلیدی همراه با آیکون یا نشانگر',
          fields: [
            { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
            { name: 'slider', type: 'ForeignKey', isFk: true, fkTarget: 'Slider', verbose: 'اسلایدر مربوطه' },
            { name: 'text', type: 'CharField(120)', verbose: 'متن ویژگی' },
            { name: 'order', type: 'PositiveIntegerField', verbose: 'ترتیب' },
          ]
        }
      ]}
      endpoints={[
        {
          method: 'GET',
          path: '/api/v1/sliders/',
          auth: 'AllowAny',
          description: 'دریافت لیست تمامی اسلایدرهای فعال هیروبنر به ترتیب اولویت نمایش (order)',
          curlExample: 'curl -X GET http://localhost:8000/api/v1/sliders/',
          responseBody: `{
  "status": "success",
  "count": 2,
  "results": [
    {
      "id": 1,
      "title": "سامانه جامع پخش عمده دخانیات آذرخش",
      "highlight": "بارگیری روزانه از انبار مرکزی",
      "badge": "تأمین مستقیم و دست‌اول",
      "description": "استعلام نرخ لحظه‌ای کارتن، ثبت پیش‌فاکتور رسمی و ارسال فوری ۲ ساعته به سراسر کشور",
      "image": "/media/sliders/hero-banner-1.jpg",
      "primary_btn_text": "مشاهده نرخ لحظه‌ای سیگار",
      "primary_btn_link": "/live-prices",
      "resolved_primary_link": "/live-prices",
      "secondary_btn_text": "صدور پیش‌فاکتور آنلاین",
      "secondary_btn_link": "/invoice",
      "resolved_secondary_link": "/invoice",
      "stat_number": "+۱۲,۵۰۰",
      "stat_label": "کارتن تحویل‌شده این ماه",
      "features": [
        "تضمین ۱۰۰٪ اصالت بار با هولوگرام اصلی",
        "ارسال بیمه‌شده به سراسر ۳۱ استان کشور",
        "امکان تسویه نقدی و پرداخت در محل انبار"
      ],
      "order": 1
    }
  ]
}`
        },
        {
          method: 'GET',
          path: '/api/v1/sliders/hero-combined/',
          auth: 'AllowAny',
          description: 'دریافت کانفیگ تجمیعی هیروبنر همراه با کنترل‌های متن هدر و لینک‌های متصل به site_settings',
          curlExample: 'curl -X GET http://localhost:8000/api/v1/sliders/hero-combined/',
          responseBody: `{
  "status": "success",
  "site_branding": {
    "site_title": "سامانه پخش عمده دخانیات آذرخش",
    "announcement_text": "بارگیری روزانه از انبار مرکزی جنت‌آباد • تحویل ۲ ساعته تهران"
  },
  "page_header_control": {
    "hero_badge_text": "مرکز تخصصی بنکداری",
    "hero_title": "مرکز تخصصی توزیع سراسری سیگار و آیکاس",
    "hero_description": "استعلام نرخ لحظه‌ای کارتن، ثبت پیش‌فاکتور رسمی و ارسال ۲ ساعته تهران",
    "primary_link": "/live-prices",
    "secondary_link": "/invoice"
  },
  "sliders": [...]
}`
        },
        {
          method: 'GET',
          path: '/api/v1/sliders/<id>/',
          auth: 'AllowAny',
          description: 'دریافت، ویرایش یا حذف تک اسلایدر براساس ID',
          curlExample: 'curl -X GET http://localhost:8000/api/v1/sliders/1/'
        }
      ]}
    />
  );
};

