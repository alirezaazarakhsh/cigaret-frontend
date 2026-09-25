"""
shipping/urls.py
مسیرهای URL تعرفه باربری
"""
from rest_framework.routers import DefaultRouter
from .views import ShippingMethodViewSet, ProvincialTariffViewSet

router = DefaultRouter()
router.register(r'methods', ShippingMethodViewSet, basename='shipping_method')
router.register(r'tariffs', ProvincialTariffViewSet, basename='provincial_tariff')

urlpatterns = router.urls
