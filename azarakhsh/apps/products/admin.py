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

def to_jalali_str(dt):
    """تبدیل تاریخ میلادی به تاریخ شمسی با پشتیبانی از jalali_date، jdatetime و الگوریتم داخلی"""
    if not dt:
        return "-"
    try:
        from jalali_date import datetime2jalali
        jalali_dt = datetime2jalali(dt)
        return jalali_dt.strftime('%Y/%m/%d - %H:%M')
    except Exception:
        pass

    try:
        import jdatetime
        j_dt = jdatetime.datetime.fromtimestamp(dt.timestamp())
        return j_dt.strftime('%Y/%m/%d - %H:%M')
    except Exception:
        pass

    # الگوریتم تبدیل میلادی به شمسی بدون نیاز به پکیج خارجی
    g_y, g_m, g_d = dt.year, dt.month, dt.day
    g_days_in_month = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (g_y % 4 == 0 and g_y % 100 != 0) or (g_y % 400 == 0):
        g_days_in_month[2] = 29
    
    gy = g_y - 1600
    gm = g_m - 1
    gd = g_d - 1

    g_day_no = 365 * gy + gy // 4 - gy // 100 + gy // 400
    for i in range(gm):
        g_day_no += g_days_in_month[i + 1]
    g_day_no += gd

    j_day_no = g_day_no - 79
    j_np = j_day_no // 12053
    j_day_no %= 12053

    jy = 979 + 33 * j_np + 4 * (j_day_no // 1461)
    j_day_no %= 1461

    if j_day_no >= 366:
        jy += (j_day_no - 1) // 365
        j_day_no = (j_day_no - 1) % 365

    j_months = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
    jm = 0
    for i in range(1, 13):
        if j_day_no < j_months[i]:
            jm = i
            break
        j_day_no -= j_months[i]
    jd = j_day_no + 1

    time_str = dt.strftime('%H:%M')
    return f"{jy:04d}/{jm:02d}/{jd:02d} - {time_str}"


# ==============================================================================
# ۱. مدیریت دسته‌بندی‌ها (Category Admin)
# ==============================================================================
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_en', 'slug', 'color_badge', 'created_at_jalali']
    search_fields = ['name', 'name_en', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['-id']

    @admin.display(description=_('تاریخ ثبت (شمسی)'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)

    @admin.display(description=_('رنگ شناسه'))
    def color_badge(self, obj):
        color = obj.color or '#3B82F6'
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">{}</span>',
            color,
            color
        )


# ==============================================================================
# ۲. مدیریت برندهای کالا (Product Brand Admin)
# ==============================================================================
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


# نام مستعار جهت پشتیبانی از پروژه‌هایی که از BrandAdmin استفاده می‌کنند
BrandAdmin = ProductBrandAdmin


# ==============================================================================
# ۳. مدیریت هولوگرام و اصالت کالا (Product Hologram Admin)
# ==============================================================================
@admin.register(ProductHologram)
class ProductHologramAdmin(admin.ModelAdmin):
    list_display = ['title', 'issuer_org', 'country_origin', 'security_level', 'is_verified', 'updated_at_jalali']
    list_filter = ['is_verified', 'security_level']
    search_fields = ['title', 'issuer_org', 'country_origin', 'security_specs']

    @admin.display(description=_('تاریخ بروزرسانی (شمسی)'), ordering='updated_at')
    def updated_at_jalali(self, obj):
        return to_jalali_str(obj.updated_at)


# ==============================================================================
# ۴. اینلاین‌های محصول (Product Inlines)
# ==============================================================================
class ProductTierDiscountInline(admin.TabularInline):
    model = ProductTierDiscount
    extra = 1

class ProductAttributeValueInline(admin.TabularInline):
    model = ProductAttributeValue
    extra = 2
    autocomplete_fields = ['attribute']
    fields = ['attribute', 'value', 'value_number', 'value_boolean']
    verbose_name = _("ویژگی فنی / مشخصه کالا")
    verbose_name_plural = _("ویژگی‌های فنی و مشخصات تخصصی کالا (اینلاین داینامیک)")

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
        'created_at_jalali',
    ]
    list_filter = [
        'is_active',
        'badge',
        'category',
        'brand',
        'has_carton',
        'has_box',
        'has_pack',
        'is_box_only',
        'is_pos_only',
    ]
    search_fields = ['name', 'name_en', 'barcode', 'slug', 'focus_keyword']
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ['category', 'brand', 'hologram']

    inlines = [
        ProductAttributeValueInline,
        ProductTierDiscountInline,
        ProductKeyFeatureInline,
        ProductImageInline,
    ]

    fieldsets = (
        (_('اطلاعات اصلی و شناسه تجاری کالا'), {
            'fields': (
                'name',
                'name_en',
                'slug',
                'brand',
                'country_origin',
                'barcode',
                'excerpt',
            )
        }),
        (_('دسته‌بندی، هولوگرام و برچسب تجاری'), {
            'fields': (
                'category',
                'hologram',
                'badge',
            )
        }),
        (_('قیمت‌گذاری عمده، سطوح فروش و موجودی انبار'), {
            'fields': (
                ('carton_price', 'box_price', 'pack_price', 'purchase_price'),
                ('stock_cartons', 'stock_boxes'),
                ('boxes_per_carton', 'packs_per_box'),
                ('min_order_carton', 'min_order_box'),
                ('has_carton', 'has_box', 'has_pack', 'is_box_only', 'is_pos_only'),
            )
        }),
        (_('مشخصات فنی کلاسیک (اختیاری - کلیه ویژگی‌ها به صورت اینلاین در پایین صفحه در دسترس است)'), {
            'classes': ('collapse',),
            'fields': (
                ('tar', 'nicotine', 'carbon_monoxide'),
                ('cigarette_size', 'filter_type'),
            ),
        }),
        (_('نقد و بررسی و توضیحات جامع محصول (TinyMCE)'), {
            'fields': ('full_description',),
        }),
        (_('تصویر شاخص محصول'), {
            'fields': ('main_image', 'image'),
        }),
        (_('تنظیمات سئو و کلمه کلیدی کانونی (Yoast SEO)'), {
            'fields': (
                'focus_keyword',
                'meta_title',
                'meta_description',
                'canonical_url',
            ),
        }),
        (_('وضعیت فعالیت و نمایش در سامانه'), {
            'fields': (('is_active', 'is_featured'),),
        }),
    )

    @admin.display(description=_('تاریخ ثبت (شمسی)'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)

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
    list_display = ['id', 'name', 'name_en', 'data_type', 'unit', 'help_text_short', 'created_at_jalali']
    list_filter = ['data_type']
    search_fields = ['name', 'name_en', 'help_text']
    ordering = ['-id']

    @admin.display(description=_('تاریخ ثبت (شمسی)'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)

    @admin.display(description=_('توضیح راهنما'))
    def help_text_short(self, obj):
        if not obj.help_text:
            return '-'
        return obj.help_text[:50] + ('...' if len(obj.help_text) > 50 else '')


# ==============================================================================
# ۷. مقادیر ویژگی‌های کالاها (Product Attribute Value Admin)
# ==============================================================================
@admin.register(ProductAttributeValue)
class ProductAttributeValueAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'attribute', 'display_val']
    list_filter = ['attribute__data_type', 'attribute']
    search_fields = ['product__name', 'product__name_en', 'attribute__name', 'value']
    autocomplete_fields = ['product', 'attribute']

    @admin.display(description=_('مقدار ویژگی'))
    def display_val(self, obj):
        if obj.value:
            return obj.value
        if obj.value_number is not None:
            return f"{obj.value_number} {obj.attribute.unit or ''}".strip()
        if obj.value_boolean is not None:
            return _("بله") if obj.value_boolean else _("خیر")
        return "-"
