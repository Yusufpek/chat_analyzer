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
        "connection/file-source/",
        FileSourceView.as_view(),
        name="file_source_api_url",
    ),
    path(
        "agent/",
        AgentAPIView.as_view(),
        name="agent_api_url",
    ),
    path(
        "jotform/agents/",
        JotFormAgentAPIView.as_view(),
        name="jotform_agent_api_url",
    ),
    path(
        "jotform/agents/<slug:option>/",
        JotFormAgentAPIView.as_view(),
        name="jotform_agent_api_url",
    ),
]
