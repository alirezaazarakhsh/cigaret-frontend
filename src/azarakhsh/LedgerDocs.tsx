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
پنل ادمین حساب‌های دفتری و چک‌ها با تاریخ شمسی
"""
from django.contrib import admin
from django.utils.html import format_html
from jalali_date.admin import ModelAdminJalaliMixin
from jalali_date import datetime2jalali, date2jalali
from .models import CustomerLedger, LedgerTransaction, ChequeRecord


class LedgerTransactionInline(admin.TabularInline):
    model = LedgerTransaction
    extra = 0
    readonly_fields = ('created_at', 'transaction_type', 'document_ref', 'debit_amount', 'credit_amount', 'balance_after', 'recorded_by', 'description')


@admin.register(CustomerLedger)
class CustomerLedgerAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    list_display = ('customer', 'credit_limit_display', 'current_balance_display', 'is_blocked', 'last_settled_at_jalali')
    list_filter = ('is_blocked',)
    search_fields = ('customer__full_name', 'customer__phone', 'customer__business_name')
    autocomplete_fields = ('customer',)
    inlines = [LedgerTransactionInline]

    def credit_limit_display(self, obj):
        return f"{obj.credit_limit:,} تومان"
    credit_limit_display.short_description = "سقف اعتبار"

    def current_balance_display(self, obj):
        color = 'red' if obj.current_balance > 0 else 'green'
        return format_html(f'<b style="color: {color};">{obj.current_balance:,} تومان</b>')
    current_balance_display.short_description = "مانده بدهی جاری"

    @admin.display(description="تاریخ آخرین تسویه کامل", ordering='last_settled_at')
    def last_settled_at_jalali(self, obj):
        if obj.last_settled_at:
            return datetime2jalali(obj.last_settled_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"


@admin.register(LedgerTransaction)
class LedgerTransactionAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    list_display = ('created_at_jalali', 'ledger', 'transaction_type', 'document_ref', 'debit_amount', 'credit_amount', 'balance_after')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('document_ref', 'ledger__customer__full_name', 'description')
    readonly_fields = ('created_at_jalali_display',)
    autocomplete_fields = ('ledger', 'recorded_by')

    @admin.display(description="تاریخ تراکنش", ordering='created_at')
    def created_at_jalali(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"

    @admin.display(description="زمان ثبت سند")
    def created_at_jalali_display(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"


@admin.register(ChequeRecord)
class ChequeRecordAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    list_display = ('sayad_number', 'ledger', 'bank_name', 'amount_display', 'due_date_jalali', 'status_badge')
    list_filter = ('status', 'bank_name', 'due_date')
    search_fields = ('sayad_number', 'ledger__customer__full_name')
    autocomplete_fields = ('ledger',)

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

    @admin.display(description="تاریخ سررسید", ordering='due_date')
    def due_date_jalali(self, obj):
        if obj.due_date:
            return date2jalali(obj.due_date).strftime('%Y/%m/%d')
        return "-"
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
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت حساب‌های دفتری (نسیه)، تسویه بدهی و چک‌های صیادی
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import CustomerLedger, LedgerTransaction, ChequeRecord
from .serializers import CustomerLedgerSerializer, LedgerTransactionSerializer, ChequeRecordSerializer


class CustomerLedgerListAPIView(APIView):
    """
    اندپوینت دریافت لیست حساب‌های دفتری مشتریان
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت لیست حساب‌های دفتری مشتریان",
        responses={200: CustomerLedgerSerializer(many=True)}
    )
    def get(self, request):
        queryset = CustomerLedger.objects.select_related('customer').all()
        serializer = CustomerLedgerSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class CustomerLedgerCreateAPIView(APIView):
    """
    اندپوینت افتتاح حساب دفتری جدید برای مشتری (ادمین / حسابدار)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="افتتاح حساب دفتری جدید (حسابداری)",
        request_body=CustomerLedgerSerializer,
        responses={201: CustomerLedgerSerializer}
    )
    def post(self, request):
        serializer = CustomerLedgerSerializer(data=request.data)
        if serializer.is_valid():
            ledger = serializer.save()
            return Response({
                'status': 'success',
                'message': 'حساب دفتری مشتری با موفقیت افتتاح شد.',
                'data': CustomerLedgerSerializer(ledger).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerLedgerDetailAPIView(APIView):
    """
    اندپوینت دریافت جزئیات یک حساب دفتری بر اساس ID
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت مشخصات یک حساب دفتری",
        responses={200: CustomerLedgerSerializer}
    )
    def get(self, request, pk):
        ledger = get_object_or_404(CustomerLedger, pk=pk)
        serializer = CustomerLedgerSerializer(ledger)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class CustomerLedgerUpdateAPIView(APIView):
    """
    اندپوینت تغییر سقف اعتبار یا مسدودسازی حساب دفتری مشتری (ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ویرایش مشخصات و سقف اعتبار حساب دفتری (حسابداری)",
        request_body=CustomerLedgerSerializer,
        responses={200: CustomerLedgerSerializer}
    )
    def put(self, request, pk):
        ledger = get_object_or_404(CustomerLedger, pk=pk)
        serializer = CustomerLedgerSerializer(ledger, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات حساب دفتری بروزرسانی شد.',
                'data': CustomerLedgerSerializer(updated).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerLedgerDeleteAPIView(APIView):
    """
    اندپوینت بستن / حذف حساب دفتری (ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="حذف حساب دفتری (حسابداری)",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def delete(self, request, pk):
        ledger = get_object_or_404(CustomerLedger, pk=pk)
        ledger.delete()
        return Response({
            'status': 'success',
            'message': 'حساب دفتری حذف گردید.'
        }, status=status.HTTP_200_OK)


class CustomerLedgerStatementAPIView(APIView):
    """
    اندپوینت دریافت صورت‌حساب ریز تراکنش‌های دفتری و مانده بدهی مشتری
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت صورت‌حساب ریز تراکنش‌های دفتری",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def get(self, request, pk):
        ledger = get_object_or_404(CustomerLedger.objects.select_related('customer'), pk=pk)
        txs = ledger.transactions.all()[:100]
        return Response({
            'status': 'success',
            'customer_name': ledger.customer.get_full_name() or ledger.customer.username,
            'credit_limit': ledger.credit_limit,
            'current_debt': ledger.current_balance,
            'is_blocked': ledger.is_blocked,
            'transactions': LedgerTransactionSerializer(txs, many=True).data
        }, status=status.HTTP_200_OK)


class SettlePaymentAPIView(APIView):
    """
    اندپوینت ثبت سند پرداخت بدهی (نقدی / واریز پایا-ساتنا) و کسر آنی از مانده بدهی مشتری
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="ثبت سند تسویه بدهی و کسر از دفتر حساب",
        responses={201: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    @transaction.atomic
    def post(self, request):
        customer_id = request.data.get('customer_id')
        payment_type = request.data.get('payment_type', LedgerTransaction.TransactionType.BANK_TRANSFER)
        amount = int(request.data.get('amount', 0))
        doc_ref = request.data.get('reference_code', 'SETTLE')
        desc = request.data.get('description', 'تسویه حساب دفتری')

        ledger = get_object_or_404(CustomerLedger.objects.select_for_update(), customer_id=customer_id)
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
            'status': 'success',
            'message': 'سند تسویه حساب دفتری با موفقیت ثبت گردید.',
            'data': {
                'transaction_id': tx.id,
                'settled_amount': amount,
                'remaining_debt': new_balance
            }
        }, status=status.HTTP_201_CREATED)


