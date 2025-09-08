from django.urls import path

from chat.views.admin import (
    AdminConversationMessagesView,
    AdminConversationListView,
    AdminConversationDetailView,
)

admin_urlpatterns = [
    path(
        "admin/conversations/",
        AdminConversationListView.as_view(),
        name="conversation_list_api_url",
    ),
    path(
        "admin/conversations/<slug:agent_id>",
        AdminConversationListView.as_view(),
        name="conversation_list_api_url",
    ),
    path(
        "admin/conversation/<slug:conversation_id>/",
        AdminConversationDetailView.as_view(),
        name="conversation_detail_api_url",
    ),
    path(
        "admin/conversation/<slug:conversation_id>/messages/",
        AdminConversationMessagesView.as_view(),
        name="conversation_messages_api_url",
    ),
]
