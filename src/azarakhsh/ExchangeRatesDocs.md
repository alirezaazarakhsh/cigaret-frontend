# مستندات اپلیکیشن نرخ ارز (Exchange Rates App)

این سند راهنمای ایجاد و پیکربندی اپلیکیشن جدید `exchange_rates` در پروژه جنگو `azarakhsh_project` است.

## ۱. ایجاد اپلیکیشن جدید
ابتدا در ریشه پروژه (در کانتینر جنگو) دستور زیر را اجرا کنید:

```bash
python manage.py startapp exchange_rates
```

سپس اپلیکیشن را به `INSTALLED_APPS` در `azarakhsh_project/settings.py` اضافه کنید:

```python
INSTALLED_APPS = [
    # ...
    'exchange_rates',  # فقط نام اپلیکیشن را اضافه کنید
]
```

## ۲. مدل (models.py)
در فایل `exchange_rates/models.py` مدل نرخ ارز را تعریف کنید:

```python
from django.db import models

class ExchangeRate(models.Model):
    currency_code = models.CharField(max_length=3, unique=True, verbose_name='کد ارز')
    rate = models.DecimalField(max_digits=15, decimal_places=2, verbose_name='نرخ به تومان')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    class Meta:
        verbose_name = 'نرخ ارز'
        verbose_name_plural = 'نرخ‌های ارز'

    def __str__(self):
        return f"{self.currency_code}: {self.rate}"
```

## ۳. سریالایزر (serializers.py)
فایل `exchange_rates/serializers.py` را ایجاد کنید:

```python
from rest_framework import serializers
from .models import ExchangeRate

class ExchangeRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRate
        fields = ['currency_code', 'rate', 'updated_at']
```

## ۴. ویوها (views.py)
در `exchange_rates/views.py`:

```python
from rest_framework import viewsets
from .models import ExchangeRate
from .serializers import ExchangeRateSerializer

class ExchangeRateViewSet(viewsets.ModelViewSet):
    queryset = ExchangeRate.objects.all()
    serializer_class = ExchangeRateSerializer
```

## ۵. مسیرها (urls.py)
فایل `exchange_rates/urls.py` را ایجاد کنید:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExchangeRateViewSet

router = DefaultRouter()
router.register(r'rates', ExchangeRateViewSet)

urlpatterns = [
    path('api/v1/', include(router.urls)),
]
```
سپس این مسیرها را در `azarakhsh_project/urls.py` اصلی پروژه ثبت کنید.

## ۶. ادمین (admin.py)
```python
from django.contrib import admin
from .models import ExchangeRate

@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ('currency_code', 'rate', 'updated_at')
```

بعد از این مراحل دستور `python manage.py makemigrations` و `python manage.py migrate` را اجرا کنید.
