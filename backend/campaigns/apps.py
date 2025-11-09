"""
/**
 * @file: apps.py
 * @description: Конфігурація додатку кампаній.
 * @dependencies: django.apps.AppConfig
 * @created: 2025-11-08
 */
"""

from django.apps import AppConfig


class CampaignsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'campaigns'
    verbose_name = "Кампанії та залучення волонтерів"
