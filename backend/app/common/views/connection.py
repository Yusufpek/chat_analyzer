import json
from rest_framework.parsers import JSONParser
from django.db import transaction
from django.db.models import Q, Count

from common.base.base_api_view import BaseAPIView, ResponseStatus
from common.serializers.connection import (
    ConnectionSerializer,
    AgentSerializer,
    AgentDetailSerializer,
    FileSourceSerializer,
)
from common.models.connection import Connection, Agent
from chat.utils.file_conversations import (
    get_conversation_messages_from_csv,
    get_conversation_messages_from_json,
)
from chat.utils.jotform_conversation import get_agents
from common.constants.sources import SOURCE_FILE, SOURCE_JOTFORM
from common.utils.jotform_api import JotFormAPIService
from chat.tasks.jotform_tasks import (
    fetch_agent_conversations,
    fetch_jotform_connection_periodic_task,
)
from common.utils.filter_mapper import filter_mapper
from chat.models.conversation import Conversation, ChatMessage
from analyze.tasks.ai_tasks import (
    label_conversations_task,
    setup_label_conversations_periodic_task,
)


class ConnectionView(BaseAPIView):
    def post_request(self, request, *args, **kwargs):
        """
        Handles the creation of a new connection and associated agents.
        """
        data = JSONParser().parse(request)
        data["user"] = request.user.id
        serializer = ConnectionSerializer(data=data)

        if serializer.is_valid():
            conn_type = serializer.validated_data["connection_type"]
            if Connection.objects.filter(
                user=request.user, connection_type=conn_type
            ).exists():
                return ResponseStatus.CONFLICT, {"errors": "Connection already exists."}

            if conn_type == SOURCE_JOTFORM:
                is_valid = JotFormAPIService.check_api_key(data["api_key"])
                if not is_valid:
                    return ResponseStatus.BAD_REQUEST, {"errors": "Invalid API key."}

            connection = serializer.save()

            if connection.connection_type == SOURCE_JOTFORM:
                fetch_jotform_connection_periodic_task(
                    connection.id,
                    connection.sync_interval,
                )

            connection_serializer = ConnectionSerializer(connection)

            return ResponseStatus.CREATED, {
                "content": connection_serializer.data,
            }
        return ResponseStatus.BAD_REQUEST, {"errors": serializer.errors}

    def delete_request(self, request, *args, **kwargs):
        connection_type = kwargs.get("connection_type")
        connection = Connection.objects.filter(
            connection_type=connection_type, user=request.user
        ).first()
        if not connection:
            return ResponseStatus.NOT_FOUND, {"errors": "Connection not found."}
        try:
            with transaction.atomic():
                agent_ids = Agent.objects.filter(connection=connection).values_list(
                    "id", flat=True
                )
                ChatMessage.objects.filter(
                    conversation__agent_id__in=agent_ids
                ).delete()
                Conversation.objects.filter(agent_id__in=agent_ids).delete()
                Agent.objects.filter(id__in=agent_ids).delete()
                connection.delete()
            return ResponseStatus.SUCCESS, {
                "message": "Connection deleted successfully with all associated data."
            }
        except Exception as e:
            return ResponseStatus.BAD_REQUEST, {"errors": str(e)}

    def put_request(self, request, *args, **kwargs):
        data = JSONParser().parse(request)
        conn_type = kwargs.get("connection_type")
        connection = Connection.objects.filter(
            connection_type=conn_type,
            api_key=data.get("api_key"),
            user=request.user,
        ).first()
        if not connection:
            return ResponseStatus.NOT_FOUND, {"errors": "Connection not found."}

        if "connection_type" in data and conn_type != data["connection_type"]:
            return ResponseStatus.BAD_REQUEST, {
                "errors": "Connection type cannot be changed."
            }

        serializer = ConnectionSerializer(connection, data=data, partial=True)
        if serializer.is_valid():
            if (
                "connection_type" in data
                and data["connection_type"] != connection.connection_type
            ):
                return ResponseStatus.BAD_REQUEST, {
                    "errors": "Connection type cannot be changed."
                }
            serializer.save()
            if connection.connection_type == SOURCE_JOTFORM:
                fetch_jotform_connection_periodic_task(
                    connection.id,
                    connection.sync_interval,
                )
            return ResponseStatus.ACCEPTED, serializer.data
        return ResponseStatus.BAD_REQUEST, {"errors": serializer.errors}


class FileSourceView(BaseAPIView):
    def post_request(self, request, *args, **kwargs):
        """
        Handles the creation of a new file source connection.
        """
        serializer = FileSourceSerializer(data=request.data)

        if serializer.is_valid():
            file = serializer.validated_data.pop("file")

            try:
                with transaction.atomic():
                    conn, _ = Connection.objects.get_or_create(
                        user=request.user,
                        connection_type=SOURCE_FILE,
                    )

                    if Agent.objects.filter(
                        name=serializer.validated_data["agent_name"]
                    ).exists():
                        return ResponseStatus.CONFLICT, {
                            "errors": "Agent with this name already exists."
                        }
                    agent = Agent.objects.create(
                        name=serializer.validated_data["agent_name"],
                        avatar_url=serializer.validated_data.get(
                            "agent_avatar_url", ""
                        ),
                        connection=conn,
                    )

                    if file.name.endswith(".csv"):
                        file_content = file.read()
                        get_conversation_messages_from_csv(
                            user=request.user,
                            csv_data=file_content,
                            agent_id=agent.id,
                        )
                    else:
                        json_data = file.read().decode("utf-8")
                        get_conversation_messages_from_json(
                            user=request.user,
                            json_data=json.loads(json_data),
                            agent_id=agent.id,
                        )
            except Exception as e:
                return ResponseStatus.BAD_REQUEST, {"errors": str(e)}

            return ResponseStatus.CREATED, AgentSerializer(agent).data
        return ResponseStatus.BAD_REQUEST, {"errors": serializer.errors}


