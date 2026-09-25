"""
tickets/views.py
ویوهای صریح APIView جهت مدیریت تیکت‌های پشتیبانی، ثبت فیش واریزی و پاسخگویی با مستندات فارسی Swagger/ReDoc
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from .models import SupportTicket, TicketMessage
from .serializers import SupportTicketSerializer, TicketMessageSerializer


class TicketListAPIView(APIView):
    """
    دریافت لیست تیکت‌های پشتیبانی کاربر یا ادمین
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="لیست_تیکت_های_پشتیبانی",
        operation_summary="دریافت لیست تیکت‌های پشتیبانی کاربر یا ادمین",
        operation_description="دریافت تاریخچه تمام تیکت‌های ارسال شده همراه با وضعیت پاسخ، اولویت و پیام‌ها",
        tags=["تیکت‌ها و پشتیبانی (Tickets)"],
        responses={
            200: openapi.Response(description="لیست تیکت‌ها با موفقیت دریافت شد", schema=SupportTicketSerializer(many=True)),
            401: openapi.Response(description="عدم ورود به حساب کاربری")
        }
    )
    def get(self, request):
        if request.user.is_staff:
            tickets = SupportTicket.objects.all().prefetch_related('messages')
        else:
            tickets = SupportTicket.objects.filter(user=request.user).prefetch_related('messages')
        serializer = SupportTicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TicketCreateAPIView(APIView):
    """
    ایجاد تیکت پشتیبانی جدید یا ثبت فیش واریز
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="ایجاد_تیکت_پشتیبانی_جدید",
        operation_summary="ایجاد تیکت پشتیبانی جدید یا ثبت فیش واریز",
        operation_description="ارسال تیکت جدید به دپارتمان‌های مالی، انبار، ترابری یا پشتیبانی به همراه متن پیام اولیه و کد سفارش",
        tags=["تیکت‌ها و پشتیبانی (Tickets)"],
        request_body=SupportTicketSerializer,
        responses={
            201: openapi.Response(description="تیکت جدید با موفقیت ایجاد شد", schema=SupportTicketSerializer),
            400: openapi.Response(description="اطلاعات ورودی نامعتبر است")
        }
    )
    def post(self, request):
        serializer = SupportTicketSerializer(data=request.data)
        if serializer.is_valid():
            ticket = serializer.save(
                user=request.user,
                ticket_number=SupportTicket.generate_ticket_number()
            )
            initial_message = request.data.get('initial_message')
            if initial_message:
                TicketMessage.objects.create(
                    ticket=ticket,
                    sender=request.user,
                    is_staff_reply=False,
                    message=initial_message
                )
            return Response(SupportTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketDetailAPIView(APIView):
    """
    مشاهده جزئیات تیکت و تمام پیام‌های گفتگو
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="جزئیات_تیکت_پشتیبانی",
        operation_summary="مشاهده جزئیات تیکت و تمام پیام‌های گفتگو",
        operation_description="دریافت اطلاعات یک تیکت مشخص شامل لیست تمام پاسخ‌های اپراتور انبار و کاربر",
        tags=["تیکت‌ها و پشتیبانی (Tickets)"],
        responses={
            200: openapi.Response(description="اطلاعات تیکت و پیام‌ها برگردانده شد", schema=SupportTicketSerializer),
            404: openapi.Response(description="تیکت یافت نشد")
        }
    )
    def get(self, request, pk):
        try:
            if request.user.is_staff:
                ticket = SupportTicket.objects.prefetch_related('messages').get(pk=pk)
            else:
                ticket = SupportTicket.objects.prefetch_related('messages').get(pk=pk, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response({'error': 'تیکت یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = SupportTicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TicketReplyAPIView(APIView):
    """
    ارسال پاسخ جدید برای تیکت پشتیبانی
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_id="پاسخ_به_تیکت_پشتیبانی",
        operation_summary="ارسال پاسخ جدید برای تیکت پشتیبانی",
        operation_description="افزودن پیام پاسخ توسط کاربر یا اپراتور انبار و بروزرسانی خودکار وضعیت تیکت",
        tags=["تیکت‌ها و پشتیبانی (Tickets)"],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["message"],
            properties={
                "message": openapi.Schema(type=openapi.TYPE_STRING, example="فیش واریزی پیوست شد. لطفا بارگیری فرمایید.", description="متن پاسخ"),
                "attachment": openapi.Schema(type=openapi.TYPE_STRING, example="http://example.com/receipt.jpg", description="لینک یا تصویر پیوست (اختیاری)")
            }
        ),
        responses={
            201: openapi.Response(description="پاسخ با موفقیت ارسال شد", schema=TicketMessageSerializer),
            400: openapi.Response(description="متن پیام الزامی است"),
            404: openapi.Response(description="تیکت یافت نشد")
        }
    )
    def post(self, request, pk):
        try:
            if request.user.is_staff:
                ticket = SupportTicket.objects.get(pk=pk)
            else:
                ticket = SupportTicket.objects.get(pk=pk, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response({'error': 'تیکت یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

        message_text = request.data.get('message')
        if not message_text:
            return Response({'error': 'متن پیام الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

        is_staff = request.user.is_staff
        msg = TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            is_staff_reply=is_staff,
            message=message_text,
            attachment=request.data.get('attachment', '')
        )

        ticket.status = 'answered' if is_staff else 'customer_reply'
        ticket.save()

        return Response(TicketMessageSerializer(msg).data, status=status.HTTP_201_CREATED)
