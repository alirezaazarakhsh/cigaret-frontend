from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import (
    CustomerTier, 
    CustomerProfile, 
    BankDepositSlip, 
    WalletTransaction,
)
from .products.models import (
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
    """تبدیل تاریخ و زمان به تاریخ شمسی با پشتیبانی از jalali_date، jdatetime و محاسبات داخلی"""
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

@admin.register(CustomerTier)
class CustomerTierAdmin(admin.ModelAdmin):
    list_display = ['tier_key', 'title_fa', 'colored_badge', 'default_credit_limit_toman', 'cashback_percent', 'discount_percent', 'is_active']
    list_filter = ['is_active', 'tier_key']
    search_fields = ['title_fa', 'badge_label']

    def colored_badge(self, obj):
        return format_html(
            '<span style="background-color: {}; color: {}; padding: 4px 10px; border-radius: 8px; font-weight: bold; font-size: 11px;">{}</span>',
            obj.card_border_color or '#4f46e5',
            obj.card_text_color or '#ffffff',
            obj.badge_label
        )
    colored_badge.short_description = _('پیش‌نمایش نشان کارت')

    def default_credit_limit_toman(self, obj):
        return f"{obj.default_credit_limit:,} تومان"
    default_credit_limit_toman.short_description = _('سقف اعتبار پیش‌فرض')


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone_number', 'city', 'tier_badge', 'credit_limit_display', 'wallet_balance_display', 'ledger_status', 'is_active']
    list_filter = ['tier', 'is_active', 'city']
    search_fields = ['full_name', 'phone_number', 'national_code']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (_('اطلاعات هویتی و تماس'), {
            'fields': ('full_name', 'phone_number', 'national_code', 'city', 'address', 'user', 'is_active')
        }),
        (_('سطح کارت و کنترل مستقیم سقف اعتبار از دیتابیس'), {
            'fields': ('tier', 'credit_limit', 'wallet_balance', 'ledger_balance'),
            'description': 'کنترل مستقیم کارت مشتری، رنگ کارت، و سقف خرید دفتری توسط مدیر سیستم'
        }),
        (_('اتصال به اپ حضوری'), {
            'fields': ('app_client_id', 'barcode_id', 'notes')
        }),
        (_('تاریخچه‌ها'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def tier_badge(self, obj):
        if not obj.tier:
            return '-'
        return format_html(
            '<span style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: #fbbf24; border: 1px solid #fbbf24; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            obj.tier.title_fa
        )
    tier_badge.short_description = _('کارت اختصاصی')

    def credit_limit_display(self, obj):
        return f"{obj.credit_limit:,} تومان"
    credit_limit_display.short_description = _('سقف اعتبار خرید')

    def wallet_balance_display(self, obj):
        return f"{obj.wallet_balance:,} تومان"
    wallet_balance_display.short_description = _('موجودی کیف پول')

    def ledger_status(self, obj):
        if obj.ledger_balance > 0:
            return format_html('<span style="color: #e11d48; font-weight: bold;">بدهکار: {:,} تومان</span>', obj.ledger_balance)
        elif obj.ledger_balance < 0:
            return format_html('<span style="color: #059669; font-weight: bold;">بستانکار: {:,} تومان</span>', abs(obj.ledger_balance))
        return format_html('<span style="color: #475569;">تسویه کامل</span>')
    ledger_status.short_description = _('مانده دفتری')


@admin.register(BankDepositSlip)
class BankDepositSlipAdmin(admin.ModelAdmin):
    list_display = ['tracking_number', 'customer', 'amount_display', 'purpose_display', 'bank_name', 'status_badge', 'created_at_jalali']
    list_filter = ['status', 'purpose', 'bank_name', 'created_at']
    search_fields = ['tracking_number', 'customer__full_name', 'customer__phone_number', 'sender_account_name']
    actions = ['approve_selected_slips', 'reject_selected_slips']

    @admin.display(description=_('تاریخ واریز (شمسی)'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)

    def amount_display(self, obj):
        return f"{obj.amount:,} تومان"
    amount_display.short_description = _('مبلغ واریزی')

    def purpose_display(self, obj):
        return obj.get_purpose_display()
    purpose_display.short_description = _('هدف واریز')

    def status_badge(self, obj):
        colors = {
            'pending': '#d97706',
            'approved': '#059669',
            'rejected': '#dc2626'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">{}</span>',
            colors.get(obj.status, '#64748b'),
            obj.get_status_display()
        )
    status_badge.short_description = _('وضعیت')

    @admin.action(description=_('تایید فیش‌های انتخابی و شارژ خودکار حساب/کیف پول'))
    def approve_selected_slips(self, request, queryset):
        for slip in queryset.filter(status='pending'):
            if slip.purpose == 'wallet_charge':
                slip.customer.wallet_balance += slip.amount
                slip.customer.save(update_fields=['wallet_balance'])
                WalletTransaction.objects.create(
                    customer=slip.customer,
                    amount=slip.amount,
                    balance_after=slip.customer.wallet_balance,
                    transaction_type='charge_slip',
                    reference_slip=slip,
                    description=f"تایید گروهی ادمین برای فیش {slip.tracking_number}"
                )
            elif slip.purpose == 'ledger_settle':
                slip.customer.ledger_balance -= slip.amount
                slip.customer.save(update_fields=['ledger_balance'])
            slip.status = 'approved'
            slip.reviewed_by = request.user
            slip.save()
        self.message_user(request, _('فیش‌های انتخابی تایید و مبالغ اعمال گردید.'))


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ['customer', 'amount_display', 'balance_after_display', 'transaction_type', 'created_at_jalali']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['customer__full_name', 'customer__phone_number', 'description']

    @admin.display(description=_('تاریخ تراکنش (شمسی)'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)

    def amount_display(self, obj):
        return f"{obj.amount:,} تومان"
    amount_display.short_description = _('مبلغ')

    def balance_after_display(self, obj):
        return f"{obj.balance_after:,} تومان"
    balance_after_display.short_description = _('مانده پس از تراکنش')


# ==============================================================================
# 5. مدیریت دسته‌بندی‌ها (Category Admin)
# ==============================================================================
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'slug', 'order', 'is_active', 'created_at_jalali']
    list_filter = ['is_active', 'parent']
    search_fields = ['name', 'slug']  # 👈 ضروری برای کارکرد autocomplete_fields در محصول
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']

    @admin.display(description=_('تاریخ ایجاد'), ordering='created_at')
    def created_at_jalali(self, obj):
        return to_jalali_str(obj.created_at)


# ==============================================================================
# 6. مدیریت برندهای کالا (Product Brand Admin)
# ==============================================================================
@admin.register(ProductBrand)
class ProductBrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_en', 'country', 'is_active']
    list_filter = ['is_active', 'country']
    search_fields = ['name', 'name_en', 'slug']  # 👈 ضروری برای کارکرد autocomplete_fields در محصول
    prepopulated_fields = {'slug': ('name',)}


# ==============================================================================
# 7. مدیریت هولوگرام و اصالت کالا (Product Hologram Admin)
# ==============================================================================
@admin.register(ProductHologram)
class ProductHologramAdmin(admin.ModelAdmin):
    list_display = ['title', 'hologram_code', 'issuer_org', 'security_level', 'badge_preview', 'is_verified', 'updated_at']
    list_filter = ['is_verified', 'security_level']
    search_fields = ['title', 'hologram_code', 'issuer_org']  # 👈 ضروری برای کارکرد autocomplete_fields در محصول

    def badge_preview(self, obj):
        return format_html(
            '<span style="background-color: {}; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">{}</span>',
            obj.badge_color or '#10b981',
            obj.title
        )
    badge_preview.short_description = _('پیش‌نمایش بج')


# ==============================================================================
# 8. اینلاین‌های محصول (Product Inlines)
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
# 9. مدیریت اصلی محصولات (Product Admin)
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
    
    # ⭐️ کلید حل خطای InvalidCursorName و افزایش فوق‌العاده سرعت پنل ادمین
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
# 10. مدیریت تعاریف ویژگی‌ها (Product Attribute Admin)
# ==============================================================================
@admin.register(ProductAttribute)
class ProductAttributeAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

