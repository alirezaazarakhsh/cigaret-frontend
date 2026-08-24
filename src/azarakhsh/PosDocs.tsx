import React from 'react';
import { AppDocTemplate } from './AppDocTemplate';
import { MonitorSmartphone } from 'lucide-react';

export const PosDocs: React.FC = () => {
  return (
    <AppDocTemplate
      appFolder="pos"
      title="اپلیکیشن حسابداری و صندوق فروشگاهی (POS)"
      titleEn="pos / Point of Sale App"
      badge="صندوق فروشگاهی"
      description="مدیریت جامع یکپارچه صندوق فروشگاهی فیزیکی، کاردکس انبار و ثبت فاکتورهای حرارتی با پشتیبانی از سیستم‌های کارتخوان و نقدی."
      icon={<MonitorSmartphone className="w-6 h-6 text-indigo-500" />}
      modelsCode={`from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from products.models import Product

class PosSetting(models.Model):
    store_name = models.CharField(max_length=255, verbose_name=_("Store Name (نام فروشگاه)"))
    phone = models.CharField(max_length=20, verbose_name=_("Phone (تلفن تماس)"))
    address = models.TextField(verbose_name=_("Address (آدرس)"), blank=True, null=True)
    footer_note = models.CharField(max_length=255, verbose_name=_("Footer Note (متن فوتر فاکتور)"), default="با سپاس از خرید شما")
    
    class Meta:
        verbose_name = _("POS Setting")
        verbose_name_plural = _("POS Settings")

    def __str__(self):
        return self.store_name

class PosReceipt(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'cash', _('Cash (نقدی)')
        POS_TERMINAL = 'pos_terminal', _('POS Terminal (کارتخوان)')
        TRANSFER = 'transfer', _('Bank Transfer (حواله بانکی)')

    receipt_number = models.CharField(max_length=50, unique=True, verbose_name=_("Receipt Number (شماره فاکتور)"))
    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name=_("Cashier (صندوق‌دار)"))
    customer_name = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Customer (نام مشتری)"))
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=0, verbose_name=_("Subtotal (جمع کل)"))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0, verbose_name=_("Discount (تخفیف)"))
    final_total = models.DecimalField(max_digits=12, decimal_places=0, verbose_name=_("Final Total (مبلغ نهایی)"))
    
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.POS_TERMINAL)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("POS Receipt")
        verbose_name_plural = _("POS Receipts")
        ordering = ['-created_at']

    def __str__(self):
        return self.receipt_number

class PosReceiptItem(models.Model):
    receipt = models.ForeignKey(PosReceipt, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    unit = models.CharField(max_length=50, default='carton')
    unit_price = models.DecimalField(max_digits=12, decimal_places=0)
    total_price = models.DecimalField(max_digits=12, decimal_places=0)

    class Meta:
        verbose_name = _("Receipt Item")
        verbose_name_plural = _("Receipt Items")`}
      adminCode={`from django.contrib import admin
from .models import PosSetting, PosReceipt, PosReceiptItem

@admin.register(PosSetting)
class PosSettingAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'phone')

class PosReceiptItemInline(admin.TabularInline):
    model = PosReceiptItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'unit', 'unit_price', 'total_price')

@admin.register(PosReceipt)
class PosReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'customer_name', 'final_total', 'payment_method', 'created_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('receipt_number', 'customer_name')
    readonly_fields = ('receipt_number', 'subtotal', 'discount_amount', 'final_total', 'created_at')
    inlines = [PosReceiptItemInline]`}
      serializersCode={`from rest_framework import serializers
from .models import PosSetting, PosReceipt, PosReceiptItem

class PosSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PosSetting
        fields = '__all__'

class PosReceiptItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PosReceiptItem
        fields = ['product', 'quantity', 'unit', 'unit_price', 'total_price']

class PosReceiptSerializer(serializers.ModelSerializer):
    items = PosReceiptItemSerializer(many=True)

    class Meta:
        model = PosReceipt
        fields = [
            'id', 'receipt_number', 'customer_name', 'subtotal', 
            'discount_amount', 'final_total', 'payment_method', 'created_at', 'items'
        ]
        read_only_fields = ['receipt_number']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Generate receipt number
        import uuid
        validated_data['receipt_number'] = f"POS-{str(uuid.uuid4())[:8].upper()}"
        
        receipt = PosReceipt.objects.create(**validated_data)
        
        for item_data in items_data:
            PosReceiptItem.objects.create(receipt=receipt, **item_data)
            
        return receipt`}
      viewsCode={`from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import PosSetting, PosReceipt
from .serializers import PosSettingSerializer, PosReceiptSerializer

class PosSettingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PosSetting.objects.all()
    serializer_class = PosSettingSerializer
    # permission_classes = [IsAuthenticated]

class PosReceiptViewSet(viewsets.ModelViewSet):
    queryset = PosReceipt.objects.all()
    serializer_class = PosReceiptSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(cashier=self.request.user)`}
      urlsCode={`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PosSettingViewSet, PosReceiptViewSet

app_name = 'pos'

router = DefaultRouter()
router.register(r'settings', PosSettingViewSet, basename='pos-setting')
router.register(r'receipts', PosReceiptViewSet, basename='pos-receipt')

urlpatterns = [
    path('', include(router.urls)),
]`}
      erdTables={[
        {
          name: 'PosSetting',
          verboseName: 'تنظیمات صندوق',
          description: 'تنظیمات چاپ فیش شامل نام فروشگاه و پیغام فوتر',
          fields: [
            { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'ID' },
            { name: 'store_name', type: 'CharField', verbose: 'نام فروشگاه' },
            { name: 'phone', type: 'CharField', verbose: 'تلفن تماس' },
            { name: 'footer_note', type: 'CharField', verbose: 'پیغام انتهای فیش حرارتی' }
          ]
        },
        {
          name: 'PosReceipt',
          verboseName: 'فاکتور صندوق فروشگاهی',
          description: 'ذخیره فاکتورهای صادر شده در صندوق',
          fields: [
            { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'ID' },
            { name: 'receipt_number', type: 'CharField', verbose: 'شماره یکتای رسید' },
            { name: 'cashier', type: 'ForeignKey', isFk: true, fkTarget: 'User', verbose: 'صندوق‌دار' },
            { name: 'final_total', type: 'DecimalField', verbose: 'مبلغ نهایی پرداختی' },
            { name: 'payment_method', type: 'CharField', verbose: 'نحوه پرداخت' }
          ]
        },
        {
          name: 'PosReceiptItem',
          verboseName: 'ردیف فاکتور صندوق',
          description: 'اقلام فروخته شده در هر فاکتور حرارتی',
          fields: [
            { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'ID' },
            { name: 'receipt', type: 'ForeignKey', isFk: true, fkTarget: 'PosReceipt', verbose: 'فاکتور' },
            { name: 'product', type: 'ForeignKey', isFk: true, fkTarget: 'Product', verbose: 'کالا' },
            { name: 'quantity', type: 'PositiveIntegerField', verbose: 'تعداد' },
            { name: 'total_price', type: 'DecimalField', verbose: 'مبلغ کل ردیف' }
          ]
        }
      ]}
      endpoints={[
        {
          method: 'GET',
          path: '/api/v1/pos/settings/',
          auth: 'AllowAny',
          description: 'دریافت تنظیمات چاپ فاکتور (نام فروشگاه و فوتر)',
        },
        {
          method: 'POST',
          path: '/api/v1/pos/receipts/',
          auth: 'IsAuthenticated',
          description: 'ثبت فاکتور جدید از صندوق فروشگاهی و کاهش موجودی',
        }
      ]}
    />
  );
};
