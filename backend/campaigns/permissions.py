"""
/**
 * @file: permissions.py
 * @description: Кастомні permissions для операцій з кампаніями.
 * @dependencies: rest_framework.permissions
 * @created: 2025-11-08
 */
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission

from accounts.models import UserRole


class IsCoordinatorOrReadOnly(BasePermission):
    """
    Дозволяє читання будь-кому, але створення/редагування лише координаторам чи адміністраторам.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.role in {UserRole.COORDINATOR, UserRole.ADMIN} or user.is_staff

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(obj, "coordinator_id", None) == user.id:
            return True
        return user.role == UserRole.ADMIN or user.is_staff


class IsCoordinatorOfCampaign(BasePermission):
    """
    Доступ лише координатору поточної кампанії або адміністратору.
    """

    def has_permission(self, request, view):
        user = request.user
        if request.method in SAFE_METHODS:
            return bool(user and user.is_authenticated)
        return bool(
            user
            and user.is_authenticated
            and (user.role in {UserRole.COORDINATOR, UserRole.ADMIN} or user.is_staff)
        )

    def has_object_permission(self, request, view, obj):
        campaign = getattr(obj, "campaign", obj)
        user = request.user
        return bool(
            user
            and (
                campaign.coordinator_id == user.id
                or user.role == UserRole.ADMIN
                or user.is_staff
            )
        )


