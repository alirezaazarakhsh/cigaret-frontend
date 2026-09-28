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
  const cartons = Math.max(0, Math.floor(Number(product.stockCartons) || 0));
  const looseBoxes = Math.max(0, Math.floor(Number(product.stockBoxes) || 0));
  const loosePacks = Math.max(0, Math.floor(Number(product.stockPacks) || 0));
  const boxesPerCarton = Number(product.boxesPerCarton) > 0 ? Number(product.boxesPerCarton) : 50;
  const packsPerBox = Number(product.packsPerBox) > 0 ? Number(product.packsPerBox) : 10;

  const hasCarton = product.hasCarton !== false && !product.isBoxOnly;
  const hasBox = product.hasBox !== false;
  const hasPack = Boolean(product.hasPack);

  const totalBoxes = hasCarton ? Math.floor(cartons * boxesPerCarton) + looseBoxes : looseBoxes;
  const displayBoxes = looseBoxes > 0 ? looseBoxes : (hasCarton ? Math.floor(cartons * boxesPerCarton) : 0);
  const totalPacks = Math.floor(totalBoxes * packsPerBox) + loosePacks;
  const displayPacks = loosePacks > 0 ? loosePacks : Math.floor(displayBoxes * packsPerBox);

  const isAvailable = product.isAvailable !== false && (cartons > 0 || looseBoxes > 0 || loosePacks > 0);

  if (product.category === 'drinks_coffee') {
    return {
      cartons,
      looseBoxes,
      displayBoxes,
      totalBoxes,
      displayPacks,
      totalPacks,
      boxesPerCarton: 1,
      packsPerBox: 1,
      isAvailable,
      textSummary: isAvailable ? `${formatNumberFa(cartons || looseBoxes)} عدد` : 'ناموجود (نوشیدنی)'
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
    boxesPerCarton,
    packsPerBox,
    isAvailable,
    textSummary,
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
