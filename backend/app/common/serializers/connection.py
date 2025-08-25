from rest_framework import serializers
from common.models.connection import Connection, Agent
from common.constants.sources import SOURCE_JOTFORM, SOURCE_CHATGPT, SOURCE_FILE


class ConnectionSerializer(serializers.ModelSerializer):
    """Serializer for Connection model."""

    class Meta:
        model = Connection
        fields = [
            "id",
            "connection_type",
            "sync_interval",
            "api_key",
            "config",
            "created_at",
            "modified_at",
            "user",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "modified_at",
        ]
        required_fields = [
            "connection_type",
            "api_key",
            "config",
        ]

    def validate(self, data):
        if data["connection_type"] == SOURCE_CHATGPT:
            raise serializers.ValidationError("OPENAI entegration is in development.")

        if data["connection_type"] not in [SOURCE_JOTFORM, SOURCE_CHATGPT, SOURCE_FILE]:
            raise serializers.ValidationError(
                "Invalid connection type. Supported types are JotForm, ChatGPT, and File."
            )
        if not data.get("api_key"):
            raise serializers.ValidationError("API key is required.")
        return data


class AgentSerializer(serializers.ModelSerializer):
    """Serializer for Agent model."""

    id = serializers.CharField(required=True)

    class Meta:
        model = Agent
        fields = [
            "id",
            "name",
            "avatar_url",
            "connection",
            "jotform_render_url",
        ]

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "avatar_url": instance.avatar_url,
            "name": instance.name,
            "jotform_render_url": instance.jotform_render_url,
        }

    def validate_id(self, value):
        print(f"Validating agent ID: {value}")
        if not value:
            raise serializers.ValidationError("Agent ID cannot be empty.")
        if not isinstance(value, str):
            raise serializers.ValidationError("Agent ID must be a string.")
        if Agent.objects.filter(id=value).exists():
            raise serializers.ValidationError("Agent with this ID already exists.")
        return value

    def validate(self, data):
        if data.get("jotform_render_url"):
            if not data["jotform_render_url"].startswith("https://"):
                raise serializers.ValidationError(
                    "JotForm render URL must start with 'https://'."
                )
        return data


class AgentDetailSerializer(serializers.ModelSerializer):
    """Serializer for Agent model."""

    class Meta:
        model = Agent
        fields = [
            "id",
            "name",
            "avatar_url",
            "connection",
            "jotform_render_url",
        ]

    def to_representation(self, instance):
        statistics = self.context.get("statistics", {})

        return {
            "id": instance.id,
            "avatar_url": instance.avatar_url,
            "name": instance.name,
            "jotform_render_url": instance.jotform_render_url,
            "total_conversations": statistics.get("total_conversations"),
            "total_messages": statistics.get("total_messages"),
            "sentiment_score": statistics.get("sentiment_score", 0).__round__(2),
            "total_sentiment_count": statistics.get("total_sentiment_count"),
            "super_positive_count": statistics.get("super_positive_count"),
            "positive_count": statistics.get("positive_count"),
            "neutral_count": statistics.get("neutral_count"),
            "negative_count": statistics.get("negative_count"),
            "super_negative_count": statistics.get("super_negative_count"),
        }


class FileSourceSerializer(serializers.Serializer):
    """Serializer for file source connections."""

    agent_name = serializers.CharField(max_length=255)
    file = serializers.FileField()
    agent_avatar_url = serializers.CharField(
        max_length=127,
        allow_blank=True,
        required=False,
    )

    def validate_file(self, value):
        if not value.name.endswith(".csv") and not value.name.endswith(".json"):
            raise serializers.ValidationError("Only CSV and JSON files are supported.")
        return value
