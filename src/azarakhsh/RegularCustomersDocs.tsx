import React from 'react';
import { Users } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const RegularCustomersDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'regular_customers_regularcustomer',
      verboseName: 'مشتریان معمولی و عمده (ثبت‌نامی سایت)',
      description: 'مدیریت حساب‌های کاربری مشتریان خرد و خریداران عمده بنکداری، اعتبارسنجی مدارک، تعیین سقف خرید و سوابق مالی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'user_id', type: 'OneToOneField(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'حساب کاربری سیستم' },
        { name: 'customer_type', type: 'CharField(choices: retail, wholesale, vip_agency)', verbose: 'نوع خریدار (خرد/عمده/نمایندگی)' },
        { name: 'company_name', type: 'CharField(max_length=200)', verbose: 'نام واحد صنفی / اسم فروشگاه' },
        { name: 'national_code', type: 'CharField(max_length=12)', verbose: 'کد ملی / شناسه ملی حقوقی' },
        { name: 'economic_code', type: 'CharField(max_length=20)', verbose: 'کد اقتصادی مالیاتی' },
        { name: 'postal_code', type: 'CharField(max_length=10)', verbose: 'کد پستی انبار مشتری' },
        { name: 'address', type: 'TextField', verbose: 'آدرس دقیق جهت ارسال بار' },
        { name: 'is_verified', type: 'BooleanField(default=False)', verbose: 'تایید هویت و جواز کسب' },
        { name: 'credit_limit', type: 'BigIntegerField(default=0)', verbose: 'سقف اعتبار خرید تعهدی (تومان)' },
        { name: 'total_purchases_amount', type: 'BigIntegerField(default=0)', verbose: 'مجموع ارزش خریدهای ثبت‌شده' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت‌نام مشتری' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/regular-customers/profile/',
      auth: 'IsAuthenticated',
      description: 'دریافت پروفایل کامل مشتری لاگین‌شده شامل اطلاعات واحد صنفی، سطح مشتری و سقف اعتبار',
      curlExample: `curl -X GET http://localhost:8000/api/v1/regular-customers/profile/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: `{
  "status": "success",
  "data": {
    "id": 12,
    "full_name": "احمد رضایی",
    "phone": "09123456789",
    "customer_type": "wholesale",
    "customer_type_label": "خریدار عمده (بنکدار)",
    "company_name": "سوپرمارکت رضایی - شعبه ۱",
    "national_code": "0012345678",
    "economic_code": "4111222333",
    "postal_code": "1471122334",
    "address": "تهران، خیابان ولیعصر، نرسیده به میدان ونک، پلاک ۱۲۰",
    "is_verified": true,
    "credit_limit": 500000000,
    "total_purchases_amount": 1850000000,
    "created_at": "2026-01-15T10:30:00Z"
  }
}`
    },
    {
      method: 'PUT',
      path: '/api/v1/regular-customers/profile/update/',
      auth: 'IsAuthenticated',
      description: 'ویرایش مشخصات حقوقی، آدرس تحویل بار و اطلاعات مالیاتی مشتری',
      curlExample: `curl -X PUT http://localhost:8000/api/v1/regular-customers/profile/update/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"company_name": "فروشگاه پخش رضایی", "address": "تهران، میدان محمدیه، پلاک ۵"}'`,
      responseBody: `{
  "status": "success",
  "message": "اطلاعات پروفایل با موفقیت بروزرسانی شد.",
  "data": {
    "company_name": "فروشگاه پخش رضایی",
    "address": "تهران، میدان محمدیه، پلاک ۵"
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/regular-customers/list/',
      auth: 'IsAdminUser',
      description: 'دریافت لیست مشتریان معمولی و عمده همراه با فیلتر هویت و نوع مشتری (مخصوص ادمین و فروش)',
      curlExample: `curl -X GET http://localhost:8000/api/v1/regular-customers/list/?customer_type=wholesale \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: `{
  "status": "success",
  "count": 45,
  "results": [
    {
      "id": 12,
      "full_name": "احمد رضایی",
      "phone": "09123456789",
      "customer_type": "wholesale",
      "company_name": "فروشگاه پخش رضایی",
      "is_verified": true,
      "credit_limit": 500000000
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/regular-customers/<id>/verify/',
      auth: 'IsAdminUser',
      description: 'تایید مدارک و تغییر سقف اعتبار مشتری توسط ادمین ارشد',
      curlExample: `curl -X POST http://localhost:8000/api/v1/regular-customers/12/verify/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"is_verified": true, "credit_limit": 1000000000}'`
    }
  ];

  const modelsCode = `"""
regular_customers/models.py
مدل مدیریت مشتریان معمولی (خرد) و عمده‌فروش (بنکداران)، اعتبارسنجی مدارک و سقف خرید
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class CustomerTypeChoices(models.TextChoices):
    RETAIL = 'retail', _('خریدار خرد / معمولی')
    WHOLESALE = 'wholesale', _('خریدار عمده / بنکدار')
    VIP_AGENCY = 'vip_agency', _('نمایندگی ویژه پخش')


class RegularCustomer(models.Model):
    """
    پروفایل تکمیلی مشتریان خرد و عمده جهت ثبت سفارشات آنلاین و دریافت فاکتور رسمی
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='regular_customer_profile', 
        verbose_name=_("حساب کاربری")
    )
    customer_type = models.CharField(
        _("نوع خریدار"), 
        max_length=30, 
        choices=CustomerTypeChoices.choices, 
        default=CustomerTypeChoices.RETAIL
    )
    company_name = models.CharField(
        _("نام واحد صنفی / فروشگاه"), 
        max_length=200, 
        blank=True, 
        null=True
    )
    national_code = models.CharField(
        _("کد ملی / شناسه ملی"), 
        max_length=12, 
        blank=True, 
        null=True
    )
    economic_code = models.CharField(
        _("کد اقتصادی مالیاتی"), 
        max_length=20, 
        blank=True, 
        null=True
    )
    postal_code = models.CharField(
        _("کد پستی"), 
        max_length=10, 
        blank=True, 
        null=True
    )
    address = models.TextField(
        _("آدرس دقیق تحویل بار"), 
        blank=True, 
        null=True
    )
    is_verified = models.BooleanField(
        _("تایید هویت و جواز کسب"), 
        default=False
    )
    credit_limit = models.BigIntegerField(
        _("سقف اعتبار خرید (تومان)"), 
        default=0
    )
    total_purchases_amount = models.BigIntegerField(
        _("مجموع خریدهای ثبت‌شده (تومان)"), 
        default=0
    )
    created_at = models.DateTimeField(
        _("تاریخ ثبت‌نام"), 
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _("تاریخ به‌روزرسانی"), 
        auto_now=True
    )

    class Meta:
        verbose_name = _("مشتری معمولی / عمده")
        verbose_name_plural = _("مدیریت مشتریان معمولی و عمده")
        ordering = ['-created_at']

    def __str__(self):
        title = self.company_name or self.user.full_name or self.user.phone
        return f"{title} ({self.get_customer_type_display()})"
`;

  const adminCode = `"""
regular_customers/admin.py
مدیریت پنل ادمین مشتریان معمولی و عمده همراه با تایید هویت سریع و فیلتر خریداران
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import RegularCustomer


@admin.register(RegularCustomer)
class RegularCustomerAdmin(admin.ModelAdmin):
    list_display = ('user', 'customer_type_badge', 'company_name', 'national_code', 'is_verified', 'credit_limit', 'created_at')
    list_filter = ('customer_type', 'is_verified', 'created_at')
    search_fields = ('company_name', 'national_code', 'economic_code', 'user__phone', 'user__full_name')
    list_editable = ('is_verified', 'credit_limit')

    fieldsets = (
        (_('حساب کاربری و نوع خریدار'), {
            'fields': ('user', 'customer_type', 'is_verified')
        }),
        (_('اطلاعات واحد صنفی و مالیاتی'), {
            'fields': ('company_name', 'national_code', 'economic_code')
        }),
        (_('آدرس و ارسال بار'), {
            'fields': ('postal_code', 'address')
        }),
        (_('اعتبار مالی و سوابق'), {
            'fields': ('credit_limit', 'total_purchases_amount')
        }),
    )

    def customer_type_badge(self, obj):
        colors = {
            'retail': '#3b82f6',
            'wholesale': '#10b981',
            'vip_agency': '#8b5cf6'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            colors.get(obj.customer_type, "#64748b"),
            obj.get_customer_type_display()
        )
    customer_type_badge.short_description = _("نوع خریدار")
`;

  const serializersCode = `"""
regular_customers/serializers.py
سریالایزرهای DRF برای تبدیل اطلاعات مشتریان، تایید هویت و ویرایش پروفایل
"""

from rest_framework import serializers
from .models import RegularCustomer


class RegularCustomerSerializer(serializers.ModelSerializer):
    """
    سریالایزر کامل پروفایل مشتری
    """
    phone = serializers.CharField(source='user.phone', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    customer_type_label = serializers.CharField(source='get_customer_type_display', read_only=True)

    class Meta:
        model = RegularCustomer
        fields = [
            'id', 
            'full_name', 
            'phone', 
            'customer_type', 
            'customer_type_label', 
            'company_name', 
            'national_code', 
            'economic_code', 
            'postal_code', 
            'address', 
            'is_verified', 
            'credit_limit', 
            'total_purchases_amount', 
            'created_at'
        ]
        read_only_fields = ['id', 'is_verified', 'credit_limit', 'total_purchases_amount', 'created_at']


class VerifyCustomerSerializer(serializers.Serializer):
    """
    سریالایزر تایید هویت و اختصاص اعتبار توسط ادمین
    """
    is_verified = serializers.BooleanField(required=True)
    credit_limit = serializers.IntegerField(required=False, min_value=0)
`;

  const viewsCode = `"""
regular_customers/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت مشتریان خرد و عمده
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema

from .models import RegularCustomer
from .serializers import RegularCustomerSerializer, VerifyCustomerSerializer


class CustomerProfileAPIView(APIView):
    """
    اندپوینت دریافت پروفایل مشتری لاگین‌شده
    توضیحات: این ویو صریح، اطلاعات پروفایل مشتری جاری را برگردانده و در صورت عدم وجود، یک پروفایل اولیه می‌سازد.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت مشخصات پروفایل مشتری جاری",
        responses={200: RegularCustomerSerializer}
    )
    def get(self, request):
        profile, created = RegularCustomer.objects.get_or_create(user=request.user)
        serializer = RegularCustomerSerializer(profile)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class CustomerProfileUpdateAPIView(APIView):
    """
    اندپوینت ویرایش مشخصات صنفی، آدرس و کدهای مالیاتی مشتری
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="ویرایش مشخصات حقوقی و آدرس مشتری",
        request_body=RegularCustomerSerializer,
        responses={200: RegularCustomerSerializer}
    )
    def put(self, request):
        profile, created = RegularCustomer.objects.get_or_create(user=request.user)
        serializer = RegularCustomerSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات پروفایل با موفقیت بروزرسانی شد.',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerListAPIView(APIView):
    """
    اندپوینت دریافت لیست کلیه مشتریان معمولی و عمده (مخصوص ادمین و فروش)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت لیست کلیه مشتریان (مدیریت)",
        responses={200: RegularCustomerSerializer(many=True)}
    )
    def get(self, request):
        queryset = RegularCustomer.objects.all().order_by('-created_at')
        
        # فیلتر بر اساس نوع مشتری (retail / wholesale)
        customer_type = request.query_params.get('customer_type')
        if customer_type:
            queryset = queryset.filter(customer_type=customer_type)

        serializer = RegularCustomerSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class CustomerVerifyAPIView(APIView):
    """
    اندپوینت تایید مدارک هویت و تنظیم سقف اعتبار مالی خریدار عمده
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="تایید هویت و تخصیص اعتبار خرید (مدیریت)",
        request_body=VerifyCustomerSerializer
    )
    def post(self, request, pk):
        customer = get_object_or_404(RegularCustomer, pk=pk)
        serializer = VerifyCustomerSerializer(data=request.data)
        if serializer.is_valid():
            customer.is_verified = serializer.validated_data['is_verified']
            if 'credit_limit' in serializer.validated_data:
                customer.credit_limit = serializer.validated_data['credit_limit']
            customer.save()

            return Response({
                'status': 'success',
                'message': 'وضعیت اعتبار و تایید هویت مشتری بروزرسانی گردید.',
                'data': RegularCustomerSerializer(customer).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
`;

  const urlsCode = `"""
regular_customers/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    CustomerProfileAPIView, 
    CustomerProfileUpdateAPIView, 
    CustomerListAPIView, 
    CustomerVerifyAPIView
)

app_name = 'regular_customers'

urlpatterns = [
    # ۱. دریافت مشخصات پروفایل مشتری لاگین‌شده
    path('profile/', CustomerProfileAPIView.as_view(), name='customer-profile'),
    
    # ۲. ویرایش مشخصات آدرس، کد ملی و شرکت
    path('profile/update/', CustomerProfileUpdateAPIView.as_view(), name='customer-profile-update'),
    
    # ۳. دریافت لیست تمامی مشتریان معمولی و عمده (مخصوص ادمین)
    path('list/', CustomerListAPIView.as_view(), name='customer-list'),
    
    # ۴. تایید هویت و تخصیص سقف اعتبار مالی مشتری توسط ادمین
    path('<int:pk>/verify/', CustomerVerifyAPIView.as_view(), name='customer-verify'),
]
`;

  const notesCode = `## 📌 راهنمای اتصال پروفایل مشتریان خرد و عمده در React

### ۱. دلیل پیاده‌سازی با APIView:
* این ماژول کاملاً با APIView صریح طراحی شده و از ViewSet‌های استاندارد استفاده نمی‌کند.
* **مزیت:** جداسازی دقیق مسیر ویرایش کاربر جاری با لیست مدیریتی، امنیت بالا در تخصیص سقف اعتبار خرید و عدم قرارگیری داده‌های حساس در مسیرهای عمومی.

---

### ۲. اتصال پروفایل مشتری در فرانت‌اند React:
\`\`\`typescript
// دریافت اطلاعات پروفایل مشتری و بررسی سقف اعتبار
const fetchCustomerProfile = async () => {
  const response = await fetch('http://localhost:8000/api/v1/regular-customers/profile/', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });

  const res = await response.json();
  if (res.status === 'success') {
    console.log("نوع خریدار:", res.data.customer_type_label);
    console.log("سقف اعتبار تومان:", res.data.credit_limit);
  }
};
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="regular_customers"
      title="مشتریان معمولی و عمده (Retail & Wholesale)"
      titleEn="regular_customers / Regular & Wholesale Customers App"
      badge="Customer Profile • Credit Limit"
      description="ماژول مدیریت مشتریان خرد و خریداران عمده بنکداری، ثبت کد ملی و شناسه حقوقی واحد صنفی، تایید هویت و تخصیص سقف اعتبار خرید. این اپلیکیشن بر پایه APIView صریح پیاده‌سازی شده است."
      icon={<Users className="w-6 h-6 text-blue-500" />}
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
