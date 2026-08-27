import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  Play, 
  RefreshCw, 
  Sparkles
} from 'lucide-react';
import { API_ENDPOINTS, API_GUIDE_TEXT } from '../data/apiDocs';

export const ApiHub: React.FC = () => {
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState<number>(0);
  const [apiKey, setApiKey] = useState<string>('rs_live_9942a8fb3170eec1782b8109d');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'nodejs' | 'python' | 'php'>('nodejs');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [liveResponse, setLiveResponse] = useState<Record<string, unknown> | null>(
    API_ENDPOINTS[0].sampleResponse
  );

  const endpoint = API_ENDPOINTS[selectedEndpointIndex];

  const handleRunTest = () => {
    setIsExecuting(true);
    setLiveResponse(null);
    setTimeout(() => {
      setLiveResponse(endpoint.sampleResponse);
      setIsExecuting(false);
    }, 450);
  };

  const handleGenerateNewKey = () => {
    const randomHex = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    setApiKey(`rs_live_${randomHex}`);
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(keyName);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCodeSnippet = () => {
    const fullUrl = `https://your-domain.ir${endpoint.path}`;
    if (activeCodeLang === 'curl') {
      if (endpoint.method === 'GET') {
        return `curl -X GET "${fullUrl}" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json"`;
      }
      return `curl -X ${endpoint.method} "${fullUrl}" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(endpoint.sampleRequest || {}, null, 2)}'`;
    }

    if (activeCodeLang === 'nodejs') {
      return `// Node.js (Axios / Fetch)
import axios from 'axios';

async function callSmokeApi() {
  try {
    const response = await axios({
      method: '${endpoint.method.toLowerCase()}',
      url: '${fullUrl}',
      headers: {
        'Authorization': 'Bearer ${apiKey}',
        'Content-Type': 'application/json'
      },
      ${endpoint.sampleRequest ? `data: ${JSON.stringify(endpoint.sampleRequest, null, 6)}` : ''}
    });

    console.log('✅ وضعیت پاسخ:', response.status);
    console.log('📦 داده‌های دریافتی:', response.data);
  } catch (error) {
    console.error('❌ خطا در ارتباط با وب‌سرویس:', error.message);
  }
}

callSmokeApi();`;
    }

    if (activeCodeLang === 'python') {
      return `# Python (requests / Django / FastApi)
import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
${endpoint.sampleRequest ? `payload = ${JSON.stringify(endpoint.sampleRequest, null, 4)}\nresponse = requests.${endpoint.method.toLowerCase()}(url, headers=headers, json=payload)` : `response = requests.${endpoint.method.toLowerCase()}(url, headers=headers)`}

if response.status_code == 200 or response.status_code == 201:
    print("✅ داده‌ها با موفقیت دریافت شد:")
    print(response.json())
else:
    print(f"❌ خطا: {response.status_code}")`;
    }

    return `<?php
// PHP cURL
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${fullUrl}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => '${endpoint.method}',
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer ${apiKey}',
    'Content-Type: application/json'
  ),
  ${endpoint.sampleRequest ? `CURLOPT_POSTFIELDS => '${JSON.stringify(endpoint.sampleRequest)}',` : ''}
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;
?>`;
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in duration-300" id="api-integration-hub">
      
      {/* Hero: Direct Answer */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              قابلیت ۱۰۰٪ اتصال به جنگو (Django CRM) و نرم‌افزارهای حسابداری
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              راهنمای اتصال وب‌سرویس RESTful و همگام‌سازی لحظه‌ای نرخ‌ها
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              این پلتفرم بر پایه استاندارد RESTful طراحی شده است. شما می‌توانید تمام محصولات، نرخ‌های کارتن و وضعیت موجودی انبار را مستقیماً از جنگو CRM یا نرم‌افزارهای واسط بدون نیاز به نصب هیچ نرم‌افزار اضافی به‌روز کنید.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl shrink-0 w-full lg:w-72 space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>کلید اختصاصی وب‌سرویس:</span>
              <button 
                onClick={handleGenerateNewKey}
                className="text-[10px] text-amber-700 font-bold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                تولید مجدد
              </button>
            </div>
            <div className="bg-white p-2 rounded-lg font-mono text-xs text-slate-800 flex items-center justify-between border border-slate-300" dir="ltr">
              <span className="truncate">{apiKey}</span>
              <button 
                onClick={() => handleCopy(apiKey, 'api-key')}
                className="p-1 hover:text-slate-900 text-slate-400"
              >
                {copiedCode === 'api-key' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              پروتکل فعال: HTTPS / JSON Bearer Auth
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Use Cases */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">
            کاربردهای اصلی اتصال وب‌سرویس در عمده‌فروشی:
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {API_GUIDE_TEXT.useCases.map((useCase, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 hover:border-amber-400 p-4 rounded-2xl transition-all space-y-1.5 shadow-xs"
            >
              <h4 className="text-xs font-bold text-amber-800">
                {useCase.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {useCase.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive API Console */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                کنسول تست زنده وب‌سرویس‌ها (Interactive API Playground)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              یک متد را انتخاب کرده و دکمه «ارسال تست زنده» را برای مشاهده خروجی JSON بزنید.
            </p>
          </div>

          {/* Endpoint selector buttons */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {API_ENDPOINTS.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedEndpointIndex(idx);
                  setLiveResponse(ep.sampleResponse);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedEndpointIndex === idx
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className={`text-[10px] px-1 rounded font-mono font-bold ${
                  ep.method === 'GET' ? 'bg-sky-100 text-sky-800' :
                  ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {ep.method}
                </span>
                <span className="hidden sm:inline">{ep.path.replace('/api/v1', '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Endpoint Info */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className={`px-2 py-0.5 rounded text-xs font-black font-mono ${
              endpoint.method === 'GET' ? 'bg-sky-100 text-sky-800' :
              endpoint.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {endpoint.method}
            </span>
            <span className="font-mono text-xs text-slate-800 font-bold" dir="ltr">
              {endpoint.path}
            </span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              — {endpoint.title}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {endpoint.description}
          </p>
        </div>

        {/* Request / Response Split Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Code Snippet */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-700">نمونه کد فراخوانی:</span>
              </div>

              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-mono">
                {(['nodejs', 'curl', 'python', 'php'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeLang(lang)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      activeCodeLang === lang ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-3.5 relative text-slate-100">
              <button
                onClick={() => handleCopy(getCodeSnippet(), 'code-snippet')}
                className="absolute top-2.5 left-2.5 p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                title="کپی کد"
              >
                {copiedCode === 'code-snippet' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>کپی</span>
                  </>
                )}
              </button>
              <pre className="text-xs font-mono overflow-x-auto p-1 leading-relaxed max-h-72" dir="ltr">
                {getCodeSnippet()}
              </pre>
            </div>
          </div>

          {/* Right: Live JSON Output & Action */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">خروجی سرور (JSON Response):</span>
              </div>

              <button
                onClick={handleRunTest}
                disabled={isExecuting}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-white" />
                {isExecuting ? 'در حال ارسال...' : 'ارسال تست زنده'}
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl p-3.5 relative min-h-[200px] text-emerald-400">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                <span className="text-emerald-400 font-bold">HTTP 200 OK</span>
                <span>Content-Type: application/json</span>
              </div>

              {isExecuting ? (
                <div className="flex items-center justify-center h-44 text-slate-400 text-xs gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  در حال شبیه‌سازی فراخوانی وب‌سرویس...
                </div>
              ) : (
                <pre className="text-xs font-mono overflow-x-auto max-h-64 leading-relaxed" dir="ltr">
                  {JSON.stringify(liveResponse, null, 2)}
                </pre>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
