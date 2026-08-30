import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  Truck, 
  ShieldCheck, 
  PhoneCall, 
  MessageSquare,
  FileText,
  AlertCircle,
  ExternalLink,
  Instagram,
  SendHorizontal
} from 'lucide-react';
import { FooterSettingsData, DjangoCrmConfig } from '../types';

interface ContactAndSupportProps {
  showToast: (msg: string) => void;
  onOpenUserPanel?: () => void;
  footerData?: FooterSettingsData | null;
  djangoConfig?: DjangoCrmConfig;
}

export const ContactAndSupport: React.FC<ContactAndSupportProps> = ({
  showToast,
  onOpenUserPanel,
  footerData,
  djangoConfig,
}) => {
  const companyTitle = footerData?.company_title || djangoConfig?.companyName || 'سوین';
  const phoneNumber = footerData?.phone_number || djangoConfig?.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹';
  const emergencyPhone = footerData?.emergency_phone || '۰۹۳۵۱۱۱۲۲۳۳';
  const addressText = footerData?.address_text || 'تهران، منطقه ۵، بزرگراه شهید آبشناسان، جنت‌آباد (انبار مرکزی پخش دخانیات سوین)';
  const workingHours = footerData?.working_hours || 'شنبه تا چهارشنبه: ۸:۰۰ الی ۱۸:۰۰ | پنجشنبه‌ها: ۸:۰۰ الی ۱۴:۰۰';
  const companyDesc = footerData?.description_text || 'مرکز دپو، پلمپ و بارگیری مستقیم انواع سیگار اورجینال، تنباکو و تجهیزات IQOS در سراسر کشور.';

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    businessName: '',
    subject: 'استعلام قیمت و خرید عمده',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.message) {
      showToast('لطفاً فیلدهای الزامی را تکمیل فرمایید.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast(`پیام شما با موفقیت ثبت شد. کارشناسان فروش ${companyTitle} به زودی با شما تماس خواهند گرفت.`);
      setFormData({
        fullName: '',
        phone: '',
        businessName: '',
        subject: 'استعلام قیمت و خرید عمده',
        message: '',
      });
    }, 900);
  };

  return (
    <section className="py-8 px-4 sm:px-6 max-w-[1600px] w-full mx-auto" id="contact-section">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                مرکز تماس و ارتباط با واحد فروش {companyTitle}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                انبار مرکزی و دفتر فروش
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              تماس با سامانه پخش عمده {companyTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {companyDesc}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${cleanPhone || '09120759419'}`}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>تماس مستقیم: {phoneNumber}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Direct Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">فرم ارسال پیام و درخواست بنکداری</h2>
              <p className="text-xs text-slate-500 mt-0.5">پاسخگویی در کمتر از ۳۰ دقیقه کاری</p>
            </div>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center text-emerald-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-black">پیام شما با موفقیت ثبت شد</h3>
              <p className="text-xs leading-relaxed max-w-md mx-auto">
                همکاران ما در واحد فروش و ترابری درخواست شما را بررسی نموده و با شماره ثبت شده تماس حاصل خواهند نمود.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-2 text-xs font-bold text-emerald-700 bg-white border border-emerald-300 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                ارسال پیام دیگر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام و نام خانوادگی <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: علی رضایی"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شماره همراه بنکدار <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    required
                    placeholder={cleanPhone || '09120759419'}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام فروشگاه / بنکداری / شهر:
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: دخانیات میلاد - اصفهان"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    موضوع درخواست:
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="استعلام قیمت و خرید عمده">استعلام قیمت و خرید عمده (کارتن / تیراژ)</option>
                    <option value="هماهنگی تحویل حضوری انبار">هماهنگی تحویل حضوری در انبار</option>
                    <option value="پیگیری بیجک و بارنامه باربری">پیگیری بیجک و بارنامه باربری (وطن، جهانگیر)</option>
                    <option value="تأیید فیش واریزی و صدور فاکتور">تأیید فیش واریزی و صدور فاکتور رسمی</option>
                    <option value="پیشنهاد همکاری و تأمین کالا">پیشنهاد همکاری و تأمین کالا</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  متن پیام یا لیست اقلام مورد نظر <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="لطفاً مارک، تعداد کارتن یا درخواست خود را شرح دهید..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-xs rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>در حال ثبت پیام...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ارسال پیام به واحد فروش {companyTitle}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Warehouse Info & Contacts (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Warehouse Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">انبار مرکزی {companyTitle}</h3>
                <p className="text-xs text-slate-500">مرکز دپو، پلمپ و بارگیری سراسری</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">آدرس انبار و دفتر مرکزی:</strong>
                  <p className="text-slate-600 mt-0.5 leading-relaxed font-medium">
                    {addressText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">تلفن واحد فروش و ثبت سفارشات:</strong>
                  <p className="font-mono font-bold text-slate-900 mt-0.5 text-sm" dir="ltr">
                    <a href={`tel:${cleanPhone || '09120759419'}`} className="hover:text-blue-600 transition-colors">
                      {phoneNumber}
                    </a>
                  </p>
                </div>
              </div>

              {emergencyPhone && (
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="text-slate-900">پشتیبانی ضروری و پیگیری بارنامه:</strong>
                    <p className="font-mono font-bold text-emerald-700 mt-0.5" dir="ltr">
                      <a href={`tel:${emergencyPhone.replace(/[^0-9]/g, '')}`} className="hover:underline">
                        {emergencyPhone}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">ساعات کاری و بارگیری:</strong>
                  <p className="text-slate-600 mt-0.5">
                    {workingHours}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">باربری‌های طرف قرارداد:</strong>
                  <p className="text-slate-600 mt-0.5">
                    باربری وطن، جهانگیر، پیام‌شمس، پیشتاز و ناوگان اختصاصی تهران
                  </p>
                </div>
              </div>
            </div>

            {/* Social links if configured in footerData */}
            {footerData?.social_links && footerData.social_links.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block mb-2">کانال‌ها و شبکه‌های اجتماعی:</span>
                <div className="flex flex-wrap gap-2">
                  {footerData.social_links.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url.startsWith('http') ? s.url : `https://${s.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{s.title || s.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Panel Promo Box */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-blue-800/50 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-black">پنل اختصاصی بنکداران {companyTitle}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              با شماره موبایل خود وارد شوید تا پیش‌فاکتورهای رسمی با تخفیف تیراژ برای شما صادر شده و بارنامه‌ها را به صورت آنلاین پیگیری نمایید.
            </p>
            {onOpenUserPanel && (
              <button
                type="button"
                onClick={onOpenUserPanel}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-black text-xs rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                ورود به پنل بنکداری
              </button>
            )}
          </div>

        </div>

      </div>

    </section>
  );
};
