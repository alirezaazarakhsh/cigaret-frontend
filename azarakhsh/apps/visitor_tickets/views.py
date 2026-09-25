"""
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
