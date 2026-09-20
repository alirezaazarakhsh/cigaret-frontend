"""
products/serializers.py
سریالایزرهای DRF برای دسته‌بندی‌های درختی، هولوگرام، ویژگی‌های فنی و کاتالوگ محصولات (همگام با صندوق و آنلاین)
"""

from rest_framework import serializers
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

class ProductBrandSerializer(serializers.ModelSerializer):
    """
    سریالایزر برندهای کالا با پشتیبانی کامل از آپلود فایل و ذخیره توضیحات
    """
    slug = serializers.SlugField(required=False, allow_blank=True)
    products_count = serializers.SerializerMethodField()
    # تعریف صریح برای اطمینان از قابلیت نوشتن (writable)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = ProductBrand
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'logo',
            'country',
            'description',
            'products_count',
            'created_at',
            'updated_at'
        ]
        extra_kwargs = {
            'name_en': {'required': False, 'allow_blank': True, 'allow_null': True},
            'country': {'required': False, 'allow_blank': True, 'allow_null': True},
            'logo': {'required': False, 'allow_null': True},
        }

    def validate(self, attrs):
        if not attrs.get('slug'):
            base_name = attrs.get('name_en') or attrs.get('name') or ''
            generated_slug = slugify(base_name, allow_unicode=True)
            if not generated_slug:
                generated_slug = f"brand-{uuid.uuid4().hex[:8]}"
            attrs['slug'] = generated_slug
        return attrs

    def get_products_count(self, obj):
        # شمارش محصولات مرتبط با این برند
        return Product.objects.filter(brand=obj).count()


