"""
warehouse/admin.py
پنل ادمین انبار، کاردکس و موجودی کالاها
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import WarehouseLocation, WarehouseStock, KardexEntry


@admin.register(WarehouseLocation)
class WarehouseLocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'manager', 'phone', 'is_active')
    search_fields = ('name', 'code')


@admin.register(WarehouseStock)
class WarehouseStockAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse', 'cartons_count', 'loose_boxes_count', 'stock_status_badge', 'updated_at')
    list_filter = ('warehouse', 'product__brand')
    search_fields = ('product__name_fa', 'warehouse__name')

    def stock_status_badge(self, obj):
        if obj.cartons_count <= 0:
            return format_html('<span style="color: red; font-weight: bold;">ناموجود (اتمام)</span>')
        elif obj.cartons_count <= obj.min_stock_alert:
            return format_html(f'<span style="color: orange; font-weight: bold;">رو به اتمام ({obj.cartons_count} کارتن)</span>')
        return format_html(f'<span style="color: green;">موجود کافی ({obj.cartons_count} کارتن)</span>')
    stock_status_badge.short_description = "وضعیت شارژ انبار"


@admin.register(KardexEntry)
class KardexEntryAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'stock', 'movement_type', 'reference_code', 'quantity_cartons_change', 'balance_cartons_after', 'operator')
    list_filter = ('movement_type', 'stock__warehouse', 'created_at')
    search_fields = ('reference_code', 'stock__product__name_fa')
    readonly_fields = ('created_at',)
