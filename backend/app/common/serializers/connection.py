from rest_framework import serializers
from common.models.connection import Connection
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
