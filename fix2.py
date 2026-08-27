with open("src/components/shopmanage/AccountingPosPanel.tsx", "r") as f:
    text = f.read()

text = text.replace(
    '<div>{formatToman(prod.cartonPrice)}</div>\n                              <div className="text-[10px] text-slate-400 font-normal mt-0.5">\n                                {formatToman(prod.boxPrice)} باکس / {formatToman(prod.packPrice)} پاکت\n                              </div>',
    '{prod.category === \'drinks_coffee\' ? (\n                                <div>{formatToman(prod.packPrice || prod.boxPrice || 50000)} (تکی)</div>\n                              ) : (\n                                <>\n                                  <div>{formatToman(prod.cartonPrice)}</div>\n                                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">\n                                    {formatToman(prod.boxPrice)} باکس / {formatToman(prod.packPrice)} پاکت\n                                  </div>\n                                </>\n                              )}'
)

text = text.replace(
    '<span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">\n                                  موجود ({formatNumberFa(Math.floor(stockInfo.cartons))} کارتن)\n                                </span>',
    '<span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">\n                                  {prod.category === \'drinks_coffee\' ? `موجود (${formatNumberFa(stockInfo.cartons)} عدد)` : `موجود (${formatNumberFa(Math.floor(stockInfo.cartons))} کارتن)`}\n                                </span>'
)

with open("src/components/shopmanage/AccountingPosPanel.tsx", "w") as f:
    f.write(text)
