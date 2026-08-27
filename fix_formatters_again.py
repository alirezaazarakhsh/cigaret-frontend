with open("src/utils/formatters.ts", "r") as f:
    text = f.read()

old_block = """  if (product.category === 'drinks_coffee') {
    return {
      cartons,
      totalBoxes,
      totalPacks,
      boxesPerCarton: 1,
      packsPerBox: 1,
      isAvailable: true,
      textSummary: 'موجودی آزاد'
    };
  }"""

new_block = """  if (product.category === 'drinks_coffee') {
    return {
      cartons,
      totalBoxes,
      totalPacks,
      boxesPerCarton: 1,
      packsPerBox: 1,
      isAvailable: cartons > 0,
      textSummary: cartons > 0 ? `${formatNumberFa(cartons)} عدد` : 'ناموجود (نوشیدنی)'
    };
  }"""

text = text.replace(old_block, new_block)

with open("src/utils/formatters.ts", "w") as f:
    f.write(text)
