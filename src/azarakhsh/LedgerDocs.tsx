import React from 'react';
import { BookOpen } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const LedgerDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'finance_customerledger',
      verboseName: 'دفتر حساب اعتباری مشتریان (حساب دفتری)',
      description: 'مدیریت سقف اعتبار نسیه، مانده بدهی/بستانکاری جاری، وضعیت مسدودی به دلیل تاخیر و تاریخ آخرین تسویه',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'customer_id', type: 'OneToOneField(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'مشتری صاحب حساب' },
        { name: 'credit_limit', type: 'BigIntegerField(default=0)', verbose: 'سقف اعتبار مجاز نسیه (تومان)' },
        { name: 'current_balance', type: 'BigIntegerField(default=0)', verbose: 'مانده حساب فعلی (مثبت: بدهکار، منفی: بستانکار)' },
        { name: 'max_overdue_days', type: 'PositiveIntegerField(default=30)', verbose: 'حداکثر مهلت تسویه نسیه (روز)' },
        { name: 'is_blocked', type: 'BooleanField(default=False)', verbose: 'مسدود شده بابت عدم تسویه' },
        { name: 'last_settled_at', type: 'DateTimeField(null=True)', verbose: 'تاریخ آخرین تسویه کامل' },
      ]
    },
    {
      name: 'finance_ledgertransaction',
      verboseName: 'ریز گردش تراکنش‌های بدهکار/بستانکار دفتر',
      description: 'ثبت اسناد مالی ناشی از فاکتورهای نسیه، دریافت نقدی، چک، فیش واریز ساتنا و تخفیف‌های تسویه نقدی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'ledger_id', type: 'ForeignKey(CustomerLedger)', isFk: true, fkTarget: 'finance_customerledger', verbose: 'دفتر حساب مشتری' },
        { name: 'transaction_type', type: 'CharField(choices: credit_sale, cash_payment, bank_transfer, cheque, settlement_discount)', verbose: 'نوع تراکنش مالی' },
        { name: 'document_ref', type: 'CharField(max_length=60)', verbose: 'شماره سند مرجع (فاکتور/کد پیگیری بانک)' },
        { name: 'debit_amount', type: 'BigIntegerField(default=0)', verbose: 'بدهکار (افزایش بدهی مشتری)' },
        { name: 'credit_amount', type: 'BigIntegerField(default=0)', verbose: 'بستانکار (پرداخت/تسویه مشتری)' },
        { name: 'balance_after', type: 'BigIntegerField', verbose: 'مانده بدهی بعد از تراکنش' },
        { name: 'recorded_by_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'حسابدار ثبت‌کننده' },
        { name: 'description', type: 'CharField(max_length=255)', verbose: 'شرح سند مالی' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ و زمان سند' },
      ]
    },
    {
      name: 'finance_chequerecord',
      verboseName: 'مدیریت چک‌های صیادی مشتریان',
      description: 'ثبت چک‌های دریافتی صیادی بنفش با شناسه ۱۶ رقمی، تاریخ سررسید و وضعیت وصول/برگشت در انبار',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'ledger_id', type: 'ForeignKey(CustomerLedger)', isFk: true, fkTarget: 'finance_customerledger', verbose: 'حساب مشتری' },
        { name: 'sayad_number', type: 'CharField(max_length=16)', isUnique: true, verbose: 'شناسه ۱۶ رقمی صیاد' },
        { name: 'bank_name', type: 'CharField(max_length=80)', verbose: 'بانک صادرکننده' },
        { name: 'amount', type: 'BigIntegerField', verbose: 'مبلغ چک (تومان)' },
        { name: 'due_date', type: 'DateField', verbose: 'تاریخ سررسید چک' },
        { name: 'status', type: 'CharField(choices: pending, passed, bounced, returned)', verbose: 'وضعیت وصول' },
        { name: 'cheque_image', type: 'ImageField(null=True)', verbose: 'تصویر چک' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/finance/ledger/{user_id}/statement/',
      auth: 'IsAuthenticated (Accountant / Customer)',
      description: 'دریافت صورت‌حساب ریز تراکنش‌های دفتری، جمع بدهکاری، بستانکاری و مانده نهایی مشتری',
      responseBody: JSON.stringify({
        customer_name: "سوپرمارکت بهارستان (حاج احمد)",
        credit_limit: 150000000,
        current_debt: 68400000,
        is_blocked: false,
        transactions: [
          {
            id: 402,
            date: "۱۴۰۳/۰۶/۰۲",
            type: "credit_sale",
            doc_ref: "INV-1403-1011",
            debit: 95000000,
            credit: 0,
            balance: 95000000,
            desc: "خرید نسیه ۲ کارتن وینستون و ۵ کارتن بهمن"
          },
          {
            id: 405,
            date: "۱۴۰۳/۰۶/۰۳",
            type: "bank_transfer",
            doc_ref: "PAYA-884102",
            debit: 0,
            credit: 26600000,
            balance: 68400000,
            desc: "واریز پایا به حساب تجارت انبار مرکزی"
          }
        ]
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/finance/ledger/settle-payment/',
      auth: 'IsAuthenticated (Accountant / Cashier)',
      description: 'ثبت سند پرداخت بدهی (نقدی / واریز حواله) و کسر آنی از مانده بدهی دفتر مشتری',
      requestBody: JSON.stringify({
        customer_id: 45,
        payment_type: "bank_transfer",
        amount: 30000000,
        reference_code: "SATNA-902341",
        description: "تسویه بخشی از فاکتور خرید ۱۰۱۱"
      }, null, 2),
      responseBody: JSON.stringify({
        success: true,
        transaction_id: 409,
        settled_amount: 30000000,
        remaining_debt: 38400000
      }, null, 2)
    }
  ];

  const modelsCode = `"""
finance/models.py
مدل‌های حساب‌های دفتری (نسیه)، ریز گردش تراکنش‌های مالی، سقف اعتبار و چک‌های صیادی
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class CustomerLedger(models.Model):
    customer = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ledger_account', verbose_name=_("مشتری"))
    credit_limit = models.BigIntegerField(_("سقف اعتبار نسیه (تومان)"), default=0)
    current_balance = models.BigIntegerField(_("مانده بدهی جاری (تومان)"), default=0, help_text="مبالغ مثبت نشان‌دهنده بدهی مشتری است.")
    max_overdue_days = models.PositiveIntegerField(_("مهلت تسویه نسیه (روز)"), default=30)
    is_blocked = models.BooleanField(_("حساب نسیه مسدود شده"), default=False)
    last_settled_at = models.DateTimeField(_("تاریخ آخرین تسویه کامل"), null=True, blank=True)
    created_at = models.DateTimeField(_("تاریخ افتتاح حساب دفتری"), auto_now_add=True)

    class Meta:
        verbose_name = _("حساب دفتری مشتری")
        verbose_name_plural = _("۱. حساب‌های دفتری و اعتباری (نسیه)")

    def __str__(self):
        return f"دفتر {self.customer.full_name} | مانده بدهی: {self.current_balance:,} تومان"


class LedgerTransaction(models.Model):
    class TransactionType(models.TextChoices):
        CREDIT_SALE = 'credit_sale', _('فاکتور فروش نسیه')
        CASH_PAYMENT = 'cash_payment', _('دریافت وجه نقد')
        BANK_TRANSFER = 'bank_transfer', _('حواله بانکی پایا / ساتنا')
        CHEQUE = 'cheque', _('دریافت چک صیادی')
        SETTLEMENT_DISCOUNT = 'discount', _('تخفیف تسویه نقدی')

    ledger = models.ForeignKey(CustomerLedger, on_delete=models.CASCADE, related_name='transactions', verbose_name=_("دفتر حساب"))
    transaction_type = models.CharField(_("نوع تراکنش"), max_length=30, choices=TransactionType.choices)
    document_ref = models.CharField(_("شماره سند / فاکتور"), max_length=60, db_index=True)
    debit_amount = models.BigIntegerField(_("بدهکار (افزایش بدهی - تومان)"), default=0)
    credit_amount = models.BigIntegerField(_("بستانکار (پرداخت مشتری - تومان)"), default=0)
    balance_after = models.BigIntegerField(_("مانده بعد از سند (تومان)"))
    recorded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='recorded_finance_docs', verbose_name=_("حسابدار ثبت‌کننده"))
    description = models.CharField(_("شرح سند"), max_length=255)
    created_at = models.DateTimeField(_("زمان ثبت سند"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("تراکنش حساب دفتری")
        verbose_name_plural = _("۲. ریز گردش تراکنش‌های مالی و اسناد")
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f"{self.get_transaction_type_display()} | سند: {self.document_ref} | مانده: {self.balance_after:,}"


class ChequeRecord(models.Model):
    class ChequeStatus(models.TextChoices):
        PENDING = 'pending', _('در جریان وصول (نزد صندوق)')
        PASSED = 'passed', _('وصول شده و نشسته به حساب')
        BOUNCED = 'bounced', _('برگشت خورده (عدم موجودی)')
        RETURNED = 'returned', _('عودت به مشتری')

    ledger = models.ForeignKey(CustomerLedger, on_delete=models.CASCADE, related_name='cheques', verbose_name=_("دفتر مشتری"))
    sayad_number = models.CharField(_("شناسه ۱۶ رقمی صیاد"), max_length=16, unique=True)
    bank_name = models.CharField(_("بانک صادرکننده"), max_length=80)
    amount = models.BigIntegerField(_("مبلغ چک (تومان)"))
    due_date = models.DateField(_("تاریخ سررسید"))
    status = models.CharField(_("وضعیت وصول"), max_length=20, choices=ChequeStatus.choices, default=ChequeStatus.PENDING)
    notes = models.CharField(_("توضیحات و پشت‌نویسی"), max_length=255, blank=True)
    created_at = models.DateTimeField(_("تاریخ دریافت"), auto_now_add=True)

    class Meta:
        verbose_name = _("چک صیادی مشتری")
        verbose_name_plural = _("۳. چک‌های صیادی و اسناد تجاری")
        ordering = ['due_date']

    def __str__(self):
        return f"چک صیادی {self.sayad_number} | {self.amount:,} تومان ({self.get_status_display()})"
`;

  const adminCode = `"""
finance/admin.py
پنل ادمین حساب‌های دفتری و چک‌ها
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import CustomerLedger, LedgerTransaction, ChequeRecord


class LedgerTransactionInline(admin.TabularInline):
    model = LedgerTransaction
    extra = 0
    readonly_fields = ('created_at', 'transaction_type', 'document_ref', 'debit_amount', 'credit_amount', 'balance_after', 'recorded_by', 'description')


@admin.register(CustomerLedger)
class CustomerLedgerAdmin(admin.ModelAdmin):
    list_display = ('customer', 'credit_limit_display', 'current_balance_display', 'is_blocked', 'last_settled_at')
    list_filter = ('is_blocked',)
    search_fields = ('customer__full_name', 'customer__phone')
    inlines = [LedgerTransactionInline]

    def credit_limit_display(self, obj):
        return f"{obj.credit_limit:,} تومان"
    credit_limit_display.short_description = "سقف اعتبار"

    def current_balance_display(self, obj):
        color = 'red' if obj.current_balance > 0 else 'green'
        return format_html(f'<b style="color: {color};">{obj.current_balance:,} تومان</b>')
    current_balance_display.short_description = "مانده بدهی جاری"


@admin.register(LedgerTransaction)
class LedgerTransactionAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'ledger', 'transaction_type', 'document_ref', 'debit_amount', 'credit_amount', 'balance_after')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('document_ref', 'ledger__customer__full_name', 'description')
    readonly_fields = ('created_at',)


@admin.register(ChequeRecord)
class ChequeRecordAdmin(admin.ModelAdmin):
    list_display = ('sayad_number', 'ledger', 'bank_name', 'amount_display', 'due_date', 'status_badge')
    list_filter = ('status', 'bank_name', 'due_date')
    search_fields = ('sayad_number', 'ledger__customer__full_name')

    def amount_display(self, obj):
        return f"{obj.amount:,} تومان"
    amount_display.short_description = "مبلغ چک"

    def status_badge(self, obj):
        colors = {'pending': '#f59e0b', 'passed': '#10b981', 'bounced': '#ef4444', 'returned': '#64748b'}
        return format_html(
            f'<span style="background-color: {colors.get(obj.status, "#64748b")}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">'
            f'{obj.get_status_display()}</span>'
        )
    status_badge.short_description = "وضعیت"
`;

  const serializersCode = `"""
finance/serializers.py
"""
from rest_framework import serializers
from .models import CustomerLedger, LedgerTransaction, ChequeRecord


class CustomerLedgerSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)

    class Meta:
        model = CustomerLedger
        fields = '__all__'


class LedgerTransactionSerializer(serializers.ModelSerializer):
    transaction_label = serializers.CharField(source='get_transaction_type_display', read_only=True)
    recorder_name = serializers.CharField(source='recorded_by.full_name', read_only=True)

    class Meta:
        model = LedgerTransaction
        fields = '__all__'


class ChequeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChequeRecord
        fields = '__all__'
`;

  const viewsCode = `"""
finance/views.py
ویوهای حساب‌های دفتری، تسویه بدهی و استیتمنت مالی
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import CustomerLedger, LedgerTransaction, ChequeRecord
from .serializers import CustomerLedgerSerializer, LedgerTransactionSerializer, ChequeRecordSerializer


class CustomerLedgerViewSet(viewsets.ModelViewSet):
    queryset = CustomerLedger.objects.all()
    serializer_class = CustomerLedgerSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='statement')
    def statement(self, request, pk=None):
        ledger = self.get_object()
        txs = ledger.transactions.all()[:50]
        return Response({
            'customer_name': ledger.customer.full_name,
            'credit_limit': ledger.credit_limit,
            'current_debt': ledger.current_balance,
            'is_blocked': ledger.is_blocked,
            'transactions': LedgerTransactionSerializer(txs, many=True).data
        })

    @action(detail=False, methods=['post'], url_path='settle-payment')
    @transaction.atomic
    def settle_payment(self, request):
        user_id = request.data.get('customer_id')
        payment_type = request.data.get('payment_type', LedgerTransaction.TransactionType.BANK_TRANSFER)
        amount = int(request.data.get('amount', 0))
        doc_ref = request.data.get('reference_code', 'SETTLE')
        desc = request.data.get('description', 'تسویه حساب دفتری')

        ledger = CustomerLedger.objects.select_for_update().get(customer_id=user_id)
        new_balance = max(0, ledger.current_balance - amount)
        ledger.current_balance = new_balance
        ledger.save()

        tx = LedgerTransaction.objects.create(
            ledger=ledger,
            transaction_type=payment_type,
            document_ref=doc_ref,
            debit_amount=0,
            credit_amount=amount,
            balance_after=new_balance,
            recorded_by=request.user,
            description=desc
        )

        return Response({
            'success': True,
            'transaction_id': tx.id,
            'settled_amount': amount,
            'remaining_debt': new_balance
        }, status=status.HTTP_201_CREATED)


class ChequeViewSet(viewsets.ModelViewSet):
    queryset = ChequeRecord.objects.all()
    serializer_class = ChequeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
`;

  const urlsCode = `"""
finance/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerLedgerViewSet, ChequeViewSet

router = DefaultRouter()
router.register('ledgers', CustomerLedgerViewSet, basename='customer-ledger')
router.register('cheques', ChequeViewSet, basename='cheque')

urlpatterns = [
    path('', include(router.urls)),
]
`;

  return (
    <AppDocTemplate
      appFolder="finance"
      title="حساب‌های دفتری و نسیه (Credit Ledgers & Finance)"
      titleEn="finance / Credit Ledger & Debt Management App"
      badge="Credit Ledger • Cheques • Debt Settlement"
      description="ماژول کنترل سقف اعتبار مشتریان عمده، حساب‌های دفتری نسیه، ریز گردش بدهکاری و بستانکاری، تسویه نقدی/پایا و مدیریت چک‌های صیادی ۱۶ رقمی."
      icon={<BookOpen className="w-6 h-6 text-blue-500" />}
      modelsCode={modelsCode}
      adminCode={adminCode}
      serializersCode={serializersCode}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};

