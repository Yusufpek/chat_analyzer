from common.base.base_api_view import BaseAPIView, ResponseStatus
from common.serializers.agent import AgentSerializer
from common.models.agent import Agent
from common.models.connection import Connection


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
        data.update({"connection": connection.id})
        serializer = AgentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return ResponseStatus.SUCCESS, serializer.data
        return ResponseStatus.BAD_REQUEST, serializer.errors
