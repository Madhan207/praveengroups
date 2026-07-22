import os
import re
import urllib.request
import uuid

frontend_src_dir = os.path.abspath('../frontend/src')
frontend_assets_dir = os.path.abspath('../frontend/public/images/assets')
os.makedirs(frontend_assets_dir, exist_ok=True)

url_pattern = re.compile(r"(https://images\.unsplash\.com/[^'\"\s\\]+|https://i\.pravatar\.cc/[^'\"\s\\]+)")

url_cache = {}

for root, _, files in os.walk(frontend_src_dir):
    for file in files:
        if file.endswith('.jsx'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            matches = url_pattern.findall(content)
            if matches:
                for url in set(matches):
                    if url not in url_cache:
                        ext = 'jpg'
                        if '.png' in url.lower(): ext = 'png'
                        filename = f"asset_{uuid.uuid4().hex[:8]}.{ext}"
                        out_path = os.path.join(frontend_assets_dir, filename)
                        print(f"Downloading {url[:80]}...")
                        try:
                            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(req, timeout=10) as response, open(out_path, 'wb') as out_file:
                                out_file.write(response.read())
                            url_cache[url] = f"/images/assets/{filename}"
                        except Exception as e:
                            print(f"Failed to download {url}: {e}")
                            url_cache[url] = url # fallback to original
                            
                    # Replace in content
                    content = content.replace(url, url_cache[url])
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {file}")

print("Frontend JSX migration complete!")
