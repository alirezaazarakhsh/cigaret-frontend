"""
accounts/models.py
مدل کاربری اختصاصی بر پایه شماره تلفن همراه، پروفایل بنکداری و لاگین پیامکی OTP
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import random


class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError(_("شماره موبایل الزامی است."))
        phone = self.normalize_phone(phone)
        user = self.model(phone=phone, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(phone, password, **extra_fields)

    @staticmethod
    def normalize_phone(phone: str) -> str:
        phone = phone.strip().replace(' ', '').replace('-', '')
        if phone.startswith('+98'):
            phone = '0' + phone[3:]
        elif phone.startswith('98'):
            phone = '0' + phone[2:]
        return phone


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', _('مدیر کل سامانه')),
        ('warehouse_manager', _('مدیر انبار جنت‌آباد')),
        ('sales_agent', _('کارشناس فروش عمده')),
        ('wholesaler', _('بنکدار / خریدار عمده')),
        ('guest', _('کاربر مهمان')),
    )

    phone = models.CharField(
        _("شماره تلفن همراه"), 
        max_length=15, 
        unique=True, 
        db_index=True,
        help_text=_("مثال: 09120759419")
    )
    full_name = models.CharField(_("نام و نام خانوادگی"), max_length=150, blank=True)
    business_name = models.CharField(_("نام فروشگاه / بنکداری"), max_length=200, blank=True)
    role = models.CharField(_("نقش سیستمی"), max_length=30, choices=ROLE_CHOICES, default='wholesaler')
    
    # اطلاعات احراز هویت رسمی
    national_id = models.CharField(_("کد ملی / شناسه ملی"), max_length=12, blank=True, null=True)
    business_license = models.CharField(_("شماره پروانه کسب / شناسه صنف"), max_length=50, blank=True, null=True)
    is_verified = models.BooleanField(_("احراز هویت شده (بنکدار رسمی)"), default=False)
    
    # آدرس پیش‌فرض تحویل بار
    province = models.CharField(_("استان"), max_length=60, default="تهران")
    city = models.CharField(_("شهر"), max_length=60, default="تهران")
    address = models.TextField(_("آدرس دقیق انبار / مغازه خریدار"), blank=True)
    postal_code = models.CharField(_("کد پستی ۱۰ رقمی"), max_length=10, blank=True)
    
    # دسترسی و امکانات ویزیتور (ادغام شده مستقیم روی کاربر)
    is_visitor = models.BooleanField(_("دسترسی ویزیتور و بازاریاب"), default=False, help_text=_("در صورت تیک زدن، این کاربر امکانات پنل ویزیتور را خواهد دید"))
    visitor_code = models.CharField(_("کد اختصاصی ویزیتور"), max_length=50, blank=True, null=True, unique=True, help_text="مثال: VISITOR-9419")
    commission_rate = models.DecimalField(_("درصد سود/کمیسیون ویزیتور"), max_digits=5, decimal_places=2, default=2.50)
    total_sales_amount = models.DecimalField(_("مجموع مبلغ فروش‌های ثبت‌شده"), max_digits=14, decimal_places=0, default=0)
    total_commission_earned = models.DecimalField(_("مجموع سود و کمیسیون دریافتی"), max_digits=12, decimal_places=0, default=0)

    # دسترسی‌های سیستمی
    is_active = models.BooleanField(_("حساب فعال"), default=True)
    is_staff = models.BooleanField(_("دسترسی به پنل مدیریت جنگو"), default=False)
    date_joined = models.DateTimeField(_("تاریخ عضویت"), default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = _("کاربر / بنکدار")
        verbose_name_plural = _("مدیریت کاربران و بنکداران")
        ordering = ['-date_joined']

    def save(self, *args, **kwargs):
        # تولید خودکار کد ویزیتور در صورت فعال‌سازی دسترسی ویزیتوری
        if self.is_visitor and not self.visitor_code:
            clean_phone = (self.phone or '0000').replace(' ', '').replace('-', '')
            last4 = clean_phone[-4:] if len(clean_phone) >= 4 else '9419'
            self.visitor_code = f"VISITOR-{last4}"
        super().save(*args, **kwargs)

    def __str__(self):
        visitor_tag = " [ویزیتور]" if self.is_visitor else ""
        return f"{self.full_name or 'کاربر'} ({self.phone}) - {self.business_name or 'شخصی'}{visitor_tag}"


class PhoneOTP(models.Model):
    phone = models.CharField(_("شماره موبایل"), max_length=15, db_index=True)
    code = models.CharField(_("کد تأیید ۴ یا ۶ رقمی"), max_length=6)
    is_used = models.BooleanField(_("استفاده شده"), default=False)
    created_at = models.DateTimeField(_("زمان ایجاد"), auto_now_add=True)
    expires_at = models.DateTimeField(_("زمان انقضا"))

    class Meta:
        verbose_name = _("کد یکبار مصرف پیامکی (OTP)")
        verbose_name_plural = _("کدهای تأیید پیامکی")
        ordering = ['-created_at']

    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at

    @classmethod
    def generate_otp(cls, phone: str, digits: int = 4, validity_minutes: int = 3):
        # باطل کردن کدهای قبلی این شماره
        cls.objects.filter(phone=phone, is_used=False).update(is_used=True)
        
        # تولید کد رندوم عددی
        code = str(random.randint(10**(digits-1), (10**digits)-1))
        expires = timezone.now() + timezone.timedelta(minutes=validity_minutes)
        
        otp = cls.objects.create(
            phone=phone,
            code=code,
            expires_at=expires
        )
        return otp
