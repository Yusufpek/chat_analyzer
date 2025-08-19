from django.db import models


class HTTPServiceLogModel(models.Model):
    PENDING = "pending"
    SUCCESS = "success"
    ERROR = "error"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (SUCCESS, "Success"),
        (ERROR, "Error"),
    ]

    status_code = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
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

    class Meta:
        abstract = True


class JotFormServiceLog(HTTPServiceLogModel):
    def __str__(self):
        return f"{self.endpoint} - {self.status_code} - {self.created_at}"
