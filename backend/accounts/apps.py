"""
/**
 * @file: apps.py
 * @description: Конфігурація додатку accounts.
 * @dependencies: django.apps.AppConfig
 * @created: 2025-11-08
 */
"""

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    verbose_name = "Користувачі та ролі"
