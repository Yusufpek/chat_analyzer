from django.db import models
from django.contrib.auth import get_user_model

from common.constants.sources import SOURCE_CHOICES, SOURCE_JOTFORM

User = get_user_model()


class Conversation(models.Model):
    TYPE_U2U = "u2u"
    TYPE_AI2U = "ai2u"
    TYPE_CHOICES = [
        (TYPE_U2U, "User to User"),
        (TYPE_AI2U, "AI to User"),
    ]

    STATUS_ACTIVE = "active"
    STATUS_ARCHIVED = "archived"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_ARCHIVED, "Archived"),
    ]

    id = models.CharField(max_length=255, primary_key=True)
    created_at = models.DateTimeField(null=True, blank=True)
    saved_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    analysis_result = models.CharField(max_length=100, null=True, blank=True)
    analysis_details = models.TextField(null=True, blank=True)
    assistant_avatar_url = models.URLField(null=True, blank=True)
    source = models.CharField(
        max_length=255,
        choices=SOURCE_CHOICES,
        default=SOURCE_JOTFORM,
    )
    chat_type = models.CharField(
        max_length=255,
        choices=TYPE_CHOICES,
        default=TYPE_U2U,
    )
    status = models.CharField(
        max_length=255,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
    )
    agent_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )
    # FK
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="conversations",
    )


class ChatMessage(models.Model):
    SENDER_TYPE_USER = "user"
    SENDER_TYPE_AI = "assistant"
    SENDER_TYPE_CHOICES = [
        (SENDER_TYPE_USER, "User"),
        (SENDER_TYPE_AI, "AI"),
    ]

    id = models.CharField(max_length=255, primary_key=True)
    content = models.TextField()
    created_at = models.DateTimeField(null=True, blank=True)
    saved_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    sender_type = models.CharField(
        max_length=255,
        choices=SENDER_TYPE_CHOICES,
        default=SENDER_TYPE_USER,
    )

    # FK
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
