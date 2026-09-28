import { WholesaleTierDiscount } from '../types';

export function formatToman(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(Number(amount) || 0)) + ' تومان';
}

export function formatNumberFa(val: number): string {
  return new Intl.NumberFormat('fa-IR').format(Number(val) || 0);
}

export function formatTomanInWords(amount: number): string {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  if (num === 0) return '۰ تومان';
  const billions = Math.floor(num / 1_000_000_000);
  const millions = Math.floor((num % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((num % 1_000_000) / 1_000);
  const parts: string[] = [];
  if (billions > 0) parts.push(`${formatNumberFa(billions)} میلیارد`);
  if (millions > 0) parts.push(`${formatNumberFa(millions)} میلیون`);
  if (thousands > 0 && billions === 0) parts.push(`${formatNumberFa(thousands)} هزار`);
  if (parts.length === 0) return `${formatNumberFa(num)} تومان`;
  return `${parts.join(' و ')} تومان`;
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
  stockBoxes?: number;
  stockPacks?: number;
  boxesPerCarton?: number;
  packsPerBox?: number;
  isAvailable?: boolean;
  hasCarton?: boolean;
  hasBox?: boolean;
  hasPack?: boolean;
  isBoxOnly?: boolean;
}) {
  const rawCartons = Math.max(0, Number(product.stockCartons) || 0);
  const cartons = Math.floor(rawCartons);
  const rawStockBoxes = Math.max(0, Math.floor(Number(product.stockBoxes) || 0));
  const rawStockPacks = Math.max(0, Math.floor(Number(product.stockPacks) || 0));
  const boxesPerCarton = Number(product.boxesPerCarton) > 0 ? Number(product.boxesPerCarton) : 50;
  const packsPerBox = Number(product.packsPerBox) > 0 ? Number(product.packsPerBox) : 10;

  const hasCarton = product.hasCarton !== false && !product.isBoxOnly;
  const hasBox = product.hasBox !== false;
  const hasPack = Boolean(product.hasPack);

  // When product has cartons (> 0), totalBoxes is strictly derived from rawCartons * boxesPerCarton
  // (e.g. 10 cartons * 50 = 500 boxes, 11 cartons * 50 = 550 boxes).
  const totalBoxes = hasCarton && rawCartons > 0
    ? Math.round(rawCartons * boxesPerCarton)
    : rawStockBoxes;
  const displayBoxes = totalBoxes;
  const totalPacks = totalBoxes > 0
    ? Math.round(totalBoxes * packsPerBox)
    : rawStockPacks;
  const displayPacks = totalPacks;
  const looseBoxes = Math.max(0, totalBoxes - (cartons * boxesPerCarton));

  const isAvailable = product.isAvailable !== false && (rawCartons > 0 || totalBoxes > 0 || totalPacks > 0);

  if (product.category === 'drinks_coffee') {
    const drinkSummary = isAvailable ? `${formatNumberFa(cartons || totalBoxes)} عدد` : 'ناموجود (نوشیدنی)';
    return {
      cartons,
      looseBoxes,
      displayBoxes,
      totalBoxes,
      displayPacks,
      totalPacks,
      packs: totalPacks,
      boxesPerCarton: 1,
      packsPerBox: 1,
      isAvailable,
      isOutOfStock: !isAvailable,
      textSummary: drinkSummary,
      displayText: drinkSummary,
    };
  }

  const summaryParts: string[] = [];
  if (hasCarton && cartons > 0) {
    summaryParts.push(`${formatNumberFa(cartons)} کارتن`);
  }
  if (hasBox && displayBoxes > 0) {
    summaryParts.push(`${formatNumberFa(displayBoxes)} باکس`);
  }
  if (hasPack && displayPacks > 0) {
    summaryParts.push(`${formatNumberFa(displayPacks)} پاکت`);
  }

  const textSummary = isAvailable
    ? (summaryParts.length > 0 ? summaryParts.join(' | ') : `${formatNumberFa(cartons)} کارتن`)
    : 'در انتظار شارژ انبار (ناموجود)';

  return {
    cartons,
    looseBoxes,
    displayBoxes,
    totalBoxes,
    displayPacks,
    totalPacks,
    packs: totalPacks,
    boxesPerCarton,
    packsPerBox,
    isAvailable,
    isOutOfStock: !isAvailable,
    textSummary,
    displayText: textSummary,
  };
}

export function calculateItemSubtotal(
  cartonPrice: number,
  boxPrice: number,
  unit: 'box' | 'carton' | 'pack' | 'single' | 'kg',
  quantity: number,
  packPrice?: number
): number {
  if (unit === 'carton') {
    return cartonPrice * quantity;
  }
  if (unit === 'box') {
    return boxPrice * quantity;
  }
  if (unit === 'pack') {
    const effectivePackPrice = packPrice && packPrice > 0 ? packPrice : Math.round(boxPrice / 10);
    return effectivePackPrice * quantity;
  }
  if (unit === 'single' || unit === 'kg') {
    return (packPrice && packPrice > 0 ? packPrice : boxPrice) * quantity;
  }
  return Math.round(boxPrice / 10) * quantity;
}

export function getApplicableDiscount(
  unit: 'box' | 'carton' | 'pack' | 'single' | 'kg',
  quantity: number,
  tierDiscounts: WholesaleTierDiscount[]
): number {
  if (!tierDiscounts || tierDiscounts.length === 0 || quantity <= 0) {
    return 0;
  }

  // Filter tiers matching the unit ('carton' vs 'box' vs 'pack')
  const matchedTiers = tierDiscounts.filter((tier) => {
    if (unit === 'carton') {
      return tier.unit === 'carton' || (!tier.unit && (tier.minCartons !== undefined || (!tier.label?.includes('باکس') && !tier.label?.includes('پاکت'))));
    }
    if (unit === 'box') {
      return tier.unit === 'box' || (!tier.unit && tier.label?.includes('باکس'));
    }
    if (unit === 'pack') {
      return (tier.unit as string) === 'pack' || (!tier.unit && tier.label?.includes('پاکت'));
    }
    return false;
  });

  if (matchedTiers.length === 0) {
    return 0;
  }

  // Sort descending by required minimum quantity
  const sorted = [...matchedTiers].sort((a, b) => {
    const minA = a.minQuantity ?? a.minCartons ?? 0;
    const minB = b.minQuantity ?? b.minCartons ?? 0;
    return minB - minA;
  });

  for (const tier of sorted) {
    const minRequired = tier.minQuantity ?? tier.minCartons ?? 0;
    if (minRequired > 0 && quantity >= minRequired) {
      return tier.discountPercentage ?? tier.discountPercent ?? 0;
    }
  }

  return 0;
}
