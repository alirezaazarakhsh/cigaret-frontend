"""
warehouse/views.py
ویوهای مدیریت موجودی، صدور حواله و گردش کاردکس کالا
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import WarehouseLocation, WarehouseStock, KardexEntry
from .serializers import WarehouseLocationSerializer, WarehouseStockSerializer, KardexEntrySerializer


class WarehouseStockViewSet(viewsets.ModelViewSet):
    queryset = WarehouseStock.objects.select_related('product', 'warehouse').all()
    serializer_class = WarehouseStockSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='kardex')
    def get_kardex(self, request, pk=None):
        stock = self.get_object()
        entries = stock.kardex_entries.all()[:100]
        return Response(KardexEntrySerializer(entries, many=True).data)

    @action(detail=False, methods=['post'], url_path='adjust-stock')
    @transaction.atomic
    def adjust_stock(self, request):
        stock_id = request.data.get('stock_id')
        change_cartons = int(request.data.get('cartons_change', 0))
        movement_type = request.data.get('movement_type', KardexEntry.MovementType.INVENTORY_AUDIT)
        ref_code = request.data.get('reference_code', 'MANUAL-ADJ')
        desc = request.data.get('description', '')

        stock = WarehouseStock.objects.select_for_update().get(id=stock_id)
        new_balance = stock.cartons_count + change_cartons
        if new_balance < 0:
            return Response({'error': 'موجودی انبار نمی‌تواند منفی شود.'}, status=status.HTTP_400_BAD_REQUEST)

        stock.cartons_count = new_balance
        stock.save()

        kardex = KardexEntry.objects.create(
            stock=stock,
            movement_type=movement_type,
            reference_code=ref_code,
            quantity_cartons_change=change_cartons,
            balance_cartons_after=new_balance,
            operator=request.user,
            description=desc
        )

        return Response({
            'success': True,
            'new_balance': new_balance,
            'kardex_id': kardex.id
        }, status=status.HTTP_200_OK)
