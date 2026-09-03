import React from 'react';
import { CigaretteProduct } from '../types';
import { formatToman, formatNumberFa } from '../utils/formatters';
import { X, Check, XCircle, ShieldCheck } from 'lucide-react';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: CigaretteProduct[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: CigaretteProduct, unit: 'carton' | 'box', quantity: number) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  onRemoveProduct,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              VS
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">مقایسه مشخصات و قیمت محصولات</h2>
              <p className="text-xs text-slate-500">مقایسه هم‌زمان تا چند محصول دخانیات سرو</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {selectedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-sm font-bold text-slate-600">هیچ محصولی برای مقایسه انتخاب نشده است.</p>
              <p className="text-xs text-slate-400">از کارت محصولات در کاتالوگ گزینه «مقایسه» را انتخاب کنید.</p>
            </div>
          ) : selectedProducts.length === 1 ? (
            <div className="text-center py-16 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-black border border-amber-200">
                VS
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800">نیاز به انتخاب حداقل ۲ محصول</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  برای مشاهده جدول مقایسه، لطفاً حداقل دو محصول را انتخاب کنید (در حال حاضر ۱ محصول انتخاب شده است). از کاتالوگ محصولات یک محصول دیگر را برای مقایسه انتخاب کنید.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-right">
                <thead>
                  <tr>
                    <th className="p-4 bg-slate-50 text-slate-500 text-xs font-bold w-44 border-b border-slate-200 sticky right-0 z-10">
                      ویژگی / مشخصه
                    </th>
                    {selectedProducts.map((p) => (
                      <th key={p.id} className="p-4 bg-white border-b border-slate-200 min-w-[260px] relative">
                        <button
                          onClick={() => onRemoveProduct(p.id)}
                          className="absolute top-2 left-2 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف از مقایسه"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="flex flex-col items-center text-center space-y-2 pt-2">
                          <img src={p.image} alt={p.nameFa} className="w-20 h-20 object-contain rounded-xl bg-slate-50 p-1" />
                          <span className="text-xs font-black text-slate-900">{p.nameFa}</span>
                          <span className="text-[10px] text-slate-400 font-mono" dir="ltr">{p.nameEn}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">برند</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 text-slate-800 font-bold">{p.brand}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">دسته‌بندی</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 text-slate-700">{p.category}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">کشور سازنده / مبدأ</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 text-slate-700">{p.origin}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">بارکد کالا</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-mono text-slate-600" dir="ltr">{p.barcode}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">نرخ کارتن پلمپ</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-black text-blue-600 text-sm">{formatToman(p.cartonPrice)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">تعداد در کارتن</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-bold text-slate-800">{formatNumberFa(p.boxesPerCarton)} باکس در کارتن</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">نرخ هر باکس</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-bold text-slate-800">{formatToman(p.boxPrice)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">حداقل سفارش (MOQ)</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-bold text-slate-700">{formatNumberFa(p.moq || 1)} کارتن</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">وضعیت اصالت و هولوگرام</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                          <ShieldCheck className="w-3.5 h-3.5" /> اورجینال و تست‌نشده
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">اقدام سریع</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4">
                        <button
                          onClick={() => onAddToCart(p, 'carton', p.moq || 1)}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          افزودن کارتن به سبد خرید
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-bold">
            تعداد محصولات در حال مقایسه: <strong className="text-slate-900">{selectedProducts.length}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            بستن مقایسه
          </button>
        </div>
      </div>
    </div>
  );
};
