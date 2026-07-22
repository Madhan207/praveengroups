import os
# pyrefly: ignore [missing-import]
import django
import random
from datetime import timedelta
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
# pyrefly: ignore [missing-import]
from django.utils import timezone
# pyrefly: ignore [missing-import]
from django.db import transaction
from products.models import Business, Category, Product, ProductImage, Review
from users.models import User, Address
from orders.models import Order, OrderItem, PaymentVerification, Cart, CartItem, Invoice

try:
    # pyrefly: ignore [missing-import]
    from faker import Faker
except ImportError:
    print("Please install faker: pip install faker")
    sys.exit(1)

fake = Faker('en_IN')

# ─── Configuration ──────────────────────────────────────────
PRODUCTS_PER_CATEGORY = 5
USERS_TO_CREATE = 20
ORDERS_TO_CREATE = 50

print("WARNING: This will DELETE all existing data in the database!")
print("Starting in 3 seconds...")
import time
time.sleep(3)

def seed_data():
    with transaction.atomic():
        # ─── 1. Purge Data ──────────────────────────────────────────
        print("Purging existing data...")
        Order.objects.all().delete()
        Cart.objects.all().delete()
        Review.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Business.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()
        
        # ─── 2. Generate Users ──────────────────────────────────────
        print(f"Generating {USERS_TO_CREATE} Customers...")
        users = []
        for i in range(USERS_TO_CREATE):
            email = f"demo{random.randint(1000, 999999)}@{fake.domain_name()}"
            user = User(
                username=email.split('@')[0] + str(random.randint(100, 999)),
                email=email,
                mobile_number=fake.numerify('9#########') + str(i),
                name=fake.name(),
            )
            user.set_password('demo123')
            users.append(user)
        
        User.objects.bulk_create(users)
        all_users = list(User.objects.exclude(is_superuser=True))
        
        # ─── 3. Generate Businesses and Categories ──────────────────
        print("Generating Businesses and Categories...")
        
        PLACEHOLDERS = {
            'smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
            'laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
            'tvs': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80',
            'audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
            'clothing': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80',
            'groceries': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
            'spiritual': 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=600&q=80',
            'agriculture': 'https://images.unsplash.com/photo-1627920769843-5d75ba49eb72?w=600&q=80',
            'construction': 'https://images.unsplash.com/photo-1504307651254-35680f356f58?w=600&q=80',
            'default': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'
        }
        
        BUSINESSES_DATA = [
            {"name": "Praveen Electro World", "slug": "praveen-electro-world", "desc": "Electronics Retail & Wholesale", "type": "product", "cats": ["Smartphones", "Laptops", "TVs", "Home Audio", "CCTV", "Networking"]},
            {"name": "Praveen Lifestyles", "slug": "praveen-lifestyles", "desc": "Fashion & Lifestyle Apparels", "type": "product", "cats": ["Men's Clothing", "Women's Clothing", "Watches", "Footwear"]},
            {"name": "PraveenMart", "slug": "praveenmart", "desc": "Daily Essentials & Groceries", "type": "product", "cats": ["Rice & Pulses", "Snacks", "Beverages", "Cleaning Products"]},
            {"name": "Praveen Spiritual Stores", "slug": "praveen-spiritual-stores", "desc": "Divine & Spiritual Products", "type": "product", "cats": ["Idols", "Pooja Kits", "Incense Sticks", "Spiritual Books"]},
            {"name": "Namma Mannu", "slug": "namma-mannu", "desc": "Agriculture & Organic Farming", "type": "product", "cats": ["Seeds", "Organic Fertilizers", "Garden Tools"]},
            {"name": "Praveen Global Enterprises", "slug": "praveen-global-enterprises", "desc": "Construction & Industrial Supplies", "type": "product", "cats": ["Cement", "Steel", "Paints", "Hardware"]},
            {"name": "Praveen DJ Events", "slug": "praveen-dj-events", "desc": "Professional Event Services", "type": "service", "cats": ["Wedding DJ", "Corporate Events", "Sound System Rental"]},
            {"name": "Studios Entertainment", "slug": "studios-entertainment", "desc": "Photography & Videography", "type": "service", "cats": ["Wedding Shoot", "Corporate Video", "Portrait Photography"]}
        ]
        
        import uuid
        
        created_categories = []
        for idx, b_data in enumerate(BUSINESSES_DATA):
            biz = Business.objects.create(name=b_data['name'], slug=b_data['slug'], description=b_data['desc'], type=b_data['type'], order=idx)
            for cat_name in b_data['cats']:
                cat_slug = f"{fake.slug(cat_name)}-{random.randint(1000, 9999)}"
                img_key = next((k for k in PLACEHOLDERS.keys() if k.lower() in cat_name.lower()), 'default')
                cat = Category.objects.create(business=biz, name=cat_name, slug=cat_slug, image=PLACEHOLDERS[img_key])
                created_categories.append(cat)
        
        # ─── 4. Generate Products ───────────────────────────────────
        print(f"Generating ~{len(created_categories) * PRODUCTS_PER_CATEGORY} Products (Demo Data)...")
        product_objects = []
        image_objects = []
        
        for cat in created_categories:
            is_service = cat.business.type == 'service'
            for _ in range(PRODUCTS_PER_CATEGORY):
                name = f"Demo {fake.company()} {cat.name} {fake.ean8()}"
                slug = f"{fake.slug(name)}-{uuid.uuid4().hex[:6]}"
                price = random.randint(500, 150000)
                has_discount = random.choice([True, False])
                discount = price - (price * random.randint(5, 30) // 100) if has_discount else None
                
                p = Product(
                    category=cat, name=name, slug=slug, brand=fake.company(), sku=fake.ean13(),
                    short_description=fake.sentence(nb_words=10),
                    description=fake.paragraph(nb_sentences=5) + "\n\n(DEMO DATA)",
                    features=[fake.sentence() for _ in range(4)],
                    specifications={"Material": "Premium", "Origin": "India", "Type": cat.name},
                    price=price, discount_price=discount, gst_percentage=random.choice([5.0, 12.0, 18.0, 28.0]),
                    stock=random.randint(0, 500) if not is_service else 0,
                    warehouse_location=random.choice(["Mumbai Hub", "Delhi Hub", "Chennai Hub", "Bangalore Hub"]),
                    weight=f"{random.randint(1, 100)} {random.choice(['kg', 'g', 'lbs'])}",
                    dimensions=f"{random.randint(10, 100)}x{random.randint(10, 100)}x{random.randint(1, 50)} cm",
                    color_variants=["Red", "Black", "White"] if not is_service else [],
                    size_variants=["S", "M", "L", "XL"] if "Clothing" in cat.name else [],
                    warranty_info="1 Year Brand Warranty" if not is_service else "",
                    return_policy="7 Days Return" if not is_service else "No Returns on Services",
                    shipping_info="Free Shipping across India",
                    delivery_estimate="3-5 Business Days" if not is_service else "Service rendered as scheduled",
                    tags=[cat.name, "Premium", "Demo"],
                    rating=round(random.uniform(3.5, 5.0), 1),
                    reviews_count=random.randint(10, 50),
                    is_featured=random.choice([True, False, False, False]),
                    is_service=is_service,
                    duration=f"{random.randint(1, 8)} Hours" if is_service else ""
                )
                product_objects.append(p)
        
        Product.objects.bulk_create(product_objects)
        all_products = list(Product.objects.all())
        
        print("Generating Images for Products...")
        for p in all_products:
            img_key = next((k for k in PLACEHOLDERS.keys() if k.lower() in p.category.name.lower()), 'default')
            url = f"{PLACEHOLDERS[img_key]}&rnd={p.id}"
            image_objects.append(ProductImage(product=p, image=url, is_primary=True))
        ProductImage.objects.bulk_create(image_objects)
        
        # ─── 5. Generate Reviews ────────────────────────────────────
        print("Generating Reviews...")
        reviews = []
        for p in all_products[:200]:
            for _ in range(random.randint(2, 5)):
                reviews.append(Review(product=p, user=random.choice(all_users), rating=random.randint(3, 5), comment=fake.sentence(nb_words=12)))
        Review.objects.bulk_create(reviews)
        
        # ─── 6. Generate Orders ───────────────────────────
        print(f"Generating {ORDERS_TO_CREATE} Orders...")
        orders_to_create = []
        for _ in range(ORDERS_TO_CREATE):
            user = random.choice(all_users)
            status = random.choice(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
            order = Order(
                user=user, full_name=user.name, mobile_number=user.mobile_number,
                address=fake.address(), city=fake.city(), state=fake.state(), pincode=fake.postcode(),
                total_amount=0, payment_method=random.choice(['UPI', 'COD']), status=status,
            )
            order.created_at = timezone.now() - timedelta(days=random.randint(0, 365))
            orders_to_create.append(order)
            
        Order.objects.bulk_create(orders_to_create)
        
        # Order items
        all_orders = list(Order.objects.all())
        items = []
        for order in all_orders:
            total = 0
            for _ in range(random.randint(1, 4)):
                p = random.choice(all_products)
                qty = random.randint(1, 3)
                price = p.discount_price if p.discount_price else p.price
                total += price * qty
                items.append(OrderItem(order=order, product=p, price=price, quantity=qty))
            # Just set in memory and bulk update later
            order.total_amount = total
            
        OrderItem.objects.bulk_create(items)
        Order.objects.bulk_update(all_orders, ['total_amount'])
        
        invoices = []
        for order in [o for o in all_orders if o.status == 'Delivered']:
            invoices.append(Invoice(order=order, invoice_number=f"INV-{uuid.uuid4().hex[:8].upper()}"))
        Invoice.objects.bulk_create(invoices)
        
        print("Enterprise Demo Data Generation Complete!")
        print(f"Stats: {User.objects.count()} Users | {Product.objects.count()} Products | {Order.objects.count()} Orders")

if __name__ == "__main__":
    seed_data()
