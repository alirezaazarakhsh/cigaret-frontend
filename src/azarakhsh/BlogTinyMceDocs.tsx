import React from 'react';
import { BookOpen } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const BlogTinyMceDocs: React.FC = () => {
  const modelsCode = `"""
blog/models.py
مدل مقالات آموزشی، اخبار دخانیات و ادیتور غنی TinyMCE
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField
from accounts.models import User


class BlogPost(models.Model):
    title = models.CharField(_("عنوان مقاله"), max_length=250)
    slug = models.SlugField(_("اسلاگ سئو"), max_length=260, unique=True, allow_unicode=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts', verbose_name=_("نویسنده"))
    excerpt = models.TextField(_("خلاصه کوتاه"), max_length=500, help_text=_("نمایش در کارت‌های وبلاگ"))
    content = HTMLField(_("متن کامل مقاله (TinyMCE)"), help_text=_("شامل تصاویر، جداول، عناوین و فرمت‌بندی غنی"))
    featured_image = models.ImageField(_("تصویر شاخص"), upload_to='blog/images/')
    views_count = models.PositiveIntegerField(_("تعداد بازدید"), default=0)
    reading_time_minutes = models.PositiveIntegerField(_("مدت زمان مطالعه (دقیقه)"), default=5)
    is_published = models.BooleanField(_("منتشر شده"), default=True)
    created_at = models.DateTimeField(_("تاریخ انتشار"), auto_now_add=True)
    updated_at = models.DateTimeField(_("آخرین به‌روزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("مقاله وبلاگ")
        verbose_name_plural = _("مدیریت مقالات وبلاگ")
        ordering = ['-created_at']

    def __str__(self):
        return self.title`;

  const adminCode = `"""
blog/admin.py
پنل مدیریت مقالات با ادیتور غنی TinyMCE
"""
from django.contrib import admin
from .models import BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'author', 'views_count', 'is_published', 'created_at')
    list_filter = ('is_published', 'created_at', 'author')
    search_fields = ('title', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_published',)
    readonly_fields = ('views_count', 'created_at', 'updated_at')`;

  const serializersCode = `"""
blog/serializers.py
سریالایزر مقالات وبلاگ
"""
from rest_framework import serializers
from .models import BlogPost


class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = ('id', 'title', 'slug', 'author_name', 'excerpt', 'featured_image', 'views_count', 'reading_time_minutes', 'created_at')


class BlogPostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = '__all__'`;

  const viewsCode = `"""
blog/views.py
ویوهای مقالات وبلاگ با افزایش خودکار بازدید
"""
from rest_framework import viewsets, permissions
from django.db.models import F
from .models import BlogPost
from .serializers import BlogPostListSerializer, BlogPostDetailSerializer


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    مشاهده فهرست و جزئیات مقالات وبلاگ:
    - دسترسی عمومی (AllowAny)
    - افزایش خودکار شمارنده views_count با F() در سطح دیتابیس
    """
    queryset = BlogPost.objects.filter(is_published=True)
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        BlogPost.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)`;

  const urlsCode = `"""
blog/urls.py
مسیرهای وبلاگ
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet

router = DefaultRouter()
router.register(r'', BlogPostViewSet, basename='blog')

urlpatterns = [
    path('', include(router.urls)),
]`;

  const erdTables: TableErdMeta[] = [
    {
      name: 'blog_blogpost',
      verboseName: 'جدول مقالات و اخبار دخانیات',
      description: 'محتوای آموزشی و تحلیلی بازار با فیلد ادیتور TinyMCE و شمارنده بازدید امن',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'title', type: 'CharField(max_length=250)', verbose: 'عنوان مقاله' },
        { name: 'slug', type: 'SlugField', isUnique: true, verbose: 'اسلاگ سئو' },
        { name: 'content', type: 'HTMLField (TinyMCE)', verbose: 'متن غنی ادیتور' },
        { name: 'featured_image', type: 'ImageField', verbose: 'تصویر شاخص' },
        { name: 'views_count', type: 'PositiveIntegerField', verbose: 'تعداد بازدید' },
        { name: 'reading_time_minutes', type: 'PositiveIntegerField', verbose: 'زمان تقریبی مطالعه' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/blog/',
      auth: 'AllowAny',
      description: 'دریافت فهرست آخرین مقالات منتشرشده وبلاگ'
    },
    {
      method: 'GET',
      path: '/api/v1/blog/{slug}/',
      auth: 'AllowAny',
      description: 'مشاهده متن کامل مقاله TinyMCE و افزایش ۱ واحد شمارنده بازدید'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="blog"
      title="۱۰. اپلیکیشن وبلاگ، سئو و TinyMCE"
      titleEn="blog / SEO Article App"
      badge="TinyMCE HTMLField • Atomic Views Counter"
      description="ماژول وبلاگ و اخبار تحلیلی بازار دخانیات مجهز به ادیتور TinyMCE در پنل ادمین، پشتیبانی از آپلود تصاویر درون متن، محاسبه زمان مطالعه و سئوی پیشرفته اسلاگ فارسی."
      icon={<BookOpen className="w-6 h-6" />}
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
