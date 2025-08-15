from django.db import models
from django.contrib.auth import get_user_model

from common.constants.sources import SOURCE_CHOICES, SOURCE_JOTFORM

User = get_user_model()


class Connection(models.Model):
    """
    Represents a connection out source conversation.
    """

    connection_type = models.CharField(
        max_length=255,
        choices=SOURCE_CHOICES,
        default=SOURCE_JOTFORM,
    )
    sync_interval = models.PositiveIntegerField(default=120)  # in minutes
    api_key = models.CharField(max_length=255)
    config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="connections",
    )

    def __str__(self):
        return self.connection_type

    class Meta:
        verbose_name = "Connection"
        verbose_name_plural = "Connections"
        ordering = ["-created_at"]
