import React, { useState } from 'react';
import { BookOpen, Copy, Check, FileCode, Edit3, Eye, Sparkles, Layers } from 'lucide-react';
import { CodeTab } from './types';

export const BlogTinyMceDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelsCode = `"""
blog/models.py
مدل مقالات آموزشی و وبلاگ با فیلد ادیتور متن غنی TinyMCE (HTMLField)
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField
from accounts.models import User


class BlogPost(models.Model):
    title = models.CharField(_('عنوان مقاله'), max_length=220)
    slug = models.SlugField(_('اسلاگ یکتا'), max_length=240, unique=True, allow_unicode=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name=_('نویسنده'))
    category_name = models.CharField(_('دسته‌بندی مقاله'), max_length=100, default='راهنمای خرید و اصالت دخانیات')
    summary = models.TextField(_('چکیده مقاله (برای نمایش در کارت‌ها)'))
    
    # فیلد ادیتور متن غنی TinyMCE
    content_html = HTMLField(_('متن کامل مقاله با TinyMCE'))
    
    cover_image = models.ImageField(_('تصویر شاخص مقاله'), upload_to='blog/covers/')
    read_time_minutes = models.PositiveIntegerField(_('مدت زمان مطالعه (دقیقه)'), default=5)
    views_count = models.PositiveIntegerField(_('تعداد بازدیدها'), default=0)
    is_published = models.BooleanField(_('منتشر شده'), default=True)

    created_at = models.DateTimeField(_('تاریخ نگارش'), auto_now_add=True)
    updated_at = models.DateTimeField(_('آخرین ویرایش'), auto_now=True)

    class Meta:
        verbose_name = _('مقاله وبلاگ')
        verbose_name_plural = _('مقالات و راهنماهای آموزشی')
        ordering = ['-created_at']

    def __str__(self):
        return self.title
`;

  const adminCode = `"""
blog/admin.py
مدیریت مقالات در پنل ادمین جنگو همراه با ویرایشگر TinyMCE
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category_name', 'author', 'read_time_minutes', 'views_count', 'is_published', 'created_at')
    list_filter = ('category_name', 'is_published', 'created_at')
    search_fields = ('title', 'summary', 'content_html')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_published',)
`;

  const serializersCode = `"""
blog/serializers.py
سریالایزرهای DRF برای وبلاگ و رندرینگ HTML
"""

from rest_framework import serializers
from .models import BlogPost


class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'author_name', 'category_name',
            'summary', 'cover_image', 'read_time_minutes', 'views_count',
            'created_at'
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'author_name', 'category_name',
            'summary', 'content_html', 'cover_image', 'read_time_minutes',
            'views_count', 'created_at', 'updated_at'
        ]
`;

  const viewsCode = `"""
blog/views.py
ویوهای API جنگو برای دریافت لیست مقالات و مشاهده متن کامل
"""

from rest_framework import generics, permissions
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .models import BlogPost
from .serializers import BlogPostListSerializer, BlogPostDetailSerializer


class BlogPostListAPIView(generics.ListAPIView):
    """
    دریافت لیست مقالات منتشر شده
    """
    queryset = BlogPost.objects.filter(is_published=True)
    serializer_class = BlogPostListSerializer
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="دریافت لیست تمامی مقالات وبلاگ و آموزش‌ها",
        responses={200: BlogPostListSerializer(many=True)},
        tags=["وبلاگ و TinyMCE"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class BlogPostDetailAPIView(generics.RetrieveAPIView):
    """
    دریافت متن کامل مقاله و افزایش شمارنده بازدید
    """
    queryset = BlogPost.objects.filter(is_published=True)
    serializer_class = BlogPostDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="دریافت جزئیات مقاله به همراه خروجی HTML ویرایشگر TinyMCE",
        responses={200: BlogPostDetailSerializer},
        tags=["وبلاگ و TinyMCE"]
    )
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        return super().get(request, *args, **kwargs)
`;

  const urlsCode = `"""
blog/urls.py
مسیرهای روت برای وبلاگ
"""

from django.urls import path
from .views import BlogPostListAPIView, BlogPostDetailAPIView

app_name = 'blog'

urlpatterns = [
    path('', BlogPostListAPIView.as_view(), name='post_list'),
    path('<slug:slug>/', BlogPostDetailAPIView.as_view(), name='post_detail'),
]
`;

  return (
    <div className="space-y-6 text-slate-800 text-right" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">اپلیکیشن وبلاگ و ادیتور TinyMCE (blog)</div>
            <h1 className="text-2xl font-black text-slate-900">
              ویرایشگر متن غنی TinyMCE، مقالات آموزشی و افزایش خودکار بازدید
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          استفاده از <code>HTMLField</code> پکیج <code>django-tinymce</code> به شما اجازه می‌دهد متون با فرمت HTML، عکس‌ها و جداول را مستقیماً در پنل ادمین جنگو ویرایش کنید.
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
            blog/{activeTab === 'models' ? 'models.py' : activeTab === 'admin' ? 'admin.py' : activeTab === 'serializers' ? 'serializers.py' : activeTab === 'views' ? 'views.py' : 'urls.py'}
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
