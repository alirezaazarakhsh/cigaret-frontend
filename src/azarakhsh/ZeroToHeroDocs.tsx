import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles,
  Zap,
  ArrowRight,
  ExternalLink,
  Layers,
  FileCode,
  Globe
} from 'lucide-react';
import { CodeViewer } from './CodeViewer';

export const ZeroToHeroDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const steps = [
    {
      number: '۱',
      title: 'آماده‌سازی سیستم‌عامل و پایتون ۳.۱۲',
      desc: 'نصب بسته‌های پایه‌ای لینوکس، ابزارهای ساخت C و ایجاد محیط مجازی ایزوله (Virtualenv)',
      command: `sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv python3-dev libpq-dev postgresql postgresql-contrib nginx curl git

# ایجاد پوشه پروژه و محیط مجازی
mkdir -p /var/www/azarakhsh_backend && cd /var/www/azarakhsh_backend
python3 -m venv venv
source venv/bin/activate`
    },
    {
      number: '۲',
      title: 'ساخت دیتابیس PostgreSQL و کاربر امن',
      desc: 'ایجاد دیتابیس اختصاصی azarakhsh_db با کاربر azarakhsh_user و دسترسی‌های کامل',
      command: `sudo -u postgres psql

-- در محیط psql دستورات زیر را وارد نمایید:
CREATE DATABASE azarakhsh_db;
CREATE USER azarakhsh_user WITH PASSWORD 'SevinStrongPass_9419@Secure';
ALTER ROLE azarakhsh_user SET client_encoding TO 'utf8';
ALTER ROLE azarakhsh_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE azarakhsh_user SET timezone TO 'Asia/Tehran';
GRANT ALL PRIVILEGES ON DATABASE azarakhsh_db TO azarakhsh_user;
\\q`
    },
    {
      number: '۳',
      title: 'نصب نیازمندی‌ها (requirements.txt)',
      desc: 'نصب جنگو ۵، DRF، JWT، TinyMCE، drf-spectacular و درایور دیتابیس psycopg2',
      command: `pip install --upgrade pip
pip install django==5.1.4 djangorestframework==3.15.2 djangorestframework-simplejwt==5.3.1 psycopg2-binary==2.9.9 django-cors-headers==4.3.1 drf-spectacular==0.27.2 django-tinymce==4.1.0 gunicorn==22.0.0 uvicorn==0.30.1 pillow==10.4.0 python-dotenv==1.0.1 django-filter==24.2`
    },
    {
      number: '۴',
      title: 'ایجاد پروژه پایه جنگو و اپ‌های زیرمجموعه (Sub-Apps)',
      desc: 'ساخت ساختار اصلی azarakhsh_project و ایجاد ۱۸ اپ زیرمجموعه ماژولار به همراه ساخت فایل‌های serializers.py و urls.py',
      command: `# ۱. ساخت پروژه پایه جنگو
django-admin startproject azarakhsh_project .

# ۲. اسکریپت ساخت خودکار ۱۸ اپ زیرمجموعه به همراه serializers.py و urls.py
for app in accounts roles regular_customers categories products orders pos_system ledger wallet shipping blog tickets visitors site_settings footer_settings sliders kavenegar_sms notifications; do
    python manage.py startapp $app
    touch $app/serializers.py
    touch $app/urls.py
    echo "from django.urls import path, include" > $app/urls.py
    echo "from rest_framework.routers import DefaultRouter" >> $app/urls.py
    echo -e "\nurlpatterns = []\n" >> $app/urls.py
    echo "App '$app' created successfully"
done`
    },
    {
      number: '۵',
      title: 'اجرای مایگریشن‌ها و ایجاد سوپریوزر',
      desc: 'اعمال جداول دیتابیس PostgreSQL و ساخت حساب کاربری مدیر ارشد سامانه',
      command: `python manage.py makemigrations accounts roles regular_customers categories products orders pos_system ledger wallet shipping blog tickets visitors site_settings footer_settings sliders kavenegar_sms notifications
python manage.py migrate
python manage.py createsuperuser --username=admin --email=admin@sevin.ir`
    },
    {
      number: '۶',
      title: 'کانفیگ سرویس Systemd و وب‌سرور Nginx',
      desc: 'اجرای پس‌زمینه پایدار با Gunicorn و پروکسی معکوس امن با گواهی SSL رایگان Let\'s Encrypt',
      command: `# فایل /etc/systemd/system/azarakhsh.service
[Unit]
Description=Azarakhsh Django Gunicorn Daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/azarakhsh_backend
ExecStart=/var/www/azarakhsh_backend/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:8001 azarakhsh_project.wsgi:application

[Install]
WantedBy=multi-user.target

# فعال‌سازی سرویس
sudo systemctl daemon-reload
sudo systemctl start azarakhsh
sudo systemctl enable azarakhsh`
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              راهنمای راه‌اندازی صفر تا صد
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
              Django 5.1 + PostgreSQL 16 + Gunicorn
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            استقرار سریع و تولیدی بک‌اند سامانه پخش عمده دخانیات آذرخش
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed font-medium">
            این راهنما شما را قدم به قدم از سرور لینوکس خام (Ubuntu 22.04/24.04) تا اجرای کامل پایگاه داده PostgreSQL، وب‌سرویس REST API با توکن JWT نیم‌ساعته، داکیومنت سواگر و ادیتور TinyMCE همراهی می‌کند.
          </p>
        </div>
      </div>

      {/* Step by Step Cards */}
      <div className="space-y-6">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          <span>مراحل اجرایی ۶ گانه در ترمینال سرور</span>
        </h2>

        <div className="grid grid-cols-1 gap-5">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-600/20 shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 ">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(step.command, `step-${idx}`)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    copiedKey === `step-${idx}`
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 '
                  }`}
                  title="کپی کردن دستورات"
                >
                  {copiedKey === `step-${idx}` ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی دستورات</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet */}
              <div className="bg-[#0f1422] rounded-2xl p-4 font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800/80" dir="ltr">
                <pre className="leading-relaxed whitespace-pre-wrap">{step.command}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements.txt Specification */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-emerald-600" />
          <span>فایل کامل نیازمندی‌های پروژه (requirements.txt)</span>
        </h2>

        <CodeViewer
          code={`# requirements.txt
# لیست کامل تمام کتابخانه‌ها و پکیج‌های مورد نیاز برای پروژه جنگو ۵ آذرخش

# هسته جنگو و وب‌سرویس REST API
django==5.1.4
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1

# اتصال به دیتابیس PostgreSQL
psycopg2-binary==2.9.9

# هدرهای CORS و فیلترهای API
django-cors-headers==4.3.1
django-filter==24.2

# مستندسازی خودکار API (سواگر و ریداک)
drf-yasg==1.21.8
drf-spectacular==0.27.2

# ادیتور متن پیشرفته و مدیریت تصویر
django-tinymce==4.1.0
pillow==10.4.0

# مدیریت متغیرهای محیطی
python-dotenv==1.0.1

# شمسی‌سازی تاریخ‌ها در ادمین و API
django-jalali-date==2.0.0

# وب‌سرورهای تولیدی (Production WSGI / ASGI)
gunicorn==22.0.0
uvicorn==0.30.1

# پیامک کاوه‌نگار (در صورت نیاز به ارسال SMS)
kavenegar==1.1.2
requests==2.32.3
`}
          filename="requirements.txt"
          title="فایل نیازمندی‌ها جهت نصب یکباره با pip install -r requirements.txt"
          badge="Python Dependencies • Django 5.1 • DRF"
        />
      </div>

      {/* Docker Compose Production Setup */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-600" />
          <span>راه‌اندازی با یک دستور از طریق Docker Compose (خواندن دیتابیس و تنظیمات از فایل .env)</span>
        </h2>

        <div className="space-y-4">
          <CodeViewer
            code={`# docker-compose.yml
version: '3.9'

services:
  # ۱. دیتابیس PostgreSQL 16 (خواندن اطلاعات از .env)
  db:
    image: postgres:16-alpine
    container_name: azarakhsh_postgres_db
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_DB: \${DB_NAME:-azarakhsh_db}
      POSTGRES_USER: \${DB_USER:-azarakhsh_user}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-SevinStrongPass_9419@Secure}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "\${DB_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-azarakhsh_user} -d \${DB_NAME:-azarakhsh_db}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - azarakhsh_network

  # ۲. ردیس جهت کش و صف تسک‌ها
  redis:
    image: redis:7-alpine
    container_name: azarakhsh_redis_cache
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - azarakhsh_network

  # ۳. وب‌سرویس جنگو ۵ (Gunicorn روی پورت 8001)
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: azarakhsh_django_web
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - DB_HOST=db
      - DB_PORT=\${DB_PORT:-5432}
      - DB_NAME=\${DB_NAME:-azarakhsh_db}
      - DB_USER=\${DB_USER:-azarakhsh_user}
      - DB_PASSWORD=\${DB_PASSWORD:-SevinStrongPass_9419@Secure}
      - DJANGO_SECRET_KEY=\${DJANGO_SECRET_KEY}
      - DJANGO_DEBUG=\${DJANGO_DEBUG:-True}
      - DJANGO_ALLOWED_HOSTS=\${DJANGO_ALLOWED_HOSTS:-*}
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "\${BACKEND_PORT:-8001}:8001"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - azarakhsh_network

