import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { BlogPost } from '../types';
import { BLOG_POSTS } from '../data/blogPosts';
import { formatNumberFa } from '../utils/formatters';

interface BlogSectionProps {
  onSelectProductTag?: (brand: string) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onSelectProductTag }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = [
    { id: 'all', label: 'همه مقالات تخصصی' },
    { id: 'تحلیل بازار و ارز', label: 'تحلیل نوسان دلار و بازار سیگار' },
    { id: 'اصالت کالا و برند', label: 'راهنمای تشخیص سیگار اصل و هولوگرام' },
    { id: 'فناوری IQOS', label: 'تکنولوژی IQOS، هیتس و تیریا' },
    { id: 'راهنمای بنکداری', label: 'راهنمای خرید کارتن و باربری' }
  ];

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchCat = selectedCategory === 'all' || post.category === selectedCategory;
    const matchSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section className="py-6 space-y-6" id="blog-section">
      {/* Schema.org Blog Microdata for High SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "وبلاگ تخصصی و تحلیل بازار دخانیات سوین",
            "description": "تحلیل لحظه‌ای قیمت کارتن و باکس سیگار، تأثیر دلار آزاد، اصالت هولوگرام و راهنمای بنکداری",
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

      {/* Hero Header of Blog */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-black px-3 py-1 rounded-xl border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              مرجع مقالات تخصصی سئو و تحلیل بازار دخانیات
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              وبلاگ تخصصی بنکداری، تحلیل نرخ ارز و راهنمای خرید عمده
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              تحلیل روزانه نوسان دلار بر نرخ سیگار، تفاوت بسته‌بندی‌های فیلیپ موریس و بریتیش آمریکن توباکو، بررسی اصالت هولوگرام و آخرین قوانین مالیات دخانیات.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجوی مقاله، اصالت، IQOS، هولوگرام..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-4 border-t border-slate-100 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedPost(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* DETAIL VIEW IF POST SELECTED */}
      {selectedPost ? (
        <article className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              بازگشت به فهرست مقالات
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {selectedPost.publishedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatNumberFa(selectedPost.readTimeMinutes)} دقیقه مطالعه
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedLink ? 'لینک کپی شد' : 'اشتراک‌گذاری'}
              </button>
            </div>
          </div>

          {/* Post Header Image & Title */}
          <div className="space-y-4">
            <span className="inline-block bg-blue-50 text-blue-800 text-xs font-black px-3 py-1 rounded-lg border border-blue-200">
              {selectedPost.category}
            </span>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
              {selectedPost.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border-r-4 border-blue-600">
              {selectedPost.excerpt}
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-200 max-h-[400px]">
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Key Takeaways */}
          {selectedPost.keyTakeaways && selectedPost.keyTakeaways.length > 0 && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2">
              <div className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                نکات کلیدی برای بنکداران و خریداران عمده:
              </div>
              <ul className="space-y-1.5 text-xs text-blue-950 font-medium list-disc list-inside">
                {selectedPost.keyTakeaways.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Article HTML Content */}
          <div 
            className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-loose space-y-4 font-normal"
            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
          />

          {/* FAQs if present */}
          {selectedPost.faqs && selectedPost.faqs.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h3 className="text-sm font-black text-slate-900">
                پرسش‌های متداول خریداران عمده درباره این موضوع:
              </h3>
              <div className="space-y-2.5">
                {selectedPost.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="font-black text-xs text-slate-900 mb-1">
                      {faq.question}
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> برچسب‌های سئو:
            </span>
            {selectedPost.tags.map((t, idx) => (
              <span 
                key={idx} 
                className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg"
              >
                #{t}
              </span>
            ))}
          </div>
        </article>
      ) : (
        /* BLOG POSTS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col group"
            >
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
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

                  <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
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
    </section>
  );
};
