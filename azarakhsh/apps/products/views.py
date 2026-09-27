"""
products/views.py
ویوهای اختصاصی صریح با استفاده از APIView جهت مدیریت کاتالوگ محصولات، دسته‌بندی‌ها، هولوگرام‌ها، ویژگی‌های فنی و همگام‌سازی صندوق (POS Sync)
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework import filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import (
    Category,
    ProductBrand,
    ProductHologram,
    ProductAttribute,
    ProductAttributeValue,
    Product
)
from .serializers import (
    CategorySerializer,
    ProductBrandSerializer,
    ProductHologramSerializer,
    ProductAttributeSerializer,
    ProductAttributeValueSerializer,
    ProductSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer
)


class ProductBrandListCreateAPIView(APIView):
    """
    اندپوینت مدیریت برندها با قابلیت آپلود فایل لوگو (MultiPartParser) و مشاهده پیش‌نمایش لوگو
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت لیست برندهای کالا (عمومی)",
        responses={200: ProductBrandSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProductBrand.objects.all().order_by('-id')
        serializer = ProductBrandSerializer(queryset, many=True, context={'request': request})
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="افزودن برند جدید به همراه آپلود فایل تصویر لوگو (مدیریت)",
        request_body=ProductBrandSerializer,
        responses={201: ProductBrandSerializer}
    )
    def post(self, request):
        serializer = ProductBrandSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            brand = serializer.save()
            return Response({
                'status': 'success',
                'message': 'برند جدید با موفقیت به همراه لوگو ثبت شد.',
                'data': ProductBrandSerializer(brand, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductBrandDetailUpdateDeleteAPIView(APIView):
    """
    اندپوینت مشاهده، ویرایش (شامل جایگزینی فایل لوگو) و حذف برند
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات برند",
        responses={200: ProductBrandSerializer}
    )
    def get(self, request, pk):
        brand = get_object_or_404(ProductBrand, pk=pk)
        return Response({'status': 'success', 'data': ProductBrandSerializer(brand, context={'request': request}).data})

    @swagger_auto_schema(
        operation_summary="ویرایش برند و جایگزینی فایل لوگو (مدیریت)",
        request_body=ProductBrandSerializer,
        responses={200: ProductBrandSerializer}
    )
    def put(self, request, pk):
        brand = get_object_or_404(ProductBrand, pk=pk)
        serializer = ProductBrandSerializer(brand, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات برند و تصویر لوگو با موفقیت بروزرسانی شد.',
                'data': ProductBrandSerializer(updated, context={'request': request}).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="حذف برند (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        brand = get_object_or_404(ProductBrand, pk=pk)
        brand.delete()
        return Response({'status': 'success', 'message': 'برند مورد نظر حذف گردید.'})


class BrandViewSet(ModelViewSet):
    queryset = ProductBrand.objects.all()
    serializer_class = ProductBrandSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'name_en', 'country']
    ordering_fields = ['name', 'id']
    ordering = ['name']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


BrandListCreateAPIView = ProductBrandListCreateAPIView
BrandDetailUpdateDeleteAPIView = ProductBrandDetailUpdateDeleteAPIView


class CategoryListCreateAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت لیست دسته‌بندی‌های کالاها (عمومی)",
        responses={200: CategorySerializer(many=True)}
    )
    def get(self, request):
        queryset = Category.objects.all().order_by('-id')
        serializer = CategorySerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ایجاد دسته‌بندی جدید (مدیریت)",
        request_body=CategorySerializer,
        responses={201: CategorySerializer}
    )
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save()
            return Response({
                'status': 'success',
                'message': 'دسته‌بندی جدید با موفقیت ایجاد گردید.',
                'data': CategorySerializer(category).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailUpdateDeleteAPIView(APIView):
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات دسته‌بندی",
        responses={200: CategorySerializer}
    )
    def get(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        return Response({'status': 'success', 'data': CategorySerializer(category).data})

    @swagger_auto_schema(
        operation_summary="ویرایش دسته‌بندی (مدیریت)",
        request_body=CategorySerializer,
        responses={200: CategorySerializer}
    )
    def put(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات دسته‌بندی با موفقیت ویرایش شد.',
                'data': CategorySerializer(updated).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="حذف دسته‌بندی (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        category.delete()
        return Response({'status': 'success', 'message': 'دسته‌بندی با موفقیت حذف گردید.'})


class HologramListCreateAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت لیست هولوگرام‌های اصالت کالا",
        responses={200: ProductHologramSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProductHologram.objects.all().order_by('-created_at')
        serializer = ProductHologramSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ثبت هولوگرام اصالت جدید (مدیریت)",
        request_body=ProductHologramSerializer,
        responses={201: ProductHologramSerializer}
    )
    def post(self, request):
        serializer = ProductHologramSerializer(data=request.data)
        if serializer.is_valid():
            hologram = serializer.save()
            return Response({
                'status': 'success',
                'message': 'برچسب هولوگرام با موفقیت ثبت شد.',
                'data': ProductHologramSerializer(hologram).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HologramDetailUpdateDeleteAPIView(APIView):
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات هولوگرام اصالت",
        responses={200: ProductHologramSerializer}
    )
    def get(self, request, pk):
        hologram = get_object_or_404(ProductHologram, pk=pk)
        return Response({'status': 'success', 'data': ProductHologramSerializer(hologram).data})

    @swagger_auto_schema(
        operation_summary="ویرایش هولوگرام اصالت (مدیریت)",
        request_body=ProductHologramSerializer,
        responses={200: ProductHologramSerializer}
    )
    def put(self, request, pk):
        hologram = get_object_or_404(ProductHologram, pk=pk)
        serializer = ProductHologramSerializer(hologram, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات هولوگرام با موفقیت بروزرسانی شد.',
                'data': ProductHologramSerializer(updated).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="حذف هولوگرام اصالت (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        hologram = get_object_or_404(ProductHologram, pk=pk)
        hologram.delete()
        return Response({'status': 'success', 'message': 'هولوگرام مورد نظر حذف گردید.'})


class ProductAttributeListCreateAPIView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت لیست ویژگی‌ها و مشخصات فنی کالا",
        responses={200: ProductAttributeSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProductAttribute.objects.all().order_by('name')
        serializer = ProductAttributeSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="تعریف ویژگی جدید برای کالاها (مدیریت)",
        request_body=ProductAttributeSerializer,
        responses={201: ProductAttributeSerializer}
    )
    def post(self, request):
        serializer = ProductAttributeSerializer(data=request.data)
        if serializer.is_valid():
            attr = serializer.save()
            return Response({
                'status': 'success',
                'message': 'ویژگی جدید با موفقیت در سیستم ثبت گردید.',
                'data': ProductAttributeSerializer(attr).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductAttributeDetailUpdateDeleteAPIView(APIView):
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات تعریف ویژگی",
        responses={200: ProductAttributeSerializer}
    )
    def get(self, request, pk):
        attr = get_object_or_404(ProductAttribute, pk=pk)
        return Response({'status': 'success', 'data': ProductAttributeSerializer(attr).data})

    @swagger_auto_schema(
        operation_summary="ویرایش تعریف ویژگی (مدیریت)",
        request_body=ProductAttributeSerializer,
        responses={200: ProductAttributeSerializer}
    )
    def put(self, request, pk):
        attr = get_object_or_404(ProductAttribute, pk=pk)
        serializer = ProductAttributeSerializer(attr, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'مشخصات ویژگی با موفقیت بروز شد.',
                'data': ProductAttributeSerializer(updated).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="حذف تعریف ویژگی (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        attr = get_object_or_404(ProductAttribute, pk=pk)
        attr.delete()
        return Response({'status': 'success', 'message': 'ویژگی با موفقیت از سیستم حذف شد.'})


class ProductAttributeValuesSetAPIView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ثبت و بروزرسانی مقادیر ویژگی‌های فنی یک کالا (مدیریت)",
        responses={200: ProductSerializer}
    )
    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        attributes_data = request.data.get('attributes', [])

        for item in attributes_data:
            attr_id = item.get('attribute_id')
            if not attr_id:
                continue
            attribute = get_object_or_404(ProductAttribute, pk=attr_id)
            ProductAttributeValue.objects.update_or_create(
                product=product,
                attribute=attribute,
                defaults={
                    'value': item.get('value'),
                    'value_number': item.get('value_number'),
                    'value_boolean': item.get('value_boolean')
                }
            )

        return Response({
            'status': 'success',
            'message': 'مقادیر مشخصات فنی کالا با موفقیت ذخیره گردید.',
            'data': ProductSerializer(product).data
        }, status=status.HTTP_200_OK)


class ProductListAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت کاتالوگ محصولات آنلاین سایت (عمومی)",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        only_online = request.query_params.get('online_only') == 'true'
        if only_online:
            queryset = Product.objects.filter(
                is_active=True, 
                is_pos_only=False
            ).select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'key_features', 'tier_discounts', 'attributes_values__attribute')
        else:
            queryset = Product.objects.all().select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'key_features', 'tier_discounts', 'attributes_values__attribute')

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
            if str(category_id).isdigit():
                queryset = queryset.filter(category_id=int(category_id))
            else:
                queryset = queryset.filter(
                    Q(category__slug__iexact=category_id) |
                    Q(category__name__icontains=category_id)
                )

        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(carton_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(carton_price__lte=max_price)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(name_en__icontains=search) | 
                Q(barcode__icontains=search)
            )

        serializer = ProductSerializer(queryset, many=True, context={'request': request})
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        return ProductCreateAPIView().post(request)


class PosCatalogAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت کاتالوگ کامل صندوق حضوری شامل بارکد و کلیه اقلام",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.all().select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'key_features', 'tier_discounts', 'attributes_values__attribute')

        barcode = request.query_params.get('barcode')
        if barcode:
            queryset = queryset.filter(barcode=barcode.strip())

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(name_en__icontains=search) | 
                Q(barcode__icontains=search)
            )

        serializer = ProductSerializer(queryset, many=True, context={'request': request})
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class ProductFeaturedAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست پیشنهادهای ویژه صفحه اصلی",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.filter(is_active=True, is_featured=True, is_pos_only=False).select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'key_features', 'tier_discounts', 'attributes_values__attribute')
        serializer = ProductSerializer(queryset, many=True, context={'request': request})
        return Response({'status': 'success', 'count': queryset.count(), 'results': serializer.data})


class ProductCreateAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت ساختار اولیه فرم افزودن محصول",
        responses={200: openapi.Response('اطلاعات فرم ساخت محصول')}
    )
    def get(self, request):
        categories = Category.objects.all().values('id', 'name', 'slug', 'color')
        brands = ProductBrand.objects.all().values('id', 'name', 'slug', 'country')
        holograms = ProductHologram.objects.all().values('id', 'title', 'badge_text', 'trust_level')
        return Response({
            'status': 'success',
            'message': 'اطلاعات اولیه فرم افزودن محصول دریافت گردید.',
            'categories': list(categories),
            'brands': list(brands),
            'holograms': list(holograms),
            'defaults': {
                'carton_price': 0,
                'box_price': 0,
                'pack_price': 0,
                'boxes_per_carton': 50,
                'packs_per_box': 10,
                'stock_cartons': 0,
                'stock_boxes': 0,
                'min_order_carton': 1,
                'min_order_box': 1,
                'has_carton': True,
                'has_box': True,
                'has_pack': False,
                'is_box_only': False,
                'is_pos_only': False,
                'is_active': True,
            }
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="ثبت محصول جدید در کاتالوگ آنلاین / صندوق حضوری",
        request_body=ProductCreateUpdateSerializer,
        responses={201: ProductSerializer}
    )
    def post(self, request):
        serializer = ProductCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            target_scope = "صندوق حضوری" if product.is_pos_only else "سایت آنلاین و صندوق فروشگاهی"
            return Response({
                'status': 'success',
                'message': f'محصول جدید «{product.name}» با موفقیت در دیتابیس ثبت شد و به {target_scope} اضافه گردید.',
                'data': ProductSerializer(product).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': 'خطا در صحت‌سنجی اطلاعات ورودی محصول',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات کامل محصول به همراه گالری و ویژگی‌ها",
        responses={200: ProductDetailSerializer}
    )
    def get(self, request, pk):
        product = get_object_or_404(
            Product.objects.select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'attributes_values__attribute'), 
            pk=pk
        )
        serializer = ProductDetailSerializer(product, context={'request': request})
        return Response({'status': 'success', 'data': serializer.data})


class ProductUpdateAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="ویرایش اطلاعات محصول (مدیریت)",
        request_body=ProductCreateUpdateSerializer,
        responses={200: ProductDetailSerializer}
    )
    def put(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات کالا با موفقیت بروزرسانی گردید.',
                'data': ProductDetailSerializer(updated, context={'request': request}).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="ویرایش جزئی اطلاعات محصول (مدیریت)",
        request_body=ProductCreateUpdateSerializer,
        responses={200: ProductSerializer}
    )
    def patch(self, request, pk):
        return self.put(request, pk)


class ProductSyncPosStockAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="همگام‌سازی موجودی و کانال عرضه صندوق حضوری",
        responses={200: ProductSerializer}
    )
    def patch(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        cartons_delta = request.data.get('stock_cartons_delta')
        boxes_delta = request.data.get('stock_boxes_delta')
        is_pos_only = request.data.get('is_pos_only')

        if cartons_delta is not None:
            product.stock_cartons = max(0, product.stock_cartons + int(cartons_delta))
        if boxes_delta is not None:
            product.stock_boxes = max(0, product.stock_boxes + int(boxes_delta))
        if is_pos_only is not None:
            product.is_pos_only = bool(is_pos_only)

        product.save()
        return Response({
            'status': 'success',
            'message': 'موجودی و وضعیت صندوق با موفقیت اعمال شد.',
            'data': ProductSerializer(product).data
        })


class ProductDeleteAPIView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="حذف محصول از کاتالوگ (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response({'status': 'success', 'message': 'محصول با موفقیت از کاتالوگ حذف شد.'})


class TierDiscountTemplateListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        templates = [
            {
                "id": "tmpl-carton-standard",
                "title": "الگوی استاندارد کارتن (۳، ۵، ۱۰)",
                "tiers": [
                    {"unit_type": "carton", "min_quantity": 3, "discount_percent": 2.0},
                    {"unit_type": "carton", "min_quantity": 5, "discount_percent": 3.0},
                    {"unit_type": "carton", "min_quantity": 10, "discount_percent": 5.0},
                ]
            },
            {
                "id": "tmpl-box-standard",
                "title": "الگوی استاندارد باکس (۳، ۵، ۱۰)",
                "tiers": [
                    {"unit_type": "box", "min_quantity": 3, "discount_percent": 1.0},
                    {"unit_type": "box", "min_quantity": 5, "discount_percent": 1.5},
                    {"unit_type": "box", "min_quantity": 10, "discount_percent": 2.5},
                ]
            },
            {
                "id": "tmpl-wholesale-high",
                "title": "الگوی بنکداری و تیراژ بالا (۲۰، ۵۰، ۱۰۰)",
                "tiers": [
                    {"unit_type": "carton", "min_quantity": 20, "discount_percent": 6.0},
                    {"unit_type": "carton", "min_quantity": 50, "discount_percent": 8.0},
                    {"unit_type": "carton", "min_quantity": 100, "discount_percent": 10.0},
                ]
            }
        ]
        return Response(templates, status=status.HTTP_200_OK)
