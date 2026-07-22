from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Coupon, Notification, GSTSetting, PaymentSetting, Donation
from .serializers import (
    CouponSerializer, NotificationSerializer, 
    GSTSettingSerializer, PaymentSettingSerializer, DonationSerializer,
    ContactMessageSerializer
)

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['business', 'is_active', 'discount_type']
    search_fields = ['code']

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users only see their own notifications
        if getattr(self.request.user, 'is_staff', False):
            return Notification.objects.all()
        return Notification.objects.filter(user=self.request.user)

class GSTSettingViewSet(viewsets.ModelViewSet):
    queryset = GSTSetting.objects.all()
    serializer_class = GSTSettingSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business']

class PaymentSettingViewSet(viewsets.ModelViewSet):
    queryset = PaymentSetting.objects.all()
    serializer_class = PaymentSettingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business']

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.AllowAny] # Anyone can donate
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['business', 'status']
    ordering_fields = ['created_at', 'amount']
    
    def perform_create(self, serializer):
        # Automatically link user if authenticated
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

class ContactMessageViewSet(viewsets.ModelViewSet):
    from .models import ContactMessage
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_resolved']
    ordering_fields = ['created_at']
