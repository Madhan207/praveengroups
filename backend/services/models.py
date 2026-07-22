import uuid
from django.db import models
from django.conf import settings
from products.models import Business


# ─── Service Category ─────────────────────────────────────────────────────────
class ServiceCategory(models.Model):
    business = models.ForeignKey(Business, related_name='service_categories', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    image_file = models.ImageField(upload_to='service_categories/', null=True, blank=True)

    def __str__(self):
        return f"{self.business.name} - {self.name}"

    class Meta:
        verbose_name_plural = "Service Categories"


# ─── Service ──────────────────────────────────────────────────────────────────
class Service(models.Model):
    business = models.ForeignKey(Business, related_name='services', on_delete=models.CASCADE)
    category = models.ForeignKey(ServiceCategory, related_name='services', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    short_description = models.TextField(blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    duration = models.CharField(max_length=100, blank=True, help_text="e.g., '2 Hours', '1 Day'")
    image_file = models.ImageField(upload_to='services/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ─── Service Package (Business-level, not Service-level) ──────────────────────
class ServicePackage(models.Model):
    TIER_BRONZE   = 'Bronze'
    TIER_SILVER   = 'Silver'
    TIER_GOLD     = 'Gold'
    TIER_PREMIUM  = 'Premium'
    TIER_LUXURY   = 'Luxury'
    TIER_CUSTOM   = 'Custom'
    TIER_CHOICES = [
        (TIER_BRONZE,  'Bronze'),
        (TIER_SILVER,  'Silver'),
        (TIER_GOLD,    'Gold'),
        (TIER_PREMIUM, 'Premium'),
        (TIER_LUXURY,  'Luxury'),
        (TIER_CUSTOM,  'Custom'),
    ]

    business  = models.ForeignKey(Business, related_name='service_packages', on_delete=models.CASCADE)
    name      = models.CharField(max_length=200)
    tier      = models.CharField(max_length=20, choices=TIER_CHOICES, default=TIER_GOLD)
    price     = models.DecimalField(max_digits=12, decimal_places=2)
    badge     = models.CharField(max_length=100, blank=True, help_text="e.g., 'Best Value', 'Popular'")
    duration  = models.CharField(max_length=100, blank=True, help_text="e.g., 'Per Event', '8 Hours'")
    features  = models.JSONField(default=list, help_text="List of feature strings")
    image_file = models.ImageField(upload_to='packages/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order     = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'price']

    def __str__(self):
        return f"{self.business.name} - {self.name} ({self.tier})"


# ─── Gallery Image ─────────────────────────────────────────────────────────────
class GalleryImage(models.Model):
    business   = models.ForeignKey(Business, related_name='gallery_images', on_delete=models.CASCADE)
    image_file = models.ImageField(upload_to='gallery/', null=True, blank=True)
    image_url  = models.URLField(max_length=1000, blank=True)
    caption    = models.CharField(max_length=300, blank=True)
    category   = models.CharField(max_length=100, blank=True, help_text="e.g., 'Wedding', 'Corporate'")
    order      = models.IntegerField(default=0)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.business.name} - Gallery: {self.caption or self.id}"

    @property
    def image(self):
        if self.image_file:
            return self.image_file.url
        return self.image_url


# ─── Testimonial ──────────────────────────────────────────────────────────────
class Testimonial(models.Model):
    business    = models.ForeignKey(Business, related_name='testimonials', on_delete=models.CASCADE)
    name        = models.CharField(max_length=200)
    role        = models.CharField(max_length=200, blank=True, help_text="e.g., 'Bride', 'HR Manager'")
    comment     = models.TextField()
    rating      = models.IntegerField(default=5)
    avatar_file = models.ImageField(upload_to='testimonials/', null=True, blank=True)
    avatar_url  = models.URLField(max_length=1000, blank=True)
    is_approved = models.BooleanField(default=False)
    order       = models.IntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.business.name} - Review by {self.name}"

    @property
    def avatar(self):
        if self.avatar_file:
            return self.avatar_file.url
        return self.avatar_url


# ─── FAQ ──────────────────────────────────────────────────────────────────────
class FAQ(models.Model):
    business  = models.ForeignKey(Business, related_name='faqs', on_delete=models.CASCADE)
    question  = models.CharField(max_length=500)
    answer    = models.TextField()
    order     = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'

    def __str__(self):
        return f"{self.business.name} - FAQ: {self.question[:60]}"


# ─── Availability Slot ────────────────────────────────────────────────────────
class AvailabilitySlot(models.Model):
    business     = models.ForeignKey(Business, related_name='availability_slots', on_delete=models.CASCADE)
    date         = models.DateField()
    is_available = models.BooleanField(default=True)
    title        = models.CharField(max_length=200, blank=True, help_text="e.g., 'Wedding Booked'")
    note         = models.TextField(blank=True)

    class Meta:
        ordering = ['date']
        unique_together = ['business', 'date']

    def __str__(self):
        status = 'Available' if self.is_available else 'Booked'
        return f"{self.business.name} - {self.date} ({status})"


# ─── Quote Request ────────────────────────────────────────────────────────────
class QuoteRequest(models.Model):
    STATUS_PENDING   = 'Pending'
    STATUS_REPLIED   = 'Replied'
    STATUS_APPROVED  = 'Approved'
    STATUS_REJECTED  = 'Rejected'
    STATUS_CONVERTED = 'Converted'
    STATUS_CHOICES = [
        (STATUS_PENDING,   'Pending'),
        (STATUS_REPLIED,   'Replied'),
        (STATUS_APPROVED,  'Approved'),
        (STATUS_REJECTED,  'Rejected'),
        (STATUS_CONVERTED, 'Converted to Booking'),
    ]

    business             = models.ForeignKey(Business, related_name='quote_requests', on_delete=models.CASCADE)
    name                 = models.CharField(max_length=200)
    phone                = models.CharField(max_length=30)
    email                = models.EmailField(blank=True)
    event_type           = models.CharField(max_length=100, blank=True)
    budget               = models.CharField(max_length=100, blank=True)
    event_date           = models.DateField(null=True, blank=True)
    event_location       = models.CharField(max_length=500, blank=True)
    guest_count          = models.IntegerField(null=True, blank=True)
    special_requirements = models.TextField(blank=True)
    package_interest     = models.ForeignKey(ServicePackage, null=True, blank=True, on_delete=models.SET_NULL, related_name='quote_requests')

    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    reply_text  = models.TextField(blank=True)
    is_read     = models.BooleanField(default=False)

    # Optional link to converted booking
    booking     = models.OneToOneField('Booking', null=True, blank=True, on_delete=models.SET_NULL, related_name='quote_source')

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Quote #{self.id} - {self.name} ({self.event_type}) for {self.business.name}"


# ─── Contact Inquiry ──────────────────────────────────────────────────────────
class ContactInquiry(models.Model):
    business   = models.ForeignKey(Business, related_name='contact_inquiries', on_delete=models.CASCADE)
    name       = models.CharField(max_length=200)
    phone      = models.CharField(max_length=30, blank=True)
    email      = models.EmailField(blank=True)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Contact Inquiries'

    def __str__(self):
        return f"Inquiry #{self.id} - {self.name} for {self.business.name}"


# ─── Booking ──────────────────────────────────────────────────────────────────
def generate_booking_id():
    """Generate a short human-readable booking ID like BK-A3F9X2"""
    return 'BK-' + uuid.uuid4().hex[:6].upper()


class Booking(models.Model):
    STATUS_CHOICES = (
        ('Pending',     'Pending'),
        ('Confirmed',   'Confirmed'),
        ('In Progress', 'In Progress'),
        ('Completed',   'Completed'),
        ('Cancelled',   'Cancelled'),
    )

    booking_id   = models.CharField(max_length=20, unique=True, default=generate_booking_id, editable=False)
    business     = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='bookings')
    service      = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    package      = models.ForeignKey(ServicePackage, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')

    # Customer info (for guest bookings)
    name         = models.CharField(max_length=200, blank=True)
    phone        = models.CharField(max_length=30, blank=True)
    email        = models.EmailField(blank=True)
    event_type   = models.CharField(max_length=100, blank=True)
    guest_count  = models.IntegerField(null=True, blank=True)

    # Event details
    booking_date      = models.DateField()
    booking_time      = models.TimeField(null=True, blank=True)
    location_address  = models.TextField(blank=True)
    special_requests  = models.TextField(blank=True)

    # Pricing & Status
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.booking_id} - {self.name or (self.user.email if self.user else 'Guest')} @ {self.business.name}"

    def save(self, *args, **kwargs):
        # Auto-fill name/email from user if not provided
        if self.user and not self.name:
            self.name = self.user.get_full_name() or self.user.email
        if self.user and not self.email:
            self.email = self.user.email
        super().save(*args, **kwargs)


# ─── Electro Booking (Praveen Electro World) ─────────────────────────────────
def generate_electro_booking_id():
    """Generate a short human-readable booking ID like EL-A3F9X2"""
    return 'EL-' + uuid.uuid4().hex[:6].upper()


class ElectroBooking(models.Model):
    SERVICE_CHOICES = [
        ('AC Service',          'AC Service / Repair'),
        ('Fan Installation',    'Fan Installation / Repair'),
        ('Wiring',              'Wiring / Rewiring'),
        ('MCB / Switch',        'MCB / Switch / Socket'),
        ('Inverter / Battery',  'Inverter / Battery Service'),
        ('Water Heater',        'Water Heater / Geyser'),
        ('TV / Home Theatre',   'TV / Home Theatre Setup'),
        ('Washing Machine',     'Washing Machine Service'),
        ('Refrigerator',        'Refrigerator Service'),
        ('Motor / Pump',        'Motor / Water Pump'),
        ('New Connection',      'New Electrical Connection'),
        ('Other',               'Other Electrical Work'),
    ]

    TIME_SLOT_CHOICES = [
        ('Morning (8AM–12PM)',   'Morning (8AM–12PM)'),
        ('Afternoon (12PM–4PM)', 'Afternoon (12PM–4PM)'),
        ('Evening (4PM–8PM)',    'Evening (4PM–8PM)'),
    ]

    STATUS_CHOICES = [
        ('Pending',             'Pending'),
        ('Confirmed',           'Confirmed'),
        ('Technician Assigned', 'Technician Assigned'),
        ('In Progress',         'In Progress'),
        ('Completed',           'Completed'),
        ('Cancelled',           'Cancelled'),
    ]

    booking_id        = models.CharField(max_length=20, unique=True, default=generate_electro_booking_id, editable=False)
    user              = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='electro_bookings')

    # Customer info
    name              = models.CharField(max_length=200)
    phone             = models.CharField(max_length=30)
    email             = models.EmailField(blank=True)

    # Electrical service details
    service_type      = models.CharField(max_length=100, choices=SERVICE_CHOICES)
    appliance_brand   = models.CharField(max_length=100, blank=True, help_text="e.g., Samsung, LG, Voltas")
    issue_description = models.TextField(help_text="Describe the problem")

    # Schedule
    preferred_date    = models.DateField()
    preferred_time    = models.CharField(max_length=50, choices=TIME_SLOT_CHOICES, default='Morning (8AM–12PM)')

    # Location
    address           = models.TextField()
    city              = models.CharField(max_length=100, blank=True)
    pincode           = models.CharField(max_length=10, blank=True)

    # Admin fields — filled after confirmation
    status            = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    technician_name   = models.CharField(max_length=200, blank=True)
    technician_phone  = models.CharField(max_length=30, blank=True)
    estimated_cost    = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    admin_notes       = models.TextField(blank=True)

    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Electro Booking'
        verbose_name_plural = 'Electro Bookings'

    def __str__(self):
        return f"ElectroBooking {self.booking_id} — {self.service_type} for {self.name}"

    def save(self, *args, **kwargs):
        if self.user and not self.name:
            self.name = self.user.get_full_name() or self.user.email
        if self.user and not self.email:
            self.email = self.user.email
        super().save(*args, **kwargs)


# ─── Volunteer Registration ───────────────────────────────────────────────────
class VolunteerRegistration(models.Model):
    STATUS_PENDING   = 'Pending'
    STATUS_APPROVED  = 'Approved'
    STATUS_REJECTED  = 'Rejected'
    STATUS_CHOICES = [
        (STATUS_PENDING,   'Pending'),
        (STATUS_APPROVED,  'Approved'),
        (STATUS_REJECTED,  'Rejected'),
    ]

    business         = models.ForeignKey(Business, related_name='volunteer_registrations', on_delete=models.CASCADE)
    name             = models.CharField(max_length=200)
    phone            = models.CharField(max_length=30)
    email            = models.EmailField(blank=True)
    area_of_interest = models.CharField(max_length=200)
    message          = models.TextField(blank=True)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Volunteer Registration: {self.name} for {self.business.name}"
