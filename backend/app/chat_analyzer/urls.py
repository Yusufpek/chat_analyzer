from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("common.urls")),
    path("api/chat/", include("chat.urls")),
    path("api/analyze/", include("analyze.urls")),
]
