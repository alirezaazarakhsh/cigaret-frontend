import React, { useState } from 'react';
import {
  Tag,
  Sliders,
  Plus,
  Trash2,
  ListFilter,
  CheckCircle2,
  FileText,
  Binary
} from 'lucide-react';
import { ProductFeatureItem } from './types';
import { formatNumberFa } from '../../utils/formatters';

interface FeatureListProps {
  features: ProductFeatureItem[];
  onAddFeature: (feature: ProductFeatureItem) => void;
  onDeleteFeature: (featureId: string) => void;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  features,
  onAddFeature,
  onDeleteFeature,
}) => {
  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<'text' | 'number' | 'select' | 'badge'>('text');
  const [unit, setUnit] = useState('');
  const [optionsStr, setOptionsStr] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) return;

    const options = optionsStr
      ? optionsStr
          .split(/[,،\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

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
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right 1 Column: Create Feature Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">تعریف مشخصه فنی کالا</h3>
              <p className="text-[11px] text-slate-500">افزودن فیلد و ویژگی به شناسنامه محصولات</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-3.5">
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

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن ویژگی به لیست</span>
            </button>
          </form>
        </div>

        {/* Left 2 Columns: Features Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
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
                    <th className="p-4 text-center w-20">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {features.map((feat, index) => (
                    <tr key={feat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center font-bold text-slate-400">{formatNumberFa(index + 1)}</td>
                      <td className="p-4">
                        <div className="font-black text-slate-900 text-xs">{feat.nameFa}</div>
                        {feat.nameEn && (
                          <div className="text-[10px] text-slate-400 dir-ltr text-left font-mono">{feat.nameEn}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {feat.type === 'number'
                              ? 'عددی'
                              : feat.type === 'select'
                              ? 'چندگزینه‌ای'
                              : feat.type === 'badge'
                              ? 'نشان'
                              : 'متنی'}
                          </span>
                          {feat.unit && (
                            <span className="text-[10px] text-slate-500 font-bold">({feat.unit})</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        <div className="text-[11px]">{feat.description || '—'}</div>
                        {feat.options && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {feat.options.slice(0, 3).map((opt, i) => (
                              <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                                {opt}
                              </span>
                            ))}
                            {feat.options.length > 3 && (
                              <span className="text-[10px] text-slate-400">+{feat.options.length - 3} مورد دیگر</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteFeature(feat.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="حذف ویژگی"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
