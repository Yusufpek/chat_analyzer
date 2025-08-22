import json
from rest_framework.parsers import JSONParser
from django.db import transaction
from django.core.management import call_command

from common.base.base_api_view import BaseAPIView, ResponseStatus
from common.serializers.connection import (
    ConnectionSerializer,
    AgentSerializer,
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
from chat.models.conversation import Conversation, ChatMessage


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

            is_valid = JotFormAPIService.check_api_key(data["api_key"])
            if not is_valid:
                return ResponseStatus.BAD_REQUEST, {"errors": "Invalid API key."}

            connection = serializer.save()

            # Serialize the connection and agents
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
        connection = Connection.objects.filter(
            connection_type=data.get("connection_type"),
            api_key=data.get("api_key"),
            user=request.user,
        ).first()
        if not connection:
            return ResponseStatus.NOT_FOUND, {"errors": "Connection not found."}

        serializer = ConnectionSerializer(connection, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
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

            return ResponseStatus.CREATED, {"content": AgentSerializer(agent).data}
        return ResponseStatus.BAD_REQUEST, {"errors": serializer.errors}


class AgentAPIView(BaseAPIView):
    def get_request(self, request, *args, **kwargs):
        """
        Fetches all JotForm agent IDs for the authenticated user.
        """
        agents = Agent.objects.filter(connection__user=request.user)
        serializer = AgentSerializer(agents, many=True)
        return ResponseStatus.SUCCESS, serializer.data

    def post_request(self, request, *args, **kwargs):
        """
        Creates a new JotForm agent ID for the authenticated user.
        """
        connection = Connection.objects.filter(
            user=request.user, connection_type="jotform"
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
                call_command(
                    "fetch_jotform_agent_conversations",
                    agent_id=agent["id"],
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
            serializer.save()
            return ResponseStatus.ACCEPTED, serializer.data
        return ResponseStatus.BAD_REQUEST, {"errors": serializer.errors}


class JotFormAgentAPIView(BaseAPIView):
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
