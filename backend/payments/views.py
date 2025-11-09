"""
/**
 * @file: views.py
 * @description: API для створення пожертв та обробки вебхуків Monobank.
 * @dependencies: rest_framework.viewsets, payments.services.MonobankWebhookValidator
 * @created: 2025-11-08
 */
"""

import json

from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import mixins, permissions, response, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.views import APIView

from .models import Donation, DonationProvider, DonationStatus
from .serializers import (
    DonationSerializer,
    DonationStatusUpdateSerializer,
    DonationWebhookSerializer,
)
from .services import MonobankWebhookValidator, apply_monobank_status


class DonationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Donation.objects.select_related("campaign", "donor")
    serializer_class = DonationSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "reference"

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            if user.is_staff or user.role == "admin":
                return qs
            if user.role == "coordinator":
                return qs.filter(campaign__coordinator=user)
            return qs.filter(donor=user)
        return qs.none()

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated and not serializer.validated_data.get("payer_email"):
            raise PermissionDenied("Неавторизований донор має вказати email.")
        serializer.save()

    @action(
        detail=True,
        methods=["patch"],
        permission_classes=(permissions.IsAdminUser,),
    )
    def status(self, request, reference=None):
        donation = self.get_object()
        serializer = DonationStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        donation.status = serializer.validated_data["status"]
        if donation.status == DonationStatus.SUCCEEDED:
            donation.mark_succeeded(payload=donation.payload)
        else:
            donation.save(update_fields=["status", "updated_at"])
        return response.Response(DonationSerializer(donation).data)


@method_decorator(csrf_exempt, name="dispatch")
class MonobankWebhookView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        raw_body = request.body or b"{}"
        try:
            payload_data = json.loads(raw_body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            return response.Response(
                {"detail": "Некоректний JSON у вебхуку."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = DonationWebhookSerializer(data=payload_data)
        serializer.is_valid(raise_exception=True)

        provider = serializer.validated_data["provider"]
        payload = serializer.validated_data["payload"]
        signature = serializer.validated_data.get("signature") or request.headers.get("X-Signature", "")

        if provider != DonationProvider.MONOBANK:
            return response.Response({"detail": "Провайдер не підтримується цим вебхуком."}, status=status.HTTP_400_BAD_REQUEST)

        validator = MonobankWebhookValidator(getattr(settings, "MONOBANK_WEBHOOK_SECRET", None))
        data = validator.process_payload(payload, raw_body, signature)

        try:
            donation = Donation.objects.get(reference=data.invoice_id)
        except Donation.DoesNotExist:
            donation = Donation.objects.filter(external_id=data.invoice_id).first()
            if not donation:
                raise NotFound("Не знайдено пожертву для вхідного вебхука.")

        new_status = apply_monobank_status(donation, data)
        return response.Response({"status": new_status, "reference": donation.reference})
