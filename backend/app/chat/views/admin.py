from django.db.models import Subquery, OuterRef
from rest_framework.permissions import IsAdminUser

from common.base.base_api_view import BaseAPIView, BaseListAPIView, ResponseStatus
from chat.serializers.conversation import ChatMessageSerializer, ConversationSerializer
from chat.models.conversation import ChatMessage, Conversation


class AdminConversationListView(BaseListAPIView):
    """
    API view to list conversations.
    """

    permission_classes = [IsAdminUser]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        last_message_subquery = (
            ChatMessage.objects.filter(conversation_id=OuterRef("id"))
            .order_by("-created_at")
            .values("content")[:1]
        )

        queryset = Conversation.objects.annotate(
            last_message=Subquery(last_message_subquery)
        )
        if "agent_id" in self.kwargs:
            agent_id = self.kwargs.get("agent_id")
            queryset = queryset.filter(agent_id=agent_id)

        return queryset.order_by("-created_at")


class AdminConversationDetailView(BaseAPIView):
    """
    API view to retrieve a specific conversation by ID.
    """

    permission_classes = [IsAdminUser]

    def get_request(self, request, *args, **kwargs):
        conversation_id = kwargs.get("conversation_id")
        conversation = Conversation.objects.filter(id=conversation_id).first()
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


class AdminConversationMessagesView(BaseListAPIView):
    """
    API view to retrieve messages for a specific conversation by ID.
    """

    permission_classes = [IsAdminUser]
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        return ChatMessage.objects.filter(
            conversation_id=conversation_id, conversation__user=self.request.user
        ).order_by("created_at")
