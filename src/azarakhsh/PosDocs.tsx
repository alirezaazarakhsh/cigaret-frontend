import React from 'react';
import { MonitorSmartphone } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const PosDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'pos_register',
      verboseName: 'صندوق‌های فروشگاهی و پایانه‌ها',
      description: 'تعریف ترمینال‌های فروش، تبلت‌های صندوق، آدرس IP و شناسه دستگاه پوز بانکی متصل',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'name', type: 'CharField(max_length=100)', verbose: 'عنوان صندوق (مثلا: صندوق ۱ - درب خروج)' },
        { name: 'device_code', type: 'CharField(max_length=50)', isUnique: true, verbose: 'کد سخت‌افزاری پایانه' },
        { name: 'ip_address', type: 'GenericIPAddressField', verbose: 'آدرس IP در شبکه داخلی' },
        { name: 'pos_terminal_id', type: 'CharField(max_length=50)', verbose: 'ترمینال کارتخوان بانکی متصل' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'صندوق فعال' },
      ]
    },
    {
      name: 'pos_shift',
      verboseName: 'شیفت‌های کاری صندوق‌داران',
      description: 'ثبت ورود، خروج، موجودی نقد اولیه (تنخواه کشو)، جمع فروش نقدی، پوز و تطبیق مانده پایانی شیفت',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'register_id', type: 'ForeignKey(PosRegister)', isFk: true, fkTarget: 'pos_register', verbose: 'صندوق' },
        { name: 'cashier_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'کاربر صندوق‌دار' },
        { name: 'opened_at', type: 'DateTimeField', verbose: 'زمان شروع شیفت' },
        { name: 'closed_at', type: 'DateTimeField(null=True)', verbose: 'زمان بستن شیفت' },
        { name: 'opening_cash', type: 'BigIntegerField', verbose: 'موجودی نقد اولیه کشو (تومان)' },
        { name: 'closing_cash_actual', type: 'BigIntegerField(null=True)', verbose: 'موجودی نقد شمارش‌شده در پایان شیفت' },
        { name: 'total_cash_sales', type: 'BigIntegerField(default=0)', verbose: 'مجموع فروش نقدی' },
        { name: 'total_card_sales', type: 'BigIntegerField(default=0)', verbose: 'مجموع فروش کارتخوان' },
        { name: 'total_credit_sales', type: 'BigIntegerField(default=0)', verbose: 'مجموع فروش نسیه/دفتری' },
        { name: 'cash_discrepancy', type: 'BigIntegerField(default=0)', verbose: 'کسری یا اضافه صندوق (مغایرت)' },
        { name: 'status', type: 'CharField(choices: open, closed)', verbose: 'وضعیت شیفت' },
      ]
    },
    {
      name: 'pos_sale',
      verboseName: 'فاکتورهای فروش حضوری و صندوق',
      description: 'فاکتورهای صادرشده در صندوق با ثبت آنی در انبار، تخفیف، مالیات، بارکد پیگیری و شیوه پرداخت',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'receipt_number', type: 'CharField(max_length=50)', isUnique: true, verbose: 'شماره فیش / فاکتور حرارتی', help: 'مثال: POS-1403-8821' },
        { name: 'shift_id', type: 'ForeignKey(PosShift)', isFk: true, fkTarget: 'pos_shift', verbose: 'شیفت کاری مربوطه' },
        { name: 'cashier_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'صندوق‌دار' },
        { name: 'customer_name', type: 'CharField(max_length=150)', verbose: 'نام مشتری حضوری (یا متفرقه)' },
        { name: 'customer_phone', type: 'CharField(max_length=15, blank=True)', verbose: 'شماره همراه مشتری' },
        { name: 'subtotal_amount', type: 'BigIntegerField', verbose: 'جمع کل ناخالص اقلام (تومان)' },
        { name: 'discount_amount', type: 'BigIntegerField(default=0)', verbose: 'تخفیف فاکتور' },
        { name: 'final_amount', type: 'BigIntegerField', verbose: 'مبلغ نهایی قابل پرداخت' },
        { name: 'payment_method', type: 'CharField(choices: cash, pos_card, credit, split)', verbose: 'شیوه پرداخت' },
        { name: 'card_ref_number', type: 'CharField(max_length=50, blank=True)', verbose: 'شماره پیگیری تراکنش کارتخوان' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'زمان ثبت فروش' },
      ]
    },
    {
      name: 'pos_sale_item',
      verboseName: 'اقلام فاکتور فروش حضوری',
      description: 'ردیف‌های اقلام خریداری شده شامل سیگار (کارتن/باکس/پاکت) یا نوشیدنی و قهوه حضوری',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'sale_id', type: 'ForeignKey(PosSale)', isFk: true, fkTarget: 'pos_sale', verbose: 'فاکتور فروش' },
        { name: 'product_id', type: 'ForeignKey(CigaretteProduct)', isFk: true, fkTarget: 'catalog_cigaretteproduct', verbose: 'محصول' },
        { name: 'unit', type: 'CharField(choices: carton, box, pack, single)', verbose: 'واحد فروش' },
        { name: 'quantity', type: 'PositiveIntegerField', verbose: 'تعداد' },
        { name: 'unit_price', type: 'BigIntegerField', verbose: 'قیمت واحد (تومان)' },
        { name: 'total_price', type: 'BigIntegerField', verbose: 'جمع کل ردیف' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/pos/checkout/',
      auth: 'IsAuthenticated (Cashier / Admin)',
      description: 'ثبت آنی فاکتور فروش حضوری، کسر خودکار از انبار، ثبت تراکنش در شیفت و تولید اطلاعات چاپ فاکتور رسمی فروش',
      requestBody: JSON.stringify({
        shift_id: 12,
        customer_name: "مشتری حضوری",
        customer_phone: "09123456789",
        payment_method: "pos_card",
        card_ref_number: "98234710293",
        discount_amount: 50000,
        items: [
          { product_id: 1, unit: "carton", quantity: 1, unit_price: 38500000 },
          { product_id: 4, unit: "box", quantity: 2, unit_price: 750000 },
          { product_id: 901, unit: "single", quantity: 2, unit_price: 45000 }
        ]
      }, null, 2),
      responseBody: JSON.stringify({
        success: true,
        receipt_number: "POS-1403-8821",
        sale_id: 1042,
        final_amount: 40040000,
        thermal_print_payload: {
          store_name: "پخش عمده دخانیات سوین (شعبه مرکزی)",
          receipt_no: "POS-1403-8821",
          date: "۱۴۰۳/۰۶/۰۴ - ۱۶:۴۵",
          cashier: "علی احمدی",
          items_count: 5,
          total: 40040000
        }
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/pos/shifts/open/',
      auth: 'IsAuthenticated',
      description: 'شروع شیفت جدید کاری صندوق‌دار و ثبت تنخواه اولیه کشو'
    },
    {
      method: 'POST',
      path: '/api/v1/pos/shifts/close/',
      auth: 'IsAuthenticated',
      description: 'بستن شیفت کاری، محاسبه سرجمع فروش نقدی و کارتی و ثبت مغایرت نهایی'
    },
    {
      method: 'GET',
      path: '/api/v1/pos/receipt/{id}/print-data/',
      auth: 'IsAuthenticated',
      description: 'دریافت ساختار استاندارد متنی ESC/POS جهت ارسال مستقیم به پرینتر حرارتی ۸۰ میلی‌متری'
    }
  ];

  const modelsCode = `"""
pos/models.py
مدل‌های صندوق فروشگاهی، شیفت کاری، فاکتورهای حضوری، کسر لحظه‌ای انبار و فاکتور فروش رسمی
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from catalog.models import CigaretteProduct


class PosRegister(models.Model):
    name = models.CharField(_("عنوان پایانه صندوق"), max_length=100)
    device_code = models.CharField(_("کد سخت‌افزاری پایانه"), max_length=50, unique=True)
    ip_address = models.GenericIPAddressField(_("آدرس IP در شبکه محلی"), blank=True, null=True)
    pos_terminal_id = models.CharField(_("ترمینال کارتخوان بانکی (POS)"), max_length=50, blank=True)
    is_active = models.BooleanField(_("صندوق فعال"), default=True)
    created_at = models.DateTimeField(_("تاریخ ثبت"), auto_now_add=True)

    class Meta:
        verbose_name = _("پایانه صندوق فروشگاهی")
        verbose_name_plural = _("۱. پایانه‌ها و صندوق‌های فروشگاه")

    def __str__(self):
        return f"{self.name} ({self.device_code})"


class PosShift(models.Model):
    class ShiftStatus(models.TextChoices):
        OPEN = 'open', _('شیفت باز (در حال کار)')
        CLOSED = 'closed', _('شیفت بسته شده و تسویه گردیده')

    register = models.ForeignKey(PosRegister, on_delete=models.PROTECT, related_name='shifts', verbose_name=_("صندوق"))
    cashier = models.ForeignKey(User, on_delete=models.PROTECT, related_name='pos_shifts', verbose_name=_("صندوق‌دار"))
    opened_at = models.DateTimeField(_("زمان شروع شیفت"), auto_now_add=True)
    closed_at = models.DateTimeField(_("زمان پایان شیفت"), blank=True, null=True)
    opening_cash = models.BigIntegerField(_("موجودی نقد شروع شیفت (تنخواه - تومان)"), default=0)
    closing_cash_actual = models.BigIntegerField(_("موجودی نقد شمارش‌شده پایان شیفت"), blank=True, null=True)
    total_cash_sales = models.BigIntegerField(_("جمع فروش نقدی سیستم"), default=0)
    total_card_sales = models.BigIntegerField(_("جمع فروش کارتخوان"), default=0)
    total_credit_sales = models.BigIntegerField(_("جمع فروش نسیه / دفتری"), default=0)
    cash_discrepancy = models.BigIntegerField(_("مغایرت صندوق (کسری/اضافه)"), default=0)
    status = models.CharField(_("وضعیت شیفت"), max_length=20, choices=ShiftStatus.choices, default=ShiftStatus.OPEN)
    notes = models.TextField(_("یادداشت و توضیحات شیفت"), blank=True)

    class Meta:
        verbose_name = _("شیفت کاری صندوق‌دار")
        verbose_name_plural = _("۲. شیفت‌های کاری و تسویه صندوق")
        ordering = ['-opened_at']

    def __str__(self):
        return f"شیفت #{self.id} - {self.cashier.full_name} ({self.get_status_display()})"


class PosSale(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'cash', _('نقدی (وجه نقد)')
        POS_CARD = 'pos_card', _('کارتخوان بانکی')
        CREDIT = 'credit', _('نسیه و ثبت در حساب دفتری')
        SPLIT = 'split', _('ترکیبی (نقد + کارت)')

    receipt_number = models.CharField(_("شماره فیش فروش"), max_length=50, unique=True, db_index=True)
    shift = models.ForeignKey(PosShift, on_delete=models.PROTECT, related_name='sales', verbose_name=_("شیفت کاری"))
    cashier = models.ForeignKey(User, on_delete=models.PROTECT, related_name='cashier_sales', verbose_name=_("صندوق‌دار"))
    customer_name = models.CharField(_("نام مشتری"), max_length=150, default="مشتری حضوری")
    customer_phone = models.CharField(_("شماره تماس مشتری"), max_length=15, blank=True)
    subtotal_amount = models.BigIntegerField(_("جمع کل ناخالص (تومان)"))
    discount_amount = models.BigIntegerField(_("مبلغ تخفیف (تومان)"), default=0)
    final_amount = models.BigIntegerField(_("مبلغ قابل پرداخت (تومان)"))
    payment_method = models.CharField(_("روش پرداخت"), max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.POS_CARD)
    card_ref_number = models.CharField(_("شماره پیگیری کارتخوان"), max_length=60, blank=True)
    created_at = models.DateTimeField(_("زمان ثبت فاکتور"), auto_now_add=True)

    class Meta:
        verbose_name = _("فاکتور فروش حضوری")
        verbose_name_plural = _("۳. فاکتورهای فروش حضوری (POS)")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.receipt_number} - {self.final_amount:,} تومان ({self.customer_name})"


class PosSaleItem(models.Model):
    class SaleUnit(models.TextChoices):
        CARTON = 'carton', _('کارتن ۵۰ باکسی')
        BOX = 'box', _('باکس ۱۰ پاکتی')
        PACK = 'pack', _('پاکت تکی')
        SINGLE = 'single', _('شات / عدد')

    sale = models.ForeignKey(PosSale, on_delete=models.CASCADE, related_name='items', verbose_name=_("فاکتور فروش"))
    product = models.ForeignKey(CigaretteProduct, on_delete=models.PROTECT, verbose_name=_("محصول"))
    unit = models.CharField(_("واحد فروش"), max_length=20, choices=SaleUnit.choices, default=SaleUnit.CARTON)
    quantity = models.PositiveIntegerField(_("تعداد"), default=1)
    unit_price = models.BigIntegerField(_("قیمت واحد (تومان)"))
    total_price = models.BigIntegerField(_("قیمت کل ردیف (تومان)"))

    class Meta:
        verbose_name = _("ردیف قلم فاکتور فروش")
        verbose_name_plural = _("اقلام فاکتورهای حضوری")

    def __str__(self):
        return f"{self.product.name_fa} ({self.quantity} {self.get_unit_display()})"
`;

  const adminCode = `"""
pos/admin.py
مدیریت پنل ادمین جنگو برای صندوق‌های فروشگاهی، چاپ فیش و تسویه شیفت
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import PosRegister, PosShift, PosSale, PosSaleItem


class PosSaleItemInline(admin.TabularInline):
    model = PosSaleItem
    extra = 0
    readonly_fields = ('product', 'unit', 'quantity', 'unit_price', 'total_price')


@admin.register(PosRegister)
class PosRegisterAdmin(admin.ModelAdmin):
    list_display = ('name', 'device_code', 'ip_address', 'pos_terminal_id', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'device_code', 'pos_terminal_id')
    list_editable = ('is_active',)


@admin.register(PosShift)
class PosShiftAdmin(admin.ModelAdmin):
    list_display = ('id', 'register', 'cashier', 'opened_at', 'closed_at', 'opening_cash_display', 'total_sales_display', 'status_badge')
    list_filter = ('status', 'register', 'opened_at')
    search_fields = ('cashier__full_name', 'cashier__phone')
    readonly_fields = ('opened_at', 'total_cash_sales', 'total_card_sales', 'total_credit_sales')

    def opening_cash_display(self, obj):
        return f"{obj.opening_cash:,} تومان"
    opening_cash_display.short_description = "تنخواه اولیه"

    def total_sales_display(self, obj):
        total = obj.total_cash_sales + obj.total_card_sales + obj.total_credit_sales
        return f"{total:,} تومان"
    total_sales_display.short_description = "کل فروش شیفت"

    def status_badge(self, obj):
        if obj.status == 'open':
            return format_html('<span style="color: green; font-weight: bold;">● شیفت باز</span>')
        return format_html('<span style="color: gray;">بسته شده</span>')
    status_badge.short_description = "وضعیت"


@admin.register(PosSale)
class PosSaleAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'customer_name', 'final_amount_display', 'payment_method_badge', 'cashier', 'created_at')
    list_filter = ('payment_method', 'created_at', 'shift__register')
    search_fields = ('receipt_number', 'customer_name', 'customer_phone', 'card_ref_number')
    inlines = [PosSaleItemInline]
    readonly_fields = ('receipt_number', 'created_at', 'subtotal_amount', 'final_amount')

    def final_amount_display(self, obj):
        return f"{obj.final_amount:,} تومان"
    final_amount_display.short_description = "مبلغ فاکتور"

    def payment_method_badge(self, obj):
        colors = {'cash': '#10b981', 'pos_card': '#3b82f6', 'credit': '#ef4444', 'split': '#8b5cf6'}
        return format_html(
            f'<span style="background-color: {colors.get(obj.payment_method, "#64748b")}; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px;">'
            f'{obj.get_payment_method_display()}</span>'
        )
    payment_method_badge.short_description = "روش پرداخت"
`;

  const serializersCode = `"""
pos/serializers.py
سریالایزرهای ثبت فروش سریع، شیفت کاری و فیش پرینتر
"""
from rest_framework import serializers
from django.db import transaction
from .models import PosRegister, PosShift, PosSale, PosSaleItem
from catalog.models import CigaretteProduct


class PosRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = PosRegister
        fields = '__all__'


class PosShiftSerializer(serializers.ModelSerializer):
    cashier_name = serializers.CharField(source='cashier.full_name', read_only=True)

    class Meta:
        model = PosShift
        fields = '__all__'
        read_only_fields = ['opened_at', 'total_cash_sales', 'total_card_sales', 'total_credit_sales']


class PosSaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name_fa', read_only=True)

    class Meta:
        model = PosSaleItem
        fields = ['id', 'product', 'product_name', 'unit', 'quantity', 'unit_price', 'total_price']


class PosCheckoutSerializer(serializers.Serializer):
    shift_id = serializers.IntegerField()
    customer_name = serializers.CharField(max_length=150, required=False, default="مشتری حضوری")
    customer_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=PosSale.PaymentMethod.choices)
    card_ref_number = serializers.CharField(max_length=60, required=False, allow_blank=True)
    discount_amount = serializers.IntegerField(default=0)
    items = serializers.ListField(child=serializers.DictField())

    @transaction.atomic
    def create(self, validated_data):
        shift = PosShift.objects.select_for_update().get(id=validated_data['shift_id'], status=PosShift.ShiftStatus.OPEN)
        user = self.context['request'].user
        
        items_data = validated_data['items']
        subtotal = 0
        sale_items = []

        # ۱. محاسبه مبالغ و اعتبارسنجی کالاها
        for item in items_data:
            product = CigaretteProduct.objects.select_for_update().get(id=item['product_id'])
            qty = item['quantity']
            unit = item.get('unit', 'carton')
            unit_price = item['unit_price']
            line_total = qty * unit_price
            subtotal += line_total

            # کسر از موجودی انبار بر اساس واحد
            if unit == 'carton':
                product.stock_cartons = max(0, product.stock_cartons - qty)
            elif unit == 'box':
                boxes_per_carton = product.boxes_per_carton or 50
                product.stock_cartons = max(0, product.stock_cartons - (qty / boxes_per_carton))
            product.save()

            sale_items.append({
                'product': product,
                'unit': unit,
                'quantity': qty,
                'unit_price': unit_price,
                'total_price': line_total
            })

        discount = validated_data.get('discount_amount', 0)
        final_total = max(0, subtotal - discount)
        receipt_no = f"POS-{PosSale.objects.count() + 1001}"

        # ۲. ساخت فاکتور فروش
        sale = PosSale.objects.create(
            receipt_number=receipt_no,
            shift=shift,
            cashier=user,
            customer_name=validated_data.get('customer_name', 'مشتری حضوری'),
            customer_phone=validated_data.get('customer_phone', ''),
            subtotal_amount=subtotal,
            discount_amount=discount,
            final_amount=final_total,
            payment_method=validated_data['payment_method'],
            card_ref_number=validated_data.get('card_ref_number', '')
        )

        for s_item in sale_items:
            PosSaleItem.objects.create(sale=sale, **s_item)

        # ۳. به‌روزرسانی جمع فروش شیفت
        if sale.payment_method == PosSale.PaymentMethod.CASH:
            shift.total_cash_sales += final_total
        elif sale.payment_method == PosSale.PaymentMethod.POS_CARD:
            shift.total_card_sales += final_total
        elif sale.payment_method == PosSale.PaymentMethod.CREDIT:
            shift.total_credit_sales += final_total
        shift.save()

        return sale
`;

  const viewsCode = `"""
pos/views.py
ویوهای عملیاتی صندوق، پرداخت، شروع/پایان شیفت و صدور فاکتور رسمی فروش
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import PosRegister, PosShift, PosSale
from .serializers import (
    PosRegisterSerializer, PosShiftSerializer, PosCheckoutSerializer, PosSaleItemSerializer
)


class PosRegisterViewSet(viewsets.ModelViewSet):
    queryset = PosRegister.objects.filter(is_active=True)
    serializer_class = PosRegisterSerializer
    permission_classes = [permissions.IsAuthenticated]


class PosShiftViewSet(viewsets.ModelViewSet):
    queryset = PosShift.objects.all()
    serializer_class = PosShiftSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='open')
    def open_shift(self, request):
        register_id = request.data.get('register_id')
        opening_cash = request.data.get('opening_cash', 0)
        
        # بستن هر شیفت باز قبلی توسط این کاربر
        active_shift = PosShift.objects.filter(cashier=request.user, status=PosShift.ShiftStatus.OPEN).first()
        if active_shift:
            return Response({'error': 'شما هم‌اکنون یک شیفت باز فعال دارید.'}, status=status.HTTP_400_BAD_REQUEST)

        register = PosRegister.objects.get(id=register_id)
        shift = PosShift.objects.create(
            register=register,
            cashier=request.user,
            opening_cash=opening_cash,
            status=PosShift.ShiftStatus.OPEN
        )
        return Response(PosShiftSerializer(shift).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='close')
    def close_shift(self, request, pk=None):
        shift = self.get_object()
        actual_cash = request.data.get('closing_cash_actual', 0)
        expected_cash = shift.opening_cash + shift.total_cash_sales
        
        shift.closing_cash_actual = actual_cash
        shift.cash_discrepancy = actual_cash - expected_cash
        shift.closed_at = timezone.now()
        shift.status = PosShift.ShiftStatus.CLOSED
        shift.notes = request.data.get('notes', '')
        shift.save()
        return Response(PosShiftSerializer(shift).data)


class PosSaleViewSet(viewsets.ModelViewSet):
    queryset = PosSale.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        serializer = PosCheckoutSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        sale = serializer.save()
        
        return Response({
            'success': True,
            'receipt_number': sale.receipt_number,
            'sale_id': sale.id,
            'final_amount': sale.final_amount,
            'thermal_payload': {
                'store_title': "پخش عمده دخانیات سوین - انبار مرکزی جنت‌آباد",
                'receipt_no': sale.receipt_number,
                'date': sale.created_at.strftime('%Y/%m/%d %H:%M'),
                'cashier': sale.cashier.full_name,
                'final_total': sale.final_amount
            }
        }, status=status.HTTP_201_CREATED)
`;

  const urlsCode = `"""
pos/urls.py
مسیریابی روت‌های اپلیکیشن صندوق فروشگاهی
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PosRegisterViewSet, PosShiftViewSet, PosSaleViewSet

router = DefaultRouter()
router.register('registers', PosRegisterViewSet, basename='pos-register')
router.register('shifts', PosShiftViewSet, basename='pos-shift')
router.register('sales', PosSaleViewSet, basename='pos-sale')

urlpatterns = [
    path('', include(router.urls)),
]
`;

  return (
    <AppDocTemplate
      appFolder="pos"
      title="اپلیکیشن حسابداری و صندوق فروشگاهی (POS)"
      titleEn="pos / Point of Sale & Thermal Invoice App"
      badge="POS • Thermal Print • Live Register"
      description="ماژول یکپارچه صندوق فروشگاهی، پایانه‌های کارتخوان متصل، مدیریت شیفت و تنخواه صندوق‌دار، کسر آنی انبار با تراکنش اتمیک و قالب آماده پرینتر حرارتی ۸۰ میلی‌متری."
      icon={<MonitorSmartphone className="w-6 h-6 text-indigo-500" />}
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

