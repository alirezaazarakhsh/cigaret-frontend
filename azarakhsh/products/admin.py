from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import (
    Category,
    ProductBrand,
    ProductHologram,
    Product,
    ProductTierDiscount,
    ProductAttribute,
    ProductAttributeValue,
    ProductKeyFeature,
    ProductImage,
)

# ==============================================================================
# ۱. مدیریت دسته‌بندی‌ها (Category Admin)
# ==============================================================================
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'slug', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'parent']
    search_fields = ['name', 'slug']  # 👈 ضروری برای autocomplete_fields
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']


# ==============================================================================
# ۲. مدیریت برندهای کالا (Product Brand Admin)
# ==============================================================================
@admin.register(ProductBrand)
class ProductBrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_en', 'country', 'is_active']
    list_filter = ['is_active', 'country']
    search_fields = ['name', 'name_en', 'slug']  # 👈 ضروری برای autocomplete_fields
    prepopulated_fields = {'slug': ('name',)}


# ==============================================================================
# ۳. مدیریت هولوگرام و اصالت کالا (Product Hologram Admin)
# ==============================================================================
@admin.register(ProductHologram)
class ProductHologramAdmin(admin.ModelAdmin):
    list_display = ['title', 'hologram_code', 'issuer_org', 'security_level', 'badge_preview', 'is_verified', 'updated_at']
    list_filter = ['is_verified', 'security_level']
    search_fields = ['title', 'hologram_code', 'issuer_org']  # 👈 ضروری برای autocomplete_fields

    def badge_preview(self, obj):
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">{}</span>',
            obj.badge_color or '#10b981',
            obj.title
        )
    badge_preview.short_description = _('پیش‌نمایش بج')


# ==============================================================================
# ۴. اینلاین‌های محصول (Product Inlines)
# ==============================================================================
class ProductTierDiscountInline(admin.TabularInline):
    model = ProductTierDiscount
    extra = 1

class ProductAttributeValueInline(admin.TabularInline):
    model = ProductAttributeValue
    extra = 1

class ProductKeyFeatureInline(admin.TabularInline):
    model = ProductKeyFeature
    extra = 1

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


# ==============================================================================
# ۵. مدیریت اصلی محصولات (Product Admin)
# ==============================================================================
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'barcode',
        'category',
        'brand',
        'carton_price_toman',
        'stock_cartons',
        'badge_display',
        'is_active',
    ]
    list_filter = [
        'is_active',
        'badge',
        'category',
        'brand',
        'has_carton',
        'has_box',
        'is_pos_only',
    ]
    search_fields = ['name', 'name_en', 'barcode', 'slug', 'focus_keyword']
    prepopulated_fields = {'slug': ('name',)}
    
    # ⭐️ رفع خطای InvalidCursorName و افزایش فوق‌العاده سرعت پنل ادمین
    autocomplete_fields = ['category', 'brand', 'hologram']

    inlines = [
        ProductTierDiscountInline,
        ProductAttributeValueInline,
        ProductKeyFeatureInline,
        ProductImageInline,
    ]

    fieldsets = (
        (_('شناسنامه و اطلاعات پایه کالا'), {
            'fields': (
                'name',
                'name_en',
                'slug',
                'barcode',
                'category',
                'brand',
                'hologram',
                'country_origin',
                'badge',
            )
        }),
        (_('قیمت‌گذاری و انبارداری بنکداری (جنت‌آباد)'), {
            'fields': (
                ('carton_price', 'box_price', 'pack_price'),
                ('stock_cartons', 'boxes_per_carton', 'packs_per_box'),
                ('min_order_carton', 'min_order_box'),
                ('has_carton', 'has_box', 'is_pos_only'),
            )
        }),
        (_('مشخصات فنی و دخانیات (قطران و نیکوتین)'), {
            'fields': (
                ('tar', 'nicotine', 'carbon_monoxide'),
                ('cigarette_size', 'filter_type'),
            ),
            'classes': ('collapse',),
        }),
        (_('توضیحات و رسانه'), {
            'fields': ('excerpt', 'full_description', 'main_image'),
        }),
        (_('تنظیمات سئو پیشرفته (Yoast SEO)'), {
            'fields': ('focus_keyword', 'meta_title', 'meta_description', 'canonical_url'),
            'classes': ('collapse',),
        }),
        (_('وضعیت فعالیت'), {
            'fields': ('is_active',),
        }),
    )

    def carton_price_toman(self, obj):
        return f"{obj.carton_price:,} تومان"
    carton_price_toman.short_description = _('قیمت کارتن')

    def badge_display(self, obj):
        colors = {
            'none': '#64748b',
            'bestseller': '#ef4444',
            'special': '#f59e0b',
            'new': '#10b981',
            'discount': '#8b5cf6',
            'import': '#06b6d4',
        }
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 11px;">{}</span>',
            colors.get(obj.badge, '#64748b'),
            obj.get_badge_display()
        )
    badge_display.short_description = _('نشان محصول')


# ==============================================================================
# ۶. مدیریت تعاریف ویژگی‌ها (Product Attribute Admin)
# ==============================================================================
@admin.register(ProductAttribute)
class ProductAttributeAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
