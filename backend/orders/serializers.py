from rest_framework import serializers
from .models import Order, OrderItem, PaymentVerification


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_category_name = serializers.ReadOnlyField(source='product.category.name')

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_category_name', 'price', 'quantity')


class PaymentVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentVerification
        fields = '__all__'
        read_only_fields = ('is_verified',)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment_verification = PaymentVerificationSerializer(read_only=True)
    user_name = serializers.ReadOnlyField(source='user.name')
    user_email = serializers.ReadOnlyField(source='user.email')
    business_name = serializers.ReadOnlyField(source='business.name')
    invoice_file = serializers.SerializerMethodField()
    return_proof = serializers.SerializerMethodField()

    def get_invoice_file(self, obj):
        request = self.context.get('request')
        if obj.invoice_file:
            url = obj.invoice_file.url
            return request.build_absolute_uri(url) if request else f'http://localhost:8000{url}'
        return None

    def get_return_proof(self, obj):
        request = self.context.get('request')
        if obj.return_proof:
            url = obj.return_proof.url
            return request.build_absolute_uri(url) if request else f'http://localhost:8000{url}'
        return None

    # Write-only list of items when creating
    order_items = serializers.ListField(write_only=True, required=False, child=serializers.DictField())

    class Meta:
        model = Order
        fields = (
            'id', 'user_name', 'user_email', 'business', 'business_name',
            'full_name', 'mobile_number', 'address', 'city', 'state', 'pincode',
            'total_amount', 'payment_method', 'status', 'tracking_id', 'created_at',
            'items', 'payment_verification', 'order_items',
            'return_requested', 'return_reason', 'return_proof', 'invoice_file'
        )
        read_only_fields = ('user', 'total_amount', 'created_at')

    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items', [])
        # Calculate total from items
        total = sum(float(i.get('price', 0)) * int(i.get('quantity', 1)) for i in order_items_data)

        # Determine business from the first product
        business_id = None
        if order_items_data:
            from products.models import Product
            first_product_id = order_items_data[0].get('product')
            if first_product_id:
                product = Product.objects.filter(id=first_product_id).select_related('category__business').first()
                if product and product.category and product.category.business:
                    business_id = product.category.business.id
        
        if business_id and not validated_data.get('business'):
            validated_data['business_id'] = business_id

        order = Order.objects.create(**validated_data, total_amount=total)
        for item_data in order_items_data:
            OrderItem.objects.create(
                order=order,
                product_id=item_data['product'],
                price=item_data.get('price', 0),
                quantity=item_data.get('quantity', 1),
            )
        return order
