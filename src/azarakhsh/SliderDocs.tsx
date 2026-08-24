import React from 'react';
import { AppDocTemplate } from './AppDocTemplate';
import { Image } from 'lucide-react';

export const SliderDocs: React.FC = () => {
  return (
    <AppDocTemplate
      appFolder="sliders"
      title="اپلیکیشن هیروبنر و اسلایدر (Slider App)"
      titleEn="sliders / Hero Banner App"
      badge="داینامیک هیروبنر"
      description="مدیریت جامع اسلایدهای هیروبنر صفحه اصلی. شامل تنظیم تصاویر پس‌زمینه با کیفیت، متون (تیتر، توضیحات، آمار)، دکمه‌های اکشن اولیه و ثانویه، و همچنین لیست ویژگی‌های بولت‌دار (Features). قابلیت مرتب‌سازی و فعال/غیرفعال کردن اسلایدها."
      icon={<Image className="w-6 h-6 text-indigo-500" />}
      modelsCode={`from django.db import models
from django.utils.translation import gettext_lazy as _

class Slider(models.Model):
    class ActionChoices(models.TextChoices):
        LIVE_PRICES = 'live-prices', _('Live Prices')
        INVOICE = 'invoice', _('Invoice')
        CATALOG = 'catalog', _('Catalog')
        PDF = 'pdf', _('PDF Download')
        IQOS = 'iqos', _('IQOS')
        SHIPPING = 'shipping', _('Shipping')

    title = models.CharField(max_length=255, verbose_name=_("Title (تیتر اصلی)"))
    image = models.ImageField(upload_to='sliders/', verbose_name=_("Background Image (تصویر پس‌زمینه)"))
    
    badge = models.CharField(max_length=255, verbose_name=_("Badge Text (متن نشان)"), blank=True, null=True)
    highlight = models.CharField(max_length=255, verbose_name=_("Highlight (متن برجسته)"), blank=True, null=True)
    description = models.TextField(verbose_name=_("Description (توضیحات)"), blank=True, null=True)
    
    # Action Buttons
    primary_btn_text = models.CharField(max_length=100, verbose_name=_("Primary Button Text"), blank=True, null=True)
    primary_btn_action = models.CharField(max_length=20, choices=ActionChoices.choices, verbose_name=_("Primary Button Action"), blank=True, null=True)
    secondary_btn_text = models.CharField(max_length=100, verbose_name=_("Secondary Button Text"), blank=True, null=True)
    secondary_btn_action = models.CharField(max_length=20, choices=ActionChoices.choices, verbose_name=_("Secondary Button Action"), blank=True, null=True)
    
    # Stats
    tagline = models.CharField(max_length=255, verbose_name=_("Tagline (شعار زیر نشان)"), blank=True, null=True)
    stat_number = models.CharField(max_length=50, verbose_name=_("Stat Number (عدد آمار)"), blank=True, null=True)
    stat_label = models.CharField(max_length=100, verbose_name=_("Stat Label (برچسب آمار)"), blank=True, null=True)
    
    # Config
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active (فعال؟)"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Display Order (ترتیب نمایش)"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Slider")
        verbose_name_plural = _("Sliders")
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

class SliderFeature(models.Model):
    slider = models.ForeignKey(Slider, on_delete=models.CASCADE, related_name='features')
    text = models.CharField(max_length=100, verbose_name=_("Feature Text (متن ویژگی)"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Order"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Slider Feature")
        verbose_name_plural = _("Slider Features")

    def __str__(self):
        return f"{self.slider.title} - {self.text}"`}
      adminCode={`from django.contrib import admin
from .models import Slider, SliderFeature

class SliderFeatureInline(admin.TabularInline):
    model = SliderFeature
    extra = 1

@admin.register(Slider)
class SliderAdmin(admin.ModelAdmin):
    list_display = ('title', 'badge', 'is_active', 'order')
    list_editable = ('is_active', 'order')
    list_filter = ('is_active',)
    search_fields = ('title', 'description', 'badge')
    inlines = [SliderFeatureInline]
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'description', 'highlight', 'badge', 'tagline', 'image')
        }),
        ('Action Buttons', {
            'fields': (
                ('primary_btn_text', 'primary_btn_action'),
                ('secondary_btn_text', 'secondary_btn_action')
            )
        }),
        ('Statistics', {
            'fields': ('stat_number', 'stat_label')
        }),
        ('Settings', {
            'fields': ('is_active', 'order')
        }),
    )`}
      serializersCode={`from rest_framework import serializers
from .models import Slider, SliderFeature

class SliderFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SliderFeature
        fields = ['id', 'text', 'order']

class SliderSerializer(serializers.ModelSerializer):
    features = serializers.SerializerMethodField()
    badge_icon = serializers.SerializerMethodField()
    badge_color = serializers.SerializerMethodField()

    class Meta:
        model = Slider
        fields = [
            'id', 'title', 'badge', 'badge_icon', 'badge_color', 'highlight', 
            'description', 'image', 'primary_btn_text', 'primary_btn_action', 
            'secondary_btn_text', 'secondary_btn_action', 'tagline', 
            'stat_number', 'stat_label', 'features', 'order'
        ]

    def get_features(self, obj):
        # Extract just the text array to match React frontend structure easily
        return [feature.text for feature in obj.features.all()]
        
    def get_badge_icon(self, obj):
        # Default fallback or dynamic logic if you choose to store icon names in DB
        return "Sparkles"
        
    def get_badge_color(self, obj):
        # Default fallback or dynamic logic for Tailwind classes
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"`}
      viewsCode={`from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Slider
from .serializers import SliderSerializer

class SliderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows active sliders to be viewed.
    """
    queryset = Slider.objects.filter(is_active=True).order_by('order')
    serializer_class = SliderSerializer
    permission_classes = [AllowAny]
`}
      urlsCode={`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SliderViewSet

app_name = 'sliders'

router = DefaultRouter()
router.register(r'sliders', SliderViewSet, basename='slider')

urlpatterns = [
    path('', include(router.urls)),
]`}
      erdTables={[
        {
          name: 'Slider',
          verboseName: 'هیروبنر و اسلایدر',
          description: 'مدیریت اسلایدهای اصلی صفحه فرانت‌اند',
          fields: [
            { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'ID' },
            { name: 'title', type: 'CharField(255)', verbose: 'تیتر اصلی' },
            { name: 'badge', type: 'CharField(255)', verbose: 'متن نشان' },
            { name: 'image', type: 'ImageField', verbose: 'تصویر پس‌زمینه' },
            { name: 'primary_btn_action', type: 'CharField(20)', verbose: 'اکشن دکمه اصلی' },
            { name: 'is_active', type: 'BooleanField', verbose: 'وضعیت نمایش' },
            { name: 'order', type: 'PositiveIntegerField', verbose: 'ترتیب نمایش' },
          ]
        },
        {
          name: 'SliderFeature',
          verboseName: 'ویژگی‌های بولت‌دار اسلاید',
          description: 'آیتم‌های ویژگی (مانند ارسال فوری، بسته بندی ۵ لایه)',
          fields: [
            { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'ID' },
            { name: 'slider', type: 'ForeignKey', isFk: true, fkTarget: 'Slider', verbose: 'اسلایدر والد' },
            { name: 'text', type: 'CharField(100)', verbose: 'متن ویژگی' },
            { name: 'order', type: 'PositiveIntegerField', verbose: 'ترتیب' },
          ]
        }
      ]}
      endpoints={[
        {
          method: 'GET',
          path: '/api/v1/sliders/',
          auth: 'AllowAny',
          description: 'دریافت لیست تمامی اسلایدرهای فعال به ترتیب فیلد order',
        }
      ]}
    />
  );
};
