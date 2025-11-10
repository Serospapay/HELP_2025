"""
/**
 * @file: models.py
 * @description: Моделі кампаній, етапів, змін та заявок волонтерів.
 * @dependencies: django.conf.settings.AUTH_USER_MODEL
 * @created: 2025-11-08
 */
"""

import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

User = settings.AUTH_USER_MODEL


class CampaignStatus(models.TextChoices):
    DRAFT = "draft", _("Чернетка")
    PUBLISHED = "published", _("Опубліковано")
    IN_PROGRESS = "in_progress", _("У процесі")
    COMPLETED = "completed", _("Завершено")
    CANCELLED = "cancelled", _("Скасовано")


class ApplicationStatus(models.TextChoices):
    PENDING = "pending", _("Очікує підтвердження")
    APPROVED = "approved", _("Підтверджено")
    DECLINED = "declined", _("Відхилено")
    WITHDRAWN = "withdrawn", _("Скасовано волонтером")


class ShiftStatus(models.TextChoices):
    OPEN = "open", _("Набір триває")
    FULL = "full", _("Набір закрито")
    COMPLETED = "completed", _("Виконано")
    CANCELLED = "cancelled", _("Скасовано")


class CampaignCategory(models.Model):
    name = models.CharField(_("Назва"), max_length=120, unique=True)
    slug = models.SlugField(_("Слаг"), max_length=140, unique=True, blank=True)
    description = models.TextField(_("Опис"), blank=True)

    class Meta:
        verbose_name = _("Категорія кампанії")
        verbose_name_plural = _("Категорії кампаній")
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)


class Campaign(models.Model):
    title = models.CharField(_("Назва"), max_length=255)
    slug = models.SlugField(_("Слаг"), max_length=255, unique=True, blank=True)
    short_description = models.CharField(_("Короткий опис"), max_length=280)
    description = models.TextField(_("Повний опис"))
    status = models.CharField(
        _("Статус"),
        max_length=20,
        choices=CampaignStatus.choices,
        default=CampaignStatus.DRAFT,
    )
    category = models.ForeignKey(
        CampaignCategory,
        on_delete=models.PROTECT,
        related_name="campaigns",
        verbose_name=_("Категорія"),
    )
    coordinator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="coordinated_campaigns",
        verbose_name=_("Координатор"),
    )
    location_name = models.CharField(_("Локація (назва)"), max_length=255)
    location_address = models.CharField(_("Адреса локації"), max_length=500, blank=True)
    location_lat = models.DecimalField(
        _("Широта"),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )
    location_lng = models.DecimalField(
        _("Довгота"),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )
    region = models.CharField(_("Область/регіон"), max_length=120, blank=True)
    target_amount = models.DecimalField(
        _("Цільова сума"),
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Гривні. Якщо не потрібен грошовий збір, залиште порожнім."),
    )
    current_amount = models.DecimalField(
        _("Накопичено"),
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    required_volunteers = models.PositiveIntegerField(
        _("Необхідна кількість волонтерів"),
        default=0,
    )
    start_date = models.DateField(_("Дата початку"), null=True, blank=True)
    end_date = models.DateField(_("Дата завершення"), null=True, blank=True)
    contact_email = models.EmailField(_("Контактний email"), blank=True)
    contact_phone = models.CharField(_("Контактний телефон"), max_length=32, blank=True)
    created_at = models.DateTimeField(_("Створено"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Оновлено"), auto_now=True)
    published_at = models.DateTimeField(_("Опубліковано"), null=True, blank=True)

    class Meta:
        verbose_name = _("Кампанія")
        verbose_name_plural = _("Кампанії")
        ordering = ("-published_at", "-created_at")
        indexes = [
            models.Index(fields=("status", "category", "region")),
            models.Index(fields=("slug",)),
        ]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title, allow_unicode=True)[:240]
            if not base_slug:
                base_slug = f"campaign-{uuid.uuid4().hex[:8]}"
            slug = base_slug
            counter = 1
            while Campaign.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        if self.status == CampaignStatus.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class CampaignStage(models.Model):
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name="stages",
        verbose_name=_("Кампанія"),
    )
    title = models.CharField(_("Назва етапу"), max_length=200)
    description = models.TextField(_("Опис"), blank=True)
    order = models.PositiveIntegerField(_("Порядок"), default=1)
    is_completed = models.BooleanField(_("Етап виконано"), default=False)
    due_date = models.DateField(_("Очікувана дата завершення"), null=True, blank=True)

    class Meta:
        verbose_name = _("Етап кампанії")
        verbose_name_plural = _("Етапи кампанії")
        ordering = ("order", "id")

    def __str__(self) -> str:
        return f"{self.campaign.title} · {self.title}"


class CampaignShift(models.Model):
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name="shifts",
        verbose_name=_("Кампанія"),
    )
    title = models.CharField(_("Назва зміни"), max_length=200)
    description = models.TextField(_("Опис завдань"), blank=True)
    start_at = models.DateTimeField(_("Початок зміни"))
    end_at = models.DateTimeField(_("Завершення зміни"))
    capacity = models.PositiveIntegerField(_("Кількість місць"), default=1)
    status = models.CharField(
        _("Статус"),
        max_length=20,
        choices=ShiftStatus.choices,
        default=ShiftStatus.OPEN,
    )
    location_details = models.CharField(_("Деталі локації"), max_length=255, blank=True)
    instructions = models.TextField(_("Інструкції для волонтерів"), blank=True)
    created_at = models.DateTimeField(_("Створено"), auto_now_add=True)

    class Meta:
        verbose_name = _("Зміна")
        verbose_name_plural = _("Зміни")
        ordering = ("start_at",)
        indexes = [
            models.Index(fields=("campaign", "start_at")),
        ]

    def __str__(self) -> str:
        return f"{self.campaign.title} · {self.start_at:%Y-%m-%d %H:%M}"

    @property
    def occupied_spots(self) -> int:
        return self.assignments.filter(status=ApplicationStatus.APPROVED).count()


class VolunteerApplication(models.Model):
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name="applications",
        verbose_name=_("Кампанія"),
    )
    volunteer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="campaign_applications",
        verbose_name=_("Волонтер"),
    )
    motivation = models.TextField(_("Мотивація"), blank=True)
    experience = models.TextField(_("Попередній досвід"), blank=True)
    status = models.CharField(
        _("Статус"),
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.PENDING,
    )
    created_at = models.DateTimeField(_("Створено"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Оновлено"), auto_now=True)

    class Meta:
        verbose_name = _("Заявка волонтера")
        verbose_name_plural = _("Заявки волонтерів")
        unique_together = ("campaign", "volunteer")
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"{self.volunteer} → {self.campaign}"


class ShiftAssignment(models.Model):
    shift = models.ForeignKey(
        CampaignShift,
        on_delete=models.CASCADE,
        related_name="assignments",
        verbose_name=_("Зміна"),
    )
    volunteer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="shift_assignments",
        verbose_name=_("Волонтер"),
    )
    status = models.CharField(
        _("Статус участі"),
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.APPROVED,
    )
    notes = models.TextField(_("Нотатки"), blank=True)
    created_at = models.DateTimeField(_("Створено"), auto_now_add=True)

    class Meta:
        verbose_name = _("Призначення волонтера на зміну")
        verbose_name_plural = _("Призначення волонтерів на зміни")
        unique_together = ("shift", "volunteer")
        ordering = ("shift__start_at",)

    def __str__(self) -> str:
        return f"{self.volunteer} @ {self.shift}"
