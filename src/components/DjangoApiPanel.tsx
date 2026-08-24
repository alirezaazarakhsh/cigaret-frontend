import React, { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Check, 
  Code2, 
  Send,
  CreditCard,
  Package,
  Layers,
  Sparkles,
  Truck,
  BookOpen,
  User,
  MessageSquare,
  ShieldCheck,
  Phone,
  Terminal,
  Settings,
  ListFilter,
  FileCode,
  Download,
  ExternalLink,
  ChevronRight,
  Globe,
  Sliders,
  FolderTree,
  FileText,
  Search,
  CheckSquare,
  Clock,
  Eye,
  Plus
} from 'lucide-react';
import { DjangoCrmConfig, CigaretteProduct } from '../types';
import { formatNumberFa, formatToman } from '../utils/formatters';
import { DJANGO_APPS_DATA, DJANGO_PROJECT_CONFIG, DjangoAppCode } from '../data/djangoCodebase';
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_BASE_URL } from '../services/apiConfig';

interface DjangoApiPanelProps {
  config: DjangoCrmConfig;
  onUpdateConfig: (config: DjangoCrmConfig) => void;
  onSyncWithDjango: () => Promise<void>;
  onAddNewProduct: (product: Partial<CigaretteProduct>) => void;
  productsCount: number;
}

