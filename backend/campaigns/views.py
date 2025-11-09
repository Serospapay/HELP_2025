"""
/**
 * @file: views.py
 * @description: ViewSets та кастомні дії для кампаній, змін і заявок волонтерів.
 * @dependencies: rest_framework.viewsets, rest_framework.decorators.action
 * @created: 2025-11-08
 */
"""

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import decorators, mixins, permissions, response, status, viewsets
from rest_framework.exceptions import PermissionDenied

from accounts.models import UserRole

from .models import (
    ApplicationStatus,
    Campaign,
    CampaignCategory,
    CampaignShift,
    CampaignStage,
    ShiftAssignment,
    VolunteerApplication,
    CampaignStatus as CampaignStatusEnum,
    ShiftStatus,
)
from .permissions import IsCoordinatorOfCampaign, IsCoordinatorOrReadOnly
from .serializers import (
    CampaignCategorySerializer,
    CampaignCreateUpdateSerializer,
    CampaignDetailSerializer,
    CampaignListSerializer,
    CampaignShiftSerializer,
    CampaignStageSerializer,
    ShiftAssignmentSerializer,
    VolunteerApplicationSerializer,
    VolunteerApplicationUpdateSerializer,
    VolunteerApplySerializer,
    VolunteerShiftAssignmentSerializer,
)


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.select_related("category", "coordinator").prefetch_related(
        "stages",
        "shifts",
        "shifts__assignments",
    )
    permission_classes = (IsCoordinatorOrReadOnly,)
    lookup_field = "slug"

    def get_queryset(self):
        qs = (
            super()
            .get_queryset()
            .annotate(
                stages_count=Count("stages", distinct=True),
                shifts_count=Count("shifts", distinct=True),
                applications_pending=Count(
                    "applications",
                    filter=Q(applications__status=ApplicationStatus.PENDING),
                    distinct=True,
                ),
            )
        )
        params = self.request.query_params
        status_param = params.get("status")
        category = params.get("category")
        region = params.get("region")
        coordinator = params.get("coordinator")
        search = params.get("search")

        if status_param:
            qs = qs.filter(status=status_param)
        else:
            qs = qs.exclude(status=CampaignStatusEnum.DRAFT)

        if category:
            qs = qs.filter(category__slug=category)
        if region:
            qs = qs.filter(region__icontains=region)
        if coordinator:
            qs = qs.filter(coordinator__id=coordinator)
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(short_description__icontains=search)
                | Q(description__icontains=search)
            )
        return qs

    def get_serializer_class(self):
        if self.action in {"list"}:
            return CampaignListSerializer
        if self.action in {"retrieve"}:
            return CampaignDetailSerializer
        if self.action in {"create", "update", "partial_update"}:
            return CampaignCreateUpdateSerializer
        return CampaignDetailSerializer

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(coordinator=user)
        campaign = serializer.instance
        if campaign.status == CampaignStatusEnum.PUBLISHED and campaign.published_at is None:
            campaign.published_at = timezone.now()
            campaign.save(update_fields=["published_at"])

    def perform_update(self, serializer):
        instance = serializer.instance
        previous_status = instance.status
        serializer.save()
        instance.refresh_from_db()
        if (
            previous_status != CampaignStatusEnum.PUBLISHED
            and instance.status == CampaignStatusEnum.PUBLISHED
            and instance.published_at is None
        ):
            instance.published_at = timezone.now()
            instance.save(update_fields=["published_at"])

    @decorators.action(
        detail=True,
        methods=["post"],
        permission_classes=(permissions.IsAuthenticated,),
        url_path="apply",
    )
    def apply(self, request, slug=None):
        campaign = self.get_object()
        user = request.user
        if user.id == campaign.coordinator_id:
            raise PermissionDenied("Координатор не може подавати заявку на власну кампанію.")

        if user.role not in {UserRole.VOLUNTEER, UserRole.COORDINATOR, UserRole.BENEFICIARY, UserRole.ADMIN}:
            raise PermissionDenied("Недостатньо прав для подачі заявки.")

        serializer = VolunteerApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application, created = VolunteerApplication.objects.get_or_create(
            campaign=campaign,
            volunteer=user,
            defaults={
                "motivation": serializer.validated_data.get("motivation", ""),
                "experience": serializer.validated_data.get("experience", ""),
            },
        )

        if not created:
            if application.status == ApplicationStatus.WITHDRAWN:
                application.status = ApplicationStatus.PENDING
                application.motivation = serializer.validated_data.get("motivation", application.motivation)
                application.experience = serializer.validated_data.get("experience", application.experience)
                application.save(update_fields=["status", "motivation", "experience", "updated_at"])
            else:
                return response.Response(
                    {"detail": "Заявка вже існує."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        data = VolunteerApplicationSerializer(application, context={"request": request}).data
        return response.Response(data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @decorators.action(
        detail=True,
        methods=["get"],
        permission_classes=(permissions.IsAuthenticated,),
        url_path="stats",
    )
    def stats(self, request, slug=None):
        campaign = self.get_object()
        user = request.user
        if not (
            campaign.coordinator_id == user.id
            or user.role == UserRole.ADMIN
            or user.is_staff
        ):
            raise PermissionDenied("Недостатньо прав для перегляду статистики.")

        applications = campaign.applications.all()
        volunteers_total = applications.filter(status=ApplicationStatus.APPROVED).count()
        pending_total = applications.filter(status=ApplicationStatus.PENDING).count()
        declined_total = applications.filter(status=ApplicationStatus.DECLINED).count()
        withdrawn_total = applications.filter(status=ApplicationStatus.WITHDRAWN).count()

        shift_capacity = campaign.shifts.aggregate(
            total_capacity=Sum("capacity"),
        )["total_capacity"] or 0

        data = {
            "volunteers": {
                "approved": volunteers_total,
                "pending": pending_total,
                "declined": declined_total,
                "withdrawn": withdrawn_total,
            },
            "shift_capacity": shift_capacity,
            "campaign": {
                "id": campaign.id,
                "title": campaign.title,
                "target_amount": campaign.target_amount or 0,
                "current_amount": campaign.current_amount or 0,
            },
        }
        return response.Response(data)

    @decorators.action(
        detail=True,
        methods=["get"],
        permission_classes=(permissions.IsAuthenticated,),
        url_path="applications",
    )
    def list_applications(self, request, slug=None):
        campaign = self.get_object()
        user = request.user
        if campaign.coordinator_id != user.id and user.role not in {UserRole.ADMIN} and not user.is_staff:
            raise PermissionDenied("Тільки координатор кампанії має доступ до заявок.")

        qs = campaign.applications.select_related("volunteer").order_by("-created_at")
        serializer = VolunteerApplicationSerializer(qs, many=True, context={"request": request})
        return response.Response(serializer.data)


class CampaignCategoryViewSet(viewsets.ModelViewSet):
    queryset = CampaignCategory.objects.all()
    serializer_class = CampaignCategorySerializer
    permission_classes = (IsCoordinatorOrReadOnly,)
    lookup_field = "slug"


class CampaignStageViewSet(viewsets.ModelViewSet):
    queryset = CampaignStage.objects.select_related("campaign")
    serializer_class = CampaignStageSerializer
    permission_classes = (IsCoordinatorOrReadOnly,)

    def get_queryset(self):
        qs = super().get_queryset()
        campaign = self.request.query_params.get("campaign")
        if campaign:
            qs = qs.filter(campaign__slug=campaign)
        return qs

    def perform_create(self, serializer):
        campaign = serializer.validated_data["campaign"]
        user = self.request.user
        if campaign.coordinator_id != user.id and user.role not in {UserRole.ADMIN} and not user.is_staff:
            raise PermissionDenied("Тільки координатор кампанії може створювати етапи.")
        serializer.save()


class CampaignShiftViewSet(viewsets.ModelViewSet):
    queryset = CampaignShift.objects.select_related("campaign")
    serializer_class = CampaignShiftSerializer
    permission_classes = (IsCoordinatorOrReadOnly,)

    def get_queryset(self):
        qs = super().get_queryset()
        campaign = self.request.query_params.get("campaign")
        if campaign:
            qs = qs.filter(campaign__slug=campaign)
        start_after = self.request.query_params.get("start_after")
        if start_after:
            qs = qs.filter(start_at__gte=start_after)
        return qs

    def perform_create(self, serializer):
        campaign = serializer.validated_data["campaign"]
        user = self.request.user
        if campaign.coordinator_id != user.id and user.role not in {UserRole.ADMIN} and not user.is_staff:
            raise PermissionDenied("Тільки координатор кампанії може створювати зміни.")
        serializer.save()

    @decorators.action(
        detail=True,
        methods=["post"],
        permission_classes=(permissions.IsAuthenticated,),
        url_path="join",
    )
    def join(self, request, pk=None):
        shift = self.get_object()
        user = request.user

        if shift.status in {ShiftStatus.CANCELLED, ShiftStatus.COMPLETED}:
            return response.Response(
                {"detail": "Запис на цю зміну неможливий."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_coordinator = shift.campaign.coordinator_id == user.id or user.role == UserRole.ADMIN or user.is_staff
        if not is_coordinator:
            approved = VolunteerApplication.objects.filter(
                campaign=shift.campaign,
                volunteer=user,
                status=ApplicationStatus.APPROVED,
            ).exists()
            if not approved:
                raise PermissionDenied("Спершу потрібно отримати підтвердження координатора.")

        existing = shift.assignments.filter(volunteer=user).first()
        if existing:
            serializer = ShiftAssignmentSerializer(existing, context={"request": request})
            return response.Response(serializer.data, status=status.HTTP_200_OK)

        approved_count = shift.assignments.filter(status=ApplicationStatus.APPROVED).count()
        if shift.capacity and approved_count >= shift.capacity:
            return response.Response(
                {"detail": "Усі місця на цю зміну заповнені."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assignment = ShiftAssignment.objects.create(
            shift=shift,
            volunteer=user,
            status=ApplicationStatus.APPROVED,
        )
        serializer = ShiftAssignmentSerializer(assignment, context={"request": request})
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)

    @decorators.action(
        detail=True,
        methods=["delete"],
        permission_classes=(permissions.IsAuthenticated,),
        url_path="leave",
    )
    def leave(self, request, pk=None):
        shift = self.get_object()
        user = request.user
        assignment = shift.assignments.filter(volunteer=user).first()
        if not assignment:
            return response.Response(
                {"detail": "Ви не записані на цю зміну."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assignment.delete()
        return response.Response(status=status.HTTP_204_NO_CONTENT)


class VolunteerApplicationViewSet(
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = VolunteerApplication.objects.select_related("campaign", "volunteer", "campaign__coordinator")
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == "update" or self.action == "partial_update":
            return VolunteerApplicationUpdateSerializer
        return VolunteerApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == UserRole.COORDINATOR:
            qs = qs.filter(campaign__coordinator=user)
        elif user.role == UserRole.ADMIN or user.is_staff:
            pass
        else:
            qs = qs.filter(volunteer=user)
        campaign_slug = self.request.query_params.get("campaign")
        status_filter = self.request.query_params.get("status")
        if campaign_slug:
            qs = qs.filter(campaign__slug=campaign_slug)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by("-created_at")

    def perform_update(self, serializer):
        instance = serializer.instance
        user = self.request.user
        status_value = serializer.validated_data.get("status")

        if user.id == instance.volunteer_id:
            if status_value != ApplicationStatus.WITHDRAWN:
                raise PermissionDenied("Волонтер може лише скасувати власну заявку.")
        elif not (
            instance.campaign.coordinator_id == user.id
            or user.role == UserRole.ADMIN
            or user.is_staff
        ):
            raise PermissionDenied("Недостатньо прав для зміни заявки.")

        serializer.save()


class ShiftAssignmentViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ShiftAssignment.objects.select_related("shift", "shift__campaign", "volunteer")
    serializer_class = ShiftAssignmentSerializer
    permission_classes = (IsCoordinatorOfCampaign,)

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == UserRole.COORDINATOR:
            qs = qs.filter(shift__campaign__coordinator=user)
        campaign_slug = self.request.query_params.get("campaign")
        if campaign_slug:
            qs = qs.filter(shift__campaign__slug=campaign_slug)
        return qs

    def perform_create(self, serializer):
        shift = serializer.validated_data["shift"]
        user = self.request.user
        if shift.campaign.coordinator_id != user.id and user.role not in {UserRole.ADMIN} and not user.is_staff:
            raise PermissionDenied("Тільки координатор кампанії може призначати волонтерів на зміну.")
        serializer.save()


class MyShiftAssignmentViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = VolunteerShiftAssignmentSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = ShiftAssignment.objects.select_related(
        "shift",
        "shift__campaign",
        "shift__campaign__coordinator",
    )

    def get_queryset(self):
        user = self.request.user
        now = timezone.now()
        shift_statuses = {ShiftStatus.OPEN, ShiftStatus.FULL}
        return (
            super()
            .get_queryset()
            .filter(
                volunteer=user,
                status=ApplicationStatus.APPROVED,
                shift__end_at__gte=now,
                shift__status__in=shift_statuses,
            )
            .order_by("shift__start_at")
        )
