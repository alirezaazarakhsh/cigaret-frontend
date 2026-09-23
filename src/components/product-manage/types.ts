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
  { id: 'feat-tar', nameFa: 'قطران', nameEn: 'tar', type: 'number', unit: 'mg', description: 'میزان قطران استاندارد برحسب میلی‌گرم', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: 'feat-nicotine', nameFa: 'نیکوتین', nameEn: 'nicotine', type: 'number', unit: 'mg', description: 'میزان نیکوتین استاندارد برحسب میلی‌گرم', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: 'feat-carbon-monoxide', nameFa: 'کربن مونوکسید', nameEn: 'carbon_monoxide', type: 'number', unit: 'mg', description: 'میزان کربن مونوکسید دود', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: 'feat-format', nameFa: 'سایز پاکت', nameEn: 'cigarette_size', type: 'select', unit: '', options: ['کینگ سایز (King Size)', 'اسلیم / باریک (Slims)', 'سوپر اسلیم (Super Slims)', 'نانو (Nano)', 'کامپکت (Compact)', 'کویین سایز (Queen Size)'], description: 'ابعاد و فرمت ساختاری پاکت سیگار', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: 'feat-flavor', nameFa: 'طعم اسانس', nameEn: 'flavor', type: 'select', unit: '', options: ['توتون خالص طبیعی (Original)', 'نعنایی خنک (Menthol)', 'سیب یخ (Apple Ice)', 'بلوبری کپسولی (Blueberry)', 'دابل‌پاپ کپسولی (Double Pop)', 'شکلات و وانیل'], description: 'طعم و اسانس معطر برگ توتون و فیلتر', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: 'feat-filter', nameFa: 'نوع فیلتر', nameEn: 'filter_type', type: 'select', unit: '', options: ['فیلتر کربن فعال (Active Charcoal)', 'فیلتر سفید معمولی (White)', 'فیلتر کپسول‌دار (Capsule Click)', 'فیلتر سوراخ‌دار / جریان هوا (Recessed)', 'فیلتر پلاسما اکتیو'], description: 'تکنولوژی فیلتراسیون تصفیه دود', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: 'feat-origin', nameFa: 'کشور تولید کننده', nameEn: 'country_origin', type: 'text', unit: '', description: 'کشور سازنده و مبدأ تولید', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: 'feat-boxes-carton', nameFa: 'تعداد در هر کارتن', nameEn: 'boxes_per_carton', type: 'number', unit: 'باکس', description: 'تعداد باکس موجود در یک کارتن مادر', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: 'feat-moisture', nameFa: 'درصد رطوبت', nameEn: 'moisture_percentage', type: 'number', unit: 'درصد', description: 'درصد رطوبت حفظ تازگی توتون', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: 'feat-weight', nameFa: 'وزن کالا', nameEn: 'weight', type: 'number', unit: 'گرم', description: 'وزن خالص هر پاکت یا بسته', createdAt: '۱۴۰۵/۰۱/۰۱' },
  { id: 'feat-thread-dia', nameFa: 'قطر نخ', nameEn: 'thread_diameter', type: 'number', unit: 'میلی‌متر', description: 'قطر نخ و مقاومت فیلتر', createdAt: '۱۴۰۵/۰۱/۰۱' },
];

export const INITIAL_PRODUCT_BRANDS: ProductBrandItem[] = [];
