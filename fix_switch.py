with open("src/azarakhsh/AzarakhshApiDocs.tsx", "r") as f:
    text = f.read()

cases_to_add = """      case 'pos':
        return <PosDocs />;
      case 'pos-products':
        return <PosProductsDocs />;
      case 'warehouse-stock':
        return <WarehouseStockDocs />;
      case 'ledger':
        return <LedgerDocs />;
      case 'reports':
        return <ReportsDocs />;
      case 'roles-permissions':
        return <RolesPermissionsDocs />;
      case 'sms':
        return <KavenegarSmsDocs />;"""

text = text.replace("      case 'pos':\n        return <PosDocs />;", cases_to_add)

with open("src/azarakhsh/AzarakhshApiDocs.tsx", "w") as f:
    f.write(text)
