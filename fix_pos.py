import sys

with open('src/components/shopmanage/AccountingPosPanel.tsx', 'r') as f:
    lines = f.readlines()

start_marker = '<tbody className="divide-y divide-slate-200">'
end_marker = '</tbody>'

new_tbody = """                    <tbody className="divide-y divide-slate-200">
                      {productsList.map((prod) => {
                        const stockInfo = getProductStockInfo(prod);
                        const productTotalVal = prod.stockCartons * prod.cartonPrice;
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <img
                                src={prod.image}
                                alt={prod.nameFa}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-200"
                              />
                            </td>
                            <td className="p-3">
                              <strong className="text-slate-900 text-xs">{prod.nameFa}</strong>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500">{prod.brand} • بارکد: {prod.barcode}</span>
                                {prod.isPosOnly ? (
                                  <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.2 rounded">مخصوص حضوری</span>
                                ) : (
                                  <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.2 rounded">همگام آنلاین</span>
                                )}
                              </div>
                            </td>

                            {/* Carton Stock Stepper */}
                            <td className="p-3 text-center">
                              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdjustStock(prod, 'carton', 1)}
                                  className="w-5 h-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs flex items-center justify-center"
                                  title="افزایش ۱ کارتن"
                                >
                                  +
                                </button>
                                <span className="font-bold font-mono text-xs text-indigo-700 px-1 min-w-[24px] text-center">
                                  {formatNumberFa(Math.floor(stockInfo.cartons))}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdjustStock(prod, 'carton', -1)}
                                  className="w-5 h-5 bg-white hover:bg-rose-100 text-rose-700 rounded font-bold text-xs flex items-center justify-center border border-slate-200"
                                  title="کاهش ۱ کارتن"
                                >
                                  -
                                </button>
                              </div>
                            </td>

                            {/* Box Stock Stepper */}
                            <td className="p-3 text-center">
                              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdjustStock(prod, 'box', 1)}
                                  className="w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center justify-center"
                                  title="افزایش ۱ باکس"
                                >
                                  +
                                </button>
                                <span className="font-bold font-mono text-xs text-slate-800 px-1 min-w-[30px] text-center">
                                  {formatNumberFa(Math.floor(stockInfo.totalBoxes))}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdjustStock(prod, 'box', -1)}
                                  className="w-5 h-5 bg-white hover:bg-rose-100 text-rose-700 rounded font-bold text-xs flex items-center justify-center border border-slate-200"
                                  title="کاهش ۱ باکس"
                                >
                                  -
                                </button>
                              </div>
                            </td>

                            <td className="p-3 text-left font-mono font-bold text-slate-800">
                              <div>{formatToman(prod.cartonPrice)}</div>
                              <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                {formatToman(prod.boxPrice)} باکس / {formatToman(prod.packPrice)} پاکت
                              </div>
                            </td>
                            <td className="p-3 text-left font-mono font-black text-emerald-600">
                              {formatToman(productTotalVal)}
                            </td>
                            <td className="p-3 text-center">
                              {stockInfo.isAvailable ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                                  موجود ({formatNumberFa(Math.floor(stockInfo.cartons))} کارتن)
                                </span>
                              ) : (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                                  اتمام موجودی
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedProductForAdjustment(prod);
                                  setAdjustType('stock_in');
                                  setAdjustUnit('carton');
                                  setAdjustQuantityCartons(1);
                                }}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold transition-colors border border-indigo-200 whitespace-nowrap"
                              >
                                ثبت بار / اصلاح
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>"""

found_start = -1
found_end = -1

for i, line in enumerate(lines):
    if start_marker in line and found_start == -1:
        found_start = i
    if end_marker in line and found_start != -1:
        found_end = i
        # We want the LAST end_marker after the start_marker for the table body
        # Actually tables have many tbodies? No, usually one.
        # But this file has many tables.
        # Let's find the one near line 1843.
        if i > 1840:
             break

if found_start != -1 and found_end != -1:
    lines[found_start:found_end+1] = [new_tbody + '\\n']
    with open('src/components/shopmanage/AccountingPosPanel.tsx', 'w') as f:
        f.writelines(lines)
    print("Success")
else:
    print(f"Failed to find markers: {found_start}, {found_end}")
