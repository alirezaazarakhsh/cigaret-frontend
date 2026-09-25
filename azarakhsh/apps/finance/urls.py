"""
finance/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerLedgerViewSet, ChequeViewSet

router = DefaultRouter()
router.register('ledgers', CustomerLedgerViewSet, basename='customer-ledger')
router.register('cheques', ChequeViewSet, basename='cheque')

urlpatterns = [
    path('', include(router.urls)),
]
