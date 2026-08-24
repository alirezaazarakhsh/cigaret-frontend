import React from 'react';
import { Layers } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';
import { DJANGO_APPS_DATA } from '../data/djangoCodebase';

export const CategoriesDocs: React.FC = () => {
  const catalogData = DJANGO_APPS_DATA.catalog || {
    models: '',
    admin: '',
    serializers: '',
    views: '',
    urls: '',
  };

  const categoriesModels = `"""
categories/models.py
مدل دسته‌بندی درختی، اسلاگ فارسی، آیکون و شمارنده محصولات
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(_("نام دسته‌بندی"), max_length=120)
    slug = models.SlugField(_("اسلاگ (URL)"), max_length=150, unique=True, allow_unicode=True)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='children',
        verbose_name=_("دسته مادر")
    )
    icon_name = models.CharField(_("نام آیکون Lucide"), max_length=50, default='Layers')
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
        return self.products.filter(is_active=True).count()`;

  const categoriesAdmin = `"""
categories/admin.py
پنل مدیریت دسته‌بندی‌ها
"""
from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'icon_name', 'products_count', 'is_active', 'order')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active', 'order')`;

  const categoriesSerializers = `"""
categories/serializers.py
سریالایزر دسته‌بندی‌ها با زیرشاخه‌ها و شمارنده کالاها
"""
from rest_framework import serializers
from .models import Category


class CategoryTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    products_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'parent', 'icon_name', 'description', 'order', 'products_count', 'children')

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategoryTreeSerializer(children, many=True).data`;

  const categoriesViews = `"""
categories/views.py
ویوهای عمومی و مدیریت دسته‌بندی‌ها
"""
from rest_framework import viewsets, permissions
from .models import Category
from .serializers import CategoryTreeSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD دسته‌بندی‌ها:
    - دسترسی عمومی (AllowAny) برای متدهای خواندنی (GET)
    - دسترسی ادمین (IsAdminUser) برای ایجاد، ویرایش و حذف
    """
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    serializer_class = CategoryTreeSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]`;

  const categoriesUrls = `"""
categories/urls.py
مسیرهای دسته‌بندی
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet

router = DefaultRouter()
router.register(r'', CategoryViewSet, basename='categories')

urlpatterns = [
    path('', include(router.urls)),
]`;

  const erdTables: TableErdMeta[] = [
    {
      name: 'categories_category',
      verboseName: 'جدول دسته‌بندی‌های کالا',
      description: 'ساختار درختی دسته‌بندی‌ها با ارجاع به خود (Self-Referencing ForeignKey)',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'name', type: 'CharField(max_length=120)', verbose: 'نام دسته‌بندی' },
        { name: 'slug', type: 'SlugField(max_length=150)', isUnique: true, verbose: 'اسلاگ یونیکد فارسی' },
        { name: 'parent_id', type: 'ForeignKey(self)', isFk: true, fkTarget: 'categories_category', verbose: 'دسته والد' },
        { name: 'icon_name', type: 'CharField(max_length=50)', verbose: 'نام آیکون Lucide' },
        { name: 'is_active', type: 'BooleanField', verbose: 'وضعیت فعال بودن' },
        { name: 'order', type: 'PositiveIntegerField', verbose: 'ترتیب نمایش' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/categories/',
      auth: 'AllowAny',
      description: 'دریافت فهرست درخت دسته‌بندی‌ها به همراه زیرشاخه‌ها و تعداد کالاهای فعال',
      responseBody: JSON.stringify([
        {
          id: 1,
          name: "سیگار ایرانی و انحصاری",
          slug: "iranian-cigarettes",
          icon_name: "Layers",
          products_count: 24,
          children: []
        },
        {
          id: 2,
          name: "سیگار وارداتی و اولترا لایت",
          slug: "imported-cigarettes",
          icon_name: "Flame",
          products_count: 38,
          children: []
        }
      ], null, 2)
    }
  ];

  return (
    <AppDocTemplate
      appFolder="categories"
      title="۶. اپلیکیشن دسته‌بندی‌های درختی"
      titleEn="categories / Tree Category App"
      badge="Self-Ref FK • Tree Serializer"
      description="مدل درختی دسته‌بندی کالاها با اسلاگ‌های فارسی سازگار با سئو، پشتیبانی از آیکون‌های استاندارد، شمارنده کالاها و کوئری بهینه با prefetch_related."
      icon={<Layers className="w-6 h-6" />}
      modelsCode={categoriesModels}
      adminCode={categoriesAdmin}
      serializersCode={categoriesSerializers}
      viewsCode={categoriesViews}
      urlsCode={categoriesUrls}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
