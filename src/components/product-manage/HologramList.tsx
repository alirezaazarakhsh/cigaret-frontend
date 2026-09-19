import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Edit3,
  Package,
  Award,
  Lock,
  Globe,
  CheckCircle2,
  X,
  Save
} from 'lucide-react';
import { ProductHologramItem } from './types';
import { CigaretteProduct } from '../../types';
import { formatNumberFa } from '../../utils/formatters';

interface HologramListProps {
  holograms: ProductHologramItem[];
  products: CigaretteProduct[];
  onAddHologram: (hologram: ProductHologramItem) => void;
  onUpdateHologram?: (hologram: ProductHologramItem) => void;
  onDeleteHologram: (hologramId: string) => void;
}

export const HologramList: React.FC<HologramListProps> = ({
  holograms,
  products,
  onAddHologram,
  onUpdateHologram,
  onDeleteHologram,
}) => {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [country, setCountry] = useState('');
  const [securityLevel, setSecurityLevel] = useState<'ultra' | 'high' | 'standard' | 'basic'>('high');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingHologram, setEditingHologram] = useState<ProductHologramItem | null>(null);

  const handleStartEdit = (holo: ProductHologramItem) => {
    setEditingHologram(holo);
    setTitle(holo.title);
    setIssuer(holo.issuer || '');
    setCountry(holo.country || '');
    setSecurityLevel(holo.securityLevel || 'high');
    setDescription(holo.description || '');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingHologram(null);
    setTitle('');
    setIssuer('');
    setCountry('');
    setSecurityLevel('high');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);

    let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    if (securityLevel === 'ultra') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
    if (securityLevel === 'standard') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    if (securityLevel === 'basic') badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';

    if (editingHologram) {
      const updatedHolo: ProductHologramItem = {
        ...editingHologram,
        title: title.trim(),
        issuer: issuer.trim() || 'مراجع نظارتی و گمرک',
        country: country.trim() || 'بین‌المللی',
        securityLevel,
        badgeColor,
        description: description.trim(),
      };

      if (onUpdateHologram) {
        await onUpdateHologram(updatedHolo);
      }
      handleCancelEdit();
    } else {
      const newHolo: ProductHologramItem = {
        id: `holo_${Date.now()}`,
        title: title.trim(),
        issuer: issuer.trim() || 'مراجع نظارتی و گمرک',
        country: country.trim() || 'بین‌المللی',
        securityLevel,
        badgeColor,
        description: description.trim(),
      };

      await onAddHologram(newHolo);
      setTitle('');
      setIssuer('');
      setCountry('');
      setDescription('');
    }
    setIsLoading(false);
  };

  const getProductCountForHolo = (holoTitle: string) => {
    return products.filter((p) => (p.hologram || '').toLowerCase() === holoTitle.toLowerCase()).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right 1 Column: Create / Edit Hologram */}
        <div className={`p-5 rounded-2xl border shadow-xs space-y-4 transition-all ${
          editingHologram 
            ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                editingHologram ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-purple-50 text-purple-600'
              }`}>
                {editingHologram ? <Edit3 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingHologram ? 'ویرایش هولوگرام' : 'تعریف هولوگرام و برچسب اصالت'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingHologram ? `در حال ویرایش: ${editingHologram.title}` : 'مشخصات پلمپ امنیتی، عوارض و رهگیری کالا'}
                </p>
              </div>
            </div>
            {editingHologram && (
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

            <div className="pt-1 flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 ${
                  editingHologram
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : editingHologram ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isLoading ? 'در حال ثبت...' : editingHologram ? 'ذخیره تغییرات هولوگرام' : 'افزودن هولوگرام جدید'}</span>
              </button>
              {editingHologram && (
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

        {/* Left 2 Columns: Holograms List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-black text-slate-900">هولوگرام‌ها و نشان‌های اصالت ثبت شده</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {formatNumberFa(holograms.length)} استاندارد اصالت
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {holograms.map((holo) => {
                const count = getProductCountForHolo(holo.title);
                const isBeingEdited = editingHologram?.id === holo.id;

                return (
                  <div
                    key={holo.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isBeingEdited 
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20' 
                        : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-purple-600 shadow-xs shrink-0 mt-0.5">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-slate-900">{holo.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${holo.badgeColor || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {holo.securityLevel === 'ultra' && 'فوق امنیتی'}
                            {holo.securityLevel === 'high' && 'سطح بالا'}
                            {holo.securityLevel === 'standard' && 'استاندارد'}
                            {holo.securityLevel === 'basic' && 'پایه'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            کشور: {holo.country}
                          </span>
                          {isBeingEdited && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold">
                              در حال ویرایش
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {holo.description || 'توضیحات تکمیلی ثبت نشده است.'}
                        </p>
                        <div className="text-[10px] text-slate-400 font-medium">
                          مرجع صادرکننده: {holo.issuer}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Package className="w-3 h-3" />
                        <span>{formatNumberFa(count)} محصول</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(holo)}
                        className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                        title="ویرایش هولوگرام"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (count > 0) {
                            if (!window.confirm(`این هولوگرام روی ${count} محصول ثبت شده است. آیا مطمئن به حذف هستید؟`)) return;
                          }
                          onDeleteHologram(holo.id);
                          if (editingHologram?.id === holo.id) {
                            handleCancelEdit();
                          }
                        }}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
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
