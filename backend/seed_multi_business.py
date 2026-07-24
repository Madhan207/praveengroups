"""
seed_multi_business.py
======================
Completely rewrites all business demo data.

- Product businesses: get categories + 20 products each category
- Service businesses: get rich JSON fields (services, packages, gallery, team, FAQs, testimonials)
  → ZERO products are created for service/trust/logistics businesses
"""
import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Business, Category, Product, ProductImage, Banner
from django.utils.text import slugify
from django.utils import timezone

# ─────────────────────────────────────────────────────────────────────────────
# Shared image pools
# ─────────────────────────────────────────────────────────────────────────────
ELECTRONICS_IMGS = [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80",
]
FASHION_IMGS = [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
]
GROCERY_IMGS = [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80",
    "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=600&q=80",
    "https://images.unsplash.com/photo-1553546895-531931aa1aa8?w=600&q=80",
]
SPIRITUAL_IMGS = [
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&q=80",
    "https://images.unsplash.com/photo-1519307650056-59e5c72d4e7f?w=600&q=80",
    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80",
]
FARM_IMGS = [
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
]
INDUSTRIAL_IMGS = [
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80",
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600&q=80",
    "https://images.unsplash.com/photo-1612010167102-7a6f9d3d2e1b?w=600&q=80",
]
BANNER_IMAGES = [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    "https://images.unsplash.com/photo-1560472355-536de3962603?w=1600&q=80",
]

DJ_BANNERS = [
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80",
]
STUDIO_BANNERS = [
    "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1600&q=80",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
]
TRUST_BANNERS = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80",
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80",
]
TRANSPORT_BANNERS = [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80",
    "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1600&q=80",
]

