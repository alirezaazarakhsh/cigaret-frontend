import React, { useState, useEffect } from 'react';
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
  Tag,
  Coffee,
  Flame,
  Scale,
  Package,
  Plus,
  Database
} from 'lucide-react';
import { CigaretteProduct, CigaretteCategory } from '../../types';
import { formatToman } from '../../utils/formatters';
import { 
  fetchDjangoCategories, 
  saveCategoryToDjango, 
  fetchDjangoHolograms, 
  saveHologramToDjango,
  saveProductToDjango,
  djangoDatabaseStore
} from '../../services/djangoApi';

interface QuickAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: CigaretteProduct, addToCartDirectly: boolean) => void;
  initialBarcode?: string;
}

export const QuickAddProductModal: React.FC<QuickAddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  initialBarcode,
}) => {
  const [categories, setCategories] = useState<{ key: CigaretteCategory; label: string }[]>(() => 
    djangoDatabaseStore.getCategories()
  );

  const [holograms, setHolograms] = useState<string[]>(() => 
    djangoDatabaseStore.getHolograms()
  );

  // Load from Django Database Store / API on mount
  useEffect(() => {
    fetchDjangoCategories().then(cats => setCategories(cats));
    fetchDjangoHolograms().then(hols => setHolograms(hols));
  }, [isOpen]);

  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [brand, setBrand] = useState('سوین');
  const [category, setCategory] = useState<CigaretteCategory>('cigarettes');
  
  // Custom Category & Hologram Inputs
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  
  const [showNewHologramInput, setShowNewHologramInput] = useState(false);
  const [newHologramVal, setNewHologramVal] = useState('');

  // Hologram selected
  const [hologram, setHologram] = useState<string>('اورجینال اروپایی');
  const [origin, setOrigin] = useState<string>('وارداتی اصل');

  // Flexible Packaging Level Toggles (Any product can have Carton, Box, Pack/Single)
  const [enableCarton, setEnableCarton] = useState<boolean>(true);
  const [enableBox, setEnableBox] = useState<boolean>(true);
  const [enablePack, setEnablePack] = useState<boolean>(true);

  // Pricing & Quantities for active packaging levels
  const [cartonPrice, setCartonPrice] = useState<number>(45000000);
  const [boxPrice, setBoxPrice] = useState<number>(900000);
  const [packPrice, setPackPrice] = useState<number>(90000);
  
  const [boxesPerCarton, setBoxesPerCarton] = useState<number>(50);
  const [packsPerBox, setPacksPerBox] = useState<number>(10);
  const [initialCartons, setInitialCartons] = useState<number>(10);
  
  const [unitName, setUnitName] = useState<string>('پاکت / عدد');
  const [barcode, setBarcode] = useState('');
  
  const [isPosOnly, setIsPosOnly] = useState<boolean>(false);
  const [addToCartAfterSave, setAddToCartAfterSave] = useState<boolean>(true);

  // Auto adjusting defaults when category changes
  useEffect(() => {
    if (category === 'iqos_devices') {
      setEnableCarton(true);
      setEnableBox(true);
      setEnablePack(false); // IQOS devices don't have pack!
      setUnitName('دستگاه / عدد');
    } else if (category === 'accessories') {
      setEnableCarton(false); // Lighters/Accessories usually box & single
      setEnableBox(true);
      setEnablePack(true);
      setUnitName('عدد');
    } else if (category === 'drinks_coffee') {
      setEnableCarton(false);
      setEnableBox(false);
      setEnablePack(true);
      setUnitName('فنجان / شات');
    } else if (category === 'charcoal') {
      setEnableCarton(true);
      setEnableBox(true);
      setEnablePack(true);
      setUnitName('کیلو / بسته');
    } else if (category === 'cigarettes' || category === 'iqos_heets') {
      setEnableCarton(true);
      setEnableBox(true);
      setEnablePack(true);
      setUnitName('پاکت');
    }
  }, [category]);

  useEffect(() => {
    if (isOpen) {
      if (initialBarcode) {
        setBarcode(initialBarcode);
      }
    } else {
      setNameFa('');
      setNameEn('');
    }
  }, [isOpen, initialBarcode]);

  if (!isOpen) return null;

  const handleAddNewCategory = async () => {
    if (!newCatLabel.trim()) return;
    const customKey = `cat_${Date.now()}` as CigaretteCategory;
    const label = newCatLabel.trim();
    
    // Save to Django DB Store & Backend API
    await saveCategoryToDjango(customKey, label);
    const updatedCats = djangoDatabaseStore.getCategories();
    setCategories(updatedCats);
    setCategory(customKey);
    setNewCatLabel('');
    setShowNewCatInput(false);
  };

  const handleAddNewHologram = async () => {
    if (!newHologramVal.trim()) return;
    const val = newHologramVal.trim();
    
    // Save to Django DB Store & Backend API
    await saveHologramToDjango(val);
    const updatedHols = djangoDatabaseStore.getHolograms();
    setHolograms(updatedHols);
    setHologram(val);
    setNewHologramVal('');
    setShowNewHologramInput(false);
  };

  const generateRandomBarcode = () => {
    const prefix = '626' + Math.floor(1000000000 + Math.random() * 9000000000).toString().slice(0, 9);
    setBarcode(prefix);
  };

  const handleCartonPriceChange = (val: number) => {
    setCartonPrice(val);
    if (boxesPerCarton > 0 && enableBox) {
      const calcBox = Math.round(val / boxesPerCarton);
      setBoxPrice(calcBox);
      if (packsPerBox > 0 && enablePack) {
        setPackPrice(Math.round(calcBox / packsPerBox));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) {
      alert('لطفاً نام فارسی کالا را وارد نمایید.');
      return;
    }

    const finalBarcode = barcode.trim() || '626' + Date.now().toString().slice(-9);

    const finalCartonPrice = enableCarton ? Number(cartonPrice) || 0 : 0;
    const finalBoxPrice = enableBox ? Number(boxPrice) || 0 : 0;
    const finalPackPrice = enablePack ? Number(packPrice) || 0 : 0;

    const newProduct: CigaretteProduct = {
      id: `prod_${Date.now()}`,
      nameFa: nameFa.trim(),
      nameEn: nameEn.trim() || nameFa.trim(),
      brand: brand.trim() || 'سوین',
      category,
      origin: origin || 'اصلی',
      tar: '0',
      nicotine: '0',
      cartonPrice: finalCartonPrice,
      baseCartonPrice: finalCartonPrice,
      boxPrice: finalBoxPrice,
      packPrice: finalPackPrice,
      boxesPerCarton: enableCarton ? (Number(boxesPerCarton) || 50) : 1,
      packsPerBox: enableBox ? (Number(packsPerBox) || 10) : 1,
      stockCartons: Number(initialCartons) || 0,
      hasCarton: enableCarton,
      hasBox: enableBox,
      hasPack: enablePack,
      unitName,
      pricePerUnit: finalPackPrice,
      moq: 1,
      image: category === 'drinks_coffee' 
        ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' 
        : category === 'charcoal'
          ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
          : category === 'iqos_devices' || category === 'iqos_heets'
            ? 'https://images.unsplash.com/photo-1527016021513-b09758b777bd?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?auto=format&fit=crop&w=600&q=80',
      barcode: finalBarcode,
      lastPriceUpdate: new Date().toLocaleDateString('fa-IR'),
      hologram: hologram === 'بدون هولوگرام' ? '' : hologram,
      tierDiscounts: [],
      description: `ثبت اختصاصی دیتابیس صندوق بنکداری سوین در تاریخ ${new Date().toLocaleDateString('fa-IR')}`,
      isAvailable: true,
      isPosOnly,
    };

    // Save directly to Django Database API
    await saveProductToDjango(newProduct);

    onAddProduct(newProduct, addToCartAfterSave);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl my-auto max-h-[85vh] overflow-y-auto modal-overscroll-contain space-y-5 relative"
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
                تعریف سریع کالا و تعیین سطوح قیمت‌گذاری
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تنظیم دقیق دسته‌بندی، اصالت، بارکد و فعال‌سازی تکی / باکسی / کارتنی
              </p>
            </div>
          </div>
          <button 
            type="button"
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
                placeholder="مثال: دستگاه ایکاس ایلوما پرایم مشکی / فندک زیپو اصل"
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
                  placeholder="IQOS / Zippo / Marlboro"
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

          {/* DYNAMIC CATEGORY & HOLOGRAM MANAGERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category selection + Dynamic Add */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">دسته‌بندی کالا:</label>
                <button
                  type="button"
                  onClick={() => setShowNewCatInput(!showNewCatInput)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  + افزودن دسته‌بندی جدید
                </button>
              </div>

              {showNewCatInput ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder="نام دسته‌بندی جدید..."
                    className="flex-1 bg-indigo-50 border border-indigo-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold text-[11px]"
                  >
                    ثبت
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CigaretteCategory)}
                  className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Hologram selection + Dynamic Add */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">اصالت و هولوگرام:</label>
                <button
                  type="button"
                  onClick={() => setShowNewHologramInput(!showNewHologramInput)}
                  className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  + افزودن اصالت جدید
                </button>
              </div>

              {showNewHologramInput ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newHologramVal}
                    onChange={(e) => setNewHologramVal(e.target.value)}
                    placeholder="عنوان اصالت/هولوگرام..."
                    className="flex-1 bg-emerald-50 border border-emerald-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewHologram}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-[11px]"
                  >
                    ثبت
                  </button>
                </div>
              ) : (
                <select
                  value={hologram}
                  onChange={(e) => setHologram(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                >
                  {holograms.map((hol, idx) => (
                    <option key={idx} value={hol}>
                      {hol === 'بدون هولوگرام' ? 'بدون هولوگرام / عادی (عدم نمایش نشان)' : hol}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* FLEXIBLE PACKAGING LEVEL TOGGLES (Carton / Box / Pack) */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>تعیین سطوح بسته‌بندی و فروش کالا (فعال‌سازی هوشمند)</span>
              </span>
              <span className="text-[10px] text-slate-500">
                سطوح غیرفعال در فرانت و صندوق نمایش داده نمی‌شوند
              </span>
            </div>

            {/* Checkboxes to enable/disable levels */}
            <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCarton}
                  onChange={(e) => setEnableCarton(e.target.checked)}
                  className="text-indigo-600 rounded w-4 h-4"
                />
                <span className={`font-bold ${enableCarton ? 'text-indigo-900' : 'text-slate-400'}`}>
                  📦 فروش کارتنی
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBox}
                  onChange={(e) => setEnableBox(e.target.checked)}
                  className="text-indigo-600 rounded w-4 h-4"
                />
                <span className={`font-bold ${enableBox ? 'text-indigo-900' : 'text-slate-400'}`}>
                  📥 فروش باکسی / جعبه‌ای
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePack}
                  onChange={(e) => setEnablePack(e.target.checked)}
                  className="text-indigo-600 rounded w-4 h-4"
                />
                <span className={`font-bold ${enablePack ? 'text-indigo-900' : 'text-slate-400'}`}>
                  🏷️ فروش تک / پاکتی / عددی
                </span>
              </label>
            </div>

            {/* Price inputs for enabled levels */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Carton Price */}
              <div className={`transition-all ${enableCarton ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="block text-[11px] text-slate-700 font-bold mb-1">قیمت هر کارتن (تومان):</label>
                <input
                  type="number"
                  disabled={!enableCarton}
                  value={cartonPrice || ''}
                  onChange={(e) => handleCartonPriceChange(Number(e.target.value) || 0)}
                  placeholder="۴۵,۰۰۰,۰۰۰"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-black text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Box Price */}
              <div className={`transition-all ${enableBox ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="block text-[11px] text-slate-700 font-bold mb-1">قیمت هر باکس / جعبه (تومان):</label>
                <input
                  type="number"
                  disabled={!enableBox}
                  value={boxPrice || ''}
                  onChange={(e) => setBoxPrice(Number(e.target.value) || 0)}
                  placeholder="۹۰۰,۰۰۰"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-black text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Pack / Single Price */}
              <div className={`transition-all ${enablePack ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="block text-[11px] text-slate-700 font-bold mb-1">قیمت فروش تکی / پاکت (تومان):</label>
                <input
                  type="number"
                  disabled={!enablePack}
                  value={packPrice || ''}
                  onChange={(e) => setPackPrice(Number(e.target.value) || 0)}
                  placeholder="۹۰,۰۰۰"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Sub-counts & Unit Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
              {enableCarton && (
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">باکس / جعبه در هر کارتن:</label>
                  <input
                    type="number"
                    value={boxesPerCarton}
                    onChange={(e) => setBoxesPerCarton(Number(e.target.value) || 50)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-center text-xs"
                  />
                </div>
              )}

              {enableBox && (
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">پاکت / تکی در هر باکس:</label>
                  <input
                    type="number"
                    value={packsPerBox}
                    onChange={(e) => setPacksPerBox(Number(e.target.value) || 10)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-center text-xs"
                  />
                </div>
              )}

              {enablePack && (
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">عنوان واحد تکی:</label>
                  <input
                    type="text"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="پاکت / عدد / کیلو"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-center text-xs font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">موجودی اولیه (کارتن / تعداد):</label>
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
                  بلافاصله پس از ثبت به سبد صندوق اضافه شود
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
