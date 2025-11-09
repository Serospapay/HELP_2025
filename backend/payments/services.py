"""
/**
 * @file: services.py
 * @description: Сервіси інтеграції з платіжними провайдерами (Monobank).
 * @dependencies: hashlib, hmac, base64
 * @created: 2025-11-08
 */
"""

import base64
import hashlib
import hmac
from dataclasses import dataclass

from django.conf import settings

from .models import Donation, DonationStatus


class SignatureValidationError(Exception):
    """Підпис вебхука невалідний."""


@dataclass
class MonobankWebhookData:
    invoice_id: str
    status: str
    amount: int
    currency: str
    customer_email: str | None = None
    customer_name: str | None = None

    @classmethod
    def from_payload(cls, payload: dict):
        data = payload.get("data", payload)
        return cls(
            invoice_id=data.get("invoiceId") or data.get("invoice_id", ""),
            status=data.get("status", ""),
            amount=data.get("amount", 0),
            currency=data.get("ccy", "UAH"),
            customer_email=data.get("customerEmail"),
            customer_name=data.get("customerName"),
        )


class MonobankWebhookValidator:
    def __init__(self, secret: str | None):
        self.secret = secret

    def ensure_signature(self, received_signature: str, raw_body: bytes):
        if not self.secret:
            return  # режим dev без перевірки
        expected = hmac.new(
            self.secret.encode("utf-8"),
            raw_body,
            hashlib.sha256,
        ).digest()
        expected_b64 = base64.b64encode(expected).decode("utf-8")
        if not hmac.compare_digest(expected_b64, received_signature):
            raise SignatureValidationError("Некоректний підпис Monobank.")

    def process_payload(self, payload: dict, raw_body: bytes, received_signature: str | None):
        if received_signature:
            self.ensure_signature(received_signature, raw_body)
        data = MonobankWebhookData.from_payload(payload)
        return data


def apply_monobank_status(donation: Donation, webhook_data: MonobankWebhookData):
    """Оновлює статус пожертви на основі даних Monobank."""
    normalized_status = webhook_data.status.lower()
    if normalized_status in {"success", "succeeded", "processed"}:
        donation.external_id = webhook_data.invoice_id
        donation.payer_email = webhook_data.customer_email or donation.payer_email
        donation.payer_name = webhook_data.customer_name or donation.payer_name
        donation.mark_succeeded(payload={"monobank": webhook_data.__dict__})
        return DonationStatus.SUCCEEDED
    if normalized_status in {"failure", "failed", "expired"}:
        donation.mark_failed(payload={"monobank": webhook_data.__dict__})
        return DonationStatus.FAILED
    # іншi статуси ігноруємо (pending)
    donation.payload = {"monobank": webhook_data.__dict__}
    donation.status = DonationStatus.PROCESSING
    donation.save(update_fields=["payload", "status", "updated_at"])
    return donation.status


