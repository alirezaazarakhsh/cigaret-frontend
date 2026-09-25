"""
reports/views.py
ویوهای محاسباتی آمار، داشبورد هوشمند فروش و خروجی اکسل
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.utils import timezone
from .models import DailySalesSnapshot, ProductSalesMetric
from .serializers import DailySalesSnapshotSerializer, ProductSalesMetricSerializer
from orders.models import OrderInvoice
from pos.models import PosSale


class SalesAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'], url_path='dashboard-summary')
    def dashboard_summary(self, request):
        today = timezone.now().date()
        
        # محاسبه سفارشات عمده امروز
        orders_today = OrderInvoice.objects.filter(created_at__date=today)
        orders_total = orders_today.aggregate(total=Sum('total_amount'))['total'] or 0
        orders_count = orders_today.count()

        # محاسبه فروش صندوق امروز
        pos_today = PosSale.objects.filter(created_at__date=today)
        pos_total = pos_today.aggregate(total=Sum('final_amount'))['total'] or 0
        pos_count = pos_today.count()

        combined_revenue = orders_total + pos_total
        estimated_profit = int(combined_revenue * 0.08)  # میانگین ۸٪ مارجین عمده دخانیات

        return Response({
            'date': today.strftime('%Y/%m/%d'),
            'total_revenue': combined_revenue,
            'estimated_gross_profit': estimated_profit,
            'wholesale_sales': orders_total,
            'wholesale_invoices_count': orders_count,
            'pos_sales': pos_total,
            'pos_sales_count': pos_count
        })

    @action(detail=False, methods=['get'], url_path='top-selling')
    def top_selling(self, request):
        metrics = ProductSalesMetric.objects.select_related('product').order_by('-total_cartons_sold')[:10]
        return Response(ProductSalesMetricSerializer(metrics, many=True).data)
