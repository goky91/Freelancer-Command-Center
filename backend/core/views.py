from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import HttpResponse
from django.contrib.auth.models import User
from .models import Client, TimeEntry, Invoice
from .serializers import (
    ClientSerializer, TimeEntrySerializer, InvoiceSerializer,
    UserSerializer, RegisterSerializer
)
from .pdf_generator import generate_invoice_pdf


class RegisterView(viewsets.GenericViewSet):
    """ViewSet for user registration"""
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'User created successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Returns information about the currently logged in user"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class ClientViewSet(viewsets.ModelViewSet):
    """ViewSet for managing clients"""
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Client.objects.filter(user=self.request.user)


class TimeEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing time entries"""
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = TimeEntry.objects.filter(user=self.request.user)
        client_id = self.request.query_params.get('client', None)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        return queryset


class InvoiceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing invoices"""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.filter(user=self.request.user)

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """Generates and downloads PDF invoice"""
        invoice = self.get_object()
        pdf_buffer = generate_invoice_pdf(invoice)

        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{invoice.invoice_number}.pdf"'
        return response

    @action(detail=True, methods=['post'])
    def mark_as_sent(self, request, pk=None):
        """Marks invoice as sent"""
        invoice = self.get_object()
        invoice.status = 'sent'
        invoice.save()
        return Response({'status': 'Invoice marked as sent.'})

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """Marks invoice as paid"""
        invoice = self.get_object()
        invoice.status = 'paid'
        invoice.save()
        return Response({'status': 'Invoice marked as paid.'})
