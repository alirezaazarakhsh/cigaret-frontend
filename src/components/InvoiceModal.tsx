import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Package, 
  Building2,
  Truck
} from 'lucide-react';
import { OrderInvoice } from '../types';
import { formatToman, formatNumberFa, calculateItemSubtotal, getApplicableDiscount } from '../utils/formatters';
import { generateInvoicePdf } from '../utils/pdfGenerator';

interface InvoiceModalProps {
  invoice: OrderInvoice | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  onClose,
}) => {
  if (!invoice) return null;
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // دریافت تنظیمات داینامیک برند و حساب‌ها از لوکال استوریج (همگام با پنل بک‌اند)
  const djangoConfig = (() => {
    try {
      const saved = localStorage.getItem('django_crm_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          companyName: 'سوین',
          bankCard1: '۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲',
          bankShiba1: 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲',
          bankHolder1: 'امور مالی شرکت سوین',
          bankCard2: '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰',
          bankShiba2: 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸',
          bankHolder2: 'حساب ترابری و تدارکات سوین',
          ...parsed
        };
      }
    } catch (e) {}
    return {
      companyName: 'سوین',
      bankCard1: '۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲',
      bankShiba1: 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲',
      bankHolder1: 'امور مالی شرکت سوین',
      bankCard2: '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰',
      bankShiba2: 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸',
      bankHolder2: 'حساب ترابری و تدارکات سوین',
    };
  })();

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateInvoicePdf(invoice);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative text-slate-900 print:border-none print:shadow-none print:w-full print:max-w-none transition-colors"
        id="printable-invoice"
      >
        {/* Print Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-black text-slate-900 ">
              پیش‌فاکتور رسمی پخش {djangoConfig.companyName} شماره: <span className="text-blue-700 font-bold">{invoice.orderId}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPdf ? 'در حال صدور PDF...' : 'دانلود PDF پیش‌فاکتور'}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs shadow-xs transition-all border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              چاپ فاکتور
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- INVOICE CONTENT (Ready for print) --- */}
        <div className="space-y-5 print:space-y-4">
          
          {/* Top Header of Invoice */}
          <div className="border-b-2 border-slate-900 pb-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black shadow-md">
                  <Building2 className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 ">
                    صورتحساب پیش‌فاکتور رسمی پخش عمده دخانیات {djangoConfig.companyName}
                  </h1>
                  <p className="text-xs text-slate-500 ">
                    عرضه دست اول و مستقیم انواع برندهای وارداتی اصل و برندهای داخلی
                  </p>
                </div>
              </div>

              <div className="text-left bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs shrink-0">
                <div className="text-slate-500 ">شماره پیش‌فاکتور: <strong className="text-blue-700 font-mono text-sm">{invoice.orderId}</strong></div>
                <div className="text-slate-500 mt-0.5">تاریخ صدور: <strong className="text-slate-900 ">{invoice.createdAt}</strong></div>
                <div className="text-slate-500 mt-0.5">وضعیت: <strong className="text-emerald-600 ">{invoice.paymentStatus}</strong></div>
              </div>
            </div>

            {/* Seller Credentials Bar */}
            <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[10px] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-medium">
              <div>شناسه ملی: <strong className="text-amber-300 font-mono">۱۰۱۰۳۸۵۲۹۱۰</strong></div>
              <div>کد اقتصادی: <strong className="text-amber-300 font-mono">۴۱۱۴۹۸۷۵۳۱۱۹</strong></div>
              <div>نوع فعالیت: <strong className="text-amber-300">پخش عمده دخانیات</strong></div>
              <div>تلفن ترابری: <strong className="text-amber-300 font-mono" dir="ltr">۰۹۱۲۰۷۵۹۴۱۹</strong></div>
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div className="font-black text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600 " />
                مشخصات مغازه‌دار:
              </div>
              <div>نام و نام خانوادگی: <span className="font-bold text-slate-900 ">{invoice.customer.shopOwnerName}</span></div>
              <div>نام مغازه: <span className="font-bold text-slate-900 ">{invoice.customer.shopName || '—'}</span></div>
              <div>شماره همراه: <span className="font-bold text-slate-900 " dir="ltr">{invoice.customer.shopPhone}</span></div>
            </div>

            <div className="space-y-1.5">
              <div className="font-black text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600 " />
                مشخصات باربری و مقصد:
              </div>
              <div>شهر مقصد: <span className="font-bold text-slate-900 ">{invoice.customer.city}</span></div>
              <div>شیوه باربری: <span className="font-bold text-blue-700 ">{invoice.customer.shippingMethod}</span></div>
              <div>آدرس / توضیحات: <span className="text-slate-700 ">{invoice.customer.address || 'تحویل درب انبار'}</span></div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-black text-[11px]">
                <tr>
                  <th className="p-2.5 text-center w-10">ردیف</th>
                  <th className="p-2.5">شرح کالا و برند</th>
                  <th className="p-2.5 text-center">واحد</th>
                  <th className="p-2.5 text-center">تعداد</th>
                  <th className="p-2.5 text-left">نرخ واحد (تومان)</th>
                  <th className="p-2.5 text-left">تخفیف تیراژ</th>
                  <th className="p-2.5 text-left">مبلغ کل (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 ">
                {invoice.items.map((item, idx) => {
                  const unitPrice = item.unit === 'carton' ? item.product.cartonPrice : item.product.boxPrice;
                  const rowSubtotal = calculateItemSubtotal(
                    item.product.cartonPrice,
                    item.product.boxPrice,
                    item.unit,
                    item.quantity
                  );
                  const discountPercent = getApplicableDiscount(item.unit, item.quantity, item.product.tierDiscounts);
                  const discountVal = (rowSubtotal * discountPercent) / 100;
                  const rowFinal = rowSubtotal - discountVal;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 ">
                      <td className="p-2.5 text-center text-slate-500 font-bold">{formatNumberFa(idx + 1)}</td>
                      <td className="p-2.5">
                        <div className="font-black text-slate-900 ">{item.product.nameFa}</div>
                        <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{item.product.brand} - {item.product.origin}</div>
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        {item.unit === 'carton' ? `کارتن (${item.product.boxesPerCarton} باکسی)` : 'باکس (۱۰ پاکت)'}
                      </td>
                      <td className="p-2.5 text-center font-black text-slate-900 ">{formatNumberFa(item.quantity)}</td>
                      <td className="p-2.5 text-left font-medium">{formatToman(unitPrice)}</td>
                      <td className="p-2.5 text-left text-emerald-700 font-bold">
                        {discountVal > 0 ? `-${formatToman(discountVal)}` : '—'}
                      </td>
                      <td className="p-2.5 text-left font-black text-blue-700 ">{formatToman(rowFinal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start bg-slate-50 p-5 rounded-2xl border border-slate-200 gap-4 text-xs">
            <div className="space-y-2.5 text-slate-600 flex-1">
              <div>مجموع کارتن‌های پلمپ: <strong className="text-slate-900 ">{formatNumberFa(invoice.totalCartons)} کارتن</strong></div>
              <div>مجموع باکس‌ها: <strong className="text-slate-900 ">{formatNumberFa(invoice.totalBoxes)} باکس</strong></div>
              
              <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px]">
                <div className="font-black text-slate-800 mb-1">شماره حساب‌های مجاز جهت واریز وجه:</div>
                {djangoConfig.bankCard1 && (
                  <div className="font-mono text-slate-700 ">
                    ۱) {djangoConfig.bankCard1} | شبا: {djangoConfig.bankShiba1} ({djangoConfig.bankHolder1})
                  </div>
                )}
                {djangoConfig.bankCard2 && (
                  <div className="font-mono text-slate-700 ">
                    ۲) {djangoConfig.bankCard2} | شبا: {djangoConfig.bankShiba2} ({djangoConfig.bankHolder2})
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-left w-full sm:w-72">
              <div className="flex justify-between text-slate-600 ">
                <span>جمع ناخالص اقلام:</span>
                <span className="font-bold text-slate-900 ">{formatToman(invoice.subtotal)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>تخفیف تیراژ:</span>
                  <span>-{formatToman(invoice.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-blue-700 font-bold">
                <span>هزینه باربری و بیجک:</span>
                <span>{invoice.shippingCost && invoice.shippingCost > 0 ? formatToman(invoice.shippingCost) : 'رایگان (تحویل انبار)'}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-blue-900 pt-2 border-t border-slate-200 ">
                <span>مبلغ نهایی قابل پرداخت:</span>
                <span className="text-base text-blue-700 ">{formatToman(invoice.finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer Seals & Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 text-center text-xs text-slate-500 ">
            <div className="border border-dashed border-slate-300 rounded-2xl p-4 h-24 flex flex-col justify-between">
              <span>مهر و امضای امور مالی انبار</span>
              <span className="text-[10px] text-slate-400">تأییدیه سیستم یکپارچه مرکزی</span>
            </div>

            <div className="border border-dashed border-slate-300 rounded-2xl p-4 h-24 flex flex-col justify-between">
              <span>امضاء و رسید تحویل‌گیرنده / متصدی باربری</span>
              <span className="text-[10px] text-slate-400">امضاء بیجک رسمی</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
