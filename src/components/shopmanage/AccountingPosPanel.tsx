import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  KeyRound, 
  LogOut, 
  User, 
  Phone, 
  Clock, 
  Sparkles, 
  Building2, 
  Receipt, 
  Volume2, 
  VolumeX, 
  X,
  Users,
  PieChart,
  FileText,
  BookOpen,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { CigaretteProduct, PosSaleItem, PosReceiptInvoice, StockAdjustmentLog, PosCustomer, PosLedgerTransaction } from '../../types';
import { formatToman, formatNumberFa, getProductStockInfo } from '../../utils/formatters';

interface AccountingPosPanelProps {
  products: CigaretteProduct[];
  onUpdateProductsStock?: (updatedProducts: CigaretteProduct[]) => void;
  onReturnToStore: () => void;
}

const AUTHORIZED_PHONE = '09120759419';
const VALID_PASSWORDS = ['alirezazzz9419@S', 'azarakhsh2025', '09120759419', 'admin1234'];

// Initial mock ledger customers
const INITIAL_LEDGER_CUSTOMERS: PosCustomer[] = [
  { id: 'cust_1', name: 'مغازه سوپرمارکت پارس (حسینی)', phone: '09121112233', createdAt: '1403/05/10', balance: 4500000 },
  { id: 'cust_2', name: 'فروشگاه سیگار و توتون ملل', phone: '09124445566', createdAt: '1403/05/12', balance: -1200000 },
  { id: 'cust_3', name: 'هایپرمارکت آریا (موسوی)', phone: '09127778899', createdAt: '1403/05/15', balance: 0 },
];

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

  // Active Sub Tab
  const [activeSubTab, setActiveSubTab] = useState<'pos' | 'inventory' | 'ledger' | 'customers' | 'reports' | 'django-docs'>('pos');

  // Products stock state
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
  const [selectedLedgerCustomerId, setSelectedLedgerCustomerId] = useState<string>('');
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'pos_terminal' | 'cash' | 'ledger'>('pos_terminal');
  const [terminalRef, setTerminalRef] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Ledger Customers state
  const [posCustomers, setPosCustomers] = useState<PosCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_customers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_LEDGER_CUSTOMERS;
  });

  // Ledger transactions history
  const [ledgerTransactions, setLedgerTransactions] = useState<PosLedgerTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('sovin_pos_ledger_txs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'tx_1', customerId: 'cust_1', date: '1403/06/01 10:30', amount: 4500000, type: 'debit', description: 'خرید نسیه فاکتور POS-20260801-1029' },
      { id: 'tx_2', customerId: 'cust_2', date: '1403/06/02 14:15', amount: 1200000, type: 'credit', description: 'دریافت پیش‌پرداخت نسیه' }
    ];
  });

  // New Customer Modal
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustInitialBalance, setNewCustInitialBalance] = useState<number>(0);

  // Record Payment for Customer Modal
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<PosCustomer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'credit' | 'debit'>('credit'); // credit = پرداخت مشتری (کاهش بدهی)
  const [paymentNote, setPaymentNote] = useState('');

  // Reports Date Filter State
  const [reportDateFilter, setReportDateFilter] = useState<'all' | 'today' | '7days'>('today');

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

  // Thermal receipt modal for printing
  const [activeReceiptToPrint, setActiveReceiptToPrint] = useState<PosReceiptInvoice | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Save state helpers
  useEffect(() => {
    try {
      localStorage.setItem('sovin_pos_customers', JSON.stringify(posCustomers));
    } catch {}
  }, [posCustomers]);

  useEffect(() => {
    try {
      localStorage.setItem('sovin_pos_ledger_txs', JSON.stringify(ledgerTransactions));
    } catch {}
  }, [ledgerTransactions]);

  // Focus barcode input on mount and on tab switch
  useEffect(() => {
    if (isAuthenticated && activeSubTab === 'pos') {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 200);
    }
  }, [isAuthenticated, activeSubTab]);

  // Audio bip feedback
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
      setLoginError('رمز عبور یا کلید ورود نادرست است.');
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
    const stockInfo = getProductStockInfo(product);
    if (!stockInfo.isAvailable) {
      alert(`کالای «${product.nameFa}» اتمام موجودی است.`);
      return;
    }

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

    const unitTitle = unit === 'carton' ? 'کارتن' : unit === 'box' ? 'باکس' : 'پاکت';
    setSuccessBanner(`«${product.nameFa}» (${unitTitle}) به فاکتور جاری اضافه شد.`);
    setTimeout(() => setSuccessBanner(null), 2500);
  };

  // Barcode input trigger on Enter / scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    const found = productsList.find(p => 
      p.barcode === query || 
      p.id.toLowerCase() === query.toLowerCase() ||
      p.barcode.endsWith(query)
    );

    if (found) {
      handleAddProductToPos(found, found.isBoxOnly ? 'box' : 'box');
      setBarcodeInput('');
    } else {
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

    if (paymentMethod === 'ledger' && !selectedLedgerCustomerId && !customerName) {
      alert('برای فروش حساب دفتری (نسیه)، انتخاب مشتری الزامی است.');
      return;
    }

    const now = new Date();
    const receiptNum = `POS-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const selectedCustObj = posCustomers.find(c => c.id === selectedLedgerCustomerId);
    const finalCustomerName = selectedCustObj ? selectedCustObj.name : (customerName.trim() || 'مشتری حضوری');

    const newReceipt: PosReceiptInvoice = {
      id: `rcpt_${Date.now()}`,
      receiptNumber: receiptNum,
      createdAt: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      customerName: finalCustomerName,
      customerPhone: selectedCustObj ? selectedCustObj.phone : (customerPhone.trim() || undefined),
      items: [...posCart],
      subtotal: posSubtotal,
      discountAmount: posDiscount,
      finalTotal: posFinalTotal,
      paymentMethod,
      terminalRefNumber: terminalRef.trim() || undefined,
      notes: orderNotes.trim() || undefined,
      cashier: 'صندوق‌دار مرکزی انبار سوین',
    };

    // Deduct stock from products cleanly
    const updatedProducts = productsList.map(p => {
      const soldItems = posCart.filter(item => item.product.id === p.id);
      if (soldItems.length === 0) return p;

      let cartonsToDeduct = 0;
      soldItems.forEach(si => {
        const boxesPerCarton = p.boxesPerCarton || 50;
        const packsPerBox = p.packsPerBox || 10;
        if (si.unit === 'carton') {
          cartonsToDeduct += si.quantity;
        } else if (si.unit === 'box') {
          cartonsToDeduct += (si.quantity / boxesPerCarton);
        } else if (si.unit === 'pack') {
          cartonsToDeduct += (si.quantity / (boxesPerCarton * packsPerBox));
        }
      });

      const newStock = Math.max(0, Math.round((p.stockCartons - cartonsToDeduct) * 100) / 100);
      return {
        ...p,
        stockCartons: newStock,
        isAvailable: newStock > 0,
      };
    });

    // Handle Ledger Account Update if Payment method is Ledger
    if (paymentMethod === 'ledger' && selectedCustObj) {
      const updatedCustomers = posCustomers.map(c => {
        if (c.id === selectedCustObj.id) {
          return { ...c, balance: c.balance + posFinalTotal };
        }
        return c;
      });
      setPosCustomers(updatedCustomers);

      const newLedgerTx: PosLedgerTransaction = {
        id: `tx_${Date.now()}`,
        customerId: selectedCustObj.id,
        date: newReceipt.createdAt,
        amount: posFinalTotal,
        type: 'debit',
        description: `فروش نسیه فاکتور ${receiptNum}`,
      };
      setLedgerTransactions(prev => [newLedgerTx, ...prev]);
    }

    // Save stock movement logs
    const newLogs: StockAdjustmentLog[] = posCart.map(item => ({
      id: `log_${Date.now()}_${Math.random()}`,
      productId: item.product.id,
      productName: item.product.nameFa,
      type: 'sale_pos',
      deltaCartons: item.unit === 'carton' 
        ? -item.quantity 
        : item.unit === 'box' 
          ? -Math.round((item.quantity / (item.product.boxesPerCarton || 50)) * 100) / 100
          : -Math.round((item.quantity / ((item.product.boxesPerCarton || 50) * 10)) * 100) / 100,
      deltaBoxes: item.unit === 'box' ? -item.quantity : 0,
      finalStockCartons: updatedProducts.find(p => p.id === item.product.id)?.stockCartons || 0,
      date: newReceipt.createdAt,
      note: `فاکتور فروش حضوری ${receiptNum} (${paymentMethod === 'pos_terminal' ? 'کارتخوان' : paymentMethod === 'cash' ? 'نقدی' : 'حساب دفتری'})`,
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
    setSelectedLedgerCustomerId('');
    setTerminalRef('');
    setOrderNotes('');
  };

  // Save new Customer Ledger
  const handleCreateNewCustomer = () => {
    if (!newCustName.trim()) return;
    const newCust: PosCustomer = {
      id: `cust_${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim() || '-',
      createdAt: new Date().toLocaleDateString('fa-IR'),
      balance: newCustInitialBalance || 0,
    };
    setPosCustomers(prev => [newCust, ...prev]);
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustInitialBalance(0);
  };

  // Record payment for customer ledger
  const handleSaveCustomerPayment = () => {
    if (!selectedCustomerForPayment || paymentAmount <= 0) return;

    const delta = paymentType === 'credit' ? -paymentAmount : paymentAmount; // credit reduces debt
    const updatedCustomers = posCustomers.map(c => {
      if (c.id !== selectedCustomerForPayment.id) return c;
      return { ...c, balance: c.balance + delta };
    });

    const now = new Date();
    const newTx: PosLedgerTransaction = {
      id: `tx_${Date.now()}`,
      customerId: selectedCustomerForPayment.id,
      date: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      amount: paymentAmount,
      type: paymentType,
      description: paymentNote || (paymentType === 'credit' ? 'دریافت وجه / تسویه نسیه' : 'ثبت بدهکاری جدید'),
    };

    setPosCustomers(updatedCustomers);
    setLedgerTransactions(prev => [newTx, ...prev]);
    setSelectedCustomerForPayment(null);
    setPaymentAmount(0);
    setPaymentNote('');
  };

  // Handle Manual Stock Adjustment
  const handleSaveStockAdjustment = () => {
    if (!selectedProductForAdjustment || adjustQuantityCartons <= 0) return;

    const delta = adjustType === 'stock_in' ? adjustQuantityCartons : -adjustQuantityCartons;
    const updatedProducts = productsList.map(p => {
      if (p.id !== selectedProductForAdjustment.id) return p;
      const newStock = Math.max(0, p.stockCartons + delta);
      return {
        ...p,
        stockCartons: newStock,
        isAvailable: newStock > 0,
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
      note: adjustNote || (adjustType === 'stock_in' ? 'ورود بار جدید به انبار' : 'اصلاح انبارگردانی'),
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

  const totalBoxesInStock = useMemo(() => {
    return productsList.reduce((sum, p) => sum + (p.stockCartons * (p.boxesPerCarton || 50)), 0);
  }, [productsList]);

  const totalPacksInStock = useMemo(() => {
    return productsList.reduce((sum, p) => sum + (p.stockCartons * (p.boxesPerCarton || 50) * (p.packsPerBox || 10)), 0);
  }, [productsList]);

  const lowStockCount = useMemo(() => {
    return productsList.filter(p => p.stockCartons < 5).length;
  }, [productsList]);

  const todaySalesTotal = useMemo(() => {
    return receiptsList.reduce((sum, r) => sum + r.finalTotal, 0);
  }, [receiptsList]);

  // Reports Summaries based on Date Filter
  const filteredReceiptsForReports = useMemo(() => {
    if (reportDateFilter === 'all') return receiptsList;
    const now = new Date();
    const todayStr = now.toLocaleDateString('fa-IR');
    if (reportDateFilter === 'today') {
      return receiptsList.filter(r => r.createdAt.includes(todayStr));
    }
    // last 7 days approximation
    return receiptsList;
  }, [receiptsList, reportDateFilter]);

  const reportMetrics = useMemo(() => {
    let totalSales = 0;
    let posTerminalSales = 0;
    let cashSales = 0;
    let ledgerSales = 0;
    let cartonsSold = 0;
    let boxesSold = 0;
    let packsSold = 0;

    filteredReceiptsForReports.forEach(r => {
      totalSales += r.finalTotal;
      if (r.paymentMethod === 'pos_terminal') posTerminalSales += r.finalTotal;
      else if (r.paymentMethod === 'cash') cashSales += r.finalTotal;
      else if (r.paymentMethod === 'ledger') ledgerSales += r.finalTotal;

      r.items.forEach(it => {
        if (it.unit === 'carton') cartonsSold += it.quantity;
        else if (it.unit === 'box') boxesSold += it.quantity;
        else if (it.unit === 'pack') packsSold += it.quantity;
      });
    });

    return {
      totalSales,
      posTerminalSales,
      cashSales,
      ledgerSales,
      cartonsSold,
      boxesSold,
      packsSold,
      count: filteredReceiptsForReports.length,
    };
  }, [filteredReceiptsForReports]);

  // Thermal Receipt Printing
  const handlePrintReceipt = () => {
    window.print();
  };

  // If Not Authenticated -> Show Executive Secure Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              سامانه حسابداری و صندوق فروشگاهی سوین
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              کنترل یکپارچه موجودی انبار، صندوق بارکدخوان POS و ثبت فاکتورهای فروش حضوری
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                شماره همراه مدیر فروشگاه / انباردار
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  dir="ltr"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="09120759419"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-3 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رمز عبور امنیتی
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-3 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
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

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <button
              onClick={onReturnToStore}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به کاتالوگ فروشگاه آنلاین سوین</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Main POS View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white print:hidden" dir="rtl">
      
      {/* Top Executive Navigation */}
      <header className="bg-white/95 print:hidden backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  پنل حسابداری و صندوق فروشگاهی سوین (POS)
                </h1>
                <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  آنلاین
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                مدیریت انبار مرکزی • کاربر: <strong className="text-indigo-600 font-mono">۰۹۱۲۰۷۵۹۴۱۹</strong>
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('pos')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
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
              onClick={() => setActiveSubTab('customers')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                activeSubTab === 'customers'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>حساب‌های دفتری (نسیه)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                activeSubTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>گزارشات فروش روزانه</span>
            </button>

            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                activeSubTab === 'ledger'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>دفتر فاکتورها ({receiptsList.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('django-docs')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                activeSubTab === 'django-docs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>مستندات Django</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'صدا فعال است' : 'صدا قطع است'}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-200 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={onReturnToStore}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">کاتالوگ فروشگاه</span>
            </button>

            <button
              onClick={handleLogout}
              title="خروج از پنل حسابداری"
              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
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

      {/* Main Content Area */}
      <main className="flex-1 print:hidden max-w-[1800px] w-full mx-auto p-4 sm:p-8">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: POS & Barcode Scanner */}
          {activeSubTab === 'pos' && (
            <motion.div 
              key="pos-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Left/Middle: Barcode Scanner & Quick Shelf (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Barcode Fast Input Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-sm font-black text-slate-900">
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
                      placeholder="بارکد یا نام کالا را اسکن یا تایپ کنید..."
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pr-14 pl-28 py-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                    />
                    <button
                      type="submit"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm transition-colors"
                    >
                      ثبت ↵
                    </button>
                  </form>
                </div>

                {/* Quick Shelf Catalog Filter */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={posSearch}
                        onChange={(e) => setPosSearch(e.target.value)}
                        placeholder="جستجوی سریع در شلف..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none font-medium"
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
                    {filteredPosProducts.map((prod) => {
                      const stockInfo = getProductStockInfo(prod);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleAddProductToPos(prod, prod.isBoxOnly ? 'box' : 'box')}
                          className={`bg-slate-50 hover:bg-blue-50/40 border border-slate-200 hover:border-indigo-400 rounded-2xl p-3 cursor-pointer transition-all duration-150 flex flex-col justify-between group active:scale-95 ${
                            !stockInfo.isAvailable ? 'opacity-50 grayscale' : ''
                          }`}
                        >
                          <div>
                            <div className="w-full h-24 rounded-xl overflow-hidden bg-white mb-2 border border-slate-200">
                              <img
                                src={prod.image}
                                alt={prod.nameFa}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                              {prod.nameFa}
                            </h4>
                            <div className="text-[10px] text-slate-500 mt-1 font-mono">
                              {stockInfo.isAvailable ? (
                                <span className="text-indigo-600 font-bold">{stockInfo.textSummary}</span>
                              ) : (
                                <span className="text-rose-600 font-bold">ناموجود</span>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-600 font-mono">
                              {formatToman(prod.boxPrice)}
                            </span>
                            <button className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right: Active POS Register & Checkout (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl flex flex-col justify-between min-h-[640px]">
                  
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
                          className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>پاک کردن</span>
                        </button>
                      )}
                    </div>

                    {/* Customer Selection / Ledger Customer Bar */}
                    <div className="mb-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>انتخاب خریدار / حساب دفتری:</span>
                        <button 
                          onClick={() => setActiveSubTab('customers')} 
                          className="text-indigo-600 hover:underline text-[11px] font-bold"
                        >
                          + مدیریت حساب‌ها
                        </button>
                      </div>

                      <select
                        value={selectedLedgerCustomerId}
                        onChange={(e) => {
                          setSelectedLedgerCustomerId(e.target.value);
                          const found = posCustomers.find(c => c.id === e.target.value);
                          if (found) {
                            setCustomerName(found.name);
                            setCustomerPhone(found.phone);
                          } else {
                            setCustomerName('مشتری حضوری فروشگاه');
                            setCustomerPhone('');
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- مشتری حضوری عمومی (نقدی) --</option>
                        {posCustomers.map(cust => (
                          <option key={cust.id} value={cust.id}>
                            {cust.name} ({cust.balance > 0 ? `بدهکار: ${formatToman(cust.balance)}` : cust.balance < 0 ? `بستانکار: ${formatToman(Math.abs(cust.balance))}` : 'تسویه'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Scanned Items List */}
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {posCart.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                          <Barcode className="w-12 h-12 mx-auto mb-2 opacity-30 animate-pulse text-indigo-500" />
                          <p className="text-xs font-bold text-slate-600">سبد خرید صندوق خالی است</p>
                          <p className="text-[11px] mt-1 text-slate-400">بارکد کالا را با دستگاه بارکدخوان اسکن نمایید</p>
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
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                              {/* Unit Selector (Carton, Box, Pack) */}
                              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                                {!item.product.isBoxOnly && (
                                  <button
                                    type="button"
                                    onClick={() => handleChangePosUnit(idx, 'carton')}
                                    className={`px-2 py-1 rounded ${item.unit === 'carton' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                                  >
                                    کارتن
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleChangePosUnit(idx, 'box')}
                                  className={`px-2 py-1 rounded ${item.unit === 'box' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                                >
                                  باکس
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleChangePosUnit(idx, 'pack')}
                                  className={`px-2 py-1 rounded ${item.unit === 'pack' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                                >
                                  پاکت
                                </button>
                              </div>

                              {/* Quantity Stepper */}
                              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                                <button
                                  onClick={() => handleUpdatePosQty(idx, 1)}
                                  className="w-5 h-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                                <span className="text-xs font-mono font-bold text-slate-900 min-w-[20px] text-center">
                                  {formatNumberFa(item.quantity)}
                                </span>
                                <button
                                  onClick={() => handleUpdatePosQty(idx, -1)}
                                  className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded flex items-center justify-center font-bold"
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
                    
                    {/* Payment Method Tabs (No Cheque, cleanly Cash, POS Terminal, Ledger) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5">روش پرداخت و تسویه:</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('pos_terminal')}
                          className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                            paymentMethod === 'pos_terminal'
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>کارتخوان</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cash')}
                          className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                            paymentMethod === 'cash'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Banknote className="w-4 h-4" />
                          <span>نقدی</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('ledger')}
                          className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                            paymentMethod === 'ledger'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <span>حساب دفتری (نسیه)</span>
                        </button>
                      </div>
                    </div>

                    {paymentMethod === 'pos_terminal' && (
                      <div>
                        <input
                          type="text"
                          value={terminalRef}
                          onChange={(e) => setTerminalRef(e.target.value)}
                          placeholder="شماره پیگیری کارتخوان (اختیاری)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {/* Financial Totals */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>جمع ناخالص:</span>
                        <span className="font-mono">{formatToman(posSubtotal)}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>تخفیف دستی:</span>
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

                      <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                        <span>مبلغ قابل پرداخت:</span>
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
                      <span>ثبت نهایی فاکتور و کسر از انبار</span>
                    </button>

                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: Warehouse Inventory & Stock Controls */}
          {activeSubTab === 'inventory' && (
            <motion.div 
              key="inventory-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5">
                  <span className="text-xs text-slate-500 font-bold">ارزش کل انبار</span>
                  <div className="text-lg font-black text-indigo-600 mt-1">{formatToman(totalInventoryValue)}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5">
                  <span className="text-xs text-slate-500 font-bold">کل موجودی (کارتن)</span>
                  <div className="text-lg font-black text-slate-900 mt-1">{formatNumberFa(totalCartonsInStock)} کارتن</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5">
                  <span className="text-xs text-slate-500 font-bold">معادل (باکس / پاکت)</span>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    {formatNumberFa(totalBoxesInStock)} باکس / {formatNumberFa(totalPacksInStock)} پاکت
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-5">
                  <span className="text-xs text-slate-500 font-bold">اقلام رو به اتمام</span>
                  <div className="text-lg font-black text-amber-600 mt-1">{formatNumberFa(lowStockCount)} کالا</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">جدول کامل موجودی انبار به تفکیک ۳ واحد</h2>
                    <p className="text-xs text-slate-500 mt-1">نمایش دقیق تعداد کارتن، باکس و پاکت و ثبت ورود بار جدید</p>
                  </div>
                </div>

                {/* Table of Inventory */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-3">تصویر</th>
                        <th className="p-3">نام کالا</th>
                        <th className="p-3 text-center">کارتن</th>
                        <th className="p-3 text-center">باکس</th>
                        <th className="p-3 text-center">پاکت</th>
                        <th className="p-3 text-left">قیمت کارتن</th>
                        <th className="p-3 text-left">ارزش ریالی انبار</th>
                        <th className="p-3 text-center">وضعیت</th>
                        <th className="p-3 text-center">عملیات انبار</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {productsList.map((prod) => {
                        const stockInfo = getProductStockInfo(prod);
                        const productTotalVal = prod.stockCartons * prod.cartonPrice;
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <img
                                src={prod.image}
                                alt={prod.nameFa}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-200"
                              />
                            </td>
                            <td className="p-3">
                              <strong className="text-slate-900 text-xs">{prod.nameFa}</strong>
                              <div className="text-[10px] text-slate-500">{prod.brand} • بارکد: {prod.barcode}</div>
                            </td>
                            <td className="p-3 text-center font-bold font-mono text-sm text-indigo-600">
                              {formatNumberFa(stockInfo.cartons)}
                            </td>
                            <td className="p-3 text-center font-mono text-slate-800">
                              {formatNumberFa(stockInfo.totalBoxes)}
                            </td>
                            <td className="p-3 text-center font-mono text-slate-600">
                              {formatNumberFa(stockInfo.totalPacks)}
                            </td>
                            <td className="p-3 text-left font-mono font-bold text-slate-800">
                              {formatToman(prod.cartonPrice)}
                            </td>
                            <td className="p-3 text-left font-mono font-black text-emerald-600">
                              {formatToman(productTotalVal)}
                            </td>
                            <td className="p-3 text-center">
                              {stockInfo.isAvailable ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  موجود ({formatNumberFa(stockInfo.cartons)} کارتن)
                                </span>
                              ) : (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  اتمام موجودی
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedProductForAdjustment(prod);
                                  setAdjustType('stock_in');
                                  setAdjustQuantityCartons(2);
                                }}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold transition-colors border border-indigo-200"
                              >
                                + شارژ انبار
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
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-4">گزارش کاردکس و گردش کالا در انبار</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {stockLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">هنوز هیچ لاگ ورود یا خروج باری ثبت نشده است.</p>
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
                          <span className="text-[10px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 font-mono">
                            مانده: {log.finalStockCartons} کارتن
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 3: Ledger Accounts & Credit Customers */}
          {activeSubTab === 'customers' && (
            <motion.div
              key="customers-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">مدیریت حساب‌های دفتری و بدهکاران / بستانکاران</h2>
                    <p className="text-xs text-slate-500 mt-1">ثبت مشتریان نسیه، مانده بدهی و دریافت وجه تسویه حساب</p>
                  </div>
                  <button
                    onClick={() => setShowNewCustomerModal(true)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Users className="w-4 h-4" />
                    <span>+ تعریف مشتری دفتری جدید</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {posCustomers.map(cust => (
                    <div key={cust.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-black text-sm text-slate-900">{cust.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{cust.phone}</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-2">تاریخ افتتاح حساب: {cust.createdAt}</div>
                        <div className="text-xs">
                          وضعیت حساب: {' '}
                          <strong className={cust.balance > 0 ? 'text-rose-600' : cust.balance < 0 ? 'text-emerald-600' : 'text-slate-600'}>
                            {cust.balance > 0 ? `بدهکار (${formatToman(cust.balance)})` : cust.balance < 0 ? `بستانکار (${formatToman(Math.abs(cust.balance))})` : 'تسویه کامل'}
                          </strong>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedCustomerForPayment(cust);
                            setPaymentAmount(Math.abs(cust.balance));
                            setPaymentType('credit');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                        >
                          ثبت دریافت وجه (تسویه)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ledger Transactions Audit History */}
                <h3 className="text-sm font-black text-slate-900 mb-3">ریز گردش حساب‌های دفتری</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {ledgerTransactions.map(tx => {
                    const cust = posCustomers.find(c => c.id === tx.customerId);
                    return (
                      <div key={tx.id} className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{cust?.name || 'مشتری دفتری'}</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">{tx.date} • {tx.description}</p>
                        </div>
                        <span className={`font-mono font-black ${tx.type === 'debit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {tx.type === 'debit' ? `+${formatToman(tx.amount)} (بدهکاری)` : `-${formatToman(tx.amount)} (واریزی)`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Daily Sales Reports */}
          {activeSubTab === 'reports' && (
            <motion.div
              key="reports-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">گزارش جامع فروش صندوق بر اساس تفکیک تاریخ و روش تسویه</h2>
                    <p className="text-xs text-slate-500 mt-1">جمع آمار فروش کارتخوان، نقدی و دفتری و تعداد واحدهای فروش رفته</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setReportDateFilter('today')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${reportDateFilter === 'today' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                    >
                      فروش امروز
                    </button>
                    <button
                      onClick={() => setReportDateFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${reportDateFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                    >
                      کل فاکتورها ({receiptsList.length})
                    </button>
                  </div>
                </div>

                {/* Metric Summary Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <span className="text-xs text-slate-500 font-bold">مجموع کل فروش</span>
                    <div className="text-xl font-black text-indigo-600 mt-1">{formatToman(reportMetrics.totalSales)}</div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">تعداد فاکتورها: {reportMetrics.count}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <span className="text-xs text-slate-500 font-bold">فروش با دستگاه کارتخوان</span>
                    <div className="text-xl font-black text-blue-600 mt-1">{formatToman(reportMetrics.posTerminalSales)}</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <span className="text-xs text-slate-500 font-bold">فروش نقدی (وجه نقد)</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">{formatToman(reportMetrics.cashSales)}</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <span className="text-xs text-slate-500 font-bold">فروش حساب دفتری (نسیه)</span>
                    <div className="text-xl font-black text-purple-600 mt-1">{formatToman(reportMetrics.ledgerSales)}</div>
                  </div>
                </div>

                {/* Units Sold Breakdown */}
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl mb-6">
                  <h4 className="text-xs font-bold text-indigo-900 mb-2">تعداد کل واحدهای خارج شده از انبار:</h4>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono font-bold">
                    <div className="bg-white p-3 rounded-xl border border-indigo-200">
                      <span className="text-slate-500 text-[10px] block">کارتن‌های فروخته شده</span>
                      <span className="text-indigo-700 text-lg">{formatNumberFa(reportMetrics.cartonsSold)} کارتن</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-200">
                      <span className="text-slate-500 text-[10px] block">باکس‌های فروخته شده</span>
                      <span className="text-slate-900 text-lg">{formatNumberFa(reportMetrics.boxesSold)} باکس</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-200">
                      <span className="text-slate-500 text-[10px] block">پاکت‌های فروخته شده</span>
                      <span className="text-emerald-700 text-lg">{formatNumberFa(reportMetrics.packsSold)} پاکت</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 5: Sales Receipts Ledger & Print */}
          {activeSubTab === 'ledger' && (
            <motion.div
              key="ledger-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">دفتر فاکتورهای فروش و تراکنش‌های صندوق</h2>
                    <p className="text-xs text-slate-500 mt-1">مشاهده فیش‌های صادر شده، چاپ مجدد فیش حرارتی 80mm و ریز اقلام مشتریان</p>
                  </div>
                </div>

                {receiptsList.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold">هنوز فاکتور فروشی از صندوق صادر نشده است.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receiptsList.map((rcpt) => (
                      <div
                        key={rcpt.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-400 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 font-mono">{rcpt.receiptNumber}</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                              {rcpt.paymentMethod === 'pos_terminal' ? 'کارتخوان' : rcpt.paymentMethod === 'cash' ? 'نقدی' : 'حساب دفتری'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            خریدار: <strong className="text-slate-800">{rcpt.customerName}</strong> • زمان ثبت: <span className="font-mono">{rcpt.createdAt}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            اقلام: {rcpt.items.map(i => `${i.product.nameFa} (${i.quantity} ${i.unit === 'carton' ? 'کارتن' : i.unit === 'box' ? 'باکس' : 'پاکت'})`).join('، ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <p className="text-[10px] text-slate-500 font-medium">مبلغ کل فاکتور</p>
                            <p className="text-sm font-black text-emerald-600 font-mono">{formatToman(rcpt.finalTotal)}</p>
                          </div>

                          <button
                            onClick={() => setActiveReceiptToPrint(rcpt)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
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
            </motion.div>
          )}

          {/* TAB 6: Django API & Documentation */}
          {activeSubTab === 'django-docs' && (
            <motion.div
              key="django-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    Py
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">مستندات کامل Django REST Framework برای صندوق و انبار سوین</h2>
                    <p className="text-xs text-slate-500">کدهای آماده Python/Django جهت اتصال مستقیم محصولات، بارکد، موجودی انبار و دفتر حساب‌ها</p>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-4 text-left" dir="ltr">
                  <div>
                    <span className="text-emerald-400 font-bold"># 1. models.py (Django Models for POS & Inventory)</span>
                    <pre className="mt-2 text-slate-300 leading-relaxed">{`from django.db import models

class Product(models.Model):
    name_fa = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255)
    brand = models.CharField(max_length=100)
    barcode = models.CharField(max_length=100, unique=True)
    carton_price = models.BigIntegerField() # Toman
    box_price = models.BigIntegerField()
    boxes_per_carton = models.IntegerField(default=50)
    packs_per_box = models.IntegerField(default=10)
    stock_cartons = models.FloatField(default=0.0) # Allows decimal stock e.g. 1.5 cartons
    is_available = models.BooleanField(default=True)

    @property
    def total_boxes(self):
        return int(self.stock_cartons * self.boxes_per_carton)

    @property
    def total_packs(self):
        return int(self.total_boxes * self.packs_per_box)

class PosReceipt(models.Model):
    PAYMENT_CHOICES = [
        ('pos_terminal', 'کارتخوان'),
        ('cash', 'نقدی'),
        ('ledger', 'حساب دفتری/نسیه'),
    ]
    receipt_number = models.CharField(max_length=50, unique=True)
    customer_name = models.CharField(max_length=150, default='مشتری حضوری')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    subtotal = models.BigIntegerField()
    discount = models.BigIntegerField(default=0)
    final_total = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

class PosSaleItem(models.Model):
    receipt = models.ForeignKey(PosReceipt, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    unit = models.CharField(max_length=10) # 'carton', 'box', 'pack'
    quantity = models.IntegerField()
    unit_price = models.BigIntegerField()
    total_price = models.BigIntegerField()
`}</pre>
                  </div>

                  <div>
                    <span className="text-emerald-400 font-bold"># 2. views.py (DRF Viewsets for POS & Stock Auto-Deduction)</span>
                    <pre className="mt-2 text-slate-300 leading-relaxed">{`from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

class PosReceiptViewSet(viewsets.ModelViewSet):
    queryset = PosReceipt.objects.all()
    serializer_class = PosReceiptSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        items_data = data.get('items', [])
        
        # Deduct Stock
        for item in items_data:
            product = Product.objects.get(id=item['product_id'])
            unit = item['unit']
            qty = item['quantity']
            
            if unit == 'carton':
                deduct = qty
            elif unit == 'box':
                deduct = qty / product.boxes_per_carton
            elif unit == 'pack':
                deduct = qty / (product.boxes_per_carton * product.packs_per_box)
            
            product.stock_cartons = max(0, product.stock_cartons - deduct)
            product.is_available = product.stock_cartons > 0
            product.save()

        return super().create(request, *args, **kwargs)
`}</pre>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Stock Adjustment Modal */}
      {selectedProductForAdjustment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">ورود یا اصلاح بار انبار</h3>
              <button onClick={() => setSelectedProductForAdjustment(null)} className="text-slate-400 hover:text-slate-900">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-bold"
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
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg transition-colors mt-2"
              >
                ثبت تغییرات در انبار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">تعریف مشتری دفتری جدید</h3>
              <button onClick={() => setShowNewCustomerModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نام و نام خانوادگی / نام مغازه:</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="مثال: فروشگاه سیگار ملل"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">شماره همراه:</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="0912..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">مانده بدهی اولیه (تومان):</label>
                <input
                  type="number"
                  value={newCustInitialBalance || ''}
                  onChange={(e) => setNewCustInitialBalance(Number(e.target.value) || 0)}
                  placeholder="۰"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleCreateNewCustomer}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg transition-colors mt-2"
              >
                ثبت مشتری در حساب‌های دفتری
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Record Payment Modal */}
      {selectedCustomerForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">ثبت دریافت وجه / تسویه مشتری دفتری</h3>
              <button onClick={() => setSelectedCustomerForPayment(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4">
              <h4 className="text-xs font-bold text-slate-900">{selectedCustomerForPayment.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                مانده فعلی: <strong className="text-rose-600">{formatToman(selectedCustomerForPayment.balance)}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نوع تراکنش:</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-bold"
                >
                  <option value="credit">📥 دریافت وجه از مشتری (کاهش بدهی)</option>
                  <option value="debit">📤 اضافه کردن بدهکاری جدید (افزایش بدهی)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ پرداختی (تومان):</label>
                <input
                  type="number"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                  placeholder="۰"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات و شماره پیگیری:</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="مثال: واریزی کارت به کارت به حساب فروشگاه"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleSaveCustomerPayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg transition-colors mt-2"
              >
                ثبت تراکنش در دفتر حساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Thermal 80mm Receipt Modal for Printing */}
      {activeReceiptToPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl print:shadow-none print:border-none print:w-full print:max-w-none print:p-0">
            
            {/* 80mm Printable Receipt Box CSS */}
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
                filter: 'grayscale(100%)'
              }}
            >
              <div className="text-center border-b-[1.5px] border-dashed border-black pb-3 mb-3">
                <div className="font-black text-lg text-black mb-1">پخش سیگار سوین</div>
                <div className="text-[11px] text-black/80 font-bold">فاکتور فروش و رسید فیش حرارتی</div>
                <div className="text-[10px] text-black/70 mt-1">پشتیبانی انبار: ۰۹۱۲۰۷۵۹۴۱۹</div>
              </div>

              <div className="space-y-1 text-[11px] border-b-[1.5px] border-dashed border-black pb-3 mb-3 text-black font-bold">
                <div className="flex justify-between">
                  <span>شماره فیش:</span>
                  <span className="font-black">{activeReceiptToPrint.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاریخ:</span>
                  <span>{activeReceiptToPrint.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>خریدار:</span>
                  <span>{activeReceiptToPrint.customerName || 'مشتری حضوری'}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-b-[1.5px] border-dashed border-black pb-3 mb-3">
                <table className="w-full table-fixed text-right text-[11px] text-black font-bold">
                  <thead>
                    <tr className="border-b border-black/30">
                      <th className="pb-1 text-right w-[45%]">شرح کالا</th>
                      <th className="pb-1 text-center w-[25%]">تعداد</th>
                      <th className="pb-1 text-left w-[30%]">مبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReceiptToPrint.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-black/10">
                        <td className="py-1 pl-1 leading-tight text-right">{it.product.nameFa}</td>
                        <td className="py-1 text-center font-black whitespace-nowrap">{it.quantity} {it.unit === 'carton' ? 'کارتن' : it.unit === 'box' ? 'باکس' : 'پاکت'}</td>
                        <td className="py-1 text-left font-black whitespace-nowrap">{formatNumberFa(it.totalPrice)}</td>
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
                  <span>مبلغ پرداختی:</span>
                  <span>{formatToman(activeReceiptToPrint.finalTotal)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-black/70 pt-2">
                  <span>روش تسویه:</span>
                  <span>{activeReceiptToPrint.paymentMethod === 'pos_terminal' ? 'کارتخوان' : activeReceiptToPrint.paymentMethod === 'cash' ? 'نقدی' : 'حساب دفتری (نسیه)'}</span>
                </div>
              </div>

              <div className="text-center pt-4 mt-4 border-t-[1.5px] border-dashed border-black text-[10px] font-bold text-black/80">
                <p>با سپاس از خرید شما از پخش سوین</p>
                <div className="mt-3 font-mono text-xl tracking-[0.2em] opacity-80">
                  |||||||||||||||||||||
                </div>
                <div className="text-[8px] mt-1 tracking-widest">{activeReceiptToPrint.receiptNumber}</div>
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="mt-4 flex items-center gap-2 print:hidden">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ رسید حرارتی</span>
              </button>
              <button
                onClick={() => setActiveReceiptToPrint(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
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
