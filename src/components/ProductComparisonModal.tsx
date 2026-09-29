import React from 'react';
import { CigaretteProduct } from '../types';
import { formatToman, formatNumberFa } from '../utils/formatters';
import { getProductRichOverride } from '../services/djangoApi';
import { X, Check, XCircle, ShieldCheck } from 'lucide-react';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: CigaretteProduct[];
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: CigaretteProduct, unit: 'carton' | 'box' | 'pack', quantity: number) => void;
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
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer modal-overscroll-contain"
      style={{ overscrollBehavior: 'contain' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden cursor-default modal-overscroll-contain"
        style={{ overscrollBehavior: 'contain' }}
        onClick={(e) => e.stopPropagation()}
      >
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
                      <td key={p.id} className="p-4 text-slate-700">{p.origin || '—'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">قطران (Tar)</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-mono font-bold text-slate-800" dir="ltr">{p.tar || '—'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">نیکوتین (Nicotine)</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-mono font-bold text-slate-800" dir="ltr">{p.nicotine || '—'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">سایز پاکت / قطع</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 text-slate-700">{p.packSize || 'کینگ سایز'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">طعم و فیلتر</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 text-slate-700 text-xs">
                        <div>{p.flavor || 'کلاسیک'}</div>
                        {p.filterType && <div className="text-[11px] text-slate-500 mt-0.5">{p.filterType}</div>}
                      </td>
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
                    {selectedProducts.map((p) => {
                      const ov = getProductRichOverride(p.id);
                      const showCarton = (ov?.hasCarton ?? p.hasCarton) !== false && !(ov?.isBoxOnly ?? p.isBoxOnly);
                      return (
                        <td key={p.id} className="p-4 font-black text-blue-600 text-sm">
                          {showCarton && p.cartonPrice > 0 ? formatToman(p.cartonPrice) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">تعداد در کارتن</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4 font-bold text-slate-800">{formatNumberFa(p.boxesPerCarton || 50)} باکس ({formatNumberFa((p.boxesPerCarton || 50) * (p.packsPerBox || 10))} پاکت)</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">نرخ هر باکس</td>
                    {selectedProducts.map((p) => {
                      const ov = getProductRichOverride(p.id);
                      const showBox = (ov?.hasBox ?? p.hasBox) !== false;
                      return (
                        <td key={p.id} className="p-4 font-bold text-slate-800">
                          {showBox && p.boxPrice > 0 ? formatToman(p.boxPrice) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">نرخ هر پاکت</td>
                    {selectedProducts.map((p) => {
                      const ov = getProductRichOverride(p.id);
                      const showPack = Boolean(ov?.hasPack ?? p.hasPack);
                      const pPrice = (ov?.packPrice && Number(ov.packPrice) > 0)
                        ? Number(ov.packPrice)
                        : (p.packPrice || (p.boxPrice ? Math.round(p.boxPrice / (p.packsPerBox || 10)) : 0));
                      return (
                        <td key={p.id} className="p-4 font-black text-emerald-700">
                          {showPack && pPrice > 0 ? formatToman(pPrice) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">حداقل سفارش (MOQ)</td>
                    {selectedProducts.map((p) => {
                      const ov = getProductRichOverride(p.id);
                      const showCarton = (ov?.hasCarton ?? p.hasCarton) !== false && !(ov?.isBoxOnly ?? p.isBoxOnly);
                      const showBox = (ov?.hasBox ?? p.hasBox) !== false;
                      const showPack = Boolean(ov?.hasPack ?? p.hasPack);
                      const mCarton = Math.max(1, Number(p.moq) || 0, Number((p as any).min_order_carton) || 0, Number(ov?.moq) || 0);
                      const mBox = Math.max(1, Number(p.moqBox) || 0, Number((p as any).min_order_box) || 0, Number(ov?.moqBox) || 0);
                      const mPack = Math.max(1, Number(p.moqPack) || 0, Number((p as any).min_order_pack) || 0, Number(ov?.moqPack) || 0);
                      return (
                        <td key={p.id} className="p-4 font-bold text-slate-700 space-y-1">
                          {showCarton && <div>کارتن: {formatNumberFa(mCarton)} عدد</div>}
                          {showBox && <div>باکس: {formatNumberFa(mBox)} عدد</div>}
                          {showPack && <div className="text-emerald-700">پاکت: {formatNumberFa(mPack)} عدد</div>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">وضعیت اصالت و هولوگرام</td>
                    {selectedProducts.map((p) => (
                      <td key={p.id} className="p-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                          <ShieldCheck className="w-3.5 h-3.5" /> {p.hologram && p.hologram !== 'بدون هولوگرام' ? p.hologram : 'اورجینال و تست‌نشده'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50 sticky right-0">اقدام سریع</td>
                    {selectedProducts.map((p) => {
                      const ov = getProductRichOverride(p.id);
                      const showCarton = (ov?.hasCarton ?? p.hasCarton) !== false && !(ov?.isBoxOnly ?? p.isBoxOnly);
                      const showBox = (ov?.hasBox ?? p.hasBox) !== false;
                      const showPack = Boolean(ov?.hasPack ?? p.hasPack);
                      const mCarton = Math.max(1, Number(p.moq) || 0, Number((p as any).min_order_carton) || 0, Number(ov?.moq) || 0);
                      const mBox = Math.max(1, Number(p.moqBox) || 0, Number((p as any).min_order_box) || 0, Number(ov?.moqBox) || 0);
                      const mPack = Math.max(1, Number(p.moqPack) || 0, Number((p as any).min_order_pack) || 0, Number(ov?.moqPack) || 0);
                      return (
                        <td key={p.id} className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {showCarton && (
                              <button
                                onClick={() => {
                                  onAddToCart(p, 'carton', mCarton);
                                  onClose();
                                }}
                                className="flex-1 py-2 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                              >
                                + سفارش کارتن{mCarton > 1 ? ` (${formatNumberFa(mCarton)})` : ''}
                              </button>
                            )}
                            {showBox && (
                              <button
                                onClick={() => {
                                  onAddToCart(p, 'box', mBox);
                                  onClose();
                                }}
                                className="flex-1 py-2 px-2.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-[11px] rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                              >
                                + سفارش باکس{mBox > 1 ? ` (${formatNumberFa(mBox)})` : ''}
                              </button>
                            )}
                            {showPack && (
                              <button
                                onClick={() => {
                                  onAddToCart(p, 'pack', mPack);
                                  onClose();
                                }}
                                className="flex-1 py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                              >
                                + سفارش پاکت{mPack > 1 ? ` (${formatNumberFa(mPack)})` : ''}
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
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
