"""
/**
 * @file: admin.py
 * @description: Реєстрація моделей пожертв у Django admin.
 * @dependencies: payments.models.Donation
 * @created: 2025-11-08
 */
"""

from django.contrib import admin

from .models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "campaign",
        "amount",
        "currency",
        "status",
        "provider",
        "donor",
        "confirmed_at",
    )
    list_filter = ("status", "provider", "currency", "campaign")
    search_fields = ("reference", "external_id", "donor__email", "campaign__title")
    readonly_fields = ("created_at", "updated_at", "confirmed_at", "payload")
