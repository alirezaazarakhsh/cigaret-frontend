"""
products/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت کاتالوگ محصولات، دسته‌بندی‌ها، هولوگرام‌ها، ویژگی‌های فنی و همگام‌سازی صندوق (POS Sync)
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema

from .models import (
    Category,
    ProductBrand,
    ProductHologram,
    Product,
)
from .serializers import (
    ProductSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
)


class ProductListAPIView(APIView):
    """
    اندپوینت کاتالوگ محصولات آنلاین سایت
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت کاتالوگ محصولات آنلاین سایت (عمومی)",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        # بررسی دسترسی ادمین برای دیدن همه محصولات (حتی غیرفعال)
        show_all = request.user and request.user.is_staff
        if show_all:
            queryset = Product.objects.all().select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'attributes_values__attribute')
        else:
            # نمایش محصولات فعال و غیر صندوقی در سایت آنلاین
            queryset = Product.objects.filter(
                is_active=True, 
                is_pos_only=False
            ).select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'attributes_values__attribute')

        # فیلترها (برند، دسته‌بندی، قیمت، جستجو)
        brand = request.query_params.get('brand')
        if brand:
            if str(brand).isdigit():
                queryset = queryset.filter(brand_id=int(brand))
            else:
                queryset = queryset.filter(
                    Q(brand__name__icontains=brand) | 
                    Q(brand__name_en__icontains=brand) | 
                    Q(brand__slug__iexact=brand)
                )

        category_id = request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(name_en__icontains=search) | 
                Q(barcode__icontains=search)
            )

        serializer = ProductSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        return ProductCreateAPIView().post(request)


class ProductCreateAPIView(APIView):
    """
    اندپوینت ثبت محصول جدید
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ثبت محصول جدید",
        request_body=ProductCreateUpdateSerializer,
        responses={201: ProductSerializer}
    )
    def post(self, request):
        serializer = ProductCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            return Response({
                'status': 'success',
                'message': f'محصول «{product.name}» با موفقیت ثبت شد.',
                'data': ProductSerializer(product).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailAPIView(APIView):
    """
    دریافت جزئیات کامل محصول
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات محصول",
        responses={200: ProductDetailSerializer}
    )
    def get(self, request, pk):
        product = get_object_or_404(
            Product.objects.select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'attributes_values__attribute'), 
            pk=pk
        )
        serializer = ProductDetailSerializer(product)
        return Response({'status': 'success', 'data': serializer.data})
