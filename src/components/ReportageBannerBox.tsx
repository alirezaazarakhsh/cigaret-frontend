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
      {/* Decorative background glow elements */}
      <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/30 blur-2xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/20 blur-2xl pointer-events-none" />

      {/* Strictly vertical layout: Text on top, Banner on bottom */}
      <div className="relative z-10 flex flex-col items-center text-right w-full gap-4">
        
        {/* Top: Header Badges & Headline & Website URL */}
        <div className="w-full space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm ${theme.badgeBg} ${theme.badgeText}`}>
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                <span>ریپورتاژ آگهی و معرفی حامی رسمی</span>
              </div>
              {post.reportageSponsor && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-white/80 backdrop-blur-sm border ${theme.borderColor} ${theme.titleColor}`}>
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                  <span>حامی: {post.reportageSponsor}</span>
                </span>
              )}
            </div>

            {/* Website URL (if provided, otherwise empty) */}
            {post.reportageLink && (
              <a
                href={post.reportageLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-white/70 backdrop-blur-sm border ${theme.borderColor} ${theme.titleColor} hover:underline dir-ltr`}
                title="آدرس وب‌سایت حامی"
              >
                <span className="font-mono">{post.reportageLink.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <h4 className={`text-base sm:text-lg font-black leading-snug tracking-tight ${theme.titleColor}`}>
            {post.reportageSponsor ? `معرفی رسمی و ویژه: ${post.reportageSponsor}` : 'جایگاه حامی مالی و تجاری مقاله'}
          </h4>
        </div>

        {/* Bottom: Standard 468x60 Banner Box */}
        <div className="w-full flex flex-col items-center justify-center pt-1">
          {post.reportageBanner ? (
            <div className="w-full flex flex-col items-center justify-center">
              <a
                href={post.reportageLink || '#'}
                target={post.reportageLink ? "_blank" : "_self"}
                rel="noopener noreferrer sponsored"
                className={`group relative block w-full max-w-[468px] h-[60px] rounded-xl overflow-hidden border-2 ${theme.borderColor} shadow-lg transition-all duration-300 transform hover:scale-[1.01] bg-slate-900`}
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
              <div className="flex items-center justify-between w-full max-w-[468px] px-1 mt-1 text-[10px] font-bold opacity-70">
                <span className={theme.titleColor}>ابعاد استاندارد: ۴۶۸×۶۰ پیکسل</span>
                <span className={`uppercase tracking-widest text-[9px] ${theme.titleColor}`}>Sponsored Ad</span>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center">
              <div className={`w-full max-w-[468px] h-[60px] rounded-xl border-2 border-dashed ${theme.borderColor} bg-white/40 flex items-center justify-center gap-2 text-xs font-black ${theme.titleColor}`}>
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
                <span>جایگاه فعال بنر ۴۶۸×۶۰ ریپورتاژ آگهی</span>
              </div>
              <span className={`text-[10px] font-bold mt-1 opacity-70 ${theme.titleColor}`}>ابعاد استاندارد ۴۶۸ در ۶۰</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
