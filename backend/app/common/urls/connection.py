from django.urls import path

from common.views.connection import ConnectionView

connection_urlpatterns = [
    path(
        "connection/",
        ConnectionView.as_view(),
        name="connection_api_url",
    ),
]
