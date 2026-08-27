import React from 'react';
import { MessageSquare } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const WarehouseContactDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'warehouse_contact_warehousemessage',
      verboseName: 'پیام‌ها و فرم تماس با انبار مرکزی',
      description: 'ثبت و پیگیری پیام‌های ارسالی مشتریان، مغازه‌داران و ویزیتوران جهت تماس با انبار جنت‌آباد',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'full_name', type: 'CharField(max_length=150)', verbose: 'نام و نام خانوادگی' },
        { name: 'phone', type: 'CharField(max_length=15)', verbose: 'شماره تماس' },
        { name: 'subject', type: 'CharField(max_length=200)', verbose: 'موضوع درخواست' },
        { name: 'message', type: 'TextField', verbose: 'متن پیام یا سفارش عمده' },
        { name: 'is_read', type: 'BooleanField(default=False)', verbose: 'خوانده شده توسط مدیریت' },
        { name: 'admin_reply', type: 'TextField(blank=True)', verbose: 'پاسخ انباردار / مدیریت' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت پیام' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/warehouse-contact/messages/',
      auth: 'AllowAny',
      description: 'ارسال پیام جدید یا استعلام عمده به انبار مرکزی جنت‌آباد توسط کاربر',
      requestBody: JSON.stringify({
        full_name: "رضا کریمی",
        phone: "09123456789",
        subject: "استعلام قیمت کارتن مارلبرو قرمز",
        message: "لطفا شرایط خرید عمده ۱۰۰ کارتن را اعلام فرمایید."
      }, null, 2),
      responseBody: JSON.stringify({
        success: true,
        message: "پیام شما با موفقیت ثبت شد. کارشناسان انبار به زودی تماس خواهند گرفت.",
        id: 142
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/warehouse-contact/messages/',
      auth: 'IsAdminUser',
      description: 'دریافت فهرست تمام پیام‌های دریافتی در پنل ادمین'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="warehouse_contact"
      title="فرم تماس با انبار و استعلام عمده"
      titleEn="warehouse_contact / Warehouse Contact Form App"
      badge="Contact & Inquiry"
      description="ماژول مدیریت فرم تماس، استعلام قیمت عمده و ارتباط مستقیم با انبار مرکزی جنت‌آباد با قابلیت پاسخگویی مدیریتی."
      icon={<MessageSquare className="w-6 h-6 text-emerald-500" />}
      modelsCode={`from django.db import models
from django.utils.translation import gettext_lazy as _

class WarehouseMessage(models.Model):
    full_name = models.CharField(_("نام و نام خانوادگی"), max_length=150)
    phone = models.CharField(_("شماره تماس"), max_length=15)
    subject = models.CharField(_("موضوع درخواست"), max_length=200)
    message = models.TextField(_("متن پیام"))
    is_read = models.BooleanField(_("خوانده شده"), default=False)
    admin_reply = models.TextField(_("پاسخ مدیریت انبار"), blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ ثبت"), auto_now_add=True)

    class Meta:
        verbose_name = _("پیام تماس با انبار")
        verbose_name_plural = _("مدیریت پیام‌ها و فرم تماس با انبار")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.subject} ({self.phone})"
`}
      adminCode={`from django.contrib import admin
from .models import WarehouseMessage

@admin.register(WarehouseMessage)
class WarehouseMessageAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone', 'subject', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('full_name', 'phone', 'subject', 'message')
    list_editable = ('is_read',)
    readonly_fields = ('created_at',)
`}
      serializersCode={`from rest_framework import serializers
from .models import WarehouseMessage

class WarehouseMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WarehouseMessage
        fields = ['id', 'full_name', 'phone', 'subject', 'message', 'is_read', 'admin_reply', 'created_at']
        read_only_fields = ['id', 'is_read', 'admin_reply', 'created_at']
`}
      viewsCode={`from rest_framework import viewsets, permissions
from .models import WarehouseMessage
from .serializers import WarehouseMessageSerializer

class WarehouseMessageViewSet(viewsets.ModelViewSet):
    queryset = WarehouseMessage.objects.all()
    serializer_class = WarehouseMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
`}
      urlsCode={`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseMessageViewSet

router = DefaultRouter()
router.register('messages', WarehouseMessageViewSet, basename='warehouse-message')

urlpatterns = [
    path('', include(router.urls)),
]
`}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
