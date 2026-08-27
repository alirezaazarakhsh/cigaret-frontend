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
      name: 'pos_products_positem',
      verboseName: 'کالاهای سریع صندوق و بارکدها',
      description: 'تعریف کالاهای فروش حضوری با پشتیبانی از چند بارکد (کارتن، باکس، پاکت، شات قهوه)، دکمه لمسی سریع و قیمت‌گذاری خرد',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'product_id', type: 'ForeignKey(CigaretteProduct)', isFk: true, fkTarget: 'catalog_cigaretteproduct', verbose: 'کالای مرجع کاتالوگ' },
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
      auth: 'IsAuthenticated (Cashier)',
      description: 'دریافت ساختار دکمه‌های سریع لمسی دسته‌بندی‌شده همراه با قیمت و موجودی برای مانیتور صندوق‌دار',
      responseBody: JSON.stringify({
        categories: [
          {
            id: 1,
            title_fa: "سیگارهای پرفروش",
            color: "#ef4444",
            items: [
              { id: 101, name: "وینستون لایت کارتن", unit: "carton", price: 38500000, stock: 18 },
              { id: 102, name: "وینستون لایت باکس", unit: "box", price: 770000, stock: 900 },
              { id: 103, name: "مارلبرو گلد کارتن", unit: "carton", price: 42000000, stock: 12 }
            ]
          },
          {
            id: 2,
            title_fa: "نوشیدنی و قهوه حضوری",
            color: "#8b5cf6",
            items: [
              { id: 201, name: "اسپرسو سینگل ۱۰۰٪ عربیکا", unit: "single", price: 35000, stock: 999 },
              { id: 202, name: "اسپرسو دبل ۱۰۰٪ عربیکا", unit: "single", price: 45000, stock: 999 }
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
      requestBody: JSON.stringify({ barcode: "6260123456789" }, null, 2),
      responseBody: JSON.stringify({
        found: true,
        product_id: 1,
        name: "وینستون لایت اورجینال",
        detected_unit: "box",
        unit_price: 770000,
        stock_available: 45
      }, null, 2)
    }
  ];

  const modelsCode = `"""
pos_products/models.py
مدیریت کالاهای صندوق حضوری، میانبرهای لمسی و بارکدهای چندگانه
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from catalog.models import CigaretteProduct


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
        CigaretteProduct, on_delete=models.CASCADE, related_name='pos_profile', verbose_name=_("محصول مرتبط در کاتالوگ")
    )
    quick_category = models.ForeignKey(
        QuickCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='pos_items', verbose_name=_("دسته‌بندی لمسی")
    )
    barcode_carton = models.CharField(_("بارکد اسکنر کارتن"), max_length=50, blank=True, db_index=True)
    barcode_box = models.CharField(_("بارکد اسکنر باکس"), max_length=50, blank=True, db_index=True)
    barcode_pack = models.CharField(_("بارکد اسکنر پاکت"), max_length=50, blank=True, db_index=True)
    retail_pack_price = models.BigIntegerField(_("قیمت تک پاکت (تومان)"), default=0)
    is_drink_coffee = models.BooleanField(_("محصول نوشیدنی / قهوه"), default=False)
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
        fields = '__all__'
`;

  const viewsCode = `"""
pos_products/views.py
ویوهای اسکن بارکد و دریافت تایل‌های صفحه لمسی
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import QuickCategory, PosProductItem


class PosProductViewSet(viewsets.ModelViewSet):
    queryset = PosProductItem.objects.all()
    serializer_class = PosProductItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='scan-barcode')
    def scan_barcode(self, request):
        barcode = request.data.get('barcode', '').strip()
        if not barcode:
            return Response({'error': 'بارکد الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

        # جستجو در بارکدهای کارتن، باکس و پاکت
        item = PosProductItem.objects.filter(barcode_carton=barcode).first()
        unit = 'carton'
        
        if not item:
            item = PosProductItem.objects.filter(barcode_box=barcode).first()
            unit = 'box'
            
        if not item:
            item = PosProductItem.objects.filter(barcode_pack=barcode).first()
            unit = 'pack'

        if not item:
            return Response({'found': False, 'message': 'کالایی با این بارکد یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        price = item.product.price_carton if unit == 'carton' else (item.product.price_box if unit == 'box' else item.retail_pack_price)

        return Response({
            'found': True,
            'product_id': item.product.id,
            'name': item.product.name_fa,
            'unit': unit,
            'unit_price': price,
            'stock': item.product.stock_cartons
        })

    @action(detail=False, methods=['get'], url_path='touch-tiles')
    def touch_tiles(self, request):
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
        return Response({'categories': result})
`;

  const urlsCode = `"""
pos_products/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PosProductViewSet

router = DefaultRouter()
router.register('', PosProductViewSet, basename='pos-products')

urlpatterns = [
    path('', include(router.urls)),
]
`;

  return (
    <AppDocTemplate
      appFolder="pos_products"
      title="محصولات فروشگاه حضوری و بارکدها"
      titleEn="pos_products / POS Products & Fast Barcodes"
      badge="Barcodes • Touch Tiles • Retail Catalog"
      description="ماژول مدیریت دکمه‌های سریع مانیتور لمسی صندوق‌دار، بارکدهای چندسطحی (کارتن/باکس/پاکت)، و پشتیبانی از فروش نوشیدنی و قهوه حضوری."
      icon={<Package className="w-6 h-6 text-amber-500" />}
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

