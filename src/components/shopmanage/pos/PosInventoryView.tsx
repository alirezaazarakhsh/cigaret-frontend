import React from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2 } from 'lucide-react';
import { CigaretteProduct, StockAdjustmentLog } from '../../../types';
import { formatToman, formatNumberFa, getProductStockInfo } from '../../../utils/formatters';

interface PosInventoryViewProps {
  productsList: CigaretteProduct[];
  totalInventoryValue: number;
  totalCartonsInStock: number;
  totalBoxesInStock: number;
  totalPacksInStock: number;
  lowStockCount: number;
  stockLogs: StockAdjustmentLog[];
  onQuickAdjustStock: (product: CigaretteProduct, unit: 'carton' | 'box', delta: number) => void;
  onOpenProductEditor: (product?: CigaretteProduct | null) => void;
}

/**
 * کامپوننت مستقل موجودی انبار، کاردکس، کم و زیاد کردن کارتن و باکس و هشدار کسری موجودی
 * مسیر: /src/components/shopmanage/pos/PosInventoryView.tsx
 */
export const PosInventoryView: React.FC<PosInventoryViewProps> = ({
  productsList,
  totalInventoryValue,
  totalCartonsInStock,
  totalBoxesInStock,
  totalPacksInStock,
  lowStockCount,
  stockLogs,
  onQuickAdjustStock,
  onOpenProductEditor,
}) => {
  return (
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
            <p className="text-xs text-slate-500 mt-1">کنترل مستقیم و کم/زیاد کردن تعداد کارتن، باکس و پاکت و ثبت ورود بار جدید</p>
          </div>

          <button
            onClick={() => onOpenProductEditor(null)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ تعریف کالا / جنس جدید در انبار</span>
          </button>
        </div>

        {/* Table of Inventory */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-right text-xs min-w-[780px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-3">تصویر</th>
                <th className="p-3">نام کالا و نوع فروش</th>
                <th className="p-3 text-center">کارتن (کلیدی)</th>
                <th className="p-3 text-center">باکس (تعدیل)</th>
                <th className="p-3 text-left">قیمت فروش</th>
                <th className="p-3 text-left">ارزش ریالی</th>
                <th className="p-3 text-center">وضعیت</th>
                <th className="p-3 text-center">ویرایش و مشخصات کالا</th>
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
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-500">{prod.brand} • بارکد: {prod.barcode}</span>
                        {prod.isPosOnly ? (
                          <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.2 rounded">مخصوص حضوری</span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.2 rounded">همگام آنلاین</span>
                        )}
                      </div>
                    </td>

                    {/* Carton Stock Stepper */}
                    <td className="p-3 text-center">
                      {prod.category !== 'drinks_coffee' && (
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => onQuickAdjustStock(prod, 'carton', 1)}
                          className="w-5 h-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                          title="افزایش ۱ کارتن"
                        >
                          +
                        </button>
                        <span className="font-bold font-mono text-xs text-indigo-700 px-1 min-w-[24px] text-center">
                          {formatNumberFa(Math.floor(stockInfo.cartons))}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuickAdjustStock(prod, 'carton', -1)}
                          className="w-5 h-5 bg-white hover:bg-rose-100 text-rose-700 rounded font-bold text-xs flex items-center justify-center border border-slate-200 cursor-pointer"
                          title="کاهش ۱ کارتن"
                        >
                          -
                        </button>
                      </div>
                      )}
                    </td>

                    {/* Box Stock Stepper */}
                    <td className="p-3 text-center">
                      {prod.category !== 'drinks_coffee' && (
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => onQuickAdjustStock(prod, 'box', 1)}
                          className="w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                          title="افزایش ۱ باکس"
                        >
                          +
                        </button>
                        <span className="font-bold font-mono text-xs text-slate-800 px-1 min-w-[30px] text-center">
                          {formatNumberFa(Math.floor(stockInfo.totalBoxes))}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuickAdjustStock(prod, 'box', -1)}
                          className="w-5 h-5 bg-white hover:bg-rose-100 text-rose-700 rounded font-bold text-xs flex items-center justify-center border border-slate-200 cursor-pointer"
                          title="کاهش ۱ باکس"
                        >
                          -
                        </button>
                      </div>
                      )}
                    </td>

                    <td className="p-3 text-left font-mono font-bold text-slate-800">
                      {prod.category === 'drinks_coffee' ? (
                        <div>{formatToman(prod.packPrice || prod.boxPrice || 50000)} (تکی)</div>
                      ) : (
                        <>
                          <div>{formatToman(prod.cartonPrice)}</div>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            {formatToman(prod.boxPrice)} باکس / {formatToman(prod.packPrice)} پاکت
                          </div>
                        </>
                      )}
                    </td>
                    <td className="p-3 text-left font-mono font-black text-emerald-600">
                      {formatToman(productTotalVal)}
                    </td>
                    <td className="p-3 text-center">
                      {stockInfo.isAvailable ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                          {prod.category === 'drinks_coffee' ? `موجود (${formatNumberFa(stockInfo.cartons)} عدد)` : `موجود (${formatNumberFa(Math.floor(stockInfo.cartons))} کارتن)`}
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                          اتمام موجودی
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onOpenProductEditor(prod)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold transition-colors border border-indigo-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 mx-auto"
                        title="ویرایش کامل کالا در بخش مدیریت کالا"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>ویرایش کالا</span>
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
  );
};
