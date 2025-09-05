from rest_framework import serializers
from analyze.models.statistics import ContextChange


class ContextChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContextChange
        fields = [
            "conversation_id",
            "overall_context",
            "topics",
            "context_changes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
