import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  Minimize2, 
  FileCode, 
  Terminal,
  Code2
} from 'lucide-react';

interface CodeViewerProps {
  code: string;
  filename: string;
  language?: string;
  title?: string;
  badge?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  filename,
  language = 'python',
  title,
  badge = 'Python 3.12 / DRF'
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lines = code.trim().split('\n');
  const lineCount = lines.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename.split('/').pop() || 'django_code.py';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-800 bg-[#0f1422] shadow-2xl transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-2xl flex flex-col' : ''
    }`}>
      {/* Code Header Bar */}
      <div className="bg-[#161c2e] px-4 py-3 border-b border-slate-800/90 flex items-center justify-between gap-3 text-xs">
        {/* Left: macOS dots & Filename */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          <div className="flex items-center gap-2 min-w-0 font-mono">
            <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-slate-200 font-bold text-xs sm:text-sm truncate" dir="ltr">
              {filename}
            </span>
          </div>
        </div>

        {/* Right: Badge & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            {lineCount} خط کد
          </span>

          <span className="hidden md:inline-block text-[11px] font-mono text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800/50 font-bold">
            {badge}
          </span>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer border border-slate-700"
            title="دانلود فایل پایتون (.py)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">دانلود</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
            title="کپی کردن تمام کدها"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی کد</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'خروج از تمام‌صفحه' : 'نمایش تمام‌صفحه'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div 
        className={`p-4 sm:p-5 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed text-slate-300 ${
          isFullscreen ? 'flex-1 overflow-y-auto' : 'max-h-[620px] overflow-y-auto'
        }`}
        dir="ltr"
      >
        <pre className="flex">
          {/* Line Numbers Column */}
          <div className="select-none text-slate-600 text-right pr-4 pl-2 border-r border-slate-800 shrink-0 font-mono opacity-70">
            {lines.map((_, index) => (
              <div key={index} className="leading-relaxed">
                {index + 1}
              </div>
            ))}
          </div>

          {/* Actual Code Column */}
          <div className="pl-4 pr-2 flex-1 overflow-x-auto font-mono whitespace-pre text-slate-200">
            {lines.map((line, index) => {
              // Lightweight syntax highlighting touches
              let colorClass = 'text-slate-200';
              if (line.trim().startsWith('#') || line.trim().startsWith('"""') || line.trim().startsWith("'''") || line.includes('"""')) {
                colorClass = 'text-emerald-400 font-medium italic';
              } else if (line.includes('class ') || line.includes('def ')) {
                colorClass = 'text-amber-300 font-bold';
              } else if (line.includes('models.') || line.includes('serializers.') || line.includes('viewsets.')) {
                colorClass = 'text-sky-300 font-semibold';
              } else if (line.includes('@') || line.includes('import ') || line.includes('from ')) {
                colorClass = 'text-purple-300';
              } else if (line.includes('return ') || line.includes('if ') || line.includes('else:') || line.includes('elif ')) {
                colorClass = 'text-rose-300 font-semibold';
              }

              return (
                <div key={index} className={`leading-relaxed hover:bg-slate-800/40 px-1 rounded-sm ${colorClass}`}>
                  {line || ' '}
                </div>
              );
            })}
          </div>
        </pre>
      </div>

      {/* Code Footer info */}
      <div className="bg-[#121727] px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-blue-400" />
          <span>Django REST Framework / Python 3.12+ UTF-8</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{lineCount} Lines</span>
          <span>{(new TextEncoder().encode(code).length / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </div>
  );
};