class LedgerTransactionListAPIView(APIView):
    """
    اندپوینت دریافت کلیه تراکنش‌های مالی حساب‌های دفتری
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت گردش کلیه تراکنش‌های دفتری",
        responses={200: LedgerTransactionSerializer(many=True)}
    )
    def get(self, request):
        queryset = LedgerTransaction.objects.select_related('ledger__customer', 'recorded_by').all()
        serializer = LedgerTransactionSerializer(queryset[:200], many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class LedgerTransactionDetailAPIView(APIView):
    """
    اندپوینت دریافت جزئیات یک تراکنش دفتری
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات یک تراکنش مالی",
        responses={200: LedgerTransactionSerializer}
    )
    def get(self, request, pk):
        tx = get_object_or_404(LedgerTransaction, pk=pk)
        serializer = LedgerTransactionSerializer(tx)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class ChequeListAPIView(APIView):
    """
    اندپوینت دریافت لیست چک‌های صیادی
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت لیست چک‌های صیادی",
        responses={200: ChequeRecordSerializer(many=True)}
    )
    def get(self, request):
        queryset = ChequeRecord.objects.select_related('ledger__customer').all()
        serializer = ChequeRecordSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class ChequeCreateAPIView(APIView):
    """
    اندپوینت ثبت چک صیادی جدید (حسابداری)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ثبت چک صیادی جدید",
        request_body=ChequeRecordSerializer,
        responses={201: ChequeRecordSerializer}
    )
    def post(self, request):
        serializer = ChequeRecordSerializer(data=request.data)
        if serializer.is_valid():
            cheque = serializer.save()
            return Response({
                'status': 'success',
                'message': 'چک صیادی با موفقیت در سیستم ثبت گردید.',
                'data': ChequeRecordSerializer(cheque).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChequeDetailAPIView(APIView):
    """
    اندپوینت دریافت مشخصات یک چک صیادی بر اساس ID
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت مشخصات یک چک صیادی",
        responses={200: ChequeRecordSerializer}
    )
    def get(self, request, pk):
        cheque = get_object_or_404(ChequeRecord, pk=pk)
        serializer = ChequeRecordSerializer(cheque)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class ChequeUpdateAPIView(APIView):
    """
    اندپوینت تغییر وضعیت چک صیادی (وصول شده، برگشتی، عودت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ویرایش وضعیت چک صیادی (وصول/برگشت)",
        request_body=ChequeRecordSerializer,
        responses={200: ChequeRecordSerializer}
    )
    def put(self, request, pk):
        cheque = get_object_or_404(ChequeRecord, pk=pk)
        serializer = ChequeRecordSerializer(cheque, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'وضعیت چک صیادی بروزرسانی شد.',
                'data': ChequeRecordSerializer(updated).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChequeDeleteAPIView(APIView):
    """
    اندپوینت حذف چک صیادی (ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="حذف چک صیادی (حسابداری)",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def delete(self, request, pk):
        cheque = get_object_or_404(ChequeRecord, pk=pk)
        cheque.delete()
        return Response({
            'status': 'success',
            'message': 'چک صیادی حذف گردید.'
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
finance/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    CustomerLedgerListAPIView,
    CustomerLedgerCreateAPIView,
    CustomerLedgerDetailAPIView,
    CustomerLedgerUpdateAPIView,
    CustomerLedgerDeleteAPIView,
    CustomerLedgerStatementAPIView,
    SettlePaymentAPIView,
    LedgerTransactionListAPIView,
    LedgerTransactionDetailAPIView,
    ChequeListAPIView,
    ChequeCreateAPIView,
    ChequeDetailAPIView,
    ChequeUpdateAPIView,
    ChequeDeleteAPIView,
)

app_name = 'finance'

urlpatterns = [
    # ۱. حساب‌های دفتری (نسیه)
    path('ledgers/list/', CustomerLedgerListAPIView.as_view(), name='ledger-list'),
    path('ledgers/create/', CustomerLedgerCreateAPIView.as_view(), name='ledger-create'),
    path('ledgers/<int:pk>/', CustomerLedgerDetailAPIView.as_view(), name='ledger-detail'),
    path('ledgers/<int:pk>/update/', CustomerLedgerUpdateAPIView.as_view(), name='ledger-update'),
    path('ledgers/<int:pk>/delete/', CustomerLedgerDeleteAPIView.as_view(), name='ledger-delete'),
    path('ledgers/<int:pk>/statement/', CustomerLedgerStatementAPIView.as_view(), name='ledger-statement'),

    # ۲. تسویه حساب و ثبت بدهی/بستانکاری
    path('ledgers/settle-payment/', SettlePaymentAPIView.as_view(), name='settle-payment'),

    # ۳. ریز گردش تراکنش‌ها
    path('transactions/list/', LedgerTransactionListAPIView.as_view(), name='transaction-list'),
    path('transactions/<int:pk>/', LedgerTransactionDetailAPIView.as_view(), name='transaction-detail'),

    # ۴. چک‌های صیادی
    path('cheques/list/', ChequeListAPIView.as_view(), name='cheque-list'),
    path('cheques/create/', ChequeCreateAPIView.as_view(), name='cheque-create'),
    path('cheques/<int:pk>/', ChequeDetailAPIView.as_view(), name='cheque-detail'),
    path('cheques/<int:pk>/update/', ChequeUpdateAPIView.as_view(), name='cheque-update'),
    path('cheques/<int:pk>/delete/', ChequeDeleteAPIView.as_view(), name='cheque-delete'),
]
`;

  const notesCode = `## 📌 راهنمای جامع معماری و استفاده از اپلیکیشن حسابداری و حساب‌های دفتری (finance)

### 💡 ویژگی‌های کلیدی ماژول finance:
1. **کنترل سقف اعتبار (Credit Limit):** سیستم پیش از صدور هر فاکتور نسیه یا ثبت سفارش عمده، مانده بدهی قبلی + مبلغ فاکتور جدید را بررسی کرده و در صورت تجاوز از \`credit_limit\`، از ثبت سفارش جلوگیری می‌کند.
2. **بررسی مسدودی حساب:** حسابدار می‌تواند حساب‌های بدهکار بدحساب را مسدود (\`is_blocked=True\`) کند تا امکان ثبت هیچ‌گونه سفارش جدیدی نداشته باشند.
3. **تراکنش‌های اتمیک تسویه بدهی:** تسویه حساب از طریق اندپوینت \`settle-payment/\` با استفاده از \`transaction.atomic()\` صورت می‌گیرد؛ یعنی هم‌زمان با ثبت تراکنش بستانکاری، مانده بدهی \`current_balance\` در دیتابیس کسر می‌گردد.
4. **مدیریت چک‌های صیادی:** ثبت شناسه صیادی ۱۶ رقمی، تاریخ سررسید، وضعیت وصول/برگشت و اتصال مستقیم به حساب دفتری صادرکننده چک.

---

### 💻 نحوه استفاده از API تسویه بدهی در React (فرانت‌اند):

\`\`\`typescript
// نمونه فراخوانی API تسویه بدهی مشتری
const settleCustomerDebt = async (customerId: number, amount: number, refCode: string) => {
  const response = await fetch('http://localhost:8000/api/v1/finance/ledgers/settle-payment/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      customer_id: customerId,
      amount: amount,
      payment_type: 'bank_transfer',
      reference_code: refCode,
      description: 'تسویه نقد واریزی به حساب بانک سامان'
    })
  });

  const result = await response.json();
  if (result.status === 'success') {
    console.log("مانده بدهی جدید:", result.data.remaining_debt);
  }
};
\`\`\`
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
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};

