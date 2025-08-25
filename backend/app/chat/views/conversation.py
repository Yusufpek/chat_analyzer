from django.db.models import Subquery, OuterRef

from common.base.base_api_view import BaseAPIView, BaseListAPIView, ResponseStatus
from chat.serializers.conversation import ChatMessageSerializer, ConversationSerializer
from chat.models.conversation import ChatMessage, Conversation


class ConversationListView(BaseListAPIView):
    """
    API view to list conversations.
    """

    serializer_class = ConversationSerializer

    def get_queryset(self):
        last_message_subquery = (
            ChatMessage.objects.filter(conversation_id=OuterRef("id"))
            .order_by("-created_at")
            .values("content")[:1]
        )

        queryset = Conversation.objects.filter(user=self.request.user).annotate(
            last_message=Subquery(last_message_subquery)
        )
        if "agent_id" in self.kwargs:
            agent_id = self.kwargs.get("agent_id")
            queryset = queryset.filter(agent_id=agent_id)

        return queryset.order_by("-created_at")


class ConversationDetailView(BaseAPIView):
    """
    API view to retrieve a specific conversation by ID.
    """

    def get_request(self, request, *args, **kwargs):
        conversation_id = kwargs.get("conversation_id")
        conversation = Conversation.objects.filter(
            id=conversation_id, user=self.request.user
        ).first()
        if not conversation:
            return ResponseStatus.NOT_FOUND, {"error": "Conversation not found"}
        last_message = (
            ChatMessage.objects.filter(conversation_id=conversation_id)
            .order_by("-created_at")
            .first()
        )
        return ResponseStatus.SUCCESS, ConversationSerializer(
            conversation, context={"last_message": last_message}
        ).data


class ConversationMessagesView(BaseListAPIView):
    """
    API view to retrieve messages for a specific conversation by ID.
    """

    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        return ChatMessage.objects.filter(
            conversation_id=conversation_id, conversation__user=self.request.user
        ).order_by("created_at")
