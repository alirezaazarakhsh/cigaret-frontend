"""
roles/views.py
ویوهای احراز هویت PIN، مدیریت نقش‌ها و اعتبارسنجی سطح دسترسی
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import StaffProfile, SecurityAuditLog
from .serializers import StaffProfileSerializer, SecurityAuditLogSerializer


class StaffRoleViewSet(viewsets.ModelViewSet):
    queryset = StaffProfile.objects.filter(is_active_staff=True)
    serializer_class = StaffProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], url_path='pos-pin-auth')
    def pos_pin_auth(self, request):
        staff_code = request.data.get('staff_code', '').strip()
        pin = request.data.get('pin', '').strip()

        staff = StaffProfile.objects.filter(staff_code=staff_code, is_active_staff=True).first()
        if not staff or not staff.verify_pin(pin):
            return Response({'error': 'کد پرسنلی یا رمز PIN صحیح نمی‌باشد.'}, status=status.HTTP_401_UNAUTHORIZED)

        # صدور JWT توکن اختصاصی شیفت
        refresh = RefreshToken.for_user(staff.user)
        
        # ثبت در لاگ امنیتی
        SecurityAuditLog.objects.create(
            staff=staff,
            action_type="POS_PIN_LOGIN",
            target_model="PosRegister",
            target_id="LOCAL",
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({
            'authenticated': True,
            'access_token': str(refresh.access_token),
            'staff': StaffProfileSerializer(staff).data
        })
