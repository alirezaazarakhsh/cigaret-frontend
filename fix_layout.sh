sed -i 's/export type AzarakhshSectionId =/export type AzarakhshSectionId =\n  | '"'"'sms'"'"'/g' src/azarakhsh/types.ts

cat << 'INNER_EOF' >> src/azarakhsh/types.ts.tmp
  {
    id: 'sms',
    title: 'سرویس پیامک کاوه‌نگار',
    titleEn: 'sms / Kavenegar',
    description: 'سرویس احراز هویت پیامکی و اطلاع‌رسانی',
    badge: 'API',
    iconName: 'MessageSquare',
    appFolder: 'sms',
    group: 'setup',
    groupTitle: 'راه‌اندازی و زیرساخت'
  },
INNER_EOF
sed -i '/id: '"'"'blog-tinymce'"'"',/e cat src/azarakhsh/types.ts.tmp' src/azarakhsh/Layout.tsx
rm src/azarakhsh/types.ts.tmp
