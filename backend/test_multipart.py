import urllib.request
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

admin_user = get_user_model().objects.filter(is_superuser=True).first()
access_token = str(RefreshToken.for_user(admin_user).access_token)

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="title"\r\n\r\n' +
    'New Banner\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="subtitle"\r\n\r\n' +
    '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="business"\r\n\r\n' +
    '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="position"\r\n\r\n' +
    'HERO\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="priority"\r\n\r\n' +
    '0\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="is_active"\r\n\r\n' +
    'true\r\n' +
    '--' + boundary + '--\r\n'
)

req = urllib.request.Request(
    f'http://127.0.0.1:8000/api/banners/',
    data=body.encode('utf-8'),
    headers={
        'Authorization': f'Bearer {access_token}',
        'Content-Type': f'multipart/form-data; boundary={boundary}'
    },
    method='POST'
)

try:
    with urllib.request.urlopen(req) as response:
        print('SUCCESS POST', response.status, response.read().decode())
except Exception as e:
    print('ERROR POST', getattr(e, 'code', 'Unknown Error Code'))
    print(e.read().decode())
