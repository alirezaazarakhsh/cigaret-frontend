"""
products/models.py
مدل‌های محصولات، دسته‌بندی‌ها، برندها، هولوگرام‌ها، تخفیفات پلکانی و ویژگی‌های فنی
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField

# ==========================================
# گزینه‌های انتخابی ثابت (Choice Tuples)
# ==========================================

COLOR_CHOICES = (
    ('#EF4444', _('قرمز / سرخابی (#EF4444)')),
    ('#F59E0B', _('طلایی / نارنجی (#F59E0B)')),
    ('#8B5CF6', _('بنفش رویال (#8B5CF6)')),
    ('#3B82F6', _('آبی لاجوردی (#3B82F6)')),
    ('#06B6D4', _('فیروزه‌ای (#06B6D4)')),
    ('#1E40AF', _('سرمه‌ای دیپ (#1E40AF)')),
)

# ==============================================================================
# ۱. دسته‌بندی‌ها (Categories)
# ==============================================================================
class Category(models.Model):
    """
    مدل دسته‌بندی کالاها (شامل ۵ فیلد اصلی فرم اندپوینت):
    ۱. عنوان دسته‌بندی (فارسی)
    ۲. نام لاتین (English)
    ۳. شناسه سیستمی (Slug / ID)
    ۴. رنگ شناسه (۶ رنگ پالت انتخابی)
    ۵. توضیحات کوتاه دسته‌بندی
    """
    name = models.CharField(_("عنوان دسته‌بندی (فارسی)"), max_length=150)
    name_en = models.CharField(_("نام لاتین (English)"), max_length=150, blank=True, null=True)
    slug = models.SlugField(_("شناسه سیستمی (Slug / ID)"), max_length=160, unique=True, allow_unicode=True)
    color = models.CharField(_("رنگ شناسه"), max_length=30, choices=COLOR_CHOICES, default="#3B82F6")
    description = models.TextField(_("توضیحات کوتاه دسته‌بندی"), blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین ویرایش"), auto_now=True)

    class Meta:
        verbose_name = _("دسته‌بندی")
        verbose_name_plural = _("دسته‌بندی‌های محصولات")
        ordering = ['-id']

    def __str__(self):
        return f"{self.name} ({self.slug})"


# ==============================================================================
# ۲. برندهای کالا (Product Brands / Brand)
# ==============================================================================
class ProductBrand(models.Model):
    name = models.CharField(_("نام برند (فارسی)"), max_length=120)
    name_en = models.CharField(_("نام برند (انگلیسی)"), max_length=120, blank=True, null=True)
    slug = models.SlugField(_("اسلاگ سئو"), max_length=130, unique=True, allow_unicode=True)
    logo = models.ImageField(_("لوگو برند"), upload_to="brands/logos/", blank=True, null=True, help_text=_("آپلود فایل تصویر لوگوی برند"))
    country = models.CharField(_("کشور سازنده اصلی"), max_length=100, blank=True, null=True)
    description = models.TextField(_("توضیحات برند"), blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("برند کالا")
        verbose_name_plural = _("برندهای کالا")
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def logo_url(self):
        """آدرس مستقیم تصویر لوگو جهت استفاده در فرانت‌اند و قالب‌ها"""
        if self.logo and hasattr(self.logo, 'url'):
            return self.logo.url
        return None


# نام مستعار جهت سازگاری کامل با پروژه‌هایی که از مدل Brand استفاده می‌کنند
Brand = ProductBrand


# ==============================================================================
# ۳. هولوگرام و اصالت کالا (Product Hologram)
# ==============================================================================
SECURITY_LEVEL_CHOICES = (
    ('maximum', _('فوق امنیتی (Maximum)')),
    ('high', _('بالا (High)')),
    ('standard', _('استاندارد (Standard)')),
    ('economic', _('پایه (Economic)')),
)

class ProductHologram(models.Model):
    """
    مدل تعریف برچسب‌های ضمانت اصالت کالا و هولوگرام (مطابق دقیق ۵ فیلد اصلی فرم اندپوینت):
    ۱. عنوان هولوگرام / برچسب اصالت * (title)
    ۲. مرجع صادرکننده یا سازمان ناظر (issuer_org)
    ۳. کشور / حوزه (country_origin)
    ۴. سطح اعتبار امنیتی (security_level)
    ۵. مشخصات فنی و امنیتی (security_specs)
    """
    title = models.CharField(_("عنوان هولوگرام / برچسب اصالت"), max_length=150)
    issuer_org = models.CharField(_("مرجع صادرکننده یا سازمان ناظر"), max_length=150, blank=True, null=True)
    country_origin = models.CharField(_("کشور / حوزه"), max_length=100, blank=True, null=True)
    security_level = models.CharField(_("سطح اعتبار امنیتی"), max_length=30, choices=SECURITY_LEVEL_CHOICES, default='high')
    security_specs = models.TextField(_("مشخصات فنی و امنیتی"), blank=True, null=True)
    is_verified = models.BooleanField(_("دارای استعلام اصالت بارکد / QR"), default=True)
    created_at = models.DateTimeField(_("تاریخ ثبت هولوگرام"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("هولوگرام و اصالت")
        verbose_name_plural = _("هولوگرام‌های اصالت کالا")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_security_level_display()}"


# ==============================================================================
# ۴. مدل اصلی محصول (Product)
# ==============================================================================
class Product(models.Model):
    BADGE_CHOICES = (
        ('none', _('بدون نشان')),
        ('bestseller', _('پرفروش‌ترین')),
        ('special', _('پیشنهاد ویژه')),
        ('new', _('جدیدترین')),
        ('discount', _('تخفیف ویژه')),
        ('import', _('وارداتی اصل')),
    )

    SIZE_CHOICES = (
        ('king_size', _('کینگ سایز (King Size)')),
        ('slims', _('اسلیم / باریک (Slims)')),
        ('super_slims', _('سوپر اسلیم (Super Slims)')),
        ('nano', _('نانو (Nano)')),
        ('compact', _('کامپکت (Compact)')),
        ('queen_size', _('کویین سایز (Queen Size)')),
    )

    FILTER_CHOICES = (
        ('white', _('فیلتر سفید استاندارد')),
        ('yellow', _('فیلتر زرد سنتی')),
        ('charcoal', _('فیلتر کربن / زغالی')),
        ('recessed', _('فیلتر مجوف (Recessed)')),
        ('capsule', _('فیلتر طعم‌دار / پاور (Capsule)')),
    )

    name = models.CharField(_("نام محصول (فارسی)"), max_length=200)
    name_en = models.CharField(_("نام محصول (انگلیسی)"), max_length=200, blank=True, null=True)
    slug = models.SlugField(_("اسلاگ سئو"), max_length=220, unique=True, allow_unicode=True)
    barcode = models.CharField(_("بارکد اسکنر فروشگاهی"), max_length=60, unique=True, blank=True, null=True, db_index=True)

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products', verbose_name=_("دسته‌بندی"))
    brand = models.ForeignKey(ProductBrand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name=_("برند"))
    hologram = models.ForeignKey(ProductHologram, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name=_("هولوگرام اصالت"))

    # ساختار بسته‌بندی و قیمت‌گذاری بنکداری
    carton_price = models.PositiveIntegerField(_("قیمت هر کارتن (تومان)"), default=0)
    box_price = models.PositiveIntegerField(_("قیمت هر باکس (تومان)"), default=0)
    pack_price = models.PositiveIntegerField(_("قیمت هر پاکت (تومان)"), default=0)
    purchase_price = models.PositiveIntegerField(_("قیمت تمام‌شده خرید"), default=0)

    stock_cartons = models.PositiveIntegerField(_("موجودی کارتن"), default=0)
    stock_boxes = models.PositiveIntegerField(_("موجودی باکس"), default=0)
    boxes_per_carton = models.PositiveIntegerField(_("تعداد باکس در کارتن"), default=50)
    packs_per_box = models.PositiveIntegerField(_("تعداد پاکت در باکس"), default=10)

    min_order_carton = models.PositiveIntegerField(_("حداقل سفارش کارتن"), default=1)
    min_order_box = models.PositiveIntegerField(_("حداقل سفارش باکس"), default=1)

    has_carton = models.BooleanField(_("امکان فروش کارتنی"), default=True)
    has_box = models.BooleanField(_("امکان فروش باکسی"), default=True)
    has_pack = models.BooleanField(_("امکان فروش پاکتی"), default=False)
    is_box_only = models.BooleanField(_("فقط فروش باکسی"), default=False)
    is_pos_only = models.BooleanField(_("اختصاصی صندوق (POS)"), default=False)

    # مشخصات فنی و تخصصی دخانیات
    tar = models.CharField(_("میزان قطران (mg)"), max_length=20, blank=True, null=True)
    nicotine = models.CharField(_("میزان نیکوتین (mg)"), max_length=20, blank=True, null=True)
    carbon_monoxide = models.CharField(_("میزان کربن مونوکسید"), max_length=20, blank=True, null=True)
    cigarette_size = models.CharField(_("سایز سیگار"), max_length=30, choices=SIZE_CHOICES, default='king_size')
    filter_type = models.CharField(_("نوع فیلتر"), max_length=30, choices=FILTER_CHOICES, default='white')
    country_origin = models.CharField(_("کشور تولیدکننده / مبدا"), max_length=100, blank=True, null=True)

    # اطلاعات رسانه‌ای و محتوا
    badge = models.CharField(_("نشان ویژه محصول"), max_length=30, choices=BADGE_CHOICES, default='none')
    main_image = models.ImageField(_("تصویر اصلی محصول"), upload_to="products/", blank=True, null=True)
    image = models.CharField(_("آدرس / URL تصویر"), max_length=500, blank=True, null=True)
    excerpt = models.TextField(_("چکیده و خلاصه کوتاه"), blank=True, null=True)
    full_description = HTMLField(_("توضیحات جامع (TinyMCE)"), blank=True, null=True)

    # سئو پیشرفته Yoast
    focus_keyword = models.CharField(_("کلیدواژه اصلی سئو"), max_length=100, blank=True, null=True)
    meta_title = models.CharField(_("عنوان سئو (Meta Title)"), max_length=150, blank=True, null=True)
    meta_description = models.TextField(_("توضیحات سئو (Meta Description)"), blank=True, null=True)
    canonical_url = models.URLField(_("لینک کانونیکال (Canonical)"), blank=True, null=True)

    is_active = models.BooleanField(_("فعال"), default=True)
    is_featured = models.BooleanField(_("پیشنهاد ویژه"), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("محصول")
        verbose_name_plural = _("محصولات")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.barcode or 'بدون بارکد'})"


# ==============================================================================
# ۵. جدول تخفیف‌های پلکانی حجم عمده (Tier Discounts)
# ==============================================================================
class ProductTierDiscount(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='tier_discounts', verbose_name=_("محصول"))
    min_quantity = models.PositiveIntegerField(_("حداقل تعداد (کارتن/باکس)"))
    discount_percent = models.DecimalField(_("درصد تخفیف"), max_digits=5, decimal_places=2)
    discount_price_per_unit = models.PositiveIntegerField(_("قیمت تخفیف‌خورده به ازای هر واحد"), blank=True, null=True)

    class Meta:
        verbose_name = _("تخفیف پلکانی عمده")
        verbose_name_plural = _("تخفیف‌های پلکانی عمده")
        ordering = ['min_quantity']


# ==============================================================================
# ۶. مشخصات و ویژگی‌های داینامیک کالا (Attributes & Values)
# ==============================================================================
DATA_TYPE_CHOICES = (
    ('text', _('متن کوتاه / رشته')),
    ('number', _('عددی (صحیح یا اعشاری)')),
    ('select', _('انتخابی / چندگزینه‌ای')),
    ('boolean', _('بله / خیر (سوئیچ دو وضعیتی)')),
    ('color', _('کد رنگ')),
)

class ProductAttribute(models.Model):
    name = models.CharField(_("عنوان ویژگی به فارسی"), max_length=100)
    name_en = models.CharField(_("عنوان لاتین (English)"), max_length=100, blank=True, null=True)
    data_type = models.CharField(_("نوع داده"), max_length=20, choices=DATA_TYPE_CHOICES, default='text')
    unit = models.CharField(_("واحد سنجش (اختیاری)"), max_length=30, blank=True, null=True)
    help_text = models.TextField(_("توضیح راهنما برای خریداران"), blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("تعریف ویژگی")
        verbose_name_plural = _("تعاریف ویژگی‌ها")

    def __str__(self):
        return self.name


class ProductAttributeValue(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes_values', verbose_name=_("محصول"))
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE, verbose_name=_("ویژگی"))
    value = models.CharField(_("مقدار متنی"), max_length=255, blank=True, null=True)
    value_number = models.DecimalField(_("مقدار عددی"), max_digits=10, decimal_places=2, blank=True, null=True)
    value_boolean = models.BooleanField(_("مقدار بله/خیر"), blank=True, null=True)

    class Meta:
        verbose_name = _("مقدار ویژگی محصول")
        verbose_name_plural = _("مقادیر ویژگی‌های محصولات")
        unique_together = ('product', 'attribute')


# ==============================================================================
# ۷. نقاط قوت / ویژگی‌های کلیدی کالا (Key Features)
# ==============================================================================
class ProductKeyFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='key_features', verbose_name=_("محصول"))
    title = models.CharField(_("عنوان نقطه قوت"), max_length=150)
    display_order = models.PositiveIntegerField(_("ترتیب"), default=0)

    class Meta:
        verbose_name = _("نقطه قوت کالا")
        verbose_name_plural = _("نقاط قوت کالا")
        ordering = ['display_order']


# ==============================================================================
# ۸. گالری تصاویر محصول (Product Gallery)
# ==============================================================================
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery', verbose_name=_("محصول"))
    image = models.ImageField(_("تصویر گالری"), upload_to="products/gallery/")
    order = models.PositiveIntegerField(_("ترتیب نمایش"), default=0)

    class Meta:
        verbose_name = _("تصویر گالری")
        verbose_name_plural = _("گالری تصاویر کالا")
        ordering = ['order']
