import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  CreditCard,
  Truck,
  User,
  Phone,
  MapPin,
  Store,
  Printer,
  FileText,
  AlertCircle,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  ZoomIn,
  RefreshCw,
  Package,
  Layers,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Building,
  DollarSign,
  Download,
  ZoomOut,
  Upload,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import { OrderInvoice, PosReceiptInvoice, CigaretteProduct } from '../../types';
import { formatToman, formatNumberFa } from '../../utils/formatters';
import { generateBankReceiptSvg, getOrderReceiptImage } from '../../utils/receiptGenerator';

interface OnlineOrdersManagementProps {
  onReturnToPos?: () => void;
  staffName?: string;
}

export const OnlineOrdersManagement: React.FC<OnlineOrdersManagementProps> = ({
  onReturnToPos,
  staffName = 'متصدی صندوق و انبار'
}) => {
  const [orders, setOrders] = useState<OrderInvoice[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderInvoice | null>(null);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<OrderInvoice | null>(null);
  const [isReceiptFullscreen, setIsReceiptFullscreen] = useState<boolean>(false);
  const [receiptZoomLevel, setReceiptZoomLevel] = useState<number>(1);
  
  // Modals & Action States
  const [approveConfirmOrder, setApproveConfirmOrder] = useState<OrderInvoice | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<OrderInvoice | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [shippingModalOrder, setShippingModalOrder] = useState<OrderInvoice | null>(null);
  const [shippingCodeInput, setShippingCodeInput] = useState<string>('');
  const [courierNameInput, setCourierNameInput] = useState<string>('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'shipped' | 'cancelled'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'bank_transfer' | 'wallet'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load orders from localStorage and listen to global sync events
  const loadOrders = () => {
    try {
      const stored = localStorage.getItem('sevin_orders');
      if (stored) {
        let parsed: OrderInvoice[] = JSON.parse(stored);
        let updated = false;
        // Ensure every bank transfer order has a valid receipt image
        parsed = parsed.map(ord => {
          const isBank = ord.paymentStatus === 'واریز شده و ثبت فیش' || !ord.paymentStatus?.includes('کیف پول');
          if (isBank && (!ord.receiptImage || ord.receiptImage.trim() === '')) {
            updated = true;
            return {
              ...ord,
              receiptImage: generateBankReceiptSvg(ord)
            };
          }
          return ord;
        });

        if (updated) {
          localStorage.setItem('sevin_orders', JSON.stringify(parsed));
        }

        setOrders(parsed);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Error loading orders:', e);
    }
  };

  const handleUploadReceiptForOrder = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && viewingReceiptOrder) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const updated = orders.map(ord => 
          ord.orderId === viewingReceiptOrder.orderId ? { ...ord, receiptImage: base64 } : ord
        );
        saveOrders(updated);
        const updatedOrder = { ...viewingReceiptOrder, receiptImage: base64 };
        setViewingReceiptOrder(updatedOrder);
        if (selectedOrder && selectedOrder.orderId === viewingReceiptOrder.orderId) {
          setSelectedOrder(updatedOrder);
        }
        showToast('تصویر فیش با موفقیت برای این سفارش بارگذاری و ذخیره شد');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    loadOrders();
    const handleSync = () => loadOrders();
    window.addEventListener('sevin_orders_updated', handleSync);
    window.addEventListener('storage', handleSync);

    // Close modals on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isReceiptFullscreen) {
          setIsReceiptFullscreen(false);
          return;
        }
        setViewingReceiptOrder(null);
        setSelectedOrder(null);
        setApproveConfirmOrder(null);
        setRejectModalOrder(null);
        setRejectReason('');
        setShippingModalOrder(null);
        setShippingCodeInput('');
        setCourierNameInput('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('sevin_orders_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const saveOrders = (updatedOrders: OrderInvoice[]) => {
    try {
      localStorage.setItem('sevin_orders', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      window.dispatchEvent(new Event('sevin_orders_updated'));
    } catch (e) {
      console.error('Error saving orders:', e);
    }
  };

  // Helper to get normalized order status
  const getOrderStatusKey = (order: OrderInvoice): 'pending' | 'approved' | 'shipped' | 'cancelled' => {
    if (order.orderStatus === 'cancelled') return 'cancelled';
    if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') return 'shipped';
    if (order.orderStatus === 'approved') return 'approved';
    if (order.paymentStatus === 'پرداخت شده از کیف پول') return 'approved';
    return 'pending';
  };

  // Counts for summary metrics
  const stats = useMemo(() => {
    let pendingCount = 0;
    let approvedCount = 0;
    let shippedCount = 0;
    let cancelledCount = 0;
    let totalRevenue = 0;

    orders.forEach(o => {
      const st = getOrderStatusKey(o);
      if (st === 'pending') pendingCount++;
      else if (st === 'approved') {
        approvedCount++;
        totalRevenue += o.finalTotal || 0;
      } else if (st === 'shipped') {
        shippedCount++;
        totalRevenue += o.finalTotal || 0;
      } else if (st === 'cancelled') {
        cancelledCount++;
      }
    });

    return {
      total: orders.length,
      pending: pendingCount,
      approved: approvedCount,
      shipped: shippedCount,
      cancelled: cancelledCount,
      totalRevenue
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status Filter
      if (statusFilter !== 'all') {
        const orderSt = getOrderStatusKey(order);
        if (orderSt !== statusFilter) return false;
      }

      // Payment Filter
      if (paymentFilter === 'bank_transfer') {
        if (!order.paymentStatus.includes('فیش') && !order.receiptImage && !order.bankRefCode) {
          return false;
        }
      } else if (paymentFilter === 'wallet') {
        if (!order.paymentStatus.includes('کیف پول')) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTracking = (order.trackingCode || order.orderId || '').toLowerCase().includes(q);
        const matchName = (order.customer.shopOwnerName || '').toLowerCase().includes(q);
        const matchShop = (order.customer.shopName || '').toLowerCase().includes(q);
        const matchPhone = (order.customer.shopPhone || '').includes(q);
        const matchBankRef = (order.bankRefCode || '').includes(q);
        const matchItem = order.items.some(i => i.product.nameFa.toLowerCase().includes(q) || i.product.brand.toLowerCase().includes(q));

        if (!matchTracking && !matchName && !matchShop && !matchPhone && !matchBankRef && !matchItem) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, paymentFilter, searchQuery]);

  // Handler: Approve order & register in POS receipts and reduce stock
  const handleApproveOrder = (order: OrderInvoice) => {
    const nowFa = `${new Date().toLocaleDateString('fa-IR')} ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    const posRcptNumber = `POS-ONLINE-${Date.now().toString().slice(-6)}`;

    // 1. Create a corresponding POS receipt invoice so it appears in daily sales and financial reports
    try {
      const storedReceipts = localStorage.getItem('sovin_pos_receipts');
      const receipts: PosReceiptInvoice[] = storedReceipts ? JSON.parse(storedReceipts) : [];

      const newReceipt: PosReceiptInvoice = {
        id: `rcpt_online_${Date.now()}`,
        receiptNumber: posRcptNumber,
        createdAt: nowFa,
        customerName: `${order.customer.shopOwnerName} (${order.customer.shopName || 'سفارش آنلاین'})`,
        customerPhone: order.customer.shopPhone,
        customerAddress: order.customer.address,
        items: order.items.map(it => {
          const unit: 'carton' | 'box' | 'pack' = it.unit === 'pack' ? 'pack' : it.unit === 'box' ? 'box' : 'carton';
          return {
            product: it.product,
            unit,
            quantity: it.quantity,
            unitPrice: it.unit === 'carton' ? it.product.cartonPrice : it.product.boxPrice,
            totalPrice: (it.unit === 'carton' ? it.product.cartonPrice : it.product.boxPrice) * it.quantity
          };
        }),
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        finalTotal: order.finalTotal,
        paymentMethod: order.paymentStatus.includes('کیف پول') ? 'ledger' : 'pos_terminal',
        terminalRefNumber: order.bankRefCode || order.trackingCode,
        notes: `تایید سفارش آنلاین مشتری با کد رهگیری ${order.trackingCode} | متصدی: ${staffName}`,
        cashier: staffName
      };

      receipts.unshift(newReceipt);
      localStorage.setItem('sovin_pos_receipts', JSON.stringify(receipts));
      window.dispatchEvent(new Event('sovin_pos_data_change'));
    } catch (e) {
      console.error('Error syncing online order to POS receipts:', e);
    }

    // 2. Deduct product inventory stock
    try {
      const storedProducts = localStorage.getItem('sevin_products_data');
      if (storedProducts) {
        const products: CigaretteProduct[] = JSON.parse(storedProducts);
        let changed = false;

        order.items.forEach(item => {
          const p = products.find(prod => prod.id === item.product.id);
          if (p) {
            if (item.unit === 'carton') {
              p.stockCartons = Math.max(0, (p.stockCartons || 0) - item.quantity);
              changed = true;
            } else if (item.unit === 'box') {
              const boxesPerCarton = p.boxesPerCarton || 50;
              const cartonsEquivalent = item.quantity / boxesPerCarton;
              p.stockCartons = Math.max(0, (p.stockCartons || 0) - Math.ceil(cartonsEquivalent));
              changed = true;
            }
          }
        });

        if (changed) {
          localStorage.setItem('sevin_products_data', JSON.stringify(products));
          window.dispatchEvent(new Event('sovin_stock_data_change'));
        }
      }
    } catch (e) {
      console.error('Error reducing inventory:', e);
    }

    // 3. Update order in sevin_orders
    const updated = orders.map(o => {
      if (o.orderId === order.orderId || o.trackingCode === order.trackingCode) {
        return {
          ...o,
          orderStatus: 'approved' as const,
          paymentStatus: 'واریز شده و ثبت فیش' as const,
          approvedAt: nowFa,
          approvedBy: staffName,
          posReceiptNumber: posRcptNumber
        };
      }
      return o;
    });

    saveOrders(updated);
    setApproveConfirmOrder(null);
    if (selectedOrder && (selectedOrder.orderId === order.orderId)) {
      setSelectedOrder(prev => prev ? { ...prev, orderStatus: 'approved', approvedAt: nowFa, approvedBy: staffName, posReceiptNumber: posRcptNumber } : null);
    }
    showToast(`سفارش «${order.customer.shopOwnerName}» با موفقیت تایید و فاکتور فروش در صندوق ثبت گردید.`);
  };

  // Handler: Reject order
  const handleRejectOrder = () => {
    if (!rejectModalOrder) return;
    const nowFa = `${new Date().toLocaleDateString('fa-IR')} ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    const reasonText = rejectReason.trim() || 'عدم تأیید فیش واریزی یا اتمام موجودی';

    const updated = orders.map(o => {
      if (o.orderId === rejectModalOrder.orderId || o.trackingCode === rejectModalOrder.trackingCode) {
        return {
          ...o,
          orderStatus: 'cancelled' as const,
          rejectionReason: reasonText,
          approvedAt: nowFa,
          approvedBy: staffName
        };
      }
      return o;
    });

    saveOrders(updated);
    setRejectModalOrder(null);
    setRejectReason('');
    if (selectedOrder && selectedOrder.orderId === rejectModalOrder.orderId) {
      setSelectedOrder(prev => prev ? { ...prev, orderStatus: 'cancelled', rejectionReason: reasonText } : null);
    }
    showToast(`سفارش با کد پیگیری «${rejectModalOrder.trackingCode}» لغو گردید.`);
  };

  // Handler: Submit shipping dispatch
  const handleShippingSubmit = () => {
    if (!shippingModalOrder) return;
    const nowFa = `${new Date().toLocaleDateString('fa-IR')} ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;

    const updated = orders.map(o => {
      if (o.orderId === shippingModalOrder.orderId || o.trackingCode === shippingModalOrder.trackingCode) {
        return {
          ...o,
          orderStatus: 'shipped' as const,
          shippingTrackingNumber: shippingCodeInput.trim() || undefined,
          shippingCourier: courierNameInput.trim() || undefined,
          trackingInfo: {
            orderId: o.orderId,
            trackingCode: shippingCodeInput.trim() || o.trackingCode || `TRK-${Date.now().toString().slice(-6)}`,
            createdAt: o.createdAt,
            updatedAt: nowFa,
            customerName: o.customer.shopOwnerName,
            customerPhone: o.customer.shopPhone,
            customerCity: o.customer.city || 'تهران',
            customerAddress: o.customer.address,
            totalCartons: o.totalCartons,
            totalBoxes: o.totalBoxes,
            finalTotal: o.finalTotal,
            status: 'dispatched_freight' as const,
            statusFa: 'تحویل باربری و ارسال شده',
            dispatchType: 'freight_company' as const,
            dispatchTypeFa: 'بارنامه باربری',
            freightCompanyName: courierNameInput.trim() || 'ناوگان باربری سرو',
            freightBillNumber: shippingCodeInput.trim(),
            estimatedDelivery: '۱ الی ۲ روز کاری',
            itemsSummary: o.items.map(i => `${i.product.nameFa} (${i.quantity} ${i.unit === 'carton' ? 'کارتن' : 'باکس'})`).join('، '),
            timeline: [
              {
                step: 1,
                title: 'تایید انبار مرکزی',
                time: o.approvedAt || nowFa,
                isCompleted: true,
                isCurrent: false,
                description: 'سفارش بررسی و تایید شد.'
              },
              {
                step: 2,
                title: 'بسته‌بندی و صدور بارنامه',
                time: nowFa,
                isCompleted: true,
                isCurrent: false,
                description: `بارنامه به شماره ${shippingCodeInput.trim() || 'ثبت شده'} صادر گردید.`
              },
              {
                step: 3,
                title: 'تحویل به ناوگان باربری',
                time: nowFa,
                isCompleted: true,
                isCurrent: true,
                description: courierNameInput.trim() || 'تحویل باربری گردید.'
              },
              {
                step: 4,
                title: 'تحویل به مشتری',
                time: 'در مسیر تحویل',
                isCompleted: false,
                isCurrent: false,
                description: 'محموله در حال انتقال به مقصد است.'
              }
            ]
          }
        };
      }
      return o;
    });

    saveOrders(updated);
    setShippingModalOrder(null);
    setShippingCodeInput('');
    setCourierNameInput('');
    showToast(`بارنامه و اطلاعات ارسال سفارش با موفقیت ثبت شد.`);
  };

  // Handler: Print order with official framed layout, Samim font, and PDF support
  const handlePrintOrder = (order: OrderInvoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedDate = order.createdAt || new Date().toLocaleDateString('fa-IR');
    const trackingCode = order.trackingCode || order.orderId;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>فاکتور رسمی فروش - ${order.trackingCode}</title>
        <link rel="preconnect" href="https://cdn.jsdelivr.net">
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/samim-font@v4.0.5/dist/font-face.css" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800;900&display=swap" rel="stylesheet">
        <style>
          @import url('https://cdn.jsdelivr.net/gh/rastikerdar/samim-font@v4.0.5/dist/font-face.css');
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Samim', 'Vazirmatn', Tahoma, sans-serif !important;
            background-color: #f1f5f9;
            color: #0f172a;
            margin: 0;
            padding: 16px;
            direction: rtl;
            font-size: 11.5px;
            line-height: 1.5;
          }
          .no-print-bar {
            max-width: 860px;
            margin: 0 auto 16px auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #1e293b;
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .btn-print {
            background: #2563eb;
            color: white;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-family: 'Samim', sans-serif;
            font-weight: bold;
            font-size: 13px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 6px rgba(37,99,235,0.4);
          }
          .btn-print:hover {
            background: #1d4ed8;
          }
          .invoice-wrapper {
            max-width: 860px;
            margin: 0 auto;
            background: #ffffff;
            border: 2px solid #0f2b5c;
            border-radius: 10px;
            padding: 18px 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          }
          .header-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0f2b5c;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .company-title {
            font-size: 18px;
            font-weight: 900;
            color: #0f2b5c;
            margin: 0 0 4px 0;
          }
          .company-subtitle {
            font-size: 11px;
            font-weight: bold;
            color: #475569;
          }
          .invoice-meta-box {
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            background: #f8fafc;
            padding: 6px 12px;
            font-size: 10.5px;
            min-width: 220px;
            line-height: 1.7;
          }
          .parties-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
          }
          .box-panel {
            border: 1px solid #94a3b8;
            border-radius: 8px;
            padding: 8px 10px;
            background: #fcfdfe;
          }
          .box-title {
            font-weight: 900;
            font-size: 11.5px;
            color: #0f2b5c;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 4px;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .meta-row {
            display: flex;
            margin-bottom: 3px;
          }
          .meta-label {
            color: #64748b;
            min-width: 85px;
            font-weight: 500;
          }
          .meta-value {
            color: #0f172a;
            font-weight: 700;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 11px;
          }
          .items-table th {
            background-color: #0f2b5c;
            color: #ffffff;
            border: 1px solid #0f2b5c;
            padding: 7px 8px;
            text-align: center;
            font-weight: 800;
          }
          .items-table td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: center;
            color: #1e293b;
          }
          .items-table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .items-table td.text-right {
            text-align: right;
          }
          .items-table td.text-left {
            text-align: left;
            direction: ltr;
          }
          .financial-summary {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 12px;
            margin-bottom: 12px;
          }
          .totals-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
          }
          .totals-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          .totals-table tr.payable-row {
            background: #eff6ff;
            font-weight: 900;
            color: #1d4ed8;
            font-size: 13px;
            border-top: 2px solid #0f2b5c;
          }
          .terms-box {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 10px;
            color: #475569;
            background: #f8fafc;
            line-height: 1.7;
          }
          .terms-title {
            font-weight: 800;
            color: #0f2b5c;
            margin-bottom: 2px;
          }
          .signatures-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            margin-top: 14px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 10px;
            text-align: center;
            font-size: 10.5px;
            color: #334155;
          }
          .signature-box {
            border: 1px dashed #94a3b8;
            border-radius: 6px;
            padding: 8px 4px;
            height: 65px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #ffffff;
          }
          .official-footer {
            margin-top: 10px;
            text-align: center;
            font-size: 9.5px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
          }
          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }
            .no-print-bar {
              display: none !important;
            }
            .invoice-wrapper {
              box-shadow: none;
              border: 1.5px solid #000000;
              padding: 12px 16px;
              max-width: 100%;
            }
            .items-table th {
              background-color: #0f2b5c !important;
              color: #ffffff !important;
            }
            .totals-table tr.payable-row {
              background: #f0f7ff !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <div>
            <strong>پیش‌نمایش چاپ و صدور PDF فاکتور سفارش</strong>
            <span style="font-size: 11px; margin-right: 8px; opacity: 0.8;">(کد: ${trackingCode})</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-print" onclick="window.print()">
              🖨️ چاپ یا ذخیره PDF (Ctrl+P)
            </button>
            <button onclick="window.close()" style="background: #475569; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-family: 'Samim', sans-serif;">
              بستن
            </button>
          </div>
        </div>

        <div class="invoice-wrapper">
          <!-- Header Area -->
          <div class="header-box">
            <div>
              <div class="company-title">سامانه پخش عمده دخانیات سرو</div>
              <div class="company-subtitle">صورتحساب رسمی فروش کالا و تحویل انبار (سفارش آنلاین اینترنتی)</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 3px;">
                مرکز بنکداری و توزیع کارتن و باکس دخانیات | انبار مرکزی تهران | تلفن تدارکات: ۰۹۱۲۰۷۵۹۴۱۹
              </div>
            </div>
            <div class="invoice-meta-box">
              <div><strong>شماره فاکتور:</strong> <span dir="ltr">${order.orderId}</span></div>
              <div><strong>کد رهگیری:</strong> <strong style="color: #1d4ed8;" dir="ltr">${trackingCode}</strong></div>
              <div><strong>تاریخ ثبت:</strong> ${formattedDate}</div>
              <div><strong>وضعیت سفارش:</strong> ${order.orderStatus === 'approved' ? 'تایید و ثبت در صندوق' : order.orderStatus === 'shipped' ? 'ارسال شده (بارنامه صادر شد)' : 'در انتظار بررسی'}</div>
            </div>
          </div>

          <!-- Parties Info Grid -->
          <div class="parties-grid">
            <!-- Seller Info -->
            <div class="box-panel">
              <div class="box-title">
                <span>مشخصات فروشنده (توزیع‌کننده)</span>
                <span style="font-size: 9.5px; color: #2563eb;">انبار مرکزی</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">نام شرکت/فروشگاه:</span>
                <span class="meta-value">پخش عمده دخانیات سرو</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">شناسه ملی:</span>
                <span class="meta-value font-mono">۱۰۱۰۳۸۵۲۹۱۰</span>
                <span class="meta-label" style="min-width: 60px; margin-right: 12px;">کد اقتصادی:</span>
                <span class="meta-value font-mono">۴۱۱۴۹۸۷۵۳۱۱۹</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">تلفن هماهنگی:</span>
                <span class="meta-value font-mono" dir="ltr">۰۹۱۲۰۷۵۹۴۱۹</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">نشانی مبدا:</span>
                <span class="meta-value">تهران، خیابان مولوی، سرای دخانیات، انبار مرکزی سرو</span>
              </div>
            </div>

            <!-- Buyer Info -->
            <div class="box-panel">
              <div class="box-title">
                <span>مشخصات خریدار (فروشگاه/سوپرمارکت)</span>
                <span style="font-size: 9.5px; color: #16a34a;">مشتری ثبت‌شده</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">نام خریدار:</span>
                <span class="meta-value">${order.customer.shopOwnerName}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">فروشگاه/واحد:</span>
                <span class="meta-value">${order.customer.shopName || '-'}</span>
                <span class="meta-label" style="min-width: 60px; margin-right: 12px;">تلفن همراه:</span>
                <span class="meta-value font-mono" dir="ltr">${order.customer.shopPhone}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">مقصد ارسال:</span>
                <span class="meta-value">${order.customer.province || ''} - ${order.customer.city}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">نشانی تحویل:</span>
                <span class="meta-value">${order.customer.address}</span>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 5%;">ردیف</th>
                <th style="text-align: right; width: 42%;">شرح کالا / برند / اصالت</th>
                <th style="width: 13%;">واحد بسته‌بندی</th>
                <th style="width: 9%;">تعداد</th>
                <th style="width: 15%; text-align: left;">فی واحد (تومان)</th>
                <th style="width: 16%; text-align: left;">مبلغ کل (تومان)</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item, idx) => {
                const unitPrice = item.unit === 'carton' ? item.product.cartonPrice : item.product.boxPrice;
                const totalItemPrice = unitPrice * item.quantity;
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td class="text-right">
                      <strong>${item.product.nameFa}</strong>
                      <span style="font-size: 9.5px; color: #64748b; margin-right: 4px;">(${item.product.brand} - ${item.product.origin || 'اورجینال'})</span>
                    </td>
                    <td>${item.unit === 'carton' ? `کارتن (${item.product.boxesPerCarton || 50} باکسی)` : 'باکس (۱۰ پاکتی)'}</td>
                    <td style="font-weight: 800; font-size: 12px;">${item.quantity.toLocaleString('fa-IR')}</td>
                    <td class="text-left">${unitPrice.toLocaleString('fa-IR')}</td>
                    <td class="text-left" style="font-weight: 800; color: #0f2b5c;">${totalItemPrice.toLocaleString('fa-IR')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Financial Summary and Payment Details Grid -->
          <div class="financial-summary">
            <!-- Payment & Verification Info -->
            <div class="box-panel">
              <div class="box-title">اطلاعات تسویه، پرداخت و بارگیری</div>
              <div class="meta-row">
                <span class="meta-label">نحوه تسویه:</span>
                <span class="meta-value">${order.paymentStatus || 'واریز به حساب و ثبت فیش'}</span>
              </div>
              ${order.bankRefCode ? `
                <div class="meta-row">
                  <span class="meta-label">کد پیگیری بانکی:</span>
                  <span class="meta-value font-mono" style="color: #16a34a;">${order.bankRefCode}</span>
                </div>
              ` : ''}
              ${order.senderCardLast4 ? `
                <div class="meta-row">
                  <span class="meta-label">۴ رقم کارت واریز:</span>
                  <span class="meta-value font-mono">****-${order.senderCardLast4}</span>
                </div>
              ` : ''}
              <div class="meta-row">
                <span class="meta-label">متصدی تایید:</span>
                <span class="meta-value">${order.approvedBy || 'صندوقدار سیستم فروش'}</span>
              </div>
              ${order.shippingCourier ? `
                <div class="meta-row">
                  <span class="meta-label">باربری / راننده:</span>
                  <span class="meta-value">${order.shippingCourier} ${order.shippingTrackingNumber ? `(بیجک: ${order.shippingTrackingNumber})` : ''}</span>
                </div>
              ` : ''}
            </div>

            <!-- Totals Box -->
            <table class="totals-table">
              <tr>
                <td style="color: #475569;">جمع کل اقلام فاکتور:</td>
                <td style="text-align: left; font-weight: 700; direction: ltr;">${order.subtotal.toLocaleString('fa-IR')} تومان</td>
              </tr>
              ${order.discountAmount > 0 ? `
                <tr style="color: #16a34a;">
                  <td>تخفیف ویژه تیراژ:</td>
                  <td style="text-align: left; font-weight: 700; direction: ltr;">-${order.discountAmount.toLocaleString('fa-IR')} تومان</td>
                </tr>
              ` : ''}
              <tr>
                <td style="color: #475569;">هزینه بسته‌بندی و باربری:</td>
                <td style="text-align: left; font-weight: 700; direction: ltr;">${(order.shippingCost || 0).toLocaleString('fa-IR')} تومان</td>
              </tr>
              <tr class="payable-row">
                <td>مبلغ نهایی و قابل پرداخت:</td>
                <td style="text-align: left; font-size: 14px; direction: ltr;">${order.finalTotal.toLocaleString('fa-IR')} تومان</td>
              </tr>
            </table>
          </div>

          <!-- Terms & Condition -->
          <div class="terms-box">
            <div class="terms-title">توضیحات و شرایط تحویل بار:</div>
            <div>۱. کلیه کالاهای این فاکتور با بسته‌بندی پلمپ شرکتی و ضمانت اصالت فیزیکی از انبار مرکزی بارگیری می‌گردند.</div>
            <div>۲. بررسی تعداد کارتن‌ها و سلامت بسته‌بندی در زمان تحویل از باربری یا پیک بر عهده خریدار محترم می‌باشد.</div>
          </div>

          <!-- Signatures -->
          <div class="signatures-grid">
            <div class="signature-box">
              <span>مهر و امضای فروشنده (دخانیات سرو)</span>
              <span style="font-size: 9px; color: #94a3b8;">تایید مالی و انبار</span>
            </div>
            <div class="signature-box">
              <span>مسئول ترابری و خروج انبار</span>
              <span style="font-size: 9px; color: #94a3b8;">صدور بیجک باربری</span>
            </div>
            <div class="signature-box">
              <span>امضا و مهر تحویل‌گیرنده بار (خریدار)</span>
              <span style="font-size: 9px; color: #94a3b8;">صحت و سلامت فیزیکی اقلام</span>
            </div>
          </div>

          <div class="official-footer">
            این فاکتور الکترونیکی از سامانه رسمی مدیریت و فروش دخانیات سرو صادر شده و معتبر می‌باشد.
          </div>
        </div>

        <script>
          window.onload = function() {
            // Auto open print dialog after font rendering
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                مدیریت سفارش‌های آنلاین مشتریان
              </h1>
              {stats.pending > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full animate-pulse shadow-xs">
                  {formatNumberFa(stats.pending)} سفارش نیازمند تایید فیش
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              بررسی و اعتبارسنجی فیش‌های واریزی، تایید سفارشات اینترنتی و ثبت مستقیم در صندوق فروشگاه
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadOrders}
            title="به‌روزرسانی لحظه‌ای لیست"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">بروزرسانی</span>
          </button>

          {onReturnToPos && (
            <button
              onClick={onReturnToPos}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به صندوق</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>کل سفارشات آنلاین</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatNumberFa(stats.total)}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending' 
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold mb-1">
            <span>در انتظار تایید فیش</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600 font-mono flex items-center gap-2">
            <span>{formatNumberFa(stats.pending)}</span>
            {stats.pending > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'approved' 
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold mb-1">
            <span>تایید شده و ثبت در صندوق</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono">
            {formatNumberFa(stats.approved)}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('shipped')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'shipped' 
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-700 text-xs font-bold mb-1">
            <span>ارسال شده با باربری</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-600 font-mono">
            {formatNumberFa(stats.shipped)}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl border bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>مجموع ارزش تایید شده</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 truncate">
            {formatToman(stats.totalRevenue)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            همه سفارشات ({formatNumberFa(stats.total)})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <span>بررسی فیش بانکی</span>
            {stats.pending > 0 && (
              <span className="bg-amber-950/20 text-slate-950 px-1.5 py-0.2 rounded-md font-mono text-[10px]">
                {formatNumberFa(stats.pending)}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            تایید شده ({formatNumberFa(stats.approved)})
          </button>
          <button
            onClick={() => setStatusFilter('shipped')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'shipped'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ارسال شده ({formatNumberFa(stats.shipped)})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'cancelled'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            لغو شده ({formatNumberFa(stats.cancelled)})
          </button>
        </div>

        {/* Search Input and Payment Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی کد رهگیری، مشتری، تلفن..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">همه پرداخت‌ها</option>
            <option value="bank_transfer">فقط فیش بانکی</option>
            <option value="wallet">فقط کسر از کیف پول</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-800 mb-1">هیچ سفارشی یافت نشد</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery.trim() || statusFilter !== 'all' 
              ? 'موردی با فیلترهای انتخابی پیدا نشد. لطفاً عبارت جستجو یا وضعیت را تغییر دهید.'
              : 'هنوز هیچ سفارش آنلاینی توسط مشتریان ثبت نگردیده است.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map(order => {
            const st = getOrderStatusKey(order);
            const isBank = order.paymentStatus.includes('فیش') || Boolean(order.receiptImage) || Boolean(order.bankRefCode);

            return (
              <div 
                key={order.trackingCode || order.orderId}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
                  st === 'pending'
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {order.trackingCode || order.orderId}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {order.createdAt}
                    </span>

                    {/* Status Badge */}
                    {st === 'pending' && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        <span>در انتظار بررسی فیش واریزی</span>
                      </span>
                    )}
                    {st === 'approved' && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>تایید شده و ثبت در صندوق</span>
                      </span>
                    )}
                    {st === 'shipped' && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>ارسال شده با باربری</span>
                      </span>
                    )}
                    {st === 'cancelled' && (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        <span>سفارش لغو شده</span>
                      </span>
                    )}
                  </div>

                  {/* Customer Shop Name & Phone */}
                  <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-1 text-slate-900 font-bold">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customer.shopOwnerName}</span>
                      {order.customer.shopName && (
                        <span className="text-slate-500 font-normal">({order.customer.shopName})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customer.shopPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Content Body: Items Summary & Payment/Receipt Info */}
                <div className="py-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* Items List (col 7) */}
                  <div className="md:col-span-7 space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      <span>اقلام سفارش ({formatNumberFa(order.items.length)} ردیف):</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <div 
                          key={idx}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-xs"
                        >
                          <span className="font-black text-slate-800">{item.product.nameFa}</span>
                          <span className="bg-blue-100 text-blue-800 font-black px-1.5 py-0.2 rounded font-mono text-[11px]">
                            {formatNumberFa(item.quantity)} {item.unit === 'carton' ? 'کارتن' : 'باکس'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.customer.address && (
                      <div className="text-[11px] text-slate-500 flex items-start gap-1 pt-1 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                        <span className="truncate">{order.customer.city} - {order.customer.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment and Receipt Preview Box (col 5) */}
                  <div className="md:col-span-5 bg-slate-50/80 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="text-[11px] text-slate-500 font-bold">روش تسویه:</div>
                      <div className="text-xs font-black text-slate-800 truncate flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{order.paymentStatus}</span>
                      </div>

                      {order.bankRefCode && (
                        <div className="text-[11px] text-slate-600 font-mono">
                          کد پیگیری بانکی: <span className="font-bold text-slate-900">{order.bankRefCode}</span>
                        </div>
                      )}

                      {order.senderCardLast4 && (
                        <div className="text-[11px] text-slate-600 font-mono">
                          کارت مبدا: <span className="font-bold text-slate-900">****-{order.senderCardLast4}</span>
                        </div>
                      )}
                    </div>

                    {/* Receipt Image Thumbnail */}
                    {isBank ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <div 
                          onClick={() => setViewingReceiptOrder(order)}
                          className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-100 transition-all bg-white"
                          title="مشاهده فیش واریزی بانکی"
                        >
                          <img 
                            src={getOrderReceiptImage(order)} 
                            alt="فیش بانکی" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-[10px] font-bold">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        </div>

                        <button
                          onClick={() => setViewingReceiptOrder(order)}
                          className="text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 font-bold transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                          title="بررسی و مشاهده فیش بانکی"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>مشاهده فیش</span>
                        </button>
                      </div>
                    ) : null}
                  </div>

                </div>

                {/* Footer Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  
                  {/* Financial Totals */}
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                    <div>
                      <span>مبلغ فاکتور: </span>
                      <span className="font-black text-sm sm:text-base text-blue-600 font-mono">
                        {formatToman(order.finalTotal)}
                      </span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="text-emerald-600 font-bold text-[11px]">
                        تخفیف: {formatToman(order.discountAmount)}
                      </div>
                    )}
                    {order.approvedBy && (
                      <div className="text-[11px] text-slate-400">
                        تایید توسط: <span className="font-bold text-slate-600">{order.approvedBy}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>جزئیات سفارش</span>
                    </button>

                    {/* View Receipt Button (if bank transfer) */}
                    {isBank && (
                      <button
                        onClick={() => setViewingReceiptOrder(order)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition-colors active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>مشاهده فیش واریزی</span>
                      </button>
                    )}

                    {/* Print Official Invoice */}
                    <button
                      onClick={() => handlePrintOrder(order)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="چاپ فاکتور رسمی"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Approve Button (when pending) */}
                    {st === 'pending' && (
                      <>
                        <button
                          onClick={() => setApproveConfirmOrder(order)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1 transition-all active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>تایید فیش و ثبت در صندوق</span>
                        </button>

                        <button
                          onClick={() => {
                            setRejectModalOrder(order);
                            setRejectReason('');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 whitespace-nowrap transition-colors active:scale-95"
                        >
                          <X className="w-3.5 h-3.5 shrink-0" />
                          <span>رد سفارش</span>
                        </button>
                      </>
                    )}

                    {/* Ship Button (when approved) */}
                    {st === 'approved' && (
                      <button
                        onClick={() => {
                          setShippingModalOrder(order);
                          setShippingCodeInput(order.shippingTrackingNumber || '');
                          setCourierNameInput(order.shippingCourier || 'ناوگان اختصاصی پخش سرو');
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1 transition-all active:scale-95"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>صدور بارنامه و ثبت ارسال</span>
                      </button>
                    )}

                  </div>

                </div>

                {/* Rejection Note (if cancelled) */}
                {st === 'cancelled' && order.rejectionReason && (
                  <div className="mt-3 bg-rose-50 text-rose-800 text-xs p-2.5 rounded-xl border border-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>علت لغو: {order.rejectionReason}</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: View Payment Receipt Slip */}
      {viewingReceiptOrder && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setViewingReceiptOrder(null)}
          className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 cursor-default"
          >
            {/* Modal Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>تصویر فیش واریزی و اطلاعات بانکی</span>
                    {viewingReceiptOrder.receiptImage && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        پیوست موجود
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    شماره پیگیری سفارش: <span className="font-bold text-slate-700">{viewingReceiptOrder.trackingCode}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingReceiptOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                title="بستن (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0 bg-slate-50/50">
              {/* Receipt Image Display Container */}
              {(() => {
                const receiptSrc = getOrderReceiptImage(viewingReceiptOrder);
                return (
                  <div className="bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center min-h-[280px] max-h-[480px] border border-slate-800 shadow-inner relative group p-2">
                    <img
                      src={receiptSrc}
                      alt={`فیش واریزی سفارش ${viewingReceiptOrder.trackingCode}`}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[440px] w-auto h-auto object-contain select-none transition-transform duration-200 hover:scale-105 rounded-lg shadow-lg"
                    />
                    {/* Quick Image Actions Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-xs p-1.5 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setIsReceiptFullscreen(true);
                          setReceiptZoomLevel(1);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        title="مشاهده بزرگنمایی و اندازه اصلی فیش"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>اندازه اصلی / بزرگنمایی</span>
                      </button>
                      <a
                        href={receiptSrc}
                        download={`receipt-${viewingReceiptOrder.trackingCode}.jpg`}
                        className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        title="ذخیره تصویر فیش"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* Upload/Replace Receipt Image Action */}
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-blue-950">
                  <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-[11px] font-bold">بارگذاری یا تغییر عکس فیش ارسالی توسط مشتری:</span>
                </div>
                <label className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] cursor-pointer flex items-center gap-1 transition-colors shrink-0 shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>انتخاب فایل عکس</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadReceiptForOrder}
                  />
                </label>
              </div>

              {/* Bank Transfer Details Box */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>مشخصات انتقال وجه و واریز</span>
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    روش: {viewingReceiptOrder.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">مبلغ سفارش:</span>
                    <span className="font-black text-sm text-blue-700 font-mono">
                      {formatToman(viewingReceiptOrder.finalTotal)}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">کد رهگیری بانکی:</span>
                    <span className="font-black text-sm text-slate-900 font-mono">
                      {viewingReceiptOrder.bankRefCode || 'ثبت نشده'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">۴ رقم آخر کارت واریزکننده:</span>
                    <span className="font-black text-sm text-slate-900 font-mono">
                      {viewingReceiptOrder.senderCardLast4 ? `****-${viewingReceiptOrder.senderCardLast4}` : 'ثبت نشده'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">نام خریدار و فروشگاه:</span>
                    <span className="font-black text-slate-900">
                      {viewingReceiptOrder.customer.shopOwnerName}
                      {viewingReceiptOrder.customer.shopName && (
                        <span className="text-slate-500 text-[11px] font-normal block">
                          ({viewingReceiptOrder.customer.shopName})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Actions in Modal Footer */}
            <div className="shrink-0 p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              <button
                onClick={() => setViewingReceiptOrder(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                بستن پنجره
              </button>

              <div className="flex items-center gap-2">
                {getOrderStatusKey(viewingReceiptOrder) === 'pending' && (
                  <button
                    onClick={() => {
                      const ord = viewingReceiptOrder;
                      setViewingReceiptOrder(null);
                      setApproveConfirmOrder(ord);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>تایید فیش و ثبت در صندوق</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FULLSCREEN RECEIPT IMAGE LIGHTBOX MODAL */}
      {viewingReceiptOrder && isReceiptFullscreen && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setIsReceiptFullscreen(false)}
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 cursor-zoom-out select-none animate-in fade-in duration-200"
          dir="rtl"
        >
          {/* Top Bar */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl flex items-center justify-between gap-3 bg-slate-900/90 border border-white/10 px-4 py-3 rounded-2xl text-white backdrop-blur-sm shrink-0 cursor-default"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">
                  نمایش فیش در اندازه اصلی و با کیفیت کامل
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  کد رهگیری سفارش: {viewingReceiptOrder.trackingCode} • خریدار: {viewingReceiptOrder.customer.shopOwnerName}
                </p>
              </div>
            </div>

            {/* Zoom Controls & Action Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setReceiptZoomLevel(prev => Math.max(0.5, +(prev - 0.25).toFixed(2)))}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="کوچک‌نمایی"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2.5 font-mono text-[11px] font-bold text-indigo-300 select-none">
                  {Math.round(receiptZoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setReceiptZoomLevel(prev => Math.min(3, +(prev + 0.25).toFixed(2)))}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="بزرگ‌نمایی"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptZoomLevel(1)}
                  className="px-2 py-1 hover:bg-white/10 rounded-lg text-[10px] text-slate-400 hover:text-white transition-colors border-r border-white/10 mr-1 cursor-pointer"
                  title="اندازه عادی (100%)"
                >
                  100%
                </button>
              </div>

              <a
                href={getOrderReceiptImage(viewingReceiptOrder)}
                download={`receipt-${viewingReceiptOrder.trackingCode}.jpg`}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ذخیره عکس</span>
              </a>

              <button
                type="button"
                onClick={() => setIsReceiptFullscreen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white transition-colors cursor-pointer"
                title="بستن (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Scrollable Image Area */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex-1 w-full max-w-6xl flex items-center justify-center overflow-auto p-4 my-2 cursor-default"
          >
            <img
              src={getOrderReceiptImage(viewingReceiptOrder)}
              alt={`فیش واریزی سفارش ${viewingReceiptOrder.trackingCode}`}
              referrerPolicy="no-referrer"
              style={{ transform: `scale(${receiptZoomLevel})`, transformOrigin: 'center center' }}
              className="max-h-[80vh] max-w-full w-auto h-auto object-contain rounded-2xl shadow-2xl transition-transform duration-150 select-none border border-white/10 bg-white"
            />
          </div>

          {/* Bottom Hint */}
          <div className="text-[11px] text-slate-400 font-medium pb-1 shrink-0">
            برای خروج کلید Esc را فشار دهید یا روی حاشیه کلیک کنید
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: Full Order Details Inspection */}
      {selectedOrder && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 cursor-default"
          >
            {/* Modal Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    جزئیات کامل سفارش اینترنتی
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    کد رهگیری: {selectedOrder.trackingCode} | زمان: {selectedOrder.createdAt}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
              {/* Customer Profile Grid */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">نام خریدار / متصدی: </span>
                  <span className="font-bold text-slate-900">{selectedOrder.customer.shopOwnerName}</span>
                </div>
                <div>
                  <span className="text-slate-500">فروشگاه / سوپرمارکت: </span>
                  <span className="font-bold text-slate-900">{selectedOrder.customer.shopName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500">تلفن تماس: </span>
                  <span className="font-bold text-slate-900 font-mono">{selectedOrder.customer.shopPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500">شهر و استان: </span>
                  <span className="font-bold text-slate-900">{selectedOrder.customer.province} - {selectedOrder.customer.city}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">نشانی دقیق: </span>
                  <span className="font-medium text-slate-900">{selectedOrder.customer.address}</span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-black text-slate-700 mb-2">لیست اقلام سفارش</h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">نام کالا</th>
                        <th className="p-2.5">واحد</th>
                        <th className="p-2.5">تعداد</th>
                        <th className="p-2.5">قیمت واحد</th>
                        <th className="p-2.5">مبلغ کل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((it, idx) => {
                        const price = it.unit === 'carton' ? it.product.cartonPrice : it.product.boxPrice;
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-900">
                              {it.product.nameFa}
                              <div className="text-[10px] text-slate-400 font-normal">{it.product.brand}</div>
                            </td>
                            <td className="p-2.5 text-slate-600">
                              {it.unit === 'carton' ? `کارتن (${it.product.boxesPerCarton} باکسی)` : 'باکس (۱۰ پاکتی)'}
                            </td>
                            <td className="p-2.5 font-mono font-bold text-slate-900">
                              {formatNumberFa(it.quantity)}
                            </td>
                            <td className="p-2.5 font-mono text-slate-600">
                              {formatToman(price)}
                            </td>
                            <td className="p-2.5 font-mono font-black text-slate-900">
                              {formatToman(price * it.quantity)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bank Receipt Attachment Box if Available */}
              {(selectedOrder.paymentStatus === 'واریز شده و ثبت فیش' || !selectedOrder.paymentStatus?.includes('کیف پول')) && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-blue-200 relative group cursor-pointer"
                       onClick={() => setViewingReceiptOrder(selectedOrder)}>
                    <img 
                      src={getOrderReceiptImage(selectedOrder)} 
                      alt="فیش واریزی" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1 text-right space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-900">رسید و فیش واریز بانکی</span>
                      <span className="text-[10px] bg-blue-200/80 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                        {selectedOrder.receiptImage?.startsWith('data:image/svg') ? 'رسید دیجیتال' : 'پیوست موجود'}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-700">
                      کد پیگیری بانکی: <span className="font-mono font-bold text-slate-900">{selectedOrder.bankRefCode || 'ثبت در شاپرک'}</span>
                      {selectedOrder.senderCardLast4 && ` | کارت: ****-${selectedOrder.senderCardLast4}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingReceiptOrder(selectedOrder)}
                    className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    <span>مشاهده بزرگ فیش</span>
                  </button>
                </div>
              )}

              {/* Financial Calculation */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>جمع کل فاکتور:</span>
                  <span className="font-mono font-bold">{formatToman(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>تخفیف تیراژ:</span>
                    <span className="font-mono">-{formatToman(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>هزینه بسته‌بندی و ارسال:</span>
                  <span className="font-mono font-bold">{formatToman(selectedOrder.shippingCost || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-blue-700 pt-2 border-t border-slate-200">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="font-mono">{formatToman(selectedOrder.finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Modal Sticky Footer with Actions */}
            <div className="shrink-0 p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handlePrintOrder(selectedOrder)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ فاکتور</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  بستن
                </button>

                {getOrderStatusKey(selectedOrder) === 'pending' && (
                  <button
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      setApproveConfirmOrder(ord);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>تایید و تسویه در صندوق</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: Confirmation to Approve Order in POS */}
      {approveConfirmOrder && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setApproveConfirmOrder(null)}
          className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150 space-y-4 cursor-default"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900 mb-1">
                تایید نهایی فیش و ثبت در صندوق؟
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                با تایید این سفارش، مبلغ <strong className="text-slate-900 font-mono">{formatToman(approveConfirmOrder.finalTotal)}</strong> به عنوان فروش نقدی/واریزی در سیستم صندوق و حسابداری ثبت شده و موجودی انبار اقلام مربوطه کسر خواهد شد.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">خریدار:</span>
                <span className="font-bold text-slate-900">{approveConfirmOrder.customer.shopOwnerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">کد رهگیری سفارش:</span>
                <span className="font-mono font-bold text-slate-900">{approveConfirmOrder.trackingCode}</span>
              </div>
              {approveConfirmOrder.bankRefCode && (
                <div className="flex justify-between">
                  <span className="text-slate-500">کد پیگیری بانکی:</span>
                  <span className="font-mono font-bold text-emerald-700">{approveConfirmOrder.bankRefCode}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 shrink-0">
              <button
                onClick={() => setApproveConfirmOrder(null)}
                className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={() => handleApproveOrder(approveConfirmOrder)}
                className="flex-1 py-2.5 rounded-2xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                بله، تایید و ثبت در صندوق
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 4: Reject Order with Reason */}
      {rejectModalOrder && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => {
            setRejectModalOrder(null);
            setRejectReason('');
          }}
          className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150 space-y-4 cursor-default"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shrink-0">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900 mb-1">
                رد سفارش آنلاین مشتری
              </h3>
              <p className="text-xs text-slate-500">
                لطفاً علت لغو یا رد فیش را مشخص کنید تا در سامانه ثبت شود.
              </p>
            </div>

            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold text-slate-700">علت رد سفارش:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: تصویر فیش ناخوانا است یا مبلغ واریزی مغایرت دارد..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 shrink-0">
              <button
                onClick={() => {
                  setRejectModalOrder(null);
                  setRejectReason('');
                }}
                className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                انصراف
              </button>
              <button
                onClick={handleRejectOrder}
                className="flex-1 py-2.5 rounded-2xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20"
              >
                تایید ابطال سفارش
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 5: Shipping Dispatch */}
      {shippingModalOrder && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => {
            setShippingModalOrder(null);
            setShippingCodeInput('');
            setCourierNameInput('');
          }}
          className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150 space-y-4 cursor-default"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shrink-0">
              <Truck className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900 mb-1">
                ثبت اطلاعات ارسال و بارنامه
              </h3>
              <p className="text-xs text-slate-500">
                سفارش کد {shippingModalOrder.trackingCode} به نام {shippingModalOrder.customer.shopOwnerName}
              </p>
            </div>

            <div className="space-y-3 text-right text-xs flex-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">نام راننده / باربری:</label>
                <input
                  type="text"
                  value={courierNameInput}
                  onChange={(e) => setCourierNameInput(e.target.value)}
                  placeholder="مثال: باربری وطن، تیپاکس، راننده انبار سرو..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">شماره بارنامه / کد رهگیری ارسال:</label>
                <input
                  type="text"
                  value={shippingCodeInput}
                  onChange={(e) => setShippingCodeInput(e.target.value)}
                  placeholder="مثال: 98124501 یا شماره بیجک..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 shrink-0">
              <button
                onClick={() => {
                  setShippingModalOrder(null);
                  setShippingCodeInput('');
                  setCourierNameInput('');
                }}
                className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                انصراف
              </button>
              <button
                onClick={handleShippingSubmit}
                className="flex-1 py-2.5 rounded-2xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              >
                ثبت ارسال بار
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
