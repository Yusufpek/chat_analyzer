from django.urls import path

from common.views.agent import AgentAPIView

agent_urlpatterns = [
    path(
        "agent/",
        AgentAPIView.as_view(),
        name="agent_api_url",
    ),
]
