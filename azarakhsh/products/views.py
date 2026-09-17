"""
products/views.py
ویوهای اختصاصی صریح با استفاده از APIView (بدون ViewSet) جهت مدیریت کاتالوگ محصولات، دسته‌بندی‌ها، هولوگرام‌ها، ویژگی‌های فنی و همگام‌سازی صندوق (POS Sync)
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import (
    Category,
    ProductHologram,
    ProductAttribute,
    ProductAttributeValue,
    Product
)
from .serializers import (
    CategorySerializer,
    ProductHologramSerializer,
    ProductAttributeSerializer,
    ProductAttributeValueSerializer,
    ProductSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer
)


class CategoryListCreateAPIView(APIView):
    """
    اندپوینت مدیریت دسته‌بندی‌ها (دریافت لیست و ایجاد دسته‌بندی جدید)
    
    فیلدهای فرم ورودی (مطابق با رابط کاربری صندوق و مدیریت):
    ۱. عنوان دسته‌بندی (فارسی) * -> name (اجباری)
    ۲. نام لاتین (English) -> name_en (اختیاری)
    ۳. شناسه سیستمی (Slug / ID) -> slug (یکتا / در صورت خالی بودن خودکار تولید می‌شود)
    ۴. رنگ شناسه -> color (کد رنگ پالت انتخابی Choice)
    ۵. توضیحات کوتاه دسته‌بندی -> description (اختیاری)
    """
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
        operation_summary="ایجاد دسته‌بندی جدید با ۵ فیلد اصلی فرم (مدیریت)",
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
    """
    اندپوینت مشاهده، ویرایش و حذف یک دسته‌بندی مشخص بر اساس ID
    """
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
    """
    اندپوینت دریافت لیست هولوگرام‌ها و سطوح اصالت یا ثبت هولوگرام جدید با سطح اعتبار انتخابی (Choice)
    """
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
    """
    اندپوینت مشاهده، ویرایش و حذف برچسب هولوگرام اصالت کالا
    """
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
    """
    اندپوینت دریافت لیست ویژگی‌های کالا و تعریف ویژگی جدید با نوع داده انتخابی (Choice)
    """
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_summary="دریافت لیست ویژگی‌ها و مشخصات فنی کالا",
        responses={200: ProductAttributeSerializer(many=True)}
    )
    def get(self, request):
        queryset = ProductAttribute.objects.all().order_by('display_order', 'name')
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
    """
    اندپوینت مشاهده، ویرایش و حذف تعریف ویژگی مشخص
    """
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
    """
    اندپوینت ثبت و ویرایش دسته‌جمعی مقادیر ویژگی‌های فنی برای یک کالای مشخص
    """
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
    """
    اندپوینت کاتالوگ محصولات آنلاین سایت با فیلتر خودکار کالاهای فعال و غیرحضوری (is_pos_only=False)
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت کاتالوگ محصولات آنلاین سایت (عمومی)",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.filter(
            is_active=True, 
            is_pos_only=False
        ).select_related('category', 'hologram').prefetch_related('gallery', 'attributes_values__attribute')

        brand = request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand__icontains=brand)

        category_id = request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

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

        serializer = ProductSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class PosCatalogAPIView(APIView):
    """
    اندپوینت کاتالوگ کامل صندوق حضوری (POS) شامل اقلام آنلاین و اختصاصی صندوق (is_pos_only=True) و جستجوی اسکنر بارکد
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="دریافت کاتالوگ کامل صندوق حضوری شامل بارکد و کلیه اقلام",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.filter(is_active=True).select_related('category', 'hologram')

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

        serializer = ProductSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class ProductFeaturedAPIView(APIView):
    """
    اندپوینت دریافت لیست محصولات پیشنهاد ویژه صفحه اصلی
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت لیست پیشنهادهای ویژه صفحه اصلی",
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request):
        queryset = Product.objects.filter(is_active=True, is_featured=True, is_pos_only=False).select_related('category', 'hologram')
        serializer = ProductSerializer(queryset, many=True)
        return Response({'status': 'success', 'count': queryset.count(), 'results': serializer.data})


class ProductCreateAPIView(APIView):
    """
    اندپوینت ثبت محصول جدید در کاتالوگ آنلاین / صندوق حضوری (مخصوص ادمین)
    """
    permission_classes = [IsAdminUser]

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
                'message': f'محصول جدید با موفقیت ذخیره شد و به {target_scope} اضافه گردید.',
                'data': ProductSerializer(product).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailAPIView(APIView):
    """
    اندپوینت دریافت جزئیات کامل یک محصول بر اساس ID
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="دریافت جزئیات کامل محصول به همراه گالری و ویژگی‌ها",
        responses={200: ProductDetailSerializer}
    )
    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductDetailSerializer(product)
        return Response({'status': 'success', 'data': serializer.data})


class ProductUpdateAPIView(APIView):
    """
    اندپوینت ویرایش کامل یا جزئی اطلاعات محصول (مخصوص ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="ویرایش اطلاعات محصول (مدیریت)",
        request_body=ProductCreateUpdateSerializer,
        responses={200: ProductSerializer}
    )
    def put(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اطلاعات کالا با موفقیت بروزرسانی گردید.',
                'data': ProductSerializer(updated).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductSyncPosStockAPIView(APIView):
    """
    اندپوینت همگام‌سازی لحظه‌ای موجودی انبار و تغییر وضعیت اختصاصی صندوق (POS Stock Sync)
    """
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
    """
    اندپوینت حذف محصول از سیستم (مخصوص ادمین)
    """
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_summary="حذف محصول از کاتالوگ (مدیریت)",
        responses={200: openapi.Response('حذف موفقیت‌آمیز')}
    )
    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response({'status': 'success', 'message': 'محصول با موفقیت از کاتالوگ حذف شد.'})
