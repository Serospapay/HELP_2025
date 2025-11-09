"""
/**
 * @file: admin.py
 * @description: Реєстрація користувача та налаштування адміністративної панелі.
 * @dependencies: django.contrib.auth.admin.UserAdmin, accounts.models.User
 * @created: 2025-11-08
 */
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = (
        (None, {"fields": ("email", "password", "role")}),
        (_("Персональна інформація"), {"fields": ("first_name", "last_name", "phone_number")}),
        (
            _("Доступи"),
            {"fields": ("is_active", "is_staff", "is_superuser", "is_verified", "groups", "user_permissions")},
        ),
        (_("Важливі дати"), {"fields": ("last_login", "date_joined", "terms_accepted_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "role"),
            },
        ),
    )
    list_display = ("email", "role", "is_verified", "is_staff", "date_joined")
    list_filter = ("role", "is_staff", "is_superuser", "is_verified", "is_active", "groups")
    ordering = ("email",)
    search_fields = ("email", "first_name", "last_name", "phone_number")
