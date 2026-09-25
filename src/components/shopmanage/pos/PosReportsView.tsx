import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Search, 
  Calendar, 
  Filter, 
  Wallet, 
  CreditCard, 
  DollarSign, 
  BookOpen, 
  Layers, 
  CalendarRange, 
  Package, 
  FileText, 
  Eye, 
  Printer 
} from 'lucide-react';
import { PosReceiptInvoice } from '../../../types';
import { formatToman, formatNumberFa } from '../../../utils/formatters';

interface PosReportsViewProps {
  receiptsList: PosReceiptInvoice[];
  reportDateFilter: string;
  setReportDateFilter: (filter: any) => void;
  customSearchDate: string;
  setCustomSearchDate: (val: string) => void;
  reportSearchQuery: string;
  setReportSearchQuery: (query: string) => void;
  filteredReceiptsForReports: PosReceiptInvoice[];
  reportMetrics: {
    totalSales: number;
    count: number;
    posTerminalSales: number;
    cashSales: number;
    ledgerSales: number;
    cartonsSold: number;
    boxesSold: number;
    packsSold: number;
  };
  reportSubTab: 'daily' | 'monthly' | 'products' | 'receipts';
  setReportSubTab: (tab: 'daily' | 'monthly' | 'products' | 'receipts') => void;
  dailySalesGrouped: any[];
  monthlySalesGrouped: any[];
  productSalesGrouped: any[];
  onOpenDailyDetail: (date: string) => void;
  onOpenMonthlyDetail: (monthKey: string) => void;
  onPrintReceipt: (receipt: PosReceiptInvoice) => void;
}

/**
 * کامپوننت مستقل گزارش‌های مالی، فروش روزانه، ماهانه، اقلام پرفروش و ریز فاکتورها
 * مسیر: /src/components/shopmanage/pos/PosReportsView.tsx
 */
