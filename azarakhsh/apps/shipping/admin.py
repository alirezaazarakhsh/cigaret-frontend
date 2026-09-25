"""
shipping/admin.py
مدیریت تعرفه‌های باربری و ناوگان در ادمین جنگو
"""
from django.contrib import admin
from .models import ShippingMethod, ProvincialTariff


@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'base_cost', 'estimated_time', 'is_active')
    list_editable = ('base_cost', 'is_active')


@admin.register(ProvincialTariff)
class ProvincialTariffAdmin(admin.ModelAdmin):
    list_display = ('province', 'capital_city', 'vatan_freight_cost', 'express_fleet_available')
    search_fields = ('province', 'capital_city')
    list_editable = ('vatan_freight_cost', 'express_fleet_available')
