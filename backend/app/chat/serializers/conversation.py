from rest_framework import serializers
from chat.models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "content",
            "created_at",
            "saved_at",
            "modified_at",
            "sender_type",
            "avatar_url",
            "analysis_result",
            "conversation",
        ]
