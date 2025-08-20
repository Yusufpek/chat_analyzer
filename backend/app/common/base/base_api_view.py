from datetime import datetime
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .custom_auth import CustomAuthentication

from .response import ResponseStatus, get_status_to_response, code_to_status


class BaseAPIView(generics.GenericAPIView):
    authentication_classes = [CustomAuthentication]
    permission_classes = [IsAuthenticated]

    def get_request(self, request) -> dict:
        return ResponseStatus.SUCCESS, {"message": "Request processed successfully"}

    def post_request(self, request, *args, **kwargs) -> dict:
        return ResponseStatus.CREATED, {"message": "Resource created successfully"}

    def put_request(self, request, *args, **kwargs) -> dict:
        return ResponseStatus.ACCEPTED, {"message": "Resource updated successfully"}

    def get(self, request, *args, **kwargs):
        start = datetime.now()
        response_status, content = self.get_request(request, *args, **kwargs)
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
    def get_request(self, request) -> dict:
        return ResponseStatus.SUCCESS, {"message": "List retrieved successfully"}

    def get(self, request, *args, **kwargs):
        start = datetime.now()
        response = self.list(request, *args, **kwargs)
        print(response)
        duration = (datetime.now() - start).total_seconds() * 1000
        print(f"Response time: {duration} ms")
        status = get_status_to_response(
            code_to_status(response.status_code),
            response.data,
            duration,
        )
        print(status)
        return status
