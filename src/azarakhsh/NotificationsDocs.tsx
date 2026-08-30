import React from 'react';
import { Bell } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const NotificationsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'notifications_usernotification',
      verboseName: 'نوتیفیکیشن‌ها و اطلاعیه‌های کاربران',
      description: 'ارسال هشدارها، وضعیت سفارشات، تغییرات نرخ و اطلاعیه‌های مهم انبار به کاربران سایت از طریق پنل صندوق فروشگاهی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'user_id', type: 'ForeignKey(User, null=True, blank=True)', isFk: true, fkTarget: 'accounts_user', verbose: 'کاربر گیرنده (خالی برای اطلاعیه سراسری)' },
        { name: 'title', type: 'CharField(max_length=200)', verbose: 'عنوان اطلاعیه' },
        { name: 'message', type: 'TextField', verbose: 'متن پیام' },
        { name: 'notification_type', type: 'CharField(choices: system, price, order, finance)', verbose: 'نوع نوتیفیکیشن' },
        { name: 'is_read', type: 'BooleanField(default=False)', verbose: 'خوانده شده' },
        { name: 'created_at', type: 'DateTimeField(auto_now_add=True)', verbose: 'تاریخ ارسال' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/notifications/list/',
      auth: 'IsAuthenticated / AllowStaff',
      description: 'دریافت فهرست نوتیفیکیشن‌ها و اطلاعیه‌ها با امکان فیلتر بر اساس نوع، وضعیت خوانده‌شده و جستجو'
    },
    {
      method: 'GET',
      path: '/api/v1/notifications/unread-count/',
      auth: 'IsAuthenticated',
      description: 'دریافت تعداد پیام‌های خوانده‌نشده جهت نمایش عدد زنگوله سایت'
    },
    {
      method: 'POST',
      path: '/api/v1/notifications/create/',
      auth: 'IsAuthenticated (Staff/POS)',
      description: 'ثبت و ارسال آنی نوتیفیکیشن جدید از صندوق به کاربران سایت (سراسری یا اختصاصی)'
    },
    {
      method: 'POST',
      path: '/api/v1/notifications/{id}/mark-read/',
      auth: 'IsAuthenticated',
      description: 'علامت‌گذاری نوتیفیکیشن مشخص به عنوان خوانده‌شده'
    },
    {
      method: 'POST',
      path: '/api/v1/notifications/mark-all-read/',
      auth: 'IsAuthenticated',
      description: 'علامت‌گذاری تمامی اعلانات به عنوان خوانده‌شده'
    },
    {
      method: 'DELETE',
      path: '/api/v1/notifications/{id}/delete/',
      auth: 'IsAuthenticated (Staff/POS)',
      description: 'حذف اعلان از پایگاه‌داده جنگو توسط پرسنل صندوق'
    }
  ];

  const viewsCode = `"""
notifications/views.py
ویوهای اختصاصی صریح با استفاده از APIView جهت اتصال کامل صندوق به پایگاه‌داده اعلانات
امکان ارسال اعلان از صندوق، ویرایش، حذف، دریافت آمار و لیست فیلترشده
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema

from .models import UserNotification
from .serializers import UserNotificationSerializer


class NotificationListAPIView(APIView):
    """
    دریافت لیست اعلانات و اطلاعیه‌ها با امکان فیلتر پیشرفته
    کاربران عادی فقط اعلانات خود + اعلانات عمومی را می‌بینند
    پرسنل صندوق کل اعلانات سیستم را جهت مدیریت مشاهده می‌کنند
    """
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        notif_type = request.query_params.get('type')
        is_read = request.query_params.get('is_read')
        search = request.query_params.get('search')

        if user and user.is_staff:
            queryset = UserNotification.objects.all()
        elif user:
            queryset = UserNotification.objects.filter(Q(user=user) | Q(user__isnull=True))
        else:
            queryset = UserNotification.objects.filter(user__isnull=True)

        if notif_type and notif_type != 'all':
            queryset = queryset.filter(notification_type=notif_type)

        if is_read is not None and is_read != '':
            is_read_bool = is_read.lower() in ['true', '1']
            queryset = queryset.filter(is_read=is_read_bool)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(message__icontains=search) |
                Q(user__phone__icontains=search) |
                Q(user__full_name__icontains=search)
            )

        queryset = queryset.order_by('-created_at')[:100]
        serializer = UserNotificationSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class NotificationCreateAPIView(APIView):
    """
    ثبت و ارسال آنی نوتیفیکیشن از صندوق فروشگاهی به کاربران سایت
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserNotificationSerializer(data=request.data)
        if serializer.is_valid():
            notif = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اعلان جدید با موفقیت در پایگاه‌داده جنگو ثبت و به کاربران ارسال شد.',
                'data': UserNotificationSerializer(notif).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class NotificationUnreadCountAPIView(APIView):
    """
    دریافت تعداد اعلانات خوانده‌نشده
    """
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        if user:
            unread_count = UserNotification.objects.filter(
                Q(user=user) | Q(user__isnull=True),
                is_read=False
            ).count()
        else:
            unread_count = UserNotification.objects.filter(user__isnull=True, is_read=False).count()

        return Response({
            'status': 'success',
            'unread_count': unread_count
        }, status=status.HTTP_200_OK)


class NotificationMarkReadAPIView(APIView):
    """
    تغییر وضعیت خوانده‌شده یک اعلان
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        is_read_val = request.data.get('is_read', True)
        notif.is_read = bool(is_read_val)
        notif.save()

        return Response({
            'status': 'success',
            'message': 'وضعیت اعلان به روز شد.',
            'is_read': notif.is_read
        }, status=status.HTTP_200_OK)


class NotificationMarkAllReadAPIView(APIView):
    """
    علامت‌گذاری یک‌باره تمامی اعلانات به عنوان خوانده‌شده
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        if user:
            updated_count = UserNotification.objects.filter(
                Q(user=user) | Q(user__isnull=True),
                is_read=False
            ).update(is_read=True)
        else:
            updated_count = UserNotification.objects.filter(user__isnull=True, is_read=False).update(is_read=True)

        return Response({
            'status': 'success',
            'message': f'{updated_count} اعلان به عنوان خوانده‌شده ثبت شدند.'
        }, status=status.HTTP_200_OK)


class NotificationDeleteAPIView(APIView):
    """
    حذف اعلان از پایگاه‌داده توسط صندوق
    """
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        notif.delete()
        return Response({
            'status': 'success',
            'message': 'اعلان با موفقیت حذف گردید.'
        }, status=status.HTTP_200_OK)
`;

  const urlsCode = `"""
notifications/urls.py
مسیرهای صریح APIView جهت اتصال به صندوق و دریافت/ارسال اعلانات کاربران
"""

from django.urls import path
from .views import (
    NotificationListAPIView,
    NotificationCreateAPIView,
    NotificationUnreadCountAPIView,
    NotificationMarkReadAPIView,
    NotificationMarkAllReadAPIView,
    NotificationDeleteAPIView,
)

app_name = 'notifications'

urlpatterns = [
    # ۱. لیست و ثبت اعلانات
    path('list/', NotificationListAPIView.as_view(), name='notification-list'),
    path('create/', NotificationCreateAPIView.as_view(), name='notification-create'),
    path('unread-count/', NotificationUnreadCountAPIView.as_view(), name='notification-unread-count'),

    # ۲. تغییر وضعیت و حذف
    path('<int:pk>/mark-read/', NotificationMarkReadAPIView.as_view(), name='notification-mark-read'),
    path('mark-all-read/', NotificationMarkAllReadAPIView.as_view(), name='notification-mark-all-read'),
    path('<int:pk>/delete/', NotificationDeleteAPIView.as_view(), name='notification-delete'),
]
`;

  const notesCode = `## 📌 راهنمای اتصال صندوق فروشگاهی به سیستم نوتیفیکیشن جنگو

### 🚀 نحوه کارکرد:
۱. صندوق‌داران و مدیران از تب **«اعلانات و نوتیفیکیشن‌ها»** در پنل صندوق، مستقیماً بدون نیاز به ورود به جنگو ادمین پیام‌ها را ایجاد و ارسال می‌کنند.
۲. اعلان‌های نوع **تغییر نرخ و قیمت**، **وضعیت سفارشات**، **حسابداری و چک** و **اطلاعیه‌های عمومی انبار** با یک کلیک و با استفاده از قالب‌های آماده ارسال می‌شوند.
۳. در فرانت‌اند سایت، کاربران با کلیک بر روی آیکون زنگوله نوتیفیکیشن‌ها را به صورت همگام با دیتابیس دریافت می‌کنند.

---

### 💻 نمونه فراخوانی از صندوق (React TypeScript):

\`\`\`typescript
import { djangoCreateNotification } from './services/djangoApi';

// ارسال اعلان جدید از صندوق به همه کاربران سایت
await djangoCreateNotification({
  title: 'تغییر قیمت کارتن وینستون',
  message: 'نرخ جدید کارتن وینستون لایت در انبار مرکزی اعمال گردید.',
  notification_type: 'price',
  targetAudience: 'all'
}, crmConfig);
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="notifications"
      title="سیستم نوتیفیکیشن و اطلاعیه‌ها"
      titleEn="notifications / User Notifications App"
      badge="Alerts & Push"
      description="ماژول ارسال اعلان‌ها، هشدارهای تغییرات نرخ لحظه‌ای کارتن‌ها، وضعیت فاکتورها و اخبار انبار مرکزی به کاربران مستقیماً از پنل صندوق فروشگاهی."
      icon={<Bell className="w-6 h-6 text-purple-500" />}
      modelsCode={`from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User

class UserNotification(models.Model):
    class NotificationType(models.TextChoices):
        ORDER = 'order', _('Order Update (وضعیت سفارش)')
        PRICE = 'price', _('Price Alert (تغییر نرخ)')
        SYSTEM = 'system', _('System Announcement (اطلاعیه عمومی)')
        FINANCE = 'finance', _('Financial Alert (حسابداری و چک)')

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications', verbose_name=_("کاربر گیرنده (خالی برای عمومی)"))
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
        recipient = self.user.full_name if self.user else "عمومی (همه کاربران)"
        return f"[{self.notification_type}] {self.title} -> {recipient}"
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
    user_name = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()

    class Meta:
        model = UserNotification
        fields = ['id', 'user', 'user_name', 'user_phone', 'title', 'message', 'notification_type', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else 'همه کاربران سایت (عمومی)'

    def get_user_phone(self, obj):
        return obj.user.phone if obj.user else 'عمومی'
`}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};

