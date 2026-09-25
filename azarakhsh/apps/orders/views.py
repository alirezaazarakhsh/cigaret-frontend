"""
orders/views.py
ثبت تراکنشی پیش‌فاکتور، استعلام وضعیت بارنامه و ثبت فیش واریزی
"""
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from .models import Order, OrderItem, PaymentReceipt
from .serializers import OrderCheckoutSerializer, OrderDetailSerializer, PaymentReceiptSerializer
from catalog.models import CigaretteProduct


class OrderCheckoutView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = OrderCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        total_amount = 0
        total_discount = 0
        order_items_to_create = []

        for item_data in data['items']:
            product = CigaretteProduct.objects.filter(id=item_data['product_id']).first()
            if not product:
                return Response({"error": f"محصول یافت نشد."}, status=400)

            unit = item_data['unit']
            qty = item_data['quantity']
            unit_price = product.carton_price if unit == 'carton' else product.box_price
            line_raw = unit_price * qty
            
            # محاسبه تخفیف پلکانی
            discount_pct = 0
            if unit == 'carton':
                for tier in product.tier_discounts.all().order_by('-min_quantity'):
                    if qty >= tier.min_quantity:
                        discount_pct = float(tier.discount_percent)
                        break

            line_discount = int((line_raw * discount_pct) / 100)
            line_final = line_raw - line_discount

            total_amount += line_raw
            total_discount += line_discount

            order_items_to_create.append({
                'product': product,
                'unit': unit,
                'quantity': qty,
                'unit_price': unit_price,
                'discount_percent': discount_pct,
                'total_price': line_final,
            })

        shipping_cost = data.get('shipping_cost', 0)
        final_payable = (total_amount - total_discount) + shipping_cost

        # ساخت رکورد سفارش
        order = Order.objects.create(
            tracking_code=Order.generate_tracking_code(),
            user=request.user if request.user.is_authenticated else None,
            customer_name=data['customer_name'],
            customer_phone=data['customer_phone'],
            business_name=data.get('business_name', ''),
            province=data['province'],
            city=data['city'],
            destination_address=data['destination_address'],
            shipping_method=data['shipping_method'],
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            discount_amount=total_discount,
            final_payable=final_payable,
            status='proforma_issued',
        )

        for item in order_items_to_create:
            OrderItem.objects.create(order=order, **item)

        return Response({
            "status": "success",
            "message": "پیش‌فاکتور رسمی با موفقیت صادر گردید.",
            "tracking_code": order.tracking_code,
            "final_payable": order.final_payable,
            "order_id": order.id
        }, status=status.HTTP_201_CREATED)


class OrderTrackingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, tracking_code):
        order = Order.objects.filter(tracking_code=tracking_code).first()
        if not order:
            return Response({"error": "سفارشی با این کد رهگیری یافت نشد."}, status=404)
        return Response(OrderDetailSerializer(order).data)
