from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import BasicAuthentication


from common.base.base_api_view import BaseAPIView
from common.base.response import ResponseStatus

from common.utils.jotform_api import JotFormAPIService


class PingView(BaseAPIView):
    def get_request(self, request):
        return ResponseStatus.SUCCESS, {"message": "pong"}


class JotFormApiCheckView(BaseAPIView):
    authentication_classes = [BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get_request(self, request):
        try:
            service = JotFormAPIService(request.user)
        except Exception as e:
            return ResponseStatus.BAD_REQUEST, {
                "message": "Error initializing JotForm API service",
                "error": str(e),
            }

        response_code, content = service.get_user_details()
        if response_code == 100:
            return (
                ResponseStatus.BAD_REQUEST,
                content,
            )
        return ResponseStatus.SUCCESS, {
            "message": "JotForm API is reachable"
            if response_code == 200
            else "JotForm API is not reachable",
            "content": content,
        }


class JotFormApiAgentCheckView(BaseAPIView):
    authentication_classes = [BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get_request(self, request):
        try:
            service = JotFormAPIService(request.user)
        except Exception as e:
            return ResponseStatus.BAD_REQUEST, {
                "message": "Error initializing JotForm API service",
                "error": str(e),
            }

        response_code, content = service.get_agents()
        if response_code == 100:
            return (
                ResponseStatus.BAD_REQUEST,
                content,
            )
        return ResponseStatus.SUCCESS, {
            "message": "JotForm API is reachable"
            if response_code == 200
            else "JotForm API is not reachable",
            "content": content,
        }


class JotFormApiChatCheckView(BaseAPIView):
    authentication_clasdses = [BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get_request(self, request):
        try:
            service = JotFormAPIService(request.user)
        except Exception as e:
            return ResponseStatus.BAD_REQUEST, {
                "message": "Error initializing JotForm API service",
                "error": str(e),
            }

        response_code, content = service.get_chat_history()
        if response_code == 100:
            return (
                ResponseStatus.BAD_REQUEST,
                content,
            )
        return ResponseStatus.SUCCESS, {
            "message": "JotForm API is reachable"
            if response_code == 200
            else "JotForm API is not reachable",
            "content": content,
        }
