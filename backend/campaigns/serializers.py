"""
/**
 * @file: serializers.py
 * @description: Серіалізатори для кампаній, етапів, змін та заявок волонтерів.
 * @dependencies: rest_framework.serializers
 * @created: 2025-11-08
 */
"""

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from .models import (
    ApplicationStatus,
    Campaign,
    CampaignCategory,
    CampaignShift,
    CampaignStage,
    ShiftAssignment,
    VolunteerApplication,
    CampaignStatus,
)

User = get_user_model()


class CoordinatorMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "role")
        read_only_fields = fields


class CampaignMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = ("id", "title", "slug")
        read_only_fields = fields


class CampaignCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignCategory
        fields = ("id", "name", "slug", "description")


class CampaignStageSerializer(serializers.ModelSerializer):
    campaign_id = serializers.PrimaryKeyRelatedField(
        queryset=Campaign.objects.all(),
        source="campaign",
        write_only=True,
        required=True,
    )

    class Meta:
        model = CampaignStage
        fields = ("id", "campaign", "campaign_id", "title", "description", "order", "is_completed", "due_date")
        read_only_fields = ("campaign",)

    def validate_order(self, value):
        if value < 1:
            raise serializers.ValidationError("Порядок етапу має бути додатнім.")
        return value


class CampaignShiftSerializer(serializers.ModelSerializer):
    campaign_id = serializers.PrimaryKeyRelatedField(
        queryset=Campaign.objects.all(),
        source="campaign",
        write_only=True,
        required=True,
    )
    occupied_spots = serializers.IntegerField(read_only=True)
    is_user_enrolled = serializers.SerializerMethodField()
    user_assignment_id = serializers.SerializerMethodField()

    class Meta:
        model = CampaignShift
        fields = (
            "id",
            "campaign",
            "title",
            "description",
            "start_at",
            "end_at",
            "capacity",
            "status",
            "location_details",
            "instructions",
            "campaign",
            "campaign_id",
            "occupied_spots",
            "is_user_enrolled",
            "user_assignment_id",
        )
        read_only_fields = ("campaign", "occupied_spots", "status")

    def validate(self, attrs):
        start_at = attrs.get("start_at", getattr(self.instance, "start_at", None))
        end_at = attrs.get("end_at", getattr(self.instance, "end_at", None))
        if start_at and end_at and start_at >= end_at:
            raise serializers.ValidationError("Час завершення має бути пізніше за початок.")
        return attrs

    def validate_capacity(self, value):
        if value < 1:
            raise serializers.ValidationError("Кількість місць має бути позитивною.")
        return value

    def get_is_user_enrolled(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.assignments.filter(volunteer=request.user).exists()

    def get_user_assignment_id(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return None
        assignment = obj.assignments.filter(volunteer=request.user).first()
        return assignment.id if assignment else None


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    campaign = CampaignMiniSerializer(read_only=True)
    volunteer = CoordinatorMiniSerializer(read_only=True)

    class Meta:
        model = VolunteerApplication
        fields = (
            "id",
            "campaign",
            "volunteer",
            "motivation",
            "experience",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("campaign", "volunteer", "status", "created_at", "updated_at")


class VolunteerApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerApplication
        fields = ("status",)

    def validate_status(self, value):
        if value not in {
            ApplicationStatus.APPROVED,
            ApplicationStatus.DECLINED,
            ApplicationStatus.WITHDRAWN,
        }:
            raise serializers.ValidationError("Неприпустимий статус для оновлення.")
        return value


class CampaignListSerializer(serializers.ModelSerializer):
    category = CampaignCategorySerializer(read_only=True)
    coordinator = CoordinatorMiniSerializer(read_only=True)
    stages_count = serializers.IntegerField(read_only=True)
    shifts_count = serializers.IntegerField(read_only=True)
    applications_pending = serializers.IntegerField(read_only=True)

    class Meta:
        model = Campaign
        fields = (
            "id",
            "title",
            "slug",
            "short_description",
            "status",
            "category",
            "coordinator",
            "region",
            "location_name",
            "start_date",
            "end_date",
            "target_amount",
            "current_amount",
            "required_volunteers",
            "stages_count",
            "shifts_count",
            "applications_pending",
            "published_at",
            "created_at",
        )


class CampaignDetailSerializer(serializers.ModelSerializer):
    category = CampaignCategorySerializer(read_only=True)
    coordinator = CoordinatorMiniSerializer(read_only=True)
    stages = CampaignStageSerializer(many=True, read_only=True)
    shifts = CampaignShiftSerializer(many=True, read_only=True)

    class Meta:
        model = Campaign
        fields = (
            "id",
            "title",
            "slug",
            "short_description",
            "description",
            "status",
            "category",
            "coordinator",
            "location_name",
            "location_address",
            "location_lat",
            "location_lng",
            "region",
            "target_amount",
            "current_amount",
            "required_volunteers",
            "start_date",
            "end_date",
            "contact_email",
            "contact_phone",
            "stages",
            "shifts",
            "published_at",
            "created_at",
            "updated_at",
        )


class CampaignCreateUpdateSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=CampaignStatus.choices, default=CampaignStatus.DRAFT)

    class Meta:
        model = Campaign
        fields = (
            "title",
            "short_description",
            "description",
            "status",
            "category",
            "location_name",
            "location_address",
            "location_lat",
            "location_lng",
            "region",
            "target_amount",
            "required_volunteers",
            "start_date",
            "end_date",
            "contact_email",
            "contact_phone",
        )

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("Дата завершення має бути пізнішою за початок.")
        return attrs

    def validate_status(self, value):
        if value not in CampaignStatus.values:
            raise serializers.ValidationError("Неприпустимий статус кампанії.")
        return value

    def update(self, instance, validated_data):
        status = validated_data.get("status")
        if status == CampaignStatus.PUBLISHED and instance.published_at is None:
            instance.published_at = timezone.now()
        if status in {CampaignStatus.CANCELLED, CampaignStatus.DRAFT} and "published_at" not in validated_data:
            validated_data.setdefault("published_at", None)
        return super().update(instance, validated_data)


class ShiftAssignmentSerializer(serializers.ModelSerializer):
    volunteer = CoordinatorMiniSerializer(read_only=True)
    shift_id = serializers.PrimaryKeyRelatedField(
        queryset=CampaignShift.objects.all(),
        source="shift",
        write_only=True,
        required=True,
    )
    volunteer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="volunteer",
        write_only=True,
        required=True,
    )

    class Meta:
        model = ShiftAssignment
        fields = ("id", "shift", "shift_id", "volunteer", "volunteer_id", "status", "notes", "created_at")
        read_only_fields = ("shift", "volunteer", "created_at")


class VolunteerShiftAssignmentSerializer(serializers.ModelSerializer):
    shift = CampaignShiftSerializer(read_only=True)
    campaign = serializers.SerializerMethodField()

    class Meta:
        model = ShiftAssignment
        fields = (
            "id",
            "status",
            "notes",
            "created_at",
            "shift",
            "campaign",
        )

    def get_campaign(self, obj: ShiftAssignment):
        campaign = obj.shift.campaign
        return {
            "id": campaign.id,
            "title": campaign.title,
            "slug": campaign.slug,
            "location_name": campaign.location_name,
        }


class VolunteerApplySerializer(serializers.Serializer):
    motivation = serializers.CharField(required=False, allow_blank=True, max_length=2000)
    experience = serializers.CharField(required=False, allow_blank=True, max_length=2000)


