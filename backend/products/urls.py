from rest_framework.routers import DefaultRouter
from .views import BusinessViewSet, CategoryViewSet, ProductViewSet, ReviewViewSet, BannerViewSet, GlobalSearchView, seed_database_view
from django.urls import path, include

router = DefaultRouter()
router.register(r'businesses', BusinessViewSet, basename='business')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'banners', BannerViewSet, basename='banner')

urlpatterns = [
    path('global-search/', GlobalSearchView.as_view(), name='global-search'),
    path('seed-db/', seed_database_view, name='seed-db'),
    path('', include(router.urls)),
]

