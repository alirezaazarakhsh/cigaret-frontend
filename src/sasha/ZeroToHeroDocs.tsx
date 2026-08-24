import React, { useState } from 'react';
import { 
  Terminal, 
  Database, 
  CheckCircle2, 
  Copy, 
  Check, 
  HelpCircle, 
  Lightbulb, 
  FolderPlus, 
  Cpu, 
  Layers, 
  AlertTriangle,
  Play
} from 'lucide-react';

export const ZeroToHeroDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 text-slate-800 text-right leading-relaxed" dir="rtl">
      
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">آموزش گام‌به‌گام برای افراد مبتدی (Zero to Hero)</div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              راهنمای راه‌اندازی صفر تا ۱۰۰ بک‌اند جنگو و دیتابیس PostgreSQL
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          اگر به تازگی کار با فریم‌ورک قدرتمند جنگو (Django) را آغاز کرده‌اید، این راهنما دقیقا برای شما طراحی شده است.
          در این بخش، از ایجاد محیط مجازی (Virtual Environment) تا نصب پکیج‌ها، اتصال به PostgreSQL، ساخت سوپریوزر و اجرای سرور را به صورت دستوری و تصویری یاد می‌گیرید.
        </p>
      </div>

      {/* Step 1: Virtual Environment */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-black">۱</div>
          <h2>گام اول: ساخت محیط ایزوله مجازی (Virtualenv)</h2>
        </div>
        
        <p className="text-xs sm:text-sm text-slate-600">
          محیط مجازی تضمین می‌کند که پکیج‌های پایتون این پروژه با سایر پروژه‌های سیستم شما تداخل پیدا نکنند.
        </p>

        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700">در ویندوز (CMD / PowerShell):</div>
          <div className="relative bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono text-left" dir="ltr">
            <button 
              onClick={() => handleCopy(`python -m venv venv\n.\\venv\\Scripts\\activate`, 'step1-win')} 
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              {copiedKey === 'step1-win' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <code>
              {`# ساخت محیط مجازی\npython -m venv venv\n\n# فعال‌سازی در ویندوز\n.\\venv\\Scripts\\activate`}
            </code>
          </div>

          <div className="text-xs font-bold text-slate-700">در لینوکس / اوبونتو و مک (Linux / MacOS):</div>
          <div className="relative bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono text-left" dir="ltr">
            <button 
              onClick={() => handleCopy(`python3 -m venv venv\nsource venv/bin/activate`, 'step1-linux')} 
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              {copiedKey === 'step1-linux' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <code>
              {`# ساخت محیط مجازی\npython3 -m venv venv\n\n# فعال‌سازی در لینوکس و مک\nsource venv/bin/activate`}
            </code>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>علامت موفقیت:</strong> پس از فعال‌سازی، نام <code>(venv)</code> در ابتدای خط فرمان ترمینال شما ظاهر خواهد شد.
          </div>
        </div>
      </div>

      {/* Step 2: Requirements.txt */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">۲</div>
          <h2>گام دوم: ایجاد فایل requirements.txt و نصب تمام کتابخانه‌ها</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          یک فایل با نام <code className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded font-mono font-bold">requirements.txt</code> در ریشه پروژه ایجاد کنید و خطوط زیر را در آن قرار دهید:
        </p>

        <div className="relative bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono text-left" dir="ltr">
          <button 
            onClick={() => handleCopy(`Django>=5.0.0,<6.0.0
djangorestframework>=3.14.0
djangorestframework-simplejwt>=5.3.0
drf-yasg>=1.21.7
django-cors-headers>=4.3.1
psycopg2-binary>=2.9.9
django-tinymce>=3.7.1
pillow>=10.2.0
django-filter>=24.1
python-dotenv>=1.0.1
gunicorn>=21.2.0`, 'reqs')} 
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            {copiedKey === 'reqs' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <pre className="overflow-x-auto whitespace-pre">
{`Django>=5.0.0,<6.0.0
djangorestframework>=3.14.0
djangorestframework-simplejwt>=5.3.0
drf-yasg>=1.21.7
django-cors-headers>=4.3.1
psycopg2-binary>=2.9.9
django-tinymce>=3.7.1
pillow>=10.2.0
django-filter>=24.1
python-dotenv>=1.0.1
gunicorn>=21.2.0`}
          </pre>
        </div>

        <div className="text-xs font-bold text-slate-700">دستور نصب تمام پکیج‌ها با یک کلیک:</div>
        <div className="relative bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono text-left" dir="ltr">
          <button 
            onClick={() => handleCopy(`pip install -r requirements.txt`, 'pip-install')} 
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            {copiedKey === 'pip-install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <code>pip install -r requirements.txt</code>
        </div>
      </div>

      {/* Step 3: PostgreSQL Database Setup */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-black">۳</div>
          <h2>گام سوم: ساخت دیتابیس و کاربر در PostgreSQL</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          برای اتصال امن و پایدار جنگو به PostgreSQL، ابتدا با کاربر پیش‌فرض postgres وارد کنسول SQL شوید و دیتابیس اختصاصی را ایجاد کنید:
        </p>

        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700">۱. ورود به ترمینال PostgreSQL:</div>
          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-2xl text-xs font-mono text-left" dir="ltr">
            <code>sudo -u postgres psql</code>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700">۲. اجرای دستورات SQL جهت ساخت کاربر و پایگاه داده:</div>
          <div className="relative bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono text-left" dir="ltr">
            <button 
              onClick={() => handleCopy(`-- ساخت دیتابیس
CREATE DATABASE sevin_tobacco_db;

-- ساخت کاربر با رمز عبور ایمن
CREATE USER sevin_user WITH PASSWORD 'SecurePassword9419@';

-- تنظیم انکودینگ UTF8 استاندارد
ALTER ROLE sevin_user SET client_encoding TO 'utf8';
ALTER ROLE sevin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sevin_user SET timezone TO 'Asia/Tehran';

-- اعطای تمام دسترسی‌ها به کاربر
GRANT ALL PRIVILEGES ON DATABASE sevin_tobacco_db TO sevin_user;
ALTER DATABASE sevin_tobacco_db OWNER TO sevin_user;

-- خروج از محیط psql
\\q`, 'sql-commands')} 
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              {copiedKey === 'sql-commands' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre className="overflow-x-auto whitespace-pre">
{`-- ۱. ساخت دیتابیس
CREATE DATABASE sevin_tobacco_db;

-- ۲. ساخت کاربر با رمز عبور
CREATE USER sevin_user WITH PASSWORD 'SecurePassword9419@';

-- ۳. بهینه‌سازی تنظیمات کاراکتر و زمان
ALTER ROLE sevin_user SET client_encoding TO 'utf8';
ALTER ROLE sevin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sevin_user SET timezone TO 'Asia/Tehran';

-- ۴. دسترسی کامل
GRANT ALL PRIVILEGES ON DATABASE sevin_tobacco_db TO sevin_user;
ALTER DATABASE sevin_tobacco_db OWNER TO sevin_user;

-- ۵. خروج
\\q`}
            </pre>
          </div>
        </div>
      </div>

      {/* Step 4: Django Project Structure */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-black">۴</div>
          <h2>گام چهارم: ساختار پروژه و ساخت اپلیکیشن‌ها (Django Apps)</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          برای اینکه پروژه تفکیک‌شده، منظم و تمیز بماند، دستورات زیر را در پوشه پروژه اجرا کنید:
        </p>

        <div className="relative bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono text-left" dir="ltr">
          <button 
            onClick={() => handleCopy(`# ساخت پوشه اصلی پروژه
django-admin startproject config .

# ساخت اپ‌های اختصاصی برای تفکیک کدها
python manage.py startapp accounts
python manage.py startapp categories
python manage.py startapp products
python manage.py startapp orders
python manage.py startapp shipping
python manage.py startapp blog
python manage.py startapp tickets
python manage.py startapp visitors`, 'create-apps')} 
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            {copiedKey === 'create-apps' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <pre className="overflow-x-auto whitespace-pre">
{`# ساخت پروژه در پوشه فعلی
django-admin startproject config .

# ساخت تک‌تک اپلیکیشن‌ها به صورت ماژولار:
python manage.py startapp accounts
python manage.py startapp categories
python manage.py startapp products
python manage.py startapp orders
python manage.py startapp shipping
python manage.py startapp blog
python manage.py startapp tickets
python manage.py startapp visitors`}
          </pre>
        </div>
      </div>

      {/* Step 5: Migrations & Superuser */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-black">۵</div>
          <h2>گام پنجم: اعمال مایگریشن‌ها و ساخت سوپریوزر (مدیر سایت)</h2>
        </div>

        <div className="relative bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono text-left" dir="ltr">
          <button 
            onClick={() => handleCopy(`python manage.py makemigrations\npython manage.py migrate\npython manage.py createsuperuser`, 'migrate-cmd')} 
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            {copiedKey === 'migrate-cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <pre className="overflow-x-auto whitespace-pre">
{`# ایجاد فایل‌های مایگریشن برای دیتابیس
python manage.py makemigrations

# اعمال جداول روی دیتابیس PostgreSQL
python manage.py migrate

# ساخت کاربر ادمین (نام کاربری، شماره موبایل/ایمیل، رمز عبور)
python manage.py createsuperuser`}
          </pre>
        </div>
      </div>

      {/* Step 6: Run Server */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">۶</div>
          <h2>گام ششم: اجرای سرور تستی جنگو و مشاهده نتایج</h2>
        </div>

        <div className="relative bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono text-left" dir="ltr">
          <button 
            onClick={() => handleCopy(`python manage.py runserver`, 'runserver')} 
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            {copiedKey === 'runserver' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <code>python manage.py runserver</code>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
            <div className="font-bold text-slate-900 mb-1">پنل ادمین جنگو:</div>
            <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="text-blue-600 font-mono underline" dir="ltr">http://127.0.0.1:8000/admin/</a>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
            <div className="font-bold text-slate-900 mb-1">مستندات Swagger:</div>
            <a href="http://127.0.0.1:8000/swagger/" target="_blank" rel="noreferrer" className="text-emerald-600 font-mono underline" dir="ltr">http://127.0.0.1:8000/swagger/</a>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
            <div className="font-bold text-slate-900 mb-1">مستندات Redoc:</div>
            <a href="http://127.0.0.1:8000/redoc/" target="_blank" rel="noreferrer" className="text-purple-600 font-mono underline" dir="ltr">http://127.0.0.1:8000/redoc/</a>
          </div>
        </div>
      </div>

    </div>
  );
};
