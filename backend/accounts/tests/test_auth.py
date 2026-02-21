"""
/**
 * @file: test_auth.py
 * @description: Інтеграційні тести для REST API авторизації та реєстрації.
 * @dependencies: rest_framework.test.APITestCase
 * @created: 2025-11-08
 */
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User, UserRole


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("accounts:register")
        self.login_url = reverse("accounts:login")
        self.me_url = reverse("accounts:me")

    def test_register_volunteer_creates_user_and_returns_tokens(self):
        payload = {
            "email": "volunteer@example.com",
            "password": "Str0ngPass!123",
            "confirm_password": "Str0ngPass!123",
            "first_name": "Iryna",
            "last_name": "Shevchenko",
            "role": UserRole.VOLUNTEER,
            "phone_number": "+380931112233",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", response.data)
        self.assertIn("access", response.data["tokens"])
        self.assertEqual(response.data["user"]["email"], payload["email"])
        self.assertEqual(response.data["user"]["role"], UserRole.VOLUNTEER)

        self.assertTrue(User.objects.filter(email=payload["email"]).exists())

    def test_login_returns_jwt_tokens(self):
        user = User.objects.create_user(
            email="coordinator@example.com",
            password="CoordinatorPass!123",
            role=UserRole.COORDINATOR,
        )

        response = self.client.post(
            self.login_url,
            {"email": user.email, "password": "CoordinatorPass!123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["user"]["email"], user.email)
        self.assertEqual(response.data["user"]["role"], UserRole.COORDINATOR)

    def test_me_endpoint_returns_authenticated_user(self):
        user = User.objects.create_user(
            email="beneficiary@example.com",
            password="BeneficiaryPass!123",
            role=UserRole.BENEFICIARY,
        )
        login_response = self.client.post(
            self.login_url,
            {"email": user.email, "password": "BeneficiaryPass!123"},
            format="json",
        )
        access_token = login_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], user.email)
        self.assertEqual(response.data["role"], UserRole.BENEFICIARY)

    def test_register_admin_forbidden(self):
        payload = {
            "email": "hacker@example.com",
            "password": "Str0ngPass!123",
            "confirm_password": "Str0ngPass!123",
            "role": UserRole.ADMIN,
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("role", response.data)
        self.assertFalse(User.objects.filter(email=payload["email"]).exists())



