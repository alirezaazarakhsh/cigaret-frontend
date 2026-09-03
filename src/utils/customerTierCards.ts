import { CustomerTierConfig, CustomerTierId } from '../types';

export const CUSTOMER_TIERS_CONFIG: Record<CustomerTierId, CustomerTierConfig> = {
  bronze: {
    id: 'bronze',
    nameFa: 'کارت برنز (مشتری عادی و فروشگاه خرد)',
    badgeTitle: 'BRONZE MEMBER',
    cardTitle: 'مشتری رده پایه',
    themeColor: '#78350f',
    cardGradient: 'from-stone-900 via-stone-800 to-amber-950',
    cardBorder: 'border-amber-800/60',
    badgeBg: 'bg-amber-900/60',
    badgeText: 'text-amber-300 border-amber-700/50',
    textColor: 'text-amber-100',
    accentColor: 'text-amber-400',
    discountRate: 0.5,
    defaultCreditLimit: 15000000,
    description: 'سطح آغازین، امکان ثبت فاکتور نسیه تا ۱۵ میلیون تومان با بارکد اختصاصی'
  },
  silver: {
    id: 'silver',
    nameFa: 'کارت نقره‌ای (سوپرمارکت و هایپرمارکت)',
    badgeTitle: 'SILVER PARTNER',
    cardTitle: 'فروشگاه / سوپرمارکت نقره‌ای',
    themeColor: '#0284c7',
    cardGradient: 'from-slate-950 via-slate-900 to-sky-950',
    cardBorder: 'border-sky-400/60',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-300 border-sky-400/40',
    textColor: 'text-sky-100',
    accentColor: 'text-sky-300',
    discountRate: 1.5,
    defaultCreditLimit: 40000000,
    description: 'ویژه سوپرمارکت‌ها، سقف اعتبار ۴۰ میلیون، اولویت در باجه اکسپرس انبار'
  },
  gold: {
    id: 'gold',
    nameFa: 'کارت طلایی (عمده‌فروش VIP)',
    badgeTitle: 'GOLD VIP',
    cardTitle: 'عمده‌فروش طلایی ممتاز',
    themeColor: '#d97706',
    cardGradient: 'from-amber-950 via-amber-900 to-yellow-950',
    cardBorder: 'border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    badgeBg: 'bg-amber-400/25',
    badgeText: 'text-amber-300 border-amber-300/60',
    textColor: 'text-amber-50',
    accentColor: 'text-amber-300',
    discountRate: 2.5,
    defaultCreditLimit: 80000000,
    description: 'تخفیف ویژه کارتن، سقف اعتبار ۸۰ میلیون، بارگیری فوق‌سریع و تحویل درب انبار'
  },
  platinum: {
    id: 'platinum',
    nameFa: 'کارت پلاتینیوم (بنکدار منطقه‌ای)',
    badgeTitle: 'PLATINUM ELITE',
    cardTitle: 'بنکدار پلاتینیوم تراز اول',
    themeColor: '#9333ea',
    cardGradient: 'from-purple-950 via-indigo-950 to-slate-950',
    cardBorder: 'border-purple-400/70 shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    badgeBg: 'bg-purple-500/25',
    badgeText: 'text-purple-300 border-purple-400/50',
    textColor: 'text-purple-100',
    accentColor: 'text-purple-300',
    discountRate: 3.5,
    defaultCreditLimit: 150000000,
    description: 'سهمیه کارتن‌های کمیاب و تیریا، سقف اعتبار ۱۵۰ میلیون تومان، خط مستقیم ترابری'
  },
  diamond_black: {
    id: 'diamond_black',
    nameFa: 'بلک کارت الماس (شریک تجاری VIP انحصاری)',
    badgeTitle: 'BLACK DIAMOND VIP',
    cardTitle: 'بلک کارت انحصاری دخانیات سرو',
    themeColor: '#eab308',
    cardGradient: 'from-black via-zinc-950 to-neutral-900',
    cardBorder: 'border-amber-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] ring-1 ring-amber-400/50',
    badgeBg: 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30',
    badgeText: 'text-amber-200 border-amber-400/70 font-black',
    textColor: 'text-amber-100',
    accentColor: 'text-amber-400',
    discountRate: 5.0,
    defaultCreditLimit: 300000000,
    description: 'بالاترین سطح اعتبار انحصاری، سقف اعتبار ۳۰۰ میلیون تومان، اختصاص مستقیم لاین بارگیری اختصاصی'
  }
};

export function getCustomerTier(tierId?: CustomerTierId): CustomerTierConfig {
  if (tierId && CUSTOMER_TIERS_CONFIG[tierId]) {
    return CUSTOMER_TIERS_CONFIG[tierId];
  }
  return CUSTOMER_TIERS_CONFIG.silver; // Default fallback
}