export const PosReportsView: React.FC<PosReportsViewProps> = ({
  receiptsList,
  reportDateFilter,
  setReportDateFilter,
  customSearchDate,
  setCustomSearchDate,
  reportSearchQuery,
  setReportSearchQuery,
  filteredReceiptsForReports,
  reportMetrics,
  reportSubTab,
  setReportSubTab,
  dailySalesGrouped,
  monthlySalesGrouped,
  productSalesGrouped,
  onOpenDailyDetail,
  onOpenMonthlyDetail,
  onPrintReceipt,
}) => {
  return (
    <motion.div
      key="reports-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Header & Date Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <span>سامانه گزارش‌گیری پیشرفته فروش روزانه و ماهانه</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              مشاهده ریز آمار فروش، گزارش تفکیکی تاریخ‌ها، ماه‌ها و عملکرد کالاها با قابلیت استخراج و جزئیات فاکتورها
            </p>
          </div>

          {/* Date Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setReportDateFilter('all'); setCustomSearchDate(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${reportDateFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              کل فاکتورها ({receiptsList.length})
            </button>
            <button
              onClick={() => { setReportDateFilter('today'); setCustomSearchDate(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${reportDateFilter === 'today' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              امروز
            </button>
            <button
              onClick={() => { setReportDateFilter('yesterday'); setCustomSearchDate(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${reportDateFilter === 'yesterday' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              دیروز
            </button>
            <button
              onClick={() => { setReportDateFilter('7days'); setCustomSearchDate(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${reportDateFilter === '7days' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ۷ روز اخیر
            </button>
            <button
              onClick={() => { setReportDateFilter('this_month'); setCustomSearchDate(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${reportDateFilter === 'this_month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ماه جاری
            </button>
            <button
              onClick={() => { setReportDateFilter('last_month'); setCustomSearchDate(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${reportDateFilter === 'last_month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ماه گذشته
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={reportSearchQuery}
              onChange={(e) => setReportSearchQuery(e.target.value)}
              placeholder="جستجوی نام مشتری، شماره فاکتور یا نام کالا..."
              className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={customSearchDate}
              onChange={(e) => {
                setCustomSearchDate(e.target.value);
                setReportDateFilter('custom');
              }}
              placeholder="فیلتر تاریخ خاص (مثال: 1403/06/04)"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>تعداد فاکتورهای یافت شده: <strong className="text-slate-900 font-mono text-sm">{filteredReceiptsForReports.length}</strong> فاکتور</span>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 p-4 rounded-2xl shadow-2xs">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-indigo-600" />
              مجموع درآمد کل دوره
            </span>
            <div className="text-xl font-black text-indigo-700 mt-1.5">{formatToman(reportMetrics.totalSales)}</div>
            <span className="text-[10px] text-indigo-900/60 font-mono mt-1 block font-bold">تعداد کل فاکتورها: {reportMetrics.count}</span>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 p-4 rounded-2xl shadow-2xs">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              فروش دستگاه کارتخوان (POS)
            </span>
            <div className="text-xl font-black text-blue-700 mt-1.5">{formatToman(reportMetrics.posTerminalSales)}</div>
            <span className="text-[10px] text-blue-900/60 font-mono mt-1 block font-bold">
              {reportMetrics.totalSales > 0 ? `${Math.round((reportMetrics.posTerminalSales / reportMetrics.totalSales) * 100)}٪ از کل فروش` : '۰٪'}
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-100 p-4 rounded-2xl shadow-2xs">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              فروش نقدی (وجه نقد)
            </span>
            <div className="text-xl font-black text-emerald-700 mt-1.5">{formatToman(reportMetrics.cashSales)}</div>
            <span className="text-[10px] text-emerald-900/60 font-mono mt-1 block font-bold">
              {reportMetrics.totalSales > 0 ? `${Math.round((reportMetrics.cashSales / reportMetrics.totalSales) * 100)}٪ از کل فروش` : '۰٪'}
            </span>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-100 p-4 rounded-2xl shadow-2xs">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              فروش حساب دفتری (نسیه)
            </span>
            <div className="text-xl font-black text-purple-700 mt-1.5">{formatToman(reportMetrics.ledgerSales)}</div>
            <span className="text-[10px] text-purple-900/60 font-mono mt-1 block font-bold">
              {reportMetrics.totalSales > 0 ? `${Math.round((reportMetrics.ledgerSales / reportMetrics.totalSales) * 100)}٪ از کل فروش` : '۰٪'}
            </span>
          </div>
        </div>

        {/* Stock Outflow Summary Pills */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black">حجم کلی بار و مقادیر خروجی از انبار در این بازه:</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">تفکیک دقیق واحدهای کارتنی، باکسی و پاکتی تحویل داده شده به مشتریان</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center font-mono">
            <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-sans">کارتن فروخته شده</span>
              <span className="text-indigo-400 text-base font-black">{formatNumberFa(reportMetrics.cartonsSold)}</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-sans">باکس فروخته شده</span>
              <span className="text-emerald-400 text-base font-black">{formatNumberFa(reportMetrics.boxesSold)}</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-sans">پاکت فروخته شده</span>
              <span className="text-amber-400 text-base font-black">{formatNumberFa(reportMetrics.packsSold)}</span>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation for Reports */}
        <div className="border-b border-slate-200 flex items-center gap-2 sm:gap-4 text-xs font-bold pt-2 overflow-x-auto whitespace-nowrap pb-1">
          <button
            onClick={() => setReportSubTab('daily')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${reportSubTab === 'daily' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Calendar className="w-4 h-4" />
            <span>🗓️ گزارش فروش روزانه (بر اساس تاریخ)</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-mono">{dailySalesGrouped.length} روز</span>
          </button>

          <button
            onClick={() => setReportSubTab('monthly')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${reportSubTab === 'monthly' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>📅 گزارش فروش ماهانه (بر اساس ماه)</span>
            <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-mono">{monthlySalesGrouped.length} ماه</span>
          </button>

          <button
            onClick={() => setReportSubTab('products')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${reportSubTab === 'products' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Package className="w-4 h-4" />
            <span>🛍️ ریز گزارش اقلام فروخته شده (محصولات)</span>
          </button>

          <button
            onClick={() => setReportSubTab('receipts')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${reportSubTab === 'receipts' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <FileText className="w-4 h-4" />
            <span>🧾 لیست تمام فاکتورهای این بازه</span>
          </button>
        </div>

        {/* SUB-VIEW 1: DAILY SALES TABLE */}
        {reportSubTab === 'daily' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-sm font-black text-slate-900">جدول تفکیکی فروش روز به روز (بر اساس تاریخ شمسی)</h3>
              <span className="text-xs text-slate-500">جهت مشاهده ریز فاکتورهای هر روز، روی دکمه «ریز گزارش روزانه» کلیک کنید.</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full text-right text-xs min-w-[720px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">تاریخ فروش</th>
                    <th className="p-3 text-center">تعداد فاکتور</th>
                    <th className="p-3">فروش کارتخوان</th>
                    <th className="p-3">فروش نقدی</th>
                    <th className="p-3">حساب دفتری (نسیه)</th>
                    <th className="p-3 text-center">حجم بار خروجی</th>
                    <th className="p-3">مجموع فروش روز</th>
                    <th className="p-3 text-center">عملیات & ریز گزارش</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailySalesGrouped.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        هیچ تراکنش و فاکتور فروشی برای این بازه یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    dailySalesGrouped.map((day) => (
                      <tr key={day.date} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="p-3 font-mono font-black text-indigo-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{day.date}</span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                            {day.receipts.length} فاکتور
                          </span>
                        </td>
                        <td className="p-3 font-mono text-blue-700 font-bold">{formatToman(day.posSales)}</td>
                        <td className="p-3 font-mono text-emerald-700 font-bold">{formatToman(day.cashSales)}</td>
                        <td className="p-3 font-mono text-purple-700 font-bold">{formatToman(day.ledgerSales)}</td>
                        <td className="p-3 text-center font-mono text-[11px]">
                          {day.cartons > 0 && <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold ml-1">{day.cartons} کارتن</span>}
                          {day.boxes > 0 && <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold ml-1">{day.boxes} باکس</span>}
                          {day.packs > 0 && <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{day.packs} پاکت</span>}
                        </td>
                        <td className="p-3 font-mono font-black text-sm text-indigo-600">{formatToman(day.totalSales)}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => onOpenDailyDetail(day.date)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 mx-auto cursor-pointer active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ریز گزارش روزانه</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 2: MONTHLY SALES TABLE */}
        {reportSubTab === 'monthly' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-sm font-black text-slate-900">جدول خلاصه عملکرد ماهانه فروشگاه (ماه به ماه)</h3>
              <span className="text-xs text-slate-500">تحلیل درآمد کل ماه‌ها و میانگین فروش روزانه هر ماه</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full text-right text-xs min-w-[720px]">
                <thead className="bg-purple-50 text-purple-900 font-bold border-b border-purple-200">
                  <tr>
                    <th className="p-3">ماه و سال</th>
                    <th className="p-3 text-center">روزهای کاری فعال</th>
                    <th className="p-3 text-center">تعداد فاکتورها</th>
                    <th className="p-3">میانگین فروش روزانه</th>
                    <th className="p-3">فروش کارتخوان</th>
                    <th className="p-3">فروش نقدی و دفتری</th>
                    <th className="p-3">درآمد کل ماه</th>
                    <th className="p-3 text-center">جزئیات کامل ماه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlySalesGrouped.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        اطلاعاتی برای این ماه ثبت نشده است.
                      </td>
                    </tr>
                  ) : (
                    monthlySalesGrouped.map((m) => {
                      const avgDaily = Math.round(m.totalSales / (m.activeDaysCount || 1));
                      return (
                        <tr key={m.monthKey} className="hover:bg-purple-50/40 transition-colors">
                          <td className="p-3 font-black text-purple-950 flex items-center gap-2">
                            <CalendarRange className="w-4 h-4 text-purple-600" />
                            <span>{m.monthName}</span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-700">{m.activeDaysCount} روز</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-700">{m.receipts.length} فاکتور</td>
                          <td className="p-3 font-mono font-bold text-slate-600">{formatToman(avgDaily)}</td>
                          <td className="p-3 font-mono text-blue-700 font-bold">{formatToman(m.posSales)}</td>
                          <td className="p-3 font-mono text-emerald-700 font-bold">{formatToman(m.cashSales + m.ledgerSales)}</td>
                          <td className="p-3 font-mono font-black text-sm text-purple-700">{formatToman(m.totalSales)}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => onOpenMonthlyDetail(m.monthKey)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 mx-auto cursor-pointer active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>ریز گزارش ماهانه</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: PRODUCTS SALES BREAKDOWN */}
        {reportSubTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-sm font-black text-slate-900">گزارش خروجی کالاها و رتبه‌بندی اقلام پرفروش</h3>
              <span className="text-xs text-slate-500">تفکیک دقیق تعداد کارتن، باکس و پاکت فروخته شده هر محصول</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full text-right text-xs min-w-[700px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">رتبه</th>
                    <th className="p-3">نام فارسی کالا</th>
                    <th className="p-3">برند / دسته</th>
                    <th className="p-3 text-center">کارتن فروخته شده</th>
                    <th className="p-3 text-center">باکس فروخته شده</th>
                    <th className="p-3 text-center">پاکت فروخته شده</th>
                    <th className="p-3">مجموع درآمد کل محصول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productSalesGrouped.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        هیچ کالایی در این بازه فروخته نشده است.
                      </td>
                    </tr>
                  ) : (
                    productSalesGrouped.map((prod, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-400 text-center">{idx + 1}</td>
                        <td className="p-3 font-black text-slate-900">{prod.productName}</td>
                        <td className="p-3 text-slate-500">{prod.brand}</td>
                        <td className="p-3 text-center font-mono font-bold text-indigo-700">{prod.cartons > 0 ? `${prod.cartons} کارتن` : '-'}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-800">{prod.boxes > 0 ? `${prod.boxes} باکس` : '-'}</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">{prod.packs > 0 ? `${prod.packs} پاکت` : '-'}</td>
                        <td className="p-3 font-mono font-black text-indigo-600">{formatToman(prod.totalRevenue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-VIEW 4: RECEIPTS AUDIT LIST */}
        {reportSubTab === 'receipts' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-sm font-black text-slate-900">لیست تمام فاکتورهای فروش در این بازه انتخاب شده</h3>
              <span className="text-xs text-slate-500">قابلیت مشاهده فیش، چاپ مجدد و بررسی روش تسویه</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full text-right text-xs min-w-[700px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">شماره فاکتور</th>
                    <th className="p-3">تاریخ و زمان</th>
                    <th className="p-3">نام خریدار / مشتری</th>
                    <th className="p-3">روش تسویه</th>
                    <th className="p-3 text-center">تعداد اقلام</th>
                    <th className="p-3">مبلغ کل فاکتور</th>
                    <th className="p-3 text-center">چاپ فیش</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReceiptsForReports.map((rcpt) => (
                    <tr key={rcpt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-700">{rcpt.receiptNumber}</td>
                      <td className="p-3 font-mono text-slate-600">{rcpt.createdAt}</td>
                      <td className="p-3 font-bold text-slate-900">{rcpt.customerName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          rcpt.paymentMethod === 'pos_terminal' ? 'bg-blue-100 text-blue-800' :
                          rcpt.paymentMethod === 'cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {rcpt.paymentMethod === 'pos_terminal' ? 'کارتخوان' : rcpt.paymentMethod === 'cash' ? 'نقدی' : 'حساب دفتری'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{rcpt.items.length} آیتم</td>
                      <td className="p-3 font-mono font-black text-indigo-600">{formatToman(rcpt.finalTotal)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onPrintReceipt(rcpt)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-600" />
                          <span>فیش</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};
