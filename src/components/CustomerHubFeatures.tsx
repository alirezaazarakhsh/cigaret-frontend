import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Wallet, 
  QrCode, 
  RefreshCw, 
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
  Receipt, 
  Send, 
  Calendar,
  X,
  ChevronLeft,
  DollarSign,
  PackageCheck,
  Check,
  Upload,
  Coins,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  UserProfile, 
  OrderInvoice, 
  PosCustomer, 
  PosLedgerTransaction, 
  CigaretteProduct, 
  BankDepositSlip,
  WalletTransaction 
} from '../types';
import { formatToman, formatNumberFa } from '../utils/formatters';
import { getCustomerTier } from '../utils/customerTierCards';

// =========================================================================
// 1. CUSTOMER FINANCIAL OVERVIEW & LEDGER COMPONENT (داشبورد مالی و نسیه مغازه‌دار)
// =========================================================================
interface CustomerFinancialHubProps {
  currentUser: UserProfile;
  orders: OrderInvoice[];
  onOpenSettleModal: (initialPurpose?: 'settle_debt' | 'charge_wallet') => void;
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
  const [posCustomerData, setPosCustomerData] = useState<PosCustomer | null>(null);
  const [ledgerTxs, setLedgerTxs] = useState<PosLedgerTransaction[]>([]);
  const [submittedSlips, setSubmittedSlips] = useState<BankDepositSlip[]>([]);
  const [activeLedgerTab, setActiveLedgerTab] = useState<'ledger' | 'slips' | 'wallet'>('ledger');

  const customerTier = getCustomerTier(posCustomerData?.tierId || currentUser.tierId);

