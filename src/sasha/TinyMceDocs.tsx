import React, { useState } from 'react';
import { 
  FileEdit, 
  Copy, 
  Check, 
  CheckCircle2, 
  Image, 
  Code, 
  AlignRight, 
  Settings, 
  Sparkles 
} from 'lucide-react';

export const TinyMceDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-amber-700 via-orange-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/30">
            <FileEdit className="w-4 h-4" />
            <span>ویرایشگر متنی غنی (WYSIWYG)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            راهنمای ادغام ویرایشگر متنی TinyMCE در فریم‌ورک جنگو
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-3xl">
            نحوه نصب پکیج <code className="font-mono text-white bg-black/30 px-1.5 py-0.5 rounded">django-tinymce</code>، فعال‌سازی حالت راست‌چین فارسی (RTL)، فیلد <code className="font-mono text-white bg-black/30 px-1.5 py-0.5 rounded">HTMLField</code> در مدل‌ها و آپلود عکس درون متن مقالات و کاتالوگ.
          </p>
        </div>
      </div>

      {/* STEP 1: Installation & Settings */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            ۱. نصب و تنظیمات کامل در settings.py
          </h2>
          <p className="text-xs text-slate-500 mt-1">تنظیم پکیج و اضافه کردن تولبار کامل، دکمه‌های چپ‌چین/راست‌چین، درج جدول و آپلود تصویر.</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
            <span>settings.py</span>
            <button
              onClick={() => handleCopy('tiny_settings', `# 1. در INSTALLED_APPS اضافه کنید:
INSTALLED_APPS = [
    ...
    'tinymce',
]

# 2. پیکربندی کامل تولبار و زبان فارسی:
TINYMCE_DEFAULT_CONFIG = {
    'height': 450,
    'width': '100%',
    'cleanup_on_startup': True,
    'custom_undo_redo_levels': 20,
    'selector': 'textarea',
    'theme': 'silver',
    'plugins': '''
        directionality autolink link image lists preview hr
        table code help wordcount visualblocks media
    ''',
    'toolbar': '''
        undo redo | formatselect fontselect fontsizeselect |
        bold italic underline strikethrough | forecolor backcolor |
        ltr rtl | alignleft aligncenter alignright alignjustify |
        bullist numlist outdent indent | link image media table |
        removeformat code preview fullscreen
    ''',
    'directionality': 'rtl',
    'language': 'fa',
    'menubar': 'file edit view insert format tools table help',
    'toolbar_mode': 'sliding',
    'image_advtab': True,
}`)}
              className="flex items-center gap-1 text-slate-300 hover:text-white"
            >
              {copiedKey === 'tiny_settings' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'tiny_settings' ? 'کپی شد' : 'کپی تنظیمات'}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-amber-300" dir="ltr">
{`INSTALLED_APPS = [
    ...
    'tinymce',
]

TINYMCE_DEFAULT_CONFIG = {
    'height': 450,
    'theme': 'silver',
    'directionality': 'rtl',  # راست‌چین پیش‌فرض برای زبان فارسی
    'language': 'fa',
    'plugins': 'directionality autolink link image lists hr table code visualblocks preview',
    'toolbar': '''
        undo redo | formatselect | bold italic underline |
        ltr rtl | alignleft aligncenter alignright alignjustify |
        bullist numlist | link image table | code preview
    ''',
}`}
          </pre>
        </div>
      </section>

      {/* STEP 2: Use in models.py */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-600" />
            ۲. استفاده از HTMLField در models.py
          </h2>
          <p className="text-xs text-slate-500 mt-1">به جای TextField ساده، از HTMLField استفاده می‌کنیم تا در پنل ادمین ادیتور TinyMCE نمایش داده شود.</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
            <span>blog/models.py یا catalog/models.py</span>
            <button
              onClick={() => handleCopy('tiny_model', `from django.db import models
from tinymce.models import HTMLField

class BlogPost(models.Model):
    title = models.CharField(max_length=255, verbose_name="عنوان مقاله")
    slug = models.SlugField(max_length=255, unique=True, allow_unicode=True, verbose_name="اسلاگ سئو")
    
    # فیلد ادیتور غنی TinyMCE
    content = HTMLField(verbose_name="متن کامل مقاله با ادیتور متنی")
    
    cover_image = models.ImageField(upload_to="blog/covers/", verbose_name="تصویر شاخص")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ نگارش")

    class Meta:
        verbose_name = "مقاله وبلاگ"
        verbose_name_plural = "مقالات وبلاگ"

    def __str__(self):
        return self.title`)}
              className="flex items-center gap-1 text-slate-300 hover:text-white"
            >
              {copiedKey === 'tiny_model' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'tiny_model' ? 'کپی شد' : 'کپی کد مدل'}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-emerald-300" dir="ltr">
{`from django.db import models
from tinymce.models import HTMLField

class BlogPost(models.Model):
    title = models.CharField(max_length=255, verbose_name="عنوان مقاله")
    
    # این فیلد در پنل ادمین با ادیتور کامل TinyMCE رندر می‌شود
    content = HTMLField(verbose_name="متن مقاله")`}
          </pre>
        </div>
      </section>

      {/* STEP 3: Admin & URLs */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <AlignRight className="w-5 h-5 text-amber-600" />
            ۳. افزودن مسیر TinyMCE در urls.py ریشه
          </h2>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
          <pre className="p-4 overflow-x-auto text-sky-300" dir="ltr">
{`from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tinymce/', include('tinymce.urls')),  # لود اسکریپت‌ها و آپلود عکس‌های ادیتور
]`}
          </pre>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
          <span>پس از این مرحله، با ورود به پنل ادمین جنگو (/admin/) و ایجاد یک مقاله یا ویرایش توضیحات محصول، ادیتور فارسی و راست‌چین TinyMCE فعال خواهد بود!</span>
        </div>
      </section>

    </div>
  );
};
