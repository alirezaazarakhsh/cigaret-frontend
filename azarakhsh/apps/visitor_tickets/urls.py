"""
visitor_tickets/urls.py
مسیرهای صریح APIView جهت تیکتینگ ویزیتوران
"""
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
