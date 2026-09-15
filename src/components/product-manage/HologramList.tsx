import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Package,
  Award,
  Lock,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { ProductHologramItem } from './types';
import { CigaretteProduct } from '../../types';
import { formatNumberFa } from '../../utils/formatters';

interface HologramListProps {
  holograms: ProductHologramItem[];
  products: CigaretteProduct[];
  onAddHologram: (hologram: ProductHologramItem) => void;
  onDeleteHologram: (hologramId: string) => void;
}

export const HologramList: React.FC<HologramListProps> = ({
  holograms,
  products,
  onAddHologram,
  onDeleteHologram,
}) => {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [country, setCountry] = useState('');
  const [securityLevel, setSecurityLevel] = useState<'ultra' | 'high' | 'standard' | 'basic'>('high');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    if (securityLevel === 'ultra') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
    if (securityLevel === 'standard') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    if (securityLevel === 'basic') badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';

    const newHolo: ProductHologramItem = {
      id: `holo_${Date.now()}`,
      title: title.trim(),
      issuer: issuer.trim() || 'مراجع نظارتی و گمرک',
      country: country.trim() || 'بین‌المللی',
      securityLevel,
      badgeColor,
      description: description.trim(),
    };

    onAddHologram(newHolo);
    setTitle('');
    setIssuer('');
    setCountry('');
    setDescription('');
  };

  const getProductCountForHolo = (holoTitle: string) => {
    return products.filter((p) => (p.hologram || '').toLowerCase() === holoTitle.toLowerCase()).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right 1 Column: Create Hologram */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">تعریف هولوگرام و برچسب اصالت</h3>
              <p className="text-[11px] text-slate-500">مشخصات پلمپ امنیتی، عوارض و رهگیری کالا</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عنوان هولوگرام / برچسب اصالت <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: سفارش ترکیه با تمبر مالیاتی TAPDK"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">مرجع صادرکننده یا سازمان ناظر</label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="مثال: گمرک فرودگاهی / سازمان دخانیات"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">کشور / حوزه</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="سوئیس / امارات / ایران"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">سطح اعتبار امنیتی</label>
                <select
                  value={securityLevel}
                  onChange={(e) => setSecurityLevel(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="ultra">فوق امنیتی (Ultra)</option>
                  <option value="high">بالا (High)</option>
                  <option value="standard">استاندارد شرکتی</option>
                  <option value="basic">پایه / مسافری</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">مشخصات فنی و امنیتی</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="دارای نخ امنیتی، بارکد قابل اسکن، پلمپ کارخانه‌ای..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن هولوگرام جدید</span>
            </button>
          </form>
        </div>

        {/* Left 2 Columns: Holograms List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-black text-slate-900">هولوگرام‌ها و نشان‌های اصالت ثبت شده</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {formatNumberFa(holograms.length)} استاندارد اصالت
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 gap-3">
              {holograms.map((holo) => {
                const count = getProductCountForHolo(holo.title);
                return (
                  <div
                    key={holo.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-slate-900">{holo.title}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${holo.badgeColor}`}>
                            {holo.securityLevel === 'ultra'
                              ? 'فوق امنیتی'
                              : holo.securityLevel === 'high'
                              ? 'سطح بالا'
                              : holo.securityLevel === 'standard'
                              ? 'استاندارد'
                              : 'پایه'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">کشور: {holo.country}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{holo.description}</p>
                        <div className="text-[10px] text-slate-400">مرجع صادرکننده: {holo.issuer}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-purple-700 border border-purple-200">
                        <Package className="w-3.5 h-3.5" />
                        <span>{formatNumberFa(count)} محصول</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteHologram(holo.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف هولوگرام"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
