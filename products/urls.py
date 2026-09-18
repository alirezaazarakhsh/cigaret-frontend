from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductBrandViewSet

router = DefaultRouter()
router.register(r'brands', ProductBrandViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
