"""
/**
 * @file: urls.py
 * @description: Роутер для пожертв та вебхуків.
 * @dependencies: rest_framework.routers.DefaultRouter
 * @created: 2025-11-08
 */
"""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import DonationViewSet, MonobankWebhookView

app_name = "payments"

router = DefaultRouter()
router.register(r"donations", DonationViewSet, basename="donations")

urlpatterns = [
    path("webhooks/monobank/", MonobankWebhookView.as_view(), name="monobank-webhook"),
]

urlpatterns += router.urls


