import React, { useState, useEffect } from 'react';
import {
  Layers,
  FolderPlus,
  Plus,
  Trash2,
  Edit3,
  Package,
  CheckCircle2,
  Tag,
  AlertTriangle,
  X,
  Save
} from 'lucide-react';
import { ProductCategoryItem } from './types';
import { CigaretteProduct } from '../../types';
import { formatNumberFa } from '../../utils/formatters';

interface CategoryListProps {
  categories: ProductCategoryItem[];
  products: CigaretteProduct[];
  onAddCategory: (category: ProductCategoryItem) => void;
  onUpdateCategory?: (category: ProductCategoryItem) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [editingCategory, setEditingCategory] = useState<ProductCategoryItem | null>(null);

  const COLOR_OPTIONS = [
    { label: 'قرمز / سرخابی', value: '#EF4444' },
    { label: 'طلایی / نارنجی', value: '#F59E0B' },
    { label: 'بنفش رویال', value: '#8B5CF6' },
    { label: 'آبی لاجوردی', value: '#3B82F6' },
    { label: 'فیروزه‌ای', value: '#06B6D4' },
    { label: 'سرمه‌ای دیپ', value: '#1E40AF' },
  ];

  const handleStartEdit = (cat: ProductCategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setNameEn(cat.nameEn || '');
    setSlug(cat.slug || cat.id);
    setDescription(cat.description || '');
    setColor(cat.color || '#3B82F6');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setNameEn('');
    setSlug('');
    setDescription('');
    setColor('#3B82F6');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);

    if (editingCategory) {
      const updatedCat: ProductCategoryItem = {
        ...editingCategory,
        name: name.trim(),
        nameEn: nameEn.trim(),
        slug: slug.trim() || editingCategory.slug,
        description: description.trim(),
        color,
      };

      if (onUpdateCategory) {
        await onUpdateCategory(updatedCat);
      }
      handleCancelEdit();
    } else {
      const generatedSlug = slug.trim() || nameEn.trim().toLowerCase().replace(/\s+/g, '_') || `cat_${Date.now()}`;
      const newCategory: ProductCategoryItem = {
        id: generatedSlug,
        slug: generatedSlug,
        name: name.trim(),
        nameEn: nameEn.trim(),
        description: description.trim(),
        color,
      };

      await onAddCategory(newCategory);
      setName('');
      setNameEn('');
      setSlug('');
      setDescription('');
    }
    setIsLoading(false);
  };

  const getProductCountForCat = (catId: string) => {
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right 1 Column: Create / Edit Category Box */}
        <div className={`p-5 rounded-2xl border shadow-xs space-y-4 transition-all ${
          editingCategory 
            ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                editingCategory ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-blue-50 text-blue-600'
              }`}>
                {editingCategory ? <Edit3 className="w-5 h-5" /> : <FolderPlus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingCategory ? 'ویرایش دسته‌بندی' : 'تعریف دسته‌بندی جدید'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingCategory ? `در حال ویرایش: ${editingCategory.name}` : 'افزودن گروه کالایی به کاتالوگ و صندوق'}
                </p>
              </div>
            </div>
            {editingCategory && (
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
                عنوان دسته‌بندی (فارسی) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug && !editingCategory) {
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
                disabled={!!editingCategory}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="compact_cigarettes"
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono dir-ltr text-left ${
                  editingCategory ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''
                }`}
              />
              {editingCategory && (
                <p className="text-[10px] text-slate-400 mt-1">شناسه سیستمی در حالت ویرایش ثابت است.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">رنگ شناسه</label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-7 h-7 rounded-lg transition-transform ${
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

            <div className="pt-1 flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 ${
                  editingCategory
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : editingCategory ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isLoading ? 'در حال ثبت...' : editingCategory ? 'ذخیره تغییرات دسته‌بندی' : 'افزودن دسته‌بندی به سیستم'}</span>
              </button>
              {editingCategory && (
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
                    <th className="p-4 text-center w-28">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-xs">هیچ دسته‌بندی در دیتابیس ثبت نشده است.</p>
                        <p className="text-[11px] text-slate-400 mt-1">از فرم مقابل برای ایجاد اولین دسته‌بندی استفاده نمایید.</p>
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat, index) => {
                      const count = getProductCountForCat(cat.id);
                      const isBeingEdited = editingCategory?.id === cat.id;

                      return (
                        <tr 
                          key={cat.id} 
                          className={`transition-colors ${
                            isBeingEdited ? 'bg-amber-50/70' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="p-4 text-center font-bold text-slate-400">{formatNumberFa(index + 1)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-3 h-3 rounded-full shrink-0 border border-slate-200" 
                                style={{ backgroundColor: cat.color && cat.color.startsWith('#') ? cat.color : '#3B82F6' }}
                              />
                              <div>
                              <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{cat.name}</span>
                                {isBeingEdited && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold">
                                    در حال ویرایش
                                  </span>
                                )}
                              </div>
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
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                              title="ویرایش دسته‌بندی"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (count > 0) {
                                  if (!window.confirm(`این دسته‌بندی شامل ${count} محصول است. آیا از حذف آن مطمئن هستید؟`)) return;
                                }
                                onDeleteCategory(cat.id);
                                if (editingCategory?.id === cat.id) {
                                  handleCancelEdit();
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="حذف دسته‌بندی"
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
