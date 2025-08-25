from django.urls import path

from chat.views.conversation import (
    ConversationMessagesView,
    ConversationListView,
    ConversationDetailView,
)

conversation_urlpatterns = [
    path(
        "conversations/",
        ConversationListView.as_view(),
        name="conversation_list_api_url",
    ),
    path(
        "conversations/<slug:agent_id>",
        ConversationListView.as_view(),
        name="conversation_list_api_url",
    ),
    path(
        "conversation/<slug:conversation_id>/",
        ConversationDetailView.as_view(),
        name="conversation_detail_api_url",
    ),
    path(
        "conversation/<slug:conversation_id>/messages/",
        ConversationMessagesView.as_view(),
        name="conversation_messages_api_url",
    ),
]
