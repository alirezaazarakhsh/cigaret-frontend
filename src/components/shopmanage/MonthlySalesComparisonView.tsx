import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  CalendarRange, 
  ArrowUpDown, 
  Download, 
  Printer, 
  CreditCard, 
  Banknote, 
  Clock, 
  Split, 
  Package, 
  Receipt, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell, 
  ComposedChart,
  Area
} from 'recharts';
import { PosReceiptInvoice, MonthlySalesRecord } from '../../types';
import { formatToman, formatNumberFa } from '../../utils/formatters';
import { generateAnnualReportPdf } from '../../utils/pdfGenerator';

interface MonthlySalesComparisonViewProps {
  receiptsList: PosReceiptInvoice[];
}

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export const MonthlySalesComparisonView: React.FC<MonthlySalesComparisonViewProps> = ({
  receiptsList,
}) => {
  const [chartMetric, setChartMetric] = useState<'sales' | 'cartons' | 'profit' | 'payment_breakdown'>('sales');
  const [selectedBaseMonth, setSelectedBaseMonth] = useState<string>('1403/05 (مرداد)');
  const [selectedCompareMonth, setSelectedCompareMonth] = useState<string>('1403/06 (شهریور)');

  // Build monthly sales dataset combining real receipts + benchmark historical monthly data
  const monthlyData: MonthlySalesRecord[] = useMemo(() => {
    // Initial benchmark baseline for 1403 year
    const baseBenchmark: Record<string, { totalSales: number; cartons: number; boxes: number; packs: number; invoices: number; pos: number; cash: number; ledger: number; split: number }> = {
      '1403/01': { totalSales: 420000000, cartons: 85, boxes: 120, packs: 450, invoices: 24, pos: 250000000, cash: 80000000, ledger: 90000000, split: 0 },
      '1403/02': { totalSales: 510000000, cartons: 102, boxes: 180, packs: 620, invoices: 32, pos: 310000000, cash: 95000000, ledger: 105000000, split: 0 },
      '1403/03': { totalSales: 630000000, cartons: 128, boxes: 210, packs: 780, invoices: 41, pos: 380000000, cash: 110000000, ledger: 140000000, split: 0 },
      '1403/04': { totalSales: 590000000, cartons: 115, boxes: 195, packs: 710, invoices: 38, pos: 360000000, cash: 100000000, ledger: 130000000, split: 0 },
      '1403/05': { totalSales: 780000000, cartons: 154, boxes: 280, packs: 940, invoices: 52, pos: 490000000, cash: 130000000, ledger: 160000000, split: 0 },
      '1403/06': { totalSales: 895000000, cartons: 176, boxes: 340, packs: 1120, invoices: 64, pos: 560000000, cash: 145000000, ledger: 190000000, split: 0 },
    };

    // Integrate dynamic receipts
    receiptsList.forEach(rcpt => {
      // derive month key from createdAt (e.g. "1403/06/04 11:30" => "1403/06")
      const parts = rcpt.createdAt.split(' ')[0].split('/');
      if (parts.length >= 2) {
        const monthKey = `${parts[0]}/${parts[1].padStart(2, '0')}`;
        if (!baseBenchmark[monthKey]) {
          baseBenchmark[monthKey] = { totalSales: 0, cartons: 0, boxes: 0, packs: 0, invoices: 0, pos: 0, cash: 0, ledger: 0, split: 0 };
        }
        baseBenchmark[monthKey].totalSales += rcpt.finalTotal;
        baseBenchmark[monthKey].invoices += 1;

        if (rcpt.paymentMethod === 'pos_terminal') baseBenchmark[monthKey].pos += rcpt.finalTotal;
        else if (rcpt.paymentMethod === 'cash') baseBenchmark[monthKey].cash += rcpt.finalTotal;
        else if (rcpt.paymentMethod === 'ledger') baseBenchmark[monthKey].ledger += rcpt.finalTotal;
        else if (rcpt.paymentMethod === 'split') {
          const paidNow = rcpt.splitPaymentDetails?.paidNow || 0;
          const paidVia = rcpt.splitPaymentDetails?.paidVia || 'pos_terminal';
          const rem = rcpt.splitPaymentDetails?.remainingToLedger || 0;
          if (paidVia === 'pos_terminal') baseBenchmark[monthKey].pos += paidNow;
          else baseBenchmark[monthKey].cash += paidNow;
          baseBenchmark[monthKey].ledger += rem;
          baseBenchmark[monthKey].split += rcpt.finalTotal;
        }

        rcpt.items.forEach(it => {
          if (it.unit === 'carton') baseBenchmark[monthKey].cartons += it.quantity;
          else if (it.unit === 'box') baseBenchmark[monthKey].boxes += it.quantity;
          else baseBenchmark[monthKey].packs += it.quantity;
        });
      }
    });

    const sortedKeys = Object.keys(baseBenchmark).sort();
    const result: MonthlySalesRecord[] = [];

    sortedKeys.forEach((key, index) => {
      const b = baseBenchmark[key];
      const monthNum = parseInt(key.split('/')[1], 10);
      const monthName = PERSIAN_MONTHS[monthNum - 1] || key;
      const profit = Math.floor(b.totalSales * 0.12); // ~12% average distributor wholesale margin

      let growthRate = 0;
      if (index > 0) {
        const prevSales = baseBenchmark[sortedKeys[index - 1]].totalSales;
        if (prevSales > 0) {
          growthRate = Math.round(((b.totalSales - prevSales) / prevSales) * 100);
        }
      }

      result.push({
        monthKey: key,
        monthName: `${key} (${monthName})`,
        monthNumber: monthNum,
        year: parseInt(key.split('/')[0], 10),
        totalSales: b.totalSales,
        totalProfit: profit,
        cartonsSold: b.cartons,
        boxesSold: b.boxes,
        packsSold: b.packs,
        invoiceCount: b.invoices,
        posTerminalSales: b.pos,
        cashSales: b.cash,
        ledgerSales: b.ledger,
        splitSales: b.split,
        growthRatePercent: growthRate,
      });
    });

    return result;
  }, [receiptsList]);

  // Aggregate stats
  const totalAnnualSales = useMemo(() => monthlyData.reduce((acc, m) => acc + m.totalSales, 0), [monthlyData]);
  const totalAnnualProfit = useMemo(() => monthlyData.reduce((acc, m) => acc + m.totalProfit, 0), [monthlyData]);
  const totalAnnualCartons = useMemo(() => monthlyData.reduce((acc, m) => acc + m.cartonsSold, 0), [monthlyData]);
  const averageMonthlySales = useMemo(() => (monthlyData.length > 0 ? Math.floor(totalAnnualSales / monthlyData.length) : 0), [totalAnnualSales, monthlyData]);

  // Selected 2-Month side-by-side comparison
  const baseMonthData = monthlyData.find(m => m.monthName === selectedBaseMonth) || monthlyData[monthlyData.length - 2] || monthlyData[0];
  const compareMonthData = monthlyData.find(m => m.monthName === selectedCompareMonth) || monthlyData[monthlyData.length - 1] || monthlyData[0];

  const deltaSales = compareMonthData && baseMonthData ? compareMonthData.totalSales - baseMonthData.totalSales : 0;
  const deltaSalesPercent = baseMonthData && baseMonthData.totalSales > 0 ? Math.round((deltaSales / baseMonthData.totalSales) * 100) : 0;
  const deltaCartons = compareMonthData && baseMonthData ? compareMonthData.cartonsSold - baseMonthData.cartonsSold : 0;
  const deltaInvoices = compareMonthData && baseMonthData ? compareMonthData.invoiceCount - baseMonthData.invoiceCount : 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>تحلیل هوشمند و مقایسه نموداری فروش ماهانه</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  سال ۱۴۰۳
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مقایسه روند درآمدی، حجم کارتن، سود ناخالص و کانال‌های تسویه ماه به ماه (MoM)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateAnnualReportPdf(monthlyData)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              title="دانلود فایل PDF گزارش سالانه و عملکرد دوره‌ای"
            >
              <Download className="w-4 h-4" />
              <span>دانلود PDF گزارش سالانه</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            انتخاب شاخص نمایش نمودار:
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setChartMetric('sales')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                chartMetric === 'sales'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              مبلغ کل فروش
            </button>
            <button
              onClick={() => setChartMetric('cartons')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                chartMetric === 'cartons'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              حجم کارتن
            </button>
            <button
              onClick={() => setChartMetric('payment_breakdown')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                chartMetric === 'payment_breakdown'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              تفکیک روش تسویه
            </button>
            <button
              onClick={() => setChartMetric('profit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                chartMetric === 'profit'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              تخمین سود ناخالص
            </button>
          </div>
        </div>

        {/* 4 Summary Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 p-4 rounded-2xl">
            <span className="text-xs text-indigo-700 font-bold flex items-center justify-between">
              <span>مجموع فروش دوره‌ای (شش ماهه)</span>
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </span>
            <div className="text-xl font-black text-indigo-950 mt-2 font-mono">{formatToman(totalAnnualSales)}</div>
            <span className="text-[10px] text-indigo-600 font-bold mt-1 block">
              میانگین ماهانه: {formatToman(averageMonthlySales)}
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-2xl">
            <span className="text-xs text-emerald-700 font-bold flex items-center justify-between">
              <span>سود ناخالص تخمینی توزیع</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </span>
            <div className="text-xl font-black text-emerald-950 mt-2 font-mono">{formatToman(totalAnnualProfit)}</div>
            <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
              حاشیه سود میانگین: ۱۲٪ عمده‌فروشی
            </span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl">
            <span className="text-xs text-amber-800 font-bold flex items-center justify-between">
              <span>حجم کل کارتن‌های توزیع شده</span>
              <Package className="w-4 h-4 text-amber-600" />
            </span>
            <div className="text-xl font-black text-amber-950 mt-2 font-mono">{totalAnnualCartons.toLocaleString('fa-IR')} کارتن</div>
            <span className="text-[10px] text-amber-700 font-bold mt-1 block">
              بیشترین حجم: ماه شهریور ({monthlyData[monthlyData.length - 1]?.cartonsSold || 0} کارتن)
            </span>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-2xl">
            <span className="text-xs text-purple-700 font-bold flex items-center justify-between">
              <span>نرخ رشد آخرین ماه (MoM)</span>
              <ArrowUpRight className="w-4 h-4 text-purple-600" />
            </span>
            <div className="text-xl font-black text-purple-950 mt-2 font-mono">
              +{monthlyData[monthlyData.length - 1]?.growthRatePercent || 0}٪
            </div>
            <span className="text-[10px] text-purple-600 font-bold mt-1 block">
              روند صعودی در سه ماه متوالی تابستان
            </span>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-indigo-600" />
              <span>
                {chartMetric === 'sales' && 'نمودار مقایسه‌ای فروش ماهانه (تومان)'}
                {chartMetric === 'cartons' && 'نمودار مقایسه‌ای تعداد کارتن توزیع شده'}
                {chartMetric === 'payment_breakdown' && 'نمودار تفکیکی سهم کارتخوان، نقد و نسیه دفتری'}
                {chartMetric === 'profit' && 'نمودار مقایسه‌ای سود ناخالص ماهانه (تومان)'}
              </span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              مقایسه ۶ دوره متوالی سال ۱۴۰۳
            </span>
          </div>

          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'sales' ? (
                <ComposedChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#475569' }} 
                    tickFormatter={(v) => `${(v / 1000000).toLocaleString('fa-IR')} م`} 
                  />
                  <RechartsTooltip 
                    formatter={(value: any) => [`${formatToman(Number(value))}`, 'مبلغ فروش']}
                    labelStyle={{ fontFamily: 'sans-serif', fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Bar dataKey="totalSales" name="مبلغ فروش" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40}>
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === monthlyData.length - 1 ? '#4338ca' : '#6366f1'} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="totalSales" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5, fill: '#f43f5e' }} />
                </ComposedChart>
              ) : chartMetric === 'cartons' ? (
                <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                  <RechartsTooltip 
                    formatter={(value: any) => [`${Number(value).toLocaleString('fa-IR')} کارتن`, 'حجم فروش']}
                  />
                  <Bar dataKey="cartonsSold" name="تعداد کارتن" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              ) : chartMetric === 'payment_breakdown' ? (
                <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#475569' }} 
                    tickFormatter={(v) => `${(v / 1000000).toLocaleString('fa-IR')} م`} 
                  />
                  <RechartsTooltip 
                    formatter={(value: any) => [`${formatToman(Number(value))}`]}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: 10, fontSize: 11 }} 
                    formatter={(value) => (value === 'posTerminalSales' ? 'کارتخوان POS' : value === 'cashSales' ? 'نقدی' : 'نسیه دفتری')}
                  />
                  <Bar dataKey="posTerminalSales" name="posTerminalSales" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="cashSales" name="cashSales" stackId="a" fill="#10b981" />
                  <Bar dataKey="ledgerSales" name="ledgerSales" stackId="a" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#475569' }} 
                    tickFormatter={(v) => `${(v / 1000000).toLocaleString('fa-IR')} م`} 
                  />
                  <RechartsTooltip 
                    formatter={(value: any) => [`${formatToman(Number(value))}`, 'سود ناخالص']}
                  />
                  <Bar dataKey="totalProfit" name="سود ناخالص" fill="#059669" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side-by-Side 2-Month Comparative Analyzer */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black flex items-center gap-2 text-white">
                <ArrowUpDown className="w-5 h-5 text-indigo-400" />
                <span>ابزار مقایسه دو ماه انتخابی (Side-by-Side MoM)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                دو ماه مورد نظر خود را برای محاسبه دقیق تغییرات و دلتا مقادیر انتخاب کنید
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400">ماه اول (پایه):</span>
                <select
                  value={selectedBaseMonth}
                  onChange={(e) => setSelectedBaseMonth(e.target.value)}
                  className="bg-transparent text-white font-black focus:outline-none"
                >
                  {monthlyData.map(m => (
                    <option key={m.monthKey} value={m.monthName} className="bg-slate-900 text-white">
                      {m.monthName}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-slate-500 font-black">vs</span>

              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400">ماه دوم (مقایسه):</span>
                <select
                  value={selectedCompareMonth}
                  onChange={(e) => setSelectedCompareMonth(e.target.value)}
                  className="bg-transparent text-white font-black focus:outline-none"
                >
                  {monthlyData.map(m => (
                    <option key={m.monthKey} value={m.monthName} className="bg-slate-900 text-white">
                      {m.monthName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Comparative Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1: Sales Delta */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 block">اختلاف مبلغ فروش کل:</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black font-mono text-white">
                  {deltaSales >= 0 ? `+${formatToman(deltaSales)}` : formatToman(deltaSales)}
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-0.5 ${
                  deltaSales >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {deltaSales >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{deltaSalesPercent}%</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-700/60 pt-2 font-mono">
                <span>{baseMonthData?.monthName}: {formatToman(baseMonthData?.totalSales || 0)}</span>
                <span>{compareMonthData?.monthName}: {formatToman(compareMonthData?.totalSales || 0)}</span>
              </div>
            </div>

            {/* Metric 2: Cartons Delta */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 block">تغییر در حجم کارتن توزیع شده:</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black font-mono text-white">
                  {deltaCartons >= 0 ? `+${deltaCartons.toLocaleString('fa-IR')}` : deltaCartons.toLocaleString('fa-IR')} کارتن
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-0.5 ${
                  deltaCartons >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {deltaCartons >= 0 ? 'رشد فیزیکی' : 'کاهش حجم'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-700/60 pt-2 font-mono">
                <span>پایه: {baseMonthData?.cartonsSold || 0} کارتن</span>
                <span>مقایسه: {compareMonthData?.cartonsSold || 0} کارتن</span>
              </div>
            </div>

            {/* Metric 3: Invoices Delta */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 block">تعداد فاکتورهای صادر شده:</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black font-mono text-white">
                  {deltaInvoices >= 0 ? `+${deltaInvoices}` : deltaInvoices} فاکتور
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-indigo-500/20 text-indigo-400">
                  {compareMonthData?.invoiceCount || 0} فاکتور کل
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-700/60 pt-2 font-mono">
                <span>پایه: {baseMonthData?.invoiceCount || 0}</span>
                <span>مقایسه: {compareMonthData?.invoiceCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Monthly Comparison Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <span>جدول جامع مقایسه آماری ماه‌های سال</span>
            </h3>
            <span className="text-xs text-slate-500">
              {monthlyData.length} دوره مالی ثبت شده
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-right text-xs min-w-[850px]">
              <thead className="bg-slate-100/80 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-3.5">ماه / دوره مالی</th>
                  <th className="p-3.5">مبلغ کل فروش (تومان)</th>
                  <th className="p-3.5">نرخ رشد (MoM)</th>
                  <th className="p-3.5 text-center">کارتن</th>
                  <th className="p-3.5 text-center">باکس</th>
                  <th className="p-3.5 text-center">پاکت</th>
                  <th className="p-3.5">کارتخوان POS</th>
                  <th className="p-3.5">اسکناس نقد</th>
                  <th className="p-3.5">نسیه دفتری</th>
                  <th className="p-3.5">سود ناخالص</th>
                  <th className="p-3.5">تعداد فاکتور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyData.map((rec) => (
                  <tr key={rec.monthKey} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>{rec.monthName}</span>
                    </td>
                    <td className="p-3.5 font-mono font-black text-indigo-950">
                      {formatToman(rec.totalSales)}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black inline-flex items-center gap-0.5 ${
                        (rec.growthRatePercent || 0) >= 0 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {(rec.growthRatePercent || 0) >= 0 ? '+' : ''}{rec.growthRatePercent}%
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-center text-slate-800">
                      {rec.cartonsSold.toLocaleString('fa-IR')}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-center text-slate-700">
                      {(rec.boxesSold || 0).toLocaleString('fa-IR')}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-center text-slate-600">
                      {(rec.packsSold || 0).toLocaleString('fa-IR')}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {formatToman(rec.posTerminalSales)}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {formatToman(rec.cashSales)}
                    </td>
                    <td className="p-3.5 font-mono text-rose-600 font-bold">
                      {formatToman(rec.ledgerSales)}
                    </td>
                    <td className="p-3.5 font-mono font-black text-emerald-700">
                      {formatToman(rec.totalProfit)}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      {rec.invoiceCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
