import React from 'react';
import { Building2, Phone, KeyRound, AlertTriangle, Lock, RefreshCw, ArrowRight, Clock } from 'lucide-react';
import { isPosOnlyMode } from '../../../config/appMode';

interface PosLoginScreenProps {
  loginPhone: string;
  loginPass: string;
  isLoggingIn: boolean;
  loginError: string;
  sessionExpiredNotice: string | null;
  onPhoneChange: (val: string) => void;
  onPassChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReturnToStore: () => void;
}

/**
 * کامپوننت صفحه ورود امن به میز کار حسابداری و صندوق فروشگاهی
 * مسیر فایل: /src/components/shopmanage/pos/PosLoginScreen.tsx
 */
export const PosLoginScreen: React.FC<PosLoginScreenProps> = ({
  loginPhone,
  loginPass,
  isLoggingIn,
  loginError,
  sessionExpiredNotice,
  onPhoneChange,
  onPassChange,
  onSubmit,
  onReturnToStore,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* نوار رنگی گرادیان بالای کادر */}
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />
        
        {/* سربرگ و لوگو */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            سامانه حسابداری و صندوق فروشگاهی دخانیات سرو
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            کنترل یکپارچه موجودی انبار، صندوق بارکدخوان POS و ثبت فاکتورهای فروش حضوری
          </p>
        </div>

        {/* اعلان انقضای امنیتی نشست در صورت وجود */}
        {sessionExpiredNotice && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold block mb-1 text-amber-200 text-xs">خروج امنیتی خودکار از صندوق:</strong>
              <p className="text-amber-300/95 text-[11px] leading-5">{sessionExpiredNotice}</p>
            </div>
          </div>
        )}

        {/* فرم ورود */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              شماره همراه مدیر فروشگاه / انباردار
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                dir="ltr"
                value={loginPhone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="09120759419"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-3 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              رمز عبور امنیتی
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={loginPass}
                onChange={(e) => onPassChange(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-3 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-75 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>در حال احراز هویت و ورود...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>ورود به میز کار حسابداری و صندوق</span>
              </>
            )}
          </button>
        </form>

        {/* دکمه بازگشت به سایت (تنها در حالت فول‌سوئیت نمایش داده می‌شود و در حالت فروش صندوق مجزا مخفی است) */}
        {!isPosOnlyMode() && (
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <button
              type="button"
              onClick={onReturnToStore}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به کاتالوگ فروشگاه آنلاین دخانیات سرو</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
