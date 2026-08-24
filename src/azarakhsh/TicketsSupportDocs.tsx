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
      path: '/api/v1/tickets/',
      auth: 'IsAuthenticated',
      description: 'ارسال تیکت جدید به انبار مرکزی همراه با پیوست تصویر فیش بانکی',
      requestBody: JSON.stringify({
        subject: "تایید واریزی پیش‌فاکتور شماره INV-1403-1024",
        department: "finance",
        priority: "high",
        message: "سلام، مبلغ ۷۴,۸۰۰,۰۰۰ تومان به حساب شماره ۱ واریز شد. لطفا بار را بارگیری فرمایید."
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/v1/tickets/my-tickets/',
      auth: 'IsAuthenticated',
      description: 'دریافت تاریخچه تمام تیکت‌ها و وضعیت پاسخگویی اپراتورها'
    },
    {
      method: 'POST',
      path: '/api/v1/tickets/{id}/reply/',
      auth: 'IsAuthenticated',
      description: 'ارسال پاسخ جدید برای یک تیکت باز'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="tickets"
      title="۱۱. اپلیکیشن تیکت و چت آنلاین پشتیبانی"
      titleEn="tickets / Customer Support Ticket App"
      badge="Receipt Attachment • Realtime Threading"
      description="سامانه یکپارچه تیکتینگ پشتیبانی مغازه‌داران و مشتریان عمده، امکان ارسال مستقیم تصویر فیش واریز، رهگیری وضعیت سفارشات و ارسال پیام با زمان‌بندی دقیق."
      icon={<MessageSquare className="w-6 h-6" />}
      modelsCode={ticketsData.models}
      adminCode={ticketsData.admin}
      serializersCode={ticketsData.serializers}
      viewsCode={ticketsData.views}
      urlsCode={ticketsData.urls}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
