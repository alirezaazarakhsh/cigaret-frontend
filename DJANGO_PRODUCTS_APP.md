# 📦 کد کامل و اصلاح‌شده فایل `products/models.py` (سامانه آذرخش)

این فایل مدل‌های محصول، برند، هولوگرام و... را در بر می‌گیرد.

---

### ۲. مدل برندهای تجاری محصولات (Product Brand)
```python
class ProductBrand(models.Model):
    """
    مدل برندهای کالا
    """
    name = models.CharField(_("نام برند (فارسی)"), max_length=150)
    name_en = models.CharField(_("نام برند (انگلیسی)"), max_length=150, blank=True, null=True)
    slug = models.SlugField(_("اسلاگ سئو"), max_length=160, unique=True, allow_unicode=True)
    logo = models.ImageField(_("لوگو برند"), upload_to='brands/', blank=True, null=True)
    country = models.CharField(_("کشور سازنده اصلی"), max_length=100, blank=True, null=True)
    description = models.TextField(_("توضیحات برند"), blank=True, null=True)
    created_at = models.DateTimeField(_("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(_("تاریخ آخرین ویرایش"), auto_now=True)
```


# ==============================================================================
# ۳. مدل هولوگرام و مشخصات اصالت کالا (Product Hologram)
# ==============================================================================
class ProductHologram(models.Model):
    title = models.CharField(_('عنوان / کد اصالت هولوگرام'), max_length=150)
    hologram_code = models.CharField(_('کد یکتای هولوگرام'), max_length=100, unique=True, blank=True, null=True)
    issuer_org = models.CharField(_('سازمان / شرکت صادرکننده'), max_length=150, blank=True, null=True, default='شرکت دخانیات سرو / بار وارداتی اصیل')
    security_level = models.CharField(_('سطح امنیتی هولوگرام'), max_length=50, default='گرید A+ لیزری سه بعدی')
    security_specs = models.TextField(_('مشخصات امنیتی و شناسه اصالت'), blank=True, null=True)
    country_origin = models.CharField(_('کشور مبدا اصالت'), max_length=100, default='سوئیس / امارات / ایران')
    badge_color = models.CharField(_('کد رنگ بج نمایش'), max_length=30, default='#10b981')
    is_verified = models.BooleanField(_('تایید شده و معتبر'), default=True)
    updated_at = models.DateTimeField(_('آخرین بروزرسانی'), auto_now=True)

    class Meta:
        verbose_name = _('هولوگرام و اصالت کالا')
        verbose_name_plural = _('هولوگرام‌ها و نشان‌های اصالت')

    def __str__(self):
        return self.title


# ==============================================================================
# ۴. مدل اصلی محصول (Product Main Model)
# متصل به بخش مدیریت shopmanage/products
# ==============================================================================
class Product(models.Model):
    BADGE_CHOICES = [
        ('none', _('بدون نشان')),
        ('bestseller', _('پرفروش‌ترین بازار')),
        ('special', _('پیشنهاد ویژه بنکداری')),
        ('new', _('بار جدید رسید')),
        ('discount', _('تخفیف ویژه تیراژ')),
        ('import', _('بار اصلی وارداتی')),
    ]

    # --- بخش ۱: اطلاعات پایه و شناسنامه کالا ---
    name = models.CharField(_('نام فارسی محصول'), max_length=255, db_index=True)
    name_en = models.CharField(_('نام انگلیسی / برند تجاری'), max_length=255, blank=True, null=True)
    slug = models.SlugField(_('اسلاگ یکتا (URL)'), max_length=255, unique=True, allow_unicode=True)
    barcode = models.CharField(_('بارکد کالا / شناسه GTIN / بارکدخوان'), max_length=100, blank=True, null=True, db_index=True)
    
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='products', 
        verbose_name=_('دسته‌بندی اصلی')
    )
    brand = models.ForeignKey(
        ProductBrand, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='products', 
        verbose_name=_('برند تجاری')
    )
    hologram = models.ForeignKey(
        ProductHologram, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='products', 
        verbose_name=_('هولوگرام و برچسب اصالت')
    )
    
    country_origin = models.CharField(_('کشور سازنده / مبدا بار'), max_length=100, default='سوئیس')
    badge = models.CharField(_('نسان ویژه محصول'), max_length=20, choices=BADGE_CHOICES, default='none')

    # --- بخش ۲: قیمت‌ها و انبارداری بنکداری (مخصوص انبار مرکزی) ---
    carton_price = models.BigIntegerField(_('قیمت عمده هر کارتن (تومان)'), default=0, help_text=_('قیمت پایه فروش کارتن به بنکداران'))
    box_price = models.BigIntegerField(_('قیمت فروش تک باکس (تومان)'), default=0, help_text=_('قیمت فروش هر باکس در صورت تک‌فروشی'))
    pack_price = models.BigIntegerField(_('قیمت تک پاکت (تومان)'), default=0, help_text=_('قیمت تک پاکت روی جلد سیگار'))
    
    stock_cartons = models.PositiveIntegerField(_('موجودی انبار (تعداد کارتن)'), default=0)
    boxes_per_carton = models.PositiveIntegerField(_('تعداد باکس در هر کارتن'), default=50)
    packs_per_box = models.PositiveIntegerField(_('تعداد پاکت در هر باکس'), default=10)
    
    min_order_carton = models.PositiveIntegerField(_('حداقل سفارش کارتن'), default=1)
    min_order_box = models.PositiveIntegerField(_('حداقل سفارش باکس'), default=1)

    has_carton = models.BooleanField(_('قابلیت فروش کارتنی (عمده)'), default=True)
    has_box = models.BooleanField(_('قابلیت فروش باکسی'), default=True)
    is_pos_only = models.BooleanField(_('فقط برای فروش حضوری (صندوق POS)'), default=False)

    # --- بخش ۳: مشخصات فنی و دخانیات (قطران، نیکوتین و...) ---
    tar = models.CharField(_('میزان قطران (Tar)'), max_length=30, blank=True, null=True, help_text=_('مثال: 0.5 mg'))
    nicotine = models.CharField(_('میزان نیکوتین (Nicotine)'), max_length=30, blank=True, null=True, help_text=_('مثال: 0.05 mg'))
    carbon_monoxide = models.CharField(_('کربن مونوکسید (CO)'), max_length=30, blank=True, null=True, help_text=_('مثال: 1 mg'))
    cigarette_size = models.CharField(_('سایز سیگار (King Size / Slim / Compact / Super Slim)'), max_length=50, blank=True, null=True)
    filter_type = models.CharField(_('نوع فیلتر (سفید / قهوه‌ای / زغالی / کپسول‌دار)'), max_length=50, blank=True, null=True)

    # --- بخش ۴: توضیحات و تصویر اصلی ---
    excerpt = models.TextField(_('خلاصه / چکیده کوتاه کالا'), blank=True, null=True)
    full_description = models.TextField(_('توضیحات کامل و جامع کالا (HTML/TinyMCE)'), blank=True, null=True)
    main_image = models.ImageField(_('تصویر اصلی کالا'), upload_to='products/%Y/%m/', blank=True, null=True)

    # --- بخش ۵: تنظیمات سئو پیشرفته Yoast SEO ---
    focus_keyword = models.CharField(_('کلمه کلیدی کانونی سئو'), max_length=150, blank=True, null=True)
    meta_title = models.CharField(_('عنوان سئو (Meta Title)'), max_length=200, blank=True, null=True)
    meta_description = models.TextField(_('توضیحات متا (Meta Description)'), blank=True, null=True)
    canonical_url = models.URLField(_('آدرس کانیکال اختصاصی'), max_length=300, blank=True, null=True)

    # وضعیت‌ها و زمان‌بندی
    is_active = models.BooleanField(_('وضعیت فعال بودن در فروشگاه'), default=True)
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('آخرین بروزرسانی'), auto_now=True)

    class Meta:
        verbose_name = _('محصول')
        verbose_name_plural = _('محصولات و کالاهای بنکداری')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.barcode or self.id})"

    @property
    def total_boxes_in_stock(self):
        """تعداد کل باکس‌های موجود در انبار"""
        return self.stock_cartons * self.boxes_per_carton


