import React from 'react';
import { 
  Package, 
  MapPin, 
  Phone, 
  Clock, 
  Send, 
  MessageSquare, 
  Instagram, 
  ShieldCheck, 
  ExternalLink,
  PhoneCall,
  Truck
} from 'lucide-react';
import { FooterSettingsData, DjangoCrmConfig, NavigationTab } from '../types';

interface FooterProps {
  footerData?: FooterSettingsData | null;
  djangoConfig: DjangoCrmConfig;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ footerData, djangoConfig, onNavigateTab }) => {
  // If explicitly hidden by admin
  if (footerData && footerData.is_active === false) {
    return null;
  }

  const companyTitle = footerData?.company_title || djangoConfig.companyName || 'سوین';
  const shortDesc = footerData?.short_description || 'مرکز تخصصی پخش محصولات سیگار و تنباکو با ارسال فوری و تضمین اصالت کالا به سراسر کشور.';
  const addressText = footerData?.address_text || 'تهران، انبار مرکزی توزیع دخانیات';
  const phoneNumber = footerData?.phone_number || djangoConfig.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹';
  const emergencyPhone = footerData?.emergency_phone;
  const workingHours = footerData?.working_hours;
  const copyrightText = footerData?.copyright_text || `© کلیه حقوق مادی و معنوی برای پخش عمده ${companyTitle} محفوظ است.`;
  const developerCredit = footerData?.developer_credit || 'طراحی و توسعه توسط سوین تیم و میزبانی وب سایت بر خط سرور های قدرتمند سوین هاست';

  const columns = footerData?.columns && footerData.columns.length > 0 ? footerData.columns : null;
  const socials = footerData?.socials && footerData.socials.length > 0 ? footerData.socials : null;

  const renderSocialIcon = (platform: string, iconName?: string) => {
    const p = (platform || iconName || '').toLowerCase();
    if (p.includes('tele') || p.includes('send')) return <Send className="w-4 h-4" />;
    if (p.includes('whats') || p.includes('msg') || p.includes('chat')) return <MessageSquare className="w-4 h-4" />;
    if (p.includes('insta')) return <Instagram className="w-4 h-4" />;
    if (p.includes('phone') || p.includes('call')) return <PhoneCall className="w-4 h-4" />;
    return <ExternalLink className="w-4 h-4" />;
  };

  const handleLinkClick = (url: string) => {
    if (!url) return;
    const trimmed = url.trim();

    // 1. Check for explicit protocol or protocol-relative URLs
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
      const full = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
      window.open(full, '_blank', 'noopener,noreferrer');
      return;
    }

    // 2. Check for tel: or mailto:
    if (trimmed.startsWith('tel:') || trimmed.startsWith('mailto:')) {
      window.location.href = trimmed;
      return;
    }

    // 3. Check for external domain patterns (e.g., sevinhost.ir, www.google.com, t.me/..., instagram.com/...)
    const isLikelyExternal = 
      trimmed.startsWith('www.') || 
      /^[a-zA-Z0-9-]+\.(ir|com|org|net|io|app|co|me|xyz|biz|info)(\/.*)?$/i.test(trimmed) ||
      trimmed.includes('t.me/') ||
      trimmed.includes('instagram.com/') ||
      trimmed.includes('telegram.me/');

    if (isLikelyExternal) {
      window.open(`https://${trimmed}`, '_blank', 'noopener,noreferrer');
      return;
    }

    // 4. Internal Tab navigation
    const cleaned = trimmed.replace(/^\//, '').trim().toLowerCase();
    if (cleaned === 'catalog' || cleaned === '') onNavigateTab('catalog');
    else if (cleaned === 'invoice' || cleaned === 'pishfactor') onNavigateTab('invoice');
    else if (cleaned === 'tracking' || cleaned === 'rahgiri') onNavigateTab('tracking');
    else if (cleaned === 'contact' || cleaned === 'contact-us' || cleaned === 'tamas') onNavigateTab('contact');
    else if (cleaned === 'shipping' || cleaned === 'barbari') onNavigateTab('shipping');
    else if (cleaned === 'blog' || cleaned === 'maghalat') onNavigateTab('blog');
    else if (cleaned === 'live-prices' || cleaned === 'gheymat') onNavigateTab('live-prices');
    else if (cleaned === 'shopmanage' || cleaned === 'pos' || cleaned === 'sandogh' || cleaned.startsWith('shopmanage/')) onNavigateTab('accounting-pos');
    else if (cleaned === 'azarakhsh' || cleaned === 'django-docs' || cleaned === 'api-docs') onNavigateTab('django-docs');
    else if (cleaned === 'user-panel' || cleaned === 'profile' || cleaned === 'login' || cleaned === 'hesab') onNavigateTab('user-panel');
    else if (cleaned === 'django-crm') onNavigateTab('django-crm');
    else {
      // Fallback: If it starts with / treat as router path, else open as https external
      if (trimmed.startsWith('/')) {
        onNavigateTab('catalog');
      } else {
        window.open(`https://${trimmed}`, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-10 pb-8 text-xs text-slate-500 transition-colors shadow-sm" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        
        {/* Main Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
          
          {/* Brand & Warehouse Info */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/20 shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {companyTitle}
                </h3>
                <span className="text-[11px] text-blue-600 font-bold">سامانه رسمی توزیع و پخش عمده دخانیات</span>
              </div>
            </div>

            {shortDesc && (
              <p className="text-xs text-slate-500 leading-relaxed text-justify">
                {shortDesc}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2 text-xs">
              {addressText && (
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{addressText}</span>
                </div>
              )}
              {phoneNumber && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تلفن سفارشات و هماهنگی بار:</span>
                  <strong className="text-slate-900 font-black tracking-wide" dir="ltr">{phoneNumber}</strong>
                </div>
              )}
              {emergencyPhone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <PhoneCall className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>تلفن فوری انبار:</span>
                  <strong className="text-slate-900 font-black tracking-wide" dir="ltr">{emergencyPhone}</strong>
                </div>
              )}
              {workingHours && (
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{workingHours}</span>
                </div>
              )}
              {Boolean(footerData?.shipping_companies || footerData?.barbari_text) && (
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>باربری‌ها: {footerData?.shipping_companies || footerData?.barbari_text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Columns or Default Quick Navigation */}
          {columns && columns.filter(c => c && c.links && c.links.length > 0).length > 0 ? (
            <div className={`md:col-span-7 grid ${columns.filter(c => c && c.links && c.links.length > 0).length === 1 ? 'grid-cols-1 sm:grid-cols-2' : columns.filter(c => c && c.links && c.links.length > 0).length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} gap-6`}>
              {columns.filter(c => c && c.links && c.links.length > 0).map((col, idx) => (
                <div key={col.id || idx} className="flex flex-col gap-3">
                  <h4 className="font-black text-slate-900 text-xs border-r-2 border-blue-600 pr-2">
                    {col.title}
                  </h4>
                  <ul className="flex flex-col gap-2 text-xs">
                    {col.links && col.links.map((link, lIdx) => (
                      <li key={link.id || lIdx}>
                        <button
                          onClick={() => handleLinkClick(link.url)}
                          className="hover:text-blue-600 transition-colors text-right cursor-pointer text-slate-600 font-medium hover:translate-x-1 duration-150 flex items-center gap-1.5"
                        >
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          {link.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
              {/* Quick Navigation Col 1 */}
              <div className="flex flex-col gap-3">
                <h4 className="font-black text-slate-900 text-xs border-r-2 border-blue-600 pr-2">
                  دسترسی سریع
                </h4>
                <ul className="flex flex-col gap-2 text-xs text-slate-600">
                  <li>
                    <button onClick={() => onNavigateTab('catalog')} className="hover:text-blue-600 transition-colors cursor-pointer">
                      کاتالوگ کامل کالاها
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onNavigateTab('invoice')} className="hover:text-blue-600 transition-colors cursor-pointer">
                      صدور پیش‌فاکتور رسمی
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onNavigateTab('accounting-pos')} className="hover:text-blue-600 transition-colors cursor-pointer">
                      صندوق و حسابداری POS
                    </button>
                  </li>
                </ul>
              </div>

              {/* Quick Navigation Col 2 */}
              <div className="flex flex-col gap-3">
                <h4 className="font-black text-slate-900 text-xs border-r-2 border-blue-600 pr-2">
                  خدمات و پشتیبانی
                </h4>
                <ul className="flex flex-col gap-2 text-xs text-slate-600">
                  <li>
                    <button onClick={() => onNavigateTab('tracking')} className="hover:text-blue-600 transition-colors cursor-pointer">
                      پیگیری بارنامه و ارسال
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onNavigateTab('shipping')} className="hover:text-blue-600 transition-colors cursor-pointer">
                      استعلام کرایه باربری
                    </button>
                  </li>
                  <li>
                    <button onClick={() => onNavigateTab('contact')} className="hover:text-blue-600 transition-colors cursor-pointer">
                      فرم تماس با مدیریت
                    </button>
                  </li>
                </ul>
              </div>

              {/* Col 3: Enamad / Security / Socials */}
              <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
                <h4 className="font-black text-slate-900 text-xs border-r-2 border-blue-600 pr-2">
                  ضمانت و اصالت کالا
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-[11px]">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>تضمین سلامت و اصالت بار</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    کلیه کارتن‌ها و باکس‌ها با بسته‌بندی پلمپ و هولوگرام رسمی تحویل باربری داده می‌شوند.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Socials & Channels (if configured) */}
        {socials && socials.length > 0 && (
          <div className="py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-700">شبکه‌های اجتماعی و کانال‌های اطلاع‌رسانی:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {socials.map((soc, sIdx) => (
                <a
                  key={soc.id || sIdx}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all border border-slate-200"
                >
                  {renderSocialIcon(soc.platform, soc.icon)}
                  <span>{soc.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Copyright and Credit Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-semibold text-center sm:text-right">
          <div>
            {developerCredit}
          </div>
          <div className="text-[10px] text-slate-400/90 font-medium">
            {copyrightText}
          </div>
        </div>

      </div>
    </footer>
  );
};
