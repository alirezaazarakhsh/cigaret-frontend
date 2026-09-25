"""
visitors/urls.py
مسیرهای URL برای اپ ویزیتوران و باشگاه مشتریان
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitorProfileViewSet, RetailShopCustomerViewSet, VisitorCommissionLogViewSet

router = DefaultRouter()
router.register(r'profiles', VisitorProfileViewSet)
router.register(r'retail-shops', RetailShopCustomerViewSet)
router.register(r'commissions', VisitorCommissionLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
