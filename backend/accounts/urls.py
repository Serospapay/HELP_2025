"""
/**
 * @file: urls.py
 * @description: Маршрути REST API для модуля авторизації та профілів.
 * @dependencies: django.urls.path, accounts.views
 * @created: 2025-11-08
 */
"""

from django.urls import path

from .views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    MeView,
    RegisterView,
)

app_name = "accounts"

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", CustomTokenRefreshView.as_view(), name="refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
]



