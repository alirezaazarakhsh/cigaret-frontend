import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Table, 
  KeyRound, 
  Sparkles, 
  Globe, 
  ExternalLink,
  Download,
  Database,
  Code2
} from 'lucide-react';
import { CodeTab } from './types';
import { CodeViewer } from './CodeViewer';

export interface TableFieldMeta {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: string;
  isUnique?: boolean;
  verbose: string;
  help?: string;
}

export interface TableErdMeta {
  name: string;
  verboseName: string;
  description: string;
  fields: TableFieldMeta[];
}

export interface ApiEndpointMeta {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  auth: 'AllowAny' | 'IsAuthenticated' | 'IsAdminUser' | 'IsVisitor';
  description: string;
  requestBody?: string;
  responseBody?: string;
  curlExample?: string;
}

interface AppDocTemplateProps {
  appFolder: string;
  title: string;
  titleEn: string;
  badge?: string;
  description: string;
  icon: React.ReactNode;
  modelsCode: string;
  adminCode: string;
  serializersCode: string;
  viewsCode: string;
  urlsCode: string;
  notesCode?: string;
  erdTables?: TableErdMeta[];
  endpoints?: ApiEndpointMeta[];
}

export const AppDocTemplate: React.FC<AppDocTemplateProps> = ({
  appFolder,
  title,
  titleEn,
  badge = 'DRF App',
  description,
  icon,
  modelsCode,
  adminCode,
  serializersCode,
  viewsCode,
  urlsCode,
  notesCode,
  erdTables = [],
  endpoints = [],
}) => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [activeEndpointIdx, setActiveEndpointIdx] = useState<number>(0);
  const [copiedEndpointIdx, setCopiedEndpointIdx] = useState<number | null>(null);

  const tabs: { id: CodeTab; label: string; file: string; icon: string }[] = [
    { id: 'models', label: 'مدل‌ها (models.py)', file: `${appFolder}/models.py`, icon: 'Database' },
    { id: 'admin', label: 'پنل ادمین (admin.py)', file: `${appFolder}/admin.py`, icon: 'ShieldCheck' },
    { id: 'serializers', label: 'سریالایزرها (serializers.py)', file: `${appFolder}/serializers.py`, icon: 'Layers' },
    { id: 'views', label: 'ویوها و کنترلرها (views.py)', file: `${appFolder}/views.py`, icon: 'Code2' },
    { id: 'urls', label: 'مسیرها (urls.py)', file: `${appFolder}/urls.py`, icon: 'Globe' },
  ];

  if (notesCode) {
    tabs.push({ id: 'notes', label: 'راهنمای تکمیلی', file: `${appFolder}/README.md`, icon: 'Terminal' });
  }

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'models': return modelsCode;
      case 'admin': return adminCode;
      case 'serializers': return serializersCode;
      case 'views': return viewsCode;
      case 'urls': return urlsCode;
      case 'notes': return notesCode || '';
      default: return modelsCode;
    }
  };

  const getCurrentFilename = () => {
    const found = tabs.find(t => t.id === activeTab);
    return found ? found.file : `${appFolder}/models.py`;
  };

  const handleCopyCurl = (curl: string, idx: number) => {
    navigator.clipboard.writeText(curl);
    setCopiedEndpointIdx(idx);
    setTimeout(() => setCopiedEndpointIdx(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-9 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black flex items-center gap-1.5 font-mono" dir="ltr">
                apps/{appFolder}/
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                {badge}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Django 5.1 LTS Architecture
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black shadow-inner shrink-0">
              {icon}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {title}
              </h1>
              <div className="text-xs font-mono text-blue-300 font-semibold" dir="ltr">
                {titleEn}
              </div>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl font-medium pt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Code Tabs Navigation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto max-w-full">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-black'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            {getCurrentFilename()}
          </div>
        </div>

        {/* Code Block Viewer */}
        <CodeViewer
          code={getCurrentCode()}
          filename={getCurrentFilename()}
          badge={`apps/${appFolder}`}
        />
      </div>

      {/* ERD Database Schema Table (if available) */}
      {erdTables.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 ">
              جداول پایگاه داده PostgreSQL و فیلدهای مدل
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {erdTables.map((table, tIdx) => (
              <div 
                key={tIdx} 
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                      <Table className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 font-mono" dir="ltr">
                        {table.name}
                      </h3>
                      <div className="text-xs text-slate-500 ">
                        {table.verboseName} — {table.description}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {table.fields.length} فیلد
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="py-2.5 px-3 font-mono">نام فیلد (Field)</th>
                        <th className="py-2.5 px-3 font-mono">نوع داده جنگو</th>
                        <th className="py-2.5 px-3">عنوان فارسی</th>
                        <th className="py-2.5 px-3">ویژگی‌ها / کلید</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {table.fields.map((f, fIdx) => (
                        <tr key={fIdx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800 " dir="ltr">
                            {f.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-blue-600 " dir="ltr">
                            {f.type}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 ">
                            {f.verbose}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {f.isPk && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold">
                                  PRIMARY KEY
                                </span>
                              )}
                              {f.isFk && (
                                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold">
                                  FK → {f.fkTarget}
                                </span>
                              )}
                              {f.isUnique && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                                  UNIQUE
                                </span>
                              )}
                              {f.help && (
                                <span className="text-[11px] text-slate-400">
                                  ({f.help})
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REST API Endpoints Interactive Table (if available) */}
      {endpoints.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 ">
                نقشه اندپوینت‌های وب‌سرویس REST API
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Base URL: http://localhost:8000/api/v1/
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {endpoints.map((ep, idx) => {
              const isGet = ep.method === 'GET';
              const isPost = ep.method === 'POST';
              const isPatch = ep.method === 'PATCH' || ep.method === 'PUT';
              const isDelete = ep.method === 'DELETE';

              const badgeColor = isGet
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 '
                : isPost
                ? 'bg-blue-50 text-blue-700 border-blue-200 '
                : isPatch
                ? 'bg-amber-50 text-amber-700 border-amber-200 '
                : 'bg-rose-50 text-rose-700 border-rose-200 ';

              return (
                <div 
                  key={idx}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border ${badgeColor}`}>
                        {ep.method}
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-black text-slate-900 " dir="ltr">
                        {ep.path}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-mono font-bold border border-slate-200/60 ">
                        {ep.auth}
                      </span>
                      {ep.curlExample && (
                        <button
                          onClick={() => handleCopyCurl(ep.curlExample!, idx)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                          title="کپی دستور cURL"
                        >
                          {copiedEndpointIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-[11px]">کپی شد</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[11px]">کپی cURL</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {ep.description}
                  </p>

                  {(ep.requestBody || ep.responseBody) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono" dir="ltr">
                      {ep.requestBody && (
                        <div className="bg-[#0f1422] rounded-2xl p-3.5 border border-slate-800">
                          <div className="text-[11px] text-slate-400 font-bold mb-1.5">Request Payload (JSON):</div>
                          <pre className="text-sky-300 overflow-x-auto">{ep.requestBody}</pre>
                        </div>
                      )}
                      {ep.responseBody && (
                        <div className="bg-[#0f1422] rounded-2xl p-3.5 border border-slate-800">
                          <div className="text-[11px] text-emerald-400 font-bold mb-1.5">Response (200 OK):</div>
                          <pre className="text-emerald-300 overflow-x-auto">{ep.responseBody}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
