import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface PosLogoutOverlayProps {
  isLoggingOut: boolean;
}

export const PosLogoutOverlay: React.FC<PosLogoutOverlayProps> = ({ isLoggingOut }) => {
  if (!isLoggingOut) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
      <div className="p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl flex flex-col items-center gap-4 max-w-xs text-center">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-black text-white text-base">در حال خروج از صندوق...</h3>
          <p className="text-xs text-slate-400">نشست صندوق‌داری شما در حال بسته‌شدن امن است.</p>
        </div>
      </div>
    </div>
  );
};

interface PosSessionExpiryAlertProps {
  showExtendNotice: boolean;
  sessionRemainingSeconds: number;
  onExtendSession: () => void;
  onLogout: () => void;
}

export const PosSessionExpiryAlert: React.FC<PosSessionExpiryAlertProps> = ({
  showExtendNotice,
  sessionRemainingSeconds,
  onExtendSession,
  onLogout,
}) => {
  if (!showExtendNotice) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-md w-full bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl p-5 animate-in slide-in-from-bottom duration-300 font-sans" dir="rtl">
      <div className="flex gap-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-black text-sm text-white">هشدار امنیتی انقضای نشست صندوق</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            اعتبار نشست صندوق‌داری شما تا <span className="font-black text-amber-400 font-mono">{sessionRemainingSeconds} ثانیه دیگر</span> به پایان می‌رسد. جهت جلوگیری از خروج خودکار، مایلید نشست خود را تمدید کنید؟
          </p>
          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={onExtendSession}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تمدید ۳۰ دقیقه‌ای نشست</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <span>خروج امن هم‌اکنون</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
