from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.views import TokenRefreshView

from common.base.base_api_view import BaseAPIView, ResponseStatus
from common.serializers.user import UserRegisterSerializer, UserLoginSerializer


class UserRegisterAPIView(BaseAPIView):
    """
    An endpoint for the client to create a new User.
    """

    permission_classes = []
    serializer_class = UserRegisterSerializer

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
        data["tokens"] = {"refresh": str(token), "access": str(token.access_token)}
        return ResponseStatus.SUCCESS, data

    def clear_payload(self, request):
        del request.data["password"]


class UserDetailView(BaseAPIView):
    """
    An endpoint to retrieve the details of the authenticated user.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserRegisterSerializer

    def get_request(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(user)
        return ResponseStatus.SUCCESS, {"content": serializer.data}


class LoginRefreshView(TokenRefreshView):
    """
    An endpoint for refreshing JWT tokens.
    """

    permission_classes = []
    pass


class LogoutView(BaseAPIView):
    """
    An endpoint for logging out a user by blacklisting the refresh token.
    """

    permission_classes = [IsAuthenticated]

    def post_request(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return ResponseStatus.SUCCESS, {"detail": "Successfully logged out."}
        except Exception as e:
            if isinstance(e, KeyError):
                return ResponseStatus.BAD_REQUEST, {"error": "Refresh token required."}
            elif isinstance(e, InvalidToken):
                return ResponseStatus.BAD_REQUEST, {
                    "error": "Invalid or expired token."
                }
            else:
                return ResponseStatus.BAD_REQUEST, {"error": str(e)}
