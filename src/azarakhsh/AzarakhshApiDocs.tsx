import React, { useState, useEffect } from 'react';
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
import { ZeroToHeroDocs } from './ZeroToHeroDocs';
import { DjangoConfigDocs } from './DjangoConfigDocs';
import { SiteSettingsDocs } from './SiteSettingsDocs';
import { SwaggerRedocDocs } from './SwaggerRedocDocs';
import { AuthUsersDocs } from './AuthUsersDocs';
import { CategoriesDocs } from './CategoriesDocs';
import { ProductsDocs } from './ProductsDocs';
import { OrdersDocs } from './OrdersDocs';
import { ShippingDocs } from './ShippingDocs';
import { BlogTinyMceDocs } from './BlogTinyMceDocs';
import { TicketsSupportDocs } from './TicketsSupportDocs';
import { VisitorsDocs } from './VisitorsDocs';

interface AzarakhshApiDocsProps {
  onReturnToApp?: () => void;
}

const AZARAKHSH_MASTER_PASSWORD = 'alirezazzz9419@S';

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
  const [activeSection, setActiveSection] = useState<AzarakhshSectionId>('zero-to-hero');

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
      try {
        window.history.pushState({}, '', '/');
        window.location.reload();
      } catch {}
    }
  };

  // If NOT authenticated, show Password Login Screen in Light Mode
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white antialiased" dir="rtl">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400" />

          {/* Logo & Header */}
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

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رمز عبور اختصاصی:
              </label>
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

          {/* Return button */}
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

  // Render specific documentation component based on activeSection
  const renderActiveContent = () => {
    switch (activeSection) {
      case 'zero-to-hero':
        return <ZeroToHeroDocs />;
      case 'django-config':
        return <DjangoConfigDocs />;
      case 'site-settings':
        return <SiteSettingsDocs />;
      case 'swagger-redoc':
        return <SwaggerRedocDocs />;
      case 'auth-users':
        return <AuthUsersDocs />;
      case 'categories':
        return <CategoriesDocs />;
      case 'products':
        return <ProductsDocs />;
      case 'orders':
        return <OrdersDocs />;
      case 'shipping':
        return <ShippingDocs />;
      case 'blog-tinymce':
        return <BlogTinyMceDocs />;
      case 'tickets-support':
        return <TicketsSupportDocs />;
      case 'visitors':
        return <VisitorsDocs />;
      default:
        return <ZeroToHeroDocs />;
    }
  };

  return (
    <AzarakhshLayout
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      onLogout={handleLogout}
      onReturnToApp={handleReturn}
    >
      {renderActiveContent()}
    </AzarakhshLayout>
  );
};
