import React from 'react';
import { BookOpen } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const BlogTinyMceDocs: React.FC = () => {
  const modelsCode = `"""
blog/models.py
مدل مقالات آموزشی، اخبار دخانیات، دسته‌بندی‌ها با توضیحات سئو و ادیتور غنی TinyMCE
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField
from accounts.models import User


class BlogCategory(models.Model):
    name = models.CharField(_("نام دسته‌بندی"), max_length=150)
    slug = models.SlugField(_("اسلاگ سئو"), max_length=160, unique=True, allow_unicode=True)
    description = models.TextField(_("توضیحات دسته‌بندی"), blank=True, null=True, help_text=_("توضیحات کوتاه سئو و معرفی این دسته‌بندی"))
    color = models.CharField(_("رنگ شاخص"), max_length=50, default="text-blue-600", blank=True)
    order = models.PositiveIntegerField(_("ترتیب نمایش"), default=1)
    created_at = models.DateTimeField(_("تاریخ ثبت"), auto_now_add=True)
    updated_at = models.DateTimeField(_("آخرین به‌روزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("دسته‌بندی مقاله")
        verbose_name_plural = _("دسته‌بندی‌های وبلاگ")
        ordering = ['order', 'id']

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    title = models.CharField(_("عنوان مقاله"), max_length=250)
    slug = models.SlugField(_("اسلاگ سئو"), max_length=260, unique=True, allow_unicode=True)
    category = models.ForeignKey(
        BlogCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='posts', 
        verbose_name=_("دسته‌بندی مقاله")
    )
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='blog_posts', verbose_name=_("نویسنده"))
    excerpt = models.TextField(_("خلاصه کوتاه"), max_length=500, blank=True, help_text=_("نمایش در کارت‌های وبلاگ"))
    content = HTMLField(_("متن کامل مقاله (TinyMCE)"), help_text=_("شامل تصاویر، جداول، عناوین و فرمت‌بندی غنی"))
    featured_image = models.ImageField(_("تصویر شاخص"), upload_to='blog/images/', null=True, blank=True)
    featured_image_url = models.URLField(_("لینک تصویر (اختیاری)"), max_length=500, null=True, blank=True)
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
پنل مدیریت مقالات و دسته‌بندی‌ها با فیلد توضیحات، ادیتور غنی TinyMCE و تاریخ‌های شمسی
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from jalali_date.admin import ModelAdminJalaliMixin
from jalali_date import datetime2jalali
from .models import BlogPost, BlogCategory


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'description', 'order', 'created_at')
    search_fields = ('name', 'description', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('order',)


@admin.register(BlogPost)
class BlogPostAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    list_display = ('title', 'category', 'slug', 'author', 'views_count', 'is_published', 'created_at_jalali')
    list_filter = ('category', 'is_published', 'created_at', 'author')
    search_fields = ('title', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_published',)
    readonly_fields = ('views_count', 'created_at', 'updated_at', 'image_preview')
    fields = (
        'title',
        'slug',
        'category',
        'author',
        'excerpt',
        'content',
        'featured_image',
        'featured_image_url',
        'image_preview',
        'reading_time_minutes',
        'is_published',
        'views_count',
        'created_at',
        'updated_at',
    )

    @admin.display(description=_("پیش‌نمایش تصویر شاخص"))
    def image_preview(self, obj):
        img_src = obj.featured_image.url if obj.featured_image else obj.featured_image_url
        if img_src:
            return format_html('<img src="{}" style="max-height: 180px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />', img_src)
        return _("تصویری وجود ندارد")

    @admin.display(description=_("تاریخ انتشار"), ordering='created_at')
    def created_at_jalali(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"`;

  const serializersCode = `"""
blog/serializers.py
سریالایزر مقالات وبلاگ و دسته‌بندی‌ها با فیلد توضیحات و تبدیل تاریخ شمسی
"""
from rest_framework import serializers
from jalali_date import datetime2jalali
from .models import BlogPost, BlogCategory


class BlogCategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogCategory
        fields = ('id', 'name', 'slug', 'description', 'color', 'order', 'posts_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'posts_count', 'created_at', 'updated_at')
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'slug': {'required': False, 'allow_blank': True}
        }

    def get_posts_count(self, obj):
        return obj.posts.filter(is_published=True).count()


class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', default='تیم تحریریه سوین', read_only=True)
    category_name = serializers.CharField(source='category.name', default='عمومی', read_only=True)
    created_at_jalali = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = (
            'id', 'title', 'slug', 'category', 'category_name', 
            'author_name', 'excerpt', 'image', 'views_count', 
            'reading_time_minutes', 'created_at', 'created_at_jalali', 'is_published'
        )

    def get_created_at_jalali(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d')
        return ""

    def get_image(self, obj):
        if obj.featured_image:
            return obj.featured_image.url
        return obj.featured_image_url or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"


class BlogPostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', default='تیم تحریریه سوین', read_only=True)
    category_name = serializers.CharField(source='category.name', default='عمومی', read_only=True)
    created_at_jalali = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ('views_count', 'created_at', 'updated_at')
        extra_kwargs = {
            'author': {'required': False, 'allow_null': True},
            'category': {'required': False, 'allow_null': True},
            'excerpt': {'required': False, 'allow_blank': True},
            'slug': {'required': False, 'allow_blank': True},
            'featured_image_url': {'required': False, 'allow_blank': True},
        }

    def get_created_at_jalali(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d')
        return ""

    def get_image(self, obj):
        if obj.featured_image:
            return obj.featured_image.url
        return obj.featured_image_url or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"`;

  const viewsCode = `"""
blog/views.py
ویوهای اختصاصی APIView جهت مدیریت کامل (CRUD) مقالات و دسته‌بندی‌های وبلاگ، فیلتر و افزایش خودکار شمارنده بازدید
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import F
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import BlogPost, BlogCategory
from .serializers import BlogPostListSerializer, BlogPostDetailSerializer, BlogCategorySerializer


class BlogCategoryListAPIView(APIView):
    """
    دریافت فهرست دسته‌بندی‌های وبلاگ و ایجاد دسته‌بندی جدید با توضیحات
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت فهرست دسته‌بندی‌های وبلاگ",
        responses={200: BlogCategorySerializer(many=True)}
    )
    def get(self, request):
        categories = BlogCategory.objects.all().order_by('order', 'id')
        serializer = BlogCategorySerializer(categories, many=True)
        return Response({
            'status': 'success',
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ایجاد دسته‌بندی جدید با توضیحات در وبلاگ",
        request_body=BlogCategorySerializer,
        responses={201: BlogCategorySerializer}
    )
    def post(self, request):
        serializer = BlogCategorySerializer(data=request.data)
        if serializer.is_valid():
            cat = serializer.save()
            return Response({
                'status': 'success',
                'message': 'دسته‌بندی با موفقیت در دیتابیس جنگو ایجاد گردید.',
                'data': BlogCategorySerializer(cat).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogCategoryDetailAPIView(APIView):
    """
    مشاهده، ویرایش و حذف دسته‌بندی وبلاگ (CRUD کامل)
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        category = get_object_or_404(BlogCategory, pk=pk)
        serializer = BlogCategorySerializer(category)
        return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        category = get_object_or_404(BlogCategory, pk=pk)
        serializer = BlogCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            cat = serializer.save()
            return Response({'status': 'success', 'message': 'دسته‌بندی با موفقیت به‌روزرسانی شد.', 'data': BlogCategorySerializer(cat).data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        category = get_object_or_404(BlogCategory, pk=pk)
        category.delete()
        return Response({'status': 'success', 'message': 'دسته‌بندی با موفقیت از دیتابیس حذف گردید.'}, status=status.HTTP_200_OK)


class BlogPostListAPIView(APIView):
    """
    اندپوینت عمومی دریافت فهرست مقالات منتشر شده وبلاگ با فیلتر دسته‌بندی و جستجو
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت فهرست مقالات وبلاگ (عمومی)",
        manual_parameters=[
            openapi.Parameter('category', openapi.IN_QUERY, description="شناسه یا نام دسته‌بندی", type=openapi.TYPE_STRING),
            openapi.Parameter('search', openapi.IN_QUERY, description="عبارت جستجو در عنوان و متن", type=openapi.TYPE_STRING),
        ],
        responses={200: BlogPostListSerializer(many=True)}
    )
    def get(self, request):
        search_query = request.query_params.get('search', '').strip()
        category_param = request.query_params.get('category', '').strip()
        
        queryset = BlogPost.objects.filter(is_published=True)

        if category_param and category_param != 'all' and category_param != 'همه مقالات تخصصی':
            queryset = queryset.filter(category__name__icontains=category_param) | queryset.filter(category__slug=category_param)

        if search_query:
            queryset = queryset.filter(title__icontains=search_query) | queryset.filter(excerpt__icontains=search_query)

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
    اندپوینت ایجاد مقاله جدید توسط مدیر (پنل صندوق) با قابلیت اتصال به دسته‌بندی
    """
    permission_classes = [AllowAny] # یا IsAdminUser بر حسب توکن احراز هویت

    @swagger_auto_schema(
        operation_summary="ثبت مقاله جدید در وبلاگ (مدیریت)",
        request_body=BlogPostDetailSerializer,
        responses={201: BlogPostDetailSerializer}
    )
    def post(self, request):
        serializer = BlogPostDetailSerializer(data=request.data)
        if serializer.is_valid():
            author = request.user if request.user.is_authenticated else None
            post = serializer.save(author=author)
            return Response({
                'status': 'success',
                'message': 'مقاله با موفقیت در دیتابیس جنگو ایجاد گردید.',
                'data': BlogPostDetailSerializer(post).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogPostAdminDetailAPIView(APIView):
    """
    اندپوینت ویرایش و حذف مقاله توسط مدیر (CRUD کامل مقالات)
    """
    permission_classes = [AllowAny]

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
                'message': 'مقاله با موفقیت در دیتابیس بروزرسانی شد.',
                'data': BlogPostDetailSerializer(updated_post).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        return self.put(request, pk)

    @swagger_auto_schema(
        operation_summary="حذف مقاله (مدیریت)",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def delete(self, request, pk):
        post = get_object_or_404(BlogPost, pk=pk)
        post.delete()
        return Response({
            'status': 'success',
            'message': 'مقاله با موفقیت از دیتابیس حذف گردید.'
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
blog/urls.py
مسیرهای صریح APIView جهت فهرست، دسته‌بندی‌ها (با توضیحات)، مشاهده جزئیات با اسلاگ و مدیریت CRUD کامل مقالات
"""

from django.urls import path
from .views import (
    BlogCategoryListAPIView,
    BlogCategoryDetailAPIView,
    BlogPostListAPIView,
    BlogPostDetailAPIView,
    BlogPostAdminCreateAPIView,
    BlogPostAdminDetailAPIView,
)

app_name = 'blog'

urlpatterns = [
    # ۱. دسته‌بندی‌های وبلاگ (لیست و ایجاد با توضیحات)
    path('categories/', BlogCategoryListAPIView.as_view(), name='blog-categories'),
    path('categories/<int:pk>/', BlogCategoryDetailAPIView.as_view(), name='blog-category-detail'),

    # ۲. لیست مقالات عمومی
    path('list/', BlogPostListAPIView.as_view(), name='blog-list'),

    # ۳. مشاهده متن کامل مقاله با اسلاگ سئو (عمومی)
    path('detail/<str:slug>/', BlogPostDetailAPIView.as_view(), name='blog-detail'),

    # ۴. مسیرهای اختصاصی مدیریت (ایجاد، ویرایش و حذف مقالات)
    path('admin/create/', BlogPostAdminCreateAPIView.as_view(), name='blog-admin-create'),
    path('admin/<int:pk>/', BlogPostAdminDetailAPIView.as_view(), name='blog-admin-detail'),
]
`;

  const notesCode = `## 📌 راهنمای جامع ماژول وبلاگ و همگام‌سازی دوطرفه جنگو

### ⚠️ نکات کلیدی ساختار و فیلدها:
۱. **فیلد توضیحات دسته‌بندی (\`description\`):** دسته‌بندی‌های وبلاگ علاوه بر نام و اسلاگ، دارای فیلد توضیحات (\`models.TextField\`) هستند تا بتوان توضیحات سئو و معرفی دسته‌بندی را نیز ذخیره و در فرانت‌اند نمایش داد.
۲. **همگام‌سازی کامل CRUD:** امکان ایجاد، ویرایش و حذف برای هر دو ماژول **دسته‌بندی‌ها** و **مقالات** از طریق اندپوینت‌های استاندارد DRF فراهم شده است.
۳. **پشتیبانی از TinyMCE:** محتوای مقالات در فیلد \`content\` به شکل HTML غنی همراه با تصاویر و استایل ذخیره می‌شود.
۴. **شمارنده بازدید امن:** در هنگام مشاهده جزئیات مقاله، شمارنده بازدید با استفاده از متد اتومیک \`F('views_count') + 1\` بدون Race Condition افزایش می‌یابد.

---

### 💻 نمونه فراخوانی ساخت دسته‌بندی با توضیحات:

\`\`\`typescript
// ایجاد دسته‌بندی جدید با توضیحات
const createCategory = async (name: string, slug: string, description: string) => {
  const response = await fetch('http://localhost:8000/api/v1/blog/categories/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, slug, description })
  });
  return await response.json();
};
\`\`\`
`;

  const erdTables: TableErdMeta[] = [
    {
      name: 'blog_blogcategory',
      verboseName: 'جدول دسته‌بندی‌های وبلاگ',
      description: 'دسته‌بندی موضوعی مقالات همراه با توضیحات سئو، رنگ شاخص و ترتیب نمایش',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'name', type: 'CharField(max_length=150)', verbose: 'نام دسته‌بندی' },
        { name: 'slug', type: 'SlugField', isUnique: true, verbose: 'اسلاگ سئو' },
        { name: 'description', type: 'TextField (nullable)', verbose: 'توضیحات کوتاه دسته‌بندی' },
        { name: 'color', type: 'CharField(max_length=50)', verbose: 'رنگ شاخص' },
        { name: 'order', type: 'PositiveIntegerField', verbose: 'ترتیب نمایش' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت' }
      ]
    },
    {
      name: 'blog_blogpost',
      verboseName: 'جدول مقالات و اخبار دخانیات',
      description: 'محتوای آموزشی و تحلیلی بازار با فیلد ادیتور TinyMCE، تصویر شاخص و شمارنده بازدید',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'title', type: 'CharField(max_length=250)', verbose: 'عنوان مقاله' },
        { name: 'slug', type: 'SlugField', isUnique: true, verbose: 'اسلاگ سئو' },
        { name: 'category_id', type: 'ForeignKey(BlogCategory)', verbose: 'کلید خارجی دسته‌بندی' },
        { name: 'author_id', type: 'ForeignKey(User)', verbose: 'کلید خارجی نویسنده' },
        { name: 'excerpt', type: 'TextField', verbose: 'خلاصه مقاله' },
        { name: 'content', type: 'HTMLField (TinyMCE)', verbose: 'متن غنی ادیتور' },
        { name: 'featured_image', type: 'ImageField / URLField', verbose: 'تصویر شاخص' },
        { name: 'views_count', type: 'PositiveIntegerField', verbose: 'تعداد بازدید' },
        { name: 'reading_time_minutes', type: 'PositiveIntegerField', verbose: 'زمان تقریبی مطالعه' },
        { name: 'created_at', type: 'DateTimeField (Jalali)', verbose: 'تاریخ انتشار (شمسی)' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/blog/categories/',
      auth: 'AllowAny',
      description: 'دریافت فهرست دسته‌بندی‌های وبلاگ همراه با توضیحات و تعداد مقالات'
    },
    {
      method: 'POST',
      path: '/api/v1/blog/categories/',
      auth: 'AllowAny',
      description: 'ایجاد و ثبت دسته‌بندی جدید در دیتابیس جنگو همراه با توضیحات'
    },
    {
      method: 'PUT',
      path: '/api/v1/blog/categories/{id}/',
      auth: 'AllowAny',
      description: 'ویرایش نام، اسلاگ و توضیحات دسته‌بندی وبلاگ'
    },
    {
      method: 'DELETE',
      path: '/api/v1/blog/categories/{id}/',
      auth: 'AllowAny',
      description: 'حذف دسته‌بندی از دیتابیس جنگو'
    },
    {
      method: 'GET',
      path: '/api/v1/blog/list/',
      auth: 'AllowAny',
      description: 'دریافت فهرست آخرین مقالات منتشرشده وبلاگ با فیلتر دسته‌بندی و جستجو'
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
      auth: 'AllowAny / IsAdminUser',
      description: 'ثبت و ذخیره مقاله جدید در دیتابیس جنگو (مدیریت وبلاگ)'
    },
    {
      method: 'PUT',
      path: '/api/v1/blog/admin/{id}/',
      auth: 'AllowAny / IsAdminUser',
      description: 'ویرایش مشخصات، متن TinyMCE، دسته‌بندی و تصویر مقاله (مدیریت وبلاگ)'
    },
    {
      method: 'DELETE',
      path: '/api/v1/blog/admin/{id}/',
      auth: 'AllowAny / IsAdminUser',
      description: 'حذف دائمی مقاله از دیتابیس جنگو (مدیریت وبلاگ)'
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
