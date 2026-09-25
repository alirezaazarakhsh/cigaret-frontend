"""
orders/urls.py
مسیرهای URL ثبت سفارش و رهگیری پیش‌فاکتور
"""
from django.urls import path
from .views import OrderCheckoutView, OrderTrackingView

urlpatterns = [
    path('checkout/', OrderCheckoutView.as_view(), name='order_checkout'),
    path('track/<str:tracking_code>/', OrderTrackingView.as_view(), name='order_track'),
]
