import React from 'react';
import { Package } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const PosProductsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'pos_products_quickcategory',
      verboseName: 'دسته‌بندی‌های سریع صفحه لمسی صندوق (POS Tiles)',
      description: 'گروه‌بندی بصری کالاها روی مانیتور لمسی صندوق‌دار (مثل سیگارهای پرفروش، قهوه و نوشیدنی، فندک و اکسسوری)',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'title_fa', type: 'CharField(max_length=100)', verbose: 'عنوان فارسی دسته‌بندی' },
        { name: 'color_code', type: 'CharField(max_length=20)', verbose: 'رنگ دکمه تاچ (مثلا: #3b82f6)' },
        { name: 'icon_name', type: 'CharField(max_length=50)', verbose: 'نام آیکون نمایشی' },
        { name: 'sort_order', type: 'PositiveIntegerField(default=0)', verbose: 'ترتیب نمایش در تاچ‌اسکرین' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'فعال در صندوق' },
      ]
    },
    {
      name: 'pos_products_posproductitem',
      verboseName: 'کالاهای سریع صندوق و بارکدها',
      description: 'تعریف کالاهای فروش حضوری با پشتیبانی از چند بارکد (کارتن، باکس، پاکت، شات قهوه)، دکمه لمسی سریع و قیمت‌گذاری خرد',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'product_id', type: 'OneToOneField(Product)', isFk: true, fkTarget: 'products_product', verbose: 'کالای مرجع کاتالوگ' },
        { name: 'quick_category_id', type: 'ForeignKey(QuickCategory)', isFk: true, fkTarget: 'pos_products_quickcategory', verbose: 'دسته‌بندی سریع تاچ' },
        { name: 'barcode_carton', type: 'CharField(max_length=50, blank=True)', verbose: 'بارکد اسکنر کارتن' },
        { name: 'barcode_box', type: 'CharField(max_length=50, blank=True)', verbose: 'بارکد اسکنر باکس' },
        { name: 'barcode_pack', type: 'CharField(max_length=50, blank=True)', verbose: 'بارکد اسکنر پاکت' },
        { name: 'retail_pack_price', type: 'BigIntegerField(default=0)', verbose: 'قیمت فروش تکی پاکت (تومان)' },
        { name: 'is_drink_coffee', type: 'BooleanField(default=False)', verbose: 'آیتم نوشیدنی / اسپرسو (بدون کسر کارتن)' },
        { name: 'touch_button_label', type: 'CharField(max_length=60, blank=True)', verbose: 'متن روی دکمه لمسی صندوق' },
        { name: 'is_featured_touch', type: 'BooleanField(default=False)', verbose: 'نمایش در صفحه اول سریع صندوق' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/pos-products/touch-tiles/',
      auth: 'IsAuthenticated (Cashier / Admin)',
      description: 'دریافت ساختار دکمه‌های سریع لمسی دسته‌بندی‌شده همراه با قیمت و موجودی برای مانیتور صندوق‌دار',
      curlExample: `curl -X GET http://localhost:8000/api/v1/pos-products/touch-tiles/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`,
      responseBody: JSON.stringify({
        status: "success",
        categories: [
          {
            id: 1,
            title: "سیگارهای پرفروش",
            color: "#ef4444",
            items: [
              { id: 101, name: "وینستون لایت کارتن", unit: "carton", price_carton: 38500000, price_box: 770000, price_pack: 78000, is_drink: false, stock: 18 },
              { id: 102, name: "مارلبرو گلد کارتن", unit: "carton", price_carton: 42000000, price_box: 840000, price_pack: 85000, is_drink: false, stock: 12 }
            ]
          },
          {
            id: 2,
            title: "نوشیدنی و قهوه حضوری",
            color: "#8b5cf6",
            items: [
              { id: 201, name: "اسپرسو سینگل ۱۰۰٪ عربیکا", unit: "single", price_carton: 0, price_box: 0, price_pack: 35000, is_drink: true, stock: 999 }
            ]
          }
        ]
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/pos-products/scan-barcode/',
      auth: 'IsAuthenticated',
      description: 'شناسایی آنی محصول و تشخیص اتوماتیک واحد (کارتن، باکس یا پاکت) به محض اسکن بارکدخوان فیزیکی',
      curlExample: `curl -X POST http://localhost:8000/api/v1/pos-products/scan-barcode/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"barcode": "6260123456789"}'`,
      requestBody: JSON.stringify({ barcode: "6260123456789" }, null, 2),
      responseBody: JSON.stringify({
        status: "success",
        found: true,
        product_id: 1,
        name: "وینستون لایت اورجینال",
        unit: "box",
        unit_price: 770000,
        stock: 45
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/pos-products/quick-categories/',
      auth: 'IsAuthenticated',
      description: 'دریافت لیست دسته‌بندی‌های لمسی صفحه اول صندوق'
    },
    {
      method: 'GET',
      path: '/api/v1/pos-products/list/',
      auth: 'IsAuthenticated',
      description: 'دریافت لیست کامل کالاهای تنظیم‌شده برای صندوق حضوری'
    },
    {
      method: 'POST',
      path: '/api/v1/pos-products/create/',
      auth: 'IsAdminUser',
      description: 'تنظیم خصوصیات صندوق، بارکدها و قیمت پاکت تکی برای یک محصول کاتالوگ'
    },
    {
      method: 'GET',
      path: '/api/v1/pos-products/<id>/',
      auth: 'IsAuthenticated',
      description: 'دریافت جزئیات بارکدها و خصوصیات صندوق یک کالا'
    },
    {
      method: 'PUT',
      path: '/api/v1/pos-products/<id>/update/',
      auth: 'IsAdminUser',
      description: 'ویرایش بارکدهای کارتن، باکس و پاکت و دکمه لمسی کالا'
    },
    {
      method: 'DELETE',
      path: '/api/v1/pos-products/<id>/delete/',
      auth: 'IsAdminUser',
      description: 'حذف تنظیمات صندوق یک کالا (بدون حذف اصل محصول در کاتالوگ)'
    }
  ];

  const modelsCode = `"""
pos_products/models.py
مدیریت کالاهای صندوق حضوری، میانبرهای لمسی و بارکدهای چندگانه
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from products.models import Product


class QuickCategory(models.Model):
    title_fa = models.CharField(_("عنوان دسته‌بندی سریع"), max_length=100)
    color_code = models.CharField(_("کد رنگ دکمه"), max_length=20, default="#3b82f6")
    icon_name = models.CharField(_("نام آیکون"), max_length=50, default="Coffee")
    sort_order = models.PositiveIntegerField(_("ترتیب نمایش"), default=0)
    is_active = models.BooleanField(_("فعال"), default=True)

    class Meta:
        verbose_name = _("دسته‌بندی لمسی صندوق")
        verbose_name_plural = _("۱. دسته‌بندی‌های صفحه لمسی (Touch Tiles)")
        ordering = ['sort_order', 'id']

    def __str__(self):
        return self.title_fa


class PosProductItem(models.Model):
    product = models.OneToOneField(
        Product, on_delete=models.CASCADE, related_name='pos_profile', verbose_name=_("محصول مرتبط در کاتالوگ")
    )
    quick_category = models.ForeignKey(
        QuickCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='pos_items', verbose_name=_("دسته‌بندی لمسی")
    )
    # تنظیمات اختصاصی فروشگاه حضوری (مثل ذغال بسته‌بندی، ذغال کیلویی، قهوه)
    is_pos_only = models.BooleanField(_("فقط مخصوص فروشگاه حضوری POS (مخفی در سایت آنلاین)"), default=False)
    sale_type = models.CharField(
        _("نوع فروش حضوری"), 
        max_length=20, 
        choices=[
            ('quantity', _('تعدادی / بسته‌ای / عددی')),
            ('weight', _('وزنی / کیلویی (ترازو)')),
            ('box_carton', _('باکس و کارتن'))
        ], 
        default='quantity'
    )
    unit_name = models.CharField(_("نام واحد اندازه گیری"), max_length=30, default="عدد", help_text=_("مثال: کیلوگرم، بسته، پاکت، شات"))
    price_per_unit = models.BigIntegerField(_("قیمت واحد فروش حضوری (تومان per kg/pack)"), default=0)

    barcode_carton = models.CharField(_("بارکد اسکنر کارتن"), max_length=50, blank=True, db_index=True)
    barcode_box = models.CharField(_("بارکد اسکنر باکس"), max_length=50, blank=True, db_index=True)
    barcode_pack = models.CharField(_("بارکد اسکنر پاکت / کالا"), max_length=50, blank=True, db_index=True)
    retail_pack_price = models.BigIntegerField(_("قیمت تک پاکت / بسته خرد (تومان)"), default=0)
    is_drink_coffee = models.BooleanField(_("محصول نوشیدنی / قهوه / ذغال حضوری"), default=False)
    touch_button_label = models.CharField(_("عنوان روی دکمه لمسی"), max_length=60, blank=True)
    is_featured_touch = models.BooleanField(_("نمایش در تب پرفروش‌ها"), default=False)

    class Meta:
        verbose_name = _("تنظیمات صندوق کالا")
        verbose_name_plural = _("۲. کالاهای فروشگاه حضوری و بارکدها")

    def __str__(self):
        return f"{self.product.name_fa} (بارکد/صندوق)"
`;

  const adminCode = `"""
pos_products/admin.py
پنل ادمین بارکدها و دسته‌بندی‌های لمسی صندوق
"""
from django.contrib import admin
from .models import QuickCategory, PosProductItem


@admin.register(QuickCategory)
class QuickCategoryAdmin(admin.ModelAdmin):
    list_display = ('title_fa', 'color_code', 'sort_order', 'is_active')
    list_editable = ('sort_order', 'is_active')


@admin.register(PosProductItem)
class PosProductItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'quick_category', 'barcode_box', 'retail_pack_price', 'is_drink_coffee', 'is_featured_touch')
    list_filter = ('quick_category', 'is_drink_coffee', 'is_featured_touch')
    search_fields = ('product__name_fa', 'product__sku', 'barcode_carton', 'barcode_box', 'barcode_pack')
    list_editable = ('retail_pack_price', 'is_featured_touch')
`;

  const serializersCode = `"""
pos_products/serializers.py
سریالایزرهای اسکن سریع بارکد و تاچ تایل‌های صفحه صندوق
"""
from rest_framework import serializers
from .models import QuickCategory, PosProductItem


class QuickCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuickCategory
        fields = '__all__'


class PosProductItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name_fa', read_only=True)
    price_carton = serializers.IntegerField(source='product.price_carton', read_only=True)
    price_box = serializers.IntegerField(source='product.price_box', read_only=True)
    stock_cartons = serializers.FloatField(source='product.stock_cartons', read_only=True)

    class Meta:
        model = PosProductItem
        fields = [
            'id',
            'product',
            'product_name',
            'quick_category',
            'barcode_carton',
            'barcode_box',
            'barcode_pack',
            'retail_pack_price',
            'is_drink_coffee',
            'touch_button_label',
            'is_featured_touch',
            'price_carton',
            'price_box',
            'stock_cartons'
        ]
`;

  const viewsCode = `"""
pos_products/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت بارکدها و دکمه‌های صفحه لمسی صندوق
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import QuickCategory, PosProductItem
from .serializers import QuickCategorySerializer, PosProductItemSerializer


class QuickCategoryListAPIView(APIView):
    """
    اندپوینت دریافت لیست دسته‌بندی‌های سریع صفحه لمسی صندوق
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت لیست دسته‌بندی‌های لمسی صندوق",
        responses={200: QuickCategorySerializer(many=True)}
    )
    def get(self, request):
        queryset = QuickCategory.objects.filter(is_active=True)
        serializer = QuickCategorySerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class PosProductItemListAPIView(APIView):
    """
    اندپوینت دریافت کامل لیست کالاهای فعال دارای تنظیمات صندوق
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت لیست کالاهای تنظیم‌شده برای صندوق",
        responses={200: PosProductItemSerializer(many=True)}
    )
    def get(self, request):
        queryset = PosProductItem.objects.select_related('product', 'quick_category').all()
        serializer = PosProductItemSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class PosProductItemCreateAPIView(APIView):
    """
    اندپوینت افزودن بارکدها و تنظیمات صندوق برای یک کالا (ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ثبت بارکدها و خصوصیات صندوق برای کالا (ادمین)",
        request_body=PosProductItemSerializer,
        responses={201: PosProductItemSerializer}
    )
    def post(self, request):
        serializer = PosProductItemSerializer(data=request.data)
        if serializer.is_valid():
            item = serializer.save()
            return Response({
                'status': 'success',
                'message': 'تنظیمات صندوق برای کالا با موفقیت ثبت شد.',
                'data': PosProductItemSerializer(item).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PosProductItemDetailAPIView(APIView):
    """
    اندپوینت دریافت جزئیات تنظیمات صندوق یک کالا بر اساس ID
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات بارکدها و خصوصیات صندوق یک کالا",
        responses={200: PosProductItemSerializer}
    )
    def get(self, request, pk):
        item = get_object_or_404(PosProductItem, pk=pk)
        serializer = PosProductItemSerializer(item)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class PosProductItemUpdateAPIView(APIView):
    """
    اندپوینت ویرایش بارکدها و قیمت فروش خرد تک پاکت (ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ویرایش بارکدها و خصوصیات صندوق کالا",
        request_body=PosProductItemSerializer,
        responses={200: PosProductItemSerializer}
    )
    def put(self, request, pk):
        item = get_object_or_404(PosProductItem, pk=pk)
        serializer = PosProductItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'تنظیمات صندوق کالا بروزرسانی شد.',
                'data': PosProductItemSerializer(updated).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PosProductItemDeleteAPIView(APIView):
    """
    اندپوینت حذف تنظیمات صندوق یک کالا (ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="حذف تنظیمات صندوق کالا (ادمین)",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def delete(self, request, pk):
        item = get_object_or_404(PosProductItem, pk=pk)
        item.delete()
        return Response({
            'status': 'success',
            'message': 'تنظیمات صندوق کالا حذف گردید.'
        }, status=status.HTTP_200_OK)


class ScanBarcodeAPIView(APIView):
    """
    اندپوینت اسکن بارکدخوان فیزیکی و تشخیص اتوماتیک کالا و واحد خرید (کارتن، باکس، پاکت)
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="اسکن بارکد و تشخیص خودکار واحد فروش و قیمت",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def post(self, request):
        barcode = request.data.get('barcode', '').strip()
        if not barcode:
            return Response({'error': 'بارکد الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

        item = PosProductItem.objects.filter(barcode_carton=barcode).first()
        unit = 'carton'
        
        if not item:
            item = PosProductItem.objects.filter(barcode_box=barcode).first()
            unit = 'box'
            
        if not item:
            item = PosProductItem.objects.filter(barcode_pack=barcode).first()
            unit = 'pack'

        if not item:
            return Response({'status': 'error', 'found': False, 'message': 'کالایی با این بارکد یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        price = item.product.price_carton if unit == 'carton' else (item.product.price_box if unit == 'box' else item.retail_pack_price)

        return Response({
            'status': 'success',
            'found': True,
            'product_id': item.product.id,
            'name': item.product.name_fa,
            'unit': unit,
            'unit_price': price,
            'stock': item.product.stock_cartons
        }, status=status.HTTP_200_OK)


class TouchTilesAPIView(APIView):
    """
    اندپوینت دریافت ساختار دکمه‌های سریع مانیتور لمسی صندوق‌دار بر اساس دسته‌بندی‌ها
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت ساختار دکمه‌های سریع صفحه لمسی صندوق",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def get(self, request):
        categories = QuickCategory.objects.filter(is_active=True).prefetch_related('pos_items__product')
        result = []
        for cat in categories:
            items_data = []
            for pos_item in cat.pos_items.all():
                p = pos_item.product
                items_data.append({
                    'id': p.id,
                    'name': pos_item.touch_button_label or p.name_fa,
                    'price_carton': p.price_carton,
                    'price_box': p.price_box,
                    'price_pack': pos_item.retail_pack_price,
                    'is_drink': pos_item.is_drink_coffee,
                    'stock': p.stock_cartons
                })
            result.append({
                'id': cat.id,
                'title': cat.title_fa,
                'color': cat.color_code,
                'items': items_data
            })
        return Response({
            'status': 'success',
            'categories': result
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
pos_products/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    QuickCategoryListAPIView,
    PosProductItemListAPIView,
    PosProductItemCreateAPIView,
    PosProductItemDetailAPIView,
    PosProductItemUpdateAPIView,
    PosProductItemDeleteAPIView,
    ScanBarcodeAPIView,
    TouchTilesAPIView,
)

app_name = 'pos_products'

urlpatterns = [
    # ۱. اسکن بارکد و تشخیص خودکار واحد کالا
    path('scan-barcode/', ScanBarcodeAPIView.as_view(), name='scan-barcode'),

    # ۲. ساختار دکمه‌های صفحه لمسی صندوق‌دار
    path('touch-tiles/', TouchTilesAPIView.as_view(), name='touch-tiles'),

    # ۳. لیست دسته‌بندی‌های سریع
    path('quick-categories/', QuickCategoryListAPIView.as_view(), name='quick-categories-list'),

    # ۴. لیست کلیه کالاهای تنظیم‌شده برای صندوق
    path('list/', PosProductItemListAPIView.as_view(), name='pos-item-list'),

    # ۵. تعریف خصوصیات صندوق برای کالا (ادمین)
    path('create/', PosProductItemCreateAPIView.as_view(), name='pos-item-create'),

    # ۶. جزئیات تنظیمات صندوق یک کالا
    path('<int:pk>/', PosProductItemDetailAPIView.as_view(), name='pos-item-detail'),

    # ۷. ویرایش بارکدها و قیمت تک پاکت کالا
    path('<int:pk>/update/', PosProductItemUpdateAPIView.as_view(), name='pos-item-update'),

    # ۸. حذف تنظیمات صندوق کالا
    path('<int:pk>/delete/', PosProductItemDeleteAPIView.as_view(), name='pos-item-delete'),
]
`;

  const notesCode = `## 📌 پاسخ جامع به سوال معماری محصولات در صندوق و فروشگاه اینترنتی

### ❓ آیا از این اپلیکیشن (pos_products) می‌توان محصول جدید به صندوق و فروشگاه آنلاین اضافه کرد؟
**جواب کوتاه:** اصل کالا در اپلیکیشن **\`products\`** ایجاد می‌شود، اما خصوصیات فروش حضوری صندوق (بارکدها، تک پاکت و دکمه تاچ) در این اپلیکیشن (\`pos_products\`) تنظیم می‌گردد.

---

### 🏗️ معماری یکپارچه محصولات آنلاین + صندوق حضوری (Unified Product Architecture)

در این سیستم، الگوی **Single Source of Truth (تنها مرجع ثبت کالا)** پیاده‌سازی شده است:

1. **مرجع اصلی کالا (\`products.Product\`):**
   * تمامی کالاها (نام فارسی/انگلیسی، برند، دسته اصلی، قیمت عمده کارتن، قیمت عمده باکس، تصویر و موجودی انبار کل) در اپلیکیشن **\`products\`** ثبت می‌شوند.
   * **فروشگاه اینترنتی (سایت آنلاین):** محصولات را مستقیماً از اپلیکیشن \`products\` به مشتریان نمایش می‌دهد.

2. **تنظیمات تکمیلی صندوق حضوری (\`pos_products.PosProductItem\`):**
   * این مدل دارای رابطه یک‌به‌یک (\`OneToOneField\`) با محصول کاتالوگ است.
   * وظیفه این اپ تعریف ویژگی‌های مخصوص فروشگاه حضوری است:
     * **اسکن ۳ بارکد فیزیکی:** بارکد کارتن، بارکد باکس و بارکد تک پاکت.
     * **قیمت‌گذاری فروش خرد:** قیمت فروش تک پاکت (\`retail_pack_price\`).
     * **دکمه‌های تاچ اسکرین:** تعریف رنگ، آیکون و گروه‌بندی در دکمه‌های سریع مانیتور لمسی صندوق (\`QuickCategory\`).
     * **خدمات حضوری:** ثبت سفارش‌های نوشیدنی و قهوه (\`is_drink_coffee\`).

---

### 🔄 همگام‌سازی اتوماتیک موجودی (Real-time Stock Synchronization)
* هنگامی که مشتری **اینترنتی** خریدی انجام می‌دهد (\`orders\`) یا صندوق‌دار **حضوری** بارکدی را اسکن کرده و فاکتور می‌زند (\`pos\`)، هر دو سفارش به صورت اتمیک موجودی همان محصول اصلی در **\`products\`** را کسر می‌کنند.
* این معماری مانع از ایجاد مغایرت موجودی بین فروش حضوری و آنلاین می‌گردد.
`;

  return (
    <AppDocTemplate
      appFolder="pos_products"
      title="محصولات فروشگاه حضوری و بارکدها"
      titleEn="pos_products / POS Products & Fast Barcodes"
      badge="Barcodes • Touch Tiles • Retail Catalog APIView"
      description="ماژول مدیریت دکمه‌های سریع مانیتور لمسی صندوق‌دار، بارکدهای چندسطحی (کارتن/باکس/پاکت)، و پشتیبانی از فروش نوشیدنی و قهوه حضوری. این اپلیکیشن بر پایه APIView صریح (دقیقاً مشابه الگوی regular_customers بدون ViewSet) پیاده‌سازی شده است."
      icon={<Package className="w-6 h-6 text-amber-500" />}
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
