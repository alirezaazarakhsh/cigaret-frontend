sed -i 's/export function getProductStockInfo(product: {/export function getProductStockInfo(product: {\n  category?: string;/g' src/utils/formatters.ts
