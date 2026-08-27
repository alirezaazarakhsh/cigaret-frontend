sed -i 's/import { RolesPermissionsDocs } from '"'"'.\/RolesPermissionsDocs'"'"';/import { RolesPermissionsDocs } from '"'"'.\/RolesPermissionsDocs'"'"';\nimport { KavenegarSmsDocs } from '"'"'.\/KavenegarSmsDocs'"'"';/g' src/azarakhsh/AzarakhshApiDocs.tsx

sed -i 's/case '"'"'roles-permissions'"'"':\n        return <RolesPermissionsDocs \/>;/case '"'"'roles-permissions'"'"':\n        return <RolesPermissionsDocs \/>;\n      case '"'"'sms'"'"':\n        return <KavenegarSmsDocs \/>;/g' src/azarakhsh/AzarakhshApiDocs.tsx
