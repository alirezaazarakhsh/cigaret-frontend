import React, { useState } from 'react';
import { ShoppingCart, Copy, Check, FileCode, FileText, CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { CodeTab } from './types';

export const OrdersDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelsCode = `"""
orders/models.py
مدل‌های سفارش عمده، صدور پیش‌فاکتور رسمی، اقلام کارتن/باکس و ثبت فیش واریز
"""

import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from products.models import Product


class Order(models.Model):
    STATUS_CHOICES = (
        ('pending_payment', 'در انتظار واریز فیش / پرداخت'),
        ('payment_verified', 'تأیید فیش بانکی توسط امور مالی'),
        ('packaging', 'در حال بسته‌بندی در انبار جنت‌آباد'),
        ('dispatched', 'تحویل باربری / ارسال شده'),
        ('delivered', 'تحویل نهایی به خریدار'),
        ('canceled', 'لغو شده'),
    )

    order_number = models.CharField(_('شماره سفارش / پیش‌فاکتور'), max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', verbose_name=_('خریدار'))
    
    # مشخصات تحویل‌گیرنده و مقصد
    recipient_name = models.CharField(_('نام تحویل‌گیرنده'), max_length=150)
    recipient_phone = models.CharField(_('تلفن تماس تحویل‌گیرنده'), max_length=15)
    destination_city = models.CharField(_('شهر مقصد'), max_length=80)
    destination_address = models.TextField(_('آدرس دقیق انبار / فروشگاه مقصد'))
    shipping_carrier_name = models.CharField(_('نام باربری انتخابی'), max_length=100, default='باربری حبیبی (شوش)')
    
    # محاسبات مالی
    total_items_amount = models.DecimalField(_('مبلغ کل کالاها (تومان)'), max_digits=14, decimal_places=0)
    shipping_cost = models.DecimalField(_('کرایه باربری (تومان)'), max_digits=12, decimal_places=0, default=0)
    tax_amount = models.DecimalField(_('ارزش افزوده / مالیات (تومان)'), max_digits=12, decimal_places=0, default=0)
    discount_amount = models.DecimalField(_('مبلغ تخفیف (تومان)'), max_digits=12, decimal_places=0, default=0)
    final_payable_amount = models.DecimalField(_('مبلغ نهایی قابل پرداخت (تومان)'), max_digits=14, decimal_places=0)

    status = models.CharField(_('وضعیت سفارش'), max_length=30, choices=STATUS_CHOICES, default='pending_payment')
    tracking_code = models.CharField(_('کد رهگیری بارنامه باربری'), max_length=80, blank=True, null=True)
    customer_notes = models.TextField(_('توضیحات خریدار'), blank=True, null=True)
    
    # فیش واریز
    payment_receipt_image = models.ImageField(_('تصویر فیش واریز بانکی'), upload_to='receipts/%Y/%m/', blank=True, null=True)
    payment_ref_number = models.CharField(_('شماره پیگیری فیش بانکی'), max_length=80, blank=True, null=True)

    created_at = models.DateTimeField(_('تاریخ ثبت'), auto_now_add=True)
    updated_at = models.DateTimeField(_('آخرین بروزرسانی'), auto_now=True)

    class Meta:
        verbose_name = _('سفارش عمده')
        verbose_name_plural = _('سفارشات و پیش‌فاکتورها')
        ordering = ['-created_at']

    def __str__(self):
        return f"پیش‌فاکتور {self.order_number} - {self.user.full_name} ({self.get_status_display()})"


class OrderItem(models.Model):
    UNIT_CHOICES = (
        ('carton', 'کارتن پلمپ'),
        ('box', 'باکس'),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name=_('سفارش'))
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items', verbose_name=_('محصول'))
    unit = models.CharField(_('واحد خرید'), max_length=10, choices=UNIT_CHOICES, default='carton')
    quantity = models.PositiveIntegerField(_('تعداد'), default=1)
    unit_price_toman = models.DecimalField(_('قیمت واحد در زمان خرید'), max_digits=12, decimal_places=0)
    total_price_toman = models.DecimalField(_('مجموع قیمت ردیف'), max_digits=14, decimal_places=0)

    class Meta:
        verbose_name = _('ردیف کالای سفارش')
        verbose_name_plural = _('اقلام سفارش')

    def __str__(self):
        return f"{self.product.name} ({self.quantity} {self.get_unit_display()})"
`;

  const adminCode = `"""
orders/admin.py
مدیریت سفارشات، تأیید فیش‌های واریز و ثبت بارنامه باربری
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'unit', 'quantity', 'unit_price_toman', 'total_price_toman')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'user', 'recipient_name', 'destination_city',
        'final_payable_amount', 'status', 'tracking_code', 'created_at'
    )
    list_filter = ('status', 'destination_city', 'created_at')
    search_fields = ('order_number', 'user__phone', 'user__full_name', 'recipient_name', 'tracking_code')
    list_editable = ('status', 'tracking_code')
    inlines = [OrderItemInline]

    fieldsets = (
        (_('مشخصات سفارش'), {
            'fields': ('order_number', 'user', 'status', 'tracking_code')
        }),
        (_('اطلاعات مقصد و باربری'), {
            'fields': ('recipient_name', 'recipient_phone', 'destination_city', 'destination_address', 'shipping_carrier_name')
        }),
        (_('مبالغ مالی (تومان)'), {
            'fields': ('total_items_amount', 'shipping_cost', 'tax_amount', 'discount_amount', 'final_payable_amount')
        }),
        (_('اطلاعات پرداخت'), {
            'fields': ('payment_receipt_image', 'payment_ref_number', 'customer_notes')
        }),
    )
`;

  const serializersCode = `"""
orders/serializers.py
سریالایزرهای DRF برای ثبت سبد خرید، صدور پیش‌فاکتور، و مشاهده جزئیات سفارش
"""

from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product
from products.serializers import ProductListSerializer


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    unit = serializers.ChoiceField(choices=['carton', 'box'], default='carton')
    quantity = serializers.IntegerField(min_value=1, default=1)


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'recipient_name', 'recipient_phone',
            'destination_city', 'destination_address', 'shipping_carrier_name',
            'customer_notes', 'items'
        ]
        read_only_fields = ['id', 'order_number']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        
        # تولید شماره سفارش یکتا
        import random, datetime
        now = datetime.datetime.now()
        order_number = f"SEV-{now.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

        total_items_amount = 0

        # محاسبه اقلام
        order_items_objs = []
        for item in items_data:
            product = Product.objects.get(id=item['product_id'])
            unit = item['unit']
            quantity = item['quantity']

            unit_price = product.price_carton_toman if unit == 'carton' else product.price_box_toman
            total_price = unit_price * quantity
            total_items_amount += total_price

            order_items_objs.append({
                'product': product,
                'unit': unit,
                'quantity': quantity,
                'unit_price_toman': unit_price,
                'total_price_toman': total_price
            })

        shipping_cost = 450000  # هزینه پیش‌فرض باربری
        final_payable_amount = total_items_amount + shipping_cost

        order = Order.objects.create(
            user=user,
            order_number=order_number,
            total_items_amount=total_items_amount,
            shipping_cost=shipping_cost,
            final_payable_amount=final_payable_amount,
            **validated_data
        )

        for obj in order_items_objs:
            OrderItem.objects.create(order=order, **obj)

        return order


class OrderItemDetailSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'unit', 'quantity', 'unit_price_toman', 'total_price_toman']


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'recipient_name', 'recipient_phone',
            'destination_city', 'destination_address', 'shipping_carrier_name',
            'total_items_amount', 'shipping_cost', 'tax_amount', 'discount_amount',
            'final_payable_amount', 'status', 'tracking_code', 'customer_notes',
            'payment_receipt_image', 'payment_ref_number', 'items', 'created_at'
        ]
`;

  const viewsCode = `"""
orders/views.py
ویوهای API جنگو برای ثبت سفارش، دریافت لیست فاکتورها، و آپلود فیش واریز
"""

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Order
from .serializers import OrderCreateSerializer, OrderDetailSerializer


class OrderListCreateAPIView(generics.ListCreateAPIView):
    """
    مشاهده لیست سفارشات کاربر و ثبت پیش‌فاکتور رسمی جدید
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderDetailSerializer

    @swagger_auto_schema(
        operation_description="دریافت لیست سفارشات و پیش‌فاکتورهای کاربر احراز هویت شده",
        responses={200: OrderDetailSerializer(many=True)},
        tags=["سفارشات و پیش‌فاکتور"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="ثبت سفارش عمده و صدور آنی پیش‌فاکتور رسمی",
        request_body=OrderCreateSerializer,
        responses={201: OrderDetailSerializer},
        tags=["سفارشات و پیش‌فاکتور"]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class OrderDetailAPIView(generics.RetrieveAPIView):
    """
    مشاهده مشخصات کامل یک سفارش بر اساس شماره پیش‌فاکتور
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderDetailSerializer
    lookup_field = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @swagger_auto_schema(
        operation_description="دریافت جزئیات پیش‌فاکتور با شماره سفارش",
        tags=["سفارشات و پیش‌فاکتور"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class OrderTrackingAPIView(APIView):
    """
    رهگیری بارنامه سفارش با کد رهگیری
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="استعلام آخرین وضعیت سفارش با کد رهگیری بارنامه یا شماره پیش‌فاکتور",
        manual_parameters=[
            openapi.Parameter('tracking_code', openapi.IN_QUERY, description="کد رهگیری بارنامه", type=openapi.TYPE_STRING)
        ],
        tags=["سفارشات و پیش‌فاکتور"]
    )
    def get(self, request):
        code = request.query_params.get('tracking_code')
        if not code:
            return Response({'error': 'کد رهگیری ارسال نشده است.'}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.filter(tracking_code=code).first() or Order.objects.filter(order_number=code).first()
        if not order:
            return Response({'error': 'سفارشی با این مشخصات یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(OrderDetailSerializer(order).data)
`;

  const urlsCode = `"""
orders/urls.py
مسیرهای روت اپلیکیشن سفارشات و پیش‌فاکتور
"""

from django.urls import path
from .views import OrderListCreateAPIView, OrderDetailAPIView, OrderTrackingAPIView

app_name = 'orders'

urlpatterns = [
    path('', OrderListCreateAPIView.as_view(), name='order_list_create'),
    path('track/', OrderTrackingAPIView.as_view(), name='order_track'),
    path('<str:order_number>/', OrderDetailAPIView.as_view(), name='order_detail'),
]
`;

  return (
    <div className="space-y-6 text-slate-800 text-right" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">اپلیکیشن سفارشات (orders)</div>
            <h1 className="text-2xl font-black text-slate-900">
              صدور پیش‌فاکتور رسمی، اقلام کارتن/باکس و رهگیری بارنامه باربری
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          امکان تبدیل سبد خرید به پیش‌فاکتور رسمی با هزینه باربری، آپلود تصویر فیش واریز بانکی و رهگیری لحظه‌ای بارنامه.
        </p>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'models', label: 'مدل‌ها (models.py)' },
          { id: 'admin', label: 'پنل ادمین (admin.py)' },
          { id: 'serializers', label: 'سریالایزرها (serializers.py)' },
          { id: 'views', label: 'ویوهای API (views.py)' },
          { id: 'urls', label: 'روت‌ها (urls.py)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as CodeTab)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 relative font-mono text-xs shadow-xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4" dir="ltr">
          <span className="text-slate-400 font-bold">
            orders/{activeTab === 'models' ? 'models.py' : activeTab === 'admin' ? 'admin.py' : activeTab === 'serializers' ? 'serializers.py' : activeTab === 'views' ? 'views.py' : 'urls.py'}
          </span>
          <button
            onClick={() => handleCopy(
              activeTab === 'models' ? modelsCode : activeTab === 'admin' ? adminCode : activeTab === 'serializers' ? serializersCode : activeTab === 'views' ? viewsCode : urlsCode,
              activeTab
            )}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            {copiedKey === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی کد</span>
              </>
            )}
          </button>
        </div>

        <pre className="overflow-x-auto text-left leading-relaxed whitespace-pre font-mono text-[11px] sm:text-xs" dir="ltr">
          {activeTab === 'models' ? modelsCode : activeTab === 'admin' ? adminCode : activeTab === 'serializers' ? serializersCode : activeTab === 'views' ? viewsCode : urlsCode}
        </pre>
      </div>
    </div>
  );
};
