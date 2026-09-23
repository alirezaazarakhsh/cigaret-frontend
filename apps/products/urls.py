"""
products/urls.py
مسیرهای جامع REST API برای دسته‌بندی‌ها، برندها، هولوگرام، ویژگی‌ها، کاتالوگ محصولات و صندوق (POS Sync)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BrandViewSet,
    ProductBrandListCreateAPIView,
    ProductBrandDetailUpdateDeleteAPIView,
    CategoryListCreateAPIView,
    CategoryDetailUpdateDeleteAPIView,
    HologramListCreateAPIView,
    HologramDetailUpdateDeleteAPIView,
    ProductAttributeListCreateAPIView,
    ProductAttributeDetailUpdateDeleteAPIView,
    ProductAttributeValuesSetAPIView,
    ProductListAPIView,
    PosCatalogAPIView,
    ProductFeaturedAPIView,
    ProductCreateAPIView,
    ProductDetailAPIView,
    ProductUpdateAPIView,
    ProductSyncPosStockAPIView,
    ProductDeleteAPIView,
)

router = DefaultRouter()
router.register(r'brands-router', BrandViewSet, basename='brand-viewset')

urlpatterns = [
    # روتر اختیاری ویوست برند
    path('', include(router.urls)),

    # برندها (APIView)
    path('brands/', ProductBrandListCreateAPIView.as_view(), name='product-brand-list-create'),
    path('brands/<int:pk>/', ProductBrandDetailUpdateDeleteAPIView.as_view(), name='product-brand-detail'),

    # دسته‌بندی‌ها (APIView)
    path('categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailUpdateDeleteAPIView.as_view(), name='category-detail'),

    # هولوگرام‌ها (APIView)
    path('holograms/', HologramListCreateAPIView.as_view(), name='hologram-list-create'),
    path('holograms/<int:pk>/', HologramDetailUpdateDeleteAPIView.as_view(), name='hologram-detail'),

    # ویژگی‌های فنی (APIView)
    path('attributes/', ProductAttributeListCreateAPIView.as_view(), name='attribute-list-create'),
    path('attributes/<int:pk>/', ProductAttributeDetailUpdateDeleteAPIView.as_view(), name='attribute-detail'),
    path('items/<int:pk>/attributes/', ProductAttributeValuesSetAPIView.as_view(), name='product-attribute-values-set'),

    # مسیرهای ثبت و افزودن محصول جدید (همگام با products/product/add/ و shopmanage/products)
    path('product/add/', ProductCreateAPIView.as_view(), name='product-add'),
    path('products/product/add/', ProductCreateAPIView.as_view(), name='product-product-add'),
    path('products/add/', ProductCreateAPIView.as_view(), name='products-add'),
    path('add/', ProductCreateAPIView.as_view(), name='product-add-direct'),
    path('create/', ProductCreateAPIView.as_view(), name='product-create-short'),

    # کاتالوگ محصولات، پیشنهاد ویژه و صندوق (APIView)
    path('items/', ProductListAPIView.as_view(), name='product-list'),
    path('items/create/', ProductCreateAPIView.as_view(), name='product-create'),
    path('items/featured/', ProductFeaturedAPIView.as_view(), name='product-featured'),
    path('items/pos-catalog/', PosCatalogAPIView.as_view(), name='product-pos-catalog'),
    path('items/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('items/<int:pk>/update/', ProductUpdateAPIView.as_view(), name='product-update'),
    path('items/<int:pk>/delete/', ProductDeleteAPIView.as_view(), name='product-delete'),
    path('items/<int:pk>/pos-sync-stock/', ProductSyncPosStockAPIView.as_view(), name='product-pos-sync-stock'),

    # مسیرهای میان‌بر جهت سازگاری کامل با درخواست‌های مستقیم فرانت‌اند
    path('products/', ProductListAPIView.as_view(), name='products-direct-list'),
    path('<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail-short'),
    path('<int:pk>/update/', ProductUpdateAPIView.as_view(), name='product-update-short'),
    path('<int:pk>/delete/', ProductDeleteAPIView.as_view(), name='product-delete-short'),
    path('', ProductListAPIView.as_view(), name='product-list-root'),
]
