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
  const [brand, setBrand] = useState('دخانیات سرو');
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
      brand: brand.trim() || 'دخانیات سرو',
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
      description: `ثبت اختصاصی دیتابیس صندوق بنکداری دخانیات سرو در تاریخ ${new Date().toLocaleDateString('fa-IR')}`,
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
        className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto modal-overscroll-contain space-y-5 relative"
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
                تعریف جامع کالا، کاتالوگ و سئو
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مدیریت کامل اطلاعات، تصاویر، ویژگی‌های سفارشی و تنظیمات انتشار آنلاین
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
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Image Placeholder */}
            <div className="col-span-1 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 transition-colors cursor-pointer">
              <Package className="w-8 h-8 mb-2" />
              <span className="font-bold">افزودن تصویر کالا</span>
            </div>

            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نام فارسی کالا (الزامی):</label>
                <input
                  type="text"
                  required
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">برند / دسته‌بندی:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CigaretteCategory)}
                    className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 font-bold focus:outline-none"
                  >
                    {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">توضیحات کوتاه:</label>
                <textarea
                  value={''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  rows={2}
                />
              </div>
              
              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">توضیحات کامل (بلند):</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Inline Custom Features */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <label className="block font-bold text-slate-800 mb-2">ویژگی‌های سفارشی (Inline):</label>
             <div className="flex gap-2">
                <input placeholder="نام ویژگی (مثلا وزن)" className="flex-1 rounded-xl border border-slate-200 px-3 py-2"/>
                <input placeholder="مقدار (مثلا ۵۰ گرم)" className="flex-1 rounded-xl border border-slate-200 px-3 py-2"/>
                <button type="button" className="px-3 bg-indigo-600 text-white rounded-xl">+</button>
             </div>
          </div>

          {/* SEO */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <input placeholder="عنوان SEO" className="rounded-xl border border-slate-200 px-3 py-2" />
            <input placeholder="توضیحات Meta SEO" className="rounded-xl border border-slate-200 px-3 py-2" />
          </div>

          {/* Publish Checkbox */}
          <label className="flex items-center gap-2 font-bold text-indigo-700">
            <input type="checkbox" className="w-4 h-4 text-indigo-600" />
            نمایش محصول در سایت کاتالوگ (انتشار عمومی)
          </label>
        </form>
      </div>
    </div>
  );
};
