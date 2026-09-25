import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Wallet, 
  Search, 
  PhoneCall, 
  MapPin, 
  Edit2, 
  Trash2, 
  History 
} from 'lucide-react';
import { PosCustomer, PosLedgerTransaction } from '../../../types';
import { formatToman } from '../../../utils/formatters';

interface PosCustomerLedgerViewProps {
  posCustomers: PosCustomer[];
  ledgerTransactions: PosLedgerTransaction[];
  customerSearchQuery: string;
  setCustomerSearchQuery: (query: string) => void;
  customerStatusFilter: 'all' | 'debtors' | 'creditors' | 'settled';
  setCustomerStatusFilter: (status: 'all' | 'debtors' | 'creditors' | 'settled') => void;
  onOpenNewCustomerModal: () => void;
  onOpenEditCustomer: (customer: PosCustomer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onOpenCustomerHistory: (customer: PosCustomer) => void;
  onOpenPaymentModal: (customer: PosCustomer) => void;
}

/**
 * کامپوننت مستقل حساب‌های دفتری (نسیه)، اشخاص، بدهکاران، بستانکاران و تسویه حساب
 * مسیر: /src/components/shopmanage/pos/PosCustomerLedgerView.tsx
 */
export const PosCustomerLedgerView: React.FC<PosCustomerLedgerViewProps> = ({
  posCustomers,
  ledgerTransactions,
  customerSearchQuery,
  setCustomerSearchQuery,
  customerStatusFilter,
  setCustomerStatusFilter,
  onOpenNewCustomerModal,
  onOpenEditCustomer,
  onDeleteCustomer,
  onOpenCustomerHistory,
  onOpenPaymentModal,
}) => {
  const totalDebtorBalance = posCustomers
    .filter(c => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);

  const totalCreditorBalance = posCustomers
    .filter(c => c.balance < 0)
    .reduce((sum, c) => sum + Math.abs(c.balance), 0);

  const filteredCustomers = posCustomers.filter(cust => {
    const matchesSearch = 
      cust.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      cust.phone.includes(customerSearchQuery) ||
      (cust.city && cust.city.includes(customerSearchQuery)) ||
      (cust.address && cust.address.includes(customerSearchQuery));

    if (!matchesSearch) return false;
    if (customerStatusFilter === 'debtors') return cust.balance > 0;
    if (customerStatusFilter === 'creditors') return cust.balance < 0;
    if (customerStatusFilter === 'settled') return cust.balance === 0;
    return true;
  });

  return (
    <motion.div
      key="customers-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>مدیریت پیشرفته حساب‌های دفتری و بدهکاران / بستانکاران</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ثبت مشتریان نسیه، مانده بدهی، گردش حساب و تسویه با فاکتورهای صندوق
            </p>
          </div>
          <button
            onClick={onOpenNewCustomerModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ تعریف مشتری دفتری جدید</span>
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl">
            <span className="text-xs text-rose-700 font-bold flex items-center gap-1">
              <Clock className="w-4 h-4" />
              مجموع مطالبات (طلب فروشگاه از بدهکاران)
            </span>
            <div className="text-xl font-black text-rose-700 mt-2 font-mono">{formatToman(totalDebtorBalance)}</div>
            <span className="text-[10px] text-rose-600 font-bold mt-1 block">
              تعداد مشتریان بدهکار: {posCustomers.filter(c => c.balance > 0).length} نفر
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl">
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <Wallet className="w-4 h-4" />
              مجموع بستانکاری مشتریان
            </span>
            <div className="text-xl font-black text-emerald-700 mt-2 font-mono">{formatToman(totalCreditorBalance)}</div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
              تعداد بستانکاران: {posCustomers.filter(c => c.balance < 0).length} نفر
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
              <Users className="w-4 h-4 text-indigo-600" />
              کل طرف‌های حساب دفتری
            </span>
            <div className="text-xl font-black text-slate-900 mt-2 font-mono">{posCustomers.length} مشتری</div>
            <span className="text-[10px] text-slate-500 font-bold mt-1 block">
              حساب‌های کاملاً تسویه: {posCustomers.filter(c => c.balance === 0).length} طرف حساب
            </span>
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
              placeholder="جستجوی نام مشتری، شماره تلفن، شهر یا آدرس..."
              className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setCustomerStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                customerStatusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              همه ({posCustomers.length})
            </button>
            <button
              onClick={() => setCustomerStatusFilter('debtors')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                customerStatusFilter === 'debtors'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              فقط بدهکاران ({posCustomers.filter(c => c.balance > 0).length})
            </button>
            <button
              onClick={() => setCustomerStatusFilter('creditors')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                customerStatusFilter === 'creditors'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              فقط بستانکاران ({posCustomers.filter(c => c.balance < 0).length})
            </button>
            <button
              onClick={() => setCustomerStatusFilter('settled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                customerStatusFilter === 'settled'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              تسویه شده ({posCustomers.filter(c => c.balance === 0).length})
            </button>
          </div>
        </div>

        {/* Customer Cards Grid */}
        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
            <p className="text-xs font-bold text-slate-600">مشتری با این مشخصات یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(cust => (
              <div 
                key={cust.id} 
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div>
                  {/* Card Top: Name & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 leading-snug">{cust.name}</h4>
                      {cust.phone && cust.phone !== '-' && (
                        <a 
                          href={`tel:${cust.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-mono mt-0.5 font-bold"
                          dir="ltr"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{cust.phone}</span>
                        </a>
                      )}
                    </div>
                    <span 
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap ${
                        cust.balance > 0 
                          ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                          : cust.balance < 0 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {cust.balance > 0 ? `بدهکار: ${formatToman(cust.balance)}` : cust.balance < 0 ? `بستانکار: ${formatToman(Math.abs(cust.balance))}` : 'تسویه کامل'}
                    </span>
                  </div>

                  {/* Address / Location */}
                  {cust.address && (
                    <div className="flex items-start gap-1 text-[11px] text-slate-500 mb-2 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{cust.address}</span>
                    </div>
                  )}

                  {/* Notes / Credit Limit */}
                  {cust.notes && (
                    <div className="bg-white/80 border border-slate-200/60 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-600 mb-2 font-bold">
                      📝 {cust.notes}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>افتتاح حساب: {cust.createdAt}</span>
                    {cust.city && <span className="font-bold text-slate-500">📍 {cust.city}</span>}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditCustomer(cust)}
                      title="ویرایش اطلاعات مشتری"
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCustomer(cust.id)}
                      title="حذف مشتری"
                      className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenCustomerHistory(cust)}
                      className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>گردش حساب</span>
                    </button>

                    <button
                      onClick={() => onOpenPaymentModal(cust)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer active:scale-95"
                    >
                      تسویه / دریافت وجه
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ledger Transactions Audit History */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-600" />
              <span>آخرین تراکنش‌ها و ریز گردش دفاتر حساب</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono font-bold">
              {ledgerTransactions.length} تراکنش ثبت شده
            </span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {ledgerTransactions.map(tx => {
              const cust = posCustomers.find(c => c.id === tx.customerId);
              return (
                <div key={tx.id} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      tx.type === 'debit' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {tx.type === 'debit' ? 'بدهی' : 'واریز'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{cust?.name || 'مشتری دفتری'}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{tx.date} • {tx.description}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-black text-sm ${tx.type === 'debit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {tx.type === 'debit' ? `+${formatToman(tx.amount)}` : `-${formatToman(tx.amount)}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
