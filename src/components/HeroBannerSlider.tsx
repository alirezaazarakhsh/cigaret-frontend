import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Flame, 
  Download,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CigaretteProduct, UserProfile, BannerSlide } from '../types';
import { generatePriceListPdf } from '../utils/pdfGenerator';

export interface HeroBannerSliderProps {
  slides?: BannerSlide[];
  products: CigaretteProduct[];
  currentUser: UserProfile | null;
  onNavigateTab: (tab: any) => void;
  onSelectCategory?: (category: any) => void;
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({
  slides = [],
  products,
  currentUser,
  onNavigateTab,
  onSelectCategory,
}) => {
  // CRITICAL USER DIRECTIVE:
  // If the backend database has no slider records (empty array), the slider component MUST be completely hidden!
  if (!slides || slides.length === 0) {
    return null;
  }

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay, slides.length]);

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleAction = (action: string) => {
    if (!action) return;
    if (action === 'live-prices') {
      onNavigateTab('live-prices');
    } else if (action === 'invoice') {
      onNavigateTab('invoice');
    } else if (action === 'catalog') {
      onNavigateTab('catalog');
    } else if (action === 'iqos' || action === 'iqos_heets') {
      if (onSelectCategory) {
        onSelectCategory('iqos_heets');
      }
      onNavigateTab('catalog');
    } else if (action === 'shipping') {
      onNavigateTab('shipping');
    } else if (action === 'pdf') {
      generatePriceListPdf(products, 'all');
    } else if (action.startsWith('http://') || action.startsWith('https://')) {
      window.location.href = action;
    } else {
      onNavigateTab(action);
    }
  };

  const activeSlide = slides[currentSlideIndex % slides.length];
  if (!activeSlide) return null;

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-950 group h-[480px] sm:h-[520px] lg:h-[580px]"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      id="main-hero-slider"
    >
      {/* Background Image Layer */}
      {activeSlide.imageUrl && (
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
      )}

      {/* Gradient Overlay for Text Readability (RTL: Dark on right, transparent on left) */}
      <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-slate-950/80 to-slate-950/20 z-10" />
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
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black border backdrop-blur-md shadow-xs ${activeSlide.badgeColor || 'bg-white/10 text-white border-white/20'}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
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
            <div className="flex items-center gap-2.5 bg-slate-900/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-xs">
              <span className="text-lg font-black text-white tracking-tight">{activeSlide.statNumber}</span>
              {activeSlide.statLabel && (
                <span className="text-xs text-slate-300 font-bold">{activeSlide.statLabel}</span>
              )}
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
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3 font-medium max-w-2xl">
                  {activeSlide.description}
                </p>
              )}
            </div>

            {/* Feature Pills */}
            {activeSlide.features && activeSlide.features.length > 0 && (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {activeSlide.features.map((feat, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {feat}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {activeSlide.primaryBtnText && (
                <button
                  onClick={() => handleAction(activeSlide.primaryBtnAction || 'catalog')}
                  className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 group/btn cursor-pointer active:scale-95"
                >
                  <span>{activeSlide.primaryBtnText}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              )}

              {activeSlide.secondaryBtnText && (
                <button
                  onClick={() => handleAction(activeSlide.secondaryBtnAction || 'invoice')}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>{activeSlide.secondaryBtnText}</span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Bar: Indicators & Prev/Next Controls (only if multiple slides) */}
        {slides.length > 1 && (
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/10 mt-auto">
            
            {/* Thumbnails / Indicators */}
            <div className="flex items-center gap-3">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
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
        )}

      </div>
    </div>
  );
};