export const DjangoApiPanel: React.FC<DjangoApiPanelProps> = ({
  config,
  onUpdateConfig,
  onSyncWithDjango,
  onAddNewProduct,
  productsCount,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Navigation tabs in panel
  const [panelView, setPanelView] = useState<'modular_apps' | 'admin_simulator' | 'api_explorer' | 'project_config' | 'dynamic_settings'>('modular_apps');
  
  // Selected App and File Layer
  const [selectedAppId, setSelectedAppId] = useState<string>('accounts');
  const [selectedLayer, setSelectedLayer] = useState<'models' | 'admin' | 'serializers' | 'views' | 'urls'>('models');
  
  // Project Config Sub-tab
  const [selectedConfigTab, setSelectedConfigTab] = useState<'settings' | 'urls' | 'requirements' | 'manage' | 'env' | 'setupScript'>('settings');

  // Admin Simulator state
  const [adminActiveModel, setAdminActiveModel] = useState<'users' | 'products' | 'orders' | 'tickets'>('users');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminFilterRole, setAdminFilterRole] = useState('all');

  // Sync state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Global Base URL state
  const [apiUrlInput, setApiUrlInput] = useState<string>(() => getApiBaseUrl());
  const [baseUrlSaveSuccess, setBaseUrlSaveSuccess] = useState(false);

  // Dynamic Settings States
  const [bankCard1Input, setBankCard1Input] = useState(config.bankCard1 || '');
  const [bankShiba1Input, setBankShiba1Input] = useState(config.bankShiba1 || '');
  const [bankHolder1Input, setBankHolder1Input] = useState(config.bankHolder1 || '');
  const [bankCard2Input, setBankCard2Input] = useState(config.bankCard2 || '');
  const [bankShiba2Input, setBankShiba2Input] = useState(config.bankShiba2 || '');
  const [bankHolder2Input, setBankHolder2Input] = useState(config.bankHolder2 || '');
  const [contractTextInput, setContractTextInput] = useState(config.visitorContractText || '');
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (config) {
      setBankCard1Input(config.bankCard1 || '');
      setBankShiba1Input(config.bankShiba1 || '');
      setBankHolder1Input(config.bankHolder1 || '');
      setBankCard2Input(config.bankCard2 || '');
      setBankShiba2Input(config.bankShiba2 || '');
      setBankHolder2Input(config.bankHolder2 || '');
      setContractTextInput(config.visitorContractText || '');
    }
  }, [config]);

  const handleSaveDynamicSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...config,
      bankCard1: bankCard1Input,
      bankShiba1: bankShiba1Input,
      bankHolder1: bankHolder1Input,
      bankCard2: bankCard2Input,
      bankShiba2: bankShiba2Input,
      bankHolder2: bankHolder2Input,
      visitorContractText: contractTextInput,
    });
    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 3000);
  };

  const handleSaveBaseUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrlInput);
    onUpdateConfig({
      ...config,
      apiUrl: apiUrlInput
    });
    setBaseUrlSaveSuccess(true);
    setTimeout(() => setBaseUrlSaveSuccess(false), 3000);
  };

  // New product quick form
  const [newProduct, setNewProduct] = useState({
    nameFa: '',
    nameEn: '',
    brand: 'Marlboro',
    origin: 'سوئیس اصل',
    cartonPrice: 85000000,
    boxPrice: 1800000,
    boxesPerCarton: 50,
    category: 'cigarettes' as const,
    moq: 1,
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80',
    description: '',
  });

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTriggerSync = async () => {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      await onSyncWithDjango();
      setSyncMessage('محصولات و سفارشات با وب‌سرویس و دیتابیس جنگو همگام گردید.');
    } catch {
      setSyncMessage('اطلاعات پیش‌فرض دیتابیس جنگو در کاتالوگ فعال شد.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.nameFa) return;

    onAddNewProduct({
      ...newProduct,
      id: `custom-${Date.now()}`,
      barcode: `626010${Math.floor(100000 + Math.random() * 900000)}`,
      badge: 'بار تازه سوین',
      priceTrend: 'stable',
      lastPriceUpdate: 'هم‌اکنون',
      hologram: 'اورجینال اروپایی',
      isAvailable: true,
      stockCartons: 100,
      tar: '6 mg',
      nicotine: '0.5 mg',
      tierDiscounts: [
        { minQuantity: 3, unit: 'carton', discountPercent: 2.5 },
        { minQuantity: 6, unit: 'carton', discountPercent: 5.0 },
      ]
    });

    setSyncMessage(`محصول «${newProduct.nameFa}» در کاتالوگ و مدل جنگو درج شد.`);
    setNewProduct(prev => ({ ...prev, nameFa: '', nameEn: '', description: '' }));
  };

  const activeApp = DJANGO_APPS_DATA[selectedAppId] || DJANGO_APPS_DATA.accounts;
  const currentCode = activeApp[selectedLayer] || '';

  // Mock data for Django Admin Simulator
  const mockAdminUsers = [
    { id: 1, phone: '09120759419', name: 'حاج رضا کریمی', business: 'بنکداری نگین مولوی', role: 'wholesaler', roleFa: 'بنکدار رسمی', isVerified: true, city: 'تهران', dateJoined: '۱۴۰۳/۰۱/۱۵' },
    { id: 2, phone: '09133145566', name: 'برادران حسینی', business: 'پخش دخانیات اصفهان', role: 'wholesaler', roleFa: 'بنکدار رسمی', isVerified: true, city: 'اصفهان', dateJoined: '۱۴۰۳/۰۲/۰۱' },
    { id: 3, phone: '09151122334', name: 'مهندس علیزاده', business: 'دخانیات خاوران مشهد', role: 'wholesaler', roleFa: 'بنکدار رسمی', isVerified: true, city: 'مشهد', dateJoined: '۱۴۰۳/۰۲/۱۸' },
    { id: 4, phone: '09129998877', name: 'مهندس حسام داودی', business: 'انبار مرکزی جنت‌آباد', role: 'warehouse_manager', roleFa: 'مدیر انبار جنت‌آباد', isVerified: true, city: 'تهران', dateJoined: '۱۴۰۲/۱۰/۰۱' },
    { id: 5, phone: '09351234567', name: 'فروشگاه آذران', business: 'فروشگاه زنجیره‌ای تبریز', role: 'wholesaler', roleFa: 'در انتظار تأیید مدارک', isVerified: false, city: 'تبریز', dateJoined: '۱۴۰۳/۰۳/۰۵' },
  ];

  const mockAdminOrders = [
    { id: 'SVN-89412', customer: 'حاج رضا کریمی', business: 'بنکداری نگین مولوی', amount: 432500000, cartons: 5, status: 'proforma_issued', statusFa: 'پیش‌فاکتور رسمی صادر شد', shipping: 'وانت اختصاصی تهران', date: '۱۴۰۳/۰۳/۱۲' },
    { id: 'SVN-91284', customer: 'برادران حسینی', business: 'پخش دخانیات اصفهان', amount: 720000000, cartons: 60, status: 'dispatched', statusFa: 'تحویل باربری وطن شد', shipping: 'باربری وطن', date: '۱۴۰۳/۰۳/۱۰' },
    { id: 'SVN-77301', customer: 'مهندس علیزاده', business: 'دخانیات خاوران مشهد', amount: 395000000, cartons: 30, status: 'payment_verified', statusFa: 'تأیید پرداخت (انبار جنت‌آباد)', shipping: 'باربری پیشتاز', date: '۱۴۰۳/۰۳/۱۱' },
  ];

  const mockAdminTickets = [
    { id: 'TK-8821', title: 'استعلام زمان بارگیری سفارش SVN-89412 از انبار جنت‌آباد', user: 'حاج رضا کریمی (09120759419)', department: 'انبار مرکزی جنت‌آباد', priority: 'فوری', status: 'answered', statusFa: 'پاسخ داده شده', time: '۱۰:۲۵' },
    { id: 'TK-9410', title: 'درخواست فاکتور رسمی با شماره اقتصادی جهت حسابداری', user: 'برادران حسینی (09133145566)', department: 'واحد مالی و حسابداری', priority: 'عادی', status: 'in_progress', statusFa: 'در حال بررسی', time: 'دیروز' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="django-api-panel">
      
      {/* Top Banner & Django Status Header */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 dark:bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-600/20 shrink-0">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-3 py-0.5 rounded-full">
                  Django 5 + REST Framework + Swagger OpenAPI
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  معماری ماژولار ۶ اپلیکیشن مجزا
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                پنل مدیریت یکپارچه جنگو، دیتابیس و کدهای ماژولار سوین
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                تمامی موجودیت‌ها (کاربران، بنکداران، کاتالوگ، سفارشات، تیکت‌ها و باربری) دارای مدل، پنل ادمین اختصاصی با اکشن‌های عملیاتی، سریالایزر و ویوهای REST API هستند.
              </p>
            </div>
          </div>

          {/* Quick Action & Sync Buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleTriggerSync}
              disabled={syncLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20"
            >
              <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
              <span>{syncLoading ? 'در حال همگام‌سازی...' : 'همگام‌سازی کاتالوگ با جنگو'}</span>
            </button>

            <button
              onClick={() => handleCopy('all_script', DJANGO_PROJECT_CONFIG.setupScript)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-black transition-colors border border-slate-700"
            >
              {copiedKey === 'all_script' ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-blue-400" />}
              <span>{copiedKey === 'all_script' ? 'کپی شد!' : 'دانلود اسکریپت راه‌اندازی (Bash)'}</span>
            </button>
          </div>

        </div>

        {/* Sync notification */}
        {syncMessage && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Global Base API URL Editor */}
        <form onSubmit={handleSaveBaseUrl} className="mt-5 p-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <label className="text-xs font-black text-slate-900 dark:text-white">
                آدرس ریشه وب‌سرویس بک‌اند (Base API URL):
              </label>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              با تغییر این آدرس، تمام فراخوانی‌های فرانت‌اند به URL جدید متصل می‌شوند.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={apiUrlInput}
              onChange={(e) => setApiUrlInput(e.target.value)}
              placeholder="https://api.sevin-smoke.ir/api/v1"
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-blue-600 dark:text-blue-400 focus:outline-hidden"
              dir="ltr"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>ذخیره Base URL</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setApiUrlInput(DEFAULT_BASE_URL);
                setApiBaseUrl(DEFAULT_BASE_URL);
              }}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              بازنشانی پیش‌فرض
            </button>
          </div>

          {baseUrlSaveSuccess && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>آدرس جدید Base API با موفقیت ذخیره و در کل فرانت‌اند اعمال گردید.</span>
            </p>
          )}
        </form>

        {/* Top View Selector Bar */}
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-6 pt-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setPanelView('modular_apps')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
              panelView === 'modular_apps'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>کدهای ماژولار اپ‌ها (Models / Admin / Serializers / Views / Urls)</span>
          </button>

          <button
            onClick={() => setPanelView('admin_simulator')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
              panelView === 'admin_simulator'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>پیش‌نمایش تعاملی پنل ادمین جنگو (Django Admin Simulator)</span>
          </button>

          <button
            onClick={() => setPanelView('project_config')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
              panelView === 'project_config'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span>تنظیمات پروژه (Settings / URLs / Requirements / Manage)</span>
          </button>

          <button
            onClick={() => setPanelView('dynamic_settings')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
              panelView === 'dynamic_settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-500" />
            <span>مدیریت تنظیمات پویا و متون قرارداد (مدیریت جنگو)</span>
          </button>
        </div>

      </div>

      {/* =========================================================================
          VIEW 1: MODULAR APPS CODE VIEWER (Models, Admin, Serializers, Views, Urls)
         ========================================================================= */}
      {panelView === 'modular_apps' && (
        <div className="space-y-4">
          
          {/* App Selector Pills */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
              انتخاب اپلیکیشن ماژولار جنگو:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {Object.values(DJANGO_APPS_DATA).map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-2 border ${
                    selectedAppId === app.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>{app.nameFa}</span>
                  <span className="font-mono text-[10px] opacity-75">({app.name}/)</span>
                </button>
              ))}
            </div>
          </div>

          {/* App Detail & Layer Tabs (models.py, admin.py, etc.) */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-600" />
                  {activeApp.nameFa}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeApp.description}</p>
              </div>

              {/* Layer Tabs: models, admin, serializers, views, urls */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'models', label: 'models.py', icon: Database },
                  { id: 'admin', label: 'admin.py', icon: Sliders },
                  { id: 'serializers', label: 'serializers.py', icon: RefreshCw },
                  { id: 'views', label: 'views.py', icon: Code2 },
                  { id: 'urls', label: 'urls.py', icon: Globe },
                ].map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedLayer(layer.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                        selectedLayer === layer.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{layer.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Code Display Area */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#080c14] text-slate-100 shadow-xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1321] border-b border-slate-800 text-xs text-slate-400">
                <span className="font-mono text-emerald-400 font-bold" dir="ltr">
                  {selectedAppId}/{selectedLayer}.py
                </span>
                
                <button
                  onClick={() => handleCopy(`${selectedAppId}_${selectedLayer}`, currentCode)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                >
                  {copiedKey === `${selectedAppId}_${selectedLayer}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی کد پایتون</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 sm:p-5 text-xs sm:text-[13px] leading-relaxed overflow-x-auto font-mono text-emerald-300/95 max-h-[600px] selection:bg-blue-600 selection:text-white" dir="ltr">
                <code>{currentCode}</code>
              </pre>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: DJANGO ADMIN LIVE SIMULATOR
         ========================================================================= */}
      {panelView === 'admin_simulator' && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  داشبورد شبیه‌ساز زنده پنل مدیریت جنگو (Django Administration)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                مشاهده نحوه چینش، فیلترها، جستجو و عملکرد اکشن‌های مدیریت برای کاربران، کالاها، سفارشات و تیکت‌ها
              </p>
            </div>

            {/* Model Subtabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setAdminActiveModel('users')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  adminActiveModel === 'users'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <User className="w-4 h-4" />
                <span>کاربران و بنکداران (accounts.User)</span>
              </button>

              <button
                onClick={() => setAdminActiveModel('orders')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  adminActiveModel === 'orders'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>پیش‌فاکتورها و سفارشات (orders.Order)</span>
              </button>

              <button
                onClick={() => setAdminActiveModel('tickets')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  adminActiveModel === 'tickets'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>تیکت‌های پشتیبانی (tickets.SupportTicket)</span>
              </button>
            </div>
          </div>

          {/* SIMULATOR: USERS & WHOLESALERS TABLE */}
          {adminActiveModel === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="جستجو در نام، شماره موبایل، بنکداری، پروانه..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pr-10 pl-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">فیلتر نقش:</span>
                  <select
                    value={adminFilterRole}
                    onChange={(e) => setAdminFilterRole(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="all">همه نقش‌ها</option>
                    <option value="wholesaler">بنکدار رسمی</option>
                    <option value="warehouse_manager">مدیر انبار</option>
                  </select>
                </div>
              </div>

              {/* Responsive Table Wrapper */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">شماره موبایل</th>
                      <th className="p-3">نام و نام خانوادگی</th>
                      <th className="p-3">نام بنکداری / فروشگاه</th>
                      <th className="p-3">نقش سیستمی</th>
                      <th className="p-3">احراز هویت</th>
                      <th className="p-3">شهر مقصد</th>
                      <th className="p-3">تاریخ عضویت</th>
                      <th className="p-3 text-center">عملیات ادمین</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mockAdminUsers
                      .filter(u => adminFilterRole === 'all' || u.role === adminFilterRole)
                      .filter(u => !adminSearch || u.name.includes(adminSearch) || u.phone.includes(adminSearch))
                      .map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400" dir="ltr">{u.phone}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{u.business}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                              {u.roleFa}
                            </span>
                          </td>
                          <td className="p-3">
                            {u.isVerified ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                تأیید شده
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-bold">
                                در انتظار بررسی
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500">{u.city}</td>
                          <td className="p-3 text-slate-400 text-[11px]">{u.dateJoined}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => alert(`کاربر ${u.name} در ادمین جنگو باز شد.`)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              ویرایش در ادمین
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SIMULATOR: ORDERS TABLE */}
          {adminActiveModel === 'orders' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">کد رهگیری SVN</th>
                      <th className="p-3">خریدار / بنکداری</th>
                      <th className="p-3">تعداد کارتن</th>
                      <th className="p-3">مبلغ نهایی (تومان)</th>
                      <th className="p-3">وضعیت سفارش</th>
                      <th className="p-3">روش ترابری</th>
                      <th className="p-3">تاریخ صدور</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mockAdminOrders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{o.id}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{o.customer}</div>
                          <div className="text-[11px] text-slate-400">{o.business}</div>
                        </td>
                        <td className="p-3 font-bold">{formatNumberFa(o.cartons)} کارتن</td>
                        <td className="p-3 font-black text-blue-700 dark:text-blue-400">{formatToman(o.amount)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                            {o.statusFa}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{o.shipping}</td>
                        <td className="p-3 text-slate-400">{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SIMULATOR: TICKETS TABLE */}
          {adminActiveModel === 'tickets' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">شماره تیکت</th>
                      <th className="p-3">موضوع تیکت</th>
                      <th className="p-3">بنکدار / کاربر</th>
                      <th className="p-3">واحد ارجاع</th>
                      <th className="p-3">اولویت</th>
                      <th className="p-3">وضعیت</th>
                      <th className="p-3">زمان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mockAdminTickets.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-blue-600">{t.id}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{t.title}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{t.user}</td>
                        <td className="p-3">{t.department}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                            {t.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                            {t.statusFa}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{t.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          VIEW 3: PROJECT CONFIG (Settings, URLs, Requirements, Manage, Setup Script)
         ========================================================================= */}
      {panelView === 'project_config' && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                فایل‌های پیکربندی ریشه پروژه (Project Root Configurations)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تنظیمات اتصال اپلیکیشن‌ها، زبان فارسی، CORS، احراز هویت JWT و اسکریپت راه‌اندازی سریع
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'settings', label: 'settings.py' },
                { id: 'urls', label: 'urls.py (Root)' },
                { id: 'requirements', label: 'requirements.txt' },
                { id: 'manage', label: 'manage.py' },
                { id: 'env', label: '.env.example' },
                { id: 'setupScript', label: 'setup.sh (Bash)' },
              ].map((cfg) => (
                <button
                  key={cfg.id}
                  onClick={() => setSelectedConfigTab(cfg.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                    selectedConfigTab === cfg.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Config Code Viewer */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#080c14] text-slate-100 shadow-xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1321] border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-bold" dir="ltr">
                {selectedConfigTab === 'settings' && 'sevin_wholesale/settings.py'}
                {selectedConfigTab === 'urls' && 'sevin_wholesale/urls.py'}
                {selectedConfigTab === 'requirements' && 'requirements.txt'}
                {selectedConfigTab === 'manage' && 'manage.py'}
                {selectedConfigTab === 'env' && '.env'}
                {selectedConfigTab === 'setupScript' && 'setup_django.sh'}
              </span>
              
              <button
                onClick={() => handleCopy(selectedConfigTab, DJANGO_PROJECT_CONFIG[selectedConfigTab])}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
              >
                {copiedKey === selectedConfigTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی محتوا</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 sm:p-5 text-xs sm:text-[13px] leading-relaxed overflow-x-auto font-mono text-emerald-300/95 max-h-[600px] selection:bg-blue-600 selection:text-white" dir="ltr">
              <code>{DJANGO_PROJECT_CONFIG[selectedConfigTab]}</code>
            </pre>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 4: DYNAMIC SETTINGS & LEGAL CONTRACTS MANAGEMENT
         ========================================================================= */}
      {panelView === 'dynamic_settings' && (
        <form onSubmit={handleSaveDynamicSettings} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-500" />
                مدیریت تنظیمات پویا و متون قرارداد (بک‌اند جنگو)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                تغییر این مقادیر بلافاصله در کل فرانت‌اند، سبد خرید و صفحات پروفایل کاربران منعکس می‌گردد.
              </p>
            </div>
            
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره کلیه تنظیمات پویا</span>
            </button>
          </div>

          {settingsSaveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>کلیه تغییرات با موفقیت در تنظیمات سراسری ذخیره و در سبد خرید/پروفایل کاربران اعمال شد.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* بخش ۱: حساب بانکی اصلی شرکت */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                حساب بانکی اول (حساب اصلی واریز سفارشات)
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">شماره کارت اول:</label>
                  <input
                    type="text"
                    value={bankCard1Input}
                    onChange={(e) => setBankCard1Input(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                    dir="ltr"
                    placeholder="۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">شماره شبا اول:</label>
                  <input
                    type="text"
                    value={bankShiba1Input}
                    onChange={(e) => setBankShiba1Input(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                    dir="ltr"
                    placeholder="IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نام صاحب حساب اول:</label>
                  <input
                    type="text"
                    value={bankHolder1Input}
                    onChange={(e) => setBankHolder1Input(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                    placeholder="امور مالی شرکت سوین"
                  />
                </div>
              </div>
            </div>

            {/* بخش ۲: حساب بانکی تدارکات و ترابری */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                حساب بانکی دوم (حساب ترابری و تدارکات سوین)
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">شماره کارت دوم:</label>
                  <input
                    type="text"
                    value={bankCard2Input}
                    onChange={(e) => setBankCard2Input(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                    dir="ltr"
                    placeholder="۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">شماره شبا دوم:</label>
                  <input
                    type="text"
                    value={bankShiba2Input}
                    onChange={(e) => setBankShiba2Input(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                    dir="ltr"
                    placeholder="IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نام صاحب حساب دوم:</label>
                  <input
                    type="text"
                    value={bankHolder2Input}
                    onChange={(e) => setBankHolder2Input(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                    placeholder="حساب ترابری و تدارکات سوین"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* بخش ۳: متن قرارداد رسمی همکاری ویزیتورها */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-blue-500" />
              متن رسمی توافق‌نامه و قرارداد آنلاین همکاری ویزیتورها
            </h3>
            
            <p className="text-[11px] text-slate-500">
              این متن مستقیماً در برگه پنل ویزیتوری کاربران موبایل و وب نمایش داده شده و به عنوان سند حقوقی پذیرفته می‌شود.
            </p>

            <textarea
              rows={8}
              value={contractTextInput}
              onChange={(e) => setContractTextInput(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-900 dark:text-white focus:outline-hidden font-sans leading-relaxed text-justify"
              placeholder="متن قرارداد رسمی را وارد کنید..."
              dir="rtl"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره و به‌روزرسانی تنظیمات و متون قرارداد</span>
            </button>
          </div>
        </form>
      )}

      {/* Fast Product Inserter into Django/Local State */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              درج فوری محصول جدید در کاتالوگ و مدل جنگو (CigaretteProduct)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">افزودن مستقیم کالا به دیتابیس با نرخ کارتن و باکس پلمپ</p>
          </div>
        </div>

        <form onSubmit={handleCreateProductSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نام فارسی محصول:</label>
              <input
                type="text"
                required
                placeholder="مثلاً: وینستون لایت اصل سوئیس"
                value={newProduct.nameFa}
                onChange={(e) => setNewProduct({ ...newProduct, nameFa: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نام انگلیسی (En):</label>
              <input
                type="text"
                placeholder="Winston Lights Swiss"
                value={newProduct.nameEn}
                onChange={(e) => setNewProduct({ ...newProduct, nameEn: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نرخ کارتن (تومان):</label>
              <input
                type="number"
                value={newProduct.cartonPrice}
                onChange={(e) => setNewProduct({ ...newProduct, cartonPrice: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all"
          >
            + ثبت کالا در کاتالوگ و دیتابیس
          </button>
        </form>
      </div>

    </div>
  );
};
