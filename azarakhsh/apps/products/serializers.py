"""
products/serializers.py
سریالایزرهای DRF برای دسته‌بندی‌های درختی، هولوگرام، ویژگی‌های فنی و کاتالوگ محصولات (همگام با صندوق و آنلاین)
"""

from rest_framework import serializers
from django.db import transaction
from django.db.models import Q
from django.utils.text import slugify
import uuid
from .models import (
    Category,
    ProductBrand,
    ProductHologram,
    ProductAttribute,
    Product,
    ProductAttributeValue,
    ProductKeyFeature,
    ProductTierDiscount,
    ProductImage
)


class ProductBrandSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    logo_preview = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProductBrand
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'logo',
            'logo_preview',
            'country',
            'description',
            'created_at'
        ]
        extra_kwargs = {
            'name_en': {'required': False, 'allow_blank': True, 'allow_null': True},
            'country': {'required': False, 'allow_blank': True, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'logo': {'required': False, 'allow_null': True},
        }

    def get_logo_preview(self, obj):
        if not obj.logo:
            return None
        request = self.context.get('request')
        if hasattr(obj.logo, 'url'):
            url = obj.logo.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return str(obj.logo)

    def validate(self, attrs):
        if not attrs.get('slug'):
            base_name = attrs.get('name_en') or attrs.get('name') or ''
            generated_slug = slugify(base_name, allow_unicode=True)
            if not generated_slug:
                generated_slug = f"brand-{uuid.uuid4().hex[:8]}"
            attrs['slug'] = generated_slug
        return attrs


BrandSerializer = ProductBrandSerializer


class CategorySerializer(serializers.ModelSerializer):
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
            'updated_at',
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
        ]


class ProductAttributeValueSerializer(serializers.ModelSerializer):
    attribute_name = serializers.CharField(source='attribute.name', read_only=True)
    attribute_unit = serializers.CharField(source='attribute.unit', read_only=True)

    class Meta:
        model = ProductAttributeValue
        fields = [
            'id',
            'attribute',
            'attribute_name',
            'attribute_unit',
            'value',
            'value_number',
            'value_boolean',
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'order']
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
            'order': {'required': False, 'default': 0}
        }


class ProductKeyFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductKeyFeature
        fields = ['id', 'title', 'display_order']
        extra_kwargs = {
            'title': {'required': True},
            'display_order': {'required': False, 'default': 0}
        }


class ProductTierDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTierDiscount
        fields = ['id', 'min_quantity', 'discount_percent', 'discount_price_per_unit']
        extra_kwargs = {
            'min_quantity': {'required': True},
            'discount_percent': {'required': True},
            'discount_price_per_unit': {'required': False, 'allow_null': True}
        }


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    brand_detail = ProductBrandSerializer(source='brand', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    brand_logo = serializers.SerializerMethodField(read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    key_features = ProductKeyFeatureSerializer(many=True, read_only=True)
    tier_discounts = ProductTierDiscountSerializer(many=True, read_only=True)
    attributes_values = ProductAttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'brand',
            'brand_detail',
            'brand_name',
            'brand_logo',
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
            'key_features',
            'tier_discounts',
            'attributes_values',
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

    def get_brand_logo(self, obj):
        if obj.brand and obj.brand.logo:
            request = self.context.get('request')
            if hasattr(obj.brand.logo, 'url'):
                url = obj.brand.logo.url
                if request is not None:
                    return request.build_absolute_uri(url)
                return url
            return str(obj.brand.logo)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    brand_detail = ProductBrandSerializer(source='brand', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    brand_logo = serializers.SerializerMethodField(read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    key_features = ProductKeyFeatureSerializer(many=True, read_only=True)
    tier_discounts = ProductTierDiscountSerializer(many=True, read_only=True)
    attributes_values = ProductAttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'name_en',
            'slug',
            'brand',
            'brand_detail',
            'brand_name',
            'brand_logo',
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
            'key_features',
            'tier_discounts',
            'attributes_values',
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

    def get_brand_logo(self, obj):
        if obj.brand and obj.brand.logo:
            request = self.context.get('request')
            if hasattr(obj.brand.logo, 'url'):
                url = obj.brand.logo.url
                if request is not None:
                    return request.build_absolute_uri(url)
                return url
            return str(obj.brand.logo)
        return None


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    سریالایزر هوشمند و جامع ثبت و بروزرسانی کالا در دیتابیس دجانگو با پشتیبانی از تراکنش‌های اتمیک
    پشتیبانی کامل از سریالایزرهای توکار ProductImage, ProductKeyFeature, ProductTierDiscount و ویژگی‌های داینامیک EAV
    """
    slug = serializers.SlugField(allow_unicode=True, required=False, allow_blank=True)
    name_fa = serializers.CharField(write_only=True, required=False, allow_blank=True)
    brand = serializers.PrimaryKeyRelatedField(queryset=ProductBrand.objects.all(), required=False, allow_null=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False, allow_null=True)
    hologram = serializers.PrimaryKeyRelatedField(queryset=ProductHologram.objects.all(), required=False, allow_null=True)
    gallery_images = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="لیست آدرس‌ها یا تصویرهای گالری محصول (رشته‌ای)"
    )
    gallery = ProductImageSerializer(many=True, required=False, write_only=True)
    key_takeaways = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="لیست نکات کلیدی محصول (رشته‌ای)"
    )
    key_features = ProductKeyFeatureSerializer(many=True, required=False, write_only=True)
    tier_discounts = ProductTierDiscountSerializer(many=True, required=False, write_only=True)
    attributes = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="لیست ویژگی‌های فنی (EAV) کالا جهت ذخیره دائمی در دیتابیس"
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'name_fa',
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
            'min_order_carton',
            'min_order_box',
            'tar',
            'nicotine',
            'carbon_monoxide',
            'cigarette_size',
            'filter_type',
            'country_origin',
            'badge',
            'main_image',
            'image',
            'gallery_images',
            'gallery',
            'key_takeaways',
            'key_features',
            'attributes',
            'tier_discounts',
            'full_description',
            'excerpt',
            'focus_keyword',
            'meta_title',
            'meta_description',
            'canonical_url',
            'is_pos_only',
            'is_box_only',
            'has_carton',
            'has_box',
            'has_pack',
            'is_active',
            'is_featured'
        ]

        extra_kwargs = {
            'name': {'required': True},
            'name_en': {'required': False, 'allow_blank': True, 'allow_null': True},
            'slug': {'required': False, 'allow_blank': True, 'allow_null': True},
            'barcode': {'required': False, 'allow_blank': True, 'allow_null': True},
            'box_price': {'required': False, 'allow_null': True},
            'boxes_per_carton': {'required': False, 'allow_null': True},
            'carton_price': {'required': False, 'allow_null': True},
            'pack_price': {'required': False, 'allow_null': True},
            'packs_per_box': {'required': False, 'allow_null': True},
            'purchase_price': {'required': False, 'allow_null': True},
            'stock_cartons': {'required': False, 'allow_null': True},
            'stock_boxes': {'required': False, 'allow_null': True},
            'min_order_carton': {'required': False, 'allow_null': True},
            'min_order_box': {'required': False, 'allow_null': True},
            'tar': {'required': False, 'allow_blank': True, 'allow_null': True},
            'nicotine': {'required': False, 'allow_blank': True, 'allow_null': True},
            'carbon_monoxide': {'required': False, 'allow_blank': True, 'allow_null': True},
            'cigarette_size': {'required': False, 'allow_blank': True, 'allow_null': True},
            'filter_type': {'required': False, 'allow_blank': True, 'allow_null': True},
            'country_origin': {'required': False, 'allow_blank': True, 'allow_null': True},
            'badge': {'required': False, 'allow_blank': True, 'allow_null': True},
            'main_image': {'required': False, 'allow_null': True},
            'image': {'required': False, 'allow_null': True},
            'full_description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'excerpt': {'required': False, 'allow_blank': True, 'allow_null': True},
            'focus_keyword': {'required': False, 'allow_blank': True, 'allow_null': True},
            'meta_title': {'required': False, 'allow_blank': True, 'allow_null': True},
            'meta_description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'canonical_url': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def to_internal_value(self, data):
        data_dict = data.copy() if hasattr(data, 'copy') else dict(data)

        # استخراج فیلدهای توکار قبل از اعتبارسنجی
        attributes_raw = data_dict.pop('attributes', None)
        if attributes_raw is None:
            attributes_raw = data_dict.pop('custom_features', None)

        tier_discounts_raw = data_dict.pop('tier_discounts', None)
        gallery_raw = data_dict.pop('gallery', None)
        gallery_images_raw = data_dict.pop('gallery_images', None)
        key_features_raw = data_dict.pop('key_features', None)
        key_takeaways_raw = data_dict.pop('key_takeaways', None)

        # پاکسازی اعداد و قیمت‌ها در صورت ارسال رشته خالی یا تهی
        for num_field in ['box_price', 'boxes_per_carton', 'carton_price', 'pack_price', 'packs_per_box', 'purchase_price', 'stock_cartons', 'stock_boxes', 'min_order_carton', 'min_order_box']:
            if num_field in data_dict:
                val = data_dict[num_field]
                if val == '' or val is None:
                    data_dict[num_field] = 0
                elif isinstance(val, str):
                    clean_val = val.replace(',', '').strip()
                    data_dict[num_field] = int(clean_val) if clean_val.isdigit() else 0

        # نگاشت name_fa به name
        if 'name_fa' in data_dict and data_dict['name_fa'] and not data_dict.get('name'):
            data_dict['name'] = data_dict['name_fa']

        # پردازش هوشمند برند
        b_val = data_dict.get('brand') or data_dict.get('brand_id') or data_dict.get('brand_name')
        if b_val is not None and b_val != '':
            if isinstance(b_val, dict):
                b_id = b_val.get('id')
                b_name = b_val.get('name') or b_val.get('title')
                if b_id and str(b_id).isdigit() and ProductBrand.objects.filter(id=int(b_id)).exists():
                    data_dict['brand'] = int(b_id)
                elif b_name:
                    brand_obj, _ = ProductBrand.objects.get_or_create(
                        name=str(b_name),
                        defaults={'slug': slugify(str(b_name), allow_unicode=True) or f"brand-{uuid.uuid4().hex[:6]}"}
                    )
                    data_dict['brand'] = brand_obj.id
            elif isinstance(b_val, (int, str)):
                s_val = str(b_val).strip()
                if s_val.isdigit() and ProductBrand.objects.filter(id=int(s_val)).exists():
                    data_dict['brand'] = int(s_val)
                elif s_val:
                    brand_obj, _ = ProductBrand.objects.get_or_create(
                        name=s_val,
                        defaults={'slug': slugify(s_val, allow_unicode=True) or f"brand-{uuid.uuid4().hex[:6]}"}
                    )
                    data_dict['brand'] = brand_obj.id

        # پردازش هوشمند دسته‌بندی
        c_val = data_dict.get('category') or data_dict.get('category_id') or data_dict.get('category_name')
        if c_val is not None and c_val != '':
            if isinstance(c_val, dict):
                c_id = c_val.get('id')
                c_name = c_val.get('name') or c_val.get('title') or c_val.get('slug')
                if c_id and str(c_id).isdigit() and Category.objects.filter(id=int(c_id)).exists():
                    data_dict['category'] = int(c_id)
                elif c_name:
                    cat_obj = Category.objects.filter(Q(slug=c_name) | Q(name=c_name) | Q(name_en=c_name)).first()
                    if not cat_obj:
                        cat_obj = Category.objects.create(
                            name=str(c_name),
                            slug=slugify(str(c_name), allow_unicode=True) or f"cat-{uuid.uuid4().hex[:6]}"
                        )
                    data_dict['category'] = cat_obj.id
            elif isinstance(c_val, (int, str)):
                s_val = str(c_val).strip()
                if s_val.isdigit() and Category.objects.filter(id=int(s_val)).exists():
                    data_dict['category'] = int(s_val)
                elif s_val:
                    cat_obj = Category.objects.filter(Q(slug=s_val) | Q(name=s_val) | Q(name_en=s_val)).first()
                    if not cat_obj:
                        cat_obj = Category.objects.create(
                            name=s_val,
                            slug=slugify(s_val, allow_unicode=True) or f"cat-{uuid.uuid4().hex[:6]}"
                        )
                    data_dict['category'] = cat_obj.id

        # پردازش هوشمند و قطعی هولوگرام
        h_val = data_dict.get('hologram') or data_dict.get('hologram_id') or data_dict.get('hologram_title')
        if h_val is not None and h_val != '':
            if isinstance(h_val, dict):
                h_id = h_val.get('id')
                h_title = h_val.get('title') or h_val.get('name')
                if h_id and str(h_id).isdigit() and ProductHologram.objects.filter(id=int(h_id)).exists():
                    data_dict['hologram'] = int(h_id)
                elif h_title:
                    holo_obj, _ = ProductHologram.objects.get_or_create(title=str(h_title))
                    data_dict['hologram'] = holo_obj.id
            elif isinstance(h_val, (int, str)):
                s_val = str(h_val).strip()
                if s_val.isdigit() and ProductHologram.objects.filter(id=int(s_val)).exists():
                    data_dict['hologram'] = int(s_val)
                elif s_val:
                    holo_obj, _ = ProductHologram.objects.get_or_create(title=s_val)
                    data_dict['hologram'] = holo_obj.id

        # تولید خودکار اسلاگ
        if not data_dict.get('slug') and data_dict.get('name'):
            gen_slug = slugify(data_dict.get('name_en') or data_dict.get('name'), allow_unicode=True)
            data_dict['slug'] = gen_slug or f"prod-{uuid.uuid4().hex[:8]}"

        ret = super().to_internal_value(data_dict)

        if attributes_raw is not None and isinstance(attributes_raw, list):
            ret['attributes'] = attributes_raw
        if tier_discounts_raw is not None and isinstance(tier_discounts_raw, list):
            ret['tier_discounts'] = tier_discounts_raw
        if gallery_raw is not None and isinstance(gallery_raw, list):
            ret['gallery'] = gallery_raw
        if gallery_images_raw is not None and isinstance(gallery_images_raw, list):
            ret['gallery_images'] = gallery_images_raw
        if key_features_raw is not None and isinstance(key_features_raw, list):
            ret['key_features'] = key_features_raw
        if key_takeaways_raw is not None and isinstance(key_takeaways_raw, list):
            ret['key_takeaways'] = key_takeaways_raw

        return ret

    def _save_nested_relations(self, product, attributes_data, tier_discounts_data, gallery_data, gallery_images_data, key_features_data, key_takeaways_data):
        """
        مدیریت اتمیک و صریح ذخیره‌سازی روابط توکار کالا
        """
        # ۱. ذخیره‌سازی ویژگی‌های فنی EAV
        if attributes_data is not None and isinstance(attributes_data, list):
            for item in attributes_data:
                if not isinstance(item, dict):
                    continue

                attr_id = item.get('attribute_id') or item.get('id')
                attr_name = item.get('name') or item.get('title')
                val = item.get('value')
                val_num = item.get('value_number')
                val_bool = item.get('value_boolean')

                attr_obj = None
                if attr_id and str(attr_id).isdigit():
                    attr_obj = ProductAttribute.objects.filter(id=int(attr_id)).first()

                if not attr_obj and attr_name:
                    name_clean = str(attr_name).strip()
                    attr_obj = ProductAttribute.objects.filter(Q(name__iexact=name_clean) | Q(name_en__iexact=name_clean)).first()
                    if not attr_obj:
                        attr_obj = ProductAttribute.objects.create(
                            name=name_clean,
                            name_en=item.get('name_en') or slugify(name_clean, allow_unicode=True),
                            data_type=item.get('data_type') or 'text',
                            unit=item.get('unit') or '',
                            options=item.get('options') or '',
                            help_text=item.get('help_text') or '',
                            is_required=item.get('is_required', False),
                            is_filterable=item.get('is_filterable', True),
                        )

                if not attr_obj:
                    continue

                if val_num is None and val is not None and attr_obj.data_type == 'number':
                    try:
                        cleaned_num = str(val).replace(attr_obj.unit or '', '').strip()
                        val_num = float(cleaned_num)
                    except (ValueError, TypeError):
                        val_num = None

                if val_bool is None and val is not None and attr_obj.data_type == 'boolean':
                    val_bool = str(val).lower() in ['true', '1', 'yes', 'بله', 'دارد']

                ProductAttributeValue.objects.update_or_create(
                    product=product,
                    attribute=attr_obj,
                    defaults={
                        'value': str(val) if val is not None else '',
                        'value_number': val_num,
                        'value_boolean': val_bool
                    }
                )

        # ۲. ذخیره‌سازی تخفیف‌های تیراژ عمده
        if tier_discounts_data is not None and isinstance(tier_discounts_data, list):
            product.tier_discounts.all().delete()
            for t_item in tier_discounts_data:
                if isinstance(t_item, dict):
                    min_q = t_item.get('min_quantity') or t_item.get('min_qty') or 1
                    disc_pct = t_item.get('discount_percent') or t_item.get('percent') or 0
                    disc_price = t_item.get('discount_price_per_unit') or t_item.get('price')
                    ProductTierDiscount.objects.create(
                        product=product,
                        min_quantity=int(min_q),
                        discount_percent=float(disc_pct),
                        discount_price_per_unit=int(disc_price) if disc_price else None
                    )

        # ۳. ذخیره‌سازی گالری تصاویر
        g_list = gallery_data if gallery_data is not None else gallery_images_data
        if g_list is not None and isinstance(g_list, list):
            product.gallery.all().delete()
            for idx, g_item in enumerate(g_list):
                if isinstance(g_item, dict):
                    img_val = g_item.get('image') or g_item.get('url')
                    order_val = g_item.get('order', idx)
                    if img_val:
                        ProductImage.objects.create(product=product, image=img_val, order=order_val)
                elif isinstance(g_item, str) and g_item.strip():
                    ProductImage.objects.create(product=product, image=g_item.strip(), order=idx)

        # ۴. ذخیره‌سازی نکات کلیدی
        kf_list = key_features_data if key_features_data is not None else key_takeaways_data
        if kf_list is not None and isinstance(kf_list, list):
            product.key_features.all().delete()
            for idx, k_item in enumerate(kf_list):
                if isinstance(k_item, dict):
                    title_val = k_item.get('title') or k_item.get('text')
                    order_val = k_item.get('display_order', idx)
                    if title_val:
                        ProductKeyFeature.objects.create(product=product, title=title_val, display_order=order_val)
                elif isinstance(k_item, str) and k_item.strip():
                    ProductKeyFeature.objects.create(product=product, title=k_item.strip(), display_order=idx)

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop('name_fa', None)
        gallery_images = validated_data.pop('gallery_images', None)
        gallery_data = validated_data.pop('gallery', None)
        key_takeaways = validated_data.pop('key_takeaways', None)
        key_features_data = validated_data.pop('key_features', None)
        attributes_data = validated_data.pop('attributes', None)
        tier_discounts_data = validated_data.pop('tier_discounts', None)

        product = super().create(validated_data)
        self._save_nested_relations(
            product,
            attributes_data=attributes_data,
            tier_discounts_data=tier_discounts_data,
            gallery_data=gallery_data,
            gallery_images_data=gallery_images,
            key_features_data=key_features_data,
            key_takeaways_data=key_takeaways
        )
        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        validated_data.pop('name_fa', None)
        gallery_images = validated_data.pop('gallery_images', None)
        gallery_data = validated_data.pop('gallery', None)
        key_takeaways = validated_data.pop('key_takeaways', None)
        key_features_data = validated_data.pop('key_features', None)
        attributes_data = validated_data.pop('attributes', None)
        tier_discounts_data = validated_data.pop('tier_discounts', None)

        product = super().update(instance, validated_data)
        self._save_nested_relations(
            product,
            attributes_data=attributes_data,
            tier_discounts_data=tier_discounts_data,
            gallery_data=gallery_data,
            gallery_images_data=gallery_images,
            key_features_data=key_features_data,
            key_takeaways_data=key_takeaways
        )
        return product
