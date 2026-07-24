from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Business, Category, Product, ProductImage, Review, Banner
from .serializers import BusinessSerializer, CategorySerializer, ProductSerializer, ReviewSerializer, BannerSerializer
from rest_framework.views import APIView
from django.db.models import Q

class BusinessViewSet(viewsets.ModelViewSet):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def list(self, request, *args, **kwargs):
        if not Business.objects.exists():
            try:
                import seed_multi_business
                seed_multi_business.run()
            except Exception as e:
                print("Auto-seed error:", e)
        return super().list(request, *args, **kwargs)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'business__name']

    def get_queryset(self):
        queryset = Category.objects.all().select_related('business')
        business_slug = self.request.query_params.get('business', None)
        if business_slug:
            queryset = queryset.filter(business__slug=business_slug)
        return queryset

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category__name', 'category__business__name', 'brand', 'sku']
    ordering_fields = ['price', 'created_at', 'name']

    def get_queryset(self):
        queryset = Product.objects.all().select_related('category', 'category__business').prefetch_related('images', 'reviews')
        
        # Filters
        category_slug = self.request.query_params.get('category', None)
        business_slug = self.request.query_params.get('business', None)
        is_featured = self.request.query_params.get('is_featured', None)
        is_service = self.request.query_params.get('is_service', None)
        is_trending = self.request.query_params.get('is_trending', None)

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if business_slug:
            queryset = queryset.filter(category__business__slug=business_slug)
        if is_featured is not None:
            # Handle string 'true' / 'false'
            is_featured_bool = str(is_featured).lower() == 'true'
            queryset = queryset.filter(is_featured=is_featured_bool)
        if is_service is not None:
            is_service_bool = str(is_service).lower() == 'true'
            queryset = queryset.filter(is_service=is_service_bool)
        if is_trending is not None:
            is_trending_bool = str(is_trending).lower() == 'true'
            queryset = queryset.filter(is_trending=is_trending_bool)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def _extract_images(self, request):
        """Pull image files out of request so they don't break serializer validation."""
        import json
        
        image_files = request.FILES.getlist('images')
        if not image_files and request.FILES.get('image'):
            image_files = [request.FILES.get('image')]

        # Build a plain dict - carefully copy all non-image, non-file keys
        data = {}
        qd = request.data  # This is a QueryDict for multipart
        
        for key in qd.keys():
            if key in ('images', 'image', 'image_labels', 'deleted_image_ids'):
                continue
            values = qd.getlist(key)
            # Only take first value for regular fields
            data[key] = values[0] if len(values) == 1 else values

        # Parse JSON fields sent as strings from FormData
        for field in ['features', 'specifications', 'highlights']:
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = json.loads(data[field])
                except (json.JSONDecodeError, ValueError):
                    pass

        # Parse boolean fields
        for field in ['is_featured', 'is_best_seller', 'is_new_arrival', 'is_trending', 'is_service']:
            if field in data and isinstance(data[field], str):
                data[field] = data[field].lower() in ('true', '1', 'yes')

        # Extract image labels
        image_labels = qd.getlist('image_labels') if hasattr(qd, 'getlist') else []

        # Extract deleted image ids
        deleted_image_ids = qd.getlist('deleted_image_ids') if hasattr(qd, 'getlist') else []

        return image_files, image_labels, deleted_image_ids, data

    def create(self, request, *args, **kwargs):
        image_files, image_labels, deleted_image_ids, data = self._extract_images(request)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        if image_files:
            for index, image_file in enumerate(image_files):
                label = image_labels[index] if image_labels and index < len(image_labels) else ''
                ProductImage.objects.create(
                    product=serializer.instance,
                    image_file=image_file,
                    is_primary=(index == 0),
                    label=label
                )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        image_files, image_labels, deleted_image_ids, data = self._extract_images(request)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        if deleted_image_ids:
            instance.images.filter(id__in=deleted_image_ids).delete()

        if image_files:
            # If new images are provided, we optionally could clear old ones or just add to them.
            # The prompt implies adding multiple images like flipkart. Let's add them. 
            # If they want to replace, we'd need a different mechanism. For now, we'll just append 
            # or if it's a completely new upload, we can make the first one primary.
            # To keep it simple, we will just add the new images. If there are no existing images, make first primary.
            existing_count = instance.images.count()
            for index, image_file in enumerate(image_files):
                label = image_labels[index] if image_labels and index < len(image_labels) else ''
                ProductImage.objects.create(
                    product=instance,
                    image_file=image_file,
                    is_primary=(existing_count == 0 and index == 0),
                    label=label
                )

        return Response(serializer.data)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    def get_queryset(self):
        queryset = Banner.objects.all()
        business_slug = self.request.query_params.get('business', None)
        is_global = self.request.query_params.get('global', None)
        position = self.request.query_params.get('position', None)
        
        if is_global == 'true':
            queryset = queryset.filter(business__isnull=True)
        elif business_slug:
            queryset = queryset.filter(business__slug=business_slug)
            
        if position:
            queryset = queryset.filter(position=position)
            
        return queryset

class GlobalSearchView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"businesses": [], "categories": [], "products": []})
            
        # Search Businesses
        businesses = Business.objects.filter(
            Q(name__icontains=query) | 
            Q(description__icontains=query) |
            Q(type__icontains=query)
        ).distinct()[:5]
        
        # Search Categories
        categories = Category.objects.filter(
            Q(name__icontains=query)
        ).distinct()[:5]
        
        # Search Products
        products = Product.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(category__name__icontains=query)
        ).distinct()[:20]
        
        return Response({
            "businesses": BusinessSerializer(businesses, many=True).data,
            "categories": CategorySerializer(categories, many=True).data,
            "products": ProductSerializer(products, many=True).data
        })

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def seed_database_view(request):
    try:
        import seed_multi_business
        seed_multi_business.run()
        return Response({
            "status": "success",
            "message": "Database seeded successfully with all businesses, categories, products, and banners!"
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

