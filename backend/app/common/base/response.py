import enum
from django.http import JsonResponse
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework import status


class ResponseStatus(enum.Enum):
    NOT_FOUND = 404
    BAD_REQUEST = 400
    INTERNAL_SERVER_ERROR = 500
    SUCCESS = 200
    CREATED = 201
    ACCEPTED = 202
    CONFLICT = 409
    UNAUTHORIZED = 401


def code_to_status(code):
    code_to_status_map = {
        200: ResponseStatus.SUCCESS,
        201: ResponseStatus.CREATED,
        400: ResponseStatus.BAD_REQUEST,
        404: ResponseStatus.NOT_FOUND,
        409: ResponseStatus.CONFLICT,
        401: ResponseStatus.UNAUTHORIZED,
        500: ResponseStatus.INTERNAL_SERVER_ERROR,
    }
    return code_to_status_map[code]


def get_status_to_response(response_status, content, duration, cookies=None):
    if response_status == ResponseStatus.SUCCESS:
        return SuccessResponse(
            status_message=response_status.name,
            content=content,
            duration=duration,
            cookies=cookies or [],
        )
    elif response_status == ResponseStatus.CREATED:
        return SuccessResponse(
            status_message=response_status.name,
            content=content,
            duration=duration,
        )
    elif response_status == ResponseStatus.ACCEPTED:
        return SuccessResponse(
            status_message=response_status.name,
            content=content,
            duration=duration,
        )
    elif response_status == ResponseStatus.BAD_REQUEST:
        return ErrorResponse(
            error_message=content,
            status=status.HTTP_400_BAD_REQUEST,
            duration=duration,
        )
    elif response_status == ResponseStatus.INTERNAL_SERVER_ERROR:
        return ErrorResponse(
            error_message=content,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            duration=duration,
        )
    elif response_status == ResponseStatus.NOT_FOUND:
        return ErrorResponse(
            error_message=content,
            status=status.HTTP_404_NOT_FOUND,
            duration=duration,
        )
    elif response_status == ResponseStatus.CONFLICT:
        return ErrorResponse(
            error_message=content,
            status=status.HTTP_409_CONFLICT,
            duration=duration,
        )
    elif response_status == ResponseStatus.UNAUTHORIZED:
        return ErrorResponse(
            error_message=content,
            status=status.HTTP_401_UNAUTHORIZED,
            duration=duration,
        )
    else:
        return ErrorResponse(
            error_message=content,
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            duration=duration,
        )


class SuccessResponse(JsonResponse):
    def __init__(
        self,
        status_message=None,
        status=HTTP_200_OK,
        content=None,
        duration=None,
        cookies=None,
        *args,
        **kwargs,
    ):
        data = {
            "status": status_message,
            "content": content,
            "duration": f"{duration} ms",
        }
        super().__init__(data=data, status=status, *args, **kwargs)
        for cookie in cookies or []:
            if cookie["action"] == "set":
                self.set_cookie(
                    key=cookie["key"],
                    value=cookie["value"],
                    expires=cookie.get("expires", None),
                    secure=cookie.get("secure", False),
                    httponly=cookie.get("httponly", True),
                    samesite=cookie.get("samesite", "Lax"),
                )
            elif cookie["action"] == "delete":
                self.delete_cookie(cookie["key"])


class ErrorResponse(JsonResponse):
    def __init__(
        self,
        error_message,
        status=HTTP_400_BAD_REQUEST,
        duration=None,
        *args,
        **kwargs,
    ):
        data = {
            "status": "error",
            "content": error_message,
            "duration": f"{duration} ms",
        }
        super().__init__(data=data, status=status, *args, **kwargs)
