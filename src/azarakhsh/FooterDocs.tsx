import React from 'react';
import { Layout } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const FooterDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'footer_settings_footersetting',
      verboseName: 'تنظیمات اصلی فوتر',
      description: 'مدیریت متون برندینگ، اطلاعات تماس انبار مرکزی، کپی‌رایت، اینماد و مجوزها',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'company_title', type: 'CharField(max_length=255)', verbose: 'عنوان شرکت / انبار' },
        { name: 'short_description', type: 'TextField', verbose: 'توضیحات کوتاه برند در فوتر' },
        { name: 'address_text', type: 'TextField', verbose: 'آدرس انبار مرکزی' },
        { name: 'phone_number', type: 'CharField(max_length=20)', verbose: 'تلفن تماس سفارشات' },
        { name: 'emergency_phone', type: 'CharField(max_length=20)', verbose: 'تلفن فوری انبار' },
        { name: 'working_hours', type: 'CharField(max_length=150)', verbose: 'ساعات کاری انبار' },
        { name: 'shipping_companies', type: 'TextField(blank=True, null=True)', verbose: 'باربری‌های طرف قرارداد' },
        { name: 'enamad_code', type: 'TextField', verbose: 'کد ای‌نماد / مجوز' },
        { name: 'copyright_text', type: 'CharField(max_length=300)', verbose: 'متن کپی‌رایت' },
        { name: 'developer_credit', type: 'CharField(max_length=200)', verbose: 'متن توسعه‌دهنده و میزبانی' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'وضعیت نمایش' },
      ]
    },
    {
      name: 'footer_settings_footercolumn',
      verboseName: 'ستون‌های لینک فوتر',
      description: 'دسته‌بندی لینک‌های دسترسی سریع (مثلا: خدمات، قوانین، میانبرها)',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه ستون' },
        { name: 'title', type: 'CharField(max_length=100)', verbose: 'عنوان ستون (مثال: دسترسی سریع)' },
        { name: 'order', type: 'PositiveIntegerField(default=0)', verbose: 'ترتیب ستون' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'فعال' },
      ]
    },
    {
      name: 'footer_settings_footerlink',
      verboseName: 'لینک‌های زیرمجموعه ستون',
      description: 'آدرس‌ها و لینک‌های واقعی داخلی و خارجی فوتر',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه لینک' },
        { name: 'column', type: 'ForeignKey', isFk: true, fkTarget: 'FooterColumn', verbose: 'ستون مربوطه' },
        { name: 'title', type: 'CharField(max_length=150)', verbose: 'عنوان لینک' },
        { name: 'url', type: 'CharField(max_length=255)', verbose: 'مسیر / URL لینک' },
        { name: 'order', type: 'PositiveIntegerField(default=0)', verbose: 'ترتیب نمایش' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'فعال' },
      ]
    },
    {
      name: 'footer_settings_footersocial',
      verboseName: 'شبکه‌های اجتماعی و پیام‌رسان‌ها',
      description: 'لینک تلگرام، واتساپ، اینستاگرام، ایتا و روبیکا',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه شبکه' },
        { name: 'platform', type: 'CharField(max_length=50)', verbose: 'نام پلتفرم (telegram/instagram/whatsapp/...)' },
        { name: 'title', type: 'CharField(max_length=100)', verbose: 'عنوان نمایش' },
        { name: 'url', type: 'CharField(max_length=255)', verbose: 'لینک مستقیم' },
        { name: 'icon', type: 'CharField(max_length=50)', verbose: 'آیکون Lucide' },
        { name: 'order', type: 'PositiveIntegerField(default=0)', verbose: 'ترتیب' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/footer/settings/',
      auth: 'AllowAny',
      description: 'دریافت کانفیگ کامل فوتر شامل اطلاعات تماس، آدرس انبار، ستون‌های لینک و شبکه‌های اجتماعی',
      curlExample: 'curl -X GET http://localhost:8000/api/v1/footer/settings/',
      responseBody: `{
  "status": "success",
  "data": {
    "company_title": "پخش عمده دخانیات آذرخش (دخانیات سرو)",
    "short_description": "مرکز تخصصی توزیع بنکداری سیگار، تنباکو و تجهیزات آیکاس با ارسال فوری سراسری.",
    "address_text": "تهران، منطقه ۵، جنت‌آباد شمالی، انبار مرکزی آذرخش",
    "phone_number": "021-44000000",
    "emergency_phone": "09120759419",
    "working_hours": "شنبه تا چهارشنبه: ۸:۰۰ الی ۱۸:۰۰ | پنجشنبه‌ها: ۸:۰۰ الی ۱۴:۰۰",
    "shipping_companies": "باربری وطن، جهانگیر، پیام‌شمس، پیشتاز و ناوگان اختصاصی تهران",
    "copyright_text": "کلیه حقوق مادی و معنوی متعلق به سامانه پخش عمده آذرخش می‌باشد.",
    "developer_credit": "توسعه‌یافته توسط تیم فنی دخانیات سرو • میزبانی زیرساخت دخانیات سرو‌هاست",
    "columns": [
      {
        "id": 1,
        "title": "دسترسی سریع",
        "links": [
          { "title": "تابلوی نرخ لحظه‌ای", "url": "/live-prices" },
          { "title": "صدور پیش‌فاکتور", "url": "/invoice" },
          { "title": "صندوق آنلاین POS", "url": "/shopmanage" }
        ]
      },
      {
        "id": 2,
        "title": "خدمات مشتریان",
        "links": [
          { "title": "پیگیری وضعیت باربری", "url": "/shipping" },
          { "title": "ثبت تیکت پشتیبانی", "url": "/tickets" },
          { "title": "قوانین و ضمانت بار", "url": "/terms" }
        ]
      }
    ],
    "socials": [
      { "platform": "telegram", "title": "کانال اعلام نرخ تلگرام", "url": "https://t.me/azarakhsh_tobacco", "icon": "Send" },
      { "platform": "whatsapp", "title": "پشتیبانی واتساپ", "url": "https://wa.me/989120759419", "icon": "MessageSquare" },
      { "platform": "instagram", "title": "صفحه اینستاگرام", "url": "https://instagram.com/azarakhsh_tobacco", "icon": "Instagram" }
    ]
  }
}`
    },
    {
      method: 'PUT',
      path: '/api/v1/footer/settings/update/',
      auth: 'IsAdminUser',
      description: 'ویرایش اطلاعات تماس، آدرس و متون فوتر (مخصوص مدیران ارشد)',
      curlExample: `curl -X PUT http://localhost:8000/api/v1/footer/settings/update/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"phone_number": "09120759419", "working_hours": "۲۴ ساعته آنلاین"}'`
    }
  ];

  return (
    <AppDocTemplate
      appFolder="footer_settings"
      title="اپلیکیشن مدیریت فوتر و لینک‌ها (Footer Settings App)"
      titleEn="footer_settings / Complete Footer Management"
      badge="فوتر داینامیک و لینک‌ها"
      description="مدیریت کامل اطلاعات تماس انبار مرکزی، لینک‌های ناوبری، ستون‌های دسترسی سریع، شبکه‌های اجتماعی، نمادهای اعتماد و کپی‌رایت. این ماژول بر پایه APIView صریح پیاده‌سازی شده و تمامی داده‌های فوتر را در یک درخواست به فرانت‌اند React تحویل می‌دهد."
      icon={<Layout className="w-6 h-6 text-amber-500" />}
      modelsCode={`"""
footer_settings/models.py
مدل‌های مدیریت متون فوتر، ستون‌های لینک، شبکه‌های اجتماعی و مجوزهای نماد اعتماد
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class FooterSetting(models.Model):
    """
    مدل تکین (Singleton) برای اطلاعات اصلی و ثابت فوتر
    """
    company_title = models.CharField(
        max_length=255, 
        default="پخش عمده دخانیات آذرخش", 
        verbose_name=_("عنوان شرکت / انبار")
    )
    short_description = models.TextField(
        blank=True, 
        null=True, 
        default="مرکز تخصصی توزیع بنکداری سیگار، تنباکو و تجهیزات آیکاس با ارسال فوری سراسری.",
        verbose_name=_("توضیحات کوتاه در فوتر")
    )
    address_text = models.TextField(
        default="تهران، منطقه ۵، جنت‌آباد شمالی، انبار مرکزی آذرخش", 
        verbose_name=_("آدرس انبار مرکزی")
    )
    phone_number = models.CharField(
        max_length=20, 
        default="021-44000000", 
        verbose_name=_("تلفن ثابت سفارشات")
    )
    emergency_phone = models.CharField(
        max_length=20, 
        default="09120759419", 
        verbose_name=_("تلفن همراه و فوری انبار")
    )
    working_hours = models.CharField(
        max_length=150, 
        default="شنبه تا چهارشنبه: ۸:۰۰ الی ۱۸:۰۰ | پنجشنبه‌ها: ۸:۰۰ الی ۱۴:۰۰", 
        verbose_name=_("ساعات کاری انبار")
    )
    shipping_companies = models.TextField(
        blank=True, 
        null=True, 
        default="باربری وطن، جهانگیر، پیام‌شمس، پیشتاز و ناوگان اختصاصی تهران",
        verbose_name=_("باربری‌های طرف قرارداد")
    )
    enamad_code = models.TextField(
        blank=True, 
        null=True, 
        verbose_name=_("کد HTML نماد اعتماد / ساماندهی")
    )
    copyright_text = models.CharField(
        max_length=300, 
        default="کلیه حقوق مادی و معنوی متعلق به سامانه پخش عمده آذرخش می‌باشد.", 
        verbose_name=_("متن کپی‌رایت")
    )
    developer_credit = models.CharField(
        max_length=200, 
        default="توسعه‌یافته توسط تیم فنی دخانیات سرو • میزبانی زیرساخت دخانیات سرو‌هاست", 
        verbose_name=_("متن توسعه‌دهنده و میزبانی")
    )
    is_active = models.BooleanField(default=True, verbose_name=_("وضعیت نمایش فوتر"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("آخرین به‌روزرسانی"))

    class Meta:
        verbose_name = _("تنظیمات اصلی فوتر")
        verbose_name_plural = _("تنظیمات اصلی فوتر")

    def __str__(self):
        return f"تنظیمات فوتر - {self.company_title}"


class FooterColumn(models.Model):
    """
    مدل ستون‌های دسترسی سریع در فوتر (مانند: خدمات مشتریان، قوانین، میانبرها)
    """
    title = models.CharField(max_length=100, verbose_name=_("عنوان ستون"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("ترتیب نمایش"))
    is_active = models.BooleanField(default=True, verbose_name=_("وضعیت فعال"))

    class Meta:
        verbose_name = _("ستون لینک‌های فوتر")
        verbose_name_plural = _("ستون‌های لینک‌های فوتر")
        ordering = ['order', 'id']

    def __str__(self):
        return f"ستون: {self.title}"


class FooterLink(models.Model):
    """
    لینک‌های زیرمجموعه هر ستون
    """
    column = models.ForeignKey(
        FooterColumn, 
        on_delete=models.CASCADE, 
        related_name='links',
        verbose_name=_("ستون مربوطه")
    )
    title = models.CharField(max_length=150, verbose_name=_("عنوان لینک"))
    url = models.CharField(max_length=255, verbose_name=_("مسیر یا آدرس URL"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("ترتیب"))
    is_active = models.BooleanField(default=True, verbose_name=_("فعال"))

    class Meta:
        verbose_name = _("لینک فوتر")
        verbose_name_plural = _("لینک‌های فوتر")
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.column.title} → {self.title}"


class FooterSocial(models.Model):
    """
    شبکه‌های اجتماعی و کانال‌های اطلاع‌رسانی در فوتر
    """
    platform = models.CharField(
        max_length=50, 
        verbose_name=_("نام پلتفرم (مثال: telegram, instagram, whatsapp, eitaa)")
    )
    title = models.CharField(max_length=100, verbose_name=_("عنوان نمایش"))
    url = models.CharField(max_length=255, verbose_name=_("لینک مستقیم"))
    icon = models.CharField(max_length=50, default="Send", verbose_name=_("نام آیکون Lucide"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("ترتیب"))
    is_active = models.BooleanField(default=True, verbose_name=_("فعال"))

    class Meta:
        verbose_name = _("شبکه اجتماعی فوتر")
        verbose_name_plural = _("شبکه‌های اجتماعی فوتر")
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.platform}: {self.title}"
`}
      adminCode={`"""
footer_settings/admin.py
مدیریت پنل ادمین فوتر با قابلیت اینلاین لینک‌ها و شبکه‌های اجتماعی
"""

from django.contrib import admin
from .models import FooterSetting, FooterColumn, FooterLink, FooterSocial


class FooterLinkInline(admin.TabularInline):
    model = FooterLink
    extra = 2
    fields = ('title', 'url', 'order', 'is_active')


@admin.register(FooterColumn)
class FooterColumnAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    inlines = [FooterLinkInline]


@admin.register(FooterSocial)
class FooterSocialAdmin(admin.ModelAdmin):
    list_display = ('platform', 'title', 'url', 'icon', 'order', 'is_active')
    list_editable = ('order', 'is_active')


@admin.register(FooterSetting)
class FooterSettingAdmin(admin.ModelAdmin):
    list_display = ('company_title', 'phone_number', 'emergency_phone', 'is_active', 'get_shamsi_updated_at')
    list_editable = ('is_active',)

    fieldsets = (
        ('اطلاعات برندینگ فوتر', {
            'fields': ('company_title', 'short_description', 'is_active')
        }),
        ('اطلاعات تماس انبار مرکزی و باربری‌ها', {
            'fields': ('address_text', 'phone_number', 'emergency_phone', 'working_hours', 'shipping_companies')
        }),
        ('مجوزها و ای‌نماد', {
            'fields': ('enamad_code',)
        }),
        ('کپی‌رایت و توسعه‌دهنده', {
            'fields': ('copyright_text', 'developer_credit')
        }),
    )

    def has_add_permission(self, request):
        # جلوگیری از ایجاد بیش از یک رکورد تنظیمات فوتر (طرح Singleton)
        if FooterSetting.objects.exists():
            return False
        return super().has_add_permission(request)

    @admin.display(description="آخرین به‌روزرسانی (شمسی)")
    def get_shamsi_updated_at(self, obj):
        if not obj or not obj.updated_at:
            return "-"
        try:
            import jdatetime
            return jdatetime.datetime.fromgregorian(datetime=obj.updated_at).strftime("%Y/%m/%d - %H:%M")
        except Exception:
            return obj.updated_at.strftime("%Y-%m-%d %H:%M") if obj.updated_at else "-"

    # افزایش عرض باکس‌های متنی طولانی فوتر برای بهبود زیبایی و خوانایی
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        field = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name in ['working_hours', 'shipping_companies', 'copyright_text', 'developer_credit', 'company_title']:
            field.widget.attrs.update({
                'style': 'width: 100%; max-width: 700px; min-width: 450px;',
                'class': 'vLargeTextField'
            })
        return field
`}
      serializersCode={`"""
footer_settings/serializers.py
سریالایزرهای DRF برای تبدیل تمام بخش‌های فوتر به یک ساختار JSON یکپارچه
"""

from rest_framework import serializers
from .models import FooterSetting, FooterColumn, FooterLink, FooterSocial


class FooterLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterLink
        fields = ['id', 'title', 'url', 'order']


class FooterColumnSerializer(serializers.ModelSerializer):
    links = serializers.SerializerMethodField()

    class Meta:
        model = FooterColumn
        fields = ['id', 'title', 'order', 'links']

    def get_links(self, obj):
        active_links = obj.links.filter(is_active=True).order_by('order')
        return FooterLinkSerializer(active_links, many=True).data


class FooterSocialSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterSocial
        fields = ['id', 'platform', 'title', 'url', 'icon', 'order']


class FooterSettingSerializer(serializers.ModelSerializer):
    columns = serializers.SerializerMethodField()
    socials = serializers.SerializerMethodField()

    class Meta:
        model = FooterSetting
        ref_name = 'FooterSettings_FooterSettingSerializer'
        fields = [
            'company_title',
            'short_description',
            'address_text',
            'phone_number',
            'emergency_phone',
            'working_hours',
            'shipping_companies',
            'enamad_code',
            'copyright_text',
            'developer_credit',
            'columns',
            'socials'
        ]

    def get_columns(self, obj):
        active_cols = FooterColumn.objects.filter(is_active=True).order_by('order')
        return FooterColumnSerializer(active_cols, many=True).data

    def get_socials(self, obj):
        active_socials = FooterSocial.objects.filter(is_active=True).order_by('order')
        return FooterSocialSerializer(active_socials, many=True).data
`}
      viewsCode={`"""
footer_settings/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) برای سرویس‌دهی یکپارچه فوتر
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from drf_yasg.utils import swagger_auto_schema

from .models import FooterSetting
from .serializers import FooterSettingSerializer


class FooterConfigAPIView(APIView):
    """
    اندپوینت دریافت کانفیگ کامل و جامع فوتر وب‌سایت
    توضیحات: این ویو بر پایه APIView صریح نوشته شده و تمامی داده‌های اطلاعات تماس،
    ستون‌های لینک‌های میانبر، شبکه‌های اجتماعی و کپی‌رایت را به صورت یکپارچه برمی‌گرداند.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت کانفیگ کامل فوتر سایت",
        operation_description="ارسال اطلاعات تماس انبار، آدرس، لینک‌های فوتر و شبکه‌های اجتماعی جهت رندر در فرانت‌اند React.",
        responses={200: FooterSettingSerializer}
    )
    def get(self, request):
        # ۱. دریافت تنظیمات فعال فوتر (در صورت عدم وجود، ایجاد نمونه پیش‌فرض)
        setting = FooterSetting.objects.filter(is_active=True).first()
        if not setting:
            setting = FooterSetting.objects.create(
                company_title="پخش عمده دخانیات آذرخش",
                address_text="تهران، منطقه ۵، جنت‌آباد شمالی، انبار مرکزی آذرخش",
                phone_number="021-44000000",
                emergency_phone="09120759419"
            )

        # ۲. تبدیل داده‌ها به فرمت JSON یکپارچه
        serializer = FooterSettingSerializer(setting, context={'request': request})

        # ۳. ارسال پاسخ صریح
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class FooterUpdateAPIView(APIView):
    """
    اندپوینت بروزرسانی تنظیمات اصلی فوتر (مخصوص مدیران ارشد)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ویرایش تنظیمات اصلی فوتر (مدیریت)",
        request_body=FooterSettingSerializer,
        responses={200: FooterSettingSerializer}
    )
    def put(self, request):
        setting = FooterSetting.objects.first()
        if not setting:
            setting = FooterSetting.objects.create()

        serializer = FooterSettingSerializer(setting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'تنظیمات فوتر با موفقیت بروزرسانی شد.',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
`}
      urlsCode={`"""
footer_settings/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import FooterConfigAPIView, FooterUpdateAPIView

app_name = 'footer_settings'

urlpatterns = [
    # ۱. دریافت کامل تنظیمات، لینک‌ها و متون فوتر
    path('settings/', FooterConfigAPIView.as_view(), name='footer-config'),
    
    # ۲. ویرایش تنظیمات فوتر (مخصوص مدیریت)
    path('settings/update/', FooterUpdateAPIView.as_view(), name='footer-update'),
]
`}
      notesCode={`## 📌 راهنمای جامع اتصال فوتر به فرانت‌اند React

### ۱. معماری APIView در ماژول فوتر:
* این ماژول کاملاً به صورت **APIView صریح** پیاده‌سازی شده و از ViewSet یا Routerهای اتوماتیک استفاده نمی‌کند.
* **مزیت:** تمامی اطلاعات تماس انبار، لینک‌های ستونی، شبکه‌های اجتماعی و نمادهای اعتماد تنها با **یک درخواست شبکه** دریافت می‌شوند.

---

### ۲. فراخوانی در کامپوننت Footer.tsx در React:
\`\`\`typescript
import React, { useEffect, useState } from 'react';

export const Footer = () => {
  const [footerData, setFooterData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/footer/settings/')
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setFooterData(res.data);
        }
      });
  }, []);

  if (!footerData) return null;

  return (
    <footer className="bg-slate-900 text-white p-8">
      {/* اطلاعات انبار و تماس */}
      <h3>{footerData.company_title}</h3>
      <p>{footerData.address_text}</p>
      <p>تلفن: {footerData.phone_number} | فوری: {footerData.emergency_phone}</p>

      {/* ستون‌های لینک */}
      {footerData.columns.map(col => (
        <div key={col.id}>
          <h4>{col.title}</h4>
          <ul>
            {col.links.map(link => (
              <li key={link.id}><a href={link.url}>{link.title}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </footer>
  );
};
\`\`\`
`}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
