import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Check, X } from 'lucide-react';

export const AppUpdateNotifier: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('نسخه جدید سامانه و تغییرات جدید بارگذاری شد.');

  useEffect(() => {
    // 1. Listen to service worker message
    const handleMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'SW_UPDATED' || event.data.type === 'APP_UPDATED')) {
        setHasUpdate(true);
        setUpdateMessage('نسخه جدید سامانه و اطلاعات جدید بارگذاری شد.');
      }
    };

    // 2. Custom window event from Service Worker registration
    const handleCustomUpdateEvent = (event: any) => {
      setHasUpdate(true);
      if (event?.detail?.message) {
        setUpdateMessage(event.detail.message);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }
    window.addEventListener('pwa-update-ready', handleCustomUpdateEvent);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
      window.removeEventListener('pwa-update-ready', handleCustomUpdateEvent);
    };
  }, []);

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    // Tell SW to skip waiting if any waiting worker exists
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }).catch(() => {});
    }

    // Refresh page to load new bundles
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  if (!hasUpdate) return null;

  return (
    <div 
      id="pwa-update-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999] animate-in slide-in-from-bottom-5 duration-300"
      dir="rtl"
    >
      <div className="bg-slate-900/95 text-white border border-indigo-500/40 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl shadow-indigo-950/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-100">به‌روزرسانی خودکار وب‌اپ</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                نسخه جدید
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate mt-0.5">
              {updateMessage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 active:scale-95 text-white rounded-xl text-[11px] font-black flex items-center gap-1 transition-all shadow-md shadow-indigo-600/30"
          >
            <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'در حال اعمال...' : 'اعمال و تازه‌سازی'}</span>
          </button>
          
          <button
            onClick={() => setHasUpdate(false)}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="بستن پیام"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
