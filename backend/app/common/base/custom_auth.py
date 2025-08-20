from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings


class CustomAuthentication(JWTAuthentication):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def authenticate(self, request):
        token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])
        if token is None:
            return None

        validated_token = self.get_validated_token(token)
        return self.get_user(validated_token), validated_token
