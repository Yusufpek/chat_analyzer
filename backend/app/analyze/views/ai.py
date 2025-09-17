from common.base.base_api_view import BaseListAPIView, BaseAPIView, ResponseStatus
from analyze.models.statistics import ContextChange
from analyze.serializers.ai import ContextChangeSerializer
from chat.models.conversation import Conversation


class ContextChangeListView(BaseListAPIView):
    serializer_class = ContextChangeSerializer

    def get_queryset(self):
        conversation_qs = Conversation.objects.filter(user=self.request.user)

        if "agent_id" in self.kwargs:
            agent_id = self.kwargs.get("agent_id")
            queryset = conversation_qs.filter(agent_id=agent_id)

        conversation_ids = conversation_qs.values_list("id", flat=True)
        queryset = ContextChange.objects.filter(conversation_id__in=conversation_ids)

        return queryset.order_by("-created_at")


class ContextChangeDetailView(BaseAPIView):
    def get_request(self, request, *args, **kwargs):
        conversation_id = kwargs.get("conversation_id")
        if not conversation_id:
            return ResponseStatus.BAD_REQUEST, {"error": "conversation_id is required"}
        if not Conversation.objects.filter(
            id=conversation_id,
            user=request.user,
        ).exists():
            return ResponseStatus.NOT_FOUND, {"error": "Conversation not found"}

        context_change = ContextChange.objects.filter(
            conversation_id=conversation_id,
        ).first()
        if not context_change:
            return ResponseStatus.NOT_FOUND, {"error": "Context change not found"}

        content = ContextChangeSerializer(context_change).data
        return ResponseStatus.SUCCESS, content