  useEffect(() => {
    try {
      const storedCustomers = localStorage.getItem('sovin_pos_customers');
      const storedTxs = localStorage.getItem('sovin_pos_ledger_txs');
      const storedSlips = localStorage.getItem('sovin_bank_deposit_slips');
      
      let matchedCust: PosCustomer | null = null;
      if (storedCustomers) {
        const customers: PosCustomer[] = JSON.parse(storedCustomers);
        const cleanUserPhone = currentUser.phone.replace(/\s+/g, '').replace(/^(\+98|98|0)?/, '');
        matchedCust = customers.find(c => {
          const cleanCustPhone = c.phone.replace(/\s+/g, '').replace(/^(\+98|98|0)?/, '');
          return cleanCustPhone === cleanUserPhone || c.phone === currentUser.phone;
        }) || null;
      }

      if (!matchedCust) {
        matchedCust = {
          id: `cust_${currentUser.id}`,
          name: currentUser.shopName || currentUser.fullName,
          phone: currentUser.phone,
          address: currentUser.address || 'تهران',
          city: currentUser.city || 'تهران',
          createdAt: currentUser.createdAt || '۱۴۰۳/۰۵/۰۱',
          balance: 3850000, // 3,850,000 Toman ledger debt
          notes: 'سقف اعتبار اختصاصی بنکداری: ۵۰ میلیون تومان',
          tierId: currentUser.tierId || 'gold',
          creditLimit: currentUser.creditLimit || 50000000,
          walletBalance: currentUser.walletBalance || 1250000
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
            { id: 'tx-2', customerId: matchedCust.id, date: '۱۴۰۳/۰۵/۲۵ ۱۴:۰۰', amount: 5000000, type: 'credit', description: 'ثبت و تایید فیش واریز بانکی پایا - شماره پیگیری 982145' },
            { id: 'tx-3', customerId: matchedCust.id, date: '۱۴۰۳/۰۵/۲۲ ۰۹:۱۵', amount: 5000000, type: 'debit', description: 'خرید دفتری ۱۰ باکس سیگار تیریا' }
          ]);
        }
      }

      if (storedSlips) {
        const slips: BankDepositSlip[] = JSON.parse(storedSlips);
        const userSlips = slips.filter(s => s.customerPhone === currentUser.phone || s.customerId === matchedCust?.id);
        if (userSlips.length > 0) {
          setSubmittedSlips(userSlips);
        } else {
          setSubmittedSlips([
            {
              id: 'slip-demo-1',
              customerId: matchedCust.id,
              customerName: currentUser.shopName || currentUser.fullName,
              customerPhone: currentUser.phone,
              purpose: 'settle_debt',
              amount: 5000000,
              trackingNumber: '982145012',
              bankOrigin: 'بانک ملت',
              senderCardLast4: '4192',
              depositDate: '۱۴۰۳/۰۵/۲۵',
              depositTime: '۱۳:۴۵',
              status: 'approved',
              notes: 'واریز از طریق همراه بانک ملت جهت تسویه فاکتور تیریا',
              createdAt: '۱۴۰۳/۰۵/۲۵ - ۱۴:۰۰',
              reviewedBy: 'حسابداری مرکزی انبار جنت‌آباد'
            }
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

  const creditLimit = posCustomerData?.creditLimit || currentUser.creditLimit || customerTier.defaultCreditLimit;
  const walletBalance = posCustomerData?.walletBalance !== undefined ? posCustomerData.walletBalance : (currentUser.walletBalance || 1250000);
  const remainingCredit = Math.max(0, creditLimit - Math.max(0, balance));
  const creditUsagePercent = Math.min(100, Math.round((Math.max(0, balance) / creditLimit) * 100));

  const totalSpent = orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0) + 18500000;
  const totalCartonsBought = orders.reduce((sum, o) => sum + (o.totalCartons || 0), 0) + 14;
  const customerClubPoints = Math.floor(totalSpent / 500000) * 10 + 250;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 4 Super Practical KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: مانده بدهی / وضعیت حساب دفتری */}
        <div className={`border rounded-3xl p-5 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
          isDebtor 
            ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-200' 
            : isCreditor 
            ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 border-emerald-200' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Receipt className={`w-4 h-4 ${isDebtor ? 'text-amber-600' : 'text-emerald-600'}`} />
              مانده حساب دفتری (نسیه)
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
              isDebtor 
                ? 'bg-amber-100/90 text-amber-800 border-amber-300' 
                : isCreditor 
                ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300' 
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {isDebtor ? 'بدهکار به بنکداری' : isCreditor ? 'بستانکار' : 'تسویه کامل'}
            </span>
          </div>

          <div className="my-1.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatToman(Math.abs(balance))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isDebtor 
                ? 'تسویه تنها با ثبت و تایید فیش واریز بانکی / پایا' 
                : 'حساب شما با بنکداری کاملاً تسویه و به‌روز است.'}
            </p>
          </div>

          {isDebtor ? (
            <button
              onClick={() => onOpenSettleModal('settle_debt')}
              className="mt-3 w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ثبت فیش واریزی جهت تسویه</span>
            </button>
          ) : (
            <div className="mt-3 py-1.5 px-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] font-bold text-emerald-700 text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>وضعیت مالی کاملاً سبز و مجاز</span>
            </div>
          )}
        </div>

        {/* Card 2: کیف پول الکترونیکی مشتری */}
        <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 border border-emerald-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" />
              کیف پول الکترونیکی
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              شارژ نقدی
            </span>
          </div>

          <div className="my-1.5">
            <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              {formatToman(walletBalance)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              قابل استفاده در پرداخت آنی فاکتورها و تحویل حضوری
            </p>
          </div>

          <button
            onClick={() => onOpenSettleModal('charge_wallet')}
            className="mt-3 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>شارژ کیف پول با فیش بانکی</span>
          </button>
        </div>

        {/* Card 3: سقف اعتبار خرید ماهانه تعیین شده از دیتابیس */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              سقف اعتبار خرید دفتری
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              تایید مدیریت
            </span>
          </div>

          <div className="my-1.5">
            <div className="text-2xl font-black text-blue-700 font-mono tracking-tight">
              {formatToman(creditLimit)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>باقیمانده اعتبار:</span>
              <strong className="font-mono text-slate-800">{formatToman(remainingCredit)}</strong>
            </div>
          </div>

          <div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  creditUsagePercent > 85 ? 'bg-rose-500' : creditUsagePercent > 60 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${creditUsagePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>مصرف: {creditUsagePercent}٪</span>
              <span>تعیین‌شده در دیتابیس</span>
            </div>
          </div>
        </div>

        {/* Card 4: کارت هوشمند و امتیاز رتبه مشتری */}
        <div className={`bg-gradient-to-br ${customerTier.cardGradient} text-white rounded-3xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden border ${customerTier.cardBorder}`}>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className={`text-xs font-black flex items-center gap-1.5 ${customerTier.textColor}`}>
              <Sparkles className="w-4 h-4 text-amber-400" />
              {customerTier.cardTitle}
            </span>
            <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${customerTier.badgeBg} ${customerTier.badgeText}`}>
              {customerTier.badgeTitle}
            </span>
          </div>

          <div className="my-1.5 relative z-10">
            <div className="text-base font-black text-white truncate">
              {currentUser.shopName || currentUser.fullName}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
              <span>تخفیف تیراژ:</span>
              <strong className="text-amber-300 font-black">{customerTier.discountRate}٪ مازاد</strong>
            </p>
          </div>

          <button
            onClick={onOpenDigitalCard}
            className="mt-3 w-full py-2 px-3 bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white border border-white/20 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 relative z-10"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span>مشاهده کارت VIP و بارکد پای باجه</span>
          </button>
        </div>

      </div>

      {/* Quick Action Tools Bar for Customer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            عملیات مالی و تسویه‌حساب:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenSettleModal('settle_debt')}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>ثبت فیش واریز نسیه</span>
          </button>

          <button
            onClick={() => onOpenSettleModal('charge_wallet')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>شارژ کیف پول</span>
          </button>

          <button
            onClick={onOpenDigitalCard}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>بارکد اسکن پای صندوق</span>
          </button>

          <button
            onClick={onOpenPriceAlerts}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <BellRing className="w-3.5 h-3.5 text-blue-600" />
            <span>گوش‌به‌زنگ قیمت‌ها</span>
          </button>
        </div>
      </div>

      {/* Tabs for Statements: 1) Ledger Txs, 2) Bank Deposit Slips */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 flex-wrap">
          <button
            onClick={() => setActiveLedgerTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeLedgerTab === 'ledger'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>ریز حساب دفتری و نسیه ({formatNumberFa(ledgerTxs.length)})</span>
          </button>

          <button
            onClick={() => setActiveLedgerTab('slips')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeLedgerTab === 'slips'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>فیش‌های بانکی ارسال‌شده ({formatNumberFa(submittedSlips.length)})</span>
          </button>
        </div>

        {/* TAB 1: LEDGER TRANSACTIONS */}
        {activeLedgerTab === 'ledger' && (
          <div>
            {ledgerTxs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                گردش حسابی برای این شماره در دیتابیس ثبت نشده است.
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
                                  واریز / فیش بانکی (کاهش بدهی)
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
        )}

        {/* TAB 2: BANK DEPOSIT SLIPS */}
        {activeLedgerTab === 'slips' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-amber-50/80 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900">
              <span className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                فیش‌های ثبت‌شده پس از بررسی حسابداری انبار در مانده حساب اعمال می‌گردند.
              </span>
              <button
                onClick={() => onOpenSettleModal('settle_debt')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-[11px]"
              >
                + ثبت فیش جدید
              </button>
            </div>

            {submittedSlips.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                هنوز فیش واریز بانکی ثبت نکرده‌اید.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50">
                      <th className="py-3 px-3">کد پیگیری</th>
                      <th className="py-3 px-3">هدف واریز</th>
                      <th className="py-3 px-3">مبلغ (تومان)</th>
                      <th className="py-3 px-3">بانک مبدا / کارت</th>
                      <th className="py-3 px-3">تاریخ و ساعت</th>
                      <th className="py-3 px-3">وضعیت تایید</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submittedSlips.map((slip) => (
                      <tr key={slip.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-blue-700">{slip.trackingNumber}</td>
                        <td className="py-3.5 px-3">
                          {slip.purpose === 'settle_debt' ? (
                            <span className="text-amber-800 font-bold">تسویه حساب دفتری</span>
                          ) : (
                            <span className="text-emerald-700 font-bold">شارژ کیف پول</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-black text-slate-900">{formatToman(slip.amount)}</td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {slip.bankOrigin || 'حواله بانکی'} {slip.senderCardLast4 ? `(کارت: ${slip.senderCardLast4})` : ''}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{slip.depositDate} {slip.depositTime || ''}</td>
                        <td className="py-3.5 px-3">
                          {slip.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              تایید و اعمال شد
                            </span>
                          ) : slip.status === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" />
                              رد شده ({slip.rejectionReason || 'عدم تطابق'})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              در انتظار تایید حسابداری
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};


// =========================================================================
// 2. BANK DEPOSIT SLIP SUBMISSION MODAL (ثبت فیش واریزی بانکی / حواله پایا و ساتنا)
// =========================================================================
interface CustomerBankDepositSlipModalProps {
  currentUser: UserProfile;
  initialPurpose?: 'settle_debt' | 'charge_wallet';
  initialAmount?: number;
  onClose: () => void;
  onSuccess: (slip: BankDepositSlip) => void;
  showToast: (msg: string) => void;
}

export const CustomerBankDepositSlipModal: React.FC<CustomerBankDepositSlipModalProps> = ({
  currentUser,
  initialPurpose = 'settle_debt',
  initialAmount = 3850000,
  onClose,
  onSuccess,
  showToast,
}) => {
  const [purpose, setPurpose] = useState<'settle_debt' | 'charge_wallet'>(initialPurpose);
  const [amount, setAmount] = useState<number>(initialAmount || 3850000);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [bankOrigin, setBankOrigin] = useState('بانک ملت');
  const [senderCardLast4, setSenderCardLast4] = useState('');
  const [depositDate, setDepositDate] = useState(() => new Date().toLocaleDateString('fa-IR'));
  const [depositTime, setDepositTime] = useState(() => new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
  const [slipImageName, setSlipImageName] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [createdSlip, setCreatedSlip] = useState<BankDepositSlip | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipImageName(file.name);
      showToast(`تصویر فیش «${file.name}» پیوست گردید.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      showToast('لطفاً مبلغ واریزی معتبری وارد فرمایید.');
      return;
    }
    if (!trackingNumber.trim()) {
      showToast('لطفاً شماره پیگیری یا شماره ارجاع فیش واریزی را وارد فرمایید.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newSlip: BankDepositSlip = {
        id: `slip-${Date.now()}`,
        customerId: `cust_${currentUser.id}`,
        customerName: currentUser.shopName || currentUser.fullName,
        customerPhone: currentUser.phone,
        purpose: purpose,
        amount: amount,
        trackingNumber: trackingNumber.trim(),
        bankOrigin: bankOrigin,
        senderCardLast4: senderCardLast4.trim() || undefined,
        depositDate: depositDate,
        depositTime: depositTime,
        slipImage: slipImageName || undefined,
        status: 'pending',
        notes: notes.trim() || undefined,
        createdAt: `${new Date().toLocaleDateString('fa-IR')} - ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`
      };

      try {
        const stored = localStorage.getItem('sovin_bank_deposit_slips');
        const list: BankDepositSlip[] = stored ? JSON.parse(stored) : [];
        localStorage.setItem('sovin_bank_deposit_slips', JSON.stringify([newSlip, ...list]));
      } catch (err) {
        console.error(err);
      }

      setCreatedSlip(newSlip);
      setIsDone(true);
      onSuccess(newSlip);
      showToast('فیش واریزی با موفقیت ثبت و جهت بررسی حسابداری انبار ارسال گردید.');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-scrollbar bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto modal-overscroll-contain">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm sm:text-base">
            <Receipt className="w-5 h-5 text-amber-600" />
            <span>ثبت فیش واریز بانکی و حواله پایا / ساتنا</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isDone ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Purpose Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPurpose('settle_debt')}
                className={`py-2.5 px-3 rounded-2xl border text-center font-black transition-all ${
                  purpose === 'settle_debt'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Receipt className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                تسویه بدهی حساب دفتری
              </button>

              <button
                type="button"
                onClick={() => setPurpose('charge_wallet')}
                className={`py-2.5 px-3 rounded-2xl border text-center font-black transition-all ${
                  purpose === 'charge_wallet'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Wallet className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                شارژ کیف پول الکترونیکی
              </button>
            </div>

            {/* Official Sevin Bank Account Info */}
            <div className="bg-slate-950 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
              <div className="flex justify-between items-center text-[10px] text-amber-400 font-bold">
                <span>حساب رسمی واریز شرکت پخش دخانیات دخانیات سرو:</span>
                <span className="bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300">بانک ملی ایران</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">شماره کارت:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-300 text-sm tracking-wider" dir="ltr">۶۰۳۷ - ۹۹۷۹ - ۷۵۳۱ - ۱۹۸۲</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('6037997975311982');
                      showToast('شماره کارت دخانیات سرو کپی شد.');
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between px-1">
                <span>صاحب حساب: شرکت پخش سراسری دخانیات دخانیات سرو</span>
                <span>شبا: <span className="font-mono text-slate-300" dir="ltr">IR720170000000123456789012</span></span>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">مبلغ واریزی فیش (تومان):</label>
              <input
                type="number"
                dir="ltr"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-base font-black font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                placeholder="مثال: 5000000"
              />
            </div>

            {/* Tracking Number & Bank Origin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">شماره پیگیری / ارجاع فیش *:</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: 98451203"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">بانک مبدا واریز:</label>
                <select
                  value={bankOrigin}
                  onChange={(e) => setBankOrigin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-slate-900 font-bold focus:outline-hidden"
                >
                  <option value="بانک ملت">بانک ملت</option>
                  <option value="بانک ملی">بانک ملی</option>
                  <option value="بانک صادرات">بانک صادرات</option>
                  <option value="بانک تجارت">بانک تجارت</option>
                  <option value="بانک سپه">بانک سپه</option>
                  <option value="بانک پاسارگاد">بانک پاسارگاد</option>
                  <option value="بانک سامان">بانک سامان</option>
                  <option value="حواله پایا / ساتنا">حواله پایا / ساتنا</option>
                </select>
              </div>
            </div>

            {/* Sender Last 4 digits & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">۴ رقم آخر کارت واریزکننده:</label>
                <input
                  type="text"
                  maxLength={4}
                  dir="ltr"
                  placeholder="مثال: 4192"
                  value={senderCardLast4}
                  onChange={(e) => setSenderCardLast4(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">تاریخ واریز:</label>
                <input
                  type="text"
                  dir="ltr"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-slate-900 font-mono focus:outline-hidden"
                />
              </div>
            </div>

            {/* File Upload Attachment */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">بارگذاری تصویر فیش بانکی (اختیاری):</label>
              <label className="border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50/80 rounded-2xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-600">
                  {slipImageName ? `فایل انتخاب شده: ${slipImageName}` : 'جهت آپلود اسکرین‌شات یا تصویر فیش کلیک کنید'}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">فرمت‌های مجاز: JPG, PNG, PDF</span>
                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">توضیحات تکمیلی (اختیاری):</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلاً: واریز بابت سفارش ۲ کارتن وینستون و تسویه نسیه ماه پیش"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال ثبت فیش واریزی در سامانه...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ارسال فیش به واحد حسابداری ({formatToman(amount)})</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-lg font-black text-slate-900">فیش واریزی با موفقیت ثبت شد</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              سند واریز به مبلغ <strong className="font-mono text-emerald-600">{formatToman(createdSlip?.amount || amount)}</strong> جهت تأیید به واحد حسابداری انبار مرکزی ارسال شد.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">شماره پیگیری:</span>
                <span className="font-black text-blue-700">{createdSlip?.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">هدف ثبت:</span>
                <span className="font-sans font-bold text-slate-800">
                  {createdSlip?.purpose === 'settle_debt' ? 'تسویه بدهی نسیه' : 'شارژ کیف پول'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">وضعیت:</span>
                <span className="font-sans text-amber-700 font-black">در انتظار تایید حسابداری</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-md transition-all"
            >
              بستن و بازگشت به داشبورد
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// Export alias for backward compatibility (Bank Deposit Slip replaces online gateway)
export const CustomerOnlineSettleModal = CustomerBankDepositSlipModal;


// =========================================================================
// 3. DIGITAL VIP CUSTOMER PASS & QR CODE MODAL (کارت دیجیتال مغازه‌دار با رنگ رتبه)
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
  const tier = getCustomerTier(currentUser.tierId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-scrollbar bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto modal-overscroll-contain">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <span>کارت دیجیتال شناسایی پای صندوق انبار</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Physical-style Metallic VIP Card matching Customer Tier */}
        <div className={`relative rounded-3xl p-6 text-white overflow-hidden shadow-2xl bg-gradient-to-tr ${tier.cardGradient} border ${tier.cardBorder} space-y-4`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-sm">
                SV
              </div>
              <div>
                <span className="text-xs font-black text-white block">سامانه پخش دخانیات سرو</span>
                <span className="text-[9px] text-slate-300">شبکه توزیع دخانیات و انبار مرکزی</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${tier.badgeBg} ${tier.badgeText}`}>
              {tier.badgeTitle}
            </span>
          </div>

          {/* Customer Name & Shop */}
          <div className="space-y-1 relative z-10 pt-2">
            <span className="text-[10px] text-slate-300 block">نام فروشگاه و مشتری:</span>
            <div className="text-base font-black text-white tracking-wide truncate">
              {currentUser.shopName || currentUser.fullName}
            </div>
            <div className="text-xs text-amber-200 flex items-center gap-2">
              <span>{currentUser.fullName}</span>
              <span className="text-slate-400">|</span>
              <span className="font-mono">{currentUser.phone}</span>
            </div>
          </div>

          {/* Simulated Barcode for Scanner */}
          <div className="bg-white rounded-2xl p-4 text-center text-slate-900 shadow-inner relative z-10">
            <div className="flex justify-center items-center gap-1.5 h-12 px-2 overflow-hidden">
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
          <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 relative z-10">
            <span>رتبه: {tier.cardTitle}</span>
            <span>تخفیف مازاد: {tier.discountRate}٪</span>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed text-center">
          📱 هنگام مراجعه به باجه‌های تحویل انبار جنت‌آباد، این بارکد را به صندوق‌دار یا مسئول باجه نشان دهید تا نوبت و تخفیف شما آنی اعمال گردد.
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
    return ['winston-compact-blue', 'marlboro-gold-original', 'terea-silver-swiss'];
  });

  const toggleAlert = (prodId: string) => {
    let updated: string[];
    if (activeAlerts.includes(prodId)) {
      updated = activeAlerts.filter(id => id !== prodId);
      showToast('گوش‌به‌زنگ برای این کالا غیرفعال شد.');
    } else {
      updated = [...activeAlerts, prodId];
      showToast('گوش‌به‌زنگ برای این کالا فعال شد؛ کاهش قیمت با پیامک اطلاع‌رسانی می‌شود.');
    }
    setActiveAlerts(updated);
    try {
      localStorage.setItem('sovin_customer_price_alerts', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-scrollbar bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col my-auto modal-overscroll-contain">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
            <BellRing className="w-5 h-5 text-blue-600" />
            <span>گوش‌به‌زنگ کاهش نرخ و ورود بار تازه</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-900 shrink-0">
          💡 هر زمان نرخ دلار نوسان کند و قیمت کارتن این اقلام در انبار کاهش یابد، پیامک تخفیف فوری برای شما ارسال می‌گردد.
        </div>

        {/* Products List */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1 divide-y divide-slate-100">
          {products.slice(0, 15).map((p) => {
            const isAlertOn = activeAlerts.includes(p.id);
            return (
              <div key={p.id} className="pt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    <img src={p.image} alt={p.nameFa} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{p.nameFa}</h4>
                    <span className="text-[10px] font-mono text-slate-500">{formatToman(p.cartonPrice)} / کارتن</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAlert(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 ${
                    isAlertOn 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>{isAlertOn ? 'فعال است' : 'گوش‌به‌زنگ کن'}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-md transition-all"
          >
            تأیید و بازگشت
          </button>
        </div>

      </div>
    </div>
  );
};
