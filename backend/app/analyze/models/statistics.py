from django.db import models


class GroupedMessages(models.Model):
    agent_id = models.CharField(max_length=255)
    messages = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ContextChange(models.Model):
    conversation_id = models.CharField(max_length=255)

    overall_context = models.TextField()
    topics = models.JSONField()
    context_changes = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
