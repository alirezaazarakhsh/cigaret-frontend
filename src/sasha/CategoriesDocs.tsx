import React, { useState } from 'react';
import { Layers, Copy, Check, FileCode, FolderTree, Tag, Sparkles } from 'lucide-react';
import { CodeTab } from './types';

export const CategoriesDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelsCode = `"""
categories/models.py
مدل دسته‌بندی کالاها به صورت درختی (Tree Hierarchy) و پشتیبانی از اسلاگ (Slug) فارسی و انگلیسی
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify


class Category(models.Model):
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='children',
        null=True,
        blank=True,
        verbose_name=_('دسته‌بندی والد (اختیاری)')
    )
    title = models.CharField(_('عنوان دسته'), max_length=150)
    slug = models.SlugField(_('اسلاگ یکتا (URL)'), max_length=160, unique=True, allow_unicode=True)
    description = models.TextField(_('توضیحات دسته‌بندی'), blank=True, null=True)
    icon_name = models.CharField(_('نام آیکون (Lucide)'), max_length=50, default='Package', help_text="مثال: Flame, ShieldCheck, Truck")
    image = models.ImageField(_('تصویر کاور دسته'), upload_to='categories/', blank=True, null=True)
    
    order = models.PositiveIntegerField(_('ترتیب نمایش'), default=0)
    is_active = models.BooleanField(_('فعال برای نمایش در سایت'), default=True)
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)

    class Meta:
        verbose_name = _('دسته‌بندی')
        verbose_name_plural = _('دسته‌بندی‌های کالا')
        ordering = ['order', 'title']

    def __str__(self):
        full_path = [self.title]
        p = self.parent
        while p is not None:
            full_path.append(p.title)
            p = p.parent
        return ' -> '.join(full_path[::-1])

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)
`;

  const adminCode = `"""
categories/admin.py
مدیریت دسته‌بندی‌ها در پنل ادمین جنگو
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'parent', 'slug', 'order', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'parent')
    search_fields = ('title', 'slug', 'description')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('order', 'is_active')
    ordering = ('order', 'title')
`;

  const serializersCode = `"""
categories/serializers.py
سریالایزرهای DRF برای دسته‌بندی به همراه زیردسته‌ها (Recursive Sub-categories)
"""

from rest_framework import serializers
from .models import Category


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'slug', 'icon_name', 'image', 'order', 'is_active']


class CategorySerializer(serializers.ModelSerializer):
    children = SubCategorySerializer(many=True, read_only=True)
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'title', 'slug', 'description', 'icon_name', 'image', 'order', 'is_active', 'children', 'products_count']

    def get_products_count(self, obj):
        return getattr(obj, 'products_count', obj.products.count() if hasattr(obj, 'products') else 0)
`;

  const viewsCode = `"""
categories/views.py
ویوهای API جنگو برای نمایش دسته‌بندی‌ها با Swagger
"""

from rest_framework import generics, permissions
from drf_yasg.utils import swagger_auto_schema
from .models import Category
from .serializers import CategorySerializer


class CategoryListAPIView(generics.ListAPIView):
    """
    دریافت لیست تمام دسته‌بندی‌های فعال (به همراه زیردسته‌ها)
    """
    queryset = Category.objects.filter(parent__isnull=True, is_active=True).prefetch_related('children')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="دریافت لیست سلسله‌مراتبی دسته‌بندی‌های کالاها",
        responses={200: CategorySerializer(many=True)},
        tags=["دسته‌بندی‌ها"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class CategoryDetailAPIView(generics.RetrieveAPIView):
    """
    دریافت مشخصات یک دسته‌بندی بر اساس اسلاگ
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="دریافت جزئیات یک دسته‌بندی با اسلاگ یکتا",
        responses={200: CategorySerializer},
        tags=["دسته‌بندی‌ها"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
`;

  const urlsCode = `"""
categories/urls.py
مسیرهای روت اپلیکیشن دسته‌بندی‌ها
"""

from django.urls import path
from .views import CategoryListAPIView, CategoryDetailAPIView

app_name = 'categories'

urlpatterns = [
    path('', CategoryListAPIView.as_view(), name='category_list'),
    path('<slug:slug>/', CategoryDetailAPIView.as_view(), name='category_detail'),
]
`;

  return (
    <div className="space-y-6 text-slate-800 text-right" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">اپلیکیشن دسته‌بندی‌ها (categories)</div>
            <h1 className="text-2xl font-black text-slate-900">
              مدل درختی دسته‌بندی‌ها، اسلاگ فارسی و پشتیبانی از زیردسته‌ها
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          دسته‌بندی‌های کالا امکان تعریف سرشاخه‌های اصلی (سیگارهای اورجینال، دستگاه‌های ایکاس، استیک‌های تیریا، ویپ و...) و زیردسته‌ها را فراهم می‌کند.
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
            categories/{activeTab === 'models' ? 'models.py' : activeTab === 'admin' ? 'admin.py' : activeTab === 'serializers' ? 'serializers.py' : activeTab === 'views' ? 'views.py' : 'urls.py'}
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
