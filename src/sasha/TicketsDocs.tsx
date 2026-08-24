import React, { useState } from 'react';
import { MessageSquare, Copy, Check, Headphones, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const TicketsDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'models' | 'admin' | 'serializers' | 'views' | 'urls'>('models');

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-right" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
            <Headphones className="w-4 h-4" />
            <span>پشتیبانی و تیکت‌های مشتریان و همکاران</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            اپلیکیشن تیکت و پشتیبانی (tickets)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            شامل تیکت‌های بخش فروش، مالی، انبار و ترابری، ارسال پیام‌های متوالی، آپلود ضمائم و اعلان پیام جدید به کاربران.
          </p>
        </div>
      </div>

      {/* Code Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'models', label: 'مدل‌ها (models.py)' },
          { id: 'admin', label: 'پنل ادمین (admin.py)' },
          { id: 'serializers', label: 'سریالایزرها (serializers.py)' },
          { id: 'views', label: 'ویوها و APIها (views.py)' },
          { id: 'urls', label: 'مسیرها (urls.py)' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveCodeTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCodeTab === t.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* models.py */}
      {activeCodeTab === 'models' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۱. کدهای tickets/models.py</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>tickets/models.py</span>
              <button
                onClick={() => handleCopy('tkt_mod', `import uuid
from django.db import models
from django.conf import settings

def generate_ticket_no():
    return f"TCK-{uuid.uuid4().hex[:6].upper()}"

class SupportTicket(models.Model):
    DEPT_CHOICES = (
        ('sales', 'واحد فروش و ثبت تیراژ'),
        ('finance', 'واحد حسابداری و امور واریز'),
        ('warehouse', 'واحد انبارداری و تحویل بار'),
        ('shipping', 'واحد ترابری و باربری'),
        ('general', 'امور عمومی و انتقادات'),
    )

    PRIORITY_CHOICES = (
        ('low', 'عادی'),
        ('medium', 'متوسط'),
        ('high', 'مهم'),
        ('urgent', 'فوری / توقف بار'),
    )

    STATUS_CHOICES = (
        ('open', 'درحال بررسی'),
        ('in_progress', 'در دست اقدام انبار'),
        ('answered', 'پاسخ داده شده'),
        ('closed', 'بسته شده'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets', verbose_name="کاربر")
    ticket_number = models.CharField(max_length=30, unique=True, default=generate_ticket_no, verbose_name="شماره تیکت")
    title = models.CharField(max_length=200, verbose_name="عنوان موضوع")
    department = models.CharField(max_length=20, choices=DEPT_CHOICES, default='sales', verbose_name="دپارتمان")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name="اولویت")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', verbose_name="وضعیت تیکت")
    order_tracking_code = models.CharField(max_length=50, blank=True, verbose_name="کد رهگیری سفارش مرتبط")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="آخرین پیام")

    class Meta:
        verbose_name = "تیکت پشتیبانی"
        verbose_name_plural = "تیکت‌های پشتیبانی"
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.ticket_number} - {self.title}"

class TicketMessage(models.Model):
    SENDER_CHOICES = (
        ('user', 'مشتری / ویزیتور'),
        ('admin', 'پشتیبانی انبار مرکزی'),
    )

    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages', verbose_name="تیکت")
    sender_type = models.CharField(max_length=10, choices=SENDER_CHOICES, default='user', verbose_name="نوع فرستنده")
    sender_name = models.CharField(max_length=150, verbose_name="نام فرستنده")
    text = models.TextField(verbose_name="متن پیام")
    attachment = models.FileField(upload_to='tickets/attachments/', blank=True, null=True, verbose_name="فایل ضمیمه")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان ارسال")

    class Meta:
        verbose_name = "پیام تیکت"
        verbose_name_plural = "پیام‌های تیکت"
        ordering = ['created_at']`)}
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                {copiedKey === 'tkt_mod' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'tkt_mod' ? 'کپی شد' : 'کپی مدل تیکت'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-300" dir="ltr">
{`class SupportTicket(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    ticket_number = models.CharField(max_length=30, unique=True)
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=20, default='sales')
    priority = models.CharField(max_length=20, default='medium')
    status = models.CharField(max_length=20, default='open')`}
            </pre>
          </div>
        </section>
      )}

      {/* admin.py */}
      {activeCodeTab === 'admin' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۲. کدهای tickets/admin.py</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <pre className="p-4 overflow-x-auto text-sky-300" dir="ltr">
{`from django.contrib import admin
from .models import SupportTicket, TicketMessage

class TicketMessageInline(admin.StackedInline):
    model = TicketMessage
    extra = 1

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_number', 'title', 'user', 'department', 'priority', 'status', 'updated_at')
    list_filter = ('status', 'department', 'priority', 'created_at')
    search_fields = ('ticket_number', 'title', 'user__phone', 'user__full_name')
    inlines = [TicketMessageInline]`}
            </pre>
          </div>
        </section>
      )}

      {/* serializers.py */}
      {activeCodeTab === 'serializers' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۳. کدهای tickets/serializers.py</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <pre className="p-4 overflow-x-auto text-amber-300" dir="ltr">
{`from rest_framework import serializers
from .models import SupportTicket, TicketMessage

class TicketMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketMessage
        fields = ('id', 'sender_type', 'sender_name', 'text', 'attachment', 'created_at')
        read_only_fields = ('id', 'sender_type', 'sender_name', 'created_at')

class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    first_message = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = SupportTicket
        fields = '__all__'
        read_only_fields = ('id', 'ticket_number', 'status', 'user', 'created_at', 'updated_at')`}
            </pre>
          </div>
        </section>
      )}

      {/* views.py */}
      {activeCodeTab === 'views' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۴. کدهای tickets/views.py با Swagger Schema</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <pre className="p-4 overflow-x-auto text-emerald-300" dir="ltr">
{`from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from .models import SupportTicket, TicketMessage
from .serializers import SupportTicketSerializer, TicketMessageSerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return SupportTicket.objects.all()
        return SupportTicket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        ticket = serializer.save(user=self.request.user)
        first_msg = serializer.validated_data.get('first_message')
        if first_msg:
            TicketMessage.objects.create(
                ticket=ticket,
                sender_type='user',
                sender_name=self.request.user.full_name,
                text=first_msg
            )

    @swagger_auto_schema(
        operation_id="add_ticket_reply",
        operation_description="ارسال پاسخ جدید به تیکت پشتیبانی",
        request_body=TicketMessageSerializer,
        tags=["پشتیبانی و تیکت‌ها"]
    )
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        is_admin = request.user.role == 'admin'
        msg = serializer.save(
            ticket=ticket,
            sender_type='admin' if is_admin else 'user',
            sender_name=request.user.full_name
        )
        ticket.status = 'answered' if is_admin else 'open'
        ticket.save()

        return Response(TicketMessageSerializer(msg).data, status=status.HTTP_201_CREATED)`}
            </pre>
          </div>
        </section>
      )}

      {/* urls.py */}
      {activeCodeTab === 'urls' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">۵. کدهای tickets/urls.py</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-slate-100 border border-slate-800 font-mono text-xs">
            <pre className="p-4 overflow-x-auto text-sky-300" dir="ltr">
{`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupportTicketViewSet

router = DefaultRouter()
router.register(r'tickets', SupportTicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),
]`}
            </pre>
          </div>
        </section>
      )}

    </div>
  );
};
