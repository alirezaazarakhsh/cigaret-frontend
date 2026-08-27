import React from 'react';
import { Sliders } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const FooterDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'footer_settings_footersetting',
      verboseName: 'تنظیمات فوتر سایت',
      description: 'مدیریت متون، لینک‌های مفید، کپی‌رایت و اطلاعات تماس انبار مرکزی در فوتر وب‌سایت',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'company_title', type: 'CharField(max_length=255)', verbose: 'عنوان شرکت / انبار' },
        { name: 'address_text', type: 'TextField', verbose: 'متن آدرس انبار مرکزی' },
        { name: 'phone_number', type: 'CharField(max_length=20)', verbose: 'تلفن تماس سفارشات' },
        { name: 'copyright_text', type: 'CharField(max_length=300)', verbose: 'متن کپی‌رایت' },
        { name: 'developer_credit', type: 'CharField(max_length=200)', verbose: 'متن توسعه‌دهنده و میزبانی' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'فوتر فعال' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/footer/settings/',
      auth: 'AllowAny',
      description: 'دریافت تنظیمات و محتوای فوتر جهت نمایش در صفحه اصلی'
    },
    {
      method: 'PUT',
      path: '/api/v1/footer/settings/1/',
      auth: 'IsAdminUser',
      description: 'ویرایش اطلاعات و متون فوتر سایت'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="footer_settings"
      title="تنظیمات فوتر وب‌سایت"
      titleEn="footer_settings / Website Footer App"
      badge="Footer Settings"
      description="ماژول مدیریت متون فوتر، لینک‌های دسترسی سریع، اطلاعات تماس انبار مرکزی جنت‌آباد و اعتبارات توسعه‌دهنده."
      icon={<Sliders className="w-6 h-6 text-amber-500" />}
      modelsCode={`from django.db import models
from django.utils.translation import gettext_lazy as _

class FooterSetting(models.Model):
    company_title = models.CharField(_("عنوان شرکت / انبار"), max_length=255, default="پخش عمده دخانیات سوین")
    address_text = models.TextField(_("آدرس انبار مرکزی"), default="انبار مرکزی تهران (منطقه ۵، جنت‌آباد)")
    phone_number = models.CharField(_("تلفن تماس سفارشات"), max_length=20, default="09120759419")
    copyright_text = models.CharField(_("متن کپی‌رایت"), max_length=300, default="کلیه حقوق مادی و معنوی برای پخش عمده دخانیات سوین محفوظ است.")
    developer_credit = models.CharField(_("توسعه و میزبانی"), max_length=200, default="توسعه توسط سوین تیم و میزبانی سرورهای قدرتمند سوین هاست")
    is_active = models.BooleanField(_("فوتر فعال"), default=True)
    updated_at = models.DateTimeField(_("آخرین به‌روزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("تنظیمات فوتر سایت")
        verbose_name_plural = _("مدیریت تنظیمات فوتر سایت")

    def __str__(self):
        return f"تنظیمات فوتر ({self.company_title})"
`}
      adminCode={`from django.contrib import admin
from .models import FooterSetting

@admin.register(FooterSetting)
class FooterSettingAdmin(admin.ModelAdmin):
    list_display = ('company_title', 'phone_number', 'is_active', 'updated_at')
    list_editable = ('is_active',)
`}
      serializersCode={`from rest_framework import serializers
from .models import FooterSetting

class FooterSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterSetting
        fields = '__all__'
`}
      viewsCode={`from rest_framework import viewsets, permissions
from .models import FooterSetting
from .serializers import FooterSettingSerializer

class FooterSettingViewSet(viewsets.ModelViewSet):
    queryset = FooterSetting.objects.all()
    serializer_class = FooterSettingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
`}
      urlsCode={`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FooterSettingViewSet

router = DefaultRouter()
router.register('settings', FooterSettingViewSet, basename='footer-settings')

urlpatterns = [
    path('', include(router.urls)),
]
`}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
