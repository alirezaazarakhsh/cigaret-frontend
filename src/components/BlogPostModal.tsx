import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  User, 
  Tag, 
  Share2, 
  CheckCircle2, 
  ChevronDown, 
  PhoneCall, 
  BookOpen, 
  Sparkles,
  HelpCircle,
  Copy,
  Code2
} from 'lucide-react';
import { BlogPost } from '../types';
import { formatNumberFa } from '../utils/formatters';

interface BlogPostModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onOpenOrder: () => void;
}

export const BlogPostModal: React.FC<BlogPostModalProps> = ({
  post,
  onClose,
  onOpenOrder,
}) => {
  if (!post) return null;

  const [copied, setCopied] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Schema.org Article & FAQPage JSON-LD
  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": post.metaTitle,
        "description": post.metaDescription,
        "image": post.image,
        "datePublished": "2026-08-22",
        "author": {
          "@type": "Person",
          "name": post.author.name,
          "jobTitle": post.author.role
        },
        "publisher": {
          "@type": "Organization",
          "name": "سامانه پخش عمده دخانیات سوین",
          "logo": {
            "@type": "ImageObject",
            "url": "https://sevin-tobacco.ir/logo.png"
          }
        },
        "keywords": post.keywords.join(', ')
      },
      ...(post.faqs && post.faqs.length > 0 ? [{
        "@type": "FAQPage",
        "mainEntity": post.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }] : [])
    ]
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-scrollbar bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto modal-overscroll-contain p-5 sm:p-8 shadow-2xl relative text-slate-900 my-auto"
        id="blog-article-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors z-10"
          title="بستن پنجره"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Article Header & Category */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              زمان مطالعه: {formatNumberFa(post.readTimeMinutes)} دقیقه
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {post.publishedDate}
            </span>
          </div>

          <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
            {post.title}
          </h1>

          {/* Author Profile */}
          <div className="flex items-center justify-between flex-wrap gap-3 py-3 border-y border-slate-100">
            <div className="flex items-center gap-3">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-200" 
              />
              <div>
                <div className="text-xs font-black text-slate-900">{post.author.name}</div>
                <div className="text-[11px] text-slate-500">{post.author.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSchema(!showSchema)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                title="مشاهده ساختار داده‌های استاندارد Schema.org برای گوگل"
              >
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                <span>ساختار سئو (JSON-LD)</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-blue-600" />}
                <span>{copied ? 'لینک کپی شد!' : 'اشتراک‌گذاری'}</span>
              </button>
            </div>
          </div>

          {/* Schema JSON-LD Box */}
          {showSchema && (
            <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto dir-ltr text-left space-y-2 border border-slate-800 animate-in fade-in">
              <div className="flex justify-between items-center text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <span>Google Schema.org Article & FAQ Structured Data</span>
                <span className="text-emerald-400">Valid JSON-LD</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-emerald-300">
                {JSON.stringify(schemaJsonLd, null, 2)}
              </pre>
            </div>
          )}

          {/* Featured Image */}
          <div className="relative rounded-3xl overflow-hidden aspect-video max-h-80 w-full border border-slate-200">
            <img 
              src={post.image} 
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Key Takeaways Box (SEO Golden Box) */}
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-3xl space-y-2.5">
            <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
              <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600" />
              نکات کلیدی و چکیده مقاله (مخصوص بنکداران و خریداران عمده):
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {post.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                  <span className="leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Article Main Text Content */}
          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 pt-2 whitespace-pre-line font-normal">
            {post.content}
          </div>

          {/* FAQ Accordion Section */}
          {post.faqs && post.faqs.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                پرسش‌های متداول همکاران و خریداران عمده:
              </div>
              <div className="space-y-2">
                {post.faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full text-right p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 text-xs font-bold text-slate-900 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaqIndex === idx && (
                      <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 font-medium">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              کلمات کلیدی سئو:
            </span>
            {post.tags.map(t => (
              <span key={t} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-colors">
                #{t}
              </span>
            ))}
          </div>

          {/* Wholesale Call to Action Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="space-y-1 text-center sm:text-right">
              <h4 className="text-sm font-black text-white">
                نیاز به استعلام نرخ روز کارتن یا ثبت سفارش باربری دارید؟
              </h4>
              <p className="text-xs text-slate-300">
                پخش عمده دخانیات سوین | آماده ارسال فوری به سراسر کشور
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="tel:09120759419"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-colors active:scale-95 shadow-md shadow-blue-600/30"
              >
                <PhoneCall className="w-4 h-4" />
                <span dir="ltr">۰۹۱۲۰۷۵۹۴۱۹</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  onOpenOrder();
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors"
              >
                مشاهده کاتالوگ و ثبت فاکتور
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
