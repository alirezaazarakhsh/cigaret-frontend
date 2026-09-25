"""
tickets/urls.py
مسیرهای صریح APIView جهت لیست، ثبت، مشاهده و پاسخگویی به تیکت‌های پشتیبانی
حتماً دقت کنید متغیر urlpatterns به صورت آرایه [...] تعریف شده باشد.
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
    # ۱. لیست و ثبت تیکت جدید
    path('list/', TicketListAPIView.as_view(), name='ticket-list'),
    path('create/', TicketCreateAPIView.as_view(), name='ticket-create'),

    # ۲. جزئیات تیکت و ارسال پاسخ
    path('<int:pk>/', TicketDetailAPIView.as_view(), name='ticket-detail'),
    path('<int:pk>/reply/', TicketReplyAPIView.as_view(), name='ticket-reply'),
]