networks:
  azarakhsh_network:
    driver: bridge

volumes:
  postgres_data:
    name: azarakhsh_postgres_data
  redis_data:
    name: azarakhsh_redis_data
  static_volume:
    name: azarakhsh_static_data
  media_volume:
    name: azarakhsh_media_data`}
            filename="docker-compose.yml"
            title="فایل استقرار کانتینری داکر کمپوز (همگام با .env - پورت 8001)"
            badge="Docker Compose • PostgreSQL 16 • Port 8001"
          />

          <CodeViewer
            code={`# Dockerfile
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# نصب ابزارهای پیش‌نیاز سیستمی، کلاینت PostgreSQL و بیلد C
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
    gcc \\
    curl \\
    netcat-traditional \\
    postgresql-client \\
    libjpeg-dev \\
    zlib1g-dev \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \\
    pip install --no-cache-dir -r requirements.txt

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

COPY . /app/

RUN mkdir -p /app/staticfiles /app/media

EXPOSE 8001

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["gunicorn", "azarakhsh_project.wsgi:application", "--bind", "0.0.0.0:8001", "--workers", "4", "--timeout", "120"]`}
            filename="Dockerfile"
            title="فایل ساخت ایمیج پایتون ۳.۱۲ و جنگو ۵ (Dockerfile روی پورت 8001)"
            badge="Dockerfile • Python 3.12 • Port 8001"
          />
        </div>
      </div>

    </div>
  );
};
