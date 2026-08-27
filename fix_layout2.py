with open("src/azarakhsh/Layout.tsx", "r") as f:
    text = f.read()

# Fix the messy insertion
text = text.replace("""  {
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
    id: 'blog-tinymce',""", """  {
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
  {
    id: 'blog-tinymce',""")

with open("src/azarakhsh/Layout.tsx", "w") as f:
    f.write(text)
