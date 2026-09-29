"""
products/serializers.py
سریالایزرهای DRF برای دسته‌بندی‌های درختی، هولوگرام، ویژگی‌های فنی و کاتالوگ محصولات (همگام با صندوق و آنلاین)
"""

from rest_framework import serializers
from django.db import transaction, connection
from django.db.models import Q
from django.utils.text import slugify
from django.core.files.base import ContentFile
import base64
import json
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


PERSIAN_DIGITS_MAP = str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩', '01234567890123456789')


def to_english_digits(val):
    if val is None:
        return ''
    return str(val).translate(PERSIAN_DIGITS_MAP)


def ensure_product_foreign_keys_integrity():
    """
    حذف ایمن محدودیت‌های کلید خارجی قدیمی (مانند categories_category) در دیتابیس PostgreSQL
    با استفاده از Savepoint مجزا جهت جلوگیری از خطای InFailedSqlTransaction هنگام ذخیره دسته‌بندی.
    """
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'ALTER TABLE "products_product" DROP CONSTRAINT IF EXISTS "products_product_category_id_9b594869_fk_categories_category_id";'
                )
    except Exception:
        pass

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT con.conname
                    FROM pg_catalog.pg_constraint con
                    INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
                    INNER JOIN pg_catalog.pg_class confrel ON confrel.oid = con.confrelid
                    WHERE rel.relname = 'products_product'
                      AND confrel.relname NOT LIKE 'products_%'
                      AND con.contype = 'f';
                """)
                rows = cursor.fetchall()
                for (con_name,) in rows:
                    cursor.execute(f'ALTER TABLE "products_product" DROP CONSTRAINT IF EXISTS "{con_name}";')
    except Exception:
        pass


def decode_base64_image(data_str, prefix="product"):
    if not isinstance(data_str, str) or not data_str.startswith('data:image'):
        return None
    try:
        header, b64_data = data_str.split(';base64,', 1)
        ext = header.split('/')[-1].split('+')[0].lower()
        if ext == 'jpeg':
            ext = 'jpg'
        if ext not in ('jpg', 'png', 'webp', 'gif', 'svg'):
            ext = 'png'
        file_name = f"{prefix}_{uuid.uuid4().hex[:10]}.{ext}"
        return ContentFile(base64.b64decode(b64_data), name=file_name)
    except Exception:
        return None


def normalize_media_path(url_or_path):
    if not isinstance(url_or_path, str):
        return None
    s = url_or_path.strip()
    if not s:
        return None
    if '/media/' in s:
        return s.split('/media/', 1)[1].split('?')[0].lstrip('/')
    return s


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
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'order']
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
            'order': {'required': False, 'default': 0}
        }

    def get_image_url(self, obj):
        if not obj.image:
            return None
        raw_str = str(obj.image).strip()
        if raw_str.startswith(('http://', 'https://', 'data:')):
            return raw_str
        request = self.context.get('request')
        if hasattr(obj.image, 'url'):
            url = obj.image.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        if raw_str.startswith('/') and request is not None:
            return request.build_absolute_uri(raw_str)
        return raw_str


class ProductKeyFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductKeyFeature
        fields = ['id', 'title', 'display_order']
        extra_kwargs = {
            'title': {'required': False, 'allow_blank': True},
            'display_order': {'required': False, 'default': 0}
        }


class ProductTierDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTierDiscount
        fields = ['id', 'min_quantity', 'discount_percent', 'discount_price_per_unit']
        extra_kwargs = {
            'min_quantity': {'required': False, 'allow_null': True},
            'discount_percent': {'required': False, 'allow_null': True},
            'discount_price_per_unit': {'required': False, 'allow_null': True}
        }


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    brand_detail = ProductBrandSerializer(source='brand', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    brand_logo = serializers.SerializerMethodField(read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    hologram_name = serializers.CharField(source='hologram.title', read_only=True, default='')
    image_url = serializers.SerializerMethodField(read_only=True)
    images = serializers.SerializerMethodField(read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
    key_features = ProductKeyFeatureSerializer(many=True, read_only=True)
    tier_discounts = ProductTierDiscountSerializer(many=True, read_only=True)
    attributes_values = ProductAttributeValueSerializer(many=True, read_only=True)
    short_description = serializers.CharField(source='excerpt', read_only=True, default='')
    description = serializers.CharField(source='full_description', read_only=True, default='')
    moq = serializers.IntegerField(source='min_order_carton', read_only=True)
    moqBox = serializers.IntegerField(source='min_order_box', read_only=True)
    moqPack = serializers.IntegerField(source='min_order_pack', read_only=True)

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
            'category_slug',
            'category_color',
            'hologram',
            'hologram_detail',
            'hologram_name',
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
            'min_order_pack',
            'moq',
            'moqBox',
            'moqPack',
            'tar',
            'nicotine',
            'carbon_monoxide',
            'cigarette_size',
            'filter_type',
            'country_origin',
            'badge',
            'main_image',
            'image',
            'image_url',
            'images',
            'gallery',
            'key_features',
            'tier_discounts',
            'attributes_values',
            'full_description',
            'description',
            'excerpt',
            'short_description',
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
            'is_featured',
            'created_at',
            'updated_at'
        ]

    def get_explicit_featured_image(self, obj):
        request = self.context.get('request')
        if obj.main_image:
            raw_main = str(obj.main_image).strip()
            if raw_main:
                if raw_main.startswith(('http://', 'https://', 'data:')):
                    return raw_main
                if hasattr(obj.main_image, 'url'):
                    url = obj.main_image.url
                    return request.build_absolute_uri(url) if request is not None else url
                if raw_main.startswith('/'):
                    return request.build_absolute_uri(raw_main) if request is not None else raw_main
                return raw_main
        if obj.image:
            raw_img = str(obj.image).strip()
            # اگر از قبل مسیر گالری به اشتباه در فیلد image ذخیره شده باشد، به عنوان تصویر شاخص در نظر گرفته نشود
            if raw_img and 'products/gallery/' not in raw_img:
                if raw_img.startswith('/') and request is not None:
                    return request.build_absolute_uri(raw_img)
                return raw_img
        return None

    def get_image_url(self, obj):
        # ۱. اگر تصویر شاخص تنظیم شده است، همیشه همان تصویر شاخص نمایش داده شود
        explicit_main = self.get_explicit_featured_image(obj)
        if explicit_main:
            return explicit_main
        # ۲. فقط تا زمانی که هیچ تصویر شاخصی تنظیم نشده است، برای نمایش از اولین عکس گالری خوانده شود
        request = self.context.get('request')
        if hasattr(obj, 'gallery'):
            first_gal = obj.gallery.first()
            if first_gal and first_gal.image:
                raw_g = str(first_gal.image).strip()
                if raw_g.startswith(('http://', 'https://', 'data:')):
                    return raw_g
                if hasattr(first_gal.image, 'url'):
                    url = first_gal.image.url
                    return request.build_absolute_uri(url) if request is not None else url
                if raw_g.startswith('/') and request is not None:
                    return request.build_absolute_uri(raw_g)
                return raw_g
        return None

    def get_images(self, obj):
        request = self.context.get('request')
        urls = []
        if hasattr(obj, 'gallery'):
            for g in obj.gallery.all():
                if not g.image:
                    continue
                raw_g = str(g.image).strip()
                if raw_g.startswith(('http://', 'https://', 'data:')):
                    g_url = raw_g
                elif hasattr(g.image, 'url'):
                    g_url = request.build_absolute_uri(g.image.url) if request is not None else g.image.url
                elif raw_g.startswith('/') and request is not None:
                    g_url = request.build_absolute_uri(raw_g)
                else:
                    g_url = raw_g
                if g_url and g_url not in urls:
                    urls.append(g_url)
        return urls

    def to_representation(self, instance):
        data = super().to_representation(instance)
        explicit_main = self.get_explicit_featured_image(instance)
        display_img = self.get_image_url(instance)
        # فیلدهای main_image و image فقط تصویر شاخص واقعی را نگه می‌دارند تا در فرم ویرایش با گالری قاطی نشوند
        data['main_image'] = explicit_main
        data['image'] = explicit_main or ''
        # فیلد image_url در صورت وجود تصویر شاخص آن را برمی‌گرداند و فقط در صورت عدم وجود تصویر شاخص از گالری می‌خواند
        data['image_url'] = display_img
        return data

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


class ProductDetailSerializer(ProductSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['category_detail']


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    سریالایزر هوشمند و جامع ثبت و بروزرسانی کالا در دیتابیس دجانگو با پشتیبانی از تراکنش‌های اتمیک
    پشتیبانی کامل از سریالایزرهای توکار ProductImage, ProductKeyFeature, ProductTierDiscount و ویژگی‌های داینامیک EAV
    """
    slug = serializers.SlugField(allow_unicode=True, required=False, allow_blank=True)
    name_fa = serializers.CharField(write_only=True, required=False, allow_blank=True)
    badge = serializers.CharField(required=False, allow_blank=True, allow_null=True)
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
            'min_order_pack',
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
            'name': {'required': False},
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
            'min_order_pack': {'required': False, 'allow_null': True},
            'tar': {'required': False, 'allow_blank': True, 'allow_null': True},
            'nicotine': {'required': False, 'allow_blank': True, 'allow_null': True},
            'carbon_monoxide': {'required': False, 'allow_blank': True, 'allow_null': True},
            'cigarette_size': {'required': False, 'allow_blank': True, 'allow_null': True},
            'filter_type': {'required': False, 'allow_blank': True, 'allow_null': True},
            'country_origin': {'required': False, 'allow_blank': True, 'allow_null': True},
            'badge': {'required': False, 'allow_blank': True, 'allow_null': True},
            'main_image': {'required': False, 'allow_null': True},
            'image': {'required': False, 'allow_blank': True, 'allow_null': True},
            'full_description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'excerpt': {'required': False, 'allow_blank': True, 'allow_null': True},
            'focus_keyword': {'required': False, 'allow_blank': True, 'allow_null': True},
            'meta_title': {'required': False, 'allow_blank': True, 'allow_null': True},
            'meta_description': {'required': False, 'allow_blank': True, 'allow_null': True},
            'canonical_url': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def _parse_list_field(self, val):
        if val is None:
            return None
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            s = val.strip()
            if not s:
                return None
            if s.startswith('['):
                try:
                    parsed = json.loads(s)
                    if isinstance(parsed, list):
                        return parsed
                except Exception:
                    pass
            return [item.strip() for item in s.splitlines() if item.strip()]
        return None

    def to_internal_value(self, data):
        ensure_product_foreign_keys_integrity()
        self._new_main_image_uploaded = False
        is_querydict = hasattr(data, 'getlist')
        clear_main_image_flag = False

        if is_querydict:
            plain_dict = {}
            clear_main_image_flag = str(data.get('main_image-clear') or data.get('clear_main_image') or '').lower() in ('true', '1', 'on', 'yes')
            for k in data.keys():
                if k.startswith(('gallery[', 'key_features[', 'tier_discounts[', 'attributes[')):
                    continue
                if k in ('gallery_images', 'images', 'key_takeaways', 'keyTakeaways'):
                    raw_list = data.getlist(k)
                    vals = []
                    for v in raw_list:
                        if hasattr(v, 'read'):
                            vals.append(v)
                        elif isinstance(v, str) and v.strip():
                            parsed_v = self._parse_list_field(v.strip())
                            if parsed_v:
                                vals.extend(parsed_v)
                            else:
                                vals.append(v.strip())
                    if vals:
                        plain_dict[k] = vals
                elif k in ('gallery', 'key_features', 'tier_discounts', 'attributes', 'attributes_values', 'applied_features', 'product_attributes', 'custom_features'):
                    val = data.get(k)
                    parsed_val = self._parse_list_field(val)
                    if parsed_val is not None:
                        plain_dict[k] = parsed_val
                else:
                    plain_dict[k] = data.get(k)
            request = self.context.get('request')
            is_full_html_form = all(f in data for f in ('name', 'carton_price', 'box_price', 'cigarette_size', 'filter_type'))
            if request and request.method in ('PUT', 'POST') and is_full_html_form:
                for bool_field in ('has_carton', 'has_box', 'has_pack', 'is_box_only', 'is_pos_only', 'is_active', 'is_featured'):
                    if bool_field not in data:
                        plain_dict[bool_field] = False
            data_dict = plain_dict
        else:
            data_dict = data.copy() if hasattr(data, 'copy') else dict(data)
            clear_main_image_flag = bool(data_dict.pop('clear_main_image', False) or data_dict.pop('main_image-clear', False))

        # حذف فیلدهای نمایشی فقط-خواندنی در صورت ارسال مجدد در پیلود JSON
        for ro_field in ('brand_detail', 'hologram_detail', 'category_detail', 'category_color', 'brand_logo', 'created_at', 'updated_at'):
            data_dict.pop(ro_field, None)

        # استخراج فیلدهای توکار قبل از اعتبارسنجی
        attributes_raw = None
        for attr_key in ('attributes', 'attributes_values', 'applied_features', 'product_attributes', 'custom_features'):
            val = data_dict.pop(attr_key, None)
            if attributes_raw is None and val is not None:
                attributes_raw = self._parse_list_field(val)

        tier_discounts_raw = None
        for td_key in ('tier_discounts', 'tierDiscounts'):
            val = data_dict.pop(td_key, None)
            if tier_discounts_raw is None and val is not None:
                tier_discounts_raw = self._parse_list_field(val)

        gallery_raw = self._parse_list_field(data_dict.pop('gallery', None))
        gallery_images_raw = None
        for gi_key in ('gallery_images', 'images'):
            val = data_dict.pop(gi_key, None)
            if gallery_images_raw is None and val is not None:
                gallery_images_raw = self._parse_list_field(val)

        key_features_raw = self._parse_list_field(data_dict.pop('key_features', None))
        key_takeaways_raw = None
        for kt_key in ('key_takeaways', 'keyTakeaways'):
            val = data_dict.pop(kt_key, None)
            if key_takeaways_raw is None and val is not None:
                key_takeaways_raw = self._parse_list_field(val)

        # نگاشت فیلدهای توضیحات کوتاه (excerpt / short_description) و توضیحات جامع (full_description / description)
        short_desc_val = data_dict.pop('short_description', None)
        if 'excerpt' not in data_dict and short_desc_val is not None:
            data_dict['excerpt'] = short_desc_val
        elif 'excerpt' in data_dict and data_dict['excerpt'] is None and short_desc_val is not None:
            data_dict['excerpt'] = short_desc_val

        desc_val = data_dict.pop('description', None)
        if 'full_description' not in data_dict and desc_val is not None:
            data_dict['full_description'] = desc_val
        elif 'full_description' in data_dict and data_dict['full_description'] is None and desc_val is not None:
            data_dict['full_description'] = desc_val

        # پاکسازی فاصله‌های غیرقابل‌شکستن (&nbsp;) در متون
        for txt_field in ('excerpt', 'full_description', 'meta_description'):
            if txt_field in data_dict and isinstance(data_dict[txt_field], str):
                data_dict[txt_field] = (
                    data_dict[txt_field]
                    .replace('&amp;nbsp;', ' ')
                    .replace('&nbsp;', ' ')
                    .replace('\u00a0', ' ')
                )

        # نگاشت نام‌های معادل حداقل سفارش (کارتن، باکس، پاکت) و سایر فیلدهای عددی
        alias_map = {
            'min_order_carton': ['moq', 'moq_carton', 'minOrderCarton'],
            'min_order_box': ['moqBox', 'moq_box', 'minOrderBox'],
            'min_order_pack': ['moqPack', 'moq_pack', 'minOrderPack'],
            'carton_price': ['cartonPrice'],
            'box_price': ['boxPrice'],
            'pack_price': ['packPrice'],
            'purchase_price': ['purchasePrice'],
            'stock_cartons': ['stockCartons', 'stock'],
            'stock_boxes': ['stockBoxes'],
            'boxes_per_carton': ['boxesPerCarton'],
            'packs_per_box': ['packsPerBox'],
            'has_carton': ['hasCarton'],
            'has_box': ['hasBox'],
            'has_pack': ['hasPack'],
            'is_box_only': ['isBoxOnly'],
            'is_pos_only': ['isPosOnly'],
            'is_active': ['isActive', 'is_available', 'isAvailable'],
            'is_featured': ['isFeatured'],
            'country_origin': ['origin', 'countryOrigin'],
            'focus_keyword': ['focusKeyword'],
            'meta_title': ['metaTitle'],
            'meta_description': ['metaDescription'],
            'canonical_url': ['canonicalUrl'],
        }
        for target_field, aliases in alias_map.items():
            for alias in aliases:
                alias_val = data_dict.pop(alias, None)
                if target_field not in data_dict and alias_val is not None:
                    data_dict[target_field] = alias_val

        # پاکسازی اعداد و قیمت‌ها (با پشتیبانی از اعداد فارسی و حفظ مقدار 0)
        for num_field in [
            'box_price', 'boxes_per_carton', 'carton_price', 'pack_price',
            'packs_per_box', 'purchase_price', 'stock_cartons', 'stock_boxes',
            'min_order_carton', 'min_order_box', 'min_order_pack'
        ]:
            if num_field in data_dict:
                val = data_dict[num_field]
                if val == '' or val is None:
                    data_dict[num_field] = 0
                elif isinstance(val, (int, float)):
                    data_dict[num_field] = max(0, int(round(val)))
                elif isinstance(val, str):
                    clean_val = to_english_digits(val).replace(',', '').strip()
                    try:
                        data_dict[num_field] = max(0, int(float(clean_val))) if clean_val else 0
                    except (ValueError, TypeError):
                        data_dict[num_field] = 0

        # نگاشت name_fa / nameFa / title به name
        name_fa_val = data_dict.pop('nameFa', None) or data_dict.get('name_fa') or data_dict.pop('title', None)
        if name_fa_val and not data_dict.get('name'):
            data_dict['name'] = name_fa_val
        if not data_dict.get('name') and self.instance is not None:
            data_dict['name'] = self.instance.name
        if 'nameEn' in data_dict and not data_dict.get('name_en'):
            data_dict['name_en'] = data_dict.pop('nameEn')
        else:
            data_dict.pop('nameEn', None)

        # پردازش هوشمند و ایزوله تصویر شاخص (main_image و image و image_url) کاملاً مستقل از گالری
        request = self.context.get('request')
        uploaded_main_file = None
        if request is not None and hasattr(request, 'FILES'):
            uploaded_main_file = request.FILES.get('main_image') or request.FILES.get('image')

        raw_main_img = data_dict.get('main_image')
        raw_img_url = data_dict.get('image')
        extra_img_url = data_dict.pop('image_url', None)

        if uploaded_main_file is not None or hasattr(raw_main_img, 'read'):
            data_dict['main_image'] = uploaded_main_file or raw_main_img
            data_dict.pop('image', None)
            self._new_main_image_uploaded = True
        elif hasattr(raw_img_url, 'read'):
            data_dict['main_image'] = raw_img_url
            data_dict.pop('image', None)
            self._new_main_image_uploaded = True
        else:
            # بررسی ارسال تصویر شاخص به صورت Base64
            b64_source = None
            for candidate_b64 in (raw_main_img, raw_img_url, extra_img_url):
                if isinstance(candidate_b64, str) and candidate_b64.strip().startswith('data:image'):
                    b64_source = candidate_b64.strip()
                    break

            if b64_source:
                decoded = decode_base64_image(b64_source, prefix="main")
                if decoded:
                    data_dict['main_image'] = decoded
                    data_dict.pop('image', None)
                    self._new_main_image_uploaded = True
                else:
                    data_dict.pop('main_image', None)
                    data_dict.pop('image', None)
            else:
                # هیچ فایل جدید یا Base64 آپلود نشده است؛ جلوگیری از حذف ناخواسته main_image
                data_dict.pop('main_image', None)
                candidate_url = ''
                for u in (raw_img_url, raw_main_img, extra_img_url):
                    if isinstance(u, str) and u.strip() and not u.strip().startswith('data:image'):
                        u_clean = u.strip()
                        # نادیده گرفتن مسیرهای گالری که در نسخه‌های قبلی داخل فیلد image افتاده بودند
                        if 'products/gallery/' not in u_clean:
                            candidate_url = u_clean
                            break

                if clear_main_image_flag:
                    data_dict['main_image'] = None
                    data_dict['image'] = ''
                elif candidate_url:
                    if self.instance and self.instance.main_image:
                        inst_main_rel = normalize_media_path(str(self.instance.main_image))
                        inst_img_rel = normalize_media_path(str(self.instance.image or ''))
                        cand_rel = normalize_media_path(candidate_url)
                        if (inst_main_rel and cand_rel == inst_main_rel) or (inst_img_rel and cand_rel == inst_img_rel):
                            # کاربر فیلد متنی image را در فرم تغییر نداده است؛ حفظ قطعی فایل main_image
                            data_dict['image'] = self.instance.main_image.url if hasattr(self.instance.main_image, 'url') else str(self.instance.main_image)
                        else:
                            # کاربر صراحتاً یک آدرس URL جدید برای تصویر شاخص وارد کرده است
                            data_dict['image'] = candidate_url[:500]
                            data_dict['main_image'] = None
                    else:
                        data_dict['image'] = candidate_url[:500]
                else:
                    # در صورت خالی بودن فیلد در فرم، تصویر شاخص قبلی کالا حفظ شود
                    if self.instance and self.instance.main_image:
                        data_dict['image'] = self.instance.main_image.url if hasattr(self.instance.main_image, 'url') else str(self.instance.main_image)
                    elif self.instance and self.instance.image and 'products/gallery/' in str(self.instance.image):
                        data_dict['image'] = ''
                    else:
                        data_dict.pop('image', None)

        # استانداردسازی فیلدهای انتخابی (badge, cigarette_size, filter_type)
        if 'badge' in data_dict:
            b_str = str(data_dict.get('badge') or '').strip()
            badge_map = {
                'none': 'none', '': 'none', 'بدون نشان': 'none', 'عادی': 'none', 'ندارد': 'none',
                'bestseller': 'bestseller', 'best_seller': 'bestseller', 'پرفروش': 'bestseller', 'پرفروش‌ترین': 'bestseller', 'پرفروشترین': 'bestseller',
                'special': 'special', 'special_offer': 'special', 'پیشنهاد ویژه': 'special', 'فروش ویژه': 'special', 'ویژه': 'special',
                'fresh': 'fresh', 'new': 'new', 'بار تازه': 'fresh', 'بار تازه دخانیات سرو': 'fresh',
                'new_arrival': 'new_arrival', 'جدید': 'new_arrival', 'جدیدترین': 'new_arrival', 'محصول جدید': 'new_arrival',
                'discount': 'discount', 'special_discount': 'discount', 'تخفیف ویژه': 'discount', 'تخفیف تیراژ': 'discount',
                'limited': 'limited', 'rare': 'limited', 'کمیاب': 'limited', 'محدود': 'limited', 'کمیاب و کلکسیونی': 'limited',
                'import': 'import', 'وارداتی اصل': 'import', 'وارداتی': 'import', 'اورجینال': 'import',
            }
            data_dict['badge'] = badge_map.get(b_str, badge_map.get(b_str.lower(), b_str[:30] if b_str else 'none'))

        if 'cigarette_size' in data_dict or 'packSize' in data_dict:
            cs_raw = data_dict.pop('packSize', None) or data_dict.get('cigarette_size')
            cs_str = str(cs_raw or '').strip().lower().replace(' ', '_').replace('-', '_')
            valid_sizes = {'king_size', 'slims', 'super_slims', 'nano', 'compact', 'queen_size'}
            if cs_str in valid_sizes:
                data_dict['cigarette_size'] = cs_str
            elif 'super' in cs_str and 'slim' in cs_str:
                data_dict['cigarette_size'] = 'super_slims'
            elif 'slim' in cs_str or 'باریک' in cs_str:
                data_dict['cigarette_size'] = 'slims'
            elif 'nano' in cs_str or 'نانو' in cs_str:
                data_dict['cigarette_size'] = 'nano'
            elif 'compact' in cs_str or 'کامپکت' in cs_str:
                data_dict['cigarette_size'] = 'compact'
            elif 'queen' in cs_str or 'کویین' in cs_str:
                data_dict['cigarette_size'] = 'queen_size'
            else:
                data_dict['cigarette_size'] = 'king_size'

        if 'filter_type' in data_dict or 'filterType' in data_dict:
            ft_raw = data_dict.pop('filterType', None) or data_dict.get('filter_type')
            ft_str = str(ft_raw or '').strip().lower()
            valid_filters = {'white', 'yellow', 'charcoal', 'recessed', 'capsule'}
            if ft_str in valid_filters:
                data_dict['filter_type'] = ft_str
            elif 'زرد' in ft_str or 'yellow' in ft_str:
                data_dict['filter_type'] = 'yellow'
            elif 'کربن' in ft_str or 'زغال' in ft_str or 'charcoal' in ft_str:
                data_dict['filter_type'] = 'charcoal'
            elif 'مجوف' in ft_str or 'recessed' in ft_str:
                data_dict['filter_type'] = 'recessed'
            elif 'کپسول' in ft_str or 'طعم' in ft_str or 'capsule' in ft_str:
                data_dict['filter_type'] = 'capsule'
            else:
                data_dict['filter_type'] = 'white'

        # بررسی canonical_url جهت جلوگیری از خطای URLField روی رشته‌های نسبی
        if 'canonical_url' in data_dict:
            c_url = str(data_dict.get('canonical_url') or '').strip()
            if not c_url or not c_url.startswith(('http://', 'https://')):
                data_dict['canonical_url'] = None

        # پردازش هوشمند برند
        brand_id_alias = data_dict.pop('brand_id', None)
        brand_name_alias = data_dict.pop('brand_name', None)
        b_val = data_dict.get('brand')
        if b_val is None or b_val == '':
            b_val = brand_id_alias if brand_id_alias not in (None, '') else brand_name_alias
        if b_val is not None and b_val != '':
            if isinstance(b_val, ProductBrand):
                data_dict['brand'] = b_val.id
            elif isinstance(b_val, dict):
                b_id = to_english_digits(b_val.get('id')).strip()
                b_name = b_val.get('name') or b_val.get('title')
                if b_id.isdigit() and ProductBrand.objects.filter(id=int(b_id)).exists():
                    data_dict['brand'] = int(b_id)
                elif b_name:
                    brand_obj, _ = ProductBrand.objects.get_or_create(
                        name=str(b_name).strip(),
                        defaults={'slug': slugify(str(b_name), allow_unicode=True) or f"brand-{uuid.uuid4().hex[:6]}"}
                    )
                    data_dict['brand'] = brand_obj.id
            elif isinstance(b_val, (int, str)):
                s_val = str(b_val).strip()
                s_digits = to_english_digits(s_val)
                if s_digits.isdigit() and ProductBrand.objects.filter(id=int(s_digits)).exists():
                    data_dict['brand'] = int(s_digits)
                elif s_val:
                    brand_obj = ProductBrand.objects.filter(
                        Q(name__iexact=s_val) | Q(name_en__iexact=s_val) | Q(slug__iexact=s_val)
                    ).first()
                    if not brand_obj:
                        brand_obj = ProductBrand.objects.create(
                            name=s_val,
                            slug=slugify(s_val, allow_unicode=True) or f"brand-{uuid.uuid4().hex[:6]}"
                        )
                    data_dict['brand'] = brand_obj.id

        # پردازش هوشمند و قطعی دسته‌بندی (پشتیبانی از ID، اسلاگ و عنوان در ویرایش و ایجاد)
        cat_id_alias = data_dict.pop('category_id', None)
        cat_slug_alias = data_dict.pop('category_slug', None)
        cat_name_alias = data_dict.pop('category_name', None)
        c_val = data_dict.get('category')
        if c_val is None or c_val == '':
            for alias_c in (cat_id_alias, cat_slug_alias, cat_name_alias):
                if alias_c is not None and alias_c != '':
                    c_val = alias_c
                    break

        if c_val is not None and c_val != '':
            if isinstance(c_val, Category):
                data_dict['category'] = c_val.id
            elif isinstance(c_val, dict):
                c_id = to_english_digits(c_val.get('id')).strip()
                c_name = c_val.get('slug') or c_val.get('name') or c_val.get('title')
                if c_id.isdigit() and Category.objects.filter(id=int(c_id)).exists():
                    data_dict['category'] = int(c_id)
                elif c_name:
                    c_name_str = str(c_name).strip()
                    cat_obj = Category.objects.filter(
                        Q(slug__iexact=c_name_str) | Q(name__iexact=c_name_str) | Q(name_en__iexact=c_name_str)
                    ).first()
                    if not cat_obj:
                        cat_obj = Category.objects.create(
                            name=c_name_str,
                            slug=slugify(c_name_str, allow_unicode=True) or f"cat-{uuid.uuid4().hex[:6]}"
                        )
                    data_dict['category'] = cat_obj.id
            elif isinstance(c_val, (int, str)):
                s_val = str(c_val).strip()
                s_digits = to_english_digits(s_val)
                if s_digits.isdigit() and Category.objects.filter(id=int(s_digits)).exists():
                    data_dict['category'] = int(s_digits)
                elif s_val:
                    cat_obj = Category.objects.filter(
                        Q(slug__iexact=s_val) | Q(name__iexact=s_val) | Q(name_en__iexact=s_val)
                    ).first()
                    if not cat_obj:
                        cat_obj = Category.objects.create(
                            name=s_val,
                            slug=slugify(s_val, allow_unicode=True) or f"cat-{uuid.uuid4().hex[:6]}"
                        )
                    data_dict['category'] = cat_obj.id
        elif self.instance is not None:
            data_dict.pop('category', None)
        else:
            default_cat = Category.objects.first()
            if not default_cat:
                default_cat = Category.objects.create(name='سیگار و دخانیات', slug='cigarettes')
            data_dict['category'] = default_cat.id

        # پردازش هوشمند و قطعی هولوگرام
        holo_id_alias = data_dict.pop('hologram_id', None)
        holo_title_alias = data_dict.pop('hologram_title', None) or data_dict.pop('hologram_name', None)
        h_val = data_dict.get('hologram')
        if h_val is None or h_val == '':
            h_val = holo_id_alias if holo_id_alias not in (None, '') else holo_title_alias
        if h_val is not None and h_val != '':
            if isinstance(h_val, ProductHologram):
                data_dict['hologram'] = h_val.id
            elif isinstance(h_val, dict):
                h_id = to_english_digits(h_val.get('id')).strip()
                h_title = h_val.get('title') or h_val.get('name')
                if h_id.isdigit() and ProductHologram.objects.filter(id=int(h_id)).exists():
                    data_dict['hologram'] = int(h_id)
                elif h_title:
                    holo_obj, _ = ProductHologram.objects.get_or_create(title=str(h_title).strip())
                    data_dict['hologram'] = holo_obj.id
            elif isinstance(h_val, (int, str)):
                s_val = str(h_val).strip()
                s_digits = to_english_digits(s_val)
                if s_val in ('ندارد', 'بدون هولوگرام', 'none', 'null'):
                    data_dict['hologram'] = None
                elif s_digits.isdigit() and ProductHologram.objects.filter(id=int(s_digits)).exists():
                    data_dict['hologram'] = int(s_digits)
                elif s_val:
                    holo_obj = ProductHologram.objects.filter(title__iexact=s_val).first()
                    if not holo_obj:
                        holo_obj = ProductHologram.objects.create(title=s_val)
                    data_dict['hologram'] = holo_obj.id

        # پاکسازی بارکد و جلوگیری از خطای یکتایی روی رشته خالی یا تکراری
        instance_pk = getattr(self.instance, 'pk', None)
        if 'barcode' in data_dict:
            b_code = str(data_dict.get('barcode') or '').strip()
            if not b_code:
                data_dict['barcode'] = None
            else:
                dup_barcode = Product.objects.filter(barcode=b_code)
                if instance_pk:
                    dup_barcode = dup_barcode.exclude(pk=instance_pk)
                if dup_barcode.exists():
                    if self.instance and self.instance.barcode:
                        data_dict['barcode'] = self.instance.barcode
                    else:
                        data_dict['barcode'] = f"{b_code}-{uuid.uuid4().hex[:4]}"
                else:
                    data_dict['barcode'] = b_code

        # تولید خودکار و یکتاسازی اسلاگ
        raw_slug = str(data_dict.get('slug') or '').strip()
        if not raw_slug and data_dict.get('name'):
            raw_slug = slugify(data_dict.get('name_en') or data_dict.get('name'), allow_unicode=True) or f"prod-{uuid.uuid4().hex[:8]}"
        if raw_slug:
            base_slug = slugify(raw_slug, allow_unicode=True) or f"prod-{uuid.uuid4().hex[:8]}"
            dup_slug = Product.objects.filter(slug=base_slug)
            if instance_pk:
                dup_slug = dup_slug.exclude(pk=instance_pk)
            if dup_slug.exists():
                base_slug = f"{base_slug}-{instance_pk or uuid.uuid4().hex[:4]}"
            data_dict['slug'] = base_slug

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
            product.attributes_values.all().delete()
            for item in attributes_data:
                if not isinstance(item, dict):
                    continue

                attr_id = item.get('attribute_id') or item.get('attribute') or item.get('id')
                attr_name = item.get('attribute_name') or item.get('name') or item.get('nameFa') or item.get('title')
                val = item.get('value') if item.get('value') is not None else item.get('text_value')
                val_num = item.get('value_number') if item.get('value_number') is not None else item.get('numeric_value')
                val_bool = item.get('value_boolean') if item.get('value_boolean') is not None else item.get('boolean_value')

                attr_obj = None
                if attr_id and str(attr_id).isdigit():
                    attr_obj = ProductAttribute.objects.filter(id=int(attr_id)).first()

                if not attr_obj and attr_name:
                    name_clean = str(attr_name).strip()
                    attr_obj = ProductAttribute.objects.filter(Q(name__iexact=name_clean) | Q(name_en__iexact=name_clean)).first()
                    if not attr_obj:
                        valid_dt = item.get('data_type') if item.get('data_type') in ('text', 'number', 'select', 'boolean', 'color') else 'text'
                        attr_obj = ProductAttribute.objects.create(
                            name=name_clean[:100],
                            name_en=(item.get('name_en') or slugify(name_clean, allow_unicode=True) or '')[:100],
                            data_type=valid_dt,
                            unit=str(item.get('unit') or '')[:30],
                            help_text=item.get('help_text') or '',
                        )

                if not attr_obj:
                    continue

                if item.get('unit') and not attr_obj.unit:
                    attr_obj.unit = str(item.get('unit')).strip()[:30]
                    attr_obj.save(update_fields=['unit'])

                if val_num is None and val is not None and attr_obj.data_type == 'number':
                    try:
                        cleaned_num = to_english_digits(val).replace(attr_obj.unit or '', '').replace(',', '').strip()
                        val_num = float(cleaned_num)
                    except (ValueError, TypeError):
                        val_num = None

                if val_bool is None and val is not None and attr_obj.data_type == 'boolean':
                    val_bool = str(val).lower() in ['true', '1', 'yes', 'بله', 'دارد']

                ProductAttributeValue.objects.update_or_create(
                    product=product,
                    attribute=attr_obj,
                    defaults={
                        'value': str(val)[:255] if val is not None else '',
                        'value_number': val_num,
                        'value_boolean': val_bool
                    }
                )

        # ۲. ذخیره‌سازی تخفیف‌های تیراژ عمده
        if tier_discounts_data is not None and isinstance(tier_discounts_data, list):
            product.tier_discounts.all().delete()
            for t_item in tier_discounts_data:
                if isinstance(t_item, dict):
                    min_q = t_item.get('min_quantity') or t_item.get('minQuantity') or t_item.get('minCartons') or t_item.get('min_qty') or 1
                    disc_pct = t_item.get('discount_percent') or t_item.get('discountPercentage') or t_item.get('discountPercent') or t_item.get('percent') or 0
                    disc_price = t_item.get('discount_price_per_unit') or t_item.get('discountPrice') or t_item.get('price')
                    try:
                        ProductTierDiscount.objects.create(
                            product=product,
                            min_quantity=max(1, int(float(to_english_digits(min_q)))),
                            discount_percent=float(to_english_digits(disc_pct)),
                            discount_price_per_unit=int(float(to_english_digits(disc_price))) if disc_price else None
                        )
                    except (ValueError, TypeError):
                        continue

        # ۳. ذخیره‌سازی گالری تصاویر (ProductImage) با پشتیبانی از فایل، Base64 و URL
        request = self.context.get('request')
        uploaded_files = []
        if request is not None and hasattr(request, 'FILES'):
            uploaded_files = list(request.FILES.getlist('gallery_images')) + list(request.FILES.getlist('images'))

        g_list = gallery_data if gallery_data is not None else gallery_images_data
        if g_list is not None and isinstance(g_list, list):
            product.gallery.all().delete()
            for idx, g_item in enumerate(g_list):
                img_val = None
                order_val = idx
                if isinstance(g_item, dict):
                    img_val = g_item.get('image') or g_item.get('image_url') or g_item.get('url')
                    order_val = g_item.get('order', idx)
                else:
                    img_val = g_item

                if not img_val:
                    continue

                if hasattr(img_val, 'read'):
                    ProductImage.objects.create(product=product, image=img_val, order=order_val)
                elif isinstance(img_val, str):
                    s_img = img_val.strip()
                    if not s_img:
                        continue
                    if s_img.startswith('data:image'):
                        decoded_file = decode_base64_image(s_img, prefix=f"gal_{product.id}_{idx}")
                        if decoded_file:
                            ProductImage.objects.create(product=product, image=decoded_file, order=order_val)
                    else:
                        rel_media = normalize_media_path(s_img)
                        if rel_media:
                            try:
                                ProductImage.objects.create(product=product, image=rel_media[:500], order=order_val)
                            except Exception:
                                pass

        if uploaded_files:
            start_order = product.gallery.count()
            for idx, f_obj in enumerate(uploaded_files):
                ProductImage.objects.create(product=product, image=f_obj, order=start_order + idx)

        # همگام‌سازی فیلد image محصول با تصویر اصلی ذخیره شده و پاکسازی مسیرهای گالری قدیمی از فیلد image
        if product.main_image and hasattr(product.main_image, 'url'):
            if product.image != product.main_image.url:
                product.image = product.main_image.url
                product.save(update_fields=['image'])
        elif product.image and 'products/gallery/' in str(product.image):
            product.image = ''
            product.save(update_fields=['image'])

        # ۴. ذخیره‌سازی نکات کلیدی
        kf_list = key_features_data if key_features_data is not None else key_takeaways_data
        if kf_list is not None and isinstance(kf_list, list):
            product.key_features.all().delete()
            for idx, k_item in enumerate(kf_list):
                if isinstance(k_item, dict):
                    title_val = k_item.get('title') or k_item.get('text')
                    order_val = k_item.get('display_order', idx)
                    if title_val:
                        ProductKeyFeature.objects.create(product=product, title=str(title_val)[:150], display_order=order_val)
                elif isinstance(k_item, str) and k_item.strip():
                    ProductKeyFeature.objects.create(product=product, title=k_item.strip()[:150], display_order=idx)

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

    def to_representation(self, instance):
        return ProductDetailSerializer(instance, context=self.context).data
