import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Save, Check, RefreshCw } from 'lucide-react';
import { CigaretteProduct, StockAdjustmentLog } from '../../../types';
import { formatToman, formatNumberFa, formatTomanInWords, getProductStockInfo } from '../../../utils/formatters';

interface PosInventoryViewProps {
  productsList: CigaretteProduct[];
  totalInventoryValue: number;
  totalCartonsInStock: number;
  totalBoxesInStock: number;
  totalPacksInStock: number;
  lowStockCount: number;
  stockLogs: StockAdjustmentLog[];
  onQuickAdjustStock: (product: CigaretteProduct, unit: 'carton' | 'box', delta: number) => Promise<void> | void;
  onSaveProductStock?: (product: CigaretteProduct, newCartons: number, newBoxes: number) => Promise<void> | void;
  onConvertProductRialToToman?: (product: CigaretteProduct) => Promise<void> | void;
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
  onSaveProductStock,
  onConvertProductRialToToman,
  onOpenProductEditor,
}) => {
  const [draftStocks, setDraftStocks] = useState<Record<string, { cartons: number; boxes: number }>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [isSavingAll, setIsSavingAll] = useState(false);

  useEffect(() => {
    const nextDrafts: Record<string, { cartons: number; boxes: number }> = {};
    productsList.forEach((p) => {
      const info = getProductStockInfo(p);
      nextDrafts[p.id] = {
        cartons: Math.max(0, Math.floor(Number(p.stockCartons) || 0)),
        boxes: Math.max(0, Math.floor(Number(info.totalBoxes) || 0)),
      };
    });
    setDraftStocks(nextDrafts);
  }, [productsList]);

  const markRowSaved = (id: string) => {
    setSavedMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSavedMap((prev) => ({ ...prev, [id]: false }));
    }, 2500);
  };

  const handleStepStock = async (prod: CigaretteProduct, unit: 'carton' | 'box', delta: number) => {
    setSavingMap((prev) => ({ ...prev, [prod.id]: true }));
    try {
      await onQuickAdjustStock(prod, unit, delta);
      markRowSaved(prod.id);
    } finally {
      setSavingMap((prev) => ({ ...prev, [prod.id]: false }));
    }
  };

  const handleDirectInputChange = (prod: CigaretteProduct, unit: 'carton' | 'box', rawVal: string) => {
    const ascii = rawVal
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
      .replace(/[^\d]/g, '');
    const num = ascii === '' ? 0 : Math.max(0, parseInt(ascii, 10) || 0);
    const boxesPerCarton = prod.boxesPerCarton || 50;
    const current = draftStocks[prod.id] || {
      cartons: Math.max(0, Math.floor(Number(prod.stockCartons) || 0)),
      boxes: Math.max(0, Math.floor(getProductStockInfo(prod).totalBoxes)),
    };

    if (unit === 'carton') {
      setDraftStocks((prev) => ({
        ...prev,
        [prod.id]: {
          cartons: num,
          boxes: num * boxesPerCarton,
        },
      }));
    } else {
      setDraftStocks((prev) => ({
        ...prev,
        [prod.id]: {
          cartons: Math.round((num / boxesPerCarton) * 1000) / 1000,
          boxes: num,
        },
      }));
    }
  };

  const handleSaveRow = async (prod: CigaretteProduct) => {
    if (!onSaveProductStock) return;
    const info = getProductStockInfo(prod);
    const draft = draftStocks[prod.id] || {
      cartons: Math.floor(Number(prod.stockCartons) || 0),
      boxes: Math.floor(info.totalBoxes),
    };
    setSavingMap((prev) => ({ ...prev, [prod.id]: true }));
    try {
      await onSaveProductStock(prod, draft.cartons, draft.boxes);
      markRowSaved(prod.id);
    } finally {
      setSavingMap((prev) => ({ ...prev, [prod.id]: false }));
    }
  };

  const handleSaveAllDirty = async () => {
    if (!onSaveProductStock) return;
    setIsSavingAll(true);
    try {
      for (const prod of productsList) {
        const info = getProductStockInfo(prod);
        const draft = draftStocks[prod.id];
        if (draft) {
          await onSaveProductStock(prod, draft.cartons, draft.boxes);
          markRowSaved(prod.id);
        } else {
          await onSaveProductStock(prod, Math.floor(Number(prod.stockCartons) || 0), Math.floor(info.totalBoxes));
          markRowSaved(prod.id);
        }
      }
    } finally {
      setIsSavingAll(false);
    }
  };

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
          <span className="text-xs text-slate-500 font-bold">ارزش کل انبار (کل کارتن‌ها)</span>
          <div className="text-lg font-black text-indigo-600 mt-1">{formatToman(totalInventoryValue)}</div>
          <div className="text-[11px] font-bold text-slate-500 mt-0.5">
            معادل: {formatTomanInWords(totalInventoryValue)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5">
          <span className="text-xs text-slate-500 font-bold">کل موجودی (کارتن)</span>
          <div className="text-lg font-black text-slate-900 mt-1">{formatNumberFa(Math.floor(totalCartonsInStock))} کارتن</div>
          <div className="text-[10px] text-slate-400 mt-0.5">هر کارتن معادل ۵۰ باکس (۵۰۰ پاکت)</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5">
          <span className="text-xs text-slate-500 font-bold">معادل (باکس / پاکت)</span>
          <div className="text-xs font-bold text-slate-700 mt-1">
            {formatNumberFa(Math.floor(totalBoxesInStock))} باکس / {formatNumberFa(Math.floor(totalPacksInStock))} پاکت
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
            <p className="text-xs text-slate-500 mt-1">کنترل مستقیم و کم/زیاد کردن تعداد کارتن، باکس و پاکت و ذخیره مستقیم در محصول و دیتابیس</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onSaveProductStock && (
              <button
                type="button"
                onClick={handleSaveAllDirty}
                disabled={isSavingAll}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
              >
                {isSavingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>ذخیره کل موجودی در دیتابیس محصولات</span>
              </button>
            )}
            <button
              onClick={() => onOpenProductEditor(null)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ تعریف کالا / جنس جدید در انبار</span>
            </button>
          </div>
        </div>

        {/* Table of Inventory */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-right text-xs min-w-[820px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-3">تصویر</th>
                <th className="p-3">نام کالا و نوع فروش</th>
                <th className="p-3 text-center">کارتن (کلیدی)</th>
                <th className="p-3 text-center">باکس (تعدیل)</th>
                <th className="p-3 text-left">قیمت فروش</th>
                <th className="p-3 text-left">ارزش ریالی</th>
                <th className="p-3 text-center">وضعیت</th>
                <th className="p-3 text-center">ذخیره و ویرایش کالا</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {productsList.map((prod) => {
                const stockInfo = getProductStockInfo(prod);
                const draft = draftStocks[prod.id] || {
                  cartons: Math.max(0, Math.floor(Number(prod.stockCartons) || 0)),
                  boxes: Math.max(0, Math.floor(stockInfo.totalBoxes)),
                };
                const isDirty =
                  draft.cartons !== Math.max(0, Math.floor(Number(prod.stockCartons) || 0)) ||
                  draft.boxes !== Math.max(0, Math.floor(stockInfo.totalBoxes));
                const isSaving = Boolean(savingMap[prod.id]);
                const isSaved = Boolean(savedMap[prod.id]);
                const productTotalVal = draft.cartons * prod.cartonPrice;
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
                          disabled={isSaving}
                          onClick={() => handleStepStock(prod, 'carton', 1)}
                          className="w-6 h-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer"
                          title="افزایش ۱ کارتن و ذخیره در دیتابیس"
                        >
                          +
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberFa(draft.cartons)}
                          onChange={(e) => handleDirectInputChange(prod, 'carton', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRow(prod);
                          }}
                          className="w-12 bg-white border border-slate-200 rounded-lg py-0.5 font-bold font-mono text-xs text-indigo-700 text-center focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleStepStock(prod, 'carton', -1)}
                          className="w-6 h-6 bg-white hover:bg-rose-100 disabled:opacity-50 text-rose-700 rounded-lg font-bold text-xs flex items-center justify-center border border-slate-200 cursor-pointer"
                          title="کاهش ۱ کارتن و ذخیره در دیتابیس"
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
                          disabled={isSaving}
                          onClick={() => handleStepStock(prod, 'box', 1)}
                          className="w-6 h-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer"
                          title="افزایش ۱ باکس و ذخیره در دیتابیس"
                        >
                          +
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberFa(draft.boxes)}
                          onChange={(e) => handleDirectInputChange(prod, 'box', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRow(prod);
                          }}
                          className="w-14 bg-white border border-slate-200 rounded-lg py-0.5 font-bold font-mono text-xs text-slate-800 text-center focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleStepStock(prod, 'box', -1)}
                          className="w-6 h-6 bg-white hover:bg-rose-100 disabled:opacity-50 text-rose-700 rounded-lg font-bold text-xs flex items-center justify-center border border-slate-200 cursor-pointer"
                          title="کاهش ۱ باکس و ذخیره در دیتابیس"
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
                        <div className="space-y-0.5">
                          <div>هر کارتن: {formatToman(prod.cartonPrice)}</div>
                          <div className="text-[10px] text-indigo-600 font-sans font-bold">
                            ({formatTomanInWords(prod.cartonPrice)})
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {formatToman(prod.boxPrice)} باکس / {formatToman(prod.packPrice)} پاکت
                          </div>
                          {onConvertProductRialToToman && prod.cartonPrice >= 100_000_000 && (
                            <button
                              type="button"
                              onClick={() => onConvertProductRialToToman(prod)}
                              className="mt-1 px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-sans font-bold transition-colors cursor-pointer"
                              title="اگر قیمت به ریال (با یک صفر اضافه) وارد شده، با کلیک به تومان تقسیم بر ۱۰ می‌شود"
                            >
                              اصلاح یک صفر اضافه (÷۱۰ به تومان: {formatTomanInWords(Math.round(prod.cartonPrice / 10))})
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-left font-mono font-black text-emerald-600">
                      <div>{formatToman(productTotalVal)}</div>
                      <div className="text-[10px] text-emerald-700 font-sans font-bold mt-0.5">
                        {formatTomanInWords(productTotalVal)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                        ({formatNumberFa(Math.floor(draft.cartons))} کارتن × {formatTomanInWords(prod.cartonPrice)})
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {stockInfo.isAvailable ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                          {prod.category === 'drinks_coffee'
                            ? `موجود (${formatNumberFa(stockInfo.cartons)} عدد)`
                            : `موجود (${formatNumberFa(Math.floor(stockInfo.cartons))} کارتن / ${formatNumberFa(Math.floor(stockInfo.totalBoxes))} باکس)`}
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                          اتمام موجودی
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onSaveProductStock && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSaveRow(prod)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                              isSaved
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : isDirty
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm animate-pulse'
                                  : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border-emerald-200'
                            }`}
                            title="ذخیره موجودی این کالا در دیتابیس و بخش محصولات"
                          >
                            {isSaving ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isSaved ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            <span>{isSaved ? 'ذخیره شد' : 'ذخیره موجودی'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenProductEditor(prod)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold transition-colors border border-indigo-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                          title="ویرایش کامل کالا در بخش مدیریت کالا"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>ویرایش کالا</span>
                        </button>
                      </div>
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
