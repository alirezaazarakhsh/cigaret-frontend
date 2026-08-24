import React, { useState } from 'react';
import { LayoutDashboard, ArrowRight, Settings, Users, Package } from 'lucide-react';

interface ShopManageLayoutProps {
  children: React.ReactNode;
  onReturnToApp: () => void;
}

export const ShopManageLayout: React.FC<ShopManageLayoutProps> = ({ children, onReturnToApp }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans" dir="rtl">
      {/* Minimal Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            <span className="font-black text-slate-900 dark:text-white">سامانه مدیریت فروشگاه</span>
          </div>
          <button
            onClick={onReturnToApp}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به سایت
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
};
