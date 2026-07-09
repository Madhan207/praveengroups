import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Business, Category, Product

def update():
    print("Adding missing businesses and updating Service pages...")

    # 1. Update DJ Events
    dj_biz, _ = Business.objects.get_or_create(slug="praveen-dj-events", defaults={
        "name": "Praveen DJ Events", "type": "service"
    })
    dj_biz.description = "Professional Event Services & DJ"
    dj_biz.services_data = [
        {"name": "Wedding DJ", "description": "Premium wedding DJ with full sound & light setup.", "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80"},
        {"name": "Corporate Events", "description": "Professional audio/visual for corporate gatherings.", "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80"},
        {"name": "Private Parties", "description": "High-energy DJ sets for birthdays and private parties.", "image": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80"}
    ]
    dj_biz.packages_data = [
        {"name": "Basic Package", "price": "15000", "duration": "4 Hours", "badge": "", "tier": "Silver", "features": ["1 DJ", "Basic Sound System", "2 LED Lights"]},
        {"name": "Premium Package", "price": "35000", "duration": "6 Hours", "badge": "Popular", "tier": "Gold", "features": ["1 Pro DJ", "Premium JBL Sound", "Laser Lights", "Smoke Machine"]},
        {"name": "Ultimate Package", "price": "75000", "duration": "Full Event", "badge": "Best Value", "tier": "Platinum", "features": ["Celebrity DJ", "Concert Level Sound", "Intelligent Lighting", "LED Wall", "Cold Pyros"]}
    ]
    dj_biz.gallery_data = [
        {"image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80", "caption": "Wedding DJ Setup"},
        {"image": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", "caption": "Live Concert"},
        {"image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80", "caption": "Corporate Gala"},
        {"image": "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=800&q=80", "caption": "Private Party"}
    ]
    dj_biz.save()
    print("- Updated DJ Events")

    # 2. Update Studios Entertainment
    studio_biz, _ = Business.objects.get_or_create(slug="studios-entertainment", defaults={
        "name": "Studios Entertainment", "type": "service"
    })
    studio_biz.description = "Photography & Videography"
    studio_biz.services_data = [
        {"name": "Wedding Photography", "description": "Candid & traditional wedding photography.", "image": "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80"},
        {"name": "Pre-Wedding Shoots", "description": "Cinematic pre-wedding video and photo shoots.", "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80"},
        {"name": "Corporate Ad Films", "description": "High-quality promotional videos and ad films.", "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80"}
    ]
    studio_biz.packages_data = [
        {"name": "Photo Only", "price": "25000", "duration": "Per Day", "tier": "Basic", "features": ["1 Traditional Photographer", "1 Candid Photographer", "Soft Copies"]},
        {"name": "Photo & Video", "price": "65000", "duration": "Per Day", "badge": "Popular", "tier": "Premium", "features": ["2 Photographers", "2 Cinematographers", "Drone Shoot", "Premium Album", "Highlight Video"]},
    ]
    studio_biz.gallery_data = [
        {"image": "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80", "caption": "Wedding Shoot"},
        {"image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", "caption": "Pre-Wedding"},
        {"image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80", "caption": "Corporate Video"}
    ]
    studio_biz.save()
    print("- Updated Studios Entertainment")

    # 3. Create Praveen Transports
    trans_biz, _ = Business.objects.get_or_create(slug="praveen-transports", defaults={
        "name": "Praveen Transports", "type": "logistics", "order": 9
    })
    trans_biz.description = "Reliable Logistics & Transport Solutions"
    trans_biz.about_us = "Praveen Transports has been the backbone of industrial and retail logistics in the region. We provide end-to-end freight solutions."
    trans_biz.services_data = [
        {"name": "Full Truckload (FTL)", "description": "Dedicated trucks for large scale industrial goods.", "image": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80"},
        {"name": "Part Truckload (PTL)", "description": "Cost-effective shared transport for smaller loads.", "image": "https://images.unsplash.com/photo-1586528116311-ad8ed7c508b0?w=600&q=80"},
        {"name": "Cold Chain Logistics", "description": "Refrigerated transport for perishables and pharma.", "image": "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&q=80"}
    ]
    trans_biz.save()
    print("- Created Praveen Transports")

    # 4. Create Praveen Trust
    trust_biz, _ = Business.objects.get_or_create(slug="praveen-trust", defaults={
        "name": "Praveen Trust", "type": "trust", "order": 10
    })
    trust_biz.description = "Empowering Communities, Changing Lives"
    trust_biz.about_us = "Praveen Trust is our CSR initiative dedicated to uplifting underprivileged communities through education, healthcare, and sustainable livelihood programs."
    trust_biz.services_data = [
        {"name": "Free Education Program", "description": "Providing quality education to 5,000+ students.", "image": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80"},
        {"name": "Medical Camps", "description": "Free healthcare checkups in rural areas.", "image": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80"},
        {"name": "Women Empowerment", "description": "Skill development and micro-financing for women.", "image": "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&q=80"}
    ]
    trust_biz.gallery_data = [
        {"image": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80", "caption": "Community Center"},
        {"image": "https://images.unsplash.com/photo-1593113565694-c6d05400eb05?w=800&q=80", "caption": "Food Drive"},
        {"image": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80", "caption": "School Initiative"}
    ]
    trust_biz.save()
    print("- Created Praveen Trust")

    print("Success! Pages are updated.")

if __name__ == '__main__':
    update()
