from django.db import models
from django.conf import settings
from products.models import Business

class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    )
    
    code = models.CharField(max_length=50, unique=True)
    business = models.ForeignKey(Business, related_name='coupons', on_delete=models.CASCADE, null=True, blank=True, help_text="Leave blank if coupon applies to all businesses")
    
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Total number of times this coupon can be used")
    used_count = models.PositiveIntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.code


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='notifications', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Notification for {self.user.email} - {self.title}"


class GSTSetting(models.Model):
    business = models.OneToOneField(Business, related_name='gst_settings', on_delete=models.CASCADE)
    gst_number = models.CharField(max_length=50, blank=True)
    default_gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    is_gst_inclusive = models.BooleanField(default=False, help_text="Are prices shown on the website inclusive of GST?")
    
    def __str__(self):
        return f"GST Settings for {self.business.name}"


class PaymentSetting(models.Model):
    business = models.OneToOneField(Business, related_name='payment_settings', on_delete=models.CASCADE)
    upi_enabled = models.BooleanField(default=True)
    card_enabled = models.BooleanField(default=True)
    cod_enabled = models.BooleanField(default=True)
    bank_transfer_enabled = models.BooleanField(default=False)
    upi_id = models.CharField(max_length=100, blank=True, help_text="For manual UPI payments/Donations")
    bank_details = models.TextField(blank=True, help_text="For manual Bank Transfers")

    def __str__(self):
        return f"Payment Settings for {self.business.name}"


class Donation(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
    )

    business = models.ForeignKey(Business, related_name='donations', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='donations', on_delete=models.SET_NULL, null=True, blank=True)
    
    donor_name = models.CharField(max_length=255)
    donor_email = models.EmailField()
    donor_phone = models.CharField(max_length=20)
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, default='UPI')
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_screenshot = models.ImageField(upload_to='donations/screenshots/', null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Donation of {self.amount} to {self.business.name} by {self.donor_name}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"
