from rest_framework import serializers
from chat.models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages."""

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "content",
            "created_at",
            "sender_type",
            "conversation",
        ]


class ConversationSerializer(serializers.Serializer):
    """Serializer for conversations."""

    def to_representation(self, instance):
        last_message = self.context.get("last_message")
        return {
            "id": instance.id,
            "created_at": instance.created_at,
            "source": instance.source,
            "chat_type": instance.chat_type,
            "status": instance.status,
            "agent_id": instance.agent_id,
            "last_message": instance.last_message
            if hasattr(instance, "last_message")
            else ChatMessageSerializer(last_message).data,
        }
