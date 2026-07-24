import os
import django
import requests
import uuid
from urllib.parse import urlparse

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Business, Category, ProductImage, Banner
from django.conf import settings

MEDIA_DIR = os.path.join(settings.MEDIA_ROOT, 'downloaded')
os.makedirs(MEDIA_DIR, exist_ok=True)

def download_and_save(url):
    if not url or not isinstance(url, str):
        return url
    if not url.startswith('http'):
        return url
    
    print(f"Downloading {url}...")
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            ext = 'jpg'
            if 'png' in url.lower(): ext = 'png'
            filename = f"{uuid.uuid4().hex[:8]}.{ext}"
            filepath = os.path.join(MEDIA_DIR, filename)
            with open(filepath, 'wb') as f:
                f.write(response.content)
            return f"/media/downloaded/{filename}"
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return url

from django.db import close_old_connections
import sys

def process_all():
    print("Starting process_all...")
    sys.stdout.flush()
    # 1. Banners
    banners = list(Banner.objects.all())
    print(f"Found {len(banners)} banners")
    sys.stdout.flush()
    for b in banners:
        b.image = download_and_save(b.image)
        b.save()
        close_old_connections()
        
    # 2. Categories
    categories = list(Category.objects.all())
    print(f"Found {len(categories)} categories")
    sys.stdout.flush()
    for c in categories:
        if c.image:
            c.image = download_and_save(c.image)
            c.save()
            close_old_connections()

    # 3. Product Images
    product_images = list(ProductImage.objects.all())
    print(f"Found {len(product_images)} product images")
    sys.stdout.flush()
    for pi in product_images:
        if pi.image:
            pi.image = download_and_save(pi.image)
            pi.save()
            close_old_connections()

    # 4. Businesses
    businesses = list(Business.objects.all())
    print(f"Found {len(businesses)} businesses")
    sys.stdout.flush()
    for b in businesses:
        if b.logo: b.logo = download_and_save(b.logo)
        
        # Services Data
        if b.services_data:
            for s in b.services_data:
                if s.get('image'): s['image'] = download_and_save(s['image'])
                if s.get('icon'): s['icon'] = download_and_save(s['icon'])
        
        # Gallery Data
        if b.gallery_data:
            for g in b.gallery_data:
                if g.get('image'): g['image'] = download_and_save(g['image'])
                
        # Team Data
        if b.team_data:
            for t in b.team_data:
                if t.get('image'): t['image'] = download_and_save(t['image'])
                
        # Testimonials Data
        if b.testimonials_data:
            for t in b.testimonials_data:
                if t.get('avatar'): t['avatar'] = download_and_save(t['avatar'])
                
        b.save()
        close_old_connections()

if __name__ == '__main__':
    process_all()
    print("Done downloading all external images!")
