import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  Truck, 
  Layers, 
  Boxes, 
  Flame, 
  Download,
  ArrowUpRight,
  Clock,
  BadgePercent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CigaretteProduct, UserProfile } from '../types';
import { generatePriceListPdf } from '../utils/pdfGenerator';

interface HeroBannerSliderProps {
  products: CigaretteProduct[];
  currentUser: UserProfile | null;
  onNavigateTab: (tab: any) => void;
  onSelectCategory?: (category: any) => void;
}

interface BannerSlide {
  id: string;
  badge?: string;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  badgeColor?: string;
  title: string;
  highlight?: string;
  description?: string;
  features?: string[];
  primaryBtnText?: string;
  primaryBtnAction?: 'live-prices' | 'invoice' | 'catalog' | 'pdf' | 'iqos' | 'shipping';
  secondaryBtnText?: string;
  secondaryBtnAction?: 'live-prices' | 'invoice' | 'catalog' | 'pdf' | 'iqos' | 'shipping';
  imageUrl: string; 
  tagline?: string;
  statNumber?: string;
  statLabel?: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: 'slide-marlboro',
    badge: 'تأمین دست‌اول و دست‌نخورده سوئیس',
    badgeIcon: Flame,
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    title: 'مرکز پخش عمده سیگارهای وارداتی',
    highlight: 'با هولوگرام و تاریخ تولید جدید ۲۰۲۵/۲۰۲۶',
    description: 'بارگیری مستقیم و روزانه از انبار مرکزی جنت‌آباد، استعلام آنلاین اصالت کالا، تضمین کارتن پلمپ کارخانه‌ای با تخفیف‌های پلکانی ویژه خریدهای بالای ۵ و ۱۰ کارتن.',
    features: ['تضمین پلمپ کارخانه‌ای', 'قیمت‌گذاری بدون واسطه', 'ارسال همان روز'],
    primaryBtnText: 'مشاهده نرخ لحظه‌ای کارتن',
    primaryBtnAction: 'live-prices',
    secondaryBtnText: 'دانلود لیست قیمت (PDF)',
    secondaryBtnAction: 'pdf',
    imageUrl: 'https://images.unsplash.com/photo-1622322306788-29532822a36b?q=80&w=2070&auto=format&fit=crop', // Luxury abstract dark smoke/gold
    tagline: 'انبار مرکزی جنت‌آباد • تحویل فوری',
    statNumber: '۱۰۰٪',
    statLabel: 'اصالت بار و تضمین سلامت'
  },
  {
    id: 'slide-iqos',
    badge: 'مرکز تخصصی نسل جدید آیکاس',
    badgeIcon: Sparkles,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    title: 'تجهیزات IQOS ILUMA و استیک TEREA',
    highlight: 'واردات مستقیم بار تازه ارمنستان و ژاپن',
    description: 'کامل‌ترین آرشیو کارتریج‌های تیریا شامل Silver، Sienna، Turquoise و Purple Wave با تاریخ جدید، همراه با مدل‌های متنوع دستگاه‌های ایلوما وان و پرایم پلمپ شرکتی.',
    features: ['طعم‌های کامل و کمیاب', 'تخفیف ویژه سفارش عمده', 'ضمانت اصالت دستگاه'],
    primaryBtnText: 'بررسی کاتالوگ آیکاس',
    primaryBtnAction: 'iqos',
    secondaryBtnText: 'صدور پیش‌فاکتور رسمی',
    secondaryBtnAction: 'invoice',
    imageUrl: 'https://images.unsplash.com/photo-1527068589345-b736a7ed9ce3?q=80&w=2070&auto=format&fit=crop', // Modern tech / abstract
    tagline: 'SmartCore Induction System',
    statNumber: '۴۸+',
    statLabel: 'تنوع فلیور و مدل فعال'
  },
  {
    id: 'slide-shipping',
    badge: 'ناوگان حمل سریع و اکسپرس',
    badgeIcon: Truck,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    title: 'ارسال ایمن و بیمه‌شده باربری به سراسر کشور',
    highlight: 'تحویل ۲ ساعته تهران و ۲۴ تا ۴۸ ساعته شهرستان',
    description: 'همکاری مستقیم با معتبرترین باربری‌ها به همراه بسته‌بندی ضدضربه فوم و سلفون ضدآب، با رهگیری آنلاین بیجک بارنامه در پنل اختصاصی مشتریان.',
    features: ['صدور فوری بیجک', 'بسته‌بندی ۵ لایه محرمانه', 'پوشش کامل بیمه حوادث'],
    primaryBtnText: 'محاسبه کرایه و رهگیری',
    primaryBtnAction: 'shipping',
    secondaryBtnText: 'استعلام تعرفه‌ها',
    secondaryBtnAction: 'shipping',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop', // Logistics/warehouse
    tagline: 'پوشش ۳۱ استان • رهگیری آنلاین',
    statNumber: '۲۴h',
    statLabel: 'میانگین تحویل به باربری'
  },
  {
    id: 'slide-invoice',
    badge: 'پنل بنکداری و همکاران تجاری',
    badgeIcon: ShieldCheck,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    title: 'صدور فوری پیش‌فاکتور همراه با تخفیف پلکانی',
    highlight: 'مهر رسمی، شناسه ملی و ثبت واریز فیش بانکی',
    description: 'امکان انتخاب تحویل حضوری از انبار یا باربری، محاسبه آنی سود حاشیه فروش و پورسانت ویزیتور، با قابلیت تسویه‌حساب اعتباری ویژه بنکداران تاییدشده.',
    features: ['تخفیف ویژه خریدهای عمده', 'تسویه حساب شفاف', 'پشتیبانی ۲۴ ساعته'],
    primaryBtnText: 'صدور پیش‌فاکتور',
    primaryBtnAction: 'invoice',
    secondaryBtnText: 'مشاهده نرخ لحظه‌ای',
    secondaryBtnAction: 'live-prices',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop', // Finance/accounting
    tagline: 'حسابداری اتوماتیک • فاکتور رسمی',
    statNumber: '۴.۵٪',
    statLabel: 'سقف تخفیف پلکانی'
  }
];

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({
  products,
  currentUser,
  onNavigateTab,
  onSelectCategory,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleAction = (action: string) => {
    if (action === 'live-prices') {
      onNavigateTab('live-prices');
    } else if (action === 'invoice') {
      onNavigateTab('invoice');
    } else if (action === 'catalog') {
      onNavigateTab('catalog');
    } else if (action === 'iqos') {
      if (onSelectCategory) {
        onSelectCategory('iqos_heets');
      }
      onNavigateTab('catalog');
    } else if (action === 'shipping') {
      onNavigateTab('shipping');
    } else if (action === 'pdf') {
      generatePriceListPdf(products, 'all');
    }
  };

  const activeSlide = SLIDES[currentSlideIndex];

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-950 group h-[480px] sm:h-[520px] lg:h-[580px]"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      id="main-hero-slider"
    >
      {/* Background Image Layer */}
      <AnimatePresence mode="wait">
        <motion.img 
          key={activeSlide.imageUrl}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          src={activeSlide.imageUrl} 
          alt={activeSlide.title} 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      </AnimatePresence>

      {/* Chic Gradient Overlay for Text Readability (RTL: Dark on right, transparent on left) */}
      <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-slate-950/80 to-slate-950/10 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />

      {/* Main Content Container */}
      <div className="relative z-20 w-full h-full p-6 sm:p-10 lg:p-14 flex flex-col justify-between">
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {activeSlide.badge && (
              <AnimatePresence mode="wait">
                <motion.span 
                  key={activeSlide.id + '-badge'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black border backdrop-blur-md shadow-sm ${activeSlide.badgeColor || 'bg-white/10 text-white'}`}
                >
                  {activeSlide.badgeIcon && <activeSlide.badgeIcon className="w-4 h-4" />}
                  {activeSlide.badge}
                </motion.span>
              </AnimatePresence>
            )}
            {activeSlide.tagline && (
              <span className="text-xs font-bold text-slate-300 hidden sm:inline-block">
                {activeSlide.tagline}
              </span>
            )}
          </div>

          {/* Stat Pill */}
          {activeSlide.statNumber && (
            <div className="flex items-center gap-2.5 bg-slate-900/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-sm">
              <span className="text-lg font-black text-white tracking-tight">{activeSlide.statNumber}</span>
              <span className="text-xs text-slate-300 font-bold">{activeSlide.statLabel}</span>
            </div>
          )}
        </div>

        {/* Center Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full lg:w-3/5 space-y-6 my-auto"
          >
            <div className="space-y-4">
              {activeSlide.highlight && (
                <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-xs font-bold text-slate-200">
                  {activeSlide.highlight}
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                {activeSlide.title}
              </h2>
              {activeSlide.description && (
                <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl">
                  {activeSlide.description}
                </p>
              )}
            </div>

            {/* Feature Bullets */}
            {activeSlide.features && activeSlide.features.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {activeSlide.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs sm:text-sm font-bold text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {(activeSlide.primaryBtnText || activeSlide.secondaryBtnText) && (
              <div className="flex flex-wrap items-center gap-4 pt-4">
                {activeSlide.primaryBtnText && (
                  <button
                    onClick={() => activeSlide.primaryBtnAction && handleAction(activeSlide.primaryBtnAction)}
                    className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
                    id={`hero-action-primary-${activeSlide.id}`}
                  >
                    <span>{activeSlide.primaryBtnText}</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                )}

                {activeSlide.secondaryBtnText && (
                  <button
                    onClick={() => activeSlide.secondaryBtnAction && handleAction(activeSlide.secondaryBtnAction)}
                    className="px-6 py-4 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 text-white text-sm font-black flex items-center gap-2 transition-all backdrop-blur-xl active:scale-95 border border-slate-700 cursor-pointer"
                    id={`hero-action-secondary-${activeSlide.id}`}
                  >
                    <span>{activeSlide.secondaryBtnText}</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Bar: Indicators & Prev/Next Controls */}
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/10 mt-auto">
          
          {/* Thumbnails / Indicators */}
          <div className="flex items-center gap-3">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`transition-all duration-500 rounded-full h-1.5 cursor-pointer relative overflow-hidden ${
                  currentSlideIndex === idx 
                    ? 'w-12 bg-white/20' 
                    : 'w-4 bg-white/20 hover:bg-white/40'
                }`}
                title={slide.title}
                aria-label={`اسلاید ${idx + 1}`}
              >
                {currentSlideIndex === idx && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6, ease: 'linear' }}
                    className="absolute inset-y-0 left-0 bg-blue-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-white flex items-center justify-center border border-white/10 backdrop-blur-xl transition-all active:scale-90 cursor-pointer"
              title="اسلاید قبلی"
              aria-label="اسلاید قبلی"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-white flex items-center justify-center border border-white/10 backdrop-blur-xl transition-all active:scale-90 cursor-pointer"
              title="اسلاید بعدی"
              aria-label="اسلاید بعدی"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

