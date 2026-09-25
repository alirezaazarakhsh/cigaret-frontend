"""
pos/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PosRegisterViewSet, PosShiftViewSet, PosSaleViewSet

router = DefaultRouter()
router.register('registers', PosRegisterViewSet, basename='pos-register')
router.register('shifts', PosShiftViewSet, basename='pos-shift')
router.register('sales', PosSaleViewSet, basename='pos-sale')

urlpatterns = [
    path('', include(router.urls)),
]
