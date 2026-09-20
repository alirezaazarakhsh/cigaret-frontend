import { CigaretteProduct, CigaretteCategory } from '../../types';

export interface ProductCategoryItem {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  description?: string;
  color?: string;
}

export interface ProductHologramItem {
  id: string;
  title: string;
  issuer: string;
  country: string;
  securityLevel: 'high' | 'ultra' | 'standard' | 'basic';
  badgeColor: string;
  description: string;
}

export interface ProductFeatureItem {
  id: string;
  nameFa: string;
  nameEn: string;
  type: 'text' | 'number' | 'select' | 'badge';
  options?: string[];
  unit?: string;
  description?: string;
  createdAt?: string;
}

export interface ProductBrandItem {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  logo?: string | File;
  country?: string;
  description?: string;
}

export const INITIAL_PRODUCT_CATEGORIES: ProductCategoryItem[] = [
  { id: 'cigarettes', slug: 'cigarettes', name: 'سیگارهای اورجینال و شرکتی', nameEn: 'Cigarettes', description: 'مارلبرو، وینستون، سوبرانی، کنت، اسه و برندهای پرفروش', color: 'text-blue-600' },
  { id: 'iqos_devices', slug: 'iqos_devices', name: 'دستگاه‌های ایکاس', nameEn: 'IQOS Devices', description: 'دستگاه‌های گرم‌کننده توتون IQOS ILUMA Prime و ONE', color: 'text-purple-600' },
  { id: 'iqos_heets', slug: 'iqos_heets', name: 'استیک‌های تیریا و هیتس', nameEn: 'IQOS TEREA & Heets', description: 'استیک‌های مخصوص دستگاه‌های ایکاس در طعم‌های مختلف', color: 'text-emerald-600' },
  { id: 'pods_vapes', slug: 'pods_vapes', name: 'پاد سیستم و ویپ', nameEn: 'Pods & Vapes', description: 'دستگاه‌های پاد گیک‌ویپ، سالت نیکوتین و جویس', color: 'text-indigo-600' },
  { id: 'tobacco', slug: 'tobacco', name: 'توتون پیپ و سیگارپیچ', nameEn: 'Pipe & Rolling Tobacco', description: 'توتون‌های معطر کاپیتان بلک، گلدن ویرجینیا و مک‌بارن', color: 'text-amber-600' },
  { id: 'accessories', slug: 'accessories', name: 'ملزومات و فندک کلیپر', nameEn: 'Accessories & Lighters', description: 'انواع فندک‌های کلیپر اصلی، چخماق، گاز و اکسسوری', color: 'text-rose-600' },
  { id: 'drinks_coffee', slug: 'drinks_coffee', name: 'نوشیدنی و قهوه', nameEn: 'Drinks & Coffee', description: 'دان قهوه و سرو بار حضوری', color: 'text-amber-700' },
];

export const INITIAL_PRODUCT_HOLOGRAMS: ProductHologramItem[] = [];

export const INITIAL_PRODUCT_FEATURES: ProductFeatureItem[] = [
  { id: '1', nameFa: 'قطر نخ', nameEn: 'thread_diameter', type: 'number', unit: 'میلی‌متر', description: 'قطر نخ و مقاومت فیلتر', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: '2', nameFa: 'وزن کالا', nameEn: 'weight', type: 'number', unit: 'گرم', description: 'وزن خالص هر پاکت یا بسته', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: '3', nameFa: 'رنگ بدنه', nameEn: 'color', type: 'text', unit: '', description: 'رنگ ظاهری پاکت و فیلتر', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: '4', nameFa: 'نوع بسته‌بندی', nameEn: 'packaging', type: 'select', unit: 'بسته', options: ['صلب', 'نرم'], description: 'بسته‌بندی صلب یا نرم', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: '5', nameFa: 'کشور تولیدکننده', nameEn: 'country_origin', type: 'text', unit: '', description: 'کشور سازنده و مونتاژکننده', createdAt: '۱۴۰۵/۰۱/۰۱' },
];

export const INITIAL_PRODUCT_BRANDS: ProductBrandItem[] = [];
