import React from 'react';
import { BadgeDollarSign, MessageSquare } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';
import { DJANGO_APPS_DATA } from '../data/djangoCodebase';

export const VisitorTicketsDocs: React.FC = () => {
  const visitorTicketsData = DJANGO_APPS_DATA.visitor_tickets || {
    models: '',
    admin: '',
    serializers: '',
    views: '',
    urls: '',
  };

  const erdTables: TableErdMeta[] = [
    {
      name: 'visitor_tickets_visitorticket',
      verboseName: 'جدول تیکت‌های تخصصی ویزیتوران و پورسانت',
      description: 'ثبت و پیگیری درخواست‌های تسویه کمیسیون ۲.۵٪، مغایرت فاکتور و ثبت مغازه‌دار جدید',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه یکتا' },
        { name: 'ticket_code', type: 'CharField(max_length=50)', isUnique: true, verbose: 'کد اختصاصی تیکت ویزیتور', help: 'مثال: TCK-VIS-14030612-5' },
        { name: 'visitor_id', type: 'ForeignKey', isFk: true, fkTarget: 'visitors_visitorprofile', verbose: 'ویزیتور ارسال‌کننده' },
        { name: 'category', type: 'CharField(choices)', verbose: 'دسته‌بندی (تسویه پورسانت، مغایرت، ثبت مغازه، نمونه کالا)' },
        { name: 'subject', type: 'CharField(max_length=200)', verbose: 'موضوع درخواست' },
        { name: 'target_shop_id', type: 'ForeignKey', isFk: true, fkTarget: 'visitors_retailshopcustomer', verbose: 'مغازه مرتبط (اختیاری)' },
        { name: 'claimed_amount', type: 'DecimalField(max_digits=12)', verbose: 'مبلغ پورسانت ادعایی (تومان)' },
        { name: 'bank_sheba', type: 'CharField(max_length=30)', verbose: 'شماره شبای واریز پورسانت' },
        { name: 'status', type: 'CharField(choices)', verbose: 'وضعیت (ثبت‌شده، در حال بررسی، تسویه‌شده، رد شده)' },
        { name: 'priority', type: 'CharField(choices)', verbose: 'اولویت (عادی، مهم، فوری)' },
        { name: 'document', type: 'FileField', verbose: 'سند پیوست (پروانه کسب / فاکتور)' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ثبت' },
      ]
    },
    {
      name: 'visitor_tickets_visitorticketreply',
      verboseName: 'پیام‌ها و فیش‌های واریز پورسانت ویزیتور',
      description: 'گفتگوی دوطرفه ویزیتور و تیم حسابداری انبار مرکزی همراه با پیوست فیش واریز تسویه',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه پیام' },
        { name: 'ticket_id', type: 'ForeignKey', isFk: true, fkTarget: 'visitor_tickets_visitorticket', verbose: 'تیکت ویزیتور مرجع' },
        { name: 'sender_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'فرستنده (ویزیتور / حسابدار)' },
        { name: 'is_accountant_reply', type: 'BooleanField', verbose: 'پاسخ توسط مدیر مالی / حسابدار انبار' },
        { name: 'message', type: 'TextField', verbose: 'متن توضیحات تسویه یا درخواست' },
        { name: 'payment_receipt', type: 'FileField', verbose: 'تصویر فیش واریز پورسانت بانکی' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'زمان ارسال' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'POST',
      path: '/api/v1/visitor-tickets/create/',
      auth: 'IsAuthenticated (Visitor)',
      description: 'ثبت تیکت جدید توسط ویزیتور جهت درخواست تسویه کمیسیون ۲.۵٪ یا معرفی مغازه‌دار جدید',
      requestBody: JSON.stringify({
        category: "commission_claim",
        subject: "درخواست تسویه پورسانت ۳۸ مغازه بنکداری - شهریور ۱۴۰۳",
        claimed_amount: 35500000,
        bank_sheba: "IR620170000000112233445566",
        priority: "high"
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/visitor-tickets/list/',
      auth: 'IsAuthenticated (Visitor)',
      description: 'دریافت فهرست تمام تیکت‌های درخواست تسویه و پیگیری وضعیت واریز پورسانت'
    },
    {
      method: 'GET',
      path: '/api/v1/visitor-tickets/{id}/',
      auth: 'IsAuthenticated',
      description: 'دریافت جزئیات تیکت ویزیتور و مشاهده فیش‌های واریز کمیسیون'
    },
    {
      method: 'POST',
      path: '/api/v1/visitor-tickets/{id}/reply/',
      auth: 'IsAuthenticated',
      description: 'ارسال پاسخ جدید یا آپلود فیش واریز تسویه پورسانت توسط مدیریت مالی انبار'
    }
  ];

  const notesCode = `## 📌 راهنمای جامع و تکمیلی ساخت و راه‌اندازی اپلیکیشن تیکتینگ ویزیتوران (visitor_tickets)

### 🛠️ ۱. ویژگی‌ها و کارکردهای اصلی تیکتینگ ویزیتوری
- **پیگیری پورسانت ۲.۵٪ ویزیتور**: ثبت درخواست تسویه کمیسیون با درج شماره شبا و شماره فاکتورهای فروش.
- **معرفی مغازه‌دار جدید**: امکان پیوست تصویر پروانه کسب یا کارت مغازه جهت تایید و ایجاد حساب در باشگاه مشتریان.
- **تولید کد اختصاصی**: فرمت کد پیگیری \`TCK-VIS-YYYYMMDDHHMM-VISITOR_ID\`.
- **معماری صریح APIView**: عدم استفاده از Router و استفاده از مسیرهای مستقیم و بدون خطا جهت یکپارچگی کامل با Swagger.

---

### 💻 ۲. ساختار فایل \`visitor_tickets/urls.py\`
\`\`\`python
from django.urls import path
from .views import (
    VisitorTicketListAPIView,
    VisitorTicketCreateAPIView,
    VisitorTicketDetailAPIView,
    VisitorTicketReplyAPIView,
)

app_name = 'visitor_tickets'

urlpatterns = [
    path('list/', VisitorTicketListAPIView.as_view(), name='visitor-ticket-list'),
    path('create/', VisitorTicketCreateAPIView.as_view(), name='visitor-ticket-create'),
    path('<int:pk>/', VisitorTicketDetailAPIView.as_view(), name='visitor-ticket-detail'),
    path('<int:pk>/reply/', VisitorTicketReplyAPIView.as_view(), name='visitor-ticket-reply'),
]
\`\`\`

---

### 🚀 ۳. نمونه فراخوانی در فرانت‌اند React

#### ارسال درخواست تسویه پورسانت با فرمت Multipart (همراه با سند):
\`\`\`typescript
const requestCommissionPayout = async (payload: {
  category: string;
  subject: string;
  claimed_amount: number;
  bank_sheba: string;
  documentFile?: File;
}) => {
  const formData = new FormData();
  formData.append('category', payload.category);
  formData.append('subject', payload.subject);
  formData.append('claimed_amount', payload.claimed_amount.toString());
  formData.append('bank_sheba', payload.bank_sheba);
  if (payload.documentFile) {
    formData.append('document', payload.documentFile);
  }

  const response = await fetch('http://localhost:8000/api/v1/visitor-tickets/create/', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`
    },
    body: formData
  });
  return await response.json();
};
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="visitor_tickets"
      title="۱۲. اپلیکیشن تیکتینگ ویزیتوران و تسویه پورسانت"
      titleEn="visitor_tickets / Visitor Tickets & Commission Payout App"
      badge="2.5% Commission Settlement • Retail Club Approval"
      description="سامانه یکپارچه و تخصصی پشتیبانی ویزیتوران جهت پیگیری تسویه حساب پورسانت‌های فروش (۲.۵٪ سود)، معرفی و تایید واحدهای صنفی جدید در باشگاه مشتریان، اعلام مغایرت فاکتورها و دریافت نمونه کالا."
      icon={<BadgeDollarSign className="w-6 h-6" />}
      modelsCode={visitorTicketsData.models}
      adminCode={visitorTicketsData.admin}
      serializersCode={visitorTicketsData.serializers}
      viewsCode={visitorTicketsData.views}
      urlsCode={visitorTicketsData.urls}
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
