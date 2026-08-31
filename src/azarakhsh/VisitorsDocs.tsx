import React from 'react';
import { Users } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const VisitorsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'visitors_visitorprofile',
      verboseName: 'پروفایل تخصصی ویزیتوران',
      description: 'کدهای بازاریابی ویزیتور، نرخ کمیسیون سود ۲.۵٪ و مجموع مبالغ فروش و پورسانت',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'user_id', type: 'OneToOneField(User)', isFk: true, fkTarget: 'accounts_user', isUnique: true, verbose: 'حساب کاربری' },
        { name: 'visitor_code', type: 'CharField(max_length=50)', isUnique: true, verbose: 'کد اختصاصی ویزیتور', help: 'مثال: VISITOR-9419' },
        { name: 'commission_rate', type: 'DecimalField(max_digits=5, places=2)', verbose: 'درصد کمیسیون سود (پیش‌فرض ۲.۵٪)' },
        { name: 'total_sales_amount', type: 'DecimalField(max_digits=14)', verbose: 'مجموع فروش ثبت‌شده' },
        { name: 'total_commission_earned', type: 'DecimalField(max_digits=12)', verbose: 'مجموع پورسانت کسب‌شده' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'وضعیت فعال بودن ویزیتور' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ پیوستن' },
      ]
    },
    {
      name: 'visitors_retailshopcustomer',
      verboseName: 'باشگاه مشتریان مغازه‌داران و سوپرمارکت‌ها',
      description: 'واحدهای صنفی ثبت‌شده تحت شبکه ویزیتور مربوطه جهت دریافت پورسانت مستمر',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'visitor_id', type: 'ForeignKey', isFk: true, fkTarget: 'visitors_visitorprofile', verbose: 'ویزیتور معرف' },
        { name: 'shop_name', type: 'CharField(max_length=200)', verbose: 'نام مغازه / سوپرمارکت' },
        { name: 'owner_name', type: 'CharField(max_length=150)', verbose: 'نام صاحب مغازه' },
        { name: 'phone', type: 'CharField(max_length=15)', verbose: 'شماره تماس' },
        { name: 'city', type: 'CharField(max_length=60)', verbose: 'شهر' },
        { name: 'address', type: 'TextField', verbose: 'آدرس دقیق مغازه' },
        { name: 'total_purchases', type: 'DecimalField(max_digits=14)', verbose: 'مجموع خریدهای مغازه (تومان)' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ عضویت' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/visitors/profile/',
      auth: 'IsAuthenticated',
      description: 'دریافت مشخصات پروفایل و کد ویزیتوری اختصاصی کاربر جاری',
      curlExample: `curl -X GET http://localhost:8000/api/v1/visitors/profile/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: `{
  "status": "success",
  "data": {
    "id": 5,
    "user": 12,
    "user_name": "علی رضایی",
    "visitor_code": "VISITOR-9419",
    "commission_rate": "2.50",
    "total_sales_amount": "1420000000",
    "total_commission_earned": "35500000",
    "is_active": true,
    "created_at": "2026-01-15T10:00:00Z"
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/visitors/dashboard/',
      auth: 'IsAuthenticated',
      description: 'دریافت آمار کارکرد داشبورد ویزیتور شامل کل فروش، کمیسیون ۲.۵٪ و تعداد مغازه‌ها',
      curlExample: `curl -X GET http://localhost:8000/api/v1/visitors/dashboard/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: `{
  "status": "success",
  "data": {
    "visitor_code": "VISITOR-9419",
    "commission_rate": "2.50",
    "total_sales_amount": 1420000000,
    "total_commission_earned": 35500000,
    "shops_count": 38,
    "active_orders_count": 12
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/visitors/shops/list/',
      auth: 'IsAuthenticated',
      description: 'فهرست مغازه‌داران و واحدهای صنفی تحت شبکه ویزیتور جاری',
      curlExample: `curl -X GET http://localhost:8000/api/v1/visitors/shops/list/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: `{
  "status": "success",
  "count": 38,
  "results": [
    {
      "id": 101,
      "visitor": 5,
      "shop_name": "سوپرمارکت شقایق",
      "owner_name": "حسین محمدی",
      "phone": "09121112233",
      "city": "تهران",
      "address": "جنت‌آباد جنوبی، نبش کوچه شقایق",
      "total_purchases": 45000000,
      "created_at": "2026-02-01T12:00:00Z"
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/visitors/shops/create/',
      auth: 'IsAuthenticated',
      description: 'ثبت مغازه جدید در باشگاه مشتریان توسط ویزیتور',
      curlExample: `curl -X POST http://localhost:8000/api/v1/visitors/shops/create/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "shop_name": "سوپرمارکت شقایق",
    "owner_name": "حسین محمدی",
    "phone": "09121112233",
    "city": "تهران",
    "address": "جنت‌آباد جنوبی، پلاک ۴"
  }'`,
      responseBody: `{
  "status": "success",
  "message": "واحد صنفی جدید با موفقیت در شبکه شما ثبت گردید.",
  "data": {
    "id": 102,
    "shop_name": "سوپرمارکت شقایق",
    "owner_name": "حسین محمدی"
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/visitors/shops/<id>/',
      auth: 'IsAuthenticated',
      description: 'مشاهده مشخصات کامل یک مغازه ثبت‌شده بر اساس ID'
    },
    {
      method: 'PUT',
      path: '/api/v1/visitors/shops/<id>/update/',
      auth: 'IsAuthenticated',
      description: 'ویرایش مشخصات آدرس و تماس مغازه توسط ویزیتور'
    },
    {
      method: 'DELETE',
      path: '/api/v1/visitors/shops/<id>/delete/',
      auth: 'IsAdminUser',
      description: 'حذف واحد صنفی از باشگاه مشتریان توسط مدیریت'
    },
    {
      method: 'GET',
      path: '/api/v1/visitors/admin/list/',
      auth: 'IsAdminUser',
      description: 'دریافت لیست تمامی ویزیتوران سیستم و عملکرد پورسانت (مخصوص ادمین)'
    }
  ];

  const modelsCode = `"""
visitors/models.py
مدل‌های پروفایل ویزیتوران، کد معرف، درصد کمیسیون سود ۲.۵٪ و باشگاه مشتریان مغازه‌داران
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class VisitorProfile(models.Model):
    """
    پروفایل تخصصی ویزیتوران بازاریاب همراه با کد اختصاصی و نرخ کمیسیون
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='visitor_profile', verbose_name=_("حساب کاربری"))
    visitor_code = models.CharField(_("کد اختصاصی ویزیتور"), max_length=50, unique=True)
    commission_rate = models.DecimalField(_("درصد کمیسیون سود (%)"), max_digits=5, decimal_places=2, default=2.50)
    total_sales_amount = models.DecimalField(_("مجموع فروش ثبت‌شده (تومان)"), max_digits=14, decimal_places=0, default=0)
    total_commission_earned = models.DecimalField(_("مجموع پورسانت کسب‌شده (تومان)"), max_digits=12, decimal_places=0, default=0)
    is_active = models.BooleanField(_("ویزیتور فعال"), default=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)

    class Meta:
        verbose_name = _("پروفایل ویزیتور")
        verbose_name_plural = _("مدیریت ویزیتوران")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.visitor_code})"


class RetailShopCustomer(models.Model):
    """
    باشگاه مشتریان مغازه‌داران و سوپرمارکت‌های زیرمجموعه هر ویزیتور
    """
    visitor = models.ForeignKey(VisitorProfile, on_delete=models.CASCADE, related_name='shops', verbose_name=_("ویزیتور معرف"))
    shop_name = models.CharField(_("نام مغازه / سوپرمارکت"), max_length=200)
    owner_name = models.CharField(_("نام صاحب مغازه"), max_length=150)
    phone = models.CharField(_("شماره تماس"), max_length=15)
    city = models.CharField(_("شهر"), max_length=60)
    address = models.TextField(_("آدرس دقیق مغازه"))
    total_purchases = models.DecimalField(_("مجموع خریدهای مغازه (تومان)"), max_digits=14, decimal_places=0, default=0)
    created_at = models.DateTimeField(_("تاریخ ثبت"), auto_now_add=True)

    class Meta:
        verbose_name = _("مغازه‌دار (باشگاه مشتریان)")
        verbose_name_plural = _("شبکه مغازه‌داران ویزیتوران")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.shop_name} - {self.owner_name} ({self.city})"
`;

  const adminCode = `"""
visitors/admin.py
پنل مدیریت ویزیتوران، شبکه مغازه‌داران و درصد کمیسیون سود
"""

from django.contrib import admin
from .models import VisitorProfile, RetailShopCustomer


class RetailShopCustomerInline(admin.TabularInline):
    model = RetailShopCustomer
    extra = 0
    readonly_fields = ('shop_name', 'owner_name', 'phone', 'city', 'total_purchases')


@admin.register(VisitorProfile)
class VisitorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'visitor_code', 'commission_rate', 'total_sales_amount', 'total_commission_earned', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('visitor_code', 'user__username', 'user__first_name', 'user__last_name')
    inlines = [RetailShopCustomerInline]
    list_editable = ('commission_rate', 'is_active')


@admin.register(RetailShopCustomer)
class RetailShopCustomerAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'owner_name', 'phone', 'city', 'visitor', 'total_purchases', 'created_at')
    list_filter = ('city', 'visitor')
    search_fields = ('shop_name', 'owner_name', 'phone', 'address')
`;

  const serializersCode = `"""
visitors/serializers.py
سریالایزرهای DRF جهت دریافت پروفایل ویزیتور، ثبت مغازه‌ها و داشبورد کارکرد
"""

from rest_framework import serializers
from .models import VisitorProfile, RetailShopCustomer


class VisitorProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = VisitorProfile
        fields = [
            'id', 
            'user', 
            'user_name', 
            'visitor_code', 
            'commission_rate', 
            'total_sales_amount', 
            'total_commission_earned', 
            'is_active', 
            'created_at'
        ]


class RetailShopCustomerSerializer(serializers.ModelSerializer):
    visitor_code = serializers.CharField(source='visitor.visitor_code', read_only=True)

    class Meta:
        model = RetailShopCustomer
        fields = [
            'id', 
            'visitor', 
            'visitor_code', 
            'shop_name', 
            'owner_name', 
            'phone', 
            'city', 
            'address', 
            'total_purchases', 
            'created_at'
        ]


class RetailShopCustomerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetailShopCustomer
        fields = ['shop_name', 'owner_name', 'phone', 'city', 'address']


class VisitorDashboardSerializer(serializers.Serializer):
    visitor_code = serializers.CharField()
    commission_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_sales_amount = serializers.DecimalField(max_digits=14, decimal_places=0)
    total_commission_earned = serializers.DecimalField(max_digits=12, decimal_places=0)
    shops_count = serializers.IntegerField()
    active_orders_count = serializers.IntegerField()
`;

  const viewsCode = `"""
visitors/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت شبکه ویزیتوران و مغازه‌داران
"""

import uuid
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import VisitorProfile, RetailShopCustomer
from .serializers import (
    VisitorProfileSerializer,
    RetailShopCustomerSerializer,
    RetailShopCustomerCreateSerializer,
    VisitorDashboardSerializer
)


class VisitorProfileAPIView(APIView):
    """
    اندپوینت دریافت مشخصات پروفایل ویزیتور جاری
    توضیحات: این ویو صریح، مشخصات پروفایل بازاریابی کاربر جاری را برگردانده و در صورت عدم وجود، یک کد اختصاصی می‌سازد.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت مشخصات پروفایل ویزیتور جاری",
        responses={200: VisitorProfileSerializer}
    )
    def get(self, request):
        code = f"VISITOR-{uuid.uuid4().hex[:5].upper()}"
        profile, created = VisitorProfile.objects.get_or_create(
            user=request.user,
            defaults={'visitor_code': code, 'commission_rate': 2.50}
        )
        serializer = VisitorProfileSerializer(profile)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class VisitorDashboardAPIView(APIView):
    """
    اندپوینت دریافت اطلاعات داشبورد آماری و میزان پورسانت ۲.۵٪ ویزیتور
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت آمار کارکرد و پورسانت ۲.۵٪ ویزیتور",
        responses={200: VisitorDashboardSerializer}
    )
    def get(self, request):
        profile, _ = VisitorProfile.objects.get_or_create(user=request.user)
        shops_count = profile.shops.count()
        
        data = {
            'visitor_code': profile.visitor_code,
            'commission_rate': profile.commission_rate,
            'total_sales_amount': profile.total_sales_amount,
            'total_commission_earned': profile.total_commission_earned,
            'shops_count': shops_count,
            'active_orders_count': 0
        }
        
        return Response({
            'status': 'success',
            'data': data
        }, status=status.HTTP_200_OK)


class RetailShopListAPIView(APIView):
    """
    اندپوینت دریافت لیست مغازه‌داران و سوپرمارکت‌های تحت شبکه ویزیتور جاری
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت لیست مغازه‌داران ویزیتور جاری",
        responses={200: RetailShopCustomerSerializer(many=True)}
    )
    def get(self, request):
        profile, _ = VisitorProfile.objects.get_or_create(user=request.user)
        queryset = profile.shops.all().order_by('-created_at')
        serializer = RetailShopCustomerSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class RetailShopCreateAPIView(APIView):
    """
    اندپوینت ثبت مغازه جدید در باشگاه مشتریان توسط ویزیتور
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="ثبت مغازه/سوپرمارکت جدید در شبکه (ویزیتور)",
        request_body=RetailShopCustomerCreateSerializer,
        responses={201: RetailShopCustomerSerializer}
    )
    def post(self, request):
        profile, _ = VisitorProfile.objects.get_or_create(user=request.user)
        serializer = RetailShopCustomerCreateSerializer(data=request.data)
        if serializer.is_valid():
            shop = serializer.save(visitor=profile)
            return Response({
                'status': 'success',
                'message': 'واحد صنفی جدید با موفقیت در شبکه شما ثبت گردید.',
                'data': RetailShopCustomerSerializer(shop).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RetailShopDetailAPIView(APIView):
    """
    اندپوینت مشاهده مشخصات یک مغازه ثبت‌شده بر اساس ID
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت مشخصات یک مغازه",
        responses={200: RetailShopCustomerSerializer}
    )
    def get(self, request, pk):
        profile, _ = VisitorProfile.objects.get_or_create(user=request.user)
        shop = get_object_or_404(RetailShopCustomer, pk=pk, visitor=profile)
        serializer = RetailShopCustomerSerializer(shop)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class RetailShopUpdateAPIView(APIView):
    """
    اندپوینت ویرایش مشخصات آدرس و تماس مغازه توسط ویزیتور
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="ویرایش مشخصات مغازه (ویزیتور)",
        request_body=RetailShopCustomerCreateSerializer,
        responses={200: RetailShopCustomerSerializer}
    )
    def put(self, request, pk):
        profile, _ = VisitorProfile.objects.get_or_create(user=request.user)
        shop = get_object_or_404(RetailShopCustomer, pk=pk, visitor=profile)
        serializer = RetailShopCustomerCreateSerializer(shop, data=request.data, partial=True)
        if serializer.is_valid():
            updated_shop = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات مغازه با موفقیت بروزرسانی شد.',
                'data': RetailShopCustomerSerializer(updated_shop).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RetailShopDeleteAPIView(APIView):
    """
    اندپوینت حذف واحد صنفی از باشگاه مشتریان (مخصوص مدیریت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="حذف واحد صنفی (مدیریت)",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def delete(self, request, pk):
        shop = get_object_or_404(RetailShopCustomer, pk=pk)
        shop.delete()
        return Response({
            'status': 'success',
            'message': 'واحد صنفی مورد نظر با موفقیت حذف گردید.'
        }, status=status.HTTP_200_OK)


class AdminVisitorListAPIView(APIView):
    """
    اندپوینت دریافت لیست کل ویزیتوران سیستم و آمار عملکرد (مخصوص ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت لیست کلیه ویزیتوران (مدیریت)",
        responses={200: VisitorProfileSerializer(many=True)}
    )
    def get(self, request):
        queryset = VisitorProfile.objects.all().order_by('-created_at')
        serializer = VisitorProfileSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
visitors/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    VisitorProfileAPIView,
    VisitorDashboardAPIView,
    RetailShopListAPIView,
    RetailShopCreateAPIView,
    RetailShopDetailAPIView,
    RetailShopUpdateAPIView,
    RetailShopDeleteAPIView,
    AdminVisitorListAPIView,
)

app_name = 'visitors'

urlpatterns = [
    # ۱. مشخصات پروفایل ویزیتور لاگین‌شده
    path('profile/', VisitorProfileAPIView.as_view(), name='visitor-profile'),

    # ۲. آمار کارکرد داشبورد و پورسانت ۲.۵٪
    path('dashboard/', VisitorDashboardAPIView.as_view(), name='visitor-dashboard'),

    # ۳. لیست مغازه‌داران زیرمجموعه ویزیتور
    path('shops/list/', RetailShopListAPIView.as_view(), name='shop-list'),

    # ۴. ثبت مغازه جدید در باشگاه مشتریان
    path('shops/create/', RetailShopCreateAPIView.as_view(), name='shop-create'),

    # ۵. دریافت مشخصات یک مغازه با شناسه
    path('shops/<int:pk>/', RetailShopDetailAPIView.as_view(), name='shop-detail'),

    # ۶. ویرایش اطلاعات آدرس و تلفن مغازه
    path('shops/<int:pk>/update/', RetailShopUpdateAPIView.as_view(), name='shop-update'),

    # ۷. حذف مغازه از باشگاه مشتریان (مخصوص ادمین)
    path('shops/<int:pk>/delete/', RetailShopDeleteAPIView.as_view(), name='shop-delete'),

    # ۸. دریافت لیست کلیه ویزیتوران سیستم (مخصوص ادمین)
    path('admin/list/', AdminVisitorListAPIView.as_view(), name='admin-visitor-list'),
]
`;

  const notesCode = `## 📌 راهنمای استفاده از سیستم ویزیتوران و باشگاه مشتریان با APIView

### ۱. دلیل پیاده‌سازی صریح با APIView (عدم استفاده از ViewSet):
* این ماژول کاملاً با کلاس‌های **APIView** صریح پیاده‌سازی شده و وابستگی به ViewSet یا Routerهای استاندارد DRF ندارد.
* **مزیت:** محاسبه پورسانت ۲.۵٪ مستقیم از کل فروش، جداسازی داشبورد آماری ویزیتور از ثبت واحدهای صنفی، مسیرهای شفاف در سواگر \`drf_yasg\` و کنترل دقیق سطح دسترسی‌ها.

---

### ۲. نحوه فراخوانی در فرانت‌اند React:
\`\`\`typescript
// دریافت آمار کارکرد داشبورد ویزیتور
const fetchVisitorDashboard = async () => {
  const response = await fetch('http://localhost:8000/api/v1/visitors/dashboard/', {
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });
  const res = await response.json();
  if (res.status === 'success') {
    console.log("میزان پورسانت ۲.۵٪ کسب‌شده:", res.data.total_commission_earned);
  }
};
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="visitors"
      title="۱۲. اپلیکیشن ویزیتوران و باشگاه مشتریان مغازه‌داران"
      titleEn="visitors / Commission & Retail Club App"
      badge="2.5% Commission • Retail CRM APIView"
      description="مدیریت کدهای ویزیتوری اختصاصی، ثبت واحدهای صنفی و سوپرمارکت‌ها در باشگاه مشتریان، محاسبه خودکار ۲.۵٪ سود کمیسیون از تمام فاکتورهای صادره و صدور گزارشات واریز پورسانت. این اپلیکیشن بر پایه APIView صریح (دقیقاً مشابه الگوی regular_customers بدون ViewSet) پیاده‌سازی شده است."
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
