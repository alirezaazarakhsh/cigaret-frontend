from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import ProductBrand

def to_jalali_str(dt):
    if not dt:
        return "-"
    try:
        from jalali_date import datetime2jalali
        jalali_dt = datetime2jalali(dt)
        return jalali_dt.strftime('%Y/%m/%d - %H:%M')
    except Exception:
        return dt.strftime('%Y/%m/%d - %H:%M')

@admin.register(ProductBrand)
class ProductBrandAdmin(admin.ModelAdmin):
    list_display = ['id', 'logo_preview', 'name', 'name_en', 'country', 'created_at_jalali']
    readonly_fields = ['logo_preview']
    fields = ['name', 'name_en', 'slug', 'logo', 'logo_preview', 'country', 'description']
    list_filter = ['country']
    search_fields = ['name', 'name_en', 'slug']
    prepopulated_fields = {'slug': ('name',)}

    @admin.display(description=_('تاریخ ثبت (شمسی)'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)

    @admin.display(description=_("پیش‌نمایش تصویر لوگو"))
    def logo_preview(self, obj):
        if obj.logo:
            url = obj.logo.url if hasattr(obj.logo, 'url') else str(obj.logo)
            return format_html('<img src="{}" style="max-width: 100px; max-height: 60px; border-radius: 8px; object-fit: contain; border: 1px solid #cbd5e1; padding: 3px; background: #ffffff;" />', url)
        return format_html('<span style="color: #94a3b8; font-size: 12px; font-weight: 500;">بدون تصویر لوگو</span>')
