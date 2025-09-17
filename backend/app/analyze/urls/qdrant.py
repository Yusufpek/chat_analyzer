from django.urls import path

from analyze.views.qdrant import (
    QDrantSearchView,
    QDrantGroupedView,
)

qdrant_urlpatterns = [
    path(
        "qdrant_search/",
        QDrantSearchView.as_view(),
        name="qdrant_search_api_url",
    ),
    path(
        "qdrant_grouped/<slug:agent_id>/",
        QDrantGroupedView.as_view(),
        name="qdrant_grouped_api_url",
    ),
]
