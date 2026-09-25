# 📦 کد کامل و اصلاح‌شده فایل `products/models.py` (سامانه آذرخش)

این فایل مدل‌های محصول، برند، هولوگرام و... را در بر می‌گیرد و دقیقاً با ساختار فعلی پروژه هماهنگ است.

```python
"""
products/models.py
مدل یکپارچه کاتالوگ محصولات، دسته‌بندی‌های درختی، هولوگرام اصالت، ویژگی‌های داینامیک،
همگام‌سازی دوطرفه سایت و صندوق حضوری (is_pos_only)، بارکد اسکنر و ادیتور TinyMCE
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

SECURITY_LEVEL_CHOICES = (
    ('maximum', _('فوق امنیتی (Maximum)')),
    ('high', _('بالا (High)')),
    ('standard', _('استاندارد (Standard)')),
    ('economic', _('پایه (Economic)')),
)

DATA_TYPE_CHOICES = (
    ('text', _('متن کوتاه / رشته')),
    ('number', _('عددی (صحیح یا اعشاری)')),
    ('select', _('انتخابی / چندگزینه‌ای')),
    ('boolean', _('بله / خیر (سوئیچ دو وضعیتی)')),
    ('color', _('کد رنگ')),
)


# ==========================================
# ۱. مدل دسته‌بندی محصولات (Category)
# ==========================================

class Category(models.Model):
    """
    مدل دسته‌بندی کالاها
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


# ==========================================
# ۱.۵. مدل برندهای کالا (ProductBrand)
# ==========================================

class ProductBrand(models.Model):
    """
    مدل برندهای کالا
    """
    name = models.CharField(_("نام برند (فارسی)"), max_length=150)
    name_en = models.CharField(_("نام برند (انگلیسی)"), max_length=150, blank=True, null=True)
    slug = models.SlugField(_("اسلاگ سئو"), max_length=160, unique=True, allow_unicode=True)
    logo = models.ImageField(_("لوگو برند"), upload_to='brands/', blank=True, null=True)
    logo_url = models.URLField(_("لینک لوگو (اختیاری)"), blank=True, null=True, help_text=_("در صورت عدم آپلود فایل، لینک تصویر را وارد کنید"))
    country = models.CharField(_("کشور سازنده اصلی"), max_length=100, blank=True, null=True)
    description = models.TextField(_("توضیحات برند"), blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین ویرایش"), auto_now=True)

    class Meta:
        verbose_name = _("برند کالا")
        verbose_name_plural = _("برندهای کالا")
        ordering = ['-id']

    def __str__(self):
        return f"{self.name} ({self.name_en or self.slug})"

    @property
    def logo_path(self):
        """بازگرداندن آدرس لوگو (ترجیح با فایل آپلود شده)"""
        if self.logo and hasattr(self.logo, 'url'):
            return self.logo.url
        return self.logo_url


# ==========================================
# ۲. مدل هولوگرام و اصالت کالا (ProductHologram)
# ==========================================

class ProductHologram(models.Model):
    """
    مدل تعریف برچسب‌های ضمانت اصالت کالا و هولوگرام
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


# ==========================================
# ۳. مدل ویژگی‌های محصول (ProductAttribute)
# ==========================================

class ProductAttribute(models.Model):
    """
    تعریف مشخصات و ویژگی‌های فنی کالا
    """
    name = models.CharField(_("عنوان ویژگی به فارسی"), max_length=100)
    name_en = models.CharField(_("عنوان لاتین (English)"), max_length=100, blank=True, null=True)
    data_type = models.CharField(_("نوع داده"), max_length=20, choices=DATA_TYPE_CHOICES, default='text')
    unit = models.CharField(_("واحد سنجش (اختیاری)"), max_length=30, blank=True, null=True, help_text=_("مثال: mg، میلی‌گرم، درصد، mm، سال"))
    help_text = models.TextField(_("توضیح راهنما برای خریداران"), blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("ویژگی محصول")
        verbose_name_plural = _("ویژگی‌ها و مشخصات فنی کالاها")
        ordering = ['name']

    def __str__(self):
        unit_str = f" ({self.unit})" if self.unit else ""
        return f"{self.name}{unit_str} [{self.get_data_type_display()}]"


# ==========================================
# ۴. مدل کاتالوگ کالا و همگام‌سازی صندوق (Product)
# ==========================================

class Product(models.Model):
    """
    مدل جامع کاتالوگ محصولات با همگام‌سازی دوطرفه آنلاین و صندوق حضوری
    """
    name = models.CharField(_("نام کالا (فارسی)"), max_length=200)
    name_en = models.CharField(_("نام انگلیسی / لاتین"), max_length=200, blank=True, null=True)
    slug = models.SlugField(_("اسلاگ سئو (URL)"), max_length=220, unique=True, allow_unicode=True)
    brand = models.ForeignKey(ProductBrand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name=_("برند"))
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='products',
        verbose_name=_("دسته‌بندی")
    )
    barcode = models.CharField(_("بارکد اسکنر فروشگاهی (GTIN/EAN)"), max_length=60, blank=True, null=True, db_index=True)
    hologram = models.ForeignKey(
        ProductHologram,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name=_("هولوگرام و اصالت کالا")
    )
    
    # ساختار قیمت‌گذاری چند سطحی
    box_price = models.DecimalField(_("قیمت هر باکس (تومان)"), max_digits=12, decimal_places=0)
    boxes_per_carton = models.PositiveIntegerField(_("تعداد باکس در هر کارتن"), default=50)
    carton_price = models.DecimalField(_("قیمت هر کارتن (تومان)"), max_digits=14, decimal_places=0, blank=True, null=True)
    pack_price = models.DecimalField(_("قیمت هر پاکت (تومان)"), max_digits=12, decimal_places=0, default=0)
    packs_per_box = models.PositiveIntegerField(_("تعداد پاکت در هر باکس"), default=10)
    purchase_price = models.DecimalField(_("قیمت تمام‌شده خرید انبار"), max_digits=14, decimal_places=0, default=0)
    
    # موجودی انبار
    stock_cartons = models.PositiveIntegerField(_("موجودی انبار (کارتن)"), default=0)
    stock_boxes = models.PositiveIntegerField(_("موجودی انبار (باکس خرد)"), default=0)
    
    # مدیا و محتوا با TinyMCE
    image = models.ImageField(_("تصویر شاخص"), upload_to='products/', blank=True, null=True)
    full_description = HTMLField(_("توضیحات غنی (TinyMCE)"), blank=True, null=True)
    excerpt = models.TextField(_("خلاصه کوتاه کالا"), blank=True, null=True)
    
    # کنترل کانال فروش و همگام‌سازی آنلاین / صندوق (POS Sync)
    is_pos_only = models.BooleanField(
        _("اختصاصی صندوق فروشگاهی (عدم نمایش آنلاین)"), 
        default=False, 
        db_index=True,
        help_text=_("اگر فعال باشد، محصول فقط در سیستم صندوق حضوری اضافه و فروخته می‌شود و در سایت آنلاین نمایش داده نمی‌شود.")
    )
    is_box_only = models.BooleanField(_("فروش منحصراً باکسی"), default=False)
    has_carton = models.BooleanField(_("امکان فروش کارتنی"), default=True)
    has_box = models.BooleanField(_("امکان فروش باکسی"), default=True)
    has_pack = models.BooleanField(_("امکان فروش پاکتی"), default=False)
    
    is_active = models.BooleanField(_("فعال جهت سفارش"), default=True)
    is_featured = models.BooleanField(_("پیشنهاد ویژه صفحه اصلی"), default=False)
    created_at = models.DateTimeField(_("تاریخ ثبت"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین بروزرسانی"), auto_now=True)

    class Meta:
        verbose_name = _("محصول")
        verbose_name_plural = _("مدیریت کاتالوگ کالاها و انبار")
        ordering = ['-created_at']

    def __str__(self):
        pos_badge = " [صندوق حضوری]" if self.is_pos_only else " [آنلاین و صندوق]"
        return f"{self.name} ({self.brand.name if self.brand else 'بدون برند'}){pos_badge}"

    def save(self, *args, **kwargs):
        if self.box_price and self.boxes_per_carton and not self.carton_price:
            self.carton_price = self.box_price * self.boxes_per_carton
        super().save(*args, **kwargs)


# ==========================================
# ۵. مدل مقادیر ویژگی‌های محصول (AttributeValue)
# ==========================================

class ProductAttributeValue(models.Model):
    """
    مقدار ویژگی برای یک محصول مشخص
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes_values', verbose_name=_("محصول"))
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE, related_name='product_values', verbose_name=_("ویژگی"))
    value = models.CharField(_("مقدار متنی ویژگی"), max_length=255, blank=True, null=True)
    value_number = models.DecimalField(_("مقدار عددی"), max_digits=10, decimal_places=2, blank=True, null=True)
    value_boolean = models.BooleanField(_("مقدار بولی"), blank=True, null=True)

    class Meta:
        verbose_name = _("مقدار ویژگی کالا")
        verbose_name_plural = _("مقادیر ویژگی‌های کالاها")
        unique_together = ('product', 'attribute')

    def __str__(self):
        return f"{self.product.name} -> {self.attribute.name}: {self.value or self.value_number or self.value_boolean}"


# ==========================================
# ۶. مدل تصاویر گالری کالا (ProductImage)
# ==========================================

class ProductImage(models.Model):
    """
    گالری چندگانه تصاویر کالا
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery', verbose_name=_("محصول"))
    image = models.ImageField(_("تصویر گالری"), upload_to='products/gallery/')
    order = models.PositiveIntegerField(_("ترتیب نمایش"), default=0)

    class Meta:
        verbose_name = _("تصویر گالری")
        verbose_name_plural = _("گالری تصاویر کالا")
        ordering = ['order']
```
