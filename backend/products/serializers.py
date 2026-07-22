from rest_framework import serializers
from .models import Business, Category, Product, ProductImage, Review, Banner


class BannerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = '__all__'

    def get_image(self, obj):
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return obj.image or None


class BusinessSerializer(serializers.ModelSerializer):
    banners = BannerSerializer(many=True, read_only=True)

    # Nested service-related data from the services app
    services_list      = serializers.SerializerMethodField()
    packages_list      = serializers.SerializerMethodField()
    gallery_list       = serializers.SerializerMethodField()
    testimonials_list  = serializers.SerializerMethodField()
    faqs_list          = serializers.SerializerMethodField()
    availability_list  = serializers.SerializerMethodField()

    class Meta:
        model = Business
        fields = '__all__'

    def _get_request(self):
        return self.context.get('request')

    def get_services_list(self, obj):
        from services.serializers import ServiceSerializer
        qs = obj.services.filter(is_active=True)
        return ServiceSerializer(qs, many=True, context={'request': self._get_request()}).data

    def get_packages_list(self, obj):
        from services.serializers import ServicePackageSerializer
        qs = obj.service_packages.filter(is_active=True).order_by('order', 'price')
        return ServicePackageSerializer(qs, many=True, context={'request': self._get_request()}).data

    def get_gallery_list(self, obj):
        from services.serializers import GalleryImageSerializer
        qs = obj.gallery_images.filter(is_active=True).order_by('order', 'created_at')
        return GalleryImageSerializer(qs, many=True, context={'request': self._get_request()}).data

    def get_testimonials_list(self, obj):
        from services.serializers import TestimonialSerializer
        qs = obj.testimonials.filter(is_approved=True).order_by('order', '-created_at')
        return TestimonialSerializer(qs, many=True, context={'request': self._get_request()}).data

    def get_faqs_list(self, obj):
        from services.serializers import FAQSerializer
        qs = obj.faqs.filter(is_active=True).order_by('order')
        return FAQSerializer(qs, many=True).data

    def get_availability_list(self, obj):
        from services.serializers import AvailabilitySlotSerializer
        import datetime
        # Only return slots from today onwards
        today = datetime.date.today()
        qs = obj.availability_slots.filter(date__gte=today).order_by('date')
        return AvailabilitySlotSerializer(qs, many=True).data


class CategorySerializer(serializers.ModelSerializer):
    business_name = serializers.ReadOnlyField(source='business.name')
    business_slug = serializers.ReadOnlyField(source='business.slug')
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_image(self, obj):
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return obj.image or None


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'is_primary', 'label')

    def get_image(self, obj):
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return obj.image or None


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.name')

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user']


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')
    business_name = serializers.ReadOnlyField(source='category.business.name')
    business_slug = serializers.ReadOnlyField(source='category.business.slug')

    class Meta:
        model = Product
        fields = '__all__'
