from django.urls import path

from common.views.health import (
    JotFormApiChatCheckView,
    PingView,
    JotFormApiCheckView,
    JotFormApiAgentCheckView,
)

health_urlpatterns = [
    path("ping/", PingView.as_view(), name="ping"),
    path("jotform-api/", JotFormApiCheckView.as_view(), name="jotform_api_check"),
    path(
        "jotform-api/agents/",
        JotFormApiAgentCheckView.as_view(),
        name="jotform_api_agent_check",
    ),
    path(
        "jotform-api/chat/",
        JotFormApiChatCheckView.as_view(),
        name="jotform_api_chat_check",
    ),
]
