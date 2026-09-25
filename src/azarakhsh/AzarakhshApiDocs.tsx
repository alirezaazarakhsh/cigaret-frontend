import React, { useState } from 'react';
import { MemoryRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Sparkles,
  BookOpen,
  Cpu,
  Layers
} from 'lucide-react';
import { AzarakhshSectionId } from './types';
import { AzarakhshLayout } from './Layout';
import { ZeroToHeroDocs } from './apps/zero-to-hero/ZeroToHeroDocs';
import { DjangoConfigDocs } from './apps/django-config/DjangoConfigDocs';
import { SiteSettingsDocs } from './apps/site-settings/SiteSettingsDocs';
import { SliderDocs } from './apps/slider/SliderDocs';
import { KavenegarSmsDocs } from './apps/kavenegar_sms/KavenegarSmsDocs';
import { SwaggerRedocDocs } from './apps/swagger-redoc/SwaggerRedocDocs';
import { AuthUsersDocs } from './apps/auth-users/AuthUsersDocs';
import { ProductsDocs } from './apps/products/ProductsDocs';
import { OrdersDocs } from './apps/orders/OrdersDocs';
import { ShippingDocs } from './apps/shipping/ShippingDocs';
import { BlogTinyMceDocs } from './apps/blog-tinymce/BlogTinyMceDocs';
import { TicketsSupportDocs } from './apps/tickets-support/TicketsSupportDocs';
import { VisitorsDocs } from './apps/visitors/VisitorsDocs';
import { WarehouseContactDocs } from './apps/warehouse-contact/WarehouseContactDocs';
import { RegularCustomersDocs } from './apps/regular-customers/RegularCustomersDocs';
import { FooterDocs } from './apps/footer-settings/FooterDocs';
import { NotificationsDocs } from './apps/notifications/NotificationsDocs';
import { PosDocs } from './apps/pos/PosDocs';
import { PosUserDocs } from './apps/posuser/PosUserDocs';
import { CashRegisterDocs } from './apps/cash-register/CashRegisterDocs';
import { CurrencyDocs } from './apps/currency-rates/CurrencyDocs';
import { WarehouseStockDocs } from './apps/warehouse-stock/WarehouseStockDocs';
import { LedgerDocs } from './apps/ledger/LedgerDocs';
import { ReportsDocs } from './apps/reports/ReportsDocs';

interface AzarakhshApiDocsProps {
  onReturnToApp?: () => void;
}

const AZARAKHSH_MASTER_PASSWORD = 'alirezazzz9419@S';

/**
 * Inner component to handle routing logic inside MemoryRouter
 */
