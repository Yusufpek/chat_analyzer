from django.db import models
from .connection import Connection


class Agent(models.Model):
    """
    Represents an agent ID for a JotForm connection.
    """

    connection = models.ForeignKey(
        Connection,
        on_delete=models.CASCADE,
        related_name="agent_ids",
    )
    id = models.CharField(max_length=255, primary_key=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return f"{self.connection.connection_type} - {self.id}"

    class Meta:
        verbose_name = "Agent ID"
        verbose_name_plural = "Agent IDs"
        unique_together = ("connection", "id")
