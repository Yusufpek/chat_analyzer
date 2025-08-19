from rest_framework import serializers
from common.models.agent import Agent


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
