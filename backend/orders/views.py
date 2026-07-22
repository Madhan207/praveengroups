from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Sum, Count, F
from django.utils import timezone
from datetime import timedelta
from .models import Order, PaymentVerification
from .serializers import OrderSerializer, PaymentVerificationSerializer
from products.models import Product, Business

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        # 1. Total Revenue
        total_revenue = Order.objects.filter(status='Delivered').aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        # 2. Sales by Business
        business_sales = []
        businesses = Business.objects.all()
        for biz in businesses:
            # Get all delivered orders containing products from this business
            sales = Order.objects.filter(
                status='Delivered',
                items__product__category__business=biz
            ).distinct().aggregate(total=Sum('items__price'))['total'] or 0
            business_sales.append({
                'business': biz.name,
                'sales': sales
            })

        # 3. Monthly Revenue (Last 6 months)
        monthly_revenue = []
        today = timezone.now()
        for i in range(6):
            start_date = (today - timedelta(days=30*i)).replace(day=1)
            end_date = start_date + timedelta(days=30)
            sales = Order.objects.filter(
                status='Delivered',
                created_at__gte=start_date,
                created_at__lt=end_date
            ).aggregate(total=Sum('total_amount'))['total_amount__sum'] or 0
            monthly_revenue.append({
                'month': start_date.strftime('%B %Y'),
                'revenue': sales
            })
        monthly_revenue.reverse()

        # 4. Total Customers
        from users.models import User
        total_customers = User.objects.filter(is_superuser=False).count()

        # 5. Inventory Stats
        total_products = Product.objects.count()
        out_of_stock = Product.objects.filter(stock=0, is_service=False).count()

        return Response({
            'total_revenue': total_revenue,
            'business_sales': business_sales,
            'monthly_revenue': monthly_revenue,
            'total_customers': total_customers,
            'inventory': {
                'total_products': total_products,
                'out_of_stock': out_of_stock
            }
        })

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status, filters

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['business', 'status']
    ordering_fields = ['created_at']

    def get_queryset(self):
        if self.request.user.is_staff:
            # Allow admins to retrieve/update any order
            if self.action != 'list':
                return Order.objects.all().order_by('-created_at')
            # Only return all orders in list view if explicitly requested
            if self.request.query_params.get('all') == 'true':
                return Order.objects.all().order_by('-created_at')
                
        # Otherwise return user's own orders
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [IsAdminUser()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        
        # Only allow cancellation if order is Pending or Processing
        if order.status not in ['Pending', 'Processing']:
            return Response(
                {"detail": "This order cannot be cancelled as it is already being processed or shipped."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'Cancelled'
        order.save()
        return Response({"detail": "Order cancelled successfully.", "status": order.status})

    @action(detail=True, methods=['patch'])
    def request_return(self, request, pk=None):
        order = self.get_object()
        
        # Only allow returns if delivered (or similar logic, but for now just accept it)
        if order.status not in ['Delivered', 'Shipped', 'Pending', 'Payment Verified', 'Processing']:
            return Response(
                {"detail": "Cannot request return for this order."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        return_reason = request.data.get('return_reason', '')
        return_proof = request.FILES.get('return_proof')
        
        order.return_requested = True
        order.return_reason = return_reason
        if return_proof:
            order.return_proof = return_proof
        order.save()
        return Response({"detail": "Return requested successfully."})

class PaymentVerificationViewSet(viewsets.ModelViewSet):
    queryset = PaymentVerification.objects.all()
    serializer_class = PaymentVerificationSerializer
    permission_classes = [IsAuthenticated]
