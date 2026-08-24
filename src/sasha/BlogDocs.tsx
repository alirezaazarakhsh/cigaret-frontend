import React, { useState } from 'react';
import { BookOpen, Copy, Check, Sparkles, FileEdit, Globe, CheckCircle2 } from 'lucide-react';

export const BlogDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'models' | 'admin' | 'serializers' | 'views' | 'urls'>('models');

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold border border-rose-500/30">
            <BookOpen className="w-4 h-4" />
            <span>وبلاگ تخصصی دخانیات و ویرایشگر TinyMCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            اپلیکیشن وبلاگ و سئو مقالات (blog)
          </h1>
          <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed max-w-3xl">
            شامل مقالات تحلیلی نوسان دلار، تفاوت سیگار اصل و تقلبی، تکنولوژی IQOS و باربری با ادیتور غنی <code className="font-mono text-amber-300">TinyMCE (HTMLField)</code> و ساختار سئو متاتگ‌ها.
          </p>
        </div>
      </div>

      {/* Code Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'models', label: 'مدل‌ها (models.py)' },
          { id: 'admin', label: 'پنل ادمین (admin.py)' },
          { id: 'serializers', label: 'سریالایزرها (serializers.py)' },
          { id: 'views', label: 'ویوها و APIها (views.py)' },
          { id: 'urls', label: 'مسیرها (urls.py)' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveCodeTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCodeTab === t.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* models.py */}
      {activeCodeTab === 'models' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۱. کدهای blog/models.py</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>blog/models.py</span>
              <button
                onClick={() => handleCopy('blg_mod', `from django.db import models
from tinymce.models import HTMLField

class BlogPost(models.Model):
    CATEGORY_CHOICES = (
        ('market_analysis', 'تحلیل بازار و نوسان ارز'),
        ('retail_guide', 'راهنمای بنکداری و خرید عمده'),
        ('authenticity', 'اصالت کالا و تشخیص بار اصلی'),
        ('shipping_rules', 'قوانین باربری و ارسال'),
        ('iqos_tech', 'فناوری IQOS و هیتس'),
    )

    title = models.CharField(max_length=255, verbose_name="عنوان مقاله")
    slug = models.SlugField(max_length=255, unique=True, allow_unicode=True, verbose_name="اسلاگ سئو")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='market_analysis', verbose_name="دسته‌بندی موضوعی")
    
    # متاتگ‌های سئو
    meta_title = models.CharField(max_length=255, blank=True, verbose_name="عنوان سئو (Meta Title)")
    meta_description = models.TextField(blank=True, verbose_name="توضیحات سئو (Meta Description)")
    keywords = models.CharField(max_length=500, blank=True, verbose_name="کلمات کلیدی (جدا شده با کاما)")
    
    # متن مقاله با ویرایشگر TinyMCE
    content = HTMLField(verbose_name="متن کامل و غنی شده مقاله")
    excerpt = models.TextField(verbose_name="چکیده کوتاه مقاله")
    cover_image = models.ImageField(upload_to='blog/covers/', verbose_name="تصویر شاخص مقاله")
    
    author_name = models.CharField(max_length=100, default='تیم تحلیل بازار سوین', verbose_name="نویسنده")
    read_time_minutes = models.PositiveIntegerField(default=5, verbose_name="زمان تخمینی مطالعه (دقیقه)")
    is_published = models.BooleanField(default=True, verbose_name="منتشر شده")
    published_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ انتشار")

    class Meta:
        verbose_name = "مقاله تخصصی"
        verbose_name_plural = "مقالات وبلاگ"
        ordering = ['-published_at']

    def __str__(self):
        return self.title`)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedKey === 'blg_mod' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'blg_mod' ? 'کپی شد' : 'کپی مدل وبلاگ'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-300" dir="ltr">
{`from django.db import models
from tinymce.models import HTMLField

class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, allow_unicode=True)
    content = HTMLField(verbose_name="متن TinyMCE")
    cover_image = models.ImageField(upload_to='blog/covers/')
    is_published = models.BooleanField(default=True)`}
            </pre>
          </div>
        </section>
      )}

      {/* admin.py */}
      {activeCodeTab === 'admin' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۲. کدهای blog/admin.py</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <pre className="p-4 overflow-x-auto text-sky-300" dir="ltr">
{`from django.contrib import admin
from .models import BlogPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author_name', 'read_time_minutes', 'is_published', 'published_at')
    list_filter = ('category', 'is_published', 'published_at')
    search_fields = ('title', 'content', 'keywords')
    prepopulated_fields = {'slug': ('title',)}`}
            </pre>
          </div>
        </section>
      )}

      {/* serializers.py */}
      {activeCodeTab === 'serializers' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۳. کدهای blog/serializers.py</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <pre className="p-4 overflow-x-auto text-amber-300" dir="ltr">
{`from rest_framework import serializers
from .models import BlogPost

class BlogPostListSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = BlogPost
        fields = ('id', 'title', 'slug', 'category', 'category_display', 'excerpt', 'cover_image', 'author_name', 'read_time_minutes', 'published_at')

class BlogPostDetailSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = BlogPost
        fields = '__all__'`}
            </pre>
          </div>
        </section>
      )}

      {/* views.py */}
      {activeCodeTab === 'views' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۴. کدهای blog/views.py با Swagger Schema</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <pre className="p-4 overflow-x-auto text-emerald-300" dir="ltr">
{`from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from .models import BlogPost
from .serializers import BlogPostListSerializer, BlogPostDetailSerializer

class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogPost.objects.filter(is_published=True)
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'content', 'keywords']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    @swagger_auto_schema(
        operation_id="list_blog_posts",
        operation_description="دریافت لیست مقالات با قابلیت فیلتر دسته و جستجو",
        tags=["وبلاگ و مقالات"]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)`}
            </pre>
          </div>
        </section>
      )}

      {/* urls.py */}
      {activeCodeTab === 'urls' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۵. کدهای blog/urls.py</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <pre className="p-4 overflow-x-auto text-sky-300" dir="ltr">
{`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet

router = DefaultRouter()
router.register(r'posts', BlogPostViewSet, basename='blog-post')

urlpatterns = [
    path('', include(router.urls)),
]`}
            </pre>
          </div>
        </section>
      )}

    </div>
  );
};
