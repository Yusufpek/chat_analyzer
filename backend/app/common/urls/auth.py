from django.urls import path

from common.views.auth import (
    UserRegisterView,
    LoginView,
    LogoutView,
    LoginRefreshView,
    UserDetailView,
)

auth_urlpatterns = [
    path("auth/user/", UserDetailView.as_view(), name="user_detail_api_url"),
    path("auth/register/", UserRegisterView.as_view(), name="register_api_url"),
    path("auth/login/", LoginView.as_view(), name="login_api_url"),
    path("auth/logout/", LogoutView.as_view(), name="logout_api_url"),
    path("auth/refresh/", LoginRefreshView.as_view(), name="refresh_api_url"),
]
