import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  Check, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  Image as ImageIcon,
  Server,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { BlogPost } from '../../types';
import { 
  djangoFetchBlogPosts, 
  djangoFetchBlogPostBySlug,
  djangoCreateBlogPost, 
  djangoUpdateBlogPost, 
  djangoDeleteBlogPost,
  djangoFetchBlogCategories
} from '../../services/djangoApi';
import { formatNumberFa } from '../../utils/formatters';

interface BlogManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlogManagementModal: React.FC<BlogManagementModalProps> = ({ isOpen, onClose }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newTakeawayInput, setNewTakeawayInput] = useState<string>('');
  const [newTagInput, setNewTagInput] = useState<string>('');

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    category: 'تحلیل بازار و ارز',
    excerpt: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    readTimeMinutes: 5,
    publishedDate: new Date().toLocaleDateString('fa-IR'),
    isPublished: true,
    keyTakeaways: ['تحلیل لحظه‌ای قیمت بازار', 'اصالت تضمینی هولوگرام'],
    tags: ['دخانیات', 'دخانیات سرو', 'عمده فروشی']
  });

  const handleAddTakeaway = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    if (!newTakeawayInput.trim()) return;
    const cur = formData.keyTakeaways || [];
    setFormData(prev => ({ ...prev, keyTakeaways: [...cur, newTakeawayInput.trim()] }));
    setNewTakeawayInput('');
  };

  const handleRemoveTakeaway = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyTakeaways: (prev.keyTakeaways || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    if (!newTagInput.trim()) return;
    const cur = formData.tags || [];
    if (!cur.includes(newTagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...cur, newTagInput.trim()] }));
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };

  const categories = [
    { id: 'all', label: 'همه دسته‌بندی‌ها' },
    { id: 'تحلیل بازار و ارز', label: 'تحلیل نوسان دلار و بازار سیگار' },
    { id: 'اصالت کالا و برند', label: 'راهنمای تشخیص سیگار اصل و هولوگرام' },
    { id: 'فناوری IQOS', label: 'تکنولوژی IQOS، هیتس و تیریا' },
    { id: 'راهنمای بنکداری', label: 'راهنمای خرید کارتن و باربری' },
    { id: 'قوانین باربری و ارسال', label: 'قوانین بیجک و حمل سراسری' }
  ];

  const sampleImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80'
  ];

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await djangoFetchBlogPosts(selectedCategory, searchQuery);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPosts();
    }
  }, [isOpen, selectedCategory, searchQuery]);

  const handleOpenCreateForm = () => {
    setIsEditing(false);
    setEditingPostId(null);
    setFormData({
      title: '',
      slug: '',
      category: 'تحلیل بازار و ارز',
      excerpt: '',
      content: '<p>متن کامل مقاله را اینجا وارد کنید...</p>',
      image: sampleImages[0],
      readTimeMinutes: 5,
      publishedDate: new Date().toLocaleDateString('fa-IR'),
      isPublished: true,
      keyTakeaways: ['تحلیل اختصاصی بازار دخانیات سرو'],
      tags: ['دخانیات', 'دخانیات سرو']
    });
    setShowForm(true);
  };

  const handleOpenEditForm = async (post: BlogPost) => {
    setIsEditing(true);
    setEditingPostId(post.id);
    setFormData({ ...post });
    setShowForm(true);

    // فهرست مقالات (/blog/list/) فیلد content را برنمی‌گرداند； متن کامل باید از جزئیات (/blog/detail/{slug}/) دوباره بیاید
    try {
      const fullPost = await djangoFetchBlogPostBySlug(post.slug);
      if (fullPost && fullPost.id === post.id) {
        setFormData(prev => ({ ...prev, content: fullPost.content || prev.content }));
      }
    } catch {
      setMessage({ text: 'خطا در دریافت متن کامل مقاله از سرور.', type: 'error' });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '');
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug && isEditing ? prev.slug : slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.content?.trim()) {
      setMessage({ text: 'لطفاً عنوان و متن مقاله را وارد کنید.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editingPostId) {
        await djangoUpdateBlogPost(editingPostId, formData);
        setMessage({ text: 'مقاله با موفقیت در دیتابیس بروزرسانی شد.', type: 'success' });
      } else {
        await djangoCreateBlogPost(formData);
        setMessage({ text: 'مقاله جدید با موفقیت در دیتابیس ثبت گردید.', type: 'success' });
      }

      setShowForm(false);
      loadPosts();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'خطا در ثبت مقاله در API.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این مقاله از دیتابیس مطمئن هستید؟')) {
      try {
        await djangoDeleteBlogPost(id);
        setMessage({ text: 'مقاله با موفقیت حذف شد.', type: 'success' });
        loadPosts();
      } catch (err) {
        setMessage({ text: err instanceof Error ? err.message : 'خطا در حذف مقاله از دیتابیس.', type: 'error' });
      }
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-400/30 rounded-2xl">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  مدیریت مقالات خواندنی و اخبار وبلاگ
                </h2>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-400/30 flex items-center gap-1">
                  <Server className="w-3 h-3 text-blue-400" />
                  Django REST API
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                افزودن، ویرایش، بسته‌بندی موضوعی و تنظیم تاریخ انتشار شمسی مقالات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {message && (
          <div className={`p-3 text-xs font-bold text-center flex items-center justify-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Search & Category filter */}
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو در عنوان یا متن مقاله..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenCreateForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت مقاله جدید</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Create/Edit Form View */}
          {showForm ? (
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  {isEditing ? 'ویرایش مقاله موجود' : 'ثبت مقاله جدید در وبلاگ'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  انصراف
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان مقاله <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تحلیل نوسان اخیر دلار و تاثیر آن بر قیمت سیگار"
                    value={formData.title || ''}
                    onChange={handleTitleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسلاگ سئو (URL Slug)
                  </label>
                  <input
                    type="text"
                    placeholder="dollar-fluctuations-cigarette-price"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dir-ltr text-left focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    دسته‌بندی مقاله
                  </label>
                  <select
                    value={formData.category || 'تحلیل بازار و ارز'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="تحلیل بازار و ارز">تحلیل نوسان دلار و بازار سیگار</option>
                    <option value="اصالت کالا و برند">راهنمای تشخیص سیگار اصل و هولوگرام</option>
                    <option value="فناوری IQOS">تکنولوژی IQOS، هیتس و تیریا</option>
                    <option value="راهنمای بنکداری">راهنمای خرید کارتن و باربری</option>
                    <option value="قوانین باربری و ارسال">قوانین بیجک و حمل سراسری</option>
                  </select>
                </div>

                {/* Published Shamsi Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاریخ انتشار (شمسی)
                  </label>
                  <input
                    type="text"
                    placeholder="۱۴۰۳/۰۶/۰۱"
                    value={formData.publishedDate || ''}
                    onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Read Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مدت زمان مطالعه (دقیقه)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.readTimeMinutes || 5}
                    onChange={(e) => setFormData({ ...formData, readTimeMinutes: parseInt(e.target.value) || 5 })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    لینک تصویر شاخص
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dir-ltr text-left focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sample Images Quick Selection */}
              <div>
                <span className="block text-[11px] font-bold text-slate-500 mb-1">
                  انتخاب سریع تصاویر پیشنهادی:
                </span>
                <div className="flex items-center gap-2">
                  {sampleImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: imgUrl })}
                      className={`h-12 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                        formData.image === imgUrl ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="sample" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  خلاصه کوتاه مقاله (نمایش در کارت‌ها)
                </label>
                <textarea
                  rows={2}
                  placeholder="توضیح مختصر ۲ تا ۳ خطی درباره موضوع مقاله..."
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Rich Content TinyMCE HTML */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  متن کامل مقاله (فرمت غنی HTML / TinyMCE)
                </label>
                <textarea
                  rows={8}
                  placeholder="<p>متن کامل مقاله...</p><h2>عنوان بخش دوم</h2>..."
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Key Takeaways */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  نکات کلیدی و چکیده محتوا (Key Takeaways):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTakeawayInput}
                    onChange={(e) => setNewTakeawayInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTakeaway();
                      }
                    }}
                    placeholder="یک نکته کلیدی بنویسید و دکمه افزودن نکته را بزنید..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTakeaway()}
                    className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    افزودن نکته
                  </button>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {(formData.keyTakeaways || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTakeaway(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  برچسب‌های سئو و موضوعی (Tags):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="برچسب جدید تایپ کنید..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    افزودن برچسب
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map((t, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                      <span>{t}</span>
                      <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Published Switch */}
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished !== false}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-800">انتشار مقاله در وبلاگ عمومی</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {isSubmitting
                      ? (isEditing ? 'در حال ذخیره تغییرات...' : 'در حال ثبت در دیتابیس...')
                      : (isEditing ? 'ذخیره تغییرات مقاله' : 'انتشار مقاله در دیتابیس')}
                  </span>
                </button>
              </div>
            </form>
          ) : null}

          {/* Table of Articles */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-bold">
              در حال لود مقالات از دیتابیس...
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-bold space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p>هیچ مقاله‌ای یافت نشد.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-600 text-[11px] font-black border-b border-slate-200">
                      <th className="p-3">تصویر</th>
                      <th className="p-3">عنوان و اسلاگ</th>
                      <th className="p-3">دسته‌بندی</th>
                      <th className="p-3">تاریخ انتشار</th>
                      <th className="p-3">مطالعه</th>
                      <th className="p-3 text-center">وضعیت</th>
                      <th className="p-3 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        </td>
                        <td className="p-3 space-y-1 max-w-xs">
                          <div className="font-black text-slate-900 line-clamp-1">{post.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono dir-ltr text-right line-clamp-1">/{post.slug}</div>
                        </td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-200">
                            {post.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">
                          {post.publishedDate}
                        </td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">
                          {formatNumberFa(post.readTimeMinutes)} دقیقه
                        </td>
                        <td className="p-3 text-center">
                          {post.isPublished !== false ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block">
                              منتشرشده
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block">
                              پیش‌نویس
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditForm(post)}
                              title="ویرایش مقاله"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              title="حذف مقاله"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500 font-bold">
          <span>تعداد کل مقالات دیتابیس: {formatNumberFa(posts.length)}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors"
          >
            بستن پنل
          </button>
        </div>

      </div>
    </div>
  );
};
