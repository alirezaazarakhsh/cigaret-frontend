with open("src/components/shopmanage/AccountingPosPanel.tsx", "r") as f:
    text = f.read()

text = text.replace("""                              {prod.category !== 'drinks_coffee' && (
                              <button
                                onClick={() => {""", """                              {prod.category !== 'drinks_coffee' && (
                              <button
                                onClick={() => {""")

text = text.replace("""                              </button>
                            </td>""", """                              </button>
                              )}
                            </td>""")

with open("src/components/shopmanage/AccountingPosPanel.tsx", "w") as f:
    f.write(text)
