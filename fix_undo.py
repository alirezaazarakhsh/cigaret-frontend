with open("src/components/shopmanage/AccountingPosPanel.tsx", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if ")}</button>" in line or ")}</button>" in "".join(lines[max(0, i-2):i+2]):
        pass # just to see

# It's better to restore AccountingPosPanel.tsx from an earlier state or just replace manually.
