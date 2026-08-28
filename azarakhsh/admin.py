from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import CustomerTier, CustomerProfile, BankDepositSlip, WalletTransaction

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
    list_display = ['tracking_number', 'customer', 'amount_display', 'purpose_display', 'bank_name', 'status_badge', 'created_at']
    list_filter = ['status', 'purpose', 'bank_name', 'created_at']
    search_fields = ['tracking_number', 'customer__full_name', 'customer__phone_number', 'sender_account_name']
    actions = ['approve_selected_slips', 'reject_selected_slips']

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
    list_display = ['customer', 'amount_display', 'balance_after_display', 'transaction_type', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['customer__full_name', 'customer__phone_number', 'description']

    def amount_display(self, obj):
        return f"{obj.amount:,} تومان"
    amount_display.short_description = _('مبلغ')

    def balance_after_display(self, obj):
        return f"{obj.balance_after:,} تومان"
    balance_after_display.short_description = _('مانده پس از تراکنش')
