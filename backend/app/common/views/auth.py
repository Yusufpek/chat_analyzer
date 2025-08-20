from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from django.conf import settings

from common.base.base_api_view import BaseAPIView, ResponseStatus
from common.serializers.user import (
    UserSerializer,
    UserLoginSerializer,
)


class UserRegisterAPIView(BaseAPIView):
    """
    An endpoint for the client to create a new User.
    """

    permission_classes = []
    serializer_class = UserSerializer

    def post_request(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh": str(token), "access": str(token.access_token)}
        return ResponseStatus.ACCEPTED, {"content": data}


class LoginView(BaseAPIView):
    """
    An endpoint for the client to log in and receive a JWT token.
    """

    permission_classes = []
    serializer_class = UserLoginSerializer

    def post_request(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        serializer = UserLoginSerializer(user)
        token = RefreshToken.for_user(user)
        data = serializer.data
        auth_cookie = {
            "action": "set",
            "key": settings.SIMPLE_JWT["AUTH_COOKIE"],
            "value": str(token.access_token),
            "expires": settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            "secure": settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            "httponly": settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            "samesite": settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        }
        refresh_cookie = {
            "action": "set",
            "key": settings.SIMPLE_JWT["AUTH_COOKIE"] + "_refresh",
            "value": str(token),
            "expires": settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
            "secure": settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            "httponly": settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            "samesite": settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        }
        data["cookies"] = [auth_cookie, refresh_cookie]
        return ResponseStatus.SUCCESS, data


class UserDetailView(BaseAPIView):
    """
    An endpoint to retrieve the details of the authenticated user.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_request(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(user)
        return ResponseStatus.SUCCESS, {"content": serializer.data}


class LoginRefreshView(BaseAPIView):
    """
    An endpoint for refreshing JWT tokens using the refresh token from cookies.
    """

    serializer_class = TokenRefreshSerializer

    def post_request(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get(
                settings.SIMPLE_JWT["AUTH_COOKIE"] + "_refresh"
            )
            if not refresh_token:
                return ResponseStatus.BAD_REQUEST, {
                    "error": "Refresh token not found in cookies."
                }

            data = {"refresh": refresh_token}
            serializer = self.get_serializer(data=data)

            if serializer.is_valid(raise_exception=True):
                data = serializer.validated_data

                cookies = [
                    {
                        "action": "set",
                        "key": settings.SIMPLE_JWT["AUTH_COOKIE"],
                        "value": data["access"],
                        "expires": settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                        "secure": settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                        "httponly": settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                        "samesite": settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                    },
                    {
                        "action": "set",
                        "key": settings.SIMPLE_JWT["AUTH_COOKIE"] + "_refresh",
                        "value": data["refresh"],
                        "expires": settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                        "secure": settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                        "httponly": settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                        "samesite": settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                    },
                ]
                data = {
                    "message": "Tokens refreshed successfully.",
                    "cookies": cookies,
                }
                return ResponseStatus.SUCCESS, data

            return ResponseStatus.BAD_REQUEST, {
                "error": "Invalid refresh token not found."
            }

        except Exception as e:
            print(f"Error during token refresh: {str(e)}")
            return ResponseStatus.BAD_REQUEST, {"error": str(e)}


class LogoutView(BaseAPIView):
    """
    An endpoint for logging out a user by blacklisting the refresh token.
    """

    permission_classes = [IsAuthenticated]

    def post_request(self, request):
        try:
            refresh_token = request.COOKIES.get(
                settings.SIMPLE_JWT["AUTH_COOKIE"] + "_refresh"
            )
            if not refresh_token:
                return ResponseStatus.BAD_REQUEST, {
                    "error": "Refresh token not found in cookies."
                }

            token = RefreshToken(refresh_token)
            token.blacklist()

            cookies = [
                {
                    "action": "delete",
                    "key": settings.SIMPLE_JWT["AUTH_COOKIE"],
                },
                {
                    "action": "delete",
                    "key": settings.SIMPLE_JWT["AUTH_COOKIE"] + "_refresh",
                },
            ]

            return ResponseStatus.SUCCESS, {
                "detail": "Successfully logged out.",
                "cookies": cookies,
            }
        except Exception as e:
            if isinstance(e, KeyError):
                return ResponseStatus.BAD_REQUEST, {"error": "Refresh token required."}
            elif isinstance(e, InvalidToken):
                return ResponseStatus.BAD_REQUEST, {
                    "error": "Invalid or expired token."
                }
            else:
                return ResponseStatus.BAD_REQUEST, {"error": str(e)}
