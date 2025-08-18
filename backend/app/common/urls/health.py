from django.urls import path

from common.views.health import (
    JotFormApiChatCheckView,
    PingView,
    JotFormApiCheckView,
)

health_urlpatterns = [
    path("ping/", PingView.as_view(), name="ping"),
    path("jotform-api/", JotFormApiCheckView.as_view(), name="jotform_api_check"),
    path(
        "jotform-api/<agent_id>/chat/<chat_id>/",
        JotFormApiChatCheckView.as_view(),
        name="jotform_api_chat_check",
    ),
]
