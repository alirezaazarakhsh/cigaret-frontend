import React from 'react';
import { BookOpen } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const BlogTinyMceDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'blog_blogpost',
      verboseName: 'مقالات وبلاگ و ریپورتاژ آگهی',
      description: 'مدیریت مقالات آموزشی، اخبار دخانیات، ریپورتاژهای آگهی، آپلود بنر تبلیغاتی با پیش‌نمایش و لینک کلیک، دسته‌بندی‌ها، نکات کلیدی و اینلاین پرسش‌های متداول',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'title', type: 'CharField(max_length=250)', verbose: 'عنوان مقاله' },
        { name: 'slug', type: 'SlugField', verbose: 'اسلاگ سئو' },
        { name: 'category', type: 'ForeignKey', verbose: 'دسته بندی' },
        { name: 'author', type: 'ForeignKey', verbose: 'نویسنده' },
        { name: 'content', type: 'HTMLField', verbose: 'متن کامل (TinyMCE)' },
        { name: 'is_reportage', type: 'BooleanField', verbose: 'ریپورتاژ آگهی' },
        { name: 'reportage_sponsor', type: 'CharField(max_length=150)', verbose: 'برند حامی ریپورتاژ' },
        { name: 'reportage_banner', type: 'ImageField (120x240)', verbose: 'فایل بنر تبلیغاتی (آپلود عکس/گیف متحرک)' },
        { name: 'reportage_banner_url', type: 'URLField(max_length=500)', verbose: 'لینک مستقیم بنر (اختیاری)' },
        { name: 'reportage_link', type: 'URLField(max_length=500)', verbose: 'لینک هدایت کلیک بنر اسپانسر' },
        { name: 'key_takeaways', type: 'JSONField', verbose: 'نکات کلیدی' },
        { name: 'is_published', type: 'BooleanField', verbose: 'وضعیت انتشار' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ انتشار' },
      ]
    },
    {
      name: 'blog_faq',
      verboseName: 'پرسش‌های متداول (اینلاین ادمین)',
      description: 'سوالات و پاسخ‌های مرتبط با هر مقاله که به صورت TabularInline در ادمین جنگو مدیریت می‌شوند',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'post', type: 'ForeignKey(BlogPost)', verbose: 'مقاله مرتبط' },
        { name: 'question', type: 'CharField', verbose: 'سوال' },
        { name: 'answer', type: 'TextField', verbose: 'پاسخ' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    { method: 'GET', path: '/api/v1/blog/categories/', auth: 'AllowAny', description: 'دریافت فهرست دسته‌بندی‌های وبلاگ' },
    { method: 'POST', path: '/api/v1/blog/categories/', auth: 'AllowAny', description: 'ایجاد دسته‌بندی جدید در وبلاگ' },
    { method: 'GET', path: '/api/v1/blog/categories/{id}/', auth: 'AllowAny', description: 'مشاهده اطلاعات یک دسته‌بندی با شناسه' },
    { method: 'PUT', path: '/api/v1/blog/categories/{id}/', auth: 'AllowAny', description: 'ویرایش دسته‌بندی وبلاگ' },
    { method: 'DELETE', path: '/api/v1/blog/categories/{id}/', auth: 'AllowAny', description: 'حذف دسته‌بندی وبلاگ' },
    { method: 'GET', path: '/api/v1/blog/list/', auth: 'AllowAny', description: 'دریافت لیست مقالات و ریپورتاژها (فیلترهای category، is_reportage، search و all_status)' },
    { method: 'GET', path: '/api/v1/blog/detail/{slug}/', auth: 'AllowAny', description: 'مشاهده متن کامل مقاله/ریپورتاژ با اسلاگ همراه با سوالات متداول و افزایش خودکار بازدید' },
    { method: 'GET', path: '/api/v1/blog/admin/{id}/', auth: 'IsAdminUser', description: 'مشاهده و واکشی اطلاعات مقاله با شناسه جهت بارگذاری در فرم ویرایش مدیریت' },
    { method: 'POST', path: '/api/v1/blog/admin/create/', auth: 'IsAdminUser', description: 'ایجاد مقاله یا ریپورتاژ جدید توسط مدیر (پشتیبانی از MultiPartParser جهت آپلود فایل بنر و عکس)' },
    { method: 'PUT', path: '/api/v1/blog/admin/{id}/', auth: 'IsAdminUser', description: 'ویرایش مقاله یا ریپورتاژ با شناسه (پشتیبانی از MultiPartParser جهت به‌روزرسانی فایل بنر)' },
    { method: 'DELETE', path: '/api/v1/blog/admin/{id}/', auth: 'IsAdminUser', description: 'حذف مقاله یا ریپورتاژ با شناسه توسط مدیر' },
  ];

  const modelsCode = `"""
blog/models.py
مدل مقالات آموزشی، ریپورتاژهای آگهی، اخبار دخانیات، دستهبندیها و مدل مستقل پرسش‌های متداول (FAQ) جهت اینلاین در ادمین
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

    # ریپورتاژ آگهی، آپلود فایل بنر (عکس/گیف متحرک 120x240) و لینک هدایت اسپانسر
    is_reportage = models.BooleanField(
        _("ریپورتاژ آگهی است؟"), 
        default=False, 
        help_text=_("علامت‌گذاری مقاله به عنوان ریپورتاژ آگهی تجاری و فعال‌سازی کادر بنر تبلیغاتی")
    )
    reportage_sponsor = models.CharField(
        _("نام برند یا حامی ریپورتاژ"), 
        max_length=150, 
        blank=True, 
        default="", 
        help_text=_("نام شرکت یا برند اسپانسر ریپورتاژ")
    )
    reportage_banner = models.ImageField(
        _("آپلود فایل بنر تبلیغاتی (عکس، گیف متحرک 120x240)"), 
        upload_to='blog/banners/', 
        null=True, 
        blank=True, 
        help_text=_("آپلود مستقیم فایل بنر عمودی استاندارد ۱۲۰ در ۲۴۰ پیکسل (پشتیبانی از انواع فرمت‌های تصویری و GIF متحرک)")
    )
    reportage_banner_url = models.URLField(
        _("لینک مستقیم تصویر بنر (اختیاری)"), 
        max_length=500, 
        null=True, 
        blank=True, 
        help_text=_("در صورت عدم آپلود فایل، می‌توانید آدرس اینترنتی بنر را مستقیماً وارد کنید")
    )
    reportage_link = models.URLField(
        _("لینک هدایت بنر (URL سایت حامی)"), 
        max_length=500, 
        blank=True, 
        default="", 
        help_text=_("آدرس سایتی که کاربر با کلیک روی بنر به آن هدایت می‌شود (با رعایت سئو rel=sponsored)")
    )

    # نکات کلیدی و چکیده محتوا (Key Takeaways)
    key_takeaways = models.JSONField(
        _("نکات کلیدی مقاله (Key Takeaways)"),
        default=list,
        blank=True,
        help_text=_("لیست نکات کلیدی به صورت آرایه متنی JSON")
    )

    # برچسبهای سئو
    tags = models.JSONField(
        _("برچسبهای سئو (Tags)"),
        default=list,
        blank=True,
        help_text=_("لیست کلمات کلیدی و برچسبهای مرتبط")
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
        verbose_name = _("مقاله وبلاگ و ریپورتاژ")
        verbose_name_plural = _("مدیریت مقالات و ریپورتاژها")
        ordering = ['-created_at']

    def __str__(self):
        prefix = "[ریپورتاژ آگهی] " if self.is_reportage else ""
        return f"{prefix}{self.title}"


class FAQ(models.Model):
    post = models.ForeignKey(
        BlogPost,
        on_delete=models.CASCADE,
        related_name='faqs',
        verbose_name=_("مقاله مربوطه")
    )
    question = models.CharField(_("سوال"), max_length=255)
    answer = models.TextField(_("پاسخ"))

    class Meta:
        verbose_name = _("پرسش متداول")
        verbose_name_plural = _("پرسش‌های متداول (FAQ)")
        ordering = ['id']

    def __str__(self):
        return self.question`;

  const adminCode = `"""
blog/admin.py
پنل مدیریت مقالات، ریپورتاژها و پرسش‌های متداول به صورت TabularInline با قابلیت اضافه و کم کردن در دیتابیس
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from jalali_date.admin import ModelAdminJalaliMixin
from jalali_date import datetime2jalali
from .models import BlogPost, BlogCategory, FAQ


class FAQInline(admin.TabularInline):
    model = FAQ
    extra = 1
    fields = ('question', 'answer')
    verbose_name = _("پرسش متداول")
    verbose_name_plural = _("پرسش‌های متداول (مدیریت اینلاین در ادمین)")


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
    list_display = (
        'title', 
        'is_reportage', 
        'reportage_sponsor', 
        'reportage_banner_thumb',
        'category', 
        'author', 
        'views_count', 
        'is_published', 
        'created_at_jalali'
    )
    list_filter = ('is_reportage', 'category', 'is_published', 'created_at', 'author')
    search_fields = ('title', 'excerpt', 'content', 'reportage_sponsor')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('is_published', 'is_reportage')
    readonly_fields = (
        'views_count', 
        'created_at', 
        'updated_at', 
        'image_preview',
        'reportage_banner_preview'
    )
    inlines = [FAQInline]

    fieldsets = (
        (_("۱. مشخصات عمومی و وضعیت انتشار"), {
            'fields': (
                'title',
                'slug',
                'category',
                'author',
                'reading_time_minutes',
                'is_published',
            )
        }),
        (_("۲. تنظیمات ریپورتاژ آگهی، آپلود بنر تبلیغاتی (۱۲۰×۲۴۰) و پیش‌نمایش"), {
            'fields': (
                'is_reportage',
                'reportage_sponsor',
                'reportage_banner',
                'reportage_banner_url',
                'reportage_banner_preview',
                'reportage_link',
            ),
            'description': _(
                "امکان آپلود مستقیم فایل بنر تبلیغاتی (عکس یا GIF متحرک در ابعاد ۱۲۰ در ۲۴۰ پیکسل) به جای لینک، به همراه پیش‌نمایش گرافیکی زنده و تست دکمه هدایت اسپانسر"
            )
        }),
        (_("۳. تصویر شاخص مقاله"), {
            'fields': (
                'featured_image',
                'featured_image_url',
                'image_preview',
            )
        }),
        (_("۴. محتوای کامل (TinyMCE) و خلاصه"), {
            'fields': (
                'excerpt',
                'content',
            )
        }),
        (_("۵. نکات کلیدی (Key Takeaways)"), {
            'classes': ('collapse',),
            'fields': (
                'key_takeaways',
            ),
            'description': _("نکات کلیدی به صورت لیست آرایه‌ای ['نکته اول', 'نکته دوم'] وارد می‌شود.")
        }),
        (_("۶. سئو و کلمه کلیدی کانونی (Yoast SEO)"), {
            'classes': ('collapse',),
            'fields': (
                'focus_keyword',
                'meta_title',
                'meta_description',
                'tags',
            )
        }),
        (_("۷. آمار بازدید و تاریخچه"), {
            'classes': ('collapse',),
            'fields': (
                'views_count',
                'created_at',
                'updated_at',
            )
        }),
    )

    @admin.display(description=_("پیش‌نمایش تصویر شاخص"))
    def image_preview(self, obj):
        img_src = obj.featured_image.url if obj.featured_image else obj.featured_image_url
        if img_src:
            return format_html('<img src="{}" style="max-height: 180px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 1px 4px rgba(0,0,0,0.1);" />', img_src)
        return _("تصویری وجود ندارد")

    @admin.display(description=_("پیش‌نمایش زنده بنر ریپورتاژ (120x240)"))
    def reportage_banner_preview(self, obj):
        banner_src = obj.reportage_banner.url if obj.reportage_banner else obj.reportage_banner_url
        if banner_src:
            link_test = f'''
                <div style="margin-top: 8px;">
                    <a href="{obj.reportage_link}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: #6366f1; color: #ffffff; border-radius: 6px; font-size: 11px; text-decoration: none; font-weight: bold;">
                        <span>🔗 تست باز شدن لینک اسپانسر: {obj.reportage_sponsor or "سایت مقصد"}</span>
                    </a>
                </div>
            ''' if obj.reportage_link else '<div style="margin-top: 6px; font-size: 11px; color: #94a3b8;">فاقد لینک هدایت (فقط نمایش بنر)</div>'

            return format_html(
                '''<div style="display: inline-block; text-align: center; background: #faf5ff; padding: 14px; border-radius: 16px; border: 2px dashed #c084fc; box-shadow: 0 4px 12px rgba(192,132,252,0.15);">
                    <img src="{}" alt="پیش‌نمایش بنر ۱۲۰ در ۲۴۰" style="width: 120px; height: 240px; object-fit: cover; border-radius: 10px; border: 2px solid #a855f7; box-shadow: 0 4px 10px rgba(168,85,247,0.25); display: block; margin: 0 auto;" />
                    <div style="font-size: 11px; font-weight: bold; color: #7e22ce; margin-top: 8px;">ابعاد استاندارد عمودی: ۱۲۰ × ۲۴۰ پیکسل</div>
                    {}
                </div>''',
                banner_src,
                format_html(link_test)
            )
        return _("هنوز بنری برای این ریپورتاژ آپلود یا ثبت نشده است")

    @admin.display(description=_("بنر"))
    def reportage_banner_thumb(self, obj):
        banner_src = obj.reportage_banner.url if obj.reportage_banner else obj.reportage_banner_url
        if banner_src:
            return format_html(
                '<img src="{}" style="width: 28px; height: 56px; object-fit: cover; border-radius: 4px; border: 1px solid #c084fc;" title="{}" />',
                banner_src,
                obj.reportage_sponsor or "بنر ریپورتاژ"
            )
        return "-" if not obj.is_reportage else "فاقد بنر"

    @admin.display(description=_("تاریخ انتشار"), ordering='created_at')
    def created_at_jalali(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d ساعت %H:%M')
        return "-"`;

  const serializersCode = `"""
blog/serializers.py
سریالایزر مقالات، ریپورتاژها و پرسش‌های متداول (FAQ) به صورت تو در تو (Nested) با پشتیبانی از آپلود فایل بنر و پارس فرمت‌های چندبخشی (Multipart)
"""
import json
from rest_framework import serializers
from django.utils.text import slugify
from jalali_date import datetime2jalali
from .models import BlogPost, BlogCategory, FAQ


class BlogCategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.IntegerField(source='posts.count', read_only=True)

    class Meta:
        model = BlogCategory
        fields = '__all__'


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ('id', 'question', 'answer')


class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', default='تیم تحریریه دخانیات سرو', read_only=True)
    category_name = serializers.CharField(source='category.name', default='عمومی', read_only=True)
    created_at_jalali = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    reportage_banner = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = (
            'id', 'title', 'slug', 'is_reportage', 'reportage_sponsor', 'reportage_banner', 
            'reportage_banner_url', 'reportage_link', 'category', 'category_name', 
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

    def get_reportage_banner(self, obj):
        if obj.reportage_banner:
            return obj.reportage_banner.url
        return obj.reportage_banner_url or ""


class BlogPostDetailSerializer(serializers.ModelSerializer):
    faqs = FAQSerializer(many=True, required=False)
    author_name = serializers.CharField(source='author.get_full_name', default='تیم تحریریه دخانیات سرو', read_only=True)
    category_name = serializers.CharField(source='category.name', default='عمومی', read_only=True)
    created_at_jalali = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    reportage_banner_preview = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ('views_count', 'created_at', 'updated_at')
        extra_kwargs = {
            'author': {'required': False, 'allow_null': True},
            'excerpt': {'required': False, 'allow_blank': True},
            'slug': {'required': False, 'allow_blank': True},
            'category': {'required': False, 'allow_null': True},
            'reportage_banner': {'required': False, 'allow_null': True},
            'reportage_banner_url': {'required': False, 'allow_blank': True},
            'reportage_link': {'required': False, 'allow_blank': True},
            'reportage_sponsor': {'required': False, 'allow_blank': True},
            'key_takeaways': {'required': False},
            'tags': {'required': False},
            'focus_keyword': {'required': False, 'allow_blank': True},
            'meta_title': {'required': False, 'allow_blank': True},
            'meta_description': {'required': False, 'allow_blank': True},
        }

    def to_internal_value(self, data):
        # پشتیبانی ویژه از FormData فرانت‌اند که آرایه‌های JSON (نظیر FAQ، نکات کلیدی و تگ‌ها) را به صورت String ارسال می‌کند
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        for field in ['key_takeaways', 'tags', 'faqs']:
            val = mutable_data.get(field)
            if isinstance(val, str) and val.strip():
                try:
                    mutable_data[field] = json.loads(val)
                except Exception:
                    if field != 'faqs':
                        mutable_data[field] = [val]
        return super().to_internal_value(mutable_data)

    def create(self, validated_data):
        faqs_data = validated_data.pop('faqs', [])
        
        # تولید خودکار اسلاگ یکتا در صورت عدم ارسال از فرانت‌اند
        if not validated_data.get('slug'):
            base_slug = slugify(validated_data.get('title', 'article'), allow_unicode=True) or 'article'
            unique_slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = unique_slug

        post = BlogPost.objects.create(**validated_data)
        for faq_data in faqs_data:
            FAQ.objects.create(post=post, **faq_data)
        return post

    def update(self, instance, validated_data):
        faqs_data = validated_data.pop('faqs', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # همگام‌سازی پرسش‌های متداول (اینلاین)
        if faqs_data is not None:
            instance.faqs.all().delete()
            for faq_data in faqs_data:
                FAQ.objects.create(post=instance, **faq_data)
        return instance

    def get_created_at_jalali(self, obj):
        if obj.created_at:
            return datetime2jalali(obj.created_at).strftime('%Y/%m/%d ساعت %H:%M')
        return ""

    def get_image(self, obj):
        if obj.featured_image:
            return obj.featured_image.url
        return obj.featured_image_url or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"

    def get_reportage_banner_preview(self, obj):
        if obj.reportage_banner:
            return obj.reportage_banner.url
        return obj.reportage_banner_url or ""`;

  const viewsCode = `"""
blog/views.py
ویوهای اختصاصی APIView جهت مدیریت مقالات وبلاگ و ریپورتاژها، فیلتر دسته‌بندی و ریپورتاژ، 
پشتیبانی از MultiPartParser جهت آپلود فایل بنر و تصویر، و افزایش خودکار و اتومیک شمارنده بازدید
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import F, Q
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import BlogPost, BlogCategory
from .serializers import BlogPostListSerializer, BlogPostDetailSerializer, BlogCategorySerializer


class BlogCategoryListAPIView(APIView):
    """
    دریافت فهرست دسته‌بندی‌های وبلاگ و ایجاد دسته‌بندی جدید
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت فهرست دسته‌بندی‌های وبلاگ",
        responses={200: BlogCategorySerializer(many=True)}
    )
    def get(self, request):
        categories = BlogCategory.objects.all().order_by('id')
        serializer = BlogCategorySerializer(categories, many=True)
        return Response({
            'status': 'success',
            'count': categories.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ایجاد دسته‌بندی جدید در وبلاگ",
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
    مشاهده، ویرایش و حذف دسته‌بندی وبلاگ
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="مشاهده جزئیات یک دسته‌بندی با شناسه",
        responses={200: BlogCategorySerializer}
    )
    def get(self, request, pk):
        category = get_object_or_404(BlogCategory, pk=pk)
        serializer = BlogCategorySerializer(category)
        return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ویرایش دسته‌بندی وبلاگ",
        request_body=BlogCategorySerializer,
        responses={200: BlogCategorySerializer}
    )
    def put(self, request, pk):
        category = get_object_or_404(BlogCategory, pk=pk)
        serializer = BlogCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            cat = serializer.save()
            return Response({
                'status': 'success', 
                'message': 'دسته‌بندی با موفقیت به‌روزرسانی شد.', 
                'data': BlogCategorySerializer(cat).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="حذف دسته‌بندی وبلاگ",
        responses={200: openapi.Response(description="پیام موفقیت حذف")}
    )
    def delete(self, request, pk):
        category = get_object_or_404(BlogCategory, pk=pk)
        category.delete()
        return Response({'status': 'success', 'message': 'دسته‌بندی با موفقیت حذف گردید.'}, status=status.HTTP_200_OK)


class BlogPostListAPIView(APIView):
    """
    اندپوینت عمومی دریافت فهرست مقالات منتشر شده وبلاگ و ریپورتاژها با فیلتر دسته‌بندی، وضعیت ریپورتاژ و جستجو
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت فهرست مقالات و ریپورتاژهای وبلاگ (عمومی)",
        manual_parameters=[
            openapi.Parameter('category', openapi.IN_QUERY, description="شناسه عددی یا اسلاگ دسته‌بندی", type=openapi.TYPE_STRING),
            openapi.Parameter('is_reportage', openapi.IN_QUERY, description="فیلتر ریپورتاژ آگهی (true: فقط ریپورتاژ | false: فقط مقالات عادی | خالی: همه)", type=openapi.TYPE_STRING),
            openapi.Parameter('search', openapi.IN_QUERY, description="عبارت جستجو در عنوان، خلاصه، اسپانسر ریپورتاژ، کلمه کانونی و برچسب‌ها", type=openapi.TYPE_STRING),
            openapi.Parameter('all_status', openapi.IN_QUERY, description="دریافت تمام مقالات شامل پیش‌نویس‌ها (مخصوص مدیران)", type=openapi.TYPE_BOOLEAN),
        ],
        responses={200: BlogPostListSerializer(many=True)}
    )
    def get(self, request):
        search_query = request.query_params.get('search', '').strip()
        category_param = request.query_params.get('category', '').strip()
        is_reportage_param = request.query_params.get('is_reportage', '').strip().lower()
        all_status_param = request.query_params.get('all_status', '').strip().lower()
        
        # کاربران عادی فقط مقالات منتشر شده را مشاهده می‌کنند؛ مدیران با all_status=true به پیش‌نویس‌ها نیز دسترسی دارند
        if all_status_param == 'true' and request.user and request.user.is_staff:
            queryset = BlogPost.objects.all()
        else:
            queryset = BlogPost.objects.filter(is_published=True)

        # فیلتر اختصاصی ریپورتاژ آگهی
        if is_reportage_param in ['true', '1']:
            queryset = queryset.filter(is_reportage=True)
        elif is_reportage_param in ['false', '0']:
            queryset = queryset.filter(is_reportage=False)

        # فیلتر دسته‌بندی بر اساس شناسه یا اسلاگ یا نام
        if category_param and category_param != 'all':
            if category_param.isdigit():
                queryset = queryset.filter(category_id=int(category_param))
            else:
                queryset = queryset.filter(
                    Q(category__slug=category_param) | Q(category__name__icontains=category_param)
                )

        # جستجوی هوشمند در عنوان، خلاصه، نام اسپانسر ریپورتاژ، کلمه کلیدی سئو و برچسب‌ها
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(excerpt__icontains=search_query) |
                Q(reportage_sponsor__icontains=search_query) |
                Q(focus_keyword__icontains=search_query) |
                Q(tags__icontains=search_query)
            )

        queryset = queryset.select_related('category', 'author').order_by('-created_at')
        serializer = BlogPostListSerializer(queryset, many=True, context={'request': request})
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class BlogPostDetailAPIView(APIView):
    """
    اندپوینت دریافت جزئیات کامل مقاله یا ریپورتاژ بر اساس اسلاگ و افزایش خودکار ۱ واحد بازدید با F()
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="مشاهده متن کامل مقاله/ریپورتاژ با اسلاگ همراه با پرسش‌های متداول (FAQ)",
        responses={200: BlogPostDetailSerializer}
    )
    def get(self, request, slug):
        # بررسی وضعیت انتشار و دسترسی مدیر
        if request.user and request.user.is_staff:
            post = get_object_or_404(
                BlogPost.objects.prefetch_related('faqs').select_related('category', 'author'), 
                slug=slug
            )
        else:
            post = get_object_or_404(
                BlogPost.objects.prefetch_related('faqs').select_related('category', 'author'), 
                slug=slug, 
                is_published=True
            )
        
        # افزایش امن، سریع و اتومیک شمارنده بازدید در سطح پایگاه داده (جلوگیری از Race Condition)
        BlogPost.objects.filter(pk=post.pk).update(views_count=F('views_count') + 1)
        post.refresh_from_db()

        serializer = BlogPostDetailSerializer(post, context={'request': request})
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class BlogPostAdminCreateAPIView(APIView):
    """
    اندپوینت ایجاد مقاله یا ریپورتاژ جدید توسط مدیر (پنل صندوق و داشبورد مدیریت)
    مجهز به MultiPartParser جهت پشتیبانی همزمان از آپلود فایل‌های بنر و تصویر شاخص
    """
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @swagger_auto_schema(
        operation_summary="ثبت مقاله یا ریپورتاژ جدید (مدیریت - پشتیبانی از آپلود فایل بنر و عکس)",
        request_body=BlogPostDetailSerializer,
        responses={201: BlogPostDetailSerializer}
    )
    def post(self, request):
        serializer = BlogPostDetailSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            author = request.user if request.user.is_authenticated else None
            post = serializer.save(author=author)
            return Response({
                'status': 'success',
                'message': 'مقاله/ریپورتاژ با موفقیت ایجاد گردید.',
                'data': BlogPostDetailSerializer(post, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogPostAdminDetailAPIView(APIView):
    """
    اندپوینت واکشی اطلاعات، ویرایش و حذف مقاله یا ریپورتاژ توسط مدیر بر اساس شناسه عددی (pk)
    پشتیبانی از متدهای GET (جهت لود فرم ویرایش), PUT (جهت به‌روزرسانی کامل/جزئی) و DELETE
    """
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @swagger_auto_schema(
        operation_summary="واکشی اطلاعات مقاله جهت بارگذاری در فرم ویرایش مدیریت",
        responses={200: BlogPostDetailSerializer}
    )
    def get(self, request, pk):
        post = get_object_or_404(
            BlogPost.objects.prefetch_related('faqs').select_related('category', 'author'), 
            pk=pk
        )
        serializer = BlogPostDetailSerializer(post, context={'request': request})
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ویرایش مقاله یا ریپورتاژ با شناسه (مدیریت - پشتیبانی از آپلود فایل)",
        request_body=BlogPostDetailSerializer,
        responses={200: BlogPostDetailSerializer}
    )
    def put(self, request, pk):
        post = get_object_or_404(BlogPost, pk=pk)
        serializer = BlogPostDetailSerializer(post, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_post = serializer.save()
            return Response({
                'status': 'success',
                'message': 'مقاله/ریپورتاژ با موفقیت بروزرسانی شد.',
                'data': BlogPostDetailSerializer(updated_post, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="حذف مقاله یا ریپورتاژ با شناسه (مدیریت)",
        responses={200: openapi.Response(description="پاسخ موفقیت‌آمیز")}
    )
    def delete(self, request, pk):
        post = get_object_or_404(BlogPost, pk=pk)
        post.delete()
        return Response({
            'status': 'success',
            'message': 'مقاله/ریپورتاژ با موفقیت از سیستم حذف گردید.'
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
blog/urls.py
مسیرهای API وبلاگ و ریپورتاژها - متصل به اندپوینت‌های کلاینت و پنل صندوق
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
    # اندپوینت‌های دسته‌بندی مقالات
    path('categories/', BlogCategoryListAPIView.as_view(), name='blog-categories'),
    path('categories/<int:pk>/', BlogCategoryDetailAPIView.as_view(), name='blog-category-detail'),
    
    # اندپوینت‌های عمومی مقالات و ریپورتاژها (لیست و جزئیات بر اساس اسلاگ)
    path('list/', BlogPostListAPIView.as_view(), name='blog-list'),
    path('detail/<str:slug>/', BlogPostDetailAPIView.as_view(), name='blog-detail'),
    
    # اندپوینت‌های اختصاصی مدیریت و صندوق (POS) جهت ثبت، دریافت، ویرایش و حذف
    path('admin/create/', BlogPostAdminCreateAPIView.as_view(), name='blog-admin-create'),
    path('admin/<int:pk>/', BlogPostAdminDetailAPIView.as_view(), name='blog-admin-detail'),
]
`;

  const notesCode = `# راهنمای تکمیلی اپلیکیشن وبلاگ، ریپورتاژ آگهی و هماهنگی با فرانت و صندوق (POS)

## ۱. تطابق ۱۰۰٪ مدل دیتابیس با ریپورتاژ آگهی و پنل صندوق (POS)
فیلدهای ذخیره‌شده در پایگاه داده و اندپوینت‌های وبلاگ صندوق کاملاً متناظر، متصل و مرتبط هستند:
- \`is_reportage\` (Boolean): مشخص‌کننده ریپورتاژ آگهی بودن مقاله؛ در فهرست مقالات با کوئری پارامتر \`is_reportage=true\` یا \`false\` فیلتر می‌شود.
- \`reportage_sponsor\` (CharField): نام تجاری برند یا حامی مالی آگهی‌دهنده (پشتیبانی کامل در جستجوی API).
- \`reportage_banner\` (ImageField): فایل بنر تبلیغاتی عمودی (۱۲۰ × ۲۴۰) آپلود شده در \`media/blog/banners/\`.
- \`reportage_banner_url\` (URLField): فیلد اختیاری در صورت استفاده از آدرس مستقیم اینترنتی به جای فایل لوکال.
- \`reportage_link\` (URLField): لینک هدایت مقصد که با کلیک روی بنر در تب جدید باز می‌شود (با ویژگی امنیتی \`rel="sponsored noopener"\`).

## ۲. آپلود مستقیم فایل بنر و تصویر شاخص با MultiPartParser
- در ویوهای \`BlogPostAdminCreateAPIView\` و \`BlogPostAdminDetailAPIView\` کلاس‌های پارسر شامل:
  \`parser_classes = [MultiPartParser, FormParser, JSONParser]\`
  تعریف شده‌اند تا فرانت‌اند بتواند داده‌ها را به شکل \`FormData\` همراه با فایل واقعی بنر یا عکس ارسال نماید.
- متد \`to_internal_value\` در سریالایزر به صورت خودکار فیلدهای رشته‌ای \`faqs\`، \`key_takeaways\` و \`tags\` را پارس نموده و به ساختار داده مناسب تبدیل می‌کند.

## ۳. متد GET در اندپوینت مدیریت (Admin Detail by PK)
- علاوه بر \`put\` و \`delete\`، متد \`get(self, request, pk)\` به \`BlogPostAdminDetailAPIView\` اضافه شده است تا فرم ویرایش صندوق (POS) بتواند بدون وابستگی به اسلاگ یا انتشار، مقاله را مستقیماً بر اساس \`pk\` واکشی کند.

## ۴. افزایش خودکار و اتومیک بازدید با F() Expression
- در \`BlogPostDetailAPIView\`، بازدید مقاله با دستور:
  \`BlogPost.objects.filter(pk=post.pk).update(views_count=F('views_count') + 1)\`
  مستقیماً در دیتابیس افزایش می‌یابد که مانع از بروز خطای همزمانی (Race Condition) می‌گردد.

## ۵. تولید خودکار اسلاگ یکتا و پشتیبانی از اینلاین پرسش‌های متداول (FAQ)
- در صورت عدم ارسال اسلاگ از سمت فرانت، متد \`create\` در سریالایزر به صورت هوشمند از روی عنوان مقاله، اسلاگ فارسی استاندارد و یکتا تولید می‌کند.
- رابطه تو در تو (Nested Serializer) سوالات متداول را به همراه پاسخ در هنگام ایجاد یا ویرایش به طور همزمان ثبت و همگام‌سازی می‌نماید.
`;

  return (
    <AppDocTemplate
      appFolder="blog"
      title="اپلیکیشن وبلاگ و ریپورتاژ آگهی"
      titleEn="blog / Reportage & FAQ Inline"
      badge="TinyMCE"
      description="مدیریت مقالات، ریپورتاژهای آگهی، اخبار دخانیات و پرسش‌های متداول اینلاین"
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

