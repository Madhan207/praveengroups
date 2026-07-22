from django.db import models

class Business(models.Model):
    TYPE_PRODUCT    = 'product'
    TYPE_SERVICE    = 'service'
    TYPE_TRUST      = 'trust'
    TYPE_LOGISTICS  = 'logistics'
    BUSINESS_TYPE_CHOICES = [
        (TYPE_PRODUCT,   'Product Business'),
        (TYPE_SERVICE,   'Service Business'),
        (TYPE_TRUST,     'Trust / NGO'),
        (TYPE_LOGISTICS, 'Logistics / Transport'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    logo = models.URLField(max_length=500, blank=True, null=True)
    type = models.CharField(max_length=50, choices=BUSINESS_TYPE_CHOICES, default=TYPE_PRODUCT)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    # ── Common Profile Fields ──────────────────────────────────────────
    about_us         = models.TextField(blank=True, null=True)
    mission_vision   = models.TextField(blank=True, null=True)
    contact_email    = models.EmailField(blank=True, null=True)
    contact_phone    = models.CharField(max_length=20, blank=True, null=True)
    whatsapp_number  = models.CharField(max_length=20, blank=True, null=True)
    google_map_embed = models.TextField(blank=True, null=True)
    address          = models.TextField(blank=True, null=True)

    # ── Rich Service / Trust / Logistics Data (stored as JSON) ─────────
    # [{name, description, image, icon}]
    services_data    = models.JSONField(default=list, blank=True)
    # [{name, price, duration, badge, features:[]}]
    packages_data    = models.JSONField(default=list, blank=True)
    # [{image, caption, category}]
    gallery_data     = models.JSONField(default=list, blank=True)
    # [{name, role, image, bio}]
    team_data        = models.JSONField(default=list, blank=True)
    # [{name, role, rating, comment, avatar}]
    testimonials_data = models.JSONField(default=list, blank=True)
    # [{question, answer}]
    faqs_data        = models.JSONField(default=list, blank=True)
    # [{title, date, location, status}]
    events_data      = models.JSONField(default=list, blank=True)
    # Extra social links: {instagram, facebook, youtube, twitter}
    social_links     = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Businesses"
        ordering = ['order', 'name']

class Category(models.Model):
    business = models.ForeignKey(Business, related_name='categories', on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    image = models.URLField(max_length=500, blank=True, null=True)
    image_file = models.ImageField(upload_to='categories/', null=True, blank=True)

    def __str__(self):
        return f"{self.business.name if self.business else 'None'} - {self.name}"

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100, blank=True)
    sku = models.CharField(max_length=100, blank=True)
    
    # New Enterprise Fields
    short_description = models.TextField(blank=True)
    description = models.TextField(blank=True)
    
    # Rich Content (Flipkart style)
    highlights = models.JSONField(default=list, blank=True) # Array of short bullet points
    features = models.JSONField(default=list, blank=True) # Used for key features / feature cards
    specifications = models.JSONField(default=list, blank=True) # [{"group": "Display", "attributes": [{"name": "Size", "value": "6.7"}]}]
    
    # SEO & Tracking
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    barcode = models.CharField(max_length=100, blank=True)
    
    price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    stock = models.IntegerField(default=0)
    warehouse_location = models.CharField(max_length=100, blank=True, default="Main Hub")
    
    # Physical Attributes
    weight = models.CharField(max_length=50, blank=True) # e.g., "1.5 kg"
    dimensions = models.CharField(max_length=100, blank=True) # e.g., "10x20x5 cm"
    
    # Variants (stored as JSON arrays for flexibility)
    color_variants = models.JSONField(default=list, blank=True)
    size_variants = models.JSONField(default=list, blank=True)
    
    # Policies & Shipping
    warranty_info = models.CharField(max_length=255, blank=True, default="1 Year Manufacturer Warranty")
    return_policy = models.CharField(max_length=255, blank=True, default="7 Days Replacement")
    shipping_info = models.CharField(max_length=255, blank=True, default="Free Delivery")
    delivery_estimate = models.CharField(max_length=100, blank=True, default="3-5 Business Days")
    tags = models.JSONField(default=list, blank=True) # Search tags
    
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    reviews_count = models.IntegerField(default=0)
    
    # Status Toggles
    is_featured = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    
    # Trending Management
    is_trending = models.BooleanField(default=False)
    trending_priority = models.IntegerField(default=0)
    trending_start_date = models.DateTimeField(null=True, blank=True)
    trending_end_date = models.DateTimeField(null=True, blank=True)
    
    # Service specific fields
    is_service = models.BooleanField(default=False)
    duration = models.CharField(max_length=100, blank=True) # e.g., "2 Hours", "1 Day"
    benefits = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True) # [{"q": "...", "a": "..."}]
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-id']

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.URLField(max_length=500, blank=True, null=True)
    image_file = models.ImageField(upload_to='products/', null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    label = models.CharField(max_length=100, blank=True) # e.g., "Front View", "Top View", "Packaging"

    def __str__(self):
        return f"{self.product.name} Image"

class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey('users.User', related_name='reviews', on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating} star by {self.user.name} on {self.product.name}"

    def update_product_rating(self):
        product = self.product
        reviews = product.reviews.all()
        count = reviews.count()
        if count > 0:
            total = sum(r.rating for r in reviews)
            product.rating = round(total / count, 1)
        else:
            product.rating = 0.0
        product.reviews_count = count
        product.save()

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_product_rating()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        self.update_product_rating()

class Banner(models.Model):
    POSITION_CHOICES = [
        ('HERO', 'Hero Banner'),
        ('DISCOUNT', 'Discount Poster'),
    ]
    business = models.ForeignKey(Business, related_name='banners', on_delete=models.CASCADE, null=True, blank=True, help_text="Leave blank for global homepage banners")
    position = models.CharField(max_length=50, choices=POSITION_CHOICES, default='HERO')
    image = models.URLField(max_length=500, blank=True, null=True)
    image_file = models.ImageField(upload_to='banners/', null=True, blank=True)
    title = models.CharField(max_length=200, blank=True)
    subtitle = models.CharField(max_length=500, blank=True)
    cta_text = models.CharField(max_length=100, blank=True, default="Explore Now")
    cta_link = models.CharField(max_length=500, blank=True)
    priority = models.IntegerField(default=0, help_text="Higher numbers appear first")
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-priority', 'id']

    def __str__(self):
        if self.business:
            return f"Banner for {self.business.name} - {self.title or 'Untitled'}"
        return f"Global Banner - {self.title or 'Untitled'}"
