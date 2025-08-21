from django.db import models
from django.conf import settings

import os
import logging


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

    def save(self, *args, **kwargs):
        # Call the parent class's save method
        super().save(*args, **kwargs)

        # Log the model's fields to a log file
        if self.status_code:
            logger = logging.getLogger(__name__)
            log_file_path = os.path.join(
                settings.MEDIA_ROOT,
                "logs",
                "http_requests.log",
            )

            # Ensure the log file handler is added only once
            if not logger.handlers:
                file_handler = logging.FileHandler(log_file_path)
                formatter = logging.Formatter(
                    "%(asctime)s - %(levelname)s - %(message)s"
                )
                file_handler.setFormatter(formatter)
                logger.addHandler(file_handler)
                logger.setLevel(logging.INFO)

            # Log the model's fields
            logger.info(
                f"Saved {self.__class__.__name__}: endpoint={self.endpoint}, "
                f"status_code={self.status_code}, http_method={self.http_method}, "
                f"status={self.status}, created_at={self.created_at}"
            )

    class Meta:
        abstract = True


class JotFormServiceLog(HTTPServiceLogModel):
    def __str__(self):
        return f"{self.endpoint} - {self.status_code} - {self.created_at}"
