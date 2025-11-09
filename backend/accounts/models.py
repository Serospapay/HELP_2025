"""
/**
 * @file: models.py
 * @description: Користувацька модель користувача з рольовою системою для платформи волонтерських проєктів.
 * @dependencies: django.contrib.auth.models.AbstractUser, django.contrib.auth.base_user.BaseUserManager
 * @created: 2025-11-08
 */
"""

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    VOLUNTEER = "volunteer", _("Волонтер")
    COORDINATOR = "coordinator", _("Координатор")
    BENEFICIARY = "beneficiary", _("Отримувач допомоги")
    ADMIN = "admin", _("Адміністратор")


class UserManager(BaseUserManager):
    """Менеджер користувачів із підтримкою email як основного логіна."""

    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra_fields):
        if not email:
            raise ValueError("Email є обов'язковим для створення користувача.")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str | None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", UserRole.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Суперкористувач повинен мати is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Суперкористувач повинен мати is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Користувацька модель, що використовує email як логін та підтримує ролі.
    """

    username = None
    email = models.EmailField(_("Email"), unique=True)
    role = models.CharField(
        _("Роль"),
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.VOLUNTEER,
    )
    phone_number = models.CharField(
        _("Номер телефону"),
        max_length=32,
        blank=True,
        help_text=_("Формат: +380XXXXXXXXX."),
    )
    is_verified = models.BooleanField(
        _("Верифікований користувач"), default=False, help_text=_("KYC підтверджений.")
    )
    terms_accepted_at = models.DateTimeField(
        _("Дата прийняття умов"),
        null=True,
        blank=True,
        help_text=_("Коли користувач погодився з політикою платформи."),
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta:
        verbose_name = _("Користувач")
        verbose_name_plural = _("Користувачі")
        ordering = ("-date_joined",)

    def __str__(self) -> str:
        return self.email

    @property
    def display_name(self) -> str:
        full_name = self.get_full_name().strip()
        return full_name or self.email
