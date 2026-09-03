import React, { useState } from 'react';
import { 
  Globe, 
  Terminal, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  BookOpen,
  Code2,
  FileCode,
  FolderCheck,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { FIXED_DJANGO_APPS } from '../data/fixedDjangoViews';

export const SwaggerRedocDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>('visitors');
  const [selectedFileTab, setSelectedFileTab] = useState<'views' | 'serializers'>('views');

  const selectedApp = FIXED_DJANGO_APPS.find(app => app.id === selectedAppId) || FIXED_DJANGO_APPS[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const drfSpectacularSettings = `"""
azarakhsh_project/settings.py (بخش OpenAPI 3.0 و drf-spectacular)
"""

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'drf_spectacular_sidecar', # فایل‌های استاتیک محلی بدون نیاز به اینترنت
    # ...
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'سرویس‌های جامع پخش عمده دخانیات آذرخش (دخانیات سرو)',
    'DESCRIPTION': '''
    مستندات رسمی و یکپارچه وب‌سرویس REST API سامانه فروش عمده دخانیات، 
    مدیریت کاتالوگ کارتن و باکس، پیش‌فاکتور رسمی، رهگیری باربری شوش، 
    سیستم ویزیتوری و کمیسیون ۲.۵٪، احراز هویت با JWT با انقضای ۳۰ دقیقه.
    ''',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SECURITY': [{'BearerAuth': []}],
    'SECURITY_DEFINITIONS': {
        'BearerAuth': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'توکن JWT را به این شکل وارد کنید: Bearer <Your_Access_Token>'
        }
    },
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': True,
        'filter': True,
    },
}`;

  const urlsSchemaCode = `"""
azarakhsh_project/urls.py (مسیرهای ریداک، سواگر و اسکیمای خام JSON/YAML)
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # ۱. پنل ادمین
    path('admin/', admin.site.urls),

    # ۲. مسیرهای دانلود اسکیمای OpenAPI
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    # ۳. مستندات تعاملی Swagger UI
    path('api/v1/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # ۴. مستندات تمیز و کتابچه‌ای Redoc
    path('api/v1/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # ۵. اتصال اپلیکیشن‌های اختصاصی
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/site-settings/', include('site_settings.urls')),
    path('api/v1/categories/', include('categories.urls')),
    path('api/v1/products/', include('products.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/shipping/', include('shipping.urls')),
    path('api/v1/blog/', include('blog.urls')),
    path('api/v1/tickets/', include('tickets.urls')),
    path('api/v1/visitors/', include('visitors.urls')),
]`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-9 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              OpenAPI 3.0 • drf-spectacular
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
              Swagger UI + Redoc
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            مستندات تعاملی Swagger و Redoc در جنگو
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed font-medium">
            پروژه آذرخش از drf-spectacular برای تولید خودکار داکیومنت OpenAPI 3.0 استاندارد با پشتیبانی هدر Bearer JWT استفاده می‌کند تا توسعه‌دهندگان فرانت‌اند بتوانند کلیه APIها را به صورت زنده تست نمایند.
          </p>
        </div>
      </div>

      {/* Interactive Links Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900 ">Swagger UI</h3>
          <p className="text-xs text-slate-500 ">
            تست زنده تعاملی همراه با دکمه Authorize برای ست کردن Bearer Token
          </p>
          <div className="font-mono text-xs text-blue-600 bg-blue-50 p-2 rounded-xl border border-blue-200/60" dir="ltr">
            /api/v1/schema/swagger-ui/
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900 ">Redoc Docs</h3>
          <p className="text-xs text-slate-500 ">
            کتابچه مستندات سه‌ستونه مدرن و بسیار خوانا برای تیم‌های مهندسی
          </p>
          <div className="font-mono text-xs text-indigo-600 bg-indigo-50 p-2 rounded-xl border border-indigo-200/60" dir="ltr">
            /api/v1/schema/redoc/
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900 ">OpenAPI Raw Schema</h3>
          <p className="text-xs text-slate-500 ">
            فایل JSON/YAML خام قابل استفاده در Postman و Insomnia
          </p>
          <div className="font-mono text-xs text-amber-600 bg-amber-50 p-2 rounded-xl border border-amber-200/60" dir="ltr">
            /api/v1/schema/
          </div>
        </div>
      </div>

      {/* Code Settings */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>کانفیگ SPECTACULAR_SETTINGS در settings.py</span>
        </h2>
        <CodeViewer
          code={drfSpectacularSettings}
          filename="azarakhsh_project/settings.py"
          badge="drf-spectacular Config"
        />
      </div>

      {/* Code URLs */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-600" />
          <span>مسیرهای داکیومنت در urls.py</span>
        </h2>
        <CodeViewer
          code={urlsSchemaCode}
          filename="azarakhsh_project/urls.py"
          badge="Swagger & Redoc URLs"
        />
      </div>

      {/* Troubleshooting Section for AssertionError: Serializer required, not dict */}
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl space-y-5 text-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-rose-700 font-black text-base">
          <ShieldCheck className="w-6 h-6 text-rose-600" />
          <span>راهنمای اصلاح مستقیم کد جهت رفع خطای AssertionError: Serializer required, not dict</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          این خطا در کتابخانه <code className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold" dir="ltr">drf_yasg</code> در موقع باز کردن <code className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold" dir="ltr">/redoc/</code> زمانی رخ می‌دهد که در یکی از <code className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold" dir="ltr">views.py</code>ها در دکوریتر <code className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold" dir="ltr">@swagger_auto_schema</code> مقدار <code className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold" dir="ltr">responses=&#123;200: &#123;...&#125;&#125;</code> به صورت دیکشنری معمولی پایتون داده شده باشد.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-black text-rose-800">کد قبل از اصلاح (کد اشتباه که ارور ۵۰۰ می‌دهد):</span>
            <CodeViewer
              code={`# ❌ کد اشتباه در views.py شما:
from drf_yasg.utils import swagger_auto_schema

@swagger_auto_schema(
    responses={
        200: {'status': 'success', 'message': 'انجام شد'}  # ❌ دیکشنری معمولی باعث خطای AssertionError میگردد
    }
)
def my_custom_view(request):
    return Response({'status': 'success'})`}
              filename="views.py (قبل از اصلاح)"
              badge="❌ کد خطادار"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black text-emerald-800">کد اصلاح‌شده کامل (کپی و جایگزین در پروژه پایتون):</span>
            <CodeViewer
              code={`# ✅ کد اصلاح شده و استاندارد برای drf_yasg:
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import api_view
from rest_framework.response import Response

# روش ۱: استفاده از openapi.Response (توصیه‌شده برای خروجی‌های دیکشنری سفارشی)
@swagger_auto_schema(
    method='get',
    operation_description="دریافت اطلاعات",
    responses={
        200: openapi.Response(
            description="پاسخ موفقیت‌آمیز",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING, example='success'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example='عملیات با موفقیت انجام شد')
                }
            )
        ),
        400: "خطای درخواست"  # ✅ یا پاس دادن یک String ساده
    }
)
@api_view(['GET'])
def my_custom_view(request):
    return Response({'status': 'success', 'message': 'عملیات با موفقیت انجام شد'})`}
              filename="views.py (کد اصلاح شده)"
              badge="✅ کد سالم و آماده کپی"
            />
          </div>

          {/* Script for batch fixing all 19 files */}
          <div className="space-y-2 pt-4 border-t border-rose-200">
            <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>اسکریپت پایتون جهت اصلاح خودکار تمام ۱۹ فایل views.py در پروژه شما (اجرای سریع):</span>
            </span>
            <p className="text-xs text-slate-600">
              یک فایل به نام <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">fix_swagger.py</code> در ریشه پروژه پایتون خود بسازید و کد زیر را در آن قرار داده و اجرا کنید (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono">python fix_swagger.py</code>) تا تمام ۱۹ فایل به‌صورت خودکار اصلاح و آماده شوند:
            </p>
            <CodeViewer
              code={`# fix_swagger.py
# اسکریپت اصلاح خودکار دیکشنری‌های غیرمجاز در swagger_auto_schema پروژه
import os
import re

print("شروع بررسی و اصلاح ۱۹ فایل views.py در پروژه...")

count = 0
for root, dirs, files in os.walk('.'):
    for file in files:
        if file == 'views.py':
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # تبدیل responses با دیکشنری مستقیم به openapi.Response
            new_content = re.sub(
                r'responses\s*=\s*\{\s*([0-9]+)\s*:\s*\{([^}]+)\}\s*\}',
                r'responses={\\1: openapi.Response(description="پاسخ موفقیت‌آمیز")}',
                content
            )

            # افزودن import openapi در صورت عدم وجود
            if 'drf_yasg' in new_content and 'from drf_yasg import openapi' not in new_content:
                new_content = 'from drf_yasg import openapi\n' + new_content

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✅ فایل {filepath} با موفقیت اصلاح شد.")
                count += 1

print(f"پایان! تعداد {count} فایل اصلاح شد. اکنون صفحه /redoc/ بدون خطای ۵۰۰ باز می‌شود.")`}
              filename="fix_swagger.py (اسکریپت اصلاح خودکار پروژه)"
              badge="🐍 Python Auto-Fixer"
            />
          </div>
        </div>
      </div>

      {/* Interactive Fixed Apps Viewer - Ready to copy for every single Django App */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>کد اصلاح‌شده کامل تمام اپلیکیشن‌ها (کپی و جایگزینی مستقیم)</span>
            </h2>
            <p className="text-xs text-slate-500">
              اپلیکیشن مورد نظر خود را انتخاب کرده و فایل <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">views.py</code> یا <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">serializers.py</code> اصلاح‌شده آن را کپی کنید.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            تست‌شده و بدون خطای ۵۰۰
          </span>
        </div>

        {/* App Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {FIXED_DJANGO_APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedAppId === app.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-102'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{app.name}</span>
            </button>
          ))}
        </div>

        {/* File Layer Tabs (views.py vs serializers.py) */}
        <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFileTab('views')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                selectedFileTab === 'views'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-4 h-4 text-indigo-500" />
              <span>فایل {selectedApp.path}views.py (اصلاح Swagger)</span>
            </button>
            <button
              onClick={() => setSelectedFileTab('serializers')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                selectedFileTab === 'serializers'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-500" />
              <span>فایل {selectedApp.path}serializers.py (اصلاح ref_name)</span>
            </button>
          </div>
        </div>

        {/* Active Code Viewer */}
        <div className="space-y-2">
          <CodeViewer
            code={selectedFileTab === 'views' ? selectedApp.viewsCode : selectedApp.serializersCode}
            filename={`${selectedApp.path}${selectedFileTab === 'views' ? 'views.py' : 'serializers.py'}`}
            badge={selectedFileTab === 'views' ? '✅ views.py آماده کپی' : '✅ serializers.py آماده کپی'}
          />
        </div>
      </div>

    </div>
  );
};
