from django.urls import path

from chat.views.conversation import ConversationDetailAPIView, ConversationListAPIView

conversation_urlpatterns = [
    path(
        "conversations/",
        ConversationListAPIView.as_view(),
        name="conversation_list_api_url",
    ),
    path(
        "conversations/<slug:chat_id>/",
        ConversationDetailAPIView.as_view(),
        name="conversation_detail_api_url",
    ),
]
