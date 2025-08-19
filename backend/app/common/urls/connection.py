from django.urls import path

from common.views.connection import ConnectionView, AgentAPIView

connection_urlpatterns = [
    path(
        "connection/",
        ConnectionView.as_view(),
        name="connection_api_url",
    ),
    path(
        "agent/",
        AgentAPIView.as_view(),
        name="agent_api_url",
    ),
]
