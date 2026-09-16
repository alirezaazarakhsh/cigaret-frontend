import React from 'react';
import { ChevronRight, ArrowRight, ClipboardList, ShieldCheck } from 'lucide-react';
import { OnlineOrdersManagement } from './shopmanage/OnlineOrdersManagement';
import { NavigationTab, UserProfile } from '../types';

interface CustomerOrdersPageProps {
  onNavigate: (tab: NavigationTab) => void;
  currentUser: UserProfile | null;
}

export const CustomerOrdersPage: React.FC<CustomerOrdersPageProps> = ({
  onNavigate,
  currentUser
}) => {
  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Breadcrumb & Subheader */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <button
              onClick={() => onNavigate('catalog')}
              className="hover:text-blue-600 transition-colors"
            >
              صفحه اصلی
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
            <span className="text-slate-900 font-black flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <span>سفارشات آنلاین مشتریان</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('accounting-pos')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>پنل صندوق و حسابداری</span>
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>کاتالوگ کالاها</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">
        <OnlineOrdersManagement
          onReturnToPos={() => onNavigate('accounting-pos')}
          staffName={currentUser?.fullName || 'مدیر سیستم'}
        />
      </div>
    </div>
  );
};
