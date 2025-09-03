from common.base.base_api_view import BaseAPIView, ResponseStatus
from analyze.utils.search_helper import search_agent_with_qdrant, get_grouped_messages
from analyze.models.statistics import GroupedMessages
from common.models.connection import Agent


class QDrantSearchView(BaseAPIView):
    def post_request(self, request, *args, **kwargs):
        if not request.data:
            return ResponseStatus.BAD_REQUEST, {
                "error": "agent_id and query are required"
            }

        agent_id = request.data.get("agent_id")
        query = request.data.get("query")

        if not agent_id or not query:
            return (
                ResponseStatus.BAD_REQUEST,
                {"error": "agent_id and query are required"},
            )

        agent = Agent.objects.filter(id=agent_id, connection__user=request.user).first()
        if not agent:
            return ResponseStatus.NOT_FOUND, {"error": "Agent not found"}

        status, data = search_agent_with_qdrant(agent_id, query)
        if not status:
            return ResponseStatus.INTERNAL_SERVER_ERROR, {"error": data}
        return ResponseStatus.SUCCESS, data


class QDrantGroupedView(BaseAPIView):
    def get_request(self, request, *args, **kwargs):
        agent_id = kwargs.get("agent_id")
        if not agent_id:
            return ResponseStatus.BAD_REQUEST, {"error": "agent_id is required"}

        agent = Agent.objects.filter(id=agent_id, connection__user=request.user).first()
        if not agent:
            return ResponseStatus.NOT_FOUND, {"error": "Agent not found"}

        grouped_messages = GroupedMessages.objects.filter(agent_id=agent_id).first()
        if not grouped_messages:
            status, data = get_grouped_messages(agent_id, sender_type="user")
            if not status:
                return ResponseStatus.INTERNAL_SERVER_ERROR, {"error": data}
            grouped_messages = GroupedMessages.objects.create(
                agent_id=agent_id,
                messages=data,
            )

        return ResponseStatus.SUCCESS, grouped_messages.messages
