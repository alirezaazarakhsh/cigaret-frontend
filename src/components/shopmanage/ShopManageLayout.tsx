import React, { useState } from 'react';
import { LayoutDashboard, ArrowRight, Settings, Users, Package } from 'lucide-react';

interface ShopManageLayoutProps {
  children: React.ReactNode;
  onReturnToApp: () => void;
}

export const ShopManageLayout: React.FC<ShopManageLayoutProps> = ({ children, onReturnToApp }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Minimal Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">سامانه مدیریت فروشگاه</span>
          </div>
          <button
            onClick={onReturnToApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 :bg-slate-100 text-slate-700 text-xs font-black transition-all border border-slate-200 shadow-sm"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به سایت
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1800px] mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
};
