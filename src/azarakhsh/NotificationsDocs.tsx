import React from 'react';
import { Bell } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const NotificationsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'notifications_usernotification',
      verboseName: 'نوتیفیکیشن‌ها و اطلاعیه‌های کاربران',
      description: 'ارسال هشدارها، وضعیت سفارشات و اطلاعیه‌های مهم قیمت و انبار به کاربران و مغازه‌داران',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'user_id', type: 'ForeignKey(User)', isFk: true, fkTarget: 'accounts_user', verbose: 'کاربر گیرنده' },
        { name: 'title', type: 'CharField(max_length=200)', verbose: 'عنوان اطلاعیه' },
        { name: 'message', type: 'TextField', verbose: 'متن پیام' },
        { name: 'notification_type', type: 'CharField', verbose: 'نوع نوتیفیکیشن (سفارش / تخفیف / سیستم)' },
        { name: 'is_read', type: 'BooleanField(default=False)', verbose: 'خوانده شده' },
        { name: 'created_at', type: 'DateTimeField', verbose: 'تاریخ ارسال' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/notifications/',
      auth: 'IsAuthenticated',
      description: 'دریافت فهرست نوتیفیکیشن‌ها و اطلاعیه‌های کاربر جاری'
    },
    {
      method: 'POST',
      path: '/api/v1/notifications/{id}/mark-read/',
      auth: 'IsAuthenticated',
      description: 'علامت‌گذاری نوتیفیکیشن به عنوان خوانده‌شده'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="notifications"
      title="سیستم نوتیفیکیشن و اطلاعیه‌ها"
      titleEn="notifications / User Notifications App"
      badge="Alerts & Push"
      description="ماژول ارسال اعلان‌ها، هشدارهای تغییرات نرخ لحظه‌ای کارتن‌ها، وضعیت فاکتورها و اخبار انبار مرکزی به کاربران."
      icon={<Bell className="w-6 h-6 text-purple-500" />}
      modelsCode={`from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User

class UserNotification(models.Model):
    class NotificationType(models.TextChoices):
        ORDER = 'order', _('Order Update (وضعیت سفارش)')
        PRICE = 'price', _('Price Alert (تغییر نرخ)')
        SYSTEM = 'system', _('System Announcement (اطلاعیه عمومی)')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name=_("کاربر گیرنده"))
    title = models.CharField(_("عنوان اطلاعیه"), max_length=200)
    message = models.TextField(_("متن پیام"))
    notification_type = models.CharField(_("نوع اعلان"), max_length=20, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    is_read = models.BooleanField(_("خوانده شده"), default=False)
    created_at = models.DateTimeField(_("تاریخ ارسال"), auto_now_add=True)

    class Meta:
        verbose_name = _("نوتیفیکیشن کاربر")
        verbose_name_plural = _("مدیریت نوتیفیکیشن‌ها و اطلاعیه‌ها")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} -> {self.user.full_name}"
`}
      adminCode={`from django.contrib import admin
from .models import UserNotification

@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__phone', 'user__full_name')
    list_editable = ('is_read',)
`}
      serializersCode={`from rest_framework import serializers
from .models import UserNotification

class UserNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']
`}
      viewsCode={`from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UserNotification
from .serializers import UserNotificationSerializer

class UserNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = UserNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return UserNotification.objects.all()
        return UserNotification.objects.filter(user=user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'marked as read'})
`}
      urlsCode={`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserNotificationViewSet

router = DefaultRouter()
router.register('', UserNotificationViewSet, basename='user-notification')

urlpatterns = [
    path('', include(router.urls)),
]
`}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
