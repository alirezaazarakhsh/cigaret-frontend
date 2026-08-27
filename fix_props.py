import glob

files = [
    "src/azarakhsh/PosDocs.tsx",
    "src/azarakhsh/PosProductsDocs.tsx",
    "src/azarakhsh/WarehouseStockDocs.tsx",
    "src/azarakhsh/LedgerDocs.tsx",
    "src/azarakhsh/ReportsDocs.tsx",
    "src/azarakhsh/RolesPermissionsDocs.tsx",
    "src/azarakhsh/KavenegarSmsDocs.tsx"
]

template = """import React from 'react';
import { AppDocTemplate } from './AppDocTemplate';
import { DJANGO_APPS_DATA } from '../data/djangoCodebase';
import { Package } from 'lucide-react';

export const %NAME%: React.FC = () => {
  const data = DJANGO_APPS_DATA.%KEY% || {
    name: '%KEY%', nameFa: '', description: '', icon: 'Box',
    models: '', admin: '', serializers: '', views: '', urls: ''
  };
  return (
    <AppDocTemplate
      appFolder={data.name}
      title={data.nameFa}
      titleEn={data.name}
      description={data.description}
      icon={<Package className="w-6 h-6" />}
      modelsCode={data.models}
      adminCode={data.admin}
      serializersCode={data.serializers}
      viewsCode={data.views}
      urlsCode={data.urls}
      erdTables={[]}
      endpoints={[]}
    />
  );
};
"""

mapping = {
    "PosDocs": "pos",
    "PosProductsDocs": "pos",
    "WarehouseStockDocs": "warehouse",
    "LedgerDocs": "finance",
    "ReportsDocs": "reports",
    "RolesPermissionsDocs": "roles",
    "KavenegarSmsDocs": "sms"
}

for name, key in mapping.items():
    content = template.replace("%NAME%", name).replace("%KEY%", key)
    with open(f"src/azarakhsh/{name}.tsx", "w") as f:
        f.write(content)
