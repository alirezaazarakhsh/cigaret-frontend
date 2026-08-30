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
      verboseName: 'جدول تیکت‌های پشتیبانی مشتریان',
      description: 'ثبت و پیگیری درخواست‌ها، واریز فیش، استعلام ترابری و مغایرت بار',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه تیکت' },
        { name: 'user_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'مشتری' },
        { name: 'subject', type: 'CharField(max_length=200)', verbose: 'موضوع تیکت' },
        { name: 'department', type: 'CharField(choices)', verbose: 'دپارتمان (مالی، انبار، باربری، پشتیبانی)' },
        { name: 'priority', type: 'CharField(choices)', verbose: 'اولویت (کم، متوسط، فوری)' },
        { name: 'status', type: 'CharField(choices)', verbose: 'وضعیت (open, answered, closed)' },
        { name: 'receipt_image', type: 'ImageField', verbose: 'پیوست فیش واریز / سند' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'زمان ایجاد' },
      ]
    },
    {
      name: 'tickets_ticketmessage',
      verboseName: 'پیام‌ها و پاسخ‌های تیکت',
      description: 'گفتگوی دوطرفه مشتری و اپراتورهای انبار',
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
      description: 'ارسال تیکت جدید به انبار مرکزی همراه با پیوست تصویر فیش بانکی',
      requestBody: JSON.stringify({
        title: "تایید واریزی پیش‌فاکتور شماره INV-1403-1024",
        department: "finance",
        priority: "high",
        initial_message: "سلام، مبلغ ۷۴,۸۰۰,۰۰۰ تومان به حساب شماره ۱ واریز شد. لطفا بار را بارگیری فرمایید.",
        order_tracking_code: "ORD-1403-9982"
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/tickets/list/',
      auth: 'IsAuthenticated',
      description: 'دریافت تاریخچه تمام تیکت‌ها و وضعیت پاسخگویی اپراتورها'
    },
    {
      method: 'GET',
      path: '/api/v1/tickets/{id}/',
      auth: 'IsAuthenticated',
      description: 'دریافت جزئیات تیکت و تمامی پیام‌ها و پاسخ‌های گفتگو'
    },
    {
      method: 'POST',
      path: '/api/v1/tickets/{id}/reply/',
      auth: 'IsAuthenticated',
      description: 'ارسال پاسخ جدید یا پیوست فیش جدید برای یک تیکت باز'
    }
  ];

  const notesCode = `## 📌 راهنمای جامع و تکمیلی ساخت، پیکربندی و راه‌اندازی اپلیکیشن تیکت‌ها و پشتیبانی (tickets)

### 🛠️ ۱. ویژگی‌ها و مشخصات فنی سیستم پشتیبانی
- **کلاس‌های صریح \`APIView\`**: کلیه اندپوینت‌ها از \`APIView\`‌های صریح و تفکیک‌شده استفاده می‌کنند تا مشکلاتی نظیر \`ImproperlyConfigured\` در \`urls.py\` کاملاً برطرف شود.
- **تولید شماره تیکت خودکار**: کد پیگیری تیکت‌ها با فرمت استاندارد \`TCK-YYYYMMDD-ID\` تولید می‌گردد.
- **ثبت فیش واریزی و سند**: امکان ارسال فایل‌های تصویر فیش بانکی جهت تایید پیش‌فاکتورها و تسویه نسیه انبار.
- **تغییر خودکار وضعیت**: هنگام ثبت پاسخ جدید توسط اپراتور انبار وضعیت تیکت به \`answered\` و هنگام پاسخ مشتری به \`customer_reply\` تغییر می‌یابد.

---

### 📂 ۲. ساختار فایل‌های پروژه جنگو در پوشه \`tickets/\`
\`\`\`text
tickets/
├── __init__.py
├── admin.py          # مدیریت تیکت‌ها و پیام‌ها در پنل ادمین جنگو
├── apps.py           # تنظیمات اپ پیکربندی TicketsConfig
├── models.py         # مدل‌های SupportTicket و TicketMessage
├── serializers.py    # سریالایزرهای DRF با ref_name اختصاصی
├── urls.py           # مسیرهای صریح URL با APIView
└── views.py          # ویوهای APIView به همراه مستندات Swagger/ReDoc
\`\`\`

---

### 💻 ۳. کد کامل مسیرهای \`tickets/urls.py\`
\`\`\`python
"""
tickets/urls.py
مسیرهای صریح APIView جهت پشتیبانی و تیکت‌ها
"""
from django.urls import path
from .views import (
    TicketListAPIView,
    TicketCreateAPIView,
    TicketDetailAPIView,
    TicketReplyAPIView,
)

app_name = 'tickets'

urlpatterns = [
    # ۱. دریافت لیست و ثبت تیکت جدید
    path('list/', TicketListAPIView.as_view(), name='ticket-list'),
    path('create/', TicketCreateAPIView.as_view(), name='ticket-create'),

    # ۲. جزئیات تیکت و ارسال پاسخ
    path('<int:pk>/', TicketDetailAPIView.as_view(), name='ticket-detail'),
    path('<int:pk>/reply/', TicketReplyAPIView.as_view(), name='ticket-reply'),
]
\`\`\`

---

### 🚀 ۴. نمونه کدهای اتصال فرانت‌اند React با Fetch / Axios

#### ثبت تیکت جدید به همراه پیام اولیه و شماره کد رهگیری سفارش:
\`\`\`typescript
const createSupportTicket = async (ticketData: {
  title: string;
  department: string;
  priority: string;
  initial_message: string;
  order_tracking_code?: string;
}) => {
  const response = await fetch('http://localhost:8000/api/v1/tickets/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify(ticketData)
  });
  const data = await response.json();
  return data;
};
\`\`\`

#### ارسال پاسخ جدید یا فیش واریز تسویه به تیکت:
\`\`\`typescript
const replyToTicket = async (ticketId: number, messageText: string, attachmentFile?: File) => {
  const formData = new FormData();
  formData.append('message', messageText);
  if (attachmentFile) {
    formData.append('attachment', attachmentFile);
  }

  const response = await fetch(\`http://localhost:8000/api/v1/tickets/\${ticketId}/reply/\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`
    },
    body: formData
  });
  return await response.json();
};
\`\`\`

---

### ⚙️ ۵. دستورات اجرا و مایگریشن در ترمینال مک / لینوکس:
\`\`\`bash
# ساخت مایگریشن‌ها و اعمال در پایگاه داده
python manage.py makemigrations tickets
python manage.py migrate

# اجرای سرور توسعه جنگو
python manage.py runserver 0.0.0.0:8000
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="tickets"
      title="۱۱. اپلیکیشن تیکت و پشتیبانی مشتریان معمولی"
      titleEn="tickets / Regular Customer Ticket App"
      badge="مشتری معمولی • ثبت فیش واریزی"
      description="سامانه یکپارچه تیکتینگ پشتیبانی مغازه‌داران و مشتریان عمده معمولی، امکان ارسال مستقیم تصویر فیش واریز، رهگیری وضعیت سفارشات، استعلام ترابری شوش و پاسخگویی انباردار."
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
