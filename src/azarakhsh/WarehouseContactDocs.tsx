import React from 'react';
import { MessageSquare } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const WarehouseContactDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'warehouse_contact_warehousemessage',
      verboseName: 'پیام‌ها و فرم تماس با انبار مرکزی',
      description: 'ثبت و پیگیری پیام‌های ارسالی مشتریان، مغازه‌داران و ویزیتوران جهت تماس با انبار مرکزی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه پیام' },
        { name: 'full_name', type: 'CharField(max_length=150)', verbose: 'نام و نام خانوادگی' },
        { name: 'phone', type: 'CharField(max_length=15)', verbose: 'شماره تماس' },
        { name: 'subject', type: 'CharField(max_length=200)', verbose: 'موضوع درخواست' },
        { name: 'message', type: 'TextField', verbose: 'متن پیام یا سفارش عمده' },
        { name: 'is_read', type: 'BooleanField(default=False)', verbose: 'خوانده شده توسط مدیریت' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت پیام' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/warehouse-contact/send-message/',
      auth: 'AllowAny',
      description: 'ارسال پیام جدید یا استعلام عمده به انبار مرکزی سوین توسط کاربر وب‌سایت',
      requestBody: JSON.stringify({
        full_name: "رضا کریمی",
        phone: "09123456789",
        subject: "استعلام قیمت کارتن مارلبرو قرمز",
        message: "لطفا شرایط خرید عمده ۱۰ کارتن را اعلام فرمایید."
      }, null, 2),
      responseBody: JSON.stringify({
        status: "success",
        message: "پیام شما با موفقیت ثبت شد. کارشناسان انبار به زودی تماس خواهند گرفت.",
        data: {
          id: 142,
          full_name: "رضا کریمی",
          created_at: "1403/06/07 - 14:30"
        }
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/warehouse-contact/messages/list/',
      auth: 'IsAdminUser',
      description: 'دریافت فهرست تمام پیام‌های دریافتی از فرم تماس سایت در پنل ادمین'
    },
    {
      method: 'DELETE',
      path: '/api/v1/warehouse-contact/messages/{id}/',
      auth: 'IsAdminUser',
      description: 'حذف پیام دریافتی از دیتابیس توسط ادمین'
    }
  ];

  const viewsCode = `"""
warehouse_contact/views.py
ویوهای ساده و صریح APIView جهت دریافت فرم تماس کاربر و مدیریت پیام‌ها
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema

from .models import WarehouseMessage
from .serializers import WarehouseMessageSerializer


class WarehouseMessageCreateAPIView(APIView):
    """
    اندپوینت عمومی جهت ثبت پیام تماس با ما توسط کاربران وب‌سایت
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ثبت پیام فرم تماس با ما (عمومی)",
        request_body=WarehouseMessageSerializer,
        responses={201: dict}
    )
    def post(self, request):
        serializer = WarehouseMessageSerializer(data=request.data)
        if serializer.is_valid():
            msg = serializer.save()
            return Response({
                'status': 'success',
                'message': 'پیام شما با موفقیت ثبت شد. کارشناسان انبار به زودی تماس خواهند گرفت.',
                'data': WarehouseMessageSerializer(msg).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WarehouseMessageListAPIView(APIView):
    """
    اندپوینت دریافت لیست پیام‌های فرم تماس برای مدیریت و انباردار
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت لیست پیام‌های فرم تماس (مدیریت)",
        responses={200: WarehouseMessageSerializer(many=True)}
    )
    def get(self, request):
        unread_only = request.query_params.get('unread', 'false').lower() == 'true'
        queryset = WarehouseMessage.objects.all()

        if unread_only:
            queryset = queryset.filter(is_read=False)

        serializer = WarehouseMessageSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class WarehouseMessageDetailAPIView(APIView):
    """
    مشاهده جزئیات پیام و علامت‌گذاری به عنوان خوانده‌شده یا حذف
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="مشاهده جزئیات پیام فرم تماس (مدیریت)",
        responses={200: WarehouseMessageSerializer}
    )
    def get(self, request, pk):
        msg = get_object_or_404(WarehouseMessage, pk=pk)
        msg.is_read = True
        msg.save()
        serializer = WarehouseMessageSerializer(msg)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="حذف پیام فرم تماس (مدیریت)",
        responses={200: dict}
    )
    def delete(self, request, pk):
        msg = get_object_or_404(WarehouseMessage, pk=pk)
        msg.delete()
        return Response({
            'status': 'success',
            'message': 'پیام فرم تماس با موفقیت حذف شد.'
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
warehouse_contact/urls.py
مسیرهای APIView جهت ثبت پیام عمومی و دریافت لیست پیام‌ها توسط ادمین
"""

from django.urls import path
from .views import (
    WarehouseMessageCreateAPIView,
    WarehouseMessageListAPIView,
    WarehouseMessageDetailAPIView,
)

app_name = 'warehouse_contact'

urlpatterns = [
    # ۱. ثبت پیام عمومی فرم تماس با ما
    path('send-message/', WarehouseMessageCreateAPIView.as_view(), name='send-message'),

    # ۲. فهرست تمام پیام‌های دریافتی (مدیریت)
    path('messages/list/', WarehouseMessageListAPIView.as_view(), name='messages-list'),

    # ۳. مشاهده جزئیات و حذف پیام (مدیریت)
    path('messages/<int:pk>/', WarehouseMessageDetailAPIView.as_view(), name='messages-detail'),
]
`;

  const notesCode = `## 📌 راهنمای به‌روزرسانی اپلیکیشن warehouse_contact

فیلدهای پاسخ مدیریت بر اساس درخواست حذف گردیده است. اکنون کاربران فرم تماس را پر کرده و پیام در دیتابیس جهت مشاهده ادمین ذخیره می‌شود.

### 📂 فایل‌های کپی در پروژه جنگو:
1. **\`warehouse_contact/models.py\`**: مدل ساده \`WarehouseMessage\`
2. **\`warehouse_contact/serializers.py\`**: سریالایزر \`WarehouseMessageSerializer\`
3. **\`warehouse_contact/views.py\`**: ویوهای ارسال پیام و لیست پیام‌های ادمین
4. **\`warehouse_contact/urls.py\`**: مسیرهای API
5. **\`warehouse_contact/admin.py\`**: پنل ادمین
`;

  return (
    <AppDocTemplate
      appFolder="warehouse_contact"
      title="فرم تماس با انبار و استعلام عمده"
      titleEn="warehouse_contact / Warehouse Contact Form App"
      badge="Contact Form"
      description="ماژول فرم تماس با ما سایت، دریافت پیام‌های عمومی مشتریان و ثبت در دیتابیس برای مشاهده ادمین."
      icon={<MessageSquare className="w-6 h-6 text-emerald-500" />}
      modelsCode={`from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.timezone import localtime
import jdatetime

class WarehouseMessage(models.Model):
    full_name = models.CharField(_("نام و نام خانوادگی"), max_length=150)
    phone = models.CharField(_("شماره تماس"), max_length=15)
    subject = models.CharField(_("موضوع درخواست"), max_length=200)
    message = models.TextField(_("متن پیام"))
    is_read = models.BooleanField(_("خوانده شده"), default=False)
    created_at = models.DateTimeField(_("تاریخ ثبت پیام"), auto_now_add=True)

    class Meta:
        verbose_name = _("پیام تماس با ما")
        verbose_name_plural = _("مدیریت پیام‌ها و فرم تماس سایت")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.subject} ({self.phone})"

    @property
    def jalali_created_at(self):
        if self.created_at:
            local_dt = localtime(self.created_at)
            return jdatetime.datetime.fromgregorian(datetime=local_dt).strftime("%Y/%m/%d - %H:%M:%S")
        return ""
`}
      adminCode={`from django.contrib import admin
from django.utils.timezone import localtime
import jdatetime
from .models import WarehouseMessage

@admin.register(WarehouseMessage)
class WarehouseMessageAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone', 'subject', 'is_read', 'jalali_created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('full_name', 'phone', 'subject', 'message')
    readonly_fields = ('jalali_created_at_detail',)
    fields = ('full_name', 'phone', 'subject', 'message', 'is_read', 'jalali_created_at_detail')

    @admin.display(description="تاریخ ثبت پیام (شمسی)", ordering="created_at")
    def jalali_created_at(self, obj):
        if obj.created_at:
            local_dt = localtime(obj.created_at)
            j_date = jdatetime.datetime.fromgregorian(datetime=local_dt)
            return j_date.strftime("%Y/%m/%d - %H:%M:%S")
        return "-"

    @admin.display(description="تاریخ و زمان ثبت پیام (شمسی)")
    def jalali_created_at_detail(self, obj):
        if obj.created_at:
            local_dt = localtime(obj.created_at)
            j_date = jdatetime.datetime.fromgregorian(datetime=local_dt)
            return j_date.strftime("%Y/%m/%d ساعت %H:%M:%S")
        return "-"
`}
      serializersCode={`from rest_framework import serializers
from .models import WarehouseMessage

class WarehouseMessageSerializer(serializers.ModelSerializer):
    """
    سریالایزر پیام فرم تماس با ما همراه با تبدیل خودکار تاریخ به شمسی
    """
    jalali_created_at = serializers.ReadOnlyField()

    class Meta:
        model = WarehouseMessage
        fields = ['id', 'full_name', 'phone', 'subject', 'message', 'is_read', 'created_at', 'jalali_created_at']
        read_only_fields = ['id', 'is_read', 'created_at', 'jalali_created_at']
`}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
