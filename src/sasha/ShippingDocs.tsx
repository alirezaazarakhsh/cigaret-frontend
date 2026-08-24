import React, { useState } from 'react';
import { Truck, Copy, Check, FileCode, MapPin, Building2, Layers } from 'lucide-react';
import { CodeTab } from './types';

export const ShippingDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelsCode = `"""
shipping/models.py
مدل‌های باربری‌ها، تعرفه ارسال به استان‌ها، و پایگاه‌های توزیع و تحویل انبار
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


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
مدیریت باربری‌ها و تعرفه‌های استانی در پنل ادمین جنگو
"""

from django.contrib import admin
from .models import ShippingCarrier, ProvinceTariff


class ProvinceTariffInline(admin.TabularInline):
    model = ProvinceTariff
    extra = 3


@admin.register(ShippingCarrier)
class ShippingCarrierAdmin(admin.ModelAdmin):
    list_display = ('name', 'hub_name', 'phone', 'base_fare_toman', 'estimated_delivery_time', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'hub_name', 'phone')
    inlines = [ProvinceTariffInline]


@admin.register(ProvinceTariff)
class ProvinceTariffAdmin(admin.ModelAdmin):
    list_display = ('province_name', 'city_center', 'carrier', 'per_carton_rate_toman', 'transit_days')
    list_filter = ('carrier', 'province_name')
    search_fields = ('province_name', 'city_center')
`;

  const serializersCode = `"""
shipping/serializers.py
سریالایزرهای DRF برای استعلام نرخ کرایه و لیست باربری‌ها
"""

from rest_framework import serializers
from .models import ShippingCarrier, ProvinceTariff


class ProvinceTariffSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProvinceTariff
        fields = ['id', 'province_name', 'city_center', 'per_carton_rate_toman', 'per_box_rate_toman', 'transit_days']


class ShippingCarrierSerializer(serializers.ModelSerializer):
    province_tariffs = ProvinceTariffSerializer(many=True, read_only=True)

    class Meta:
        model = ShippingCarrier
        fields = [
            'id', 'name', 'hub_name', 'phone', 'coverage_area',
            'estimated_delivery_time', 'base_fare_toman', 'is_active', 'province_tariffs'
        ]
`;

  const viewsCode = `"""
shipping/views.py
ویوهای API جنگو برای استعلام نرخ باربری و مشاهده باربری‌های فعال
"""

from rest_framework import generics, permissions
from drf_yasg.utils import swagger_auto_schema
from .models import ShippingCarrier, ProvinceTariff
from .serializers import ShippingCarrierSerializer, ProvinceTariffSerializer


class ShippingCarrierListAPIView(generics.ListAPIView):
    """
    دریافت لیست باربری‌های طرف قرارداد به همراه تعرفه‌ها
    """
    queryset = ShippingCarrier.objects.filter(is_active=True).prefetch_related('province_tariffs')
    serializer_class = ShippingCarrierSerializer
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="دریافت لیست باربری‌های فعال و تعرفه‌های ارسال به سراسر کشور",
        responses={200: ShippingCarrierSerializer(many=True)},
        tags=["حمل‌ونقل و باربری"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
`;

  const urlsCode = `"""
shipping/urls.py
مسیرهای روت برای اپلیکیشن باربری و حمل‌ونقل
"""

from django.urls import path
from .views import ShippingCarrierListAPIView

app_name = 'shipping'

urlpatterns = [
    path('carriers/', ShippingCarrierListAPIView.as_view(), name='shipping_carriers'),
]
`;

  return (
    <div className="space-y-6 text-slate-800 text-right" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">اپلیکیشن حمل‌ونقل (shipping)</div>
            <h1 className="text-2xl font-black text-slate-900">
              مدیریت شرکت‌های باربری، پایانه‌های شوش و تعرفه‌های استانی کارتن
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          محاسبه دقیق کرایه حمل از انبار جنت‌آباد به تمامی استان‌های کشور بر اساس تعداد کارتن و باربری منتخب.
        </p>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'models', label: 'مدل‌ها (models.py)' },
          { id: 'admin', label: 'پنل ادمین (admin.py)' },
          { id: 'serializers', label: 'سریالایزرها (serializers.py)' },
          { id: 'views', label: 'ویوهای API (views.py)' },
          { id: 'urls', label: 'روت‌ها (urls.py)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as CodeTab)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 relative font-mono text-xs shadow-xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4" dir="ltr">
          <span className="text-slate-400 font-bold">
            shipping/{activeTab === 'models' ? 'models.py' : activeTab === 'admin' ? 'admin.py' : activeTab === 'serializers' ? 'serializers.py' : activeTab === 'views' ? 'views.py' : 'urls.py'}
          </span>
          <button
            onClick={() => handleCopy(
              activeTab === 'models' ? modelsCode : activeTab === 'admin' ? adminCode : activeTab === 'serializers' ? serializersCode : activeTab === 'views' ? viewsCode : urlsCode,
              activeTab
            )}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            {copiedKey === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی کد</span>
              </>
            )}
          </button>
        </div>

        <pre className="overflow-x-auto text-left leading-relaxed whitespace-pre font-mono text-[11px] sm:text-xs" dir="ltr">
          {activeTab === 'models' ? modelsCode : activeTab === 'admin' ? adminCode : activeTab === 'serializers' ? serializersCode : activeTab === 'views' ? viewsCode : urlsCode}
        </pre>
      </div>
    </div>
  );
};
