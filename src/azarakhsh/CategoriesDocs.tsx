import React from 'react';
import { Layers } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const CategoriesDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'categories_category',
      verboseName: 'جدول دسته‌بندی‌های کالا (درختی)',
      description: 'ساختار درختی دسته‌بندی‌ها با ارجاع به خود (Self-Referencing ForeignKey) برای مدیریت زیرمجموعه‌ها و اسلاگ فارسی سئو',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'name', type: 'CharField(max_length=120)', verbose: 'نام دسته‌بندی' },
        { name: 'slug', type: 'SlugField(max_length=150)', isUnique: true, verbose: 'اسلاگ یونیکد فارسی سئو' },
        { name: 'parent_id', type: 'ForeignKey(self)', isFk: true, fkTarget: 'categories_category', verbose: 'دسته مادر (والد)' },
        { name: 'icon_name', type: 'CharField(max_length=50)', verbose: 'نام آیکون Lucide' },
        { name: 'image', type: 'ImageField', verbose: 'تصویر شاخص دسته‌بندی' },
        { name: 'description', type: 'TextField', verbose: 'توضیحات دسته‌بندی' },
        { name: 'is_active', type: 'BooleanField(default=True)', verbose: 'وضعیت فعال بودن در سایت' },
        { name: 'order', type: 'PositiveIntegerField(default=0)', verbose: 'ترتیب نمایش' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ایجاد' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/categories/list/',
      auth: 'AllowAny',
      description: 'دریافت لیست دسته‌بندی‌های اصلی (والد) به همراه تمام زیرمجموعه‌ها (فرزندان) به صورت درختی',
      curlExample: `curl -X GET http://localhost:8000/api/v1/categories/list/`,
      responseBody: `{
  "status": "success",
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "سیگار ایرانی و انحصاری",
      "slug": "iranian-cigarettes",
      "icon_name": "Layers",
      "image": "/media/categories/iranian.jpg",
      "parent": null,
      "children": [
        {
          "id": 10,
          "name": "سیگار بهمن پایه بلند",
          "slug": "bahman-long",
          "icon_name": "Flame",
          "image": null,
          "parent": 1,
          "children": []
        }
      ],
      "is_active": true,
      "created_at": "2026-01-10T08:00:00Z"
    }
  ]
}`
    },
    {
      method: 'GET',
      path: '/api/v1/categories/tree/',
      auth: 'AllowAny',
      description: 'دریافت تمامی دسته‌بندی‌های فعال به صورت یکپارچه (مناسب منو و Dropdownهای فرانت‌اند)',
      curlExample: `curl -X GET http://localhost:8000/api/v1/categories/tree/`,
      responseBody: `{
  "status": "success",
  "count": 12,
  "results": [
    {
      "id": 1,
      "name": "سیگار ایرانی و انحصاری",
      "slug": "iranian-cigarettes",
      "icon_name": "Layers",
      "image": "/media/categories/iranian.jpg",
      "description": "دسته‌بندی سیگارهای ساخت داخل و انحصاری شرکت دخانیات",
      "parent": null,
      "parent_name": null,
      "is_active": true,
      "created_at": "2026-01-10T08:00:00Z"
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/v1/categories/create/',
      auth: 'IsAdminUser',
      description: 'ایجاد دسته‌بندی جدید (اصلی یا زیرمجموعه) توسط مدیریت سیستم',
      curlExample: `curl -X POST http://localhost:8000/api/v1/categories/create/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "سیگار اولترا لایت", "slug": "ultra-light", "parent": 1}'`,
      responseBody: `{
  "status": "success",
  "message": "دسته‌بندی جدید با موفقیت ایجاد گردید.",
  "data": {
    "id": 11,
    "name": "سیگار اولترا لایت",
    "slug": "ultra-light",
    "parent": 1
  }
}`
    },
    {
      method: 'GET',
      path: '/api/v1/categories/<id>/',
      auth: 'AllowAny',
      description: 'دریافت مشخصات و جزئیات کامل یک دسته‌بندی مشخص بر اساس ID',
      curlExample: `curl -X GET http://localhost:8000/api/v1/categories/1/`
    },
    {
      method: 'PUT',
      path: '/api/v1/categories/<id>/update/',
      auth: 'IsAdminUser',
      description: 'ویرایش اطلاعات دسته‌بندی موجود توسط مدیریت سیستم',
      curlExample: `curl -X PUT http://localhost:8000/api/v1/categories/1/update/ \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "سیگارهای انحصاری ایران"}'`
    },
    {
      method: 'DELETE',
      path: '/api/v1/categories/<id>/delete/',
      auth: 'IsAdminUser',
      description: 'حذف یک دسته‌بندی از سیستم توسط مدیریت',
      curlExample: `curl -X DELETE http://localhost:8000/api/v1/categories/1/delete/ \\
  -H "Authorization: Bearer <JWT_TOKEN>"`
    }
  ];

  const modelsCode = `"""
categories/models.py
مدل دسته‌بندی درختی، اسلاگ فارسی، آیکون و شمارنده محصولات
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class Category(models.Model):
    """
    مدل دسته‌بندی‌های درختی کالاها با ارجاع به خود (Self-Referencing Parent)
    """
    name = models.CharField(_("نام دسته‌بندی"), max_length=120)
    slug = models.SlugField(_("اسلاگ (URL)"), max_length=150, unique=True, allow_unicode=True)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='children',
        verbose_name=_("دسته مادر (والد)")
    )
    icon_name = models.CharField(_("نام آیکون Lucide"), max_length=50, default='Layers')
    image = models.ImageField(_("تصویر شاخص"), upload_to='categories/', blank=True, null=True)
    description = models.TextField(_("توضیحات دسته"), blank=True, null=True)
    is_active = models.BooleanField(_("فعال در سایت"), default=True)
    order = models.PositiveIntegerField(_("ترتیب نمایش"), default=0)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)

    class Meta:
        verbose_name = _("دسته‌بندی کالا")
        verbose_name_plural = _("مدیریت دسته‌بندی‌ها")
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.parent.name} > {self.name}" if self.parent else self.name

    @property
    def products_count(self):
        return self.products.filter(is_active=True).count()
`;

  const adminCode = `"""
categories/admin.py
پنل مدیریت دسته‌بندی‌های درختی همراه با فیلترها و مرتب‌سازی
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'icon_name', 'products_count', 'is_active', 'order')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'slug', 'description')
    autocomplete_fields = ('parent',)
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active', 'order')
    
    # فیلدهای فقط‌خواندنی
    readonly_fields = ('image_preview',)
    
    # تعیین چیدمان دقیق فیلدها (پیش‌نمایش تصویر درست زیر کادر تصویر شاخص)
    fields = (
        'name',
        'slug',
        'parent',
        'icon_name',
        'image',
        'image_preview',
        'description',
        'is_active',
        'order',
    )

    # متد رندر پیش‌نمایش تصویر شاخص دسته‌بندی
    @admin.display(description=_("پیش‌نمایش تصویر شاخص"))
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div style="margin-top: 5px; margin-bottom: 5px;">'
                '<img src="{}" style="max-height: 150px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />'
                '</div>',
                obj.image.url
            )
        return format_html('<span style="color: #9ca3af; font-style: italic;">{}</span>', _("تصویری آپلود نشده است"))

    # سفارشی‌سازی پویای متن راهنما برای فیلد نام آیکون بدون دستکاری مدل اصلی
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        field = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'icon_name':
            field.help_text = format_html(
                '<span style="color: #2563eb; font-weight: bold;">💡 راهنما:</span> '
                'نام آیکون دلخواه خود را باید از پلتفرم <a href="https://iconsax.io" target="_blank" style="text-decoration: underline; color: #1d4ed8; font-weight: bold;">Iconsax</a> بردارید و متن آن را اینجا بنویسید.'
            )
        return field
`;

  const serializersCode = `"""
categories/serializers.py
سریالایزرهای DRF جهت رندر دسته‌بندی‌های درختی، نمایش جزئیات و دریافت فرم ثبت/ویرایش
"""

from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """
    سریالایزر درختی جهت نمایش دسته‌های اصلی به همراه زیرمجموعه‌ها (Recursive Children)
    """
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 
            'name', 
            'slug', 
            'icon_name', 
            'image', 
            'parent', 
            'children', 
            'is_active', 
            'created_at'
        ]

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []


class CategoryDetailSerializer(serializers.ModelSerializer):
    """
    سریالایزر نمایش جزئیات تکمیلی یک دسته‌بندی شامل نام والد
    """
    parent_name = serializers.CharField(source='parent.name', read_only=True, default=None)

    class Meta:
        model = Category
        fields = [
            'id', 
            'name', 
            'slug', 
            'icon_name', 
            'image', 
            'description', 
            'parent', 
            'parent_name', 
            'is_active', 
            'created_at'
        ]


class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    """
    سریالایزر ایجاد و ویرایش داده‌های دسته‌بندی توسط ادمین
    """
    class Meta:
        model = Category
        fields = ['name', 'slug', 'icon_name', 'image', 'description', 'parent', 'is_active', 'order']
`;

  const viewsCode = `"""
categories/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت دسته‌بندی‌های درختی
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema

from .models import Category
from .serializers import (
    CategorySerializer, 
    CategoryDetailSerializer, 
    CategoryCreateUpdateSerializer
)


class CategoryListAPIView(APIView):
    """
    اندپوینت دریافت لیست دسته‌بندی‌های اصلی (والد) و زیرمجموعه‌ها
    توضیحات: این ویو صریح، لیست دسته‌بندی‌های ریشه (بدون والد) را به همراه تمامی فرزندان بازمی‌گرداند.
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست دسته‌بندی‌های اصلی و درختی",
        responses={200: CategorySerializer(many=True)}
    )
    def get(self, request):
        queryset = Category.objects.filter(parent__isnull=True, is_active=True).prefetch_related('children')
        serializer = CategorySerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class CategoryTreeAPIView(APIView):
    """
    اندپوینت دریافت درخت کامل دسته‌بندی‌ها مناسب برای منوهای فرانت‌اند
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت ساختار کامل درخت دسته‌بندی‌ها برای منوی فرانت‌اند",
        responses={200: CategoryDetailSerializer(many=True)}
    )
    def get(self, request):
        categories = Category.objects.filter(is_active=True).order_by('name')
        serializer = CategoryDetailSerializer(categories, many=True)
        return Response({
            'status': 'success',
            'count': categories.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class CategoryCreateAPIView(APIView):
    """
    اندپوینت ایجاد دسته‌بندی جدید (مخصوص مدیریت و ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ایجاد دسته‌بندی جدید (مدیریت)",
        request_body=CategoryCreateUpdateSerializer,
        responses={201: CategorySerializer}
    )
    def post(self, request):
        serializer = CategoryCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save()
            return Response({
                'status': 'success',
                'message': 'دسته‌بندی جدید با موفقیت ایجاد گردید.',
                'data': CategorySerializer(category).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailAPIView(APIView):
    """
    اندپوینت دریافت جزئیات یک دسته‌بندی مشخص با شناسه ID
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات کامل یک دسته‌بندی",
        responses={200: CategoryDetailSerializer}
    )
    def get(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategoryDetailSerializer(category)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class CategoryUpdateAPIView(APIView):
    """
    اندپوینت ویرایش مشخصات دسته‌بندی موجود (مخصوص مدیریت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ویرایش مشخصات دسته‌بندی (مدیریت)",
        request_body=CategoryCreateUpdateSerializer,
        responses={200: CategorySerializer}
    )
    def put(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategoryCreateUpdateSerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            updated_category = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات دسته‌بندی با موفقیت بروزرسانی شد.',
                'data': CategorySerializer(updated_category).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDeleteAPIView(APIView):
    """
    اندپوینت حذف یک دسته‌بندی مشخص از سیستم (مخصوص مدیریت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="حذف دسته‌بندی (مدیریت)",
        responses={200: dict}
    )
    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        category.delete()
        return Response({
            'status': 'success',
            'message': 'دسته‌بندی مورد نظر با موفقیت حذف گردید.'
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
categories/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet)
"""

from django.urls import path
from .views import (
    CategoryListAPIView,
    CategoryTreeAPIView,
    CategoryCreateAPIView,
    CategoryDetailAPIView,
    CategoryUpdateAPIView,
    CategoryDeleteAPIView,
)

app_name = 'categories'

urlpatterns = [
    # ۱. دریافت لیست کلیه دسته‌بندی‌های درختی و اصلی
    path('list/', CategoryListAPIView.as_view(), name='category-list'),

    # ۲. دریافت تمامی دسته‌بندی‌ها مناسب منوی فرانت‌اند
    path('tree/', CategoryTreeAPIView.as_view(), name='category-tree'),

    # ۳. ایجاد دسته‌بندی جدید (مخصوص ادمین)
    path('create/', CategoryCreateAPIView.as_view(), name='category-create'),

    # ۴. دریافت جزئیات یک دسته‌بندی با شناسه
    path('<int:pk>/', CategoryDetailAPIView.as_view(), name='category-detail'),

    # ۵. ویرایش دسته‌بندی
    path('<int:pk>/update/', CategoryUpdateAPIView.as_view(), name='category-update'),

    # ۶. حذف دسته‌بندی
    path('<int:pk>/delete/', CategoryDeleteAPIView.as_view(), name='category-delete'),
]
`;

  const notesCode = `## 📌 راهنمای جامع مدیریت دسته‌بندی محصولات و ذخیره‌سازی مستقیم دیتابیس (categories)

### 💡 ۱. دسته‌بندی‌های اصلی پشتیبانی‌شده در سیستم بنکداری و صندوق:
* **ذغال و ملزومات (Charcoal & Accessories):** ذغال فشرده، ذغال لیمو، ذغال باکسی، ذغال کیلویی، ذغال خودسوز.
* **شیلنگ و تجهیزات قلیان (Hookah Hoses & Parts):** شیلنگ قلیان سیلیکونی و چرمی، سری قلیان، تنگ، انبر و واشر.
* **سیگار و توتون (Cigarettes & Tobacco):** سیگار ایرانی و انحصاری، سیگار وارداتی اورجینال، توتون پیپ و قلیان.
* **دستگاه و استیک آیکاس (IQOS & Terea):** استیک‌های تریال تیریا (Terea) و هیتس (Heets)، دستگاه‌های IQOS ILUMA.
* **ویپ و پاد سیستم (Vapes & Pods):** پاد یکبارمصرف، سالت نیکوتین، ای-جوس (E-Juice).
* **نوشیدنی و قهوه حضوری (Drinks & Coffee):** اسپرسو، آیس کوک، نوشابه انگیزش، آبمیوه طبیعی.

---

### 💾 ۲. ذخیره‌سازی مستقیم در دیتابیس (حذف localStorage):
در این معماری، تمام دسته‌بندی‌های تعریف‌شده چه از مودال صندوق سریع و چه از پنل ادمین، بلافاصله به اندپوینت \`POST /api/v1/categories/create/\` ارسال و در دیتابیس PostgreSQL ذخیره می‌شوند تا با پاک‌سازی حافظه مرورگر هیچ اطلاعاتی پاک نشود.

---

### 💻 ۳. نحوه فراخوانی در فرانت‌اند React:
\`\`\`typescript
// ارسال دسته‌بندی جدید (مثلاً شیلنگ قلیان) به دیتابیس پشتیبانی
export const saveCategoryToBackend = async (categoryName: string, iconName = 'Flame') => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/v1/categories/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      name: categoryName,
      slug: encodeURIComponent(categoryName.toLowerCase().replace(/\\s+/g, '-')),
      icon_name: iconName,
      is_active: true
    })
  });
  return await response.json();
};
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="categories"
      title="۶. اپلیکیشن دسته‌بندی‌های درختی (Tree Categories)"
      titleEn="categories / Tree Category App"
      badge="Self-Ref FK • Tree APIView"
      description="مدل درختی دسته‌بندی کالاها (ذغال باکسی/کیلویی، شیلنگ قلیان، لوازم قلیان، سیگار، دستگاه و استیک آیکاس، پاد و ویپ، نوشیدنی و قهوه) با اسلاگ‌های فارسی سازگار با سئو، پشتیبانی از ذخیره‌سازی مستقیم در دیتابیس (REST API)، آیکون‌های استاندارد و شمارنده کالاها بر پایه APIView صریح."
      icon={<Layers className="w-6 h-6 text-blue-500" />}
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
