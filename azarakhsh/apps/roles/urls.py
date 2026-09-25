"""
roles/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StaffRoleViewSet

router = DefaultRouter()
router.register('staff', StaffRoleViewSet, basename='staff-role')

urlpatterns = [
    path('', include(router.urls)),
]
