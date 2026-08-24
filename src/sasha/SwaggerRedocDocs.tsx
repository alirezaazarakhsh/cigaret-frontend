import React, { useState } from 'react';
import { Globe, Copy, Check, FileCode, Key, Shield, Sparkles, Terminal, Rocket, ExternalLink } from 'lucide-react';

export const SwaggerRedocDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerComposeCode = `version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: sevin_postgres
    restart: always
    environment:
      POSTGRES_DB: sevin_tobacco_db
      POSTGRES_USER: sevin_user
      POSTGRES_PASSWORD: SecurePassword9419@
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    container_name: sevin_django_api
    restart: always
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
    volumes:
      - .:/app
      - media_volume:/app/media
      - static_volume:/app/staticfiles
    ports:
      - "8000:8000"
    environment:
      - DJANGO_DEBUG=False
      - DB_HOST=db
      - DB_NAME=sevin_tobacco_db
      - DB_USER=sevin_user
      - DB_PASSWORD=SecurePassword9419@
    depends_on:
      - db

volumes:
  postgres_data:
  media_volume:
  static_volume:
`;

  return (
    <div className="space-y-6 text-slate-800 text-right" dir="rtl">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">سواگر، ریداک و دپلوی (Swagger, Redoc & Deployment)</div>
            <h1 className="text-2xl font-black text-slate-900">
              راهنمای تست تعاملی API در Swagger UI و دپلوی بک‌اند جنگو
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          با پکیج <code>drf-yasg</code> مستندات استاندارد OpenAPI برای تمامی متدهای GET, POST, PUT, DELETE به صورت خودکار تولید و همراه با فرم احراز هویت JWT آماده استفاده است.
        </p>
      </div>

      {/* Swagger vs Redoc */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Swagger Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              محیط تعاملی Swagger UI
            </h3>
            <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg font-bold">
              /swagger/
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            امکان ارسال مستقیم ریکوئست (Try it out)، ارسال داده‌های JSON در بادی، و تست عملیات لاگین، فاکتور و کاتالوگ.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 font-bold text-slate-700">
            <div className="text-blue-600">نحوه زدن توکن در Swagger:</div>
            <div className="text-[11px] text-slate-500 font-normal">
              ۱. روی دکمه سبز رنگ <strong>Authorize</strong> در بالای صفحه کلیک کنید.<br />
              ۲. مقدار توکن را با فرمت <code>Bearer &lt;your_token&gt;</code> وارد و تأیید نمایید.
            </div>
          </div>
        </div>

        {/* Redoc Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              مستندات تمیز و مدرن Redoc
            </h3>
            <span className="text-[11px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg font-bold">
              /redoc/
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            محیط فوق‌العاده خوانا و سه‌ستونه با نمایش مدل‌های داده، پارامترهای هدر، کدهای وضعیت HTTP 200/400/500 و نمونه پاسخ‌های JSON.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 font-bold text-slate-700">
            <div className="text-purple-600">مزیت ریداک:</div>
            <div className="text-[11px] text-slate-500 font-normal">
              مناسب برای ارائه به تیم فرانت‌اند، مطالعه ساختار دیتا تایپ‌ها و مشاهده شمای کامل پایگاه داده.
            </div>
          </div>
        </div>

      </div>

      {/* Docker Compose File */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <Rocket className="w-5 h-5 text-blue-600" />
            <span>فایل docker-compose.yml برای دپلوی یکپارچه جنگو و PostgreSQL</span>
          </div>
          <button
            onClick={() => handleCopy(dockerComposeCode, 'docker')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            {copiedKey === 'docker' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی فایل داکر</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs overflow-x-auto text-left" dir="ltr">
          <pre className="whitespace-pre">{dockerComposeCode}</pre>
        </div>

        <div className="text-xs font-bold text-slate-700">دستور اجرای داکر در سرور:</div>
        <div className="bg-slate-900 text-slate-100 p-3.5 rounded-2xl text-xs font-mono text-left" dir="ltr">
          <code>docker-compose up -d --build</code>
        </div>
      </div>

    </div>
  );
};
