"""
visitors/views.py
ویوهای API جنگو برای ثبت سفارش مغازه‌داران، مدیریت باشگاه مشتریان و دریافت گزارش سود ویزیتور
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import VisitorProfile, RetailShopCustomer, VisitorCommissionLog
from .serializers import VisitorProfileSerializer, RetailShopCustomerSerializer, VisitorCommissionLogSerializer


class VisitorProfileViewSet(viewsets.ModelViewSet):
    queryset = VisitorProfile.objects.all()
    serializer_class = VisitorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    pythome_my_profile(self, request):
        profile, created = VisitorProfile.objects.get_or_create(user=request.user, defaults={
            'visitor_code': f"VISITOR-{request.user.phone[-4:]}"
        })
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class RetailShopCustomerViewSet(viewsets.ModelViewSet):
    queryset = RetailShopCustomer.objects.all()
    serializer_class = RetailShopCustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        visitor_profile, _ = VisitorProfile.objects.get_or_create(user=self.request.user)
        serializer.save(visitor=visitor_profile)


class VisitorCommissionLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VisitorCommissionLog.objects.all()
    serializer_class = VisitorCommissionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return VisitorCommissionLog.objects.all()
        return VisitorCommissionLog.objects.filter(visitor__user=user)
