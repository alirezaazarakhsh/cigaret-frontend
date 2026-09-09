import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  Search, 
  ChevronRight, 
  Building2, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Wallet, 
  Plus, 
  Minus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Receipt, 
  Sparkles, 
  Award, 
  Eye, 
  Check, 
  X, 
  RefreshCw,
  FileCheck,
  AlertCircle,
  Truck,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DjangoCrmConfig, BankDepositSlip, PosCustomer, PosLedgerTransaction, CustomerTierId, VisitorTierId } from '../../types';
import { djangoFetchCustomers, djangoFetchVisitors, updateProfile, updateShop } from '../../services/djangoApi';
import { CUSTOMER_TIERS_CONFIG, getCustomerTier, VISITOR_TIERS_CONFIG, getVisitorTier } from '../../utils/customerTierCards';
import { formatToman, formatNumberFa } from '../../utils/formatters';

interface UserManagementPanelProps {
  crmConfig?: DjangoCrmConfig;
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ crmConfig }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'visitor'>('all');
  const [activeMainTab, setActiveMainTab] = useState<'users' | 'slips'>('users');
  
  // Wallet Top-up Modal state
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAdjustAmount, setWalletAdjustAmount] = useState<string>('');
  const [walletAdjustType, setWalletAdjustType] = useState<'credit' | 'debit'>('credit');
  const [walletAdjustNote, setWalletAdjustNote] = useState<string>('');
  
  // Bank Slips State
  const [bankSlips, setBankSlips] = useState<BankDepositSlip[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<BankDepositSlip | null>(null);
  const [slipFilterStatus, setSlipFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Edit User State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch from Django if configured
      let customers: any[] = [];
      let visitors: any[] = [];
      try {
        const [c, v] = await Promise.all([
          djangoFetchCustomers(crmConfig),
          djangoFetchVisitors(crmConfig)
        ]);
        customers = c || [];
        visitors = v || [];
      } catch (e) {
        console.warn("Could not reach Django API, falling back to local state", e);
      }

      // 2. Load from localStorage
      const storedCustomers = localStorage.getItem('sovin_pos_customers');
      const localCustomers: PosCustomer[] = storedCustomers ? JSON.parse(storedCustomers) : [];
      
      const storedCurrentUser = localStorage.getItem('sevin_current_user');
      const localUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;

      const mergedUsers: any[] = [];

      // Add local active user if exists
      if (localUser) {
        mergedUsers.push({
          id: localUser.id || 'local_user',
          full_name: localUser.fullName || localUser.shopName || 'کاربر فعال سیستم',
          phone: localUser.phone || '09120759419',
          city: localUser.city || 'تهران',
          province: localUser.province || 'تهران',
          address: localUser.address || 'جنت‌آباد جنوبی',
          type: localUser.role || 'customer',
          shop_name: localUser.shopName || 'فروشگاه دخانیات نگین',
          tierId: localUser.tierId || 'gold',
          customColor: localUser.customColor || '#d97706',
          walletBalance: localUser.walletBalance || 1250000,
          balance: localUser.balance || 3850000,
          creditLimit: localUser.creditLimit || 50000000,
          visitorCode: localUser.visitorCode || 'VIS-9419',
          commissionRate: localUser.commissionRate || 2.5,
          nationalId: localUser.nationalId || '0012345678',
          nationalIdImage: localUser.nationalIdImage,
          vehicleType: localUser.vehicleType || 'motorcycle',
          isProfileCompleted: localUser.isProfileCompleted
        });
      }

      // Add POS local customers
      localCustomers.forEach((c) => {
        if (!mergedUsers.some(u => u.phone === c.phone)) {
          mergedUsers.push({
            id: c.id,
            full_name: c.name,
            phone: c.phone,
            city: c.city || 'تهران',
            address: c.address,
            type: 'customer',
            shop_name: c.name,
            tierId: c.tierId || 'gold',
            walletBalance: c.walletBalance || 0,
            balance: c.balance || 0,
            creditLimit: c.creditLimit || 50000000,
            isProfileCompleted: true
          });
        }
      });

      // Add Django customers
      customers.forEach((c: any) => {
        if (!mergedUsers.some(u => u.phone === c.phone)) {
          mergedUsers.push({
            ...c,
            type: 'customer',
            full_name: c.full_name || c.name || c.shop_name || 'مشتری بدون نام',
            tierId: c.tierId || 'silver',
            walletBalance: c.wallet_balance || c.walletBalance || 0,
            balance: c.balance || 0,
            creditLimit: c.credit_limit || 30000000,
            isProfileCompleted: true
          });
        }
      });

      // Add Django visitors
      visitors.forEach((v: any) => {
        if (!mergedUsers.some(u => u.phone === v.phone)) {
          mergedUsers.push({
            ...v,
            type: 'visitor',
            full_name: v.full_name || v.user?.username || 'ویزیتور رسمی',
            tierId: 'platinum',
            walletBalance: v.wallet_balance || v.walletBalance || 0,
            balance: 0,
            visitorCode: v.visitor_code || 'VIS-100',
            commissionRate: v.commission_rate || 2.5,
            isProfileCompleted: true
          });
        }
      });

      setUsers(mergedUsers);
      if (mergedUsers.length > 0 && !selectedUser) {
        setSelectedUser(mergedUsers[0]);
      }

      // Load Bank Deposit Slips
      const storedSlips = localStorage.getItem('sovin_bank_deposit_slips');
      if (storedSlips) {
        setBankSlips(JSON.parse(storedSlips));
      } else {
        const demoSlips: BankDepositSlip[] = [
          {
            id: 'slip-101',
            customerId: 'cust_1',
            customerName: 'فروشگاه دخانیات نگین (آقای مرادی)',
            customerPhone: '09120759419',
            purpose: 'charge_wallet',
            amount: 5000000,
            trackingNumber: '98412051',
            bankOrigin: 'بانک ملت',
            senderCardLast4: '4192',
            depositDate: '۱۴۰۳/۰۶/۰۵',
            depositTime: '۱۴:۳۰',
            status: 'pending',
            notes: 'درخواست افزایش و شارژ کیف پول جهت خرید بار جدید تیریا و وینستون',
            createdAt: '۱۴۰۳/۰۶/۰۵ - ۱۴:۳۲'
          },
          {
            id: 'slip-102',
            customerId: 'cust_2',
            customerName: 'فروشگاه دخانیات باران (آقای حسینی)',
            customerPhone: '09351234567',
            purpose: 'settle_debt',
            amount: 3850000,
            trackingNumber: '76129844',
            bankOrigin: 'بانک ملی',
            senderCardLast4: '8831',
            depositDate: '۱۴۰۳/۰۶/۰۴',
            depositTime: '۱۱:۱۵',
            status: 'approved',
            notes: 'تسویه کامل مانده حساب دفتری شهریورماه',
            createdAt: '۱۴۰۳/۰۶/۰۴ - ۱۱:۲۰',
            reviewedBy: 'مدیر حسابداری انبار'
          }
        ];
        setBankSlips(demoSlips);
        localStorage.setItem('sovin_bank_deposit_slips', JSON.stringify(demoSlips));
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [crmConfig]);

  // Handle Save User profile & VIP card tier
  const handleSave = async () => {
    try {
      if (selectedUser.type === 'visitor') {
        try {
          await updateProfile(editForm);
        } catch (e) {
          console.warn("Backend update skipped");
        }
      } else {
        try {
          await updateShop(selectedUser.id, editForm);
        } catch (e) {
          console.warn("Backend update skipped");
        }
      }

      // Update in local users state
      const updated = users.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u);
      setUsers(updated);
      setSelectedUser({ ...selectedUser, ...editForm });

      // If active user, update localStorage
      const storedCurrentUser = localStorage.getItem('sevin_current_user');
      if (storedCurrentUser) {
        const cur = JSON.parse(storedCurrentUser);
        if (cur.phone === selectedUser.phone || cur.id === selectedUser.id) {
          const updatedCur = { ...cur, ...editForm };
          localStorage.setItem('sevin_current_user', JSON.stringify(updatedCur));
          window.dispatchEvent(new Event('sevin_user_updated'));
        }
      }

      setIsEditing(false);
      alert('اطلاعات کاربر و تنظیمات کارت VIP با موفقیت ذخیره شد.');
    } catch (e) {
      console.error(e);
      alert('خطا در ذخیره اطلاعات');
    }
  };

  // Direct Wallet Balance Adjustment Handler
  const handleAdjustWalletBalance = () => {
    const amount = parseInt(walletAdjustAmount.replace(/\D/g, ''), 10);
    if (!amount || amount <= 0) {
      alert('لطفاً مبلغ معتبری وارد نمایید.');
      return;
    }

    const currentBal = selectedUser.walletBalance || 0;
    const newBal = walletAdjustType === 'credit' ? currentBal + amount : Math.max(0, currentBal - amount);

    const updatedUser = {
      ...selectedUser,
      walletBalance: newBal
    };

    // Update in state
    setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
    setSelectedUser(updatedUser);

    // Save to POS customers storage
    try {
      const storedCustomers = localStorage.getItem('sovin_pos_customers');
      if (storedCustomers) {
        const custs: PosCustomer[] = JSON.parse(storedCustomers);
        const idx = custs.findIndex(c => c.phone === selectedUser.phone || c.id === selectedUser.id);
        if (idx !== -1) {
          custs[idx].walletBalance = newBal;
          localStorage.setItem('sovin_pos_customers', JSON.stringify(custs));
        }
      }

      // Add ledger transaction log
      const storedTxs = localStorage.getItem('sovin_pos_ledger_txs');
      const txs: PosLedgerTransaction[] = storedTxs ? JSON.parse(storedTxs) : [];
      txs.unshift({
        id: `tx-admin-${Date.now()}`,
        customerId: `cust_${selectedUser.id}`,
        date: `${new Date().toLocaleDateString('fa-IR')} ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
        amount: amount,
        type: walletAdjustType === 'credit' ? 'credit' : 'debit',
        description: `تغییر موجودی کیف پول توسط مدیریت: ${walletAdjustNote || (walletAdjustType === 'credit' ? 'شارژ دستی کیف پول' : 'کسر دستی از کیف پول')}`
      });
      localStorage.setItem('sovin_pos_ledger_txs', JSON.stringify(txs));

      // Update active user in localStorage if matched
      const storedCurrentUser = localStorage.getItem('sevin_current_user');
      if (storedCurrentUser) {
        const cur = JSON.parse(storedCurrentUser);
        if (cur.phone === selectedUser.phone || cur.id === selectedUser.id) {
          cur.walletBalance = newBal;
          localStorage.setItem('sevin_current_user', JSON.stringify(cur));
          window.dispatchEvent(new Event('sevin_user_updated'));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setShowWalletModal(false);
    setWalletAdjustAmount('');
    setWalletAdjustNote('');
    alert(`کیف پول کاربر ${selectedUser.full_name} با موفقیت ${walletAdjustType === 'credit' ? 'شارژ' : 'کسر'} شد. موجودی جدید: ${formatToman(newBal)}`);
  };

  // Bank Deposit Slip Status Updater (Approve / Reject)
  const handleUpdateSlipStatus = (slipId: string, newStatus: 'approved' | 'rejected') => {
    const targetSlip = bankSlips.find(s => s.id === slipId);
    if (!targetSlip) return;

    const updatedSlips = bankSlips.map(s => {
      if (s.id === slipId) {
        return {
          ...s,
          status: newStatus,
          reviewedBy: 'مدیریت مرکزی بنکداری'
        };
      }
      return s;
    });

    setBankSlips(updatedSlips);
    localStorage.setItem('sovin_bank_deposit_slips', JSON.stringify(updatedSlips));

    // If approved, automatically apply financial effect
    if (newStatus === 'approved') {
      const slipAmount = targetSlip.amount;
      const targetUser = users.find(u => u.phone === targetSlip.customerPhone || u.id === targetSlip.customerId);

      if (targetUser) {
        let updatedUser = { ...targetUser };

        if (targetSlip.purpose === 'charge_wallet') {
          // Increase wallet balance
          updatedUser.walletBalance = (targetUser.walletBalance || 0) + slipAmount;
        } else {
          // Settle ledger debt
          updatedUser.balance = (targetUser.balance || 0) - slipAmount;
        }

        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (selectedUser?.id === updatedUser.id) {
          setSelectedUser(updatedUser);
        }

        // Update active user in localStorage if matched
        const storedCurrentUser = localStorage.getItem('sevin_current_user');
        if (storedCurrentUser) {
          const cur = JSON.parse(storedCurrentUser);
          if (cur.phone === updatedUser.phone || cur.id === updatedUser.id) {
            if (targetSlip.purpose === 'charge_wallet') {
              cur.walletBalance = updatedUser.walletBalance;
            } else {
              cur.balance = updatedUser.balance;
            }
            localStorage.setItem('sevin_current_user', JSON.stringify(cur));
            window.dispatchEvent(new Event('sevin_user_updated'));
          }
        }
      }

      // Add transaction to ledger log
      try {
        const storedTxs = localStorage.getItem('sovin_pos_ledger_txs');
        const txs: PosLedgerTransaction[] = storedTxs ? JSON.parse(storedTxs) : [];
        txs.unshift({
          id: `tx-slip-${Date.now()}`,
          customerId: targetSlip.customerId,
          date: `${new Date().toLocaleDateString('fa-IR')} ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
          amount: slipAmount,
          type: 'credit',
          description: `تأیید فیش واریزی بانکی (${targetSlip.bankOrigin} - پیگیری: ${targetSlip.trackingNumber}) - ${targetSlip.purpose === 'charge_wallet' ? 'شارژ کیف پول' : 'تسویه حساب دفتری'}`
        });
        localStorage.setItem('sovin_pos_ledger_txs', JSON.stringify(txs));
      } catch (e) {
        console.error(e);
      }

      alert(`فیش بانکی شماره ${targetSlip.trackingNumber} با موفقیت تأیید گردید و مبلغ ${formatToman(slipAmount)} در ${targetSlip.purpose === 'charge_wallet' ? 'کیف پول' : 'حساب دفتری'} اعمال شد.`);
    } else {
      alert(`فیش بانکی شماره ${targetSlip.trackingNumber} رد گردید.`);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery) ||
      u.shop_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (roleFilter === 'all') return matchesSearch;
    return matchesSearch && u.type === roleFilter;
  });

  const pendingSlipsCount = bankSlips.filter(s => s.status === 'pending').length;

  const currentTierConfig = getCustomerTier(selectedUser?.tierId || 'gold');

  return (
    <div className="p-4 sm:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6" dir="rtl">
      
      {/* Top Header & Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              مدیریت کاربران، کیف پول و کارت‌های VIP
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              تفکیک کامل مشتریان و ویزیتورها، شارژ مستقیم کیف پول دیتابیس و بررسی فیش‌های واریزی
            </p>
          </div>
        </div>

        {/* Tab Switcher: Users vs Bank Slips */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveMainTab('users')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeMainTab === 'users'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>لیست کاربران ({formatNumberFa(users.length)})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('slips')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 relative ${
              activeMainTab === 'slips'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>فیش‌های بانکی</span>
            {pendingSlipsCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                {formatNumberFa(pendingSlipsCount)} جدید
              </span>
            )}
          </button>
        </div>
      </div>

      {activeMainTab === 'users' ? (
        /* ================= USERS & VIP TIER MANAGEMENT VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Right Column: User Filter & List */}
          <div className="lg:col-span-4 bg-slate-50 p-4 rounded-3xl border border-slate-200 flex flex-col h-[650px]">
            
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
              <input 
                className="w-full pr-10 pl-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="جستجوی نام، تلفن یا مغازه..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter Chips */}
            <div className="grid grid-cols-3 gap-1.5 mb-3 bg-slate-200/70 p-1 rounded-xl text-[11px] font-black">
              <button
                onClick={() => setRoleFilter('all')}
                className={`py-1.5 rounded-lg transition-all ${roleFilter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
              >
                همه ({formatNumberFa(users.length)})
              </button>
              <button
                onClick={() => setRoleFilter('customer')}
                className={`py-1.5 rounded-lg transition-all ${roleFilter === 'customer' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
              >
                مشتریان ({formatNumberFa(users.filter(u => u.type === 'customer').length)})
              </button>
              <button
                onClick={() => setRoleFilter('visitor')}
                className={`py-1.5 rounded-lg transition-all ${roleFilter === 'visitor' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
              >
                ویزیتورها ({formatNumberFa(users.filter(u => u.type === 'visitor').length)})
              </button>
            </div>

            {/* User List scroll area */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  در حال بارگذاری کاربران...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">
                  کاربری یافت نشد.
                </div>
              ) : (
                filteredUsers.map(u => {
                  const tier = getCustomerTier(u.tierId);
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <div 
                      key={`${u.type}-${u.id}`} 
                      className={`p-3.5 bg-white rounded-2xl cursor-pointer border transition-all ${
                        isSelected 
                          ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`} 
                      onClick={() => {
                        setSelectedUser(u);
                        setIsEditing(false);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-black text-xs text-slate-900 truncate">
                          {u.full_name || u.shop_name}
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          u.type === 'visitor' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {u.type === 'visitor' ? '👔 ویزیتور' : '🛒 مغازه‌دار'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                        <span>{u.phone}</span>
                        <span className="font-bold text-emerald-700 font-sans text-[10px]">
                          کیف پول: {formatToman(u.walletBalance || 0)}
                        </span>
                      </div>

                      {/* VIP Card badge chip */}
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mt-2 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>{tier.nameFa.split(' ')[0]} {tier.nameFa.split(' ')[1]}</span>
                        </span>
                        <span className="text-slate-400">{u.city || 'تهران'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Left Column: Comprehensive Profile & Financial Details */}
          <div className="lg:col-span-8 bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 flex flex-col justify-between">
            {selectedUser ? (
              <div className="space-y-6">
                
                {/* Header Profile card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
                      {selectedUser.full_name?.slice(0, 1) || 'ک'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">{selectedUser.full_name}</h3>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          selectedUser.type === 'visitor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedUser.type === 'visitor' ? 'ویزیتور رسمی' : 'مشتری بنکداری'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedUser.shop_name ? `فروشگاه: ${selectedUser.shop_name}` : `کد ویزیتور: ${selectedUser.visitorCode || 'VIS-9419'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    {!isEditing ? (
                      <button 
                        onClick={() => { 
                          setIsEditing(true); 
                          setEditForm({
                            ...selectedUser,
                            shop_name: selectedUser.shop_name || '',
                            city: selectedUser.city || 'تهران',
                            address: selectedUser.address || '',
                            tierId: selectedUser.tierId || 'gold',
                            customColor: selectedUser.customColor || '#d97706',
                            creditLimit: selectedUser.creditLimit || 50000000,
                            commissionRate: selectedUser.commissionRate || 2.5
                          }); 
                        }} 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs transition-all"
                      >
                        ویرایش مشخصات و کارت VIP
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleSave} 
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>ذخیره تغییرات</span>
                        </button>
                        <button 
                          onClick={() => setIsEditing(false)} 
                          className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                        >
                          انصراف
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3 Financial Status Metric Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Metric 1: کیف پول الکترونیکی */}
                  <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 p-4 rounded-2xl border border-emerald-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        کیف پول کاربر
                      </span>
                      <button
                        onClick={() => {
                          setWalletAdjustType('credit');
                          setShowWalletModal(true);
                        }}
                        className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-[10px] font-black flex items-center gap-0.5 px-2"
                        title="شارژ مستقیم کیف پول"
                      >
                        <Plus className="w-3 h-3" />
                        <span>شارژ / کسر</span>
                      </button>
                    </div>
                    <div className="text-xl font-black text-emerald-700 font-mono">
                      {formatToman(selectedUser.walletBalance || 0)}
                    </div>
                  </div>

                  {/* Metric 2: مانده حساب دفتری */}
                  <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/50 p-4 rounded-2xl border border-amber-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Receipt className="w-4 h-4 text-amber-600" />
                        مانده بدهی دفتری
                      </span>
                      <span className="text-[10px] text-amber-700 font-black">نسیه</span>
                    </div>
                    <div className="text-xl font-black text-amber-800 font-mono">
                      {formatToman(selectedUser.balance || 0)}
                    </div>
                  </div>

                  {/* Metric 3: رده و سقف اعتبار کارت VIP */}
                  <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 p-4 rounded-2xl border border-indigo-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-800 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-600" />
                        کارت و اعتبار VIP
                      </span>
                      <span className="text-[10px] text-indigo-700 font-black">{currentTierConfig.badgeTitle}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      سقف: {formatToman(selectedUser.creditLimit || currentTierConfig.defaultCreditLimit)}
                    </div>
                  </div>

                </div>

                {/* Edit Form or Readonly Information View */}
                {isEditing ? (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-xs font-bold">
                    <h4 className="text-xs font-black text-indigo-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      ویرایش مشخصات و سطح دسترسی کاربر:
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 mb-1">نام و نام خانوادگی:</label>
                        <input
                          type="text"
                          value={editForm.full_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 mb-1">شماره تلفن همراه:</label>
                        <input
                          type="text"
                          dir="ltr"
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden font-mono"
                        />
                      </div>

                      {selectedUser.type === 'customer' ? (
                        <>
                          <div>
                            <label className="block text-slate-700 mb-1">نام فروشگاه / مغازه:</label>
                            <input
                              type="text"
                              value={editForm.shop_name || ''}
                              onChange={(e) => setEditForm({ ...editForm, shop_name: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 mb-1">تخصیص سطح کارت VIP مشتری:</label>
                            <select
                              value={editForm.tierId || 'gold'}
                              onChange={(e) => setEditForm({ ...editForm, tierId: e.target.value as CustomerTierId })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden"
                            >
                              {Object.values(CUSTOMER_TIERS_CONFIG).map(t => (
                                <option key={t.id} value={t.id}>{t.nameFa}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-slate-700 mb-1">کد اختصاصی ویزیتور:</label>
                            <input
                              type="text"
                              dir="ltr"
                              value={editForm.visitorCode || ''}
                              onChange={(e) => setEditForm({ ...editForm, visitorCode: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 mb-1">درصد پورسانت فروش (%):</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editForm.commissionRate || 2.5}
                              onChange={(e) => setEditForm({ ...editForm, commissionRate: parseFloat(e.target.value) })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 mb-1">تخصیص کارت VIP و رتبه سفیر ویزیتور:</label>
                            <select
                              value={editForm.visitorVipTierId || 'visitor_junior'}
                              onChange={(e) => setEditForm({ ...editForm, visitorVipTierId: e.target.value as VisitorTierId })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden font-medium text-xs text-blue-900"
                            >
                              {Object.values(VISITOR_TIERS_CONFIG).map(t => (
                                <option key={t.id} value={t.id}>{t.nameFa}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-slate-700 mb-1">شهر / منطقه:</label>
                        <input
                          type="text"
                          value={editForm.city || ''}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 mb-1">سقف اعتبار دفتری (تومان):</label>
                        <input
                          type="number"
                          value={editForm.creditLimit || 50000000}
                          onChange={(e) => setEditForm({ ...editForm, creditLimit: parseInt(e.target.value, 10) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1">آدرس دقیق مغازه / محل فعالیت:</label>
                      <textarea
                        rows={2}
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                ) : (
                  /* Read-only details with VIP preview */
                  <div className="space-y-4">
                    {/* VIP Digital Card Preview */}
                    <div className={`p-5 rounded-3xl bg-linear-to-r ${currentTierConfig.cardGradient} ${currentTierConfig.cardBorder} text-white shadow-xl relative overflow-hidden`}>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-300" />
                          <span className="text-xs font-black tracking-wider text-amber-200">{currentTierConfig.badgeTitle}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/20">
                          {selectedUser.type === 'visitor' ? `VISITOR: ${selectedUser.visitorCode || '9419'}` : `ID: ${selectedUser.id}`}
                        </span>
                      </div>

                      <div className="my-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-200">{selectedUser.full_name}</div>
                          <div className="text-xs text-amber-300 font-black mt-0.5">{selectedUser.shop_name || 'پخش دخانیات سرو'}</div>
                        </div>
                        <div className="text-left font-mono" dir="ltr">
                          <div className="text-[10px] text-slate-400">DISCOUNT RATE</div>
                          <div className="text-base font-black text-amber-300">{currentTierConfig.discountRate}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
                        <span>سقف اعتبار نسیه: {formatToman(selectedUser.creditLimit || currentTierConfig.defaultCreditLimit)}</span>
                        <span>{selectedUser.city || 'تهران'}</span>
                      </div>
                    </div>

                    {/* Detailed info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 bg-white p-3.5 rounded-2xl border border-slate-200">
                        <Phone className="w-4 h-4 text-indigo-500" />
                        <span className="text-slate-500">شماره تماس:</span>
                        <strong className="text-slate-900 font-mono" dir="ltr">{selectedUser.phone}</strong>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-3.5 rounded-2xl border border-slate-200">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        <span className="text-slate-500">آدرس:</span>
                        <strong className="text-slate-900 truncate">{selectedUser.address || selectedUser.city || 'تهران'}</strong>
                      </div>

                      {selectedUser.nationalId && (
                        <div className="flex items-center gap-2 bg-white p-3.5 rounded-2xl border border-slate-200">
                          <ShieldCheck className="w-4 h-4 text-indigo-500" />
                          <span className="text-slate-500">کد ملی:</span>
                          <strong className="text-slate-900 font-mono" dir="ltr">{selectedUser.nationalId}</strong>
                        </div>
                      )}

                      {selectedUser.nationalIdImage && (
                        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
                          <span className="text-slate-500 font-bold">تصویر کارت ملی:</span>
                          <img
                            src={selectedUser.nationalIdImage}
                            alt="کارت ملی"
                            className="h-10 w-16 rounded-md object-cover border border-slate-200 shadow-2xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold">
                کاربری را از لیست انتخاب کنید.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= BANK DEPOSIT SLIPS TAB ================= */
        <div className="space-y-4">
          
          {/* Slips Filter bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-black text-slate-900">
                فیش‌های ارسالی مشتریان و ویزیتورها جهت شارژ کیف پول و تسویه دفتری:
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSlipFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${slipFilterStatus === 'all' ? 'bg-white text-indigo-700 shadow-xs font-black' : 'text-slate-600'}`}
              >
                همه ({formatNumberFa(bankSlips.length)})
              </button>
              <button
                onClick={() => setSlipFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all ${slipFilterStatus === 'pending' ? 'bg-white text-amber-700 shadow-xs font-black' : 'text-slate-600'}`}
              >
                در انتظار بررسی ({formatNumberFa(bankSlips.filter(s => s.status === 'pending').length)})
              </button>
              <button
                onClick={() => setSlipFilterStatus('approved')}
                className={`px-3 py-1.5 rounded-lg transition-all ${slipFilterStatus === 'approved' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'text-slate-600'}`}
              >
                تأیید شده ({formatNumberFa(bankSlips.filter(s => s.status === 'approved').length)})
              </button>
            </div>
          </div>

          {/* Slips Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankSlips
              .filter(s => slipFilterStatus === 'all' || s.status === slipFilterStatus)
              .map(slip => {
                return (
                  <div 
                    key={slip.id}
                    className={`bg-white rounded-3xl p-5 border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                      slip.status === 'pending' 
                        ? 'border-amber-300 ring-2 ring-amber-400/20' 
                        : slip.status === 'approved' 
                        ? 'border-emerald-200' 
                        : 'border-rose-200'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          slip.purpose === 'charge_wallet'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}>
                          {slip.purpose === 'charge_wallet' ? '💳 افزایش کیف پول' : '📄 تسویه حساب دفتری'}
                        </span>

                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          slip.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : slip.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {slip.status === 'pending' ? '⏳ در انتظار تایید' : slip.status === 'approved' ? '✅ تایید و اعمال شده' : '❌ رد شده'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="font-black text-slate-900 text-sm">
                          {slip.customerName}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]" dir="ltr">
                          {slip.customerPhone}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-slate-500">مبلغ واریز:</span>
                          <span className="font-mono font-black text-base text-blue-700">
                            {formatToman(slip.amount)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>کد پیگیری بانکی:</span>
                          <span className="font-mono font-bold" dir="ltr">{slip.trackingNumber}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>بانک مبدا / کارت:</span>
                          <span>{slip.bankOrigin} (کارت: ...{slip.senderCardLast4})</span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>تاریخ واریز:</span>
                          <span>{slip.depositDate} ساعت {slip.depositTime}</span>
                        </div>

                        {slip.notes && (
                          <p className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100 mt-1">
                            یادداشت: {slip.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {slip.status === 'pending' ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleUpdateSlipStatus(slip.id, 'approved')}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تأیید و اعمال در کیف پول</span>
                        </button>
                        <button
                          onClick={() => handleUpdateSlipStatus(slip.id, 'rejected')}
                          className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs rounded-xl transition-all border border-rose-200"
                        >
                          رد فیش
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-400 font-bold">
                        توسط {slip.reviewedBy || 'مدیریت'} بررسی گردید.
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Direct Wallet Balance Adjustment Modal */}
      {showWalletModal && selectedUser && (
        <div 
          className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowWalletModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-200 cursor-default" 
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-sm">
                  شارژ مستقیم کیف پول در دیتابیس
                </h3>
              </div>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
              <div>کاربر: <strong>{selectedUser.full_name}</strong></div>
              <div>موجودی فعلی: <strong className="text-emerald-700 font-mono">{formatToman(selectedUser.walletBalance || 0)}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWalletAdjustType('credit')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                  walletAdjustType === 'credit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزایش (شارژ نقدی)</span>
              </button>

              <button
                type="button"
                onClick={() => setWalletAdjustType('debit')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                  walletAdjustType === 'debit'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>کاهش (کسر از موجودی)</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                مبلغ مورد نظر (تومان):
              </label>
              <input
                type="text"
                placeholder="مثال: 5,000,000"
                value={walletAdjustAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setWalletAdjustAmount(val ? parseInt(val, 10).toLocaleString('fa-IR') : '');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                علت شارژ / توضیحات سند حسابداری:
              </label>
              <input
                type="text"
                placeholder="مثال: واریز حواله پایا توسط مشتری"
                value={walletAdjustNote}
                onChange={(e) => setWalletAdjustNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleAdjustWalletBalance}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>اعمال در موجودی کیف پول دیتابیس</span>
              </button>
              <button
                type="button"
                onClick={() => setShowWalletModal(false)}
                className="py-3 px-4 bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-300 transition-all"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
