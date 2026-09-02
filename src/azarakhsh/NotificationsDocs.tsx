import React from 'react';
import { Bell } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';

export const NotificationsDocs: React.FC = () => {
  const erdTables: TableErdMeta[] = [
    {
      name: 'notifications_usernotification',
      verboseName: 'نوتیفیکیشن‌ها و اطلاعیه‌های کاربران',
      description: 'ارسال هشدارها، وضعیت سفارشات، تغییرات نرخ و اطلاعیه‌های مهم انبار به کاربران سایت و ویزیتوران از طریق پنل صندوق فروشگاهی',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'user_id', type: 'ForeignKey(User, null=True, blank=True)', isFk: true, fkTarget: 'accounts_user', verbose: 'کاربر گیرنده (خالی برای اطلاعیه سراسری)' },
        { name: 'title', type: 'CharField(max_length=200)', verbose: 'عنوان اطلاعیه' },
        { name: 'message', type: 'TextField', verbose: 'متن پیام' },
        { name: 'notification_type', type: 'CharField(choices: system, price, order, finance)', verbose: 'نوع نوتیفیکیشن' },
        { name: 'target_audience', type: 'CharField(choices: all, customers, visitors, direct)', verbose: 'مخاطب هدف' },
        { name: 'is_read', type: 'BooleanField(default=False)', verbose: 'خوانده شده' },
        { name: 'created_at', type: 'DateTimeField(auto_now_add=True)', verbose: 'تاریخ ثبت و ارسال' },
        { name: 'updated_at', type: 'DateTimeField(auto_now=True)', verbose: 'تاریخ آخرین ویرایش' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/notifications/list/',
      auth: 'AllowAny / IsAuthenticated',
      description: 'دریافت فهرست نوتیفیکیشن‌ها با امکان فیلتر بر اساس نوع (type)، مخاطب (audience)، وضعیت خوانده‌شده (is_read) و جستجو'
    },
    {
      method: 'GET',
      path: '/api/v1/notifications/unread-count/',
      auth: 'AllowAny / IsAuthenticated',
      description: 'دریافت تعداد پیام‌های خوانده‌نشده جهت نمایش عدد زنگوله نوتیفیکیشن سایت'
    },
    {
      method: 'POST',
      path: '/api/v1/notifications/create/',
      auth: 'AllowAny / IsAuthenticated (Staff/POS)',
      description: 'ثبت و ارسال آنی نوتیفیکیشن جدید از صندوق به کاربران سایت (سراسری، مشتریان عمومی، ویزیتوران، یا اختصاصی)'
    },
    {
      method: 'GET',
      path: '/api/v1/notifications/{id}/',
      auth: 'AllowAny / IsAuthenticated',
      description: 'دریافت جزئیات کامل یک اعلان با شناسه مشخص'
    },
    {
      method: 'PUT',
      path: '/api/v1/notifications/{id}/',
      auth: 'AllowAny / IsAuthenticated (Staff/POS)',
      description: 'ویرایش و بروزرسانی کامل یا جزئی عنوان، متن، نوع یا مخاطب اعلان در پایگاه‌داده'
    },
    {
      method: 'POST',
      path: '/api/v1/notifications/{id}/mark-read/',
      auth: 'AllowAny / IsAuthenticated',
      description: 'علامت‌گذاری اعلان مشخص به عنوان خوانده‌شده یا خوانده‌نشده'
    },
    {
      method: 'POST',
      path: '/api/v1/notifications/mark-all-read/',
      auth: 'AllowAny / IsAuthenticated',
      description: 'علامت‌گذاری تمامی اعلانات به عنوان خوانده‌شده'
    },
    {
      method: 'DELETE',
      path: '/api/v1/notifications/{id}/',
      auth: 'AllowAny / IsAuthenticated (Staff/POS)',
      description: 'حذف دائمی اعلان از پایگاه‌داده جنگو'
    },
    {
      method: 'DELETE',
      path: '/api/v1/notifications/{id}/delete/',
      auth: 'AllowAny / IsAuthenticated (Staff/POS)',
      description: 'مسیر اختصاصی حذف اعلان جهت سازگاری کامل'
    }
  ];

  const modelsCode = `from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class UserNotification(models.Model):
    """
    مدل اصلی نوتیفیکیشن‌ها و اعلانات سامانه انبار سیگار
    پشتیبانی از انواع اعلانات، تعیین مخاطب هدف (عمومی، مشتریان، ویزیتوران، فردی) و تاریخ شمسی
    """
    class NotificationType(models.TextChoices):
        ORDER = 'order', _('وضعیت سفارش (Order)')
        PRICE = 'price', _('تغییر نرخ و قیمت (Price Alert)')
        SYSTEM = 'system', _('اطلاعیه عمومی انبار (System)')
        FINANCE = 'finance', _('حسابداری و چک (Finance)')

    class TargetAudience(models.TextChoices):
        ALL = 'all', _('همه کاربران سامانه (سراسری)')
        CUSTOMERS = 'customers', _('مشتریان عمومی و مغازه‌داران')
        VISITORS = 'visitors', _('سفیران فروش و ویزیتوران')
        DIRECT = 'direct', _('کاربر اختصاصی')

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_("کاربر گیرنده (خالی برای اطلاعیه سراسری)")
    )
    title = models.CharField(_("عنوان اطلاعیه"), max_length=200)
    message = models.TextField(_("متن پیام"))
    notification_type = models.CharField(
        _("نوع اعلان"),
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM
    )
    target_audience = models.CharField(
        _("مخاطب هدف"),
        max_length=20,
        choices=TargetAudience.choices,
        default=TargetAudience.ALL
    )
    is_read = models.BooleanField(_("خوانده شده"), default=False)
    created_at = models.DateTimeField(_("تاریخ ثبت و ارسال"), auto_now_add=True)
    updated_at = models.DateTimeField(_("آخرین به‌روزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("نوتیفیکیشن کاربر")
        verbose_name_plural = _("مدیریت نوتیفیکیشن‌ها و اطلاعیه‌ها")
        ordering = ['-created_at']

    def __str__(self):
        recipient = self.user.full_name if self.user else f"مخاطب: {self.get_target_audience_display()}"
        return f"[{self.get_notification_type_display()}] {self.title} -> {recipient}"
`;

  const adminCode = `from django.contrib import admin
from .models import UserNotification


@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user_display', 'notification_type', 'target_audience', 'is_read', 'created_at')
    list_filter = ('notification_type', 'target_audience', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__phone', 'user__full_name')
    list_editable = ('is_read',)
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 25

    @admin.display(description='گیرنده پیام')
    def user_display(self, obj):
        if obj.user:
            return f"{obj.user.full_name} ({obj.user.phone})"
        return obj.get_target_audience_display()
`;

  const serializersCode = `from rest_framework import serializers
from .models import UserNotification

try:
    import jdatetime
except ImportError:
    jdatetime = None


class UserNotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()
    created_at_jalali = serializers.SerializerMethodField()

    class Meta:
        model = UserNotification
        fields = [
            'id',
            'user',
            'user_id',
            'user_name',
            'user_phone',
            'title',
            'message',
            'notification_type',
            'target_audience',
            'is_read',
            'created_at',
            'created_at_jalali',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.full_name or obj.user.phone
        if obj.target_audience == 'visitors':
            return 'کلیه سفیران فروش (ویزیتوران)'
        if obj.target_audience == 'customers':
            return 'مشتریان عمومی و مغازه‌داران'
        return 'همه کاربران سامانه (عمومی)'

    def get_user_phone(self, obj):
        if obj.user:
            return obj.user.phone
        if obj.target_audience == 'visitors':
            return 'ویزیتوران'
        if obj.target_audience == 'customers':
            return 'مشتریان عمومی'
        return 'عمومی'

    def get_created_at_jalali(self, obj):
        if not obj.created_at:
            return ''
        if jdatetime:
            try:
                j_date = jdatetime.datetime.fromgregorian(datetime=obj.created_at)
                return j_date.strftime('%Y/%m/%d %H:%M')
            except Exception:
                pass
        return obj.created_at.strftime('%Y-%m-%d %H:%M')
`;

  const viewsCode = `"""
notifications/views.py
ویوهای اختصاصی صریح با استفاده از APIView جهت اتصال کامل صندوق به پایگاه‌داده اعلانات
پشتیبانی از CRUD کامل: دریافت لیست فیلترشده، ثبت اعلان جدید، ویرایش، تغییر وضعیت، حذف و شمارش
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import UserNotification
from .serializers import UserNotificationSerializer


class NotificationListAPIView(APIView):
    """
    GET /api/v1/notifications/list/
    دریافت لیست اعلانات و اطلاعیه‌ها با فیلتر بر اساس نوع، مخاطب، وضعیت خوانده‌شده و جستجو
    """
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        notif_type = request.query_params.get('type')
        audience = request.query_params.get('audience')
        is_read = request.query_params.get('is_read')
        search = request.query_params.get('search')

        if user and getattr(user, 'is_staff', False):
            queryset = UserNotification.objects.all()
        elif user:
            queryset = UserNotification.objects.filter(Q(user=user) | Q(user__isnull=True))
        else:
            queryset = UserNotification.objects.all()

        if notif_type and notif_type != 'all':
            queryset = queryset.filter(notification_type=notif_type)

        if audience and audience != 'all':
            queryset = queryset.filter(target_audience=audience)

        if is_read is not None and is_read != '' and is_read != 'all':
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
    POST /api/v1/notifications/create/
    ثبت و ارسال آنی نوتیفیکیشن از صندوق فروشگاهی به دیتابیس جنگو
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserNotificationSerializer(data=request.data)
        if serializer.is_valid():
            notif = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اعلان جدید با موفقیت در پایگاه‌داده جنگو ثبت و ذخیره شد.',
                'data': UserNotificationSerializer(notif).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class NotificationDetailAPIView(APIView):
    """
    GET, PUT, PATCH, DELETE /api/v1/notifications/<id>/
    مشاهده جزئیات، ویرایش کامل/جزئی و حذف اعلان
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        return Response({
            'status': 'success',
            'data': UserNotificationSerializer(notif).data
        }, status=status.HTTP_200_OK)

    def put(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        serializer = UserNotificationSerializer(notif, data=request.data, partial=True)
        if serializer.is_valid():
            saved = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اعلان با موفقیت ویرایش و بروزرسانی شد.',
                'data': UserNotificationSerializer(saved).data
            }, status=status.HTTP_200_OK)
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        notif.delete()
        return Response({
            'status': 'success',
            'message': 'اعلان با موفقیت از پایگاه‌داده حذف گردید.'
        }, status=status.HTTP_200_OK)


class NotificationUnreadCountAPIView(APIView):
    """
    GET /api/v1/notifications/unread-count/
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
            unread_count = UserNotification.objects.filter(is_read=False).count()

        return Response({
            'status': 'success',
            'unread_count': unread_count
        }, status=status.HTTP_200_OK)


class NotificationMarkReadAPIView(APIView):
    """
    POST /api/v1/notifications/<id>/mark-read/
    تغییر وضعیت خوانده‌شده یک اعلان
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        is_read_val = request.data.get('is_read', True)
        notif.is_read = bool(is_read_val)
        notif.save(update_fields=['is_read', 'updated_at'])

        return Response({
            'status': 'success',
            'message': 'وضعیت اعلان با موفقیت به‌روزرسانی شد.',
            'is_read': notif.is_read
        }, status=status.HTTP_200_OK)


class NotificationMarkAllReadAPIView(APIView):
    """
    POST /api/v1/notifications/mark-all-read/
    علامت‌گذاری یک‌باره تمامی اعلانات به عنوان خوانده‌شده
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        if user and not getattr(user, 'is_staff', False):
            updated_count = UserNotification.objects.filter(
                Q(user=user) | Q(user__isnull=True),
                is_read=False
            ).update(is_read=True)
        else:
            updated_count = UserNotification.objects.filter(is_read=False).update(is_read=True)

        return Response({
            'status': 'success',
            'message': f'{updated_count} اعلان به عنوان خوانده‌شده ثبت شدند.'
        }, status=status.HTTP_200_OK)


class NotificationDeleteAPIView(APIView):
    """
    DELETE /api/v1/notifications/<id>/delete/
    حذف اعلان با مسیر اختصاصی جهت سازگاری کامل
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
مسیرهای صریح APIView جهت اتصال به صندوق و دریافت، ارسال، ویرایش و حذف اعلانات کاربران
"""

from django.urls import path
from .views import (
    NotificationListAPIView,
    NotificationCreateAPIView,
    NotificationDetailAPIView,
    NotificationUnreadCountAPIView,
    NotificationMarkReadAPIView,
    NotificationMarkAllReadAPIView,
    NotificationDeleteAPIView,
)

app_name = 'notifications'

urlpatterns = [
    # ۱. فهرست و ثبت اعلان جدید
    path('list/', NotificationListAPIView.as_view(), name='notification-list'),
    path('create/', NotificationCreateAPIView.as_view(), name='notification-create'),
    path('unread-count/', NotificationUnreadCountAPIView.as_view(), name='notification-unread-count'),

    # ۲. مشاهده جزئیات، ویرایش و حذف (CRUD)
    path('<int:pk>/', NotificationDetailAPIView.as_view(), name='notification-detail'),

    # ۳. عملیات خوانده‌شده و حذف اختصاصی
    path('<int:pk>/mark-read/', NotificationMarkReadAPIView.as_view(), name='notification-mark-read'),
    path('mark-all-read/', NotificationMarkAllReadAPIView.as_view(), name='notification-mark-all-read'),
    path('<int:pk>/delete/', NotificationDeleteAPIView.as_view(), name='notification-delete'),
]
`;

  const notesCode = `## 📌 راهنمای جامع اتصال صندوق فروشگاهی به سیستم اعلانات جنگو

### 🚀 قابلیت‌های اتصال:
۱. **ایجاد اعلان از صندوق:** صندوق‌داران و مدیران بدون نیاز به ورود به ادمین جنگو، مستقیماً از تب **«مرکز ارسال و پایش نوتیفیکیشن»** اعلان ارسال می‌کنند.
۲. **ویرایش اعلان:** امکان اصلاح عنوان، متن، نوع و مخاطب اعلان‌های ثبت‌شده با دکمه «ویرایش» و ذخیره آنی در دیتابیس جنگو.
۳. **قالب‌های آماده یک‌کلیکه:** قالب‌های اختصاصی برای تغییر نرخ کارتن‌ها، وضعیت سفارش، شارژ انبار، تسویه پورسانت و بونوس ویزیتوران.
۴. **تفکیک مخاطبان:** ارسال به کلیه مشتریان عمومی، کلیه ویزیتوران بازاریاب، یا ارسال پیام مستقیم به یک مشتری/ویزیتور مشخص.
۵. **حذف و تغییر وضعیت خوانده‌شده:** امکان تغییر وضعیت دیده‌شدن و حذف از پایگاه‌داده با بازخورد آنی.

---

### 💻 نمونه فراخوانی از فرانت‌اند React TypeScript:

\`\`\`typescript
import { djangoCreateNotification, djangoUpdateNotification, djangoDeleteNotification } from './services/djangoApi';

// ۱. ایجاد و ارسال اعلان جدید
const newNotif = await djangoCreateNotification({
  title: 'تغییر نرخ کارتن وینستون و بهمن',
  message: 'نرخ لحظه‌ای انواع کارتن وینستون لایت و بهمن در انبار مرکزی بروزرسانی گردید.',
  notification_type: 'price',
  targetAudience: 'customers'
}, crmConfig);

// ۲. ویرایش اعلان در پایگاه‌داده
await djangoUpdateNotification(newNotif.id, {
  title: 'بروزرسانی نهایی نرخ کارتن وینستون',
  message: 'متن اصلاح‌شده با احتساب تخفیف نقدی',
  notification_type: 'price',
  targetAudience: 'customers'
}, crmConfig);

// ۳. حذف اعلان از دیتابیس
await djangoDeleteNotification(newNotif.id, crmConfig);
\`\`\`
`;

  return (
    <AppDocTemplate
      appFolder="notifications"
      title="سیستم نوتیفیکیشن و اطلاعیه‌ها"
      titleEn="notifications / User Notifications App"
      badge="Alerts & Push"
      description="ماژول ارسال اعلان‌ها، هشدارهای تغییرات نرخ لحظه‌ای کارتن‌ها، وضعیت فاکتورها، واریز پورسانت و اخبار انبار مرکزی به کاربران و ویزیتوران مستقیماً از پنل صندوق فروشگاهی."
      icon={<Bell className="w-6 h-6 text-purple-500" />}
      modelsCode={modelsCode}
      adminCode={adminCode}
      serializersCode={serializersCode}
      viewsCode={viewsCode}
      urlsCode={urlsCode}
      notesCode={notesCode}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};
