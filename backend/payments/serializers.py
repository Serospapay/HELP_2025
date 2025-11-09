"""
/**
 * @file: serializers.py
 * @description: Серіалізатори для створення пожертв та обробки вебхуків.
 * @dependencies: rest_framework.serializers
 * @created: 2025-11-08
 */
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from campaigns.models import Campaign
from .models import Donation, DonationProvider, DonationStatus

User = get_user_model()


class DonationSerializer(serializers.ModelSerializer):
    campaign = serializers.PrimaryKeyRelatedField(
        queryset=Campaign.objects.all(),
        required=True,
    )
    donor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Donation
        fields = (
            "reference",
            "campaign",
            "donor",
            "provider",
            "amount",
            "currency",
            "status",
            "payer_email",
            "payer_name",
            "note",
            "external_id",
            "created_at",
            "confirmed_at",
        )
        read_only_fields = (
            "reference",
            "status",
            "external_id",
            "created_at",
            "confirmed_at",
        )

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Сума пожертви має бути більшою за 0.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        if user.is_authenticated:
            validated_data.setdefault("donor", user)
        provider = validated_data.get("provider")
        if provider not in DonationProvider.values:
            raise serializers.ValidationError({"provider": "Непідтримуваний провайдер."})
        validated_data.setdefault("currency", "UAH")
        donation = Donation.objects.create(**validated_data)
        return donation


class DonationWebhookSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=DonationProvider.choices)
    signature = serializers.CharField(required=False, allow_blank=True)
    payload = serializers.JSONField()


class DonationStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=DonationStatus.choices)