# ─────────────────────────────────────────────────────────────────────────────
# PRODUCT BUSINESSES
# ─────────────────────────────────────────────────────────────────────────────
PRODUCT_BUSINESSES = [
    {
        "name": "Praveen Electro World",
        "slug": "praveen-electro-world",
        "description": "Premium Electronics Retail & Wholesale — Smartphones, Laptops, TVs, DJ Gear, CCTV, Solar & More",
        "type": "product",
        "banner_images": BANNER_IMAGES,
        "product_image_pool": ELECTRONICS_IMGS,
        "categories": [
            {"name": "Smartphones", "products": [
                {"name": "Samsung Galaxy S24 Ultra", "price": 129999, "dp": 119999, "brand": "Samsung"},
                {"name": "iPhone 15 Pro Max", "price": 159900, "dp": 149900, "brand": "Apple"},
                {"name": "OnePlus 12", "price": 64999, "dp": 59999, "brand": "OnePlus"},
                {"name": "Redmi Note 13 Pro", "price": 24999, "dp": 21999, "brand": "Xiaomi"},
                {"name": "Realme 12 Pro+", "price": 29999, "dp": 26999, "brand": "Realme"},
            ]},
            {"name": "Laptops", "products": [
                {"name": "MacBook Air M3", "price": 114900, "dp": 109900, "brand": "Apple"},
                {"name": "Dell XPS 15", "price": 145000, "dp": 135000, "brand": "Dell"},
                {"name": "Lenovo ThinkPad X1 Carbon", "price": 135000, "dp": 125000, "brand": "Lenovo"},
                {"name": "HP Spectre x360", "price": 125000, "dp": 115000, "brand": "HP"},
                {"name": "Asus ROG Zephyrus G14", "price": 119990, "dp": 109990, "brand": "Asus"},
            ]},
            {"name": "Smart TVs", "products": [
                {"name": "Samsung 65\" QLED 4K TV", "price": 89990, "dp": 79990, "brand": "Samsung"},
                {"name": "LG OLED 55\" C3", "price": 99990, "dp": 89990, "brand": "LG"},
                {"name": "Sony Bravia 4K XR 65\"", "price": 109990, "dp": 99990, "brand": "Sony"},
                {"name": "OnePlus 50\" Q1 Pro QLED", "price": 49999, "dp": 44999, "brand": "OnePlus"},
            ]},
            {"name": "Home Audio", "products": [
                {"name": "Sony WH-1000XM5 Headphones", "price": 29990, "dp": 25990, "brand": "Sony"},
                {"name": "Bose SoundLink Max", "price": 35990, "dp": 32990, "brand": "Bose"},
                {"name": "JBL Xtreme 3 Speaker", "price": 19990, "dp": 16990, "brand": "JBL"},
            ]},
            {"name": "DJ Equipment", "products": [
                {"name": "Pioneer CDJ-3000 Player", "price": 245000, "dp": None, "brand": "Pioneer"},
                {"name": "Allen & Heath Xone:96 Mixer", "price": 185000, "dp": None, "brand": "Allen & Heath"},
                {"name": "Native Instruments Traktor S4 MK3", "price": 65000, "dp": 58000, "brand": "Native Instruments"},
            ]},
            {"name": "CCTV & Security", "products": [
                {"name": "CP Plus 2MP HD Camera Kit 8CH", "price": 14999, "dp": 12999, "brand": "CP Plus"},
                {"name": "Hikvision 5MP Turret Camera", "price": 4999, "dp": 3999, "brand": "Hikvision"},
            ]},
            {"name": "Solar & Power", "products": [
                {"name": "Luminous 3kW Solar Panel Kit", "price": 85000, "dp": 79000, "brand": "Luminous"},
                {"name": "Genus 150Ah Tubular Battery", "price": 12999, "dp": 11499, "brand": "Genus"},
            ]},
        ]
    },
    {
        "name": "Praveen Lifestyles",
        "slug": "praveen-lifestyles",
        "description": "Fashion & Lifestyle — Men's, Women's, Kids Wear, Watches, Footwear, Bags & Beauty",
        "type": "product",
        "banner_images": BANNER_IMAGES,
        "product_image_pool": FASHION_IMGS,
        "categories": [
            {"name": "Men's Wear", "products": [
                {"name": "Cotton Formal Shirt - Blue", "price": 1499, "dp": 1199, "brand": "Arrow"},
                {"name": "Slim Fit Chinos - Beige", "price": 1999, "dp": 1599, "brand": "UCB"},
                {"name": "Men's Polo T-Shirt", "price": 799, "dp": 649, "brand": "Lacoste"},
            ]},
            {"name": "Women's Wear", "products": [
                {"name": "Floral Kurti Set", "price": 1299, "dp": 999, "brand": "Biba"},
                {"name": "Saree Silk Kanchivaram", "price": 8999, "dp": 7499, "brand": "Nalli"},
                {"name": "Anarkali Suit Premium", "price": 2499, "dp": 1999, "brand": "W"},
            ]},
            {"name": "Kids Wear", "products": [
                {"name": "Boys Cargo Pants - Olive", "price": 699, "dp": 549, "brand": "H&M"},
                {"name": "Girls Frock - Pink Print", "price": 599, "dp": 449, "brand": "Zara Kids"},
            ]},
            {"name": "Watches", "products": [
                {"name": "Titan Skywear Chronograph", "price": 8999, "dp": 7499, "brand": "Titan"},
                {"name": "Fossil Gen 6 Smartwatch", "price": 19999, "dp": 17499, "brand": "Fossil"},
            ]},
            {"name": "Footwear", "products": [
                {"name": "Nike Air Max 270", "price": 12995, "dp": 10995, "brand": "Nike"},
                {"name": "Woodland Outdoor Boots", "price": 4499, "dp": 3699, "brand": "Woodland"},
            ]},
        ]
    },
    {
        "name": "PraveenMart",
        "slug": "praveenmart",
        "description": "Supermarket & Daily Essentials — Grocery, Rice, Vegetables, Fruits & Household Items",
        "type": "product",
        "banner_images": BANNER_IMAGES,
        "product_image_pool": GROCERY_IMGS,
        "categories": [
            {"name": "Rice & Grains", "products": [
                {"name": "Seeraga Samba Rice 25kg", "price": 1850, "dp": 1699, "brand": "Aachi"},
                {"name": "Basmati Rice Premium 5kg", "price": 549, "dp": 499, "brand": "India Gate"},
                {"name": "Idly Rice 10kg", "price": 650, "dp": 599, "brand": "Local"},
            ]},
            {"name": "Grocery & Dals", "products": [
                {"name": "Toor Dal 2kg", "price": 240, "dp": 219, "brand": "24 Mantra Organic"},
                {"name": "Chana Dal 1kg", "price": 110, "dp": 99, "brand": "BB Royal"},
                {"name": "Wheat Flour Atta 10kg", "price": 380, "dp": 349, "brand": "Aashirvaad"},
            ]},
            {"name": "Cooking Oils", "products": [
                {"name": "Sunflower Oil 5L", "price": 649, "dp": 599, "brand": "Fortune"},
                {"name": "Cold Pressed Coconut Oil 1L", "price": 299, "dp": 269, "brand": "Parachute"},
            ]},
            {"name": "Beverages", "products": [
                {"name": "Brooke Bond Red Label Tea 1kg", "price": 399, "dp": 349, "brand": "Brooke Bond"},
                {"name": "Nescafe Classic 100g", "price": 279, "dp": 249, "brand": "Nescafe"},
            ]},
            {"name": "Household Items", "products": [
                {"name": "Surf Excel Matic 4kg", "price": 699, "dp": 619, "brand": "Surf Excel"},
                {"name": "Vim Dishwash Liquid 1L", "price": 149, "dp": 129, "brand": "Vim"},
            ]},
        ]
    },
    {
        "name": "Praveen Spiritual Stores",
        "slug": "praveen-spiritual-stores",
        "description": "Spiritual & Pooja Items — Idols, Incense, Lamps, Rudraksha, Holy Books & Festival Decorations",
        "type": "product",
        "banner_images": BANNER_IMAGES,
        "product_image_pool": SPIRITUAL_IMGS,
        "categories": [
            {"name": "God Idols", "products": [
                {"name": "Brass Ganesha Idol 12\"", "price": 2999, "dp": 2499, "brand": "Handcrafted"},
                {"name": "Marble Lakshmi Idol 10\"", "price": 3999, "dp": 3499, "brand": "Handcrafted"},
                {"name": "Panchaloha Murugan 8\"", "price": 4999, "dp": 4499, "brand": "Premium Craft"},
            ]},
            {"name": "Incense & Agarbatti", "products": [
                {"name": "Cycle Agarbatti 200 Sticks", "price": 149, "dp": 119, "brand": "Cycle"},
                {"name": "Nag Champa Premium Incense", "price": 199, "dp": 169, "brand": "Satya"},
            ]},
            {"name": "Pooja Accessories", "products": [
                {"name": "Brass Diya Set of 6", "price": 599, "dp": 499, "brand": "Handcrafted"},
                {"name": "Silver Plated Pooja Thali Set", "price": 1499, "dp": 1199, "brand": "BM Traders"},
            ]},
            {"name": "Rudraksha & Crystals", "products": [
                {"name": "5 Mukhi Rudraksha Mala (108 beads)", "price": 899, "dp": 749, "brand": "Certified"},
                {"name": "Rose Quartz Crystal Ball 5cm", "price": 599, "dp": 499, "brand": "Natural"},
            ]},
        ]
    },
    {
        "name": "Namma Mannu",
        "slug": "namma-mannu",
        "description": "Agriculture & Farming Essentials — Seeds, Organic Fertilizers, Farm Tools & Organic Foods",
        "type": "product",
        "banner_images": BANNER_IMAGES,
        "product_image_pool": FARM_IMGS,
        "categories": [
            {"name": "Seeds", "products": [
                {"name": "Hybrid Tomato Seeds (100g)", "price": 299, "dp": 249, "brand": "Mahyco"},
                {"name": "Paddy Seed CO-43 (5kg)", "price": 450, "dp": 399, "brand": "TNAU"},
                {"name": "Groundnut Seed (1kg)", "price": 180, "dp": 149, "brand": "Local Certified"},
            ]},
            {"name": "Organic Fertilizers", "products": [
                {"name": "Vermicompost 10kg", "price": 299, "dp": 249, "brand": "GreenFarm"},
                {"name": "Neem Cake Fertilizer 5kg", "price": 199, "dp": 169, "brand": "Krishi"},
                {"name": "Bio NPK Liquid 500ml", "price": 249, "dp": 209, "brand": "Parry"},
            ]},
            {"name": "Farm Equipment", "products": [
                {"name": "Knapsack Sprayer 16L", "price": 1199, "dp": 999, "brand": "Neptune"},
                {"name": "Drip Irrigation Kit 1 Acre", "price": 8999, "dp": 7999, "brand": "Jain Irrigation"},
            ]},
            {"name": "Organic Foods", "products": [
                {"name": "Cold Pressed Sesame Oil 1L", "price": 349, "dp": 299, "brand": "Farm Fresh"},
                {"name": "Organic Moringa Powder 200g", "price": 199, "dp": 169, "brand": "NatureBest"},
            ]},
        ]
    },
    {
        "name": "Praveen Global Enterprises",
        "slug": "praveen-global-enterprises",
        "description": "Industrial & Construction Materials — Cement, Steel, Plumbing, Electrical, Hardware & Safety",
        "type": "product",
        "banner_images": BANNER_IMAGES,
        "product_image_pool": INDUSTRIAL_IMGS,
        "categories": [
            {"name": "Cement & Concrete", "products": [
                {"name": "Ultratech 53 Grade Cement 50kg", "price": 430, "dp": 399, "brand": "Ultratech"},
                {"name": "ACC Gold PPC Cement 50kg", "price": 420, "dp": 389, "brand": "ACC"},
            ]},
            {"name": "Steel & Iron", "products": [
                {"name": "TMT Steel Bar Fe500 (12mm) 12m", "price": 850, "dp": None, "brand": "TATA"},
                {"name": "Galvanized Iron Pipe 2\" x 6m", "price": 750, "dp": 699, "brand": "APL Apollo"},
            ]},
            {"name": "Electrical Materials", "products": [
                {"name": "Finolex FR PVC Wire 1.5sq.mm 90m", "price": 1299, "dp": 1149, "brand": "Finolex"},
                {"name": "Havells MCB 32A 2-pole", "price": 449, "dp": 399, "brand": "Havells"},
            ]},
            {"name": "Plumbing", "products": [
                {"name": "Astral CPVC Pipe 1\" x 3m", "price": 299, "dp": 269, "brand": "Astral"},
                {"name": "Supreme PVC Ball Valve 1\"", "price": 149, "dp": 129, "brand": "Supreme"},
            ]},
            {"name": "Safety Equipment", "products": [
                {"name": "3M Safety Helmet White", "price": 499, "dp": 449, "brand": "3M"},
                {"name": "Reflective Safety Jacket", "price": 299, "dp": 249, "brand": "Karam"},
            ]},
        ]
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# SERVICE BUSINESSES — rich JSON data, ZERO products
# ─────────────────────────────────────────────────────────────────────────────
SERVICE_BUSINESSES = [
    {
        "name": "Praveen DJ Events",
        "slug": "praveen-dj-events",
        "description": "Professional Event Management & DJ Services — Weddings, Corporates, Birthdays & Stage Shows",
        "type": "service",
        "about_us": "Praveen DJ Events is South India's premier event management and entertainment company with over 12 years of experience. We've transformed more than 2,000 events into extraordinary experiences — from intimate birthday celebrations to grand weddings with 1,000+ guests. Our state-of-the-art sound systems, professional lighting rigs, and expert DJ team ensure that every event is unforgettable. We are fully equipped to handle weddings, corporate events, college fests, concerts, and private parties of any scale.",
        "mission_vision": "Mission: To deliver world-class entertainment experiences that create lifelong memories, using the latest technology and professional expertise.\n\nVision: To be the most trusted and celebrated event entertainment company in Tamil Nadu, setting the gold standard for quality, creativity, and customer satisfaction in every performance.",
        "contact_phone": "+91 98765 43210",
        "contact_email": "events@praveendjmailinator.com",
        "whatsapp_number": "919876543210",
        "address": "No. 45, Music Street, T. Nagar, Chennai - 600017",
        "banner_images": DJ_BANNERS,
        "social_links": {
            "instagram": "https://instagram.com",
            "facebook": "https://facebook.com",
            "youtube": "https://youtube.com"
        },
        "services_data": [
            {"name": "Wedding DJ", "description": "Premium DJ setup for your dream wedding with 5.1 surround sound, custom playlists, and professional lighting.", "image": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80"},
            {"name": "Birthday Party DJ", "description": "Make your birthday unforgettable with high-energy music, LED lights, and a personalized DJ experience.", "image": "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80"},
            {"name": "Corporate Events", "description": "Professional audio-visual setup for product launches, conferences, team parties, and brand events.", "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80"},
            {"name": "College Fests", "description": "High-voltage DJ performance for college annual days, cultural fests, and youth events.", "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80"},
            {"name": "Stage Decoration", "description": "Stunning stage setups with floral arches, LED backdrops, draping, and thematic decorations.", "image": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80"},
            {"name": "Lighting & LED Wall", "description": "Professional lighting design with moving heads, fog machines, lasers, and large-format LED walls.", "image": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80"},
            {"name": "Sound System Rental", "description": "Professional-grade JBL, QSC, and L-Acoustics sound systems for events of any size.", "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80"},
            {"name": "Live Band Performance", "description": "Professional live band with vocalists, guitarists, drummers, and keyboard players for any genre.", "image": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80"},
            {"name": "Anchor & Emcee", "description": "Experienced bilingual (Tamil/English) anchors and emcees for all types of events.", "image": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80"},
            {"name": "Photography Add-on", "description": "Professional event photography package that can be bundled with any DJ booking.", "image": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80"},
            {"name": "Videography Add-on", "description": "High-quality event videography with drone shots, cinematic editing, and same-day highlights.", "image": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80"},
            {"name": "Dance Floor Setup", "description": "LED dance floors, dry ice fog, and special effects for an extraordinary party atmosphere.", "image": "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80"},
        ],
        "packages_data": [
            {
                "name": "Bronze",
                "price": "₹15,000",
                "duration": "4 Hours",
                "badge": None,
                "features": ["Professional DJ", "2 Speaker Setup (JBL)", "Basic Lighting (4 moving heads)", "1 Wireless Mic", "Music from Prelisted Playlist", "Setup & Breakdown Included"]
            },
            {
                "name": "Silver",
                "price": "₹28,000",
                "duration": "6 Hours",
                "badge": "Popular",
                "features": ["Professional DJ", "4 Speaker Setup (QSC)", "Full Lighting Rig (8 moving heads + LED Par)", "2 Wireless Mics", "Custom Playlist Curation", "Fog Machine", "1 Cordless Roving Mic", "Setup & Breakdown Included"]
            },
            {
                "name": "Gold",
                "price": "₹45,000",
                "duration": "8 Hours",
                "badge": "Best Value",
                "features": ["Celebrity-level DJ Performance", "Line Array Speaker System", "Full Lighting + Laser Show", "3 Wireless Mics + DJ Mic", "Custom Playlist + Live Mixing", "2x Fog Machines + Bubble Machine", "LED Uplighting (16 units)", "Dedicated Sound Engineer"]
            },
            {
                "name": "Premium",
                "price": "₹75,000",
                "duration": "10 Hours",
                "badge": "Most Complete",
                "features": ["Star DJ + Live Band (5 members)", "L-Acoustics Pro Line Array", "Full Stage Lighting + LED Wall (8x5ft)", "Unlimited Wireless Mics", "Custom Sound Design", "Pyrotechnics (Cold Sparks)", "Dedicated Event Manager", "Dry Ice Dance Floor Effect", "Professional Photography (500 photos)"]
            },
            {
                "name": "Luxury",
                "price": "₹1,20,000",
                "duration": "Full Day",
                "badge": "Exclusive",
                "features": ["Superstar DJ + Full Live Band", "Concert-grade L-Acoustics System", "Full LED Wall (20x10ft) + Kinetic Lights", "Professional Stage Setup & Draping", "Complete Event Coordination", "Fireworks Finale + Special Effects", "360° Photo Booth", "Same-day Highlight Video (Drone)", "Unlimited Guests", "Dedicated Hospitality Team"]
            },
        ],
        "gallery_data": [
            {"image": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80", "caption": "Grand Wedding Reception – 2024", "category": "Wedding"},
            {"image": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80", "caption": "Corporate Annual Gala Night", "category": "Corporate"},
            {"image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80", "caption": "College Fest Headliner Performance", "category": "College"},
            {"image": "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80", "caption": "Birthday Bash – LED Setup", "category": "Birthday"},
            {"image": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80", "caption": "Floral Stage Design – Wedding", "category": "Wedding"},
            {"image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80", "caption": "Sound Setup – Outdoor Concert", "category": "Concert"},
            {"image": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80", "caption": "Live Band Night – Corporate", "category": "Corporate"},
            {"image": "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80", "caption": "LED Dance Floor – New Year Event", "category": "Special"},
        ],
        "team_data": [
            {"name": "Praveen Kumar", "role": "Founder & Chief DJ", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80", "bio": "12+ years of experience. Headlined 500+ events across South India."},
            {"name": "DJ Arjun", "role": "Senior Event DJ", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80", "bio": "Specializes in Bollywood, EDM, and regional music. 8 years experience."},
            {"name": "Surya Lighting", "role": "Chief Lighting Engineer", "image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80", "bio": "Expert in concert-grade lighting design and LED wall programming."},
            {"name": "Anitha Raj", "role": "Event Manager", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80", "bio": "Coordinates logistics, vendor relations, and client communication for 200+ events/year."},
            {"name": "Karthik Sound", "role": "Sound Engineer", "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80", "bio": "Certified audio engineer with expertise in live sound mixing and acoustic tuning."},
        ],
        "testimonials_data": [
            {"name": "Priya & Rahul Sharma", "role": "Wedding Couple, Dec 2023", "rating": 5, "comment": "Praveen DJ Events made our wedding absolutely magical! The lighting was breathtaking, the DJ read the crowd perfectly, and every guest was on the dance floor. Highly recommend the Gold package!"},
            {"name": "Sundar Ramasamy", "role": "HR Manager, TCS Chennai", "rating": 5, "comment": "We hired them for our Annual Day and it was phenomenal. Professional setup, zero delays, and the live band was outstanding. Will book again for sure."},
            {"name": "Kavitha Nair", "role": "Birthday Party Host", "rating": 5, "comment": "My daughter's 18th birthday party was a dream come true! The LED setup, DJ music, and fog machine effects were beyond our expectations. Thank you Praveen team!"},
            {"name": "Dr. Anand Krishnamurthy", "role": "Hospital Launch Event", "rating": 5, "comment": "Arranged a grand launch event on 48-hour notice. The team was professional, delivered everything on time, and the sound quality was perfect for our 500-guest auditorium."},
            {"name": "IIT Madras Students Council", "role": "College Cultural Fest", "rating": 5, "comment": "Headlined our annual fest with 3000+ students. The concert-grade sound system and laser show blew everyone away. Best event we've ever had!"},
        ],
        "faqs_data": [
            {"question": "How far in advance should I book?", "answer": "We recommend booking at least 4-8 weeks in advance for weddings and major events, and 1-2 weeks for smaller events. We also accommodate last-minute bookings based on availability."},
            {"question": "Do you travel outside Chennai?", "answer": "Yes! We serve all of Tamil Nadu and can travel to Kerala, Karnataka, and Andhra Pradesh. Travel charges apply for locations outside Chennai."},
            {"question": "Can I provide my own playlist?", "answer": "Absolutely! You can share your playlist via Spotify, YouTube, or a digital file. Our DJs will also mix and enhance it professionally based on the event flow."},
            {"question": "What happens if equipment malfunctions?", "answer": "We always carry 100% backup equipment at every event. Any malfunction is resolved within minutes with zero disruption to your event."},
            {"question": "Is a deposit required for booking?", "answer": "Yes, we require a 25% advance deposit to confirm your booking, with the remaining balance due on the event day."},
            {"question": "Do you provide a contract?", "answer": "Yes, every booking comes with a detailed contract outlining services, timeline, payment terms, and cancellation policy."},
        ],
        "events_data": [
            {"title": "Grand Wedding – Sharma Family", "date": "2024-08-15", "location": "The Leela Palace, Chennai", "status": "Booked"},
            {"title": "Corporate Annual Day – InfoSys Chennai", "date": "2024-09-10", "location": "Chennai Trade Centre", "status": "Booked"},
            {"title": "Available Slot", "date": "2024-08-25", "location": "Any Venue", "status": "Available"},
            {"title": "College Fest – Anna University", "date": "2024-09-28", "location": "Anna University Campus", "status": "Booked"},
            {"title": "Available Slot", "date": "2024-10-05", "location": "Any Venue", "status": "Available"},
        ],
    },
    {
        "name": "Praveen Studios Entertainment",
        "slug": "praveen-studios-entertainment",
        "description": "Professional Photography, Videography & Cinematography — Weddings, Events, Drone Shoots & Corporate",
        "type": "service",
        "about_us": "Praveen Studios Entertainment is an award-winning photography and videography studio based in Chennai with over 10 years of experience. We specialize in wedding cinematography, editorial photography, drone aerial shoots, corporate video production, and live streaming services. Our team of certified photographers and cinematographers have captured memories for more than 1,500 clients across South India. We use the latest Canon EOS R5, Sony A7S III, and DJI Inspire 3 drone equipment to deliver cinema-quality results.",
        "mission_vision": "Mission: To capture the most authentic and beautiful moments of life with cinematic brilliance, creating memories that last forever.\n\nVision: To be South India's most celebrated photography and video production studio, recognized for artistic excellence and technical mastery.",
        "contact_phone": "+91 98755 12345",
        "contact_email": "bookings@praveen-studios.com",
        "whatsapp_number": "919875512345",
        "address": "Studio No. 12, Film Nagar, Kodambakkam, Chennai - 600024",
        "banner_images": STUDIO_BANNERS,
        "social_links": {"instagram": "https://instagram.com", "facebook": "https://facebook.com", "youtube": "https://youtube.com"},
        "services_data": [
            {"name": "Wedding Photography", "description": "Candid, traditional, and cinematic wedding photography packages covering all ceremonies.", "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80"},
            {"name": "Wedding Cinematography", "description": "4K cinematic wedding films with trailer cuts, full-length films, and same-day edits.", "image": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80"},
            {"name": "Drone Aerial Photography", "description": "FAA-certified drone photography and 4K video for weddings, real estate, and events.", "image": "https://images.unsplash.com/photo-1527430253228-e93688616381?w=600&q=80"},
            {"name": "Corporate Photography", "description": "Professional headshots, product photography, office tours, and corporate event coverage.", "image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80"},
            {"name": "Pre-Wedding Shoot", "description": "Romantic pre-wedding shoots at scenic locations with full styling and editing.", "image": "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&q=80"},
            {"name": "Photo Albums & Frames", "description": "Premium flush-mount albums, canvas prints, and crystal frames for your memories.", "image": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80"},
            {"name": "Live Streaming", "description": "Professional multi-camera live streaming for weddings, conferences, and corporate events.", "image": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80"},
            {"name": "Social Media Reels", "description": "Instagram and YouTube Shorts production for businesses and personal brands.", "image": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&q=80"},
        ],
        "packages_data": [
            {"name": "Basic", "price": "₹20,000", "duration": "6 Hours Photography", "badge": None, "features": ["1 Photographer", "500 Edited Photos", "Online Gallery (6 months)", "USB Delivery"]},
            {"name": "Classic", "price": "₹45,000", "duration": "Full Day (Wedding)", "badge": "Popular", "features": ["2 Photographers", "1 Videographer", "800 Edited Photos", "5-min Highlight Film", "Drone Shots (20 photos)", "Premium Album (40 pages)", "Online Gallery (1 year)"]},
            {"name": "Premium", "price": "₹85,000", "duration": "2-Day Wedding Coverage", "badge": "Best Value", "features": ["3 Photographers", "2 Videographers", "Full Drone Coverage", "1500 Edited Photos", "15-min Cinematic Film + Trailer", "Same-day Edit (10 photos)", "Premium Flush Album (80 pages)", "Canvas Wall Portrait"]},
            {"name": "Cinematic", "price": "₹1,50,000", "duration": "2-Day + Pre-Wedding", "badge": "Most Complete", "features": ["4 Photographers", "3 Cinematographers", "Full Drone Coverage", "Unlimited Photos (all edited)", "Full Cinematic Film (45-min)", "Instagram Reel (1 min)", "Pre-wedding Shoot (1 location)", "Luxury Album + 5 Photo Books", "4K USB + Cloud Backup"]},
        ],
        "gallery_data": [
            {"image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", "caption": "Destination Wedding – Udaipur", "category": "Wedding"},
            {"image": "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&q=80", "caption": "Pre-Wedding Shoot – Pondicherry", "category": "Pre-Wedding"},
            {"image": "https://images.unsplash.com/photo-1527430253228-e93688616381?w=800&q=80", "caption": "Aerial Drone – Beach Wedding", "category": "Drone"},
            {"image": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80", "caption": "Candid Wedding Moment – Leela Palace", "category": "Wedding"},
            {"image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80", "caption": "Corporate Headshots – IT Company", "category": "Corporate"},
            {"image": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80", "caption": "Live Wedding Streaming – 5000 viewers", "category": "Live Streaming"},
        ],
        "team_data": [
            {"name": "Praveen Murali", "role": "Founder & Lead Cinematographer", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80", "bio": "Award-winning cinematographer with 10+ years. Covered weddings in 8 countries."},
            {"name": "Deepa Anand", "role": "Senior Wedding Photographer", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80", "bio": "Candid photography specialist with a unique eye for emotion and storytelling."},
            {"name": "Rajan Aerial", "role": "Drone Pilot & Photographer", "image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80", "bio": "DGCA-certified drone pilot. Captures stunning aerial perspectives for every event."},
        ],
        "testimonials_data": [
            {"name": "Meera & Arun Nair", "role": "Wedding Couple, Feb 2024", "rating": 5, "comment": "Our wedding photos are beyond beautiful! Praveen Studios captured every emotion perfectly. The cinematic film made our parents cry tears of joy. Worth every rupee!"},
            {"name": "Tata Consultancy Services", "role": "Corporate Client", "rating": 5, "comment": "Professional, punctual, and exceptional quality. They covered our 3-day conference and the photos were ready within 48 hours. Will hire again."},
        ],
        "faqs_data": [
            {"question": "How long before we receive our photos?", "answer": "Edited photos are delivered within 4-6 weeks for weddings and 1-2 weeks for events. Albums take 8-10 weeks for printing."},
            {"question": "Do you travel for destination weddings?", "answer": "Yes! We travel across India and internationally. Travel and accommodation charges are calculated separately."},
            {"question": "What cameras do you use?", "answer": "We use Canon EOS R5, Sony A7S III (primary), and DJI Inspire 3 drone. All shoots are captured in RAW format for superior editing quality."},
        ],
        "events_data": [],
    },
    {
        "name": "Praveen Educational Trust",
        "slug": "praveen-educational-trust",
        "description": "Empowering Communities Through Quality Education, Skill Training & Scholarships",
        "type": "trust",
        "about_us": "Praveen Educational Trust was established in 2010 with a single vision — to ensure that financial barriers never prevent a deserving student from accessing quality education. Over the past 14 years, we have supported more than 5,000 students through scholarships, vocational training, and free educational programs. We partner with leading institutions, government bodies, and corporate CSR programs to create meaningful educational opportunities for students from underprivileged backgrounds across Tamil Nadu.",
        "mission_vision": "Mission: To democratize access to quality education by providing scholarships, skill training, and learning resources to students from economically weaker sections.\n\nVision: An educated, skilled, and empowered Tamil Nadu where no student is left behind due to financial hardship.",
        "contact_phone": "+91 94440 56789",
        "contact_email": "info@praveen-edu-trust.org",
        "whatsapp_number": "919444056789",
        "address": "Trust Office, 78 Rajaji Bhavan, Besant Nagar, Chennai - 600090",
        "banner_images": TRUST_BANNERS,
        "social_links": {"instagram": "https://instagram.com", "facebook": "https://facebook.com"},
        "services_data": [
            {"name": "Annual Scholarships", "description": "We award 200+ scholarships annually to meritorious students from economically weaker sections for school, college, and professional education.", "image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80"},
            {"name": "Computer Literacy Program", "description": "Free 3-month computer courses covering MS Office, Internet basics, and digital literacy for rural students and homemakers.", "image": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80"},
            {"name": "Skill Development Training", "description": "Vocational courses in tailoring, electricals, plumbing, welding, and healthcare to make students job-ready within 6 months.", "image": "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&q=80"},
            {"name": "Free Coaching Classes", "description": "Free TNPSC, UPSC, NEET, and JEE coaching for government competitive exams conducted by expert faculty.", "image": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80"},
            {"name": "Library & Resource Center", "description": "A fully-equipped library with 5,000+ books, digital study materials, and free internet access for students.", "image": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80"},
            {"name": "Women Empowerment Programs", "description": "Self-help group training, entrepreneurship workshops, and financial literacy programs specifically for women.", "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80"},
        ],
        "gallery_data": [
            {"image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80", "caption": "Annual Scholarship Distribution 2024", "category": "Scholarships"},
            {"image": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80", "caption": "Computer Training Camp – Villupuram", "category": "Training"},
            {"image": "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80", "caption": "Skill Development Workshop", "category": "Workshops"},
            {"image": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80", "caption": "NEET Free Coaching – 2024 Batch", "category": "Coaching"},
        ],
        "team_data": [
            {"name": "Mr. Praveen Annamalai", "role": "Chairman & Founder", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80", "bio": "Social entrepreneur and educationist with 20+ years of community service."},
            {"name": "Dr. Lakshmi Suresh", "role": "Secretary & Academic Director", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80", "bio": "Former principal with 25 years in education. Oversees all academic programs."},
            {"name": "Mr. Rajan Pillai", "role": "Treasurer", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80", "bio": "Certified CA with 15 years experience managing non-profit finances."},
        ],
        "testimonials_data": [
            {"name": "Kavitha M.", "role": "Scholarship Recipient, 2019 → Engineer 2023", "rating": 5, "comment": "The scholarship from Praveen Trust changed my life completely. I am now a software engineer at TCS. I owe my career to this trust."},
            {"name": "Ramesh Kumar", "role": "Skill Training Graduate", "rating": 5, "comment": "The electrical training program gave me a professional certificate and helped me start my own wiring business. Thank you for changing our lives."},
        ],
        "faqs_data": [
            {"question": "Who is eligible for the scholarship?", "answer": "Students from families with annual income below ₹3 lakhs, with minimum 60% academic marks. Priority is given to first-generation learners."},
            {"question": "How can I donate to the Trust?", "answer": "Donations are accepted via bank transfer, UPI, or cheque. All donations are eligible for 80G tax exemption under the Income Tax Act."},
            {"question": "How can I volunteer?", "answer": "You can register as a volunteer through our website. We need teachers, counselors, and administrative volunteers throughout the year."},
        ],
        "events_data": [
            {"title": "Annual Scholarship Day 2024", "date": "2024-09-15", "location": "Kamaraj Hall, Chennai", "status": "Upcoming"},
            {"title": "Computer Literacy Camp – Villupuram", "date": "2024-08-01", "location": "Villupuram District", "status": "Ongoing"},
        ],
    },
    {
        "name": "Praveen Welfare Trust",
        "slug": "praveen-welfare-trust",
        "description": "Serving Humanity Through Medical Camps, Food Distribution & Community Welfare Programs",
        "type": "trust",
        "about_us": "Praveen Welfare Trust is a registered charitable organization dedicated to improving the lives of the underprivileged through direct community action. Since 2012, we have conducted 300+ free medical camps, distributed food to over 1,00,000 beneficiaries, and provided relief support during natural disasters. Our grassroots approach ensures that help reaches those who need it most — in rural villages, urban slums, and disaster-affected areas across Tamil Nadu.",
        "mission_vision": "Mission: To provide immediate and sustained relief to the marginalized through healthcare, food security, and livelihood support programs.\n\nVision: A compassionate society where every person has access to basic healthcare, nutrition, and dignified living conditions.",
        "contact_phone": "+91 94887 67890",
        "contact_email": "welfare@praveen-trust.org",
        "whatsapp_number": "919488767890",
        "address": "Welfare House, 23 Anna Salai, Villupuram - 605602",
        "banner_images": TRUST_BANNERS,
        "social_links": {"instagram": "https://instagram.com", "facebook": "https://facebook.com"},
        "services_data": [
            {"name": "Free Medical Camps", "description": "Monthly free medical camps with doctors, nurses, and free medicines for rural and urban poor communities.", "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80"},
            {"name": "Food Distribution", "description": "Weekly food distribution drives providing cooked meals and grocery kits to homeless and destitute families.", "image": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80"},
            {"name": "Disaster Relief", "description": "Emergency relief operations during floods, cyclones, and other disasters with food, clothing, and shelter kits.", "image": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80"},
            {"name": "Old Age Home Support", "description": "Monthly visits, donations, and medical check-ups for senior citizens at partner old age homes.", "image": "https://images.unsplash.com/photo-1455930950187-1f19f2b27cf0?w=600&q=80"},
            {"name": "Orphanage Partnerships", "description": "Regular support to 15+ partner orphanages with food, clothing, stationery, and birthday celebrations.", "image": "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80"},
            {"name": "Blood Donation Drives", "description": "Quarterly blood donation camps organized in partnership with government hospitals and blood banks.", "image": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80"},
        ],
        "gallery_data": [
            {"image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80", "caption": "Free Medical Camp – Villupuram District", "category": "Medical"},
            {"image": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80", "caption": "Food Distribution – 500 Families Served", "category": "Food"},
            {"image": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80", "caption": "Cyclone Relief – Cuddalore", "category": "Relief"},
            {"image": "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&q=80", "caption": "Orphanage Birthday Celebration", "category": "Children"},
        ],
        "team_data": [
            {"name": "Mr. Praveen Rajendran", "role": "Chairman & Founder", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80", "bio": "Social activist with 15 years of grassroots community service across Tamil Nadu."},
            {"name": "Dr. Sumathi Krishnan", "role": "Medical Director", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80", "bio": "MBBS, MD — Organizes and leads all medical camps and health programs."},
        ],
        "testimonials_data": [
            {"name": "Selvam K.", "role": "Beneficiary, Villupuram", "rating": 5, "comment": "During the floods, the Praveen Welfare Trust was the first to arrive with food and medicines. They are truly angels in disguise."},
        ],
        "faqs_data": [
            {"question": "How can I donate?", "answer": "Donations accepted via UPI, bank transfer, or cheque. 80G tax exemption available for all donations."},
            {"question": "How can I volunteer?", "answer": "Register online or call us. We welcome volunteers for medical camps, food drives, and administrative support."},
        ],
        "events_data": [
            {"title": "Monthly Medical Camp – Villupuram", "date": "2024-08-10", "location": "Villupuram PHC", "status": "Upcoming"},
            {"title": "Blood Donation Drive – Chennai", "date": "2024-09-01", "location": "Government General Hospital", "status": "Upcoming"},
        ],
    },
    {
        "name": "Praveen Transports",
        "slug": "praveen-transports",
        "description": "Reliable Logistics, Freight & Transportation Services — Pan-India Network",
        "type": "logistics",
        "about_us": "Praveen Transports is one of Tamil Nadu's most trusted logistics and transportation companies, operating for over 15 years with a fleet of 120+ vehicles. We provide comprehensive freight solutions including FTL, LTL, parcel services, refrigerated transport, and industrial heavy-haul logistics. Our GPS-tracked fleet covers all major routes across India, ensuring timely delivery with real-time visibility. We serve over 500 corporate clients including manufacturing companies, FMCG brands, e-commerce companies, and government agencies.",
        "mission_vision": "Mission: To provide the most reliable, efficient, and technology-driven logistics solutions that empower businesses to grow without supply chain worries.\n\nVision: To build the most trusted pan-India logistics network, connecting businesses and communities through safe, efficient, and sustainable transportation.",
        "contact_phone": "+91 90000 12345",
        "contact_email": "logistics@praveen-transports.com",
        "whatsapp_number": "919000012345",
        "address": "Transport Hub, NH-45 Bypass Road, Tambaram, Chennai - 600045",
        "banner_images": TRANSPORT_BANNERS,
        "social_links": {"instagram": "https://instagram.com", "facebook": "https://facebook.com"},
        "services_data": [
            {"name": "Full Truck Load (FTL)", "description": "Dedicated full-truck transport for large shipments across India with end-to-end tracking and guaranteed delivery timelines.", "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80"},
            {"name": "Part Truck Load (LTL)", "description": "Cost-effective shared truck services for smaller shipments, consolidated with other cargo for maximum efficiency.", "image": "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&q=80"},
            {"name": "Parcel & Express Delivery", "description": "Same-day and next-day parcel delivery services within Tamil Nadu and 48-hour delivery across South India.", "image": "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&q=80"},
            {"name": "Refrigerated Transport", "description": "Temperature-controlled refrigerated trucks for pharmaceuticals, perishables, dairy, and food products.", "image": "https://images.unsplash.com/photo-1585155784229-aff921ccfa12?w=600&q=80"},
            {"name": "Industrial Heavy Haul", "description": "Specialized heavy equipment transport with multi-axle trailers for machinery, construction equipment, and industrial cargo.", "image": "https://images.unsplash.com/photo-1563461660947-507ef49e9c47?w=600&q=80"},
            {"name": "Warehousing & 3PL", "description": "State-of-the-art warehouse facilities in Chennai, Coimbatore, and Madurai with inventory management and distribution services.", "image": "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80"},
            {"name": "E-Commerce Logistics", "description": "Last-mile delivery solutions for e-commerce companies with COD handling, return management, and POD tracking.", "image": "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=600&q=80"},
            {"name": "Corporate Relocation", "description": "End-to-end office and industrial relocation services including packing, loading, transport, and reinstallation.", "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"},
        ],
        "packages_data": [
            {"name": "Local Delivery", "price": "From ₹2,500", "duration": "Same Day", "badge": None, "features": ["Within Chennai City", "Up to 1 Ton", "GPS Tracked", "POD on Delivery"]},
            {"name": "State Freight", "price": "From ₹8,000", "duration": "2-3 Days", "badge": "Popular", "features": ["All Tamil Nadu Routes", "Up to 5 Tons (LTL)", "GPS Tracked", "POD + Digital Invoice", "Door Pickup"]},
            {"name": "Pan India FTL", "price": "Custom Quote", "duration": "As Per Route", "badge": "Best Value", "features": ["All India Routes", "Dedicated Full Truck", "GPS Real-time Tracking", "24/7 Support", "POD + E-invoice", "Insurance Included"]},
            {"name": "Cold Chain", "price": "Custom Quote", "duration": "As Per Route", "badge": "Specialized", "features": ["Temperature-Controlled Trucks", "Pharma/Food Grade", "Live Temperature Monitoring", "FSSAI Compliance", "Pan India Coverage"]},
        ],
        "gallery_data": [
            {"image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80", "caption": "Our Modern 40ft Container Fleet", "category": "Fleet"},
            {"image": "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80", "caption": "Express Parcel Service Operations", "category": "Parcel"},
            {"image": "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80", "caption": "Automated Warehouse – Chennai Hub", "category": "Warehouse"},
            {"image": "https://images.unsplash.com/photo-1563461660947-507ef49e9c47?w=800&q=80", "caption": "Heavy Equipment Transport – Industrial Project", "category": "Heavy Haul"},
        ],
        "team_data": [
            {"name": "Mr. Praveen Selvakumar", "role": "MD & CEO", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80", "bio": "15+ years in logistics. Built Praveen Transports from 2 trucks to 120+ vehicle fleet."},
            {"name": "Vijay Operations", "role": "Head of Operations", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80", "bio": "Oversees daily dispatch, route planning, and fleet management for 500+ deliveries/day."},
            {"name": "Priya Accounts", "role": "Finance & Accounts Manager", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80", "bio": "CA-qualified. Manages GST billing, client accounts, and financial compliance."},
        ],
        "testimonials_data": [
            {"name": "Ramesh Industries Ltd.", "role": "Manufacturing Client", "rating": 5, "comment": "We've been using Praveen Transports for 5 years for our factory-to-depot runs. Zero delays, professional drivers, and excellent tracking. Highly recommended."},
            {"name": "FreshMart E-Commerce", "role": "E-Commerce Client", "rating": 5, "comment": "Their last-mile delivery network helped us expand from Chennai to all of Tamil Nadu in just 3 months. Reliable and cost-effective."},
        ],
        "faqs_data": [
            {"question": "How do I track my shipment?", "answer": "You will receive an SMS with a tracking link once your shipment is picked up. You can also call our 24/7 tracking helpline or WhatsApp us your LR number."},
            {"question": "Is insurance available?", "answer": "Yes, we offer cargo insurance up to ₹50 lakhs per consignment. Insurance is mandatory for high-value shipments and can be added to any booking."},
            {"question": "Do you offer contract logistics?", "answer": "Yes! We offer annual contract rates for regular shippers with dedicated lanes, priority loading, and monthly billing. Contact our sales team for a custom quote."},
        ],
        "events_data": [],
    },
]

# ─────────────────────────────────────────────────────────────────────────────
def run():
    print("Deleting all old data...")
    Business.objects.all().delete()
    Banner.objects.filter(business__isnull=True).delete()

    # Global Banners
    print("Creating Global Banners...")
    for i, (title, subtitle, cta) in enumerate([
        ("Welcome to Praveen Groups", "Your trusted partner in electronics, fashion, groceries, events & more", "Explore All Businesses"),
        ("Quality Across Every Division", "11 specialized businesses serving Tamil Nadu with pride", "Shop Now"),
        ("Professional Services & Premium Products", "From grand weddings to daily groceries — we've got you covered", "Get Started"),
    ]):
        Banner.objects.create(
            business=None,
            image=BANNER_IMAGES[i % len(BANNER_IMAGES)],
            title=title,
            subtitle=subtitle,
            cta_text=cta,
            cta_link="/",
            priority=10 - i,
            start_date=timezone.now(),
            is_active=True
        )

    # ── PRODUCT BUSINESSES ────────────────────────────────────────────────────
    for order, biz_data in enumerate(PRODUCT_BUSINESSES, start=1):
        print(f"[PRODUCT] Creating: {biz_data['name']}")
        biz = Business.objects.create(
            name=biz_data["name"],
            slug=biz_data["slug"],
            description=biz_data["description"],
            type="product",
            contact_email=f"contact@{biz_data['slug']}.com",
            contact_phone="+91 98765 43210",
            whatsapp_number="919876543210",
            address="Praveen Complex, Main Road, Chennai - 600001",
            order=order,
            is_active=True
        )

        # Business banners
        for bi, img in enumerate(biz_data["banner_images"][:2]):
            Banner.objects.create(
                business=biz,
                image=img,
                title=f"{biz.name} — {'Special Offer' if bi == 0 else 'New Arrivals'}",
                subtitle=biz.description,
                cta_text="Shop Now",
                cta_link=f"/company/{biz.slug}",
                priority=5 - bi,
                start_date=timezone.now(),
                is_active=True
            )

        # Categories + Products
        img_pool = biz_data["product_image_pool"]
        for cat_data in biz_data["categories"]:
            cat = Category.objects.create(
                business=biz,
                name=cat_data["name"],
                slug=f"{biz.slug}-{slugify(cat_data['name'])}",
                image=img_pool[0]
            )
            products_to_create = []
            for p_data in cat_data["products"]:
                products_to_create.append(Product(
                    category=cat,
                    name=p_data["name"],
                    brand=p_data.get("brand", ""),
                    sku=f"SKU-{random.randint(10000,99999)}",

                    description=f"Premium {p_data['name']} available at {biz.name}. Genuine product with manufacturer warranty.",
                    price=p_data["price"],
                    discount_price=p_data.get("dp"),
                    gst_percentage=18.0,
                    stock=random.randint(10, 100),
                    rating=round(random.uniform(3.8, 5.0), 1),
                    reviews_count=random.randint(5, 500),
                    is_featured=random.choice([True, False, False]),
                    is_service=False,
                    warranty_info="1 Year Manufacturer Warranty",
                    return_policy="7 Days Replacement",
                    shipping_info="Free Delivery above ₹999",
                ))
            Product.objects.bulk_create(products_to_create)

            # Images for all products in this category
            created_products = Product.objects.filter(category=cat)
            images = [
                ProductImage(product=p, image=img_pool[i % len(img_pool)], is_primary=True)
                for i, p in enumerate(created_products)
            ]
            ProductImage.objects.bulk_create(images)

    # ── SERVICE / TRUST / LOGISTICS BUSINESSES ──────────────────────────────
    for order, biz_data in enumerate(SERVICE_BUSINESSES, start=len(PRODUCT_BUSINESSES) + 1):
        print(f"[{biz_data['type'].upper()}] Creating: {biz_data['name']}")
        biz = Business.objects.create(
            name=biz_data["name"],
            slug=biz_data["slug"],
            description=biz_data["description"],
            type=biz_data["type"],
            about_us=biz_data.get("about_us", ""),
            mission_vision=biz_data.get("mission_vision", ""),
            contact_email=biz_data.get("contact_email", ""),
            contact_phone=biz_data.get("contact_phone", ""),
            whatsapp_number=biz_data.get("whatsapp_number", ""),
            address=biz_data.get("address", ""),
            services_data=biz_data.get("services_data", []),
            packages_data=biz_data.get("packages_data", []),
            gallery_data=biz_data.get("gallery_data", []),
            team_data=biz_data.get("team_data", []),
            testimonials_data=biz_data.get("testimonials_data", []),
            faqs_data=biz_data.get("faqs_data", []),
            events_data=biz_data.get("events_data", []),
            social_links=biz_data.get("social_links", {}),
            order=order,
            is_active=True
        )

        # Business-specific banners
        for bi, img in enumerate(biz_data.get("banner_images", BANNER_IMAGES)[:3]):
            titles = {
                "service": [biz_data["name"], "Professional Services", "Book Now"],
                "trust":   ["Making a Difference", "Join Our Mission", "Donate & Volunteer"],
                "logistics": ["Reliable Logistics", "Pan-India Network", "Get a Quote"],
            }
            t = titles.get(biz_data["type"], ["Welcome"])[bi % 3]
            Banner.objects.create(
                business=biz,
                image=img,
                title=f"{t} — {biz.name}",
                subtitle=biz.description,
                cta_text="Learn More",
                cta_link=f"/company/{biz.slug}",
                priority=5 - bi,
                start_date=timezone.now(),
                is_active=True
            )
        # ── NO PRODUCTS OR CATEGORIES CREATED FOR SERVICE BUSINESSES ──

    print("\nSuccessfully seeded all data!")
    print(f"  Product Businesses : {len(PRODUCT_BUSINESSES)}")
    print(f"  Service Businesses : {len(SERVICE_BUSINESSES)}")
    print(f"  Total Products     : {Product.objects.filter(is_service=False).count()}")
    print(f"  Service Products   : {Product.objects.filter(is_service=True).count()} (should be 0)")

if __name__ == '__main__':
    run()
