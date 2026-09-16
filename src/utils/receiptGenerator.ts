import { OrderInvoice } from '../types';
import { formatToman, formatNumberFa } from './formatters';

/**
 * Generates an SVG Data-URL for a realistic Iranian banking transaction receipt slip.
 */
export function generateBankReceiptSvg(order: OrderInvoice): string {
  const refCode = order.bankRefCode || `98${order.trackingCode.replace(/\D/g, '') || '3471029384'}`;
  const cardLast4 = order.senderCardLast4 || '9419';
  const customerName = order.customer?.shopOwnerName || 'خریدار محترم';
  const shopName = order.customer?.shopName ? ` (${order.customer.shopName})` : '';
  const amountToman = formatToman(order.finalTotal);
  const amountRial = formatNumberFa(order.finalTotal * 10) + ' ریال';
  const dateStr = order.createdAt || new Date().toLocaleDateString('fa-IR');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" width="600" height="840" style="background:#ffffff; font-family: Tahoma, 'Vazirmatn', sans-serif;">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="stampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="0.8"/>
    </pattern>
  </defs>

  <!-- Background with border -->
  <rect width="600" height="840" fill="#ffffff" />
  <rect width="600" height="840" fill="url(#grid)" />
  <rect x="15" y="15" width="570" height="810" rx="20" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="8 4" />

  <!-- Header Card -->
  <rect x="30" y="30" width="540" height="110" rx="16" fill="url(#headerGrad)" />
  
  <!-- Bank Logo & Title -->
  <circle cx="70" cy="85" r="24" fill="#3b82f6" fill-opacity="0.3" />
  <circle cx="70" cy="85" r="16" fill="#60a5fa" />
  <text x="70" y="91" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">S</text>
  
  <text x="110" y="75" font-size="16" font-weight="bold" fill="#ffffff">سامانه پرداخت و انتقال وجه الکترونیک (شاپرک / پایا)</text>
  <text x="110" y="100" font-size="12" fill="#93c5fd">رسید رسمی تاییدیه واریز وجه بانکی</text>

  <!-- Success Status Pill -->
  <rect x="425" y="65" width="130" height="36" rx="18" fill="#10b981" />
  <text x="490" y="88" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">✓ تراکنش موفق</text>

  <!-- Amount Display Box -->
  <rect x="30" y="155" width="540" height="100" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />
  <text x="300" y="185" font-size="12" fill="#64748b" text-anchor="middle">مبلغ کل واریز شده به حساب مقصد</text>
  <text x="300" y="222" font-size="24" font-weight="900" fill="#1e3a8a" text-anchor="middle">${amountToman}</text>
  <text x="300" y="244" font-size="11" fill="#94a3b8" text-anchor="middle">معادل ${amountRial}</text>

  <!-- Transaction Details Table -->
  <rect x="30" y="270" width="540" height="380" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
  
  <!-- Row 1: Tracking / Ref -->
  <line x1="45" y1="330" x2="555" y2="330" stroke="#f1f5f9" stroke-width="1.5" />
  <text x="50" y="310" font-size="12" fill="#64748b">شماره مرجع / پیگیری بانکی:</text>
  <text x="550" y="310" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end" font-family="monospace">${refCode}</text>

  <!-- Row 2: Order Tracking -->
  <line x1="45" y1="380" x2="555" y2="380" stroke="#f1f5f9" stroke-width="1.5" />
  <text x="50" y="360" font-size="12" fill="#64748b">کد پیگیری سفارش در سامانه:</text>
  <text x="550" y="360" font-size="13" font-weight="bold" fill="#2563eb" text-anchor="end" font-family="monospace">${order.trackingCode}</text>

  <!-- Row 3: Date & Time -->
  <line x1="45" y1="430" x2="555" y2="430" stroke="#f1f5f9" stroke-width="1.5" />
  <text x="50" y="410" font-size="12" fill="#64748b">تاریخ و زمان تراکنش:</text>
  <text x="550" y="410" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="end">${dateStr}</text>

  <!-- Row 4: Payer Info -->
  <line x1="45" y1="480" x2="555" y2="480" stroke="#f1f5f9" stroke-width="1.5" />
  <text x="50" y="460" font-size="12" fill="#64748b">نام پرداخت کننده (خریدار):</text>
  <text x="550" y="460" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="end">${customerName}${shopName}</text>

  <!-- Row 5: Sender Card -->
  <line x1="45" y1="530" x2="555" y2="530" stroke="#f1f5f9" stroke-width="1.5" />
  <text x="50" y="510" font-size="12" fill="#64748b">شماره کارت مبدا:</text>
  <text x="550" y="510" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end" font-family="monospace">****-****-****-${cardLast4}</text>

  <!-- Row 6: Receiver Name -->
  <line x1="45" y1="585" x2="555" y2="585" stroke="#f1f5f9" stroke-width="1.5" />
  <text x="50" y="565" font-size="12" fill="#64748b">نام و حساب مقصد (پذیرنده):</text>
  <text x="550" y="565" font-size="12" font-weight="bold" fill="#1e3a8a" text-anchor="end">شرکت پخش و دخانیات سرو (سهامی خاص)</text>

  <!-- Row 7: Destination IBAN -->
  <text x="50" y="620" font-size="12" fill="#64748b">شماره شبا مقصد (بانک سامان):</text>
  <text x="550" y="620" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="end" font-family="monospace">IR12-0120-0000-0000-1234-5678-90</text>

  <!-- Official Digital Stamp -->
  <g transform="translate(190, 660)">
    <circle cx="110" cy="55" r="48" fill="none" stroke="#059669" stroke-width="2.5" stroke-dasharray="6 3" />
    <circle cx="110" cy="55" r="42" fill="#ecfdf5" fill-opacity="0.8" stroke="#059669" stroke-width="1.5" />
    <text x="110" y="44" font-size="10" font-weight="bold" fill="#047857" text-anchor="middle">بانکداری الکترونیک</text>
    <text x="110" y="59" font-size="13" font-weight="900" fill="#047857" text-anchor="middle">تایید و تسویه شد</text>
    <text x="110" y="73" font-size="9" fill="#059669" text-anchor="middle">شبکه شاپرک - پایا</text>
  </g>

  <!-- Footer security text & Barcode mockup -->
  <text x="300" y="790" font-size="10" fill="#94a3b8" text-anchor="middle">این رسید به منزله تاییدیه قطعی انتقال وجه در سامانه بانکداری الکترونیک می‌باشد.</text>
  
  <!-- Security Barcode Lines -->
  <g transform="translate(160, 802)">
    <rect x="0" y="0" width="4" height="16" fill="#475569" />
    <rect x="7" y="0" width="2" height="16" fill="#475569" />
    <rect x="12" y="0" width="6" height="16" fill="#475569" />
    <rect x="22" y="0" width="3" height="16" fill="#475569" />
    <rect x="28" y="0" width="5" height="16" fill="#475569" />
    <rect x="36" y="0" width="2" height="16" fill="#475569" />
    <rect x="42" y="0" width="8" height="16" fill="#475569" />
    <rect x="53" y="0" width="3" height="16" fill="#475569" />
    <rect x="60" y="0" width="4" height="16" fill="#475569" />
    <rect x="68" y="0" width="7" height="16" fill="#475569" />
    <rect x="78" y="0" width="2" height="16" fill="#475569" />
    <rect x="83" y="0" width="5" height="16" fill="#475569" />
    <rect x="91" y="0" width="3" height="16" fill="#475569" />
    <rect x="98" y="0" width="8" height="16" fill="#475569" />
    <rect x="110" y="0" width="2" height="16" fill="#475569" />
    <rect x="115" y="0" width="6" height="16" fill="#475569" />
    <rect x="124" y="0" width="4" height="16" fill="#475569" />
    <rect x="131" y="0" width="3" height="16" fill="#475569" />
    <rect x="137" y="0" width="7" height="16" fill="#475569" />
    <rect x="147" y="0" width="2" height="16" fill="#475569" />
    <rect x="152" y="0" width="5" height="16" fill="#475569" />
    <rect x="160" y="0" width="4" height="16" fill="#475569" />
    <rect x="167" y="0" width="8" height="16" fill="#475569" />
    <rect x="178" y="0" width="3" height="16" fill="#475569" />
    <rect x="185" y="0" width="4" height="16" fill="#475569" />
    <rect x="192" y="0" width="6" height="16" fill="#475569" />
    <rect x="201" y="0" width="2" height="16" fill="#475569" />
    <rect x="206" y="0" width="5" height="16" fill="#475569" />
    <rect x="214" y="0" width="4" height="16" fill="#475569" />
    <rect x="221" y="0" width="7" height="16" fill="#475569" />
    <rect x="231" y="0" width="3" height="16" fill="#475569" />
    <rect x="237" y="0" width="6" height="16" fill="#475569" />
    <rect x="246" y="0" width="2" height="16" fill="#475569" />
    <rect x="251" y="0" width="5" height="16" fill="#475569" />
    <rect x="259" y="0" width="4" height="16" fill="#475569" />
    <rect x="266" y="0" width="8" height="16" fill="#475569" />
    <rect x="277" y="0" width="3" height="16" fill="#475569" />
  </g>
</svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Returns either the customer's uploaded receipt image, or generates an official digital slip.
 */
export function getOrderReceiptImage(order: OrderInvoice): string {
  if (order.receiptImage && order.receiptImage.trim() !== '') {
    return order.receiptImage;
  }
  return generateBankReceiptSvg(order);
}
