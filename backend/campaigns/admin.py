"""
/**
 * @file: admin.py
 * @description: Конфігурація Django admin для кампаній, змін і заявок.
 * @dependencies: django.contrib.admin
 * @created: 2025-11-08
 */
"""

from django.contrib import admin

from .models import (
    Campaign,
    CampaignCategory,
    CampaignShift,
    CampaignStage,
    ShiftAssignment,
    VolunteerApplication,
)


@admin.register(CampaignCategory)
class CampaignCategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("name", "slug")
    search_fields = ("name",)


class CampaignStageInline(admin.TabularInline):
    model = CampaignStage
    extra = 1
    fields = ("title", "order", "is_completed", "due_date")


class CampaignShiftInline(admin.TabularInline):
    model = CampaignShift
    extra = 0
    fields = ("title", "start_at", "end_at", "capacity", "status")


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "category", "coordinator", "region", "published_at")
    list_filter = ("status", "category", "region")
    search_fields = ("title", "short_description", "coordinator__email")
    readonly_fields = ("created_at", "updated_at", "published_at", "slug")
    prepopulated_fields = {"slug": ("title",)}
    inlines = (CampaignStageInline, CampaignShiftInline)


@admin.register(CampaignStage)
class CampaignStageAdmin(admin.ModelAdmin):
    list_display = ("campaign", "title", "order", "is_completed", "due_date")
    list_filter = ("is_completed",)
    ordering = ("campaign", "order")


@admin.register(CampaignShift)
class CampaignShiftAdmin(admin.ModelAdmin):
    list_display = ("campaign", "title", "start_at", "end_at", "capacity", "status")
    list_filter = ("status", "campaign")
    search_fields = ("campaign__title", "title")


@admin.register(VolunteerApplication)
class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ("campaign", "volunteer", "status", "created_at")
    list_filter = ("status", "campaign")
    search_fields = ("volunteer__email", "campaign__title")


@admin.register(ShiftAssignment)
class ShiftAssignmentAdmin(admin.ModelAdmin):
    list_display = ("shift", "volunteer", "status", "created_at")
    list_filter = ("status", "shift__campaign")
    search_fields = ("volunteer__email", "shift__campaign__title")
