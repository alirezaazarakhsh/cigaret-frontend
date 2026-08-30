import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  Send, 
  Layers, 
  Database, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Plus, 
  UploadCloud, 
  Code,
  Zap,
  Radio,
  FileCode,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { CigaretteProduct } from '../types';
import { formatNumberFa } from '../utils/formatters';

interface BackendConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: CigaretteProduct[];
  onProductsUpdated?: (products: CigaretteProduct[]) => void;
  showToast?: (msg: string) => void;
}

export const BackendConnectionModal: React.FC<BackendConnectionModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductsUpdated,
  showToast = () => {},
}) => {
  const [baseUrlInput, setBaseUrlInput] = useState<string>(() => api.config.getBaseUrl());
  const [webAppUrlInput, setWebAppUrlInput] = useState<string>(() => api.config.getWebAppUrl());
  const [tokenInput, setTokenInput] = useState<string>(() => api.config.getToken());
  
  // Connection Testing Status
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    status: number;
    message: string;
    latencyMs: number;
  } | null>(null);

  // Syncing / Adding Products state
  const [isSyncingBulk, setIsSyncingBulk] = useState(false);
  const [isAddingTestProduct, setIsAddingTestProduct] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active section tab inside modal
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'endpoints' | 'sync_products' | 'docs'>('config');

  useEffect(() => {
    if (isOpen) {
      setBaseUrlInput(api.config.getBaseUrl());
      setWebAppUrlInput(api.config.getWebAppUrl());
      setTokenInput(api.config.getToken());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    api.config.setBaseUrl(baseUrlInput);
    api.config.setWebAppUrl(webAppUrlInput);
    api.config.setToken(tokenInput);
    showToast('تنظیمات Base URL و آدرس وب‌اپلیکیشن با موفقیت ذخیره شد.');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await api.config.testConnection(baseUrlInput, tokenInput);
      setTestResult(result);
      if (result.connected) {
        showToast('ارتباط با سرور بک‌اند با موفقیت برقرار است.');
      } else {
        showToast('خطا در ارتباط با سرور بک‌اند.');
      }
    } catch (e: any) {
      setTestResult({
        connected: false,
        status: 0,
        message: 'امکان اتصال به سرور وجود ندارد.',
        latencyMs: 0,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddSampleProduct = async () => {
    setIsAddingTestProduct(true);
    try {
      const testProd: Partial<CigaretteProduct> = {
        nameFa: `مارلبرو قرمز تستی (${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })})`,
        nameEn: 'Marlboro Red Test Edition',
        brand: 'مارلبرو',
        category: 'cigarettes',
        origin: 'سوییس',
        cartonPrice: 42500000,
        boxPrice: 850000,
        boxesPerCarton: 50,
        packsPerBox: 10,
        stockCartons: 25,
        moq: 1,
        barcode: `62600${Math.floor(100000 + Math.random() * 900000)}`,
        tar: '9mg',
        nicotine: '0.7mg',
        image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=400&q=80',
        description: 'محصول تستی ایجاد شده از طریق پنل اتصال به سرور (POST /api/v1/products/)',
        isAvailable: true,
      };

      const created = await api.products.create(testProd);
      if (onProductsUpdated) {
        onProductsUpdated([created, ...products]);
      }
      showToast(`محصول تستی با موفقیت اضافه شد (شناسه: ${created.id}).`);
    } catch (e) {
      showToast('خطا در ثبت محصول تستی.');
    } finally {
      setIsAddingTestProduct(false);
    }
  };

  const handleBulkSyncProducts = async () => {
    setIsSyncingBulk(true);
    try {
      const result = await api.products.syncBulk(products);
      if (result.success) {
        showToast(`تعداد ${formatNumberFa(result.synced)} محصول با موفقیت به سرور بک‌اند ارسال گردید.`);
      } else {
        showToast('سرور پاسخ نداد. محصولات در حافظه محلی ذخیره شده‌اند.');
      }
    } catch (e) {
      showToast('خطا در همگام‌سازی محصولات.');
    } finally {
      setIsSyncingBulk(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast('در حافظه کپی شد.');
  };

  const ENDPOINTS_LIST = [
    {
      module: 'محصولات و کاتالوگ (Products)',
      items: [
        { method: 'GET', path: '/products/', desc: 'دریافت فهرست تمام کالاها با فیلتر دسته‌بندی و جستجو' },
        { method: 'POST', path: '/products/', desc: 'افزودن کالای جدید به انبار و دیتابیس' },
        { method: 'GET', path: '/products/:id/', desc: 'دریافت مشخصات تکی یک کالا' },
        { method: 'PUT/PATCH', path: '/products/:id/', desc: 'ویرایش مشخصات یا قیمت کالا' },
        { method: 'PATCH', path: '/products/:id/stock/', desc: 'کسر یا افزایش تعداد کارتن موجودی انبار' },
        { method: 'DELETE', path: '/products/:id/', desc: 'حذف کالا از کاتالوگ' },
      ]
    },
    {
      module: 'سفارشات و فاکتورها (Orders)',
      items: [
        { method: 'POST', path: '/orders/', desc: 'ثبت نهایی سفارش خرید عمده و صدور پیش‌فاکتور' },
        { method: 'GET', path: '/orders/?phone=...', desc: 'دریافت سوابق سفارشات یک مشتری یا کل بنکداری' },
        { method: 'GET', path: '/orders/track/:code/', desc: 'استعلام مرحله‌ای وضعیت بارگیری و بیجک باربری' },
      ]
    },
    {
      module: 'مشتریان و باشگاه سوپرمارکت‌ها (Customers & Retail)',
      items: [
        { method: 'POST', path: '/auth/login-otp/', desc: 'ورود یا ثبت‌نام با شماره موبایل' },
        { method: 'GET', path: '/customers/profile/', desc: 'دریافت اطلاعات هویتی و حقوقی خریدار' },
        { method: 'PUT', path: '/customers/profile/', desc: 'ویرایش کد اقتصادی، شناسه ملی و نشانی انبار' },
        { method: 'GET', path: '/customers/retail-shops/', desc: 'فهرست سوپرمارکت‌ها و مشتریان حضوری' },
        { method: 'POST', path: '/customers/retail-shops/', desc: 'ثبت مغازه و صدور لینک اختصاصی وب‌اپ' },
      ]
    },
    {
      module: 'صندوق فروش و فیش حرارتی (POS & Cashier)',
      items: [
        { method: 'POST', path: '/pos/receipts/', desc: 'ثبت فاکتور تحویل حضوری و کسر اتوماتیک انبار' },
        { method: 'GET', path: '/pos/receipts/', desc: 'فهرست تراکنش‌ها و تسویه‌های کارتخوان' },
      ]
    },
    {
      module: 'نرخ لحظه‌ای و تنظیمات (Prices & Site Settings)',
      items: [
        { method: 'GET', path: '/prices/live/', desc: 'دریافت نرخ لحظه‌ای و نمودار تغییرات قیمت' },
        { method: 'POST', path: '/prices/update/', desc: 'به‌روزرسانی قیمت کارتن و باکس' },
        { method: 'GET', path: '/site-settings/public-config/', desc: 'دریافت شماره کارت‌ها، شبا و متون بنکداری' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between gap-4 border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-md">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">مدیریت اتصال سرور و API Base URL</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  معماری ماژولار
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تنظیم آدرس سرور بک‌اند (Django / Node)، بررسی وضعیت اتصال، لینک ورسل و اضافه کردن کالاها
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 ${
              activeSubTab === 'config'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>تنظیم Base URL و تست اتصال</span>
          </button>

          <button
            onClick={() => setActiveSubTab('endpoints')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 ${
              activeSubTab === 'endpoints'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>لیست اندپوینت‌های متصل (Endpoints)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sync_products')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 ${
              activeSubTab === 'sync_products'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>افزودن کالا و همگام‌سازی سرور</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: Base URL & Connection Testing */}
          {activeSubTab === 'config' && (
            <div className="space-y-6">
              
              {/* Vercel Web App Address Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">آدرس وب‌اپلیکیشن مشتریان در ورسل (Vercel):</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-bold">
                    لینک‌های تولید شده در صدور فاکتور، اسکن QR و ورود مشتریان بر پایه دامنهٔ زیر تولید می‌شوند:
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-300 font-mono text-xs font-black text-blue-700" dir="ltr">
                    <span>{webAppUrlInput || api.config.DEFAULT_WEB_APP_URL}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(webAppUrlInput || api.config.DEFAULT_WEB_APP_URL, 'vercel-url')}
                  className="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 shadow-xs"
                >
                  {copiedKey === 'vercel-url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>کپی آدرس ورسل</span>
                </button>
              </div>

              {/* Form to Set Base URL */}
              <form onSubmit={handleSaveConfig} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span>تنظیم API Base URL بک‌اند:</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    (تغییرات فوراً بر روی کلیه بخش‌ها اعمال می‌شود)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Backend Base URL Input */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700">
                      آدرس اصلی وب‌سرویس بک‌اند (API Base URL):
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={baseUrlInput}
                        onChange={(e) => setBaseUrlInput(e.target.value)}
                        placeholder="https://cigar.sevinhost.ir/api/v1 یا https://cigaretsevin.vercel.app/api/v1"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-left"
                        dir="ltr"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      نمونه آدرس‌های متداول: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">https://cigar.sevinhost.ir/api/v1</code> یا <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">http://localhost:8001/api/v1</code>
                    </p>
                  </div>

                  {/* Web App Domain Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      دامنه و آدرس وب‌اپلیکیشن (Frontend Web App URL):
                    </label>
                    <input
                      type="text"
                      value={webAppUrlInput}
                      onChange={(e) => setWebAppUrlInput(e.target.value)}
                      placeholder="https://cigaretsevin.vercel.app"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-blue-500 text-left"
                      dir="ltr"
                    />
                  </div>

                  {/* Auth Token Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      توکن احراز هویت / API Token (اختیاری):
                    </label>
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Token abc123xyz... یا Bearer eyJhbGci..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-blue-500 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>ذخیره تنظیمات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBaseUrlInput(api.config.DEFAULT_BASE_URL);
                        setWebAppUrlInput(api.config.DEFAULT_WEB_APP_URL);
                      }}
                      className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-xl text-xs font-bold transition-colors"
                    >
                      بازنشانی به پیش‌فرض ورسل
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'در حال تست ارتباط...' : 'تست آنلاین اتصال به سرور'}</span>
                  </button>
                </div>
              </form>

              {/* Test Result Display */}
              {testResult && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                  testResult.connected 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  {testResult.connected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs">
                    <div className="font-black flex items-center gap-2">
                      <span>{testResult.connected ? 'ارتباط برقرار است (Online)' : 'سرور در دسترس نیست / در حالت آفلاین محلی (Fallback)'}</span>
                      {testResult.latencyMs > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/80 font-mono">
                          {testResult.latencyMs}ms
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {testResult.message}
                    </p>
                    {!testResult.connected && (
                      <p className="text-[10px] text-slate-500 pt-1">
                        نکته: تا زمانی که بک‌اند را بالا بیاورید، تمامی فرم‌ها، کاتالوگ و صدور فاکتور در مرورگر با پایداری ۱۰۰٪ کار می‌کنند و به محض راه‌اندازی سرور، درخواست‌ها مستقیم ارسال خواهند شد.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Endpoints List */}
          {activeSubTab === 'endpoints' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-black text-slate-900">فهرست اندپوینت‌های استاندارد آمادهٔ اتصال:</h4>
                <span className="text-xs font-mono bg-slate-100 text-blue-700 px-2.5 py-1 rounded-lg border border-slate-200" dir="ltr">
                  Base: {api.config.getBaseUrl()}
                </span>
              </div>

              <div className="space-y-4">
                {ENDPOINTS_LIST.map((group, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-black text-xs text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>{group.module}</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {group.items.map((ep, epIdx) => (
                        <div key={epIdx} className="p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs hover:bg-slate-50/60 transition-colors">
                          <div className="flex items-center gap-2.5 font-mono" dir="ltr">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              ep.method.includes('GET') ? 'bg-emerald-100 text-emerald-800' :
                              ep.method.includes('POST') ? 'bg-blue-100 text-blue-800' :
                              ep.method.includes('PATCH') || ep.method.includes('PUT') ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {ep.method}
                            </span>
                            <span className="font-bold text-slate-900">{ep.path}</span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-medium sm:text-left">
                            {ep.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Sync & Add Products */}
          {activeSubTab === 'sync_products' && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>تست عملیات افزودن کالا و ارسال دسته‌ای به بک‌اند:</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  با کلیک روی دکمه‌های زیر می‌توانید یک کالای تستی را از طریق متد <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">POST /api/v1/products/</code> به سرور بفرستید یا کل کاتالوگ موجود را به سرور جدید منتقل نمایید.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-slate-900">۱. افزودن یک کالای تستی (POST)</h5>
                      <p className="text-[11px] text-slate-500">
                        ایجاد یک رکورد سیگار جدید در جدول کالاها و ثبت خودکار در کاتالوگ فروشگاه
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSampleProduct}
                      disabled={isAddingTestProduct}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Plus className={`w-4 h-4 ${isAddingTestProduct ? 'animate-spin' : ''}`} />
                      <span>{isAddingTestProduct ? 'در حال ثبت در سرور...' : '+ ثبت محصول تستی جدید'}</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-slate-900">۲. همگام‌سازی دسته‌ای ({formatNumberFa(products.length)} کالا)</h5>
                      <p className="text-[11px] text-slate-500">
                        ارسال کلیه محصولات و دسته‌بندی‌ها به اندپوینت <code className="font-mono text-[10px]">/products/bulk-sync/</code>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBulkSyncProducts}
                      disabled={isSyncingBulk}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <UploadCloud className={`w-4 h-4 ${isSyncingBulk ? 'animate-spin' : ''}`} />
                      <span>{isSyncingBulk ? 'در حال ارسال کالاها...' : 'ارسال همه کالاها به سرور جدید'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample Code for Backend Developer */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-2.5 font-mono text-xs" dir="ltr">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Curl Request Sample (Add Product):</span>
                  <button
                    onClick={() => handleCopy(`curl -X POST "${api.config.getBaseUrl()}/products/" -H "Content-Type: application/json" -d '{"name_fa":"مارلبرو تاچ","brand":"مارلبرو","carton_price":45000000,"box_price":900000}'`, 'curl-sample')}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    {copiedKey === 'curl-sample' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[11px] text-emerald-400 p-2 bg-slate-950 rounded-xl">
{`curl -X POST "${api.config.getBaseUrl()}/products/" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name_fa": "مارلبرو تاچ مشکی",
    "name_en": "Marlboro Touch Black",
    "brand": "مارلبرو",
    "category": "cigarettes",
    "carton_price": 45000000,
    "box_price": 900000,
    "boxes_per_carton": 50,
    "stock_cartons": 20
  }'`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-bold">
            وضعیت فعلی: <span className="font-mono text-slate-700" dir="ltr">{api.config.getBaseUrl()}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};
