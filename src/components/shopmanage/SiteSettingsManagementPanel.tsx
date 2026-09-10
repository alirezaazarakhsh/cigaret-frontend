import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Check, 
  X, 
  Search, 
  RefreshCw, 
  Layout, 
  Globe, 
  MessageSquare, 
  PhoneCall, 
  ShieldCheck, 
  Calendar, 
  Tag, 
  ArrowRight,
  ArrowUpRight,
  Layers,
  Upload,
  FileUp,
  ListPlus
} from 'lucide-react';
import { SiteBannerSlider, WarehouseStaffUser } from '../../types';
import { 
  djangoFetchSliders, 
  djangoCreateSlider, 
  djangoUpdateSlider, 
  djangoDeleteSlider, 
  getLocalSliders 
} from '../../services/djangoApi';

interface SiteSettingsManagementPanelProps {
  currentStaff: WarehouseStaffUser;
  onReturnToPos?: () => void;
}

export const SiteSettingsManagementPanel: React.FC<SiteSettingsManagementPanelProps> = ({
  currentStaff,
  onReturnToPos
}) => {
  // Main Tabbed Navigation inside Site Settings
  const [activeTab, setActiveTab] = useState<'sliders' | 'general' | 'header' | 'social'>('sliders');

  // Sliders State
  const [sliders, setSliders] = useState<SiteBannerSlider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [bannerNotice, setBannerNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Add / Edit Banner
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSlider, setEditingSlider] = useState<SiteBannerSlider | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields State (All optional - blank=True, null=True)
  const [formTitle, setFormTitle] = useState<string>('');
  const [formHighlight, setFormHighlight] = useState<string>('');
  const [formBadge, setFormBadge] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formImage, setFormImage] = useState<string>('');
  const [formPrimaryText, setFormPrimaryText] = useState<string>('');
  const [formPrimaryLink, setFormPrimaryLink] = useState<string>('');
  const [formPrimaryAction, setFormPrimaryAction] = useState<string>('live-prices');
  const [formSecondaryText, setFormSecondaryText] = useState<string>('');
  const [formSecondaryLink, setFormSecondaryLink] = useState<string>('');
  const [formSecondaryAction, setFormSecondaryAction] = useState<string>('invoice');
  const [formTagline, setFormTagline] = useState<string>('');
  const [formStatNumber, setFormStatNumber] = useState<string>('');
  const [formStatLabel, setFormStatLabel] = useState<string>('');
  const [formTargetType, setFormTargetType] = useState<string>('all');
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState<string>('');
  const [formStartDate, setFormStartDate] = useState<string>('');
  const [formEndDate, setFormEndDate] = useState<string>('');
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Inline Bullet Features State
  interface BulletFeatureItem {
    id: string;
    text: string;
    order: number;
  }
  const [bulletFeatures, setBulletFeatures] = useState<BulletFeatureItem[]>([]);
  const [modalActiveTab, setModalActiveTab] = useState<'form' | 'preview'>('form');

  // General Settings State
  const [siteTitle, setSiteTitle] = useState<string>('سامانه پخش عمده دخانیات آذرخش');
  const [siteSlogan, setSiteSlogan] = useState<string>('مرکز تخصصی بنکداری، استعلام نرخ و ارسال فوری بار');
  const [heroBadge, setHeroBadge] = useState<string>('تأمین مستقیم و دست‌اول');
  const [announcementText, setAnnouncementText] = useState<string>('بارگیری روزانه از انبار مرکزی جنت‌آباد • ارسال ۲ ساعته به سراسر کشور');

  useEffect(() => {
    loadSliders();
  }, []);

  const loadSliders = async () => {
    setIsLoading(true);
    try {
      const data = await djangoFetchSliders();
      setSliders(data);
    } catch (err) {
      setSliders(getLocalSliders());
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSlider(null);
    setFormTitle('');
    setFormHighlight('');
    setFormBadge('');
    setFormDescription('');
    setFormImage('');
    setFormPrimaryText('');
    setFormPrimaryLink('');
    setFormPrimaryAction('live-prices');
    setFormSecondaryText('');
    setFormSecondaryLink('');
    setFormSecondaryAction('invoice');
    setFormTagline('');
    setFormStatNumber('');
    setFormStatLabel('');
    setFormTargetType('all');
    setBulletFeatures([
      { id: '1', text: 'ارسال فوری ۲ ساعته بار به سراسر کشور', order: 1 },
      { id: '2', text: 'تضمین اصالت کارتن و سلامت فیزیکی بار', order: 2 }
    ]);
    setModalActiveTab('form');
    setFormStartDate('');
    setFormEndDate('');
    setFormOrder(sliders.length + 1);
    setFormIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (slider: SiteBannerSlider) => {
    setEditingSlider(slider);
    setFormTitle(slider.title || '');
    setFormHighlight(slider.highlight || '');
    setFormBadge(slider.badge || '');
    setFormDescription(slider.description || '');
    setFormImage(slider.image || slider.imageUrl || '');
    setFormPrimaryText(slider.primary_btn_text || '');
    setFormPrimaryLink(slider.primary_btn_link || '');
    setFormPrimaryAction(slider.primary_btn_action || 'live-prices');
    setFormSecondaryText(slider.secondary_btn_text || '');
    setFormSecondaryLink(slider.secondary_btn_link || '');
    setFormSecondaryAction(slider.secondary_btn_action || 'invoice');
    setFormTagline(slider.tagline || '');
    setFormStatNumber(slider.stat_number || '');
    setFormStatLabel(slider.stat_label || '');
    setFormTargetType(slider.target_type || 'all');
    if (slider.features && Array.isArray(slider.features)) {
      setBulletFeatures(slider.features.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return { id: String(idx + 1), text: item, order: idx + 1 };
        }
        return { id: String(idx + 1), text: item.text || '', order: item.order || idx + 1 };
      }));
    } else {
      setBulletFeatures([]);
    }
    setModalActiveTab('form');
    setFormStartDate(slider.start_date || '');
    setFormEndDate(slider.end_date || '');
    setFormOrder(slider.order !== undefined ? slider.order : 1);
    setFormIsActive(slider.is_active !== undefined ? slider.is_active : true);
    setShowModal(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('حجم تصویر نباید بیشتر از ۸ مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormImage(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBulletFeatureRow = () => {
    setBulletFeatures(prev => [
      ...prev,
      { id: Date.now().toString(), text: '', order: prev.length + 1 }
    ]);
  };

  const handleUpdateBulletFeatureRow = (index: number, field: 'text' | 'order', value: any) => {
    setBulletFeatures(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveBulletFeatureRow = (index: number) => {
    setBulletFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const activeBulletTexts = bulletFeatures
      .filter(b => b.text.trim().length > 0)
      .sort((a, b) => a.order - b.order)
      .map(b => b.text.trim());

    const payload: SiteBannerSlider = {
      title: formTitle.trim() || undefined,
      highlight: formHighlight.trim() || undefined,
      badge: formBadge.trim() || undefined,
      description: formDescription.trim() || undefined,
      image: formImage.trim() || undefined,
      imageUrl: formImage.trim() || undefined,
      primary_btn_text: formPrimaryText.trim() || undefined,
      primary_btn_link: formPrimaryLink.trim() || undefined,
      primary_btn_action: formPrimaryAction || undefined,
      secondary_btn_text: formSecondaryText.trim() || undefined,
      secondary_btn_link: formSecondaryLink.trim() || undefined,
      secondary_btn_action: formSecondaryAction || undefined,
      tagline: formTagline.trim() || undefined,
      stat_number: formStatNumber.trim() || undefined,
      stat_label: formStatLabel.trim() || undefined,
      target_type: formTargetType || undefined,
      features: activeBulletTexts.length > 0 ? activeBulletTexts : undefined,
      start_date: formStartDate.trim() || undefined,
      end_date: formEndDate.trim() || undefined,
      order: Number(formOrder) || 1,
      is_active: formIsActive
    };

    try {
      if (editingSlider && editingSlider.id) {
        const res = await djangoUpdateSlider(editingSlider.id, payload);
        if (res.success) {
          setBannerNotice({ message: 'بنر با موفقیت بروزرسانی شد.', type: 'success' });
          setShowModal(false);
          await loadSliders();
        } else {
          setBannerNotice({ message: res.message || 'خطا در ویرایش بنر', type: 'error' });
        }
      } else {
        const res = await djangoCreateSlider(payload);
        if (res.success) {
          setBannerNotice({ message: 'بنر جدید با موفقیت ایجاد شد.', type: 'success' });
          setShowModal(false);
          await loadSliders();
        } else {
          setBannerNotice({ message: res.message || 'خطا در ثبت بنر', type: 'error' });
        }
      }
    } catch (err: any) {
      setBannerNotice({ message: err?.message || 'خطا در برقراری ارتباط با سرور.', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setBannerNotice(null), 4000);
    }
  };

  const handleDeleteSlider = async (id: string | number) => {
    if (!window.confirm('آیا از حذف این بنر/اسلایدر اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) return;

    try {
      const res = await djangoDeleteSlider(id);
      if (res.success) {
        setBannerNotice({ message: 'بنر با موفقیت حذف گردید.', type: 'success' });
      } else {
        setBannerNotice({ message: res.message || 'خطا در حذف بنر از دیتابیس.', type: 'error' });
      }
      await loadSliders();
    } catch (err) {
      setBannerNotice({ message: 'خطا در حذف بنر از دیتابیس.', type: 'error' });
    } finally {
      setTimeout(() => setBannerNotice(null), 4000);
    }
  };

  const handleToggleActive = async (slider: SiteBannerSlider) => {
    if (!slider.id) return;
    const newStatus = !slider.is_active;
    try {
      await djangoUpdateSlider(slider.id, { ...slider, is_active: newStatus });
      setSliders(prev => prev.map(s => s.id === slider.id ? { ...s, is_active: newStatus } : s));
      setBannerNotice({ 
        message: `وضعیت بنر «${slider.title || 'بدون عنوان'}» به ${newStatus ? 'فعال' : 'غیرفعال'} تغییر یافت.`, 
        type: 'success' 
      });
    } catch (err) {
      setBannerNotice({ message: 'خطا در تغییر وضعیت بنر.', type: 'error' });
    } finally {
      setTimeout(() => setBannerNotice(null), 3000);
    }
  };

  const filteredSliders = sliders.filter(s => {
    const matchesSearch = (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.badge || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true :
                          statusFilter === 'active' ? s.is_active :
                          !s.is_active;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12" dir="rtl">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onReturnToPos && (
              <button
                onClick={onReturnToPos}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="بازگشت به صندوق"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-600">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                تنظیمات سایت و مدیریت بنرها
              </h1>
              <p className="text-xs text-slate-500">
                تنظیمات داینامیک اسلایدرها، هدر اصلی، اعلان‌های بالای سایت و برندینگ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadSliders}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>به‌روزرسانی داده‌ها</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 border-t border-slate-100 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sliders')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'sliders'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/60'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>تنظیمات بنر و اسلایدر</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
              {sliders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/60'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>تنظیمات عمومی و برندینگ</span>
          </button>

          <button
            onClick={() => setActiveTab('header')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'header'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/60'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>تنظیمات هدر و اعلان فوقانی</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'social'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/60'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>شبکه‌های اجتماعی و ارتباطات</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {bannerNotice && (
          <div className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span>{bannerNotice.message}</span>
            <button onClick={() => setBannerNotice(null)} className="p-1 hover:bg-black/5 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= TAB 1: BANNERS & SLIDERS ================= */}
        {activeTab === 'sliders' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو در عنوان، نشانک یا توضیحات بنر..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    همه ({sliders.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === 'active' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    فعال ({sliders.filter(s => s.is_active).length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('inactive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === 'inactive' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    غیرفعال ({sliders.filter(s => !s.is_active).length})
                  </button>
                </div>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن بنر / اسلایدر جدید</span>
              </button>
            </div>

            {/* Sliders List Cards */}
            {isLoading ? (
              <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                <p className="text-xs font-bold">در حال دریافت لیست بنرها از دیتابیس...</p>
              </div>
            ) : filteredSliders.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-3">
                <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">هیچ بنری با مشخصات وارد شده یافت نشد.</p>
                <p className="text-xs text-slate-400">می‌توانید بنر جدیدی اضافه کنید تا در هیروبنر صفحه اصلی نمایش داده شود.</p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ایجاد بنر جدید</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSliders.map((slider) => (
                  <div
                    key={slider.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                      slider.is_active ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200 bg-slate-50/80 opacity-75'
                    }`}
                  >
                    <div>
                      {/* Image Preview / Banner Header */}
                      <div className="relative h-44 bg-slate-900 overflow-hidden group">
                        {slider.image || slider.imageUrl ? (
                          <img
                            src={slider.image || slider.imageUrl}
                            alt={slider.title || 'تصویر بنر'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500">
                            <ImageIcon className="w-12 h-12 opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            slider.is_active ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                          }`}>
                            {slider.is_active ? 'فعال' : 'غیرفعال'}
                          </span>

                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900/80 text-white border border-white/20">
                            اولویت: {slider.order || 1}
                          </span>
                        </div>

                        {/* Banner Overlay Content Preview */}
                        <div className="absolute bottom-3 right-3 left-3 text-white space-y-1">
                          {slider.badge && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/80 text-[10px] font-bold text-white mb-1">
                              {slider.badge}
                            </span>
                          )}
                          <h3 className="text-sm font-black text-white line-clamp-1">
                            {slider.title || 'بدون عنوان (اختیاری)'}
                          </h3>
                          {slider.highlight && (
                            <p className="text-xs text-indigo-300 font-bold line-clamp-1">
                              {slider.highlight}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 space-y-3">
                        {slider.description ? (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {slider.description}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic">بدون توضیحات</p>
                        )}

                        {/* Buttons & Links Preview */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                            <span className="text-slate-400 block text-[10px] font-bold mb-0.5">دکمه اصلی:</span>
                            <span className="font-bold text-slate-800">{slider.primary_btn_text || 'بدون متن'}</span>
                            <span className="block font-mono text-[9px] text-indigo-600 truncate dir-ltr mt-0.5">
                              {slider.primary_btn_link || '/live-prices'}
                            </span>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                            <span className="text-slate-400 block text-[10px] font-bold mb-0.5">دکمه فرعی:</span>
                            <span className="font-bold text-slate-800">{slider.secondary_btn_text || 'بدون متن'}</span>
                            <span className="block font-mono text-[9px] text-indigo-600 truncate dir-ltr mt-0.5">
                              {slider.secondary_btn_link || '/invoice'}
                            </span>
                          </div>
                        </div>

                        {/* Stats & Tagline */}
                        {(slider.stat_number || slider.tagline) && (
                          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/50">
                            <span>{slider.tagline || 'شعار بنر'}</span>
                            <span className="font-bold text-indigo-700">{slider.stat_number} {slider.stat_label}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleActive(slider)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                          slider.is_active
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {slider.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{slider.is_active ? 'غیرفعال کردن' : 'فعال کردن'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(slider)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>ویرایش</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSlider(slider.id!)}
                          className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: GENERAL SETTINGS ================= */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <h2 className="text-base font-black text-slate-900 border-b pb-3">تنظیمات نام، شعار و برندینگ عمومی</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان اصلی سایت (Site Title)</label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شعار برند (Slogan)</label>
                <input
                  type="text"
                  value={siteSlogan}
                  onChange={(e) => setSiteSlogan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <button
              onClick={() => alert('تنظیمات برندینگ عمومی ذخیره شد.')}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors"
            >
              ذخیره تغییرات برندینگ
            </button>
          </div>
        )}

        {/* ================= TAB 3: HEADER SETTINGS ================= */}
        {activeTab === 'header' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <h2 className="text-base font-black text-slate-900 border-b pb-3">تنظیمات نوار اعلان فوقانی و هدر صفحه اصلی</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">متن نوار اعلان بالای هدر (Top Announcement Bar)</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نشانک پیش‌فرض هدر (Hero Badge)</label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <button
              onClick={() => alert('تنظیمات هدر و نوار اعلان ذخیره گردید.')}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors"
            >
              ذخیره تنظیمات هدر
            </button>
          </div>
        )}

        {/* ================= TAB 4: SOCIAL & CONTACT ================= */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <h2 className="text-base font-black text-slate-900 border-b pb-3">اطلاعات تماس، تلگرام و پشتیبانی آنلاین</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">کانال تلگرام آذرخش</label>
                <input
                  type="text"
                  defaultValue="https://t.me/azarakhsh_cigar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تلفن واحد فروش و ثبت سفارش</label>
                <input
                  type="text"
                  defaultValue="09120759419"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            <button
              onClick={() => alert('اطلاعات تماس ذخیره شد.')}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors"
            >
              ذخیره اطلاعات تماس
            </button>
          </div>
        )}
      </div>

      {/* ================= ADD / EDIT SLIDER MODAL ================= */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200/90 shadow-2xl my-auto max-h-[82vh] sm:max-h-[85vh] flex flex-col relative overflow-hidden text-right"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header (Fixed) */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingSlider ? 'ویرایش بنر و اسلایدر هیرو' : 'افزودن بنر / اسلایدر جدید'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    تنظیم کامل فیلدهای مدل و پیش‌نمایش واقعی آنلاین
                  </p>
                </div>
              </div>

              {/* Tab Switcher: Form vs Live Preview */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalActiveTab('form')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    modalActiveTab === 'form' 
                      ? 'bg-white text-indigo-700 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>تنظیم فیلدها</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    modalActiveTab === 'preview' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>پیش‌نمایش زنده هیرو</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors mr-1"
                  title="بستن پنجره"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content Body */}
            <form onSubmit={handleSaveSlider} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

                {/* LIVE PREVIEW BANNER TAB / PREVIEW BOX */}
                {(modalActiveTab === 'preview' || formImage || formTitle) && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>پیش‌نمایش زنده بنر هیرو در سایت (Live Hero Banner Preview)</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-lg font-mono">
                        دقیقاً مطابق ظاهر نهایی کاربران
                      </span>
                    </div>

                    {/* Banner Canvas Replica */}
                    <div className="relative min-h-[220px] sm:min-h-[260px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 p-4 sm:p-6 flex flex-col justify-between">
                      {/* Background Image Overlay */}
                      {formImage ? (
                        <img 
                          src={formImage} 
                          alt="Banner Preview" 
                          className="absolute inset-0 w-full h-full object-cover opacity-35"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 opacity-80" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

                      {/* Top Badge & Tagline */}
                      <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
                        {formBadge ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black px-3 py-1 rounded-full backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{formBadge}</span>
                          </span>
                        ) : <span />}

                        {formStatNumber && (
                          <div className="bg-slate-900/90 border border-amber-500/30 px-3 py-1 rounded-xl text-center backdrop-blur-md">
                            <span className="text-xs font-black text-amber-400 block">{formStatNumber}</span>
                            {formStatLabel && <span className="text-[9px] text-slate-300 block">{formStatLabel}</span>}
                          </div>
                        )}
                      </div>

                      {/* Main Title & Highlight */}
                      <div className="relative z-10 my-3 space-y-1.5">
                        <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                          {formTitle || 'عنوان بنر هیرو را وارد کنید'} {' '}
                          {formHighlight && (
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-200">
                              {formHighlight}
                            </span>
                          )}
                        </h2>

                        {formTagline && (
                          <p className="text-xs font-bold text-indigo-300">{formTagline}</p>
                        )}

                        {formDescription && (
                          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{formDescription}</p>
                        )}
                      </div>

                      {/* Bullet Features & CTAs */}
                      <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800/80">
                        {/* Bullet Features Pills */}
                        <div className="flex flex-wrap gap-2">
                          {bulletFeatures.filter(b => b.text.trim().length > 0).map((bItem, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 text-slate-200 text-[11px] font-medium px-2.5 py-1 rounded-lg">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{bItem.text}</span>
                            </span>
                          ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {formPrimaryText && (
                            <button type="button" className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1">
                              <span>{formPrimaryText}</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {formSecondaryText && (
                            <button type="button" className="px-3 py-1.5 bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl">
                              <span>{formSecondaryText}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FORM FIELDS CONTENT */}
                {modalActiveTab === 'form' && (
                  <>
                    {/* SECTION 1: Direct Image File Upload & Preview */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-black text-slate-800 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-indigo-600" />
                          <span>تصویر پس‌زمینه بنر (Direct Image Upload)</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">آپلود مستقیم فایل یا آدرس اینترنتی</span>
                      </div>

                      {/* File Upload Dropzone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div>
                          <label className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl bg-indigo-50/40 hover:bg-indigo-50/80 transition-all cursor-pointer overflow-hidden group p-3">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageFileUpload} 
                              className="hidden" 
                            />
                            <div className="flex flex-col items-center justify-center text-center space-y-2">
                              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Upload className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">انتخاب فایل از کامپیوتر یا گوشی</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">فرمت‌های JPG، PNG، WEBP (حداکثر ۸ مگابایت)</p>
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Image Preview or Manual URL */}
                        <div className="space-y-2">
                          {formImage ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group h-36 flex items-center justify-center">
                              <img 
                                src={formImage} 
                                alt="Banner Preview" 
                                className="w-full h-full object-cover opacity-85"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                                <span className="text-[10px] text-white/90 bg-emerald-600/80 backdrop-blur-sm px-2 py-0.5 rounded-lg font-bold">
                                  تصویر آپلود شده
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setFormImage('')}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-xl shadow transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>حذف تصویر</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                              <span className="text-[11px] font-bold text-slate-700 block">یا آدرس اینترنتی تصویر را وارد کنید:</span>
                              <input
                                type="text"
                                value={formImage}
                                onChange={(e) => setFormImage(e.target.value)}
                                placeholder="https://images.unsplash.com/photo-..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dir-ltr focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Title, Highlight, Badge, Tagline & Description */}
                    <div className="space-y-4">
                      <span className="text-xs font-black text-slate-800 block border-b pb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>عناوین و متون اصلی اسلایدر هیرو</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            تیتر اصلی بنر (title) <span className="text-slate-400 font-normal">(اختیاری)</span>
                          </label>
                          <input
                            type="text"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            placeholder="سامانه پخش عمده دخانیات آذرخش"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            متن هایلایت رنگی (highlight) <span className="text-slate-400 font-normal">(اختیاری)</span>
                          </label>
                          <input
                            type="text"
                            value={formHighlight}
                            onChange={(e) => setFormHighlight(e.target.value)}
                            placeholder="بارگیری روزانه از انبار مرکزی"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            متن نشانک بالای عنوان (badge) <span className="text-slate-400 font-normal">(اختیاری)</span>
                          </label>
                          <input
                            type="text"
                            value={formBadge}
                            onChange={(e) => setFormBadge(e.target.value)}
                            placeholder="تأمین مستقیم و دست‌اول"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            شعار بنر (tagline) <span className="text-slate-400 font-normal">(اختیاری)</span>
                          </label>
                          <input
                            type="text"
                            value={formTagline}
                            onChange={(e) => setFormTagline(e.target.value)}
                            placeholder="توزیع بنکداری و انبارداری"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            توضیحات کامل بنر (description) <span className="text-slate-400 font-normal">(اختیاری)</span>
                          </label>
                          <input
                            type="text"
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="توضیحات ۲ الی ۳ خطی زیر عنوان در بنر هیرو..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: DJANGO ADMIN STYLE BULLET FEATURES (ویژگی‌های بولتی اسلایدر) */}
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                        <label className="block text-xs font-black text-indigo-950 flex items-center gap-2">
                          <ListPlus className="w-4 h-4 text-indigo-600" />
                          <span>ویژگی‌های بولتی اسلایدر (Inline Bullet Features)</span>
                        </label>
                        <span className="text-[11px] text-indigo-600 font-bold">نمایش به صورت تیک سبز در بنر</span>
                      </div>

                      {/* Bullet Features Table / Row List */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-600 px-1">
                          <div className="col-span-8">متن ویژگی بولتی</div>
                          <div className="col-span-3 text-center">ترتیب نمایش</div>
                          <div className="col-span-1 text-center">حذف</div>
                        </div>

                        {bulletFeatures.map((bItem, idx) => (
                          <div key={bItem.id || idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-indigo-100 shadow-sm">
                            <div className="col-span-8">
                              <input
                                type="text"
                                value={bItem.text}
                                onChange={(e) => handleUpdateBulletFeatureRow(idx, 'text', e.target.value)}
                                placeholder="مثال: ارسال رایگان، ضمانت اصالت بار..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                value={bItem.order}
                                onChange={(e) => handleUpdateBulletFeatureRow(idx, 'order', Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-slate-800"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveBulletFeatureRow(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Row Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleAddBulletFeatureRow}
                            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4 text-indigo-600" />
                            <span>افزودن یک ویژگی بولتی اسلایدر دیگر +</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: Primary & Secondary CTA Buttons */}
                    <div className="space-y-3">
                      <span className="text-xs font-black text-slate-800 block border-b pb-2 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-emerald-600" />
                        <span>تنظیم دکمه‌های اقدام اصلی و فرعی (Call To Action Buttons)</span>
                      </span>

                      {/* Primary CTA */}
                      <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2">
                        <span className="text-xs font-black text-indigo-900 block">دکمه اصلی (Primary CTA Button)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">متن دکمه</label>
                            <input
                              type="text"
                              value={formPrimaryText}
                              onChange={(e) => setFormPrimaryText(e.target.value)}
                              placeholder="مشاهده نرخ لحظه‌ای"
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">مسیر / لینک</label>
                            <input
                              type="text"
                              value={formPrimaryLink}
                              onChange={(e) => setFormPrimaryLink(e.target.value)}
                              placeholder="/live-prices"
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono dir-ltr text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">نوع اکشن</label>
                            <select
                              value={formPrimaryAction}
                              onChange={(e) => setFormPrimaryAction(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                            >
                              <option value="live-prices">تابلوی نرخ لحظه‌ای (/live-prices)</option>
                              <option value="invoice">صدور پیش‌فاکتور (/invoice)</option>
                              <option value="catalog">کاتالوگ محصولات (/catalog)</option>
                              <option value="pos-system">صندوق POS (/shopmanage)</option>
                              <option value="shipping">پیگیری باربری (/shipping)</option>
                              <option value="custom-link">لینک اختصاصی</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Secondary CTA */}
                      <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2">
                        <span className="text-xs font-black text-slate-800 block">دکمه فرعی (Secondary CTA Button)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">متن دکمه فرعی</label>
                            <input
                              type="text"
                              value={formSecondaryText}
                              onChange={(e) => setFormSecondaryText(e.target.value)}
                              placeholder="صدور پیش‌فاکتور آنلاین"
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">مسیر / لینک فرعی</label>
                            <input
                              type="text"
                              value={formSecondaryLink}
                              onChange={(e) => setFormSecondaryLink(e.target.value)}
                              placeholder="/invoice"
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono dir-ltr text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-0.5">نوع اکشن فرعی</label>
                            <select
                              value={formSecondaryAction}
                              onChange={(e) => setFormSecondaryAction(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                            >
                              <option value="invoice">صدور پیش‌فاکتور (/invoice)</option>
                              <option value="live-prices">تابلوی نرخ لحظه‌ای (/live-prices)</option>
                              <option value="catalog">کاتالوگ محصولات (/catalog)</option>
                              <option value="pos-system">صندوق POS (/shopmanage)</option>
                              <option value="shipping">پیگیری باربری (/shipping)</option>
                              <option value="custom-link">لینک اختصاصی</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: Stats, Target, Dates & Order */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 border-t">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">عدد آمار (stat_number)</label>
                        <input
                          type="text"
                          value={formStatNumber}
                          onChange={(e) => setFormStatNumber(e.target.value)}
                          placeholder="+۱۲,۵۰۰"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">برچسب آمار (stat_label)</label>
                        <input
                          type="text"
                          value={formStatLabel}
                          onChange={(e) => setFormStatLabel(e.target.value)}
                          placeholder="کارتن تحویل‌شده"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ شروع (start_date)</label>
                        <input
                          type="text"
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          placeholder="۱۴۰۳/۰۶/۰۱"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ پایان (end_date)</label>
                        <input
                          type="text"
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          placeholder="۱۴۰۳/۱۲/۲۹"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    {/* SECTION 6: Order & Active Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">اولویت نمایش (order)</label>
                        <input
                          type="number"
                          value={formOrder}
                          onChange={(e) => setFormOrder(Number(e.target.value))}
                          min={1}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">وضعیت انتشار</label>
                        <button
                          type="button"
                          onClick={() => setFormIsActive(!formIsActive)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            formIsActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {formIsActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>{formIsActive ? 'فعال (منتشر شده در هیرو سایت)' : 'غیرفعال (پیش‌نویس)'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Modal Fixed Action Footer */}
              <div className="shrink-0 border-t border-slate-100 p-4 bg-slate-50/90 backdrop-blur-sm flex items-center justify-between z-10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors shadow-sm"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingSlider ? 'ذخیره تغییرات بنر' : 'انتشار بنر جدید'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
