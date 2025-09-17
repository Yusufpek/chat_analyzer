from django.urls import path

from analyze.views.ai import (
    ContextChangeListView,
    ContextChangeDetailView,
)

ai_urlpatterns = [
    path(
        "context_change/",
        ContextChangeListView.as_view(),
        name="context_change_list_api_url",
    ),
    path(
        "context_change/<slug:agent_id>/",
        ContextChangeListView.as_view(),
        name="context_change_list_api_url",
    ),
    path(
        "context_change/<slug:conversation_id>/details/",
        ContextChangeDetailView.as_view(),
        name="context_change_detail_api_url",
    ),
]
