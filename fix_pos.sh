sed -i 's/موجودی فعلی: {formatNumberFa(selectedProductForAdjustment.stockCartons)} کارتن ({formatNumberFa(selectedProductForAdjustment.stockCartons \* (selectedProductForAdjustment.boxesPerCarton || 50))} باکس)/موجودی فعلی: {selectedProductForAdjustment.category === '"'drinks_coffee'"' ? formatNumberFa(selectedProductForAdjustment.stockCartons) + '"' عدد'"' : formatNumberFa(selectedProductForAdjustment.stockCartons) + '"' کارتن ('"' + formatNumberFa(selectedProductForAdjustment.stockCartons * (selectedProductForAdjustment.boxesPerCarton || 50)) + '"' باکس)'"'}/g' src/components/shopmanage/AccountingPosPanel.tsx

sed -i 's/<td className="p-3 text-center">/<td className="p-3 text-center">\n                              {prod.category !== '"'drinks_coffee'"' \&\& (/g' src/components/shopmanage/AccountingPosPanel.tsx

sed -i 's/<td className="p-3">/<td className="p-3">/g' src/components/shopmanage/AccountingPosPanel.tsx