const AzarakhshRouterContent: React.FC<{ 
  onLogout: () => void; 
  onReturnToApp: () => void;
}> = ({ onLogout, onReturnToApp }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract section from memory path (e.g., /zero-to-hero)
  const activeSection = (location.pathname.replace('/', '') || 'zero-to-hero') as AzarakhshSectionId;

  const handleSelectSection = (id: AzarakhshSectionId) => {
    navigate(`/${id}`);
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'django-docs', section: id }, '', `/azarakhsh/apps/${id}/`);
    }
  };

  // Sync with browser back/forward buttons
  React.useEffect(() => {
    const syncWithBrowserUrl = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean);
        const idx = parts.indexOf('azarakhsh');
        if (idx !== -1 && parts.length > idx + 1) {
          let candidate = parts[idx + 1];
          if (candidate === 'apps' && parts.length > idx + 2) {
            candidate = parts[idx + 2];
          }
          if (candidate && candidate !== activeSection) {
            navigate(`/${candidate}`);
          }
        }
      }
    };
    window.addEventListener('popstate', syncWithBrowserUrl);
    return () => window.removeEventListener('popstate', syncWithBrowserUrl);
  }, [activeSection, navigate]);

  return (
    <AzarakhshLayout
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      onLogout={onLogout}
      onReturnToApp={onReturnToApp}
    >
      <Routes>
        <Route path="/zero-to-hero" element={<ZeroToHeroDocs />} />
        <Route path="/django-config" element={<DjangoConfigDocs />} />
        <Route path="/site-settings" element={<SiteSettingsDocs />} />
        <Route path="/slider" element={<SliderDocs />} />
        <Route path="/swagger-redoc" element={<SwaggerRedocDocs />} />
        <Route path="/auth-users" element={<AuthUsersDocs />} />
        <Route path="/products" element={<ProductsDocs />} />
        <Route path="/orders" element={<OrdersDocs />} />
        <Route path="/shipping" element={<ShippingDocs />} />
        <Route path="/blog-tinymce" element={<BlogTinyMceDocs />} />
        <Route path="/tickets-support" element={<TicketsSupportDocs />} />
        <Route path="/visitors" element={<VisitorsDocs />} />
        <Route path="/pos" element={<PosDocs />} />
        <Route path="/posuser" element={<PosUserDocs />} />
        <Route path="/cash-register" element={<CashRegisterDocs />} />
        <Route path="/currency-rates" element={<CurrencyDocs />} />
        <Route path="/warehouse-stock" element={<WarehouseStockDocs />} />
        <Route path="/ledger" element={<LedgerDocs />} />
        <Route path="/reports" element={<ReportsDocs />} />
        <Route path="/kavenegar_sms" element={<KavenegarSmsDocs />} />
        <Route path="/warehouse-contact" element={<WarehouseContactDocs />} />
        <Route path="/regular-customers" element={<RegularCustomersDocs />} />
        <Route path="/footer-settings" element={<FooterDocs />} />
        <Route path="/notifications" element={<NotificationsDocs />} />
        <Route path="/" element={<Navigate to="/zero-to-hero" replace />} />
        <Route path="*" element={<Navigate to="/zero-to-hero" replace />} />
      </Routes>
    </AzarakhshLayout>
  );
};

export const AzarakhshApiDocs: React.FC<AzarakhshApiDocsProps> = ({ onReturnToApp }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('azarakhsh_docs_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === AZARAKHSH_MASTER_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMsg('');
      try {
        localStorage.setItem('azarakhsh_docs_auth', 'true');
      } catch {}
    } else {
      setErrorMsg('رمز عبور وارد شده نادرست است. لطفاً مجدداً تلاش فرمایید.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    try {
      localStorage.removeItem('azarakhsh_docs_auth');
    } catch {}
  };

  const handleReturn = () => {
    if (onReturnToApp) {
      onReturnToApp();
    } else {
      window.location.href = '/';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white antialiased" dir="rtl">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              مستندات امن جنگو (ساشا)
            </div>
            <h1 className="text-xl font-black text-slate-900">ورود به پنل مستندات فنی و کدها</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              جهت مشاهده مستندات کامل گام‌به‌گام جنگو، معماری مدل‌ها، ادمین، سریالایزر، ویوها و روت‌ها، رمز ورود را وارد کنید.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">رمز عبور اختصاصی:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="رمز عبور را وارد کنید..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-11 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all font-mono"
                  dir="ltr"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>مشاهده و بازگشایی مستندات</span>
            </button>
          </form>
          <div className="border-t border-slate-100 pt-4 text-center">
            <button
              onClick={handleReturn}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>بازگشت به سایت فروش عمده دخانیات</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract initial section from browser URL
  const getInitialSection = (): string => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const parts = path.split('/').filter(Boolean);
      const idx = parts.indexOf('azarakhsh');
      if (idx !== -1 && parts.length > idx + 1) {
        let candidate = parts[idx + 1];
        if (candidate === 'apps' && parts.length > idx + 2) {
          candidate = parts[idx + 2];
        }
        return candidate || 'zero-to-hero';
      }
    }
    return 'zero-to-hero';
  };

  const initialSection = getInitialSection();

  return (
    <MemoryRouter initialEntries={[`/${initialSection}`]}>
      <AzarakhshRouterContent 
        onLogout={handleLogout} 
        onReturnToApp={handleReturn} 
      />
    </MemoryRouter>
  );
};
