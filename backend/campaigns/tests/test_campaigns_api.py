"""
/**
 * @file: test_campaigns_api.py
 * @description: Інтеграційні тести для API кампаній та заявок.
 * @dependencies: rest_framework.test.APITestCase
 * @created: 2025-11-08
 */
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User, UserRole
from campaigns.models import (
    ApplicationStatus,
    Campaign,
    CampaignCategory,
    VolunteerApplication,
    ShiftAssignment,
    CampaignStatus as CampaignStatusEnum,
)


class CampaignsApiTests(APITestCase):
    def setUp(self):
        self.category = CampaignCategory.objects.create(name="Логістика")
        self.coordinator = User.objects.create_user(
            email="coord@example.com",
            password="StrongPass!123",
            role=UserRole.COORDINATOR,
            first_name="Olena",
        )
        self.volunteer = User.objects.create_user(
            email="vol@example.com",
            password="StrongPass!123",
            role=UserRole.VOLUNTEER,
            first_name="Andrii",
        )

    def test_coordinator_can_create_campaign(self):
        url = reverse("campaigns:campaigns-list")
        payload = {
            "title": "Збір на дрони",
            "short_description": "Потрібно закупити два дрони для підрозділу.",
            "description": "Повний опис кампанії.",
            "status": CampaignStatusEnum.DRAFT,
            "category": self.category.id,
            "location_name": "Київ",
            "region": "Київська область",
        }
        self.client.force_authenticate(self.coordinator)
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Campaign.objects.filter(title=payload["title"]).exists())

    def test_anonymous_can_list_published_campaigns(self):
        Campaign.objects.create(
            title="Гуманітарна допомога",
            short_description="Збір продуктів для ВПО.",
            description="Повний опис.",
            status=CampaignStatusEnum.PUBLISHED,
            category=self.category,
            coordinator=self.coordinator,
            location_name="Львів",
            region="Львівська область",
            published_at="2025-01-01T10:00:00Z",
        )
        url = reverse("campaigns:campaigns-list")
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_volunteer_can_apply_to_campaign(self):
        campaign = Campaign.objects.create(
            title="Медична евакуація",
            short_description="Потрібні водії для евакуації поранених.",
            description="Повний опис.",
            status=CampaignStatusEnum.PUBLISHED,
            category=self.category,
            coordinator=self.coordinator,
            location_name="Харків",
            region="Харківська область",
            published_at="2025-01-02T12:00:00Z",
        )
        url = reverse("campaigns:campaigns-apply", kwargs={"slug": campaign.slug})
        self.client.force_authenticate(self.volunteer)
        response = self.client.post(url, {"motivation": "Хочу допомогти."}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            VolunteerApplication.objects.filter(campaign=campaign, volunteer=self.volunteer).count(),
            1,
        )
        duplicate_response = self.client.post(url, {"motivation": "Ще раз."}, format="json")
        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_coordinator_can_create_shift(self):
        campaign = Campaign.objects.create(
            title="Розвантаження гуманітарної допомоги",
            short_description="Потрібні волонтери на складі.",
            description="Повний опис.",
            status=CampaignStatusEnum.PUBLISHED,
            category=self.category,
            coordinator=self.coordinator,
            location_name="Одеса",
            region="Одеська область",
            published_at="2025-01-03T08:00:00Z",
        )
        url = reverse("campaigns:campaign-shifts-list")
        payload = {
            "campaign_id": campaign.id,
            "title": "Зміна №1",
            "description": "Пакування коробок.",
            "start_at": "2025-02-01T09:00:00Z",
            "end_at": "2025-02-01T13:00:00Z",
            "capacity": 10,
        }
        self.client.force_authenticate(self.coordinator)
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(campaign.shifts.count(), 1)

    def test_coordinator_can_update_application_status(self):
        campaign = Campaign.objects.create(
            title="Будівництво укриття",
            short_description="Збір команди будівельників.",
            description="Повний опис.",
            status=CampaignStatusEnum.PUBLISHED,
            category=self.category,
            coordinator=self.coordinator,
            location_name="Дніпро",
            region="Дніпропетровська область",
            published_at="2025-01-04T09:00:00Z",
        )
        application = VolunteerApplication.objects.create(
            campaign=campaign,
            volunteer=self.volunteer,
            status=ApplicationStatus.PENDING,
        )
        url = reverse("campaigns:volunteer-applications-detail", args=[application.id])
        self.client.force_authenticate(self.coordinator)
        response = self.client.patch(url, {"status": ApplicationStatus.APPROVED}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        application.refresh_from_db()
        self.assertEqual(application.status, ApplicationStatus.APPROVED)

    def test_volunteer_can_withdraw_own_application(self):
        campaign = Campaign.objects.create(
            title="Польова кухня",
            short_description="Потрібні кухарі на виїзді.",
            description="Повний опис.",
            status=CampaignStatusEnum.PUBLISHED,
            category=self.category,
            coordinator=self.coordinator,
            location_name="Полтава",
            region="Полтавська область",
            published_at="2025-01-05T09:00:00Z",
        )
        application = VolunteerApplication.objects.create(
            campaign=campaign,
            volunteer=self.volunteer,
            status=ApplicationStatus.PENDING,
        )
        url = reverse("campaigns:volunteer-applications-detail", args=[application.id])
        self.client.force_authenticate(self.volunteer)
        response = self.client.patch(url, {"status": ApplicationStatus.WITHDRAWN}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        application.refresh_from_db()
        self.assertEqual(application.status, ApplicationStatus.WITHDRAWN)

    def test_volunteer_can_join_and_leave_shift(self):
        campaign = Campaign.objects.create(
            title="Польова кухня",
            short_description="Потрібні кухарі на виїзді.",
            description="Повний опис.",
            status=CampaignStatusEnum.PUBLISHED,
            category=self.category,
            coordinator=self.coordinator,
            location_name="Полтава",
            region="Полтавська область",
            published_at="2025-01-05T09:00:00Z",
        )
        VolunteerApplication.objects.create(
            campaign=campaign,
            volunteer=self.volunteer,
            status=ApplicationStatus.APPROVED,
        )
        shift = campaign.shifts.create(
            title="Ранкова зміна",
            start_at="2025-01-06T07:00:00Z",
            end_at="2025-01-06T11:00:00Z",
            capacity=1,
        )
        join_url = reverse("campaigns:campaign-shifts-join", args=[shift.id])
        leave_url = reverse("campaigns:campaign-shifts-leave", args=[shift.id])

        self.client.force_authenticate(self.volunteer)
        response = self.client.post(join_url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ShiftAssignment.objects.filter(shift=shift).count(), 1)

        # repeated join returns 200 and does not duplicate assignment
        response_repeat = self.client.post(join_url, {}, format="json")
        self.assertEqual(response_repeat.status_code, status.HTTP_200_OK)
        self.assertEqual(ShiftAssignment.objects.filter(shift=shift).count(), 1)

        response_leave = self.client.delete(leave_url, format="json")
        self.assertEqual(response_leave.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ShiftAssignment.objects.filter(shift=shift).count(), 0)

    def test_my_shift_assignments_returns_upcoming_entries(self):
        campaign = Campaign.objects.create(
            title="Сортування допомоги",
            short_description="Потрібні руки на складі.",
            description="Повний опис.",
            status=CampaignStatusEnum.PUBLISHED,
            category=self.category,
            coordinator=self.coordinator,
            location_name="Київ",
            region="Київська область",
            published_at="2025-01-07T09:00:00Z",
        )
        VolunteerApplication.objects.create(
            campaign=campaign,
            volunteer=self.volunteer,
            status=ApplicationStatus.APPROVED,
        )
        future_shift = campaign.shifts.create(
            title="Вечірня зміна",
            start_at="2099-01-10T18:00:00Z",
            end_at="2099-01-10T22:00:00Z",
            capacity=5,
        )
        past_shift = campaign.shifts.create(
            title="Минуле чергування",
            start_at="2024-01-10T10:00:00Z",
            end_at="2024-01-10T14:00:00Z",
            capacity=5,
        )
        ShiftAssignment.objects.create(
            shift=future_shift,
            volunteer=self.volunteer,
            status=ApplicationStatus.APPROVED,
        )
        ShiftAssignment.objects.create(
            shift=past_shift,
            volunteer=self.volunteer,
            status=ApplicationStatus.APPROVED,
        )
        other_volunteer = User.objects.create_user(
            email="other@example.com",
            password="StrongPass!123",
            role=UserRole.VOLUNTEER,
        )
        ShiftAssignment.objects.create(
            shift=future_shift,
            volunteer=other_volunteer,
            status=ApplicationStatus.APPROVED,
        )

        url = reverse("campaigns:my-shift-assignments-list")
        self.client.force_authenticate(self.volunteer)
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["shift"]["id"], future_shift.id)
        self.assertEqual(response.data[0]["campaign"]["slug"], campaign.slug)

    def test_my_shift_assignments_requires_authentication(self):
        url = reverse("campaigns:my-shift-assignments-list")
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


