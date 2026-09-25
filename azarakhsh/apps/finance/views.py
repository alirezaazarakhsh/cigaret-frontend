"""
finance/views.py
ویوهای حساب‌های دفتری، تسویه بدهی و استیتمنت مالی
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import CustomerLedger, LedgerTransaction, ChequeRecord
from .serializers import CustomerLedgerSerializer, LedgerTransactionSerializer, ChequeRecordSerializer


class CustomerLedgerViewSet(viewsets.ModelViewSet):
    queryset = CustomerLedger.objects.all()
    serializer_class = CustomerLedgerSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='statement')
    def statement(self, request, pk=None):
        ledger = self.get_object()
        txs = ledger.transactions.all()[:50]
        return Response({
            'customer_name': ledger.customer.full_name,
            'credit_limit': ledger.credit_limit,
            'current_debt': ledger.current_balance,
            'is_blocked': ledger.is_blocked,
            'transactions': LedgerTransactionSerializer(txs, many=True).data
        })

    @action(detail=False, methods=['post'], url_path='settle-payment')
    @transaction.atomic
    def settle_payment(self, request):
        user_id = request.data.get('customer_id')
        payment_type = request.data.get('payment_type', LedgerTransaction.TransactionType.BANK_TRANSFER)
        amount = int(request.data.get('amount', 0))
        doc_ref = request.data.get('reference_code', 'SETTLE')
        desc = request.data.get('description', 'تسویه حساب دفتری')

        ledger = CustomerLedger.objects.select_for_update().get(customer_id=user_id)
        new_balance = max(0, ledger.current_balance - amount)
        ledger.current_balance = new_balance
        ledger.save()

        tx = LedgerTransaction.objects.create(
            ledger=ledger,
            transaction_type=payment_type,
            document_ref=doc_ref,
            debit_amount=0,
            credit_amount=amount,
            balance_after=new_balance,
            recorded_by=request.user,
            description=desc
        )

        return Response({
            'success': True,
            'transaction_id': tx.id,
            'settled_amount': amount,
            'remaining_debt': new_balance
        }, status=status.HTTP_201_CREATED)


class ChequeViewSet(viewsets.ModelViewSet):
    queryset = ChequeRecord.objects.all()
    serializer_class = ChequeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
