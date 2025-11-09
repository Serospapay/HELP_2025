"""
/**
 * @file: urls.py
 * @description: Роутер REST API для кампаній, змін та заявок.
 * @dependencies: rest_framework.routers.DefaultRouter
 * @created: 2025-11-08
 */
"""

from rest_framework.routers import DefaultRouter

from .views import (
    CampaignCategoryViewSet,
    CampaignShiftViewSet,
    CampaignStageViewSet,
    CampaignViewSet,
    MyShiftAssignmentViewSet,
    ShiftAssignmentViewSet,
    VolunteerApplicationViewSet,
)

app_name = "campaigns"

router = DefaultRouter()
router.register(r"campaigns", CampaignViewSet, basename="campaigns")
router.register(r"campaign-categories", CampaignCategoryViewSet, basename="campaign-categories")
router.register(r"campaign-stages", CampaignStageViewSet, basename="campaign-stages")
router.register(r"campaign-shifts", CampaignShiftViewSet, basename="campaign-shifts")
router.register(r"volunteer-applications", VolunteerApplicationViewSet, basename="volunteer-applications")
router.register(r"shift-assignments", ShiftAssignmentViewSet, basename="shift-assignments")
router.register(r"my-shift-assignments", MyShiftAssignmentViewSet, basename="my-shift-assignments")

urlpatterns = router.urls


