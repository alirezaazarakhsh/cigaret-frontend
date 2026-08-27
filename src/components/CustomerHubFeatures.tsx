import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Wallet, 
  QrCode, 
  RefreshCw, 
  Bell, 
  BellRing, 
  Truck, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Clock, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ShoppingBag, 
  Download, 
  Copy, 
  Plus, 
  BadgePercent, 
  UserCheck, 
  Receipt, 
  Send, 
  Smartphone, 
  Calendar,
  X,
  ChevronLeft,
  DollarSign,
  PackageCheck,
  Check
} from 'lucide-react';
import { UserProfile, OrderInvoice, PosCustomer, PosLedgerTransaction, CigaretteProduct, CartItem } from '../types';
import { formatToman, formatNumberFa } from '../utils/formatters';

// =========================================================================
// 1. CUSTOMER FINANCIAL OVERVIEW & LEDGER COMPONENT (داشبورد مالی و نسیه مغازه‌دار)
// =========================================================================
interface CustomerFinancialHubProps {
  currentUser: UserProfile;
  orders: OrderInvoice[];
  onOpenSettleModal: () => void;
  onOpenDigitalCard: () => void;
  onOpenPriceAlerts: () => void;
  showToast: (msg: string) => void;
}

export const CustomerFinancialHub: React.FC<CustomerFinancialHubProps> = ({
  currentUser,
  orders,
  onOpenSettleModal,
  onOpenDigitalCard,
  onOpenPriceAlerts,
  showToast,
}) => {
  // Try to find synchronized ledger data from POS storage
  const [posCustomerData, setPosCustomerData] = useState<PosCustomer | null>(null);
  const [ledgerTxs, setLedgerTxs] = useState<PosLedgerTransaction[]>([]);

  useEffect(() => {
    try {
      const storedCustomers = localStorage.getItem('sovin_pos_customers');
      const storedTxs = localStorage.getItem('sovin_pos_ledger_txs');
      
      let matchedCust: PosCustomer | null = null;
      if (storedCustomers) {
        const customers: PosCustomer[] = JSON.parse(storedCustomers);
        // Match by phone number or clean phone
        const cleanUserPhone = currentUser.phone.replace(/\s+/g, '').replace(/^(\+98|98|0)?/, '');
        matchedCust = customers.find(c => {
          const cleanCustPhone = c.phone.replace(/\s+/g, '').replace(/^(\+98|98|0)?/, '');
          return cleanCustPhone === cleanUserPhone || c.phone === currentUser.phone;
        }) || null;
      }

      if (!matchedCust) {
        // Fallback default ledger profile for this customer
        matchedCust = {
          id: `cust_${currentUser.id}`,
          name: currentUser.shopName || currentUser.fullName,
          phone: currentUser.phone,
          address: currentUser.address || 'تهران',
          city: currentUser.city || 'تهران',
          createdAt: currentUser.createdAt || '۱۴۰۳/۰۵/۰۱',
          balance: 3850000, // 3,850,000 Toman ledger debt
          notes: 'سقف اعتبار اختصاصی بنکداری: ۵۰ میلیون تومان'
        };
      }
      setPosCustomerData(matchedCust);

      if (storedTxs) {
        const txs: PosLedgerTransaction[] = JSON.parse(storedTxs);
        const filtered = txs.filter(t => t.customerId === matchedCust?.id);
        if (filtered.length > 0) {
          setLedgerTxs(filtered);
        } else {
          setLedgerTxs([
            { id: 'tx-1', customerId: matchedCust.id, date: '۱۴۰۳/۰۶/۰۲ ۱۰:۳۰', amount: 3850000, type: 'debit', description: 'ثبت فاکتور نسیه خرید کارتن وینستون و مارلبرو' },
            { id: 'tx-2', customerId: matchedCust.id, date: '۱۴۰۳/۰۵/۲۵ ۱۴:۰۰', amount: 5000000, type: 'credit', description: 'واریز آنلاین تسویه‌حساب پیشین - پایا' },
            { id: 'tx-3', customerId: matchedCust.id, date: '۱۴۰۳/۰۵/۲۲ ۰۹:۱۵', amount: 5000000, type: 'debit', description: 'خرید دفتری ۱۰ باکس سیگار تیریا' }
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const balance = posCustomerData ? posCustomerData.balance : 0;
  const isDebtor = balance > 0;
  const isCreditor = balance < 0;

  const totalSpent = orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0) + 18500000;
  const totalCartonsBought = orders.reduce((sum, o) => sum + (o.totalCartons || 0), 0) + 14;
  const customerClubPoints = Math.floor(totalSpent / 500000) * 10 + 250; // points

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 4 Super Practical KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: مانده بدهی / وضعیت حساب دفتری */}
        <div className={`border rounded-3xl p-5 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
          isDebtor 
            ? 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border-amber-200' 
            : isCreditor 
            ? 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border-emerald-200' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-600 flex items-center gap-1.5">
              <Wallet className={`w-4 h-4 ${isDebtor ? 'text-amber-600' : 'text-emerald-600'}`} />
              مانده حساب دفتری (نسیه)
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
              isDebtor 
                ? 'bg-amber-100/80 text-amber-800 border-amber-300' 
                : isCreditor 
                ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300' 
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {isDebtor ? 'بدهکار به بنکداری' : isCreditor ? 'بستانکار (طلبکار)' : 'تسویه کامل'}
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatToman(Math.abs(balance))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isDebtor 
                ? 'موعد تسویه توافقی: پایان ماه جاری' 
                : 'حساب شما با بنکداری کاملاً به‌روز و مثبت است.'}
            </p>
          </div>

          {isDebtor && (
            <button
              onClick={onOpenSettleModal}
              className="mt-3 w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>تسویه آنلاین بدهی</span>
            </button>
          )}
        </div>

        {/* Card 2: سقف اعتبار خرید ماهانه */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              سقف اعتبار خرید دفتری
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              اعتبار VIP
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-blue-700 font-mono tracking-tight">
              ۵۰,۰۰۰,۰۰۰ <span className="text-xs font-bold text-slate-500">تومان</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              امکان سفارش نسیه تا سقف ۵۰ میلیون بدون نیاز به پیش‌پرداخت
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.round((balance / 50000000) * 100))}%` }}
            />
          </div>
        </div>

        {/* Card 3: مجموع سفارشات و تیراژ خرید */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-600 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              تیراژ خرید ثبت‌شده
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {formatNumberFa(orders.length + 3)} فاکتور
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatNumberFa(totalCartonsBought)} <span className="text-xs font-bold text-slate-500">کارتن کل</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              گردش حساب کل: <strong className="font-mono text-slate-700">{formatToman(totalSpent)}</strong>
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>مشتری فعال رده A بنکداری</span>
          </div>
        </div>

        {/* Card 4: امتیاز باشگاه و کارت هوشمند */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-3xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              کارت هوشمند و امتیاز
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {formatNumberFa(customerClubPoints)} امتیاز
            </span>
          </div>

          <div className="my-2">
            <div className="text-base font-black text-white truncate">
              {currentUser.shopName || currentUser.fullName}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              معادل <strong className="text-amber-300 font-mono">{formatToman(customerClubPoints * 1000)}</strong> تخفیف مستقیم نقدی
            </p>
          </div>

          <button
            onClick={onOpenDigitalCard}
            className="mt-3 w-full py-2 px-3 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white border border-white/20 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-300" />
            <span>مشاهده کارت VIP و بارکد</span>
          </button>
        </div>

      </div>

      {/* Quick Action Tools Bar for Customer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            امکانات سریع ویژه مغازه‌دار:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenPriceAlerts}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <BellRing className="w-3.5 h-3.5 text-blue-600" />
            <span>گوش‌به‌زنگ قیمت سیگارها</span>
          </button>

          <button
            onClick={onOpenDigitalCard}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>بارکد اسکن پای صندوق</span>
          </button>

          {isDebtor && (
            <button
              onClick={onOpenSettleModal}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>تسویه بدهی ({formatToman(balance)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Transaction & Debt Ledger Statement History Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              ریز گردش حساب دفتری و تاریخچه تسویه‌حساب‌ها
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              همگام‌سازی لحظه‌ای با سیستم حسابداری و صندوق‌های انبار مرکزی
            </p>
          </div>
          
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto">
            تعداد ردیف: {formatNumberFa(ledgerTxs.length)} تراکنش
          </span>
        </div>

        {ledgerTxs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            گردش حسابی برای این شماره ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50">
                  <th className="py-3 px-3">ردیف</th>
                  <th className="py-3 px-3">تاریخ و ساعت</th>
                  <th className="py-3 px-3">شرح عملیات</th>
                  <th className="py-3 px-3">نوع تراکنش</th>
                  <th className="py-3 px-3 text-left">مبلغ تراکنش</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerTxs.map((tx, idx) => {
                  const isPayment = tx.type === 'credit';
                  return (
                    <tr key={tx.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-slate-400">{formatNumberFa(idx + 1)}</td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">{tx.date}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-900">{tx.description}</td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-md border ${
                          isPayment 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isPayment ? (
                            <>
                              <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                              واریز / تسویه (کاهش بدهی)
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-amber-600" />
                              خرید نسیه (افزایش بدهی)
                            </>
                          )}
                        </span>
                      </td>
                      <td className={`py-3.5 px-3 text-left font-mono font-black ${
                        isPayment ? 'text-emerald-600' : 'text-amber-700'
                      }`}>
                        {isPayment ? '- ' : '+ '}
                        {formatToman(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};


// =========================================================================
// 2. ONLINE DEBT SETTLEMENT MODAL (مودال تسویه آنلاین بدهی و صدور رسید)
// =========================================================================
interface CustomerOnlineSettleModalProps {
  currentUser: UserProfile;
  initialAmount: number;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  showToast: (msg: string) => void;
}

export const CustomerOnlineSettleModal: React.FC<CustomerOnlineSettleModalProps> = ({
  currentUser,
  initialAmount,
  onClose,
  onSuccess,
  showToast,
}) => {
  const [payAmount, setPayAmount] = useState<number>(initialAmount || 3850000);
  const [payMethod, setPayMethod] = useState<'gateway' | 'card_transfer'>('gateway');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [settleDone, setSettleDone] = useState(false);
  const [receiptRefCode, setReceiptRefCode] = useState('');

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      showToast('لطفاً مبلغ معتبری جهت تسویه وارد فرمایید.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const generatedRef = `SETTLE-${Math.floor(100000 + Math.random() * 900000)}`;
      setReceiptRefCode(generatedRef);
      setSettleDone(true);

      // Record transaction in localStorage
      try {
        const storedTxs = localStorage.getItem('sovin_pos_ledger_txs');
        const txs: PosLedgerTransaction[] = storedTxs ? JSON.parse(storedTxs) : [];
        const newTx: PosLedgerTransaction = {
          id: `tx_${Date.now()}`,
          customerId: `cust_${currentUser.id}`,
          date: `${new Date().toLocaleDateString('fa-IR')} ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
          amount: payAmount,
          type: 'credit',
          description: `تسویه آنلاین توسط مغازه‌دار (${payMethod === 'gateway' ? 'درگاه شاپرک' : 'کارت‌به‌کارت'}) - کد پیگیری: ${generatedRef}`
        };
        localStorage.setItem('sovin_pos_ledger_txs', JSON.stringify([newTx, ...txs]));

        // Update customer balance in sovin_pos_customers
        const storedCusts = localStorage.getItem('sovin_pos_customers');
        if (storedCusts) {
          const custs: PosCustomer[] = JSON.parse(storedCusts);
          const updated = custs.map(c => {
            if (c.phone === currentUser.phone || c.id === `cust_${currentUser.id}`) {
              return { ...c, balance: Math.max(0, (c.balance || 0) - payAmount) };
            }
            return c;
          });
          localStorage.setItem('sovin_pos_customers', JSON.stringify(updated));
        }
      } catch (err) {
        console.error(err);
      }

      onSuccess(payAmount);
      showToast(`مبلغ ${formatToman(payAmount)} با موفقیت تسویه گردید.`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm sm:text-base">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span>تسویه آنلاین بدهی حساب دفتری</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!settleDone ? (
          <form onSubmit={handleSettleSubmit} className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">تسویه مستقیم با انبار و حسابداری مرکزی سوین</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  پس از پرداخت، بلافاصله سند تسویه در دیتابیس ثبت و مانده بدهی شما کسر می‌گردد.
                </p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayMethod('gateway')}
                className={`py-3 px-3 rounded-2xl border text-center font-black transition-all ${
                  payMethod === 'gateway'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                درگاه شتاب آنلاین (آنی)
              </button>

              <button
                type="button"
                onClick={() => setPayMethod('card_transfer')}
                className={`py-3 px-3 rounded-2xl border text-center font-black transition-all ${
                  payMethod === 'card_transfer'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Receipt className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                کارت‌به‌کارت و ثبت فیش
              </button>
            </div>

            {payMethod === 'card_transfer' && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2">
                <span className="text-[10px] text-slate-400 block">شماره کارت بنکداری جهت واریز:</span>
                <div className="text-base font-mono font-black text-amber-300 tracking-widest" dir="ltr">
                  ۶۰۳۷ - ۹۹۷۹ - ۷۵۳۱ - ۱۹۸۲
                </div>
                <div className="text-[11px] text-slate-300 flex justify-between">
                  <span>صاحب حساب: شرکت توزیع دخانیات سوین</span>
                  <span>بانک ملی ایران</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">مبلغ تسویه (تومان):</label>
              <input
                type="number"
                dir="ltr"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-base font-black font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPayAmount(initialAmount)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold"
                >
                  تسویه کل بدهی ({formatToman(initialAmount)})
                </button>
                <button
                  type="button"
                  onClick={() => setPayAmount(Math.round(initialAmount / 2))}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold"
                >
                  تسویه ۵۰٪ ({formatToman(Math.round(initialAmount / 2))})
                </button>
              </div>
            </div>

            {payMethod === 'card_transfer' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">شماره پیگیری فیش / ۴ رقم آخر کارت:</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: 98124501"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال اتصال به شاپرک و ثبت تسویه...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>پرداخت و تسویه آنی مبلغ {formatToman(payAmount)}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-lg font-black text-slate-900">تسویه‌حساب با موفقیت انجام شد</h3>
            <p className="text-xs text-slate-600">
              مبلغ <strong className="font-mono text-emerald-600">{formatToman(payAmount)}</strong> از مانده حساب نسیه کسر گردید.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">کد رهگیری شاپرک:</span>
                <span className="font-black text-blue-700">{receiptRefCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">طرف حساب:</span>
                <span className="font-sans font-bold text-slate-800">{currentUser.shopName || currentUser.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">زمان ثبت سند:</span>
                <span>{new Date().toLocaleDateString('fa-IR')}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-md transition-all"
            >
              بستن و مشاهده صورت‌حساب جدید
            </button>
          </div>
        )}

      </div>
    </div>
  );
};


// =========================================================================
// 3. DIGITAL VIP CUSTOMER PASS & QR CODE MODAL (کارت دیجیتال مغازه‌دار)
// =========================================================================
interface CustomerDigitalPassModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const CustomerDigitalPassModal: React.FC<CustomerDigitalPassModalProps> = ({
  currentUser,
  onClose,
  showToast,
}) => {
  const customerIdNumber = currentUser.phone.replace(/\D/g, '').slice(-8) || '98124012';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <span>کارت دیجیتال شناسایی پای صندوق</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Physical-style Metallic VIP Card */}
        <div className="relative rounded-3xl p-6 text-white overflow-hidden shadow-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border border-slate-700/80 space-y-4">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-sm">
                SV
              </div>
              <div>
                <span className="text-xs font-black text-white block">سامانه پخش سوین</span>
                <span className="text-[9px] text-slate-400">شبکه توزیع دخانیات</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-black text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
              VIP MEMBER
            </span>
          </div>

          {/* Customer Name & Shop */}
          <div className="space-y-1 relative z-10 pt-2">
            <span className="text-[10px] text-slate-400 block">نام فروشگاه و مشتری:</span>
            <div className="text-base font-black text-white tracking-wide truncate">
              {currentUser.shopName || currentUser.fullName}
            </div>
            <div className="text-xs text-indigo-200 flex items-center gap-2">
              <span>{currentUser.fullName}</span>
              <span className="text-slate-500">|</span>
              <span className="font-mono">{currentUser.phone}</span>
            </div>
          </div>

          {/* Simulated Barcode for Scanner */}
          <div className="bg-white rounded-2xl p-4 text-center text-slate-900 shadow-inner relative z-10">
            <div className="flex justify-center items-center gap-1.5 h-12 px-2 overflow-hidden">
              {/* Simulated barcode lines */}
              {[4, 2, 6, 2, 8, 3, 2, 5, 2, 4, 7, 2, 5, 3, 6, 2, 4, 3, 8, 2, 5, 4, 2, 6].map((w, i) => (
                <div 
                  key={i} 
                  className="bg-slate-900 h-full rounded-xs" 
                  style={{ width: `${w * 1.5}px` }} 
                />
              ))}
            </div>
            <div className="font-mono text-xs font-black tracking-widest text-slate-800 mt-1.5" dir="ltr">
              SVN-CUST-{customerIdNumber}
            </div>
          </div>

          {/* Card Footer Info */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 relative z-10">
            <span>شهر: {currentUser.city || 'تهران'}</span>
            <span>اعتبار: نامحدود بنکداری</span>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed text-center">
          📱 هنگام مراجعه حضوری به انبار یا سرای دخانیات، این بارکد را مقابل بارکدخوان صندوق بگیرید تا تخفیف‌های ویژه تیراژی فوراً اعمال گردد.
        </div>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(`SVN-CUST-${customerIdNumber}`);
            showToast('کد اختصاصی مشتری در حافظه کپی شد.');
          }}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4 text-indigo-600" />
          <span>کپی کد شناسه مشتری (SVN-CUST-{customerIdNumber})</span>
        </button>

      </div>
    </div>
  );
};


// =========================================================================
// 4. SMART PRICE & STOCK ALERT MANAGER (گوش‌به‌زنگ قیمت و موجودی انبار)
// =========================================================================
interface CustomerPriceAlertsModalProps {
  products: CigaretteProduct[];
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const CustomerPriceAlertsModal: React.FC<CustomerPriceAlertsModalProps> = ({
  products,
  onClose,
  showToast,
}) => {
  const [activeAlerts, setActiveAlerts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_customer_price_alerts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['winston-compact-blue', 'marlboro-gold-ch', 'terea-amber'];
  });

  const toggleAlert = (productId: string) => {
    let updated: string[];
    if (activeAlerts.includes(productId)) {
      updated = activeAlerts.filter(id => id !== productId);
      showToast('گوش‌به‌زنگ این محصول غیرفعال شد.');
    } else {
      updated = [...activeAlerts, productId];
      showToast('گوش‌به‌زنگ کاهش قیمت و ورود بار جدید فعال گردید.');
    }
    setActiveAlerts(updated);
    localStorage.setItem('sovin_customer_price_alerts', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm sm:text-base">
            <BellRing className="w-5 h-5 text-blue-600" />
            <span>گوش‌به‌زنگ‌های هوشمند قیمت و موجودی انبار</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 shrink-0">
          🔔 با فعال‌سازی زنگوله برای هر سیگار، به محض <strong>کاهش نرخ کارتن</strong> در انبار مرکزی یا <strong>شارژ بار جدید</strong>، پیامک اعلان برای شما ارسال می‌گردد.
        </div>

        {/* Product Alerts List */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {products.slice(0, 12).map((product) => {
            const isAlerted = activeAlerts.includes(product.id);
            return (
              <div
                key={product.id}
                className={`border rounded-2xl p-3.5 transition-all flex items-center justify-between gap-3 ${
                  isAlerted 
                    ? 'bg-blue-50/50 border-blue-300 shadow-2xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.image}
                    alt={product.nameFa}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">
                      {product.nameFa}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>نرخ کارتن: <strong className="font-mono text-blue-700">{formatToman(product.cartonPrice)}</strong></span>
                      <span>|</span>
                      <span>موجودی: {formatNumberFa(product.stockCartons)} کارتن</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAlert(product.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
                    isAlerted
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isAlerted ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>فعال</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <span>اطلاع بده</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-md transition-all shrink-0"
        >
          ذخیره تنظیمات گوش‌به‌زنگ
        </button>

      </div>
    </div>
  );
};
