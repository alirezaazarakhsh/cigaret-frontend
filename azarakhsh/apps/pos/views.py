"""
pos/views.py
ویوهای صدور فاکتور حضوری، مدیریت شیفت و استعلام صندوق
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import PosRegister, PosShift, PosSale, PosSaleItem
from .serializers import PosRegisterSerializer, PosShiftSerializer, PosSaleSerializer
from catalog.models import CigaretteProduct


class PosRegisterViewSet(viewsets.ModelViewSet):
    queryset = PosRegister.objects.all()
    serializer_class = PosRegisterSerializer
    permission_classes = [permissions.IsAuthenticated]


class PosShiftViewSet(viewsets.ModelViewSet):
    queryset = PosShift.objects.all()
    serializer_class = PosShiftSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='open-shift')
    def open_shift(self, request):
        register_id = request.data.get('register_id')
        opening_cash = request.data.get('opening_cash', 0)
        
        # بررسی نبود شیفت باز قبلی
        active_shift = PosShift.objects.filter(cashier=request.user, status=PosShift.ShiftStatus.OPEN).first()
        if active_shift:
            return Response({'error': 'شما هم‌اکنون یک شیفت باز دارید.'}, status=status.HTTP_400_BAD_REQUEST)

        shift = PosShift.objects.create(
            cashier=request.user,
            register_id=register_id,
            opening_cash=opening_cash,
            status=PosShift.ShiftStatus.OPEN
        )
        return Response(PosShiftSerializer(shift).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='close-shift')
    def close_shift(self, request, pk=None):
        shift = self.get_object()
        closing_cash = int(request.data.get('closing_cash', 0))
        
        # محاسبه موجودی نقدی مورد انتظار
        sales_cash = shift.sales.filter(payment_method='cash').aggregate(total=models.Sum('final_amount'))['total'] or 0
        expected = shift.opening_cash + sales_cash
        
        shift.closing_cash = closing_cash
        shift.expected_cash = expected
        shift.cash_discrepancy = closing_cash - expected
        shift.status = PosShift.ShiftStatus.CLOSED
        shift.closed_at = timezone.now()
        shift.save()

        return Response(PosShiftSerializer(shift).data)


class PosSaleViewSet(viewsets.ModelViewSet):
    queryset = PosSale.objects.all()
    serializer_class = PosSaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='checkout')
    @transaction.atomic
    def checkout(self, request):
        shift_id = request.data.get('shift_id')
        items_data = request.data.get('items', [])
        payment_method = request.data.get('payment_method', PosSale.PaymentMethod.POS_CARD)
        card_ref = request.data.get('card_ref', '')
        discount = int(request.data.get('discount_amount', 0))

        if not items_data:
            return Response({'error': 'سبد خرید صندوق خالی است.'}, status=status.HTTP_400_BAD_REQUEST)

        # تولید شماره فاکتور منحصر به فرد
        inv_number = f"POS-{timezone.now().strftime('%Y%m%d%H%M%S')}-{request.user.id}"

        total_amount = 0
        sale = PosSale.objects.create(
            invoice_number=inv_number,
            shift_id=shift_id,
            cashier=request.user,
            payment_method=payment_method,
            total_amount=0,
            discount_amount=discount,
            final_amount=0,
            pos_card_ref=card_ref
        )

        for item in items_data:
            product = CigaretteProduct.objects.select_for_update().get(id=item['product_id'])
            qty = int(item['quantity'])
            unit_price = int(item['unit_price'])
            subtotal = qty * unit_price
            total_amount += subtotal

            PosSaleItem.objects.create(
                sale=sale,
                product=product,
                unit_type=item.get('unit_type', 'pack'),
                quantity=qty,
                unit_price=unit_price,
                subtotal=subtotal
            )

        sale.total_amount = total_amount
        sale.final_amount = max(0, total_amount - discount)
        sale.save()

        return Response(PosSaleSerializer(sale).data, status=status.HTTP_201_CREATED)
