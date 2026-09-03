import React from 'react';
import { BookOpen } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const BlogTinyMceDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'blog_blogpost',
      verboseName: 'مقالات وبلاگ',
      description: 'مدیریت مقالات آموزشی، اخبار دخانیات، دستهبندیها، نکات کلیدی (Key Takeaways)، سئو و ادیتور غنی TinyMCE',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'title', type: 'CharField(max_length=250)', verbose: 'عنوان مقاله' },
        { name: 'slug', type: 'SlugField', verbose: 'اسلاگ سئو' },
        { name: 'category', type: 'ForeignKey', verbose: 'دسته بندی' },
        { name: 'author', type: 'ForeignKey', verbose: 'نویسنده' },
        { name: 'content', type: 'HTMLField', verbose: 'متن کامل (TinyMCE)' },
        { name: 'key_takeaways', type: 'JSONField', verbose: 'نکات کلیدی' },
        { name: 'faqs', type: 'JSONField', verbose: 'پرسش‌های متداول' },
        { name: 'is_published', type: 'BooleanField', verbose: 'وضعیت انتشار' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ انتشار' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    { method: 'GET', path: '/api/v1/blog/categories/', auth: 'AllowAny', description: 'دریافت فهرست دسته‌بندی‌ها' },
    { method: 'POST', path: '/api/v1/blog/categories/', auth: 'AllowAny', description: 'ایجاد دسته‌بندی' },
    { method: 'GET', path: '/api/v1/blog/list/', auth: 'AllowAny', description: 'دریافت لیست مقالات' },
    { method: 'GET', path: '/api/v1/blog/detail/{slug}/', auth: 'AllowAny', description: 'مشاهده جزئیات مقاله' },
    { method: 'POST', path: '/api/v1/blog/admin/create/', auth: 'IsAdminUser', description: 'ایجاد مقاله توسط مدیر' },
    { method: 'PUT', path: '/api/v1/blog/admin/{pk}/', auth: 'IsAdminUser', description: 'ویرایش مقاله توسط مدیر' },
  ];

  const modelsCode = `"""
blog/models.py
مدل مقالات آموزشی، اخبار دخانیات، دستهبندیها، نکات کلیدی (Key Takeaways)، سئو و ادیتور غنی TinyMCE
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField
from accounts.models import User


class BlogCategory(models.Model):
    name = models.CharField(_("نام دستهبندی"), max_length=150)
    slug = models.SlugField(_("اسلاگ سئو"), max_length=160, unique=True, allow_unicode=True)
    description = models.TextField(_("توضیحات دستهبندی"), blank=True, default="")

    class Meta:
        verbose_name = _("دستهبندی مقاله")
        verbose_name_plural = _("دستهبندیهای وبلاگ")
        ordering = ['id']

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
        verbose_name=_("دستهبندی مقاله")
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='blog_posts', 
        verbose_name=_("نویسنده")
    )
    excerpt = models.TextField(_("خلاصه کوتاه"), max_length=500, blank=True, default="", help_text=_("نمایش در کارتهای وبلاگ"))
    content = HTMLField(_("متن کامل مقاله (TinyMCE)"), help_text=_("شامل تصاویر، جداول، عناوین و فرمتبندی غنی"))
    featured_image = models.ImageField(_("تصویر شاخص"), upload_to='blog/images/', null=True, blank=True)
    featured_image_url = models.URLField(_("لینک تصویر (اختیاری)"), max_length=500, null=True, blank=True)

    # نکات کلیدی و چکیده محتوا (Key Takeaways) برای بنکداران و خریداران
    key_takeaways = models.JSONField(
        _("نکات کلیدی مقاله (Key Takeaways)"),
        default=list,
        blank=True,
        help_text=_("لیست نکات کلیدی به صورت آرایه متنی JSON")
    )

    # برچسبهای سئو و پرسشهای متداول
    tags = models.JSONField(
        _("برچسبهای سئو (Tags)"),
        default=list,
        blank=True,
        help_text=_("لیست کلمات کلیدی و برچسبهای مرتبط")
    )
    faqs = models.JSONField(
        _("پرسشهای متداول (FAQ)"),
        default=list,
        blank=True,
        help_text=_("لیست پرسش و پاسخهای متداول به صورت JSON")
    )

    # متاتگهای سئو و کلمه کلیدی کانونی (مشابه Yoast SEO)
    focus_keyword = models.CharField(_("کلمه کلیدی کانونی (Focus Keyphrase)"), max_length=150, blank=True, default="")
    meta_title = models.CharField(_("عنوان سئو (Meta Title)"), max_length=255, blank=True, default="")
    meta_description = models.TextField(_("توضیحات سئو (Meta Description)"), max_length=500, blank=True, default="")

    views_count = models.PositiveIntegerField(_("تعداد بازدید"), default=0)
    reading_time_minutes = models.PositiveIntegerField(_("مدت زمان مطالعه (دقیقه)"), default=5)
    is_published = models.BooleanField(_("منتشر شده"), default=True)
    created_at = models.DateTimeField(_("تاریخ انتشار"), auto_now_add=True)
    updated_at = models.DateTimeField(_("آخرین بهروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("مقاله وبلاگ")
        verbose_name_plural = _("مدیریت مقالات وبلاگ")
        ordering = ['-created_at']

    def __str__(self):
        return self.title`;

  const adminCode = `"""
blog/admin.py
پنل مدیریت مقالات، نکات کلیدی (Key Takeaways) و دستهبندیها با ادیتور غنی TinyMCE و تاریخهای شمسی
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from jalali_date.admin import ModelAdminJalaliMixin
from jalali_date import datetime2jalali
from .models import BlogPost, BlogCategory


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'posts_count')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'slug')

    @admin.display(description=_("تعداد مقالات"))
    def posts_count(self, obj):
        return obj.posts.count()


@admin.register(BlogPost)
class BlogPostAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    list_display = ('title', 'category', 'slug', 'author', 'views_count', 'is_published', 'created_at_jalali')
    list_filter = ('category', 'is_published', 'created_at', 'author')
    search_fields = ('title', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_published',)
    readonly_fields = ('views_count', 'created_at', 'updated_at', 'image_preview')

    fieldsets = (
        (_("۱. مشخصات و متادیتای اصلی مقاله"), {
            'fields': (
                'title',
                'slug',
                'category',
                'author',
                'reading_time_minutes',
                'is_published',
            )
        }),
        (_("۲. تصویر شاخص مقاله"), {
            'fields': (
                'featured_image',
                'featured_image_url',
                'image_preview',
            )
        }),
        (_("۳. محتوای مقاله و چکیده"), {
            'fields': (
                'excerpt',
                'content',
            )
        }),
        (_("۴. نکات کلیدی و پرسشهای متداول (JSON)"), {
            'classes': ('collapse',),
            'fields': (
                'key_takeaways',
                'faqs',
            ),
            'description': _("نکات کلیدی به صورت لیست آرایهای ['نکته اول', 'نکته دوم'] وارد میشود.")
        }),
        (_("۵. تنظیمات سئو، کلمه کلیدی کانونی و متاتگها (Yoast SEO)"), {
            'classes': ('collapse',),
            'fields': (
                'focus_keyword',
                'meta_title',
                'meta_description',
                'tags',
            )
        }),
        (_("۶. آمار و تاریخچهها"), {
            'classes': ('collapse',),
            'fields': (
                'views_count',
                'created_at',
                'updated_at',
            )
        }),
    )

    @admin.display(description=_("پیشنمایش تصویر شاخص"))
    def image_preview(self, obj):
        img_src = obj.featured_image.url if obj.featured_image else obj.featured_image_url
        if img_src:
            return format_html('<img src="{}" style="max-height: 180px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 1px 4px rgba(0,0,0,0.1);" />', img_src)
        return _("تصویری وجود ندارد")

    @admin.display(description=_("تاریخ انتشار"), ordering='created_at')
    def created_at_jalali(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"`;

  const serializersCode = `"""
blog/serializers.py
سریالایزر مقالات وبلاگ، نکات کلیدی (Key Takeaways) و دستهبندیها با تبدیل تاریخ شمسی
"""
import json
from rest_framework import serializers
from jalali_date import datetime2jalali
from .models import BlogPost, BlogCategory


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = '__all__'


class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', default='تیم تحریریه دخانیات سرو', read_only=True)
    category_name = serializers.CharField(source='category.name', default='عمومی', read_only=True)
    created_at_jalali = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = (
            'id', 'title', 'slug', 'category', 'category_name', 
            'author_name', 'excerpt', 'image', 'key_takeaways', 'tags', 'focus_keyword',
            'views_count', 'reading_time_minutes', 'created_at', 'created_at_jalali', 'is_published'
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
    author_name = serializers.CharField(source='author.get_full_name', default='تیم تحریریه دخانیات سرو', read_only=True)
    category_name = serializers.CharField(source='category.name', default='عمومی', read_only=True)
    created_at_jalali = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ('views_count', 'created_at', 'updated_at')
        extra_kwargs = {
            'author': {'required': False, 'allow_null': True},
            'excerpt': {'required': False, 'allow_blank': True},
            'slug': {'required': False, 'allow_blank': True},
            'category': {'required': False, 'allow_null': True},
            'key_takeaways': {'required': False},
            'tags': {'required': False},
            'faqs': {'required': False},
            'focus_keyword': {'required': False, 'allow_blank': True},
            'meta_title': {'required': False, 'allow_blank': True},
            'meta_description': {'required': False, 'allow_blank': True},
        }

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        for field in ['key_takeaways', 'tags', 'faqs']:
            val = data.get(field)
            if isinstance(val, str) and val.strip():
                try:
                    ret[field] = json.loads(val)
                except Exception:
                    ret[field] = [val]
        return ret

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
ویوهای اختصاصی APIView جهت مدیریت مقالات وبلاگ، فیلتر دستهبندی و افزایش خودکار شمارنده بازدید
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
    دریافت فهرست دستهبندیهای وبلاگ و ایجاد دستهبندی جدید
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت فهرست دستهبندیهای وبلاگ",
        responses={200: BlogCategorySerializer(many=True)}
    )
    def get(self, request):
        categories = BlogCategory.objects.all().order_by('id')
        serializer = BlogCategorySerializer(categories, many=True)
        return Response({
            'status': 'success',
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ایجاد دستهبندی جدید در وبلاگ",
        request_body=BlogCategorySerializer,
        responses={201: BlogCategorySerializer}
    )
    def post(self, request):
        serializer = BlogCategorySerializer(data=request.data)
        if serializer.is_valid():
            cat = serializer.save()
            return Response({
                'status': 'success',
                'message': 'دستهبندی با موفقیت در دیتابیس جنگو ایجاد گردید.',
                'data': BlogCategorySerializer(cat).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogCategoryDetailAPIView(APIView):
    """
    مشاهده، ویرایش و حذف دستهبندی وبلاگ
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
            return Response({'status': 'success', 'message': 'دستهبندی بهروزرسانی شد.', 'data': BlogCategorySerializer(cat).data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = get_object_or_404(BlogCategory, pk=pk)
        category.delete()
        return Response({'status': 'success', 'message': 'دستهبندی با موفقیت حذف گردید.'}, status=status.HTTP_200_OK)


class BlogPostListAPIView(APIView):
    """
    اندپوینت عمومی دریافت فهرست مقالات منتشر شده وبلاگ با فیلتر دستهبندی و جستجو
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت فهرست مقالات وبلاگ (عمومی)",
        manual_parameters=[
            openapi.Parameter('category', openapi.IN_QUERY, description="شناسه یا اسلاگ دستهبندی", type=openapi.TYPE_STRING),
            openapi.Parameter('search', openapi.IN_QUERY, description="عبارت جستجو در عنوان و متن", type=openapi.TYPE_STRING),
        ],
        responses={200: BlogPostListSerializer(many=True)}
    )
    def get(self, request):
        search_query = request.query_params.get('search', '').strip()
        category_param = request.query_params.get('category', '').strip()
        
        queryset = BlogPost.objects.filter(is_published=True)

        if category_param and category_param != 'all':
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
    اندپوینت ایجاد مقاله جدید توسط مدیر (پنل صندوق)
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
    اندپوینت ویرایش و حذف مقاله توسط مدیر (پنل صندوق)
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
        responses={200: openapi.Response(description="پاسخ موفقیتآمیز")}
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
مسیرهای صریح APIView جهت فهرست، دستهبندیها، مشاهده جزئیات با اسلاگ و مدیریت مقالات
"""

from django.urls import path
from .views import (
    BlogCategoryDetailAPIView,
    BlogCategoryListAPIView,
    BlogPostListAPIView,
    BlogPostDetailAPIView,
    BlogPostAdminCreateAPIView,
    BlogPostAdminDetailAPIView,
)

app_name = 'blog'

urlpatterns = [
    # ۱. دستهبندیهای وبلاگ (دریافت و ایجاد)
    path('categories/', BlogCategoryListAPIView.as_view(), name='blog-categories'),
    path('categories/<int:pk>/', BlogCategoryDetailAPIView.as_view(), name='blog-category-detail'),

    # ۲. لیست مقالات عمومی
    path('list/', BlogPostListAPIView.as_view(), name='blog-list'),

    # ۳. مشاهده متن کامل مقاله با اسلاگ سئو (عمومی)
    path('detail/<str:slug>/', BlogPostDetailAPIView.as_view(), name='blog-detail'),

    # ۴. مسیرهای اختصاصی مدیریت (مدیریت صندوق)
    path('admin/create/', BlogPostAdminCreateAPIView.as_view(), name='blog-admin-create'),
    path('admin/<int:pk>/', BlogPostAdminDetailAPIView.as_view(), name='blog-admin-detail'),
]
`;

  const notesCode = `# راهنمای تکمیلی اپلیکیشن وبلاگ (Blog & TinyMCE)

## ۱. پیکربندی ویرایشگر غنی TinyMCE
این اپلیکیشن از \`django-tinymce\` برای ویرایش متون استفاده می‌کند. اطمینان حاصل کنید که تنظیمات زیر در \`settings.py\` برقرار باشد:

\`\`\`python
TINYMCE_DEFAULT_CONFIG = {
    "height": "500px",
    "width": "100%",
    "menubar": "file edit view insert format tools table",
    "plugins": "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount",
    "toolbar": "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
}
\`\`\`

## ۲. مدیریت پرسش‌های متداول (FAQ) به صورت Inline
برای مدیریت بهتر و کاربری راحت‌تر، توصیه می‌شود به جای \`JSONField\` از یک مدلِ مجزا به همراه \`TabularInline\` در پنلِ ادمین استفاده کنید:

### در models.py:
\`\`\`python
class FAQ(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=255, verbose_name="سوال")
    answer = models.TextField(verbose_name="پاسخ")

    class Meta:
        verbose_name = "پرسش متداول"
        verbose_name_plural = "پرسش‌های متداول"
\`\`\`

### در admin.py:
\`\`\`python
class FAQInline(admin.TabularInline):
    model = FAQ
    extra = 1

@admin.register(BlogPost)
class BlogPostAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    inlines = [FAQInline]
    # ... سایر تنظیمات
\`\`\`

این روش باعث می‌شود در پنلِ ادمین، سوال و جواب‌ها را به صورت ردیفی و مرتب وارد کنید.

## ۳. تصاویر
تصاویر مقالات در پوشه \`blog/images/\` ذخیره می‌شوند. در سریالایزرها منطق تبدیلِ \`featured_image_url\` یا \`featured_image\` به یک URL معتبر پیش‌بینی شده است.
`;

  return (
    <AppDocTemplate
      appFolder="blog"
      title="اپلیکیشن وبلاگ و TinyMCE"
      titleEn="blog / SEO Article App"
      badge="TinyMCE"
      description="مدیریت مقالات آموزشی، اخبار دخانیات، نکات کلیدی، سئو و ادیتور غنی"
      icon={<BookOpen className="w-6 h-6 text-indigo-500" />}
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
