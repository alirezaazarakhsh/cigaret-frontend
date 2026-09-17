import React, { useState } from 'react';
import { Award, Plus, Trash2, Edit3, Save, X, Globe, Building2, Upload } from 'lucide-react';
import { ProductBrandItem } from './types';
import { formatNumberFa } from '../../utils/formatters';

interface BrandListProps {
  brands: ProductBrandItem[];
  onAddBrand: (brand: Omit<ProductBrandItem, 'id'>) => void;
  onUpdateBrand: (brand: ProductBrandItem) => void;
  onDeleteBrand: (id: string) => void;
}

export const BrandList: React.FC<BrandListProps> = ({
  brands,
  onAddBrand,
  onUpdateBrand,
  onDeleteBrand,
}) => {
  const [editingBrand, setEditingBrand] = useState<ProductBrandItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');

  const handleStartEdit = (brand: ProductBrandItem) => {
    setEditingBrand(brand);
    setName(brand.name);
    setNameEn(brand.nameEn || '');
    setSlug(brand.slug || '');
    setCountry(brand.country || '');
    setLogo(brand.logo || '');
    setDescription(brand.description || '');
  };

  const handleCancelEdit = () => {
    setEditingBrand(null);
    setName('');
    setNameEn('');
    setSlug('');
    setCountry('');
    setLogo('');
    setDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingBrand) {
      onUpdateBrand({
        ...editingBrand,
        name: name.trim(),
        nameEn: nameEn.trim() || undefined,
        slug: slug.trim() || nameEn.trim().toLowerCase().replace(/\s+/g, '-') || name.trim(),
        country: country.trim() || undefined,
        logo: logo.trim() || undefined,
        description: description.trim() || undefined,
      });
      handleCancelEdit();
    } else {
      onAddBrand({
        name: name.trim(),
        nameEn: nameEn.trim() || undefined,
        slug: slug.trim() || nameEn.trim().toLowerCase().replace(/\s+/g, '-') || name.trim(),
        country: country.trim() || undefined,
        logo: logo.trim() || undefined,
        description: description.trim() || undefined,
      });
      setName('');
      setNameEn('');
      setSlug('');
      setCountry('');
      setLogo('');
      setDescription('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right 1 Column: Create / Edit Brand Form */}
        <div className={`p-5 rounded-2xl border shadow-xs space-y-4 transition-all ${
          editingBrand 
            ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                editingBrand ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-purple-50 text-purple-600'
              }`}>
                {editingBrand ? <Edit3 className="w-5 h-5" /> : <Award className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingBrand ? 'ویرایش برند کالا' : 'افزودن برند جدید'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingBrand ? `در حال ویرایش: ${editingBrand.name}` : 'تعریف کمپانی و سازنده محصولات'}
                </p>
              </div>
            </div>
            {editingBrand && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors text-xs flex items-center gap-1"
                title="انصراف از ویرایش"
              >
                <X className="w-4 h-4" />
                <span className="font-bold">انصراف</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نام برند (فارسی) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مارلبرو"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نام برند (انگلیسی)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Marlboro"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white dir-ltr text-left"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسلاگ سئو (Slug)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="marlboro"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white dir-ltr text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">کشور سازنده اصلی</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="سوییس / آمریکا"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">تصویر یا لوگوی برند (آپلود یا لینک)</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://.../logo.png یا انتخاب فایل"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white dir-ltr text-left font-mono"
                  />
                  <label className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>آپلود فایل</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setLogo(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {logo && (
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <img 
                      src={logo} 
                      alt="پیش‌نمایش لوگو" 
                      className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800">پیش‌نمایش لوگوی انتخاب‌شده</p>
                      <p className="text-[10px] text-slate-400 truncate dir-ltr text-left font-mono">{logo.startsWith('data:') ? 'تصویر آپلود شده (فایل محلی)' : logo}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLogo('')}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="حذف لوگو"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">توضیحات برند</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحات مختصر درباره تاریخچه یا ویژگی برند..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white leading-relaxed"
              />
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                type="submit"
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 ${
                  editingBrand
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                }`}
              >
                {editingBrand ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingBrand ? 'ذخیره تغییرات برند' : 'افزودن برند به لیست'}</span>
              </button>
              {editingBrand && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                >
                  انصراف
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Left 2 Columns: Brands Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-black text-slate-900">لیست برندهای ثبت‌شده کالا</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {formatNumberFa(brands.length)} برند ثبت‌شده
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-700 font-black">
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4">عنوان برند</th>
                    <th className="p-4">کشور / اسلاگ</th>
                    <th className="p-4">توضیحات</th>
                    <th className="p-4 text-center w-28">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brands.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        هیچ برندی ثبت نشده است. می‌توانید با استفاده از فرم مقابل برند جدید تعریف کنید.
                      </td>
                    </tr>
                  ) : (
                    brands.map((brand, index) => {
                      const isBeingEdited = editingBrand?.id === brand.id;

                      return (
                        <tr 
                          key={brand.id} 
                          className={`transition-colors ${
                            isBeingEdited ? 'bg-amber-50/70' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="p-4 text-center font-bold text-slate-400">{formatNumberFa(index + 1)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {brand.logo ? (
                                <img src={brand.logo} alt={brand.name} className="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-slate-50" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-xs border border-purple-100">
                                  {brand.name.charAt(0)}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-xs">{brand.name}</span>
                                {brand.nameEn && (
                                  <span className="text-xs text-purple-600 bg-purple-50/80 px-2.5 py-1 rounded-lg font-mono font-semibold dir-ltr border border-purple-100/80 shadow-2xs">
                                    {brand.nameEn}
                                  </span>
                                )}
                                {isBeingEdited && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold shrink-0">
                                    در حال ویرایش
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              {brand.country && (
                                <div className="flex items-center gap-1 text-slate-700 font-bold text-[11px]">
                                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{brand.country}</span>
                                </div>
                              )}
                              {brand.slug && (
                                <span className="text-slate-400 font-mono text-[10px] block dir-ltr text-right">
                                  /{brand.slug}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">
                            <span className="text-slate-500 truncate block max-w-xs">{brand.description || '—'}</span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(brand)}
                                className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                                title="ویرایش برند"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteBrand(brand.id);
                                  if (editingBrand?.id === brand.id) {
                                    handleCancelEdit();
                                  }
                                }}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                title="حذف برند"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
