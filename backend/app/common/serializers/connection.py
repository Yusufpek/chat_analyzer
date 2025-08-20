from rest_framework import serializers
from common.models.connection import Connection, Agent
from common.constants.sources import SOURCE_JOTFORM, SOURCE_CHATGPT


class ConnectionSerializer(serializers.ModelSerializer):
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
        if data["connection_type"] != SOURCE_JOTFORM:
            raise serializers.ValidationError(
                "Invalid connection type. Only JotForm is supported."
            )
        if not data.get("api_key"):
            raise serializers.ValidationError("API key is required.")
        return data


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = [
            "id",
            "name",
            "avatar_url",
            "connection",
        ]

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "avatar_url": instance.avatar_url,
            "name": instance.name,
        }


class FileSourceSerializer(serializers.Serializer):
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