class CategorySerializer(serializers.ModelSerializer):
    """
    سریالایزر جامع دسته‌بندی با ۵ فیلد اصلی فرم (عنوان، نام لاتین، اسلاگ، رنگ شناسه، توضیحات)
    پشتیبانی از ایجاد خودکار اسلاگ و محاسبه تعداد محصولات
    """
    slug = serializers.SlugField(required=False, allow_blank=True)
    color_display = serializers.CharField(source='get_color_display', read_only=True)
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'color',
            'color_display',
            'description',
            'products_count',
            'created_at',
            'updated_at'
        ]
        extra_kwargs = {
            'name_en': {'required': False, 'allow_blank': True, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'color': {'required': False},
        }

    def validate(self, attrs):
        if not attrs.get('slug'):
            base_name = attrs.get('name_en') or attrs.get('name') or ''
            generated_slug = slugify(base_name, allow_unicode=True)
            if not generated_slug:
                generated_slug = f"cat-{uuid.uuid4().hex[:8]}"
            attrs['slug'] = generated_slug
        return attrs

    def get_products_count(self, obj):
        return obj.products.count()


class ProductHologramSerializer(serializers.ModelSerializer):
    security_level_display = serializers.CharField(source='get_security_level_display', read_only=True)

    class Meta:
        model = ProductHologram
        fields = [
            'id',
            'title',
            'issuer_org',
            'country_origin',
            'security_level',
            'security_level_display',
            'security_specs',
            'is_verified',
            'created_at',
            'updated_at'
        ]
        extra_kwargs = {
            'issuer_org': {'required': False, 'allow_blank': True, 'allow_null': True},
            'country_origin': {'required': False, 'allow_blank': True, 'allow_null': True},
            'security_specs': {'required': False, 'allow_blank': True, 'allow_null': True},
        }


class ProductAttributeSerializer(serializers.ModelSerializer):
    data_type_display = serializers.CharField(source='get_data_type_display', read_only=True)

    class Meta:
        model = ProductAttribute
        fields = [
            'id',
            'name',
            'name_en',
            'data_type',
            'data_type_display',
            'unit',
            'help_text',
            'created_at'
        ]


class ProductAttributeValueSerializer(serializers.ModelSerializer):
    attribute_name = serializers.CharField(source='attribute.name', read_only=True)
    attribute_name_en = serializers.CharField(source='attribute.name_en', read_only=True)
    unit = serializers.CharField(source='attribute.unit', read_only=True)
    data_type = serializers.CharField(source='attribute.data_type', read_only=True)

    class Meta:
        model = ProductAttributeValue
        fields = [
            'id',
            'attribute',
            'attribute_name',
            'attribute_name_en',
            'unit',
            'data_type',
            'value',
            'value_number',
            'value_boolean'
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'order']


class ProductKeyFeatureSerializer(serializers.ModelSerializer):
    """
    سریالایزر نقاط قوت و ویژگی‌های کلیدی کالا (Key Features)
    """
    class Meta:
        model = ProductKeyFeature
        fields = ['id', 'title', 'display_order']


class ProductTierDiscountSerializer(serializers.ModelSerializer):
    """
    سریالایزر تخفیفات پلکانی حجم عمده کالا
    """
    class Meta:
        model = ProductTierDiscount
        fields = ['id', 'min_quantity', 'discount_percent', 'discount_price_per_unit']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    attributes_values = ProductAttributeValueSerializer(many=True, read_only=True)
    key_features = ProductKeyFeatureSerializer(many=True, read_only=True)
    tier_discounts = ProductTierDiscountSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'brand',
            'barcode',
            'category',
            'category_name',
            'category_color',
            'hologram',
            'hologram_detail',
            'box_price',
            'boxes_per_carton',
            'carton_price',
            'pack_price',
            'packs_per_box',
            'purchase_price',
            'stock_cartons',
            'stock_boxes',
            'image',
            'gallery',
            'attributes_values',
            'key_features',
            'tier_discounts',
            'is_pos_only',
            'is_box_only',
            'has_carton',
            'has_box',
            'has_pack',
            'is_active',
            'is_featured',
            'created_at',
            'updated_at'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    attributes_values = ProductAttributeValueSerializer(many=True, read_only=True)
    key_features = ProductKeyFeatureSerializer(many=True, read_only=True)
    tier_discounts = ProductTierDiscountSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'brand',
            'barcode',
            'category',
            'category_detail',
            'hologram',
            'hologram_detail',
            'box_price',
            'boxes_per_carton',
            'carton_price',
            'pack_price',
            'packs_per_box',
            'purchase_price',
            'stock_cartons',
            'stock_boxes',
            'image',
            'gallery',
            'attributes_values',
            'key_features',
            'tier_discounts',
            'full_description',
            'excerpt',
            'is_pos_only',
            'is_box_only',
            'has_carton',
            'has_box',
            'has_pack',
            'is_active',
            'is_featured',
            'created_at',
            'updated_at'
        ]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    brand = serializers.PrimaryKeyRelatedField(
        queryset=ProductBrand.objects.all(),
        required=False,
        allow_null=True
    )
    key_features = ProductKeyFeatureSerializer(many=True, required=False)
    tier_discounts = ProductTierDiscountSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = [
            'name',
            'name_en',
            'slug',
            'brand',
            'barcode',
            'category',
            'hologram',
            'box_price',
            'boxes_per_carton',
            'carton_price',
            'pack_price',
            'packs_per_box',
            'purchase_price',
            'stock_cartons',
            'stock_boxes',
            'image',
            'full_description',
            'excerpt',
            'key_features',
            'tier_discounts',
            'is_pos_only',
            'is_box_only',
            'has_carton',
            'has_box',
            'has_pack',
            'is_active',
            'is_featured'
        ]

    def create(self, validated_data):
        key_features_data = validated_data.pop('key_features', [])
        tier_discounts_data = validated_data.pop('tier_discounts', [])
        product = Product.objects.create(**validated_data)
        
        for kf in key_features_data:
            ProductKeyFeature.objects.create(product=product, **kf)
            
        for td in tier_discounts_data:
            ProductTierDiscount.objects.create(product=product, **td)
            
        return product

    def update(self, instance, validated_data):
        key_features_data = validated_data.pop('key_features', None)
        tier_discounts_data = validated_data.pop('tier_discounts', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if key_features_data is not None:
            instance.key_features.all().delete()
            for kf in key_features_data:
                ProductKeyFeature.objects.create(product=instance, **kf)
                
        if tier_discounts_data is not None:
            instance.tier_discounts.all().delete()
            for td in tier_discounts_data:
                ProductTierDiscount.objects.create(product=instance, **td)
                
        return instance
