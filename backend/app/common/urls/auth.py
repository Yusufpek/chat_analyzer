from django.urls import path

from common.views.auth import (
    UserRegisterAPIView,
    LoginView,
    LogoutView,
    LoginRefreshView,
)

auth_urlpatterns = [
    path("auth/register/", UserRegisterAPIView.as_view(), name="register_api_url"),
    path("auth/login/", LoginView.as_view(), name="login_api_url"),
    path("auth/logout/", LogoutView.as_view(), name="logout_api_url"),
    path("auth/refresh/", LoginRefreshView.as_view(), name="refresh_api_url"),
]
