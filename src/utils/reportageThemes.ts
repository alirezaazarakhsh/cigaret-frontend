export interface ReportageThemeConfig {
  id: string;
  name: string;
  gradientBg: string;
  ringClass: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  titleColor: string;
  descColor: string;
  btnBg: string;
  btnHover: string;
  btnShadow: string;
  accentIconColor: string;
  glowColor: string;
}

export const REPORTAGE_THEMES: Record<string, ReportageThemeConfig> = {
  purple: {
    id: 'purple',
    name: 'ارغوانی رویال (پیش‌فرض)',
    gradientBg: 'bg-gradient-to-r from-purple-100/90 via-indigo-50/70 to-purple-100/90',
    ringClass: 'ring-4 ring-purple-400/60 ring-offset-2 ring-offset-purple-50',
    borderColor: 'border-purple-300',
    badgeBg: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    badgeText: 'text-white',
    titleColor: 'text-purple-950',
    descColor: 'text-purple-900',
    btnBg: 'bg-purple-600',
    btnHover: 'hover:bg-purple-700',
    btnShadow: 'shadow-purple-500/25',
    accentIconColor: 'text-purple-600',
    glowColor: 'rgba(147, 51, 234, 0.15)'
  },
  gold: {
    id: 'gold',
    name: 'طلایی و کهربایی VIP',
    gradientBg: 'bg-gradient-to-r from-amber-100/90 via-yellow-50/70 to-amber-100/90',
    ringClass: 'ring-4 ring-amber-400/80 ring-offset-2 ring-offset-amber-50',
    borderColor: 'border-amber-300',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-600',
    badgeText: 'text-slate-950',
    titleColor: 'text-amber-950',
    descColor: 'text-amber-900',
    btnBg: 'bg-amber-500',
    btnHover: 'hover:bg-amber-600',
    btnShadow: 'shadow-amber-500/30',
    accentIconColor: 'text-amber-600',
    glowColor: 'rgba(245, 158, 11, 0.2)'
  },
  emerald: {
    id: 'emerald',
    name: 'سبز زمردی و نئون',
    gradientBg: 'bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90',
    ringClass: 'ring-4 ring-emerald-400/70 ring-offset-2 ring-offset-emerald-50',
    borderColor: 'border-emerald-300',
    badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    badgeText: 'text-white',
    titleColor: 'text-emerald-950',
    descColor: 'text-emerald-900',
    btnBg: 'bg-emerald-600',
    btnHover: 'hover:bg-emerald-700',
    btnShadow: 'shadow-emerald-500/25',
    accentIconColor: 'text-emerald-600',
    glowColor: 'rgba(16, 185, 129, 0.15)'
  },
  blue: {
    id: 'blue',
    name: 'لاجوردی و اقیانوسی',
    gradientBg: 'bg-gradient-to-r from-blue-100/90 via-sky-50/70 to-blue-100/90',
    ringClass: 'ring-4 ring-blue-400/70 ring-offset-2 ring-offset-blue-50',
    borderColor: 'border-blue-300',
    badgeBg: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    badgeText: 'text-white',
    titleColor: 'text-blue-950',
    descColor: 'text-blue-900',
    btnBg: 'bg-blue-600',
    btnHover: 'hover:bg-blue-700',
    btnShadow: 'shadow-blue-500/25',
    accentIconColor: 'text-blue-600',
    glowColor: 'rgba(37, 99, 235, 0.15)'
  },
  rose: {
    id: 'rose',
    name: 'یاقوتی و روبی جذاب',
    gradientBg: 'bg-gradient-to-r from-rose-100/90 via-pink-50/70 to-rose-100/90',
    ringClass: 'ring-4 ring-rose-400/70 ring-offset-2 ring-offset-rose-50',
    borderColor: 'border-rose-300',
    badgeBg: 'bg-gradient-to-r from-rose-600 to-pink-600',
    badgeText: 'text-white',
    titleColor: 'text-rose-950',
    descColor: 'text-rose-900',
    btnBg: 'bg-rose-600',
    btnHover: 'hover:bg-rose-700',
    btnShadow: 'shadow-rose-500/25',
    accentIconColor: 'text-rose-600',
    glowColor: 'rgba(225, 29, 72, 0.15)'
  },
  dark: {
    id: 'dark',
    name: 'مشکی تیتانیوم و لوکس',
    gradientBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900',
    ringClass: 'ring-4 ring-amber-400/60 ring-offset-2 ring-offset-slate-900',
    borderColor: 'border-amber-400/40',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    badgeText: 'text-slate-950',
    titleColor: 'text-white',
    descColor: 'text-slate-300',
    btnBg: 'bg-amber-500',
    btnHover: 'hover:bg-amber-400',
    btnShadow: 'shadow-amber-500/20',
    accentIconColor: 'text-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.15)'
  }
};

export function getReportageTheme(themeKey?: string, customBg?: string, customRing?: string): ReportageThemeConfig {
  const key = (themeKey || customBg || 'purple').toLowerCase();
  
  if (REPORTAGE_THEMES[key]) {
    return REPORTAGE_THEMES[key];
  }

  // Check matching prefixes
  if (key.includes('gold') || key.includes('amber') || key.includes('yellow')) return REPORTAGE_THEMES.gold;
  if (key.includes('emerald') || key.includes('green') || key.includes('teal')) return REPORTAGE_THEMES.emerald;
  if (key.includes('blue') || key.includes('sky') || key.includes('cyan')) return REPORTAGE_THEMES.blue;
  if (key.includes('rose') || key.includes('red') || key.includes('pink')) return REPORTAGE_THEMES.rose;
  if (key.includes('dark') || key.includes('slate') || key.includes('black')) return REPORTAGE_THEMES.dark;

  return REPORTAGE_THEMES.purple;
}
