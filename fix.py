with open("src/components/shopmanage/AccountingPosPanel.tsx", "r") as f:
    text = f.read()

text = text.replace("<div>{formatToman(prod.cartonPrice)}</div>\n                              )}", "<div>{formatToman(prod.cartonPrice)}</div>")
text = text.replace("پاکت\n                              </div>\n                              )}", "پاکت\n                              </div>")
text = text.replace("{prod.category !== 'drinks_coffee' && (\n                              {stockInfo.isAvailable ? (", "{stockInfo.isAvailable ? (")

with open("src/components/shopmanage/AccountingPosPanel.tsx", "w") as f:
    f.write(text)
