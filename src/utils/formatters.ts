import { WholesaleTierDiscount } from '../types';

export function formatToman(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
}

export function formatNumberFa(val: number): string {
  return new Intl.NumberFormat('fa-IR').format(val);
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
  unit: 'box' | 'carton' | 'pack',
  quantity: number
): number {
  if (unit === 'carton') {
    return cartonPrice * quantity;
  }
  if (unit === 'box') {
    return boxPrice * quantity;
  }
  return Math.round(boxPrice / 10) * quantity;
}

export function getApplicableDiscount(
  unit: 'box' | 'carton' | 'pack',
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
