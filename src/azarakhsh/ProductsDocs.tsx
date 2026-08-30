import React from 'react';
import { Package } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const ProductsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'products_product',
      verboseName: 'جدول کاتالوگ محصولات دخانیات',
      description: 'کاتالوگ جامع کالاها شامل قیمت کارتن، باکس، نرخ ارز و ادیتور TinyMCE',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'name', type: 'CharField(max_length=200)', verbose: 'نام کامل کالا' },
        { name: 'slug', type: 'SlugField(max_length=220)', isUnique: true, verbose: 'اسلاگ فارسی سئو' },
        { name: 'brand', type: 'CharField(max_length=100)', verbose: 'برند (وینستون، کنت، مارلبرو)' },
        { name: 'category_id', type: 'ForeignKey', isFk: true, fkTarget: 'categories_category', verbose: 'دسته‌بندی مربوطه' },
        { name: 'hologram_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_producthologram', verbose: 'هولوگرام و اصالت کالا' },
        { name: 'box_price', type: 'DecimalField(max_digits=12)', verbose: 'قیمت هر باکس (تومان)' },
        { name: 'boxes_per_carton', type: 'PositiveIntegerField(default=50)', verbose: 'تعداد باکس در هر کارتن' },
        { name: 'carton_price', type: 'DecimalField(max_digits=14)', verbose: 'قیمت هر کارتن (تومان محاسبه خودکار)' },
        { name: 'stock_cartons', type: 'PositiveIntegerField(default=0)', verbose: 'موجودی انبار (کارتن)' },
        { name: 'image', type: 'ImageField', verbose: 'تصویر شاخص' },
        { name: 'full_description', type: 'HTMLField(TinyMCE)', verbose: 'توضیحات غنی با ادیتور TinyMCE' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'فعال جهت سفارش' },
        { name: 'is_featured', type: 'BooleanField(default=False)', verbose: 'پیشنهاد ویژه' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت' },
      ]
    },
    {
      name: 'products_productimage',
      verboseName: 'تصاویر گالری کالا',
      description: 'گالری چندگانه تصاویر کالا با کیفیت بالا',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'product_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_product', verbose: 'محصول مربوطه' },
        { name: 'image', type: 'ImageField', verbose: 'فایل تصویر' },
        { name: 'order', type: 'PositiveIntegerField(default=0)', verbose: 'ترتیب نمایش' },
      ]
    },
    {
      name: 'products_producthologram',
      verboseName: 'اصالت کالا و هولوگرام اختصاصی (Product Authenticity)',
      description: 'تعریف برچسب‌های ضمانت اصالت کالا (اورجینال اروپایی، سفارش دبی، شرکتی اصل، تولید داخل، بدون هولوگرام)',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'title', type: 'CharField(max_length=100)', verbose: 'عنوان اصالت و هولوگرام' },
        { name: 'badge_color', type: 'CharField(max_length=30)', verbose: 'رنگ لیبل نمایشی (مثلاً: #10b981)' },
        { name: 'is_verified', type: 'BooleanField(default=True)', verbose: 'دارای استعلام اصالت بارکد' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت هولوگرام' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/products/list/',
      auth: 'AllowAny',
      description: 'فهرست محصولات با فیلتر دسته‌بندی، برند و جستجوی متنی',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/products/list/?brand=وینستون"`,
      responseBody: `{
  "status": "success",
  "count": 1,
  "results": [
    {
      "id": 1,
      "name": "وینستون لایت نقره‌ای (کارتن ۵۰ باکسی)",
      "slug": "winston-light",
      "brand": "وینستون (Winston)",
      "category": 2,
      "category_name": "سیگار وارداتی",
      "box_price": 680000,
      "boxes_per_carton": 50,
      "carton_price": 34000000,
      "stock_cartons": 180,
      "image": "/media/products/winston_light.webp",
      "gallery": [],
      "is_active": true,
      "is_featured": true,
      "created_at": "2026-01-10T08:00:00Z"
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/api/v1/products/featured/',
      auth: 'AllowAny',
      description: 'دریافت لیست کالاهای پیشنهاد ویژه جهت نمایش در صفحه اصلی فرانت‌اند',
      curlExample: `curl -X GET http://localhost:8000/api/v1/products/featured/`
    },
    {
      method: 'POST',
      path: '/api/v1/products/create/',
      auth: 'IsAdminUser',
      description: 'افزودن محصول جدید به کاتالوگ توسط مدیریت سیستم',
      curlExample: `curl -X POST http://localhost:8000/api/v1/products/create/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "کنت پاور 8", "slug": "kent-power-8", "brand": "کنت", "category": 1, "box_price": 550000, "boxes_per_carton": 50, "stock_cartons": 100}'`,
      responseBody: `{
  "status": "success",
  "message": "محصول جدید با موفقیت به کاتالوگ اضافه گردید.",
  "data": {
    "id": 12,
    "name": "کنت پاور 8",
    "box_price": 550000,
    "carton_price": 27500000
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/products/<id>/',
      auth: 'AllowAny',
      description: 'مشاهده جزئیات کامل کالا، متن TinyMCE، گالری تصاویر و مشخصات فنی'
    },
    {
      method: 'PUT',
      path: '/api/v1/products/<id>/update/',
      auth: 'IsAdminUser',
      description: 'ویرایش مشخصات، نرخ باکس/کارتن و موجودی کالا توسط مدیریت'
    },
    {
      method: 'GET',
      path: '/api/v1/holograms/',
      auth: 'AllowAny',
      description: 'دریافت لیست هولوگرام‌ها و عناوین اصالت کالا (اورجینال اروپایی، سفارش دبی، شرکتی اصل و غیره)',
      curlExample: `curl -X GET "http://localhost:8000/api/v1/holograms/"`,
      responseBody: JSON.stringify({
        status: "success",
        count: 4,
        results: [
          { id: 1, title: "اورجینال اروپایی با بارکد اصالت", badge_color: "#10b981", is_verified: true },
          { id: 2, title: "سفارش دبی (سفارشی امارات)", badge_color: "#3b82f6", is_verified: true },
          { id: 3, title: "شرکتی اصل انحصاری", badge_color: "#8b5cf6", is_verified: true },
          { id: 4, title: "بدون هولوگرام (اقتصادی)", badge_color: "#64748b", is_verified: false }
        ]
      }, null, 2)
    },
    {
      method: 'POST',
      path: '/api/v1/holograms/create/',
      auth: 'IsAdminUser',
      description: 'ثبت هولوگرام و نوع اصالت جدید مستقیم در دیتابیس',
      curlExample: `curl -X POST "http://localhost:8000/api/v1/holograms/create/" \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "اورجینال سوئیس با لبل اصالت", "badge_color": "#06b6d4"}'`
    },
    {
      method: 'DELETE',
      path: '/api/v1/products/<id>/delete/',
      auth: 'IsAdminUser',
      description: 'حذف یک محصول از کاتالوگ توسط مدیریت سیستم'
    }
  ];

  const modelsCode = `"""
products/models.py
مدل کاتالوگ محصولات دخانیات، اصالت هولوگرام، گالری تصاویر، قیمت کارتن/باکس و توضیحات غنی TinyMCE
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField
from categories.models import Category


class ProductHologram(models.Model):
    """
    مدل تعریف برچسب‌های ضمانت اصالت کالا و هولوگرام اختصاصی
    """
    title = models.CharField(_("عنوان اصالت و هولوگرام"), max_length=100)
    badge_color = models.CharField(_("رنگ لیبل نمایشی"), max_length=30, default="#10b981")
    is_verified = models.BooleanField(_("دارای استعلام اصالت بارکد"), default=True)
    created_at = models.DateTimeField(_("تاریخ ثبت هولوگرام"), auto_now_add=True)

    class Meta:
        verbose_name = _("هولوگرام و اصالت")
        verbose_name_plural = _("هولوگرام‌های اصالت کالا")
        ordering = ['created_at']

    def __str__(self):
        return self.title


class Product(models.Model):
    """
    مدل اصلی محصولات دخانیات با قیمت‌گذاری دوگانه (باکس و کارتن)، توضیحات غنی و اصالت هولوگرام
    """
    name = models.CharField(_("نام کالا"), max_length=200)
    slug = models.SlugField(_("اسلاگ سئو (URL)"), max_length=220, unique=True, allow_unicode=True)
    brand = models.CharField(_("برند کالا"), max_length=100)
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='products',
        verbose_name=_("دسته‌بندی")
    )
    hologram = models.ForeignKey(
        ProductHologram,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name=_("هولوگرام اصالت")
    )
    box_price = models.DecimalField(_("قیمت هر باکس (تومان)"), max_digits=12, decimal_places=0)
    boxes_per_carton = models.PositiveIntegerField(_("تعداد باکس در هر کارتن"), default=50)
    carton_price = models.DecimalField(_("قیمت هر کارتن (تومان)"), max_digits=14, decimal_places=0, blank=True, null=True)
    stock_cartons = models.PositiveIntegerField(_("موجودی انبار (کارتن)"), default=0)
    image = models.ImageField(_("تصویر شاخص"), upload_to='products/', blank=True, null=True)
    full_description = HTMLField(_("توضیحات غنی (TinyMCE)"), blank=True, null=True)
    is_active = models.BooleanField(_("فعال جهت سفارش"), default=True)
    is_featured = models.BooleanField(_("پیشنهاد ویژه"), default=False)
    created_at = models.DateTimeField(_("تاریخ ثبت"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("محصول")
        verbose_name_plural = _("مدیریت کاتالوگ کالاها")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.brand})"

    def save(self, *args, **kwargs):
        # محاسبه خودکار قیمت کارتن بر اساس قیمت هر باکس
        if self.box_price and self.boxes_per_carton:
            self.carton_price = self.box_price * self.boxes_per_carton
        super().save(*args, **kwargs)


class ProductImage(models.Model):
    """
    گالری چندگانه تصاویر کالا
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery', verbose_name=_("محصول"))
    image = models.ImageField(_("تصویر گالری"), upload_to='products/gallery/')
    order = models.PositiveIntegerField(_("ترتیب نمایش"), default=0)

    class Meta:
        verbose_name = _("تصویر گالری")
        verbose_name_plural = _("گالری تصاویر کالا")
        ordering = ['order']
`;

  const adminCode = `"""
products/admin.py
پنل مدیریت کاتالوگ کالاها همراه با نمایش گالری تصاویر و فیلترهای پیشرفته و هولوگرام‌های اصالت
"""

from django.contrib import admin
from .models import Product, ProductImage, ProductHologram


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3


@admin.register(ProductHologram)
class ProductHologramAdmin(admin.ModelAdmin):
    list_display = ('title', 'badge_color', 'is_verified', 'created_at')
    list_filter = ('is_verified',)
    search_fields = ('title',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'hologram', 'box_price', 'carton_price', 'stock_cartons', 'is_active', 'is_featured')
    list_filter = ('is_active', 'is_featured', 'category', 'brand', 'hologram')
    search_fields = ('name', 'brand', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    list_editable = ('is_active', 'is_featured', 'stock_cartons', 'hologram')
`;

  const serializersCode = `"""
products/serializers.py
سریالایزرهای DRF برای تبدیل داده‌های کاتالوگ محصولات، اصالت هولوگرام، گالری و ثبت/ویرایش
"""

from rest_framework import serializers
from .models import Product, ProductImage, ProductHologram
from categories.serializers import CategoryDetailSerializer


class ProductHologramSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductHologram
        fields = ['id', 'title', 'badge_color', 'is_verified', 'created_at']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'order']


class ProductSerializer(serializers.ModelSerializer):
    """
    سریالایزر دریافت لیست محصولات با اطلاعات دسته، هولوگرام و گالری
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'brand',
            'category',
            'category_name',
            'hologram',
            'hologram_detail',
            'box_price',
            'boxes_per_carton',
            'carton_price',
            'stock_cartons',
            'image',
            'gallery',
            'is_active',
            'is_featured',
            'created_at'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    سریالایزر نمایش جزئیات کامل محصول شامل متن TinyMCE و هولوگرام
    """
    category_detail = CategoryDetailSerializer(source='category', read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'brand',
            'category',
            'category_detail',
            'hologram',
            'hologram_detail',
            'box_price',
            'boxes_per_carton',
            'carton_price',
            'stock_cartons',
            'image',
            'gallery',
            'full_description',
            'is_active',
            'is_featured',
            'created_at',
            'updated_at'
        ]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    سریالایزر ایجاد و ویرایش داده‌های کالا با احتساب کلید خارجی هولوگرام اصالت کالا
    """
    class Meta:
        model = Product
        fields = [
            'name',
            'slug',
            'brand',
            'category',
            'hologram',
            'box_price',
            'boxes_per_carton',
            'stock_cartons',
            'image',
            'full_description',
            'is_active',
            'is_featured'
        ]
`;

  const viewsCode = `"""
products/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت کاتالوگ محصولات و اصالت هولوگرام کالاها
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema

from .models import Product, ProductImage, ProductHologram
from .serializers import (
    ProductSerializer, 
    ProductDetailSerializer, 
    ProductCreateUpdateSerializer,
    ProductHologramSerializer
)


class ProductListAPIView(APIView):
    """
    اندپوینت دریافت لیست کلیه محصولات با قابلیت فیلتر بر اساس برند، دسته‌بندی و جستجو
    توضیحات: این ویو صریح، لیست محصولات فعال را بازگردانده و فیلترهای کوئری پارامتر را اعمال می‌کند.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست محصولات (عمومی)",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.filter(is_active=True).select_related('category', 'hologram').prefetch_related('gallery')

        # فیلتر بر اساس برند
        brand = request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand__icontains=brand)

        # فیلتر بر اساس دسته‌بندی
        category_id = request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # جستجو در نام و اسلاگ
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        serializer = ProductSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class ProductFeaturedAPIView(APIView):
    """
    اندپوینت دریافت لیست محصولات پیشنهاد ویژه (Featured Products)
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت محصولات پیشنهاد ویژه صفحه اصلی",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.filter(is_active=True, is_featured=True).select_related('category')
        serializer = ProductSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class ProductCreateAPIView(APIView):
    """
    اندپوینت افزودن کاتالوگ کالا جدید (مخصوص مدیریت و ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ثبت محصول جدید در کاتالوگ (مدیریت)",
        request_body=ProductCreateUpdateSerializer,
        responses={201: ProductSerializer}
    )
    def post(self, request):
        serializer = ProductCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            return Response({
                'status': 'success',
                'message': 'محصول جدید با موفقیت به کاتالوگ اضافه گردید.',
                'data': ProductSerializer(product).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailAPIView(APIView):
    """
    اندپوینت مشاهده جزئیات کامل کالا شامل شرح غنی TinyMCE و گالری
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="مشاهده جزئیات محصول و متن TinyMCE",
        responses={200: ProductDetailSerializer}
    )
    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductDetailSerializer(product)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class ProductUpdateAPIView(APIView):
    """
    اندپوینت ویرایش مشخصات و موجودی محصول (مخصوص مدیریت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ویرایش مشخصات کالا و قیمت (مدیریت)",
        request_body=ProductCreateUpdateSerializer,
        responses={200: ProductSerializer}
    )
    def put(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            updated_product = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات کالا و نرخ‌ها با موفقیت بروزرسانی شد.',
                'data': ProductSerializer(updated_product).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDeleteAPIView(APIView):
    """
    اندپوینت حذف کالا از سیستم (مخصوص مدیریت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="حذف کالا از کاتالوگ (مدیریت)",
        responses={200: dict}
    )
    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response({
            'status': 'success',
            'message': 'محصول مورد نظر با موفقیت از کاتالوگ حذف گردید.'
        }, status=status.HTTP_200_OK)


class ProductHologramListCreateAPIView(APIView):
    """
    اندپوینت دریافت لیست هولوگرام‌ها و اصالت کالاها و همچنین ثبت هولوگرام جدید (مخصوص ادمین)
    """
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت لیست هولوگرام‌های اصالت کالا",
        responses={200: ProductHologramSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProductHologram.objects.all()
        serializer = ProductHologramSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ثبت هولوگرام و نوع اصالت جدید (مدیریت)",
        request_body=ProductHologramSerializer,
        responses={201: ProductHologramSerializer}
    )
    def post(self, request):
        serializer = ProductHologramSerializer(data=request.data)
        if serializer.is_valid():
            hologram = serializer.save()
            return Response({
                'status': 'success',
                'message': 'برچسب هولوگرام اصالت جدید با موفقیت ذخیره گردید.',
                'data': ProductHologramSerializer(hologram).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
`;

  const urlsCode = `"""
products/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    ProductListAPIView,
    ProductFeaturedAPIView,
    ProductCreateAPIView,
    ProductDetailAPIView,
    ProductUpdateAPIView,
    ProductDeleteAPIView,
    ProductHologramListCreateAPIView,
)

app_name = 'products'

urlpatterns = [
    # ۱. دریافت لیست کاتالوگ محصولات با فیلترها
    path('list/', ProductListAPIView.as_view(), name='product-list'),

    # ۲. دریافت لیست محصولات پیشنهاد ویژه
    path('featured/', ProductFeaturedAPIView.as_view(), name='product-featured'),

    # ۳. افزودن کالا جدید (مخصوص ادمین)
    path('create/', ProductCreateAPIView.as_view(), name='product-create'),

    # ۴. مشاهده جزئیات کامل کالا
    path('<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),

    # ۵. ویرایش کالا و تغییر موجودی/نرخ
    path('<int:pk>/update/', ProductUpdateAPIView.as_view(), name='product-update'),

    # ۶. حذف کالا از کاتالوگ
    path('<int:pk>/delete/', ProductDeleteAPIView.as_view(), name='product-delete'),

    # ۷. دریافت و ایجاد هولوگرام‌های اصالت کالا
    path('holograms/', ProductHologramListCreateAPIView.as_view(), name='hologram-list-create'),
]
`;

  const notesCode = `## 📌 راهنمای جامع کاتالوگ محصولات، اصالت کالا و ذخیره‌سازی مستقیم دیتابیس (products)

### 🛡️ ۱. ساختار اصالت کالا و برچسب‌های هولوگرام (Hologram Authenticity):
در فروش عمده دخانیات، اصالت و منشأ تولید کالا (کشور سازنده، لبل بهداشت، سفارش دبی یا اورجینال سوئیس) متغیر اصلی اعتماد خریداران است.
* **ثبت مستقیم هولوگرام در دیتابیس:** انواع هولوگرام‌های اصالت کالا از طریق اندپوینت \`POST /api/v1/holograms/create/\` در دیتابیس ذخیره شده و روی کارت محصول رندر می‌گردند.
* **عناوین هولوگرام پشتیبانی‌شده:** اورجینال اروپایی با بارکد اصالت، سفارش دبی (سفارشی امارات)، شرکتی اصل انحصاری، تولید داخل، بدون هولوگرام (اقتصادی).

---

### 💵 ۲. محاسبه دوگانه قیمت (باکس و کارتن):
قیمت هر کارتن به طور اتوماتیک بر اساس قیمت باکس و ضریب تعداد در متد \`save()\` مدل دیتابیس محاسبه می‌شود.

---

### 💻 ۳. نحوه ایجاد هولوگرام جدید و ارسال محصول در فرانت‌اند React:
\`\`\`typescript
// ثبت هولوگرام اصالت جدید مستقیم در دیتابیس پشتیبانی
export const createHologramInBackend = async (hologramTitle: string) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/v1/holograms/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      title: hologramTitle,
      badge_color: '#10b981',
      is_verified: true
    })
  });
  return await response.json();
};
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="products"
      title="۷. اپلیکیشن کاتالوگ محصولات، اصالت و هولوگرام"
      titleEn="products / Product Catalog & Hologram Authenticity App"
      badge="Authenticity Holograms • TinyMCE • Multi-Pricing APIView"
      description="مدیریت کامل کاتالوگ محصولات، تعیین اصالت و هولوگرام کالاها (اورجینال اروپایی، سفارش دبی، شرکتی اصل)، محاسبه هوشمند قیمت کارتن و باکس، ذخیره‌سازی مستقیم در دیتابیس و فیلترهای پیشرفته بر پایه APIView صریح."
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
