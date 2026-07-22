import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product, Review
from django.db.models import Avg, Count

def run():
    print("Recalculating ratings for all products based on actual reviews...")
    products = Product.objects.all()
    for product in products:
        # We also added update_product_rating in models.py which we can just call!
        reviews = product.reviews.all()
        count = reviews.count()
        if count > 0:
            total = sum(r.rating for r in reviews)
            product.rating = round(total / count, 1)
        else:
            product.rating = 0.0
        product.reviews_count = count
        product.save(update_fields=['rating', 'reviews_count'])
        
    print(f"Updated {products.count()} products.")

    # Remove any reviews without a user or product if any (sanity check)
    invalid_reviews = Review.objects.filter(user__isnull=True) | Review.objects.filter(product__isnull=True)
    if invalid_reviews.exists():
        print(f"Deleting {invalid_reviews.count()} invalid reviews...")
        invalid_reviews.delete()

if __name__ == '__main__':
    run()