class AgentView(BaseAPIView):
    def get_request(self, request, *args, **kwargs):
        """
        Fetches all JotForm agent IDs for the authenticated user.
        """
        agents = Agent.objects.filter(connection__user=request.user)
        if kwargs.get("connection_type"):
            connection_type = kwargs.get("connection_type")
            if not Connection.objects.filter(
                user=request.user,
                connection_type=connection_type,
            ).exists():
                return ResponseStatus.NOT_FOUND, {"error": "Connection not found."}

            agents = agents.filter(connection__connection_type=connection_type)
            if not agents:
                return ResponseStatus.NOT_FOUND, {"error": "Agents not found."}

        serializer = AgentSerializer(agents, many=True)
        return ResponseStatus.SUCCESS, serializer.data

    def post_request(self, request, *args, **kwargs):
        """
        Creates a new JotForm agent ID for the authenticated user.
        """
        connection = Connection.objects.filter(
            user=request.user,
            connection_type=SOURCE_JOTFORM,
        ).first()
        if not connection:
            return ResponseStatus.BAD_REQUEST, {
                "error": "No JotForm connection found for user."
            }
        data = request.data.copy()
        for agent in data["agents"]:
            agent["connection"] = connection.id
        serializer = AgentSerializer(data=data["agents"], many=True)
        if serializer.is_valid():
            serializer.save()
            for agent in serializer.validated_data:
                fetch_agent_conversations.delay_on_commit(agent_id=agent["id"])
                if agent["label_choices"]:
                    setup_label_conversations_periodic_task.delay_on_commit(
                        agent_id=agent["id"],
                        sync_interval=connection.sync_interval,
                    )
            return ResponseStatus.SUCCESS, serializer.data
        return ResponseStatus.BAD_REQUEST, serializer.errors

    def delete_request(self, request, *args, **kwargs):
        """
        Deletes a JotForm agent ID for the authenticated user.
        """
        agent_id = kwargs.get("agent_id")
        agent = Agent.objects.filter(id=agent_id, connection__user=request.user).first()
        if not agent:
            return ResponseStatus.NOT_FOUND, {"error": "Agent not found."}
        try:
            with transaction.atomic():
                conversation_ids = Conversation.objects.filter(
                    agent_id=agent.id
                ).values_list("id", flat=True)
                ChatMessage.objects.filter(
                    conversation_id__in=conversation_ids
                ).delete()
                Conversation.objects.filter(id__in=conversation_ids).delete()
                agent.delete()
            return ResponseStatus.SUCCESS, {"message": "Agent deleted successfully."}
        except Exception as e:
            return ResponseStatus.BAD_REQUEST, {"error": str(e)}

    def put_request(self, request, *args, **kwargs):
        agent_id = kwargs.get("agent_id")
        agent = Agent.objects.filter(id=agent_id, connection__user=request.user).first()
        if not agent:
            return ResponseStatus.NOT_FOUND, {"error": "Agent not found."}
        data = request.data.copy()
        if "id" in data and str(data["id"]) != str(agent_id):
            return ResponseStatus.BAD_REQUEST, {"error": "Agent ID cannot be changed."}
        if "connection" in data and data["connection"] != agent.connection.id:
            return ResponseStatus.BAD_REQUEST, {
                "error": "Connection cannot be changed."
            }
        serializer = AgentSerializer(agent, data=data, partial=True)
        if serializer.is_valid():
            if agent.label_choices != serializer.validated_data.get("label_choices"):
                label_conversations_task.delay_on_commit(
                    agent_id=agent.id,
                    label_all=True,
                )

            if "label_choices" in serializer.validated_data:
                setup_label_conversations_periodic_task(
                    agent_id=agent.id,
                    sync_interval=agent.connection.sync_interval,
                )
            serializer.save()
            return ResponseStatus.ACCEPTED, serializer.data
        return ResponseStatus.BAD_REQUEST, {"errors": serializer.errors}


class AgentDetailView(BaseAPIView):
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
        agent_qs = Agent.objects.filter(id=agent_id, connection__user=request.user)
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


class JotFormAgentView(BaseAPIView):
    def get_request(self, request, *args, **kwargs):
        """
        Fetches all JotForm agent IDs for the authenticated user.
        """
        try:
            jotform_service = JotFormAPIService(user=request.user)
            unsynced_agents = get_agents(jotform_service)
            unsynced_agents = AgentSerializer(unsynced_agents, many=True).data
            agents = Agent.objects.filter(
                connection__user=request.user,
                connection__connection_type=SOURCE_JOTFORM,
            )
            content = {
                "unsynced": unsynced_agents,
                "synced": AgentSerializer(agents, many=True).data,
            }
            return ResponseStatus.SUCCESS, content
        except Exception as e:
            return ResponseStatus.BAD_REQUEST, {"error": str(e)}
