from common.base.base_api_view import BaseAPIView
from common.base.response import ResponseStatus

from common.utils.jotform_api import JotFormAPIService


class PingView(BaseAPIView):
    """
    Simple ping view to check if the service is up.
    """

    authentication_classes = []
    permission_classes = []

    def get_request(self, request):
        return ResponseStatus.SUCCESS, {"message": "pong"}


class JotFormApiCheckView(BaseAPIView):
    """
    Check the status of the JotForm API.
    """

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


class JotFormApiChatCheckView(BaseAPIView):
    """
    Check the chat history of a specific chat in JotForm API.
    """

    def get_request(self, request, *args, **kwargs):
        agent_id = kwargs.get("agent_id")
        if not agent_id:
            return ResponseStatus.BAD_REQUEST, {"error": "Agent ID is required."}
        chat_id = kwargs.get("chat_id")
        if not chat_id:
            return ResponseStatus.BAD_REQUEST, {"error": "Chat ID is required."}
        try:
            service = JotFormAPIService(request.user)
        except Exception as e:
            return ResponseStatus.BAD_REQUEST, {
                "message": "Error initializing JotForm API service",
                "error": str(e),
            }

        response_code, content = service.get_chat_history(agent_id, chat_id)
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
