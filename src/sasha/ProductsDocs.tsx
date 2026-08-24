import React, { useState } from 'react';
import { Package, Copy, Check, FileCode, Sparkles, Image, DollarSign, Layers } from 'lucide-react';
import { CodeTab } from './types';

export const ProductsDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelsCode = `"""
products/models.py
مدل محصولات با نرخ کارتن و باکس، گالری تصاویر، موجودی انبار، و توضیحات غنی با ویرایشگر TinyMCE
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField
from categories.models import Category


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('دسته‌بندی کالا')
    )
    name = models.CharField(_('نام کامل کالا (فارسی)'), max_length=200)
    name_en = models.CharField(_('نام انگلیسی / کد برند'), max_length=200, blank=True, null=True)
    slug = models.SlugField(_('اسلاگ یکتا'), max_length=220, unique=True, allow_unicode=True)
    sku = models.CharField(_('کد انبارداری (SKU)'), max_length=50, unique=True, db_index=True)
    brand = models.CharField(_('برند سازنده'), max_length=100, db_index=True)
    origin_country = models.CharField(_('کشور مبدا / کارخانه'), max_length=100, default='سوئیس')

    # مشخصات فیزیکی و بسته‌بندی
    boxes_per_carton = models.PositiveIntegerField(_('تعداد باکس در هر کارتن'), default=50)
    packs_per_box = models.PositiveIntegerField(_('تعداد پاکت در هر باکس'), default=10)
    tar_level = models.DecimalField(_('میزان قطران (میلی‌گرم)'), max_digits=4, decimal_places=1, blank=True, null=True)
    nicotine_level = models.DecimalField(_('میزان نیکوتین (میلی‌گرم)'), max_digits=4, decimal_places=2, blank=True, null=True)
    flavor = models.CharField(_('طعم / اسانس / فلیور'), max_length=100, blank=True, null=True)

    # قیمت‌گذاری و ارز
    price_carton_toman = models.DecimalField(_('قیمت هر کارتن (تومان)'), max_digits=12, decimal_places=0)
    price_box_toman = models.DecimalField(_('قیمت هر باکس (تومان)'), max_digits=12, decimal_places=0)
    base_usd_rate = models.DecimalField(_('نرخ مبنای دلاری (جهت فرمول محاسبه)'), max_digits=10, decimal_places=2, default=0)

    # وضعیت انبار
    stock_cartons = models.PositiveIntegerField(_('موجودی کارتن در انبار جنت‌آباد'), default=100)
    min_order_cartons = models.PositiveIntegerField(_('حداقل سفارش کارتن'), default=1)
    is_available = models.BooleanField(_('موجود در انبار'), default=True)
    is_featured = models.BooleanField(_('نمایش در بخش کالاهای پرفروش'), default=False)

    # توضیحات کامل و تخصصی با ویرایشگر TinyMCE
    short_description = models.TextField(_('معرفی کوتاه کالا'), blank=True, null=True)
    full_review_html = HTMLField(_('نقد و بررسی کامل تخصصی (ویرایشگر TinyMCE)'), blank=True, null=True)

    # تصاویر
    main_image = models.ImageField(_('تصویر اصلی کالا'), upload_to='products/main/')
    created_at = models.DateTimeField(_('تاریخ ثبت در انبار'), auto_now_add=True)
    updated_at = models.DateTimeField(_('آخرین بروزرسانی قیمت'), auto_now=True)

    class Meta:
        verbose_name = _('محصول عمده')
        verbose_name_plural = _('کاتالوگ و انبار محصولات')
        ordering = ['-is_featured', '-updated_at']

    def __str__(self):
        return f"{self.name} - {self.brand} (کد: {self.sku})"


class ProductImage(models.Model):
    """گالری تصاویر چندگانه برای هر محصول"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery_images', verbose_name=_('محصول'))
    image = models.ImageField(_('فایل تصویر'), upload_to='products/gallery/')
    alt_text = models.CharField(_('متن جایگزین (Alt)'), max_length=150, blank=True, null=True)
    order = models.PositiveIntegerField(_('ترتیب'), default=0)

    class Meta:
        verbose_name = _('تصویر گالری')
        verbose_name_plural = _('گالری تصاویر محصول')
        ordering = ['order']
`;

  const adminCode = `"""
products/admin.py
مدیریت محصولات در پنل ادمین جنگو همراه با ویرایشگر TinyMCE و اینلاین تصاویر
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3
    fields = ('image', 'alt_text', 'order')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'brand', 'category', 'price_carton_toman',
        'price_box_toman', 'stock_cartons', 'is_available', 'is_featured', 'updated_at'
    )
    list_filter = ('category', 'brand', 'origin_country', 'is_available', 'is_featured')
    search_fields = ('name', 'name_en', 'sku', 'brand', 'flavor')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('price_carton_toman', 'price_box_toman', 'stock_cartons', 'is_available', 'is_featured')
    inlines = [ProductImageInline]

    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('category', 'name', 'name_en', 'slug', 'sku', 'brand', 'origin_country', 'main_image')
        }),
        (_('قیمت‌گذاری عمده (تومان)'), {
            'fields': ('price_carton_toman', 'price_box_toman', 'base_usd_rate')
        }),
        (_('انبارداری و موجودی'), {
            'fields': ('stock_cartons', 'min_order_cartons', 'boxes_per_carton', 'packs_per_box', 'is_available', 'is_featured')
        }),
        (_('مشخصات فنی دخانیات'), {
            'fields': ('tar_level', 'nicotine_level', 'flavor')
        }),
        (_('توضیحات و نقد تخصصی با TinyMCE'), {
            'fields': ('short_description', 'full_review_html')
        }),
    )
`;

  const serializersCode = `"""
products/serializers.py
سریالایزرهای DRF برای کاتالوگ، جستجو و جزئیات محصول
"""

from rest_framework import serializers
from .models import Product, ProductImage
from categories.serializers import CategorySerializer


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'order']


class ProductListSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(source='category.title', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'name_en', 'slug', 'sku', 'brand',
            'category', 'category_title', 'price_carton_toman',
            'price_box_toman', 'boxes_per_carton', 'stock_cartons',
            'is_available', 'is_featured', 'main_image', 'origin_country'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    gallery_images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'name_en', 'slug', 'sku', 'brand',
            'origin_country', 'boxes_per_carton', 'packs_per_box',
            'tar_level', 'nicotine_level', 'flavor',
            'price_carton_toman', 'price_box_toman', 'base_usd_rate',
            'stock_cartons', 'min_order_cartons', 'is_available',
            'is_featured', 'short_description', 'full_review_html',
            'main_image', 'gallery_images', 'created_at', 'updated_at'
        ]
`;

  const viewsCode = `"""
products/views.py
ویوهای API جنگو با پشتیبانی از فیلتر دسته‌بندی، برند، محدوده قیمت و جستجو در Swagger
"""

from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Product
from .serializers import ProductListSerializer, ProductDetailSerializer


class ProductListAPIView(generics.ListAPIView):
    """
    دریافت لیست محصولات با امکان فیلتر و جستجوی پیشرفته
    """
    queryset = Product.objects.filter(is_available=True).select_related('category')
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'origin_country', 'is_featured']
    search_fields = ['name', 'name_en', 'sku', 'brand', 'flavor']
    ordering_fields = ['price_carton_toman', 'stock_cartons', 'updated_at']

    @swagger_auto_schema(
        operation_description="دریافت لیست محصولات کاتالوگ با قابلیت فیلتر بر اساس برند، دسته‌بندی و قیمت",
        responses={200: ProductListSerializer(many=True)},
        tags=["محصولات و کاتالوگ"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ProductDetailAPIView(generics.RetrieveAPIView):
    """
    دریافت جزئیات کامل محصول شامل محتوای HTML ویرایشگر TinyMCE و گالری
    """
    queryset = Product.objects.all().prefetch_related('gallery_images')
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="دریافت جزئیات تخصصی محصول بر اساس اسلاگ یکتا",
        responses={200: ProductDetailSerializer},
        tags=["محصولات و کاتالوگ"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
`;

  const urlsCode = `"""
products/urls.py
مسیرهای روت برای اپلیکیشن محصولات
"""

from django.urls import path
from .views import ProductListAPIView, ProductDetailAPIView

app_name = 'products'

urlpatterns = [
    path('', ProductListAPIView.as_view(), name='product_list'),
    path('<slug:slug>/', ProductDetailAPIView.as_view(), name='product_detail'),
]
`;

  return (
    <div className="space-y-6 text-slate-800 text-right" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">اپلیکیشن محصولات (products)</div>
            <h1 className="text-2xl font-black text-slate-900">
              مدل جامع محصولات، نرخ کارتن و باکس، فیلد TinyMCE و گالری تصاویر
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          محصولات شامل قیمت‌گذاری دوگانه (کارتن و باکس)، مشخصات فنی نیکوتین و قطران، ویرایشگر نقد تخصصی با TinyMCE و فیلترهای جستجوی سریع است.
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
            products/{activeTab === 'models' ? 'models.py' : activeTab === 'admin' ? 'admin.py' : activeTab === 'serializers' ? 'serializers.py' : activeTab === 'views' ? 'views.py' : 'urls.py'}
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
