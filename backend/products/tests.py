from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Business, Category, Product, ProductImage
from users.models import User
import json

class ProductViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username="adminuser",
            email="admin@test.com",
            name="Admin User",
            password="password123"
        )
        self.client.force_authenticate(user=self.user)
        
        self.business = Business.objects.create(name="Test Biz", slug="test-biz", type="product")
        self.category = Category.objects.create(name="Test Cat", slug="test-cat", business=self.business)
        
    def test_create_product_with_multiple_images_and_specs(self):
        url = reverse('product-list') # Assuming router registers it as product-list
        
        image1 = SimpleUploadedFile(name='test1.jpg', content=b'', content_type='image/jpeg')
        image2 = SimpleUploadedFile(name='test2.jpg', content=b'', content_type='image/jpeg')
        
        data = {
            'name': 'Test Product Multi Image',
            'slug': 'test-product-multi-image',
            'category': self.category.id,
            'description': 'A nice product',
            'price': 1000.00,
            'stock': 10,
            'sku': 'ITEM-12345',
            'specifications': json.dumps({'Brand': 'Sony', 'Color': 'Black'}),
            'images': [image1, image2] # Send as list of files
        }
        
        response = self.client.post(url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        
        product = Product.objects.get(slug='test-product-multi-image')
        self.assertEqual(product.sku, 'ITEM-12345')
        self.assertEqual(product.specifications, {'Brand': 'Sony', 'Color': 'Black'})
        
        # Check images
        images = product.images.all()
        self.assertEqual(images.count(), 2)
        
        # First image should be primary
        self.assertTrue(images.filter(is_primary=True).exists())
        primary_img = images.get(is_primary=True)
        self.assertIn('test1.jpg', primary_img.image_file.name)
        
        non_primary_img = images.get(is_primary=False)
        self.assertIn('test2.jpg', non_primary_img.image_file.name)
