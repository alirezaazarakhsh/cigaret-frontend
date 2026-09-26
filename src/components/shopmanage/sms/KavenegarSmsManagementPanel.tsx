import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StaffPermission } from '../../../types';
import {
  djangoSaveKavenegarSettings,
  djangoSaveSmsPattern,
  djangoSaveAllSmsPatterns,
  djangoSendPatternSMS,
  djangoSendOtpSMS
} from '../../../services/djangoApi';

export interface KavenegarSmsManagementPanelProps {
  hasStaffPerm: (perm: StaffPermission) => boolean;
  currentStaff: { fullName: string };
  smsSuccessMessage: string;
  smsErrorMessage: string;
  smsSubTab: 'settings_patterns' | 'sms_logs';
  setSmsSubTab: (tab: 'settings_patterns' | 'sms_logs') => void;
  smsLogs: any[];
  smsPatterns: any[];
  setSmsPatterns: React.Dispatch<React.SetStateAction<any[]>>;
  lastSmsSync: Date | null;
  kavenegarConfig: any;
  setKavenegarConfig: React.Dispatch<React.SetStateAction<any>>;
  showApiToken: boolean;
  setShowApiToken: (show: boolean) => void;
  smsSearch: string;
  setSmsSearch: (query: string) => void;
  smsStatusFilter: string;
  setSmsStatusFilter: (status: any) => void;
  isSmsLoading: boolean;
  onRefreshLogs: () => void;
  onOpenStaffModal: () => void;
  crmConfig: any;
  setSmsSuccessMessage: (msg: string) => void;
  setSmsErrorMessage: (msg: string) => void;
}

const DEFAULT_13_PATTERNS = [
  { name_fa: 'otp', title_fa: 'کد تایید ورود دو مرحله‌ای (OTP)', tokens_info: 'token: کد تایید ۵ رقمی ورود' },
  { name_fa: 'welcome', title_fa: 'خوش‌آمدگویی و ورود به سیستم', tokens_info: 'token: نام و نام خانوادگی کاربر' },
  { name_fa: 'logout', title_fa: 'اطلاع‌رسانی خروج از حساب کاربری', tokens_info: 'token: نام مشتری' },
  { name_fa: 'app_download_link', title_fa: 'لینک دانلود اپلیکیشن موبایل', tokens_info: 'token: عنوان اپ | token20: لینک دانلود' },
  { name_fa: 'pos_receipt', title_fa: 'رسید فاکتور خرید حضوری صندوق', tokens_info: 'token: شماره فاکتور | token2: نام مشتری | token3: مبلغ کل' },
  { name_fa: 'pos_partial_payment', title_fa: 'رسید پرداخت اقساطی / نسیه', tokens_info: 'token: شماره فاکتور | token2: نام مشتری | token3: باقیمانده' },
  { name_fa: 'pos_refund_receipt', title_fa: 'رسید مرجوعی کالا و فاکتور برگشتی', tokens_info: 'token: شماره مرجع | token2: نام مشتری | token3: مبلغ عودتی' },
  { name_fa: 'pos_daily_report', title_fa: 'گزارش فروش روزانه به مدیر ارشد', tokens_info: 'token: تاریخ | token2: تعداد فاکتور | token3: جمع کل فروش' },
  { name_fa: 'order_registered', title_fa: 'ثبت سفارش خرید مشتری آنلاین', tokens_info: 'token: شماره سفارش | token2: مبلغ کل فاکتور' },
  { name_fa: 'order_shipped', title_fa: 'ارسال سفارش و کد رهگیری باربری', tokens_info: 'token: شماره سفارش | token2: نام باربری | token3: کد رهگیری' },
  { name_fa: 'cheque_due_reminder', title_fa: 'یادآوری سررسید چک‌های دریافتی', tokens_info: 'token: شماره چک | token2: سررسید | token3: مبلغ چک' },
  { name_fa: 'debt_overdue_alert', title_fa: 'هشدار سررسید بدهی حساب دفتری', tokens_info: 'token: مبلغ بدهی | token2: تعداد روز تاخیر' },
  { name_fa: 'account_blocked_alert', title_fa: 'هشدار مسدودی حساب دفتری مشتری', tokens_info: 'token: علت مسدودی حساب دفتری' },
];

