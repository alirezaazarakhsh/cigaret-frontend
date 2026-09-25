from rest_framework.permissions import BasePermission


class IsPosSuperAdminOrHasStaffPermission(BasePermission):
    """
    اجازه دسترسی فقط به:
    - کاربران super_admin (is_superuser=True) در جنگو، یا
    - کاربرانی که پروفایل PosStaff فعال دارند و perm_manage_staff آن‌ها True است.

    این کلاس جایگزین AllowAny در تمام endpointهای مدیریت پرسنل شده است.
    """
    message = 'شما اجازه مدیریت پرسنل صندوق را ندارید.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        staff = getattr(user, 'pos_profile', None)
        return bool(staff and staff.is_active and staff.perm_manage_staff)
