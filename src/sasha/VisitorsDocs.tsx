import React, { useState } from 'react';
import { Users, Copy, Check, FileCode, Award, TrendingUp, Store, Layers } from 'lucide-react';
import { CodeTab } from './types';

export const VisitorsDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelsCode = `"""
visitors/models.py
مدل‌های سیستم ویزیتوری، کدهای اختصاصی ویزیتور، باشگاه مشتریان (مغازه‌داران) و گزارش کمیسیون سود
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from orders.models import Order


class VisitorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='visitor_profile', verbose_name=_("حساب کاربر ویزیتور"))
    visitor_code = models.CharField(_("کد اختصاصی ویزیتور"), max_length=50, unique=True, db_index=True, help_text="مثال: VISITOR-9419")
    commission_rate = models.DecimalField(_("درصد سود/کمیسیون ویزیتور"), max_digits=5, decimal_places=2, default=2.50)
    total_sales_amount = models.DecimalField(_("مجموع مبلغ فروش‌های ثبت‌شده"), max_digits=14, decimal_places=0, default=0)
    total_commission_earned = models.DecimalField(_("مجموع سود و کمیسیون دریافتی"), max_digits=12, decimal_places=0, default=0)
    is_active = models.BooleanField(_("ویزیتور فعال"), default=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)

    class Meta:
        verbose_name = _("پروفایل ویزیتور")
        verbose_name_plural = _("مدیریت ویزیتوران و کمیسیون‌ها")

    def __str__(self):
        return f"ویزیتور: {self.user.full_name} (کد: {self.visitor_code})"


class RetailShopCustomer(models.Model):
    visitor = models.ForeignKey(VisitorProfile, on_delete=models.CASCADE, related_name='retail_shops', verbose_name=_("ویزیتور معرف"))
    shop_name = models.CharField(_("نام مغازه / سوپرمارکت"), max_length=200)
    owner_name = models.CharField(_("نام صاحب مغازه"), max_length=150)
    phone = models.CharField(_("شماره تماس مغازه‌دار"), max_length=15)
    city = models.CharField(_("شهر"), max_length=60, default="تهران")
    address = models.TextField(_("آدرس دقیق مغازه"))
    license_no = models.CharField(_("شماره پروانه کسب"), max_length=50, blank=True, null=True)
    total_purchases = models.DecimalField(_("مجموع خریدهای مغازه"), max_digits=12, decimal_places=0, default=0)
    created_at = models.DateTimeField(_("تاریخ ثبت در باشگاه"), auto_now_add=True)

    class Meta:
        verbose_name = _("مغازه باشگاه مشتریان")
        verbose_name_plural = _("باشگاه مشتریان مغازه‌داران ویزیتور")

    def __str__(self):
        return f"{self.shop_name} - {self.owner_name} ({self.city})"


class VisitorCommissionLog(models.Model):
    visitor = models.ForeignKey(VisitorProfile, on_delete=models.CASCADE, related_name='commissions', verbose_name=_("ویزیتور"))
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='visitor_commissions', verbose_name=_("سفارش مرجع"))
    retail_shop = models.ForeignKey(RetailShopCustomer, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("مغازه خریدار"))
    sale_amount = models.DecimalField(_("مبلغ کل فاکتور فروش"), max_digits=12, decimal_places=0)
    commission_rate = models.DecimalField(_("درصد کمیسیون اعمالی"), max_digits=5, decimal_places=2)
    commission_amount = models.DecimalField(_("مبلغ سود و کمیسیون ویزیتور"), max_digits=10, decimal_places=0)
    is_settled = models.BooleanField(_("تسویه شده با ویزیتور"), default=False)
    created_at = models.DateTimeField(_("تاریخ ثبت تراکنش کمیسیون"), auto_now_add=True)

    class Meta:
        verbose_name = _("گزارش سود و کمیسیون ویزیتور")
        verbose_name_plural = _("گزارشات مالی سود و کمیسیون ویزیتوران")
        ordering = ['-created_at']

    def __str__(self):
        return f"کمیسیون {self.visitor.visitor_code} برای فاکتور {self.order.order_number}: {self.commission_amount} تومان"
`;

  const adminCode = `"""
visitors/admin.py
مدیریت ویزیتوران، مغازه‌داران و تسویه کمیسیون‌ها در پنل ادمین جنگو
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import VisitorProfile, RetailShopCustomer, VisitorCommissionLog


@admin.register(VisitorProfile)
class VisitorProfileAdmin(admin.ModelAdmin):
    list_display = ('visitor_code', 'user', 'commission_rate', 'total_sales_amount', 'total_commission_earned', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('visitor_code', 'user__full_name', 'user__phone')


@admin.register(RetailShopCustomer)
class RetailShopCustomerAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'owner_name', 'phone', 'city', 'visitor', 'total_purchases', 'created_at')
    list_filter = ('city', 'created_at')
    search_fields = ('shop_name', 'owner_name', 'phone', 'visitor__visitor_code')


@admin.register(VisitorCommissionLog)
class VisitorCommissionLogAdmin(admin.ModelAdmin):
    list_display = ('visitor', 'order', 'retail_shop', 'sale_amount', 'commission_amount', 'is_settled', 'created_at')
    list_filter = ('is_settled', 'created_at')
    search_fields = ('visitor__visitor_code', 'order__order_number', 'retail_shop__shop_name')
    list_editable = ('is_settled',)
`;

  const serializersCode = `"""
visitors/serializers.py
سریالایزرهای DRF برای ویزیتوران، ثبت مغازه‌دار و دریافت گزارش کمیسیون
"""

from rest_framework import serializers
from .models import VisitorProfile, RetailShopCustomer, VisitorCommissionLog


class RetailShopCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetailShopCustomer
        fields = ['id', 'shop_name', 'owner_name', 'phone', 'city', 'address', 'license_no', 'total_purchases', 'created_at']
        read_only_fields = ['id', 'total_purchases', 'created_at']


class VisitorCommissionLogSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    shop_name = serializers.CharField(source='retail_shop.shop_name', read_only=True)

    class Meta:
        model = VisitorCommissionLog
        fields = ['id', 'order_number', 'shop_name', 'sale_amount', 'commission_rate', 'commission_amount', 'is_settled', 'created_at']


class VisitorProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    retail_shops = RetailShopCustomerSerializer(many=True, read_only=True)

    class Meta:
        model = VisitorProfile
        fields = [
            'id', 'visitor_code', 'full_name', 'phone', 'commission_rate',
            'total_sales_amount', 'total_commission_earned', 'is_active', 'retail_shops'
        ]
`;

  const viewsCode = `"""
visitors/views.py
ویوهای API جنگو برای پنل ویزیتوری و ثبت مغازه‌های خریدار
"""

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .models import VisitorProfile, RetailShopCustomer, VisitorCommissionLog
from .serializers import VisitorProfileSerializer, RetailShopCustomerSerializer, VisitorCommissionLogSerializer


class VisitorDashboardAPIView(APIView):
    """
    مشاهده گزارشات فروش، درصد کمیسیون و لیست مغازه‌داران ویزیتور
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="دریافت کارنامه مالی ویزیتور لاگین‌شده",
        responses={200: VisitorProfileSerializer},
        tags=["ویزیتوری و باشگاه مشتریان"]
    )
    def get(self, request):
        profile = getattr(request.user, 'visitor_profile', None)
        if not profile:
            return Response({'error': 'حساب ویزیتوری برای این کاربر تعریف نشده است.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(VisitorProfileSerializer(profile).data)


class RetailShopListCreateAPIView(generics.ListCreateAPIView):
    """
    ثبت مغازه / سوپرمارکت جدید تحت پوشش ویزیتور
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RetailShopCustomerSerializer

    def get_queryset(self):
        profile = getattr(self.request.user, 'visitor_profile', None)
        if not profile:
            return RetailShopCustomer.objects.none()
        return profile.retail_shops.all()

    def perform_create(self, serializer):
        profile = getattr(self.request.user, 'visitor_profile', None)
        if not profile:
            raise serializers.ValidationError('فقط ویزیتوران مجاز به ثبت مشتری هستند.')
        serializer.save(visitor=profile)

    @swagger_auto_schema(
        operation_description="مشاهده و ثبت مغازه‌داران در باشگاه مشتریان",
        tags=["ویزیتوری و باشگاه مشتریان"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
`;

  const urlsCode = `"""
visitors/urls.py
مسیرهای روت برای اپلیکیشن ویزیتوران و باشگاه مشتریان
"""

from django.urls import path
from .views import VisitorDashboardAPIView, RetailShopListCreateAPIView

app_name = 'visitors'

urlpatterns = [
    path('dashboard/', VisitorDashboardAPIView.as_view(), name='visitor_dashboard'),
    path('retail-shops/', RetailShopListCreateAPIView.as_view(), name='retail_shops'),
]
`;

  return (
    <div className="space-y-6 text-slate-800 text-right" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">اپلیکیشن ویزیتوری (visitors)</div>
            <h1 className="text-2xl font-black text-slate-900">
              مدیریت ویزیتوران، باشگاه مشتریان مغازه‌دار و کمیسیون سود فروش
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          محاسبه خودکار ۲.۵٪ سود ویزیتوری بر روی سفارشات کارتن و ثبت سوپرمارکت‌ها در باشگاه مشتریان.
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
            visitors/{activeTab === 'models' ? 'models.py' : activeTab === 'admin' ? 'admin.py' : activeTab === 'serializers' ? 'serializers.py' : activeTab === 'views' ? 'views.py' : 'urls.py'}
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
