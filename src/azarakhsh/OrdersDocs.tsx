import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const OrdersDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'orders_orderinvoice',
      verboseName: 'پیش‌فاکتورهای رسمی و سفارشات',
      description: 'سفارشات عمده با صدور شماره پیش‌فاکتور متوالی، محاسبه مالیات و تخفیف، ثبت فیش و بارنامه',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'invoice_number', type: 'CharField(max_length=50)', isUnique: true, verbose: 'شماره پیش‌فاکتور رسمی', help: 'مثال: INV-1403-9419' },
        { name: 'customer_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'مشتری خریدار' },
        { name: 'total_cartons', type: 'PositiveIntegerField', verbose: 'مجموع کارتن‌ها' },
        { name: 'total_boxes', type: 'PositiveIntegerField', verbose: 'مجموع باکس‌ها' },
        { name: 'total_amount', type: 'DecimalField(max_digits=14)', verbose: 'مبلغ نهایی سفارش (تومان)' },
        { name: 'status', type: 'CharField(choices)', verbose: 'وضعیت (pending, confirmed, preparing, dispatched, delivered)' },
        { name: 'payment_receipt', type: 'ImageField', verbose: 'تصویر فیش واریز بانکی' },
        { name: 'shipping_province', type: 'CharField(max_length=50)', verbose: 'استان مقصد' },
        { name: 'shipping_city', type: 'CharField(max_length=50)', verbose: 'شهر مقصد' },
        { name: 'shipping_address', type: 'TextField', verbose: 'آدرس کامل تحویل' },
        { name: 'shipping_carrier', type: 'CharField(max_length=100)', verbose: 'نام باربری / وانت' },
        { name: 'shipping_bill_number', type: 'CharField(max_length=60)', verbose: 'شماره بارنامه / بیجک' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت سفارش' },
      ]
    },
    {
      name: 'orders_orderitem',
      verboseName: 'اقلام ردیف‌های پیش‌فاکتور',
      description: 'ثبت جزئیات تک‌تک محصولات خریداری‌شده همراه با اسنپ‌شات قیمت لحظه خرید',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'order_id', type: 'ForeignKey', isFk: true, fkTarget: 'orders_orderinvoice', verbose: 'پیش‌فاکتور مربوطه' },
        { name: 'product_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_product', verbose: 'محصول' },
        { name: 'unit', type: 'CharField(choices)', verbose: 'واحد خرید (carton / box)' },
        { name: 'quantity', type: 'PositiveIntegerField', verbose: 'تعداد' },
        { name: 'unit_price', type: 'DecimalField(max_digits=14)', verbose: 'قیمت واحد در لحظه ثبت' },
        { name: 'total_price', type: 'DecimalField(max_digits=14)', verbose: 'جمع مبلغ ردیف' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/orders/create/',
      auth: 'IsAuthenticated',
      description: 'ثبت سفارش جدید و صدور پیش‌فاکتور رسمی همراه با اسنپ‌شات قیمت اقلام سبد خرید',
      curlExample: `curl -X POST http://localhost:8000/api/v1/orders/create/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "items": [
      {"product": 1, "unit": "carton", "quantity": 2},
      {"product": 4, "unit": "box", "quantity": 10}
    ],
    "shipping_province": "تهران",
    "shipping_city": "تهران",
    "shipping_address": "جنت‌آباد جنوبی، نبش کوچه شقایق",
    "notes": "ارسال سریع با باربری شوش"
  }'`,
      responseBody: `{
  "status": "success",
  "message": "پیش‌فاکتور رسمی با موفقیت صادر گردید.",
  "data": {
    "id": 1024,
    "invoice_number": "INV-1403-1024",
    "total_amount": 74800000,
    "status": "pending",
    "created_at": "2026-08-24T14:30:00Z"
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/orders/my-orders/',
      auth: 'IsAuthenticated',
      description: 'دریافت سوابق پیش‌فاکتورهای رسمی و سفارشات خریدار یا مشتری لاگین‌شده',
      curlExample: `curl -X GET http://localhost:8000/api/v1/orders/my-orders/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: `{
  "status": "success",
  "count": 3,
  "results": [
    {
      "id": 1024,
      "invoice_number": "INV-1403-1024",
      "total_amount": 74800000,
      "status": "pending",
      "created_at": "2026-08-24T14:30:00Z"
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/orders/<id>/upload-receipt/',
      auth: 'IsAuthenticated',
      description: 'آپلود تصویر فیش واریز حواله بانکی برای تایید مالی انبار',
      curlExample: `curl -X POST http://localhost:8000/api/v1/orders/1024/upload-receipt/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -F "payment_receipt=@/path/to/receipt.jpg"`
    },
    {
      method: 'GET',
      path: '/api/v1/orders/list/',
      auth: 'IsAdminUser',
      description: 'دریافت لیست کلیه سفارشات و پیش‌فاکتورهای سیستم برای ادمین و حسابداری'
    },
    {
      method: 'GET',
      path: '/api/v1/orders/<id>/',
      auth: 'IsAuthenticated',
      description: 'مشاهده جزئیات کامل پیش‌فاکتور رسمی، اقلام، وضعیت پرداخت و بارنامه'
    },
    {
      method: 'PUT',
      path: '/api/v1/orders/<id>/update-status/',
      auth: 'IsAdminUser',
      description: 'تغییر وضعیت سفارش (تایید مالی، ارسال با باربری، بیجک) توسط ادمین'
    }
  ];

  const modelsCode = `"""
orders/models.py
مدل‌های پیش‌فاکتور رسمی سفارشات عمده دخانیات، اقلام ردیف، تصویر فیش بانکی و اطلاعات بارنامه
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from products.models import Product

User = get_user_model()


class OrderInvoice(models.Model):
    """
    مدل اصلی پیش‌فاکتور و سفارش خرید عمده
    """
    STATUS_CHOICES = (
      ('pending', 'در انتظار پرداخت / فیش'),
      ('confirmed', 'تایید مالی و در حال آماده‌سازی'),
      ('preparing', 'در حال بسته‌بندی در انبار'),
      ('dispatched', 'تحویل باربری و ارسال‌شده'),
      ('delivered', 'تحویل نهایی به خریدار'),
      ('canceled', 'لغوشده / مرجوعی'),
    )

    invoice_number = models.CharField(_("شماره پیش‌فاکتور"), max_length=50, unique=True)
    customer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders', verbose_name=_("خریدار"))
    total_cartons = models.PositiveIntegerField(_("مجموع کارتن‌ها"), default=0)
    total_boxes = models.PositiveIntegerField(_("مجموع باکس‌ها"), default=0)
    total_amount = models.DecimalField(_("مبلغ کل (تومان)"), max_digits=14, decimal_places=0, default=0)
    status = models.CharField(_("وضعیت سفارش"), max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # فیش پرداخت بانکی
    payment_receipt = models.ImageField(_("تصویر فیش واریز بانکی"), upload_to='receipts/', blank=True, null=True)
    
    # آدرس تحویل و باربری
    shipping_province = models.CharField(_("استان مقصد"), max_length=50)
    shipping_city = models.CharField(_("شهر مقصد"), max_length=50)
    shipping_address = models.TextField(_("آدرس کامل تحویل"))
    shipping_carrier = models.CharField(_("نام باربری / وانت"), max_length=100, blank=True, null=True)
    shipping_bill_number = models.CharField(_("شماره بارنامه / بیجک"), max_length=60, blank=True, null=True)
    notes = models.TextField(_("توضیحات و یادداشت خریدار"), blank=True, null=True)
    
    created_at = models.DateTimeField(_("تاریخ ثبت سفارش"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("پیش‌فاکتور و سفارش")
        verbose_name_plural = _("مدیریت سفارشات و پیش‌فاکتورها")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.get_full_name() or self.customer.username}"


class OrderItem(models.Model):
    """
    اقلام ردیف‌های پیش‌فاکتور همراه با اسنپ‌شات قیمت در لحظه خرید
    """
    UNIT_CHOICES = (
        ('carton', 'کارتن'),
        ('box', 'باکس'),
    )

    order = models.ForeignKey(OrderInvoice, on_delete=models.CASCADE, related_name='items', verbose_name=_("پیش‌فاکتور"))
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items', verbose_name=_("محصول"))
    unit = models.CharField(_("واحد خرید"), max_length=10, choices=UNIT_CHOICES, default='carton')
    quantity = models.PositiveIntegerField(_("تعداد"), default=1)
    unit_price = models.DecimalField(_("قیمت واحد (تومان)"), max_digits=14, decimal_places=0)
    total_price = models.DecimalField(_("جمع ردیف (تومان)"), max_digits=14, decimal_places=0)

    class Meta:
        verbose_name = _("ردیف سفارش")
        verbose_name_plural = _("اقلام سفارشات")

    def __str__(self):
        return f"{self.product.name} ({self.quantity} {self.get_unit_display()})"
`;

  const adminCode = `"""
orders/admin.py
پنل مدیریت پیش‌فاکتورها و سفارشات همراه با مدیریت اقلام ردیف و تغییر وضعیت سریع
"""

from django.contrib import admin
from .models import OrderInvoice, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'unit', 'quantity', 'unit_price', 'total_price')


@admin.register(OrderInvoice)
class OrderInvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer', 'total_amount', 'status', 'shipping_carrier', 'shipping_bill_number', 'created_at')
    list_filter = ('status', 'shipping_province', 'created_at')
    search_fields = ('invoice_number', 'customer__username', 'customer__first_name', 'customer__last_name', 'shipping_bill_number')
    inlines = [OrderItemInline]
    list_editable = ('status',)
`;

  const serializersCode = `"""
orders/serializers.py
سریالایزرهای DRF جهت ثبت سفارش، صدور پیش‌فاکتور، آپلود فیش بانکی و نمایش جزئیات
"""

from rest_framework import serializers
from .models import OrderInvoice, OrderItem
from products.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_brand = serializers.CharField(source='product.brand', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_brand', 'unit', 'quantity', 'unit_price', 'total_price']


class OrderInvoiceSerializer(serializers.ModelSerializer):
    """
    سریالایزر کامل نمایش پیش‌فاکتور به همراه تمام اقلام خرید
    """
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.username', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = OrderInvoice
        fields = [
            'id',
            'invoice_number',
            'customer',
            'customer_name',
            'customer_phone',
            'total_cartons',
            'total_boxes',
            'total_amount',
            'status',
            'payment_receipt',
            'shipping_province',
            'shipping_city',
            'shipping_address',
            'shipping_carrier',
            'shipping_bill_number',
            'notes',
            'items',
            'created_at'
        ]


class OrderItemInputSerializer(serializers.Serializer):
    product = serializers.IntegerField()
    unit = serializers.ChoiceField(choices=['carton', 'box'])
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    """
    سریالایزر دریافت فرم سبد خرید و صدور پیش‌فاکتور جدید
    """
    items = OrderItemInputSerializer(many=True)
    shipping_province = serializers.CharField(max_length=50)
    shipping_city = serializers.CharField(max_length=50)
    shipping_address = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)


class UploadReceiptSerializer(serializers.ModelSerializer):
    """
    سریالایزر آپلود تصویر فیش بانکی
    """
    class Meta:
        model = OrderInvoice
        fields = ['payment_receipt']


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    """
    سریالایزر بروزرسانی وضعیت سفارش و شماره بیجک توسط ادمین
    """
    class Meta:
        model = OrderInvoice
        fields = ['status', 'shipping_carrier', 'shipping_bill_number']
`;

  const viewsCode = `"""
orders/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت پیش‌فاکتورها و سفارشات
"""

import uuid
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction
from drf_yasg.utils import swagger_auto_schema

from .models import OrderInvoice, OrderItem
from products.models import Product
from .serializers import (
    OrderInvoiceSerializer,
    OrderCreateSerializer,
    UploadReceiptSerializer,
    OrderStatusUpdateSerializer
)


class OrderCreateAPIView(APIView):
    """
    اندپوینت ثبت سفارش جدید و صدور پیش‌فاکتور رسمی با اسنپ‌شات قیمت‌ها (ترنزکشن اتمیک)
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="ثبت سفارش و صدور پیش‌فاکتور رسمی",
        request_body=OrderCreateSerializer,
        responses={201: OrderInvoiceSerializer}
    )
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        items_data = validated_data['items']

        if not items_data:
            return Response({'error': 'سبد خرید نمی‌تواند خالی باشد.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # تولد شماره پیش‌فاکتور منحصر به فرد
            invoice_num = f"INV-1403-{uuid.uuid4().hex[:6].upper()}"

            order = OrderInvoice.objects.create(
                invoice_number=invoice_num,
                customer=request.user,
                shipping_province=validated_data['shipping_province'],
                shipping_city=validated_data['shipping_city'],
                shipping_address=validated_data['shipping_address'],
                notes=validated_data.get('notes', '')
            )

            total_amount = 0
            total_cartons = 0
            total_boxes = 0

            for item in items_data:
                product = get_object_or_404(Product, pk=item['product'], is_active=True)
                unit = item['unit']
                quantity = item['quantity']

                if unit == 'carton':
                    unit_price = product.carton_price
                    total_cartons += quantity
                else:
                    unit_price = product.box_price
                    total_boxes += quantity

                line_total = unit_price * quantity
                total_amount += line_total

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    unit=unit,
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=line_total
                )

            order.total_amount = total_amount
            order.total_cartons = total_cartons
            order.total_boxes = total_boxes
            order.save()

            return Response({
                'status': 'success',
                'message': 'پیش‌فاکتور رسمی با موفقیت صادر گردید.',
                'data': OrderInvoiceSerializer(order).data
            }, status=status.HTTP_201_CREATED)


class MyOrdersListAPIView(APIView):
    """
    اندپوینت دریافت لیست پیش‌فاکتورها و سوابق خرید مشتری جاری
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت لیست سوابق خرید خریدار جاری",
        responses={200: OrderInvoiceSerializer(many=True)}
    )
    def get(self, request):
        queryset = OrderInvoice.objects.filter(customer=request.user).prefetch_related('items')
        serializer = OrderInvoiceSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class OrderDetailAPIView(APIView):
    """
    اندپوینت دریافت جزئیات یک پیش‌فاکتور مشخص بر اساس ID
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات پیش‌فاکتور رسمی",
        responses={200: OrderInvoiceSerializer}
    )
    def get(self, request, pk):
        if request.user.is_staff:
            order = get_object_or_404(OrderInvoice, pk=pk)
        else:
            order = get_object_or_404(OrderInvoice, pk=pk, customer=request.user)

        serializer = OrderInvoiceSerializer(order)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class OrderUploadReceiptAPIView(APIView):
    """
    اندپوینت آپلود تصویر فیش بانکی پرداختی توسط خریدار
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="آپلود تصویر فیش واریز بانکی",
        request_body=UploadReceiptSerializer,
        responses={200: OrderInvoiceSerializer}
    )
    def post(self, request, pk):
        order = get_object_or_404(OrderInvoice, pk=pk, customer=request.user)
        serializer = UploadReceiptSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'تصویر فیش واریز بانکی با موفقیت ثبت شد.',
                'data': OrderInvoiceSerializer(order).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminOrderListAPIView(APIView):
    """
    اندپوینت دریافت لیست کلیه سفارشات برای ادمین و انباردار
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="دریافت لیست کلیه سفارشات سیستم (مدیریت)",
        responses={200: OrderInvoiceSerializer(many=True)}
    )
    def get(self, request):
        queryset = OrderInvoice.objects.all().select_related('customer').prefetch_related('items')
        
        order_status = request.query_params.get('status')
        if order_status:
            queryset = queryset.filter(status=order_status)

        serializer = OrderInvoiceSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class AdminOrderUpdateStatusAPIView(APIView):
    """
    اندپوینت تغییر وضعیت سفارش، ثبت بیجک و باربری (مخصوص ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="تغییر وضعیت سفارش و درج بارنامه (مدیریت)",
        request_body=OrderStatusUpdateSerializer,
        responses={200: OrderInvoiceSerializer}
    )
    def put(self, request, pk):
        order = get_object_or_404(OrderInvoice, pk=pk)
        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            updated_order = serializer.save()
            return Response({
                'status': 'success',
                'message': 'وضعیت پیش‌فاکتور و بارنامه با موفقیت بروزرسانی شد.',
                'data': OrderInvoiceSerializer(updated_order).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
`;

  const urlsCode = `"""
orders/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    OrderCreateAPIView,
    MyOrdersListAPIView,
    OrderDetailAPIView,
    OrderUploadReceiptAPIView,
    AdminOrderListAPIView,
    AdminOrderUpdateStatusAPIView,
)

app_name = 'orders'

urlpatterns = [
    # ۱. ثبت سفارش جدید و صدور پیش‌فاکتور
    path('create/', OrderCreateAPIView.as_view(), name='order-create'),

    # ۲. سوابق سفارشات و پیش‌فاکتورهای کاربر لاگین‌شده
    path('my-orders/', MyOrdersListAPIView.as_view(), name='my-orders'),

    # ۳. دریافت جزئیات پیش‌فاکتور
    path('<int:pk>/', OrderDetailAPIView.as_view(), name='order-detail'),

    # ۴. آپلود تصویر فیش واریزی حواله بانکی
    path('<int:pk>/upload-receipt/', OrderUploadReceiptAPIView.as_view(), name='order-upload-receipt'),

    # ۵. دریافت تمامی سفارشات سیستم (مخصوص ادمین)
    path('list/', AdminOrderListAPIView.as_view(), name='admin-order-list'),

    # ۶. تغییر وضعیت سفارش و ثبت شماره بارنامه/بیجک (مخصوص ادمین)
    path('<int:pk>/update-status/', AdminOrderUpdateStatusAPIView.as_view(), name='admin-order-update-status'),
]
`;

  const notesCode = `## 📌 راهنمای استفاده از سیستم سفارشات و پیش‌فاکتور با APIView

### ۱. دلیل پیاده‌سازی صریح با APIView (عدم استفاده از ViewSet):
* این ماژول کاملاً با کلاس‌های **APIView** صریح پیاده‌سازی شده و وابستگی به ViewSet یا Routerهای استاندارد DRF ندارد.
* **مزیت:** صدور پیش‌فاکتور اتمیک با \`transaction.atomic()\`, قفل‌کردن اسنپ‌شات قیمت‌ها در لحظه خرید، تفکیک صریح آپلود فیش بانکی از تغییر وضعیت بارنامه توسط ادمین و هماهنگی کامل با مستندات سواگر \`drf_yasg\`.

---

### ۲. نحوه فراخوانی در فرانت‌اند React:
\`\`\`typescript
// ثبت سفارش جدید و دریافت شماره پیش‌فاکتور رسمی
const createOrder = async (cartItems: any) => {
  const response = await fetch('http://localhost:8000/api/v1/orders/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      items: cartItems,
      shipping_province: "تهران",
      shipping_city: "تهران",
      shipping_address: "بازار بزرگ تهران، پلاک ۴۵"
    })
  });
  const res = await response.json();
  if (res.status === 'success') {
    console.log("شماره پیش‌فاکتور صادرشده:", res.data.invoice_number);
  }
};
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="orders"
      title="۸. اپلیکیشن سفارشات، پیش‌فاکتور رسمی و مالی"
      titleEn="orders / Proforma Invoice & Order App"
      badge="Atomic Transactions • Invoice Generator APIView"
      description="سیستم سفارش‌گذاری هوشمند عمده‌فروشی با صدور خودکار شماره پیش‌فاکتورهای رسمی متوالی، اسنپ‌شات قیمت‌ها با Transaction امن دیتابیس، ثبت فیش واریزی و اتصال به ناوگان باربری شوش. این اپلیکیشن بر پایه APIView صریح (دقیقاً مشابه الگوی regular_customers بدون ViewSet) پیاده‌سازی شده است."
      icon={<ShoppingCart className="w-6 h-6 text-emerald-500" />}
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
