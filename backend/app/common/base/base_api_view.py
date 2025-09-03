from datetime import datetime
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .custom_auth import CustomAuthentication

from .response import ResponseStatus, get_status_to_response, code_to_status


class BaseAPIView(generics.GenericAPIView):
    """
    Base API view with common functionality.
    """

    authentication_classes = [CustomAuthentication]
    permission_classes = [IsAuthenticated]

    def delete_request(self, request, *args, **kwargs) -> dict:
        """
        Handles DELETE requests.
        """
        return ResponseStatus.BAD_REQUEST, {"message": "Delete request not implemented"}

    def get_request(self, request, *args, **kwargs) -> dict:
        """
        Handles GET requests.
        """
        return ResponseStatus.BAD_REQUEST, {"message": "Get request not implemented"}

    def post_request(self, request, *args, **kwargs) -> dict:
        """
        Handles POST requests.
        """
        return ResponseStatus.BAD_REQUEST, {"message": "Post request not implemented"}

    def put_request(self, request, *args, **kwargs) -> dict:
        """
        Handles PUT requests.
        """
        return ResponseStatus.BAD_REQUEST, {"error": "Put request not implemented"}

    def get(self, request, *args, **kwargs):
        start = datetime.now()
        response_status, content = self.get_request(request, *args, **kwargs)
        duration = (datetime.now() - start).total_seconds() * 1000
        return get_status_to_response(response_status, content, duration)

    def delete(self, request, *args, **kwargs):
        start = datetime.now()
        response_status, content = self.delete_request(request, *args, **kwargs)
        duration = (datetime.now() - start).total_seconds() * 1000
        return get_status_to_response(response_status, content, duration)

    def post(self, request, *args, **kwargs):
        start = datetime.now()
        response_status, content = self.post_request(request, *args, **kwargs)
        cookies = []
        if "cookies" in content:
            cookies = content.pop("cookies", [])
        duration = (datetime.now() - start).total_seconds() * 1000
        return get_status_to_response(
            response_status,
            content,
            duration,
            cookies=cookies,
        )

    def put(self, request, *args, **kwargs):
        start = datetime.now()
        response_status, content = self.put_request(request, *args, **kwargs)
        duration = (datetime.now() - start).total_seconds() * 1000
        return get_status_to_response(response_status, content, duration)


class BaseListAPIView(generics.ListAPIView):
    """
    Base List API view with common functionality.
    """

    def get_request(self, request) -> dict:
        return ResponseStatus.SUCCESS, {"message": "List retrieved successfully"}

    def get(self, request, *args, **kwargs):
        start = datetime.now()
        response = self.list(request, *args, **kwargs)
        duration = (datetime.now() - start).total_seconds() * 1000

        status = get_status_to_response(
            code_to_status(response.status_code),
            response.data,
            duration,
        )

        return status
