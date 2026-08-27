import React from 'react';
import { Users } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const RegularCustomersDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'regular_customers_regularcustomer',
      verboseName: 'مشتریان معمولی و عمده (ثبت‌نامی سایت)',
      description: 'مدیریت حساب‌های کاربری مشتریان عمده و خرد، اعتبارسنجی و سوابق خرید',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'user_id', type: 'OneToOneField(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'حساب کاربری' },
        { name: 'company_name', type: 'CharField(max_length=200)', verbose: 'نام واحد صنفی / شرکت' },
        { name: 'national_code', type: 'CharField(max_length=12)', verbose: 'کد ملی / شناسه ملی' },
        { name: 'economic_code', type: 'CharField(max_length=20)', verbose: 'کد اقتصادی' },
        { name: 'address', type: 'TextField', verbose: 'آدرس تحویل بار' },
        { name: 'is_verified', type: 'BooleanField(default=False)', verbose: 'تایید هویت شده' },
        { name: 'credit_limit', type: 'BigIntegerField', verbose: 'سقف اعتبار خرید تعهدی' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/regular-customers/profile/',
      auth: 'IsAuthenticated',
      description: 'دریافت پروفایل و اطلاعات صنفی مشتری معمولی / عمده'
    },
    {
      method: 'PUT',
      path: '/api/v1/regular-customers/profile/',
      auth: 'IsAuthenticated',
      description: 'به‌روزرسانی مشخصات حقوقی، آدرس و کدهای مالیاتی مشتری'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="regular_customers"
      title="مشتریان معمولی و عمده (Retail & Wholesale)"
      titleEn="regular_customers / Regular & Wholesale Customers App"
      badge="Customer Accounts"
      description="ماژول مدیریت مشتریان معمولی و عمده‌فروش، تایید هویت واحدهای صنفی، ثبت کدهای اقتصادی و کنترل سقف اعتبار خرید."
      icon={<Users className="w-6 h-6 text-blue-500" />}
      modelsCode={`from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User

class RegularCustomer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='regular_customer_profile', verbose_name=_("حساب کاربری"))
    company_name = models.CharField(_("نام واحد صنفی / شرکت"), max_length=200, blank=True, null=True)
    national_code = models.CharField(_("کد ملی / شناسه ملی"), max_length=12, blank=True, null=True)
    economic_code = models.CharField(_("کد اقتصادی"), max_length=20, blank=True, null=True)
    address = models.TextField(_("آدرس تحویل بار"), blank=True, null=True)
    is_verified = models.BooleanField(_("تایید هویت صنفی"), default=False)
    credit_limit = models.BigIntegerField(_("سقف اعتبار خرید (تومان)"), default=0)
    created_at = models.DateTimeField(_("تاریخ ثبت‌نام"), auto_now_add=True)

    class Meta:
        verbose_name = _("مشتری معمولی / عمده")
        verbose_name_plural = _("مدیریت مشتریان معمولی و عمده سایت")

    def __str__(self):
        return f"{self.company_name or self.user.full_name} ({self.user.phone})"
`}
      adminCode={`from django.contrib import admin
from .models import RegularCustomer

@admin.register(RegularCustomer)
class RegularCustomerAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'national_code', 'is_verified', 'credit_limit', 'created_at')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('company_name', 'national_code', 'user__phone', 'user__full_name')
    list_editable = ('is_verified', 'credit_limit')
`}
      serializersCode={`from rest_framework import serializers
from .models import RegularCustomer

class RegularCustomerSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='user.phone', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = RegularCustomer
        fields = ['id', 'full_name', 'phone', 'company_name', 'national_code', 'economic_code', 'address', 'is_verified', 'credit_limit', 'created_at']
        read_only_fields = ['id', 'is_verified', 'created_at']
`}
      viewsCode={`from rest_framework import viewsets, permissions
from .models import RegularCustomer
from .serializers import RegularCustomerSerializer

class RegularCustomerViewSet(viewsets.ModelViewSet):
    queryset = RegularCustomer.objects.all()
    serializer_class = RegularCustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return RegularCustomer.objects.all()
        return RegularCustomer.objects.filter(user=user)
`}
      urlsCode={`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegularCustomerViewSet

router = DefaultRouter()
router.register('profile', RegularCustomerViewSet, basename='regular-customer')

urlpatterns = [
    path('', include(router.urls)),
]
`}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
