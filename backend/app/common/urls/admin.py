from django.urls import path

from common.views.admin import (
    AdminConnectionView,
    AdminAgentView,
    AdminAgentDetailView,
)

admin_urlpatterns = [
    path(
        "admin/connections/",
        AdminConnectionView.as_view(),
        name="connection_api_url",
    ),
    path(
        "admin/connections/<slug:connection_type>/",
        AdminConnectionView.as_view(),
        name="connection_api_url",
    ),
    path(
        "admin/agents/",
        AdminAgentView.as_view(),
        name="agent_api_url",
    ),
    path(
        "admin/agents/<slug:agent_id>/",
        AdminAgentView.as_view(),
        name="agent_api_url",
    ),
    path(
        "admin/agents/<slug:agent_id>/details",
        AdminAgentDetailView.as_view(),
        name="agent_api_url",
    ),
    path(
        "admin/connections/<slug:connection_type>/agent/",
        AdminAgentView.as_view(),
        name="agent_api_url",
    ),
]
