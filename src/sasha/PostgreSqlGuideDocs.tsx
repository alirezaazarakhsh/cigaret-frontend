import React, { useState } from 'react';
import { Database, Terminal, CheckCircle2, Copy, Check, ShieldAlert, Cpu, HardDrive, Key, Server, RefreshCw } from 'lucide-react';

export const PostgreSqlGuideDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
            <Database className="w-4 h-4" />
            <span>پایگاه داده رابطه‌ای سازمانی</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            راهنمای جامع پایگاه داده PostgreSQL برای جنگو (مبتدی تا پیشرفته)
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-3xl">
            آموزش نصب، پیکربندی انکودینگ UTF-8 فارسی، ساخت کاربر با دسترسی‌های کامل، دستورات نگهداری، مایگریشن‌ها و پشتیبان‌گیری خودکار (pg_dump).
          </p>
        </div>
      </div>

      {/* SECTION 1: Installation on Ubuntu / Debian / Docker */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            ۱. نصب PostgreSQL روی سرور اوبونتو / دبیان یا لینوکس
          </h2>
          <p className="text-xs text-slate-500 mt-1">اجرای پکیج‌های رسمی PostgreSQL و درایورهای مورد نیاز پایتون</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
            <span>Terminal (Ubuntu/Debian)</span>
            <button
              onClick={() => handleCopy('pg_install', `# ۱. به‌روزرسانی مخازن لینوکس
sudo apt update && sudo apt upgrade -y

# ۲. نصب سرور PostgreSQL و کتابخانه‌های توسعه
sudo apt install postgresql postgresql-contrib libpq-dev python3-dev -y

# ۳. فعال‌سازی و استارت سرویس PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# ۴. بررسی وضعیت سرویس
sudo systemctl status postgresql`)}
              className="flex items-center gap-1 text-slate-300 hover:text-white"
            >
              {copiedKey === 'pg_install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'pg_install' ? 'کپی شد' : 'کپی دستورات نصب'}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-emerald-400" dir="ltr">
{`# 1. آپدیت مخازن سیستم
sudo apt update

# 2. نصب پست‌گرس و کتابخانه‌های کامپایلر
sudo apt install postgresql postgresql-contrib libpq-dev python3-dev -y

# 3. اطمینان از اجرای سرویس
sudo systemctl enable postgresql
sudo systemctl start postgresql`}
          </pre>
        </div>
      </section>

      {/* SECTION 2: SQL Scripts for Database Creation */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-600" />
            ۲. اسکریپت کامل SQL جهت ساخت دیتابیس، کاربر و دسترسی‌ها
          </h2>
          <p className="text-xs text-slate-500 mt-1">این دستورات تضمین می‌کنند جنگو با متون فارسی و تراکنش‌های همزمان مشکلی نخواهد داشت.</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
            <span>SQL Statements (psql)</span>
            <button
              onClick={() => handleCopy('pg_sql', `sudo -u postgres psql

-- ساخت پایگاه داده با یونیکد استاندارد
CREATE DATABASE sevin_db 
  WITH 
  OWNER = postgres 
  ENCODING = 'UTF8' 
  LC_COLLATE = 'en_US.UTF-8' 
  LC_CTYPE = 'en_US.UTF-8' 
  TEMPLATE = template0;

-- ساخت کاربر برنامه با کلمه عبور قوی
CREATE USER sevin_user WITH ENCRYPTED PASSWORD 'SevinStrongPass123!@#';

-- بهینه‌سازی پارامترهای ارتباطی برای جنگو
ALTER ROLE sevin_user SET client_encoding TO 'utf8';
ALTER ROLE sevin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sevin_user SET timezone TO 'Asia/Tehran';

-- واگذاری کلیه دسترسی‌ها
GRANT ALL PRIVILEGES ON DATABASE sevin_db TO sevin_user;
ALTER DATABASE sevin_db OWNER TO sevin_user;

-- اعطای دسترسی به اسکیما در پست‌گرس ۱۵ به بعد
\\c sevin_db
GRANT ALL ON SCHEMA public TO sevin_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sevin_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sevin_user;

\\q`)}
              className="flex items-center gap-1 text-slate-300 hover:text-white"
            >
              {copiedKey === 'pg_sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'pg_sql' ? 'کپی شد' : 'کپی دستورات SQL'}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-amber-300" dir="ltr">
{`sudo -u postgres psql

CREATE DATABASE sevin_db ENCODING 'UTF8';
CREATE USER sevin_user WITH ENCRYPTED PASSWORD 'SevinStrongPass123!@#';

ALTER ROLE sevin_user SET client_encoding TO 'utf8';
ALTER ROLE sevin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sevin_user SET timezone TO 'Asia/Tehran';

GRANT ALL PRIVILEGES ON DATABASE sevin_db TO sevin_user;
ALTER DATABASE sevin_db OWNER TO sevin_user;

\\c sevin_db
GRANT ALL ON SCHEMA public TO sevin_user;
\\q`}
          </pre>
        </div>
      </section>

      {/* SECTION 3: Django settings.py snippet */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            ۳. اتصال در settings.py جنگو (محیط محلی و پروداکشن)
          </h2>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
          <pre className="p-4 overflow-x-auto text-sky-300" dir="ltr">
{`DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'sevin_db'),
        'USER': os.environ.get('DB_USER', 'sevin_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'SevinStrongPass123!@#'),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'CONN_MAX_AGE': 600,  # نگه‌داشتن اتصالات تا ۱۰ دقیقه جهت افزایش سرعت
    }
}`}
          </pre>
        </div>
      </section>

      {/* SECTION 4: Troubleshooting & Backup Guide */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-600" />
          ۴. دستورات بکاپ‌گیری (Backup) و بازگردانی (Restore)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="font-bold text-slate-900">تهیه نسخه پشتیبان (Dump):</div>
            <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto" dir="ltr">
pg_dump -U sevin_user -h 127.0.0.1 -d sevin_db -F c -b -v -f sevin_backup.dump
            </pre>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="font-bold text-slate-900">بازگردانی دیتابیس (Restore):</div>
            <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto" dir="ltr">
pg_restore -U sevin_user -h 127.0.0.1 -d sevin_db -v sevin_backup.dump
            </pre>
          </div>
        </div>
      </section>

    </div>
  );
};
