import React from 'react';
import { MessageSquare } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';
import { DJANGO_APPS_DATA } from '../data/djangoCodebase';

export const TicketsSupportDocs: React.FC = () => {
  const ticketsData = DJANGO_APPS_DATA.tickets || {
    models: '',
    admin: '',
    serializers: '',
    views: '',
    urls: '',
  };

  const erdTables: TableErdMeta[] = [
    {
      name: 'tickets_ticket',
      verboseName: 'جدول تیکت‌های پشتیبانی (مشتریان و ویزیتورها)',
      description: 'ثبت درخواست‌های پشتیبانی، تسویه پورسانت، استعلام بارگیری و مغایرت بار',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه تیکت' },
        { name: 'user_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'کاربر (مشتری یا ویزیتور)' },
        { name: 'visitor_id', type: 'ForeignKey', isFk: true, fkTarget: 'visitors_visitorprofile', verbose: 'ویزیتور مرتبط (اختیاری)' },
        { name: 'ticket_type', type: 'CharField(choices)', verbose: 'نوع تیکت (customer, visitor)' },
        { name: 'subject', type: 'CharField(max_length=200)', verbose: 'موضوع تیکت' },
        { name: 'department', type: 'CharField(choices)', verbose: 'دپارتمان (مالی، انبار، فروش، پشتیبانی)' },
        { name: 'priority', type: 'CharField(choices)', verbose: 'اولویت (کم، متوسط، فوری)' },
        { name: 'status', type: 'CharField(choices)', verbose: 'وضعیت (open, in_progress, answered, closed)' },
        { name: 'order_tracking_code', type: 'CharField', verbose: 'کد سفارش مرتبط (اختیاری)' },
        { name: 'receipt_image', type: 'ImageField', verbose: 'پیوست فیش واریز / سند' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'زمان ایجاد' },
      ]
    },
    {
      name: 'tickets_ticketmessage',
      verboseName: 'پیام‌ها و پاسخ‌های تیکت',
      description: 'گفتگوی دوطرفه کاربر و تیم مدیریت آذرخش',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه پیام' },
        { name: 'ticket_id', type: 'ForeignKey', isFk: true, fkTarget: 'tickets_ticket', verbose: 'تیکت مربوطه' },
        { name: 'sender_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'فرستنده پیام' },
        { name: 'message', type: 'TextField', verbose: 'متن پیام' },
        { name: 'attachment', type: 'FileField', verbose: 'فایل پیوست' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'زمان ارسال' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/tickets/create/',
      auth: 'IsAuthenticated',
      description: 'ارسال تیکت جدید (مشتری یا ویزیتور). ادمین می‌تواند کاربر هدف را نیز انتخاب کند.',
      requestBody: JSON.stringify({
        title: "درخواست تسویه پورسانت ۳۸ مغازه - شهریور ۱۴۰۳",
        department: "finance",
        priority: "high",
        message: "سلام، درخواست تسویه پورسانت ۲.۵٪ برای فاکتورهای اخیر را دارم.",
        ticket_type: "visitor",
        visitor_id: 5
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/tickets/list/',
      auth: 'IsAuthenticated',
      description: 'دریافت تاریخچه تمام تیکت‌ها با امکان فیلتر بر اساس user_id و نقش کاربر'
    },
    {
      method: 'GET',
      path: '/api/v1/tickets/{id}/',
      auth: 'IsAuthenticated',
      description: 'دریافت جزئیات کامل تیکت و چت‌های مربوطه'
    },
    {
      method: 'POST',
      path: '/api/v1/tickets/{id}/reply/',
      auth: 'IsAuthenticated',
      description: 'ارسال پاسخ جدید در تیکت'
    }
  ];

  const notesCode = `## 📌 راهنمای جامع سامانه یکپارچه تیکتینگ و پشتیبانی (tickets)

### 🛠️ ۱. ویژگی‌های سیستم تیکتینگ هوشمند
- **ساختار واحد برای مشتری و ویزیتور**: تیکت‌ها اکنون در یک اپلیکیشن واحد مدیریت می‌شوند اما با فیلد \`ticket_type\` و شناسه‌های مرتبط تفکیک می‌گردند.
- **انتخاب کاربر توسط ادمین**: در پنل مدیریت، ادمین امکان انتخاب کاربر هدف از لیست مشتریان یا ویزیتورها را دارد.
- **ثبت فیش و اسناد**: قابلیت پیوست تصویر برای تایید واریزی‌های مشتری یا اسناد مغازه‌داران جدید توسط ویزیتور.
- **همگام‌سازی با دیتابیس**: تمامی عملیات‌ها به صورت مستقیم با مدل‌های جنگو هماهنگ شده است.

---

### 📂 ۲. اندپوینت‌های کلیدی در دیتابیس جنگو
- \`GET /api/v1/tickets/list/\`: لیست تیکت‌ها (قابل فیلتر با \`user_id\`).
- \`POST /api/v1/tickets/create/\`: ایجاد تیکت جدید با پارامترهای اختصاصی نوع کاربر.
- \`GET /api/v1/tickets/{id}/\`: مشاهده جزئیات و پیام‌ها.
- \`POST /api/v1/tickets/{id}/reply/\`: ارسال پاسخ.

---

### 🚀 ۳. نمونه کدهای اتصال فرانت‌اند React

#### ایجاد تیکت توسط ادمین برای یک کاربر یا ویزیتور خاص:
\`\`\`typescript
const adminCreateTicketForUser = async (payload: {
  user_id: number;
  ticket_type: 'customer' | 'visitor';
  visitor_id?: number;
  subject: string;
  message: string;
}) => {
  const response = await fetch('http://localhost:8000/api/v1/tickets/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${adminToken}\`
    },
    body: JSON.stringify(payload)
  });
  return await response.json();
};
\`\`\`

### 🚀 ۴. مدیریت تیکت‌ها در پنل مدیریت
در بخش مدیریت (Shop Management)، امکان مدیریت متمرکز تیکت‌ها فراهم شده است که شامل مشاهده تمام گفتگوها، ارسال پاسخ ادمین و تغییر وضعیت تیکت می‌باشد.
`;

  return (
    <AppDocTemplate
      appFolder="tickets"
      title="۱۱. سامانه جامع تیکتینگ و پشتیبانی (مشتریان و ویزیتورها)"
      titleEn="tickets / Integrated Support & Ticket System"
      badge="مشتری و ویزیتور • یکپارچه"
      description="سامانه هوشمند و متمرکز پشتیبانی آذرخش جهت مدیریت درخواست‌های مشتریان عمده و ویزیتوران بازاریابی؛ شامل تسویه پورسانت، تایید فیش واریزی، استعلام ترابری و معرفی مغازه‌داران جدید."
      icon={<MessageSquare className="w-6 h-6" />}
      modelsCode={ticketsData.models}
      adminCode={ticketsData.admin}
      serializersCode={ticketsData.serializers}
      viewsCode={ticketsData.views}
      urlsCode={ticketsData.urls}
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
