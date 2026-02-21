"""
/**
 * @file: seed_demo_data.py
 * @description: Django management-команда для генерації промо-даних.
 * @dependencies: accounts.models.User, campaigns.models
 * @created: 2025-11-09
 */
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User, UserRole
from campaigns.models import (
    ApplicationStatus,
    Campaign,
    CampaignCategory,
    CampaignShift,
    CampaignStage,
    CampaignStatus,
    ShiftAssignment,
    VolunteerApplication,
)


@dataclass
class DemoUserSpec:
    email: str
    password: str
    role: str
    first_name: str
    last_name: str
    phone_number: str | None = None


@dataclass
class DemoCampaignSpec:
    title: str
    short_description: str
    description: str
    status: str
    category: str
    region: str
    location_name: str
    target_amount: int | None
    required_volunteers: int
    stages: list[dict]
    shifts: list[dict]


class Command(BaseCommand):
    help = "Наповнює базу промо-даними для UX-демонстрацій"

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("▶ Старт наповнення демо-даними"))
        with transaction.atomic():
            users = self._ensure_users()
            categories = self._ensure_categories()
            campaigns = self._ensure_campaigns(users["coordinator"], categories)
            self._ensure_volunteer_flows(users, campaigns)
        self.stdout.write(self.style.SUCCESS("✅ Демо-дані готові"))

    def _ensure_users(self) -> dict[str, User]:
        self.stdout.write("Створюю демо-користувачів…")
        specs: list[DemoUserSpec] = [
            DemoUserSpec(
                email="admin@help.test",
                password="Admin123!",
                role=UserRole.ADMIN,
                first_name="Ігор",
                last_name="Гончар",
            ),
            DemoUserSpec(
                email="coordinator@help.test",
                password="Coordinator123!",
                role=UserRole.COORDINATOR,
                first_name="Олена",
                last_name="Коваль",
                phone_number="+380501112233",
            ),
            DemoUserSpec(
                email="volunteer1@help.test",
                password="Volunteer123!",
                role=UserRole.VOLUNTEER,
                first_name="Андрій",
                last_name="Левченко",
                phone_number="+380631112233",
            ),
            DemoUserSpec(
                email="volunteer2@help.test",
                password="Volunteer123!",
                role=UserRole.VOLUNTEER,
                first_name="Марія",
                last_name="Дмитрук",
                phone_number="+380671112233",
            ),
            DemoUserSpec(
                email="beneficiary@help.test",
                password="Beneficiary123!",
                role=UserRole.BENEFICIARY,
                first_name="Світлана",
                last_name="Чумак",
            ),
        ]

        users: dict[str, User] = {}
        for spec in specs:
            user, created = User.objects.get_or_create(
                email=spec.email,
                defaults={
                    "role": spec.role,
                    "first_name": spec.first_name,
                    "last_name": spec.last_name,
                    "phone_number": spec.phone_number or "",
                },
            )
            if created:
                user.set_password(spec.password)
                user.is_active = True
                if spec.role == UserRole.ADMIN:
                    user.is_staff = True
                    user.is_superuser = True
                user.save(update_fields=["password", "is_active", "is_staff", "is_superuser"])
                self.stdout.write(f"  • створено {spec.role}: {spec.email}")
            else:
                self.stdout.write(f"  • існує {spec.role}: {spec.email}")

            if spec.role == UserRole.ADMIN:
                users["admin"] = user
            elif spec.role == UserRole.COORDINATOR:
                users["coordinator"] = user
            elif spec.role == UserRole.VOLUNTEER and "volunteer1" not in users:
                users["volunteer1"] = user
            elif spec.role == UserRole.VOLUNTEER:
                users["volunteer2"] = user
            elif spec.role == UserRole.BENEFICIARY:
                users["beneficiary"] = user
        return users

    def _ensure_categories(self) -> dict[str, CampaignCategory]:
        self.stdout.write("Створюю категорії…")
        category_specs = {
            "Логістика": "Доставка гуманітарних вантажів та облаштування складів.",
            "Медицина": "Підтримка медичних закладів та евакуаційні місії.",
            "Громадська безпека": "Зміцнення захисту громад та укриттів.",
        }
        categories: dict[str, CampaignCategory] = {}
        for name, description in category_specs.items():
            category, _ = CampaignCategory.objects.get_or_create(
                name=name, defaults={"description": description}
            )
            categories[name] = category
            self.stdout.write(f"  • категорія: {name}")
        return categories

    def _ensure_campaigns(
        self, coordinator: User, categories: dict[str, CampaignCategory]
    ) -> list[Campaign]:
        self.stdout.write("Створюю кампанії, етапи та зміни…")
        now = timezone.now()
        campaign_specs: list[DemoCampaignSpec] = [
            DemoCampaignSpec(
                title="Сортування гуманітарної допомоги",
                short_description="Потрібні волонтери для сортування та пакування.",
                description="Забезпечуємо адресну доставку допомоги до громад у прифронтових містах.",
                status=CampaignStatus.PUBLISHED,
                category="Логістика",
                region="Київська область",
                location_name="Склад #12, Київ",
                target_amount=150000,
                required_volunteers=25,
                stages=[
                    {
                        "title": "Збір продуктів",
                        "description": "Приймаємо допомогу від партнерів.",
                        "order": 1,
                        "is_completed": True,
                    },
                    {
                        "title": "Сортування та пакування",
                        "description": "Формуємо адресні набори.",
                        "order": 2,
                    },
                ],
                shifts=[
                    {
                        "title": "Ранкова зміна",
                        "start_offset": timedelta(days=1, hours=9),
                        "end_offset": timedelta(days=1, hours=13),
                        "capacity": 8,
                    },
                    {
                        "title": "Вечірня зміна",
                        "start_offset": timedelta(days=2, hours=14),
                        "end_offset": timedelta(days=2, hours=18),
                        "capacity": 8,
                    },
                ],
            ),
            DemoCampaignSpec(
                title="Мобільні медичні бригади",
                short_description="Укомплектовуємо автівки для мобільних бригад.",
                description="Підтримуємо евакуацію та стабілізацію поранених у зоні бойових дій.",
                status=CampaignStatus.IN_PROGRESS,
                category="Медицина",
                region="Харківська область",
                location_name="Харків, медична база",
                target_amount=350000,
                required_volunteers=12,
                stages=[
                    {
                        "title": "Закупівля медикаментів",
                        "description": "Контракти з постачальниками.",
                        "order": 1,
                        "is_completed": True,
                    },
                    {
                        "title": "Комплектація аптечок",
                        "description": "Формуємо індивідуальні набори.",
                        "order": 2,
                    },
                    {
                        "title": "Виїзди",
                        "description": "Виїзди у прифронтові населені пункти.",
                        "order": 3,
                    },
                ],
                shifts=[
                    {
                        "title": "Черга у стабпункті",
                        "start_offset": timedelta(days=3, hours=8),
                        "end_offset": timedelta(days=3, hours=14),
                        "capacity": 4,
                    }
                ],
            ),
            DemoCampaignSpec(
                title="Укриття для ліцею №5",
                short_description="Оновлюємо укриття для 600 дітей.",
                description="Проводимо ремонт та оснащення укриття у ліцеї.",
                status=CampaignStatus.PUBLISHED,
                category="Громадська безпека",
                region="Одеська область",
                location_name="Ліцей №5, Одеса",
                target_amount=280000,
                required_volunteers=18,
                stages=[
                    {
                        "title": "Очищення приміщення",
                        "description": "Прибираємо та готуємо приміщення.",
                        "order": 1,
                        "is_completed": True,
                    },
                    {
                        "title": "Ремонтні роботи",
                        "description": "Підсилення стін, вентиляція, освітлення.",
                        "order": 2,
                    },
                    {
                        "title": "Облаштування",
                        "description": "Монтаж меблів та запасів.",
                        "order": 3,
                    },
                ],
                shifts=[
                    {
                        "title": "Будівельна зміна",
                        "start_offset": timedelta(days=4, hours=9),
                        "end_offset": timedelta(days=4, hours=16),
                        "capacity": 6,
                    },
                    {
                        "title": "Фінальна перевірка",
                        "start_offset": timedelta(days=10, hours=10),
                        "end_offset": timedelta(days=10, hours=13),
                        "capacity": 6,
                    },
                ],
            ),
        ]

        campaigns: list[Campaign] = []
        for spec in campaign_specs:
            category = categories[spec.category]
            campaign, created = Campaign.objects.get_or_create(
                title=spec.title,
                defaults={
                    "short_description": spec.short_description,
                    "description": spec.description,
                    "status": spec.status,
                    "category": category,
                    "coordinator": coordinator,
                    "region": spec.region,
                    "location_name": spec.location_name,
                    "target_amount": spec.target_amount,
                    "required_volunteers": spec.required_volunteers,
                    "published_at": timezone.now() if spec.status != CampaignStatus.DRAFT else None,
                },
            )
            if created:
                self.stdout.write(f"  • кампанія: {campaign.title}")
            campaigns.append(campaign)

            for stage_index, stage_spec in enumerate(spec.stages, start=1):
                CampaignStage.objects.get_or_create(
                    campaign=campaign,
                    title=stage_spec["title"],
                    defaults={
                        "description": stage_spec.get("description", ""),
                        "order": stage_spec.get("order", stage_index),
                        "is_completed": stage_spec.get("is_completed", False),
                        "due_date": (timezone.now() + timedelta(days=stage_index * 3)).date(),
                    },
                )

            for shift_spec in spec.shifts:
                start_at = self._normalize_datetime(now + shift_spec["start_offset"])
                end_at = self._normalize_datetime(now + shift_spec["end_offset"])
                CampaignShift.objects.get_or_create(
                    campaign=campaign,
                    title=shift_spec["title"],
                    defaults={
                        "description": "",  # можна деталізувати за потреби
                        "start_at": start_at,
                        "end_at": end_at,
                        "capacity": shift_spec["capacity"],
                        "location_details": campaign.location_name,
                    },
                )

        return campaigns

    def _ensure_volunteer_flows(
        self, users: dict[str, User], campaigns: list[Campaign]
    ) -> None:
        self.stdout.write("Наповнюю заявки, підтвердження та призначення…")
        volunteer1 = users["volunteer1"]
        volunteer2 = users["volunteer2"]
        for campaign in campaigns:
            VolunteerApplication.objects.get_or_create(
                campaign=campaign,
                volunteer=volunteer1,
                defaults={
                    "status": ApplicationStatus.APPROVED,
                    "motivation": "Готовий долучитися негайно.",
                    "experience": "Досвід волонтерства 2 роки.",
                },
            )
            VolunteerApplication.objects.get_or_create(
                campaign=campaign,
                volunteer=volunteer2,
                defaults={
                    "status": ApplicationStatus.PENDING,
                    "motivation": "Хочу долучитися у вільний час.",
                },
            )

            shifts = list(campaign.shifts.all().order_by("start_at"))
            if not shifts:
                continue

            # volunteer1 (approved) — призначаємо на першу зміну
            first_shift = shifts[0]
            ShiftAssignment.objects.get_or_create(
                shift=first_shift,
                volunteer=volunteer1,
                defaults={"status": ApplicationStatus.APPROVED},
            )

        self.stdout.write("  • Заявки та зміни оновлено")

    @staticmethod
    def _normalize_datetime(dt: datetime) -> datetime:
        if timezone.is_naive(dt):
            return timezone.make_aware(dt, timezone.get_current_timezone())
        return timezone.localtime(dt)

