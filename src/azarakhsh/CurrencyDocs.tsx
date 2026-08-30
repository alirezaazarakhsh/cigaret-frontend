import React from 'react';
import { Coins } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const CurrencyDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'currency_rates_currency',
      verboseName: 'ارزها و نرخ تبدیل به تومان (Currency)',
      description: 'جدول تعریف ارزهای خارجی (دلار، درهم، یورو) و ثبت آخرین نرخ تبدیل به تومان جهت قیمت‌گذاری هوشمند کالاها',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'code', type: 'CharField(max_length=10)', isUnique: true, verbose: 'کد ارز (USD, EUR, AED)' },
        { name: 'title', type: 'CharField(max_length=50)', verbose: 'نام ارز (دلار آمریکا، درهم امارات)' },
        { name: 'symbol', type: 'CharField(max_length=10)', verbose: 'نماد ($ , € , AED)' },
        { name: 'rate_in_toman', type: 'BigIntegerField', verbose: 'نرخ تبدیل پایه به تومان (مثلاً ۹۲,۰۰۰)' },
        { name: 'is_active', type: 'BooleanField', verbose: 'فعال جهت محاسبات' },
        { name: 'is_base', type: 'BooleanField', verbose: 'ارز پایه (تومان)' },
        { name: 'updated_at', type: 'DateTimeField', verbose: 'زمان آخرین بروزرسانی نرخ' },
      ]
    },
    {
      name: 'currency_rates_history',
      verboseName: 'تاریخچه تغییرات نرخ ارز (Rate History)',
      description: 'ثبت تاریخچه تغییرات قیمت دلار و ارزها توسط مدیریت جهت حسابرسی و تحلیل روند تورمی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'currency', type: 'ForeignKey(Currency)', isFk: true, fkTarget: 'currency_rates_currency', verbose: 'ارز مربوطه' },
        { name: 'old_rate', type: 'BigIntegerField', verbose: 'نرخ قبلی (تومان)' },
        { name: 'new_rate', type: 'BigIntegerField', verbose: 'نرخ جدید (تومان)' },
        { name: 'changed_by', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_customuser', verbose: 'کاربر بروزرسانی‌کننده' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ و ساعت تغییر' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/currency-rates/rates/',
      auth: 'Public / IsAuthenticated',
      description: 'دریافت فهرست آخرین نرخ‌های فعال ارزها (دلار، یورو، درهم) جهت محاسبه قیمت کالاها',
      responseBody: JSON.stringify([
        {
          id: 1,
          code: "USD",
          title: "دلار آمریکا",
          symbol: "$",
          rate_in_toman: 92000,
          is_active: true,
          updated_at: "2026-08-29T09:30:00Z"
        },
        {
          id: 2,
          code: "AED",
          title: "درهم امارات",
          symbol: "AED",
          rate_in_toman: 25000,
          is_active: true,
          updated_at: "2026-08-29T09:30:00Z"
        }
      ], null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/currency-rates/update-rate/',
      auth: 'IsAdminUser',
      description: 'بروزرسانی نرخ یک ارز خاص (مثلا دلار به ۹۲,۵۰۰ تومان) و اعمال تغییرات بر روی محصولات ارزی',
      requestBody: JSON.stringify({
        currency_code: "USD",
        new_rate_in_toman: 92500,
        update_product_prices: true
      }, null, 2),
      responseBody: JSON.stringify({
        message: "نرخ دلار با موفقیت به ۹۲,۵۰۰ تومان بروزرسانی شد.",
        affected_products_count: 142,
        updated_at: "2026-08-29T10:15:00Z"
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/currency-rates/history/',
      auth: 'IsAdminUser',
      description: 'دریافت تاریخچه و سوابق تغییرات نرخ ارز همراه با نام کاربر بروزرسانی‌کننده'
    },
    {
      method: 'POST',
      path: '/api/v1/currency-rates/convert/',
      auth: 'Public',
      description: 'تبدیل آنلاین مبلغ ارزی به تومان یا برعکس بر اساس آخرین نرخ ثبت‌شده سیستم',
      requestBody: JSON.stringify({
        amount: 15.5,
        from_currency: "USD",
        to_currency: "TOMAN"
      }, null, 2),
      responseBody: JSON.stringify({
        converted_amount: 1426250,
        rate_used: 92000,
        formatted: "۱,۴۲۶,۲۵۰ تومان"
      }, null, 2)
    }
  ];

  const modelsCode = `"""
currency_rates/models.py
مدل دیتابیس ثبت نرخ ارزها و تاریخچه تغییرات قیمت دلار/تومان
"""
from django.db import models
from django.conf import settings
from django.utils import timezone


class Currency(models.Model):
    """
    مدل تعریف ارزهای مختلف و نرخ تبدیل رسمی به تومان
    """
    code = models.CharField(
        max_length=10,
        unique=True,
        verbose_name="کد ارز (مثلاً USD, EUR, AED)"
    )
    title = models.CharField(
        max_length=50,
        verbose_name="عنوان ارز (مثلاً دلار آمریکا)"
    )
    symbol = models.CharField(
        max_length=10,
        default='$',
        verbose_name="نماد ارز"
    )
    rate_in_toman = models.BigIntegerField(
        default=0,
        verbose_name="نرخ هر واحد ارز به تومان"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="فعال در سیستم"
    )
    is_base = models.BooleanField(
        default=False,
        verbose_name="ارز پایه سیستم (تومان)"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ بروزرسانی نرخ")

    class Meta:
        verbose_name = "ارز"
        verbose_name_plural = "ارزها و نرخ مبادله"
        ordering = ['code']

    def __str__(self):
        return f"{self.title} ({self.code}) - {self.rate_in_toman:,} تومان"


class ExchangeRateHistory(models.Model):
    """
    تاریخچه تغییرات قیمت ارزها جهت حسابرسی
    """
    currency = models.ForeignKey(
        Currency,
        on_delete=models.CASCADE,
        related_name='history',
        verbose_name="ارز"
    )
    old_rate = models.BigIntegerField(verbose_name="نرخ قبلی (تومان)")
    new_rate = models.BigIntegerField(verbose_name="نرخ جدید (تومان)")
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="تغییر دهنده"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ و ساعت تغییر")

    class Meta:
        verbose_name = "سوابق تغییر نرخ ارز"
        verbose_name_plural = "تاریخچه نرخ ارز"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.currency.code}: {self.old_rate:,} -> {self.new_rate:,} تومان"
`;

  const adminCode = `"""
currency_rates/admin.py
پنل مدیریت نرخ ارز در ادمین جنگو
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Currency, ExchangeRateHistory


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ['code', 'title', 'symbol', 'formatted_rate', 'is_active', 'updated_at']
    list_editable = ['is_active']
    search_fields = ['code', 'title']
    readonly_fields = ['updated_at', 'created_at']

    def formatted_rate(self, obj):
        return format_html('<b style="color: #0d9488; font-size: 14px;">{} تومان</b>', f"{obj.rate_in_toman:,}")
    formatted_rate.short_description = "نرخ تبدیل به تومان"


@admin.register(ExchangeRateHistory)
class ExchangeRateHistoryAdmin(admin.ModelAdmin):
    list_display = ['currency', 'formatted_old_rate', 'formatted_new_rate', 'changed_by', 'created_at']
    list_filter = ['currency', 'created_at']
    readonly_fields = ['currency', 'old_rate', 'new_rate', 'changed_by', 'created_at']

    def formatted_old_rate(self, obj):
        return f"{obj.old_rate:,} تومان"
    formatted_old_rate.short_description = "نرخ قبلی"

    def formatted_new_rate(self, obj):
        return f"{obj.new_rate:,} تومان"
    formatted_new_rate.short_description = "نرخ جدید"
`;

  const serializersCode = `"""
currency_rates/serializers.py
سریالایزرهای DRF برای مدیریت و بروزرسانی نرخ ارز
"""
from rest_framework import serializers
from .models import Currency, ExchangeRateHistory


class CurrencySerializer(serializers.ModelSerializer):
    """
    سریالایزر دریافت لیست و اطلاعات ارز
    """
    formatted_rate = serializers.SerializerMethodField()

    class Meta:
        model = Currency
        fields = [
            'id',
            'code',
            'title',
            'symbol',
            'rate_in_toman',
            'formatted_rate',
            'is_active',
            'is_base',
            'updated_at'
        ]

    def get_formatted_rate(self, obj):
        return f"{obj.rate_in_toman:,} تومان"


class UpdateCurrencyRateSerializer(serializers.Serializer):
    """
    ورودی تغییر نرخ ارز توسط مدیر
    """
    currency_code = serializers.CharField(max_length=10, help_text="کد ارز مثل USD یا AED")
    new_rate_in_toman = serializers.IntegerField(min_value=1, help_text="نرخ جدید به تومان")
    update_product_prices = serializers.BooleanField(default=True, help_text="آیا قیمت ریالی محصولات ارزی بر اساس نرخ جدید بروزرسانی شود؟")


class CurrencyConvertSerializer(serializers.Serializer):
    """
    ورودی تبدیل آنلاین مبلغ ارزی
    """
    amount = serializers.FloatField(min_value=0.01, help_text="مبلغ ارزی")
    from_currency = serializers.CharField(max_length=10, default="USD")
    to_currency = serializers.CharField(max_length=10, default="TOMAN")


class ExchangeRateHistorySerializer(serializers.ModelSerializer):
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = ExchangeRateHistory
        fields = ['id', 'currency_code', 'old_rate', 'new_rate', 'changed_by_name', 'created_at']
`;

  const viewsCode = `"""
currency_rates/views.py
ویوهای صریح APIView جهت استعلام و بروزرسانی نرخ ارز
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import Currency, ExchangeRateHistory
from .serializers import (
    CurrencySerializer,
    UpdateCurrencyRateSerializer,
    CurrencyConvertSerializer,
    ExchangeRateHistorySerializer,
)


class CurrencyListAPIView(APIView):
    """
    دریافت لیست تمام ارزها و نرخ فعلی به تومان
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_id="لیست_نرخ_ارزها",
        operation_description="دریافت لیست آخرین نرخ ارزهای فعال در سیستم (دلار، درهم، یورو)",
        tags=["نرخ ارز و قیمت‌گذاری (Currency Rates)"],
        responses={200: CurrencySerializer(many=True)}
    )
    def get(self, request):
        currencies = Currency.objects.filter(is_active=True)
        serializer = CurrencySerializer(currencies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateRateAPIView(APIView):
    """
    تغییر و بروزرسانی نرخ ارز توسط مدیریت
    """
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        operation_id="بروزرسانی_نرخ_ارز",
        operation_description="تغییر نرخ تبدیل ارز پایه (مثلا دلار) به تومان و ثبت در دیتابیس",
        tags=["نرخ ارز و قیمت‌گذاری (Currency Rates)"],
        request_body=UpdateCurrencyRateSerializer,
        responses={200: openapi.Response(description="نرخ با موفقیت تغییر کرد")}
    )
    def post(self, request):
        serializer = UpdateCurrencyRateSerializer(data=request.data)
        if serializer.is_valid():
            code = serializer.validated_data['currency_code'].upper()
            new_rate = serializer.validated_data['new_rate_in_toman']
            update_products = serializer.validated_data.get('update_product_prices', True)

            try:
                currency = Currency.objects.get(code=code)
            except Currency.DoesNotExist:
                return Response({'error': f'ارز با کد {code} یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

            old_rate = currency.rate_in_toman
            currency.rate_in_toman = new_rate
            currency.save()

            # ثبت در تاریخچه تغییرات
            ExchangeRateHistory.objects.create(
                currency=currency,
                old_rate=old_rate,
                new_rate=new_rate,
                changed_by=request.user
            )

            affected_count = 0
            # در صورت درخواست، قیمت ریالی تمام کالاهای متصل به این ارز بروزرسانی می‌شود
            if update_products:
                from products.models import Product  # یا مدل محصولات شما
                products = Product.objects.filter(currency_code=code)
                for p in products:
                    if hasattr(p, 'price_in_currency') and p.price_in_currency:
                        p.price_in_toman = int(p.price_in_currency * new_rate)
                        p.save(update_fields=['price_in_toman'])
                        affected_count += 1

            return Response({
                'message': f'نرخ {currency.title} با موفقیت به {new_rate:,} تومان تغییر یافت.',
                'old_rate': old_rate,
                'new_rate': new_rate,
                'affected_products_count': affected_count
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrencyConvertAPIView(APIView):
    """
    تبدیل هوشمند مبلغ ارزی به تومان
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_id="تبدیل_آنلاین_ارز",
        operation_description="محاسبه و تبدیل مبلغ ارزی به تومان بر اساس نرخ روز",
        tags=["نرخ ارز و قیمت‌گذاری (Currency Rates)"],
        request_body=CurrencyConvertSerializer,
        responses={200: openapi.Response(description="مبلغ تبدیل شده")}
    )
    def post(self, request):
        serializer = CurrencyConvertSerializer(data=request.data)
        if serializer.is_valid():
            amount = serializer.validated_data['amount']
            from_code = serializer.validated_data['from_currency'].upper()

            if from_code == 'TOMAN' or from_code == 'IRR':
                return Response({
                    'converted_amount': int(amount),
                    'rate_used': 1,
                    'formatted': f"{int(amount):,} تومان"
                })

            try:
                currency = Currency.objects.get(code=from_code, is_active=True)
            except Currency.DoesNotExist:
                return Response({'error': f'ارز {from_code} یافت نشد یا غیرفعال است.'}, status=status.HTTP_400_BAD_REQUEST)

            converted_toman = int(amount * currency.rate_in_toman)
            return Response({
                'converted_amount': converted_toman,
                'rate_used': currency.rate_in_toman,
                'currency_symbol': currency.symbol,
                'formatted': f"{converted_toman:,} تومان"
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExchangeHistoryListAPIView(APIView):
    """
    دریافت سوابق تغییرات نرخ ارز
    """
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        operation_id="تاریخچه_تغییرات_نرخ_ارز",
        operation_description="سوابق تغییر قیمت دلار و ارزها در دیتابیس",
        tags=["نرخ ارز و قیمت‌گذاری (Currency Rates)"],
        responses={200: ExchangeRateHistorySerializer(many=True)}
    )
    def get(self, request):
        history = ExchangeRateHistory.objects.all().select_related('currency', 'changed_by')[:50]
        serializer = ExchangeRateHistorySerializer(history, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
currency_rates/urls.py
مسیرهای صریح APIView برای مدیریت نرخ ارز
"""
from django.urls import path
from .views import (
    CurrencyListAPIView,
    UpdateRateAPIView,
    CurrencyConvertAPIView,
    ExchangeHistoryListAPIView,
)

app_name = 'currency_rates'

urlpatterns = [
    # ۱. استعلام نرخ‌های فعال
    path('rates/', CurrencyListAPIView.as_view(), name='currency-list'),

    # ۲. بروزرسانی نرخ ارز توسط ادمین
    path('update-rate/', UpdateRateAPIView.as_view(), name='currency-update'),

    # ۳. تبدیل آنلاین ارز
    path('convert/', CurrencyConvertAPIView.as_view(), name='currency-convert'),

    # ۴. تاریخچه تغییرات قیمت ارز
    path('history/', ExchangeHistoryListAPIView.as_view(), name='currency-history'),
]
`;

  const notesCode = `## 📌 راهنمای جامع و تکمیلی تنظیمات نرخ ارز و قیمت‌گذاری چند ارزی (currency_rates)

### 💡 نحوه کارکرد سیستم قیمت‌گذاری ارزی در فروشگاه:
در فروشگاه‌های سیگار و کالاهای وارداتی، قیمت بیشتر کالاها بر اساس **دلار یا درهم** است. با تغییر روزانه نرخ دلار، تغییر دستی تک تک قیمت‌ها غیرممکن است.

این اپلیکیشن امکانات زیر را فراهم می‌سازد:
۱. **قیمت‌گذاری بر پایه دلار/درهم**: در مدل محصول (\`Product\`)، علاوه بر قیمت ریالی، دو فیلد \`currency_code\` (مثلاً USD) و \`price_in_currency\` (مثلاً 12.50 دلار) تعریف می‌شود.
۲. **بروزرسانی آنی و دسته جمعی**: هنگام تغییر نرخ دلار در API \`/api/v1/currency-rates/update-rate/\` با مقدار \`update_product_prices: true\`، قیمت تومانی تمامی کالاها خودکار فرمول‌بندی و در دیتابیس بروزرسانی می‌شود.
۳. **ثبت سوابق در دیتابیس**: تغییرات نرخ همراه با شناسه کاربر ادمین و تاریخ/ساعت دقیق در مدل \`ExchangeRateHistory\` ذخیره می‌گردد.

---

### 📂 ۱. ساختار پوشه اپلیکیشن در پروژه جنگو:
\`\`\`text
currency_rates/
├── __init__.py
├── admin.py          # نمایش هایلایت‌شده نرخ‌ها و جدول تاریخچه
├── apps.py           # CurrencyRatesConfig
├── models.py         # مدل‌های Currency و ExchangeRateHistory
├── serializers.py    # سریالایزرهای DRF
├── urls.py           # مسیرهای صریح URL
└── views.py          # ویوهای APIView به همراه swagger_auto_schema
\`\`\`

---

### 🚀 ۲. نمونه فرانت‌اند React جهت بروزرسانی نرخ دلار توسط مدیریت:

\`\`\`typescript
// تابع تغییر نرخ دلار آمریکا در پنل ادمین
export const updateDollarRate = async (newRateInToman: number) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/v1/currency-rates/update-rate/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      currency_code: 'USD',
      new_rate_in_toman: newRateInToman,
      update_product_prices: true
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'خطا در بروزرسانی نرخ دلار');
  }

  return await response.json();
};
\`\`\`

---

### ⚙️ ۳. مراحل اجرا و اعمال مایگریشن:
\`\`\`bash
# ۱. اضافه کردن 'currency_rates.apps.CurrencyRatesConfig' به INSTALLED_APPS در settings.py
# ۲. اجرای مایگریشن
python manage.py makemigrations currency_rates
python manage.py migrate

# ۳. ایجاد ارز اولیه در شل جنگو (Optional)
python manage.py shell
>>> from currency_rates.models import Currency
>>> Currency.objects.create(code='USD', title='دلار آمریکا', symbol='$', rate_in_toman=92000)
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="currency_rates"
      title="اپلیکیشن تنظیم نرخ ارز و قیمت‌گذاری چند ارزی (currency_rates)"
      titleEn="currency_rates / Exchange Rates & Multi-Currency"
      badge="Exchange Rate • Multi-Currency • Price Batch Sync"
      description="سیستم کامل مدیریت نرخ دلار/درهم/یورو، بروزرسانی خودکار و دسته‌جمعی قیمت محصولات بر اساس نرخ روز و ثبت تاریخچه تغییرات ارز در دیتابیس"
      icon={<Coins className="w-6 h-6 text-amber-400" />}
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
