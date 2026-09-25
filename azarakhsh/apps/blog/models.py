from django.db import models

class BlogPost(models.Model):
    title = models.CharField(max_length=200, verbose_name='عنوان مقاله')
    slug = models.SlugField(max_length=250, unique=True, verbose_name='اسلاگ (URL)')
    excerpt = models.TextField(verbose_name='خلاصه مقاله')
    content = models.TextField(verbose_name='متن کامل مقاله')
    meta_description = models.CharField(max_length=300, blank=True, null=True, verbose_name='توضیحات متا سئو')
    image = models.ImageField(upload_to='blog/images/', blank=True, null=True, verbose_name='تصویر شاخص')
    category = models.CharField(max_length=100, default='news', verbose_name='دسته بندی')
    
    # سوالات متداول به صورت JSON (شامل آرایه ای از اجزای سوال و جواب, بدون آیکون)
    # مثال: [{"question": "سوال اول؟", "answer": "پاسخ اول..."}, ...]
    faqs = models.JSONField(default=list, blank=True, verbose_name='سوالات متداول (JSON)')

    # فیلدهای ریپورتاژ آگهی (Sponsored Reportage Ad)
    is_reportage = models.BooleanField(default=False, verbose_name='آیا این پست ریپورتاژ آگهی است؟')
    reportage_title = models.CharField(max_length=200, blank=True, null=True, verbose_name='عنوان آگهی / ریپورتاژ')
    reportage_content = models.TextField(blank=True, null=True, verbose_name='متن ریپورتاژ آگهی')
    reportage_button_text = models.CharField(max_length=50, blank=True, null=True, verbose_name='متن دکمه اقدام (CTA)')
    reportage_button_link = models.CharField(max_length=255, blank=True, null=True, verbose_name='لینک دکمه اقدام')
    reportage_image = models.ImageField(upload_to='blog/reportage/', blank=True, null=True, verbose_name='بنر ریپورتاژ آگهی')
    reportage_badge = models.CharField(max_length=50, default='رپرتاژ آگهی', verbose_name='برچسب آگهی')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')

    class Meta:
        verbose_name = 'مقاله و ریپورتاژ'
        verbose_name_plural = 'مدیریت مقالات و ریپورتاژها'

    def __str__(self):
        return f"{'[ریپورتاژ] ' if self.is_reportage else ''}{self.title}"
