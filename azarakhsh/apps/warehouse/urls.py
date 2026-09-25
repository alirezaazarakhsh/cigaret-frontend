"""
warehouse/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseStockViewSet

router = DefaultRouter()
router.register('stocks', WarehouseStockViewSet, basename='warehouse-stock')

urlpatterns = [
    path('', include(router.urls)),
]
