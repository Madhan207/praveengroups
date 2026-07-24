from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    ServiceCategory, Service, ServicePackage, GalleryImage,
    Testimonial, FAQ, AvailabilitySlot, QuoteRequest,
    ContactInquiry, Booking, ElectroBooking, VolunteerRegistration
)
from .serializers import (
    ServiceCategorySerializer, ServiceSerializer, ServicePackageSerializer,
    GalleryImageSerializer, TestimonialSerializer, FAQSerializer,
    AvailabilitySlotSerializer, QuoteRequestSerializer,
    ContactInquirySerializer, BookingSerializer, ElectroBookingSerializer,
    VolunteerRegistrationSerializer
)


# ─── Service Category ─────────────────────────────────────────────────────────
class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business']


# ─── Service ──────────────────────────────────────────────────────────────────
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['business', 'category', 'is_active']
    search_fields = ['name', 'description']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


# ─── Service Package ──────────────────────────────────────────────────────────
class ServicePackageViewSet(viewsets.ModelViewSet):
    queryset = ServicePackage.objects.all()
    serializer_class = ServicePackageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business', 'tier', 'is_active']

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


# ─── Gallery Image ─────────────────────────────────────────────────────────────
class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business', 'category', 'is_active']

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @action(detail=True, methods=['post'], url_path='reorder')
    def reorder(self, request, pk=None):
        """POST /api/gallery-images/{id}/reorder/ with {"order": 5}"""
        obj = self.get_object()
        order = request.data.get('order')
        if order is not None:
            obj.order = int(order)
            obj.save(update_fields=['order'])
        return Response({'status': 'order updated'})


# ─── Testimonial ──────────────────────────────────────────────────────────────
class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business', 'is_approved']

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        obj = self.get_object()
        obj.is_approved = True
        obj.save(update_fields=['is_approved'])
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], url_path='unapprove')
    def unapprove(self, request, pk=None):
        obj = self.get_object()
        obj.is_approved = False
        obj.save(update_fields=['is_approved'])
        return Response({'status': 'unapproved'})


# ─── FAQ ──────────────────────────────────────────────────────────────────────
class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business', 'is_active']


# ─── Availability Slot ────────────────────────────────────────────────────────
class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    queryset = AvailabilitySlot.objects.all()
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business', 'is_available']

    def get_queryset(self):
        qs = super().get_queryset()
        # Allow filtering by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs


# ─── Quote Request ────────────────────────────────────────────────────────────
class QuoteRequestViewSet(viewsets.ModelViewSet):
    queryset = QuoteRequest.objects.all()
    serializer_class = QuoteRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['business', 'status', 'is_read']
    ordering_fields = ['created_at']

    def get_permissions(self):
        # Anyone can create a quote request; only staff can list/update
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=True, methods=['post'], url_path='reply', permission_classes=[permissions.IsAdminUser])
    def reply(self, request, pk=None):
        obj = self.get_object()
        reply_text = request.data.get('reply_text', '')
        obj.reply_text = reply_text
        obj.status = QuoteRequest.STATUS_REPLIED
        obj.is_read = True
        obj.save(update_fields=['reply_text', 'status', 'is_read'])
        return Response({'status': 'replied'})

    @action(detail=True, methods=['post'], url_path='approve', permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        obj = self.get_object()
        obj.status = QuoteRequest.STATUS_APPROVED
        obj.save(update_fields=['status'])
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], url_path='reject', permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        obj = self.get_object()
        obj.status = QuoteRequest.STATUS_REJECTED
        obj.save(update_fields=['status'])
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'], url_path='convert-to-booking', permission_classes=[permissions.IsAdminUser])
    def convert_to_booking(self, request, pk=None):
        """Convert a quote request into a confirmed booking."""
        quote = self.get_object()
        if quote.booking:
            return Response({'error': 'Already converted'}, status=status.HTTP_400_BAD_REQUEST)

        booking = Booking.objects.create(
            business=quote.business,
            name=quote.name,
            phone=quote.phone,
            email=quote.email,
            event_type=quote.event_type,
            guest_count=quote.guest_count,
            booking_date=quote.event_date or request.data.get('booking_date'),
            location_address=quote.event_location,
            special_requests=quote.special_requirements,
            total_amount=0,
            package=quote.package_interest,
        )
        quote.status = QuoteRequest.STATUS_CONVERTED
        quote.booking = booking
        quote.save(update_fields=['status', 'booking'])
        return Response({'status': 'converted', 'booking_id': booking.booking_id})


# ─── Contact Inquiry ──────────────────────────────────────────────────────────
class ContactInquiryViewSet(viewsets.ModelViewSet):
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business', 'is_read']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=True, methods=['post'], url_path='mark-read', permission_classes=[permissions.IsAdminUser])
    def mark_read(self, request, pk=None):
        obj = self.get_object()
        obj.is_read = True
        obj.save(update_fields=['is_read'])
        return Response({'status': 'marked as read'})


