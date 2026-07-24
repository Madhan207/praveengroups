import os
import glob

search_text = "(import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');"
replace_text = "(import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');"

count = 0
for filepath in glob.glob('frontend/src/**/*.jsx', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if search_text in content:
        content = content.replace(search_text, replace_text)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
print(f'Replaced in {count} files.')
