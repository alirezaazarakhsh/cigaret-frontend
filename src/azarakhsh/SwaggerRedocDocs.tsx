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
  FileCode
} from 'lucide-react';
import { CodeViewer } from './CodeViewer';

export const SwaggerRedocDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
    'TITLE': 'سرویس‌های جامع پخش عمده دخانیات آذرخش (سوین)',
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-black">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Swagger UI</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تست زنده تعاملی همراه با دکمه Authorize برای ست کردن Bearer Token
          </p>
          <div className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 p-2 rounded-xl border border-blue-200/60" dir="ltr">
            /api/v1/schema/swagger-ui/
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center font-black">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Redoc Docs</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            کتابچه مستندات سه‌ستونه مدرن و بسیار خوانا برای تیم‌های مهندسی
          </p>
          <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-xl border border-indigo-200/60" dir="ltr">
            /api/v1/schema/redoc/
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center font-black">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">OpenAPI Raw Schema</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            فایل JSON/YAML خام قابل استفاده در Postman و Insomnia
          </p>
          <div className="font-mono text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 p-2 rounded-xl border border-amber-200/60" dir="ltr">
            /api/v1/schema/
          </div>
        </div>
      </div>

      {/* Code Settings */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
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
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-600" />
          <span>مسیرهای داکیومنت در urls.py</span>
        </h2>
        <CodeViewer
          code={urlsSchemaCode}
          filename="azarakhsh_project/urls.py"
          badge="Swagger & Redoc URLs"
        />
      </div>

    </div>
  );
};
