from django.db import models


class GroupedMessages(models.Model):
    agent_id = models.CharField(max_length=255)
    messages = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
