import React, { useState } from 'react';
import { MessageSquare, Copy, Check, FileCode, Headphones, Paperclip, Send, Layers } from 'lucide-react';
import { CodeTab } from './types';

export const TicketsSupportDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('models');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelsCode = `"""
tickets/models.py
مدل‌های تیکت‌های پشتیبانی، مکالمات آنلاین و فایل‌های پیوست بارنامه/فیش
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class Ticket(models.Model):
    PRIORITY_CHOICES = (
        ('low', 'عادی'),
        ('medium', 'متوسط'),
        ('high', 'فوری / رهگیری بارنامه'),
    )

    DEPARTMENT_CHOICES = (
        ('sales', 'واحد فروش عمده و استعلام قیمت کارتن'),
        ('warehouse', 'واحد ترابری و انبارداری جنت‌آباد'),
        ('finance', 'امور مالی و تأیید فیش بانکی'),
        ('support', 'پشتیبانی فنی سامانه'),
    )

    STATUS_CHOICES = (
        ('open', 'در انتظار پاسخ کارشناس'),
        ('answered', 'پاسخ داده شده'),
        ('in_progress', 'در حال پیگیری در انبار'),
        ('closed', 'بسته شده'),
    )

    ticket_id = models.CharField(_('شناسه تیکت'), max_length=30, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets', verbose_name=_('کاربر'))
    title = models.CharField(_('موضوع تیکت'), max_length=200)
    department = models.CharField(_('دپارتمان مربوطه'), max_length=30, choices=DEPARTMENT_CHOICES, default='sales')
    priority = models.CharField(_('اولویت'), max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(_('وضعیت تیکت'), max_length=20, choices=STATUS_CHOICES, default='open')

    created_at = models.DateTimeField(_('تاریخ ثبت تیکت'), auto_now_add=True)
    updated_at = models.DateTimeField(_('آخرین بروزرسانی'), auto_now=True)

    class Meta:
        verbose_name = _('تیکت پشتیبانی')
        verbose_name_plural = _('تیکت‌ها و درخواست‌های پشتیبانی')
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.ticket_id}: {self.title} ({self.user.full_name})"


class TicketMessage(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages', verbose_name=_('تیکت'))
    sender = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('ارسال‌کننده پیام'))
    is_staff_reply = models.BooleanField(_('پاسخ از طرف اپراتور'), default=False)
    message_text = models.TextField(_('متن پیام'))
    attachment = models.FileField(_('فایل یا تصویر ضمیمه'), upload_to='tickets/attachments/', blank=True, null=True)
    created_at = models.DateTimeField(_('زمان ارسال'), auto_now_add=True)

    class Meta:
        verbose_name = _('پیام تیکت')
        verbose_name_plural = _('مکالمات تیکت')
        ordering = ['created_at']

    def __str__(self):
        return f"پیام {self.sender.full_name} روی تیکت {self.ticket.ticket_id}"
`;

  const adminCode = `"""
tickets/admin.py
مدیریت تیکت‌ها و پاسخ‌گویی اپراتور در پنل ادمین جنگو
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Ticket, TicketMessage


class TicketMessageInline(admin.TabularInline):
    model = TicketMessage
    extra = 1
    fields = ('sender', 'is_staff_reply', 'message_text', 'attachment', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'title', 'user', 'department', 'priority', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'department', 'priority', 'created_at')
    search_fields = ('ticket_id', 'title', 'user__phone', 'user__full_name')
    list_editable = ('status', 'priority')
    inlines = [TicketMessageInline]
`;

  const serializersCode = `"""
tickets/serializers.py
سریالایزرهای DRF برای ایجاد تیکت، ارسال پاسخ و لیست مکالمات
"""

from rest_framework import serializers
from .models import Ticket, TicketMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'sender', 'sender_name', 'is_staff_reply', 'message_text', 'attachment', 'created_at']
        read_only_fields = ['id', 'sender', 'is_staff_reply', 'created_at']


class TicketCreateSerializer(serializers.ModelSerializer):
    initial_message = serializers.CharField(write_only=True, required=True)
    attachment = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = Ticket
        fields = ['id', 'ticket_id', 'title', 'department', 'priority', 'initial_message', 'attachment']
        read_only_fields = ['id', 'ticket_id']

    def create(self, validated_data):
        import random, datetime
        initial_msg = validated_data.pop('initial_message')
        attachment = validated_data.pop('attachment', None)
        user = self.context['request'].user

        ticket_id = f"TCK-{datetime.datetime.now().strftime('%m%d')}-{random.randint(100, 999)}"
        ticket = Ticket.objects.create(user=user, ticket_id=ticket_id, **validated_data)

        TicketMessage.objects.create(
            ticket=ticket,
            sender=user,
            is_staff_reply=False,
            message_text=initial_msg,
            attachment=attachment
        )
        return ticket


class TicketDetailSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_id', 'user_name', 'title', 'department',
            'priority', 'status', 'messages', 'created_at', 'updated_at'
        ]
`;

  const viewsCode = `"""
tickets/views.py
ویوهای API جنگو برای تیکت‌های پشتیبانی با Swagger
"""

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .models import Ticket, TicketMessage
from .serializers import TicketCreateSerializer, TicketDetailSerializer, TicketMessageSerializer


class TicketListCreateAPIView(generics.ListCreateAPIView):
    """
    مشاهده تیکت‌های کاربر و ایجاد تیکت جدید
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user).prefetch_related('messages')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketDetailSerializer

    @swagger_auto_schema(
        operation_description="دریافت لیست تیکت‌های کاربر لاگین شده",
        responses={200: TicketDetailSerializer(many=True)},
        tags=["تیکت و پشتیبانی چت"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="ثبت تیکت جدید با پیام اولیه و پیوست اختیاری",
        request_body=TicketCreateSerializer,
        responses={201: TicketDetailSerializer},
        tags=["تیکت و پشتیبانی چت"]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class TicketDetailAPIView(generics.RetrieveAPIView):
    """
    مشاهده مکالمات کامل یک تیکت
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketDetailSerializer
    lookup_field = 'ticket_id'

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user)

    @swagger_auto_schema(
        operation_description="دریافت متن کامل مکالمات تیکت با شناسه",
        tags=["تیکت و پشتیبانی چت"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class TicketSendMessageAPIView(APIView):
    """
    ارسال پیام جدید روی یک تیکت باز
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        request_body=TicketMessageSerializer,
        operation_description="ارسال پاسخ جدید در مکالمه تیکت",
        tags=["تیکت و پشتیبانی چت"]
    )
    def post(self, request, ticket_id):
        ticket = Ticket.objects.filter(user=request.user, ticket_id=ticket_id).first()
        if not ticket:
            return Response({'error': 'تیکت یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TicketMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(ticket=ticket, sender=request.user, is_staff_reply=request.user.is_staff)

        ticket.status = 'open' if not request.user.is_staff else 'answered'
        ticket.save(update_fields=['status', 'updated_at'])

        return Response(serializer.data, status=status.HTTP_201_CREATED)
`;

  const urlsCode = `"""
tickets/urls.py
مسیرهای روت برای تیکت و پشتیبانی چت
"""

from django.urls import path
from .views import TicketListCreateAPIView, TicketDetailAPIView, TicketSendMessageAPIView

app_name = 'tickets'

urlpatterns = [
    path('', TicketListCreateAPIView.as_view(), name='ticket_list_create'),
    path('<str:ticket_id>/', TicketDetailAPIView.as_view(), name='ticket_detail'),
    path('<str:ticket_id>/reply/', TicketSendMessageAPIView.as_view(), name='ticket_reply'),
]
`;

  return (
    <div className="space-y-6 text-slate-800 text-right" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-blue-600">اپلیکیشن تیکت و پشتیبانی (tickets)</div>
            <h1 className="text-2xl font-black text-slate-900">
              سیستم مکالمات زنده، ارسال فایل پیوست و دسته‌بندی دپارتمان‌ها
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          امکان ایجاد تیکت‌های پشتیبانی برای رهگیری بارنامه، امور مالی فیش بانکی و ارسال پیام‌های رفت و برگشتی.
        </p>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'models', label: 'مدل‌ها (models.py)' },
          { id: 'admin', label: 'پنل ادمین (admin.py)' },
          { id: 'serializers', label: 'سریالایزرها (serializers.py)' },
          { id: 'views', label: 'ویوهای API (views.py)' },
          { id: 'urls', label: 'روت‌ها (urls.py)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as CodeTab)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 relative font-mono text-xs shadow-xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4" dir="ltr">
          <span className="text-slate-400 font-bold">
            tickets/{activeTab === 'models' ? 'models.py' : activeTab === 'admin' ? 'admin.py' : activeTab === 'serializers' ? 'serializers.py' : activeTab === 'views' ? 'views.py' : 'urls.py'}
          </span>
          <button
            onClick={() => handleCopy(
              activeTab === 'models' ? modelsCode : activeTab === 'admin' ? adminCode : activeTab === 'serializers' ? serializersCode : activeTab === 'views' ? viewsCode : urlsCode,
              activeTab
            )}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            {copiedKey === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی کد</span>
              </>
            )}
          </button>
        </div>

        <pre className="overflow-x-auto text-left leading-relaxed whitespace-pre font-mono text-[11px] sm:text-xs" dir="ltr">
          {activeTab === 'models' ? modelsCode : activeTab === 'admin' ? adminCode : activeTab === 'serializers' ? serializersCode : activeTab === 'views' ? viewsCode : urlsCode}
        </pre>
      </div>
    </div>
  );
};