/**
 * پنل متصل به وب‌سرویس و دیتابیس kavenegar_sms
 */
export const KavenegarSmsManagementPanel: React.FC<KavenegarSmsManagementPanelProps> = ({
  hasStaffPerm,
  currentStaff,
  smsSuccessMessage,
  smsErrorMessage,
  smsSubTab,
  setSmsSubTab,
  smsLogs,
  smsPatterns,
  setSmsPatterns,
  lastSmsSync,
  kavenegarConfig,
  setKavenegarConfig,
  showApiToken,
  setShowApiToken,
  smsSearch,
  setSmsSearch,
  smsStatusFilter,
  setSmsStatusFilter,
  isSmsLoading,
  onRefreshLogs,
  onOpenStaffModal,
  crmConfig,
  setSmsSuccessMessage,
  setSmsErrorMessage,
}) => {
  const [isSavingKavenegarConfig, setIsSavingKavenegarConfig] = useState(false);
  const [isTestingKavenegar, setIsTestingKavenegar] = useState(false);
  const [savingPatternKey, setSavingPatternKey] = useState<Record<string, boolean>>({});
  const [savedPatternKey, setSavedPatternKey] = useState<Record<string, boolean>>({});
  const [isSavingAllPatterns, setIsSavingAllPatterns] = useState(false);

  // Test Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPatternName, setTestPatternName] = useState('otp');
  const [testPhone, setTestPhone] = useState('09120759419');
  const [testToken1, setTestToken1] = useState('12345');
  const [testToken2, setTestToken2] = useState('');
  const [testToken3, setTestToken3] = useState('');
  const [isSendingTestSms, setIsSendingTestSms] = useState(false);

  // Build merged patterns list from default 13 items + DB patterns
  const mergedPatterns = DEFAULT_13_PATTERNS.map((def) => {
    const dbItem = (smsPatterns || []).find(
      (p: any) => p.name_fa === def.name_fa || p.name === def.name_fa || p.title_fa === def.title_fa
    );
    return {
      id: dbItem?.id || def.name_fa,
      name_fa: def.name_fa,
      title_fa: def.title_fa,
      pattern_code: dbItem?.pattern_code !== undefined ? dbItem.pattern_code : (dbItem?.code || ''),
      tokens_info: dbItem?.tokens_info || def.tokens_info,
      is_active: Boolean(dbItem?.pattern_code || dbItem?.code),
    };
  });

  const handlePatternCodeChange = (name_fa: string, newCode: string) => {
    setSmsPatterns((prev) => {
      const exists = prev.some((p: any) => p.name_fa === name_fa);
      if (exists) {
        return prev.map((p: any) =>
          p.name_fa === name_fa ? { ...p, pattern_code: newCode } : p
        );
      }
      return [...prev, { name_fa, pattern_code: newCode }];
    });
  };

  const handleSaveKavenegarConfig = async () => {
    setIsSavingKavenegarConfig(true);
    try {
      const ok = await djangoSaveKavenegarSettings(kavenegarConfig, crmConfig);
      if (ok) {
        setSmsSuccessMessage('تنظیمات درگاه کاوه‌نگار با موفقیت در پایگاه‌داده جنگو ثبت گردید.');
        setTimeout(() => setSmsSuccessMessage(''), 3000);
      } else {
        setSmsErrorMessage('خطا در ذخیره‌سازی تنظیمات پیامک در دیتابیس.');
        setTimeout(() => setSmsErrorMessage(''), 3000);
      }
    } catch {
      setSmsErrorMessage('خطا در ثبت تنظیمات پیامک.');
      setTimeout(() => setSmsErrorMessage(''), 3000);
    } finally {
      setIsSavingKavenegarConfig(false);
    }
  };

  const handleTestKavenegarConnection = async () => {
    setIsTestingKavenegar(true);
    try {
      const res = await djangoSendOtpSMS(kavenegarConfig.sender_number || '09120759419', crmConfig);
      if (res.success) {
        setSmsSuccessMessage(`تست درگاه کاوه‌نگار موفقیت‌آمیز بود: ${res.message}`);
        setTimeout(() => setSmsSuccessMessage(''), 4000);
      } else {
        setSmsErrorMessage('خطا در برقراری ارتباط با وب‌سرویس کاوه‌نگار.');
        setTimeout(() => setSmsErrorMessage(''), 3000);
      }
    } catch {
      setSmsErrorMessage('خطا در برقراری ارتباط با کاوه‌نگار.');
      setTimeout(() => setSmsErrorMessage(''), 3000);
    } finally {
      setIsTestingKavenegar(false);
    }
  };

  const handleSaveSinglePattern = async (name_fa: string) => {
    const pat = mergedPatterns.find((p) => p.name_fa === name_fa);
    const code = pat?.pattern_code || '';
    setSavingPatternKey((prev) => ({ ...prev, [name_fa]: true }));
    try {
      const ok = await djangoSaveSmsPattern(name_fa, code, crmConfig);
      if (ok) {
        setSavedPatternKey((prev) => ({ ...prev, [name_fa]: true }));
        setSmsSuccessMessage(`کد پترن برای بخش «${name_fa}» در دیتابیس جنگو ذخیره شد.`);
        setTimeout(() => {
          setSavedPatternKey((prev) => ({ ...prev, [name_fa]: false }));
          setSmsSuccessMessage('');
        }, 3000);
      } else {
        setSmsErrorMessage(`خطا در ذخیره‌سازی پترن «${name_fa}».`);
        setTimeout(() => setSmsErrorMessage(''), 3000);
      }
    } catch {
      setSmsErrorMessage('خطا در ذخیره پترن.');
      setTimeout(() => setSmsErrorMessage(''), 3000);
    } finally {
      setSavingPatternKey((prev) => ({ ...prev, [name_fa]: false }));
    }
  };

  const handleSaveAllPatterns = async () => {
    setIsSavingAllPatterns(true);
    try {
      const listToSave = mergedPatterns.map((p) => ({
        name_fa: p.name_fa,
        pattern_code: (p.pattern_code || '').trim(),
      }));
      const ok = await djangoSaveAllSmsPatterns(listToSave, crmConfig);
      if (ok) {
        setSmsSuccessMessage('تمامی پترن‌های سامانه با موفقیت در پایگاه‌داده جنگو ثبت گردیدند.');
        setTimeout(() => setSmsSuccessMessage(''), 3000);
      } else {
        setSmsErrorMessage('خطا در ذخیره‌سازی گروهی پترن‌ها.');
        setTimeout(() => setSmsErrorMessage(''), 3000);
      }
    } catch {
      setSmsErrorMessage('خطا در ارتباط با سرور.');
      setTimeout(() => setSmsErrorMessage(''), 3000);
    } finally {
      setIsSavingAllPatterns(false);
    }
  };

  const handleSendManualTestSms = async () => {
    if (!testPhone || testPhone.length < 11) {
      setSmsErrorMessage('لطفاً شماره همراه ۱۱ رقمی معتبر وارد کنید.');
      setTimeout(() => setSmsErrorMessage(''), 3000);
      return;
    }
    setIsSendingTestSms(true);
    try {
      const res = await djangoSendPatternSMS(
        testPhone,
        testPatternName,
        testToken1,
        testToken2,
        testToken3,
        crmConfig
      );
      if (res.success) {
        setSmsSuccessMessage(res.message || 'پیامک تست با موفقیت ارسال شد.');
        setTestModalOpen(false);
        onRefreshLogs();
        setTimeout(() => setSmsSuccessMessage(''), 4000);
      } else {
        setSmsErrorMessage(res.message || 'خطا در ارسال پیامک تست.');
        setTimeout(() => setSmsErrorMessage(''), 3000);
      }
    } catch {
      setSmsErrorMessage('خطا در ارسال پیامک.');
      setTimeout(() => setSmsErrorMessage(''), 3000);
    } finally {
      setIsSendingTestSms(false);
    }
  };

  return (
    <motion.div
      key="sms-management-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      dir="rtl"
    >
      {!hasStaffPerm('send_sms') ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto border border-amber-200 text-2xl">
            🔒
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">عدم دسترسی به سامانه پیامکی</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              شمای کاربری فعلی شما ({currentStaff.fullName}) فاقد دسترسی «ارسال و مدیریت پیامک» است. لطفاً سطح دسترسی خود را ارتقا دهید.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onOpenStaffModal}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors active:scale-95 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              تغییر یا ارتقای دسترسی کاربر
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Notification Banner */}
          {smsSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
              <span>✓</span>
              <span>{smsSuccessMessage}</span>
            </div>
          )}

          {smsErrorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
              <span>⚠️</span>
              <span>{smsErrorMessage}</span>
            </div>
          )}

          {/* Sub-Tab Navigation Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSmsSubTab('settings_patterns')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  smsSubTab === 'settings_patterns'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>⚙️</span>
                <span>تنظیمات درگاه و پترن‌ها (Gateway & Patterns)</span>
              </button>

              <button
                onClick={() => setSmsSubTab('sms_logs')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all relative cursor-pointer ${
                  smsSubTab === 'sms_logs'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>📜</span>
                <span>تاریخچه لاگ‌های دیتابیس پیامک (SMS Logs)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  smsSubTab === 'sms_logs' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {smsLogs.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold px-3 py-1">
              <span className={`w-2 h-2 rounded-full ${lastSmsSync ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <span>سرویس کاوه‌نگار: {lastSmsSync ? `متصل به kavenegar_sms (آخرین بروزرسانی: ${lastSmsSync.toLocaleTimeString('fa-IR')})` : 'در حال بررسی اتصال...'}</span>
            </div>
          </div>

          {/* SUB-TAB 1: Gateway Settings & Patterns */}
          {smsSubTab === 'settings_patterns' && (
            <div className="space-y-6">
              {/* Gateway Core Settings Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🔑</span>
                      <span>تنظیمات وب‌سرویس کاوه‌نگار (KavenegarSMSSetting)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      پیکربندی کلید API و تنظیمات درگاه در جدول <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-[11px]">KavenegarSMSSetting</code> دیتابیس آذرخش
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      kavenegarConfig.is_active !== false 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${kavenegarConfig.is_active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      <span>{kavenegarConfig.is_active !== false ? 'درگاه فعال' : 'درگاه غیرفعال'}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">نام سامانه پیامکی:</label>
                    <input
                      type="text"
                      value={kavenegarConfig.name || ''}
                      onChange={(e) => setKavenegarConfig((prev: any) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      placeholder="مثال: سامانه پیامک هوشمند آذرخش"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700">کلید وب‌سرویس (API Token):</label>
                      <button
                        type="button"
                        onClick={() => setShowApiToken(!showApiToken)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                      >
                        {showApiToken ? 'مخفی‌سازی' : 'نمایش کلید'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showApiToken ? 'text' : 'password'}
                        value={kavenegarConfig.api_token || kavenegarConfig.api_key || ''}
                        onChange={(e) => setKavenegarConfig((prev: any) => ({ ...prev, api_token: e.target.value, api_key: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-left dir-ltr"
                        placeholder="••••••••••••••••••••••••••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={kavenegarConfig.is_active !== false}
                        onChange={(e) => setKavenegarConfig((prev: any) => ({ ...prev, is_active: e.target.checked }))}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span>فعال بودن درگاه پیامک</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(kavenegarConfig.debug_mode)}
                        onChange={(e) => setKavenegarConfig((prev: any) => ({ ...prev, debug_mode: e.target.checked }))}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span>حالت شبیه‌ساز (تست بدون کسر شارژ)</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSaveKavenegarConfig}
                      disabled={isSavingKavenegarConfig}
                      className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-600/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>💾</span>
                      <span>{isSavingKavenegarConfig ? 'در حال ذخیره...' : 'ذخیره تنظیمات درگاه در دیتابیس'}</span>
                    </button>
                    <button
                      onClick={handleTestKavenegarConnection}
                      disabled={isTestingKavenegar}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>⚡</span>
                      <span>{isTestingKavenegar ? 'تست...' : 'تست اتصال درگاه'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 13 Patterns Management Section */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📋</span>
                      <span>مدیریت کدهای پترن ۱۳گانه سامانه (SMS Patterns)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      کدهای الگو (Template Name) دریافتی از پنل کاوه‌نگار را برای هر یک از بخش‌های ۱۳گانه سامانه وارد و ذخیره فرمایید.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTestModalOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>✉️</span>
                      <span>ارسال دستی پیامک تست</span>
                    </button>

                    <button
                      onClick={handleSaveAllPatterns}
                      disabled={isSavingAllPatterns}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>💾</span>
                      <span>{isSavingAllPatterns ? 'در حال ذخیره...' : 'ذخیره گروهی تمامی پترن‌ها'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mergedPatterns.map((pat) => {
                    const isSaving = savingPatternKey[pat.name_fa];
                    const isSaved = savedPatternKey[pat.name_fa];

                    return (
                      <div
                        key={pat.name_fa}
                        className="bg-slate-50/80 border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">{pat.title_fa}</span>
                            <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                              {pat.name_fa}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                            {pat.tokens_info}
                          </p>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">کد پترن انگلیسی:</label>
                            <input
                              type="text"
                              value={pat.pattern_code}
                              onChange={(e) => handlePatternCodeChange(pat.name_fa, e.target.value)}
                              placeholder="مثال: otp_verify یا pos_receipt_template"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left dir-ltr"
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setTestPatternName(pat.name_fa);
                              setTestModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>⚡</span>
                            <span>تست این الگو</span>
                          </button>

                          <button
                            onClick={() => handleSaveSinglePattern(pat.name_fa)}
                            disabled={isSaving}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isSaved
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-900 text-white'
                            }`}
                          >
                            <span>{isSaved ? '✓' : '💾'}</span>
                            <span>{isSaving ? '...' : isSaved ? 'ذخیره شد' : 'ذخیره الگو'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: SMS Database Logs */}
          {smsSubTab === 'sms_logs' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📜</span>
                      <span>لاگ‌های ثبتی پیامک‌ها در دیتابیس آذرخش (SmsLog)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      نمایش زنده تمامی پیامک‌های خدماتی و فاکتورهای پیامکی ارسال شده به همراه وضعیت دلیوری و هزینه
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[220px]">
                      <input
                        type="text"
                        value={smsSearch}
                        onChange={(e) => setSmsSearch(e.target.value)}
                        placeholder="جستجو شماره، پترن، شناسه..."
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                      <span className="absolute right-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
                    </div>

                    <select
                      value={smsStatusFilter}
                      onChange={(e: any) => setSmsStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">تمام وضعیت‌ها</option>
                      <option value="delivered">رسیده به گوشی (Delivered)</option>
                      <option value="queued">در صف ارسال (Queued)</option>
                      <option value="failed">ناموفق (Failed)</option>
                    </select>

                    <button
                      onClick={onRefreshLogs}
                      disabled={isSmsLoading}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🔄</span>
                      <span>به‌روزرسانی لاگ‌ها</span>
                    </button>
                  </div>
                </div>

                {/* Logs Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-black bg-slate-50/70">
                        <th className="py-3 px-3"># شناسه</th>
                        <th className="py-3 px-3">زمان ارسال (شمسی)</th>
                        <th className="py-3 px-3">شماره گیرنده</th>
                        <th className="py-3 px-3">پترن / قالب</th>
                        <th className="py-3 px-3">توکن‌های ارسالی</th>
                        <th className="py-3 px-3">شناسه کاوه‌نگار</th>
                        <th className="py-3 px-3">وضعیت تحویل</th>
                        <th className="py-3 px-3">هزینه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {smsLogs
                        .filter((log) => {
                          if (smsStatusFilter !== 'all' && log.status !== smsStatusFilter) return false;
                          const q = smsSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            (log.recipient_phone || log.recipient || '').toLowerCase().includes(q) ||
                            (log.pattern || log.pattern_name || '').toLowerCase().includes(q) ||
                            (log.pattern_code || '').toLowerCase().includes(q) ||
                            (log.kavenegar_message_id || '').toLowerCase().includes(q)
                          );
                        })
                        .map((log) => {
                          const isDelivered = log.status === 'delivered';
                          const isFailed = log.status === 'failed';
                          const isQueued = log.status === 'queued';

                          let shamsiDate = '-';
                          if (log.created_at) {
                            try {
                              shamsiDate = new Intl.DateTimeFormat('fa-IR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              }).format(new Date(log.created_at));
                            } catch {
                              shamsiDate = log.created_at;
                            }
                          }

                          const tokens = log.tokens_sent || log.tokens || {};

                          return (
                            <tr key={log.id || Math.random()} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3 font-mono text-[11px] text-slate-500">#{log.id}</td>
                              <td className="py-3 px-3 text-[11px] text-slate-600 font-mono">{shamsiDate}</td>
                              <td className="py-3 px-3 font-mono text-xs font-bold text-slate-900 dir-ltr text-right">
                                {log.recipient_phone || log.recipient || '-'}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900 text-xs">{log.pattern || log.pattern_name || '-'}</div>
                                {log.pattern_code && (
                                  <div className="font-mono text-[10px] text-indigo-600">{log.pattern_code}</div>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {tokens.token && (
                                    <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                      T1: {tokens.token}
                                    </span>
                                  )}
                                  {tokens.token2 && (
                                    <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                      T2: {tokens.token2}
                                    </span>
                                  )}
                                  {tokens.token3 && (
                                    <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                      T3: {tokens.token3}
                                    </span>
                                  )}
                                  {!tokens.token && !tokens.token2 && !tokens.token3 && (
                                    <span className="text-slate-400 text-[11px]">-</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono text-[11px] text-slate-600" dir="ltr">
                                {log.kavenegar_message_id || '-'}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                  isDelivered ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  isFailed ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                  isQueued ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    isDelivered ? 'bg-emerald-500' :
                                    isFailed ? 'bg-rose-500' :
                                    isQueued ? 'bg-amber-500' : 'bg-blue-500'
                                  }`}></span>
                                  <span>
                                    {isDelivered ? 'رسیده به گوشی' : isFailed ? 'خطا در ارسال' : isQueued ? 'در صف ارسال' : 'ارسال‌شده'}
                                  </span>
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-700 text-[11px] whitespace-nowrap">
                                {(log.cost_rial || 240).toLocaleString()} ریال
                              </td>
                            </tr>
                          );
                        })}

                      {smsLogs.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                            هنوز هیچ لاگ پیامکی در دیتابیس ثبت نشده است.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Test SMS Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-[250] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>✉️</span>
                <span>ارسال پیامک تست پترن کاوه‌نگار</span>
              </h3>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">انتخاب بخش الگو (Pattern):</label>
                <select
                  value={testPatternName}
                  onChange={(e) => setTestPatternName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DEFAULT_13_PATTERNS.map((p) => (
                    <option key={p.name_fa} value={p.name_fa}>
                      {p.title_fa} ({p.name_fa})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">شماره گیرنده (Mobile):</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-left dir-ltr text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="09120000000"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">توکن ۱ (token):</label>
                  <input
                    type="text"
                    value={testToken1}
                    onChange={(e) => setTestToken1(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="مقدار ۱"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">توکن ۲ (token2):</label>
                  <input
                    type="text"
                    value={testToken2}
                    onChange={(e) => setTestToken2(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="مقدار ۲"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">توکن ۳ (token3):</label>
                  <input
                    type="text"
                    value={testToken3}
                    onChange={(e) => setTestToken3(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="مقدار ۳"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                انصراف
              </button>

              <button
                onClick={handleSendManualTestSms}
                disabled={isSendingTestSms}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>🚀</span>
                <span>{isSendingTestSms ? 'در حال ارسال...' : 'ارسال پیامک تست'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
