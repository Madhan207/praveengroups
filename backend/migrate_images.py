import os
import urllib.request
import django
import uuid
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.apps import apps
from django.db.models import CharField, TextField, JSONField
import time

frontend_public_dir = os.path.abspath('../frontend/public/images/migrated')
os.makedirs(frontend_public_dir, exist_ok=True)

url_cache = {}

def download_image(url):
    if not url or not isinstance(url, str): return url
    if not url.startswith('http'): return url
    if 'localhost' in url or '127.0.0.1' in url: return url
    if 'instagram.com' in url or 'facebook.com' in url or 'youtube.com' in url: return url
    
    if url in url_cache:
        return url_cache[url]
    
    # Generate unique filename
    ext = 'jpg'
    if '.png' in url.lower(): ext = 'png'
    elif '.gif' in url.lower(): ext = 'gif'
    elif '.svg' in url.lower(): ext = 'svg'
    
    filename = f"img_{uuid.uuid4().hex[:10]}.{ext}"
    file_path = os.path.join(frontend_public_dir, filename)
    
    try:
        # Use a user agent to prevent 403s
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response, open(file_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded {url[:50]}... -> {filename}")
        
        local_url = f"/images/migrated/{filename}"
        url_cache[url] = local_url
        time.sleep(0.1) # Be nice
        return local_url
    except Exception as e:
        print(f"Failed to download {url[:50]}... : {e}")
        url_cache[url] = url # fallback
        return url

def migrate_json_data(data):
    if isinstance(data, dict):
        new_data = {}
        for k, v in data.items():
            if isinstance(v, str) and v.startswith('http'):
                new_data[k] = download_image(v)
            else:
                new_data[k] = migrate_json_data(v)
        return new_data
    elif isinstance(data, list):
        return [migrate_json_data(item) for item in data]
    else:
        return data

print('--- Starting Image Migration ---')

models_to_check = [
    'Business', 'Category', 'Product', 'ProductImage', 
    'Banner', 'GalleryImage', 'Testimonial', 'ServicePackage'
]

for model_name in models_to_check:
    try:
        model = apps.get_model('products', model_name)
    except LookupError:
        try:
            model = apps.get_model('core', model_name)
        except LookupError:
            try:
                model = apps.get_model('users', model_name)
            except:
                continue
                
    print(f"\\nProcessing {model.__name__}...")
    
    fields = model._meta.fields
    url_fields = [f.name for f in fields if isinstance(f, (CharField, TextField)) and 'image' in f.name.lower() or 'logo' in f.name.lower() or 'avatar' in f.name.lower()]
    json_fields = [f.name for f in fields if isinstance(f, JSONField)]
    
    for obj in model.objects.all():
        updated = False
        
        for f_name in [f.name for f in fields if isinstance(f, (CharField, TextField))]:
            val = getattr(obj, f_name)
            if val and isinstance(val, str) and val.startswith('http'):
                if any(x in val.lower() for x in ['unsplash.com', 'pravatar.cc', 'loremflickr.com', '.jpg', '.png', 'image']):
                    new_val = download_image(val)
                    if new_val != val:
                        setattr(obj, f_name, new_val)
                        updated = True
        
        for f_name in json_fields:
            val = getattr(obj, f_name)
            if val:
                new_val = migrate_json_data(val)
                if new_val != val:
                    setattr(obj, f_name, new_val)
                    updated = True
                    
        if updated:
            obj.save()
            
print('--- Migration Complete ---')
