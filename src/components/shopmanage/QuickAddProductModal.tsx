import React, { useState } from 'react';
import { 
  PackagePlus, 
  Barcode, 
  Sparkles, 
  X, 
  Check, 
  Layers, 
  DollarSign, 
  Boxes, 
  ShoppingCart,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { CigaretteProduct, CigaretteCategory } from '../../types';
import { formatToman } from '../../utils/formatters';

interface QuickAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: CigaretteProduct, addToCartDirectly: boolean) => void;
}

const CATEGORIES: { key: CigaretteCategory; label: string }[] = [
  { key: 'cigarettes', label: 'سیگار اورجینال' },
  { key: 'drinks_coffee', label: 'قهوه و نوشیدنی' },
  { key: 'iqos_heets', label: 'استیک تیریا و هیتس' },
  { key: 'iqos_devices', label: 'دستگاه آیکاس (IQOS)' },
  { key: 'pods_vapes', label: 'پاد و ویپ یکبارمصرف' },
  { key: 'tobacco', label: 'توتون و پیپ' },
  { key: 'accessories', label: 'فندک و اکسسوری' },
];

export const QuickAddProductModal: React.FC<QuickAddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [brand, setBrand] = useState('سوین');
  const [category, setCategory] = useState<CigaretteCategory>('cigarettes');
  const [cartonPrice, setCartonPrice] = useState<number>(45000000);
  const [boxPrice, setBoxPrice] = useState<number>(900000);
  const [packPrice, setPackPrice] = useState<number>(90000);
  const [boxesPerCarton, setBoxesPerCarton] = useState<number>(50);
  const [packsPerBox, setPacksPerBox] = useState<number>(10);
  const [initialCartons, setInitialCartons] = useState<number>(10);
  const [barcode, setBarcode] = useState('');
  const [hologram, setHologram] = useState<string>('اورجینال اروپایی');
  const [origin, setOrigin] = useState<string>('وارداتی اصل');
  const [isPosOnly, setIsPosOnly] = useState<boolean>(false);
  const [addToCartAfterSave, setAddToCartAfterSave] = useState<boolean>(true);

  if (!isOpen) return null;

  const generateRandomBarcode = () => {
    const prefix = '626' + Math.floor(1000000000 + Math.random() * 9000000000).toString().slice(0, 9);
    setBarcode(prefix);
  };

  const handleCartonPriceChange = (val: number) => {
    setCartonPrice(val);
    if (boxesPerCarton > 0) {
      const calcBox = Math.round(val / boxesPerCarton);
      setBoxPrice(calcBox);
      if (packsPerBox > 0) {
        setPackPrice(Math.round(calcBox / packsPerBox));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) {
      alert('لطفاً نام فارسی کالا را وارد نمایید.');
      return;
    }

    const finalBarcode = barcode.trim() || '626' + Date.now().toString().slice(-9);

    const newProduct: CigaretteProduct = {
      id: `prod_${Date.now()}`,
      nameFa: nameFa.trim(),
      nameEn: nameEn.trim() || nameFa.trim(),
      brand: brand.trim() || 'سوین',
      category,
      origin: origin || 'وارداتی اصل',
      tar: '0',
      nicotine: '0',
      cartonPrice: Number(cartonPrice) || 0,
      baseCartonPrice: Number(cartonPrice) || 0,
      boxPrice: Number(boxPrice) || 0,
      packPrice: Number(packPrice) || 0,
      boxesPerCarton: Number(boxesPerCarton) || 50,
      packsPerBox: Number(packsPerBox) || 10,
      stockCartons: Number(initialCartons) || 0,
      moq: 1,
      image: category === 'drinks_coffee' 
        ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' 
        : category === 'iqos_devices' || category === 'iqos_heets'
          ? 'https://images.unsplash.com/photo-1527016021513-b09758b777bd?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=600&q=80',
      barcode: finalBarcode,
      lastPriceUpdate: new Date().toLocaleDateString('fa-IR'),
      hologram,
      tierDiscounts: [],
      description: `ثبت سریع از صندوق و انبارداری سوین در تاریخ ${new Date().toLocaleDateString('fa-IR')}`,
      isAvailable: true,
      isPosOnly,
    };

    onAddProduct(newProduct, addToCartAfterSave);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto modal-overscroll-contain space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                تعریف سریع کالا / محصول جدید از صندوق
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ثبت آنی مشخصات، قیمت عمده، بارکد و موجودی اولیه مستقیماً در دیتابیس مشترک
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">نام فارسی کالا (الزامی):</label>
              <input
                type="text"
                required
                autoFocus
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                placeholder="مثال: مارلبرو تاچ مشکی دبی"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">نام لاتین / برند تجاری:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Marlboro Touch Black"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="برند"
                  className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">دسته‌بندی کالا:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CigaretteCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">اصالت و هولوگرام:</label>
              <select
                value={hologram}
                onChange={(e) => setHologram(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="اورجینال اروپایی">اورجینال اروپایی (پلمپ اصل)</option>
                <option value="سفارش دبی">سفارش دبی / فری‌شاپ</option>
                <option value="شرکتی اصل">شرکتی دخانیات ایران</option>
                <option value="تولید داخل">تولید داخل با هولوگرام</option>
              </select>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <span className="font-black text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>قیمت‌گذاری و بسته‌بندی</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">قیمت هر کارتن (تومان):</label>
                <input
                  type="number"
                  value={cartonPrice || ''}
                  onChange={(e) => handleCartonPriceChange(Number(e.target.value) || 0)}
                  placeholder="۴۵,۰۰۰,۰۰۰"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-black text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">قیمت هر باکس (تومان):</label>
                <input
                  type="number"
                  value={boxPrice || ''}
                  onChange={(e) => setBoxPrice(Number(e.target.value) || 0)}
                  placeholder="۹۰۰,۰۰۰"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-black text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">قیمت تک پاکت (تومان):</label>
                <input
                  type="number"
                  value={packPrice || ''}
                  onChange={(e) => setPackPrice(Number(e.target.value) || 0)}
                  placeholder="۹۰,۰۰۰"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">تعداد باکس در کارتن:</label>
                <input
                  type="number"
                  value={boxesPerCarton}
                  onChange={(e) => setBoxesPerCarton(Number(e.target.value) || 50)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-center text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">پاکت در هر باکس:</label>
                <input
                  type="number"
                  value={packsPerBox}
                  onChange={(e) => setPacksPerBox(Number(e.target.value) || 10)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-center text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">موجودی اولیه (کارتن):</label>
                <input
                  type="number"
                  value={initialCartons}
                  onChange={(e) => setInitialCartons(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-center text-xs font-bold text-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Barcode & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">بارکد استاندارد کالا:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="اسکن یا تایپ بارکد..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={generateRandomBarcode}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold whitespace-nowrap"
                >
                  تولید بارکد 🎲
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addToCartAfterSave}
                  onChange={(e) => setAddToCartAfterSave(e.target.checked)}
                  className="text-indigo-600 rounded"
                />
                <span className="font-bold text-indigo-950 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
                  بلافاصله پس از ثبت به سبد صندوق اضافه شود (۱ باکس)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPosOnly}
                  onChange={(e) => setIsPosOnly(e.target.checked)}
                  className="text-indigo-600 rounded"
                />
                <span className="text-slate-600 text-[11px]">
                  مختص فروش حضوری صندوق (در کاتالوگ آنلاین سراسری مخفی بماند)
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>ثبت و ذخیره کالا در انبار و صندوق</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