# ─── Booking ──────────────────────────────────────────────────────────────────
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['business', 'service', 'status']
    ordering_fields = ['booking_date', 'created_at']

    def get_permissions(self):
        # Only authenticated users can create or view bookings
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.is_superuser or getattr(user, 'role', '') in ['superadmin', 'manager']):
            return Booking.objects.all()
        if user.is_authenticated:
            return Booking.objects.filter(user=user)
        return Booking.objects.none()

    def perform_create(self, serializer):
        # Calculate total amount based on package or service
        package = serializer.validated_data.get('package')
        service = serializer.validated_data.get('service')

        amount = 0
        if package:
            amount = package.price
        elif service:
            amount = service.price

        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user, total_amount=amount)

    @action(detail=True, methods=['post'], url_path='update-status', permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        if not (request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', '') in ['superadmin', 'manager']):
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        booking = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Booking.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = new_status
        booking.save(update_fields=['status'])
        return Response({'status': new_status})

    @action(detail=True, methods=['post'], url_path='cancel', permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        
        # Only allow canceling if it's Pending or Confirmed
        if booking.status not in ['Pending', 'Confirmed']:
            return Response({'error': 'You can only cancel Pending or Confirmed bookings.'}, status=status.HTTP_400_BAD_REQUEST)
            
        booking.status = 'Cancelled'
        booking.save(update_fields=['status'])
        return Response({'status': 'Cancelled', 'message': 'Booking cancelled successfully.'})


# ─── Public Booking Tracker ───────────────────────────────────────────────────
class TrackBookingView(APIView):
    """Public endpoint — no auth required.
    GET /api/bookings/track/?id=BK-XXXXXX
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        booking_id = request.query_params.get('id', '').strip().upper()
        if not booking_id:
            return Response({'error': 'Please provide a booking ID (e.g. BK-A3F9X2).'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            b = Booking.objects.select_related('business', 'service', 'package').get(booking_id=booking_id)
            is_electro = False
        except Booking.DoesNotExist:
            try:
                b = ElectroBooking.objects.get(booking_id=booking_id)
                is_electro = True
            except ElectroBooking.DoesNotExist:
                return Response({'error': 'Booking not found. Please check your booking ID.'}, status=status.HTTP_404_NOT_FOUND)

        STATUS_COLORS = {
            'Pending':             'amber',
            'Confirmed':           'blue',
            'Technician Assigned': 'blue',
            'In Progress':         'purple',
            'Completed':           'green',
            'Cancelled':           'red',
        }

        if is_electro:
            return Response({
                'booking_id':    b.booking_id,
                'status':        b.status,
                'status_color':  STATUS_COLORS.get(b.status, 'slate'),
                'business_name': 'Praveen Electronics',
                'service_name':  b.service_type,
                'package_name':  b.appliance_brand,
                'customer_name': b.name or (b.user.get_full_name() if b.user else 'Guest'),
                'booking_date':  str(b.preferred_date),
                'booking_time':  b.preferred_time,
                'event_type':    'Electrical Service',
                'location':      f"{b.address}, {b.city} {b.pincode}",
                'guest_count':   None,
                'total_amount':  str(b.estimated_cost) if b.estimated_cost else None,
                'special_requests': b.issue_description,
                'created_at':    b.created_at.strftime('%d %b %Y, %I:%M %p'),
            })

        return Response({
            'booking_id':    b.booking_id,
            'status':        b.status,
            'status_color':  STATUS_COLORS.get(b.status, 'slate'),
            'business_name': b.business.name if b.business else '',
            'service_name':  b.service.name if b.service else '',
            'package_name':  b.package.name if b.package else '',
            'customer_name': b.name or (b.user.get_full_name() if b.user else 'Guest'),
            'booking_date':  str(b.booking_date),
            'booking_time':  str(b.booking_time) if b.booking_time else '',
            'event_type':    b.event_type,
            'location':      b.location_address,
            'guest_count':   b.guest_count,
            'total_amount':  str(b.total_amount),
            'special_requests': b.special_requests,
            'created_at':    b.created_at.strftime('%d %b %Y, %I:%M %p'),
        })


# ─── ElectroBooking ───────────────────────────────────────────────────────────
class ElectroBookingViewSet(viewsets.ModelViewSet):
    serializer_class = ElectroBookingSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields    = ['name', 'phone', 'service_type', 'booking_id']
    ordering_fields  = ['created_at', 'preferred_date']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.is_superuser):
            return ElectroBooking.objects.all()
        if user.is_authenticated:
            return ElectroBooking.objects.filter(user=user)
        return ElectroBooking.objects.none()

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'update', 'partial_update']:
            # Admins can see/edit all; users can see only their own
            return [permissions.IsAuthenticated()]
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        if self.action == 'destroy':
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        """Admin can update status, technician info, estimated_cost."""
        instance = self.get_object()
        allowed_fields = {'status', 'technician_name', 'technician_phone', 'estimated_cost', 'admin_notes'}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ─── Volunteer Registration ───────────────────────────────────────────────────
class VolunteerRegistrationViewSet(viewsets.ModelViewSet):
    queryset = VolunteerRegistration.objects.all()
    serializer_class = VolunteerRegistrationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['business', 'status']

    def get_permissions(self):
        # Anyone can create a volunteer registration (public form)
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=True, methods=['patch'], url_path='update-status', permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        registration = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(VolunteerRegistration.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        registration.status = new_status
        registration.save(update_fields=['status'])
        return Response({'status': new_status})
