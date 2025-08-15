from rest_framework import serializers


__all__ = ["PkListSerializer"]


class PkListSerializer(serializers.Serializer):
    pks = serializers.ListField(child=serializers.IntegerField())
