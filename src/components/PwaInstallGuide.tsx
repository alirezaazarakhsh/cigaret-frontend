import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  X, 
  PlusSquare, 
  Share, 
  Check, 
  Info,
  Layers,
  Sparkles,
  ArrowLeft,
  Chrome
} from 'lucide-react';

interface PwaInstallGuideProps {
  isOpenOnly?: boolean; // if true, behaves purely as modal
  onCloseModal?: () => void;
}

export const PwaInstallGuide: React.FC<PwaInstallGuideProps> = ({
  isOpenOnly = false,
  onCloseModal
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAndroidOrChrome, setIsAndroidOrChrome] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect OS
    const ua = navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    setIsIOS(isIosDevice);
    setIsAndroidOrChrome(isAndroidDevice || (!isIosDevice && 'BeforeInstallPromptEvent' in window));

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (navigator as any).standalone 
      || document.referrer.includes('android-app://');

    // Only show banner if not standalone and not dismissed
    const isDismissed = localStorage.getItem('pwa_banner_dismissed') === 'true';
    if (!isStandalone && !isDismissed && !isOpenOnly) {
      // Show banner after 3 seconds for smooth UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpenOnly]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Automatically show banner if we have a deferred prompt
      if (localStorage.getItem('pwa_banner_dismissed') !== 'true' && !isOpenOnly) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isOpenOnly]);

  const handleCloseBanner = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const handleOpenGuide = () => {
    setShowModal(true);
    if (onCloseModal) {
      // Sync state if controlled from outside
    }
  };

  const handleCloseModalInternal = () => {
    setShowModal(false);
    if (onCloseModal) {
      onCloseModal();
    }
  };

  const triggerChromeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('PWA installation accepted by user');
      setShowBanner(false);
      setShowModal(false);
    }
    setDeferredPrompt(null);
  };

  const isBannerVisible = showBanner && !isOpenOnly;
  const isModalVisible = showModal || isOpenOnly;

  return (
    <>
      {/* 1. TOP FLOATING SMART BANNER (FOR MOBILE/DESKTOP ACCESS) */}
      {isBannerVisible && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="max-w-md mx-auto bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-2xl rounded-2xl p-4 border border-blue-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-blue-200" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[13px] font-black tracking-wide">نصب وب‌اپلیکیشن پخش سوین</div>
                <div className="text-[10px] text-blue-100 font-bold">دسترسی سریع‌تر، بدون فیلتر و آفلاین روی گوشی شما</div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={handleOpenGuide}
                className="px-3.5 py-1.5 bg-white text-blue-800 rounded-xl text-[11px] font-black hover:bg-blue-50 transition-colors active:scale-95"
              >
                راهنما و نصب
              </button>
              <button 
                onClick={handleCloseBanner}
                className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-blue-100 flex items-center justify-center transition-colors"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FULL INTERACTIVE INSTALLATION GUIDE MODAL */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right" dir="rtl">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    راهنمای راه‌اندازی و نصب وب‌اپلیکیشن (PWA)
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">پخش عمده دخانیات سوین روی صفحه موبایل شما</p>
                </div>
              </div>

              <button 
                onClick={handleCloseModalInternal}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="p-6 space-y-6">
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mx-auto text-blue-600 font-bold mb-1.5">
                    ۱
                  </div>
                  <div className="text-[10px] font-black text-slate-900 dark:text-white">سرعت فوق‌العاده</div>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">لود سریع‌تر قیمت‌ها و کاتالوگ</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mx-auto text-emerald-600 font-bold mb-1.5">
                    ۲
                  </div>
                  <div className="text-[10px] font-black text-slate-900 dark:text-white">دسترسی مستقیم</div>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">آیکون اختصاصی در صفحه خانه گوشی</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center mx-auto text-purple-600 font-bold mb-1.5">
                    ۳
                  </div>
                  <div className="text-[10px] font-black text-slate-900 dark:text-white">بدون فیلتر و بازار</div>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">بدون نیاز به دانلود از مارکت‌ها</p>
                </div>
              </div>

              {/* Install Now Prompt for Compatible Browsers */}
              {deferredPrompt && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                    <Chrome className="w-4 h-4 text-emerald-600" />
                    <span>مرورگر شما از نصب مستقیم پشتیبانی می‌کند!</span>
                  </div>
                  <button
                    onClick={triggerChromeInstall}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>نصب مستقیم وب‌اپلیکیشن سوین</span>
                  </button>
                </div>
              )}

              {/* Tabbed Guides for OS types */}
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>مراحل دستی برای نصب روی سیستم‌عامل‌ها:</span>
                </div>

                {/* 1. iOS Safari Steps */}
                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/20 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍏</span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">آموزش نصب روی آیفون و آیپد (iOS Safari):</h4>
                  </div>

                  <ol className="text-[11px] text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside font-bold">
                    <li className="leading-relaxed">
                      سایت را در مرورگر رسمی <span className="text-blue-600 font-black">Safari</span> باز کنید.
                    </li>
                    <li className="leading-relaxed">
                      در نوار پایین صفحه روی دکمه اشتراک‌گذاری <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"><Share className="w-3.5 h-3.5" /> Share</span> کلیک کنید.
                    </li>
                    <li className="leading-relaxed">
                      در لیست باز شده به سمت پایین اسکرول کنید و گزینه <span className="text-blue-600 font-black">Add to Home Screen</span> (یا <span className="text-blue-600 font-black">افزودن به صفحه اصلی</span>) را انتخاب کنید.
                    </li>
                    <li className="leading-relaxed">
                      در کادر ظاهر شده روی دکمه <span className="text-blue-600 font-black">Add</span> در گوشه بالا سمت راست کلیک نمایید.
                    </li>
                  </ol>
                </div>

                {/* 2. Android Chrome Steps */}
                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/20 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">آموزش نصب روی اندروید (Chrome / Firefox):</h4>
                  </div>

                  <ol className="text-[11px] text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside font-bold">
                    <li className="leading-relaxed">
                      سایت را در مرورگر گوگل کروم <span className="text-blue-600 font-black">Chrome</span> باز کنید.
                    </li>
                    <li className="leading-relaxed">
                      در بالای مرورگر روی دکمه منو یا سه‌نقطه عمودی کلیک کنید.
                    </li>
                    <li className="leading-relaxed">
                      از منوی ظاهر شده گزینه <span className="text-blue-600 font-black">Install App</span> (یا <span className="text-blue-600 font-black">نصب وب‌اپلیکیشن</span>) را بزنید.
                    </li>
                    <li className="leading-relaxed">
                      در کادر باز شده دکمه تأیید نهایی نصب را کلیک کنید تا آیکون روی گوشی قرار گیرد.
                    </li>
                  </ol>
                </div>

              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleCloseModalInternal}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md"
              >
                متوجه شدم (ورود به سامانه)
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
