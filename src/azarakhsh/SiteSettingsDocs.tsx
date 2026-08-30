import React, { useState } from 'react';
import { 
  Sliders, 
  Copy, 
  Check, 
  FileCode, 
  Sparkles, 
  Image, 
  Phone, 
  Mail, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Globe, 
  MessageSquare, 
  Truck, 
  Type,
  LayoutTemplate
} from 'lucide-react';
import { CodeTab } from './types';
import { CodeViewer } from './CodeViewer';

export const SiteSettingsDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelsCode = `"""
site_settings/models.py
مدل‌های جامع تنظیمات سایت، برندینگ، متون هدر صفحات، فرم تماس با ما، متون فوتر و متون اختصاصی باربری
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator


class SiteBranding(models.Model):
    """
    تنظیمات اصلی هویت برند، لوگوها، نام‌ها، فاوآیکون و نوار اعلان بالای هدر سایت
    (طراحی به صورت Singleton یا ردیف یکتا)
    """
    site_title = models.CharField(
        _('عنوان اصلی سایت (فارسی)'), 
        max_length=150, 
        default='سامانه پخش عمده دخانیات سوین'
    )
    site_title_en = models.CharField(
        _('عنوان لاتین سایت'), 
        max_length=150, 
        default='Sevin Wholesale Tobacco Distribution'
    )
    brand_short_name = models.CharField(
        _('نام کوتاه برند'), 
        max_length=50, 
        default='سوین'
    )
    tagline = models.CharField(
        _('شعار برند'), 
        max_length=255, 
        default='تأمین مستقیم و دست‌اول انواع سیگار اورجینال و ادوات آیکاس با نرخ روز کارتن'
    )
    
    # لوگوها و رسانه‌ها
    logo_light = models.ImageField(
        _('تصویر لوگو (نسخه روشن / پس‌زمینه تیره)'), 
        upload_to='branding/logos/', 
        null=True, 
        blank=True,
        help_text=_('تصویر PNG یا SVG با پس‌زمینه شفاف')
    )
    logo_dark = models.ImageField(
        _('تصویر لوگو (نسخه تیره / پس‌زمینه روشن)'), 
        upload_to='branding/logos/', 
        null=True, 
        blank=True
    )
    favicon = models.ImageField(
        _('فاوآیکون (Favicon)'), 
        upload_to='branding/favicons/', 
        null=True, 
        blank=True
    )
    
    # تنظیمات حالت آزمایشی / داده‌های فیک
    is_demo_mode = models.BooleanField(_('فعال بودن حالت داده‌های آزمایشی (Demo / Mock Mode)'), default=False)
    demo_mode_label = models.CharField(_('عنوان حالت آزمایشی'), max_length=100, default='حالت داده‌های آزمایشی')

    # نوار اعلان بالای هدر (Announcement Bar)
    is_announcement_active = models.BooleanField(_('فعال بودن نوار اعلان بالای سایت'), default=True)
    announcement_text = models.CharField(
        _('متن نوار اعلان'), 
        max_length=300, 
        default='بارگیری روزانه از انبار مرکزی جنت‌آباد • تحویل ۲ ساعته تهران و ارسال بیمه‌شده شهرستان'
    )
    announcement_badge = models.CharField(_('بچ اعلان'), max_length=50, default='اطلاعیه باربری')
    announcement_link = models.CharField(_('لینک اعلان (اختیاری)'), max_length=200, blank=True, null=True)

    # اطلاعات تماس سریع در هدر
    header_phone = models.CharField(_('شماره تماس سریع هدر'), max_length=30, default='021-44000000')
    header_support_hours = models.CharField(_('ساعت کاری پشتیبانی هدر'), max_length=100, default='شنبه تا چهارشنبه ۹ الی ۱۹ | پنجشنبه ۹ الی ۱۵')

    updated_at = models.DateTimeField(_('آخرین به‌روزرسانی'), auto_now=True)

    class Meta:
        verbose_name = _('تنظیمات برندینگ و لوگوی سایت')
        verbose_name_plural = _('تنظیمات برندینگ و لوگوی سایت')

    def __str__(self):
        return f"{self.site_title} ({self.brand_short_name})"


class PageHeaderSetting(models.Model):
    """
    تنظیمات متون هدر، بنر و هیرو برای هر صفحه به تفکیک
    """
    PAGE_CHOICES = (
        ('home', _('صفحه اصلی و کاتالوگ')),
        ('live_prices', _('صفحه تابلوی نرخ لحظه‌ای')),
        ('invoice', _('صفحه صدور پیش‌فاکتور رسمی')),
        ('shipping', _('صفحه باربری و ناوگان حمل‌ونقل')),
        ('blog', _('صفحه مقالات و وبلاگ')),
        ('contact', _('صفحه تماس با ما و پشتیبانی')),
        ('calculator', _('ماشین حساب سود و ارز')),
        ('tracking', _('رهگیری سفارشات و بارنامه')),
    )

    page_key = models.CharField(_('کلید شناسه صفحه'), max_length=50, choices=PAGE_CHOICES, unique=True)
    hero_badge_text = models.CharField(_('متن نشانک (Badge) بالای عنوان'), max_length=100, default='مرکز پخش دست‌اول')
    hero_title = models.CharField(_('عنوان بزرگ هدر صفحه (H1)'), max_length=200)
    hero_subtitle = models.CharField(_('زیرعنوان یا هایلایت هدر'), max_length=255, blank=True, null=True)
    hero_description = models.TextField(_('متن توضیحات کامل هدر صفحه'))
    
    primary_button_text = models.CharField(_('متن دکمه اصلی'), max_length=60, default='مشاهده نرخ لحظه‌ای')
    primary_button_link = models.CharField(_('لینک دکمه اصلی'), max_length=150, default='/live-prices')
    secondary_button_text = models.CharField(_('متن دکمه فرعی'), max_length=60, default='صدور پیش‌فاکتور رسمی')
    secondary_button_link = models.CharField(_('لینک دکمه فرعی'), max_length=150, default='/invoice')
    
    is_active = models.BooleanField(_('فعال'), default=True)

    class Meta:
        verbose_name = _('متن هدر و هیروی صفحه')
        verbose_name_plural = _('متون هدر و هیروی صفحات')

    def __str__(self):
        return f"هدر صفحه: {self.get_page_key_display()}"


class ContactInfoSetting(models.Model):
    """
    اطلاعات تماس کامل شرکت، آدرس‌ها، شبکه‌های اجتماعی و راه‌های ارتباطی
    """
    # تلفن‌ها
    primary_phone = models.CharField(_('شماره تلفن ثابت اصلی'), max_length=30, default='021-44123456')
    secondary_phone = models.CharField(_('شماره تلفن ثابت دوم'), max_length=30, blank=True, null=True)
    mobile_sales = models.CharField(_('شماره موبایل واحد فروش عمده'), max_length=20, default='09120000000')
    mobile_support = models.CharField(_('شماره موبایل پشتیبانی ۲۴ ساعته'), max_length=20, default='09121111111')
    email = models.EmailField(_('ایمیل رسمی شرکت'), default='info@sevin-tobacco.com')

    # آدرس‌ها
    central_warehouse_address = models.TextField(
        _('آدرس انبار مرکزی'), 
        default='تهران، جنت‌آباد مرکزی، خیابان مخبری، مجتمع انبارداری و پخش سوین'
    )
    shush_freight_hub_address = models.TextField(
        _('آدرس بارانداز شوش'), 
        default='تهران، خیابان شوش غربی، پایانه باربری اختصاصی، سکوی تخلیه و بارگیری سوین'
    )
    sales_office_address = models.TextField(
        _('آدرس دفتر مرکزی فروش'), 
        default='تهران، میدان ونک، برج نگار، طبقه ۸'
    )
    postal_code = models.CharField(_('کد پستی ۱۰ رقمی'), max_length=20, default='1475896321')

    # شبکه‌های اجتماعی و پیام‌رسان‌ها
    telegram_channel = models.CharField(_('کانال تلگرام استعلام نرخ'), max_length=100, default='@SevinTobacco_Official')
    whatsapp_number = models.CharField(_('واتساپ سفارش سریع'), max_length=30, default='+989120000000')
    instagram_id = models.CharField(_('صفحه اینستاگرام'), max_length=100, default='sevin_tobacco_official')
    bale_rubika_channel = models.CharField(_('کانال بله / روبیکا'), max_length=100, blank=True, null=True)

    # ساعات کاری و توضیحات فرم تماس
    working_hours_text = models.CharField(
        _('متن ساعات کاری'), 
        max_length=200, 
        default='شنبه تا چهارشنبه ۹:۰۰ الی ۱۹:۰۰ | پنجشنبه‌ها ۹:۰۰ الی ۱۵:۰۰'
    )
    contact_form_note = models.TextField(
        _('پیام راهنمای بالای فرم تماس'), 
        default='همکاران محترم و خریداران عمده می‌توانند پیام، انتقاد، پیشنهاد یا درخواست همکاری خود را از طریق فرم زیر ثبت نمایند. کارشناسان ما ظرف حداکثر ۲ ساعت با شما تماس خواهند گرفت.'
    )

    class Meta:
        verbose_name = _('اطلاعات تماس و آدرس‌های شرکت')
        verbose_name_plural = _('اطلاعات تماس و آدرس‌های شرکت')

    def __str__(self):
        return f"اطلاعات تماس ({self.primary_phone})"


class ContactMessage(models.Model):
    """
    پیام‌های ارسال‌شده توسط کاربران از طریق فرم تماس با ما سایت
    """
    STATUS_CHOICES = (
        ('unread', _('خوانده نشده / جدید')),
        ('in_review', _('در حال بررسی توسط واحد فروش')),
        ('answered', _('پاسخ داده شد / تماس گرفته شد')),
        ('archived', _('بایگانی شده')),
    )

    full_name = models.CharField(_('نام و نام خانوادگی'), max_length=120)
    phone_number = models.CharField(
        _('شماره موبایل'), 
        max_length=20,
        validators=[RegexValidator(r'^09[0-9]{9}$', message=_('شماره موبایل نامعتبر است (مثال: 09123456789)'))]
    )
    email = models.EmailField(_('ایمیل (اختیاری)'), blank=True, null=True)
    subject = models.CharField(_('موضوع پیام'), max_length=180)
    message = models.TextField(_('متن پیام / درخواست همکاری'))
    
    # فیلدهای تکمیلی و امنیتی
    ip_address = models.GenericIPAddressField(_('آدرس IP ارسال‌کننده'), null=True, blank=True)
    user_agent = models.TextField(_('اطلاعات مرورگر / دستگاه'), null=True, blank=True)
    
    # وضعیت پاسخ ادمین
    status = models.CharField(_('وضعیت رسیدگی'), max_length=20, choices=STATUS_CHOICES, default='unread')
    admin_notes = models.TextField(_('یادداشت داخلی ادمین'), blank=True, null=True)
    replied_at = models.DateTimeField(_('تاریخ رسیدگی / تماس'), blank=True, null=True)

    created_at = models.DateTimeField(_('تاریخ ثبت پیام'), auto_now_add=True)

    class Meta:
        verbose_name = _('پیام فرم تماس')
        verbose_name_plural = _('پیام‌های دریافتی فرم تماس')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.subject} ({self.get_status_display()})"


class FooterSetting(models.Model):
    """
    تنظیمات جامع متون فوتر، متن درباره ما، حق کپی‌رایت، نمادهای اعتماد و لینک‌ها
    """
    about_text = models.TextField(
        _('متن درباره شرکت در فوتر'), 
        default='سامانه جامع پخش مستقیم و بنکداری دخانیات سوین، مرجع دست‌اول استعلام نرخ کارتن و باکس سیگارهای وارداتی اصل، دستگاه‌های آیکاس و کارتریج‌های تیریا با بارگیری روزانه از انبار مرکزی جنت‌آباد.'
    )
    copyright_text = models.CharField(
        _('متن حق کپی‌رایت فوتر'), 
        max_length=255, 
        default='کلیه حقوق مادی و معنوی این سامانه متعلق به شرکت پخش عمده دخانیات سوین (سهامی خاص) می‌باشد.'
    )
    
    # گواهی‌ها و کدهای اینماد
    enamad_code_html = models.TextField(_('کد HTML نماد اعتماد الکترونیکی (اینماد)'), blank=True, null=True)
    samandehi_code_html = models.TextField(_('کد ساماندهی'), blank=True, null=True)
    guild_license_number = models.CharField(_('شماره پروانه کسب اتحادیه'), max_length=80, default='پروانه کسب اتحادیه بنکداران تهران: ۹۸۷۴۵۶')
    
    # ویژگی‌های فوتر
    feature_1_title = models.CharField(_('ویژگی ۱ - عنوان'), max_length=80, default='تضمین ۱۰۰٪ اصالت بار')
    feature_1_desc = models.CharField(_('ویژگی ۱ - توضیح'), max_length=120, default='هولوگرام اصلی و بسته‌بندی کارخانه‌ای بدون هواخوردگی')
    
    feature_2_title = models.CharField(_('ویژگی ۲ - عنوان'), max_length=80, default='ارسال فوری و بیمه‌شده')
    feature_2_desc = models.CharField(_('ویژگی ۲ - توضیح'), max_length=120, default='تحویل ۲ ساعته تهران و باربری به سراسر ۳۱ استان کشور')
    
    feature_3_title = models.CharField(_('ویژگی ۳ - عنوان'), max_length=80, default='تخفیف‌های پلکانی بنکداری')
    feature_3_desc = models.CharField(_('ویژگی ۳ - توضیح'), max_length=120, default='تخفیف ویژه تا سقف ۴.۵٪ برای خریدهای بالای ۱۰ کارتن')

    class Meta:
        verbose_name = _('تنظیمات متون فوتر و نمادها')
        verbose_name_plural = _('تنظیمات متون فوتر و نمادها')

    def __str__(self):
        return "تنظیمات فوتر سایت"


class ShippingTextsSetting(models.Model):
    """
    تنظیمات متون اختصاصی بخش باربری، شرایط حمل‌ونقل، بیمه، بسته‌بندی و اطلاعیه‌ها
    """
    shipping_header_badge = models.CharField(_('بچ هدر باربری'), max_length=80, default='ناوگان حمل اکسپرس و بیمه‌شده')
    shipping_header_title = models.CharField(_('عنوان صفحه باربری'), max_length=200, default='شبکه ارسال مستقیم به سراسر ۳۱ استان کشور')
    shipping_header_desc = models.TextField(
        _('توضیحات هدر باربری'), 
        default='همکاری مستقیم با باربری‌های معتبر شوش تهران (وطن، پیشتاز، باربری شوش، ایران پیام و تیپاکس) همراه با صدور فوری بیجک رسمی و بیمه‌نامه حوادث.'
    )
    
    # متون راهنمای بسته‌بندی و بیمه
    packaging_guide_text = models.TextField(
        _('متن راهنمای بسته‌بندی ایمن و محرمانه'), 
        default='کلیه سفارشات کارتن در کارتن‌های ۵ لایه ضدضربه، پلمپ‌شده با چسب امنیتی و سلفون ضدآب کشیده می‌شوند تا در طول مسیر از رطوبت، غبار و هرگونه صدمه فیزیکی محافظت گردند.'
    )
    insurance_terms_text = models.TextField(
        _('متن شرایط و سقف پوشش بیمه باربری'), 
        default='تمامی بارهای ارسالی به ارزش ۱۰۰٪ مبلغ فاکتور تحت پوشش بیمه حوادث و مفقودی شرکت‌های باربری طرف قرارداد قرار دارند و در صورت بروز هرگونه مشکل، بلافاصله جبران خسارت می‌گردد.'
    )
    express_tehran_note = models.TextField(
        _('متن راهنمای ارسال ۲ ساعته تهران'), 
        default='سفارشات شهر تهران از ساعت ۹:۰۰ الی ۱۸:۰۰ ظرف کمتر از ۲ ساعت با پیک اختصاصی یا وانت‌بار بارگیری شده و امکان تسویه نقدی یا پرداخت پوز در محل انبار جنت‌آباد فراهم است.'
    )
    provincial_transit_note = models.TextField(
        _('متن زمان‌بندی تحویل بار به شهرستان‌ها'), 
        default='سفارشات ثبت‌شده تا ساعت ۱۳:۰۰ همان روز تحویل پایانه باربری شوش داده شده و شماره بیجک و بارنامه پیامک خواهد شد (تحویل ۲۴ الی ۴۸ ساعته).'
    )
    minimum_freight_order_notice = models.CharField(
        _('اطلاعیه حداقل سفارش باربری'), 
        max_length=255, 
        default='حداقل سفارش برای ارسال به شهرستان ۱ کارتن کامل می‌باشد (ارسال کمتر از ۱ کارتن فقط با هماهنگی تلفنی).'
    )

    class Meta:
        verbose_name = _('متون اختصاصی باربری و حمل‌ونقل')
        verbose_name_plural = _('متون اختصاصی باربری و حمل‌ونقل')

    def __str__(self):
        return "متون و اطلاعیه‌های بخش باربری"


class SiteMaintenance(models.Model):
    """
    تنظیمات صفحه تعمیرات / بروزرسانی سایت همراه با تایمر پایان از سمت دیتابیس
    """
    is_maintenance_mode = models.BooleanField(_('فعال بودن حالت تعمیرات و بروزرسانی'), default=False)
    maintenance_title = models.CharField(_('عنوان پیام بروزرسانی'), max_length=200, default='سامانه در حال بروزرسانی و ارتقا می‌باشد')
    maintenance_message = models.TextField(
        _('متن کامل پیام تعمیرات'), 
        default='کاربران گرامی، به منظور ارتقای زیرساخت‌ها و اضافه نمودن امکانات جدید، سامانه به مدت محدود از دسترس خارج می‌باشد. از شکیبایی شما سپاسگزاریم.'
    )
    estimated_end_time = models.DateTimeField(_('زمان تخمینی پایان تعمیرات (تایمر معکوس)'), null=True, blank=True)
    allowed_ips = models.TextField(_('آدرس‌های IP مجاز برای دسترسی ادمین (جداشده با کاما)'), default='127.0.0.1', blank=True)

    class Meta:
        verbose_name = _('تنظیمات حالت تعمیرات و بروزرسانی سایت')
        verbose_name_plural = _('تنظیمات حالت تعمیرات و تایمر بروزرسانی')

    def __str__(self):
        status_str = "فعال (درحال تعمیرات)" if self.is_maintenance_mode else "غیرفعال (سایت آنلاین)"
        return f"حالت تعمیرات: {status_str}"
`;

  const adminCode = `"""
site_settings/admin.py
پنل مدیریت پیشرفته تنظیمات سایت، برندینگ، متون هدر، فرم تماس و فوتر در ادمین جنگو
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import (
    SiteBranding, 
    PageHeaderSetting, 
    ContactInfoSetting, 
    ContactMessage, 
    FooterSetting, 
    ShippingTextsSetting
)


@admin.register(SiteBranding)
class SiteBrandingAdmin(admin.ModelAdmin):
    fieldsets = (
        (_('هویت برند و عناوین'), {
            'fields': ('site_title', 'site_title_en', 'brand_short_name', 'tagline')
        }),
        (_('لوگوها و فاوآیکون'), {
            'fields': ('logo_light', 'logo_dark', 'favicon', 'logo_preview'),
        }),
        (_('نوار اعلان بالای هدر سایت'), {
            'fields': ('is_announcement_active', 'announcement_badge', 'announcement_text', 'announcement_link')
        }),
        (_('تماس سریع در هدر'), {
            'fields': ('header_phone', 'header_support_hours')
        }),
    )
    readonly_fields = ('logo_preview', 'updated_at')

    def logo_preview(self, obj):
        if obj.logo_light:
            return format_html('<img src="{}" style="max-height: 50px; background: #1e293b; padding: 5px; border-radius: 8px;" />', obj.logo_light.url)
        return _("لوگویی بارگذاری نشده است")
    logo_preview.short_description = _("پیش‌نمایش لوگو")

    def has_add_permission(self, request):
        # جلوگیری از ایجاد ردیف‌های تکراری و ایجاد ساختار یکتای Singleton
        return SiteBranding.objects.count() == 0


@admin.register(PageHeaderSetting)
class PageHeaderSettingAdmin(admin.ModelAdmin):
    list_display = ('page_key', 'hero_title', 'hero_badge_text', 'primary_button_text', 'is_active')
    list_filter = ('is_active', 'page_key')
    search_fields = ('hero_title', 'hero_description', 'hero_subtitle')
    fieldsets = (
        (_('شناسه صفحه'), {
            'fields': ('page_key', 'is_active')
        }),
        (_('متون هدر و هیرو'), {
            'fields': ('hero_badge_text', 'hero_title', 'hero_subtitle', 'hero_description')
        }),
        (_('دکمه‌های اقدام (Call to Action)'), {
            'fields': (
                ('primary_button_text', 'primary_button_link'),
                ('secondary_button_text', 'secondary_button_link')
            )
        }),
    )


@admin.register(ContactInfoSetting)
class ContactInfoSettingAdmin(admin.ModelAdmin):
    fieldsets = (
        (_('شماره‌های تماس'), {
            'fields': ('primary_phone', 'secondary_phone', 'mobile_sales', 'mobile_support', 'email')
        }),
        (_('آدرس‌ها و انبارها'), {
            'fields': ('central_warehouse_address', 'shush_freight_hub_address', 'sales_office_address', 'postal_code')
        }),
        (_('پیام‌رسان‌ها و شبکه‌های اجتماعی'), {
            'fields': ('telegram_channel', 'whatsapp_number', 'instagram_id', 'bale_rubika_channel')
        }),
        (_('ساعات کاری و راهنمای فرم'), {
            'fields': ('working_hours_text', 'contact_form_note')
        }),
    )

    def has_add_permission(self, request):
        return ContactInfoSetting.objects.count() == 0


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone_number', 'subject', 'status_badge', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('full_name', 'phone_number', 'email', 'subject', 'message')
    readonly_fields = ('created_at', 'ip_address', 'user_agent')
    actions = ['mark_as_reviewed', 'mark_as_answered', 'mark_as_archived']

    fieldsets = (
        (_('اطلاعات فرستنده'), {
            'fields': ('full_name', 'phone_number', 'email', 'ip_address', 'user_agent', 'created_at')
        }),
        (_('محتوای پیام'), {
            'fields': ('subject', 'message')
        }),
        (_('رسیدگی و وضعیت پشتیبانی'), {
            'fields': ('status', 'admin_notes', 'replied_at')
        }),
    )

    def status_badge(self, obj):
        colors = {
            'unread': 'background: #fee2e2; color: #991b1b;',
            'in_review': 'background: #fef3c7; color: #92400e;',
            'answered': 'background: #dcfce7; color: #166534;',
            'archived': 'background: #f1f5f9; color: #475569;',
        }
        return format_html(
            '<span style="padding: 3px 8px; border-radius: 6px; font-weight: bold; {}">{}</span>',
            colors.get(obj.status, ''),
            obj.get_status_display()
        )
    status_badge.short_description = _("وضعیت رسیدگی")

    @admin.action(description=_('تغییر وضعیت پیام‌های انتخاب‌شده به "در حال بررسی"'))
    def mark_as_reviewed(self, request, queryset):
        queryset.update(status='in_review')

    @admin.action(description=_('تغییر وضعیت پیام‌های انتخاب‌شده به "پاسخ داده شد"'))
    def mark_as_answered(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='answered', replied_at=timezone.now())

    @admin.action(description=_('بایگانی کردن پیام‌های انتخاب‌شده'))
    def mark_as_archived(self, request, queryset):
        queryset.update(status='archived')


@admin.register(FooterSetting)
class FooterSettingAdmin(admin.ModelAdmin):
    fieldsets = (
        (_('متون اصلی فوتر'), {
            'fields': ('about_text', 'copyright_text', 'guild_license_number')
        }),
        (_('نمادها و ای‌نماد'), {
            'fields': ('enamad_code_html', 'samandehi_code_html')
        }),
        (_('۳ ویژگی برجسته خدمات شرکت در فوتر'), {
            'fields': (
                ('feature_1_title', 'feature_1_desc'),
                ('feature_2_title', 'feature_2_desc'),
                ('feature_3_title', 'feature_3_desc'),
            )
        }),
    )

    def has_add_permission(self, request):
        return FooterSetting.objects.count() == 0


@admin.register(ShippingTextsSetting)
class ShippingTextsSettingAdmin(admin.ModelAdmin):
    fieldsets = (
        (_('هدر و عنوان باربری'), {
            'fields': ('shipping_header_badge', 'shipping_header_title', 'shipping_header_desc')
        }),
        (_('راهنماهای بسته‌بندی و بیمه'), {
            'fields': ('packaging_guide_text', 'insurance_terms_text')
        }),
        (_('ارسال تهران و شهرستان‌ها'), {
            'fields': ('express_tehran_note', 'provincial_transit_note', 'minimum_freight_order_notice')
        }),
    )

    def has_add_permission(self, request):
        return ShippingTextsSetting.objects.count() == 0
`;

  const serializersCode = `"""
site_settings/serializers.py
سریالایزرهای DRF جهت دریافت تنظیمات کامل سایت، هدر، فوتر، باربری و ارسال پیام فرم تماس
"""

from rest_framework import serializers
from .models import (
    SiteBranding, 
    PageHeaderSetting, 
    ContactInfoSetting, 
    ContactMessage, 
    FooterSetting, 
    ShippingTextsSetting
)


class SiteBrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteBranding
        fields = [
            'site_title',
            'site_title_en',
            'brand_short_name',
            'tagline',
            'logo_light',
            'logo_dark',
            'favicon',
            'is_announcement_active',
            'announcement_text',
            'announcement_badge',
            'announcement_link',
            'header_phone',
            'header_support_hours',
            'updated_at'
        ]


class PageHeaderSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageHeaderSetting
        fields = [
            'page_key',
            'hero_badge_text',
            'hero_title',
            'hero_subtitle',
            'hero_description',
            'primary_button_text',
            'primary_button_link',
            'secondary_button_text',
            'secondary_button_link'
        ]


class ContactInfoSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfoSetting
        fields = [
            'primary_phone',
            'secondary_phone',
            'mobile_sales',
            'mobile_support',
            'email',
            'central_warehouse_address',
            'shush_freight_hub_address',
            'sales_office_address',
            'postal_code',
            'telegram_channel',
            'whatsapp_number',
            'instagram_id',
            'bale_rubika_channel',
            'working_hours_text',
            'contact_form_note'
        ]


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    """
    سریالایزر دریافت و ولیدیشن پیام ارسال شده از فرم تماس سایت
    """
    class Meta:
        model = ContactMessage
        fields = ['full_name', 'phone_number', 'email', 'subject', 'message']

    def validate_phone_number(self, value):
        cleaned = value.strip()
        if not (cleaned.startswith('09') and len(cleaned) == 11 and cleaned.isdigit()):
            raise serializers.ValidationError("شماره موبایل وارد شده باید ۱۱ رقم و با ۰۹ شروع شود (مثال: 09123456789).")
        return cleaned


class FooterSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterSetting
        fields = [
            'about_text',
            'copyright_text',
            'guild_license_number',
            'enamad_code_html',
            'samandehi_code_html',
            'feature_1_title',
            'feature_1_desc',
            'feature_2_title',
            'feature_2_desc',
            'feature_3_title',
            'feature_3_desc'
        ]


class ShippingTextsSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingTextsSetting
        fields = [
            'shipping_header_badge',
            'shipping_header_title',
            'shipping_header_desc',
            'packaging_guide_text',
            'insurance_terms_text',
            'express_tehran_note',
            'provincial_transit_note',
            'minimum_freight_order_notice'
        ]


class UnifiedPublicConfigSerializer(serializers.Serializer):
    """
    سریالایزر تجمیعی فوق‌سریع: ارسال کل تنظیمات سایت (لوگو، هدر، فوتر، تماس و باربری)
    در یک درخواست سبک جهت کش در فرانت‌اند
    """
    branding = SiteBrandingSerializer()
    contact_info = ContactInfoSettingSerializer()
    footer = FooterSettingSerializer()
    shipping_texts = ShippingTextsSettingSerializer()
    page_headers = PageHeaderSettingSerializer(many=True)
`;

  const viewsCode = `"""
site_settings/views.py
اندپوینت‌های DRF جهت واکشی تنظیمات عمومی و ثبت پیام در فرم تماس با ما
"""

from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import (
    SiteBranding, 
    PageHeaderSetting, 
    ContactInfoSetting, 
    ContactMessage, 
    FooterSetting, 
    ShippingTextsSetting
)
from .serializers import (
    SiteBrandingSerializer,
    PageHeaderSettingSerializer,
    ContactInfoSettingSerializer,
    ContactMessageCreateSerializer,
    FooterSettingSerializer,
    ShippingTextsSettingSerializer,
    UnifiedPublicConfigSerializer
)


class UnifiedPublicConfigView(APIView):
    """
    اندپوینت تجمیعی عمومی: واکشی کلیه اطلاعات برند، لوگو، متون هدر، فوتر، راه‌های تماس و باربری
    با کش ۶۰ ثانیه‌ای سرور جهت حداکثر کارایی در فرانت‌اند React
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت کلیه تنظیمات عمومی سایت (لوگو، هدر، فوتر، تماس، باربری)",
        operation_description="این اندپوینت کلیه اطلاعات مورد نیاز فرانت‌اند شامل لوگو، متون هدر صفحات، فرم تماس، متون فوتر و باربری را یکجا برمی‌گرداند.",
        responses={200: UnifiedPublicConfigSerializer}
    )
    def get(self, request):
        branding = SiteBranding.objects.first() or SiteBranding.objects.create()
        contact_info = ContactInfoSetting.objects.first() or ContactInfoSetting.objects.create()
        footer = FooterSetting.objects.first() or FooterSetting.objects.create()
        shipping_texts = ShippingTextsSetting.objects.first() or ShippingTextsSetting.objects.create()
        page_headers = PageHeaderSetting.objects.filter(is_active=True)

        data = {
            'branding': SiteBrandingSerializer(branding, context={'request': request}).data,
            'contact_info': ContactInfoSettingSerializer(contact_info).data,
            'footer': FooterSettingSerializer(footer).data,
            'shipping_texts': ShippingTextsSettingSerializer(shipping_texts).data,
            'page_headers': PageHeaderSettingSerializer(page_headers, many=True).data,
        }
        return Response(data, status=status.HTTP_200_OK)


class ContactMessageSubmitView(APIView):
    """
    اندپوینت عمومی ثبت پیام کاربران و درخواست همکاری در فرم تماس با ما
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ثبت پیام جدید در فرم تماس با ما",
        operation_description="ارسال نام، شماره موبایل، موضوع و پیام جهت بررسی توسط کارشناسان پشتیبانی و فروش.",
        request_body=ContactMessageCreateSerializer,
        responses={
            201: openapi.Response(description="پیام با موفقیت در سیستم ثبت گردید."),
            400: "خطای اعتبارسنجی در فیلدها"
        }
    )
    def post(self, request):
        serializer = ContactMessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            # دریافت IP و مشخصات کلاینت برای جلوگیری از اسپم
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT', '')

            message_obj = serializer.save(ip_address=ip, user_agent=user_agent)

            return Response({
                'status': 'success',
                'message': 'پیام شما با موفقیت دریافت گردید. کارشناسان ما ظرف حداکثر ۲ ساعت با شما تماس خواهند گرفت.',
                'tracking_code': f"MSG-{message_obj.id:05d}"
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
`;

  const urlsCode = `"""
site_settings/urls.py
مسیرهای URL برای تنظیمات عمومی سایت، لوگو، هدر، فوتر و فرم تماس
"""

from django.urls import path
from .views import UnifiedPublicConfigView, ContactMessageSubmitView

app_name = 'site_settings'

urlpatterns = [
    # اندپوینت تجمیعی واکشی تمامی تنظیمات برند، هدرها، فوتر و باربری
    path('public-config/', UnifiedPublicConfigView.as_view(), name='public-config'),
    
    # اندپوینت ثبت پیام در فرم تماس با ما
    path('contact/submit/', ContactMessageSubmitView.as_view(), name='contact-submit'),
]
`;

  const notesCode = `## 📌 راهنمای اتصال فرانت‌اند و معماری تنظیمات سایت

### ۱. اندپوینت‌های کلیدی این اپلیکیشن:
* **دریافت تمام تنظیمات سایت (لوگو، هدر، فوتر، باربری):**
  \`GET /api/site-settings/public-config/\`
* **ارسال پیام فرم تماس توسط مشتریان:**
  \`POST /api/site-settings/contact/submit/\`
  
  **نمونه Body ارسالی برای فرم تماس:**
  \`\`\`json
  {
    "full_name": "علیرضا آذرخش",
    "phone_number": "09123456789",
    "email": "alireza@example.com",
    "subject": "درخواست خرید عمده ۵۰ کارتن مارلبرو سوئیس",
    "message": "با سلام، جهت استعلام نرخ تخفیف پلکانی و نحوه ارسال باربری به اصفهان پیام می‌دهم."
  }
  \`\`\`

---

### ۲. اتصال در فرانت‌اند React:
\`\`\`typescript
// دریافت خودکار در کامپوننت App.tsx
useEffect(() => {
  fetch('https://your-django-api.com/api/site-settings/public-config/')
    .then(res => res.json())
    .then(data => {
      // تنظیم لوگو، نام برند، متون هدر و فوتر در State
      setBrandConfig(data.branding);
      setFooterConfig(data.footer);
      setShippingTexts(data.shipping_texts);
    });
}, []);
\`\`\`

---

### ۳. ویژگی‌های اختصاصی این ماژول:
1. **الگوی Singleton:** مدل‌های Branding، ContactInfo، Footer و ShippingTexts به صورت یکتا طراحی شده‌اند تا ادمین به راحتی یک ردیف اصلی را ویرایش کند.
2. **پیش‌نمایش زنده لوگو در پنل ادمین جنگو** با متد \`logo_preview\`.
3. **اکشن‌های اختصاصی برای پیام‌های تماس:** امکان تغییر وضعیت دسته‌جمعی به «در حال بررسی»، «پاسخ داده شد» و «بایگانی» همراه با ثبت تاریخ.
4. **ثبت خودکار IP فرستنده** و کد پیگیری هوشمند (\`MSG-00001\`).
`;

  const renderActiveCode = () => {
    switch (activeTab) {
      case 'models': return modelsCode;
      case 'admin': return adminCode;
      case 'serializers': return serializersCode;
      case 'views': return viewsCode;
      case 'urls': return urlsCode;
      case 'notes': return notesCode;
      default: return modelsCode;
    }
  };

  const getTabLabel = (tab: CodeTab) => {
    switch (tab) {
      case 'models': return 'models.py (مدل‌های برند، هدر، تماس، فوتر و باربری)';
      case 'admin': return 'admin.py (پنل ادمین، فیلدست‌ها و پیش‌نمایش لوگو)';
      case 'serializers': return 'serializers.py (سریالایزر تجمیعی و فرم تماس)';
      case 'views': return 'views.py (APIView تنظیمات و ثبت پیام)';
      case 'urls': return 'urls.py (روت‌های API)';
      case 'notes': return 'راهنما و نکات اتصال فرانت‌اند';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200/60">
              <Sliders className="w-3.5 h-3.5" />
              اپلیکیشن اختصاصی site_settings
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              تنظیمات سایت، لوگو، متون هدر، فرم تماس، متون فوتر و متون باربری
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-3xl">
              معماری کامل مدل‌های تنظیم لوگوی لایت و دارک، عنوان برند، متون هیرو و هدر صفحات، فرم دریافت پیام‌های تماس، متن درباره ما در فوتر و کلیه متون اختصاصی باربری و بیمه با پنل ادمین پیشرفته و API تجمیعی.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(renderActiveCode(), activeTab)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {copiedKey === activeTab ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>کپی کد {activeTab}.py</span>
            </button>
          </div>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-4 border-t border-slate-100">
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
            <Image className="w-3.5 h-3.5 text-blue-600" />
            تنظیم لوگوی لایت/دارک و فاوآیکون
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
            <Type className="w-3.5 h-3.5 text-indigo-600" />
            متن هدر و هیروی تفکیکی صفحات
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            فرم تماس با ما و ثبت پیام مشتریان
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
            <LayoutTemplate className="w-3.5 h-3.5 text-purple-600" />
            متون فوتر، کپی‌رایت و ای‌نماد
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-xs font-bold text-slate-700">
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            متون اختصاصی باربری و بیمه حمل‌ونقل
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['models', 'admin', 'serializers', 'views', 'urls', 'notes'] as CodeTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{tab === 'notes' ? 'راهنما و نکات' : `${tab}.py`}</span>
            </button>
          );
        })}
      </div>

      {/* Code Viewer Container */}
      <CodeViewer
        code={renderActiveCode()}
        filename={`site_settings/${activeTab === 'notes' ? 'README.md' : `${activeTab}.py`}`}
        badge={`site_settings / ${getTabLabel(activeTab)}`}
      />

    </div>
  );
};
