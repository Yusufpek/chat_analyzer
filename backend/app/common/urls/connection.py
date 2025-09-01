from django.urls import path

from common.views.connection import (
    ConnectionView,
    AgentView,
    AgentDetailView,
    FileSourceView,
    JotFormAgentView,
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
        AgentView.as_view(),
        name="agent_api_url",
    ),
    path(
        "agent/<slug:agent_id>/",
        AgentView.as_view(),
        name="agent_api_url",
    ),
    path(
        "agent/<slug:agent_id>/details",
        AgentDetailView.as_view(),
        name="agent_api_url",
    ),
    path(
        "connection/<slug:connection_type>/agent/",
        AgentView.as_view(),
        name="agent_api_url",
    ),
    path(
        "jotform/agents/",
        JotFormAgentView.as_view(),
        name="jotform_agent_api_url",
    ),
]
