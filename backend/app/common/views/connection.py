from rest_framework.parsers import JSONParser

from common.base.base_api_view import BaseAPIView, ResponseStatus
from common.serializers.connection import ConnectionSerializer
from common.models.connection import Connection


class ConnectionView(BaseAPIView):
    def post_request(self, request, *args, **kwargs):
        """
        Handles the creation of a new connection.
        """
        data = JSONParser().parse(request)
        data["user"] = request.user.id
        serializer = ConnectionSerializer(data=data)

        if serializer.is_valid():
            conn_type = serializer.validated_data["connection_type"]
            if Connection.objects.filter(
                user=request.user, connection_type=conn_type
            ).exists():
                return ResponseStatus.CONFLICT, {"errors": "Connection already exists."}

            serializer.save()
            return ResponseStatus.CREATED, {"content": serializer.data}
        return ResponseStatus.BAD_REQUEST, {"errors": serializer.errors}

    def put_request(self, request, *args, **kwargs):
        data = JSONParser().parse(request)
        connection = Connection.objects.filter(
            connection_type=data.get("connection_type"),
            api_key=data.get("api_key"),
            user=request.user,
        ).first()
        if not connection:
            return ResponseStatus.NOT_FOUND, {"errors": "Connection not found."}

        serializer = ConnectionSerializer(connection, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return ResponseStatus.ACCEPTED, serializer.data
        return ResponseStatus.BAD_REQUEST, {"errors": serializer.errors}
