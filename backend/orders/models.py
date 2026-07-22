from django.db import models
from django.conf import settings
from products.models import Product, Business

class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Payment Verified', 'Payment Verified'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
        ('Returned', 'Returned'),
        ('Return Rejected', 'Return Rejected'),
    )
    PAYMENT_CHOICES = (
        ('UPI', 'UPI Payment'),
        ('COD', 'Cash On Delivery'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    business = models.ForeignKey(Business, on_delete=models.SET_NULL, null=True, related_name='orders')
    
    # Shipping Info
    full_name = models.CharField(max_length=200)
    mobile_number = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    
    # Order Info
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    tracking_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # New fields for Returns and Invoices
    return_requested = models.BooleanField(default=False)
    return_reason = models.TextField(blank=True, null=True)
    return_proof = models.ImageField(upload_to='returns/', blank=True, null=True)
    invoice_file = models.FileField(upload_to='invoices/', blank=True, null=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.email}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"

class PaymentVerification(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment_verification')
    utr_number = models.CharField(max_length=100)
    screenshot = models.ImageField(upload_to='payments/')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for Order {self.order.id}"

class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.email}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} of {self.product.name} in Cart"

class Invoice(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=100, unique=True)
    issued_date = models.DateTimeField(auto_now_add=True)
    file_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} for Order {self.order.id}"
