"""
shipping/views.py
ویوهای استعلام تعرفه کرایه و روش‌های ترابری
"""
from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import ShippingMethod, ProvincialTariff
from .serializers import ShippingMethodSerializer, ProvincialTariffSerializer


class ShippingMethodViewSet(ReadOnlyModelViewSet):
    queryset = ShippingMethod.objects.filter(is_active=True)
    serializer_class = ShippingMethodSerializer


class ProvincialTariffViewSet(ReadOnlyModelViewSet):
    queryset = ProvincialTariff.objects.all()
    serializer_class = ProvincialTariffSerializer
