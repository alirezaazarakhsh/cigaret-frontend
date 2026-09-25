# 📦 مستندات و کدهای به‌روزرسانی‌شده اپلیکیشن `/azarakhsh/apps/products/`

این فایل شامل کدهای کامل، بهینه‌سازی‌شده و اصلاح‌شده برای `serializers.py` و `views.py` در مسیر `/azarakhsh/apps/products/` جهت رفع قطعی خطاهای `TypeError` و `405 Method Not Allowed` است.

---

## ۱. کد کامل `serializers.py` (مسیر: `/azarakhsh/apps/products/serializers.py`)

```python
from rest_framework import serializers
from django.db import transaction
from django.utils.text import slugify
import uuid
from .models import (
    Category,
    ProductBrand,
    ProductHologram,
    ProductAttribute,
    ProductAttributeValue,
    Product,
    ProductImage,
    ProductKeyFeature,
    ProductTierDiscount
)

def sync_product_attributes(product, applied_features):
    if not applied_features or not isinstance(applied_features, list):
        return
    for item in applied_features:
        if not isinstance(item, dict):
            continue
        attr_id = item.get('attribute_id') or item.get('id')
        attr_name = item.get('name') or item.get('title')
        val = item.get('value')
        
        attribute = None
        if attr_id and str(attr_id).isdigit():
            attribute = ProductAttribute.objects.filter(id=int(attr_id)).first()
        if not attribute and attr_name:
            name_clean = str(attr_name).strip()
            attribute = ProductAttribute.objects.filter(
                Q(name__iexact=name_clean) | Q(name_en__iexact=name_clean)
            ).first()
            if not attribute:
                attribute = ProductAttribute.objects.create(
                    name=name_clean,
                    name_en=slugify(name_clean, allow_unicode=True) or f"attr-{uuid.uuid4().hex[:6]}",
                    data_type='text'
                )
        if attribute:
            ProductAttributeValue.objects.update_or_create(
                product=product,
                attribute=attribute,
                defaults={'value': str(val) if val is not None else ''}
            )


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    name_fa = serializers.CharField(required=False, allow_blank=True, write_only=True)
    images = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    gallery_images = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    key_takeaways = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    tier_discounts = serializers.ListField(child=serializers.DictField(), required=False, write_only=True)
    applied_features = serializers.ListField(child=serializers.DictField(), required=False, write_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def to_internal_value(self, data):
        data_dict = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # نگاشت نام فارسی
        if 'name_fa' in data_dict and data_dict['name_fa']:
            data_dict['name'] = data_dict['name_fa']
        elif 'name' not in data_dict and 'title' in data_dict:
            data_dict['name'] = data_dict['title']

        # پردازش دسته‌بندی
        c_val = data_dict.get('category') or data_dict.get('category_id') or data_dict.get('categoryId')
        if c_val is not None and c_val != '':
            if isinstance(c_val, dict):
                c_id = c_val.get('id')
                c_name = c_val.get('name') or c_val.get('title') or c_val.get('slug')
                if c_id and str(c_id).isdigit() and Category.objects.filter(id=int(c_id)).exists():
                    data_dict['category'] = int(c_id)
                elif c_name:
                    cat_obj = Category.objects.filter(Q(slug=c_name) | Q(name=c_name) | Q(name_en=c_name)).first()
                    if not cat_obj:
                        cat_obj, _ = Category.objects.get_or_create(
                            name=str(c_name),
                            defaults={'slug': slugify(str(c_name), allow_unicode=True) or f"cat-{uuid.uuid4().hex[:6]}"}
                        )
                    data_dict['category'] = cat_obj.id
            elif isinstance(c_val, (int, str)):
                s_val = str(c_val).strip()
                if s_val.isdigit() and Category.objects.filter(id=int(s_val)).exists():
                    data_dict['category'] = int(s_val)
                elif s_val:
                    cat_obj = Category.objects.filter(Q(slug=s_val) | Q(name=s_val) | Q(name_en=s_val)).first()
                    if not cat_obj:
                        cat_obj, _ = Category.objects.get_or_create(
                            name=s_val,
                            defaults={'slug': slugify(s_val, allow_unicode=True) or f"cat-{uuid.uuid4().hex[:6]}"}
                        )
                    data_dict['category'] = cat_obj.id
        else:
            default_cat, _ = Category.objects.get_or_create(
                name='سیگار اورجینال',
                defaults={'slug': 'cigarettes', 'color': '#3B82F6'}
            )
            data_dict['category'] = default_cat.id

        # اسلاگ یکتا
        slug_val = data_dict.get('slug')
        if not slug_val and data_dict.get('name'):
            slug_val = slugify(data_dict.get('name_en') or data_dict.get('name'), allow_unicode=True) or f"prod-{uuid.uuid4().hex[:8]}"
        if slug_val:
            base_slug = slug_val
            counter = 1
            curr_id = self.instance.id if self.instance else None
            while Product.objects.filter(slug=slug_val).exclude(id=curr_id).exists():
                slug_val = f"{base_slug}-{counter}"
                counter += 1
            data_dict['slug'] = slug_val

        raw_feats = (
            data_dict.pop('applied_features', None) or 
            data_dict.pop('appliedFeatures', None) or 
            data_dict.pop('attributes_values', None)
        )
        self._raw_applied_features = raw_feats

        return super().to_internal_value(data_dict)

    def create(self, validated_data):
        name_fa_val = validated_data.pop('name_fa', None)
        if name_fa_val and not validated_data.get('name'):
            validated_data['name'] = name_fa_val
        validated_data.pop('images', None)
        validated_data.pop('key_features', None)
        validated_data.pop('applied_features', None)
        gallery_images = validated_data.pop('gallery_images', [])
        key_takeaways = validated_data.pop('key_takeaways', [])
        tier_discounts = validated_data.pop('tier_discounts', [])
        applied_features = getattr(self, '_raw_applied_features', None)

        with transaction.atomic():
            product = super().create(validated_data)

            for idx, img_src in enumerate(gallery_images):
                if img_src:
                    ProductImage.objects.create(product=product, image=img_src, order=idx)

            for idx, feature_text in enumerate(key_takeaways):
                if feature_text:
                    ProductKeyFeature.objects.create(product=product, title=feature_text, order=idx)

            for td in tier_discounts:
                if isinstance(td, dict) and td.get('min_quantity') and td.get('discount_percent'):
                    try:
                        ProductTierDiscount.objects.create(
                            product=product,
                            min_quantity=int(td['min_quantity']),
                            discount_percent=float(td['discount_percent']),
                            discount_price_per_unit=int(td.get('discount_price_per_unit') or 0) or None
                        )
                    except Exception:
                        pass

            if applied_features:
                sync_product_attributes(product, applied_features)

            return product

    def update(self, instance, validated_data):
        name_fa_val = validated_data.pop('name_fa', None)
        if name_fa_val and not validated_data.get('name'):
            validated_data['name'] = name_fa_val
        validated_data.pop('images', None)
        validated_data.pop('key_features', None)
        validated_data.pop('applied_features', None)
        gallery_images = validated_data.pop('gallery_images', None)
        key_takeaways = validated_data.pop('key_takeaways', None)
        tier_discounts = validated_data.pop('tier_discounts', None)
        applied_features = getattr(self, '_raw_applied_features', None)

        with transaction.atomic():
            product = super().update(instance, validated_data)

            if gallery_images is not None:
                instance.gallery.all().delete()
                for idx, img_src in enumerate(gallery_images):
                    if img_src:
                        ProductImage.objects.create(product=product, image=img_src, order=idx)

            if key_takeaways is not None:
                instance.key_features.all().delete()
                for idx, feature_text in enumerate(key_takeaways):
                    if feature_text:
                        ProductKeyFeature.objects.create(product=product, title=feature_text, order=idx)

            if tier_discounts is not None:
                instance.tier_discounts.all().delete()
                for td in tier_discounts:
                    if isinstance(td, dict) and td.get('min_quantity') and td.get('discount_percent'):
                        try:
                            ProductTierDiscount.objects.create(
                                product=product,
                                min_quantity=int(td['min_quantity']),
                                discount_percent=float(td['discount_percent']),
                                discount_price_per_unit=int(td.get('discount_price_per_unit') or 0) or None
                            )
                        except Exception:
                            pass

            if applied_features is not None:
                sync_product_attributes(product, applied_features)

            return product
```

---

## ۲. کد کامل `views.py` (مسیر: `/azarakhsh/apps/products/views.py`)
اضافه شدن متد `post` به `ProductListAPIView` جهت رفع خطای `405 Method Not Allowed`:

```python
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
        ).select_related('category', 'brand', 'hologram').prefetch_related('gallery', 'attributes_values__attribute')

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

    def post(self, request):
        return ProductCreateAPIView().post(request)
```
