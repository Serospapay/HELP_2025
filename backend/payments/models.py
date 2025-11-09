"""
/**
 * @file: models.py
 * @description: Моделі для пожертв та інтеграції з платіжними провайдерами.
 * @dependencies: campaigns.models.Campaign, django.conf.settings.AUTH_USER_MODEL
 * @created: 2025-11-08
 */
"""

import uuid

from decimal import Decimal

from django.conf import settings
from django.db import models, transaction
from django.db.models import F
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from campaigns.models import Campaign

User = settings.AUTH_USER_MODEL


class DonationProvider(models.TextChoices):
    MONOBANK = "monobank", "Monobank"
    PRIVATBANK = "privatbank", "PrivatBank"
    MANUAL = "manual", _("Ручний внесок")


class DonationStatus(models.TextChoices):
    PENDING = "pending", _("Очікує оплати")
    PROCESSING = "processing", _("Обробляється")
    SUCCEEDED = "succeeded", _("Успішно сплачено")
    FAILED = "failed", _("Помилка оплати")
    REFUNDED = "refunded", _("Повернено кошти")


class Donation(models.Model):
    reference = models.CharField(_("Референс"), max_length=40, unique=True, editable=False)
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name="donations",
        verbose_name=_("Кампанія"),
    )
    donor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="donations",
        null=True,
        blank=True,
        verbose_name=_("Донор"),
    )
    provider = models.CharField(
        _("Провайдер"),
        max_length=20,
        choices=DonationProvider.choices,
        default=DonationProvider.MONOBANK,
    )
    external_id = models.CharField(
        _("Зовнішній ID"),
        max_length=120,
        blank=True,
        help_text=_("Ідентифікатор платежу у сторонньому сервісі."),
    )
    amount = models.DecimalField(_("Сума"), max_digits=12, decimal_places=2)
    currency = models.CharField(_("Валюта"), max_length=8, default="UAH")
    status = models.CharField(
        _("Статус"),
        max_length=20,
        choices=DonationStatus.choices,
        default=DonationStatus.PENDING,
    )
    payer_email = models.EmailField(_("Email платника"), blank=True)
    payer_name = models.CharField(_("Ім'я платника"), max_length=255, blank=True)
    note = models.CharField(_("Коментар"), max_length=500, blank=True)
    payload = models.JSONField(_("Сире повідомлення"), default=dict, blank=True)
    created_at = models.DateTimeField(_("Створено"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Оновлено"), auto_now=True)
    confirmed_at = models.DateTimeField(_("Підтверджено"), null=True, blank=True)

    class Meta:
        verbose_name = _("Пожертва")
        verbose_name_plural = _("Пожертви")
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("campaign", "status")),
            models.Index(fields=("provider", "external_id")),
        ]

    def __str__(self) -> str:
        return f"{self.reference} · {self.amount} {self.currency}"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = uuid.uuid4().hex[:16]
        super().save(*args, **kwargs)

    @transaction.atomic
    def mark_succeeded(self, payload: dict | None = None):
        if self.status == DonationStatus.SUCCEEDED:
            return
        self.status = DonationStatus.SUCCEEDED
        self.confirmed_at = timezone.now()
        if payload is not None:
            self.payload = payload
        self.save(update_fields=["status", "confirmed_at", "payload", "updated_at"])

        Campaign.objects.filter(id=self.campaign_id).update(
            current_amount=F("current_amount") + self.amount
        )
        self.refresh_from_db(fields=["status", "confirmed_at", "payload", "updated_at"])

    def mark_failed(self, payload: dict | None = None):
        if payload is not None:
            self.payload = payload
        self.status = DonationStatus.FAILED
        self.save(update_fields=["status", "payload", "updated_at"])

    @property
    def amount_uah(self) -> Decimal:
        return self.amount if self.currency == "UAH" else self.amount
