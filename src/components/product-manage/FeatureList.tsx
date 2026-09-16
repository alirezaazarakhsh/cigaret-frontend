import React, { useState } from 'react';
import {
  Tag,
  Sliders,
  Plus,
  Trash2,
  Edit3,
  ListFilter,
  CheckCircle2,
  FileText,
  Binary,
  X,
  Save
} from 'lucide-react';
import { ProductFeatureItem } from './types';
import { formatNumberFa } from '../../utils/formatters';

interface FeatureListProps {
  features: ProductFeatureItem[];
  onAddFeature: (feature: ProductFeatureItem) => void;
  onUpdateFeature?: (feature: ProductFeatureItem) => void;
  onDeleteFeature: (featureId: string) => void;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  features,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
}) => {
  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<'text' | 'number' | 'select' | 'badge'>('text');
  const [unit, setUnit] = useState('');
  const [optionsStr, setOptionsStr] = useState('');
  const [description, setDescription] = useState('');
  const [editingFeature, setEditingFeature] = useState<ProductFeatureItem | null>(null);

  const handleStartEdit = (feat: ProductFeatureItem) => {
    setEditingFeature(feat);
    setNameFa(feat.nameFa);
    setNameEn(feat.nameEn || '');
    setType(feat.type || 'text');
    setUnit(feat.unit || '');
    setOptionsStr(feat.options ? feat.options.join('، ') : '');
    setDescription(feat.description || '');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingFeature(null);
    setNameFa('');
    setNameEn('');
    setType('text');
    setUnit('');
    setOptionsStr('');
    setDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) return;

    const options = optionsStr
      ? optionsStr
          .split(/[,،\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    if (editingFeature) {
      const updatedFeat: ProductFeatureItem = {
        ...editingFeature,
        nameFa: nameFa.trim(),
        nameEn: nameEn.trim(),
        type,
        unit: unit.trim() || undefined,
        options,
        description: description.trim(),
      };

      if (onUpdateFeature) {
        onUpdateFeature(updatedFeat);
      }
      handleCancelEdit();
    } else {
      const newFeat: ProductFeatureItem = {
        id: `feat_${Date.now()}`,
        nameFa: nameFa.trim(),
        nameEn: nameEn.trim(),
        type,
        unit: unit.trim() || undefined,
        options,
        description: description.trim(),
      };

      onAddFeature(newFeat);
      setNameFa('');
      setNameEn('');
      setUnit('');
      setOptionsStr('');
      setDescription('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right 1 Column: Create / Edit Feature Form */}
        <div className={`p-5 rounded-2xl border shadow-xs space-y-4 transition-all ${
          editingFeature 
            ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                editingFeature ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {editingFeature ? <Edit3 className="w-5 h-5" /> : <Sliders className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingFeature ? 'ویرایش مشخصه فنی' : 'تعریف مشخصه فنی کالا'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingFeature ? `در حال ویرایش: ${editingFeature.nameFa}` : 'افزودن فیلد و ویژگی به شناسنامه محصولات'}
                </p>
              </div>
            </div>
            {editingFeature && (
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
                عنوان ویژگی به فارسی <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                placeholder="مثال: رطوبت استاندارد توتون"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان لاتین (English)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Tobacco Moisture"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white dir-ltr text-left"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع داده</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="text">متنی (Text)</option>
                  <option value="number">عددی با واحد (Number)</option>
                  <option value="select">انتخابی چندگزینه‌ای (Select)</option>
                  <option value="badge">نشان و بج (Badge)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">واحد سنجش (اختیاری)</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="mg / mm / درصد"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {type === 'select' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  گزینه‌ها (با کاما یا خط بعد جدا کنید)
                </label>
                <textarea
                  rows={2}
                  value={optionsStr}
                  onChange={(e) => setOptionsStr(e.target.value)}
                  placeholder="گزینه ۱، گزینه ۲، گزینه ۳"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">توضیح راهنما برای خریداران</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیح در رابطه با استاندارد این ویژگی..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white leading-relaxed"
              />
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                type="submit"
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 ${
                  editingFeature
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                }`}
              >
                {editingFeature ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingFeature ? 'ذخیره تغییرات مشخصه' : 'افزودن ویژگی به لیست'}</span>
              </button>
              {editingFeature && (
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

        {/* Left 2 Columns: Features Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">مشخصات فنی و استانداردهای محصول</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {formatNumberFa(features.length)} مشخصه تعریف شده
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-700 font-black">
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4">نام ویژگی</th>
                    <th className="p-4">نوع داده و واحد</th>
                    <th className="p-4">توضیحات و مقادیر</th>
                    <th className="p-4 text-center w-28">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {features.map((feat, index) => {
                    const isBeingEdited = editingFeature?.id === feat.id;

                    return (
                      <tr 
                        key={feat.id} 
                        className={`transition-colors ${
                          isBeingEdited ? 'bg-amber-50/70' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="p-4 text-center font-bold text-slate-400">{formatNumberFa(index + 1)}</td>
                        <td className="p-4">
                          <div>
                            <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{feat.nameFa}</span>
                              {isBeingEdited && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold">
                                  در حال ویرایش
                                </span>
                              )}
                            </div>
                            {feat.nameEn && (
                              <div className="text-[10px] text-slate-400 font-mono dir-ltr text-left">
                                {feat.nameEn}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                              {feat.type === 'text' && 'متنی'}
                              {feat.type === 'number' && 'عددی'}
                              {feat.type === 'select' && 'چندگزینه‌ای'}
                              {feat.type === 'badge' && 'بج / نشان'}
                            </span>
                            {feat.unit && (
                              <span className="text-slate-500 font-mono text-[10px]">({feat.unit})</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          {feat.options && feat.options.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {feat.options.slice(0, 3).map((opt, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                  {opt}
                                </span>
                              ))}
                              {feat.options.length > 3 && (
                                <span className="text-[10px] text-slate-400">+{feat.options.length - 3} مورد دیگر</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 truncate block max-w-xs">{feat.description || '—'}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(feat)}
                              className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                              title="ویرایش مشخصه فنی"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteFeature(feat.id);
                                if (editingFeature?.id === feat.id) {
                                  handleCancelEdit();
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="حذف مشخصه فنی"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      </div>
    </div>
  );
};
