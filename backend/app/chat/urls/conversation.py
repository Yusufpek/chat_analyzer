from django.urls import path

from chat.views.conversation import (
    ConversationMessagesAPIView,
    ConversationListAPIView,
    ConversationDetailAPIView,
)

conversation_urlpatterns = [
    path(
        "conversations/",
        ConversationListAPIView.as_view(),
        name="conversation_list_api_url",
    ),
    path(
        "conversations/<slug:agent_id>",
        ConversationListAPIView.as_view(),
        name="conversation_list_api_url",
    ),
    path(
        "conversation/<slug:conversation_id>/",
        ConversationDetailAPIView.as_view(),
        name="conversation_detail_api_url",
    ),
    path(
        "conversation/<slug:conversation_id>/messages/",
        ConversationMessagesAPIView.as_view(),
        name="conversation_messages_api_url",
    ),
]