# ==============================================================================
# ۵. مدل تخفیف‌های پلکانی خرید عمده (Product Tier Discount)
# ==============================================================================
class ProductTierDiscount(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='tier_discounts', verbose_name=_('محصول'))
    min_cartons = models.PositiveIntegerField(_('حداقل تعداد خرید کارتن'), default=5)
    discount_percent = models.DecimalField(_('درصد تخفیف'), max_digits=5, decimal_places=2, default=0.0)
    discount_amount_per_carton = models.BigIntegerField(_('مبلغ تخفیف ثابت هر کارتن (تومان)'), default=0)

    class Meta:
        verbose_name = _('تخفیف پلکانی تیراژ')
        verbose_name_plural = _('تخفیف‌های پلکانی تیراژ محصولات')
        ordering = ['min_cartons']

    def __str__(self):
        return f"تخفیف {self.discount_percent}% برای خرید بالای {self.min_cartons} کارتن - {self.product.name}"


# ==============================================================================
# ۶. مدل ویژگی‌های داینامیک کالا (Product Attribute & Attribute Value)
# ==============================================================================
class ProductAttribute(models.Model):
    name = models.CharField(_('نام ویژگی'), max_length=100)

    class Meta:
        verbose_name = _('ویژگی کالا')
        verbose_name_plural = _('تعاریف ویژگی‌های کالا')

    def __str__(self):
        return self.name


class ProductAttributeValue(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes', verbose_name=_('محصول'))
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE, verbose_name=_('ویژگی'))
    value = models.CharField(_('مقدار ویژگی'), max_length=200)

    class Meta:
        verbose_name = _('مقدار ویژگی محصول')
        verbose_name_plural = _('مقادیر ویژگی‌های محصولات')

    def __str__(self):
        return f"{self.attribute.name}: {self.value}"


# ==============================================================================
# ۷. مدل نکات و ویژگی‌های کلیدی (Product Key Feature)
# ==============================================================================
class ProductKeyFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='key_features', verbose_name=_('محصول'))
    feature_text = models.CharField(_('متن ویژگی کلیدی / اسنیپت'), max_length=255)
    order = models.PositiveIntegerField(_('ترتیب'), default=0)

    class Meta:
        verbose_name = _('ویژگی کلیدی / اسنیپت')
        verbose_name_plural = _('ویژگی‌های کلیدی کالا')
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} - {self.feature_text}"


# ==============================================================================
# ۸. مدل گالری تصاویر محصول (Product Image Gallery)
# ==============================================================================
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', verbose_name=_('محصول'))
    image = models.ImageField(_('تصویر'), upload_to='products/gallery/%Y/%m/')
    alt_text = models.CharField(_('متن جایگزین (ALT)'), max_length=200, blank=True, null=True)
    order = models.PositiveIntegerField(_('ترتیب نمایش'), default=0)

    class Meta:
        verbose_name = _('تصویر گالری محصول')
        verbose_name_plural = _('گالری تصاویر محصولات')
        ordering = ['order']

    def __str__(self):
        return f"تصویر {self.id} - {self.product.name}"
```
