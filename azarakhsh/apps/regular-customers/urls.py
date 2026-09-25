from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerTierViewSet,
    CustomerProfileViewSet,
    BankDepositSlipViewSet,
    WalletTransactionViewSet
)

router = DefaultRouter()
router.register(r'tiers', CustomerTierViewSet, basename='customer-tier')
router.register(r'customers', CustomerProfileViewSet, basename='customer-profile')
router.register(r'deposit-slips', BankDepositSlipViewSet, basename='deposit-slip')
router.register(r'wallet-transactions', WalletTransactionViewSet, basename='wallet-transaction')

urlpatterns = [
    path('api/azarakhsh/', include(router.urls)),
]
