import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  LogOut, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Key, 
  User, 
  Phone, 
  Lock 
} from 'lucide-react';
import { 
  getRemainingSessionSeconds, 
  formatRemainingTime, 
  extendPosSession, 
  getPosSessionExpiry, 
  getStoredApiToken, 
  parseJwtPayload, 
  POS_SESSION_STORAGE_KEYS,
  invalidatePosTokenAndSession
} from '../../services/sessionSecurity';
import { WarehouseStaffUser } from '../../types';

interface SessionSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStaff: WarehouseStaffUser;
  onExtendSuccess: (msg: string) => void;
  onForceLogout: () => void;
}

export const SessionSecurityModal: React.FC<SessionSecurityModalProps> = ({
  isOpen,
  onClose,
  currentStaff,
  onExtendSuccess,
  onForceLogout
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(POS_SESSION_STORAGE_KEYS.AUTO_LOGOUT_DURATION_MINUTES);
      return saved ? Number(saved) : 30;
    } catch {
      return 30;
    }
  });

  const [tokenInfo, setTokenInfo] = useState<{
    isJwt: boolean;
    expiresAtDate: string;
    payload: any;
  }>({
    isJwt: false,
    expiresAtDate: '',
    payload: null
  });

  // بروزرسانی زنده ثانیه‌شمار
  useEffect(() => {
    if (!isOpen) return;

    const updateInfo = () => {
      const rem = getRemainingSessionSeconds();
      setRemainingSeconds(rem);

      const token = getStoredApiToken();
      const expiryMs = getPosSessionExpiry(token);
      const payload = token ? parseJwtPayload(token) : null;

      let dateStr = 'تعیین‌نشده';
      if (expiryMs) {
        dateStr = new Date(expiryMs).toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }

      setTokenInfo({
        isJwt: !!payload,
        expiresAtDate: dateStr,
        payload
      });
    };

    updateInfo();
    const interval = setInterval(updateInfo, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDurationChange = (minutes: number) => {
    setSelectedDuration(minutes);
    try {
      localStorage.setItem(POS_SESSION_STORAGE_KEYS.AUTO_LOGOUT_DURATION_MINUTES, String(minutes));
    } catch {}
    extendPosSession(minutes);
    setRemainingSeconds(getRemainingSessionSeconds());
    onExtendSuccess(`مدت زمان اعتبار نشست به ${minutes} دقیقه تنظیم و تمدید گردید.`);
  };

  const handleExtendClick = (extraMinutes: number = 30) => {
    extendPosSession(extraMinutes);
    setRemainingSeconds(getRemainingSessionSeconds());
    onExtendSuccess(`نشست کاری صندوق با موفقیت برای ${extraMinutes} دقیقه دیگر تمدید شد.`);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">امنیت و زمان انقضای توکن صندوق</h3>
              <p className="text-xs text-slate-300 mt-0.5">خروج خودکار کاربر پس از پایان مدت اعتبار توکن</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Main Countdown Hero Box */}
          <div className={`p-5 rounded-2xl border text-center transition-all ${
            remainingSeconds <= 60
              ? 'bg-rose-50 border-rose-200 text-rose-900 animate-pulse'
              : remainingSeconds <= 300
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <span className="text-xs font-bold text-slate-500 block mb-1">زمان باقی‌مانده تا ابطال توکن و خروج خودکار</span>
            <div className="font-mono text-3xl sm:text-4xl font-black my-1 tracking-wider">
              {formatRemainingTime(remainingSeconds)}
            </div>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>زمان دقیق انقضا: ساعت <strong>{tokenInfo.expiresAtDate}</strong></span>
            </div>
          </div>

          {/* User & Security Specs */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-500">
                <User className="w-3.5 h-3.5 text-slate-400" />
                کاربر فعال صندوق:
              </span>
              <span className="font-bold text-slate-900">{currentStaff.fullName} ({currentStaff.roleTitleFa})</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                شماره همراه:
              </span>
              <span className="font-mono font-bold text-slate-900">{currentStaff.phone}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                نوع توکن امنیتی:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                {tokenInfo.isJwt ? 'توکن JWT جنگو (SimpleJWT)' : 'نشست امنیتی پایانه صندوق'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                وضعیت حفاظت:
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-black">
                <CheckCircle2 className="w-3.5 h-3.5" />
                خروج خودکار فعال است
              </span>
            </div>
          </div>

          {/* Configuration: Choose Session Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              تنظیم پیش‌فرض مدت زمان اعتبار نشست صندوق:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '۱۵ دقیقه', value: 15, tag: 'فوق امنیتی' },
                { label: '۳۰ دقیقه', value: 30, tag: 'استاندارد' },
                { label: '۱ ساعت', value: 60, tag: 'کاری' },
                { label: '۲ ساعت', value: 120, tag: 'شیفت' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleDurationChange(opt.value)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedDuration === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black">{opt.label}</div>
                  <div className={`text-[9px] mt-0.5 ${selectedDuration === opt.value ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {opt.tag}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              با انتخاب هر گزینه، توکن برای همان بازه زمانی معتبر می‌ماند و رأس ثانیه پایان، توکن منقضی و کاربر فوراً از صندوق خارج می‌شود.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              onClick={() => handleExtendClick(30)}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تمدید اعتبار نشست (+۳۰ دقیقه)</span>
            </button>

            <button
              onClick={onForceLogout}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 text-xs font-bold rounded-2xl transition-all"
              title="جهت تست خروج خودکار یا ابطال فوری توکن"
            >
              <LogOut className="w-4 h-4" />
              <span>ابطال توکن و خروج فوری</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
