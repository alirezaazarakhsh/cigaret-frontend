"""
products/serializers.py
سریالایزرهای DRF برای دسته‌بندی‌های درختی، هولوگرام، ویژگی‌های فنی و کاتالوگ محصولات (همگام با صندوق و آنلاین)
"""

from rest_framework import serializers
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
    ProductImage,
    ProductKeyFeature,
    ProductTierDiscount
)
from django.db import transaction


class ProductBrandSerializer(serializers.ModelSerializer):
    """
    سریالایزر برندها با امکان آپلود فایل تصویر لوگو (logo) و تولید خودکار آدرس پیش‌نمایش لوگو (logo_preview)
    """
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


# نام مستعار جهت پشتیبانی از پروژه‌هایی که از BrandSerializer استفاده می‌کنند
BrandSerializer = ProductBrandSerializer


class CategorySerializer(serializers.ModelSerializer):
    """
    سریالایزر جامع دسته‌بندی با ۵ فیلد اصلی فرم ورودی:
    ۱. عنوان دسته‌بندی (فارسی) - name *
    ۲. نام لاتین - name_en
    ۳. شناسه سیستمی - slug (در صورت عدم ارسال، خودکار تولید می‌شود)
    ۴. رنگ شناسه - color (۶ پالت رنگی)
    ۵. توضیحات کوتاه - description
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


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    brand_detail = ProductBrandSerializer(source='brand', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    brand_logo = serializers.SerializerMethodField(read_only=True)
    hologram_detail = ProductHologramSerializer(source='hologram', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)
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
    سریالایزر هوشمند و جامع ثبت و بروزرسانی کالا در دیتابیس دجانگو
    پشتیبانی کامل از تمامی فیلدهای دیتابیس و ورودی‌های رشته‌ای، عددی یا دیکشنری برند، دسته‌بندی و هولوگرام
    پشتیبانی از گالری تصاویر آپشنال، نکات کلیدی و تخفیف‌های تیراژ
    """
    name_fa = serializers.CharField(write_only=True, required=False, allow_blank=True)
    brand = serializers.PrimaryKeyRelatedField(queryset=ProductBrand.objects.all(), required=False, allow_null=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False, allow_null=True)
    hologram = serializers.PrimaryKeyRelatedField(queryset=ProductHologram.objects.all(), required=False, allow_null=True)
    gallery_images = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="لیست آدرس‌ها یا تصویرهای گالری محصول (اختیاری)"
    )
    key_takeaways = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="لیست نکات کلیدی محصول جهت نمایش در سئو و چکیده"
    )
    tier_discounts = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="لیست تخفیف‌های پلکانی عمده (اختیاری)"
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
            'key_takeaways',
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

        # نگاشت و تبدیل دقیق فیلدهای ۵گانه سطوح فروش و انبارداری
        # (has_carton, has_box, has_pack, is_box_only, is_pos_only)
        bool_keys = [
            ('has_carton', ['hasCarton', 'has_carton']),
            ('has_box', ['hasBox', 'has_box']),
            ('has_pack', ['hasPack', 'has_pack']),
            ('is_box_only', ['isBoxOnly', 'is_box_only']),
            ('is_pos_only', ['isPosOnly', 'is_pos_only']),
            ('is_active', ['isActive', 'is_active', 'isAvailable']),
            ('is_featured', ['isFeatured', 'is_featured']),
        ]
        for dest, sources in bool_keys:
            for src in sources:
                if src in data_dict:
                    v = data_dict[src]
                    if isinstance(v, str):
                        data_dict[dest] = v.lower() in ('true', '1', 'yes', 't')
                    else:
                        data_dict[dest] = bool(v)
                    break

        # در صورت انتخاب فقط فروش باکسی، فروش کارتنی در صورت عدم تعریف، خاموش می‌شود
        if data_dict.get('is_box_only') and 'has_carton' not in data_dict:
            data_dict['has_carton'] = False

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

        # نگاشت مبدا و توضیحات
        if 'origin' in data_dict and not data_dict.get('country_origin'):
            data_dict['country_origin'] = data_dict['origin']
        if 'description' in data_dict and not data_dict.get('full_description'):
            data_dict['full_description'] = data_dict['description']

        # پاکسازی و اصلاح بارکد خالی
        if 'barcode' in data_dict:
            b_val = data_dict.get('barcode')
            if b_val is None or str(b_val).strip() == '':
                data_dict['barcode'] = None
            else:
                data_dict['barcode'] = str(b_val).strip()

        # تولید خودکار و تضمین یکتایی اسلاگ
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

        return super().to_internal_value(data_dict)

    def create(self, validated_data):
        validated_data.pop('name_fa', None)
        validated_data.pop('images', None)
        validated_data.pop('key_features', None)
        validated_data.pop('applied_features', None)
        gallery_images = validated_data.pop('gallery_images', [])
        key_takeaways = validated_data.pop('key_takeaways', [])
        tier_discounts = validated_data.pop('tier_discounts', [])

        with transaction.atomic():
            product = super().create(validated_data)

            # ثبت گالری تصاویر آپشنال در صورت ارسال در اندپوینت
            for idx, img_src in enumerate(gallery_images):
                if img_src:
                    ProductImage.objects.create(product=product, image=img_src, order=idx)

            # ثبت نکات کلیدی
            for idx, feature_text in enumerate(key_takeaways):
                if feature_text:
                    ProductKeyFeature.objects.create(product=product, title=feature_text, order=idx)

            # ثبت تخفیف‌های پلکانی حجم عمده
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

            return product

    def update(self, instance, validated_data):
        validated_data.pop('name_fa', None)
        validated_data.pop('images', None)
        validated_data.pop('key_features', None)
        validated_data.pop('applied_features', None)
        gallery_images = validated_data.pop('gallery_images', None)
        key_takeaways = validated_data.pop('key_takeaways', None)
        tier_discounts = validated_data.pop('tier_discounts', None)

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

            return product
