import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Barcode, 
  Search, 
  ShoppingCart, 
  Package, 
  Boxes, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CreditCard, 
  Banknote, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  KeyRound, 
  LogOut, 
  RefreshCw, 
  SlidersHorizontal,
  User,
  Phone,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Building2,
  Receipt,
  QrCode,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { CigaretteProduct, PosSaleItem, PosReceiptInvoice, StockAdjustmentLog } from '../../types';
import { formatToman, formatNumberFa } from '../../utils/formatters';

interface AccountingPosPanelProps {
  products: CigaretteProduct[];
  onUpdateProductsStock?: (updatedProducts: CigaretteProduct[]) => void;
  onReturnToStore: () => void;
}

const AUTHORIZED_PHONE = '09120759419';
const VALID_PASSWORDS = ['alirezazzz9419@S', 'azarakhsh2025', '09120759419', 'admin1234'];

export const AccountingPosPanel: React.FC<AccountingPosPanelProps> = ({
  products: initialProducts,
  onUpdateProductsStock,
  onReturnToStore,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sovin_pos_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [loginPhone, setLoginPhone] = useState(AUTHORIZED_PHONE);
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active View Tab
  const [activeSubTab, setActiveSubTab] = useState<'pos' | 'inventory' | 'ledger' | 'settings'>('pos');

  // Local products stock state
  const [productsList, setProductsList] = useState<CigaretteProduct[]>(initialProducts);

  useEffect(() => {
    setProductsList(initialProducts);
  }, [initialProducts]);

  // Sound feedback toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // POS Cart State
  const [posCart, setPosCart] = useState<PosSaleItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [posSearch, setPosSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customerName, setCustomerName] = useState('مشتری حضوری فروشگاه');
  const [customerPhone, setCustomerPhone] = useState('');
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'pos_terminal' | 'cash' | 'cheque' | 'credit'>('pos_terminal');
  const [terminalRef, setTerminalRef] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Inventory adjustment modal
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState<CigaretteProduct | null>(null);
  const [adjustType, setAdjustType] = useState<'stock_in' | 'damage' | 'adjustment'>('stock_in');
  const [adjustQuantityCartons, setAdjustQuantityCartons] = useState<number>(1);
  const [adjustNote, setAdjustNote] = useState('');

  // Past Receipts Ledger
  const [receiptsList, setReceiptsList] = useState<PosReceiptInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_receipts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Stock logs
  const [stockLogs, setStockLogs] = useState<StockAdjustmentLog[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_stock_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Current printed receipt modal
  const [activeReceiptToPrint, setActiveReceiptToPrint] = useState<PosReceiptInvoice | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus barcode input on mount and on tab switch
  useEffect(() => {
    if (isAuthenticated && activeSubTab === 'pos') {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 200);
    }
  }, [isAuthenticated, activeSubTab]);

  // Play audio bip
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(loginPass.trim())) {
      setIsAuthenticated(true);
      setLoginError('');
      try {
        localStorage.setItem('sovin_pos_auth', 'true');
      } catch {}
    } else {
      setLoginError('شماره یا رمز عبور اشتباه است. لطفاً رمز امنیتی یا رمز API را وارد کنید.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('sovin_pos_auth');
    } catch {}
  };

  // Add Product to POS Cart by Product Object
  const handleAddProductToPos = (product: CigaretteProduct, unit: 'carton' | 'box' | 'pack' = 'box') => {
    playBeep();
    setPosCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.unit === unit);
      const unitPrice = unit === 'carton' 
        ? product.cartonPrice 
        : unit === 'box' 
          ? product.boxPrice 
          : Math.round(product.boxPrice / 10);

      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            unit,
            quantity: 1,
            unitPrice,
            totalPrice: unitPrice,
          }
        ];
      }
    });

    setSuccessBanner(`«${product.nameFa}» به فاکتور جاری صندوق اضافه شد.`);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  // Barcode input trigger on Enter / scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // Look for exact barcode match, then partial barcode, then ID
    const found = productsList.find(p => 
      p.barcode === query || 
      p.id.toLowerCase() === query.toLowerCase() ||
      p.barcode.endsWith(query)
    );

    if (found) {
      handleAddProductToPos(found, found.isBoxOnly ? 'box' : 'box');
      setBarcodeInput('');
    } else {
      // Look for name match
      const nameMatch = productsList.find(p => 
        p.nameFa.toLowerCase().includes(query.toLowerCase()) || 
        p.nameEn.toLowerCase().includes(query.toLowerCase())
      );
      if (nameMatch) {
        handleAddProductToPos(nameMatch, nameMatch.isBoxOnly ? 'box' : 'box');
        setBarcodeInput('');
      } else {
        alert(`کالایی با بارکد یا کد «${query}» در انبار یافت نشد.`);
      }
    }
  };

  // Update quantity in POS
  const handleUpdatePosQty = (idx: number, delta: number) => {
    setPosCart(prev => {
      const updated = [...prev];
      const newQty = updated[idx].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== idx);
      }
      updated[idx] = {
        ...updated[idx],
        quantity: newQty,
        totalPrice: newQty * updated[idx].unitPrice,
      };
      return updated;
    });
  };

  // Change unit in POS
  const handleChangePosUnit = (idx: number, newUnit: 'carton' | 'box' | 'pack') => {
    setPosCart(prev => {
      const updated = [...prev];
      const item = updated[idx];
      const newUnitPrice = newUnit === 'carton' 
        ? item.product.cartonPrice 
        : newUnit === 'box' 
          ? item.product.boxPrice 
          : Math.round(item.product.boxPrice / 10);
      
      updated[idx] = {
        ...item,
        unit: newUnit,
        unitPrice: newUnitPrice,
        totalPrice: item.quantity * newUnitPrice,
      };
      return updated;
    });
  };

  // Remove from POS
  const handleRemovePosItem = (idx: number) => {
    setPosCart(prev => prev.filter((_, i) => i !== idx));
  };

  // POS Totals
  const posSubtotal = useMemo(() => {
    return posCart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [posCart]);

  const posFinalTotal = useMemo(() => {
    return Math.max(0, posSubtotal - posDiscount);
  }, [posSubtotal, posDiscount]);

  // Finalize POS Sale & Deduct from Stock
  const handleFinalizePosSale = () => {
    if (posCart.length === 0) {
      alert('سبد فروش خالی است. لطفاً ابتدا کالا یا بارکد اسکن کنید.');
      return;
    }

    const now = new Date();
    const receiptNum = `POS-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReceipt: PosReceiptInvoice = {
      id: `rcpt_${Date.now()}`,
      receiptNumber: receiptNum,
      createdAt: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      customerName: customerName.trim() || 'مشتری حضوری',
      customerPhone: customerPhone.trim() || undefined,
      items: [...posCart],
      subtotal: posSubtotal,
      discountAmount: posDiscount,
      finalTotal: posFinalTotal,
      paymentMethod,
      terminalRefNumber: terminalRef.trim() || undefined,
      notes: orderNotes.trim() || undefined,
      cashier: 'صندوق‌دار مرکزی انبار سوین',
    };

    // Deduct stock from products
    const updatedProducts = productsList.map(p => {
      const soldItems = posCart.filter(item => item.product.id === p.id);
      if (soldItems.length === 0) return p;

      let cartonsToDeduct = 0;
      soldItems.forEach(si => {
        if (si.unit === 'carton') {
          cartonsToDeduct += si.quantity;
        } else if (si.unit === 'box') {
          cartonsToDeduct += (si.quantity / (p.boxesPerCarton || 50));
        } else if (si.unit === 'pack') {
          cartonsToDeduct += (si.quantity / ((p.boxesPerCarton || 50) * 10));
        }
      });

      const newStock = Math.max(0, Math.round((p.stockCartons - cartonsToDeduct) * 10) / 10);
      return {
        ...p,
        stockCartons: newStock,
      };
    });

    // Save stock logs
    const newLogs: StockAdjustmentLog[] = posCart.map(item => ({
      id: `log_${Date.now()}_${Math.random()}`,
      productId: item.product.id,
      productName: item.product.nameFa,
      type: 'sale_pos',
      deltaCartons: item.unit === 'carton' ? -item.quantity : -Math.round((item.quantity / 50) * 10) / 10,
      deltaBoxes: item.unit === 'box' ? -item.quantity : 0,
      finalStockCartons: updatedProducts.find(p => p.id === item.product.id)?.stockCartons || 0,
      date: newReceipt.createdAt,
      note: `فاکتور فروش حضوری ${receiptNum}`,
    }));

    const updatedReceipts = [newReceipt, ...receiptsList];
    const updatedLogs = [...newLogs, ...stockLogs];

    setReceiptsList(updatedReceipts);
    setStockLogs(updatedLogs);
    setProductsList(updatedProducts);

    try {
      localStorage.setItem('sovin_pos_receipts', JSON.stringify(updatedReceipts));
      localStorage.setItem('sovin_pos_stock_logs', JSON.stringify(updatedLogs));
    } catch {}

    if (onUpdateProductsStock) {
      onUpdateProductsStock(updatedProducts);
    }

    // Reset POS form & open print view
    setActiveReceiptToPrint(newReceipt);
    setPosCart([]);
    setPosDiscount(0);
    setCustomerName('مشتری حضوری فروشگاه');
    setCustomerPhone('');
    setTerminalRef('');
    setOrderNotes('');
  };

  // Handle Manual Stock Adjustment
  const handleSaveStockAdjustment = () => {
    if (!selectedProductForAdjustment || adjustQuantityCartons <= 0) return;

    const delta = adjustType === 'stock_in' ? adjustQuantityCartons : -adjustQuantityCartons;
    const updatedProducts = productsList.map(p => {
      if (p.id !== selectedProductForAdjustment.id) return p;
      return {
        ...p,
        stockCartons: Math.max(0, p.stockCartons + delta),
      };
    });

    const now = new Date();
    const newLog: StockAdjustmentLog = {
      id: `adj_${Date.now()}`,
      productId: selectedProductForAdjustment.id,
      productName: selectedProductForAdjustment.nameFa,
      type: adjustType === 'stock_in' ? 'stock_in' : adjustType === 'damage' ? 'damage' : 'adjustment',
      deltaCartons: delta,
      deltaBoxes: delta * (selectedProductForAdjustment.boxesPerCarton || 50),
      finalStockCartons: updatedProducts.find(p => p.id === selectedProductForAdjustment.id)?.stockCartons || 0,
      date: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      note: adjustNote || (adjustType === 'stock_in' ? 'ورود بار جدید به انبار' : 'اصلاح موجودی'),
    };

    const updatedLogs = [newLog, ...stockLogs];
    setStockLogs(updatedLogs);
    setProductsList(updatedProducts);

    try {
      localStorage.setItem('sovin_pos_stock_logs', JSON.stringify(updatedLogs));
    } catch {}

    if (onUpdateProductsStock) {
      onUpdateProductsStock(updatedProducts);
    }

    setSelectedProductForAdjustment(null);
    setAdjustNote('');
    setAdjustQuantityCartons(1);
  };

  // Filtered products for POS quick shelf
  const filteredPosProducts = useMemo(() => {
    return productsList.filter(p => {
      const matchSearch = 
        p.nameFa.toLowerCase().includes(posSearch.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(posSearch.toLowerCase()) ||
        p.barcode.includes(posSearch) ||
        p.brand.toLowerCase().includes(posSearch.toLowerCase());
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [productsList, posSearch, selectedCategory]);

  // Inventory Statistics
  const totalInventoryValue = useMemo(() => {
    return productsList.reduce((sum, p) => sum + (p.stockCartons * p.cartonPrice), 0);
  }, [productsList]);

  const totalCartonsInStock = useMemo(() => {
    return productsList.reduce((sum, p) => sum + p.stockCartons, 0);
  }, [productsList]);

  const lowStockCount = useMemo(() => {
    return productsList.filter(p => p.stockCartons < 10).length;
  }, [productsList]);

  const todaySalesTotal = useMemo(() => {
    return receiptsList.reduce((sum, r) => sum + r.finalTotal, 0);
  }, [receiptsList]);

  // Print Thermal Receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // If Not Authenticated -> Show Executive Secure Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 selection:bg-indigo-600 selection:text-white" dir="rtl">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              سامانه حسابداری و صندوق فروشگاهی سوین
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              کنترل یکپارچه موجودی انبار، صندوق بارکدخوان POS و ثبت فاکتورهای فروش حضوری
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                شماره همراه مدیر فروشگاه / انباردار
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  dir="ltr"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="09120759419"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-900 font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                رمز عبور امنیتی / کلید اختصاصی API
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-900 font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>ورود به میز کار حسابداری و صندوق</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <button
              onClick={onReturnToStore}
              className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به کاتالوگ فروشگاه آنلاین سوین</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Main View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white" dir="rtl">
      
      {/* Top POS Executive Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  پنل حسابداری و صندوق فروشگاهی سوین (POS)
                </h1>
                <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  صندوق آنلاین
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                مدیریت انبار مرکزی • کاربر: <strong className="text-indigo-300 font-mono">۰۹۱۲۰۷۵۹۴۱۹</strong>
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('pos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                activeSubTab === 'pos'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Barcode className="w-4 h-4" />
              <span>صندوق و بارکدخوان</span>
              {posCart.length > 0 && (
                <span className="w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-mono">
                  {posCart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                activeSubTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>موجودی انبار و کاردکس</span>
              {lowStockCount > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-slate-950 text-[10px] rounded-full flex items-center justify-center font-bold">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                activeSubTab === 'ledger'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>فاکتورها و تراکنش‌ها ({receiptsList.length})</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'صدا فعال است' : 'صدا قطع است'}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-200 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={onReturnToStore}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">بازگشت به سایت</span>
            </button>

            <button
              onClick={handleLogout}
              title="خروج از پنل حسابداری"
              className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs font-black shadow-md flex items-center justify-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Overview Stat Widgets */}
      <div className="bg-white border-b border-slate-200 px-6 sm:px-10 py-6">
        <div className="max-w-[1800px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">ارزش کل موجودی انبار</p>
              <p className="text-xl font-black text-indigo-600 ">{formatToman(totalInventoryValue)}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 ">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">کل کارتن‌های موجود</p>
              <p className="text-xl font-black text-emerald-600 ">{formatNumberFa(totalCartonsInStock)} کارتن</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 ">
              <Boxes className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">فروش ثبت شده صندوق</p>
              <p className="text-xl font-black text-cyan-600 ">{formatToman(todaySalesTotal)}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 ">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">کالاهای رو به اتمام (کسری)</p>
              <p className="text-xl font-black text-amber-600 ">{formatNumberFa(lowStockCount)} کالا</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 ">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        
        {/* TAB 1: POS & Barcode Scanner */}
        {activeSubTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left/Middle: Barcode Scanner & Quick Shelf (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Barcode Fast Input Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-sm font-black text-slate-900 ">
                    اسکن بارکد / جستجوی کالا
                  </h2>
                </div>

                <form onSubmit={handleBarcodeSubmit} className="relative">
                  <Barcode className="w-6 h-6 absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="بارکد یا نام کالا را وارد کنید..."
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pr-14 pl-28 py-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                  />
                  <button
                    type="submit"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-white hover:bg-slate-100 :bg-indigo-500 text-white rounded-xl text-xs font-black shadow-sm transition-colors"
                  >
                    ثبت
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                  <span>آماده اسکن</span>
                  <span className="text-indigo-600 ">اینتر ↵</span>
                </div>
              </div>

              {/* Quick Shelf Catalog Filter */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      placeholder="جستجوی دستی کالا (مارلبرو، تیریا، ایکاس، سالت...)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-medium"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="all">همه دسته‌ها</option>
                    <option value="cigarettes">سیگارهای اورجینال</option>
                    <option value="iqos_devices">دستگاه‌های ایکاس</option>
                    <option value="iqos_heets">استیک‌های تیریا</option>
                    <option value="pods_vapes">پاد و سالت</option>
                    <option value="tobacco">توتون و سیگار برگ</option>
                    <option value="accessories">اکسسوری و فندک</option>
                  </select>
                </div>

                {/* Products Grid for Fast Touch/Click adding */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredPosProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleAddProductToPos(prod, prod.isBoxOnly ? 'box' : 'box')}
                      className="bg-slate-50 hover:bg-slate-50 border border-slate-200 hover:border-indigo-500/50 rounded-2xl p-3 cursor-pointer transition-all duration-150 flex flex-col justify-between group active:scale-95"
                    >
                      <div>
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-white mb-2 border border-slate-200/50">
                          <img
                            src={prod.image}
                            alt={prod.nameFa}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                          {prod.nameFa}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                          <span>{prod.brand}</span>
                          <span className="text-indigo-600">موجودی: {formatNumberFa(prod.stockCartons)}کارتن</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-600 font-mono">
                          {formatToman(prod.boxPrice)}
                        </span>
                        <button className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Active POS Register & Checkout (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl flex flex-col justify-between min-h-[640px]">
                
                {/* Header of Active Bill */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-sm font-black text-slate-900">فاکتور جاری صندوق فروش</h3>
                    </div>
                    {posCart.length > 0 && (
                      <button
                        onClick={() => setPosCart([])}
                        className="text-xs text-rose-600 hover:text-rose-600 flex items-center gap-1 font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>پاک کردن</span>
                      </button>
                    )}
                  </div>

                  {/* Customer Information Quick Bar */}
                  <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">نام خریدار</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">همراه (جهت پیامک)</label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="09..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Scanned Items List */}
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {posCart.length === 0 ? (
                      <div className="py-12 text-center text-slate-500">
                        <Barcode className="w-12 h-12 mx-auto mb-2 opacity-30 animate-pulse" />
                        <p className="text-xs font-bold">سبد خرید صندوق خالی است</p>
                        <p className="text-[11px] mt-1">بارکد کالا را با دستگاه بارکدخوان اسکن نمایید</p>
                      </div>
                    ) : (
                      posCart.map((item, idx) => (
                        <div
                          key={`${item.product.id}_${item.unit}_${idx}`}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.product.image}
                                alt={item.product.nameFa}
                                className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 leading-tight">
                                  {item.product.nameFa}
                                </h5>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  نرخ واحد: {formatToman(item.unitPrice)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemovePosItem(idx)}
                              className="text-slate-500 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                            {/* Unit Selector */}
                            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                              {!item.product.isBoxOnly && (
                                <button
                                  type="button"
                                  onClick={() => handleChangePosUnit(idx, 'carton')}
                                  className={`px-2 py-1 rounded ${item.unit === 'carton' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                                >
                                  کارتن
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleChangePosUnit(idx, 'box')}
                                className={`px-2 py-1 rounded ${item.unit === 'box' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                              >
                                باکس
                              </button>
                              <button
                                type="button"
                                onClick={() => handleChangePosUnit(idx, 'pack')}
                                className={`px-2 py-1 rounded ${item.unit === 'pack' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                              >
                                پاکت
                              </button>
                            </div>

                            {/* Quantity Stepper */}
                            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                              <button
                                onClick={() => handleUpdatePosQty(idx, 1)}
                                className="w-5 h-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                              <span className="text-xs font-mono font-bold text-slate-900 min-w-[20px] text-center">
                                {formatNumberFa(item.quantity)}
                              </span>
                              <button
                                onClick={() => handleUpdatePosQty(idx, -1)}
                                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                            </div>

                            {/* Subtotal */}
                            <span className="text-xs font-black text-emerald-600 font-mono">
                              {formatToman(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Checkout & Payment Options */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  
                  {/* Payment Method Tabs */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">روش پرداخت و تسویه:</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pos_terminal')}
                        className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 border transition-all ${
                          paymentMethod === 'pos_terminal'
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>کارتخوان</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 border transition-all ${
                          paymentMethod === 'cash'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        <span>نقدی</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cheque')}
                        className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 border transition-all ${
                          paymentMethod === 'cheque'
                            ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>چک صیادی</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('credit')}
                        className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 border transition-all ${
                          paymentMethod === 'credit'
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>نسیه/دفتر</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'pos_terminal' && (
                    <div>
                      <input
                        type="text"
                        value={terminalRef}
                        onChange={(e) => setTerminalRef(e.target.value)}
                        placeholder="شماره پیگیری یا ارجاع رسید کارتخوان (اختیاری)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Financial Totals */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>جمع ناخالص:</span>
                      <span className="font-mono">{formatToman(posSubtotal)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>تخفیف فروشگاه:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={posDiscount || ''}
                          onChange={(e) => setPosDiscount(Number(e.target.value) || 0)}
                          placeholder="۰"
                          className="w-24 bg-white border border-slate-200 rounded px-2 py-0.5 text-left font-mono text-xs text-emerald-600 focus:outline-none"
                        />
                        <span className="text-[10px]">تومان</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm font-black text-indigo-300 pt-2 border-t border-slate-200">
                      <span>مبلغ نهایی دریافتی:</span>
                      <span className="text-base font-mono text-emerald-600">{formatToman(posFinalTotal)}</span>
                    </div>
                  </div>

                  {/* Submit Sale Action Button */}
                  <button
                    onClick={handleFinalizePosSale}
                    disabled={posCart.length === 0}
                    className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>ثبت نهایی فروش و کسر از موجودی انبار</span>
                  </button>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Warehouse & Stock Inventory Control */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">مدیریت انبار مرکزی و کاردکس کالا</h2>
                  <p className="text-xs text-slate-500 mt-1">کنترل لحظه‌ای موجودی کارتن، باکس و ارزش ریالی دارایی‌های انبار سوین</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
                    ارزش کل انبار: {formatToman(totalInventoryValue)}
                  </span>
                </div>
              </div>

              {/* Table of Inventory */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <th className="p-3.5">تصویر</th>
                      <th className="p-3.5">نام کالا و مارک</th>
                      <th className="p-3.5">بارکد</th>
                      <th className="p-3.5 text-center">موجودی کارتن</th>
                      <th className="p-3.5 text-center">موجودی باکس</th>
                      <th className="p-3.5 text-left">نرخ کارتن</th>
                      <th className="p-3.5 text-left">ارزش کل موجودی</th>
                      <th className="p-3.5 text-center">وضعیت انبار</th>
                      <th className="p-3.5 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {productsList.map((prod) => {
                      const isLow = prod.stockCartons < 10;
                      const productTotalVal = prod.stockCartons * prod.cartonPrice;
                      return (
                        <tr key={prod.id} className="hover:bg-slate-100/50 transition-colors">
                          <td className="p-3">
                            <img
                              src={prod.image}
                              alt={prod.nameFa}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-200"
                            />
                          </td>
                          <td className="p-3">
                            <strong className="text-slate-900 text-xs">{prod.nameFa}</strong>
                            <div className="text-[10px] text-slate-500">{prod.brand} • {prod.origin}</div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-500">
                            {prod.barcode}
                          </td>
                          <td className="p-3 text-center font-bold font-mono text-sm text-indigo-300">
                            {formatNumberFa(prod.stockCartons)}
                          </td>
                          <td className="p-3 text-center font-mono text-slate-500">
                            {formatNumberFa(Math.round(prod.stockCartons * (prod.boxesPerCarton || 50)))}
                          </td>
                          <td className="p-3 text-left font-mono font-bold text-slate-800">
                            {prod.cartonPrice > 0 ? formatToman(prod.cartonPrice) : formatToman(prod.boxPrice)}
                          </td>
                          <td className="p-3 text-left font-mono font-black text-emerald-600">
                            {formatToman(productTotalVal)}
                          </td>
                          <td className="p-3 text-center">
                            {isLow ? (
                              <span className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center justify-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>کسری موجودی</span>
                              </span>
                            ) : (
                              <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                موجودی کافی
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedProductForAdjustment(prod);
                                setAdjustType('stock_in');
                                setAdjustQuantityCartons(5);
                              }}
                              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              ورود / اصلاح بار
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock Movement Audit Log */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-black text-slate-900 mb-4">گزارش کاردکس و گردش کالا در انبار</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {stockLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">هنوز هیچ لاگ ورود یا خروج باری ثبت نشده است.</p>
                ) : (
                  stockLogs.map((log) => (
                    <div key={log.id} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{log.productName}</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{log.date} • {log.note}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-black ${log.deltaCartons > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {log.deltaCartons > 0 ? `+${log.deltaCartons}` : log.deltaCartons} کارتن
                        </span>
                        <span className="text-[10px] bg-white px-2 py-1 rounded text-slate-500 font-mono">
                          مانده انبار: {log.finalStockCartons}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Sales Receipts & Invoices Ledger */}
        {activeSubTab === 'ledger' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">دفتر فاکتورهای فروش و تراکنش‌های صندوق</h2>
                  <p className="text-xs text-slate-500 mt-1">مشاهده فیش‌های صادر شده، چاپ مجدد و ریز اقلام مشتریان حضوری</p>
                </div>
              </div>

              {receiptsList.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold">هنوز فاکتور فروشی از صندوق صادر نشده است.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receiptsList.map((rcpt) => (
                    <div
                      key={rcpt.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 font-mono">{rcpt.receiptNumber}</span>
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded font-bold">
                            {rcpt.paymentMethod === 'pos_terminal' ? 'کارتخوان' : rcpt.paymentMethod === 'cash' ? 'نقدی' : rcpt.paymentMethod === 'cheque' ? 'چک' : 'نسیه'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          خریدار: <strong className="text-slate-800">{rcpt.customerName}</strong> • زمان ثبت: <span className="font-mono">{rcpt.createdAt}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          اقلام: {rcpt.items.map(i => `${i.product.nameFa} (${i.quantity} ${i.unit === 'carton' ? 'کارتن' : 'باکس'})`).join('، ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="text-[10px] text-slate-500 font-medium">مبلغ کل فاکتور</p>
                          <p className="text-sm font-black text-emerald-600 font-mono">{formatToman(rcpt.finalTotal)}</p>
                        </div>

                        <button
                          onClick={() => setActiveReceiptToPrint(rcpt)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                        >
                          <Printer className="w-4 h-4" />
                          <span>چاپ فیش</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Stock Adjustment Modal */}
      {selectedProductForAdjustment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">ورود یا اصلاح بار انبار</h3>
              <button onClick={() => setSelectedProductForAdjustment(null)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4 flex items-center gap-3">
              <img src={selectedProductForAdjustment.image} alt={selectedProductForAdjustment.nameFa} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{selectedProductForAdjustment.nameFa}</h4>
                <p className="text-[11px] text-indigo-600 font-mono mt-0.5">موجودی فعلی: {selectedProductForAdjustment.stockCartons} کارتن</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نوع عملیات انبارداری:</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="stock_in">📥 ورود بار جدید (افزایش موجودی انبار)</option>
                  <option value="damage">📦 ثبت ضایعات یا آسیب‌دیدگی بار (کاهش)</option>
                  <option value="adjustment">⚖️ اصلاح انبارگردانی (تعدیل)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">تعداد کارتن:</label>
                <input
                  type="number"
                  min="1"
                  value={adjustQuantityCartons}
                  onChange={(e) => setAdjustQuantityCartons(Number(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات و شماره بارنامه:</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="مثال: بارنامه شماره ۱۸۷۶۴ باربری وطن"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleSaveStockAdjustment}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg transition-colors mt-2"
              >
                ثبت تغییرات در کاردکس انبار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Thermal 80mm Receipt Modal for Printing */}
      {activeReceiptToPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            
            {/* 80mm Printable Receipt Box */}
            <style>{`
              @media print {
                body * { visibility: hidden; }
                #thermal-receipt, #thermal-receipt * { visibility: visible; }
                #thermal-receipt { 
                  position: absolute; 
                  left: 0; 
                  top: 0; 
                  width: 300px;
                  margin: 0;
                  padding: 10px;
                  box-shadow: none !important;
                }
              }
            `}</style>
            <div 
              id="thermal-receipt" 
              className="bg-white text-black p-4 mx-auto font-mono text-xs border border-slate-200 relative"
              style={{ 
                width: '320px', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                filter: 'grayscale(100%)' // Forces black and white
              }}
            >
              <div className="text-center border-b-[1.5px] border-dashed border-black pb-3 mb-3">
                <div className="font-black text-lg text-black mb-1">فروشگاه سوین</div>
                <div className="text-[11px] text-black/80 font-bold">فاکتور رسمی فروش و رسید مشتری</div>
                <div className="text-[10px] text-black/70 mt-1">تلفن پشتیبانی: ۰۹۱۲۰۷۵۹۴۱۹</div>
              </div>

              <div className="space-y-1.5 text-[11px] border-b-[1.5px] border-dashed border-black pb-3 mb-3 text-black font-bold">
                <div className="flex justify-between">
                  <span>شماره فیش:</span>
                  <span className="font-black">{activeReceiptToPrint.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاریخ و ساعت:</span>
                  <span>{activeReceiptToPrint.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>خریدار:</span>
                  <span>{activeReceiptToPrint.customerName || 'مشتری نقدی (عمومی)'}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-b-[1.5px] border-dashed border-black pb-3 mb-3">
                <table className="w-full text-right text-[11px] text-black font-bold">
                  <thead>
                    <tr className="border-b border-black/30">
                      <th className="pb-1">شرح کالا</th>
                      <th className="pb-1 text-center">تعداد</th>
                      <th className="pb-1 text-left">مبلغ(تومان)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReceiptToPrint.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-black/10">
                        <td className="py-1.5 leading-tight">{it.product.nameFa}</td>
                        <td className="py-1.5 text-center font-black">{it.quantity} {it.unit === 'carton' ? 'کارتن' : 'باکس'}</td>
                        <td className="py-1.5 text-left font-black">{formatToman(it.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-1.5 text-[11px] text-black font-bold">
                <div className="flex justify-between">
                  <span>جمع کل فاکتور:</span>
                  <span>{formatToman(activeReceiptToPrint.subtotal)}</span>
                </div>
                {activeReceiptToPrint.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>تخفیف:</span>
                    <span>-{formatToman(activeReceiptToPrint.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-black pt-2 mt-2 border-t-[1.5px] border-dashed border-black">
                  <span>قابل پرداخت:</span>
                  <span>{formatToman(activeReceiptToPrint.finalTotal)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-black/70 pt-2">
                  <span>نحوه تسویه:</span>
                  <span>{activeReceiptToPrint.paymentMethod === 'pos_terminal' ? 'کارتخوان' : 'نقدی'}</span>
                </div>
              </div>

              <div className="text-center pt-4 mt-4 border-t-[1.5px] border-dashed border-black text-[10px] font-bold text-black/80">
                <p>با سپاس از خرید شما</p>
                <p className="mt-1">اصالت کالا تضمین شده است</p>
                {/* Pseudo-Barcode for aesthetic */}
                <div className="mt-3 font-mono text-xl tracking-[0.2em] opacity-80">
                  |||||||||||||||||||||
                </div>
                <div className="text-[8px] mt-1 tracking-widest">{activeReceiptToPrint.receiptNumber}</div>
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ فیش حرارتی</span>
              </button>
              <button
                onClick={() => setActiveReceiptToPrint(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
              >
                بستن
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
