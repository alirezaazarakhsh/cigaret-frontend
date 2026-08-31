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
پنل مدیریت مقالات با ادیتور غنی TinyMCE و تاریخ‌های شمسی
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from jalali_date.admin import ModelAdminJalaliMixin
from jalali_date import datetime2jalali
from .models import BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    list_display = ('title', 'slug', 'author', 'views_count', 'is_published', 'created_at_jalali')
    list_filter = ('is_published', 'created_at', 'author')
    search_fields = ('title', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_published',)
    readonly_fields = ('views_count', 'created_at', 'updated_at', 'image_preview')
    fields = (
        'title',
        'slug',
        'author',
        'excerpt',
        'content',
        'featured_image',
        'image_preview',
        'reading_time_minutes',
        'is_published',
        'views_count',
        'created_at',
        'updated_at',
    )

    @admin.display(description=_("پیش‌نمایش تصویر شاخص"))
    def image_preview(self, obj):
        if obj.featured_image:
            return format_html('<img src="{}" style="max-height: 180px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />', obj.featured_image.url)
        return _("تصویری وجود ندارد")

    @admin.display(description=_("تاریخ انتشار"), ordering='created_at')
    def created_at_jalali(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"`;

  const serializersCode = `"""
blog/serializers.py
سریالایزر مقالات وبلاگ
"""
from rest_framework import serializers
from .models import BlogPost


class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = ('id', 'title', 'slug', 'author_name', 'excerpt', 'featured_image', 'views_count', 'reading_time_minutes', 'created_at')


class BlogPostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model = BlogPost
        fields = '__all__'`;

  const viewsCode = `"""
blog/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت فهرست، مشاهده جزئیات با اسلاگ و افزایش خودکار شمارنده بازدید
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import F
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import BlogPost
from .serializers import BlogPostListSerializer, BlogPostDetailSerializer


class BlogPostListAPIView(APIView):
    """
    اندپوینت عمومی دریافت فهرست مقالات منتشر شده وبلاگ
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت فهرست مقالات وبلاگ (عمومی)",
        responses={200: BlogPostListSerializer(many=True)}
    )
    def get(self, request):
        search_query = request.query_params.get('search', '').strip()
        queryset = BlogPost.objects.filter(is_published=True)

        if search_query:
            queryset = queryset.filter(title__icontains=search_query)

        serializer = BlogPostListSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class BlogPostDetailAPIView(APIView):
    """
    اندپوینت عمومی دریافت جزئیات مقاله بر اساس اسلاگ و افزایش خودکار ۱ واحد بازدید با F()
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="مشاهده متن کامل مقاله با اسلاگ (عمومی)",
        responses={200: BlogPostDetailSerializer}
    )
    def get(self, request, slug):
        post = get_object_or_404(BlogPost, slug=slug, is_published=True)
        
        # افزایش امن و اتومیک بازدید دیتابیس
        BlogPost.objects.filter(pk=post.pk).update(views_count=F('views_count') + 1)
        post.refresh_from_db()

        serializer = BlogPostDetailSerializer(post)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class BlogPostAdminCreateAPIView(APIView):
    """
    اندپوینت ایجاد مقاله جدید توسط مدیر (مدیریت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ثبت مقاله جدید در وبلاگ (مدیریت)",
        request_body=BlogPostDetailSerializer,
        responses={201: BlogPostDetailSerializer}
    )
    def post(self, request):
        serializer = BlogPostDetailSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save(author=request.user)
            return Response({
                'status': 'success',
                'message': 'مقاله با موفقیت ایجاد گردید.',
                'data': BlogPostDetailSerializer(post).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogPostAdminDetailAPIView(APIView):
    """
    اندپوینت ویرایش و حذف مقاله توسط مدیر (مدیریت)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ویرایش مقاله (مدیریت)",
        request_body=BlogPostDetailSerializer,
        responses={200: BlogPostDetailSerializer}
    )
    def put(self, request, pk):
        post = get_object_or_404(BlogPost, pk=pk)
        serializer = BlogPostDetailSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            updated_post = serializer.save()
            return Response({
                'status': 'success',
                'message': 'مقاله بروزرسانی شد.',
                'data': BlogPostDetailSerializer(updated_post).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="حذف مقاله (مدیریت)",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def delete(self, request, pk):
        post = get_object_or_404(BlogPost, pk=pk)
        post.delete()
        return Response({
            'status': 'success',
            'message': 'مقاله با موفقیت حذف گردید.'
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
blog/urls.py
مسیرهای صریح APIView جهت دریافت فهرست مقالات، مشاهده جزئیات با اسلاگ و مدیریت مقالات
حتماً دقت کنید متغیر urlpatterns به صورت لیست [ ... ] باشد.
"""

from django.urls import path
from .views import (
    BlogPostListAPIView,
    BlogPostDetailAPIView,
    BlogPostAdminCreateAPIView,
    BlogPostAdminDetailAPIView,
)

app_name = 'blog'

urlpatterns = [
    # ۱. لیست مقالات عمومی
    path('list/', BlogPostListAPIView.as_view(), name='blog-list'),

    # ۲. مشاهده متن کامل مقاله با اسلاگ سئو (عمومی)
    path('detail/<str:slug>/', BlogPostDetailAPIView.as_view(), name='blog-detail'),

    # ۳. مسیرهای اختصاصی مدیریت (مدیریت)
    path('admin/create/', BlogPostAdminCreateAPIView.as_view(), name='blog-admin-create'),
    path('admin/<int:pk>/', BlogPostAdminDetailAPIView.as_view(), name='blog-admin-detail'),
]
`;

  const notesCode = `## 📌 راهنمای رفع خطای ImproperlyConfigured و تنظیمات وبلاگ

### ⚠️ نحوه جلوگیری از خطای URLConf در اپلیکیشن blog:
۱. از بکارگیری ViewSet و Router خودداری شده است؛ تمام ویوها مستقیماً با \`APIView\` تعریف می‌شوند تا متغیر \`urlpatterns\` همواره یک آرایه پایتون \`[ path(...), ... ]\` معتبر باشد.
۲. جهت پشتیبانی از اسلاگ‌های فارسی سئو در دات‌نت و پایتون، در مسیر \`detail/<str:slug>/\` از پارامتر \`str:slug\` استفاده شده است.

---

### 💻 نمونه فراخوانی در فرانت‌اند React:

\`\`\`typescript
// دریافت متن کامل مقاله به همراه محتوای غنی TinyMCE
const fetchBlogPostDetail = async (slug: string) => {
  const response = await fetch(\`http://localhost:8000/api/v1/blog/detail/\${encodeURIComponent(slug)}/\`);
  const data = await response.json();
  if (data.status === 'success') {
    console.log("عنوان مقاله:", data.data.title);
    console.log("محتوای TinyMCE (HTML):", data.data.content);
  }
};
\`\`\`
`;

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
      path: '/api/v1/blog/list/',
      auth: 'AllowAny',
      description: 'دریافت فهرست آخرین مقالات منتشرشده وبلاگ با قابلیت جستجو'
    },
    {
      method: 'GET',
      path: '/api/v1/blog/detail/{slug}/',
      auth: 'AllowAny',
      description: 'مشاهده متن کامل مقاله TinyMCE با اسلاگ و افزایش ۱ واحد شمارنده بازدید'
    },
    {
      method: 'POST',
      path: '/api/v1/blog/admin/create/',
      auth: 'IsAdminUser',
      description: 'ثبت مقاله جدید در سیستم (مدیریت)'
    },
    {
      method: 'PUT',
      path: '/api/v1/blog/admin/{id}/',
      auth: 'IsAdminUser',
      description: 'ویرایش یا حذف مقاله ثبت شده (مدیریت)'
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
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
