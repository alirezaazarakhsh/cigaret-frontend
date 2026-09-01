import { WholesaleTierDiscount } from '../types';

export function formatToman(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
}

export function formatNumberFa(val: number): string {
  return new Intl.NumberFormat('fa-IR').format(val);
}

/**
 * Converts any Gregorian or ISO date string (e.g. "2026/08/30", "2026-08-30T12:00:00Z")
 * to Shamsi (Jalali) Persian date string (e.g. "۱۴۰۵/۰۶/۰۸").
 */
export function toShamsiDate(dateInput?: string | Date | null): string {
  if (!dateInput) return new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  try {
    const str = String(dateInput).trim();
    if (!str) return new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });

    // Already Shamsi (starts with 13xx, 14xx or Persian digits ۱۳xx, ۱۴xx)
    if (/^(13|14|۱۳|۱۴)/.test(str)) {
      return str;
    }

    // Replace slashes with hyphens for standard date parsing if Gregorian YYYY/MM/DD
    const isoStr = str.includes('/') && !str.includes('T') ? str.replace(/\//g, '-') : str;
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return str;
    
    return d.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return String(dateInput);
  }
}

export function getProductStockInfo(product: {
  category?: string;
  stockCartons: number;
  boxesPerCarton?: number;
  packsPerBox?: number;
}) {
  const cartons = Math.floor(product.stockCartons || 0);
  const boxesPerCarton = product.boxesPerCarton || 50;
  const packsPerBox = product.packsPerBox || 10;
  
  const totalBoxes = Math.floor(cartons * boxesPerCarton);
  const totalPacks = Math.floor(totalBoxes * packsPerBox);

  if (product.category === 'drinks_coffee') {
    return {
      cartons,
      totalBoxes,
      totalPacks,
      boxesPerCarton: 1,
      packsPerBox: 1,
      isAvailable: cartons > 0,
      textSummary: cartons > 0 ? `${formatNumberFa(cartons)} عدد` : 'ناموجود (نوشیدنی)'
    };
  }

  return {
    cartons,
    totalBoxes,
    totalPacks,
    boxesPerCarton,
    packsPerBox,
    isAvailable: cartons > 0,
    textSummary: cartons > 0
      ? `${formatNumberFa(cartons)} کارتن (${formatNumberFa(totalBoxes)} باکس)`
      : 'در انتظار شارژ انبار (ناموجود)'
  };
}

export function calculateItemSubtotal(
  cartonPrice: number,
  boxPrice: number,
  unit: 'box' | 'carton' | 'pack' | 'single' | 'kg',
  quantity: number
): number {
  if (unit === 'carton') {
    return cartonPrice * quantity;
  }
  if (unit === 'box') {
    return boxPrice * quantity;
  }
  if (unit === 'single' || unit === 'kg') {
    return boxPrice * quantity;
  }
  return Math.round(boxPrice / 10) * quantity;
}

export function getApplicableDiscount(
  unit: 'box' | 'carton' | 'pack' | 'single' | 'kg',
  quantity: number,
  tierDiscounts: WholesaleTierDiscount[]
): number {
  if (unit !== 'carton' || !tierDiscounts || tierDiscounts.length === 0) {
    return 0;
  }

  const sorted = [...tierDiscounts].sort((a, b) => (b.minCartons || 0) - (a.minCartons || 0));

  for (const tier of sorted) {
    if (quantity >= (tier.minCartons || 0)) {
      return tier.discountPercentage || 0;
    }
  }

  return 0;
}
