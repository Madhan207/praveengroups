from rest_framework import serializers
from .models import (
    ServiceCategory, Service, ServicePackage, GalleryImage,
    Testimonial, FAQ, AvailabilitySlot, QuoteRequest,
    ContactInquiry, Booking, ElectroBooking, VolunteerRegistration
)


# ─── Service Category ─────────────────────────────────────────────────────────
class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = '__all__'


# ─── Service Package ──────────────────────────────────────────────────────────
class ServicePackageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ServicePackage
        fields = '__all__'

    def get_image(self, obj):
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return None


# ─── Service ──────────────────────────────────────────────────────────────────
class ServiceSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = '__all__'

    def get_image(self, obj):
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return None


# ─── Gallery Image ─────────────────────────────────────────────────────────────
class GalleryImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = '__all__'

    def get_image(self, obj):
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return obj.image_url or None


# ─── Testimonial ──────────────────────────────────────────────────────────────
class TestimonialSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = '__all__'

    def get_avatar(self, obj):
        if obj.avatar_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar_file.url)
            return obj.avatar_file.url
        return obj.avatar_url or None


# ─── FAQ ──────────────────────────────────────────────────────────────────────
class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'


# ─── Availability Slot ────────────────────────────────────────────────────────
class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = '__all__'


# ─── Quote Request ────────────────────────────────────────────────────────────
class QuoteRequestSerializer(serializers.ModelSerializer):
    package_name = serializers.CharField(source='package_interest.name', read_only=True)

    class Meta:
        model = QuoteRequest
        fields = '__all__'
        read_only_fields = ['status', 'reply_text', 'is_read', 'booking']


# ─── Contact Inquiry ──────────────────────────────────────────────────────────
class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = '__all__'
        read_only_fields = ['is_read']


# ─── Booking ──────────────────────────────────────────────────────────────────
class BookingSerializer(serializers.ModelSerializer):
    service_name  = serializers.CharField(source='service.name',        read_only=True, default='')
    package_name  = serializers.CharField(source='package.name',        read_only=True, default='')
    business_name = serializers.CharField(source='business.name',       read_only=True)
    customer_email = serializers.SerializerMethodField()
    customer_name  = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['status', 'user', 'total_amount', 'booking_id']

    def get_customer_email(self, obj):
        return obj.email or (obj.user.email if obj.user else '')

    def get_customer_name(self, obj):
        return obj.name or (obj.user.get_full_name() if obj.user else 'Guest')


# ─── ElectroBooking ───────────────────────────────────────────────────────────
class ElectroBookingSerializer(serializers.ModelSerializer):
    user_name  = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = ElectroBooking
        fields = '__all__'
        read_only_fields = ['booking_id', 'user', 'status',
                            'technician_name', 'technician_phone',
                            'estimated_cost', 'admin_notes']

    def get_user_name(self, obj):
        return obj.name or (obj.user.get_full_name() if obj.user else 'Guest')

    def get_user_email(self, obj):
        return obj.email or (obj.user.email if obj.user else '')

# ─── Volunteer Registration ───────────────────────────────────────────────────
class VolunteerRegistrationSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)

    class Meta:
        model = VolunteerRegistration
        fields = '__all__'
        read_only_fields = ['status']
