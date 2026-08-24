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
  badge: string;
  badgeIcon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  title: string;
  highlight: string;
  description: string;
  features: string[];
  primaryBtnText: string;
  primaryBtnAction: 'live-prices' | 'invoice' | 'catalog' | 'pdf' | 'iqos' | 'shipping';
  secondaryBtnText: string;
  secondaryBtnAction: 'live-prices' | 'invoice' | 'catalog' | 'pdf' | 'iqos' | 'shipping';
  bgGradient: string;
  tagline: string;
  statNumber: string;
  statLabel: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: 'slide-marlboro',
    badge: 'تأمین دست‌اول و دست‌نخورده سوئیس',
    badgeIcon: Flame,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    title: 'مرکز پخش عمده مارلبرو، وینستون و سیگارهای وارداتی',
    highlight: 'با هولوگرام و تاریخ تولید جدید ۲۰۲۵/۲۰۲۶',
    description: 'بارگیری مستقیم و روزانه از انبار مرکزی جنت‌آباد، استعلام آنلاین اصالت کالا، تضمین کارتن پلمپ کارخانه‌ای با تخفیف‌های پلکانی ویژه خریدهای بالای ۵ و ۱۰ کارتن.',
    features: ['تضمین پلمپ بدون هواخوردگی', 'قیمت‌گذاری دست‌اول بدون واسطه', 'ارسال همان روز به تهران و باربری شهرستان'],
    primaryBtnText: 'مشاهده نرخ لحظه‌ای کارتن و باکس',
    primaryBtnAction: 'live-prices',
    secondaryBtnText: 'دانلود لیست کامل قیمت‌ها (PDF)',
    secondaryBtnAction: 'pdf',
    bgGradient: 'from-blue-900 via-indigo-900 to-slate-900 text-white',
    tagline: 'انبار مرکزی جنت‌آباد • تحویل فوری',
    statNumber: '۱۰۰٪',
    statLabel: 'اصالت بار و تضمین سلامت'
  },
  {
    id: 'slide-iqos',
    badge: 'مرکز تخصصی نسل جدید آیکاس',
    badgeIcon: Sparkles,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'دستگاه‌های IQOS ILUMA Prime و استیک‌های TEREA اصل',
    highlight: 'واردات مستقیم بار تازه ارمنستان، اندونزی و ژاپن',
    description: 'کامل‌ترین آرشیو کارتریج‌های تیریا شامل Silver، Sienna، Bronze، Turquoise و Purple Wave با تاریخ جدید، همراه با مدل‌های متنوع دستگاه‌های ایلوما وان و پرایم پلمپ شرکتی.',
    features: ['طعم‌های کامل و کمیاب تیریا', 'تخفیف ویژه سفارش عمده ۵ باکسی', 'ضمانت روشن‌شدن و سریال دستگاه'],
    primaryBtnText: 'بررسی کاتالوگ آیکاس و تیریا',
    primaryBtnAction: 'iqos',
    secondaryBtnText: 'صدور پیش‌فاکتور رسمی',
    secondaryBtnAction: 'invoice',
    bgGradient: 'from-teal-950 via-slate-900 to-indigo-950 text-white',
    tagline: 'تجهیزات مدرن دخانیات • SmartCore Induction',
    statNumber: '۴۸+',
    statLabel: 'تنوع فلیور و مدل فعال'
  },
  {
    id: 'slide-shipping',
    badge: 'ناوگان حمل سریع و اکسپرس',
    badgeIcon: Truck,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'ارسال ایمن و بیمه‌شده باربری به سراسر ۳۱ استان کشور',
    highlight: 'تحویل ۲ ساعته تهران و ۲۴ تا ۴۸ ساعته شهرستان',
    description: 'همکاری مستقیم با معتبرترین باربری‌های وطن، پیشتاز، باربری شوش و تیپاکس به همراه بسته‌بندی ضدضربه فوم و سلفون ضدآب، با رهگیری آنلاین بیجک بارنامه در پنل اختصاصی.',
    features: ['صدور فوری شماره بارنامه و بیجک', 'بسته‌بندی ۵ لایه محرمانه و ایمن', 'پوشش کامل بیمه حوادث و مفقودی'],
    primaryBtnText: 'محاسبه کرایه و رهگیری باربری',
    primaryBtnAction: 'shipping',
    secondaryBtnText: 'استعلام تعرفه کرایه‌ها',
    secondaryBtnAction: 'shipping',
    bgGradient: 'from-slate-900 via-blue-950 to-slate-900 text-white',
    tagline: 'پوشش ۳۱ استان • رهگیری بیجک',
    statNumber: '۲۴h',
    statLabel: 'میانگین زمان تحویل به باربری'
  },
  {
    id: 'slide-invoice',
    badge: 'پنل بنکداری و همکاران تجاری',
    badgeIcon: ShieldCheck,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'صدور فوری پیش‌فاکتور رسمی همراه با تخفیف‌های پلکانی',
    highlight: 'مهر رسمی، شناسه ملی شرکت و ثبت واریز فیش بانکی',
    description: 'امکان انتخاب تحویل حضوری از انبار یا باربری، محاسبه آنی سود حاشیه فروش و پورسانت ویزیتور، با قابلیت پرینت اختصاصی و تسویه‌حساب اعتباری ویژه بنکداران تاییدشده.',
    features: ['تخفیف تا ۴.۵٪ برای خرید بالای ۱۰ کارتن', 'تسویه حساب ریالی و ارزی شفاف', 'پشتیبانی ۲۴ ساعته تیکت و حسابداری'],
    primaryBtnText: 'صدور پیش‌فاکتور رسمی هوشمند',
    primaryBtnAction: 'invoice',
    secondaryBtnText: 'مشاهده نرخ لحظه‌ای بازار',
    secondaryBtnAction: 'live-prices',
    bgGradient: 'from-indigo-950 via-slate-900 to-sky-950 text-white',
    tagline: 'حسابداری اتوماتیک • سیستم فاکتور رسمی',
    statNumber: '۴.۵٪',
    statLabel: 'بیشترین سقف تخفیف پلکانی'
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
      className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-white"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      id="main-hero-slider"
    >
      {/* Slide Container */}
      <div className={`relative min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] bg-gradient-to-br ${activeSlide.bgGradient} p-6 sm:p-10 lg:p-14 flex flex-col justify-between transition-colors duration-700`}>
        
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar inside Banner */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black border backdrop-blur-md shadow-xs ${activeSlide.badgeColor}`}>
              <activeSlide.badgeIcon className="w-3.5 h-3.5" />
              {activeSlide.badge}
            </span>
            <span className="text-xs font-bold text-slate-300 hidden sm:inline-block">
              {activeSlide.tagline}
            </span>
          </div>

          {/* Stat Pill */}
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shadow-xs">
            <span className="text-lg font-black text-amber-300 tracking-tight">{activeSlide.statNumber}</span>
            <span className="text-xs text-slate-200 font-bold">{activeSlide.statLabel}</span>
          </div>
        </div>

        {/* Center Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative z-10 py-6 sm:py-8 max-w-5xl space-y-4"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
              {activeSlide.title}
            </h2>

            <div className="inline-block bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black">
              {activeSlide.highlight}
            </div>

            <p className="text-xs sm:text-base lg:text-lg text-slate-200 font-medium leading-relaxed max-w-4xl">
              {activeSlide.description}
            </p>

            {/* Feature Bullets */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {activeSlide.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <button
                onClick={() => handleAction(activeSlide.primaryBtnAction)}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-95 border border-blue-400/30 cursor-pointer"
                id={`hero-action-primary-${activeSlide.id}`}
              >
                <span>{activeSlide.primaryBtnText}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleAction(activeSlide.secondaryBtnAction)}
                className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-black flex items-center gap-2 transition-all backdrop-blur-md active:scale-95 border border-white/20 cursor-pointer"
                id={`hero-action-secondary-${activeSlide.id}`}
              >
                <span>{activeSlide.secondaryBtnText}</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Bar: Indicators & Prev/Next Controls */}
        <div className="relative z-10 flex items-center justify-between gap-4 pt-4 border-t border-white/10">
          
          {/* Thumbnails / Indicators */}
          <div className="flex items-center gap-2">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`transition-all duration-300 rounded-full h-2.5 cursor-pointer ${
                  currentSlideIndex === idx 
                    ? 'w-8 bg-blue-400' 
                    : 'w-2.5 bg-white/30 hover:bg-white/50'
                }`}
                title={slide.title}
                aria-label={`اسلاید ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/15 backdrop-blur-md transition-all active:scale-90 cursor-pointer"
              title="اسلاید قبلی"
              aria-label="اسلاید قبلی"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/15 backdrop-blur-md transition-all active:scale-90 cursor-pointer"
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
