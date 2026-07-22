# pyrefly: ignore [missing-import]
from django.urls import path, include
# pyrefly: ignore [missing-import]
from rest_framework.routers import DefaultRouter
# pyrefly: ignore [missing-import]
from .views import (
    CouponViewSet, NotificationViewSet, 
    GSTSettingViewSet, PaymentSettingViewSet, DonationViewSet,
    ContactMessageViewSet
)

router = DefaultRouter()
router.register(r'coupons', CouponViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'gst-settings', GSTSettingViewSet)
router.register(r'payment-settings', PaymentSettingViewSet)
router.register(r'donations', DonationViewSet)
router.register(r'contact-messages', ContactMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
