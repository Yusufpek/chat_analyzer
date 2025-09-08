import json
from rest_framework.permissions import IsAdminUser
from django.db.models import Q, Count

from common.base.base_api_view import BaseAPIView, ResponseStatus
from common.serializers.connection import (
    ConnectionAdminSerializer,
    AgentSerializer,
    AgentDetailSerializer,
)
from common.models.connection import Connection, Agent
from common.utils.filter_mapper import filter_mapper
from chat.models.conversation import Conversation, ChatMessage


class AdminConnectionView(BaseAPIView):
    permission_classes = [IsAdminUser]

    def get_request(self, request, *args, **kwargs):
        """
        Fetches all connections for the authenticated user.
        """
        connections = Connection.objects.all()
        serializer = ConnectionAdminSerializer(connections, many=True)
        return ResponseStatus.SUCCESS, serializer.data


class AdminAgentView(BaseAPIView):
    permission_classes = [IsAdminUser]

    def get_request(self, request, *args, **kwargs):
        """
        Fetches all JotForm agent IDs for the authenticated user.
        """
        agents = Agent.objects.all()
        if kwargs.get("connection_type"):
            connection_type = kwargs.get("connection_type")
            if not Connection.objects.filter(
                connection_type=connection_type,
            ).exists():
                return ResponseStatus.NOT_FOUND, {"error": "Connection not found."}

            agents = agents.filter(connection__connection_type=connection_type)
            if not agents:
                return ResponseStatus.NOT_FOUND, {"error": "Agents not found."}

        serializer = AgentSerializer(agents, many=True)
        return ResponseStatus.SUCCESS, serializer.data


class AdminAgentDetailView(BaseAPIView):
    permission_classes = [IsAdminUser]

    def get_request(self, request, *args, **kwargs):
        """
        Fetches a specific agent by ID for the authenticated user.
        """
        agent_id = kwargs.get("agent_id")
        filter_data = request.GET.get("filter", None)
        filter_queries = {}
        if filter_data:
            try:
                filter_queries = filter_mapper(json.loads(filter_data))
            except json.JSONDecodeError:
                return ResponseStatus.BAD_REQUEST, {
                    "error": "Invalid filter format. Must be a valid JSON."
                }
            except ValueError as ve:
                return ResponseStatus.BAD_REQUEST, {"error": str(ve)}
        agent_qs = Agent.objects.filter(id=agent_id)
        agent = agent_qs.first()
        if not agent:
            return ResponseStatus.NOT_FOUND, {"error": "Agent not found."}
        conversations = Conversation.objects.filter(
            agent_id=agent.id,
            **filter_queries,
        )
        chat_messages = ChatMessage.objects.filter(
            conversation__in=conversations,
            **filter_queries,
        )
        sentiment_counts = conversations.aggregate(
            super_positive_count=Count(
                "id", filter=Q(analysis_result="SUPER_POSITIVE")
            ),
            positive_count=Count("id", filter=Q(analysis_result="POSITIVE")),
            neutral_count=Count("id", filter=Q(analysis_result="NEUTRAL")),
            negative_count=Count("id", filter=Q(analysis_result="NEGATIVE")),
            super_negative_count=Count(
                "id", filter=Q(analysis_result="SUPER_NEGATIVE")
            ),
            total_sentiment_count=Count("id", filter=Q(analysis_result__isnull=False)),
        )
        if sentiment_counts["total_sentiment_count"] > 0:
            sentiment_counts["sentiment_score"] = (
                (5 * sentiment_counts["super_positive_count"])
                + (4 * sentiment_counts["positive_count"])
                + (3 * sentiment_counts["neutral_count"])
                + (2 * sentiment_counts["negative_count"])
                + (1 * sentiment_counts["super_negative_count"])
            ) / sentiment_counts["total_sentiment_count"]
        else:
            sentiment_counts["sentiment_score"] = 0.0

        statistics = {
            "total_conversations": conversations.count(),
            "total_messages": chat_messages.count(),
            **sentiment_counts,
        }
        serializer = AgentDetailSerializer(
            agent_qs.first(), context={"statistics": statistics}
        )
        return ResponseStatus.SUCCESS, serializer.data
