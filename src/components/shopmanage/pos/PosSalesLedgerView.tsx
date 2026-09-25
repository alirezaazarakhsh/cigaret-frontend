import React from 'react';
import { motion } from 'motion/react';
import { Receipt, Printer } from 'lucide-react';
import { PosReceiptInvoice } from '../../../types';
import { formatToman } from '../../../utils/formatters';

interface PosSalesLedgerViewProps {
  receiptsList: PosReceiptInvoice[];
  onPrintReceipt: (receipt: PosReceiptInvoice) => void;
}

/**
 * کامپوننت مستقل دفتر فاکتورها، چاپ مجدد فیش و تاریخچه فاکتورهای فروش صندوق
 * مسیر: /src/components/shopmanage/pos/PosSalesLedgerView.tsx
 */
export const PosSalesLedgerView: React.FC<PosSalesLedgerViewProps> = ({
  receiptsList,
  onPrintReceipt,
}) => {
  return (
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
            <p className="text-xs text-slate-500 mt-1">مشاهده فاکتورهای صادر شده، چاپ مجدد فاکتور فروش و ریز اقلام مشتریان</p>
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
                    onClick={() => onPrintReceipt(rcpt)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer active:scale-95"
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
  );
};
