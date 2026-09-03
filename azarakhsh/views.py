from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import CustomerTier, CustomerProfile, BankDepositSlip, WalletTransaction
from .serializers import (
    CustomerTierSerializer,
    CustomerProfileSerializer,
    BankDepositSlipSerializer,
    WalletTransactionSerializer
)

# ==============================================================================
# 1. Customer Tier ViewSet
# ==============================================================================
class CustomerTierViewSet(viewsets.ReadOnlyModelViewSet):
    """لیست و مشخصات سطوح و رنگ کارت‌های اعتباری تعریف‌شده در دیتابیس"""
    queryset = CustomerTier.objects.filter(is_active=True)
    serializer_class = CustomerTierSerializer
    permission_classes = [permissions.AllowAny]


# ==============================================================================
# 2. Customer Profile ViewSet (Normal & App Customer Hub)
# ==============================================================================
class CustomerProfileViewSet(viewsets.ModelViewSet):
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer

    @action(detail=False, methods=['get'])
    def my_financial_status(self, request):
        """
        دریافت وضعیت کامل مالی مشتری (کیف پول، سقف اعتبار دفتری، رنگ کارت و بدهی)
        جهت نمایش در هاب مالی وب‌سایت و اپلیکیشن حضوری
        """
        phone = request.query_params.get('phone')
        if not phone:
            return Response({'error': 'شماره تلفن مشتری ارسال نشده است.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = CustomerProfile.objects.select_related('tier').get(phone_number=phone)
        except CustomerProfile.DoesNotExist:
            return Response({'error': 'پروفایل کاربری یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(profile)
        return Response({
            'status': 'success',
            'profile': serializer.data,
            'warehouse_bank_accounts': [
                {
                    'bank': 'بانک سامان (حساب اصلی پخش دخانیات سرو)',
                    'account_number': '849-810-1234567-1',
                    'card_number': '6219-8610-9988-7766',
                    'iban': 'IR120560084981001234567001',
                    'owner': 'پخش دخانیات دخانیات سرو - حسینی'
                },
                {
                    'bank': 'بانک ملت (حساب جاری بازرگانی)',
                    'account_number': '5412987654',
                    'card_number': '6104-3378-1122-3344',
                    'iban': 'IR980120000000005412987654',
                    'owner': 'بازرگانی دخانیات دخانیات سرو'
                }
            ]
        })

    @action(detail=True, methods=['post'])
    def validate_credit_purchase(self, request, pk=None):
        """
        بررسی امکان خرید نسیه بر اساس سقف اعتبار اختصاص‌داده‌شده در دیتابیس
        """
        profile = self.get_object()
        order_total = int(request.data.get('order_total', 0))

        if order_total <= 0:
            return Response({'error': 'مبلغ فاکتور نامعتبر است.'}, status=status.HTTP_400_BAD_REQUEST)

        current_debt = max(0, profile.ledger_balance)
        new_total_debt = current_debt + order_total

        if new_total_debt > profile.credit_limit:
            exceeded = new_total_debt - profile.credit_limit
            return Response({
                'allowed': False,
                'message': f'مبلغ فاکتور از سقف اعتبار دفتری شما ({profile.credit_limit:,} تومان) بیشتر است.',
                'exceeded_amount': exceeded,
                'remaining_credit': profile.remaining_credit
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'allowed': True,
            'message': 'سفارش در محدوده سقف اعتبار مجاز دفتری می‌باشد.',
            'remaining_credit_after': profile.credit_limit - new_total_debt
        })


# ==============================================================================
# 3. Bank Deposit Slip ViewSet (ثبت فیش واریز بدون درگاه آنلاین)
# ==============================================================================
class BankDepositSlipViewSet(viewsets.ModelViewSet):
    """
    سیستم ثبت فیش بانکی (جایگزین کامل درگاه آنلاین)
    مشتری فیش واریز را بارگذاری کرده و در انتظار تایید حسابداری می‌ماند.
    """
    queryset = BankDepositSlip.objects.all()
    serializer_class = BankDepositSlipSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        phone = self.request.query_params.get('phone')
        if phone:
            qs = qs.filter(customer__phone_number=phone)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @transaction.atomic
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve_slip(self, request, pk=None):
        """
        اکشن تایید فیش توسط حسابدار:
        - در صورت purpose == 'wallet_charge': کیف پول شارژ می‌شود و لاگ ایجاد می‌گردد.
        - در صورت purpose == 'ledger_settle': بدهی دفتری کسر می‌گردد.
        """
        slip = self.get_object()
        if slip.status != 'pending':
            return Response({'error': f'این فیش قبلاً در وضعیت {slip.get_status_display()} قرار گرفته است.'}, status=status.HTTP_400_BAD_REQUEST)

        customer = slip.customer
        review_note = request.data.get('notes', 'تایید و ثبت توسط حسابداری')

        if slip.purpose == 'wallet_charge':
            customer.wallet_balance += slip.amount
            customer.save(update_fields=['wallet_balance'])

            WalletTransaction.objects.create(
                customer=customer,
                amount=slip.amount,
                balance_after=customer.wallet_balance,
                transaction_type='charge_slip',
                reference_slip=slip,
                description=f"شارژ کیف پول از طریق تایید فیش بانکی {slip.tracking_number}"
            )
        elif slip.purpose == 'ledger_settle':
            customer.ledger_balance -= slip.amount
            customer.save(update_fields=['ledger_balance'])

        slip.status = 'approved'
        slip.reviewed_by = request.user
        slip.reviewed_at = timezone.now()
        slip.review_notes = review_note
        slip.save()

        return Response({
            'status': 'success',
            'message': 'فیش بانکی با موفقیت تایید و در حساب مشتری اعمال شد.',
            'new_wallet_balance': customer.wallet_balance,
            'new_ledger_balance': customer.ledger_balance
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject_slip(self, request, pk=None):
        """رد فیش نامعتبر توسط حسابدار"""
        slip = self.get_object()
        reason = request.data.get('reason', 'اطلاعات واریز با گردش حساب بانکی مطابقت ندارد.')

        slip.status = 'rejected'
        slip.reviewed_by = request.user
        slip.reviewed_at = timezone.now()
        slip.review_notes = reason
        slip.save()

        return Response({'status': 'rejected', 'message': 'فیش بانکی رد شد.'})


# ==============================================================================
# 4. Wallet Transactions ViewSet
# ==============================================================================
class WalletTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """مشاهده ریز تراکنش‌ها و گردش کیف پول مشتری"""
    queryset = WalletTransaction.objects.all()
    serializer_class = WalletTransactionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        phone = self.request.query_params.get('phone')
        if phone:
            qs = qs.filter(customer__phone_number=phone)
        return qs
