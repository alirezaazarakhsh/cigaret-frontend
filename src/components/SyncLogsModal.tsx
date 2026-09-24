import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Terminal, 
  X, 
  RefreshCw, 
  Copy, 
  Download, 
  Trash2, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Database, 
  Layers, 
  Server, 
  Radio, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  ArrowRightLeft,
  Activity
} from 'lucide-react';
import { SyncLogEntry, SyncDiagnosticSummary } from '../types';
import { formatNumberFa } from '../utils/formatters';

interface SyncLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SyncLogEntry[];
  summary: SyncDiagnosticSummary | null;
  onTriggerSync: () => Promise<void> | void;
  isSyncing: boolean;
  djangoConfigUrl?: string;
  onClearLogs: () => void;
}

export const SyncLogsModal: React.FC<SyncLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  summary,
  onTriggerSync,
  isSyncing,
  djangoConfigUrl,
  onClearLogs,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleLogExpand = (id: string) => {
    setExpandedLogIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredLogs = logs.filter(log => {
    if (selectedLevel !== 'ALL' && log.level !== selectedLevel) return false;
    if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchTitle = log.title.toLowerCase().includes(q);
      const matchCategory = log.category.toLowerCase().includes(q);
      const matchProduct = log.targetProductId?.toLowerCase().includes(q);
      return matchMsg || matchTitle || matchCategory || matchProduct;
    }
    return true;
  });

  const handleCopyLogs = () => {
    const textOutput = logs.map(l => 
      `[${l.timestamp}] [${l.level}] [${l.category}] ${l.title} - ${l.message} ${l.details ? '\nDetails: ' + JSON.stringify(l.details, null, 2) : ''}`
    ).join('\n----------------------------------------\n');

    navigator.clipboard.writeText(textOutput);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  const handleDownloadLogs = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      djangoConfigUrl,
      summary,
      totalLogsCount: logs.length,
      logs
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `django-sync-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: SyncLogEntry['level']) => {
    switch (level) {
      case 'SUCCESS':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> SUCCESS</span>;
      case 'ERROR':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30"><XCircle className="w-3 h-3" /> ERROR</span>;
      case 'WARNING':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30"><AlertTriangle className="w-3 h-3" /> WARNING</span>;
      case 'DEBUG':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"><Code2 className="w-3 h-3" /> DEBUG</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30"><Info className="w-3 h-3" /> INFO</span>;
    }
  };

  const getCategoryBadge = (cat: SyncLogEntry['category']) => {
    const colors: Record<string, string> = {
      REQUEST: 'bg-blue-950 text-blue-300 border-blue-800',
      RESPONSE: 'bg-purple-950 text-purple-300 border-purple-800',
      PARSING: 'bg-amber-950 text-amber-300 border-amber-800',
      MERGING: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      STATE_COMMIT: 'bg-teal-950 text-teal-300 border-teal-800',
      CACHE: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${colors[cat] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
        {cat}
      </span>
    );
  };

  // 5 Pipeline Steps Visualizer
  const pipelineSteps = [
    { key: 'REQUEST', name: '۱. ارسال درخواست API', icon: Server, desc: 'تنظیم URL، no-cache و هدرها' },
    { key: 'RESPONSE', name: '۲. دریافت پاسخ HTTP', icon: Radio, desc: 'بررسی Status 200 و باریاب داده' },
    { key: 'PARSING', name: '۳. نگاشت به CigaretteProduct', icon: Layers, desc: 'تبدیل اسکیما و اعتبارسنجی' },
    { key: 'MERGING', name: '۴. تحلیل تفاوت و ادغام', icon: ArrowRightLeft, desc: 'تطبیق بارکد/ID و محاسبه Diffs' },
    { key: 'STATE_COMMIT', name: '۵. اعمال به React UI & Cache', icon: Database, desc: 'تغییر مرجع setProducts و Event' },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 font-vazir text-slate-100 animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Terminal className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">لاگ و دیباگر زنده همگام‌سازی Django API</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Realtime Inspector
                </span>
              </div>
              <p className="text-xs text-slate-400">
                پایش لحظه‌ای فرایند `handleSyncDjango`، وضعیت HTTP، ترجمه اسکیما و علت به‌روزرسانی React State
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-medium text-xs transition-all disabled:opacity-50 shadow-lg shadow-amber-900/30"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'در حال همگام‌سازی...' : 'همگام‌سازی مجدد با لاگ زنده'}</span>
            </button>

            <button
              onClick={handleCopyLogs}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
              title="کپی لاگ‌ها"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedStatus ? 'کپی شد!' : 'کپی لاگ‌ها'}</span>
            </button>

            <button
              onClick={handleDownloadLogs}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
              title="دانلود JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود .JSON</span>
            </button>

            <button
              onClick={onClearLogs}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 border border-slate-700 transition-all"
              title="پاکسازی لاگ‌ها"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all mr-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">

          {/* 5-Step Pipeline Flow */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              مراحل ۵‌گانه خط لوله همگام‌سازی (Sync Execution Pipeline):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
              {pipelineSteps.map((step, idx) => {
                const Icon = step.icon;
                const hasCategoryLogs = logs.some(l => l.category === step.key);
                const hasError = logs.some(l => l.category === step.key && l.level === 'ERROR');
                const hasSuccess = logs.some(l => l.category === step.key && l.level === 'SUCCESS');

                let borderColor = 'border-slate-800 bg-slate-900/60 text-slate-400';
                let iconColor = 'text-slate-500';

                if (hasError) {
                  borderColor = 'border-rose-800/80 bg-rose-950/30 text-rose-200';
                  iconColor = 'text-rose-400';
                } else if (hasSuccess) {
                  borderColor = 'border-emerald-800/80 bg-emerald-950/30 text-emerald-200';
                  iconColor = 'text-emerald-400';
                } else if (hasCategoryLogs) {
                  borderColor = 'border-amber-800/80 bg-amber-950/30 text-amber-200';
                  iconColor = 'text-amber-400';
                }

                return (
                  <div key={step.key} className={`p-3 rounded-xl border text-xs transition-all ${borderColor}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                      <span className="text-[10px] font-mono opacity-60">گام {formatNumberFa(idx + 1)}</span>
                    </div>
                    <div className="font-bold mb-0.5 text-white">{step.name}</div>
                    <div className="text-[11px] opacity-75 line-clamp-1">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Targeted Diagnostic Diagnosis Card */}
          {summary && (
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-inner">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
                  <h4 className="text-sm font-bold text-amber-300">
                    تحلیل اختصاصی: علت به‌روزرسانی / عدم به‌روزرسانی React Local State
                  </h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  HTTP Status: {summary.httpStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">داده‌های دریافتی از API</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {formatNumberFa(summary.totalIncomingItems)} کالا
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">کالاهای تغییریافته / جدید</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {formatNumberFa(summary.updatedProductsCount + summary.newProductsCount)} کالا
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">مرجع جدید React State</span>
                  <span className={`text-xs font-bold font-mono ${summary.arrayReferenceChanged ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {summary.arrayReferenceChanged ? '✅ ایجاد شد (New Ref)' : '❌ یکسان بود'}
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">سیگنال Broadcast و ذخیره‌سازی</span>
                  <span className={`text-xs font-bold font-mono ${summary.eventDispatched && summary.localStorageSaved ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {summary.eventDispatched && summary.localStorageSaved ? '✅ فعال و ذخیره شد' : '⚠️ خطا یا عدم انتشار'}
                  </span>
                </div>
              </div>

              {/* Diagnosis Primary Reason Text */}
              <div className="bg-slate-900 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs leading-relaxed text-slate-200">
                <span className="font-bold text-amber-400 ml-1">جمع‌بندی عیب‌یابی:</span>
                {summary.primaryCauseAnalysis}
              </div>

              {/* Preview of Changed Products if any */}
              {summary.changedProductsPreview && summary.changedProductsPreview.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    نمونه کالاهای دارای تغییر قیمت/موجودی پس از ادغام:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {summary.changedProductsPreview.map((item, idx) => (
                      <div key={idx} className="flex flex-wrap items-center justify-between text-xs p-2 bg-slate-950/80 rounded-lg border border-slate-800/80">
                        <span className="font-medium text-white">{item.nameFa}</span>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-slate-400">قیمت: {formatNumberFa(item.oldPrice)} ➔ <strong className="text-emerald-400">{formatNumberFa(item.newPrice)}</strong> تومان</span>
                          <span className="text-slate-400">موجودی: {formatNumberFa(item.oldStock)} ➔ <strong className="text-amber-400">{formatNumberFa(item.newStock)}</strong> کارتن</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filters & Search Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {/* Level Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'SUCCESS', 'INFO', 'WARNING', 'ERROR', 'DEBUG'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedLevel === lvl
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="جستجو در متن لاگ، بارکد یا شناسه..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Log Stream List */}
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
                <p className="text-xs">هیچ لاگی بر اساس فیلترهای جاری پیدا نشد.</p>
              </div>
            ) : (
              filteredLogs.map(log => {
                const isExpanded = expandedLogIds[log.id];
                return (
                  <div 
                    key={log.id} 
                    className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 transition-all text-xs font-mono"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-slate-500">{log.timestamp}</span>
                        {getLevelBadge(log.level)}
                        {getCategoryBadge(log.category)}
                        <span className="font-semibold text-slate-200">{log.title}</span>
                      </div>

                      {log.details && (
                        <button
                          onClick={() => toggleLogExpand(log.id)}
                          className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <span>{isExpanded ? 'بستن جزئیات JSON' : 'مشاهده جزئیات داده'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <div className="mt-1.5 text-slate-300 font-vazir leading-relaxed text-[12.5px]">
                      {log.message}
                    </div>

                    {/* Expandable JSON details viewer */}
                    {isExpanded && log.details && (
                      <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto dir-ltr">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>تعداد کل لاگ‌های ثبت‌شده: <strong className="text-white font-mono">{formatNumberFa(logs.length)}</strong> مورد</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
