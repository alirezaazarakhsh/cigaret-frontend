"""
reports/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalesAnalyticsViewSet

router = DefaultRouter()
router.register('analytics', SalesAnalyticsViewSet, basename='sales-analytics')

urlpatterns = [
    path('', include(router.urls)),
]
