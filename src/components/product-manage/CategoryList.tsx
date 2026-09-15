import React, { useState } from 'react';
import {
  Layers,
  FolderPlus,
  Plus,
  Trash2,
  Edit3,
  Package,
  CheckCircle2,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { ProductCategoryItem } from './types';
import { CigaretteProduct } from '../../types';
import { formatNumberFa } from '../../utils/formatters';

interface CategoryListProps {
  categories: ProductCategoryItem[];
  products: CigaretteProduct[];
  onAddCategory: (category: ProductCategoryItem) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  products,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('text-blue-600');

  const COLOR_OPTIONS = [
    { label: 'آبی تجاری', value: 'text-blue-600', bg: 'bg-blue-600' },
    { label: 'سبز زمردی', value: 'text-emerald-600', bg: 'bg-emerald-600' },
    { label: 'بنفش لوکس', value: 'text-purple-600', bg: 'bg-purple-600' },
    { label: 'نیلی انبارداری', value: 'text-indigo-600', bg: 'bg-indigo-600' },
    { label: 'کهربایی تنباکو', value: 'text-amber-600', bg: 'bg-amber-600' },
    { label: 'رز قرمز', value: 'text-rose-600', bg: 'bg-rose-600' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedSlug = slug.trim() || nameEn.trim().toLowerCase().replace(/\s+/g, '_') || `cat_${Date.now()}`;
    const newCategory: ProductCategoryItem = {
      id: generatedSlug,
      slug: generatedSlug,
      name: name.trim(),
      nameEn: nameEn.trim(),
      description: description.trim(),
      color,
    };

    onAddCategory(newCategory);
    setName('');
    setNameEn('');
    setSlug('');
    setDescription('');
  };

  const getProductCountForCat = (catId: string) => {
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right 1 Column: Create Category Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">تعریف دسته‌بندی جدید</h3>
              <p className="text-[11px] text-slate-500">افزودن گروه کالایی به کاتالوگ و صندوق</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عنوان دسته‌بندی (فارسی) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) {
                    setSlug(e.target.value.trim().toLowerCase().replace(/\s+/g, '_'));
                  }
                }}
                placeholder="مثال: سیگارهای دمی و کامپکت"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نام لاتین (English)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Compact Cigarettes"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">شناسه سیستمی (Slug / ID)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="compact_cigarettes"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">رنگ شناسه</label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-lg ${c.bg} transition-transform ${
                      color === c.value ? 'scale-110 ring-2 ring-slate-900 ring-offset-2' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">توضیحات کوتاه دسته‌بندی</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیح در رابطه با برندها و مشخصات این دسته از کالاها..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن دسته‌بندی به سیستم</span>
            </button>
          </form>
        </div>

        {/* Left 2 Columns: Category Table & List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">دسته‌بندی‌های فعال کالا</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {formatNumberFa(categories.length)} دسته ثبت شده
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-700 font-black">
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4">عنوان دسته‌بندی</th>
                    <th className="p-4">شناسه سیستمی</th>
                    <th className="p-4">توضیحات</th>
                    <th className="p-4 text-center">تعداد محصولات</th>
                    <th className="p-4 text-center w-20">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat, index) => {
                    const count = getProductCountForCat(cat.id);
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 text-center font-bold text-slate-400">{formatNumberFa(index + 1)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${cat.color ? cat.color.replace('text-', 'bg-') : 'bg-blue-600'}`}></span>
                            <div>
                              <div className="font-black text-slate-900 text-xs">{cat.name}</div>
                              {cat.nameEn && (
                                <div className="text-[10px] text-slate-400 dir-ltr text-left font-mono">
                                  {cat.nameEn}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-500 dir-ltr text-left">{cat.slug || cat.id}</td>
                        <td className="p-4 text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Package className="w-3 h-3" />
                            <span>{formatNumberFa(count)} قلم کالا</span>
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (count > 0) {
                                if (!window.confirm(`این دسته‌بندی شامل ${count} محصول است. آیا از حذف آن مطمئن هستید؟`)) return;
                              }
                              onDeleteCategory(cat.id);
                            }}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="حذف دسته‌بندی"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
