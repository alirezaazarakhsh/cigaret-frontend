import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  Tag, 
  ArrowLeft, 
  Share2, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Package,
  Layers,
  ChevronRight,
  Eye,
  Truck,
  Zap,
  Filter,
  Check,
  Info,
  FileText,
  Newspaper,
  PlusCircle
} from 'lucide-react';
import { BlogPost, BlogCategoryItem } from '../types';
import { api, blogApi } from '../services/api';
import { djangoDatabaseStore } from '../services/djangoApi';
import { formatNumberFa } from '../utils/formatters';

interface BlogSectionProps {
  onSelectProductTag?: (brand: string) => void;
}

interface CategorySpec {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onSelectProductTag }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategoryItem[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load all posts & categories for counts and initial state
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [fullList, fetchedCats] = await Promise.all([
          blogApi.getPosts({ category: 'all' }),
          blogApi.getCategories()
        ]);
        setAllPosts(fullList);
        setCategories(fetchedCats);
      } catch (e) {
        console.error('Error fetching all blog posts and categories:', e);
      }
    };
    loadAll();
  }, []);

  // Load filtered posts based on selected category & search
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const res = await blogApi.getPosts({
          category: selectedCategory,
          search: searchQuery
        });
        setPosts(res);
      } catch (e) {
        console.error('Error fetching filtered blog posts:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, [selectedCategory, searchQuery]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // فهرست مقالات (/blog/list/) فیلد content را برنمی‌گرداند؛ متن کامل باید از جزئیات (/blog/detail/{slug}/) گرفته شود
  const openPost = async (post: BlogPost) => {
    // ابتدا از حافظه محلی در صورت وجود متن کامل، آن را قرار می‌دهیم تا در موبایل و PWA لحظه‌ای لود شود
    const localStorePost = djangoDatabaseStore.getBlogPosts().find(p => p.slug === post.slug || String(p.id) === String(post.id));
    const initialPost = localStorePost ? { ...localStorePost, ...post, content: post.content || localStorePost.content || '' } : post;
    setSelectedPost(initialPost);

    try {
      const fullPost = await blogApi.getBySlug(post.slug);
      if (fullPost) {
        setSelectedPost(prev => (prev && (prev.slug === post.slug || String(prev.id) === String(post.id)) ? { ...prev, ...fullPost } : prev));
      }
    } catch (e) {
      console.warn('Error fetching full post detail:', e);
    }
  };

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return allPosts.length;
    return allPosts.filter(p => p.category === catId).length;
  };

  const categorySpecs: CategorySpec[] = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        {
          id: 'all',
          label: 'همه مقالات و مطالب',
          icon: BookOpen,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          description: 'نمایش تمام مقالات آموزشی، تحلیل بازار و اخبار تخصصی بنکداری'
        }
      ];
    }

    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'all': BookOpen,
      'news': Newspaper,
      'market': TrendingUp,
      'security': ShieldCheck,
      'tech': Zap,
      'shipping': Truck,
      'product': Package,
      'general': FileText
    };

    const hasAll = categories.some(cat => cat.slug === 'all' || cat.name === 'همه مقالات و مطالب' || cat.id === 'all');
    const mapped = categories.map((cat, idx) => ({
      id: cat.name,
      label: cat.name,
      icon: iconMap[cat.slug] || (idx % 3 === 0 ? Layers : (idx % 2 === 0 ? FileText : BookOpen)),
      color: cat.color || 'text-blue-600',
      bgColor: cat.bgColor || 'bg-blue-50',
      borderColor: cat.borderColor || 'border-blue-200',
      description: cat.description || 'مشاهده مقالات مربوط به این دسته‌بندی'
    }));

    if (!hasAll) {
      return [
        {
          id: 'all',
          label: 'همه مقالات و مطالب',
          icon: BookOpen,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          description: 'نمایش تمام مقالات آموزشی، تحلیل بازار و اخبار تخصصی بنکداری'
        },
        ...mapped
      ];
    }

    return mapped;
  }, [categories]);

  const selectedCategorySpec = categorySpecs.find(c => c.id === selectedCategory) || categorySpecs[0] || {
    id: 'all',
    label: 'همه مقالات و مطالب',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'نمایش تمام مقالات آموزشی'
  };

  // Featured Post (first item of all posts)
  const featuredPost = allPosts.length > 0 ? allPosts[0] : null;

  // Related posts when viewing a single article
  const relatedPosts = selectedPost
    ? allPosts.filter(p => p.id !== selectedPost.id && (p.category === selectedPost.category || selectedPost.tags?.some(t => p.tags?.includes(t)))).slice(0, 3)
    : [];


  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-200" id="blog-dedicated-page">
      
      {/* Schema.org Blog Microdata for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "صفحه مقالات خواندنی و مجله تخصصی دخانیات سوین",
            "description": "تحلیل قیمت کارتن و باکس سیگار، تأثیر دلار آزاد، اصالت هولوگرام و راهنمای بنکداری",
            "publisher": {
              "@type": "Organization",
              "name": "سامانه پخش عمده دخانیات سوین",
              "logo": {
                "@type": "ImageObject",
                "url": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80"
              }
            }
          })
        }}
      />

      {/* DEDICATED PAGE HERO HEADER */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
        
        {/* Decorative Background Accents */}
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          
          {/* Breadcrumb & Badge */}
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="text-blue-400 font-bold">سامانه پخش سوین</span>
              <span>/</span>
              <span className="text-white font-black">صفحه مجزای مقالات خواندنی و اخبار بازار</span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-xl border border-blue-400/30 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                تعداد کل مقالات: {formatNumberFa(allPosts.length)}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-400/30 hidden sm:inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                بروزرسانی روزانه دیتابیس
              </span>
            </div>
          </div>

          {/* Title & Description & Search */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-blue-200 text-xs font-black px-3 py-1 rounded-xl border border-blue-400/30">
                <Sparkles className="w-4 h-4 text-blue-400" />
                مرجع تخصصی اخبار، آموزش بنکداری و تحلیل نرخ ارز
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                مجله مقالات خواندنی و راهنمای تخصصی دخانیات
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                بررسی تخصصی نوسانات ارز، روش‌های تشخیص اصالت هولوگرام سوئیس، تکنولوژی دستگاه‌های IQOS و استیک‌های تیریا، به همراه فرمول‌های سوددهی در خریدهای عمده کارتن.
              </p>
            </div>

            {/* Global Search Bar */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجوی عنوان، بارکد، اصالت، IQOS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl pr-10 pl-3 py-3 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all dir-rtl"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded-lg"
                  >
                    پاکسازی
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* DEDICATED CATEGORIES SECTION ON THE BLOG PAGE */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5" id="categories-section">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                بخش مجزای دسته‌بندی موضوعی مقالات
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                موضوع مورد نظر خود را جهت فیلتر و مطالعه تخصصی انتخاب نمایید:
              </p>
            </div>
          </div>

          {selectedCategory !== 'all' && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedPost(null);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>نمایش همه دسته‌ها</span>
            </button>
          )}
        </div>

        {/* Dedicated Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorySpecs.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedPost(null);
                }}
                className={`text-right p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 group ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${cat.bgColor} ${cat.color} border ${cat.borderColor} shrink-0`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                        {cat.label}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                        {formatNumberFa(count)} مقاله ثبت‌شده
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="p-1 bg-blue-600 text-white rounded-full">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600">
                      ←
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium border-t border-slate-100 pt-2">
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>


      </section>

      {/* SINGLE ARTICLE DETAIL READER VIEW */}
      {selectedPost ? (
        <article className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 animate-in fade-in duration-200">
          
          {/* Reader Top Action Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              <span>بازگشت به فهرست مقالات خواندنی</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>تاریخ انتشار: {selectedPost.publishedDate}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <span>{formatNumberFa(selectedPost.readTimeMinutes)} دقیقه مطالعه</span>
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{copiedLink ? 'لینک کپی شد' : 'اشتراک‌گذاری مقاله'}</span>
              </button>
            </div>
          </div>

          {/* Post Category & Title & Excerpt */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-block bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-xs">
                {selectedPost.category}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                کد مقاله: #{selectedPost.id.slice(0, 8)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {selectedPost.title}
            </h1>

            {/* Author Card */}
            {selectedPost.author && (
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <img
                  src={selectedPost.author.avatar}
                  alt={selectedPost.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <div className="text-xs font-black text-slate-900">{selectedPost.author.name}</div>
                  <div className="text-[11px] text-slate-500 font-bold">{selectedPost.author.role}</div>
                </div>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-blue-50/60 p-4 rounded-2xl border-r-4 border-blue-600">
              {selectedPost.excerpt}
            </p>
          </div>

          {/* Main Cover Image */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 max-h-[420px] bg-slate-100">
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Key Takeaways */}
          {selectedPost.keyTakeaways && selectedPost.keyTakeaways.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-black text-blue-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>نکات کلیدی برای بنکداران و خریداران عمده:</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-800 font-medium list-disc list-inside">
                {selectedPost.keyTakeaways.map((item, i) => (
                  <li key={i} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Article HTML/Text Content (Responsive & PWA Optimized) */}
          <div className="text-xs sm:text-sm text-slate-800 leading-loose space-y-4 font-normal">
            {selectedPost.content ? (
              selectedPost.content.includes('<') && selectedPost.content.includes('>') ? (
                <div 
                  className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-black prose-headings:text-slate-900 prose-img:rounded-2xl break-words"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
              ) : (
                <div className="whitespace-pre-line leading-relaxed text-justify break-words">
                  {selectedPost.content}
                </div>
              )
            ) : selectedPost.excerpt ? (
              <div className="whitespace-pre-line leading-relaxed text-justify break-words text-slate-600">
                {selectedPost.excerpt}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                متن کامل این مقاله در حال بارگذاری یا بروزرسانی است...
              </div>
            )}
          </div>

          {/* FAQs section */}
          {selectedPost.faqs && selectedPost.faqs.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>پرسش‌های متداول خریداران عمده درباره این موضوع:</span>
              </h3>
              <div className="space-y-2.5">
                {selectedPost.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <div className="font-black text-xs text-slate-900">
                      {faq.question}
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {selectedPost.tags && selectedPost.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> برچسب‌های سئو:
              </span>
              {selectedPost.tags.map((t, idx) => (
                <span 
                  key={idx} 
                  className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <div className="pt-8 border-t border-slate-200 space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>مطالب مرتبط پیشنهادی در همین دسته‌بندی</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((relPost) => (
                  <div
                    key={relPost.id}
                    onClick={() => {
                      openPost(relPost);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 transition-all cursor-pointer p-3 space-y-2 group"
                  >
                    <img
                      src={relPost.image}
                      alt={relPost.title}
                      className="w-full h-28 object-cover rounded-xl group-hover:scale-105 transition-transform"
                    />
                    <div className="font-black text-xs text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                      {relPost.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">
                      {relPost.publishedDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </article>
      ) : (
        /* ARTICLES MAIN LIST AND FEATURED SHOWCASE */
        <div className="space-y-6">

          {/* Featured Post Card (if available and category is all) */}
          {featuredPost && selectedCategory === 'all' && !searchQuery && (
            <div 
              onClick={() => openPost(featuredPost)}
              className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 text-white border border-slate-800 rounded-3xl overflow-hidden shadow-md hover:border-blue-500 transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 group"
            >
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      مقاله ویژه هفته
                    </span>
                    <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {featuredPost.category}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-xl font-black text-white group-hover:text-blue-300 transition-colors leading-snug">
                    {featuredPost.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-normal">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {featuredPost.publishedDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatNumberFa(featuredPost.readTimeMinutes)} دقیقه
                    </span>
                  </div>

                  <span className="text-blue-400 font-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>مطالعه مقاله ویژه</span>
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 h-64 lg:h-auto overflow-hidden relative">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          )}

          {/* Filter Status Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900">
                فهرست مقالات خواندنی
                {selectedCategory !== 'all' ? ` («${selectedCategorySpec.label}»)` : ''}
              </h3>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                {formatNumberFa(posts.length)} مقاله
              </span>
            </div>

            {searchQuery && (
              <span className="text-xs text-slate-500 font-bold">
                نتیجه جستجو برای «{searchQuery}»
              </span>
            )}
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-500 font-medium">
              در حال لود اطلاعات مقالات از دیتابیس...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-500 font-medium space-y-3">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center border border-blue-100 shadow-xs">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <p className="text-base font-black text-slate-800">مقاله‌ای یافت نشد</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  در حال حاضر مقاله‌ای در این بخش منتشر نشده است. به زودی مطالب و مقالات تخصصی جدید در این بخش قرار خواهد گرفت.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    openPost(post);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col group"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700/50">
                      {post.category}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.publishedDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatNumberFa(post.readTimeMinutes)} دقیقه
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-medium">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-blue-600">
                      <span>مطالعه کامل مقاله</span>
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
