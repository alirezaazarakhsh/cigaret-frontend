import { CigaretteProduct, LiveDollarMarket } from '../types';

export const INITIAL_DOLLAR_MARKET: LiveDollarMarket = {
  usdTehran: 92500, // نرخ دلار آزاد تهران (تومان)
  usdHerat: 91800,
  tetherUsdt: 93100,
  uaeDirham: 25200,
  baseMarketRate: 92500,
  lastUpdate: 'لحظاتی پیش',
  isAutoUpdating: true,
  changePercent24h: 1.45,
  high24h: 93400,
  low24h: 91900,
  pricingMode: 'dynamic_dollar', // پیش‌فرض متصل به دلار
};

/**
 * Calculates updated product prices based on current market dollar rate and product sensitivity.
 */
export function calculateDynamicProductPrices(
  products: CigaretteProduct[],
  currentDollarRate: number,
  baseRate: number = 92500
): CigaretteProduct[] {
  if (baseRate <= 0) return products;

  const dollarRatio = (currentDollarRate - baseRate) / baseRate;

  return products.map(p => {
    const baseCarton = p.baseCartonPrice || p.cartonPrice;
    const baseBox = p.baseBoxPrice || p.boxPrice;

    const adjustedCarton = Math.round(baseCarton * (1 + dollarRatio) / 100000) * 100000;
    const adjustedBox = Math.round(baseBox * (1 + dollarRatio) / 10000) * 10000;

    let trend: 'stable' | 'up' | 'down' = 'stable';
    if (adjustedCarton > p.cartonPrice) trend = 'up';
    else if (adjustedCarton < p.cartonPrice) trend = 'down';

    return {
      ...p,
      cartonPrice: Math.max(1000000, adjustedCarton),
      boxPrice: Math.max(100000, adjustedBox),
      priceTrend: trend,
      lastPriceUpdate: 'همگام با دلار لحظه‌ای',
    };
  });
}

// Alias for convenience across modules
export const recalculateProductPrices = calculateDynamicProductPrices;

/**
 * Simulates micro-fluctuations in the Iranian forex market (Tehran, Herat, Tether, Dirham).
 */
export function simulateMarketTick(prev: LiveDollarMarket): LiveDollarMarket {
  // Random small fluctuation between -200 and +250 Toman
  const delta = (Math.floor(Math.random() * 10) - 4) * 50; // step of 50 toman
  const newTehran = Math.max(85000, Math.min(115000, prev.usdTehran + delta));
  const newHerat = newTehran - 550 + Math.floor(Math.random() * 100);
  const newTether = newTehran + 300 + Math.floor(Math.random() * 100);
  const newDirham = Math.round(newTehran / 3.67);

  const newHigh = Math.max(prev.high24h, newTehran);
  const newLow = Math.min(prev.low24h, newTehran);
  const changePct = Number((((newTehran - prev.baseMarketRate) / prev.baseMarketRate) * 100).toFixed(2));

  const now = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return {
    ...prev,
    usdTehran: newTehran,
    usdHerat: newHerat,
    tetherUsdt: newTether,
    uaeDirham: newDirham,
    lastUpdate: now,
    high24h: newHigh,
    low24h: newLow,
    changePercent24h: changePct,
  };
}
