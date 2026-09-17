"""
products/urls.py
مسیرهای صریح صادرشده برای APIView (بدون استفاده از Router یا ViewSet) جهت کاتالوگ، دسته‌بندی‌ها، هولوگرام‌ها و ویژگی‌های کالا
"""

from django.urls import path
from .views import (
    CategoryListCreateAPIView,
    CategoryDetailUpdateDeleteAPIView,
    BrandListCreateAPIView,
    BrandDetailUpdateDeleteAPIView,
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

app_name = 'products'

urlpatterns = [
    # ۱. دسته‌بندی‌ها
    path('categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailUpdateDeleteAPIView.as_view(), name='category-detail-update-delete'),

    # ۱.۵. برندهای کالا
    path('brands/', BrandListCreateAPIView.as_view(), name='brand-list-create'),
    path('brands/<int:pk>/', BrandDetailUpdateDeleteAPIView.as_view(), name='brand-detail-update-delete'),

    # ۲. هولوگرام و اصالت کالا
    path('holograms/', HologramListCreateAPIView.as_view(), name='hologram-list-create'),
    path('holograms/<int:pk>/', HologramDetailUpdateDeleteAPIView.as_view(), name='hologram-detail-update-delete'),

    # ۳. ویژگی‌ها و مشخصات فنی کالا
    path('attributes/', ProductAttributeListCreateAPIView.as_view(), name='attribute-list-create'),
    path('attributes/<int:pk>/', ProductAttributeDetailUpdateDeleteAPIView.as_view(), name='attribute-detail-update-delete'),
    path('<int:pk>/attributes/set/', ProductAttributeValuesSetAPIView.as_view(), name='product-attribute-values-set'),

    # ۴. کاتالوگ محصولات و همگام‌سازی صندوق (POS Sync)
    path('', ProductListAPIView.as_view(), name='product-list'),
    path('pos-catalog/', PosCatalogAPIView.as_view(), name='pos-catalog'),
    path('featured/', ProductFeaturedAPIView.as_view(), name='product-featured'),
    path('create/', ProductCreateAPIView.as_view(), name='product-create'),
    path('<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('<int:pk>/update/', ProductUpdateAPIView.as_view(), name='product-update'),
    path('<int:pk>/sync-pos-stock/', ProductSyncPosStockAPIView.as_view(), name='product-sync-pos-stock'),
    path('<int:pk>/delete/', ProductDeleteAPIView.as_view(), name='product-delete'),
]
