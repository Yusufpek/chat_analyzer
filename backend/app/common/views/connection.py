import json
from rest_framework.parsers import JSONParser
from django.db import transaction

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
from chat.tasks.jotform_tasks import (
    fetch_agent_conversations,
    fetch_jotform_connection_periodic_task,
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

    def put_request(self, request, *args, **kwargs):
        data = JSONParser().parse(request)
        print(data)
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
            return ResponseStatus.SUCCESS, serializer.data
        return ResponseStatus.BAD_REQUEST, serializer.errors


class JotFormAgentAPIView(BaseAPIView):
    def get_request(self, request, *args, **kwargs):
        """
        Fetches all JotForm agent IDs for the authenticated user.
        """
        try:
            content = {}

            if "option" in kwargs:
                option = kwargs["option"]
                if option not in ["unsynced", "synced"]:
                    return ResponseStatus.BAD_REQUEST, {"error": "Invalid option."}

                if option == "synced":
                    agents = Agent.objects.filter(
                        connection__user=request.user,
                        connection__connection_type=SOURCE_JOTFORM,
                    )
                    content = AgentSerializer(agents, many=True).data

                elif option == "unsynced":
                    jotform_service = JotFormAPIService(user=request.user)
                    unsynced_agents = get_agents(jotform_service)
                    content = AgentSerializer(unsynced_agents, many=True).data
            else:
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
