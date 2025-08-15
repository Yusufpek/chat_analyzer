from common.base.base_api_view import BaseAPIView, BaseListAPIView, ResponseStatus
from chat.serializers.conversation import ChatMessageSerializer
from chat.models.conversation import ChatMessage


class ConversationListAPIView(BaseAPIView):
    """
    API view to list conversations.
    """

    def get_request(self, request):
        # Logic to retrieve and return conversations
        # This is a placeholder implementation
        return ResponseStatus.SUCCESS, {"conversations": []}


class ConversationDetailAPIView(BaseListAPIView):
    """
    API view to retrieve a specific conversation by ID.
    """

    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        chat_id = self.kwargs.get("chat_id")
        return ChatMessage.objects.filter(conversation_id=chat_id).order_by(
            "created_at"
        )
