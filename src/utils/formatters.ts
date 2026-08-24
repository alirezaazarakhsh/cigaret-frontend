export function formatToman(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
}

export function formatNumberFa(val: number): string {
  return new Intl.NumberFormat('fa-IR').format(val);
}

export function calculateItemSubtotal(
  cartonPrice: number,
  boxPrice: number,
  unit: 'box' | 'carton',
  quantity: number
): number {
  if (unit === 'carton') {
    return cartonPrice * quantity;
  }
  return boxPrice * quantity;
}

export function getApplicableDiscount(
  unit: 'box' | 'carton',
  quantity: number,
  tierDiscounts: { minCartons: number; discountPercentage: number }[]
): number {
  if (unit !== 'carton' || !tierDiscounts || tierDiscounts.length === 0) {
    return 0;
  }

  // Sort descending by minCartons
  const sorted = [...tierDiscounts].sort((a, b) => b.minCartons - a.minCartons);
  for (const tier of sorted) {
    if (quantity >= tier.minCartons) {
      return tier.discountPercentage;
    }
  }
  return 0;
}
