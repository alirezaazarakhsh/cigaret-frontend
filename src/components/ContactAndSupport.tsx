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
  AlertCircle
} from 'lucide-react';

interface ContactAndSupportProps {
  showToast: (msg: string) => void;
  onOpenUserPanel?: () => void;
}

export const ContactAndSupport: React.FC<ContactAndSupportProps> = ({
  showToast,
  onOpenUserPanel,
}) => {
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
      showToast('پیام شما با موفقیت ثبت شد. کارشناسان فروش جنت‌آباد به زودی با شما تماس خواهند گرفت.');
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
    <section className="py-8 px-4 max-w-7xl mx-auto" id="contact-section">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                مرکز تماس و ارتباط با واحد فروش سوین
              </span>
              <span className="text-xs text-slate-500">
                انبار مرکزی جنت‌آباد، تهران
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              تماس با سامانه پخش عمده دخانیات سوین
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              جهت استعلام موجودی تیراژ بالا، هماهنگی بارگیری مستقیم از انبار جنت‌آباد، استعلام بارنامه و قراردادهای تأمین بنکداری با ما در ارتباط باشید.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:09120759419"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>تماس مستقیم: ۰۹۱۲۰۷۵۹۴۱۹</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Direct Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">فرم ارسال پیام و درخواست بنکداری</h2>
              <p className="text-xs text-slate-500 mt-0.5">پاسخگویی در کمتر از ۳۰ دقیقه کاری</p>
            </div>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center text-emerald-800 dark:text-emerald-300 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-black">پیام شما با موفقیت ثبت شد</h3>
              <p className="text-xs leading-relaxed max-w-md mx-auto">
                همکاران ما در واحد فروش و ترابری انبار مرکزی جنت‌آباد درخواست شما را بررسی نموده و با شماره ثبت شده تماس حاصل خواهند نمود.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                ارسال پیام دیگر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام و نام خانوادگی <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: علی رضایی"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شماره همراه بنکدار <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    required
                    placeholder="09120759419"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام فروشگاه / بنکداری / شهر:
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: دخانیات میلاد - اصفهان"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    موضوع درخواست:
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="استعلام قیمت و خرید عمده">استعلام قیمت و خرید عمده (کارتن / تیراژ)</option>
                    <option value="هماهنگی تحویل حضوری انبار جنت‌آباد">هماهنگی تحویل حضوری در انبار جنت‌آباد</option>
                    <option value="پیگیری بیجک و بارنامه باربری">پیگیری بیجک و بارنامه باربری (وطن، جهانگیر)</option>
                    <option value="تأیید فیش واریزی و صدور فاکتور">تأیید فیش واریزی و صدور فاکتور رسمی</option>
                    <option value="پیشنهاد همکاری و تأمین کالا">پیشنهاد همکاری و تأمین کالا</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  متن پیام یا لیست اقلام مورد نظر <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="لطفاً مارک، تعداد کارتن یا درخواست خود را شرح دهید..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-xs rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>در حال ثبت پیام...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ارسال پیام به واحد فروش</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Warehouse Info & Contacts (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Warehouse Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">انبار مرکزی سوین (تهران)</h3>
                <p className="text-xs text-slate-500">مرکز دپو، پلمپ و بارگیری سراسری</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>آدرس انبار:</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    تهران، منطقه ۵، بزرگراه شهید آبشناسان، جنت‌آباد (انبار مرکزی پخش دخانیات سوین)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <strong>تلفن واحد فروش و ثبت سفارشات:</strong>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5" dir="ltr">
                    0912 075 9419
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong>ساعات کاری و بارگیری:</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    شنبه تا چهارشنبه: ۸:۰۰ الی ۱۸:۰۰ | پنجشنبه‌ها: ۸:۰۰ الی ۱۴:۰۰
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong>باربری‌های طرف قرارداد:</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    باربری وطن، جهانگیر، پیام‌شمس و ناوگان اختصاصی تهران
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Panel Promo Box */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-blue-800/50 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-black">پنل اختصاصی بنکداران سوین</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              با شماره موبایل خود وارد شوید تا پیش‌فاکتورهای رسمی با تخفیف تیراژ برای شما صادر شده و بارنامه‌ها را به صورت آنلاین پیگیری نمایید.
            </p>
            {onOpenUserPanel && (
              <button
                type="button"
                onClick={onOpenUserPanel}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-black text-xs rounded-xl transition-colors shadow-xs"
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
