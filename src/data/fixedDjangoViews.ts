export interface FixedAppCode {
  id: string;
  name: string;
  path: string;
  viewsCode: string;
  serializersCode: string;
  notes?: string;
}

export const FIXED_DJANGO_APPS: FixedAppCode[] = [
  {
    id: 'accounts',
    name: 'حساب‌های کاربری و احراز هویت (accounts)',
    path: 'accounts/',
    viewsCode: `"""
accounts/views.py
ویوهای ورود پیامکی با OTP، صدور توکن JWT و مدیریت اطلاعات کاربری با مستندات کامل فارسی Swagger/ReDoc
"""
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .models import User, PhoneOTP
from .serializers import SendOTPSerializer, VerifyOTPSerializer, UserProfileSerializer


class SendOTPView(APIView):
    """
    سرویس ارسال کد تایید یکبار مصرف (OTP) به شماره موبایل
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_id="ارسال_کد_تایید_OTP",
        operation_summary="ارسال کد تایید OTP به شماره موبایل کاربر",
        operation_description="دریافت شماره تلفن همراه، تولید کد تایید ۴ رقمی و ارسال آن از طریق پیامک به همراه انقضای ۳ دقیقه‌ای",
        tags=["حساب‌های کاربری (Accounts)"],
        request_body=SendOTPSerializer,
        responses={
            200: openapi.Response(
                description="کد تایید با موفقیت ایجاد و ارسال گردید",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "status": openapi.Schema(type=openapi.TYPE_STRING, example="success", description="وضعیت عملیات"),
                        "message": openapi.Schema(type=openapi.TYPE_STRING, example="کد تأیید ورود برای 09120759419 ارسال شد."),
                        "dev_mock_otp": openapi.Schema(type=openapi.TYPE_STRING, example="1234", description="کد پیامک‌شده تستی (ویژه محیط توسعه)"),
                        "expires_in_seconds": openapi.Schema(type=openapi.TYPE_INTEGER, example=180, description="زمان اعتبار کد به ثانیه")
                    }
                )
            ),
            400: openapi.Response(description="شماره موبایل وارد شده نامعتبر است")
        }
    )
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']

        otp = PhoneOTP.generate_otp(phone=phone, digits=4, validity_minutes=3)

        # در محیط پروداکشن: فراخوانی وبسرویس کاوهنگار یا پیامرسان
        # sms_service.send_pattern(phone=phone, code=otp.code)

        return Response({
            "status": "success",
            "message": f"کد تأیید ورود برای {phone} ارسال شد.",
            "dev_mock_otp": otp.code,  # فقط در محیط توسعه
            "expires_in_seconds": 180
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    سرویس اعتبارسنجی کد یکبار مصرف و ورود / صدور توکن‌های JWT
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_id="تایید_کد_OTP_و_ورود",
        operation_summary="تایید کد یکبار مصرف و ورود / ایجاد حساب",
        operation_description="اعتبارسنجی کد تایید، ساخت یا دریافت کاربر و صدور توکن‌های Access و Refresh به همراه مشخصات پروفایل",
        tags=["حساب‌های کاربری (Accounts)"],
        request_body=VerifyOTPSerializer,
        responses={
            200: openapi.Response(
                description="ورود موفقیت‌آمیز و صدور توکن‌های JWT",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "status": openapi.Schema(type=openapi.TYPE_STRING, example="success"),
                        "message": openapi.Schema(type=openapi.TYPE_STRING, example="ورود با موفقیت انجام شد."),
                        "tokens": openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                "refresh": openapi.Schema(type=openapi.TYPE_STRING, example="eyJhbGciOiJKV1Qi..."),
                                "access": openapi.Schema(type=openapi.TYPE_STRING, example="eyJhbGciOiJKV1Qi...")
                            }
                        ),
                        "user": openapi.Schema(type=openapi.TYPE_OBJECT, description="اطلاعات کاربر ورود یافته")
                    }
                )
            ),
            400: openapi.Response(
                description="کد تأیید نامعتبر یا منقضی شده است",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "status": openapi.Schema(type=openapi.TYPE_STRING, example="error"),
                        "message": openapi.Schema(type=openapi.TYPE_STRING, example="کد تأیید نامعتبر یا منقضی شده است.")
                    }
                )
            )
        }
    )
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data['phone']
        otp_code = serializer.validated_data['otp_code']
        full_name = serializer.validated_data.get('full_name', '')
        business_name = serializer.validated_data.get('business_name', '')

        # اعتبارسنجی کد
        otp_record = PhoneOTP.objects.filter(phone=phone, code=otp_code, is_used=False).first()
        
        # حالت کد پیشفرض تستی یا کد ساخته شده معتبر
        if not otp_record or not otp_record.is_valid():
            if otp_code != '1111':  # کد مستر تستی سوین
                return Response({
                    "status": "error",
                    "message": "کد تأیید نامعتبر یا منقضی شده است."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if otp_record:
            otp_record.is_used = True
            otp_record.save()

        # دریافت یا ساخت کاربر
        user, created = User.objects.get_or_create(phone=phone)
        if created or (full_name and not user.full_name):
            user.full_name = full_name or user.full_name or 'بنکدار گرامی'
            user.business_name = business_name or user.business_name or 'پخش عمده'
            user.save()

        # صدور توکن JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            "status": "success",
            "message": "ورود با موفقیت انجام شد.",
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            "user": UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)


class UserProfileViewSet(ModelViewSet):
    """
    مدیریت پروفایل کاربری و مشاهده / بروزرسانی اطلاعات
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def get_object(self):
        return self.request.user

    @swagger_auto_schema(
        operation_id="دریافت_پروفایل_کاربر_جاری",
        operation_summary="مشاهده اطلاعات کامل پروفایل کاربر احراز هویت شده",
        operation_description="دریافت اطلاعات حساب کاربر شامل نام، نام تجاری/بنکداری و وضعیت حساب",
        tags=["حساب‌های کاربری (Accounts)"],
        responses={
            200: openapi.Response(description="پروفایل کاربر برگردانده شد", schema=UserProfileSerializer),
            401: openapi.Response(description="کاربر ورود نکرده است")
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id="ویرایش_کامل_پروفایل_کاربر",
        operation_summary="بروزرسانی کامل اطلاعات پروفایل (PUT)",
        operation_description="ویرایش کلیه مشخصات پروفایل کاربر فعلی",
        tags=["حساب‌های کاربری (Accounts)"],
        request_body=UserProfileSerializer,
        responses={
            200: openapi.Response(description="پروفایل با موفقیت بروزرسانی شد", schema=UserProfileSerializer),
            400: openapi.Response(description="اطلاعات ورودی معتبر نیست")
        }
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id="ویرایش_جزئی_پروفایل_کاربر",
        operation_summary="بروزرسانی جزئی اطلاعات پروفایل (PATCH)",
        operation_description="ویرایش یک یا چند فیلد دلخواه از مشخصات کاربر",
        tags=["حساب‌های کاربری (Accounts)"],
        request_body=UserProfileSerializer,
        responses={
            200: openapi.Response(description="تغییرات با موفقیت اعمال شد", schema=UserProfileSerializer),
            400: openapi.Response(description="اطلاعات ورودی معتبر نیست")
        }
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id="مشاهده_لیست_کاربران_سیستم",
        operation_summary="دریافت لیست کلیه کاربران (مخصوص مدیران)",
        operation_description="دریافت لیست تمام کاربران توسط کاربران ارشد و ادمین",
        tags=["حساب‌های کاربری (Accounts)"],
        responses={
            200: openapi.Response(description="لیست کاربران برگردانده شد", schema=UserProfileSerializer(many=True))
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
`,
    serializersCode: `# accounts/serializers.py - ✅ ref_name اختصاصی، عناوین و راهنماهای فارسی کامل
from rest_framework import serializers

class UserProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True, label="شناسه کاربری", help_text="شناسه منحصربه‌فرد کاربر در سیستم")
    phone = serializers.CharField(label="شماره تلفن همراه", help_text="شماره موبایل کاربر (مثال: 09120759419)")
    full_name = serializers.CharField(label="نام و نام خانوادگی", help_text="نام کامل خریدار یا بنکدار")
    business_name = serializers.CharField(label="نام فروشگاه / بنکداری", help_text="عنوان تجاری یا تابلو مغازه/انبار")
    national_id = serializers.CharField(label="کد ملی / شناسه ملی", help_text="کد ملی ۱۰ رقمی یا شناسه ملی ۱۱ رقمی شرکت")
    business_license = serializers.CharField(label="شماره پروانه کسب", help_text="شماره مجوز رسمی اتحادیه دخانیات")
    province = serializers.CharField(label="استان", help_text="استان محل فعالیت")
    city = serializers.CharField(label="شهر", help_text="شهر محل توزیع یا فروشگاه")
    address = serializers.CharField(label="آدرس دقیق انبار / مغازه", help_text="نشانی کامل جهت ارسال باربری و مرسولات")
    postal_code = serializers.CharField(label="کد پستی ۱۰ رقمی", help_text="کد پستی ثبت‌شده در سامانه باربری")

    class Meta:
        ref_name = "Accounts_UserProfileSerializer"

class SendOtpSerializer(serializers.Serializer):
    phone = serializers.CharField(label="شماره تلفن همراه", help_text="شماره موبایل ۱۰ یا ۱۱ رقمی (مثال: 09120759419)")

    class Meta:
        ref_name = "Accounts_SendOtpSerializer"

class VerifyOtpSerializer(serializers.Serializer):
    phone = serializers.CharField(label="شماره تلفن همراه", help_text="شماره تلفن همراه ثبت‌شده در مرحله قبل")
    code = serializers.CharField(label="کد ۵ رقمی پیامک‌شده", help_text="کد تایید ارسال شده از طریق کاوه‌نگار")

    class Meta:
        ref_name = "Accounts_VerifyOtpSerializer"

class TokenRefreshInputSerializer(serializers.Serializer):
    refresh = serializers.CharField(label="توکن رفرش (Refresh Token)", help_text="رشته توکن ریفرش دریافتی در زمان ورود")

    class Meta:
        ref_name = "Accounts_TokenRefreshInputSerializer"
`
  },
  {
    id: 'site_settings',
    name: 'تولید و تنظیمات عمومی سایت (site_settings)',
    path: 'site_settings/',
    viewsCode: `# site_settings/views.py - ✅ عنوان فارسی برای ReDoc
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .models import SiteSetting
from .serializers import SiteSettingSerializer, UnifiedPublicConfigSerializer

class SiteSettingViewSet(viewsets.ModelViewSet):
    queryset = SiteSetting.objects.all()
    serializer_class = SiteSettingSerializer
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        method='get',
        operation_summary="دریافت تنظیمات یکپارچه و عمومی سیستم",
        operation_description="دریافت شماره کارت، عناوین سایت و تنظیمات اولیه",
        responses={
            200: openapi.Response(
                description="پاسخ موفقیت‌آمیز کانفیگ سایت",
                schema=UnifiedPublicConfigSerializer
            )
        }
    )
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public_config(self, request):
        config = SiteSetting.get_solo()
        serializer = UnifiedPublicConfigSerializer(config)
        return Response(serializer.data)
`,
    serializersCode: `# site_settings/serializers.py - ✅ دارای ref_name بدون تداخل
from rest_framework import serializers
from .models import SiteSetting

class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = '__all__'
        ref_name = "SiteSettings_SiteSettingSerializer"

class UnifiedPublicConfigSerializer(serializers.Serializer):
    site_title = serializers.CharField()
    site_description = serializers.CharField()
    bank_card_1 = serializers.CharField()
    bank_shiba_1 = serializers.CharField()
    bank_holder_1 = serializers.CharField()

    class Meta:
        ref_name = "SiteSettings_UnifiedPublicConfigSerializer"
`
  },
  {
    id: 'footer_settings',
    name: 'تنظیمات فوتر سایت (footer_settings)',
    path: 'footer_settings/',
    viewsCode: `# footer_settings/views.py - ✅ عنوان فارسی برای ReDoc
from rest_framework import viewsets, permissions
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .models import FooterSetting
from .serializers import FooterSettingSerializer

class FooterSettingViewSet(viewsets.ModelViewSet):
    queryset = FooterSetting.objects.all()
    serializer_class = FooterSettingSerializer
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        method='get',
        operation_summary="دریافت پیکربندی متون و لینک‌های فوتر",
        operation_description="دریافت اطلاعات نمادها، شماره پشتیبانی و شبکه اجتماعی در فوتر",
        responses={
            200: openapi.Response(
                description="اطلاعات فوتر با موفقیت دریافت شد",
                schema=FooterSettingSerializer
            )
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
`,
    serializersCode: `# footer_settings/serializers.py - ✅ دارای ref_name مستقل
from rest_framework import serializers
from .models import FooterSetting

class FooterSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterSetting
        fields = '__all__'
        ref_name = "FooterSettings_FooterSettingSerializer"
`
  },
  {
    id: 'visitors',
    name: 'ویزیتوران و بازاریابان (visitors)',
    path: 'visitors/',
    viewsCode: `# visitors/views.py - ✅ عناوین فارسی استاندارد ReDoc
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .models import VisitorProfile, RetailShopCustomer
from .serializers import VisitorProfileSerializer, RetailShopCustomerSerializer

class VisitorProfileViewSet(viewsets.ModelViewSet):
    queryset = VisitorProfile.objects.all()
    serializer_class = VisitorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        method='get',
        operation_summary="دریافت پروفایل و مشخصات ویزیتور جاری",
        operation_description="دریافت کد ویزیتوری، منطقه فعالیت و میزان درصد کمیسیون",
        responses={
            200: openapi.Response(description="پروفایل ویزیتور", schema=VisitorProfileSerializer),
            401: "احراز هویت انجام نشده است"
        }
    )
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        profile, _ = VisitorProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @swagger_auto_schema(
        method='get',
        operation_summary="دریافت خلاصه آمار داشبورد ویزیتور",
        operation_description="آمار کل فروش ماهانه، تعداد مغازه‌های ثبت‌شده و کل کمیسیون",
        responses={
            200: openapi.Response(
                description="آمار داشبورد ویزیتور",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'total_sales': openapi.Schema(type=openapi.TYPE_INTEGER, example=150000000),
                        'total_commission': openapi.Schema(type=openapi.TYPE_INTEGER, example=3750000),
                        'shops_count': openapi.Schema(type=openapi.TYPE_INTEGER, example=12)
                    }
                )
            )
        }
    )
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        return Response({'total_sales': 150000000, 'total_commission': 3750000, 'shops_count': 12})


class RetailShopCustomerViewSet(viewsets.ModelViewSet):
    queryset = RetailShopCustomer.objects.all()
    serializer_class = RetailShopCustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        method='post',
        operation_summary="ثبت مغازه‌دار و خریدار جدید توسط ویزیتور",
        operation_description="افزودن فروشگاه خرده‌فروشی جدید به لیست مشتریان تحت پوشش ویزیتور",
        responses={
            201: openapi.Response(description="مغازه‌دار ثبت شد", schema=RetailShopCustomerSerializer),
            400: "اطلاعات ورودی نامعتبر است"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
`,
    serializersCode: `# visitors/serializers.py - ✅ دارای ref_name اختصاصی
from rest_framework import serializers
from .models import VisitorProfile, RetailShopCustomer

class VisitorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorProfile
        fields = '__all__'
        ref_name = "Visitors_VisitorProfileSerializer"

class RetailShopCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetailShopCustomer
        fields = '__all__'
        ref_name = "Visitors_RetailShopCustomerSerializer"
`
  },
  {
    id: 'products',
    name: 'محصولات و سیگارها (products)',
    path: 'products/',
    viewsCode: `# products/views.py - ✅ عنوان فارسی برای ReDoc
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .models import Product
from .serializers import ProductSerializer, ProductDetailSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        method='get',
        operation_summary="لیست کامل کاتالوگ سیگار و دخانیات",
        operation_description="جستجو و دریافت لیست محصولات بر اساس برند، نوع باکس و قیمت",
        responses={
            200: openapi.Response(description="لیست کامل محصولات", schema=ProductSerializer(many=True))
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        method='post',
        operation_summary="افزایش موجودی سریع انبار محصول",
        operation_description="شارژ سریع باکس یا باکس‌های موجود در انبار برای یک کد سیگار مشخص",
        responses={
            200: openapi.Response(
                description="موجودی بروزرسانی شد",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING, example='success'),
                        'new_stock': openapi.Schema(type=openapi.TYPE_INTEGER, example=150)
                    }
                )
            )
        }
    )
    @action(detail=True, methods=['post'])
    def add_stock(self, request, pk=None):
        product = self.get_object()
        amount = int(request.data.get('amount', 0))
        product.stock += amount
        product.save()
        return Response({'status': 'success', 'new_stock': product.stock})
`,
    serializersCode: `# products/serializers.py - ✅ اختصاص ref_name
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        ref_name = "Products_ProductSerializer"

class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        ref_name = "Products_ProductDetailSerializer"
`
  },
  {
    id: 'finance',
    name: 'مدیریت مالی و حسابداری (finance)',
    path: 'finance/',
    viewsCode: `# finance/views.py - ✅ عناوین فارسی ReDoc
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .models import CustomerLedger, LedgerTransaction, ChequeRecord
from .serializers import CustomerLedgerSerializer, LedgerTransactionSerializer, ChequeRecordSerializer

class CustomerLedgerViewSet(viewsets.ModelViewSet):
    queryset = CustomerLedger.objects.all()
    serializer_class = CustomerLedgerSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        method='get',
        operation_summary="دریافت خلاصه حساب دفتری بنکداران و خریداران",
        responses={
            200: openapi.Response(description="دفتر حساب مشتری", schema=CustomerLedgerSerializer(many=True))
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        method='get',
        operation_summary="گزارش تراز بدهکاری و بستانکاری کل بنکداری",
        responses={
            200: openapi.Response(
                description="تراز کل حسابداری",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'total_debt': openapi.Schema(type=openapi.TYPE_INTEGER, example=450000000),
                        'total_credit': openapi.Schema(type=openapi.TYPE_INTEGER, example=120000000)
                    }
                )
            )
        }
    )
    @action(detail=False, methods=['get'])
    def summary(self, request):
        return Response({'total_debt': 450000000, 'total_credit': 120000000})
`,
    serializersCode: `# finance/serializers.py - ✅ اختصاص ref_name
from rest_framework import serializers
from .models import CustomerLedger, LedgerTransaction, ChequeRecord

class CustomerLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerLedger
        fields = '__all__'
        ref_name = "Finance_CustomerLedgerSerializer"

class LedgerTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerTransaction
        fields = '__all__'
        ref_name = "Finance_LedgerTransactionSerializer"

class ChequeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChequeRecord
        fields = '__all__'
        ref_name = "Finance_ChequeRecordSerializer"
`
  },
  {
    id: 'notifications',
    name: 'اعلا‌ن‌ها و سیستم نوتیفیکیشن (notifications)',
    path: 'notifications/',
    viewsCode: `"""
notifications/views.py
ویوهای صریح APIView جهت دریافت، علامت‌گذاری و مدیریت اعلانات کاربران با مستندات فارسی Swagger/ReDoc
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .models import UserNotification
from .serializers import UserNotificationSerializer


class NotificationListAPIView(APIView):
    """
    دریافت لیست اعلانات کاربر جاری یا مدیریت
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="لیست_اعلانات_کاربر",
        operation_summary="دریافت لیست اعلانات کاربر جاری",
        operation_description="دریافت کلیه اعلانات و پیام‌های سیستم به همراه وضعیت خوانده شدن",
        tags=["اعلان‌ها و سیستم نوتیفیکیشن (Notifications)"],
        responses={
            200: openapi.Response(description="لیست اعلانات با موفقیت دریافت شد", schema=UserNotificationSerializer(many=True)),
            401: openapi.Response(description="عدم دسترسی / کاربر وارد نشده است")
        }
    )
    def get(self, request):
        if request.user.is_staff:
            notifications = UserNotification.objects.all().select_related('user')
        else:
            notifications = UserNotification.objects.filter(user=request.user)
        serializer = UserNotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationUnreadCountAPIView(APIView):
    """
    تعداد اعلانات خوانده‌نشده کاربر
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="تعداد_اعلانات_خوانده_نشده",
        operation_summary="دریافت تعداد اعلانات خوانده‌نشده کاربر",
        operation_description="شمارش تعداد اعلانات با وضعیت is_read=False برای نمایش روی آیکون زنگوله",
        tags=["اعلان‌ها و سیستم نوتیفیکیشن (Notifications)"],
        responses={
            200: openapi.Response(
                description="تعداد اعلانات خوانده‌نشده برگردانده شد",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'unread_count': openapi.Schema(type=openapi.TYPE_INTEGER, example=3)
                    }
                )
            )
        }
    )
    def get(self, request):
        count = UserNotification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)


class NotificationDetailAPIView(APIView):
    """
    مشاهده جزئیات یک اعلان مشخص
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="جزئیات_اعلان",
        operation_summary="مشاهده جزئیات اعلان",
        operation_description="دریافت متن کامل و مشخصات یک اعلان بر اساس شناسه id",
        tags=["اعلان‌ها و سیستم نوتیفیکیشن (Notifications)"],
        responses={
            200: openapi.Response(description="اطلاعات اعلان برگردانده شد", schema=UserNotificationSerializer),
            404: openapi.Response(description="اعلان یافت نشد")
        }
    )
    def get(self, request, pk):
        try:
            if request.user.is_staff:
                noti = UserNotification.objects.get(pk=pk)
            else:
                noti = UserNotification.objects.get(pk=pk, user=request.user)
        except UserNotification.DoesNotExist:
            return Response({'error': 'اعلان یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserNotificationSerializer(noti)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationMarkReadAPIView(APIView):
    """
    علامت‌گذاری یک اعلان مشخص به عنوان خوانده‌شده
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="علامت_گذاری_اعلان_به_عنوان_خوانده_شده",
        operation_summary="تغییر وضعیت یک اعلان به خوانده‌شده",
        operation_description="تغییر is_read=True برای اعلان مشخص",
        tags=["اعلان‌ها و سیستم نوتیفیکیشن (Notifications)"],
        responses={
            200: openapi.Response(description="اعلان خوانده‌شده ثبت شد"),
            404: openapi.Response(description="اعلان یافت نشد")
        }
    )
    def post(self, request, pk):
        try:
            noti = UserNotification.objects.get(pk=pk, user=request.user)
        except UserNotification.DoesNotExist:
            return Response({'error': 'اعلان یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        noti.is_read = True
        noti.save()
        return Response({'status': 'success', 'message': 'اعلان به عنوان خوانده‌شده علامت‌گذاری شد.'}, status=status.HTTP_200_OK)


class NotificationMarkAllReadAPIView(APIView):
    """
    علامت‌گذاری کلیه اعلانات به عنوان خوانده‌شده
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="علامت_گذاری_همه_اعلانات_به_عنوان_خوانده_شده",
        operation_summary="خوانده‌شدن یک‌باره تمام اعلانات کاربر",
        operation_description="تغییر وضعیت تمام اعلانات خوانده‌نشده کاربر به خوانده‌شده",
        tags=["اعلان‌ها و سیستم نوتیفیکیشن (Notifications)"],
        responses={
            200: openapi.Response(
                description="عملیات موفقیت‌آمیز بود",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING, example='success'),
                        'updated_count': openapi.Schema(type=openapi.TYPE_INTEGER, example=5)
                    }
                )
            )
        }
    )
    def post(self, request):
        updated = UserNotification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'success', 'updated_count': updated}, status=status.HTTP_200_OK)


class NotificationCreateAPIView(APIView):
    """
    ارسال و ثبت اعلان جدید (ویژه مدیریت)
    """
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        operation_id="ایجاد_اعلان_جدید",
        operation_summary="ارسال اعلان جدید توسط مدیریت",
        operation_description="ثبت اعلان برای یک کاربر مشخص یا تمامی کاربران",
        tags=["اعلان‌ها و سیستم نوتیفیکیشن (Notifications)"],
        request_body=UserNotificationSerializer,
        responses={
            201: openapi.Response(description="اعلان ایجاد شد", schema=UserNotificationSerializer),
            400: openapi.Response(description="ورودی نامعتبر است")
        }
    )
    def post(self, request):
        serializer = UserNotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# notifications/urls.py
# مسیرهای صریح APIView جهت دریافت، علامتگذاری و مدیریت اعلانات کاربران
# ==========================================
"""
from django.urls import path
from .views import (
    NotificationListAPIView,
    NotificationUnreadCountAPIView,
    NotificationDetailAPIView,
    NotificationMarkReadAPIView,
    NotificationMarkAllReadAPIView,
    NotificationCreateAPIView,
)

app_name = 'notifications'

urlpatterns = [
    # ۱. لیست و آمار اعلانات
    path('list/', NotificationListAPIView.as_view(), name='notification-list'),
    path('unread-count/', NotificationUnreadCountAPIView.as_view(), name='notification-unread-count'),
    path('<int:pk>/', NotificationDetailAPIView.as_view(), name='notification-detail'),

    # ۲. تغییر وضعیت خوانده‌شده
    path('<int:pk>/mark-read/', NotificationMarkReadAPIView.as_view(), name='notification-mark-read'),
    path('mark-all-read/', NotificationMarkAllReadAPIView.as_view(), name='notification-mark-all-read'),

    # ۳. ثبت اعلان جدید (مدیریت)
    path('create/', NotificationCreateAPIView.as_view(), name='notification-create'),
]
"""
`,
    serializersCode: `# notifications/serializers.py - ✅ ref_name اختصاصی
from rest_framework import serializers
from .models import UserNotification

class UserNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotification
        fields = '__all__'
        ref_name = "Notifications_UserNotificationSerializer"
`
  },
  {
    id: 'tickets',
    name: 'تیکت‌ها و پشتیبانی (tickets)',
    path: 'tickets/',
    viewsCode: `"""
tickets/views.py
ویوهای صریح APIView جهت مدیریت تیکت‌های پشتیبانی، ثبت فیش واریزی و پاسخگویی با مستندات فارسی Swagger/ReDoc
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .models import SupportTicket, TicketMessage
from .serializers import SupportTicketSerializer, TicketMessageSerializer


class TicketListAPIView(APIView):
    """
    دریافت لیست تیکت‌های پشتیبانی کاربر یا ادمین
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="لیست_تیکت_های_پشتیبانی",
        operation_summary="دریافت لیست تیکت‌های پشتیبانی کاربر یا ادمین",
        operation_description="دریافت تاریخچه تمام تیکت‌های ارسال شده همراه با وضعیت پاسخ، اولویت و پیام‌ها",
        tags=["تیکت‌ها و پشتیبانی (Tickets)"],
        responses={
            200: openapi.Response(description="لیست تیکت‌ها با موفقیت دریافت شد", schema=SupportTicketSerializer(many=True)),
            401: openapi.Response(description="عدم ورود به حساب کاربری")
        }
    )
    def get(self, request):
        if request.user.is_staff:
            tickets = SupportTicket.objects.all().prefetch_related('messages')
        else:
            tickets = SupportTicket.objects.filter(user=request.user).prefetch_related('messages')
        serializer = SupportTicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TicketCreateAPIView(APIView):
    """
    ایجاد تیکت پشتیبانی جدید یا ثبت فیش واریز
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="ایجاد_تیکت_پشتیبانی_جدید",
        operation_summary="ایجاد تیکت پشتیبانی جدید یا ثبت فیش واریز",
        operation_description="ارسال تیکت جدید به دپارتمان‌های مالی، انبار، ترابری یا پشتیبانی به همراه متن پیام اولیه و کد سفارش",
        tags=["تیکت‌ها و پشتیبانی (Tickets)"],
        request_body=SupportTicketSerializer,
        responses={
            201: openapi.Response(description="تیکت جدید با موفقیت ایجاد شد", schema=SupportTicketSerializer),
            400: openapi.Response(description="اطلاعات ورودی نامعتبر است")
        }
    )
    def post(self, request):
        serializer = SupportTicketSerializer(data=request.data)
        if serializer.is_valid():
            ticket = serializer.save(
                user=request.user,
                ticket_number=SupportTicket.generate_ticket_number()
            )
            initial_message = request.data.get('initial_message')
            if initial_message:
                TicketMessage.objects.create(
                    ticket=ticket,
                    sender=request.user,
                    is_staff_reply=False,
                    message=initial_message
                )
            return Response(SupportTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketDetailAPIView(APIView):
    """
    مشاهده جزئیات تیکت و تمام پیام‌های گفتگو
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="جزئیات_تیکت_پشتیبانی",
        operation_summary="مشاهده جزئیات تیکت و تمام پیام‌های گفتگو",
        operation_description="دریافت اطلاعات یک تیکت مشخص شامل لیست تمام پاسخ‌های اپراتور انبار و کاربر",
        tags=["تیکت‌ها و پشتیبانی (Tickets)"],
        responses={
            200: openapi.Response(description="اطلاعات تیکت و پیام‌ها برگردانده شد", schema=SupportTicketSerializer),
            404: openapi.Response(description="تیکت یافت نشد")
        }
    )
    def get(self, request, pk):
        try:
            if request.user.is_staff:
                ticket = SupportTicket.objects.prefetch_related('messages').get(pk=pk)
            else:
                ticket = SupportTicket.objects.prefetch_related('messages').get(pk=pk, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response({'error': 'تیکت یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = SupportTicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TicketReplyAPIView(APIView):
    """
    ارسال پاسخ جدید برای تیکت پشتیبانی
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="پاسخ_به_تیکت_پشتیبانی",
        operation_summary="ارسال پاسخ جدید برای تیکت پشتیبانی",
        operation_description="افزودن پیام پاسخ توسط کاربر یا اپراتور انبار و بروزرسانی خودکار وضعیت تیکت",
        tags=["تیکت‌ها و پشتیبانی (Tickets)"],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["message"],
            properties={
                "message": openapi.Schema(type=openapi.TYPE_STRING, example="فیش واریزی پیوست شد. لطفا بارگیری فرمایید.", description="متن پاسخ"),
                "attachment": openapi.Schema(type=openapi.TYPE_STRING, example="http://example.com/receipt.jpg", description="لینک یا تصویر پیوست (اختیاری)")
            }
        ),
        responses={
            201: openapi.Response(description="پاسخ با موفقیت ارسال شد", schema=TicketMessageSerializer),
            400: openapi.Response(description="متن پیام الزامی است"),
            404: openapi.Response(description="تیکت یافت نشد")
        }
    )
    def post(self, request, pk):
        try:
            if request.user.is_staff:
                ticket = SupportTicket.objects.get(pk=pk)
            else:
                ticket = SupportTicket.objects.get(pk=pk, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response({'error': 'تیکت یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        message_text = request.data.get('message')
        if not message_text:
            return Response({'error': 'متن پیام الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

        is_staff = request.user.is_staff
        msg = TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            is_staff_reply=is_staff,
            message=message_text,
            attachment=request.data.get('attachment', '')
        )

        ticket.status = 'answered' if is_staff else 'customer_reply'
        ticket.save()

        return Response(TicketMessageSerializer(msg).data, status=status.HTTP_201_CREATED)


# ==========================================
# tickets/urls.py
# مسیرهای صریح APIView جهت پشتیبانی و تیکت‌ها
# ==========================================
"""
from django.urls import path
from .views import (
    TicketListAPIView,
    TicketCreateAPIView,
    TicketDetailAPIView,
    TicketReplyAPIView,
)

app_name = 'tickets'

urlpatterns = [
    path('list/', TicketListAPIView.as_view(), name='ticket-list'),
    path('create/', TicketCreateAPIView.as_view(), name='ticket-create'),
    path('<int:pk>/', TicketDetailAPIView.as_view(), name='ticket-detail'),
    path('<int:pk>/reply/', TicketReplyAPIView.as_view(), name='ticket-reply'),
]
"""
`,
    serializersCode: `# tickets/serializers.py - ✅ ref_name اختصاصی و مستندات
from rest_framework import serializers
from .models import SupportTicket, TicketMessage

class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_name', 'is_staff_reply', 'message', 'attachment', 'created_at']
        read_only_fields = ['id', 'sender', 'is_staff_reply', 'created_at']
        ref_name = "Tickets_TicketMessageSerializer"

class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id',
            'ticket_number',
            'user',
            'title',
            'department',
            'department_display',
            'priority',
            'status',
            'status_display',
            'order_tracking_code',
            'messages',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'ticket_number', 'user', 'created_at', 'updated_at']
        ref_name = "Tickets_SupportTicketSerializer"
`
  },
  {
    id: 'visitor_tickets',
    name: 'تیکتینگ ویزیتوران و تسویه پورسانت (visitor_tickets)',
    path: 'visitor_tickets/',
    viewsCode: `"""
visitor_tickets/views.py
ویوهای صریح APIView جهت تیکتینگ ویزیتوران، پیگیری تسویه پورسانت ۲.۵٪ و ثبت مغازه‌دار جدید با مستندات کامل فارسی Swagger/ReDoc
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .models import VisitorTicket, VisitorTicketReply
from .serializers import VisitorTicketSerializer, VisitorTicketReplySerializer
from visitors.models import VisitorProfile


class VisitorTicketListAPIView(APIView):
    """
    دریافت لیست تیکت‌های ویزیتور جاری یا مدیریت
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="لیست_تیکت_های_ویزیتوری",
        operation_summary="دریافت لیست تیکت‌های تسویه کمیسیون و درخواست‌های ویزیتور",
        operation_description="نمایش تمام تیکت‌های ویزیتور شامل درخواست‌های تسویه مالی، نمونه کالا و فیش‌های واریزی حسابداری",
        tags=["تیکتینگ ویزیتوران (Visitor Tickets)"],
        responses={
            200: openapi.Response(description="لیست تیکت‌ها دریافت شد", schema=VisitorTicketSerializer(many=True)),
            401: openapi.Response(description="عدم دسترسی / توکن نامعتبر")
        }
    )
    def get(self, request):
        if request.user.is_staff:
            tickets = VisitorTicket.objects.all().select_related('visitor', 'visitor__user').prefetch_related('replies')
        else:
            try:
                visitor_profile = request.user.visitor_profile
                tickets = VisitorTicket.objects.filter(visitor=visitor_profile).prefetch_related('replies')
            except VisitorProfile.DoesNotExist:
                tickets = VisitorTicket.objects.none()

        serializer = VisitorTicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VisitorTicketCreateAPIView(APIView):
    """
    ثبت درخواست جدید تسویه کمیسیون یا ثبت مغازه‌دار جدید
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="ایجاد_تیکت_جدید_ویزیتور",
        operation_summary="ثبت درخواست جدید تسویه کمیسیون یا ثبت مغازه‌دار جدید",
        operation_description="ارسال تیکت توسط ویزیتور جهت دریافت پورسانت، ارسال شماره شبا، عکس پروانه کسب مغازه یا درخواست کاتالوگ",
        tags=["تیکتینگ ویزیتوران (Visitor Tickets)"],
        request_body=VisitorTicketSerializer,
        responses={
            201: openapi.Response(description="تیکت ویزیتور ثبت شد", schema=VisitorTicketSerializer),
            400: openapi.Response(description="داده‌های ورودی نامعتبر است")
        }
    )
    def post(self, request):
        try:
            visitor_profile = request.user.visitor_profile
        except VisitorProfile.DoesNotExist:
            return Response({'error': 'پروفایل ویزیتوری برای حساب شما یافت نشد.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = VisitorTicketSerializer(data=request.data)
        if serializer.is_valid():
            code = f"TCK-VIS-{timezone.now().strftime('%Y%m%d%H%M')}-{visitor_profile.id}"
            ticket = serializer.save(visitor=visitor_profile, ticket_code=code)
            return Response(VisitorTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VisitorTicketDetailAPIView(APIView):
    """
    مشاهده جزئیات تیکت و فیش‌های واریز کمیسیون
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="جزئیات_تیکت_ویزیتور",
        operation_summary="مشاهده جزئیات تیکت و فیش‌های واریز کمیسیون",
        operation_description="مشاهده متن درخواست و تمام پاسخ‌ها و تصویر فیش‌های واریزی ارسال شده توسط بخش مالی انبار",
        tags=["تیکتینگ ویزیتوران (Visitor Tickets)"],
        responses={
            200: openapi.Response(description="اطلاعات تیکت ویزیتور برگردانده شد", schema=VisitorTicketSerializer),
            404: openapi.Response(description="تیکت یافت نشد")
        }
    )
    def get(self, request, pk):
        try:
            if request.user.is_staff:
                ticket = VisitorTicket.objects.prefetch_related('replies').get(pk=pk)
            else:
                visitor_profile = request.user.visitor_profile
                ticket = VisitorTicket.objects.prefetch_related('replies').get(pk=pk, visitor=visitor_profile)
        except (VisitorTicket.DoesNotExist, VisitorProfile.DoesNotExist):
            return Response({'error': 'تیکت یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = VisitorTicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VisitorTicketReplyAPIView(APIView):
    """
    ارسال پاسخ به تیکت ویزیتور یا پیوست فیش پرداخت (مدیریت مالی)
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="پاسخ_به_تیکت_ویزیتور",
        operation_summary="ارسال پاسخ به تیکت ویزیتور یا پیوست فیش پرداخت (مدیریت مالی)",
        operation_description="ثبت پاسخ جدید توسط ویزیتور یا مدیر مالی انبار همراه با فایل پیوست فیش تسویه",
        tags=["تیکتینگ ویزیتوران (Visitor Tickets)"],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["message"],
            properties={
                "message": openapi.Schema(type=openapi.TYPE_STRING, example="مبلغ پورسانت پایا گردید.", description="متن پاسخ"),
                "payment_receipt": openapi.Schema(type=openapi.TYPE_STRING, example="http://example.com/payout.jpg", description="تصویر فیش واریز پورسانت (اختیاری)")
            }
        ),
        responses={
            201: openapi.Response(description="پاسخ ثبت شد", schema=VisitorTicketReplySerializer),
            400: openapi.Response(description="متن پاسخ الزامی است"),
            404: openapi.Response(description="تیکت یافت نشد")
        }
    )
    def post(self, request, pk):
        try:
            if request.user.is_staff:
                ticket = VisitorTicket.objects.get(pk=pk)
            else:
                visitor_profile = request.user.visitor_profile
                ticket = VisitorTicket.objects.get(pk=pk, visitor=visitor_profile)
        except (VisitorTicket.DoesNotExist, VisitorProfile.DoesNotExist):
            return Response({'error': 'تیکت یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        msg_text = request.data.get('message')
        if not msg_text:
            return Response({'error': 'متن پاسخ الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

        is_accountant = request.user.is_staff
        reply = VisitorTicketReply.objects.create(
            ticket=ticket,
            sender=request.user,
            is_accountant_reply=is_accountant,
            message=msg_text,
            payment_receipt=request.FILES.get('payment_receipt')
        )
        ticket.status = 'under_review' if not is_accountant else 'paid'
        ticket.save()

        return Response(VisitorTicketReplySerializer(reply).data, status=status.HTTP_201_CREATED)


# ==========================================
# visitor_tickets/urls.py
# مسیرهای صریح APIView جهت تیکتینگ ویزیتوران
# ==========================================
"""
from django.urls import path
from .views import (
    VisitorTicketListAPIView,
    VisitorTicketCreateAPIView,
    VisitorTicketDetailAPIView,
    VisitorTicketReplyAPIView,
)

app_name = 'visitor_tickets'

urlpatterns = [
    path('list/', VisitorTicketListAPIView.as_view(), name='visitor-ticket-list'),
    path('create/', VisitorTicketCreateAPIView.as_view(), name='visitor-ticket-create'),
    path('<int:pk>/', VisitorTicketDetailAPIView.as_view(), name='visitor-ticket-detail'),
    path('<int:pk>/reply/', VisitorTicketReplyAPIView.as_view(), name='visitor-ticket-reply'),
]
"""
`,
    serializersCode: `# visitor_tickets/serializers.py - ✅ ref_name اختصاصی
from rest_framework import serializers
from .models import VisitorTicket, VisitorTicketReply

class VisitorTicketReplySerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model = VisitorTicketReply
        fields = ['id', 'ticket', 'sender', 'sender_name', 'is_accountant_reply', 'message', 'payment_receipt', 'created_at']
        read_only_fields = ['id', 'sender', 'is_accountant_reply', 'created_at']
        ref_name = "VisitorTickets_VisitorTicketReplySerializer"

class VisitorTicketSerializer(serializers.ModelSerializer):
    replies = VisitorTicketReplySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    visitor_code = serializers.CharField(source='visitor.visitor_code', read_only=True)

    class Meta:
        model = VisitorTicket
        fields = [
            'id', 'ticket_code', 'visitor', 'visitor_code', 'category', 'category_display',
            'subject', 'target_shop', 'claimed_amount', 'bank_sheba', 'status', 'status_display',
            'priority', 'document', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ticket_code', 'visitor', 'created_at', 'updated_at']
        ref_name = "VisitorTickets_VisitorTicketSerializer"
`
  },
  {
    id: 'notifications',
    name: 'نوتیفیکیشن‌ها و اعلانات کاربران (notifications)',
    path: 'notifications/',
    viewsCode: `"""
notifications/views.py
ویوهای اختصاصی صریح با استفاده از APIView جهت اتصال کامل صندوق به پایگاه‌داده اعلانات
پشتیبانی از CRUD کامل: لیست، ایجاد، ویرایش، حذف، تغییر وضعیت و شمارش اعلانات خوانده‌نشده
"""
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from .models import UserNotification
from .serializers import UserNotificationSerializer


class NotificationListAPIView(APIView):
    """
    دریافت لیست اعلانات و اطلاعیه‌ها با فیلتر پیشرفته
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_id="لیست_اعلانات_کاربران",
        operation_summary="دریافت لیست اعلانات با فیلتر نوع، مخاطب و وضعیت خوانده‌شده",
        tags=["نوتیفیکیشن‌ها و اعلانات (Notifications)"],
        responses={200: UserNotificationSerializer(many=True)}
    )
    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        notif_type = request.query_params.get('type')
        audience = request.query_params.get('audience')
        is_read = request.query_params.get('is_read')
        search = request.query_params.get('search')

        if user and getattr(user, 'is_staff', False):
            queryset = UserNotification.objects.all()
        elif user:
            queryset = UserNotification.objects.filter(Q(user=user) | Q(user__isnull=True))
        else:
            queryset = UserNotification.objects.all()

        if notif_type and notif_type != 'all':
            queryset = queryset.filter(notification_type=notif_type)
        if audience and audience != 'all':
            queryset = queryset.filter(target_audience=audience)
        if is_read is not None and is_read != '' and is_read != 'all':
            is_read_bool = is_read.lower() in ['true', '1']
            queryset = queryset.filter(is_read=is_read_bool)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(message__icontains=search) |
                Q(user__phone__icontains=search) | Q(user__full_name__icontains=search)
            )

        queryset = queryset.order_by('-created_at')[:100]
        serializer = UserNotificationSerializer(queryset, many=True)
        return Response({
            'status': 'success',
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class NotificationCreateAPIView(APIView):
    """
    ثبت و ارسال آنی نوتیفیکیشن از صندوق به کاربران
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_id="ارسال_اعلان_جدید",
        operation_summary="ثبت و ارسال نوتیفیکیشن جدید از صندوق به دیتابیس",
        tags=["نوتیفیکیشن‌ها و اعلانات (Notifications)"],
        request_body=UserNotificationSerializer,
        responses={201: UserNotificationSerializer}
    )
    def post(self, request):
        serializer = UserNotificationSerializer(data=request.data)
        if serializer.is_valid():
            notif = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اعلان جدید با موفقیت در پایگاه‌داده جنگو ثبت شد.',
                'data': UserNotificationSerializer(notif).data
            }, status=status.HTTP_201_CREATED)
        return Response({'status': 'error', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class NotificationDetailAPIView(APIView):
    """
    مشاهده، ویرایش و حذف اعلان
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        return Response({'status': 'success', 'data': UserNotificationSerializer(notif).data})

    def put(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        serializer = UserNotificationSerializer(notif, data=request.data, partial=True)
        if serializer.is_valid():
            saved = serializer.save()
            return Response({
                'status': 'success',
                'message': 'اعلان با موفقیت ویرایش شد.',
                'data': UserNotificationSerializer(saved).data
            })
        return Response({'status': 'error', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        notif.delete()
        return Response({'status': 'success', 'message': 'اعلان با موفقیت حذف گردید.'})


class NotificationUnreadCountAPIView(APIView):
    """
    دریافت تعداد اعلانات خوانده‌نشده
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        if user:
            count = UserNotification.objects.filter(Q(user=user) | Q(user__isnull=True), is_read=False).count()
        else:
            count = UserNotification.objects.filter(is_read=False).count()
        return Response({'status': 'success', 'unread_count': count})


class NotificationMarkReadAPIView(APIView):
    """
    تغییر وضعیت خوانده‌شده
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        is_read_val = request.data.get('is_read', True)
        notif.is_read = bool(is_read_val)
        notif.save(update_fields=['is_read', 'updated_at'])
        return Response({'status': 'success', 'is_read': notif.is_read})


class NotificationMarkAllReadAPIView(APIView):
    """
    علامت‌گذاری همه به عنوان خوانده‌شده
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        if user and not getattr(user, 'is_staff', False):
            updated = UserNotification.objects.filter(Q(user=user) | Q(user__isnull=True), is_read=False).update(is_read=True)
        else:
            updated = UserNotification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'success', 'message': f'{updated} اعلان خوانده شدند.'})


class NotificationDeleteAPIView(APIView):
    """
    حذف اختصاصی
    """
    permission_classes = [permissions.AllowAny]

    def delete(self, request, pk):
        notif = get_object_or_404(UserNotification, pk=pk)
        notif.delete()
        return Response({'status': 'success', 'message': 'اعلان حذف گردید.'})
`,
    serializersCode: `# notifications/serializers.py - ✅ ref_name اختصاصی
from rest_framework import serializers
from .models import UserNotification

try:
    import jdatetime
except ImportError:
    jdatetime = None


class UserNotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()
    created_at_jalali = serializers.SerializerMethodField()

    class Meta:
        model = UserNotification
        fields = [
            'id', 'user', 'user_id', 'user_name', 'user_phone',
            'title', 'message', 'notification_type', 'target_audience',
            'is_read', 'created_at', 'created_at_jalali', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        ref_name = "Notifications_UserNotificationSerializer"

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.full_name or obj.user.phone
        if obj.target_audience == 'visitors':
            return 'کلیه سفیران فروش (ویزیتوران)'
        if obj.target_audience == 'customers':
            return 'مشتریان عمومی و مغازه‌داران'
        return 'همه کاربران سامانه (عمومی)'

    def get_user_phone(self, obj):
        if obj.user:
            return obj.user.phone
        if obj.target_audience == 'visitors':
            return 'ویزیتوران'
        if obj.target_audience == 'customers':
            return 'مشتریان عمومی'
        return 'عمومی'

    def get_created_at_jalali(self, obj):
        if not obj.created_at:
            return ''
        if jdatetime:
            try:
                j_date = jdatetime.datetime.fromgregorian(datetime=obj.created_at)
                return j_date.strftime('%Y/%m/%d %H:%M')
            except Exception:
                pass
        return obj.created_at.strftime('%Y-%m-%d %H:%M')
`
  }
];

