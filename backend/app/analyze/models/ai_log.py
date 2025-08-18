from django.db import models
from analyze.utils.engine_types import EngineType


class AIServiceLog(models.Model):
    """
    Represents a log entry for AI service interactions.
    """

    PENDING = "pending"
    SUCCESS = "success"
    ERROR = "error"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (SUCCESS, "Success"),
        (ERROR, "Error"),
    ]

    status_code = models.IntegerField(null=True, blank=True)
    endpoint = models.CharField(max_length=255, null=True, blank=True)
    http_method = models.CharField(
        max_length=10,
        choices=[
            ("GET", "GET"),
            ("POST", "POST"),
            ("PUT", "PUT"),
            ("DELETE", "DELETE"),
        ],
        default="POST",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    service_engine = models.CharField(
        max_length=50,
        choices=EngineType.choices(),
        default=EngineType.OPENAI,
    )
    request_payload = models.JSONField(
        default=dict,
        blank=True,
        null=True,
    )
    response_payload = models.JSONField(
        default=dict,
        blank=True,
        null=True,
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING,
    )

    def __str__(self):
        return f"{self.service_engine} - {self.status_code} - {self.created_at}"

    class Meta:
        verbose_name = "AI Service Log"
        verbose_name_plural = "AI Service Logs"
        ordering = ["-created_at"]
