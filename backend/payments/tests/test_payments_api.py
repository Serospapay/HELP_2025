"""
/**
 * @file: test_payments_api.py
 * @description: Тести сценаріїв створення пожертви та обробки вебхуків Monobank.
 * @dependencies: rest_framework.test.APITestCase
 * @created: 2025-11-08
 */
"""

import base64
import hashlib
import hmac

from django.conf import settings
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User, UserRole
from campaigns.models import Campaign, CampaignCategory, CampaignStatus
from payments.models import Donation, DonationProvider, DonationStatus


class DonationApiTests(APITestCase):
    def setUp(self):
        self.category = CampaignCategory.objects.create(name="Тестові кампанії")
        self.coordinator = User.objects.create_user(
            email="coordinator@help.ua",
            password="StrongPass123!",
            role=UserRole.COORDINATOR,
        )
        self.volunteer = User.objects.create_user(
            email="donor@help.ua",
            password="StrongPass123!",
            role=UserRole.VOLUNTEER,
        )
        self.campaign = Campaign.objects.create(
            title="Збір на карети швидкої",
            short_description="Терміновий збір на швидку допомогу.",
            description="Повний опис кампанії.",
            status=CampaignStatus.PUBLISHED,
            category=self.category,
            coordinator=self.coordinator,
            location_name="Київ",
            region="Київська область",
            published_at="2025-01-01T00:00:00Z",
        )

    def test_authenticated_user_can_create_donation(self):
        url = reverse("payments:donations-list")
        payload = {
            "campaign": self.campaign.id,
            "provider": DonationProvider.MONOBANK,
            "amount": "1500.00",
            "currency": "UAH",
            "note": "Для перемоги!",
        }
        self.client.force_authenticate(self.volunteer)
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        donation = Donation.objects.get(reference=response.data["reference"])
        self.assertEqual(donation.donor, self.volunteer)
        self.assertEqual(donation.amount, Donation.objects.first().amount)
        self.assertEqual(donation.status, DonationStatus.PENDING)

    @override_settings(MONOBANK_WEBHOOK_SECRET="secret123")
    def test_monobank_webhook_confirms_donation(self):
        donation = Donation.objects.create(
            campaign=self.campaign,
            donor=self.volunteer,
            amount="1000.00",
            currency="UAH",
            provider=DonationProvider.MONOBANK,
            reference="invoice-12345",
        )

        url = reverse("payments:monobank-webhook")
        payload = {
            "provider": DonationProvider.MONOBANK,
            "payload": {
                "data": {
                    "invoiceId": donation.reference,
                    "status": "success",
                    "amount": 100000,
                    "ccy": "UAH",
                    "customerEmail": "donor@help.ua",
                    "customerName": "Donor Name",
                }
            },
        }
        from rest_framework.renderers import JSONRenderer

        raw_body = JSONRenderer().render(payload)
        signature = base64.b64encode(hmac.new(b"secret123", raw_body, hashlib.sha256).digest()).decode("utf-8")

        response = self.client.post(
            url,
            payload,
            format="json",
            HTTP_X_SIGNATURE=signature,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        donation.refresh_from_db()
        self.campaign.refresh_from_db()
        self.assertEqual(donation.status, DonationStatus.SUCCEEDED)
        self.assertEqual(self.campaign.current_amount, donation.amount)

