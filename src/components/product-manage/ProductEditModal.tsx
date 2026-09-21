import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  Check,
  Package,
  Layers,
  ShieldCheck,
  DollarSign,
  Tag,
  Barcode,
  Globe,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Plus,
  Trash2
} from 'lucide-react';
import { CigaretteProduct, CigaretteCategory, WholesaleTierDiscount } from '../../types';
import { ProductCategoryItem, ProductHologramItem } from './types';
import { formatNumberFa, formatToman } from '../../utils/formatters';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CigaretteProduct | null;
  categories: ProductCategoryItem[];
  holograms: ProductHologramItem[];
  onSave: (savedProduct: CigaretteProduct) => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  holograms,
  onSave,
}) => {
  const isEditing = Boolean(product);

  const [formData, setFormData] = useState<Partial<CigaretteProduct>>({
    nameFa: '',
    nameEn: '',
    brand: 'Marlboro',
    category: 'cigarettes',
    origin: 'سوئیس اصل',
    tar: '6 mg',
    nicotine: '0.5 mg',
    cartonPrice: 0,
    boxPrice: 0,
    packPrice: 0,
    boxesPerCarton: 50,
    stockCartons: 10,
    moq: 1,
    image: '',
    barcode: '',
    badge: 'بار تازه',
    hologram: 'اورجینال اروپایی',
    isAvailable: true,
    description: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newTierUnit, setNewTierUnit] = useState<'carton' | 'box'>('carton');
  const [newTierQty, setNewTierQty] = useState<number | ''>('');
  const [newTierDiscount, setNewTierDiscount] = useState<number | ''>('');

  const handleAddTier = () => {
    const qty = Number(newTierQty);
    const pct = Number(newTierDiscount);
    if (!qty || qty <= 0 || !pct || pct <= 0) return;

    const newTier: WholesaleTierDiscount = {
      unit: newTierUnit,
      minQuantity: qty,
      minCartons: newTierUnit === 'carton' ? qty : undefined,
      discountPercentage: pct,
      discountPercent: pct,
      label: `خرید بالای ${qty} ${newTierUnit === 'carton' ? 'کارتن' : 'باکس'} (${pct}٪ تخفیف)`
    };

    setFormData(prev => ({
      ...prev,
      tierDiscounts: [...(prev.tierDiscounts || []), newTier]
    }));
    setNewTierQty('');
    setNewTierDiscount('');
  };

  const handleRemoveTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tierDiscounts: (prev.tierDiscounts || []).filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        moq: (product.moq !== undefined && product.moq !== null) ? Number(product.moq) : 0,
        moqBox: (product.moqBox !== undefined && product.moqBox !== null) ? Number(product.moqBox) : 0,
        tierDiscounts: product.tierDiscounts ? [...product.tierDiscounts] : [],
      });
      setImagePreview(product.image || '');
    } else {
      setFormData({
        id: `prod_${Date.now()}`,
        nameFa: '',
        nameEn: '',
        brand: '',
        category: 'cigarettes',
        origin: 'سوئیس اصل',
        tar: '6 mg',
        nicotine: '0.5 mg',
        cartonPrice: 0,
        boxPrice: 0,
        packPrice: 0,
        boxesPerCarton: 50,
        stockCartons: 10,
        moq: 0,
        moqBox: 0,
        image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80',
        barcode: String(Math.floor(1000000000000 + Math.random() * 9000000000000)),
        badge: 'بار تازه',
        hologram: 'اورجینال اروپایی',
        isAvailable: true,
        tierDiscounts: [],
        description: '',
      });
      setImagePreview('https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setFormData((prev) => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameFa || !formData.cartonPrice) return;

    setIsSaving(true);
    try {
      const saved: CigaretteProduct = {
        id: formData.id || (product ? product.id : `prod_${Date.now()}`),
        djangoId: formData.djangoId || (product?.djangoId ? product.djangoId : Math.floor(Math.random() * 1000) + 100),
        nameFa: formData.nameFa || '',
        nameEn: formData.nameEn || '',
        brand: formData.brand || 'دخانیات سرو',
        category: (formData.category as CigaretteCategory) || 'cigarettes',
        origin: formData.origin || 'وارداتی اصل',
        tar: formData.tar || '6 mg',
        nicotine: formData.nicotine || '0.5 mg',
        cartonPrice: Number(formData.cartonPrice) || 0,
        baseCartonPrice: Number(formData.cartonPrice) || 0,
        boxPrice: Number(formData.boxPrice) || Math.round((Number(formData.cartonPrice) || 0) / (Number(formData.boxesPerCarton) || 50)),
        baseBoxPrice: Number(formData.boxPrice) || 0,
        packPrice: Number(formData.packPrice) || 0,
        boxesPerCarton: Number(formData.boxesPerCarton) || 50,
        stockCartons: Number(formData.stockCartons) || 0,
        moq: typeof formData.moq === 'number' ? formData.moq : (Number(formData.moq) || 0),
        moqBox: typeof formData.moqBox === 'number' ? formData.moqBox : (Number(formData.moqBox) || 0),
        image: imagePreview || formData.image || 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80',
        barcode: formData.barcode || String(Math.floor(1000000000000 + Math.random() * 9000000000000)),
        badge: formData.badge,
        priceTrend: formData.priceTrend || 'stable',
        lastPriceUpdate: 'امروز ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        hologram: formData.hologram || 'اورجینال اروپایی',
        isAvailable: formData.isAvailable ?? true,
        tierDiscounts: formData.tierDiscounts || [],
        description: formData.description || '',
      };

      await onSave(saved);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-right" dir="rtl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/75">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  {isEditing ? 'ویرایش کالا و قیمت‌گذاری' : 'تعریف و ثبت کالای جدید در انبار'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200">
                  Django Store Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ثبت اطلاعات شناسنامه‌ای، قیمت عمده کارتن، هولوگرام و مشخصات فنی
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Right 2 Columns: Main Fields */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نام فارسی کالا <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameFa || ''}
                    onChange={(e) => setFormData({ ...formData, nameFa: e.target.value })}
                    placeholder="مثال: مارلبرو گلد سوئیس (پایه کوتاه)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">نام لاتین کالا (English)</label>
                  <input
                    type="text"
                    value={formData.nameEn || ''}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="مثال: Marlboro Gold Original (Swiss)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all dir-ltr text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">برند تجاری</label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="مثال: Marlboro / Winston"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">کشور مبدأ و ساخت</label>
                  <input
                    type="text"
                    value={formData.origin || ''}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="سوئیس اصل / ترکیه / دبی"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">بارکد استاندارد کالا</label>
                  <div className="relative">
                    <Barcode className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.barcode || ''}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="7610111245012"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono dir-ltr text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-blue-900">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span>قیمت‌گذاری عمده و خرده (تومان)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      قیمت کارتن (تومان) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.cartonPrice || ''}
                      onChange={(e) => setFormData({ ...formData, cartonPrice: Number(e.target.value) })}
                      placeholder="91000000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-black focus:outline-none focus:border-blue-500"
                    />
                    {Number(formData.cartonPrice) > 0 && (
                      <span className="text-[10px] text-blue-700 font-bold mt-1 block">
                        {formatToman(Number(formData.cartonPrice))}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">قیمت باکس (تومان)</label>
                    <input
                      type="number"
                      value={formData.boxPrice || ''}
                      onChange={(e) => setFormData({ ...formData, boxPrice: Number(e.target.value) })}
                      placeholder="1900000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-black focus:outline-none focus:border-blue-500"
                    />
                    {Number(formData.boxPrice) > 0 && (
                      <span className="text-[10px] text-slate-600 font-bold mt-1 block">
                        {formatToman(Number(formData.boxPrice))}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">قیمت پاکت / تک (اختیاری)</label>
                    <input
                      type="number"
                      value={formData.packPrice || ''}
                      onChange={(e) => setFormData({ ...formData, packPrice: Number(e.target.value) })}
                      placeholder="190000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-black focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory & Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">موجودی کارتن</label>
                  <input
                    type="number"
                    value={formData.stockCartons ?? 10}
                    onChange={(e) => setFormData({ ...formData, stockCartons: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">باکس در هر کارتن</label>
                  <input
                    type="number"
                    value={formData.boxesPerCarton ?? 50}
                    onChange={(e) => setFormData({ ...formData, boxesPerCarton: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">MOQ کارتن (حداقل)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.moq ?? 0}
                    onChange={(e) => setFormData({ ...formData, moq: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    placeholder="0 = بدون محدودیت"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">MOQ باکس (حداقل)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.moqBox ?? 0}
                    onChange={(e) => setFormData({ ...formData, moqBox: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    placeholder="0 = بدون محدودیت"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">برچسب تجاری (Badge)</label>
                  <select
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="">بدون برچسب</option>
                    <option value="پرفروش">پرفروش</option>
                    <option value="بار تازه">بار تازه</option>
                    <option value="وارداتی اصل">وارداتی اصل</option>
                    <option value="تخفیف تیراژ">تخفیف تیراژ</option>
                    <option value="موجودی محدود">موجودی محدود</option>
                    <option value="جدید">جدید</option>
                  </select>
                </div>
              </div>

              {/* Technical specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">میزان قطران (Tar)</label>
                  <input
                    type="text"
                    value={formData.tar || ''}
                    onChange={(e) => setFormData({ ...formData, tar: e.target.value })}
                    placeholder="مثال: 6 mg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">میزان نیکوتین (Nicotine)</label>
                  <input
                    type="text"
                    value={formData.nicotine || ''}
                    onChange={(e) => setFormData({ ...formData, nicotine: e.target.value })}
                    placeholder="مثال: 0.5 mg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Tiered Discounts (Carton & Box) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <span>تخفیف تیراژ بنکداری (کارتن و باکس)</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {formData.tierDiscounts?.length || 0} پله تخفیف فعال
                  </span>
                </div>

                {/* Add Tier input row */}
                <div className="flex flex-wrap items-end gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="w-24 shrink-0">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">واحد:</label>
                    <select
                      value={newTierUnit}
                      onChange={(e) => setNewTierUnit(e.target.value as 'carton' | 'box')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                    >
                      <option value="carton">کارتن</option>
                      <option value="box">باکس</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[90px]">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      حداقل ({newTierUnit === 'carton' ? 'کارتن' : 'باکس'}):
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="۳"
                      value={newTierQty}
                      onChange={(e) => setNewTierQty(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="flex-1 min-w-[80px]">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">درصد تخفیف:</label>
                    <input
                      type="number"
                      min="0.5"
                      max="99"
                      step="0.5"
                      placeholder="۲"
                      value={newTierDiscount}
                      onChange={(e) => setNewTierDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-emerald-700"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTier}
                    disabled={!newTierQty || !newTierDiscount}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن</span>
                  </button>
                </div>

                {/* List of active tiers */}
                {formData.tierDiscounts && formData.tierDiscounts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formData.tierDiscounts.map((tier, idx) => {
                      const isBox = tier.unit === 'box' || (!tier.unit && tier.label?.includes('باکس'));
                      const qty = tier.minQuantity ?? tier.minCartons ?? 1;
                      const pct = tier.discountPercentage ?? tier.discountPercent ?? 0;

                      return (
                        <div
                          key={idx}
                          className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isBox ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isBox ? 'باکس' : 'کارتن'}
                            </span>
                            <span className="font-bold text-slate-800">
                              بالای {formatNumberFa(qty)} {isBox ? 'باکس' : 'کارتن'}:
                            </span>
                            <span className="font-black text-emerald-600">
                              {formatNumberFa(pct)}٪
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 text-center py-1">
                    پله تخفیفی ثبت نشده است (می‌توانید برای کارتن و باکس تخفیف پله‌ای تعریف کنید).
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">توضیحات و مشخصات بسته بندی</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیح کامل در رابطه با کیفیت توتون، نوع پاکت، پلمپ و تاریخ تولید..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* Left 1 Column: Image & Meta */}
            <div className="space-y-4">
              {/* Image Upload Box */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>تصویر شاخص محصول</span>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData((p) => ({ ...p, image: '' }));
                      }}
                      className="text-[10px] text-rose-600 hover:underline"
                    >
                      حذف تصویر
                    </button>
                  )}
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleImageFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                    isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-white'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                    accept="image/*"
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative group w-full flex flex-col items-center">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-32 h-32 object-contain rounded-xl shadow-xs"
                      />
                      <span className="text-[10px] text-slate-400 mt-2 font-medium">برای تغییر کلیک کنید</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-700">انتخاب تصویر یا رها کردن فایل</div>
                      <p className="text-[10px] text-slate-400">JPG, PNG, WebP حداکثر ۵ مگابایت</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">یا درج آدرس مستقیم تصویر (URL)</label>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-800 dir-ltr text-left"
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>دسته‌بندی محصول</span>
                </div>
                <select
                  value={formData.category || 'cigarettes'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as CigaretteCategory })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hologram Select */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>هولوگرام و اصالت کالا</span>
                </div>
                <select
                  value={formData.hologram || 'اورجینال اروپایی'}
                  onChange={(e) => setFormData({ ...formData, hologram: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  {holograms.map((h) => (
                    <option key={h.id} value={h.title}>
                      {h.title}
                    </option>
                  ))}
                  <option value="اورجینال">اورجینال استاندارد</option>
                  <option value="بدون هولوگرام">بدون هولوگرام</option>
                </select>
              </div>

              {/* Availability Toggle */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-800">وضعیت موجودی در انبار</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">نمایش به عنوان کالای موجود در کاتالوگ و صندوق</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable ?? true}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <Check className="w-4 h-4 shrink-0" />
              )}
              <span>{isSaving ? 'در حال ذخیره‌سازی در دیتابیس...' : (isEditing ? 'ذخیره تغییرات کالا' : 'ثبت قطعی کالا در دیتابیس')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
