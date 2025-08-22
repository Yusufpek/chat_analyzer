from django.urls import path

from common.views.connection import (
    ConnectionView,
    AgentAPIView,
    FileSourceView,
    JotFormAgentAPIView,
)

connection_urlpatterns = [
    path(
        "connection/",
        ConnectionView.as_view(),
        name="connection_api_url",
    ),
    path(
        "connection/<slug:connection_type>/",
        ConnectionView.as_view(),
        name="connection_api_url",
    ),
    path(
        "file/connection/",
        FileSourceView.as_view(),
        name="file_source_api_url",
    ),
    path(
        "agent/",
        AgentAPIView.as_view(),
        name="agent_api_url",
    ),
    path(
        "agent/<slug:agent_id>/",
        AgentAPIView.as_view(),
        name="agent_api_url",
    ),
    path(
        "jotform/agents/",
        JotFormAgentAPIView.as_view(),
        name="jotform_agent_api_url",
    ),
]
