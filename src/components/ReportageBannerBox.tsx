import React from 'react';
import { Sparkles, ExternalLink, Flame } from 'lucide-react';
import { BlogPost } from '../types';
import { getReportageTheme } from '../utils/reportageThemes';

interface ReportageBannerBoxProps {
  post: Partial<BlogPost>;
  className?: string;
}

export const ReportageBannerBox: React.FC<ReportageBannerBoxProps> = ({ post, className = '' }) => {
  if (!post.isReportage && !post.reportageBanner) {
    return null;
  }

  const theme = getReportageTheme(post.reportageBgColor, post.reportageBgColor, post.reportageRingColor);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-md ${theme.gradientBg} ${theme.ringClass} border-2 ${theme.borderColor} ${className}`}
      style={{
        boxShadow: `0 10px 30px -5px ${theme.glowColor}`
      }}
    >
      {/* Decorative animated background glow elements */}
      <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/30 blur-2xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-6">
        {/* Text and Information (Right Side in RTL) */}
        <div className="flex-1 space-y-3 text-right w-full">
          {/* Animated Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm ${theme.badgeBg} ${theme.badgeText} animate-pulse`}>
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>ریپورتاژ آگهی و معرفی حامی رسمی</span>
            </div>
            {post.reportageSponsor && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-white/80 backdrop-blur-sm border ${theme.borderColor} ${theme.titleColor}`}>
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                <span>حامی: {post.reportageSponsor}</span>
              </span>
            )}
          </div>

          {/* Bolder, Prominent Headline */}
          <h4 className={`text-base sm:text-lg font-black leading-snug tracking-tight ${theme.titleColor}`}>
            {post.reportageSponsor ? `معرفی رسمی و ویژه: ${post.reportageSponsor}` : 'جایگاه حامی مالی و تجاری مقاله'}
          </h4>

          {/* Descriptive Text */}
          <p className={`text-xs sm:text-sm leading-relaxed font-bold ${theme.descColor} opacity-95`}>
            این مقاله دارای جایگاه ریپورتاژ آگهی است. جهت آشنایی با خدمات، استعلام سبد محصولات یا دسترسی مستقیم به وب‌سایت حامی، روی بنر ۴۶۸×۶۰ زیر یا دکمه کلیک نمایید.
          </p>

          {/* Action CTA Button */}
          {post.reportageLink && (
            <div className="pt-1">
              <a
                href={post.reportageLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-white text-xs sm:text-sm font-black transition-all duration-200 transform hover:scale-[1.03] active:scale-95 shadow-md ${theme.btnBg} ${theme.btnHover} ${theme.btnShadow}`}
              >
                <span>مشاهده وب‌سایت {post.reportageSponsor || 'اسپانسر'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Standard 468x60 Banner Box (Left Side in RTL) */}
        {post.reportageBanner ? (
          <div className="shrink-0 flex flex-col items-center justify-center w-full lg:w-auto">
            <a
              href={post.reportageLink || '#'}
              target={post.reportageLink ? "_blank" : "_self"}
              rel="noopener noreferrer sponsored"
              className={`group relative block w-full max-w-[468px] h-[60px] sm:h-[60px] rounded-xl overflow-hidden border-2 ${theme.borderColor} shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-slate-900`}
              title={post.reportageSponsor || 'بنر ریپورتاژ ۴۶۸ در ۶۰'}
            >
              <img
                src={post.reportageBanner}
                alt={post.reportageSponsor || 'بنر ریپورتاژ ۴۶۸ در ۶۰'}
                className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-end p-2 opacity-0 group-hover:opacity-100">
                <span className="text-[10px] font-black text-white bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>مشاهده</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </a>
            <div className="flex items-center justify-between w-full max-w-[468px] px-1 mt-1.5 text-[10px] font-bold text-slate-500 opacity-80">
              <span>اندازه استاندارد: ۴۶۸×۶۰ پیکسل</span>
              <span className="uppercase tracking-widest text-[9px]">Sponsored Ad</span>
            </div>
          </div>
        ) : (
          <div className="shrink-0 flex flex-col items-center justify-center w-full lg:w-auto">
            <div className={`w-full max-w-[468px] h-[60px] rounded-xl border-2 border-dashed ${theme.borderColor} bg-white/40 flex items-center justify-center gap-2 text-xs font-black ${theme.titleColor}`}>
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>جایگاه فعال بنر ۴۶۸×۶۰ ریپورتاژ آگهی</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1">ابعاد استاندارد ۴۶۸ در ۶۰</span>
          </div>
        )}
      </div>
    </div>
  );
};
